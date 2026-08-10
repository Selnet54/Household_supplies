// ============================================
// VOICE COMMANDS - POPRAVLJENA VERZIJA
// ============================================
console.log('🎤 voiceCommands.js je učitan!');

// GLOBALNA VARIJABLA ZA PRAĆENJE
window.voiceCommandProcessing = false;

function getCurrentLang() {
    return window.currentLanguage || localStorage.getItem('appLanguage') || 'sr';
}

// Glavna funkcija za obradu glasovnih komandi
function voiceCommand(command) {
    console.log('🎤 Primljena komanda:', command);
    
    // SPREČI DUPLO IZVRŠAVANJE
    if (window.voiceCommandProcessing) {
        console.log('⏳ Već se obrađuje komanda, preskačem');
        return false;
    }
    window.voiceCommandProcessing = true;
    
    const cmd = command.toLowerCase().trim();
    const lang = getCurrentLang();

    // FUNKCIJA ZA ČIŠĆENJE
    function cleanup() {
        window.voiceCommandProcessing = false;
        
        // ZAUSTAVI VOICE RECOGNITION AKO POSTOJI
        if (window.recognition) {
            try {
                window.recognition.stop();
                window.recognition = null;
                console.log('🛑 Recognition zaustavljen iz cleanup');
            } catch(e) {}
        }
        
        // POZOVI stopVoiceRecognition AKO POSTOJI
        if (typeof window.stopVoiceRecognition === 'function') {
            window.stopVoiceRecognition();
        }
    }

    // 1. IZLAZ / EXIT
    if (checkExitCommand(cmd)) {
        console.log('🚪 Izlaz iz aplikacije');
        cleanup();
        
        const voiceMenu = document.getElementById('voiceMenuScreen');
        if (voiceMenu) {
            voiceMenu.style.display = 'none';
            voiceMenu.classList.remove('active');
        }
        
        document.querySelectorAll('.screen').forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });
        
        const login = document.getElementById('loginScreen');
        if (login) {
            login.style.display = 'flex';
            login.classList.add('active');
        }
        
        if (typeof exitApp === 'function') exitApp();
        
        // Emituj događaj
        document.dispatchEvent(new CustomEvent('voiceCommandProcessed', { 
            detail: { success: true, command: 'exit' }
        }));
        
        return true;
    }

    // 2. ZALIHE (Inventory)
    if (checkInventoryCommand(cmd)) {
        console.log('📦 Prelaz na zalihe');
        cleanup();
        
        // SAKRIVAJ SVE EKRANE
        document.querySelectorAll('.screen').forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });
        
        // EKSPLICITNO SAKRIJ VOICE MENU
        const voiceMenu = document.getElementById('voiceMenuScreen');
        if (voiceMenu) {
            voiceMenu.style.display = 'none';
            voiceMenu.classList.remove('active');
        }
        
        // PRIKAŽI MAIN SCREEN
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
            console.log('✅ mainScreen prikazan');
        }
        
        // POSTAVI STANJE
        window.currentScreenState = 'inventory';
        
        // RENDER INVENTORY
        if (typeof renderInventory === 'function') {
            renderInventory();
            console.log('✅ renderInventory pozvan');
        } else {
            console.error('❌ renderInventory nije definisan!');
        }
        
        // AŽURIRAJ STATUS
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.innerText = '✅ Komanda izvršena: Zalihe';
            status.style.color = '#4CAF50';
        }
        
        // EMITUJ DOGAĐAJ
        document.dispatchEvent(new CustomEvent('voiceCommandProcessed', { 
            detail: { success: true, command: 'inventory' }
        }));
        
        return true;
    }
    
    // 3. SPISAK (Shopping List)
    if (checkShoppingCommand(cmd)) {
        console.log('🛒 Prelaz na spisak');
        cleanup();
        
        document.querySelectorAll('.screen').forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });
        
        const voiceMenu = document.getElementById('voiceMenuScreen');
        if (voiceMenu) {
            voiceMenu.style.display = 'none';
            voiceMenu.classList.remove('active');
        }
        
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        
        window.currentScreenState = 'shopping';
        if (typeof renderShoppingList === 'function') renderShoppingList();
        
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.innerText = '✅ Komanda izvršena: Spisak';
            status.style.color = '#4CAF50';
        }
        
        document.dispatchEvent(new CustomEvent('voiceCommandProcessed', { 
            detail: { success: true, command: 'shopping' }
        }));
        
        return true;
    }

    // 4. DODAJ PROIZVOD (Add Product)
    if (checkAddCommand(cmd)) {
        console.log('➕ Otvaranje kategorija za unos');
        cleanup();
        
        document.querySelectorAll('.screen').forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });
        
        const voiceMenu = document.getElementById('voiceMenuScreen');
        if (voiceMenu) {
            voiceMenu.style.display = 'none';
            voiceMenu.classList.remove('active');
        }
        
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        
        window.currentScreenState = 'categories';
        if (typeof renderCategories === 'function') renderCategories();
        
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.innerText = '✅ Komanda izvršena: Dodaj proizvod';
            status.style.color = '#4CAF50';
        }
        
        document.dispatchEvent(new CustomEvent('voiceCommandProcessed', { 
            detail: { success: true, command: 'add' }
        }));
        
        return true;
    }

    // 5. GLASOVNI IZBOR KATEGORIJA/DELOVA
    if (window.currentScreenState === 'categories' || window.currentScreenState === 'subcategories') {
        if (handleProductPartsVoice(cmd, lang)) {
            cleanup();
            const status = document.getElementById('voiceStatus');
            if (status) {
                status.innerText = `✅ Dodato: ${cmd}`;
                status.style.color = '#4CAF50';
            }
            document.dispatchEvent(new CustomEvent('voiceCommandProcessed', { 
                detail: { success: true, command: cmd }
            }));
            return true;
        }
    }

    // Ako komanda nije prepoznata
    const status = document.getElementById('voiceStatus');
    if (status) {
        status.innerText = `❌ Nije prepoznato: "${command}"`;
        status.style.color = '#f44336';
    }
    
    cleanup();
    document.dispatchEvent(new CustomEvent('voiceCommandProcessed', { 
        detail: { success: false, command: command }
    }));
    
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

// POMOĆNA FUNKCIJA ZA POVRATAK
function goBackFromVoice() {
    console.log('◀ Povratak sa voice menija');
    
    // Zaustavi recognition
    if (typeof window.stopVoiceRecognition === 'function') {
        window.stopVoiceRecognition();
    }
    
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
    }
    
    const choiceScreen = document.getElementById('choiceScreen');
    if (choiceScreen) {
        choiceScreen.style.display = 'flex';
        choiceScreen.classList.add('active');
    }
}

// ============================================
// DODATNO - SLUŠAJ DOGAĐAJ ZA ZAUSTAVLJANJE
// ============================================
document.addEventListener('voiceCommandProcessed', function(e) {
    console.log('📢 Događaj voiceCommandProcessed primljen:', e.detail);
    if (e.detail && e.detail.success) {
        if (typeof window.stopVoiceRecognition === 'function') {
            console.log('🛑 Pozivam stopVoiceRecognition iz događaja');
            window.stopVoiceRecognition();
        }
        if (typeof recognition !== 'undefined' && recognition) {
            try {
                recognition.stop();
                recognition = null;
                console.log('🛑 Recognition zaustavljen direktno');
            } catch(e) {}
        }
    }
});

// Kada se klikne na dugme u voice menu-u, zaustavi
document.addEventListener('click', function(e) {
    if (e.target.closest('.voice-btn')) {
        console.log('🖱️ Kliknuto na voice dugme - zaustavljam recognition');
        if (typeof window.stopVoiceRecognition === 'function') {
            window.stopVoiceRecognition();
        }
        if (typeof recognition !== 'undefined' && recognition) {
            try {
                recognition.stop();
                recognition = null;
            } catch(e) {}
        }
    }
    if (e.target.closest('#backFromVoiceBtn')) {
        console.log('🖱️ Kliknuto na Nazad - zaustavljam recognition');
        if (typeof window.stopVoiceRecognition === 'function') {
            window.stopVoiceRecognition();
        }
        if (typeof recognition !== 'undefined' && recognition) {
            try {
                recognition.stop();
                recognition = null;
            } catch(e) {}
        }
    }
});
// Eksportovanje funkcije u globalni prostor
window.voiceCommand = voiceCommand;
window.goBackFromVoice = goBackFromVoice;

console.log('✅ voiceCommands.js je spreman!');
console.log('✅ voiceCommand dostupan:', typeof window.voiceCommand === 'function');
// ============================================
// DIREKTNO SAKRIVANJE VOICE MENU-A
// ============================================
function forceHideVoiceMenu() {
    console.log('🔇 Prisilno sakrivanje voice menu-a');
    
    // Sakrij voiceMenuScreen
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
        voiceMenu.classList.remove('show');
        console.log('✅ voiceMenuScreen sakriven');
    }
    
    // Sakrij sve ekrane koji imaju .screen klasu
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    // Prikaži mainScreen
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
        console.log('✅ mainScreen prikazan');
    }
}

// Izvezi funkciju
window.forceHideVoiceMenu = forceHideVoiceMenu;

// Dodaj event listener za direktno sakrivanje
document.addEventListener('voiceCommandProcessed', function(e) {
    console.log('📢 voiceCommandProcessed događaj primljen:', e.detail);
    if (e.detail && e.detail.success) {
        // Prisilno sakrij voice menu
        forceHideVoiceMenu();
        
        // Zaustavi recognition
        if (typeof window.stopVoiceRecognition === 'function') {
            window.stopVoiceRecognition();
        }
        if (typeof recognition !== 'undefined' && recognition) {
            try {
                recognition.stop();
                recognition = null;
            } catch(e) {}
        }
    }
});

console.log('✅ forceHideVoiceMenu dodat!');
