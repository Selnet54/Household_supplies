// ============================================
// VOICE COMMANDS - POBOLJŠANA VERZIJA SA KOREKCIJAMA
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
// POBOLJŠANO PREPOZNAVANJE - KOREKCIJA TEKSTA
// ============================================

const SPEECH_CORRECTIONS = {
    // Mađarske korekcije
    'adatbevitel': 'bevitel',
    'adat bevitel': 'bevitel',
    'adatbevitelt': 'bevitel',
    'bevittelt': 'bevitel',
    'bevittelen': 'bevitel',
    'bevitelt': 'bevitel',
    'bevittelek': 'bevitel',
    'addatbevitel': 'bevitel',
    'add bevitel': 'bevitel',
    'hozzaadas': 'hozzáad',
    'hozzaad': 'hozzáad',
    'hozzadas': 'hozzáad',
    'hozzad': 'hozzáad',
    'mentes': 'mentés',
    'mentesre': 'mentés',
    'rogzites': 'rögzít',
    'rogzit': 'rögzít',
    'rogzitesre': 'rögzít',
    'keszlet': 'készlet',
    'keszletet': 'készlet',
    'raktar': 'raktár',
    'raktarat': 'raktár',
    'listat': 'lista',
    'jegyzek': 'jegyzék',
    'jegyzeket': 'jegyzék',
    'termeklista': 'terméklista',
    'termeklistat': 'terméklista',
    'leltar': 'leltár',
    'leltarat': 'leltár',
    'attekintes': 'áttekintés',
    'raktarkeszlet': 'raktárkészlet',
    
    // Srpske korekcije
    'zalih': 'zalihe',
    'zaliha': 'zalihe',
    'spisak': 'spisak',
    'spiska': 'spisak',
    'popis': 'spisak',
    'inventar': 'spisak',
    
    // Engleske korekcije
    'inventori': 'inventory',
    'inventery': 'inventory',
    'stock': 'stock',
    'list': 'list',
    'liste': 'list',
    'catalog': 'catalog',
    
    // Nemačke korekcije
    'bestand': 'bestand',
    'lager': 'lager',
    'liste': 'liste',
    'inventar': 'inventar',
    
    // Opšte korekcije
    'add': 'add',
    'save': 'save',
    'end': 'end',
    'done': 'done',
    'plus': 'plus',
    'enter': 'enter'
};

function correctSpeechText(text) {
    if (!text) return '';
    let corrected = text.toLowerCase().trim();
    
    for (let [wrong, right] of Object.entries(SPEECH_CORRECTIONS)) {
        const regex = new RegExp('\\b' + wrong + '\\b', 'gi');
        corrected = corrected.replace(regex, right);
    }
    
    corrected = corrected.replace(/\s+/g, ' ').trim();
    return corrected;
}

function containsKeyword(text, keywords) {
    if (!text || !keywords) return false;
    const lowerText = text.toLowerCase();
    for (let keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
            return true;
        }
    }
    return false;
}

function findKeywordIndex(text, keywords) {
    if (!text || !keywords) return -1;
    const lowerText = text.toLowerCase();
    let firstIndex = Infinity;
    
    for (let keyword of keywords) {
        const idx = lowerText.indexOf(keyword.toLowerCase());
        if (idx !== -1 && idx < firstIndex) {
            firstIndex = idx;
        }
    }
    
    return firstIndex === Infinity ? -1 : firstIndex;
}

// ============================================
// REČNIK ZA VOICE KOMANDE NA SVIH 10 JEZIKA
// ============================================

const VOICE_COMMANDS = {
    sr: {
        inventory: ['spisak', 'popis', 'inventar', 'lista', 'pregled'],
        stock: ['zalihe', 'zaliha', 'stanje', 'skladište', 'magacin'],
        end: ['end', 'kraj', 'gotovo', 'enter', 'završi'],
        plus: ['plus', 'dodaj', 'unesi', 'snimi', 'sačuvaj'],
        start: ['start', 'počni', 'započni', 'pokreni', 'unos', 'novi']
    },
    en: {
        inventory: ['list', 'items', 'catalog', 'products', 'overview'],
        stock: ['stock', 'inventory', 'supplies', 'warehouse', 'storage'],
        end: ['end', 'done', 'finish', 'complete', 'enter', 'stop'],
        plus: ['plus', 'add', 'save', 'submit', 'record', 'store'],
        start: ['start', 'begin', 'go', 'record', 'new', 'input']
    },
    de: {
        inventory: ['liste', 'artikel', 'produkte', 'katalog', 'übersicht'],
        stock: ['bestand', 'lager', 'vorrat', 'waren', 'inventar'],
        end: ['ende', 'fertig', 'beenden', 'eingabe', 'enter', 'stopp'],
        plus: ['plus', 'hinzufügen', 'speichern', 'add', 'aufnehmen'],
        start: ['start', 'beginn', 'los', 'aufnahme', 'neu', 'eingabe']
    },
    hu: {
        inventory: ['lista', 'jegyzék', 'árujegyzék', 'terméklista', 'áttekintés', 'leltár', 'listat', 'jegyzek'],
        stock: ['készlet', 'raktár', 'árukészlet', 'készletek', 'raktárkészlet', 'raktáron', 'keszlet', 'raktar'],
        end: ['vége', 'kész', 'befejez', 'enter', 'rendben', 'stop', 'megvan', 'jó', 'vege'],
        plus: ['plusz', 'hozzáad', 'mentés', 'rögzít', 'felvétel', 'tárol', 'hozzá', 'add', 'hozzaad'],
        start: ['indul', 'kezd', 'start', 'elindít', 'új', 'bevitel', 'adatbevitel', 'bevitt', 'bevitelt']
    },
    uk: {
        inventory: ['список', 'перелік', 'товари', 'продукти', 'огляд'],
        stock: ['запаси', 'склад', 'наявність', 'резерви', 'інвентар'],
        end: ['кінець', 'готово', 'завершити', 'введення', 'enter', 'стоп'],
        plus: ['плюс', 'додати', 'зберегти', 'записати', 'додавання'],
        start: ['почати', 'старт', 'розпочати', 'запустити', 'новий', 'введення']
    },
    ru: {
        inventory: ['список', 'перечень', 'товары', 'продукты', 'обзор'],
        stock: ['запасы', 'склад', 'наличие', 'резервы', 'инвентарь'],
        end: ['конец', 'готово', 'завершить', 'ввод', 'enter', 'стоп'],
        plus: ['плюс', 'добавить', 'сохранить', 'записать', 'добавление'],
        start: ['начать', 'старт', 'запустить', 'поехали', 'новый', 'ввод']
    },
    zh: {
        inventory: ['列表', '清单', '商品', '产品', '目录'],
        stock: ['库存', '存货', '储备', '仓库', '存货清单'],
        end: ['结束', '完成', '输入', '确定', 'enter', '停止'],
        plus: ['加', '添加', '保存', '记录', '新增', '存储'],
        start: ['开始', '启动', '录音', '说', '新', '输入']
    },
    es: {
        inventory: ['lista', 'catálogo', 'productos', 'artículos', 'resumen'],
        stock: ['inventario', 'stock', 'existencias', 'almacén', 'depósito'],
        end: ['fin', 'hecho', 'terminar', 'entrar', 'enter', 'parar'],
        plus: ['más', 'añadir', 'guardar', 'agregar', 'sumar', 'registrar'],
        start: ['empezar', 'comenzar', 'iniciar', 'grabar', 'nuevo', 'entrada']
    },
    pt: {
        inventory: ['lista', 'catálogo', 'produtos', 'artigos', 'resumo'],
        stock: ['estoque', 'inventário', 'suprimentos', 'armazém', 'mercadorias'],
        end: ['fim', 'pronto', 'terminar', 'entrar', 'enter', 'parar'],
        plus: ['mais', 'adicionar', 'salvar', 'incluir', 'add', 'registrar'],
        start: ['começar', 'iniciar', 'gravar', 'start', 'novo', 'entrada']
    },
    fr: {
        inventory: ['liste', 'catalogue', 'produits', 'articles', 'aperçu'],
        stock: ['stock', 'inventaire', 'marchandises', 'entrepôt', 'réserves'],
        end: ['fin', 'terminé', 'terminer', 'entrée', 'enter', 'arrêter'],
        plus: ['plus', 'ajouter', 'enregistrer', 'sauvegarder', 'add'],
        start: ['commencer', 'démarrer', 'enregistrer', 'début', 'nouveau']
    }
};

// ============================================
// FUNKCIJE ZA JEZIK
// ============================================

function getVoiceCommands() {
    const lang = typeof currentLang !== 'undefined' ? currentLang : 'sr';
    return VOICE_COMMANDS[lang] || VOICE_COMMANDS['sr'];
}

function updateVoiceLanguage(langCode) {
    const speechLangMap = {
        sr: 'sr-RS', en: 'en-US', de: 'de-DE', hu: 'hu-HU',
        uk: 'uk-UA', ru: 'ru-RU', zh: 'zh-CN', es: 'es-ES',
        pt: 'pt-PT', fr: 'fr-FR'
    };
    
    currentVoiceLang = speechLangMap[langCode] || 'sr-RS';
    console.log('🌐 Voice jezik ažuriran na:', currentVoiceLang);
    
    if (recognition) {
        stopVoiceRecognition();
        setTimeout(() => startVoiceRecognition(), 500);
    }
}

// ============================================
// POMOĆNE FUNKCIJE
// ============================================

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

// ============================================
// OTVARANJE EKRANA
// ============================================

function otvoriSpisakEkran() {
    console.log('📋 Otvaram spisak proizvoda...');
    
    if (typeof refreshInventoryData === 'function') {
        try { refreshInventoryData(); } catch(e) {}
    }
    if (typeof prikaziSveUnose === 'function') {
        try { prikaziSveUnose(); } catch(e) {}
    }
    if (typeof renderInventory === 'function') {
        try { renderInventory(); } catch(e) {}
    }
    
    setTimeout(() => {
        if (typeof openInventoryAndShowHighlight === 'function') {
            try { openInventoryAndShowHighlight(); } catch(e) {}
        } else if (typeof showScreen === 'function') {
            try { showScreen('inventoryScreen'); } catch(e) {}
        } else {
            const inv = document.getElementById('inventoryScreen');
            const main = document.getElementById('mainScreen');
            if (inv) {
                if (main) main.style.display = 'none';
                inv.style.display = 'flex';
                inv.classList.add('active');
            }
        }
        console.log('✅ Spisak otvoren');
        showVoiceStatus('📋 Spisak otvoren', '#4CAF50');
    }, 200);
}

function otvoriZaliheEkran() {
    console.log('📦 Otvaram ekran zaliha...');
    
    if (typeof refreshInventoryData === 'function') {
        try { refreshInventoryData(); } catch(e) {}
    }
    
    setTimeout(() => {
        if (typeof renderInventory === 'function') {
            try { renderInventory(); } catch(e) {}
        }
        if (typeof renderProductList === 'function') {
            try { renderProductList(); } catch(e) {}
        }
        if (typeof renderEntries === 'function') {
            try { renderEntries(); } catch(e) {}
        }
        if (typeof loadInventory === 'function') {
            try { loadInventory(); } catch(e) {}
        }
        if (typeof updateInventory === 'function') {
            try { updateInventory(); } catch(e) {}
        }
    }, 100);
    
    setTimeout(() => {
        if (typeof openInventoryAndShowHighlight === 'function') {
            try { openInventoryAndShowHighlight(); } catch(e) {}
        } else if (typeof showScreen === 'function') {
            try { showScreen('inventoryScreen'); } catch(e) {}
        } else {
            const inv = document.getElementById('inventoryScreen');
            const main = document.getElementById('mainScreen');
            if (inv) {
                if (main) main.style.display = 'none';
                inv.style.display = 'flex';
                inv.classList.add('active');
            }
        }
        console.log('✅ Ekran zaliha otvoren');
        showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
    }, 200);
}

// ============================================
// PARSIRANJE (skraćeno)
// ============================================

function parseVoiceDataEntry(command) {
    console.log('🔍 PARSIRAM:', command);
    
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
    
    let nameParts = [];
    let numbers = [];
    
    for (let word of words) {
        let numVal = getNumber(word);
        if (numVal !== null) {
            numbers.push(numVal);
        } else {
            nameParts.push(word);
        }
    }
    
    if (numbers.length >= 2) {
        result.piece = numbers[0];
        result.quantity = numbers[1];
    } else if (numbers.length === 1) {
        result.piece = numbers[0];
        result.quantity = numbers[0];
    }
    
    result.product_name = nameParts.join(' ').trim() || 'Proizvod';
    
    console.log('✅ PARSIRANO:', result);
    return result;
}

// ============================================
// BROJEVI (skraćeno)
// ============================================

const NUMBER_WORDS = {
    'nula': '0', 'jedan': '1', 'jedna': '1', 'jedno': '1',
    'dva': '2', 'dve': '2', 'tri': '3', 'četiri': '4', 'cetiri': '4',
    'pet': '5', 'šest': '6', 'sest': '6', 'sedam': '7', 'osam': '8',
    'devet': '9', 'deset': '10',
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
    'ten': '10'
};

function getNumber(word) {
    const w = word.toLowerCase().trim();
    if (NUMBER_WORDS[w] !== undefined) return NUMBER_WORDS[w];
    if (/^\d+(?:[.,]\d+)?$/.test(w)) return w.replace(',', '.');
    return null;
}

// ============================================
// POPUNJAVANJE FORME I ČUVANJE (skraćeno)
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
    if (!data.product_name || data.product_name === 'Proizvod' || data.product_name.length < 2) {
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
// START VOICE RECOGNITION - GLAVNA FUNKCIJA
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

    END_AKTIVAN = false;
    isProcessingCommand = false;

    recognition.onstart = function() {
        console.log('🎤 MIKROFON AKTIVAN!');
        const lang = typeof currentLang !== 'undefined' ? currentLang : 'sr';
        const hints = {
            sr: 'Recite: "spisak" za spisak, "zalihe" za zalihe, "plus" za dodavanje, "end" za kraj',
            hu: 'Mondd: "lista" a listához, "készlet" a készlethez, "hozzáad" a hozzáadáshoz, "vége" a befejezéshez',
            en: 'Say: "list" for list, "stock" for stock, "add" to add, "end" to finish',
            de: 'Sage: "Liste" für Liste, "Bestand" für Bestand, "hinzufügen" zum Hinzufügen, "Ende" zum Beenden'
        };
        showVoiceStatus(`🎤 Slušam... ${hints[lang] || hints.sr}`, '#2196F3');
        activeBuffer = '';
        isProcessingCommand = false;
        END_AKTIVAN = false;
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
            // PRIMENI KOREKCIJU
            const corrected = correctSpeechText(finalChunk);
            activeBuffer += (activeBuffer ? ' ' : '') + corrected;
            console.log('🗣️ ORIGINAL:', finalChunk);
            console.log('🗣️ KORIGOVANO:', corrected);
            console.log('🗣️ BAFER:', activeBuffer);
        }
        
        const currentDisplay = activeBuffer + (interimText ? ' ' + interimText : '');
        showVoiceStatus(`🎤 Slušam: "${currentDisplay}"`, '#FFD700');
        
        if (isProcessingCommand) return;
        
        const commands = getVoiceCommands();
        // KORISTI KORIGOVANI TEKST
        const correctedFull = correctSpeechText(activeBuffer);
        console.log('🔍 PROVERAVAM (korigovano):', correctedFull);
        
        // ============================================
        // 1. SPISAK/LISTA - otvara spisak proizvoda
        // ============================================
        const inventoryKeywords = commands.inventory || ['spisak', 'lista', 'pregled'];
        const inventoryIndex = findKeywordIndex(correctedFull, inventoryKeywords);
        const isInventory = inventoryIndex !== -1;
        
        // ============================================
        // 2. ZALIHE/STOCK - otvara zalihe
        // ============================================
        const stockKeywords = commands.stock || ['zalihe', 'stanje', 'skladište'];
        const stockIndex = findKeywordIndex(correctedFull, stockKeywords);
        const isStock = stockIndex !== -1;
        
        // ============================================
        // Odredi koja komanda je prva
        // ============================================
        if (isInventory && isStock) {
            if (inventoryIndex < stockIndex) {
                // Spisak je prvi
                console.log('📋 SPISAK DETEKTOVAN (prvi)');
                handleInventoryCommand(correctedFull);
                return;
            } else {
                // Zalihe su prve
                console.log('📦 ZALIHE DETEKTOVANE (prve)');
                handleStockCommand(correctedFull);
                return;
            }
        } else if (isInventory) {
            console.log('📋 SPISAK DETEKTOVAN');
            handleInventoryCommand(correctedFull);
            return;
        } else if (isStock) {
            console.log('📦 ZALIHE DETEKTOVANE');
            handleStockCommand(correctedFull);
            return;
        }
        
        // ============================================
        // 3. END - završava unos
        // ============================================
        const endKeywords = commands.end || ['end', 'kraj', 'gotovo', 'enter'];
        if (containsKeyword(correctedFull, endKeywords)) {
            console.log('🏁 END DETEKTOVAN');
            handleEndCommand(correctedFull);
            return;
        }
        
        // ============================================
        // 4. PLUS - dodaje unos
        // ============================================
        const plusKeywords = commands.plus || ['plus', 'dodaj', 'unesi'];
        if (containsKeyword(correctedFull, plusKeywords)) {
            console.log('✅ PLUS DETEKTOVAN');
            handlePlusCommand(correctedFull);
            return;
        }
        
        // ============================================
        // 5. START/UNOS - otvara unos
        // ============================================
        const startKeywords = commands.start || ['start', 'počni', 'unos', 'novi'];
        if (containsKeyword(correctedFull, startKeywords)) {
            console.log('📝 START DETEKTOVAN');
            handleStartCommand(correctedFull);
            return;
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
        showVoiceStatus('🎤 Slušam...', '#2196F3');
    } catch(e) {
        console.error('❌ Greška:', e);
        showVoiceStatus('❌ Greška pri pokretanju', '#f44336');
    }
}

// ============================================
// HANDLERI ZA KOMANDE
// ============================================

function handleInventoryCommand(correctedText) {
    isProcessingCommand = true;
    
    const commands = getVoiceCommands();
    const keywords = commands.inventory || ['spisak', 'lista', 'pregled'];
    
    let itemText = activeBuffer;
    const found = findKeywordIndex(correctedText, keywords);
    if (found !== -1) {
        const parts = activeBuffer.split(new RegExp(keywords.find(k => correctedText.includes(k)) || 'spisak', 'i'));
        itemText = parts[0].trim();
    }
    
    if (itemText.length > 2) {
        processAndSaveItem(itemText);
    }
    
    activeBuffer = '';
    
    setTimeout(() => {
        stopVoiceRecognition();
        setTimeout(() => {
            otvoriSpisakEkran();
        }, 300);
    }, 200);
}

function handleStockCommand(correctedText) {
    isProcessingCommand = true;
    
    const commands = getVoiceCommands();
    const keywords = commands.stock || ['zalihe', 'stanje', 'skladište'];
    
    let itemText = activeBuffer;
    const found = findKeywordIndex(correctedText, keywords);
    if (found !== -1) {
        const parts = activeBuffer.split(new RegExp(keywords.find(k => correctedText.includes(k)) || 'zalihe', 'i'));
        itemText = parts[0].trim();
    }
    
    if (itemText.length > 2) {
        processAndSaveItem(itemText);
    }
    
    activeBuffer = '';
    
    setTimeout(() => {
        stopVoiceRecognition();
        setTimeout(() => {
            otvoriZaliheEkran();
        }, 300);
    }, 200);
}

function handleEndCommand(correctedText) {
    isProcessingCommand = true;
    
    const commands = getVoiceCommands();
    const keywords = commands.end || ['end', 'kraj', 'gotovo', 'enter'];
    
    let itemText = activeBuffer;
    const found = findKeywordIndex(correctedText, keywords);
    if (found !== -1) {
        const parts = activeBuffer.split(new RegExp(keywords.find(k => correctedText.includes(k)) || 'end', 'i'));
        itemText = parts[0].trim();
    }
    
    if (itemText.length > 2) {
        processAndSaveItem(itemText);
    }
    
    activeBuffer = '';
    showVoiceStatus('✅ Unos završen', '#4CAF50');
    
    setTimeout(() => {
        isProcessingCommand = false;
    }, 500);
}

function handlePlusCommand(correctedText) {
    isProcessingCommand = true;
    
    const commands = getVoiceCommands();
    const keywords = commands.plus || ['plus', 'dodaj', 'unesi'];
    const regex = new RegExp(keywords.join('|'), 'i');
    const parts = activeBuffer.split(regex);
    let itemText = parts[0].trim();
    
    if (itemText.length > 2) {
        processAndSaveItem(itemText);
    }
    
    activeBuffer = parts.slice(1).join(' ').trim();
    showVoiceStatus('✅ Unos sačuvan', '#4CAF50');
    
    setTimeout(() => {
        if (typeof prikaziSveUnose === 'function') prikaziSveUnose();
    }, 200);
    
    setTimeout(() => {
        isProcessingCommand = false;
    }, 500);
}

function handleStartCommand(correctedText) {
    console.log('📝 START DETEKTOVAN - otvaram unos');
    hideVoiceMenu();
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen && mainScreen.style.display !== 'flex') {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
        if (typeof renderDataEntry === 'function') renderDataEntry('');
    }
    
    const commands = getVoiceCommands();
    const keywords = commands.start || ['start', 'počni', 'unos', 'novi'];
    const words = activeBuffer.split(/\s+/);
    const filtered = words.filter(w => {
        const lower = w.toLowerCase();
        return !keywords.some(k => lower === k);
    });
    activeBuffer = filtered.join(' ');
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
            console.log('✅ DOZVOLJENO: renderInventory');
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
            console.log('✅ DOZVOLJENO: showScreen(' + screenId + ')');
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
            console.log('✅ DOZVOLJENO: openInventoryAndShowHighlight');
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
    console.log('⛔ Plus NE otvara zalihe!');
    console.log('✅ End završava unos!');
    console.log('✅ Spisak otvara spisak!');
    console.log('✅ Zalihe otvaraju zalihe!');
})();

// ============================================
// TEST FUNKCIJA
// ============================================

window.testVoiceCorrection = function(text) {
    console.log('🧪 TEST KOREKCIJE:', text);
    const corrected = correctSpeechText(text);
    console.log('🔧 KORIGOVANO:', corrected);
    
    const commands = getVoiceCommands();
    console.log('📋 INVENTORY:', commands.inventory);
    console.log('📦 STOCK:', commands.stock);
    console.log('🏁 END:', commands.end);
    console.log('✅ PLUS:', commands.plus);
    
    const result = {
        original: text,
        corrected: corrected,
        isInventory: containsKeyword(corrected, commands.inventory),
        isStock: containsKeyword(corrected, commands.stock),
        isEnd: containsKeyword(corrected, commands.end),
        isPlus: containsKeyword(corrected, commands.plus),
        inventoryIndex: findKeywordIndex(corrected, commands.inventory),
        stockIndex: findKeywordIndex(corrected, commands.stock)
    };
    
    console.log('🔍 REZULTAT:', result);
    return result;
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
window.VOICE_COMMANDS = VOICE_COMMANDS;
window.testVoiceCorrection = testVoiceCorrection;

console.log('✅ VOICE COMMANDS - POBOLJŠANA VERZIJA UČITANA!');
console.log('📋 "spisak" → otvara SPISAK proizvoda');
console.log('📦 "zalihe" → otvara ZALIHE');
console.log('✅ "plus" → dodaje unos (NE otvara zalihe)');
console.log('🏁 "end" → završava unos');
console.log('🧪 Testiraj sa: testVoiceCorrection("adatbevitel")');
console.log('🧪 Testiraj sa: testVoiceCorrection("keszlet")');
