// ============================================
// VOICE COMMANDS - STABILNA I OČIŠĆENA VERZIJA
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

function parseVoiceDataEntry(command) {
    let text = command.replace(/^unos\s*/i, '').replace(/^start\s*/i, '').trim();
    let words = text.split(/\s+/).map(s => s.trim()).filter(Boolean);
    
    let result = {
        product_name: '', piece: '1', quantity: '1',
        unit: 'kom', shelf_life: '12', storage: 'Zamrzivač 1'
    };

    let numbers = [];
    let nameParts = [];
    let skipWords = ['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseci', 'i'];

    words.forEach(w => {
        let lower = w.toLowerCase();
        if (UNIT_MAP[lower]) result.unit = UNIT_MAP[lower];
        if (STORAGE_MAP[lower]) result.storage = STORAGE_MAP[lower];
        
        let num = getNumber(lower);
        if (num !== null) {
            numbers.push(num);
        } else if (!skipWords.includes(lower)) {
            nameParts.push(w);
        }
    });

    if (numbers.length >= 2) {
        result.piece = numbers[0];
        result.quantity = numbers[1];
    } else if (numbers.length === 1) {
        result.piece = '1';
        result.quantity = numbers[0];
    }

    result.product_name = nameParts.join(' ').trim() || 'Proizvod';
    return result;
}

// ============================================
// 3. DIKRETNO I BEZBEDNO PRIKAZIVANJE EKRANA
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
// 4. PREPOZNAVANJE GOVORA (VOICE ENGINE)
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
        showVoiceStatus('🎤 Slušam... Recite komandu ili podatke', '#2196F3');
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
        
        const lowerFull = (activeBuffer + ' ' + interimText).toLowerCase().trim();
        showVoiceStatus(`🎤 Slušam: "${lowerFull}"`, '#FFD700');

        if (isProcessingCommand) return;

        // --- KOMANDA: END ---
        if (lowerFull.includes('end') || lowerFull.includes('and')) {
            console.log('🏁 END detektovan - otvaram zalihe!');
            isProcessingCommand = true;

            let itemText = activeBuffer.replace(/\bend\b/gi, '').replace(/\band\b/gi, '').trim();
            if (itemText.length > 2 && typeof sacuvajPodatke === 'function') {
                sacuvajPodatke(parseVoiceDataEntry(itemText));
            }

            activeBuffer = '';
            otvoriZaliheEkran();

            setTimeout(() => {
                isProcessingCommand = false;
            }, 1000);
            return;
        }

        // --- KOMANDA: PLUS ---
        if (lowerFull.includes('plus')) {
            console.log('✅ PLUS detektovan - čuvam unos...');
            isProcessingCommand = true;

            let itemText = activeBuffer.replace(/\bplus\b/gi, '').trim();
            if (itemText.length > 2 && typeof sacuvajPodatke === 'function') {
                sacuvajPodatke(parseVoiceDataEntry(itemText));
            }

            activeBuffer = '';
            showVoiceStatus('✅ Unos sačuvan. Recite sledeći ili "end" za kraj.', '#4CAF50');

            setTimeout(() => {
                isProcessingCommand = false;
            }, 1000);
            return;
        }
    };

    recognition.onerror = function(event) {
        if (event.error !== 'no-speech') {
            console.error('Speech error:', event.error);
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
// 5. GLOBALNE METODE
// ============================================

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.otvoriZaliheEkran = otvoriZaliheEkran;

console.log('✅ VoiceCommands.js uspešno učitan i popravljen!');
