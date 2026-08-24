// ============================================
// VOICE COMMANDS - KONAČNA VERZIJA v3.0
// SA POPRAVKAMA ZA EKRANE
// ============================================

let activeBuffer = ''; 
let recognition = null;
let lastSavedData = null;
let isProcessingCommand = false;
let END_AKTIVAN = false;
let isVoiceInput = false;
let micRestartTimer = null;

// ============================================
// 1. POMOĆNE FUNKCIJE
// ============================================

function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
    }
    const choiceScreen = document.getElementById('choiceScreen');
    if (choiceScreen) {
        choiceScreen.style.display = 'none';
        choiceScreen.classList.remove('active');
    }
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
// 2. BROJEVI NA SRPSKOM
// ============================================

const NUMBER_WORDS = {
    'nula': '0',
    'jedan': '1', 'jedna': '1', 'jedno': '1',
    'dva': '2', 'dve': '2',
    'tri': '3',
    'četiri': '4', 'cetiri': '4',
    'pet': '5',
    'šest': '6', 'sest': '6',
    'sedam': '7',
    'osam': '8',
    'devet': '9',
    'deset': '10',
    'jedanaest': '11', 'dvanaest': '12',
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
// 5. OTVARANJE EKRANA - ISPRAVLJENO
// ============================================

function showMainScreen() {
    console.log('📱 Prikazujem mainScreen');
    
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.style.flexDirection = 'column';
        mainScreen.classList.add('active');
        console.log('✅ mainScreen prikazan');
    }
}

// ============================================
// 6. OTVARANJE ZALIHA - ISPRAVLJENO
// ============================================

function otvoriZaliheEkran() {
    console.log('📦 Otvaram zalihe...');
    
    // Učitaj podatke
    try {
        const savedData = localStorage.getItem('zalihe');
        if (savedData) {
            window.inventory = JSON.parse(savedData);
            console.log('📦 Učitano iz localStorage:', window.inventory.length, 'stavki');
        }
    } catch(e) {
        console.warn('Greška pri učitavanju:', e);
    }
    
    showMainScreen();
    
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    const items = window.inventory || [];
    let html = '<h1 class="title">📦 Zalihe</h1>';
    
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
    html += `<div style="text-align:center;margin-top:20px;">
        <button class="btn btn-green" onclick="showDataEntry()" style="padding:15px 40px;font-size:20px;">➕ Dodaj proizvod</button>
    </div>`;
    mainContent.innerHTML = html;
    showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
}

// ============================================
// 7. OTVARANJE SPISKA - ISPRAVLJENO
// ============================================

function otvoriSpisakEkran() {
    console.log('📋 Otvaram spisak...');
    
    showMainScreen();
    
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    // Učitaj shopping listu
    let items = [];
    try {
        const saved = localStorage.getItem('shoppingList');
        if (saved) items = JSON.parse(saved);
    } catch(e) {}
    
    let html = '<h1 class="title">🛒 Spisak</h1>';
    
    if (items.length === 0) {
        html += '<p style="text-align:center;font-size:20px;color:#999;padding:40px 0;">Spisak je prazan.</p>';
    } else {
        html += `<div class="table-container"><div class="table-title">📋 Shopping lista (${items.length})</div>`;
        html += `<div class="table-row header-row"><div class="cell">Proizvod</div><div class="cell">Količina</div></div>`;
        items.forEach(item => {
            html += `<div class="table-row">`;
            html += `<div class="cell">${item.product_name || item || 'N/A'}</div>`;
            html += `<div class="cell">${item.quantity || 1}</div>`;
            html += `</div>`;
        });
        html += `</div>`;
    }
    html += `<div style="text-align:center;margin-top:20px;">
        <button class="btn btn-green" onclick="showDataEntry()" style="padding:15px 40px;font-size:20px;">➕ Dodaj proizvod</button>
    </div>`;
    mainContent.innerHTML = html;
    showVoiceStatus('📋 Spisak otvoren', '#4CAF50');
}

// ============================================
// 8. OTVARANJE UNOSA - ISPRAVLJENO
// ============================================

function showDataEntry() {
    console.log('📝 Otvaram unos...');
    
    showMainScreen();
    
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <h1 class="title">📝 Unos proizvoda</h1>
        <div id="dataEntryForm">
            <div class="row">
                <label for="productInput">Proizvod:</label>
                <input type="text" id="productInput" placeholder="Naziv proizvoda..." autofocus>
            </div>
            <div class="row">
                <label for="pieceInput">Komada:</label>
                <input type="number" id="pieceInput" value="1" min="1">
            </div>
            <div class="row">
                <label for="quantityInput">Količina:</label>
                <input type="number" id="quantityInput" value="1" min="0.01" step="0.01">
            </div>
            <div class="row">
                <label for="unitSelect">Jedinica:</label>
                <select id="unitSelect">
                    <option value="kom">kom</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">l</option>
                    <option value="pak">pak</option>
                </select>
            </div>
            <div class="row">
                <label for="shelfLifeInput">Rok (meseci):</label>
                <input type="number" id="shelfLifeInput" value="6" min="1" max="60">
            </div>
            <div class="row">
                <label for="storageSelect">Lokacija:</label>
                <select id="storageSelect">
                    <option value="Zamrzivač 1">Zamrzivač 1</option>
                    <option value="Zamrzivač 2">Zamrzivač 2</option>
                    <option value="Zamrzivač 3">Zamrzivač 3</option>
                    <option value="Frižider">Frižider</option>
                    <option value="Ostava">Ostava</option>
                </select>
            </div>
            <div class="btn-group">
                <button class="btn-save" onclick="saveProduct()">💾 Sačuvaj</button>
                <button class="btn-cancel" onclick="cancelProduct()">✖ Otkaži</button>
            </div>
            <div id="voiceStatusInline" style="margin-top:20px; padding:15px; background:#f0f0f0; border-radius:12px; font-size:18px; text-align:center; color:#1a237e;">
                🎤 Mikrofon je i dalje aktivan! Reci naziv proizvoda...
            </div>
        </div>
    `;
    
    setTimeout(() => {
        const input = document.getElementById('productInput');
        if (input) input.focus();
    }, 300);
    
    showVoiceStatus('📝 Unos otvoren', '#4CAF50');
}

// ============================================
// 9. ČUVANJE PODATAKA
// ============================================

function sacuvajPodatke(data) {
    console.log('💾 Čuvam podatke:', data);
    
    if (!data || !data.product_name || data.product_name === 'Proizvod') return false;
    
    // Sačuvaj u localStorage
    try {
        const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
        
        // Proveri da li već postoji
        const existingIndex = zalihe.findIndex(item => 
            item.product_name && 
            item.product_name.toLowerCase() === data.product_name.toLowerCase() &&
            item.unit === data.unit &&
            item.storage_location === data.storage
        );
        
        if (existingIndex > -1) {
            const item = zalihe[existingIndex];
            item.quantity = parseFloat(item.quantity) + parseFloat(data.quantity);
            item.piece = parseFloat(item.piece) + parseFloat(data.piece);
            item.shelf_life_months = parseInt(data.shelf_life) || 6;
            console.log('✅ Sabrano:', data.product_name, 'ukupno:', item.quantity);
            showVoiceStatus(`✅ Sabrano: ${data.product_name} (ukupno ${item.quantity} ${data.unit})`, '#4CAF50');
        } else {
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
            showVoiceStatus(`✅ ${data.product_name} sačuvan`, '#4CAF50');
        }
        
        localStorage.setItem('zalihe', JSON.stringify(zalihe));
        window.inventory = zalihe;
        
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

// ============================================
// 10. OBRADA I ČUVANJE
// ============================================

function processAndSaveItem(command) {
    let data = parseVoiceDataEntry(command);
    if (!data.product_name || data.product_name === 'Proizvod' || data.product_name.length < 2) {
        console.warn('⚠️ Nije prepoznat naziv proizvoda:', command);
        showVoiceStatus('❌ Nisam prepoznao proizvod', '#f44336');
        return false;
    }
    
    console.log('📦 OBRADA:', data);
    lastSavedData = data;
    
    return sacuvajPodatke(data);
}

// ============================================
// 11. SAVE PRODUCT - POZIVA SE IZ FORME
// ============================================

function saveProduct() {
    const productName = document.getElementById('productInput')?.value?.trim() || '';
    const piece = parseFloat(document.getElementById('pieceInput')?.value) || 1;
    const quantity = parseFloat(document.getElementById('quantityInput')?.value) || 1;
    const unit = document.getElementById('unitSelect')?.value || 'kom';
    const shelfLife = parseInt(document.getElementById('shelfLifeInput')?.value) || 6;
    const storage = document.getElementById('storageSelect')?.value || 'Zamrzivač 1';
    
    if (!productName) {
        showVoiceStatus('❌ Unesite naziv proizvoda', '#f44336');
        return;
    }
    
    const data = {
        product_name: productName,
        piece: piece,
        quantity: quantity,
        unit: unit,
        shelf_life: shelfLife,
        storage: storage
    };
    
    if (sacuvajPodatke(data)) {
        // Očisti formu ali zadrži fokus
        const inputs = ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        document.getElementById('pieceInput').value = '1';
        document.getElementById('quantityInput').value = '1';
        document.getElementById('shelfLifeInput').value = '6';
        
        setTimeout(() => {
            document.getElementById('productInput').focus();
        }, 300);
    }
}

function cancelProduct() {
    showDataEntry();
}

// ============================================
// 12. START VOICE RECOGNITION
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

    recognition.onstart = function() {
        console.log('🎤 MIKROFON AKTIVAN!');
        showVoiceStatus('🎤 Slušam... Recite "unos", "zalihe", "spisak" ili "exit"', '#2196F3');
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
            
            let itemText = activeBuffer;
            let parts = itemText.split(/\bend\b/i);
            if (parts.length === 1) parts = itemText.split(/\band\b/i);
            if (parts.length === 1) parts = itemText.split(/\bkraj\b/i);
            if (parts.length === 1) parts = itemText.split(/\bgotovo\b/i);
            itemText = parts[0].trim();
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }
            
            activeBuffer = '';
            
            setTimeout(() => {
                stopVoiceRecognition();
                setTimeout(() => {
                    otvoriZaliheEkran();
                    setTimeout(() => {
                        console.log('🔄 Restartujem mikrofon nakon "end"');
                        startVoiceRecognition();
                    }, 1000);
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
                isProcessingCommand = false;
            }, 500);
            
            return;
        }
        
        // ============================================
        // KOMANDE ZA 4. EKRAN
        // ============================================
        const lower = activeBuffer.toLowerCase().trim();
        
        // ZALIHE
        if (lower.includes('zalihe') || lower.includes('zaliha') || lower.includes('stock') || lower.includes('inventory')) {
            console.log('📦 ZALIHE DETEKTOVANE');
            isProcessingCommand = true;
            stopVoiceRecognition();
            setTimeout(() => {
                otvoriZaliheEkran();
                isProcessingCommand = false;
            }, 300);
            activeBuffer = '';
            return;
        }
        
        // SPISAK
        if (lower.includes('spisak') || lower.includes('lista') || lower.includes('list') || lower.includes('shopping')) {
            console.log('📋 SPISAK DETEKTOVAN');
            isProcessingCommand = true;
            stopVoiceRecognition();
            setTimeout(() => {
                otvoriSpisakEkran();
                isProcessingCommand = false;
            }, 300);
            activeBuffer = '';
            return;
        }
        
        // UNOS
        if (lower.includes('unos') || lower.includes('unesi') || lower.includes('dodaj') || lower.includes('add')) {
            console.log('📝 UNOS DETEKTOVAN');
            isProcessingCommand = true;
            stopVoiceRecognition();
            setTimeout(() => {
                showDataEntry();
                isProcessingCommand = false;
            }, 300);
            activeBuffer = '';
            return;
        }
        
        // EXIT
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
        
        // TIMER ZA RESTART
        if (micRestartTimer) {
            clearTimeout(micRestartTimer);
        }
        micRestartTimer = setTimeout(() => {
            if (!isProcessingCommand && activeBuffer.length === 0) {
                console.log('⏰ Nema aktivnosti 10 sekundi, restartujem mikrofon...');
                restartMicrophone();
            }
        }, 10000);
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
// 13. ZAUSTAVI PREPOZNAVANJE
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
// 14. RESTART MIKROFONA
// ============================================

function restartMicrophone() {
    console.log('🔄 Restartujem mikrofon...');
    stopVoiceRecognition();
    setTimeout(() => {
        startVoiceRecognition();
    }, 500);
}

// ============================================
// 15. POVRATAK NA PREĐAŠNJI EKRAN
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
// 16. SELEKTOVANJE VOICE MODE
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
// 17. VOICE COMMAND - ZA DUGMAD NA 4. EKRANU
// ============================================

function voiceCommand(action) {
    console.log('🎤 voiceCommand:', action);
    
    if (action === 'inventory' || action === 'zalihe') {
        otvoriZaliheEkran();
    } else if (action === 'shopping' || action === 'spisak') {
        otvoriSpisakEkran();
    } else if (action === 'add' || action === 'unos') {
        showDataEntry();
    } else if (action === 'exit') {
        goBackFromVoice();
    }
}

// ============================================
// 18. GLOBALNI IZVOZ
// ============================================

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.selectVoiceMode = selectVoiceMode;
window.voiceCommand = voiceCommand;
window.showDataEntry = showDataEntry;
window.otvoriZaliheEkran = otvoriZaliheEkran;
window.otvoriSpisakEkran = otvoriSpisakEkran;
window.sacuvajPodatke = sacuvajPodatke;
window.saveProduct = saveProduct;
window.cancelProduct = cancelProduct;
window.processAndSaveItem = processAndSaveItem;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.showVoiceStatus = showVoiceStatus;
window.restartMicrophone = restartMicrophone;

console.log('✅ Voice Commands v3.0 učitane!');
console.log('🎤 Komande: UNOS, ZALIHE, SPISAK, EXIT, END, PLUS');
console.log('📌 Dugmad na 4. ekranu: Inventory, Shopping List, Add Product, EXIT');
