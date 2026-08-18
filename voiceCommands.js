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
            statusEl.textContent = '🎤 Slušam... Diktirajte artikle (završite sa "plus" ili "end").';
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
        
        // Čim detektujemo "unos", sakrivamo 4. ekran i otvaramo formu
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
        
        // PROVERA ZA "PLUS" ILI "END"
        if (/\b(plus|end)\b/i.test(activeBuffer)) {
            console.log('✅ Detektovan prekid (plus/end) u baferu:', activeBuffer);
            
            let isEnd = /\bend\b/i.test(activeBuffer);
            let parts = activeBuffer.split(/\b(plus|end)\b/i);
            let itemText = parts[0].trim();
            
            if (itemText.length > 2) {
                processStartCommand(itemText);
            }
            
            activeBuffer = parts.slice(2).join('').trim();
            
            if (isEnd) {
                console.log('🏁 Kraj unosa (END detektovan)');
                stopVoiceRecognition();
                
                // Sačekamo kratko da se poslednji artikal upiše pa otvorimo inventar
                setTimeout(() => {
                    if (typeof openInventoryAndShowHighlight === 'function') {
                        openInventoryAndShowHighlight();
                    } else if (typeof showScreen === 'function') {
                        showScreen('inventoryScreen'); // Rezervna opcija ako funkcija ne postoji
                    }
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

// ===== POVRATAK SA VOICE MENIJA =====
function goBackFromVoice() {
    stopVoiceRecognition();
    if (typeof showScreen === 'function') {
        showScreen('choiceScreen');
    }
}

// ===== PAMETNO PARSIRANJE GLASOVNOG UNOSA =====
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
    let numbersFound = [];
    
    for (let i = 0; i < parts.length; i++) {
        let p = parts[i].toLowerCase();
        
        if (p === 'start' || p === 'unos') continue;
        
        if (storageMap[p]) {
            let storageName = storageMap[p];
            if (parts[i+1] && !isNaN(parts[i+1])) {
                storageName = `Zamrzivač ${parts[i+1]}`;
                i++;
            } else if (p === 'zamrzivač' && parts[i+1] && ['jedan', 'dva', 'tri'].includes(parts[i+1].toLowerCase())) {
                const mapNum = { 'jedan': '1', 'dva': '2', 'tri': '3' };
                storageName = `Zamrzivač ${mapNum[parts[i+1].toLowerCase()]}`;
                i++;
            }
            result.storage = storageName;
            continue;
        }
        
        if (unitMap[p]) {
            result.unit = unitMap[p];
            continue;
        }
        
        if (!isNaN(p)) {
            numbersFound.push(p);
            continue;
        }
        
        nameWords.push(parts[i]);
    }
    
    if (numbersFound.length > 0) {
        result.piece = numbersFound[0];
        result.quantity = numbersFound[0];
    }
    if (numbersFound.length > 1) {
        result.shelf_life = numbersFound[numbersFound.length - 1];
    }
    
    result.product_name = nameWords.join(' ') || 'Proizvod';
    console.log('✅ Pametno parsirani podaci:', result);
    return result;
}

// ===== OBRADA UNOSA I SNIMANJE U BAZU/INVENTAR =====
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
        
        // AUTOMATSKO ČUVANJE (KLIK NA DUGME ZA SNIMANJE)
        setTimeout(() => {
            const saveButtons = document.querySelectorAll('button, input[type="submit"], .btn-save, .save-btn');
            let clicked = false;
            
            saveButtons.forEach(btn => {
                const text = (btn.textContent || btn.value || '').toLowerCase();
                if (text.includes('sačuvaj') || text.includes('sacuvaj') || text.includes('dodaj') || text.includes('save') || text.includes('potvrdi')) {
                    btn.click();
                    clicked = true;
                    console.log('💾 Automatski kliknuto dugme za čuvanje:', text);
                }
            });
            
            // Ako nismo našli dugme preko teksta, tražimo primarni submit unutar forme
            if (!clicked) {
                const formSubmit = document.querySelector('form button[type="submit"], #saveProductBtn');
                if (formSubmit) {
                    formSubmit.click();
                    console.log('💾 Kliknuto na formu/submit dugme');
                }
            }
        }, 300);
        
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
        statusEl.textContent = `✅ Uspešno sačuvano: ${data.product_name} (${data.quantity} ${data.unit})`;
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

console.log('✅ Voice Commands potpuno ispravljen i spreman za snimanje!');
