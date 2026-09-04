// ============================================
// VOICE COMMANDS - ANDROID OPTIMIZED v3.1
// ============================================

// 🔥 GLOBALNE PROMENLJIVE
let END_AKTIVAN = false;
let isVoiceInput = false;
let ALLOW_INVENTORY_OPEN = false;
let micRestartTimer = null;
let isRestarting = false;
let micPermissionGranted = false;
let noSpeechCount = 0;
let noSpeechTimer = null;
var currentLang = (typeof currentLang !== 'undefined') ? currentLang : 'sr';

// ============================================
// 1. POMOĆNE FUNKCIJE
// ============================================

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

// 🔥 POBOLJŠANI PARSER - RADI NA ANDROIDU I DESKTOPU
function parseVoiceDataEntry(command) {
    console.log('🔍 PARSIRAM:', command);
    
    let text = command.replace(/^(unos|start|dodaj|novi|novo|add)\s*/i, '').trim();
    
    let result = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    // Pronađi skladište
    let foundStorage = null;
    let storageWords = ['zamrzivač', 'zamrzivac', 'frižider', 'frizider', 'ostava', 'špajz'];
    for (let word of storageWords) {
        if (text.toLowerCase().includes(word)) {
            foundStorage = getStorage(word);
            break;
        }
    }
    if (foundStorage) result.storage = foundStorage;
    
    // Pronađi jedinicu
    let foundUnit = null;
    let unitWords = ['kilogram', 'kilograma', 'kg', 'gram', 'grama', 'g', 'litar', 'litara', 'l', 'komad', 'komada', 'kom', 'paket', 'paketa', 'pak'];
    for (let word of unitWords) {
        if (text.toLowerCase().includes(word)) {
            foundUnit = getUnit(word);
            break;
        }
    }
    if (foundUnit) result.unit = foundUnit;
    
    // Pronađi rok trajanja
    let meseciMatch = text.match(/(\d+)\s*meseci/);
    if (meseciMatch) {
        result.shelf_life = meseciMatch[1];
    }
    
    // Pronađi sve brojeve
    let words = text.split(/\s+/);
    let numbers = [];
    let nameParts = [];
    
    for (let word of words) {
        let num = getNumber(word);
        if (num !== null) {
            numbers.push(num);
        } else {
            let lower = word.toLowerCase();
            if (!unitWords.includes(lower) && !storageWords.includes(lower) && lower !== 'meseci' && lower !== 'mesec' && lower !== 'meseca') {
                nameParts.push(word);
            }
        }
    }
    
    // Dodeli količine
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
        if (numbers.length >= 2 && !meseciMatch) {
            result.shelf_life = numbers[1];
        }
    }
    
    // Naziv proizvoda
    result.product_name = nameParts.join(' ').trim();
    if (!result.product_name || result.product_name.length < 2) {
        let match = text.match(/^([a-zA-ZšđčćžŠĐČĆŽ\s]+)/);
        if (match) {
            result.product_name = match[1].trim();
        }
    }
    if (!result.product_name || result.product_name.length < 2) {
        result.product_name = 'Proizvod';
    }
    
    console.log('📦 PARSED:', result);
    return result;
}

// ============================================
// 3. PRIKAZ I POPUNJAVANJE FORME
// ============================================

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
    const dataEntry = document.getElementById('dataEntryScreen');
    if (dataEntry) { 
        dataEntry.style.display = 'block'; 
        dataEntry.classList.add('active'); 
    }
    setTimeout(prikaziPoljaZaUnos, 100);
}

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

function popuniFormuPodacima(data) {
    ensureFormVisible();
    setTimeout(() => {
        prikaziPoljaZaUnos();
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
        if (unitSelect) unitSelect.value = data.unit || 'kom';
        
        const storageSelect = document.getElementById('storageSelect');
        if (storageSelect) storageSelect.value = data.storage || 'Zamrzivač 1';
        
        showVoiceStatus(`✅ Uneto: ${data.product_name} (${data.quantity} ${data.unit})`, '#4CAF50');
    }, 300);
}

// ============================================
// 4. PREPOZNAVANJE GOVORA - ANDROID OPTIMIZED
// ============================================

function startVoiceRecognition() {
    console.log('🎤 startVoiceRecognition pozvan!');

    // Spreči duplo pokretanje
    if (isRestarting) {
        console.log('⏳ Već se restartuje, ignorišem');
        return;
    }

    // iOS Safari provera
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    if (isIOS && isSafari) {
        showVoiceStatus('❌ Glasovni unos nije podržan u Safari na iOS-u.', '#f44336');
        return;
    }

    // Zaustavi prethodni recognition
    if (recognition) {
        recognition.onend = null;
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    if (micRestartTimer) {
        clearTimeout(micRestartTimer);
        micRestartTimer = null;
    }
    if (noSpeechTimer) {
        clearTimeout(noSpeechTimer);
        noSpeechTimer = null;
    }

    // HTTPS provera
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
    noSpeechCount = 0;

    function beginRecognition() {
        recognition = new SpeechRecognition();

        const speechLangMap = {
            sr: 'sr-RS', en: 'en-US', de: 'de-DE',
            hu: 'hu-HU', uk: 'uk-UA', ru: 'ru-RU',
            es: 'es-ES', fr: 'fr-FR'
        };
        recognition.lang = speechLangMap[currentLang] || 'sr-RS';

        // 🔥 ANDROID OPTIMIZACIJA
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;

        recognition.onstart = function() {
            showVoiceStatus('🎤 Slušam...', '#4CAF50');
            activeBuffer = '';
            isProcessingCommand = false;
            micActive = true;
            isRestarting = false;
            noSpeechCount = 0;
            console.log('✅ Mikrofon aktivan!');
        };

        recognition.onresult = function(event) {
            // Resetuj no-speech brojač kad čuje bilo šta
            noSpeechCount = 0;
            
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
                }
            }
        };

        recognition.onerror = function(event) {
            console.error('❌ Speech error:', event.error);

            if (event.error === 'aborted') {
                console.log('⏸️ Zaustavljeno od strane korisnika');
                isRestarting = false;
                noSpeechCount = 0;
                return;
            }

            if (event.error === 'no-speech') {
                noSpeechCount++;
                console.log(`🔇 Nema govora (${noSpeechCount}x)`);
                
                // 🔥 AKO JE 3 PUTA UZASTOPNO, PAUZIRAJ 5 SEKUNDI
                if (noSpeechCount >= 3) {
                    console.warn('🐌 Previše no-speech grešaka, pauziram 5s...');
                    showVoiceStatus('⏳ Pauza...', '#FFD700');
                    if (noSpeechTimer) clearTimeout(noSpeechTimer);
                    noSpeechTimer = setTimeout(() => {
                        noSpeechCount = 0;
                        if (window.isVoiceModeActive && !micActive && !isRestarting) {
                            startVoiceRecognition();
                        }
                    }, 5000);
                    return;
                }
                
                if (window.isVoiceModeActive && !isRestarting) {
                    micRestartTimer = setTimeout(function() {
                        if (window.isVoiceModeActive && !micActive && !isRestarting) {
                            startVoiceRecognition();
                        }
                    }, 1000);
                }
                return;
            }

            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                showVoiceStatus('❌ Pristup mikrofonu je blokiran!', '#f44336');
                window.isVoiceModeActive = false;
                micPermissionGranted = false;
                isRestarting = false;
                noSpeechCount = 0;
            } else {
                showVoiceStatus(`❌ Greška: ${event.error}`, '#f44336');
                if (window.isVoiceModeActive && !isRestarting) {
                    micRestartTimer = setTimeout(function() {
                        if (window.isVoiceModeActive && !micActive) {
                            startVoiceRecognition();
                        }
                    }, 1500);
                }
            }
            isProcessingCommand = false;
        };

        recognition.onend = function() {
            console.log('⏹️ Mikrofon zaustavljen');
            micActive = false;
            recognition = null;
            
            // Resetuj no-speech brojač pri normalnom kraju
            noSpeechCount = 0;
            
            // 🔥 RESTART SAMO AKO SMO JOŠ UVEK U VOICE MODE
            if (window.isVoiceModeActive && !isRestarting) {
                console.log('🔄 Restartujem slušanje za 800ms...');
                micRestartTimer = setTimeout(function() {
                    if (window.isVoiceModeActive && !micActive && !isRestarting) {
                        startVoiceRecognition();
                    }
                }, 800);
            } else {
                isRestarting = false;
                showVoiceStatus('🎤 Mikrofon zaustavljen', '#999999');
            }
        };

        try {
            recognition.start();
            console.log('✅ Recognition startovan!');
        } catch(e) {
            console.error('❌ Greška pri startovanju:', e);
            showVoiceStatus('❌ Greška pri pokretanju mikrofona', '#f44336');
            isRestarting = false;
        }
    }

    if (micPermissionGranted) {
        beginRecognition();
        return;
    }

    requestMicrophonePermission().then(beginRecognition).catch(err => {
        console.error('❌ Dozvola za mikrofon ODBIJENA:', err);
        window.isVoiceModeActive = false;
        isRestarting = false;
        showVoiceStatus('❌ Dozvolite pristup mikrofonu u podešavanjima!', '#f44336');
    });
}

// ============================================
// 5. ZAUSTAVLJANJE MIKROFONA
// ============================================

function stopVoiceRecognition() {
    console.log('🛑 stopVoiceRecognition pozvan');
    window.isVoiceModeActive = false;
    isRestarting = true;

    if (micRestartTimer) {
        clearTimeout(micRestartTimer);
        micRestartTimer = null;
    }
    if (noSpeechTimer) {
        clearTimeout(noSpeechTimer);
        noSpeechTimer = null;
    }

    if (recognition) {
        recognition.onend = null;
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    micActive = false;
    showVoiceStatus('🎤 Mikrofon zaustavljen', '#999999');
}

// ============================================
// 6. OBRADA GLASOVNIH KOMANDI
// ============================================

function processVoiceCommand(command) {
    console.log('🎤 processVoiceCommand prima:', command);
    
    if (!command || command.length < 2) {
        console.warn('⚠️ Prazna komanda');
        showVoiceStatus('❌ Nisam čuo ništa, pokušajte ponovo.', '#f44336');
        return;
    }
    
    const cmd = command.toLowerCase().trim();
    console.log('🔍 Procesiram:', cmd);
    
    // KOMANDA: START
    if (cmd === 'start' || cmd === 'pokreni' || cmd === 'zapocni' || cmd === 'počni' || cmd === 'enter') {
        console.log('▶️ START - otvaram unos');
        if (typeof renderDataEntry === 'function') {
            renderDataEntry('');
        } else if (typeof window.renderDataEntry === 'function') {
            window.renderDataEntry('');
        }
        showVoiceStatus('🎤 Unos otvoren, recite naziv proizvoda...', '#4CAF50');
        return;
    }
    
    // KOMANDA: DODAJ
    if (cmd.includes('dodaj') || cmd.includes('plus') || cmd.includes('sačuvaj') || cmd.includes('sacuvaj')) {
        console.log('➕ DODAJ - čuvam proizvod');
        
        let productName = command;
        const removeWords = ['dodaj', 'plus', 'sačuvaj', 'sacuvaj', 'novi', 'novo'];
        for (let word of removeWords) {
            productName = productName.replace(new RegExp(word, 'gi'), '');
        }
        productName = productName.trim();
        
        if (productName.length > 2) {
            const data = parseVoiceDataEntry(productName);
            popuniFormuPodacima(data);
            
            setTimeout(() => {
                if (typeof saveProduct === 'function') {
                    saveProduct();
                } else if (typeof window.saveProduct === 'function') {
                    window.saveProduct();
                }
            }, 500);
        } else {
            showVoiceStatus('❌ Nisam razumeo naziv proizvoda.', '#f44336');
        }
        return;
    }
    
    // KOMANDA: UNOS
    if (cmd.includes('unos') || cmd.includes('unesi') || cmd.includes('novi') || cmd.includes('novo') || cmd.includes('add')) {
        console.log('📝 UNOS');
        let productName = command;
        const removeWords = ['unos', 'unesi', 'novi', 'novo', 'add', 'dodaj'];
        for (let word of removeWords) {
            productName = productName.replace(new RegExp(word, 'gi'), '');
        }
        productName = productName.trim();
        
        if (productName && productName.length > 0) {
            if (typeof renderDataEntry === 'function') {
                renderDataEntry('');
            } else if (typeof window.renderDataEntry === 'function') {
                window.renderDataEntry('');
            }
            const data = parseVoiceDataEntry(productName);
            popuniFormuPodacima(data);
            showVoiceStatus(`✏️ Uneto: ${data.product_name}`, '#4CAF50');
        } else {
            if (typeof renderDataEntry === 'function') {
                renderDataEntry('');
            } else if (typeof window.renderDataEntry === 'function') {
                window.renderDataEntry('');
            }
            showVoiceStatus('✏️ Unos otvoren', '#4CAF50');
        }
        return;
    }
    
    // KOMANDA: ZALIHE
    if (cmd.includes('zalihe') || cmd.includes('stanje') || cmd.includes('inventar') || 
        cmd.includes('pregled') || cmd.includes('inventory')) {
        console.log('📦 ZALIHE');
        if (typeof renderInventory === 'function') {
            renderInventory();
        } else if (typeof window.renderInventory === 'function') {
            window.renderInventory();
        }
        stopVoiceRecognition();
        return;
    }
    
    // KOMANDA: SPISAK
    if (cmd.includes('spisak') || cmd.includes('potrebe') || cmd.includes('lista') || 
        cmd.includes('shopping') || cmd.includes('kupovina')) {
        console.log('🛒 SPISAK');
        if (typeof renderShoppingList === 'function') {
            renderShoppingList();
        } else if (typeof window.renderShoppingList === 'function') {
            window.renderShoppingList();
        }
        stopVoiceRecognition();
        return;
    }
    
    // KOMANDA: END / KRAJ
    if (cmd.includes('end') || cmd.includes('kraj') || cmd.includes('gotovo') || 
        cmd.includes('stop') || cmd.includes('zavrsi')) {
        console.log('🏁 END');
        if (typeof renderInventory === 'function') {
            renderInventory();
        } else if (typeof window.renderInventory === 'function') {
            window.renderInventory();
        }
        stopVoiceRecognition();
        return;
    }
    
    // KOMANDA: NAZAD
    if (cmd.includes('nazad') || cmd.includes('back') || cmd.includes('vrati')) {
        console.log('⬅️ NAZAD');
        stopVoiceRecognition();
        if (typeof goBack === 'function') {
            goBack();
        } else if (typeof window.goBack === 'function') {
            window.goBack();
        }
        return;
    }
    
    // KOMANDA: EXIT
    if (cmd.includes('exit') || cmd.includes('izlaz') || cmd.includes('izadji') ||
        cmd.includes('napusti') || cmd.includes('zatvori')) {
        console.log('🚪 EXIT');
        stopVoiceRecognition();
        if (typeof exitApp === 'function') {
            exitApp();
        } else if (typeof window.exitApp === 'function') {
            window.exitApp();
        }
        return;
    }
    
    // 🔥 DIREKTAN UNOS - parsiraj ceo tekst
    if (command.length > 3) {
        console.log('📝 DIREKTAN UNOS:', command);
        if (typeof renderDataEntry === 'function') {
            renderDataEntry('');
        } else if (typeof window.renderDataEntry === 'function') {
            window.renderDataEntry('');
        }
        const data = parseVoiceDataEntry(command);
        popuniFormuPodacima(data);
        return;
    }
    
    showVoiceStatus(`❌ Nije prepoznato: "${command}"`, '#f44336');
    console.warn('⚠️ Nepoznata komanda:', command);
}

// ============================================
// 7. IZVOZ ZA GLOBAL
// ============================================

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.processVoiceCommand = processVoiceCommand;
window.requestMicrophonePermission = requestMicrophonePermission;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.popuniFormuPodacima = popuniFormuPodacima;
window.showVoiceStatus = showVoiceStatus;
window.prikaziPoljaZaUnos = prikaziPoljaZaUnos;
window.ensureFormVisible = ensureFormVisible;

// ============================================
// 8. DOMContentLoaded
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOMContentLoaded - voiceCommands.js v3.1');
    
    const startBtn = document.getElementById('activateMicBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('✅ Kliknuto na zeleno dugme!');
            startVoiceRecognition();
        });
        console.log('✅ Zeleno dugme povezano!');
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

console.log('✅ VoiceCommands.js v3.1 UCITAN - Android optimized!');
