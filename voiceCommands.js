// ============================================
// VOICE COMMANDS - INTEGRISAN SA SCRIPT1.JS
// Popravljene duple deklaracije i dodate funkcije
// ============================================

// Koristimo var/window proveru da sprečimo "SyntaxError: Identifier already declared"
if (typeof window.voiceRecognition === 'undefined') {
    window.voiceRecognition = null;
}
if (typeof window.activeVoiceBuffer === 'undefined') {
    window.activeVoiceBuffer = '';
}

var lastSavedData = null;
var isProcessingCommand = false;
var ALLOW_INVENTORY_OPEN = false;

// ============================================
// 1. REČNICI I PARSER (Iz Dobar_2 koda)
// ============================================

const NUMBER_WORDS = {
    'nula': '0', 'jedan': '1', 'jedna': '1', 'jedno': '1', 'dva': '2', 'dve': '2',
    'tri': '3', 'četiri': '4', 'cetiri': '4', 'pet': '5', 'šest': '6', 'sest': '6',
    'sedam': '7', 'osam': '8', 'devet': '9', 'deset': '10', 'jedanaest': '11',
    'dvanaest': '12', 'trinaest': '13', 'četrnaest': '14', 'cetrnaest': '14',
    'petnaest': '15', 'šesnaest': '16', 'sesnaest': '16', 'sedamnaest': '17',
    'osamnaest': '18', 'devetnaest': '19', 'dvadeset': '20', 'trideset': '30',
    'četrdeset': '40', 'cetrdeset': '40', 'pedeset': '50', 'šezdeset': '60',
    'sezdeset': '60', 'sedamdeset': '70', 'osamdeset': '80', 'devedeset': '90', 'sto': '100'
};

const UNIT_MAP = {
    'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg', 'kilogrami': 'kg',
    'gram': 'g', 'grama': 'g', 'g': 'g', 'grami': 'g',
    'litar': 'l', 'litara': 'l', 'l': 'l', 'litri': 'l',
    'komad': 'kom', 'komada': 'kom', 'kom': 'kom', 'komadi': 'kom',
    'paket': 'pak', 'paketa': 'pak', 'pak': 'pak', 'paketi': 'pak'
};

const STORAGE_MAP = {
    'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
    'zamrzivač 1': 'Zamrzivač 1', 'zamrzivac 1': 'Zamrzivač 1',
    'zamrzivač 2': 'Zamrzivač 2', 'zamrzivac 2': 'Zamrzivač 2',
    'zamrzivač 3': 'Zamrzivač 3', 'zamrzivac 3': 'Zamrzivač 3',
    'frižider': 'Frižider', 'frizider': 'Frižider',
    'ostava': 'Ostava', 'špajz': 'Ostava'
};

function getNumber(word) {
    const w = word.toLowerCase().trim();
    if (NUMBER_WORDS[w] !== undefined) return NUMBER_WORDS[w];
    if (/^\d+(?:[.,]\d+)?$/.test(w)) return w.replace(',', '.');
    return null;
}

function parseVoiceDataEntry(command) {
    console.log('🔍 PARSIRAM KOMANDU:', command);
    let text = command.replace(/^unos\s*/i, '').replace(/^start\s*/i, '').trim();
    let words = text.split(/\s+/).map(s => s.trim()).filter(Boolean);
    
    let result = {
        product_name: '', piece: '1', quantity: '1',
        unit: 'kom', shelf_life: '12', storage: 'Zamrzivač 1'
    };
    
    let foundStorage = null, foundUnit = null;
    let unitIndex = -1, storageIndex = -1;
    let numbers = [], nameParts = [];
    let skipWords = ['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima', 'i'];
    
    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        if (STORAGE_MAP[w]) { foundStorage = STORAGE_MAP[w]; storageIndex = i; }
        if (UNIT_MAP[w]) { foundUnit = UNIT_MAP[w]; unitIndex = i; }
    }
    
    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        if (i === storageIndex || i === unitIndex || skipWords.includes(w)) continue;
        
        let numVal = getNumber(w);
        if (numVal !== null) {
            numbers.push(numVal);
        } else {
            nameParts.push(words[i]);
        }
    }
    
    if (foundUnit === 'kg' || foundUnit === 'g' || foundUnit === 'l') {
        if (numbers.length >= 2) {
            result.piece = numbers[0];
            result.quantity = numbers[1];
        } else if (numbers.length === 1) {
            result.piece = '0';
            result.quantity = numbers[0];
        }
    } else {
        if (numbers.length >= 1) {
            result.piece = numbers[0];
            result.quantity = numbers[0];
        }
    }
    
    let meseciMatch = text.match(/(\d+)\s*meseci/);
    if (meseciMatch) {
        result.shelf_life = meseciMatch[1];
    } else if (numbers.length >= 3) {
        result.shelf_life = numbers[2];
    }
    
    result.product_name = nameParts.filter(p => !/^\d+$/.test(p)).join(' ').trim() || 'Proizvod';
    if (foundUnit) result.unit = foundUnit;
    if (foundStorage) result.storage = foundStorage;
    
    return result;
}

// ============================================
// 2. INTEGRACIJA SA SCRIPT1.JS FUNKCIJAMA
// ============================================

function popuniFormuPodacima(data) {
    console.log('📝 Popunjavam polja u script1.js:', data);
    
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
            el.value = val;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };

    setVal('productInput', data.product_name || '');
    setVal('pieceInput', data.piece || '1');
    setVal('quantityInput', data.quantity || '1');
    setVal('shelfLifeInput', data.shelf_life || '12');
    
    const unitSelect = document.getElementById('unitSelect');
    if (unitSelect && data.unit) {
        for (let opt of unitSelect.options) {
            if (opt.value === data.unit || opt.text.toLowerCase().includes(data.unit)) {
                opt.selected = true;
                unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }
    
    const storageSelect = document.getElementById('storageSelect');
    if (storageSelect && data.storage) {
        for (let opt of storageSelect.options) {
            if (opt.value === data.storage || opt.text.toLowerCase().includes(data.storage.toLowerCase())) {
                opt.selected = true;
                storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }
}

function sacuvajPodatke(data) {
    popuniFormuPodacima(data);
    
    setTimeout(() => {
        if (typeof saveProduct === 'function') {
            saveProduct();
            console.log('✅ Sačuvano preko saveProduct()');
        } else if (typeof handleFormSubmit === 'function') {
            handleFormSubmit();
            console.log('✅ Sačuvano preko handleFormSubmit()');
        }
    }, 200);
}

// ============================================
// 3. GLAVNI PROCESOR KOMANDI (Za script1.js)
// ============================================

function processVoiceCommand(command) {
    if (!command) return false;
    console.log('🎤 processVoiceCommand obrađuje:', command);
    
    const lower = command.toLowerCase().trim();
    
    // 1. ZALIHE
    if (lower.includes('zalihe') || lower.includes('zaliha')) {
        console.log('📦 Otvaram zalihe preko script1.js...');
        if (typeof renderInventory === 'function') {
            const lang = typeof currentLang !== 'undefined' ? currentLang : 'sr';
            renderInventory(lang);
        } else if (typeof showScreen === 'function') {
            showScreen('inventoryScreen');
        }
        return true;
    }
    
    // 2. SPISAK / KUPOVINA
    if (lower.includes('spisak') || lower.includes('kupovina')) {
        console.log('🛒 Otvaram spisak preko script1.js...');
        if (typeof renderShoppingList === 'function') {
            const lang = typeof currentLang !== 'undefined' ? currentLang : 'sr';
            renderShoppingList(lang);
        } else if (typeof showScreen === 'function') {
            showScreen('shoppingScreen');
        }
        return true;
    }
    
    // 3. UNOS EKRAN ILI DIREKTAN UNOS
    if (lower.startsWith('unos') || lower.startsWith('unesi') || lower.startsWith('dodaj')) {
        console.log('📝 Otvaram/Popunjavam unos...');
        
        // Otvori ekran za unos iz script1.js
        if (typeof renderDataEntry === 'function') {
            renderDataEntry('');
        } else if (typeof showScreen === 'function') {
            showScreen('dataEntryScreen');
        }
        
        // Ako je izgovoreno npr "unos pileće belo 2 kg", odradi parsiranje i čuvanje
        let cleanText = lower.replace(/^(unos|unesi|dodaj)\s*/i, '').trim();
        if (cleanText.length > 2) {
            let data = parseVoiceDataEntry(cleanText);
            sacuvajPodatke(data);
        }
        return true;
    }
    
    // 4. PREKID / ZAVRŠETAK UNOSA (PLUS / END)
    if (lower.includes('plus') || lower.includes('end')) {
        let cleanText = lower.replace(/\b(plus|end)\b/gi, '').trim();
        if (cleanText.length > 2) {
            let data = parseVoiceDataEntry(cleanText);
            sacuvajPodatke(data);
        }
        if (lower.includes('end')) {
            if (typeof renderInventory === 'function') {
                renderInventory(typeof currentLang !== 'undefined' ? currentLang : 'sr');
            }
        }
        return true;
    }
    
    return false;
}

// ============================================
// 4. POPRAVKA ZA GO BACK (Sprečava ReferenceError)
// ============================================

function goBack() {
    console.log('◀ Nazad pozvano sa HTML-a');
    if (typeof showScreen === 'function') {
        showScreen('categories');
    } else if (typeof renderCategories === 'function') {
        renderCategories(typeof currentLang !== 'undefined' ? currentLang : 'sr');
    }
}

// ============================================
// 5. GLOBALNO IZVOĐENJE FUNKCIJA
// ============================================

window.processVoiceCommand = processVoiceCommand;
window.voiceCommand = processVoiceCommand; // Zbog poziva u script1.js
window.goBack = goBack;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.sacuvajPodatke = sacuvajPodatke;

console.log('✅ voiceCommands.js uspešno povezan sa script1.js!');
