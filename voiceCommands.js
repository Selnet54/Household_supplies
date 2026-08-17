// ============================================
// VOICE COMMANDS - GLASOVNE KOMANDE - FIX V2
// ============================================

let recognition = null;
let fullSpeechResult = '';

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
    
    // ===== PROVERI "START" ILI UNOS PODATAKA =====
    const dataEntryKeywords = [
        'start', 'stat', 'stard', 'unos', 'unesi', 'dodaj', 'novi', 'podatak', 'unos podataka',
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
        console.log('✅ Prepoznat START / UNOS PODATAKA!');
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
        '购物清单', '购物列表', '清单',
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
        'назад', 'скасувати', 'повернутися', 'отмена', 'вернуться',
        '返回', '取消', '回去',
        'atrás', 'cancelar', 'volver', 'regresar', 'voltar', 'retour', 'annuler'
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
        'menu', 'main', 'hauptmenü', 'főoldal', 'kezdőlap',
        'меню', 'головна', 'старт', 'главная',
        '菜单', '主页', '开始',
        'inicio', 'principal', 'comenzar', 'accueil'
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
        'kategorije', 'kategorija', 'categories', 'category',
        'kategorien', 'kategorie', 'kategóriák', 'kategória',
        'категорії', 'категория', 'категории', '类别', '分类',
        'categorías', 'categoría', 'categorias', 'categoria', 'catégories'
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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        showModernAlert('Greška', 'Vaš pretraživač ne podržava glasovne komande.', '❌');
        return;
    }

    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
        fullSpeechResult = '';
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
        let speechResult = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            speechResult += event.results[i][0].transcript;
        }
        speechResult = speechResult.trim();
        console.log('🗣️ PREPOZNAT TEKST:', speechResult);
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = `🗣️ "${speechResult}"`;
            statusEl.style.color = '#FFD700';
        }
        
        if (speechResult && speechResult.length > 0) {
            stopVoiceRecognition();
            processVoiceCommand(speechResult);
        }
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
    if (recognition) {
        try {
            recognition.stop();
            recognition = null;
            console.log('🛑 Recognition zaustavljen');
        } catch(e) {}
    }
    fullSpeechResult = '';
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

// ===== NOVA POBOLJŠANA FUNKCIJA ZA PARSIRANJE GLASOVNog UNOSA =====
function parseVoiceDataEntry(command) {
    console.log('🔍 Parsiranje glasovnog unosa:', command);
    
    let text = command.replace(/^(start|stat|stard|unos|unesi|dodaj|novi)\s*/i, '').trim();
    console.log('📝 Tekst za parsiranje:', text);
    
    let result = {
        product_name: '',
        piece: '',
        quantity: '',
        unit: 'kom',
        shelf_life: '',
        storage: 'Zamrzivač 1'
    };
    
    const unitMap = {
        'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg',
        'gram': 'g', 'grama': 'g', 'g': 'g',
        'litar': 'l', 'litara': 'l', 'l': 'l',
        'mililitar': 'ml', 'mililitara': 'ml', 'ml': 'ml',
        'komad': 'kom', 'komada': 'kom', 'kom': 'kom',
        'paket': 'pak', 'paketa': 'pak', 'pak': 'pak',
        'kutija': 'kutija', 'kutije': 'kutija'
    };
    
    const storageMap = {
        'zamrzivač 1': 'Zamrzivač 1', 'zamrzivac 1': 'Zamrzivač 1',
        'zamrzivač 2': 'Zamrzivač 2', 'zamrzivac 2': 'Zamrzivač 2',
        'zamrzivač 3': 'Zamrzivač 3', 'zamrzivac 3': 'Zamrzivač 3',
        'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
        'frižider': 'Frižider', 'frizider': 'Frižider', 'hladnjak': 'Frižider',
        'ostava': 'Ostava', 'špajz': 'Ostava', 'pantry': 'Ostava',
        'ostalo': 'Ostalo', 'drugo': 'Ostalo', 'other': 'Ostalo'
    };
    
    // Detekcija skladišta
    for (let [key, value] of Object.entries(storageMap)) {
        if (text.toLowerCase().includes(key)) {
            result.storage = value;
            text = text.replace(new RegExp(key, 'gi'), '').trim();
            break;
        }
    }

    // Detekcija jedinice mere i količine
    let foundUnit = false;
    for (let [key, value] of Object.entries(unitMap)) {
        let regex = new RegExp(`([\\d.]+)\\s*` + key, 'i');
        let match = text.match(regex);
        if (match) {
            result.quantity = match[1];
            result.piece = match[1];
            result.unit = value;
            text = text.replace(match[0], '').trim();
            foundUnit = true;
            break;
        }
    }

    // Ako nije našao jedinicu preko naziva, traži bilo koji broj u tekstu
    if (!foundUnit) {
        let numMatch = text.match(/\b([\d.]+)\b/);
        if (numMatch) {
            result.quantity = numMatch[1];
            result.piece = numMatch[1];
            text = text.replace(numMatch[0], '').trim();
        }
    }

    // Ostatak teksta je naziv proizvoda
    result.product_name = text.replace(/[,]/g, '').trim();
    
    if (!result.quantity) {
        result.quantity = '1';
        result.piece = '1';
    }

    console.log('✅ Parsirani rezultat:', result);
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

console.log('✅ Voice Commands učitan - FIX V2 verzija!');
