// ============================================
// VOICE COMMANDS - GLASOVNE KOMANDE - FIX
// ============================================

let recognition = null;
let isDataEntryMode = false;  // Da li smo u režimu unosa podataka
let firstStartDone = false;   // Da li je "Start" već izgovoren
// ===== POMOĆNA FUNKCIJA ZA SAKRIVANJE VOICE MENIJA =====
function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
        console.log('🔇 Voice menu sakriven');
    }
}

// ===== FUNKCIJA ZA OBRADU GLASOVNIH KOMANDI =====
function processVoiceCommand(command) {
    console.log('🎤 processVoiceCommand prima:', command);
    
    if (!command || command.trim() === '') {
        console.log('❌ Prazna komanda');
        return false;
    }
    
    const cmd = command.toLowerCase().trim();
    console.log('📝 Normalizovana komanda:', cmd);
    
    // ===== PRVO SAKRIVANJE VOICE MENIJA =====
hideVoiceMenu();

// ===== PROVERI "END" - KRAJ UNOSA =====
if (cmd.includes('end') || cmd.includes('kraj') || cmd.includes('stop')) {
    console.log('🛑 Prepoznat END - kraj unosa!');
    isDataEntryMode = false;
    firstStartDone = false;
    fullSpeechResult = '';
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        speechTimeout = null;
    }
    // Otvori zalihe sa svetloplavom oznakom
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    if (typeof renderInventory === 'function') {
        renderInventory();
        // Označi nove proizvode svetloplavom (dodato u renderInventory)
    }
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '✅ Unos završen. Mikrofon i dalje sluša.';
        statusEl.style.color = '#4CAF50';
    }
    showModernAlert('✅', 'Unos završen! Otvaram zalihe.', '🛑');
    return true;
}

// ===== PROVERI "PLUS" - KRAJ TRENUTNOG, POČETAK NOVOG =====
if (cmd.includes('plus')) {
    console.log('➕ Prepoznat PLUS - kraj unosa, spreman za novi!');
    // Resetuj za novi unos (ali ostani u data entry modu)
    fullSpeechResult = '';
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        speechTimeout = null;
    }
    // Očisti polja za novi unos (osim naziva proizvoda)
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const descriptionInput = document.getElementById('descriptionInput');
    if (pieceInput) pieceInput.value = '';
    if (quantityInput) quantityInput.value = '';
    if (shelfLifeInput) shelfLifeInput.value = '';
    if (descriptionInput) descriptionInput.value = '';
    
    const productInput = document.getElementById('productInput');
    if (productInput) {
        productInput.focus();
        productInput.select();
    }
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎤 Diktirajte sledeći proizvod: naziv komad količina rok skladište + plus';
        statusEl.style.color = '#4CAF50';
    }
    return true;
}

// ===== PROVERI "START" - SAMO ZA PRVI UNOS =====
if (cmd.includes('start') && !firstStartDone && isDataEntryMode) {
    console.log('🚀 Prepoznat START - prvi unos!');
    firstStartDone = true;
    // Ukloni "start" iz komande i procesuiraj
    let restOfCommand = command.replace(/^start\s*/i, '').trim();
    if (restOfCommand) {
        processStartCommand(restOfCommand);
    } else {
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '🎤 Diktirajte: naziv komad količina rok skladište + plus';
            statusEl.style.color = '#FFD700';
        }
    }
    return true;
}

// ===== AKO SMO U DATA ENTRY MODU I NIJE "START" - DIREKTAN UNOS =====
if (isDataEntryMode && firstStartDone && !cmd.includes('plus') && !cmd.includes('end')) {
    console.log('📝 Direktan unos u Data Entry modu:', command);
    processStartCommand(command);
    return true;
}
    
    // ===== ZALIHE - SVI JEZICI =====
    const inventoryKeywords = [
        'stanje', 'zalihe', 'inventar',
        'inventory', 'stock', 'supplies',
        'bestand', 'lager', 'inventar',
        'készlet', 'raktár', 'állapot', 'leltár',
        'запаси', 'склад', 'інвентар',
        'запасы', 'склад', 'инвентарь',
        '库存', '存货', '供应',
        'inventario', 'existencia', 'stock',
        'estoque', 'inventário',
        'stock', 'inventaire', 'approvisionnement'
    ];
    if (inventoryKeywords.some(k => cmd.includes(k))) {
        console.log('✅ Prepoznate ZALIHE');
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderInventory === 'function') {
                renderInventory();
            }
        }, 300);
        return true;
    }

    // ===== SPISAK - SVI JEZICI =====
    const shoppingKeywords = [
        'spisak', 'kupovina', 'potrebe', 'lista',
        'shopping', 'list', 'shopping list',
        'einkaufsliste', 'einkauf', 'liste',
        'bevásárlólista', 'lista', 'vásárlás', 'bevásárlás',
        'список', 'покупки', 'список покупок',
        'список', 'покупки', 'список покупок',
        '购物清单', '购物列表', '清单',
        'lista de compras', 'compras', 'lista',
        'lista de compras', 'compras', 'lista',
        'liste de courses', 'courses', 'liste'
    ];
    if (shoppingKeywords.some(k => cmd.includes(k))) {
        console.log('✅ Prepoznat SPISAK');
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderShoppingList === 'function') {
                renderShoppingList();
            }
        }, 300);
        return true;
    }

    // ===== NAZAD - SVI JEZICI =====
    const backKeywords = [
        'nazad', 'vrati', 'odustani', 'otkaži', 'vrati se',
        'back', 'cancel', 'go back', 'return', 'exit',
        'zurück', 'abbrechen', 'beenden',
        'vissza', 'mégsem', 'visszatér', 'kilép',
        'назад', 'скасувати', 'повернутися',
        'назад', 'отмена', 'вернуться',
        '返回', '取消', '回去',
        'atrás', 'cancelar', 'volver', 'regresar',
        'voltar', 'cancelar', 'regressar',
        'retour', 'annuler', 'revenir'
    ];
    if (backKeywords.some(k => cmd.includes(k))) {
        console.log('✅ Prepoznat NAZAD');
        setTimeout(function() {
            if (typeof handleBackAction === 'function') {
                handleBackAction();
            } else if (typeof goBackFromVoice === 'function') {
                goBackFromVoice();
            } else {
                const choiceScreen = document.getElementById('choiceScreen');
                if (choiceScreen) {
                    document.querySelectorAll('.screen').forEach(s => {
                        s.style.display = 'none';
                        s.classList.remove('active');
                    });
                    choiceScreen.style.display = 'flex';
                    choiceScreen.classList.add('active');
                }
            }
        }, 300);
        return true;
    }

    // ===== MENI / POČETNA - SVI JEZICI =====
    const menuKeywords = [
        'meni', 'početna', 'glavni', 'početak', 'home',
        'menu', 'home', 'main', 'start',
        'hauptmenü', 'start', 'menü',
        'menü', 'főoldal', 'kezdőlap', 'kezdés',
        'меню', 'головна', 'старт',
        'меню', 'главная', 'старт',
        '菜单', '主页', '开始',
        'menú', 'inicio', 'principal', 'comenzar',
        'menu', 'início', 'principal', 'começar',
        'menu', 'accueil', 'principal', 'démarrer'
    ];
    if (menuKeywords.some(k => cmd.includes(k))) {
        console.log('✅ Prepoznat MENI');
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderCategories === 'function') {
                renderCategories();
            }
        }, 300);
        return true;
    }

    // ===== KATEGORIJE - SVI JEZICI =====
    const categoryKeywords = [
        'kategorije', 'kategorija',
        'categories', 'category',
        'kategorien', 'kategorie',
        'kategóriák', 'kategória',
        'категорії', 'категорія',
        'категории', 'категория',
        '类别', '分类',
        'categorías', 'categoría',
        'categorias', 'categoria',
        'catégories', 'catégorie'
    ];
    if (categoryKeywords.some(k => cmd.includes(k))) {
        console.log('✅ Prepoznate KATEGORIJE');
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderCategories === 'function') {
                renderCategories();
            }
        }, 300);
        return true;
    }

    // ===== PROVERI DA LI JE KATEGORIJA =====
    if (typeof getMainCategories === 'function') {
        const catList = getMainCategories();
        let matchedCategory = null;
        catList.forEach(cat => {
            if (cmd.includes(cat.toLowerCase())) {
                matchedCategory = cat;
            }
        });

        if (matchedCategory) {
            console.log('✅ Prepoznata kategorija:', matchedCategory);
            setTimeout(function() {
                const mainScreen = document.getElementById('mainScreen');
                if (mainScreen) {
                    mainScreen.style.display = 'flex';
                    mainScreen.classList.add('active');
                }
                if (typeof renderSubcategories === 'function') {
                    renderSubcategories(matchedCategory);
                }
            }, 300);
            return true;
        }
    }

    // ===== AKO NIJE PREPOZNATA =====
    console.log('❌ Komanda nije prepoznata:', cmd);
    showModernAlert('Nepoznata komanda', `"${command}" nije prepoznato.`, '❓');
    return false;
}

// ===== POKRETAČ ZA GLASOVNI UNOS =====
function startVoiceRecognition() {
    fullSpeechResult = '';
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        speechTimeout = null;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        showModernAlert('Greška', 'Vaš pretraživač ne podržava glasovne komande.', '❌');
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
    if (statusEl) {
        statusEl.textContent = '🎤 Slušam... Govorite komandu';
        statusEl.style.color = '#2196F3';
    }

    recognition.onstart = function() {
        console.log('🎤 Glasovno prepoznavanje pokrenuto na jeziku:', recognition.lang);
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '🎤 Slušam...';
            statusEl.style.color = '#2196F3';
        }
        fullSpeechResult = '';
    };

    recognition.onresult = function(event) {
        // Sakupi sve finalne rezultate
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
                fullSpeechResult += result[0].transcript + ' ';
                console.log(`✅ Dodata reč: "${result[0].transcript}"`);
            }
        }
        
        const currentText = fullSpeechResult.trim();
        console.log('📝 Trenutno skupljeno:', currentText);
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl && currentText) {
            statusEl.textContent = `🗣️ "${currentText}"`;
            statusEl.style.color = '#FFD700';
        }
        
        clearTimeout(speechTimeout);
        speechTimeout = setTimeout(function() {
            const finalText = fullSpeechResult.trim();
            console.log('🎯 KONAČAN TEKST ZA OBRADU:', finalText);
            
            if (finalText && finalText.length > 0) {
                processVoiceCommand(finalText);
            }
            
            setTimeout(function() {
                fullSpeechResult = '';
            }, 500);
        }, 1500);
    };

    recognition.onerror = function(event) {
        console.error('⚠️ Greška u prepoznavanju glasa:', event.error);
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Greška. Pokušajte ponovo.';
            statusEl.style.color = '#f44336';
        }
        if (event.error === 'not-allowed') {
            showModernAlert('Greška', 'Dozvolite pristup mikrofonu!', '🎤');
        }
    };

    recognition.onend = function() {
        console.log('🎤 Glasovno prepoznavanje završeno.');
        const voiceMenu = document.getElementById('voiceMenuScreen');
        if (voiceMenu && voiceMenu.classList.contains('active')) {
            setTimeout(function() {
                if (recognition) {
                    try {
                        recognition.start();
                        console.log('🎤 Ponovo pokrenuto slušanje');
                    } catch(e) {
                        console.log('⏳ Čekanje pre ponovnog pokretanja...');
                    }
                }
            }, 500);
        }
    };

    try {
        recognition.start();
        console.log('🎤 Slušam...');
    } catch(e) {
        console.error('❌ Greška pri startovanju:', e);
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Greška pri pokretanju mikrofona';
            statusEl.style.color = '#f44336';
        }
    }
}

// ===== ZAUSTAVI GLASOVNO PREPOZNAVANJE =====
function stopVoiceRecognition() {
    fullSpeechResult = '';
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        speechTimeout = null;
    }
    
    if (recognition) {
        try {
            recognition.stop();
            recognition = null;
            console.log('🛑 Recognition zaustavljen');
        } catch(e) {}
    }
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '⏸️ Prepoznavanje zaustavljeno';
        statusEl.style.color = '#aaa';
    }
}

// ===== POVRATAK SA VOICE MENIJA =====
function goBackFromVoice() {
    console.log('◀ Povratak sa glasovnog menija');
    stopVoiceRecognition();
    showScreen('choiceScreen');
}

// ===== PARSIRANJE GLASOVNOG UNOSA =====
function parseVoiceDataEntry(command) {
    console.log('🔍 Parsiranje glasovnog unosa:', command);

    let text = command
        .replace(/^start\s*/i, '')  // Ukloni "start" ako postoji
        .replace(/\s*plus\s*$/i, '') // Ukloni "plus" sa kraja
        .trim()
        .toLowerCase();

    // Brojevi rečima
    const brojMap = {
        'jedan': '1', 'jedna': '1',
        'dva': '2',
        'tri': '3',
        'četiri': '4', 'cetiri': '4',
        'pet': '5',
        'šest': '6', 'sest': '6',
        'sedam': '7',
        'osam': '8',
        'devet': '9',
        'deset': '10',
        'jedanaest': '11',
        'dvanaest': '12'
    };

    Object.keys(brojMap).forEach(key => {
        const re = new RegExp('\\b' + key + '\\b', 'gi');
        text = text.replace(re, brojMap[key]);
    });

    const result = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kg',
        shelf_life: '',
        storage: 'Zamrzivač 1'
    };

    // Skladište
    if (text.includes('zamrzivač 2') || text.includes('zamrzivac 2')) {
        result.storage = 'Zamrzivač 2';
    } else if (text.includes('zamrzivač 3') || text.includes('zamrzivac 3')) {
        result.storage = 'Zamrzivač 3';
    } else if (text.includes('zamrzivač') || text.includes('zamrzivac')) {
        result.storage = 'Zamrzivač 1';
    } else if (text.includes('frižider') || text.includes('frizider')) {
        result.storage = 'Frižider';
    } else if (text.includes('ostava')) {
        result.storage = 'Ostava';
    }

    // Jedinica + količina
    const unitMatch = text.match(
        /(\d+(?:[.,]\d+)?)\s*(kilogram|kilograma|kg|gram|grama|g|litar|litara|l|mililitar|mililitara|ml|komad|komada|kom)/
    );

    if (unitMatch) {
        result.quantity = unitMatch[1].replace(',', '.');
        const unitWord = unitMatch[2];
        if (unitWord.includes('kilogram') || unitWord === 'kg') result.unit = 'kg';
        else if (unitWord.includes('gram') || unitWord === 'g') result.unit = 'g';
        else if (unitWord.includes('litar') || unitWord === 'l') result.unit = 'l';
        else if (unitWord.includes('mililitar') || unitWord === 'ml') result.unit = 'ml';
        else result.unit = 'kom';
    }

    const numbers = text.match(/\d+(?:[.,]\d+)?/g) || [];

    if (numbers.length >= 3) {
        result.piece = numbers[0];
        result.shelf_life = parseInt(numbers[numbers.length - 1]);
    }

    // Naziv proizvoda = sve pre prvog broja
    const firstNumberPos = text.search(/\d/);
    if (firstNumberPos > 0) {
        result.product_name = text.substring(0, firstNumberPos).trim();
    }

    console.log('✅ Parsirano:', result);
    return result;
}

// ===== OBRADA "START" KOMANDE ZA UNOS =====
function processStartCommand(command) {
    console.log('🚀 Procesiram Start komandu:', command);
    
    let data = parseVoiceDataEntry(command);
    
    if (!data.product_name) {
        showModernAlert('Greška', 'Nije prepoznat naziv proizvoda!', '❌');
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Nije prepoznat naziv. Pokušajte ponovo.';
            statusEl.style.color = '#f44336';
        }
        return false;
    }
    
    const productInput = document.getElementById('productInput');
    if (!productInput) {
        console.log('📂 Data Entry nije otvoren, otvaram...');
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        if (typeof renderDataEntry === 'function') {
            renderDataEntry('');
        } else if (typeof window.renderDataEntry === 'function') {
            window.renderDataEntry('');
        } else {
            showModernAlert('Greška', 'Funkcija za unos nije dostupna!', '❌');
            return false;
        }
        setTimeout(function() {
            popuniStartPodatke(data);
        }, 600);
    } else {
        console.log('📝 Data Entry je otvoren, popunjavam direktno...');
        popuniStartPodatke(data);
    }
    
    return true;
}

// ===== POMOĆNA FUNKCIJA ZA POPUNJAVANJE PODATAKA IZ START KOMANDE =====
function popuniStartPodatke(data) {
    console.log('📝 Popunjavam polja sa:', data);
    
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const unitSelect = document.getElementById('unitSelect');
    const storageSelect = document.getElementById('storageSelect');
    
    if (productInput) productInput.value = data.product_name;
    if (pieceInput) pieceInput.value = data.piece || '1';
    if (quantityInput) quantityInput.value = data.quantity || data.piece || '1';
    if (shelfLifeInput) shelfLifeInput.value = data.shelf_life || '12';
    
    if (unitSelect && data.unit) {
        for (let option of unitSelect.options) {
            if (option.value === data.unit) {
                option.selected = true;
                break;
            }
        }
    }
    
    if (storageSelect && data.storage) {
        for (let option of storageSelect.options) {
            if (option.value === data.storage || option.text.includes(data.storage)) {
                option.selected = true;
                break;
            }
        }
    }
    
    if (typeof updateExpiryDate === 'function') {
        updateExpiryDate();
    }
    
    if (typeof prikaziSveUnose === 'function') {
        prikaziSveUnose();
    }
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `✅ Popunjeno: ${data.product_name}, ${data.quantity} ${data.unit}`;
        statusEl.style.color = '#4CAF50';
    }
    
    setTimeout(function() {
        if (typeof saveProduct === 'function') {
            saveProduct();
            showModernAlert('✅ Uspešno', 'Proizvod je sačuvan glasovno!', '🎤');
            if (statusEl) {
                statusEl.textContent = '🎤 Recite "Start" za novi unos, ili drugu komandu';
                statusEl.style.color = '#FFD700';
            }
        }
    }, 1000);
}

// ===== IZVEZI FUNKCIJE GLOBALNO =====
window.processVoiceCommand = processVoiceCommand;
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.processStartCommand = processStartCommand;
window.popuniStartPodatke = popuniStartPodatke;

console.log('✅ Voice Commands učitan - FIX verzija!');
