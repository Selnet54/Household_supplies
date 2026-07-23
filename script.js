// ===== MINIMALNA VERZIJA - SIGURNO RADI =====
console.log('✅ Script.js je učitan!');

// Exit funkcija
function exitApp() {
    if (confirm('Da li želite da zatvorite aplikaciju?')) {
        document.getElementById('mainScreen').style.display = 'none';
        document.getElementById('languageScreen').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('phoneInput').value = '';
    }
}

// Jezici - SVI (ispravno)
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

// Prevodi (samo osnovni)
const translations = {
    sr: { nazad: "Nazad", stanje: "Zalihe", spisak: "Spisak", glavne_kategorije: "Glavne kategorije" },
    en: { nazad: "Back", stanje: "Inventory", spisak: "Shopping List", glavne_kategorije: "Main Categories" },
    de: { nazad: "Zurück", stanje: "Bestand", spisak: "Einkaufsliste", glavne_kategorije: "Hauptkategorien" },
    hu: { nazad: "Vissza", stanje: "Készlet", spisak: "Bevásárlólista", glavne_kategorije: "Fő kategóriák" },
    uk: { nazad: "Назад", stanje: "Запаси", spisak: "Список", glavne_kategorije: "Основні категорії" },
    ru: { nazad: "Назад", stanje: "Запасы", spisak: "Список", glavne_kategorije: "Основные категории" },
    zh: { nazad: "返回", stanje: "库存", spisak: "购物清单", glavne_kategorije: "主要类别" },
    es: { nazad: "Atrás", stanje: "Inventario", spisak: "Lista de Compras", glavne_kategorije: "Categorías Principales" },
    pt: { nazad: "Voltar", stanje: "Estoque", spisak: "Lista de Compras", glavne_kategorije: "Categorias Principais" },
    fr: { nazad: "Retour", stanje: "Stock", spisak: "Liste de Courses", glavne_kategorije: "Catégories Principales" }
};

let currentLang = 'sr';
let currentCategory = '';
let currentSubcategory = '';
window.historyStack = [];

function t(key) {
    return translations[currentLang]?.[key] || key;
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(screenId).style.display = 'flex';
}

function renderLanguages() {
    const grid = document.getElementById('languageGrid');
    if (!grid) return;
    grid.innerHTML = '';
    Object.keys(languages).forEach(code => {
        const lang = languages[code];
        const btn = document.createElement('button');
        btn.className = 'lang-btn-main';
        btn.innerHTML = `<img src="${lang.flag}" style="width:60px;height:45px;border-radius:8px;"><br><span>${lang.name}</span>`;
        btn.onclick = function() {
            currentLang = code;
            showScreen('mainScreen');
            document.getElementById('backText').textContent = t('nazad');
            document.getElementById('invText').textContent = t('stanje');
            document.getElementById('shopText').textContent = t('spisak');
            renderCategories();
        };
        grid.appendChild(btn);
    });
}

// Glavne kategorije (skraćeno)
const mainCategories = {
    sr: ["Belo meso", "Crveno meso", "Riba", "Povrće", "Ostalo"],
    en: ["White meat", "Red meat", "Fish", "Vegetables", "Other"],
    de: ["Weißes Fleisch", "Rotes Fleisch", "Fisch", "Gemüse", "Andere"],
    hu: ["Fehér hús", "Vörös hús", "Hal", "Zöldség", "Egyéb"],
    uk: ["Біле м'ясо", "Червоне м'ясо", "Риба", "Овочі", "Інше"],
    ru: ["Белое мясо", "Красное мясо", "Рыба", "Овощи", "Другое"],
    zh: ["白肉", "红肉", "鱼", "蔬菜", "其他"],
    es: ["Carne blanca", "Carne roja", "Pescado", "Verduras", "Otro"],
    pt: ["Carne branca", "Carne vermelha", "Peixe", "Vegetais", "Outro"],
    fr: ["Viande blanche", "Viande rouge", "Poisson", "Légumes", "Autre"]
};

function getMainCategories() {
    return mainCategories[currentLang] || mainCategories.sr;
}

function renderCategories() {
    const content = document.getElementById('mainContent');
    if (!content) return;
    const catList = getMainCategories();
    let html = `<div class="title">${t('glavne_kategorije')}</div><div class="categories-grid">`;
    catList.forEach(cat => {
        html += `<button class="category-btn" style="background:#FFE295;" onclick="alert('Odabrali ste: ${cat}')">${cat}</button>`;
    });
    html += `</div>`;
    content.innerHTML = html;
    window.historyStack.push({ type: 'categories' });
}

// ===== DOGAĐAJI =====
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
        if (window.historyStack.length === 0) {
            showScreen('languageScreen');
            renderLanguages();
            return;
        }
        window.historyStack.pop();
        renderCategories();
    });

    document.getElementById('inventoryBtn')?.addEventListener('click', function() {
        alert('📦 Zalihe - test');
    });

    document.getElementById('shoppingBtn')?.addEventListener('click', function() {
        alert('🛒 Spisak - test');
    });

    console.log('✅ Svi događaji povezani!');
});
