// ============================================
// VOICE COMMANDS - KOMPLETNO ISPRAVLJENA VERZIJA SA UNOSOM
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

// ============================================
// GLASOVNI UNOS PROIZVODA
// ============================================

// ===== PARSIRANJE GLASOVNOG UNOSA =====
// ===== PARSIRANJE GLASOVNOG UNOSA =====
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
    
    // 1. Pronađi KOMAD (broj + komad/kom)
    // Primer: "1 komad", "2 kom", "3 pieces"
    const piecePattern = /(\d+)\s*(komad|kom|pcs|piece)/i;
    const pieceMatch = cleanText.match(piecePattern);
    if (pieceMatch) {
        result.piece = pieceMatch[0].trim();
        cleanText = cleanText.replace(pieceMatch[0], '');
    }
    
    // 2. Pronađi KOLIČINU (broj + jedinica)
    // Podržava: kg, g, kom, l, ml, pak, kutija, kile, kilograma
    const unitPattern = /(\d+\.?\d*)\s*(kg|g|kom|l|ml|pak|kutija|kile|kilograma|kilogram)/i;
    const quantityMatch = cleanText.match(unitPattern);
    if (quantityMatch) {
        let unit = quantityMatch[2].toLowerCase();
        // Normalizuj jedinicu
        if (unit === 'kile' || unit === 'kilograma' || unit === 'kilogram') {
            unit = 'kg';
        }
        result.quantity = parseFloat(quantityMatch[1]);
        result.unit = unit;
        cleanText = cleanText.replace(quantityMatch[0], '');
    }
    
    // 3. Pronađi ROK TRAJANJA (broj + meseci/mes)
    const shelfPattern = /(\d+)\s*(meseci|mes|mesec|m|months|month)/i;
    const shelfMatch = cleanText.match(shelfPattern);
    if (shelfMatch) {
        result.shelfLife = parseInt(shelfMatch[1]);
        cleanText = cleanText.replace(shelfMatch[0], '');
    }
    
    // 4. Pronađi još jedan komad (ako nije pronađen u prvom koraku)
    if (!result.piece) {
        const piecePattern2 = /(\d+)\s*(komad|kom|pcs|piece)/i;
        const pieceMatch2 = cleanText.match(piecePattern2);
        if (pieceMatch2) {
            result.piece = pieceMatch2[0].trim();
            cleanText = cleanText.replace(pieceMatch2[0], '');
        }
    }
    
    // 5. Očisti tekst i sačuvaj kao naziv proizvoda
    // Ukloni višak razmaka i zareze
    result.product = cleanText
        .replace(/\s*,\s*/g, ' ')  // zameni zareze sa razmakom
        .replace(/\s+/g, ' ')       // ukloni višestruke razmake
        .trim();
    
    // Ako nema količine, ostaje 1
    if (result.quantity === 0) {
        result.quantity = 1;
    }
    
    // Ako nema komada, podrazumevani
    if (!result.piece) {
        result.piece = '1';
    }
    
    // Ako nema jedinice, podrazumevana
    if (!result.unit) {
        result.unit = 'kom';
    }
    
    console.log('✅ Parsirani podaci:', result);
    return result;
}

// ===== PRONALAŽENJE KATEGORIJE =====
function findCategoryForProduct(productName) {
    console.log('🔍 Tražim kategoriju za:', productName);
    
    // Pokušaj da pronađeš kroz postojeće funkcije
    let catList = [];
    try {
        if (typeof getMainCategories === 'function') {
            catList = getMainCategories();
        }
    } catch(e) {
        console.warn('⚠️ getMainCategories nije dostupan');
    }
    
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
            // Proveri podkategoriju
            if (productLower.includes(sub.toLowerCase()) || sub.toLowerCase().includes(productLower)) {
                console.log('✅ Pronađena podkategorija:', sub);
                return { category: cat, subcategory: sub, productPart: '' };
            }
            
            // Proveri delove proizvoda
            let parts = [];
            try {
                if (typeof getProductParts === 'function') {
                    parts = getProductParts(sub);
                }
            } catch(e) {}
            
            if (parts && parts.length > 0) {
                for (let part of parts) {
                    if (productLower.includes(part.toLowerCase()) || part.toLowerCase().includes(productLower)) {
                        console.log('✅ Pronađen deo:', part);
                        return { category: cat, subcategory: sub, productPart: part };
                    }
                }
            }
        }
    }
    
    // Ako nije pronađeno, koristi "Ostalo"
    console.log('⚠️ Kategorija nije pronađena, koristim "Ostalo"');
    return { category: 'Ostalo', subcategory: 'Ostalo', productPart: '' };
}

// ===== GLAVNA FUNKCIJA ZA GLASOVNI UNOS =====
function voiceAddProduct(text) {
    console.log('🎤 Glasovni unos proizvoda:', text);
    
    // Parsiraj unos
    const parsed = parseVoiceInput(text);
    
    if (!parsed.product || parsed.product.length < 2) {
        if (typeof showModernAlert === 'function') {
            showModernAlert('Greška', 'Nisam prepoznao naziv proizvoda. Pokušajte: "Dodaj gril pile 2 kg 7 meseci"', '❌');
        }
        return false;
    }
    
    // Pronađi kategoriju
    const categoryInfo = findCategoryForProduct(parsed.product);
    
    // Kreiraj podatke za proizvod (ISTI FORMAT KAO RUČNI UNOS)
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
    
    // Sačuvaj u localStorage
    let zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    zalihe.push(productData);
    localStorage.setItem('zalihe', JSON.stringify(zalihe));
    
    // Pokaži uspešnu poruku
    const msg = `${parsed.product} (${parsed.quantity} ${parsed.unit}, rok: ${parsed.shelfLife} meseci)`;
    if (typeof showModernAlert === 'function') {
        showModernAlert('✅ Uspešno dodato', msg, '✅');
    }
    
    // Osveži prikaz zaliha
    setTimeout(function() {
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        if (typeof renderInventory === 'function') {
            renderInventory();
        }
        console.log('📦 Zalihe osvežene nakon glasovnog unosa');
    }, 500);
    
    return true;
}

// ===== KOMANDE ZA UNOS =====
const voiceAddKeywords = {
    sr: ['dodaj', 'unesi', 'novi', 'proizvod', 'dodavanje', 'ubaci', 'stavi'],
    en: ['add', 'new', 'create', 'insert', 'put'],
    de: ['hinzufügen', 'neu', 'erstellen', 'einfügen'],
    hu: ['hozzáad', 'új', 'létrehoz', 'beilleszt'],
    uk: ['додати', 'новий', 'створити', 'вставити'],
    ru: ['добавить', 'новый', 'создать', 'вставить'],
    zh: ['添加', '新', '创建', '插入'],
    es: ['agregar', 'nuevo', 'crear', 'insertar'],
    pt: ['adicionar', 'novo', 'criar', 'inserir'],
    fr: ['ajouter', 'nouveau', 'créer', 'insérer']
};

// ============================================
// GLAVNA FUNKCIJA ZA OBRADU GLASOVNIH KOMANDI
// ============================================
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

    // ===== PROVERI DA LI JE UNOS =====
    const addKeywords = voiceAddKeywords[lang] || voiceAddKeywords.sr;
    let isAddCommand = false;
    let cleanTextForAdd = command;
    
    for (let kw of addKeywords) {
        if (cleanText.includes(kw)) {
            isAddCommand = true;
            const regex = new RegExp(kw, 'gi');
            cleanTextForAdd = cleanTextForAdd.replace(regex, '');
            break;
        }
    }
    
    // Ako je komanda za unos i ima tekst nakon komande
    if (isAddCommand && cleanTextForAdd.trim().length > 2) {
        console.log('📝 Prepoznat unos:', cleanTextForAdd.trim());
        const result = voiceAddProduct(cleanTextForAdd.trim());
        cleanup();
        forceHideVoiceMenu();
        return result;
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

    // 4. DODAJ PROIZVOD (Add Product) - otvara kategorije
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
window.voiceAddProduct = voiceAddProduct;
window.parseVoiceInput = parseVoiceInput;
window.findCategoryForProduct = findCategoryForProduct;

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
console.log('✅ Glasovni unos proizvoda aktiviran!');
console.log('📝 Reci: "Dodaj gril pile 2 kg 7 meseci" za unos proizvoda');
