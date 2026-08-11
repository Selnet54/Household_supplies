// ============================================
// VOICE COMMANDS - ČISTA VERZIJA (BEZ PLAVOG EKRANA)
// ============================================
console.log('🎤 voiceCommands.js - ČISTA VERZIJA');

window.voiceCommandProcessing = false;
let simpleRecognition = null;
let isSimpleListening = false;

function getCurrentLang() {
    return window.currentLanguage || localStorage.getItem('appLanguage') || 'sr';
}

// ============================================
// PARSIRANJE
// ============================================
function domacicaParser(text) {
    console.log('🧠 Parsiram:', text);
    
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
    if (clean.includes('zamrzivač') || clean.includes('zamrzivac') || clean.includes('freezer')) {
        result.skladiste = 'Zamrzivač 1';
    } else if (clean.includes('frižider') || clean.includes('frizider') || clean.includes('fridge')) {
        result.skladiste = 'Frižider';
    } else if (clean.includes('ostava') || clean.includes('pantry')) {
        result.skladiste = 'Ostava';
    }
    
    // Količina - KG
    const kgMatch = text.match(/(\d+)\s*(kg|kile|kilograma|kilogram)/i);
    if (kgMatch) {
        result.kolicina = parseInt(kgMatch[1]);
        result.jedinica = 'kg';
    }
    
    // Količina - KOMAD
    const komMatch = text.match(/(\d+)\s*(kom|komad|pcs|piece)/i);
    if (komMatch && !kgMatch) {
        result.kolicina = parseInt(komMatch[1]);
        result.jedinica = 'kom';
        result.pakovanje = komMatch[1] + ' komad';
    }
    
    // Količina - LITAR
    const lMatch = text.match(/(\d+)\s*(l|lit|litra|litara|liter)/i);
    if (lMatch && !kgMatch && !komMatch) {
        result.kolicina = parseInt(lMatch[1]);
        result.jedinica = 'l';
    }
    
    // Rok
    const mesMatch = text.match(/(\d+)\s*(meseci|mesec|mes|m|month)/i);
    if (mesMatch) {
        result.rok = parseInt(mesMatch[1]);
    }
    
    // Ime proizvoda - očisti
    let ime = text;
    ime = ime.replace(/\d+\s*(kg|kile|kilograma|kilogram|kom|komad|pcs|piece|l|lit|litra|litara|liter|meseci|mesec|mes|m|month)/gi, '');
    ime = ime.replace(/zamrzivač|zamrzivac|freezer|frižider|frizider|fridge|ostava|pantry/gi, '');
    ime = ime.replace(/[0-9]/g, '');
    ime = ime.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '');
    ime = ime.replace(/\s+/g, ' ').trim();
    
    // Popravi uobičajene greške
    ime = ime.replace(/gripile/gi, 'Gril pile');
    ime = ime.replace(/pilece/gi, 'Pileće');
    ime = ime.replace(/belo meso/gi, 'Belo meso');
    ime = ime.replace(/crveno meso/gi, 'Crveno meso');
    
    if (ime && ime.length > 0) {
        result.naziv = ime;
    }
    
    console.log('✅ Parsirano:', result);
    return result;
}

// ============================================
// DIREKTNO POPUNJAVANJE POLJA
// ============================================
function direktanUnos(text) {
    console.log('⚡ DIREKTAN UNOS:', text);
    
    const parsed = domacicaParser(text);
    console.log('📦 Parsirano:', parsed);
    
    // Pronađi polja
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const storageSelect = document.getElementById('storageSelect');
    const unitSelect = document.getElementById('unitSelect');
    
    let popunjeno = 0;
    
    // Naziv
    if (productInput && parsed.naziv) {
        productInput.value = parsed.naziv;
        productInput.dispatchEvent(new Event('input', { bubbles: true }));
        productInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Naziv:', parsed.naziv);
        popunjeno++;
    }
    
    // Pakovanje
    if (pieceInput && parsed.pakovanje) {
        pieceInput.value = parsed.pakovanje;
        pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('✅ Pakovanje:', parsed.pakovanje);
        popunjeno++;
    }
    
    // Količina
    if (quantityInput && parsed.kolicina) {
        quantityInput.value = parsed.kolicina;
        quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('✅ Količina:', parsed.kolicina);
        popunjeno++;
    }
    
    // Rok
    if (shelfLifeInput && parsed.rok) {
        shelfLifeInput.value = parsed.rok;
        shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
        shelfLifeInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Rok:', parsed.rok);
        popunjeno++;
    }
    
    // Skladište
    if (storageSelect && parsed.skladiste) {
        let found = false;
        for (let opt of storageSelect.options) {
            if (opt.value === parsed.skladiste || opt.text.includes(parsed.skladiste)) {
                storageSelect.value = opt.value;
                found = true;
                break;
            }
        }
        if (!found && storageSelect.options.length > 0) {
            storageSelect.value = storageSelect.options[0].value;
        }
        storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Skladište:', parsed.skladiste);
        popunjeno++;
    }
    
    // Jedinica
    if (unitSelect && parsed.jedinica) {
        let found = false;
        for (let opt of unitSelect.options) {
            if (opt.value === parsed.jedinica) {
                unitSelect.value = opt.value;
                found = true;
                break;
            }
        }
        if (!found && unitSelect.options.length > 0) {
            unitSelect.value = unitSelect.options[0].value;
        }
        unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Jedinica:', parsed.jedinica);
        popunjeno++;
    }
    
    // Ažuriraj datum
    if (typeof updateExpiryDate === 'function') {
        updateExpiryDate();
    }
    
    // Status
    const status = document.getElementById('voiceStatus');
    if (status) {
        if (popunjeno > 0) {
            status.innerText = `✅ ${parsed.naziv} (${parsed.kolicina} ${parsed.jedinica}, rok: ${parsed.rok} meseci)`;
            status.style.color = '#4CAF50';
            status.style.background = 'rgba(76, 175, 80, 0.2)';
        } else {
            status.innerText = `⚠️ Nema polja za popunjavanje. Otvorite tab "Unos".`;
            status.style.color = '#ff9800';
            status.style.background = 'rgba(255, 152, 0, 0.2)';
        }
        status.style.padding = '10px';
        status.style.borderRadius = '8px';
    }
    
    if (popunjeno === 0) {
        console.log('⚠️ Nema polja! Otvorite tab "Unos" i probajte ponovo.');
    }
    
    console.log(`🎉 Popunjeno ${popunjeno} polja!`);
    return parsed;
}

// ============================================
// OTVARANJE TABA ZA UNOS
// ============================================
function otvoriUnos() {
    console.log('📱 Otvaram tab za unos...');
    
    // Klikni na tab za unos
    const tab = document.querySelector('[data-tab="dataEntry"]');
    if (tab) {
        tab.click();
        console.log('✅ Kliknut tab "Unos"');
    } else {
        console.error('❌ Nema taba za unos!');
    }
    
    // Pokaži tab content
    const content = document.getElementById('dataEntry');
    if (content) {
        content.classList.add('active');
        content.style.display = 'block';
        console.log('✅ Prikazan sadržaj unosa');
    }
    
    // Pokušaj render funkciju
    if (typeof renderDataEntry === 'function') {
        renderDataEntry('');
    }
}

// ============================================
// SLUŠANJE
// ============================================
function startSimpleListening() {
    if (isSimpleListening) {
        console.log('⚠️ Već slušam');
        return;
    }
    
    console.log('🎤 Pokrećem slušanje...');
    isSimpleListening = true;
    
    // Zaustavi postojeće
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
        console.log('🗣️ Čuo sam:', text);
        window.voiceCommandProcessing = false;
        processSimpleCommand(text);
    };
    
    rec.onerror = function(event) {
        console.log('⚠️ Greška:', event.error);
        if (event.error === 'not-allowed') {
            alert('📱 Dozvolite pristup mikrofonu!');
            isSimpleListening = false;
        }
        if (isSimpleListening) {
            setTimeout(() => {
                try { rec.start(); } catch(e) {}
            }, 100);
        }
    };
    
    rec.onend = function() {
        console.log('🔄 Slušanje završeno');
        if (isSimpleListening) {
            setTimeout(() => {
                try { 
                    rec.start();
                    console.log('🔄 Restart slušanja');
                } catch(e) {}
            }, 200);
        }
    };
    
    try {
        rec.start();
        window.recognition = rec;
        simpleRecognition = rec;
        console.log('✅ Slušam!');
        
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.innerText = '🎤 Slušam... Govorite podatke';
            status.style.color = '#FFD700';
        }
    } catch(e) {
        console.error('❌ Greška:', e);
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
}

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
// OBRADA KOMANDI
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
    if (clean === 'ok' || clean === 'okej' || (clean.includes('ok') && clean.length < 5)) {
        console.log('✅ OK');
        stopSimpleListening();
        if (typeof finishAndGoBack === 'function') {
            finishAndGoBack();
        } else if (typeof finishDataEntry === 'function') {
            finishDataEntry();
        }
        return;
    }
    
    // PLUS - ČUVANJE
    if (clean === 'plus' || (clean.includes('plus') && clean.length < 6)) {
        console.log('💾 PLUS');
        if (typeof saveCurrentProduct === 'function') {
            saveCurrentProduct();
        } else if (typeof saveProduct === 'function') {
            saveProduct();
        }
        return;
    }
    
    // UNOS - OTVORI TAB
    if (clean.includes('unos') || clean.includes('novi') || clean === 'un') {
        console.log('📝 Otvaram unos');
        window.currentScreenState = 'dataEntry';
        otvoriUnos();
        setTimeout(() => {
            startSimpleListening();
        }, 500);
        return;
    }
    
    // ZALIHE
    if (clean.includes('zalihe') || clean.includes('stanje') || clean.includes('inventory')) {
        console.log('📦 Zalihe');
        stopSimpleListening();
        window.currentScreenState = 'inventory';
        // Klikni na tab
        const tab = document.querySelector('[data-tab="inventory"]');
        if (tab) tab.click();
        if (typeof renderInventory === 'function') renderInventory();
        return;
    }
    
    // SPISAK
    if (clean.includes('spisak') || clean.includes('lista') || clean.includes('shopping')) {
        console.log('🛒 Spisak');
        stopSimpleListening();
        window.currentScreenState = 'shopping';
        const tab = document.querySelector('[data-tab="shopping"]');
        if (tab) tab.click();
        if (typeof renderShoppingList === 'function') renderShoppingList();
        return;
    }
    
    // AKO SMO NA UNOSU - DIREKTAN UNOS
    if (currentState === 'dataEntry') {
        if (clean === 'plus' || clean === 'ok' || clean === 'okej') {
            return;
        }
        if (text.length > 2) {
            console.log('📦 Unos proizvoda:', text);
            direktanUnos(text);
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
// ČUVANJE PROIZVODA
// ============================================
function saveCurrentProduct() {
    console.log('💾 Čuvam proizvod');
    if (typeof saveProduct === 'function') {
        saveProduct();
    }
    
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
// ZAVRŠETAK UNOSA
// ============================================
function finishAndGoBack() {
    console.log('🏁 Završavam unos');
    if (typeof saveProduct === 'function') {
        saveProduct();
    }
    stopSimpleListening();
    window.currentScreenState = 'inventory';
    
    const tab = document.querySelector('[data-tab="inventory"]');
    if (tab) tab.click();
    if (typeof renderInventory === 'function') renderInventory();
    
    const status = document.getElementById('voiceStatus');
    if (status) {
        status.innerText = '✅ Unos završen!';
        status.style.color = '#4CAF50';
    }
}

// ============================================
// IZVOZ
// ============================================
window.voiceCommand = processSimpleCommand;
window.startSimpleListening = startSimpleListening;
window.stopSimpleListening = stopSimpleListening;
window.toggleListening = toggleListening;
window.direktanUnos = direktanUnos;
window.otvoriUnos = otvoriUnos;
window.domacicaParser = domacicaParser;
window.saveCurrentProduct = saveCurrentProduct;
window.finishAndGoBack = finishAndGoBack;

console.log('✅ voiceCommands.js - ČISTA VERZIJA učitana!');
console.log('🎤 Reci "UNOS" za otvaranje taba za unos');
console.log('🎤 Reci "Gril pile 2 kile 7 meseci zamrzivač" za unos');
console.log('🎤 Reci "PLUS" za čuvanje');
console.log('🎤 Reci "OK" za završetak');
console.log('💡 U konzoli: direktanUnos("Gril pile 2 kile 7 meseci zamrzivač")');
