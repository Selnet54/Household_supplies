// ============================================
// VOICE COMMANDS - KONAČNA VERZIJA
// ============================================

(function() {
    console.log('🎙️ voiceCommands.js se učitava...');

    let isProcessing = false;
    let lastCommandTime = 0;
    let dictationTimeout = null;
    let pendingText = '';

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
        'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg', 'kilogrami': 'kg',
        'gram': 'g', 'grama': 'g', 'g': 'g', 'grami': 'g',
        'litar': 'l', 'litara': 'l', 'l': 'l', 'litri': 'l',
        'komad': 'kom', 'komada': 'kom', 'kom': 'kom', 'komadi': 'kom',
        'paket': 'pak', 'paketa': 'pak', 'pak': 'pak', 'paketi': 'pak'
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

    function getCurrentLang() {
        return typeof window.currentLang !== 'undefined' ? window.currentLang : 'sr';
    }

    function parseVoiceDataEntry(command) {
        let text = command.replace(/^(unos|unesi|dodaj|add)\s*/i, '').trim();
        let words = text.split(/\s+/).map(s => s.trim()).filter(Boolean);

        let result = {
            product_name: '',
            piece: '1',
            quantity: '1',
            unit: 'kom',
            shelf_life: '12',
            storage: 'Zamrzivač 1'
        };

        let foundStorage = null, foundUnit = null;
        let unitIndex = -1, storageIndex = -1;
        let numbers = [], nameParts = [];
        let skipWords = ['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima', 'i'];

        for (let i = 0; i < words.length; i++) {
            let w = words[i].toLowerCase();
            for (let key in STORAGE_MAP) {
                if (w === key || w.includes(key) || key.includes(w)) {
                    foundStorage = STORAGE_MAP[key];
                    storageIndex = i;
                    break;
                }
            }
            for (let key in UNIT_MAP) {
                if (w === key || w.includes(key) || key.includes(w)) {
                    foundUnit = UNIT_MAP[key];
                    unitIndex = i;
                    break;
                }
            }
        }

        for (let i = 0; i < words.length; i++) {
            let w = words[i].toLowerCase();
            if (i === storageIndex || i === unitIndex || skipWords.includes(w)) continue;

            let isStorage = false;
            for (let key in STORAGE_MAP) {
                if (w === key || w.includes(key) || key.includes(w)) { isStorage = true; break; }
            }
            if (isStorage) continue;

            let isUnit = false;
            for (let key in UNIT_MAP) {
                if (w === key || w.includes(key) || key.includes(w)) { isUnit = true; break; }
            }
            if (isUnit) continue;

            let numVal = getNumber(w);
            if (numVal !== null) {
                numbers.push(numVal);
            } else {
                nameParts.push(words[i]);
            }
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
            if (numbers.length >= 1) {
                result.piece = numbers[0];
                result.quantity = numbers[0];
            }
        }

        let usedNumbers = (foundUnit === 'kg' || foundUnit === 'g' || foundUnit === 'l') ? 2 : 1;
        let meseciMatch = text.match(/(\d+)\s*meseci/);
        if (meseciMatch) {
            result.shelf_life = meseciMatch[1];
        } else if (numbers.length > usedNumbers) {
            result.shelf_life = numbers[usedNumbers];
        }

        result.product_name = nameParts.filter(p => !/^\d+$/.test(p)).join(' ').trim() || 'Proizvod';
        if (foundUnit) result.unit = foundUnit;
        if (foundStorage) result.storage = foundStorage;

        console.log('📦 Parsirani podaci:', result);
        return result;
    }

    function sacuvajIzgovoreno(data) {
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) {
                el.value = val;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        console.log('💾 Čuvam podatke:', data);

        setVal('productInput', data.product_name);
        setVal('pieceInput', data.piece);
        setVal('quantityInput', data.quantity);
        setVal('shelfLifeInput', data.shelf_life);

        if (data.storage) {
            const storageSelect = document.getElementById('storageSelect');
            if (storageSelect) {
                for (let i = 0; i < storageSelect.options.length; i++) {
                    if (storageSelect.options[i].value === data.storage) {
                        storageSelect.selectedIndex = i;
                        break;
                    }
                }
            }
        }

        setTimeout(function() {
            if (typeof window.saveProductSilent === 'function') {
                window.saveProductSilent();
            }
        }, 200);
    }

    function startVoiceRecognition() {
        console.log('🎤 startVoiceRecognition POZVAN!');
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('❌ Speech recognition nije podržan!');
            return;
        }

        if (window.recognition) {
            try { window.recognition.stop(); } catch(e) {}
            window.recognition = null;
        }

        const recognition = new SpeechRecognition();
        window.recognition = recognition;
        
        const lang = getCurrentLang();
        const speechLangMap = {
            sr: 'sr-RS', en: 'en-US', de: 'de-DE', hu: 'hu-HU',
            uk: 'uk-UA', ru: 'ru-RU', zh: 'zh-CN', es: 'es-ES',
            pt: 'pt-PT', fr: 'fr-FR'
        };
        recognition.lang = speechLangMap[lang] || 'sr-RS';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = function() {
            console.log('🎤 MIKROFON AKTIVAN!');
        };

        recognition.onresult = function(event) {
            let finalText = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalText += event.results[i][0].transcript;
                }
            }
            if (finalText) {
                console.log('🗣️ Prepoznato:', finalText);
                
                if (dictationTimeout) {
                    clearTimeout(dictationTimeout);
                    dictationTimeout = null;
                }
                
                pendingText = finalText;
                dictationTimeout = setTimeout(function() {
                    processVoiceCommand(pendingText);
                    dictationTimeout = null;
                    pendingText = '';
                }, 1500);
            }
        };

        recognition.onerror = function(event) {
            console.error('⚠️ Greška:', event.error);
        };

        recognition.onend = function() {
            console.log('🎤 Prepoznavanje završeno.');
        };

        try {
            recognition.start();
            console.log('✅ Mikrofon pokrenut!');
        } catch(e) {
            console.error('❌ Greška:', e);
        }
    }

    function stopVoiceRecognition() {
        console.log('🛑 stopVoiceRecognition POZVAN!');
        if (window.recognition) {
            try {
                window.recognition.stop();
                window.recognition = null;
            } catch(e) {}
        }
        if (dictationTimeout) {
            clearTimeout(dictationTimeout);
            dictationTimeout = null;
        }
    }

    function processVoiceCommand(command) {
        if (!command || isProcessing) return false;
        
        const now = Date.now();
        if (now - lastCommandTime < 2000) {
            console.log('⏳ Prebrzo, čekam...');
            return false;
        }
        lastCommandTime = now;
        
        console.log('🎤 Glasovna komanda primljena:', command);
        const lower = command.toLowerCase().trim();
        const lang = getCurrentLang();

        isProcessing = true;
        setTimeout(function() { 
            isProcessing = false; 
        }, 1500);

        // REZERVISANE REČI
        const reservedWords = ['start', 'go'];
        if (reservedWords.includes(lower)) {
            console.log('⏭️ Rezervisana reč, ignorišem:', lower);
            return true;
        }

        // PLUS - sačuvaj i očisti za novi unos
        if (lower === 'plus') {
            console.log('➕ Plus - čuvam podatke');
            if (typeof window.saveProductSilent === 'function') {
                const productInput = document.getElementById('productInput');
                if (productInput && productInput.value.trim() !== '') {
                    window.saveProductSilent();
                    setTimeout(function() {
                        ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput', 'descriptionInput'].forEach(function(id) {
                            const el = document.getElementById(id);
                            if (el) el.value = '';
                        });
                        const p = document.getElementById('productInput');
                        if (p) { p.focus(); p.select(); }
                        console.log('✅ Polja očišćena za novi unos');
                    }, 300);
                }
            }
            return true;
        }

        // END - završava unos i otvara zalihe
        if (lower === 'end' || lower === 'kraj') {
            console.log('🏁 End - završavam unos');
            if (typeof window.saveProductSilent === 'function') {
                const productInput = document.getElementById('productInput');
                if (productInput && productInput.value.trim() !== '') {
                    window.saveProductSilent();
                }
            }
            if (typeof window.renderInventory === 'function') {
                window.renderInventory(lang);
            }
            return true;
        }

        // EXIT
        if (lower === 'exit' || lower === 'izlaz') {
            console.log('🚪 IZLAZ');
            if (typeof window.exitApp === 'function') {
                window.exitApp();
            }
            return true;
        }

        // ZALIHE
        if (lower === 'zalihe' || lower === 'stanje' || lower === 'inventory') {
            console.log('📦 ZALIHE');
            if (typeof window.renderInventory === 'function') {
                window.renderInventory(lang);
            }
            return true;
        }

        // SPISAK
        if (lower === 'spisak' || lower === 'potrebe' || lower === 'shopping') {
            console.log('🛒 SPISAK');
            if (typeof window.renderShoppingList === 'function') {
                window.renderShoppingList(lang);
            }
            return true;
        }

        // UNOS
        if (lower === 'unos' || lower === 'unesi' || lower === 'add') {
            console.log('📝 Otvaram ekran za unos...');
            if (typeof window.renderDataEntry === 'function') {
                window.renderDataEntry('');
            }
            return true;
        }

        // DIKTIRANJE
        const isDataEntry = window.currentScreen === 'dataEntry' || 
                            window.currentScreenState === 'dataEntry' || 
                            document.getElementById('productInput') !== null;

        if (isDataEntry && command.length > 3) {
            let cleanCommand = command.replace(/^(start|go)\s*/i, '').trim();
            cleanCommand = cleanCommand.replace(/\s+/g, ' ').trim();
            
            console.log('🧹 Očišćena komanda:', cleanCommand);
            
            if (cleanCommand.length > 2) {
                var parsed = parseVoiceDataEntry(cleanCommand);
                if (parsed.product_name && parsed.product_name !== 'Proizvod' && parsed.product_name.length > 1) {
                    sacuvajIzgovoreno(parsed);
                    return true;
                }
            }
        }

        return false;
    }

    // ===== IZVOZ =====
    window.startVoiceRecognition = startVoiceRecognition;
    window.stopVoiceRecognition = stopVoiceRecognition;
    window.processVoiceCommand = processVoiceCommand;
    window.voiceCommand = processVoiceCommand;

    console.log('✅ voiceCommands.js spreman!');
})();
