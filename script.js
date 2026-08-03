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

// ===== MODERNI ALERT (Ispravljeno sa automatskim kreiranjem HTML-a ako nedostaje) =====
function showModernAlert(title, message, icon = '📢') {
    const alertDiv = document.getElementById('modernAlert');
    if (!alertDiv) return; // Ako iz nekog razloga ne postoji, izadji

    const iconEl = document.getElementById('alertIcon');
    const titleEl = document.getElementById('alertTitle');
    const messageEl = document.getElementById('alertMessage');

    if (iconEl) iconEl.textContent = icon;
    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;

    alertDiv.style.display = 'flex';
    alertDiv.classList.add('active');

    // Automatsko zatvaranje nakon 4 sekunde
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
        exit_poruka: "Köszönjük a használatot! 👋",
        oznaci_sve: "Mindet kijelöl", kopiraj: "Másolás", obrisi_oznaceno: "Kijelöltek törlése",
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
        exit_poruka: "¡Gracias por usar! 👋",
        oznaci_sve: "Seleccionar todo", kopiraj: "Copiar", obrisi_oznaceno: "Eliminar seleccionados",
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

// ===== 5. PODKATEGORIJE (Fallback definicija da ne pukne ako fali spoljni fajl) =====
if (typeof subcategories === 'undefined') {
    var subcategories = {
        sr: {
        "Belo meso": ["Pileće", "Ćureće", "Guska", "Patka", "Ostalo"],
        "Crveno meso": ["Svinjsko", "Jagnjeće", "Ovčije", "Juneće", "Govedina", "Od bika", "Konjsko", "Zečije", "Ostalo"],
        "Sitna divljač": ["Prepelica", "Fazan", "Jarebica", "Divlja patka", "Divlja guska", "Divlji zec", "Golub", "Ostalo"],
        "Krupna divljač": ["Jelen", "Srna", "Divokoza", "Los", "Irvas", "Divlja svinja", "Bizon", "Kamila", "Lama", "Alpaka", "Kengur", "Krokodil/Aligator", "Gušter", "Zmija", "Ostalo"],
        "Riba": ["Morska", "Slatkovodna", "Plodovi mora", "Ostalo"],
        "Mlečni proizvodi": {
            "Mleko": ["Kravlje", "Kozje", "Ovčije", "Bademovo", "Sojino", "Ostalo"],
            "Jogurt i kiselo mleko": ["Jogurt", "Kiselo mleko", "Ostalo"],
            "Pavlaka": ["Pavlaka", "Kisela pavlaka", "Ostalo"],
            "Mladi sir": ["Mladi sir", "Ostalo"],
            "Tvrdi sir": ["Tvrdi sir", "Ostalo"],
            "Kozji i ovčiji sir": ["Kozji sir", "Ovčiji sir", "Ostalo"],
            "Kajmak i puter": ["Kajmak", "Puter", "Ostalo"],
            "Ostalo": ["Ostalo"]
        },
        "Povrće": ["Sveže", "Termički obrađeno", "Zamrznuto", "Ostalo"],
        "Zimnica i kompoti": {
            "Voće": ["Kajsija", "Kruška", "Višnja", "Pekmez od jagoda", "Šljivov pekmez", "Trešnja", "Pekmez od malina", "Dunja", "Ananas", "Pekmez od manga", "Ostalo"],
            "Povrće": ["Kiseli krastavci", "Kisela paprika", "Paradajz pire", "Cvekla", "Ajvar", "Turšija", "Kiseli kupus", "Ostalo"]
        },
        "Testo i Slatkiši": {
            "Testo": ["Hleb", "Raženi hleb", "Čabata", "Kukuruzni hleb", "Baguette", "Pšenično brašno", "Integralno brašno", "Heljdino brašno", "Pirinčano brašno", "Začini", "Ostalo"],
            "Slatkiši": ["Kolači", "Torte", "Peciva", "Sladoled", "Čokolada", "Bombone", "Ostalo"]
        },
        "Pića": {
            "Voda": ["Mineralna", "Negazirana", "Gazirana", "Ostalo"],
            "Vino": ["Crno", "Belo", "Roze", "Ostalo"],
            "Sok": ["Voćni", "Povrtni", "Ostalo"],
            "Žestoka pića": ["Rakija", "Votka", "Viski", "Ostalo"],
            "Pivo": ["Tamno", "Svetlo", "Ostalo"]
        },
        "Hemija i higijena": {
            "Sanitar": ["Pranje prozora", "Pranje posuđa", "Pranje podova", "Sredstvo za kupatilo", "Ostalo"],
            "Lična higijena": ["Dezodorans", "Brijač", "Šminka", "Sapun", "Šampon", "Krema", "Ostalo"],
            "Pribor": ["Kantica", "Kofa", "Krpa za prašinu", "Metla", "Ostalo"]
        },
        "Ostalo": ["Ostalo"]
    },
    hu: {
        "Fehér hús": ["Csirke", "Pulyka", "Libacomb", "Kacsa", "Egyéb"],
        "Vörös hús": ["Sertés", "Bárány", "Birka", "Borjú", "Marha", "Bika", "Ló", "Nyúl", "Egyéb"],
        "Apróvad": ["Fürj", "Fácán", "Fogoly", "Vadkacsa", "Vadliba", "Mezei nyúl", "Galamb", "Egyéb"],
        "Nagyvad": ["Szarvas", "Őz", "Vadkecske", "Jávorszarvas", "Rénszarvas", "Vaddisznó", "Bölény", "Teve", "Láma", "Alpaka", "Kenguru", "Krokodil/Alligátor", "Gyík", "Kígyó", "Egyéb"],
        "Hal": ["Tengeri", "Édesvízi", "Tenger gyümölcsei", "Egyéb"],
        "Tejtermékek": {
            "Tej": ["Tehéntej", "Kecsketej", "Juhtej", "Mandulatej", "Szójatej", "Egyéb"],
            "Joghurt és aludttej": ["Joghurt", "Aludttej", "Egyéb"],
            "Tejföl": ["Tejföl", "Egyéb"],
            "Friss sajt": ["Friss sajt", "Egyéb"],
            "Kemény sajt": ["Kemény sajt", "Egyéb"],
            "Kecske- és juhtúró": ["Kecskesajt", "Juhsajt", "Egyéb"],
            "Tejföl és vaj": ["Tejföl", "Vaj", "Egyéb"],
            "Egyéb": ["Egyéb"]
        },
        "Zöldség": ["Friss", "Hőkezelt", "Fagyasztott", "Egyéb"],
        "Befőttek és kompótok": {
            "Gyümölcs": ["Kajszibarack", "Körte", "Meggy", "Eperlekvár", "Szilvalevar", "Cseresznye", "Málnalevar", "Birs", "Ananász", "Mangólekvár", "Egyéb"],
            "Zöldség": ["Savanyú uborka", "Savanyú paprika", "Paradicsompüré", "Cékla", "Ajvár", "Savanyúság", "Savanyú káposzta", "Egyéb"]
        },
        "Tészta és Édességek": {
            "Tészta": ["Kenyér", "Rozskenyér", "Ciabatta", "Kukoricakenyér", "Baguette", "Búzaliszt", "Teljes kiőrlésű liszt", "Hajdinaliszt", "Rizsliszt", "Fűszerek", "Egyéb"],
            "Édességek": ["Sütemények", "Torták", "Péksütemények", "Fagylalt", "Csokoládé", "Cukorkák", "Egyéb"]
        },
        "Italok": {
            "Víz": ["Ásványvíz", "Szénsavmentes", "Szénsavas", "Egyéb"],
            "Bor": ["Vörös", "Fehér", "Rosé", "Egyéb"],
            "Lé": ["Gyümölcslé", "Zöldséglé", "Egyéb"],
            "Tömény italok": ["Pálinka", "Vodka", "Whisky", "Egyéb"],
            "Sör": ["Barna", "Világos", "Egyéb"]
        },
        "Kémia és higiénia": {
            "Tisztítószerek": ["Ablaktisztítás", "Mosogatás", "Padlótisztítás", "Fürdőszobai tisztítószer", "Egyéb"],
            "Személyes higiénia": ["Dezodor", "Borotva", "Smink", "Szappan", "Sampon", "Krém", "Egyéb"],
            "Eszközök": ["Kis vödör", "Vödör", "Portörlő rongy", "Seprű", "Egyéb"]
        },
        "Egyéb": ["Egyéb"]
    },
    uk: {
        "Біле м'ясо": ["Курятина", "Індичка", "Гуска", "Качка", "Інше"],
        "Червоне м'ясо": ["Свинина", "Ягнятина", "Баранина", "Телятина", "Яловичина", "Бичатина", "Конина", "Кролик", "Інше"],
        "Дрібна дичина": ["Перепілка", "Фазан", "Куріпка", "Дика качка", "Дика гуска", "Заєць", "Голуб", "Інше"],
        "Велика дичина": ["Олень", "Косуля", "Козуль", "Лось", "Північний олень", "Дикий кабан", "Бізон", "Верблюд", "Лама", "Альпака", "Кенгуру", "Крокодил/Алігатор", "Ящірка", "Змія", "Інше"],
        "Риба": ["Морська", "Прісноводна", "Морепродукти", "Інше"],
        "Молочні продукти": {
            "Молоко": ["Коров'яче", "Козяче", "Овече", "Мигдалеве", "Соєве", "Інше"],
            "Йогурт та кисляк": ["Йогурт", "Кисляк", "Інше"],
            "Сметана": ["Сметана", "Інше"],
            "М'який сир": ["М'який сир", "Інше"],
            "Твердий сир": ["Твердий сир", "Інше"],
            "Козячий та овечий сир": ["Козячий сир", "Овечий сир", "Інше"],
            "Каймак та масло": ["Каймак", "Масло", "Інше"],
            "Інше": ["Інше"]
        },
        "Овочі": ["Свіжі", "Термічно оброблені", "Заморожені", "Інше"],
        "Консервація та компоти": {
            "Фрукти": ["Абрикос", "Груша", "Вишня", "Полуничний джем", "Сливовий джем", "Черешня", "Малиновий джем", "Айва", "Ананас", "Манговий джем", "Інше"],
            "Овочі": ["Мариновані огірки", "Маринований перець", "Томатне пюре", "Буряк", "Айвар", "Соління", "Квашена капуста", "Інше"]
        },
        "Тісто та Солодощі": {
            "Тісто": ["Хліб", "Житній хліб", "Чабата", "Кукурудзяний хліб", "Багет", "Пшеничне борошно", "Цільнозернове борошно", "Гречане борошно", "Рисове борошно", "Спеції", "Інше"],
            "Солодощі": ["Тістечка", "Торти", "Випічка", "Морозиво", "Шоколад", "Цукерки", "Інше"]
        },
        "Напої": {
            "Вода": ["Мінеральна", "Негазована", "Газована", "Інше"],
            "Вино": ["Червоне", "Біле", "Рожеве", "Інше"],
            "Сік": ["Фруктовий", "Овочевий", "Інше"],
            "Міцні напої": ["Ракія", "Горілка", "Віскі", "Інше"],
            "Пиво": ["Темне", "Світле", "Інше"]
        },
        "Хімія та гігієна": {
            "Санітарія": ["Миття вікон", "Миття посуду", "Миття підлоги", "Засіб для ванної", "Інше"],
            "Особиста гігієна": ["Дезодорант", "Бритва", "Косметика", "Мило", "Шампунь", "Крем", "Інше"],
            "Інвентар": ["Маленьке відро", "Відро", "Ганчірка для пилу", "Мітла", "Інше"]
        },
        "Інше": ["Інше"]
    },
    ru: {
        "Белое мясо": ["Курица", "Индейка", "Гусь", "Утка", "Другое"],
        "Красное мясо": ["Свинина", "Баранина", "Овца", "Телятина", "Говядина", "Бык", "Конина", "Кролик", "Другое"],
        "Мелкая дичь": ["Перепел", "Фазан", "Куропатка", "Дикая утка", "Дикий гусь", "Заяц", "Голубь", "Другое"],
        "Крупная дичь": ["Олень", "Косуля", "Дикая коза", "Лось", "Северный олень", "Кабан", "Бизон", "Верблюд", "Лама", "Альпака", "Кенгуру", "Крокодил/Аллигатор", "Ящерица", "Змея", "Другое"],
        "Рыба": ["Морская", "Пресноводная", "Морепродукты", "Другое"],
        "Молочные продукты": {
            "Молоко": ["Коровье", "Козье", "Овечье", "Миндальное", "Соевое", "Другое"],
            "Йогурт и простокваша": ["Йогурт", "Простокваша", "Другое"],
            "Сметана": ["Сметана", "Другое"],
            "Мягкий сыр": ["Мягкий сыр", "Другое"],
            "Твердый сыр": ["Твердый сыр", "Другое"],
            "Козий и овечий сыр": ["Козий сыр", "Овечий сыр", "Другое"],
            "Каймак и масло": ["Каймак", "Масло", "Другое"],
            "Другое": ["Другое"]
        },
        "Овощи": ["Свежие", "Термически обработанные", "Замороженные", "Другое"],
        "Консервация и компоты": {
            "Фрукты": ["Абрикос", "Груша", "Вишня", "Клубничный джем", "Сливовый джем", "Черешня", "Малиновый джем", "Айва", "Ананас", "Манговый джем", "Другое"],
            "Овощи": ["Маринованные огурцы", "Маринованный перец", "Томатное пюре", "Свекла", "Айвар", "Соленья", "Квашеная капуста", "Другое"]
        },
        "Тесто и Сладости": {
            "Тесто": ["Хлеб", "Ржаной хлеб", "Чиабатта", "Кукурузный хлеб", "Багет", "Пшеничная мука", "Цельнозерновая мука", "Гречневая мука", "Рисовая мука", "Специи", "Другое"],
            "Сладости": ["Пирожные", "Торты", "Выпечка", "Мороженое", "Шоколад", "Конфеты", "Другое"]
        },
        "Напитки": {
            "Вода": ["Минеральная", "Негазированная", "Газированная", "Другое"],
            "Вино": ["Красное", "Белое", "Розовое", "Другое"],
            "Сок": ["Фруктовый", "Овощной", "Другое"],
            "Крепкие напитки": ["Ракия", "Водка", "Виски", "Другое"],
            "Пиво": ["Темное", "Светлое", "Другое"]
        },
        "Химия и гигиена": {
            "Санитария": ["Мытье окон", "Мытье посуды", "Мытье полов", "Средство для ванной", "Другое"],
            "Личная гигиена": ["Дезодорант", "Бритва", "Косметика", "Мыло", "Шампунь", "Крем", "Другое"],
            "Инвентарь": ["Маленькое ведро", "Ведро", "Тряпка для пыли", "Метла", "Другое"]
        },
        "Другое": ["Другое"]
    },
    en: {
        "White meat": ["Chicken", "Turkey", "Goose", "Duck", "Other"],
        "Red meat": ["Pork", "Lamb", "Sheep", "Veal", "Beef", "Bull", "Horse", "Rabbit", "Other"],
        "Small game": ["Quail", "Pheasant", "Partridge", "Wild duck", "Wild goose", "Hare", "Pigeon", "Other"],
        "Big game": ["Deer", "Roe deer", "Wild goat", "Moose", "Reindeer", "Wild boar", "Bison", "Camel", "Llama", "Alpaca", "Kangaroo", "Crocodile/Alligator", "Lizard", "Snake", "Other"],
        "Fish": ["Sea", "Freshwater", "Seafood", "Other"],
        "Dairy products": {
            "Milk": ["Cow", "Goat", "Sheep", "Almond", "Soy", "Other"],
            "Yogurt and sour milk": ["Yogurt", "Sour milk", "Other"],
            "Sour cream": ["Sour cream", "Other"],
            "Soft cheese": ["Soft cheese", "Other"],
            "Hard cheese": ["Hard cheese", "Other"],
            "Goat and sheep cheese": ["Goat cheese", "Sheep cheese", "Other"],
            "Kaymak and butter": ["Kaymak", "Butter", "Other"],
            "Other": ["Other"]
        },
        "Vegetables": ["Fresh", "Heat treated", "Frozen", "Other"],
        "Preserves and compotes": {
            "Fruit": ["Apricot", "Pear", "Sour cherry", "Strawberry jam", "Plum jam", "Cherry", "Raspberry jam", "Quince", "Pineapple", "Mango jam", "Other"],
            "Vegetables": ["Pickled cucumbers", "Pickled peppers", "Tomato puree", "Beetroot", "Ajvar", "Pickles", "Sauerkraut", "Other"]
        },
        "Dough and Sweets": {
            "Dough": ["Bread", "Rye bread", "Ciabatta", "Cornbread", "Baguette", "Wheat flour", "Whole grain flour", "Buckwheat flour", "Rice flour", "Spices", "Other"],
            "Sweets": ["Cakes", "Pastries", "Baked goods", "Ice cream", "Chocolate", "Candies", "Other"]
        },
        "Beverages": {
            "Water": ["Mineral", "Still", "Sparkling", "Other"],
            "Wine": ["Red", "White", "Rosé", "Other"],
            "Juice": ["Fruit juice", "Vegetable juice", "Other"],
            "Spirits": ["Rakia", "Vodka", "Whiskey", "Other"],
            "Beer": ["Dark", "Light", "Other"]
        },
        "Chemicals and hygiene": {
            "Sanitary": ["Window cleaning", "Dishwashing", "Floor cleaning", "Bathroom cleaner", "Other"],
            "Personal hygiene": ["Deodorant", "Razor", "Makeup", "Soap", "Shampoo", "Cream", "Other"],
            "Supplies": ["Small bucket", "Bucket", "Dust cloth", "Broom", "Other"]
        },
        "Other": ["Other"]
    },
    de: {
        "Weißes Fleisch": ["Huhn", "Truthahn", "Gans", "Ente", "Andere"],
        "Rotes Fleisch": ["Schwein", "Lamm", "Schaf", "Kalb", "Rind", "Bulle", "Pferd", "Kaninchen", "Andere"],
        "Kleinwild": ["Wachtel", "Fasan", "Rebhuhn", "Wildente", "Wildgans", "Hase", "Taube", "Andere"],
        "Großwild": ["Hirsch", "Reh", "Wildziege", "Elch", "Rentier", "Wildschwein", "Bison", "Kamel", "Lama", "Alpaka", "Känguru", "Krokodil/Alligator", "Eidechse", "Schlange", "Andere"],
        "Fisch": ["Meer", "Süßwasser", "Meeresfrüchte", "Andere"],
        "Milchprodukte": {
            "Milch": ["Kuhmilch", "Ziegenmilch", "Schafmilch", "Mandelmilch", "Sojamilch", "Andere"],
            "Joghurt und Sauermilch": ["Joghurt", "Sauermilch", "Andere"],
            "Saure Sahne": ["Saure Sahne", "Andere"],
            "Frischkäse": ["Frischkäse", "Andere"],
            "Hartkäse": ["Hartkäse", "Andere"],
            "Ziegen- und Schafskäse": ["Ziegenkäse", "Schafskäse", "Andere"],
            "Kaymak und Butter": ["Kaymak", "Butter", "Andere"],
            "Andere": ["Andere"]
        },
        "Gemüse": ["Frisch", "Wärmebehandelt", "Gefroren", "Andere"],
        "Konserven und Kompotte": {
            "Obst": ["Aprikose", "Birne", "Sauerkirsche", "Erdbeermarmelade", "Pflaumenmus", "Kirsche", "Himbeermarmelade", "Quitte", "Ananas", "Mangomarmelade", "Andere"],
            "Gemüse": ["Gewürzgurken", "Eingelegter Paprika", "Tomatenmark", "Rote Bete", "Ajvar", "Sauergemüse", "Sauerkraut", "Andere"]
        },
        "Teig und Süßigkeiten": {
            "Teig": ["Brot", "Roggenbrot", "Ciabatta", "Maisbrot", "Baguette", "Weizenmehl", "Vollkornmehl", "Buchweizenmehl", "Reismehl", "Gewürze", "Andere"],
            "Süßigkeiten": ["Kuchen", "Torten", "Gebäck", "Eiscreme", "Schokolade", "Bonbons", "Andere"]
        },
        "Getränke": {
            "Wasser": ["Mineralwasser", "Still", "Sprudeld", "Andere"],
            "Wein": ["Rotwein", "Weißwein", "Rosé", "Andere"],
            "Saft": ["Fruchtsaft", "Gemüsesaft", "Andere"],
            "Spirituosen": ["Rakija", "Wodka", "Whisky", "Andere"],
            "Bier": ["Dunkel", "Hell", "Andere"]
        },
        "Chemie und Hygiene": {
            "Sanitär": ["Fensterreinigung", "Geschirrspülen", "Bodenreinigung", "Badreiniger", "Andere"],
            "Körperpflege": ["Deodorant", "Rasierer", "Make-up", "Seife", "Shampoo", "Creme", "Andere"],
            "Zubehör": ["Kleiner Eimer", "Eimer", "Staubtuch", "Besen", "Andere"]
        },
        "Andere": ["Andere"]
    },
    zh: {
        "白肉": ["鸡", "火鸡", "鹅", "鸭", "其他"],
        "红肉": ["猪肉", "羊肉", "羊", "小牛肉", "牛肉", "公牛", "马肉", "兔肉", "其他"],
        "小型野味": ["鹌鹑", "野鸡", "鹧鸪", "野鸭", "野鹅", "野兔", "鸽子", "其他"],
        "大型野味": ["鹿", "狍子", "野山羊", "驼鹿", "驯鹿", "野猪", "野牛", "骆驼", "羊驼", "袋鼠", "鳄鱼", "蜥蜴", "蛇", "其他"],
        "鱼": ["海鱼", "淡水鱼", "海鲜", "其他"],
        "乳制品": {
            "牛奶": ["牛奶", "羊奶", "杏仁奶", "豆奶", "其他"],
            "酸奶": ["酸奶", "其他"],
            "酸奶油": ["酸奶油", "其他"],
            "软奶酪": ["软奶酪", "其他"],
            "硬奶酪": ["硬奶酪", "其他"],
            "山羊和绵羊奶酪": ["山羊奶酪", "绵羊奶酪", "其他"],
            "奶油和黄油": ["奶油", "黄油", "其他"],
            "其他": ["其他"]
        },
        "蔬菜": ["新鲜", "热处理", "冷冻", "其他"],
        "蜜饯和蜜饯": {
            "水果": ["杏", "梨", "酸樱桃", "草莓酱", "李子酱", "樱桃", "树莓酱", "木瓜", "菠萝", "芒果酱", "其他"],
            "蔬菜": ["酸黄瓜", "腌辣椒", "番茄酱", "甜菜根", "辣椒酱", "泡菜", "酸菜", "其他"]
        },
        "面团和糖果": {
            "面团": ["面包", "黑麦面包", "恰巴塔", "玉米面包", "法包", "小麦粉", "全麦粉", "荞麦粉", "米粉", "调味料", "其他"],
            "糖果": ["糕点", "蛋糕", "烘焙食品", "冰淇淋", "巧克力", "糖果", "其他"]
        },
        "饮料": {
            "水": ["矿泉水", "纯净水", "气泡水", "其他"],
            "葡萄酒": ["红葡萄酒", "白葡萄酒", "桃红葡萄酒", "其他"],
            "果汁": ["果汁", "蔬菜汁", "其他"],
            "烈酒": ["果酒", "伏特加", "威士忌", "其他"],
            "啤酒": ["黑啤酒", "白啤酒", "其他"]
        },
        "化学品和卫生": {
            "卫生清洁": ["擦窗", "洗碗", "擦地", "浴室清洁剂", "其他"],
            "个人卫生": ["止汗剂", "剃须刀", "化妆品", "肥皂", "洗发水", "面霜", "其他"],
            "用具": ["小水桶", "水桶", "除尘布", "扫帚", "其他"]
        },
        "其他": ["其他"]
    },
    es: {
        "Carne blanca": ["Pollo", "Pavo", "Ganso", "Pato", "Otro"],
        "Carne roja": ["Cerdo", "Cordero", "Oveja", "Ternera", "Res", "Toro", "Caballo", "Conejo", "Otro"],
        "Caza menor": ["Codorniz", "Faisán", "Perdiz", "Pato salvaje", "Ganso salvaje", "Liebre", "Paloma", "Otro"],
        "Caza mayor": ["Ciervo", "Corzo", "Cabra salvaje", "Alce", "Reno", "Jabalí", "Bisonte", "Camello", "Llama", "Alpaca", "Canguro", "Cocodrilo/Caimán", "Lagarto", "Serpiente", "Otro"],
        "Pescado": ["Mar", "Agua dulce", "Mariscos", "Otro"],
        "Productos lácteos": {
            "Leche": ["Leche de vaca", "Leche de cabra", "Leche de oveja", "Leche de almendra", "Leche de soja", "Otro"],
            "Yogur y leche agria": ["Yogur", "Leche agria", "Otro"],
            "Crema agria": ["Crema agria", "Otro"],
            "Queso tierno": ["Queso tierno", "Otro"],
            "Queso curado": ["Queso curado", "Otro"],
            "Queso de cabra y oveja": ["Queso de cabra", "Queso de oveja", "Otro"],
            "Mantequilla y nata": ["Mantequilla", "Nata", "Otro"],
            "Otro": ["Otro"]
        },
        "Verduras": ["Frescas", "Tratadas térmicamente", "Congeladas", "Otro"],
        "Conservas y compotas": {
            "Fruta": ["Albaricoque", "Pera", "Guinda", "Mermelada de fresa", "Mermelada de ciruela", "Cereza", "Mermelada de frambuesa", "Membrillo", "Piña", "Mermelada de mango", "Otro"],
            "Verduras": ["Pepinillos", "Pimientos en conserva", "Puré de tomate", "Remolacha", "Ajvar", "Encurtidos", "Chucrut", "Otro"]
        },
        "Masa y Dulces": {
            "Masa": ["Pan", "Pan de centeno", "Ciabatta", "Pan de maíz", "Baguette", "Harina de trigo", "Harina integral", "Harina de trigo sarraceno", "Harina de arroz", "Especias", "Otro"],
            "Dulces": ["Pasteles", "Tartas", "Bollería", "Helado", "Chocolate", "Caramelos", "Otro"]
        },
        "Bebidas": {
            "Agua": ["Mineral", "Sin gas", "Con gas", "Otro"],
            "Vino": ["Tinto", "Blanco", "Rosado", "Otro"],
            "Jugo": ["De frutas", "De verduras", "Otro"],
            "Licores": ["Orujo/Rakia", "Vodka", "Whisky", "Otro"],
            "Cerveza": ["Negra", "Rubia", "Otro"]
        },
        "Química e higiene": {
            "Sanitario": ["Limpieza de ventanas", "Lavadavajillas", "Limpieza de suelos", "Limpiador de baño", "Otro"],
            "Higiene personal": ["Desodorante", "Maquinilla de afeitar", "Maquillaje", "Jabón", "Champú", "Crema", "Otro"],
            "Utensilios": ["Cubo pequeño", "Cubo", "Trapo del polvo", "Escoba", "Otro"]
        },
        "Otro": ["Otro"]
    },
    pt: {
        "Carne branca": ["Frango", "Peru", "Ganso", "Pato", "Outro"],
        "Carne vermelha": ["Porco", "Cordeiro", "Ovelha", "Vitela", "Boi", "Touro", "Cavalo", "Coelho", "Outro"],
        "Caça pequena": ["Codorna", "Faisão", "Perdiz", "Pato selvagem", "Ganso selvagem", "Lebre", "Pombo", "Outro"],
        "Caça grossa": ["Cervo", "Corça", "Cabra selvagem", "Alce", "Rena", "Javali", "Bisão", "Camelo", "Lhama", "Alpaca", "Canguru", "Crocodilo/Jacaré", "Lagarto", "Cobra", "Outro"],
        "Peixe": ["Mar", "Água doce", "Frutos do mar", "Outro"],
        "Laticínios": {
            "Leite": ["Leite de vaca", "Leite de cabra", "Leite de ovelha", "Leite de amêndoa", "Leite de soja", "Outro"],
            "Iogurte e leite coalhado": ["Iogurte", "Leite coalhado", "Outro"],
            "Creme de leite": ["Creme de leite", "Outro"],
            "Queijo fresco": ["Queijo fresco", "Outro"],
            "Queijo cura": ["Queijo cura", "Outro"],
            "Queijo de cabra e ovelha": ["Queijo de cabra", "Queijo de ovelha", "Outro"],
            "Manteiga e nata": ["Manteiga", "Nata", "Outro"],
            "Outro": ["Outro"]
        },
        "Vegetais": ["Fresco", "Tratado termicamente", "Congelado", "Outro"],
        "Conservas e compotas": {
            "Fruta": ["Damasco", "Pêra", "Cereja ácida", "Geleia de morango", "Geleia de ameixa", "Cereja", "Geleia de framboesa", "Marmelo", "Ananás", "Geleia de manga", "Outro"],
            "Vegetais": ["Pepinos em conserva", "Pimentões em conserva", "Puré de tomate", "Beterraba", "Ajvar", "Picles", "Chucrute", "Outro"]
        },
        "Massa e Doces": {
            "Massa": ["Pão", "Pão de centeio", "Ciabatta", "Pão de milho", "Baguete", "Farinha de trigo", "Farinha integral", "Farinha de trigo sarraceno", "Farinha de arroz", "Especiarias", "Outro"],
            "Doces": ["Bolos", "Tortas", "Produtos de pastelaria", "Gelado", "Chocolate", "Doces", "Outro"]
        },
        "Bebidas": {
            "Água": ["Mineral", "Sem gás", "Com gás", "Outro"],
            "Vinho": ["Tinto", "Branco", "Rosé", "Outro"],
            "Suco": ["De frutas", "De vegetais", "Outro"],
            "Bebidas destiladas": ["Aguardente", "Vodka", "Uísque", "Outro"],
            "Cerveja": ["Escura", "Clara", "Outro"]
        },
        "Química e higiene": {
            "Sanitário": ["Limpeza de janelas", "Lava-louças", "Limpeza de pisos", "Limpador de banheiro", "Outro"],
            "Higiene pessoal": ["Desodorante", "Lâmina de barbear", "Maquiagem", "Sabonete", "Xampu", "Creme", "Outro"],
            "Utensílios": ["Balde pequeno", "Balde", "Pano de pó", "Vassoura", "Outro"]
        },
        "Outro": ["Outro"]
    },
    fr: {
        "Viande blanche": ["Poulet", "Dinde", "Oie", "Canard", "Autre"],
        "Viande rouge": ["Porc", "Agneau", "Mouton", "Veau", "Bœuf", "Taureau", "Cheval", "Lapin", "Autre"],
        "Petit gibier": ["Caille", "Faisan", "Perdrix", "Canard sauvage", "Oie sauvage", "Lièvre", "Pigeon", "Autre"],
        "Gros gibier": ["Cerf", "Chevreuil", "Chèvre sauvage", "Élan", "Renne", "Sanglier", "Bison", "Chameau", "Lama", "Alpaga", "Kangourou", "Crocodile/Alligator", "Lézard", "Serpent", "Autre"],
        "Poisson": ["Mer", "Eau douce", "Fruits de mer", "Autre"],
        "Produits laitiers": {
            "Lait": ["Lait de vache", "Lait de chèvre", "Lait de brebis", "Lait d'amande", "Lait de soja", "Autre"],
            "Yaourt et lait caillé": ["Yaourt", "Lait caillé", "Autre"],
            "Crème fraîche": ["Crème fraîche", "Autre"],
            "Fromage frais": ["Fromage frais", "Autre"],
            "Fromage à pâte dure": ["Fromage à pâte dure", "Autre"],
            "Fromage de chèvre et brebis": ["Fromage de chèvre", "Fromage de brebis", "Autre"],
            "Beurre et crème": ["Beurre", "Crème", "Autre"],
            "Autre": ["Autre"]
        },
        "Légumes": ["Frais", "Traité thermiquement", "Congelé", "Autre"],
        "Conserves et compotes": {
            "Fruits": ["Abricot", "Poire", "Griotte", "Confiture de fraises", "Confiture de prunes", "Cerise", "Confiture de framboises", "Coing", "Ananas", "Confiture de mangue", "Autre"],
            "Légumes": ["Cornichons", "Poivrons marinés", "Purée de tomates", "Betterave", "Ajvar", "Pickles", "Choucroute", "Autre"]
        },
        "Pâte et Sucreries": {
            "Pâte": ["Pain", "Pain de seigle", "Ciabatta", "Pain de maïs", "Baguette", "Farine de blé", "Farine complète", "Farine de sarrasin", "Farine de riz", "Épices", "Autre"],
            "Sucreries": ["Gâteaux", "Tartes", "Viennoiseries", "Glace", "Chocolat", "Bonbons", "Autre"]
        },
        "Boissons": {
            "Eau": ["Minérale", "Plate", "Gazeuse", "Autre"],
            "Vin": ["Rouge", "Blanc", "Rosé", "Autre"],
            "Jus": ["De fruits", "De légumes", "Autre"],
            "Spiritueux": ["Eau-de-vie", "Vodka", "Whisky", "Autre"],
            "Bière": ["Brune", "Blonde", "Autre"]
        },
        "Chimie et hygiène": {
            "Sanitaire": ["Lavage des vitres", "Lavage de la vaisselle", "Lavage des sols", "Produit pour salle de bain", "Autre"],
            "Hygiène personnelle": ["Déodorant", "Rasoir", "Maquillage", "Savon", "Shampooing", "Crème", "Autre"],
            "Matériel": ["Petit seau", "Seau", "Chiffon à poussière", "Balai", "Autre"]
        },
            "Autre": ["Autre"]
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

// ===== 7. RENDER FUNKCIJE =====
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
        // Siguran poziv funkcija preko stringova za dugmad
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

    // Bezbedno izvlačenje podkategorija za izabrani jezik i kategoriju
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
            
            // Provera da li ova podkategorija ima svoje delove (productParts)
            const hasParts = productParts[currentLang]?.[item] || productParts.sr?.[item];
            
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
    if (Array.isArray(items)) {
        let displayItems = [...items];
        const hasOstalo = displayItems.some(item => isOtherButton(item));
        if (!hasOstalo) {
            displayItems.push(t('Ostalo') || "Ostalo");
        }
        displayItems.forEach((item, idx) => {
            const color = colors[idx % colors.length];
            const safeItem = item.toString().replace(/'/g, "\\'");
            if (isOtherButton(item)) {
                html += `<button class="category-btn" style="background:${color};" onclick="renderDataEntry('')">${item} ➜</button>`;
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
        showModernAlert('No Selection', 'You have not selected any items to delete!', '⚠️');
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
        showModernAlert('No Selection', 'You have not selected any items to update!', '⚠️');
        return;
    }
    if (selected.length > 1) {
        showModernAlert('Error', 'You can only update one item at a time!', '❌');
        return;
    }
    const index = parseInt(selected[0].dataset.index);
    const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    renderUpdateEntry(zalihe[index], index);
}

function renderUpdateEntry(proizvod, index) {
    // Ako nema specifičnog ekrana, koristi standardni update unos ili alert
    showModernAlert('Update', 'Update feature selected for index ' + index, 'ℹ️');
}

function saveProduct() {
    const product = document.getElementById('productInput')?.value.trim();
    const quantity = document.getElementById('quantityInput')?.value.trim();
    if (!product) {
        showModernAlert('Missing Info', 'Please enter a product name!', '📝');
        return;
    }
    if (!quantity || isNaN(parseFloat(quantity))) {
        showModernAlert('Missing Info', 'Please enter a valid quantity!', '📝');
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
    if (existingIndex !== -1) { zalihe[existingIndex] = productData; } else { zalihe.push(productData); }
    localStorage.setItem('zalihe', JSON.stringify(zalihe));
    if (typeof prikaziSveUnose === 'function') prikaziSveUnose();
    document.getElementById('pieceInput').value = '';
    document.getElementById('quantityInput').value = '1';
    document.getElementById('quantityInput').focus();
    showModernAlert('Success', 'Product saved successfully!', '✅');
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

// ===== GLAVNA FUNKCIJA ZA NAZAD / ODUSTANI =====
function handleBackAction() {
    console.log('⬅️ Trenutni ekran stanje:', currentScreenState);
    if (currentScreenState === 'dataEntry') {
        if (currentSubcategory) {
            renderProductParts(currentSubcategory);
        } else {
            renderSubcategories(currentCategory);
        }
    } else if (currentScreenState === 'productParts') {
        renderSubcategories(currentCategory);
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

// ===== GLAVNI DOGAĐAJI =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM je spreman!');

    const loginBtn = document.getElementById('loginBtn');
    const phoneInput = document.getElementById('phoneInput');

    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            triggerLogin(); 
        });
    }

    // Direktan listener za Enter taster na polju za telefon
    if (phoneInput) {
        phoneInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                triggerLogin();
            }
        });
    }
    
    document.getElementById('exitLoginBtn')?.addEventListener('click', exitApp);
    document.getElementById('exitLangBtn')?.addEventListener('click', exitApp);
    document.getElementById('exitMainBtn')?.addEventListener('click', exitApp);

    document.getElementById('backBtn')?.addEventListener('click', handleBackAction);
    document.getElementById('inventoryBtn')?.addEventListener('click', function() { renderInventory(); });
    
    const shoppingBtn = document.getElementById('shoppingBtn');
    if (shoppingBtn) {
        shoppingBtn.addEventListener('click', function() { 
            showModernAlert('Info', 'Shopping list view', '🛒');
        });
    }

    // ===== SUPPORT DOGAĐAJI =====
    document.getElementById('supportBtn')?.addEventListener('click', openSupportDialog);
    document.getElementById('closeSupportBtn')?.addEventListener('click', closeSupportDialog);
    document.getElementById('closeSupportBtn2')?.addEventListener('click', closeSupportDialog);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeSupportDialog();
    });

    console.log('✅ Svi događaji povezani!');
});

// ============================================
// GLOBALNA FUNKCIJA ZA LOGIN
// ============================================
function triggerLogin() {
    const phoneInput = document.getElementById('phoneInput');
    if (!phoneInput) {
        showModernAlert('Error', 'Phone input not found!', '❌');
        return;
    }
    const phone = phoneInput.value.trim();
    if (phone.length >= 3) {
        showScreen('languageScreen');
        renderLanguages();
    } else {
        showModernAlert('Invalid Input', 'Please enter a valid phone number!', '📱');
    }
}
