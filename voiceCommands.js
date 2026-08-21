// ============================================
// VOICE COMMANDS - MOBILE TIMER VERSION
// ============================================

let activeBuffer = '';
let recognition = null;
let isVoiceActive = false;
let voiceTimer = null;
let lastProcessedText = '';
let isProcessing = false;
let voiceStartTime = 0;
let silenceTimer = null;
let isEndDetected = false;

// ===== POMOĆNA FUNKCIJA ZA SAKRIVANJE EKRANA =====
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

// ===== MOBILE POKRETAČ ZA GLASOVNI UNOS =====
function startVoiceRecognition() {
    if (isVoiceActive) {
        console.log('🎤 Već aktivno');
        updateVoiceStatus('🎤 Već slušam...', '#2196F3');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        if (typeof showModernAlert === 'function') {
            showModernAlert('Greška', 'Vaš pretraživač ne podržava glasovne komande.', '❌');
        }
        return;
    }

    // Očisti sve
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    
    clearTimeout(voiceTimer);
    clearTimeout(silenceTimer);
    
    isVoiceActive = false;
    isProcessing = false;
    isEndDetected = false;
    activeBuffer = '';
    lastProcessedText = '';

    recognition = new SpeechRecognition();
    const langCode = typeof currentLang !== 'undefined' ? currentLang : 'sr';
    const speechLangMap = {
        sr: 'sr-RS', en: 'en-US', de: 'de-DE', hu: 'hu-HU',
        uk: 'uk-UA', ru: 'ru-RU', zh: 'zh-CN', es: 'es-ES',
        pt: 'pt-PT', fr: 'fr-FR'
    };
    
    recognition.lang = speechLangMap[langCode] || 'sr-RS';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = function() {
        console.log('🎤 Pokrenuto');
        isVoiceActive = true;
        isEndDetected = false;
        activeBuffer = '';
        voiceStartTime = Date.now();
        updateVoiceStatus('🎤 Slušam... (recite "end" za kraj)', '#2196F3');
    };

    recognition.onresult = function(event) {
        if (isProcessing) return;
        
        console.log('📝 Rezultat primljen');
        
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
        
        if (finalText) {
            activeBuffer += (activeBuffer ? ' ' : '') + finalText;
            console.log('🗣️ BAFER:', activeBuffer);
            
            // ODMMA PROVERI DA LI IMA "END"
            if (/\b(end|enter|friend|kraj|stop)\b/i.test(activeBuffer)) {
                console.log('🚨 END DETEKTOVAN!');
                isEndDetected = true;
                
                // Izdvoji tekst pre "end"
                const endMatch = activeBuffer.match(/^(.+?)\b(end|enter|friend|kraj|stop)\b/i);
                if (endMatch) {
                    const itemText = endMatch[1].trim();
                    console.log('📦 Tekst za obradu:', itemText);
                    
                    if (itemText.length > 2 && itemText !== lastProcessedText) {
                        lastProcessedText = itemText;
                        processVoiceInput(itemText);
                    }
                }
                
                // Zaustavi odmah
                stopVoiceRecognition();
                return;
            }
            
            // Proveri za PLUS
            if (/\bplus\b/i.test(activeBuffer)) {
                console.log('➕ PLUS DETEKTOVAN');
                const parts = activeBuffer.split(/\bplus\b/i);
                const itemText = parts[0].trim();
                
                if (itemText.length > 2 && itemText !== lastProcessedText) {
                    lastProcessedText = itemText;
                    processVoiceInput(itemText);
                }
                
                activeBuffer = parts.slice(1).join(' ').trim() || '';
                updateVoiceStatus(`➕ Dodato, nastavite...`, '#FF9800');
                return;
            }
            
            // Proveri za "unos" komandu
            if (/\b(unos|unesi|dodaj|novi|add)\b/i.test(activeBuffer)) {
                console.log('📝 UNOS DETEKTOVAN');
                hideVoiceMenu();
                const mainScreen = document.getElementById('mainScreen');
                if (mainScreen) {
                    mainScreen.style.display = 'flex';
                    mainScreen.classList.add('active');
                    if (typeof renderDataEntry === 'function') renderDataEntry('');
                }
                activeBuffer = '';
                updateVoiceStatus('📝 Unos podataka', '#4CAF50');
                return;
            }
        }
        
        // Prikaži trenutni status
        const displayText = activeBuffer + (interimText ? ' ' + interimText : '');
        if (displayText) {
            updateVoiceStatus(`🎤: "${displayText}"`, '#FFD700');
        }
    };

    recognition.onerror = function(event) {
        console.log('⚠️ Greška:', event.error);
        
        if (event.error === 'not-allowed') {
            updateVoiceStatus('❌ Dozvolite mikrofon.', '#f44336');
            isVoiceActive = false;
        } else if (event.error === 'no-speech') {
            updateVoiceStatus('⏳ Nema govora...', '#FF9800');
        } else if (event.error === 'aborted') {
            console.log('⏹️ Prepoznavanje prekinuto');
        }
    };

    recognition.onend = function() {
        console.log('🎤 Završeno');
        isVoiceActive = false;
        
        // AKO NIJE DETEKTOVAN END, A IMA TEKSTA - OBRADI
        if (!isEndDetected && activeBuffer && activeBuffer.length > 3) {
            console.log('🔄 Onend sa tekstom, obrađujem:', activeBuffer);
            
            // Proveri da li ima "end" u baferu
            if (/\b(end|enter|friend|kraj|stop)\b/i.test(activeBuffer)) {
                const endMatch = activeBuffer.match(/^(.+?)\b(end|enter|friend|kraj|stop)\b/i);
                if (endMatch) {
                    const itemText = endMatch[1].trim();
                    if (itemText.length > 2 && itemText !== lastProcessedText) {
                        lastProcessedText = itemText;
                        processVoiceInput(itemText);
                    }
                }
            } else if (activeBuffer.length > 5) {
                // Ako nema "end" ali ima dovoljno teksta
                processVoiceInput(activeBuffer);
            }
            
            activeBuffer = '';
        }
        
        updateVoiceStatus('⏸️ Gotovo', '#aaa');
    };

    // POKRENI
    try {
        if (typeof navigator.mediaDevices !== 'undefined' && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => {
                    recognition.start();
                    // Timer za automatsko zaustavljanje posle 30 sekundi tišine
                    resetSilenceTimer();
                })
                .catch((err) => {
                    console.error('❌ Greška mikrofona:', err);
                    updateVoiceStatus('❌ Greška mikrofona', '#f44336');
                });
        } else {
            recognition.start();
            resetSilenceTimer();
        }
    } catch(e) {
        console.log('❌ Greška:', e);
    }
}

// ===== TIMER ZA TIŠINU =====
function resetSilenceTimer() {
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
        if (isVoiceActive && activeBuffer && activeBuffer.length > 3) {
            console.log('⏰ Timer: tišina, obrađujem:', activeBuffer);
            
            if (/\b(end|enter|friend|kraj|stop)\b/i.test(activeBuffer)) {
                const endMatch = activeBuffer.match(/^(.+?)\b(end|enter|friend|kraj|stop)\b/i);
                if (endMatch) {
                    const itemText = endMatch[1].trim();
                    if (itemText.length > 2 && itemText !== lastProcessedText) {
                        lastProcessedText = itemText;
                        processVoiceInput(itemText);
                    }
                }
            } else if (activeBuffer.length > 5) {
                processVoiceInput(activeBuffer);
            }
            
            activeBuffer = '';
            stopVoiceRecognition();
        }
    }, 5000); // 5 sekundi tišine
}

// ===== OBRADA GLASOVNOG UNOSA =====
function processVoiceInput(text) {
    if (isProcessing) return;
    isProcessing = true;
    
    console.log('🔧 OBRADA:', text);
    
    const data = parseVoiceDataEntry(text);
    if (!data || !data.product_name || data.product_name === 'Proizvod') {
        console.warn('⚠️ Nije prepoznat proizvod');
        isProcessing = false;
        return;
    }
    
    console.log('✅ Parsirano:', data);
    
    // Otvori Data Entry
    hideVoiceMenu();
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    
    // Popuni i sačuvaj
    setTimeout(() => {
        popuniFormuPodacima(data);
        
        setTimeout(() => {
            sacuvajPodatke(data);
            isProcessing = false;
            
            // Otvori zalihe
            setTimeout(() => {
                if (typeof otvoriZaliheEkran === 'function') {
                    otvoriZaliheEkran();
                }
            }, 500);
        }, 300);
    }, 200);
}

// ===== ZAUSTAVI =====
function stopVoiceRecognition() {
    clearTimeout(voiceTimer);
    clearTimeout(silenceTimer);
    
    if (recognition) {
        try {
            recognition.stop();
        } catch(e) {}
        recognition = null;
    }
    
    isVoiceActive = false;
    updateVoiceStatus('⏸️ Zaustavljeno', '#aaa');
}

// ===== UPDATE STATUS =====
function updateVoiceStatus(message, color) {
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.style.color = color || '#aaa';
    }
}

// ===== OTVORI ZALIHE =====
function otvoriZaliheEkran() {
    console.log('📦 Otvaram zalihe...');
    
    if (typeof refreshInventoryData === 'function') {
        refreshInventoryData();
    }
    
    hideVoiceMenu();
    
    if (typeof openInventoryAndShowHighlight === 'function') {
        openInventoryAndShowHighlight();
    } else if (typeof showScreen === 'function') {
        showScreen('inventoryScreen');
    } else {
        const inv = document.getElementById('inventoryScreen');
        const main = document.getElementById('mainScreen');
        const choice = document.getElementById('choiceScreen');
        
        if (inv) {
            if (main) main.style.display = 'none';
            if (choice) choice.style.display = 'none';
            inv.style.display = 'flex';
            inv.classList.add('active');
            console.log('✅ Zalihe otvorene');
        }
    }
}

// ===== PARSIRANJE =====
function parseVoiceDataEntry(command) {
    if (!command) return null;
    
    let text = command
        .replace(/^unos\s*/i, '')
        .replace(/^start\s*/i, '')
        .replace(/^dodaj\s*/i, '')
        .trim();
        
    if (!text) return null;
    
    let words = text.split(/\s+/).map(s => s.trim()).filter(Boolean);
    
    let result = {
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
        'paket': 'pak', 'paketa': 'pak', 'pak': 'pak'
    };
    
    const storageMap = {
        'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
        'zamrzivač 1': 'Zamrzivač 1', 'zamrzivac 1': 'Zamrzivač 1',
        'zamrzivač 2': 'Zamrzivač 2', 'zamrzivac 2': 'Zamrzivač 2',
        'zamrzivač 3': 'Zamrzivač 3', 'zamrzivac 3': 'Zamrzivač 3',
        'frižider': 'Frižider', 'frizider': 'Frižider',
        'ostava': 'Ostava', 'špajz': 'Ostava'
    };

    const numberWordsMap = {
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
        'jedanaest': '11', 'dvanaest': '12',
        'trinaest': '13', 'četrnaest': '14', 'cetrnaest': '14',
        'petnaest': '15', 'šesnaest': '16', 'sesnaest': '16',
        'sedamnaest': '17', 'osamnaest': '18', 'devetnaest': '19',
        'dvadeset': '20', 'trideset': '30', 'četrdeset': '40',
        'cetrdeset': '40', 'pedeset': '50', 'šezdeset': '60',
        'sezdeset': '60', 'sedamdeset': '70', 'osamdeset': '80',
        'devedeset': '90', 'sto': '100'
    };

    let nameWords = [];
    let quantityFound = false;
    let shelfLifeFound = false;
    
    let i = 0;
    while (i < words.length) {
        let w = words[i].toLowerCase();
        
        if (w === 'start' || w === 'unos' || w === 'dodaj' || w === 'add') {
            i++;
            continue;
        }

        let storageMatch = null;
        for (let key in storageMap) {
            if (w.includes(key) || key.includes(w)) {
                storageMatch = storageMap[key];
                break;
            }
        }
        if (storageMatch) {
            result.storage = storageMatch;
            i++;
            continue;
        }

        if (unitMap[w]) {
            result.unit = unitMap[w];
            i++;
            continue;
        }

        let numVal = null;
        if (!isNaN(w) && w.trim() !== '') {
            numVal = w;
        } else if (numberWordsMap[w]) {
            numVal = numberWordsMap[w];
        }

        if (numVal !== null) {
            if (!quantityFound) {
                result.quantity = numVal;
                result.piece = numVal;
                quantityFound = true;
            } else if (!shelfLifeFound) {
                result.shelf_life = numVal;
                shelfLifeFound = true;
            }
            i++;
            continue;
        }

        if (['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima'].includes(w)) {
            i++;
            continue;
        }

        if (!quantityFound || nameWords.length < 10) {
            nameWords.push(words[i]);
        }

        i++;
    }

    result.product_name = nameWords.join(' ').trim() || 'Proizvod';
    
    if (!quantityFound) {
        result.quantity = '1';
        result.piece = '1';
    }
    
    return result;
}

// ===== POPUNI FORMU =====
function popuniFormuPodacima(data) {
    console.log('📝 Popunjavam:', data);
    
    const productInput = document.getElementById('productInput');
    if (productInput) {
        productInput.value = data.product_name || '';
        triggerEvent(productInput, 'input');
        triggerEvent(productInput, 'change');
    }
    
    const pieceInput = document.getElementById('pieceInput');
    if (pieceInput) {
        pieceInput.value = data.piece || '1';
        triggerEvent(pieceInput, 'input');
        triggerEvent(pieceInput, 'change');
    }
    
    const quantityInput = document.getElementById('quantityInput');
    if (quantityInput) {
        quantityInput.value = data.quantity || '1';
        triggerEvent(quantityInput, 'input');
        triggerEvent(quantityInput, 'change');
    }
    
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    if (shelfLifeInput) {
        shelfLifeInput.value = data.shelf_life || '12';
        triggerEvent(shelfLifeInput, 'input');
        triggerEvent(shelfLifeInput, 'change');
    }
    
    const unitSelect = document.getElementById('unitSelect');
    if (unitSelect && data.unit) {
        for (let option of unitSelect.options) {
            if (option.value === data.unit || option.text.toLowerCase().includes(data.unit)) {
                option.selected = true;
                triggerEvent(unitSelect, 'change');
                break;
            }
        }
    }
    
    const storageSelect = document.getElementById('storageSelect');
    if (storageSelect && data.storage) {
        for (let option of storageSelect.options) {
            if (option.value === data.storage || option.text.includes(data.storage)) {
                option.selected = true;
                triggerEvent(storageSelect, 'change');
                break;
            }
        }
    }
    
    if (typeof updateExpiryDate === 'function') {
        try { updateExpiryDate(); } catch(e) {}
    }
    
    updateVoiceStatus(`✅ Uneto: ${data.product_name}`, '#4CAF50');
}

// ===== TRIGGER EVENT =====
function triggerEvent(element, eventType) {
    if (!element) return;
    try {
        element.dispatchEvent(new Event(eventType, { bubbles: true }));
        if (eventType === 'change') {
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
    } catch(e) {}
}

// ===== ČUVANJE =====
function sacuvajPodatke(data) {
    console.log('💾 Čuvam:', data);
    
    let saved = false;
    
    const saveFunctions = ['saveProduct', 'handleFormSubmit', 'addProduct'];
    for (let fnName of saveFunctions) {
        if (typeof window[fnName] === 'function') {
            try {
                window[fnName]();
                saved = true;
                console.log(`✅ ${fnName}() pozvan`);
                break;
            } catch(e) {}
        }
    }
    
    if (!saved && typeof window.inventory !== 'undefined' && Array.isArray(window.inventory)) {
        const shelfLifeMonths = parseInt(data.shelf_life) || 12;
        const newItem = {
            id: Date.now() + Math.random() * 1000,
            productName: data.product_name,
            piece: parseInt(data.piece) || 1,
            quantity: parseFloat(data.quantity) || 1,
            unit: data.unit || 'kom',
            shelfLife: shelfLifeMonths,
            storage: data.storage || 'Zamrzivač 1',
            dateAdded: new Date().toISOString(),
            expiryDate: new Date(Date.now() + shelfLifeMonths * 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        window.inventory.push(newItem);
        saved = true;
        
        const renderFunctions = ['renderInventory', 'renderProductList', 'renderEntries'];
        for (let fnName of renderFunctions) {
            if (typeof window[fnName] === 'function') {
                try { window[fnName](); } catch(e) {}
            }
        }
    }
    
    if (!saved) {
        const saveSelectors = ['#saveProductBtn', 'button[type="submit"]', '.btn-save', '.save-btn'];
        for (let selector of saveSelectors) {
            const saveBtn = document.querySelector(selector);
            if (saveBtn) {
                try { saveBtn.click(); saved = true; break; } catch(e) {}
            }
        }
    }
    
    if (saved) {
        updateVoiceStatus(`✅ Sačuvano: ${data.product_name}`, '#4CAF50');
        console.log('✅ Sačuvano!');
    } else {
        updateVoiceStatus('❌ Greška pri čuvanju!', '#f44336');
    }
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
window.otvoriZaliheEkran = otvoriZaliheEkran;
window.sacuvajPodatke = sacuvajPodatke;

console.log('✅ Voice Commands - TIMER verzija učitana!');
console.log('🎤 Govorite, završite sa "end"');
