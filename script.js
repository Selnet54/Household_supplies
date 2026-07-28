// ============================================
// PUNI SCRIPT ZA APLIKACIJU - HIJERARHIJSKI NAZAD
// ============================================
console.log('✅ Script.js je učitan!');

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

// ===== 6. TRENUTNO STANJE =====
let currentLang = 'sr';
let currentCategory = '';
let currentSubcategory = '';
let currentProductPart = '';
let currentScreenState = 'languages'; // 'languages', 'categories', 'subcategories', 'productParts', 'dataEntry', 'inventory', 'shopping'

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
        spisak_potreba: "Shopping List",  azuriraj: "Update", obrisi: "Delete",
        oznaci_sve: "Select all", kopiraj: "Copy", obrisi_oznaceno: "Delete selected",
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

// ===== 5. PODKATEGORIJE ZA SVIH 10 JEZIKA =====
const subcategories = {
    sr: {
        "Belo meso": ["Pileće", "Ćureće", "Guska", "Patka", "Ostalo"],
        "Crveno meso": ["Svinjsko", "Jagnjeće", "Ovčije", "Juneće", "Govedina", "Od bika", "Konjsko", "Zečije", "Ostalo"],
        "Sitna divljač": ["Prepelica", "Fazan", "Jarebica", "Divlja patka", "Divlja guska", "Divlji zec", "Golub", "Ostalo"],
        "Krupna divljač": ["Jelen", "Srna", "Divokoza", "Los", "Irvas", "Divlja svinja", "Bizon", "Kamila", "Lama", "Alpaka", "Kengur", "Krokodil/Aligator", "Gušter", "Zmija", "Ostalo"],
        "Riba": ["Morska", "Slatkovodna", "Plodovi mora", "Ostalo"],
        "Mlečni proizvodi": ["Mleko", "Jogurt i kiselo mleko", "Pavlaka", "Mladi sir", "Tvrdi sir", "Kozji i ovčiji sir", "Kajmak i puter", "Ostalo"],
        "Povrće": ["Sveže", "Termički obrađeno", "Zamrznuto", "Ostalo"],
        "Zimnica i kompoti": ["Ajvar i pinđur", "Turšija i kiseli program", "Džemovi i pekmezi", "Kompoti", "Sokovi i sirupi", "Ostalo"],
        "Testo i Slatkiši": ["Hleb i peciva", "Brašno i testenina", "Kolači i torte", "Čokolade i bomboni", "Ostalo"],
        "Pića": ["Voda", "Vino", "Sok", "Žestoka pića", "Pivo", "Ostalo"],
        "Hemija i higijena": ["Deterdženti i omekšivači", "Sredstva za čišćenje", "Lična higijena", "Toaletni papir i ubrusi", "Ostalo"],
        "Ostalo": ["Ostalo"]
    },
    hu: {
        "Fehér hús": ["Csirke", "Pulyka", "Libacomb", "Kacsa", "Egyéb"],
        "Vörös hús": ["Sertéshús", "Bárányhús", "Juhhús", "Borjúhús", "Marhahús", "Bikahús", "Lóhús", "Nyúlhús", "Egyéb"],
        "Apróvad": ["Fürj", "Fácán", "Fogoly", "Vadkacsa", "Vadliba", "Vadnyúl", "Galamb", "Egyéb"],
        "Nagyvad": ["Szarvas", "Őz", "Vadkecske", "Jávorszarvas", "Rénszarvas", "Vadkan", "Bölény", "Teve", "Láma", "Alpaka", "Kenguru", "Krokodil/Alligátor", "Gyík", "Kígyó", "Egyéb"],
        "Hal": ["Tengeri", "Édesvízi", "Tenger gyümölcsei", "Egyéb"],
        "Tejtermékek": ["Tej", "Joghurt és aludttej", "Tejföl", "Friss sajt", "Kemény sajt", "Kecske- és juhsajt", "Kajmak és vaj", "Egyéb"],
        "Zöldség": ["Friss", "Hőkezelt", "Fagyasztott", "Egyéb"],
        "Befőttek és kompótok": ["Ajvár", "Savanyúság", "Lejárók és lekvárok", "Kompótok", "Levek és szirupok", "Egyéb"],
        "Tészta és Édességek": ["Kenyér és péksütemények", "Liszt és tészta", "Sütemények és torták", "Csokoládék és cukorkák", "Egyéb"],
        "Italok": ["Víz", "Bor", "Lé", "Tömény italok", "Sör", "Egyéb"],
        "Kémia és higiénia": ["Mosószerek és öblítők", "Tisztítószerek", "Személyes higiénia", "Toalettpapír és törölközők", "Egyéb"],
        "Egyéb": ["Egyéb"]
    },
    uk: {
        "Біле м'ясо": ["Курятина", "Індичка", "Гуска", "Качка", "Інше"],
        "Червоне м'ясо": ["Свинина", "Ягнятина", "Баранина", "Телятина", "Яловичина", "Бичатина", "Конина", "Кролик", "Інше"],
        "Дрібна дичина": ["Перепілка", "Фазан", "Куріпка", "Дика качка", "Дика гуска", "Заєць", "Голуб", "Інше"],
        "Велика дичина": ["Олень", "Косуля", "Козуль", "Лось", "Північний олень", "Дикий кабан", "Бізон", "Верблюд", "Лама", "Альпака", "Кенгуру", "Крокодил/Алігатор", "Ящірка", "Змія", "Інше"],
        "Риба": ["Морська", "Прісноводна", "Морепродукти", "Інше"],
        "Молочні продукти": ["Молоко", "Йогурт та кисляк", "Сметана", "М'який сир", "Твердий сир", "Козячий та овечий сир", "Каймак та масло", "Інше"],
        "Овочі": ["Свіжі", "Термічно оброблені", "Заморожені", "Інше"],
        "Консервація та компоти": ["Айвар", "Консервація та соління", "Джеми та варення", "Компоти", "Соки та сиропи", "Інше"],
        "Тісто та Солодощі": ["Хліб та випічка", "Борошно та макарони", "Торти та тістечка", "Шоколад та цукерки", "Інше"],
        "Напої": ["Вода", "Вино", "Сік", "Міцні напої", "Пиво", "Інше"],
        "Хімія та гігієна": ["Пральні порошки та кондиціонери", "Засоби для чищення", "Особиста гігієна", "Туалетний папір та серветки", "Інше"],
        "Інше": ["Інше"]
    },
    ru: {
        "Белое мясо": ["Курица", "Индейка", "Гусь", "Утка", "Другое"],
        "Красное мясо": ["Свинина", "Баранина", "Овца", "Телятина", "Говядина", "Бык", "Конина", "Кролик", "Другое"],
        "Мелкая дичь": ["Перепел", "Фазан", "Куропатка", "Дикая утка", "Дикий гусь", "Заяц", "Голубь", "Другое"],
        "Крупная дичь": ["Олень", "Косуля", "Дикая коза", "Лось", "Северный олень", "Кабан", "Бизон", "Верблюд", "Лама", "Альпака", "Кенгуру", "Крокодил/Аллигатор", "Ящерица", "Змея", "Другое"],
        "Рыба": ["Морская", "Пресноводная", "Морепродукты", "Другое"],
        "Молочные продукты": ["Молоко", "Йогурт и простокваша", "Сметана", "Мягкий сыр", "Твердый сыр", "Козий и овечий сыр", "Каймак и масло", "Другое"],
        "Овощи": ["Свежие", "Термически обработанные", "Замороженные", "Другое"],
        "Консервация и компоты": ["Айвар", "Соленья", "Джемы и варенье", "Компоты", "Соки и сиропы", "Другое"],
        "Тесто и Сладости": ["Хлеб и выпечка", "Мука и макароны", "Торты и пирожные", "Шоколад и конфеты", "Другое"],
        "Напитки": ["Вода", "Вино", "Сок", "Крепкие напитки", "Пиво", "Другое"],
        "Химия и гигиена": ["Порошки и кондиционеры", "Чистящие средства", "Личная гигиена", "Туалетная бумага и салфетки", "Другое"],
        "Другое": ["Другое"]
    },
    en: {
        "White meat": ["Chicken", "Turkey", "Goose", "Duck", "Other"],
        "Red meat": ["Pork", "Lamb", "Sheep", "Veal", "Beef", "Bull", "Horse", "Rabbit", "Other"],
        "Small game": ["Quail", "Pheasant", "Partridge", "Wild duck", "Wild goose", "Hare", "Pigeon", "Other"],
        "Big game": ["Deer", "Roe deer", "Wild goat", "Moose", "Reindeer", "Wild boar", "Bison", "Camel", "Llama", "Alpaca", "Kangaroo", "Crocodile/Alligator", "Lizard", "Snake", "Other"],
        "Fish": ["Sea", "Freshwater", "Seafood", "Other"],
        "Dairy products": ["Milk", "Yogurt and sour milk", "Sour cream", "Soft cheese", "Hard cheese", "Goat and sheep cheese", "Kaymak and butter", "Other"],
        "Vegetables": ["Fresh", "Heat treated", "Frozen", "Other"],
        "Preserves and compotes": ["Ajvar and relish", "Pickles", "Jams and preserves", "Compotes", "Juices and syrups", "Other"],
        "Dough and Sweets": ["Bread and pastry", "Flour and pasta", "Cakes and pastries", "Chocolate and candies", "Other"],
        "Beverages": ["Water", "Wine", "Juice", "Spirits", "Beer", "Other"],
        "Chemicals and hygiene": ["Detergents and softeners", "Cleaning agents", "Personal hygiene", "Toilet paper and tissues", "Other"],
        "Other": ["Other"]
    },
    de: {
        "Weißes Fleisch": ["Huhn", "Truthahn", "Gans", "Ente", "Andere"],
        "Rotes Fleisch": ["Schwein", "Lamm", "Schaf", "Kalb", "Rind", "Bulle", "Pferd", "Kaninchen", "Andere"],
        "Kleinwild": ["Wachtel", "Fasan", "Rebhuhn", "Wildente", "Wildgans", "Hase", "Taube", "Andere"],
        "Großwild": ["Hirsch", "Reh", "Wildziege", "Elch", "Rentier", "Wildschwein", "Bison", "Kamel", "Lama", "Alpaka", "Känguru", "Krokodil/Alligator", "Eidechse", "Schlange", "Andere"],
        "Fisch": ["Meer", "Süßwasser", "Meeresfrüchte", "Andere"],
        "Milchprodukte": ["Milch", "Joghurt und Sauermilch", "Saure Sahne", "Frischkäse", "Hartkäse", "Ziegen- und Schafskäse", "Kaymak und Butter", "Andere"],
        "Gemüse": ["Frisch", "Wärmebehandelt", "Gefroren", "Andere"],
        "Konserven und Kompotte": ["Ajvar und Relish", "Eingelegtes", "Marmeladen und Konfitüren", "Kompotte", "Säfte und Sirupe", "Andere"],
        "Teig und Süßigkeiten": ["Brot und Gebäck", "Mehl und Teigwaren", "Kuchen und Torten", "Schokolade und Süßigkeiten", "Andere"],
        "Getränke": ["Wasser", "Wein", "Saft", "Spirituosen", "Bier", "Andere"],
        "Chemie und Hygiene": ["Waschmittel und Weichspüler", "Reinigungsmittel", "Körperpflege", "Toilettenpapier und Tücher", "Andere"],
        "Andere": ["Andere"]
    },
    zh: {
        "白肉": ["鸡", "火鸡", "鹅", "鸭", "其他"],
        "红肉": ["猪肉", "羊肉", "羊", "小牛肉", "牛肉", "公牛", "马肉", "兔肉", "其他"],
        "小型野味": ["鹌鹑", "野鸡", "鹧鸪", "野鸭", "野鹅", "野兔", "鸽子", "其他"],
        "大型野味": ["鹿", "狍子", "野山羊", "驼鹿", "驯鹿", "野猪", "野牛", "骆驼", "羊驼", "袋鼠", "鳄鱼", "蜥蜴", "蛇", "其他"],
        "鱼": ["海鱼", "淡水鱼", "海鲜", "其他"],
        "乳制品": ["牛奶", "酸奶", "酸奶油", "软奶酪", "硬奶酪", "山羊和绵羊奶酪", "奶油和黄油", "其他"],
        "蔬菜": ["新鲜", "热处理", "冷冻", "其他"],
        "蜜饯和蜜饯": ["辣椒酱", "泡菜", "果酱", "果盘", "果汁糖浆", "Other"],
        "面团和糖果": ["面包糕点", "面粉面条", "蛋糕点心", "巧克力糖果", "其他"],
        "饮料": ["水", "葡萄酒", "果汁", "烈酒", "啤酒", "其他"],
        "化学品和卫生": ["洗涤剂柔软剂", "清洁剂", "个人卫生", "卫生纸巾", "其他"],
        "其他": ["其他"]
    },
    es: {
        "Carne blanca": ["Pollo", "Pavo", "Ganso", "Pato", "Otro"],
        "Carne roja": ["Cerdo", "Cordero", "Oveja", "Ternera", "Res", "Toro", "Caballo", "Conejo", "Otro"],
        "Caza menor": ["Codorniz", "Faisán", "Perdiz", "Pato salvaje", "Ganso salvaje", "Liebre", "Paloma", "Otro"],
        "Caza mayor": ["Ciervo", "Corzo", "Cabra salvaje", "Alce", "Reno", "Jabalí", "Bisonte", "Camello", "Llama", "Alpaca", "Canguro", "Cocodrilo/Caimán", "Lagarto", "Serpiente", "Otro"],
        "Pescado": ["Mar", "Agua dulce", "Mariscos", "Otro"],
        "Productos lácteos": ["Leche", "Yogur y leche agria", "Crema agria", "Queso tierno", "Queso curado", "Queso de cabra y oveja", "Mantequilla y nata", "Otro"],
        "Verduras": ["Frescas", "Tratadas térmicamente", "Congeladas", "Otro"],
        "Conservas y compotas": ["Ajvar", "Encurtidos", "Mermeladas y confituras", "Compotas", "Zumos y jarabes", "Otro"],
        "Masa y Dulces": ["Pan y bollería", "Harina y pasta", "Pasteles y tortas", "Chocolate y caramelos", "Otro"],
        "Bebidas": ["Agua", "Vino", "Jugo", "Licores", "Cerveza", "Otro"],
        "Química e higiene": ["Detergentes y suavizantes", "Productos de limpieza", "Higiene personal", "Papel higiénico y pañuelos", "Otro"],
        "Otro": ["Otro"]
    },
    pt: {
        "Carne branca": ["Frango", "Peru", "Ganso", "Pato", "Outro"],
        "Carne vermelha": ["Porco", "Cordeiro", "Ovelha", "Vitela", "Boi", "Touro", "Cavalo", "Coelho", "Outro"],
        "Caça pequena": ["Codorna", "Faisão", "Perdiz", "Pato selvagem", "Ganso selvagem", "Lebre", "Pombo", "Outro"],
        "Caça grossa": ["Cervo", "Corça", "Cabra selvagem", "Alce", "Rena", "Javali", "Bisão", "Camelo", "Lhama", "Alpaca", "Canguru", "Crocodilo/Jacaré", "Lagarto", "Cobra", "Outro"],
        "Peixe": ["Mar", "Água doce", "Frutos do mar", "Outro"],
        "Laticínios": ["Leite", "Iogurte e leite coalhado", "Creme de leite", "Queijo fresco", "Queijo cura", "Queijo de cabra e ovelha", "Manteiga e nata", "Outro"],
        "Vegetais": ["Fresco", "Tratado termicamente", "Congelado", "Outro"],
        "Conservas e compotas": ["Ajvar", "Picles", "Geleias e compotas", "Compotas de frutas", "Sucos e xaropes", "Outro"],
        "Massa e Doces": ["Pão e pastelaria", "Farinha e massas", "Bolos e tortas", "Chocolate e doces", "Outro"],
        "Bebidas": ["Água", "Vinho", "Suco", "Bebidas destiladas", "Cerveja", "Outro"],
        "Química e higiene": ["Detergentes e amaciantes", "Produtos de limpeza", "Higiene pessoal", "Papel higiênico e lenços", "Outro"],
        "Outro": ["Outro"]
    },
    fr: {
        "Viande blanche": ["Poulet", "Dinde", "Oie", "Canard", "Autre"],
        "Viande rouge": ["Porc", "Agneau", "Mouton", "Veau", "Bœuf", "Taureau", "Cheval", "Lapin", "Autre"],
        "Petit gibier": ["Caille", "Faisan", "Perdrix", "Canard sauvage", "Oie sauvage", "Lièvre", "Pigeon", "Autre"],
        "Gros gibier": ["Cerf", "Chevreuil", "Chèvre sauvage", "Élan", "Renne", "Sanglier", "Bison", "Chameau", "Lama", "Alpaga", "Kangourou", "Crocodile/Alligator", "Lézard", "Serpent", "Autre"],
        "Poisson": ["Mer", "Eau douce", "Fruits de mer", "Autre"],
        "Produits laitiers": ["Lait", "Yaourt et lait caillé", "Crème fraîche", "Fromage frais", "Fromage à pâte dure", "Fromage de chèvre et brebis", "Beurre et crème", "Autre"],
        "Légumes": ["Frais", "Traité thermiquement", "Congelé", "Autre"],
        "Conserves et compotes": ["Ajvar", "Cornichons et pickles", "Confitures et gelées", "Compotes", "Jus et sirops", "Autre"],
        "Pâte et Sucreries": ["Pain et viennoiseries", "Farine et pâtes", "Gâteaux et tartes", "Chocolat et bonbons", "Autre"],
        "Boissons": ["Eau", "Vin", "Jus", "Spiritueux", "Bière", "Autre"],
        "Chimie et hygiène": ["Lessives et adoucissants", "Produits de nettoyage", "Hygiène personnelle", "Papier toilette et mouchoirs", "Autre"],
        "Autre": ["Autre"]
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
        // Proveravamo da li je u pitanju "Ostalo" (na bilo kom jeziku)
        if (isOtherButton(cat)) {
            html += `<button class="category-btn" style="background:${color};" onclick="renderDataEntry('')">${cat} ➜</button>`;
        } else {
            html += `<button class="category-btn" style="background:${color};" onclick="renderSubcategories('${cat}')">${cat}</button>`;
        }
    });
    html += `</div>`;
    content.innerHTML = html;
}

function renderSubcategories(category) {
    currentScreenState = 'subcategories';
    currentCategory = category;
    const content = document.getElementById('mainContent');
    const subList = getSubcategories(category);
    const colors = getSubcategoryColors(category);
    
    let html = `<div class="title">${t('podkategorije')}</div>`;
    html += `<div class="categories-grid">`;
    
    subList.forEach((sub, idx) => {
        const color = colors[idx % colors.length];
        if (isOtherButton(sub)) {
            html += `<button class="category-btn" style="background:${color};" onclick="renderDataEntry('')">${sub} ➜</button>`;
        } else {
            html += `<button class="category-btn" style="background:${color};" onclick="renderProductParts('${sub}')">${sub}</button>`;
        }
    });
    html += `</div>`;
    content.innerHTML = html;
}

function renderProductParts(subcategory) {
    currentScreenState = 'productParts';
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
            if (isOtherButton(part)) {
                html += `<button class="category-btn" style="background:${color};" onclick="renderDataEntry('')">${part} ➜</button>`;
            } else {
                html += `<button class="category-btn" style="background:${color};" onclick="renderDataEntry('${part}')">${part}</button>`;
            }
        });
    } else {
        html += `<button class="category-btn" style="background:#ddd;" onclick="renderDataEntry('')">${t('unesi')}</button>`;
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
    if (selected.length === 0) { alert('Niste označili nijedan red za brisanje!'); return; }
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
    if (selected.length === 0) { alert('Niste označili nijedan red za ažuriranje!'); return; }
    if (selected.length > 1) { alert('Možete ažurirati samo jedan red odjednom!'); return; }
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
    if (!product) { alert('Unesite naziv proizvoda!'); return; }
    if (!quantity || isNaN(parseFloat(quantity))) { alert('Unesite količinu!'); return; }
    
    const novaKolicina = parseFloat(quantity);
    let zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    
    if (novaKolicina === 0) {
        const proizvod = zalihe[index];
        if (proizvod) {
            let shopping = JSON.parse(localStorage.getItem('shoppingList') || '[]');
            shopping.push({ product_name: proizvod.product_name, description: proizvod.description || '', quantity: 0, unit: proizvod.unit || 'kom' });
            localStorage.setItem('shoppingList', JSON.stringify(shopping));
            zalihe.splice(index, 1);
            localStorage.setItem('zalihe', JSON.stringify(zalihe));
            alert('🛒 Proizvod prebačen u spisak potreba (količina 0)!');
            renderInventory();
            return;
        }
    }
    
    zalihe[index] = {
        product_name: product,
        description: document.getElementById('updateDescriptionInput')?.value.trim() || '',
        piece: document.getElementById('updatePieceInput')?.value.trim() || '-',
        quantity: novaKolicina,
        unit: document.getElementById('updateUnitSelect')?.value || 'kg',
        entry_date: document.getElementById('updateDateInput')?.value || new Date().toISOString().split('T')[0],
        shelf_life_months: parseInt(document.getElementById('updateShelfLifeInput')?.value) || 12,
        storage_location: document.getElementById('updateStorageSelect')?.value || 'Ostalo'
    };
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
    html += `<button onclick="oznaciSveShopping()" style="background:#2196F3; color:white; border:none; padding:10px 20px; border-radius:8px; font-size:16px; cursor:pointer;">☑️ ${t('oznaci_sve')}</button>`;
    html += `<button onclick="kopirajShopping()" style="background:#4CAF50; color:white; border:none; padding:10px 20px; border-radius:8px; font-size:16px; cursor:pointer;">📋 ${t('kopiraj')}</button>`;
    html += `<button onclick="obrisiOznacenoShopping()" style="background:#f44336; color:white; border:none; padding:10px 20px; border-radius:8px; font-size:16px; cursor:pointer;">🗑️ ${t('obrisi_oznaceno')}</button>`;
    html += `<button onclick="renderCategories()" style="background:#666; color:white; border:none; padding:10px 20px; border-radius:8px; font-size:16px; cursor:pointer;">✖ ${t('odustani')}</button>`;
    html += `</div>`;
    
    html += `<div class="table-container" style="max-height:400px; overflow-y:auto;">`;
    html += `<div class="table-title">🛒 ${t('spisak_potreba')}</div>`;
    html += `<div id="shoppingTable">`;
    html += `<div class="table-row header-row" style="display:grid; grid-template-columns:40px 1.5fr 1.5fr 0.8fr 0.8fr; gap:2px; background:#f0f0f0; font-weight:bold; border-bottom:2px solid #ccc; padding:5px 0;">`;
    html += `<div class="cell" style="text-align:center;"><input type="checkbox" id="selectAllShopping" onchange="toggleAllShopping()"></div>`;
    html += `<div class="cell">${t('naziv_proizvoda')}</div>`;
    html += `<div class="cell">${t('opis')}</div>`;
    html += `<div class="cell">${t('kolicina')}</div>`;
    html += `<div class="cell">${t('jedinica_mere')}</div>`;
    html += `</div>`;
    
    if (shopping.length === 0) {
        html += `<div class="table-row"><div class="cell" style="grid-column:span 5;padding:30px;color:#999;text-align:center;">${t('nema_proizvoda')}</div></div>`;
    } else {
        shopping.forEach((p, index) => {
            html += `<div class="table-row" style="display:grid; grid-template-columns:40px 1.5fr 1.5fr 0.8fr 0.8fr; gap:2px; border-bottom:1px solid #eee; padding:5px 0;">`;
            html += `<div class="cell" style="text-align:center;"><input type="checkbox" class="shopping-checkbox" data-index="${index}"></div>`;
            html += `<div class="cell">${p.product_name}</div>`;
            html += `<div class="cell">${p.description || ''}</div>`;
            html += `<div class="cell">${p.quantity}</div>`;
            html += `<div class="cell">${p.unit}</div>`;
            html += `</div>`;
        });
    }
    html += `</div></div>`;
    content.innerHTML = html;
}

function oznaciSveShopping() {
    const checkboxes = document.querySelectorAll('.shopping-checkbox');
    const selectAll = document.getElementById('selectAllShopping');
    if (checkboxes.length === 0) return;
    const sviOznaceni = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => cb.checked = !sviOznaceni);
    if (selectAll) selectAll.checked = !sviOznaceni;
}

function toggleAllShopping() {
    const selectAll = document.getElementById('selectAllShopping');
    const checkboxes = document.querySelectorAll('.shopping-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
}

function kopirajShopping() {
    const shopping = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    if (shopping.length === 0) { alert(t('nema_proizvoda')); return; }
    let tekst = `${t('spisak_potreba')}\n${'='.repeat(30)}\n\n`;
    shopping.forEach((p, index) => {
        tekst += `${index + 1}. ${p.product_name}`;
        if (p.description) tekst += ` - ${p.description}`;
        tekst += ` (${p.quantity} ${p.unit})\n`;
    });
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tekst).then(() => alert('✅ Lista je kopirana!')).catch(() => kopirajFallback(tekst));
    } else {
        kopirajFallback(tekst);
    }
}

function kopirajFallback(tekst) {
    const textarea = document.createElement('textarea');
    textarea.value = tekst;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand('copy'); alert('✅ Lista je kopirana!'); } catch (err) { alert('❌ Greška pri kopiranju.'); }
    document.body.removeChild(textarea);
}

function obrisiOznacenoShopping() {
    const selected = document.querySelectorAll('.shopping-checkbox:checked');
    if (selected.length === 0) { alert('Niste označili nijednu stavku za brisanje!'); return; }
    if (!confirm(`Da li ste sigurni da želite da obrišete ${selected.length} stavku/ke?`)) return;
    let shopping = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    const indices = Array.from(selected).map(cb => parseInt(cb.dataset.index));
    indices.sort((a, b) => b - a);
    indices.forEach(i => shopping.splice(i, 1));
    localStorage.setItem('shoppingList', JSON.stringify(shopping));
    renderShoppingList();
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
    
    if (productData.quantity === 0) {
        let shopping = JSON.parse(localStorage.getItem('shoppingList') || '[]');
        shopping.push({ product_name: productData.product_name, description: productData.description, quantity: productData.quantity, unit: productData.unit });
        localStorage.setItem('shoppingList', JSON.stringify(shopping));
        let zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
        const existingIndex = zalihe.findIndex(p => p.product_name === productData.product_name);
        if (existingIndex !== -1) { zalihe.splice(existingIndex, 1); localStorage.setItem('zalihe', JSON.stringify(zalihe)); }
        alert('🛒 Proizvod dodat u spisak potreba (količina 0)!');
        document.getElementById('pieceInput').value = '';
        document.getElementById('quantityInput').value = '1';
        document.getElementById('quantityInput').focus();
        if (typeof prikaziSveUnose === 'function') prikaziSveUnose();
        return;
    }
    
    let zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    const existingIndex = zalihe.findIndex(p => p.product_name === productData.product_name);
    if (existingIndex !== -1) { zalihe[existingIndex] = productData; } else { zalihe.push(productData); }
    localStorage.setItem('zalihe', JSON.stringify(zalihe));
    if (typeof prikaziSveUnose === 'function') prikaziSveUnose();
    document.getElementById('pieceInput').value = '';
    document.getElementById('quantityInput').value = '1';
    document.getElementById('quantityInput').focus();
    alert('✅ Proizvod sačuvan!');
}

// ===== GLAVNA FUNKCIJA ZA NAZAD / ODUSTANI =====
function handleBackAction() {
    console.log('⬅️ Trenutni ekran stanje:', currentScreenState);
    
    if (currentScreenState === 'dataEntry') {
        // Sa unosa podataka vrati na delove proizvoda (ili podkategorije ako delovi ne postoje)
        if (currentSubcategory) {
            renderProductParts(currentSubcategory);
        } else {
            renderSubcategories(currentCategory);
        }
    } else if (currentScreenState === 'productParts') {
        // Sa delova proizvoda vrati na podkategorije
        renderSubcategories(currentCategory);
    } else if (currentScreenState === 'subcategories') {
        // Sa podkategorija vrati na glavne kategorije
        renderCategories();
    } else if (currentScreenState === 'categories') {
        // Sa glavnih kategorija vrati na jezike
        showScreen('languageScreen');
        renderLanguages();
    } else {
        // Za inventar, spisak i ostalo vrati na glavne kategorije
        showScreen('mainScreen');
        renderCategories();
    }
}

// ===== 10. GLAVNI DOGAĐAJI =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM je spreman!');

    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() { triggerLogin(); });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const phoneField = document.getElementById('phoneInput');
            if (phoneField && document.activeElement === phoneField) {
                e.preventDefault();
                triggerLogin();
            }
        }
    });
    
    document.getElementById('exitLoginBtn')?.addEventListener('click', exitApp);
    document.getElementById('exitLangBtn')?.addEventListener('click', exitApp);
    document.getElementById('exitMainBtn')?.addEventListener('click', exitApp);

    // ===== BACK DUGME =====
    document.getElementById('backBtn')?.addEventListener('click', handleBackAction);

    document.getElementById('inventoryBtn')?.addEventListener('click', function() { renderInventory(); });
    document.getElementById('shoppingBtn')?.addEventListener('click', function() { renderShoppingList(); });

    console.log('✅ Svi događaji povezani!');
});

// ============================================
// GLOBALNA FUNKCIJA ZA LOGIN
// ============================================
function triggerLogin() {
    const phoneInput = document.getElementById('phoneInput');
    if (!phoneInput) return;
    const phone = phoneInput.value.trim();
    if (phone.length >= 9) {
        showScreen('languageScreen');
        renderLanguages();
    } else {
        alert('Unesite validan broj telefona (9+ cifara)!');
    }
}
