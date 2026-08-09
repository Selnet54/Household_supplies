// ============================================
// VOICE COMMANDS - PROŠIRENA VERZIJA (Ekran 4, Heder, Forma, Zalihe)
// ============================================
console.log('🎤 voiceCommands.js (Prošireni) je učitan!');

// Pomoćna funkcija za detekciju trenutnog jezika aplikacije (podrazumevano 'sr')
function getCurrentLang() {
    return window.currentLanguage || localStorage.getItem('appLanguage') || 'sr';
}

// ============================================
// GLAVNA FUNKCIJA ZA GLASOVNE KOMANDE
// ============================================
function voiceCommand(command) {
    console.log('🎤 Primljena komanda:', command);
    const cmd = command.toLowerCase().trim();
    const lang = getCurrentLang();

    // 1. IZLAZ / ZATVARANJE
    if (checkExitCommand(cmd)) {
        console.log('🚪 Izlaz iz aplikacije');
        if (typeof exitApp === 'function') exitApp();
        return true;
    }

    // 2. NAVIGACIJA PO HEDERU U ZALIHAMA (ili otvaranje zaliha)
    if (checkInventoryCommand(cmd)) {
        console.log('📦 Otvaranje zaliha i navigacija po hederu');
        currentScreenState = 'inventory';
        if (typeof showScreen === 'function') showScreen('mainScreen');
        if (typeof renderInventory === 'function') renderInventory();
        
        // Ako je korisnik naglasio navigaciju u hederu (npr. "pretraži zalihe", "filter zaliha", "sortiraj")
        handleInventoryHeaderNavigation(cmd);
        return true;
    }

    // 3. SPISAK / SHOPPING LISTA
    if (checkShoppingCommand(cmd)) {
        console.log('🛒 Otvaranje spiska');
        currentScreenState = 'shopping';
        if (typeof showScreen === 'function') showScreen('mainScreen');
        if (typeof renderShoppingList === 'function') renderShoppingList();
        return true;
    }

    // 4. EKRAN 4 / UNOS PROIZVODA (Kategorije i delovi iz productParts.js)
    if (checkAddCommand(cmd)) {
        console.log('➕ Otvaranje ekrana za unos (Kategorije)');
        currentScreenState = 'categories';
        currentCategory = '';
        currentSubcategory = '';
        currentProductPart = '';
        if (typeof showScreen === 'function') showScreen('mainScreen');
        if (typeof renderCategories === 'function') renderCategories();
        return true;
    }

    // 5. AUTOMATSKI UNOS PODATAKA REČIMA U POSTOJEĆU FORMU I ZALIHE
    // Ako se nalazimo u formi za unos ili korisnik diktira ceo artikl (npr. "dodaj pileće grudi 5 komada")
    if (processDirectDataInput(cmd, lang)) {
        return true;
    }

    // 6. AKO JE OTVOREN EKRAN 4 (Kategorije ili Delovi) - Glasovni izbor kategorije/dela
    if (window.currentScreenState === 'categories' || window.currentScreenState === 'subcategories') {
        if (handleScreen4VoiceSelection(cmd, lang)) {
            return true;
        }
    }

    // Nepoznata komanda
    console.log('❌ Nepoznata komanda:', cmd);
    const unknownTitle = (typeof t === 'function' ? t('unknown_command_title') : null) || 'Nepoznata komanda';
    const notRecognized = 'nije prepoznata u ovom kontekstu.';
    
    if (typeof showModernAlert === 'function') {
        showModernAlert(unknownTitle, `"${command}" ${notRecognized}`, '🎤');
    }
    return false;
}

// ============================================
// POMOĆNE FUNKCIJE ZA OBRADU KONTEKSTA
// ============================================

function checkInventoryCommand(cmd) {
    const k = ['zalihe', 'zaliha', 'stanje', 'inventory', 'inv', 'stock', 'keszlet', 'bestand', 'запасы', '库存', 'inventario'];
    return k.some(word => cmd.includes(word));
}

function checkShoppingCommand(cmd) {
    const k = ['spisak', 'lista', 'shopping', 'shop', 'list', 'bevásárlólista', 'einkaufsliste', 'список', '购物清单'];
    return k.some(word => cmd.includes(word));
}

function checkAddCommand(cmd) {
    const k = ['dodaj', 'unos', 'novi', 'novo', 'add', 'hozzáadás', 'hinzufügen', 'добавить', '添加', 'agregar'];
    return k.some(word => cmd.includes(word));
}

function checkExitCommand(cmd) {
    const k = ['izlaz', 'zatvori', 'exit', 'quit', 'close', 'kilépés', 'beenden', 'выход', '退出', 'salir'];
    return k.some(word => cmd.includes(word));
}

// Navigacija po dugmadima u hederu kada su zalihe otvorene
function handleInventoryHeaderNavigation(cmd) {
    // Primeri komandi za heder zaliha: "pretraži", "sortiraj", "filter", "osveži"
    if (cmd.includes('pretrazi') || cmd.includes('search') || cmd.includes('traži')) {
        const searchInput = document.getElementById('inventorySearch') || document.querySelector('.inventory-header input');
        if (searchInput) searchInput.focus();
    } else if (cmd.includes('sort') || cmd.includes('sortiraj')) {
        const sortBtn = document.getElementById('inventorySortBtn') || document.querySelector('.inventory-header .sort-btn');
        if (sortBtn) sortBtn.click();
    } else if (cmd.includes('filter') || cmd.includes('filtriraj')) {
        const filterBtn = document.getElementById('inventoryFilterBtn') || document.querySelector('.inventory-header .filter-btn');
        if (filterBtn) filterBtn.click();
    }
}

// Automatski unos podataka rečima u postojeću formu i upis u zalihe
function processDirectDataInput(cmd, lang) {
    // Proveravamo da li postoji aktivna forma za unos na ekranu
    const formInput = document.getElementById('productNameInput') || document.querySelector('input[name="productName"]') || document.querySelector('.form-input');
    
    if (formInput || cmd.startsWith('dodaj ')) {
        console.log('📝 Detektovan direktan unos rečima u formu');
        
        // Očisti komandu od reči "dodaj" da ostane čisti naziv
        let cleanText = cmd.replace(/dodaj|add|hozzáadd|добавить|添加/g, '').trim();
        
        if (cleanText.length > 0) {
            // 1. Automatski unesi u polje forme
            if (formInput) {
                formInput.value = cleanText;
                formInput.dispatchEvent(new Event('input', { bubbles: true }));
                formInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            // 2. Automatski prosledi u zalihe (poziv tvoje funkcije za čuvanje/unos)
            if (typeof saveProductToInventory === 'function') {
                saveProductToInventory(cleanText);
            } else if (typeof addProduct === 'function') {
                addProduct(cleanText);
            } else {
                // Alternativa: klikni na dugme "Sačuvaj" / "Dodaj" ako postoji
                const saveBtn = document.getElementById('saveProductBtn') || document.querySelector('.btn-save');
                if (saveBtn) saveBtn.click();
            }
            return true;
        }
    }
    return false;
}

// Glasovna interakcija sa 4. ekranom (Kategorije i delovi iz productParts.js)
function handleScreen4VoiceSelection(cmd, lang) {
    if (typeof productParts === 'undefined') return false;
    
    const langParts = productParts[lang] || productParts['sr'];
    const categories = Object.keys(langParts);

    // Proveri da li je korisnik izgovorio neku od kategorija (npr. "Pileće", "Mleko", itd.)
    const matchedCategory = categories.find(cat => cmd.includes(cat.toLowerCase()));
    
    if (matchedCategory) {
        console.log('📂 Glasovno izabrana kategorija:', matchedCategory);
        window.currentCategory = matchedCategory;
        window.currentScreenState = 'subcategories';
        
        // Pozovi render funkciju za podkategorije/delove 4. ekrana
        if (typeof renderSubcategories === 'function') {
            renderSubcategories(matchedCategory);
        } else if (typeof renderProductParts === 'function') {
            renderProductParts(matchedCategory);
        }
        return true;
    }

    // Ako je kategorija već izabrana, proveri da li je izgovoren neki deo iz te kategorije
    if (window.currentCategory && langParts[window.currentCategory]) {
        const partsList = langParts[window.currentCategory];
        const matchedPart = partsList.find(part => cmd.includes(part.toLowerCase()));
        
        if (matchedPart) {
            console.log('🥩 Glasovno izabran deo proizvoda:', matchedPart);
            window.currentProductPart = matchedPart;
            
            // Unesi u formu i automatski sačuvaj u zalihe
            processDirectDataInput(window.currentCategory + ' ' + matchedPart, lang);
            return true;
        }
    }

    return false;
}

// Izvoz u globalni prozor
window.voiceCommand = voiceCommand;
console.log('✅ Prošireni voiceCommands.js spreman!');
