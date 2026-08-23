// ============================================
// VOICE COMMANDS - JEDNOSTAVNA VERZIJA SA KRATKIM REČIMA
// ============================================

// Proveri da li već postoji pre nego što deklarišeš
if (typeof activeBuffer === 'undefined') {
    var activeBuffer = '';
}
if (typeof recognition === 'undefined') {
    var recognition = null;
}
if (typeof lastSavedData === 'undefined') {
    var lastSavedData = null;
}
if (typeof isProcessingCommand === 'undefined') {
    var isProcessingCommand = false;
}
if (typeof END_AKTIVAN === 'undefined') {
    var END_AKTIVAN = false;
}
if (typeof isVoiceInput === 'undefined') {
    var isVoiceInput = false;
}
if (typeof currentVoiceLang === 'undefined') {
    var currentVoiceLang = 'sr-RS';
}

// ============================================
// JEDNOSTAVNE KOMANDE ZA SVAKI JEZIK (1-2 sloga)
// ============================================

const VOICE_COMMANDS = {
    // ⭐ Samo JEDNA reč po funkciji za lakše prepoznavanje
    sr: {
        list: 'spisak',      // otvara spisak
        stock: 'zalihe',     // otvara zalihe
        add: 'dodaj',        // dodaje unos
        end: 'kraj',         // završava
        start: 'unos'        // počinje unos
    },
    hu: {
        list: 'lista',       // ⭐ KRATKO - otvara spisak
        stock: 'készlet',    // ⭐ KRATKO - otvara zalihe  
        add: 'add',          // ⭐ KRATKO - dodaje unos
        end: 'vége',         // ⭐ KRATKO - završava
        start: 'adat'        // ⭐ KRATKO - počinje unos (adat = podatak)
    },
    en: {
        list: 'list',
        stock: 'stock',
        add: 'add',
        end: 'end',
        start: 'start'
    },
    de: {
        list: 'liste',
        stock: 'lager',
        add: 'add',
        end: 'ende',
        start: 'start'
    },
    uk: {
        list: 'список',
        stock: 'склад',
        add: 'додати',
        end: 'кінець',
        start: 'ввід'
    },
    ru: {
        list: 'список',
        stock: 'склад',
        add: 'добавить',
        end: 'конец',
        start: 'ввод'
    },
    zh: {
        list: '列表',
        stock: '库存',
        add: '添加',
        end: '结束',
        start: '开始'
    },
    es: {
        list: 'lista',
        stock: 'stock',
        add: 'añadir',
        end: 'fin',
        start: 'inicio'
    },
    pt: {
        list: 'lista',
        stock: 'estoque',
        add: 'adicionar',
        end: 'fim',
        start: 'início'
    },
    fr: {
        list: 'liste',
        stock: 'stock',
        add: 'ajouter',
        end: 'fin',
        start: 'début'
    }
};

// ============================================
// POMOĆNE FUNKCIJE ZA JEZIK
// ============================================

function getVoiceCommands() {
    const lang = typeof currentLang !== 'undefined' ? currentLang : 'sr';
    return VOICE_COMMANDS[lang] || VOICE_COMMANDS['sr'];
}

// Dohvati komandu za određenu funkciju
function getCommandWord(type) {
    const commands = getVoiceCommands();
    return commands[type] || '';
}

// ============================================
// AŽURIRANJE 4. EKRANA SA KOMANDAMA
// ============================================

function updateVoiceMenuCommands() {
    const lang = typeof currentLang !== 'undefined' ? currentLang : 'sr';
    const commands = getVoiceCommands();
    
    // Ažuriraj tekst na dugmetu za spisak
    const listBtn = document.getElementById('voiceListBtn');
    if (listBtn) {
        listBtn.textContent = `📋 ${commands.list || 'Spisak'}`;
        listBtn.title = `Izgovorite: "${commands.list || 'spisak'}"`;
    }
    
    // Ažuriraj tekst na dugmetu za zalihe
    const stockBtn = document.getElementById('voiceStockBtn');
    if (stockBtn) {
        stockBtn.textContent = `📦 ${commands.stock || 'Zalihe'}`;
        stockBtn.title = `Izgovorite: "${commands.stock || 'zalihe'}"`;
    }
    
    // Ažuriraj tekst na dugmetu za dodavanje
    const addBtn = document.getElementById('voiceAddBtn');
    if (addBtn) {
        addBtn.textContent = `✅ ${commands.add || 'Dodaj'}`;
        addBtn.title = `Izgovorite: "${commands.add || 'dodaj'}"`;
    }
    
    // Ažuriraj tekst na dugmetu za kraj
    const endBtn = document.getElementById('voiceEndBtn');
    if (endBtn) {
        endBtn.textContent = `🏁 ${commands.end || 'Kraj'}`;
        endBtn.title = `Izgovorite: "${commands.end || 'kraj'}"`;
    }
    
    // Ažuriraj tekst na dugmetu za start
    const startBtn = document.getElementById('voiceStartBtn');
    if (startBtn) {
        startBtn.textContent = `🎤 ${commands.start || 'Unos'}`;
        startBtn.title = `Izgovorite: "${commands.start || 'unos'}"`;
    }
    
    // Ažuriraj statusnu poruku na 4. ekranu
    const statusMsg = document.getElementById('voiceStatusMessage');
    if (statusMsg) {
        const messages = {
            sr: `Izgovorite: "${commands.list}" za spisak, "${commands.stock}" za zalihe, "${commands.add}" za dodavanje, "${commands.end}" za kraj`,
            hu: `Mondd: "${commands.list}" a listához, "${commands.stock}" a készlethez, "${commands.add}" a hozzáadáshoz, "${commands.end}" a befejezéshez`,
            en: `Say: "${commands.list}" for list, "${commands.stock}" for stock, "${commands.add}" to add, "${commands.end}" to finish`,
            de: `Sage: "${commands.list}" für Liste, "${commands.stock}" für Bestand, "${commands.add}" zum Hinzufügen, "${commands.end}" zum Beenden`,
            uk: `Скажіть: "${commands.list}" для списку, "${commands.stock}" для складу, "${commands.add}" для додавання, "${commands.end}" для завершення`,
            ru: `Скажите: "${commands.list}" для списка, "${commands.stock}" для склада, "${commands.add}" для добавления, "${commands.end}" для завершения`,
            zh: `说: "${commands.list}" 列表, "${commands.stock}" 库存, "${commands.add}" 添加, "${commands.end}" 结束`,
            es: `Diga: "${commands.list}" para lista, "${commands.stock}" para stock, "${commands.add}" para añadir, "${commands.end}" para fin`,
            pt: `Diga: "${commands.list}" para lista, "${commands.stock}" para estoque, "${commands.add}" para adicionar, "${commands.end}" para fim`,
            fr: `Dites: "${commands.list}" pour liste, "${commands.stock}" pour stock, "${commands.add}" pour ajouter, "${commands.end}" pour fin`
        };
        statusMsg.textContent = messages[lang] || messages.sr;
    }
}

// ============================================
// POBOLJŠANO PREPOZNAVANJE - SAMO JEDNA REČ
// ============================================

function detectCommand(text) {
    if (!text) return null;
    const lower = text.toLowerCase().trim();
    const commands = getVoiceCommands();
    
    // Proveri svaku komandu
    const commandTypes = ['list', 'stock', 'add', 'end', 'start'];
    for (let type of commandTypes) {
        const word = commands[type];
        if (word && lower.includes(word.toLowerCase())) {
            return type;
        }
    }
    
    // Proveri i varijacije (bez dijakritika)
    const simpleText = lower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (let type of commandTypes) {
        const word = commands[type];
        if (word) {
            const simpleWord = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            if (simpleText.includes(simpleWord)) {
                return type;
            }
        }
    }
    
    return null;
}

// ============================================
// OTVARANJE EKRANA
// ============================================

function otvoriSpisakEkran() {
    console.log('📋 Otvaram spisak...');
    if (typeof refreshInventoryData === 'function') refreshInventoryData();
    if (typeof prikaziSveUnose === 'function') prikaziSveUnose();
    if (typeof renderInventory === 'function') renderInventory();
    
    setTimeout(() => {
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
        showVoiceStatus('📋 Spisak otvoren', '#4CAF50');
    }, 200);
}

function otvoriZaliheEkran() {
    console.log('📦 Otvaram zalihe...');
    if (typeof refreshInventoryData === 'function') refreshInventoryData();
    
    setTimeout(() => {
        if (typeof renderInventory === 'function') renderInventory();
        if (typeof renderProductList === 'function') renderProductList();
        if (typeof renderEntries === 'function') renderEntries();
        if (typeof loadInventory === 'function') loadInventory();
        if (typeof updateInventory === 'function') updateInventory();
    }, 100);
    
    setTimeout(() => {
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
        showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
    }, 200);
}

// ============================================
// PARSIRANJE - JEDNOSTAVNO
// ============================================

function parseVoiceDataEntry(command) {
    console.log('🔍 PARSIRAM:', command);
    
    // Ukloni komandne reči
    const commands = getVoiceCommands();
    const commandWords = Object.values(commands);
    let text = command;
    for (let word of commandWords) {
        if (word) {
            text = text.replace(new RegExp(word, 'gi'), '');
        }
    }
    text = text.trim();
    
    // Ako je prazno, uzmi ceo command
    if (!text) text = command;
    
    let result = {
        product_name: text || 'Proizvod',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    // Pokušaj da nađeš brojeve
    const numbers = text.match(/\d+/g);
    if (numbers) {
        if (numbers.length >= 2) {
            result.piece = numbers[0];
            result.quantity = numbers[1];
        } else if (numbers.length === 1) {
            result.piece = numbers[0];
            result.quantity = numbers[0];
        }
        // Ukloni brojeve iz naziva
        result.product_name = text.replace(/\d+/g, '').trim() || 'Proizvod';
    }
    
    console.log('✅ PARSIRANO:', result);
    return result;
}

// ============================================
// POPUNJAVANJE FORME I ČUVANJE
// ============================================

function popuniFormuPodacima(data) {
    console.log('📝 Popunjavam formu:', data);
    
    setTimeout(() => {
        const productInput = document.getElementById('productInput');
        if (productInput) {
            productInput.value = data.product_name || '';
            productInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        const pieceInput = document.getElementById('pieceInput');
        if (pieceInput) {
            pieceInput.value = data.piece || '1';
            pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        const quantityInput = document.getElementById('quantityInput');
        if (quantityInput) {
            quantityInput.value = data.quantity || '1';
            quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        showVoiceStatus(`✅ Uneto: ${data.product_name}`, '#4CAF50');
    }, 300);
}

function sacuvajPodatke(data) {
    console.log('💾 Čuvam podatke:', data);
    isVoiceInput = true;
    window._isVoiceInput = true;
    
    let saved = false;
    
    if (typeof saveProduct === 'function') {
        try { saveProduct(); saved = true; } catch(e) {}
    }
    if (!saved && typeof handleFormSubmit === 'function') {
        try { handleFormSubmit(); saved = true; } catch(e) {}
    }
    if (!saved && typeof addProduct === 'function') {
        try { addProduct(); saved = true; } catch(e) {}
    }
    if (!saved && typeof window.inventory !== 'undefined' && Array.isArray(window.inventory)) {
        const newItem = {
            id: Date.now(),
            productName: data.product_name,
            piece: parseInt(data.piece) || 1,
            quantity: parseFloat(data.quantity) || 1,
            unit: data.unit || 'kom',
            shelfLife: parseInt(data.shelf_life) || 12,
            storage: data.storage || 'Zamrzivač 1',
            dateAdded: new Date().toISOString(),
            expiryDate: new Date(Date.now() + parseInt(data.shelf_life || 12) * 30 * 24 * 60 * 60 * 1000).toISOString(),
            isNew: true
        };
        window.inventory.push(newItem);
        saved = true;
    }
    
    if (saved) {
        showVoiceStatus(`✅ Sačuvano: ${data.product_name}`, '#4CAF50');
        setTimeout(() => {
            if (typeof prikaziSveUnose === 'function') prikaziSveUnose();
            if (typeof renderInventory === 'function') renderInventory();
        }, 50);
    }
    
    setTimeout(() => {
        isVoiceInput = false;
        window._isVoiceInput = false;
    }, 1000);
}

function processAndSaveItem(command) {
    let data = parseVoiceDataEntry(command);
    if (!data.product_name || data.product_name === 'Proizvod' || data.product_name.length < 1) {
        showVoiceStatus('❌ Nisam prepoznao proizvod', '#f44336');
        return false;
    }
    
    lastSavedData = data;
    
    hideVoiceMenu();
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    
    setTimeout(() => {
        popuniFormuPodacima(data);
        setTimeout(() => sacuvajPodatke(data), 200);
    }, 100);

    return true;
}

// ============================================
// START VOICE RECOGNITION - JEDNOSTAVNA DETEKCIJA
// ============================================

function startVoiceRecognition() {
    console.log('🎤 startVoiceRecognition POZVAN!');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showVoiceStatus('❌ Browser ne podržava glasovno prepoznavanje.', '#f44336');
        return;
    }

    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }

    recognition = new SpeechRecognition();
    recognition.lang = currentVoiceLang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 5;

    isProcessingCommand = false;

    recognition.onstart = function() {
        console.log('🎤 MIKROFON AKTIVAN!');
        const commands = getVoiceCommands();
        const lang = typeof currentLang !== 'undefined' ? currentLang : 'sr';
        const messages = {
            sr: `🎤 Slušam... Izgovorite: "${commands.list}" za spisak, "${commands.stock}" za zalihe, "${commands.add}" za dodavanje, "${commands.end}" za kraj`,
            hu: `🎤 Hallgatok... Mondd: "${commands.list}" a listához, "${commands.stock}" a készlethez, "${commands.add}" a hozzáadáshoz, "${commands.end}" a befejezéshez`,
            en: `🎤 Listening... Say: "${commands.list}" for list, "${commands.stock}" for stock, "${commands.add}" to add, "${commands.end}" to finish`,
            de: `🎤 Ich höre... Sage: "${commands.list}" für Liste, "${commands.stock}" für Bestand, "${commands.add}" zum Hinzufügen, "${commands.end}" zum Beenden`,
            uk: `🎤 Слухаю... Скажіть: "${commands.list}" для списку, "${commands.stock}" для складу, "${commands.add}" для додавання, "${commands.end}" для завершення`,
            ru: `🎤 Слушаю... Скажите: "${commands.list}" для списка, "${commands.stock}" для склада, "${commands.add}" для добавления, "${commands.end}" для завершения`,
            zh: `🎤 正在听... 说: "${commands.list}" 列表, "${commands.stock}" 库存, "${commands.add}" 添加, "${commands.end}" 结束`,
            es: `🎤 Escuchando... Diga: "${commands.list}" para lista, "${commands.stock}" para stock, "${commands.add}" para añadir, "${commands.end}" para fin`,
            pt: `🎤 Ouvindo... Diga: "${commands.list}" para lista, "${commands.stock}" para estoque, "${commands.add}" para adicionar, "${commands.end}" para fim`,
            fr: `🎤 J'écoute... Dites: "${commands.list}" pour liste, "${commands.stock}" pour stock, "${commands.add}" pour ajouter, "${commands.end}" pour fin`
        };
        showVoiceStatus(messages[lang] || messages.sr, '#2196F3');
        activeBuffer = '';
        isProcessingCommand = false;
    };

    recognition.onresult = function(event) {
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
            activeBuffer = finalText;
            console.log('🗣️ REČENO:', activeBuffer);
            
            // DETEKTUJ KOMANDU
            const commandType = detectCommand(activeBuffer);
            console.log('🔍 KOMANDA:', commandType);
            
            if (commandType && !isProcessingCommand) {
                isProcessingCommand = true;
                
                // Ukloni komandnu reč iz teksta
                const commands = getVoiceCommands();
                const commandWord = commands[commandType];
                let itemText = activeBuffer;
                if (commandWord) {
                    itemText = activeBuffer.replace(new RegExp(commandWord, 'gi'), '').trim();
                }
                
                switch (commandType) {
                    case 'list':
                        console.log('📋 SPISAK KOMANDA');
                        showVoiceStatus('📋 Otvaram spisak...', '#4CAF50');
                        if (itemText.length > 1) processAndSaveItem(itemText);
                        activeBuffer = '';
                        setTimeout(() => {
                            stopVoiceRecognition();
                            setTimeout(() => otvoriSpisakEkran(), 300);
                        }, 200);
                        break;
                        
                    case 'stock':
                        console.log('📦 ZALIHE KOMANDA');
                        showVoiceStatus('📦 Otvaram zalihe...', '#4CAF50');
                        if (itemText.length > 1) processAndSaveItem(itemText);
                        activeBuffer = '';
                        setTimeout(() => {
                            stopVoiceRecognition();
                            setTimeout(() => otvoriZaliheEkran(), 300);
                        }, 200);
                        break;
                        
                    case 'add':
                        console.log('✅ DODAVANJE KOMANDA');
                        if (itemText.length > 1) {
                            processAndSaveItem(itemText);
                        } else {
                            showVoiceStatus('✅ Recite naziv proizvoda pa "dodaj"', '#FFD700');
                            isProcessingCommand = false;
                        }
                        activeBuffer = '';
                        setTimeout(() => {
                            if (typeof prikaziSveUnose === 'function') prikaziSveUnose();
                            isProcessingCommand = false;
                        }, 500);
                        break;
                        
                    case 'end':
                        console.log('🏁 KRAJ KOMANDA');
                        showVoiceStatus('✅ Unos završen', '#4CAF50');
                        if (itemText.length > 1) processAndSaveItem(itemText);
                        activeBuffer = '';
                        setTimeout(() => {
                            isProcessingCommand = false;
                        }, 500);
                        break;
                        
                    case 'start':
                        console.log('🎤 START KOMANDA');
                        showVoiceStatus('🎤 Počinjemo unos...', '#4CAF50');
                        hideVoiceMenu();
                        const mainScreen = document.getElementById('mainScreen');
                        if (mainScreen) {
                            mainScreen.style.display = 'flex';
                            mainScreen.classList.add('active');
                        }
                        if (itemText.length > 1) processAndSaveItem(itemText);
                        activeBuffer = '';
                        setTimeout(() => {
                            isProcessingCommand = false;
                        }, 500);
                        break;
                }
            }
        }
        
        // Prikaži šta se čuje
        const displayText = activeBuffer || interimText;
        if (displayText) {
            showVoiceStatus(`🎤 "${displayText}"`, '#FFD700');
        }
    };

    recognition.onerror = function(event) {
        console.error('⚠️ Greška:', event.error);
        if (event.error === 'not-allowed') {
            showVoiceStatus('❌ Dozvolite mikrofon.', '#f44336');
        } else if (event.error === 'no-speech') {
            showVoiceStatus('⚠️ Nisam čuo govor.', '#FF9800');
        }
        isProcessingCommand = false;
    };

    recognition.onend = function() {
        console.log('🎤 Prepoznavanje završeno.');
        isProcessingCommand = false;
    };

    try {
        recognition.start();
        console.log('✅ Mikrofon pokrenut!');
    } catch(e) {
        console.error('❌ Greška:', e);
        showVoiceStatus('❌ Greška pri pokretanju', '#f44336');
    }
}

// ============================================
// OSTALE FUNKCIJE
// ============================================

function stopVoiceRecognition() {
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    activeBuffer = '';
    isProcessingCommand = false;
    showVoiceStatus('⏸️ Zaustavljeno', '#aaa');
}

function restartMicrophone() {
    console.log('🔄 Restartujem mikrofon...');
    stopVoiceRecognition();
    setTimeout(() => startVoiceRecognition(), 500);
}

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

function showVoiceStatus(text, color) {
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = text;
        if (color) statusEl.style.color = color;
    }
    console.log('[VOICE]', text);
}

function goBackFromVoice() {
    console.log('◀ goBackFromVoice POZVAN!');
    stopVoiceRecognition();
    
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    const choiceScreen = document.getElementById('choiceScreen');
    if (choiceScreen) {
        choiceScreen.style.display = 'flex';
        choiceScreen.classList.add('active');
    }
    
    if (typeof updateHeaderLanguage === 'function') updateHeaderLanguage();
    if (typeof updateInterfaceLanguage === 'function') updateInterfaceLanguage();
}

function selectVoiceMode() {
    console.log('🎤 selectVoiceMode POZVAN!');
    
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    const voiceMenuScreen = document.getElementById('voiceMenuScreen');
    if (voiceMenuScreen) {
        voiceMenuScreen.style.display = 'flex';
        voiceMenuScreen.classList.add('active');
        console.log('✅ Voice menu prikazan');
        
        // Ažuriraj dugmad sa komandama
        setTimeout(() => updateVoiceMenuCommands(), 100);
    }
    
    setTimeout(() => {
        console.log('🎤 Pokrećem VOICE COMMANDS...');
        startVoiceRecognition();
    }, 500);
}

// ============================================
// ZABRANA OTVARANJA
// ============================================

(function() {
    console.log('🔥 BLOKIRAM OTVARANJE ZALIHA IZ VOICE KOMANDI!');
    
    const originalRenderInventory = window.renderInventory;
    const originalShowScreen = window.showScreen;
    const originalOpenInventory = window.openInventoryAndShowHighlight;
    
    window.renderInventory = function() {
        const stack = new Error().stack || '';
        const allowed = ['goBackFromVoice', 'selectVoiceMode', 'otvoriZaliheEkran', 'otvoriSpisakEkran', 'startVoiceRecognition'];
        if (allowed.some(fn => stack.includes(fn))) {
            if (typeof originalRenderInventory === 'function') {
                return originalRenderInventory.apply(this, arguments);
            }
        }
        const blocked = ['sacuvajPodatke', 'processAndSaveItem', 'saveProduct', 'handleFormSubmit', 'addProduct'];
        if (blocked.some(fn => stack.includes(fn))) {
            console.log('⛔ BLOKIRANO: renderInventory');
            return;
        }
        if (typeof originalRenderInventory === 'function') {
            return originalRenderInventory.apply(this, arguments);
        }
    };
    
    window.showScreen = function(screenId) {
        const stack = new Error().stack || '';
        const allowed = ['goBackFromVoice', 'selectVoiceMode', 'otvoriZaliheEkran', 'otvoriSpisakEkran', 'startVoiceRecognition'];
        if (allowed.some(fn => stack.includes(fn))) {
            if (typeof originalShowScreen === 'function') {
                return originalShowScreen.apply(this, arguments);
            }
        }
        const blocked = ['sacuvajPodatke', 'processAndSaveItem'];
        if (blocked.some(fn => stack.includes(fn)) && 
            (screenId === 'inventoryScreen' || screenId === 'mainScreen')) {
            console.log('⛔ BLOKIRANO: showScreen(' + screenId + ')');
            return;
        }
        if (typeof originalShowScreen === 'function') {
            return originalShowScreen.apply(this, arguments);
        }
    };
    
    window.openInventoryAndShowHighlight = function() {
        const stack = new Error().stack || '';
        const allowed = ['goBackFromVoice', 'selectVoiceMode', 'otvoriZaliheEkran', 'otvoriSpisakEkran', 'startVoiceRecognition'];
        if (allowed.some(fn => stack.includes(fn))) {
            if (typeof originalOpenInventory === 'function') {
                return originalOpenInventory.apply(this, arguments);
            }
        }
        if (stack.includes('sacuvajPodatke')) {
            console.log('⛔ BLOKIRANO: openInventoryAndShowHighlight');
            return;
        }
        if (typeof originalOpenInventory === 'function') {
            return originalOpenInventory.apply(this, arguments);
        }
    };
    
    console.log('✅ Otvaranje zaliha BLOKIRANO za voice komande!');
})();

// ============================================
// TEST FUNKCIJA
// ============================================

window.testVoiceCommand = function(text) {
    console.log('🧪 TEST:', text);
    const type = detectCommand(text);
    console.log('🔍 DETEKTOVANO:', type);
    const commands = getVoiceCommands();
    console.log('📋 KOMANDE:', commands);
    return { text, detected: type, commands };
};

// ============================================
// IZVOZ SVIH FUNKCIJA
// ============================================

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.selectVoiceMode = selectVoiceMode;
window.restartMicrophone = restartMicrophone;
window.otvoriSpisakEkran = otvoriSpisakEkran;
window.otvoriZaliheEkran = otvoriZaliheEkran;
window.updateVoiceLanguage = updateVoiceLanguage;
window.getVoiceCommands = getVoiceCommands;
window.getCommandWord = getCommandWord;
window.VOICE_COMMANDS = VOICE_COMMANDS;
window.updateVoiceMenuCommands = updateVoiceMenuCommands;
window.testVoiceCommand = testVoiceCommand;

console.log('✅ VOICE COMMANDS - JEDNOSTAVNA VERZIJA UČITANA!');
console.log('📋 Samo JEDNA reč po funkciji za lakše prepoznavanje');
console.log('🧪 Testiraj sa: testVoiceCommand("lista")');
