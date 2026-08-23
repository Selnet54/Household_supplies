// ============================================
// VOICE COMMANDS - KONAČNA VERZIJA
// ============================================

let activeBuffer = ''; 
let recognition = null;
let lastSavedData = null;
let isProcessingCommand = false;
let END_AKTIVAN = false;
let isVoiceInput = false;
let currentVoiceItem = null;

// ============================================
// 1. GLASOVNE KOMANDE ZA SVE JEZIKE
// ============================================

const VOICE_COMMANDS = {
    sr: {
        add: ['unos', 'unesi', 'dodaj'],
        list: ['spisak', 'lista'],
        stock: ['zalihe', 'zaliha'],
        close: ['exit']
    },
    en: {
        add: ['add', 'new', 'enter'],
        list: ['list', 'inventory'],
        stock: ['stock', 'status'],
        close: ['exit']
    },
    de: {
        add: ['hinzufügen', 'neu', 'einfügen'],
        list: ['liste', 'inventar'],
        stock: ['bestand', 'lager'],
        close: ['exit']
    },
    hu: {
        add: ['adatbevitel'],
        list: ['lista', 'leltár'],
        stock: ['készlet'],
        close: ['exit']
    }
};

const VOICE_MESSAGES = {
    sr: {
        welcome: 'Izaberite: "unos", "spisak", "zalihe" ili "exit"',
        listening: 'Slušam...',
        add_mode: 'Unesite podatke o proizvodu',
        list_mode: 'Otvaram spisak...',
        stock_mode: 'Otvaram zalihe...',
        closing: 'Zatvaram glasovni meni...',
        not_recognized: 'Nisam prepoznao komandu',
        saving: 'Sačuvano: '
    },
    en: {
        welcome: 'Choose: "add", "list", "stock" or "exit"',
        listening: 'Listening...',
        add_mode: 'Enter product data',
        list_mode: 'Opening list...',
        stock_mode: 'Opening stock...',
        closing: 'Closing voice menu...',
        not_recognized: 'Command not recognized',
        saving: 'Saved: '
    },
    de: {
        welcome: 'Wählen Sie: "hinzufügen", "liste", "bestand" oder "exit"',
        listening: 'Höre zu...',
        add_mode: 'Produktdaten eingeben',
        list_mode: 'Öffne Liste...',
        stock_mode: 'Öffne Bestand...',
        closing: 'Sprachmenü schließen...',
        not_recognized: 'Befehl nicht erkannt',
        saving: 'Gespeichert: '
    },
    hu: {
        welcome: 'Válasszon: "adatbevitel", "lista", "készlet" vagy "exit"',
        listening: 'Hallgatom...',
        add_mode: 'Termék adatok bevitele',
        list_mode: 'Lista megnyitása...',
        stock_mode: 'Készlet megnyitása...',
        closing: 'Hangmenü bezárása...',
        not_recognized: 'Parancs nem felismerhető',
        saving: 'Mentve: '
    }
};

function getCurrentLang() {
    return typeof currentLang !== 'undefined' ? currentLang : 'sr';
}

function getMessage(key) {
    const lang = getCurrentLang();
    const messages = VOICE_MESSAGES[lang];
    if (!messages) {
        console.warn('⚠️ Nema poruka za jezik:', lang);
        return VOICE_MESSAGES.sr[key] || key || '';
    }
    return messages[key] || VOICE_MESSAGES.sr[key] || key || '';
}

function detectVoiceCommand(text) {
    const lang = getCurrentLang();
    const commands = VOICE_COMMANDS[lang] || VOICE_COMMANDS.sr;
    const lower = text.toLowerCase().trim();
    
    // Prvo proveri "exit" (univerzalno)
    if (lower.includes('exit')) {
        return 'close';
    }
    
    // Proveri ostale komande
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
// 2. POMOĆNE FUNKCIJE
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

function voiceCommand(action) {
    console.log('🎤 VOICE COMMAND:', action);
    
    switch(action) {
        case 'add':
            showVoiceStatus('📝 ' + getMessage('add_mode'), '#4CAF50');
            hideVoiceMenu();
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            // Očisti formu za novi unos
            clearForm();
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
// 3. ČIŠĆENJE FORME
// ============================================

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
    
    // Resetuj select polja na default
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
            if (option.value === 'Zamrzivač 1' || option.text.includes('Zamrzivač 1')) {
                option.selected = true;
                storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }
    
    currentVoiceItem = null;
}

// ============================================
// 4. BROJEVI NA SRPSKOM
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

// ============================================
// 5. JEDINICE I SKLADIŠTA
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
    return 'Zamrzivač 1'; // Default
}

// ============================================
// 6. PARSIRANJE
// ============================================

function parseVoiceDataEntry(command) {
    console.log('🔍 PARSIRAM:', command);
    
    let text = command
        .replace(/^unos\s*/i, '')
        .replace(/^unesi\s*/i, '')
        .replace(/^dodaj\s*/i, '')
        .replace(/^adatbevitel\s*/i, '')
        .replace(/^add\s*/i, '')
        .replace(/^new\s*/i, '')
        .replace(/^enter\s*/i, '')
        .replace(/^hinzufügen\s*/i, '')
        .replace(/^neu\s*/i, '')
        .replace(/^einfügen\s*/i, '')
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
    
    // Prvo detektuj skladište i jedinicu
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
    
    // Ako nije pronađeno skladište, default Zamrzivač 1
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
    
    // Parsiranje brojeva: [komada, kilograma, meseci]
    if (numbers.length >= 3) {
        result.piece = numbers[0];
        result.quantity = numbers[1];
        result.shelf_life = numbers[2];
    } else if (numbers.length === 2) {
        // Ako ima 2 broja: [komada, kilograma] ili [komada, meseci]
        // Proveri da li je drugi broj verovatno meseci (veći od 3)
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
    
    // Detekcija jedinice
    if (text.includes('gram') || text.includes('grama') || text.includes('g ')) {
        result.unit = 'g';
        console.log('🔍 Pronađeno "gram" -> jedinica = g');
    } else if (text.includes('kilogram') || text.includes('kg')) {
        result.unit = 'kg';
        console.log('🔍 Pronađeno "kilogram" -> jedinica = kg');
    } else if (text.includes('litar') || text.includes('l ')) {
        result.unit = 'l';
        console.log('🔍 Pronađeno "litar" -> jedinica = l');
    } else if (text.includes('komad') || text.includes('kom')) {
        result.unit = 'kom';
        console.log('🔍 Pronađeno "komad" -> jedinica = kom');
    } else if (foundUnit) {
        result.unit = foundUnit;
        console.log('🔍 Pronađena jedinica iz reči:', foundUnit);
    }
    
    // Detekcija roka trajanja
    let rokPronadjen = false;
    
    if (text.includes('šest') || text.includes('sest') || /\b6\b/.test(text)) {
        if (!rokPronadjen) {
            result.shelf_life = '6';
            rokPronadjen = true;
            console.log('🔍 Pronađeno "šest/6" -> rok = 6 meseci');
        }
    }
    
    if (!rokPronadjen) {
        let meseciMatch = text.match(/(\d+)\s*meseci/);
        if (meseciMatch) {
            result.shelf_life = meseciMatch[1];
            rokPronadjen = true;
            console.log('🔍 Pronađeno "' + meseciMatch[1] + ' meseci" -> rok = ' + meseciMatch[1]);
        }
    }
    
    // Ako ima 3 broja, treći je rok
    if (!rokPronadjen && numbers.length >= 3) {
        result.shelf_life = numbers[2];
        rokPronadjen = true;
        console.log('🔍 Treći broj -> rok =', numbers[2]);
    }
    
    // Ako nema roka, default 6 meseci
    if (!rokPronadjen) {
        result.shelf_life = '6';
        console.log('🔍 Nema roka, default 6 meseci');
    }
    
    result.product_name = nameParts.join(' ').trim() || 'Proizvod';
    result.storage = foundStorage;
    
    console.log('✅ PARSIRANO:', result);
    return result;
}

// ============================================
// 7. POPUNJAVANJE FORME
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
        
        showVoiceStatus('✅ ' + getMessage('saving') + ' ' + data.product_name + ' (' + data.quantity + ' ' + data.unit + ')', '#4CAF50');
    }, 300);
}

// ============================================
// 8. ČUVANJE PODATAKA SA SABIRANJEM
// ============================================

function sacuvajPodatke(data) {
    console.log('💾 Čuvam podatke:', data);
    
    isVoiceInput = true;
    window._isVoiceInput = true;
    
    // Sačuvaj originalne funkcije
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
    
    let saved = false;
    
    // Direktno dodaj u inventory sa sabiranjem
    if (typeof window.inventory !== 'undefined' && Array.isArray(window.inventory)) {
        // Proveri da li već postoji isti proizvod
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
            // Saberi količine
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
            // Dodaj novi proizvod
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
        
        saved = true;
        
        // Osveži prikaze
        setTimeout(() => {
            if (typeof prikaziSveUnose === 'function') {
                try { prikaziSveUnose(); } catch(e) {}
            }
            if (typeof renderInventory === 'function') {
                try { renderInventory(); } catch(e) {}
            }
            console.log('✅ Podaci osveženi');
        }, 100);
    }
    
    // Vrati originalne funkcije
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
// 9. OTVARANJE ZALIHA
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
        if (typeof prikaziSveUnose === 'function') {
            try { prikaziSveUnose(); } catch(e) {}
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
// 10. OTVARANJE SPISKA
// ============================================

function otvoriSpisakEkran() {
    console.log('📋 Otvaram spisak proizvoda...');
    
    if (typeof refreshInventoryData === 'function') {
        try { refreshInventoryData(); } catch(e) {}
    }
    if (typeof prikaziSveUnose === 'function') {
        try { prikaziSveUnose(); } catch(e) {}
    }
    if (typeof renderInventory === 'function') {
        try { renderInventory(); } catch(e) {}
    }
    
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
        console.log('✅ Spisak otvoren');
        showVoiceStatus('📋 Spisak otvoren', '#4CAF50');
    }, 200);
}

// ============================================
// 11. OBRADA I ČUVANJE
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
// 12. START VOICE RECOGNITION
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
        // DETEKTUJ GLASOVNU KOMANDU (4 OPCIJE)
        // ============================================
        const command = detectVoiceCommand(activeBuffer);
        
        if (command) {
            console.log('🎯 DETEKTOVANA KOMANDA:', command);
            isProcessingCommand = true;
            
            // Ako je "add", izvuci tekst proizvoda
            if (command === 'add') {
                let itemText = activeBuffer;
                const lang = getCurrentLang();
                const addKeywords = VOICE_COMMANDS[lang]?.add || VOICE_COMMANDS.sr.add;
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
                    // Samo otvori formu bez podataka
                    voiceCommand('add');
                    isProcessingCommand = false;
                }
                activeBuffer = '';
                setTimeout(() => {
                    isProcessingCommand = false;
                }, 500);
                return;
            }
            
            // Ostale komande
            voiceCommand(command);
            activeBuffer = '';
            setTimeout(() => {
                isProcessingCommand = false;
            }, 500);
            return;
        }
        
        // ============================================
        // "PLUS" - ZAVRŠAVA UNOS
        // ============================================
        if (lowerFull.includes('plus')) {
            console.log('✅ PLUS DETEKTOVAN - završavam unos');
            isProcessingCommand = true;
            
            let parts = activeBuffer.split(/\bplus\b/i);
            let itemText = parts[0].trim();
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }
            
            activeBuffer = parts.slice(1).join('').trim();
            
            showVoiceStatus('✅ Unos sačuvan. Recite sledeći ili "exit" za kraj.', '#4CAF50');
            
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
        
        // ============================================
        // "END" - OTVARA ZALIHE
        // ============================================
        if (lowerFull.includes('end') || lowerFull.includes('kraj')) {
            console.log('🏁 END DETEKTOVAN - otvaram zalihe!');
            isProcessingCommand = true;
            END_AKTIVAN = true;
            
            let itemText = activeBuffer;
            const endWords = ['end', 'kraj', 'gotovo'];
            for (let word of endWords) {
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
// 13. ZAUSTAVI PREPOZNAVANJE
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
// 14. RESTART MIKROFONA
// ============================================

function restartMicrophone() {
    console.log('🔄 Restartujem mikrofon...');
    stopVoiceRecognition();
    setTimeout(() => {
        startVoiceRecognition();
    }, 500);
}

// ============================================
// 15. POVRATAK NA PREĐAŠNJI EKRAN
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
// 16. SELEKTOVANJE VOICE MODE
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
// 17. ZABRANA OTVARANJA ZALIHA IZ VOICE KOMANDI
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
    console.log('✅ 4 opcije: "unos", "spisak", "zalihe", "exit"');
    console.log('✅ "exit" je univerzalan na svim jezicima!');
})();

// ============================================
// 18. IZVOZ SVIH FUNKCIJA
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
window.clearForm = clearForm;

console.log('✅ VOICE COMMANDS - KONAČNA VERZIJA UČITANA!');
console.log('🎤 4 opcije: "unos", "spisak", "zalihe", "exit"');
console.log('🌍 "exit" je univerzalan na svim jezicima!');
console.log('📝 "unos" → diktiraj podatke → "plus" za čuvanje');
console.log('📋 "spisak" → otvara spisak');
console.log('📦 "zalihe" → otvara zalihe');
console.log('🚪 "exit" → zatvara glasovni meni');
console.log('🔚 "end" → otvara zalihe (kao pre)');
