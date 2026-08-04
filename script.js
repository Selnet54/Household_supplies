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
function showModernAlert(title, message, icon = '📢') {
    const alertDiv = document.getElementById('modernAlert');
    if (!alertDiv) {
        alert(message);
        return;
    }
    document.getElementById('alertIcon').textContent = icon;
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;
    alertDiv.style.display = 'flex';
    alertDiv.classList.add('active');
    setTimeout(() => { closeModernAlert(); }, 4000);
}

function closeModernAlert() {
    const alertDiv = document.getElementById('modernAlert');
    if (alertDiv) {
        alertDiv.classList.remove('active');
        alertDiv.style.display = 'none';
    }
}

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
        oznaci_sve: "Alle auswählen", kopiraj: "Kopieren", obrisi_oznaceno: "Ausgewählte löschen",
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
        oznaci_sve: "Mindet kijelöl", kopiraj: "Másolás", obrisi_oznaceno: "Kijelöltek törlése",
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
        oznaci_sve: "Вибрати все", kopiraj: "Копіювати", obrisi_oznaceno: "Видалити вибране",
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
        oznaci_sve: "Выбрать все", kopiraj: "Копировать", obrisi_oznaceno: "Удалить выбранное",
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
        oznaci_sve: "全选", kopiraj: "复制", obrisi_oznaceno: "删除选中",
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
        oznaci_sve: "Seleccionar todo", kopiraj: "Copiar", obrisi_oznaceno: "Eliminar seleccionados",
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
        oznaci_sve: "Selecionar tudo", kopiraj: "Copiar", obrisi_oznaceno: "Excluir selecionados",
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
        oznaci_sve: "Tout sélectionner", kopiraj: "Copier", obrisi_oznaceno: "Supprimer sélectionnés",
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
    },
    de: {
        "Weißes Fleisch": ["Huhn", "Truthahn", "Gans", "Ente", "Andere"],
        "Rotes Fleisch": ["Schwein", "Lamm", "Schaf", "Kalb", "Rind", "Bulle", "Pferd", "Kaninchen", "Andere"],
        "Kleinwild": ["Wachtel", "Fasan", "Rebhuhn", "Wildente", "Wildgans", "Hase", "Taube", "Andere"],
        "Großwild": ["Hirsch", "Reh", "Wildziege", "Elch", "Rentier", "Wildschwein", "Bison", "Kamel", "Lama", "Alpaka", "Känguru", "Krokodil/Alligator", "Eidechse", "Schlange", "Andere"],
        "Fisch": ["Meer", "Süßwasser", "Meeresfrüchte", "Andere"],
        "Milchprodukte": ["Milch", "Milchverarbeitung", "Andere"],
        "Gemüse": ["Frisch", "Wärmebehandelt", "Gefroren", "Andere"],
        "Konserven und Kompotte": ["Früchte", "Gemüse", "Andere"],
        "Teig und Süßigkeiten": ["Teig", "Süßigkeiten", "Andere"],
        "Getränke": ["Wasser", "Wein", "Saft", "Spirituosen", "Bier", "Andere"],
        "Chemie und Hygiene": ["Sanitär", "Persönliche Hygiene", "Ausrüstung", "Andere"],
        "Andere": ["Andere"]
    },
    hu: {
        "Fehér hús": ["Csirke", "Pulyka", "Libacomb", "Kacsa", "Egyéb"],
        "Vörös hús": ["Sertéshús", "Bárányhús", "Juhhús", "Borjúhús", "Marhahús", "Bikahús", "Lóhús", "Nyúlhús", "Egyéb"],
        "Apróvad": ["Fürj", "Fácán", "Fogoly", "Vadkacsa", "Vadliba", "Vadnyúl", "Galamb", "Egyéb"],
        "Nagyvad": ["Szarvac", "Őz", "Vadkecske", "Jávorszarvas", "Rénszarvas", "Vadkan", "Bölény", "Teve", "Láma", "Alpaka", "Kenguru", "Krokodil/Alligátor", "Gyík", "Kígyó", "Egyéb"],
        "Hal": ["Tengeri", "Édesvízi", "Tenger gyümölcsei", "Egyéb"],
        "Tejtermékek": ["Tej", "Tejfeldolgozások", "Egyéb"],
        "Zöldség": ["Friss", "Hőkezelt", "Fagyasztott", "Egyéb"],
        "Befőttek és kompótok": ["Gyümölcs", "Zöldség", "Egyéb"],
        "Tészta és Édességek": ["Tészta", "Édességek", "Egyéb"],
        "Italok": ["Víz", "Bor", "Lé", "Tömény italok", "Sör", "Egyéb"],
        "Kémia és higiénia": ["WC", "Személyes higiénia", "Felszerelés", "Egyéb"],
        "Egyéb": ["Egyéb"]
    },
    uk: {
        "Біле м'ясо": ["Курятина", "Індичка", "Гуска", "Качка", "Інше"],
        "Червоне м'ясо": ["Свинина", "Ягнятина", "Баранина", "Телятина", "Яловичина", "Бичатина", "Конина", "Кролик", "Інше"],
        "Дрібна дичина": ["Перепілка", "Фазан", "Куріпка", "Дика качка", "Дика гуска", "Заєць", "Голуб", "Інше"],
        "Велика дичина": ["Олень", "Косуля", "Козуль", "Лось", "Північний олень", "Дикий кабан", "Бізон", "Верблюд", "Лама", "Альпака", "Кенгуру", "Крокодил/Алігатор", "Ящірка", "Змія", "Інше"],
        "Риба": ["Морська", "Прісноводна", "Морепродукти", "Інше"],
        "Молочні продукти": ["Молоко", "Молочні переробки", "Інше"],
        "Овочі": ["Свіжі", "Термічно оброблені", "Заморожені", "Інше"],
        "Консервація та компоти": ["Фрукти", "Овочі", "Інше"],
        "Тісто та Солодощі": ["Тісто", "Солодощі", "Інше"],
        "Напої": ["Вода", "Вино", "Сік", "Міцні напої", "Пиво", "Інше"],
        "Хімія та гігієна": ["Санітарія", "Особиста гігієна", "Приладдя", "Інше"],
        "Інше": ["Інше"]
    },
    ru: {
        "Белое мясо": ["Курица", "Индейка", "Гусь", "Утка", "Другое"],
        "Красное мясо": ["Свинина", "Баранина", "Овца", "Телятина", "Говядина", "Бык", "Конина", "Кролик", "Другое"],
        "Мелкая дичь": ["Перепел", "Фазан", "Куропатка", "Дикая утка", "Дикий гусь", "Заяц", "Голубь", "Другое"],
        "Крупная дичь": ["Олень", "Косуля", "Дикая коза", "Лось", "Северный олень", "Кабан", "Бизон", "Верблюд", "Лама", "Альпака", "Кенгуру", "Крокодил/Аллигатор", "Ящерица", "Змея", "Другое"],
        "Рыба": ["Морская", "Пресноводная", "Морепродукты", "Другое"],
        "Молочные продукты": ["Молоко", "Молочные переработки", "Другое"],
        "Овощи": ["Свежие", "Термически обработанные", "Замороженные", "Другое"],
        "Консервация и компоты": ["Фрукты", "Овощи", "Другое"],
        "Тесто и Сладости": ["Тесто", "Сладости", "Другое"],
        "Напитки": ["Вода", "Вино", "Сок", "Крепкие напитки", "Пиво", "Другое"],
        "Химия и гигиена": ["Сантехника", "Личная гигиена", "Оборудование", "Другое"],
        "Другое": ["Другое"]
    },
    zh: {
        "白肉": ["鸡", "火鸡", "鹅", "鸭", "其他"],
        "红肉": ["猪肉", "羊肉", "羊", "小牛肉", "牛肉", "公牛", "马肉", "兔肉", "其他"],
        "小型野味": ["鹌鹑", "野鸡", "鹧鸪", "野鸭", "野鹅", "野兔", "鸽子", "其他"],
        "大型野味": ["鹿", "狍子", "野山羊", "驼鹿", "驯鹿", "野猪", "野牛", "骆驼", "羊驼", "袋鼠", "鳄鱼", "蜥蜴", "蛇", "其他"],
        "鱼": ["海鱼", "淡水鱼", "海鲜", "其他"],
        "乳制品": ["牛奶", "乳制品加工", "其他"],
        "蔬菜": ["新鲜", "热处理", "冷冻", "其他"],
        "蜜饯": ["水果", "蔬菜", "其他"],
        "面团和糖果": ["面团", "糖果", "其他"],
        "饮料": ["水", "葡萄酒", "果汁", "烈酒", "啤酒", "其他"],
        "化学品和卫生": ["卫生", "个人卫生", "设备", "其他"],
        "其他": ["其他"]
    },
    es: {
        "Carne blanca": ["Pollo", "Pavo", "Ganso", "Pato", "Otro"],
        "Carne roja": ["Cerdo", "Cordero", "Oveja", "Ternera", "Res", "Toro", "Caballo", "Conejo", "Otro"],
        "Caza menor": ["Codorniz", "Faisán", "Perdiz", "Pato salvaje", "Ganso salvaje", "Liebre", "Paloma", "Otro"],
        "Caza mayor": ["Ciervo", "Corzo", "Cabra salvaje", "Alce", "Reno", "Jabalí", "Bisonte", "Camello", "Llama", "Alpaca", "Canguro", "Cocodrilo/Caimán", "Lagarto", "Serpiente", "Otro"],
        "Pescado": ["Mar", "Agua dulce", "Mariscos", "Otro"],
        "Productos lácteos": ["Leche", "Procesamiento lácteo", "Otro"],
        "Verduras": ["Frescas", "Tratadas térmicamente", "Congeladas", "Otro"],
        "Conservas y compotas": ["Frutas", "Verduras", "Otro"],
        "Masa y Dulces": ["Masa", "Dulces", "Otro"],
        "Bebidas": ["Agua", "Vino", "Jugo", "Licores", "Cerveza", "Otro"],
        "Química e higiene": ["Sanitario", "Higiene personal", "Equipo", "Otro"],
        "Otro": ["Otro"]
    },
    pt: {
        "Carne branca": ["Frango", "Peru", "Ganso", "Pato", "Outro"],
        "Carne vermelha": ["Porco", "Cordeiro", "Ovelha", "Vitela", "Boi", "Touro", "Cavalo", "Coelho", "Outro"],
        "Caça pequena": ["Codorna", "Faisão", "Perdiz", "Pato selvagem", "Ganso selvagem", "Lebre", "Pombo", "Outro"],
        "Caça grossa": ["Cervo", "Corça", "Cabra selvagem", "Alce", "Rena", "Javali", "Bisão", "Camelo", "Lhama", "Alpaca", "Canguru", "Crocodilo/Jacaré", "Lagarto", "Cobra", "Outro"],
        "Peixe": ["Mar", "Água doce", "Frutos do mar", "Outro"],
        "Laticínios": ["Leite", "Processamento de leite", "Outro"],
        "Vegetais": ["Fresco", "Tratado termicamente", "Congelado", "Outro"],
        "Conservas e compotas": ["Frutas", "Vegetais", "Outro"],
        "Massa e Doces": ["Massa", "Doces", "Outro"],
        "Bebidas": ["Água", "Vinho", "Suco", "Bebidas destiladas", "Cerveja", "Outro"],
        "Química e higiene": ["Sanitário", "Higiene pessoal", "Equipamento", "Outro"],
        "Outro": ["Outro"]
    },
    fr: {
        "Viande blanche": ["Poulet", "Dinde", "Oie", "Canard", "Autre"],
        "Viande rouge": ["Porc", "Agneau", "Mouton", "Veau", "Bœuf", "Taureau", "Cheval", "Lapin", "Autre"],
        "Petit gibier": ["Caille", "Faisan", "Perdrix", "Canard sauvage", "Oie sauvage", "Lièvre", "Pigeon", "Autre"],
        "Gros gibier": ["Cerf", "Chevreuil", "Chèvre sauvage", "Élan", "Renne", "Sanglier", "Bison", "Chameau", "Lama", "Alpaga", "Kangourou", "Crocodile/Alligator", "Lézard", "Serpent", "Autre"],
        "Poisson": ["Mer", "Eau douce", "Fruits de mer", "Autre"],
        "Produits laitiers": ["Lait", "Transformation laitière", "Autre"],
        "Légumes": ["Frais", "Traité thermiquement", "Congelé", "Autre"],
        "Conserves et compotes": ["Fruits", "Légumes", "Autre"],
        "Pâte et Sucreries": ["Pâte", "Sucreries", "Autre"],
        "Boissons": ["Eau", "Vin", "Jus", "Spiritueux", "Bière", "Autre"],
        "Chimie et hygiène": ["Sanitaire", "Hygiène personnelle", "Équipement", "Autre"],
        "Autre": ["Autre"]
    }
};

// ===== 6. PRODUCT PARTS =====
const productParts = {
    sr: {
        "Pileće": ["Gril pile", "Pile celo", "Ceo batak", "Karabatak", "Donji batak", "Belo (grudi)", "File", "Leđa", "Krilca", "Medaljoni", "Nugati", "Panirani odrezak", "Mleveno", "Za supu", "Ostalo"],
        "Ćureće": ["Ceo batak", "Karabatak", "Donji batak", "Rolovani batak", "Odresci od bataka", "Belo (grudi)", "Krilca", "Leđa", "Krila", "Za supu", "Mleveno", "Ostalo"],
        "Guska": ["Belo (grudi)", "Ceo batak", "Karabatak", "Donji batak", "Krilca", "Leđa", "Vrat", "Jetra (foie gras)", "Gušćja mast", "Mleveno", "Za supu", "Ostalo"],
        "Patka": ["Belo (grudi)", "Ceo batak", "Karabatak", "Donji batak", "Krilca", "Leđa", "Vrat", "Pačija mast", "Mleveno", "Jetra", "Za supu", "Ostalo"],
        "Svinjsko": ["Šnicla", "Karmenadla", "Vrat", "But", "Kare", "Rebra", "Grudi", "Plećka", "Podplećka", "Kolenica", "Mleveno", "Usitnjen", "Za supu", "Ostalo"],
        "Jagnjeće": ["Glava", "Vrat", "Plećka", "Slabine", "Grudi", "Bubrežnjak", "But", "Kolenica", "Ostalo"],
        "Ovčije": ["Glava", "Vrat", "Plećka", "Slabine", "Grudi", "Bubrežnjak", "But", "Kolenica", "Ostalo"],
        "Juneće": ["Biftek", "Vrat - zaplecak", "Prsa", "Lopatica", "Kolenica", "Rebra", "Potrbušina", "T-bone steak", "Ramstek", "Rib-Eye", "Rep", "Ostalo"],
        "Govedina": ["Karmedla", "Biftek", "Vrat", "Podplećka", "Grudi", "Kolenica", "Rebra", "Slabine", "Leđa", "Trbušina", "But", "Ostalo"],
        "Od bika": ["But", "Plećka", "Kare (leđa)", "Prsa i rebra", "Lopatica", "Vrat", "Slabina", "Rep", "Ostalo"],
        "Konjsko": ["But", "Plećka", "Kare (leđa)", "Vrat", "Prsa i rebra", "Biftek", "Ramstek", "Mleveno meso", "Ostalo"],
        "Zečije": ["Zadnji but", "Prednji but", "File (leđa)", "Rebra", "Ostalo"],
        "Prepelica": ["Celo meso", "Grudi (fileti)", "Bataci", "Jetra", "Ostalo"],
        "Fazan": ["Celo meso", "Grudi (fileti)", "Bataci", "Jetra", "Ostalo"],
        "Jarebica": ["Celo meso", "Grudi (fileti)", "Bataci", "Jetra", "Ostalo"],
        "Golub": ["Celo meso", "Grudi (fileti)", "Bataci", "Jetra", "Ostalo"],
        "Divlji zec": ["Zadnji but", "Prednji but", "File (leđa)", "Rebra", "Ostalo"],
        "Divlja patka": ["Celo meso", "Grudi (fileti)", "Bataci", "Jetra", "Ostalo"],
        "Divlja guska": ["Celo meso", "Grudi (fileti)", "Bataci", "Jetra", "Ostalo"],
        "Jelen": ["But", "File (leđa)", "Biftek", "Rebra", "Grudi", "Plećka", "Kolenica", "Usitnjeno", "Ostalo"],
        "Srna": ["But", "File (leđa)", "Biftek", "Rebra", "Grudi", "Plećka", "Kolenica", "Usitnjeno", "Ostalo"],
        "Divokoza": ["But", "File (leđa)", "Biftek", "Rebra", "Grudi", "Plećka", "Kolenica", "Usitnjeno", "Ostalo"],
        "Irvas": ["But", "File (leđa)", "Biftek", "Rebra", "Grudi", "Plećka", "Kolenica", "Usitnjeno", "Ostalo"],
        "Los": ["But", "File (leđa)", "Biftek", "Rebra", "Grudi", "Plećka", "Kolenica", "Usitnjeno", "Ostalo"],
        "Divlja svinja": ["But", "Plećka", "Rebra", "Slanina", "Kolenica", "Vrat", "Glava", "Ostalo"],
        "Bizon": ["But", "Plećka", "Biftek", "Ramstek", "Rebra", "Slabina", "Vrat", "Kolenica", "Ostalo"],
        "Kamila": ["But", "Plećka", "File (slabine)", "File (leđa)", "Rebra", "Grudi", "Vrat", "Grba", "Ostalo"],
        "Lama": ["But", "Plećka", "File (leđa i slabine)", "Rebra", "Vrat", "Ostalo"],
        "Alpaka": ["But", "Plećka", "File (leđa i slabine)", "Rebra", "Vrat", "Ostalo"],
        "Kengur": ["But", "Plećka", "File (leđa i slabine)", "Rebra", "Rep", "Ostalo"],
        "Krokodil/Aligator": ["Rep", "File (leđa)", "Butine", "Ostalo"],
        "Zmija": ["Trup (prstenovi)", "Ostalo"],
        "Gušter": ["Rep", "Leđa", "Butine", "Ostalo"],
        "Morska": ["Losos", "Tuna", "Sardina", "Bakalar", "Oslić", "Skuša", "Brancin", "Orada", "Halibut", "Haringa", "Inćuni", "Kirnja", "Ostalo"],
        "Slatkovodna": ["Šaran", "Pastrmka", "Som", "Grgeč", "Smuđ", "Tilapija", "Pangasijus", "Jesetra", "Štuka", "Beli amur", "Pirarukus", "Ostalo"],
        "Plodovi mora": ["Škampi", "Sipa", "Jakobove kapice", "Venerina školjka", "Dagnje", "Kamenice", "Školjke", "Rak", "Hobotnica", "Lignja", "Morski ježevi", "Morski krastavci", "Abalone", "Ostalo"],
        "Mleko": ["Mleko", "Kefir", "Kisela pavlaka", "Slatka pavlaka", "Pavlaka za kuvanje", "Ostalo"],
        "Mlečne prerađevine": ["Urda", "Mladi sir", "Krem sir", "Gouda", "Edamer", "Trapist", "Kačkavalj", "Parmezan", "Gorgonzola", "Rokfor", "Halloumi", "Ostalo"],
        "Sveže": ["Grašak", "Boranija", "Karfiol", "Brokoli", "Bundeva", "Paradajz", "Krastavac", "Paprika", "Ostalo"],
        "Termički obrađeno": ["Grašak", "Boranija", "Kukuruz", "Karfiol", "Brokoli", "Paprika", "Tikvice", "Spanać", "Ostalo"],
        "Zamrznuto": ["Grašak", "Boranija", "Kukuruz", "Karfiol", "Brokoli", "Paprika", "Tikvice", "Spanać", "Ostalo"],
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
        "Pribor": ["Kantica", "Kofa", "Krpa za prašinu", "Metla", "Ostalo"],
        "Ostalo": ["Napomena: Unesite naziv proizvoda"]
    },
    en: {
        "Chicken": ["Grilled chicken", "Whole chicken", "Whole leg", "Thigh fillet", "Drumstick", "Breast", "Fillet", "Back", "Wings", "Medallions", "Nuggets", "Breaded cutlet", "Minced", "For soup", "Other"],
        "Turkey": ["Whole leg", "Thigh fillet", "Drumstick", "Rolled thigh", "Thigh steaks", "Breast", "Wings", "Back", "Wing tips", "For soup", "Minced", "Other"],
        "Goose": ["Breast", "Whole leg", "Thigh fillet", "Drumstick", "Wings", "Back", "Neck", "Liver (foie gras)", "Goose fat", "Minced", "For soup", "Other"],
        "Duck": ["Breast", "Whole leg", "Thigh fillet", "Drumstick", "Wings", "Back", "Neck", "Duck fat", "Minced", "Liver", "For soup", "Other"],
        "Pork": ["Schnitzel", "Chop", "Neck", "Leg", "Loin", "Ribs", "Belly", "Shoulder", "Picnic shoulder", "Hock", "Minced", "Ground", "For soup", "Other"],
        "Lamb": ["Head", "Neck", "Shoulder", "Loin", "Breast", "Kidney", "Leg", "Shank", "Other"],
        "Sheep": ["Head", "Neck", "Shoulder", "Loin", "Breast", "Kidney", "Leg", "Shank", "Other"],
        "Veal": ["Steak", "Neck", "Breast", "Shoulder", "Shank", "Ribs", "Flank", "T-bone steak", "Rump steak", "Rib-Eye", "Tail", "Other"],
        "Beef": ["Steak", "Steak", "Neck", "Shoulder", "Breast", "Shank", "Ribs", "Loin", "Back", "Belly", "Leg", "Other"],
        "Bull": ["Leg", "Shoulder", "Loin", "Breast and ribs", "Shoulder", "Neck", "Flank", "Tail", "Other"],
        "Horse": ["Leg", "Shoulder", "Loin", "Neck", "Breast and ribs", "Steak", "Rump steak", "Minced meat", "Other"],
        "Rabbit": ["Hind leg", "Front leg", "Fillet", "Ribs", "Other"],
        "Quail": ["Whole meat", "Breast fillets", "Legs", "Liver", "Other"],
        "Pheasant": ["Whole meat", "Breast fillets", "Legs", "Liver", "Other"],
        "Partridge": ["Whole meat", "Breast fillets", "Legs", "Liver", "Other"],
        "Pigeon": ["Whole meat", "Breast fillets", "Legs", "Liver", "Other"],
        "Hare": ["Hind leg", "Front leg", "Fillet", "Ribs", "Other"],
        "Wild duck": ["Whole meat", "Breast fillets", "Legs", "Liver", "Other"],
        "Wild goose": ["Whole meat", "Breast fillets", "Legs", "Liver", "Other"],
        "Deer": ["Leg", "Fillet", "Steak", "Ribs", "Breast", "Shoulder", "Shank", "Ground", "Other"],
        "Roe deer": ["Leg", "Fillet", "Steak", "Ribs", "Breast", "Shoulder", "Shank", "Ground", "Other"],
        "Wild goat": ["Leg", "Fillet", "Steak", "Ribs", "Breast", "Shoulder", "Shank", "Ground", "Other"],
        "Reindeer": ["Leg", "Fillet", "Steak", "Ribs", "Breast", "Shoulder", "Shank", "Ground", "Other"],
        "Moose": ["Leg", "Fillet", "Steak", "Ribs", "Breast", "Shoulder", "Shank", "Ground", "Other"],
        "Wild boar": ["Leg", "Shoulder", "Ribs", "Bacon", "Shank", "Neck", "Head", "Other"],
        "Bison": ["Leg", "Shoulder", "Steak", "Rump steak", "Ribs", "Loin", "Neck", "Shank", "Other"],
        "Camel": ["Leg", "Shoulder", "Fillet", "Fillet", "Ribs", "Breast", "Neck", "Hump", "Other"],
        "Llama": ["Leg", "Shoulder", "Fillet", "Ribs", "Neck", "Other"],
        "Alpaca": ["Leg", "Shoulder", "Fillet", "Ribs", "Neck", "Other"],
        "Kangaroo": ["Leg", "Shoulder", "Fillet", "Ribs", "Tail", "Other"],
        "Crocodile/Alligator": ["Tail", "Fillet", "Legs", "Other"],
        "Snake": ["Body rings", "Other"],
        "Lizard": ["Tail", "Back", "Legs", "Other"],
        "Sea": ["Salmon", "Tuna", "Sardine", "Cod", "Hake", "Mackerel", "Seabass", "Gilthead", "Halibut", "Herring", "Anchovy", "Grouper", "Other"],
        "Freshwater": ["Carp", "Trout", "Catfish", "Perch", "Pikeperch", "Tilapia", "Pangasius", "Sturgeon", "Pike", "Grass carp", "Arapaima", "Other"],
        "Seafood": ["Shrimp", "Cuttlefish", "Scallops", "Clams", "Mussels", "Oysters", "Shellfish", "Crab", "Octopus", "Squid", "Sea urchins", "Sea cucumbers", "Abalone", "Other"],
        "Milk": ["Milk", "Kefir", "Sour cream", "Sweet cream", "Cooking cream", "Other"],
        "Dairy processing": ["Curd", "Fresh cheese", "Cream cheese", "Gouda", "Edam", "Trappist", "Kashkaval", "Parmesan", "Gorgonzola", "Roquefort", "Halloumi", "Other"],
        "Fresh": ["Peas", "Green beans", "Cauliflower", "Broccoli", "Pumpkin", "Tomato", "Cucumber", "Pepper", "Other"],
        "Heat treated": ["Peas", "Green beans", "Corn", "Cauliflower", "Broccoli", "Pepper", "Zucchini", "Spinach", "Other"],
        "Frozen": ["Peas", "Green beans", "Corn", "Cauliflower", "Broccoli", "Pepper", "Zucchini", "Spinach", "Other"],
        "Fruits": ["Apricot", "Pear", "Sour cherry", "Strawberry jam", "Plum jam", "Sweet cherry", "Raspberry jam", "Quince", "Pineapple", "Mango jam", "Other"],
        "Vegetables": ["Pickles", "Pickled peppers", "Tomato puree", "Beetroot", "Ajvar", "Mixed pickles", "Sauerkraut", "Other"],
        "Dough": ["Bread", "Rye bread", "Ciabatta", "Corn bread", "Baguette", "Wheat flour", "Whole wheat flour", "Buckwheat flour", "Rice flour", "Spices", "Other"],
        "Sweets": ["Cakes", "Tarts", "Pastries", "Ice cream", "Chocolate", "Candy", "Other"],
        "Water": ["Mineral", "Still", "Sparkling", "Other"],
        "Wine": ["Red", "White", "Rosé", "Other"],
        "Juice": ["Fruit", "Vegetable", "Other"],
        "Spirits": ["Brandy", "Vodka", "Whisky", "Other"],
        "Beer": ["Dark", "Light", "Other"],
        "Sanitary": ["Window cleaner", "Dish soap", "Floor cleaner", "Bathroom cleaner", "Other"],
        "Personal hygiene": ["Deodorant", "Razor", "Makeup", "Soap", "Shampoo", "Cream", "Other"],
        "Equipment": ["Bucket", "Bucket", "Duster", "Broom", "Other"],
        "Other": ["Note: Enter product name"]
    },
    de: {
        "Huhn": ["Grillhähnchen", "Ganzes Huhn", "Ganze Keule", "Keulenfilet", "Unterkeule", "Brust", "Filet", "Rücken", "Flügel", "Medaillons", "Nuggets", "Panierte Schnitzel", "Hackfleisch", "Für Suppe", "Andere"],
        "Truthahn": ["Ganze Keule", "Keulenfilet", "Unterkeule", "Roulade", "Keulenschnitzel", "Brust", "Flügel", "Rücken", "Flügelspitzen", "Für Suppe", "Hackfleisch", "Andere"],
        "Gans": ["Brust", "Ganze Keule", "Keulenfilet", "Unterkeule", "Flügel", "Rücken", "Hals", "Leber (Foie Gras)", "Gänseschmalz", "Hackfleisch", "Für Suppe", "Andere"],
        "Ente": ["Brust", "Ganze Keule", "Keulenfilet", "Unterkeule", "Flügel", "Rücken", "Hals", "Entenschmalz", "Hackfleisch", "Leber", "Für Suppe", "Andere"],
        "Schwein": ["Schnitzel", "Kotelett", "Nacken", "Keule", "Karre", "Rippen", "Bauch", "Schulter", "Unterschulter", "Haxe", "Hackfleisch", "Klein geschnitten", "Für Suppe", "Andere"],
        "Lamm": ["Kopf", "Hals", "Schulter", "Lende", "Brust", "Niere", "Keule", "Haxe", "Andere"],
        "Schaf": ["Kopf", "Hals", "Schulter", "Lende", "Brust", "Niere", "Keule", "Haxe", "Andere"],
        "Kalb": ["Steak", "Hals", "Brust", "Schulter", "Haxe", "Rippen", "Flanke", "T-Bone-Steak", "Rumpsteak", "Rib-Eye", "Schwanz", "Andere"],
        "Rind": ["Steak", "Steak", "Hals", "Schulter", "Brust", "Haxe", "Rippen", "Lende", "Rücken", "Bauch", "Keule", "Andere"],
        "Bulle": ["Keule", "Schulter", "Lende", "Brust und Rippen", "Schulter", "Hals", "Flanke", "Schwanz", "Andere"],
        "Pferd": ["Keule", "Schulter", "Lende", "Hals", "Brust und Rippen", "Steak", "Rumpsteak", "Hackfleisch", "Andere"],
        "Kaninchen": ["Hinterkeule", "Vorderkeule", "Filet", "Rippen", "Andere"],
        "Wachtel": ["Ganzes Fleisch", "Brustfilets", "Keulen", "Leber", "Andere"],
        "Fasan": ["Ganzes Fleisch", "Brustfilets", "Keulen", "Leber", "Andere"],
        "Rebhuhn": ["Ganzes Fleisch", "Brustfilets", "Keulen", "Leber", "Andere"],
        "Taube": ["Ganzes Fleisch", "Brustfilets", "Keulen", "Leber", "Andere"],
        "Hase": ["Hinterkeule", "Vorderkeule", "Filet", "Rippen", "Andere"],
        "Wildente": ["Ganzes Fleisch", "Brustfilets", "Keulen", "Leber", "Andere"],
        "Wildgans": ["Ganzes Fleisch", "Brustfilets", "Keulen", "Leber", "Andere"],
        "Hirsch": ["Keule", "Filet", "Steak", "Rippen", "Brust", "Schulter", "Haxe", "Hackfleisch", "Andere"],
        "Reh": ["Keule", "Filet", "Steak", "Rippen", "Brust", "Schulter", "Haxe", "Hackfleisch", "Andere"],
        "Wildziege": ["Keule", "Filet", "Steak", "Rippen", "Brust", "Schulter", "Haxe", "Hackfleisch", "Andere"],
        "Rentier": ["Keule", "Filet", "Steak", "Rippen", "Brust", "Schulter", "Haxe", "Hackfleisch", "Andere"],
        "Elch": ["Keule", "Filet", "Steak", "Rippen", "Brust", "Schulter", "Haxe", "Hackfleisch", "Andere"],
        "Wildschwein": ["Keule", "Schulter", "Rippen", "Speck", "Haxe", "Hals", "Kopf", "Andere"],
        "Bison": ["Keule", "Schulter", "Steak", "Rumpsteak", "Rippen", "Lende", "Hals", "Haxe", "Andere"],
        "Kamel": ["Keule", "Schulter", "Filet", "Filet", "Rippen", "Brust", "Hals", "Höcker", "Andere"],
        "Lama": ["Keule", "Schulter", "Filet", "Rippen", "Hals", "Andere"],
        "Alpaka": ["Keule", "Schulter", "Filet", "Rippen", "Hals", "Andere"],
        "Känguru": ["Keule", "Schulter", "Filet", "Rippen", "Schwanz", "Andere"],
        "Krokodil/Alligator": ["Schwanz", "Filet", "Keulen", "Andere"],
        "Schlange": ["Ringe", "Andere"],
        "Eidechse": ["Schwanz", "Rücken", "Keulen", "Andere"],
        "Meer": ["Lachs", "Thunfisch", "Sardine", "Kabeljau", "Seehecht", "Makrele", "Seebarsch", "Goldbrasse", "Heilbutt", "Hering", "Sardelle", "Zackenbarsch", "Andere"],
        "Süßwasser": ["Karpfen", "Forelle", "Wels", "Barsch", "Zander", "Tilapia", "Pangasius", "Stör", "Hecht", "Graskarpfen", "Arapaima", "Andere"],
        "Meeresfrüchte": ["Garnelen", "Tintenfisch", "Jakobsmuscheln", "Venusmuscheln", "Miesmuscheln", "Austern", "Schalen", "Krabbe", "Oktopus", "Kalmar", "Seeigel", "Seegurken", "Abalone", "Andere"],
        "Milch": ["Milch", "Kefir", "Sauerrahm", "Süße Sahne", "Kochsahne", "Andere"],
        "Milchverarbeitung": ["Topfen", "Frischkäse", "Frischkäse", "Gouda", "Edamer", "Trappist", "Kaschkawal", "Parmesan", "Gorgonzola", "Roquefort", "Halloumi", "Andere"],
        "Frisch": ["Erbsen", "Grüne Bohnen", "Blumenkohl", "Brokkoli", "Kürbis", "Tomate", "Gurke", "Paprika", "Andere"],
        "Wärmebehandelt": ["Erbsen", "Grüne Bohnen", "Mais", "Blumenkohl", "Brokkoli", "Paprika", "Zucchini", "Spinat", "Andere"],
        "Gefroren": ["Erbsen", "Grüne Bohnen", "Mais", "Blumenkohl", "Brokkoli", "Paprika", "Zucchini", "Spinat", "Andere"],
        "Früchte": ["Aprikose", "Birne", "Sauerkirsche", "Erdbeermarmelade", "Pflaumenmarmelade", "Süßkirsche", "Himbeermarmelade", "Quitte", "Ananas", "Mangomarmelade", "Andere"],
        "Gemüse": ["Essiggurken", "Eingelegte Paprika", "Tomatenmark", "Rote Bete", "Ajvar", "Gemischtes", "Sauerkraut", "Andere"],
        "Teig": ["Brot", "Roggenbrot", "Ciabatta", "Maisbrot", "Baguette", "Weizenmehl", "Vollkornmehl", "Buchweizenmehl", "Reismehl", "Gewürze", "Andere"],
        "Süßigkeiten": ["Kuchen", "Torten", "Gebäck", "Eiscreme", "Schokolade", "Bonbons", "Andere"],
        "Wasser": ["Mineral", "Still", "Sprudel", "Andere"],
        "Wein": ["Rot", "Weiß", "Rosé", "Andere"],
        "Saft": ["Frucht", "Gemüse", "Andere"],
        "Spirituosen": ["Schnaps", "Wodka", "Whisky", "Andere"],
        "Bier": ["Dunkel", "Hell", "Andere"],
        "Sanitär": ["Glasreiniger", "Spülmittel", "Bodenreiniger", "Badreiniger", "Andere"],
        "Persönliche Hygiene": ["Deodorant", "Rasierer", "Make-up", "Seife", "Shampoo", "Creme", "Andere"],
        "Ausrüstung": ["Eimer", "Eimer", "Staubwedel", "Besen", "Andere"],
        "Andere": ["Hinweis: Produktname eingeben"]
    },
    hu: {
        "Csirke": ["Grillcsirke", "Egész csirke", "Egész comb", "Comb filé", "Alsó comb", "Fehér hús (mell)", "Filé", "Hát", "Szárny", "Medál", "Nugget", "Rántott szelet", "Darált", "Leveshez", "Egyéb"],
        "Pulyka": ["Egész comb", "Comb filé", "Alsó comb", "Tekercs comb", "Comb szeletek", "Fehér hús (mell)", "Szárny", "Hát", "Szárnyak", "Leveshez", "Darált", "Egyéb"],
        "Libacomb": ["Fehér hús (mell)", "Egész comb", "Comb filé", "Alsó comb", "Szárny", "Hát", "Nyak", "Májas pástétom", "Libazsír", "Darált", "Leveshez", "Egyéb"],
        "Kacsa": ["Fehér hús (mell)", "Egész comb", "Comb filé", "Alsó comb", "Szárny", "Hát", "Nyak", "Kacsazsír", "Darált", "Máj", "Leveshez", "Egyéb"],
        "Sertéshús": ["Szelet", "Karfiol", "Nyak", "Comb", "Szűzérme", "Borda", "Mell", "Lapocka", "Karakas", "Csülök", "Darált", "Apróra vágott", "Leveshez", "Egyéb"],
        "Bárányhús": ["Fej", "Nyak", "Lapocka", "Gerinc", "Mell", "Vese", "Comb", "Csülök", "Egyéb"],
        "Juhhús": ["Fej", "Nyak", "Lapocka", "Gerinc", "Mell", "Vese", "Comb", "Csülök", "Egyéb"],
        "Borjúhús": ["Bifsztek", "Nyak - tarja", "Mell", "Lapocka", "Csülök", "Borda", "Has", "T-bone steak", "Rump steak", "Rib-Eye", "Farok", "Egyéb"],
        "Marhahús": ["Roston sült", "Bifsztek", "Nyak", "Karakas", "Mell", "Csülök", "Borda", "Gerinc", "Hát", "Has", "Comb", "Egyéb"],
        "Bikahús": ["Comb", "Lapocka", "Szűzérme (hát)", "Mell és borda", "Lapocka", "Nyak", "Ágyék", "Farok", "Egyéb"],
        "Lóhús": ["Comb", "Lapocka", "Szűzérme (hát)", "Nyak", "Mell és borda", "Bifsztek", "Rump steak", "Darált hús", "Egyéb"],
        "Nyúlhús": ["Hátsó comb", "Elülső comb", "Filé (hát)", "Borda", "Egyéb"],
        "Fürj": ["Egész hús", "Mell (filék)", "Combok", "Máj", "Egyéb"],
        "Fácán": ["Egész hús", "Mell (filék)", "Combok", "Máj", "Egyéb"],
        "Fogoly": ["Egész hús", "Mell (filék)", "Combok", "Máj", "Egyéb"],
        "Galamb": ["Egész hús", "Mell (filék)", "Combok", "Máj", "Egyéb"],
        "Vadnyúl": ["Hátsó comb", "Elülső comb", "Filé (hát)", "Borda", "Egyéb"],
        "Vadkacsa": ["Egész hús", "Mell (filék)", "Combok", "Máj", "Egyéb"],
        "Vadliba": ["Egész hús", "Mell (filék)", "Combok", "Máj", "Egyéb"],
        "Szarvac": ["Comb", "Filé (hát)", "Bifsztek", "Borda", "Mell", "Lapocka", "Csülök", "Apróra vágott", "Egyéb"],
        "Őz": ["Comb", "Filé (hát)", "Bifsztek", "Borda", "Mell", "Lapocka", "Csülök", "Apróra vágott", "Egyéb"],
        "Vadkecske": ["Comb", "Filé (hát)", "Bifsztek", "Borda", "Mell", "Lapocka", "Csülök", "Apróra vágott", "Egyéb"],
        "Jávorszarvas": ["Comb", "Filé (hát)", "Bifsztek", "Borda", "Mell", "Lapocka", "Csülök", "Apróra vágott", "Egyéb"],
        "Rénszarvas": ["Comb", "Filé (hát)", "Bifsztek", "Borda", "Mell", "Lapocka", "Csülök", "Apróra vágott", "Egyéb"],
        "Vadkan": ["Comb", "Lapocka", "Borda", "Szalonna", "Csülök", "Nyak", "Fej", "Egyéb"],
        "Bölény": ["Comb", "Lapocka", "Bifsztek", "Rump steak", "Borda", "Ágyék", "Nyak", "Csülök", "Egyéb"],
        "Teve": ["Comb", "Lapocka", "Filé (ágyék)", "Filé (hát)", "Borda", "Mell", "Nyak", "Púp", "Egyéb"],
        "Láma": ["Comb", "Lapocka", "Filé (hát és ágyék)", "Borda", "Nyak", "Egyéb"],
        "Alpaka": ["Comb", "Lapocka", "Filé (hát és ágyék)", "Borda", "Nyak", "Egyéb"],
        "Kenguru": ["Comb", "Lapocka", "Filé (hát és ágyék)", "Borda", "Farok", "Egyéb"],
        "Krokodil/Alligátor": ["Farok", "Filé (hát)", "Combok", "Egyéb"],
        "Gyík": ["Farok", "Hát", "Combok", "Egyéb"],
        "Kígyó": ["Törzs (gyűrűk)", "Egyéb"],
        "Tengeri": ["Lazac", "Tonhal", "Szardínia", "Tőkehal", "Tőkehal", "Makréla", "Fogas", "Aranysügér", "Laposhal", "Herring", "Szardella", "Tőkehal", "Egyéb"],
        "Édesvízi": ["Ponty", "Pisztráng", "Harcsa", "Kárász", "Sügér", "Tilápia", "Pangász", "Tok", "Csuka", "Fehér amur", "Arapaima", "Egyéb"],
        "Tenger gyümölcsei": ["Garnéla", "Tintahal", "Kagyló", "Kagyló", "Kagyló", "Kagyló", "Kagyló", "Rák", "Polip", "Lília", "Tengeri sün", "Tengeri uborka", "Abalone", "Egyéb"],
        "Tej": ["Tej", "Kefir", "Tejföl", "Tejszín", "Főzőtejszín", "Egyéb"],
        "Tejfeldolgozások": ["Túró", "Friss sajt", "Krémsajt", "Gouda", "Edami", "Trappista", "Kaskavál", "Parmezán", "Gorgonzola", "Roquefort", "Halloumi", "Egyéb"],
        "Friss": ["Borsó", "Zöldbab", "Karfiol", "Brokkoli", "Tök", "Paradicsom", "Uborka", "Paprika", "Egyéb"],
        "Hőkezelt": ["Borsó", "Zöldbab", "Kukorica", "Karfiol", "Brokkoli", "Paprika", "Cukkini", "Spenót", "Egyéb"],
        "Fagyasztott": ["Borsó", "Zöldbab", "Kukorica", "Karfiol", "Brokkoli", "Paprika", "Cukkini", "Spenót", "Egyéb"],
        "Gyümölcs": ["Sárgabarack", "Körte", "Cseresznye", "Epres lekvár", "Szilvalekvár", "Cseresznye", "Málnalekvár", "Birsalma", "Ananász", "Mangó lekvár", "Egyéb"],
        "Zöldség": ["Savanyú uborka", "Savanyú paprika", "Paradicsompüré", "Cékla", "Ajvár", "Savanyúság", "Savanyú káposzta", "Egyéb"],
        "Tészta": ["Kenyér", "Rozskenyér", "Ciabatta", "Kukoricalepény", "Baguette", "Búzaliszt", "Teljes kiőrlésű liszt", "Hajdinaliszt", "Rizsliszt", "Fűszerek", "Egyéb"],
        "Édességek": ["Sütemények", "Torták", "Pékáru", "Fagylalt", "Csokoládé", "Cukorkák", "Egyéb"],
        "Víz": ["Ásványvíz", "Szénsavmentes", "Szénsavas", "Egyéb"],
        "Bor": ["Vörös", "Fehér", "Rozé", "Egyéb"],
        "Lé": ["Gyümölcslé", "Zöldséglé", "Egyéb"],
        "Tömény italok": ["Pálinka", "Vodka", "Whisky", "Egyéb"],
        "Sör": ["Barna", "Világos", "Egyéb"],
        "WC": ["Ablaktisztító", "Mosogatószer", "Padlótisztító", "Fürdőszobai tisztítószer", "Egyéb"],
        "Személyes higiénia": ["Dezodor", "Borotva", "Smink", "Szappan", "Sampon", "Krém", "Egyéb"],
        "Felszerelés": ["Vödör", "Vödör", "Poroló", "Seprű", "Egyéb"],
        "Egyéb": ["Megjegyzés: Írja be a termék nevét"]
    },
    uk: {
        "Курятина": ["Ціла курка", "Грудка", "Стегно", "Гомілка", "Крило", "Філе", "Спина", "Медальйони", "Нагетси", "Панірований шніцель", "Фарш", "Для супу", "Інше"],
        "Індичка": ["Ціла індичка", "Грудка", "Стегно", "Крило", "Філе", "Спина", "Медальйони", "Для супу", "Фарш", "Інше"],
        "Гуска": ["Ціла гуска", "Грудка", "Стегно", "Крило", "Спина", "Шия", "Печінка", "Гусячий жир", "Фарш", "Для супу", "Інше"],
        "Качка": ["Ціла качка", "Грудка", "Стегно", "Крило", "Спина", "Шия", "Качиний жир", "Печінка", "Фарш", "Для супу", "Інше"],
        "Свинина": ["Філе", "Котлета", "Окост", "Шия", "Лопатка", "Грудинка", "Ребра", "Голяшка", "Шинка", "Фарш", "Для супу", "Інше"],
        "Ягнятина": ["Філе", "Котлета", "Окост", "Шия", "Лопатка", "Грудинка", "Ребра", "Голяшка", "Фарш", "Для супу", "Інше"],
        "Баранина": ["Філе", "Котлета", "Окост", "Шия", "Лопатка", "Грудинка", "Ребра", "Голяшка", "Фарш", "Для супу", "Інше"],
        "Телятина": ["Філе", "Котлета", "Окост", "Шия", "Лопатка", "Грудинка", "Ребра", "Голяшка", "Фарш", "Для супу", "Інше"],
        "Яловичина": ["Філей", "Стейк", "Окост", "Шия", "Лопатка", "Грудинка", "Ребра", "Голяшка", "Фарш", "Для супу", "Інше"],
        "Кролик": ["Задні лапи", "Передні лапи", "Спинка", "Ребра", "Для супу", "Інше"],
        "Перепілка": ["Ціла", "Грудка", "Гомілки", "Крила", "Печінка", "Інше"],
        "Фазан": ["Цілий", "Грудка", "Гомілки", "Крила", "Печінка", "Інше"],
        "Куріпка": ["Ціла", "Грудка", "Гомілки", "Крила", "Печінка", "Інше"],
        "Голуб": ["Цілий", "Грудка", "Гомілки", "Крила", "Печінка", "Інше"],
        "Заєць": ["Задні лапи", "Передні лапи", "Спинка", "Ребра", "Інше"],
        "Дика качка": ["Ціла", "Грудка", "Гомілки", "Крила", "Печінка", "Інше"],
        "Дика гуска": ["Ціла", "Грудка", "Гомілки", "Крила", "Печінка", "Інше"],
        "Олень": ["Філе", "Котлета", "Окост", "Шия", "Лопатка", "Грудинка", "Ребра", "Голяшка", "Фарш", "Для супу", "Інше"],
        "Косуля": ["Філе", "Котлета", "Окост", "Шия", "Лопатка", "Грудинка", "Ребра", "Голяшка", "Фарш", "Для супу", "Інше"],
        "Дикий кабан": ["Філе", "Котлета", "Окост", "Шия", "Лопатка", "Грудинка", "Ребра", "Голяшка", "Фарш", "Для супу", "Інше"],
        "Лось": ["Філе", "Котлета", "Окост", "Шия", "Лопатка", "Грудинка", "Ребра", "Голяшка", "Фарш", "Для супу", "Інше"],
        "Північний олень": ["Філе", "Котлета", "Окост", "Шия", "Лопатка", "Грудинка", "Ребра", "Голяшка", "Фарш", "Для супу", "Інше"],
        "Бізон": ["Філе", "Стейк", "Окост", "Шия", "Лопатка", "Грудинка", "Ребра", "Голяшка", "Фарш", "Для супу", "Інше"],
        "Верблюд": ["Філе", "Котлета", "Окост", "Шия", "Лопатка", "Горб", "Ребра", "Фарш", "Для супу", "Інше"],
        "Лама": ["Філе", "Котлета", "Окост", "Шия", "Лопатка", "Ребра", "Фарш", "Для супу", "Інше"],
        "Альпака": ["Філе", "Котлета", "Окост", "Шия", "Лопатка", "Ребра", "Фарш", "Для супу", "Інше"],
        "Кенгуру": ["Філе", "Стейк", "Окост", "Шия", "Лопатка", "Хвіст", "Фарш", "Для супу", "Інше"],
        "Крокодил/Алігатор": ["Хвіст", "Філе", "Гомілки", "Інше"],
        "Ящірка": ["Хвіст", "Спина", "Гомілки", "Інше"],
        "Змія": ["Кільця", "Інше"],
        "Морська": ["Філе", "Стейк", "Ціла риба", "Філе зі шкірою", "Філе без шкіри", "Шматки", "Для супу", "Інше"],
        "Прісноводна": ["Філе", "Стейк", "Ціла риба", "Філе зі шкірою", "Філе без шкіри", "Шматки", "Для супу", "Інше"],
        "Морепродукти": ["Креветки", "Кальмар", "Мідії", "Устриці", "Гребінці", "Краби", "Восьминіг", "Каракатиця", "Інше"],
        "Молоко": ["Цільне", "Знежирене", "Пастеризоване", "Стерилізоване", "Кип'ячене", "Згущене", "Сухе", "Інше"],
        "Молочні переробки": ["Сир", "Сир домашній", "Сметана", "Йогурт", "Кефір", "Масло", "Сирний крем", "Інше"],
        "Свіжі": ["Цілі", "Нарізані", "Виміті", "Очищені", "Терті", "Інше"],
        "Термічно оброблені": ["Варені", "Тушковані", "Смажені", "Запечені", "Приготовані на пару", "Інше"],
        "Заморожені": ["Цілі", "Нарізані", "Суміш", "Пюре", "Інше"],
        "Фрукти": ["Цілі", "Нарізані", "Очищені", "Без кісточок", "Консервовані", "Сушені", "Інше"],
        "Тісто": ["Дріжджове", "Пісочне", "Листкове", "Для млинців", "Для піци", "Для макарон", "Інше"],
        "Солодощі": ["Шоколад", "Цукерки", "Печиво", "Торти", "Випічка", "Морозиво", "Вафлі", "Інше"],
        "Вода": ["Газована", "Негазована", "Мінеральна", "Ароматизована", "Інше"],
        "Вино": ["Червоне", "Біле", "Рожеве", "Ігристe", "Солодке", "Сухе", "Напівсухе", "Інше"],
        "Сік": ["Яблучний", "Апельсиновий", "Виноградний", "Томатний", "Мультифрукт", "З м'якоттю", "Без м'якоті", "Інше"],
        "Міцні напої": ["Горілка", "Віскі", "Коньяк", "Ром", "Джин", "Текіла", "Лікер", "Інше"],
        "Пиво": ["Світле", "Темне", "Пшеничне", "Крафтове", "Безалкогольне", "Інше"],
        "Санітарія": ["Для ванної", "Для туалету", "Для умивальника", "Універсальний", "Антибактеріальний", "Інше"],
        "Особиста гігієна": ["Мило", "Шампунь", "Гель для душу", "Дезодорант", "Зубна паста", "Бритва", "Крем", "Інше"],
        "Приладдя": ["Відро", "Швабра", "Ганчірка", "Губка", "Щітка", "Рукавиці", "Інше"],
        "Інше": ["Примітка: введіть назву продукту"]
    },
    ru: {
        "Курица": ["Целая курица", "Грудка", "Бедро", "Голень", "Крыло", "Филе", "Спина", "Медальоны", "Наггетсы", "Панированное", "Фарш", "Для супа", "Другое"],
        "Индейка": ["Целая индейка", "Грудка", "Бедро", "Голень", "Крыло", "Филе", "Спина", "Медальоны", "Для супа", "Фарш", "Другое"],
        "Гусь": ["Целая гусь", "Грудка", "Бедро", "Голень", "Крыло", "Спина", "Шея", "Печень", "Гусиный жир", "Фарш", "Для супа", "Другое"],
        "Утка": ["Целая утка", "Грудка", "Бедро", "Голень", "Крыло", "Спина", "Шея", "Утиный жир", "Печень", "Фарш", "Для супа", "Другое"],
        "Свинина": ["Вырезка", "Корейка", "Окорок", "Шея", "Лопатка", "Грудинка", "Ребра", "Рулька", "Подплечный край", "Фарш", "Для супа", "Другое"],
        "Баранина": ["Вырезка", "Корейка", "Окорок", "Шея", "Лопатка", "Грудинка", "Ребра", "Рулька", "Фарш", "Для супа", "Другое"],
        "Овца": ["Вырезка", "Корейка", "Окорок", "Шея", "Лопатка", "Грудинка", "Ребра", "Рулька", "Фарш", "Для супа", "Другое"],
        "Телятина": ["Вырезка", "Корейка", "Окорок", "Шея", "Лопатка", "Грудинка", "Ребра", "Рулька", "Фарш", "Для супа", "Другое"],
        "Говядина": ["Вырезка", "Стейк", "Окорок", "Шея", "Лопатка", "Грудинка", "Ребра", "Рулька", "Фарш", "Для супа", "Другое"],
        "Кролик": ["Задние лапы", "Передние лапы", "Спинка", "Ребра", "Для супа", "Другое"],
        "Перепел": ["Целая тушка", "Грудка", "Бедра", "Крылья", "Печень", "Другое"],
        "Фазан": ["Целая тушка", "Грудка", "Бедра", "Крылья", "Печень", "Другое"],
        "Куропатка": ["Целая тушка", "Грудка", "Бедра", "Крылья", "Печень", "Другое"],
        "Голубь": ["Целая тушка", "Грудка", "Бедра", "Крылья", "Печень", "Другое"],
        "Заяц": ["Задние лапы", "Передние лапы", "Спинка", "Ребра", "Другое"],
        "Дикая утка": ["Целая тушка", "Грудка", "Бедра", "Крылья", "Печень", "Другое"],
        "Дикий гусь": ["Целая тушка", "Грудка", "Бедра", "Крылья", "Печень", "Другое"],
        "Олень": ["Вырезка", "Корейка", "Окорок", "Шея", "Лопатка", "Грудинка", "Ребра", "Рулька", "Фарш", "Для супа", "Другое"],
        "Косуля": ["Вырезка", "Корейка", "Окорок", "Шея", "Лопатка", "Грудинка", "Ребра", "Рулька", "Фарш", "Для супа", "Другое"],
        "Кабан": ["Вырезка", "Корейка", "Окорок", "Шея", "Лопатка", "Грудинка", "Ребра", "Рулька", "Фарш", "Для супа", "Другое"],
        "Лось": ["Вырезка", "Корейка", "Окорок", "Шея", "Лопатка", "Грудинка", "Ребра", "Рулька", "Фарш", "Для супа", "Другое"],
        "Северный олень": ["Вырезка", "Корейка", "Окорок", "Шея", "Лопатка", "Грудинка", "Ребра", "Рулька", "Фарш", "Для супа", "Другое"],
        "Бизон": ["Вырезка", "Стейк", "Окорок", "Шея", "Лопатка", "Грудинка", "Ребра", "Рулька", "Фарш", "Для супа", "Другое"],
        "Верблюд": ["Вырезка", "Корейка", "Окорок", "Шея", "Лопатка", "Горб", "Ребра", "Фарш", "Для супа", "Другое"],
        "Лама": ["Вырезка", "Корейка", "Окорок", "Шея", "Лопатка", "Ребра", "Фарш", "Для супа", "Другое"],
        "Альпака": ["Вырезка", "Корейка", "Окорок", "Шея", "Лопатка", "Ребра", "Фарш", "Для супа", "Другое"],
        "Кенгуру": ["Вырезка", "Стейк", "Окорок", "Шея", "Лопатка", "Хвост", "Фарш", "Для супа", "Другое"],
        "Крокодил/Аллигатор": ["Хвост", "Филе", "Ноги", "Другое"],
        "Ящерица": ["Хвост", "Спина", "Ноги", "Другое"],
        "Змея": ["Кольца", "Другое"],
        "Морская": ["Филе", "Стейк", "Целая рыба", "Филе с кожей", "Филе без кожи", "Куски", "Для супа", "Другое"],
        "Пресноводная": ["Филе", "Стейк", "Целая рыба", "Филе с кожей", "Филе без кожи", "Куски", "Для супа", "Другое"],
        "Морепродукты": ["Креветки", "Кальмары", "Мидии", "Устрицы", "Гребешки", "Крабы", "Осьминоги", "Каракатицы", "Другое"],
        "Молоко": ["Цельное", "Обезжиренное", "Пастеризованное", "Стерилизованное", "Топленое", "Сгущенное", "Сухое", "Другое"],
        "Молочные переработки": ["Сыр", "Творог", "Сметана", "Йогурт", "Кефир", "Ряженка", "Сливочное масло", "Творожный сыр", "Другое"],
        "Свежие": ["Целые", "Нарезанные", "Вымытые", "Чищенные", "Натертые", "Другое"],
        "Термически обработанные": ["Вареные", "Тушеные", "Жареные", "Запеченные", "Приготовленные на пару", "Другое"],
        "Замороженные": ["Целые", "Нарезанные", "Смесь", "Пюре", "Другое"],
        "Фрукты": ["Целые", "Нарезанные", "Очищенные", "Без косточек", "Консервированные", "Сушеные", "Другое"],
        "Тесто": ["Дрожжевое", "Песочное", "Слоеное", "Блинное", "Для пиццы", "Для пасты", "Другое"],
        "Сладости": ["Шоколад", "Конфеты", "Печенье", "Торты", "Пирожные", "Мороженое", "Вафли", "Другое"],
        "Вода": ["Газированная", "Негазированная", "Минеральная", "Ароматизированная", "Другое"],
        "Вино": ["Красное", "Белое", "Розовое", "Игристое", "Сладкое", "Сухое", "Полусухое", "Другое"],
        "Сок": ["Яблочный", "Апельсиновый", "Виноградный", "Томатный", "Мультифрукт", "С мякотью", "Без мякоти", "Другое"],
        "Крепкие напитки": ["Водка", "Виски", "Коньяк", "Ром", "Джин", "Текила", "Ликер", "Другое"],
        "Пиво": ["Светлое", "Темное", "Пшеничное", "Крафтовое", "Безалкогольное", "Другое"],
        "Сантехника": ["Для ванной", "Для туалета", "Для раковины", "Универсальное", "Антибактериальное", "Другое"],
        "Личная гигиена": ["Мыло", "Шампунь", "Гель для душа", "Дезодорант", "Зубная паста", "Бритва", "Крем", "Другое"],
        "Оборудование": ["Ведро", "Швабра", "Тряпка", "Губка", "Щетка", "Перчатки", "Другое"],
        "Другое": ["Примечание: введите название продукта"]
    },
    zh: {
        "鸡": ["整鸡", "鸡胸", "鸡腿", "鸡翅", "鸡柳", "鸡背", "鸡块", "鸡米花", "炸鸡排", "鸡绞肉", "汤用", "其他"],
        "火鸡": ["整火鸡", "火鸡胸", "火鸡腿", "火鸡翅", "火鸡柳", "火鸡背", "火鸡块", "汤用", "火鸡绞肉", "其他"],
        "鹅": ["整鹅", "鹅胸", "鹅腿", "鹅翅", "鹅背", "鹅颈", "鹅肝", "鹅油", "鹅绞肉", "汤用", "其他"],
        "鸭": ["整鸭", "鸭胸", "鸭腿", "鸭翅", "鸭背", "鸭颈", "鸭油", "鸭肝", "鸭绞肉", "汤用", "其他"],
        "猪肉": ["里脊", "排骨", "猪腿", "猪颈", "猪肩", "猪胸", "猪肋", "猪蹄", "猪绞肉", "汤用", "其他"],
        "羊肉": ["里脊", "排骨", "羊腿", "羊颈", "羊肩", "羊胸", "羊肋", "羊蹄", "羊绞肉", "汤用", "其他"],
        "牛肉": ["里脊", "牛排", "牛腿", "牛颈", "牛肩", "牛胸", "牛肋", "牛蹄", "牛绞肉", "汤用", "其他"],
        "兔肉": ["后腿", "前腿", "兔背", "兔肋", "汤用", "其他"],
        "鹌鹑": ["整只", "鹌鹑胸", "鹌鹑腿", "鹌鹑翅", "鹌鹑肝", "其他"],
        "野鸡": ["整只", "野鸡胸", "野鸡腿", "野鸡翅", "野鸡肝", "其他"],
        "鹧鸪": ["整只", "鹧鸪胸", "鹧鸪腿", "鹧鸪翅", "鹧鸪肝", "其他"],
        "鸽子": ["整只", "鸽子胸", "鸽子腿", "鸽子翅", "鸽子肝", "其他"],
        "野兔": ["后腿", "前腿", "兔背", "兔肋", "其他"],
        "野鸭": ["整只", "野鸭胸", "野鸭腿", "野鸭翅", "野鸭肝", "其他"],
        "野鹅": ["整只", "野鹅胸", "野鹅腿", "野鹅翅", "野鹅肝", "其他"],
        "鹿": ["里脊", "鹿排", "鹿腿", "鹿颈", "鹿肩", "鹿胸", "鹿肋", "鹿蹄", "鹿绞肉", "汤用", "其他"],
        "狍子": ["里脊", "狍子排", "狍子腿", "狍子颈", "狍子肩", "狍子胸", "狍子肋", "狍子蹄", "狍子绞肉", "汤用", "其他"],
        "野猪": ["里脊", "野猪排", "野猪腿", "野猪颈", "野猪肩", "野猪胸", "野猪肋", "野猪蹄", "野猪绞肉", "汤用", "其他"],
        "驼鹿": ["里脊", "驼鹿排", "驼鹿腿", "驼鹿颈", "驼鹿肩", "驼鹿胸", "驼鹿肋", "驼鹿蹄", "驼鹿绞肉", "汤用", "其他"],
        "海鱼": ["鱼片", "鱼排", "整鱼", "带皮鱼片", "去皮鱼片", "鱼块", "汤用", "其他"],
        "淡水鱼": ["鱼片", "鱼排", "整鱼", "带皮鱼片", "去皮鱼片", "鱼块", "汤用", "其他"],
        "海鲜": ["虾", "鱿鱼", "蛤蜊", "牡蛎", "扇贝", "螃蟹", "章鱼", "墨鱼", "其他"],
        "牛奶": ["全脂", "脱脂", "巴氏杀菌", "灭菌", "煮沸", "炼乳", "奶粉", "其他"],
        "乳制品加工": ["奶酪", "干酪", "酸奶油", "酸奶", "开菲尔", "黄油", "奶油奶酪", "其他"],
        "新鲜": ["整颗", "切片", "洗净", "去皮", "擦丝", "其他"],
        "热处理": ["煮熟", "炖煮", "油炸", "烘烤", "蒸煮", "其他"],
        "冷冻": ["整颗", "切片", "混合", "泥状", "其他"],
        "水果": ["整颗", "切片", "去皮", "去核", "罐头", "干果", "其他"],
        "面团": ["酵母面团", "酥皮面团", "千层酥皮", "煎饼面糊", "披萨面团", "意大利面团", "其他"],
        "糖果": ["巧克力", "糖果", "饼干", "蛋糕", "糕点", "冰淇淋", "华夫饼", "其他"],
        "水": ["气泡水", "静水", "矿泉水", "调味水", "其他"],
        "酒": ["红酒", "白酒", "桃红", "起泡酒", "甜酒", "干酒", "半干", "其他"],
        "果汁": ["苹果汁", "橙汁", "葡萄汁", "番茄汁", "混合果汁", "带果肉", "无果肉", "其他"],
        "烈酒": ["伏特加", "威士忌", "干邑", "朗姆酒", "金酒", "龙舌兰", "利口酒", "其他"],
        "啤酒": ["淡啤", "黑啤", "小麦啤", "精酿", "无酒精", "其他"],
        "卫生": ["浴室用", "厕所用", "洗手池用", "通用", "抗菌", "其他"],
        "个人卫生": ["肥皂", "洗发水", "沐浴露", "除臭剂", "牙膏", "剃须刀", "面霜", "其他"],
        "设备": ["桶", "拖把", "布", "海绵", "刷子", "手套", "其他"],
        "其他": ["注：输入产品名称"]
    },
    es: {
        "Pollo": ["Pollo entero", "Pechuga", "Muslo", "Ala", "Filete", "Espalda", "Medallones", "Nuggets", "Milanesa", "Carne molida", "Para sopa", "Otro"],
        "Pavo": ["Pavo entero", "Pechuga", "Muslo", "Ala", "Filete", "Espalda", "Medallones", "Para sopa", "Carne molida", "Otro"],
        "Ganso": ["Ganso entero", "Pechuga", "Muslo", "Ala", "Espalda", "Cuello", "Hígado", "Grasa de ganso", "Carne molida", "Para sopa", "Otro"],
        "Pato": ["Pato entero", "Pechuga", "Muslo", "Ala", "Espalda", "Cuello", "Grasa de pato", "Hígado", "Carne molida", "Para sopa", "Otro"],
        "Cerdo": ["Lomo", "Chuleta", "Pierna", "Cuello", "Paleta", "Pecho", "Costilla", "Codillo", "Jamón", "Carne molida", "Para sopa", "Otro"],
        "Cordero": ["Lomo", "Chuleta", "Pierna", "Cuello", "Paleta", "Pecho", "Costilla", "Codillo", "Carne molida", "Para sopa", "Otro"],
        "Res": ["Lomo", "Bistec", "Pierna", "Cuello", "Paleta", "Pecho", "Costilla", "Codillo", "Carne molida", "Para sopa", "Otro"],
        "Ternera": ["Lomo", "Chuleta", "Pierna", "Cuello", "Paleta", "Pecho", "Costilla", "Codillo", "Carne molida", "Para sopa", "Otro"],
        "Conejo": ["Patas traseras", "Patas delanteras", "Lomo", "Costillas", "Para sopa", "Otro"],
        "Codorniz": ["Entera", "Pechuga", "Muslos", "Alas", "Hígado", "Otro"],
        "Faisán": ["Entera", "Pechuga", "Muslos", "Alas", "Hígado", "Otro"],
        "Perdiz": ["Entera", "Pechuga", "Muslos", "Alas", "Hígado", "Otro"],
        "Paloma": ["Entera", "Pechuga", "Muslos", "Alas", "Hígado", "Otro"],
        "Liebre": ["Patas traseras", "Patas delanteras", "Lomo", "Costillas", "Otro"],
        "Pato salvaje": ["Entera", "Pechuga", "Muslos", "Alas", "Hígado", "Otro"],
        "Ganso salvaje": ["Entera", "Pechuga", "Muslos", "Alas", "Hígado", "Otro"],
        "Ciervo": ["Lomo", "Chuleta", "Pierna", "Cuello", "Paleta", "Pecho", "Costilla", "Codillo", "Carne molida", "Para sopa", "Otro"],
        "Corzo": ["Lomo", "Chuleta", "Pierna", "Cuello", "Paleta", "Pecho", "Costilla", "Codillo", "Carne molida", "Para sopa", "Otro"],
        "Jabalí": ["Lomo", "Chuleta", "Pierna", "Cuello", "Paleta", "Pecho", "Costilla", "Codillo", "Carne molida", "Para sopa", "Otro"],
        "Alce": ["Lomo", "Chuleta", "Pierna", "Cuello", "Paleta", "Pecho", "Costilla", "Codillo", "Carne molida", "Para sopa", "Otro"],
        "Mar": ["Filete", "Filete con piel", "Filete sin piel", "Entero", "Trozos", "Para sopa", "Otro"],
        "Agua dulce": ["Filete", "Filete con piel", "Filete sin piel", "Entero", "Trozos", "Para sopa", "Otro"],
        "Mariscos": ["Camarones", "Calamar", "Mejillones", "Ostras", "Vieiras", "Cangrejos", "Pulpo", "Sepia", "Otro"],
        "Leche": ["Entera", "Descremada", "Pasteurizada", "Esterilizada", "Hervida", "Condensada", "En polvo", "Otro"],
        "Procesamiento lácteo": ["Queso", "Requesón", "Crema agria", "Yogur", "Kéfir", "Mantequilla", "Queso crema", "Otro"],
        "Frescas": ["Enteras", "Cortadas", "Lavadas", "Peladas", "Ralladas", "Otro"],
        "Tratadas térmicamente": ["Cocidas", "Estofadas", "Fritas", "Horneadas", "Al vapor", "Otro"],
        "Congeladas": ["Enteras", "Cortadas", "Mezcla", "Puré", "Otro"],
        "Frutas": ["Enteras", "Cortadas", "Peladas", "Sin semillas", "Enlatadas", "Secas", "Otro"],
        "Masa": ["Levadura", "Quebrada", "Hojaldre", "Para panqueques", "Para pizza", "Para pasta", "Otro"],
        "Dulces": ["Chocolate", "Caramelos", "Galletas", "Pasteles", "Tortas", "Helado", "Wafles", "Otro"],
        "Agua": ["Con gas", "Sin gas", "Mineral", "Saborizada", "Otro"],
        "Vino": ["Tinto", "Blanco", "Rosado", "Espumoso", "Dulce", "Seco", "Semiseco", "Otro"],
        "Jugo": ["Manzana", "Naranja", "Uva", "Tomate", "Multifruta", "Con pulpa", "Sin pulpa", "Otro"],
        "Licores": ["Vodka", "Whisky", "Coñac", "Ron", "Ginebra", "Tequila", "Licor", "Otro"],
        "Cerveza": ["Clara", "Oscura", "Trigo", "Artesanal", "Sin alcohol", "Otro"],
        "Sanitario": ["Para baño", "Para inodoro", "Para lavabo", "Universal", "Antibacterial", "Otro"],
        "Higiene personal": ["Jabón", "Champú", "Gel de baño", "Desodorante", "Pasta dental", "Maquinilla", "Crema", "Otro"],
        "Equipo": ["Cubo", "Trapeador", "Paño", "Esponja", "Cepillo", "Guantes", "Otro"],
        "Otro": ["Nota: Ingrese el nombre del producto"]
    },
    pt: {
        "Frango": ["Frango grelhado", "Frango inteiro", "Coxa inteira", "Sobrecoxa", "Coxinha", "Peito", "Filé", "Costas", "Asas", "Medalhões", "Nuggets", "Bife empanado", "Moído", "Para sopa", "Outro"],
        "Peru": ["Coxa inteira", "Sobrecoxa", "Coxinha", "Coxa enrolada", "Bifes de coxa", "Peito", "Asas", "Costas", "Pontas de asa", "Para sopa", "Moído", "Outro"],
        "Ganso": ["Peito", "Sobrecoxa", "Coxinha", "Asas", "Costas", "Pescoço", "Fígado (foie gras)", "Banha de ganso", "Moído", "Para sopa", "Outro"],
        "Pato": ["Peito", "Sobrecoxa", "Coxinha", "Asas", "Costas", "Pescoço", "Banha de pato", "Moído", "Fígado", "Para sopa", "Outro"],
        "Porco": ["Bife", "Costeleta", "Pescoço", "Pernil", "Lombo", "Costelas", "Barriga", "Paleta", "Espádua", "Jarret", "Moído", "Picado", "Para sopa", "Outro"],
        "Cordeiro": ["Cabeça", "Pescoço", "Paleta", "Lombo", "Peito", "Rim", "Pernil", "Jarret", "Outro"],
        "Boi": ["Bife", "Pescoço", "Peito", "Paleta", "Jarret", "Costelas", "Fralda", "T-bone", "Alcatra", "Rib-eye", "Rabo", "Outro"],
        "Coelho": ["Perna traseira", "Perna dianteira", "Filé do lombo", "Costelas", "Outro"],
        "Codorna": ["Carne inteira", "Peito (filés)", "Coxas", "Fígado", "Outro"],
        "Faisão": ["Carne inteira", "Peito (filés)", "Coxas", "Fígado", "Outro"],
        "Perdiz": ["Carne inteira", "Peito (filés)", "Coxas", "Fígado", "Outro"],
        "Pato selvagem": ["Carne inteira", "Peito (filés)", "Coxas", "Fígado", "Outro"],
        "Ganso selvagem": ["Carne inteira", "Peito (filés)", "Coxas", "Fígado", "Outro"],
        "Lebre": ["Perna traseira", "Perna dianteira", "Filé do lombo", "Costelas", "Outro"],
        "Pombo": ["Carne inteira", "Peito (filés)", "Coxas", "Fígado", "Outro"],
        "Cervo": ["Perna", "Filé (lombo)", "Bife", "Costelas", "Peito", "Paleta", "Jarrete", "Picado", "Outro"],
        "Corça": ["Perna", "Filé (lombo)", "Bife", "Costelas", "Peito", "Paleta", "Jarrete", "Picado", "Outro"],
        "Cabra selvagem": ["Perna", "Filé (lombo)", "Bife", "Costelas", "Peito", "Paleta", "Jarrete", "Picado", "Outro"],
        "Alce": ["Perna", "Filé (lombo)", "Bife", "Costelas", "Peito", "Paleta", "Jarrete", "Picado", "Outro"],
        "Rena": ["Perna", "Filé (lombo)", "Bife", "Costelas", "Peito", "Paleta", "Jarrete", "Picado", "Outro"],
        "Javali": ["Perna", "Paleta", "Costelas", "Bacon", "Jarrete", "Pescoço", "Cabeça", "Outro"],
        "Bisão": ["Perna", "Paleta", "Bife", "Alcatra", "Costelas", "Lombo", "Pescoço", "Jarrete", "Outro"],
        "Camelo": ["Perna", "Paleta", "Filé (lombo)", "Filé (dorso)", "Costelas", "Peito", "Pescoço", "Corcova", "Outro"],
        "Lhama": ["Perna", "Paleta", "Filé (dorso e lombo)", "Costelas", "Pescoço", "Outro"],
        "Alpaca": ["Perna", "Paleta", "Filé (dorso e lombo)", "Costelas", "Pescoço", "Outro"],
        "Canguru": ["Perna", "Paleta", "Filé (dorso e lombo)", "Costelas", "Rabo", "Outro"],
        "Crocodilo/Jacaré": ["Rabo", "Filé (dorso)", "Coxas", "Outro"],
        "Lagarto": ["Rabo", "Dorso", "Coxas", "Outro"],
        "Cobra": ["Tronco (anéis)", "Outro"],
        "Mar": ["Salmão", "Atum", "Sardinha", "Bacalhau", "Pescada", "Cavala", "Robalo", "Dourada", "Linguado", "Arenque", "Anchova", "Outro"],
        "Água doce": ["Carpa", "Truta", "Bagre", "Percha", "Sander", "Tilápia", "Panga", "Esturjão", "Lúcio", "Carpa capim", "Pirarucu", "Outro"],
        "Frutos do mar": ["Camarão", "Lula", "Vieiras", "Amêijoas", "Mexilhões", "Ostras", "Caranguejo", "Polvo", "Ouriço", "Pepino do mar", "Abalone", "Outro"],
        "Leite": ["Leite", "Kefir", "Creme azedo", "Creme", "Creme de cozinha", "Outro"],
        "Processamento de leite": ["Queijo fresco", "Queijo jovem", "Queijo cremoso", "Gouda", "Edam", "Trappista", "Kashkaval", "Parmesão", "Gorgonzola", "Roquefort", "Halloumi", "Outro"],
        "Fresco": ["Ervilhas", "Feijão verde", "Couve-flor", "Brócolis", "Abóbora", "Tomate", "Pepino", "Pimentão", "Outro"],
        "Tratado termicamente": ["Ervilhas", "Feijão verde", "Milho", "Couve-flor", "Brócolis", "Pimentão", "Abobrinha", "Espinafre", "Outro"],
        "Congelado": ["Ervilhas", "Feijão verde", "Milho", "Couve-flor", "Brócolis", "Pimentão", "Abobrinha", "Espinafre", "Outro"],
        "Frutas": ["Damasco", "Pera", "Cereja", "Geleia de morango", "Geleia de ameixa", "Cereja doce", "Geleia de framboesa", "Marmelo", "Abacaxi", "Geleia de manga", "Outro"],
        "Vegetais": ["Picles", "Pimentão em conserva", "Purê de tomate", "Beterraba", "Ajvar", "Conservas", "Chucrute", "Outro"],
        "Massa": ["Pão", "Pão de centeio", "Ciabatta", "Pão de milho", "Baguete", "Farinha de trigo", "Farinha integral", "Farinha de trigo sarraceno", "Farinha de arroz", "Temperos", "Outro"],
        "Doces": ["Bolos", "Tortas", "Padaria", "Sorvete", "Chocolate", "Doces", "Outro"],
        "Água": ["Mineral", "Sem gás", "Com gás", "Outro"],
        "Vinho": ["Tinto", "Branco", "Rosé", "Outro"],
        "Suco": ["Fruta", "Vegetal", "Outro"],
        "Bebidas destiladas": ["Conhaque", "Vodka", "Uísque", "Outro"],
        "Cerveja": ["Escura", "Clara", "Outro"],
        "Sanitário": ["Limpa-vidros", "Detergente", "Limpa-pisos", "Limpa-banheiro", "Outro"],
        "Higiene pessoal": ["Desodorante", "Lâmina", "Maquiagem", "Sabão", "Xampu", "Creme", "Outro"],
        "Equipamento": ["Balde", "Pano", "Espanador", "Vassoura", "Outro"],
        "Outro": ["Nota: Digite o nome do produto"]
    },
    fr: {
        "Poulet": ["Poulet entier", "Poitrine", "Cuisse", "Aile", "Filet", "Dos", "Médaillons", "Nuggets", "Escalope panée", "Viande hachée", "Pour soupe", "Autre"],
        "Dinde": ["Dinde entière", "Poitrine", "Cuisse", "Aile", "Filet", "Dos", "Médaillons", "Pour soupe", "Viande hachée", "Autre"],
        "Oie": ["Oie entière", "Poitrine", "Cuisse", "Aile", "Dos", "Cou", "Foie", "Graisse d'oie", "Viande hachée", "Pour soupe", "Autre"],
        "Canard": ["Canard entier", "Magret", "Cuisse", "Aile", "Dos", "Cou", "Graisse de canard", "Foie", "Viande hachée", "Pour soupe", "Autre"],
        "Porc": ["Filet", "Côtelette", "Jambon", "Échine", "Épaule", "Poitrine", "Côtes", "Jarret", "Viande hachée", "Pour soupe", "Autre"],
        "Agneau": ["Filet", "Côtelette", "Gigot", "Collet", "Épaule", "Poitrine", "Côtes", "Souris", "Viande hachée", "Pour soupe", "Autre"],
        "Bœuf": ["Filet", "Entrecôte", "Rumsteck", "Collier", "Paleron", "Poitrine", "Côtes", "Jarret", "Viande hachée", "Pour soupe", "Autre"],
        "Veau": ["Filet", "Côtelette", "Rognonnade", "Collet", "Épaule", "Poitrine", "Côtes", "Osso buco", "Viande hachée", "Pour soupe", "Autre"],
        "Lapin": ["Cuisses arrière", "Cuisses avant", "Râble", "Côtes", "Pour soupe", "Autre"],
        "Caille": ["Entière", "Poitrine", "Cuisses", "Ailes", "Foie", "Autre"],
        "Faisan": ["Entier", "Poitrine", "Cuisses", "Ailes", "Foie", "Autre"],
        "Perdrix": ["Entière", "Poitrine", "Cuisses", "Ailes", "Foie", "Autre"],
        "Pigeon": ["Entier", "Poitrine", "Cuisses", "Ailes", "Foie", "Autre"],
        "Lièvre": ["Cuisses arrière", "Cuisses avant", "Râble", "Côtes", "Autre"],
        "Canard sauvage": ["Entier", "Poitrine", "Cuisses", "Ailes", "Foie", "Autre"],
        "Oie sauvage": ["Entière", "Poitrine", "Cuisses", "Ailes", "Foie", "Autre"],
        "Cerf": ["Filet", "Côtelette", "Cuissot", "Collet", "Épaule", "Poitrine", "Côtes", "Jarret", "Viande hachée", "Pour soupe", "Autre"],
        "Chevreuil": ["Filet", "Côtelette", "Cuissot", "Collet", "Épaule", "Poitrine", "Côtes", "Jarret", "Viande hachée", "Pour soupe", "Autre"],
        "Sanglier": ["Filet", "Côtelette", "Cuissot", "Collet", "Épaule", "Poitrine", "Côtes", "Jarret", "Viande hachée", "Pour soupe", "Autre"],
        "Élan": ["Filet", "Côtelette", "Cuissot", "Collet", "Épaule", "Poitrine", "Côtes", "Jarret", "Viande hachée", "Pour soupe", "Autre"],
        "Renne": ["Filet", "Côtelette", "Cuissot", "Collet", "Épaule", "Poitrine", "Côtes", "Jarret", "Viande hachée", "Pour soupe", "Autre"],
        "Bison": ["Filet", "Entrecôte", "Cuissot", "Collet", "Épaule", "Poitrine", "Côtes", "Jarret", "Viande hachée", "Pour soupe", "Autre"],
        "Chameau": ["Filet", "Côtelette", "Cuissot", "Collet", "Épaule", "Bosse", "Côtes", "Viande hachée", "Pour soupe", "Autre"],
        "Lama": ["Filet", "Côtelette", "Cuissot", "Collet", "Épaule", "Côtes", "Viande hachée", "Pour soupe", "Autre"],
        "Alpaga": ["Filet", "Côtelette", "Cuissot", "Collet", "Épaule", "Côtes", "Viande hachée", "Pour soupe", "Autre"],
        "Kangourou": ["Filet", "Steak", "Cuissot", "Collet", "Épaule", "Queue", "Viande hachée", "Pour soupe", "Autre"],
        "Crocodile/Alligator": ["Queue", "Filet", "Cuisses", "Autre"],
        "Lézard": ["Queue", "Dos", "Cuisses", "Autre"],
        "Serpent": ["Anneaux", "Autre"],
        "Mer": ["Filet", "Darnes", "Poisson entier", "Filet avec peau", "Filet sans peau", "Morceaux", "Pour soupe", "Autre"],
        "Eau douce": ["Filet", "Darnes", "Poisson entier", "Filet avec peau", "Filet sans peau", "Morceaux", "Pour soupe", "Autre"],
        "Fruits de mer": ["Crevettes", "Calmar", "Moules", "Huîtres", "Coquilles Saint-Jacques", "Crabes", "Poulpe", "Seiche", "Autre"],
        "Lait": ["Entier", "Écrémé", "Pasteurisé", "Stérilisé", "Bouilli", "Condensé", "En poudre", "Autre"],
        "Transformation laitière": ["Fromage", "Fromage blanc", "Crème fraîche", "Yaourt", "Kéfir", "Beurre", "Fromage à tartiner", "Autre"],
        "Frais": ["Entiers", "Coupés", "Lavés", "Pelés", "Râpés", "Autre"],
        "Traité thermiquement": ["Cuits", "Étuvés", "Frits", "Rôtis", "Vapeur", "Autre"],
        "Congelé": ["Entiers", "Coupés", "Mélange", "Purée", "Autre"],
        "Fruits": ["Entiers", "Tranchés", "Pelés", "Sans pépins", "En conserve", "Séchés", "Autre"],
        "Pâte": ["Pâte à levure", "Pâte brisée", "Pâte feuilletée", "Pâte à crêpes", "Pâte à pizza", "Pâte à pâtes", "Autre"],
        "Sucreries": ["Chocolat", "Bonbons", "Biscuits", "Gâteaux", "Pâtisseries", "Glace", "Gaufres", "Autre"],
        "Eau": ["Pétillante", "Plate", "Minérale", "Aromatisée", "Autre"],
        "Vin": ["Rouge", "Blanc", "Rosé", "Mousseux", "Doux", "Sec", "Demi-sec", "Autre"],
        "Jus": ["Pomme", "Orange", "Raisin", "Tomate", "Multifruits", "Avec pulpe", "Sans pulpe", "Autre"],
        "Spiritueux": ["Vodka", "Whisky", "Cognac", "Rhum", "Gin", "Tequila", "Liqueur", "Autre"],
        "Bière": ["Blonde", "Brune", "Blanche", "Artisanale", "Sans alcool", "Autre"],
        "Sanitaire": ["Pour salle de bain", "Pour toilettes", "Pour lavabo", "Universel", "Antibactérien", "Autre"],
        "Hygiène personnelle": ["Savon", "Shampooing", "Gel douche", "Déodorant", "Dentifrice", "Rasoir", "Crème", "Autre"],
        "Équipement": ["Seau", "Balai", "Chiffon", "Éponge", "Brosse", "Gants", "Autre"],
        "Autre": ["Note : Saisir le nom du produit"]
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
    const sub = subcategories[currentLang] || subcategories.sr || {};
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

    const langSubs = subcategories[currentLang] || subcategories.sr || {};
    const subData = langSubs[category] || [];
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
            const hasParts = typeof productParts !== 'undefined' && ((productParts[currentLang] && productParts[currentLang][item]) || (productParts.sr && productParts.sr[item]));
            
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
    const sub = subcategories[currentLang] || subcategories.sr || {};
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
            const hasParts = typeof productParts !== 'undefined' && ((productParts[currentLang] && productParts[currentLang][item]) || (productParts.sr && productParts.sr[item]));
            
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
            if (isOtherButton(part)) {
                html += `<button class="category-btn" style="background:${color};" onclick="renderDataEntry('')">${part} ➜</button>`;
            } else {
                html += `<button class="category-btn" style="background:${color};" onclick="renderDataEntry('${safePart}')">${part}</button>`;
            }
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
        id: Date.now(),
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
    renderUpdateEntry(zalihe[index], index);
}

function renderUpdateEntry(proizvod, index) {
    currentScreenState = 'dataEntry';
    const content = document.getElementById('mainContent');
    if (!content) return;
    const today = proizvod.entry_date || new Date().toISOString().split('T')[0];
    
    content.innerHTML = `
        <div class="title">✏️ Ažuriraj - ${proizvod.product_name}</div>
        <div class="row"><label>${t('naziv_proizvoda')}</label><input type="text" id="updateProductInput" value="${proizvod.product_name || ''}"></div>
        <div class="row"><label>${t('opis')}</label><input type="text" id="updateDescriptionInput" value="${proizvod.description || ''}"></div>
        <div class="row">
            <label>${t('komad')}</label>
            <div class="inline-group">
                <input type="text" id="updatePieceInput" value="${proizvod.piece || ''}">
                <label>${t('kolicina')}</label>
                <input type="number" id="updateQuantityInput" value="${proizvod.quantity || 1}" step="0.1">
                <label>${t('jedinica_mere')}</label>
                <select id="updateUnitSelect">
                    <option value="kg" ${proizvod.unit === 'kg' ? 'selected' : ''}>${t('kg')}</option>
                    <option value="g" ${proizvod.unit === 'g' ? 'selected' : ''}>${t('g')}</option>
                    <option value="kom" ${proizvod.unit === 'kom' ? 'selected' : ''}>${t('kom')}</option>
                    <option value="l" ${proizvod.unit === 'l' ? 'selected' : ''}>${t('l')}</option>
                    <option value="ml" ${proizvod.unit === 'ml' ? 'selected' : ''}>${t('ml')}</option>
                    <option value="pak" ${proizvod.unit === 'pak' ? 'selected' : ''}>${t('pak')}</option>
                    <option value="kutija" ${proizvod.unit === 'kutija' ? 'selected' : ''}>${t('kutija')}</option>
                </select>
            </div>
        </div>
        <div class="row">
            <label>${t('datum_unosa')}</label>
            <div class="inline-group">
                <input type="date" id="updateDateInput" value="${today}">
                <label>${t('rok_trajanja')}</label>
                <input type="number" id="updateShelfLifeInput" value="${proizvod.shelf_life_months || 12}">
                <span style="font-size:18px;">mes</span>
            </div>
        </div>
        <div class="row">
            <label>${t('automatski_rok')}</label>
            <div class="inline-group"><span id="updateExpiryDisplay">-</span></div>
        </div>
        <div class="row">
            <label>${t('mesto_skladistenja')}</label>
            <select id="updateStorageSelect">
                <option value="${t('zamrzivac_1')}" ${proizvod.storage_location === t('zamrzivac_1') ? 'selected' : ''}>❄️ ${t('zamrzivac_1')}</option>
                <option value="${t('zamrzivac_2')}" ${proizvod.storage_location === t('zamrzivac_2') ? 'selected' : ''}>❄️ ${t('zamrzivac_2')}</option>
                <option value="${t('zamrzivac_3')}" ${proizvod.storage_location === t('zamrzivac_3') ? 'selected' : ''}>❄️ ${t('zamrzivac_3')}</option>
                <option value="${t('frizider')}" ${proizvod.storage_location === t('frizider') ? 'selected' : ''}>🧊 ${t('frizider')}</option>
                <option value="${t('ostava')}" ${proizvod.storage_location === t('ostava') ? 'selected' : ''}>🏠 ${t('ostava')}</option>
                <option value="${t('Ostalo')}" ${proizvod.storage_location === t('Ostalo') ? 'selected' : ''}>📦 ${t('Ostalo')}</option>
            </select>
        </div>
        <div class="btn-group">
            <button class="btn-save" onclick="sacuvajAzuriranje(${index})">✅ Sačuvaj</button>
            <button class="btn-cancel" onclick="renderInventory()">✖ Odustani</button>
        </div>
    `;
    document.getElementById('updateDateInput')?.addEventListener('change', updateUpdateExpiryDate);
    document.getElementById('updateDateInput')?.addEventListener('input', updateUpdateExpiryDate);
    document.getElementById('updateShelfLifeInput')?.addEventListener('change', updateUpdateExpiryDate);
    document.getElementById('updateShelfLifeInput')?.addEventListener('input', updateUpdateExpiryDate);
    updateUpdateExpiryDate();
}

function updateUpdateExpiryDate() {
    const dateInput = document.getElementById('updateDateInput');
    const shelfLifeInput = document.getElementById('updateShelfLifeInput');
    const expiryDisplay = document.getElementById('updateExpiryDisplay');
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

function sacuvajAzuriranje(index) {
    const product = document.getElementById('updateProductInput')?.value.trim();
    const quantity = document.getElementById('updateQuantityInput')?.value.trim();
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
        description: document.getElementById('updateDescriptionInput')?.value.trim() || '',
        piece: document.getElementById('updatePieceInput')?.value.trim() || '-',
        quantity: parseFloat(quantity),
        unit: document.getElementById('updateUnitSelect')?.value || 'kg',
        entry_date: document.getElementById('updateDateInput')?.value || new Date().toISOString().split('T')[0],
        shelf_life_months: parseInt(document.getElementById('updateShelfLifeInput')?.value) || 12,
        storage_location: document.getElementById('updateStorageSelect')?.value || 'Ostalo'
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

console.log('✅ Kraj fajla');
