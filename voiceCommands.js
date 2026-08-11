// ============================================
// VOICE COMMANDS - KOMPLETNO ISPRAVLJENA VERZIJA SA UNOSOM
// ============================================
console.log('🎤 voiceCommands.js je učitan!');

// GLOBALNA VARIJABLA ZA PRAĆENJE
window.voiceCommandProcessing = false;

function getCurrentLang() {
    return window.currentLanguage || localStorage.getItem('appLanguage') || 'sr';
}

function cleanCmd(cmd) {
    if (!cmd) return '';
    return cmd.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
}

// ============================================
// GLASOVNI UNOS PROIZVODA
// ============================================

function parseVoiceInput(text) {
    console.log('🔍 Parsiranje glasovnog unosa:', text);
    
    const result = {
        product: '',
        piece: '',
        quantity: 1,
        unit: 'kg',
        shelfLife: 12
    };
    
    let cleanText = text;
    
    // 1. Pronađi KOMAD
    const piecePattern = /(\d+)\s*(komad|kom|pcs|piece)/i;
    const pieceMatch = cleanText.match(piecePattern);
    if (pieceMatch) {
        result.piece = pieceMatch[0].trim();
        cleanText = cleanText.replace(pieceMatch[0], '');
    }
    
    // 2. Pronađi KOLIČINU
    const unitPattern = /(\d+\.?\d*)\s*(kg|g|kom|l|ml|pak|kutija|kile|kilograma|kilogram)/i;
    const quantityMatch = cleanText.match(unitPattern);
    if (quantityMatch) {
        let unit = quantityMatch[2].toLowerCase();
        if (unit === 'kile' || unit === 'kilograma' || unit === 'kilogram') {
            unit = 'kg';
        }
        result.quantity = parseFloat(quantityMatch[1]);
        result.unit = unit;
        cleanText = cleanText.replace(quantityMatch[0], '');
    }
    
    // 3. Pronađi ROK
    const shelfPattern = /(\d+)\s*(meseci|mes|mesec|m|months|month)/i;
    const shelfMatch = cleanText.match(shelfPattern);
    if (shelfMatch) {
        result.shelfLife = parseInt(shelfMatch[1]);
        cleanText = cleanText.replace(shelfMatch[0], '');
    }
    
    if (!result.piece) {
        result.piece = '1';
    }
    
    result.product = cleanText.replace(/\s*,\s*/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (result.quantity === 0) {
        result.quantity = 1;
    }
    if (!result.unit) {
        result.unit = 'kom';
    }
    
    console.log('✅ Parsirani podaci:', result);
    return result;
}

function findCategoryForProduct(productName) {
    console.log('🔍 Tražim kategoriju za:', productName);
    
    let catList = [];
    try {
        if (typeof getMainCategories === 'function') {
            catList = getMainCategories();
        }
    } catch(e) {}
    
    if (catList.length === 0) {
        return { category: 'Ostalo', subcategory: 'Ostalo', productPart: '' };
    }
    
    const productLower = productName.toLowerCase();
    
    for (let cat of catList) {
        let subs = [];
        try {
            if (typeof getSubcategories === 'function') {
                subs = getSubcategories(cat);
            }
        } catch(e) {}
        
        for (let sub of subs) {
            if (productLower.includes(sub.toLowerCase()) || sub.toLowerCase().includes(productLower)) {
                return { category: cat, subcategory: sub, productPart: '' };
            }
            
            let parts = [];
            try {
                if (typeof getProductParts === 'function') {
                    parts = getProductParts(sub);
                }
            } catch(e) {}
            
            if (parts && parts.length > 0) {
                for (let part of parts) {
                    if (productLower.includes(part.toLowerCase()) || part.toLowerCase().includes(productLower)) {
                        return { category: cat, subcategory: sub, productPart: part };
                    }
                }
            }
        }
    }
    
    return { category: 'Ostalo', subcategory: 'Ostalo', productPart: '' };
}

function voiceAddProduct(text) {
    console.log('🎤 Glasovni unos proizvoda:', text);
    
    const parsed = parseVoiceInput(text);
    
    if (!parsed.product || parsed.product.length < 2) {
        if (typeof showModernAlert === 'function') {
            showModernAlert('Greška', 'Nisam prepoznao naziv proizvoda. Pokušajte: "gril pile 1 komad 2 kile 7 meseci"', '❌');
        }
        return false;
    }
    
    const categoryInfo = findCategoryForProduct(parsed.product);
    const today = new Date().toISOString().split('T')[0];
    
    const productData = {
        id: Date.now(),
        product_name: parsed.product,
        description: '(glasovni unos)',
        piece: parsed.piece || '1',
        quantity: parsed.quantity,
        unit: parsed.unit || 'kom',
        entry_date: today,
        shelf_life_months: parsed.shelfLife || 12,
        storage_location: 'Ostava',
        category: categoryInfo.category,
        subcategory: categoryInfo.subcategory,
        product_part: categoryInfo.productPart,
        voice_input: true
    };
    
    let zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    zalihe.push(productData);
    localStorage.setItem('zalihe', JSON.stringify(zalihe));
    
    const msg = `${parsed.product} (${parsed.piece || '1'}, ${parsed.quantity} ${parsed.unit}, rok: ${parsed.shelfLife} meseci)`;
    if (typeof showModernAlert === 'function') {
        showModernAlert('✅ Uspešno dodato', msg, '✅');
    }
    
    setTimeout(function() {
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        if (typeof renderInventory === 'function') {
            renderInventory();
        }
    }, 500);
    
    return true;
}

// ============================================
// GLAVNA FUNKCIJA ZA VOICE COMMAND
// ============================================

function voiceCommand(command) {
    console.log('🎤 Primljena komanda:', command);
    
    if (window.voiceCommandProcessing) {
        console.log('⏳ Već se obrađuje komanda, preskačem');
        return false;
    }
    window.voiceCommandProcessing = true;
    
    const cleanText = cleanCmd(command);
    const lang = getCurrentLang();

    function cleanup() {
        window.voiceCommandProcessing = false;
        if (window.recognition) {
            try {
                window.recognition.stop();
                window.recognition = null;
            } catch(e) {}
        }
        if (typeof window.stopVoiceRecognition === 'function') {
            window.stopVoiceRecognition();
        }
    }

    // ===== DODAJ OVO: AUTOMATSKI UNOS NA ZALIHAMA =====
    const currentState = window.currentScreenState || '';
    const isOnInventory = currentState === 'inventory';
    
    // Ako smo na zalihama, automatski unos (bez "dodaj")
    if (isOnInventory) {
        // Proveri da li komanda sadrži broj i jedinicu (izgleda kao unos)
        const hasQuantity = /\d+\s*(kg|g|kom|l|ml|pak|kutija|kile|kilograma)/i.test(command);
        const hasPlus = command.toLowerCase().includes('plus');
        
        if (hasPlus || hasQuantity) {
            console.log('📝 Automatski unos na zalihama:', command);
            let cleanCommand = command.replace(/plus/gi, '').trim();
            if (cleanCommand.length < 2) {
                cleanCommand = command;
            }
            const result = voiceAddProduct(cleanCommand);
            cleanup();
            // Ne sakrivaj voice menu, ostani na zalihama
            return result;
        }
    }

    // ===== PROVERI DA LI JE KOMANDA ZA PRELAZAK =====
    // ZALIHE (Inventory)
    const invKeywords = ['zalihe', 'zaliha', 'stanje', 'inventory', 'inv', 'stock', 'keszlet', 'készlet', 'bestand', 'запасы', '库存', 'inventario'];
    if (invKeywords.some(k => cleanText.includes(k))) {
        console.log('📦 Prelaz na zalihe');
        cleanup();
        window.currentScreenState = 'inventory';
        forceHideVoiceMenu();
        setTimeout(function() {
            if (typeof renderInventory === 'function') renderInventory();
        }, 100);
        return true;
    }

    // SPISAK (Shopping List)
    const shopKeywords = ['spisak', 'lista', 'shopping', 'shop', 'list', 'bevásárlólista', 'einkaufsliste', 'список', '购物清单'];
    if (shopKeywords.some(k => cleanText.includes(k))) {
        console.log('🛒 Prelaz na spisak');
        cleanup();
        window.currentScreenState = 'shopping';
        forceHideVoiceMenu();
        setTimeout(function() {
            if (typeof renderShoppingList === 'function') renderShoppingList();
        }, 100);
        return true;
    }

    // ===== PROVERI DA LI JE UNOS SA "DODAJ" =====
    const addKeywords = {
        sr: ['dodaj', 'unesi', 'novi', 'proizvod', 'dodavanje', 'ubaci', 'stavi', 'doda', 'dodat', 'dodati', 'plus'],
        en: ['add', 'new', 'create', 'insert', 'put', 'plus'],
        de: ['hinzufügen', 'neu', 'erstellen', 'einfügen', 'plus'],
        hu: ['hozzáad', 'új', 'létrehoz', 'beilleszt', 'plusz'],
        uk: ['додати', 'новий', 'створити', 'вставити', 'плюс'],
        ru: ['добавить', 'новый', 'создать', 'вставить', 'плюс']
    };
    
    const keywords = addKeywords[lang] || addKeywords.sr;
    let isAddCommand = false;
    let cleanTextForAdd = command;
    
    for (let kw of keywords) {
        if (cleanText.includes(kw)) {
            isAddCommand = true;
            const regex = new RegExp(kw, 'gi');
            cleanTextForAdd = cleanTextForAdd.replace(regex, '');
            break;
        }
    }
    
    if (isAddCommand && cleanTextForAdd.trim().length > 2) {
        console.log('📝 Prepoznat unos:', cleanTextForAdd.trim());
        const result = voiceAddProduct(cleanTextForAdd.trim());
        cleanup();
        forceHideVoiceMenu();
        return result;
    }

    // IZLAZ / EXIT
    const exitKeywords = ['izlaz', 'zatvori', 'exit', 'quit', 'close', 'kilépés', 'beenden', 'выход', '退出', 'salir'];
    if (exitKeywords.some(k => cleanText.includes(k))) {
        console.log('🚪 Izlaz iz aplikacije');
        cleanup();
        forceHideVoiceMenu();
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
        return true;
    }

    // KATEGORIJE (otvara kategorije za unos)
    const categoryKeywords = ['kategorije', 'kategorija', 'categories', 'kategorien'];
    if (categoryKeywords.some(k => cleanText.includes(k))) {
        console.log('📂 Otvaranje kategorija');
        cleanup();
        window.currentScreenState = 'categories';
        forceHideVoiceMenu();
        setTimeout(function() {
            if (typeof renderCategories === 'function') renderCategories();
        }, 100);
        return true;
    }

    // Ako komanda nije prepoznata
    const status = document.getElementById('voiceStatus');
    if (status) {
        status.innerText = `❌ Nije prepoznato: "${command}"`;
        status.style.color = '#f44336';
    }
    
    cleanup();
    return false;
}

    // 1. IZLAZ / EXIT
    const exitKeywords = ['izlaz', 'zatvori', 'exit', 'quit', 'close', 'kilépés', 'beenden', 'выход', '退出', 'salir'];
    if (exitKeywords.some(k => cleanText.includes(k))) {
        console.log('🚪 Izlaz iz aplikacije');
        cleanup();
        forceHideVoiceMenu();
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
        return true;
    }

    // 2. ZALIHE (Inventory)
    const invKeywords = ['zalihe', 'zaliha', 'stanje', 'inventory', 'inv', 'stock', 'keszlet', 'készlet', 'bestand', 'запасы', '库存', 'inventario'];
    if (invKeywords.some(k => cleanText.includes(k))) {
        console.log('📦 Prelaz na zalihe');
        cleanup();
        window.currentScreenState = 'inventory';
        forceHideVoiceMenu();
        setTimeout(function() {
            if (typeof renderInventory === 'function') renderInventory();
        }, 100);
        return true;
    }

    // 3. SPISAK (Shopping List)
    const shopKeywords = ['spisak', 'lista', 'shopping', 'shop', 'list', 'bevásárlólista', 'einkaufsliste', 'список', '购物清单'];
    if (shopKeywords.some(k => cleanText.includes(k))) {
        console.log('🛒 Prelaz na spisak');
        cleanup();
        window.currentScreenState = 'shopping';
        forceHideVoiceMenu();
        setTimeout(function() {
            if (typeof renderShoppingList === 'function') renderShoppingList();
        }, 100);
        return true;
    }

    // 4. DODAJ PROIZVOD (otvara kategorije)
    const addOnlyKeywords = ['novi', 'novo', 'kreiraj', 'create', 'hozzáadás', 'hinzufügen', 'добавить', '添加', 'agregar'];
    if (addOnlyKeywords.some(k => cleanText.includes(k))) {
        console.log('➕ Otvaranje kategorija za unos');
        cleanup();
        window.currentScreenState = 'categories';
        forceHideVoiceMenu();
        setTimeout(function() {
            if (typeof renderCategories === 'function') renderCategories();
        }, 100);
        return true;
    }

    // Ako komanda nije prepoznata
    const status = document.getElementById('voiceStatus');
    if (status) {
        status.innerText = `❌ Nije prepoznato: "${command}"`;
        status.style.color = '#f44336';
    }
    
    cleanup();
    return false;
}

// ============================================
// POMOĆNE FUNKCIJE
// ============================================

function forceHideVoiceMenu() {
    console.log('🔇 Prisilno sakrivanje voice menu-a');
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
    setTimeout(() => {
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
    }, 50);
}

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
// IZVOZ
// ============================================
window.voiceCommand = voiceCommand;
window.goBackFromVoice = goBackFromVoice;
window.forceHideVoiceMenu = forceHideVoiceMenu;
window.voiceAddProduct = voiceAddProduct;
window.parseVoiceInput = parseVoiceInput;
window.findCategoryForProduct = findCategoryForProduct;

console.log('✅ voiceCommands.js je uspešno inicijalizovan i spreman!');
console.log('📝 Reci: "Dodaj gril pile 1 komad 2 kile 7 meseci" za unos');
