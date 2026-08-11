// ============================================
// VOICE COMMANDS - KOMPLETNO ISPRAVLJENA VERZIJA
// ============================================
console.log('🎤 voiceCommands.js je učitan!');

// GLOBALNA VARIJABLA ZA PRAĆENJE
window.voiceCommandProcessing = false;

function getCurrentLang() {
    return window.currentLanguage || localStorage.getItem('appLanguage') || 'sr';
}

// Pomoćna funkcija za čišćenje teksta pre poređenja (uklanja interpunkciju, razmake i normalizuje slova)
function cleanCmd(cmd) {
    if (!cmd) return '';
    return cmd.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
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
    
    const cleanText = cleanCmd(command);
    const lang = getCurrentLang();

    // FUNKCIJA ZA ČIŠĆENJE RESURSA
    function cleanup() {
        window.voiceCommandProcessing = false;
        
        if (window.recognition) {
            try {
                window.recognition.stop();
                window.recognition = null;
                console.log('🛑 Recognition zaustavljen iz cleanup');
            } catch(e) {}
        }
        
        if (typeof window.stopVoiceRecognition === 'function') {
            window.stopVoiceRecognition();
        }
    }

    // 1. IZLAZ / EXIT
    if (checkExitCommand(cleanText)) {
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
        
        document.dispatchEvent(new CustomEvent('voiceCommandProcessed', { 
            detail: { success: true, command: 'exit' }
        }));
        
        return true;
    }

    // 2. ZALIHE (Inventory)
    if (checkInventoryCommand(cleanText)) {
        console.log('📦 Prelaz na zalihe');
        cleanup();
        window.currentScreenState = 'inventory';
        forceHideVoiceMenu();
        
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.innerText = '✅ Komanda izvršena: Zalihe';
            status.style.color = '#4CAF50';
        }
        
        document.dispatchEvent(new CustomEvent('voiceCommandProcessed', { 
            detail: { success: true, command: 'inventory' }
        }));
        
        return true;
    }
    
    // 3. SPISAK (Shopping List)
    if (checkShoppingCommand(cleanText)) {
        console.log('🛒 Prelaz na spisak');
        cleanup();
        window.currentScreenState = 'shopping';
        forceHideVoiceMenu();
        
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
    if (checkAddCommand(cleanText)) {
        console.log('➕ Otvaranje kategorija za unos');
        cleanup();
        window.currentScreenState = 'categories';
        forceHideVoiceMenu();
        
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
        if (handleProductPartsVoice(cleanText, lang)) {
            cleanup();
            window.currentScreenState = 'mainScreen';
            forceHideVoiceMenu();
            
            const status = document.getElementById('voiceStatus');
            if (status) {
                status.innerText = `✅ Dodato: ${command}`;
                status.style.color = '#4CAF50';
            }
            
            document.dispatchEvent(new CustomEvent('voiceCommandProcessed', { 
                detail: { success: true, command: cleanText }
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
// POMOĆNE FUNKCIJE ZA PROVERU REČI (SA CLEAN CMD)
// ============================================
function checkInventoryCommand(c) {
    const k = ['zalihe', 'zaliha', 'stanje', 'inventory', 'inv', 'stock', 'keszlet', 'készlet', 'bestand', 'запасы', '库存', 'inventario'];
    return k.some(w => c.includes(w));
}

function checkShoppingCommand(c) {
    const k = ['spisak', 'lista', 'shopping', 'shop', 'list', 'bevásárlólista', 'einkaufsliste', 'список', '购物清单'];
    return k.some(w => c.includes(w));
}

function checkAddCommand(c) {
    const k = ['dodaj', 'unos', 'novi', 'novo', 'add', 'hozzáadás', 'hinzufügen', 'добавить', '添加', 'agregar'];
    return k.some(w => c.includes(w));
}

function checkExitCommand(c) {
    const k = ['izlaz', 'zatvori', 'exit', 'quit', 'close', 'kilépés', 'beenden', 'выход', '退出', 'salir'];
    return k.some(w => c.includes(w));
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
// DIREKTNO I BEZBEDNO SAKRIVANJE VOICE MENU-A (SA TIMEOUT-OM)
// ============================================
function forceHideVoiceMenu() {
    console.log('🔇 Prisilno sakrivanje voice menu-a i sigurno osvežavanje');
    
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
        voiceMenu.classList.remove('show');
    }
    
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    // Odloženo prikazivanje glavnog ekrana da se DOM stabilizuje
    setTimeout(() => {
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
            console.log('✅ mainScreen prikazan');
        }

        const currentState = window.currentScreenState;
        if (currentState === 'inventory' && typeof renderInventory === 'function') {
            renderInventory();
            console.log('✅ renderInventory pozvan');
        } else if (currentState === 'shopping' && typeof renderShoppingList === 'function') {
            renderShoppingList();
            console.log('✅ renderShoppingList pozvan');
        } else if (typeof renderCategories === 'function') {
            renderCategories();
            console.log('✅ renderCategories pozvan');
        }
    }, 50);
}

// Izvezi funkcije u globalni prostor
window.voiceCommand = voiceCommand;
window.goBackFromVoice = goBackFromVoice;
window.forceHideVoiceMenu = forceHideVoiceMenu;

// EVENT LISTENERI
document.addEventListener('voiceCommandProcessed', function(e) {
    console.log('📢 Događaj voiceCommandProcessed primljen:', e.detail);
    if (e.detail && e.detail.success) {
        forceHideVoiceMenu();
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

document.addEventListener('click', function(e) {
    if (e.target.closest('.voice-btn') || e.target.closest('#backFromVoiceBtn')) {
        console.log('🖱️ Kliknuto na dugme za izlaz iz glasa - zaustavljam recognition');
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

console.log('✅ voiceCommands.js je uspešno inicijalizovan i spreman!');
