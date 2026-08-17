// ============================================
// VOICE COMMANDS - GLASOVNE KOMANDE - NAPREDNI UNOS
// ============================================

let recognition = null;
let fullSpeechResult = '';
let speechTimeout = null;
let voiceEntryMode = false; // Pratimo da li smo u modu unosa

// ===== POMOĆNA FUNKCIJA ZA SAKRIVANJE VOICE MENIJA =====
function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
        console.log('🔇 Voice menu sakriven');
    }
}

// ===== NOVA FUNKCIJA ZA NAPREDNO PARSIRANJE GLASOVNOG UNOSA =====
function parseAdvancedVoiceInput(command) {
    console.log('🔍 Parsiranje naprednog unosa:', command);
    
    const result = {
        product_name: '',
        quantity: '1',
        unit: 'komad',
        shelf_life: '12',
        storage: 'Soba'
    };
    
    // 1. IZDVOJI NAZIV PROIZVODA (prva reč ili više reči pre broja)
    const numberMatch = command.match(/(\d+)\s*(?:komad|kg|g|l|ml|kom|parče|parčeta)?/i);
    let productEndIndex = command.length;
    
    if (numberMatch && numberMatch.index !== undefined) {
        productEndIndex = numberMatch.index;
    } else {
        // Ako nema broja, uzmi sve do prvog poznatog keyword-a
        const keywords = ['kg', 'g', 'l', 'ml', 'komad', 'kom', 'parče', 'rok', 'zamrzivač', 'frizider', 'soba'];
        let minIndex = command.length;
        keywords.forEach(kw => {
            const idx = command.toLowerCase().indexOf(kw);
            if (idx !== -1 && idx < minIndex) minIndex = idx;
        });
        if (minIndex < command.length) productEndIndex = minIndex;
    }
    
    result.product_name = command.substring(0, productEndIndex).trim();
    
    // 2. IZDVOJI KOLIČINU I JEDINICU
    const quantityPatterns = [
        /(\d+)\s*(?:kg|kilogram|kilograma)/i,
        /(\d+)\s*(?:g|gram|grama)/i,
        /(\d+)\s*(?:l|lit|litra|litara)/i,
        /(\d+)\s*(?:ml|mililitar|mililitara)/i,
        /(\d+)\s*(?:komad|kom|parče|parčeta)/i,
        /(\d+)/ // default - samo broj
    ];
    
    let foundQuantity = false;
    for (const pattern of quantityPatterns) {
        const match = command.match(pattern);
        if (match) {
            result.quantity = match[1];
            // Odredi jedinicu
            const fullMatch = match[0].toLowerCase();
            if (fullMatch.includes('kg') || fullMatch.includes('kilogram')) {
                result.unit = 'kg';
            } else if (fullMatch.includes('g') && !fullMatch.includes('kg')) {
                result.unit = 'g';
            } else if (fullMatch.includes('l') || fullMatch.includes('lit')) {
                result.unit = 'l';
            } else if (fullMatch.includes('ml')) {
                result.unit = 'ml';
            } else if (fullMatch.includes('komad') || fullMatch.includes('kom') || fullMatch.includes('parče')) {
                result.unit = 'komad';
            } else {
                result.unit = 'komad';
            }
            foundQuantity = true;
            break;
        }
    }
    
    // 3. IZDVOJI ROK TRAJANJA
    const shelfLifeMatch = command.match(/rok\s*(\d+)/i) || command.match(/(\d+)\s*(?:mesec|meseci|meseci|m)/i);
    if (shelfLifeMatch) {
        result.shelf_life = shelfLifeMatch[1];
    }
    
    // 4. IZDVOJI SKLADIŠTE
    const storageKeywords = {
        'zamrzivač': 'Zamrzivač',
        'frizider': 'Frižider',
        'soba': 'Soba',
        'podrum': 'Podrum',
        'ostava': 'Ostava'
    };
    
    for (const [key, value] of Object.entries(storageKeywords)) {
        if (command.toLowerCase().includes(key)) {
            result.storage = value;
            break;
        }
    }
    
    // 5. OČISTI NAZIV OD SUVIŠNIH REČI
    const removeWords = ['kg', 'kilogram', 'gram', 'litar', 'litra', 'ml', 'komad', 'parče', 
                         'rok', 'mesec', 'meseci', 'zamrzivač', 'frizider', 'soba', 'podrum', 
                         'ostava', 'plus', 'start', 'unos', 'dodaj'];
    let cleanName = result.product_name;
    removeWords.forEach(word => {
        const regex = new RegExp('\\b' + word + '\\b', 'gi');
        cleanName = cleanName.replace(regex, '');
    });
    cleanName = cleanName.replace(/\s+/g, ' ').trim();
    
    if (cleanName) {
        result.product_name = cleanName;
    }
    
    console.log('✅ Parsirani podaci:', result);
    return result;
}

// ===== MODIFIKOVANA processStartCommand FUNKCIJA =====
function processStartCommand(command) {
    console.log('🚀 Procesiram Start komandu:', command);
    
    // Koristi napredno parsiranje
    let data = parseAdvancedVoiceInput(command);
    
    // Proveri da li je naziv prepoznat
    if (!data.product_name || data.product_name.length < 2) {
        showModernAlert('Greška', 'Nije prepoznat naziv proizvoda! Molimo pokušajte ponovo.', '❌');
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Nije prepoznat naziv. Pokušajte: "Start gril pile 2 kg 6 zamrzivač"';
            statusEl.style.color = '#f44336';
        }
        return false;
    }
    
    // Uđi u mod unosa
    voiceEntryMode = true;
    
    // Automatski otvori Data Entry ako nije otvoren
    const productInput = document.getElementById('productInput');
    if (!productInput || document.getElementById('dataEntryScreen')?.style.display === 'none') {
        console.log('📂 Otvaram Data Entry...');
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        if (typeof renderDataEntry === 'function') {
            renderDataEntry('');
        } else if (typeof window.renderDataEntry === 'function') {
            window.renderDataEntry('');
        }
        
        // Sačekaj da se UI učita pa popuni
        setTimeout(function() {
            popuniPodatkeIZaIzvrsiUnos(data);
        }, 500);
    } else {
        console.log('📝 Data Entry je otvoren, popunjavam...');
        popuniPodatkeIZaIzvrsiUnos(data);
    }
    
    return true;
}

// ===== NOVA FUNKCIJA ZA POPUNJAVANJE I AUTOMATSKI UNOS =====
function popuniPodatkeIZaIzvrsiUnos(data) {
    console.log('📝 Popunjavam podatke:', data);
    
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const unitSelect = document.getElementById('unitSelect');
    const storageSelect = document.getElementById('storageSelect');
    
    // Popuni polja
    if (productInput) {
        productInput.value = data.product_name;
        productInput.dispatchEvent(new Event('input'));
    }
    
    if (pieceInput) {
        pieceInput.value = data.quantity;
        pieceInput.dispatchEvent(new Event('input'));
    }
    
    if (quantityInput) {
        quantityInput.value = data.quantity;
        quantityInput.dispatchEvent(new Event('input'));
    }
    
    if (shelfLifeInput) {
        shelfLifeInput.value = data.shelf_life;
        shelfLifeInput.dispatchEvent(new Event('input'));
    }
    
    // Jedinica
    if (unitSelect && data.unit) {
        for (let option of unitSelect.options) {
            if (option.value === data.unit || option.text.toLowerCase().includes(data.unit.toLowerCase())) {
                option.selected = true;
                break;
            }
        }
        unitSelect.dispatchEvent(new Event('change'));
    }
    
    // Skladište
    if (storageSelect && data.storage) {
        for (let option of storageSelect.options) {
            if (option.value === data.storage || option.text.toLowerCase().includes(data.storage.toLowerCase())) {
                option.selected = true;
                break;
            }
        }
        storageSelect.dispatchEvent(new Event('change'));
    }
    
    // Ažuriraj rok trajanja
    if (typeof updateExpiryDate === 'function') {
        updateExpiryDate();
    }
    
    // Ažuriraj listu unosa
    if (typeof prikaziSveUnose === 'function') {
        prikaziSveUnose();
    }
    
    // Status poruka
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `✅ Popunjeno: ${data.product_name} (${data.quantity} ${data.unit})`;
        statusEl.style.color = '#4CAF50';
    }
    
    // Automatski sačuvaj proizvod
    setTimeout(function() {
        if (typeof saveProduct === 'function') {
            // Sačuvaj podatke o glasovnom unosu pre čuvanja
            if (productInput && productInput.value) {
                const recentEntries = JSON.parse(localStorage.getItem('recentVoiceEntries') || '[]');
                recentEntries.push({
                    product_name: productInput.value,
                    timestamp: new Date().toISOString()
                });
                if (recentEntries.length > 20) {
                    recentEntries.shift();
                }
                localStorage.setItem('recentVoiceEntries', JSON.stringify(recentEntries));
            }
            
            saveProduct();
            
            showModernAlert('✅ Uspešno', `Dodato: ${data.product_name} (${data.quantity} ${data.unit})`, '🎤');
            
            if (statusEl) {
                statusEl.textContent = '🎤 Recite sledeći unos (npr. "Start mleko 2l 14 frižider") ili "End" za kraj';
                statusEl.style.color = '#FFD700';
            }
            
            // Očisti polja za sledeći unos
            setTimeout(() => {
                if (productInput) {
                    productInput.value = '';
                    productInput.focus();
                }
                if (pieceInput) pieceInput.value = '1';
                if (quantityInput) quantityInput.value = '1';
                if (shelfLifeInput) shelfLifeInput.value = '12';
            }, 500);
        }
    }, 800);
}

// ===== NOVA FUNKCIJA ZA OBRADU "END" KOMANDE =====
function processEndCommand() {
    console.log('🏁 Procesiram END komandu - prelazak na zalihe');
    
    voiceEntryMode = false;
    
    // Sakrij voice menu
    hideVoiceMenu();
    
    // Prikaži zalihe
    setTimeout(function() {
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        
        // Prvo osveži podatke
        if (typeof loadProductsFromStorage === 'function') {
            loadProductsFromStorage();
        }
        
        // Prikaži inventar
        if (typeof renderInventory === 'function') {
            renderInventory();
        }
        
        // Označi nove unose svetlo plavom bojom
        setTimeout(() => {
            oznaciNoveUnose();
        }, 300);
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '✅ Svi unosi sačuvani. Novi proizvodi su označeni plavom bojom.';
            statusEl.style.color = '#4CAF50';
        }
        
        // Prikaži obaveštenje
        showModernAlert('✅ Završeno', 'Svi glasovni unosi su sačuvani! Novi proizvodi su označeni plavom bojom.', '📦');
    }, 500);
}

// ===== FUNKCIJA ZA OZNAČAVANJE NOVIH UNOSA =====
function oznaciNoveUnose() {
    console.log('🔵 Označavam nove unose');
    
    // Dohvati sve redove u tabeli inventara
    const inventoryRows = document.querySelectorAll('#inventoryTable tbody tr');
    if (!inventoryRows.length) {
        console.log('⚠️ Nema redova za označavanje');
        return;
    }
    
    // Dohvati poslednje unose
    const recentProducts = JSON.parse(localStorage.getItem('recentVoiceEntries') || '[]');
    const recentNames = recentProducts.map(p => p.product_name);
    
    inventoryRows.forEach((row, index) => {
        // Ukloni postojeće oznake
        row.classList.remove('new-entry', 'voice-new-entry');
        row.style.backgroundColor = '';
        row.style.borderLeft = '';
        row.style.transition = 'background-color 0.5s ease';
        
        // Proveri da li je red novi unos
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
            const productName = cells[0]?.textContent?.trim() || '';
            
            // Proveri da li je proizvod u listi nedavno dodatih
            if (recentNames.includes(productName)) {
                row.classList.add('new-entry', 'voice-new-entry');
                row.style.backgroundColor = '#e3f2fd';
                row.style.borderLeft = '4px solid #2196F3';
                
                // Dodaj zvezdicu pored naziva
                if (cells[0]) {
                    cells[0].innerHTML = `🎤 ${cells[0].textContent}`;
                }
            }
        }
    });
}

// ===== DODAJ ANIMACIJU ZA NOVE UNOSE =====
function addHighlightAnimation() {
    // Proveri da li već postoji
    if (document.getElementById('voiceStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'voiceStyles';
    style.textContent = `
        @keyframes highlightNew {
            0% { background-color: #e3f2fd; }
            50% { background-color: #bbdefb; }
            100% { background-color: #e3f2fd; }
        }
        
        .new-entry {
            animation: highlightNew 2s ease 3;
            border-left: 4px solid #2196F3 !important;
        }
        
        .voice-new-entry td:first-child::before {
            content: "🎤 ";
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);
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
    
    // ===== PRVO PROVERI "START" KOMANDU =====
    if (cmd.includes('start') || cmd.includes('stat') || cmd.includes('stard')) {
        console.log('🚀 Prepoznat START!');
        processStartCommand(command);
        return true;
    }
    
    // ===== PROVERI "END" KOMANDU =====
    if (cmd.includes('end') || cmd.includes('kraj') || cmd.includes('gotovo') || 
        cmd.includes('stop') || cmd.includes('završi') || cmd.includes('done')) {
        console.log('🏁 Prepoznat END!');
        processEndCommand();
        return true;
    }
    
    // ===== UNOS PODATAKA - SVI JEZICI =====
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
                statusEl.textContent = '🎤 Sada recite "Start" pa diktirajte podatke (naziv, komad, količina, rok, skladište)';
                statusEl.style.color = '#4CAF50';
            }
            setTimeout(function() {
                const productInput = document.getElementById('productInput');
                if (productInput) productInput.focus();
            }, 300);
        }, 300);
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

// ===== FUNKCIJA ZA PRIKAZIVANJE EKRANA =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.style.display = 'flex';
        screen.classList.add('active');
    }
}

// ===== MODERN ALERT FUNKCIJA =====
function showModernAlert(title, message, icon = 'ℹ️') {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 400px;
        width: 90%;
        text-align: center;
        animation: fadeInAlert 0.3s ease;
    `;
    alertDiv.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
        <h3 style="margin: 10px 0; color: #333;">${title}</h3>
        <p style="margin: 10px 0 20px; color: #666;">${message}</p>
        <button onclick="this.parentElement.remove()" style="
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 30px;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
        ">OK</button>
    `;
    document.body.appendChild(alertDiv);
    
    // Dodaj animaciju
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInAlert {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
    `;
    document.head.appendChild(style);
}

// ===== INICIJALIZACIJA =====
function initVoiceCommands() {
    addHighlightAnimation();
    console.log('✅ Voice Commands učitan - NAPREDNI UNOS verzija!');
    console.log('📖 Primeri korišćenja:');
    console.log('   "Start gril pile 2kg 6 zamrzivač"');
    console.log('   "Start mleko 2l 14 frižider"');
    console.log('   "Start jabuke 1kg 30 soba"');
    console.log('   "End" - završava unos i prikazuje zalihe');
}

// ===== IZVEZI FUNKCIJE GLOBALNO =====
window.processVoiceCommand = processVoiceCommand;
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.processStartCommand = processStartCommand;
window.processEndCommand = processEndCommand;
window.popuniPodatkeIZaIzvrsiUnos = popuniPodatkeIZaIzvrsiUnos;
window.parseAdvancedVoiceInput = parseAdvancedVoiceInput;
window.oznaciNoveUnose = oznaciNoveUnose;
window.initVoiceCommands = initVoiceCommands;

// ===== AUTOMATSKO POKRETANJE =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVoiceCommands);
} else {
    initVoiceCommands();
}
