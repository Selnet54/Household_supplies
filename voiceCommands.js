// ============================================
// VOICE COMMANDS - START PRVI PUT, PLUS ZA SLEDEĆE
// ============================================

let recognition = null;
let fullSpeechResult = '';
let isProcessing = false;
let isListening = false;
let speechTimeout = null;
let currentSpeech = '';
let trenutniProizvod = null;
let prviUnos = true; // Da li je prvi unos

// ===== SAKRIVANJE VOICE MENIJA =====
function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
    }
}

// ===== OTVORI DATA ENTRY =====
function openDataEntryScreen() {
    console.log('📂 Otvaram Data Entry');
    
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    
    hideVoiceMenu();
    
    if (typeof renderDataEntry === 'function') {
        renderDataEntry('');
    }
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎤 Recite "Start" pa diktirajte podatke';
        statusEl.style.color = '#4CAF50';
    }
    
    // Resetujemo stanje
    prviUnos = true;
    trenutniProizvod = null;
    
    setTimeout(() => {
        const productInput = document.getElementById('productInput');
        if (productInput) productInput.focus();
    }, 300);
    
    if (!isListening) {
        startVoiceRecognition();
    }
}

// ===== POPUNI POLJA (BEZ ČUVANJA) =====
function popuniPoljaBezCuvanja(proizvod, kolicina, jedinica, skladiste, rok) {
    console.log('📝 POPUNJAVAM POLJA:', {proizvod, kolicina, jedinica, skladiste, rok});
    
    if (!proizvod || proizvod.length < 1 || proizvod === 'start') {
        console.error('❌ Nema validnog naziva proizvoda!');
        return false;
    }
    
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const unitSelect = document.getElementById('unitSelect');
    const storageSelect = document.getElementById('storageSelect');
    
    // Popuni polja
    if (productInput) {
        productInput.value = proizvod;
        productInput.dispatchEvent(new Event('input', { bubbles: true }));
        productInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Proizvod:', proizvod);
    }
    
    if (pieceInput) {
        pieceInput.value = '1';
        pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    if (quantityInput) {
        quantityInput.value = kolicina;
        quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('✅ Količina:', kolicina);
    }
    
    if (shelfLifeInput) {
        shelfLifeInput.value = rok || '12';
        shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('✅ Rok:', rok || '12');
    }
    
    if (unitSelect) {
        for (let option of unitSelect.options) {
            if (option.value === jedinica || 
                option.text.trim().toLowerCase() === jedinica.toLowerCase()) {
                option.selected = true;
                unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('✅ Jedinica:', jedinica);
                break;
            }
        }
    }
    
    if (storageSelect) {
        for (let option of storageSelect.options) {
            const value = (option.value || '').trim().toLowerCase();
            const text = (option.text || '').trim().toLowerCase();
            const wanted = skladiste.trim().toLowerCase();
            if (value === wanted || text === wanted || value.includes(wanted) || text.includes(wanted)) {
                option.selected = true;
                storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('✅ Skladište:', skladiste);
                break;
            }
        }
    }
    
    if (typeof updateExpiryDate === 'function') {
        updateExpiryDate();
    }
    
    if (typeof prikaziSveUnose === 'function') {
        prikaziSveUnose();
    }
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `✅ ${proizvod} - ${kolicina} ${jedinica} | Recite "PLUS" za sledeći ili "END" za zalihe`;
        statusEl.style.color = '#4CAF50';
    }
    
    // Sačuvaj u localStorage (samo za istoriju)
    const recent = JSON.parse(localStorage.getItem('recentVoiceEntries') || '[]');
    recent.push({ 
        product_name: proizvod, 
        quantity: kolicina,
        unit: jedinica,
        storage: skladiste,
        timestamp: new Date().toISOString() 
    });
    if (recent.length > 50) recent.shift();
    localStorage.setItem('recentVoiceEntries', JSON.stringify(recent));
    
    // SAČUVAJ TRENUTNI PROIZVOD ZA KASNIJE
    trenutniProizvod = {
        product: proizvod,
        quantity: kolicina,
        unit: jedinica,
        storage: skladiste,
        shelf_life: rok
    };
    
    showModernAlert('📝 Popunjeno', 
        `${proizvod}\n${kolicina} ${jedinica}\nSkladište: ${skladiste}\n\nRecite "PLUS" za sledeći unos\nRecite "END" za otvaranje zaliha`, 
        '📋');
    
    isProcessing = false;
    return true;
}

// ===== SAČUVAJ TRENUTNI PROIZVOD I PRIPREMI SLEDEĆI =====
function sacuvajIPripremiSledeci() {
    if (!trenutniProizvod) {
        console.log('⚠️ Nema proizvoda za čuvanje');
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '⚠️ Nema proizvoda. Recite "Start" prvo.';
            statusEl.style.color = '#FF9800';
        }
        return;
    }
    
    console.log('💾 ČUVAM I PRIPREMAM SLEDEĆI:', trenutniProizvod);
    
    let saved = false;
    
    // Probaj saveProduct()
    if (typeof saveProduct === 'function') {
        try {
            saveProduct();
            saved = true;
            console.log('✅ saveProduct() pozvan');
        } catch(e) {
            console.error('⚠️ Greška:', e);
        }
    }
    
    if (!saved && typeof window.saveProduct === 'function') {
        try {
            window.saveProduct();
            saved = true;
            console.log('✅ window.saveProduct() pozvan');
        } catch(e) {
            console.error('⚠️ Greška:', e);
        }
    }
    
    if (!saved) {
        const saveBtn = document.querySelector('#saveProductBtn') || 
                       document.querySelector('[onclick*="save"]') ||
                       document.querySelector('.save-btn');
        if (saveBtn) {
            saveBtn.click();
            saved = true;
            console.log('✅ Kliknuto na dugme');
        }
    }
    
    if (saved) {
        showModernAlert('✅ Sačuvano', 
            `${trenutniProizvod.product}\n${trenutniProizvod.quantity} ${trenutniProizvod.unit}\n\nSpreman za sledeći unos!`, 
            '🎤');
    } else {
        showModernAlert('ℹ️ Info', 
            `Podaci su u poljima.\nKliknite "Sačuvaj" ručno.`, 
            '📝');
    }
    
    // Očisti trenutni proizvod
    trenutniProizvod = null;
    
    // Pripremi polja za sledeći unos
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    
    if (productInput) {
        productInput.value = '';
        productInput.focus();
    }
    if (pieceInput) pieceInput.value = '1';
    if (quantityInput) quantityInput.value = '1';
    if (shelfLifeInput) shelfLifeInput.value = '12';
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎤 Sada recite "Start" za novi unos';
        statusEl.style.color = '#4CAF50';
    }
}

// ===== SAČUVAJ I OTVORI ZALIHE =====
function sacuvajIOtvoriZalihe() {
    if (trenutniProizvod) {
        console.log('💾 ČUVAM POSLEDNJI PROIZVOD:', trenutniProizvod);
        
        let saved = false;
        
        if (typeof saveProduct === 'function') {
            try {
                saveProduct();
                saved = true;
                console.log('✅ saveProduct() pozvan');
            } catch(e) {
                console.error('⚠️ Greška:', e);
            }
        }
        
        if (!saved && typeof window.saveProduct === 'function') {
            try {
                window.saveProduct();
                saved = true;
                console.log('✅ window.saveProduct() pozvan');
            } catch(e) {
                console.error('⚠️ Greška:', e);
            }
        }
        
        if (!saved) {
            const saveBtn = document.querySelector('#saveProductBtn') || 
                           document.querySelector('[onclick*="save"]') ||
                           document.querySelector('.save-btn');
            if (saveBtn) {
                saveBtn.click();
                saved = true;
                console.log('✅ Kliknuto na dugme');
            }
        }
        
        trenutniProizvod = null;
    }
    
    // OTVORI ZALIHE
    console.log('📦 Otvaram zalihe');
    
    showModernAlert('✅ Završeno', 'Svi unosi su sačuvani!\nOtvaram zalihe...', '📦');
    
    setTimeout(() => {
        // Osveži inventar
        if (typeof loadProductsFromStorage === 'function') {
            loadProductsFromStorage();
            console.log('✅ Zalihe učitane');
        }
        if (typeof renderInventory === 'function') {
            renderInventory();
            console.log('✅ Inventar prikazan');
        }
        if (typeof prikaziSveUnose === 'function') {
            prikaziSveUnose();
        }
        
        // Označi nove unose
        if (typeof oznaciNoveUnose === 'function') {
            oznaciNoveUnose();
        }
        
        // Prebaci na ekran zaliha
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        
        const voiceMenu = document.getElementById('voiceMenuScreen');
        if (voiceMenu) {
            voiceMenu.style.display = 'none';
            voiceMenu.classList.remove('active');
        }
        
        // Zaustavi mikrofon
        stopVoiceRecognition();
        
        isProcessing = false;
    }, 500);
}

// ===== PARSIRANJE =====
function parseVoiceText(text) {
    console.log('🔍 Parsiram:', text);
    
    if (!text || text.trim().length === 0) return null;
    
    let clean = text.replace(/^start\s+/i, '').trim();
    
    if (!clean || clean.length === 0 || clean === 'start') {
        console.log('⚠️ Samo "start" bez podataka');
        return null;
    }
    
    let words = clean.split(/\s+/);
    if (words.length === 0) return null;
    
    let result = {
        product: '',
        quantity: '1',
        unit: 'kom',
        storage: 'Ostava',
        shelf_life: '12'
    };
    
    // 1. PRONAĐI SKLADIŠTE
    const storageMap = {
        'zamrzivač': 'Zamrzivač 1',
        'zamrzivac': 'Zamrzivač 1',
        'frižider': 'Frižider',
        'frizider': 'Frižider',
        'hladnjak': 'Frižider',
        'ostava': 'Ostava',
        'spajz': 'Ostava',
        'špajz': 'Ostava'
    };
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i].toLowerCase();
        for (const [key, value] of Object.entries(storageMap)) {
            if (word.includes(key)) {
                result.storage = value;
                words.splice(i, 1);
                i--;
                console.log('🏠 Skladište:', value);
                break;
            }
        }
    }
    
    // 2. PRONAĐI KOLIČINU I JEDINICU
    const unitMap = {
        'kg': 'kg',
        'kilogram': 'kg',
        'g': 'g',
        'gram': 'g',
        'l': 'l',
        'litar': 'l',
        'litara': 'l',
        'ml': 'ml',
        'kom': 'kom',
        'komad': 'kom',
        'komada': 'kom'
    };
    
    for (let i = 0; i < words.length; i++) {
        const num = parseFloat(words[i].replace(',', '.'));
        if (!isNaN(num) && num > 0) {
            result.quantity = num.toString();
            console.log('🔢 Količina:', num);
            
            if (i + 1 < words.length) {
                const next = words[i + 1].toLowerCase();
                for (const [key, value] of Object.entries(unitMap)) {
                    if (next.includes(key)) {
                        result.unit = value;
                        words.splice(i, 2);
                        i--;
                        console.log('📦 Jedinica:', value);
                        break;
                    }
                }
                if (result.unit !== 'kom') continue;
            }
            
            words.splice(i, 1);
            i--;
        }
    }
    
    // 3. OSTATAK JE NAZIV PROIZVODA
    result.product = words.join(' ').trim();
    console.log('📦 Proizvod:', result.product);
    
    if (!result.product || result.product.length === 0 || result.product === 'start') {
        console.log('⚠️ Nema validnog naziva proizvoda');
        return null;
    }
    
    console.log('✅ Parsirano:', result);
    return result;
}

// ===== OBRADA KOMANDE =====
function processVoiceCommand(text) {
    if (isProcessing) {
        console.log('⏳ Sačekaj...');
        return;
    }
    
    console.log('🎤 Obrada:', text);
    const lower = text.toLowerCase().trim();
    
    // ===== KOMANDA: PLUS - SAČUVAJ I PRIPREMI SLEDEĆI =====
    if (lower === 'plus' || lower.includes('plus') || lower === 'sledeći') {
        sacuvajIPripremiSledeci();
        return;
    }
    
    // ===== KOMANDA: END - SAČUVAJ I OTVORI ZALIHE =====
    if (lower === 'end' || lower === 'kraj' || lower.includes('zalihe') || lower === 'gotovo') {
        sacuvajIOtvoriZalihe();
        return;
    }
    
    // ===== KOMANDA: UNOS =====
    if (lower.includes('unos') || lower.includes('dodaj') || lower.includes('otvori')) {
        isProcessing = true;
        openDataEntryScreen();
        setTimeout(() => { isProcessing = false; }, 500);
        return;
    }
    
    // ===== KOMANDA: POMOĆ =====
    if (lower.includes('pomoć') || lower.includes('help')) {
        showModernAlert('📖 Pomoć', 
            '1. "Unos" - otvori Data Entry\n' +
            '2. "Start [proizvod] [količina] [jedinica]" - prvi unos\n' +
            '3. "PLUS" - sačuvaj i pripremi sledeći\n' +
            '4. "END" - sačuvaj i otvori zalihe\n\n' +
            'Primer: "Start gril pile 2kg 6 zamrzivač"', 
            '💡');
        return;
    }
    
    // ===== KOMANDA: START =====
    if (lower.includes('start')) {
        // Ako nije prvi unos, pitaj da li želi novi proizvod
        if (!prviUnos && trenutniProizvod) {
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = '⚠️ Prvo recite "PLUS" da sačuvate trenutni proizvod';
                statusEl.style.color = '#FF9800';
            }
            showModernAlert('⚠️ Pažnja', 
                `Trenutno imate proizvod:\n${trenutniProizvod.product}\n\nPrvo recite "PLUS" da ga sačuvate, pa onda "Start" za novi.`, 
                '⚠️');
            return;
        }
        
        if (speechTimeout) {
            clearTimeout(speechTimeout);
        }
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = `⏳ Obrada: "${text}"`;
            statusEl.style.color = '#FF9800';
        }
        
        speechTimeout = setTimeout(() => {
            isProcessing = true;
            
            const data = parseVoiceText(text);
            
            if (!data || !data.product) {
                if (statusEl) {
                    statusEl.textContent = '❌ Nije prepoznato. Pokušajte: "Start [proizvod] [količina]"';
                    statusEl.style.color = '#f44336';
                }
                isProcessing = false;
                return;
            }
            
            popuniPoljaBezCuvanja(
                data.product,
                data.quantity,
                data.unit,
                data.storage,
                data.shelf_life
            );
            
            // Posle prvog unosa, više nije prvi
            prviUnos = false;
            
            speechTimeout = null;
        }, 1500);
        
        return;
    }
    
    // ===== NIJE PREPOZNATO =====
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `❌ Nije prepoznato: "${text}"`;
        statusEl.style.color = '#f44336';
        setTimeout(() => {
            statusEl.textContent = '🎤 Recite "Start", "PLUS" ili "END"';
            statusEl.style.color = '#FFD700';
        }, 3000);
    }
}

// ===== MIKROFON =====
function startVoiceRecognition() {
    if (isListening) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showModernAlert('Greška', 'Pretraživač ne podržava glasovne komande.', '❌');
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

    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎤 Slušam...';
        statusEl.style.color = '#2196F3';
    }

    recognition.onstart = function() {
        console.log('🎤 Mikrofon uključen');
        isListening = true;
        currentSpeech = '';
        // Resetujemo stanje pri svakom startu
        prviUnos = true;
        trenutniProizvod = null;
    };

    recognition.onresult = function(event) {
        let fullText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                fullText += event.results[i][0].transcript + ' ';
                console.log('🗣️ Rečeno:', event.results[i][0].transcript);
            }
        }
        
        const speechResult = fullText.trim();
        if (!speechResult) return;
        
        currentSpeech = speechResult;
        
        if (statusEl) {
            statusEl.textContent = `🗣️ "${speechResult}"`;
            statusEl.style.color = '#FFD700';
        }
        
        if (!isProcessing) {
            processVoiceCommand(speechResult);
        }
    };

    recognition.onerror = function(event) {
        console.error('⚠️ Greška:', event.error);
        isListening = false;
        if (statusEl) {
            statusEl.textContent = '❌ Greška. Pokušajte ponovo.';
            statusEl.style.color = '#f44336';
        }
    };

    recognition.onend = function() {
        console.log('🎤 Mikrofon isključen');
        isListening = false;
        setTimeout(() => {
            if (!isListening && document.querySelector('#voiceMenuScreen.active')) {
                startVoiceRecognition();
            }
        }, 1000);
    };

    try {
        recognition.start();
        isListening = true;
    } catch(e) {
        console.error('❌ Greška:', e);
        isListening = false;
    }
}

function stopVoiceRecognition() {
    isListening = false;
    isProcessing = false;
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

function goBackFromVoice() {
    console.log('◀ Povratak');
    stopVoiceRecognition();
    hideVoiceMenu();
    if (typeof showScreen === 'function') {
        showScreen('choiceScreen');
    }
}

function showModernAlert(title, message, icon = 'ℹ️') {
    const existing = document.querySelector('.modern-alert-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'modern-alert-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
        backdrop-filter: blur(5px);
    `;
    
    const box = document.createElement('div');
    box.style.cssText = `
        background: #8B0000;
        border-radius: 24px;
        padding: 40px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        border: 3px solid #FFD700;
        color: #FFD700;
        animation: slideIn 0.3s ease;
    `;
    
    box.innerHTML = `
        <div style="font-size:64px; margin-bottom:15px;">${icon}</div>
        <h2 style="color:#FFD700; margin-bottom:10px; font-size:28px;">${title}</h2>
        <p style="color:#FFD700; font-size:18px; margin-bottom:25px; white-space:pre-line;">${message}</p>
        <button onclick="this.closest('.modern-alert-overlay').remove()" style="
            background: #2E7D32;
            color: #FFD700;
            border: none;
            padding: 12px 40px;
            border-radius: 12px;
            font-size: 18px;
            cursor: pointer;
            font-weight: bold;
        ">OK</button>
    `;
    
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

function addVoiceStyles() {
    if (document.getElementById('voiceStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'voiceStyles';
    style.textContent = `
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-50px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        .voice-microphone {
            text-align: center;
            font-size: 72px;
            animation: pulse 2s infinite;
        }
    `;
    document.head.appendChild(style);
}

// ===== EKSPORT =====
window.processVoiceCommand = processVoiceCommand;
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.openDataEntryScreen = openDataEntryScreen;
window.popuniPoljaBezCuvanja = popuniPoljaBezCuvanja;
window.sacuvajIPripremiSledeci = sacuvajIPripremiSledeci;
window.sacuvajIOtvoriZalihe = sacuvajIOtvoriZalihe;

addVoiceStyles();
console.log('✅ Voice Commands - START PRVI PUT, PLUS ZA SLEDEĆE!');
console.log('📖 Kako radi:');
console.log('   1. "Start gril pile 2kg 6 zamrzivač" → popuni polja (PRVI PUT)');
console.log('   2. "PLUS" → sačuvaj i pripremi sledeći');
console.log('   3. "Start jaja 30 kom" → popuni polja (SLEDEĆI)');
console.log('   4. "PLUS" → sačuvaj i pripremi sledeći');
console.log('   5. "END" → sačuvaj i otvori zalihe');
