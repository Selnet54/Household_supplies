// ============================================
// VOICE COMMANDS - ORIGINAL RADNA VERZIJA
// ============================================
console.log('🎤 voiceCommands.js - ORIGINAL');

let isListening = false;
let recognition = null;

// ============================================
// PARSIRANJE
// ============================================
function parseVoiceInput(text) {
    console.log('🔍 Parsiram:', text);
    
    let result = {
        naziv: text.trim(),
        kolicina: 1,
        jedinica: 'kom',
        rok: 12,
        skladiste: 'Ostava',
        pakovanje: '1 komad'
    };
    
    let clean = text.toLowerCase();
    
    // Skladište
    if (clean.includes('zamrzivač') || clean.includes('zamrzivac')) {
        result.skladiste = 'Zamrzivač 1';
    } else if (clean.includes('frižider') || clean.includes('frizider')) {
        result.skladiste = 'Frižider';
    }
    
    // Količina
    const kgMatch = text.match(/(\d+)\s*(kg|kile|kilograma)/i);
    if (kgMatch) {
        result.kolicina = parseInt(kgMatch[1]);
        result.jedinica = 'kg';
    }
    
    const komMatch = text.match(/(\d+)\s*(kom|komad)/i);
    if (komMatch && !kgMatch) {
        result.kolicina = parseInt(komMatch[1]);
        result.jedinica = 'kom';
        result.pakovanje = komMatch[1] + ' komad';
    }
    
    // Rok
    const mesMatch = text.match(/(\d+)\s*(meseci|mesec|mes)/i);
    if (mesMatch) {
        result.rok = parseInt(mesMatch[1]);
    }
    
    // Ime
    let ime = text;
    ime = ime.replace(/\d+\s*(kg|kile|kilograma|kom|komad|meseci|mesec|mes)/gi, '');
    ime = ime.replace(/zamrzivač|zamrzivac|frižider|frizider|ostava/gi, '');
    ime = ime.replace(/[0-9]/g, '');
    ime = ime.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '');
    ime = ime.trim();
    ime = ime.replace(/gripile/gi, 'Gril pile');
    
    if (ime) result.naziv = ime;
    
    console.log('✅ Parsirano:', result);
    return result;
}

// ============================================
// POPUNJAVANJE POLJA
// ============================================
function fillFields(parsed) {
    console.log('📝 Popunjavam:', parsed);
    
    const productInput = document.getElementById('productInput');
    const quantityInput = document.getElementById('quantityInput');
    const unitSelect = document.getElementById('unitSelect');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const storageSelect = document.getElementById('storageSelect');
    const pieceInput = document.getElementById('pieceInput');
    
    if (productInput && parsed.naziv) {
        productInput.value = parsed.naziv;
        productInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (quantityInput && parsed.kolicina) {
        quantityInput.value = parsed.kolicina;
    }
    if (pieceInput && parsed.pakovanje) {
        pieceInput.value = parsed.pakovanje;
    }
    if (shelfLifeInput && parsed.rok) {
        shelfLifeInput.value = parsed.rok;
        shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    if (storageSelect && parsed.skladiste) {
        for (let opt of storageSelect.options) {
            if (opt.value === parsed.skladiste || opt.text.includes(parsed.skladiste)) {
                storageSelect.value = opt.value;
                break;
            }
        }
    }
    
    if (unitSelect && parsed.jedinica) {
        for (let opt of unitSelect.options) {
            if (opt.value === parsed.jedinica) {
                unitSelect.value = opt.value;
                break;
            }
        }
    }
    
    if (typeof updateExpiryDate === 'function') {
        updateExpiryDate();
    }
    
    const status = document.getElementById('voiceStatus');
    if (status) {
        status.innerText = `✅ ${parsed.naziv} (${parsed.kolicina} ${parsed.jedinica}, rok: ${parsed.rok} meseci)`;
        status.style.color = '#4CAF50';
    }
}

// ============================================
// DIREKTAN UNOS
// ============================================
function direktanUnos(text) {
    const parsed = parseVoiceInput(text);
    fillFields(parsed);
    return parsed;
}

// ============================================
// SLUŠANJE
// ============================================
function startSimpleListening() {
    if (isListening) return;
    
    console.log('🎤 Pokrećem slušanje...');
    isListening = true;
    
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('❌ Browser ne podržava glasovni unos');
        return;
    }
    
    recognition = new SpeechRecognition();
    recognition.lang = 'sr-RS';
    recognition.continuous = true;
    recognition.interimResults = false;
    
    recognition.onresult = function(event) {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        console.log('🗣️ Čuo sam:', text);
        processCommand(text);
    };
    
    recognition.onerror = function(event) {
        console.log('⚠️ Greška:', event.error);
        if (event.error === 'not-allowed') {
            alert('📱 Dozvolite mikrofon!');
            isListening = false;
        }
    };
    
    recognition.onend = function() {
        console.log('🔄 Slušanje završeno');
        if (isListening) {
            setTimeout(() => {
                try { recognition.start(); } catch(e) {}
            }, 200);
        }
    };
    
    try {
        recognition.start();
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.innerText = '🎤 Slušam... Govorite';
            status.style.color = '#FFD700';
        }
    } catch(e) {
        console.error('❌ Greška:', e);
        isListening = false;
    }
}

function stopSimpleListening() {
    console.log('🛑 Zaustavljam');
    isListening = false;
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    const status = document.getElementById('voiceStatus');
    if (status) {
        status.innerText = '⏹ Slušanje zaustavljeno';
        status.style.color = '#f44336';
    }
}

function toggleListening() {
    if (isListening) {
        stopSimpleListening();
    } else {
        startSimpleListening();
    }
}

// ============================================
// OBRADA KOMANDI
// ============================================
function processCommand(text) {
    const clean = text.toLowerCase().trim();
    
    // Izlaz
    if (clean.includes('izlaz') || clean.includes('exit')) {
        stopSimpleListening();
        if (typeof logout === 'function') logout();
        return;
    }
    
    // OK - završetak
    if (clean === 'ok' || clean === 'okej') {
        stopSimpleListening();
        if (typeof saveProduct === 'function') saveProduct();
        if (typeof renderInventory === 'function') renderInventory();
        return;
    }
    
    // PLUS - čuvanje
    if (clean === 'plus') {
        if (typeof saveProduct === 'function') saveProduct();
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.innerText = '✅ Sačuvano! Nastavite...';
            status.style.color = '#4CAF50';
        }
        return;
    }
    
    // UNOS - otvori tab
    if (clean.includes('unos') || clean === 'un') {
        const tab = document.querySelector('[data-tab="dataEntry"]');
        if (tab) tab.click();
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.innerText = '📝 Unos otvoren. Govorite...';
            status.style.color = '#2196F3';
        }
        return;
    }
    
    // ZALIHE
    if (clean.includes('zalihe') || clean.includes('stanje')) {
        const tab = document.querySelector('[data-tab="inventory"]');
        if (tab) tab.click();
        if (typeof renderInventory === 'function') renderInventory();
        return;
    }
    
    // Ako ima broj - popuni
    if (/\d/.test(text) && text.length > 3) {
        direktanUnos(text);
        return;
    }
    
    // Nije prepoznato
    const status = document.getElementById('voiceStatus');
    if (status) {
        status.innerText = `❌ Nije prepoznato: "${text}"`;
        status.style.color = '#f44336';
    }
}

// ============================================
// IZVOZ
// ============================================
window.voiceCommand = processCommand;
window.startSimpleListening = startSimpleListening;
window.stopSimpleListening = stopSimpleListening;
window.toggleListening = toggleListening;
window.direktanUnos = direktanUnos;
window.parseVoiceInput = parseVoiceInput;
window.fillFields = fillFields;

console.log('✅ voiceCommands.js - ORIGINAL učitano!');
console.log('🎤 Reci "UNOS" za otvaranje unosa');
console.log('🎤 Reci "Gril pile 2 kile 7 meseci" za unos');
console.log('🎤 Reci "PLUS" za čuvanje');
console.log('🎤 Reci "OK" za završetak');
