// ============================================
// VOICE COMMANDS - MOBILE FIXED VERSION
// ============================================

let activeBuffer = '';
let recognition = null;
let isVoiceActive = false;
let voiceRestartTimeout = null;
let lastProcessedText = '';
let processingLock = false;
let isProcessingResult = false; // NOVO: Sprečava resetovanje tokom obrade

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

// ===== MOBILE-FRIENDLY POKRETAČ ZA GLASOVNI UNOS =====
function startVoiceRecognition() {
    // Spreči duplo pokretanje
    if (isVoiceActive) {
        console.log('🎤 Glasovno prepoznavanje je već aktivno');
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

    // Zaustavi prethodni recognition
    if (recognition) {
        try {
            recognition.stop();
            recognition = null;
        } catch(e) {}
    }

    // Očisti restart timeout
    if (voiceRestartTimeout) {
        clearTimeout(voiceRestartTimeout);
        voiceRestartTimeout = null;
    }

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

    const statusEl = document.getElementById('voiceStatus');

    recognition.onstart = function() {
        console.log('🎤 Glasovno prepoznavanje pokrenuto (mobile)');
        isVoiceActive = true;
        isProcessingResult = false;
        activeBuffer = '';
        lastProcessedText = '';
        updateVoiceStatus('🎤 Slušam... Diktirajte', '#2196F3');
    };

    recognition.onresult = function(event) {
        if (processingLock) return;
        processingLock = true;
        isProcessingResult = true; // NOVO: Označi da se obrađuje rezultat

        try {
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
                console.log('🗣️ TRENUTNI BAFER:', activeBuffer);
            }
            
            const currentDisplay = activeBuffer + (interimText ? ' ' + interimText : '');
            updateVoiceStatus(`🎤 Slušam: "${currentDisplay}"`, '#FFD700');
            
            // PROVERA KOMANDI - Prvo proveri da li je "end" ili "enter"
            const lowerBuffer = activeBuffer.toLowerCase();
            
            // 1. Prvo proveri za END/ENTER (ovo je najvažnije)
            if (/\b(end|enter|friend)\b/i.test(activeBuffer)) {
                console.log('✅ Detektovan END/ENTER u baferu:', activeBuffer);
                
                let parts = activeBuffer.split(/\b(end|enter|friend)\b/i);
                let itemText = parts[0].trim();
                
                if (itemText.length > 2 && itemText !== lastProcessedText) {
                    lastProcessedText = itemText;
                    
                    // OBRADI PODATKE PRE NEGO ŠTO SE ZAUSTAVI
                    const data = parseVoiceDataEntry(itemText);
                    if (data && data.product_name && data.product_name !== 'Proizvod') {
                        console.log('📦 OBRADA PODATAKA:', data);
                        
                        // Otvori Data Entry ekran
                        hideVoiceMenu();
                        const mainScreen = document.getElementById('mainScreen');
                        if (mainScreen) {
                            mainScreen.style.display = 'flex';
                            mainScreen.classList.add('active');
                        }
                        
                        // Popuni formu i sačuvaj
                        setTimeout(() => {
                            popuniFormuPodacima(data);
                            setTimeout(() => {
                                sacuvajPodatke(data);
                            }, 300);
                        }, 200);
                    }
                }
                
                // OČISTI BAFER I ZAUSTAVI PREPOZNAVANJE
                activeBuffer = '';
                isProcessingResult = false;
                processingLock = false;
                
                // ZAUSTAVI PREPOZNAVANJE
                setTimeout(() => {
                    stopVoiceRecognition();
                    
                    // Otvori zalihe nakon kratke pauze
                    setTimeout(() => {
                        if (typeof otvoriZaliheEkran === 'function') {
                            otvoriZaliheEkran();
                        }
                    }, 500);
                }, 100);
                
                return;
            }
            
            // 2. Provera za DATA ENTRY (unos, dodaj, itd.)
            const dataEntryKeywords = ['unos', 'unesi', 'dodaj', 'novi', 'add'];
            if (dataEntryKeywords.some(k => lowerBuffer.includes(k))) {
                console.log('📝 Detektovan DATA ENTRY');
                hideVoiceMenu();
                const mainScreen = document.getElementById('mainScreen');
                if (mainScreen && mainScreen.style.display !== 'flex') {
                    mainScreen.style.display = 'flex';
                    mainScreen.classList.add('active');
                    if (typeof renderDataEntry === 'function') renderDataEntry('');
                }
                // Resetuj buffer nakon komande
                activeBuffer = '';
                updateVoiceStatus('📝 Unos podataka', '#4CAF50');
                return;
            }
            
            // 3. Provera za PLUS (dodatni unos)
            if (/\bplus\b/i.test(activeBuffer)) {
                console.log('➕ Detektovan PLUS u baferu:', activeBuffer);
                
                let parts = activeBuffer.split(/\bplus\b/i);
                let itemText = parts[0].trim();
                
                if (itemText.length > 2 && itemText !== lastProcessedText) {
                    lastProcessedText = itemText;
                    
                    const data = parseVoiceDataEntry(itemText);
                    if (data && data.product_name && data.product_name !== 'Proizvod') {
                        console.log('📦 OBRADA PODATAKA (PLUS):', data);
                        
                        hideVoiceMenu();
                        const mainScreen = document.getElementById('mainScreen');
                        if (mainScreen) {
                            mainScreen.style.display = 'flex';
                            mainScreen.classList.add('active');
                        }
                        
                        setTimeout(() => {
                            popuniFormuPodacima(data);
                            setTimeout(() => {
                                sacuvajPodatke(data);
                            }, 300);
                        }, 200);
                    }
                }
                
                activeBuffer = parts.slice(1).join('').trim() || '';
                updateVoiceStatus(`➕ Dodat proizvod, nastavite...`, '#FF9800');
                return;
            }
            
        } finally {
            processingLock = false;
            // Ne resetujemo isProcessingResult ovde - to radi onend
        }
    };

    recognition.onerror = function(event) {
        console.log('⚠️ Speech Recognition greška:', event.error);
        isProcessingResult = false;
        
        if (event.error === 'not-allowed') {
            updateVoiceStatus('❌ Dozvolite pristup mikrofonu.', '#f44336');
            isVoiceActive = false;
        } else if (event.error === 'no-speech') {
            updateVoiceStatus('⏳ Nema govora, pokušajte ponovo...', '#FF9800');
        } else if (event.error === 'audio-capture') {
            updateVoiceStatus('❌ Problem sa mikrofonom, pokušajte ponovo', '#f44336');
            isVoiceActive = false;
        }
    };

    recognition.onend = function() {
        console.log('🎤 Glasovno prepoznavanje završeno.');
        
        // VAŽNO: Ako se obrađuje rezultat, nemoj resetovati buffer
        if (isProcessingResult) {
            console.log('⏳ Sačekajte, rezultat se obrađuje...');
            // Sačekaj malo pa resetuj
            setTimeout(() => {
                isProcessingResult = false;
                if (!activeBuffer) {
                    isVoiceActive = false;
                    updateVoiceStatus('⏸️ Prepoznavanje završeno', '#aaa');
                }
            }, 1000);
            return;
        }
        
        isVoiceActive = false;
        
        // Ako ima aktivnog bafera, restartuj
        if (activeBuffer && activeBuffer.length > 0) {
            console.log('🔄 Restartovanje prepoznavanja zbog aktivnog bafera');
            voiceRestartTimeout = setTimeout(() => {
                if (!isVoiceActive && !recognition) {
                    startVoiceRecognition();
                }
            }, 1000);
        } else {
            updateVoiceStatus('⏸️ Prepoznavanje završeno', '#aaa');
        }
    };

    // MOBILE: Zahtevaj korisničku interakciju
    try {
        if (typeof navigator.mediaDevices !== 'undefined' && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => {
                    recognition.start();
                })
                .catch((err) => {
                    console.error('❌ Greška pri pristupu mikrofonu:', err);
                    updateVoiceStatus('❌ Greška pri pristupu mikrofonu', '#f44336');
                });
        } else {
            recognition.start();
        }
    } catch(e) {
        console.log('❌ Greška pri pokretanju recognition-a:', e);
        try {
            recognition.start();
        } catch(err) {
            console.error('❌ Fallback pokretanje neuspešno:', err);
        }
    }
}

// ===== ZAUSTAVI GLASOVNO PREPOZNAVANJE =====
function stopVoiceRecognition() {
    if (voiceRestartTimeout) {
        clearTimeout(voiceRestartTimeout);
        voiceRestartTimeout = null;
    }
    
    if (recognition) {
        try {
            recognition.stop();
        } catch(e) {}
        recognition = null;
    }
    
    isVoiceActive = false;
    isProcessingResult = false;
    processingLock = false;
    // Ne resetujemo activeBuffer odmah - može se koristiti za restart
    if (!activeBuffer) {
        updateVoiceStatus('⏸️ Prepoznavanje zaustavljeno', '#aaa');
    }
}

// ===== UPDATE VOICE STATUS =====
function updateVoiceStatus(message, color) {
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.style.color = color || '#aaa';
    }
}

// ===== OTVORI ZALIHE / PREGLED =====
function otvoriZaliheEkran() {
    console.log('📦 Otvaram ekran zaliha...');
    
    // Prvo osveži podatke
    if (typeof refreshInventoryData === 'function') {
        refreshInventoryData();
    }
    
    // Sakrij voice menu
    hideVoiceMenu();
    
    // Otvori ekran zaliha
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
            console.log('✅ Ekran zaliha otvoren');
        } else {
            console.warn('⚠️ inventoryScreen nije pronađen');
        }
    }
}

// ===== POVRATAK SA VOICE MENIJA =====
function goBackFromVoice() {
    stopVoiceRecognition();
    if (typeof showScreen === 'function') {
        showScreen('choiceScreen');
    }
}

// ===== ČISTO I PRECIZNO PARSIRANJE GLASNOG UNOSA =====
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

        // Provera skladišta
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

        // Provera jedinice
        if (unitMap[w]) {
            result.unit = unitMap[w];
            i++;
            continue;
        }

        // Provera broja
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

        // Preskoči nepotrebne reči
        if (['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima'].includes(w)) {
            i++;
            continue;
        }

        // Dodaj reč u naziv
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
    
    console.log('✅ Parsirani podaci:', result);
    return result;
}

// ===== GLAVNA FUNKCIJA ZA OBRADU I ČUVANJE =====
function processAndSaveItem(command) {
    if (!command || command.length < 2) {
        console.warn('⚠️ Komanda prekratka');
        return false;
    }
    
    let data = parseVoiceDataEntry(command);
    if (!data || !data.product_name || data.product_name === 'Proizvod') {
        console.warn('⚠️ Nije prepoznat naziv proizvoda');
        return false;
    }
    
    console.log('📦 OBRADA:', data);
    
    // 1. Otvori Data Entry ekran
    hideVoiceMenu();
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    
    // 2. Popuni formu i sačuvaj
    setTimeout(() => {
        popuniFormuPodacima(data);
        
        setTimeout(() => {
            sacuvajPodatke(data);
        }, 300);
    }, 200);

    return true;
}

// ===== POPUNJAVANJE FORME =====
function popuniFormuPodacima(data) {
    console.log('📝 Popunjavam formu:', data);
    
    // Naziv
    const productInput = document.getElementById('productInput');
    if (productInput) {
        productInput.value = data.product_name || '';
        triggerEvent(productInput, 'input');
        triggerEvent(productInput, 'change');
    }
    
    // Komadi
    const pieceInput = document.getElementById('pieceInput');
    if (pieceInput) {
        pieceInput.value = data.piece || '1';
        triggerEvent(pieceInput, 'input');
        triggerEvent(pieceInput, 'change');
    }
    
    // Količina
    const quantityInput = document.getElementById('quantityInput');
    if (quantityInput) {
        quantityInput.value = data.quantity || '1';
        triggerEvent(quantityInput, 'input');
        triggerEvent(quantityInput, 'change');
    }
    
    // Rok trajanja
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    if (shelfLifeInput) {
        shelfLifeInput.value = data.shelf_life || '12';
        triggerEvent(shelfLifeInput, 'input');
        triggerEvent(shelfLifeInput, 'change');
    }
    
    // Jedinica
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
    
    // Skladište
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
    
    // Ažuriraj datum isteka
    if (typeof updateExpiryDate === 'function') {
        try {
            updateExpiryDate();
        } catch(e) {}
    }
    
    updateVoiceStatus(`✅ Uneto: ${data.product_name} (${data.quantity} ${data.unit})`, '#4CAF50');
}

// ===== POMOĆNA FUNKCIJA ZA TRIGGER EVENT =====
function triggerEvent(element, eventType) {
    if (!element) return;
    try {
        element.dispatchEvent(new Event(eventType, { bubbles: true }));
        if (eventType === 'change') {
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
    } catch(e) {}
}

// ===== ČUVANJE PODATAKA =====
function sacuvajPodatke(data) {
    console.log('💾 Čuvam podatke:', data);
    
    let saved = false;
    
    // 1. Prvo pokušaj sa postojećim funkcijama
    const saveFunctions = ['saveProduct', 'handleFormSubmit', 'addProduct'];
    for (let fnName of saveFunctions) {
        if (typeof window[fnName] === 'function') {
            try {
                window[fnName]();
                saved = true;
                console.log(`✅ ${fnName}() pozvan`);
                break;
            } catch(e) {
                console.warn(`${fnName} greška:`, e);
            }
        }
    }
    
    // 2. Ako nijedna funkcija ne radi, pokušaj direktno sa unosom u niz
    if (!saved) {
        console.log('🔄 Koristim rezervni metod čuvanja...');
        
        if (typeof window.inventory !== 'undefined' && Array.isArray(window.inventory)) {
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
            console.log('✅ Dodat u inventory niz:', newItem);
            saved = true;
            
            const renderFunctions = ['renderInventory', 'renderProductList', 'renderEntries'];
            for (let fnName of renderFunctions) {
                if (typeof window[fnName] === 'function') {
                    try {
                        window[fnName]();
                    } catch(e) {}
                }
            }
        }
    }
    
    // 3. Pokušaj klik na dugme za čuvanje
    if (!saved) {
        const saveSelectors = ['#saveProductBtn', 'button[type="submit"]', '.btn-save', '.save-btn'];
        for (let selector of saveSelectors) {
            const saveBtn = document.querySelector(selector);
            if (saveBtn) {
                try {
                    saveBtn.click();
                    saved = true;
                    console.log('✅ Kliknuto dugme za čuvanje');
                    break;
                } catch(e) {}
            }
        }
    }
    
    if (saved) {
        updateVoiceStatus(`✅ Sačuvano: ${data.product_name}`, '#4CAF50');
        console.log('✅ Podaci uspešno sačuvani!');
    } else {
        console.error('❌ Nije uspelo čuvanje podataka!');
        updateVoiceStatus('❌ Greška pri čuvanju podataka!', '#f44336');
    }
}

// ===== GLOBALNE FUNKCIJE =====
window.processVoiceCommand = function(command) {
    if (!command) return false;
    hideVoiceMenu();
    return processAndSaveItem(command);
};

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.processStartCommand = processAndSaveItem;
window.popuniStartPodatke = popuniFormuPodacima;
window.otvoriZaliheEkran = otvoriZaliheEkran;
window.sacuvajPodatke = sacuvajPodatke;

console.log('✅ Voice Commands MOBILE FIXED verzija učitana!');
console.log('🎤 Reci "unos" pa diktiraj proizvod, završi sa "end"');
