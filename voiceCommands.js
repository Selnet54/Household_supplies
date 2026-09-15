// ============================================
// VOICE COMMANDS - v13.0 (STABILNI ANDROID / TABLET FIX)
// ============================================

var recognition = null;
var micActive = false;
var activeBuffer = '';
var isProcessingCommand = false;

let END_AKTIVAN = false;
let isVoiceInput = false;
let micRestartTimer = null;
let isRestarting = false;
let micPermissionGranted = false;
let noSpeechTimer = null;

let voiceBuffer = '';
let wakeLock = null;
let silentAudioCtx = null;

if (typeof window.currentLang === 'undefined') {
    window.currentLang = 'sr';
}

// ============================================
// 1. POMOĆNE FUNKCIJE & ANDROID KEEP-ALIVE
// ============================================

function showVoiceStatus(text, color) {
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = text;
        if (color) statusEl.style.color = color;
    }
    console.log('[VOICE]', text);
}

// Drži Android mobilni audio subsistem budnim (sprečava nasilno gašenje mikrofona od strane OS-a)
function keepAndroidAudioAlive() {
    try {
        if (!silentAudioCtx) {
            silentAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            let osc = silentAudioCtx.createOscillator();
            let gain = silentAudioCtx.createGain();
            gain.gain.value = 0.001; // Praktično nečujno
            osc.connect(gain);
            gain.connect(silentAudioCtx.destination);
            osc.start();
        } else if (silentAudioCtx.state === 'suspended') {
            silentAudioCtx.resume();
        }
    } catch(e) {
        console.warn('⚠️ AudioContext Keep-Alive greška:', e);
    }
}

// Sprečava mobilni telefon da uspava ekran dok sluša
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('💡 WakeLock aktivan: Ekran osiguran od zaključavanja');
        }
    } catch (err) {
        console.warn('⚠️ Wake Lock nije dostupan:', err);
    }
}

function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release().then(() => {
            wakeLock = null;
            console.log('💡 WakeLock oslobođen');
        });
    }
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
                console.log('✅ Dozvola za mikrofon ODOBRENA!');
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
// 2. REČNICI
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
    'gram': 'g', 'grama': 'g', 'grami': 'g', 'g': 'g',
    'litar': 'l', 'litara': 'l', 'litri': 'l', 'l': 'l',
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

// ============================================
// 3. PARSER
// ============================================

function parseVoiceDataEntry(command) {
    console.log('🔍 PARSIRAM:', command);
    
    let text = command
        .replace(/^(unos|start|dodaj|novi|novo|add|unesi)\s*/i, '')
        .replace(/\b(plus|end|kraj|gotovo|zavrsi)\b/gi, '')
        .trim();
    
    let words = text.split(/\s+/).filter(Boolean);
    console.log('📝 REČI:', words);
    
    let result = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '6',
        storage: 'Zamrzivač 1'
    };
    
    let foundUnit = null;
    let unitIndex = -1;
    let unitWords = ['kilogram', 'kilograma', 'kg', 'kilogrami',
                     'gram', 'grama', 'grami', 'g',
                     'litar', 'litara', 'litri', 'l',
                     'komad', 'komada', 'kom', 'komadi',
                     'paket', 'paketa', 'pak', 'paketi'];
    
    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        if (unitWords.includes(w)) {
            foundUnit = getUnit(w);
            unitIndex = i;
            break;
        }
    }
    
    let foundStorage = null;
    let storageIndex = -1;
    let storageWords = ['zamrzivač', 'zamrzivac', 'frižider', 'frizider', 'ostava', 'špajz'];
    
    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        for (let sw of storageWords) {
            if (w.includes(sw) || sw.includes(w)) {
                foundStorage = getStorage(sw);
                storageIndex = i;
                break;
            }
        }
        if (foundStorage) break;
    }
    
    let nameParts = [];
    let firstNumberIndex = words.length;
    
    for (let i = 0; i < words.length; i++) {
        if (getNumber(words[i]) !== null) {
            firstNumberIndex = i;
            break;
        }
    }
    
    for (let i = 0; i < firstNumberIndex; i++) {
        let w = words[i].toLowerCase();
        if (!unitWords.includes(w) && !storageWords.some(sw => w.includes(sw) || sw.includes(w))) {
            nameParts.push(words[i]);
        }
    }
    
    result.product_name = nameParts.join(' ').trim() || 'Proizvod';
    
    let numbers = [];
    for (let i = firstNumberIndex; i < words.length; i++) {
        if (i === unitIndex) continue;
        if (storageIndex !== -1 && i === storageIndex) continue;
        let num = getNumber(words[i]);
        if (num !== null) {
            numbers.push(num);
        }
    }
    
    if (foundUnit === 'kg' || foundUnit === 'g' || foundUnit === 'l') {
        if (numbers.length === 1) {
            result.piece = '1';
            result.quantity = numbers[0];
        } else if (numbers.length === 2) {
            result.piece = '1';
            result.quantity = numbers[0];
            result.shelf_life = numbers[1];
        } else if (numbers.length >= 3) {
            result.piece = numbers[0];
            result.quantity = numbers[1];
            result.shelf_life = numbers[2];
        }
    } else {
        if (numbers.length === 1) {
            result.piece = numbers[0];
            result.quantity = numbers[0];
        } else if (numbers.length >= 2) {
            result.piece = numbers[0];
            result.quantity = numbers[0];
            result.shelf_life = numbers[1];
        }
    }
    
    let meseciMatch = text.match(/(\d+|jedan|dva|tri|četiri|pet|šest|sedam|osam|devet|deset|jedanaest|dvanaest)\s*meseci/i);
    if (meseciMatch) {
        let val = meseciMatch[1].toLowerCase();
        if (NUMBER_WORDS[val]) val = NUMBER_WORDS[val];
        result.shelf_life = val;
    }
    
    if (foundUnit) result.unit = foundUnit;
    if (foundStorage) result.storage = foundStorage;
    
    return result;
}

// ============================================
// 4. POPUNJAVANJE FORME
// ============================================

function prikaziPoljaZaUnos() {
    ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput', 'unitSelect', 'storageSelect'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { 
            el.style.display = 'block'; 
            el.style.visibility = 'visible'; 
            el.style.opacity = '1'; 
        }
    });
}

function ensureFormVisible() {
    document.querySelectorAll('.screen').forEach(s => { 
        s.style.display = 'none'; 
        s.classList.remove('active'); 
    });
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) { 
        mainScreen.style.display = 'flex'; 
        mainScreen.classList.add('active'); 
    }
    setTimeout(prikaziPoljaZaUnos, 100);
}

function popuniFormuPodacima(data) {
    const dataEntryScreen = document.getElementById('dataEntryScreen');
    if (!dataEntryScreen || dataEntryScreen.style.display === 'none') {
        if (typeof window.renderDataEntry === 'function') {
            window.renderDataEntry('');
        } else if (typeof renderDataEntry === 'function') {
            renderDataEntry('');
        }
    }
    
    let attempts = 0;
    const maxAttempts = 3;
    
    function fillForm() {
        attempts++;
        prikaziPoljaZaUnos();
        
        const productInput = document.getElementById('productInput');
        const pieceInput = document.getElementById('pieceInput');
        const quantityInput = document.getElementById('quantityInput');
        const shelfLifeInput = document.getElementById('shelfLifeInput');
        const unitSelect = document.getElementById('unitSelect');
        const storageSelect = document.getElementById('storageSelect');
        
        if (!productInput) {
            if (attempts < maxAttempts) {
                setTimeout(fillForm, 300);
            }
            return;
        }
        
        productInput.value = data.product_name || '';
        productInput.dispatchEvent(new Event('input', { bubbles: true }));
        productInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        if (pieceInput) {
            pieceInput.value = data.piece || '1';
            pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
            pieceInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        if (quantityInput) {
            quantityInput.value = data.quantity || '1';
            quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
            quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        if (shelfLifeInput) {
            shelfLifeInput.value = data.shelf_life || '6';
            shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
            shelfLifeInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        if (unitSelect) unitSelect.value = data.unit || 'kom';
        if (storageSelect) storageSelect.value = data.storage || 'Zamrzivač 1';
        
        if (typeof updateExpiryDate === 'function') {
            try { updateExpiryDate(); } catch(e) {}
        }
        
        showVoiceStatus(`✅ Uneto: ${data.product_name} (${data.quantity} ${data.unit})`, '#4CAF50');
    }
    
    setTimeout(fillForm, 400);
}

// ============================================
// 5. ČUVANJE PODATAKA - BEZ POPUPA
// ============================================

function sacuvajPodatkeBezPopupa(data) {
    isVoiceInput = true;
    window._isVoiceInput = true;
    
    const originalShowModernAlert = window.showModernAlert;
    window.showModernAlert = function() { return; };
    
    const originalAlert = window.alert;
    window.alert = function() { return; };
    
    const savedValues = {
        product: data.product_name || '',
        piece: data.piece || '1',
        quantity: data.quantity || '1',
        shelf_life: data.shelf_life || '6',
        unit: data.unit || 'kom',
        storage: data.storage || 'Zamrzivač 1'
    };
    
    window._keepFormData = true;
    popuniFormuPodacima(data);
    
    setTimeout(() => {
        let saved = false;
        
        if (typeof window.saveProduct === 'function') {
            try { 
                window.saveProduct(); 
                saved = true; 
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
                    piece: parseInt(data.piece) || 1,
                    quantity: parseFloat(data.quantity) || 1,
                    unit: data.unit || 'kom',
                    shelf_life_months: parseInt(data.shelf_life) || 6,
                    storage_location: data.storage || 'Zamrzivač 1',
                    entry_date: new Date().toISOString().split('T')[0],
                    isNew: true
                };
                zalihe.push(newItem);
                localStorage.setItem('zalihe', JSON.stringify(zalihe));
                
                let lastAdded = JSON.parse(localStorage.getItem('lastAddedProducts') || '[]');
                lastAdded.unshift({
                    product_name: data.product_name,
                    entry_date: newItem.entry_date,
                    timestamp: Date.now()
                });
                if (lastAdded.length > 10) lastAdded = lastAdded.slice(0, 10);
                localStorage.setItem('lastAddedProducts', JSON.stringify(lastAdded));
                
                saved = true;
            } catch(e) {
                console.warn('localStorage greška:', e);
            }
        }
        
        let retryCount = 0;
        function restoreFormValues() {
            retryCount++;
            
            const productInput = document.getElementById('productInput');
            const pieceInput = document.getElementById('pieceInput');
            const quantityInput = document.getElementById('quantityInput');
            const shelfLifeInput = document.getElementById('shelfLifeInput');
            const unitSelect = document.getElementById('unitSelect');
            const storageSelect = document.getElementById('storageSelect');
            
            if (productInput) {
                productInput.value = savedValues.product;
                productInput.dispatchEvent(new Event('input', { bubbles: true }));
                productInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (pieceInput) {
                pieceInput.value = savedValues.piece;
                pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (quantityInput) {
                quantityInput.value = savedValues.quantity;
                quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (shelfLifeInput) {
                shelfLifeInput.value = savedValues.shelf_life;
                shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (unitSelect) unitSelect.value = savedValues.unit;
            if (storageSelect) storageSelect.value = savedValues.storage;
            
            if (typeof updateExpiryDate === 'function') {
                try { updateExpiryDate(); } catch(e) {}
            }
            
            prikaziPoljaZaUnos();
            
            if ((!productInput || productInput.value === '') && retryCount < 3) {
                setTimeout(restoreFormValues, 300);
            }
        }
        
        setTimeout(restoreFormValues, 100);
        
        setTimeout(() => {
            window.showModernAlert = originalShowModernAlert;
            window.alert = originalAlert;
            isVoiceInput = false;
            window._isVoiceInput = false;
        }, 2000);
        
        setTimeout(() => {
            window._keepFormData = false;
        }, 15000);
        
        if (saved) {
            showVoiceStatus(`✅ Sačuvano: ${data.product_name}`, '#4CAF50');
            setTimeout(() => {
                if (typeof prikaziSveUnose === 'function') {
                    try { prikaziSveUnose(); } catch(e) {}
                }
            }, 200);
        } else {
            showVoiceStatus('❌ Greška pri čuvanju!', '#f44336');
        }
    }, 600);
}

// ============================================
// 6. PREPOZNAVANJE GOVORA (POPRAVLJENO ZA ANDROID)
// ============================================

function startVoiceRecognition() {
    console.log('🎤 startVoiceRecognition pozvan!');

    if (isRestarting) return;

    keepAndroidAudioAlive();
    requestWakeLock();

    if (recognition) {
        recognition.onend = null;
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    if (micRestartTimer) clearTimeout(micRestartTimer);
    if (noSpeechTimer) clearTimeout(noSpeechTimer);

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
    isRestarting = true;

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
        recognition.maxAlternatives = 3;

        recognition.onstart = function() {
            showVoiceStatus('🎤 Slušam...', '#4CAF50');
            isProcessingCommand = false;
            micActive = true;
            isRestarting = false;
            END_AKTIVAN = false;
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
                processVoiceCommand(finalText);
            }
        };

        recognition.onerror = function(event) {
            console.error('❌ Speech error:', event.error);

            if (event.error === 'no-speech') {
                console.log('🔇 Android nema govora, instant restart...');
                if (window.isVoiceModeActive && !isRestarting) {
                    try { recognition.start(); } catch(e) {}
                }
                return;
            }

            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                showVoiceStatus('❌ Pristup mikrofonu je blokiran!', '#f44336');
                window.isVoiceModeActive = false;
                micPermissionGranted = false;
                isRestarting = false;
            } else {
                showVoiceStatus(`❌ Greška: ${event.error}`, '#f44336');
                if (window.isVoiceModeActive && !isRestarting) {
                    micRestartTimer = setTimeout(function() {
                        if (window.isVoiceModeActive && !micActive) {
                            startVoiceRecognition();
                        }
                    }, 50); // Smanjeno za brzi restart na Androidu
                }
            }
        };

        recognition.onend = function() {
            console.log('⏹️ Mikrofon zaustavljen (Android Event)');
            micActive = false;
            recognition = null;

            if (window.isVoiceModeActive && !isRestarting) {
                setTimeout(function() {
                    if (window.isVoiceModeActive && !micActive) {
                        startVoiceRecognition();
                    }
                }, 50); // Brzi auto-restart od 50ms za Android
            } else {
                isRestarting = false;
            }
        };

        try {
            recognition.start();
        } catch(e) {
            console.error('❌ Greška pri startovanju:', e);
            isRestarting = false;
        }
    }

    if (micPermissionGranted) {
        beginRecognition();
        return;
    }

    requestMicrophonePermission().then(beginRecognition).catch(err => {
        console.error('❌ Dozvola ODBIJENA:', err);
        window.isVoiceModeActive = false;
        isRestarting = false;
        showVoiceStatus('❌ Dozvolite pristup mikrofonu!', '#f44336');
    });
}

// ============================================
// 7. ZAUSTAVLJANJE
// ============================================

function stopVoiceRecognition() {
    console.log('🛑 stopVoiceRecognition pozvan');
    window.isVoiceModeActive = false;
    isRestarting = true;

    releaseWakeLock();

    if (micRestartTimer) clearTimeout(micRestartTimer);
    if (noSpeechTimer) clearTimeout(noSpeechTimer);

    if (recognition) {
        recognition.onend = null;
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    micActive = false;
    showVoiceStatus('🎤 Mikrofon zaustavljen', '#999999');
}

// ============================================
// 8. OBRADA GLASOVNIH KOMANDI
// ============================================

function processVoiceCommand(command) {
    if (!command || command.length < 1) return;

    let cmd = command.trim();

    const splitRegex = /\b(plus|dodaj|sačuvaj|sacuvaj|end|kraj|gotovo|zavrsi)\b/i;

    if (splitRegex.test(cmd)) {
        const parts = cmd.split(splitRegex);

        for (let i = 0; i < parts.length; i += 2) {
            const segment = parts[i] ? parts[i].trim() : '';
            const keyword = parts[i + 1];

            if (segment) {
                processSingleVoiceCommand(segment);
            }
            if (keyword) {
                processSingleVoiceCommand(keyword);
            }
        }
        return;
    }

    processSingleVoiceCommand(cmd);
}

function processSingleVoiceCommand(command) {
    if (!command || command.length < 1) return;

    let cmd = command.trim();
    let lowerCmd = cmd.toLowerCase();

    // START
    if (lowerCmd.startsWith('start') || lowerCmd === 'unos' || lowerCmd === 'unesi' ||
        lowerCmd === 'pokreni' || lowerCmd === 'zapocni' || lowerCmd === 'počni' ||
        lowerCmd === 'novi' || lowerCmd === 'novo' || lowerCmd === 'enter' || lowerCmd === 'add') {

        voiceBuffer = cmd.replace(/^(start|unos|unesi|pokreni|zapocni|počni|novi|novo|enter|add)\s*/i, '').trim();

        if (typeof window.renderDataEntry === 'function') {
            window.renderDataEntry('');
        } else if (typeof renderDataEntry === 'function') {
            renderDataEntry('');
        }

        if (voiceBuffer) {
            showVoiceStatus(`🎤 Slušam: "${voiceBuffer}"`, '#FFD700');
        } else {
            showVoiceStatus('🎤 Redosled: NAZIV → KOMAD → KOLIČINA → JEDINICA → ROK → SKLADIŠTE', '#4CAF50');
        }
        return;
    }

    // PLUS
    if (lowerCmd.includes('plus') || lowerCmd.includes('dodaj') ||
        lowerCmd.includes('sačuvaj') || lowerCmd.includes('sacuvaj')) {

        let cleanCommand = cmd.replace(/\b(plus|dodaj|sačuvaj|sacuvaj)\b/gi, '').trim();

        if (voiceBuffer.trim().length < 2) {
            showVoiceStatus('❌ Nema podataka za upis.', '#f44336');
            return;
        }

        const data = parseVoiceDataEntry(voiceBuffer);
        sacuvajPodatkeBezPopupa(data);

        voiceBuffer = cleanCommand || '';
        showVoiceStatus(`✅ Sačuvano: ${data.product_name}. Izdiktirajte sledeći ili recite "End"`, '#4CAF50');
        return;
    }

    // END
    if (lowerCmd.includes('end') || lowerCmd.includes('kraj') ||
        lowerCmd.includes('gotovo') || lowerCmd.includes('zavrsi')) {

        let cleanCommand = cmd.replace(/\b(end|kraj|gotovo|zavrsi)\b/gi, '').trim();

        if (voiceBuffer.trim().length > 2) {
            const data = parseVoiceDataEntry(voiceBuffer);
            sacuvajPodatkeBezPopupa(data);
        }

        if (cleanCommand.length > 2) {
            const data2 = parseVoiceDataEntry(cleanCommand);
            setTimeout(() => {
                sacuvajPodatkeBezPopupa(data2);
            }, 1000);
        }

        voiceBuffer = '';

        setTimeout(() => {
            if (typeof window.renderInventory === 'function') {
                window.renderInventory();
            } else if (typeof renderInventory === 'function') {
                renderInventory();
            }
            showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
        }, 2500);

        stopVoiceRecognition();
        return;
    }

    // ZALIHE
    if (lowerCmd.includes('zalihe') || lowerCmd.includes('stanje') ||
        lowerCmd.includes('inventar') || lowerCmd.includes('inventory')) {
        voiceBuffer = '';
        if (typeof window.renderInventory === 'function') {
            window.renderInventory();
        } else if (typeof renderInventory === 'function') {
            renderInventory();
        }
        stopVoiceRecognition();
        return;
    }

    // SPISAK
    if (lowerCmd.includes('spisak') || lowerCmd.includes('potrebe') ||
        lowerCmd.includes('lista') || lowerCmd.includes('shopping')) {
        voiceBuffer = '';
        if (typeof window.renderShoppingList === 'function') {
            window.renderShoppingList();
        } else if (typeof renderShoppingList === 'function') {
            renderShoppingList();
        }
        stopVoiceRecognition();
        return;
    }

    // NAZAD
    if (lowerCmd.includes('nazad') || lowerCmd.includes('back') || lowerCmd.includes('vrati')) {
        voiceBuffer = '';
        stopVoiceRecognition();
        if (typeof window.goBack === 'function') {
            window.goBack();
        } else if (typeof goBack === 'function') {
            goBack();
        }
        return;
    }

    // EXIT
    if (lowerCmd.includes('exit') || lowerCmd.includes('izlaz') ||
        lowerCmd.includes('izadji') || lowerCmd.includes('zatvori')) {
        voiceBuffer = '';
        stopVoiceRecognition();
        if (typeof window.exitApp === 'function') {
            window.exitApp();
        } else if (typeof exitApp === 'function') {
            exitApp();
        }
        return;
    }

    // BUFFER
    voiceBuffer += (voiceBuffer ? ' ' : '') + cmd;
    showVoiceStatus(`🎤 Slušam: "${voiceBuffer}"`, '#FFD700');
}

// ============================================
// 9. IZVOZ ZA GLOBAL
// ============================================

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.processVoiceCommand = processVoiceCommand;
window.processSingleVoiceCommand = processSingleVoiceCommand;
window.requestMicrophonePermission = requestMicrophonePermission;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.popuniFormuPodacima = popuniFormuPodacima;
window.showVoiceStatus = showVoiceStatus;
window.prikaziPoljaZaUnos = prikaziPoljaZaUnos;
window.ensureFormVisible = ensureFormVisible;

window._voiceCommandsStart = startVoiceRecognition;
window.voiceCommand = processVoiceCommand;

// ============================================
// 10. EVENTS (INICIJALIZACIJA & RESTART NA FOKUS)
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('activateMicBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function(e) {
            e.preventDefault();
            keepAndroidAudioAlive();
            startVoiceRecognition();
        });
    }

    if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'microphone' })
            .then(function(result) {
                if (result.state === 'granted') {
                    micPermissionGranted = true;
                    setTimeout(function() {
                        if (!window.isVoiceModeActive) {
                            startVoiceRecognition();
                        }
                    }, 1000);
                }
            })
            .catch(function() {});
    }
});

document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        if (window.isVoiceModeActive && !micActive && !recognition && !isRestarting) {
            setTimeout(function() {
                startVoiceRecognition();
            }, 300);
        }
    }
});

window.addEventListener('focus', function() {
    if (window.isVoiceModeActive && !micActive && !recognition && !isRestarting) {
        setTimeout(function() {
            startVoiceRecognition();
        }, 300);
    }
});

window.addEventListener('beforeunload', function() {
    releaseWakeLock();
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    micActive = false;
    window.isVoiceModeActive = false;
});

console.log('✅ VoiceCommands.js v13.0 UCITAN (Optimizovano za Android/Mobilne Uređaje)');
