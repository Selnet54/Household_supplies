// ============================================
// VOICE COMMANDS - STABLE MOBILE & TABLET (NO POPUP)
// ============================================

let activeBuffer = '';
let recognition = null;
let isUserStopped = false;
let isProcessing = false; // Zaključavanje dok se podaci upisuju
let restartTimer = null;

// Isključivanje standardnih pop-up obaveštenja u aplikaciji
window.showModernAlert = function() { return false; };
window.alert = function() { return false; };

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

function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    isUserStopped = false;

    if (recognition) {
        try { recognition.abort(); } catch(e) {}
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
        console.log('🎤 Mikrofon je stabilno uključen.');
        if (statusEl) {
            statusEl.textContent = '🎤 Slušam... Recite "unos" ili diktirajte.';
            statusEl.style.color = '#2196F3';
        }
    };

    recognition.onresult = function(event) {
        if (isProcessing) return; // Ignoresi nove glasove dok traje obrada unosa

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
        }

        const currentDisplay = activeBuffer + (interimText ? ' ' + interimText : '');
        if (statusEl) {
            statusEl.textContent = `🎤 Slušam: "${currentDisplay}"`;
            statusEl.style.color = '#FFD700';
        }

        const lowerBuffer = (activeBuffer + ' ' + interimText).toLowerCase();

        // 1. EKRAN DATA ENTRY NA REČ "UNOS"
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

        // 2. DETEKCIJA KRAJA NIZA (PLUS, END, ENTER, FRIEND)
        if (/\b(plus|end|enter|friend)\b/i.test(activeBuffer)) {
            isProcessing = true; // Zaključaj obradu da sprečiš brze petlje mikrofona

            let isEnd = /\b(end|enter|friend)\b/i.test(activeBuffer);
            let parts = activeBuffer.split(/\b(plus|end|enter|friend)\b/i);
            let itemText = parts[0].trim();

            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }

            activeBuffer = parts.slice(2).join('').trim();

            if (isEnd) {
                stopVoiceRecognition();
                setTimeout(() => {
                    otvoriZaliheEkran();
                }, 600);
            } else {
                // Posle obrade "plus", otključaj mikrofon za sledeći proizvod
                setTimeout(() => {
                    isProcessing = false;
                }, 1000);
            }
        }
    };

    recognition.onerror = function(event) {
        if (event.error === 'no-speech' || event.error === 'aborted') {
            return; // Ignoriši bezazlene mobilne prekide tišine
        }
        if (event.error === 'not-allowed') {
            isUserStopped = true;
        }
    };

    // PAMETNA STABILIZACIJA PETLJE (Sprečava "semafor" bljeskanje)
    recognition.onend = function() {
        if (!isUserStopped) {
            clearTimeout(restartTimer);
            restartTimer = setTimeout(() => {
                try {
                    if (recognition) recognition.start();
                } catch(e) {}
            }, 1000); // 1 sekunda stabilne pauze pre nego što mobilni mikrofon ponovo počne da sluša
        }
    };

    try {
        recognition.start();
    } catch(e) {}
}

function stopVoiceRecognition() {
    isUserStopped = true;
    isProcessing = false;
    clearTimeout(restartTimer);
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
    }
    activeBuffer = '';
}

function otvoriZaliheEkran() {
    if (typeof refreshInventoryData === 'function') refreshInventoryData();
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
}

function goBackFromVoice() {
    stopVoiceRecognition();
    if (typeof showScreen === 'function') showScreen('choiceScreen');
}

function parseVoiceDataEntry(command) {
    let text = command.replace(/^unos\s*/i, '').replace(/^start\s*/i, '').trim();
    let words = text.split(/\s+/).map(s => s.trim()).filter(Boolean);

    let result = {
        product_name: '', piece: '1', quantity: '1', unit: 'kom', shelf_life: '12', storage: 'Zamrzivač 1'
    };

    const unitMap = {
        'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg', 'gram': 'g', 'grama': 'g', 'g': 'g',
        'litar': 'l', 'litara': 'l', 'l': 'l', 'komad': 'kom', 'komada': 'kom', 'kom': 'kom', 'paket': 'pak'
    };

    const storageMap = {
        'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1', 'frižider': 'Frižider', 'frizider': 'Frižider', 'ostava': 'Ostava'
    };

    const numberWordsMap = {
        'jedan': '1', 'jedna': '1', 'dva': '2', 'dve': '2', 'tri': '3', 'četiri': '4', 'pet': '5',
        'šest': '6', 'sedam': '7', 'osam': '8', 'devet': '9', 'deset': '10', 'dvanaest': '12'
    };

    let nameWords = [];
    let quantityFound = false;
    let shelfLifeFound = false;

    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        if (w === 'start' || w === 'unos') continue;

        if (storageMap[w]) { result.storage = storageMap[w]; continue; }
        if (unitMap[w]) { result.unit = unitMap[w]; continue; }

        let numVal = (!isNaN(w) && w !== '') ? w : numberWordsMap[w];
        if (numVal) {
            if (!quantityFound) {
                result.quantity = numVal;
                result.piece = numVal;
                quantityFound = true;
            } else if (!shelfLifeFound) {
                result.shelf_life = numVal;
                shelfLifeFound = true;
            }
            continue;
        }

        if (['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci'].includes(w)) continue;

        if (!quantityFound) nameWords.push(words[i]);
    }

    result.product_name = nameWords.join(' ') || 'Proizvod';
    return result;
}

function processAndSaveItem(command) {
    let data = parseVoiceDataEntry(command);
    if (!data.product_name || data.product_name === 'Proizvod') return false;

    hideVoiceMenu();
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }

    setTimeout(() => {
        popuniFormuPodacima(data);
        setTimeout(() => sacuvajPodatkeTiho(data), 150);
    }, 100);

    return true;
}

function popuniFormuPodacima(data) {
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
            el.value = val;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };

    setVal('productInput', data.product_name);
    setVal('pieceInput', data.piece);
    setVal('quantityInput', data.quantity);
    setVal('shelfLifeInput', data.shelf_life);

    const unitSelect = document.getElementById('unitSelect');
    if (unitSelect && data.unit) {
        for (let opt of unitSelect.options) {
            if (opt.value === data.unit || opt.text.toLowerCase().includes(data.unit)) {
                opt.selected = true;
                unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }

    const storageSelect = document.getElementById('storageSelect');
    if (storageSelect && data.storage) {
        for (let opt of storageSelect.options) {
            if (opt.value === data.storage || opt.text.includes(data.storage)) {
                opt.selected = true;
                storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }

    if (typeof updateExpiryDate === 'function') try { updateExpiryDate(); } catch(e) {}
}

// TIHO ČUVANJE (Potpuno bez iskakanja pop-up obaveštenja)
function sacuvajPodatkeTiho(data) {
    let saved = false;
    
    if (typeof window.inventory !== 'undefined' && Array.isArray(window.inventory)) {
        window.inventory.push({
            id: Date.now(),
            productName: data.product_name,
            piece: parseInt(data.piece) || 1,
            quantity: parseFloat(data.quantity) || 1,
            unit: data.unit || 'kom',
            shelfLife: parseInt(data.shelf_life) || 12,
            storage: data.storage || 'Zamrzivač 1',
            dateAdded: new Date().toISOString()
        });
        saved = true;
        if (typeof renderInventory === 'function') renderInventory();
    }

    if (!saved && typeof saveProduct === 'function') { try { saveProduct(); saved = true; } catch(e) {} }
    if (!saved && typeof handleFormSubmit === 'function') { try { handleFormSubmit(); saved = true; } catch(e) {} }
    
    if (!saved) {
        const saveBtn = document.querySelector('#saveProductBtn, button[type="submit"], .btn-save, .save-btn');
        if (saveBtn) { try { saveBtn.click(); saved = true; } catch(e) {} }
    }

    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `✅ Upisano: ${data.product_name}`;
        statusEl.style.color = '#4CAF50';
    }
}

// Globalne funkcije
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.processVoiceCommand = processAndSaveItem;
