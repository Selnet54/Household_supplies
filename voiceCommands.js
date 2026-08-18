// ============================================
// VOICE COMMANDS - DIREKTNO POPUNJAVANJE
// ============================================

let recognition = null;
let fullSpeechResult = '';
let isProcessing = false;
let isListening = false;

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

// ===== DIREKTNO POPUNI POLJA - OVO JE KLJUČNO =====
function popuniPoljaDirektno(proizvod, kolicina, jedinica, skladiste, rok) {
    console.log('📝 DIREKTNO POPUNJAVAM:', {proizvod, kolicina, jedinica, skladiste, rok});
    
    // Popuni input polja
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const unitSelect = document.getElementById('unitSelect');
    const storageSelect = document.getElementById('storageSelect');
    
    // DIREKTNO UPISIVANJE VREDNOSTI
    if (productInput) {
        productInput.value = proizvod;
        productInput.dispatchEvent(new Event('input', { bubbles: true }));
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
    
    // Jedinica
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
    
    // Skladište
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
    
    // Ažuriraj datum isteka
    if (typeof updateExpiryDate === 'function') {
        updateExpiryDate();
    }
    
    // Prikaži sve unose
    if (typeof prikaziSveUnose === 'function') {
        prikaziSveUnose();
    }
    
    // Status
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `✅ ${proizvod} - ${kolicina} ${jedinica}`;
        statusEl.style.color = '#4CAF50';
    }
    
    // Sačuvaj u localStorage
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
    
    // SAČUVAJ PROIZVOD - pokušaj sve opcije
    setTimeout(() => {
        let saved = false;
        
        // Probaj saveProduct()
        if (typeof saveProduct === 'function') {
            saveProduct();
            saved = true;
            console.log('✅ saveProduct() pozvan');
        }
        
        // Probaj window.saveProduct()
        if (!saved && typeof window.saveProduct === 'function') {
            window.saveProduct();
            saved = true;
            console.log('✅ window.saveProduct() pozvan');
        }
        
        // Probaj klik na dugme
        if (!saved) {
            const saveBtn = document.querySelector('#saveProductBtn') || 
                           document.querySelector('[onclick*="save"]') ||
                           document.querySelector('.save-btn') ||
                           document.querySelector('button[type="submit"]');
            if (saveBtn) {
                saveBtn.click();
                saved = true;
                console.log('✅ Kliknuto na dugme za čuvanje');
            }
        }
        
        if (!saved) {
            console.warn('⚠️ Nije pronađena funkcija za čuvanje, ali podaci su u poljima');
            showModernAlert('ℹ️ Info', 'Podaci su upisani u polja.\nKliknite dugme za čuvanje.', '📝');
        } else {
            showModernAlert('✅ Uspešno', `Dodato: ${proizvod}`, '🎤');
        }
        
        // Pripremi za sledeći unos
        if (productInput) {
            productInput.value = '';
            productInput.focus();
        }
        if (pieceInput) pieceInput.value = '1';
        if (quantityInput) quantityInput.value = '1';
        if (shelfLifeInput) shelfLifeInput.value = '12';
        
        isProcessing = false;
    }, 800);
}

// ===== PARSIRANJE - JEDNOSTAVNO I POUZDANO =====
function parseVoiceText(text) {
    console.log('🔍 Parsiram:', text);
    
    if (!text || text.trim().length === 0) return null;
    
    // Ukloni "start"
    let clean = text.replace(/^start\s+/i, '').trim();
    
    // Podeli na reči
    let words = clean.split(/\s+/);
    if (words.length === 0) return null;
    
    // Rezultat
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
        // Proveri da li je broj
        const num = parseFloat(words[i].replace(',', '.'));
        if (!isNaN(num) && num > 0) {
            result.quantity = num.toString();
            
            // Proveri sledeću reč za jedinicu
            if (i + 1 < words.length) {
                const next = words[i + 1].toLowerCase();
                for (const [key, value] of Object.entries(unitMap)) {
                    if (next.includes(key)) {
                        result.unit = value;
                        words.splice(i, 2);
                        i--;
                        break;
                    }
                }
                if (result.unit !== 'kom') continue;
            }
            
            // Ako nema jedinice, samo ukloni broj
            words.splice(i, 1);
            i--;
        }
    }
    
    // 3. OSTATAK JE NAZIV PROIZVODA
    result.product = words.join(' ').trim();
    
    // Ako nema proizvoda, vrati null
    if (!result.product) {
        // Pokušaj da uzmeš prve 2 reči ako nema ništa
        const originalWords = clean.split(/\s+/);
        if (originalWords.length >= 2) {
            result.product = originalWords.slice(0, 2).join(' ');
        } else if (originalWords.length === 1) {
            result.product = originalWords[0];
        } else {
            return null;
        }
    }
    
    console.log('✅ Parsirano:', result);
    return result;
}

// ===== OBRADA GLASOVNE KOMANDE =====
function processVoiceCommand(text) {
    if (isProcessing) {
        console.log('⏳ Sačekaj...');
        return;
    }
    
    console.log('🎤 Obrada:', text);
    const lower = text.toLowerCase().trim();
    
    // KOMANDE
    if (lower.includes('unos') || lower.includes('dodaj') || lower.includes('otvori')) {
        isProcessing = true;
        openDataEntryScreen();
        setTimeout(() => { isProcessing = false; }, 500);
        return;
    }
    
    if (lower.includes('end') || lower.includes('kraj') || lower.includes('završi')) {
        processEndCommand();
        return;
    }
    
    if (lower.includes('pomoć') || lower.includes('help')) {
        showModernAlert('📖 Pomoć', 'Reci "Unos" za otvaranje\n"Start [proizvod] [količina] [jedinica] [skladište]"', '💡');
        return;
    }
    
    // START - parsiraj i popuni
    if (lower.includes('start')) {
        isProcessing = true;
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '⏳ Obrada...';
            statusEl.style.color = '#FF9800';
        }
        
        const data = parseVoiceText(text);
        
        if (!data || !data.product) {
            if (statusEl) {
                statusEl.textContent = '❌ Nije prepoznato. Pokušajte: "Start [proizvod] [količina]"';
                statusEl.style.color = '#f44336';
            }
            isProcessing = false;
            return;
        }
        
        // DIREKTNO POPUNI POLJA
        popuniPoljaDirektno(
            data.product,
            data.quantity,
            data.unit,
            data.storage,
            data.shelf_life
        );
        
        return;
    }
    
    // Ako nije prepoznato
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `❌ Nije prepoznato: "${text}"`;
        statusEl.style.color = '#f44336';
        setTimeout(() => {
            statusEl.textContent = '🎤 Recite "Start" ili "Unos"';
            statusEl.style.color = '#FFD700';
        }, 3000);
    }
}

// ===== END KOMANDA =====
function processEndCommand() {
    console.log('🏁 End');
    showModernAlert('✅ Završeno', 'Svi unosi su sačuvani!', '📦');
    
    setTimeout(() => {
        if (typeof loadProductsFromStorage === 'function') loadProductsFromStorage();
        if (typeof renderInventory === 'function') renderInventory();
        if (typeof prikaziSveUnose === 'function') prikaziSveUnose();
    }, 500);
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

    recognition.onresult = function(event) {
        let fullText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                fullText += event.results[i][0].transcript + ' ';
            }
        }
        
        const speechResult = fullText.trim();
        if (!speechResult) return;
        
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
    isProcessing = false;
    
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

// ===== ALERT =====
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
        <p style="color:#FFD700; font-size:18px; margin-bottom:25px;">${message}</p>
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

// ===== STILOVI =====
function addVoiceStyles() {
    if (document.getElementById('voiceStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'voiceStyles';
    style.textContent = `
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-50px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .voice-microphone {
            text-align: center;
            font-size: 72px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
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
window.popuniPoljaDirektno = popuniPoljaDirektno;

addVoiceStyles();
console.log('✅ Voice Commands učitan - DIREKTNO POPUNJAVANJE!');
console.log('📖 Primer: "Start gril pile 2kg 6 zamrzivač"');
