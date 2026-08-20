// ============================================
// VOICE COMMANDS - POTPUNO ISPRAVLJENA VERZIJA
// ============================================

let activeBuffer = ''; 
let recognition = null;
let lastSavedData = null;
let isProcessingCommand = false;
let END_AKTIVAN = false;
let isVoiceInput = false;
let ALLOW_INVENTORY_OPEN = false;

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
    'nula': '0', 'jedan': '1', 'jedna': '1', 'jedno': '1',
    'dva': '2', 'dve': '2', 'tri': '3', 'četiri': '4', 'cetiri': '4',
    'pet': '5', 'šest': '6', 'sest': '6', 'sedam': '7',
    'osam': '8', 'devet': '9', 'deset': '10',
    'jedanaest': '11', 'dvanaest': '12', 'trinaest': '13',
    'četrnaest': '14', 'cetrnaest': '14', 'petnaest': '15',
    'šesnaest': '16', 'sesnaest': '16', 'sedamnaest': '17',
    'osamnaest': '18', 'devetnaest': '19',
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
    'kilogrami': 'kg', 'kilogramima': 'kg',
    'gram': 'g', 'grama': 'g', 'g': 'g',
    'grami': 'g', 'gramima': 'g',
    'litar': 'l', 'litara': 'l', 'l': 'l',
    'litri': 'l', 'litrima': 'l',
    'komad': 'kom', 'komada': 'kom', 'kom': 'kom',
    'komadi': 'kom', 'komadima': 'kom',
    'paket': 'pak', 'paketa': 'pak', 'pak': 'pak',
    'paketi': 'pak', 'paketima': 'pak'
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
    let numbers = [];
    let numberPositions = [];
    let nameParts = [];
    let skipWords = ['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima', 'i'];
    
    // PRONAĐI JEDINICU I SKLADIŠTE
    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        
        let storageMatch = getStorage(w);
        if (storageMatch) {
            foundStorage = storageMatch;
            storageIndex = i;
            console.log('🏠 Pronađeno skladište:', foundStorage);
        }
        
        let unitMatch = getUnit(w);
        if (unitMatch) {
            foundUnit = unitMatch;
            unitIndex = i;
            console.log('📏 Pronađena jedinica:', foundUnit);
        }
    }
    
    // SPECIJALNI SLUČAJEVI ZA JEDINICE
    if (text.includes('gram') || text.includes('grama')) {
        foundUnit = 'g';
        console.log('🔍 Spec. slučaj: gram -> jedinica = g');
    } else if (text.includes('kilogram') || text.includes('kg')) {
        foundUnit = 'kg';
        console.log('🔍 Spec. slučaj: kilogram -> jedinica = kg');
    } else if (text.includes('litar') || text.includes('litara')) {
        foundUnit = 'l';
        console.log('🔍 Spec. slučaj: litar -> jedinica = l');
    }
    
    // IZVOZI BROJEVE I NAZIV
    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        let originalW = words[i];
        
        if (i === storageIndex || i === unitIndex) continue;
        if (skipWords.includes(w)) continue;
        
        let numVal = getNumber(w);
        if (numVal !== null) {
            numbers.push(numVal);
            numberPositions.push(i);
            console.log('🔢 Broj pronađen:', numVal);
            continue;
        }
        
        nameParts.push(originalW);
    }
    
    console.log('📊 Brojevi:', numbers);
    console.log('📊 Naziv delovi:', nameParts);
    
    // DODELA BROJEVA
    if (foundUnit === 'g') {
        // ZA GRAME: prvi broj = količina, drugi = rok
        if (numbers.length >= 1) {
            result.quantity = numbers[0];
            result.piece = '0';
            console.log('📦 g: količina=' + numbers[0] + 'g');
            if (numbers.length >= 2) {
                result.shelf_life = numbers[1];
                console.log('📦 g: rok=' + numbers[1]);
            }
        }
    } else if (foundUnit === 'kg') {
        // ZA KILOGRAME: prvi = komad, drugi = kg, treći = rok
        if (numbers.length >= 2) {
            result.piece = numbers[0];
            result.quantity = numbers[1];
            console.log('📦 kg: komad=' + numbers[0] + ', količina=' + numbers[1] + 'kg');
            if (numbers.length >= 3) {
                result.shelf_life = numbers[2];
                console.log('📦 kg: rok=' + numbers[2]);
            }
        } else if (numbers.length === 1) {
            result.quantity = numbers[0];
            result.piece = '0';
            console.log('📦 kg: količina=' + numbers[0] + 'kg');
        }
    } else if (foundUnit === 'l') {
        if (numbers.length >= 2) {
            result.piece = numbers[0];
            result.quantity = numbers[1];
            console.log('📦 l: komad=' + numbers[0] + ', količina=' + numbers[1] + 'l');
        } else if (numbers.length === 1) {
            result.quantity = numbers[0];
            result.piece = '0';
            console.log('📦 l: količina=' + numbers[0] + 'l');
        }
    } else {
        // ZA KOMADE
        if (numbers.length >= 2) {
            result.piece = numbers[0];
            result.quantity = numbers[1];
            console.log('📦 kom: komad=' + numbers[0] + ', količina=' + numbers[1]);
        } else if (numbers.length === 1) {
            result.piece = numbers[0];
            result.quantity = numbers[0];
            console.log('📦 kom: komad=' + numbers[0] + ', količina=' + numbers[0]);
        }
    }
    
    // ROK TRAJANJA
    if (result.shelf_life === '12') {
        let meseciMatch = text.match(/(\d+)\s*meseci/);
        if (meseciMatch) {
            result.shelf_life = meseciMatch[1];
            console.log('🔍 Rok iz "meseci":', meseciMatch[1]);
        } else if (numbers.length >= 3) {
            result.shelf_life = numbers[2];
            console.log('🔍 Treći broj -> rok =', numbers[2]);
        }
    }
    
    // NAZIV PROIZVODA
    let cleanNameParts = nameParts.filter(part => !/^\d+$/.test(part));
    result.product_name = cleanNameParts.join(' ').trim() || 'Proizvod';
    
    // POSTAVI JEDINICU
    if (foundUnit) {
        result.unit = foundUnit;
        console.log('✅ Jedinica postavljena na:', foundUnit);
    }
    
    // POSTAVI SKLADIŠTE
    if (foundStorage) {
        result.storage = foundStorage;
        console.log('✅ Skladište postavljeno na:', foundStorage);
    }
    
    console.log('✅ PARSIRANO:', result);
    return result;
}

// ============================================
// 5. PRIKAZ PODATAKA NA EKRANU
// ============================================

function prikaziTrenutniUnos(data) {
    console.log('📋 Prikazujem unos na ekranu:', data);
    
    let displayDiv = document.getElementById('voiceEntryDisplay');
    if (!displayDiv) {
        displayDiv = document.createElement('div');
        displayDiv.id = 'voiceEntryDisplay';
        displayDiv.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.85);
            color: #fff;
            padding: 15px 25px;
            border-radius: 12px;
            font-size: 18px;
            z-index: 9999;
            max-width: 90%;
            text-align: center;
            border: 2px solid #4CAF50;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            font-family: Arial, sans-serif;
            pointer-events: none;
        `;
        document.body.appendChild(displayDiv);
    }
    
    let html = `<strong style="color: #4CAF50;">✅ Sačuvan unos:</strong><br>`;
    html += `<span style="font-size: 20px;">${data.product_name}</span><br>`;
    html += `<span style="color: #aaa; font-size: 14px;">`;
    html += `${data.quantity} ${data.unit}`;
    if (data.piece && data.piece !== '0' && data.piece !== '1') {
        html += ` (${data.piece} kom)`;
    }
    html += ` | Rok: ${data.shelf_life} meseci`;
    html += ` | 📦 ${data.storage}`;
    html += `</span>`;
    displayDiv.innerHTML = html;
    displayDiv.style.display = 'block';
    
    clearTimeout(window._entryDisplayTimeout);
    window._entryDisplayTimeout = setTimeout(() => {
        displayDiv.style.display = 'none';
    }, 5000);
}

// ============================================
// 6. POPUNJAVANJE FORME
// ============================================

function popuniFormuPodacima(data) {
    console.log('📝 Popunjavam formu:', data);
    
    const productInput = document.getElementById('productInput');
    if (!productInput) {
        console.warn('⚠️ Forma nije pronađena, čekam 500ms...');
        setTimeout(() => popuniFormuPodacima(data), 500);
        return;
    }
    
    productInput.value = data.product_name || '';
    productInput.dispatchEvent(new Event('input', { bubbles: true }));
    productInput.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('✅ Naziv postavljen:', productInput.value);
    
    const pieceInput = document.getElementById('pieceInput');
    if (pieceInput) {
        pieceInput.value = data.piece || '1';
        pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
        pieceInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Komad postavljen:', pieceInput.value);
    }
    
    const quantityInput = document.getElementById('quantityInput');
    if (quantityInput) {
        quantityInput.value = data.quantity || '1';
        quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
        quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Količina postavljena:', quantityInput.value);
    }
    
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    if (shelfLifeInput) {
        shelfLifeInput.value = data.shelf_life || '12';
        shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
        shelfLifeInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Rok postavljen:', shelfLifeInput.value);
    }
    
    // JEDINICA - NE MENJAJ g u kg!
    const unitSelect = document.getElementById('unitSelect');
    if (unitSelect && data.unit) {
        for (let option of unitSelect.options) {
            if (option.value === data.unit || 
                option.text.toLowerCase().trim() === data.unit.toLowerCase().trim()) {
                option.selected = true;
                unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('✅ Jedinica postavljena na:', unitSelect.value);
                break;
            }
        }
    }
    
    const storageSelect = document.getElementById('storageSelect');
    if (storageSelect && data.storage) {
        for (let option of storageSelect.options) {
            if (option.value === data.storage || 
                option.text.toLowerCase().trim() === data.storage.toLowerCase().trim()) {
                option.selected = true;
                storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('✅ Skladište postavljeno na:', storageSelect.value);
                break;
            }
        }
    }
    
    if (typeof updateExpiryDate === 'function') {
        try { updateExpiryDate(); } catch(e) {}
    }
    
    showVoiceStatus(`✅ Uneto: ${data.product_name} (${data.quantity} ${data.unit})`, '#4CAF50');
}

// ============================================
// 7. ČUVANJE PODATAKA
// ============================================

function sacuvajPodatke(data) {
    console.log('💾 Čuvam podatke:', data);
    
    ALLOW_INVENTORY_OPEN = false;
    END_AKTIVAN = false;
    
    isVoiceInput = true;
    window._isVoiceInput = true;
    
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
    
    // POPUNI FORMU
    popuniFormuPodacima(data);
    prikaziTrenutniUnos(data);
    
    setTimeout(() => {
        console.log('🔍 Pokušavam da sačuvam...');
        
        if (typeof saveProduct === 'function') {
            try { 
                saveProduct(); 
                saved = true; 
                console.log('✅ saveProduct uspešan!'); 
            } catch(e) {
                console.warn('saveProduct greška:', e);
            }
        }
        
        if (!saved) {
            console.log('🔍 Pokušavam direktan upis u localStorage...');
            try {
                const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
                const newItem = {
                    id: Date.now(),
                    product_name: data.product_name,
                    piece: parseInt(data.piece) || 1,
                    quantity: parseFloat(data.quantity) || 1,
                    unit: data.unit || 'kom',
                    shelf_life_months: parseInt(data.shelf_life) || 12,
                    storage_location: data.storage || 'Zamrzivač 1',
                    entry_date: new Date().toISOString().split('T')[0],
                    isNew: true
                };
                zalihe.push(newItem);
                localStorage.setItem('zalihe', JSON.stringify(zalihe));
                saved = true;
                console.log('✅ Direktan upis uspešan!');
            } catch(e) {
                console.warn('localStorage greška:', e);
            }
        }
        
        setTimeout(() => {
            window.showModernAlert = originalShowModernAlert;
            window.alert = originalAlert;
        }, 1000);
        
        if (saved) {
            showVoiceStatus(`✅ Sačuvano: ${data.product_name}`, '#4CAF50');
            console.log('✅ Podaci sačuvani!');
            
            setTimeout(() => {
                if (typeof prikaziSveUnose === 'function') {
                    try { prikaziSveUnose(); } catch(e) {}
                }
            }, 200);
        } else {
            showVoiceStatus('❌ Greška pri čuvanju!', '#f44336');
        }
        
        setTimeout(() => {
            isVoiceInput = false;
            window._isVoiceInput = false;
        }, 1000);
        
    }, 300);
}

// ============================================
// 8. OBRADA I ČUVANJE - OVO MORA BITI DEFINISANO PRE startVoiceRecognition
// ============================================

function processAndSaveItem(command) {
    console.log('📦 processAndSaveItem POZVAN:', command);
    
    ALLOW_INVENTORY_OPEN = false;
    END_AKTIVAN = false;
    
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
        sacuvajPodatke(data);
    }, 100);

    return true;
}

// ============================================
// 9. OTVARANJE ZALIHA
// ============================================

function otvoriZaliheEkran() {
    console.log('📦 Otvaram ekran zaliha... (ALLOW_INVENTORY_OPEN=' + ALLOW_INVENTORY_OPEN + ')');
    
    if (!ALLOW_INVENTORY_OPEN) {
        console.log('⛔ ZABRANJENO: samo "end" može otvoriti zalihe');
        showVoiceStatus('⛔ Samo "end" otvara zalihe', '#FF9800');
        return;
    }
    
    hideVoiceMenu();
    
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    
    setTimeout(() => {
        if (typeof renderInventory === 'function') {
            try { renderInventory(); } catch(e) {}
        }
        
        const inventoryScreen = document.getElementById('inventoryScreen');
        if (inventoryScreen) {
            inventoryScreen.style.display = 'flex';
            inventoryScreen.classList.add('active');
            console.log('✅ Inventory screen prikazan');
        }
        
        if (mainScreen) {
            mainScreen.style.display = 'none';
            mainScreen.classList.remove('active');
        }
        
        if (typeof refreshInventoryData === 'function') {
            try { refreshInventoryData(); } catch(e) {}
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
        
        console.log('✅ Ekran zaliha otvoren');
        showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
        
        ALLOW_INVENTORY_OPEN = false;
    }, 300);
}

// ============================================
// 10. START VOICE RECOGNITION
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
    ALLOW_INVENTORY_OPEN = false;

    recognition.onstart = function() {
        console.log('🎤 MIKROFON AKTIVAN!');
        showVoiceStatus('🎤 Slušam... Recite "start" pa podatke', '#2196F3');
        activeBuffer = '';
        isProcessingCommand = false;
        END_AKTIVAN = false;
        ALLOW_INVENTORY_OPEN = false;
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
        if (lowerFull.includes('end')) {
            console.log('🏁 END DETEKTOVAN - otvaram zalihe!');
            isProcessingCommand = true;
            
            let itemText = activeBuffer;
            const parts = itemText.split(/\bend\b/i);
            itemText = parts[0].trim();
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }
            
            activeBuffer = '';
            
            setTimeout(() => {
                stopVoiceRecognition();
                setTimeout(() => {
                    ALLOW_INVENTORY_OPEN = true;
                    otvoriZaliheEkran();
                    setTimeout(() => {
                        ALLOW_INVENTORY_OPEN = false;
                        END_AKTIVAN = false;
                        isProcessingCommand = false;
                    }, 1000);
                }, 500);
            }, 800);
            
            return;
        }
        
        // ============================================
        // 2. "PLUS" - ZAVRŠAVA UNOS
        // ============================================
        if (lowerFull.includes('plus')) {
            console.log('✅ PLUS DETEKTOVAN - završavam unos');
            isProcessingCommand = true;
            
            ALLOW_INVENTORY_OPEN = false;
            END_AKTIVAN = false;
            
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
// 11. ZAUSTAVI PREPOZNAVANJE
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
// 12. RESTART MIKROFONA
// ============================================

function restartMicrophone() {
    console.log('🔄 Restartujem mikrofon...');
    stopVoiceRecognition();
    setTimeout(() => {
        startVoiceRecognition();
    }, 500);
}

// ============================================
// 13. POVRATAK NA PREĐAŠNJI EKRAN
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
// 14. SELEKTOVANJE VOICE MODE
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
// 15. PREUZIMANJE KONTROLE
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
    console.log('🎤 processVoiceCommand:', command);
    if (!command) return false;
    
    const lower = command.toLowerCase();
    
    if (lower.includes('plus')) {
        const itemText = command.replace(/plus/i, '').trim();
        if (itemText) processAndSaveItem(itemText);
        return true;
    }
    
    if (lower.includes('end')) {
        const itemText = command.replace(/end/i, '').trim();
        if (itemText) processAndSaveItem(itemText);
        setTimeout(() => {
            ALLOW_INVENTORY_OPEN = true;
            otvoriZaliheEkran();
            setTimeout(() => { ALLOW_INVENTORY_OPEN = false; }, 1000);
        }, 500);
        return true;
    }
    
    return false;
};

window.voiceCommand = function(command) {
    return window.processVoiceCommand(command);
};

window.selectVoiceMode = selectVoiceMode;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.restartMicrophone = restartMicrophone;

// ============================================
// 16. ZABRANA OTVARANJA ZALIHA IZ VOICE KOMANDI
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
})();

// ============================================
// 17. KRAJ
// ============================================

console.log('✅ VOICE COMMANDS - POPRAVLJENA VERZIJA UČITANA!');
console.log('🎤 "unos" → diktiraj → "plus" (završava) → "end" (otvara zalihe)');
console.log('⛔ PLUS NE otvara zalihe!');
console.log('📦 END otvara zalihe!');
console.log('🔄 restartMicrophone dostupan!');
