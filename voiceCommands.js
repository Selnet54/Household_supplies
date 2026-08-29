// ============================================
// VOICE COMMANDS - KOMPLETNA RADNA VERZIJA
// ============================================

(function() {
    console.log('🎙️ voiceCommands.js se učitava...');

    // ===== STANJE =====
    let isProcessing = false;
    let lastCommandTime = 0;
    let accumulatedText = '';
    let accumulatedTimeout = null;
    let currentProductData = null;
    let isListeningForData = false;
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

    function getCurrentLang() {
        return typeof window.currentLang !== 'undefined' ? window.currentLang : 'sr';
    }

    // ===== PARSIRANJE =====
    function parseVoiceDataEntry(command) {
        console.log('🔍 Parsiram:', command);
        
        // Ukloni sve rezervisane reči
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

        // Pronađi skladište i jedinicu
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

        // Obradi reči
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

        // Parsiraj brojeve
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

    // ===== PRIKAZ U POLJIMA =====
    function prikaziPodatkeUPoljima(data) {
        console.log('📝 Prikazujem u poljima:', data);
        
        if (!data) {
            console.warn('⚠️ Nema podataka');
            return;
        }
        
        const productInput = document.getElementById('productInput');
        const pieceInput = document.getElementById('pieceInput');
        const quantityInput = document.getElementById('quantityInput');
        const shelfLifeInput = document.getElementById('shelfLifeInput');
        const storageSelect = document.getElementById('storageSelect');
        const unitSelect = document.getElementById('unitSelect');
        
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
                    storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
            console.log('✅ storageSelect =', data.storage);
        }
        
        if (unitSelect && data.unit) {
            for (let i = 0; i < unitSelect.options.length; i++) {
                if (unitSelect.options[i].value === data.unit) {
                    unitSelect.selectedIndex = i;
                    unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
            console.log('✅ unitSelect =', data.unit);
        }
        
        currentProductData = data;
    }

    // ===== ČIŠĆENJE POLJA =====
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

    // ===== SAČUVAJ TRENUTNI PROIZVOD =====
    function sacuvajTrenutniProizvod() {
        console.log('💾 Čuvam trenutni proizvod');
        
        const productInput = document.getElementById('productInput');
        if (productInput && productInput.value.trim() !== '') {
            if (typeof window.saveProductSilent === 'function') {
                window.saveProductSilent();
                console.log('✅ Proizvod sačuvan iz polja');
                // Osveži pregled unosa
                if (typeof window.prikaziSveUnose === 'function') {
                    window.prikaziSveUnose();
                }
                ocistiPolja();
                return true;
            }
        } else if (currentProductData) {
            prikaziPodatkeUPoljima(currentProductData);
            setTimeout(function() {
                if (typeof window.saveProductSilent === 'function') {
                    window.saveProductSilent();
                    console.log('✅ Proizvod sačuvan iz memorije');
                    if (typeof window.prikaziSveUnose === 'function') {
                        window.prikaziSveUnose();
                    }
                    ocistiPolja();
                }
            }, 300);
            return true;
        }
        
        console.log('⚠️ Nema podataka za čuvanje');
        return false;
    }

    // ===== START VOICE RECOGNITION =====
    function startVoiceRecognition() {
        console.log('🎤 startVoiceRecognition POZVAN!');
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('❌ Speech recognition nije podržan!');
            return;
        }

        if (recognition) {
            try { recognition.stop(); } catch(e) {}
            recognition = null;
        }

        recognition = new SpeechRecognition();
        
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

        let commandBuffer = '';
        let bufferTimeout = null;

        recognition.onstart = function() {
            console.log('🎤 MIKROFON AKTIVAN!');
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = '🎤 Slušam... Recite "start" pa podatke';
                statusEl.style.color = '#4CAF50';
            }
            isListeningForData = true;
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
                
                // Ignoriši "start" i "go" samo ako su sami
                if ((trimmed === 'start' || trimmed === 'go') && !commandBuffer) {
                    console.log('⏭️ Ignorišem "start" ili "go"');
                    return;
                }
                
                console.log('🗣️ Prepoznato:', finalText);
                commandBuffer += (commandBuffer ? ' ' : '') + finalText;
                console.log('📦 Buffer:', commandBuffer);
                
                if (bufferTimeout) {
                    clearTimeout(bufferTimeout);
                }
                
                bufferTimeout = setTimeout(function() {
                    console.log('⏰ Obrada buffer-a:', commandBuffer);
                    processVoiceCommand(commandBuffer);
                    commandBuffer = '';
                    bufferTimeout = null;
                }, 1500);
            }
        };

        recognition.onerror = function(event) {
            console.error('⚠️ Greška:', event.error);
        };

        recognition.onend = function() {
            console.log('🎤 Prepoznavanje završeno.');
            if (commandBuffer) {
                processVoiceCommand(commandBuffer);
                commandBuffer = '';
            }
            // Restartuj ako je još uvek na voice ekranu
            const voiceMenu = document.getElementById('voiceMenuScreen');
            if (voiceMenu && voiceMenu.style.display !== 'none') {
                setTimeout(function() {
                    console.log('🔄 Restartujem mikrofon...');
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

    // ===== STOP VOICE RECOGNITION =====
    function stopVoiceRecognition() {
        console.log('🛑 stopVoiceRecognition POZVAN!');
        if (recognition) {
            try {
                recognition.stop();
                recognition = null;
            } catch(e) {}
        }
        isListeningForData = false;
    }

    // ===== PROCESS VOICE COMMAND =====
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

        // ===== PRVO PARSIRAJ PODATKE (ako postoje) =====
        let parsedData = null;
        let cleanCommand = command.replace(/^(unos|unesi|dodaj|add|start|go|stop|end|kraj|plus|zalihe|stanje|spisak|potrebe|nazad|back|odustani|exit|izlaz)\s*/i, '').trim();
        cleanCommand = cleanCommand.replace(/\s+(unos|unesi|dodaj|add|start|go|stop|end|kraj|plus|zalihe|stanje|spisak|potrebe|nazad|back|odustani|exit|izlaz)\s*/gi, ' ').trim();
        
        if (cleanCommand && cleanCommand.length > 1 && cleanCommand !== 'start' && cleanCommand !== 'go') {
            parsedData = parseVoiceDataEntry(cleanCommand);
            console.log('📦 Parsirani podaci:', parsedData);
        }

        // ===== KOMANDE =====
        
        // 1. UNOS - otvori data entry
        if (lower === 'unos' || lower === 'unesi' || lower === 'add' || lower === 'dodaj') {
            console.log('📝 Otvaram unos');
            if (typeof window.renderDataEntry === 'function') {
                window.renderDataEntry('');
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

        // 4. PLUS - sačuvaj trenutni proizvod, očisti polja, spreman za sledeći
        if (lower === 'plus' || lower.includes(' plus')) {
            console.log('➕ PLUS - kraj unosa, spreman za sledeći');
            
            // Prvo pokušaj iz polja
            const productInput = document.getElementById('productInput');
            if (productInput && productInput.value.trim() !== '') {
                if (typeof window.saveProductSilent === 'function') {
                    window.saveProductSilent();
                    console.log('✅ Proizvod sačuvan iz polja');
                    if (typeof window.prikaziSveUnose === 'function') {
                        window.prikaziSveUnose();
                    }
                    ocistiPolja();
                }
                return true;
            }
            
            // Ako nema u poljima, koristi parsirane podatke
            if (parsedData && parsedData.product_name && parsedData.product_name !== 'Proizvod') {
                prikaziPodatkeUPoljima(parsedData);
                setTimeout(function() {
                    if (typeof window.saveProductSilent === 'function') {
                        window.saveProductSilent();
                        console.log('✅ Proizvod sačuvan iz parsiranih podataka');
                        if (typeof window.prikaziSveUnose === 'function') {
                            window.prikaziSveUnose();
                        }
                        ocistiPolja();
                    }
                }, 300);
                return true;
            }
            
            // Ako ništa nije uspelo, probaj sa currentProductData
            if (currentProductData) {
                prikaziPodatkeUPoljima(currentProductData);
                setTimeout(function() {
                    if (typeof window.saveProductSilent === 'function') {
                        window.saveProductSilent();
                        console.log('✅ Proizvod sačuvan iz memorije');
                        if (typeof window.prikaziSveUnose === 'function') {
                            window.prikaziSveUnose();
                        }
                        ocistiPolja();
                    }
                }, 300);
                return true;
            }
            
            console.log('⚠️ Nema podataka za čuvanje');
            return true;
        }

        // 5. END - sačuvaj poslednji proizvod, otvori zalihe
        if (lower === 'end' || lower === 'kraj' || lower === 'završi') {
            console.log('🏁 END - završavam unos, otvaram zalihe');
            
            // Sačuvaj poslednji proizvod
            const productInput = document.getElementById('productInput');
            if (productInput && productInput.value.trim() !== '') {
                if (typeof window.saveProductSilent === 'function') {
                    window.saveProductSilent();
                    console.log('✅ Sačuvan poslednji proizvod iz polja');
                    if (typeof window.prikaziSveUnose === 'function') {
                        window.prikaziSveUnose();
                    }
                }
            } else if (parsedData && parsedData.product_name && parsedData.product_name !== 'Proizvod') {
                prikaziPodatkeUPoljima(parsedData);
                setTimeout(function() {
                    if (typeof window.saveProductSilent === 'function') {
                        window.saveProductSilent();
                        console.log('✅ Sačuvan poslednji proizvod iz parsiranih podataka');
                        if (typeof window.prikaziSveUnose === 'function') {
                            window.prikaziSveUnose();
                        }
                    }
                }, 300);
            } else if (currentProductData) {
                prikaziPodatkeUPoljima(currentProductData);
                setTimeout(function() {
                    if (typeof window.saveProductSilent === 'function') {
                        window.saveProductSilent();
                        console.log('✅ Sačuvan poslednji proizvod iz memorije');
                        if (typeof window.prikaziSveUnose === 'function') {
                            window.prikaziSveUnose();
                        }
                    }
                }, 300);
            }
            
            // Otvori zalihe
            setTimeout(function() {
                if (typeof window.renderInventory === 'function') {
                    window.renderInventory(lang);
                    console.log('📦 Zalihe otvorene');
                }
            }, 500);
            
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

        // 7. NAZAD
        if (lower === 'nazad' || lower === 'back' || lower === 'odustani') {
            console.log('⬅️ Nazad');
            if (typeof window.handleBackAction === 'function') {
                window.handleBackAction();
            }
            return true;
        }

        // ===== DIKTIRANJE - prikaži podatke u poljima =====
        if (parsedData && parsedData.product_name && parsedData.product_name !== 'Proizvod' && parsedData.product_name.length > 1) {
            prikaziPodatkeUPoljima(parsedData);
            console.log('✅ Podaci prikazani u poljima');
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
    window.sacuvajTrenutniProizvod = sacuvajTrenutniProizvod;
    window.resetCurrentProductData = function() {
        currentProductData = null;
        console.log('🔄 Resetovani trenutni podaci');
    };

    console.log('✅ voiceCommands.js spreman!');
})();
