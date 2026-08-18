// ============================================
// VOICE COMMANDS - ISPRAVLJENA VERZIJA
// ============================================

let activeBuffer = ''; 
let recognition = null;
let lastSavedData = null;

// ===== POMOĆNA FUNKCIJA ZA SAKRIVANJE EKRANA =====
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

// ===== POKRETAČ ZA GLASOVNI UNOS =====
function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        if (typeof showModernAlert === 'function') {
            showModernAlert('Greška', 'Vaš pretraživač ne podržava glasovne komande.', '❌');
        }
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

    const statusEl = document.getElementById('voiceStatus');

    recognition.onstart = function() {
        console.log('🎤 Glasovno prepoznavanje pokrenuto');
        if (statusEl) {
            statusEl.textContent = '🎤 Slušam... Diktirajte (npr: "Pileći batak 1 kg 6 meseci zamrzivač 1 plus", a na kraju "end").';
            statusEl.style.color = '#2196F3';
        }
        activeBuffer = '';
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
        if (statusEl) {
            statusEl.textContent = `🎤 Slušam: "${currentDisplay}"`;
            statusEl.style.color = '#FFD700';
        }
        
        const lowerBuffer = activeBuffer.toLowerCase();
        
        // DATA ENTRY KEYWORDS
        const dataEntryKeywords = ['unos', 'unesi', 'dodaj', 'novi', 'add'];
        if (dataEntryKeywords.some(k => lowerBuffer.includes(k))) {
            hideVoiceMenu();
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen && mainScreen.style.display !== 'flex') {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
                if (typeof renderDataEntry === 'function') renderDataEntry('');
            }
            // Očisti "unos" iz buffera
            activeBuffer = activeBuffer.replace(/^(unos|unesi|dodaj|novi|add)\s*/i, '');
        }
        
        // PROVERA ZA "PLUS" - SAMO ZAVRŠAVA TRENUTNI UNOS
        if (/\bplus\b/i.test(activeBuffer) && !/\b(end|enter|friend)\b/i.test(activeBuffer)) {
            console.log('✅ PLUS detektovan - završavam unos');
            
            let parts = activeBuffer.split(/\bplus\b/i);
            let itemText = parts[0].trim();
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }
            
            // Ostavi ostatak za sledeći unos
            activeBuffer = parts.slice(1).join('').trim();
            
            // Ažuriraj status
            if (statusEl) {
                statusEl.textContent = `✅ Unos sačuvan. Spremni za sledeći.`;
                statusEl.style.color = '#4CAF50';
            }
        }
        
        // PROVERA ZA "END", "ENTER" ILI "FRIEND" - ZAVRŠAVA I OTVARA ZALIHE
        if (/\b(end|enter|friend)\b/i.test(activeBuffer)) {
            console.log('🏁 END detektovan - završavam i otvaram zalihe');
            
            let parts = activeBuffer.split(/\b(end|enter|friend)\b/i);
            let itemText = parts[0].trim();
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }
            
            // Očisti buffer
            activeBuffer = '';
            
            // Zaustavi prepoznavanje i otvori zalihe
            setTimeout(() => {
                stopVoiceRecognition();
                setTimeout(() => {
                    otvoriZaliheEkran();
                }, 500);
            }, 300);
        }
    };

    recognition.onerror = function(event) {
        console.log('⚠️ Speech Recognition greška:', event.error);
        if (event.error === 'not-allowed') {
            if (statusEl) {
                statusEl.textContent = '❌ Dozvolite pristup mikrofonu.';
                statusEl.style.color = '#f44336';
            }
        }
    };

    recognition.onend = function() {
        console.log('🎤 Glasovno prepoznavanje završeno.');
    };

    try {
        recognition.start();
    } catch(e) {
        console.log('❌ Greška pri pokretanju recognition-a:', e);
    }
}

// ===== ZAUSTAVI GLASOVNO PREPOZNAVANJE =====
function stopVoiceRecognition() {
    if (recognition) {
        try {
            recognition.stop();
            recognition = null;
        } catch(e) {}
    }
    activeBuffer = '';
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '⏸️ Prepoznavanje zaustavljeno';
        statusEl.style.color = '#aaa';
    }
}

// ===== OTVORI ZALIHE / PREGLED =====
function otvoriZaliheEkran() {
    console.log('📦 Otvaram ekran zaliha...');
    
    // Osveži podatke
    if (typeof refreshInventoryData === 'function') {
        refreshInventoryData();
    }
    
    setTimeout(() => {
        if (typeof renderInventory === 'function') {
            renderInventory();
        }
        if (typeof renderProductList === 'function') {
            renderProductList();
        }
        if (typeof renderEntries === 'function') {
            renderEntries();
        }
        if (typeof loadInventory === 'function') {
            loadInventory();
        }
        if (typeof updateInventory === 'function') {
            updateInventory();
        }
    }, 100);
    
    setTimeout(() => {
        if (typeof openInventoryAndShowHighlight === 'function') {
            openInventoryAndShowHighlight();
        } else if (typeof showScreen === 'function') {
            showScreen('inventoryScreen');
        } else {
            const inv = document.getElementById('inventoryScreen');
            const main = document.getElementById('mainScreen');
            if (inv) {
                if (main) main.style.display = 'none';
                inv.style.display = 'flex';
                inv.classList.add('active');
            }
        }
        console.log('✅ Ekran zaliha otvoren');
    }, 200);
}

// ===== POVRATAK SA VOICE MENIJA =====
function goBackFromVoice() {
    stopVoiceRecognition();
    if (typeof showScreen === 'function') {
        showScreen('choiceScreen');
    }
}

// ===== PARSIRANJE GLASNOG UNOSA =====
function parseVoiceDataEntry(command) {
    let text = command
        .replace(/^unos\s*/i, '')
        .replace(/^start\s*/i, '')
        .trim();
        
    let words = text.split(/\s+/).map(s => s.trim()).filter(Boolean);
    
    let result = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    const unitMap = {
        'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg',
        'gram': 'g', 'grama': 'g', 'g': 'g',
        'litar': 'l', 'litara': 'l', 'l': 'l',
        'komad': 'kom', 'komada': 'kom', 'kom': 'kom',
        'paket': 'pak', 'paketa': 'pak', 'pak': 'pak'
    };
    
    const storageMap = {
        'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
        'zamrzivač 1': 'Zamrzivač 1', 'zamrzivac 1': 'Zamrzivač 1',
        'zamrzivač 2': 'Zamrzivač 2', 'zamrzivac 2': 'Zamrzivač 2',
        'zamrzivač 3': 'Zamrzivač 3', 'zamrzivac 3': 'Zamrzivač 3',
        'frižider': 'Frižider', 'frizider': 'Frižider',
        'ostava': 'Ostava', 'špajz': 'Ostava'
    };

    const numberWordsMap = {
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

    let nameWords = [];
    let quantityFound = false;
    let shelfLifeFound = false;
    let storageFound = false;
    
    let i = 0;
    while (i < words.length) {
        let w = words[i].toLowerCase();
        
        if (w === 'start' || w === 'unos') {
            i++;
            continue;
        }

        // Provera skladišta - PRVO proveri
        let storageMatch = null;
        for (let key in storageMap) {
            if (w.includes(key) || key.includes(w)) {
                storageMatch = storageMap[key];
                break;
            }
        }
        if (storageMatch) {
            result.storage = storageMatch;
            storageFound = true;
            i++;
            continue;
        }

        // Provera jedinice
        if (unitMap[w]) {
            result.unit = unitMap[w];
            i++;
            continue;
        }

        // Provera broja - ali samo ako nije deo naziva
        let numVal = null;
        if (!isNaN(w) && w.trim() !== '') {
            numVal = w;
        } else if (numberWordsMap[w]) {
            numVal = numberWordsMap[w];
        }

        if (numVal !== null) {
            if (!quantityFound) {
                result.quantity = numVal;
                result.piece = numVal;
                quantityFound = true;
            } else if (!shelfLifeFound) {
                result.shelf_life = numVal;
                shelfLifeFound = true;
            }
            i++;
            continue;
        }

        // Preskoči nepotrebne reči
        if (['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima'].includes(w)) {
            i++;
            continue;
        }

        // Ako nismo našli količinu, dodaj u naziv
        if (!quantityFound) {
            nameWords.push(words[i]);
        }
        // Ako smo našli količinu ali još uvek nismo našli skladište,
        // i reč nije broj, jedinica ili skladište - preskoči
        else if (!storageFound && !unitMap[w] && !storageMatch) {
            // Preskoči
        }

        i++;
    }

    // Ako nema naziva, uzmi sve pre prvog broja
    if (nameWords.length === 0) {
        let tempName = [];
        for (let word of words) {
            if (!isNaN(word) || numberWordsMap[word.toLowerCase()]) break;
            tempName.push(word);
        }
        result.product_name = tempName.join(' ') || 'Proizvod';
    } else {
        result.product_name = nameWords.join(' ');
    }
    
    // Ako nije pronađena količina, stavi 1
    if (!quantityFound) {
        result.quantity = '1';
        result.piece = '1';
    }
    
    console.log('✅ Parsirani podaci:', result);
    return result;
}

// ===== GLAVNA FUNKCIJA ZA OBRADU I ČUVANJE =====
function processAndSaveItem(command) {
    let data = parseVoiceDataEntry(command);
    if (!data.product_name || data.product_name === 'Proizvod') {
        console.warn('⚠️ Nije prepoznat naziv proizvoda');
        return false;
    }
    
    console.log('📦 OBRADA:', data);
    lastSavedData = data;
    
    // Otvori Data Entry ekran
    hideVoiceMenu();
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    
    // Popuni formu i sačuvaj
    setTimeout(() => {
        popuniFormuPodacima(data);
        
        setTimeout(() => {
            sacuvajPodatke(data);
        }, 200);
        
    }, 100);

    return true;
}

// ===== POPUNJAVANJE FORME =====
function popuniFormuPodacima(data) {
    console.log('📝 Popunjavam formu:', data);
    
    const productInput = document.getElementById('productInput');
    if (productInput) {
        productInput.value = data.product_name || '';
        productInput.dispatchEvent(new Event('input', { bubbles: true }));
        productInput.dispatchEvent(new Event('change', { bubbles: true }));
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
            if (option.value === data.unit || option.text.toLowerCase().includes(data.unit)) {
                option.selected = true;
                unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }
    
    const storageSelect = document.getElementById('storageSelect');
    if (storageSelect && data.storage) {
        for (let option of storageSelect.options) {
            if (option.value === data.storage || option.text.includes(data.storage)) {
                option.selected = true;
                storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }
    
    if (typeof updateExpiryDate === 'function') {
        try {
            updateExpiryDate();
        } catch(e) {}
    }
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `✅ Uneto: ${data.product_name} (${data.quantity} ${data.unit}) - ${data.storage}`;
        statusEl.style.color = '#4CAF50';
    }
}

// ===== ČUVANJE PODATAKA =====
function sacuvajPodatke(data) {
    console.log('💾 Čuvam podatke:', data);
    
    let saved = false;
    
    if (typeof saveProduct === 'function') {
        try {
            saveProduct();
            saved = true;
            console.log('✅ saveProduct() pozvan');
        } catch(e) {
            console.warn('saveProduct greška:', e);
        }
    }
    
    if (!saved && typeof handleFormSubmit === 'function') {
        try {
            handleFormSubmit();
            saved = true;
            console.log('✅ handleFormSubmit() pozvan');
        } catch(e) {
            console.warn('handleFormSubmit greška:', e);
        }
    }
    
    if (!saved && typeof addProduct === 'function') {
        try {
            addProduct();
            saved = true;
            console.log('✅ addProduct() pozvan');
        } catch(e) {
            console.warn('addProduct greška:', e);
        }
    }
    
    if (!saved && typeof window.inventory !== 'undefined' && Array.isArray(window.inventory)) {
        const newItem = {
            id: Date.now(),
            productName: data.product_name,
            piece: parseInt(data.piece) || 1,
            quantity: parseFloat(data.quantity) || 1,
            unit: data.unit || 'kom',
            shelfLife: parseInt(data.shelf_life) || 12,
            storage: data.storage || 'Zamrzivač 1',
            dateAdded: new Date().toISOString(),
            expiryDate: new Date(Date.now() + parseInt(data.shelf_life || 12) * 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        window.inventory.push(newItem);
        console.log('✅ Dodat u inventory niz:', newItem);
        saved = true;
    }
    
    if (!saved) {
        const saveBtn = document.querySelector('#saveProductBtn, button[type="submit"], .btn-save, .save-btn');
        if (saveBtn) {
            try {
                saveBtn.click();
                saved = true;
                console.log('✅ Kliknuto dugme za čuvanje');
            } catch(e) {
                console.warn('Klik greška:', e);
            }
        }
    }
    
    if (saved) {
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = `✅ Sačuvano: ${data.product_name}`;
            statusEl.style.color = '#4CAF50';
        }
        console.log('✅ Podaci uspešno sačuvani!');
        
        setTimeout(() => {
            if (typeof renderInventory === 'function') renderInventory();
            if (typeof renderProductList === 'function') renderProductList();
            if (typeof renderEntries === 'function') renderEntries();
            if (typeof loadInventory === 'function') loadInventory();
        }, 100);
        
    } else {
        console.error('❌ Nije uspelo čuvanje podataka!');
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Greška pri čuvanju podataka!';
            statusEl.style.color = '#f44336';
        }
    }
}

// ===== GLOBALNE FUNKCIJE =====
window.processVoiceCommand = function(command) {
    if (!command) return false;
    hideVoiceMenu();
    return processAndSaveItem(command);
};

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.processStartCommand = processAndSaveItem;
window.popuniStartPodatke = popuniFormuPodacima;
window.otvoriZaliheEkran = otvoriZaliheEkran;
window.sacuvajPodatke = sacuvajPodatke;

console.log('✅ Voice Commands ISPRAVLJENA verzija učitana!');
console.log('🎤 "unos" → diktiraj → "plus" (samo završava unos) → "end" (otvara zalihe)');
