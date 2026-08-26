// ============================================
// VOICE COMMANDS - SAMOSTALNI MODUL (BEZ MENJANJA SCRIPT1.JS)
// ============================================

(function () {
    console.log('🎙️ voiceCommands.js se učitava...');

    // Pomoćni objekti za konverziju reči u brojeve i jedinice
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

    // Parsiranje izgovorenog teksta u objekte forme
    function parseVoiceDataEntry(command) {
        let text = command.replace(/^(unos|unesi|dodaj)\s*/i, '').trim();
        let words = text.split(/\s+/).map(s => s.trim()).filter(Boolean);

        let result = {
            product_name: '', piece: '1', quantity: '1',
            unit: 'kom', shelf_life: '12', storage: 'Zamrzivač 1'
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

        result.product_name = nameParts.filter(p => !/^\d+$/.test(p)).join(' ').trim() || 'Proizvod';
        if (foundUnit) result.unit = foundUnit;
        if (foundStorage) result.storage = foundStorage;

        return result;
    }

    // Automatska popuna i čuvanje bez otvaranja praznih ekrana
    function sacuvajIzgovoreno(data) {
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

        setTimeout(() => {
            if (typeof window.saveProduct === 'function') {
                window.saveProduct();
            } else if (typeof window.handleFormSubmit === 'function') {
                window.handleFormSubmit();
            }
        }, 200);
    }

    // Glavni procesor koji `script1.js` poziva preko window.voiceCommand / window.processVoiceCommand
    function processVoiceCommand(command) {
        if (!command) return false;
        console.log('🎤 Glasovna komanda primljena:', command);

        const lower = command.toLowerCase().trim();
        const lang = typeof window.currentLang !== 'undefined' ? window.currentLang : 'sr';

        // Navigacija
        if (lower === 'zalihe' || lower === 'otvori zalihe') {
            if (typeof window.renderInventory === 'function') window.renderInventory(lang);
            return true;
        }

        if (lower === 'spisak' || lower === 'otvori spisak') {
            if (typeof window.renderShoppingList === 'function') window.renderShoppingList(lang);
            return true;
        }

        if (lower === 'unos' || lower === 'unesi') {
            if (typeof window.renderDataEntry === 'function') window.renderDataEntry('');
            return true;
        }

        // Diktiranje artikla (npr. "svinjsko meso 2 kg")
        if (lower.length > 3) {
            let parsed = parseVoiceDataEntry(command);
            sacuvajIzgovoreno(parsed);

            if (lower.includes('end')) {
                setTimeout(() => {
                    if (typeof window.renderInventory === 'function') window.renderInventory(lang);
                }, 500);
            }
            return true;
        }

        return false;
    }

    // Rešenje za dugme Nazad sa ekrana
    window.goBack = function() {
        const lang = typeof window.currentLang !== 'undefined' ? window.currentLang : 'sr';
        if (typeof window.renderCategories === 'function') {
            window.renderCategories(lang);
        } else if (typeof window.showScreen === 'function') {
            window.showScreen('categories');
        }
    };

    // Povezivanje sa script1.js bez menjanja script1.js
    window.processVoiceCommand = processVoiceCommand;
    window.voiceCommand = processVoiceCommand;

    console.log('✅ voiceCommands.js spreman i povezan sa script1.js!');
})();
