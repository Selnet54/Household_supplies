// ============================================
// VOICE COMMANDS - UJEDINJENA I POPRAVLJENA VERZIJA
// ============================================

let activeBuffer = ''; 
let recognition = null;
let lastSavedData = null;
let isProcessingCommand = false;
let ALLOW_INVENTORY_OPEN = false;

// 1. NAVIGATION & SCREEN CONTROLS
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

function ensureFormVisible() {
    hideVoiceMenu();
    
    // Sakrij sve ostale ekrane
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    // Prikaži mainScreen i dataEntryScreen polja
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    
    const dataEntry = document.getElementById('dataEntryScreen');
    if (dataEntry) {
        dataEntry.style.display = 'block';
        dataEntry.style.visibility = 'visible';
        dataEntry.style.opacity = '1';
        dataEntry.classList.add('active');
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

// 2. DICTIONARIES & PARSING LOGIC
const NUMBER_WORDS = {
    'jedan': '1', 'jedna': '1', 'jedno': '1', 'dva': '2', 'dve': '2', 'tri': '3',
    'četiri': '4', 'cetiri': '4', 'pet': '5', 'šest': '6', 'sest': '6', 'sedam': '7',
    'osam': '8', 'devet': '9', 'deset': '10', 'dvadeset': '20', 'trideset': '30',
    'četrdeset': '40', 'cetrdeset': '40', 'pedeset': '50', 'sto': '100'
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

function parseVoiceDataEntry(command) {
    let text = command.replace(/^unos\s*/i, '').replace(/^start\s*/i, '').trim();
    let words = text.split(/\s+/).map(s => s.trim()).filter(Boolean);
    
    let result = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    let numbers = [];
    let nameParts = [];
    let skipWords = ['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'i'];
    
    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        
        // Provera skladišta
        for (let key in STORAGE_MAP) {
            if (w.includes(key)) { result.storage = STORAGE_MAP[key]; }
        }
        
        // Provera jedinica
        if (UNIT_MAP[w]) { result.unit = UNIT_MAP[w]; continue; }
        
        // Provera brojeva
        let numVal = NUMBER_WORDS[w] || (!isNaN(w) ? w : null);
        if (numVal !== null) {
            numbers.push(numVal);
            continue;
        }
        
        if (!skipWords.includes(w) && !Object.keys(STORAGE_MAP).some(k => w.includes(k))) {
            nameParts.push(words[i]);
        }
    }
    
    // Dodeljivanje vrednosti brojevima
    if (numbers.length >= 2) {
        result.piece = numbers[0];
        result.quantity = numbers[1];
    } else if (numbers.length === 1) {
        result.piece = numbers[0];
        result.quantity = numbers[0];
    }
    
    let meseciMatch = text.match(/(\d+)\s*meseci/);
    if (meseciMatch) {
        result.shelf_life = meseciMatch[1];
    } else if (numbers.length >= 3) {
        result.shelf_life = numbers[2];
    }
    
    result.product_name = nameParts.join(' ').trim() || 'Proizvod';
    return result;
}

// 3. FORM FILLING & SAVING
function popuniFormuPodacima(data) {
    ensureFormVisible();
    
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
            el.value = val;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };

    setVal('productInput', data.product_name);
    setVal('pieceInput', data.piece);
    setVal('quantityInput', data.quantity);
    setVal('shelfLifeInput', data.shelf_life);
    setVal('unitSelect', data.unit);
    setVal('storageSelect', data.storage);

    if (typeof updateExpiryDate === 'function') {
        try { updateExpiryDate(); } catch(e) {}
    }
    
    showVoiceStatus(`✅ Uneto: ${data.product_name} (${data.quantity} ${data.unit})`, '#4CAF50');
}

function sacuvajPodatke(data) {
    popuniFormuPodacima(data);
    let saved = false;

    // Pokušaj preko postojecih funkcija sistema
    if (typeof saveProduct === 'function') {
        try { saveProduct(); saved = true; } catch(e) {}
    }
    
    // Rezervni upis u localStorage ako funkcija ne postoji
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

    if (saved && typeof prikaziSveUnose === 'function') {
        try { prikaziSveUnose(); } catch(e) {}
    }
    
    return saved;
}

function processAndSaveItem(command) {
    let data = parseVoiceDataEntry(command);
    if (!data.product_name || data.product_name === 'Proizvod') return false;
    lastSavedData = data;
    sacuvajPodatke(data);
    return true;
}

// 4. SCREEN SWITCHING (END COMMAND)
function otvoriZaliheEkran() {
    if (!ALLOW_INVENTORY_OPEN) return;
    
    if (typeof refreshInventoryData === 'function') refreshInventoryData();
    if (typeof renderInventory === 'function') renderInventory();
    
    if (typeof openInventoryAndShowHighlight === 'function') {
        openInventoryAndShowHighlight();
    } else if (typeof showScreen === 'function') {
        showScreen('inventoryScreen');
    } else {
        const inv = document.getElementById('inventoryScreen');
        const main = document.getElementById('mainScreen');
        if (inv) {
            if (main) main.style.display = 'none';
            inv.style.display = 'flex';
            inv.classList.add('active');
        }
    }
    showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
    ALLOW_INVENTORY_OPEN = false;
}

// 5. RECOGNITION ENGINE
function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognition) {
        try { recognition.stop(); } catch(e) {}
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'sr-RS';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
        showVoiceStatus('🎤 Slušam... Diktirajte podatke', '#2196F3');
        activeBuffer = '';
        isProcessingCommand = false;
    };

    recognition.onresult = function(event) {
        let interimText = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                finalChunk += event.results[i][0].transcript + ' ';
            } else {
                interimText += event.results[i][0].transcript;
            }
        }

        if (finalChunk) activeBuffer += finalChunk;
        showVoiceStatus(`🎤 Slušam: "${activeBuffer + interimText}"`, '#FFD700');

        if (isProcessingCommand) return;
        const lowerFull = activeBuffer.toLowerCase();

        // KOMANDA: END (Čuva i otvara Zalihe)
        if (/\b(end|kraj)\b/i.test(lowerFull)) {
            isProcessingCommand = true;
            ALLOW_INVENTORY_OPEN = true;
            
            let itemText = activeBuffer.split(/\b(end|kraj)\b/i)[0].trim();
            if (itemText.length > 2) processAndSaveItem(itemText);
            
            stopVoiceRecognition();
            setTimeout(() => { otvoriZaliheEkran(); }, 500);
            return;
        }

        // KOMANDA: PLUS (Čuva i nastavlja unos)
        if (/\b(plus|dodaj)\b/i.test(lowerFull)) {
            isProcessingCommand = true;
            
            let parts = activeBuffer.split(/\b(plus|dodaj)\b/i);
            let itemText = parts[0].trim();
            if (itemText.length > 2) processAndSaveItem(itemText);

            activeBuffer = parts.slice(2).join('').trim();
            showVoiceStatus('✅ Sačuvano. Nastavite diktat...', '#4CAF50');

            setTimeout(() => { isProcessingCommand = false; }, 600);
            return;
        }
    };

    recognition.start();
}

function stopVoiceRecognition() {
    if (recognition) {
        try { recognition.stop(); recognition = null; } catch(e) {}
    }
    activeBuffer = '';
    showVoiceStatus('⏸️ Glasovni unos zaustavljen', '#aaa');
}

// Expose controls
window.selectVoiceMode = function() {
    ensureFormVisible();
    startVoiceRecognition();
};
window.stopVoiceRecognition = stopVoiceRecognition;
