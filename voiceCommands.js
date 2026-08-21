// ============================================
// VOICE COMMANDS - SEQUENTIAL INPUT
// Start -> (podaci) -> Plus -> (podaci) -> Plus -> ... -> End
// ============================================

let recognition = null;
let isListening = false;
let currentText = '';
let isProcessing = false;
let voiceRestartTimer = null;
let pendingData = []; // Svi uneti podaci
let currentItem = ''; // Trenutni unos

// ===== POKRENI MIKROFON =====
function initMicrophone() {
    if (isListening && recognition) {
        console.log('✅ Mikrofon već radi');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Browser ne podržava glasovni unos';
            statusEl.style.color = '#f44336';
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
        console.log('🎤 Mikrofon AKTIVAN');
        isListening = true;
        isProcessing = false;
        if (statusEl) {
            statusEl.textContent = '🎤 Mikrofon aktivan - recite "Start" za prvi unos';
            statusEl.style.color = '#4CAF50';
        }
        updateMicrophoneButton(true);
    };

    recognition.onresult = function(event) {
        if (isProcessing) return;
        
        let finalText = '';
        let interimText = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript.trim();
            
            if (result.isFinal) {
                finalText += (finalText ? ' ' : '') + transcript;
            } else {
                interimText += transcript;
            }
        }
        
        if (finalText) {
            currentText += (currentText ? ' ' : '') + finalText;
            console.log('🗣️ Tekst:', currentText);
            
            // Prikaži šta je rečeno
            const displayText = currentText + (interimText ? ' ' + interimText : '');
            if (statusEl) {
                statusEl.textContent = `🎤 "${displayText}"`;
                statusEl.style.color = '#FFD700';
            }
            
            // OBRADI KOMANDE
            processVoiceCommands();
        }
    };

    recognition.onerror = function(event) {
        console.log('⚠️ Greška:', event.error);
        
        if (event.error === 'not-allowed') {
            if (statusEl) {
                statusEl.textContent = '❌ Dozvolite mikrofon u podešavanjima';
                statusEl.style.color = '#f44336';
            }
            updateMicrophoneButton(false);
        } else if (event.error === 'no-speech') {
            // Ignoriši
        } else if (event.error === 'audio-capture') {
            if (statusEl) {
                statusEl.textContent = '❌ Problem sa mikrofonom - pokušajte ponovo';
                statusEl.style.color = '#f44336';
            }
            setTimeout(() => {
                if (!isListening) {
                    initMicrophone();
                }
            }, 3000);
        }
    };

    recognition.onend = function() {
        console.log('🔚 Prepoznavanje završeno');
        
        if (isListening) {
            console.log('🔄 Restartujem mikrofon');
            clearTimeout(voiceRestartTimer);
            voiceRestartTimer = setTimeout(() => {
                if (isListening && recognition) {
                    try {
                        recognition.start();
                    } catch(e) {
                        setTimeout(() => {
                            if (isListening) {
                                initMicrophone();
                            }
                        }, 1000);
                    }
                }
            }, 500);
        } else {
            updateMicrophoneButton(false);
            if (statusEl) {
                statusEl.textContent = '⏸️ Mikrofon isključen';
                statusEl.style.color = '#aaa';
            }
        }
    };

    // ---- POKRENI ----
    try {
        if (typeof navigator.mediaDevices !== 'undefined' && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => {
                    recognition.start();
                })
                .catch((err) => {
                    console.error('❌ Greška mikrofona:', err);
                    if (statusEl) {
                        statusEl.textContent = '❌ Greška pri pristupu mikrofonu';
                        statusEl.style.color = '#f44336';
                    }
                    updateMicrophoneButton(false);
                });
        } else {
            recognition.start();
        }
    } catch(e) {
        console.error('❌ Greška:', e);
        if (statusEl) {
            statusEl.textContent = '❌ Greška pri pokretanju';
            statusEl.style.color = '#f44336';
        }
        updateMicrophoneButton(false);
    }
}

// ===== OBRADI GLASOVNE KOMANDE =====
function processVoiceCommands() {
    if (isProcessing) return;
    if (!currentText || currentText.length < 2) return;
    
    const lower = currentText.toLowerCase();
    const statusEl = document.getElementById('voiceStatus');
    
    // ===== 1. KOMANDA: "START" - pokreće prvi unos =====
    if (/\b(start|pokreni|započni)\b/.test(lower)) {
        console.log('🚀 KOMANDA: START');
        isProcessing = true;
        
        // Očisti prethodne podatke
        pendingData = [];
        currentItem = '';
        
        // Izdvoji tekst posle "start"
        const parts = currentText.split(/\b(start|pokreni|započni)\b/i);
        currentItem = parts[parts.length - 1].trim();
        
        if (currentItem && currentItem.length > 2) {
            // Prvi unos je već tu
            processCurrentItem();
        } else {
            if (statusEl) {
                statusEl.textContent = '📝 Unos pokrenut - govorite podatke...';
                statusEl.style.color = '#4CAF50';
            }
            currentItem = '';
        }
        
        currentText = '';
        isProcessing = false;
        return;
    }
    
    // ===== 2. KOMANDA: "PLUS" - završava trenutni unos =====
    if (/\b(plus|dodaj|sledeći)\b/.test(lower)) {
        console.log('➕ KOMANDA: PLUS');
        isProcessing = true;
        
        // Izdvoji tekst pre "plus"
        const parts = currentText.split(/\b(plus|dodaj|sledeći)\b/i);
        const itemText = parts[0].trim();
        
        if (itemText && itemText.length > 2) {
            // Dodaj trenutni unos u listu
            const data = parseVoiceData(itemText);
            if (data) {
                pendingData.push(data);
                console.log(`✅ Dodat unos ${pendingData.length}:`, data);
                
                if (statusEl) {
                    statusEl.textContent = `✅ Unos ${pendingData.length}: ${data.product_name} (${data.quantity} ${data.unit}) - kažite sledeći`;
                    statusEl.style.color = '#4CAF50';
                }
                
                // Sačuvaj odmah
                saveData(data);
            } else {
                if (statusEl) {
                    statusEl.textContent = '⚠️ Nije prepoznat proizvod, pokušajte ponovo';
                    statusEl.style.color = '#FF9800';
                }
            }
        } else {
            if (statusEl) {
                statusEl.textContent = '⚠️ Nema podataka za unos';
                statusEl.style.color = '#FF9800';
            }
        }
        
        // Resetuj za sledeći unos
        currentText = '';
        currentItem = '';
        isProcessing = false;
        
        return;
    }
    
    // ===== 3. KOMANDA: "END" - završava poslednji unos i otvara zalihe =====
    if (/\b(end|enter|kraj|gotovo|save|završi)\b/.test(lower)) {
        console.log('🏁 KOMANDA: END');
        isProcessing = true;
        
        // Izdvoji tekst pre "end"
        const parts = currentText.split(/\b(end|enter|kraj|gotovo|save|završi)\b/i);
        const itemText = parts[0].trim();
        
        if (itemText && itemText.length > 2) {
            const data = parseVoiceData(itemText);
            if (data) {
                pendingData.push(data);
                console.log(`✅ Dodat poslednji unos ${pendingData.length}:`, data);
                
                if (statusEl) {
                    statusEl.textContent = `✅ Unos ${pendingData.length}: ${data.product_name} (${data.quantity} ${data.unit})`;
                    statusEl.style.color = '#4CAF50';
                }
                
                // Sačuvaj
                saveData(data);
            } else {
                if (statusEl) {
                    statusEl.textContent = '⚠️ Nije prepoznat proizvod';
                    statusEl.style.color = '#FF9800';
                }
            }
        }
        
        // Resetuj
        currentText = '';
        currentItem = '';
        isProcessing = false;
        
        // Otvori zalihe (mikrofon i dalje radi)
        setTimeout(() => {
            openInventoryScreen();
            if (statusEl) {
                statusEl.textContent = `✅ Ukupno uneto: ${pendingData.length} proizvoda. Mikrofon i dalje radi.`;
                statusEl.style.color = '#4CAF50';
            }
        }, 500);
        
        return;
    }
    
    // ===== AKO NEMA KOMANDE, SAKUPLJAJ TEKST =====
    // Ako nema "start", "plus" ili "end", samo akumuliraj tekst
    if (!/\b(start|plus|end|enter|kraj|gotovo|save|dodaj|sledeći|pokreni|započni|završi)\b/.test(lower)) {
        // Samo dodaj u trenutni unos
        if (currentItem) {
            currentItem += ' ' + currentText;
        } else {
            currentItem = currentText;
        }
        currentText = '';
    }
}

// ===== OBRADI TRENUTNI UNOS =====
function processCurrentItem() {
    if (!currentItem || currentItem.length < 2) return;
    
    const data = parseVoiceData(currentItem);
    if (data) {
        pendingData.push(data);
        console.log(`✅ Dodat unos ${pendingData.length}:`, data);
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = `✅ Unos ${pendingData.length}: ${data.product_name} (${data.quantity} ${data.unit}) - kažite "plus" za sledeći`;
            statusEl.style.color = '#4CAF50';
        }
        
        // Sačuvaj odmah
        saveData(data);
    } else {
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '⚠️ Nije prepoznat proizvod, pokušajte ponovo';
            statusEl.style.color = '#FF9800';
        }
    }
    
    currentItem = '';
}

// ===== PARSIRANJE PODATAKA =====
function parseVoiceData(text) {
    if (!text || text.length < 2) return null;
    
    // Očisti od komandi
    const clean = text
        .replace(/^(start|pokreni|započni|plus|dodaj|sledeći|end|enter|kraj|gotovo|save|završi)\s*/i, '')
        .trim();
    
    if (!clean || clean.length < 2) return null;
    
    const result = {
        product_name: '',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    const units = {
        'kg': 'kg', 'kilogram': 'kg', 'kilograma': 'kg',
        'g': 'g', 'gram': 'g', 'grama': 'g',
        'l': 'l', 'litar': 'l', 'litara': 'l',
        'kom': 'kom', 'komad': 'kom', 'komada': 'kom',
        'pak': 'pak', 'paket': 'pak', 'paketa': 'pak'
    };
    
    const storages = {
        'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
        'frižider': 'Frižider', 'frizider': 'Frižider',
        'ostava': 'Ostava', 'špajz': 'Ostava'
    };
    
    const numbers = {
        'jedan': '1', 'jedna': '1', 'jedno': '1',
        'dva': '2', 'dve': '2',
        'tri': '3',
        'četiri': '4', 'cetiri': '4',
        'pet': '5',
        'šest': '6', 'sest': '6',
        'sedam': '7',
        'osam': '8',
        'devet': '9',
        'deset': '10'
    };
    
    const words = clean.split(/\s+/);
    let nameParts = [];
    let i = 0;
    
    while (i < words.length) {
        const w = words[i].toLowerCase();
        let found = false;
        
        // Skladište
        for (let key in storages) {
            if (w.includes(key) || key.includes(w)) {
                result.storage = storages[key];
                found = true;
                i++;
                break;
            }
        }
        if (found) continue;
        
        // Jedinica
        if (units[w]) {
            result.unit = units[w];
            i++;
            continue;
        }
        
        // Broj
        let num = null;
        if (!isNaN(w)) {
            num = w;
        } else if (numbers[w]) {
            num = numbers[w];
        }
        
        if (num !== null) {
            if (result.quantity === '1') {
                result.quantity = num;
            } else {
                result.shelf_life = num;
            }
            i++;
            continue;
        }
        
        // Preskoči filler
        if (['u', 'za', 'na', 'rok', 'trajanje', 'mesec', 'meseci'].includes(w)) {
            i++;
            continue;
        }
        
        // Dodaj u naziv
        nameParts.push(words[i]);
        i++;
    }
    
    result.product_name = nameParts.join(' ').trim();
    
    if (!result.product_name || result.product_name.length < 2) {
        return null;
    }
    
    return result;
}

// ===== SAČUVAJ PODATKE =====
function saveData(data) {
    console.log('💾 Čuvam:', data.product_name);
    
    let saved = false;
    
    // Pokušaj sa postojećim funkcijama
    const saveFunctions = ['saveProduct', 'handleFormSubmit', 'addProduct'];
    for (let fn of saveFunctions) {
        if (typeof window[fn] === 'function') {
            try {
                window[fn]();
                saved = true;
                console.log(`✅ ${fn}() pozvan`);
                break;
            } catch(e) {
                console.warn(`${fn} greška:`, e);
            }
        }
    }
    
    // Rezervni metod
    if (!saved && typeof window.inventory !== 'undefined' && Array.isArray(window.inventory)) {
        const shelfLifeMonths = parseInt(data.shelf_life) || 12;
        const newItem = {
            id: Date.now() + Math.random() * 1000 + pendingData.length,
            productName: data.product_name,
            piece: parseInt(data.quantity) || 1,
            quantity: parseFloat(data.quantity) || 1,
            unit: data.unit || 'kom',
            shelfLife: shelfLifeMonths,
            storage: data.storage || 'Zamrzivač 1',
            dateAdded: new Date().toISOString(),
            expiryDate: new Date(Date.now() + shelfLifeMonths * 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        window.inventory.push(newItem);
        saved = true;
        console.log('✅ Dodato u inventory');
        
        // Osveži prikaz
        const renderFunctions = ['renderInventory', 'renderProductList', 'renderEntries'];
        for (let fn of renderFunctions) {
            if (typeof window[fn] === 'function') {
                try { window[fn](); } catch(e) {}
            }
        }
    }
    
    // Klik na dugme
    if (!saved) {
        const saveBtns = document.querySelectorAll('#saveProductBtn, button[type="submit"], .btn-save, .save-btn');
        for (let btn of saveBtns) {
            try {
                btn.click();
                saved = true;
                console.log('✅ Kliknuto dugme');
                break;
            } catch(e) {}
        }
    }
    
    return saved;
}

// ===== OTVORI ZALIHE =====
function openInventoryScreen() {
    console.log('📦 Otvaram zalihe');
    
    if (typeof refreshInventoryData === 'function') {
        refreshInventoryData();
    }
    
    hideVoiceMenu();
    
    if (typeof openInventoryAndShowHighlight === 'function') {
        openInventoryAndShowHighlight();
    } else if (typeof showScreen === 'function') {
        showScreen('inventoryScreen');
    } else {
        const inv = document.getElementById('inventoryScreen');
        const main = document.getElementById('mainScreen');
        const choice = document.getElementById('choiceScreen');
        
        if (inv) {
            if (main) main.style.display = 'none';
            if (choice) choice.style.display = 'none';
            inv.style.display = 'flex';
            inv.classList.add('active');
            console.log('✅ Zalihe otvorene');
        }
    }
}

// ===== POMOĆNE FUNKCIJE =====
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

function toggleMicrophone() {
    if (isListening) {
        isListening = false;
        if (recognition) {
            try { recognition.stop(); } catch(e) {}
            recognition = null;
        }
        updateMicrophoneButton(false);
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '⏸️ Mikrofon isključen';
            statusEl.style.color = '#aaa';
        }
    } else {
        initMicrophone();
    }
}

function updateMicrophoneButton(isActive) {
    const voiceBtn = document.querySelector('[onclick="toggleMicrophone()"]');
    if (voiceBtn) {
        if (isActive) {
            voiceBtn.textContent = '🎤 ISKLJUČI MIKROFON';
            voiceBtn.style.background = '#f44336';
            voiceBtn.style.color = 'white';
        } else {
            voiceBtn.textContent = '🎤 UKLJUČI MIKROFON';
            voiceBtn.style.background = '#4CAF50';
            voiceBtn.style.color = 'white';
        }
    }
}

function goBackFromVoice() {
    if (typeof showScreen === 'function') {
        showScreen('choiceScreen');
    }
}

// ===== AUTO-START =====
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initMicrophone();
    }, 1000);
});

// ===== GLOBALNE FUNKCIJE =====
window.initMicrophone = initMicrophone;
window.toggleMicrophone = toggleMicrophone;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.otvoriZaliheEkran = openInventoryScreen;

console.log('✅ VOICE - SEQUENTIAL verzija učitana!');
console.log('🎯 Reci "Start" za prvi unos');
console.log('➕ Reci "Plus" za sledeći unos');
console.log('🏁 Reci "End" za kraj i otvaranje zaliha');
console.log('🔄 Mikrofon je uvek aktivan!');
