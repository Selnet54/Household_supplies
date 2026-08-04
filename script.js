// ============================================
// PUNI SCRIPT ZA APLIKACIJU - HIJERARHIJSKI NAZAD
// ============================================
console.log('✅ Script.js je učitan!');

// ===== TRENUTNO STANJE =====
let currentLang = 'sr';
let currentCategory = '';
let currentSubcategory = '';
let db = null;
let products = [];

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

// ============================================
// GLOBALNE FUNKCIJE ZA BAZU (INDEXEDDB)
// ============================================

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('HouseholdSuppliesDB', 1);
        
        request.onerror = event => {
            console.error("IndexedDB error:", event.target.error);
            reject(event.target.error);
        };
        
        request.onsuccess = event => {
            const database = event.target.result;
            resolve(database);
        };
        
        request.onupgradeneeded = event => {
            const database = event.target.result;
            if (!database.objectStoreNames.contains('inventory')) {
                database.createObjectStore('inventory', { keyPath: 'id', autoIncrement: true });
            }
            if (!database.objectStoreNames.contains('shoppingList')) {
                database.createObjectStore('shoppingList', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

function saveProductToDB(productData) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error("Baza nije inicijalizovana!"));
            return;
        }
        const transaction = db.transaction(['inventory'], 'readwrite');
        const store = transaction.objectStore('inventory');
        const request = store.add(productData);

        request.onsuccess = event => resolve(event.target.result);
        request.onerror = event => reject(event.target.error);
    });
}

function getAllProducts() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error("Baza nije inicijalizovana!"));
            return;
        }
        const transaction = db.transaction(['inventory'], 'readonly');
        const store = transaction.objectStore('inventory');
        const request = store.getAll();

        request.onsuccess = event => resolve(event.target.result);
        request.onerror = event => reject(event.target.error);
    });
}

function deleteProductFromDB(id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error("Baza nije inicijalizovana!"));
            return;
        }
        const transaction = db.transaction(['inventory'], 'readwrite');
        const store = transaction.objectStore('inventory');
        const request = store.delete(id);

        request.onsuccess = event => resolve(event.target.result);
        request.onerror = event => reject(event.target.error);
    });
}

function getShoppingList() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error("Baza nije inicijalizovana!"));
            return;
        }
        const transaction = db.transaction(['shoppingList'], 'readonly');
        const store = transaction.objectStore('shoppingList');
        const request = store.getAll();

        request.onsuccess = event => resolve(event.target.result);
        request.onerror = event => reject(event.target.error);
    });
}

function deleteFromShoppingList(id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error("Baza nije inicijalizovana!"));
            return;
        }
        const transaction = db.transaction(['shoppingList'], 'readwrite');
        const store = transaction.objectStore('shoppingList');
        const request = store.delete(id);

        request.onsuccess = event => resolve(event.target.result);
        request.onerror = event => reject(event.target.error);
    });
}

// ============================================
// OSTALE POMOĆNE FUNKCIJE
// ============================================

function triggerLogin() {
    const phoneInput = document.getElementById('phoneInput');
    if (!phoneInput) {
        showModernAlert('Error', 'Phone input field not found!', '❌');
        return;
    }
    const phone = phoneInput.value.trim();
    if (phone.length >= 9) {
        showScreen('languageScreen');
        renderLanguages();
    } else {
        showModernAlert('Error', 'Please enter a valid phone number (9+ digits)!', '⚠️');
    }
}

function selectLanguage(langCode) {
    currentLang = langCode;
    showScreen('mainScreen');
    updateHeaderTexts();
    renderCategories();
}

function showModernAlert(title, message, icon = '📢') {
    const alertDiv = document.getElementById('modernAlert');
    if (!alertDiv) return;

    const iconEl = document.getElementById('alertIcon');
    const titleEl = document.getElementById('alertTitle');
    const messageEl = document.getElementById('alertMessage');

    if (iconEl) iconEl.textContent = icon;
    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;

    alertDiv.style.display = 'flex';
    alertDiv.classList.add('active');

    setTimeout(() => {
        closeModernAlert();
    }, 4000);
}

function closeModernAlert() {
    const alertDiv = document.getElementById('modernAlert');
    if (alertDiv) {
        alertDiv.classList.remove('active');
        alertDiv.style.display = 'none';
    }
}

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
    sr: { name: 'Srpski', flag: 'icons/jezici/srpski.png' },
    en: { name: 'English', flag: 'icons/jezici/engleski.png' },
    de: { name: 'Deutsch', flag: 'icons/jezici/nemacki.png' },
    hu: { name: 'Magyar', flag: 'icons/jezici/madjarski.png' },
    uk: { name: 'Українська', flag: 'icons/jezici/ukrajinski.png' },
    ru: { name: 'Русский', flag: 'icons/jezici/ruski.png' },
    zh: { name: '中文', flag: 'icons/jezici/mandarinski.png' },
    es: { name: 'Español', flag: 'icons/jezici/spanski.png' },
    pt: { name: 'Português', flag: 'icons/jezici/portugalski.png' },
    fr: { name: 'Français', flag: 'icons/jezici/francuski.png' }
};

// ===== 2. PREVODI =====
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
        exit_poruka: "Thanks for using this app! 👋",
        zamrzivac_1: "Freezer 1", zamrzivac_2: "Freezer 2", zamrzivac_3: "Freezer 3",
        frizider: "Refrigerator", ostava: "Pantry", Ostalo: "Other",
        kg: "kg", g: "g", kom: "pcs", l: "l", ml: "ml", pak: "pck", kutija: "box"
    },
    de: {
        nazad: "Zurück", stanje: "Bestand", spisak: "Einkaufsliste",
        naziv_proizvoda: "Produkt:", opis: "Beschreibung:",
        komad: "Stück:", kolicina: "Menge:", jedinica_mere: "Einheit:",
        datum_unosa: "Eingangsdatum:", rok_trajanja: "Haltbarkeit (Monate):",
        automatski_rok: "Auto Ablauf:", mesto_skladistenja: "Lager:",
        unesi: "Eingeben", odustani: "Abbrechen", pretrazi: "Suchen",
        glavne_kategorije: "Hauptkategorien", podkategorije: "Unterkategorien",
        delovi_proizvoda: "Produktteile", unos_podataka: "Dateneingabe",
        pregled_unosa: "Eingabeübersicht", nema_proizvoda: "Keine Produkte",
        spisak_potreba: "Einkaufsliste", azuriraj: "Aktualisieren", obrisi: "Löschen",
        exit_poruka: "Danke für die Nutzung! 👋",
        zamrzivac_1: "Gefrierschrank 1", zamrzivac_2: "Gefrierschrank 2", zamrzivac_3: "Gefrierschrank 3",
        frizider: "Kühlschrank", ostava: "Vorratskammer", Ostalo: "Andere",
        kg: "kg", g: "g", kom: "Stk", l: "l", ml: "ml", pak: "Pck", kutija: "Karton"
    },
    hu: {
        nazad: "Vissza", stanje: "Készlet", spisak: "Bevásárlólista",
        naziv_proizvoda: "Termék:", opis: "Leírás:",
        komad: "Darab:", kolicina: "Mennyiség:", jedinica_mere: "Mértékegység:",
        datum_unosa: "Beírás dátuma:", rok_trajanja: "Szavatosság (hónap):",
        automatski_rok: "Automatikus lejárat:", mesto_skladistenja: "Raktár:",
        unesi: "Bevitel", odustani: "Mégsem", pretrazi: "Keresés",
        glavne_kategorije: "Fő kategóriák", podkategorije: "Alkategóriák",
        delovi_proizvoda: "Termék részei", unos_podataka: "Adatbevitel",
        pregled_unosa: "Bevitel áttekintése", nema_proizvoda: "Nincsenek termékek",
        spisak_potreba: "Bevásárlólista", azuriraj: "Frissítés", obrisi: "Törlés",
        exit_poruka: "Köszönjük a használatot! 👋",
        zamrzivac_1: "Mélyhűtő 1", zamrzivac_2: "Mélyhűtő 2", zamrzivac_3: "Mélyhűtő 3",
        frizider: "Hűtőszekrény", ostava: "Spájz", Ostalo: "Egyéb",
        kg: "kg", g: "g", kom: "db", l: "l", ml: "ml", pak: "csom", kutija: "doboz"
    },
    uk: {
        nazad: "Назад", stanje: "Запаси", spisak: "Список",
        naziv_proizvoda: "Продукт:", opis: "Опис:",
        komad: "Штука:", kolicina: "Кількість:", jedinica_mere: "Од. виміру:",
        datum_unosa: "Дата внесення:", rok_trajanja: "Термін (місяці):",
        automatski_rok: "Авто термін:", mesto_skladistenja: "Сховище:",
        unesi: "Внести", odustani: "Скасувати", pretrazi: "Пошук",
        glavne_kategorije: "Основні категорії", podkategorije: "Підкатегорії",
        delovi_proizvoda: "Частини продукту", unos_podataka: "Введення даних",
        pregled_unosa: "Огляд введення", nema_proizvoda: "Немає продуктів",
        spisak_potreba: "Список потреб", azuriraj: "Оновити", obrisi: "Видалити",
        exit_poruka: "Дякуємо за використання! 👋",
        zamrzivac_1: "Морозилка 1", zamrzivac_2: "Морозилка 2", zamrzivac_3: "Морозилка 3",
        frizider: "Холодильник", ostava: "Комора", Ostalo: "Інше",
        kg: "кг", g: "г", kom: "шт", l: "л", ml: "мл", pak: "уп", kutija: "кор"
    },
    ru: {
        nazad: "Назад", stanje: "Запасы", spisak: "Список",
        naziv_proizvoda: "Продукт:", opis: "Описание:",
        komad: "Штука:", kolicina: "Количество:", jedinica_mere: "Ед. изм.:",
        datum_unosa: "Дата внесения:", rok_trajanja: "Срок (месяцы):",
        automatski_rok: "Авто срок:", mesto_skladistenja: "Склад:",
        unesi: "Внести", odustani: "Отмена", pretrazi: "Поиск",
        glavne_kategorije: "Основные категории", podkategorije: "Подкатегории",
        delovi_proizvoda: "Части продукта", unos_podataka: "Ввод данных",
        pregled_unosa: "Обзор ввода", nema_proizvoda: "Нет продуктов",
        spisak_potreba: "Список потребностей", azuriraj: "Обновить", obrisi: "Удалить",
        exit_poruka: "Спасибо за использование! 👋",
        zamrzivac_1: "Морозилка 1", zamrzivac_2: "Морозилка 2", zamrzivac_3: "Морозилка 3",
        frizider: "Холодильник", ostava: "Кладовая", Ostalo: "Другое",
        kg: "кг", g: "г", kom: "шт", l: "л", ml: "мл", pak: "уп", kutija: "кор"
    },
    zh: {
        nazad: "返回", stanje: "库存", spisak: "购物清单",
        naziv_proizvoda: "产品:", opis: "描述:",
        komad: "件:", kolicina: "数量:", jedinica_mere: "单位:",
        datum_unosa: "录入日期:", rok_trajanja: "保质期(月):",
        automatski_rok: "自动到期:", mesto_skladistenja: "存储:",
        unesi: "输入", odustani: "取消", pretrazi: "搜索",
        glavne_kategorije: "主要类别", podkategorije: "子类别",
        delovi_proizvoda: "产品部件", unos_podataka: "数据输入",
        pregled_unosa: "输入记录查看", nema_proizvoda: "没有产品",
        spisak_potreba: "购物清单", azuriraj: "更新", obrisi: "删除",
        exit_poruka: "感谢使用！👋",
        zamrzivac_1: "冷冻柜 1", zamrzivac_2: "冷冻柜 2", zamrzivac_3: "冷冻柜 3",
        frizider: "冰箱", ostava: "储藏室", Ostalo: "其他",
        kg: "公斤", g: "克", kom: "件", l: "升", ml: "毫升", pak: "包", kutija: "盒"
    },
    es: {
        nazad: "Atrás", stanje: "Inventario", spisak: "Lista de Compras",
        naziv_proizvoda: "Producto:", opis: "Descripción:",
        komad: "Pieza:", kolicina: "Cantidad:", jedinica_mere: "Unidad:",
        datum_unosa: "Fecha de Entrada:", rok_trajanja: "Caducidad (meses):",
        automatski_rok: "Vencimiento Auto:", mesto_skladistenja: "Almacenamiento:",
        unesi: "Ingresar", odustani: "Cancelar", pretrazi: "Buscar",
        glavne_kategorije: "Categorías Principales", podkategorije: "Subcategorías",
        delovi_proizvoda: "Partes del Producto", unos_podataka: "Entrada de Datos",
        pregled_unosa: "Revisión de entrada", nema_proizvoda: "No hay productos",
        spisak_potreba: "Lista de Compras", azuriraj: "Actualizar", obrisi: "Eliminar",
        exit_poruka: "¡Gracias por usar! 👋",
        zamrzivac_1: "Congelador 1", zamrzivac_2: "Congelador 2", zamrzivac_3: "Congelador 3",
        frizider: "Refrigerador", ostava: "Despensa", Ostalo: "Otro",
        kg: "kg", g: "g", kom: "pz", l: "l", ml: "ml", pak: "pq", kutija: "caja"
    },
    pt: {
        nazad: "Voltar", stanje: "Estoque", spisak: "Lista de Compras",
        naziv_proizvoda: "Produto:", opis: "Descrição:",
        komad: "Peça:", kolicina: "Quantidade:", jedinica_mere: "Unidade:",
        datum_unosa: "Data de Entrada:", rok_trajanja: "Validade (meses):",
        automatski_rok: "Validade Auto:", mesto_skladistenja: "Armazenamento:",
        unesi: "Inserir", odustani: "Cancelar", pretrazi: "Pesquisar",
        glavne_kategorije: "Categorias Principais", podkategorije: "Subcategorias",
        delovi_proizvoda: "Partes do Produto", unos_podataka: "Entrada de Dados",
        pregled_unosa: "Revisão de entrada", nema_proizvoda: "Nenhum produto",
        spisak_potreba: "Lista de Compras", azuriraj: "Atualizar", obrisi: "Excluir",
        exit_poruka: "Obrigado por usar! 👋",
        zamrzivac_1: "Congelador 1", zamrzivac_2: "Congelador 2", zamrzivac_3: "Congelador 3",
        frizider: "Geladeira", ostava: "Despensa", Ostalo: "Outro",
        kg: "kg", g: "g", kom: "pç", l: "l", ml: "ml", pak: "pc", kutija: "cx"
    },
    fr: {
        nazad: "Retour", stanje: "Stock", spisak: "Liste de Courses",
        naziv_proizvoda: "Produit:", opis: "Description:",
        komad: "Pièce:", kolicina: "Quantité:", jedinica_mere: "Unité:",
        datum_unosa: "Date d'entrée:", rok_trajanja: "Durée (mois):",
        automatski_rok: "Expiration Auto:", mesto_skladistenja: "Stockage:",
        unesi: "Entrer", odustani: "Annuler", pretrazi: "Rechercher",
        glavne_kategorije: "Catégories Principales", podkategorije: "Sous-catégories",
        delovi_proizvoda: "Pièces du Produit", unos_podataka: "Saisie de Données",
        pregled_unosa: "Aperçu des saisies", nema_proizvoda: "Aucun produit",
        spisak_potreba: "Liste de Courses", azuriraj: "Mettre à jour", obrisi: "Supprimer",
        exit_poruka: "Merci d'utiliser! 👋",
        zamrzivac_1: "Congélateur 1", zamrzivac_2: "Congélateur 2", zamrzivac_3: "Congélateur 3",
        frizider: "Réfrigérateur", ostava: "Garde-manger", Ostalo: "Autre",
        kg: "kg", g: "g", kom: "pc", l: "l", ml: "ml", pak: "paq", kutija: "boîte"
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

// ===== 5. PODKATEGORIJE I DELOVI PROIZVODA =====
if (typeof subcategories === 'undefined') {
    var subcategories = {
        sr: {
            "Belo meso": ["Pileće", "Ćureće", "Guska", "Patka", "Ostalo"],
            "Crveno meso": ["Svinjsko", "Jagnjeće", "Ovčije", "Juneće", "Govedina", "Od bika", "Konjsko", "Zečije", "Ostalo"],
            "Sitna divljač": ["Prepelica", "Fazan", "Jarebica", "Divlja patka", "Divlja guska", "Divlji zec", "Golub", "Ostalo"],
            "Krupna divljač": ["Jelen", "Srna", "Divokoza", "Los", "Irvas", "Divlja svinja", "Bizon", "Kamila", "Lama", "Alpaka", "Kengur", "Krokodil/Aligator", "Gušter", "Zmija", "Ostalo"],
            "Riba": ["Morska", "Slatkovodna", "Plodovi mora", "Ostalo"],
            "Mlečni proizvodi": ["Mleko", "Jogurt i kiselo mleko", "Pavlaka", "Mladi sir", "Tvrdi sir", "Kozji i ovčiji sir", "Kajmak i puter", "Ostalo"],
            "Povrće": ["Sveže", "Termički obrađeno", "Zamrznuto", "Ostalo"],
            "Zimnica i kompoti": ["Voće", "Povrće"],
            "Testo i Slatkiši": ["Testo", "Slatkiši"],
            "Pića": ["Voda", "Vino", "Sok", "Žestoka pića", "Pivo"],
            "Hemija i higijena": ["Sanitar", "Lična higijena", "Pribor"],
            "Ostalo": ["Ostalo"]
        }
    };
}

// Definisani delovi proizvoda (uključujući specifične za Mlečne proizvode i ostalo)
const productParts = {
    sr: {
        "Mleko": ["Kravlje", "Kozje", "Ovčije", "Bademovo", "Sojino", "Ostalo"],
        "Jogurt i kiselo mleko": ["Jogurt", "Kiselo mleko", "Ostalo"],
        "Pavlaka": ["Pavlaka", "Kisela pavlaka", "Ostalo"],
        "Mladi sir": ["Mladi sir", "Ostalo"],
        "Tvrdi sir": ["Tvrdi sir", "Ostalo"],
        "Kozji i ovčiji sir": ["Kozji sir", "Ovčiji sir", "Ostalo"],
        "Kajmak i puter": ["Kajmak", "Puter", "Ostalo"],
        "Voće": ["Kajsija", "Kruška", "Višnja", "Pekmez od jagoda", "Šljivov pekmez", "Trešnja", "Pekmez od malina", "Dunja", "Ananas", "Pekmez od manga", "Ostalo"],
        "Povrće": ["Kiseli krastavci", "Kisela paprika", "Paradajz pire", "Cvekla", "Ajvar", "Turšija", "Kiseli kupus", "Ostalo"],
        "Testo": ["Hleb", "Raženi hleb", "Čabata", "Kukuruzni hleb", "Baguette", "Pšenično brašno", "Integralno brašno", "Heljdino brašno", "Pirinčano brašno", "Začini", "Ostalo"],
        "Slatkiši": ["Kolači", "Torte", "Peciva", "Sladoled", "Čokolada", "Bombone", "Ostalo"],
        "Voda": ["Mineralna", "Negazirana", "Gazirana", "Ostalo"],
        "Vino": ["Crno", "Belo", "Roze", "Ostalo"],
        "Sok": ["Voćni", "Povrtni", "Ostalo"],
        "Žestoka pića": ["Rakija", "Votka", "Viski", "Ostalo"],
        "Pivo": ["Tamno", "Svetlo", "Ostalo"],
        "Sanitar": ["Pranje prozora", "Pranje posuđa", "Pranje podova", "Sredstvo za kupatilo", "Ostalo"],
        "Lična higijena": ["Dezodorans", "Brijač", "Šminka", "Sapun", "Šampon", "Krema", "Ostalo"],
        "Pribor": ["Kantica", "Kofa", "Krpa za prašinu", "Metla", "Ostalo"]
    }
};

// ===== 6. POMOĆNE FUNKCIJE =====
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
    const sub = subcategories[currentLang] || subcategories.sr || {};
    return sub[category] || ['Ostalo'];
}

function getProductParts(subcategory) {
    const langParts = productParts[currentLang] || productParts.sr || {};
    if (langParts[subcategory]) {
        return langParts[subcategory];
    }
    return null; // Vraća null ako nema poddelova
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

// ===== 7. RENDER FUNKCIJE =====
function renderLanguages() {
    const grid = document.getElementById('languageGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    Object.entries(languages).forEach(([code, lang]) => {
        const btn = document.createElement('button');
        btn.className = 'lang-btn-main';
        btn.innerHTML = `
            <img src="${lang.flag}?v=3" alt="${lang.name}" onerror="this.style.display='none'">
            <span class="lang-name">${lang.name}</span>
        `;
        btn.onclick = () => selectLanguage(code);
        grid.appendChild(btn);
    });
}

// ===== GLAVNE KATEGORIJE (BEZ PLAVOG DUGMETA NAZAD) =====
function renderCategories() {
    const content = document.getElementById('mainContent');
    if (!content) return;
    const catList = getMainCategories();
    let html = `<div class="title">${t('glavne_kategorije')}</div>`;
    html += `<div class="categories-grid">`;
    catList.forEach(cat => {
        const color = getCategoryColor(cat);
        html += `<button class="category-btn" style="background:${color};" onclick="renderSubcategories('${cat.replace(/'/g, "\\'")}')">${cat}</button>`;
    });
    html += `</div>`;
    content.innerHTML = html;
}

// ===== PODKATEGORIJE (BEZ PLAVOG DUGMETA NAZAD, DIREKTAN UNOS AKO NEMA DELOVA) =====
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
        const safeSub = sub.replace(/'/g, "\\'");
        const parts = getProductParts(sub);
        
        if (parts && parts.length > 0) {
            html += `<button class="category-btn" style="background:${color};" onclick="renderProductParts('${safeSub}')">${sub}</button>`;
        } else {
            html += `<button class="category-btn" style="background:${color};" onclick="renderDataEntry('${safeSub}')">${sub} ➜</button>`;
        }
    });
    html += `</div>`;
    
    content.innerHTML = html;
}

// ===== DELOVI PROIZVODA =====
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
            const safePart = part.replace(/'/g, "\\'");
            html += `<button class="category-btn" style="background:${color};" onclick="renderDataEntry('${safePart}')">${part}</button>`;
        });
    } else {
        html += `<button class="category-btn" style="background:#ddd;" onclick="renderDataEntry('')">${t('Ostalo') || 'Unesite naziv'}</button>`;
    }
    html += `</div>`;
    
    content.innerHTML = html;
}

// ===== UNOS PODATAKA =====
function renderDataEntry(productName) {
    const content = document.getElementById('mainContent');
    if (!content) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    content.innerHTML = `
        <div class="title">${t('unos_podataka')}</div>
        
        <div class="row">
            <label>${t('naziv_proizvoda')}</label>
            <input type="text" id="productInput" value="${productName || ''}" placeholder="">
        </div>
        
        <div class="row">
            <label>${t('opis')}</label>
            <input type="text" id="descriptionInput" placeholder="">
        </div>
        
        <div class="row">
            <label>${t('komad')}</label>
            <div class="inline-group">
                <input type="text" id="pieceInput" placeholder="">
                <label>${t('kolicina')}</label>
                <input type="number" id="quantityInput" placeholder="0" step="0.1">
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
            <div class="inline-group">
                <span id="expiryDisplay">-</span>
            </div>
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
            <div id="entriesContainer">
                <div class="table-row header-row">
                    <div class="cell">${t('komad')}</div>
                    <div class="cell">${t('kolicina')}</div>
                    <div class="cell">${t('jedinica_mere')}</div>
                    <div class="cell">${t('rok_trajanja')}</div>
                    <div class="cell">${t('mesto_skladistenja')}</div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('dateInput')?.addEventListener('change', updateExpiryDate);
    document.getElementById('dateInput')?.addEventListener('input', updateExpiryDate);
    document.getElementById('shelfLifeInput')?.addEventListener('change', updateExpiryDate);
    document.getElementById('shelfLifeInput')?.addEventListener('input', updateExpiryDate);
    
    document.getElementById('productInput')?.focus();
    updateExpiryDate();
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
        expiryDisplay.textContent = expiry.toLocaleDateString('sr-RS', { 
            day: '2-digit', month: '2-digit', year: 'numeric' 
        });
    } else {
        expiryDisplay.textContent = '-';
    }
}

// ===== SAVE PRODUCT =====
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
    
    saveProductToDB(productData).then(() => {
        addProductToTable(productData);
        document.getElementById('pieceInput').value = '';
        document.getElementById('quantityInput').value = '';
        document.getElementById('quantityInput').focus();
        alert('✅ Proizvod sačuvan!');
    }).catch(err => {
        alert('Greška pri čuvanju: ' + err.message);
    });
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

// ===== ZALIHE =====
function renderInventory() {
    const content = document.getElementById('mainContent');
    if (!content) return;
    
    getAllProducts().then(productsList => {
        let html = `<div class="title">${t('stanje')}</div>`;
        html += `<div class="table-container" style="max-height:400px;">`;
        html += `<div class="table-title">📦 ${t('stanje')}</div>`;
        html += `<div id="inventoryTable">`;
        html += `<div class="table-row header-row">
            <div class="cell">${t('naziv_proizvoda')}</div>
            <div class="cell">${t('opis')}</div>
            <div class="cell">${t('komad')}</div>
            <div class="cell">${t('kolicina')}</div>
            <div class="cell">${t('jedinica_mere')}</div>
            <div class="cell">${t('rok_trajanja')}</div>
            <div class="cell">${t('mesto_skladistenja')}</div>
            <div class="cell">Akcija</div>
        </div>`;
        
        if (productsList.length === 0) {
            html += `<div class="table-row"><div class="cell" style="grid-column:span 8;padding:30px;color:#999;">${t('nema_proizvoda')}</div></div>`;
        } else {
            productsList.forEach(p => {
                const expiry = new Date(p.entry_date);
                expiry.setMonth(expiry.getMonth() + p.shelf_life_months);
                const expiryDisplay = expiry.toLocaleDateString('sr-RS', { month: '2-digit', year: '2-digit' });
                html += `<div class="table-row" data-product-id="${p.id}">
                    <div class="cell">${p.product_name}</div>
                    <div class="cell">${p.description}</div>
                    <div class="cell">${p.piece}</div>
                    <div class="cell">${p.quantity}</div>
                    <div class="cell">${p.unit}</div>
                    <div class="cell">${expiryDisplay}</div>
                    <div class="cell">${p.storage_location}</div>
                    <div class="cell"><button onclick="deleteProduct(${p.id})" style="background:#f44336;color:white;border:none;padding:5px 15px;border-radius:5px;cursor:pointer;">✖</button></div>
                </div>`;
            });
        }
        html += `</div></div>`;
        content.innerHTML = html;
    }).catch(err => {
        content.innerHTML = `<div class="title">${t('stanje')}</div><div style="text-align:center;padding:30px;color:red;">Greška: ${err.message}</div>`;
    });
}

function deleteProduct(id) {
    if (!confirm('Obrišite proizvod?')) return;
    deleteProductFromDB(id).then(() => {
        renderInventory();
    }).catch(err => {
        alert('Greška: ' + err.message);
    });
}

// ===== SPISAK POTREBA =====
function renderShoppingList() {
    const content = document.getElementById('mainContent');
    if (!content) return;
    
    getShoppingList().then(items => {
        let html = `<div class="title">${t('spisak_potreba') || 'Spisak potreba'}</div>`;
        html += `<div class="table-container" style="max-height:400px;">`;
        html += `<div class="table-title">🛒 ${t('spisak_potreba') || 'Spisak potreba'}</div>`;
        html += `<div id="shoppingTable">`;
        html += `<div class="table-row header-row">
            <div class="cell">${t('naziv_proizvoda')}</div>
            <div class="cell">${t('opis')}</div>
            <div class="cell">Akcija</div>
        </div>`;
        
        if (items.length === 0) {
            html += `<div class="table-row"><div class="cell" style="grid-column:span 3;padding:30px;color:#999;">Spisak je prazan</div></div>`;
        } else {
            items.forEach(item => {
                html += `<div class="table-row" data-item-id="${item.id}">
                    <div class="cell">${item.product_name}</div>
                    <div class="cell">${item.description || ''}</div>
                    <div class="cell"><button onclick="removeFromShopping(${item.id})" style="background:#f44336;color:white;border:none;padding:5px 15px;border-radius:5px;cursor:pointer;">✖</button></div>
                </div>`;
            });
        }
        html += `</div></div>`;
        content.innerHTML = html;
    }).catch(err => {
        content.innerHTML = `<div class="title">${t('spisak')}</div><div style="text-align:center;padding:30px;color:red;">Greška: ${err.message}</div>`;
    });
}

function removeFromShopping(id) {
    if (!confirm('Obrišite stavku sa spiska?')) return;
    deleteFromShoppingList(id).then(() => {
        renderShoppingList();
    }).catch(err => {
        alert('Greška: ' + err.message);
    });
}

// ============================================
// INICIJALIZACIJA DOGAĐAJA
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    openDB().then(database => {
        db = database;
        console.log('✅ Baza uspešno otvorena!');
    }).catch(err => {
        console.error('❌ Greška pri otvaranju baze:', err);
    });
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .catch(err => console.log('SW greška: ', err));
    }
    
    showScreen('loginScreen');
    
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            triggerLogin();
        });
    }
    
    const phoneInput = document.getElementById('phoneInput');
    if (phoneInput) {
        phoneInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') document.getElementById('loginBtn')?.click();
        });
    }
    
    document.getElementById('exitLoginBtn')?.addEventListener('click', exitApp);
    document.getElementById('exitLangBtn')?.addEventListener('click', exitApp);
    document.getElementById('exitMainBtn')?.addEventListener('click', exitApp);
    
    document.getElementById('backBtn')?.addEventListener('click', function() {
        showScreen('languageScreen');
        renderLanguages();
    });
    
    document.getElementById('inventoryBtn')?.addEventListener('click', function() {
        renderInventory();
    });
    
    document.getElementById('shoppingBtn')?.addEventListener('click', function() {
        renderShoppingList();
    });
    
    console.log('✅ Svi događaji povezani!');
});
