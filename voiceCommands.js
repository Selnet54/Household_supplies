// ============================================
// VOICE COMMANDS - KONAČNA VERZIJA v2.1 (FIX)
// ============================================

// exitApp i goBackFromVoice sada žive isključivo u script1.js
// (bile su duplirane ovde, što je pravilo nasumično ponašanje
// u zavisnosti od toga koja definicija "pobedi" po redosledu skripti)

// 🔥 GLOBALNE PROMENLJIVE
let END_AKTIVAN = false;
let isVoiceInput = false;
let ALLOW_INVENTORY_OPEN = false;
let micRestartTimer = null;

// 🔥 NOVE GLOBALNE PROMENLJIVE ZA VOICE
let isListening = false;
let voiceTimeout = null;
let lastCommandTime = 0;

// 🔥 recognition, micActive, activeBuffer, isProcessingCommand, lastSavedData
// se NE deklarišu ovde — već postoje kao 'var' u index.html (inline <script>
// pre ovog fajla), i taj 'var' je vidljiv ovde bez ikakve nove deklaracije.

// 🔥 KLJUČNO ZA MOBILNE: pamti da li je dozvola već data u ovoj sesiji,
// da restartovanje mikrofona ne mora svaki put iznova da zove
// getUserMedia() (to je uzrok ponovnog traženja dozvole na mobilnom)
let micPermissionGranted = false;

// 🔥 currentLang - koristi postojeći ili postavi podrazumevani
var currentLang = (typeof currentLang !== 'undefined') ? currentLang : 'sr';

// ============================================
// DIREKTNI POKRETAČ ZA 4. EKRAN - POPRAVLJEN
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
// 4. PREPOZNAVANJE GOVORA - ALTERNATIVNI PRISTUP
// ============================================

function startVoiceRecognition() {
    console.log('🎤 startVoiceRecognition pozvan!');
    
    if (isListening) {
        console.log('⏳ Već slušam, ignorišem');
        return;
    }

    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    if (isIOS && isSafari) {
        showVoiceStatus('❌ Glasovni unos nije podržan u Safari na iOS-u.', '#f44336');
        return;
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

    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    if (micRestartTimer) {
        clearTimeout(micRestartTimer);
        micRestartTimer = null;
    }

    window.isVoiceModeActive = true;
    isListening = true;

    function createRecognition() {
        recognition = new SpeechRecognition();

        const speechLangMap = {
            sr: 'sr-RS', en: 'en-US', de: 'de-DE',
            hu: 'hu-HU', uk: 'uk-UA', ru: 'ru-RU',
            es: 'es-ES', fr: 'fr-FR'
        };
        recognition.lang = speechLangMap[currentLang] || 'sr-RS';
        
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = function() {
            console.log('✅ Mikrofon aktivan!');
            showVoiceStatus('🎤 Slušam...', '#4CAF50');
            micActive = true;
            isListening = true;
            
            if (voiceTimeout) clearTimeout(voiceTimeout);
            voiceTimeout = setTimeout(() => {
                if (isListening && !micActive) {
                    console.log('⏰ Automatsko gašenje mikrofona (tišina)');
                    stopVoiceRecognition();
                }
            }, 10000);
        };

        recognition.onresult = function(event) {
            if (voiceTimeout) {
                clearTimeout(voiceTimeout);
                voiceTimeout = setTimeout(() => {
                    if (isListening && !micActive) {
                        console.log('⏰ Automatsko gašenje mikrofona (tišina)');
                        stopVoiceRecognition();
                    }
                }, 10000);
            }

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
                console.log(`📝 Čujem:`, finalText);
                showVoiceStatus(`🎤 Čuo: "${finalText}"`, '#4CAF50');
                lastCommandTime = Date.now();

                if (typeof processVoiceCommand === 'function') {
                    processVoiceCommand(finalText);
                }
                
                setTimeout(() => {
                    if (window.isVoiceModeActive && isListening) {
                        console.log('🔄 Ponovno pokretanje slušanja...');
                        startVoiceRecognition();
                    }
                }, 300);
            }
        };

        recognition.onerror = function(event) {
            console.error('❌ Speech error:', event.error);
            
            if (event.error === 'aborted') {
                console.log('⏸️ Zaustavljeno od strane korisnika');
                return;
            }

            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                showVoiceStatus('❌ Pristup mikrofonu je blokiran!', '#f44336');
                window.isVoiceModeActive = false;
                micPermissionGranted = false;
                isListening = false;
            } else if (event.error === 'no-speech') {
                console.log('🔇 Nema govora, restartujem...');
                if (window.isVoiceModeActive && isListening) {
                    setTimeout(() => {
                        startVoiceRecognition();
                    }, 500);
                }
            } else {
                showVoiceStatus(`❌ Greška: ${event.error}`, '#f44336');
                if (window.isVoiceModeActive && isListening) {
                    setTimeout(() => {
                        startVoiceRecognition();
                    }, 1000);
                }
            }
        };

        recognition.onend = function() {
            console.log('⏹️ Mikrofon zaustavljen');
            micActive = false;
            recognition = null;
            
            if (window.isVoiceModeActive && isListening) {
                console.log('🔄 Restartujem slušanje...');
                setTimeout(() => {
                    if (window.isVoiceModeActive && isListening) {
                        startVoiceRecognition();
                    }
                }, 500);
            } else {
                console.log('⏹️ Voice mode nije aktivan, zaustavljam');
                showVoiceStatus('🎤 Mikrofon zaustavljen', '#999999');
            }
        };

        try {
            recognition.start();
            console.log('✅ Recognition startovan!');
        } catch(e) {
            console.error('❌ Greška pri startovanju:', e);
            showVoiceStatus('❌ Greška pri pokretanju mikrofona', '#f44336');
            isListening = false;
        }
    }

    if (micPermissionGranted) {
        createRecognition();
        return;
    }

    requestMicrophonePermission().then(createRecognition).catch(err => {
        console.error('❌ Dozvola za mikrofon ODBIJENA:', err);
        window.isVoiceModeActive = false;
        isListening = false;
        showVoiceStatus('❌ Dozvolite pristup mikrofonu u podešavanjima!', '#f44336');
    });
}

function stopVoiceRecognition() {
    console.log('🛑 stopVoiceRecognition pozvan');
    window.isVoiceModeActive = false;
    isListening = false;

    if (voiceTimeout) {
        clearTimeout(voiceTimeout);
        voiceTimeout = null;
    }

    if (micRestartTimer) {
        clearTimeout(micRestartTimer);
        micRestartTimer = null;
    }

    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    micActive = false;
    showVoiceStatus('🎤 Mikrofon zaustavljen', '#999999');
}

// ============================================
// 5. PROCESS VOICE COMMAND - OBRADA KOMANDI
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
    if (cmd === 'start' || cmd === 'pokreni' || cmd === 'zapocni' || cmd === 'počni') {
        console.log('▶️ START - otvaram unos');
        if (typeof window.showDataEntry === 'function') {
            window.showDataEntry();
        } else if (typeof showDataEntry === 'function') {
            showDataEntry();
        } else {
            const dataEntry = document.getElementById('dataEntryScreen');
            if (dataEntry) {
                document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
                dataEntry.style.display = 'block';
                dataEntry.classList.add('active');
            }
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
            const productInput = document.getElementById('productInput');
            if (productInput) {
                productInput.value = productName;
                productInput.dispatchEvent(new Event('input', { bubbles: true }));
                showVoiceStatus(`✅ Proizvod: "${productName}" dodat`, '#4CAF50');
                
                if (typeof saveProduct === 'function') {
                    saveProduct();
                } else if (typeof window.saveProduct === 'function') {
                    window.saveProduct();
                }
            }
        } else {
            showVoiceStatus('❌ Nisam razumeo naziv proizvoda.', '#f44336');
        }
        return;
    }
    
    // KOMANDA: ZALIHE
    if (cmd.includes('zalihe') || cmd.includes('stanje') || cmd.includes('inventar') || 
        cmd.includes('pregled') || cmd.includes('inventory')) {
        console.log('📦 ZALIHE - otvaram');
        if (typeof window.showInventory === 'function') {
            window.showInventory();
        } else if (typeof showInventory === 'function') {
            showInventory();
        }
        stopVoiceRecognition();
        return;
    }
    
    // KOMANDA: SPISAK
    if (cmd.includes('spisak') || cmd.includes('potrebe') || cmd.includes('lista') || 
        cmd.includes('shopping') || cmd.includes('kupovina')) {
        console.log('🛒 SPISAK - otvaram');
        if (typeof window.showShoppingList === 'function') {
            window.showShoppingList();
        } else if (typeof showShoppingList === 'function') {
            showShoppingList();
        }
        stopVoiceRecognition();
        return;
    }
    
    // KOMANDA: END / KRAJ
    if (cmd.includes('end') || cmd.includes('kraj') || cmd.includes('gotovo') || 
        cmd.includes('stop') || cmd.includes('zavrsi')) {
        console.log('🏁 END - zatvaram');
        if (typeof window.showInventory === 'function') {
            window.showInventory();
        } else if (typeof showInventory === 'function') {
            showInventory();
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
    
    // Popuni formu ako smo na data entry ekranu
    const dataEntryScreen = document.getElementById('dataEntryScreen');
    if (dataEntryScreen && dataEntryScreen.style.display !== 'none' && dataEntryScreen.style.display !== '') {
        if (command.length > 2) {
            const data = parseVoiceDataEntry(command);
            if (data.product_name && data.product_name !== 'Proizvod') {
                popuniFormuPodacima(data);
                console.log('📝 Polja popunjena iz:', command, data);
            } else {
                showVoiceStatus(`❓ Nisam razumeo: "${command}"`, '#FFD700');
            }
            return;
        }
    }
    
    // Direktan unos
    if (command.length > 3) {
        console.log('📝 DIREKTAN UNOS:', command);
        if (dataEntryScreen && dataEntryScreen.style.display === 'none') {
            if (typeof window.showDataEntry === 'function') {
                window.showDataEntry();
            } else if (typeof showDataEntry === 'function') {
                showDataEntry();
            }
        }
        const data = parseVoiceDataEntry(command);
        popuniFormuPodacima(data);
        return;
    }
    
    showVoiceStatus(`❌ Nije prepoznato: "${command}"`, '#f44336');
    console.warn('⚠️ Nepoznata komanda:', command);
}

// ============================================
// 6. IZVOZ ZA HTML DUGMAD
// ============================================

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.requestMicrophonePermission = requestMicrophonePermission;
window.processVoiceCommand = processVoiceCommand;
window.forceStartVoice = forceStartVoice;
window.prikaziPoljaZaUnos = prikaziPoljaZaUnos;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.sacuvajPodatke = sacuvajPodatke;
window.popuniFormuPodacima = popuniFormuPodacima;
window.ensureFormVisible = ensureFormVisible;
window.hideVoiceMenu = hideVoiceMenu;
window.showVoiceStatus = showVoiceStatus;

// 🔥 POSTAVI currentLang preko window
if (typeof currentLang === 'undefined') {
    window.currentLang = 'sr';
    currentLang = 'sr';
}

// ============================================
// 7. DOMContentLoaded - povezi dugme
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOMContentLoaded - voiceCommands.js');
    
    const startBtn = document.getElementById('activateMicBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('✅ Kliknuto na zeleno dugme!');
            if (typeof startVoiceRecognition === 'function') {
                startVoiceRecognition();
            } else {
                alert('Glasovne komande se još učitavaju...');
            }
        });
        console.log('✅ Zeleno dugme povezano!');
    } else {
        console.warn('⚠️ Zeleno dugme nije pronađeno!');
    }
});

// KADA SE STRANICA ZATVARA - zaustavi mikrofon
window.addEventListener('beforeunload', function() {
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    micActive = false;
    window.isVoiceModeActive = false;
});

console.log('✅ VoiceCommands.js POTPUNO ucitano v2.1!');
console.log('✅ startVoiceRecognition:', typeof startVoiceRecognition);
