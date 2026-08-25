// ============================================
// VOICE COMMANDS - OBJEDINJENA VERZIJA v3.0
// SA SVIM FUNKCIJAMA I POPRAVKAMA
// ============================================

let activeBuffer = '';
let recognition = null;
let lastSavedData = null;
let isProcessingCommand = false;
let isVoiceInput = false;
let micRestartTimer = null;
let micMonitoringInterval = null;
let micActive = false;
let ALLOW_INVENTORY_OPEN = false;
let END_AKTIVAN = false;

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
// 2. REČNIK I PARSIRANJE PODATAKA
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

const UNIT_MAP = {
    'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg', 'kilogrami': 'kg',
    'gram': 'g', 'grama': 'g', 'g': 'g', 'grami': 'g',
    'litar': 'l', 'litara': 'l', 'l': 'l', 'litri': 'l',
    'komad': 'kom', 'komada': 'kom', 'kom': 'kom', 'komadi': 'kom',
    'paket': 'pak', 'paketa': 'pak', 'pak': 'pak'
};

const WEIGHT_UNITS = ['kg', 'g', 'l'];

const STORAGE_MAP = {
    'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
    'zamrzivač 1': 'Zamrzivač 1', 'zamrzivac 1': 'Zamrzivač 1',
    'zamrzivač 2': 'Zamrzivač 2', 'zamrzivac 2': 'Zamrzivač 2',
    'zamrzivač 3': 'Zamrzivač 3', 'zamrzivac 3': 'Zamrzivač 3',
    'frižider': 'Frižider', 'frizider': 'Frižider',
    'ostava': 'Ostava', 'špajz': 'Ostava'
};

function getNumber(word) {
    const w = word.toLowerCase().trim();
    if (NUMBER_WORDS[w] !== undefined) return NUMBER_WORDS[w];
    if (/^\d+(?:[.,]\d+)?$/.test(w)) return w.replace(',', '.');
    return null;
}

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

// GLAVNA FUNKCIJA ZA PARSIRANJE
function parseVoiceDataEntry(command) {
    console.log('🔍 PARSIRAM:', command);
    
    let text = command
        .replace(/^unos\s*/i, '')
        .replace(/^start\s*/i, '')
        .replace(/^dodaj\s*/i, '')
        .replace(/^novi\s*/i, '')
        .replace(/^grill\s*/i, 'grill ')
        .replace(/\bGreen\b/gi, 'grill')
        .replace(/\bgreen\b/gi, 'grill')
        .trim();
    
    let words = text.split(/\s+/).map(s => s.trim()).filter(Boolean);
    console.log('📝 REČI:', words);
    
    let result = {
        product_name: '',
        piece: '0',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    let foundStorage = null;
    let foundUnit = null;
    let storageIndex = -1;
    let unitIndex = -1;
    let numbers = [];
    let numberPositions = [];
    let nameParts = [];
    let skipWords = ['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima', 'i', 'od', 'do', 'sa'];
    
    // Prvo identifikujemo jedinice i skladište
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
    
    // Specifični slučajevi za jedinice
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
    
    // Sakupljamo brojeve i naziv
    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        let originalW = words[i];
        
        if (i === storageIndex || i === unitIndex) continue;
        if (skipWords.includes(w)) continue;
        
        let numVal = getNumber(w);
        if (numVal !== null) {
            numbers.push({ value: numVal, position: i });
            numberPositions.push(i);
            console.log('🔢 Broj pronađen:', numVal);
            continue;
        }
        
        nameParts.push(originalW);
    }
    
    console.log('📊 Brojevi:', numbers);
    console.log('📊 Naziv delovi:', nameParts);
    
    // Postavljanje jedinice i skladišta
    if (foundUnit) result.unit = foundUnit;
    if (foundStorage) result.storage = foundStorage;
    
    // RASPOREDI BROJEVE
    if (numbers.length >= 1) {
        const isWeightUnit = WEIGHT_UNITS.includes(result.unit);
        
        if (isWeightUnit) {
            // TEŽINSKI PROIZVODI: piece = 0, quantity = broj
            result.piece = '0';
            result.quantity = numbers[0].value;
            console.log(`⚖️ Težinski: piece=0, quantity=${result.quantity}, unit=${result.unit}`);
        } else {
            // KOMADNI PROIZVODI: piece = broj, quantity = 1
            result.piece = numbers[0].value;
            result.quantity = '1';
            console.log(`📦 Komadni: piece=${result.piece}, quantity=${result.quantity}`);
        }
    }
    
    // IZVUCI NAZIV PROIZVODA
    let filteredWords = words.filter((w, index) => {
        let lower = w.toLowerCase();
        if (numberPositions.includes(index)) return false;
        if (getUnit(lower)) return false;
        if (getStorage(lower)) return false;
        if (skipWords.includes(lower)) return false;
        return true;
    });
    
    result.product_name = filteredWords.join(' ').trim() || 'Proizvod';
    
    // ROK TRAJANJA
    let meseciMatch = text.match(/(\d+)\s*meseci/);
    if (meseciMatch) {
        result.shelf_life = meseciMatch[1];
        console.log('🔍 Rok trajanja:', meseciMatch[1], 'meseci');
    }
    
    console.log('✅ KONAČNI REZULTAT:', result);
    return result;
}

// ============================================
// 3. PRIKAZIVANJE EKRANA
// ============================================

function sakrijSveEkrane() {
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
}

function ensureFormVisible() {
    console.log('🔍 ensureFormVisible POZVAN!');
    
    sakrijSveEkrane();
    
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
        console.log('✅ mainScreen prikazan');
    }
    
    const dataEntry = document.getElementById('dataEntryScreen');
    if (dataEntry) {
        dataEntry.style.display = 'block';
        dataEntry.classList.add('active');
        console.log('✅ dataEntryScreen prikazan');
    }
    
    setTimeout(() => {
        prikaziPoljaZaUnos();
    }, 100);
}

function prikaziPoljaZaUnos() {
    console.log('🔍 PRIKAZUJEM POLJA ZA UNOS...');
    
    const dataEntry = document.getElementById('dataEntryScreen');
    if (dataEntry) {
        dataEntry.style.display = 'block';
        dataEntry.style.visibility = 'visible';
        dataEntry.style.opacity = '1';
        dataEntry.classList.add('active');
    }
    
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.style.visibility = 'visible';
        mainScreen.style.opacity = '1';
        mainScreen.classList.add('active');
    }
    
    const polja = ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput'];
    polja.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'block';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
        }
    });
    
    const selects = ['unitSelect', 'storageSelect'];
    selects.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'block';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
        }
    });
}

function otvoriZaliheEkran() {
    console.log('📦 Otvaram ekran zaliha...');
    
    if (!ALLOW_INVENTORY_OPEN) {
        console.log('⛔ ZABRANJENO: samo "end" može otvoriti zalihe');
        showVoiceStatus('⛔ Samo "end" otvara zalihe', '#FF9800');
        return;
    }
    
    sakrijSveEkrane();
    
    const inv = document.getElementById('inventoryScreen') || document.querySelector('.inventory-screen');
    if (inv) {
        inv.style.setProperty('display', 'flex', 'important');
        inv.classList.add('active');
        
        try {
            if (typeof renderInventory === 'function') renderInventory();
            if (typeof loadInventory === 'function') loadInventory();
            if (typeof refreshInventoryData === 'function') refreshInventoryData();
            if (typeof renderProductList === 'function') renderProductList();
            if (typeof renderEntries === 'function') renderEntries();
        } catch(e) {
            console.warn('Greška pri renderovanju zaliha:', e);
        }
        showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
    } else {
        console.error('❌ Element inventoryScreen nije pronađen!');
    }
    
    ALLOW_INVENTORY_OPEN = false;
}

// ============================================
// 4. POPUNJAVANJE FORME
// ============================================

function popuniFormuPodacima(data) {
    console.log('📝 Popunjavam formu:', data);
    
    ensureFormVisible();
    
    setTimeout(() => {
        prikaziPoljaZaUnos();
        
        const productInput = document.getElementById('productInput');
        if (productInput) {
            productInput.value = data.product_name || '';
            productInput.dispatchEvent(new Event('input', { bubbles: true }));
            productInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ Naziv postavljen:', productInput.value);
        }
        
        const pieceInput = document.getElementById('pieceInput');
        if (pieceInput) {
            pieceInput.value = data.piece || '0';
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
        
        const unitSelect = document.getElementById('unitSelect');
        if (unitSelect && data.unit) {
            for (let option of unitSelect.options) {
                if (option.value === data.unit) {
                    option.selected = true;
                    unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }
        
        const storageSelect = document.getElementById('storageSelect');
        if (storageSelect && data.storage) {
            for (let option of storageSelect.options) {
                if (option.value === data.storage) {
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
        
    }, 200);
}

// ============================================
// 5. ČUVANJE PODATAKA
// ============================================

function sacuvajPodatke(data) {
    console.log('💾 Čuvam podatke:', data);
    
    ALLOW_INVENTORY_OPEN = false;
    END_AKTIVAN = false;
    
    isVoiceInput = true;
    window._isVoiceInput = true;
    
    const originalShowModernAlert = window.showModernAlert;
    const originalAlert = window.alert;
    
    window.showModernAlert = function() {
        console.log('⛔ POP-UP ZABRANJEN (voice input)');
        return;
    };
    
    window.alert = function() {
        console.log('⛔ ALERT ZABRANJEN (voice input)');
        return;
    };
    
    popuniFormuPodacima(data);
    
    setTimeout(() => {
        console.log('🔍 Pokušavam da sačuvam...');
        
        let saved = false;
        
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
            try {
                const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
                const newItem = {
                    id: Date.now(),
                    product_name: data.product_name,
                    piece: parseInt(data.piece) || 0,
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
                console.log('✅ Direktan upis u localStorage uspešan!');
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
            console.error('❌ Greška pri čuvanju!');
            showVoiceStatus('❌ Greška pri čuvanju!', '#f44336');
        }
        
        setTimeout(() => {
            isVoiceInput = false;
            window._isVoiceInput = false;
        }, 1000);
        
    }, 500);
}

function processAndSaveItem(command) {
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
    sacuvajPodatke(data);
    return true;
}

// ============================================
// 6. PREPOZNAVANJE GOVORA (GLAVNA FUNKCIJA)
// ============================================

function startVoiceRecognition() {
    console.log('🎤 Pokrećem glasovno prepoznavanje...');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showVoiceStatus('❌ Browser ne podržava prepoznavanje govora.', '#f44336');
        return;
    }

    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'sr-RS';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    isProcessingCommand = false;
    END_AKTIVAN = false;
    ALLOW_INVENTORY_OPEN = false;

    recognition.onstart = function() {
        console.log('🎤 MIKROFON AKTIVAN!');
        showVoiceStatus('🎤 Slušam... Recite "unos" pa podatke', '#2196F3');
        activeBuffer = '';
        isProcessingCommand = false;
    };

    recognition.onresult = function(event) {
        let interimText = '';
        let finalChunk = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.trim();
            if (event.results[i].isFinal) {
                finalChunk += (finalChunk ? ' ' : '') + transcript;
            } else {
                interimText += transcript;
            }
        }
        
        if (finalChunk) {
            activeBuffer += (activeBuffer ? ' ' : '') + finalChunk;
        }
        
        const fullText = activeBuffer + ' ' + interimText;
        const lowerFull = fullText.toLowerCase().trim();
        
        console.log('🎤 Celokupni tekst:', lowerFull);
        showVoiceStatus(`🎤: "${lowerFull}"`, '#FFD700');

        if (isProcessingCommand) return;

        // ============================================
        // KOMANDA: END - OTVARA ZALIHE
        // ============================================
        if (lowerFull.includes('end') || lowerFull.includes('and') || lowerFull.includes('kraj') || lowerFull.includes('gotovo')) {
            console.log('🏁 END DETEKTOVAN - otvaram zalihe!');
            isProcessingCommand = true;
            END_AKTIVAN = true;
            ALLOW_INVENTORY_OPEN = true;
            
            let itemText = activeBuffer
                .replace(/\bend\b/gi, '')
                .replace(/\band\b/gi, '')
                .replace(/\bkraj\b/gi, '')
                .replace(/\bgotovo\b/gi, '')
                .trim();
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }
            
            activeBuffer = '';
            
            setTimeout(() => {
                ALLOW_INVENTORY_OPEN = true;
                otvoriZaliheEkran();
                setTimeout(() => {
                    ALLOW_INVENTORY_OPEN = false;
                    END_AKTIVAN = false;
                }, 2000);
            }, 800);
            
            setTimeout(() => {
                isProcessingCommand = false;
            }, 1500);
            return;
        }

        // ============================================
        // KOMANDA: PLUS - ČUVA UNOS (NE OTVARA ZALIHE)
        // ============================================
        if (lowerFull.includes('plus')) {
            console.log('✅ PLUS DETEKTOVAN - čuvam unos (NE otvaram zalihe)');
            isProcessingCommand = true;
            
            ALLOW_INVENTORY_OPEN = false;
            END_AKTIVAN = false;
            
            let itemText = activeBuffer.replace(/\bplus\b/gi, '').trim();
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
                showVoiceStatus('✅ Sačuvano. Recite sledeći ili "end" za kraj.', '#4CAF50');
            } else {
                showVoiceStatus('⚠️ Prekratak unos, pokušajte ponovo', '#FF9800');
            }
            
            activeBuffer = '';
            
            setTimeout(() => {
                isProcessingCommand = false;
            }, 1500);
            return;
        }

        // ============================================
        // KOMANDA: UNOS - OTVARA FORMU
        // ============================================
        const dataEntryKeywords = ['unos', 'unesi', 'dodaj', 'novi', 'add'];
        if (dataEntryKeywords.some(k => lowerFull.includes(k))) {
            console.log('📝 UNOS DETEKTOVAN - otvaram formu');
            
            let itemText = activeBuffer;
            dataEntryKeywords.forEach(k => {
                itemText = itemText.replace(new RegExp('\\b' + k + '\\b', 'gi'), '');
            });
            itemText = itemText.trim();
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            } else {
                hideVoiceMenu();
                ensureFormVisible();
                showVoiceStatus('📝 Recite šta da unesete', '#2196F3');
            }
            
            activeBuffer = '';
            return;
        }
    };

    recognition.onerror = function(event) {
        if (event.error !== 'no-speech') {
            console.error('Speech error:', event.error);
            showVoiceStatus(`❌ Greška: ${event.error}`, '#f44336');
        }
        isProcessingCommand = false;
    };

    recognition.onend = function() {
        console.log('🎤 Glasovno prepoznavanje završeno.');
        isProcessingCommand = false;
        
        if (recognition) {
            try { recognition.start(); } catch(e) {}
        }
    };

    try {
        recognition.start();
        console.log('✅ Mikrofon pokrenut!');
    } catch(e) {
        console.error('Greška pri startovanju mikrofona:', e);
        showVoiceStatus('❌ Greška pri startovanju mikrofona', '#f44336');
    }
}

function stopVoiceRecognition() {
    if (recognition) {
        let ref = recognition;
        recognition = null;
        try { ref.stop(); } catch(e) {}
    }
    activeBuffer = '';
    isProcessingCommand = false;
    showVoiceStatus('⏸️ Prepoznavanje zaustavljeno', '#aaa');
}

function restartMicrophone() {
    console.log('🔄 Restartujem mikrofon...');
    stopVoiceRecognition();
    setTimeout(() => {
        startVoiceRecognition();
    }, 500);
}

// ============================================
// 7. MONITORING MIKROFONA
// ============================================

function startMicMonitoring() {
    if (micMonitoringInterval) {
        clearInterval(micMonitoringInterval);
    }
    
    micMonitoringInterval = setInterval(() => {
        if (!recognition && !isProcessingCommand) {
            console.log('🔇 Mikrofon nije aktivan - restartujem...');
            startVoiceRecognition();
        } else if (recognition && !activeBuffer && !isProcessingCommand) {
            console.log('⏰ Nema aktivnosti, restartujem mikrofon...');
            restartMicrophone();
        }
    }, 30000);
}

function stopMicMonitoring() {
    if (micMonitoringInterval) {
        clearInterval(micMonitoringInterval);
        micMonitoringInterval = null;
    }
}

// ============================================
// 8. POMOĆNE FUNKCIJE ZA KORISNIKE
// ============================================

function prikaziTrenutnePodatke() {
    if (lastSavedData) {
        console.log('📊 Trenutni podaci:', lastSavedData);
        showVoiceStatus(`📊 ${lastSavedData.product_name} (${lastSavedData.quantity} ${lastSavedData.unit})`, '#4CAF50');
    } else {
        showVoiceStatus('📊 Nema sačuvanih podataka', '#FF9800');
    }
}

function ocistiFormu() {
    const polja = ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput'];
    polja.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = '';
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    const selects = ['unitSelect', 'storageSelect'];
    selects.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.options.length > 0) {
            el.selectedIndex = 0;
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    console.log('🧹 Forma očišćena');
}

function goBackFromVoice() {
    console.log('◀ goBackFromVoice POZVAN!');
    stopVoiceRecognition();
    stopMicMonitoring();
    
    sakrijSveEkrane();
    
    const choiceScreen = document.getElementById('choiceScreen');
    if (choiceScreen) {
        choiceScreen.style.display = 'flex';
        choiceScreen.classList.add('active');
    }
    
    if (typeof updateHeaderLanguage === 'function') updateHeaderLanguage();
    if (typeof updateInterfaceLanguage === 'function') updateInterfaceLanguage();
}

function selectVoiceMode() {
    console.log('🎤 selectVoiceMode POZVAN!');
    
    sakrijSveEkrane();
    
    const voiceMenuScreen = document.getElementById('voiceMenuScreen');
    if (voiceMenuScreen) {
        voiceMenuScreen.style.display = 'flex';
        voiceMenuScreen.classList.add('active');
        console.log('✅ Voice menu prikazan');
    }
    
    setTimeout(() => {
        startVoiceRecognition();
        startMicMonitoring();
    }, 500);
}

// ============================================
// 9. GLOBALNE METODE
// ============================================

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.restartMicrophone = restartMicrophone;
window.startMicMonitoring = startMicMonitoring;
window.stopMicMonitoring = stopMicMonitoring;

window.otvoriZaliheEkran = otvoriZaliheEkran;
window.sacuvajPodatke = sacuvajPodatke;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.processAndSaveItem = processAndSaveItem;

window.popuniFormuPodacima = popuniFormuPodacima;
window.ensureFormVisible = ensureFormVisible;
window.prikaziTrenutnePodatke = prikaziTrenutnePodatke;
window.ocistiFormu = ocistiFormu;
window.goBackFromVoice = goBackFromVoice;
window.selectVoiceMode = selectVoiceMode;
window.hideVoiceMenu = hideVoiceMenu;

// ============================================
// 10. ZAŠTITA OD NEOVLAŠĆENOG OTVARANJA ZALIHA
// ============================================

(function() {
    console.log('🛡️ BLOKIRAM OTVARANJE ZALIHA IZ VOICE KOMANDI (osim "end")');
    
    const originalRenderInventory = window.renderInventory;
    const originalShowScreen = window.showScreen;
    
    window.renderInventory = function() {
        const stack = new Error().stack || '';
        const blocked = ['sacuvajPodatke', 'processAndSaveItem', 'processVoiceCommand', 'saveProduct'];
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
        
        if (blocked.some(fn => stack.includes(fn)) && screenId === 'inventoryScreen') {
            console.log('⛔ BLOKIRANO: showScreen(' + screenId + ') iz voice komande');
            return;
        }
        
        if (typeof originalShowScreen === 'function') {
            return originalShowScreen.apply(this, arguments);
        }
    };
    
    console.log('✅ Zaštita aktivna!');
    console.log('📝 Kako koristiti:');
    console.log('   1. Kažite: "unos 2 kilograma jabuka" (otvara formu)');
    console.log('   2. Kažite: "plus" (čuva, ne otvara zalihe)');
    console.log('   3. Kažite: "end" (čuva i otvara zalihe)');
    console.log('📊 Rezultat:');
    console.log('   "2 kg jabuka" → piece:0, quantity:2, unit:kg');
    console.log('   "3 paketa testenine" → piece:3, quantity:1, unit:pak');
})();

console.log('✅ VoiceCommands.js OBJEDINJENA VERZIJA USPEŠNO UČITANA!');
console.log('🔄 Monitoring mikrofona aktivan - restartuje se svakih 30 sekundi');
