// ============================================
// VOICE COMMANDS - GLASOVNE KOMANDE - KOMPLETAN KOD
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
            statusEl.textContent = '🎤 Slušam... Recite "unos" pa diktirajte podatke.';
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
        
        // 1. Ako korisnik kaže "unos", odmah sakrij 4. ekran i otvori formu za unos
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
        
        // 2. Čekamo da korisnik izgovori "plus" ili "end" da bismo obradili sakupljeni tekst
        if (lowerBuffer.includes('plus') || lowerBuffer.includes('end')) {
            console.log('✅ Detektovan završetak unosa (plus/end) iz bafera:', activeBuffer);
            
            // Uklanjamo komandne reči iz teksta
            let cleanText = activeBuffer
                .replace(/unos/gi, '')
                .replace(/unesi/gi, '')
                .replace(/plus/gi, '')
                .replace(/end/gi, '')
                .trim();
            
            if (cleanText.length > 1) {
                processStartCommand(cleanText);
            }
            
            if (lowerBuffer.includes('end')) {
                if (typeof openInventoryAndShowHighlight === 'function') {
                    openInventoryAndShowHighlight();
                }
            }
            
            // Resetujemo bafer za sledeći unos
            activeBuffer = ''; 
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

// ===== POVRATAK SA VOICE MENIJA =====
function goBackFromVoice() {
    stopVoiceRecognition();
    if (typeof showScreen === 'function') {
        showScreen('choiceScreen');
    }
}

// ===== PARSIRANJE GLASOVNOG UNOSA =====
function parseVoiceDataEntry(command) {
    let text = command.trim();
    let parts = text.split(',').map(s => s.trim());
    
    let result = {
        product_name: '',
        piece: '',
        quantity: '',
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
        'zamrzivač 1': 'Zamrzivač 1', 'zamrzivac 1': 'Zamrzivač 1',
        'zamrzivač 2': 'Zamrzivač 2', 'zamrzivac 2': 'Zamrzivač 2',
        'zamrzivač 3': 'Zamrzivač 3', 'zamrzivac 3': 'Zamrzivač 3',
        'frižider': 'Frižider', 'frizider': 'Frižider',
        'ostava': 'Ostava', 'špajz': 'Ostava'
    };
    
    parts.forEach((part, index) => {
        part = part.toLowerCase().trim();
        
        if (index === 0) {
            result.product_name = parts[0].trim();
            return;
        }
        
        for (let [key, value] of Object.entries(storageMap)) {
            if (part.includes(key)) {
                result.storage = value;
                return;
            }
        }
        
        for (let [key, value] of Object.entries(unitMap)) {
            if (part.includes(key)) {
                let numMatch = part.match(/([\d.]+)/);
                if (numMatch) {
                    result.quantity = numMatch[1];
                    result.unit = value;
                }
                return;
            }
        }
        
        let numMatch = part.match(/(\d+)/);
        if (numMatch) {
            let num = numMatch[1];
            if (!result.piece) {
                result.piece = num;
                if (!result.quantity) result.quantity = num;
            } else if (!result.shelf_life) {
                result.shelf_life = num;
            }
        }
    });
    
    if (!result.product_name && parts.length > 0) {
        result.product_name = parts[0].trim();
    }
    
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
        statusEl.textContent = `✅ Uspešno uneto: ${data.product_name} (${data.quantity} ${data.unit})`;
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

console.log('✅ Voice Commands očišćen i ispravljen!');
