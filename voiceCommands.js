// ============================================
// VOICE COMMANDS - STALNO SLUŠANJE VERZIJA
// ============================================

let recognition = null;
let fullSpeechResult = '';
let speechTimeout = null;
let isProcessing = false;
let voiceProducts = [];
let isListening = false;
let isDataEntryOpen = false;

// ===== OTVORI GLASOVNI DATA ENTRY =====
function openVoiceDataEntry() {
    console.log('📂 Otvaram Voice Data Entry');
    
    const screen = document.getElementById('voiceDataEntryScreen');
    if (screen) {
        screen.style.display = 'flex';
        screen.classList.add('active');
    }
    
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
    }
    
    voiceProducts = [];
    updateVoiceProductList();
    isDataEntryOpen = true;
    
    const status = document.getElementById('voiceStatus');
    if (status) {
        status.textContent = '🎤 Recite "Start" pa diktirajte podatke';
        status.style.color = '#2196F3';
    }
    
    setTimeout(() => {
        const input = document.getElementById('voiceProductInput');
        if (input) input.focus();
    }, 300);
    
    // Pokreni mikrofon ako nije već pokrenut
    if (!isListening) {
        startVoiceRecognition();
    }
}

// ===== ZATVORI GLASOVNI DATA ENTRY =====
function closeVoiceDataEntry() {
    console.log('📂 Zatvaram Voice Data Entry');
    
    const screen = document.getElementById('voiceDataEntryScreen');
    if (screen) {
        screen.style.display = 'none';
        screen.classList.remove('active');
    }
    
    isDataEntryOpen = false;
    
    // NE zaustavljaj mikrofon - neka nastavi da sluša
    // stopVoiceRecognition();
}

// ===== SAČUVAJ PROIZVOD IZ GLASA =====
function saveVoiceProduct() {
    const nameInput = document.getElementById('voiceProductInput');
    const quantityInput = document.getElementById('voiceQuantityInput');
    const unitSelect = document.getElementById('voiceUnitSelect');
    const shelfLifeInput = document.getElementById('voiceShelfLifeInput');
    const storageSelect = document.getElementById('voiceStorageSelect');
    
    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
        showAlert('Greška', 'Unesite naziv proizvoda!', '❌');
        return;
    }
    
    const product = {
        product_name: name,
        quantity: quantityInput ? quantityInput.value : '1',
        unit: unitSelect ? unitSelect.value : 'komad',
        shelf_life: shelfLifeInput ? shelfLifeInput.value : '12',
        storage: storageSelect ? storageSelect.value : 'Soba'
    };
    
    voiceProducts.push(product);
    updateVoiceProductList();
    
    if (nameInput) nameInput.value = '';
    if (quantityInput) quantityInput.value = '1';
    if (shelfLifeInput) shelfLifeInput.value = '12';
    
    const status = document.getElementById('voiceStatus');
    if (status) {
        status.textContent = `✅ Dodato: ${product.product_name} (${product.quantity} ${product.unit})`;
        status.style.color = '#4CAF50';
    }
    
    if (nameInput) nameInput.focus();
}

// ===== AŽURIRAJ LISTU PROIZVODA =====
function updateVoiceProductList() {
    const container = document.getElementById('voiceProductList');
    if (!container) return;
    
    if (voiceProducts.length === 0) {
        container.innerHTML = '<p style="color:#999; text-align:center;">📭 Još nema dodanih proizvoda</p>';
        return;
    }
    
    let html = '';
    voiceProducts.forEach((p, i) => {
        html += `
            <div style="display:flex; justify-content:space-between; padding:8px; background:${i % 2 === 0 ? '#f9f9f9' : 'white'}; border-radius:5px; margin:3px 0;">
                <span>${p.product_name}</span>
                <span style="color:#666;">${p.quantity} ${p.unit} | Rok: ${p.shelf_life}m | ${p.storage}</span>
                <button onclick="removeVoiceProduct(${i})" style="background:#ff4444; color:white; border:none; border-radius:50%; width:25px; height:25px; cursor:pointer;">✕</button>
            </div>
        `;
    });
    container.innerHTML = html;
}

// ===== UKLONI PROIZVOD =====
function removeVoiceProduct(index) {
    voiceProducts.splice(index, 1);
    updateVoiceProductList();
}

// ===== SAČUVAJ SVE PROIZVODE =====
function saveAllVoiceProducts() {
    console.log('💾 Čuvam sve proizvode:', voiceProducts.length);
    
    if (voiceProducts.length === 0) {
        showAlert('ℹ️ Info', 'Nema proizvoda za čuvanje.', '📭');
        return;
    }
    
    voiceProducts.forEach((p, i) => {
        setTimeout(() => {
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            products.push({
                id: Date.now() + i,
                product_name: p.product_name,
                piece: p.quantity,
                quantity: p.quantity,
                unit: p.unit,
                shelf_life: p.shelf_life,
                storage: p.storage,
                date_added: new Date().toISOString()
            });
            localStorage.setItem('products', JSON.stringify(products));
            
            const recent = JSON.parse(localStorage.getItem('recentVoiceEntries') || '[]');
            recent.push({
                product_name: p.product_name,
                timestamp: new Date().toISOString()
            });
            if (recent.length > 20) recent.shift();
            localStorage.setItem('recentVoiceEntries', JSON.stringify(recent));
        }, i * 200);
    });
    
    showAlert('✅ Uspešno', `Sačuvano ${voiceProducts.length} proizvoda!`, '🎤');
    voiceProducts = [];
    updateVoiceProductList();
    
    setTimeout(() => {
        if (typeof loadProductsFromStorage === 'function') {
            loadProductsFromStorage();
        }
        if (typeof renderInventory === 'function') {
            renderInventory();
        }
    }, 1000);
}

// ===== ISPRAVLJENO PARSIRANJE =====
function parseVoiceCommand(command) {
    console.log('🔍 Parsiram:', command);
    
    const result = {
        product_name: '',
        quantity: '1',
        unit: 'komad',
        shelf_life: '12',
        storage: 'Soba'
    };
    
    // Ukloni "start" i "plus"
    let clean = command.replace(/^(start|stat|stard)\s*/i, '').trim();
    clean = clean.replace(/\bplus\b/gi, '').trim();
    clean = clean.replace(/\bpa\b/gi, '').trim();
    clean = clean.replace(/\bi\b/gi, '').trim();
    clean = clean.replace(/\s+/g, ' ').trim();
    
    if (!clean) return result;
    
    console.log('🧹 Očišćeno:', clean);
    
    // ===== 1. PRONAĐI BROJ I JEDINICU =====
    // Pokušaj sve pattern-e
    const patterns = [
        { regex: /(\d+)\s*(?:kg|kilogram|kilograma)/i, unit: 'kg' },
        { regex: /(\d+)\s*(?:g|gram|grama)/i, unit: 'g' },
        { regex: /(\d+)\s*(?:l|lit|litra|litara)/i, unit: 'l' },
        { regex: /(\d+)\s*(?:ml|mililitar|mililitara)/i, unit: 'ml' },
        { regex: /(\d+)\s*(?:komad|kom|parče|parčeta)/i, unit: 'komad' },
        { regex: /(\d+)\s*(?:kom)/i, unit: 'komad' },
    ];
    
    let foundQuantity = false;
    for (const p of patterns) {
        const match = clean.match(p.regex);
        if (match) {
            result.quantity = match[1];
            result.unit = p.unit;
            foundQuantity = true;
            console.log(`✅ Pronađena količina: ${result.quantity} ${result.unit}`);
            break;
        }
    }
    
    // Ako nije pronađena, traži bilo koji broj
    if (!foundQuantity) {
        const numMatch = clean.match(/(\d+)/);
        if (numMatch) {
            result.quantity = numMatch[1];
            result.unit = 'komad';
            console.log(`✅ Pronađen broj: ${result.quantity} (default jedinica: komad)`);
        }
    }
    
    // ===== 2. PRONAĐI ROK TRAJANJA =====
    const rokPatterns = [
        /rok\s*(\d+)/i,
        /(\d+)\s*(?:mesec|meseci|m)/i,
        /(\d+)\s*(?:m|mes)/i
    ];
    
    for (const pattern of rokPatterns) {
        const match = clean.match(pattern);
        if (match) {
            result.shelf_life = match[1];
            console.log(`✅ Pronađen rok: ${result.shelf_life} meseci`);
            break;
        }
    }
    
    // ===== 3. PRONAĐI SKLADIŠTE =====
    const storageMap = {
        'zamrzivač': 'Zamrzivač',
        'zamrzivac': 'Zamrzivač',
        'frizider': 'Frižider',
        'frižider': 'Frižider',
        'soba': 'Soba',
        'podrum': 'Podrum',
        'ostava': 'Ostava'
    };
    
    for (const [key, value] of Object.entries(storageMap)) {
        if (clean.toLowerCase().includes(key)) {
            result.storage = value;
            console.log(`✅ Pronađeno skladište: ${result.storage}`);
            break;
        }
    }
    
    // ===== 4. IZDVOJI NAZIV (SVE PRE BROJA) =====
    const numMatch = clean.match(/(\d+)/);
    if (numMatch && numMatch.index !== undefined) {
        let namePart = clean.substring(0, numMatch.index).trim();
        // Ukloni reči koje nisu deo naziva
        const removeWords = ['kg', 'kilogram', 'gram', 'litar', 'litra', 'ml', 'komad', 'parče', 
                             'rok', 'mesec', 'meseci', 'zamrzivač', 'frizider', 'soba', 'podrum', 
                             'ostava', 'kom'];
        removeWords.forEach(word => {
            namePart = namePart.replace(new RegExp('\\b' + word + '\\b', 'gi'), '');
        });
        result.product_name = namePart.replace(/\s+/g, ' ').trim();
    } else {
        // Ako nema broja, ceo tekst je naziv
        result.product_name = clean.replace(/\s+/g, ' ').trim();
    }
    
    // Ako je naziv prazan, pokušaj da izvučeš sve pre prvog keyword-a
    if (!result.product_name) {
        const keywords = ['kg', 'kilogram', 'gram', 'litar', 'litra', 'ml', 'komad', 'parče', 'rok'];
        let minIndex = clean.length;
        for (const kw of keywords) {
            const idx = clean.toLowerCase().indexOf(kw);
            if (idx !== -1 && idx < minIndex) minIndex = idx;
        }
        if (minIndex < clean.length) {
            result.product_name = clean.substring(0, minIndex).trim();
        } else {
            result.product_name = clean;
        }
    }
    
    console.log('✅ Parsirani podaci:', result);
    return result;
}

// ===== OBRADI START KOMANDU =====
function processStartCommand(command) {
    if (isProcessing) {
        console.log('⏳ Već obrađujem...');
        return false;
    }
    
    isProcessing = true;
    console.log('🚀 Start komanda:', command);
    
    try {
        // Otvori Data Entry ako nije otvoren
        if (!isDataEntryOpen) {
            openVoiceDataEntry();
            // Sačekaj da se otvori
            setTimeout(() => {
                procesirajStartKomandu(command);
            }, 500);
        } else {
            procesirajStartKomandu(command);
        }
        return true;
    } catch (error) {
        console.error('❌ Greška:', error);
        isProcessing = false;
        return false;
    }
}

// ===== PROCESIRAJ START KOMANDU =====
function procesirajStartKomandu(command) {
    const data = parseVoiceCommand(command);
    
    if (!data.product_name || data.product_name.length < 2) {
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.textContent = '❌ Nije prepoznat naziv. Pokušajte: "Start gril pile 2kg"';
            status.style.color = '#f44336';
        }
        isProcessing = false;
        return;
    }
    
    // Popuni polja
    const nameInput = document.getElementById('voiceProductInput');
    const quantityInput = document.getElementById('voiceQuantityInput');
    const unitSelect = document.getElementById('voiceUnitSelect');
    const shelfLifeInput = document.getElementById('voiceShelfLifeInput');
    const storageSelect = document.getElementById('voiceStorageSelect');
    
    if (nameInput) nameInput.value = data.product_name;
    if (quantityInput) quantityInput.value = data.quantity;
    if (shelfLifeInput) shelfLifeInput.value = data.shelf_life;
    
    if (unitSelect && data.unit) {
        for (let opt of unitSelect.options) {
            if (opt.value === data.unit) {
                opt.selected = true;
                break;
            }
        }
    }
    
    if (storageSelect && data.storage) {
        for (let opt of storageSelect.options) {
            if (opt.value === data.storage) {
                opt.selected = true;
                break;
            }
        }
    }
    
    const status = document.getElementById('voiceStatus');
    if (status) {
        status.textContent = `📝 ${data.product_name} (${data.quantity} ${data.unit}, rok: ${data.shelf_life}m, ${data.storage})`;
        status.style.color = '#FFD700';
    }
    
    // Sačuvaj automatski
    setTimeout(() => {
        saveVoiceProduct();
        isProcessing = false;
        
        // Pokaži da je dodato
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.textContent = `✅ Dodato: ${data.product_name} - recite sledeći unos ili "End"`;
            status.style.color = '#4CAF50';
        }
    }, 500);
}

// ===== OBRADI END KOMANDU =====
function processEndCommand() {
    console.log('🏁 End komanda');
    
    if (voiceProducts.length > 0) {
        saveAllVoiceProducts();
        showAlert('✅ Završeno', `Sačuvano ${voiceProducts.length} proizvoda!`, '📦');
    } else {
        showAlert('ℹ️ Info', 'Nema proizvoda za čuvanje.', '📭');
    }
    
    // Zatvori Data Entry ali NE gasi mikrofon
    const screen = document.getElementById('voiceDataEntryScreen');
    if (screen) {
        screen.style.display = 'none';
        screen.classList.remove('active');
    }
    isDataEntryOpen = false;
    
    // Prikaži zalihe
    setTimeout(() => {
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        if (typeof renderInventory === 'function') {
            renderInventory();
        }
        setTimeout(() => {
            oznaciNoveUnose();
        }, 300);
    }, 500);
}

// ===== OZNAČI NOVE UNOSE =====
function oznaciNoveUnose() {
    console.log('🔵 Označavam nove unose');
    
    const inventoryRows = document.querySelectorAll('#inventoryTable tbody tr');
    if (!inventoryRows.length) return;
    
    const recentProducts = JSON.parse(localStorage.getItem('recentVoiceEntries') || '[]');
    const recentNames = recentProducts.map(p => p.product_name);
    
    inventoryRows.forEach((row) => {
        row.classList.remove('new-entry', 'voice-new-entry');
        row.style.backgroundColor = '';
        row.style.borderLeft = '';
        
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
            const productName = cells[0]?.textContent?.trim() || '';
            if (recentNames.includes(productName)) {
                row.classList.add('new-entry', 'voice-new-entry');
                row.style.backgroundColor = '#e3f2fd';
                row.style.borderLeft = '4px solid #2196F3';
            }
        }
    });
}

// ===== DODAJ STILOVE =====
function addHighlightAnimation() {
    if (document.getElementById('voiceStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'voiceStyles';
    style.textContent = `
        @keyframes highlightNew {
            0% { background-color: #e3f2fd; }
            50% { background-color: #bbdefb; }
            100% { background-color: #e3f2fd; }
        }
        .new-entry {
            animation: highlightNew 2s ease 3;
            border-left: 4px solid #2196F3 !important;
        }
    `;
    document.head.appendChild(style);
}

// ===== GLAVNA FUNKCIJA ZA OBRADU KOMANDI =====
function processVoiceCommand(command) {
    console.log('🎤 Prima:', command);
    
    if (!command || command.trim() === '') return false;
    if (isProcessing) {
        console.log('⏳ Ignorišem, već obrađujem');
        return false;
    }
    
    const cmd = command.toLowerCase().trim();
    console.log('📝 Normalizovano:', cmd);
    
    // Sakrij voice menu
    hideVoiceMenu();
    
    // ===== START =====
    if (cmd.includes('start') || cmd.includes('stat') || cmd.includes('stard')) {
        console.log('🚀 START!');
        processStartCommand(command);
        return true;
    }
    
    // ===== END =====
    if (cmd.includes('end') || cmd.includes('kraj') || cmd.includes('gotovo') || 
        cmd.includes('stop') || cmd.includes('završi') || cmd.includes('done')) {
        console.log('🏁 END!');
        processEndCommand();
        return true;
    }
    
    // ===== UNOS =====
    const entryKeywords = ['unos', 'unesi', 'dodaj', 'novi', 'podatak', 'add', 'product', 'entry', 'data', 'new'];
    if (entryKeywords.some(k => cmd.includes(k))) {
        console.log('✅ UNOS PODATAKA');
        openVoiceDataEntry();
        return true;
    }
    
    // ===== ZALIHE =====
    const invKeywords = ['stanje', 'zalihe', 'inventar', 'inventory', 'stock'];
    if (invKeywords.some(k => cmd.includes(k))) {
        console.log('✅ ZALIHE');
        closeVoiceDataEntry();
        setTimeout(() => {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderInventory === 'function') {
                renderInventory();
            }
        }, 300);
        return true;
    }
    
    // ===== MENI =====
    const menuKeywords = ['meni', 'početna', 'home', 'menu'];
    if (menuKeywords.some(k => cmd.includes(k))) {
        closeVoiceDataEntry();
        setTimeout(() => {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderCategories === 'function') {
                renderCategories();
            }
        }, 300);
        return true;
    }
    
    // ===== NAZAD =====
    const backKeywords = ['nazad', 'vrati', 'odustani', 'back', 'cancel'];
    if (backKeywords.some(k => cmd.includes(k))) {
        closeVoiceDataEntry();
        return true;
    }
    
    console.log('❌ Nepoznato:', cmd);
    showAlert('Nepoznata komanda', `"${command}" nije prepoznato.`, '❓');
    return false;
}

// ===== POKRETAČ MIKROFONA =====
function startVoiceRecognition() {
    if (isListening) {
        console.log('🎤 Već slušam');
        return;
    }
    
    fullSpeechResult = '';
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        speechTimeout = null;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showAlert('Greška', 'Pretraživač ne podržava glasovne komande.', '❌');
        return;
    }
    
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    
    recognition = new SpeechRecognition();
    recognition.lang = 'sr-RS';
    recognition.continuous = true;
    recognition.interimResults = true;
    
    const status = document.getElementById('voiceStatus');
    if (status) {
        status.textContent = '🎤 Slušam...';
        status.style.color = '#2196F3';
    }
    
    recognition.onstart = function() {
        console.log('🎤 Mikrofon uključen');
        isListening = true;
        fullSpeechResult = '';
    };
    
    recognition.onresult = function(event) {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                fullSpeechResult += event.results[i][0].transcript + ' ';
            }
        }
        
        const text = fullSpeechResult.trim();
        const status = document.getElementById('voiceStatus');
        if (status && text) {
            status.textContent = `🗣️ "${text}"`;
            status.style.color = '#FFD700';
        }
        
        clearTimeout(speechTimeout);
        speechTimeout = setTimeout(() => {
            const finalText = fullSpeechResult.trim();
            if (finalText && !isProcessing) {
                processVoiceCommand(finalText);
            }
            fullSpeechResult = '';
        }, 1500);
    };
    
    recognition.onerror = function(event) {
        console.error('⚠️ Greška:', event.error);
        isListening = false;
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.textContent = '❌ Greška. Pokušajte ponovo.';
            status.style.color = '#f44336';
        }
        if (event.error === 'not-allowed') {
            showAlert('Greška', 'Dozvolite pristup mikrofonu!', '🎤');
        }
    };
    
    recognition.onend = function() {
        console.log('🎤 Mikrofon isključen');
        isListening = false;
        
        // Automatski restart ako je data entry otvoren
        if (isDataEntryOpen && !isProcessing) {
            setTimeout(() => {
                if (!isListening && isDataEntryOpen) {
                    startVoiceRecognition();
                }
            }, 1000);
        }
    };
    
    try {
        recognition.start();
        isListening = true;
    } catch(e) {
        console.error('❌ Greška:', e);
        isListening = false;
    }
}

// ===== ZAUSTAVI MIKROFON =====
function stopVoiceRecognition() {
    console.log('🛑 Zaustavljam');
    isListening = false;
    fullSpeechResult = '';
    
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        speechTimeout = null;
    }
    
    if (recognition) {
        try {
            recognition.stop();
            recognition = null;
        } catch(e) {}
    }
}

// ===== SAKRIJ VOICE MENI =====
function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
        console.log('🔇 Voice menu sakriven');
    }
}

// ===== ALERT =====
function showAlert(title, message, icon = 'ℹ️') {
    document.querySelectorAll('.modern-alert').forEach(el => el.remove());
    
    const div = document.createElement('div');
    div.className = 'modern-alert';
    div.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 99999;
        max-width: 400px;
        width: 90%;
        text-align: center;
    `;
    div.innerHTML = `
        <div style="font-size:48px;">${icon}</div>
        <h3 style="margin:10px 0;">${title}</h3>
        <p style="color:#666;">${message}</p>
        <button onclick="this.parentElement.remove()" style="
            background:#4CAF50; color:white; border:none;
            padding:10px 30px; border-radius:25px; font-size:16px;
            cursor:pointer; margin-top:15px;
        ">OK</button>
    `;
    document.body.appendChild(div);
}

// ===== INICIJALIZACIJA =====
function initVoiceCommands() {
    addHighlightAnimation();
    console.log('✅ Voice Commands - STALNO SLUŠANJE!');
    console.log('📖 Komande:');
    console.log('   "Unos" - otvara glasovni unos');
    console.log('   "Start gril pile 2kg 6 zamrzivač" - dodaje proizvod');
    console.log('   "Start mleko 2l 14 frižider" - dodaje sledeći');
    console.log('   "End" - završava i čuva sve');
}

// ===== IZVEZI =====
window.openVoiceDataEntry = openVoiceDataEntry;
window.closeVoiceDataEntry = closeVoiceDataEntry;
window.saveVoiceProduct = saveVoiceProduct;
window.removeVoiceProduct = removeVoiceProduct;
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.processVoiceCommand = processVoiceCommand;
window.initVoiceCommands = initVoiceCommands;

// ===== POKRENI =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVoiceCommands);
} else {
    initVoiceCommands();
}
