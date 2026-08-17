// ============================================
// VOICE COMMANDS - RADNA VERZIJA
// ============================================

let recognition = null;
let isListening = false;
let currentVoiceData = null;
let isDataEntryActive = false;

// ===== SAKRIVANJE VOICE MENIJA =====
function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
        console.log('🔇 Voice menu sakriven');
    }
}

// ===== GLAVNA FUNKCIJA =====
function processVoiceCommand(command) {
    console.log('🎤 processVoiceCommand prima:', command);
    
    if (!command || command.trim() === '') {
        console.log('❌ Prazna komanda');
        return false;
    }
    
    const cmd = command.toLowerCase().trim();
    console.log('📝 Normalizovana komanda:', cmd);
    
    hideVoiceMenu();
    
    // ===== START =====
    if (cmd === 'start' || cmd.includes('start')) {
        console.log('✅ Prepoznat START!');
        isDataEntryActive = true;
        currentVoiceData = null;
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '🎤 Slušam... Diktirajte podatke';
            statusEl.style.color = '#4CAF50';
        }
        
        showModernAlert('🎤', 'Slušam... Diktirajte podatke za unos', '🎤');
        return true;
    }
    
    // ===== PLUS - KRAJ TRENUTNOG UNOSA =====
    if (cmd === 'plus' || cmd.includes('plus')) {
        console.log('✅ Prepoznat PLUS!');
        
        if (currentVoiceData && currentVoiceData.product_name && currentVoiceData.product_name !== 'Nepoznat proizvod') {
            // Sačuvaj trenutni unos
            popuniPodatke(currentVoiceData);
            currentVoiceData = null;
            
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = '✅ Proizvod sačuvan. Diktirajte sledeći.';
                statusEl.style.color = '#4CAF50';
            }
            
            showModernAlert('✅', 'Proizvod sačuvan! Diktirajte sledeći.', '📦');
        } else {
            showModernAlert('⚠️', 'Nema podataka za čuvanje. Diktirajte prvo proizvod.', '⚠️');
        }
        return true;
    }
    
    // ===== END - KRAJ SVIH UNOSA =====
    if (cmd === 'end' || cmd.includes('end') || cmd.includes('kraj') || cmd.includes('stop')) {
        console.log('🛑 Prepoznat END - kraj svih unosa!');
        isDataEntryActive = false;
        
        // Sačuvaj poslednji unos ako postoji
        if (currentVoiceData && currentVoiceData.product_name && currentVoiceData.product_name !== 'Nepoznat proizvod') {
            popuniPodatke(currentVoiceData);
            currentVoiceData = null;
        }
        
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderInventory === 'function') {
                renderInventory();
            }
            
            // Označi nove unose svetlo plavom bojom
            setTimeout(function() {
                highlightNewEntries();
            }, 300);
            
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = '✅ Svi unosi završeni. Otvaram zalihe.';
                statusEl.style.color = '#4CAF50';
            }
            
            showModernAlert('✅', 'Svi unosi sačuvani! Otvaram zalihe.', '📋');
        }, 500);
        return true;
    }
    
    // ===== UNOS PODATAKA (ako je aktiviran START) =====
    if (isDataEntryActive) {
        console.log('📝 Obrada unosa podataka...');
        let data = parseVoiceDataEntry(command);
        
        if (data.product_name && data.product_name !== 'Nepoznat proizvod') {
            currentVoiceData = data;
            
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = `📦 ${data.product_name}, ${data.quantity} ${data.unit}`;
                statusEl.style.color = '#FFD700';
            }
            
            showModernAlert('📦', `Prepoznat: ${data.product_name}\nKoličina: ${data.quantity} ${data.unit}\nSkladište: ${data.storage}`, '✅');
        } else {
            showModernAlert('⚠️', 'Nije prepoznat proizvod. Pokušajte ponovo.', '⚠️');
        }
        return true;
    }
    
    // ===== MENI =====
    if (cmd.includes('meni') || cmd.includes('početna') || cmd.includes('menu') || cmd.includes('home')) {
        console.log('✅ Prepoznat MENI');
        isDataEntryActive = false;
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderCategories === 'function') {
                renderCategories();
            }
        }, 300);
        return true;
    }
    
    // ===== KATEGORIJE =====
    if (cmd.includes('kategorije') || cmd.includes('kategorija') || cmd.includes('categories') || cmd.includes('category')) {
        console.log('✅ Prepoznate KATEGORIJE');
        isDataEntryActive = false;
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderCategories === 'function') {
                renderCategories();
            }
        }, 300);
        return true;
    }
    
    // ===== AKO NIJE PREPOZNATA =====
    console.log('❌ Komanda nije prepoznata:', cmd);
    showModernAlert('Nepoznata komanda', '"' + command + '" nije prepoznato.\nReci "Start" za početak unosa.', '❓');
    return false;
}

// ===== PARSIRANJE =====
function parseVoiceDataEntry(command) {
    console.log('🔍 Parsiranje:', command);
    
    let text = command.toLowerCase().trim();
    
    const unitMap = {
        'kg': 'kg', 'kilogram': 'kg', 'kilograma': 'kg',
        'g': 'g', 'gram': 'g', 'grama': 'g',
        'l': 'l', 'litar': 'l', 'litara': 'l',
        'ml': 'ml', 'mililitar': 'ml', 'mililitara': 'ml',
        'kom': 'kom', 'komad': 'kom', 'komada': 'kom'
    };
    
    const storageMap = {
        'zamrzivač 2': 'Zamrzivač 2', 'zamrzivac 2': 'Zamrzivač 2',
        'zamrzivač 3': 'Zamrzivač 3', 'zamrzivac 3': 'Zamrzivač 3',
        'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
        'frižider': 'Frižider', 'frizider': 'Frižider',
        'ostava': 'Ostava'
    };
    
    const brojMap = {
        'jedan': '1', 'jedna': '1',
        'dva': '2',
        'tri': '3',
        'četiri': '4', 'cetiri': '4',
        'pet': '5',
        'šest': '6', 'sest': '6',
        'sedam': '7',
        'osam': '8',
        'devet': '9',
        'deset': '10'
    };
    
    for (let [key, value] of Object.entries(brojMap)) {
        text = text.replace(new RegExp('\\b' + key + '\\b', 'gi'), value);
    }
    
    let result = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    // Skladište
    for (let [key, value] of Object.entries(storageMap)) {
        if (text.includes(key)) {
            result.storage = value;
            text = text.replace(new RegExp(key, 'gi'), '').trim();
            break;
        }
    }
    
    // Jedinica + količina
    let foundUnit = false;
    for (let [key, value] of Object.entries(unitMap)) {
        let regex = new RegExp('(\\d+(?:[.,]\\d+)?)\\s*' + key, 'i');
        let match = text.match(regex);
        if (match) {
            result.quantity = match[1].replace(',', '.');
            result.piece = match[1];
            result.unit = value;
            text = text.replace(match[0], '').trim();
            foundUnit = true;
            break;
        }
    }
    
    // Brojevi
    let numbers = text.match(/\d+(?:[.,]\d+)?/g) || [];
    if (numbers.length >= 1 && !foundUnit) {
        result.quantity = numbers[0].replace(',', '.');
        result.piece = numbers[0];
    }
    if (numbers.length >= 2) {
        result.shelf_life = numbers[numbers.length - 1];
    }
    
    // Naziv
    let nameText = text.trim();
    const removeWords = ['kg', 'g', 'l', 'ml', 'kom', 'kilogram', 'gram', 'litar', 'mililitar', 'komad'];
    for (let word of removeWords) {
        nameText = nameText.replace(new RegExp('\\b' + word + '\\b', 'gi'), '');
    }
    result.product_name = nameText.trim() || 'Nepoznat proizvod';
    
    console.log('✅ Parsirano:', result);
    return result;
}

// ===== POPUNJAVANJE =====
function popuniPodatke(data) {
    console.log('📝 Popunjavam:', data);
    
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const unitSelect = document.getElementById('unitSelect');
    const storageSelect = document.getElementById('storageSelect');
    
    if (productInput) productInput.value = data.product_name;
    if (pieceInput) pieceInput.value = data.piece || '1';
    if (quantityInput) quantityInput.value = data.quantity || '1';
    if (shelfLifeInput) shelfLifeInput.value = data.shelf_life || '12';
    
    if (unitSelect && data.unit) {
        for (let option of unitSelect.options) {
            if (option.value === data.unit) {
                option.selected = true;
                break;
            }
        }
    }
    
    if (storageSelect && data.storage) {
        for (let option of storageSelect.options) {
            if (option.value === data.storage || option.text.includes(data.storage)) {
                option.selected = true;
                break;
            }
        }
    }
    
    if (typeof updateExpiryDate === 'function') {
        updateExpiryDate();
    }
    
    if (typeof prikaziSveUnose === 'function') {
        prikaziSveUnose();
    }
    
    // Automatski sačuvaj proizvod
    setTimeout(function() {
        if (typeof saveProduct === 'function') {
            saveProduct();
            console.log('💾 Proizvod sačuvan:', data.product_name);
        }
    }, 300);
}

// ===== OZNAČI NOVE UNOSE =====
function highlightNewEntries() {
    console.log('💡 Označavam nove unose...');
    
    // Pronađi sve unose u inventaru
    const inventoryItems = document.querySelectorAll('.inventory-item, .product-item, .stock-item');
    
    if (inventoryItems.length === 0) {
        console.log('⚠️ Nema pronađenih stavki u inventaru');
        return;
    }
    
    // Označi poslednjih nekoliko unosa (pretpostavljamo da su novi)
    const itemsToHighlight = Math.min(10, inventoryItems.length);
    const startIndex = inventoryItems.length - itemsToHighlight;
    
    for (let i = startIndex; i < inventoryItems.length; i++) {
        const item = inventoryItems[i];
        item.style.transition = 'background-color 0.5s ease';
        item.style.backgroundColor = '#E3F2FD'; // svetlo plava
        item.style.border = '2px solid #2196F3';
        item.style.borderRadius = '4px';
        item.style.padding = '8px';
        item.style.margin = '4px 0';
        
        // Dodaj labelu "NOVO"
        const label = document.createElement('span');
        label.textContent = '🆕 NOVO';
        label.style.backgroundColor = '#2196F3';
        label.style.color = 'white';
        label.style.padding = '2px 8px';
        label.style.borderRadius = '12px';
        label.style.fontSize = '10px';
        label.style.fontWeight = 'bold';
        label.style.marginLeft = '8px';
        label.style.display = 'inline-block';
        
        // Dodaj labelu na početak ili kraj item-a
        const existingLabel = item.querySelector('.new-label');
        if (!existingLabel) {
            label.className = 'new-label';
            item.appendChild(label);
        }
    }
    
    console.log(`✅ Označeno ${itemsToHighlight} novih unosa`);
}

// ===== MIKROFON =====
function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        showModernAlert('Greška', 'Vaš pretraživač ne podržava glasovne komande.', '❌');
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
    if (statusEl) {
        statusEl.textContent = '🎤 Slušam... Govorite komandu';
        statusEl.style.color = '#2196F3';
    }

    recognition.onstart = function() {
        console.log('🎤 Mikrofon aktivan');
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '🎤 Slušam...';
            statusEl.style.color = '#2196F3';
        }
    };

    recognition.onresult = function(event) {
        const result = event.results[event.results.length - 1];
        const speechResult = result[0].transcript.trim();
        
        if (speechResult && speechResult.length > 0) {
            console.log('🗣️ Prepoznato:', speechResult);
            
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = '🗣️ "' + speechResult + '"';
                statusEl.style.color = '#FFD700';
            }
            
            processVoiceCommand(speechResult);
        }
    };

    recognition.onerror = function(event) {
        console.error('⚠️ Greška:', event.error);
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Greška. Pokušajte ponovo.';
            statusEl.style.color = '#f44336';
        }
        if (event.error === 'not-allowed') {
            showModernAlert('Greška', 'Dozvolite pristup mikrofonu!', '🎤');
        }
    };

    recognition.onend = function() {
        console.log('🎤 Mikrofon zaustavljen');
        
        // Ponovo pokreni ako je data entry aktivan
        if (isDataEntryActive) {
            setTimeout(function() {
                if (recognition) {
                    try {
                        recognition.start();
                        console.log('🎤 Ponovo pokrenut automatski');
                    } catch(e) { 
                        console.log('⚠️ Već radi ili greška:', e); 
                    }
                }
            }, 500);
        }
    };
}

// ===== ZAUSTAVI =====
function stopVoiceRecognition() {
    if (recognition) {
        try {
            recognition.stop();
            recognition = null;
            console.log('🛑 Mikrofon zaustavljen');
        } catch(e) {}
    }
    isDataEntryActive = false;
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '⏸️ Zaustavljeno';
        statusEl.style.color = '#aaa';
    }
}

// ===== POVRATAK =====
function goBackFromVoice() {
    console.log('◀ Povratak');
    stopVoiceRecognition();
    showScreen('choiceScreen');
}

// ===== IZVOZ =====
window.processVoiceCommand = processVoiceCommand;
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.popuniPodatke = popuniPodatke;
window.highlightNewEntries = highlightNewEntries;

console.log('✅ Voice Commands učitan!');
