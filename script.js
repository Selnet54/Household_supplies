// ============================================
// PUNI SCRIPT ZA APLIKACIJU - HIJERARHIJSKI NAZAD
// ============================================
console.log('✅ Script.js je učitan!');

// ===== TRENUTNO STANJE =====
let currentLang = 'en';
let currentCategory = '';
let currentSubcategory = '';
let currentProductPart = '';
let currentScreenState = 'languages';

// ===== 0. EXIT FUNKCIJA =====
function exitApp() {
    console.log("🚪 Exit dugme kliknuto!");
    
    const loginScreen = document.getElementById('loginScreen');
    const languageScreen = document.getElementById('languageScreen');
    
    const isLoginVisible = loginScreen && window.getComputedStyle(loginScreen).display === 'flex';
    const isLanguageVisible = languageScreen && window.getComputedStyle(languageScreen).display === 'flex';
    
    let poruka;
    if (isLoginVisible || isLanguageVisible) {
        poruka = "Thanks for using this app! 👋";
    } else {
        poruka = translations[currentLang]?.exit_poruka || "Thanks for using this app! 👋";
    }
    
    document.body.innerHTML = '';
    document.body.style.background = '#1a237e';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.width = '100%';
    document.body.style.height = '100vh';
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
    document.body.style.flexDirection = 'column';
    document.body.style.fontFamily = 'Arial, sans-serif';
    
    document.body.innerHTML = `
        <div style="text-align: center; color: #FFD700;">
            <div style="font-size: 80px; margin-bottom: 20px;">👋</div>
            <div style="font-size: 32px; font-weight: bold;">${poruka}</div>
            <div style="font-size: 16px; color: #888; margin-top: 30px;">© Supplies App</div>
            <button onclick="location.reload()" style="margin-top:30px; padding:12px 30px; background:#FFD700; color:#1a237e; border:none; border-radius:8px; font-size:18px; cursor:pointer; font-weight:bold;">
                🔄 Restart App
            </button>
        </div>
    `;
}

// ===== MODERNI ALERT =====
function showModernAlert(title, message, icon) {
    alert(message);
}
function closeModernAlert() {}

// ===== SUPPORT FUNKCIJE =====
function openSupportDialog() {
    const dialog = document.getElementById('supportDialog');
    if (dialog) {
        dialog.style.display = 'flex';
        dialog.classList.add('active');
    }
}
function closeSupportDialog() {
    const dialog = document.getElementById('supportDialog');
    if (dialog) {
        dialog.style.display = 'none';
        dialog.classList.remove('active');
    }
}

// ===== 1. JEZICI =====
const languages = {
    sr: { name: 'Srpski', flag: '/Household_supplies/icons/jezici/srpski.png' },
    en: { name: 'English', flag: '/Household_supplies/icons/jezici/engleski.png' },
    de: { name: 'Deutsch', flag: '/Household_supplies/icons/jezici/nemacki.png' },
    hu: { name: 'Magyar', flag: '/Household_supplies/icons/jezici/madjarski.png' },
    uk: { name: 'Українська', flag: '/Household_supplies/icons/jezici/ukrajinski.png' },
    ru: { name: 'Русский', flag: '/Household_supplies/icons/jezici/ruski.png' },
    zh: { name: '中文', flag: '/Household_supplies/icons/jezici/mandarinski.png' },
    es: { name: 'Español', flag: '/Household_supplies/icons/jezici/spanski.png' },
    pt: { name: 'Português', flag: '/Household_supplies/icons/jezici/portugalski.png' },
    fr: { name: 'Français', flag: '/Household_supplies/icons/jezici/francuski.png' }
};

// ===== 2. PREVODI ===== (SKRAĆENO ZA TEST)
const translations = {
    sr: {
        nazad: "Nazad", stanje: "Zalihe", spisak: "Spisak",
        naziv_proizvoda: "Proizvod:", opis: "Opis:",
        komad: "Komada:", kolicina: "Količina:", jedinica_mere: "Jed. mere:",
        datum_unosa: "Datum unosa:", rok_trajanja: "Rok (meseci):",
        automatski_rok: "Rok ističe:", mesto_skladistenja: "Skladište:",
        unesi: "Unesi", odustani: "Odustani", pretrazi: "Pretraži",
        glavne_kategorije: "Glavne kategorije", podkategorije: "Podkategorije",
        delovi_proizvoda: "Delovi proizvoda", unos_podataka: "Unos podataka",
        pregled_unosa: "Pregled unosa", nema_proizvoda: "Nema proizvoda",
        spisak_potreba: "Spisak potreba", azuriraj: "Ažuriraj", obrisi: "Obriši",
        oznaci_sve: "Označi sve", kopiraj: "Kopiraj", obrisi_oznaceno: "Obriši označeno",
        exit_poruka: "Hvala na korišćenju! 👋",
        zamrzivac_1: "Zamrzivač 1", zamrzivac_2: "Zamrzivač 2", zamrzivac_3: "Zamrzivač 3",
        frizider: "Frižider", ostava: "Ostava", Ostalo: "Ostalo",
        kg: "kg", g: "g", kom: "kom", l: "l", ml: "ml", pak: "pak", kutija: "kutija"
    },
    en: {
        nazad: "Back", stanje: "Inventory", spisak: "Shopping List",
        naziv_proizvoda: "Product:", opis: "Description:",
        komad: "Piece:", kolicina: "Quantity:", jedinica_mere: "Unit:",
        datum_unosa: "Entry Date:", rok_trajanja: "Shelf Life (months):",
        automatski_rok: "Auto Expiry:", mesto_skladistenja: "Storage:",
        unesi: "Enter", odustani: "Cancel", pretrazi: "Search",
        glavne_kategorije: "Main Categories", podkategorije: "Subcategories",
        delovi_proizvoda: "Product Parts", unos_podataka: "Data Entry",
        pregled_unosa: "Entry Review", nema_proizvoda: "No products",
        spisak_potreba: "Shopping List", azuriraj: "Update", obrisi: "Delete",
        oznaci_sve: "Select all", kopiraj: "Copy", obrisi_oznaceno: "Delete selected",
        exit_poruka: "Thanks for using this app! 👋",
        zamrzivac_1: "Freezer 1", zamrzivac_2: "Freezer 2", zamrzivac_3: "Freezer 3",
        frizider: "Refrigerator", ostava: "Pantry", Ostalo: "Other",
        kg: "kg", g: "g", kom: "pcs", l: "l", ml: "ml", pak: "pck", kutija: "box"
    }
};

// ===== 3. BOJE =====
const categoryColors = {
    "Belo meso": "#FFE295", "Crveno meso": "#F1624B",
    "Sitna divljač": "#F59AA6", "Krupna divljač": "#E19E94",
    "Riba": "#00BBF1", "Mlečni proizvodi": "#ACE1F9",
    "Povrće": "#8FC74A", "Zimnica i kompoti": "#CC98C4",
    "Testo i Slatkiši": "#FFECAB", "Pića": "#F8E06D",
    "Hemija i higijena": "#98D6D2", "Ostalo": "#F58634"
};

const subcategoryColors = {
    "Belo meso": ["#FFEDB5", "#F2D382"],
    "Crveno meso": ["#FABFA9", "#F9AA75"],
    "Sitna divljač": ["#F6C5A4", "#E8A97B"],
    "Krupna divljač": ["#FBCEC8", "#F6998C"],
    "Riba": ["#91D8F7", "#D5EFFC"],
    "Mlečni proizvodi": ["#ACE1F9", "#D5EFFC"],
    "Povrće": ["#8FC74A", "#A0D29E"],
    "Zimnica i kompoti": ["#F3B6D1", "#E894B0"],
    "Testo i Slatkiši": ["#FEE5CB", "#FFECAB"],
    "Pića": ["#FFD76E", "#EEB832"],
    "Hemija i higijena": ["#AADBD2", "#6FC7B8"],
    "Ostalo": ["#D9D9D9", "#BFBFBF"]
};

// ===== 4. GLAVNE KATEGORIJE =====
const mainCategories = {
    sr: ["Belo meso", "Crveno meso", "Sitna divljač", "Krupna divljač", "Riba", "Mlečni proizvodi", "Povrće", "Zimnica i kompoti", "Testo i Slatkiši", "Pića", "Hemija i higijena", "Ostalo"],
    en: ["White meat", "Red meat", "Small game", "Big game", "Fish", "Dairy products", "Vegetables", "Preserves and compotes", "Dough and Sweets", "Beverages", "Chemicals and hygiene", "Other"]
};

// ===== 5. PODKATEGORIJE =====
const subcategories = {
    sr: {
        "Belo meso": ["Pileće", "Ćureće", "Guska", "Patka", "Ostalo"],
        "Crveno meso": ["Svinjsko", "Jagnjeće", "Ovčije", "Juneće", "Govedina", "Od bika", "Konjsko", "Zečije", "Ostalo"],
        "Sitna divljač": ["Prepelica", "Fazan", "Jarebica", "Divlja patka", "Divlja guska", "Divlji zec", "Golub", "Ostalo"],
        "Krupna divljač": ["Jelen", "Srna", "Divokoza", "Los", "Irvas", "Divlja svinja", "Bizon", "Kamila", "Lama", "Alpaka", "Kengur", "Krokodil/Aligator", "Gušter", "Zmija", "Ostalo"],
        "Riba": ["Morska", "Slatkovodna", "Plodovi mora", "Ostalo"],
        "Mlečni proizvodi": ["Mleko", "Mlečne prerađevine", "Ostalo"],
        "Povrće": ["Sveže", "Termički obrađeno", "Zamrznuto", "Ostalo"],
        "Zimnica i kompoti": ["Voće", "Povrće", "Ostalo"],
        "Testo i Slatkiši": ["Testo", "Slatkiši", "Ostalo"],
        "Pića": ["Voda", "Vino", "Sok", "Žestoka pića", "Pivo", "Ostalo"],
        "Hemija i higijena": ["Sanitar", "Lična higijena", "Pribor", "Ostalo"],
        "Ostalo": ["Ostalo"]
    },
    en: {
        "White meat": ["Chicken", "Turkey", "Goose", "Duck", "Other"],
        "Red meat": ["Pork", "Lamb", "Sheep", "Veal", "Beef", "Bull", "Horse", "Rabbit", "Other"],
        "Small game": ["Quail", "Pheasant", "Partridge", "Wild duck", "Wild goose", "Hare", "Pigeon", "Other"],
        "Big game": ["Deer", "Roe deer", "Wild goat", "Moose", "Reindeer", "Wild boar", "Bison", "Camel", "Llama", "Alpaca", "Kangaroo", "Crocodile/Alligator", "Lizard", "Snake", "Other"],
        "Fish": ["Sea", "Freshwater", "Seafood", "Other"],
        "Dairy products": ["Milk", "Dairy processing", "Other"],
        "Vegetables": ["Fresh", "Heat treated", "Frozen", "Other"],
        "Preserves and compotes": ["Fruits", "Vegetables", "Other"],
        "Dough and Sweets": ["Dough", "Sweets", "Other"],
        "Beverages": ["Water", "Wine", "Juice", "Spirits", "Beer", "Other"],
        "Chemicals and hygiene": ["Sanitary", "Personal hygiene", "Equipment", "Other"],
        "Other": ["Other"]
    }
};

// ===== 6. PRODUCT PARTS =====
const productParts = {
    sr: {
        "Pileće": ["Gril pile", "Pile celo", "Ceo batak", "Karabatak", "Donji batak", "Belo (grudi)", "File", "Leđa", "Krilca", "Ostalo"],
        "Ćureće": ["Ceo batak", "Karabatak", "Donji batak", "Belo (grudi)", "Krilca", "Leđa", "Ostalo"],
        "Guska": ["Belo (grudi)", "Ceo batak", "Karabatak", "Donji batak", "Krilca", "Leđa", "Ostalo"],
        "Patka": ["Belo (grudi)", "Ceo batak", "Karabatak", "Donji batak", "Krilca", "Leđa", "Ostalo"],
        "Mleko": ["Mleko", "Kefir", "Kisela pavlaka", "Slatka pavlaka", "Ostalo"],
        "Mlečne prerađevine": ["Urda", "Mladi sir", "Krem sir", "Gouda", "Edamer", "Ostalo"],
        "Sveže": ["Grašak", "Boranija", "Karfiol", "Brokoli", "Paradajz", "Ostalo"],
        "Voće": ["Kajsija", "Kruška", "Višnja", "Pekmez od jagoda", "Šljivov pekmez", "Ostalo"],
        "Povrće": ["Kiseli krastavci", "Kisela paprika", "Paradajz pire", "Cvekla", "Ajvar", "Ostalo"],
        "Testo": ["Hleb", "Raženi hleb", "Čabata", "Kukuruzni hleb", "Baguette", "Ostalo"],
        "Slatkiši": ["Kolači", "Torte", "Peciva", "Sladoled", "Čokolada", "Ostalo"],
        "Voda": ["Mineralna", "Negazirana", "Gazirana", "Ostalo"],
        "Vino": ["Crno", "Belo", "Roze", "Ostalo"],
        "Sok": ["Voćni", "Povrtni", "Ostalo"],
        "Žestoka pića": ["Rakija", "Votka", "Viski", "Ostalo"],
        "Pivo": ["Tamno", "Svetlo", "Ostalo"],
        "Sanitar": ["Pranje prozora", "Pranje posuđa", "Pranje podova", "Ostalo"],
        "Lična higijena": ["Dezodorans", "Brijač", "Šminka", "Sapun", "Šampon", "Ostalo"],
        "Pribor": ["Kantica", "Kofa", "Krpa za prašinu", "Metla", "Ostalo"],
        "Ostalo": ["Napomena: Unesite naziv proizvoda"]
    },
    en: {
        "Chicken": ["Grilled chicken", "Whole chicken", "Whole leg", "Breast", "Wings", "Other"],
        "Turkey": ["Whole leg", "Breast", "Wings", "Other"],
        "Goose": ["Breast", "Whole leg", "Wings", "Other"],
        "Duck": ["Breast", "Whole leg", "Wings", "Other"],
        "Milk": ["Milk", "Kefir", "Sour cream", "Sweet cream", "Other"],
        "Dairy processing": ["Curd", "Fresh cheese", "Cream cheese", "Gouda", "Edam", "Other"],
        "Fresh": ["Peas", "Green beans", "Cauliflower", "Broccoli", "Tomato", "Other"],
        "Fruits": ["Apricot", "Pear", "Sour cherry", "Strawberry jam", "Plum jam", "Other"],
        "Vegetables": ["Pickles", "Pickled peppers", "Tomato puree", "Beetroot", "Ajvar", "Other"],
        "Dough": ["Bread", "Rye bread", "Ciabatta", "Corn bread", "Baguette", "Other"],
        "Sweets": ["Cakes", "Tarts", "Pastries", "Ice cream", "Chocolate", "Other"],
        "Water": ["Mineral", "Still", "Sparkling", "Other"],
        "Wine": ["Red", "White", "Rosé", "Other"],
        "Juice": ["Fruit", "Vegetable", "Other"],
        "Spirits": ["Brandy", "Vodka", "Whisky", "Other"],
        "Beer": ["Dark", "Light", "Other"],
        "Sanitary": ["Window cleaner", "Dish soap", "Floor cleaner", "Other"],
        "Personal hygiene": ["Deodorant", "Razor", "Makeup", "Soap", "Shampoo", "Other"],
        "Equipment": ["Bucket", "Bucket", "Duster", "Broom", "Other"],
        "Other": ["Note: Enter product name"]
    }
};

// ===== 7. POMOĆNE FUNKCIJE =====
function t(key) {
    return translations[currentLang]?.[key] || key;
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const screen = document.getElementById(screenId);
    if (screen) screen.style.display = 'flex';
}

function updateHeaderTexts() {
    const backText = document.getElementById('backText');
    const invText = document.getElementById('invText');
    const shopText = document.getElementById('shopText');
    if (backText) backText.textContent = t('nazad');
    if (invText) invText.textContent = t('stanje');
    if (shopText) shopText.textContent = t('spisak');
}

function getMainCategories() {
    return mainCategories[currentLang] || mainCategories.sr;
}

function getSubcategories(category) {
    const sub = subcategories[currentLang] || subcategories.sr;
    return sub[category] || ['Ostalo'];
}

function getProductParts(subcategory) {
    if (productParts[currentLang] && productParts[currentLang][subcategory]) {
        return productParts[currentLang][subcategory];
    }
    if (productParts.sr && productParts.sr[subcategory]) {
        return productParts.sr[subcategory];
    }
    return ["Ostalo"];
}

function getCategoryColor(category) {
    const srList = mainCategories.sr;
    for (let i = 0; i < srList.length; i++) {
        if (category === mainCategories[currentLang]?.[i] || category === srList[i]) {
            return categoryColors[srList[i]] || '#cccccc';
        }
    }
    return '#cccccc';
}

function getSubcategoryColors(category) {
    const srList = mainCategories.sr;
    for (let i = 0; i < srList.length; i++) {
        if (category === mainCategories[currentLang]?.[i] || category === srList[i]) {
            return subcategoryColors[srList[i]] || ['#FFEDB5', '#F2D382'];
        }
    }
    return ['#FFEDB5', '#F2D382'];
}

function isOtherButton(text) {
    const ostaloVariants = ["Ostalo", "Other", "Andere", "Egyéb", "Інше", "Другое", "其他", "Otro", "Outro", "Autre"];
    return ostaloVariants.includes(text);
}

// ===== 8. RENDER FUNKCIJE =====
function renderLanguages() {
    if (!currentLang || currentLang === '') {
        currentLang = 'en';
    }
    currentScreenState = 'languages';
    const grid = document.getElementById('languageGrid');
    if (!grid) return;
    grid.innerHTML = '';
    Object.keys(languages).forEach(code => {
        const lang = languages[code];
        const btn = document.createElement('button');
        btn.className = 'lang-btn-main';
        btn.innerHTML = `
            <img src="${lang.flag}?v=3" alt="${lang.name}" onerror="this.style.display='none'">
            <span class="lang-name">${lang.name}</span>
        `;
        btn.onclick = () => selectLanguage(code);
        grid.appendChild(btn);
    });
    console.log('✅ Jezici prikazani');
}

function selectLanguage(langCode) {
    currentLang = langCode;
    showScreen('mainScreen');
    updateHeaderTexts();
    renderCategories();
}

function renderCategories() {
    currentScreenState = 'categories';
    const content = document.getElementById('mainContent');
    if (!content) return;
    const catList = getMainCategories();
    let html = `<div class="title">${t('glavne_kategorije')}</div>`;
    html += `<div class="categories-grid">`;
    catList.forEach(cat => {
        const color = getCategoryColor(cat);
        if (isOtherButton(cat)) {
            html += `<button class="category-btn" style="background:${color};" onclick="renderDataEntry('')">${cat} ➜</button>`;
        } else {
            html += `<button class="category-btn" style="background:${color};" onclick="renderSubcategories('${cat.replace(/'/g, "\\'")}')">${cat}</button>`;
        }
    });
    html += `</div>`;
    content.innerHTML = html;
}

function renderSubcategories(category) {
    currentScreenState = 'subcategories';
    currentCategory = category;
    const content = document.getElementById('mainContent');
    if (!content) return;

    const subData = getSubcategories(category);
    const colors = getSubcategoryColors(category);
    
    let html = `<div class="title">${t('podkategorije')}</div>`;
    html += `<div class="categories-grid">`;
    
    if (Array.isArray(subData) && subData.length > 0) {
        let displayData = [...subData];
        const hasOstalo = displayData.some(item => isOtherButton(item));
        if (!hasOstalo) {
            displayData.push(t('Ostalo') || "Ostalo");
        }
        displayData.forEach((item, idx) => {
            const color = colors[idx % colors.length];
            const safeItem = item.toString().replace(/'/g, "\\'");
            const hasParts = productParts[currentLang] && productParts[currentLang][item] && productParts[currentLang][item].length > 0;
            
            if (isOtherButton(item)) {
                html += `<button class="category-btn" style="background:${color};" onclick="renderDataEntry('')">${item} ➜</button>`;
            } else if (hasParts) {
                html += `<button class="category-btn" style="background:${color};" onclick="renderProductParts('${safeItem}')">${item}</button>`;
            } else {
                html += `<button class="category-btn" style="background:${color};" onclick="renderDataEntry('${safeItem}')">${item}</button>`;
            }
        });
    } else if (subData && typeof subData === 'object') {
        const keys = Object.keys(subData);
        let displayKeys = [...keys];
        const hasOstalo = displayKeys.some(key => isOtherButton(key));
        if (!hasOstalo) {
            displayKeys.push(t('Ostalo') || "Ostalo");
        }
        displayKeys.forEach((groupName, idx) => {
            const color = colors[idx % colors.length];
            const safeGroup = groupName.toString().replace(/'/g, "\\'");
            if (isOtherButton(groupName)) {
                html += `<button class="category-btn" style="background:${color};" onclick="renderDataEntry('')">${groupName} ➜</button>`;
            } else {
                html += `<button class="category-btn" style="background:${color};" onclick="renderSubcategoryGroup('${category.replace(/'/g, "\\'")}', '${safeGroup}')">${groupName}</button>`;
            }
        });
    } else {
        html += `<button class="category-btn" style="background:#ddd;" onclick="renderDataEntry('')">${t('Ostalo') || "Ostalo"} ➜</button>`;
    }
    html += `</div>`;
    content.innerHTML = html;
}

function renderSubcategoryGroup(category, groupName) {
    currentScreenState = 'subcategories';
    const content = document.getElementById('mainContent');
    const sub = subcategories[currentLang] || subcategories.sr;
    let items = sub[category] ? sub[category][groupName] : [];
    const colors = getSubcategoryColors(category);
    
    let html = `<div class="title">${groupName}</div>`;
    html += `<div class="categories-grid">`;
    if (Array.isArray(items) && items.length > 0) {
        let displayItems = [...items];
        const hasOstalo = displayItems.some(item => isOtherButton(item));
        if (!hasOstalo) {
            displayItems.push(t('Ostalo') || "Ostalo");
        }
        displayItems.forEach((item, idx) => {
            const color = colors[idx % colors.length];
            const safeItem = item.toString().replace(/'/g, "\\'");
            const hasParts = productParts[currentLang] && productParts[currentLang][item] && productParts[currentLang][item].length > 0;
            
            if (isOtherButton(item)) {
                html += `<button class="category-btn" style="background:${color};" onclick="renderDataEntry('')">${item} ➜</button>`;
            } else if (hasParts) {
                html += `<button class="category-btn" style="background:${color};" onclick="renderProductParts('${safeItem}')">${item}</button>`;
            } else {
                html += `<button class="category-btn" style="background:${color};" onclick="renderDataEntry('${safeItem}')">${item}</button>`;
            }
        });
    } else {
        html += `<button class="category-btn" style="background:#ddd;" onclick="renderDataEntry('')">${t('Ostalo') || "Ostalo"} ➜</button>`;
    }
    html += `</div>`;
    content.innerHTML = html;
}

function renderProductParts(subcategory) {
    currentScreenState = 'productParts';
    currentSubcategory = subcategory;
    const content = document.getElementById('mainContent');
    let parts = getProductParts(subcategory);
    const colors = getSubcategoryColors(currentCategory);
    
    let html = `<div class="title">${subcategory}</div>`;
    html += `<div style="margin-bottom:15px;text-align:center;font-size:20px;color:#666;">${t('delovi_proizvoda')}</div>`;
    html += `<div class="categories-grid">`;
    if (parts && parts.length > 0) {
        let displayParts = [...parts];
        const hasOstalo = displayParts.some(part => isOtherButton(part));
        if (!hasOstalo) {
            displayParts.push(t('Ostalo') || "Ostalo");
        }
        displayParts.forEach((part, idx) => {
            const color = colors[idx % colors.length];
            const safePart = part.toString().replace(/'/g, "\\'");
            html += `<button class="category-btn" style="background:${color};" onclick="renderDataEntry('${safePart}')">${part}</button>`;
        });
    } else {
        html += `<button class="category-btn" style="background:#ddd;" onclick="renderDataEntry('')">${t('Ostalo') || "Ostalo"} ➜</button>`;
    }
    html += `</div>`;
    content.innerHTML = html;
}

function renderDataEntry(productName) {
    currentScreenState = 'dataEntry';
    currentProductPart = productName;
    const content = document.getElementById('mainContent');
    if (!content) return;
    const today = new Date().toISOString().split('T')[0];
    content.innerHTML = `
        <div class="title">${t('unos_podataka')}</div>
        <div class="row"><label>${t('naziv_proizvoda')}</label><input type="text" id="productInput" value="${productName || ''}"></div>
        <div class="row"><label>${t('opis')}</label><input type="text" id="descriptionInput"></div>
        <div class="row">
            <label>${t('komad')}</label>
            <div class="inline-group">
                <input type="text" id="pieceInput">
                <label>${t('kolicina')}</label>
                <input type="number" id="quantityInput" value="1" step="0.1">
                <label>${t('jedinica_mere')}</label>
                <select id="unitSelect">
                    <option value="kg">${t('kg')}</option>
                    <option value="g">${t('g')}</option>
                    <option value="kom">${t('kom')}</option>
                    <option value="l">${t('l')}</option>
                    <option value="ml">${t('ml')}</option>
                    <option value="pak">${t('pak')}</option>
                    <option value="kutija">${t('kutija')}</option>
                </select>
            </div>
        </div>
        <div class="row">
            <label>${t('datum_unosa')}</label>
            <div class="inline-group">
                <input type="date" id="dateInput" value="${today}">
                <label>${t('rok_trajanja')}</label>
                <input type="number" id="shelfLifeInput" value="12">
                <span style="font-size:18px;">mes</span>
            </div>
        </div>
        <div class="row">
            <label>${t('automatski_rok')}</label>
            <div class="inline-group"><span id="expiryDisplay">-</span></div>
        </div>
        <div class="row">
            <label>${t('mesto_skladistenja')}</label>
            <select id="storageSelect">
                <option value="${t('zamrzivac_1')}">❄️ ${t('zamrzivac_1')}</option>
                <option value="${t('zamrzivac_2')}">❄️ ${t('zamrzivac_2')}</option>
                <option value="${t('zamrzivac_3')}">❄️ ${t('zamrzivac_3')}</option>
                <option value="${t('frizider')}">🧊 ${t('frizider')}</option>
                <option value="${t('ostava')}">🏠 ${t('ostava')}</option>
                <option value="${t('Ostalo')}">📦 ${t('Ostalo')}</option>
            </select>
        </div>
        <div class="btn-group">
            <button class="btn-save" onclick="saveProduct()">✅ ${t('unesi')}</button>
            <button class="btn-cancel" onclick="handleBackAction()">✖ ${t('odustani')}</button>
        </div>
        <div class="table-container">
            <div class="table-title">📊 ${t('pregled_unosa')}</div>
            <div id="entriesContainer"></div>
        </div>
    `;
    document.getElementById('dateInput')?.addEventListener('change', updateExpiryDate);
    document.getElementById('dateInput')?.addEventListener('input', updateExpiryDate);
    document.getElementById('shelfLifeInput')?.addEventListener('change', updateExpiryDate);
    document.getElementById('shelfLifeInput')?.addEventListener('input', updateExpiryDate);
    document.getElementById('productInput')?.focus();
    updateExpiryDate();
    prikaziSveUnose();
}

function prikaziSveUnose() {
    const container = document.getElementById('entriesContainer');
    if (!container) return;
    const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    container.innerHTML = `
        <div class="table-row header-row">
            <div class="cell">${t('komad')}</div>
            <div class="cell">${t('kolicina')}</div>
            <div class="cell">${t('jedinica_mere')}</div>
            <div class="cell">${t('rok_trajanja')}</div>
            <div class="cell">${t('mesto_skladistenja')}</div>
        </div>
    `;
    const aktivni = zalihe.filter(p => p.quantity > 0);
    if (aktivni.length === 0) {
        const row = document.createElement('div');
        row.className = 'table-row';
        row.innerHTML = `<div class="cell" style="grid-column:span 5;padding:20px;color:#999;text-align:center;">${t('nema_proizvoda')}</div>`;
        container.appendChild(row);
        return;
    }
    aktivni.forEach(p => {
        const expiry = new Date(p.entry_date);
        expiry.setMonth(expiry.getMonth() + p.shelf_life_months);
        const expiryDisplay = expiry.toLocaleDateString('sr-RS', { month: '2-digit', year: '2-digit' });
        const row = document.createElement('div');
        row.className = 'table-row';
        row.innerHTML = `
            <div class="cell">${p.piece || '-'}</div>
            <div class="cell">${p.quantity}</div>
            <div class="cell">${p.unit}</div>
            <div class="cell">${expiryDisplay}</div>
            <div class="cell">${p.storage_location}</div>
        `;
        container.appendChild(row);
    });
}

function updateExpiryDate() {
    const dateInput = document.getElementById('dateInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const expiryDisplay = document.getElementById('expiryDisplay');
    if (!dateInput || !shelfLifeInput || !expiryDisplay) return;
    const date = dateInput.value;
    const months = parseInt(shelfLifeInput.value) || 0;
    if (date && months > 0) {
        const expiry = new Date(date);
        expiry.setMonth(expiry.getMonth() + months);
        expiryDisplay.textContent = expiry.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } else {
        expiryDisplay.textContent = '-';
    }
}

function saveProduct() {
    const product = document.getElementById('productInput')?.value.trim();
    const quantity = document.getElementById('quantityInput')?.value.trim();
    if (!product) {
        alert('Unesite naziv proizvoda!');
        document.getElementById('productInput')?.focus();
        return;
    }
    if (!quantity || isNaN(parseFloat(quantity))) {
        alert('Unesite količinu!');
        document.getElementById('quantityInput')?.focus();
        return;
    }
    
    const productData = {
        product_name: product,
        description: document.getElementById('descriptionInput')?.value.trim() || '',
        piece: document.getElementById('pieceInput')?.value.trim() || '-',
        quantity: parseFloat(quantity),
        unit: document.getElementById('unitSelect')?.value || 'kg',
        entry_date: document.getElementById('dateInput')?.value || new Date().toISOString().split('T')[0],
        shelf_life_months: parseInt(document.getElementById('shelfLifeInput')?.value) || 12,
        storage_location: document.getElementById('storageSelect')?.value || 'Ostalo'
    };
    
    let zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    const existingIndex = zalihe.findIndex(p => p.product_name === productData.product_name);
    if (existingIndex !== -1) {
        zalihe[existingIndex] = productData;
    } else {
        zalihe.push(productData);
    }
    localStorage.setItem('zalihe', JSON.stringify(zalihe));
    prikaziSveUnose();
    document.getElementById('pieceInput').value = '';
    document.getElementById('quantityInput').value = '1';
    document.getElementById('quantityInput').focus();
    alert('✅ Proizvod sačuvan!');
}

function renderInventory() {
    currentScreenState = 'inventory';
    const content = document.getElementById('mainContent');
    if (!content) return;
    const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    const aktivneZalihe = zalihe.filter(p => p.quantity > 0);
    
    let html = `<div class="title">${t('stanje')}</div>`;
    html += `<div style="display:flex; gap:10px; margin-bottom:15px; flex-wrap:wrap;">`;
    html += `<button onclick="azurirajZalihe()" style="background:#4CAF50; color:white; border:none; padding:10px 20px; border-radius:8px; font-size:16px; cursor:pointer;">✅ ${t('azuriraj')}</button>`;
    html += `<button onclick="obrisiZalihe()" style="background:#666; color:white; border:none; padding:10px 20px; border-radius:8px; font-size:16px; cursor:pointer;">🗑️ ${t('obrisi')}</button>`;
    html += `<button onclick="renderCategories()" style="background:#f44336; color:white; border:none; padding:10px 20px; border-radius:8px; font-size:16px; cursor:pointer;">✖ ${t('odustani')}</button>`;
    html += `</div>`;
    
    html += `<div class="table-container" style="max-height:400px; overflow-y:auto;">`;
    html += `<div class="table-title">📦 ${t('stanje')}</div>`;
    html += `<div id="inventoryTable">`;
    html += `<div class="table-row header-row" style="display:grid; grid-template-columns:40px 1.2fr 1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr; gap:2px; background:#f0f0f0; font-weight:bold; border-bottom:2px solid #ccc; padding:5px 0;">`;
    html += `<div class="cell" style="text-align:center;"><input type="checkbox" id="selectAll" onchange="toggleAllCheckboxes()"></div>`;
    html += `<div class="cell">${t('naziv_proizvoda')}</div>`;
    html += `<div class="cell">${t('opis')}</div>`;
    html += `<div class="cell">${t('komad')}</div>`;
    html += `<div class="cell">${t('kolicina')}</div>`;
    html += `<div class="cell">${t('jedinica_mere')}</div>`;
    html += `<div class="cell">${t('rok_trajanja')}</div>`;
    html += `<div class="cell">${t('mesto_skladistenja')}</div>`;
    html += `</div>`;
    
    if (aktivneZalihe.length === 0) {
        html += `<div class="table-row"><div class="cell" style="grid-column:span 8;padding:30px;color:#999;text-align:center;">${t('nema_proizvoda')}</div></div>`;
    } else {
        aktivneZalihe.forEach((p) => {
            const originalIndex = zalihe.indexOf(p);
            const expiry = new Date(p.entry_date);
            expiry.setMonth(expiry.getMonth() + p.shelf_life_months);
            const expiryDisplay = expiry.toLocaleDateString('sr-RS', { month: '2-digit', year: '2-digit' });
            const isLow = (p.unit === 'g' && p.quantity < 400) || (p.unit === 'kg' && p.quantity < 0.4) || ((p.unit === 'kom' || p.unit === 'pcs') && p.quantity <= 2);
            const bgColor = isLow ? '#F9AA65' : '';
            
            html += `<div class="table-row" style="display:grid; grid-template-columns:40px 1.2fr 1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr; gap:2px; border-bottom:1px solid #eee; padding:5px 0; background:${bgColor};">`;
            html += `<div class="cell" style="text-align:center;"><input type="checkbox" class="row-checkbox" data-index="${originalIndex}"></div>`;
            html += `<div class="cell">${p.product_name}</div>`;
            html += `<div class="cell">${p.description || ''}</div>`;
            html += `<div class="cell">${p.piece || '-'}</div>`;
            html += `<div class="cell">${p.quantity}</div>`;
            html += `<div class="cell">${p.unit}</div>`;
            html += `<div class="cell">${expiryDisplay}</div>`;
            html += `<div class="cell">${p.storage_location}</div>`;
            html += `</div>`;
        });
    }
    html += `</div></div>`;
    content.innerHTML = html;
}

function toggleAllCheckboxes() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.row-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
}

function obrisiZalihe() {
    const selected = document.querySelectorAll('.row-checkbox:checked');
    if (selected.length === 0) {
        alert('Niste označili nijedan red za brisanje!');
        return;
    }
    if (!confirm(`Da li ste sigurni da želite da obrišete ${selected.length} stavku/ke?`)) return;
    const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    const indices = Array.from(selected).map(cb => parseInt(cb.dataset.index));
    indices.sort((a, b) => b - a);
    indices.forEach(i => zalihe.splice(i, 1));
    localStorage.setItem('zalihe', JSON.stringify(zalihe));
    renderInventory();
}

function azurirajZalihe() {
    const selected = document.querySelectorAll('.row-checkbox:checked');
    if (selected.length === 0) {
        alert('Niste označili nijedan red za ažuriranje!');
        return;
    }
    if (selected.length > 1) {
        alert('Možete ažurirati samo jedan red odjednom!');
        return;
    }
    const index = parseInt(selected[0].dataset.index);
    const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    const proizvod = zalihe[index];
    renderDataEntry(proizvod.product_name);
    // Sačuvaj index za ažuriranje
    window.updateIndex = index;
    // Promeni dugme "Unesi" u "Ažuriraj"
    const saveBtn = document.querySelector('.btn-save');
    if (saveBtn) {
        saveBtn.textContent = '✅ Ažuriraj';
        saveBtn.onclick = function() {
            sacuvajAzuriranje(window.updateIndex);
        };
    }
}

function sacuvajAzuriranje(index) {
    const product = document.getElementById('productInput')?.value.trim();
    const quantity = document.getElementById('quantityInput')?.value.trim();
    if (!product) {
        alert('Unesite naziv proizvoda!');
        return;
    }
    if (!quantity || isNaN(parseFloat(quantity))) {
        alert('Unesite količinu!');
        return;
    }
    
    const productData = {
        product_name: product,
        description: document.getElementById('descriptionInput')?.value.trim() || '',
        piece: document.getElementById('pieceInput')?.value.trim() || '-',
        quantity: parseFloat(quantity),
        unit: document.getElementById('unitSelect')?.value || 'kg',
        entry_date: document.getElementById('dateInput')?.value || new Date().toISOString().split('T')[0],
        shelf_life_months: parseInt(document.getElementById('shelfLifeInput')?.value) || 12,
        storage_location: document.getElementById('storageSelect')?.value || 'Ostalo'
    };
    
    let zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    zalihe[index] = productData;
    localStorage.setItem('zalihe', JSON.stringify(zalihe));
    alert('✅ Proizvod ažuriran!');
    renderInventory();
}

function renderShoppingList() {
    currentScreenState = 'shopping';
    const content = document.getElementById('mainContent');
    if (!content) return;
    const shopping = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    
    let html = `<div class="title">${t('spisak_potreba')}</div>`;
    html += `<div style="display:flex; gap:10px; margin-bottom:15px; flex-wrap:wrap;">`;
    html += `<button onclick="renderCategories()" style="background:#f44336; color:white; border:none; padding:10px 20px; border-radius:8px; font-size:16px; cursor:pointer;">✖ ${t('odustani')}</button>`;
    html += `</div>`;
    
    html += `<div class="table-container" style="max-height:400px; overflow-y:auto;">`;
    html += `<div class="table-title">🛒 ${t('spisak_potreba')}</div>`;
    html += `<div id="shoppingTable">`;
    html += `<div class="table-row header-row" style="display:grid; grid-template-columns:1fr 1fr 0.5fr 0.5fr; gap:2px; background:#f0f0f0; font-weight:bold; border-bottom:2px solid #ccc; padding:5px 0;">`;
    html += `<div class="cell">${t('naziv_proizvoda')}</div>`;
    html += `<div class="cell">${t('opis')}</div>`;
    html += `<div class="cell">${t('kolicina')}</div>`;
    html += `<div class="cell">Akcija</div>`;
    html += `</div>`;
    
    if (shopping.length === 0) {
        html += `<div class="table-row"><div class="cell" style="grid-column:span 4;padding:30px;color:#999;text-align:center;">${t('nema_proizvoda')}</div></div>`;
    } else {
        shopping.forEach((p, index) => {
            html += `<div class="table-row" style="display:grid; grid-template-columns:1fr 1fr 0.5fr 0.5fr; gap:2px; border-bottom:1px solid #eee; padding:5px 0;">`;
            html += `<div class="cell">${p.product_name}</div>`;
            html += `<div class="cell">${p.description || ''}</div>`;
            html += `<div class="cell">${p.quantity}</div>`;
            html += `<div class="cell"><button onclick="obrisiSaSpiska(${index})" style="background:#f44336;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;">✖</button></div>`;
            html += `</div>`;
        });
    }
    html += `</div></div>`;
    content.innerHTML = html;
}

function obrisiSaSpiska(index) {
    if (!confirm('Obrišite stavku sa spiska?')) return;
    let shopping = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    shopping.splice(index, 1);
    localStorage.setItem('shoppingList', JSON.stringify(shopping));
    renderShoppingList();
}

// ===== GLAVNA FUNKCIJA ZA NAZAD / ODUSTANI =====
function handleBackAction() {
    console.log('⬅️ Trenutni ekran stanje:', currentScreenState);
    if (currentScreenState === 'dataEntry') {
        if (currentSubcategory) {
            renderProductParts(currentSubcategory);
        } else if (currentCategory) {
            renderSubcategories(currentCategory);
        } else {
            renderCategories();
        }
    } else if (currentScreenState === 'productParts') {
        if (currentCategory) {
            renderSubcategories(currentCategory);
        } else {
            renderCategories();
        }
    } else if (currentScreenState === 'subcategories') {
        renderCategories();
    } else if (currentScreenState === 'categories') {
        showScreen('languageScreen');
        renderLanguages();
    } else {
        showScreen('mainScreen');
        renderCategories();
    }
}

// ============================================
// GLOBALNA FUNKCIJA ZA LOGIN
// ============================================
function triggerLogin() {
    console.log("🔐 triggerLogin pozvan!");
    const phoneInput = document.getElementById('phoneInput');
    if (!phoneInput) {
        alert('Greška: Polje za telefon nije pronađeno!');
        return;
    }
    const phone = phoneInput.value.trim();
    console.log("📱 Unet broj:", phone);
    if (phone.length >= 9) {
        console.log("✅ Login uspešan");
        showScreen('languageScreen');
        renderLanguages();
    } else {
        alert('Unesite validan broj telefona (9+ cifara)!');
    }
}

// ===== GLAVNI DOGAĐAJI =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM je spreman!');

    // ===== LOGIN DUGME =====
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🖱️ Klik na ENTER dugme');
            triggerLogin();
        });
        console.log('✅ Login dugme povezano');
    } else {
        console.error('❌ Login dugme nije pronađeno!');
    }

    // ===== ENTER TASTER =====
    const phoneInput = document.getElementById('phoneInput');
    if (phoneInput) {
        phoneInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                console.log('⌨️ Enter taster pritisnut');
                triggerLogin();
            }
        });
        console.log('✅ Enter taster povezan');
    } else {
        console.error('❌ Phone input nije pronađen!');
    }
    
    // ===== EXIT DUGMAD =====
    document.getElementById('exitLoginBtn')?.addEventListener('click', exitApp);
    document.getElementById('exitLangBtn')?.addEventListener('click', exitApp);
    document.getElementById('exitMainBtn')?.addEventListener('click', exitApp);

    // ===== BACK DUGME =====
    document.getElementById('backBtn')?.addEventListener('click', handleBackAction);
    
    // ===== INVENTORY DUGME =====
    document.getElementById('inventoryBtn')?.addEventListener('click', function() { 
        console.log('📦 Inventory klik');
        renderInventory(); 
    });
    
    // ===== SHOPPING DUGME =====
    document.getElementById('shoppingBtn')?.addEventListener('click', function() { 
        console.log('🛒 Shopping klik');
        renderShoppingList(); 
    });

    // ===== SUPPORT DUGMAD =====
    document.getElementById('supportBtn')?.addEventListener('click', openSupportDialog);
    document.getElementById('closeSupportBtn')?.addEventListener('click', closeSupportDialog);
    document.getElementById('closeSupportBtn2')?.addEventListener('click', closeSupportDialog);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeSupportDialog();
    });

    console.log('✅ Svi događaji povezani!');
});
