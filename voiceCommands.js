// ============================================
// VOICE COMMANDS - POPRAVLJENA VERZIJA
// ============================================

(function () {
    console.log('🎙️ voiceCommands.js se učitava...');

    let isProcessing = false;
    let lastCommandTime = 0;
    let lastCommand = '';
    let isDataEntryMode = false;
    let currentProductText = '';

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

    function getUnit(word) {
        const w = word.toLowerCase();
        for (let key in UNIT_MAP) {
            if (w.includes(key) || key.includes(w)) {
                return UNIT_MAP[key];
            }
        }
        return null;
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

    function parseVoiceDataEntry(text) {
        console.log('🔍 PARSIRAM:', text);
        
        // Očisti od "start" i "plus"
        let cleanText = text
            .replace(/^(start|kreni|počni|go|begin)\s*/i, '')
            .replace(/\b(plus|end|kraj)\b.*$/i, '')
            .trim();
        
        let words = cleanText.split(/\s+/).map(s => s.trim()).filter(Boolean);
        console.log('📝 REČI:', words);

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

        // Pronađi jedinicu i skladište
        for (let i = 0; i < words.length; i++) {
            let w = words[i].toLowerCase();
            let storageMatch = getStorage(w);
            if (storageMatch) { 
                foundStorage = storageMatch; 
                storageIndex = i; 
                console.log('🏠 Skladište:', foundStorage);
            }
            let unitMatch = getUnit(w);
            if (unitMatch) { 
                foundUnit = unitMatch; 
                unitIndex = i; 
                console.log('📏 Jedinica:', foundUnit);
            }
        }

        // Specijalni slučajevi za jedinice
        if (cleanText.includes('gram') || cleanText.includes('grama')) {
            foundUnit = 'g';
            console.log('🔍 Grami -> g');
        } else if (cleanText.includes('kilogram') || cleanText.includes('kg')) {
            foundUnit = 'kg';
            console.log('🔍 Kilogrami -> kg');
        } else if (cleanText.includes('litar') || cleanText.includes('litara')) {
            foundUnit = 'l';
            console.log('🔍 Litri -> l');
        }

        // Izdvoji brojeve i naziv
        for (let i = 0; i < words.length; i++) {
            let w = words[i].toLowerCase();
            if (i === storageIndex || i === unitIndex || skipWords.includes(w)) continue;

            let numVal = getNumber(w);
            if (numVal !== null) {
                numbers.push(numVal);
                console.log('🔢 Broj:', numVal);
            } else {
                nameParts.push(words[i]);
            }
        }

        console.log('📊 Brojevi:', numbers);
        console.log('📊 Naziv delovi:', nameParts);

        // Rasporedi brojeve
        if (foundUnit === 'kg' || foundUnit === 'g' || foundUnit === 'l') {
            if (numbers.length >= 2) {
                result.piece = numbers[0];
                result.quantity = numbers[1];
                console.log('📦 Težina: komad=' + numbers[0] + ', količina=' + numbers[1] + foundUnit);
            } else if (numbers.length === 1) {
                result.piece = '0';
                result.quantity = numbers[0];
                console.log('📦 Težina: komad=0, količina=' + numbers[0] + foundUnit);
            }
        } else {
            if (numbers.length >= 2) {
                result.piece = numbers[0];
                result.quantity = numbers[1];
                console.log('📦 Kom: komad=' + numbers[0] + ', količina=' + numbers[1]);
            } else if (numbers.length === 1) {
                result.piece = numbers[0];
                result.quantity = numbers[0];
                console.log('📦 Kom: komad=' + numbers[0] + ', količina=' + numbers[0]);
            }
        }

        // Rok trajanja
        let meseciMatch = cleanText.match(/(\d+)\s*meseci/);
        if (meseciMatch) {
            result.shelf_life = meseciMatch[1];
            console.log('🔍 Rok:', meseciMatch[1]);
        } else if (numbers.length >= 3) {
            result.shelf_life = numbers[2];
            console.log('🔍 Rok (treći broj):', numbers[2]);
        }

        // Naziv proizvoda
        let cleanName = nameParts.filter(p => {
            const lower = p.toLowerCase();
            return !/^\d+$/.test(p) && 
                   !getUnit(lower) && 
                   !getStorage(lower) &&
                   !['plus', 'end', 'kraj', 'start', 'kreni', 'počni'].includes(lower);
        }).join(' ').trim();
        
        result.product_name = cleanName || 'Proizvod';
        console.log('📛 Naziv:', result.product_name);
        
        if (foundUnit) result.unit = foundUnit;
        if (foundStorage) result.storage = foundStorage;

        console.log('✅ REZULTAT:', result);
        return result;
    }

    function prikaziUFormi(data) {
        console.log('📝 Prikazujem:', data.product_name);
        
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) {
                el.value = val;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        setVal('productInput', data.product_name);
        setVal('pieceInput', data.piece);
        setVal('quantityInput', data.quantity);
        setVal('shelfLifeInput', data.shelf_life);

        const unitSelect = document.getElementById('unitSelect');
        if (unitSelect && data.unit) {
            for (let opt of unitSelect.options) {
                if (opt.value === data.unit) {
                    opt.selected = true;
                    break;
                }
            }
        }

        const storageSelect = document.getElementById('storageSelect');
        if (storageSelect && data.storage) {
            for (let opt of storageSelect.options) {
                if (opt.value === data.storage || opt.text.includes(data.storage)) {
                    opt.selected = true;
                    break;
                }
            }
        }

        if (typeof updateExpiryDate === 'function') {
            try { updateExpiryDate(); } catch(e) {}
        }
    }

    function sacuvajProizvod(data) {
        console.log('💾 Čuvam:', data.product_name);
        
        const productData = {
            id: Date.now(),
            product_name: data.product_name,
            description: document.getElementById('descriptionInput')?.value.trim() || '',
            piece: data.piece,
            quantity: parseFloat(data.quantity),
            unit: data.unit,
            entry_date: new Date().toISOString().split('T')[0],
            shelf_life_months: parseInt(data.shelf_life),
            storage_location: data.storage
        };
        
        let zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
        zalihe.push(productData);
        localStorage.setItem('zalihe', JSON.stringify(zalihe));
        
        console.log('✅ Sačuvan:', productData.product_name);
        
        if (typeof prikaziSveUnose === 'function') {
            setTimeout(function() { prikaziSveUnose(); }, 200);
        }
        
        // Očisti formu za sledeći unos
        setTimeout(function() {
            const productInput = document.getElementById('productInput');
            if (productInput) productInput.value = '';
            const pieceInput = document.getElementById('pieceInput');
            if (pieceInput) pieceInput.value = '';
            const quantityInput = document.getElementById('quantityInput');
            if (quantityInput) quantityInput.value = '';
            const shelfLifeInput = document.getElementById('shelfLifeInput');
            if (shelfLifeInput) shelfLifeInput.value = '';
            currentProductText = '';
        }, 300);
    }

    function startVoiceRecognition() {
        console.log('🎤 startVoiceRecognition POZVAN!');
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('❌ Nije podržan!');
            return;
        }

        if (window.recognition) {
            try { window.recognition.stop(); } catch(e) {}
            window.recognition = null;
        }

        const recognition = new SpeechRecognition();
        window.recognition = recognition;
        
        const lang = typeof currentLang !== 'undefined' ? currentLang : 'sr';
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
                processVoiceCommand(finalText);
            }
        };

        recognition.onerror = function(event) {
            console.error('⚠️ Greška:', event.error);
        };

        recognition.onend = function() {
            console.log('🎤 Prepoznavanje završeno.');
            // RESTARTUJ MIKROFON AKO SMO U REŽIMU UNOSA
            if (isDataEntryMode) {
                console.log('🔄 Restartujem mikrofon...');
                setTimeout(function() {
                    startVoiceRecognition();
                }, 500);
            }
        };

        try {
            recognition.start();
            console.log('✅ Mikrofon pokrenut!');
        } catch(e) {
            console.error('❌ Greška:', e);
        }
    }

    function stopVoiceRecognition() {
        console.log('🛑 stopVoiceRecognition');
        if (window.recognition) {
            try {
                window.recognition.stop();
                window.recognition = null;
            } catch(e) {}
        }
        currentProductText = '';
    }

    function processVoiceCommand(command) {
        if (!command || isProcessing) return false;
        
        const now = Date.now();
        if (now - lastCommandTime < 1500) {
            console.log('⏳ Prebrzo...');
            return false;
        }
        
        console.log('🎤 Komanda:', command);
        const lower = command.toLowerCase().trim();
        const lang = typeof window.currentLang !== 'undefined' ? window.currentLang : 'sr';

        if (lower === lastCommand && now - lastCommandTime < 3000) {
            console.log('⏭️ Duplikat');
            return false;
        }
        lastCommand = lower;
        lastCommandTime = now;

        isProcessing = true;
        setTimeout(function() { isProcessing = false; }, 1500);

        // REZERVISANE REČI
        const reservedWords = ['start', 'kreni', 'počni', 'go', 'begin'];
        if (reservedWords.includes(lower)) {
            console.log('⏭️ Ignorišem:', lower);
            return true;
        }

        // ===== END =====
        if (lower === 'end' || lower === 'kraj' || lower.includes('end') || lower.includes('kraj')) {
            console.log('🏁 END - otvaram zalihe');
            isDataEntryMode = false;
            const beforeEnd = command.split(/end|kraj/i)[0].trim();
            if (beforeEnd.length > 3) {
                var parsed = parseVoiceDataEntry(beforeEnd);
                if (parsed.product_name && parsed.product_name !== 'Proizvod' && parsed.product_name.length > 1) {
                    sacuvajProizvod(parsed);
                }
            }
            currentProductText = '';
            if (typeof window.renderInventory === 'function') {
                window.renderInventory(lang);
            }
            return true;
        }

        // ===== PLUS =====
        if (lower.includes('plus')) {
            console.log('➕ PLUS - čuvam');
            const beforePlus = command.split(/plus/i)[0].trim();
            if (beforePlus.length > 3) {
                var parsed = parseVoiceDataEntry(beforePlus);
                if (parsed.product_name && parsed.product_name !== 'Proizvod' && parsed.product_name.length > 1) {
                    sacuvajProizvod(parsed);
                }
            }
            currentProductText = '';
            return true;
        }

        // ZALIHE
        if (lower === 'zalihe' || lower === 'otvori zalihe' || lower === 'stanje') {
            console.log('📦 ZALIHE');
            isDataEntryMode = false;
            currentProductText = '';
            if (typeof window.renderInventory === 'function') {
                window.renderInventory(lang);
            }
            return true;
        }

        // SPISAK
        if (lower === 'spisak' || lower === 'otvori spisak' || lower === 'potrebe') {
            console.log('🛒 SPISAK');
            isDataEntryMode = false;
            currentProductText = '';
            if (typeof window.renderShoppingList === 'function') {
                window.renderShoppingList(lang);
            }
            return true;
        }

        // EXIT
        if (lower === 'exit' || lower === 'izlaz' || lower === 'napusti') {
            console.log('🚪 EXIT');
            isDataEntryMode = false;
            currentProductText = '';
            if (typeof window.exitApp === 'function') {
                window.exitApp();
            }
            return true;
        }

        // UNOS
        if (lower === 'unos' || lower === 'unesi' || lower === 'add') {
            console.log('📝 UNOS');
            isDataEntryMode = true;
            currentProductText = '';
            if (typeof window.renderDataEntry === 'function') {
                window.renderDataEntry('');
            }
            return true;
        }

        // ===== DIKTIRANJE - SAMO PRIKAZUJE =====
        if (isDataEntryMode && lower.length > 3 && !lower.includes('plus') && !lower.includes('end')) {
            const cleanCommand = command.replace(/^(start|kreni|počni|go|begin)\s*/i, '').trim();
            if (cleanCommand.length > 3) {
                if (currentProductText) {
                    currentProductText += ' ' + cleanCommand;
                } else {
                    currentProductText = cleanCommand;
                }
                console.log('📝 Trenutno:', currentProductText);
                
                var parsed = parseVoiceDataEntry(currentProductText);
                if (parsed.product_name && parsed.product_name !== 'Proizvod' && parsed.product_name.length > 1) {
                    prikaziUFormi(parsed);
                }
            }
            return true;
        }

        return false;
    }

    // GO BACK
    window.goBack = function() {
        var lang = typeof window.currentLang !== 'undefined' ? window.currentLang : 'sr';
        var currentScreen = window.currentScreen || 'categories';
        
        console.log('⬅️ goBack, trenutni:', currentScreen);
        
        if (currentScreen === 'dataEntry') {
            console.log('📱 Vraćam na choiceScreen');
            isDataEntryMode = false;
            currentProductText = '';
            window.screenHistory = [];
            window.currentScreen = 'choice';
            if (typeof window.showScreen === 'function') {
                window.showScreen('choiceScreen');
            }
            return;
        }
        
        if (!window.screenHistory) {
            window.screenHistory = [];
        }
        
        if (window.screenHistory.length > 0) {
            var previousScreen = window.screenHistory.pop();
            window.currentScreen = previousScreen;
            switch(previousScreen) {
                case 'inventory':
                    if (typeof window.renderInventory === 'function') window.renderInventory(lang);
                    break;
                case 'dataEntry':
                    if (typeof window.renderDataEntry === 'function') window.renderDataEntry('');
                    break;
                case 'shoppingList':
                    if (typeof window.renderShoppingList === 'function') window.renderShoppingList(lang);
                    break;
                default:
                    if (typeof window.renderCategories === 'function') {
                        window.renderCategories(lang);
                        window.currentScreen = 'categories';
                    }
            }
            return;
        }
        
        console.log('🏠 Idem na choiceScreen');
        if (typeof window.showScreen === 'function') {
            window.showScreen('choiceScreen');
            window.currentScreen = 'choice';
        }
    };

    // IZVOZ
    window.startVoiceRecognition = startVoiceRecognition;
    window.stopVoiceRecognition = stopVoiceRecognition;
    window.processVoiceCommand = processVoiceCommand;
    window.voiceCommand = processVoiceCommand;
    window._voiceCommandsStart = startVoiceRecognition;
    window._voiceCommandsStop = stopVoiceRecognition;

    console.log('✅ voiceCommands.js spreman!');
    console.log('📖 KOMANDE: unos, zalihe, spisak, exit, end, plus');
})();
