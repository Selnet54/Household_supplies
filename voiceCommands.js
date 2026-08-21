// ============================================
// VOICE COMMANDS - OPTIMIZOVANA VERZIJA
// ============================================

// ============================================
// 0. GLOBALNE PROMENLJIVE
// ============================================

let activeBuffer = ''; 
let recognition = null;
let lastSavedData = null;
let isProcessingCommand = false;
let END_AKTIVAN = false;
let isVoiceInput = false;
let ALLOW_INVENTORY_OPEN = false;
let micRestartTimer = null;
let micActive = false;
let keepAliveTimer = null;

// ⭐ DETEKCIJA MOBILNOG - JEDNOM
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile/i.test(navigator.userAgent);
console.log(`📱 Mobilni uređaj: ${isMobile ? 'DA' : 'NE'}`);

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
    'pet': '5', 'šest': '6', 'sest': '6', 'sedam': '7', 'osam': '8',
    'devet': '9', 'deset': '10', 'jedanaest': '11', 'dvanaest': '12',
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
// 4. PARSIRANJE (OPTIMIZOVANO)
// ============================================

function parseVoiceDataEntry(command) {
    if (!command || command.length < 2) return null;
    
    console.log('🔍 PARSIRAM:', command);
    
    let text = command
        .replace(/^unos\s*/i, '')
        .replace(/^start\s*/i, '')
        .replace(/^grile\s*/i, 'grill')
        .replace(/^gril\s*/i, 'grill')
        .replace(/\bGreen\b/gi, 'grill')
        .replace(/\bgreen\b/gi, 'grill')
        .trim();
    
    if (!text) return null;
    
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return null;
    
    const result = {
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
    const numbers = [];
    const nameParts = [];
    const skipWords = new Set(['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima', 'i']);
    
    // Pronađi jedinicu i skladište
    for (let i = 0; i < words.length; i++) {
        const w = words[i].toLowerCase();
        
        const storageMatch = getStorage(w);
        if (storageMatch) {
            foundStorage = storageMatch;
            storageIndex = i;
        }
        
        const unitMatch = getUnit(w);
        if (unitMatch) {
            foundUnit = unitMatch;
            unitIndex = i;
        }
    }
    
    // Podrazumevani zamrzivač
    if (text.includes('zamrzivač') && !text.includes('zamrzivač 2') && !text.includes('zamrzivač 3')) {
        if (!foundStorage || foundStorage === 'Zamrzivač 1') {
            foundStorage = 'Zamrzivač 1';
        }
    }
    
    // Specijalni slučajevi za jedinice
    if (text.includes('gram') || text.includes('grama')) {
        foundUnit = 'g';
    } else if (text.includes('kilogram') || text.includes('kg')) {
        foundUnit = 'kg';
    } else if (text.includes('litar') || text.includes('litara')) {
        foundUnit = 'l';
    }
    
    // Izvuci brojeve i naziv
    for (let i = 0; i < words.length; i++) {
        const w = words[i].toLowerCase();
        const originalW = words[i];
        
        if (i === storageIndex || i === unitIndex) continue;
        if (skipWords.has(w)) continue;
        
        const numVal = getNumber(w);
        if (numVal !== null) {
            numbers.push(numVal);
        } else {
            nameParts.push(originalW);
        }
    }
    
    // Dodela brojeva
    if (foundUnit === 'kg' || foundUnit === 'g' || foundUnit === 'l') {
        if (numbers.length >= 2) {
            result.piece = numbers[0];
            result.quantity = numbers[1];
        } else if (numbers.length === 1) {
            result.piece = '0';
            result.quantity = numbers[0];
        }
    } else {
        if (numbers.length >= 2) {
            result.piece = numbers[0];
            result.quantity = numbers[1];
        } else if (numbers.length === 1) {
            result.piece = numbers[0];
            result.quantity = numbers[0];
        }
    }
    
    // Rok trajanja
    const meseciMatch = text.match(/(\d+)\s*meseci/);
    if (meseciMatch) {
        result.shelf_life = meseciMatch[1];
    } else if (numbers.length >= 3) {
        result.shelf_life = numbers[2];
    }
    
    // Naziv proizvoda
    const cleanNameParts = nameParts.filter(part => !/^\d+$/.test(part));
    result.product_name = cleanNameParts.join(' ').trim() || 'Proizvod';
    
    // Jedinica i skladište
    result.unit = foundUnit || 'kom';
    result.storage = foundStorage || 'Zamrzivač 1';
    
    // Grami specijalni slučaj
    const gramMatches = text.match(/\b(500|700|800|900|1000)\b/);
    if (gramMatches && (text.includes('gram') || text.includes('grama'))) {
        result.unit = 'g';
        result.quantity = gramMatches[1];
        if (result.piece === '1' || result.piece === '0') {
            result.piece = '0';
        }
    }
    
    console.log('✅ PARSIRANO:', result);
    return result;
}

// ============================================
// 5. FORMA FUNKCIJE (SKRAĆENE)
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
    }
    
    const dataEntry = document.getElementById('dataEntryScreen');
    if (dataEntry) {
        dataEntry.style.display = 'block';
        dataEntry.classList.add('active');
    } else {
        const form = document.querySelector('form');
        if (form) form.style.display = 'block';
    }
    
    setTimeout(prikaziPoljaZaUnos, 100);
}

function prikaziPoljaZaUnos() {
    const fields = ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput', 'unitSelect', 'storageSelect'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'block';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
        }
    });
}

function popuniFormuPodacima(data) {
    if (!data) return;
    console.log('📝 Popunjavam formu:', data);
    
    ensureFormVisible();
    
    setTimeout(() => {
        prikaziPoljaZaUnos();
        
        const fields = {
            productInput: data.product_name || '',
            pieceInput: data.piece || '1',
            quantityInput: data.quantity || '1',
            shelfLifeInput: data.shelf_life || '12'
        };
        
        Object.entries(fields).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) {
                el.value = value;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        
        // Jedinica
        const unitSelect = document.getElementById('unitSelect');
        if (unitSelect && data.unit) {
            for (let option of unitSelect.options) {
                if (option.value === data.unit || 
                    option.text.toLowerCase().includes(data.unit.toLowerCase())) {
                    option.selected = true;
                    unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }
        
        // Skladište
        const storageSelect = document.getElementById('storageSelect');
        if (storageSelect && data.storage) {
            for (let option of storageSelect.options) {
                if (option.value === data.storage || 
                    option.text.toLowerCase().includes(data.storage.toLowerCase())) {
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
// 6. ČUVANJE PODATAKA
// ============================================

function sacuvajPodatke(data) {
    if (!data) return false;
    console.log('💾 Čuvam podatke:', data);
    
    ALLOW_INVENTORY_OPEN = false;
    END_AKTIVAN = false;
    isVoiceInput = true;
    window._isVoiceInput = true;
    
    const originalShowModernAlert = window.showModernAlert;
    const originalAlert = window.alert;
    window.showModernAlert = function() { console.log('⛔ POP-UP ZABRANJEN'); return; };
    window.alert = function() { console.log('⛔ ALERT ZABRANJEN'); return; };
    
    let saved = false;
    popuniFormuPodacima(data);
    
    setTimeout(() => {
        if (typeof saveProduct === 'function') {
            try { saveProduct(); saved = true; } catch(e) { console.warn('saveProduct greška:', e); }
        }
        
        if (!saved) {
            try {
                const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
                zalihe.push({
                    id: Date.now(),
                    product_name: data.product_name,
                    piece: parseInt(data.piece) || 1,
                    quantity: parseFloat(data.quantity) || 1,
                    unit: data.unit || 'kom',
                    shelf_life_months: parseInt(data.shelf_life) || 12,
                    storage_location: data.storage || 'Zamrzivač 1',
                    entry_date: new Date().toISOString().split('T')[0],
                    isNew: true
                });
                localStorage.setItem('zalihe', JSON.stringify(zalihe));
                saved = true;
            } catch(e) { console.warn('localStorage greška:', e); }
        }
        
        setTimeout(() => {
            window.showModernAlert = originalShowModernAlert;
            window.alert = originalAlert;
        }, 1000);
        
        if (saved) {
            showVoiceStatus(`✅ Sačuvano: ${data.product_name}`, '#4CAF50');
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
    }, 500);
    
    return saved;
}

function processAndSaveItem(command) {
    if (!command) return false;
    
    ALLOW_INVENTORY_OPEN = false;
    END_AKTIVAN = false;
    
    const data = parseVoiceDataEntry(command);
    if (!data || !data.product_name || data.product_name === 'Proizvod' || data.product_name.length < 2) {
        showVoiceStatus('❌ Nisam prepoznao proizvod', '#f44336');
        return false;
    }
    
    console.log('📦 OBRADA:', data);
    lastSavedData = data;
    sacuvajPodatke(data);
    return true;
}

// ============================================
// 7. OTVARANJE ZALIHA
// ============================================

function otvoriZaliheEkran() {
    console.log('📦 Otvaram ekran zaliha...');
    
    if (!ALLOW_INVENTORY_OPEN) {
        showVoiceStatus('⛔ Samo "end" otvara zalihe', '#FF9800');
        return;
    }
    
    const refreshFunctions = ['refreshInventoryData', 'renderInventory', 'renderProductList', 'renderEntries', 'loadInventory', 'updateInventory'];
    refreshFunctions.forEach(fn => {
        if (typeof window[fn] === 'function') {
            try { window[fn](); } catch(e) {}
        }
    });
    
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
        showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
        ALLOW_INVENTORY_OPEN = false;
    }, 300);
}

// ============================================
// 8. START VOICE RECOGNITION (OPTIMIZOVAN)
// ============================================

function startVoiceRecognition() {
    console.log('🎤 startVoiceRecognition POZVAN!');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showVoiceStatus('❌ Browser ne podržava glas.', '#f44336');
        return;
    }

    if (recognition) {
        try { recognition.abort(); recognition = null; } catch(e) {}
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'sr-RS';
    recognition.continuous = !isMobile;  // ⭐ Desktop: true, Mobilni: false
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    END_AKTIVAN = false;
    isProcessingCommand = false;
    ALLOW_INVENTORY_OPEN = false;

    recognition.onstart = function() {
        console.log('🎤 MIKROFON AKTIVAN!');
        showVoiceStatus('🎤 Slušam... Recite "unos" pa podatke', '#4CAF50');
        activeBuffer = '';
        isProcessingCommand = false;
    };

    recognition.onresult = function(event) {
        let finalText = '';
        let interimText = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript.trim();
            if (result.isFinal) {
                finalText += (finalText ? ' ' : '') + transcript;
            } else {
                interimText += transcript;
            }
        }
        
        const fullText = finalText || interimText;
        if (!fullText) return;
        
        console.log('🗣️:', fullText);
        showVoiceStatus(`🎤: "${fullText}"`, '#FFD700');
        
        if (isProcessingCommand) return;
        
        const lower = fullText.toLowerCase();
        console.log('🔍 Proveravam:', lower);
        
        // ⭐ UNOS
        if (lower.includes('unos') || lower.includes('unesi') || lower.includes('dodaj')) {
            console.log('📝 UNOS - otvaram data entry');
            isProcessingCommand = true;
            hideVoiceMenu();
            
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
                if (typeof renderDataEntry === 'function') renderDataEntry('');
            }
            
            // Izvadi podatke posle "unos"
            let dataText = fullText.replace(/unos|unesi|dodaj/i, '').trim();
            if (dataText.length > 2 && !dataText.toLowerCase().includes('plus') && !dataText.toLowerCase().includes('end')) {
                setTimeout(() => {
                    processAndSaveItem(dataText);
                }, 300);
            }
            
            setTimeout(() => {
                isProcessingCommand = false;
                // ⭐ Restart za sledeći unos (samo ako nije end)
                if (!END_AKTIVAN) {
                    setTimeout(() => {
                        if (!isProcessingCommand && !END_AKTIVAN) {
                            startVoiceRecognition();
                        }
                    }, 1000);
                }
            }, 800);
            return;
        }
        
        // ⭐ PLUS
        if (lower.includes('plus')) {
            console.log('✅ PLUS - završavam unos');
            isProcessingCommand = true;
            
            let itemText = fullText.replace(/plus/i, '').trim();
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }
            
            showVoiceStatus('✅ Unos sačuvan!', '#4CAF50');
            
            setTimeout(() => {
                isProcessingCommand = false;
                // ⭐ Restart za sledeći unos
                if (!END_AKTIVAN) {
                    setTimeout(() => {
                        if (!isProcessingCommand && !END_AKTIVAN) {
                            startVoiceRecognition();
                        }
                    }, 1500);
                }
            }, 500);
            return;
        }
        
        // ⭐ END
        if (lower.includes('end') || lower.includes(' and ')) {
            console.log('🏁 END - otvaram zalihe');
            isProcessingCommand = true;
            END_AKTIVAN = true;
            ALLOW_INVENTORY_OPEN = true;
            
            let itemText = fullText.replace(/end|and/i, '').trim();
            if (itemText.length > 2 && !itemText.toLowerCase().includes('and')) {
                processAndSaveItem(itemText);
            }
            
            setTimeout(() => {
                stopVoiceRecognition();
                ALLOW_INVENTORY_OPEN = true;
                otvoriZaliheEkran();
                setTimeout(() => {
                    ALLOW_INVENTORY_OPEN = false;
                    END_AKTIVAN = false;
                }, 2000);
            }, 500);
            return;
        }
    };

    recognition.onerror = function(event) {
        console.error('⚠️ Greška:', event.error);
        
        const errorMessages = {
            'not-allowed': '❌ Dozvolite mikrofon.',
            'no-speech': '⚠️ Nisam čuo govor. Pokušajte ponovo.',
            'audio-capture': '❌ Problem sa mikrofonom.'
        };
        showVoiceStatus(errorMessages[event.error] || `⚠️ Greška: ${event.error}`, '#FF9800');
        
        isProcessingCommand = false;
        
        // ⭐ Restart posle greške (samo ako nije end)
        if (!END_AKTIVAN && event.error !== 'not-allowed') {
            setTimeout(() => {
                if (!isProcessingCommand && !END_AKTIVAN && !recognition) {
                    console.log('🔄 Restart posle greške');
                    startVoiceRecognition();
                }
            }, 2000);
        }
    };

    recognition.onend = function() {
        console.log('🎤 Prepoznavanje završeno.');
        isProcessingCommand = false;
        
        // ⭐ Automatski restart (samo ako nije end)
        if (!END_AKTIVAN && !isProcessingCommand) {
            setTimeout(() => {
                if (!recognition && !isProcessingCommand && !END_AKTIVAN) {
                    console.log('🔄 Automatski restart...');
                    startVoiceRecognition();
                }
            }, isMobile ? 2000 : 5000);
        }
    };

    try {
        recognition.start();
        console.log('✅ Mikrofon pokrenut!');
        showVoiceStatus('🎤 Slušam...', '#2196F3');
    } catch(e) {
        console.error('❌ Greška:', e);
        showVoiceStatus('❌ Greška pri pokretanju', '#f44336');
        recognition = null;
    }
}

// ============================================
// 9. ZAUSTAVI I RESTART
// ============================================

function stopVoiceRecognition() {
    if (recognition) {
        try {
            recognition.abort();
            recognition = null;
        } catch(e) {}
    }
    activeBuffer = '';
    isProcessingCommand = false;
    showVoiceStatus('⏸️ Prepoznavanje zaustavljeno', '#aaa');
}

function restartMicrophone() {
    console.log('🔄 Restartujem mikrofon...');
    stopVoiceRecognition();
    setTimeout(startVoiceRecognition, 500);
}

// ============================================
// 10. KEEP-ALIVE (SAMO ZA MOBILNI)
// ============================================

function keepMicAlive() {
    if (!recognition || isProcessingCommand || END_AKTIVAN) return;
    if (activeBuffer.length > 0) return;
    
    console.log('🔄 Keep-alive: osvežavam vezu');
    try {
        recognition.stop();
        setTimeout(() => {
            if (!isProcessingCommand && !END_AKTIVAN) {
                recognition.start();
            }
        }, 200);
    } catch(e) {
        console.warn('Keep-alive greška:', e);
        if (!END_AKTIVAN) startVoiceRecognition();
    }
}

function startKeepAlive() {
    if (keepAliveTimer) clearInterval(keepAliveTimer);
    if (!isMobile) return;  // ⭐ Samo za mobilni
    
    keepAliveTimer = setInterval(keepMicAlive, 10000);
    console.log('✅ Keep-alive pokrenut (10s)');
}

function stopKeepAlive() {
    if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
    }
}

// ============================================
// 11. OSTALE FUNKCIJE
// ============================================

function goBackFromVoice() {
    console.log('◀ goBackFromVoice POZVAN!');
    stopVoiceRecognition();
    stopKeepAlive();
    
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
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
    
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    const voiceMenuScreen = document.getElementById('voiceMenuScreen');
    if (voiceMenuScreen) {
        voiceMenuScreen.style.display = 'flex';
        voiceMenuScreen.classList.add('active');
    }
    
    // ⭐ Mobilni: čekamo klik, Desktop: pokrećemo odmah
    if (isMobile) {
        showVoiceStatus('📱 Dodirnite "🎤 Pokreni mikrofon"', '#FF9800');
        // Event listener je u HTML dugmetu
    } else {
        setTimeout(startVoiceRecognition, 500);
    }
}

function prikaziTrenutnePodatke() {
    if (lastSavedData) {
        showVoiceStatus(`📊 ${lastSavedData.product_name} (${lastSavedData.quantity} ${lastSavedData.unit})`, '#4CAF50');
    } else {
        showVoiceStatus('📊 Nema sačuvanih podataka', '#FF9800');
    }
}

function ocistiFormu() {
    ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = '';
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    ['unitSelect', 'storageSelect'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.options.length > 0) {
            el.selectedIndex = 0;
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    console.log('🧹 Forma očišćena');
}

function debugFormVisibility() {
    console.log('🔍 DEBUG:');
    const ids = ['dataEntryScreen', 'mainScreen', 'productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            console.log(`${id}: display=${el.style.display}, visible=${el.offsetParent !== null}`);
        } else {
            console.log(`${id}: NOT FOUND`);
        }
    });
}

// ============================================
// 12. EKSPORT FUNKCIJA
// ============================================

// Eksportuj sve funkcije
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.restartMicrophone = restartMicrophone;
window.selectVoiceMode = selectVoiceMode;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.prikaziTrenutnePodatke = prikaziTrenutnePodatke;
window.ocistiFormu = ocistiFormu;
window.debugFormVisibility = debugFormVisibility;
window.processAndSaveItem = processAndSaveItem;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.popuniFormuPodacima = popuniFormuPodacima;
window.ensureFormVisible = ensureFormVisible;
window.prikaziPoljaZaUnos = prikaziPoljaZaUnos;
window.sacuvajPodatke = sacuvajPodatke;
window.otvoriZaliheEkran = otvoriZaliheEkran;

// ============================================
// 13. OVERRIDE SAVEPRODUCT
// ============================================

const originalSaveProduct = window.saveProduct;
window.saveProduct = function() {
    console.log('🛡️ saveProduct - čuvam bez resetovanja');
    
    const fields = ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput'];
    const savedValues = {};
    fields.forEach(id => {
        const el = document.getElementById(id);
        savedValues[id] = el ? el.value : '';
    });
    
    if (typeof originalSaveProduct === 'function') {
        try { originalSaveProduct(); } catch(e) {}
    }
    
    setTimeout(() => {
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el && savedValues[id]) {
                el.value = savedValues[id];
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        prikaziPoljaZaUnos();
    }, 100);
};

// ============================================
// 14. MOBILNI - AKTIVACIJA NA KLIK
// ============================================

function aktivirajMikrofonNaMobilnom() {
    if (!isMobile) return;
    console.log('📱 Aktivacija mikrofona na mobilnom');
    
    // Event listener za klik na dugme
    document.addEventListener('click', function mobilniKlik() {
        if (!recognition && !END_AKTIVAN) {
            console.log('📱 Klik - pokrećem mikrofon');
            startVoiceRecognition();
            // Ukloni posle prvog klika
            document.removeEventListener('click', mobilniKlik);
        }
    }, { once: true });
}

// ⭐ Pokreni na mobilnom
if (isMobile) {
    aktivirajMikrofonNaMobilnom();
    // Dodaj keep-alive na start
    const origStart = startVoiceRecognition;
    startVoiceRecognition = function() {
        stopKeepAlive();
        origStart();
        setTimeout(startKeepAlive, 3000);
    };
}

// ============================================
// 15. KRAJ
// ============================================

console.log('✅ VOICE COMMANDS - OPTIMIZOVANA VERZIJA UČITANA!');
console.log(`📱 Mobilni režim: ${isMobile ? 'AKTIVAN' : 'NEAKTIVAN'}`);
console.log('🎤 "unos" → diktiraj → "plus" → "end"');
