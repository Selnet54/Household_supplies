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

    // FUNKCIJA ZA SIGURNO SAKRIVANJE SVIH EKRANA
    function forceHideAllScreens() {
        // Sakrij sve ekrane
        document.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
            screen.classList.remove('active');
        });
        
        // SPECIFIČNO sakrij voiceMenuScreen
        const voiceMenu = document.getElementById('voiceMenuScreen');
        if (voiceMenu) {
            voiceMenu.style.display = 'none';
            voiceMenu.classList.remove('active');
        }
        
        // Sakrij i sve moguće varijante
        document.querySelectorAll('[id*="voice"],[id*="Voice"],[class*="voice"]').forEach(el => {
            el.style.display = 'none';
        });
    }

    // PRIKAŽI STATUS NA 4. EKRANU
    function setVoiceStatus(text, isSuccess = true) {
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.innerText = text;
            status.style.color = isSuccess ? '#4CAF50' : '#f44336';
        }
        // Emituj događaj da je komanda obrađena
        document.dispatchEvent(new CustomEvent('voiceCommandProcessed', { 
            detail: { success: isSuccess, command: command }
        }));
    }

    // 1. IZLAZ / EXIT
    if (checkExitCommand(cmd)) {
        console.log('🚪 Izlaz iz aplikacije');
        setVoiceStatus('✅ Izlazim iz aplikacije...', true);
        forceHideAllScreens();
        if (typeof exitApp === 'function') exitApp();
        return true;
    }

    // 2. ZALIHE (Inventory) - GLAVNA FUNKCIJA
    if (checkInventoryCommand(cmd)) {
        console.log('📦 Prelaz na zalihe - POČINJE');
        
        // 1. Prisilno sakrij SVE ekrane
        forceHideAllScreens();
        
        // 2. SAČEKAJ 100ms da se DOM osveži
        setTimeout(() => {
            // 3. Prikaži mainScreen
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'block';
                mainScreen.classList.add('active');
                console.log('✅ mainScreen prikazan');
            } else {
                console.error('❌ mainScreen nije pronađen!');
            }
            
            // 4. Postavi stanje
            window.currentScreenState = 'inventory';
            
            // 5. Renderuj inventory
            if (typeof renderInventory === 'function') {
                renderInventory();
                console.log('✅ renderInventory pozvan');
            } else {
                console.error('❌ renderInventory nije definisan!');
            }
            
            // 6. Ažuriraj status
            const status = document.getElementById('voiceStatus');
            if (status) {
                status.innerText = '📦 Prikazane zalihe';
                status.style.color = '#4CAF50';
            }
            
            // 7. Emituj uspešan događaj
            document.dispatchEvent(new CustomEvent('voiceCommandProcessed', { 
                detail: { success: true, command: 'inventory' }
            }));
            
        }, 100);
        
        return true;
    }
    
    // 3. SPISAK (Shopping List)
    if (checkShoppingCommand(cmd)) {
        console.log('🛒 Prelaz na spisak');
        setVoiceStatus('🛒 Otvaram spisak...', true);
        forceHideAllScreens();
        
        setTimeout(() => {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'block';
                mainScreen.classList.add('active');
            }
            window.currentScreenState = 'shopping';
            if (typeof renderShoppingList === 'function') renderShoppingList();
        }, 100);
        
        return true;
    }

    // 4. DODAJ PROIZVOD (Add Product)
    if (checkAddCommand(cmd)) {
        console.log('➕ Otvaranje kategorija za unos');
        setVoiceStatus('➕ Otvaram kategorije...', true);
        forceHideAllScreens();
        
        setTimeout(() => {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'block';
                mainScreen.classList.add('active');
            }
            window.currentScreenState = 'categories';
            if (typeof renderCategories === 'function') renderCategories();
        }, 100);
        
        return true;
    }

    // 5. GLASOVNI IZBOR KATEGORIJA/DELOVA
    if (window.currentScreenState === 'categories' || window.currentScreenState === 'subcategories') {
        if (handleProductPartsVoice(cmd, lang)) {
            setVoiceStatus(`✅ Dodato: ${cmd}`, true);
            return true;
        }
    }

    // Ako komanda nije prepoznata
    setVoiceStatus(`❌ Nije prepoznato: "${command}". Pokušajte ponovo.`, false);
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

    const matchedCategory = categories.find(cat => cmd.includes(cat.toLowerCase()));
    if (matchedCategory) {
        window.currentCategory = matchedCategory;
        window.currentScreenState = 'subcategories';
        if (typeof renderSubcategories === 'function') {
            renderSubcategories(matchedCategory);
        }
        return true;
    }

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
