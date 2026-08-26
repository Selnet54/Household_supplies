// ============================================
// VOICE COMMANDS - UNIVERSAL MULTI-LANG & DATA ENGINE v5.2
// Spojeno: Napredno parsiranje + Multi-lang + Fix za inline komande
// ============================================

(function() {
    'use strict';

    // Globalna stanja
    let activeBuffer = ''; 
    let recognition = null;
    let lastSavedData = null;
    let isProcessingCommand = false;
    let END_AKTIVAN = false;
    let isVoiceInput = false;
    let ALLOW_INVENTORY_OPEN = false;
    let micRestartTimer = null;
    let micActive = false;

    // Mapiranje jezika aplikacije na Web Speech API kodove
    const LANG_MAP = {
        'sr': 'sr-RS',
        'en': 'en-US',
        'de': 'de-DE',
        'hu': 'hu-HU',
        'fr': 'fr-FR',
        'es': 'es-ES',
        'it': 'it-IT',
        'ru': 'ru-RU',
        'ro': 'ro-RO',
        'sk': 'sk-SK',
        'uk': 'uk-UA',
        'zh': 'zh-CN',
        'pt': 'pt-PT'
    };

    // Višejezični rečnik za okidače komandi
    const COMMAND_KEYWORDS = {
        ENTRY: ['unos', 'unesi', 'dodaj', 'start', 'unus', 'unest', 'novi', 'add', 'entry', 'input', 'neue', 'eingabe', 'data'],
        EXIT: ['izlaz', 'kraj', 'exit', 'end', 'close', 'ende', 'ausgang', 'nazad', 'back'],
        PLUS: ['plus', 'weiter', 'next', 'sledec', 'sledeće']
    };

    function getCurrentLanguageCode() {
        let appLang = 'sr';
        if (typeof window.getCurrentLang === 'function') {
            appLang = window.getCurrentLang() || 'sr';
        } else if (typeof window.currentLang !== 'undefined' && window.currentLang) {
            appLang = window.currentLang;
        } else if (typeof currentLang !== 'undefined' && currentLang) {
            appLang = currentLang;
        }
        return LANG_MAP[appLang] || 'sr-RS';
    }

    // ============================================
    // 1. POMOĆNE FUNKCIJE I REČNICI
    // ============================================

    function hideVoiceMenu() {
        const screens = ['voiceMenuScreen', 'choiceScreen'];
        screens.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'none';
                el.classList.remove('active');
            }
        });
    }

    function showVoiceStatus(text, color) {
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = text;
            if (color) statusEl.style.color = color;
        }
        console.log('[VOICE]', text);
    }

    const NUMBER_WORDS = {
        'nula': '0',
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

    function getNumber(word) {
        const w = word.toLowerCase().trim();
        if (NUMBER_WORDS[w] !== undefined) return NUMBER_WORDS[w];
        if (/^\d+(?:[.,]\d+)?$/.test(w)) return w.replace(',', '.');
        return null;
    }

    const UNIT_MAP = {
        'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg',
        'kilogrami': 'kg', 'kilogramima': 'kg',
        'gram': 'g', 'grama': 'g', 'g': 'g',
        'grami': 'g', 'gramima': 'g',
        'litar': 'l', 'litara': 'l', 'l': 'l',
        'litri': 'l', 'litrima': 'l',
        'komad': 'kom', 'komada': 'kom', 'kom': 'kom',
        'komadi': 'kom', 'komadima': 'kom',
        'paket': 'pak', 'paketa': 'pak', 'pak': 'pak',
        'paketi': 'pak', 'paketima': 'pak'
    };

    const STORAGE_MAP = {
        'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
        'zamrzivač 1': 'Zamrzivač 1', 'zamrzivac 1': 'Zamrzivač 1',
        'zamrzivač 2': 'Zamrzivač 2', 'zamrzivac 2': 'Zamrzivač 2',
        'zamrzivač 3': 'Zamrzivač 3', 'zamrzivac 3': 'Zamrzivač 3',
        'frižider': 'Frižider', 'frizider': 'Frižider',
        'ostava': 'Ostava', 'špajz': 'Ostava'
    };

    function getUnit(word) {
        return UNIT_MAP[word.toLowerCase()] || null;
    }

    function getStorage(word) {
        const w = word.toLowerCase();
        for (let key in STORAGE_MAP) {
            if (w.includes(key) || key.includes(w)) {
                return STORAGE_MAP[key];
            }
        }
        return null;
    }

    // ============================================
    // 2. PARSIRANJE GLASOVNIH PODATAKA
    // ============================================

    function parseVoiceDataEntry(command) {
        console.log('🔍 PARSIRAM:', command);
        
        let text = command
            .replace(/^unos\s*/i, '')
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
            if (!foundStorage || foundStorage === 'Zamrzivač 1') {
                foundStorage = 'Zamrzivač 1';
            }
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
        
        let rokPronadjen = false;
        let meseciMatch = text.match(/(\d+)\s*meseci/);
        if (meseciMatch) {
            result.shelf_life = meseciMatch[1];
            rokPronadjen = true;
        }
        
        if (!rokPronadjen && numbers.length >= 3) {
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
        
        console.log('✅ PARSIRANO:', result);
        return result;
    }

    // ============================================
    // 3. RUKOVANJE FORME I PRIKAZA
    // ============================================

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

    function prikaziPoljaZaUnos() {
        const dataEntry = document.getElementById('dataEntryScreen');
        if (dataEntry) {
            dataEntry.style.display = 'block';
            dataEntry.style.visibility = 'visible';
            dataEntry.style.opacity = '1';
            dataEntry.classList.add('active');
        }
        
        const polja = ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput', 'unitSelect', 'storageSelect'];
        polja.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'block';
                el.style.visibility = 'visible';
                el.style.opacity = '1';
            }
        });
    }

    function popuniFormuPodacima(data) {
        ensureFormVisible();
        
        setTimeout(() => {
            prikaziPoljaZaUnos();
            
            const productInput = document.getElementById('productInput');
            if (productInput) {
                productInput.value = data.product_name || '';
                productInput.dispatchEvent(new Event('input', { bubbles: true }));
                productInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            const pieceInput = document.getElementById('pieceInput');
            if (pieceInput) {
                pieceInput.value = data.piece || '1';
                pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            const quantityInput = document.getElementById('quantityInput');
            if (quantityInput) {
                quantityInput.value = data.quantity || '1';
                quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            const shelfLifeInput = document.getElementById('shelfLifeInput');
            if (shelfLifeInput) {
                shelfLifeInput.value = data.shelf_life || '12';
                shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            const unitSelect = document.getElementById('unitSelect');
            if (unitSelect && data.unit) {
                for (let option of unitSelect.options) {
                    if (option.value === data.unit || option.text.toLowerCase().includes(data.unit.toLowerCase())) {
                        option.selected = true;
                        unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                        break;
                    }
                }
            }
            
            const storageSelect = document.getElementById('storageSelect');
            if (storageSelect && data.storage) {
                for (let option of storageSelect.options) {
                    if (option.value === data.storage || option.text.toLowerCase().includes(data.storage.toLowerCase())) {
                        option.selected = true;
                        storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                        break;
                    }
                }
            }
            
            if (typeof updateExpiryDate === 'function') {
                try { updateExpiryDate(); } catch(e) {}
            }
            
            showVoiceStatus(`✅ Uneto: ${data.product_name} (${data.quantity} ${data.unit})`, '#4CAF50');
        }, 200);
    }

    function sacuvajPodatke(data) {
        ALLOW_INVENTORY_OPEN = false;
        END_AKTIVAN = false;
        isVoiceInput = true;
        window._isVoiceInput = true;
        
        const originalShowModernAlert = window.showModernAlert;
        const originalAlert = window.alert;
        window.showModernAlert = function() {};
        window.alert = function() {};
        
        let saved = false;
        popuniFormuPodacima(data);
        
        setTimeout(() => {
            if (typeof saveProduct === 'function') {
                try { 
                    saveProduct(); 
                    saved = true; 
                } catch(e) { console.warn(e); }
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
                } catch(e) { console.warn(e); }
            }
            
            setTimeout(() => {
                window.showModernAlert = originalShowModernAlert;
                window.alert = originalAlert;
            }, 1000);
            
            if (saved) {
                showVoiceStatus(`✅ Sačuvano: ${data.product_name}`, '#4CAF50');
                if (typeof prikaziSveUnose === 'function') {
                    try { prikaziSveUnose(); } catch(e) {}
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
        
        if (typeof refreshInventoryData === 'function') { try { refreshInventoryData(); } catch(e) {} }
        
        setTimeout(() => {
            if (typeof openInventoryAndShowHighlight === 'function') {
                try { openInventoryAndShowHighlight(); } catch(e) {}
            } else if (typeof showScreen === 'function') {
                try { showScreen('inventoryScreen'); } catch(e) {}
            } else {
                const inv = document.getElementById('inventoryScreen');
                const main = document.getElementById('mainScreen');
                if (inv) {
                    if (main) main.style.display = 'none';
                    inv.style.display = 'flex';
                    inv.classList.add('active');
                }
            }
            showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
            ALLOW_INVENTORY_OPEN = false;
        }, 300);
    }

    // ============================================
    // 4. VOICE ENGINE (SPEECH RECOGNITION)
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
        const targetLang = getCurrentLanguageCode();
        recognition.lang = targetLang;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        END_AKTIVAN = false;
        isProcessingCommand = false;
        ALLOW_INVENTORY_OPEN = false;

        recognition.onstart = function() {
            micActive = true;
            showVoiceStatus(`🎤 Slušam [${targetLang}]... Recite komandu ili artikal`, '#2196F3');
            activeBuffer = '';
            isProcessingCommand = false;
        };

        recognition.onresult = function(event) {
            let interimText = '';
            let finalChunk = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result[0].transcript.trim();
                if (result.isFinal) finalChunk += (finalChunk ? ' ' : '') + transcript;
                else interimText += transcript;
            }
            
            if (finalChunk) activeBuffer += (activeBuffer ? ' ' : '') + finalChunk;
            const currentDisplay = activeBuffer + (interimText ? ' ' + interimText : '');
            showVoiceStatus(`🎤 [${targetLang}]: "${currentDisplay}"`, '#FFD700');
            
            if (isProcessingCommand) return;
            const lowerFull = activeBuffer.toLowerCase();

            // 1. Provera za END (Otvaranje zaliha)
            if (COMMAND_KEYWORDS.EXIT.some(k => lowerFull.includes(k))) {
                console.log('🏁 END/IZLAZ Detektovan');
                isProcessingCommand = true;
                END_AKTIVAN = true;
                ALLOW_INVENTORY_OPEN = true;
                
                let parts = activeBuffer.split(/\b(end|izlaz|kraj|close)\b/i);
                let itemText = parts[0].trim();
                if (itemText.length > 2) processAndSaveItem(itemText);
                
                activeBuffer = '';
                setTimeout(() => {
                    stopVoiceRecognition();
                    otvoriZaliheEkran();
                }, 500);
                return;
            }

            // 2. Provera za PLUS (Završetak pojedinačnog unosa)
            if (COMMAND_KEYWORDS.PLUS.some(k => lowerFull.includes(k))) {
                console.log('✅ PLUS Detektovan');
                isProcessingCommand = true;
                
                let parts = activeBuffer.split(/\b(plus|next|sledec|sledeće)\b/i);
                let itemText = parts[0].trim();
                if (itemText.length > 2) processAndSaveItem(itemText);
                
                activeBuffer = parts.slice(1).join('').trim();
                showVoiceStatus('✅ Sačuvano! Recite sledeći artikal...', '#4CAF50');
                
                setTimeout(() => {
                    isProcessingCommand = false;
                }, 800);
                return;
            }

            // 3. Provera za UNOS (Otvaranje forme)
            if (COMMAND_KEYWORDS.ENTRY.some(k => lowerFull.includes(k))) {
                console.log('📝 UNOS Detektovan');
                isProcessingCommand = true;
                ensureFormVisible();
                activeBuffer = '';
                setTimeout(() => { isProcessingCommand = false; }, 500);
                return;
            }
        };

        recognition.onerror = function(event) {
            console.error('⚠️ Mikrofon greška:', event.error);
            micActive = false;
            isProcessingCommand = false;
        };

        recognition.onend = function() {
            micActive = false;
            isProcessingCommand = false;
        };

        try {
            recognition.start();
        } catch(e) {
            console.error('❌ Greška pri startu mikrofona:', e);
        }
    }

    function stopVoiceRecognition() {
        if (recognition) {
            try { recognition.stop(); } catch(e) {}
            recognition = null;
        }
        micActive = false;
        activeBuffer = '';
        isProcessingCommand = false;
        showVoiceStatus('⏸️ Prepoznavanje zaustavljeno', '#aaa');
    }

    function restartMicrophone() {
        stopVoiceRecognition();
        setTimeout(startVoiceRecognition, 300);
    }

    function goBackFromVoice() {
        stopVoiceRecognition();
        document.querySelectorAll('.screen').forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
    }

    // ============================================
    // 5. GLOBALNI INLINE HANDLER (FIX ZA INLINE ONCLICK)
    // ============================================

    window.voiceCommand = function(cmd) {
        console.log('🖱️ Ručni/Inline poziv voiceCommand sa:', cmd);
        if (!cmd) return false;
        
        const commandLower = String(cmd).toLowerCase().trim();

        if (COMMAND_KEYWORDS.ENTRY.some(k => commandLower.includes(k))) {
            ensureFormVisible();
            return true;
        } else if (COMMAND_KEYWORDS.EXIT.some(k => commandLower.includes(k))) {
            window.goBackFromVoice();
            return true;
        } else {
            return window.processVoiceCommand(cmd);
        }
    };

    window.processVoiceCommand = function(command) {
        if (!command) return false;
        return processAndSaveItem(command);
    };

    // Globalni ekspotati
    window.startVoiceRecognition = startVoiceRecognition;
    window.stopVoiceRecognition = stopVoiceRecognition;
    window.restartMicrophone = restartMicrophone;
    window.goBackFromVoice = goBackFromVoice;
    window.goBack = goBackFromVoice;
    window.selectVoiceMode = function() {
        ensureFormVisible();
        startVoiceRecognition();
    };

    window.prikaziTrenutnePodatke = function() {
        if (lastSavedData) showVoiceStatus(`📊 Trenutno: ${lastSavedData.product_name}`, '#4CAF50');
    };

    window.ocistiFormu = function() {
        ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    };

    // Overide za saveProduct da se podaci zadrže u formi
    const originalSaveProduct = window.saveProduct;
    window.saveProduct = function() {
        const productInput = document.getElementById('productInput');
        const val = productInput ? productInput.value : '';
        
        if (typeof originalSaveProduct === 'function') {
            try { originalSaveProduct(); } catch(e) {}
        }
        
        setTimeout(() => {
            if (productInput && val) productInput.value = val;
            prikaziPoljaZaUnos();
        }, 100);
    };

    console.log('✅ voiceCommands.js v5.2 (Senior Edition) uspesno ucitan i sinhronizovan!');
})();
