// ============================================
// SCRIPT2.JS - STABILNA VERZIJA
// ============================================
console.log('✅ Script2.js je učitan!');

// ============================================
// 1. VOICE FUNKCIJE - DEFINISANE ODMAH
// ============================================
window.openVoiceDataEntry = function() {
    console.log('📝 openVoiceDataEntry');
    if (typeof renderDataEntry === 'function') {
        renderDataEntry('');
    }
};

window.startVoiceDataEntry = function() {
    console.log('🎤 startVoiceDataEntry');
};

window.stopVoiceDataEntry = function() {
    console.log('🛑 stopVoiceDataEntry');
};

// Lokalne za kompatibilnost
var openVoiceDataEntry = window.openVoiceDataEntry;
var startVoiceDataEntry = window.startVoiceDataEntry;
var stopVoiceDataEntry = window.stopVoiceDataEntry;

console.log('✅ Voice funkcije definisane!');

// ============================================
// 2. TVOJ ORIGINALNI KOD (odavde do kraja)
// ============================================

// ===== TRENUTNO STANJE =====
let currentLang = 'en';
let currentCategory = '';
let currentSubcategory = '';
let currentProductPart = '';
let currentScreenState = 'languages';
let fromChoiceScreen = false;

// ===== PREVODI =====
const translations = {
    sr: {
        nazad: "Nazad", stanje: "Zalihe", spisak: "Spisak",
        naziv_proizvoda: "Proizvod:", opis: "Opis:",
        komad: "Komada:", kolicina: "Količina:", jedinica_mere: "Jed. mere:",
        datum_unosa: "Datum unosa:", rok_trajanja: "Rok (meseci):",
        automatski_rok: "Rok ističe:", mesto_skladistenja: "Skladište:",
        unesi: "Unesi", odustani: "Odustani",
        glavne_kategorije: "Glavne kategorije", podkategorije: "Podkategorije",
        unos_podataka: "Unos podataka", pregled_unosa: "Pregled unosa",
        nema_proizvoda: "Nema proizvoda", spisak_potreba: "Spisak potreba",
        azuriraj: "Ažuriraj", obrisi: "Obriši",
        oznaci_sve: "Označi sve", kopiraj: "Kopiraj", obrisi_oznaceno: "Obriši označeno",
        exit_poruka: "Hvala na korišćenju! 👋",
        zamrzivac_1: "Zamrzivač 1", zamrzivac_2: "Zamrzivač 2", zamrzivac_3: "Zamrzivač 3",
        frizider: "Frižider", ostava: "Ostava", Ostalo: "Ostalo",
        kg: "kg", g: "g", kom: "kom", l: "l", ml: "ml", pak: "pak", kutija: "kutija",
        error: "Greška", success: "Uspešno",
        product_saved: "Proizvod sačuvan!", product_updated: "Proizvod ažuriran!",
        no_selection: "Nema odabira", no_items_selected: "Niste označili nijednu stavku!",
        missing_info: "Nedostaju podaci", enter_product_name: "Unesite naziv proizvoda!",
        enter_quantity: "Unesite količinu!", copied: "Lista je kopirana!"
    },
    en: {
        nazad: "Back", stanje: "Inventory", spisak: "Shopping List",
        naziv_proizvoda: "Product:", opis: "Description:",
        komad: "Piece:", kolicina: "Quantity:", jedinica_mere: "Unit:",
        datum_unosa: "Entry Date:", rok_trajanja: "Shelf Life (months):",
        automatski_rok: "Auto Expiry:", mesto_skladistenja: "Storage:",
        unesi: "Enter", odustani: "Cancel",
        glavne_kategorije: "Main Categories", podkategorije: "Subcategories",
        unos_podataka: "Data Entry", pregled_unosa: "Entry Review",
        nema_proizvoda: "No products", spisak_potreba: "Shopping List",
        azuriraj: "Update", obrisi: "Delete",
        oznaci_sve: "Select all", kopiraj: "Copy", obrisi_oznaceno: "Delete selected",
        exit_poruka: "Thanks for using this app! 👋",
        zamrzivac_1: "Freezer 1", zamrzivac_2: "Freezer 2", zamrzivac_3: "Freezer 3",
        frizider: "Refrigerator", ostava: "Pantry", Ostalo: "Other",
        kg: "kg", g: "g", kom: "pcs", l: "l", ml: "ml", pak: "pck", kutija: "box",
        error: "Error", success: "Success",
        product_saved: "Product saved!", product_updated: "Product updated!",
        no_selection: "No Selection", no_items_selected: "No items selected!",
        missing_info: "Missing Information", enter_product_name: "Enter product name!",
        enter_quantity: "Enter quantity!", copied: "List copied!"
    }
};

function t(key) { return translations[currentLang]?.[key] || key; }

// ===== BOJE =====
const categoryColors = {
    "Belo meso": "#FFE295", "Crveno meso": "#F1624B",
    "Sitna divljač": "#F59AA6", "Krupna divljač": "#E19E94",
    "Riba": "#00BBF1", "Mlečni proizvodi": "#ACE1F9",
    "Povrće": "#8FC74A", "Zimnica i kompoti": "#CC98C4",
    "Testo i Slatkiši": "#FFECAB", "Pića": "#F8E06D",
    "Hemija i higijena": "#98D6D2", "Ostalo": "#F58634"
};

// ===== KATEGORIJE =====
const mainCategories = {
    sr: ["Belo meso", "Crveno meso", "Sitna divljač", "Krupna divljač", "Riba", "Mlečni proizvodi", "Povrće", "Zimnica i kompoti", "Testo i Slatkiši", "Pića", "Hemija i higijena", "Ostalo"],
    en: ["White meat", "Red meat", "Small game", "Big game", "Fish", "Dairy products", "Vegetables", "Preserves and compotes", "Dough and Sweets", "Beverages", "Chemicals and hygiene", "Other"]
};

function getMainCategories() { return mainCategories[currentLang] || mainCategories.sr; }
function getCategoryColor(cat) { return categoryColors[cat] || '#ccc'; }
function isOtherButton(text) {
    return ["Ostalo", "Other", "Andere", "Egyéb", "Інше", "Другое", "其他", "Otro", "Outro", "Autre"].includes(text);
}

// ===== POMOĆNE FUNKCIJE =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const screen = document.getElementById(screenId);
    if (screen) screen.style.display = 'flex';
}

// ===== EXIT =====
function exitApp() {
    document.body.innerHTML = `
        <div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#1a237e;flex-direction:column;color:#FFD700;font-family:Arial;">
            <div style="font-size:80px;">👋</div>
            <div style="font-size:32px;">${t('exit_poruka')}</div>
            <button onclick="location.reload()" style="margin-top:30px;padding:12px 30px;background:#FFD700;color:#1a237e;border:none;border-radius:8px;font-size:18px;cursor:pointer;">🔄 Restart</button>
        </div>
    `;
}

// ===== ALERT =====
function showModernAlert(title, message, icon = '📢') {
    const existing = document.getElementById('modernAlertDynamic');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'modernAlertDynamic';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;justify-content:center;align-items:center;z-index:999999;';
    overlay.innerHTML = `
        <div style="background:#8B0000;border:3px solid #FFD700;border-radius:14px;padding:20px;max-width:300px;width:70%;text-align:center;color:#FFD700;">
            <div style="font-size:32px;">${icon}</div>
            <h2 style="color:#FFD700;font-size:17px;">${title}</h2>
            <p style="font-size:13px;">${message}</p>
            <button onclick="this.closest('#modernAlertDynamic').remove()" style="background:#2E7D32;color:#FFD700;border:none;padding:5px 20px;border-radius:8px;cursor:pointer;">OK</button>
        </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 3000);
}

// ===== RENDER FUNKCIJE =====
function renderLanguages() {
    currentScreenState = 'languages';
    const grid = document.getElementById('languageGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const langs = {
        sr: '🇷🇸 Srpski', en: '🇬🇧 English', de: '🇩🇪 Deutsch',
        hu: '🇭🇺 Magyar', uk: '🇺🇦 Українська', ru: '🇷🇺 Русский',
        zh: '🇨🇳 中文', es: '🇪🇸 Español', pt: '🇵🇹 Português', fr: '🇫🇷 Français'
    };
    Object.keys(langs).forEach(code => {
        const btn = document.createElement('button');
        btn.className = 'lang-btn-main';
        btn.textContent = langs[code];
        btn.onclick = () => { currentLang = code; showScreen('choiceScreen'); };
        grid.appendChild(btn);
    });
}

function selectLanguage(code) {
    currentLang = code;
    showScreen('choiceScreen');
}

function renderCategories() {
    currentScreenState = 'categories';
    const content = document.getElementById('mainContent');
    if (!content) return;
    const cats = getMainCategories();
    let html = `<div class="title">${t('glavne_kategorije')}</div><div class="categories-grid">`;
    cats.forEach(cat => {
        const color = getCategoryColor(cat);
        html += `<button class="category-btn" style="background:${color};" onclick="renderDataEntry('')">${cat}</button>`;
    });
    html += `</div>`;
    content.innerHTML = html;
}

function renderDataEntry(productName) {
    currentScreenState = 'dataEntry';
    const content = document.getElementById('mainContent');
    if (!content) return;
    const today = new Date().toISOString().split('T')[0];
    content.innerHTML = `
        <div class="title">${t('unos_podataka')}</div>
        <div class="row"><label>${t('naziv_proizvoda')}</label><input type="text" id="productName" value="${productName || ''}"></div>
        <div class="row"><label>${t('opis')}</label><input type="text" id="productDescription"></div>
        <div class="row">
            <label>${t('komad')}</label>
            <div class="inline-group">
                <input type="text" id="productPiece" style="width:80px;">
                <label>${t('kolicina')}</label>
                <input type="number" id="productQuantity" step="0.1" style="width:100px;">
                <label>${t('jedinica_mere')}</label>
                <select id="productUnit">
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
                <input type="date" id="productDate" value="${today}">
                <label>${t('rok_trajanja')}</label>
                <input type="number" id="productExpiry" style="width:80px;">
                <span>mes</span>
            </div>
        </div>
        <div class="row">
            <label>${t('mesto_skladistenja')}</label>
            <select id="productStorage">
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
    prikaziSveUnose();
    document.getElementById('productName')?.focus();
}

function prikaziSveUnose() {
    const container = document.getElementById('entriesContainer');
    if (!container) return;
    const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    container.innerHTML = `<div class="table-row header-row"><div class="cell">${t('komad')}</div><div class="cell">${t('kolicina')}</div><div class="cell">${t('jedinica_mere')}</div><div class="cell">${t('rok_trajanja')}</div><div class="cell">${t('mesto_skladistenja')}</div></div>`;
    const aktivni = zalihe.filter(p => p.quantity > 0);
    if (aktivni.length === 0) {
        container.innerHTML += `<div class="table-row"><div class="cell" style="grid-column:span 5;text-align:center;color:#999;">${t('nema_proizvoda')}</div></div>`;
        return;
    }
    aktivni.forEach(p => {
        const expiry = new Date(p.entry_date);
        expiry.setMonth(expiry.getMonth() + p.shelf_life_months);
        container.innerHTML += `
            <div class="table-row">
                <div class="cell">${p.piece || '-'}</div>
                <div class="cell">${p.quantity}</div>
                <div class="cell">${p.unit}</div>
                <div class="cell">${expiry.toLocaleDateString('sr-RS', {month:'2-digit',year:'2-digit'})}</div>
                <div class="cell">${p.storage_location}</div>
            </div>
        `;
    });
}

function saveProduct() {
    const product = document.getElementById('productName')?.value.trim();
    const quantity = document.getElementById('productQuantity')?.value.trim();
    if (!product) { showModernAlert(t('missing_info'), t('enter_product_name')); return; }
    if (!quantity || isNaN(parseFloat(quantity))) { showModernAlert(t('missing_info'), t('enter_quantity')); return; }
    const productData = {
        id: Date.now(),
        product_name: product,
        description: document.getElementById('productDescription')?.value.trim() || '',
        piece: document.getElementById('productPiece')?.value.trim() || '1',
        quantity: parseFloat(quantity),
        unit: document.getElementById('productUnit')?.value || 'kg',
        entry_date: document.getElementById('productDate')?.value || new Date().toISOString().split('T')[0],
        shelf_life_months: parseInt(document.getElementById('productExpiry')?.value) || 12,
        storage_location: document.getElementById('productStorage')?.value || 'Ostalo'
    };
    let zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    zalihe.push(productData);
    localStorage.setItem('zalihe', JSON.stringify(zalihe));
    prikaziSveUnose();
    document.getElementById('productQuantity').value = '';
    document.getElementById('productExpiry').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productPiece').value = '';
    document.getElementById('productName').focus();
    showModernAlert(t('success'), t('product_saved'), '✅');
}

function renderInventory() {
    currentScreenState = 'inventory';
    const content = document.getElementById('mainContent');
    if (!content) return;
    const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    const aktivne = zalihe.filter(p => p.quantity > 0);
    let html = `<div class="title">${t('stanje')}</div>`;
    html += `<div style="display:flex;gap:10px;margin-bottom:15px;flex-wrap:wrap;">
        <button onclick="renderCategories()" style="background:#666;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;">✖ ${t('odustani')}</button>
    </div>`;
    html += `<div class="table-container"><div class="table-title">📦 ${t('stanje')}</div>`;
    html += `<div class="table-row header-row"><div class="cell">${t('naziv_proizvoda')}</div><div class="cell">${t('kolicina')}</div><div class="cell">${t('jedinica_mere')}</div><div class="cell">${t('rok_trajanja')}</div><div class="cell">${t('mesto_skladistenja')}</div></div>`;
    if (aktivne.length === 0) {
        html += `<div class="table-row"><div class="cell" style="grid-column:span 5;text-align:center;color:#999;">${t('nema_proizvoda')}</div></div>`;
    } else {
        aktivne.forEach(p => {
            const expiry = new Date(p.entry_date);
            expiry.setMonth(expiry.getMonth() + p.shelf_life_months);
            html += `<div class="table-row"><div class="cell">${p.product_name}</div><div class="cell">${p.quantity}</div><div class="cell">${p.unit}</div><div class="cell">${expiry.toLocaleDateString('sr-RS', {month:'2-digit',year:'2-digit'})}</div><div class="cell">${p.storage_location}</div></div>`;
        });
    }
    html += `</div></div>`;
    content.innerHTML = html;
}

function renderShoppingList() {
    currentScreenState = 'shopping';
    const content = document.getElementById('mainContent');
    if (!content) return;
    const shopping = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    let html = `<div class="title">${t('spisak_potreba')}</div>`;
    html += `<div style="display:flex;gap:10px;margin-bottom:15px;flex-wrap:wrap;">
        <button onclick="renderCategories()" style="background:#666;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;">✖ ${t('odustani')}</button>
    </div>`;
    html += `<div class="table-container"><div class="table-title">🛒 ${t('spisak_potreba')}</div>`;
    html += `<div class="table-row header-row"><div class="cell">${t('naziv_proizvoda')}</div><div class="cell">${t('opis')}</div></div>`;
    if (shopping.length === 0) {
        html += `<div class="table-row"><div class="cell" style="grid-column:span 2;text-align:center;color:#999;">${t('nema_proizvoda')}</div></div>`;
    } else {
        shopping.forEach(p => {
            html += `<div class="table-row"><div class="cell">${p.product_name}</div><div class="cell">${p.description || ''}</div></div>`;
        });
    }
    html += `</div></div>`;
    content.innerHTML = html;
}

function handleBackAction() {
    if (currentScreenState === 'dataEntry') {
        if (currentCategory) renderSubcategories(currentCategory);
        else showScreen('choiceScreen');
    } else if (currentScreenState === 'categories') {
        showScreen('choiceScreen');
    } else {
        renderCategories();
    }
}

function renderSubcategories(category) {
    currentCategory = category;
    currentScreenState = 'subcategories';
    const content = document.getElementById('mainContent');
    if (!content) return;
    content.innerHTML = `
        <div class="title">${t('podkategorije')}</div>
        <div class="categories-grid">
            <button class="category-btn" style="background:#ddd;" onclick="renderDataEntry('')">${t('Ostalo')}</button>
        </div>
    `;
}

function triggerLogin() {
    console.log("🔐 triggerLogin pozvan!");
    const phoneInput = document.getElementById('phoneInput');
    if (!phoneInput) { showModernAlert('Greška', 'Polje za telefon nije pronađeno!', '❌'); return; }
    const phone = phoneInput.value.trim();
    console.log("📱 Unet broj:", phone);
    if (phone.length >= 9) {
        console.log("✅ Login uspešan");
        showScreen('languageScreen');
        renderLanguages();
    } else {
        showModernAlert('Greška', 'Unesite validan broj telefona (9+ cifara)!', '📱');
    }
}

// ============================================
// 3. JEDINI ENTER HANDLER - NAJJEDNOSTAVNIJI
// ============================================

// DIREKTNO NA ELEMENT - OVO RADI 100%
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Postavljam ENTER za login...');
    
    const phoneInput = document.getElementById('phoneInput');
    if (!phoneInput) {
        console.error('❌ phoneInput nije pronađen!');
        return;
    }
    
    // ZAMENI ELEMENT - ovo uklanja sve stare event listenere
    const newInput = phoneInput.cloneNode(true);
    phoneInput.parentNode.replaceChild(newInput, phoneInput);
    
    // DODAJ NOVI EVENT LISTENER
    newInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            console.log('📱 ENTER PRITISNUT!');
            
            // DIREKTNO POZOVI
            if (typeof triggerLogin === 'function') {
                triggerLogin();
            } else {
                const btn = document.getElementById('loginBtn');
                if (btn) btn.click();
            }
            return false;
        }
    });
    
    console.log('✅ ENTER radi na login polju!');
});

// ============================================
// 4. GLOBALNI ENTER ZA DATA ENTRY POLJA
// ============================================

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const active = document.activeElement;
        if (!active) return;
        const fields = ['productName', 'productPiece', 'productQuantity', 'productExpiry', 'productDescription', 'productDate'];
        if (fields.includes(active.id)) {
            e.preventDefault();
            e.stopPropagation();
            console.log('📝 Enter na polju:', active.id);
            if (typeof saveProduct === 'function') saveProduct();
        }
    }
}, true);

console.log('✅ SVE JE SPREMNO! APP RADI!');
// KRAJ FAJLA
