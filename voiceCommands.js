// ============================================
// VOICE COMMANDS - INTEGRISANA VERZIJA v3.0
// Kombinuje parsiranje, zalihe i stabilnu navigaciju
// ============================================

let activeBuffer = ''; 
let recognition = null;
let lastSavedData = null;
let isProcessingCommand = false;
let END_AKTIVAN = false;
let isVoiceInput = false;
let ALLOW_INVENTORY_OPEN = false;
let micRestartTimer = null;

// ============================================
// 1. POMOĆNE FUNKCIJE & STATUS
// ============================================

function hideVoiceMenu() {
    if (typeof showScreen === 'function') {
        // Prepusti navigaciji tvoje aplikacije prelaz
        return;
    }
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) voiceMenu.classList.remove('active');
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
// 2. REČNICI (BROJEVI, JEDINICE, SKLADIŠTA)
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

function getUnit(word) { return UNIT_MAP[word.toLowerCase()] || null; }

function getStorage(word) {
    const w = word.toLowerCase();
    for (let key in STORAGE_MAP) {
        if (w.includes(key) || key.includes(w)) return STORAGE_MAP[key];
    }
    return null;
}

// ============================================
// 3. PARSIRANJE GLASOVNOG UNOSA
// ============================================

function parseVoiceDataEntry(command) {
    console.log('🔍 PARSIRAM:', command);
    
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
        let st = getStorage(w);
        if (st) { foundStorage = st; storageIndex = i; }
        let un = getUnit(w);
        if (un) { foundUnit = un; unitIndex = i; }
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
// 4. POPUNJAVANJE FORME U POZADINI
// ============================================

function popuniFormuPodacima(data) {
    console.log('📝 Popunjavam polja forme podacima:', data);
    
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
    
    if (typeof updateExpiryDate === 'function') {
        try { updateExpiryDate(); } catch(e) {}
    }
}

// ============================================
// 5. ČUVANJE PODATAKA (BEZ PREKIDA ZASLONA)
// ============================================

function sacuvajPodatke(data) {
    console.log('💾 Čuvam podatke...', data);
    ALLOW_INVENTORY_OPEN = false;
    END_AKTIVAN = false;
    isVoiceInput = true;
    
    popuniFormuPodacima(data);
    
    setTimeout(() => {
        let saved = false;
        
        // Pozivamo tvoju funkciju iz script1.js
        if (typeof saveProduct === 'function') {
            try { saveProduct(); saved = true; } catch(e) { console.warn(e); }
        } else if (typeof handleFormSubmit === 'function') {
            try { handleFormSubmit(); saved = true; } catch(e) { console.warn(e); }
        }
        
        // Rezervni localStorage upis
        if (!saved) {
            try {
                const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
                zalihe.push({
                    id: Date.now(),
                    product_name: data.product_name,
                    piece: parseInt(data.piece) || 1,
                    quantity: parseFloat(data.quantity) || 1,
                    unit: data.unit || 'kom',
                    shelf_life_months: parseInt(data.shelf_life) || 12,
                    storage_location: data.storage || 'Zamrzivač 1',
                    entry_date: new Date().toISOString().split('T')[0]
                });
                localStorage.setItem('zalihe', JSON.stringify(zalihe));
                saved = true;
            } catch(e) { console.warn(e); }
        }
        
        if (saved) {
            showVoiceStatus(`✅ Sačuvano: ${data.product_name}`, '#4CAF50');
            if (typeof prikaziSveUnose === 'function') try { prikaziSveUnose(); } catch(e) {}
        } else {
            showVoiceStatus('❌ Greška pri čuvanju!', '#f44336');
        }
        
        isVoiceInput = false;
    }, 300);
}

function processAndSaveItem(command) {
    let data = parseVoiceDataEntry(command);
    if (!data.product_name || data.product_name === 'Proizvod' || data.product_name.length < 2) {
        showVoiceStatus('❌ Nisam prepoznao proizvod', '#f44336');
        return false;
    }
    lastSavedData = data;
    sacuvajPodatke(data);
    return true;
}

// ============================================
// 6. OTVARANJE ZALIHA I SPISKA
// ============================================

function otvoriZaliheEkran() {
    if (!ALLOW_INVENTORY_OPEN) {
        showVoiceStatus('⛔ Samo "end" otvara zalihe', '#FF9800');
        return;
    }
    
    // Osvežavanje podataka
    if (typeof refreshInventoryData === 'function') try { refreshInventoryData(); } catch(e) {}
    if (typeof loadInventory === 'function') try { loadInventory(); } catch(e) {}
    
    // Korišćenje tvoje navigacije iz aplikacije umesto ručnog menjanja ekrana
    if (typeof openInventoryAndShowHighlight === 'function') {
        openInventoryAndShowHighlight();
    } else if (typeof showScreen === 'function') {
        showScreen('inventoryScreen');
    } else if (typeof renderInventory === 'function') {
        renderInventory();
    }
    
    showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
    ALLOW_INVENTORY_OPEN = false;
}

// ============================================
// 7. PREPOZNAVANJE GOVORA (LISTEN LOOP)
// ============================================

function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showVoiceStatus('❌ Pregledač ne podržava mikrofon.', '#f44336');
        return;
    }

    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'sr-RS';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
        showVoiceStatus('🎤 Slušam... Recite unos pa "plus" ili "end"', '#2196F3');
        activeBuffer = '';
        isProcessingCommand = false;
        ALLOW_INVENTORY_OPEN = false;
    };

    recognition.onresult = function(event) {
        let interimText = '', finalChunk = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.trim();
            if (event.results[i].isFinal) finalChunk += (finalChunk ? ' ' : '') + transcript;
            else interimText += transcript;
        }
        
        if (finalChunk) activeBuffer += (activeBuffer ? ' ' : '') + finalChunk;
        showVoiceStatus(`🎤 Slušam: "${activeBuffer + (interimText ? ' ' + interimText : '')}"`, '#FFD700');
        
        if (isProcessingCommand) return;
        const lowerFull = activeBuffer.toLowerCase();

        // KOMANDA "END" - ČUVA I OTVARA ZALIHE
        if (lowerFull.includes('end') || lowerFull.includes(' and ')) {
            isProcessingCommand = true;
            ALLOW_INVENTORY_OPEN = true;
            
            let parts = activeBuffer.split(/\b(end|and)\b/i);
            let itemText = parts[0].trim();
            if (itemText.length > 2) processAndSaveItem(itemText);
            
            activeBuffer = '';
            setTimeout(() => {
                stopVoiceRecognition();
                otvoriZaliheEkran();
            }, 500);
            return;
        }
        
        // KOMANDA "PLUS" - ČUVA I NASTAVLJA SLUŠANJE
        if (lowerFull.includes('plus')) {
            isProcessingCommand = true;
            let parts = activeBuffer.split(/\bplus\b/i);
            let itemText = parts[0].trim();
            if (itemText.length > 2) processAndSaveItem(itemText);
            
            activeBuffer = parts.slice(1).join('').trim();
            setTimeout(() => { isProcessingCommand = false; }, 500);
            return;
        }
    };

    recognition.onerror = function(e) {
        showVoiceStatus('⚠️ Greška mikrofona: ' + e.error, '#f44336');
        isProcessingCommand = false;
    };

    try { recognition.start(); } catch(e) {}
}

function stopVoiceRecognition() {
    if (recognition) {
        try { recognition.stop(); recognition = null; } catch(e) {}
    }
    activeBuffer = '';
    showVoiceStatus('⏸️ Mikrofon zaustavljen', '#aaa');
}

// Globalno izlaganje funkcija
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.processVoiceCommand = processAndSaveItem;
window.otvoriZaliheEkran = otvoriZaliheEkran;
