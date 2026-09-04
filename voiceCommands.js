// ============================================
// VOICE COMMANDS - KONAČNA VERZIJA v2.1 (FIX)
// ============================================

// exitApp i goBackFromVoice sada žive isključivo u script1.js
// (bile su duplirane ovde, što je pravilo nasumično ponašanje
// u zavisnosti od toga koja definicija "pobedi" po redosledu skripti)

// 🔥 GLOBALNI RECOGNITION OBJEKAT I SPREČAVANJE PREBRZOG RESTARTA
// (promenljive recognition, micActive, isProcessingCommand, activeBuffer, lastSavedData 
// već postoje kao 'var' u globalnom opsegu, pa ih ovde ne re-deklarišemo sa 'let')

isRestarting = false; // Zaštita od dupliranja restart poziva
END_AKTIVAN = false;
isVoiceInput = false;
ALLOW_INVENTORY_OPEN = false;
micRestartTimer = null;

// 🔥 recognition, micActive, activeBuffer, isProcessingCommand, lastSavedData
// se NE deklarišu ovde — već postoje kao 'var' u index.html (inline <script>
// pre ovog fajla), i taj 'var' je vidljiv ovde bez ikakve nove deklaracije.
// (Ranije je ovde stajalo 'let recognition = null; ...' što je pravilo
// SyntaxError: "Identifier 'recognition' has already been declared" i
// gasilo ceo ovaj fajl — let ne sme da redeklariše postojeći var u istom
// globalnom scope-u, koji se deli preko svih <script> tagova na strani.)

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

    // 🔥 PROVERA ZA MOBILNE - HTTPS NIJE OBAVEZAN ZA LOCALHOST
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

    // 🔥 PRVO TRAŽI DOZVOLU ZA MIKROFON
    requestMicrophonePermission().then(() => {
        console.log('✅ Dozvola za mikrofon odobrena!');
        showVoiceStatus('🎤 Dozvola odobrena, pokrećem...', '#4CAF50');
        
        // 🔥 ZATIM POKRENI PREPOZNAVANJE
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
    // 🔥 AKO JE DOZVOLA VEĆ ODOBRENA U OVOJ SESIJI, NE ZOVI getUserMedia PONOVO.
    // Ponovno zvanje getUserMedia() na svakom restartu mikrofona je glavni
    // razlog zašto mobilni browseri iznova traže dozvolu dok desktop ne.
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
        if (saved && typeof saveLastAddedProducts === 'function') {
    saveLastAddedProducts(data);
}
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
// 4. PREPOZNAVANJE GOVORA (GLAVNA FUNKCIJA) - POPRAVLJENO
// ============================================

function startVoiceRecognition() {
    console.log('🎤 startVoiceRecognition pozvan!');

    // 🔥 iOS Safari uopšte ne podržava Web Speech API (ni desktop ni mobilni
    // Safari) — obavesti korisnika umesto da tiho ne radi ništa
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    if (isIOS && isSafari) {
        showVoiceStatus('❌ Glasovni unos nije podržan u Safari na iOS-u. Koristite Chrome/Android ili ručni unos.', '#f44336');
        return;
    }

    // 🔥 ZAUSTAVI PREĐAŠNJI RECOGNITION (bez okidanja onend restarta)
    if (recognition) {
        recognition.onend = null;
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    if (micRestartTimer) {
        clearTimeout(micRestartTimer);
        micRestartTimer = null;
    }

    // 🔥 PROVERI HTTPS
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

        // 🔥 continuous TRUE — mikrofon ostaje otvoren i hvata više fraza
        // zaredom bez gašenja/paljenja posle svake. continuous:false je
        // pravio da se sesija zatvori posle svake kratke tišine, pa je
        // restart-petlja (400ms) delovala kao treperenje svake sekunde.
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
                // 🔥 Restart se dešava isključivo u onend (nema više duplog
                // restartovanja ovde + u onend, što je pravilo dvostruke
                // zahteve za dozvolu na mobilnom)
            }
        };

        recognition.onerror = function(event) {
            console.error('❌ Speech error:', event.error);

            if (event.error === 'aborted' || event.error === 'no-speech') {
                console.log('⏸️ Normalna greška, ignorišem:', event.error);
                return;
            }

            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                showVoiceStatus('❌ Pristup mikrofonu je blokiran! Proverite dozvole u podešavanjima browsera.', '#f44336');
                window.isVoiceModeActive = false;
                micPermissionGranted = false; // ponovo pitaj sledeći put kad korisnik eksplicitno pokrene
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

    // 🔥 AKO JE DOZVOLA VEĆ ODOBRENA, POKRENI DIREKTNO — bez ponovnog
    // getUserMedia poziva, koji je glavni uzrok ponovnog traženja dozvole
    // na mobilnom pri svakom restartu.
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

    // 🔥 Očisti tajmer ako je restart bio na čekanju
    if (micRestartTimer) {
        clearTimeout(micRestartTimer);
        micRestartTimer = null;
    }

    if (recognition) {
        // 🔥 Ključno: ukloni onend da se spreči restart ako smo namerno ugasili mic
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
        console.warn('⚠️ Prazna komanda');
        showVoiceStatus('❌ Nisam čuo ništa, pokušajte ponovo.', '#f44336');
        return;
    }
    
    const cmd = command.toLowerCase().trim();
    console.log('🔍 Procesiram:', cmd);
    
    // 🔥 KOMANDA: START - pokreni unos (otvori data entry i nastavi slušanje)
    if (cmd === 'start' || cmd === 'pokreni' || cmd === 'zapocni' || cmd === 'počni') {
        console.log('▶️ START - otvaram unos, nastavljam slušanje');
        renderDataEntry('');
        showVoiceStatus('🎤 Unos otvoren, recite naziv proizvoda...', '#4CAF50');
        // Nastavi slušanje - nemoj zaustavljati mikrofon
        return;
    }
    
    // 🔥 KOMANDA: PLUS - sačuvaj proizvod i nastavi
    if (cmd.includes('plus') || cmd.includes('dodaj') || cmd.includes('sačuvaj') || cmd.includes('sacuvaj')) {
        console.log('➕ PLUS - čuvam proizvod');
        
        // Izvuci naziv proizvoda iz komande
        let productName = command;
        // Ukloni reči "plus", "dodaj", "sačuvaj" iz naziva
        const removeWords = ['plus', 'dodaj', 'sačuvaj', 'sacuvaj'];
        for (let word of removeWords) {
            productName = productName.replace(new RegExp(word, 'gi'), '');
        }
        productName = productName.trim();
        
        if (productName.length > 2) {
            // Popuni formu sa nazivom proizvoda
            const productInput = document.getElementById('productInput');
            if (productInput) {
                productInput.value = productName;
                productInput.dispatchEvent(new Event('input', { bubbles: true }));
                showVoiceStatus(`✅ Proizvod: "${productName}" dodat, recite sledeći`, '#4CAF50');
                
                // Automatski sačuvaj proizvod
                if (typeof saveProduct === 'function') {
                    saveProduct();
                }
            }
        } else {
            showVoiceStatus('❌ Nisam razumeo naziv proizvoda, pokušajte ponovo.', '#f44336');
        }
        // Nastavi slušanje
        return;
    }
    
    // 🔥 KOMANDA: UNOS - otvori unos sa nazivom
    if (cmd.includes('unos') || cmd.includes('unesi') || cmd.includes('dodaj') || 
        cmd.includes('novi') || cmd.includes('novo') || cmd.includes('add')) {
        console.log('📝 UNOS - otvaram data entry');
        
        // Izvuci naziv proizvoda posle "unos"
        let productName = '';
        const unosIndex = cmd.indexOf('unos');
        if (unosIndex !== -1) {
            productName = command.substring(unosIndex + 4).trim();
        } else {
            const dodajIndex = cmd.indexOf('dodaj');
            if (dodajIndex !== -1) {
                productName = command.substring(dodajIndex + 5).trim();
            }
        }
        
        // Ako je reč "unos" ili "dodaj" sama, otvori prazan unos
        if (productName && productName.length > 0 && productName !== 'unos' && productName !== 'dodaj') {
            renderDataEntry(productName);
            showVoiceStatus(`✏️ Unos za: "${productName}"`, '#4CAF50');
        } else {
            renderDataEntry('');
            showVoiceStatus('✏️ Unos otvoren, recite naziv proizvoda', '#4CAF50');
        }
        return;
    }
    
    // 🔥 KOMANDA: ZALIHE
    if (cmd.includes('zalihe') || cmd.includes('stanje') || cmd.includes('inventar') || 
        cmd.includes('pregled') || cmd.includes('skladiste') || cmd.includes('inventory')) {
        console.log('📦 ZALIHE - otvaram');
        renderInventory();
        // Zaustavi mikrofon jer prelazimo na drugi ekran
        stopVoiceRecognition();
        return;
    }
    
    // 🔥 KOMANDA: SPISAK
    if (cmd.includes('spisak') || cmd.includes('potrebe') || cmd.includes('lista') || 
        cmd.includes('shopping') || cmd.includes('kupovina') || cmd.includes('list')) {
        console.log('🛒 SPISAK - otvaram');
        renderShoppingList();
        stopVoiceRecognition();
        return;
    }
    
    // 🔥 KOMANDA: END / KRAJ - otvori zalihe
    if (cmd.includes('end') || cmd.includes('kraj') || cmd.includes('gotovo') || 
        cmd.includes('stop') || cmd.includes('zavrsi') || cmd.includes('krajnji')) {
        console.log('🏁 END - otvaram zalihe');
        renderInventory();
        stopVoiceRecognition();
        return;
    }
    
    // 🔥 KOMANDA: EXIT / IZLAZ - gasi aplikaciju
    if (cmd.includes('exit') || cmd.includes('izlaz') || cmd.includes('izadji') ||
        cmd.includes('napusti') || cmd.includes('zatvori')) {
        console.log('🚪 EXIT - gasim aplikaciju');
        stopVoiceRecognition();
        if (typeof exitApp === 'function') {
            exitApp();
        } else if (typeof window.exitApp === 'function') {
            window.exitApp();
        }
        return;
    }
    
    // 🔥 KOMANDA: NAZAD - vrati se na prethodni ekran
    if (cmd.includes('nazad') || cmd.includes('back') || cmd.includes('vrati')) {
        console.log('⬅️ NAZAD - vraćam se');
        stopVoiceRecognition();
        if (typeof goBack === 'function') {
            goBack();
        } else if (typeof window.goBack === 'function') {
            window.goBack();
        }
        return;
    }
    
    // 🔥 Ako smo na data entry ekranu i nije prepoznata komanda, IZVUCI
    // strukturirane podatke iz cele izgovorene rečenice (naziv, količina,
    // jedinica, skladište, rok) umesto da se sirov tekst gura samo u
    // polje za proizvod (to je pravilo da SVE što izgovoriš uvek završi
    // u prvom polju, bez obzira šta si zapravo rekao).
    const dataEntryScreen = document.getElementById('dataEntryScreen');
    if (dataEntryScreen && dataEntryScreen.style.display !== 'none') {
        if (command.length > 2) {
            const data = parseVoiceDataEntry(command);
            if (data.product_name && data.product_name !== 'Proizvod') {
                popuniFormuPodacima(data);
                console.log('📝 Polja popunjena iz:', command, data);
            } else {
                // Nije prepoznat naziv proizvoda - ne prepisuj postojeći unos,
                // samo obavesti korisnika da probaju ponovo
                showVoiceStatus(`❓ Nisam razumeo naziv proizvoda u: "${command}"`, '#FFD700');
            }
            return;
        }
    }
    
    // 🔥 Ako ništa od gore, pokušaj kao direktan unos proizvoda (otvara
    // prazan ekran za unos i odmah ga popunjava strukturirano)
    if (command.length > 3) {
        console.log('📝 DIREKTAN UNOS PROIZVODA:', command);
        renderDataEntry('');
        const data = parseVoiceDataEntry(command);
        popuniFormuPodacima(data);
        return;
    }
    
    // 🔥 NEPOZNATA KOMANDA
    showVoiceStatus(`❌ Nije prepoznato: "${command}"`, '#f44336');
    console.warn('⚠️ Nepoznata komanda:', command);
}
// ============================================
// 5. IZVOZ ZA HTML DUGMAD
// ============================================

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.requestMicrophonePermission = requestMicrophonePermission;
// selectVoiceMode / selectManualMode / exitApp / goBackFromVoice se izvoze iz script1.js

// 🔥 POSTAVI currentLang preko window (ako je definisan iz drugog skripta)
if (typeof currentLang === 'undefined') {
    window.currentLang = 'sr';
    currentLang = 'sr';
}

// ============================================
// 6. DIREKTNI IZVOZI ZA HTML
// ============================================

window.forceStartVoice = window.forceStartVoice || function() {
    console.log('⚡ forceStartVoice pozvan!');
    if (typeof startVoiceRecognition === 'function') {
        startVoiceRecognition();
    }
};

window.voiceCommand = function(cmd) {
    console.log('🎤 voiceCommand:', cmd);
    
    // 🔥 KORISTI processVoiceCommand ZA OBRADU
    if (typeof processVoiceCommand === 'function') {
        processVoiceCommand(cmd);
        return;
    }
    
    // FALLBACK - ako processVoiceCommand nije definisan
    if (cmd === 'inventory' && typeof renderInventory === 'function') {
        renderInventory();
        stopVoiceRecognition();
    } else if (cmd === 'shopping' && typeof renderShoppingList === 'function') {
        renderShoppingList();
        stopVoiceRecognition();
    } else if (cmd === 'add' && typeof renderDataEntry === 'function') {
        renderDataEntry('');
        stopVoiceRecognition();
    } else if (cmd === 'back' && typeof goBackFromVoice === 'function') {
        goBackFromVoice();
        stopVoiceRecognition();
    }
};

// 🔥 DOMContentLoaded - povezi dugme
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
    
    // 🔥 BACK dugme iz voice menija
    const backBtn = document.querySelector('.voice-btn[onclick*="goBackFromVoice"]');
    if (backBtn) {
        backBtn.addEventListener('click', function(e) {
            stopVoiceRecognition();
        });
    }
});

// 🔥 KADA SE STRANICA ZATVARA - zaustavi mikrofon
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
console.log('✅ selectManualMode:', typeof selectManualMode);
/// ============================================
// ============================================
// 🔥 IZVOZI ZA GLOBAL - VOICE COMMANDS
// ============================================

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.requestMicrophonePermission = requestMicrophonePermission;
window.processVoiceCommand = processVoiceCommand;  // 🔥 PROMENJENO - SADA PRAVA FUNKCIJA
window.forceStartVoice = forceStartVoice;
window.prikaziPoljaZaUnos = prikaziPoljaZaUnos;
// selectVoiceMode / selectManualMode / exitApp / goBackFromVoice / saveLastAddedProducts se izvoze iz script1.js
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.sacuvajPodatke = sacuvajPodatke;
window.popuniFormuPodacima = popuniFormuPodacima;
window.ensureFormVisible = ensureFormVisible;
window.hideVoiceMenu = hideVoiceMenu;
window.showVoiceStatus = showVoiceStatus;

console.log('✅ VoiceCommands.js POTPUNO izvezen!');
// ============================================
// 🔥 POMOĆNI WINDOW POKAZIVAČ ZA script1.js
// ============================================

// Ovo omogućava script1.js da pronađe startVoiceRecognition
window._voiceCommandsStart = startVoiceRecognition;

console.log('✅ _voiceCommandsStart postavljen na:', typeof window._voiceCommandsStart);
