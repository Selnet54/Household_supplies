// ============================================
// VOICE COMMANDS - KOMPLETNA VERZIJA
// ============================================
console.log('🎤 voiceCommands.js je učitan!');

// ===== STANJE =====
let voiceInputActive = false;
let voiceRecognitionInstance = null;

function getCurrentLang() {
    return window.currentLanguage || localStorage.getItem('appLanguage') || 'sr';
}

// ===== PARSIRANJE GLASOVNOG UNOSA =====
function parseVoiceInput(text) {
    console.log('🔍 Parsiram:', text);
    
    const result = {
        product: '',
        piece: '1',
        quantity: 1,
        unit: 'kg',
        shelfLife: 12,
        storage: 'Zamrzivač 1'
    };
    
    let cleanText = text.toLowerCase().trim();
    
    // Mapa za brojeve slovima
    const numberMap = {
        'jedan': '1', 'jedna': '1', 'jedno': '1',
        'dva': '2', 'dvije': '2', 'dve': '2',
        'tri': '3', 'četiri': '4', 'cetiri': '4',
        'pet': '5', 'šest': '6', 'sedam': '7',
        'osam': '8', 'devet': '9', 'deset': '10'
    };
    
    for (let [word, number] of Object.entries(numberMap)) {
        cleanText = cleanText.replace(new RegExp('\\b' + word + '\\b', 'g'), number);
    }
    
    // 1. MESTO SKLADIŠTENJA
    const storageMap = {
        'zamrzivač 1': 'Zamrzivač 1',
        'zamrzivač1': 'Zamrzivač 1',
        'zamrzivač 2': 'Zamrzivač 2',
        'zamrzivač2': 'Zamrzivač 2',
        'zamrzivač 3': 'Zamrzivač 3',
        'zamrzivač3': 'Zamrzivač 3',
        'zamrzivač': 'Zamrzivač 1',
        'zamrzivac': 'Zamrzivač 1',
        'frižider': 'Frižider',
        'frizider': 'Frižider',
        'ostava': 'Ostava',
        'ostavi': 'Ostava'
    };
    
    for (let [key, value] of Object.entries(storageMap)) {
        if (cleanText.includes(key)) {
            result.storage = value;
            cleanText = cleanText.replace(new RegExp(key, 'g'), '');
            break;
        }
    }
    
    // 2. KOMAD (prvi broj pre količine)
    const piecePattern = /\b(\d+)\b\s*(?:komad|komada|kom)?/i;
    const pieceMatch = cleanText.match(piecePattern);
    if (pieceMatch) {
        result.piece = pieceMatch[1];
        cleanText = cleanText.replace(pieceMatch[0], '');
    }
    
    // 3. KOLIČINA I JEDINICA
    const unitPattern = /(\d+\.?\d*)\s*(kg|kila|kilograma|kilogram|g|grama|kom|l|litra|ml|mililitara|pak|kutija)/i;
    const quantityMatch = cleanText.match(unitPattern);
    if (quantityMatch) {
        let unit = quantityMatch[2].toLowerCase();
        if (unit === 'kila' || unit === 'kilograma' || unit === 'kilogram') unit = 'kg';
        if (unit === 'litra') unit = 'l';
        if (unit === 'mililitara') unit = 'ml';
        if (unit === 'grama') unit = 'g';
        result.quantity = parseFloat(quantityMatch[1]);
        result.unit = unit;
        cleanText = cleanText.replace(quantityMatch[0], '');
    }
    
    // 4. ROK TRAJANJA
    const shelfPattern = /(\d+)\s*(meseci|mesec|meseca|m|mes)/i;
    const shelfMatch = cleanText.match(shelfPattern);
    if (shelfMatch) {
        result.shelfLife = parseInt(shelfMatch[1]);
        cleanText = cleanText.replace(shelfMatch[0], '');
    }
    
    // 5. NAZIV PROIZVODA (sve što ostane)
    let productName = cleanText.replace(/plus|end|kraj|start|stop|unos/g, '').trim();
    productName = productName.replace(/\s*,\s*/g, ' ').replace(/\s+/g, ' ').trim();
    if (productName.length > 0) {
        result.product = productName.charAt(0).toUpperCase() + productName.slice(1);
    }
    
    console.log('✅ Parsirano:', result);
    return result;
}

// ===== POPUNJAVANJE POLJA =====
function fillDataEntryFields(parsed) {
    console.log('📝 Popunjavam polja:', parsed);
    
    const productInput = document.getElementById('productName');
    const pieceInput = document.getElementById('productPiece');
    const quantityInput = document.getElementById('productQuantity');
    const shelfLifeInput = document.getElementById('productExpiry');
    const storageSelect = document.getElementById('productStorage');
    const unitSelect = document.getElementById('productUnit');
    
    if (productInput && parsed.product) {
        productInput.value = parsed.product;
        highlightField(productInput);
    }
    if (pieceInput && parsed.piece) {
        pieceInput.value = parsed.piece;
        highlightField(pieceInput);
    }
    if (quantityInput && parsed.quantity) {
        quantityInput.value = parsed.quantity;
        highlightField(quantityInput);
    }
    if (shelfLifeInput && parsed.shelfLife) {
        shelfLifeInput.value = parsed.shelfLife;
        highlightField(shelfLifeInput);
        if (typeof updateExpiryDate === 'function') {
            setTimeout(updateExpiryDate, 50);
        }
    }
    if (storageSelect && parsed.storage) {
        for (let option of storageSelect.options) {
            if (option.value === parsed.storage || option.value.toLowerCase().includes(parsed.storage.toLowerCase())) {
                storageSelect.value = option.value;
                highlightField(storageSelect);
                break;
            }
        }
    }
    if (unitSelect && parsed.unit) {
        for (let option of unitSelect.options) {
            if (option.value === parsed.unit) {
                unitSelect.value = option.value;
                break;
            }
        }
    }
}

function highlightField(el) {
    if (!el) return;
    el.style.backgroundColor = '#d4edda';
    el.style.transition = 'background-color 0.3s';
    setTimeout(() => {
        el.style.backgroundColor = '';
        el.style.transition = 'background-color 0.5s';
    }, 1000);
}

// ===== START GLASOVNOG UNOSA =====
function startVoiceDataEntry() {
    console.log('🎤 Pokrećem glasovni unos...');
    
    if (voiceRecognitionInstance) {
        try { voiceRecognitionInstance.stop(); } catch(e) {}
        voiceRecognitionInstance = null;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        if (typeof showModernAlert === 'function') {
            showModernAlert('Greška', 'Vaš pretraživač ne podržava glasovne komande.', '❌');
        }
        return;
    }
    
    voiceRecognitionInstance = new SpeechRecognition();
    voiceRecognitionInstance.lang = 'sr-RS';
    voiceRecognitionInstance.continuous = true;
    voiceRecognitionInstance.interimResults = true;
    voiceRecognitionInstance.maxAlternatives = 1;
    
    let isProcessing = false;
    
    const statusEl = document.getElementById('voiceLiveStatus');
    if (statusEl) {
        statusEl.innerHTML = '🎤 Slušam... govorite podatke';
        statusEl.style.color = '#4CAF50';
        statusEl.style.background = 'rgba(76, 175, 80, 0.2)';
        statusEl.style.padding = '8px 15px';
        statusEl.style.borderRadius = '8px';
    }
    
  voiceRecognitionInstance.onresult = function(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        const fullText = (finalTranscript || interimTranscript).toLowerCase().trim();
        
        if (statusEl) {
            statusEl.innerHTML = `🗣️ "${fullText}"`;
            statusEl.style.color = '#FFD700';
        }
        
        // ⭐ OVDE DODAJEMO PROVERU ZA UNOS
        if (fullText.includes('unos')) {
            console.log('📱 Pokrećem renderDataEntry ekran...');
            if (typeof renderDataEntry === 'function') {
                renderDataEntry('');
            }
            if (typeof stopVoiceDataEntry === 'function') {
                stopVoiceDataEntry();
            }
            return;
        }
        
        // PLUS - čuvanje
        if (fullText.includes('plus')) {
            console.log('💾 PLUS - čuvanje proizvoda');
            if (!isProcessing) {
                isProcessing = true;
                const textBeforePlus = fullText.replace(/plus/g, '').trim();
                if (textBeforePlus.length > 0) {
                    const parsed = parseVoiceInput(textBeforePlus);
                    fillDataEntryFields(parsed);
                }
                setTimeout(() => {
                    if (typeof saveProduct === 'function') {
                        saveProduct();
                    }
                    isProcessing = false;
                    if (statusEl) {
                        statusEl.innerHTML = '✅ Sačuvano! Nastavite unos...';
                        statusEl.style.color = '#4CAF50';
                    }
                }, 200);
            }
            return;
        }
        
        // END - završetak
        if (fullText.includes('end') || fullText.includes('kraj')) {
            console.log('🚪 END - završetak unosa');
            if (!isProcessing) {
                isProcessing = true;
                const textBeforeEnd = fullText.replace(/end|kraj/g, '').trim();
                if (textBeforeEnd.length > 0) {
                    const parsed = parseVoiceInput(textBeforeEnd);
                    fillDataEntryFields(parsed);
                }
                setTimeout(() => {
                    if (typeof saveProduct === 'function') {
                        saveProduct();
                    }
                    stopVoiceDataEntry();
                    if (statusEl) {
                        statusEl.innerHTML = '✅ Unos završen!';
                        statusEl.style.color = '#4CAF50';
                    }
                    setTimeout(() => {
                        if (typeof renderInventory === 'function') {
                            renderInventory();
                            setTimeout(highlightNewProducts, 300);
                        }
                    }, 300);
                    isProcessing = false;
                }, 200);
            }
            return;
        }
        
        // START - već smo startovali
        if (fullText.includes('start')) {
            voiceInputActive = true;
            if (statusEl) {
                statusEl.innerHTML = '🎤 Slušam... govorite podatke';
                statusEl.style.color = '#4CAF50';
            }
            return;
        }
        
        // STOP
        if (fullText.includes('stop')) {
            stopVoiceDataEntry();
            return;
        }
        
        // Popuni polja
        if (finalTranscript && !isProcessing) {
            const parsed = parseVoiceInput(finalTranscript);
            if (parsed.product && parsed.product.length > 0) {
                fillDataEntryFields(parsed);
            }
        }
    };
    voiceRecognitionInstance.onerror = function(event) {
        console.error('❌ Greška mikrofona:', event.error);
        if (statusEl) {
            statusEl.innerHTML = '❌ Greška: ' + event.error;
            statusEl.style.color = '#f44336';
        }
        if (event.error === 'not-allowed') {
            if (typeof showModernAlert === 'function') {
                showModernAlert('Greška', 'Dozvolite pristup mikrofonu!', '🎤');
            }
        }
    };
    
    voiceRecognitionInstance.onend = function() {
        console.log('🔄 Mikrofon se zaustavio');
        if (voiceInputActive && voiceRecognitionInstance) {
            try {
                setTimeout(() => {
                    if (voiceInputActive && voiceRecognitionInstance) {
                        voiceRecognitionInstance.start();
                        if (statusEl) {
                            statusEl.innerHTML = '🎤 Slušam... (restart)';
                            statusEl.style.color = '#4CAF50';
                        }
                    }
                }, 300);
            } catch(e) {}
        }
    };
    
    try {
        voiceInputActive = true;
        voiceRecognitionInstance.start();
        console.log('🎤 Mikrofon aktivan');
    } catch(e) {
        console.error('❌ Greška pri startovanju:', e);
        if (statusEl) {
            statusEl.innerHTML = '❌ Greška pri pokretanju mikrofona';
            statusEl.style.color = '#f44336';
        }
    }
}

// ===== STOP GLASOVNOG UNOSA =====
function stopVoiceDataEntry() {
    console.log('🛑 Zaustavljam glasovni unos...');
    voiceInputActive = false;
    if (voiceRecognitionInstance) {
        try {
            voiceRecognitionInstance.stop();
        } catch(e) {}
        voiceRecognitionInstance = null;
    }
    const statusEl = document.getElementById('voiceLiveStatus');
    if (statusEl) {
        statusEl.innerHTML = '⏸️ Mikrofon isključen';
        statusEl.style.color = '#666';
        statusEl.style.background = 'transparent';
    }
}

// ===== HIGHLIGHT NOVIH PROIZVODA =====
function highlightNewProducts() {
    console.log('🔵 Označavam nove proizvode');
    setTimeout(() => {
        const rows = document.querySelectorAll('#inventoryTable .table-row:not(.header-row)');
        const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
        const recentProducts = zalihe.slice(-5);
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('.cell');
            if (cells.length > 1) {
                const productName = cells[1]?.textContent || '';
                const isNew = recentProducts.some(p => p.product_name === productName);
                if (isNew) {
                    row.style.background = '#BBDEFB';
                    row.style.transition = 'background 0.5s';
                    setTimeout(() => {
                        row.style.background = '';
                    }, 5000);
                }
            }
        });
    }, 300);
}

// ===== GO BACK =====
function goBackFromVoice() {
    stopVoiceDataEntry();
    if (typeof fromChoiceScreen !== 'undefined') {
        fromChoiceScreen = false;
    }
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    const choiceScreen = document.getElementById('choiceScreen');
    if (choiceScreen) {
        choiceScreen.style.display = 'flex';
        choiceScreen.classList.add('active');
    }
}

// ===== IZVOZ =====
window.startVoiceDataEntry = startVoiceDataEntry;
window.stopVoiceDataEntry = stopVoiceDataEntry;
window.goBackFromVoice = goBackFromVoice;
window.parseVoiceInput = parseVoiceInput;
window.fillDataEntryFields = fillDataEntryFields;
window.highlightNewProducts = highlightNewProducts;
// Prazna funkcija za kompatibilnost
window.openVoiceDataEntry = function() {
    console.log('📝 Otvaranje voice data entry');
    if (typeof renderDataEntry === 'function') {
        renderDataEntry('');
    }
    setTimeout(startVoiceDataEntry, 300);
};

console.log('✅ voiceCommands.js inicijalizovan!');
console.log('🎤 Reci "start" za početak unosa');
console.log('💾 Reci "plus" za čuvanje i nastavak');
console.log('🚪 Reci "end" ili "kraj" za završetak');
