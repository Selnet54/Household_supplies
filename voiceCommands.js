// ============================================
// VOICE COMMANDS - GLASOVNE KOMANDE - RADNA VERZIJA
// KORISTI POSTOJEĆI DATA ENTRY EKRAN
// ============================================

let recognition = null;
let fullSpeechResult = '';
let speechTimeout = null;
let isProcessing = false;
let isListening = false;
let voiceProducts = [];

// ===== POMOĆNA FUNKCIJA ZA SAKRIVANJE VOICE MENIJA =====
function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
        console.log('🔇 Voice menu sakriven');
    }
}

// ===== OTVORI DATA ENTRY EKRAN =====
function openDataEntryScreen() {
    console.log('📂 Otvaram Data Entry ekran');
    
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    
    // Sakrij voice menu
    hideVoiceMenu();
    
    // Otvori data entry
    if (typeof renderDataEntry === 'function') {
        renderDataEntry('');
    } else if (typeof window.renderDataEntry === 'function') {
        window.renderDataEntry('');
    }
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎤 Recite "Start" pa diktirajte podatke';
        statusEl.style.color = '#4CAF50';
    }
    
    setTimeout(() => {
        const productInput = document.getElementById('productInput');
        if (productInput) productInput.focus();
    }, 300);
    
    if (!isListening) {
        startVoiceRecognition();
    }
}

// ===== PARSIRANJE GLASOVNOG UNOSA =====
function parseVoiceDataEntry(command) {
    console.log('🔍 Parsiranje glasovnog unosa:', command);
    
    let text = command.replace(/^start\s*/i, '').trim();
    text = text.replace(/\bplus\b/gi, '').trim();
    text = text.replace(/\bpa\b/gi, '').trim();
    text = text.replace(/\bi\b/gi, '').trim();
    text = text.replace(/\s+/g, ' ').trim();
    
    console.log('📝 Tekst za parsiranje:', text);
    
    let result = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    // ===== 1. PRONAĐI KOLIČINU I JEDINICU =====
    const unitPatterns = [
        { regex: /(\d+)\s*(?:kg|kilogram|kilograma)/i, unit: 'kg' },
        { regex: /(\d+)\s*(?:g|gram|grama)/i, unit: 'g' },
        { regex: /(\d+)\s*(?:l|lit|litra|litara)/i, unit: 'l' },
        { regex: /(\d+)\s*(?:ml|mililitar|mililitara)/i, unit: 'ml' },
        { regex: /(\d+)\s*(?:komad|kom|parče|parčeta)/i, unit: 'kom' },
        { regex: /(\d+)\s*(?:kom)/i, unit: 'kom' },
    ];
    
    let foundQuantity = false;
    for (const p of unitPatterns) {
        const match = text.match(p.regex);
        if (match) {
            result.quantity = match[1];
            result.piece = match[1];
            result.unit = p.unit;
            foundQuantity = true;
            console.log(`✅ Količina: ${result.quantity} ${result.unit}`);
            text = text.replace(match[0], '').trim();
            break;
        }
    }
    
    if (!foundQuantity) {
        const numMatch = text.match(/(\d+)/);
        if (numMatch) {
            result.quantity = numMatch[1];
            result.piece = numMatch[1];
            result.unit = 'kom';
            console.log(`✅ Broj: ${result.quantity} (kom)`);
            text = text.replace(numMatch[0], '').trim();
        }
    }
    
    // ===== 2. PRONAĐI ROK TRAJANJA =====
    const rokPatterns = [
        /rok\s*(\d+)/i,
        /(\d+)\s*(?:mesec|meseci|m)/i,
        /(\d+)\s*(?:m|mes)/i
    ];
    
    for (const pattern of rokPatterns) {
        const match = text.match(pattern);
        if (match) {
            result.shelf_life = match[1];
            console.log(`✅ Rok: ${result.shelf_life} meseci`);
            text = text.replace(match[0], '').trim();
            break;
        }
    }
    
    // ===== 3. PRONAĐI SKLADIŠTE =====
    const storageMap = {
        'zamrzivač 1': 'Zamrzivač 1',
        'zamrzivac 1': 'Zamrzivač 1',
        'zamrzivač 2': 'Zamrzivač 2',
        'zamrzivac 2': 'Zamrzivač 2',
        'zamrzivač 3': 'Zamrzivač 3',
        'zamrzivac 3': 'Zamrzivač 3',
        'zamrzivač': 'Zamrzivač 1',
        'zamrzivac': 'Zamrzivač 1',
        'frižider': 'Frižider',
        'frizider': 'Frižider',
        'hladnjak': 'Frižider',
        'ostava': 'Ostava',
        'špajz': 'Ostava',
        'soba': 'Soba',
        'podrum': 'Podrum'
    };
    
    for (const [key, value] of Object.entries(storageMap)) {
        if (text.toLowerCase().includes(key)) {
            result.storage = value;
            console.log(`✅ Skladište: ${result.storage}`);
            text = text.replace(new RegExp(key, 'gi'), '').trim();
            break;
        }
    }
    
    // ===== 4. IZDVOJI NAZIV =====
    const removeWords = ['kg', 'kilogram', 'gram', 'litar', 'litra', 'ml', 'komad', 'parče', 
                         'rok', 'mesec', 'meseci', 'kom', 'm'];
    removeWords.forEach(word => {
        text = text.replace(new RegExp('\\b' + word + '\\b', 'gi'), '');
    });
    
    let productName = text.replace(/\s+/g, ' ').trim();
    
    if (productName && productName.length > 0) {
        result.product_name = productName;
    } else {
        let original = command.replace(/^start\s*/i, '').trim();
        original = original.replace(/\d+\s*(?:kg|kilogram|g|gram|l|litra|ml|komad|kom|parče)/gi, '');
        original = original.replace(/\b\d+\b/g, '');
        original = original.replace(/\b(rok|mesec|meseci|m|plus|pa|i)\b/gi, '');
        for (const key of Object.keys(storageMap)) {
            original = original.replace(new RegExp(key, 'gi'), '');
        }
        result.product_name = original.replace(/\s+/g, ' ').trim();
    }
    
    if (!result.product_name) {
        const words = command.replace(/^start\s*/i, '').split(/\s+/);
        if (words.length > 0) {
            result.product_name = words[0];
        }
    }
    
    console.log('✅ Parsirani rezultat:', result);
    return result;
}

// ===== OBRADA "START" KOMANDE =====
function processStartCommand(command) {
    console.log('🚀 Start komanda:', command);
    
    if (isProcessing) {
        console.log('⏳ Već obrađujem...');
        return false;
    }
    
    isProcessing = true;
    
    const data = parseVoiceDataEntry(command);
    
    if (!data.product_name || data.product_name.length < 2) {
        showModernAlert('Greška', 'Nije prepoznat naziv proizvoda!', '❌');
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Nije prepoznat naziv. Pokušajte: "Start gril pile 2kg"';
            statusEl.style.color = '#f44336';
        }
        isProcessing = false;
        return false;
    }
    
    // Otvori Data Entry ako nije otvoren
    const productInput = document.getElementById('productInput');
    const dataEntryScreen = document.getElementById('dataEntryScreen');
    
    if (!productInput || !dataEntryScreen || dataEntryScreen.style.display === 'none') {
        console.log('📂 Otvaram Data Entry...');
        openDataEntryScreen();
        setTimeout(function() {
            popuniStartPodatke(data);
        }, 600);
    } else {
        console.log('📝 Data Entry je otvoren, popunjavam...');
        popuniStartPodatke(data);
    }
    
    return true;
}

// ===== POPUNI PODATKE =====
function popuniStartPodatke(data) {
    console.log('📝 Popunjavam polja sa:', data);
    
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const unitSelect = document.getElementById('unitSelect');
    const storageSelect = document.getElementById('storageSelect');
    
    if (productInput) productInput.value = data.product_name;
    if (pieceInput) pieceInput.value = data.piece || '1';
    if (quantityInput) quantityInput.value = data.quantity || data.piece || '1';
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
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `✅ Popunjeno: ${data.product_name}, ${data.quantity} ${data.unit}`;
        statusEl.style.color = '#4CAF50';
    }
    
    // Sačuvaj proizvod
    setTimeout(function() {
        if (typeof saveProduct === 'function') {
            // Sačuvaj u recent entries za označavanje
            const recent = JSON.parse(localStorage.getItem('recentVoiceEntries') || '[]');
            recent.push({
                product_name: data.product_name,
                timestamp: new Date().toISOString()
            });
            if (recent.length > 20) recent.shift();
            localStorage.setItem('recentVoiceEntries', JSON.stringify(recent));
            
            saveProduct();
            
            showModernAlert('✅ Uspešno', `Dodato: ${data.product_name}`, '🎤');
            
            if (statusEl) {
                statusEl.textContent = '🎤 Recite "Start" za novi unos, ili "End" za kraj';
                statusEl.style.color = '#FFD700';
            }
            
            // Očisti polja za sledeći unos
            setTimeout(() => {
                if (productInput) {
                    productInput.value = '';
                    productInput.focus();
                }
                if (pieceInput) pieceInput.value = '1';
                if (quantityInput) quantityInput.value = '1';
                if (shelfLifeInput) shelfLifeInput.value = '12';
            }, 500);
        }
        isProcessing = false;
    }, 1000);
}

// ===== OBRADA "END" KOMANDE =====
function processEndCommand() {
    console.log('🏁 End komanda - završavam unos');
    
    showModernAlert('✅ Završeno', 'Svi unosi su sačuvani!', '📦');
    
    // Osveži inventar
    setTimeout(() => {
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        if (typeof loadProductsFromStorage === 'function') {
            loadProductsFromStorage();
        }
        if (typeof renderInventory === 'function') {
            renderInventory();
        }
        setTimeout(() => {
            oznaciNoveUnose();
        }, 300);
    }, 500);
}

// ===== OZNAČI NOVE UNOSE =====
function oznaciNoveUnose() {
    console.log('🔵 Označavam nove unose');
    
    const inventoryRows = document.querySelectorAll('#inventoryTable tbody tr');
    if (!inventoryRows.length) return;
    
    const recentProducts = JSON.parse(localStorage.getItem('recentVoiceEntries') || '[]');
    const recentNames = recentProducts.map(p => p.product_name);
    
    inventoryRows.forEach((row) => {
        row.classList.remove('new-entry', 'voice-new-entry');
        row.style.backgroundColor = '';
        row.style.borderLeft = '';
        
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
            const productName = cells[0]?.textContent?.trim() || '';
            if (recentNames.includes(productName)) {
                row.classList.add('new-entry', 'voice-new-entry');
                row.style.backgroundColor = '#e3f2fd';
                row.style.borderLeft = '4px solid #2196F3';
            }
        }
    });
}

// ===== GLAVNA FUNKCIJA ZA OBRADU KOMANDI =====
function processVoiceCommand(command) {
    console.log('🎤 Prima:', command);
    
    if (!command || command.trim() === '') {
        return false;
    }
    
    if (isProcessing) {
        console.log('⏳ Ignorišem, već obrađujem');
        return false;
    }
    
    const cmd = command.toLowerCase().trim();
    console.log('📝 Normalizovano:', cmd);
    
    hideVoiceMenu();
    
    // ===== START =====
    if (cmd.includes('start') || cmd.includes('stat') || cmd.includes('stard')) {
        console.log('🚀 START!');
        processStartCommand(command);
        return true;
    }
    
    // ===== END =====
    if (cmd.includes('end') || cmd.includes('kraj') || cmd.includes('gotovo') || 
        cmd.includes('stop') || cmd.includes('završi') || cmd.includes('done')) {
        console.log('🏁 END!');
        processEndCommand();
        return true;
    }
    
    // ===== UNOS PODATAKA =====
    const dataEntryKeywords = [
        'unos', 'unesi', 'dodaj', 'novi', 'podatak', 'unos podataka',
        'add', 'product', 'entry', 'data', 'new', 'insert', 'create'
    ];
    if (dataEntryKeywords.some(k => cmd.includes(k))) {
        console.log('✅ UNOS PODATAKA');
        openDataEntryScreen();
        return true;
    }
    
    // ===== ZALIHE =====
    const inventoryKeywords = [
        'stanje', 'zalihe', 'inventar',
        'inventory', 'stock', 'supplies'
    ];
    if (inventoryKeywords.some(k => cmd.includes(k))) {
        console.log('✅ ZALIHE');
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderInventory === 'function') {
                renderInventory();
            }
        }, 300);
        return true;
    }

    // ===== SPISAK =====
    const shoppingKeywords = [
        'spisak', 'kupovina', 'potrebe', 'lista',
        'shopping', 'list', 'shopping list'
    ];
    if (shoppingKeywords.some(k => cmd.includes(k))) {
        console.log('✅ SPISAK');
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderShoppingList === 'function') {
                renderShoppingList();
            }
        }, 300);
        return true;
    }

    // ===== NAZAD =====
    const backKeywords = [
        'nazad', 'vrati', 'odustani', 'otkaži', 'vrati se',
        'back', 'cancel', 'go back', 'return', 'exit'
    ];
    if (backKeywords.some(k => cmd.includes(k))) {
        console.log('✅ NAZAD');
        setTimeout(function() {
            if (typeof handleBackAction === 'function') {
                handleBackAction();
            } else if (typeof goBackFromVoice === 'function') {
                goBackFromVoice();
            } else {
                const choiceScreen = document.getElementById('choiceScreen');
                if (choiceScreen) {
                    document.querySelectorAll('.screen').forEach(s => {
                        s.style.display = 'none';
                        s.classList.remove('active');
                    });
                    choiceScreen.style.display = 'flex';
                    choiceScreen.classList.add('active');
                }
            }
        }, 300);
        return true;
    }

    // ===== MENI =====
    const menuKeywords = [
        'meni', 'početna', 'glavni', 'početak', 'home',
        'menu', 'home', 'main', 'start'
    ];
    if (menuKeywords.some(k => cmd.includes(k))) {
        console.log('✅ MENI');
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
    const categoryKeywords = [
        'kategorije', 'kategorija',
        'categories', 'category'
    ];
    if (categoryKeywords.some(k => cmd.includes(k))) {
        console.log('✅ KATEGORIJE');
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

    // ===== PROVERI KATEGORIJU =====
    if (typeof getMainCategories === 'function') {
        const catList = getMainCategories();
        let matchedCategory = null;
        catList.forEach(cat => {
            if (cmd.includes(cat.toLowerCase())) {
                matchedCategory = cat;
            }
        });

        if (matchedCategory) {
            console.log('✅ Kategorija:', matchedCategory);
            setTimeout(function() {
                const mainScreen = document.getElementById('mainScreen');
                if (mainScreen) {
                    mainScreen.style.display = 'flex';
                    mainScreen.classList.add('active');
                }
                if (typeof renderSubcategories === 'function') {
                    renderSubcategories(matchedCategory);
                }
            }, 300);
            return true;
        }
    }

    console.log('❌ Nepoznato:', cmd);
    showModernAlert('Nepoznata komanda', `"${command}" nije prepoznato.`, '❓');
    return false;
}

// ===== POKRETAČ MIKROFONA =====
function startVoiceRecognition() {
    if (isListening) {
        console.log('🎤 Već slušam');
        return;
    }
    
    fullSpeechResult = '';
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        speechTimeout = null;
    }
    
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
        statusEl.textContent = '🎤 Slušam...';
        statusEl.style.color = '#2196F3';
    }

    recognition.onstart = function() {
        console.log('🎤 Mikrofon uključen');
        isListening = true;
        fullSpeechResult = '';
    };

    recognition.onresult = function(event) {
        let fullText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
                fullText += result[0].transcript + ' ';
                console.log(`✅ Reč: "${result[0].transcript}"`);
            }
        }
        
        const speechResult = fullText.trim();
        if (!speechResult) return;
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = `🗣️ "${speechResult}"`;
            statusEl.style.color = '#FFD700';
        }
        
        if (speechResult && speechResult.length > 0 && !isProcessing) {
            processVoiceCommand(speechResult);
        }
    };

    recognition.onerror = function(event) {
        console.error('⚠️ Greška:', event.error);
        isListening = false;
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
        console.log('🎤 Mikrofon isključen');
        isListening = false;
    };

    try {
        recognition.start();
        isListening = true;
        console.log('🎤 Slušam...');
    } catch(e) {
        console.error('❌ Greška:', e);
        isListening = false;
    }
}

// ===== ZAUSTAVI MIKROFON =====
function stopVoiceRecognition() {
    isListening = false;
    isProcessing = false;
    fullSpeechResult = '';
    
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        speechTimeout = null;
    }
    
    if (recognition) {
        try {
            recognition.stop();
            recognition = null;
            console.log('🛑 Mikrofon zaustavljen');
        } catch(e) {}
    }
    
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

// ===== MODERN ALERT =====
function showModernAlert(title, message, icon = 'ℹ️') {
    const existing = document.querySelector('.modern-alert-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'modern-alert-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
        backdrop-filter: blur(5px);
    `;
    
    const box = document.createElement('div');
    box.style.cssText = `
        background: #8B0000;
        border-radius: 24px;
        padding: 40px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        border: 3px solid #FFD700;
        color: #FFD700;
        animation: slideIn 0.3s ease;
    `;
    
    box.innerHTML = `
        <div style="font-size:64px; margin-bottom:15px;">${icon}</div>
        <h2 style="color:#FFD700; margin-bottom:10px; font-size:28px;">${title}</h2>
        <p style="color:#FFD700; font-size:18px; margin-bottom:25px;">${message}</p>
        <button onclick="this.closest('.modern-alert-overlay').remove()" style="
            background: #2E7D32;
            color: #FFD700;
            border: none;
            padding: 12px 40px;
            border-radius: 12px;
            font-size: 18px;
            cursor: pointer;
            font-weight: bold;
        ">OK</button>
    `;
    
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

// ===== DODAJ STILOVE =====
function addVoiceStyles() {
    if (document.getElementById('voiceStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'voiceStyles';
    style.textContent = `
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-50px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes highlightNew {
            0% { background-color: #e3f2fd; }
            50% { background-color: #bbdefb; }
            100% { background-color: #e3f2fd; }
        }
        .new-entry {
            animation: highlightNew 2s ease 3;
            border-left: 4px solid #2196F3 !important;
        }
        .voice-new-entry td:first-child::before {
            content: "🎤 ";
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);
}

// ===== IZVEZI FUNKCIJE =====
window.processVoiceCommand = processVoiceCommand;
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.processStartCommand = processStartCommand;
window.popuniStartPodatke = popuniStartPodatke;
window.processEndCommand = processEndCommand;
window.openDataEntryScreen = openDataEntryScreen;

// ===== INICIJALIZACIJA =====
addVoiceStyles();
console.log('✅ Voice Commands učitan - KORISTI POSTOJEĆI DATA ENTRY!');
console.log('📖 Primeri:');
console.log('   "Unos" - otvara Data Entry');
console.log('   "Start gril pile 2kg 6 zamrzivač" - dodaje proizvod');
console.log('   "End" - završava unos i prikazuje zalihe');
