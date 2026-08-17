// ============================================
// VOICE COMMANDS - GLASOVNE KOMANDE - STABILNA VERZIJA
// ============================================

let recognition = null;
let fullSpeechResult = '';
let speechTimeout = null;
let voiceEntryMode = false;
let isProcessingCommand = false; // SPREČAVA DUPLIRANJE
let isListening = false;

// ===== POMOĆNA FUNKCIJA ZA SAKRIVANJE VOICE MENIJA =====
function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
        console.log('🔇 Voice menu sakriven');
    }
}

// ===== NOVA FUNKCIJA ZA NAPREDNO PARSIRANJE GLASOVNOG UNOSA =====
function parseAdvancedVoiceInput(command) {
    console.log('🔍 Parsiranje naprednog unosa:', command);
    
    const result = {
        product_name: '',
        quantity: '1',
        unit: 'komad',
        shelf_life: '12',
        storage: 'Soba'
    };
    
    // Ukloni "start" iz komande
    let cleanCommand = command.replace(/^(start|stat|stard)\s*/i, '').trim();
    
    // 1. IZDVOJI NAZIV PROIZVODA
    const numberMatch = cleanCommand.match(/(\d+)\s*(?:komad|kg|g|l|ml|kom|parče|parčeta)?/i);
    let productEndIndex = cleanCommand.length;
    
    if (numberMatch && numberMatch.index !== undefined) {
        productEndIndex = numberMatch.index;
    } else {
        const keywords = ['kg', 'g', 'l', 'ml', 'komad', 'kom', 'parče', 'rok', 'zamrzivač', 'frizider', 'soba'];
        let minIndex = cleanCommand.length;
        keywords.forEach(kw => {
            const idx = cleanCommand.toLowerCase().indexOf(kw);
            if (idx !== -1 && idx < minIndex) minIndex = idx;
        });
        if (minIndex < cleanCommand.length) productEndIndex = minIndex;
    }
    
    result.product_name = cleanCommand.substring(0, productEndIndex).trim();
    
    // 2. IZDVOJI KOLIČINU I JEDINICU
    const quantityPatterns = [
        /(\d+)\s*(?:kg|kilogram|kilograma)/i,
        /(\d+)\s*(?:g|gram|grama)/i,
        /(\d+)\s*(?:l|lit|litra|litara)/i,
        /(\d+)\s*(?:ml|mililitar|mililitara)/i,
        /(\d+)\s*(?:komad|kom|parče|parčeta)/i,
        /(\d+)/
    ];
    
    for (const pattern of quantityPatterns) {
        const match = cleanCommand.match(pattern);
        if (match) {
            result.quantity = match[1];
            const fullMatch = match[0].toLowerCase();
            if (fullMatch.includes('kg') || fullMatch.includes('kilogram')) {
                result.unit = 'kg';
            } else if (fullMatch.includes('g') && !fullMatch.includes('kg')) {
                result.unit = 'g';
            } else if (fullMatch.includes('l') || fullMatch.includes('lit')) {
                result.unit = 'l';
            } else if (fullMatch.includes('ml')) {
                result.unit = 'ml';
            } else if (fullMatch.includes('komad') || fullMatch.includes('kom') || fullMatch.includes('parče')) {
                result.unit = 'komad';
            } else {
                result.unit = 'komad';
            }
            break;
        }
    }
    
    // 3. IZDVOJI ROK TRAJANJA
    const shelfLifeMatch = cleanCommand.match(/rok\s*(\d+)/i) || cleanCommand.match(/(\d+)\s*(?:mesec|meseci|m)/i);
    if (shelfLifeMatch) {
        result.shelf_life = shelfLifeMatch[1];
    }
    
    // 4. IZDVOJI SKLADIŠTE
    const storageKeywords = {
        'zamrzivač': 'Zamrzivač',
        'frizider': 'Frižider',
        'soba': 'Soba',
        'podrum': 'Podrum',
        'ostava': 'Ostava'
    };
    
    for (const [key, value] of Object.entries(storageKeywords)) {
        if (cleanCommand.toLowerCase().includes(key)) {
            result.storage = value;
            break;
        }
    }
    
    // 5. OČISTI NAZIV
    const removeWords = ['kg', 'kilogram', 'gram', 'litar', 'litra', 'ml', 'komad', 'parče', 
                         'rok', 'mesec', 'meseci', 'zamrzivač', 'frizider', 'soba', 'podrum', 
                         'ostava', 'plus', 'unos', 'dodaj'];
    let cleanName = result.product_name;
    removeWords.forEach(word => {
        const regex = new RegExp('\\b' + word + '\\b', 'gi');
        cleanName = cleanName.replace(regex, '');
    });
    cleanName = cleanName.replace(/\s+/g, ' ').trim();
    
    if (cleanName) {
        result.product_name = cleanName;
    }
    
    console.log('✅ Parsirani podaci:', result);
    return result;
}

// ===== MODIFIKOVANA processStartCommand FUNKCIJA =====
function processStartCommand(command) {
    // SPREČI DUPLIRANJE
    if (isProcessingCommand) {
        console.log('⏳ Već obrađujem komandu...');
        return false;
    }
    
    isProcessingCommand = true;
    console.log('🚀 Procesiram Start komandu:', command);
    
    try {
        let data = parseAdvancedVoiceInput(command);
        
        if (!data.product_name || data.product_name.length < 2) {
            showModernAlert('Greška', 'Nije prepoznat naziv proizvoda! Pokušajte: "Start gril pile 2 kg 6 zamrzivač"', '❌');
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = '❌ Nije prepoznat naziv. Pokušajte ponovo.';
                statusEl.style.color = '#f44336';
            }
            isProcessingCommand = false;
            return false;
        }
        
        voiceEntryMode = true;
        
        // Otvori Data Entry
        const productInput = document.getElementById('productInput');
        const dataEntryScreen = document.getElementById('dataEntryScreen');
        
        if (!productInput || !dataEntryScreen || dataEntryScreen.style.display === 'none') {
            console.log('📂 Otvaram Data Entry...');
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderDataEntry === 'function') {
                renderDataEntry('');
            } else if (typeof window.renderDataEntry === 'function') {
                window.renderDataEntry('');
            }
            
            setTimeout(function() {
                popuniPodatkeIZaIzvrsiUnos(data);
            }, 500);
        } else {
            console.log('📝 Data Entry je otvoren, popunjavam...');
            popuniPodatkeIZaIzvrsiUnos(data);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Greška u processStartCommand:', error);
        isProcessingCommand = false;
        return false;
    }
}

// ===== NOVA FUNKCIJA ZA POPUNJAVANJE I AUTOMATSKI UNOS =====
function popuniPodatkeIZaIzvrsiUnos(data) {
    console.log('📝 Popunjavam podatke:', data);
    
    try {
        const productInput = document.getElementById('productInput');
        const pieceInput = document.getElementById('pieceInput');
        const quantityInput = document.getElementById('quantityInput');
        const shelfLifeInput = document.getElementById('shelfLifeInput');
        const unitSelect = document.getElementById('unitSelect');
        const storageSelect = document.getElementById('storageSelect');
        
        // Popuni polja
        if (productInput) {
            productInput.value = data.product_name;
            productInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        if (pieceInput) {
            pieceInput.value = data.quantity;
            pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        if (quantityInput) {
            quantityInput.value = data.quantity;
            quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        if (shelfLifeInput) {
            shelfLifeInput.value = data.shelf_life;
            shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // Jedinica
        if (unitSelect && data.unit) {
            for (let option of unitSelect.options) {
                if (option.value === data.unit || option.text.toLowerCase().includes(data.unit.toLowerCase())) {
                    option.selected = true;
                    break;
                }
            }
            unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // Skladište
        if (storageSelect && data.storage) {
            for (let option of storageSelect.options) {
                if (option.value === data.storage || option.text.toLowerCase().includes(data.storage.toLowerCase())) {
                    option.selected = true;
                    break;
                }
            }
            storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // Ažuriraj rok trajanja
        if (typeof updateExpiryDate === 'function') {
            updateExpiryDate();
        }
        
        if (typeof prikaziSveUnose === 'function') {
            prikaziSveUnose();
        }
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = `✅ Popunjeno: ${data.product_name} (${data.quantity} ${data.unit})`;
            statusEl.style.color = '#4CAF50';
        }
        
        // Sačuvaj proizvod
        setTimeout(function() {
            if (typeof saveProduct === 'function') {
                // Sačuvaj u recent entries
                if (productInput && productInput.value) {
                    const recentEntries = JSON.parse(localStorage.getItem('recentVoiceEntries') || '[]');
                    recentEntries.push({
                        product_name: productInput.value,
                        timestamp: new Date().toISOString()
                    });
                    if (recentEntries.length > 20) {
                        recentEntries.shift();
                    }
                    localStorage.setItem('recentVoiceEntries', JSON.stringify(recentEntries));
                }
                
                saveProduct();
                
                showModernAlert('✅ Uspešno', `Dodato: ${data.product_name} (${data.quantity} ${data.unit})`, '🎤');
                
                if (statusEl) {
                    statusEl.textContent = '🎤 Recite sledeći unos ili "End" za kraj';
                    statusEl.style.color = '#FFD700';
                }
                
                // Očisti polja
                setTimeout(() => {
                    if (productInput) {
                        productInput.value = '';
                        productInput.focus();
                    }
                    if (pieceInput) pieceInput.value = '1';
                    if (quantityInput) quantityInput.value = '1';
                    if (shelfLifeInput) shelfLifeInput.value = '12';
                }, 500);
            }
            
            // Oslobodi procesiranje
            isProcessingCommand = false;
        }, 800);
        
    } catch (error) {
        console.error('❌ Greška u popuniPodatkeIZaIzvrsiUnos:', error);
        isProcessingCommand = false;
    }
}

// ===== NOVA FUNKCIJA ZA OBRADU "END" KOMANDE =====
function processEndCommand() {
    if (isProcessingCommand) {
        console.log('⏳ Već obrađujem komandu...');
        return false;
    }
    
    isProcessingCommand = true;
    console.log('🏁 Procesiram END komandu');
    
    voiceEntryMode = false;
    hideVoiceMenu();
    
    setTimeout(function() {
        try {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            
            if (typeof loadProductsFromStorage === 'function') {
                loadProductsFromStorage();
            }
            
            if (typeof renderInventory === 'function') {
                renderInventory();
            }
            
            setTimeout(() => {
                oznaciNoveUnose();
            }, 300);
            
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = '✅ Svi unosi sačuvani. Novi proizvodi su označeni plavom bojom.';
                statusEl.style.color = '#4CAF50';
            }
            
            showModernAlert('✅ Završeno', 'Svi glasovni unosi su sačuvani!', '📦');
            
            // ZAUSTAVI MIKROFON NAKON END KOMANDE
            setTimeout(() => {
                stopVoiceRecognition();
                isProcessingCommand = false;
            }, 1000);
            
        } catch (error) {
            console.error('❌ Greška u processEndCommand:', error);
            isProcessingCommand = false;
        }
    }, 500);
    
    return true;
}

// ===== FUNKCIJA ZA OZNAČAVANJE NOVIH UNOSA =====
function oznaciNoveUnose() {
    console.log('🔵 Označavam nove unose');
    
    const inventoryRows = document.querySelectorAll('#inventoryTable tbody tr');
    if (!inventoryRows.length) {
        console.log('⚠️ Nema redova za označavanje');
        return;
    }
    
    const recentProducts = JSON.parse(localStorage.getItem('recentVoiceEntries') || '[]');
    const recentNames = recentProducts.map(p => p.product_name);
    
    inventoryRows.forEach((row) => {
        row.classList.remove('new-entry', 'voice-new-entry');
        row.style.backgroundColor = '';
        row.style.borderLeft = '';
        row.style.transition = 'background-color 0.5s ease';
        
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

// ===== DODAJ ANIMACIJU =====
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

// ===== FUNKCIJA ZA OBRADU GLASOVNIH KOMANDI =====
function processVoiceCommand(command) {
    console.log('🎤 processVoiceCommand prima:', command);
    
    if (!command || command.trim() === '') {
        console.log('❌ Prazna komanda');
        return false;
    }
    
    // SPREČI DUPLIRANJE
    if (isProcessingCommand) {
        console.log('⏳ Već obrađujem komandu, ignorišem:', command);
        return false;
    }
    
    const cmd = command.toLowerCase().trim();
    console.log('📝 Normalizovana komanda:', cmd);
    
    // Sakrij voice menu
    hideVoiceMenu();
    
    // ===== PROVERI "START" =====
    if (cmd.includes('start') || cmd.includes('stat') || cmd.includes('stard')) {
        console.log('🚀 Prepoznat START!');
        processStartCommand(command);
        return true;
    }
    
    // ===== PROVERI "END" =====
    if (cmd.includes('end') || cmd.includes('kraj') || cmd.includes('gotovo') || 
        cmd.includes('stop') || cmd.includes('završi') || cmd.includes('done')) {
        console.log('🏁 Prepoznat END!');
        processEndCommand();
        return true;
    }
    
    // ===== OSTALE KOMANDE =====
    // ... (zadrži postojeće komande)
    
    // Ako nije prepoznata
    console.log('❌ Komanda nije prepoznata:', cmd);
    showModernAlert('Nepoznata komanda', `"${command}" nije prepoznato.`, '❓');
    return false;
}

// ===== POKRETAČ ZA GLASOVNI UNOS =====
function startVoiceRecognition() {
    // SPREČI DUPLIRANJE
    if (isListening) {
        console.log('🎤 Već slušam...');
        return;
    }
    
    fullSpeechResult = '';
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        speechTimeout = null;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        showModernAlert('Greška', 'Vaš pretraživač ne podržava glasovne komande.', '❌');
        return;
    }

    if (recognition) {
        try { 
            recognition.stop(); 
        } catch(e) {}
        recognition = null;
    }

    recognition = new SpeechRecognition();
    const langCode = typeof currentLang !== 'undefined' ? currentLang : 'sr';
    const speechLangMap = {
        sr: 'sr-RS', en: 'en-US', de: 'de-DE', hu: 'hu-HU',
        uk: 'uk-UA', ru: 'ru-RU', zh: 'zh-CN', es: 'es-ES',
        pt: 'pt-PT', fr: 'fr-FR'
    };
    recognition.lang = speechLangMap[langCode] || 'sr-RS';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎤 Slušam... Govorite komandu';
        statusEl.style.color = '#2196F3';
    }

    recognition.onstart = function() {
        console.log('🎤 Glasovno prepoznavanje pokrenuto');
        isListening = true;
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '🎤 Slušam...';
            statusEl.style.color = '#2196F3';
        }
        fullSpeechResult = '';
    };

    recognition.onresult = function(event) {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
                fullSpeechResult += result[0].transcript + ' ';
                console.log(`✅ Dodata reč: "${result[0].transcript}"`);
            }
        }
        
        const currentText = fullSpeechResult.trim();
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl && currentText) {
            statusEl.textContent = `🗣️ "${currentText}"`;
            statusEl.style.color = '#FFD700';
        }
        
        clearTimeout(speechTimeout);
        speechTimeout = setTimeout(function() {
            const finalText = fullSpeechResult.trim();
            console.log('🎯 KONAČAN TEKST:', finalText);
            
            if (finalText && finalText.length > 0 && !isProcessingCommand) {
                processVoiceCommand(finalText);
            }
            
            setTimeout(function() {
                fullSpeechResult = '';
            }, 500);
        }, 1500);
    };

    recognition.onerror = function(event) {
        console.error('⚠️ Greška:', event.error);
        isListening = false;
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            if (event.error === 'not-allowed') {
                statusEl.textContent = '❌ Dozvolite pristup mikrofonu!';
                showModernAlert('Greška', 'Dozvolite pristup mikrofonu!', '🎤');
            } else if (event.error === 'no-speech') {
                statusEl.textContent = '🔇 Nema govora, pokušajte ponovo';
            } else {
                statusEl.textContent = '❌ Greška. Pokušajte ponovo.';
            }
            statusEl.style.color = '#f44336';
        }
    };

    recognition.onend = function() {
        console.log('🎤 Prepoznavanje završeno');
        isListening = false;
        
        // Ne restartuj automatski - čekaj da korisnik ponovo pokrene
        const voiceMenu = document.getElementById('voiceMenuScreen');
        if (voiceMenu && voiceMenu.classList.contains('active') && !isProcessingCommand) {
            // Samo restartuj ako je menu još uvek aktivan i ne obrađujemo komandu
            setTimeout(function() {
                if (recognition && !isListening && !isProcessingCommand) {
                    try {
                        recognition.start();
                        console.log('🎤 Ponovo pokrenuto slušanje');
                    } catch(e) {
                        console.log('⏳ Čekanje...');
                    }
                }
            }, 1000);
        }
    };

    try {
        recognition.start();
        console.log('🎤 Slušam...');
        isListening = true;
    } catch(e) {
        console.error('❌ Greška pri startovanju:', e);
        isListening = false;
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Greška pri pokretanju mikrofona';
            statusEl.style.color = '#f44336';
        }
    }
}

// ===== ZAUSTAVI GLASOVNO PREPOZNAVANJE =====
function stopVoiceRecognition() {
    console.log('🛑 Zaustavljam prepoznavanje...');
    isListening = false;
    isProcessingCommand = false;
    fullSpeechResult = '';
    
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        speechTimeout = null;
    }
    
    if (recognition) {
        try {
            recognition.stop();
            recognition = null;
            console.log('🛑 Recognition zaustavljen');
        } catch(e) {
            console.log('⚠️ Greška pri zaustavljanju:', e);
        }
    }
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '⏸️ Prepoznavanje zaustavljeno';
        statusEl.style.color = '#aaa';
    }
}

// ===== POVRATAK SA VOICE MENIJA =====
function goBackFromVoice() {
    console.log('◀ Povratak sa glasovnog menija');
    stopVoiceRecognition();
    showScreen('choiceScreen');
}

// ===== PRIKAZ EKRANA =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.style.display = 'flex';
        screen.classList.add('active');
    }
}

// ===== MODERN ALERT =====
function showModernAlert(title, message, icon = 'ℹ️') {
    // Ukloni stare alertove
    document.querySelectorAll('.modern-alert').forEach(el => el.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = 'modern-alert';
    alertDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 400px;
        width: 90%;
        text-align: center;
        animation: fadeInAlert 0.3s ease;
    `;
    alertDiv.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
        <h3 style="margin: 10px 0; color: #333;">${title}</h3>
        <p style="margin: 10px 0 20px; color: #666;">${message}</p>
        <button onclick="this.parentElement.remove()" style="
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 30px;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
        ">OK</button>
    `;
    document.body.appendChild(alertDiv);
    
    // Dodaj animaciju ako ne postoji
    if (!document.getElementById('alertAnimations')) {
        const style = document.createElement('style');
        style.id = 'alertAnimations';
        style.textContent = `
            @keyframes fadeInAlert {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Automatski zatvori nakon 5 sekundi
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 5000);
}

// ===== INICIJALIZACIJA =====
function initVoiceCommands() {
    addHighlightAnimation();
    console.log('✅ Voice Commands učitan - STABILNA verzija!');
    console.log('📖 Primeri:');
    console.log('   "Start gril pile 2kg 6 zamrzivač"');
    console.log('   "End" - završava unos');
    
    // Dodaj globalnu funkciju za zaustavljanje
    window.forceStopVoice = function() {
        stopVoiceRecognition();
        isProcessingCommand = false;
        isListening = false;
        console.log('🔇 Forced stop');
    };
}

// ===== IZVEZI FUNKCIJE =====
window.processVoiceCommand = processVoiceCommand;
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.processStartCommand = processStartCommand;
window.processEndCommand = processEndCommand;
window.popuniPodatkeIZaIzvrsiUnos = popuniPodatkeIZaIzvrsiUnos;
window.parseAdvancedVoiceInput = parseAdvancedVoiceInput;
window.oznaciNoveUnose = oznaciNoveUnose;
window.initVoiceCommands = initVoiceCommands;
window.forceStopVoice = forceStopVoice;

// ===== POKRENI =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVoiceCommands);
} else {
    initVoiceCommands();
}
