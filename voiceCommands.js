// ============================================
// VOICE COMMANDS - POPRAVKA PARSERA
// ============================================

let activeBuffer = ''; 
let recognition = null;

// ===== SAKRIVANJE =====
function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
    }
}

// ===== POKRETAČ =====
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
    recognition.lang = 'sr-RS';
    recognition.continuous = true;
    recognition.interimResults = true;

    const statusEl = document.getElementById('voiceStatus');

    recognition.onstart = function() {
        console.log('🎤 Slušam...');
        if (statusEl) {
            statusEl.textContent = '🎤 Slušam... (recite "end" za kraj)';
            statusEl.style.color = '#2196F3';
        }
        activeBuffer = '';
    };

    recognition.onresult = function(event) {
        let finalText = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                const transcript = event.results[i][0].transcript.trim();
                if (transcript) {
                    finalText += (finalText ? ' ' : '') + transcript;
                }
            }
        }
        
        if (finalText) {
            activeBuffer += (activeBuffer ? ' ' : '') + finalText;
            console.log('🗣️ BAFER:', activeBuffer);
            
            if (statusEl) {
                statusEl.textContent = `🎤: "${activeBuffer}"`;
                statusEl.style.color = '#FFD700';
            }
        }
        
        // KADA ČUJE END
        if (activeBuffer.toLowerCase().includes('end')) {
            console.log('✅ END DETEKTOVAN!');
            
            // UZMI CEO TEKST PRE "end"
            const fullText = activeBuffer.replace(/end.*$/i, '').trim();
            console.log('📝 CEO TEKST:', fullText);
            
            if (fullText.length > 3) {
                // POZOVI POSTOJEĆU FUNKCIJU SA CEO TEKST
                processAndSaveItem(fullText);
            }
            
            // ZAUSTAVI
            stopVoiceRecognition();
            
            // OTVORI ZALIHE
            setTimeout(function() {
                otvoriZaliheEkran();
            }, 500);
        }
    };

    recognition.onerror = function(event) {
        console.log('❌ Greška:', event.error);
        if (statusEl) {
            statusEl.textContent = `❌ Greška: ${event.error}`;
            statusEl.style.color = '#f44336';
        }
    };

    recognition.onend = function() {
        console.log('⏹️ Prepoznavanje završeno');
        if (statusEl) {
            statusEl.textContent = '⏸️ Zaustavljeno';
            statusEl.style.color = '#999';
        }
    };

    try {
        recognition.start();
    } catch(e) {
        console.log('❌', e);
    }
}

// ===== ZAUSTAVI =====
function stopVoiceRecognition() {
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    activeBuffer = '';
}

// ===== OTVORI ZALIHE =====
function otvoriZaliheEkran() {
    console.log('📦 Otvaranje zaliha...');
    hideVoiceMenu();
    
    if (typeof renderInventory === 'function') {
        renderInventory();
        console.log('✅ renderInventory pozvan');
    } else if (typeof showScreen === 'function') {
        showScreen('mainScreen');
        setTimeout(function() {
            if (typeof renderInventory === 'function') {
                renderInventory();
            }
        }, 300);
    }
}

// ===== POVRATAK =====
function goBackFromVoice() {
    stopVoiceRecognition();
    if (typeof showScreen === 'function') {
        showScreen('choiceScreen');
    }
}

// ===== POPRAVLJENI PARSER =====
function parseVoiceDataEntry(command) {
    console.log('🔧 PARSIRAM:', command);
    
    const result = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    // MAPE
    const unitMap = {
        'kg': 'kg', 'kilogram': 'kg', 'kilograma': 'kg',
        'g': 'g', 'gram': 'g', 'grama': 'g',
        'l': 'l', 'litar': 'l', 'litara': 'l',
        'ml': 'ml', 'mililitar': 'ml',
        'kom': 'kom', 'komad': 'kom', 'komada': 'kom',
        'pak': 'pak', 'paket': 'pak', 'paketa': 'pak'
    };
    
    const storageMap = {
        'zamrzivač': 'Zamrzivač 1',
        'zamrzivac': 'Zamrzivač 1',
        'frižider': 'Frižider',
        'frizider': 'Frižider',
        'ostava': 'Ostava'
    };
    
    const numberMap = {
        'jedan': '1', 'jedna': '1', 'jedno': '1',
        'dva': '2', 'dve': '2',
        'tri': '3',
        'četiri': '4', 'cetiri': '4',
        'pet': '5',
        'šest': '6', 'sest': '6',
        'sedam': '7',
        'osam': '8',
        'devet': '9',
        'deset': '10'
    };
    
    // 1. UKLONI REČI ZA UNOS
    let words = command.toLowerCase().split(/\s+/);
    words = words.filter(w => !['unos', 'unesi', 'dodaj', 'start', 'plus', 'i', 'pa', 'onda'].includes(w));
    
    console.log('📝 REČI:', words);
    
    if (words.length === 0) {
        result.product_name = command;
        return result;
    }
    
    // 2. PRONAĐI SKLADIŠTE (ZADNJE)
    let storageIndex = -1;
    for (let i = 0; i < words.length; i++) {
        if (storageMap[words[i]]) {
            storageIndex = i;
            result.storage = storageMap[words[i]];
            // Proveri da li sledi broj
            if (i + 1 < words.length && !isNaN(words[i + 1]) && words[i + 1] >= '1' && words[i + 1] <= '9') {
                result.storage = `Zamrzivač ${words[i + 1]}`;
                words.splice(i + 1, 1);
            }
            words.splice(i, 1);
            break;
        }
    }
    
    // 3. PRONAĐI JEDINICU
    let unitIndex = -1;
    for (let i = 0; i < words.length; i++) {
        if (unitMap[words[i]]) {
            unitIndex = i;
            result.unit = unitMap[words[i]];
            // Traži broj PRE jedinice
            if (i > 0) {
                const prev = words[i - 1];
                if (!isNaN(prev)) {
                    result.quantity = prev;
                    result.piece = prev;
                    words.splice(i - 1, 1);
                    i--;
                } else if (numberMap[prev]) {
                    result.quantity = numberMap[prev];
                    result.piece = numberMap[prev];
                    words.splice(i - 1, 1);
                    i--;
                }
            }
            words.splice(i, 1);
            break;
        }
    }
    
    // 4. PRONAĐI ROK (broj)
    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (!isNaN(w) && w >= '1' && w <= '99') {
            result.shelf_life = w;
            words.splice(i, 1);
            // Ukloni "meseci"
            if (i < words.length && ['mesec', 'meseca', 'meseci', 'mjeseci'].includes(words[i])) {
                words.splice(i, 1);
            }
            break;
        } else if (numberMap[w]) {
            result.shelf_life = numberMap[w];
            words.splice(i, 1);
            if (i < words.length && ['mesec', 'meseca', 'meseci', 'mjeseci'].includes(words[i])) {
                words.splice(i, 1);
            }
            break;
        }
    }
    
    // 5. UKLONI SVE BROJEVE
    words = words.filter(w => {
        if (!isNaN(w)) return false;
        if (numberMap[w]) return false;
        return true;
    });
    
    // 6. ONO ŠTO OSTANE JE NAZIV
    result.product_name = words.join(' ') || command;
    
    console.log('✅ PARSIRANO:', result);
    return result;
}

// ===== OBRADA I ČUVANJE =====
function processAndSaveItem(command) {
    console.log('🔄 Procesiranje:', command);
    
    const data = parseVoiceDataEntry(command);
    
    if (!data.product_name || data.product_name.length < 2) {
        console.log('❌ Nevalidan naziv');
        if (typeof showModernAlert === 'function') {
            showModernAlert('Greška', 'Nije prepoznat naziv proizvoda.', '❌');
        }
        return false;
    }
    
    // SAKRIJ VOICE MENU
    hideVoiceMenu();
    
    // OTVORI MAIN SCREEN
    if (typeof showScreen === 'function') {
        showScreen('mainScreen');
    }
    
    // POPUNI FORMU
    if (typeof renderDataEntry === 'function') {
        renderDataEntry(data.product_name);
        
        setTimeout(function() {
            popuniFormu(data);
            
            // SAČUVAJ
            setTimeout(function() {
                if (typeof saveProduct === 'function') {
                    saveProduct();
                    console.log('✅ saveProduct() pozvan');
                } else {
                    const btn = document.querySelector('.btn-save');
                    if (btn) btn.click();
                }
            }, 400);
        }, 300);
    }
    
    return true;
}

// ===== POPUNI FORMU =====
function popuniFormu(data) {
    console.log('📝 Popunjavanje:', data);
    
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
            if (opt.value === data.storage) {
                opt.selected = true;
                storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }
    
    if (typeof updateExpiryDate === 'function') {
        updateExpiryDate();
    }
}

// ===== GLOBALNE FUNKCIJE =====
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.otvoriZaliheEkran = otvoriZaliheEkran;
window.processAndSaveItem = processAndSaveItem;
window.parseVoiceDataEntry = parseVoiceDataEntry;

console.log('✅ Voice Commands - POPRAVLJEN PARSER aktiviran!');
