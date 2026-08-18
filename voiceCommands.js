// ============================================
// VOICE COMMANDS - GLASOVNE KOMANDE - DEFINITIVNO REŠENJE
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
                processAndSaveItem(itemText);
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

// ===== ČISTO I PRECIZNO PARSIRANJE GLASNOG UNOSA =====
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
        'dvanaest': '12', 'dvanaest': '12'
    };

    let nameWords = [];
    let state = 'name'; // 'name', 'quantity', 'unit', 'shelf_life', 'storage'
    
    let i = 0;
    while (i < words.length) {
        let w = words[i].toLowerCase();
        
        if (w === 'start' || w === 'unos') {
            i++;
            continue;
        }

        // Provera da li je reč skladište
        if (storageMap[w]) {
            let storageName = storageMap[w];
            if (words[i+1]) {
                let nextW = words[i+1].toLowerCase();
                if (!isNaN(nextW)) {
                    storageName = `Zamrzivač ${words[i+1]}`;
                    i++;
                } else if (numberWordsMap[nextW]) {
                    storageName = `Zamrzivač ${numberWordsMap[nextW]}`;
                    i++;
                }
            }
            result.storage = storageName;
            state = 'done';
            i++;
            continue;
        }

        // Provera da li je jedinica
        if (unitMap[w]) {
            result.unit = unitMap[w];
            state = 'shelf_life';
            i++;
            continue;
        }

        // Prelazak sa naziva na količinu (ako naiđemo na cifru ili broj rečju)
        let numVal = null;
        if (!isNaN(w)) {
            numVal = w;
        } else if (numberWordsMap[w]) {
            numVal = numberWordsMap[w];
        }

        if (numVal !== null && state === 'name') {
            // Prvi broj na koji naiđemo predstavlja količinu/komad
            result.quantity = numVal;
            result.piece = numVal;
            state = 'unit';
            i++;
            continue;
        } else if (numVal !== null && (state === 'unit' || state === 'shelf_life')) {
            // Sledeći broj predstavlja rok trajanja (npr. 6 meseci)
            result.shelf_life = numVal;
            state = 'storage';
            i++;
            continue;
        }

        // Ako smo u fazi naziva, dodajemo reč u naziv proizvoda
        if (state === 'name') {
            nameWords.push(words[i]);
        }

        i++;
    }

    result.product_name = nameWords.join(' ') || 'Proizvod';
    console.log('✅ Savršeno parsirani podaci:', result);
    return result;
}

// ===== OBRADA I AUTOMATSKO ČUVANJE U BAZU/INVENTAR =====
function processAndSaveItem(command) {
    let data = parseVoiceDataEntry(command);
    if (!data.product_name) return false;
    
    hideVoiceMenu();
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    
    // 1. Popunjavamo formu da korisnik vidi šta je uneto
    if (typeof renderDataEntry === 'function') {
        renderDataEntry(data);
    }
    
    setTimeout(() => {
        popuniStartPodatke(data);
        
        // 2. AUTOMATSKI UPIS U BAZU / PREGLED UNOSA / ZALIHE
        setTimeout(() => {
            let saved = false;
            
            // Pozivamo originalne funkcije iz script1.js za snimanje unosa
            if (typeof saveProduct === 'function') {
                saveProduct();
                saved = true;
                console.log('💾 Pozvana funkcija saveProduct()');
            } else if (typeof handleFormSubmit === 'function') {
                handleFormSubmit();
                saved = true;
                console.log('💾 Pozvana funkcija handleFormSubmit()');
            } else if (typeof addProduct === 'function') {
                addProduct();
                saved = true;
                console.log('💾 Pozvana funkcija addProduct()');
            }
            
            // Rezervni program: ako nema eksplicitne funkcije, simuliramo klik na dugme za čuvanje u formi
            if (!saved) {
                const saveBtn = document.querySelector('#saveProductBtn, button[type="submit"], .btn-save');
                if (saveBtn) {
                    saveBtn.click();
                    console.log('💾 Kliknuto dugme za čuvanje na formi');
                }
            }
        }, 150);
        
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
    processAndSaveItem(command);
    return true;
};
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.processStartCommand = processAndSaveItem;
window.popuniStartPodatke = popuniStartPodatke;
window.otvoriZaliheEkran = otvoriZaliheEkran;

console.log('✅ Voice Commands uspešno popravljen: precizan naziv i automatsko čuvanje!');
