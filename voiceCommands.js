// ============================================
// VOICE COMMANDS - GLASOVNE KOMANDE (START - PLUS - END)
// ============================================

let recognition = null;
let isVoiceEntryActive = false; // Prati da li smo u toku višestrukog unosa

// ===== POMOĆNA FUNKCIJA ZA SAKRIVANJE VOICE MENIJA =====
function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
        console.log('🔇 Voice menu sakriven');
    }
}

// ===== GLAVNA FUNKCIJA ZA OBRADU KOMANDI =====
function processVoiceCommand(command) {
    console.log('🎤 processVoiceCommand prima:', command);
    
    if (!command || command.trim() === '') {
        return false;
    }
    
    let cmd = command.toLowerCase().trim();
    hideVoiceMenu();
    
    // ===== 1. END - KRAJ SVIH UNOSA I PRELAZAK U ZALIHE =====
    if (cmd === 'end' || cmd.includes('end') || cmd.includes('kraj')) {
        console.log('🛑 Prepoznat END - Kraj unosa, prelaz u zalihe');
        isVoiceEntryActive = false;
        
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderInventory === 'function') {
                renderInventory();
            }
            
            // Označavanje novih unosa svetlo plavom bojom u zalihama
            setTimeout(() => {
                const inventoryRows = document.querySelectorAll('.inventory-row, .table-row, tr, .item-card');
                inventoryRows.forEach(row => {
                    // Možete prilagoditi selektor ili uslov po potrebi za novounete stavke
                    row.style.backgroundColor = '#e0f7fa'; // Svetlo plava boja
                });
            }, 300);
            
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = '✅ Unosi završeni. Prikaz u zalihama.';
                statusEl.style.color = '#4CAF50';
            }
        }, 300);
        return true;
    }
    
    // ===== 2. START - SAMO PRVI PUT =====
    if (cmd.startsWith('start') || cmd.includes('start')) {
        console.log('🚀 Prepoznat START - Početak prvog unosa');
        isVoiceEntryActive = true; // Označavamo da je unos počao
        
        let restOfCommand = command.replace(/^start\s*/i, '').trim();
        
        // Otvaramo data entry ekran
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        if (typeof renderDataEntry === 'function') {
            renderDataEntry('');
        }
        
        if (restOfCommand) {
            processStartCommand(restOfCommand);
        } else {
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = '🎤 Diktirajte podatke (za sledeći recite "Plus", za kraj "End")';
                statusEl.style.color = '#FFD700';
            }
        }
        return true;
    }
    
    // ===== 3. PLUS - KRAJ TRENUTNOG I POČETAK SLEDEĆEG UNOSA =====
    if (cmd === 'plus' || cmd.includes('plus')) {
        console.log('➕ Prepoznat PLUS - Čuvanje trenutnog i priprema za sledeći');
        
        // Prvo sačuvamo trenutni proizvod ako je forma popunjena
        if (typeof saveProduct === 'function') {
            saveProduct();
        }
        
        // Očistimo formu za sledeći unos
        const productInput = document.getElementById('productInput');
        if (productInput) productInput.value = '';
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '➕ Uneseno. Diktirajte sledeći artikal...';
            statusEl.style.color = '#2196F3';
        }
        return true;
    }
    
    // ===== 4. AKO JE AKTIVAN UNOS (A NIJE START, PLUS NI END), TO JE DIKTIRANJE ARTIKLA =====
    if (isVoiceEntryActive) {
        console.log('📦 Diktiranje artikla u toku unosa:', command);
        processStartCommand(command);
        return true;
    }
    
    // Ostale standardne komande (Zalihe, Spisak, Nazad...)
    if (cmd.includes('stanje') || cmd.includes('zalihe')) {
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) { mainScreen.style.display = 'flex'; mainScreen.classList.add('active'); }
            if (typeof renderInventory === 'function') renderInventory();
        }, 300);
        return true;
    }

    console.log('❌ Komanda nije prepoznata:', cmd);
    return false;
}

// ===== PARSIRANJE I POPUNJAVANJE (Isto kao ranije) =====
function parseVoiceDataEntry(command) {
    let text = command.replace(/^(start|plus)\s*/i, '').trim();
    let parts = text.split(',').map(s => s.trim());
    
    let result = {
        product_name: parts[0] || 'Nepoznat proizvod',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    // Jednostavno izvlačenje brojeva i jedinica iz reči
    parts.forEach(part => {
        let p = part.toLowerCase();
        if (p.includes('kg') || p.includes('kilogram')) result.unit = 'kg';
        if (p.includes('g') || p.includes('gram')) result.unit = 'g';
        if (p.includes('l') || p.includes('litar')) result.unit = 'l';
        
        let nums = p.match(/\d+(?:[.,]\d+)?/g);
        if (nums) {
            if (!result.quantity || result.quantity === '1') {
                result.quantity = nums[0].replace(',', '.');
                result.piece = nums[0];
            } else {
                result.shelf_life = nums[nums.length - 1]; // poslednji broj je obično rok/nedelje/meseci
            }
        }
        
        if (p.includes('zamrzivač') || p.includes('zamrzivac')) result.storage = 'Zamrzivač 1';
        if (p.includes('frižider') || p.includes('frizider')) result.storage = 'Frižider';
    });
    
    return result;
}

function processStartCommand(command) {
    let data = parseVoiceDataEntry(command);
    
    const productInput = document.getElementById('productInput');
    if (!productInput) {
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) { mainScreen.style.display = 'flex'; mainScreen.classList.add('active'); }
        if (typeof renderDataEntry === 'function') renderDataEntry('');
    }
    
    setTimeout(() => {
        popuniStartPodatke(data);
    }, 200);
}

function popuniStartPodatke(data) {
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    
    if (productInput) productInput.value = data.product_name;
    if (pieceInput) pieceInput.value = data.piece;
    if (quantityInput) quantityInput.value = data.quantity;
    if (shelfLifeInput) shelfLifeInput.value = data.shelf_life;
    
    if (typeof updateExpiryDate === 'function') updateExpiryDate();
    if (typeof prikaziSveUnose === 'function') prikaziSveUnose();
    
    // Automatsko čuvanje unosa da se odmah nađe u listi
    setTimeout(() => {
        if (typeof saveProduct === 'function') {
            saveProduct();
        }
    }, 500);
}

// ===== POKRETAČ MIKROFONA =====
function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'sr-RS';
    recognition.continuous = true;
    recognition.interimResults = false; // Uzimamo finalne rezultate da ne reaguje na svaku poluizgovorenu reč

    recognition.onresult = function(event) {
        const speechResult = event.results[event.results.length - 1][0].transcript.trim();
        console.log('🗣️ Prepoznato:', speechResult);
        processVoiceCommand(speechResult);
    };

    recognition.onend = function() {
        // Automatski restart mikrofona ako je unos i dalje aktivan
        if (isVoiceEntryActive) {
            setTimeout(() => {
                try { recognition.start(); } catch(e) {}
            }, 300);
        }
    };

    try {
        recognition.start();
        console.log('🎤 Slušam komande (Start / Plus / End)...');
    } catch(e) {}
}

function stopVoiceRecognition() {
    isVoiceEntryActive = false;
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
}

// Globalne eksportatore
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.processVoiceCommand = processVoiceCommand;
