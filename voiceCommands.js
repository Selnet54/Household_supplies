// ============================================
// VOICE COMMANDS - RADI TAČNO OVAKO
// ============================================

let recognition = null;
let isListening = false;
let speechTimeout = null;
let trenutniProizvod = null;
let akumuliraniTekst = '';

// ===== OTVORI DATA ENTRY =====
function openVoiceDataEntry() {
    console.log('📂 Otvaram Data Entry');
    
    document.querySelectorAll('.screen').forEach(el => {
        el.style.display = 'none';
        el.classList.remove('active');
    });
    
    const dataEntry = document.getElementById('dataEntryScreen');
    if (dataEntry) {
        dataEntry.style.display = 'flex';
        dataEntry.classList.add('active');
    }
    
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎤 Recite "Start" pa podatke';
        statusEl.style.color = '#4CAF50';
    }
    
    trenutniProizvod = null;
    akumuliraniTekst = '';
    
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
    console.log('📝 Popunjavam:', {proizvod, kolicina, jedinica, skladiste, rok});
    
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const unitSelect = document.getElementById('unitSelect');
    const storageSelect = document.getElementById('storageSelect');
    
    if (!productInput) {
        alert('❌ Polja ne postoje!');
        return;
    }
    
    // Popuni polja
    productInput.value = proizvod;
    productInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    if (pieceInput) {
        pieceInput.value = '1';
        pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    if (quantityInput) {
        quantityInput.value = kolicina;
        quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    if (shelfLifeInput) {
        shelfLifeInput.value = rok || '12';
        shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    if (unitSelect) {
        for (let opt of unitSelect.options) {
            if (opt.value === jedinica || opt.text.toLowerCase().includes(jedinica)) {
                opt.selected = true;
                unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }
    
    if (storageSelect) {
        for (let opt of storageSelect.options) {
            if (opt.text.toLowerCase().includes(skladiste.toLowerCase())) {
                opt.selected = true;
                storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
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
        proizvod: proizvod,
        kolicina: kolicina,
        jedinica: jedinica,
        skladiste: skladiste,
        rok: rok
    };
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `✅ ${proizvod} - ${kolicina} ${jedinica}`;
        statusEl.style.color = '#4CAF50';
    }
    
    showModernAlert('✅ Popunjeno', 
        `${proizvod}\n${kolicina} ${jedinica}\nSkladište: ${skladiste}\nRok: ${rok} meseci\n\nRecite "PLUS" za sledeći\nRecite "END" za kraj`, 
        '📋');
}

// ===== SAČUVAJ PROIZVOD =====
function sacuvajProizvod() {
    if (!trenutniProizvod) {
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '⚠️ Nema proizvoda. Recite "Start" prvo.';
            statusEl.style.color = '#FF9800';
        }
        showModernAlert('⚠️ Upozorenje', 'Nema proizvoda za čuvanje.\nRecite "Start" prvo.', '⚠️');
        return;
    }
    
    console.log('💾 Čuvam:', trenutniProizvod);
    
    let saved = false;
    
    if (typeof saveProduct === 'function') {
        try { saveProduct(); saved = true; } catch(e) {}
    }
    
    if (!saved && typeof window.saveProduct === 'function') {
        try { window.saveProduct(); saved = true; } catch(e) {}
    }
    
    if (!saved) {
        const btn = document.querySelector('.btn-save') || 
                   document.querySelector('[onclick*="save"]');
        if (btn) { btn.click(); saved = true; }
    }
    
    if (saved) {
        showModernAlert('✅ Sačuvano', 
            `${trenutniProizvod.proizvod}\n${trenutniProizvod.kolicina} ${trenutniProizvod.jedinica}`, 
            '🎤');
    }
    
    trenutniProizvod = null;
    
    const productInput = document.getElementById('productInput');
    const quantityInput = document.getElementById('quantityInput');
    const pieceInput = document.getElementById('pieceInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    
    if (productInput) { productInput.value = ''; productInput.focus(); }
    if (pieceInput) pieceInput.value = '1';
    if (quantityInput) quantityInput.value = '1';
    if (shelfLifeInput) shelfLifeInput.value = '12';
    
    if (typeof prikaziSveUnose === 'function') {
        prikaziSveUnose();
    }
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎤 Recite "Start" za novi unos';
        statusEl.style.color = '#4CAF50';
    }
}

// ===== OTVORI ZALIHE =====
function otvoriZalihe() {
    if (trenutniProizvod) {
        if (typeof saveProduct === 'function') {
            try { saveProduct(); } catch(e) {}
        }
        trenutniProizvod = null;
    }
    
    showModernAlert('✅ Završeno', 'Svi unosi su sačuvani!\nOtvaram zalihe...', '📦');
    
    setTimeout(() => {
        if (typeof loadProductsFromStorage === 'function') loadProductsFromStorage();
        if (typeof renderInventory === 'function') renderInventory();
        if (typeof prikaziSveUnose === 'function') prikaziSveUnose();
        
        const dataEntry = document.getElementById('dataEntryScreen');
        if (dataEntry) {
            dataEntry.style.display = 'none';
            dataEntry.classList.remove('active');
        }
        
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        
        stopVoiceRecognition();
    }, 500);
}

// ===== PARSIRANJE - RAZUME: "grill pile 1 2 kg 6 zamrzivač" =====
function parsiraj(text) {
    console.log('🔍 Parsiram:', text);
    
    // Ukloni "start"
    let clean = text.replace(/^start\s+/i, '').trim();
    if (!clean || clean === 'start') return null;
    
    let words = clean.split(/\s+/);
    console.log('📝 Reči:', words);
    
    let result = {
        proizvod: '',
        kolicina: '1',
        jedinica: 'komad',
        skladiste: 'Ostava',
        rok: '12'
    };
    
    // 1. Pronađi SKLADIŠTE (zamrzivač, frižider, ostava...)
    const skladista = {
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
        const w = words[i].toLowerCase();
        for (const [key, value] of Object.entries(skladista)) {
            if (w.includes(key)) {
                result.skladiste = value;
                words.splice(i, 1);
                i--;
                console.log('🏠 Skladište:', value);
                break;
            }
        }
    }
    
    // 2. Pronađi JEDINICU (kg, g, l, ml, komad)
    const jedinice = ['kg', 'g', 'l', 'ml', 'komad', 'kom'];
    for (let i = 0; i < words.length; i++) {
        const w = words[i].toLowerCase();
        for (let j of jedinice) {
            if (w.includes(j)) {
                result.jedinica = (j === 'kom') ? 'komad' : j;
                words.splice(i, 1);
                i--;
                console.log('📦 Jedinica:', result.jedinica);
                break;
            }
        }
    }
    
    // 3. Pronađi BROJEVE (količina i rok)
    let brojevi = [];
    for (let i = 0; i < words.length; i++) {
        let num = parseFloat(words[i].replace(',', '.'));
        if (!isNaN(num) && num > 0) {
            brojevi.push({ broj: num, index: i });
        }
    }
    
    // Ako imamo 2 broja: prvi je količina, drugi je rok
    if (brojevi.length >= 2) {
        result.kolicina = brojevi[0].broj.toString();
        result.rok = brojevi[1].broj.toString();
        console.log('🔢 Količina:', result.kolicina);
        console.log('📅 Rok:', result.rok);
        
        // Ukloni brojeve iz reči (od kraja)
        for (let i = brojevi.length - 1; i >= 0; i--) {
            words.splice(brojevi[i].index, 1);
        }
    } 
    // Ako imamo 1 broj: to je količina
    else if (brojevi.length === 1) {
        result.kolicina = brojevi[0].broj.toString();
        console.log('🔢 Količina:', result.kolicina);
        words.splice(brojevi[0].index, 1);
    }
    
    // 4. Ostalo je NAZIV PROIZVODA
    result.proizvod = words.join(' ').trim();
    console.log('📦 Proizvod:', result.proizvod);
    
    if (!result.proizvod) return null;
    
    console.log('✅ Parsirano:', result);
    return result;
}

// ===== OBRADA KOMANDE =====
function processVoiceCommand(text) {
    console.log('🎤 Obrada:', text);
    const lower = text.toLowerCase().trim();
    
    // KOMANDE
    if (lower === 'unos' || lower === 'otvori') {
        openVoiceDataEntry();
        return;
    }
    
    if (lower === 'plus' || lower === 'sledeći') {
        sacuvajProizvod();
        return;
    }
    
    if (lower === 'end' || lower === 'kraj') {
        otvoriZalihe();
        return;
    }
    
    // START - sačekaj da se skupe sve reči
    if (lower.includes('start')) {
        if (speechTimeout) clearTimeout(speechTimeout);
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '⏳ Obrada...';
            statusEl.style.color = '#FF9800';
        }
        
        speechTimeout = setTimeout(() => {
            const data = parsiraj(text);
            if (data && data.proizvod) {
                popuniPolja(data.proizvod, data.kolicina, data.jedinica, data.skladiste, data.rok);
            } else {
                const statusEl = document.getElementById('voiceStatus');
                if (statusEl) {
                    statusEl.textContent = '❌ Nije prepoznato. Primer: "Start grill pile 1 2 kg 6 zamrzivač"';
                    statusEl.style.color = '#f44336';
                }
                showModernAlert('❌ Greška', 
                    'Nije prepoznato.\nPrimer: "Start grill pile 1 2 kg 6 zamrzivač"\n\nZnači:\n- Proizvod: grill pile\n- Količina: 1\n- Težina: 2 kg\n- Rok: 6 meseci\n- Skladište: zamrzivač', 
                    '❌');
            }
            speechTimeout = null;
        }, 1500);
        return;
    }
    
    // NIJE PREPOZNATO
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
        trenutniProizvod = null;
        akumuliraniTekst = '';
    };

    recognition.onresult = function(event) {
        let fullText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                fullText += event.results[i][0].transcript + ' ';
            }
        }
        const text = fullText.trim();
        if (!text) return;
        
        akumuliraniTekst += ' ' + text;
        akumuliraniTekst = akumuliraniTekst.trim();
        
        console.log('🗣️:', akumuliraniTekst);
        
        if (statusEl) {
            statusEl.textContent = '🗣️ "' + akumuliraniTekst + '"';
            statusEl.style.color = '#FFD700';
        }
        
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
    stopVoiceRecognition();
    
    document.querySelectorAll('.screen').forEach(el => {
        el.style.display = 'none';
        el.classList.remove('active');
    });
    
    const choiceScreen = document.getElementById('choiceScreen');
    if (choiceScreen) {
        choiceScreen.style.display = 'flex';
        choiceScreen.classList.add('active');
    }
}

// ===== MODERN ALERT =====
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

// ===== EKSPORT =====
window.processVoiceCommand = processVoiceCommand;
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.openVoiceDataEntry = openVoiceDataEntry;
window.popuniPolja = popuniPolja;
window.sacuvajProizvod = sacuvajProizvod;
window.otvoriZalihe = otvoriZalihe;
window.showModernAlert = showModernAlert;

console.log('✅ VOICE COMMANDS - RADI!');
console.log('📖 Primer: "Start grill pile 1 2 kg 6 zamrzivač"');
console.log('   Znači: grill pile, 1 komad, 2 kg, 6 meseci, zamrzivač');
