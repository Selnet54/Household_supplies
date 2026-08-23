// ============================================
// VOICE COMMANDS - POTPUNO NOVA VERZIJA
// ============================================

// Proveri da li već postoji pre nego što deklarišeš
if (typeof activeBuffer === 'undefined') {
    var activeBuffer = '';
}
if (typeof recognition === 'undefined') {
    var recognition = null;
}
if (typeof lastSavedData === 'undefined') {
    var lastSavedData = null;
}
if (typeof isProcessingCommand === 'undefined') {
    var isProcessingCommand = false;
}
if (typeof END_AKTIVAN === 'undefined') {
    var END_AKTIVAN = false;
}
if (typeof isVoiceInput === 'undefined') {
    var isVoiceInput = false;
}
if (typeof currentVoiceLang === 'undefined') {
    var currentVoiceLang = 'sr-RS';
}

// NE deklariši currentLang ovde - koristi onaj iz glavnog skripta
// Samo ga referenciraj

// ============================================
// REČNIK ZA VOICE KOMANDE NA SVIH 10 JEZIKA
// ============================================

const VOICE_COMMANDS = {
    sr: {
        inventory: ['zalihe', 'zaliha', 'inventar', 'spisak', 'popis', 'stanje'],
        end: ['end', 'kraj', 'gotovo', 'enter', 'friend', 'završi', 'dosta'],
        plus: ['plus', 'dodaj', 'unesi', 'snimi', 'sačuvaj', 'zapiši'],
        start: ['start', 'počni', 'započni', 'pokreni', 'unos', 'novi']
    },
    en: {
        inventory: ['inventory', 'stock', 'list', 'items', 'supplies', 'warehouse', 'storage'],
        end: ['end', 'done', 'finish', 'complete', 'enter', 'stop', 'exit'],
        plus: ['plus', 'add', 'save', 'submit', 'record', 'store'],
        start: ['start', 'begin', 'go', 'record', 'new', 'input']
    },
    de: {
        inventory: ['bestand', 'inventar', 'liste', 'vorrat', 'lager', 'waren', 'vorräte'],
        end: ['ende', 'fertig', 'beenden', 'eingabe', 'enter', 'stopp', 'exit'],
        plus: ['plus', 'hinzufügen', 'speichern', 'add', 'aufnehmen', 'eintragen'],
        start: ['start', 'beginn', 'los', 'aufnahme', 'neu', 'eingabe']
    },
    hu: {
        inventory: ['készlet', 'leltár', 'lista', 'raktár', 'áru', 'készletek', 'termékek'],
        end: ['vége', 'kész', 'befejez', 'enter', 'rendben', 'stop', 'exit'],
        plus: ['plusz', 'hozzáad', 'mentés', 'rögzít', 'felvétel', 'tárol'],
        start: ['indul', 'kezd', 'start', 'elindít', 'új', 'bevitel']
    },
    uk: {
        inventory: ['запаси', 'інвентар', 'список', 'склад', 'товари', 'продукти', 'наявність'],
        end: ['кінець', 'готово', 'завершити', 'введення', 'enter', 'стоп', 'вихід'],
        plus: ['плюс', 'додати', 'зберегти', 'записати', 'додавання', 'зберігання'],
        start: ['почати', 'старт', 'розпочати', 'запустити', 'новий', 'введення']
    },
    ru: {
        inventory: ['запасы', 'инвентарь', 'список', 'склад', 'товары', 'продукты', 'наличие'],
        end: ['конец', 'готово', 'завершить', 'ввод', 'enter', 'стоп', 'выход'],
        plus: ['плюс', 'добавить', 'сохранить', 'записать', 'добавление', 'сохранение'],
        start: ['начать', 'старт', 'запустить', 'поехали', 'новый', 'ввод']
    },
    zh: {
        inventory: ['库存', '存货', '清单', '列表', '商品', '产品', '存货清单'],
        end: ['结束', '完成', '输入', '确定', 'enter', '停止', '退出'],
        plus: ['加', '添加', '保存', '记录', '新增', '存储'],
        start: ['开始', '启动', '录音', '说', '新', '输入']
    },
    es: {
        inventory: ['inventario', 'stock', 'lista', 'existencias', 'productos', 'almacén', 'depósito'],
        end: ['fin', 'hecho', 'terminar', 'entrar', 'enter', 'parar', 'salir'],
        plus: ['más', 'añadir', 'guardar', 'agregar', 'sumar', 'registrar'],
        start: ['empezar', 'comenzar', 'iniciar', 'grabar', 'nuevo', 'entrada']
    },
    pt: {
        inventory: ['inventário', 'estoque', 'lista', 'produtos', 'suprimentos', 'armazém', 'mercadorias'],
        end: ['fim', 'pronto', 'terminar', 'entrar', 'enter', 'parar', 'sair'],
        plus: ['mais', 'adicionar', 'salvar', 'incluir', 'add', 'registrar'],
        start: ['começar', 'iniciar', 'gravar', 'start', 'novo', 'entrada']
    },
    fr: {
        inventory: ['inventaire', 'stock', 'liste', 'produits', 'marchandises', 'entrepôt', 'réserves'],
        end: ['fin', 'terminé', 'terminer', 'entrée', 'enter', 'arrêter', 'sortir'],
        plus: ['plus', 'ajouter', 'enregistrer', 'sauvegarder', 'add', 'enregistrement'],
        start: ['commencer', 'démarrer', 'enregistrer', 'début', 'nouveau', 'entrée']
    }
};

// ============================================
// FUNKCIJE ZA JEZIK
// ============================================

function getVoiceCommands() {
    // Koristi currentLang iz globalnog skopa
    const lang = typeof currentLang !== 'undefined' ? currentLang : 'sr';
    return VOICE_COMMANDS[lang] || VOICE_COMMANDS['sr'];
}

function updateVoiceLanguage(langCode) {
    const speechLangMap = {
        sr: 'sr-RS', en: 'en-US', de: 'de-DE', hu: 'hu-HU',
        uk: 'uk-UA', ru: 'ru-RU', zh: 'zh-CN', es: 'es-ES',
        pt: 'pt-PT', fr: 'fr-FR'
    };
    
    currentVoiceLang = speechLangMap[langCode] || 'sr-RS';
    console.log('🌐 Voice jezik ažuriran na:', currentVoiceLang);
    
    const cmds = getVoiceCommands();
    console.log('📋 Komande za inventar:', cmds.inventory.join(', '));
    console.log('📦 Komande za kraj:', cmds.end.join(', '));
    console.log('✅ Komande za unos:', cmds.plus.join(', '));
    
    if (recognition) {
        stopVoiceRecognition();
        setTimeout(() => startVoiceRecognition(), 500);
    }
}

// ============================================
// POMOĆNE FUNKCIJE
// ============================================

function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
    }
    const choiceScreen = document.getElementById('choiceScreen');
    if (choiceScreen) {
        choiceScreen.style.display = 'none';
        choiceScreen.classList.remove('active');
    }
}

function showVoiceStatus(text, color) {
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = text;
        if (color) statusEl.style.color = color;
    }
    console.log('[VOICE]', text);
}

// ============================================
// BROJEVI NA VIŠE JEZIKA
// ============================================

const NUMBER_WORDS = {
    // Srpski
    'nula': '0', 'jedan': '1', 'jedna': '1', 'jedno': '1',
    'dva': '2', 'dve': '2', 'tri': '3', 'četiri': '4', 'cetiri': '4',
    'pet': '5', 'šest': '6', 'sest': '6', 'sedam': '7', 'osam': '8',
    'devet': '9', 'deset': '10',
    'jedanaest': '11', 'dvanaest': '12', 'trinaest': '13',
    'četrnaest': '14', 'cetrnaest': '14', 'petnaest': '15',
    'šesnaest': '16', 'sesnaest': '16', 'sedamnaest': '17',
    'osamnaest': '18', 'devetnaest': '19',
    'dvadeset': '20', 'trideset': '30', 'četrdeset': '40',
    'cetrdeset': '40', 'pedeset': '50', 'šezdeset': '60',
    'sezdeset': '60', 'sedamdeset': '70', 'osamdeset': '80',
    'devedeset': '90', 'sto': '100',
    
    // Engleski
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
    'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13',
    'fourteen': '14', 'fifteen': '15', 'sixteen': '16', 'seventeen': '17',
    'eighteen': '18', 'nineteen': '19', 'twenty': '20', 'thirty': '30',
    'forty': '40', 'fifty': '50', 'sixty': '60', 'seventy': '70',
    'eighty': '80', 'ninety': '90', 'hundred': '100',
    
    // Nemački
    'null': '0', 'eins': '1', 'zwei': '2', 'drei': '3', 'vier': '4',
    'fünf': '5', 'funf': '5', 'sechs': '6', 'sieben': '7', 'acht': '8',
    'neun': '9', 'zehn': '10', 'elf': '11', 'zwölf': '12', 'z wol f': '12',
    'dreizehn': '13', 'vierzehn': '14', 'fünfzehn': '15', 'funfzehn': '15',
    'sechzehn': '16', 'siebzehn': '17', 'achtzehn': '18', 'neunzehn': '19',
    'zwanzig': '20', 'dreißig': '30', 'dreissig': '30', 'vierzig': '40',
    'fünfzig': '50', 'funfzig': '50', 'sechzig': '60', 'siebzig': '70',
    'achtzig': '80', 'neunzig': '90', 'hundert': '100',
    
    // Mađarski
    'nulla': '0', 'egy': '1', 'kettő': '2', 'ketto': '2', 'három': '3', 'harom': '3',
    'négy': '4', 'negy': '4', 'öt': '5', 'ot': '5', 'hat': '6', 'hét': '7', 'het': '7',
    'nyolc': '8', 'kilenc': '9', 'tíz': '10', 'tiz': '10', 'tizenegy': '11',
    'tizenkettő': '12', 'tizenketto': '12', 'tizenhárom': '13', 'tizenharom': '13',
    'tizennégy': '14', 'tizenegy': '14', 'tizenöt': '15', 'tizenot': '15',
    'tizenhat': '16', 'tizenhét': '17', 'tizenhet': '17', 'tizennyolc': '18',
    'tizenkilenc': '19', 'húsz': '20', 'husz': '20', 'harminc': '30',
    'negyven': '40', 'ötven': '50', 'otven': '50', 'hatvan': '60',
    'hetven': '70', 'nyolcvan': '80', 'kilencven': '90', 'száz': '100', 'szaz': '100',
    
    // Ukrajinski
    'нуль': '0', 'один': '1', 'два': '2', 'три': '3', 'чотири': '4',
    'пять': '5', 'шість': '6', 'сім': '7', 'вісім': '8', 'девять': '9',
    'десять': '10', 'одинадцять': '11', 'дванадцять': '12', 'тринадцять': '13',
    'чотирнадцять': '14', 'пятнадцять': '15', 'шістнадцять': '16',
    'сімнадцять': '17', 'вісімнадцять': '18', 'девятнадцять': '19',
    'двадцять': '20', 'тридцять': '30', 'сорок': '40', 'пятдесят': '50',
    'шістдесят': '60', 'сімдесят': '70', 'вісімдесят': '80', 'девяносто': '90',
    'сто': '100',
    
    // Ruski
    'ноль': '0', 'один': '1', 'два': '2', 'три': '3', 'четыре': '4',
    'пять': '5', 'шесть': '6', 'семь': '7', 'восемь': '8', 'девять': '9',
    'десять': '10', 'одиннадцать': '11', 'двенадцать': '12', 'тринадцать': '13',
    'четырнадцать': '14', 'пятнадцать': '15', 'шестнадцать': '16',
    'семнадцать': '17', 'восемнадцать': '18', 'девятнадцать': '19',
    'двадцать': '20', 'тридцать': '30', 'сорок': '40', 'пятьдесят': '50',
    'шестьдесят': '60', 'семьдесят': '70', 'восемьдесят': '80', 'девяносто': '90',
    'сто': '100',
    
    // Kineski (pinyin)
    'ling': '0', 'yi': '1', 'er': '2', 'san': '3', 'si': '4',
    'wu': '5', 'liu': '6', 'qi': '7', 'ba': '8', 'jiu': '9',
    'shi': '10', 'shiyi': '11', 'shier': '12', 'shisan': '13',
    'shisi': '14', 'shiwu': '15', 'shiliu': '16', 'shiqi': '17',
    'shiba': '18', 'shijiu': '19', 'ershi': '20', 'sanshi': '30',
    'sishi': '40', 'wushi': '50', 'liushi': '60', 'qishi': '70',
    'bashi': '80', 'jiushi': '90', 'yibai': '100',
    
    // Španski
    'cero': '0', 'uno': '1', 'dos': '2', 'tres': '3', 'cuatro': '4',
    'cinco': '5', 'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9',
    'diez': '10', 'once': '11', 'doce': '12', 'trece': '13',
    'catorce': '14', 'quince': '15', 'dieciséis': '16', 'diecisies': '16',
    'diecisiete': '17', 'dieciocho': '18', 'diecinueve': '19',
    'veinte': '20', 'treinta': '30', 'cuarenta': '40', 'cincuenta': '50',
    'sesenta': '60', 'setenta': '70', 'ochenta': '80', 'noventa': '90',
    'cien': '100',
    
    // Portugalski
    'zero': '0', 'um': '1', 'dois': '2', 'três': '3', 'tres': '3',
    'quatro': '4', 'cinco': '5', 'seis': '6', 'sete': '7', 'oito': '8',
    'nove': '9', 'dez': '10', 'onze': '11', 'doze': '12', 'treze': '13',
    'catorze': '14', 'quinze': '15', 'dezesseis': '16', 'dezessete': '17',
    'dezoito': '18', 'dezenove': '19', 'vinte': '20', 'trinta': '30',
    'quarenta': '40', 'cinquenta': '50', 'sessenta': '60', 'setenta': '70',
    'oitenta': '80', 'noventa': '90', 'cem': '100',
    
    // Francuski
    'zéro': '0', 'zero': '0', 'un': '1', 'deux': '2', 'trois': '3',
    'quatre': '4', 'cinq': '5', 'six': '6', 'sept': '7', 'huit': '8',
    'neuf': '9', 'dix': '10', 'onze': '11', 'douze': '12', 'treize': '13',
    'quatorze': '14', 'quinze': '15', 'seize': '16', 'dix-sept': '17',
    'dix-huit': '18', 'dix-neuf': '19', 'vingt': '20', 'trente': '30',
    'quarante': '40', 'cinquante': '50', 'soixante': '60', 'soixante-dix': '70',
    'quatre-vingt': '80', 'quatre-vingt-dix': '90', 'cent': '100'
};

function getNumber(word) {
    const w = word.toLowerCase().trim();
    if (NUMBER_WORDS[w] !== undefined) return NUMBER_WORDS[w];
    if (/^\d+(?:[.,]\d+)?$/.test(w)) return w.replace(',', '.');
    return null;
}

// ============================================
// JEDINICE I SKLADIŠTA
// ============================================

const UNIT_MAP = {
    'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg',
    'gram': 'g', 'grama': 'g', 'g': 'g',
    'litar': 'l', 'litara': 'l', 'l': 'l',
    'komad': 'kom', 'komada': 'kom', 'kom': 'kom',
    'paket': 'pak', 'paketa': 'pak', 'pak': 'pak'
};

const STORAGE_MAP = {
    'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
    'zamrzivač 1': 'Zamrzivač 1', 'zamrzivac 1': 'Zamrzivač 1',
    'zamrzivač 2': 'Zamrzivač 2', 'zamrzivac 2': 'Zamrzivač 2',
    'zamrzivač 3': 'Zamrzivač 3', 'zamrzivac 3': 'Zamrzivač 3',
    'frižider': 'Frižider', 'frizider': 'Frižider',
    'ostava': 'Ostava', 'špajz': 'Ostava'
};

function getUnit(word) {
    return UNIT_MAP[word.toLowerCase()] || null;
}

function getStorage(word) {
    const w = word.toLowerCase();
    for (let key in STORAGE_MAP) {
        if (w.includes(key) || key.includes(w)) {
            return STORAGE_MAP[key];
        }
    }
    return null;
}

// ============================================
// PARSIRANJE
// ============================================

function parseVoiceDataEntry(command) {
    console.log('🔍 PARSIRAM:', command);
    
    let text = command
        .replace(/^unos\s*/i, '')
        .replace(/^start\s*/i, '')
        .replace(/^grile\s*/i, 'grill ')
        .replace(/^gril\s*/i, 'grill ')
        .replace(/\bGreen\b/gi, 'grill ')
        .replace(/\bgreen\b/gi, 'grill ')
        .trim();
    
    let words = text.split(/\s+/).map(s => s.trim()).filter(Boolean);
    console.log('📝 REČI:', words);
    
    let result = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    let foundStorage = null;
    let foundUnit = null;
    let unitIndex = -1;
    let storageIndex = -1;
    
    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        
        let storageMatch = getStorage(w);
        if (storageMatch) {
            foundStorage = storageMatch;
            storageIndex = i;
        }
        
        let unitMatch = getUnit(w);
        if (unitMatch) {
            foundUnit = unitMatch;
            unitIndex = i;
        }
    }
    
    let nameParts = [];
    let numbers = [];
    let skipWords = ['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima', 'i'];
    
    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        let originalW = words[i];
        
        if (i === storageIndex || i === unitIndex) {
            continue;
        }
        
        if (skipWords.includes(w)) {
            continue;
        }
        
        let numVal = getNumber(w);
        if (numVal !== null) {
            numbers.push(numVal);
            continue;
        }
        
        nameParts.push(originalW);
    }
    
    console.log('📊 Brojevi:', numbers);
    console.log('📊 Naziv delovi:', nameParts);
    
    if (numbers.length >= 2) {
        result.piece = numbers[0];
        result.quantity = numbers[1];
    } else if (numbers.length === 1) {
        result.piece = numbers[0];
        result.quantity = numbers[0];
    }
    
    let rokPronadjen = false;
    
    if (text.includes('šest') || text.includes('sest') || /\b6\b/.test(text)) {
        result.shelf_life = '6';
        rokPronadjen = true;
        console.log('🔍 Pronađeno "šest/6" -> rok = 6 meseci');
    }
    
    if (!rokPronadjen) {
        let meseciMatch = text.match(/(\d+)\s*meseci/);
        if (meseciMatch) {
            result.shelf_life = meseciMatch[1];
            rokPronadjen = true;
            console.log('🔍 Pronađeno "' + meseciMatch[1] + ' meseci" -> rok = ' + meseciMatch[1]);
        }
    }
    
    if (!rokPronadjen && numbers.length >= 3) {
        result.shelf_life = numbers[2];
        rokPronadjen = true;
        console.log('🔍 Treći broj -> rok =', numbers[2]);
    }
    
    if (!rokPronadjen && numbers.length >= 2 && foundUnit !== 'kg' && foundUnit !== 'g') {
        if (foundUnit === 'kom' || foundUnit === 'l' || foundUnit === 'ml') {
            result.shelf_life = numbers[1];
            rokPronadjen = true;
            console.log('🔍 Drugi broj (jedinica ' + foundUnit + ') -> rok =', numbers[1]);
        }
    }
    
    result.product_name = nameParts.join(' ').trim() || 'Proizvod';
    
    if (text.includes('gram') || text.includes('grama') || text.includes('g ') || text.includes('g)')) {
        result.unit = 'g';
        console.log('🔍 Pronađeno "gram" -> jedinica = g');
    } else if (foundUnit) {
        result.unit = foundUnit;
        console.log('🔍 Pronađena jedinica iz reči:', foundUnit);
    } else if (text.includes('kilogram') || text.includes('kg')) {
        result.unit = 'kg';
        console.log('🔍 Pronađeno "kilogram" -> jedinica = kg');
    } else if (text.includes('litar') || text.includes('l ')) {
        result.unit = 'l';
        console.log('🔍 Pronađeno "litar" -> jedinica = l');
    } else if (text.includes('komad') || text.includes('kom')) {
        result.unit = 'kom';
        console.log('🔍 Pronađeno "komad" -> jedinica = kom');
    }
    
    if (foundStorage) {
        result.storage = foundStorage;
    }
    
    let gramMatches = text.match(/\b(500|700|800|900|1000)\b/);
    if (gramMatches) {
        if (result.unit === 'kom' || result.unit === 'l') {
            if (text.includes('gram') || text.includes('grama')) {
                result.unit = 'g';
                console.log('🔍 Grami detektovani -> jedinica = g');
            }
        }
        if (result.quantity === '1' && numbers.length === 1) {
            result.quantity = gramMatches[1];
            result.piece = gramMatches[1];
            console.log('🔍 Količina postavljena na: ' + gramMatches[1] + 'g');
        }
    }
    
    console.log('✅ PARSIRANO:', result);
    return result;
}

// ============================================
// POPUNJAVANJE FORME
// ============================================

function popuniFormuPodacima(data) {
    console.log('📝 Popunjavam formu:', data);
    
    setTimeout(() => {
        const productInput = document.getElementById('productInput');
        if (productInput) {
            productInput.value = data.product_name || '';
            productInput.dispatchEvent(new Event('input', { bubbles: true }));
            productInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        const pieceInput = document.getElementById('pieceInput');
        if (pieceInput) {
            pieceInput.value = data.piece || '1';
            pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
            pieceInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        const quantityInput = document.getElementById('quantityInput');
        if (quantityInput) {
            quantityInput.value = data.quantity || '1';
            quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
            quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        const shelfLifeInput = document.getElementById('shelfLifeInput');
        if (shelfLifeInput) {
            shelfLifeInput.value = data.shelf_life || '12';
            shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
            shelfLifeInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        const unitSelect = document.getElementById('unitSelect');
        if (unitSelect && data.unit) {
            for (let option of unitSelect.options) {
                if (option.value === data.unit || option.text.toLowerCase().includes(data.unit)) {
                    option.selected = true;
                    unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }
        
        const storageSelect = document.getElementById('storageSelect');
        if (storageSelect && data.storage) {
            for (let option of storageSelect.options) {
                if (option.value === data.storage || option.text.includes(data.storage)) {
                    option.selected = true;
                    storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }
        
        if (typeof updateExpiryDate === 'function') {
            try { updateExpiryDate(); } catch(e) {}
        }
        
        showVoiceStatus(`✅ Uneto: ${data.product_name} (${data.quantity} ${data.unit})`, '#4CAF50');
    }, 300);
}

// ============================================
// ČUVANJE PODATAKA
// ============================================

function sacuvajPodatke(data) {
    console.log('💾 Čuvam podatke:', data);
    
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
    
    let saved = false;
    
    if (typeof saveProduct === 'function') {
        try { 
            saveProduct(); 
            saved = true; 
            console.log('✅ saveProduct'); 
        } catch(e) {
            console.warn('saveProduct greška:', e);
        }
    }
    
    if (!saved && typeof handleFormSubmit === 'function') {
        try { 
            handleFormSubmit(); 
            saved = true; 
            console.log('✅ handleFormSubmit'); 
        } catch(e) {
            console.warn('handleFormSubmit greška:', e);
        }
    }
    
    if (!saved && typeof addProduct === 'function') {
        try { 
            addProduct(); 
            saved = true; 
            console.log('✅ addProduct'); 
        } catch(e) {
            console.warn('addProduct greška:', e);
        }
    }
    
    if (!saved && typeof window.inventory !== 'undefined' && Array.isArray(window.inventory)) {
        const newItem = {
            id: Date.now(),
            productName: data.product_name,
            piece: parseInt(data.piece) || 1,
            quantity: parseFloat(data.quantity) || 1,
            unit: data.unit || 'kom',
            shelfLife: parseInt(data.shelf_life) || 12,
            storage: data.storage || 'Zamrzivač 1',
            dateAdded: new Date().toISOString(),
            expiryDate: new Date(Date.now() + parseInt(data.shelf_life || 12) * 30 * 24 * 60 * 60 * 1000).toISOString(),
            isNew: true
        };
        window.inventory.push(newItem);
        saved = true;
        console.log('✅ Dodat u inventory niz');
    }
    
    if (!saved) {
        const saveBtn = document.querySelector('#saveProductBtn, button[type="submit"], .btn-save, .save-btn');
        if (saveBtn) {
            try { 
                saveBtn.click(); 
                saved = true; 
                console.log('✅ Klik na dugme za čuvanje'); 
            } catch(e) {
                console.warn('Klik greška:', e);
            }
        }
    }
    
    setTimeout(() => {
        window.showModernAlert = originalShowModernAlert;
        window.alert = originalAlert;
    }, 1000);
    
    if (saved) {
        showVoiceStatus(`✅ Sačuvano: ${data.product_name}`, '#4CAF50');
        console.log('✅ Podaci sačuvani!');
        
        setTimeout(() => {
            if (typeof prikaziSveUnose === 'function') {
                try { 
                    prikaziSveUnose(); 
                    console.log('✅ Pregled unosa osvežen');
                } catch(e) {
                    console.warn('prikaziSveUnose greška:', e);
                }
            }
            if (typeof renderInventory === 'function') {
                try { 
                    renderInventory(); 
                    console.log('✅ Inventar osvežen');
                } catch(e) {}
            }
            console.log('✅ Podaci osveženi');
        }, 50);
        
    } else {
        console.error('❌ Greška pri čuvanju!');
        showVoiceStatus('❌ Greška pri čuvanju!', '#f44336');
    }
    
    setTimeout(() => {
        isVoiceInput = false;
        window._isVoiceInput = false;
    }, 1000);
}

// ============================================
// OTVARANJE ZALIHA
// ============================================

function otvoriZaliheEkran() {
    console.log('📦 Otvaram ekran zaliha...');
    
    if (typeof refreshInventoryData === 'function') {
        try { refreshInventoryData(); } catch(e) {}
    }
    
    setTimeout(() => {
        if (typeof renderInventory === 'function') {
            try { renderInventory(); } catch(e) {}
        }
        if (typeof renderProductList === 'function') {
            try { renderProductList(); } catch(e) {}
        }
        if (typeof renderEntries === 'function') {
            try { renderEntries(); } catch(e) {}
        }
        if (typeof loadInventory === 'function') {
            try { loadInventory(); } catch(e) {}
        }
        if (typeof updateInventory === 'function') {
            try { updateInventory(); } catch(e) {}
        }
    }, 100);
    
    setTimeout(() => {
        if (typeof openInventoryAndShowHighlight === 'function') {
            try { openInventoryAndShowHighlight(); } catch(e) {}
        } else if (typeof showScreen === 'function') {
            try { showScreen('inventoryScreen'); } catch(e) {}
        } else {
            const inv = document.getElementById('inventoryScreen');
            const main = document.getElementById('mainScreen');
            if (inv) {
                if (main) main.style.display = 'none';
                inv.style.display = 'flex';
                inv.classList.add('active');
            }
        }
        console.log('✅ Ekran zaliha otvoren');
        showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
    }, 200);
}

// ============================================
// OBRADA I ČUVANJE
// ============================================

function processAndSaveItem(command) {
    let data = parseVoiceDataEntry(command);
    if (!data.product_name || data.product_name === 'Proizvod' || data.product_name.length < 2) {
        console.warn('⚠️ Nije prepoznat naziv proizvoda:', command);
        showVoiceStatus('❌ Nisam prepoznao proizvod', '#f44336');
        return false;
    }
    
    console.log('📦 OBRADA:', data);
    lastSavedData = data;
    
    hideVoiceMenu();
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    
    setTimeout(() => {
        popuniFormuPodacima(data);
        
        setTimeout(() => {
            sacuvajPodatke(data);
        }, 200);
        
    }, 100);

    return true;
}

// ============================================
// START VOICE RECOGNITION
// ============================================

function startVoiceRecognition() {
    console.log('🎤 startVoiceRecognition POZVAN!');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showVoiceStatus('❌ Browser ne podržava glasovno prepoznavanje.', '#f44336');
        return;
    }

    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }

    recognition = new SpeechRecognition();
    recognition.lang = currentVoiceLang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    END_AKTIVAN = false;
    isProcessingCommand = false;

    recognition.onstart = function() {
        console.log('🎤 MIKROFON AKTIVAN!');
        showVoiceStatus('🎤 Slušam... Recite "start" pa podatke', '#2196F3');
        activeBuffer = '';
        isProcessingCommand = false;
        END_AKTIVAN = false;
    };

    recognition.onresult = function(event) {
        let interimText = '';
        let finalChunk = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript.trim();
            if (result.isFinal) {
                finalChunk += (finalChunk ? ' ' : '') + transcript;
            } else {
                interimText += transcript;
            }
        }
        
        if (finalChunk) {
            activeBuffer += (activeBuffer ? ' ' : '') + finalChunk;
            console.log('🗣️ TRENUTNI BAFER:', activeBuffer);
        }
        
        const currentDisplay = activeBuffer + (interimText ? ' ' + interimText : '');
        showVoiceStatus(`🎤 Slušam: "${currentDisplay}"`, '#FFD700');
        
        if (isProcessingCommand) return;
        
        const commands = getVoiceCommands();
        const lowerFull = activeBuffer.toLowerCase();
        console.log('🔍 PROVERAVAM CELI BAFER:', lowerFull);
        
        // INVENTORY/SPISAK
        const inventoryKeywords = commands.inventory || ['zalihe', 'inventar', 'spisak'];
        if (inventoryKeywords.some(keyword => lowerFull.includes(keyword))) {
            console.log('📋 SPISAK/INVENTAR DETEKTOVAN - otvaram inventar!');
            isProcessingCommand = true;
            
            let itemText = activeBuffer;
            for (let word of inventoryKeywords) {
                if (itemText.toLowerCase().includes(word)) {
                    const parts = itemText.split(new RegExp(word, 'i'));
                    itemText = parts[0].trim();
                    break;
                }
            }
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }
            
            activeBuffer = '';
            
            setTimeout(() => {
                stopVoiceRecognition();
                setTimeout(() => {
                    if (typeof refreshInventoryData === 'function') {
                        try { refreshInventoryData(); } catch(e) {}
                    }
                    if (typeof prikaziSveUnose === 'function') {
                        try { prikaziSveUnose(); } catch(e) {}
                    }
                    if (typeof renderInventory === 'function') {
                        try { renderInventory(); } catch(e) {}
                    }
                    
                    if (typeof openInventoryAndShowHighlight === 'function') {
                        try { openInventoryAndShowHighlight(); } catch(e) {}
                    } else if (typeof showScreen === 'function') {
                        try { showScreen('inventoryScreen'); } catch(e) {}
                    } else {
                        const inv = document.getElementById('inventoryScreen');
                        const main = document.getElementById('mainScreen');
                        if (inv) {
                            if (main) main.style.display = 'none';
                            inv.style.display = 'flex';
                            inv.classList.add('active');
                        }
                    }
                    console.log('✅ Inventar otvoren');
                    showVoiceStatus('📋 Spisak otvoren', '#4CAF50');
                }, 500);
            }, 300);
            
            return;
        }
        
        // END - OTVARA ZALIHE
        const endKeywords = commands.end || ['end', 'kraj', 'gotovo', 'enter'];
        if (endKeywords.some(keyword => lowerFull.includes(keyword))) {
            console.log('🏁 END DETEKTOVAN - otvaram zalihe!');
            isProcessingCommand = true;
            END_AKTIVAN = true;
            
            let itemText = activeBuffer;
            for (let word of endKeywords) {
                if (itemText.toLowerCase().includes(word)) {
                    const parts = itemText.split(new RegExp(word, 'i'));
                    itemText = parts[0].trim();
                    break;
                }
            }
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }
            
            activeBuffer = '';
            
            setTimeout(() => {
                stopVoiceRecognition();
                setTimeout(() => {
                    if (typeof prikaziSveUnose === 'function') {
                        try { prikaziSveUnose(); } catch(e) {}
                    }
                    if (typeof renderInventory === 'function') {
                        try { renderInventory(); } catch(e) {}
                    }
                    otvoriZaliheEkran();
                    END_AKTIVAN = false;
                }, 500);
            }, 300);
            
            return;
        }
        
        // PLUS - ZAVRŠAVA UNOS (NE otvara zalihe)
        const plusKeywords = commands.plus || ['plus', 'dodaj', 'unesi'];
        if (plusKeywords.some(keyword => lowerFull.includes(keyword))) {
            console.log('✅ PLUS DETEKTOVAN - završavam unos (NE otvaram zalihe)');
            isProcessingCommand = true;
            
            let parts = activeBuffer.split(new RegExp(plusKeywords.join('|'), 'i'));
            let itemText = parts[0].trim();
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }
            
            activeBuffer = parts.slice(1).join('').trim();
            
            showVoiceStatus('✅ Unos sačuvan. Recite sledeći ili "end" za kraj.', '#4CAF50');
            
            setTimeout(() => {
                if (typeof prikaziSveUnose === 'function') {
                    try { prikaziSveUnose(); } catch(e) {}
                }
                console.log('✅ Pregled osvežen nakon plus');
            }, 200);
            
            setTimeout(() => {
                isProcessingCommand = false;
            }, 500);
            
            return;
        }
        
        // START/UNOS - OTVARA DATA ENTRY
        const startKeywords = commands.start || ['unos', 'unesi', 'dodaj', 'novi'];
        if (startKeywords.some(keyword => lowerFull.includes(keyword))) {
            console.log('📝 UNOS DETEKTOVAN - otvaram data entry');
            hideVoiceMenu();
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen && mainScreen.style.display !== 'flex') {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
                if (typeof renderDataEntry === 'function') renderDataEntry('');
            }
            const words = activeBuffer.split(/\s+/);
            const filtered = words.filter(w => {
                const lower = w.toLowerCase();
                return !startKeywords.some(k => lower === k);
            });
            activeBuffer = filtered.join(' ');
        }
    };

    recognition.onerror = function(event) {
        console.error('⚠️ Speech Recognition greška:', event.error);
        if (event.error === 'not-allowed') {
            showVoiceStatus('❌ Dozvolite pristup mikrofonu.', '#f44336');
        } else if (event.error === 'no-speech') {
            showVoiceStatus('⚠️ Nisam čuo govor. Pokušajte ponovo.', '#FF9800');
        } else if (event.error === 'network') {
            showVoiceStatus('⚠️ Mrežna greška. Pokušajte ponovo.', '#FF9800');
        }
        isProcessingCommand = false;
    };

    recognition.onend = function() {
        console.log('🎤 Glasovno prepoznavanje završeno.');
        isProcessingCommand = false;
    };

    try {
        recognition.start();
        console.log('✅ Mikrofon pokrenut!');
        showVoiceStatus('🎤 Slušam...', '#2196F3');
    } catch(e) {
        console.error('❌ Greška pri pokretanju:', e);
        showVoiceStatus('❌ Greška pri pokretanju mikrofona', '#f44336');
    }
}

// ============================================
// ZAUSTAVI PREPOZNAVANJE
// ============================================

function stopVoiceRecognition() {
    if (recognition) {
        try {
            recognition.stop();
            recognition = null;
        } catch(e) {}
    }
    activeBuffer = '';
    isProcessingCommand = false;
    showVoiceStatus('⏸️ Prepoznavanje zaustavljeno', '#aaa');
}

// ============================================
// RESTART MIKROFONA
// ============================================

function restartMicrophone() {
    console.log('🔄 Restartujem mikrofon...');
    stopVoiceRecognition();
    setTimeout(() => {
        startVoiceRecognition();
    }, 500);
}

// ============================================
// POVRATAK NA PREĐAŠNJI EKRAN
// ============================================

function goBackFromVoice() {
    console.log('◀ goBackFromVoice POZVAN!');
    stopVoiceRecognition();
    
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    const choiceScreen = document.getElementById('choiceScreen');
    if (choiceScreen) {
        choiceScreen.style.display = 'flex';
        choiceScreen.classList.add('active');
    }
    
    if (typeof updateHeaderLanguage === 'function') {
        updateHeaderLanguage();
    }
    if (typeof updateInterfaceLanguage === 'function') {
        updateInterfaceLanguage();
    }
}

// ============================================
// SELEKTOVANJE VOICE MODE
// ============================================

function selectVoiceMode() {
    console.log('🎤 selectVoiceMode POZVAN!');
    
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    const voiceMenuScreen = document.getElementById('voiceMenuScreen');
    if (voiceMenuScreen) {
        voiceMenuScreen.style.display = 'flex';
        voiceMenuScreen.classList.add('active');
        console.log('✅ Voice menu prikazan');
    }
    
    setTimeout(function() {
        console.log('🎤 Pokrećem VOICE COMMANDS...');
        startVoiceRecognition();
    }, 500);
}

// ============================================
// ZABRANA OTVARANJA ZALIHA IZ VOICE KOMANDI
// ============================================

(function() {
    console.log('🔥 BLOKIRAM OTVARANJE ZALIHA IZ VOICE KOMANDI!');
    
    const originalRenderInventory = window.renderInventory;
    const originalShowScreen = window.showScreen;
    const originalOpenInventory = window.openInventoryAndShowHighlight;
    
    window.renderInventory = function() {
        const stack = new Error().stack || '';
        const allowed = ['goBackFromVoice', 'selectVoiceMode', 'otvoriZaliheEkran', 'startVoiceRecognition'];
        if (allowed.some(fn => stack.includes(fn))) {
            console.log('✅ DOZVOLJENO: renderInventory iz voice komande');
            if (typeof originalRenderInventory === 'function') {
                return originalRenderInventory.apply(this, arguments);
            }
        }
        
        const blocked = ['sacuvajPodatke', 'processAndSaveItem', 'processVoiceCommand', 'saveProduct', 'handleFormSubmit', 'addProduct'];
        const isBlocked = blocked.some(fn => stack.includes(fn));
        
        if (isBlocked) {
            console.log('⛔ BLOKIRANO: renderInventory iz voice komande');
            return;
        }
        
        if (typeof originalRenderInventory === 'function') {
            return originalRenderInventory.apply(this, arguments);
        }
    };
    
    window.showScreen = function(screenId) {
        const stack = new Error().stack || '';
        const allowed = ['goBackFromVoice', 'selectVoiceMode', 'otvoriZaliheEkran', 'startVoiceRecognition'];
        if (allowed.some(fn => stack.includes(fn))) {
            console.log('✅ DOZVOLJENO: showScreen(' + screenId + ') iz voice komande');
            if (typeof originalShowScreen === 'function') {
                return originalShowScreen.apply(this, arguments);
            }
        }
        
        const blocked = ['sacuvajPodatke', 'processAndSaveItem', 'processVoiceCommand'];
        if (blocked.some(fn => stack.includes(fn)) && 
            (screenId === 'inventoryScreen' || screenId === 'mainScreen')) {
            console.log('⛔ BLOKIRANO: showScreen(' + screenId + ') iz voice komande');
            return;
        }
        
        if (typeof originalShowScreen === 'function') {
            return originalShowScreen.apply(this, arguments);
        }
    };
    
    window.openInventoryAndShowHighlight = function() {
        const stack = new Error().stack || '';
        const allowed = ['goBackFromVoice', 'selectVoiceMode', 'otvoriZaliheEkran', 'startVoiceRecognition'];
        if (allowed.some(fn => stack.includes(fn))) {
            console.log('✅ DOZVOLJENO: openInventoryAndShowHighlight iz voice komande');
            if (typeof originalOpenInventory === 'function') {
                return originalOpenInventory.apply(this, arguments);
            }
        }
        
        if (stack.includes('sacuvajPodatke')) {
            console.log('⛔ BLOKIRANO: openInventoryAndShowHighlight iz voice komande');
            return;
        }
        
        if (typeof originalOpenInventory === 'function') {
            return originalOpenInventory.apply(this, arguments);
        }
    };
    
    console.log('✅ Otvaranje zaliha BLOKIRANO za voice komande!');
    console.log('⛔ Plus NE otvara zalihe!');
    console.log('✅ End otvara zalihe!');
    console.log('✅ Spisak/Inventar otvara inventar!');
    console.log('✅ 4. ekran (voiceMenuScreen) radi!');
})();

// ============================================
// IZVOZ SVIH FUNKCIJA U GLOBALNI SKOP
// ============================================

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.processStartCommand = processAndSaveItem;
window.popuniStartPodatke = popuniFormuPodacima;
window.otvoriZaliheEkran = otvoriZaliheEkran;
window.sacuvajPodatke = sacuvajPodatke;
window.processAndSaveItem = processAndSaveItem;
window.selectVoiceMode = selectVoiceMode;
window.restartMicrophone = restartMicrophone;
window.updateVoiceLanguage = updateVoiceLanguage;
window.getVoiceCommands = getVoiceCommands;
window.VOICE_COMMANDS = VOICE_COMMANDS;

// ============================================
// TEST FUNKCIJA
// ============================================

window.testVoiceCommands = function() {
    console.log('🧪 TESTIRAM VOICE KOMANDE ZA SVE JEZIKE:');
    const langs = ['sr', 'en', 'de', 'hu', 'uk', 'ru', 'zh', 'es', 'pt', 'fr'];
    const langNames = {
        sr: 'Srpski', en: 'English', de: 'Deutsch', hu: 'Magyar',
        uk: 'Українська', ru: 'Русский', zh: '中文', es: 'Español',
        pt: 'Português', fr: 'Français'
    };
    
    langs.forEach(lang => {
        const cmds = VOICE_COMMANDS[lang];
        console.log(`\n📌 ${langNames[lang]} (${lang}):`);
        console.log(`   📋 Spisak/Inventar: ${cmds.inventory.join(', ')}`);
        console.log(`   📦 Zalihe/End: ${cmds.end.join(', ')}`);
        console.log(`   ✅ Plus/Dodaj: ${cmds.plus.join(', ')}`);
        console.log(`   🎤 Start/Unos: ${cmds.start.join(', ')}`);
    });
    
    console.log('\n✅ Test završen!');
    console.log('💡 Da biste promenili jezik, pozovite: updateVoiceLanguage("en")');
};

// ============================================
// AUTO-START NA UČITAVANJE
// ============================================

console.log('✅ VOICE COMMANDS - POTPUNO NOVA VERZIJA UČITANA!');
console.log('🎤 Podržani jezici: sr, en, de, hu, uk, ru, zh, es, pt, fr');
console.log('📋 "spisak" ili "inventar" → otvara inventar (na svim jezicima)');
console.log('📦 "end" ili "kraj" → otvara zalihe (na svim jezicima)');
console.log('✅ "plus" ili "dodaj" → samo završava unos (NE otvara zalihe)');
console.log('🧪 Pozovite testVoiceCommands() za pregled svih jezika');

// Obavesti da je sve spremno
console.log('🎤 Sve funkcije su izvezene globalno!');
console.log('📞 Pozovite startVoiceRecognition() da pokrenete mikrofon');
