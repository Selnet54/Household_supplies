// ============================================
// VOICE COMMANDS - v8.0 (BUFFER + ISPRAVKE)
// ============================================

// 🔥 GLOBALNE PROMENLJIVE
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

// 🔥 BUFFER ZA SKUPLJANJE REČI
let voiceBuffer = '';

if (typeof window.currentLang === 'undefined') {
    window.currentLang = 'sr';
}

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

function parseVoiceDataEntry(command) {
    console.log('🔍 PARSIRAM:', command);
    
    let text = command.replace(/^(unos|start|dodaj|novi|novo|add|unesi)\s*/i, '').trim();
    
    let result = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    // 🔥 1. NAĐI SKLADIŠTE
    let foundStorage = null;
    let storageWords = ['zamrzivač', 'zamrzivac', 'frižider', 'frizider', 'ostava', 'špajz'];
    for (let word of storageWords) {
        const regex = new RegExp('(^|\\s)' + word + '(\\s|$)', 'i');
        if (regex.test(text)) {
            foundStorage = getStorage(word);
            if (foundStorage) break;
        }
    }
    if (foundStorage) result.storage = foundStorage;
    
    // 🔥 2. NAĐI JEDINICU
    let foundUnit = null;
    let unitWords = ['kilogram', 'kilograma', 'kg', 'gram', 'grama', 'grami',
                     'litar', 'litara', 'litri', 'komad', 'komada', 'kom', 'komadi',
                     'paket', 'paketa', 'pak', 'g', 'l'];
    for (let word of unitWords) {
        const regex = new RegExp('(^|\\s)' + word + '(\\s|$)', 'i');
        if (regex.test(text)) {
            foundUnit = getUnit(word);
            if (foundUnit) break;
        }
    }
    if (foundUnit) result.unit = foundUnit;
    
    // 🔥 3. NAĐI ROK - "X meseci"
    let meseciMatch = text.match(/(\d+|jedan|dva|tri|četiri|pet|šest|sedam|osam|devet|deset|jedanaest|dvanaest)\s*meseci/i);
    if (meseciMatch) {
        let val = meseciMatch[1].toLowerCase();
        if (NUMBER_WORDS[val]) val = NUMBER_WORDS[val];
        result.shelf_life = val;
        text = text.replace(meseciMatch[0], '').trim();
    }
    
    // 🔥 4. NAĐI SVE BROJEVE I NAZIV
    let words = text.split(/\s+/);
    let numbers = [];
    let nameParts = [];
    
    for (let word of words) {
        let num = getNumber(word);
        if (num !== null) {
            numbers.push(num);
        } else {
            let lower = word.toLowerCase();
            if (!unitWords.includes(lower) && !storageWords.includes(lower) && 
                lower !== 'meseci' && lower !== 'mesec' && lower !== 'meseca') {
                nameParts.push(word);
            }
        }
    }
    
    // 🔥 5. DODELA KOLIČINA
    if (foundUnit === 'kg' || foundUnit === 'g' || foundUnit === 'l') {
        // Za kg/g/l: piece = broj pakovanja, quantity = količina
        if (numbers.length >= 2) {
            result.piece = numbers[0];
            result.quantity = numbers[1];
        } else if (numbers.length === 1) {
            result.piece = '1';
            result.quantity = numbers[0];
        }
    } else {
        // Za kom/pak
        if (numbers.length >= 1) {
            result.piece = numbers[0];
            result.quantity = numbers[0];
        }
        if (numbers.length >= 2 && !meseciMatch) {
            result.shelf_life = numbers[1];
        }
    }
    
    // 🔥 6. NAZIV
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
// 3. POPUNJAVANJE FORME
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
    console.log('📝 Popunjavam formu:', data);
    
    const dataEntryScreen = document.getElementById('dataEntryScreen');
    if (!dataEntryScreen || dataEntryScreen.style.display === 'none') {
        if (typeof window.renderDataEntry === 'function') {
            window.renderDataEntry('');
        } else if (typeof renderDataEntry === 'function') {
            renderDataEntry('');
        }
    }
    
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
    }, 400);
}

// ============================================
// 4. PREPOZNAVANJE GOVORA
// ============================================

function startVoiceRecognition() {
    console.log('🎤 startVoiceRecognition pozvan!');

    if (isRestarting) {
        console.log('⏳ Već se restartuje, ignorišem');
        return;
    }

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
    if (noSpeechTimer) {
        clearTimeout(noSpeechTimer);
        noSpeechTimer = null;
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
    isRestarting = true;

    function beginRecognition() {
        recognition = new SpeechRecognition();

        const speechLangMap = {
            sr: 'sr-RS', en: 'en-US', de: 'de-DE',
            hu: 'hu-HU', uk: 'uk-UA', ru: 'ru-RU',
            es: 'es-ES', fr: 'fr-FR'
        };
        recognition.lang = speechLangMap[currentLang] || 'sr-RS';

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;

        recognition.onstart = function() {
            showVoiceStatus('🎤 Slušam...', '#4CAF50');
            isProcessingCommand = false;
            micActive = true;
            isRestarting = false;
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

            if (event.error === 'aborted') {
                isRestarting = false;
                return;
            }

            if (event.error === 'no-speech') {
                console.log('🔇 Nema govora, čekam 2s pre restarta...');
                
                // 🔥 NE RESTARTUJ ODMAH - čekaj 2 sekunde
                if (noSpeechTimer) clearTimeout(noSpeechTimer);
                noSpeechTimer = setTimeout(() => {
                    if (window.isVoiceModeActive && !micActive && !isRestarting) {
                        console.log('🔄 Restart posle no-speech pauze');
                        startVoiceRecognition();
                    }
                }, 2000);
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
                    }, 1500);
                }
            }
            isProcessingCommand = false;
        };

        recognition.onend = function() {
            console.log('⏹️ Mikrofon zaustavljen');
            micActive = false;
            recognition = null;
            
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
// 5. ZAUSTAVLJANJE
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
    
    if (!command || command.length < 1) {
        return;
    }
    
    let cmd = command.trim();
    let lowerCmd = cmd.toLowerCase();
    console.log('🔍 Procesiram:', lowerCmd);
    
    // ============================================
    // KOMANDA: START - otvori prazan unos (ili sa podacima)
    // ============================================
    if (lowerCmd.startsWith('start') || lowerCmd.startsWith('unos') || 
        lowerCmd.startsWith('unesi') || lowerCmd.startsWith('pokreni') ||
        lowerCmd.startsWith('zapocni') || lowerCmd.startsWith('počni') ||
        lowerCmd.startsWith('novi') || lowerCmd.startsWith('novo') || 
        lowerCmd.startsWith('enter') || lowerCmd.startsWith('add')) {
        
        console.log('▶️ START - otvaram unos');
        
        // 🔥 Izbaci "Start" i dodaj ostatak u buffer
        voiceBuffer = cmd.replace(/^(start|unos|unesi|pokreni|zapocni|počni|novi|novo|enter|add)\s*/i, '').trim();
        console.log('📦 Buffer nakon Start:', voiceBuffer);
        
        // Otvori ekran za unos
        if (typeof window.renderDataEntry === 'function') {
            window.renderDataEntry('');
        } else if (typeof renderDataEntry === 'function') {
            renderDataEntry('');
        }
        
        if (voiceBuffer) {
            showVoiceStatus(`🎤 Slušam: "${voiceBuffer}"`, '#FFD700');
        } else {
            showVoiceStatus('🎤 Unos otvoren. Redosled: naziv → komad → količina → jedinica → rok → skladište → "plus"', '#4CAF50');
        }
        return;
    }
    
    // ============================================
    // KOMANDA: PLUS - parsiraj buffer i upiši u polja
    // ============================================
    if (lowerCmd.includes('plus') || lowerCmd.includes('dodaj') || 
        lowerCmd.includes('sačuvaj') || lowerCmd.includes('sacuvaj')) {
        
        console.log('➕ PLUS - upisujem buffer:', voiceBuffer);
        
        // Izbaci "Plus" iz trenutne komande
        let cleanCommand = cmd.replace(/\b(plus|dodaj|sačuvaj|sacuvaj)\b/gi, '').trim();
        if (cleanCommand.length > 1) {
            voiceBuffer += (voiceBuffer ? ' ' : '') + cleanCommand;
        }
        
        console.log('📦 Buffer pre upisa:', voiceBuffer);
        
        if (voiceBuffer.trim().length < 2) {
            showVoiceStatus('❌ Nema podataka za upis.', '#f44336');
            return;
        }
        
        // 🔥 PARSIRAJ CEO BUFFER
        const data = parseVoiceDataEntry(voiceBuffer);
        console.log('📦 PARSED:', data);
        
        // 🔥 POPUNI FORMU
        popuniFormuPodacima(data);
        
        // 🔥 SAČEKAJ, PA SAČUVAJ
        setTimeout(() => {
            if (typeof window.saveProduct === 'function') {
                window.saveProduct();
            } else if (typeof saveProduct === 'function') {
                saveProduct();
            }
            console.log('✅ Sačuvano iz buffera:', voiceBuffer);
        }, 800);
        
        showVoiceStatus(`✅ Sačuvano: ${data.product_name}. Polja ostaju. Recite "Start" za novi unos ili "End"`, '#4CAF50');
        
        // 🔥 NE BRIŠI BUFFER - ostaje dok ne kažeš "Start"
        // 🔥 NE BRIŠI POLJA - ostaju popunjena
        return;
    }
    
    // ============================================
    // KOMANDA: END - sačuvaj zadnji unos, otvori zalihe
    // ============================================
    if (lowerCmd.includes('end') || lowerCmd.includes('kraj') || 
        lowerCmd.includes('gotovo') || lowerCmd.includes('zavrsi')) {
        
        console.log('🏁 END - završavam unos');
        
        // Izbaci "End" iz trenutne komande
        let cleanCommand = cmd.replace(/\b(end|kraj|gotovo|zavrsi)\b/gi, '').trim();
        if (cleanCommand.length > 1) {
            voiceBuffer += (voiceBuffer ? ' ' : '') + cleanCommand;
        }
        
        console.log('📦 Buffer pre upisa:', voiceBuffer);
        
        // 🔥 Ako ima nešto u bufferu, parsiraj i upiši
        if (voiceBuffer.trim().length > 2) {
            const data = parseVoiceDataEntry(voiceBuffer);
            console.log('📦 PARSED (End):', data);
            popuniFormuPodacima(data);
            
            // 🔥 Sačekaj da se forma popuni, pa sačuvaj
            setTimeout(() => {
                if (typeof window.saveProduct === 'function') {
                    window.saveProduct();
                } else if (typeof saveProduct === 'function') {
                    saveProduct();
                }
                console.log('✅ Sačuvano iz buffera (End):', voiceBuffer);
                
                // 🔥 Sačekaj još malo da vidiš podatke, pa otvori zalihe
                setTimeout(() => {
                    if (typeof window.renderInventory === 'function') {
                        window.renderInventory();
                    } else if (typeof renderInventory === 'function') {
                        renderInventory();
                    }
                    showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
                }, 2000);  // 2 sekunde da vidiš podatke pre prelaska
                
            }, 800);
        } else {
            // Ako nema ništa u bufferu, samo otvori zalihe
            setTimeout(() => {
                if (typeof window.renderInventory === 'function') {
                    window.renderInventory();
                } else if (typeof renderInventory === 'function') {
                    renderInventory();
                }
                showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
            }, 500);
        }
        
        // Resetuj buffer
        voiceBuffer = '';
        
        // Zaustavi mikrofon
        stopVoiceRecognition();
        return;
    }
    
    // ============================================
    // KOMANDA: ZALIHE
    // ============================================
    if (lowerCmd.includes('zalihe') || lowerCmd.includes('stanje') || 
        lowerCmd.includes('inventar') || lowerCmd.includes('inventory')) {
        console.log('📦 ZALIHE');
        voiceBuffer = '';
        if (typeof window.renderInventory === 'function') {
            window.renderInventory();
        } else if (typeof renderInventory === 'function') {
            renderInventory();
        }
        stopVoiceRecognition();
        return;
    }
    
    // ============================================
    // KOMANDA: SPISAK
    // ============================================
    if (lowerCmd.includes('spisak') || lowerCmd.includes('potrebe') || 
        lowerCmd.includes('lista') || lowerCmd.includes('shopping')) {
        console.log('🛒 SPISAK');
        voiceBuffer = '';
        if (typeof window.renderShoppingList === 'function') {
            window.renderShoppingList();
        } else if (typeof renderShoppingList === 'function') {
            renderShoppingList();
        }
        stopVoiceRecognition();
        return;
    }
    
    // ============================================
    // KOMANDA: NAZAD
    // ============================================
    if (lowerCmd.includes('nazad') || lowerCmd.includes('back') || lowerCmd.includes('vrati')) {
        console.log('⬅️ NAZAD');
        voiceBuffer = '';
        stopVoiceRecognition();
        if (typeof window.goBack === 'function') {
            window.goBack();
        } else if (typeof goBack === 'function') {
            goBack();
        }
        return;
    }
    
    // ============================================
    // KOMANDA: EXIT
    // ============================================
    if (lowerCmd.includes('exit') || lowerCmd.includes('izlaz') || 
        lowerCmd.includes('izadji') || lowerCmd.includes('zatvori')) {
        console.log('🚪 EXIT');
        voiceBuffer = '';
        stopVoiceRecognition();
        if (typeof window.exitApp === 'function') {
            window.exitApp();
        } else if (typeof exitApp === 'function') {
            exitApp();
        }
        return;
    }
    
    // ============================================
    // SVE OSTALO - SAMO DODAJ U BUFFER
    // ============================================
    console.log('📝 Dodajem u buffer:', cmd);
    voiceBuffer += (voiceBuffer ? ' ' : '') + cmd;
    console.log('📦 Buffer sada:', voiceBuffer);
    showVoiceStatus(`🎤 Slušam: "${voiceBuffer}"`, '#FFD700');
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
    console.log('✅ DOMContentLoaded - voiceCommands.js v8.0');
    
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

console.log('✅ VoiceCommands.js v8.0 UCITAN - BUFFER + ISPRAVKE!');
