// ============================================
// VOICE COMMANDS - USKLAĐENO SA HTML-OM (Ekran 3 i Ekran 4)
// ============================================
console.log('🎤 voiceCommands.js je učitan!');

function getCurrentLang() {
    return window.currentLanguage || localStorage.getItem('appLanguage') || 'sr';
}

// Glavna funkcija za obradu glasovnih komandi
function voiceCommand(command) {
    console.log('🎤 Primljena komanda:', command);
    const cmd = command.toLowerCase().trim();
    const lang = getCurrentLang();

    // 1. IZLAZ / EXIT
    if (checkExitCommand(cmd)) {
        console.log('🚪 Izlaz iz aplikacije');
        if (typeof exitApp === 'function') exitApp();
        return true;
    }

    // 2. ZALIHE (Inventory)
    if (checkInventoryCommand(cmd)) {
        console.log('📦 Prelaz na zalihe');
        
        // 1. Prvo eksplicitno sakrijemo Ekran 4 (glasovni meni) preko njegovog tačnog ID-ja!
        const voiceMenuScreen = document.getElementById('voiceMenuScreen'); // ili tačan ID tvog 4. ekrana
        if (voiceMenuScreen) {
            voiceMenuScreen.style.display = 'none';
        }

        // 2. Pozivamo i tvoju standardnu funkciju da sakrije sve ostalo
        if (typeof hideAllScreens === 'function') {
            hideAllScreens();
        }

        // 3. Otvaramo ekran sa zalihama
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) mainScreen.style.display = 'block';
        
        window.currentScreenState = 'inventory';
        if (typeof renderInventory === 'function') renderInventory();
        handleInventoryHeaderNavigation(cmd);
        return true;
    }
    // 3. SPISAK (Shopping List)
    if (checkShoppingCommand(cmd)) {
        console.log('🛒 Prelaz na spisak');
        hideAllScreens();
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) mainScreen.style.display = 'block';
        window.currentScreenState = 'shopping';
        if (typeof renderShoppingList === 'function') renderShoppingList();
        return true;
    }

    // 4. DODAJ PROIZVOD (Add Product -> Otvara kategorije/delove iz productParts.js)
    if (checkAddCommand(cmd)) {
        console.log('➕ Otvaranje kategorija za unos');
        hideAllScreens();
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) mainScreen.style.display = 'block';
        window.currentScreenState = 'categories';
        if (typeof renderCategories === 'function') renderCategories();
        return true;
    }

    // 5. DIREKTAN UNOS REČIMA U FORMU / ZALIHE
    if (processDirectDataInput(cmd, lang)) {
        return true;
    }

    // 6. GLASOVNI IZBOR KATEGORIJA/DELOVA (ako smo na ekranu kategorija)
    if (window.currentScreenState === 'categories' || window.currentScreenState === 'subcategories') {
        if (handleProductPartsVoice(cmd, lang)) {
            return true;
        }
    }

    // Ako komanda nije prepoznata, prikaži status na Ekranu 4 ako postoji
    const voiceStatus = document.getElementById('voiceStatus');
    if (voiceStatus) {
        voiceStatus.innerText = `❌ Nije prepoznato: "${command}"`;
    }

    return false;
}

// ============================================
// POMOĆNE FUNKCIJE ZA PROVERU REČI
// ============================================
function checkInventoryCommand(cmd) {
    const k = ['zalihe', 'zaliha', 'stanje', 'inventory', 'inv', 'stock', 'keszlet', 'bestand', 'запасы', '库存', 'inventario'];
    return k.some(w => cmd.includes(w));
}

function checkShoppingCommand(cmd) {
    const k = ['spisak', 'lista', 'shopping', 'shop', 'list', 'bevásárlólista', 'einkaufsliste', 'список', '购物清单'];
    return k.some(w => cmd.includes(w));
}

function checkAddCommand(cmd) {
    const k = ['dodaj', 'unos', 'novi', 'novo', 'add', 'hozzáadás', 'hinzufügen', 'добавить', '添加', 'agregar'];
    return k.some(w => cmd.includes(w));
}

function checkExitCommand(cmd) {
    const k = ['izlaz', 'zatvori', 'exit', 'quit', 'close', 'kilépés', 'beenden', 'выход', '退出', 'salir'];
    return k.some(w => cmd.includes(w));
}

// Sakrivanje svih ekrana (pomoćna funkcija da se osigura prelaz na `mainScreen` ili drugi ekran)
function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });
}

// Navigacija po hederu zaliha
function handleInventoryHeaderNavigation(cmd) {
    if (cmd.includes('pretrazi') || cmd.includes('search') || cmd.includes('traži')) {
        const inp = document.getElementById('inventorySearch');
        if (inp) inp.focus();
    }
}

// Automatski unos podataka u formu i upis
function processDirectDataInput(cmd, lang) {
    let cleanText = cmd.replace(/dodaj|add|hozzáadd|добавить|添加/g, '').trim();
    const formInput = document.getElementById('productNameInput') || document.querySelector('input[name="productName"]');
    
    if (formInput && cleanText.length > 0) {
        formInput.value = cleanText;
        formInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        if (typeof saveProductToInventory === 'function') {
            saveProductToInventory(cleanText);
        } else if (typeof addProduct === 'function') {
            addProduct(cleanText);
        }
        return true;
    }
    return false;
}

// Povezivanje sa productParts.js kroz glasovne komande
function handleProductPartsVoice(cmd, lang) {
    if (typeof productParts === 'undefined') return false;
    const langParts = productParts[lang] || productParts['sr'];
    const categories = Object.keys(langParts);

    // Provera kategorije
    const matchedCategory = categories.find(cat => cmd.includes(cat.toLowerCase()));
    if (matchedCategory) {
        window.currentCategory = matchedCategory;
        window.currentScreenState = 'subcategories';
        if (typeof renderSubcategories === 'function') {
            renderSubcategories(matchedCategory);
        }
        return true;
    }

    // Provera dela proizvoda u izabranoj kategoriji
    if (window.currentCategory && langParts[window.currentCategory]) {
        const partsList = langParts[window.currentCategory];
        const matchedPart = partsList.find(p => cmd.includes(p.toLowerCase()));
        if (matchedPart) {
            window.currentProductPart = matchedPart;
            processDirectDataInput(window.currentCategory + ' ' + matchedPart, lang);
            return true;
        }
    }
    return false;
}

// Eksportovanje funkcije u globalni prostor
window.voiceCommand = voiceCommand;
console.log('✅ voiceCommands.js prilagođen HTML-u je spreman!');
