// ============================================
// VOICE COMMANDS - KOMPLETNA VERZIJA SA UNOSOM
// ============================================
console.log('🎤 voiceCommands.js je učitan!');

window.voiceCommandProcessing = false;

function getCurrentLang() {
    return window.currentLanguage || localStorage.getItem('appLanguage') || 'sr';
}

function cleanCmd(cmd) {
    if (!cmd) return '';
    return cmd.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
}

// ============================================
// RESETOVANJE ZAGLAVLJENE KOMANDE
// ============================================
function resetVoiceProcessing() {
    console.log('🔄 Resetovanje voiceCommandProcessing');
    window.voiceCommandProcessing = false;
    if (window.recognition) {
        try {
            window.recognition.stop();
            window.recognition = null;
        } catch(e) {}
    }
}
window.resetVoiceProcessing = resetVoiceProcessing;

// ============================================
// GLASOVNI UNOS PROIZVODA - PARSIRANJE
// ============================================

function parseVoiceInput(text) {
    console.log('🔍 Parsiranje glasovnog unosa:', text);
    
    const result = {
        product: '',
        piece: '1',
        quantity: 1,
        unit: 'kg',
        shelfLife: 12,
        storage: 'Ostava'
    };
    
    let cleanText = text;
    
    // Mapa za brojeve slovima
    const numberMap = {
        'jedan': '1', 'jedna': '1', 'jedno': '1',
        'dva': '2', 'dvije': '2', 'dve': '2',
        'tri': '3', 'četiri': '4', 'cetiri': '4',
        'pet': '5', 'šest': '6', 'sedam': '7',
        'osam': '8', 'devet': '9', 'deset': '10'
    };
    
    for (let [word, number] of Object.entries(numberMap)) {
        const regex = new RegExp('\\b' + word + '\\b', 'gi');
        cleanText = cleanText.replace(regex, number);
    }
    
    // 1. Pronađi mesto skladištenja
    const storageMap = {
        'zamrzivač1': 'Zamrzivač 1',
        'zamrzivač2': 'Zamrzivač 2',
        'zamrzivač3': 'Zamrzivač 3',
        'zamrzivač': 'Zamrzivač 1',
        'frižider': 'Frižider',
        'frizider': 'Frižider',
        'ostava': 'Ostava',
        'freezer1': 'Freezer 1',
        'freezer2': 'Freezer 2',
        'freezer3': 'Freezer 3',
        'freezer': 'Freezer 1',
        'refrigerator': 'Refrigerator',
        'pantry': 'Pantry'
    };
    
    for (let [key, value] of Object.entries(storageMap)) {
        if (cleanText.toLowerCase().includes(key)) {
            result.storage = value;
            cleanText = cleanText.replace(new RegExp(key, 'gi'), '');
            break;
        }
    }
    
    // 2. Pronađi KOMAD
    const piecePattern = /(\d+)\s*(komad|kom|pcs|piece)/i;
    const pieceMatch = cleanText.match(piecePattern);
    if (pieceMatch) {
        result.piece = pieceMatch[0].trim();
        cleanText = cleanText.replace(pieceMatch[0], '');
    }
    
    // 3. Pronađi KOLIČINU
    const unitPattern = /(\d+\.?\d*)\s*(kg|g|kom|l|ml|pak|kutija|kile|kilograma|kilogram)/i;
    const quantityMatch = cleanText.match(unitPattern);
    if (quantityMatch) {
        let unit = quantityMatch[2].toLowerCase();
        if (unit === 'kile' || unit === 'kilograma' || unit === 'kilogram') {
            unit = 'kg';
        }
        result.quantity = parseFloat(quantityMatch[1]);
        result.unit = unit;
        cleanText = cleanText.replace(quantityMatch[0], '');
    }
    
    // 4. Pronađi ROK
    const shelfPattern = /(\d+)\s*(meseci|mes|mesec|m|months|month)/i;
    const shelfMatch = cleanText.match(shelfPattern);
    if (shelfMatch) {
        result.shelfLife = parseInt(shelfMatch[1]);
        cleanText = cleanText.replace(shelfMatch[0], '');
    }
    
    // 5. Očisti naziv
    result.product = cleanText.replace(/\s*,\s*/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (result.quantity === 0) result.quantity = 1;
    if (!result.unit) result.unit = 'kom';
    
    console.log('✅ Parsirani podaci:', result);
    return result;
}

// ============================================
// POPUNJAVANJE EKRANA ZA UNOS
// ============================================

function fillDataEntryFields(parsed) {
    console.log('📝 Popunjavam polja:', parsed);
    
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const storageSelect = document.getElementById('storageSelect');
    const unitSelect = document.getElementById('unitSelect');
    
    if (productInput && parsed.product) {
        productInput.value = parsed.product;
        productInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (pieceInput && parsed.piece) {
        pieceInput.value = parsed.piece;
    }
    if (quantityInput && parsed.quantity) {
        quantityInput.value = parsed.quantity;
    }
    if (shelfLifeInput && parsed.shelfLife) {
        shelfLifeInput.value = parsed.shelfLife;
        shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (storageSelect && parsed.storage) {
        for (let option of storageSelect.options) {
            if (option.value === parsed.storage || option.text.includes(parsed.storage)) {
                storageSelect.value = option.value;
                break;
            }
        }
    }
    if (unitSelect && parsed.unit) {
        for (let option of unitSelect.options) {
            if (option.value === parsed.unit) {
                unitSelect.value = option.value;
                break;
            }
        }
    }
    
    if (typeof updateExpiryDate === 'function') {
        updateExpiryDate();
    }
}

// ============================================
// ČUVANJE I RESETOVANJE (na "plus")
// ============================================

function saveAndReset() {
    console.log('💾 Čuvanje i resetovanje');
    
    if (typeof saveProduct === 'function') {
        saveProduct();
    }
    
    setTimeout(function() {
        const pieceInput = document.getElementById('pieceInput');
        const quantityInput = document.getElementById('quantityInput');
        const shelfLifeInput = document.getElementById('shelfLifeInput');
        const descriptionInput = document.getElementById('descriptionInput');
        
        if (pieceInput) pieceInput.value = '';
        if (quantityInput) quantityInput.value = '';
        if (shelfLifeInput) shelfLifeInput.value = '';
        if (descriptionInput) descriptionInput.value = '';
        
        const productInput = document.getElementById('productInput');
        if (productInput) {
            productInput.focus();
            productInput.select();
        }
        
        if (typeof updateExpiryDate === 'function') {
            updateExpiryDate();
        }
    }, 100);
    
    const status = document.getElementById('voiceStatus');
    if (status) {
        status.innerText = '✅ Proizvod sačuvan! Nastavite unos';
        status.style.color = '#4CAF50';
    }
}

// ============================================
// ZAVRŠETAK UNOSA (na "OK")
// ============================================

let justSavedProducts = [];

function finishDataEntry() {
    console.log('✅ Završetak unosa');
    
    if (typeof saveProduct === 'function') {
        saveProduct();
    }
    
    setTimeout(function() {
        window.currentScreenState = 'inventory';
        forceHideVoiceMenu();
        
        if (typeof renderInventory === 'function') {
            renderInventory();
        }
        
        setTimeout(function() {
            highlightNewProducts();
        }, 200);
        
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.innerText = '✅ Unos završen! Pogledajte zalihe';
            status.style.color = '#4CAF50';
        }
    }, 300);
}

function highlightNewProducts() {
    console.log('🔵 Označavam nove proizvode');
    
    const rows = document.querySelectorAll('#inventoryTable .table-row:not(.header-row)');
    const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    const recentProducts = zalihe.slice(-5);
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('.cell');
        if (cells.length > 1) {
            const productName = cells[1]?.textContent || '';
            const isNew = recentProducts.some(p => p.product_name === productName);
            if (isNew) {
                row.style.background = '#BBDEFB';
                row.style.transition = 'background 0.5s';
                setTimeout(function() {
                    row.style.background = '';
                }, 5000);
            }
        }
    });
}

// ============================================
// GLAVNA VOICE COMMAND FUNKCIJA
// ============================================

function voiceCommand(command) {
    console.log('🎤 Primljena komanda:', command);
    console.log('📌 Trenutno stanje:', window.currentScreenState);
    
    // 🔥 PRVO RESETUJ AKO JE ZAGLAVLJENO
    if (window.voiceCommandProcessing) {
        console.log('⏳ Već se obrađuje komanda, resetujem...');
        window.voiceCommandProcessing = false;
    }
    
    window.voiceCommandProcessing = true;
    
    const cleanText = cleanCmd(command);
    const lang = getCurrentLang();
    const currentState = window.currentScreenState || '';

    function cleanup() {
        window.voiceCommandProcessing = false;
        if (window.recognition) {
            try {
                window.recognition.stop();
                window.recognition = null;
            } catch(e) {}
        }
        if (typeof window.stopVoiceRecognition === 'function') {
            window.stopVoiceRecognition();
        }
    }

    // ===== KOMANDE ZA EKRAN "UNOS PODATAKA" =====
    if (currentState === 'dataEntry') {
        // Prvo proveri da li je "end"
        if (cleanText.includes('end') || cleanText.includes('izlaz') || cleanText.includes('exit')) {
            console.log('🚪 Izlaz iz aplikacije');
            cleanup();
            if (typeof exitApp === 'function') exitApp();
            return true;
        }
        
        // Proveri "ok"
        if (cleanText === 'ok' || cleanText.includes('ok') || cleanText === 'okej') {
            console.log('✅ OK - završetak unosa');
            cleanup();
            finishDataEntry();
            return true;
        }
        
        // Proveri "plus"
        if (cleanText === 'plus' || cleanText.includes('plus')) {
            console.log('💾 Plus - čuvanje i resetovanje');
            cleanup();
            saveAndReset();
            return true;
        }
        
        // Proveri da li ima podataka za unos
        const hasQuantity = /\d+\s*(kg|g|kom|l|ml|pak|kutija|kile|kilograma)/i.test(command);
        const hasProductName = command.length > 3;
        
        if (hasQuantity && hasProductName) {
            console.log('📝 Popunjavam polja sa:', command);
            const parsed = parseVoiceInput(command);
            fillDataEntryFields(parsed);
            cleanup();
            const status = document.getElementById('voiceStatus');
            if (status) {
                status.innerText = `📝 ${parsed.product} (${parsed.quantity} ${parsed.unit})`;
                status.style.color = '#FFD700';
            }
            return true;
        }
        
        // Ako nije prepoznato na ekranu za unos
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.innerText = `❌ Nije prepoznato: "${command}"`;
            status.style.color = '#f44336';
        }
        cleanup();
        return false;
    }

    // ===== AUTOMATSKI UNOS NA ZALIHAMA =====
    const isOnInventory = currentState === 'inventory';
    
    if (isOnInventory) {
        const hasQuantity = /\d+\s*(kg|g|kom|l|ml|pak|kutija|kile|kilograma)/i.test(command);
        const hasPlus = command.toLowerCase().includes('plus');
        
        if (hasPlus || hasQuantity) {
            console.log('📝 Automatski unos na zalihama:', command);
            let cleanCommand = command.replace(/plus/gi, '').trim();
            if (cleanCommand.length < 2) {
                cleanCommand = command;
            }
            const result = voiceAddProduct(cleanCommand);
            cleanup();
            return result;
        }
    }

    // ===== KOMANDE ZA PRELAZAK =====
    let handled = false;

    // KOMANDA ZA UNOS
    const entryKeywords = ['unos', 'podaci', 'data', 'entry', 'unos podataka', 'novi unos', 'uno', 'un'];
    if (entryKeywords.some(k => cleanText === k || cleanText.includes(k))) {
        console.log('📝 Otvaranje ekrana za unos podataka');
        handled = true;
        
        // Resetuj processing
        window.voiceCommandProcessing = false;
        
        // Postavi stanje
        window.currentScreenState = 'dataEntry';
        
        // Otvori formu
        setTimeout(function() {
            if (typeof renderDataEntry === 'function') {
                renderDataEntry('');
            }
            const status = document.getElementById('voiceStatus');
            if (status) {
                status.innerText = '🎤 Govorite podatke za unos. "plus" za čuvanje, "OK" za kraj';
                status.style.color = '#FFD700';
            }
            
            // POKRENI KONTINUIRANO SLUŠANJE
            setTimeout(function() {
                console.log('🎤 Pokrećem kontinuirano slušanje za unos...');
                startContinuousListening();
            }, 300);
        }, 100);
        
        return true;
    }

    // KOMANDA ZA ZALIHE
    const invKeywords = ['zalihe', 'zaliha', 'stanje', 'inventory', 'inv', 'stock'];
    if (invKeywords.some(k => cleanText.includes(k))) {
        console.log('📦 Prelaz na zalihe');
        handled = true;
        cleanup();
        window.currentScreenState = 'inventory';
        forceHideVoiceMenu();
        setTimeout(function() {
            if (typeof renderInventory === 'function') renderInventory();
        }, 100);
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.innerText = '✅ Prelaz na zalihe';
            status.style.color = '#4CAF50';
        }
        return true;
    }

    // KOMANDA ZA SPISAK
    const shopKeywords = ['spisak', 'lista', 'shopping', 'shop', 'list'];
    if (shopKeywords.some(k => cleanText.includes(k))) {
        console.log('🛒 Prelaz na spisak');
        handled = true;
        cleanup();
        window.currentScreenState = 'shopping';
        forceHideVoiceMenu();
        setTimeout(function() {
            if (typeof renderShoppingList === 'function') renderShoppingList();
        }, 100);
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.innerText = '✅ Prelaz na spisak';
            status.style.color = '#4CAF50';
        }
        return true;
    }

    // KOMANDA ZA IZLAZ
    const exitKeywords = ['izlaz', 'zatvori', 'exit', 'quit', 'close', 'end'];
    if (exitKeywords.some(k => cleanText.includes(k))) {
        console.log('🚪 Izlaz iz aplikacije');
        handled = true;
        cleanup();
        forceHideVoiceMenu();
        document.querySelectorAll('.screen').forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });
        const login = document.getElementById('loginScreen');
        if (login) {
            login.style.display = 'flex';
            login.classList.add('active');
        }
        if (typeof exitApp === 'function') exitApp();
        return true;
    }

    // ===== UNOS SA "DODAJ" =====
    const addKeywords = {
        sr: ['dodaj', 'unesi', 'novi', 'proizvod', 'dodavanje', 'ubaci', 'stavi', 'doda', 'dodat', 'dodati'],
        en: ['add', 'new', 'create', 'insert', 'put'],
        de: ['hinzufügen', 'neu', 'erstellen', 'einfügen'],
        hu: ['hozzáad', 'új', 'létrehoz', 'beilleszt'],
        uk: ['додати', 'новий', 'створити', 'вставити'],
        ru: ['добавить', 'новый', 'создать', 'вставить']
    };
    
    const keywords = addKeywords[lang] || addKeywords.sr;
    let isAddCommand = false;
    let cleanTextForAdd = command;
    
    for (let kw of keywords) {
        if (cleanText.includes(kw)) {
            isAddCommand = true;
            const regex = new RegExp(kw, 'gi');
            cleanTextForAdd = cleanTextForAdd.replace(regex, '');
            break;
        }
    }
    
    if (isAddCommand && cleanTextForAdd.trim().length > 2) {
        console.log('📝 Prepoznat unos:', cleanTextForAdd.trim());
        handled = true;
        const result = voiceAddProduct(cleanTextForAdd.trim());
        cleanup();
        forceHideVoiceMenu();
        return result;
    }

    if (!handled) {
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.innerText = `❌ Nije prepoznato: "${command}"`;
            status.style.color = '#f44336';
        }
    }
    
    cleanup();
    return handled;
}

// ============================================
// KONTINUIRANO SLUŠANJE
// ============================================

let continuousListening = false;
let recognitionInstance = null;

function startContinuousListening() {
    if (continuousListening) {
        console.log('⚠️ Kontinuirano slušanje je već aktivno');
        return;
    }
    
    continuousListening = true;
    console.log('🔄 Pokrećem kontinuirano slušanje...');
    
    // Zaustavi postojeće prepoznavanje
    if (window.recognition) {
        try {
            window.recognition.stop();
        } catch(e) {}
        window.recognition = null;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.error('❌ Speech Recognition nije podržan');
        return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = getCurrentLang() || 'sr-RS';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onresult = function(event) {
        // Resetuj processing pre svake komande
        window.voiceCommandProcessing = false;
        
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        console.log('🗣️ Prepoznato (kontinuirano):', transcript);
        
        // Procesiraj komandu
        if (typeof window.voiceCommand === 'function') {
            window.voiceCommand(transcript);
        }
    };
    
    recognition.onerror = function(event) {
        console.log('⚠️ Greška prepoznavanja:', event.error);
        window.voiceCommandProcessing = false;
        if (event.error === 'not-allowed') {
            console.error('❌ Nema dozvole za mikrofon');
            continuousListening = false;
        }
    };
    
    recognition.onend = function() {
        console.log('🔄 Prepoznavanje završeno');
        window.voiceCommandProcessing = false;
        
        // Ako je i dalje dataEntry, restartuj
        if (window.currentScreenState === 'dataEntry' && continuousListening) {
            setTimeout(function() {
                try {
                    recognition.start();
                    console.log('🔄 Restartovanje slušanja...');
                } catch(e) {
                    console.log('⚠️ Greška pri restartu:', e);
                    continuousListening = false;
                }
            }, 200);
        } else {
            continuousListening = false;
        }
    };
    
    try {
        recognition.start();
        window.recognition = recognition;
        recognitionInstance = recognition;
        console.log('✅ Kontinuirano slušanje aktivirano');
    } catch(e) {
        console.log('⚠️ Greška pri startovanju:', e);
        continuousListening = false;
        window.voiceCommandProcessing = false;
    }
}

function stopContinuousListening() {
    console.log('🛑 Zaustavljanje kontinuiranog slušanja');
    continuousListening = false;
    if (window.recognition) {
        try {
            window.recognition.stop();
        } catch(e) {}
        window.recognition = null;
    }
    recognitionInstance = null;
    window.voiceCommandProcessing = false;
}

// Izvezi funkcije
window.startContinuousListening = startContinuousListening;
window.stopContinuousListening = stopContinuousListening;

// ============================================
// POMOĆNE FUNKCIJE
// ============================================

function forceHideVoiceMenu() {
    console.log('🔇 Prisilno sakrivanje voice menu-a');
    // Zaustavi kontinuirano slušanje
    stopContinuousListening();
    
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
        voiceMenu.classList.remove('show');
    }
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    setTimeout(() => {
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
    }, 50);
}

function goBackFromVoice() {
    console.log('◀ Povratak sa voice menija');
    stopContinuousListening();
    
    if (typeof window.stopVoiceRecognition === 'function') {
        window.stopVoiceRecognition();
    }
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
    }
    const choiceScreen = document.getElementById('choiceScreen');
    if (choiceScreen) {
        choiceScreen.style.display = 'flex';
        choiceScreen.classList.add('active');
    }
}

// ============================================
// GLAVNA FUNKCIJA ZA GLASOVNI UNOS
// ============================================

function voiceAddProduct(text) {
    console.log('🎤 Glasovni unos proizvoda:', text);
    const parsed = parseVoiceInput(text);
    if (!parsed.product || parsed.product.length < 2) {
        if (typeof showModernAlert === 'function') {
            showModernAlert('Greška', 'Nisam prepoznao naziv proizvoda.', '❌');
        }
        return false;
    }
    const today = new Date().toISOString().split('T')[0];
    const productData = {
        id: Date.now(),
        product_name: parsed.product,
        description: '(glasovni unos)',
        piece: parsed.piece || '1',
        quantity: parsed.quantity,
        unit: parsed.unit || 'kom',
        entry_date: today,
        shelf_life_months: parsed.shelfLife || 12,
        storage_location: parsed.storage || 'Ostava',
        voice_input: true
    };
    let zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    zalihe.push(productData);
    localStorage.setItem('zalihe', JSON.stringify(zalihe));
    const msg = `${parsed.product} (${parsed.piece || '1'}, ${parsed.quantity} ${parsed.unit}, rok: ${parsed.shelfLife} meseci)`;
    if (typeof showModernAlert === 'function') {
        showModernAlert('✅ Uspešno dodato', msg, '✅');
    }
    if (typeof renderInventory === 'function') {
        setTimeout(function() { renderInventory(); }, 300);
    }
    return true;
}

// ============================================
// AUTO-RESET ZA ZAGLAVLJENE KOMANDE
// ============================================

// Periodično resetovanje svakih 5 sekundi
setInterval(function() {
    if (window.voiceCommandProcessing) {
        console.log('🔄 Periodično resetovanje voiceCommandProcessing');
        window.voiceCommandProcessing = false;
    }
}, 5000);

// Resetovanje na svaki klik
document.addEventListener('click', function() {
    if (window.voiceCommandProcessing) {
        console.log('🔄 Resetovanje na klik');
        window.voiceCommandProcessing = false;
    }
});

console.log('✅ Auto-reset za voiceCommandProcessing aktiviran!');

// ============================================
// IZVOZ
// ============================================
window.voiceCommand = voiceCommand;
window.goBackFromVoice = goBackFromVoice;
window.forceHideVoiceMenu = forceHideVoiceMenu;
window.voiceAddProduct = voiceAddProduct;
window.parseVoiceInput = parseVoiceInput;
window.fillDataEntryFields = fillDataEntryFields;
window.saveAndReset = saveAndReset;
window.finishDataEntry = finishDataEntry;

console.log('✅ voiceCommands.js je uspešno inicijalizovan i spreman!');
console.log('📝 Reci "unos" za unos podataka');
console.log('📝 Reci "plus" za čuvanje i nastavak');
console.log('📝 Reci "OK" za završetak unosa');
console.log('📝 Reci "End" za izlaz');
