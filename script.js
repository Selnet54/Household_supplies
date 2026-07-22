console.log('✅ Script.js je učitan!');

// EXIT - vraća na login
function exitApp() {
    if (confirm('Da li želite da zatvorite aplikaciju?')) {
        document.getElementById('mainScreen').style.display = 'none';
        document.getElementById('languageScreen').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('phoneInput').value = '';
    }
}

// JEZICI
const languages = [
    { code: 'sr', name: 'Srpski', flag: '/Household_supplies/icons/jezici/srpski.png' },
    { code: 'en', name: 'English', flag: '/Household_supplies/icons/jezici/engleski.png' }
];

const translations = {
    sr: { nazad: "Nazad", stanje: "Zalihe", spisak: "Spisak" },
    en: { nazad: "Back", stanje: "Inventory", spisak: "Shopping List" }
};

let currentLang = 'sr';

function t(key) { return translations[currentLang]?.[key] || key; }

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'flex';
}

function renderLanguages() {
    const grid = document.getElementById('languageGrid');
    if (!grid) return;
    grid.innerHTML = '';
    languages.forEach(lang => {
        const btn = document.createElement('button');
        btn.className = 'lang-btn-main';
        btn.innerHTML = `<img src="${lang.flag}" style="width:60px;height:45px;"><br>${lang.name}`;
        btn.onclick = function() {
            currentLang = lang.code;
            showScreen('mainScreen');
            document.getElementById('backText').textContent = t('nazad');
            document.getElementById('invText').textContent = t('stanje');
            document.getElementById('shopText').textContent = t('spisak');
            renderCategories();
        };
        grid.appendChild(btn);
    });
}

function renderCategories() {
    document.getElementById('mainContent').innerHTML = `
        <div class="title">${t('stanje')}</div>
        <div class="categories-grid">
            <button class="category-btn" style="background:#FFE295;" onclick="alert('1')">Kategorija 1</button>
            <button class="category-btn" style="background:#F1624B;" onclick="alert('2')">Kategorija 2</button>
            <button class="category-btn" style="background:#00BBF1;" onclick="alert('3')">Kategorija 3</button>
        </div>
    `;
}

// DOGAĐAJI
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const phone = document.getElementById('phoneInput').value.trim();
            if (phone.length >= 9) {
                showScreen('languageScreen');
                renderLanguages();
            } else {
                alert('Unesite 9+ cifara!');
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
        showScreen('languageScreen');
        renderLanguages();
    });

    document.getElementById('inventoryBtn')?.addEventListener('click', function() {
        alert('📦 Zalihe');
    });

    document.getElementById('shoppingBtn')?.addEventListener('click', function() {
        alert('🛒 Spisak');
    });

    console.log('✅ SVE RADI!');
});
