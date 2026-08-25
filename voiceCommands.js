// ============================================
// VOICE COMMANDS - POPRAVLJENA VERZIJA v3.2
// BEZ DUPLIRANJA DEKLARACIJA
// ============================================

// ============================================
// 1. PROVERA DA LI VEĆ POSTOJI - BEZ DUPLIRANJA
// ============================================

if (typeof window._voiceCommandsLoaded === 'undefined') {
    window._voiceCommandsLoaded = true;
    
    console.log('🎤 Učitavam VoiceCommands.js (samo jednom)...');

// ============================================
// 2. KORISTIMO POSTOJEĆE VARIJABLE ILI KREIRAMO NOVE
// ============================================

// NE deklarišemo ponovo ako već postoji
if (typeof window.recognition === 'undefined') {
    window.recognition = null;
}
if (typeof window.activeBuffer === 'undefined') {
    window.activeBuffer = '';
}
if (typeof window.lastSavedData === 'undefined') {
    window.lastSavedData = null;
}
if (typeof window.isProcessingCommand === 'undefined') {
    window.isProcessingCommand = false;
}
if (typeof window.isVoiceInput === 'undefined') {
    window.isVoiceInput = false;
}
if (typeof window.ALLOW_INVENTORY_OPEN === 'undefined') {
    window.ALLOW_INVENTORY_OPEN = false;
}
if (typeof window.END_AKTIVAN === 'undefined') {
    window.END_AKTIVAN = false;
}
if (typeof window.micRestartTimer === 'undefined') {
    window.micRestartTimer = null;
}
if (typeof window.micMonitoringInterval === 'undefined') {
    window.micMonitoringInterval = null;
}

// Aliasi za lakše korišćenje
const recognition = window.recognition;
const activeBuffer = window.activeBuffer;
const lastSavedData = window.lastSavedData;
const isProcessingCommand = window.isProcessingCommand;
const isVoiceInput = window.isVoiceInput;
const ALLOW_INVENTORY_OPEN = window.ALLOW_INVENTORY_OPEN;
const END_AKTIVAN = window.END_AKTIVAN;
const micRestartTimer = window.micRestartTimer;
const micMonitoringInterval = window.micMonitoringInterval;

// ============================================
// 3. POMOĆNE FUNKCIJE
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
// 4. REČNIK I PARSIRANJE
// ============================================

const NUMBER_WORDS = {
    'nula': '0', 'jedan': '1', 'jedna': '1', 'jedno': '1',
    'dva': '2', 'dve': '2', 'tri': '3', 'četiri': '4', 'cetiri': '4',
    'pet': '5', 'šest': '6', 'sest': '6', 'sedam': '7', 'osam': '8',
    'devet': '9', 'deset': '10', 'jedanaest': '11', 'dvanaest': '12',
    'trinaest': '13', 'četrnaest': '14', 'cetrnaest': '14', 'petnaest': '15',
    'šesnaest': '16', 'sesnaest': '16', 'sedamnaest': '17', 'osamnaest': '18',
    'devetnaest': '19', 'dvadeset': '20', 'trideset': '30', 'četrdeset': '40',
    'cetrdeset': '40', 'pedeset': '50', 'šezdeset': '60', 'sezdeset': '60',
    'sedamdeset': '70', 'osamdeset': '80', 'devedeset': '90', 'sto': '100'
};

const UNIT_MAP = {
    'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg', 'kilogrami': 'kg',
    'gram': 'g', 'grama': 'g', 'g': 'g', 'grami': 'g',
    'litar': 'l', 'litara': 'l', 'l': 'l', 'litri': 'l',
    'komad': 'kom', 'komada': 'kom', 'kom': 'kom', 'komadi': 'kom',
    'paket': 'pak', 'paketa': 'pak', 'pak': 'pak'
};

const WEIGHT_UNITS = ['kg', 'g', 'l'];

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

function parseVoiceDataEntry(command) {
    console.log('🔍 PARSIRAM:', command);
    
    let text = command
        .replace(/^unos\s*/i, '')
        .replace(/^start\s*/i, '')
        .replace(/^dodaj\s*/i, '')
        .replace(/^novi\s*/i, '')
        .replace(/^unesi\s*/i, '')
        .replace(/^snimi\s*/i, '')
        .trim();
    
    let words = text.split(/\s+/).map(s => s.trim()).filter(Boolean);
    
    let result = {
        product_name: '',
        piece: '0',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    let foundStorage = null;
    let foundUnit = null;
    let storageIndex = -1;
    let unitIndex = -1;
    let numbers = [];
    let numberPositions = [];
    let nameParts = [];
    let skipWords = ['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima', 'i', 'od', 'do', 'sa'];
    
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
    
    if (text.includes('gram') || text.includes('grama')) {
        foundUnit = 'g';
    } else if (text.includes('kilogram') || text.includes('kg')) {
        foundUnit = 'kg';
    } else if (text.includes('litar') || text.includes('litara')) {
        foundUnit = 'l';
    }
    
    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        let originalW = words[i];
        
        if (i === storageIndex || i === unitIndex) continue;
        if (skipWords.includes(w)) continue;
        
        let numVal = getNumber(w);
        if (numVal !== null) {
            numbers.push({ value: numVal, position: i });
            numberPositions.push(i);
            continue;
        }
        
        nameParts.push(originalW);
    }
    
    if (foundUnit) result.unit = foundUnit;
    if (foundStorage) result.storage = foundStorage;
    
    if (numbers.length >= 1) {
        const isWeightUnit = WEIGHT_UNITS.includes(result.unit);
        
        if (isWeightUnit) {
            result.piece = '0';
            result.quantity = numbers[0].value;
        } else {
            result.piece = numbers[0].value;
            result.quantity = '1';
        }
    }
    
    let filteredWords = words.filter((w, index) => {
        let lower = w.toLowerCase();
        if (numberPositions.includes(index)) return false;
        if (getUnit(lower)) return false;
        if (getStorage(lower)) return false;
        if (skipWords.includes(lower)) return false;
        return true;
    });
    
    result.product_name = filteredWords.join(' ').trim() || 'Proizvod';
    
    let meseciMatch = text.match(/(\d+)\s*meseci/);
    if (meseciMatch) {
        result.shelf_life = meseciMatch[1];
    }
    
    console.log('✅ PARSIRANO:', result);
    return result;
}

// ============================================
// 5. OTVARANJE EKRANA ZA UNOS
// ============================================

function otvoriEkranZaUnos() {
    console.log('📝 OTVARAM EKRAN ZA UNOS!');
    
    // Sakrij sve ekrane
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    // Sakrij voice menu
    hideVoiceMenu();
    
    // Pokaži mainScreen
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.style.visibility = 'visible';
        mainScreen.style.opacity = '1';
        mainScreen.classList.add('active');
        console.log('✅ mainScreen prikazan');
    }
    
    // Pokaži dataEntryScreen
    const dataEntry = document.getElementById('dataEntryScreen');
    if (dataEntry) {
        dataEntry.style.display = 'block';
        dataEntry.style.visibility = 'visible';
        dataEntry.style.opacity = '1';
        dataEntry.classList.add('active');
        console.log('✅ dataEntryScreen prikazan');
    }
    
    // Prikaži polja
    setTimeout(() => {
        const polja = ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput'];
        polja.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'block';
                el.style.visibility = 'visible';
                el.style.opacity = '1';
            }
        });
        
        const selects = ['unitSelect', 'storageSelect'];
        selects.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'block';
                el.style.visibility = 'visible';
                el.style.opacity = '1';
            }
        });
        
        showVoiceStatus('📝 Unos podataka', '#4CAF50');
    }, 100);
}

// ============================================
// 6. POPUNJAVANJE FORME
// ============================================

function popuniFormuPodacima(data) {
    console.log('📝 Popunjavam formu:', data);
    
    otvoriEkranZaUnos();
    
    setTimeout(() => {
        const productInput = document.getElementById('productInput');
        if (productInput) {
            productInput.value = data.product_name || '';
            productInput.dispatchEvent(new Event('input', { bubbles: true }));
            productInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        const pieceInput = document.getElementById('pieceInput');
        if (pieceInput) {
            pieceInput.value = data.piece || '0';
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
                if (option.value === data.unit) {
                    option.selected = true;
                    unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }
        
        const storageSelect = document.getElementById('storageSelect');
        if (storageSelect && data.storage) {
            for (let option of storageSelect.options) {
                if (option.value === data.storage) {
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
// 7. ČUVANJE PODATAKA
// ============================================

function sacuvajPodatke(data) {
    console.log('💾 Čuvam podatke:', data);
    
    window.ALLOW_INVENTORY_OPEN = false;
    window.END_AKTIVAN = false;
    window.isVoiceInput = true;
    
    popuniFormuPodacima(data);
    
    setTimeout(() => {
        let saved = false;
        
        if (typeof saveProduct === 'function') {
            try { 
                saveProduct(); 
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
                    piece: parseInt(data.piece) || 0,
                    quantity: parseFloat(data.quantity) || 1,
                    unit: data.unit || 'kom',
                    shelf_life_months: parseInt(data.shelf_life) || 12,
                    storage_location: data.storage || 'Zamrzivač 1',
                    entry_date: new Date().toISOString().split('T')[0],
                    isNew: true
                };
                zalihe.push(newItem);
                localStorage.setItem('zalihe', JSON.stringify(zalihe));
                saved = true;
                console.log('✅ Direktan upis u localStorage uspešan!');
            } catch(e) {
                console.warn('localStorage greška:', e);
            }
        }
        
        if (saved) {
            showVoiceStatus(`✅ Sačuvano: ${data.product_name}`, '#4CAF50');
        } else {
            showVoiceStatus('❌ Greška pri čuvanju!', '#f44336');
        }
        
        setTimeout(() => {
            window.isVoiceInput = false;
        }, 1000);
    }, 500);
}

function processAndSaveItem(command) {
    let data = parseVoiceDataEntry(command);
    if (!data.product_name || data.product_name === 'Proizvod' || data.product_name.length < 2) {
        showVoiceStatus('❌ Nisam prepoznao proizvod', '#f44336');
        return false;
    }
    
    window.lastSavedData = data;
    sacuvajPodatke(data);
    return true;
}

// ============================================
// 8. OTVARANJE ZALIHA
// ============================================

function otvoriZaliheEkran() {
    console.log('📦 Otvaram ekran zaliha...');
    
    if (!window.ALLOW_INVENTORY_OPEN) {
        console.log('⛔ ZABRANJENO: samo "end" može otvoriti zalihe');
        showVoiceStatus('⛔ Samo "end" otvara zalihe', '#FF9800');
        return;
    }
    
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    hideVoiceMenu();
    
    const inv = document.getElementById('inventoryScreen') || document.querySelector('.inventory-screen');
    if (inv) {
        inv.style.setProperty('display', 'flex', 'important');
        inv.classList.add('active');
        
        try {
            if (typeof renderInventory === 'function') renderInventory();
            if (typeof loadInventory === 'function') loadInventory();
            if (typeof refreshInventoryData === 'function') refreshInventoryData();
        } catch(e) {
            console.warn('Greška pri renderovanju zaliha:', e);
        }
        showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
    }
    
    window.ALLOW_INVENTORY_OPEN = false;
}

// ============================================
// 9. GLAVNA FUNKCIJA - PROCESIRANJE KOMANDI
// ============================================

function processVoiceCommand(command) {
    console.log('🎤 processVoiceCommand prima:', command);
    
    if (!command) return false;
    const lower = command.toLowerCase().trim();
    
    // END - otvara zalihe
    if (lower.includes('end') || lower.includes('and') || lower.includes('kraj') || lower.includes('gotovo')) {
        console.log('🏁 END - otvaram zalihe');
        window.ALLOW_INVENTORY_OPEN = true;
        
        let itemText = command
            .replace(/end/gi, '')
            .replace(/and/gi, '')
            .replace(/kraj/gi, '')
            .replace(/gotovo/gi, '')
            .trim();
        
        if (itemText.length > 2) {
            processAndSaveItem(itemText);
        }
        
        setTimeout(() => {
            otvoriZaliheEkran();
        }, 500);
        return true;
    }
    
    // PLUS - čuva unos
    if (lower.includes('plus')) {
        console.log('✅ PLUS - čuvam unos');
        let itemText = command.replace(/plus/gi, '').trim();
        
        if (itemText.length > 2) {
            processAndSaveItem(itemText);
            showVoiceStatus('✅ Sačuvano. Recite sledeći ili "end" za kraj.', '#4CAF50');
        } else {
            showVoiceStatus('⚠️ Prekratak unos', '#FF9800');
        }
        return true;
    }
    
    // UNOS - otvara ekran za unos
    const dataEntryKeywords = ['unos', 'unesi', 'dodaj', 'novi', 'snimi'];
    for (let keyword of dataEntryKeywords) {
        if (lower.includes(keyword)) {
            console.log(`📝 "${keyword}" - otvaram ekran za unos`);
            
            let itemText = command;
            dataEntryKeywords.forEach(k => {
                itemText = itemText.replace(new RegExp(k, 'gi'), '');
            });
            itemText = itemText.trim();
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            } else {
                otvoriEkranZaUnos();
                showVoiceStatus('📝 Recite šta da unesete', '#2196F3');
            }
            return true;
        }
    }
    
    // Ako ima broj i ime proizvoda, pokušaj da parsiraš
    if (/\d/.test(lower) && lower.length > 3) {
        console.log('📝 Pokušavam da parsiraM:', command);
        processAndSaveItem(command);
        return true;
    }
    
    showVoiceStatus('❌ Nepoznata komanda: ' + command, '#f44336');
    return false;
}

// ============================================
// 10. GLOBALNE METODE
// ============================================

window.processVoiceCommand = processVoiceCommand;
window.otvoriEkranZaUnos = otvoriEkranZaUnos;
window.otvoriZaliheEkran = otvoriZaliheEkran;
window.sacuvajPodatke = sacuvajPodatke;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.processAndSaveItem = processAndSaveItem;
window.popuniFormuPodacima = popuniFormuPodacima;
window.showVoiceStatus = showVoiceStatus;
window.hideVoiceMenu = hideVoiceMenu;

// Alias za script1.js
window.voiceCommand = processVoiceCommand;

console.log('✅ VoiceCommands.js v3.2 USPEŠNO UČITAN!');
console.log('📌 "unos" sada OTVARA EKRAN ZA UNOS!');
console.log('📝 Komande: unos, plus, end');

} // Kraj if (typeof window._voiceCommandsLoaded === 'undefined')
