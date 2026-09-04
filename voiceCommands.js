// ============================================
// VOICE COMMANDS - STABILNA VERZIJA v2.2 (MOBILE FIX)
// ============================================

let END_AKTIVAN = false;
let isVoiceInput = false;
let ALLOW_INVENTORY_OPEN = false;
let micRestartTimer = null;

// Pamćenje dozvole u sesiji (sprečava ponovno iskakivanje prozora za dozvolu)
if (typeof window.micPermissionGranted === 'undefined') {
    window.micPermissionGranted = false;
}
let micPermissionGranted = window.micPermissionGranted;

var currentLang = (typeof currentLang !== 'undefined') ? currentLang : 'sr';

// ============================================
// DIREKTNI POKRETAČ
// ============================================

window.forceStartVoice = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    console.log('⚡ Forsirano pokretanje mikrofona...');

    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (location.protocol !== 'https:' && !isLocalhost) {
        showVoiceStatus('❌ Mikrofon radi SAMO na HTTPS vezi!', '#f44336');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showVoiceStatus('❌ Vaš pregledač ne podržava Web Speech API.', '#f44336');
        return;
    }

    requestMicrophonePermission().then(() => {
        showVoiceStatus('🎤 Dozvola odobrena, pokrećem...', '#4CAF50');
        if (typeof window.startVoiceRecognition === 'function') {
            setTimeout(() => { window.startVoiceRecognition(); }, 200);
        }
    }).catch(err => {
        console.error('❌ Dozvola ODBIJENA:', err);
        showVoiceStatus('❌ Dozvolite pristup mikrofonu u podešavanjima!', '#f44336');
    });
};

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
    if (window.micPermissionGranted) {
        return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            reject('Browser ne podržava pristup mikrofonu');
            return;
        }
        
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                stream.getTracks().forEach(track => track.stop());
                window.micPermissionGranted = true;
                micPermissionGranted = true;
                console.log('✅ Dozvola za mikrofon ODOBRENA!');
                resolve(true);
            })
            .catch(function(err) {
                window.micPermissionGranted = false;
                micPermissionGranted = false;
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
    if (typeof prikaziPoljaZaUnos === 'function') {
        setTimeout(prikaziPoljaZaUnos, 100);
    }
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
        isVoiceInput = false;
    }, 500);
    return saved;
}

// ============================================
// 4. PREPOZNAVANJE GOVORA (GLAVNA FUNKCIJA)
// ============================================

function startVoiceRecognition() {
    console.log('🎤 startVoiceRecognition pozvan!');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showVoiceStatus('❌ Pregledač ne podržava glasovne komande.', '#f44336');
        return;
    }

    if (window.recognition) {
        try { window.recognition.stop(); } catch(e) {}
        window.recognition = null;
    }

    window.isVoiceModeActive = true;

    function beginRecognition() {
        window.recognition = new SpeechRecognition();

        const speechLangMap = {
            sr: 'sr-RS', en: 'en-US', de: 'de-DE',
            hu: 'hu-HU', uk: 'uk-UA', ru: 'ru-RU',
            es: 'es-ES', fr: 'fr-FR'
        };
        window.recognition.lang = speechLangMap[currentLang] || 'sr-RS';

        // Ključna podešavanja za kontinuirano slušanje
        window.recognition.continuous = true;
        window.recognition.interimResults = true;

        window.recognition.onstart = function() {
            showVoiceStatus('🎤 Slušam...', '#4CAF50');
        };

        window.recognition.onresult = function(event) {
            let finalText = '';
            let interimText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript.trim();
                if (event.results[i].isFinal) {
                    finalText += (finalText ? ' ' : '') + transcript;
                } else {
                    interimText += transcript;
                }
            }

            if (interimText) {
                showVoiceStatus(`🎤 Slušam: "${interimText}"`, '#FFD700');
            }

            if (finalText) {
                showVoiceStatus(`🎤 Čuo: "${finalText}"`, '#4CAF50');
                if (typeof processVoiceCommand === 'function') {
                    processVoiceCommand(finalText);
                }
            }
        };

        window.recognition.onerror = function(event) {
            if (event.error === 'no-speech' || event.error === 'aborted') return;
            
            if (event.error === 'not-allowed') {
                showVoiceStatus('❌ Pristup mikrofonu blokiran.', '#f44336');
                window.isVoiceModeActive = false;
                window.micPermissionGranted = false;
            } else {
                showVoiceStatus(`❌ Greška: ${event.error}`, '#f44336');
            }
        };

        window.recognition.onend = function() {
            console.log('⏹️ Mikrofon je pauziran');
            // Automatsko pokretanje BEZ ponovnog traženja dozvole
            if (window.isVoiceModeActive) {
                setTimeout(() => {
                    if (window.isVoiceModeActive && window.recognition) {
                        try { window.recognition.start(); } catch(e) {}
                    }
                }, 300);
            }
        };

        try {
            window.recognition.start();
        } catch(e) {
            console.error('❌ Greška pri pokretanju:', e);
        }
    }

    if (window.micPermissionGranted) {
        beginRecognition();
    } else {
        requestMicrophonePermission().then(beginRecognition).catch(err => {
            showVoiceStatus('❌ Mikrofon nije odobren.', '#f44336');
        });
    }
}

function stopVoiceRecognition() {
    console.log('🛑 stopVoiceRecognition pozvan');
    window.isVoiceModeActive = false;

    if (window.recognition) {
        window.recognition.onend = null;
        try { window.recognition.stop(); } catch(e) {}
        window.recognition = null;
    }
    showVoiceStatus('🎤 Mikrofon isključen', '#999999');
}

function processVoiceCommand(command) {
    if (!command || command.length < 2) return;
    
    const cmd = command.toLowerCase().trim();
    
    if (cmd === 'start' || cmd === 'pokreni' || cmd === 'počni') {
        if (typeof renderDataEntry === 'function') renderDataEntry('');
        showVoiceStatus('🎤 Unos otvoren, recite proizvod...', '#4CAF50');
        return;
    }
    
    if (cmd.includes('plus') || cmd.includes('dodaj') || cmd.includes('sačuvaj')) {
        let productName = command.replace(/plus|dodaj|sačuvaj|sacuvaj/gi, '').trim();
        if (productName.length > 2) {
            const productInput = document.getElementById('productInput');
            if (productInput) {
                productInput.value = productName;
                productInput.dispatchEvent(new Event('input', { bubbles: true }));
                if (typeof saveProduct === 'function') saveProduct();
            }
        }
        return;
    }
    
    if (cmd.includes('zalihe') || cmd.includes('inventar')) {
        if (typeof renderInventory === 'function') renderInventory();
        stopVoiceRecognition();
        return;
    }
    
    if (cmd.includes('end') || cmd.includes('kraj') || cmd.includes('stop')) {
        if (typeof renderInventory === 'function') renderInventory();
        stopVoiceRecognition();
        return;
    }

    const dataEntryScreen = document.getElementById('dataEntryScreen');
    if (dataEntryScreen && dataEntryScreen.style.display !== 'none') {
        const data = parseVoiceDataEntry(command);
        if (data.product_name && data.product_name !== 'Proizvod') {
            popuniFormuPodacima(data);
        }
        return;
    }
    
    if (command.length > 3) {
        if (typeof renderDataEntry === 'function') renderDataEntry('');
        const data = parseVoiceDataEntry(command);
        popuniFormuPodacima(data);
    }
}

// ============================================
// 5. IZVOZ ZA GLOBAL
// ============================================

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.requestMicrophonePermission = requestMicrophonePermission;
window.processVoiceCommand = processVoiceCommand;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.sacuvajPodatke = sacuvajPodatke;
window.popuniFormuPodacima = popuniFormuPodacima;
window.ensureFormVisible = ensureFormVisible;
window.prikaziPoljaZaUnos = prikaziPoljaZaUnos;
window.hideVoiceMenu = hideVoiceMenu;
window.showVoiceStatus = showVoiceStatus;
window._voiceCommandsStart = startVoiceRecognition;

console.log('✅ VoiceCommands.js uspesno ucitan i spreman za rad!');
