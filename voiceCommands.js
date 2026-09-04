// ============================================
// VOICE COMMANDS - KONAČNA VERZIJA v2.1 (FIXED)
// ============================================

// exitApp i goBackFromVoice žive u script1.js
isRestarting = false;
END_AKTIVAN = false;
isVoiceInput = false;
ALLOW_INVENTORY_OPEN = false;
micRestartTimer = null;

let micPermissionGranted = false;
var currentLang = (typeof currentLang !== 'undefined') ? currentLang : 'sr';

// ============================================
// DIREKTNI POKRETAČ ZA 4. EKRAN
// ============================================

window.forceStartVoice = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    console.log('⚡ Forsirano pokretanje mikrofona sa 4. ekrana...');

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
        console.log('✅ Dozvola za mikrofon odobrena!');
        showVoiceStatus('🎤 Dozvola odobrena, pokrećem...', '#4CAF50');
        
        if (typeof window.startVoiceRecognition === 'function') {
            setTimeout(() => {
                window.startVoiceRecognition();
            }, 300);
        } else {
            console.error('❌ Funkcija startVoiceRecognition nije pronađena.');
            showVoiceStatus('❌ Greška: funkcija nije učitana', '#f44336');
        }
    }).catch(err => {
        console.error('❌ Dozvola za mikrofon ODBIJENA:', err);
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
    if (micPermissionGranted) {
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
                micPermissionGranted = true;
                console.log('✅ Dozvola za mikrofon ODBIJENA/ODOBRENA!');
                resolve(true);
            })
            .catch(function(err) {
                micPermissionGranted = false;
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
    prikaziPoljaZaUnos();
}

function prikaziPoljaZaUnos() {
    ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput', 'unitSelect', 'storageSelect'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.style.display = 'block'; el.style.visibility = 'visible'; el.style.opacity = '1'; }
    });
}

function popuniFormuPodacima(data) {
    ensureFormVisible();
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
    };
    setVal('productInput', data.product_name || '');
    setVal('pieceInput', data.piece || '1');
    setVal('quantityInput', data.quantity || '1');
    setVal('shelfLifeInput', data.shelf_life || '12');
    setVal('unitSelect', data.unit || 'kom');
    setVal('storageSelect', data.storage || 'Zamrzivač 1');
    
    showVoiceStatus(`✅ Uneto: ${data.product_name} (${data.quantity} ${data.unit})`, '#4CAF50');
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
        if (saved && typeof saveLastAddedProducts === 'function') {
            saveLastAddedProducts(data);
        }
        isVoiceInput = false;
    }, 200);
    return saved;
}

function processAndSaveItem(command) {
    let data = parseVoiceDataEntry(command);
    if (!data.product_name || data.product_name === 'Proizvod' || data.product_name.length < 2) return false;
    lastSavedData = data;
    sacuvajPodatke(data);
    return true;
}

// ============================================
// 4. PREPOZNAVANJE GOVORA
// ============================================

function startVoiceRecognition() {
    console.log('🎤 startVoiceRecognition pozvan!');

    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    if (isIOS && isSafari) {
        showVoiceStatus('❌ Glasovni unos nije podržan u Safari na iOS-u.', '#f44336');
        return;
    }

    if (recognition) {
        recognition.onend = null;
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    if (micRestartTimer) {
        clearTimeout(micRestartTimer);
        micRestartTimer = null;
    }

    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        showVoiceStatus('❌ Mikrofon radi SAMO na HTTPS!', '#f44336');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showVoiceStatus('❌ Pregledač ne podržava Web Speech API.', '#f44336');
        return;
    }

    window.isVoiceModeActive = true;

    function beginRecognition() {
        recognition = new SpeechRecognition();

        const speechLangMap = {
            sr: 'sr-RS', en: 'en-US', de: 'de-DE',
            hu: 'hu-HU', uk: 'uk-UA', ru: 'ru-RU',
            es: 'es-ES', fr: 'fr-FR'
        };
        recognition.lang = speechLangMap[currentLang] || 'sr-RS';

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = function() {
            showVoiceStatus('🎤 Slušam...', '#4CAF50');
            activeBuffer = '';
            isProcessingCommand = false;
            micActive = true;
            console.log('✅ Mikrofon aktivan!');
        };

        recognition.onresult = function(event) {
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
                console.log('📝 Finalno čujem:', finalText);
                showVoiceStatus(`🎤 Čuo: "${finalText}"`, '#4CAF50');

                if (typeof processVoiceCommand === 'function') {
                    processVoiceCommand(finalText);
                } else {
                    console.error('❌ processVoiceCommand nije definisan!');
                }
            }
        };

        recognition.onerror = function(event) {
            console.error('❌ Speech error:', event.error);

            if (event.error === 'aborted' || event.error === 'no-speech') {
                console.log('⏸️ Normalna greška, ignorišem:', event.error);
                return;
            }

            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                showVoiceStatus('❌ Pristup mikrofonu je blokiran!', '#f44336');
                window.isVoiceModeActive = false;
                micPermissionGranted = false; 
            } else {
                showVoiceStatus(`❌ Greška: ${event.error}`, '#f44336');
            }
            isProcessingCommand = false;
        };

        recognition.onend = function() {
            console.log('⏹️ Mikrofon zaustavljen');
            micActive = false;
            
            if (window.isVoiceModeActive && !isRestarting) {
                isRestarting = true;
                console.log('🔄 Restartovanje mikrofona sa zadrškom...');
                
                micRestartTimer = setTimeout(function() {
                    isRestarting = false;
                    if (window.isVoiceModeActive && !micActive) {
                        startVoiceRecognition();
                    }
                }, 1000); 
            }
        };

        try {
            recognition.start();
            console.log('✅ Recognition startovan!');
        } catch(e) {
            console.error('❌ Greška pri startovanju:', e);
            showVoiceStatus('❌ Greška pri pokretanju mikrofona', '#f44336');
        }
    }

    if (micPermissionGranted) {
        beginRecognition();
        return;
    }

    requestMicrophonePermission().then(beginRecognition).catch(err => {
        console.error('❌ Dozvola za mikrofon ODBIJENA:', err);
        window.isVoiceModeActive = false;
        showVoiceStatus('❌ Dozvolite pristup mikrofonu u podešavanjima!', '#f44336');
    });
}

function stopVoiceRecognition() {
    console.log('🛑 stopVoiceRecognition pozvan');
    window.isVoiceModeActive = false;

    if (micRestartTimer) {
        clearTimeout(micRestartTimer);
        micRestartTimer = null;
    }

    if (recognition) {
        recognition.onend = null; 
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    
    micActive = false;
    isRestarting = false;
    showVoiceStatus('🎤 Mikrofon zaustavljen', '#999999');
}

function processVoiceCommand(command) {
    console.log('🎤 processVoiceCommand prima:', command);
    
    if (!command || command.length < 2) {
        showVoiceStatus('❌ Nisam čuo ništa, pokušajte ponovo.', '#f44336');
        return;
    }
    
    const cmd = command.toLowerCase().trim();
    
    if (cmd === 'start' || cmd === 'pokreni' || cmd === 'zapocni' || cmd === 'počni') {
        ensureFormVisible();
        showVoiceStatus('🎤 Unos otvoren, recite naziv proizvoda...', '#4CAF50');
        return;
    }
    
    if (cmd.includes('zalihe') || cmd.includes('stanje') || cmd.includes('inventar')) {
        if (typeof renderInventory === 'function') renderInventory();
        stopVoiceRecognition();
        return;
    }
    
    if (cmd.includes('spisak') || cmd.includes('lista') || cmd.includes('kupovina')) {
        if (typeof renderShoppingList === 'function') renderShoppingList();
        stopVoiceRecognition();
        return;
    }
    
    if (cmd.includes('end') || cmd.includes('kraj') || cmd.includes('gotovo')) {
        if (typeof renderInventory === 'function') renderInventory();
        stopVoiceRecognition();
        return;
    }
    
    if (cmd.includes('exit') || cmd.includes('izlaz') || cmd.includes('zatvori')) {
        stopVoiceRecognition();
        if (typeof exitApp === 'function') exitApp();
        return;
    }
    
    if (cmd.includes('nazad') || cmd.includes('back')) {
        stopVoiceRecognition();
        if (typeof goBack === 'function') goBack();
        return;
    }

    // STRUKTURIRANI UNOS (Podrazumevana obrada za sve unose sa parametrima)
    if (command.length > 2) {
        processAndSaveItem(command);
    }
}

// ============================================
// 5. EVENT LISTENERI I IZVOZI
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('activateMicBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function(e) {
            e.preventDefault();
            startVoiceRecognition();
        });
    }
});

window.addEventListener('beforeunload', function() {
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    micActive = false;
    window.isVoiceModeActive = false;
});

// GLOBALNI IZVOZI
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.requestMicrophonePermission = requestMicrophonePermission;
window.processVoiceCommand = processVoiceCommand;
window.prikaziPoljaZaUnos = prikaziPoljaZaUnos;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.sacuvajPodatke = sacuvajPodatke;
window.popuniFormuPodacima = popuniFormuPodacima;
window.ensureFormVisible = ensureFormVisible;
window.hideVoiceMenu = hideVoiceMenu;
window.showVoiceStatus = showVoiceStatus;
window._voiceCommandsStart = startVoiceRecognition;

console.log('✅ VoiceCommands.js v2.1 FIX - USPEŠNO UČITAN I REFAKTORISAN!');
