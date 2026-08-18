// ============================================
// VOICE COMMANDS - KOMPLETNO NOVO REŠENJE
// ============================================

let voiceBuffer = '';
let voiceRecognition = null;
let isProcessing = false;

// ===== GLAVNA FUNKCIJA ZA POKRETANJE =====
function startVoiceRecognition() {
    // Provera podrške
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        if (typeof showModernAlert === 'function') {
            showModernAlert('Greška', 'Vaš pretraživač ne podržava glasovne komande.', '❌');
        }
        return;
    }

    // Zaustavi prethodni
    if (voiceRecognition) {
        try { voiceRecognition.stop(); } catch(e) {}
        voiceRecognition = null;
    }

    // Kreiraj novi
    voiceRecognition = new SpeechRecognition();
    voiceRecognition.lang = 'sr-RS';
    voiceRecognition.continuous = true;
    voiceRecognition.interimResults = true;
    voiceRecognition.maxAlternatives = 1;

    const statusEl = document.getElementById('voiceStatus');

    // Kada počne
    voiceRecognition.onstart = function() {
        console.log('🎤 Glasovno prepoznavanje pokrenuto');
        if (statusEl) {
            statusEl.textContent = '🎤 Slušam... Recite "end" za kraj';
            statusEl.style.color = '#4CAF50';
        }
        voiceBuffer = '';
        isProcessing = false;
    };

    // Kada dobije rezultat
    voiceRecognition.onresult = function(event) {
        let finalText = '';
        
        // Sakupi sve finalne delove
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                const transcript = event.results[i][0].transcript.trim();
                if (transcript) {
                    finalText += transcript + ' ';
                }
            }
        }
        
        if (finalText) {
            voiceBuffer += finalText;
            console.log('🗣️ Buffer:', voiceBuffer);
            
            // Prikaži status
            if (statusEl) {
                statusEl.textContent = `🎤: "${voiceBuffer.trim()}"`;
                statusEl.style.color = '#FFD700';
            }
        }
        
        // Proveri da li ima "end" i da nije već u obradi
        if (voiceBuffer.toLowerCase().includes('end') && !isProcessing) {
            console.log('✅ END detektovan!');
            isProcessing = true;
            
            // Uzmi sve pre "end"
            const command = voiceBuffer.replace(/end.*$/i, '').trim();
            console.log('📝 Komanda:', command);
            
            if (command.length > 3) {
                // Obradi komandu
                processVoiceCommand(command);
            }
            
            // Zaustavi prepoznavanje posle kratke pauze
            setTimeout(function() {
                stopVoiceRecognition();
            }, 200);
        }
    };

    // Greška
    voiceRecognition.onerror = function(event) {
        console.log('❌ Greška:', event.error);
        if (statusEl) {
            statusEl.textContent = `❌ Greška: ${event.error}`;
            statusEl.style.color = '#f44336';
        }
        isProcessing = false;
    };

    // Kraj
    voiceRecognition.onend = function() {
        console.log('⏹️ Prepoznavanje završeno');
        if (statusEl) {
            statusEl.textContent = '⏸️ Zaustavljeno';
            statusEl.style.color = '#999';
        }
        isProcessing = false;
    };

    // Pokreni
    try {
        voiceRecognition.start();
    } catch(e) {
        console.log('❌ Greška pri pokretanju:', e);
        isProcessing = false;
    }
}

// ===== ZAUSTAVI PREPOZNAVANJE =====
function stopVoiceRecognition() {
    if (voiceRecognition) {
        try {
            voiceRecognition.stop();
        } catch(e) {}
        voiceRecognition = null;
    }
    voiceBuffer = '';
    isProcessing = false;
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '⏸️ Zaustavljeno';
        statusEl.style.color = '#999';
    }
}

// ===== OBRADA GLASOVNE KOMANDE =====
function processVoiceCommand(command) {
    console.log('🔧 Obrada komande:', command);
    
    // IZDVOJI PODATKE
    const data = extractData(command);
    console.log('📊 Izdvojeni podaci:', data);
    
    // Provera
    if (!data.product_name || data.product_name.length < 2) {
        console.log('❌ Nevalidan naziv');
        if (typeof showModernAlert === 'function') {
            showModernAlert('Greška', 'Nije prepoznat naziv proizvoda. Pokušajte: "Pileći batak 5 kg 6 zamrzivač end"', '❌');
        }
        return;
    }
    
    // SAČUVAJ
    saveProductData(data);
}

// ===== EKSTRAKCIJA PODATAKA =====
function extractData(text) {
    // Podrazumevane vrednosti
    const data = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    // MAPE
    const units = {
        'kg': 'kg', 'kilogram': 'kg', 'kilograma': 'kg',
        'g': 'g', 'gram': 'g', 'grama': 'g',
        'l': 'l', 'litar': 'l', 'litara': 'l',
        'ml': 'ml', 'mililitar': 'ml',
        'kom': 'kom', 'komad': 'kom', 'komada': 'kom',
        'pak': 'pak', 'paket': 'pak', 'paketa': 'pak'
    };
    
    const storages = {
        'zamrzivač': 'Zamrzivač 1',
        'zamrzivac': 'Zamrzivač 1',
        'frižider': 'Frižider',
        'frizider': 'Frižider',
        'ostava': 'Ostava'
    };
    
    const numbers = {
        'nula': '0', 'jedan': '1', 'jedna': '1', 'jedno': '1',
        'dva': '2', 'dve': '2',
        'tri': '3',
        'četiri': '4', 'cetiri': '4',
        'pet': '5',
        'šest': '6', 'sest': '6',
        'sedam': '7',
        'osam': '8',
        'devet': '9',
        'deset': '10',
        'jedanaest': '11',
        'dvanaest': '12',
        'trinaest': '13',
        'četrnaest': '14',
        'petnaest': '15',
        'šesnaest': '16',
        'sedamnaest': '17',
        'osamnaest': '18',
        'devetnaest': '19',
        'dvadeset': '20'
    };
    
    // Ukloni reči za unos
    let words = text.toLowerCase().split(/\s+/);
    words = words.filter(w => !['unos', 'unesi', 'dodaj', 'start', 'plus', 'i'].includes(w));
    
    console.log('📝 Reči za obradu:', words);
    
    // 1. PRONAĐI SKLADIŠTE
    let storageFound = false;
    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (storages[w]) {
            data.storage = storages[w];
            storageFound = true;
            // Proveri da li sledi broj (zamrzivač 2)
            if (i + 1 < words.length) {
                const next = words[i + 1];
                if (!isNaN(next) && next >= '1' && next <= '9') {
                    data.storage = `Zamrzivač ${next}`;
                    words.splice(i + 1, 1);
                } else if (numbers[next]) {
                    data.storage = `Zamrzivač ${numbers[next]}`;
                    words.splice(i + 1, 1);
                }
            }
            words.splice(i, 1);
            i--;
        }
    }
    
    // 2. PRONAĐI JEDINICU I KOLIČINU
    let unitFound = false;
    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (units[w] && !unitFound) {
            data.unit = units[w];
            unitFound = true;
            
            // Traži broj pre jedinice
            if (i > 0) {
                const prev = words[i - 1];
                if (!isNaN(prev)) {
                    data.quantity = prev;
                    data.piece = prev;
                    words.splice(i - 1, 1);
                    i--;
                } else if (numbers[prev]) {
                    data.quantity = numbers[prev];
                    data.piece = numbers[prev];
                    words.splice(i - 1, 1);
                    i--;
                }
            }
            // Ukloni jedinicu
            words.splice(i, 1);
            i--;
        }
    }
    
    // 3. PRONAĐI ROK (broj)
    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        let num = null;
        
        if (!isNaN(w) && w >= '1' && w <= '99') {
            num = w;
        } else if (numbers[w]) {
            num = numbers[w];
        }
        
        if (num) {
            data.shelf_life = num;
            words.splice(i, 1);
            // Ukloni "meseci" ako postoji
            if (i < words.length && ['mesec', 'meseca', 'meseci', 'mjeseci'].includes(words[i])) {
                words.splice(i, 1);
            }
            break;
        }
    }
    
    // 4. ONO ŠTO OSTANE JE NAZIV
    // Ukloni sve brojeve koji su ostali
    words = words.filter(w => {
        if (!isNaN(w)) return false;
        if (numbers[w]) return false;
        return true;
    });
    
    // Ukloni prazne reči
    words = words.filter(w => w.length > 0);
    
    // Ako nema reči, uzmi sve osim onih koje smo pronašli
    if (words.length === 0) {
        // Vrati sve originalne reči ali ukloni specijalne
        const originalWords = text.toLowerCase().split(/\s+/);
        words = originalWords.filter(w => {
            if (['unos', 'unesi', 'dodaj', 'start', 'plus', 'i', 'end'].includes(w)) return false;
            if (storages[w]) return false;
            if (units[w]) return false;
            if (!isNaN(w)) return false;
            if (numbers[w]) return false;
            return true;
        });
    }
    
    data.product_name = words.join(' ') || 'Proizvod';
    
    return data;
}

// ===== ČUVANJE PODATAKA =====
function saveProductData(data) {
    console.log('💾 Čuvanje:', data);
    
    // Sakrij voice menu
    hideVoiceMenu();
    
    // Otvori main screen
    if (typeof showScreen === 'function') {
        showScreen('mainScreen');
    }
    
    // Pozovi renderDataEntry
    if (typeof renderDataEntry === 'function') {
        renderDataEntry(data.product_name);
        
        // Popuni formu
        setTimeout(function() {
            fillForm(data);
            
            // Sačuvaj
            setTimeout(function() {
                if (typeof saveProduct === 'function') {
                    saveProduct();
                    console.log('✅ saveProduct() pozvan');
                    
                    // Osveži prikaz
                    setTimeout(function() {
                        if (typeof prikaziSveUnose === 'function') {
                            prikaziSveUnose();
                        }
                    }, 300);
                } else {
                    const btn = document.querySelector('.btn-save');
                    if (btn) {
                        btn.click();
                        console.log('✅ Kliknuto dugme');
                    }
                }
            }, 400);
        }, 300);
    }
}

// ===== POPUNI FORMU =====
function fillForm(data) {
    console.log('📝 Popunjavanje forme:', data);
    
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
}

// ===== OTVORI ZALIHE =====
function openInventory() {
    console.log('📦 Otvaranje zaliha...');
    hideVoiceMenu();
    
    if (typeof renderInventory === 'function') {
        renderInventory();
    } else if (typeof showScreen === 'function') {
        showScreen('mainScreen');
        setTimeout(function() {
            if (typeof renderInventory === 'function') {
                renderInventory();
            }
        }, 300);
    }
}

// ===== SAKRIVANJE MENIJA =====
function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
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
window.openInventory = openInventory;
window.processVoiceCommand = processVoiceCommand;
window.extractData = extractData;
window.saveProductData = saveProductData;

console.log('✅ Voice Commands - KOMPLETNO NOVO REŠENJE aktivirano!');
