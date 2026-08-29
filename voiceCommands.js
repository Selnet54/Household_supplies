// ============================================
// VOICE COMMANDS - KONAČNA RADNA VERZIJA
// ============================================

(function() {
    console.log('🎙️ voiceCommands.js se učitava...');

    let isProcessing = false;
    let lastCommandTime = 0;
    let accumulatedText = '';
    let accumulatedTimeout = null;
    let currentProductData = null;

    // PROŠIRENE REČI ZA BROJEVE - DODATI SRPSKI REDNI BROJEVI
    const NUMBER_WORDS = {
        'nula': '0', 'jedan': '1', 'jedna': '1', 'jedno': '1', 'dva': '2', 'dve': '2',
        'tri': '3', 'četiri': '4', 'cetiri': '4', 'pet': '5', 'šest': '6', 'sest': '6',
        'sedam': '7', 'osam': '8', 'devet': '9', 'deset': '10', 'jedanaest': '11',
        'dvanaest': '12', 'trinaest': '13', 'četrnaest': '14', 'cetrnaest': '14',
        'petnaest': '15', 'šesnaest': '16', 'sesnaest': '16', 'sedamnaest': '17',
        'osamnaest': '18', 'devetnaest': '19', 'dvadeset': '20', 'trideset': '30',
        'četrdeset': '40', 'cetrdeset': '40', 'pedeset': '50', 'šezdeset': '60',
        'sezdeset': '60', 'sedamdeset': '70', 'osamdeset': '80', 'devedeset': '90', 'sto': '100',
        // DODATO ZA REDNE BROJEVE
        'prvi': '1', 'prva': '1', 'prvo': '1',
        'drugi': '2', 'druga': '2', 'drugo': '2',
        'treći': '3', 'treca': '3', 'trece': '3',
        'cetvrti': '4', 'cetvrta': '4', 'cetvrto': '4',
        'peti': '5', 'peta': '5', 'peto': '5',
        'šesti': '6', 'sesti': '6', 'šesta': '6', 'sesta': '6',
        'sedmi': '7', 'sedma': '7', 'sedmo': '7',
        'osmi': '8', 'osma': '8', 'osmo': '8',
        'deveti': '9', 'deveta': '9', 'deveto': '9',
        'deseti': '10', 'deseta': '10', 'deseto': '10'
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
        const match = w.match(/^(\d+(?:[.,]\d+)?)$/);
        if (match) return match[1].replace(',', '.');
        return null;
    }

    function getCurrentLang() {
        return typeof window.currentLang !== 'undefined' ? window.currentLang : 'sr';
    }

    function parseVoiceDataEntry(command) {
        console.log('🔍 Parsiram:', command);
        
        let text = command.replace(/^(unos|unesi|dodaj|add|start|go|stop|end|kraj|plus|zalihe|stanje|spisak|potrebe|nazad|back|odustani|exit|izlaz)\s*/i, '').trim();
        text = text.replace(/\s+(unos|unesi|dodaj|add|start|go|stop|end|kraj|plus|zalihe|stanje|spisak|potrebe|nazad|back|odustani|exit|izlaz)\s*/gi, ' ').trim();
        
        if (!text || text === 'start' || text === 'go') {
            return null;
        }
        
        let words = text.split(/\s+/).map(s => s.trim()).filter(Boolean);
        console.log('📝 Reči:', words);

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

        // PRONAĐI SKLADIŠTE I JEDINICU
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

        console.log('🏷️ Skladište:', foundStorage, 'Jedinica:', foundUnit);

        // OBRADI REČI
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

        console.log('🔢 Brojevi:', numbers, 'Imena:', nameParts);

        // ===== PARSIRANJE =====
        if (foundUnit === 'kg' || foundUnit === 'g' || foundUnit === 'l') {
            if (numbers.length >= 3) {
                result.piece = numbers[0];
                result.quantity = numbers[1];
                result.shelf_life = numbers[2];
            } else if (numbers.length === 2) {
                result.piece = numbers[0];
                result.quantity = numbers[1];
            } else if (numbers.length === 1) {
                result.piece = '0';
                result.quantity = numbers[0];
            }
        } else {
            if (numbers.length >= 2) {
                result.piece = numbers[0];
                result.quantity = numbers[0];
                result.shelf_life = numbers[1];
            } else if (numbers.length === 1) {
                result.piece = numbers[0];
                result.quantity = numbers[0];
            }
        }

        if (nameParts.length > 0) {
            result.product_name = nameParts.join(' ').trim();
        } else {
            result.product_name = 'Proizvod';
        }

        if (foundUnit) result.unit = foundUnit;
        if (foundStorage) result.storage = foundStorage;

        console.log('📦 Parsirani podaci:', result);
        return result;
    }

    function prikaziPodatkeUPoljima(data) {
        console.log('📝 Prikazujem u poljima:', data);
        
        if (!data) {
            console.warn('⚠️ Nema podataka za prikaz');
            return;
        }
        
        // DIREKTNO POSTAVI VREDNOSTI
        const productInput = document.getElementById('productInput');
        const pieceInput = document.getElementById('pieceInput');
        const quantityInput = document.getElementById('quantityInput');
        const shelfLifeInput = document.getElementById('shelfLifeInput');
        const storageSelect = document.getElementById('storageSelect');
        
        if (productInput) {
            productInput.value = data.product_name || '';
            productInput.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('✅ productInput =', data.product_name);
        }
        
        if (pieceInput) {
            pieceInput.value = data.piece || '1';
            pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('✅ pieceInput =', data.piece);
        }
        
        if (quantityInput) {
            quantityInput.value = data.quantity || '1';
            quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('✅ quantityInput =', data.quantity);
        }
        
        if (shelfLifeInput) {
            shelfLifeInput.value = data.shelf_life || '12';
            shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('✅ shelfLifeInput =', data.shelf_life);
        }

        if (storageSelect && data.storage) {
            for (let i = 0; i < storageSelect.options.length; i++) {
                if (storageSelect.options[i].value === data.storage) {
                    storageSelect.selectedIndex = i;
                    break;
                }
            }
            console.log('✅ storageSelect =', data.storage);
        }
        
        currentProductData = data;
        
        // AŽURIRAJ PREGLED UNOSA
        if (typeof window.prikaziSveUnose === 'function') {
            window.prikaziSveUnose();
        }
    }

    function ocistiPolja() {
        console.log('🧹 Čistim polja');
        ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput', 'descriptionInput'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const p = document.getElementById('productInput');
        if (p) { p.focus(); p.select(); }
        currentProductData = null;
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

        accumulatedText = '';

        recognition.onstart = function() {
            console.log('🎤 MIKROFON AKTIVAN!');
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = '🎤 Slušam...';
                statusEl.style.color = '#4CAF50';
            }
        };

        recognition.onresult = function(event) {
            let finalText = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalText += event.results[i][0].transcript;
                }
            }
            
            if (finalText) {
                const trimmed = finalText.trim().toLowerCase();
                if (trimmed === 'start' || trimmed === 'go') {
                    console.log('⏭️ Ignorišem "start" ili "go"');
                    return;
                }
                
                console.log('🗣️ Prepoznato:', finalText);
                accumulatedText = finalText;
                
                if (accumulatedTimeout) {
                    clearTimeout(accumulatedTimeout);
                }
                
                accumulatedTimeout = setTimeout(function() {
                    console.log('⏰ Obrada:', accumulatedText);
                    processVoiceCommand(accumulatedText);
                    accumulatedText = '';
                    accumulatedTimeout = null;
                }, 1500);
            }
        };

        recognition.onerror = function(event) {
            console.error('⚠️ Greška:', event.error);
        };

        recognition.onend = function() {
            console.log('🎤 Prepoznavanje završeno.');
            if (accumulatedText) {
                processVoiceCommand(accumulatedText);
                accumulatedText = '';
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
        console.log('🛑 stopVoiceRecognition POZVAN!');
        if (window.recognition) {
            try {
                window.recognition.stop();
                window.recognition = null;
            } catch(e) {}
        }
        if (accumulatedTimeout) {
            clearTimeout(accumulatedTimeout);
            accumulatedTimeout = null;
        }
        accumulatedText = '';
    }

    function processVoiceCommand(command) {
        if (!command || isProcessing) return false;
        
        const now = Date.now();
        if (now - lastCommandTime < 1000) {
            console.log('⏳ Prebrzo, čekam...');
            return false;
        }
        lastCommandTime = now;
        
        console.log('🎤 Komanda:', command);
        const lower = command.toLowerCase().trim();
        const lang = getCurrentLang();

        isProcessing = true;
        setTimeout(function() { isProcessing = false; }, 1000);

        // UNOS
        if (lower === 'unos' || lower === 'unesi' || lower === 'add' || lower === 'dodaj') {
            console.log('📝 Otvaram unos');
            if (typeof window.renderDataEntry === 'function') {
                window.renderDataEntry('');
                currentProductData = null;
            }
            return true;
        }

        // ZALIHE
        if (lower === 'zalihe' || lower === 'stanje' || lower === 'inventory') {
            console.log('📦 Zalihe');
            if (typeof window.renderInventory === 'function') {
                window.renderInventory(lang);
            }
            return true;
        }

        // SPISAK
        if (lower === 'spisak' || lower === 'potrebe' || lower === 'shopping') {
            console.log('🛒 Spisak');
            if (typeof window.renderShoppingList === 'function') {
                window.renderShoppingList(lang);
            }
            return true;
        }

        // PLUS
        if (lower === 'plus' || lower.includes(' plus')) {
            console.log('➕ Plus');
            const productInput = document.getElementById('productInput');
            if (productInput && productInput.value.trim() !== '') {
                if (typeof window.saveProductSilent === 'function') {
                    window.saveProductSilent();
                    console.log('✅ Sačuvan iz polja');
                    ocistiPolja();
                }
            } else if (currentProductData) {
                prikaziPodatkeUPoljima(currentProductData);
                setTimeout(function() {
                    if (typeof window.saveProductSilent === 'function') {
                        window.saveProductSilent();
                        console.log('✅ Sačuvan iz memorije');
                        ocistiPolja();
                    }
                }, 300);
            } else {
                console.log('⚠️ Nema podataka');
            }
            return true;
        }

        // END
        if (lower === 'end' || lower === 'kraj' || lower === 'završi') {
            console.log('🏁 End');
            const productInput = document.getElementById('productInput');
            if (productInput && productInput.value.trim() !== '') {
                if (typeof window.saveProductSilent === 'function') {
                    window.saveProductSilent();
                }
            } else if (currentProductData) {
                prikaziPodatkeUPoljima(currentProductData);
                setTimeout(function() {
                    if (typeof window.saveProductSilent === 'function') {
                        window.saveProductSilent();
                    }
                }, 300);
            }
            setTimeout(function() {
                if (typeof window.renderInventory === 'function') {
                    window.renderInventory(lang);
                }
            }, 500);
            return true;
        }

        // NAZAD
        if (lower === 'nazad' || lower === 'back' || lower === 'odustani') {
            console.log('⬅️ Nazad');
            if (typeof window.handleBackAction === 'function') {
                window.handleBackAction();
            }
            return true;
        }

        // EXIT
        if (lower === 'exit' || lower === 'izlaz') {
            console.log('🚪 Izlaz');
            if (typeof window.exitApp === 'function') {
                window.exitApp();
            }
            return true;
        }

        // DIKTIRANJE
        const isDataEntry = document.getElementById('productInput') !== null;
        
        if (isDataEntry && command.length > 2) {
            let cleanCommand = command.replace(/^(unos|unesi|dodaj|add|start|go|stop|end|kraj|plus|zalihe|stanje|spisak|potrebe|nazad|back|odustani|exit|izlaz)\s*/i, '').trim();
            cleanCommand = cleanCommand.replace(/\s+(unos|unesi|dodaj|add|start|go|stop|end|kraj|plus|zalihe|stanje|spisak|potrebe|nazad|back|odustani|exit|izlaz)\s*/gi, ' ').trim();
            
            if (!cleanCommand || cleanCommand === 'start' || cleanCommand === 'go') {
                return false;
            }
            
            console.log('🧹 Očišćeno:', cleanCommand);
            
            const parsed = parseVoiceDataEntry(cleanCommand);
            if (parsed && parsed.product_name && parsed.product_name.length > 1) {
                prikaziPodatkeUPoljima(parsed);
                console.log('✅ Podaci prikazani u poljima');
                return true;
            }
        }

        console.log('⚠️ Nepoznato:', command);
        return false;
    }

    // ===== IZVOZ =====
    window.startVoiceRecognition = startVoiceRecognition;
    window.stopVoiceRecognition = stopVoiceRecognition;
    window.processVoiceCommand = processVoiceCommand;
    window.voiceCommand = processVoiceCommand;
    window.prikaziPodatkeUPoljima = prikaziPodatkeUPoljima;
    window.ocistiPolja = ocistiPolja;
    window.resetCurrentProductData = function() {
        currentProductData = null;
        console.log('🔄 Resetovani trenutni podaci');
    };

    console.log('✅ voiceCommands.js spreman!');
})();
