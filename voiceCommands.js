// ============================================
// VOICE COMMANDS - PRAVA INTEGRACIJA SA SCRIPT.JS
// ============================================

let activeBuffer = ''; 
let recognition = null;

// ===== SAKRIVANJE VOICE MENIJA =====
function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
    }
}

// ===== POKRETAČ ZA GLASOVNI UNOS =====
function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        if (typeof showModernAlert === 'function') {
            showModernAlert('Greška', 'Vaš pretraživač ne podržava glasovne komande.', '❌');
        }
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

    const statusEl = document.getElementById('voiceStatus');

    recognition.onstart = function() {
        console.log('🎤 Glasovno prepoznavanje pokrenuto');
        if (statusEl) {
            statusEl.textContent = '🎤 Slušam... (recite "end" za kraj)';
            statusEl.style.color = '#2196F3';
        }
        activeBuffer = '';
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
            console.log('🗣️ BAFER:', activeBuffer);
        }
        
        const currentDisplay = activeBuffer + (interimText ? ' ' + interimText : '');
        if (statusEl) {
            statusEl.textContent = `🎤: "${currentDisplay}"`;
            statusEl.style.color = '#FFD700';
        }
        
        // DETEKCIJA END
        if (/\b(end|kraj|stop|enter)\b/i.test(activeBuffer)) {
            console.log('✅ END detektovan!');
            
            // Izdvoj tekst pre "end"
            const parts = activeBuffer.split(/\b(end|kraj|stop|enter)\b/i);
            const itemText = parts[0].trim();
            
            if (itemText.length > 2) {
                // DIREKTNO PROCESIRANJE
                processVoiceInput(itemText);
            }
            
            // Zaustavi i otvori zalihe
            stopVoiceRecognition();
            setTimeout(() => {
                otvoriZaliheDirektno();
            }, 600);
        }
    };

    recognition.onerror = function(event) {
        console.log('⚠️ Greška:', event.error);
        if (statusEl) {
            statusEl.textContent = `❌ Greška: ${event.error}`;
            statusEl.style.color = '#f44336';
        }
    };

    recognition.onend = function() {
        console.log('🎤 Prepoznavanje završeno.');
        if (statusEl) {
            statusEl.textContent = '⏸️ Prepoznavanje zaustavljeno';
            statusEl.style.color = '#aaa';
        }
    };

    try {
        recognition.start();
    } catch(e) {
        console.log('❌ Greška:', e);
    }
}

// ===== ZAUSTAVI PREPOZNAVANJE =====
function stopVoiceRecognition() {
    if (recognition) {
        try {
            recognition.stop();
            recognition = null;
        } catch(e) {}
    }
    activeBuffer = '';
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '⏸️ Zaustavljeno';
        statusEl.style.color = '#aaa';
    }
}

// ===== OTVARANJE ZALIHA - PRAVA INTEGRACIJA =====
function otvoriZaliheDirektno() {
    console.log('📦 Otvaranje zaliha...');
    
    hideVoiceMenu();
    
    // DIREKTNO POZIVANJE renderInventory() iz script.js
    if (typeof renderInventory === 'function') {
        renderInventory();
        console.log('✅ Otvoreno preko renderInventory()');
        return;
    }
    
    // Ako nema renderInventory, probaj sa showScreen
    if (typeof showScreen === 'function') {
        showScreen('mainScreen');
        // Nakon što prikažemo mainScreen, pozovemo renderInventory
        setTimeout(() => {
            if (typeof renderInventory === 'function') {
                renderInventory();
            }
        }, 100);
        console.log('✅ Otvoreno preko showScreen + renderInventory');
        return;
    }
    
    // Rezervna metoda - direktna DOM manipulacija
    const mainScreen = document.getElementById('mainScreen');
    const invScreen = document.getElementById('inventoryScreen');
    const voiceScreen = document.getElementById('voiceMenuScreen');
    const choiceScreen = document.getElementById('choiceScreen');
    
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    if (invScreen) {
        invScreen.style.display = 'none';
    }
    if (voiceScreen) {
        voiceScreen.style.display = 'none';
    }
    if (choiceScreen) {
        choiceScreen.style.display = 'none';
    }
    
    // Pokušaj da renderuješ inventory
    if (typeof renderInventory === 'function') {
        setTimeout(() => {
            renderInventory();
        }, 100);
    }
    
    console.log('✅ Otvoren mainScreen');
}

// ===== PARSIRANJE GLASOVNE KOMANDE =====
function parseVoiceInput(text) {
    const data = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    // Mape za prevod
    const unitMap = {
        'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg',
        'gram': 'g', 'grama': 'g', 'g': 'g',
        'litar': 'l', 'litara': 'l', 'l': 'l',
        'komad': 'kom', 'komada': 'kom', 'kom': 'kom',
        'paket': 'pak', 'paketa': 'pak', 'pak': 'pak',
        'kutija': 'kutija'
    };
    
    const storageMap = {
        'zamrzivač': 'Zamrzivač 1',
        'zamrzivac': 'Zamrzivač 1',
        'frižider': 'Frižider',
        'frizider': 'Frižider',
        'ostava': 'Ostava',
        'špajz': 'Ostava'
    };
    
    const numberWords = {
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
        'dvanaest': '12'
    };
    
    // Ukloni "unos" i slično
    let clean = text.replace(/^(unos|unesi|dodaj|start)\s*/i, '');
    let words = clean.toLowerCase().split(/\s+/);
    
    let nameParts = [];
    let i = 0;
    let state = 'name';
    
    while (i < words.length) {
        let w = words[i];
        
        // Preskoči "mesec" reči
        if (['mesec', 'meseca', 'meseci', 'mjeseci', 'month', 'months'].includes(w)) {
            i++;
            continue;
        }
        
        // Skladište
        if (storageMap[w]) {
            data.storage = storageMap[w];
            // Proveri da li sledi broj
            if (i + 1 < words.length) {
                let next = words[i + 1];
                if (!isNaN(next) && next >= '1' && next <= '9') {
                    data.storage = `Zamrzivač ${next}`;
                    i++;
                } else if (numberWords[next]) {
                    data.storage = `Zamrzivač ${numberWords[next]}`;
                    i++;
                }
            }
            state = 'done';
            i++;
            continue;
        }
        
        // Jedinica
        if (unitMap[w]) {
            data.unit = unitMap[w];
            state = 'unit';
            i++;
            continue;
        }
        
        // Broj
        let num = null;
        if (!isNaN(w) && w !== '') {
            num = w;
        } else if (numberWords[w]) {
            num = numberWords[w];
        }
        
        if (num !== null && state === 'name') {
            data.quantity = num;
            data.piece = num;
            state = 'unit';
            i++;
            continue;
        } else if (num !== null && state === 'unit') {
            data.shelf_life = num;
            state = 'storage';
            i++;
            continue;
        }
        
        // Dodaj u naziv
        if (state === 'name') {
            nameParts.push(words[i]);
        }
        
        i++;
    }
    
    data.product_name = nameParts.join(' ') || 'Proizvod';
    console.log('📝 Parsirano:', data);
    return data;
}

// ===== GLAVNA FUNKCIJA ZA OBRADU =====
function processVoiceInput(text) {
    console.log('🔄 Obrada:', text);
    
    const data = parseVoiceInput(text);
    
    if (!data.product_name || data.product_name === 'Proizvod') {
        console.log('❌ Nevalidan unos');
        return false;
    }
    
    // Sakrij voice menu
    hideVoiceMenu();
    
    // Otvori mainScreen i renderDataEntry
    if (typeof showScreen === 'function') {
        showScreen('mainScreen');
    }
    
    // DIREKTNO POZIVANJE renderDataEntry iz script.js
    if (typeof renderDataEntry === 'function') {
        // Prvo otvori data entry sa nazivom proizvoda
        renderDataEntry(data.product_name);
        
        // Zatim popuni ostala polja
        setTimeout(() => {
            popuniFormuPodacima(data);
            
            // Automatski sačuvaj
            setTimeout(() => {
                direktnoSacuvaj();
            }, 400);
        }, 300);
    } else {
        console.log('❌ renderDataEntry nije definisan');
        return false;
    }
    
    return true;
}

// ===== POPUNJAVANJE FORME =====
function popuniFormuPodacima(data) {
    console.log('📝 Popunjavanje forme sa:', data);
    
    // Popuni input polja
    const productInput = document.getElementById('productInput');
    if (productInput) {
        productInput.value = data.product_name;
        productInput.dispatchEvent(new Event('input', { bubbles: true }));
        productInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    const pieceInput = document.getElementById('pieceInput');
    if (pieceInput) {
        pieceInput.value = data.piece;
        pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    const quantityInput = document.getElementById('quantityInput');
    if (quantityInput) {
        quantityInput.value = data.quantity;
        quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    if (shelfLifeInput) {
        shelfLifeInput.value = data.shelf_life;
        shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Popuni select polja
    const unitSelect = document.getElementById('unitSelect');
    if (unitSelect) {
        for (let opt of unitSelect.options) {
            if (opt.value === data.unit) {
                opt.selected = true;
                unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }
    
    const storageSelect = document.getElementById('storageSelect');
    if (storageSelect) {
        // Pronađi opciju po vrednosti ili tekstu
        for (let opt of storageSelect.options) {
            const optValue = opt.value;
            const optText = opt.text.toLowerCase();
            const storageValue = data.storage;
            const storageLower = storageValue.toLowerCase();
            
            if (optValue === storageValue || 
                optText.includes(storageLower) || 
                storageLower.includes(optValue.toLowerCase())) {
                opt.selected = true;
                storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }
    
    // Ažuriraj datum isteka
    if (typeof updateExpiryDate === 'function') {
        updateExpiryDate();
    }
    
    console.log('✅ Forma popunjena');
}

// ===== DIREKTNO ČUVANJE - POZIVA SAVEPRODUCT IZ SCRIPT.JS =====
function direktnoSacuvaj() {
    console.log('💾 Čuvanje preko saveProduct()...');
    
    // DIREKTNO POZIVANJE saveProduct() iz script.js
    if (typeof saveProduct === 'function') {
        saveProduct();
        console.log('✅ saveProduct() pozvan');
        
        // Osveži prikaz unosa
        setTimeout(() => {
            if (typeof prikaziSveUnose === 'function') {
                prikaziSveUnose();
            }
        }, 200);
        
        return true;
    }
    
    // Ako saveProduct ne postoji, probaj sa klikom na dugme
    const saveBtn = document.querySelector('.btn-save');
    if (saveBtn) {
        saveBtn.click();
        console.log('✅ Kliknuto dugme .btn-save');
        return true;
    }
    
    console.log('❌ Nije pronađena funkcija za čuvanje');
    return false;
}

// ===== GLOBALNE FUNKCIJE =====
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.otvoriZaliheDirektno = otvoriZaliheDirektno;
window.processVoiceInput = processVoiceInput;
window.parseVoiceInput = parseVoiceInput;

console.log('✅ Voice Commands - PRAVA INTEGRACIJA aktivirana!');
