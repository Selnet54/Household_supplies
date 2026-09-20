// ============================================
// VOICE COMMANDS - v13.5 (AUTO-SAVE NE PUCA USRED REČENICE)
// START/PLUS/OBRIŠI/END + BUFFER + ISPRAVNA DODELA BROJEVA
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
let lastProcessedResultIndex = 0; // 🔥 sopstveno praćenje obrađenih rezultata (Android event.resultIndex je nepouzdan)
let micWatchdogTimer = null; // 🔥 čuvar koji prinudno oživljava mikrofon ako se zaglavi
let autoSaveTimer = null; // 🔥 automatsko čuvanje bafera ako "Plus"/"Kraj" ne bude čuveno
const AUTO_SAVE_SILENCE_MS = 8000; // koliko tišine (ms) čekamo pre automatskog čuvanja
let incompleteAutoSaveSkips = 0; // 🔥 koliko puta smo odložili čuvanje jer je naziv bio "Proizvod"
const MAX_INCOMPLETE_SKIPS = 2; // posle ovoliko odlaganja, ipak sačuvaj (bolje nešto nego ništa)
let voiceModeEverUsed = false; // 🔥 da li je mikrofon bar jednom uspešno pokrenut (za auto-reaktivaciju)
let dataEntryScreenObserver = null; // 🔥 prati kad se ekran za unos ponovo prikaže

if (typeof window.currentLang === 'undefined') {
    window.currentLang = 'sr';
}

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
// 2. REČNICI (PO JEZIKU) - sr je fallback za sve
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
        'nulla': '0', 'egy': '1', 'kettő': '2', 'ketto': '2', 'két': '2', 'három': '3',
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
        'frižider': 'Frižider', 'frizider': 'Frižider',
        'ostava': 'Ostava', 'špajz': 'Ostava'
    },
    en: {
        'freezer': 'Zamrzivač 1',
        'fridge': 'Frižider', 'refrigerator': 'Frižider',
        'pantry': 'Ostava', 'cellar': 'Ostava'
    },
    de: {
        'gefrierschrank': 'Zamrzivač 1',
        'kühlschrank': 'Frižider', 'kuhlschrank': 'Frižider',
        'speisekammer': 'Ostava', 'vorratskammer': 'Ostava'
    },
    hu: {
        'mélyhűtő': 'Zamrzivač 1', 'melyhuto': 'Zamrzivač 1',
        'fagyasztó': 'Zamrzivač 1', 'fagyaszto': 'Zamrzivač 1',
        'hűtőszekrény': 'Frižider', 'hutoszekreny': 'Frižider',
        'hűtő': 'Frižider', 'huto': 'Frižider',
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
        'congelador': 'Zamrzivač 1',
        'nevera': 'Frižider', 'refrigerador': 'Frižider',
        'despensa': 'Ostava'
    },
    pt: {
        'congelador': 'Zamrzivač 1',
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
    const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);
    for (let key of sortedKeys) {
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
        end: ['end', 'done', 'finish', 'and'],
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
        start: ['kezdés', 'kezdes', 'új', 'uj', 'kezdd', 'hozzáad', 'hozzaad', 'adatbevitel', 'indítás', 'inditas', 'indít', 'indit'],
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

// 🔥 CJK jezici (kineski...) nemaju razmak između reči - \b granica ne radi za njih
const NO_WORD_BOUNDARY_LANGS = ['zh'];

function cmdRx(name) {
    const words = getLangDict(COMMAND_WORDS)[name];
    const alternation = words.join('|');
    if (NO_WORD_BOUNDARY_LANGS.includes(window.currentLang)) {
        return new RegExp('(' + alternation + ')', 'i');
    }
    return new RegExp('\\b(' + alternation + ')\\b', 'i');
}

// 🔥 Regex za deljenje izgovorene rečenice na segmente (plus/obriši/end izgovoreno u jednom dahu)
function splitCommandsRegex() {
    const dict = getLangDict(COMMAND_WORDS);
    const words = [...dict.plus, ...dict.obrisi, ...dict.end];
    const alternation = words.join('|');
    if (NO_WORD_BOUNDARY_LANGS.includes(window.currentLang)) {
        return new RegExp('(' + alternation + ')', 'i');
    }
    return new RegExp('\\b(' + alternation + ')\\b', 'i');
}

// 🔥 NORMALIZACIJA - uklanja duplirana slova (grill→gril, npr.)
function normalizujNaziv(str) {
    return (str || '').toLowerCase().replace(/(.)\1+/g, '$1').trim();
}

// ============================================
// 3. PARSER - REDOSLED: naziv → komad → količina → jedinica → rok → skladište
// ============================================

function parseVoiceDataEntry(command) {
    console.log('🔍 PARSIRAM:', command);

    const startWords = getLangDict(COMMAND_WORDS).start.map(w => w.replace(/\\w\*/g, ''));
    const stripRx = new RegExp('^(' + startWords.join('|') + ')\\s*', 'i');
    const removeRx = new RegExp('\\b(' + [...getLangDict(COMMAND_WORDS).plus, ...getLangDict(COMMAND_WORDS).end].join('|') + ')\\b', 'gi');

    let text = command
        .replace(stripRx, '')
        .replace(removeRx, '')
        .trim();

    let words = text.split(/\s+/).filter(Boolean);
    console.log('📝 REČI:', words);

    let result = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '6',           // 🔥 DEFAULT 6 (bilo 12)
        storage: 'Zamrzivač 1'
    };

    // 🔥 1. NAĐI JEDINICU (rečnik za trenutni jezik)
    let foundUnit = null;
    let unitIndex = -1;
    let unitWords = Object.keys(getLangDict(UNIT_MAP_BY_LANG));

    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        if (unitWords.includes(w)) {
            foundUnit = getUnit(w);
            unitIndex = i;
            console.log('📏 Jedinica:', foundUnit, 'na poziciji', i);
            break;
        }
    }

    // 🔥 2. NAĐI SKLADIŠTE (rečnik za trenutni jezik)
    let foundStorage = null;
    let storageIndex = -1;
    let storageWords = Object.keys(getLangDict(STORAGE_MAP_BY_LANG)).sort((a, b) => b.length - a.length);

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

    // 🔥 3. NAĐI NAZIV PROIZVODA (reči pre prvog broja)
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

    // 🔥 4. UZMI SVE BROJEVE POSLE NAZIVA (pre skladišta)
    let numbers = [];
    for (let i = firstNumberIndex; i < words.length; i++) {
        if (i === unitIndex) continue;
        if (storageIndex !== -1 && i === storageIndex) continue;
        let num = getNumber(words[i]);
        if (num !== null) {
            numbers.push(num);
        }
    }

    console.log('🔢 Brojevi:', numbers);

    // ============================================
    // 🔥 5. DODELA NA OSNOVU REDOSLEDA - POPRAVLJENO
    // ============================================
    if (foundUnit === 'kg' || foundUnit === 'g' || foundUnit === 'l') {
        if (numbers.length === 1) {
            result.piece = '1';
            result.quantity = numbers[0];
            console.log('📦 1 broj (kg/g/l): quantity =', numbers[0], ', piece = 1, shelf_life = default');
        } else if (numbers.length === 2) {
            result.piece = '1';
            result.quantity = numbers[0];
            result.shelf_life = numbers[1];
            console.log('📦 2 broja (kg/g/l): quantity =', numbers[0], ', shelf_life =', numbers[1], ', piece = 1');
        } else if (numbers.length >= 3) {
            result.piece = numbers[0];
            result.quantity = numbers[1];
            result.shelf_life = numbers[2];
            console.log('📦 3+ broja (kg/g/l): piece =', numbers[0], ', quantity =', numbers[1], ', shelf_life =', numbers[2]);
        }
    } else {
        if (numbers.length === 1) {
            result.piece = numbers[0];
            result.quantity = numbers[0];
            console.log('📦 1 broj (kom/pak): piece = quantity =', numbers[0]);
        } else if (numbers.length >= 2) {
            result.piece = numbers[0];
            result.quantity = numbers[0];
            result.shelf_life = numbers[1];
            console.log('📦 2+ broja (kom/pak): piece = quantity =', numbers[0], ', shelf_life =', numbers[1]);
        }
    }

    if (foundUnit) result.unit = foundUnit;
    if (foundStorage) result.storage = foundStorage;

    console.log('✅ PARSED:', result);
    return result;
}

// ============================================
// 4. POPUNJAVANJE FORME
// ============================================

function prikaziPoljaZaUnos() {
    ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput', 'unitSelect', 'storageSelect'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'block';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
        }
    });
}

function ensureFormVisible() {
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    setTimeout(prikaziPoljaZaUnos, 100);
}

function popuniFormuPodacima(data) {
    console.log('📝 Popunjavam formu:', data);

    const dataEntryScreen = document.getElementById('dataEntryScreen');
    if (!dataEntryScreen || dataEntryScreen.style.display === 'none') {
        if (typeof window.renderDataEntry === 'function') {
            window.renderDataEntry('');
        } else if (typeof renderDataEntry === 'function') {
            renderDataEntry('');
        }
    }

    let attempts = 0;
    const maxAttempts = 3;

    function fillForm() {
        attempts++;
        console.log(`📝 Popunjavanje pokušaj ${attempts}/${maxAttempts}`);

        prikaziPoljaZaUnos();

        const productInput = document.getElementById('productInput');
        const pieceInput = document.getElementById('pieceInput');
        const quantityInput = document.getElementById('quantityInput');
        const shelfLifeInput = document.getElementById('shelfLifeInput');
        const unitSelect = document.getElementById('unitSelect');
        const storageSelect = document.getElementById('storageSelect');

        if (!productInput) {
            if (attempts < maxAttempts) {
                setTimeout(fillForm, 300);
            }
            return;
        }

        productInput.value = data.product_name || '';
        productInput.dispatchEvent(new Event('input', { bubbles: true }));
        productInput.dispatchEvent(new Event('change', { bubbles: true }));

        if (pieceInput) {
            pieceInput.value = data.piece || '1';
            pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
            pieceInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (quantityInput) {
            quantityInput.value = data.quantity || '1';
            quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
            quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (shelfLifeInput) {
            shelfLifeInput.value = data.shelf_life || '6';
            shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
            shelfLifeInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (unitSelect) unitSelect.value = data.unit || 'kom';
        if (storageSelect) storageSelect.value = data.storage || 'Zamrzivač 1';

        if (typeof updateExpiryDate === 'function') {
            try { updateExpiryDate(); } catch(e) {}
        }

        console.log('✅ Forma popunjena:', {
            product: productInput.value,
            piece: pieceInput ? pieceInput.value : '-',
            quantity: quantityInput ? quantityInput.value : '-',
            shelf_life: shelfLifeInput ? shelfLifeInput.value : '-',
            unit: unitSelect ? unitSelect.value : '-',
            storage: storageSelect ? storageSelect.value : '-'
        });

        showVoiceStatus(`✅ Uneto: ${data.product_name} (${data.quantity} ${data.unit})`, '#4CAF50');
    }

    setTimeout(fillForm, 400);
}

// ============================================
// 4b. BRISANJE TRENUTNO DIKTIRANIH PODATAKA (OBRIŠI)
// ============================================

function obrisiTrenutniUnos() {
    console.log('🗑️ Brišem trenutno diktirane podatke');

    cancelAutoSave(); // 🔥 spreči da stari tajmer kasnije sačuva već obrisan bafer
    voiceBuffer = '';

    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const unitSelect = document.getElementById('unitSelect');
    const storageSelect = document.getElementById('storageSelect');

    if (productInput) {
        productInput.value = '';
        productInput.dispatchEvent(new Event('input', { bubbles: true }));
        productInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (pieceInput) {
        pieceInput.value = '1';
        pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
        pieceInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (quantityInput) {
        quantityInput.value = '1';
        quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
        quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (shelfLifeInput) {
        shelfLifeInput.value = '6';
        shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
        shelfLifeInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (unitSelect) unitSelect.value = 'kom';
    if (storageSelect) storageSelect.value = 'Zamrzivač 1';

    if (typeof updateExpiryDate === 'function') {
        try { updateExpiryDate(); } catch(e) {}
    }

    showVoiceStatus('🗑️ Obrisano. Izdiktirajte ponovo.', '#FF9800');
}

// ============================================
// 4c. AUTOMATSKO ČUVANJE BAFERA NA TIŠINU
// ============================================
// Ako se dogodi da "Plus" ili "Kraj" ne budu čuveni (mikrofon interno
// ima kratke "slepe" trenutke tokom continuous prepoznavanja), bafer bi
// se inače beskonačno gomilao sledećim izdiktiranim stavkama, praveći
// besmislene brojeve (npr. 10 komada, pogrešan rok itd.). Ova funkcija
// zakazuje automatsko čuvanje ako prođe  bez ijedne
// nove reči - kao da je korisnik rekao "Plus" sam.

function scheduleAutoSave() {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(function() {
        if (voiceBuffer.trim().length >= 2) {
            const probniParse = parseVoiceDataEntry(voiceBuffer);

            if (probniParse.product_name === 'Proizvod' && incompleteAutoSaveSkips < MAX_INCOMPLETE_SKIPS) {
                incompleteAutoSaveSkips++;
                console.log(`⏱️ AUTO-SAVE preskočen (${incompleteAutoSaveSkips}/${MAX_INCOMPLETE_SKIPS}) - naziv bi bio "Proizvod":`, voiceBuffer);
                showVoiceStatus(`⏳ Čekam nastavak... ("${voiceBuffer}")`, '#FF9800');
                scheduleAutoSave();
                return;
            }

            console.log('⏱️ AUTO-SAVE - "Plus"/"Kraj" nije čuven, čuvam bafer automatski:', voiceBuffer);
            incompleteAutoSaveSkips = 0;
            sacuvajPodatkeBezPopupa(probniParse);
            showVoiceStatus(`⏱️ Automatski sačuvano (tišina): ${probniParse.product_name}`, '#FF9800');
            voiceBuffer = '';
        }
    }, AUTO_SAVE_SILENCE_MS);
}

function cancelAutoSave() {
    if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = null;
    }
    incompleteAutoSaveSkips = 0;
}

// ============================================
// 5. ČUVANJE PODATAKA - BEZ POPUPA
// ============================================

function sacuvajPodatkeBezPopupa(data) {
    console.log('💾 Čuvam podatke (bez popupa):', data);

    isVoiceInput = true;
    window._isVoiceInput = true;

    const originalShowModernAlert = window.showModernAlert;
    window.showModernAlert = function() {
        console.log('⛔ POP-UP ZABRANJEN (voice input)');
        return;
    };

    const originalAlert = window.alert;
    window.alert = function() {
        console.log('⛔ ALERT ZABRANJEN (voice input)');
        return;
    };

    const savedValues = {
        product: data.product_name || '',
        piece: data.piece || '1',
        quantity: data.quantity || '1',
        shelf_life: data.shelf_life || '6',
        unit: data.unit || 'kom',
        storage: data.storage || 'Zamrzivač 1'
    };

    window._keepFormData = true;

    popuniFormuPodacima(data);

    setTimeout(() => {
        let saved = false;

        if (typeof window.saveProduct === 'function') {
            try {
                window.saveProduct();
                saved = true;
                console.log('✅ saveProduct uspešan!');
            } catch(e) {
                console.warn('saveProduct greška:', e);
            }
        }

        if (!saved) {
            try {
                const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
                const newItem = {
                    id: Date.now(),
                    product_name: data.product_name,
                    piece: parseInt(data.piece) || 1,
                    quantity: parseFloat(data.quantity) || 1,
                    unit: data.unit || 'kom',
                    shelf_life_months: parseInt(data.shelf_life) || 6,
                    storage_location: data.storage || 'Zamrzivač 1',
                    entry_date: new Date().toISOString().split('T')[0],
                    isNew: true
                };
                zalihe.push(newItem);
                localStorage.setItem('zalihe', JSON.stringify(zalihe));

                let lastAdded = JSON.parse(localStorage.getItem('lastAddedProducts') || '[]');
                lastAdded.unshift({
                    product_name: data.product_name,
                    entry_date: newItem.entry_date,
                    timestamp: Date.now()
                });
                if (lastAdded.length > 10) lastAdded = lastAdded.slice(0, 10);
                localStorage.setItem('lastAddedProducts', JSON.stringify(lastAdded));

                saved = true;
            } catch(e) {
                console.warn('localStorage greška:', e);
            }
        }

        let retryCount = 0;
        function restoreFormValues() {
            retryCount++;
            console.log(`🔄 Vraćam vrednosti u formu (pokušaj ${retryCount}/3)...`);

            const productInput = document.getElementById('productInput');
            const pieceInput = document.getElementById('pieceInput');
            const quantityInput = document.getElementById('quantityInput');
            const shelfLifeInput = document.getElementById('shelfLifeInput');
            const unitSelect = document.getElementById('unitSelect');
            const storageSelect = document.getElementById('storageSelect');

            if (productInput) {
                productInput.value = savedValues.product;
                productInput.dispatchEvent(new Event('input', { bubbles: true }));
                productInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (pieceInput) {
                pieceInput.value = savedValues.piece;
                pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (quantityInput) {
                quantityInput.value = savedValues.quantity;
                quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (shelfLifeInput) {
                shelfLifeInput.value = savedValues.shelf_life;
                shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (unitSelect) unitSelect.value = savedValues.unit;
            if (storageSelect) storageSelect.value = savedValues.storage;

            if (typeof updateExpiryDate === 'function') {
                try { updateExpiryDate(); } catch(e) {}
            }

            prikaziPoljaZaUnos();

            if ((!productInput || productInput.value === '') && retryCount < 3) {
                setTimeout(restoreFormValues, 300);
            } else {
                console.log('✅ Vrednosti vraćene u formu:', savedValues);
            }
        }

        setTimeout(restoreFormValues, 100);

        setTimeout(() => {
            window.showModernAlert = originalShowModernAlert;
            window.alert = originalAlert;
            isVoiceInput = false;
            window._isVoiceInput = false;
        }, 2000);

        setTimeout(() => {
            window._keepFormData = false;
        }, 15000);

        if (saved) {
            showVoiceStatus(`✅ Sačuvano: ${data.product_name}`, '#4CAF50');

            setTimeout(() => {
                if (typeof prikaziSveUnose === 'function') {
                    try { prikaziSveUnose(); } catch(e) {}
                }
            }, 200);
        } else {
            showVoiceStatus('❌ Greška pri čuvanju!', '#f44336');
        }
    }, 600);
}

// ============================================
// 6. PREPOZNAVANJE GOVORA
// ============================================

// ============================================
// 6b. ČUVAR MIKROFONA (WATCHDOG)
// ============================================
// Ako mikrofon treba da radi (window.isVoiceModeActive === true) ali
// nije aktivan (!micActive) duže od par sekundi, nešto je zaglavljeno
// (npr. isRestarting zastavica ostala na true zbog retkog browser/WebView
// bug-a). Umesto da čekamo da se to samo reši, prinudno resetujemo
// zastavice i ponovo pokrećemo mikrofon. Ovo je poslednja linija odbrane
// koja garantuje da mikrofon nikad ne ostane "mrtav" duže od par sekundi.

function startMicWatchdog() {
    if (micWatchdogTimer) clearInterval(micWatchdogTimer);
    micWatchdogTimer = setInterval(function() {
        if (window.isVoiceModeActive && !micActive) {
            console.warn('🐕 WATCHDOG: mikrofon treba da radi ali je ugašen - prinudni restart!');
            isRestarting = false; // 🔥 oslobađa eventualno zaglavljenu zastavicu
            if (micRestartTimer) clearTimeout(micRestartTimer);
            if (noSpeechTimer) clearTimeout(noSpeechTimer);
            startVoiceRecognition();
        }
    }, 3000); // provera na svake 3 sekunde
}

function stopMicWatchdog() {
    if (micWatchdogTimer) {
        clearInterval(micWatchdogTimer);
        micWatchdogTimer = null;
    }
}

function startVoiceRecognition() {
    console.log('🎤 startVoiceRecognition pozvan!');

    if (isRestarting) return;

    // 🔥 UKLONJENA zastarela blokada za iOS Safari — Safari na iOS/iPadOS
    // podržava webkitSpeechRecognition od verzije 14.5+ (2021), pa je
    // stara provera nepotrebno sprečavala glasovni unos na iPhone/iPad-u.
    // Ako pregledač zaista ne podržava API, to hvata provera ispod
    // (SpeechRecognition === undefined).

    if (recognition) {
        recognition.onend = null;
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    if (micRestartTimer) clearTimeout(micRestartTimer);
    if (noSpeechTimer) clearTimeout(noSpeechTimer);

    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        showVoiceStatus('❌ Mikrofon radi SAMO na HTTPS!', '#f44336');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showVoiceStatus('❌ Pregledač ne podržava Web Speech API.', '#f44336');
        return;
    }

    window.isVoiceModeActive = true;
    isRestarting = true;
    startMicWatchdog(); // 🔥 pokreni čuvara čim glasovni mod postane aktivan

    function beginRecognition() {
        recognition = new SpeechRecognition();

        const speechLangMap = {
            sr: 'sr-RS', en: 'en-US', de: 'de-DE',
            hu: 'hu-HU', uk: 'uk-UA', ru: 'ru-RU',
            es: 'es-ES', fr: 'fr-FR'
        };
        recognition.lang = speechLangMap[currentLang] || 'sr-RS';

        // 🔥 continuous = true — mikrofon ostaje aktivan i sluša više
        // fraza u istoj sesiji, umesto da se gasi/pali (i bipuje) posle
        // svake pojedinačne izgovorene reči/fraze.
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;

        recognition.onstart = function() {
            showVoiceStatus('🎤 Slušam...', '#4CAF50');
            isProcessingCommand = false;
            micActive = true;
            isRestarting = false;
            END_AKTIVAN = false;
            lastProcessedResultIndex = 0; // 🔥 reset brojača za novu sesiju
            voiceModeEverUsed = true; // 🔥 mikrofon je bar jednom uspešno pokrenut u ovoj sesiji stranice
            console.log('✅ Mikrofon aktivan!');
        };

        recognition.onresult = function(event) {
            // 🔥 POPRAVKA DUPLIRANJA/GUBLJENJA TEKSTA:
            // event.resultIndex koji šalje Android Chrome NIJE uvek
            // pouzdan u continuous režimu — zna da prijavi pogrešnu
            // vrednost, što je dovodilo do toga da se isti finalni
            // rezultat obradi više puta (ili da se deo teksta preskoči),
            // truje se voiceBuffer i pravi besmislen upis u polja.
            // Zato sami pratimo koji je indeks poslednji obrađen i
            // NIKAD ne obrađujemo isti finalni rezultat dvaput.

            let interimText = '';

            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];

                if (!result.isFinal) {
                    interimText += result[0].transcript;
                    continue;
                }

                // Ovaj finalni rezultat je već obrađen ranije - preskoči.
                if (i < lastProcessedResultIndex) continue;

                const transcript = result[0].transcript.trim();
                lastProcessedResultIndex = i + 1;

                if (transcript) {
                    console.log('📝 Finalno čujem (indeks ' + i + '):', transcript);
                    showVoiceStatus(`🎤 Čuo: "${transcript}"`, '#4CAF50');
                    processVoiceCommand(transcript);
                }
            }

            if (interimText) {
                showVoiceStatus(`🎤 Slušam: "${interimText}"`, '#FFD700');
                // 🔥 KLJUČNA POPRAVKA: dok engine još uvek "žvaće" privremeni
                // (interim) tekst, to je dokaz da korisnik i dalje govori -
                // pomeri tajmer za auto-čuvanje unapred, da ne bi pukao
                // usred rečenice pre nego što finalna reč uopšte stigne.
                if (voiceBuffer.trim().length >= 2) {
                    scheduleAutoSave();
                }
            }
        };

        recognition.onerror = function(event) {
            console.error('❌ Speech error:', event.error);

            if (event.error === 'aborted') {
                isRestarting = false;
                return;
            }

            if (event.error === 'no-speech') {
                // 🔥 Skraćeno sa 2000ms na 300ms — mikrofon treba da deluje
                // kao da je stalno otvoren dok je aplikacija pokrenuta.
                console.log('🔇 Nema govora, brzi restart...');
                if (noSpeechTimer) clearTimeout(noSpeechTimer);
                noSpeechTimer = setTimeout(() => {
                    if (window.isVoiceModeActive && !micActive && !isRestarting) {
                        startVoiceRecognition();
                    }
                }, 400);
                return;
            }

            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                showVoiceStatus('❌ Pristup mikrofonu je blokiran!', '#f44336');
                window.isVoiceModeActive = false;
                micPermissionGranted = false;
                isRestarting = false;
            } else {
                showVoiceStatus(`❌ Greška: ${event.error}`, '#f44336');
                if (window.isVoiceModeActive && !isRestarting) {
                    // 🔥 Skraćeno sa 1500ms na 300ms iz istog razloga.
                    micRestartTimer = setTimeout(function() {
                        if (window.isVoiceModeActive && !micActive) {
                            startVoiceRecognition();
                        }
                    }, 400);
                }
            }
        };

        recognition.onend = function() {
            console.log('⏹️ Mikrofon zaustavljen');
            micActive = false;
            recognition = null;

            if (window.isVoiceModeActive && !isRestarting) {
                // 🔥 Skraćeno sa 800ms na 150ms — glavni restart koji se
                // dešava kad mobilni pregledač sam prekine continuous
                // sesiju (npr. posle ~60s). Kraća pauza = mikrofon deluje
                // neprekidno otvoren.
                micRestartTimer = setTimeout(function() {
                    if (window.isVoiceModeActive && !micActive && !isRestarting) {
                        startVoiceRecognition();
                    }
                }, 400);
            } else {
                isRestarting = false;
            }
        };

        try {
            recognition.start();
        } catch(e) {
            console.error('❌ Greška pri startovanju:', e);
            isRestarting = false;
        }
    }

    if (micPermissionGranted) {
        beginRecognition();
        return;
    }

    requestMicrophonePermission().then(beginRecognition).catch(err => {
        console.error('❌ Dozvola ODBIJENA:', err);
        window.isVoiceModeActive = false;
        isRestarting = false;
        showVoiceStatus('❌ Dozvolite pristup mikrofonu!', '#f44336');
    });
}

// ============================================
// 6c. AUTOMATSKA REAKTIVACIJA MIKROFONA NA POVRATAK EKRANA ZA UNOS
// ============================================
// Kad se kaže "End", mikrofon se namerno potpuno gasi. Ali ako se
// korisnik POSLE toga vrati na ekran za unos (klikom na "Nazad", ili na
// bilo koji drugi način koji mi ne kontrolišemo iz ovog fajla), mikrofon
// treba sam da se probudi - bez obzira KOJIM putem je korisnik stigao
// nazad na taj ekran. Zato ne kačimo ovo na dugme "Nazad" (koje je u
// drugom fajlu i ne vidimo ga), nego posmatramo sam DOM: čim ekran za
// unos postane vidljiv, a mikrofon treba da radi a ne radi - upali ga.

function posmatrajEkranZaUnos() {
    const screen = document.getElementById('dataEntryScreen');
    if (!screen) {
        // Ekran možda još nije renderovan pri prvom učitavanju - probaj kasnije.
        setTimeout(posmatrajEkranZaUnos, 500);
        return;
    }

    if (dataEntryScreenObserver) return; // već posmatramo, ne dupliraj

    dataEntryScreenObserver = new MutationObserver(function() {
        const jeVidljiv = screen.classList.contains('active') ||
                           screen.style.display === 'flex' ||
                           screen.style.display === 'block';

        if (jeVidljiv && voiceModeEverUsed && !window.isVoiceModeActive && !micActive && !isRestarting) {
            console.log('👁️ Ekran za unos ponovo prikazan - reaktiviram mikrofon');
            setTimeout(function() {
                if (!window.isVoiceModeActive && !micActive && !isRestarting) {
                    startVoiceRecognition();
                }
            }, 700);
        }
    });

    dataEntryScreenObserver.observe(screen, { attributes: true, attributeFilter: ['class', 'style'] });
    console.log('👁️ Posmatranje ekrana za unos aktivno');
}

// ============================================
// 7. ZAUSTAVLJANJE
// ============================================

function stopVoiceRecognition() {
    console.log('🛑 stopVoiceRecognition pozvan');
    window.isVoiceModeActive = false;
    isRestarting = false; 
    stopMicWatchdog(); // 🔥 zaustavi čuvara - ovo je namerno gašenje

    if (micRestartTimer) clearTimeout(micRestartTimer);
    if (noSpeechTimer) clearTimeout(noSpeechTimer);

    if (recognition) {
        recognition.onend = null;
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    micActive = false;
    showVoiceStatus('🎤 Mikrofon zaustavljen', '#999999');
}

// ============================================
// 8. OBRADA GLASOVNIH KOMANDI
// ============================================

function processVoiceCommand(command) {
    console.log('🎤 processVoiceCommand prima:', command);

    if (!command || command.length < 1) return;

    let cmd = command.trim();

    // 🔥 Razdvoji "Start ... Obriši ... Plus ... End" izgovoreno u jednom
    // dahu na zasebne segmente, tako da svaka komanda prođe kroz svoju
    // granu umesto da bude "progutana" u jednom pozivu.
    const splitRegex = splitCommandsRegex();

    if (splitRegex.test(cmd)) {
        const parts = cmd.split(splitRegex);
        console.log('✂️ Podeljeno na segmente:', parts);

        for (let i = 0; i < parts.length; i += 2) {
            const segment = parts[i] ? parts[i].trim() : '';
            const keyword = parts[i + 1];

            if (segment) {
                console.log('▶️ Obrađujem segment:', segment);
                processSingleVoiceCommand(segment);
            }
            if (keyword) {
                console.log('▶️ Obrađujem ključnu reč:', keyword);
                processSingleVoiceCommand(keyword);
            }
        }
        return;
    }

    processSingleVoiceCommand(cmd);
}

function processSingleVoiceCommand(command) {
    console.log('🎤 processSingleVoiceCommand prima:', command);

    if (!command || command.length < 1) return;

    let cmd = command.trim();
    let lowerCmd = cmd.toLowerCase();
    console.log('🔍 Procesiram:', lowerCmd);

    // START
    if (new RegExp('^(' + getLangDict(COMMAND_WORDS).start.join('|') + ')', 'i').test(lowerCmd)) {

        console.log('▶️ START - otvaram unos');

        cancelAutoSave(); // 🔥 stari bafer (ako je bio) se ovde odbacuje, ne treba da se auto-sačuva

        voiceBuffer = cmd.replace(new RegExp('^(' + getLangDict(COMMAND_WORDS).start.join('|') + ')\\s*', 'i'), '').trim();
        console.log('📦 Buffer nakon Start:', voiceBuffer);

        if (typeof window.renderDataEntry === 'function') {
            window.renderDataEntry('');
        } else if (typeof renderDataEntry === 'function') {
            renderDataEntry('');
        }

        if (voiceBuffer) {
            showVoiceStatus(`🎤 Slušam: "${voiceBuffer}"`, '#FFD700');
            scheduleAutoSave(); // 🔥 ako "Plus"/"Kraj" ne stigne, sačuvaj posle tišine
        } else {
            showVoiceStatus('🎤 Redosled: NAZIV → KOMAD → KOLIČINA → JEDINICA → ROK → SKLADIŠTE', '#4CAF50');
        }
        return;
    }

    // 🔥 OBRIŠI - poništava trenutno diktirane podatke PRE nego što se
    // sačuvaju sa "Plus". Ne snima ništa, samo prazni bafer i formu.
    // Koristi \b (cela reč) da izbegne lažno okidanje na sličnim rečima.
    if (cmdRx('obrisi').test(lowerCmd)) {

        console.log('🗑️ OBRIŠI - poništavam trenutni unos');
        obrisiTrenutniUnos();
        // 🔥 Prisilan restart mikrofona - da sledeća reč sigurno stigne čista
        try { recognition.stop(); } catch(e) {}
        return;
    }

    // PLUS
    if (cmdRx('plus').test(lowerCmd)) {

        console.log('➕ PLUS - upisujem buffer:', voiceBuffer);

        cancelAutoSave(); // 🔥 spreči da stari tajmer kasnije sačuva bafer SLEDEĆE stavke

        let cleanCommand = cmd.replace(new RegExp('\\b(' + getLangDict(COMMAND_WORDS).plus.join('|') + ')\\b', 'gi'), '').trim();

        console.log('📦 Buffer pre upisa:', voiceBuffer);
        console.log('📦 Ostatak posle plus:', cleanCommand);

        if (voiceBuffer.trim().length < 2) {
            showVoiceStatus('❌ Nema podataka za upis.', '#f44336');
            return;
        }

        const data = parseVoiceDataEntry(voiceBuffer);
        console.log('📦 PARSED:', data);

        sacuvajPodatkeBezPopupa(data);

        voiceBuffer = cleanCommand || '';
        console.log('🧹 Novi buffer:', voiceBuffer);

        if (voiceBuffer) {
            scheduleAutoSave(); // 🔥 ostatak posle "Plus" je početak sledeće stavke - zakaži i za nju
        }

        showVoiceStatus(`✅ Sačuvano: ${data.product_name}. Izdiktirajte sledeći ili recite "End"`, '#4CAF50');
        // 🔥 Prisilan restart mikrofona - da sledeća reč sigurno stigne čista
        try { recognition.stop(); } catch(e) {}
        return;
    }

    // END
    if (cmdRx('end').test(lowerCmd)) {

        console.log('🏁 END - završavam unos i otvaram zalihe');

        cancelAutoSave(); // 🔥 sesija se zatvara, ne treba da nešto kasnije "iskrsne" iz starog tajmera

        let cleanCommand = cmd.replace(new RegExp('\\b(' + getLangDict(COMMAND_WORDS).end.join('|') + ')\\b', 'gi'), '').trim();

        console.log('📦 Buffer pre upisa:', voiceBuffer);
        console.log('📦 Ostatak posle end:', cleanCommand);


        if (voiceBuffer.trim().length > 2) {
            const data = parseVoiceDataEntry(voiceBuffer);
            sacuvajPodatkeBezPopupa(data);
            console.log('✅ Sačuvano iz buffera (End):', voiceBuffer);
        }

        if (cleanCommand.length > 2) {
            const data2 = parseVoiceDataEntry(cleanCommand);
            setTimeout(() => {
                sacuvajPodatkeBezPopupa(data2);
                console.log('✅ Sačuvano iz End ostatka:', cleanCommand);
            }, 1000);
        }

        voiceBuffer = '';

        setTimeout(() => {
            if (typeof window.renderInventory === 'function') {
                window.renderInventory();
            } else if (typeof renderInventory === 'function') {
                renderInventory();
            }
            showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
        }, 2500);

        stopVoiceRecognition();
        return;
    }

    // ZALIHE
    if (cmdRx('zalihe').test(lowerCmd)) {
        console.log('📦 ZALIHE');
        voiceBuffer = '';
        if (typeof window.renderInventory === 'function') {
            window.renderInventory();
        } else if (typeof renderInventory === 'function') {
            renderInventory();
        }
        // 🔥 Mikrofon OSTAJE aktivan i na ekranu Zaliha - da "stanje" komanda može da radi ovde
        return;
    }

    // SPISAK
    if (cmdRx('spisak').test(lowerCmd)) {
        console.log('🛒 SPISAK');
        voiceBuffer = '';
        if (typeof window.renderShoppingList === 'function') {
            window.renderShoppingList();
        } else if (typeof renderShoppingList === 'function') {
            renderShoppingList();
        }
        stopVoiceRecognition();
        return;
    }

    // NAZAD
    if (cmdRx('nazad').test(lowerCmd)) {
        console.log('⬅️ NAZAD');
        voiceBuffer = '';
        stopVoiceRecognition();
        if (typeof window.goBack === 'function') {
            window.goBack();
        } else if (typeof goBack === 'function') {
            goBack();
        }
        return;
    }

    // EXIT
    if (cmdRx('exit').test(lowerCmd)) {
        console.log('🚪 EXIT');
        voiceBuffer = '';
        stopVoiceRecognition();
        if (typeof window.exitApp === 'function') {
            window.exitApp();
        } else if (typeof exitApp === 'function') {
            exitApp();
        }
        return;
    }
// STANJE PROIZVODA - "batak pileći stanje" → nađi i prikaži ukupnu količinu
if (cmdRx('stanje').test(lowerCmd)) {
    const stanjeRx = new RegExp('\\b(' + getLangDict(COMMAND_WORDS).stanje.join('|') + ')\\b', 'i');
    const naziv = normalizujNaziv(cmd.replace(stanjeRx, '').trim());
    if (naziv) {
        const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
        const nadjeni = zalihe.filter(p => p.quantity > 0 &&
            normalizujNaziv(p.product_name || '').includes(naziv));

        if (nadjeni.length === 0) {
            showVoiceStatus(`❌ Nema "${naziv}" u zalihama.`, '#f44336');
        } else {
            const ukupno = nadjeni.reduce((sum, p) => sum + (parseFloat(p.quantity) || 0), 0);
            const jedinica = nadjeni[0].unit;
            showVoiceStatus(`📦 ${nadjeni[0].product_name}: ukupno ${ukupno} ${jedinica}`, '#4CAF50');

            if (typeof window.renderInventory === 'function') {
                window.renderInventory();
                setTimeout(() => {
                    document.querySelectorAll('.voice-highlight-target').forEach(red => {
                        if ((red.dataset.product || '').includes(naziv)) {
                            red.style.background = '#0d47a1';
                            red.style.color = '#ffffff';
                            red.querySelectorAll('.cell').forEach(c => c.style.color = '#ffffff');
                            red.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            setTimeout(() => {
                                red.style.background = '';
                                red.querySelectorAll('.cell').forEach(c => c.style.color = '');
                            }, 4000);
                        }
                    });
                }, 300);
            }
        }
        voiceBuffer = '';
        return;
    }
}
    // SVE OSTALO - DODAJ U BUFFER
    console.log('📝 Dodajem u buffer:', cmd);
    voiceBuffer += (voiceBuffer ? ' ' : '') + cmd;
    console.log('📦 Buffer sada:', voiceBuffer);
    incompleteAutoSaveSkips = 0; // 🔥 stigla je nova reč - resetuj brojač čekanja
    scheduleAutoSave(); // 🔥 svaka nova reč pomera tajmer za automatsko čuvanje unapred
    showVoiceStatus(`🎤 Slušam: "${voiceBuffer}"`, '#FFD700');
}

// ============================================
// 9. IZVOZ ZA GLOBAL
// ============================================

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.startMicWatchdog = startMicWatchdog;
window.stopMicWatchdog = stopMicWatchdog;
window.processVoiceCommand = processVoiceCommand;
window.processSingleVoiceCommand = processSingleVoiceCommand;
window.requestMicrophonePermission = requestMicrophonePermission;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.popuniFormuPodacima = popuniFormuPodacima;
window.obrisiTrenutniUnos = obrisiTrenutniUnos;
window.showVoiceStatus = showVoiceStatus;
window.prikaziPoljaZaUnos = prikaziPoljaZaUnos;
window.ensureFormVisible = ensureFormVisible;

window._voiceCommandsStart = startVoiceRecognition;
window.voiceCommand = processVoiceCommand;

// ============================================
// 10. DOMContentLoaded + TRAJNO OTVOREN MIKROFON
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOMContentLoaded - voiceCommands.js v13.5');

    posmatrajEkranZaUnos(); // 🔥 pokreni posmatranje ekrana za unos

    const startBtn = document.getElementById('activateMicBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('✅ Kliknuto na zeleno dugme!');
            startVoiceRecognition();
        });
        console.log('✅ Zeleno dugme povezano!');
    }
});

// 🔥 Mobilni OS (Android/iOS) često prekine pristup mikrofonu kad
// aplikacija ode u pozadinu (zaključan ekran, prebačena aplikacija,
// minimizovan tab). Kad se korisnik vrati, ovaj kod automatski ponovo
// pokreće prepoznavanje govora ako je glasovni mod bio aktivan, tako
// da korisnik ne mora ponovo da klikne na dugme.
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        console.log('👁️ Aplikacija u fokusu - proveravam mikrofon');
        if (window.isVoiceModeActive && !micActive && !isRestarting) {
            setTimeout(() => {
                if (window.isVoiceModeActive && !micActive && !isRestarting) {
                    console.log('🔄 Restartujem mikrofon posle povratka u fokus');
                    startVoiceRecognition();
                }
            }, 300);
        }
    } else {
        console.log('👁️ Aplikacija u pozadini');
    }
});

window.addEventListener('focus', function() {
    if (window.isVoiceModeActive && !micActive && !isRestarting) {
        setTimeout(() => {
            if (window.isVoiceModeActive && !micActive && !isRestarting) {
                console.log('🔄 Restartujem mikrofon posle window focus');
                startVoiceRecognition();
            }
        }, 300);
    }
});

window.addEventListener('beforeunload', function() {
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    micActive = false;
    window.isVoiceModeActive = false;
});

console.log('✅ VoiceCommands.js v13.5 UCITAN - AUTO-SAVE VIŠE NE PUCA USRED REČENICE!');
console.log('✅ startVoiceRecognition:', typeof startVoiceRecognition);
