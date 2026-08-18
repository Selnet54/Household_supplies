// ============================================
// VOICE COMMANDS - PRILAGOĐEN VAŠEM HTML-U
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

// ===== OTVORI VOICE DATA ENTRY (VAŠ EKRAN) =====
function openVoiceDataEntry() {
    console.log('📂 Otvaram Voice Data Entry');
    
    // Sakrij sve ekrane
    const screens = ['loginScreen', 'languageScreen', 'choiceScreen', 'voiceMenuScreen', 'mainScreen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'none';
            el.classList.remove('active');
        }
    });
    
    // Prikaži voice data entry ekran
    const voiceDataScreen = document.getElementById('voiceDataEntryScreen');
    if (voiceDataScreen) {
        voiceDataScreen.style.display = 'flex';
        voiceDataScreen.classList.add('active');
    }
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎤 Recite "Start" pa diktirajte podatke';
        statusEl.style.color = '#4CAF50';
    }
    
    // Resetuj stanje
    trenutniProizvod = null;
    akumuliraniTekst = '';
    
    if (!isListening) {
        startVoiceRecognition();
    }
}

// ===== ZATVORI VOICE DATA ENTRY =====
function closeVoiceDataEntry() {
    console.log('✖ Zatvaram Voice Data Entry');
    
    stopVoiceRecognition();
    
    const voiceDataScreen = document.getElementById('voiceDataEntryScreen');
    if (voiceDataScreen) {
        voiceDataScreen.style.display = 'none';
        voiceDataScreen.classList.remove('active');
    }
    
    // Vrati se na voice menu
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'flex';
        voiceMenu.classList.add('active');
    }
}

// ===== POPUNI POLJA - KORISTI VAŠE ID-jeve =====
function popuniPolja(proizvod, kolicina, jedinica, skladiste, rok) {
    console.log('📝 POPUNJAVAM:', {proizvod, kolicina, jedinica, skladiste, rok});
    
    if (!proizvod || proizvod.length < 1) {
        console.error('❌ Nema proizvoda');
        return false;
    }
    
    // KORISTI VAŠE ID-jeve iz HTML-a!
    const productInput = document.getElementById('voiceProductInput');
    const quantityInput = document.getElementById('voiceQuantityInput');
    const shelfLifeInput = document.getElementById('voiceShelfLifeInput');
    const unitSelect = document.getElementById('voiceUnitSelect');
    const storageSelect = document.getElementById('voiceStorageSelect');
    
    // Proveri da li polja postoje
    if (!productInput) {
        console.error('❌ Polja ne postoje!');
        alert('❌ Greška: Data Entry polja ne postoje!');
        return false;
    }
    
    // Popuni polja
    productInput.value = proizvod;
    productInput.dispatchEvent(new Event('input', { bubbles: true }));
    productInput.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('✅ Proizvod:', proizvod);
    
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
    
    // Sačuvaj trenutni proizvod
    trenutniProizvod = {
        product: proizvod,
        quantity: kolicina,
        unit: jedinica,
        storage: skladiste,
        shelf_life: rok
    };
    
    // Prikaži u listi
    prikaziProizvodeUListi();
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `✅ ${proizvod} - ${kolicina} ${jedinica} | Recite "PLUS" za sledeći ili "END" za kraj`;
        statusEl.style.color = '#4CAF50';
    }
    
    return true;
}

// ===== PRIKAŽI PROIZVODE U LISTI =====
function prikaziProizvodeUListi() {
    const listEl = document.getElementById('voiceProductList');
    if (!listEl) return;
    
    if (!trenutniProizvod) {
        listEl.innerHTML = '<p style="color:#999; text-align:center;">📭 Još nema dodanih proizvoda</p>';
        return;
    }
    
    listEl.innerHTML = `
        <div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:5px 0;">
            <strong>📦 ${trenutniProizvod.product}</strong><br>
            🔢 ${trenutniProizvod.quantity} ${trenutniProizvod.unit} | 🏠 ${trenutniProizvod.storage} | 📅 ${trenutniProizvod.shelf_life} meseci
        </div>
    `;
}

// ===== SAČUVAJ PROIZVOD =====
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
    
    // Probaj saveProduct()
    if (typeof saveProduct === 'function') {
        try { 
            saveProduct(); 
            saved = true; 
            console.log('✅ saveProduct()');
        } catch(e) {}
    }
    
    if (!saved && typeof window.saveProduct === 'function') {
        try { 
            window.saveProduct(); 
            saved = true; 
            console.log('✅ window.saveProduct()');
        } catch(e) {}
    }
    
    if (!saved) {
        const btn = document.querySelector('#saveProductBtn') || 
                   document.querySelector('[onclick*="save"]') ||
                   document.querySelector('.save-btn');
        if (btn) { 
            btn.click(); 
            saved = true; 
            console.log('✅ Kliknuto');
        }
    }
    
    if (saved) {
        alert('✅ Sačuvano: ' + trenutniProizvod.product);
    }
    
    // Očisti
    trenutniProizvod = null;
    
    const productInput = document.getElementById('voiceProductInput');
    const quantityInput = document.getElementById('voiceQuantityInput');
    const shelfLifeInput = document.getElementById('voiceShelfLifeInput');
    
    if (productInput) { productInput.value = ''; productInput.focus(); }
    if (quantityInput) quantityInput.value = '1';
    if (shelfLifeInput) shelfLifeInput.value = '12';
    
    prikaziProizvodeUListi();
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎤 Recite "Start" za novi unos';
        statusEl.style.color = '#4CAF50';
    }
}

// ===== SAČUVAJ I OTVORI ZALIHE =====
function sacuvajIOtvoriZalihe() {
    if (trenutniProizvod) {
        if (typeof saveProduct === 'function') {
            try { saveProduct(); } catch(e) {}
        } else if (typeof window.saveProduct === 'function') {
            try { window.saveProduct(); } catch(e) {}
        }
        trenutniProizvod = null;
    }
    
    alert('✅ Završeno! Otvaram zalihe...');
    
    setTimeout(() => {
        if (typeof loadProductsFromStorage === 'function') loadProductsFromStorage();
        if (typeof renderInventory === 'function') renderInventory();
        if (typeof prikaziSveUnose === 'function') prikaziSveUnose();
        
        closeVoiceDataEntry();
    }, 500);
}

// ===== SAVE VOICE PRODUCT (za dugme) =====
function saveVoiceProduct() {
    const productInput = document.getElementById('voiceProductInput');
    const quantityInput = document.getElementById('voiceQuantityInput');
    const unitSelect = document.getElementById('voiceUnitSelect');
    const storageSelect = document.getElementById('voiceStorageSelect');
    const shelfLifeInput = document.getElementById('voiceShelfLifeInput');
    
    const proizvod = productInput ? productInput.value.trim() : '';
    const kolicina = quantityInput ? quantityInput.value : '1';
    const jedinica = unitSelect ? unitSelect.value : 'kom';
    const skladiste = storageSelect ? storageSelect.value : 'Ostava';
    const rok = shelfLifeInput ? shelfLifeInput.value : '12';
    
    if (!proizvod) {
        alert('⚠️ Unesite naziv proizvoda!');
        return;
    }
    
    trenutniProizvod = { product: proizvod, quantity: kolicina, unit: jedinica, storage: skladiste, shelf_life: rok };
    prikaziProizvodeUListi();
    sacuvajIPripremiSledeci();
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
    
    // 1. PRONAĐI BROJ
    let brojPronadjen = false;
    for (let i = 0; i < words.length; i++) {
        let num = parseFloat(words[i].replace(',', '.').replace(/[^0-9.]/g, ''));
        
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
            console.log('🔢 Broj:', num);
            
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
            
            if (brojPronadjen) {
                words.splice(i, 1);
                break;
            }
        }
    }
    
    // 2. PRONAĐI SKLADIŠTE
    const storageMap = {
        'zamrzivač': 'Zamrzivač',
        'zamrzivac': 'Zamrzivač',
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
    
    // 3. OSTATAK JE PROIZVOD
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
    
    // UNOS
    if (lower === 'unos' || lower === 'otvori' || lower === 'dodaj') {
        openVoiceDataEntry();
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
        alert('📖 KOMANDE:\n\n"UNOS" - otvori unos\n"START [proizvod] [količina]" - popuni polja\n"PLUS" - sačuvaj i sledeći\n"END" - sačuvaj i zalihe\n\nPrimer: "START gril pile 2 kg"');
        return;
    }
    
    // START ILI BILO ŠTA
    if (lower.includes('start') || text.split(/\s+/).length >= 2) {
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
    if (isListening) {
        console.log('🎤 Već slušam');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('❌ Pretraživač ne podržava glasovne komande.');
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
        
        akumuliraniTekst += ' ' + speechResult;
        akumuliraniTekst = akumuliraniTekst.trim();
        
        if (statusEl) {
            statusEl.textContent = `🗣️ "${akumuliraniTekst}"`;
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
            alert('❌ Dozvolite pristup mikrofonu!');
        }
    };

    recognition.onend = function() {
        console.log('🎤 Mikrofon isključen');
        isListening = false;
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
    
    // Sakrij voice menu
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
    }
    
    // Prikaži choice screen
    const choiceScreen = document.getElementById('choiceScreen');
    if (choiceScreen) {
        choiceScreen.style.display = 'flex';
        choiceScreen.classList.add('active');
    }
}

// ===== EKSPORT =====
window.processVoiceCommand = processVoiceCommand;
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.openVoiceDataEntry = openVoiceDataEntry;
window.closeVoiceDataEntry = closeVoiceDataEntry;
window.popuniPolja = popuniPolja;
window.sacuvajIPripremiSledeci = sacuvajIPripremiSledeci;
window.sacuvajIOtvoriZalihe = sacuvajIOtvoriZalihe;
window.saveVoiceProduct = saveVoiceProduct;

console.log('✅ Voice Commands - PRILAGOĐEN VAŠEM HTML-U!');
console.log('📖 Kako radi:');
console.log('   1. "Start gril pile 2 kg" → popuni polja');
console.log('   2. "PLUS" → sačuvaj i sledeći');
console.log('   3. "END" → sačuvaj i zalihe');
