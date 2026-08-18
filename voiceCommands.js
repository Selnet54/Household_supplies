// ============================================
// VOICE COMMANDS - KONAČNO RADNO REŠENJE
// ============================================

let activeBuffer = '';
let recognition = null;
let isRestarting = false;

// ===== SAKRIVANJE =====
function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
    }
}

// ===== POKRETAČ =====
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
    recognition.maxAlternatives = 1;

    const statusEl = document.getElementById('voiceStatus');

    recognition.onstart = function() {
        console.log('🎤 Slušam...');
        if (statusEl) {
            statusEl.textContent = '🎤 Slušam... Recite "end" za kraj';
            statusEl.style.color = '#4CAF50';
        }
        // NE BRIŠEMO BUFFER!
    };

    recognition.onresult = function(event) {
        let finalText = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                const transcript = event.results[i][0].transcript.trim();
                if (transcript) {
                    finalText += (finalText ? ' ' : '') + transcript;
                }
            }
        }
        
        if (finalText) {
            activeBuffer += (activeBuffer ? ' ' : '') + finalText;
            console.log('🗣️ BAFER:', activeBuffer);
            
            if (statusEl) {
                statusEl.textContent = `🎤: "${activeBuffer}"`;
                statusEl.style.color = '#FFD700';
            }
        }
        
        // KADA ČUJE END
        if (activeBuffer.toLowerCase().includes('end')) {
            console.log('✅ END DETEKTOVAN!');
            
            const fullText = activeBuffer.replace(/end.*$/i, '').trim();
            console.log('📝 CEO TEKST:', fullText);
            
            if (fullText.length > 3) {
                obradiKomandu(fullText);
            }
            
            // ZAUSTAVI
            stopVoiceRecognition();
            
            // OTVORI ZALIHE
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
        
        // RESTARTUJ POSLE GREŠKE
        if (event.error === 'no-speech' && !isRestarting) {
            isRestarting = true;
            setTimeout(function() {
                isRestarting = false;
                if (recognition) {
                    try { recognition.stop(); } catch(e) {}
                    recognition = null;
                }
                startVoiceRecognition();
            }, 500);
        }
    };

    recognition.onend = function() {
        console.log('⏹️ Prepoznavanje završeno');
        
        // AKO IMA TEKSTA I NEMA END, RESTARTUJ
        if (activeBuffer && activeBuffer.length > 3 && 
            !activeBuffer.toLowerCase().includes('end') && 
            !isRestarting) {
            isRestarting = true;
            console.log('🔄 Restartujem...');
            setTimeout(function() {
                isRestarting = false;
                startVoiceRecognition();
            }, 300);
        }
        
        if (statusEl && !activeBuffer) {
            statusEl.textContent = '⏸️ Zaustavljeno';
            statusEl.style.color = '#999';
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
    isRestarting = false;
}

// ===== OTVORI ZALIHE =====
function otvoriZalihe() {
    console.log('📦 Otvaranje zaliha...');
    hideVoiceMenu();
    
    if (typeof renderInventory === 'function') {
        renderInventory();
        console.log('✅ renderInventory pozvan');
    } else if (typeof showScreen === 'function') {
        showScreen('mainScreen');
        setTimeout(function() {
            if (typeof renderInventory === 'function') {
                renderInventory();
            }
        }, 300);
    }
}

// ===== POVRATAK =====
function goBackFromVoice() {
    stopVoiceRecognition();
    activeBuffer = '';
    if (typeof showScreen === 'function') {
        showScreen('choiceScreen');
    }
}

// ===== RESET =====
function resetVoice() {
    stopVoiceRecognition();
    activeBuffer = '';
    isRestarting = false;
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎤 Spreman';
        statusEl.style.color = '#999';
    }
}

// ===== OBRADA KOMANDE =====
function obradiKomandu(text) {
    console.log('🔧 OBRADA:', text);
    
    const data = izvadiPodatke(text);
    console.log('📊 PODACI:', data);
    
    if (!data.product_name || data.product_name.length < 2) {
        console.log('❌ Nevalidan naziv');
        if (typeof showModernAlert === 'function') {
            showModernAlert('Greška', 'Nije prepoznat naziv proizvoda.', '❌');
        }
        return;
    }
    
    sacuvajPodatke(data);
}

// ===== IZVADI PODATKE =====
function izvadiPodatke(text) {
    const data = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    const unitMap = {
        'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg',
        'gram': 'g', 'grama': 'g', 'g': 'g',
        'litar': 'l', 'litara': 'l', 'l': 'l',
        'ml': 'ml', 'mililitar': 'ml',
        'komad': 'kom', 'komada': 'kom', 'kom': 'kom',
        'paket': 'pak', 'paketa': 'pak', 'pak': 'pak',
        'kutija': 'kutija'
    };
    
    const storageMap = {
        'zamrzivač': 'Zamrzivač 1',
        'zamrzivac': 'Zamrzivač 1',
        'frižider': 'Frižider',
        'frizider': 'Frižider',
        'ostava': 'Ostava'
    };
    
    const numberMap = {
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
    
    // UKLONI REČI ZA UNOS
    let words = text.toLowerCase().split(/\s+/);
    words = words.filter(w => !['unos', 'unesi', 'dodaj', 'start', 'plus', 'i', 'pa', 'onda'].includes(w));
    
    if (words.length === 0) {
        data.product_name = text;
        return data;
    }
    
    // 1. PRONAĐI SKLADIŠTE
    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (storageMap[w]) {
            data.storage = storageMap[w];
            if (i + 1 < words.length) {
                const next = words[i + 1];
                if (!isNaN(next) && next >= '1' && next <= '9') {
                    data.storage = `Zamrzivač ${next}`;
                    words.splice(i + 1, 1);
                } else if (numberMap[next]) {
                    data.storage = `Zamrzivač ${numberMap[next]}`;
                    words.splice(i + 1, 1);
                }
            }
            words.splice(i, 1);
            break;
        }
    }
    
    // 2. PRONAĐI JEDINICU I KOLIČINU
    let foundUnit = false;
    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (unitMap[w] && !foundUnit) {
            data.unit = unitMap[w];
            foundUnit = true;
            
            if (i > 0) {
                const prev = words[i - 1];
                if (!isNaN(prev)) {
                    data.quantity = prev;
                    data.piece = prev;
                    words.splice(i - 1, 1);
                    i--;
                } else if (numberMap[prev]) {
                    data.quantity = numberMap[prev];
                    data.piece = numberMap[prev];
                    words.splice(i - 1, 1);
                    i--;
                }
            }
            words.splice(i, 1);
            i--;
        }
    }
    
    // 3. PRONAĐI ROK
    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        let num = null;
        
        if (!isNaN(w) && w >= '1' && w <= '99') {
            num = w;
        } else if (numberMap[w]) {
            num = numberMap[w];
        }
        
        if (num) {
            data.shelf_life = num;
            words.splice(i, 1);
            if (i < words.length && ['mesec', 'meseca', 'meseci', 'mjeseci'].includes(words[i])) {
                words.splice(i, 1);
            }
            break;
        }
    }
    
    // 4. UKLONI SVE BROJEVE
    words = words.filter(w => {
        if (!isNaN(w)) return false;
        if (numberMap[w]) return false;
        return true;
    });
    
    data.product_name = words.join(' ') || text;
    
    return data;
}

// ===== SAČUVAJ PODATKE =====
function sacuvajPodatke(data) {
    console.log('💾 ČUVANJE:', data);
    
    hideVoiceMenu();
    
    if (typeof showScreen === 'function') {
        showScreen('mainScreen');
    }
    
    if (typeof renderDataEntry === 'function') {
        renderDataEntry(data.product_name);
        
        setTimeout(function() {
            // POPUNI FORMU
            const productInput = document.getElementById('productInput');
            if (productInput) {
                productInput.value = data.product_name;
                productInput.dispatchEvent(new Event('input', { bubbles: true }));
                productInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            const pieceInput = document.getElementById('pieceInput');
            if (pieceInput) {
                pieceInput.value = data.piece;
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
            
            // SAČUVAJ
            setTimeout(function() {
                if (typeof saveProduct === 'function') {
                    saveProduct();
                    console.log('✅ saveProduct() pozvan');
                } else {
                    const btn = document.querySelector('.btn-save');
                    if (btn) btn.click();
                }
            }, 400);
            
        }, 300);
    }
}

// ===== GLOBALNE FUNKCIJE =====
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.otvoriZalihe = otvoriZalihe;
window.resetVoice = resetVoice;
window.obradiKomandu = obradiKomandu;

console.log('✅ Voice Commands - KONAČNO RADNO REŠENJE aktivirano!');
