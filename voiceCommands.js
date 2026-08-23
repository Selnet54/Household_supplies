// ============================================
// VOICE COMMANDS - KONAČNA ISPRAVNA VERZIJA
// ============================================

let activeBuffer = ''; 
let recognition = null;
let lastSavedData = null;
let isProcessingCommand = false;
let END_AKTIVAN = false;
let isVoiceInput = false;

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

// ============================================
// 2. BROJEVI NA SRPSKOM
// ============================================

const NUMBER_WORDS = {
    'nula': '0',
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

function getNumber(word) {
    const w = word.toLowerCase().trim();
    if (NUMBER_WORDS[w] !== undefined) return NUMBER_WORDS[w];
    if (/^\d+(?:[.,]\d+)?$/.test(w)) return w.replace(',', '.');
    return null;
}

// ============================================
// 3. JEDINICE I SKLADIŠTA
// ============================================

const UNIT_MAP = {
    'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg',
    'gram': 'g', 'grama': 'g', 'g': 'g',
    'litar': 'l', 'litara': 'l', 'l': 'l',
    'komad': 'kom', 'komada': 'kom', 'kom': 'kom',
    'paket': 'pak', 'paketa': 'pak', 'pak': 'pak'
};

const STORAGE_MAP = {
    'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
    'zamrzivač 1': 'Zamrzivač 1', 'zamrzivac 1': 'Zamrzivač 1',
    'zamrzivač 2': 'Zamrzivač 2', 'zamrzivac 2': 'Zamrzivač 2',
    'zamrzivač 3': 'Zamrzivač 3', 'zamrzivac 3': 'Zamrzivač 3',
    'frižider': 'Frižider', 'frizider': 'Frižider',
    'ostava': 'Ostava', 'špajz': 'Ostava'
};

function getUnit(word) {
    return UNIT_MAP[word.toLowerCase()] || null;
}

function getStorage(word) {
    const w = word.toLowerCase();
    for (let key in STORAGE_MAP) {
        if (w.includes(key) || key.includes(w)) {
            return STORAGE_MAP[key];
        }
    }
    return null;
}

// ============================================
// 4. PARSIRANJE
// ============================================

function parseVoiceDataEntry(command) {
    console.log('🔍 PARSIRAM:', command);
    
    let text = command
        .replace(/^unos\s*/i, '')
        .replace(/^start\s*/i, '')
        .replace(/^grile\s*/i, 'grill ')
        .replace(/^gril\s*/i, 'grill ')
        .replace(/\bGreen\b/gi, 'grill ')
        .replace(/\bgreen\b/gi, 'grill ')
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
    
    let foundStorage = null;
    let foundUnit = null;
    let unitIndex = -1;
    let storageIndex = -1;
    
    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        
        let storageMatch = getStorage(w);
        if (storageMatch) {
            foundStorage = storageMatch;
            storageIndex = i;
        }
        
        let unitMatch = getUnit(w);
        if (unitMatch) {
            foundUnit = unitMatch;
            unitIndex = i;
        }
    }
    
    let nameParts = [];
    let numbers = [];
    let skipWords = ['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima', 'i'];
    
    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        let originalW = words[i];
        
        if (i === storageIndex || i === unitIndex) {
            continue;
        }
        
        if (skipWords.includes(w)) {
            continue;
        }
        
        let numVal = getNumber(w);
        if (numVal !== null) {
            numbers.push(numVal);
            continue;
        }
        
        nameParts.push(originalW);
    }
    
    console.log('📊 Brojevi:', numbers);
    console.log('📊 Naziv delovi:', nameParts);
    
    if (numbers.length >= 2) {
        result.piece = numbers[0];
        result.quantity = numbers[1];
    } else if (numbers.length === 1) {
        result.piece = numbers[0];
        result.quantity = numbers[0];
    }
    
    let rokPronadjen = false;
    
    if (text.includes('šest') || text.includes('sest') || /\b6\b/.test(text)) {
        result.shelf_life = '6';
        rokPronadjen = true;
        console.log('🔍 Pronađeno "šest/6" -> rok = 6 meseci');
    }
    
    if (!rokPronadjen) {
        let meseciMatch = text.match(/(\d+)\s*meseci/);
        if (meseciMatch) {
            result.shelf_life = meseciMatch[1];
            rokPronadjen = true;
            console.log('🔍 Pronađeno "' + meseciMatch[1] + ' meseci" -> rok = ' + meseciMatch[1]);
        }
    }
    
    if (!rokPronadjen && numbers.length >= 3) {
        result.shelf_life = numbers[2];
        rokPronadjen = true;
        console.log('🔍 Treći broj -> rok =', numbers[2]);
    }
    
    if (!rokPronadjen && numbers.length >= 2 && foundUnit !== 'kg' && foundUnit !== 'g') {
        if (foundUnit === 'kom' || foundUnit === 'l' || foundUnit === 'ml') {
            result.shelf_life = numbers[1];
            rokPronadjen = true;
            console.log('🔍 Drugi broj (jedinica ' + foundUnit + ') -> rok =', numbers[1]);
        }
    }
    
    // ============================================
    // KORAK 5: NAZIV PROIZVODA
    // ============================================
    
    result.product_name = nameParts.join(' ').trim() || 'Proizvod';
    
    // ============================================
// KORAK 6: JEDINICA I SKLADIŠTE - POPRAVLJENO
// ============================================

// ⭐ PRVO PROVERI DA LI JE "g" U TEKSTU (pre svega ostalog!)
if (text.includes('gram') || text.includes('grama') || text.includes('g ') || text.includes('g)')) {
    result.unit = 'g';
    console.log('🔍 Pronađeno "gram" -> jedinica = g');
} else if (foundUnit) {
    result.unit = foundUnit;
    console.log('🔍 Pronađena jedinica iz reči:', foundUnit);
} else if (text.includes('kilogram') || text.includes('kg')) {
    result.unit = 'kg';
    console.log('🔍 Pronađeno "kilogram" -> jedinica = kg');
} else if (text.includes('litar') || text.includes('l ')) {
    result.unit = 'l';
    console.log('🔍 Pronađeno "litar" -> jedinica = l');
} else if (text.includes('komad') || text.includes('kom')) {
    result.unit = 'kom';
    console.log('🔍 Pronađeno "komad" -> jedinica = kom');
}

if (foundStorage) {
    result.storage = foundStorage;
}
    
    // ============================================
    // KORAK 7: POPRAVKA ZA "500 GRAMA"
    // ============================================
    
    let gramMatches = text.match(/\b(500|700|800|900|1000)\b/);
    if (gramMatches) {
        if (result.unit === 'kom' || result.unit === 'l') {
            if (text.includes('gram') || text.includes('grama')) {
                result.unit = 'g';
                console.log('🔍 Grami detektovani -> jedinica = g');
            }
        }
        if (result.quantity === '1' && numbers.length === 1) {
            result.quantity = gramMatches[1];
            result.piece = gramMatches[1];
            console.log('🔍 Količina postavljena na: ' + gramMatches[1] + 'g');
        }
    }
    
    console.log('✅ PARSIRANO:', result);
    return result;
}

// ============================================
// 5. POPUNJAVANJE FORME
// ============================================

function popuniFormuPodacima(data) {
    console.log('📝 Popunjavam formu:', data);
    
    setTimeout(() => {
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
        
        showVoiceStatus(`✅ Uneto: ${data.product_name} (${data.quantity} ${data.unit})`, '#4CAF50');
    }, 300);
}

// ============================================
// 6. ČUVANJE PODATAKA
// ============================================

function sacuvajPodatke(data) {
    console.log('💾 Čuvam podatke:', data);
    
    isVoiceInput = true;
    window._isVoiceInput = true;
    
    // ⛔ UGASI SVE POPUP-OVE
    const originalShowModernAlert = window.showModernAlert;
    window.showModernAlert = function() {
        console.log('⛔ POP-UP ZABRANJEN (voice input)');
        return;
    };
    
    const originalAlert = window.alert;
    window.alert = function() {
        console.log('⛔ ALERT ZABRANJEN (voice input)');
        return;
    };
    
    let saved = false;
    
    if (typeof saveProduct === 'function') {
        try { 
            saveProduct(); 
            saved = true; 
            console.log('✅ saveProduct'); 
        } catch(e) {
            console.warn('saveProduct greška:', e);
        }
    }
    
    if (!saved && typeof handleFormSubmit === 'function') {
        try { 
            handleFormSubmit(); 
            saved = true; 
            console.log('✅ handleFormSubmit'); 
        } catch(e) {
            console.warn('handleFormSubmit greška:', e);
        }
    }
    
    if (!saved && typeof addProduct === 'function') {
        try { 
            addProduct(); 
            saved = true; 
            console.log('✅ addProduct'); 
        } catch(e) {
            console.warn('addProduct greška:', e);
        }
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
            expiryDate: new Date(Date.now() + parseInt(data.shelf_life || 12) * 30 * 24 * 60 * 60 * 1000).toISOString(),
            isNew: true
        };
        window.inventory.push(newItem);
        saved = true;
        console.log('✅ Dodat u inventory niz');
    }
    
    if (!saved) {
        const saveBtn = document.querySelector('#saveProductBtn, button[type="submit"], .btn-save, .save-btn');
        if (saveBtn) {
            try { 
                saveBtn.click(); 
                saved = true; 
                console.log('✅ Klik na dugme za čuvanje'); 
            } catch(e) {
                console.warn('Klik greška:', e);
            }
        }
    }
    
    // Vrati originalne funkcije
    setTimeout(() => {
        window.showModernAlert = originalShowModernAlert;
        window.alert = originalAlert;
    }, 1000);
    
    if (saved) {
        showVoiceStatus(`✅ Sačuvano: ${data.product_name}`, '#4CAF50');
        console.log('✅ Podaci sačuvani!');
        
        setTimeout(() => {
            if (typeof prikaziSveUnose === 'function') {
                try { 
                    prikaziSveUnose(); 
                    console.log('✅ Pregled unosa osvežen');
                } catch(e) {
                    console.warn('prikaziSveUnose greška:', e);
                }
            }
            if (typeof renderInventory === 'function') {
                try { 
                    renderInventory(); 
                    console.log('✅ Inventar osvežen');
                } catch(e) {}
            }
            console.log('✅ Podaci osveženi');
        }, 50);
        
    } else {
        console.error('❌ Greška pri čuvanju!');
        showVoiceStatus('❌ Greška pri čuvanju!', '#f44336');
    }
    
    setTimeout(() => {
        isVoiceInput = false;
        window._isVoiceInput = false;
    }, 1000);
}

// ============================================
// 7. OTVARANJE ZALIHA
// ============================================

function otvoriZaliheEkran() {
    console.log('📦 Otvaram ekran zaliha...');
    
    // Osveži podatke
    if (typeof refreshInventoryData === 'function') {
        try { refreshInventoryData(); } catch(e) {}
    }
    
    setTimeout(() => {
        if (typeof renderInventory === 'function') {
            try { renderInventory(); } catch(e) {}
        }
        if (typeof renderProductList === 'function') {
            try { renderProductList(); } catch(e) {}
        }
        if (typeof renderEntries === 'function') {
            try { renderEntries(); } catch(e) {}
        }
        if (typeof loadInventory === 'function') {
            try { loadInventory(); } catch(e) {}
        }
        if (typeof updateInventory === 'function') {
            try { updateInventory(); } catch(e) {}
        }
    }, 100);
    
    setTimeout(() => {
        if (typeof openInventoryAndShowHighlight === 'function') {
            try { openInventoryAndShowHighlight(); } catch(e) {}
        } else if (typeof showScreen === 'function') {
            try { showScreen('inventoryScreen'); } catch(e) {}
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
        showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
    }, 200);
}

// ============================================
// 8. OBRADA I ČUVANJE
// ============================================

function processAndSaveItem(command) {
    let data = parseVoiceDataEntry(command);
    if (!data.product_name || data.product_name === 'Proizvod' || data.product_name.length < 2) {
        console.warn('⚠️ Nije prepoznat naziv proizvoda:', command);
        showVoiceStatus('❌ Nisam prepoznao proizvod', '#f44336');
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

// ============================================
// 9. START VOICE RECOGNITION
// ============================================

function startVoiceRecognition() {
    console.log('🎤 startVoiceRecognition POZVAN!');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showVoiceStatus('❌ Browser ne podržava glasovno prepoznavanje.', '#f44336');
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

    END_AKTIVAN = false;
    isProcessingCommand = false;

    recognition.onstart = function() {
        console.log('🎤 MIKROFON AKTIVAN!');
        showVoiceStatus('🎤 Slušam... Recite "start" pa podatke', '#2196F3');
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
        showVoiceStatus(`🎤 Slušam: "${currentDisplay}"`, '#FFD700');
        
        if (isProcessingCommand) return;
        
        const lowerFull = activeBuffer.toLowerCase();
        console.log('🔍 PROVERAVAM CELI BAFER:', lowerFull);
        
        // ============================================
        // 1. "END" - OTVARA ZALIHE
        // ============================================
        if (lowerFull.includes('end') || 
            lowerFull.includes('kraj') || 
            lowerFull.includes('gotovo') ||
            lowerFull.includes('enter') ||
            lowerFull.includes('friend')) {
            console.log('🏁 END DETEKTOVAN - otvaram zalihe!');
            isProcessingCommand = true;
            END_AKTIVAN = true;
            
            let itemText = activeBuffer;
            const endWords = ['end', 'kraj', 'gotovo', 'enter', 'friend'];
            for (let word of endWords) {
                if (itemText.toLowerCase().includes(word)) {
                    const parts = itemText.split(new RegExp(word, 'i'));
                    itemText = parts[0].trim();
                    break;
                }
            }
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }
            
            activeBuffer = '';
            
            setTimeout(() => {
                stopVoiceRecognition();
                setTimeout(() => {
                    if (typeof prikaziSveUnose === 'function') {
                        try { prikaziSveUnose(); } catch(e) {}
                    }
                    if (typeof renderInventory === 'function') {
                        try { renderInventory(); } catch(e) {}
                    }
                    otvoriZaliheEkran();
                    END_AKTIVAN = false;
                }, 500);
            }, 300);
            
            return;
        }
        
        // ============================================
        // 2. "PLUS" - ZAVRŠAVA UNOS
        // ============================================
        if (lowerFull.includes('plus')) {
            console.log('✅ PLUS DETEKTOVAN - završavam unos (NE otvaram zalihe)');
            isProcessingCommand = true;
            
            let parts = activeBuffer.split(/\bplus\b/i);
            let itemText = parts[0].trim();
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }
            
            activeBuffer = parts.slice(1).join('').trim();
            
            showVoiceStatus('✅ Unos sačuvan. Recite sledeći ili "end" za kraj.', '#4CAF50');
            
            setTimeout(() => {
                if (typeof prikaziSveUnose === 'function') {
                    try { prikaziSveUnose(); } catch(e) {}
                }
                console.log('✅ Pregled osvežen nakon plus');
            }, 200);
            
            setTimeout(() => {
                isProcessingCommand = false;
            }, 500);
            
            return;
        }
        
        // ============================================
        // 3. "UNOS" - OTVARA DATA ENTRY
        // ============================================
        const dataEntryKeywords = ['unos', 'unesi', 'dodaj', 'novi', 'add'];
        if (dataEntryKeywords.some(k => lowerFull.includes(k))) {
            console.log('📝 UNOS DETEKTOVAN - otvaram data entry');
            hideVoiceMenu();
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen && mainScreen.style.display !== 'flex') {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
                if (typeof renderDataEntry === 'function') renderDataEntry('');
            }
            const words = activeBuffer.split(/\s+/);
            const filtered = words.filter(w => {
                const lower = w.toLowerCase();
                return !dataEntryKeywords.some(k => lower === k);
            });
            activeBuffer = filtered.join(' ');
        }
    };

    recognition.onerror = function(event) {
        console.error('⚠️ Speech Recognition greška:', event.error);
        if (event.error === 'not-allowed') {
            showVoiceStatus('❌ Dozvolite pristup mikrofonu.', '#f44336');
        } else if (event.error === 'no-speech') {
            showVoiceStatus('⚠️ Nisam čuo govor. Pokušajte ponovo.', '#FF9800');
        }
        isProcessingCommand = false;
    };

    recognition.onend = function() {
        console.log('🎤 Glasovno prepoznavanje završeno.');
        isProcessingCommand = false;
    };

    try {
        recognition.start();
        console.log('✅ Mikrofon pokrenut!');
        showVoiceStatus('🎤 Slušam...', '#2196F3');
    } catch(e) {
        console.error('❌ Greška pri pokretanju:', e);
        showVoiceStatus('❌ Greška pri pokretanju mikrofona', '#f44336');
    }
}

// ============================================
// 10. ZAUSTAVI PREPOZNAVANJE
// ============================================

function stopVoiceRecognition() {
    if (recognition) {
        try {
            recognition.stop();
            recognition = null;
        } catch(e) {}
    }
    activeBuffer = '';
    isProcessingCommand = false;
    showVoiceStatus('⏸️ Prepoznavanje zaustavljeno', '#aaa');
}

// ============================================
// 10.1 RESTART MIKROFONA
// ============================================

function restartMicrophone() {
    console.log('🔄 Restartujem mikrofon...');
    stopVoiceRecognition();
    setTimeout(() => {
        startVoiceRecognition();
    }, 500);
}

// ============================================
// 11. POVRATAK NA PREĐAŠNJI EKRAN
// ============================================

function goBackFromVoice() {
    console.log('◀ goBackFromVoice POZVAN!');
    stopVoiceRecognition();
    
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
}

// ============================================
// 12. SELEKTOVANJE VOICE MODE
// ============================================

function selectVoiceMode() {
    console.log('🎤 selectVoiceMode POZVAN!');
    
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    const voiceMenuScreen = document.getElementById('voiceMenuScreen');
    if (voiceMenuScreen) {
        voiceMenuScreen.style.display = 'flex';
        voiceMenuScreen.classList.add('active');
        console.log('✅ Voice menu prikazan');
    }
    
    setTimeout(function() {
        console.log('🎤 Pokrećem VOICE COMMANDS...');
        startVoiceRecognition();
    }, 500);
}

// ============================================
// 13. PREUZIMANJE KONTROLE
// ============================================

window._voiceCommandsStart = startVoiceRecognition;
window._voiceCommandsStop = stopVoiceRecognition;
window._voiceCommandsProcess = processAndSaveItem;
window._voiceCommandsParse = parseVoiceDataEntry;
window._voiceCommandsOpenZalihe = otvoriZaliheEkran;

window.startVoiceRecognition = function() {
    console.log('🎤 startVoiceRecognition -> VOICE COMMANDS');
    return window._voiceCommandsStart();
};

window.stopVoiceRecognition = function() {
    console.log('🛑 stopVoiceRecognition -> VOICE COMMANDS');
    return window._voiceCommandsStop();
};

window.processVoiceCommand = function(command) {
    console.log('🎤 processVoiceCommand (pregažen):', command);
    
    if (!command) return false;
    const lower = command.toLowerCase();
    
    if (lower.includes('plus')) {
        console.log('✅ PLUS - završavam unos (NE otvaram zalihe)');
        const itemText = command.replace(/plus/i, '').trim();
        if (itemText && typeof window._voiceCommandsProcess === 'function') {
            window._voiceCommandsProcess(itemText);
        }
        return true;
    }
    
    if (lower.includes('end') || lower.includes('kraj') || lower.includes('gotovo') || lower.includes('enter')) {
        console.log('🏁 END - otvaram zalihe');
        const itemText = command.replace(/end|kraj|gotovo|enter/i, '').trim();
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
    
    if (lower.includes('unos') || lower.includes('unesi') || lower.includes('dodaj')) {
        console.log('📝 UNOS - otvaram data entry');
        const itemText = command.replace(/unos|unesi|dodaj|novi|add/i, '').trim();
        hideVoiceMenu();
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

window.voiceCommand = function(command) {
    console.log('🎤 voiceCommand -> processVoiceCommand');
    return window.processVoiceCommand(command);
};

window.selectVoiceMode = selectVoiceMode;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.restartMicrophone = restartMicrophone;

// ============================================
// 14. ZABRANA OTVARANJA ZALIHA IZ renderInventory
// ============================================

(function() {
    console.log('🔥 BLOKIRAM OTVARANJE ZALIHA IZ VOICE KOMANDI!');
    
    const originalRenderInventory = window.renderInventory;
    const originalShowScreen = window.showScreen;
    const originalOpenInventory = window.openInventoryAndShowHighlight;
    
    window.renderInventory = function() {
        const stack = new Error().stack || '';
        const blocked = ['sacuvajPodatke', 'processAndSaveItem', 'processVoiceCommand', 'saveProduct', 'handleFormSubmit', 'addProduct'];
        const isBlocked = blocked.some(fn => stack.includes(fn));
        
        if (isBlocked) {
            console.log('⛔ BLOKIRANO: renderInventory iz voice komande');
            return;
        }
        
        if (typeof originalRenderInventory === 'function') {
            return originalRenderInventory.apply(this, arguments);
        }
    };
    
    window.showScreen = function(screenId) {
        const stack = new Error().stack || '';
        const blocked = ['sacuvajPodatke', 'processAndSaveItem', 'processVoiceCommand'];
        
        if (blocked.some(fn => stack.includes(fn)) && 
            (screenId === 'inventoryScreen' || screenId === 'mainScreen')) {
            console.log('⛔ BLOKIRANO: showScreen(' + screenId + ') iz voice komande');
            return;
        }
        
        if (typeof originalShowScreen === 'function') {
            return originalShowScreen.apply(this, arguments);
        }
    };
    
    window.openInventoryAndShowHighlight = function() {
        const stack = new Error().stack || '';
        if (stack.includes('sacuvajPodatke')) {
            console.log('⛔ BLOKIRANO: openInventoryAndShowHighlight iz voice komande');
            return;
        }
        
        if (typeof originalOpenInventory === 'function') {
            return originalOpenInventory.apply(this, arguments);
        }
    };
    
    console.log('✅ Otvaranje zaliha BLOKIRANO za voice komande!');
    console.log('⛔ Plus NE otvara zalihe!');
    console.log('✅ End otvara zalihe!');
    console.log('✅ 4. ekran (voiceMenuScreen) radi!');
})();

// ============================================
// 15. IZVOZ SVIH FUNKCIJA
// ============================================

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.processStartCommand = processAndSaveItem;
window.popuniStartPodatke = popuniFormuPodacima;
window.otvoriZaliheEkran = otvoriZaliheEkran;
window.sacuvajPodatke = sacuvajPodatke;
window.processAndSaveItem = processAndSaveItem;
window.selectVoiceMode = selectVoiceMode;
window.restartMicrophone = restartMicrophone;

console.log('✅ VOICE COMMANDS - KONAČNA VERZIJA UČITANA!');
console.log('🎤 "unos" → diktiraj → "plus" (samo završava) → "end" (otvara zalihe)');
console.log('⛔ PLUS NE otvara zalihe!');
console.log('📦 END otvara zalihe!');
console.log('📝 Pravilno parsiranje: 1. broj=komad, 2. broj=količina');
console.log('🔄 restartMicrophone dostupan!');

// ============================================
// TEST END - Ručno otvaranje zaliha
// ============================================

window.forceOpenInventory = function() {
    console.log('🔓 FORSIRAM otvaranje zaliha!');
    if (typeof prikaziSveUnose === 'function') {
        try { prikaziSveUnose(); } catch(e) {}
    }
    if (typeof renderInventory === 'function') {
        try { renderInventory(); } catch(e) {}
    }
    if (typeof openInventoryAndShowHighlight === 'function') {
        try { openInventoryAndShowHighlight(); } catch(e) {}
    } else if (typeof showScreen === 'function') {
        try { showScreen('inventoryScreen'); } catch(e) {}
    }
    console.log('✅ Zalihe otvorene');
