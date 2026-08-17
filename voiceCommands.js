let recognition = null;
let fullSpeechResult = '';
let speechTimeout = null;

function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
        console.log('🔇 Voice menu sakriven');
    }
}

function processVoiceCommand(command) {
    console.log('🎤 processVoiceCommand prima:', command);
    
    if (!command || command.trim() === '') {
        console.log('❌ Prazna komanda');
        return false;
    }
    
    const cmd = command.toLowerCase().trim();
    console.log('📝 Normalizovana komanda:', cmd);
    
    hideVoiceMenu();
    
    if (cmd.includes('end') || cmd.includes('kraj') || cmd.includes('stop') || cmd.includes('završi')) {
        console.log('🛑 Prepoznat END - kraj unosa!');
        fullSpeechResult = '';
        if (speechTimeout) {
            clearTimeout(speechTimeout);
            speechTimeout = null;
        }
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        if (typeof renderInventory === 'function') {
            renderInventory();
        }
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '✅ Unos završen. Mikrofon i dalje sluša.';
            statusEl.style.color = '#4CAF50';
        }
        showModernAlert('✅', 'Unos završen! Otvaram zalihe.', '🛑');
        return true;
    }
    
    if (cmd.includes('plus') || cmd.includes('još') || cmd.includes('novi') || cmd.includes('sledeći')) {
        console.log('➕ Prepoznat PLUS - novi unos!');
        fullSpeechResult = '';
        if (speechTimeout) {
            clearTimeout(speechTimeout);
            speechTimeout = null;
        }
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
        showModernAlert('✅', 'Spreman za novi unos!', '➕');
        return true;
    }
    
    if (cmd.includes('start') || cmd.includes('stat') || cmd.includes('stard')) {
        console.log('🚀 Prepoznat START!');
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
    
    const dataEntryKeywords = [
        'unos', 'unesi', 'dodaj', 'novi', 'podatak', 'unos podataka',
        'add', 'product', 'entry', 'data', 'new', 'insert', 'create',
        'eintrag', 'produkt', 'hinzufügen', 'neu', 'daten', 'eingabe',
        'bevitel', 'új', 'termék', 'hozzáad', 'rögzít', 'adat', 'beír',
        'введення', 'дані', 'продукт', 'новий', 'додати', 'внести',
        'ввод', 'данные', 'продукт', 'новый', 'добавить',
        '录入', '输入', '数据', '产品', '新增', '添加',
        'entrada', 'datos', 'producto', 'nuevo', 'agregar', 'añadir',
        'entrada', 'dados', 'produto', 'novo', 'adicionar', 'inserir',
        'saisie', 'données', 'produit', 'nouveau', 'ajouter', 'entrer'
    ];
    if (dataEntryKeywords.some(k => cmd.includes(k))) {
        console.log('✅ Prepoznat UNOS PODATAKA!');
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
                console.log('✅ mainScreen prikazan za UNOS');
            }
            if (typeof renderDataEntry === 'function') {
                renderDataEntry('');
            } else if (typeof window.renderDataEntry === 'function') {
                window.renderDataEntry('');
            }
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = '🎤 Recite "Start" za prvi unos, pa diktirajte: naziv komad količina rok skladište + plus';
                statusEl.style.color = '#4CAF50';
            }
            setTimeout(function() {
                const productInput = document.getElementById('productInput');
                if (productInput) productInput.focus();
            }, 300);
        }, 300);
        return true;
    }
    
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

    console.log('❌ Komanda nije prepoznata:', cmd);
    showModernAlert('Nepoznata komanda', '"' + command + '" nije prepoznato.', '❓');
    return false;
}

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
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
                fullSpeechResult += result[0].transcript + ' ';
                console.log('✅ Dodata reč: "' + result[0].transcript + '"');
            }
        }
        const currentText = fullSpeechResult.trim();
        console.log('📝 Trenutno skupljeno:', currentText);
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl && currentText) {
            statusEl.textContent = '🗣️ "' + currentText + '"';
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

function goBackFromVoice() {
    console.log('◀ Povratak sa glasovnog menija');
    stopVoiceRecognition();
    showScreen('choiceScreen');
}

function parseVoiceDataEntry(command) {
    console.log('🔍 Parsiranje glasovnog unosa:', command);
    let text = command.replace(/^start\s*/i, '').replace(/\s*plus\s*$/i, '').trim().toLowerCase();
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
    Object.keys(brojMap).forEach(function(key) {
        var re = new RegExp('\\b' + key + '\\b', 'gi');
        text = text.replace(re, brojMap[key]);
    });
    var result = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kg',
        shelf_life: '',
        storage: 'Zamrzivač 1'
    };
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
    var unitMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(kilogram|kilograma|kg|gram|grama|g|litar|litara|l|mililitar|mililitara|ml|komad|komada|kom)/);
    if (unitMatch) {
        result.quantity = unitMatch[1].replace(',', '.');
        var unitWord = unitMatch[2];
        if (unitWord.includes('kilogram') || unitWord === 'kg') result.unit = 'kg';
        else if (unitWord.includes('gram') || unitWord === 'g') result.unit = 'g';
        else if (unitWord.includes('litar') || unitWord === 'l') result.unit = 'l';
        else if (unitWord.includes('mililitar') || unitWord === 'ml') result.unit = 'ml';
        else result.unit = 'kom';
    }
    var numbers = text.match(/\d+(?:[.,]\d+)?/g) || [];
    if (numbers.length >= 3) {
        result.piece = numbers[0];
        result.shelf_life = parseInt(numbers[numbers.length - 1]);
    }
    var firstNumberPos = text.search(/\d/);
    if (firstNumberPos > 0) {
        result.product_name = text.substring(0, firstNumberPos).trim();
    }
    console.log('✅ Parsirano:', result);
    return result;
}

function processStartCommand(command) {
    console.log('🚀 Procesiram Start komandu:', command);
    var data = parseVoiceDataEntry(command);
    if (!data.product_name) {
        showModernAlert('Greška', 'Nije prepoznat naziv proizvoda!', '❌');
        var statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Nije prepoznat naziv. Pokušajte ponovo.';
            statusEl.style.color = '#f44336';
        }
        return false;
    }
    var productInput = document.getElementById('productInput');
    if (!productInput) {
        console.log('📂 Data Entry nije otvoren, otvaram...');
        var mainScreen = document.getElementById('mainScreen');
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

function popuniStartPodatke(data) {
    console.log('📝 Popunjavam polja sa:', data);
    var productInput = document.getElementById('productInput');
    var pieceInput = document.getElementById('pieceInput');
    var quantityInput = document.getElementById('quantityInput');
    var shelfLifeInput = document.getElementById('shelfLifeInput');
    var unitSelect = document.getElementById('unitSelect');
    var storageSelect = document.getElementById('storageSelect');
    if (productInput) productInput.value = data.product_name;
    if (pieceInput) pieceInput.value = data.piece || '1';
    if (quantityInput) quantityInput.value = data.quantity || data.piece || '1';
    if (shelfLifeInput) shelfLifeInput.value = data.shelf_life || '12';
    if (unitSelect && data.unit) {
        for (var i = 0; i < unitSelect.options.length; i++) {
            if (unitSelect.options[i].value === data.unit) {
                unitSelect.selectedIndex = i;
                break;
            }
        }
    }
    if (storageSelect && data.storage) {
        for (var j = 0; j < storageSelect.options.length; j++) {
            if (storageSelect.options[j].value === data.storage || storageSelect.options[j].text.includes(data.storage)) {
                storageSelect.selectedIndex = j;
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
    var statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '✅ Popunjeno: ' + data.product_name + ', ' + data.quantity + ' ' + data.unit;
        statusEl.style.color = '#4CAF50';
    }
    setTimeout(function() {
        if (typeof saveProduct === 'function') {
            saveProduct();
            showModernAlert('✅ Uspešno', 'Proizvod je sačuvan glasovno!', '🎤');
            fullSpeechResult = '';
            if (speechTimeout) {
                clearTimeout(speechTimeout);
                speechTimeout = null;
            }
            if (statusEl) {
                statusEl.textContent = '🎤 Recite "plus" za novi unos, "end" za kraj';
                statusEl.style.color = '#FFD700';
            }
        }
    }, 1000);
}

window.processVoiceCommand = processVoiceCommand;
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.processStartCommand = processStartCommand;
window.popuniStartPodatke = popuniStartPodatke;

console.log('✅ Voice Commands učitan - FIX verzija!');
