// ============================================
// VOICE COMMANDS - GLASOVNE KOMANDE - POPRAVLJENO
// ============================================

let activeBuffer = ''; 
let recognition = null;
let voiceItemsToSave = [];

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
        voiceItemsToSave = [];
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
        
        // PROVERA ZA KRAJ UNOSA - END, ENTER ILI PLUS
        const lowerBuffer = activeBuffer.toLowerCase();
        
        // Detektujemo END komandu
        if (/\b(end|enter|friend)\b/i.test(activeBuffer)) {
            console.log('✅ Detektovan prekid u baferu:', activeBuffer);
            
            let isEnd = /\b(end|enter|friend)\b/i.test(activeBuffer);
            let parts = activeBuffer.split(/\b(plus|end|enter|friend)\b/i);
            let itemText = parts[0].trim();
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }
            
            // Resetujemo buffer posle obrade
            activeBuffer = parts.slice(2).join('').trim();
            
            if (isEnd) {
                console.log('🏁 Kraj unosa (END / ENTER detektovan)');
                stopVoiceRecognition();
                
                // Otvaramo zalihe nakon kratke pauze
                setTimeout(() => {
                    otvoriZaliheEkran();
                }, 500);
            }
        }
        
        // Takođe proveravamo da li je reč "unos" za otvaranje forme
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
    };

    recognition.onerror = function(event) {
        console.log('⚠️ Speech Recognition greška:', event.error);
        if (statusEl) {
            statusEl.textContent = `❌ Greška: ${event.error}`;
            statusEl.style.color = '#f44336';
        }
    };

    recognition.onend = function() {
        console.log('🎤 Glasovno prepoznavanje završeno.');
        if (statusEl) {
            statusEl.textContent = '⏸️ Prepoznavanje zaustavljeno';
            statusEl.style.color = '#aaa';
        }
    };

    try {
        recognition.start();
    } catch(e) {
        console.log('❌ Greška pri pokretanju recognition-a:', e);
        if (statusEl) {
            statusEl.textContent = `❌ Greška: ${e.message}`;
            statusEl.style.color = '#f44336';
        }
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
    console.log('📦 Otvaranje ekrana zaliha...');
    
    // Prvo sakrijemo voice menu
    hideVoiceMenu();
    
    // Pokušavamo da otvorimo inventory screen
    try {
        if (typeof openInventoryAndShowHighlight === 'function') {
            openInventoryAndShowHighlight();
            return;
        }
        
        if (typeof showScreen === 'function') {
            showScreen('inventoryScreen');
            return;
        }
        
        // Direktna manipulacija DOM-om
        const inv = document.getElementById('inventoryScreen');
        const main = document.getElementById('mainScreen');
        const choice = document.getElementById('choiceScreen');
        
        if (inv) {
            if (main) main.style.display = 'none';
            if (choice) choice.style.display = 'none';
            inv.style.display = 'flex';
            inv.classList.add('active');
            
            // Ažuriramo inventar
            if (typeof renderInventory === 'function') {
                renderInventory();
            }
        }
    } catch(e) {
        console.log('⚠️ Greška pri otvaranju zaliha:', e);
    }
    
    console.log('📦 Otvoren ekran zaliha');
}

// ===== POVRATAK SA VOICE MENIJA =====
function goBackFromVoice() {
    stopVoiceRecognition();
    if (typeof showScreen === 'function') {
        showScreen('choiceScreen');
    } else {
        const choice = document.getElementById('choiceScreen');
        const voice = document.getElementById('voiceMenuScreen');
        if (choice) {
            if (voice) voice.style.display = 'none';
            choice.style.display = 'flex';
            choice.classList.add('active');
        }
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
        'dvanaest': '12'
    };

    let nameWords = [];
    let state = 'name';
    
    let i = 0;
    while (i < words.length) {
        let w = words[i].toLowerCase();
        
        if (w === 'start' || w === 'unos') {
            i++;
            continue;
        }

        // Provera skladišta
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

        // Provera jedinice
        if (unitMap[w]) {
            result.unit = unitMap[w];
            state = 'unit';
            i++;
            continue;
        }

        // Provera broja
        let numVal = null;
        if (!isNaN(w)) {
            numVal = w;
        } else if (numberWordsMap[w]) {
            numVal = numberWordsMap[w];
        }

        if (numVal !== null && state === 'name') {
            result.quantity = numVal;
            result.piece = numVal;
            state = 'unit';
            i++;
            continue;
        } else if (numVal !== null && state === 'unit') {
            result.shelf_life = numVal;
            state = 'storage';
            i++;
            continue;
        }

        if (state === 'name') {
            nameWords.push(words[i]);
        }

        i++;
    }

    result.product_name = nameWords.join(' ') || 'Proizvod';
    console.log('✅ Parsirani podaci:', result);
    return result;
}

// ===== OBRADA I AUTOMATSKO ČUVANJE U BAZU/INVENTAR =====
function processAndSaveItem(command) {
    console.log('🔄 Procesiranje komande:', command);
    
    let data = parseVoiceDataEntry(command);
    if (!data.product_name || data.product_name === 'Proizvod') {
        console.log('❌ Nevalidan naziv proizvoda');
        return false;
    }
    
    // Sakrivamo voice menu
    hideVoiceMenu();
    
    // Prikazujemo main screen sa formom
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    
    // Popunjavamo formu
    setTimeout(() => {
        popuniFormuPodacima(data);
        
        // Čuvamo proizvod nakon popunjavanja
        setTimeout(() => {
            sacuvajProizvod(data);
        }, 200);
        
    }, 100);

    return true;
}

// ===== POPUNJAVANJE FORME - POPRAVLJENO =====
function popuniFormuPodacima(data) {
    console.log('📝 Popunjavanje forme sa:', data);
    
    // Pronalazimo sve inpute
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const unitSelect = document.getElementById('unitSelect');
    const storageSelect = document.getElementById('storageSelect');
    
    // Popunjavamo naziv proizvoda
    if (productInput) {
        productInput.value = data.product_name || '';
        productInput.dispatchEvent(new Event('input', { bubbles: true }));
        productInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Popunjen naziv:', data.product_name);
    }
    
    // Popunjavamo količinu
    if (pieceInput) {
        pieceInput.value = data.piece || '1';
        pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (quantityInput) {
        quantityInput.value = data.quantity || '1';
        quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Popunjavamo rok trajanja
    if (shelfLifeInput) {
        shelfLifeInput.value = data.shelf_life || '12';
        shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Popunjavamo jedinicu
    if (unitSelect && data.unit) {
        for (let option of unitSelect.options) {
            if (option.value === data.unit) {
                option.selected = true;
                unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('✅ Popunjena jedinica:', data.unit);
                break;
            }
        }
    }
    
    // Popunjavamo skladište
    if (storageSelect && data.storage) {
        for (let option of storageSelect.options) {
            const optionText = option.text.toLowerCase();
            const storageText = data.storage.toLowerCase();
            if (option.value === data.storage || optionText.includes(storageText) || storageText.includes(optionText)) {
                option.selected = true;
                storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('✅ Popunjeno skladište:', data.storage);
                break;
            }
        }
    }
    
    // Ažuriramo datum isteka
    if (typeof updateExpiryDate === 'function') {
        updateExpiryDate();
    }
    
    // Prikazujemo status
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `✅ Forma popunjena: ${data.product_name}`;
        statusEl.style.color = '#4CAF50';
    }
}

// ===== ČUVANJE PROIZVODA - POPRAVLJENO =====
function sacuvajProizvod(data) {
    console.log('💾 Čuvanje proizvoda:', data);
    
    let saved = false;
    
    // Pokušavamo različite načine čuvanja
    try {
        // 1. Metoda: Ako postoji funkcija saveProduct
        if (typeof window.saveProduct === 'function') {
            window.saveProduct();
            saved = true;
            console.log('💾 Sačuvano preko saveProduct()');
        }
        
        // 2. Metoda: Ako postoji handleFormSubmit
        if (!saved && typeof window.handleFormSubmit === 'function') {
            window.handleFormSubmit();
            saved = true;
            console.log('💾 Sačuvano preko handleFormSubmit()');
        }
        
        // 3. Metoda: Klik na dugme za čuvanje
        if (!saved) {
            const saveBtn = document.querySelector('#saveProductBtn, button[type="submit"], .btn-save, .save-btn');
            if (saveBtn) {
                saveBtn.click();
                saved = true;
                console.log('💾 Sačuvano klikom na dugme');
            }
        }
        
        // 4. Metoda: Direktno dodavanje u inventar
        if (!saved && typeof window.addProduct === 'function') {
            window.addProduct();
            saved = true;
            console.log('💾 Sačuvano preko addProduct()');
        }
        
        // 5. Metoda: Direktno pozivanje submit forme
        if (!saved) {
            const form = document.querySelector('#dataEntryForm, form');
            if (form && typeof form.submit === 'function') {
                form.submit();
                saved = true;
                console.log('💾 Sačuvano preko form.submit()');
            }
        }
        
        // Provera da li je sačuvano
        if (saved) {
            console.log('✅ Proizvod uspešno sačuvan!');
            
            // Ažuriramo status
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = `✅ Uspešno sačuvano: ${data.product_name}`;
                statusEl.style.color = '#4CAF50';
            }
            
            // Pauza pre otvaranja zaliha
            setTimeout(() => {
                otvoriZaliheEkran();
            }, 300);
            
        } else {
            console.log('❌ NIJE SAČUVANO - nijedna metoda nije uspela');
            
            // Prikazujemo grešku
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = `❌ Greška pri čuvanju: ${data.product_name}`;
                statusEl.style.color = '#f44336';
            }
            
            if (typeof showModernAlert === 'function') {
                showModernAlert('Greška', 'Nije moguće sačuvati proizvod.', '❌');
            }
        }
        
    } catch(e) {
        console.log('❌ Greška pri čuvanju:', e);
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = `❌ Greška: ${e.message}`;
            statusEl.style.color = '#f44336';
        }
    }
    
    return saved;
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
window.popuniFormuPodacima = popuniFormuPodacima;
window.sacuvajProizvod = sacuvajProizvod;
window.otvoriZaliheEkran = otvoriZaliheEkran;

console.log('✅ Voice Commands POPRAVLJEN: Precizno popunjavanje forme i automatsko čuvanje!');
