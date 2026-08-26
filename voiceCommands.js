// ============================================
// VOICE COMMANDS - SENIOR INTEGRISANA VERZIJA v3.0
// Objedinjeno parsiranje, upravljanje formom i kontrola mikrofona
// ============================================

(function() {
    'use strict';

    let activeBuffer = ''; 
    let recognition = null;
    let lastSavedData = null;
    let isProcessingCommand = false;
    let END_AKTIVAN = false;
    let isVoiceInput = false;
    let ALLOW_INVENTORY_OPEN = false;
    let micRestartTimer = null;

    // ============================================
    // 1. POMOĆNE FUNKCIJE & UI STATUS
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
    // 2. REČNICI: BROJEVI, JEDINICE, SKLADIŠTA
    // ============================================

    const NUMBER_WORDS = {
        'nula': '0', 'jedan': '1', 'jedna': '1', 'jedno': '1', 'dva': '2', 'dve': '2',
        'tri': '3', 'četiri': '4', 'cetiri': '4', 'pet': '5', 'šest': '6', 'sest': '6',
        'sedam': '7', 'osam': '8', 'devet': '9', 'deset': '10', 'jedanaest': '11',
        'dvanaest': '12', 'trinaest': '13', 'četrnaest': '14', 'cetrnaest': '14',
        'petnaest': '15', 'šesnaest': '16', 'sesnaest': '16', 'sedamnaest': '17',
        'osamnaest': '18', 'devetnaest': '19', 'dvadeset': '20', 'trideset': '30',
        'četrdeset': '40', 'cetrdeset': '40', 'pedeset': '50', 'šezdeset': '60',
        'sezdeset': '60', 'sedamdeset': '70', 'osamdeset': '80', 'devedeset': '90', 'sto': '100'
    };

    const UNIT_MAP = {
        'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg', 'kilogrami': 'kg', 'kilogramima': 'kg',
        'gram': 'g', 'grama': 'g', 'g': 'g', 'grami': 'g', 'gramima': 'g',
        'litar': 'l', 'litara': 'l', 'l': 'l', 'litri': 'l', 'litrima': 'l',
        'komad': 'kom', 'komada': 'kom', 'kom': 'kom', 'komadi': 'kom', 'komadima': 'kom',
        'paket': 'pak', 'paketa': 'pak', 'pak': 'pak', 'paketi': 'pak', 'paketima': 'pak'
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

    function getUnit(word) {
        return UNIT_MAP[word.toLowerCase()] || null;
    }

    function getStorage(word) {
        const w = word.toLowerCase();
        for (let key in STORAGE_MAP) {
            if (w.includes(key) || key.includes(w)) return STORAGE_MAP[key];
        }
        return null;
    }

    // ============================================
    // 3. PARSIRANJE GLASOVNOG UNOSA
    // ============================================

    function parseVoiceDataEntry(command) {
        console.log('🔍 PARSIRAM:', command);
        
        let text = command
            .replace(/^unos\s*/i, '')
            .replace(/^unesi\s*/i, '')
            .replace(/^start\s*/i, '')
            .replace(/^grile\s*/i, 'grill ')
            .replace(/^gril\s*/i, 'grill ')
            .replace(/\bGreen\b/gi, 'grill')
            .replace(/\bgreen\b/gi, 'grill')
            .trim();
        
        let words = text.split(/\s+/).map(s => s.trim()).filter(Boolean);
        let result = {
            product_name: '',
            piece: '1',
            quantity: '1',
            unit: 'kom',
            shelf_life: '12',
            storage: 'Zamrzivač 1'
        };
        
        let foundStorage = null;
        let foundUnit = null;
        let unitIndex = -1;
        let storageIndex = -1;
        let numbers = [];
        let nameParts = [];
        let skipWords = ['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima', 'i'];
        
        for (let i = 0; i < words.length; i++) {
            let w = words[i].toLowerCase();
            let storageMatch = getStorage(w);
            if (storageMatch) {
                foundStorage = storageMatch;
                storageIndex = i;
            }
            let unitMatch = getUnit(w);
            if (unitMatch) {
                foundUnit = unitMatch;
                unitIndex = i;
            }
        }
        
        if (text.includes('zamrzivač') && !text.includes('zamrzivač 2') && !text.includes('zamrzivač 3')) {
            if (!foundStorage || foundStorage === 'Zamrzivač 1') foundStorage = 'Zamrzivač 1';
        }
        
        if (text.includes('gram') || text.includes('grama')) foundUnit = 'g';
        else if (text.includes('kilogram') || text.includes('kg')) foundUnit = 'kg';
        else if (text.includes('litar') || text.includes('litara')) foundUnit = 'l';
        
        for (let i = 0; i < words.length; i++) {
            let w = words[i].toLowerCase();
            let originalW = words[i];
            if (i === storageIndex || i === unitIndex || skipWords.includes(w)) continue;
            
            let numVal = getNumber(w);
            if (numVal !== null) {
                numbers.push(numVal);
                continue;
            }
            nameParts.push(originalW);
        }
        
        if (foundUnit === 'kg' || foundUnit === 'g' || foundUnit === 'l') {
            if (numbers.length >= 2) {
                result.piece = numbers[0];
                result.quantity = numbers[1];
            } else if (numbers.length === 1) {
                result.piece = '0';
                result.quantity = numbers[0];
            }
        } else {
            if (numbers.length >= 2) {
                result.piece = numbers[0];
                result.quantity = numbers[1];
            } else if (numbers.length === 1) {
                result.piece = numbers[0];
                result.quantity = numbers[0];
            }
        }
        
        let meseciMatch = text.match(/(\d+)\s*meseci/);
        if (meseciMatch) {
            result.shelf_life = meseciMatch[1];
        } else if (numbers.length >= 3) {
            result.shelf_life = numbers[2];
        }
        
        let cleanNameParts = nameParts.filter(part => !/^\d+$/.test(part));
        result.product_name = cleanNameParts.join(' ').trim() || 'Proizvod';
        result.unit = foundUnit || 'kom';
        result.storage = foundStorage || 'Zamrzivač 1';
        
        let gramMatches = text.match(/\b(500|700|800|900|1000)\b/);
        if (gramMatches && (text.includes('gram') || text.includes('grama'))) {
            result.unit = 'g';
            result.quantity = gramMatches[1];
            if (result.piece === '1' || result.piece === '0') result.piece = '0';
        }
        
        return result;
    }

    // ============================================
    // 4. KONTROLA VIDLJIVOSTI I POPUNJAVANJE EKRANA
    // ============================================

    function prikaziPoljaZaUnos() {
        const dataEntry = document.getElementById('dataEntryScreen');
        if (dataEntry) {
            dataEntry.style.display = 'block';
            dataEntry.style.visibility = 'visible';
            dataEntry.style.opacity = '1';
            dataEntry.classList.add('active');
        }
        
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.style.visibility = 'visible';
            mainScreen.style.opacity = '1';
            mainScreen.classList.add('active');
        }
        
        const inputs = ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput', 'unitSelect', 'storageSelect'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'block';
                el.style.visibility = 'visible';
                el.style.opacity = '1';
            }
        });
    }

    function ensureFormVisible() {
        document.querySelectorAll('.screen').forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });
        
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        
        const dataEntry = document.getElementById('dataEntryScreen');
        if (dataEntry) {
            dataEntry.style.display = 'block';
            dataEntry.classList.add('active');
        }
        
        setTimeout(prikaziPoljaZaUnos, 100);
    }

    function popuniFormuPodacima(data) {
        ensureFormVisible();
        
        setTimeout(() => {
            prikaziPoljaZaUnos();
            
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) {
                    el.value = val;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }
            };

            setVal('productInput', data.product_name || '');
            setVal('pieceInput', data.piece || '1');
            setVal('quantityInput', data.quantity || '1');
            setVal('shelfLifeInput', data.shelf_life || '12');

            const unitSelect = document.getElementById('unitSelect');
            if (unitSelect && data.unit) {
                for (let opt of unitSelect.options) {
                    if (opt.value === data.unit || opt.text.toLowerCase().includes(data.unit.toLowerCase())) {
                        opt.selected = true;
                        unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                        break;
                    }
                }
            }

            const storageSelect = document.getElementById('storageSelect');
            if (storageSelect && data.storage) {
                for (let opt of storageSelect.options) {
                    if (opt.value === data.storage || opt.text.toLowerCase().includes(data.storage.toLowerCase())) {
                        opt.selected = true;
                        storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                        break;
                    }
                }
            }

            if (typeof window.updateExpiryDate === 'function') {
                try { window.updateExpiryDate(); } catch(e) {}
            }

            showVoiceStatus(`✅ Uneto: ${data.product_name} (${data.quantity} ${data.unit})`, '#4CAF50');
        }, 200);
    }

    // ============================================
    // 5. ČUVANJE PODATAKA & OBRADA KOMANDI
    // ============================================

    function sacuvajPodatke(data) {
        ALLOW_INVENTORY_OPEN = false;
        END_AKTIVAN = false;
        isVoiceInput = true;
        window._isVoiceInput = true;

        const originalShowAlert = window.showModernAlert;
        const originalAlert = window.alert;
        window.showModernAlert = function() {};
        window.alert = function() {};

        let saved = false;
        popuniFormuPodacima(data);

        setTimeout(() => {
            if (typeof window.saveProduct === 'function') {
                try {
                    window.saveProduct();
                    saved = true;
                } catch(e) { console.warn('saveProduct error:', e); }
            }

            if (!saved) {
                try {
                    const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
                    zalihe.push({
                        id: Date.now(),
                        product_name: data.product_name,
                        piece: parseInt(data.piece) || 1,
                        quantity: parseFloat(data.quantity) || 1,
                        unit: data.unit || 'kom',
                        shelf_life_months: parseInt(data.shelf_life) || 12,
                        storage_location: data.storage || 'Zamrzivač 1',
                        entry_date: new Date().toISOString().split('T')[0],
                        isNew: true
                    });
                    localStorage.setItem('zalihe', JSON.stringify(zalihe));
                    saved = true;
                } catch(e) { console.warn('localStorage error:', e); }
            }

            setTimeout(() => {
                window.showModernAlert = originalShowAlert;
                window.alert = originalAlert;
            }, 1000);

            if (saved) {
                showVoiceStatus(`✅ Sačuvano: ${data.product_name}`, '#4CAF50');
                if (typeof window.prikaziSveUnose === 'function') {
                    try { window.prikaziSveUnose(); } catch(e) {}
                }
            } else {
                showVoiceStatus('❌ Greška pri čuvanju!', '#f44336');
            }

            setTimeout(() => {
                isVoiceInput = false;
                window._isVoiceInput = false;
            }, 1000);
        }, 500);

        return saved;
    }

    function processAndSaveItem(command) {
        ALLOW_INVENTORY_OPEN = false;
        END_AKTIVAN = false;
        
        let data = parseVoiceDataEntry(command);
        if (!data.product_name || data.product_name === 'Proizvod' || data.product_name.length < 2) {
            showVoiceStatus('❌ Nisam prepoznao proizvod', '#f44336');
            return false;
        }

        lastSavedData = data;
        sacuvajPodatke(data);
        return true;
    }

    function otvoriZaliheEkran() {
        if (!ALLOW_INVENTORY_OPEN) {
            showVoiceStatus('⛔ Samo "end" otvara zalihe', '#FF9800');
            return;
        }

        if (typeof window.refreshInventoryData === 'function') try { window.refreshInventoryData(); } catch(e) {}

        setTimeout(() => {
            if (typeof window.renderInventory === 'function') try { window.renderInventory(); } catch(e) {}
            if (typeof window.renderProductList === 'function') try { window.renderProductList(); } catch(e) {}
            if (typeof window.renderEntries === 'function') try { window.renderEntries(); } catch(e) {}
        }, 100);

        setTimeout(() => {
            const inv = document.getElementById('inventoryScreen');
            const main = document.getElementById('mainScreen');
            if (inv) {
                if (main) main.style.display = 'none';
                inv.style.display = 'flex';
                inv.classList.add('active');
            }
            showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
            ALLOW_INVENTORY_OPEN = false;
        }, 300);
    }

    // ============================================
    // 6. SPEECH RECOGNITION ENGINE
    // ============================================

    function startVoiceRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            showVoiceStatus('❌ Browser ne podržava glasovno prepoznavanje.', '#f44336');
            return;
        }

        if (recognition) {
            try { recognition.stop(); } catch(e) {}
            recognition = null;
        }

        recognition = new SpeechRecognition();
        const langCode = typeof window.currentLang !== 'undefined' ? window.currentLang : 'sr';
        const speechLangMap = { sr: 'sr-RS', en: 'en-US', de: 'de-DE', hu: 'hu-HU', fr: 'fr-FR' };
        
        recognition.lang = speechLangMap[langCode] || 'sr-RS';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = function() {
            showVoiceStatus('🎤 Slušam... Recite komandu ili artikal', '#2196F3');
            activeBuffer = '';
            isProcessingCommand = false;
            END_AKTIVAN = false;
            ALLOW_INVENTORY_OPEN = false;
        };

        recognition.onresult = function(event) {
            let interimText = '';
            let finalChunk = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript.trim();
                if (event.results[i].isFinal) finalChunk += (finalChunk ? ' ' : '') + transcript;
                else interimText += transcript;
            }

            if (finalChunk) activeBuffer += (activeBuffer ? ' ' : '') + finalChunk;
            showVoiceStatus(`🎤 Slušam: "${activeBuffer + (interimText ? ' ' + interimText : '')}"`, '#FFD700');

            if (isProcessingCommand) return;
            const lowerFull = activeBuffer.toLowerCase();

            // 1. END / EXIT KOMANDA
            if (lowerFull.includes('end') || lowerFull.includes(' and ') || lowerFull.includes('izlaz') || lowerFull.includes('exit')) {
                isProcessingCommand = true;
                END_AKTIVAN = true;
                ALLOW_INVENTORY_OPEN = true;
                
                let itemText = activeBuffer.replace(/\b(end|and|izlaz|exit)\b/gi, '').trim();
                if (itemText.length > 2) processAndSaveItem(itemText);

                activeBuffer = '';
                stopVoiceRecognition();
                setTimeout(() => {
                    ALLOW_INVENTORY_OPEN = true;
                    otvoriZaliheEkran();
                }, 500);
                return;
            }

            // 2. PLUS KOMANDA
            if (lowerFull.includes('plus')) {
                isProcessingCommand = true;
                let parts = activeBuffer.split(/\bplus\b/i);
                if (parts[0].trim().length > 2) processAndSaveItem(parts[0].trim());

                activeBuffer = parts.slice(1).join('').trim();
                showVoiceStatus('✅ Unos sačuvan. Slušam dalje...', '#4CAF50');

                setTimeout(() => {
                    try {
                        recognition.stop();
                        setTimeout(() => recognition.start(), 300);
                    } catch(e) { startVoiceRecognition(); }
                    isProcessingCommand = false;
                }, 800);
                return;
            }

            // 3. START / UNOS / UNESI / DODAJ KOMANDA
            if (['unos', 'unesi', 'dodaj', 'start'].some(k => lowerFull.includes(k))) {
                hideVoiceMenu();
                ensureFormVisible();
                let cleanCmd = activeBuffer.replace(/\b(unos|unesi|dodaj|start)\b/gi, '').trim();
                if (cleanCmd.length > 2) {
                    processAndSaveItem(cleanCmd);
                }
                activeBuffer = '';
            }
        };

        recognition.onerror = function(event) {
            console.error('⚠️ Speech Recognition greška:', event.error);
            isProcessingCommand = false;
        };

        recognition.onend = function() {
            console.log('🎤 Prepoznavanje završeno.');
            isProcessingCommand = false;
        };

        try { recognition.start(); } catch(e) { console.error('❌ Greška start:', e); }
    }

    function stopVoiceRecognition() {
        if (recognition) {
            try { recognition.stop(); } catch(e) {}
            recognition = null;
        }
        activeBuffer = '';
        isProcessingCommand = false;
        showVoiceStatus('⏸️ Prepoznavanje zaustavljeno', '#aaa');
    }

    function restartMicrophone() {
        stopVoiceRecognition();
        setTimeout(startVoiceRecognition, 400);
    }

    // ============================================
    // 7. OVERRIDE SAVEPRODUCT (ZADRŽAVA PODATKE U FORMI)
    // ============================================

    const originalSaveProduct = window.saveProduct;
    window.saveProduct = function() {
        const productInput = document.getElementById('productInput');
        const pieceInput = document.getElementById('pieceInput');
        const quantityInput = document.getElementById('quantityInput');
        const shelfLifeInput = document.getElementById('shelfLifeInput');
        const unitSelect = document.getElementById('unitSelect');
        const storageSelect = document.getElementById('storageSelect');

        const savedValues = {
            product: productInput ? productInput.value : '',
            piece: pieceInput ? pieceInput.value : '1',
            quantity: quantityInput ? quantityInput.value : '1',
            shelf_life: shelfLifeInput ? shelfLifeInput.value : '12',
            unit: unitSelect ? unitSelect.value : 'kom',
            storage: storageSelect ? storageSelect.value : 'Zamrzivač 1'
        };

        if (typeof originalSaveProduct === 'function') {
            try { originalSaveProduct(); } catch(e) { console.warn(e); }
        }

        setTimeout(() => {
            if (productInput) productInput.value = savedValues.product;
            if (pieceInput) pieceInput.value = savedValues.piece;
            if (quantityInput) quantityInput.value = savedValues.quantity;
            if (shelfLifeInput) shelfLifeInput.value = savedValues.shelf_life;
            prikaziPoljaZaUnos();
        }, 100);
    };

    // ============================================
    // 8. GLOBALNA REGISTRACIJA
    // ============================================

    window.startVoiceRecognition = startVoiceRecognition;
    window.stopVoiceRecognition = stopVoiceRecognition;
    window.restartMicrophone = restartMicrophone;
    window.processVoiceCommand = function(cmd) {
        if (!cmd) return false;
        let data = parseVoiceDataEntry(cmd);
        return sacuvajPodatke(data);
    };
    window.voiceCommand = window.processVoiceCommand;

    console.log('✅ voiceCommands.js v3.0 uspešno učitan i povezan sa ekranom!');
})();
