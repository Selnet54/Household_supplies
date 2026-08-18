// ============================================
// VOICE COMMANDS - PARSIRA SVE!
// ============================================

let recognition = null;
let isListening = false;
let speechTimeout = null;
let trenutniProizvod = null;
let akumuliraniTekst = '';

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
        statusEl.textContent = '🎤 Recite "Start" pa diktirajte';
        statusEl.style.color = '#4CAF50';
    }
    
    setTimeout(() => {
        const productInput = document.getElementById('productInput');
        if (productInput) productInput.focus();
    }, 300);
    
    if (!isListening) {
        startVoiceRecognition();
    }
}

// ===== POPUNI POLJA =====
function popuniPolja(proizvod, kolicina, jedinica, skladiste, rok) {
    console.log('📝 POPUNJAVAM:', {proizvod, kolicina, jedinica, skladiste, rok});
    
    if (!proizvod || proizvod.length < 1) {
        console.error('❌ Nema proizvoda');
        return false;
    }
    
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const unitSelect = document.getElementById('unitSelect');
    const storageSelect = document.getElementById('storageSelect');
    
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
    
    trenutniProizvod = {
        product: proizvod,
        quantity: kolicina,
        unit: jedinica,
        storage: skladiste,
        shelf_life: rok
    };
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `✅ ${proizvod} - ${kolicina} ${jedinica} | PLUS za sledeći, END za kraj`;
        statusEl.style.color = '#4CAF50';
    }
    
    showModernAlert('📝 Popunjeno', 
        `${proizvod}\n${kolicina} ${jedinica}\nSkladište: ${skladiste}\n\nRecite "PLUS" za sledeći\nRecite "END" za kraj`, 
        '📋');
    
    return true;
}

// ===== SAČUVAJ I PRIPREMI SLEDEĆI =====
function sacuvajIPripremiSledeci() {
    if (!trenutniProizvod) {
        console.log('⚠️ Nema proizvoda');
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '⚠️ Nema proizvoda. Recite "Start" prvo.';
            statusEl.style.color = '#FF9800';
        }
        return;
    }
    
    console.log('💾 ČUVAM:', trenutniProizvod);
    
    let saved = false;
    
    if (typeof saveProduct === 'function') {
        try { saveProduct(); saved = true; console.log('✅ saveProduct()'); } catch(e) {}
    }
    
    if (!saved && typeof window.saveProduct === 'function') {
        try { window.saveProduct(); saved = true; console.log('✅ window.saveProduct()'); } catch(e) {}
    }
    
    if (!saved) {
        const btn = document.querySelector('#saveProductBtn') || 
                   document.querySelector('[onclick*="save"]') ||
                   document.querySelector('.save-btn');
        if (btn) { btn.click(); saved = true; console.log('✅ Kliknuto'); }
    }
    
    if (saved) {
        showModernAlert('✅ Sačuvano', 
            `${trenutniProizvod.product}\n${trenutniProizvod.quantity} ${trenutniProizvod.unit}\n\nSpreman za sledeći!`, 
            '🎤');
    }
    
    trenutniProizvod = null;
    
    const productInput = document.getElementById('productInput');
    const quantityInput = document.getElementById('quantityInput');
    const pieceInput = document.getElementById('pieceInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    
    if (productInput) { productInput.value = ''; productInput.focus(); }
    if (quantityInput) quantityInput.value = '1';
    if (pieceInput) pieceInput.value = '1';
    if (shelfLifeInput) shelfLifeInput.value = '12';
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎤 Recite "Start" za novi unos';
        statusEl.style.color = '#4CAF50';
    }
}

// ===== SAČUVAJ I OTVORI ZALIHE =====
function sacuvajIOtvoriZalihe() {
    if (trenutniProizvod) {
        console.log('💾 ČUVAM POSLEDNJI:', trenutniProizvod);
        
        if (typeof saveProduct === 'function') {
            try { saveProduct(); } catch(e) {}
        } else if (typeof window.saveProduct === 'function') {
            try { window.saveProduct(); } catch(e) {}
        } else {
            const btn = document.querySelector('#saveProductBtn') || 
                       document.querySelector('[onclick*="save"]') ||
                       document.querySelector('.save-btn');
            if (btn) btn.click();
        }
        
        trenutniProizvod = null;
    }
    
    showModernAlert('✅ Završeno', 'Svi unosi su sačuvani!\nOtvaram zalihe...', '📦');
    
    setTimeout(() => {
        if (typeof loadProductsFromStorage === 'function') loadProductsFromStorage();
        if (typeof renderInventory === 'function') renderInventory();
        if (typeof prikaziSveUnose === 'function') prikaziSveUnose();
        
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
        
        stopVoiceRecognition();
    }, 500);
}

// ===== PARSIRANJE - PARSIRA SVE =====
function parseVoiceText(text) {
    console.log('🔍 Parsiram:', text);
    
    if (!text || text.trim().length === 0) return null;
    
    // Ukloni "start" ako postoji na početku
    let clean = text.replace(/^start\s+/i, '').trim();
    
    // Ako je ostalo samo "start" ili prazno
    if (!clean || clean.length === 0 || clean === 'start') {
        console.log('⚠️ Samo "start" bez podataka');
        return null;
    }
    
    // Ukloni "plus" i "end" sa kraja
    clean = clean.replace(/\s+(plus|end|kraj|gotovo)$/i, '').trim();
    
    if (!clean) return null;
    
    let words = clean.split(/\s+/);
    console.log('📝 Reči:', words);
    
    let result = {
        product: '',
        quantity: '1',
        unit: 'kom',
        storage: 'Ostava',
        shelf_life: '12'
    };
    
    // ===== 1. PRONAĐI BROJ (količinu) =====
    let brojPronadjen = false;
    for (let i = 0; i < words.length; i++) {
        // Pokušaj da parsiraš broj
        let num = parseFloat(words[i].replace(',', '.').replace(/[^0-9.]/g, ''));
        
        // Ako nije broj, probaj sa rečima: jedan, dva, tri...
        if (isNaN(num) || num <= 0) {
            const brojevi = {
                'jedan': 1, 'jedna': 1, 'jedno': 1,
                'dva': 2, 'dvije': 2, 'dve': 2,
                'tri': 3, 'četiri': 4, 'pet': 5,
                'šest': 6, 'sedam': 7, 'osam': 8,
                'devet': 9, 'deset': 10
            };
            if (brojevi[words[i].toLowerCase()]) {
                num = brojevi[words[i].toLowerCase()];
            }
        }
        
        if (!isNaN(num) && num > 0) {
            result.quantity = num.toString();
            brojPronadjen = true;
            console.log('🔢 Broj:', num, 'na poziciji', i);
            
            // Proveri da li je sledeća reč jedinica
            if (i + 1 < words.length) {
                const next = words[i + 1].toLowerCase();
                if (next.includes('kg') || next.includes('kilogram')) {
                    result.unit = 'kg';
                    words.splice(i, 2);
                    break;
                } else if (next.includes('g') && !next.includes('kg')) {
                    result.unit = 'g';
                    words.splice(i, 2);
                    break;
                } else if (next.includes('l') && !next.includes('ml')) {
                    result.unit = 'l';
                    words.splice(i, 2);
                    break;
                } else if (next.includes('ml')) {
                    result.unit = 'ml';
                    words.splice(i, 2);
                    break;
                } else if (next.includes('kom') || next.includes('komad')) {
                    result.unit = 'kom';
                    words.splice(i, 2);
                    break;
                }
            }
            
            // Ako nije pronađena jedinica, samo ukloni broj
            if (brojPronadjen) {
                words.splice(i, 1);
                break;
            }
        }
    }
    
    // ===== 2. PRONAĐI SKLADIŠTE =====
    const storageMap = {
        'zamrzivač': 'Zamrzivač 1',
        'zamrzivac': 'Zamrzivač 1',
        'frižider': 'Frižider',
        'frizider': 'Frižider',
        'hladnjak': 'Frižider',
        'ostava': 'Ostava',
        'spajz': 'Ostava',
        'špajz': 'Ostava',
        'podrum': 'Podrum',
        'soba': 'Soba'
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
    
    // ===== 3. OSTATAK JE NAZIV PROIZVODA =====
    result.product = words.join(' ').trim();
    console.log('📦 Proizvod:', result.product);
    
    if (!result.product || result.product.length === 0) {
        console.log('⚠️ Nema proizvoda');
        return null;
    }
    
    console.log('✅ PARSIRANO:', result);
    return result;
}

// ===== OBRADA KOMANDE =====
function processVoiceCommand(text) {
    console.log('🎤 Obrada:', text);
    const lower = text.toLowerCase().trim();
    
    // ===== KOMANDE =====
    
    // UNOS
    if (lower === 'unos' || lower === 'otvori' || lower === 'dodaj') {
        openDataEntryScreen();
        return;
    }
    
    // PLUS
    if (lower === 'plus' || lower.includes('plus') || lower === 'sledeći') {
        sacuvajIPripremiSledeci();
        return;
    }
    
    // END
    if (lower === 'end' || lower === 'kraj' || lower === 'završi' || lower === 'gotovo' || lower.includes('zalihe')) {
        sacuvajIOtvoriZalihe();
        return;
    }
    
    // POMOĆ
    if (lower.includes('pomoć') || lower.includes('help')) {
        showModernAlert('📖 Pomoć', 
            '1. "UNOS" - otvori Data Entry\n' +
            '2. "START [proizvod] [količina] [jedinica]" - popuni polja\n' +
            '3. "PLUS" - sačuvaj i sledeći\n' +
            '4. "END" - sačuvaj i zalihe\n\n' +
            'Primer: "START gril pile 2 kg 6 zamrzivač"', 
            '💡');
        return;
    }
    
    // ===== START ILI BILO ŠTA DRUGO - PARSIRAJ =====
    // Ako tekst sadrži "start" ili ima više od 3 reči, pokušaj da parsiraš
    if (lower.includes('start') || text.split(/\s+/).length >= 3) {
        // Sačekaj malo da se skupe sve reči
        if (speechTimeout) {
            clearTimeout(speechTimeout);
        }
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = `⏳ Obrada...`;
            statusEl.style.color = '#FF9800';
        }
        
        speechTimeout = setTimeout(() => {
            const data = parseVoiceText(text);
            
            if (!data || !data.product) {
                const statusEl = document.getElementById('voiceStatus');
                if (statusEl) {
                    statusEl.textContent = '❌ Nije prepoznato. Pokušajte: "Start [proizvod] [količina]"';
                    statusEl.style.color = '#f44336';
                }
                return;
            }
            
            popuniPolja(data.product, data.quantity, data.unit, data.storage, data.shelf_life);
            speechTimeout = null;
        }, 800);
        
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
    if (isListening) {
        console.log('🎤 Već slušam');
        return;
    }
    
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
        trenutniProizvod = null;
        akumuliraniTekst = '';
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
        
        // Akumuliraj tekst
        akumuliraniTekst += ' ' + speechResult;
        akumuliraniTekst = akumuliraniTekst.trim();
        
        if (statusEl) {
            statusEl.textContent = `🗣️ "${akumuliraniTekst}"`;
            statusEl.style.color = '#FFD700';
        }
        
        // Obradi celu akumuliranu rečenicu
        processVoiceCommand(akumuliraniTekst);
    };

    recognition.onerror = function(event) {
        console.error('⚠️ Greška:', event.error);
        isListening = false;
        if (statusEl) {
            statusEl.textContent = '❌ Greška. Pokušajte ponovo.';
            statusEl.style.color = '#f44336';
        }
        if (event.error === 'not-allowed') {
            showModernAlert('Greška', 'Dozvolite pristup mikrofonu!', '🎤');
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
        console.log('🎤 Slušam...');
    } catch(e) {
        console.error('❌ Greška:', e);
        isListening = false;
    }
}

function stopVoiceRecognition() {
    isListening = false;
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        speechTimeout = null;
    }
    if (recognition) {
        try {
            recognition.stop();
            recognition = null;
            console.log('🛑 Mikrofon zaustavljen');
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
window.popuniPolja = popuniPolja;
window.sacuvajIPripremiSledeci = sacuvajIPripremiSledeci;
window.sacuvajIOtvoriZalihe = sacuvajIOtvoriZalihe;

addVoiceStyles();
console.log('✅ Voice Commands - PARSIRA SVE!');
console.log('📖 Kako radi:');
console.log('   1. "Start gril pile 2kg 6 zamrzivač" → popuni polja');
console.log('   2. "PLUS" → sačuvaj i sledeći');
console.log('   3. "END" → sačuvaj i zalihe');
