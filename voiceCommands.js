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
    
    hideVoiceMenu();
    
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
function parseVoiceDataEntry(text) {
    console.log('🔍 Parsiram glasovni unos:', text);
    
    if (!text || text.trim().length === 0) {
        return null;
    }
    
    let result = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        storage: 'Ostava',
        shelf_life: '12'
    };
    
    let words = text.toLowerCase().trim().split(/\s+/);
    const commandWords = ['start', 'unos', 'dodaj', 'dodavanje', 'plus', 'novi', 'novo'];
    
    while (words.length > 0 && commandWords.includes(words[0])) {
        words.shift();
    }
    
    if (words.length === 0) return null;
    
    // Pronađi skladište
    const storageKeywords = [
        { keywords: ['zamrzivač 2', 'zamrzivac 2'], value: 'Zamrzivač 2' },
        { keywords: ['zamrzivač 3', 'zamrzivac 3'], value: 'Zamrzivač 3' },
        { keywords: ['zamrzivač', 'zamrzivac'], value: 'Zamrzivač 1' },
        { keywords: ['frižider', 'frizider', 'hladnjak'], value: 'Frižider' },
        { keywords: ['ostava', 'špajz', 'spajz'], value: 'Ostava' },
        { keywords: ['soba'], value: 'Soba' },
        { keywords: ['podrum'], value: 'Podrum' }
    ];
    
    for (let i = 0; i < words.length; i++) {
        for (const storage of storageKeywords) {
            if (storage.keywords.some(k => words[i].includes(k))) {
                result.storage = storage.value;
                words.splice(i, 1);
                i--;
                break;
            }
        }
    }
    
    // Pronađi količinu i jedinicu
    let quantityFound = false;
    for (let i = 0; i < words.length; i++) {
        const num = parseFloat(words[i].replace(',', '.'));
        if (!isNaN(num) && num > 0) {
            result.quantity = num.toString();
            quantityFound = true;
            if (i + 1 < words.length) {
                const unit = normalizeUnit(words[i + 1]);
                if (unit !== 'kom') {
                    result.unit = unit;
                    words.splice(i, 2);
                    i--;
                    continue;
                }
            }
            words.splice(i, 1);
            i--;
        }
    }
    
    if (!quantityFound) result.quantity = '1';
    
    result.product_name = words.join(' ').trim();
    if (!result.product_name) return null;
    
    console.log('📦 Parsirani podaci:', result);
    return result;
}

// ===== NORMALIZACIJA JEDINICA =====
function normalizeUnit(unit) {
    unit = unit.toLowerCase().trim();
    if (unit.includes('kg') || unit.includes('kilogram')) return 'kg';
    if (unit.includes('gram') || unit === 'g') return 'g';
    if (unit.includes('ml')) return 'ml';
    if (unit === 'l' || unit.includes('litar') || unit.includes('litara')) return 'l';
    if (unit.includes('kom') || unit.includes('komad')) return 'kom';
    return 'kom';
}

// ===== NORMALIZACIJA SKLADIŠTA =====
function normalizeStorage(storage) {
    storage = storage.toLowerCase().trim();
    if (storage.includes('zamrzivač 2') || storage.includes('zamrzivac 2')) return 'Zamrzivač 2';
    if (storage.includes('zamrzivač 3') || storage.includes('zamrzivac 3')) return 'Zamrzivač 3';
    if (storage.includes('zamrzivač') || storage.includes('zamrzivac')) return 'Zamrzivač 1';
    if (storage.includes('frižider') || storage.includes('frizider') || storage.includes('hladnjak')) return 'Frižider';
    if (storage.includes('ostava') || storage.includes('špajz') || storage.includes('spajz')) return 'Ostava';
    if (storage.includes('soba')) return 'Soba';
    if (storage.includes('podrum')) return 'Podrum';
    return storage;
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
    
    if (productInput) productInput.value = data.product_name || '';
    if (pieceInput) pieceInput.value = data.piece || '1';
    if (quantityInput) quantityInput.value = data.quantity || '1';
    if (shelfLifeInput) shelfLifeInput.value = data.shelf_life || '12';
    
    if (unitSelect && data.unit) {
        for (let option of unitSelect.options) {
            if (option.value === data.unit || 
                option.text.trim().toLowerCase() === data.unit.trim().toLowerCase()) {
                option.selected = true;
                break;
            }
        }
    }
    
    if (storageSelect && data.storage) {
        for (let option of storageSelect.options) {
            const value = (option.value || '').trim().toLowerCase();
            const text = (option.text || '').trim().toLowerCase();
            const wanted = data.storage.trim().toLowerCase();
            if (value === wanted || text === wanted || value.includes(wanted) || text.includes(wanted)) {
                option.selected = true;
                break;
            }
        }
    }
    
    if (typeof updateExpiryDate === 'function') updateExpiryDate();
    if (typeof prikaziSveUnose === 'function') prikaziSveUnose();
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `✅ Popunjeno: ${data.product_name}, ${data.quantity} ${data.unit}`;
        statusEl.style.color = '#4CAF50';
    }
    
    const recent = JSON.parse(localStorage.getItem('recentVoiceEntries') || '[]');
    recent.push({ product_name: data.product_name, timestamp: new Date().toISOString() });
    if (recent.length > 50) recent.shift();
    localStorage.setItem('recentVoiceEntries', JSON.stringify(recent));
    
    setTimeout(function() {
        if (typeof saveProduct === 'function') {
            saveProduct();
            showModernAlert('✅ Uspešno', `Dodato: ${data.product_name}`, '🎤');
            
            if (statusEl) {
                statusEl.textContent = '🎤 Recite "Plus" za sledeći unos, ili "End" za kraj';
                statusEl.style.color = '#FFD700';
            }
            
            setTimeout(() => {
                if (productInput) { productInput.value = ''; productInput.focus(); }
                if (pieceInput) pieceInput.value = '1';
                if (quantityInput) quantityInput.value = '1';
                if (shelfLifeInput) shelfLifeInput.value = '12';
            }, 500);
        } else {
            console.error('❌ saveProduct() ne postoji!');
        }
        isProcessing = false;
    }, 1000);
}

// ===== OBRADA "END" KOMANDE =====
function processEndCommand() {
    console.log('🏁 End komanda - završavam unos');
    
    showModernAlert('✅ Završeno', 'Svi unosi su sačuvani!', '📦');
    
    setTimeout(() => {
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        if (typeof loadProductsFromStorage === 'function') loadProductsFromStorage();
        if (typeof renderInventory === 'function') renderInventory();
        setTimeout(() => oznaciNoveUnose(), 300);
    }, 500);
}

// ===== OBRADA "PLUS" KOMANDE =====
function processPlusCommand() {
    console.log('➕ Plus komanda - novi unos');
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎤 Recite "Start" za novi unos';
        statusEl.style.color = '#4CAF50';
    }
    
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    
    if (productInput) productInput.value = '';
    if (pieceInput) pieceInput.value = '1';
    if (quantityInput) quantityInput.value = '1';
    if (shelfLifeInput) shelfLifeInput.value = '12';
    if (productInput) productInput.focus();
    isProcessing = false;
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
function processVoiceCommand(text) {
    if (isProcessing) {
        console.log('⏳ Već se obrađuje komanda, sačekaj...');
        return;
    }
    
    console.log('🎤 Obrada komande:', text);
    const lowerText = text.toLowerCase().trim();
    
    // KOMANDA: UNOS
    if (lowerText.includes('unos') || lowerText.includes('data entry') || 
        lowerText.includes('dodaj') || lowerText.includes('novi unos')) {
        isProcessing = true;
        openDataEntryScreen();
        setTimeout(() => { isProcessing = false; }, 500);
        return;
    }
    
    // KOMANDA: START
    if (lowerText.includes('start')) {
        isProcessing = true;
        processStartCommand(text);
        return;
    }
    
    // KOMANDA: PLUS
    if (lowerText.includes('plus') || lowerText.includes('sledeći') || 
        lowerText.includes('novo') || lowerText.includes('dodatno')) {
        processPlusCommand();
        return;
    }
    
    // KOMANDA: END
    if (lowerText.includes('end') || lowerText.includes('kraj') || 
        lowerText.includes('završi') || lowerText.includes('gotovo')) {
        processEndCommand();
        return;
    }
    
    // KOMANDA: POMOĆ
    if (lowerText.includes('pomoć') || lowerText.includes('help') || 
        lowerText.includes('šta') || lowerText.includes('kako')) {
        showModernAlert('📖 Pomoć', 'Reci "Unos" za otvaranje\n"Start [proizvod]"\n"Plus" za sledeći\n"End" za kraj', '💡');
        return;
    }
    
    // Nije prepoznato
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `❌ Nije prepoznato: "${text}"`;
        statusEl.style.color = '#f44336';
        setTimeout(() => {
            statusEl.textContent = '🎤 Recite "Start" za unos, "End" za kraj';
            statusEl.style.color = '#FFD700';
        }, 3000);
    }
}

// ===== OBRADA "START" KOMANDE =====
function processStartCommand(text) {
    console.log('🚀 Start komanda - parsiranje podataka');
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '⏳ Parsiranje podataka...';
        statusEl.style.color = '#FF9800';
    }
    
    let cleanText = text.replace(/^start\s+/i, '').trim();
    const data = parseVoiceDataEntry(cleanText);
    
    if (!data || !data.product_name) {
        if (statusEl) {
            statusEl.textContent = '❌ Nije moguće parsirati unos. Pokušajte ponovo.';
            statusEl.style.color = '#f44336';
        }
        isProcessing = false;
        return;
    }
    
    popuniStartPodatke(data);
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
        setTimeout(() => {
            if (!isListening && document.querySelector('#voiceMenuScreen.active')) {
                startVoiceRecognition();
            }
        }, 1000);
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
        } catch(e) {
            console.warn('⚠️ Greška pri zaustavljanju:', e);
        }
    }
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '⏸️ Zaustavljeno';
        statusEl.style.color = '#aaa';
    }
}

// ===== POVRATAK =====
function goBackFromVoice() {
    console.log('◀ Povratak sa glasovnog menija');
    
    stopVoiceRecognition();
    hideVoiceMenu();
    
    if (typeof showScreen === 'function') {
        showScreen('choiceScreen');
    } else if (typeof window.showScreen === 'function') {
        window.showScreen('choiceScreen');
    } else {
        const choiceScreen = document.getElementById('choiceScreen');
        if (choiceScreen) {
            choiceScreen.style.display = 'flex';
            choiceScreen.classList.add('active');
        }
        const voiceMenu = document.getElementById('voiceMenuScreen');
        if (voiceMenu) {
            voiceMenu.style.display = 'none';
            voiceMenu.classList.remove('active');
        }
    }
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
        <p style="color:#FFD700; font-size:18px; margin-bottom:25px; white-space:pre-line;">${message}</p>
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
        
        #voiceMenuScreen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            z-index: 9999;
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        #voiceMenuScreen.active {
            display: flex;
        }
        
        .voice-container {
            background: #1a1a2e;
            border-radius: 24px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            border: 2px solid #FFD700;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8);
        }
        
        .voice-status {
            color: #FFD700;
            font-size: 18px;
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background: rgba(255,215,0,0.1);
            border-radius: 12px;
            min-height: 60px;
        }
        
        .voice-microphone {
            text-align: center;
            font-size: 72px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

// ===== IZVEZI FUNKCIJE U GLOBALNI PROSTOR =====
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
window.processPlusCommand = processPlusCommand;
window.showModernAlert = showModernAlert;
window.oznaciNoveUnose = oznaciNoveUnose;
window.recognition = recognition;

// ===== INICIJALIZACIJA =====
addVoiceStyles();

console.log('✅ Voice Commands učitan - KORISTI POSTOJEĆI DATA ENTRY!');
console.log('📖 Primeri:');
console.log('   "Unos" - otvara Data Entry');
console.log('   "Start gril pile 2kg 6 zamrzivač" - dodaje proizvod');
console.log('   "Plus" - novi unos');
console.log('   "End" - završava unos i prikazuje zalihe');
