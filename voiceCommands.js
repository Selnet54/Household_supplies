// ============================================
// VOICE COMMANDS - KONAČNA VERZIJA v3.0
// ============================================

let activeBuffer = ''; 
let recognition = null;
let lastSavedData = null;
let isProcessingCommand = false;
let END_AKTIVAN = false;
let isVoiceInput = false;
let ALLOW_INVENTORY_OPEN = false;
let micRestartTimer = null;

// ============================================
// 1. POMOĆNE FUNKCIJE
// ============================================

function showVoiceStatus(text, color) {
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = text;
        if (color) statusEl.style.color = color;
    }
    console.log('[VOICE]', text);
}

function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
    }
}

// ============================================
// 2. BROJEVI NA SRPSKOM
// ============================================

const NUMBER_WORDS = {
    'nula': '0', 'jedan': '1', 'jedna': '1', 'jedno': '1',
    'dva': '2', 'dve': '2', 'tri': '3', 'četiri': '4', 'cetiri': '4',
    'pet': '5', 'šest': '6', 'sest': '6', 'sedam': '7', 'osam': '8',
    'devet': '9', 'deset': '10', 'jedanaest': '11', 'dvanaest': '12',
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

// ============================================
// 3. JEDINICE I SKLADIŠTA
// ============================================

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
// 4. PARSIRANJE
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
    console.log('📝 REČI:', words);
    
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
            console.log('🏠 Pronađeno skladište:', foundStorage);
        }
        
        let unitMatch = getUnit(w);
        if (unitMatch) {
            foundUnit = unitMatch;
            unitIndex = i;
            console.log('📏 Pronađena jedinica:', foundUnit);
        }
    }
    
    if (text.includes('zamrzivač') && !text.includes('zamrzivač 2') && !text.includes('zamrzivač 3')) {
        if (!foundStorage || foundStorage === 'Zamrzivač 1') {
            foundStorage = 'Zamrzivač 1';
            console.log('🏠 Podrazumevani zamrzivač: Zamrzivač 1');
        }
    }
    
    if (text.includes('gram') || text.includes('grama')) {
        foundUnit = 'g';
        console.log('🔍 Spec. slučaj: gram -> jedinica = g');
    } else if (text.includes('kilogram') || text.includes('kg')) {
        foundUnit = 'kg';
        console.log('🔍 Spec. slučaj: kilogram -> jedinica = kg');
    } else if (text.includes('litar') || text.includes('litara')) {
        foundUnit = 'l';
        console.log('🔍 Spec. slučaj: litar -> jedinica = l');
    }
    
    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        let originalW = words[i];
        
        if (i === storageIndex || i === unitIndex) {
            continue;
        }
        
        if (skipWords.includes(w)) {
            continue;
        }
        
        let numVal = getNumber(w);
        if (numVal !== null) {
            numbers.push(numVal);
            console.log('🔢 Broj pronađen:', numVal);
            continue;
        }
        
        nameParts.push(originalW);
    }
    
    console.log('📊 Brojevi:', numbers);
    console.log('📊 Naziv delovi:', nameParts);
    
    if (foundUnit === 'kg' || foundUnit === 'g') {
        if (numbers.length >= 2) {
            result.piece = numbers[0];
            result.quantity = numbers[1];
            console.log('📦 kg/g: komad=' + numbers[0] + ', količina=' + numbers[1] + 'kg');
        } else if (numbers.length === 1) {
            result.piece = '0';
            result.quantity = numbers[0];
            console.log('📦 kg/g: komad=0, količina=' + numbers[0] + 'kg');
        }
    } else if (foundUnit === 'l') {
        if (numbers.length >= 2) {
            result.piece = numbers[0];
            result.quantity = numbers[1];
            console.log('📦 l: komad=' + numbers[0] + ', količina=' + numbers[1] + 'l');
        } else if (numbers.length === 1) {
            result.piece = '0';
            result.quantity = numbers[0];
            console.log('📦 l: komad=0, količina=' + numbers[0] + 'l');
        }
    } else {
        if (numbers.length >= 2) {
            result.piece = numbers[0];
            result.quantity = numbers[1];
            console.log('📦 kom: komad=' + numbers[0] + ', količina=' + numbers[1]);
        } else if (numbers.length === 1) {
            result.piece = numbers[0];
            result.quantity = numbers[0];
            console.log('📦 kom: komad=' + numbers[0] + ', količina=' + numbers[0]);
        }
    }
    
    let rokPronadjen = false;
    
    let meseciMatch = text.match(/(\d+)\s*meseci/);
    if (meseciMatch) {
        result.shelf_life = meseciMatch[1];
        rokPronadjen = true;
        console.log('🔍 Pronađeno "' + meseciMatch[1] + ' meseci" -> rok = ' + meseciMatch[1]);
    }
    
    if (!rokPronadjen && numbers.length >= 3) {
        result.shelf_life = numbers[2];
        rokPronadjen = true;
        console.log('🔍 Treći broj -> rok =', numbers[2]);
    }
    
    let cleanNameParts = nameParts.filter(part => {
        return !/^\d+$/.test(part);
    });
    result.product_name = cleanNameParts.join(' ').trim() || 'Proizvod';
    
    if (foundUnit) {
        result.unit = foundUnit;
        console.log('✅ Jedinica postavljena na:', foundUnit);
    } else {
        result.unit = 'kom';
        console.log('⚠️ Nema jedinice, ostavljam: kom');
    }
    
    if (foundStorage) {
        result.storage = foundStorage;
        console.log('✅ Skladište postavljeno na:', foundStorage);
    } else {
        result.storage = 'Zamrzivač 1';
        console.log('⚠️ Nema skladišta, ostavljam: Zamrzivač 1');
    }
    
    let gramMatches = text.match(/\b(500|700|800|900|1000)\b/);
    if (gramMatches && (text.includes('gram') || text.includes('grama'))) {
        result.unit = 'g';
        result.quantity = gramMatches[1];
        if (result.piece === '1' || result.piece === '0') {
            result.piece = '0';
        }
        console.log('🔍 Grami detektovani -> jedinica = g, količina = ' + gramMatches[1]);
    }
    
    console.log('✅ PARSIRANO:', result);
    return result;
}

// ============================================
// 5. POPUNJAVANJE FORME
// ============================================

function popuniFormuPodacima(data) {
    console.log('📝 Popunjavam formu:', data);
    
    if (typeof ensureFormVisible === 'function') {
        ensureFormVisible();
    }
    
    setTimeout(() => {
        const productInput = document.getElementById('productInput');
        if (productInput) {
            productInput.value = data.product_name || '';
            productInput.dispatchEvent(new Event('input', { bubbles: true }));
            productInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ Naziv postavljen:', productInput.value);
        }
        
        const pieceInput = document.getElementById('pieceInput');
        if (pieceInput) {
            pieceInput.value = data.piece || '1';
            pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
            pieceInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        const quantityInput = document.getElementById('quantityInput');
        if (quantityInput) {
            quantityInput.value = data.quantity || '1';
            quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
            quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        const shelfLifeInput = document.getElementById('shelfLifeInput');
        if (shelfLifeInput) {
            shelfLifeInput.value = data.shelf_life || '12';
            shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
            shelfLifeInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        const unitSelect = document.getElementById('unitSelect');
        if (unitSelect && data.unit) {
            for (let option of unitSelect.options) {
                if (option.value === data.unit) {
                    option.selected = true;
                    unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }
        
        const storageSelect = document.getElementById('storageSelect');
        if (storageSelect && data.storage) {
            for (let option of storageSelect.options) {
                if (option.value === data.storage) {
                    option.selected = true;
                    storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }
        
        showVoiceStatus(`✅ Uneto: ${data.product_name} (${data.quantity} ${data.unit})`, '#4CAF50');
    }, 200);
}

// ============================================
// 6. ČUVANJE PODATAKA
// ============================================

function sacuvajPodatke(data) {
    console.log('💾 Čuvam podatke:', data);
    
    if (!data || !data.product_name || data.product_name === 'Proizvod') {
        console.warn('⚠️ Nema podataka za čuvanje');
        return false;
    }
    
    // Sačuvaj u localStorage
    try {
        const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
        const newItem = {
            id: Date.now(),
            product_name: data.product_name,
            piece: parseInt(data.piece) || 1,
            quantity: parseFloat(data.quantity) || 1,
            unit: data.unit || 'kom',
            shelf_life_months: parseInt(data.shelf_life) || 12,
            storage_location: data.storage || 'Zamrzivač 1',
            entry_date: new Date().toISOString().split('T')[0],
            dateAdded: new Date().toISOString()
        };
        zalihe.push(newItem);
        localStorage.setItem('zalihe', JSON.stringify(zalihe));
        
        // Ažuriraj i window.inventory za prikaz
        if (!Array.isArray(window.inventory)) window.inventory = [];
        window.inventory.push({
            id: newItem.id,
            productName: newItem.product_name,
            piece: newItem.piece,
            quantity: newItem.quantity,
            unit: newItem.unit,
            shelfLife: newItem.shelf_life_months,
            storage: newItem.storage_location,
            dateAdded: newItem.dateAdded
        });
        
        showVoiceStatus(`✅ Sačuvano: ${data.product_name}`, '#4CAF50');
        console.log('✅ Podaci sačuvani!');
        
        // Osveži prikaz
        setTimeout(() => {
            if (typeof prikaziSveUnose === 'function') {
                try { prikaziSveUnose(); } catch(e) {}
            }
            if (typeof renderInventory === 'function') {
                try { renderInventory(); } catch(e) {}
            }
        }, 200);
        
        return true;
    } catch(e) {
        console.error('❌ Greška pri čuvanju:', e);
        showVoiceStatus('❌ Greška pri čuvanju!', '#f44336');
        return false;
    }
}

function processAndSaveItem(command) {
    let data = parseVoiceDataEntry(command);
    if (!data.product_name || data.product_name === 'Proizvod' || data.product_name.length < 2) {
        console.warn('⚠️ Nije prepoznat naziv proizvoda:', command);
        showVoiceStatus('❌ Nisam prepoznao proizvod', '#f44336');
        return false;
    }
    
    console.log('📦 OBRADA:', data);
    lastSavedData = data;
    
    popuniFormuPodacima(data);
    return sacuvajPodatke(data);
}

// ============================================
// 7. OTVARANJE ZALIHA - POPRAVLJENO!
// ============================================

function otvoriZaliheEkran() {
    console.log('📦 Otvaram ekran zaliha...');
    
    // Prvo osveži podatke
    try {
        const savedData = localStorage.getItem('zalihe');
        if (savedData) {
            window.inventory = JSON.parse(savedData);
            console.log('📦 Učitano iz localStorage:', window.inventory.length, 'stavki');
        }
    } catch(e) {
        console.warn('Greška pri učitavanju:', e);
    }
    
    // Pokušaj da otvoriš inventoryScreen
    if (typeof showScreen === 'function') {
        console.log('✅ Pozivam showScreen("inventoryScreen")');
        showScreen('inventoryScreen');
        showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
        return;
    }
    
    // Fallback - prikaži mainScreen sa zalihama
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    
    if (typeof renderInventory === 'function') {
        renderInventory();
    } else {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            let html = '<h1 class="title">📦 Zalihe</h1>';
            const items = window.inventory || [];
            if (items.length === 0) {
                html += '<p style="text-align:center;font-size:20px;color:#999;padding:40px 0;">Nema proizvoda u zalihama.</p>';
            } else {
                html += `<div class="table-container"><div class="table-title">📋 Lista proizvoda (${items.length})</div>`;
                html += `<div class="table-row header-row"><div class="cell">Proizvod</div><div class="cell">Komada</div><div class="cell">Količina</div><div class="cell">Jedinica</div><div class="cell">Lokacija</div></div>`;
                items.forEach(item => {
                    html += `<div class="table-row">`;
                    html += `<div class="cell">${item.product_name || item.productName || 'N/A'}</div>`;
                    html += `<div class="cell">${item.piece || 1}</div>`;
                    html += `<div class="cell">${item.quantity || 1}</div>`;
                    html += `<div class="cell">${item.unit || 'kom'}</div>`;
                    html += `<div class="cell">${item.storage_location || item.storage || 'Zamrzivač 1'}</div>`;
                    html += `</div>`;
                });
                html += `</div>`;
            }
            mainContent.innerHTML = html;
        }
    }
    showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
}

// ============================================
// 8. KOMANDE ZA 4. EKRAN (VOICE MENU)
// ============================================

function voiceCommand(action) {
    console.log('🎤 voiceCommand:', action);
    
    if (action === 'inventory') {
        // Otvori zalihe
        ALLOW_INVENTORY_OPEN = true;
        otvoriZaliheEkran();
        setTimeout(() => { ALLOW_INVENTORY_OPEN = false; }, 1000);
    } else if (action === 'shopping') {
        // Otvori spisak
        if (typeof showScreen === 'function') {
            showScreen('shoppingList');
        } else {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                mainContent.innerHTML = `
                    <h1 class="title">🛒 Spisak</h1>
                    <p style="text-align:center;font-size:20px;color:#999;padding:40px 0;">Spisak je prazan.</p>
                `;
            }
        }
    } else if (action === 'add') {
        // Otvori unos
        if (typeof showScreen === 'function') {
            showScreen('dataEntry');
        } else {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderDataEntry === 'function') {
                renderDataEntry('');
            }
        }
        showVoiceStatus('📝 Otvaram unos...', '#4CAF50');
    } else if (action === 'exit') {
        // Zatvori
        goBackFromVoice();
    }
}

// ============================================
// 9. START VOICE RECOGNITION
// ============================================

function startVoiceRecognition() {
    console.log('🎤 startVoiceRecognition POZVAN!');
    
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
    const langCode = typeof currentLang !== 'undefined' ? currentLang : 'sr';
    const speechLangMap = {
        sr: 'sr-RS', en: 'en-US', de: 'de-DE', hu: 'hu-HU',
        uk: 'uk-UA', ru: 'ru-RU', zh: 'zh-CN', es: 'es-ES',
        pt: 'pt-PT', fr: 'fr-FR'
    };
    recognition.lang = speechLangMap[langCode] || 'sr-RS';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    isProcessingCommand = false;
    ALLOW_INVENTORY_OPEN = false;

    recognition.onstart = function() {
        console.log('🎤 MIKROFON AKTIVAN!');
        showVoiceStatus('🎤 Slušam... Recite "unos", "zalihe", "spisak" ili "end"', '#2196F3');
        activeBuffer = '';
        isProcessingCommand = false;
    };

    recognition.onresult = function(event) {
        let interimText = '';
        let finalChunk = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript.trim();
            if (result.isFinal) {
                finalChunk += (finalChunk ? ' ' : '') + transcript;
            } else {
                interimText += transcript;
            }
        }
        
        if (finalChunk) {
            activeBuffer += (activeBuffer ? ' ' : '') + finalChunk;
            console.log('🗣️ TRENUTNI BAFER:', activeBuffer);
        }
        
        const currentDisplay = activeBuffer + (interimText ? ' ' + interimText : '');
        showVoiceStatus(`🎤 Slušam: "${currentDisplay}"`, '#FFD700');
        
        if (isProcessingCommand) return;
        
        const lowerFull = activeBuffer.toLowerCase();
        console.log('🔍 PROVERAVAM CELI BAFER:', lowerFull);
        
        // ============================================
        // END - OTVARA ZALIHE
        // ============================================
        if (lowerFull.includes('end') || lowerFull.includes(' and ') || lowerFull.includes('kraj') || lowerFull.includes('gotovo')) {
            console.log('🏁 END DETEKTOVAN - otvaram zalihe!');
            isProcessingCommand = true;
            ALLOW_INVENTORY_OPEN = true;
            
            // Sačuvaj tekst pre "end"
            let itemText = activeBuffer;
            let parts = itemText.split(/\bend\b/i);
            if (parts.length === 1) {
                parts = itemText.split(/\band\b/i);
            }
            if (parts.length === 1) {
                parts = itemText.split(/\bkraj\b/i);
            }
            if (parts.length === 1) {
                parts = itemText.split(/\bgotovo\b/i);
            }
            itemText = parts[0].trim();
            
            // Ako ima teksta pre "end", sačuvaj ga
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }
            
            activeBuffer = '';
            
            setTimeout(() => {
                stopVoiceRecognition();
                setTimeout(() => {
                    ALLOW_INVENTORY_OPEN = true;
                    otvoriZaliheEkran();
                    setTimeout(() => {
                        ALLOW_INVENTORY_OPEN = false;
                        isProcessingCommand = false;
                        // Restartuj mikrofon nakon 2 sekunde
                        setTimeout(() => {
                            console.log('🔄 Restartujem mikrofon nakon "end"');
                            startVoiceRecognition();
                        }, 1000);
                    }, 500);
                }, 300);
            }, 500);
            
            return;
        }
        
        // ============================================
        // PLUS - SAČUVAJ I NASTAVI
        // ============================================
        if (lowerFull.includes('plus')) {
            console.log('✅ PLUS DETEKTOVAN - sačuvaj i nastavi');
            isProcessingCommand = true;
            
            let parts = activeBuffer.split(/\bplus\b/i);
            let itemText = parts[0].trim();
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }
            
            activeBuffer = parts.slice(1).join('').trim();
            
            showVoiceStatus('✅ Unos sačuvan. Recite sledeći ili "end" za kraj.', '#4CAF50');
            
            setTimeout(() => {
                if (typeof prikaziSveUnose === 'function') {
                    try { prikaziSveUnose(); } catch(e) {}
                }
            }, 200);
            
            setTimeout(() => {
                isProcessingCommand = false;
            }, 500);
            
            return;
        }
        
        // ============================================
        // KOMANDE ZA 4. EKRAN
        // ============================================
        const lower = activeBuffer.toLowerCase().trim();
        
        // "zalihe" ili "stock"
        if (lower.includes('zalihe') || lower.includes('zaliha') || lower.includes('stock')) {
            console.log('📦 ZALIHE DETEKTOVANE');
            isProcessingCommand = true;
            stopVoiceRecognition();
            setTimeout(() => {
                ALLOW_INVENTORY_OPEN = true;
                otvoriZaliheEkran();
                setTimeout(() => {
                    ALLOW_INVENTORY_OPEN = false;
                    isProcessingCommand = false;
                }, 500);
            }, 300);
            activeBuffer = '';
            return;
        }
        
        // "spisak" ili "list"
        if (lower.includes('spisak') || lower.includes('lista') || lower.includes('list')) {
            console.log('📋 SPISAK DETEKTOVAN');
            isProcessingCommand = true;
            stopVoiceRecognition();
            setTimeout(() => {
                if (typeof showScreen === 'function') {
                    showScreen('shoppingList');
                }
                isProcessingCommand = false;
            }, 300);
            activeBuffer = '';
            return;
        }
        
        // "unos" ili "dodaj" ili "add"
        if (lower.includes('unos') || lower.includes('unesi') || lower.includes('dodaj') || lower.includes('add')) {
            console.log('📝 UNOS DETEKTOVAN');
            isProcessingCommand = true;
            stopVoiceRecognition();
            setTimeout(() => {
                if (typeof showScreen === 'function') {
                    showScreen('dataEntry');
                }
                isProcessingCommand = false;
            }, 300);
            activeBuffer = '';
            return;
        }
        
        // "exit" ili "izlaz"
        if (lower.includes('exit') || lower.includes('izlaz') || lower.includes('close')) {
            console.log('🚪 EXIT DETEKTOVAN');
            isProcessingCommand = true;
            stopVoiceRecognition();
            setTimeout(() => {
                goBackFromVoice();
                isProcessingCommand = false;
            }, 300);
            activeBuffer = '';
            return;
        }
    };

    recognition.onerror = function(event) {
        console.error('⚠️ Speech Recognition greška:', event.error);
        if (event.error === 'not-allowed') {
            showVoiceStatus('❌ Dozvolite pristup mikrofonu.', '#f44336');
        } else if (event.error === 'no-speech') {
            showVoiceStatus('⚠️ Nisam čuo govor. Pokušajte ponovo.', '#FF9800');
        }
        isProcessingCommand = false;
    };

    recognition.onend = function() {
        console.log('🎤 Glasovno prepoznavanje završeno.');
        isProcessingCommand = false;
    };

    try {
        recognition.start();
        console.log('✅ Mikrofon pokrenut!');
        showVoiceStatus('🎤 Slušam...', '#2196F3');
    } catch(e) {
        console.error('❌ Greška pri pokretanju:', e);
        showVoiceStatus('❌ Greška pri pokretanju mikrofona', '#f44336');
    }
}

// ============================================
// 10. ZAUSTAVI PREPOZNAVANJE
// ============================================

function stopVoiceRecognition() {
    if (recognition) {
        try {
            recognition.stop();
            recognition = null;
        } catch(e) {}
    }
    activeBuffer = '';
    isProcessingCommand = false;
    showVoiceStatus('⏸️ Prepoznavanje zaustavljeno', '#aaa');
}

// ============================================
// 11. POVRATAK NA PREĐAŠNJI EKRAN
// ============================================

function goBackFromVoice() {
    console.log('◀ goBackFromVoice POZVAN!');
    stopVoiceRecognition();
    
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    const choiceScreen = document.getElementById('choiceScreen');
    if (choiceScreen) {
        choiceScreen.style.display = 'flex';
        choiceScreen.classList.add('active');
    }
    
    if (typeof updateHeaderLanguage === 'function') {
        updateHeaderLanguage();
    }
    if (typeof updateInterfaceLanguage === 'function') {
        updateInterfaceLanguage();
    }
}

// ============================================
// 12. SELEKTOVANJE VOICE MODE
// ============================================

function selectVoiceMode() {
    console.log('🎤 selectVoiceMode POZVAN!');
    
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    const voiceMenuScreen = document.getElementById('voiceMenuScreen');
    if (voiceMenuScreen) {
        voiceMenuScreen.style.display = 'flex';
        voiceMenuScreen.classList.add('active');
        console.log('✅ Voice menu prikazan');
    }
    
    setTimeout(function() {
        console.log('🎤 Pokrećem VOICE COMMANDS...');
        startVoiceRecognition();
    }, 500);
}

// ============================================
// 13. RESTART MIKROFONA
// ============================================

function restartMicrophone() {
    console.log('🔄 Restartujem mikrofon...');
    stopVoiceRecognition();
    setTimeout(() => {
        startVoiceRecognition();
    }, 500);
}

// ============================================
// 14. GLOBALNI IZVOZ
// ============================================

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.selectVoiceMode = selectVoiceMode;
window.restartMicrophone = restartMicrophone;
window.voiceCommand = voiceCommand;
window.otvoriZaliheEkran = otvoriZaliheEkran;
window.processAndSaveItem = processAndSaveItem;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.sacuvajPodatke = sacuvajPodatke;
window.showVoiceStatus = showVoiceStatus;

console.log('✅ Voice Commands v3.0 učitane!');
console.log('🎤 Komande: "unos", "zalihe", "spisak", "end", "plus", "exit"');
