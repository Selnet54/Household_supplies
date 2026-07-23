// ============================================
// PUNI SCRIPT ZA APLIKACIJU - ČISTA VERZIJA
// ============================================

console.log('✅ Script.js je učitan!');
window.historyStack = [];

// ===== 0. EXIT FUNKCIJA =====
function exitApp() {
    if (confirm('Da li želite da zatvorite aplikaciju?')) {
        document.getElementById('mainScreen').style.display = 'none';
        document.getElementById('languageScreen').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('phoneInput').value = '';
        document.getElementById('phoneInput').focus();
    }
}

// ===== 1. JEZICI =====
const languages = {
    { code: 'sr', name: 'Srpski', flag: '/Household_supplies/icons/jezici/srpski.png' },
    { code: 'en', name: 'English', flag: '/Household_supplies/icons/jezici/engleski.png' },
    { code: 'de', name: 'Deutsch', flag: '/Household_supplies/icons/jezici/nemacki.png' },
    { code: 'hu', name: 'Magyar', flag: '/Household_supplies/icons/jezici/madjarski.png' },
    { code: 'uk', name: 'Українська', flag: '/Household_supplies/icons/jezici/ukrajinski.png' },
    { code: 'ru', name: 'Русский', flag: '/Household_supplies/icons/jezici/ruski.png' },
    { code: 'zh', name: '中文', flag: '/Household_supplies/icons/jezici/mandarinski.png' },
    { code: 'es', name: 'Español', flag: '/Household_supplies/icons/jezici/spanski.png' },
    { code: 'pt', name: 'Português', flag: '/Household_supplies/icons/jezici/portugalski.png' },
    { code: 'fr', name: 'Français', flag: '/Household_supplies/icons/jezici/francuski.png' }
{;

// ===== 2. PREVODI =====
const translations = {
    sr: {
        nazad: "Nazad", stanje: "Zalihe", spisak: "Spisak",
        glavne_kategorije: "Glavne kategorije", podkategorije: "Podkategorije",
        delovi_proizvoda: "Delovi proizvoda", unos_podataka: "Unos podataka",
        unesi: "Unesi", odustani: "Odustani", nema_proizvoda: "Nema proizvoda",
        spisak_potreba: "Spisak potreba"
    },
    en: {
        nazad: "Back", stanje: "Inventory", spisak: "Shopping List",
        glavne_kategorije: "Main Categories", podkategorije: "Subcategories",
        delovi_proizvoda: "Product Parts", unos_podataka: "Data Entry",
        unesi: "Enter", odustani: "Cancel", nema_proizvoda: "No products",
        spisak_potreba: "Shopping List"
    },
    de: {
        nazad: "Zurück", stanje: "Bestand", spisak: "Einkaufsliste",
        glavne_kategorije: "Hauptkategorien", podkategorije: "Unterkategorien",
        delovi_proizvoda: "Produktteile", unos_podataka: "Dateneingabe",
        unesi: "Eingeben", odustani: "Abbrechen", nema_proizvoda: "Keine Produkte",
        spisak_potreba: "Einkaufsliste"
    },
    hu: {
        nazad: "Vissza", stanje: "Készlet", spisak: "Bevásárlólista",
        glavne_kategorije: "Fő kategóriák", podkategorije: "Alkategóriák",
        delovi_proizvoda: "Termék részei", unos_podataka: "Adatbevitel",
        unesi: "Bevitel", odustani: "Mégsem", nema_proizvoda: "Nincsenek termékek",
        spisak_potreba: "Bevásárlólista"
    },
    uk: {
        nazad: "Назад", stanje: "Запаси", spisak: "Список",
        glavne_kategorije: "Основні категорії", podkategorije: "Підкатегорії",
        delovi_proizvoda: "Частини продукту", unos_podataka: "Введення даних",
        unesi: "Внести", odustani: "Скасувати", nema_proizvoda: "Немає продуктів",
        spisak_potreba: "Список потреб"
    },
    ru: {
        nazad: "Назад", stanje: "Запасы", spisak: "Список",
        glavne_kategorije: "Основные категории", podkategorije: "Подкатегории",
        delovi_proizvoda: "Части продукта", unos_podataka: "Ввод данных",
        unesi: "Внести", odustani: "Отмена", nema_proizvoda: "Нет продуктов",
        spisak_potreba: "Список потребностей"
    },
    zh: {
        nazad: "返回", stanje: "库存", spisak: "购物清单",
        glavne_kategorije: "主要类别", podkategorije: "子类别",
        delovi_proizvoda: "产品部件", unos_podataka: "数据输入",
        unesi: "输入", odustani: "取消", nema_proizvoda: "没有产品",
        spisak_potreba: "购物清单"
    },
    es: {
        nazad: "Atrás", stanje: "Inventario", spisak: "Lista de Compras",
        glavne_kategorije: "Categorías Principales", podkategorije: "Subcategorías",
        delovi_proizvoda: "Partes del Producto", unos_podataka: "Entrada de Datos",
        unesi: "Ingresar", odustani: "Cancelar", nema_proizvoda: "No hay productos",
        spisak_potreba: "Lista de Compras"
    },
    pt: {
        nazad: "Voltar", stanje: "Estoque", spisak: "Lista de Compras",
        glavne_kategorije: "Categorias Principais", podkategorije: "Subcategorias",
        delovi_proizvoda: "Partes do Produto", unos_podataka: "Entrada de Dados",
        unesi: "Inserir", odustani: "Cancelar", nema_proizvoda: "Nenhum produto",
        spisak_potreba: "Lista de Compras"
    },
    fr: {
        nazad: "Retour", stanje: "Stock", spisak: "Liste de Courses",
        glavne_kategorije: "Catégories Principales", podkategorije: "Sous-catégories",
        delovi_proizvoda: "Pièces du Produit", unos_podataka: "Saisie de Données",
        unesi: "Entrer", odustani: "Annuler", nema_proizvoda: "Aucun produit",
        spisak_potreba: "Liste de Courses"
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
    en: ["White meat", "Red meat", "Small game", "Big game", "Fish", "Dairy products", "Vegetables", "Preserves and compotes", "Dough and Sweets", "Beverages", "Chemicals and hygiene", "Other"],
    de: ["Weißes Fleisch", "Rotes Fleisch", "Kleinwild", "Großwild", "Fisch", "Milchprodukte", "Gemüse", "Konserven und Kompotte", "Teig und Süßigkeiten", "Getränke", "Chemie und Hygiene", "Andere"],
    hu: ["Fehér hús", "Vörös hús", "Apróvad", "Nagyvad", "Hal", "Tejtermékek", "Zöldség", "Befőttek és kompótok", "Tészta és Édességek", "Italok", "Kémia és higiénia", "Egyéb"],
    uk: ["Біле м'ясо", "Червоне м'ясо", "Дрібна дичина", "Велика дичина", "Риба", "Молочні продукти", "Овочі", "Консервація та компоти", "Тісто та Солодощі", "Напої", "Хімія та гігієна", "Інше"],
    ru: ["Белое мясо", "Красное мясо", "Мелкая дичь", "Крупная дичь", "Рыба", "Молочные продукты", "Овощи", "Консервация и компоты", "Тесто и Сладости", "Напитки", "Химия и гигиена", "Другое"],
    zh: ["白肉", "红肉", "小型野味", "大型野味", "鱼", "乳制品", "蔬菜", "蜜饯", "面团和糖果", "饮料", "化学品和卫生", "其他"],
    es: ["Carne blanca", "Carne roja", "Caza menor", "Caza mayor", "Pescado", "Productos lácteos", "Verduras", "Conservas y compotas", "Masa y Dulces", "Bebidas", "Química e higiene", "Otro"],
    pt: ["Carne branca", "Carne vermelha", "Caça pequena", "Caça grossa", "Peixe", "Laticínios", "Vegetais", "Conservas e compotas", "Massa e Doces", "Bebidas", "Química e higiene", "Outro"],
    fr: ["Viande blanche", "Viande rouge", "Petit gibier", "Gros gibier", "Poisson", "Produits laitiers", "Légumes", "Conserves et compotes", "Pâte et Sucreries", "Boissons", "Chimie et hygiène", "Autre"]
};

// ===== 5. PODKATEGORIJE =====
const subcategories = {
    sr: {
        "Belo meso": ["Pileće", "Ćureće", "Guska", "Patka", "Ostalo"],
        "Crveno meso": ["Svinjsko", "Jagnjeće", "Ovčije", "Juneće", "Govedina", "Od bika", "Konjsko", "Zečije", "Ostalo"],
        "Riba": ["Morska", "Slatkovodna", "Plodovi mora", "Ostalo"],
        "Povrće": ["Sveže", "Termički obrađeno", "Zamrznuto", "Ostalo"],
        "Ostalo": ["Ostalo"]
    },
    en: {
        "White meat": ["Chicken", "Turkey", "Goose", "Duck", "Other"],
        "Red meat": ["Pork", "Lamb", "Sheep", "Veal", "Beef", "Bull", "Horse", "Rabbit", "Other"],
        "Fish": ["Sea", "Freshwater", "Seafood", "Other"],
        "Vegetables": ["Fresh", "Heat treated", "Frozen", "Other"],
        "Other": ["Other"]
    },
    de: {
        "Weißes Fleisch": ["Huhn", "Truthahn", "Gans", "Ente", "Andere"],
        "Rotes Fleisch": ["Schwein", "Lamm", "Schaf", "Kalb", "Rind", "Bulle", "Pferd", "Kaninchen", "Andere"],
        "Fisch": ["Meer", "Süßwasser", "Meeresfrüchte", "Andere"],
        "Gemüse": ["Frisch", "Wärmebehandelt", "Gefroren", "Andere"],
        "Andere": ["Andere"]
    },
    hu: {
        "Fehér hús": ["Csirke", "Pulyka", "Libacomb", "Kacsa", "Egyéb"],
        "Vörös hús": ["Sertéshús", "Bárányhús", "Juhhús", "Borjúhús", "Marhahús", "Bikahús", "Lóhús", "Nyúlhús", "Egyéb"],
        "Hal": ["Tengeri", "Édesvízi", "Tenger gyümölcsei", "Egyéb"],
        "Zöldség": ["Friss", "Hőkezelt", "Fagyasztott", "Egyéb"],
        "Egyéb": ["Egyéb"]
    },
    uk: {
        "Біле м'ясо": ["Курятина", "Індичка", "Гуска", "Качка", "Інше"],
        "Червоне м'ясо": ["Свинина", "Ягнятина", "Баранина", "Телятина", "Яловичина", "Бичатина", "Конина", "Кролик", "Інше"],
        "Риба": ["Морська", "Прісноводна", "Морепродукти", "Інше"],
        "Овочі": ["Свіжі", "Термічно оброблені", "Заморожені", "Інше"],
        "Інше": ["Інше"]
    },
    ru: {
        "Белое мясо": ["Курица", "Индейка", "Гусь", "Утка", "Другое"],
        "Красное мясо": ["Свинина", "Баранина", "Овца", "Телятина", "Говядина", "Бык", "Конина", "Кролик", "Другое"],
        "Рыба": ["Морская", "Пресноводная", "Морепродукты", "Другое"],
        "Овощи": ["Свежие", "Термически обработанные", "Замороженные", "Другое"],
        "Другое": ["Другое"]
    },
    zh: {
        "白肉": ["鸡", "火鸡", "鹅", "鸭", "其他"],
        "红肉": ["猪肉", "羊肉", "羊", "小牛肉", "牛肉", "公牛", "马肉", "兔肉", "其他"],
        "鱼": ["海鱼", "淡水鱼", "海鲜", "其他"],
        "蔬菜": ["新鲜", "热处理", "冷冻", "其他"],
        "其他": ["其他"]
    },
    es: {
        "Carne blanca": ["Pollo", "Pavo", "Ganso", "Pato", "Otro"],
        "Carne roja": ["Cerdo", "Cordero", "Oveja", "Ternera", "Res", "Toro", "Caballo", "Conejo", "Otro"],
        "Pescado": ["Mar", "Agua dulce", "Mariscos", "Otro"],
        "Verduras": ["Frescas", "Tratadas térmicamente", "Congeladas", "Otro"],
        "Otro": ["Otro"]
    },
    pt: {
        "Carne branca": ["Frango", "Peru", "Ganso", "Pato", "Outro"],
        "Carne vermelha": ["Porco", "Cordeiro", "Ovelha", "Vitela", "Boi", "Touro", "Cavalo", "Coelho", "Outro"],
        "Peixe": ["Mar", "Água doce", "Frutos do mar", "Outro"],
        "Vegetais": ["Fresco", "Tratado termicamente", "Congelado", "Outro"],
        "Outro": ["Outro"]
    },
    fr: {
        "Viande blanche": ["Poulet", "Dinde", "Oie", "Canard", "Autre"],
        "Viande rouge": ["Porc", "Agneau", "Mouton", "Veau", "Bœuf", "Taureau", "Cheval", "Lapin", "Autre"],
        "Poisson": ["Mer", "Eau douce", "Fruits de mer", "Autre"],
        "Légumes": ["Frais", "Traité thermiquement", "Congelé", "Autre"],
        "Autre": ["Autre"]
    }
};

// ===== 6. TRENUTNO STANJE =====
let currentLang = 'sr';
let currentCategory = '';
let currentSubcategory = '';

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
    if (typeof productParts !== 'undefined' && productParts[currentLang] && productParts[currentLang][subcategory]) {
        return productParts[currentLang][subcategory];
    }
    if (typeof productParts !== 'undefined' && productParts.sr && productParts.sr[subcategory]) {
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

// ===== 8. RENDER FUNKCIJE =====
function renderLanguages() {
    const grid = document.getElementById('languageGrid');
    if (!grid) return;
    grid.innerHTML = '';
    languages.forEach(lang => {
        const btn = document.createElement('button');
        btn.className = 'lang-btn-main';
        btn.innerHTML = `
            <img src="${lang.flag}?v=3" alt="${lang.name}" onerror="this.style.display='none'">
            <span class="lang-name">${lang.name}</span>
        `;
        btn.onclick = () => selectLanguage(lang.code);
        grid.appendChild(btn);
    });
    console.log('✅ Jezici prikazani');
}

function selectLanguage(langCode) {
    currentLang = langCode;
    window.historyStack = [];
    showScreen('mainScreen');
    updateHeaderTexts();
    renderCategories();
}

function renderCategories() {
    const content = document.getElementById('mainContent');
    if (!content) return;
    const catList = getMainCategories();
    let html = `<div class="title">${t('glavne_kategorije')}</div>`;
    html += `<div class="categories-grid">`;
    catList.forEach(cat => {
        const color = getCategoryColor(cat);
        html += `<button class="category-btn" style="background:${color};" onclick="renderSubcategories('${cat}')">${cat}</button>`;
    });
    html += `</div>`;
    content.innerHTML = html;
    window.historyStack.push({ type: 'categories' });
}

function renderSubcategories(category) {
    currentCategory = category;
    const content = document.getElementById('mainContent');
    const subList = getSubcategories(category);
    const colors = getSubcategoryColors(category);
    let html = `<div class="title">${category}</div>`;
    html += `<div style="margin-bottom:15px;text-align:center;font-size:20px;color:#666;">${t('podkategorije')}</div>`;
    html += `<div class="categories-grid">`;
    subList.forEach((sub, idx) => {
        const color = colors[idx % colors.length];
        html += `<button class="category-btn" style="background:${color};" onclick="renderProductParts('${sub}')">${sub}</button>`;
    });
    html += `</div>`;
    content.innerHTML = html;
    window.historyStack.push({ type: 'subcategories', category: currentCategory });
}

function renderProductParts(subcategory) {
    currentSubcategory = subcategory;
    const content = document.getElementById('mainContent');
    const parts = getProductParts(subcategory);
    const colors = getSubcategoryColors(currentCategory);
    let html = `<div class="title">${subcategory}</div>`;
    html += `<div style="margin-bottom:15px;text-align:center;font-size:20px;color:#666;">${t('delovi_proizvoda')}</div>`;
    html += `<div class="categories-grid">`;
    if (parts && parts.length > 0) {
        parts.forEach((part, idx) => {
            const color = colors[idx % colors.length];
            html += `<button class="category-btn" style="background:${color};" onclick="renderDataEntry('${part}')">${part}</button>`;
        });
    } else {
        html += `<button class="category-btn" style="background:#ddd;" onclick="renderDataEntry('')">${t('unesi')}</button>`;
    }
    html += `</div>`;
    content.innerHTML = html;
    window.historyStack.push({ type: 'productParts', subcategory: currentSubcategory });
}

function renderDataEntry(productName) {
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
            <button class="btn-cancel" onclick="renderCategories()">✖ ${t('odustani')}</button>
        </div>
        <div class="table-container">
            <div class="table-title">📊 ${t('pregled_unosa')}</div>
            <div id="entriesContainer"><div class="table-row header-row"><div class="cell">${t('komad')}</div><div class="cell">${t('kolicina')}</div><div class="cell">${t('jedinica_mere')}</div><div class="cell">${t('rok_trajanja')}</div><div class="cell">${t('mesto_skladistenja')}</div></div></div>
        </div>
    `;
    document.getElementById('dateInput')?.addEventListener('change', updateExpiryDate);
    document.getElementById('dateInput')?.addEventListener('input', updateExpiryDate);
    document.getElementById('shelfLifeInput')?.addEventListener('change', updateExpiryDate);
    document.getElementById('shelfLifeInput')?.addEventListener('input', updateExpiryDate);
    document.getElementById('productInput')?.focus();
    updateExpiryDate();
    window.historyStack.push({ type: 'productParts', subcategory: currentSubcategory });
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
    if (!product) { alert('Unesite naziv proizvoda!'); return; }
    if (!quantity || isNaN(parseFloat(quantity))) { alert('Unesite količinu!'); return; }
    
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
    zalihe.push(productData);
    localStorage.setItem('zalihe', JSON.stringify(zalihe));
    addProductToTable(productData);
    document.getElementById('pieceInput').value = '';
    document.getElementById('quantityInput').value = '1';
    document.getElementById('quantityInput').focus();
    alert('✅ Proizvod sačuvan!');
}

function addProductToTable(product) {
    const container = document.getElementById('entriesContainer');
    if (!container) return;
    const expiry = new Date(product.entry_date);
    expiry.setMonth(expiry.getMonth() + product.shelf_life_months);
    const expiryDisplay = expiry.toLocaleDateString('sr-RS', { month: '2-digit', year: '2-digit' });
    const row = document.createElement('div');
    row.className = 'table-row';
    row.innerHTML = `
        <div class="cell">${product.piece}</div>
        <div class="cell">${product.quantity}</div>
        <div class="cell">${product.unit}</div>
        <div class="cell">${expiryDisplay}</div>
        <div class="cell">${product.storage_location}</div>
    `;
    container.appendChild(row);
}

// ===== 9. ZALIHE I SPISAK =====
function renderInventory() {
    const content = document.getElementById('mainContent');
    if (!content) return;
    const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    let html = `<div class="title">${t('stanje')}</div>`;
    html += `<div class="table-container"><div class="table-title">📦 ${t('stanje')}</div>`;
    html += `<div id="inventoryTable"><div class="table-row header-row">
        <div class="cell">${t('naziv_proizvoda')}</div>
        <div class="cell">${t('opis')}</div>
        <div class="cell">${t('komad')}</div>
        <div class="cell">${t('kolicina')}</div>
        <div class="cell">${t('jedinica_mere')}</div>
        <div class="cell">${t('rok_trajanja')}</div>
        <div class="cell">${t('mesto_skladistenja')}</div>
    </div>`;
    if (zalihe.length === 0) {
        html += `<div class="table-row"><div class="cell" style="grid-column:span 7;padding:30px;color:#999;">${t('nema_proizvoda')}</div></div>`;
    } else {
        zalihe.forEach(p => {
            const expiry = new Date(p.entry_date);
            expiry.setMonth(expiry.getMonth() + p.shelf_life_months);
            const expiryDisplay = expiry.toLocaleDateString('sr-RS', { month: '2-digit', year: '2-digit' });
            html += `<div class="table-row"><div class="cell">${p.product_name}</div><div class="cell">${p.description}</div><div class="cell">${p.piece}</div><div class="cell">${p.quantity}</div><div class="cell">${p.unit}</div><div class="cell">${expiryDisplay}</div><div class="cell">${p.storage_location}</div></div>`;
        });
    }
    html += `</div></div>`;
    content.innerHTML = html;
}

function renderShoppingList() {
    const content = document.getElementById('mainContent');
    if (!content) return;
    const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    const kritični = zalihe.filter(p => {
        const qty = p.quantity;
        const unit = p.unit;
        if (qty === 0) return true;
        if (unit === 'g' && qty < 400) return true;
        if (unit === 'kg' && qty < 0.4) return true;
        if ((unit === 'kom' || unit === 'pcs') && qty <= 2) return true;
        return false;
    });
    let html = `<div class="title">${t('spisak_potreba')}</div>`;
    html += `<div class="table-container"><div class="table-title">🛒 ${t('spisak_potreba')}</div>`;
    html += `<div id="shoppingTable"><div class="table-row header-row"><div class="cell">${t('naziv_proizvoda')}</div><div class="cell">${t('opis')}</div><div class="cell">${t('kolicina')}</div><div class="cell">${t('jedinica_mere')}</div></div>`;
    if (kritični.length === 0) {
        html += `<div class="table-row"><div class="cell" style="grid-column:span 4;padding:30px;color:#999;">${t('nema_proizvoda')}</div></div>`;
    } else {
        kritični.forEach(p => {
            html += `<div class="table-row"><div class="cell">${p.product_name}</div><div class="cell">${p.description}</div><div class="cell">${p.quantity}</div><div class="cell">${p.unit}</div></div>`;
        });
    }
    html += `</div></div>`;
    content.innerHTML = html;
}

// ===== 10. GLAVNI DOGAĐAJI =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM je spreman!');

    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const phone = document.getElementById('phoneInput').value.trim();
            if (phone.length >= 9) {
                showScreen('languageScreen');
                renderLanguages();
            } else {
                alert('Unesite validan broj telefona (9+ cifara)!');
            }
        });
    }

    document.getElementById('phoneInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') loginBtn?.click();
    });

    document.getElementById('exitLoginBtn')?.addEventListener('click', exitApp);
    document.getElementById('exitLangBtn')?.addEventListener('click', exitApp);
    document.getElementById('exitMainBtn')?.addEventListener('click', exitApp);

    document.getElementById('backBtn')?.addEventListener('click', function() {
    // Ako nema istorije, vrati na jezike
    if (window.historyStack.length === 0) {
        showScreen('languageScreen');
        renderLanguages();
        return;
    }
    
    // Skloni poslednji korak
    const last = window.historyStack.pop();
    
    // Vrati se na prethodni ekran
    if (last.type === 'categories') {
        renderCategories();
    } else if (last.type === 'subcategories') {
        renderSubcategories(last.category);
    } else if (last.type === 'productParts') {
        renderProductParts(last.subcategory);
    } else if (last.type === 'dataEntry') {
        renderProductParts(last.subcategory);
    } else {
        showScreen('languageScreen');
        renderLanguages();
    }
});

    document.getElementById('inventoryBtn')?.addEventListener('click', function() {
        renderInventory();
    });

    document.getElementById('shoppingBtn')?.addEventListener('click', function() {
        renderShoppingList();
    });

    console.log('✅ Svi događaji povezani!');
});
