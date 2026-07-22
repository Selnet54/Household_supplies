<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Zalihe</title>
    <link rel="manifest" href="manifest.json">
    <link rel="apple-touch-icon" href="icons/icon-192.png">
    <meta name="theme-color" content="#1a237e">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <style>
        /* ===== OPŠTE ===== */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #1a237e; color: #333; min-height: 100vh; }
        .screen { min-height: 100vh; display: flex; justify-content: center; align-items: center; flex-direction: column; }

        /* ===== LOGIN ===== */
        .login-container { width: 100%; max-width: 550px; padding: 25px; }
        .login-box { background: #3E4095; border-radius: 20px; padding: 50px 40px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.6); }
        .logo-img { width: 130px; height: 130px; border-radius: 50%; background: #FFD700; padding: 15px; object-fit: contain; margin: 0 auto; display: block; }
        .logo-text { color: #FFD700; font-size: 40px; font-weight: bold; margin-top: 15px; }
        .login-box h2 { color: white; font-size: 30px; margin: 20px 0 25px 0; }
        .login-box input { width: 100%; padding: 20px; font-size: 26px; border: none; border-radius: 12px; text-align: center; margin-bottom: 20px; background: white; }
        .login-limits { display: flex; flex-direction: column; gap: 5px; margin: 15px 0; color: #FFD700; font-size: 16px; }
        .btn { width: 100%; padding: 18px; border: none; border-radius: 12px; font-size: 24px; font-weight: bold; cursor: pointer; margin-bottom: 12px; }
        .btn-green { background: #4CAF50; color: white; }
        .btn-orange { background: #FF9800; color: white; }
        .btn-red { background: #f44336; color: white; }

        /* ===== JEZICI ===== */
        .languages-container { width: 100%; max-width: 750px; padding: 25px; }
        .languages-box { background: #3E4095; border-radius: 20px; padding: 40px 30px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.6); }
        .languages-title { color: #FFD700; font-size: 16px; font-weight: bold; margin-bottom: 15px; line-height: 1.5; max-width: 600px; margin-left: auto; margin-right: auto; }
        .languages-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr; gap: 15px; margin: 15px 0; }
        .lang-btn-main { padding: 25px 12px; border: 3px solid #FFD700; border-radius: 16px; background: #3E4095; color: white; font-size: 22px; font-weight: bold; cursor: pointer; text-align: center; transition: all 0.3s; display: flex; flex-direction: column; align-items: center; gap: 10px; min-height: 140px; justify-content: center; }
        .lang-btn-main:hover { background: #FFD700; color: #1a237e; transform: scale(1.05); }
        .lang-btn-main img { width: 80px; height: 60px; border-radius: 8px; object-fit: cover; }
        .lang-btn-main .lang-name { font-size: 18px; }

        /* ===== HEADER ===== */
        .header { display: flex; background: #e0e0e0; padding: 12px; gap: 6px; width: 100%; flex-wrap: wrap; }
        .btn-header { flex: 1; padding: 16px 8px; border: none; border-radius: 8px; font-weight: bold; font-size: 22px; cursor: pointer; min-width: 80px; }
        .btn-back { background: #90caf9; }
        .btn-inventory { background: #81c784; }
        .btn-shopping { background: #ffd54f; }
        .btn-exit { background: #ef5350; color: white; }

        /* ===== KONTEJNER ===== */
        .container { max-width: 1000px; width: 95%; margin: 20px auto; background: white; border-radius: 16px; padding: 35px; box-shadow: 0 6px 25px rgba(0,0,0,0.4); flex: 1; overflow-y: auto; }
        .title { color: #1a237e; font-size: 36px; font-weight: bold; text-align: center; margin-bottom: 30px; }

        /* ===== KATEGORIJE ===== */
        .categories-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 18px; width: 100%; }
        .category-btn { padding: 45px 15px; border: none; border-radius: 16px; font-size: 26px; font-weight: bold; cursor: pointer; text-align: center; min-height: 140px; word-break: break-word; transition: transform 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
        .category-btn:hover { transform: scale(1.05); }

        /* ===== UNOS PODATAKA ===== */
        .row { display: flex; align-items: center; margin-bottom: 15px; gap: 15px; flex-wrap: wrap; }
        .row label { font-weight: bold; color: #1a237e; width: 160px; text-align: right; font-size: 22px; flex-shrink: 0; }
        .row input, .row select { flex: 1; padding: 16px; border: 2px solid #ddd; border-radius: 12px; font-size: 24px; min-width: 100px; background: white; }
        .row input:focus, .row select:focus { border-color: #1a237e; outline: none; }
        .inline-group { display: flex; gap: 12px; flex: 1; flex-wrap: wrap; align-items: center; }
        .inline-group label { width: auto; font-size: 18px; flex-shrink: 0; }
        .inline-group input, .inline-group select { flex: 1; min-width: 50px; }

        /* ===== ROK ISTIČE ===== */
        #expiryDisplay { padding: 16px; background: #f0f0f0; border-radius: 12px; font-weight: bold; color: #1a237e; text-align: center; font-size: 24px; min-width: 120px; max-width: 200px; }

        /* ===== DUGMAD ===== */
        .btn-group { display: flex; gap: 20px; margin-top: 25px; justify-content: center; }
        .btn-save { background: #4CAF50; color: white; border: none; padding: 18px 50px; border-radius: 12px; font-size: 26px; font-weight: bold; cursor: pointer; flex: 1; }
        .btn-cancel { background: #f44336; color: white; border: none; padding: 18px 50px; border-radius: 12px; font-size: 26px; font-weight: bold; cursor: pointer; flex: 1; }

        /* ===== TABELA ===== */
        .table-container { margin-top: 20px; border: 1px solid #ddd; border-radius: 12px; max-height: 250px; overflow-y: auto; }
        .table-title { background: #e3f2fd; padding: 16px; font-weight: bold; text-align: center; font-size: 22px; color: #1a237e; }
        .table-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 1.5fr; border-bottom: 1px solid #eee; }
        .table-row .cell { padding: 14px 6px; text-align: center; font-size: 18px; word-break: break-word; }
        .table-row.header-row { background: #f0f0f0; font-weight: bold; border-bottom: 2px solid #ccc; }

        @media (max-width: 600px) {
            .container { padding: 20px; margin: 10px; }
            .row { flex-direction: column; align-items: stretch; }
            .row label { width: 100%; text-align: left; font-size: 20px; }
            .row input, .row select { width: 100%; padding: 16px; font-size: 22px; }
            .inline-group { flex-direction: row; }
            .btn-group { flex-direction: column; }
            .btn-save, .btn-cancel { width: 100%; font-size: 24px; }
            .table-row { font-size: 16px; }
            .categories-grid { grid-template-columns: 1fr 1fr; }
            .languages-grid { grid-template-columns: 1fr 1fr 1fr; }
            .lang-btn-main { min-height: 100px; padding: 15px 8px; }
            .lang-btn-main img { width: 60px; height: 45px; }
            .login-box { padding: 30px 20px; }
            .logo-img { width: 100px; height: 100px; }
            .logo-text { font-size: 32px; }
        }
        @media (max-width: 400px) {
            .languages-grid { grid-template-columns: 1fr 1fr; }
            .categories-grid { grid-template-columns: 1fr 1fr; }
        }
    </style>
</head>
<body>

<!-- ========================================== -->
<!-- EKRAN 1: LOGIN -->
<!-- ========================================== -->
<div id="loginScreen" class="screen">
    <div class="login-container">
        <div class="login-box">
            <img src="icons/logo.png" alt="Zalihe" class="logo-img" id="logoImg" onerror="this.style.display='none'">
            <div class="logo-text">SUPPLIES</div>
            <div style="font-size:18px;color:#aaa;margin-bottom:15px;">Home inventory management</div>
            <h2>Login</h2>
            <input type="tel" id="phoneInput" placeholder="Enter phone number" maxlength="15">
            <button id="loginBtn" class="btn btn-green">ENTER</button>
            <button id="forgotBtn" class="btn btn-orange">Forgot your phone number?</button>
            <div class="login-limits">
                <span>📱 4: Maximum number of phone numbers.</span>
                <span>🔒 3: Maximum attempts</span>
            </div>
            <button id="exitLoginBtn" class="btn btn-red">EXIT</button>
        </div>
    </div>
</div>

<!-- ========================================== -->
<!-- EKRAN 2: JEZICI -->
<!-- ========================================== -->
<div id="languageScreen" class="screen" style="display:none;">
    <div class="languages-container">
        <div class="languages-box">
            <div class="languages-title" id="langTitle">
                Izaberite jezik / Choose Language / Sprache auswählen / Válasszon nyelvet / Виберіть мову / Выберите язык / 选择语言 / Elija idioma / Escolha o idioma / Choisir la langue
            </div>
            <div class="languages-grid" id="languageGrid"></div>
            <button id="exitLangBtn" class="btn btn-red" style="margin-top:20px;">EXIT</button>
        </div>
    </div>
</div>

<!-- ========================================== -->
<!-- EKRAN 3: GLAVNI -->
<!-- ========================================== -->
<div id="mainScreen" class="screen" style="display:none; flex-direction:column;">
    <div class="header">
        <button id="backBtn" class="btn-header btn-back">◀ <span id="backText">Nazad</span></button>
        <button id="inventoryBtn" class="btn-header btn-inventory">📦 <span id="invText">Zalihe</span></button>
        <button id="shoppingBtn" class="btn-header btn-shopping">🛒 <span id="shopText">Spisak</span></button>
        <button id="exitMainBtn" class="btn-header btn-exit">✕ EXIT</button>
    </div>
    <div class="container" id="mainContent"></div>
</div>

<script defer>
// ============================================
// SVE FUNKCIJE
// ============================================

// ===== 1. EXIT FUNKCIJA ZA SVE UREĐAJE =====
function exitApp() {
    if (confirm('Da li želite da zatvorite aplikaciju?')) {
        // Za Android PWA (instalirana aplikacija)
        if (window.navigator && window.navigator.app) {
            try {
                window.navigator.app.exitApp();
                return;
            } catch(e) {}
        }
        // Za browser
        try {
            window.close();
        } catch(e) {
            window.location.href = 'about:blank';
        }
        // Fallback - ako ništa ne radi
        setTimeout(function() {
            window.location.href = 'about:blank';
        }, 500);
    }
}

// ===== 2. MOBILNI - spreči zoom =====
document.addEventListener('gesturestart', function(e) { 
    e.preventDefault(); 
});

// ===== 3. JEZICI =====
const languages = [
    { code: 'sr', name: 'Srpski', flag: 'icons/jezici/srpski.png' },
    { code: 'en', name: 'English', flag: 'icons/jezici/engleski.png' },
    { code: 'de', name: 'Deutsch', flag: 'icons/jezici/nemacki.png' },
    { code: 'hu', name: 'Magyar', flag: 'icons/jezici/madjarski.png' },
    { code: 'uk', name: 'Українська', flag: 'icons/jezici/ukrajinski.png' },
    { code: 'ru', name: 'Русский', flag: 'icons/jezici/ruski.png' },
    { code: 'zh', name: '中文', flag: 'icons/jezici/mandarinski.png' },
    { code: 'es', name: 'Español', flag: 'icons/jezici/spanski.png' },
    { code: 'pt', name: 'Português', flag: 'icons/jezici/portugalski.png' },
    { code: 'fr', name: 'Français', flag: 'icons/jezici/francuski.png' }
];

// ===== 4. PREVODI =====
const translations = {
    sr: {
        nazad: "Nazad", stanje: "Zalihe", spisak: "Spisak",
        naziv_proizvoda: "Proizvod:", opis: "Opis:",
        komad: "Komada:", kolicina: "Količina:", jedinica_mere: "Jed. mere:",
        datum_unosa: "Datum unosa:", rok_trajanja: "Rok (meseci):",
        automatski_rok: "Rok ističe:", mesto_skladistenja: "Skladište:",
        unesi: "Unesi", odustani: "Odustani", pretrazi: "Pretraži",
        azuriraj: "Ažuriraj", obrisi: "Obriši",
        unos_podataka: "Unos podataka", pregled_unosa: "Pregled unosa",
        glavne_kategorije: "Glavne kategorije", podkategorije: "Podkategorije",
        delovi_proizvoda: "Delovi proizvoda",
        zamrzivac_1: "Zamrzivač 1", zamrzivac_2: "Zamrzivač 2", zamrzivac_3: "Zamrzivač 3",
        frizider: "Frižider", ostava: "Ostava", Ostalo: "Ostalo",
        kg: "kg", g: "g", kom: "kom", l: "l", ml: "ml", pak: "pak", kutija: "kutija",
        nema_proizvoda: "Nema proizvoda za prikaz", spisak_potreba: "Spisak potreba"
    },
    en: {
        nazad: "Back", stanje: "Inventory", spisak: "Shopping List",
        naziv_proizvoda: "Product:", opis: "Description:",
        komad: "Piece:", kolicina: "Quantity:", jedinica_mere: "Unit:",
        datum_unosa: "Entry Date:", rok_trajanja: "Shelf Life (months):",
        automatski_rok: "Auto Expiry:", mesto_skladistenja: "Storage:",
        unesi: "Enter", odustani: "Cancel", pretrazi: "Search",
        azuriraj: "Update", obrisi: "Delete",
        unos_podataka: "Data Entry", pregled_unosa: "Entry Review",
        glavne_kategorije: "Main Categories", podkategorije: "Subcategories",
        delovi_proizvoda: "Product Parts",
        zamrzivac_1: "Freezer 1", zamrzivac_2: "Freezer 2", zamrzivac_3: "Freezer 3",
        frizider: "Refrigerator", ostava: "Pantry", Ostalo: "Other",
        kg: "kg", g: "g", kom: "pcs", l: "l", ml: "ml", pak: "pck", kutija: "box",
        nema_proizvoda: "No products to display", spisak_potreba: "Shopping List"
    },
    de: {
        nazad: "Zurück", stanje: "Bestand", spisak: "Einkaufsliste",
        naziv_proizvoda: "Produkt:", opis: "Beschreibung:",
        komad: "Stück:", kolicina: "Menge:", jedinica_mere: "Einheit:",
        datum_unosa: "Eingangsdatum:", rok_trajanja: "Haltbarkeit (Monate):",
        automatski_rok: "Auto Ablauf:", mesto_skladistenja: "Lager:",
        unesi: "Eingeben", odustani: "Abbrechen", pretrazi: "Suchen",
        azuriraj: "Aktualisieren", obrisi: "Löschen",
        unos_podataka: "Dateneingabe", pregled_unosa: "Eingabeübersicht",
        glavne_kategorije: "Hauptkategorien", podkategorije: "Unterkategorien",
        delovi_proizvoda: "Produktteile",
        zamrzivac_1: "Gefrierschrank 1", zamrzivac_2: "Gefrierschrank 2", zamrzivac_3: "Gefrierschrank 3",
        frizider: "Kühlschrank", ostava: "Vorratskammer", Ostalo: "Andere",
        kg: "kg", g: "g", kom: "Stk", l: "l", ml: "ml", pak: "Pck", kutija: "Karton",
        nema_proizvoda: "Keine Produkte zum Anzeigen", spisak_potreba: "Einkaufsliste"
    },
    hu: {
        nazad: "Vissza", stanje: "Készlet", spisak: "Bevásárlólista",
        naziv_proizvoda: "Termék:", opis: "Leírás:",
        komad: "Darab:", kolicina: "Mennyiség:", jedinica_mere: "Mértékegység:",
        datum_unosa: "Beírás dátuma:", rok_trajanja: "Szavatosság (hónap):",
        automatski_rok: "Automatikus lejárat:", mesto_skladistenja: "Raktár:",
        unesi: "Bevitel", odustani: "Mégsem", pretrazi: "Keresés",
        azuriraj: "Frissítés", obrisi: "Törlés",
        unos_podataka: "Adatbevitel", pregled_unosa: "Bevitel áttekintése",
        glavne_kategorije: "Fő kategóriák", podkategorije: "Alkategóriák",
        delovi_proizvoda: "Termék részei",
        zamrzivac_1: "Mélyhűtő 1", zamrzivac_2: "Mélyhűtő 2", zamrzivac_3: "Mélyhűtő 3",
        frizider: "Hűtőszekrény", ostava: "Spájz", Ostalo: "Egyéb",
        kg: "kg", g: "g", kom: "db", l: "l", ml: "ml", pak: "csom", kutija: "doboz",
        nema_proizvoda: "Nincsenek megjeleníthető termékek", spisak_potreba: "Bevásárlólista"
    },
    uk: {
        nazad: "Назад", stanje: "Запаси", spisak: "Список",
        naziv_proizvoda: "Продукт:", opis: "Опис:",
        komad: "Штука:", kolicina: "Кількість:", jedinica_mere: "Од. виміру:",
        datum_unosa: "Дата внесення:", rok_trajanja: "Термін (місяці):",
        automatski_rok: "Авто термін:", mesto_skladistenja: "Сховище:",
        unesi: "Внести", odustani: "Скасувати", pretrazi: "Пошук",
        azuriraj: "Оновити", obrisi: "Видалити",
        unos_podataka: "Введення даних", pregled_unosa: "Огляд введення",
        glavne_kategorije: "Основні категорії", podkategorije: "Підкатегорії",
        delovi_proizvoda: "Частини продукту",
        zamrzivac_1: "Морозилка 1", zamrzivac_2: "Морозилка 2", zamrzivac_3: "Морозилка 3",
        frizider: "Холодильник", ostava: "Комора", Ostalo: "Інше",
        kg: "кг", g: "г", kom: "шт", l: "л", ml: "мл", pak: "уп", kutija: "кор",
        nema_proizvoda: "Немає продуктів для відображення", spisak_potreba: "Список потреб"
    },
    ru: {
        nazad: "Назад", stanje: "Запасы", spisak: "Список",
        naziv_proizvoda: "Продукт:", opis: "Описание:",
        komad: "Штука:", kolicina: "Количество:", jedinica_mere: "Ед. изм.:",
        datum_unosa: "Дата внесения:", rok_trajanja: "Срок (месяцы):",
        automatski_rok: "Авто срок:", mesto_skladistenja: "Склад:",
        unesi: "Внести", odustani: "Отмена", pretrazi: "Поиск",
        azuriraj: "Обновить", obrisi: "Удалить",
        unos_podataka: "Ввод данных", pregled_unosa: "Обзор ввода",
        glavne_kategorije: "Основные категории", podkategorije: "Подкатегории",
        delovi_proizvoda: "Части продукта",
        zamrzivac_1: "Морозилка 1", zamrzivac_2: "Морозилка 2", zamrzivac_3: "Морозилка 3",
        frizider: "Холодильник", ostava: "Кладовая", Ostalo: "Другое",
        kg: "кг", g: "г", kom: "шт", l: "л", ml: "мл", pak: "уп", kutija: "кор",
        nema_proizvoda: "Нет продуктов для отображения", spisak_potreba: "Список потребностей"
    },
    zh: {
        nazad: "返回", stanje: "库存", spisak: "购物清单",
        naziv_proizvoda: "产品:", opis: "描述:",
        komad: "件:", kolicina: "数量:", jedinica_mere: "单位:",
        datum_unosa: "录入日期:", rok_trajanja: "保质期(月):",
        automatski_rok: "自动到期:", mesto_skladistenja: "存储:",
        unesi: "输入", odustani: "取消", pretrazi: "搜索",
        azuriraj: "更新", obrisi: "删除",
        unos_podataka: "数据输入", pregled_unosa: "输入记录查看",
        glavne_kategorije: "主要类别", podkategorije: "子类别",
        delovi_proizvoda: "产品部件",
        zamrzivac_1: "冷冻柜 1", zamrzivac_2: "冷冻柜 2", zamrzivac_3: "冷冻柜 3",
        frizider: "冰箱", ostava: "储藏室", Ostalo: "其他",
        kg: "公斤", g: "克", kom: "件", l: "升", ml: "毫升", pak: "包", kutija: "盒",
        nema_proizvoda: "没有产品可显示", spisak_potreba: "购物清单"
    },
    es: {
        nazad: "Atrás", stanje: "Inventario", spisak: "Lista de Compras",
        naziv_proizvoda: "Producto:", opis: "Descripción:",
        komad: "Pieza:", kolicina: "Cantidad:", jedinica_mere: "Unidad:",
        datum_unosa: "Fecha de Entrada:", rok_trajanja: "Caducidad (meses):",
        automatski_rok: "Vencimiento Auto:", mesto_skladistenja: "Almacenamiento:",
        unesi: "Ingresar", odustani: "Cancelar", pretrazi: "Buscar",
        azuriraj: "Actualizar", obrisi: "Eliminar",
        unos_podataka: "Entrada de Datos", pregled_unosa: "Revisión de entrada",
        glavne_kategorije: "Categorías Principales", podkategorije: "Subcategorías",
        delovi_proizvoda: "Partes del Producto",
        zamrzivac_1: "Congelador 1", zamrzivac_2: "Congelador 2", zamrzivac_3: "Congelador 3",
        frizider: "Refrigerador", ostava: "Despensa", Ostalo: "Otro",
        kg: "kg", g: "g", kom: "pz", l: "l", ml: "ml", pak: "pq", kutija: "caja",
        nema_proizvoda: "No hay productos para mostrar", spisak_potreba: "Lista de Compras"
    },
    pt: {
        nazad: "Voltar", stanje: "Estoque", spisak: "Lista de Compras",
        naziv_proizvoda: "Produto:", opis: "Descrição:",
        komad: "Peça:", kolicina: "Quantidade:", jedinica_mere: "Unidade:",
        datum_unosa: "Data de Entrada:", rok_trajanja: "Validade (meses):",
        automatski_rok: "Validade Auto:", mesto_skladistenja: "Armazenamento:",
        unesi: "Inserir", odustani: "Cancelar", pretrazi: "Pesquisar",
        azuriraj: "Atualizar", obrisi: "Excluir",
        unos_podataka: "Entrada de Dados", pregled_unosa: "Revisão de entrada",
        glavne_kategorije: "Categorias Principais", podkategorije: "Subcategorias",
        delovi_proizvoda: "Partes do Produto",
        zamrzivac_1: "Congelador 1", zamrzivac_2: "Congelador 2", zamrzivac_3: "Congelador 3",
        frizider: "Geladeira", ostava: "Despensa", Ostalo: "Outro",
        kg: "kg", g: "g", kom: "pç", l: "l", ml: "ml", pak: "pc", kutija: "cx",
        nema_proizvoda: "Nenhum produto para exibir", spisak_potreba: "Lista de Compras"
    },
    fr: {
        nazad: "Retour", stanje: "Stock", spisak: "Liste de Courses",
        naziv_proizvoda: "Produit:", opis: "Description:",
        komad: "Pièce:", kolicina: "Quantité:", jedinica_mere: "Unité:",
        datum_unosa: "Date d'entrée:", rok_trajanja: "Durée (mois):",
        automatski_rok: "Expiration Auto:", mesto_skladistenja: "Stockage:",
        unesi: "Entrer", odustani: "Annuler", pretrazi: "Rechercher",
        azuriraj: "Mettre à jour", obrisi: "Supprimer",
        unos_podataka: "Saisie de Données", pregled_unosa: "Aperçu des saisies",
        glavne_kategorije: "Catégories Principales", podkategorije: "Sous-catégories",
        delovi_proizvoda: "Pièces du Produit",
        zamrzivac_1: "Congélateur 1", zamrzivac_2: "Congélateur 2", zamrzivac_3: "Congélateur 3",
        frizider: "Réfrigérateur", ostava: "Garde-manger", Ostalo: "Autre",
        kg: "kg", g: "g", kom: "pc", l: "l", ml: "ml", pak: "paq", kutija: "boîte",
        nema_proizvoda: "Aucun produit à afficher", spisak_potreba: "Liste de Courses"
    }
};

// ===== 5. BOJE (istovetne sa Python verzijom) =====
const categoryColors = {
    "Belo meso": "#FFE295",
    "Crveno meso": "#F1624B",
    "Sitna divljač": "#F59AA6",
    "Krupna divljač": "#E19E94",
    "Riba": "#00BBF1",
    "Mlečni proizvodi": "#ACE1F9",
    "Povrće": "#8FC74A",
    "Zimnica i kompoti": "#CC98C4",
    "Testo i Slatkiši": "#FFECAB",
    "Pića": "#F8E06D",
    "Hemija i higijena": "#98D6D2",
    "Ostalo": "#F58634"
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

const productPartsColors = {
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

// ===== 6. FUNKCIJE ZA BOJE =====
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

function getProductPartsColors(category) {
    const srList = mainCategories.sr;
    for (let i = 0; i < srList.length; i++) {
        if (category === mainCategories[currentLang]?.[i] || category === srList[i]) {
            return productPartsColors[srList[i]] || ['#FFEDB5', '#F2D382'];
        }
    }
    return ['#FFEDB5', '#F2D382'];
}

// ===== 7. GLAVNE KATEGORIJE (svi jezici) =====
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

// ===== 8. PODKATEGORIJE (svi jezici) =====
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
// ===== 10. TRENUTNO STANJE =====
let currentLang = 'sr';
let currentCategory = '';
let currentSubcategory = '';
let db = null;
let products = [];

// ===== 11. POMOĆNE FUNKCIJE =====
function t(key) {
    return translations[currentLang]?.[key] || key;
}

function getMainCategories() {
    return mainCategories[currentLang] || mainCategories.sr;
}

function getSubcategories(category) {
    const sub = subcategories[currentLang] || subcategories.sr;
    return sub[category] || ['Ostalo'];
}

function getProductParts(subcategory) {
    // Prvo probaj na trenutnom jeziku
    if (productParts[currentLang] && productParts[currentLang][subcategory]) {
        return productParts[currentLang][subcategory];
    }
    // Ako nema, probaj srpski
    if (productParts.sr && productParts.sr[subcategory]) {
        return productParts.sr[subcategory];
    }
    // Ako ni to nema, vrati ["Ostalo"]
    return ["Ostalo"];
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const screen = document.getElementById(screenId);
    if (screen) screen.style.display = 'flex';
}

function updateHeaderTexts() {
    document.getElementById('backText').textContent = t('nazad');
    document.getElementById('invText').textContent = t('stanje');
    document.getElementById('shopText').textContent = t('spisak');
}

// ===== 12. INDEKEDDB =====
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ZaliheDB', 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('products')) {
                db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('shopping')) {
                db.createObjectStore('shopping', { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

function saveProductToDB(product) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readwrite');
        const store = transaction.objectStore('products');
        const request = store.add(product);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getAllProducts() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readonly');
        const store = transaction.objectStore('products');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function deleteProductFromDB(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readwrite');
        const store = transaction.objectStore('products');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

function getShoppingList() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['shopping'], 'readonly');
        const store = transaction.objectStore('shopping');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function addToShoppingList(item) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['shopping'], 'readwrite');
        const store = transaction.objectStore('shopping');
        const request = store.add(item);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function deleteFromShoppingList(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['shopping'], 'readwrite');
        const store = transaction.objectStore('shopping');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ===== 13. RENDER FUNKCIJE =====
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
}

function selectLanguage(langCode) {
    currentLang = langCode;
    showScreen('mainScreen');
    updateHeaderTexts();
    renderCategories();
}

// ===== 14. GLAVNE KATEGORIJE =====
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
}

// ===== 15. PODKATEGORIJE =====
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
}

// ===== 16. DELOVI PROIZVODA =====
function renderProductParts(subcategory) {
    currentSubcategory = subcategory;
    const content = document.getElementById('mainContent');
    const parts = getProductParts(subcategory);
    const colors = getProductPartsColors(currentCategory);
    let html = `<div class="title">${subcategory}</div>`;
    html += `<div style="margin-bottom:15px;text-align:center;font-size:20px;color:#666;">${t('delovi_proizvoda')}</div>`;
    html += `<div class="categories-grid">`;
    if (parts && parts.length > 0) {
        parts.forEach((part, idx) => {
            const color = colors[idx % colors.length];
            html += `<button class="category-btn" style="background:${color};" onclick="renderDataEntry('${part}')">${part}</button>`;
        });
    } else {
        html += `<button class="category-btn" style="background:#ddd;" onclick="renderDataEntry('')">Unesite naziv</button>`;
    }
    html += `</div>`;
    content.innerHTML = html;
}

// ===== 17. UNOS PODATAKA =====
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
    
    // Proveri da li treba dodati u spisak potreba
    const shouldAddToShopping = checkCritical(productData);
    
    // Sačuvaj u bazu
    saveProductToDB(productData).then(id => {
        addProductToTable(productData);
        if (shouldAddToShopping) {
            addToShoppingList({
                product_name: productData.product_name,
                description: productData.description,
                quantity: productData.quantity,
                unit: productData.unit
            }).then(() => {
                alert('Proizvod je dodat u spisak potreba (kritična količina)!');
            }).catch(err => {});
        }
        document.getElementById('pieceInput').value = '';
        document.getElementById('quantityInput').value = '';
        document.getElementById('quantityInput').focus();
    }).catch(err => {
        alert('Greška pri čuvanju: ' + err.message);
    });
}

function checkCritical(product) {
    // Provera da li je količina kritična
    const qty = product.quantity;
    const unit = product.unit;
    if (qty === 0) return true;
    if (unit === 'g' && qty < 400) return true;
    if (unit === 'kg' && qty < 0.4) return true;
    if ((unit === 'kom' || unit === 'pcs') && qty <= 2) return true;
    return false;
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

// ===== 18. ZALIHE =====
function renderInventory() {
    const content = document.getElementById('mainContent');
    if (!content) return;
    
    getAllProducts().then(products => {
        let html = `<div class="title">${t('stanje')}</div>`;
        
        // Search
        html += `<div class="row" style="margin-bottom:15px;">
            <label>${t('pretrazi')}</label>
            <input type="text" id="searchInput" placeholder="..." oninput="filterInventory()" style="flex:1;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:18px;">
        </div>`;
        
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
        </div>`;
        
        if (products.length === 0) {
            html += `<div class="table-row"><div class="cell" style="grid-column:span 7;padding:30px;color:#999;">${t('nema_proizvoda')}</div></div>`;
        } else {
            products.forEach(p => {
                const expiry = new Date(p.entry_date);
                expiry.setMonth(expiry.getMonth() + p.shelf_life_months);
                const expiryDisplay = expiry.toLocaleDateString('sr-RS', { month: '2-digit', year: '2-digit' });
                // Kritično označavanje
                const isCritical = checkCritical(p);
                const bgColor = isCritical ? '#F9AA65' : '';
                html += `<div class="table-row" data-product-id="${p.id}" style="background:${bgColor};">
                    <div class="cell">${p.product_name}</div>
                    <div class="cell">${p.description}</div>
                    <div class="cell">${p.piece}</div>
                    <div class="cell">${p.quantity}</div>
                    <div class="cell">${p.unit}</div>
                    <div class="cell">${expiryDisplay}</div>
                    <div class="cell">${p.storage_location}</div>
                </div>`;
            });
        }
        html += `</div></div>`;
        content.innerHTML = html;
    }).catch(err => {
        content.innerHTML = `<div class="title">${t('stanje')}</div><div style="text-align:center;padding:30px;color:red;">Greška: ${err.message}</div>`;
    });
}

function filterInventory() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#inventoryTable .table-row:not(.header-row)');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
    });
}

// ===== 19. SPISAK POTREBA =====
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

// ===== 20. DOGAĐAJI =====
document.addEventListener('DOMContentLoaded', function() {
    // 1. Otvori bazu
    openDB().then(database => {
        db = database;
        console.log('Baza otvorena');
    }).catch(err => {
        console.error('Greška pri otvaranju baze:', err);
    });
    
    // 2. Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .catch(err => console.log('SW greška: ', err));
    }
    
    // 3. Login
    showScreen('loginScreen');
    
    document.getElementById('loginBtn').addEventListener('click', function() {
        const phone = document.getElementById('phoneInput').value.trim();
        if (phone.length >= 9) {
            showScreen('languageScreen');
            renderLanguages();
        } else {
            alert('Unesite validan broj telefona!');
        }
    });
    
    document.getElementById('phoneInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') document.getElementById('loginBtn').click();
    });
    
    // 4. Exit dugmad - sada koriste exitApp()
    document.getElementById('exitLoginBtn').addEventListener('click', exitApp);
    document.getElementById('exitLangBtn').addEventListener('click', exitApp);
    document.getElementById('exitMainBtn').addEventListener('click', exitApp);
    
    // 5. Back dugme - vraća na jezike
    document.getElementById('backBtn').addEventListener('click', function() {
        showScreen('languageScreen');
        renderLanguages();
    });
    
    // 6. Zalihe dugme
    document.getElementById('inventoryBtn').addEventListener('click', function() {
        renderInventory();
    });
    
    // 7. Spisak dugme
    document.getElementById('shoppingBtn').addEventListener('click', function() {
        renderShoppingList();
       });
    
    // 7. Spisak dugme
    document.getElementById('shoppingBtn').addEventListener('click', function() {
        renderShoppingList();
    });
</script>

<script>
    // ============================================
    // SVE FUNKCIJE ZA DUGMAD
    // ============================================
    document.addEventListener('DOMContentLoaded', function() {
        console.log('✅ Stranica učitana!');

        // 1. LOGIN DUGME
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', function() {
                const phone = document.getElementById('phoneInput').value.trim();
                if (phone.length >= 9) {
                    document.getElementById('loginScreen').style.display = 'none';
                    document.getElementById('languageScreen').style.display = 'flex';
                    if (typeof renderLanguages === 'function') {
                        renderLanguages();
                    } else {
                        alert('renderLanguages nije definisana!');
                    }
                } else {
                    alert('Unesite validan broj telefona (9+ cifara)!');
                }
            });
        }

        // 2. EXIT DUGMAD
        const exitBtns = document.querySelectorAll('#exitLoginBtn, #exitLangBtn, #exitMainBtn');
        exitBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (confirm('Da li želite da zatvorite aplikaciju?')) {
                    window.close();
                }
            });
        });

        // 3. BACK DUGME
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                document.getElementById('languageScreen').style.display = 'flex';
                document.getElementById('mainScreen').style.display = 'none';
                if (typeof renderLanguages === 'function') {
                    renderLanguages();
                }
            });
        }

        // 4. INVENTORY DUGME
        const inventoryBtn = document.getElementById('inventoryBtn');
        if (inventoryBtn) {
            inventoryBtn.addEventListener('click', function() {
                if (typeof renderInventory === 'function') {
                    renderInventory();
                } else {
                    alert('renderInventory nije definisana!');
                }
            });
        }

        // 5. SHOPPING DUGME (duplirano, ali ostavljamo)
        const shoppingBtn = document.getElementById('shoppingBtn');
        if (shoppingBtn) {
            shoppingBtn.addEventListener('click', function() {
                if (typeof renderShoppingList === 'function') {
                    renderShoppingList();
                } else {
                    alert('renderShoppingList nije definisana!');
                }
            });
        }

        console.log('✅ Svi događaji povezani!');
    });   // <-- OVO ZATVARA document.addEventListener
</script>   // <-- OVO ZATVARA SCRIPT BLOK

</body>
</html>
