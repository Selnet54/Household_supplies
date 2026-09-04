// ============================================
// VOICE COMMANDS - KONAČNA VERZIJA v2.1 (FIX)
// ============================================

// 🔥 PRVO DEFINISI exitApp DA BI BIO DOSTUPAN
function exitApp() {
    console.log('🚪 EXIT');
    document.body.innerHTML = '<div style="text-align:center;color:#FFD700;font-size:32px;margin-top:50px;">👋 Hvala na korišćenju!</div>';
}

// 🔥 PRVO DEFINISI goBackFromVoice DA BI BIO DOSTUPAN
function goBackFromVoice() {
    console.log('🔙 goBackFromVoice pozvan');
    const voiceScreen = document.getElementById('voiceMenuScreen');
    const choiceScreen = document.getElementById('choiceScreen');
    if (voiceScreen) { 
        voiceScreen.style.display = 'none'; 
        voiceScreen.classList.remove('active'); 
    }
    if (choiceScreen) { 
        choiceScreen.style.display = 'flex'; 
        choiceScreen.classList.add('active'); 
    }
    // Zaustavi mikrofon kad se vraćamo
    if (typeof window.stopVoiceRecognition === 'function') {
        window.stopVoiceRecognition();
    }
}

// 🔥 GLOBALNE PROMENLJIVE
let END_AKTIVAN = false;
let isVoiceInput = false;
let ALLOW_INVENTORY_OPEN = false;
let micRestartTimer = null;

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
    return new Promise((resolve, reject) => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            reject('Browser ne podržava pristup mikrofonu');
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
// 4. PREPOZNAVANJE GOVORA (GLAVNA FUNKCIJA) - POPRAVLJENO
// ============================================

function startVoiceRecognition() {
    console.log('🎤 startVoiceRecognition pozvan!');
    
    // 🔥 ZAUSTAVI PREĐAŠNJI RECOGNITION
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    
    // 🔥 PROVERI HTTPS ZA GITHUB PAGES
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        showVoiceStatus('❌ Mikrofon radi SAMO na HTTPS!', '#f44336');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showVoiceStatus('❌ Pregledač ne podržava Web Speech API.', '#f44336');
        return;
    }

    // 🔥 TRAŽI DOZVOLU ZA MIKROFON
    requestMicrophonePermission().then(() => {
        recognition = new SpeechRecognition();
        
        // 🔥 JEZIK - KORISTI currentLang
        const speechLangMap = { 
            sr: 'sr-RS', en: 'en-US', de: 'de-DE', 
            hu: 'hu-HU', uk: 'uk-UA', ru: 'ru-RU', 
            es: 'es-ES', fr: 'fr-FR' 
        };
        recognition.lang = speechLangMap[currentLang] || 'sr-RS';
        
        // 🔥 ZA MOBILNE - continuous FALSE (bolje radi)
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = function() {
            showVoiceStatus('🎤 Slušam...', '#4CAF50');
            activeBuffer = '';
            isProcessingCommand = false;
            window.isVoiceModeActive = true;
            micActive = true;
            console.log('✅ Mikrofon aktivan na GitHub Pages!');
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
            
            // 🔥 PRIKAŽI INTERIM REZULTAT
            if (interimText) {
                showVoiceStatus(`🎤 Slušam: "${interimText}"`, '#FFD700');
            }
            
            // 🔥 KAD JE FINAL - OBRADI KOMANDU
            if (finalText) {
                console.log('📝 Finalno čujem:', finalText);
                showVoiceStatus(`🎤 Čuo: "${finalText}"`, '#4CAF50');
                
                // 🔥 POZOVI processVoiceCommand ZA OBRADU
                if (typeof processVoiceCommand === 'function') {
                    processVoiceCommand(finalText);
                } else {
                    console.error('❌ processVoiceCommand nije definisan!');
                }
                
                // 🔥 RESTARTUJ MIKROFON ZA SLEDEĆU KOMANDU
                setTimeout(function() {
                    if (window.isVoiceModeActive && !micActive) {
                        startVoiceRecognition();
                    }
                }, 500);
            }
        };

        recognition.onerror = function(event) {
            console.error('❌ Speech error:', event.error);
            
            // 🔥 IGNORIŠI 'aborted' i 'no-speech' greške
            if (event.error === 'aborted' || event.error === 'no-speech') {
                console.log('⏸️ Normalna greška, ignorišem:', event.error);
                return;
            }
            
            if (event.error === 'not-allowed') {
                showVoiceStatus('❌ Pristup mikrofonu je blokiran!', '#f44336');
                window.isVoiceModeActive = false;
            } else {
                showVoiceStatus(`❌ Greška: ${event.error}`, '#f44336');
            }
            isProcessingCommand = false;
        };

        recognition.onend = function() {
            console.log('⏹️ Mikrofon zaustavljen');
            micActive = false;
            
            // 🔥 RESTART SAMO AKO SMO JOŠ UVEK U VOICE MODE
            if (window.isVoiceModeActive && !recognition) {
                console.log('🔄 Restartovanje mikrofona...');
                setTimeout(function() {
                    if (window.isVoiceModeActive && !micActive) {
                        startVoiceRecognition();
                    }
                }, 500);
            }
        };

        // 🔥 POKRENI PREPOZNAVANJE
        try {
            recognition.start();
            console.log('✅ Recognition startovan na GitHub Pages!');
        } catch(e) {
            console.error('❌ Greška pri startovanju:', e);
            showVoiceStatus('❌ Greška pri pokretanju mikrofona', '#f44336');
        }
        
    }).catch(err => {
        console.error('❌ Dozvola za mikrofon ODBIJENA:', err);
        showVoiceStatus('❌ Dozvolite pristup mikrofonu u podešavanjima!', '#f44336');
    });
}
function processVoiceCommand(command) {
    console.log('🎤 processVoiceCommand prima:', command);
    
    const cmd = command.toLowerCase().trim();
    
    // 🔥 PROVERI DA LI JE UNOS (dodavanje proizvoda)
    if (cmd.includes('unos') || cmd.includes('unesi') || cmd.includes('dodaj') || 
        cmd.includes('novi') || cmd.includes('novo') || cmd.includes('add')) {
        console.log('📝 UNOS - otvaram data entry');
        // Ako ima tekst posle "unos", iskoristi ga kao naziv
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
        renderDataEntry(productName);
        return;
    }
    
    // 🔥 ZALIHE
    if (cmd.includes('zalihe') || cmd.includes('stanje') || cmd.includes('inventar') || 
        cmd.includes('pregled') || cmd.includes('skladiste') || cmd.includes('inventory')) {
        console.log('📦 ZALIHE - otvaram');
        renderInventory();
        return;
    }
    
    // 🔥 SPISAK
    if (cmd.includes('spisak') || cmd.includes('potrebe') || cmd.includes('lista') || 
        cmd.includes('shopping') || cmd.includes('kupovina') || cmd.includes('list')) {
        console.log('🛒 SPISAK - otvaram');
        renderShoppingList();
        return;
    }
    
    // 🔥 END / KRAJ
    if (cmd.includes('end') || cmd.includes('kraj') || cmd.includes('gotovo') || 
        cmd.includes('stop') || cmd.includes('zavrsi')) {
        console.log('🏁 END - otvaram zalihe');
        renderInventory();
        return;
    }
    
    // 🔥 EXIT / IZLAZ
    if (cmd.includes('exit') || cmd.includes('izlaz') || cmd.includes('izadji')) {
        console.log('🚪 EXIT - gasim aplikaciju');
        exitApp();
        return;
    }
    
    // 🔥 Ako ništa od gore, pokušaj kao unos proizvoda
    if (command.length > 3) {
        console.log('📝 UNOS PROIZVODA:', command);
        renderDataEntry(command);
        return;
    }
    
    showVoiceStatus(`❌ Nije prepoznato: "${command}"`, '#f44336');
    console.warn('⚠️ Nepoznata komanda:', command);
}
function stopVoiceRecognition() {
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    window.isVoiceModeActive = false;
    activeBuffer = '';
    isProcessingCommand = false;
    micActive = false;
    showVoiceStatus('⏸️ Prepoznavanje zaustavljeno', '#aaa');
    console.log('⏹️ Voice recognition zaustavljen');
}

function selectVoiceMode() {
    console.log('🎤 selectVoiceMode pozvan');
    showVoiceStatus('🎤 Tražim dozvolu za mikrofon...', '#FFD700');
    
    // 🔥 SAKRIJ MENI I POKRENI
    hideVoiceMenu();
    window.isVoiceModeActive = true;
    
    // 🔥 MALA PAUZA ZA UI
    setTimeout(() => {
        startVoiceRecognition();
    }, 300);
}

// 🔥 NOVA FUNKCIJA: selectManualMode
function selectManualMode() {
    console.log('✍️ selectManualMode pozvan');
    // Sakrij choice screen i prikaži glavni ekran sa unosom
    const choiceScreen = document.getElementById('choiceScreen');
    if (choiceScreen) {
        choiceScreen.style.display = 'none';
        choiceScreen.classList.remove('active');
    }
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    // Prikaži unos podataka
    if (typeof renderDataEntry === 'function') {
        renderDataEntry('');
    }
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
window.goBackFromVoice = goBackFromVoice;
window.exitApp = exitApp;
window.selectManualMode = selectManualMode;

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

window.selectVoiceMode = selectVoiceMode;
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.requestMicrophonePermission = requestMicrophonePermission;
window.processVoiceCommand = processVoiceCommand;  // 🔥 PROMENJENO - SADA PRAVA FUNKCIJA
window.goBackFromVoice = goBackFromVoice;
window.exitApp = exitApp;
window.selectManualMode = selectManualMode;
window.forceStartVoice = forceStartVoice;
window.prikaziPoljaZaUnos = prikaziPoljaZaUnos;
window.saveLastAddedProducts = saveLastAddedProducts;
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
