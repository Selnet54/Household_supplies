// ============================================
// MINIMALNI TEST SCRIPT
// ============================================

console.log('✅ Script.js je učitan!');

// ===== 1. EXIT FUNKCIJA =====
function exitApp() {
    if (confirm('Da li želite da zatvorite aplikaciju?')) {
        window.close();
    }
}

// ===== 2. JEZICI =====
const languages = [
    { code: 'sr', name: 'Srpski', flag: 'icons/jezici/srpski.png' },
    { code: 'en', name: 'English', flag: 'icons/jezici/engleski.png' }
];

// ===== 3. PREVODI =====
const translations = {
    sr: { nazad: "Nazad", stanje: "Zalihe", spisak: "Spisak" },
    en: { nazad: "Back", stanje: "Inventory", spisak: "Shopping List" }
};

let currentLang = 'sr';

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

function renderLanguages() {
    const grid = document.getElementById('languageGrid');
    if (!grid) return;
    grid.innerHTML = '';
    languages.forEach(lang => {
        const btn = document.createElement('button');
        btn.className = 'lang-btn-main';
        btn.innerHTML = `
            <img src="${lang.flag}" alt="${lang.name}" style="width:60px;height:45px;border-radius:8px;">
            <span class="lang-name">${lang.name}</span>
        `;
        btn.onclick = function() {
            currentLang = lang.code;
            showScreen('mainScreen');
            updateHeaderTexts();
            renderCategories();
        };
        grid.appendChild(btn);
    });
}

function renderCategories() {
    const content = document.getElementById('mainContent');
    if (!content) return;
    content.innerHTML = `
        <div class="title">${t('stanje')}</div>
        <div class="categories-grid">
            <button class="category-btn" style="background:#FFE295;" onclick="alert('Kategorija 1')">Kategorija 1</button>
            <button class="category-btn" style="background:#F1624B;" onclick="alert('Kategorija 2')">Kategorija 2</button>
            <button class="category-btn" style="background:#00BBF1;" onclick="alert('Kategorija 3')">Kategorija 3</button>
        </div>
    `;
}

// ===== 4. DOGAĐAJI =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM učitano!');

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

    document.getElementById('exitLoginBtn')?.addEventListener('click', exitApp);
    document.getElementById('exitLangBtn')?.addEventListener('click', exitApp);
    document.getElementById('exitMainBtn')?.addEventListener('click', exitApp);

    document.getElementById('backBtn')?.addEventListener('click', function() {
        showScreen('languageScreen');
        renderLanguages();
    });

    document.getElementById('inventoryBtn')?.addEventListener('click', function() {
        renderCategories();
    });

    document.getElementById('shoppingBtn')?.addEventListener('click', function() {
        alert('🛒 Spisak - test');
    });

    console.log('✅ Svi događaji povezani!');
});
