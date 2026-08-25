// ============================================
// VOICE COMMANDS - POPRAVLJENA VERZIJA
// ============================================

let activeBuffer = '';
let recognition = null;
let lastSavedData = null;
let isProcessingCommand = false;
let isVoiceInput = false;
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
    
    if (/^\d+(?:[.,]\d+)?$/.test(w)) {
        return w.replace(',', '.');
    }
    
    return null;
}

// GLAVNA FUNKCIJA ZA PARSIRANJE - POPRAVLJENA
function parseVoiceDataEntry(command) {
    console.log('📝 Originalni tekst:', command);
    
    // 1. PRVO UKLONI SVE POZNATE KOMANDE
    let text = command
        .replace(/^unos\s*/i, '')        // ukloni "unos" na početku
        .replace(/^start\s*/i, '')       // ukloni "start" na početku
        .replace(/^dodaj\s*/i, '')       // ukloni "dodaj" na početku
        .replace(/\bend\b/gi, '')        // ukloni "end"
        .replace(/\band\b/gi, '')        // ukloni "and"
        .replace(/\bplus\b/gi, '')       // ukloni "plus"
        .replace(/\bkraj\b/gi, '')       // ukloni "kraj"
        .replace(/\bgotovo\b/gi, '')     // ukloni "gotovo"
        .trim();
    
    console.log('📝 Tekst nakon uklanjanja komandi:', text);
    
    // 2. PROVERI DA LI IMA SMISLA
    if (text.length < 2) {
        console.warn('⚠️ Tekst je prekratak nakon uklanjanja komandi');
        return null;
    }
    
    let words = text.split(/\s+/).map(s => s.trim()).filter(Boolean);
    console.log('🔍 Reči za parsiranje:', words);
    
    // Podrazumevane vrednosti
    let result = {
        product_name: '',
        piece: '0',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };

    let numbers = [];
    let numberPositions = [];
    let unitFound = null;
    let storageFound = null;
    
    let skipWords = ['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseci', 'i', 'od', 'do', 'sa'];
    
    // Prvi prolaz: identifikujemo brojeve, jedinice i skladište
    words.forEach((w, index) => {
        let lower = w.toLowerCase();
        
        if (UNIT_MAP[lower]) {
            unitFound = UNIT_MAP[lower];
            return;
        }
        
        if (STORAGE_MAP[lower]) {
            storageFound = STORAGE_MAP[lower];
            return;
        }
        
        let num = getNumber(lower);
        if (num !== null) {
            numbers.push({ value: num, position: index });
            numberPositions.push(index);
        }
    });

    if (unitFound) result.unit = unitFound;
    if (storageFound) result.storage = storageFound;

    // RASPOREDI BROJEVE
    if (numbers.length >= 1) {
        const isWeightUnit = WEIGHT_UNITS.includes(result.unit);
        
        if (isWeightUnit) {
            result.piece = '0';
            result.quantity = numbers[0].value;
            console.log(`⚖️ Težinski: piece=0, quantity=${result.quantity}, unit=${result.unit}`);
        } else {
            result.piece = numbers[0].value;
            result.quantity = '1';
            console.log(`📦 Komadni: piece=${result.piece}, quantity=${result.quantity}`);
        }
    }

    // IZVUCI NAZIV PROIZVODA
    let filteredWords = words.filter((w, index) => {
        let lower = w.toLowerCase();
        if (numberPositions.includes(index)) return false;
        if (UNIT_MAP[lower]) return false;
        if (STORAGE_MAP[lower]) return false;
        if (skipWords.includes(lower)) return false;
        return true;
    });
    
    result.product_name = filteredWords.join(' ').trim() || 'Proizvod';
    
    console.log('✅ KONAČNI REZULTAT:', result);
    return result;
}

// ============================================
// 3. FUNKCIJA ZA ČUVANJE
// ============================================

function sacuvajPodatke(data) {
    if (!data) {
        console.error('❌ Podaci su null ili undefined');
        showVoiceStatus('❌ Greška: nema podataka za čuvanje', '#f44336');
        return;
    }
    
    console.log('💾 ČUVAM PODATKE:', data);
    
    let poruka = '';
    if (data.piece === '0') {
        poruka = `✅ Sačuvano: ${data.quantity} ${data.unit} ${data.product_name}`;
    } else {
        poruka = `✅ Sačuvano: ${data.piece} kom. ${data.product_name}`;
    }
    
    showVoiceStatus(poruka, '#4CAF50');
}

// ============================================
// VOICE COMMANDS - POPRAVLJENA VERZIJA
// ============================================

let activeBuffer = '';
let recognition = null;
let lastSavedData = null;
let isProcessingCommand = false;
let isVoiceInput = false;
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
    
    if (/^\d+(?:[.,]\d+)?$/.test(w)) {
        return w.replace(',', '.');
    }
    
    return null;
}

// GLAVNA FUNKCIJA ZA PARSIRANJE - POPRAVLJENA
function parseVoiceDataEntry(command) {
    console.log('📝 Originalni tekst:', command);
    
    // 1. PRVO UKLONI SVE POZNATE KOMANDE
    let text = command
        .replace(/^unos\s*/i, '')        // ukloni "unos" na početku
        .replace(/^start\s*/i, '')       // ukloni "start" na početku
        .replace(/^dodaj\s*/i, '')       // ukloni "dodaj" na početku
        .replace(/\bend\b/gi, '')        // ukloni "end"
        .replace(/\band\b/gi, '')        // ukloni "and"
        .replace(/\bplus\b/gi, '')       // ukloni "plus"
        .replace(/\bkraj\b/gi, '')       // ukloni "kraj"
        .replace(/\bgotovo\b/gi, '')     // ukloni "gotovo"
        .trim();
    
    console.log('📝 Tekst nakon uklanjanja komandi:', text);
    
    // 2. PROVERI DA LI IMA SMISLA
    if (text.length < 2) {
        console.warn('⚠️ Tekst je prekratak nakon uklanjanja komandi');
        return null;
    }
    
    let words = text.split(/\s+/).map(s => s.trim()).filter(Boolean);
    console.log('🔍 Reči za parsiranje:', words);
    
    // Podrazumevane vrednosti
    let result = {
        product_name: '',
        piece: '0',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };

    let numbers = [];
    let numberPositions = [];
    let unitFound = null;
    let storageFound = null;
    
    let skipWords = ['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseci', 'i', 'od', 'do', 'sa'];
    
    // Prvi prolaz: identifikujemo brojeve, jedinice i skladište
    words.forEach((w, index) => {
        let lower = w.toLowerCase();
        
        if (UNIT_MAP[lower]) {
            unitFound = UNIT_MAP[lower];
            return;
        }
        
        if (STORAGE_MAP[lower]) {
            storageFound = STORAGE_MAP[lower];
            return;
        }
        
        let num = getNumber(lower);
        if (num !== null) {
            numbers.push({ value: num, position: index });
            numberPositions.push(index);
        }
    });

    if (unitFound) result.unit = unitFound;
    if (storageFound) result.storage = storageFound;

    // RASPOREDI BROJEVE
    if (numbers.length >= 1) {
        const isWeightUnit = WEIGHT_UNITS.includes(result.unit);
        
        if (isWeightUnit) {
            result.piece = '0';
            result.quantity = numbers[0].value;
            console.log(`⚖️ Težinski: piece=0, quantity=${result.quantity}, unit=${result.unit}`);
        } else {
            result.piece = numbers[0].value;
            result.quantity = '1';
            console.log(`📦 Komadni: piece=${result.piece}, quantity=${result.quantity}`);
        }
    }

    // IZVUCI NAZIV PROIZVODA
    let filteredWords = words.filter((w, index) => {
        let lower = w.toLowerCase();
        if (numberPositions.includes(index)) return false;
        if (UNIT_MAP[lower]) return false;
        if (STORAGE_MAP[lower]) return false;
        if (skipWords.includes(lower)) return false;
        return true;
    });
    
    result.product_name = filteredWords.join(' ').trim() || 'Proizvod';
    
    console.log('✅ KONAČNI REZULTAT:', result);
    return result;
}

// ============================================
// 3. FUNKCIJA ZA ČUVANJE
// ============================================

function sacuvajPodatke(data) {
    if (!data) {
        console.error('❌ Podaci su null ili undefined');
        showVoiceStatus('❌ Greška: nema podataka za čuvanje', '#f44336');
        return;
    }
    
    console.log('💾 ČUVAM PODATKE:', data);
    
    let poruka = '';
    if (data.piece === '0') {
        poruka = `✅ Sačuvano: ${data.quantity} ${data.unit} ${data.product_name}`;
    } else {
        poruka = `✅ Sačuvano: ${data.piece} kom. ${data.product_name}`;
    }
    
    showVoiceStatus(poruka, '#4CAF50');
}

// ============================================
// 4. PRIKAZIVANJE EKRANA
// ============================================

function sakrijSveEkrane() {
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
}

function otvoriZaliheEkran() {
    console.log('📦 Otvaram ekran zaliha...');
    sakrijSveEkrane();
    
    const inv = document.getElementById('inventoryScreen') || document.querySelector('.inventory-screen');
    if (inv) {
        inv.style.setProperty('display', 'flex', 'important');
        inv.classList.add('active');
        
        try {
            if (typeof renderInventory === 'function') renderInventory();
            if (typeof loadInventory === 'function') loadInventory();
            if (typeof refreshInventoryData === 'function') refreshInventoryData();
        } catch(e) {
            console.warn('Greška pri renderovanju zaliha:', e);
        }
        showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
    } else {
        console.error('❌ Element inventoryScreen nije pronađen na strani!');
    }
}

// ============================================
// 5. PREPOZNAVANJE GOVORA - POPRAVLJENO
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

        // PRVO PROVERI DA LI SADRŽI REČ "UNOS"
        const hasUnos = lowerFull.includes('unos');
        console.log('🔍 Sadrži "unos"?', hasUnos);
        
        if (!hasUnos) {
            // Ako nema "unos", samo prikaži status ali ne obrađuj
            showVoiceStatus('🎤 Recite "unos" pa podatke...', '#FFA500');
            return;
        }

        // KOMANDA: END - ali samo ako je rečeno "unos" pre toga
        if ((lowerFull.includes('end') || lowerFull.includes('and') || lowerFull.includes('kraj') || lowerFull.includes('gotovo')) && hasUnos) {
            console.log('🏁 END detektovan sa UNOS!');
            isProcessingCommand = true;

            // Ukloni sve komande iz teksta
            let itemText = activeBuffer
                .replace(/\bunos\b/gi, '')      // ukloni "unos"
                .replace(/\bend\b/gi, '')        // ukloni "end"
                .replace(/\band\b/gi, '')        // ukloni "and"
                .replace(/\bkraj\b/gi, '')       // ukloni "kraj"
                .replace(/\bgotovo\b/gi, '')     // ukloni "gotovo"
                .trim();
            
            console.log('📝 Tekst za parsiranje (bez komandi):', itemText);
            
            if (itemText.length > 2) {
                const parsedData = parseVoiceDataEntry(itemText);
                if (parsedData) {
                    sacuvajPodatke(parsedData);
                } else {
                    showVoiceStatus('❌ Greška pri parsiranju podataka', '#f44336');
                }
            } else {
                showVoiceStatus('⚠️ Prekratak unos, pokušajte ponovo', '#FF9800');
            }

            activeBuffer = '';
            otvoriZaliheEkran();

            setTimeout(() => {
                isProcessingCommand = false;
            }, 1500);
            return;
        }

        // KOMANDA: PLUS - ali samo ako je rečeno "unos" pre toga
        if (lowerFull.includes('plus') && hasUnos) {
            console.log('✅ PLUS detektovan sa UNOS!');
            isProcessingCommand = true;

            let itemText = activeBuffer
                .replace(/\bunos\b/gi, '')      // ukloni "unos"
                .replace(/\bplus\b/gi, '')       // ukloni "plus"
                .trim();
            
            console.log('📝 Tekst za parsiranje (bez komandi):', itemText);
            
            if (itemText.length > 2) {
                const parsedData = parseVoiceDataEntry(itemText);
                if (parsedData) {
                    sacuvajPodatke(parsedData);
                    showVoiceStatus('✅ Sačuvano. Recite sledeći ili "end" za kraj.', '#4CAF50');
                } else {
                    showVoiceStatus('❌ Greška pri parsiranju podataka', '#f44336');
                }
            } else {
                showVoiceStatus('⚠️ Prekratak unos, pokušajte ponovo', '#FF9800');
            }

            activeBuffer = '';

            setTimeout(() => {
                isProcessingCommand = false;
            }, 1500);
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
        if (recognition) {
            try { recognition.start(); } catch(e) {}
        }
    };

    try {
        recognition.start();
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

// ============================================
// 6. GLOBALNE METODE
// ============================================

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.otvoriZaliheEkran = otvoriZaliheEkran;
window.sacuvajPodatke = sacuvajPodatke;
window.parseVoiceDataEntry = parseVoiceDataEntry;

console.log('✅ VoiceCommands.js USPEŠNO UČITAN!');
console.log('📝 Kako koristiti:');
console.log('   1. Kažite: "unos 2 kilograma jabuka end"');
console.log('   2. Ili: "unos 3 paketa testenine plus"');
console.log('📊 Rezultat:');
console.log('   "unos 2 kg jabuka end" → piece:0, quantity:2, unit:kg');
console.log('   "unos 3 paketa testenine plus" → piece:3, quantity:1, unit:pak');
