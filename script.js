// ============================================
// SVE FUNKCIJE ZA APLIKACIJU
// ============================================

// ===== 1. EXIT FUNKCIJA =====
function exitApp() {
    if (confirm('Da li želite da zatvorite aplikaciju?')) {
        if (window.navigator && window.navigator.app) {
            try {
                window.navigator.app.exitApp();
                return;
            } catch(e) {}
        }
        try {
            window.close();
        } catch(e) {
            window.location.href = 'about:blank';
        }
        setTimeout(function() {
            window.location.href = 'about:blank';
        }, 500);
    }
}

// ===== 2. JEZICI =====
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

// ===== 3. PREVODI (skraćeno za test) =====
const translations = {
    sr: {
        nazad: "Nazad", stanje: "Zalihe", spisak: "Spisak",
        glavne_kategorije: "Glavne kategorije",
        unesi: "Unesi", odustani: "Odustani",
        delovi_proizvoda: "Delovi proizvoda",
        unos_podataka: "Unos podataka"
    },
    en: {
        nazad: "Back", stanje: "Inventory", spisak: "Shopping List",
        glavne_kategorije: "Main Categories",
        unesi: "Save", odustani: "Cancel",
        delovi_proizvoda: "Product Parts",
        unos_podataka: "Data Entry"
    }
};

// ===== 4. TRENUTNO STANJE =====
let currentLang = 'sr';

// ===== 5. POMOĆNE FUNKCIJE =====
function t(key) {
    return translations[currentLang]?.[key] || key;
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

// ===== 6. RENDER JEZIKA =====
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
    showScreen('mainScreen');
    updateHeaderTexts();
    renderCategories();
}

// ===== 7. GLAVNE KATEGORIJE =====
const mainCategories = {
    sr: ["Belo meso", "Crveno meso", "Riba", "Povrće", "Ostalo"],
    en: ["White meat", "Red meat", "Fish", "Vegetables", "Other"]
};

function renderCategories() {
    const content = document.getElementById('mainContent');
    if (!content) return;
    const catList = mainCategories[currentLang] || mainCategories.sr;
    let html = `<div class="title">${t('glavne_kategorije')}</div>`;
    html += `<div class="categories-grid">`;
    catList.forEach(cat => {
        html += `<button class="category-btn" style="background:#FFE295;" onclick="alert('Odabrali ste: ${cat}')">${cat}</button>`;
    });
    html += `</div>`;
    content.innerHTML = html;
}

// ===== 8. GLAVNI DOGAĐAJI =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Stranica učitana!');

    // Login
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

    // Exit dugmad
    const exitBtns = document.querySelectorAll('#exitLoginBtn, #exitLangBtn, #exitMainBtn');
    exitBtns.forEach(function(btn) {
        btn.addEventListener('click', exitApp);
    });

    // Back
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            showScreen('languageScreen');
            renderLanguages();
        });
    }

    // Inventory
    const inventoryBtn = document.getElementById('inventoryBtn');
    if (inventoryBtn) {
        inventoryBtn.addEventListener('click', function() {
            alert('📦 Zalihe - ovo je testna funkcija');
        });
    }

    // Shopping
    const shoppingBtn = document.getElementById('shoppingBtn');
    if (shoppingBtn) {
        shoppingBtn.addEventListener('click', function() {
            alert('🛒 Spisak - ovo je testna funkcija');
        });
    }

    console.log('✅ Svi događaji povezani!');
});
