// ============================================
// VOICE COMMANDS - GLASOVNE KOMANDE - OPTIMIZOVANO
// ============================================

let activeBuffer = ''; 
let recognition = null;

// ===== POMOĆNA FUNKCIJA ZA SAKRIVANJE EKRANA / MENIJA =====
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
            statusEl.textContent = '🎤 Slušam... Diktirajte artikle (završite sa "plus", a na kraju recite "end" ili "enter").';
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
        
        const dataEntryKeywords = ['unos', 'unesi', 'dodaj', 'novi', 'add'];
        if (dataEntryKeywords.some(k => lowerBuffer.includes(k))) {
            hideVoiceMenu();
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen && mainScreen.style.display !== 'flex') {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
                if (typeof renderDataEntry === 'function') renderDataEntry('');
            }
        }
        
        // PROVERA ZA "PLUS", "END", "ENTER" ILI "FRIEND"
        if (/\b(plus|end|enter|friend)\b/i.test(activeBuffer)) {
            console.log('✅ Detektovan prekid u baferu:', activeBuffer);
            
            let isEnd = /\b(end|enter|friend)\b/i.test(activeBuffer);
            let parts = activeBuffer.split(/\b(plus|end|enter|friend)\b/i);
            let itemText = parts[0].trim();
            
            if (itemText.length > 2) {
                processStartCommand(itemText);
            }
            
            activeBuffer = parts.slice(2).join('').trim();
            
            if (isEnd) {
                console.log('🏁 Kraj unosa (END / ENTER detektovan)');
                stopVoiceRecognition();
                
                setTimeout(() => {
                    otvoriZaliheEkran();
                }, 800);
            }
        }
    };

    recognition.onerror = function(event) {
        console.log('⚠️ Speech Recognition greška:', event.error);
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
    console.log('📦 Otvoren ekran zaliha');
}

// ===== POVRATAK SA VOICE MENIJA =====
function goBackFromVoice() {
    stopVoiceRecognition();
    if (typeof showScreen === 'function') {
        showScreen('choiceScreen');
    }
}

// ===== NAPREDNO I PAMETNO PARSIRANJE UNOSA =====
function parseVoiceDataEntry(command) {
    let text = command
        .replace(/^unos\s*/i, '')
        .replace(/^start\s*/i, '')
        .trim();
        
    let parts = text.split(/\s+/).map(s => s.trim()).filter(Boolean);
    
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

    let nameWords = [];
    let numbersAndUnits = [];
    
    // Prolazimo kroz reči i tražimo gde počinju brojevi ili merna jedinica
    let foundNumberOrUnit = false;

    for (let i = 0; i < parts.length; i++) {
        let p = parts[i].toLowerCase();
        
        if (p === 'start' || p === 'unos') continue;
        
        // Ako naiđemo na skladište ili jedinicu ili broj, sve posle toga smatramo parametrima
        if (storageMap[p] || unitMap[p] || !isNaN(p)) {
            foundNumberOrUnit = true;
        }

        if (!foundNumberOrUnit) {
            nameWords.push(parts[i]);
        } else {
            numbersAndUnits.push(parts[i]);
        }
    }
    
    // Ako se desilo da je naziv ostao prazan, uzimamo prvu reč
    if (nameWords.length ===  0 && parts.length > 0) {
        nameWords.push(parts[0]);
        numbersAndUnits = parts.slice(1);
    }

    result.product_name = nameWords.join(' ');

    // Sada parsiramo izdvojene parametre (količina, jedinica, rok, skladište)
    let explicitNumbers = [];
    for (let i = 0; i < numbersAndUnits.length; i++) {
        let item = numbersAndUnits[i].toLowerCase();
        
        if (storageMap[item]) {
            let storageName = storageMap[item];
            if (numbersAndUnits[i+1] && !isNaN(numbersAndUnits[i+1])) {
                storageName = `Zamrzivač ${numbersAndUnits[i+1]}`;
                i++;
            }
            result.storage = storageName;
            continue;
        }
        
        if (unitMap[item]) {
            result.unit = unitMap[item];
            continue;
        }
        
        if (!isNaN(item)) {
            explicitNumbers.push(item);
        }
    }

    if (explicitNumbers.length > 0) {
        result.piece = explicitNumbers[0];
        result.quantity = explicitNumbers[0];
    }
    if (explicitNumbers.length > 1) {
        result.shelf_life = explicitNumbers[explicitNumbers.length - 1];
    }
    
    console.log('✅ Precizno parsirani podaci:', result);
    return result;
}

// ===== OBRADA UNOSA =====
function processStartCommand(command) {
    let data = parseVoiceDataEntry(command);
    if (!data.product_name) return false;
    
    hideVoiceMenu();
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    
    if (typeof renderDataEntry === 'function') {
        renderDataEntry(data);
    }
    
    setTimeout(() => {
        popuniStartPodatke(data);
    }, 100);

    return true;
}

// ===== POPUNJAVANJE FORME =====
function popuniStartPodatke(data) {
    const productInput = document.getElementById('productInput');
    if (!productInput) return;
    
    productInput.value = data.product_name || '';
    productInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const unitSelect = document.getElementById('unitSelect');
    const storageSelect = document.getElementById('storageSelect');
    
    if (pieceInput) {
        pieceInput.value = data.piece || '1';
        pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (quantityInput) {
        quantityInput.value = data.quantity || '1';
        quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (shelfLifeInput) {
        shelfLifeInput.value = data.shelf_life || '12';
        shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    if (unitSelect && data.unit) {
        for (let option of unitSelect.options) {
            if (option.value === data.unit) {
                option.selected = true;
                unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }
    
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
        updateExpiryDate();
    }
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `✅ Uneto: ${data.product_name} (${data.quantity} ${data.unit})`;
        statusEl.style.color = '#4CAF50';
    }
}

// ===== GLOBALNE FUNKCIJE =====
window.processVoiceCommand = function(command) {
    if (!command) return false;
    hideVoiceMenu();
    processStartCommand(command);
    return true;
};
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.processStartCommand = processStartCommand;
window.popuniStartPodatke = popuniStartPodatke;
window.otvoriZaliheEkran = otvoriZaliheEkran;

console.log('✅ Voice Commands optimizovan za precizno odvajanje naziva od brojeva.');
