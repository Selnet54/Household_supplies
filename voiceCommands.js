// ============================================
// VOICE COMMANDS - KONAČNA RADNA VERZIJA
// ============================================

(function() {
    console.log('🎙️ voiceCommands.js se učitava...');

    let isProcessing = false;
    let lastCommandTime = 0;
    let accumulatedText = '';
    let accumulatedTimeout = null;
    let currentProductData = null; // Čuva trenutne podatke

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
        // UKLONI SVE REZERVISANE REČI
        let text = command.replace(/^(unos|unesi|dodaj|add|start|go|stop|end|kraj|plus|zalihe|stanje|spisak|potrebe)\s*/i, '').trim();
        text = text.replace(/\s+(unos|unesi|dodaj|add|start|go|stop|end|kraj|plus|zalihe|stanje|spisak|potrebe)\s*/gi, ' ').trim();
        
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

        // PRVO PRONAĐI SKLADIŠTE I JEDINICU
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

        // POSTAVI KOLIČINU I KOMAD
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

        // ROK TRAJANJA
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

    function prikaziPodatkeUPoljima(data) {
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) {
                el.value = val;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        console.log('📝 Prikazujem podatke u poljima:', data);

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
        
        // Sačuvaj trenutne podatke za "plus"
        currentProductData = data;
    }

    function sacuvajTrenutniProizvod() {
        if (!currentProductData) {
            console.log('⚠️ Nema podataka za čuvanje');
            return false;
        }
        
        console.log('💾 Čuvam proizvod:', currentProductData);
        
        // Prvo popuni polja
        prikaziPodatkeUPoljima(currentProductData);
        
        // Zatim sačuvaj
        setTimeout(function() {
            if (typeof window.saveProductSilent === 'function') {
                window.saveProductSilent();
                console.log('✅ Proizvod sačuvan!');
            }
        }, 200);
        
        return true;
    }

    function ocistiPolja() {
        console.log('🧹 Čistim polja za novi unos');
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
                console.log('🗣️ Prepoznato:', finalText);
                
                if (accumulatedText) {
                    accumulatedText += ' ' + finalText;
                } else {
                    accumulatedText = finalText;
                }
                
                console.log('📝 Akumulirano:', accumulatedText);
                
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
        if (now - lastCommandTime < 1500) {
            console.log('⏳ Prebrzo, čekam...');
            return false;
        }
        lastCommandTime = now;
        
        console.log('🎤 Komanda:', command);
        const lower = command.toLowerCase().trim();
        const lang = getCurrentLang();

        isProcessing = true;
        setTimeout(function() { isProcessing = false; }, 1500);

        // ===== KOMANDE =====
        
        // 1. UNOS
        if (lower === 'unos' || lower === 'unesi' || lower === 'add' || lower === 'dodaj') {
            console.log('📝 Otvaram unos');
            if (typeof window.renderDataEntry === 'function') {
                window.renderDataEntry('');
                // Resetuj trenutne podatke
                currentProductData = null;
            }
            return true;
        }

        // 2. ZALIHE
        if (lower === 'zalihe' || lower === 'stanje' || lower === 'inventory') {
            console.log('📦 Zalihe');
            if (typeof window.renderInventory === 'function') {
                window.renderInventory(lang);
            }
            return true;
        }

        // 3. SPISAK
        if (lower === 'spisak' || lower === 'potrebe' || lower === 'shopping') {
            console.log('🛒 Spisak');
            if (typeof window.renderShoppingList === 'function') {
                window.renderShoppingList(lang);
            }
            return true;
        }

        // 4. PLUS - sačuvaj trenutni proizvod i očisti polja
        if (lower === 'plus' || lower.includes(' plus')) {
            console.log('➕ Plus - čuvam podatke');
            
            // Prvo proveri da li ima podataka u poljima
            const productInput = document.getElementById('productInput');
            if (productInput && productInput.value.trim() !== '') {
                // Ako već ima podataka u poljima, sačuvaj direktno
                if (typeof window.saveProductSilent === 'function') {
                    window.saveProductSilent();
                    console.log('✅ Proizvod sačuvan iz polja');
                    ocistiPolja();
                }
            } else if (currentProductData) {
                // Ako nema u poljima ali imamo sačuvane podatke
                sacuvajTrenutniProizvod();
                setTimeout(ocistiPolja, 500);
            } else {
                console.log('⚠️ Nema podataka za čuvanje');
            }
            return true;
        }

        // 5. END - završi unos i otvori zalihe
        if (lower === 'end' || lower === 'kraj' || lower === 'završi') {
            console.log('🏁 End - završavam unos');
            
            // Sačuvaj ako ima podataka
            const productInput = document.getElementById('productInput');
            if (productInput && productInput.value.trim() !== '') {
                if (typeof window.saveProductSilent === 'function') {
                    window.saveProductSilent();
                    console.log('✅ Sačuvan poslednji proizvod');
                }
            } else if (currentProductData) {
                sacuvajTrenutniProizvod();
            }
            
            setTimeout(function() {
                if (typeof window.renderInventory === 'function') {
                    window.renderInventory(lang);
                    console.log('📦 Zalihe prikazane');
                }
            }, 300);
            return true;
        }

        // 6. EXIT
        if (lower === 'exit' || lower === 'izlaz') {
            console.log('🚪 Izlaz');
            if (typeof window.exitApp === 'function') {
                window.exitApp();
            }
            return true;
        }

        // 7. NAZAD - vrati korak unazad
        if (lower === 'nazad' || lower === 'back' || lower === 'odustani') {
            console.log('⬅️ Nazad');
            if (typeof window.handleBackAction === 'function') {
                window.handleBackAction();
            }
            return true;
        }

        // 8. DIKTIRANJE - parsiraj unos proizvoda
        const isDataEntry = document.getElementById('productInput') !== null;
        
        if (isDataEntry && command.length > 2) {
            // Ukloni sve rezervisane reči
            let cleanCommand = command.replace(/^(unos|unesi|dodaj|add|start|go|stop|end|kraj|plus|zalihe|stanje|spisak|potrebe|nazad|back|odustani)\s*/i, '').trim();
            cleanCommand = cleanCommand.replace(/\s+(unos|unesi|dodaj|add|start|go|stop|end|kraj|plus|zalihe|stanje|spisak|potrebe|nazad|back|odustani)\s*/gi, ' ').trim();
            
            console.log('🧹 Očišćeno:', cleanCommand);
            
            if (cleanCommand.length > 1) {
                const parsed = parseVoiceDataEntry(cleanCommand);
                if (parsed.product_name && parsed.product_name !== 'Proizvod' && parsed.product_name.length > 1) {
                    // Prikaži podatke u poljima ali NE čuvaj automatski
                    prikaziPodatkeUPoljima(parsed);
                    console.log('✅ Podaci prikazani u poljima');
                    return true;
                }
            }
        }

        console.log('⚠️ Komanda nije prepoznata:', command);
        return false;
    }

    // ===== IZVOZ =====
    window.startVoiceRecognition = startVoiceRecognition;
    window.stopVoiceRecognition = stopVoiceRecognition;
    window.processVoiceCommand = processVoiceCommand;
    window.voiceCommand = processVoiceCommand;
    window.prikaziPodatkeUPoljima = prikaziPodatkeUPoljima;
    window.sacuvajTrenutniProizvod = sacuvajTrenutniProizvod;
    window.ocistiPolja = ocistiPolja;

    console.log('✅ voiceCommands.js spreman!');
})();
