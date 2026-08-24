// ============================================
// VOICE COMMANDS - ISPRAVLJENA VERZIJA
// ============================================

let activeBuffer = ''; 
let recognition = null;
let lastSavedData = null;
let isProcessingCommand = false;
let END_AKTIVAN = false;
let isVoiceInput = false;
let currentVoiceItem = null;
let isWaitingForNewEntry = false;

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
    
    currentVoiceItem = null;
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
        .replace(/^dodaj\s*/i, '')
        .replace(/^unos\s*/i, '')
        .replace(/^unesi\s*/i, '')
        .replace(/^add\s*/i, '')
        .replace(/^new\s*/i, '')
        .replace(/^enter\s*/i, '')
        .replace(/^adatbevitel\s*/i, '')
        .replace(/^hinzufügen\s*/i, '')
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
}

// ============================================
// 7. ČUVANJE PODATAKA - ISPRAVLJENO
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
    
    // 🔥 1. PRONAĐI PRAVI INVENTAR
    let mainInventory = null;
    let inventorySource = 'unknown';
    
    // Proveri sve moguće lokacije
    if (typeof window.inventory !== 'undefined' && Array.isArray(window.inventory)) {
        mainInventory = window.inventory;
        inventorySource = 'window.inventory';
    } else if (typeof window.inventoryData !== 'undefined' && Array.isArray(window.inventoryData)) {
        mainInventory = window.inventoryData;
        inventorySource = 'window.inventoryData';
    } else if (typeof window.products !== 'undefined' && Array.isArray(window.products)) {
        mainInventory = window.products;
        inventorySource = 'window.products';
    } else if (typeof window.items !== 'undefined' && Array.isArray(window.items)) {
        mainInventory = window.items;
        inventorySource = 'window.items';
    } else if (typeof window.productList !== 'undefined' && Array.isArray(window.productList)) {
        mainInventory = window.productList;
        inventorySource = 'window.productList';
    } else if (typeof window.stock !== 'undefined' && Array.isArray(window.stock)) {
        mainInventory = window.stock;
        inventorySource = 'window.stock';
    } else {
        // Ako nema inventara, kreiraj ga
        console.log('📦 Kreiram novi window.inventory');
        window.inventory = [];
        mainInventory = window.inventory;
        inventorySource = 'window.inventory (novi)';
    }
    
    console.log(`📦 Koristim: ${inventorySource}, trenutno ${mainInventory ? mainInventory.length : 0} stavki`);
    
    // 🔥 2. PROVERI DA LI PROIZVOD VEĆ POSTOJI
    let existingItem = null;
    let existingIndex = -1;
    
    if (mainInventory) {
        for (let i = 0; i < mainInventory.length; i++) {
            const item = mainInventory[i];
            if (item && 
                item.productName && 
                item.productName.toLowerCase() === data.product_name.toLowerCase() &&
                item.unit === data.unit &&
                item.storage === data.storage) {
                existingItem = item;
                existingIndex = i;
                break;
            }
        }
    }
    
    // 🔥 3. DODAJ ILI SABERI PROIZVOD
    if (existingItem && existingIndex > -1) {
        // Postoji - saberi
        const newQuantity = parseFloat(existingItem.quantity) + parseFloat(data.quantity);
        const newPiece = parseFloat(existingItem.piece) + parseFloat(data.piece);
        
        existingItem.quantity = newQuantity;
        existingItem.piece = newPiece;
        existingItem.shelfLife = parseInt(data.shelf_life) || 6;
        existingItem.expiryDate = new Date(Date.now() + parseInt(data.shelf_life || 6) * 30 * 24 * 60 * 60 * 1000).toISOString();
        existingItem.dateAdded = new Date().toISOString();
        
        if (mainInventory) {
            mainInventory[existingIndex] = existingItem;
        }
        
        console.log('✅ Sabrano sa postojećim:', existingItem);
        showVoiceStatus('✅ Sabrano: ' + data.product_name + ' (ukupno ' + newQuantity + ' ' + data.unit + ')', '#4CAF50');
    } else {
        // Novi proizvod
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
        
        if (mainInventory) {
            mainInventory.push(newItem);
        }
        
        console.log('✅ Dodat novi proizvod:', newItem);
        showVoiceStatus('✅ ' + getMessage('saving') + ' ' + data.product_name, '#4CAF50');
    }
    
    // 🔥 4. OSVEŽI SVE PRIKAZE
    setTimeout(() => {
        console.log('🔄 Osvežavam prikaze...');
        
        // Pokušaj sve moguće funkcije za osvežavanje
        const refreshFunctions = [
            'prikaziSveUnose',
            'renderInventory', 
            'updateInventory',
            'renderProductList',
            'refreshInventoryData',
            'renderDataEntry',
            'showInventory',
            'updateProductList',
            'refreshData',
            'osveziInventar',
            'prikaziInventar'
        ];
        
        let refreshCount = 0;
        refreshFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                try {
                    window[funcName]();
                    console.log(`✅ ${funcName} pozvan`);
                    refreshCount++;
                } catch(e) {
                    console.log(`⚠️ ${funcName} greška:`, e.message);
                }
            }
        });
        
        // Pokušaj i direktno preko globalnih funkcija
        if (typeof prikaziSveUnose === 'function') {
            try { prikaziSveUnose(); refreshCount++; console.log('✅ prikaziSveUnose (direktno)'); } catch(e) {}
        }
        if (typeof renderInventory === 'function') {
            try { renderInventory(); refreshCount++; console.log('✅ renderInventory (direktno)'); } catch(e) {}
        }
        
        console.log(`✅ Osveženo ${refreshCount} prikaza`);
        
        if (refreshCount === 0) {
            console.warn('⚠️ Nema funkcija za osvežavanje!');
            console.log('📋 Dostupne funkcije:', Object.keys(window).filter(k => typeof window[k] === 'function').join(', '));
        }
        
    }, 200);
    
    // 🔥 5. RESTORE ORIGINALNIH FUNKCIJA
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
// 8. OSVEŽAVANJE PODATAKA
// ============================================

function osveziSvePrikaze() {
    console.log('🔄 Osvežavam sve prikaze...');
    
    const functions = [
        'prikaziSveUnose',
        'renderInventory', 
        'updateInventory',
        'renderProductList',
        'refreshInventoryData',
        'renderDataEntry',
        'showInventory',
        'updateProductList',
        'refreshData',
        'osveziInventar',
        'prikaziInventar'
    ];
    
    let count = 0;
    functions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            try {
                window[funcName]();
                console.log(`✅ ${funcName} pozvan`);
                count++;
            } catch(e) {
                console.log(`⚠️ ${funcName} greška`);
            }
        }
    });
    
    // Direktni pozivi
    if (typeof prikaziSveUnose === 'function') {
        try { prikaziSveUnose(); count++; console.log('✅ prikaziSveUnose (direktno)'); } catch(e) {}
    }
    if (typeof renderInventory === 'function') {
        try { renderInventory(); count++; console.log('✅ renderInventory (direktno)'); } catch(e) {}
    }
    
    console.log(`✅ Osveženo ${count} prikaza`);
    return count;
}

// ============================================
// 9. POPUNI FORMU I SAČUVAJ
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
    
    // 🔥 PRVO POPUNI FORMU
    popuniFormuPodacima(data);
    
    // 🔥 ONDA SAČUVAJ
    sacuvajPodatke(data);
    
    // 🔥 ONDA OSVEŽI SVE
    setTimeout(() => {
        osveziSvePrikaze();
        showVoiceStatus('✅ ' + getMessage('saving') + ' ' + data.product_name + '. ' + getMessage('new_entry'), '#4CAF50');
        activeBuffer = '';
        isWaitingForNewEntry = true;
    }, 500);

    return true;
}

// ============================================
// 10. VOICE COMMAND
// ============================================

function voiceCommand(action) {
    console.log('🎤 VOICE COMMAND:', action);
    
    switch(action) {
        case 'add':
            showVoiceStatus('📝 ' + getMessage('add_mode'), '#4CAF50');
            hideVoiceMenu();
            showDataEntry();
            clearForm();
            isWaitingForNewEntry = false;
            activeBuffer = '';
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
}

// ============================================
// 11. STOP VOICE RECOGNITION
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
}

// ============================================
// 12. GO BACK FROM VOICE
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
// 13. SELECT VOICE MODE
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
// 14. START VOICE RECOGNITION
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

    END_AKTIVAN = false;
    isProcessingCommand = false;

    recognition.onstart = function() {
        console.log('🎤 MIKROFON AKTIVAN!');
        const msg = getMessage('welcome');
        showVoiceStatus('🎤 ' + msg, '#2196F3');
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
        const listeningMsg = getMessage('listening');
        showVoiceStatus('🎤 ' + listeningMsg + ' "' + currentDisplay + '"', '#FFD700');
        
        if (isProcessingCommand) return;
        
        const lowerFull = activeBuffer.toLowerCase();
        console.log('🔍 PROVERAVAM CELI BAFER:', lowerFull);
        
        // ============================================
        // DETEKTUJ KOMANDU
        // ============================================
        const command = detectVoiceCommand(activeBuffer);
        
        if (command) {
            console.log('🎯 DETEKTOVANA KOMANDA:', command);
            isProcessingCommand = true;
            
            if (command === 'add') {
                let itemText = activeBuffer;
                const addKeywords = getVoiceCommands().add || [];
                for (let word of addKeywords) {
                    if (itemText.toLowerCase().includes(word.toLowerCase())) {
                        const parts = itemText.split(new RegExp(word, 'i'));
                        itemText = parts.slice(1).join(' ').trim();
                        break;
                    }
                }
                
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
        
        // ============================================
        // PLUS - SAČUVA I OSTANE NA EKRANU
        // ============================================
        if (lowerFull.includes('plus')) {
            console.log('✅ PLUS DETEKTOVAN');
            isProcessingCommand = true;
            
            let parts = activeBuffer.split(/\bplus\b/i);
            let itemText = parts[0].trim();
            
            if (itemText.length > 2) {
                let data = parseVoiceDataEntry(itemText);
                if (data.product_name && data.product_name !== 'Proizvod' && data.product_name.length >= 2) {
                    // 1. Popuni formu
                    popuniFormuPodacima(data);
                    // 2. Sačuvaj
                    sacuvajPodatke(data);
                    // 3. Osveži prikaze
                    setTimeout(() => {
                        osveziSvePrikaze();
                        // 🔥 FORMA OSTAJE POPUNJENA - NE BRIŠEMO!
                        showVoiceStatus('✅ Sačuvano: ' + data.product_name + '. Unesite sledeći proizvod...', '#4CAF50');
                        activeBuffer = '';
                        isWaitingForNewEntry = true;
                    }, 300);
                } else {
                    showVoiceStatus('⚠️ Nisam prepoznao proizvod.', '#FF9800');
                    isProcessingCommand = false;
                    activeBuffer = '';
                    return;
                }
            } else {
                showVoiceStatus('⚠️ Nema podataka za čuvanje. Izgovorite naziv proizvoda.', '#FF9800');
                isProcessingCommand = false;
                activeBuffer = '';
                return;
            }
            
            activeBuffer = '';
            setTimeout(() => {
                isProcessingCommand = false;
            }, 500);
            return;
        }
        
        // ============================================
        // END - SAČUVA I OTVARA ZALIHE
        // ============================================
        if (lowerFull.includes('end') || lowerFull.includes('kraj') || lowerFull.includes('gotovo')) {
            console.log('🏁 END DETEKTOVAN');
            isProcessingCommand = true;
            
            let itemText = activeBuffer;
            const endWords = ['end', 'kraj', 'gotovo'];
            for (let word of endWords) {
                if (itemText.toLowerCase().includes(word)) {
                    const parts = itemText.split(new RegExp(word, 'i'));
                    itemText = parts[0].trim();
                    break;
                }
            }
            
            // 🔥 SAČUVAJ POSLEDNJI PROIZVOD AKO POSTOJI
            if (itemText.length > 2) {
                let data = parseVoiceDataEntry(itemText);
                if (data.product_name && data.product_name !== 'Proizvod' && data.product_name.length >= 2) {
                    popuniFormuPodacima(data);
                    sacuvajPodatke(data);
                }
            }
            
            activeBuffer = '';
            
            // 🔥 ZATIM OTVORI ZALIHE
            setTimeout(() => {
                stopVoiceRecognition();
                setTimeout(() => {
                    osveziSvePrikaze();
                    otvoriZaliheEkran();
                    showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
                }, 500);
            }, 300);
            return;
        }
    };

    recognition.onerror = function(event) {
        console.error('⚠️ Speech Recognition greška:', event.error);
        if (event.error === 'not-allowed') {
            showVoiceStatus('❌ Dozvolite pristup mikrofonu.', '#f44336');
        } else if (event.error === 'no-speech') {
            showVoiceStatus('⚠️ Nisam čuo govor. Pokušajte ponovo.', '#FF9800');
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
        const msg = getMessage('welcome');
        showVoiceStatus('🎤 ' + msg, '#2196F3');
    } catch(e) {
        console.error('❌ Greška pri pokretanju:', e);
        showVoiceStatus('❌ Greška pri pokretanju mikrofona', '#f44336');
    }
}

// ============================================
// 15. RESTART MIKROFONA
// ============================================

function restartMicrophone() {
    console.log('🔄 Restartujem mikrofon...');
    stopVoiceRecognition();
    setTimeout(() => {
        startVoiceRecognition();
    }, 500);
}

// ============================================
// 16. BLOKIRANJE
// ============================================

(function() {
    console.log('🔥 BLOKIRAM OTVARANJE ZALIHA IZ VOICE KOMANDI!');
    
    const originalRenderInventory = window.renderInventory;
    const originalShowScreen = window.showScreen;
    const originalOpenInventory = window.openInventoryAndShowHighlight;
    
    window.renderInventory = function() {
        const stack = new Error().stack || '';
        const allowed = ['goBackFromVoice', 'selectVoiceMode', 'otvoriZaliheEkran', 'otvoriSpisakEkran', 'startVoiceRecognition', 'voiceCommand'];
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
        const allowed = ['goBackFromVoice', 'selectVoiceMode', 'otvoriZaliheEkran', 'otvoriSpisakEkran', 'startVoiceRecognition', 'voiceCommand'];
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
        const allowed = ['goBackFromVoice', 'selectVoiceMode', 'otvoriZaliheEkran', 'otvoriSpisakEkran', 'startVoiceRecognition', 'voiceCommand'];
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
})();

// ============================================
// 17. IZVOZ SVIH FUNKCIJA
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
window.osveziSvePrikaze = osveziSvePrikaze;
window.VOICE_COMMANDS = VOICE_COMMANDS;
window.VOICE_MESSAGES = VOICE_MESSAGES;
window.BUTTON_LABELS = BUTTON_LABELS;
window.clearForm = clearForm;
window.showDataEntry = showDataEntry;

console.log('✅ VOICE COMMANDS - ISPRAVLJENA VERZIJA!');
console.log('🎤 4 opcije: "DODAJ", "SPISAK", "ZALIHE", "EXIT"');
console.log('📝 DODAJ → unos podataka → PLUS za čuvanje (FORMA OSTJE POPUNJENA)');
console.log('🏁 END → sačuva i otvara zalihe');
console.log('📦 INVENTAR:', window.inventory ? `${window.inventory.length} stavki` : 'NEMA INVENTARA');
console.log('📋 Dostupne funkcije za osvežavanje:', Object.keys(window).filter(k => 
    ['prikaziSveUnose', 'renderInventory', 'updateInventory', 'renderProductList', 'refreshInventoryData', 'renderDataEntry'].includes(k)
).join(', '));
