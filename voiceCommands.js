// ============================================
// VOICE COMMANDS - RADNA VERZIJA
// ============================================

let recognition = null;
let isListening = false;  // <--- DODAJ OVO

// ===== SAKRIVANJE VOICE MENIJA =====
function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
        console.log('🔇 Voice menu sakriven');
    }
}

// ===== GLAVNA FUNKCIJA =====
function processVoiceCommand(command) {
    console.log('🎤 processVoiceCommand prima:', command);
    
    if (!command || command.trim() === '') {
        console.log('❌ Prazna komanda');
        return false;
    }
    
    const cmd = command.toLowerCase().trim();
    console.log('📝 Normalizovana komanda:', cmd);
    
    hideVoiceMenu();
    
    // ===== UNOS PODATAKA =====
    // ===== UNOS PODATAKA - NE GASI MIKROFON =====
if (cmd.includes('unos') || cmd.includes('unesi') || cmd.includes('dodaj') || 
    cmd.includes('add') || cmd.includes('entry') || cmd.includes('data')) {
    console.log('✅ Prepoznat UNOS PODATAKA!');
    // OT vori Data Entry - BEZ GAŠENJA MIKROFONA
    setTimeout(function() {
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        if (typeof renderDataEntry === 'function') {
            renderDataEntry('');
        } else if (typeof window.renderDataEntry === 'function') {
            window.renderDataEntry('');
        }
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '🎤 Recite "Start" pa diktirajte podatke';
            statusEl.style.color = '#4CAF50';
        }
    }, 300);
    return true;  // <--- NEMA stopVoiceRecognition()!
}
    
    // ===== START =====
    if (cmd.includes('start') || cmd.includes('stat') || cmd.includes('stard')) {
        console.log('🚀 Prepoznat START!');
        let restOfCommand = command.replace(/^start\s*/i, '').trim();
        if (restOfCommand) {
            processStartCommand(restOfCommand);
        } else {
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = '🎤 Diktirajte: naziv komad količina rok skladište';
                statusEl.style.color = '#FFD700';
            }
        }
        return true;
    }
    
    // ===== ZALIHE =====
    if (cmd.includes('stanje') || cmd.includes('zalihe') || cmd.includes('inventory') || cmd.includes('stock')) {
        console.log('✅ Prepoznate ZALIHE');
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderInventory === 'function') {
                renderInventory();
            }
        }, 300);
        return true;
    }

    // ===== SPISAK =====
    if (cmd.includes('spisak') || cmd.includes('kupovina') || cmd.includes('shopping') || cmd.includes('list')) {
        console.log('✅ Prepoznat SPISAK');
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderShoppingList === 'function') {
                renderShoppingList();
            }
        }, 300);
        return true;
    }

    // ===== NAZAD =====
    if (cmd.includes('nazad') || cmd.includes('vrati') || cmd.includes('odustani') || 
        cmd.includes('back') || cmd.includes('cancel')) {
        console.log('✅ Prepoznat NAZAD');
        setTimeout(function() {
            if (typeof handleBackAction === 'function') {
                handleBackAction();
            } else if (typeof goBackFromVoice === 'function') {
                goBackFromVoice();
            }
        }, 300);
        return true;
    }

    // ===== MENI =====
    if (cmd.includes('meni') || cmd.includes('početna') || cmd.includes('menu') || cmd.includes('home')) {
        console.log('✅ Prepoznat MENI');
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderCategories === 'function') {
                renderCategories();
            }
        }, 300);
        return true;
    }

    // ===== KATEGORIJE =====
    if (cmd.includes('kategorije') || cmd.includes('kategorija') || cmd.includes('categories') || cmd.includes('category')) {
        console.log('✅ Prepoznate KATEGORIJE');
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderCategories === 'function') {
                renderCategories();
            }
        }, 300);
        return true;
    }

    // ===== END =====
    if (cmd.includes('end') || cmd.includes('kraj') || cmd.includes('stop')) {
        console.log('🛑 Prepoznat END - kraj unosa!');
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        if (typeof renderInventory === 'function') {
            renderInventory();
        }
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '✅ Unos završen. Otvaram zalihe.';
            statusEl.style.color = '#4CAF50';
        }
        return true;
    }

    // ===== AKO NIJE PREPOZNATA =====
    console.log('❌ Komanda nije prepoznata:', cmd);
    showModernAlert('Nepoznata komanda', '"' + command + '" nije prepoznato.', '❓');
    return false;
}

// ===== PARSIRANJE =====
function parseVoiceDataEntry(command) {
    console.log('🔍 Parsiranje:', command);
    
    let text = command.toLowerCase().trim();
    
    const unitMap = {
        'kg': 'kg', 'kilogram': 'kg', 'kilograma': 'kg',
        'g': 'g', 'gram': 'g', 'grama': 'g',
        'l': 'l', 'litar': 'l', 'litara': 'l',
        'ml': 'ml', 'mililitar': 'ml', 'mililitara': 'ml',
        'kom': 'kom', 'komad': 'kom', 'komada': 'kom'
    };
    
    const storageMap = {
        'zamrzivač 2': 'Zamrzivač 2', 'zamrzivac 2': 'Zamrzivač 2',
        'zamrzivač 3': 'Zamrzivač 3', 'zamrzivac 3': 'Zamrzivač 3',
        'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
        'frižider': 'Frižider', 'frizider': 'Frižider',
        'ostava': 'Ostava'
    };
    
    const brojMap = {
        'jedan': '1', 'jedna': '1',
        'dva': '2',
        'tri': '3',
        'četiri': '4', 'cetiri': '4',
        'pet': '5',
        'šest': '6', 'sest': '6',
        'sedam': '7',
        'osam': '8',
        'devet': '9',
        'deset': '10'
    };
    
    for (let [key, value] of Object.entries(brojMap)) {
        text = text.replace(new RegExp('\\b' + key + '\\b', 'gi'), value);
    }
    
    let result = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    // Skladište
    for (let [key, value] of Object.entries(storageMap)) {
        if (text.includes(key)) {
            result.storage = value;
            text = text.replace(new RegExp(key, 'gi'), '').trim();
            break;
        }
    }
    
    // Jedinica + količina
    let foundUnit = false;
    for (let [key, value] of Object.entries(unitMap)) {
        let regex = new RegExp('(\\d+(?:[.,]\\d+)?)\\s*' + key, 'i');
        let match = text.match(regex);
        if (match) {
            result.quantity = match[1].replace(',', '.');
            result.piece = match[1];
            result.unit = value;
            text = text.replace(match[0], '').trim();
            foundUnit = true;
            break;
        }
    }
    
    // Brojevi
    let numbers = text.match(/\d+(?:[.,]\d+)?/g) || [];
    if (numbers.length >= 1 && !foundUnit) {
        result.quantity = numbers[0].replace(',', '.');
        result.piece = numbers[0];
    }
    if (numbers.length >= 2) {
        result.shelf_life = numbers[numbers.length - 1];
    }
    
    // Naziv
    let nameText = text.trim();
    const removeWords = ['kg', 'g', 'l', 'ml', 'kom', 'kilogram', 'gram', 'litar', 'mililitar', 'komad'];
    for (let word of removeWords) {
        nameText = nameText.replace(new RegExp('\\b' + word + '\\b', 'gi'), '');
    }
    result.product_name = nameText.trim() || 'Nepoznat proizvod';
    
    console.log('✅ Parsirano:', result);
    return result;
}

// ===== OBRADA START =====
function processStartCommand(command) {
    console.log('🚀 Procesiram:', command);
    
    let data = parseVoiceDataEntry(command);
    
    if (!data.product_name || data.product_name === 'Nepoznat proizvod') {
        showModernAlert('Greška', 'Nije prepoznat naziv proizvoda!', '❌');
        return false;
    }
    
    let productInput = document.getElementById('productInput');
    if (!productInput) {
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        if (typeof renderDataEntry === 'function') {
            renderDataEntry('');
        } else if (typeof window.renderDataEntry === 'function') {
            window.renderDataEntry('');
        }
        setTimeout(function() {
            popuniPodatke(data);
        }, 600);
    } else {
        popuniPodatke(data);
    }
    
    return true;
}

// ===== POPUNJAVANJE =====
function popuniPodatke(data) {
    console.log('📝 Popunjavam:', data);
    
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const unitSelect = document.getElementById('unitSelect');
    const storageSelect = document.getElementById('storageSelect');
    
    if (productInput) productInput.value = data.product_name;
    if (pieceInput) pieceInput.value = data.piece || '1';
    if (quantityInput) quantityInput.value = data.quantity || '1';
    if (shelfLifeInput) shelfLifeInput.value = data.shelf_life || '12';
    
    if (unitSelect && data.unit) {
        for (let option of unitSelect.options) {
            if (option.value === data.unit) {
                option.selected = true;
                break;
            }
        }
    }
    
    if (storageSelect && data.storage) {
        for (let option of storageSelect.options) {
            if (option.value === data.storage || option.text.includes(data.storage)) {
                option.selected = true;
                break;
            }
        }
    }
    
    if (typeof updateExpiryDate === 'function') {
        updateExpiryDate();
    }
    
    if (typeof prikaziSveUnose === 'function') {
        prikaziSveUnose();
    }
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '✅ ' + data.product_name + ', ' + data.quantity + ' ' + data.unit;
        statusEl.style.color = '#4CAF50';
    }
    
    setTimeout(function() {
        if (typeof saveProduct === 'function') {
            saveProduct();
            showModernAlert('✅', 'Proizvod sačuvan!', '🎤');
        }
    }, 800);
}

// ===== MIKROFON =====
function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        showModernAlert('Greška', 'Vaš pretraživač ne podržava glasovne komande.', '❌');
        return;
    }

    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }

    recognition = new SpeechRecognition();
    const langCode = typeof currentLang !== 'undefined' ? currentLang : 'sr';
    const speechLangMap = {
        sr: 'sr-RS', en: 'en-US', de: 'de-DE', hu: 'hu-HU',
        uk: 'uk-UA', ru: 'ru-RU', zh: 'zh-CN', es: 'es-ES',
        pt: 'pt-PT', fr: 'fr-FR'
    };
    recognition.lang = speechLangMap[langCode] || 'sr-RS';
    
    // ===== OVO JE VAŽNO - NE GASI SE =====
    recognition.continuous = true;   // <--- OSTJE UKLJUČEN
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎤 Slušam... Govorite komandu';
        statusEl.style.color = '#2196F3';
    }

    recognition.onstart = function() {
        console.log('🎤 Mikrofon aktivan - čekam komande');
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '🎤 Slušam...';
            statusEl.style.color = '#2196F3';
        }
    };

    recognition.onresult = function(event) {
        const speechResult = event.results[0][0].transcript.trim();
        console.log('🗣️ Prepoznato:', speechResult);
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '🗣️ "' + speechResult + '"';
            statusEl.style.color = '#FFD700';
        }
        
        // OBRADI KOMANDU - ALI NE GASI MIKROFON!
        processVoiceCommand(speechResult);
    };

    recognition.onerror = function(event) {
        console.error('⚠️ Greška:', event.error);
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Greška. Pokušajte ponovo.';
            statusEl.style.color = '#f44336';
        }
        if (event.error === 'not-allowed') {
            showModernAlert('Greška', 'Dozvolite pristup mikrofonu!', '🎤');
        }
    };

    recognition.onend = function() {
        console.log('🎤 Mikrofon zaustavljen');
        // Automatski ponovo pokreni ako je voice menu aktivan
        const voiceMenu = document.getElementById('voiceMenuScreen');
        if (voiceMenu && voiceMenu.classList.contains('active')) {
            setTimeout(function() {
                if (recognition) {
                    try {
                        recognition.start();
                        console.log('🎤 Ponovo pokrenut');
                    } catch(e) {}
                }
            }, 500);
        }
    };

    try {
        recognition.start();
        console.log('🎤 Slušam...');
    } catch(e) {
        console.error('❌ Greška:', e);
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Greška pri pokretanju mikrofona';
            statusEl.style.color = '#f44336';
        }
    }
}

// ===== ZAUSTAVI =====
function stopVoiceRecognition() {
    if (recognition) {
        try {
            recognition.stop();
            recognition = null;
            console.log('🛑 Mikrofon zaustavljen');
        } catch(e) {}
    }
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '⏸️ Zaustavljeno';
        statusEl.style.color = '#aaa';
    }
}

// ===== POVRATAK =====
function goBackFromVoice() {
    console.log('◀ Povratak');
    stopVoiceRecognition();
    showScreen('choiceScreen');
}

// ===== IZVOZ =====
window.processVoiceCommand = processVoiceCommand;
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.processStartCommand = processStartCommand;
window.popuniPodatke = popuniPodatke;

console.log('✅ Voice Commands učitan!');
