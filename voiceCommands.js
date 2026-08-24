// ============================================
// VOICE COMMANDS - FULL MULTI-LANG SENIOR ENGINE
// ============================================

// Singleton stanje za sprečavanje dupliranja mikrofona i utrke tajmera (Race Conditions)
const VoiceState = {
    activeBuffer: '',
    recognition: null,
    isProcessing: false,
    speechTimeout: null,
    restartTimer: null,
    isVoiceInput: false
};

// ============================================
// 1. SVI JEZICI (KOMPLETNE MAPE)
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
    sr: { welcome: 'Izgovorite: "DODAJ", "SPISAK", "ZALIHE" ili "EXIT"', listening: 'Slušam...', add_mode: 'Otvaram unos... Izgovorite naziv proizvoda', list_mode: 'Otvaram spisak...', stock_mode: 'Otvaram zalihe...', closing: 'Zatvaram glasovni meni...', not_recognized: 'Nisam prepoznao. Izgovorite: DODAJ, SPISAK, ZALIHE ili EXIT', saving: 'Sačuvano: ', new_entry: 'Unesite sledeći proizvod...' },
    en: { welcome: 'Say: "ADD", "LIST", "STOCK" or "EXIT"', listening: 'Listening...', add_mode: 'Opening entry... Say product name', list_mode: 'Opening list...', stock_mode: 'Opening stock...', closing: 'Closing voice menu...', not_recognized: 'Not recognized. Say: ADD, LIST, STOCK or EXIT', saving: 'Saved: ', new_entry: 'Enter next product...' },
    de: { welcome: 'Sagen Sie: "HINZUFÜGEN", "LISTE", "BESTAND" oder "EXIT"', listening: 'Höre zu...', add_mode: 'Öffne Eingabe... Sagen Sie Produktname', list_mode: 'Öffne Liste...', stock_mode: 'Öffne Bestand...', closing: 'Sprachmenü schließen...', not_recognized: 'Nicht erkannt.', saving: 'Gespeichert: ', new_entry: 'Nächstes Produkt eingeben...' },
    hu: { welcome: 'Mondja: "ADATBEVITEL", "LISTA", "KÉSZLET" vagy "EXIT"', listening: 'Hallgatom...', add_mode: 'Bevitel nyitása... Mondja a termék nevét', list_mode: 'Lista megnyitása...', stock_mode: 'Készlet megnyitása...', closing: 'Hangmenü bezárása...', not_recognized: 'Nem ismert.', saving: 'Mentve: ', new_entry: 'Következő termék megadása...' },
    uk: { welcome: 'Скажіть: "ДОДАТИ", "СПИСОК", "ЗАПАСИ" або "EXIT"', listening: 'Слухаю...', add_mode: 'Відкриваю введення...', list_mode: 'Відкриваю список...', stock_mode: 'Відкриваю запаси...', closing: 'Закриваю голосове меню...', not_recognized: 'Не розпізнано.', saving: 'Збережено: ', new_entry: 'Введіть наступний продукт...' },
    ru: { welcome: 'Скажите: "ДОБАВИТЬ", "СПИСОК", "ЗАПАСЫ" или "EXIT"', listening: 'Слушаю...', add_mode: 'Открываю ввод...', list_mode: 'Открываю список...', stock_mode: 'Открываю запасы...', closing: 'Закрываю голосовое меню...', not_recognized: 'Не распознано.', saving: 'Сохранено: ', new_entry: 'Введите следующий продукт...' },
    zh: { welcome: '请说："添加", "列表", "库存" 或 "EXIT"', listening: '正在听...', add_mode: '打开输入...', list_mode: '打开列表...', stock_mode: '打开库存...', closing: '关闭语音菜单...', not_recognized: '无法识别。', saving: '已保存：', new_entry: '输入下一个产品...' },
    es: { welcome: 'Diga: "AÑADIR", "LISTA", "EXISTENCIAS" o "EXIT"', listening: 'Escuchando...', add_mode: 'Abriendo entrada...', list_mode: 'Abriendo lista...', stock_mode: 'Abriendo existencias...', closing: 'Cerrando menú de voz...', not_recognized: 'No reconocido.', saving: 'Guardado: ', new_entry: 'Ingrese el siguiente producto...' },
    pt: { welcome: 'Diga: "ADICIONAR", "LISTA", "ESTOQUE" ou "EXIT"', listening: 'Ouvindo...', add_mode: 'Abrindo entrada...', list_mode: 'Abrindo lista...', stock_mode: 'Abrindo estoque...', closing: 'Fechando menu de voz...', not_recognized: 'Não reconhecido.', saving: 'Salvo: ', new_entry: 'Insira o próximo produto...' },
    fr: { welcome: 'Dites: "AJOUTER", "LISTE", "STOCK" ou "EXIT"', listening: 'Écoute...', add_mode: 'Ouverture de la saisie...', list_mode: 'Ouverture de la liste...', stock_mode: 'Ouverture du stock...', closing: 'Fermeture du menu vocal...', not_recognized: 'Non reconnu.', saving: 'Enregistré: ', new_entry: 'Entrez le prochain produit...' }
};

const NUMBER_WORDS = {
    'nula': '0', 'jedan': '1', 'jedna': '1', 'jedno': '1',
    'dva': '2', 'dve': '2', 'tri': '3', 'četiri': '4', 'cetiri': '4',
    'pet': '5', 'šest': '6', 'sest': '6', 'sedam': '7', 'osam': '8',
    'devet': '9', 'deset': '10', 'sto': '100'
};

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

const SPEECH_LANG_MAP = {
    sr: 'sr-RS', en: 'en-US', de: 'de-DE', hu: 'hu-HU',
    uk: 'uk-UA', ru: 'ru-RU', zh: 'zh-CN', es: 'es-ES',
    pt: 'pt-PT', fr: 'fr-FR'
};

// ============================================
// 2. POMOĆNE JEZIČKE FUNKCIJE
// ============================================

function getCurrentLang() {
    return (typeof currentLang !== 'undefined' && currentLang) ? currentLang : 'sr';
}

function getMessage(key) {
    const lang = getCurrentLang();
    return (VOICE_MESSAGES[lang] && VOICE_MESSAGES[lang][key]) || VOICE_MESSAGES.sr[key] || '';
}

function getButtonLabel(action) {
    const lang = getCurrentLang();
    return (BUTTON_LABELS[lang] && BUTTON_LABELS[lang][action]) || action.toUpperCase();
}

function getVoiceCommands() {
    const lang = getCurrentLang();
    return VOICE_COMMANDS[lang] || VOICE_COMMANDS.sr;
}

function detectVoiceCommand(text) {
    if (!text) return null;
    const commands = getVoiceCommands();
    const lower = text.toLowerCase().trim();
    
    // 1. Prvo proveri sve ključne reči za zatvaranje (exit, izlaz, itd.)
    if (commands.close && commands.close.some(k => lower.includes(k.toLowerCase()))) {
        return 'close';
    }
    
    // 2. Proveri ostale komande (add, list, stock)
    for (let [action, keywords] of Object.entries(commands)) {
        if (action === 'close') continue;
        for (let keyword of keywords) {
            if (lower.includes(keyword.toLowerCase())) {
                return action; // Vraća 'add' za "unos", "dodaj", "unesi"...
            }
        }
    }
    return null;
}
function showVoiceStatus(text, color = '#2196F3') {
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = text;
        statusEl.style.color = color;
    }
    console.log('[VOICE]', text);
}

function getNumber(word) {
    const w = word.toLowerCase().trim();
    if (NUMBER_WORDS[w] !== undefined) return NUMBER_WORDS[w];
    if (/^\d+(?:[.,]\d+)?$/.test(w)) return w.replace(',', '.');
    return null;
}

// ============================================
// 3. OPTIMIZOVANO PARSIRANJE
// ============================================

function parseVoiceDataEntry(command) {
    if (!command) return null;
    console.log('🔍 PARSIRAM:', command);
    
    let text = command.toLowerCase()
        .replace(/^(šta|start|dodaj|unos|unesi|add|new|enter|adatbevitel|hinzufügen|neu|einfügen|додати|добавить|添加|añadir|adicionar|ajouter)\s*/i, '')
        .replace(/\b(grile|gril|green)\b/gi, 'grill')
        .trim();
    
    const words = text.split(/\s+/).filter(Boolean);
    let result = { product_name: '', piece: '1', quantity: '1', unit: 'kom', shelf_life: '6', storage: 'Zamrzivač 1' };
    
    let foundStorage = null, foundUnit = null;
    let unitIndex = -1, storageIndex = -1;
    
    for (let i = 0; i < words.length; i++) {
        let w = words[i];
        for (let key in STORAGE_MAP) {
            if (w.includes(key)) { foundStorage = STORAGE_MAP[key]; storageIndex = i; break; }
        }
        if (UNIT_MAP[w]) { foundUnit = UNIT_MAP[w]; unitIndex = i; }
    }
    
    let nameParts = [], numbers = [];
    const skipWords = new Set(['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima', 'i']);
    
    for (let i = 0; i < words.length; i++) {
        if (i === storageIndex || i === unitIndex || skipWords.has(words[i])) continue;
        let numVal = getNumber(words[i]);
        if (numVal !== null) { numbers.push(numVal); }
        else { nameParts.push(words[i]); }
    }
    
    if (numbers.length >= 3) {
        [result.piece, result.quantity, result.shelf_life] = numbers;
    } else if (numbers.length === 2) {
        if (parseFloat(numbers[1]) > 3 && !text.includes('kg')) {
            result.piece = result.quantity = numbers[0];
            result.shelf_life = numbers[1];
        } else {
            [result.piece, result.quantity] = numbers;
        }
    } else if (numbers.length === 1) {
        result.piece = result.quantity = numbers[0];
    }
    
    if (foundUnit) result.unit = foundUnit;
    if (foundStorage) result.storage = foundStorage;
    
    result.product_name = nameParts.join(' ').trim();
    if (!result.product_name) result.product_name = 'Proizvod';
    else result.product_name = result.product_name.charAt(0).toUpperCase() + result.product_name.slice(1);
    
    return result;
}

// ============================================
// 4. CENTRALIZOVANO ČUVANJE U BAZU (SVE U JEDNOJ FUNKCIJI)
// ============================================

function sacuvajPodatke(data) {
    if (!data || !data.product_name || data.product_name === 'Proizvod') return false;
    
    if (!Array.isArray(window.inventory)) window.inventory = [];
    
    const existingIndex = window.inventory.findIndex(item => 
        item.productName && 
        item.productName.toLowerCase() === data.product_name.toLowerCase() &&
        item.unit === data.unit &&
        item.storage === data.storage
    );
    
    if (existingIndex > -1) {
        const item = window.inventory[existingIndex];
        item.quantity = parseFloat(item.quantity) + parseFloat(data.quantity);
        item.piece = parseFloat(item.piece) + parseFloat(data.piece);
        item.shelfLife = parseInt(data.shelf_life) || 6;
        item.dateAdded = new Date().toISOString();
        showVoiceStatus(`✅ Sabrano: ${data.product_name} (ukupno ${item.quantity} ${data.unit})`, '#4CAF50');
    } else {
        window.inventory.push({
            id: Date.now(),
            productName: data.product_name,
            piece: parseFloat(data.piece) || 1,
            quantity: parseFloat(data.quantity) || 1,
            unit: data.unit || 'kom',
            shelfLife: parseInt(data.shelf_life) || 6,
            storage: data.storage || 'Zamrzivač 1',
            dateAdded: new Date().toISOString()
        });
        showVoiceStatus(`✅ ${getMessage('saving')} ${data.product_name}`, '#4CAF50');
    }
    
    refreshDisplay();
    return true;
}

function popuniFormuPodacima(data) {
    if (!data) return;
    const mapping = {
        productInput: data.product_name,
        pieceInput: data.piece,
        quantityInput: data.quantity,
        shelfLifeInput: data.shelf_life
    };
    Object.entries(mapping).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) {
            el.value = val;
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
}

function clearForm() {
    ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

function refreshDisplay() {
    if (typeof prikaziSveUnose === 'function') prikaziSveUnose();
    if (typeof renderInventory === 'function') renderInventory();
}

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    const target = document.getElementById(screenId);
    if (target) {
        target.style.display = 'flex';
        target.classList.add('active');
    }
}

// ============================================
// 5. MOTOR ZA GLASOVNE KOMANDE (SPEECH ENGINE)
// ============================================

function processVoiceInput(buffer) {
// ============================================
// 6. EKRANI I EXPORT
// ============================================

function showDataEntry() {
    switchScreen('dataEntryScreen');
    clearForm();
}

function otvoriSpisakEkran() {
    stopVoiceRecognition();
    switchScreen('inventoryScreen');
    refreshDisplay();
}

function otvoriZaliheEkran() {
    stopVoiceRecognition();
    switchScreen('inventoryScreen');
    refreshDisplay();
}

function goBackFromVoice() {
    stopVoiceRecognition();
    switchScreen('choiceScreen');
}

// Globalni izvoz za eksterne skripte
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.sacuvajPodatke = sacuvajPodatke;
window.showDataEntry = showDataEntry;
window.otvoriZaliheEkran = otvoriZaliheEkran;
window.otvoriSpisakEkran = otvoriSpisakEkran;
window.getCurrentLang = getCurrentLang;
window.getMessage = getMessage;
window.VOICE_COMMANDS = VOICE_COMMANDS;
window.VOICE_MESSAGES = VOICE_MESSAGES;
window.BUTTON_LABELS = BUTTON_LABELS;
