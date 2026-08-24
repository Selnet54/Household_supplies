// ============================================
// VOICE COMMANDS - KOMPLETAN RADNI KOD (KONAČNO ISPRAVLJEN)
// ============================================

let activeBuffer = ''; 
let recognition = null;
let lastSavedData = null;
let isProcessingCommand = false;
let END_AKTIVAN = false;
let isVoiceInput = false;
let currentVoiceItem = null;
let isWaitingForNewEntry = false;
let speechTimeout = null;
let isRestarting = false;
let isProcessingPlus = false;

// ============================================
// 1. SVI JEZICI
// ============================================

const SUPPORTED_LANGUAGES = ['sr', 'en', 'de', 'hu', 'uk', 'ru', 'zh', 'es', 'pt', 'fr'];

const VOICE_COMMANDS = {
    sr: { add: ['dodaj', 'unos', 'unesi'], list: ['spisak', 'lista'], stock: ['zalihe', 'zaliha'], close: ['exit', 'izlaz'] },
    en: { add: ['add', 'new', 'enter'], list: ['list', 'inventory'], stock: ['stock', 'status'], close: ['exit'] },
    de: { add: ['hinzufügen', 'neu', 'einfügen'], list: ['liste', 'inventar'], stock: ['bestand', 'lager'], close: ['exit'] },
    hu: { add: ['adatbevitel'], list: ['lista', 'leltár'], stock: ['készlet'], close: ['exit'] },
    uk: { add: ['додати', 'новий', 'ввести'], list: ['список', 'інвентар'], stock: ['запаси', 'склад'], close: ['exit'] },
    ru: { add: ['добавить', 'новый', 'ввести'], list: ['список', 'инвентарь'], stock: ['запасы', 'склад'], close: ['exit'] },
    zh: { add: ['添加', '新增', '输入'], list: ['列表', '清单', '库存'], stock: ['库存', '存储'], close: ['exit'] },
    es: { add: ['añadir', 'nuevo', 'ingresar'], list: ['lista', 'inventario'], stock: ['existencias', 'almacén'], close: ['exit'] },
    pt: { add: ['adicionar', 'novo', 'inserir'], list: ['lista', 'inventário'], stock: ['estoque', 'armazenamento'], close: ['exit'] },
    fr: { add: ['ajouter', 'nouveau', 'entrer'], list: ['liste', 'inventaire'], stock: ['stock', 'entrepôt'], close: ['exit'] }
};

const BUTTON_LABELS = {
    sr: { add: '📝 DODAJ', list: '📋 SPISAK', stock: '📦 ZALIHE', close: '🚪 EXIT' },
    en: { add: '📝 ADD', list: '📋 LIST', stock: '📦 STOCK', close: '🚪 EXIT' },
    de: { add: '📝 HINZUFÜGEN', list: '📋 LISTE', stock: '📦 BESTAND', close: '🚪 EXIT' },
    hu: { add: '📝 ADATBEVITEL', list: '📋 LISTA', stock: '📦 KÉSZLET', close: '🚪 EXIT' },
    uk: { add: '📝 ДОДАТИ', list: '📋 СПИСОК', stock: '📦 ЗАПАСИ', close: '🚪 EXIT' },
    ru: { add: '📝 ДОБАВИТЬ', list: '📋 СПИСОК', stock: '📦 ЗАПАСЫ', close: '🚪 EXIT' },
    zh: { add: '📝 添加', list: '📋 列表', stock: '📦 库存', close: '🚪 EXIT' },
    es: { add: '📝 AÑADIR', list: '📋 LISTA', stock: '📦 EXISTENCIAS', close: '🚪 EXIT' },
    pt: { add: '📝 ADICIONAR', list: '📋 LISTA', stock: '📦 ESTOQUE', close: '🚪 EXIT' },
    fr: { add: '📝 AJOUTER', list: '📋 LISTE', stock: '📦 STOCK', close: '🚪 EXIT' }
};

const VOICE_MESSAGES = {
    sr: {
        welcome: 'Izgovorite: "DODAJ", "SPISAK", "ZALIHE" ili "EXIT"',
        listening: 'Slušam...',
        add_mode: 'Otvaram unos... Izgovorite naziv proizvoda',
        list_mode: 'Otvaram spisak...',
        stock_mode: 'Otvaram zalihe...',
        closing: 'Zatvaram glasovni meni...',
        not_recognized: 'Nisam prepoznao. Izgovorite: DODAJ, SPISAK, ZALIHE ili EXIT',
        saving: 'Sačuvano: ',
        new_entry: 'Unesite sledeći proizvod...'
    },
    en: {
        welcome: 'Say: "ADD", "LIST", "STOCK" or "EXIT"',
        listening: 'Listening...',
        add_mode: 'Opening entry... Say product name',
        list_mode: 'Opening list...',
        stock_mode: 'Opening stock...',
        closing: 'Closing voice menu...',
        not_recognized: 'Not recognized. Say: ADD, LIST, STOCK or EXIT',
        saving: 'Saved: ',
        new_entry: 'Enter next product...'
    },
    de: {
        welcome: 'Sagen Sie: "HINZUFÜGEN", "LISTE", "BESTAND" oder "EXIT"',
        listening: 'Höre zu...',
        add_mode: 'Öffne Eingabe... Sagen Sie Produktname',
        list_mode: 'Öffne Liste...',
        stock_mode: 'Öffne Bestand...',
        closing: 'Sprachmenü schließen...',
        not_recognized: 'Nicht erkannt. Sagen Sie: HINZUFÜGEN, LISTE, BESTAND oder EXIT',
        saving: 'Gespeichert: ',
        new_entry: 'Nächstes Produkt eingeben...'
    },
    hu: {
        welcome: 'Mondja: "ADATBEVITEL", "LISTA", "KÉSZLET" vagy "EXIT"',
        listening: 'Hallgatom...',
        add_mode: 'Bevitel nyitása... Mondja a termék nevét',
        list_mode: 'Lista megnyitása...',
        stock_mode: 'Készlet megnyitása...',
        closing: 'Hangmenü bezárása...',
        not_recognized: 'Nem ismert. Mondja: ADATBEVITEL, LISTA, KÉSZLET vagy EXIT',
        saving: 'Mentve: ',
        new_entry: 'Következő termék megadása...'
    },
    uk: {
        welcome: 'Скажіть: "ДОДАТИ", "СПИСОК", "ЗАПАСИ" або "EXIT"',
        listening: 'Слухаю...',
        add_mode: 'Відкриваю введення... Скажіть назву продукту',
        list_mode: 'Відкриваю список...',
        stock_mode: 'Відкриваю запаси...',
        closing: 'Закриваю голосове меню...',
        not_recognized: 'Не розпізнано. Скажіть: ДОДАТИ, СПИСОК, ЗАПАСИ або EXIT',
        saving: 'Збережено: ',
        new_entry: 'Введіть наступний продукт...'
    },
    ru: {
        welcome: 'Скажите: "ДОБАВИТЬ", "СПИСОК", "ЗАПАСЫ" или "EXIT"',
        listening: 'Слушаю...',
        add_mode: 'Открываю ввод... Скажите название продукта',
        list_mode: 'Открываю список...',
        stock_mode: 'Открываю запасы...',
        closing: 'Закрываю голосовое меню...',
        not_recognized: 'Не распознано. Скажите: ДОБАВИТЬ, СПИСОК, ЗАПАСЫ или EXIT',
        saving: 'Сохранено: ',
        new_entry: 'Введите следующий продукт...'
    },
    zh: {
        welcome: '请说："添加", "列表", "库存" 或 "EXIT"',
        listening: '正在听...',
        add_mode: '打开输入... 请说产品名称',
        list_mode: '打开列表...',
        stock_mode: '打开库存...',
        closing: '关闭语音菜单...',
        not_recognized: '无法识别。请说：添加, 列表, 库存 或 EXIT',
        saving: '已保存：',
        new_entry: '输入下一个产品...'
    },
    es: {
        welcome: 'Diga: "AÑADIR", "LISTA", "EXISTENCIAS" o "EXIT"',
        listening: 'Escuchando...',
        add_mode: 'Abriendo entrada... Diga el nombre del producto',
        list_mode: 'Abriendo lista...',
        stock_mode: 'Abriendo existencias...',
        closing: 'Cerrando menú de voz...',
        not_recognized: 'No reconocido. Diga: AÑADIR, LISTA, EXISTENCIAS o EXIT',
        saving: 'Guardado: ',
        new_entry: 'Ingrese el siguiente producto...'
    },
    pt: {
        welcome: 'Diga: "ADICIONAR", "LISTA", "ESTOQUE" ou "EXIT"',
        listening: 'Ouvindo...',
        add_mode: 'Abrindo entrada... Diga o nome do produto',
        list_mode: 'Abrindo lista...',
        stock_mode: 'Abrindo estoque...',
        closing: 'Fechando menu de voz...',
        not_recognized: 'Não reconhecido. Diga: ADICIONAR, LISTA, ESTOQUE ou EXIT',
        saving: 'Salvo: ',
        new_entry: 'Insira o próximo produto...'
    },
    fr: {
        welcome: 'Dites: "AJOUTER", "LISTE", "STOCK" ou "EXIT"',
        listening: 'Écoute...',
        add_mode: 'Ouverture de la saisie... Dites le nom du produit',
        list_mode: 'Ouverture de la liste...',
        stock_mode: 'Ouverture du stock...',
        closing: 'Fermeture du menu vocal...',
        not_recognized: 'Non reconnu. Dites: AJOUTER, LISTE, STOCK ou EXIT',
        saving: 'Enregistré: ',
        new_entry: 'Entrez le prochain produit...'
    }
};

// ============================================
// 2. JEZIČKE FUNKCIJE
// ============================================

function getCurrentLang() {
    return typeof currentLang !== 'undefined' && currentLang ? currentLang : 'sr';
}

function getMessage(key) {
    const lang = getCurrentLang();
    if (VOICE_MESSAGES[lang]) {
        return VOICE_MESSAGES[lang][key] || VOICE_MESSAGES.sr[key] || key || '';
    }
    return VOICE_MESSAGES.sr[key] || key || '';
}

function getButtonLabel(action) {
    const lang = getCurrentLang();
    if (BUTTON_LABELS[lang]) {
        return BUTTON_LABELS[lang][action] || action.toUpperCase();
    }
    return BUTTON_LABELS.en[action] || action.toUpperCase();
}

function getVoiceCommands() {
    const lang = getCurrentLang();
    if (VOICE_COMMANDS[lang]) {
        return VOICE_COMMANDS[lang];
    }
    return VOICE_COMMANDS.sr;
}

function detectVoiceCommand(text) {
    const commands = getVoiceCommands();
    const lower = text.toLowerCase().trim();
    
    if (lower.includes('exit')) {
        return 'close';
    }
    
    for (let [action, keywords] of Object.entries(commands)) {
        if (action === 'close') continue;
        for (let keyword of keywords) {
            if (lower.includes(keyword.toLowerCase())) {
                return action;
            }
        }
    }
    return null;
}

// ============================================
// 3. POMOĆNE FUNKCIJE
// ============================================

function showVoiceStatus(text, color) {
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = text;
        if (color) statusEl.style.color = color;
    }
    console.log('[VOICE]', text);
}

function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
    }
}

function clearForm() {
    console.log('🧹 Čistim formu...');
    try {
        const fields = ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput'];
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.value = '';
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        
        const unitSelect = document.getElementById('unitSelect');
        if (unitSelect) {
            for (let option of unitSelect.options) {
                if (option.value === 'kom') {
                    option.selected = true;
                    unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }
        
        const storageSelect = document.getElementById('storageSelect');
        if (storageSelect) {
            for (let option of storageSelect.options) {
                if (option.value === 'Zamrzivač 1') {
                    option.selected = true;
                    storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }
    } catch(e) {
        console.warn('clearForm greška:', e);
    }
    
    currentVoiceItem = null;
}

function refreshDisplay() {
    console.log('🔄 Osvežavam prikaze...');
    if (typeof prikaziSveUnose === 'function') {
        try { prikaziSveUnose(); } catch(e) { console.warn('prikaziSveUnose greška:', e); }
    }
    if (typeof renderInventory === 'function') {
        try { renderInventory(); } catch(e) { console.warn('renderInventory greška:', e); }
    }
    console.log('✅ Prikazi osveženi');
}

// ============================================
// 4. BROJEVI, JEDINICE, SKLADIŠTA
// ============================================

const NUMBER_WORDS = {
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
    'devedeset': '90', 'sto': '100'
};

function getNumber(word) {
    const w = word.toLowerCase().trim();
    if (NUMBER_WORDS[w] !== undefined) return NUMBER_WORDS[w];
    if (/^\d+(?:[.,]\d+)?$/.test(w)) return w.replace(',', '.');
    return null;
}

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
    return 'Zamrzivač 1';
}

// ============================================
// 5. PARSIRANJE
// ============================================

function parseVoiceDataEntry(command) {
    console.log('🔍 PARSIRAM:', command);
    
    let text = command
        .replace(/^šta\s*/i, '')
        .replace(/^start\s*/i, '')
        .replace(/^dodaj\s*/i, '')
        .replace(/^unos\s*/i, '')
        .replace(/^unesi\s*/i, '')
        .replace(/^add\s*/i, '')
        .replace(/^new\s*/i, '')
        .replace(/^enter\s*/i, '')
        .replace(/^adatbevitel\s*/i, '')
        .replace(/^hinzufügen\s*/i, '')
        .replace(/^neu\s*/i, '')
        .replace(/^einfügen\s*/i, '')
        .replace(/^додати\s*/i, '')
        .replace(/^добавить\s*/i, '')
        .replace(/^添加\s*/i, '')
        .replace(/^añadir\s*/i, '')
        .replace(/^adicionar\s*/i, '')
        .replace(/^ajouter\s*/i, '')
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
        shelf_life: '6',
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
    
    if (!foundStorage) {
        foundStorage = 'Zamrzivač 1';
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
    
    if (numbers.length >= 3) {
        result.piece = numbers[0];
        result.quantity = numbers[1];
        result.shelf_life = numbers[2];
    } else if (numbers.length === 2) {
        if (parseFloat(numbers[1]) > 3 && !text.includes('kilogram') && !text.includes('kg')) {
            result.piece = numbers[0];
            result.quantity = numbers[0];
            result.shelf_life = numbers[1];
        } else {
            result.piece = numbers[0];
            result.quantity = numbers[1];
        }
    } else if (numbers.length === 1) {
        result.piece = numbers[0];
        result.quantity = numbers[0];
    }
    
    if (text.includes('gram') || text.includes('grama') || text.includes('g ')) {
        result.unit = 'g';
    } else if (text.includes('kilogram') || text.includes('kg')) {
        result.unit = 'kg';
    } else if (text.includes('litar') || text.includes('l ')) {
        result.unit = 'l';
    } else if (text.includes('komad') || text.includes('kom')) {
        result.unit = 'kom';
    } else if (foundUnit) {
        result.unit = foundUnit;
    }
    
    let rokPronadjen = false;
    
    if (text.includes('šest') || text.includes('sest') || /\b6\b/.test(text)) {
        result.shelf_life = '6';
        rokPronadjen = true;
    }
    
    if (!rokPronadjen) {
        let meseciMatch = text.match(/(\d+)\s*meseci/);
        if (meseciMatch) {
            result.shelf_life = meseciMatch[1];
            rokPronadjen = true;
        }
    }
    
    if (!rokPronadjen && numbers.length >= 3) {
        result.shelf_life = numbers[2];
        rokPronadjen = true;
    }
    
    if (!rokPronadjen) {
        result.shelf_life = '6';
    }
    
    result.product_name = nameParts.join(' ').trim() || 'Proizvod';
    result.storage = foundStorage;
    
    console.log('✅ PARSIRANO:', result);
    return result;
}

// ============================================
// 6. POPUNJAVANJE FORME
// ============================================

function popuniFormuPodacima(data) {
    console.log('📝 Popunjavam formu:', data);
    
    try {
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
            shelfLifeInput.value = data.shelf_life || '6';
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
        
        console.log('✅ Forma popunjena:', data.product_name);
    } catch(e) {
        console.warn('popuniFormuPodacima greška:', e);
    }
}

// ============================================
// 7. ČUVANJE PODATAKA SA SABIRANJEM
// ============================================

function sacuvajPodatke(data) {
    console.log('💾 Čuvam podatke:', data);
    
    isVoiceInput = true;
    window._isVoiceInput = true;
    
    const originalShowModernAlert = window.showModernAlert;
    const originalAlert = window.alert;
    
    window.showModernAlert = function() {
        console.log('⛔ POP-UP ZABRANJEN (voice input)');
        return;
    };
    
    window.alert = function() {
        console.log('⛔ ALERT ZABRANJEN (voice input)');
        return;
    };
    
    if (typeof window.inventory === 'undefined' || !Array.isArray(window.inventory)) {
        window.inventory = [];
        console.log('📦 Inventory inicijalizovan');
    }
    
    let existingItem = null;
    let existingIndex = -1;
    
    for (let i = 0; i < window.inventory.length; i++) {
        const item = window.inventory[i];
        if (item.productName && 
            item.productName.toLowerCase() === data.product_name.toLowerCase() &&
            item.unit === data.unit &&
            item.storage === data.storage) {
            existingItem = item;
            existingIndex = i;
            break;
        }
    }
    
    if (existingItem) {
        const newQuantity = parseFloat(existingItem.quantity) + parseFloat(data.quantity);
        const newPiece = parseFloat(existingItem.piece) + parseFloat(data.piece);
        
        existingItem.quantity = newQuantity;
        existingItem.piece = newPiece;
        existingItem.shelfLife = parseInt(data.shelf_life) || 6;
        existingItem.expiryDate = new Date(Date.now() + parseInt(data.shelf_life || 6) * 30 * 24 * 60 * 60 * 1000).toISOString();
        existingItem.dateAdded = new Date().toISOString();
        
        window.inventory[existingIndex] = existingItem;
        console.log('✅ Sabrano sa postojećim:', existingItem);
        showVoiceStatus('✅ Sabrano: ' + data.product_name + ' (ukupno ' + newQuantity + ' ' + data.unit + ')', '#4CAF50');
    } else {
        const newItem = {
            id: Date.now(),
            productName: data.product_name,
            piece: parseFloat(data.piece) || 1,
            quantity: parseFloat(data.quantity) || 1,
            unit: data.unit || 'kom',
            shelfLife: parseInt(data.shelf_life) || 6,
            storage: data.storage || 'Zamrzivač 1',
            dateAdded: new Date().toISOString(),
            expiryDate: new Date(Date.now() + parseInt(data.shelf_life || 6) * 30 * 24 * 60 * 60 * 1000).toISOString(),
            isNew: true
        };
        window.inventory.push(newItem);
        console.log('✅ Dodat novi proizvod:', newItem);
        showVoiceStatus('✅ ' + getMessage('saving') + ' ' + data.product_name, '#4CAF50');
    }
    
    setTimeout(() => {
        refreshDisplay();
    }, 100);
    
    setTimeout(() => {
        window.showModernAlert = originalShowModernAlert;
        window.alert = originalAlert;
    }, 1000);
    
    setTimeout(() => {
        isVoiceInput = false;
        window._isVoiceInput = false;
    }, 1000);
}

// ============================================
// 8. PRIKAZ DATA ENTRY
// ============================================

function showDataEntry() {
    console.log('📝 Prikazujem data entry...');
    
    try {
        const dataEntryScreen = document.getElementById('dataEntryScreen');
        const mainScreen = document.getElementById('mainScreen');
        
        if (dataEntryScreen && dataEntryScreen.style.display !== 'flex') {
            const inventoryScreen = document.getElementById('inventoryScreen');
            if (inventoryScreen) {
                inventoryScreen.style.display = 'none';
                inventoryScreen.classList.remove('active');
            }
            
            dataEntryScreen.style.display = 'flex';
            dataEntryScreen.classList.add('active');
            console.log('✅ Data entry screen prikazan');
        } else if (mainScreen && mainScreen.style.display !== 'flex') {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
            console.log('✅ Main screen prikazan');
        }
        
        if (typeof renderDataEntry === 'function') {
            try { renderDataEntry(''); } catch(e) {}
        }
    } catch(e) {
        console.warn('showDataEntry greška:', e);
    }
}

// ============================================
// 9. OTVARANJE SPISKA
// ============================================

function otvoriSpisakEkran() {
    console.log('📋 Otvaram spisak...');
    
    try {
        document.querySelectorAll('.screen').forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });
        
        const inventoryScreen = document.getElementById('inventoryScreen');
        if (inventoryScreen) {
            inventoryScreen.style.display = 'flex';
            inventoryScreen.classList.add('active');
        }
        
        if (typeof refreshInventoryData === 'function') {
            try { refreshInventoryData(); } catch(e) {}
        }
        
        setTimeout(() => {
            refreshDisplay();
            if (typeof renderProductList === 'function') {
                try { renderProductList(); } catch(e) {}
            }
            showVoiceStatus('📋 Spisak otvoren', '#4CAF50');
        }, 200);
    } catch(e) {
        console.warn('otvoriSpisakEkran greška:', e);
    }
}

// ============================================
// 10. OTVARANJE ZALIHA
// ============================================

function otvoriZaliheEkran() {
    console.log('📦 Otvaram zalihe...');
    
    try {
        document.querySelectorAll('.screen').forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });
        
        const inventoryScreen = document.getElementById('inventoryScreen');
        if (inventoryScreen) {
            inventoryScreen.style.display = 'flex';
            inventoryScreen.classList.add('active');
        }
        
        setTimeout(() => {
            if (typeof prikaziSveUnose === 'function') {
                try { prikaziSveUnose(); } catch(e) {}
            }
            if (typeof renderInventory === 'function') {
                try { renderInventory(); } catch(e) {}
            }
            showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
        }, 200);
    } catch(e) {
        console.warn('otvoriZaliheEkran greška:', e);
    }
}

// ============================================
// 11. VOICE COMMAND
// ============================================

function voiceCommand(action) {
    console.log('🎤 VOICE COMMAND:', action);
    
    try {
        switch(action) {
            case 'add':
                showVoiceStatus('📝 ' + getMessage('add_mode'), '#4CAF50');
                hideVoiceMenu();
                showDataEntry();
                clearForm();
                isWaitingForNewEntry = false;
                activeBuffer = '';
                if (!recognition) {
                    setTimeout(() => startVoiceRecognition(), 300);
                }
                break;
                
            case 'list':
                showVoiceStatus('📋 ' + getMessage('list_mode'), '#4CAF50');
                stopVoiceRecognition();
                setTimeout(() => otvoriSpisakEkran(), 300);
                break;
                
            case 'stock':
                showVoiceStatus('📦 ' + getMessage('stock_mode'), '#4CAF50');
                stopVoiceRecognition();
                setTimeout(() => otvoriZaliheEkran(), 300);
                break;
                
            case 'close':
                showVoiceStatus('🔚 ' + getMessage('closing'), '#FF9800');
                stopVoiceRecognition();
                setTimeout(() => goBackFromVoice(), 300);
                break;
                
            default:
                showVoiceStatus('❌ ' + getMessage('not_recognized'), '#f44336');
        }
    } catch(e) {
        console.warn('voiceCommand greška:', e);
    }
}

// ============================================
// 12. OBRADA I ČUVANJE
// ============================================

function processAndSaveItem(command) {
    let data = parseVoiceDataEntry(command);
    if (!data.product_name || data.product_name === 'Proizvod' || data.product_name.length < 2) {
        console.warn('⚠️ Nije prepoznat naziv proizvoda:', command);
        showVoiceStatus('❌ Nisam prepoznao proizvod: "' + command + '"', '#f44336');
        return false;
    }
    
    console.log('📦 OBRADA:', data);
    lastSavedData = data;
    currentVoiceItem = data;
    
    popuniFormuPodacima(data);
    sacuvajPodatke(data);
    
    setTimeout(() => {
        refreshDisplay();
        setTimeout(() => {
            clearForm();
            isWaitingForNewEntry = true;
            showVoiceStatus('✅ ' + getMessage('saving') + ' ' + data.product_name + '. ' + getMessage('new_entry'), '#4CAF50');
            activeBuffer = '';
        }, 300);
    }, 200);

    return true;
}

// ============================================
// 13. HANDLER ZA PLUS - KONAČNO ISPRAVLJEN
// ============================================

function handlePlusCommand(buffer) {
    console.log('✅ PLUS DETEKTOVAN');
    
    if (isProcessingPlus) {
        console.log('⏳ Plus se već obrađuje...');
        return;
    }
    isProcessingPlus = true;
    isProcessingCommand = true;
    
    const parts = buffer.split(/\bplus\b/i);
    let itemText = parts[0].trim();
    itemText = itemText.replace(/^start\s*/i, '').trim();
    
    console.log('📝 Tekst za parsiranje:', itemText);
    
    if (itemText.length > 2) {
        const data = parseVoiceDataEntry(itemText);
        console.log('📦 Parsirani podaci:', data);
        
        if (data.product_name && data.product_name !== 'Proizvod' && data.product_name.length >= 2) {
            
            // 1. SAČUVAJ PODATKE
            if (typeof window.inventory === 'undefined' || !Array.isArray(window.inventory)) {
                window.inventory = [];
                console.log('📦 Inventory inicijalizovan');
            }
            
            let existingItem = null;
            let existingIndex = -1;
            
            for (let i = 0; i < window.inventory.length; i++) {
                const item = window.inventory[i];
                if (item.productName && 
                    item.productName.toLowerCase() === data.product_name.toLowerCase() &&
                    item.unit === data.unit &&
                    item.storage === data.storage) {
                    existingItem = item;
                    existingIndex = i;
                    break;
                }
            }
            
            if (existingItem) {
                const newQuantity = parseFloat(existingItem.quantity) + parseFloat(data.quantity);
                const newPiece = parseFloat(existingItem.piece) + parseFloat(data.piece);
                
                existingItem.quantity = newQuantity;
                existingItem.piece = newPiece;
                existingItem.shelfLife = parseInt(data.shelf_life) || 6;
                existingItem.expiryDate = new Date(Date.now() + parseInt(data.shelf_life || 6) * 30 * 24 * 60 * 60 * 1000).toISOString();
                existingItem.dateAdded = new Date().toISOString();
                
                window.inventory[existingIndex] = existingItem;
                console.log('✅ Sabrano sa postojećim:', existingItem);
                showVoiceStatus('✅ Sabrano: ' + data.product_name + ' (ukupno ' + newQuantity + ' ' + data.unit + ')', '#4CAF50');
            } else {
                const newItem = {
                    id: Date.now(),
                    productName: data.product_name,
                    piece: parseFloat(data.piece) || 1,
                    quantity: parseFloat(data.quantity) || 1,
                    unit: data.unit || 'kom',
                    shelfLife: parseInt(data.shelf_life) || 6,
                    storage: data.storage || 'Zamrzivač 1',
                    dateAdded: new Date().toISOString(),
                    expiryDate: new Date(Date.now() + parseInt(data.shelf_life || 6) * 30 * 24 * 60 * 60 * 1000).toISOString(),
                    isNew: true
                };
                window.inventory.push(newItem);
                console.log('✅ Dodat novi proizvod:', newItem);
                showVoiceStatus('✅ Sačuvano: ' + data.product_name, '#4CAF50');
            }
            
            // 2. POPUNI FORMU
            popuniFormuPodacima(data);
            
            // 3. OSVEŽI PRIKAZE
            setTimeout(() => {
                console.log('🔄 Osvežavam prikaze...');
                
                if (typeof prikaziSveUnose === 'function') {
                    try { 
                        prikaziSveUnose(); 
                        console.log('✅ prikaziSveUnose pozvan');
                    } catch(e) { 
                        console.warn('prikaziSveUnose greška:', e); 
                    }
                }
                
                if (typeof renderInventory === 'function') {
                    try { 
                        renderInventory(); 
                        console.log('✅ renderInventory pozvan');
                    } catch(e) { 
                        console.warn('renderInventory greška:', e); 
                    }
                }
                
            }, 200);
            
            // 4. OČISTI FORMU
            setTimeout(() => {
                clearForm();
                showVoiceStatus('✅ Sačuvano: ' + data.product_name + '. Unesite sledeći proizvod...', '#4CAF50');
                activeBuffer = '';
                isProcessingCommand = false;
                isProcessingPlus = false;
            }, 1200);
            
        } else {
            showVoiceStatus('❌ Nisam prepoznao proizvod: "' + itemText + '"', '#f44336');
            isProcessingCommand = false;
            isProcessingPlus = false;
            activeBuffer = '';
        }
    } else {
        showVoiceStatus('⚠️ Nema podataka za čuvanje.', '#FF9800');
        isProcessingCommand = false;
        isProcessingPlus = false;
        activeBuffer = '';
    }
    
    activeBuffer = '';
}

// ============================================
// 14. HANDLER ZA END
// ============================================

function handleEndCommand(buffer) {
    console.log('🏁 END DETEKTOVAN');
    isProcessingCommand = true;
    
    let itemText = buffer;
    const endWords = ['end', 'kraj', 'gotovo'];
    for (let word of endWords) {
        if (itemText.toLowerCase().includes(word)) {
            const parts = itemText.split(new RegExp(word, 'i'));
            itemText = parts[0].trim();
            break;
        }
    }
    
    itemText = itemText.replace(/^start\s*/i, '').trim();
    
    if (itemText.length > 2) {
        const data = parseVoiceDataEntry(itemText);
        if (data.product_name && data.product_name !== 'Proizvod' && data.product_name.length >= 2) {
            popuniFormuPodacima(data);
            sacuvajPodatke(data);
        }
    }
    
    activeBuffer = '';
    
    setTimeout(() => {
        if (recognition) {
            try {
                recognition.stop();
                recognition = null;
            } catch(e) {}
        }
        otvoriZaliheEkran();
        isProcessingCommand = false;
    }, 400);
}

// ============================================
// 15. PROCESIRANJE VOICE INPUTA
// ============================================

function processVoiceInput(buffer) {
    if (!buffer || buffer.trim().length === 0) return;
    if (isProcessingPlus) return;
    
    const lowerFull = buffer.toLowerCase();
    console.log('🔍 PROCESIRAM:', lowerFull);
    
    if (lowerFull.includes('plus')) {
        handlePlusCommand(buffer);
        return;
    }
    
    if (lowerFull.includes('end') || lowerFull.includes('kraj') || lowerFull.includes('gotovo')) {
        handleEndCommand(buffer);
        return;
    }
    
    const command = detectVoiceCommand(buffer);
    if (command) {
        console.log('🎯 DETEKTOVANA KOMANDA:', command);
        isProcessingCommand = true;
        
        if (command === 'add') {
            let itemText = buffer;
            const addKeywords = getVoiceCommands().add || [];
            for (let word of addKeywords) {
                if (itemText.toLowerCase().includes(word.toLowerCase())) {
                    const parts = itemText.split(new RegExp(word, 'i'));
                    itemText = parts.slice(1).join(' ').trim();
                    break;
                }
            }
            
            itemText = itemText.replace(/^start\s*/i, '').trim();
            itemText = itemText.replace(/^šta\s*/i, '').trim();
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            } else {
                voiceCommand('add');
                isProcessingCommand = false;
            }
            activeBuffer = '';
            setTimeout(() => {
                isProcessingCommand = false;
            }, 500);
            return;
        }
        
        voiceCommand(command);
        activeBuffer = '';
        setTimeout(() => {
            isProcessingCommand = false;
        }, 500);
        return;
    }
}

// ============================================
// 16. STOP VOICE RECOGNITION
// ============================================

function stopVoiceRecognition() {
    console.log('⏹️ Zaustavljam voice recognition...');
    if (recognition) {
        try {
            recognition.stop();
        } catch(e) {
            console.warn('stopVoiceRecognition greška:', e);
        }
    }
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        speechTimeout = null;
    }
    activeBuffer = '';
    isProcessingCommand = false;
}

// ============================================
// 17. GO BACK FROM VOICE
// ============================================

function goBackFromVoice() {
    console.log('◀ goBackFromVoice POZVAN!');
    stopVoiceRecognition();
    
    if (recognition) {
        try {
            recognition.stop();
        } catch(e) {}
        recognition = null;
    }
    
    try {
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
    } catch(e) {
        console.warn('goBackFromVoice greška:', e);
    }
}

// ============================================
// 18. SELECT VOICE MODE
// ============================================

function selectVoiceMode() {
    console.log('🎤 selectVoiceMode POZVAN!');
    
    try {
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
    } catch(e) {
        console.warn('selectVoiceMode greška:', e);
    }
    
    setTimeout(function() {
        console.log('🎤 Pokrećem VOICE COMMANDS...');
        startVoiceRecognition();
    }, 500);
}

// ============================================
// 19. START VOICE RECOGNITION
// ============================================

function startVoiceRecognition() {
    console.log('🎤 startVoiceRecognition POZVAN!');
    
    if (recognition) {
        console.log('🎤 Recognition već postoji.');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showVoiceStatus('❌ Browser ne podržava glasovno prepoznavanje.', '#f44336');
        return;
    }

    recognition = new SpeechRecognition();
    const lang = getCurrentLang();
    
    const speechLangMap = {
        sr: 'sr-RS', en: 'en-US', de: 'de-DE', hu: 'hu-HU',
        uk: 'uk-UA', ru: 'ru-RU', zh: 'zh-CN', es: 'es-ES',
        pt: 'pt-PT', fr: 'fr-FR'
    };
    
    recognition.lang = speechLangMap[lang] || 'sr-RS';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    isProcessingCommand = false;
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        speechTimeout = null;
    }

    recognition.onstart = function() {
        console.log('🎤 MIKROFON AKTIVAN!');
        const msg = getMessage('welcome');
        showVoiceStatus('🎤 ' + msg, '#2196F3');
        activeBuffer = '';
        isProcessingCommand = false;
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
        const listeningMsg = getMessage('listening');
        showVoiceStatus('🎤 ' + listeningMsg + ' "' + currentDisplay + '"', '#FFD700');
        
        if (isProcessingCommand || isProcessingPlus) return;
        
        if (speechTimeout) {
            clearTimeout(speechTimeout);
        }
        speechTimeout = setTimeout(() => {
            processVoiceInput(activeBuffer);
        }, 500);
    };

    recognition.onerror = function(event) {
        console.error('⚠️ Speech Recognition greška:', event.error);
        if (event.error === 'not-allowed') {
            showVoiceStatus('❌ Dozvolite pristup mikrofonu.', '#f44336');
        } else if (event.error === 'no-speech') {
            console.log('⏳ Nema govora, čekam...');
        } else if (event.error === 'audio-capture') {
            console.warn('⚠️ Problem sa mikrofonom...');
            recognition = null;
            setTimeout(() => {
                startVoiceRecognition();
            }, 2000);
        }
        isProcessingCommand = false;
    };

    recognition.onend = function() {
        console.log('🎤 Glasovno prepoznavanje završeno.');
        if (speechTimeout) {
            clearTimeout(speechTimeout);
            speechTimeout = null;
        }
        
        const dataEntryScreen = document.getElementById('dataEntryScreen');
        const mainScreen = document.getElementById('mainScreen');
        
        if ((dataEntryScreen && dataEntryScreen.style.display === 'flex') ||
            (mainScreen && mainScreen.style.display === 'flex')) {
            if (!isProcessingPlus && !isProcessingCommand && !recognition) {
                console.log('🔄 Restartujem recognition za 2 sekunde...');
                setTimeout(() => {
                    if (!recognition && !isProcessingPlus) {
                        startVoiceRecognition();
                    }
                }, 2000);
            }
        }
    };

    try {
        recognition.start();
        console.log('✅ Mikrofon pokrenut!');
        const msg = getMessage('welcome');
        showVoiceStatus('🎤 ' + msg, '#2196F3');
    } catch(e) {
        console.error('❌ Greška pri pokretanju:', e);
        showVoiceStatus('❌ Greška pri pokretanju mikrofona', '#f44336');
        recognition = null;
    }
}

// ============================================
// 20. RESTART MIKROFONA
// ============================================

function restartMicrophone() {
    console.log('🔄 Restartujem mikrofon...');
    if (recognition) {
        try {
            recognition.stop();
        } catch(e) {}
        recognition = null;
    }
    isRestarting = false;
    activeBuffer = '';
    isProcessingCommand = false;
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        speechTimeout = null;
    }
    setTimeout(() => {
        startVoiceRecognition();
    }, 500);
}

// ============================================
// 21. PRIKAZ UNOSA - DIREKTNA IMPLEMENTACIJA
// ============================================

function prikaziSveUnose() {
    console.log('📋 Prikazujem sve unose...');
    
    try {
        let container = document.getElementById('entriesContainer');
        
        if (!container) {
            container = document.getElementById('entryList');
        }
        if (!container) {
            container = document.getElementById('productList');
        }
        if (!container) {
            container = document.getElementById('inventoryList');
        }
        
        if (!container) {
            console.warn('⚠️ Nema kontejnera za prikaz unosa!');
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                container = document.createElement('div');
                container.id = 'entriesContainer';
                container.style.cssText = 'padding: 10px; max-height: 300px; overflow-y: auto; background: #1a1a2e; border-radius: 8px; margin-top: 10px;';
                mainScreen.appendChild(container);
                console.log('✅ Kreiran entriesContainer');
            }
        }
        
        if (!container) {
            console.warn('⚠️ Ne mogu da pronađem ili kreiram kontejner!');
            return;
        }
        
        if (!window.inventory || window.inventory.length === 0) {
            container.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">📭 Nema unosa</div>';
            console.log('📭 Nema unosa za prikaz');
            return;
        }
        
        let html = '<div style="font-size: 0.9rem;">';
        html += `<div style="color: #4CAF50; font-weight: bold; padding: 8px; border-bottom: 2px solid #4CAF50; margin-bottom: 8px;">
            📦 Ukupno: ${window.inventory.length} stavki
        </div>`;
        
        window.inventory.forEach((item) => {
            html += `
                <div style="border-bottom: 1px solid #333; padding: 6px 0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="color: #fff;">${item.productName || 'Nepoznat'}</strong>
                        <span style="color: #aaa; font-size: 0.85rem; margin-left: 8px;">
                            ${item.quantity || 0} ${item.unit || 'kom'} 
                            (${item.piece || 0} kom)
                        </span>
                    </div>
                    <div style="color: #888; font-size: 0.75rem;">
                        📅 ${item.shelfLife || 6}m | 📦 ${item.storage || 'Zamrzivač 1'}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
        console.log('✅ Prikazano', window.inventory.length, 'unosa');
        
    } catch(e) {
        console.warn('prikaziSveUnose greška:', e);
    }
}

// ============================================
// 22. PRIKAZ ZALIHA - DIREKTNA IMPLEMENTACIJA
// ============================================

function renderInventory() {
    console.log('📦 Prikazujem zalihe...');
    
    try {
        let container = document.getElementById('inventoryContainer');
        
        if (!container) {
            container = document.getElementById('inventoryList');
        }
        if (!container) {
            container = document.getElementById('stockList');
        }
        
        if (!container) {
            console.warn('⚠️ Nema kontejnera za prikaz zaliha!');
            const inventoryScreen = document.getElementById('inventoryScreen');
            if (inventoryScreen) {
                container = document.createElement('div');
                container.id = 'inventoryContainer';
                container.style.cssText = 'padding: 10px; max-height: 400px; overflow-y: auto;';
                inventoryScreen.appendChild(container);
                console.log('✅ Kreiran inventoryContainer');
            }
        }
        
        if (!container) {
            console.warn('⚠️ Ne mogu da pronađem ili kreiram inventoryContainer!');
            return;
        }
        
        if (!window.inventory || window.inventory.length === 0) {
            container.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">📭 Nema zaliha</div>';
            console.log('📭 Nema zaliha za prikaz');
            return;
        }
        
        const grouped = {};
        window.inventory.forEach(item => {
            const key = `${item.productName}|${item.storage}`;
            if (!grouped[key]) {
                grouped[key] = {
                    productName: item.productName,
                    storage: item.storage,
                    unit: item.unit || 'kom',
                    quantity: 0,
                    piece: 0,
                    shelfLife: item.shelfLife || 6
                };
            }
            grouped[key].quantity += parseFloat(item.quantity) || 0;
            grouped[key].piece += parseFloat(item.piece) || 0;
        });
        
        let html = '<div style="font-size: 0.9rem;">';
        html += `<div style="color: #FF9800; font-weight: bold; padding: 8px; border-bottom: 2px solid #FF9800; margin-bottom: 8px;">
            📦 Zalihe (${Object.keys(grouped).length} proizvoda)
        </div>`;
        
        Object.values(grouped).forEach(item => {
            html += `
                <div style="border-bottom: 1px solid #333; padding: 6px 0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="color: #fff;">${item.productName}</strong>
                        <span style="color: #aaa; font-size: 0.85rem; margin-left: 8px;">
                            ${item.quantity} ${item.unit}
                        </span>
                    </div>
                    <div style="color: #888; font-size: 0.75rem;">
                        📦 ${item.storage} | 📅 ${item.shelfLife}m
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
        console.log('✅ Prikazano', Object.keys(grouped).length, 'zaliha');
        
    } catch(e) {
        console.warn('renderInventory greška:', e);
    }
}

// ============================================
// 23. PERIODIČNA PROVERA MIKROFONA
// ============================================

function ensureMicrophoneRunning() {
    if (!recognition && !isProcessingPlus) {
        const dataEntryScreen = document.getElementById('dataEntryScreen');
        const mainScreen = document.getElementById('mainScreen');
        
        if ((dataEntryScreen && dataEntryScreen.style.display === 'flex') ||
            (mainScreen && mainScreen.style.display === 'flex')) {
            console.log('🔄 Mikrofon nije aktivan, restartujem...');
            startVoiceRecognition();
            return true;
        }
    }
    return false;
}

setInterval(() => {
    ensureMicrophoneRunning();
}, 8000);

// ============================================
// 24. IZVOZ SVIH FUNKCIJA
// ============================================

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.processAndSaveItem = processAndSaveItem;
window.popuniFormuPodacima = popuniFormuPodacima;
window.otvoriZaliheEkran = otvoriZaliheEkran;
window.otvoriSpisakEkran = otvoriSpisakEkran;
window.sacuvajPodatke = sacuvajPodatke;
window.selectVoiceMode = selectVoiceMode;
window.restartMicrophone = restartMicrophone;
window.voiceCommand = voiceCommand;
window.detectVoiceCommand = detectVoiceCommand;
window.getCurrentLang = getCurrentLang;
window.getMessage = getMessage;
window.VOICE_COMMANDS = VOICE_COMMANDS;
window.VOICE_MESSAGES = VOICE_MESSAGES;
window.BUTTON_LABELS = BUTTON_LABELS;
window.clearForm = clearForm;
window.showDataEntry = showDataEntry;
window.refreshDisplay = refreshDisplay;
window.handlePlusCommand = handlePlusCommand;
window.handleEndCommand = handleEndCommand;
window.processVoiceInput = processVoiceInput;
window.ensureMicrophoneRunning = ensureMicrophoneRunning;
window.prikaziSveUnose = prikaziSveUnose;
window.renderInventory = renderInventory;

console.log('✅ VOICE COMMANDS - KOMPLETAN RADNI KOD (KONAČNO ISPRAVLJEN)!');
console.log('🎤 4 opcije: "DODAJ", "SPISAK", "ZALIHE", "EXIT"');
console.log('📝 DODAJ → unos podataka → PLUS za čuvanje (ostaje na ekranu)');
console.log('🏁 END → čuva podatke i otvara zalihe');
console.log('🌍 Podržani jezici:', SUPPORTED_LANGUAGES.join(', '));
