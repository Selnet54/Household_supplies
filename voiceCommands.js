// ============================================
// VOICE COMMANDS - GLASOVNE KOMANDE - POPRAVLJENA
// ============================================

let recognition = null;
let fullSpeechResult = '';
let speechTimeout = null;
let voiceEntryMode = false;
let isProcessingCommand = false;
let isListening = false;
let isDataEntryOpen = false;

// ===== POMOĆNA FUNKCIJA ZA SAKRIVANJE VOICE MENIJA =====
function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
        console.log('🔇 Voice menu sakriven');
    }
}

// ===== FUNKCIJA ZA OTVARANJE DATA ENTRY =====
function openDataEntry() {
    console.log('📂 Otvaram Data Entry...');
    
    try {
        // Sakrij voice menu
        hideVoiceMenu();
        
        // Prikaži main screen
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        
        // Sakrij sve ostale ekrane
        document.querySelectorAll('.screen').forEach(s => {
            if (s.id !== 'mainScreen' && s.id !== 'dataEntryScreen') {
                s.style.display = 'none';
                s.classList.remove('active');
            }
        });
        
        // Otvori data entry
        if (typeof renderDataEntry === 'function') {
            renderDataEntry('');
        } else if (typeof window.renderDataEntry === 'function') {
            window.renderDataEntry('');
        } else {
            // Ako funkcija ne postoji, pokušaj direktno
            const dataEntryScreen = document.getElementById('dataEntryScreen');
            if (dataEntryScreen) {
                dataEntryScreen.style.display = 'block';
                dataEntryScreen.classList.add('active');
            }
        }
        
        isDataEntryOpen = true;
        console.log('✅ Data Entry otvoren');
        
        // Fokusiraj polje za unos
        setTimeout(() => {
            const productInput = document.getElementById('productInput');
            if (productInput) {
                productInput.focus();
            }
        }, 300);
        
        // Ažuriraj status
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '🎤 Sada recite "Start" pa diktirajte podatke';
            statusEl.style.color = '#4CAF50';
        }
        
        return true;
    } catch (error) {
        console.error('❌ Greška pri otvaranju Data Entry:', error);
        return false;
    }
}

// ===== NOVA FUNKCIJA ZA NAPREDNO PARSIRANJE =====
function parseAdvancedVoiceInput(command) {
    console.log('🔍 Parsiranje:', command);
    
    const result = {
        product_name: '',
        quantity: '1',
        unit: 'komad',
        shelf_life: '12',
        storage: 'Soba'
    };
    
    // Ukloni "start" iz komande
    let cleanCommand = command.replace(/^(start|stat|stard)\s*/i, '').trim();
    
    // Ako je prazno, vrati prazan rezultat
    if (!cleanCommand) {
        return result;
    }
    
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

// ===== processStartCommand - POPRAVLJENA =====
function processStartCommand(command) {
    if (isProcessingCommand) {
        console.log('⏳ Već obrađujem...');
        return false;
    }
    
    isProcessingCommand = true;
    console.log('🚀 Start komanda:', command);
    
    try {
        // Prvo otvori Data Entry
        if (!isDataEntryOpen) {
            const opened = openDataEntry();
            if (!opened) {
                isProcessingCommand = false;
                return false;
            }
        }
        
        // Sačekaj da se Data Entry otvori pa parsiraj
        setTimeout(() => {
            const data = parseAdvancedVoiceInput(command);
            
            if (!data.product_name || data.product_name.length < 2) {
                showModernAlert('Greška', 'Nije prepoznat naziv proizvoda!', '❌');
                const statusEl = document.getElementById('voiceStatus');
                if (statusEl) {
                    statusEl.textContent = '❌ Nije prepoznat naziv. Pokušajte: "Start gril pile 2 kg"';
                    statusEl.style.color = '#f44336';
                }
                isProcessingCommand = false;
                return;
            }
            
            // Popuni podatke
            popuniPodatke(data);
            
        }, 500);
        
        return true;
    } catch (error) {
        console.error('❌ Greška:', error);
        isProcessingCommand = false;
        return false;
    }
}

// ===== POPUNI PODATKE =====
function popuniPodatke(data) {
    console.log('📝 Popunjavam:', data);
    
    try {
        const productInput = document.getElementById('productInput');
        const pieceInput = document.getElementById('pieceInput');
        const quantityInput = document.getElementById('quantityInput');
        const shelfLifeInput = document.getElementById('shelfLifeInput');
        const unitSelect = document.getElementById('unitSelect');
        const storageSelect = document.getElementById('storageSelect');
        
        if (!productInput) {
            console.error('❌ Polja nisu pronađena');
            isProcessingCommand = false;
            return;
        }
        
        // Popuni
        productInput.value = data.product_name;
        if (pieceInput) pieceInput.value = data.quantity;
        if (quantityInput) quantityInput.value = data.quantity;
        if (shelfLifeInput) shelfLifeInput.value = data.shelf_life;
        
        if (unitSelect && data.unit) {
            for (let option of unitSelect.options) {
                if (option.value === data.unit || option.text.toLowerCase().includes(data.unit.toLowerCase())) {
                    option.selected = true;
                    break;
                }
            }
        }
        
        if (storageSelect && data.storage) {
            for (let option of storageSelect.options) {
                if (option.value === data.storage || option.text.toLowerCase().includes(data.storage.toLowerCase())) {
                    option.selected = true;
                    break;
                }
            }
        }
        
        // Ažuriraj
        if (typeof updateExpiryDate === 'function') {
            updateExpiryDate();
        }
        
        if (typeof prikaziSveUnose === 'function') {
            prikaziSveUnose();
        }
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = `✅ ${data.product_name} (${data.quantity} ${data.unit})`;
            statusEl.style.color = '#4CAF50';
        }
        
        // Sačuvaj
        setTimeout(() => {
            if (typeof saveProduct === 'function') {
                // Sačuvaj u recent
                const recentEntries = JSON.parse(localStorage.getItem('recentVoiceEntries') || '[]');
                recentEntries.push({
                    product_name: data.product_name,
                    timestamp: new Date().toISOString()
                });
                if (recentEntries.length > 20) {
                    recentEntries.shift();
                }
                localStorage.setItem('recentVoiceEntries', JSON.stringify(recentEntries));
                
                saveProduct();
                
                showModernAlert('✅ Uspešno', `Dodato: ${data.product_name}`, '🎤');
                
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
            
            isProcessingCommand = false;
        }, 800);
        
    } catch (error) {
        console.error('❌ Greška pri popunjavanju:', error);
        isProcessingCommand = false;
    }
}

// ===== END KOMANDA =====
function processEndCommand() {
    if (isProcessingCommand) {
        console.log('⏳ Već obrađujem...');
        return false;
    }
    
    isProcessingCommand = true;
    console.log('🏁 End komanda');
    
    hideVoiceMenu();
    isDataEntryOpen = false;
    
    setTimeout(() => {
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
                statusEl.textContent = '✅ Unosi sačuvani. Novi proizvodi su označeni.';
                statusEl.style.color = '#4CAF50';
            }
            
            showModernAlert('✅ Završeno', 'Svi unosi su sačuvani!', '📦');
            
            // ZAUSTAVI MIKROFON
            setTimeout(() => {
                stopVoiceRecognition();
                isProcessingCommand = false;
            }, 1000);
            
        } catch (error) {
            console.error('❌ Greška:', error);
            isProcessingCommand = false;
        }
    }, 500);
    
    return true;
}

// ===== OZNAČI NOVE UNOSE =====
function oznaciNoveUnose() {
    console.log('🔵 Označavam nove unose');
    
    const inventoryRows = document.querySelectorAll('#inventoryTable tbody tr');
    if (!inventoryRows.length) return;
    
    const recentProducts = JSON.parse(localStorage.getItem('recentVoiceEntries') || '[]');
    const recentNames = recentProducts.map(p => p.product_name);
    
    inventoryRows.forEach((row) => {
        row.classList.remove('new-entry', 'voice-new-entry');
        row.style.backgroundColor = '';
        row.style.borderLeft = '';
        
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

// ===== DODAJ STILOVE =====
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

// ===== GLAVNA FUNKCIJA ZA OBRADU KOMANDI =====
function processVoiceCommand(command) {
    console.log('🎤 Prima:', command);
    
    if (!command || command.trim() === '') {
        return false;
    }
    
    if (isProcessingCommand) {
        console.log('⏳ Ignorišem, već obrađujem');
        return false;
    }
    
    const cmd = command.toLowerCase().trim();
    console.log('📝 Normalizovano:', cmd);
    
    // Sakrij voice menu
    hideVoiceMenu();
    
    // ===== START =====
    if (cmd.includes('start') || cmd.includes('stat') || cmd.includes('stard')) {
        console.log('🚀 START!');
        // OTVORI DATA ENTRY PRVO
        if (!isDataEntryOpen) {
            openDataEntry();
        }
        processStartCommand(command);
        return true;
    }
    
    // ===== END =====
    if (cmd.includes('end') || cmd.includes('kraj') || cmd.includes('gotovo') || 
        cmd.includes('stop') || cmd.includes('završi') || cmd.includes('done')) {
        console.log('🏁 END!');
        processEndCommand();
        return true;
    }
    
    // ===== UNOS PODATAKA =====
    const dataEntryKeywords = ['unos', 'unesi', 'dodaj', 'novi', 'podatak', 'add', 'product', 'entry', 'data', 'new'];
    if (dataEntryKeywords.some(k => cmd.includes(k))) {
        console.log('✅ UNOS PODATAKA');
        openDataEntry();
        return true;
    }
    
    // ===== ZALIHE =====
    const inventoryKeywords = ['stanje', 'zalihe', 'inventar', 'inventory', 'stock'];
    if (inventoryKeywords.some(k => cmd.includes(k))) {
        console.log('✅ ZALIHE');
        setTimeout(() => {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderInventory === 'function') {
                renderInventory();
            }
        }, 300);
        return true;
    }
    
    // ===== NAZAD =====
    const backKeywords = ['nazad', 'vrati', 'odustani', 'back', 'cancel'];
    if (backKeywords.some(k => cmd.includes(k))) {
        console.log('✅ NAZAD');
        setTimeout(() => {
            if (typeof handleBackAction === 'function') {
                handleBackAction();
            } else if (typeof goBackFromVoice === 'function') {
                goBackFromVoice();
            }
        }, 300);
        return true;
    }
    
    // ===== MENI =====
    const menuKeywords = ['meni', 'početna', 'home', 'menu', 'main'];
    if (menuKeywords.some(k => cmd.includes(k))) {
        console.log('✅ MENI');
        setTimeout(() => {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderCategories === 'function') {
                renderCategories();
            }
        }, 300);
        return true;
    }
    
    console.log('❌ Nepoznato:', cmd);
    showModernAlert('Nepoznata komanda', `"${command}" nije prepoznato.`, '❓');
    return false;
}

// ===== POKRETAČ MIKROFONA =====
function startVoiceRecognition() {
    if (isListening) {
        console.log('🎤 Već slušam');
        return;
    }
    
    fullSpeechResult = '';
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        speechTimeout = null;
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
                console.log(`📝 Dodato: "${result[0].transcript}"`);
            }
        }
        
        const currentText = fullSpeechResult.trim();
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl && currentText) {
            statusEl.textContent = `🗣️ "${currentText}"`;
            statusEl.style.color = '#FFD700';
        }
        
        clearTimeout(speechTimeout);
        speechTimeout = setTimeout(() => {
            const finalText = fullSpeechResult.trim();
            console.log('🎯 Konačno:', finalText);
            
            if (finalText && finalText.length > 0 && !isProcessingCommand) {
                processVoiceCommand(finalText);
            }
            
            setTimeout(() => {
                fullSpeechResult = '';
            }, 500);
        }, 1500);
    };
    
    recognition.onerror = function(event) {
        console.error('⚠️ Greška:', event.error);
        isListening = false;
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Greška. Pokušajte ponovo.';
            statusEl.style.color = '#f44336';
        }
    };
    
    recognition.onend = function() {
        console.log('🎤 Mikrofon isključen');
        isListening = false;
    };
    
    try {
        recognition.start();
        console.log('🎤 Pokrenut');
    } catch(e) {
        console.error('❌ Greška:', e);
        isListening = false;
    }
}

// ===== ZAUSTAVI MIKROFON =====
function stopVoiceRecognition() {
    console.log('🛑 Zaustavljam');
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
        } catch(e) {}
    }
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '⏸️ Zaustavljeno';
        statusEl.style.color = '#aaa';
    }
}

// ===== POVRATAK =====
function goBackFromVoice() {
    console.log('◀ Povratak');
    stopVoiceRecognition();
    isDataEntryOpen = false;
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

// ===== ALERT =====
function showModernAlert(title, message, icon = 'ℹ️') {
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
        ">OK</button>
    `;
    document.body.appendChild(alertDiv);
    
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
}

// ===== INICIJALIZACIJA =====
function initVoiceCommands() {
    addHighlightAnimation();
    console.log('✅ Voice Commands POPRAVLJEN!');
    console.log('📖 Primeri:');
    console.log('   Recite "Unos" - otvara Data Entry');
    console.log('   Recite "Start gril pile 2kg 6 zamrzivač" - dodaje proizvod');
    console.log('   Recite "End" - završava unos');
    console.log('   Recite "Zalihe" - prikazuje inventar');
}

// ===== IZVEZI =====
window.processVoiceCommand = processVoiceCommand;
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.processStartCommand = processStartCommand;
window.processEndCommand = processEndCommand;
window.openDataEntry = openDataEntry;
window.initVoiceCommands = initVoiceCommands;

// ===== POKRENI =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVoiceCommands);
} else {
    initVoiceCommands();
}
