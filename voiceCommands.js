// ============================================
// VOICE COMMANDS - KONAČNA POPRAVLJENA VERZIJA v2.1
// ============================================

let activeBuffer = ''; 
let lastSavedData = null;
let isProcessingCommand = false;
let END_AKTIVAN = false;
let isVoiceInput = false;
let ALLOW_INVENTORY_OPEN = false;
let micRestartTimer = null;
let recognition = null;
let micActive = false;

// ============================================
// 1. POMOĆNE FUNKCIJE
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

function requestMicrophonePermission() {
    return new Promise((resolve, reject) => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            reject('Browser ne podržava pristup mikrofonu ili niste na HTTPS-u');
            return;
        }
        
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                stream.getTracks().forEach(track => track.stop());
                console.log('✅ Dozvola za mikrofon ODOBRENA!');
                resolve(true);
            })
            .catch(function(err) {
                console.error('❌ Dozvola za mikrofon ODBIJENA:', err);
                reject(err);
            });
    });
}

// ============================================
// 2. REČNICI I PARSIRANJE
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

function getNumber(word) {
    const w = word.toLowerCase().trim();
    if (NUMBER_WORDS[w] !== undefined) return NUMBER_WORDS[w];
    if (/^\d+(?:[.,]\d+)?$/.test(w)) return w.replace(',', '.');
    return null;
}

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

function getUnit(word) { return UNIT_MAP[word.toLowerCase()] || null; }

function getStorage(word) {
    const w = word.toLowerCase();
    for (let key in STORAGE_MAP) {
        if (w.includes(key) || key.includes(w)) return STORAGE_MAP[key];
    }
    return null;
}

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
    let skipWords = ['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'i'];
    
    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        let storageMatch = getStorage(w);
        if (storageMatch) { foundStorage = storageMatch; storageIndex = i; }
        let unitMatch = getUnit(w);
        if (unitMatch) { foundUnit = unitMatch; unitIndex = i; }
    }
    
    for (let i = 0; i < words.length; i++) {
        if (i === storageIndex || i === unitIndex || skipWords.includes(words[i].toLowerCase())) continue;
        let numVal = getNumber(words[i]);
        if (numVal !== null) { numbers.push(numVal); } 
        else { nameParts.push(words[i]); }
    }
    
    if (foundUnit === 'kg' || foundUnit === 'g' || foundUnit === 'l') {
        if (numbers.length >= 2) { result.piece = numbers[0]; result.quantity = numbers[1]; }
        else if (numbers.length === 1) { result.piece = '0'; result.quantity = numbers[0]; }
    } else {
        if (numbers.length >= 1) { result.piece = numbers[0]; result.quantity = numbers[0]; }
    }
    
    let meseciMatch = text.match(/(\d+)\s*meseci/);
    if (meseciMatch) { result.shelf_life = meseciMatch[1]; } 
    else if (numbers.length >= 3) { result.shelf_life = numbers[2]; }
    
    result.product_name = nameParts.filter(part => !/^\d+$/.test(part)).join(' ').trim() || 'Proizvod';
    if (foundUnit) result.unit = foundUnit;
    if (foundStorage) result.storage = foundStorage;
    
    return result;
}

// ============================================
// 3. PRIKAZ I POPUNJAVANJE FORME
// ============================================

function ensureFormVisible() {
    document.querySelectorAll('.screen').forEach(s => { s.style.display = 'none'; s.classList.remove('active'); });
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) { mainScreen.style.display = 'flex'; mainScreen.classList.add('active'); }
    const dataEntry = document.getElementById('dataEntryScreen');
    if (dataEntry) { dataEntry.style.display = 'block'; dataEntry.classList.add('active'); }
    setTimeout(prikaziPoljaZaUnos, 100);
}

function prikaziPoljaZaUnos() {
    ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput', 'unitSelect', 'storageSelect'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.style.display = 'block'; el.style.visibility = 'visible'; el.style.opacity = '1'; }
    });
}

function popuniFormuPodacima(data) {
    ensureFormVisible();
    setTimeout(() => {
        prikaziPoljaZaUnos();
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
        };
        setVal('productInput', data.product_name || '');
        setVal('pieceInput', data.piece || '1');
        setVal('quantityInput', data.quantity || '1');
        setVal('shelfLifeInput', data.shelf_life || '12');
        showVoiceStatus(`✅ Uneto: ${data.product_name} (${data.quantity} ${data.unit})`, '#4CAF50');
    }, 200);
}

function sacuvajPodatke(data) {
    ALLOW_INVENTORY_OPEN = false;
    END_AKTIVAN = false;
    isVoiceInput = true;
    
    let saved = false;
    popuniFormuPodacima(data);
    
    setTimeout(() => {
        if (typeof saveProduct === 'function') {
            try { saveProduct(); saved = true; } catch(e) { console.warn(e); }
        }
        if (!saved) {
            try {
                const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
                zalihe.push({
                    id: Date.now(), product_name: data.product_name,
                    piece: parseInt(data.piece) || 1, quantity: parseFloat(data.quantity) || 1,
                    unit: data.unit || 'kom', shelf_life_months: parseInt(data.shelf_life) || 12,
                    storage_location: data.storage || 'Zamrzivač 1',
                    entry_date: new Date().toISOString().split('T')[0], isNew: true
                });
                localStorage.setItem('zalihe', JSON.stringify(zalihe));
                saved = true;
            } catch(e) { console.warn(e); }
        }
        if (saved) saveLastAddedProducts(data);
        isVoiceInput = false;
    }, 500);
    return saved;
}

function processAndSaveItem(command) {
    let data = parseVoiceDataEntry(command);
    if (!data.product_name || data.product_name === 'Proizvod' || data.product_name.length < 2) return false;
    lastSavedData = data;
    sacuvajPodatke(data);
    return true;
}

function otvoriZaliheEkran() {
    if (!ALLOW_INVENTORY_OPEN) return;
    const inv = document.getElementById('inventoryScreen');
    const main = document.getElementById('mainScreen');
    if (inv) {
        if (main) main.style.display = 'none';
        inv.style.display = 'flex';
        inv.classList.add('active');
    }
    showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
    ALLOW_INVENTORY_OPEN = false;
}

// ============================================
// 4. PREPOZNAVANJE GOVORA (GLAVNA FUNKCIJA)
// ============================================

function startVoiceRecognition() {
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showVoiceStatus('❌ Pregledač ne podržava Web Speech API.', '#f44336');
        return;
    }

    recognition = new SpeechRecognition();
    const langCode = typeof currentLang !== 'undefined' ? currentLang : 'sr';
    const speechLangMap = { sr: 'sr-RS', en: 'en-US', de: 'de-DE', hu: 'hu-HU', uk: 'uk-UA', ru: 'ru-RU', es: 'es-ES', fr: 'fr-FR' };
    
    recognition.lang = speechLangMap[langCode] || 'sr-RS';
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    recognition.continuous = !isMobile;
    recognition.interimResults = true;

    recognition.onstart = function() {
        showVoiceStatus('🎤 Slušam...', '#4CAF50');
        activeBuffer = '';
        isProcessingCommand = false;
        window.isVoiceModeActive = true;
        micActive = true;
    };

    recognition.onresult = function(event) {
        let interimText = '', finalChunk = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.trim();
            if (event.results[i].isFinal) finalChunk += (finalChunk ? ' ' : '') + transcript;
            else interimText += transcript;
        }
        if (finalChunk) activeBuffer += (activeBuffer ? ' ' : '') + finalChunk;
        
        showVoiceStatus(`🎤 Slušam: "${activeBuffer || interimText}"`, '#FFD700');
        if (isProcessingCommand) return;
        
        const lowerFull = activeBuffer.toLowerCase();

        if (lowerFull.includes('exit') || lowerFull.includes('izlaz')) {
            isProcessingCommand = true;
            stopVoiceRecognition();
            if (typeof window.exitApp === 'function') window.exitApp();
            return;
        }

        if (lowerFull.includes('plus')) {
            isProcessingCommand = true;
            let parts = activeBuffer.split(/\bplus\b/i);
            if (parts[0].trim().length > 2) processAndSaveItem(parts[0].trim());
            activeBuffer = '';
            showVoiceStatus('✅ Sačuvano! Recite sledeći ili "end".', '#4CAF50');
            setTimeout(() => { isProcessingCommand = false; }, 800);
            return;
        }

        if (lowerFull.includes('end') || lowerFull.includes('kraj')) {
            isProcessingCommand = true;
            ALLOW_INVENTORY_OPEN = true;
            let parts = activeBuffer.split(/\bend\b|\bkraj\b/i);
            if (parts[0].trim().length > 2) processAndSaveItem(parts[0].trim());
            activeBuffer = '';
            stopVoiceRecognition();
            otvoriZaliheEkran();
            return;
        }
    };

    recognition.onerror = function(event) {
        if (event.error === 'not-allowed') showVoiceStatus('❌ Pristup mikrofonu je blokiran (traži HTTPS)!', '#f44336');
        isProcessingCommand = false;
    };

    recognition.onend = function() {
        micActive = false;
        if (window.isVoiceModeActive) {
            setTimeout(() => { if (!recognition) startVoiceRecognition(); }, 500);
        }
    };

    try { recognition.start(); } catch(e) { console.error(e); }
}

function stopVoiceRecognition() {
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    window.isVoiceModeActive = false;
    activeBuffer = '';
    isProcessingCommand = false;
    showVoiceStatus('⏸️ Prepoznavanje zaustavljeno', '#aaa');
}

function selectVoiceMode() {
    showVoiceStatus('🎤 Tražim dozvolu za mikrofon...', '#FFD700');
    requestMicrophonePermission().then(() => {
        hideVoiceMenu();
        window.isVoiceModeActive = true;
        startVoiceRecognition();
    }).catch(err => {
        showVoiceStatus('❌ Dozvolite pristup mikrofonu u podešavanjima!', '#f44336');
    });
}

function saveLastAddedProducts(product) {
    try {
        let lastAdded = JSON.parse(localStorage.getItem('lastAddedProducts') || '[]');
        lastAdded.unshift({ product_name: product.product_name, timestamp: Date.now() });
        localStorage.setItem('lastAddedProducts', JSON.stringify(lastAdded.slice(0, 10)));
    } catch (e) {}
}

// ============================================
// 5. IZVOZ ZA HTML DUGMAD
// ============================================

window.selectVoiceMode = selectVoiceMode;
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.requestMicrophonePermission = requestMicrophonePermission;
window.processVoiceCommand = processAndSaveItem;
