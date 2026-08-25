// ============================================
// VOICE COMMANDS - v3.4 SAMO PRIKAZIVANJE
// ============================================

if (typeof window._voiceCommandsLoaded === 'undefined') {
    window._voiceCommandsLoaded = true;
    
    console.log('🎤 Učitavam VoiceCommands.js v3.4...');

// ============================================
// 1. GLOBALNE VARIJABLE
// ============================================

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

// ============================================
// 3. PRIKAZIVANJE EKRANA ZA UNOS - POPRAVLJENO
// ============================================

function otvoriEkranZaUnos() {
    console.log('📝 OTVARAM EKRAN ZA UNOS!');
    
    // 1. Sakrij sve ekrane
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    // 2. Sakrij voice menu
    hideVoiceMenu();
    
    // 3. PRIKAŽI mainScreen (glavni ekran)
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.style.visibility = 'visible';
        mainScreen.style.opacity = '1';
        mainScreen.classList.add('active');
        console.log('✅ mainScreen prikazan');
    } else {
        console.warn('⚠️ mainScreen nije pronađen!');
    }
    
    // 4. PRIKAŽI dataEntryScreen (ekran za unos)
    const dataEntry = document.getElementById('dataEntryScreen');
    if (dataEntry) {
        dataEntry.style.display = 'block';
        dataEntry.style.visibility = 'visible';
        dataEntry.style.opacity = '1';
        dataEntry.classList.add('active');
        console.log('✅ dataEntryScreen prikazan');
        
        // 5. Prikaži sva polja unutar dataEntryScreen
        const allElements = dataEntry.querySelectorAll('*');
        allElements.forEach(el => {
            el.style.display = '';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
        });
        
        // 6. Specifično prikaži input polja
        const inputs = dataEntry.querySelectorAll('input, select, button, textarea');
        inputs.forEach(el => {
            el.style.display = '';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
        });
        
        console.log('✅ Sva polja u dataEntryScreen su prikazana');
    } else {
        console.warn('⚠️ dataEntryScreen nije pronađen!');
        
        // Pokušaj da pronađeš formu
        const form = document.querySelector('form');
        if (form) {
            form.style.display = 'block';
            form.style.visibility = 'visible';
            console.log('✅ Forma prikazana direktno');
        }
    }
    
    // 7. Prikaži i polja direktno (ako su negde drugde)
    const polja = ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput'];
    polja.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = '';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
            // Ukloni bilo kakvo sakrivanje
            el.style.width = '100%';
            el.style.padding = '10px';
            el.style.border = '2px solid #ddd';
            el.style.borderRadius = '8px';
            el.style.fontSize = '16px';
            el.style.boxSizing = 'border-box';
            console.log(`✅ Polje ${id} prikazano`);
        }
    });
    
    // 8. Prikaži select polja
    const selects = ['unitSelect', 'storageSelect'];
    selects.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = '';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
            el.style.width = '100%';
            el.style.padding = '10px';
            el.style.border = '2px solid #ddd';
            el.style.borderRadius = '8px';
            el.style.fontSize = '16px';
            el.style.boxSizing = 'border-box';
            console.log(`✅ Select ${id} prikazan`);
        }
    });
    
    // 9. Prikaži dugmad
    const btns = ['saveBtn', 'voiceSaveBtn', 'clearBtn', 'voiceClearBtn'];
    btns.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = '';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
            console.log(`✅ Dugme ${id} prikazano`);
        }
    });
    
    showVoiceStatus('📝 Unos podataka', '#4CAF50');
    console.log('✅ Ekran za unos je prikazan!');
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
// 5. POPUNJAVANJE FORME
// ============================================

function popuniFormuPodacima(data) {
    console.log('📝 Popunjavam formu:', data);
    
    // Prvo otvori ekran
    otvoriEkranZaUnos();
    
    setTimeout(() => {
        // Popuni polja
        const productInput = document.getElementById('productInput');
        if (productInput) {
            productInput.value = data.product_name || '';
            productInput.dispatchEvent(new Event('input', { bubbles: true }));
            productInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ Naziv:', productInput.value);
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
        
        showVoiceStatus(`✅ Uneto: ${data.product_name} (${data.quantity} ${data.unit})`, '#4CAF50');
    }, 300);
}

// ============================================
// 6. ČUVANJE PODATAKA
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
// 7. OTVARANJE ZALIHA
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
// 8. POMOĆNE FUNKCIJE
// ============================================

function ocistiFormu() {
    const polja = ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput'];
    polja.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = '';
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    const selects = ['unitSelect', 'storageSelect'];
    selects.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.options.length > 0) {
            el.selectedIndex = 0;
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    showVoiceStatus('🧹 Forma očišćena', '#FF9800');
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
                // SAMO OTVORI EKRAN - bez kreiranja
                otvoriEkranZaUnos();
                showVoiceStatus('📝 Recite šta da unesete', '#2196F3');
            }
            return true;
        }
    }
    
    // Ako ima broj i ime proizvoda
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
window.ocistiFormu = ocistiFormu;

// Alias za script1.js
window.voiceCommand = processVoiceCommand;

console.log('✅ VoiceCommands.js v3.4 USPEŠNO UČITAN!');
console.log('📌 SAMO PRIKAZUJE postojeći ekran za unos!');
console.log('📝 Komande: unos, plus, end');

} // Kraj if
