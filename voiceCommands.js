// ============================================
// VOICE COMMANDS - SIMPLE MOBILE SOLUTION
// ============================================

let recognition = null;
let isListening = false;
let voiceData = '';

// ===== JEDNOSTAVNA FUNKCIJA ZA GLASOVNI UNOS =====
function startVoiceRecognition() {
    // Ako već sluša, zaustavi
    if (isListening) {
        stopVoiceRecognition();
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        if (typeof showModernAlert === 'function') {
            showModernAlert('Greška', 'Vaš pretraživač ne podržava glasovne komande.', '❌');
        }
        return;
    }

    // Očisti prethodni
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
    recognition.continuous = false;
    recognition.interimResults = false; // SAMO FINALNE REZULTATE
    recognition.maxAlternatives = 1;

    const statusEl = document.getElementById('voiceStatus');
    
    // Promeni dugme
    const voiceBtn = document.querySelector('[onclick="startVoiceRecognition()"]');
    if (voiceBtn) {
        voiceBtn.textContent = '⏹️ Zaustavi';
        voiceBtn.style.background = '#f44336';
    }

    recognition.onstart = function() {
        console.log('🎤 Slušam...');
        isListening = true;
        voiceData = '';
        if (statusEl) {
            statusEl.textContent = '🎤 Slušam... Govorite (završite sa "end")';
            statusEl.style.color = '#4CAF50';
        }
        
        // Auto-stop posle 15 sekundi
        setTimeout(() => {
            if (isListening) {
                console.log('⏰ Auto-stop');
                stopVoiceRecognition();
            }
        }, 15000);
    };

    recognition.onresult = function(event) {
        console.log('📝 Rezultat stigao');
        
        let finalText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                finalText += event.results[i][0].transcript.trim() + ' ';
            }
        }
        
        if (finalText) {
            voiceData += finalText;
            console.log('🗣️ CEO TEKST:', voiceData);
            
            if (statusEl) {
                statusEl.textContent = `📝 "${voiceData}"`;
                statusEl.style.color = '#FF9800';
            }
            
            // ODMAH PROVERI DA LI IMA "END"
            if (/\b(end|enter|kraj|stop)\b/i.test(voiceData)) {
                console.log('✅ END DETEKTOVAN!');
                
                // Izdvoji tekst pre "end"
                const cleanText = voiceData.replace(/\b(end|enter|kraj|stop)\b/i, '').trim();
                console.log('📦 ČIST TEKST:', cleanText);
                
                if (cleanText.length > 2) {
                    // OBRADI ODMAH
                    processVoiceCommand(cleanText);
                } else {
                    console.warn('⚠️ Tekst prekratak');
                    if (statusEl) {
                        statusEl.textContent = '⚠️ Nema podataka za unos';
                        statusEl.style.color = '#f44336';
                    }
                }
                
                // Zaustavi prepoznavanje
                stopVoiceRecognition();
                return;
            }
            
            // Proveri za "unos" komandu
            if (/\b(unos|unesi|dodaj|add)\b/i.test(voiceData)) {
                console.log('📝 UNOS KOMANDA');
                hideVoiceMenu();
                const mainScreen = document.getElementById('mainScreen');
                if (mainScreen) {
                    mainScreen.style.display = 'flex';
                    mainScreen.classList.add('active');
                    if (typeof renderDataEntry === 'function') renderDataEntry('');
                }
                stopVoiceRecognition();
                return;
            }
        }
    };

    recognition.onerror = function(event) {
        console.log('⚠️ Greška:', event.error);
        isListening = false;
        
        if (statusEl) {
            if (event.error === 'not-allowed') {
                statusEl.textContent = '❌ Dozvolite mikrofon';
                statusEl.style.color = '#f44336';
            } else if (event.error === 'no-speech') {
                statusEl.textContent = '⏳ Nema govora, pokušajte ponovo';
                statusEl.style.color = '#FF9800';
            } else {
                statusEl.textContent = `❌ Greška: ${event.error}`;
                statusEl.style.color = '#f44336';
            }
        }
        
        // Vrati dugme
        resetVoiceButton();
    };

    recognition.onend = function() {
        console.log('🎤 Prepoznavanje završeno');
        isListening = false;
        
        // Ako ima teksta a nije obrađeno
        if (voiceData && voiceData.length > 3 && !/\b(end|enter|kraj|stop)\b/i.test(voiceData)) {
            console.log('🔄 Onend sa tekstom:', voiceData);
            
            // Proveri da li je "unos" komanda
            if (/\b(unos|unesi|dodaj|add)\b/i.test(voiceData)) {
                hideVoiceMenu();
                const mainScreen = document.getElementById('mainScreen');
                if (mainScreen) {
                    mainScreen.style.display = 'flex';
                    mainScreen.classList.add('active');
                    if (typeof renderDataEntry === 'function') renderDataEntry('');
                }
            } else if (voiceData.length > 5) {
                // Očisti tekst od "unos" i sličnih
                const cleanText = voiceData
                    .replace(/^(unos|unesi|dodaj|add)\s*/i, '')
                    .trim();
                if (cleanText.length > 2) {
                    processVoiceCommand(cleanText);
                }
            }
            voiceData = '';
        }
        
        resetVoiceButton();
        
        if (statusEl && !statusEl.textContent.includes('✅')) {
            statusEl.textContent = '⏸️ Gotovo';
            statusEl.style.color = '#aaa';
        }
    };

    // POKRENI
    try {
        if (typeof navigator.mediaDevices !== 'undefined' && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => {
                    recognition.start();
                })
                .catch((err) => {
                    console.error('❌ Mikrofon:', err);
                    if (statusEl) {
                        statusEl.textContent = '❌ Greška mikrofona';
                        statusEl.style.color = '#f44336';
                    }
                    resetVoiceButton();
                });
        } else {
            recognition.start();
        }
    } catch(e) {
        console.error('❌ Greška:', e);
        resetVoiceButton();
    }
}

// ===== ZAUSTAVI =====
function stopVoiceRecognition() {
    if (recognition) {
        try {
            recognition.stop();
        } catch(e) {}
        recognition = null;
    }
    isListening = false;
    resetVoiceButton();
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '⏸️ Zaustavljeno';
        statusEl.style.color = '#aaa';
    }
}

// ===== RESET DUGME =====
function resetVoiceButton() {
    const voiceBtn = document.querySelector('[onclick="startVoiceRecognition()"]');
    if (voiceBtn) {
        voiceBtn.textContent = '🎤 Glasovni unos';
        voiceBtn.style.background = '';
    }
}

// ===== OBRADI GLASOVNU KOMANDU =====
function processVoiceCommand(command) {
    console.log('🔧 OBRADA:', command);
    
    const data = parseVoiceData(command);
    if (!data) {
        console.warn('⚠️ Nema podataka');
        updateStatus('⚠️ Nije prepoznat proizvod', '#f44336');
        return;
    }
    
    console.log('✅ Podaci:', data);
    
    // 1. Otvori Data Entry
    hideVoiceMenu();
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    
    // 2. Popuni formu
    fillForm(data);
    
    // 3. Sačuvaj
    setTimeout(() => {
        saveData(data);
        
        // 4. Otvori zalihe
        setTimeout(() => {
            openInventoryScreen();
        }, 500);
    }, 300);
}

// ===== PARSIRANJE =====
function parseVoiceData(text) {
    if (!text || text.length < 2) return null;
    
    // Ukloni nepotrebne reči
    let clean = text
        .replace(/^(unos|unesi|dodaj|add|start)\s*/i, '')
        .replace(/\b(plus|end|enter|kraj|stop)\b/gi, '')
        .trim();
    
    if (!clean) return null;
    
    const words = clean.split(/\s+/);
    
    const result = {
        product_name: '',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    // Mape
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
    
    let nameParts = [];
    let i = 0;
    
    while (i < words.length) {
        const w = words[i].toLowerCase();
        
        // Proveri skladište
        let found = false;
        for (let key in storages) {
            if (w.includes(key) || key.includes(w)) {
                result.storage = storages[key];
                found = true;
                i++;
                break;
            }
        }
        if (found) continue;
        
        // Proveri jedinicu
        if (units[w]) {
            result.unit = units[w];
            i++;
            continue;
        }
        
        // Proveri broj
        let num = null;
        if (!isNaN(w)) {
            num = w;
        } else if (numbers[w]) {
            num = numbers[w];
        }
        
        if (num !== null) {
            // Prvi broj je količina
            if (result.quantity === '1') {
                result.quantity = num;
            } else {
                // Drugi broj je rok trajanja
                result.shelf_life = num;
            }
            i++;
            continue;
        }
        
        // Preskoči filler reči
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

// ===== POPUNI FORMU =====
function fillForm(data) {
    console.log('📝 Popunjavam:', data);
    
    const fields = {
        'productInput': data.product_name,
        'pieceInput': data.quantity,
        'quantityInput': data.quantity,
        'shelfLifeInput': data.shelf_life
    };
    
    for (let [id, value] of Object.entries(fields)) {
        const el = document.getElementById(id);
        if (el) {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    
    // Jedinica
    const unitSelect = document.getElementById('unitSelect');
    if (unitSelect) {
        for (let option of unitSelect.options) {
            if (option.value === data.unit || option.text.toLowerCase().includes(data.unit)) {
                option.selected = true;
                unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }
    
    // Skladište
    const storageSelect = document.getElementById('storageSelect');
    if (storageSelect) {
        for (let option of storageSelect.options) {
            if (option.value === data.storage || option.text.includes(data.storage)) {
                option.selected = true;
                storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }
    
    // Update expiry
    if (typeof updateExpiryDate === 'function') {
        try { updateExpiryDate(); } catch(e) {}
    }
    
    updateStatus(`✅ ${data.product_name} (${data.quantity} ${data.unit})`, '#4CAF50');
}

// ===== SAČUVAJ =====
function saveData(data) {
    console.log('💾 Čuvam...');
    
    let saved = false;
    
    // Pokušaj sa postojećim funkcijama
    const functions = ['saveProduct', 'handleFormSubmit', 'addProduct'];
    for (let fn of functions) {
        if (typeof window[fn] === 'function') {
            try {
                window[fn]();
                saved = true;
                console.log(`✅ ${fn}() pozvan`);
                break;
            } catch(e) {}
        }
    }
    
    // Rezervni metod
    if (!saved && window.inventory) {
        const newItem = {
            id: Date.now() + Math.random() * 1000,
            productName: data.product_name,
            piece: parseInt(data.quantity) || 1,
            quantity: parseFloat(data.quantity) || 1,
            unit: data.unit || 'kom',
            shelfLife: parseInt(data.shelf_life) || 12,
            storage: data.storage || 'Zamrzivač 1',
            dateAdded: new Date().toISOString(),
            expiryDate: new Date(Date.now() + (parseInt(data.shelf_life) || 12) * 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        window.inventory.push(newItem);
        saved = true;
        console.log('✅ Dodato u inventory');
        
        // Osveži prikaz
        ['renderInventory', 'renderProductList', 'renderEntries'].forEach(fn => {
            if (typeof window[fn] === 'function') {
                try { window[fn](); } catch(e) {}
            }
        });
    }
    
    // Klik na dugme
    if (!saved) {
        const btns = document.querySelectorAll('#saveProductBtn, button[type="submit"], .btn-save');
        for (let btn of btns) {
            try { btn.click(); saved = true; break; } catch(e) {}
        }
    }
    
    if (saved) {
        updateStatus(`✅ Sačuvano: ${data.product_name}`, '#4CAF50');
        console.log('✅ Sačuvano!');
    } else {
        updateStatus('❌ Greška pri čuvanju!', '#f44336');
    }
}

// ===== OTVORI ZALIHE =====
function openInventoryScreen() {
    console.log('📦 Otvaram zalihe...');
    
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

function updateStatus(message, color) {
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.style.color = color || '#aaa';
    }
}

function goBackFromVoice() {
    stopVoiceRecognition();
    if (typeof showScreen === 'function') {
        showScreen('choiceScreen');
    }
}

// ===== GLOBALNE FUNKCIJE =====
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.processVoiceCommand = processVoiceCommand;
window.otvoriZaliheEkran = openInventoryScreen;

console.log('✅ VOICE - JEDNOSTAVNA verzija učitana!');
console.log('🎤 Pritisnite dugme, govorite, završite sa "end"');
