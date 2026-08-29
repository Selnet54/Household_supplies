// ============================================
// VOICE COMMANDS - KONAČNO RADI
// ============================================

(function() {
    console.log('🎙️ voiceCommands.js se učitava...');

    let isProcessing = false;
    let lastCommandTime = 0;
    let commandBuffer = '';
    let bufferTimeout = null;
    let currentProductData = null;
    let recognition = null;

    // ===== BROJEVI =====
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
        const w = word.toLowerCase().trim();
        for (let key in UNIT_MAP) {
            if (w === key || w.includes(key) || key.includes(w)) {
                return UNIT_MAP[key];
            }
        }
        return null;
    }

    function getStorage(word) {
        const w = word.toLowerCase().trim();
        for (let key in STORAGE_MAP) {
            if (w === key || w.includes(key) || key.includes(w)) {
                return STORAGE_MAP[key];
            }
        }
        return null;
    }

    function getCurrentLang() {
        return typeof window.currentLang !== 'undefined' ? window.currentLang : 'sr';
    }

    // ===== PARSIRANJE - POPRAVLJENO =====
    function parseVoiceDataEntry(command) {
        console.log('🔍 Parsiram:', command);
        
        // Ukloni rezervisane reči
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
        let numbers = [], nameParts = [];
        let skipWords = ['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima', 'i'];

        // Pronađi skladište i jedinicu - IDI KROZ SVE REČI
        for (let i = 0; i < words.length; i++) {
            let w = words[i].toLowerCase();
            
            // Proveri skladište
            let storage = getStorage(w);
            if (storage) {
                foundStorage = storage;
                words[i] = null; // Označi za uklanjanje
                console.log('🏠 Skladište:', storage);
                continue;
            }
            
            // Proveri jedinicu
            let unit = getUnit(w);
            if (unit) {
                foundUnit = unit;
                words[i] = null; // Označi za uklanjanje
                console.log('📏 Jedinica:', unit);
                continue;
            }
        }

        // Filtriraj null vrednosti
        words = words.filter(w => w !== null);

        // Obradi preostale reči
        for (let i = 0; i < words.length; i++) {
            let w = words[i];
            let lowerW = w.toLowerCase();
            
            if (skipWords.includes(lowerW)) continue;
            
            let numVal = getNumber(w);
            if (numVal !== null) {
                numbers.push(numVal);
                console.log('🔢 Broj:', numVal);
            } else {
                nameParts.push(w);
                console.log('📝 Ime deo:', w);
            }
        }

        console.log('🔢 Brojevi:', numbers);
        console.log('📝 Imena:', nameParts);

        // ===== POSTAVI VREDNOSTI =====
        // Ako imamo jedinicu mere (kg, g, l)
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
            // Bez jedinice mere (kom, pak)
            if (numbers.length >= 2) {
                result.piece = numbers[0];
                result.quantity = numbers[0];
                result.shelf_life = numbers[1];
            } else if (numbers.length === 1) {
                result.piece = numbers[0];
                result.quantity = numbers[0];
            }
        }

        // IME PROIZVODA
        if (nameParts.length > 0) {
            result.product_name = nameParts.join(' ');
        } else {
            result.product_name = 'Proizvod';
        }

        if (foundUnit) result.unit = foundUnit;
        if (foundStorage) result.storage = foundStorage;

        console.log('📦 Parsirani podaci:', result);
        return result;
    }

    // ===== PRIKAZ U POLJIMA =====
    function prikaziPodatkeUPoljima(data) {
        console.log('📝 Prikazujem u poljima:', data);
        
        if (!data) return;
        
        const fields = {
            'productInput': data.product_name,
            'pieceInput': data.piece,
            'quantityInput': data.quantity,
            'shelfLifeInput': data.shelf_life
        };
        
        for (let [id, value] of Object.entries(fields)) {
            const el = document.getElementById(id);
            if (el) {
                el.value = value;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                console.log(`✅ ${id} = ${value}`);
            }
        }
        
        const unitSelect = document.getElementById('unitSelect');
        if (unitSelect && data.unit) {
            for (let opt of unitSelect.options) {
                if (opt.value === data.unit) {
                    opt.selected = true;
                    unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
            console.log('✅ unitSelect =', data.unit);
        }
        
        const storageSelect = document.getElementById('storageSelect');
        if (storageSelect && data.storage) {
            for (let opt of storageSelect.options) {
                if (opt.value === data.storage) {
                    opt.selected = true;
                    storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
            console.log('✅ storageSelect =', data.storage);
        }
        
        currentProductData = data;
    }

    // ===== ČIŠĆENJE =====
    function ocistiPolja() {
        console.log('🧹 Čistim polja');
        ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput', 'descriptionInput'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        currentProductData = null;
    }

    // ===== SAČUVAJ =====
    function sacuvajProizvod() {
        console.log('💾 Čuvam proizvod');
        
        const productInput = document.getElementById('productInput');
        if (productInput && productInput.value.trim() !== '') {
            if (typeof window.saveProductSilent === 'function') {
                window.saveProductSilent();
                console.log('✅ Sačuvan iz polja');
                if (typeof window.prikaziSveUnose === 'function') {
                    window.prikaziSveUnose();
                }
                ocistiPolja();
                return true;
            }
        }
        
        if (currentProductData) {
            prikaziPodatkeUPoljima(currentProductData);
            setTimeout(() => {
                if (typeof window.saveProductSilent === 'function') {
                    window.saveProductSilent();
                    console.log('✅ Sačuvan iz memorije');
                    if (typeof window.prikaziSveUnose === 'function') {
                        window.prikaziSveUnose();
                    }
                    ocistiPolja();
                }
            }, 300);
            return true;
        }
        
        console.log('⚠️ Nema podataka');
        return false;
    }

    // ===== START RECOGNITION =====
    function startVoiceRecognition() {
        console.log('🎤 START VOICE RECOGNITION');
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('❌ Nije podržan');
            return;
        }
        
        if (recognition) {
            try { recognition.stop(); } catch(e) {}
            recognition = null;
        }
        
        recognition = new SpeechRecognition();
        recognition.lang = 'sr-RS';
        recognition.continuous = true;
        recognition.interimResults = true;
        
        commandBuffer = '';
        
        recognition.onstart = function() {
            console.log('🎤 MIKROFON AKTIVAN');
            const status = document.getElementById('voiceStatus');
            if (status) {
                status.textContent = '🎤 Slušam...';
                status.style.color = '#4CAF50';
            }
        };
        
        recognition.onresult = function(event) {
            let finalText = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalText += event.results[i][0].transcript;
                }
            }
            
            if (!finalText) return;
            
            const trimmed = finalText.trim();
            console.log('🗣️:', trimmed);
            
            // Ignoriši "start" i "go" samo ako su sami
            if ((trimmed.toLowerCase() === 'start' || trimmed.toLowerCase() === 'go') && !commandBuffer) {
                console.log('⏭️ Ignorišem start/go');
                return;
            }
            
            commandBuffer += (commandBuffer ? ' ' : '') + trimmed;
            console.log('📦 Buffer:', commandBuffer);
            
            if (bufferTimeout) {
                clearTimeout(bufferTimeout);
            }
            
            bufferTimeout = setTimeout(() => {
                console.log('⏰ Obrada:', commandBuffer);
                processVoiceCommand(commandBuffer);
                commandBuffer = '';
                bufferTimeout = null;
            }, 1200);
        };
        
        recognition.onerror = function(event) {
            console.error('❌ Greška:', event.error);
        };
        
        recognition.onend = function() {
            console.log('🎤 Završeno');
            if (commandBuffer) {
                processVoiceCommand(commandBuffer);
                commandBuffer = '';
            }
            // Restartuj
            setTimeout(() => {
                const voiceMenu = document.getElementById('voiceMenuScreen');
                if (voiceMenu && voiceMenu.style.display !== 'none') {
                    startVoiceRecognition();
                }
            }, 1000);
        };
        
        try {
            recognition.start();
            console.log('✅ Mikrofon pokrenut');
        } catch(e) {
            console.error('❌ Greška:', e);
        }
    }

    function stopVoiceRecognition() {
        console.log('🛑 STOP');
        if (recognition) {
            try { recognition.stop(); } catch(e) {}
            recognition = null;
        }
        if (bufferTimeout) {
            clearTimeout(bufferTimeout);
            bufferTimeout = null;
        }
        commandBuffer = '';
    }

    // ===== PROCESS COMMAND =====
    function processVoiceCommand(command) {
        if (!command || isProcessing) return false;
        
        const now = Date.now();
        if (now - lastCommandTime < 1000) {
            console.log('⏳ Prebrzo');
            return false;
        }
        lastCommandTime = now;
        
        console.log('🎤 Komanda:', command);
        const lower = command.toLowerCase().trim();
        const lang = getCurrentLang();

        isProcessing = true;
        setTimeout(() => { isProcessing = false; }, 1000);

        // ===== PRVO PARSIRAJ =====
        let parsedData = null;
        let cleanCommand = command.replace(/^(unos|unesi|dodaj|add|start|go|stop|end|kraj|plus|zalihe|stanje|spisak|potrebe|nazad|back|odustani|exit|izlaz)\s*/i, '').trim();
        cleanCommand = cleanCommand.replace(/\s+(unos|unesi|dodaj|add|start|go|stop|end|kraj|plus|zalihe|stanje|spisak|potrebe|nazad|back|odustani|exit|izlaz)\s*/gi, ' ').trim();
        
        if (cleanCommand && cleanCommand.length > 1 && cleanCommand !== 'start' && cleanCommand !== 'go') {
            parsedData = parseVoiceDataEntry(cleanCommand);
            console.log('📦 Parsirano:', parsedData);
        }

        // ===== KOMANDE =====
        
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
            console.log('➕ PLUS');
            // Ako ima parsiranih podataka, prvo ih prikaži
            if (parsedData && parsedData.product_name && parsedData.product_name !== 'Proizvod') {
                prikaziPodatkeUPoljima(parsedData);
                setTimeout(() => {
                    sacuvajProizvod();
                }, 300);
                return true;
            }
            sacuvajProizvod();
            return true;
        }

        // END
        if (lower === 'end' || lower === 'kraj' || lower === 'završi') {
            console.log('🏁 END');
            
            if (parsedData && parsedData.product_name && parsedData.product_name !== 'Proizvod') {
                prikaziPodatkeUPoljima(parsedData);
                setTimeout(() => {
                    if (typeof window.saveProductSilent === 'function') {
                        window.saveProductSilent();
                        console.log('✅ Sačuvan poslednji');
                        if (typeof window.prikaziSveUnose === 'function') {
                            window.prikaziSveUnose();
                        }
                    }
                    setTimeout(() => {
                        if (typeof window.renderInventory === 'function') {
                            window.renderInventory(lang);
                            console.log('📦 Zalihe otvorene');
                        }
                    }, 300);
                }, 300);
                return true;
            }
            
            // Sačuvaj iz polja
            const productInput = document.getElementById('productInput');
            if (productInput && productInput.value.trim() !== '') {
                if (typeof window.saveProductSilent === 'function') {
                    window.saveProductSilent();
                    console.log('✅ Sačuvan poslednji iz polja');
                    if (typeof window.prikaziSveUnose === 'function') {
                        window.prikaziSveUnose();
                    }
                }
            }
            
            setTimeout(() => {
                if (typeof window.renderInventory === 'function') {
                    window.renderInventory(lang);
                    console.log('📦 Zalihe otvorene');
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

        // ===== DIKTIRANJE - PRIKAZI PODATKE =====
        if (parsedData && parsedData.product_name && parsedData.product_name !== 'Proizvod' && parsedData.product_name.length > 1) {
            prikaziPodatkeUPoljima(parsedData);
            console.log('✅ Podaci prikazani');
            return true;
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
        console.log('🔄 Reset');
    };

    console.log('✅ voiceCommands.js spreman!');
})();
