// ============================================
// VOICE COMMANDS - v14.0
// SINHRONIZACIJA JEZIKA + STANJE PO SKLADIŠTU + NAZAD/EXIT POPRAVLJENI
// ============================================

var recognition = null;
var micActive = false;
var activeBuffer = '';
var isProcessingCommand = false;

let END_AKTIVAN = false;
let isVoiceInput = false;
let micRestartTimer = null;
let isRestarting = false;
let micPermissionGranted = false;
let noSpeechTimer = null;

let voiceBuffer = '';
let lastProcessedResultIndex = 0;
let micWatchdogTimer = null;
let autoSaveTimer = null;
const AUTO_SAVE_SILENCE_MS = 8000;
let incompleteAutoSaveSkips = 0;
const MAX_INCOMPLETE_SKIPS = 2;
let voiceModeEverUsed = false;
let dataEntryScreenObserver = null;

// ============================================
// 0. SINHRONIZACIJA JEZIKA
// ============================================
// script1b.js postavlja window.currentLang i localStorage.appLanguage.
// Ovde uvek čitamo iz oba izvora da bismo bili sigurni da je jezik tačan.

if (typeof window.currentLang === 'undefined' || !window.currentLang) {
    window.currentLang = localStorage.getItem('appLanguage') || 'sr';
}
console.log('🌐 voiceCommands inicijalni jezik:', window.currentLang);

// Slušaj promene localStorage iz drugih tabova/iframe-ova
window.addEventListener('storage', function(e) {
    if (e.key === 'appLanguage' && e.newValue) {
        window.currentLang = e.newValue;
        console.log('🌐 voiceCommands: jezik promenjen na', e.newValue);
    }
});

// GLOBALNA FUNKCIJA - script1b.js je poziva kad korisnik izabere jezik
window.setVoiceLanguage = function(langCode) {
    if (!langCode) return;
    window.currentLang = langCode;
    localStorage.setItem('appLanguage', langCode);
    console.log('🌐 voiceCommands: jezik postavljen na', langCode);

    // Ako mikrofon trenutno radi, restartuj ga sa novim jezikom
    if (window.isVoiceModeActive && recognition) {
        try { recognition.stop(); } catch(e) {}
        setTimeout(function() {
            if (window.isVoiceModeActive) startVoiceRecognition();
        }, 300);
    }
};

// ============================================
// 1. POMOĆNE FUNKCIJE
// ============================================

function showVoiceStatus(text, color) {
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = text;
        if (color) statusEl.style.color = color;
    }
    console.log('[VOICE]', text);
}

function requestMicrophonePermission() {
    if (micPermissionGranted) {
        return Promise.resolve(true);
    }
    return new Promise((resolve, reject) => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            reject('Browser ne podržava pristup mikrofonu');
            return;
        }
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                stream.getTracks().forEach(track => track.stop());
                micPermissionGranted = true;
                console.log('✅ Dozvola za mikrofon ODOBRENA!');
                resolve(true);
            })
            .catch(function(err) {
                micPermissionGranted = false;
                console.error('❌ Dozvola za mikrofon ODBIJENA:', err);
                reject(err);
            });
    });
}

// ============================================
// 2. REČNICI (PO JEZIKU)
// ============================================

const NUMBER_WORDS_BY_LANG = {
    sr: {
        'nula': '0', 'jedan': '1', 'jedna': '1', 'jedno': '1',
        'dva': '2', 'dve': '2', 'tri': '3', 'četiri': '4', 'cetiri': '4',
        'pet': '5', 'šest': '6', 'sest': '6', 'sedam': '7', 'osam': '8',
        'devet': '9', 'deset': '10', 'jedanaest': '11', 'dvanaest': '12',
        'trinaest': '13', 'četrnaest': '14', 'cetrnaest': '14', 'petnaest': '15',
        'šesnaest': '16', 'sesnaest': '16', 'sedamnaest': '17', 'osamnaest': '18',
        'devetnaest': '19', 'dvadeset': '20', 'trideset': '30', 'četrdeset': '40',
        'cetrdeset': '40', 'pedeset': '50', 'šezdeset': '60', 'sezdeset': '60',
        'sedamdeset': '70', 'osamdeset': '80', 'devedeset': '90', 'sto': '100'
    },
    en: {
        'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
        'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
        'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13',
        'fourteen': '14', 'fifteen': '15', 'sixteen': '16', 'seventeen': '17',
        'eighteen': '18', 'nineteen': '19', 'twenty': '20', 'thirty': '30',
        'forty': '40', 'fifty': '50', 'sixty': '60', 'seventy': '70',
        'eighty': '80', 'ninety': '90', 'hundred': '100'
    },
    de: {
        'null': '0', 'eins': '1', 'ein': '1', 'eine': '1', 'zwei': '2', 'drei': '3',
        'vier': '4', 'fünf': '5', 'funf': '5', 'sechs': '6', 'sieben': '7',
        'acht': '8', 'neun': '9', 'zehn': '10', 'elf': '11', 'zwölf': '12',
        'zwolf': '12', 'dreizehn': '13', 'vierzehn': '14', 'fünfzehn': '15',
        'funfzehn': '15', 'sechzehn': '16', 'siebzehn': '17', 'achtzehn': '18',
        'neunzehn': '19', 'zwanzig': '20', 'dreißig': '30', 'dreissig': '30',
        'vierzig': '40', 'fünfzig': '50', 'funfzig': '50', 'sechzig': '60',
        'siebzig': '70', 'achtzig': '80', 'neunzig': '90', 'hundert': '100'
    },
    hu: {
        'nulla': '0', 'egy': '1', 'kettő': '2', 'ketto': '2', 'három': '3',
        'harom': '3', 'négy': '4', 'negy': '4', 'öt': '5', 'ot': '5', 'hat': '6',
        'hét': '7', 'het': '7', 'nyolc': '8', 'kilenc': '9', 'tíz': '10', 'tiz': '10',
        'tizenegy': '11', 'tizenkettő': '12', 'tizenharom': '13', 'tizennégy': '14',
        'tizenöt': '15', 'tizenhat': '16', 'tizenhét': '17', 'tizennyolc': '18',
        'tizenkilenc': '19', 'húsz': '20', 'husz': '20', 'harminc': '30', 'negyven': '40',
        'ötven': '50', 'otven': '50', 'hatvan': '60', 'hetven': '70', 'nyolcvan': '80',
        'kilencven': '90', 'száz': '100', 'szaz': '100'
    },
    uk: {
        'нуль': '0', 'один': '1', 'одна': '1', 'два': '2', 'дві': '2', 'три': '3',
        'чотири': '4', 'п\'ять': '5', 'пять': '5', 'шість': '6', 'шiсть': '6',
        'сім': '7', 'сiм': '7', 'вісім': '8', 'вiсiм': '8', 'дев\'ять': '9',
        'девять': '9', 'десять': '10', 'одинадцять': '11', 'дванадцять': '12',
        'двадцять': '20', 'тридцять': '30', 'сорок': '40', 'п\'ятдесят': '50',
        'шістдесят': '60', 'сто': '100'
    },
    ru: {
        'ноль': '0', 'один': '1', 'одна': '1', 'два': '2', 'две': '2', 'три': '3',
        'четыре': '4', 'пять': '5', 'шесть': '6', 'семь': '7', 'восемь': '8',
        'девять': '9', 'десять': '10', 'одиннадцать': '11', 'двенадцать': '12',
        'тринадцать': '13', 'четырнадцать': '14', 'пятнадцать': '15',
        'двадцать': '20', 'тридцать': '30', 'сорок': '40', 'пятьдесят': '50',
        'шестьдесят': '60', 'сто': '100'
    },
    zh: {
        '零': '0', '一': '1', '二': '2', '两': '2', '三': '3', '四': '4', '五': '5',
        '六': '6', '七': '7', '八': '8', '九': '9', '十': '10', '十一': '11',
        '十二': '12', '二十': '20', '三十': '30', '四十': '40', '五十': '50', '百': '100'
    },
    es: {
        'cero': '0', 'uno': '1', 'una': '1', 'dos': '2', 'tres': '3', 'cuatro': '4',
        'cinco': '5', 'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9',
        'diez': '10', 'once': '11', 'doce': '12', 'trece': '13', 'catorce': '14',
        'quince': '15', 'veinte': '20', 'treinta': '30', 'cuarenta': '40',
        'cincuenta': '50', 'sesenta': '60', 'cien': '100'
    },
    pt: {
        'zero': '0', 'um': '1', 'uma': '1', 'dois': '2', 'duas': '2', 'três': '3',
        'tres': '3', 'quatro': '4', 'cinco': '5', 'seis': '6', 'sete': '7',
        'oito': '8', 'nove': '9', 'dez': '10', 'onze': '11', 'doze': '12',
        'treze': '13', 'catorze': '14', 'quinze': '15', 'vinte': '20',
        'trinta': '30', 'quarenta': '40', 'cinquenta': '50', 'cem': '100'
    },
    fr: {
        'zéro': '0', 'zero': '0', 'un': '1', 'une': '1', 'deux': '2', 'trois': '3',
        'quatre': '4', 'cinq': '5', 'six': '6', 'sept': '7', 'huit': '8',
        'neuf': '9', 'dix': '10', 'onze': '11', 'douze': '12', 'treize': '13',
        'quatorze': '14', 'quinze': '15', 'vingt': '20', 'trente': '30',
        'quarante': '40', 'cinquante': '50', 'cent': '100'
    }
};

function getLangDict(dictByLang) {
    return dictByLang[window.currentLang] || dictByLang.sr;
}

function getNumber(word) {
    const w = word.toLowerCase().trim();
    const dict = getLangDict(NUMBER_WORDS_BY_LANG);
    if (dict[w] !== undefined) return dict[w];
    if (/^\d+(?:[.,]\d+)?$/.test(w)) return w.replace(',', '.');
    return null;
}

const UNIT_MAP_BY_LANG = {
    sr: {
        'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg', 'kilogrami': 'kg',
        'gram': 'g', 'grama': 'g', 'grami': 'g', 'g': 'g',
        'litar': 'l', 'litara': 'l', 'litri': 'l', 'l': 'l',
        'komad': 'kom', 'komada': 'kom', 'kom': 'kom', 'komadi': 'kom',
        'paket': 'pak', 'paketa': 'pak', 'pak': 'pak', 'paketi': 'pak'
    },
    en: {
        'kilogram': 'kg', 'kilograms': 'kg', 'kilo': 'kg', 'kg': 'kg',
        'gram': 'g', 'grams': 'g', 'g': 'g',
        'liter': 'l', 'liters': 'l', 'litre': 'l', 'litres': 'l', 'l': 'l',
        'piece': 'pcs', 'pieces': 'pcs', 'pcs': 'pcs',
        'pack': 'pak', 'packs': 'pak', 'package': 'pak'
    },
    de: {
        'kilogramm': 'kg', 'kilo': 'kg', 'kg': 'kg',
        'gramm': 'g', 'g': 'g',
        'liter': 'l', 'l': 'l',
        'stück': 'stk', 'stuck': 'stk', 'stk': 'stk',
        'paket': 'pak', 'pakete': 'pak'
    },
    hu: {
        'kilogramm': 'kg', 'kiló': 'kg', 'kilo': 'kg', 'kg': 'kg',
        'gramm': 'g', 'g': 'g',
        'liter': 'l', 'l': 'l',
        'darab': 'db', 'db': 'db',
        'csomag': 'pak'
    },
    uk: {
        'кілограм': 'kg', 'кг': 'kg',
        'грам': 'g', 'г': 'g',
        'літр': 'l', 'л': 'l',
        'штука': 'шт', 'шт': 'шт',
        'пачка': 'pak', 'упаковка': 'pak'
    },
    ru: {
        'килограмм': 'kg', 'кг': 'kg',
        'грамм': 'g', 'г': 'g',
        'литр': 'l', 'л': 'l',
        'штука': 'шт', 'шт': 'шт',
        'пачка': 'pak', 'упаковка': 'pak'
    },
    zh: {
        '公斤': 'kg', '千克': 'kg',
        '克': 'g',
        '升': 'l',
        '个': 'pcs', '件': 'pcs',
        '包': 'pak'
    },
    es: {
        'kilogramo': 'kg', 'kilo': 'kg', 'kg': 'kg',
        'gramo': 'g', 'gramos': 'g', 'g': 'g',
        'litro': 'l', 'litros': 'l', 'l': 'l',
        'pieza': 'pcs', 'piezas': 'pcs', 'unidad': 'pcs',
        'paquete': 'pak'
    },
    pt: {
        'quilograma': 'kg', 'quilo': 'kg', 'kg': 'kg',
        'grama': 'g', 'gramas': 'g', 'g': 'g',
        'litro': 'l', 'litros': 'l', 'l': 'l',
        'peça': 'pcs', 'peca': 'pcs', 'unidade': 'pcs',
        'pacote': 'pak'
    },
    fr: {
        'kilogramme': 'kg', 'kilo': 'kg', 'kg': 'kg',
        'gramme': 'g', 'grammes': 'g', 'g': 'g',
        'litre': 'l', 'litres': 'l', 'l': 'l',
        'pièce': 'pcs', 'piece': 'pcs', 'unité': 'pcs',
        'paquet': 'pak'
    }
};

const STORAGE_MAP_BY_LANG = {
    sr: {
        'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
        'zamrzivač 1': 'Zamrzivač 1', 'zamrzivac 1': 'Zamrzivač 1',
        'zamrzivač 2': 'Zamrzivač 2', 'zamrzivac 2': 'Zamrzivač 2',
        'zamrzivač 3': 'Zamrzivač 3', 'zamrzivac 3': 'Zamrzivač 3',
        'frižider': 'Frižider', 'frizider': 'Frižider',
        'ostava': 'Ostava', 'špajz': 'Ostava'
    },
    en: {
        'freezer': 'Zamrzivač 1', 'freezer 1': 'Zamrzivač 1',
        'freezer 2': 'Zamrzivač 2', 'freezer 3': 'Zamrzivač 3',
        'fridge': 'Frižider', 'refrigerator': 'Frižider',
        'pantry': 'Ostava', 'cellar': 'Ostava'
    },
    de: {
        'gefrierschrank': 'Zamrzivač 1', 'gefrierschrank 1': 'Zamrzivač 1',
        'gefrierschrank 2': 'Zamrzivač 2', 'gefrierschrank 3': 'Zamrzivač 3',
        'kühlschrank': 'Frižider', 'kuhlschrank': 'Frižider',
        'speisekammer': 'Ostava', 'vorratskammer': 'Ostava'
    },
    hu: {
        'fagyasztó': 'Zamrzivač 1', 'fagyaszto': 'Zamrzivač 1',
        'fagyasztó 1': 'Zamrzivač 1', 'fagyasztó 2': 'Zamrzivač 2',
        'fagyasztó 3': 'Zamrzivač 3',
        'hűtő': 'Frižider', 'huto': 'Frižider', 'hűtőszekrény': 'Frižider',
        'kamra': 'Ostava', 'éléskamra': 'Ostava'
    },
    uk: {
        'морозилка': 'Zamrzivač 1', 'морозильник': 'Zamrzivač 1',
        'холодильник': 'Frižider',
        'комора': 'Ostava'
    },
    ru: {
        'морозилка': 'Zamrzivač 1', 'морозильник': 'Zamrzivač 1',
        'холодильник': 'Frižider',
        'кладовка': 'Ostava', 'кладовая': 'Ostava'
    },
    zh: {
        '冷冻室': 'Zamrzivač 1', '冰柜': 'Zamrzivač 1',
        '冰箱': 'Frižider',
        '储藏室': 'Ostava'
    },
    es: {
        'congelador': 'Zamrzivač 1', 'congelador 1': 'Zamrzivač 1',
        'congelador 2': 'Zamrzivač 2', 'congelador 3': 'Zamrzivač 3',
        'nevera': 'Frižider', 'refrigerador': 'Frižider',
        'despensa': 'Ostava'
    },
    pt: {
        'congelador': 'Zamrzivač 1', 'congelador 1': 'Zamrzivač 1',
        'congelador 2': 'Zamrzivač 2', 'congelador 3': 'Zamrzivač 3',
        'geladeira': 'Frižider', 'frigorífico': 'Frižider', 'frigorifico': 'Frižider',
        'despensa': 'Ostava'
    },
    fr: {
        'congélateur': 'Zamrzivač 1', 'congelateur': 'Zamrzivač 1',
        'réfrigérateur': 'Frižider', 'refrigerateur': 'Frižider', 'frigo': 'Frižider',
        'garde-manger': 'Ostava', 'cellier': 'Ostava'
    }
};

function getUnit(word) {
    const dict = getLangDict(UNIT_MAP_BY_LANG);
    return dict[word.toLowerCase()] || null;
}

function getStorage(word) {
    const w = word.toLowerCase();
    const dict = getLangDict(STORAGE_MAP_BY_LANG);
    for (let key in dict) {
        if (w.includes(key) || key.includes(w)) return dict[key];
    }
    return null;
}

// 🔥 KLJUČNE REČI KOMANDI PO JEZIKU
const COMMAND_WORDS = {
    sr: {
        start: ['start\\w*', 'unos', 'unesi', 'pokreni', 'zapocni', 'počni', 'novi', 'novo', 'enter', 'add'],
        plus: ['plus', 'dodaj', 'sačuvaj', 'sacuvaj'],
        obrisi: ['obriši', 'obrisi', 'izbriši', 'izbrisi', 'otkaži', 'otkazi'],
        end: ['end\\w*', 'kraj\\w*', 'gotov\\w*', 'završ\\w*', 'zavrs\\w*'],
        zalihe: ['zalih\\w*', 'inventar\\w*', 'inventory'],
        spisak: ['spisak', 'potrebe', 'lista', 'shopping'],
        nazad: ['nazad', 'back', 'vrati'],
        exit: ['exit', 'izlaz', 'izadji', 'zatvori'],
        stanje: ['stanj\\w*']
    },
    en: {
        start: ['start', 'new', 'begin', 'enter', 'add'],
        plus: ['plus', 'next', 'save'],
        obrisi: ['delete', 'cancel', 'clear', 'remove'],
        end: ['end', 'done', 'finish'],
        zalihe: ['inventory', 'stock', 'storage'],
        spisak: ['shopping list', 'list', 'needs'],
        nazad: ['back'],
        exit: ['exit', 'close', 'quit'],
        stanje: ['status', 'amount', 'how much']
    },
    de: {
        start: ['start', 'neu', 'beginn\\w*', 'hinzufügen', 'hinzufugen', 'eingabe'],
        plus: ['plus', 'weiter', 'speichern'],
        obrisi: ['löschen', 'loschen', 'abbrechen', 'entfernen'],
        end: ['ende', 'fertig', 'beendet'],
        zalihe: ['bestand', 'vorrat', 'lager'],
        spisak: ['einkaufsliste', 'liste', 'bedarf'],
        nazad: ['zurück', 'zuruck'],
        exit: ['beenden', 'schließen', 'schliessen', 'verlassen'],
        stanje: ['status', 'bestand\\w*', 'wie ?viel']
    },
    hu: {
        start: ['kezdés', 'kezdes', 'új', 'uj', 'kezdd', 'hozzáad', 'hozzaad'],
        plus: ['plusz', 'tovább', 'tovabb', 'mentés', 'mentes'],
        obrisi: ['töröl\\w*', 'torol\\w*', 'mégse', 'megse'],
        end: ['vége', 'vege', 'kész', 'kesz', 'befejez\\w*'],
        zalihe: ['készlet', 'keszlet', 'raktár', 'raktar'],
        spisak: ['bevásárlólista', 'bevasarlolista', 'lista', 'szükséglet', 'szukseglet'],
        nazad: ['vissza'],
        exit: ['kilépés', 'kilepes', 'bezár', 'bezar'],
        stanje: ['állapot', 'allapot', 'mennyi']
    },
    uk: {
        start: ['старт', 'почати', 'новий', 'додати'],
        plus: ['плюс', 'далі', 'дали', 'зберегти'],
        obrisi: ['видалити', 'скасувати', 'очистити'],
        end: ['кінець', 'кинець', 'готово', 'завершити'],
        zalihe: ['запаси', 'склад', 'інвентар'],
        spisak: ['список', 'покупки', 'потреби'],
        nazad: ['назад'],
        exit: ['вихід', 'вихiд', 'закрити'],
        stanje: ['стан', 'скільки', 'скiльки']
    },
    ru: {
        start: ['старт', 'начать', 'новый', 'добавить'],
        plus: ['плюс', 'далее', 'сохранить'],
        obrisi: ['удалить', 'отменить', 'очистить'],
        end: ['конец', 'готово', 'завершить'],
        zalihe: ['запасы', 'склад', 'инвентарь'],
        spisak: ['список', 'покупки', 'потребности'],
        nazad: ['назад'],
        exit: ['выход', 'закрыть'],
        stanje: ['статус', 'состояние', 'сколько']
    },
    zh: {
        start: ['开始', '新建', '添加'],
        plus: ['加', '下一个', '保存'],
        obrisi: ['删除', '取消', '清除'],
        end: ['结束', '完成'],
        zalihe: ['库存', '仓库'],
        spisak: ['购物清单', '清单', '需求'],
        nazad: ['返回', '后退'],
        exit: ['退出', '关闭'],
        stanje: ['状态', '多少']
    },
    es: {
        start: ['comenzar', 'empezar', 'nuevo', 'agregar', 'añadir'],
        plus: ['más', 'mas', 'siguiente', 'guardar'],
        obrisi: ['borrar', 'eliminar', 'cancelar'],
        end: ['fin', 'terminar', 'listo'],
        zalihe: ['inventario', 'existencias', 'almacén', 'almacen'],
        spisak: ['lista de compras', 'lista', 'necesidades'],
        nazad: ['atrás', 'atras', 'volver'],
        exit: ['salir', 'cerrar'],
        stanje: ['estado', 'cuánto', 'cuanto']
    },
    pt: {
        start: ['começar', 'comecar', 'iniciar', 'novo', 'adicionar'],
        plus: ['mais', 'próximo', 'proximo', 'salvar', 'guardar'],
        obrisi: ['apagar', 'excluir', 'cancelar'],
        end: ['fim', 'terminar', 'pronto'],
        zalihe: ['inventário', 'inventario', 'estoque', 'armazém', 'armazem'],
        spisak: ['lista de compras', 'lista', 'necessidades'],
        nazad: ['voltar', 'atrás', 'atras'],
        exit: ['sair', 'fechar'],
        stanje: ['estado', 'quanto']
    },
    fr: {
        start: ['commencer', 'démarrer', 'demarrer', 'nouveau', 'ajouter'],
        plus: ['plus', 'suivant', 'enregistrer'],
        obrisi: ['supprimer', 'annuler', 'effacer'],
        end: ['fin', 'terminé', 'termine'],
        zalihe: ['inventaire', 'stock', 'réserve', 'reserve'],
        spisak: ['liste de courses', 'liste', 'besoins'],
        nazad: ['retour', 'arrière', 'arriere'],
        exit: ['quitter', 'fermer', 'sortir'],
        stanje: ['statut', 'état', 'etat', 'combien']
    }
};

const NO_WORD_BOUNDARY_LANGS = ['zh'];

function cmdRx(name) {
    const words = getLangDict(COMMAND_WORDS)[name];
    const alternation = words.join('|');
    if (NO_WORD_BOUNDARY_LANGS.includes(window.currentLang)) {
        return new RegExp('(' + alternation + ')', 'i');
    }
    return new RegExp('\\b(' + alternation + ')\\b', 'i');
}

function splitCommandsRegex() {
    const dict = getLangDict(COMMAND_WORDS);
    const words = [...dict.plus, ...dict.obrisi, ...dict.end];
    const alternation = words.join('|');
    if (NO_WORD_BOUNDARY_LANGS.includes(window.currentLang)) {
        return new RegExp('(' + alternation + ')', 'i');
    }
    return new RegExp('\\b(' + alternation + ')\\b', 'i');
}

function normalizujNaziv(str) {
    return (str || '').toLowerCase().replace(/(.)\1+/g, '$1').trim();
}

// ============================================
// 3. PARSER
// ============================================

function parseVoiceDataEntry(command) {
    console.log('🔍 PARSIRAM:', command);

    let text = command
        .replace(/^(unos|start|dodaj|novi|novo|add|unesi)\s*/i, '')
        .replace(/\b(plus|end|kraj|gotovo|zavrsi)\b/gi, '')
        .trim();

    let words = text.split(/\s+/).filter(Boolean);
    console.log('📝 REČI:', words);

    let result = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '6',
        storage: 'Zamrzivač 1'
    };

    let foundUnit = null;
    let unitIndex = -1;
    let unitWords = ['kilogram', 'kilograma', 'kg', 'kilogrami',
                     'gram', 'grama', 'grami', 'g',
                     'litar', 'litara', 'litri', 'l',
                     'komad', 'komada', 'kom', 'komadi',
                     'paket', 'paketa', 'pak', 'paketi'];

    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        if (unitWords.includes(w)) {
            foundUnit = getUnit(w);
            unitIndex = i;
            console.log('📏 Jedinica:', foundUnit, 'na poziciji', i);
            break;
        }
    }

    let foundStorage = null;
    let storageIndex = -1;
    let storageWords = ['zamrzivač', 'zamrzivac', 'frižider', 'frizider', 'ostava', 'špajz'];

    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        for (let sw of storageWords) {
            if (w.includes(sw) || sw.includes(w)) {
                foundStorage = getStorage(sw);
                storageIndex = i;
                console.log('🏠 Skladište:', foundStorage, 'na poziciji', i);
                break;
            }
        }
        if (foundStorage) break;
    }

    let nameParts = [];
    let firstNumberIndex = words.length;

    for (let i = 0; i < words.length; i++) {
        if (getNumber(words[i]) !== null) {
            firstNumberIndex = i;
            break;
        }
    }

    for (let i = 0; i < firstNumberIndex; i++) {
        let w = words[i].toLowerCase();
        if (!unitWords.includes(w) && !storageWords.some(sw => w.includes(sw) || sw.includes(w))) {
            nameParts.push(words[i]);
        }
    }

    result.product_name = nameParts.join(' ').trim() || 'Proizvod';
    console.log('🏷️ Naziv:', result.product_name);

    let numbers = [];
    for (let i = firstNumberIndex; i < words.length; i++) {
        if
