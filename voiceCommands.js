// ============================================
// VOICE COMMANDS - JEDNOSTAVNA RADNA VERZIJA
// ============================================
console.log('🎤 voiceCommands.js - JEDNOSTAVNA VERZIJA');

window.voiceCommandProcessing = false;
let simpleRecognition = null;
let isSimpleListening = false;

function getCurrentLang() {
    return window.currentLanguage || localStorage.getItem('appLanguage') || 'sr';
}

// ============================================
// JEDNOSTAVNO PARSIRANJE
// ============================================
function simpleParse(text) {
    console.log('🔍 Parsiram:', text);
    
    let result = {
        product: text.trim(),
        piece: '1',
        quantity: 1,
        unit: 'kg',
        shelfLife: 12,
        storage: 'Ostava'
    };
    
    let clean = text.toLowerCase();
    
    // Storage
    if (clean.includes('zamrzivač') || clean.includes('zamrzivac') || clean.includes('freezer')) {
        result.storage = 'Zamrzivač 1';
    } else if (clean.includes('frižider') || clean.includes('frizider') || clean.includes('refrigerator')) {
        result.storage = 'Frižider';
    } else if (clean.includes('ostava') || clean.includes('pantry')) {
        result.storage = 'Ostava';
    }
    
    // Količina
    const kgMatch = text.match(/(\d+)\s*(kg|kile|kilograma|kilogram)/i);
    if (kgMatch) {
        result.quantity = parseFloat(kgMatch[1]);
        result.unit = 'kg';
    }
    
    const gMatch = text.match(/(\d+)\s*(g|grama|gram)/i);
    if (gMatch) {
        result.quantity = parseFloat(gMatch[1]);
        result.unit = 'g';
    }
    
    const komMatch = text.match(/(\d+)\s*(kom|komad|pcs|piece)/i);
    if (komMatch) {
        result.piece = komMatch[1] + ' komad';
        result.quantity = parseFloat(komMatch[1]);
        result.unit = 'kom';
    }
    
    // Rok
    const monthMatch = text.match(/(\d+)\s*(meseci|mes|mesec|month)/i);
    if (monthMatch) {
        result.shelfLife = parseInt(monthMatch[1]);
    }
    
    // Očisti naziv - ukloni sve što smo prepoznali
    let productName = text;
    productName = productName.replace(/\d+\s*(kg|kile|kilograma|kilogram|g|grama|gram|kom|komad|pcs|piece)/gi, '');
    productName = productName.replace(/\d+\s*(meseci|mes|mesec|month)/gi, '');
    productName = productName.replace(/zamrzivač|zamrzivac|freezer|frižider|frizider|refrigerator|ostava|pantry/gi, '');
    productName = productName.replace(/[0-9]/g, '');
    productName = productName.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '');
    productName = productName.trim();
    
    if (productName) {
        result.product = productName;
    }
    
    console.log('✅ Parsirano:', result);
    return result;
}

// ============================================
// POPUNJAVANJE POLJA
// ============================================
function fillFields(parsed) {
    console.log('📝 Popunjavam polja:', parsed);
    
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const storageSelect = document.getElementById('storageSelect');
    const unitSelect = document.getElementById('unitSelect');
    
    if (productInput) {
        productInput.value = parsed.product;
        productInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (pieceInput) pieceInput.value = parsed.piece;
    if (quantityInput) quantityInput.value = parsed.quantity;
    if (shelfLifeInput) {
        shelfLifeInput.value = parsed.shelfLife;
        shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    if (storageSelect) {
        for (let opt of storageSelect.options) {
            if (opt.value === parsed.storage || opt.text.includes(parsed.storage)) {
                storageSelect.value = opt.value;
                break;
            }
        }
    }
    
    if (unitSelect) {
        for (let opt of unitSelect.options) {
            if (opt.value === parsed.unit) {
                unitSelect.value = opt.value;
                break;
            }
        }
    }
    
    if (typeof updateExpiryDate === 'function') {
        updateExpiryDate();
    }
}

// ============================================
// ČUVANJE
// ============================================
function saveCurrentProduct() {
    console.log('💾 Čuvam proizvod');
    if (typeof saveProduct === 'function') {
        saveProduct();
    }
    
    // Resetuj polja
    setTimeout(() => {
        const inputs = ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput', 'descriptionInput'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        if (typeof updateExpiryDate === 'function') updateExpiryDate();
    }, 100);
    
    const status = document.getElementById('voiceStatus');
    if (status) {
        status.innerText = '✅ Sačuvano! Nastavite...';
        status.style.color = '#4CAF50';
    }
}

// ============================================
// ZAVRŠETAK
// ============================================
function finishAndGoBack() {
    console.log('🏁 Završavam unos');
    if (typeof saveProduct === 'function') {
        saveProduct();
    }
    stopSimpleListening();
    window.currentScreenState = 'inventory';
    
    if (typeof renderInventory === 'function') {
        renderInventory();
    }
    
    const status = document.getElementById('voiceStatus');
    if (status) {
        status.innerText = '✅ Unos završen!';
        status.style.color = '#4CAF50';
    }
}

// ============================================
// JEDNOSTAVNO SLUŠANJE - OVO JE SRŽ
// ============================================
function startSimpleListening() {
    if (isSimpleListening) {
        console.log('⚠️ Već slušam');
        return;
    }
    
    console.log('🎤 POKREĆEM JEDNOSTAVNO SLUŠANJE');
    isSimpleListening = true;
    
    // Zaustavi sve postojeće
    if (window.recognition) {
        try { window.recognition.stop(); } catch(e) {}
        window.recognition = null;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.error('❌ Nema Speech Recognition');
        return;
    }
    
    const rec = new SpeechRecognition();
    rec.lang = 'sr-RS';
    rec.continuous = true;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    
    rec.onresult = function(event) {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        console.log('🗣️ ČUO SAM:', text);
        
        // Resetuj processing
        window.voiceCommandProcessing = false;
        
        // Procesiraj
        processSimpleCommand(text);
    };
    
    rec.onerror = function(event) {
        console.log('⚠️ Greška:', event.error);
        if (event.error === 'not-allowed') {
            alert('📱 Dozvolite pristup mikrofonu!');
            isSimpleListening = false;
        }
        // Nastavi da slušaš
        if (isSimpleListening) {
            setTimeout(() => {
                try { rec.start(); } catch(e) {}
            }, 100);
        }
    };
    
    rec.onend = function() {
        console.log('🔄 Slušanje završeno');
        if (isSimpleListening && window.currentScreenState === 'dataEntry') {
            setTimeout(() => {
                try { 
                    rec.start();
                    console.log('🔄 Restart slušanja');
                } catch(e) {
                    console.log('⚠️ Greška restart:', e);
                }
            }, 200);
        }
    };
    
    try {
        rec.start();
        window.recognition = rec;
        simpleRecognition = rec;
        console.log('✅ SLUŠAM!');
        
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.innerText = '🎤 Slušam... Govorite podatke';
            status.style.color = '#FFD700';
        }
    } catch(e) {
        console.error('❌ Greška start:', e);
        isSimpleListening = false;
    }
}

function stopSimpleListening() {
    console.log('🛑 Zaustavljam slušanje');
    isSimpleListening = false;
    if (window.recognition) {
        try { window.recognition.stop(); } catch(e) {}
        window.recognition = null;
    }
    simpleRecognition = null;
    window.voiceCommandProcessing = false;
}

// ============================================
// OBRADA KOMANDI - JEDNOSTAVNA
// ============================================
function processSimpleCommand(text) {
    console.log('🎯 Procesiram:', text);
    const clean = text.toLowerCase().trim();
    const currentState = window.currentScreenState || '';
    
    // IZLAZ
    if (clean.includes('end') || clean.includes('izlaz') || clean.includes('exit')) {
        console.log('🚪 Izlaz');
        stopSimpleListening();
        if (typeof exitApp === 'function') exitApp();
        return;
    }
    
    // OK - ZAVRŠETAK
    if (clean === 'ok' || clean === 'okej' || clean.includes('ok') && clean.length < 5) {
        console.log('✅ OK - završetak');
        finishAndGoBack();
        return;
    }
    
    // PLUS - ČUVANJE
    if (clean === 'plus' || clean.includes('plus') && clean.length < 6) {
        console.log('💾 PLUS - čuvanje');
        saveCurrentProduct();
        return;
    }
    
    // UNOS - otvori ekran
// UNOS - otvori ekran
if (clean.includes('unos') || clean.includes('novi') || clean.includes('data') || clean === 'un') {
    console.log('📝 Otvaram unos');
    window.currentScreenState = 'dataEntry';
    
    // 🔥 DIREKTNO PRIKAŽI EKRAN ZA UNOS
    // Sakrij sve ekrane
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    // Pokaži ekran za unos
    const dataEntryScreen = document.getElementById('dataEntryScreen');
    if (dataEntryScreen) {
        dataEntryScreen.style.display = 'block';
        dataEntryScreen.classList.add('active');
        console.log('✅ DataEntryScreen prikazan');
    } else {
        console.error('❌ dataEntryScreen nije pronađen!');
        // Pokušaj sa drugim ID-om
        const altScreen = document.getElementById('addProductScreen');
        if (altScreen) {
            altScreen.style.display = 'block';
            altScreen.classList.add('active');
            console.log('✅ addProductScreen prikazan');
        }
    }
    
    // Pokušaj da pozoveš renderDataEntry ako postoji
    if (typeof renderDataEntry === 'function') {
        renderDataEntry('');
    } else if (typeof showDataEntry === 'function') {
        showDataEntry('');
    } else if (typeof openDataEntry === 'function') {
        openDataEntry('');
    }
    
    // Pokreni slušanje
    setTimeout(() => {
        startSimpleListening();
    }, 500);
    
    const status = document.getElementById('voiceStatus');
    if (status) {
        status.innerText = '🎤 Govorite proizvod...';
        status.style.color = '#FFD700';
    }
    return;
}
    
    // ZALIHE
    if (clean.includes('zalihe') || clean.includes('stanje') || clean.includes('inventory')) {
        console.log('📦 Zalihe');
        stopSimpleListening();
        window.currentScreenState = 'inventory';
        if (typeof renderInventory === 'function') renderInventory();
        return;
    }
    
    // SPISAK
    if (clean.includes('spisak') || clean.includes('lista') || clean.includes('shopping')) {
        console.log('🛒 Spisak');
        stopSimpleListening();
        window.currentScreenState = 'shopping';
        if (typeof renderShoppingList === 'function') renderShoppingList();
        return;
    }
    
    // AKO SMO NA UNOSU - PARSIRAJ PROIZVOD
    if (currentState === 'dataEntry') {
        // Proveri da li ima broj (količinu)
        const hasNumber = /\d+/.test(text);
        if (hasNumber && text.length > 3) {
            console.log('📝 Unos proizvoda:', text);
            const parsed = simpleParse(text);
            fillFields(parsed);
            
            const status = document.getElementById('voiceStatus');
            if (status) {
                status.innerText = `📦 ${parsed.product} (${parsed.quantity} ${parsed.unit})`;
                status.style.color = '#4CAF50';
            }
            return;
        }
    }
    
    // Ako nije prepoznato
    console.log('❌ Nije prepoznato:', text);
    const status = document.getElementById('voiceStatus');
    if (status) {
        status.innerText = `❌ Nije prepoznato: "${text}"`;
        status.style.color = '#f44336';
    }
}

// ============================================
// DUGMAD ZA RUČNU KONTROLU
// ============================================
function toggleListening() {
    if (isSimpleListening) {
        stopSimpleListening();
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.innerText = '⏹ Slušanje zaustavljeno';
            status.style.color = '#f44336';
        }
    } else {
        startSimpleListening();
    }
}

// ============================================
// IZVOZ
// ============================================
window.voiceCommand = processSimpleCommand;
window.startSimpleListening = startSimpleListening;
window.stopSimpleListening = stopSimpleListening;
window.toggleListening = toggleListening;
window.simpleParse = simpleParse;
window.fillFields = fillFields;
window.saveCurrentProduct = saveCurrentProduct;
window.finishAndGoBack = finishAndGoBack;

console.log('✅ JEDNOSTAVNA VOICE COMMANDS verzija učitana!');
console.log('🎤 Reci "UNOS" za otvaranje ekrana za unos');
console.log('🎤 Reci "Gril pile 1 komad 2 kile 7 meseci" za unos');
console.log('🎤 Reci "PLUS" za čuvanje');
console.log('🎤 Reci "OK" za završetak');
// ============================================
// FORSIRANO OTVARANJE UNOSA - RUČNO
// ============================================
function forceOpenEntry() {
    console.log('💪 FORSIRANO otvaranje unosa');
    
    // 1. Sakrij sve ekrane
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    // 2. Pokušaj da nađeš ekran za unos
    let entryScreen = document.getElementById('dataEntryScreen');
    if (!entryScreen) {
        entryScreen = document.getElementById('addProductScreen');
    }
    if (!entryScreen) {
        entryScreen = document.getElementById('entryScreen');
    }
    if (!entryScreen) {
        entryScreen = document.getElementById('productEntryScreen');
    }
    
    if (entryScreen) {
        entryScreen.style.display = 'block';
        entryScreen.classList.add('active');
        console.log('✅ Ekran za unos prikazan');
        
        // Fokusiraj polje za naziv
        setTimeout(() => {
            const productInput = document.getElementById('productInput');
            if (productInput) {
                productInput.focus();
                console.log('✅ Fokus na productInput');
            }
        }, 200);
    } else {
        console.error('❌ Nema ekrana za unos!');
        alert('Ekran za unos nije pronađen! Proverite HTML.');
    }
    
    // 3. Pokušaj render funkcije
    if (typeof renderDataEntry === 'function') {
        renderDataEntry('');
    }
    
    // 4. Pokreni slušanje
    setTimeout(() => {
        startSimpleListening();
    }, 300);
}

// Izvezi globalno
window.forceOpenEntry = forceOpenEntry;

console.log('💡 Upišite forceOpenEntry() u konzolu za ručno otvaranje unosa');

