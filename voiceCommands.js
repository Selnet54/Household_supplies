// ============================================
// VOICE COMMANDS - KONAČNO RADNA VERZIJA
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
        
        // DETEKCIJA END - ODMAH REAGUJ
        if (/\b(end|kraj|stop|enter)\b/i.test(activeBuffer)) {
            console.log('✅ END detektovan!');
            
            // Izdvoj tekst pre "end"
            const parts = activeBuffer.split(/\b(end|kraj|stop|enter)\b/i);
            const itemText = parts[0].trim();
            
            if (itemText.length > 2) {
                processVoiceInput(itemText);
            }
            
            // ZAUSTAVI PREPOZNAVANJE
            stopVoiceRecognition();
            
            // OTVORI ZALIHE NAKON KAŠNJENJA
            setTimeout(function() {
                otvoriZaliheDirektno();
            }, 800);
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

// ===== OTVARANJE ZALIHA - PRAVA INTEGRACIJA SA SCRIPT.JS =====
function otvoriZaliheDirektno() {
    console.log('📦 Otvaranje zaliha...');
    
    // SAKRIJ VOICE MENU
    hideVoiceMenu();
    
    // DIREKTNO POZIVANJE renderInventory() IZ SCRIPT.JS
    if (typeof renderInventory === 'function') {
        console.log('✅ Pozivam renderInventory()');
        renderInventory();
        return;
    }
    
    // REZERVNA METODA
    console.log('⚠️ renderInventory nije definisan, pokušavam showScreen');
    if (typeof showScreen === 'function') {
        showScreen('mainScreen');
        setTimeout(function() {
            if (typeof renderInventory === 'function') {
                renderInventory();
            }
        }, 200);
    }
}

// ===== PARSIRANJE =====
function parseVoiceInput(text) {
    console.log('🔍 Parsiranje:', text);
    
    const data = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
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
    
    // Ukloni "unos", "start" itd.
    let clean = text.replace(/^(unos|unesi|dodaj|start)\s*/i, '');
    let words = clean.toLowerCase().split(/\s+/);
    
    let nameParts = [];
    let i = 0;
    let foundQuantity = false;
    let foundUnit = false;
    let foundStorage = false;
    
    while (i < words.length) {
        let w = words[i];
        
        // Preskoči "mesec"
        if (['mesec', 'meseca', 'meseci', 'mjeseci', 'month', 'months'].includes(w)) {
            i++;
            continue;
        }
        
        // Skladište
        if (storageMap[w] && !foundStorage) {
            data.storage = storageMap[w];
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
            foundStorage = true;
            i++;
            continue;
        }
        
        // Jedinica
        if (unitMap[w] && !foundUnit) {
            data.unit = unitMap[w];
            foundUnit = true;
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
        
        if (num !== null && !foundQuantity) {
            data.quantity = num;
            data.piece = num;
            foundQuantity = true;
            i++;
            continue;
        } else if (num !== null && foundQuantity && !foundUnit) {
            // Ovo je verovatno rok trajanja
            data.shelf_life = num;
            i++;
            continue;
        } else if (num !== null && foundUnit) {
            // Ovo je verovatno rok trajanja
            data.shelf_life = num;
            i++;
            continue;
        }
        
        // Dodaj u naziv (samo ako nije specijalna reč)
        if (!storageMap[w] && !unitMap[w] && !numberWords[w] && isNaN(w)) {
            nameParts.push(words[i]);
        }
        
        i++;
    }
    
    // Ako nema naziva, uzmi sve reči koje nisu brojevi
    if (nameParts.length === 0) {
        nameParts = words.filter(w => isNaN(w) && !storageMap[w] && !unitMap[w] && !numberWords[w]);
    }
    
    data.product_name = nameParts.join(' ') || 'Proizvod';
    console.log('📝 Parsirano:', data);
    return data;
}

// ===== GLAVNA OBRADA =====
function processVoiceInput(text) {
    console.log('🔄 Obrada:', text);
    
    const data = parseVoiceInput(text);
    
    if (!data.product_name || data.product_name === 'Proizvod' || data.product_name.length < 2) {
        console.log('❌ Nevalidan unos');
        return false;
    }
    
    // SAKRIJ VOICE MENU
    hideVoiceMenu();
    
    // OTVORI MAIN SCREEN
    if (typeof showScreen === 'function') {
        showScreen('mainScreen');
    }
    
    // POZOVI renderDataEntry IZ SCRIPT.JS
    if (typeof renderDataEntry === 'function') {
        renderDataEntry(data.product_name);
        
        // POPUNI FORMU NAKON MALO KAŠNJENJA
        setTimeout(function() {
            popuniFormuPodacima(data);
            
            // SAČUVAJ NAKON JOŠ MALO KAŠNJENJA
            setTimeout(function() {
                if (typeof saveProduct === 'function') {
                    saveProduct();
                    console.log('✅ saveProduct() pozvan');
                } else {
                    const saveBtn = document.querySelector('.btn-save');
                    if (saveBtn) {
                        saveBtn.click();
                        console.log('✅ Kliknuto dugme');
                    }
                }
            }, 400);
        }, 300);
    } else {
        console.log('❌ renderDataEntry nije definisan');
        return false;
    }
    
    return true;
}

// ===== POPUNI FORMU =====
function popuniFormuPodacima(data) {
    console.log('📝 Popunjavanje forme:', data);
    
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
        for (let opt of storageSelect.options) {
            if (opt.value === data.storage || opt.text.includes(data.storage)) {
                opt.selected = true;
                storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }
    
    if (typeof updateExpiryDate === 'function') {
        updateExpiryDate();
    }
    
    console.log('✅ Forma popunjena');
}

// ===== POVRATAK =====
function goBackFromVoice() {
    stopVoiceRecognition();
    if (typeof showScreen === 'function') {
        showScreen('choiceScreen');
    }
}

// ===== GLOBALNE FUNKCIJE =====
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.otvoriZaliheDirektno = otvoriZaliheDirektno;
window.processVoiceInput = processVoiceInput;
window.parseVoiceInput = parseVoiceInput;

console.log('✅ Voice Commands - KONAČNO RADNA VERZIJA aktivirana!');
