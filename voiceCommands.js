// ============================================
// VOICE COMMANDS - NAPREDNA VERZIJA
// SA start, plus i end KOMANDAMA
// ============================================

(function () {
    console.log('🎙️ voiceCommands.js se učitava...');

    let isProcessing = false;
    let lastCommandTime = 0;
    let currentProductBuffer = ''; // Trenutni proizvod koji se gradi
    let isRecordingProduct = false; // Da li smo u fazi unosa proizvoda
    let savedProductIds = []; // ID-ovi sačuvanih proizvoda za označavanje

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
                console.log('🏠 Skladište:', foundStorage);
            }
            let unitMatch = getUnit(w);
            if (unitMatch) {
                foundUnit = unitMatch;
                unitIndex = i;
                console.log('📏 Jedinica:', foundUnit);
            }
        }

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

        // Odredi količinu i komad
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

        // Rok trajanja (meseci) - traži broj + "meseci"
        let meseciMatch = text.match(/(\d+)\s*meseci/);
        if (meseciMatch) {
            result.shelf_life = meseciMatch[1];
        } else if (numbers.length >= 3) {
            result.shelf_life = numbers[2];
        }

        // Naziv proizvoda (sve što nije broj, jedinica ili skladište)
        let cleanName = nameParts.filter(p => {
            const lower = p.toLowerCase();
            return !/^\d+$/.test(p) && 
                   !getUnit(lower) && 
                   !getStorage(lower);
        }).join(' ').trim();

        result.product_name = cleanName || 'Proizvod';
        if (foundUnit) result.unit = foundUnit;
        if (foundStorage) result.storage = foundStorage;

        console.log('✅ PARSIRANO:', result);
        return result;
    }

    function sacuvajProizvod(data) {
        console.log('💾 Čuvam proizvod:', data);

        // Sačuvaj bez popup-a
        const productData = {
            id: Date.now(),
            product_name: data.product_name,
            description: '',
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
        
        // Sačuvaj ID za označavanje
        savedProductIds.push(productData.id);
        console.log('✅ Proizvod sačuvan:', productData.product_name, 'ID:', productData.id);
        
        // Osveži pregled unosa
        if (typeof prikaziSveUnose === 'function') {
            try { prikaziSveUnose(); } catch(e) {}
        }

        return productData.id;
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
    // OZNAČAVANJE NOVIH PROIZVODA U ZALIHAMA
    // ============================================

    function highlightNewProducts() {
        console.log('🔵 OZNAČAVAM nove proizvode:', savedProductIds);
        
        // Sačekaj da se render završi
        setTimeout(() => {
            const rows = document.querySelectorAll('.table-row');
            rows.forEach(row => {
                const checkbox = row.querySelector('.row-checkbox');
                if (checkbox) {
                    const index = parseInt(checkbox.dataset.index);
                    if (!isNaN(index)) {
                        const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
                        if (zalihe[index] && savedProductIds.includes(zalihe[index].id)) {
                            row.style.background = '#90CAF9'; // svetloplava
                            row.style.transition = 'background 0.5s';
                            console.log('🔵 OZNAČEN:', zalihe[index].product_name);
                        }
                    }
                }
            });
        }, 500);
    }

    // ============================================
    // GLAVNA FUNKCIJA ZA OBRADU KOMANDI
    // ============================================

    function processVoiceCommand(command) {
        if (!command || isProcessing) return false;
        
        const now = Date.now();
        if (now - lastCommandTime < 1500) {
            console.log('⏳ Prebrzo, čekam...');
            return false;
        }
        lastCommandTime = now;
        
        console.log('🎤 Glasovna komanda primljena:', command);
        const lower = command.toLowerCase().trim();
        const lang = typeof window.currentLang !== 'undefined' ? window.currentLang : 'sr';

        isProcessing = true;
        setTimeout(function() { 
            isProcessing = false; 
        }, 1500);

        // ============================================
        // 1. KOMANDA: "start" - POČINJE UNOS
        // ============================================
        if (lower === 'start' || lower === 'kreni' || lower === 'počni') {
            console.log('▶️ START - počinjem unos');
            isRecordingProduct = true;
            currentProductBuffer = '';
            showVoiceStatus('🎤 Slušam... Recite proizvod', '#4CAF50');
            
            // Otvori data entry ako nije otvoren
            if (window.currentScreen !== 'dataEntry') {
                if (typeof window.renderDataEntry === 'function') {
                    window.renderDataEntry('');
                    if (!window.screenHistory) window.screenHistory = [];
                    window.screenHistory.push('dataEntry');
                    window.currentScreen = 'dataEntry';
                }
            }
            return true;
        }

        // ============================================
        // 2. KOMANDA: "plus" - KRAJ JEDNOG, POČETAK NOVOG
        // ============================================
        if (lower === 'plus' || lower === 'sledeći' || lower === 'sledeci') {
            console.log('➕ PLUS - završavam trenutni unos, počinjem novi');
            
            if (currentProductBuffer && currentProductBuffer.length > 2) {
                const parsed = parseVoiceDataEntry(currentProductBuffer);
                if (parsed.product_name && parsed.product_name !== 'Proizvod' && parsed.product_name.length > 1) {
                    const id = sacuvajProizvod(parsed);
                    console.log('✅ Sačuvan:', parsed.product_name, 'ID:', id);
                    showVoiceStatus(`✅ Sačuvan: ${parsed.product_name}`, '#4CAF50');
                }
            }
            
            // Resetuj buffer za novi unos
            currentProductBuffer = '';
            isRecordingProduct = true;
            showVoiceStatus('🎤 Slušam... Recite sledeći proizvod', '#4CAF50');
            
            // Osveži formu (očisti polja ali ostavi naziv)
            setTimeout(() => {
                const pieceInput = document.getElementById('pieceInput');
                const quantityInput = document.getElementById('quantityInput');
                const shelfLifeInput = document.getElementById('shelfLifeInput');
                const descriptionInput = document.getElementById('descriptionInput');
                if (pieceInput) pieceInput.value = '';
                if (quantityInput) quantityInput.value = '';
                if (shelfLifeInput) shelfLifeInput.value = '';
                if (descriptionInput) descriptionInput.value = '';
                
                // Fokus na productInput
                const productInput = document.getElementById('productInput');
                if (productInput) {
                    productInput.focus();
                    productInput.select();
                }
            }, 200);
            
            return true;
        }

        // ============================================
        // 3. KOMANDA: "end" - KRAJ SVIH UNOSA, OTVARANJE ZALIHA
        // ============================================
        if (lower === 'end' || lower === 'kraj' || lower === 'gotovo') {
            console.log('🏁 END - završavam unos, otvaram zalihe');
            
            // Sačuvaj poslednji proizvod ako postoji
            if (currentProductBuffer && currentProductBuffer.length > 2) {
                const parsed = parseVoiceDataEntry(currentProductBuffer);
                if (parsed.product_name && parsed.product_name !== 'Proizvod' && parsed.product_name.length > 1) {
                    const id = sacuvajProizvod(parsed);
                    console.log('✅ Sačuvan (zadnji):', parsed.product_name, 'ID:', id);
                    showVoiceStatus(`✅ Sačuvan: ${parsed.product_name}`, '#4CAF50');
                }
            }
            
            // Resetuj stanje
            currentProductBuffer = '';
            isRecordingProduct = false;
            
            // Otvori zalihe sa označenim proizvodima
            setTimeout(() => {
                if (typeof window.renderInventory === 'function') {
                    window.renderInventory(lang);
                    if (!window.screenHistory) window.screenHistory = [];
                    window.screenHistory.push('inventory');
                    window.currentScreen = 'inventory';
                }
                
                // Obeleži nove proizvode
                setTimeout(() => {
                    highlightNewProducts();
                    // Sačekaj da korisnik vidi oznake pa resetuj
                    setTimeout(() => {
                        savedProductIds = [];
                    }, 5000);
                }, 300);
                
                showVoiceStatus('📦 Zalihe otvorene - novi proizvodi su plavi', '#2196F3');
            }, 300);
            
            return true;
        }

        // ============================================
        // 4. KOMANDA: "zalihe" - DIREKTNO OTVARANJE
        // ============================================
        if (lower === 'zalihe' || lower === 'otvori zalihe' || lower === 'stanje') {
            if (typeof window.renderInventory === 'function') {
                window.renderInventory(lang);
                if (!window.screenHistory) window.screenHistory = [];
                window.screenHistory.push('inventory');
                window.currentScreen = 'inventory';
            }
            return true;
        }

        // ============================================
        // 5. KOMANDA: "spisak"
        // ============================================
        if (lower === 'spisak' || lower === 'otvori spisak' || lower === 'potrebe') {
            if (typeof window.renderShoppingList === 'function') {
                window.renderShoppingList(lang);
                if (!window.screenHistory) window.screenHistory = [];
                window.screenHistory.push('shoppingList');
                window.currentScreen = 'shoppingList';
            }
            return true;
        }

        // ============================================
        // 6. KOMANDA: "unos" - OTVARANJE EKRANA ZA UNOS
        // ============================================
        if (lower === 'unos' || lower === 'unesi' || lower === 'add') {
            console.log('📝 Otvaram ekran za unos...');
            isRecordingProduct = false;
            currentProductBuffer = '';
            if (typeof window.renderDataEntry === 'function') {
                window.renderDataEntry('');
                if (!window.screenHistory) window.screenHistory = [];
                window.screenHistory.push('dataEntry');
                window.currentScreen = 'dataEntry';
            }
            showVoiceStatus('🎤 Kažite "start" pa proizvod', '#FF9800');
            return true;
        }

        // ============================================
        // 7. DIKTIRANJE - AKO SMO U REŽIMU UNOSA
        // ============================================
        if (isRecordingProduct && lower.length > 2) {
            // Dodaj u buffer
            if (currentProductBuffer) {
                currentProductBuffer += ' ' + command;
            } else {
                currentProductBuffer = command;
            }
            console.log('📝 Buffer:', currentProductBuffer);
            showVoiceStatus(`📝 ${currentProductBuffer}`, '#FFD700');
            
            // Pokušaj da parsiraš i prikažeš u realnom vremenu
            try {
                const parsed = parseVoiceDataEntry(currentProductBuffer);
                if (parsed.product_name && parsed.product_name !== 'Proizvod') {
                    // Prikaži u formi
                    const productInput = document.getElementById('productInput');
                    const pieceInput = document.getElementById('pieceInput');
                    const quantityInput = document.getElementById('quantityInput');
                    const shelfLifeInput = document.getElementById('shelfLifeInput');
                    
                    if (productInput) productInput.value = parsed.product_name;
                    if (pieceInput) pieceInput.value = parsed.piece;
                    if (quantityInput) quantityInput.value = parsed.quantity;
                    if (shelfLifeInput) shelfLifeInput.value = parsed.shelf_life;
                    
                    // Postavi jedinicu i skladište
                    const unitSelect = document.getElementById('unitSelect');
                    if (unitSelect && parsed.unit) {
                        for (let opt of unitSelect.options) {
                            if (opt.value === parsed.unit) {
                                opt.selected = true;
                                break;
                            }
                        }
                    }
                    const storageSelect = document.getElementById('storageSelect');
                    if (storageSelect && parsed.storage) {
                        for (let opt of storageSelect.options) {
                            if (opt.value === parsed.storage || opt.text.includes(parsed.storage)) {
                                opt.selected = true;
                                break;
                            }
                        }
                    }
                    
                    // Ažuriraj expiry date
                    if (typeof updateExpiryDate === 'function') {
                        try { updateExpiryDate(); } catch(e) {}
                    }
                }
            } catch(e) {
                console.warn('Greška pri prikazu:', e);
            }
            
            return true;
        }

        return false;
    }

    // ============================================
    // GO BACK SA ISTORIJOM
    // ============================================

    window.goBack = function() {
        var lang = typeof window.currentLang !== 'undefined' ? window.currentLang : 'sr';
        var currentScreen = window.currentScreen || 'categories';
        
        console.log('⬅️ goBack pozvan, trenutni ekran:', currentScreen);
        
        // Resetuj stanje unosa
        isRecordingProduct = false;
        currentProductBuffer = '';
        
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
        
        console.log('🏠 Nema istorije, idem na kategorije');
        if (typeof window.renderCategories === 'function') {
            window.renderCategories(lang);
            window.currentScreen = 'categories';
        } else if (typeof window.showScreen === 'function') {
            window.showScreen('categories');
            window.currentScreen = 'categories';
        }
    };

    // ============================================
    // IZVOZ FUNKCIJA
    // ============================================

    window.processVoiceCommand = processVoiceCommand;
    window.voiceCommand = processVoiceCommand;
    window.highlightNewProducts = highlightNewProducts;
    window.savedProductIds = savedProductIds;

    console.log('✅ voiceCommands.js spreman (start/plus/end verzija)!');
    console.log('📖 KOMANDE: "unos" -> "start" -> [proizvod] -> "plus" -> [sledeći] -> "end"');
})();
