// ============================================
// PUNI SCRIPT ZA APLIKACIJU - HIJERARHIJSKI NAZAD
// ============================================
console.log('✅ Script.js je učitan!');
// ============================================
// UCITAVANJE VOICE COMMANDS
// ============================================
console.log('🎤 Učitavam voiceCommands.js...');

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
    setTimeout(() => { closeModernAlert(); }, 2000);
}

function closeModernAlert() {
    const alertDiv = document.getElementById('modernAlert');
    if (alertDiv) {
        alertDiv.classList.remove('active');
        alertDiv.style.display = 'none';
    }
}

// ===== MODERNI CONFIRM (DODAJ OVO OVDE) =====
let confirmCallback = null;

function showModernConfirm(title, message, icon = '⚠️', onYes, onNo) {
    // Proveri da li modernConfirm postoji u HTML-u
    const confirmDiv = document.getElementById('modernConfirm');
    if (!confirmDiv) {
        // Ako nema, koristi običan confirm
        if (confirm(message)) {
            onYes();
        } else {
            onNo();
        }
        return;
    }
    
    document.getElementById('confirmIcon').textContent = icon;
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('modernConfirm').style.display = 'flex';
    document.getElementById('modernConfirm').classList.add('active');
    
    confirmCallback = {
        onYes: onYes || function() {},
        onNo: onNo || function() {}
    };
}

function closeModernConfirm() {
    const confirmDiv = document.getElementById('modernConfirm');
    if (confirmDiv) {
        confirmDiv.classList.remove('active');
        confirmDiv.style.display = 'none';
    }
    confirmCallback = null;
}

// Poveži dugmad (ako postoje) - OVO DODAJ U DOMContentLoaded
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
        kg: "kg", g: "g", kom: "kom", l: "l", ml: "ml", pak: "pak", kutija: "kutija",
        error: "Greška",
        invalid_input: "Neispravan unos",
        please_enter_phone: "Unesite validan broj telefona (9+ cifara)!",
        success: "Uspešno",
        product_saved: "Proizvod sačuvan!",
        product_updated: "Proizvod ažuriran!",
        no_selection: "Nema odabira",
        no_items_selected: "Niste označili nijednu stavku!",
        missing_info: "Nedostaju podaci",
        enter_product_name: "Unesite naziv proizvoda!",
        enter_quantity: "Unesite količinu!",
        shopping_moved: "Proizvod prebačen u spisak potreba (količina 0)!",
        copied: "Lista je kopirana!",
        copy_error: "Greška pri kopiranju.",
        delete_from_shopping: "Obrišite stavku sa spiska?",
        delete_confirm: "Da li ste sigurni da želite da obrišete {count} stavku/ke?",
        delete_confirm_title: "Potvrda brisanja",
        list_empty: "Spisak je prazan",
        choiceTitle: "Način unosa podataka",
        voiceInput: "Glasovni unos",
        manualInput: "Ručni unos",
        exit: "IZLAZ",
        voiceControl: "Glasovna kontrola",
        inventory: "Zalihe",
        shopping: "Spisak potreba",
        add: "Dodaj proizvod",
        back: "Nazad",
        voiceStatus: "🎤 Reci: 'Zalihe', 'Spisak', 'Dodaj proizvod' ili 'Izlaz'",
        voiceDesc: "Govori i uneću",
        manualDesc: "Unesi podatke ručno"
        
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
        kg: "kg", g: "g", kom: "pcs", l: "l", ml: "ml", pak: "pck", kutija: "box",
        error: "Error",
        invalid_input: "Invalid Input",
        please_enter_phone: "Please enter a valid phone number (9+ digits)!",
        success: "Success",
        product_saved: "Product saved!",
        product_updated: "Product updated!",
        no_selection: "No Selection",
        no_items_selected: "You have not selected any items!",
        missing_info: "Missing Information",
        enter_product_name: "Please enter a product name!",
        enter_quantity: "Please enter a valid quantity!",
        shopping_moved: "Product moved to shopping list (quantity 0)!",
        copied: "List copied to clipboard!",
        copy_error: "Failed to copy list!",
        delete_from_shopping: "Delete item from shopping list?",
        delete_confirm: "Are you sure you want to delete {count} item(s)?",
        delete_confirm_title: "Delete Confirmation",
        choiceTitle: "Data entry method",
        voiceInput: "Voice input",
        manualInput: "Manual input",
        exit: "EXIT",
        voiceControl: "Voice control",
        inventory: "Inventory",
        shopping: "Shopping list",
        add: "Add product",
        back: "Back",
        list_empty: "Shopping list is empty",
        choiceTitle: "Data entry method",
        voiceInput: "Voice input",
        manualInput: "Manual input",
        exit: "EXIT",
        voiceControl: "Voice control",
        inventory: "Inventory",
        shopping: "Shopping list",
        add: "Add product",
        back: "Back",
        voiceStatus: "🎤 Say: 'Inventory', 'Shopping List', 'Add Product', or 'Exit'",
        voiceDesc: "Speak and I will enter",
        manualDesc: "Type data manually"
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
        kg: "kg", g: "g", kom: "Stk", l: "l", ml: "ml", pak: "Pck", kutija: "Karton",
        error: "Fehler",
        invalid_input: "Ungültige Eingabe",
        please_enter_phone: "Bitte geben Sie eine gültige Telefonnummer ein (9+ Ziffern)!",
        success: "Erfolg",
        product_saved: "Produkt gespeichert!",
        product_updated: "Produkt aktualisiert!",
        no_selection: "Keine Auswahl",
        no_items_selected: "Sie haben keine Elemente ausgewählt!",
        missing_info: "Fehlende Informationen",
        enter_product_name: "Bitte geben Sie einen Produktnamen ein!",
        enter_quantity: "Bitte geben Sie eine gültige Menge ein!",
        shopping_moved: "Produkt wurde zur Einkaufsliste verschoben (Menge 0)!",
        copied: "Liste kopiert!",
        copy_error: "Fehler beim Kopieren!",
        delete_from_shopping: "Element aus der Einkaufsliste löschen?",
        delete_confirm: "Sind Sie sicher, dass Sie {count} Element(e) löschen möchten?",
        delete_confirm_title: "Löschbestätigung",
        list_empty: "Einkaufsliste ist leer",
        choiceTitle: "Dateneingabemethode",
        voiceInput: "Spracheingabe",
        manualInput: "Manuelle Eingabe",
        exit: "BEENDEN",
        voiceControl: "Sprachsteuerung",
        inventory: "Bestand",
        shopping: "Einkaufsliste",
        add: "Produkt hinzufügen",
        back: "Zurück",
        voiceStatus: "🎤 Sage: 'Bestand', 'Einkaufsliste', 'Produkt hinzufügen' oder 'Beenden'",
        voiceDesc: "Sprich und ich werde eingeben",
        manualDesc: "Daten manuell eingeben"
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
        kg: "kg", g: "g", kom: "db", l: "l", ml: "ml", pak: "csom", kutija: "doboz",
        error: "Hiba",
        invalid_input: "Érvénytelen bevitel",
        please_enter_phone: "Kérem, adjon meg egy érvényes telefonszámot (9+ számjegy)!",
        success: "Siker",
        product_saved: "Termék elmentve!",
        product_updated: "Termék frissítve!",
        no_selection: "Nincs kijelölés",
        no_items_selected: "Nem jelölt ki egyetlen elemet sem!",
        missing_info: "Hiányzó információk",
        enter_product_name: "Kérem, adja meg a termék nevét!",
        enter_quantity: "Kérem, adjon meg érvényes mennyiséget!",
        shopping_moved: "Termék áthelyezve a bevásárlólistába (mennyiség 0)!",
        copied: "Lista másolva!",
        copy_error: "Hiba a másolás során!",
        delete_from_shopping: "Törli az elemet a bevásárlólistából?",
        delete_confirm: "Biztosan törölni szeretné {count} elemet?",
        delete_confirm_title: "Törlés megerősítése",
        list_empty: "A bevásárlólista üres",
        choiceTitle: "Adatbevitel módja",
        voiceInput: "Hangalapú bevitel",
        manualInput: "Kézi bevitel",
        exit: "KILÉPÉS",
        voiceControl: "Hangvezérlés",
        inventory: "Készlet",
        shopping: "Bevásárlólista",
        add: "Termék hozzáadása",
        back: "Vissza",
        voiceStatus: "🎤 Mondd: 'Készlet', 'Bevásárlólista', 'Termék hozzáadása' vagy 'Kilépés'",
        voiceDesc: "Beszélj és beírom",
        manualDesc: "Adatok kézi bevitele"
            
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
        kg: "кг", g: "г", kom: "шт", l: "л", ml: "мл", pak: "уп", kutija: "кор",
        error: "Помилка",
        invalid_input: "Невірне введення",
        please_enter_phone: "Будь ласка, введіть дійсний номер телефону (9+ цифр)!",
        success: "Успішно",
        product_saved: "Продукт збережено!",
        product_updated: "Продукт оновлено!",
        no_selection: "Немає вибору",
        no_items_selected: "Ви не вибрали жодного елемента!",
        missing_info: "Відсутня інформація",
        enter_product_name: "Будь ласка, введіть назву продукту!",
        enter_quantity: "Будь ласка, введіть дійсну кількість!",
        shopping_moved: "Продукт перенесено до списку потреб (кількість 0)!",
        copied: "Список скопійовано!",
        copy_error: "Помилка копіювання!",
        delete_from_shopping: "Видалити елемент зі списку потреб?",
        delete_confirm: "Ви впевнені, що хочете видалити {count} елемент(ів)?",
        delete_confirm_title: "Підтвердження видалення",
        list_empty: "Список потреб порожній",
        choiceTitle: "Спосіб введення даних",
        voiceInput: "Голосове введення",
        manualInput: "Ручне введення",
        exit: "ВИХІД",
        voiceControl: "Голосове керування",
        inventory: "Запаси",
        shopping: "Список покупок",
        add: "Додати товар",
        back: "Назад",
        voiceStatus: "🎤 Скажіть: 'Запаси', 'Список', 'Додати товар' або 'Вихід'",
        voiceDesc: "Говоріть і я введу",
        manualDesc: "Введіть дані вручну"
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
        kg: "кг", g: "г", kom: "шт", l: "л", ml: "мл", pak: "уп", kutija: "кор",
        error: "Ошибка",
        invalid_input: "Неверный ввод",
        please_enter_phone: "Пожалуйста, введите действительный номер телефона (9+ цифр)!",
        success: "Успешно",
        product_saved: "Продукт сохранён!",
        product_updated: "Продукт обновлён!",
        no_selection: "Нет выбора",
        no_items_selected: "Вы не выбрали ни одного элемента!",
        missing_info: "Отсутствует информация",
        enter_product_name: "Пожалуйста, введите название продукта!",
        enter_quantity: "Пожалуйста, введите действительное количество!",
        shopping_moved: "Продукт перемещён в список потребностей (количество 0)!",
        copied: "Список скопирован!",
        copy_error: "Ошибка копирования!",
        delete_from_shopping: "Удалить элемент из списка потребностей?",
        delete_confirm: "Вы уверены, что хотите удалить {count} элемент(ов)?",
        delete_confirm_title: "Подтверждение удаления",
        list_empty: "Список потребностей пуст",
        choiceTitle: "Способ ввода данных",
        voiceInput: "Голосовой ввод",
        manualInput: "Ручной ввод",
        exit: "ВЫХОД",
        voiceControl: "Голосовое управление",
        inventory: "Запасы",
        shopping: "Список покупок",
        add: "Добавить товар",
        back: "Назад",
        voiceStatus: "🎤 Скажите: 'Запасы', 'Список', 'Добавить товар' или 'Выход'",
        voiceDesc: "Говорите и я введу",
        manualDesc: "Введите данные вручную"
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
        kg: "公斤", g: "克", kom: "件", l: "升", ml: "毫升", pak: "包", kutija: "盒",
        error: "错误",
        invalid_input: "无效输入",
        please_enter_phone: "请输入有效的电话号码（9位以上）！",
        success: "成功",
        product_saved: "产品已保存！",
        product_updated: "产品已更新！",
        no_selection: "未选择",
        no_items_selected: "您未选择任何项目！",
        missing_info: "信息缺失",
        enter_product_name: "请输入产品名称！",
        enter_quantity: "请输入有效数量！",
        shopping_moved: "产品已移至购物清单（数量0）！",
        copied: "列表已复制！",
        copy_error: "复制失败！",
        delete_from_shopping: "从购物清单中删除此项目？",
        delete_confirm: "您确定要删除 {count} 个项目吗？",
        delete_confirm_title: "删除确认",
        list_empty: "购物清单为空",
        choiceTitle: "数据输入方式",
        voiceInput: "语音输入",
        manualInput: "手动输入",
        exit: "退出",
        voiceControl: "语音控制",
        inventory: "库存",
        shopping: "购物清单",
        add: "添加产品",
        back: "返回",
        voiceStatus: "🎤 说：'库存'，'购物清单'，'添加产品'或'退出'",
        voiceDesc: "说话我会输入",
        manualDesc: "手动输入数据"
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
        kg: "kg", g: "g", kom: "pz", l: "l", ml: "ml", pak: "pq", kutija: "caja",
        error: "Error",
        invalid_input: "Entrada inválida",
        please_enter_phone: "¡Por favor, introduzca un número de teléfono válido (9+ dígitos)!",
        success: "Éxito",
        product_saved: "¡Producto guardado!",
        product_updated: "¡Producto actualizado!",
        no_selection: "Sin selección",
        no_items_selected: "¡No ha seleccionado ningún elemento!",
        missing_info: "Información faltante",
        enter_product_name: "¡Por favor, introduzca el nombre del producto!",
        enter_quantity: "¡Por favor, introduzca una cantidad válida!",
        shopping_moved: "¡Producto movido a la lista de compras (cantidad 0)!",
        copied: "¡Lista copiada!",
        copy_error: "¡Error al copiar!",
        delete_from_shopping: "¿Eliminar elemento de la lista de compras?",
        delete_confirm: "¿Está seguro de que desea eliminar {count} elemento(s)?",
        delete_confirm_title: "Confirmación de eliminación",
        list_empty: "La lista de compras está vacía",
        choiceTitle: "Método de entrada de datos",
        voiceInput: "Entrada de voz",
        manualInput: "Entrada manual",
        exit: "SALIR",
        voiceControl: "Control de voz",
        inventory: "Inventario",
        shopping: "Lista de compras",
        add: "Agregar producto",
        back: "Volver",
        voiceStatus: "🎤 Di: 'Inventario', 'Lista de compras', 'Agregar producto' o 'Salir'",
        voiceDesc: "Habla y lo ingresaré",
        manualDesc: "Ingresar datos manualmente"
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
        kg: "kg", g: "g", kom: "pç", l: "l", ml: "ml", pak: "pc", kutija: "cx",
        error: "Erro",
        invalid_input: "Entrada inválida",
        please_enter_phone: "Por favor, insira um número de telefone válido (9+ dígitos)!",
        success: "Sucesso",
        product_saved: "Produto guardado!",
        product_updated: "Produto atualizado!",
        no_selection: "Sem seleção",
        no_items_selected: "Não selecionou nenhum item!",
        missing_info: "Informação em falta",
        enter_product_name: "Por favor, insira o nome do produto!",
        enter_quantity: "Por favor, insira uma quantidade válida!",
        shopping_moved: "Produto movido para a lista de compras (quantidade 0)!",
        copied: "Lista copiada!",
        copy_error: "Erro ao copiar!",
        delete_from_shopping: "Eliminar item da lista de compras?",
        delete_confirm: "Tem a certeza que deseja eliminar {count} item(ns)?",
        delete_confirm_title: "Confirmação de exclusão",
        list_empty: "A lista de compras está vazia",
        choiceTitle: "Método de entrada de dados",
        voiceInput: "Entrada de voz",
        manualInput: "Entrada manual",
        exit: "SAIR",
        voiceControl: "Controle de voz",
        inventory: "Estoque",
        shopping: "Lista de compras",
        add: "Adicionar produto",
        back: "Voltar",
        voiceStatus: "🎤 Diga: 'Estoque', 'Lista de compras', 'Adicionar produto' ou 'Sair'",
        voiceDesc: "Fale e eu vou entrar",
        manualDesc: "Inserir dados manualmente"
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
        kg: "kg", g: "g", kom: "pc", l: "l", ml: "ml", pak: "paq", kutija: "boîte",
        error: "Erreur",
        invalid_input: "Saisie invalide",
        please_enter_phone: "Veuillez entrer un numéro de téléphone valide (9+ chiffres)!",
        success: "Succès",
        product_saved: "Produit enregistré!",
        product_updated: "Produit mis à jour!",
        no_selection: "Aucune sélection",
        no_items_selected: "Vous n'avez sélectionné aucun élément!",
        missing_info: "Informations manquantes",
        enter_product_name: "Veuillez entrer le nom du produit!",
        enter_quantity: "Veuillez entrer une quantité valide!",
        shopping_moved: "Produit déplacé vers la liste de courses (quantité 0)!",
        copied: "Liste copiée!",
        copy_error: "Erreur lors de la copie!",
        delete_from_shopping: "Supprimer l'élément de la liste de courses?",
        delete_confirm: "Êtes-vous sûr de vouloir supprimer {count} élément(s)?",
        delete_confirm_title: "Confirmation de suppression",
        list_empty: "La liste de courses est vide",
        choiceTitle: "Méthode de saisie des données",
        voiceInput: "Saisie vocale",
        manualInput: "Saisie manuelle",
        exit: "QUITTER",
        voiceControl: "Commande vocale",
        inventory: "Stock",
        shopping: "Liste de courses",
        add: "Ajouter un produit",
        back: "Retour",
        voiceStatus: "🎤 Dites: 'Stock', 'Liste de courses', 'Ajouter un produit' ou 'Quitter'",
        voiceDesc: "Parlez et je vais entrer",
        manualDesc: "Saisir les données manuellement"
    }
};
// ===== POMOĆNA FUNKCIJA ZA PREVODE =====
function t(key) {
    return translations[currentLang]?.[key] || key;
}

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
// ===== 7. POMOĆNE FUNKCIJE =====
function t(key) {
    return translations[currentLang]?.[key] || key;
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

   // ============================================
// 1. FUNKCIJA ZA AŽURIRANJE TEKSTOVA
// ============================================
function updateChoiceScreenTexts() {
    const t = translations[currentLang] || translations['en']; 

    // EKRAN 3: Izbor načina unosa
    if(document.getElementById('choiceTitleText')) document.getElementById('choiceTitleText').innerText = t.choiceTitle || "How do you want to enter data?";
    if(document.getElementById('voiceTitleText')) document.getElementById('voiceTitleText').innerText = t.voiceInput;
    if(document.getElementById('voiceDescText')) document.getElementById('voiceDescText').innerText = t.voiceDesc || "Speak and I will enter";
    if(document.getElementById('manualTitleText')) document.getElementById('manualTitleText').innerText = t.manualInput;
    if(document.getElementById('manualDescText')) document.getElementById('manualDescText').innerText = t.manualDesc || "Type data manually";
    if(document.getElementById('exitChoiceBtn')) document.getElementById('exitChoiceBtn').innerText = "✖ " + (t.exit || "EXIT");

    // EKRAN 4: Zvučni meni
    if(document.getElementById('voiceMenuTitleText')) document.getElementById('voiceMenuTitleText').innerText = "🎤 " + (t.voiceControl || "Voice Control");
    if(document.getElementById('invMenuText')) document.getElementById('invMenuText').innerText = t.inventory;
    if(document.getElementById('shopMenuText')) document.getElementById('shopMenuText').innerText = t.shopping;
    if(document.getElementById('addMenuText')) document.getElementById('addMenuText').innerText = t.add;
    if(document.getElementById('exitMenuText')) document.getElementById('exitMenuText').innerText = t.exit;
    if(document.getElementById('backVoiceText')) document.getElementById('backVoiceText').innerText = "◀ " + (t.back || "Back");
    
    // voiceStatus
    const voiceStatus = document.getElementById('voiceStatus');
    if (voiceStatus) {
        voiceStatus.innerHTML = t.voiceStatus || '🎤 Say: "Inventory", "Shopping List", "Add Product", or "Exit"';
    }
}

// ============================================
// RENDER FUNKCIJE
// ============================================
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

// ============================================
// SELECT LANGUAGE - GLAVNA FUNKCIJA
// ============================================
function selectLanguage(langCode) {
    currentLang = langCode;
    updateChoiceScreenTexts();
    showScreen('choiceScreen');
    console.log('🌍 Izabran jezik:', langCode);
}

// ============================================
// GLAVNI DOGAĐAJI
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM je spreman!');

    // LOGIN DUGME
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🖱️ Klik na ENTER dugme');
            triggerLogin();
        });
        console.log('✅ Login dugme povezano');
    }

    // ENTER TASTER
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
    }

    // EXIT DUGME
    const exitBtn = document.getElementById('exitLoginBtn');
    if (exitBtn) {
        exitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🖱️ Exit klik');
            exitApp();
        });
        console.log('✅ Exit dugme povezano');
    }

    console.log('✅ Svi događaji povezani!');
});

// ============================================
// GLOBALNA FUNKCIJA ZA LOGIN
// ============================================
function triggerLogin() {
    console.log("🔐 triggerLogin pozvan!");
    const phoneInput = document.getElementById('phoneInput');
    if (!phoneInput) {
        showModernAlert(t('error'), 'Phone input not found!', '❌');
        return;
    }
    const phone = phoneInput.value.trim();
    console.log("📱 Unet broj:", phone);
    if (phone.length >= 9) {
        console.log("✅ Login uspešan");
        showScreen('languageScreen');
        renderLanguages();
    } else {
        showModernAlert(t('invalid_input'), t('please_enter_phone'), '📱');
    }
}

/// ============================================
// START VOICE RECOGNITION (POPRAVLJENO)
// ============================================
let recognition = null;

function startVoiceRecognition() {
    console.log('🎤 startVoiceRecognition pozvan');
    
    const status = document.getElementById('voiceStatus');
    if (!status) {
        console.error('❌ voiceStatus element not found');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        status.innerHTML = '❌ Speech recognition not supported';
        console.error('❌ Speech Recognition not supported');
        return;
    }
    
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    
    recognition = new SpeechRecognition();
    
    const langMap = {
        'sr': 'sr-RS', 'en': 'en-US', 'de': 'de-DE', 'hu': 'hu-HU',
        'uk': 'uk-UA', 'ru': 'ru-RU', 'zh': 'zh-CN', 'es': 'es-ES',
        'pt': 'pt-PT', 'fr': 'fr-FR'
    };
    
    recognition.lang = langMap[currentLang] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;  // ⭐ VAŽNO: prima privremene rezultate
    
    recognition.onstart = function() {
        console.log('🎤 Mikrofon aktivan na:', recognition.lang);
        status.innerHTML = '🎤 Listening... (speak now)';
        status.style.color = '#4FC3F7';
    };
    
    // ⭐ OVO JE POPRAVLJENI onresult - IGNORIŠE "k" dok govoriš
    recognition.onresult = function(event) {
        console.log('📝 Rezultati:', event.results);
        
        const last = event.results.length - 1;
        const result = event.results[last];
        
        // ⭐ IGNORIŠI INTERIM REZULTATE (još uvek govori)
        if (!result.isFinal) {
            console.log('⏳ Još uvek govori... (interim)');
            return;
        }
        
        const text = result[0].transcript.trim();
        console.log('🎤 Prepoznato (finalno):', text);
        status.innerHTML = `🗣️ You said: "${text}"`;
        
        // ⭐ POZOVI voiceCommand SAMO ZA FINALNE REZULTATE
        voiceCommand(text);
    };
    
    recognition.onerror = function(event) {
        console.warn('⚠️ Speech error:', event.error);
        if (event.error === 'not-allowed') {
            status.innerHTML = '❌ Please allow microphone access';
        } else {
            status.innerHTML = `❌ Error: ${event.error}`;
        }
        status.style.color = '#f44336';
    };
    
    recognition.onend = function() {
        console.log('🎤 Mikrofon zaustavljen');
        status.innerHTML = '🎤 Click the button to speak again';
        status.style.color = '#aaa';
    };
    
    try {
        recognition.start();
        console.log('✅ Mikrofon startovan');
    } catch(e) {
        console.error('❌ Greška:', e);
        status.innerHTML = '❌ Failed to start microphone';
    }
}

// ============================================
// RENDER INVENTORY - ZALIHE
// ============================================
function renderInventory() {
    currentScreenState = 'inventory';
    const content = document.getElementById('mainContent');
    if (!content) return;
    
    // Uzmi podatke iz localStorage
    let products = JSON.parse(localStorage.getItem('products') || '[]');
    
    if (products.length === 0) {
        content.innerHTML = `
            <div class="title">${t('stanje')}</div>
            <div style="text-align:center;padding:40px;color:#999;font-size:18px;">
                📦 ${t('nema_proizvoda')}
            </div>
        `;
        return;
    }
    
    let html = `<div class="title">${t('stanje')}</div>`;
    html += `<div style="overflow-x:auto;">`;
    html += `<table style="width:100%;border-collapse:collapse;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">`;
    
    // Zaglavlje
    html += `<thead style="background:#1a237e;color:white;">`;
    html += `<tr>`;
    html += `<th style="padding:12px;text-align:left;">${t('naziv_proizvoda')}</th>`;
    html += `<th style="padding:12px;text-align:left;">${t('kolicina')}</th>`;
    html += `<th style="padding:12px;text-align:left;">${t('jedinica_mere')}</th>`;
    html += `<th style="padding:12px;text-align:left;">${t('mesto_skladistenja')}</th>`;
    html += `<th style="padding:12px;text-align:center;">Akcije</th>`;
    html += `</tr>`;
    html += `</thead>`;
    html += `<tbody>`;
    
    products.forEach((product, index) => {
        const qty = product.kolicina || product.quantity || 0;
        if (qty <= 0) return; // Preskoči ako je količina 0
        
        html += `<tr style="border-bottom:1px solid #eee;">`;
        html += `<td style="padding:12px;"><strong>${product.naziv || product.name || 'N/A'}</strong></td>`;
        html += `<td style="padding:12px;">${qty}</td>`;
        html += `<td style="padding:12px;">${product.jedinica || product.unit || 'kom'}</td>`;
        html += `<td style="padding:12px;">${product.mesto || product.storage || 'N/A'}</td>`;
        html += `<td style="padding:12px;text-align:center;">
            <button onclick="moveToShopping(${index})" style="background:#FF9800;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px;">
                🛒 ${t('spisak')}
            </button>
        </td>`;
        html += `</tr>`;
    });
    
    html += `</tbody>`;
    html += `</table>`;
    html += `</div>`;
    
    content.innerHTML = html;
}

// ============================================
// RENDER SHOPPING LIST - SPISAK POTREBA
// ============================================
function renderShoppingList() {
    currentScreenState = 'shopping';
    const content = document.getElementById('mainContent');
    if (!content) return;
    
    let shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    
    if (shoppingList.length === 0) {
        content.innerHTML = `
            <div class="title">${t('spisak_potreba')}</div>
            <div style="text-align:center;padding:40px;color:#999;font-size:18px;">
                🛒 ${t('list_empty') || 'Shopping list is empty'}
            </div>
        `;
        return;
    }
    
    let html = `<div class="title">${t('spisak_potreba')}</div>`;
    html += `<div style="margin-bottom:15px;display:flex;gap:10px;flex-wrap:wrap;">`;
    html += `<button onclick="selectAllShopping()" style="background:#4CAF50;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">${t('oznaci_sve')}</button>`;
    html += `<button onclick="copyShoppingList()" style="background:#2196F3;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">${t('kopiraj')}</button>`;
    html += `<button onclick="deleteSelectedShopping()" style="background:#f44336;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">${t('obrisi_oznaceno')}</button>`;
    html += `</div>`;
    
    html += `<div style="overflow-x:auto;">`;
    html += `<table style="width:100%;border-collapse:collapse;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">`;
    html += `<thead style="background:#1a237e;color:white;">`;
    html += `<tr>`;
    html += `<th style="padding:12px;text-align:center;width:40px;"><input type="checkbox" id="selectAllCheckbox" onchange="toggleAllShoppingCheckboxes()"></th>`;
    html += `<th style="padding:12px;text-align:left;">${t('naziv_proizvoda')}</th>`;
    html += `<th style="padding:12px;text-align:left;">${t('kolicina')}</th>`;
    html += `<th style="padding:12px;text-align:center;">Akcije</th>`;
    html += `</tr>`;
    html += `</thead>`;
    html += `<tbody>`;
    
    shoppingList.forEach((item, index) => {
        html += `<tr style="border-bottom:1px solid #eee;">`;
        html += `<td style="padding:12px;text-align:center;"><input type="checkbox" class="shopping-checkbox" data-index="${index}"></td>`;
        html += `<td style="padding:12px;"><strong>${item.naziv || item.name || 'N/A'}</strong></td>`;
        html += `<td style="padding:12px;">${item.kolicina || item.quantity || 0}</td>`;
        html += `<td style="padding:12px;text-align:center;">
            <button onclick="removeFromShopping(${index})" style="background:#f44336;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px;">
                ✖ ${t('obrisi')}
            </button>
        </td>`;
        html += `</tr>`;
    });
    
    html += `</tbody>`;
    html += `</table>`;
    html += `</div>`;
    
    content.innerHTML = html;
}


// ============================================
// POMOĆNE FUNKCIJE ZA RAD SA PODACIMA
// ============================================

// ============================================
// SAČUVAJ PROIZVOD - PUNI PODACI
// ============================================
function saveProduct() {
    const name = document.getElementById('productName')?.value.trim();
    const description = document.getElementById('productDescription')?.value.trim() || '';
    const quantity = parseFloat(document.getElementById('productQuantity')?.value);
    const unit = document.getElementById('productUnit')?.value || 'kom';
    const storage = document.getElementById('productStorage')?.value || t('Ostalo') || 'Ostalo';
    const shelfLife = parseInt(document.getElementById('productShelfLife')?.value) || 0;
    
    // Izračunaj datum isteka
    let expiryDate = '';
    if (shelfLife > 0) {
        const today = new Date();
        today.setMonth(today.getMonth() + shelfLife);
        expiryDate = today.toISOString().split('T')[0];
    }
    
    if (!name) {
        showModernAlert(t('missing_info') || 'Nedostaju podaci', t('enter_product_name') || 'Unesite naziv proizvoda!', '⚠️');
        return;
    }
    
    if (isNaN(quantity) || quantity <= 0) {
        showModernAlert(t('invalid_input') || 'Neispravan unos', t('enter_quantity') || 'Unesite količinu!', '⚠️');
        return;
    }
    
    // Uzmi postojeće proizvode
    let products = JSON.parse(localStorage.getItem('products') || '[]');
    
    // Kreiraj novi proizvod sa svim podacima
    const newProduct = {
        naziv: name,
        opis: description,
        kolicina: quantity,
        jedinica: unit,
        mesto: storage,
        kategorija: currentCategory || '',
        podkategorija: currentSubcategory || '',
        deo: currentProductPart || '',
        rok_trajanja: shelfLife,
        datum_isteka: expiryDate,
        datum_unosa: new Date().toISOString().split('T')[0]
    };
    
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    showModernAlert(t('success') || 'Uspešno', t('product_saved') || 'Proizvod sačuvan!', '✅');
    
    // Resetuj polja
    document.getElementById('productName').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productQuantity').value = '';
    document.getElementById('productShelfLife').value = '';
    
    // Resetuj prikaz roka
    const expiryDisplay = document.getElementById('expiryDisplay');
    if (expiryDisplay) {
        expiryDisplay.textContent = '-';
    }
    
    // Osveži prikaz
    setTimeout(function() {
        renderInventory();
    }, 500);
}
// Prebaci u shopping listu
function moveToShopping(index) {
    let products = JSON.parse(localStorage.getItem('products') || '[]');
    if (index < 0 || index >= products.length) return;
    
    const product = products[index];
    if (!product) return;
    
    // Uzmi shopping listu
    let shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    
    // Proveri da li već postoji
    const existingIndex = shoppingList.findIndex(item => 
        item.naziv === product.naziv && item.jedinica === product.jedinica
    );
    
    if (existingIndex >= 0) {
        shoppingList[existingIndex].kolicina += product.kolicina;
    } else {
        shoppingList.push({
            naziv: product.naziv,
            kolicina: product.kolicina,
            jedinica: product.jedinica
        });
    }
    
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
    
    // Smanji količinu u inventaru na 0
    products[index].kolicina = 0;
    localStorage.setItem('products', JSON.stringify(products));
    
    showModernAlert(t('success'), t('shopping_moved'), '🛒');
    renderInventory();
}

// Ukloni iz shopping liste
function removeFromShopping(index) {
    let shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    if (index < 0 || index >= shoppingList.length) return;
    
    const itemName = shoppingList[index].naziv || 'item';
    showModernConfirm(
        t('delete_confirm_title') || 'Delete Confirmation',
        t('delete_from_shopping') || `Delete "${itemName}" from shopping list?`,
        '⚠️',
        function() {
            shoppingList.splice(index, 1);
            localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
            renderShoppingList();
        },
        function() {
            // Odustani
        }
    );
}

// Selektuj sve u shopping listi
function selectAllShopping() {
    const checkboxes = document.querySelectorAll('.shopping-checkbox');
    const mainCheckbox = document.getElementById('selectAllCheckbox');
    const isChecked = mainCheckbox ? mainCheckbox.checked : true;
    
    checkboxes.forEach(cb => {
        cb.checked = isChecked;
    });
}

function toggleAllShoppingCheckboxes() {
    const mainCheckbox = document.getElementById('selectAllCheckbox');
    if (!mainCheckbox) return;
    
    const checkboxes = document.querySelectorAll('.shopping-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = mainCheckbox.checked;
    });
}

// Kopiraj shopping listu
function copyShoppingList() {
    const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    if (shoppingList.length === 0) {
        showModernAlert(t('list_empty'), 'Nothing to copy', '📋');
        return;
    }
    
    let text = '🛒 SHOPPING LIST\n' + '='.repeat(30) + '\n\n';
    shoppingList.forEach((item, i) => {
        text += `${i+1}. ${item.naziv || 'N/A'} - ${item.kolicina || 0} ${item.jedinica || ''}\n`;
    });
    
    navigator.clipboard.writeText(text).then(() => {
        showModernAlert(t('success'), t('copied'), '📋');
    }).catch(() => {
        showModernAlert(t('error'), t('copy_error'), '❌');
    });
}

// Obriši selektovane iz shopping liste
function deleteSelectedShopping() {
    const checkboxes = document.querySelectorAll('.shopping-checkbox:checked');
    if (checkboxes.length === 0) {
        showModernAlert(t('no_selection'), t('no_items_selected'), '⚠️');
        return;
    }
    
    const count = checkboxes.length;
    showModernConfirm(
        t('delete_confirm_title'),
        t('delete_confirm').replace('{count}', count),
        '⚠️',
        function() {
            let shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
            const indices = [];
            checkboxes.forEach(cb => {
                const idx = parseInt(cb.dataset.index);
                if (!isNaN(idx)) indices.push(idx);
            });
            
            // Sortiraj opadajuće i obriši
            indices.sort((a, b) => b - a);
            indices.forEach(idx => {
                if (idx >= 0 && idx < shoppingList.length) {
                    shoppingList.splice(idx, 1);
                }
            });
            
            localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
            renderShoppingList();
        },
        function() {
            // Odustani
        }
    );
}

// ============================================
// AŽURIRAJ VOICE STATUS
// ============================================
function updateVoiceStatus(text) {
    const status = document.getElementById('voiceStatus');
    if (status) {
        status.innerHTML = text;
    }
}

// ============================================
// IZBOR NAČINA UNOSA (DODAJ OVO)
// ============================================

function selectVoiceMode() {
    console.log('🎤 Izabran zvučni unos');
    try {
        // Ažuriraj tekstove na trenutnom jeziku
        updateChoiceScreenTexts();
        // Prikaži ekran za glasovni meni
        showScreen('voiceMenuScreen');
        // Pokreni prepoznavanje glasa nakon 500ms
        setTimeout(function() {
            startVoiceRecognition();
        }, 500);
    } catch(e) {
        console.error('❌ Greška u selectVoiceMode:', e);
        showModernAlert('Greška', 'Došlo je do greške pri pokretanju glasovnog unosa', '❌');
    }
}

function selectManualMode() {
    console.log('✍️ Izabran ručni unos');
    try {
        // Prikaži glavni ekran
        showScreen('mainScreen');
        // Sačekaj da se ekran prikaže pa renderuj kategorije
        setTimeout(function() {
            renderCategories();
        }, 100);
    } catch(e) {
        console.error('❌ Greška u selectManualMode:', e);
        showModernAlert('Greška', 'Došlo je do greške pri pokretanju ručnog unosa', '❌');
    }
}

function goBackFromVoice() {
    console.log('◀ Povratak sa glasovnog menija');
    // Zaustavi prepoznavanje glasa ako je aktivno
    if (recognition) {
        try { 
            recognition.stop(); 
        } catch(e) {}
        recognition = null;
    }
    // Ažuriraj tekstove i vrati se na izbor
    updateChoiceScreenTexts();
    showScreen('choiceScreen');
}
/// ============================================
// NAVIGACIJA - VRATI SE NA PRETHODNI EKRAN
// ============================================
let navigationHistory = [];  // ⭐ SAMO JEDAN

function goBack() {
    console.log('◀ Povratak na prethodni ekran');
    console.log('📋 Istorija:', navigationHistory);
    
    if (navigationHistory.length > 1) {
        navigationHistory.pop();
        const previousScreen = navigationHistory.pop();
        console.log('📱 Vraćam se na:', previousScreen);
        showScreen(previousScreen);
        
        if (previousScreen === 'mainScreen') {
            setTimeout(function() {
                renderCategories();
            }, 100);
        }
    } else if (navigationHistory.length === 1) {
        navigationHistory = [];
        showScreen('choiceScreen');
    } else {
        showScreen('choiceScreen');
    }
}

// ============================================
// SHOW SCREEN SA ISTORIJOM
// ============================================
// ⭐ OVDE NEMA navigationHistory - samo showScreen funkcija

function showScreen(screenId) {
    console.log('📱 Prikazujem ekran:', screenId);
    
    // Sakrij sve ekrane
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    
    // Pokaži traženi ekran
    const target = document.getElementById(screenId);
    if (target) {
        target.style.display = 'flex';
        console.log('✅ Ekran prikazan:', screenId);
        
        // Ako je mainScreen, prikaži kategorije
        if (screenId === 'mainScreen') {
            if (currentScreenState === '' || currentScreenState === 'categories') {
                setTimeout(function() {
                    renderCategories();
                }, 50);
            }
        }
        
        // Dodaj u istoriju (osim login i language)
        if (screenId !== 'loginScreen' && screenId !== 'languageScreen') {
            if (navigationHistory.length === 0 || navigationHistory[navigationHistory.length - 1] !== screenId) {
                navigationHistory.push(screenId);
                console.log('📝 Dodato u istoriju:', screenId, navigationHistory);
            }
        }
    } else {
        console.error('❌ Ekran nije pronađen:', screenId);
    }
    
    // Ažuriraj header
    updateHeaderTexts();
}

// ============================================
// RENDER DATA ENTRY - PUNI UNOS PODATAKA
// ============================================
function renderDataEntry(productPart) {
    currentScreenState = 'dataEntry';
    currentProductPart = productPart || '';
    const content = document.getElementById('mainContent');
    if (!content) {
        console.error('❌ mainContent nije pronađen');
        return;
    }
    
    const storageOptions = [
        t('zamrzivac_1') || 'Zamrzivač 1',
        t('zamrzivac_2') || 'Zamrzivač 2', 
        t('zamrzivac_3') || 'Zamrzivač 3',
        t('frizider') || 'Frižider',
        t('ostava') || 'Ostava',
        t('Ostalo') || 'Ostalo'
    ];
    
    const unitOptions = ['kg', 'g', 'kom', 'l', 'ml', 'pak', 'kutija'];
    
    let html = `<div class="title">${t('unos_podataka') || 'Unos podataka'}</div>`;
    html += `<div style="background:white;padding:25px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);max-width:700px;margin:0 auto;">`;
    
    // Kategorija (samo prikaz)
    html += `<div class="row">`;
    html += `<label>${t('glavne_kategorije') || 'Kategorija'}</label>`;
    html += `<div style="flex:1;padding:16px;background:#f0f0f0;border-radius:12px;font-size:22px;font-weight:bold;color:#1a237e;">${currentCategory || 'N/A'}</div>`;
    html += `</div>`;
    
    // Podkategorija (samo prikaz)
    html += `<div class="row">`;
    html += `<label>${t('podkategorije') || 'Podkategorija'}</label>`;
    html += `<div style="flex:1;padding:16px;background:#f0f0f0;border-radius:12px;font-size:22px;font-weight:bold;color:#1a237e;">${currentSubcategory || 'N/A'}</div>`;
    html += `</div>`;
    
    // Deo proizvoda (samo prikaz)
    if (currentProductPart) {
        html += `<div class="row">`;
        html += `<label>${t('delovi_proizvoda') || 'Deo'}</label>`;
        html += `<div style="flex:1;padding:16px;background:#f0f0f0;border-radius:12px;font-size:22px;font-weight:bold;color:#1a237e;">${currentProductPart}</div>`;
        html += `</div>`;
    }
    
    // Naziv proizvoda
    html += `<div class="row">`;
    html += `<label>${t('naziv_proizvoda') || 'Proizvod'}</label>`;
    html += `<input type="text" id="productName" placeholder="${t('naziv_proizvoda') || 'Naziv proizvoda'}" style="flex:1;padding:16px;border:2px solid #ddd;border-radius:12px;font-size:22px;">`;
    html += `</div>`;
    
    // Opis
    html += `<div class="row">`;
    html += `<label>${t('opis') || 'Opis'}</label>`;
    html += `<input type="text" id="productDescription" placeholder="${t('opis') || 'Opis proizvoda'}" style="flex:1;padding:16px;border:2px solid #ddd;border-radius:12px;font-size:22px;">`;
    html += `</div>`;
    
    // Količina i jedinica mere
    html += `<div class="row">`;
    html += `<label>${t('kolicina') || 'Količina'}</label>`;
    html += `<div class="inline-group">`;
    html += `<input type="number" id="productQuantity" placeholder="0" min="0" step="0.1" style="flex:2;padding:16px;border:2px solid #ddd;border-radius:12px;font-size:22px;">`;
    html += `<select id="productUnit" style="flex:1;padding:16px;border:2px solid #ddd;border-radius:12px;font-size:22px;">`;
    unitOptions.forEach(unit => {
        html += `<option value="${unit}">${t(unit) || unit}</option>`;
    });
    html += `</select>`;
    html += `</div>`;
    html += `</div>`;
    
    // Rok trajanja
    html += `<div class="row">`;
    html += `<label>${t('rok_trajanja') || 'Rok (meseci)'}</label>`;
    html += `<input type="number" id="productShelfLife" placeholder="12" min="0" style="flex:1;padding:16px;border:2px solid #ddd;border-radius:12px;font-size:22px;">`;
    html += `</div>`;
    
    // Automatski rok
    html += `<div class="row">`;
    html += `<label>${t('automatski_rok') || 'Rok ističe'}</label>`;
    html += `<div id="expiryDisplay" style="flex:1;padding:16px;background:#f0f0f0;border-radius:12px;font-size:22px;font-weight:bold;color:#1a237e;text-align:center;">-</div>`;
    html += `</div>`;
    
    // Mesto skladištenja
    html += `<div class="row">`;
    html += `<label>${t('mesto_skladistenja') || 'Skladište'}</label>`;
    html += `<select id="productStorage" style="flex:1;padding:16px;border:2px solid #ddd;border-radius:12px;font-size:22px;">`;
    storageOptions.forEach(place => {
        html += `<option value="${place}">${place}</option>`;
    });
    html += `</select>`;
    html += `</div>`;
    
    // Datum unosa
    html += `<div class="row">`;
    html += `<label>${t('datum_unosa') || 'Datum unosa'}</label>`;
    html += `<div style="flex:1;padding:16px;background:#f0f0f0;border-radius:12px;font-size:22px;font-weight:bold;color:#1a237e;">${new Date().toISOString().split('T')[0]}</div>`;
    html += `</div>`;
    
    // Dugmad
    html += `<div class="btn-group">`;
    html += `<button onclick="saveProduct()" class="btn-save">✅ ${t('unesi') || 'Unesi'}</button>`;
    html += `<button onclick="goBack()" class="btn-cancel">✖ ${t('odustani') || 'Odustani'}</button>`;
    html += `</div>`;
    
    html += `</div>`;
    content.innerHTML = html;
    
    // ⭐ AUTO-IZRAČUNAVANJE ROKA
    const shelfLifeInput = document.getElementById('productShelfLife');
    const expiryDisplay = document.getElementById('expiryDisplay');
    if (shelfLifeInput && expiryDisplay) {
        shelfLifeInput.addEventListener('input', function() {
            const months = parseInt(this.value) || 0;
            if (months > 0) {
                const today = new Date();
                today.setMonth(today.getMonth() + months);
                expiryDisplay.textContent = today.toISOString().split('T')[0];
            } else {
                expiryDisplay.textContent = '-';
            }
        });
    }
}
// ============================================
// KRAJ FAJLA
// ============================================
console.log('✅ Kraj fajla');
