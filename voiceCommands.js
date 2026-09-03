// ============================================
// VOICE COMMANDS - KONAČNA VERZIJA v2.0
// SA DODATKOM ZA TRAJAN PRIKAZ PODATAKA
// ============================================

let activeBuffer = ''; 
let lastSavedData = null;
let isProcessingCommand = false;
let END_AKTIVAN = false;
let isVoiceInput = false;
let ALLOW_INVENTORY_OPEN = false;
let micRestartTimer = null;

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
// 🔥 PROVERA I TRAŽENJE DOZVOLE ZA MIKROFON
// ============================================

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
        .replace(/\bGreen\b/gi, 'grill')
        .replace(/\bgreen\b/gi, 'grill')
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
    let nameParts = [];
    let skipWords = ['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima', 'i'];
    
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
    
    if (text.includes('zamrzivač') && !text.includes('zamrzivač 2') && !text.includes('zamrzivač 3')) {
        if (!foundStorage || foundStorage === 'Zamrzivač 1') {
            foundStorage = 'Zamrzivač 1';
            console.log('🏠 Podrazumevani zamrzivač: Zamrzivač 1');
        }
    }
    
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
            console.log('🔢 Broj pronađen:', numVal);
            continue;
        }
        
        nameParts.push(originalW);
    }
    
    console.log('📊 Brojevi:', numbers);
    console.log('📊 Naziv delovi:', nameParts);
    
    if (foundUnit === 'kg' || foundUnit === 'g') {
        if (numbers.length >= 2) {
            result.piece = numbers[0];
            result.quantity = numbers[1];
            console.log('📦 kg/g: komad=' + numbers[0] + ', količina=' + numbers[1] + 'kg');
        } else if (numbers.length === 1) {
            result.piece = '0';
            result.quantity = numbers[0];
            console.log('📦 kg/g: komad=0, količina=' + numbers[0] + 'kg');
        }
    } else if (foundUnit === 'l') {
        if (numbers.length >= 2) {
            result.piece = numbers[0];
            result.quantity = numbers[1];
            console.log('📦 l: komad=' + numbers[0] + ', količina=' + numbers[1] + 'l');
        } else if (numbers.length === 1) {
            result.piece = '0';
            result.quantity = numbers[0];
            console.log('📦 l: komad=0, količina=' + numbers[0] + 'l');
        }
    } else {
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
    
    let rokPronadjen = false;
    
    let meseciMatch = text.match(/(\d+)\s*meseci/);
    if (meseciMatch) {
        result.shelf_life = meseciMatch[1];
        rokPronadjen = true;
        console.log('🔍 Pronađeno "' + meseciMatch[1] + ' meseci" -> rok = ' + meseciMatch[1]);
    }
    
    if (!rokPronadjen && numbers.length >= 3) {
        result.shelf_life = numbers[2];
        rokPronadjen = true;
        console.log('🔍 Treći broj -> rok =', numbers[2]);
    }
    
    let cleanNameParts = nameParts.filter(part => {
        return !/^\d+$/.test(part);
    });
    result.product_name = cleanNameParts.join(' ').trim() || 'Proizvod';
    
    if (foundUnit) {
        result.unit = foundUnit;
        console.log('✅ Jedinica postavljena na:', foundUnit);
    } else {
        result.unit = 'kom';
        console.log('⚠️ Nema jedinice, ostavljam: kom');
    }
    
    if (foundStorage) {
        result.storage = foundStorage;
        console.log('✅ Skladište postavljeno na:', foundStorage);
    } else {
        result.storage = 'Zamrzivač 1';
        console.log('⚠️ Nema skladišta, ostavljam: Zamrzivač 1');
    }
    
    let gramMatches = text.match(/\b(500|700|800|900|1000)\b/);
    if (gramMatches && (text.includes('gram') || text.includes('grama'))) {
        result.unit = 'g';
        result.quantity = gramMatches[1];
        if (result.piece === '1' || result.piece === '0') {
            result.piece = '0';
        }
        console.log('🔍 Grami detektovani -> jedinica = g, količina = ' + gramMatches[1]);
    }
    
    console.log('✅ PARSIRANO:', result);
    return result;
}

// ============================================
// 5. OSIGURAJ DA JE FORMA VIDLJIVA PRE POPUNJAVANJA
// ============================================

function ensureFormVisible() {
    console.log('🔍 ensureFormVisible POZVAN!');
    
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
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
    } else {
        console.warn('⚠️ dataEntryScreen nije pronađen!');
        const form = document.querySelector('form');
        if (form) {
            form.style.display = 'block';
            console.log('✅ Forma prikazana direktno');
        }
    }
    
    setTimeout(() => {
        prikaziPoljaZaUnos();
    }, 100);
    
    console.log('✅ Forma prikazana');
}

// ============================================
// 5.1 DIREKTNO PRIKAZIVANJE POLJA
// ============================================

function prikaziPoljaZaUnos() {
    console.log('🔍 PRIKAZUJEM POLJA ZA UNOS...');
    
    const dataEntry = document.getElementById('dataEntryScreen');
    if (dataEntry) {
        dataEntry.style.display = 'block';
        dataEntry.style.visibility = 'visible';
        dataEntry.style.opacity = '1';
        dataEntry.classList.add('active');
        console.log('✅ dataEntryScreen prikazan');
    } else {
        console.warn('⚠️ dataEntryScreen nije pronađen!');
    }
    
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.style.visibility = 'visible';
        mainScreen.style.opacity = '1';
        mainScreen.classList.add('active');
        console.log('✅ mainScreen prikazan');
    }
    
    const polja = ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput'];
    polja.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'block';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
            console.log(`✅ Polje ${id} prikazano`);
        } else {
            console.warn(`⚠️ Polje ${id} nije pronađeno!`);
        }
    });
    
    const selects = ['unitSelect', 'storageSelect'];
    selects.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'block';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
            console.log(`✅ Select ${id} prikazan`);
        }
    });
    
    console.log('✅ Sva polja za unos su prikazana!');
}

// ============================================
// 6. POPUNJAVANJE FORME
// ============================================

function popuniFormuPodacima(data) {
    console.log('📝 Popunjavam formu:', data);
    
    ensureFormVisible();
    
    setTimeout(() => {
        prikaziPoljaZaUnos();
        
        const productInput = document.getElementById('productInput');
        if (!productInput) {
            console.warn('⚠️ productInput nije pronađen!');
            const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
            console.log('🔍 Pronađeni inputi:', inputs);
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
        
        const unitSelect = document.getElementById('unitSelect');
        if (unitSelect && data.unit) {
            let found = false;
            for (let option of unitSelect.options) {
                if (option.value === data.unit) {
                    option.selected = true;
                    found = true;
                    break;
                }
            }
            if (!found) {
                for (let option of unitSelect.options) {
                    const optText = option.text.toLowerCase().trim();
                    const unitText = data.unit.toLowerCase().trim();
                    if (optText === unitText || optText.includes(unitText) || unitText.includes(optText)) {
                        option.selected = true;
                        found = true;
                        break;
                    }
                }
            }
            if (found) {
                unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('✅ Jedinica postavljena na:', unitSelect.value);
            } else {
                console.warn('⚠️ Jedinica nije pronađena:', data.unit);
                unitSelect.selectedIndex = 0;
                unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        
        const storageSelect = document.getElementById('storageSelect');
        if (storageSelect && data.storage) {
            let found = false;
            for (let option of storageSelect.options) {
                if (option.value === data.storage || 
                    option.text.toLowerCase().trim() === data.storage.toLowerCase().trim() ||
                    option.text.toLowerCase().includes(data.storage.toLowerCase())) {
                    option.selected = true;
                    found = true;
                    storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log('✅ Skladište postavljeno na:', storageSelect.value);
                    break;
                }
            }
            if (!found) {
                storageSelect.selectedIndex = 0;
                storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        
        if (typeof updateExpiryDate === 'function') {
            try { updateExpiryDate(); } catch(e) {}
        }
        
        showVoiceStatus(`✅ Uneto: ${data.product_name} (${data.quantity} ${data.unit})`, '#4CAF50');
        
        setTimeout(() => {
            if (productInput) {
                productInput.value = data.product_name || '';
                productInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (quantityInput) {
                quantityInput.value = data.quantity || '1';
                quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            console.log('🔄 Ponovno postavljanje vrednosti izvršeno');
            prikaziPoljaZaUnos();
        }, 100);
        
    }, 200);
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
    
    popuniFormuPodacima(data);
    
    setTimeout(() => {
        console.log('🔍 Pokušavam da sačuvam preko saveProduct()...');
        
        if (typeof saveProduct === 'function') {
            try { 
                saveProduct(); 
                saved = true; 
                console.log('✅ saveProduct uspešan!'); 
            } catch(e) {
                console.warn('saveProduct greška:', e);
            }
        } else {
            console.warn('⚠️ saveProduct nije definisan!');
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
                    try { 
                        prikaziSveUnose(); 
                        console.log('✅ Pregled unosa osvežen');
                    } catch(e) {
                        console.warn('prikaziSveUnose greška:', e);
                    }
                }
                console.log('✅ Podaci osveženi');
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
    
    return saved;
}

// ============================================
// 8. OBRADA I ČUVANJE
// ============================================

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
// 9. OTVARANJE ZALIHA
// ============================================

function otvoriZaliheEkran() {
    console.log('📦 Otvaram ekran zaliha... (ALLOW_INVENTORY_OPEN=' + ALLOW_INVENTORY_OPEN + ')');
    
    if (!ALLOW_INVENTORY_OPEN) {
        console.log('⛔ ZABRANJENO: samo "end" može otvoriti zalihe');
        showVoiceStatus('⛔ Samo "end" otvara zalihe', '#FF9800');
        return;
    }
    
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
        
        ALLOW_INVENTORY_OPEN = false;
    }, 300);
}

// ============================================
// 10. START VOICE RECOGNITION
// ============================================

function startVoiceRecognition() {
    console.log('🎤 startVoiceRecognition POZVAN!');
    
    // 🔥 PROVERI DA LI JE DOZVOLA DATA - AKO NIJE, BROWSER ĆE TRAŽITI
    if (window.isVoiceModeActive) {
        console.log('✅ Voice mode aktivan, pokrećem Speech Recognition...');
    }
    
    // 🔥 AKO VEĆ POSTOJI RECOGNITION, ZAUSTAVI GA
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showVoiceStatus('❌ Browser ne podržava glasovno prepoznavanje.', '#f44336');
        return;
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
        showVoiceStatus('🎤 Slušam... Recite "start" pa podatke', '#4CAF50');
        activeBuffer = '';
        isProcessingCommand = false;
        END_AKTIVAN = false;
        ALLOW_INVENTORY_OPEN = false;
        window.isVoiceModeActive = true;
        // 🔥 SAKRUJ STATUS KADA MIKROFON PRORADI
        const voiceStatus = document.getElementById('voiceStatus');
        if (voiceStatus) {
            voiceStatus.innerHTML = '🎤 Slušam... Recite "start" pa podatke';
            voiceStatus.style.color = '#4CAF50';
        }
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
        
        if (lowerFull.includes('exit') || lowerFull.includes('izlaz')) {
            console.log('🚪 IZLAZ');
            isProcessingCommand = true;
            stopVoiceRecognition();
            if (typeof window.exitApp === 'function') {
                window.exitApp();
            }
            activeBuffer = '';
            return;
        }
        
        if (lowerFull.includes('nazad') || lowerFull.includes('back')) {
            console.log('⬅️ NAZAD');
            isProcessingCommand = true;
            goBackFromVoice();
            activeBuffer = '';
            return;
        }
        
        if (lowerFull.includes('spisak') || lowerFull.includes('potrebe') || lowerFull.includes('shopping')) {
            console.log('🛒 SPISAK');
            isProcessingCommand = true;
            if (typeof window.renderShoppingList === 'function') {
                window.renderShoppingList();
            }
            activeBuffer = '';
            return;
        }
        
        if ((lowerFull.includes('zalihe') || lowerFull.includes('stanje') || lowerFull.includes('inventory')) && !lowerFull.includes('end')) {
            console.log('📦 ZALIHE (direktno)');
            isProcessingCommand = true;
            setTimeout(() => {
                if (typeof window.renderInventory === 'function') {
                    window.renderInventory();
                }
            }, 300);
            activeBuffer = '';
            return;
        }
        
        if (lowerFull.includes('end') || lowerFull.includes(' and ') || lowerFull.includes('kraj') || lowerFull.includes('završi')) {
            console.log('🏁 END DETEKTOVAN - otvaram zalihe!');
            isProcessingCommand = true;
            END_AKTIVAN = true;
            ALLOW_INVENTORY_OPEN = true;
            
            let itemText = activeBuffer;
            let parts = itemText.split(/\bend\b/i);
            if (parts.length === 1) {
                parts = itemText.split(/\band\b/i);
            }
            if (parts.length === 1) {
                parts = itemText.split(/\bkraj\b/i);
            }
            if (parts.length === 1) {
                parts = itemText.split(/\bzavrši\b/i);
            }
            itemText = parts[0].trim();
            
            if (itemText.length > 2 && !itemText.toLowerCase().includes('and')) {
                processAndSaveItem(itemText);
            } else if (itemText.length > 2 && itemText.toLowerCase().includes('and')) {
                itemText = itemText.replace(/\band\b/i, '').trim();
                if (itemText.length > 2) {
                    processAndSaveItem(itemText);
                }
            }
            
            activeBuffer = '';
            
            setTimeout(() => {
                stopVoiceRecognition();
                setTimeout(() => {
                    if (typeof prikaziSveUnose === 'function') {
                        try { prikaziSveUnose(); } catch(e) {}
                    }
                    ALLOW_INVENTORY_OPEN = true;
                    otvoriZaliheEkran();
                    setTimeout(() => {
                        ALLOW_INVENTORY_OPEN = false;
                        END_AKTIVAN = false;
                        setTimeout(() => {
                            console.log('🔄 Restartujem mikrofon nakon "end"');
                            startVoiceRecognition();
                        }, 2000);
                    }, 2000);
                }, 500);
            }, 800);
            
            return;
        }
        
        if (lowerFull.includes('plus')) {
            console.log('✅ PLUS DETEKTOVAN - završavam unos (NE otvaram zalihe)');
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
                console.log('✅ Pregled osvežen nakon plus');
            }, 200);
            
            setTimeout(() => {
                if (!recognition) {
                    console.log('🔄 Mikrofon nije aktivan, restartujem nakon "plus"...');
                    startVoiceRecognition();
                } else {
                    console.log('✅ Mikrofon je i dalje aktivan nakon "plus"');
                    try {
                        recognition.stop();
                        setTimeout(() => {
                            recognition.start();
                            console.log('🔄 Veza mikrofona osvežena nakon "plus"');
                        }, 300);
                    } catch(e) {
                        console.warn('Greška pri osvežavanju veze:', e);
                        startVoiceRecognition();
                    }
                }
            }, 1500);
            
            setTimeout(() => {
                isProcessingCommand = false;
            }, 500);
            
            return;
        }
        
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
            
            setTimeout(() => {
                if (!recognition) {
                    console.log('🔄 Restartujem mikrofon nakon "unos"');
                    startVoiceRecognition();
                }
            }, 5000);
        }
        
        if (micRestartTimer) {
            clearTimeout(micRestartTimer);
        }
        micRestartTimer = setTimeout(() => {
            if (!isProcessingCommand && activeBuffer.length === 0) {
                console.log('⏰ Nema aktivnosti 10 sekundi, restartujem mikrofon...');
                restartMicrophone();
            }
        }, 10000);
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
        if (window.isVoiceModeActive) {
            console.log('🔄 Voice mode je aktivan, restartujem mikrofon...');
            setTimeout(function() {
                if (recognition === null) {
                    startVoiceRecognition();
                }
            }, 500);
        }
    };

    try {
        recognition.start();
        console.log('✅ Mikrofon pokrenut!');
        showVoiceStatus('🎤 Slušam...', '#2196F3');
        window.isVoiceModeActive = true;
    } catch(e) {
        console.error('❌ Greška pri pokretanju:', e);
        showVoiceStatus('❌ Greška pri pokretanju mikrofona', '#f44336');
    }
}

// ============================================
// 11. ZAUSTAVI PREPOZNAVANJE
// ============================================

function stopVoiceRecognition() {
    console.log('🛑 stopVoiceRecognition POZVAN!');
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
    console.log('◀ goBackFromVoice POZVAN - vraćam na JEZIKE!');
    
    // 🔥 NE GASI MIKROFON - OSTAVI GA AKTIVNIM
    // stopVoiceRecognition();  // ← UKLONJENO
    
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    const languageScreen = document.getElementById('languageScreen');
    if (languageScreen) {
        languageScreen.style.display = 'flex';
        languageScreen.classList.add('active');
        console.log('✅ languageScreen prikazan');
    } else {
        console.warn('⚠️ languageScreen nije pronađen!');
        const choiceScreen = document.getElementById('choiceScreen');
        if (choiceScreen) {
            choiceScreen.style.display = 'flex';
            choiceScreen.classList.add('active');
        }
    }
    
    if (typeof updateHeaderLanguage === 'function') {
        updateHeaderLanguage();
    }
    if (typeof updateInterfaceLanguage === 'function') {
        updateInterfaceLanguage();
    }
    
    console.log('🎤 Mikrofon ostaje aktivan!');
}

// ============================================
// 14. SELEKTOVANJE VOICE MODE
// ============================================

function selectVoiceMode() {
    console.log('🎤 Izabran zvučni unos');
    
    showVoiceStatus('🎤 Tražim dozvolu za mikrofon...', '#FFD700');
    
    // 🔥 PRVO TRAŽI DOZVOLU DIREKTNO
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                stream.getTracks().forEach(track => track.stop());
                console.log('✅ Dozvola ODOBRENA');
                
                const choiceScreen = document.getElementById('choiceScreen');
                const voiceScreen = document.getElementById('voiceMenuScreen');
                
                if (choiceScreen) {
                    choiceScreen.style.display = 'none';
                    choiceScreen.classList.remove('active');
                }
                if (voiceScreen) {
                    voiceScreen.style.display = 'flex';
                    voiceScreen.classList.add('active');
                }
                
                currentScreen = 'voiceMenuScreen';
                currentScreenState = 'voiceMenuScreen';
                screenHistory.push('choiceScreen');
                window.isVoiceModeActive = true;
                
                setTimeout(function() {
                    if (typeof startVoiceRecognition === 'function') {
                        startVoiceRecognition();
                    }
                }, 500);
            })
            .catch(function(err) {
                console.error('❌ Dozvola ODBIJENA:', err);
                showVoiceStatus('❌ Dozvolite mikrofon!', '#f44336');
                
                const voiceStatus = document.getElementById('voiceStatus');
                if (voiceStatus) {
                    voiceStatus.innerHTML = `
                        ❌ Dozvolite mikrofon u podešavanjima!
                        <br><br>
                        <button onclick="selectVoiceMode()" style="
                            padding:12px 30px;
                            background:#4CAF50;
                            color:white;
                            border:none;
                            border-radius:12px;
                            font-size:18px;
                            cursor:pointer;
                            font-weight:bold;
                        ">
                            🔄 Pokušaj ponovo
                        </button>
                    `;
                }
            });
    } else {
        showVoiceStatus('❌ Browser ne podržava mikrofon.', '#f44336');
    }
}
// ============================================
// 15. DODATNE FUNKCIJE ZA PRIKAZ I BRISANJE
// ============================================

function prikaziTrenutnePodatke() {
    if (lastSavedData) {
        console.log('📊 Trenutni podaci:', lastSavedData);
        showVoiceStatus(`📊 Trenutno: ${lastSavedData.product_name} (${lastSavedData.quantity} ${lastSavedData.unit})`, '#4CAF50');
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
            el.dispatchEvent(new Event('change', { bubbles: true }));
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

// ============================================
// 16. PREUZIMANJE KONTROLE
// ============================================

window._voiceCommandsStart = startVoiceRecognition;
window._voiceCommandsStop = stopVoiceRecognition;
window._voiceCommandsProcess = processAndSaveItem;
window._voiceCommandsParse = parseVoiceDataEntry;
window._voiceCommandsOpenZalihe = otvoriZaliheEkran;
window.requestMicrophonePermission = requestMicrophonePermission;

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
    
    if (lower.includes('end')) {
        console.log('🏁 END - otvaram zalihe');
        const itemText = command.replace(/end/i, '').trim();
        if (itemText && typeof window._voiceCommandsProcess === 'function') {
            window._voiceCommandsProcess(itemText);
        }
        setTimeout(() => {
            if (typeof window._voiceCommandsOpenZalihe === 'function') {
                ALLOW_INVENTORY_OPEN = true;
                window._voiceCommandsOpenZalihe();
                setTimeout(() => {
                    ALLOW_INVENTORY_OPEN = false;
                }, 1000);
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
window.prikaziTrenutnePodatke = prikaziTrenutnePodatke;
window.ocistiFormu = ocistiFormu;

// ============================================
// 17. ZABRANA OTVARANJA ZALIHA IZ VOICE KOMANDI
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
// 18. DEBUG FUNKCIJA
// ============================================

function debugFormVisibility() {
    console.log('🔍 DEBUG FORME:');
    const dataEntry = document.getElementById('dataEntryScreen');
    console.log('dataEntryScreen:', dataEntry);
    if (dataEntry) {
        console.log('  display:', dataEntry.style.display);
        console.log('  className:', dataEntry.className);
        console.log('  offsetParent:', dataEntry.offsetParent ? 'vidljiv' : 'sakriven');
    }
    const productInput = document.getElementById('productInput');
    if (productInput) {
        console.log('productInput value:', productInput.value);
        console.log('productInput display:', productInput.style.display);
        console.log('productInput offsetParent:', productInput.offsetParent ? 'vidljiv' : 'sakriven');
    }
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        console.log('mainScreen display:', mainScreen.style.display);
    }
    
    const allInputs = document.querySelectorAll('input');
    console.log('📋 Svi inputi na stranici:');
    allInputs.forEach(inp => {
        console.log(`  ${inp.id || 'nema-id'}: value="${inp.value}", display=${inp.style.display}`);
    });
}

window.debugFormVisibility = debugFormVisibility;

// ============================================
// 19. POPRAVKA - ZADRŽAVANJE PODATAKA U FORMI
// ============================================

const originalSaveProduct = window.saveProduct;

window.saveProduct = function() {
    console.log('🛡️ saveProduct pozvan - čuvam podatke ali NE resetujem formu');
    
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const unitSelect = document.getElementById('unitSelect');
    const storageSelect = document.getElementById('storageSelect');
    
    const savedValues = {
        product: productInput ? productInput.value : '',
        piece: pieceInput ? pieceInput.value : '1',
        quantity: quantityInput ? quantityInput.value : '1',
        shelf_life: shelfLifeInput ? shelfLifeInput.value : '12',
        unit: unitSelect ? unitSelect.value : 'kom',
        storage: storageSelect ? storageSelect.value : 'Zamrzivač 1'
    };
    
    console.log('💾 Sačuvane vrednosti pre čuvanja:', savedValues);
    
    if (typeof originalSaveProduct === 'function') {
        try {
            originalSaveProduct();
            console.log('✅ originalSaveProduct uspešan');
        } catch(e) {
            console.warn('originalSaveProduct greška:', e);
        }
    }
    
    setTimeout(() => {
        console.log('🔄 Vraćam vrednosti u formu...');
        
        if (productInput) {
            productInput.value = savedValues.product;
            productInput.dispatchEvent(new Event('input', { bubbles: true }));
            productInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ Naziv vraćen:', savedValues.product);
        }
        
        if (pieceInput) {
            pieceInput.value = savedValues.piece;
            pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
            pieceInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        if (quantityInput) {
            quantityInput.value = savedValues.quantity;
            quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
            quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        if (shelfLifeInput) {
            shelfLifeInput.value = savedValues.shelf_life;
            shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
            shelfLifeInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        if (unitSelect) {
            for (let option of unitSelect.options) {
                if (option.value === savedValues.unit) {
                    option.selected = true;
                    unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }
        
        if (storageSelect) {
            for (let option of storageSelect.options) {
                if (option.value === savedValues.storage) {
                    option.selected = true;
                    storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }
        
        prikaziPoljaZaUnos();
        console.log('✅ Vrednosti vraćene u formu!');
    }, 100);
};

console.log('🛡️ saveProduct override aktivan - podaci ostaju u formi!');

// ============================================
// 20. AUTOMATSKI RESTART MIKROFONA
// ============================================

let micActive = false;

function monitorMicStatus() {
    if (recognition) {
        micActive = true;
        console.log('🎤 Mikrofon je aktivan');
    } else {
        micActive = false;
        console.log('🔇 Mikrofon nije aktivan');
    }
    return micActive;
}

function autoRestartMic() {
    console.log('🔄 Provera mikrofona...');
    
    if (!recognition || !micActive) {
        console.log('🔇 Mikrofon nije aktivan - pokrećem restart...');
        restartMicrophone();
        return;
    }
    
    try {
        if (!activeBuffer && !isProcessingCommand) {
            console.log('⏰ Nema aktivnosti, restartujem mikrofon...');
            restartMicrophone();
        }
    } catch(e) {
        console.warn('Greška pri proveri:', e);
    }
}

function startMicMonitoring() {
    if (micRestartTimer) {
        clearInterval(micRestartTimer);
    }
    
    micRestartTimer = setInterval(() => {
        autoRestartMic();
    }, 30000);
}

function stopMicMonitoring() {
    if (micRestartTimer) {
        clearInterval(micRestartTimer);
        micRestartTimer = null;
    }
}

const originalStartVoice = startVoiceRecognition;
startVoiceRecognition = function() {
    console.log('🎤 startVoiceRecognition (sa monitoringom)');
    stopMicMonitoring();
    originalStartVoice();
    setTimeout(() => {
        startMicMonitoring();
        console.log('✅ Monitoring mikrofona pokrenut');
    }, 1000);
};

const originalStopVoice = stopVoiceRecognition;
stopVoiceRecognition = function() {
    console.log('🛑 stopVoiceRecognition (sa monitoringom)');
    stopMicMonitoring();
    originalStopVoice();
};

window.startMicMonitoring = startMicMonitoring;
window.stopMicMonitoring = stopMicMonitoring;
window.autoRestartMic = autoRestartMic;
window.monitorMicStatus = monitorMicStatus;

console.log('🔄 Monitoring mikrofona aktiviran - restartuje se svakih 30 sekundi');
console.log('🔄 Funkcije: popuniFormuPodacima(), ensureFormVisible(), prikaziTrenutnePodatke(), ocistiFormu()');

// ============================================
// 21. DODATAK ZA ISTICANJE NOVIH PROIZVODA
// ============================================

function saveLastAddedProducts(product) {
    try {
        let lastAdded = JSON.parse(localStorage.getItem('lastAddedProducts') || '[]');
        lastAdded.unshift({
            product_name: product.product_name,
            entry_date: product.entry_date || new Date().toISOString().split('T')[0],
            timestamp: Date.now()
        });
        if (lastAdded.length > 10) {
            lastAdded = lastAdded.slice(0, 10);
        }
        localStorage.setItem('lastAddedProducts', JSON.stringify(lastAdded));
        console.log('💾 Sačuvani poslednji proizvodi:', lastAdded);
    } catch (error) {
        console.error('❌ Greška:', error);
    }
}

const originalSacuvajPodatke = sacuvajPodatke;

sacuvajPodatke = function(data) {
    console.log('💾 Čuvam podatke (sa lastAddedProducts):', data);
    
    if (data && data.product_name) {
        saveLastAddedProducts(data);
    }
    
    return originalSacuvajPodatke.call(this, data);
};

window.saveLastAddedProducts = saveLastAddedProducts;

console.log('✅ Dodatak za isticanje novih proizvoda aktiviran!');

// ============================================
// KRAJ FAJLA
// ============================================
