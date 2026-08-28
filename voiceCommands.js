// ============================================
// VOICE COMMANDS - RADNA VERZIJA
// ============================================

(function () {
    console.log('🎙️ voiceCommands.js se učitava...');

    let isProcessing = false;
    let lastCommandTime = 0;
    let lastCommand = '';
    let isDataEntryMode = false;  // <- PRATI DA LI SMO NA DATA ENTRY

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

    function parseVoiceDataEntry(command) {
        let text = command.replace(/^(unos|unesi|dodaj|add|start)\s*/i, '').trim();
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
            if (STORAGE_MAP[w]) { foundStorage = STORAGE_MAP[w]; storageIndex = i; }
            if (UNIT_MAP[w]) { foundUnit = UNIT_MAP[w]; unitIndex = i; }
        }

        for (let i = 0; i < words.length; i++) {
            let w = words[i].toLowerCase();
            if (i === storageIndex || i === unitIndex || skipWords.includes(w)) continue;

            let numVal = getNumber(w);
            if (numVal !== null) numbers.push(numVal);
            else nameParts.push(words[i]);
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

        let meseciMatch = text.match(/(\d+)\s*meseci/);
        if (meseciMatch) result.shelf_life = meseciMatch[1];
        else if (numbers.length >= 3) result.shelf_life = numbers[2];

        let cleanName = nameParts.filter(p => !/^\d+$/.test(p) && p.toLowerCase() !== 'start').join(' ').trim();
        result.product_name = cleanName || 'Proizvod';
        if (foundUnit) result.unit = foundUnit;
        if (foundStorage) result.storage = foundStorage;

        return result;
    }

    function sacuvajIzgovoreno(data) {
        console.log('💾 Čuvam podatke:', data);
        
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
        
        console.log('✅ Proizvod sačuvan:', productData.product_name);
        
        if (typeof prikaziSveUnose === 'function') {
            setTimeout(function() {
                prikaziSveUnose();
            }, 200);
        }
    }

    function processVoiceCommand(command) {
        if (!command || isProcessing) return false;
        
        const now = Date.now();
        if (now - lastCommandTime < 2000) {
            console.log('⏳ Prebrzo, čekam...');
            return false;
        }
        
        console.log('🎤 Glasovna komanda primljena:', command);
        const lower = command.toLowerCase().trim();
        const lang = typeof window.currentLang !== 'undefined' ? window.currentLang : 'sr';

        // SPREČI DUPLIRANJE ISTE KOMANDE
        if (lower === lastCommand && now - lastCommandTime < 3000) {
            console.log('⏭️ Duplikat komande, ignorišem:', lower);
            return false;
        }
        lastCommand = lower;
        lastCommandTime = now;

        isProcessing = true;
        setTimeout(function() { 
            isProcessing = false; 
        }, 1500);

        // ===== REZERVISANE REČI =====
        const reservedWords = ['start', 'kreni', 'počni', 'go', 'begin'];
        if (reservedWords.includes(lower)) {
            console.log('⏭️ Rezervisana reč, ignorišem:', lower);
            return true;
        }

        // ===== KOMANDA: END =====
        if (lower === 'end' || lower === 'kraj') {
            console.log('🏁 Kraj unosa, otvaram zalihe...');
            isDataEntryMode = false;
            if (typeof window.renderInventory === 'function') {
                window.renderInventory(lang);
            }
            return true;
        }

        // ===== KOMANDA: ZALIHE =====
        if (lower === 'zalihe' || lower === 'otvori zalihe' || lower === 'stanje') {
            isDataEntryMode = false;
            if (typeof window.renderInventory === 'function') {
                window.renderInventory(lang);
            }
            return true;
        }

        // ===== KOMANDA: SPISAK =====
        if (lower === 'spisak' || lower === 'otvori spisak' || lower === 'potrebe') {
            isDataEntryMode = false;
            if (typeof window.renderShoppingList === 'function') {
                window.renderShoppingList(lang);
            }
            return true;
        }

        // ===== KOMANDA: UNOS =====
        if (lower === 'unos' || lower === 'unesi' || lower === 'add') {
            console.log('📝 Otvaram ekran za unos...');
            isDataEntryMode = true;  // <- UKLJUČUJEMO REŽIM UNOSA
            if (typeof window.renderDataEntry === 'function') {
                window.renderDataEntry('');
            }
            return true;
        }

        // ===== DIKTIRANJE ARTIKLA - SAMO AKO SMO U REŽIMU UNOSA =====
        if (isDataEntryMode && lower.length > 2) {
            console.log('📝 REŽIM UNOSA - diktiranje:', command);
            const cleanCommand = command.replace(/^(start|kreni|počni|go|begin)\s*/i, '').trim();
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

    // GO BACK
    window.goBack = function() {
        var lang = typeof window.currentLang !== 'undefined' ? window.currentLang : 'sr';
        var currentScreen = window.currentScreen || 'categories';
        
        console.log('⬅️ goBack pozvan, trenutni ekran:', currentScreen);
        
        // Ako smo na dataEntry, vrati se na choiceScreen
        if (currentScreen === 'dataEntry') {
            console.log('📱 Vraćam se na choiceScreen');
            isDataEntryMode = false;
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
            console.log('📜 Vraćam se na:', previousScreen);
            window.currentScreen = previousScreen;
            
            switch(previousScreen) {
                case 'inventory':
                    if (typeof window.renderInventory === 'function') {
                        window.renderInventory(lang);
                    }
                    break;
                case 'dataEntry':
                    if (typeof window.renderDataEntry === 'function') {
                        window.renderDataEntry('');
                    }
                    break;
                case 'shoppingList':
                    if (typeof window.renderShoppingList === 'function') {
                        window.renderShoppingList(lang);
                    }
                    break;
                default:
                    if (typeof window.renderCategories === 'function') {
                        window.renderCategories(lang);
                        window.currentScreen = 'categories';
                    }
            }
            return;
        }
        
        console.log('🏠 Nema istorije, idem na choiceScreen');
        if (typeof window.showScreen === 'function') {
            window.showScreen('choiceScreen');
            window.currentScreen = 'choice';
        }
    };

    window.processVoiceCommand = processVoiceCommand;
    window.voiceCommand = processVoiceCommand;

    console.log('✅ voiceCommands.js spreman!');
})();
