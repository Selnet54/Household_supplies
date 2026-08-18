// ============================================
// VOICE COMMANDS - JEDNOSTAVNO REŠENJE
// ============================================

let activeBuffer = ''; 
let recognition = null;

// ===== SAKRIVANJE VOICE MENIJA =====
function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
    }
}

// ===== POKRETAČ ZA GLASOVNI UNOS =====
function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        if (typeof showModernAlert === 'function') {
            showModernAlert('Greška', 'Vaš pretraživač ne podržava glasovne komande.', '❌');
        }
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

    recognition.onstart = function() {
        console.log('🎤 Slušam...');
        if (statusEl) {
            statusEl.textContent = '🎤 Slušam... (recite "end" za kraj)';
            statusEl.style.color = '#2196F3';
        }
        activeBuffer = '';
    };

    recognition.onresult = function(event) {
        let finalText = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                finalText += event.results[i][0].transcript.trim() + ' ';
            }
        }
        
        if (finalText) {
            activeBuffer += finalText;
            console.log('🗣️:', activeBuffer);
            
            if (statusEl) {
                statusEl.textContent = `🎤: "${activeBuffer.trim()}"`;
                statusEl.style.color = '#FFD700';
            }
        }
        
        // KADA ČUJE "END" - ODMAH OBRADI
        if (activeBuffer.toLowerCase().includes('end')) {
            console.log('✅ END DETEKTOVAN!');
            
            // Uzmi sve pre "end"
            const text = activeBuffer.replace(/end.*$/i, '').trim();
            console.log('📝 Tekst za obradu:', text);
            
            if (text.length > 3) {
                // DIREKTNO OBRADI
                obradiGlasovnuKomandu(text);
            }
            
            // Zaustavi
            stopVoiceRecognition();
            
            // Otvori zalihe
            setTimeout(function() {
                otvoriZalihe();
            }, 500);
        }
    };

    recognition.onerror = function(event) {
        console.log('❌ Greška:', event.error);
        if (statusEl) {
            statusEl.textContent = `❌ Greška: ${event.error}`;
            statusEl.style.color = '#f44336';
        }
    };

    recognition.onend = function() {
        console.log('⏹️ Prepoznavanje završeno');
        if (statusEl) {
            statusEl.textContent = '⏸️ Zaustavljeno';
            statusEl.style.color = '#aaa';
        }
    };

    try {
        recognition.start();
    } catch(e) {
        console.log('❌', e);
    }
}

// ===== ZAUSTAVI =====
function stopVoiceRecognition() {
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    activeBuffer = '';
}

// ===== OTVORI ZALIHE - POZIVA renderInventory =====
function otvoriZalihe() {
    console.log('📦 Otvaranje zaliha...');
    hideVoiceMenu();
    
    // DIREKTNO POZIVANJE renderInventory IZ SCRIPT.JS
    if (typeof renderInventory === 'function') {
        renderInventory();
        console.log('✅ renderInventory pozvan');
    } else {
        console.log('❌ renderInventory nije definisan');
        // Pokušaj sa showScreen
        if (typeof showScreen === 'function') {
            showScreen('mainScreen');
            setTimeout(function() {
                if (typeof renderInventory === 'function') {
                    renderInventory();
                }
            }, 300);
        }
    }
}

// ===== JEDNOSTAVNA OBRADA =====
function obradiGlasovnuKomandu(text) {
    console.log('🔧 Obrada:', text);
    
    // IZDVOJI PODATKE JEDNOSTAVNO
    const result = {
        product_name: '',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    // MAPE ZA PREVOD
    const units = ['kg', 'g', 'l', 'ml', 'kom', 'pak', 'kutija'];
    const unitMap = {
        'kilogram': 'kg', 'kilograma': 'kg',
        'gram': 'g', 'grama': 'g',
        'litar': 'l', 'litara': 'l',
        'komad': 'kom', 'komada': 'kom',
        'paket': 'pak', 'paketa': 'pak'
    };
    
    const storageMap = {
        'zamrzivač': 'Zamrzivač 1',
        'zamrzivac': 'Zamrzivač 1',
        'frižider': 'Frižider',
        'frizider': 'Frižider',
        'ostava': 'Ostava'
    };
    
    const numbers = {
        'jedan': '1', 'jedna': '1', 'jedno': '1',
        'dva': '2', 'dve': '2',
        'tri': '3',
        'četiri': '4', 'cetiri': '4',
        'pet': '5',
        'šest': '6', 'sest': '6',
        'sedam': '7',
        'osam': '8',
        'devet': '9',
        'deset': '10'
    };
    
    // RAZBIJ NA REČI
    let words = text.toLowerCase().split(/\s+/);
    console.log('📝 Reči:', words);
    
    // PRONAĐI SKLADIŠTE
    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (storageMap[w]) {
            result.storage = storageMap[w];
            // Proveri da li sledi broj (zamrzivač 2)
            if (i + 1 < words.length && !isNaN(words[i + 1])) {
                result.storage = `Zamrzivač ${words[i + 1]}`;
                words.splice(i + 1, 1);
            }
            words.splice(i, 1);
            i--;
        }
    }
    
    // PRONAĐI JEDINICU I KOLIČINU
    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        let unit = null;
        
        // Proveri da li je jedinica
        if (unitMap[w]) {
            unit = unitMap[w];
        } else if (units.includes(w)) {
            unit = w;
        }
        
        if (unit) {
            result.unit = unit;
            // Traži broj pre jedinice
            if (i > 0) {
                const prev = words[i - 1];
                if (!isNaN(prev)) {
                    result.quantity = prev;
                } else if (numbers[prev]) {
                    result.quantity = numbers[prev];
                }
            }
            // Ukloni jedinicu i broj
            words.splice(i, 1);
            if (i > 0 && !isNaN(words[i - 1])) {
                words.splice(i - 1, 1);
            } else if (i > 0 && numbers[words[i - 1]]) {
                words.splice(i - 1, 1);
            }
            break;
        }
    }
    
    // PRONAĐI ROK (broj posle jedinice)
    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (!isNaN(w) && w >= '1' && w <= '99') {
            result.shelf_life = w;
            words.splice(i, 1);
            // Ukloni "meseci" ako postoji
            if (i < words.length && ['mesec', 'meseca', 'meseci'].includes(words[i])) {
                words.splice(i, 1);
            }
            break;
        } else if (numbers[w]) {
            result.shelf_life = numbers[w];
            words.splice(i, 1);
            if (i < words.length && ['mesec', 'meseca', 'meseci'].includes(words[i])) {
                words.splice(i, 1);
            }
            break;
        }
    }
    
    // ONO ŠTO OSTANE JE NAZIV
    // Ukloni "unos", "start", "plus"
    words = words.filter(w => !['unos', 'start', 'plus', 'unesi', 'dodaj'].includes(w));
    
    result.product_name = words.join(' ') || 'Proizvod';
    
    console.log('✅ Parsirano:', result);
    
    // PROVERI DA LI JE VALIDNO
    if (result.product_name === 'Proizvod' || result.product_name.length < 2) {
        console.log('❌ Nevalidan naziv');
        if (typeof showModernAlert === 'function') {
            showModernAlert('Greška', 'Nije prepoznat naziv proizvoda. Pokušajte: "Pileći batak 5 kg 6 zamrzivač end"', '❌');
        }
        return;
    }
    
    // SAČUVAJ PROIZVOD
    sacuvajProizvod(result);
}

// ===== ČUVANJE PROIZVODA =====
function sacuvajProizvod(data) {
    console.log('💾 Čuvanje:', data);
    
    // SAKRIJ VOICE MENU
    hideVoiceMenu();
    
    // OTVORI MAIN SCREEN
    if (typeof showScreen === 'function') {
        showScreen('mainScreen');
    }
    
    // POZOVI renderDataEntry
    if (typeof renderDataEntry === 'function') {
        renderDataEntry(data.product_name);
        
        // POPUNI FORMU
        setTimeout(function() {
            popuniFormu(data);
            
            // SAČUVAJ
            setTimeout(function() {
                if (typeof saveProduct === 'function') {
                    saveProduct();
                    console.log('✅ Sačuvano!');
                } else {
                    const btn = document.querySelector('.btn-save');
                    if (btn) btn.click();
                }
            }, 500);
        }, 300);
    }
}

// ===== POPUNI FORMU =====
function popuniFormu(data) {
    console.log('📝 Popunjavanje:', data);
    
    const productInput = document.getElementById('productInput');
    if (productInput) {
        productInput.value = data.product_name;
        productInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    const pieceInput = document.getElementById('pieceInput');
    if (pieceInput) {
        pieceInput.value = data.quantity;
        pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    const quantityInput = document.getElementById('quantityInput');
    if (quantityInput) {
        quantityInput.value = data.quantity;
        quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    if (shelfLifeInput) {
        shelfLifeInput.value = data.shelf_life;
        shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    const unitSelect = document.getElementById('unitSelect');
    if (unitSelect) {
        for (let opt of unitSelect.options) {
            if (opt.value === data.unit) {
                opt.selected = true;
                unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }
    
    const storageSelect = document.getElementById('storageSelect');
    if (storageSelect) {
        for (let opt of storageSelect.options) {
            if (opt.value === data.storage) {
                opt.selected = true;
                storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }
    
    if (typeof updateExpiryDate === 'function') {
        updateExpiryDate();
    }
}

// ===== POVRATAK =====
function goBackFromVoice() {
    stopVoiceRecognition();
    if (typeof showScreen === 'function') {
        showScreen('choiceScreen');
    }
}

// ===== GLOBALNE FUNKCIJE =====
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.otvoriZalihe = otvoriZalihe;
window.obradiGlasovnuKomandu = obradiGlasovnuKomandu;

console.log('✅ Voice Commands - JEDNOSTAVNO REŠENJE aktivirano!');
