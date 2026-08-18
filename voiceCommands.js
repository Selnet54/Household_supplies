// ============================================
// VOICE COMMANDS - KOMPLETAN FAJL
// ============================================

let activeBuffer = ''; 
let recognition = null;
let lastSavedData = null;
let isProcessingCommand = false;
let END_AKTIVAN = false;

// ===== POMOĆNA FUNKCIJA ZA SAKRIVANJE EKRANA =====
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

// ===== POKRETAČ ZA GLASOVNI UNOS =====
function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        if (typeof showModernAlert === 'function') {
            showModernAlert('Greška', 'Vaš pretraživač ne podržava glasovne komande.', '❌');
        }
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
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    const statusEl = document.getElementById('voiceStatus');
    END_AKTIVAN = false;

    recognition.onstart = function() {
        console.log('🎤 Glasovno prepoznavanje pokrenuto');
        if (statusEl) {
            statusEl.textContent = '🎤 Slušam... Diktirajte (npr: "Pileći batak 1 kg 6 meseci zamrzivač 1 plus", a na kraju "end").';
            statusEl.style.color = '#2196F3';
        }
        activeBuffer = '';
        isProcessingCommand = false;
        END_AKTIVAN = false;
    };

    recognition.onresult = function(event) {
        let interimText = '';
        let finalChunk = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript.trim();
            if (result.isFinal) {
                finalChunk += (finalChunk ? ' ' : '') + transcript;
            } else {
                interimText += transcript;
            }
        }
        
        if (finalChunk) {
            activeBuffer += (activeBuffer ? ' ' : '') + finalChunk;
            console.log('🗣️ TRENUTNI BAFER:', activeBuffer);
        }
        
        const currentDisplay = activeBuffer + (interimText ? ' ' + interimText : '');
        if (statusEl) {
            statusEl.textContent = `🎤 Slušam: "${currentDisplay}"`;
            statusEl.style.color = '#FFD700';
        }
        
        if (isProcessingCommand) return;
        
        const lowerBuffer = activeBuffer.toLowerCase();
        
        // ============================================
        // 1. "END" - OTVARA ZALIHE
        // ============================================
        if (/\b(end|enter|friend|kraj|gotovo|kraj unosa)\b/i.test(lowerBuffer)) {
            console.log('🏁 END detektovan - otvaram zalihe');
            isProcessingCommand = true;
            END_AKTIVAN = true;
            
            let parts = activeBuffer.split(/\b(end|enter|friend|kraj|gotovo|kraj unosa)\b/i);
            let itemText = parts[0].trim();
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }
            
            activeBuffer = '';
            
            setTimeout(() => {
                stopVoiceRecognition();
                setTimeout(() => {
                    otvoriZaliheEkran();
                    setTimeout(() => {
                        END_AKTIVAN = false;
                    }, 1000);
                }, 500);
            }, 300);
            
            return;
        }
        
        // ============================================
        // 2. "PLUS" - SAMO ZAVRŠAVA UNOS
        // ============================================
        if (/\bplus\b/i.test(lowerBuffer)) {
            console.log('✅ PLUS detektovan - završavam unos (NE otvaram zalihe)');
            isProcessingCommand = true;
            
            let parts = activeBuffer.split(/\bplus\b/i);
            let itemText = parts[0].trim();
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }
            
            activeBuffer = parts.slice(1).join('').trim();
            
            if (statusEl) {
                statusEl.textContent = `✅ Unos sačuvan. Recite sledeći ili "end" za kraj.`;
                statusEl.style.color = '#4CAF50';
            }
            
            setTimeout(() => {
                isProcessingCommand = false;
            }, 500);
            
            return;
        }
        
        // ============================================
        // 3. "UNOS" - OTVARA DATA ENTRY
        // ============================================
        const dataEntryKeywords = ['unos', 'unesi', 'dodaj', 'novi', 'add'];
        if (dataEntryKeywords.some(k => lowerBuffer.includes(k))) {
            hideVoiceMenu();
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen && mainScreen.style.display !== 'flex') {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
                if (typeof renderDataEntry === 'function') renderDataEntry('');
            }
            activeBuffer = activeBuffer.replace(/^(unos|unesi|dodaj|novi|add)\s*/i, '');
        }
    };

    recognition.onerror = function(event) {
        console.log('⚠️ Speech Recognition greška:', event.error);
        if (event.error === 'not-allowed') {
            if (statusEl) {
                statusEl.textContent = '❌ Dozvolite pristup mikrofonu.';
                statusEl.style.color = '#f44336';
            }
        }
        isProcessingCommand = false;
    };

    recognition.onend = function() {
        console.log('🎤 Glasovno prepoznavanje završeno.');
        isProcessingCommand = false;
    };

    try {
        recognition.start();
    } catch(e) {
        console.log('❌ Greška pri pokretanju recognition-a:', e);
    }
}

// ===== ZAUSTAVI GLASOVNO PREPOZNAVANJE =====
function stopVoiceRecognition() {
    if (recognition) {
        try {
            recognition.stop();
            recognition = null;
        } catch(e) {}
    }
    activeBuffer = '';
    isProcessingCommand = false;
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '⏸️ Prepoznavanje zaustavljeno';
        statusEl.style.color = '#aaa';
    }
}

// ===== OTVORI ZALIHE =====
function otvoriZaliheEkran() {
    console.log('📦 Otvaram ekran zaliha... (END_AKTIVAN=' + END_AKTIVAN + ')');
    
    if (!END_AKTIVAN) {
        console.log('⛔ ZABRANJENO: samo "end" može otvoriti zalihe');
        return;
    }
    
    if (typeof refreshInventoryData === 'function') {
        refreshInventoryData();
    }
    
    setTimeout(() => {
        if (typeof renderInventory === 'function') renderInventory();
        if (typeof renderProductList === 'function') renderProductList();
        if (typeof renderEntries === 'function') renderEntries();
        if (typeof loadInventory === 'function') loadInventory();
        if (typeof updateInventory === 'function') updateInventory();
    }, 100);
    
    setTimeout(() => {
        if (typeof openInventoryAndShowHighlight === 'function') {
            openInventoryAndShowHighlight();
        } else if (typeof showScreen === 'function') {
            showScreen('inventoryScreen');
        } else {
            const inv = document.getElementById('inventoryScreen');
            const main = document.getElementById('mainScreen');
            if (inv) {
                if (main) main.style.display = 'none';
                inv.style.display = 'flex';
                inv.classList.add('active');
            }
        }
        console.log('✅ Ekran zaliha otvoren');
    }, 200);
}

// ===== PARSIRANJE =====
function parseVoiceDataEntry(command) {
    console.log('🔍 PARSIRAM:', command);
    
    let text = command
        .replace(/^unos\s*/i, '')
        .replace(/^start\s*/i, '')
        .trim();
        
    let words = text.split(/\s+/).map(s => s.trim()).filter(Boolean);
    
    console.log('📝 REČI:', words);
    
    let result = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    const unitMap = {
        'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg',
        'gram': 'g', 'grama': 'g', 'g': 'g',
        'litar': 'l', 'litara': 'l', 'l': 'l',
        'komad': 'kom', 'komada': 'kom', 'kom': 'kom',
        'paket': 'pak', 'paketa': 'pak', 'pak': 'pak'
    };
    
    const storageMap = {
        'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
        'zamrzivač 1': 'Zamrzivač 1', 'zamrzivac 1': 'Zamrzivač 1',
        'zamrzivač 2': 'Zamrzivač 2', 'zamrzivac 2': 'Zamrzivač 2',
        'zamrzivač 3': 'Zamrzivač 3', 'zamrzivac 3': 'Zamrzivač 3',
        'frižider': 'Frižider', 'frizider': 'Frižider',
        'ostava': 'Ostava', 'špajz': 'Ostava'
    };

    const numberWordsMap = {
        'jedan': '1', 'jedna': '1', 'jedno': '1',
        'dva': '2', 'dve': '2',
        'tri': '3',
        'četiri': '4', 'cetiri': '4',
        'pet': '5',
        'šest': '6', 'sest': '6',
        'sedam': '7',
        'osam': '8',
        'devet': '9',
        'deset': '10',
        'jedanaest': '11', 'dvanaest': '12',
        'trinaest': '13', 'četrnaest': '14', 'cetrnaest': '14',
        'petnaest': '15', 'šesnaest': '16', 'sesnaest': '16',
        'sedamnaest': '17', 'osamnaest': '18', 'devetnaest': '19',
        'dvadeset': '20', 'trideset': '30', 'četrdeset': '40',
        'cetrdeset': '40', 'pedeset': '50', 'šezdeset': '60',
        'sezdeset': '60', 'sedamdeset': '70', 'osamdeset': '80',
        'devedeset': '90', 'sto': '100'
    };

    let nameParts = [];
    let numbers = [];
    let foundUnit = null;
    let foundStorage = null;
    
    let i = 0;
    while (i < words.length) {
        let w = words[i].toLowerCase();
        let originalW = words[i];
        
        // Provera skladišta
        let storageMatch = null;
        for (let key in storageMap) {
            if (w.includes(key) || key.includes(w)) {
                storageMatch = storageMap[key];
                break;
            }
        }
        if (storageMatch) {
            foundStorage = storageMatch;
            i++;
            continue;
        }

        // Provera jedinice
        if (unitMap[w]) {
            foundUnit = unitMap[w];
            i++;
            continue;
        }

        // Provera broja
        let numVal = null;
        if (!isNaN(w) && w.trim() !== '') {
            numVal = w;
        } else if (numberWordsMap[w]) {
            numVal = numberWordsMap[w];
        }

        if (numVal !== null) {
            numbers.push(numVal);
            i++;
            continue;
        }

        // Preskoči nepotrebne reči
        if (['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima', 'i'].includes(w)) {
            i++;
            continue;
        }

        // Sve ostalo je deo naziva
        nameParts.push(originalW);
        i++;
    }
    
    result.product_name = nameParts.join(' ').trim() || 'Proizvod';
    
    if (numbers.length > 0) {
        result.quantity = numbers[0];
        result.piece = numbers[0];
    }
    
    if (numbers.length > 1) {
        result.shelf_life = numbers[1];
    }
    
    if (foundUnit) {
        result.unit = foundUnit;
    }
    
    if (foundStorage) {
        result.storage = foundStorage;
    }
    
    console.log('✅ PARSIRANO:', result);
    return result;
}

// ===== OBRADA I ČUVANJE =====
function processAndSaveItem(command) {
    let data = parseVoiceDataEntry(command);
    if (!data.product_name || data.product_name === 'Proizvod' || data.product_name.length < 2) {
        console.warn('⚠️ Nije prepoznat naziv proizvoda:', command);
        return false;
    }
    
    console.log('📦 OBRADA:', data);
    lastSavedData = data;
    
    hideVoiceMenu();
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    
    setTimeout(() => {
        popuniFormuPodacima(data);
        
        setTimeout(() => {
            sacuvajPodatke(data);
        }, 200);
        
    }, 100);

    return true;
}

// ===== POPUNJAVANJE FORME =====
function popuniFormuPodacima(data) {
    console.log('📝 Popunjavam formu:', data);
    
    const productInput = document.getElementById('productInput');
    if (productInput) {
        productInput.value = data.product_name || '';
        productInput.dispatchEvent(new Event('input', { bubbles: true }));
        productInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    const pieceInput = document.getElementById('pieceInput');
    if (pieceInput) {
        pieceInput.value = data.piece || '1';
        pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
        pieceInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    const quantityInput = document.getElementById('quantityInput');
    if (quantityInput) {
        quantityInput.value = data.quantity || '1';
        quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
        quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    if (shelfLifeInput) {
        shelfLifeInput.value = data.shelf_life || '12';
        shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
        shelfLifeInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    const unitSelect = document.getElementById('unitSelect');
    if (unitSelect && data.unit) {
        for (let option of unitSelect.options) {
            if (option.value === data.unit || option.text.toLowerCase().includes(data.unit)) {
                option.selected = true;
                unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }
    
    const storageSelect = document.getElementById('storageSelect');
    if (storageSelect && data.storage) {
        for (let option of storageSelect.options) {
            if (option.value === data.storage || option.text.includes(data.storage)) {
                option.selected = true;
                storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }
    
    if (typeof updateExpiryDate === 'function') {
        try { updateExpiryDate(); } catch(e) {}
    }
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `✅ Uneto: ${data.product_name} (${data.quantity} ${data.unit}) - ${data.storage}`;
        statusEl.style.color = '#4CAF50';
    }
}

// ===== ČUVANJE PODATAKA =====
function sacuvajPodatke(data) {
    console.log('💾 Čuvam podatke:', data);
    
    let saved = false;
    
    if (typeof saveProduct === 'function') {
        try { saveProduct(); saved = true; console.log('✅ saveProduct'); } catch(e) {}
    }
    
    if (!saved && typeof handleFormSubmit === 'function') {
        try { handleFormSubmit(); saved = true; console.log('✅ handleFormSubmit'); } catch(e) {}
    }
    
    if (!saved && typeof addProduct === 'function') {
        try { addProduct(); saved = true; console.log('✅ addProduct'); } catch(e) {}
    }
    
    if (!saved && typeof window.inventory !== 'undefined' && Array.isArray(window.inventory)) {
        const newItem = {
            id: Date.now(),
            productName: data.product_name,
            piece: parseInt(data.piece) || 1,
            quantity: parseFloat(data.quantity) || 1,
            unit: data.unit || 'kom',
            shelfLife: parseInt(data.shelf_life) || 12,
            storage: data.storage || 'Zamrzivač 1',
            dateAdded: new Date().toISOString(),
            expiryDate: new Date(Date.now() + parseInt(data.shelf_life || 12) * 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        window.inventory.push(newItem);
        saved = true;
        console.log('✅ Dodat u inventory');
    }
    
    if (!saved) {
        const saveBtn = document.querySelector('#saveProductBtn, button[type="submit"], .btn-save, .save-btn');
        if (saveBtn) {
            try { saveBtn.click(); saved = true; console.log('✅ Klik na dugme'); } catch(e) {}
        }
    }
    
    if (saved) {
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = `✅ Sačuvano: ${data.product_name}`;
            statusEl.style.color = '#4CAF50';
        }
        console.log('✅ Podaci sačuvani!');
        
        setTimeout(() => {
            if (typeof renderInventory === 'function') renderInventory();
            if (typeof renderProductList === 'function') renderProductList();
            if (typeof renderEntries === 'function') renderEntries();
            if (typeof loadInventory === 'function') loadInventory();
        }, 100);
        
    } else {
        console.error('❌ Greška pri čuvanju!');
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Greška pri čuvanju!';
            statusEl.style.color = '#f44336';
        }
    }
}

// ============================================
// ⭐ PREUZIMANJE KONTROLE - OVO JE KLJUČNO!
// ============================================

// 1. Prvo sačuvaj PRAVE funkcije
window._voiceCommandsStart = startVoiceRecognition;
window._voiceCommandsStop = stopVoiceRecognition;
window._voiceCommandsProcess = processAndSaveItem;
window._voiceCommandsParse = parseVoiceDataEntry;
window._voiceCommandsOpenZalihe = otvoriZaliheEkran;

// 2. Onda pregazi sve iz script1.js
window.startVoiceRecognition = function() {
    console.log('🎤 startVoiceRecognition -> pozivam VOICE COMMANDS');
    if (typeof window._voiceCommandsStart === 'function') {
        return window._voiceCommandsStart();
    }
    console.error('❌ _voiceCommandsStart nije definisan!');
};

window.stopVoiceRecognition = function() {
    console.log('🛑 stopVoiceRecognition -> pozivam VOICE COMMANDS');
    if (typeof window._voiceCommandsStop === 'function') {
        return window._voiceCommandsStop();
    }
};

window.processVoiceCommand = function(command) {
    console.log('🎤 processVoiceCommand (pregažen):', command);
    
    if (!command) return false;
    const lower = command.toLowerCase();
    
    // PLUS - NE OTVARA ZALIHE
    if (lower.includes('plus')) {
        console.log('✅ PLUS - završavam unos (NE otvaram zalihe)');
        const itemText = command.replace(/plus/i, '').trim();
        if (itemText && typeof window._voiceCommandsProcess === 'function') {
            window._voiceCommandsProcess(itemText);
        }
        return true;
    }
    
    // END - otvara zalihe
    if (lower.includes('end') || lower.includes('kraj') || lower.includes('gotovo')) {
        console.log('🏁 END - otvaram zalihe');
        const itemText = command.replace(/end|kraj|gotovo/i, '').trim();
        if (itemText && typeof window._voiceCommandsProcess === 'function') {
            window._voiceCommandsProcess(itemText);
        }
        setTimeout(() => {
            if (typeof window._voiceCommandsOpenZalihe === 'function') {
                window._voiceCommandsOpenZalihe();
            }
        }, 500);
        return true;
    }
    
    // UNOS
    if (lower.includes('unos') || lower.includes('unesi') || lower.includes('dodaj')) {
        console.log('📝 UNOS - otvaram data entry');
        const itemText = command.replace(/unos|unesi|dodaj|novi|add/i, '').trim();
        // Otvori data entry
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
            if (typeof renderDataEntry === 'function') renderDataEntry('');
        }
        if (itemText && typeof window._voiceCommandsProcess === 'function') {
            setTimeout(() => {
                window._voiceCommandsProcess(itemText);
            }, 500);
        }
        return true;
    }
    
    return false;
};

// 3. Pregazi i voiceCommand (iz script1.js)
window.voiceCommand = function(command) {
    console.log('🎤 voiceCommand -> processVoiceCommand');
    return window.processVoiceCommand(command);
};

// 4. Pregazi selectVoiceMode
window.selectVoiceMode = function() {
    console.log('🎤 selectVoiceMode (pregažen)');
    
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    const voiceMenuScreen = document.getElementById('voiceMenuScreen');
    if (voiceMenuScreen) {
        voiceMenuScreen.style.display = 'flex';
        voiceMenuScreen.classList.add('active');
    }
    
    setTimeout(function() {
        console.log('🎤 Pokrećem VOICE COMMANDS...');
        if (typeof window.startVoiceRecognition === 'function') {
            window.startVoiceRecognition();
        }
    }, 500);
};

// 5. Pregazi i goBackFromVoice
window.goBackFromVoice = function() {
    console.log('◀ goBackFromVoice (pregažen)');
    
    if (typeof window.stopVoiceRecognition === 'function') {
        window.stopVoiceRecognition();
    }
    
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    const choiceScreen = document.getElementById('choiceScreen');
    if (choiceScreen) {
        choiceScreen.style.display = 'flex';
        choiceScreen.classList.add('active');
    }
    
    if (typeof updateHeaderLanguage === 'function') {
        updateHeaderLanguage();
    }
    if (typeof updateInterfaceLanguage === 'function') {
        updateInterfaceLanguage();
    }
};

console.log('✅ VOICE COMMANDS - POTPUNO PREUZETE!');
console.log('✅ Plus NE otvara zalihe!');
console.log('✅ End otvara zalihe!');
console.log('✅ 4. ekran (voiceMenuScreen) radi!');
