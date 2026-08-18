// ============================================
// VOICE COMMANDS - GLASOVNE KOMANDE
// ============================================

let recognition = null;
let fullSpeechResult = '';
let speechTimeout = null;
let isProcessing = false;
let isListening = false;
let voiceProducts = [];

function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
    }
}

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

// ===== OVO JE POPRAVLJENO =====
function parseVoiceDataEntry(text) {
    console.log('🔍 Parsiram:', text);
    
    if (!text || text.trim().length === 0) return null;
    
    let result = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        storage: 'Ostava',
        shelf_life: '12'
    };
    
    let words = text.toLowerCase().trim().split(/\s+/);
    
    if (words.length > 0 && words[0] === 'start') {
        words.shift();
    }
    
    if (words.length === 0) return null;
    
    // Skladište
    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (w.includes('zamrzivač') || w.includes('zamrzivac')) {
            result.storage = 'Zamrzivač 1';
            words.splice(i, 1);
            i--;
        } else if (w.includes('frižider') || w.includes('frizider') || w.includes('hladnjak')) {
            result.storage = 'Frižider';
            words.splice(i, 1);
            i--;
        } else if (w.includes('ostava') || w.includes('spajz') || w.includes('špajz')) {
            result.storage = 'Ostava';
            words.splice(i, 1);
            i--;
        }
    }
    
    // Količina i jedinica
    for (let i = 0; i < words.length; i++) {
        const num = parseFloat(words[i].replace(',', '.'));
        if (!isNaN(num) && num > 0) {
            result.quantity = num.toString();
            if (i + 1 < words.length) {
                const next = words[i + 1].toLowerCase();
                if (next.includes('kg')) { result.unit = 'kg'; words.splice(i, 2); i--; }
                else if (next.includes('g') && !next.includes('kg')) { result.unit = 'g'; words.splice(i, 2); i--; }
                else if (next.includes('l')) { result.unit = 'l'; words.splice(i, 2); i--; }
                else if (next.includes('ml')) { result.unit = 'ml'; words.splice(i, 2); i--; }
                else if (next.includes('kom')) { result.unit = 'kom'; words.splice(i, 2); i--; }
                else { words.splice(i, 1); i--; }
            } else {
                words.splice(i, 1);
                i--;
            }
        }
    }
    
    result.product_name = words.join(' ').trim();
    if (!result.product_name) return null;
    
    console.log('✅ Parsirano:', result);
    return result;
}

function normalizeUnit(unit) {
    unit = unit.toLowerCase();
    if (unit.includes('kg')) return 'kg';
    if (unit.includes('gram') || unit === 'g') return 'g';
    if (unit.includes('ml')) return 'ml';
    if (unit.includes('l')) return 'l';
    return 'kom';
}

function normalizeStorage(storage) {
    storage = storage.toLowerCase().trim();
    if (storage.includes('zamrzivač 2') || storage.includes('zamrzivac 2')) return 'Zamrzivač 2';
    if (storage.includes('zamrzivač 3') || storage.includes('zamrzivac 3')) return 'Zamrzivač 3';
    if (storage.includes('zamrzivač') || storage.includes('zamrzivac')) return 'Zamrzivač 1';
    if (storage.includes('frižider') || storage.includes('frizider')) return 'Frižider';
    if (storage.includes('ostava') || storage.includes('spajz')) return 'Ostava';
    return storage;
}

function popuniStartPodatke(data) {
    console.log('📝 Popunjavam:', data);
    
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const unitSelect = document.getElementById('unitSelect');
    const storageSelect = document.getElementById('storageSelect');
    
    if (productInput) productInput.value = data.product_name || '';
    if (pieceInput) pieceInput.value = data.piece || '1';
    if (quantityInput) quantityInput.value = data.quantity || '1';
    if (shelfLifeInput) shelfLifeInput.value = data.shelf_life || '12';
    
    if (unitSelect && data.unit) {
        for (let option of unitSelect.options) {
            if (option.value === data.unit || 
                option.text.trim().toLowerCase() === data.unit.trim().toLowerCase()) {
                option.selected = true;
                break;
            }
        }
    }
    
    if (storageSelect && data.storage) {
        for (let option of storageSelect.options) {
            const value = (option.value || '').trim().toLowerCase();
            const text = (option.text || '').trim().toLowerCase();
            const wanted = data.storage.trim().toLowerCase();
            if (value === wanted || text === wanted || value.includes(wanted) || text.includes(wanted)) {
                option.selected = true;
                break;
            }
        }
    }
    
    if (typeof updateExpiryDate === 'function') updateExpiryDate();
    if (typeof prikaziSveUnose === 'function') prikaziSveUnose();
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `✅ ${data.product_name}, ${data.quantity} ${data.unit}`;
        statusEl.style.color = '#4CAF50';
    }
    
    const recent = JSON.parse(localStorage.getItem('recentVoiceEntries') || '[]');
    recent.push({ product_name: data.product_name, timestamp: new Date().toISOString() });
    if (recent.length > 50) recent.shift();
    localStorage.setItem('recentVoiceEntries', JSON.stringify(recent));
    
    setTimeout(function() {
        if (typeof saveProduct === 'function') {
            saveProduct();
            showModernAlert('✅ Uspešno', `Dodato: ${data.product_name}`, '🎤');
            
            if (statusEl) {
                statusEl.textContent = '🎤 Recite "Plus" ili "End"';
                statusEl.style.color = '#FFD700';
            }
            
            setTimeout(() => {
                if (productInput) { productInput.value = ''; productInput.focus(); }
                if (pieceInput) pieceInput.value = '1';
                if (quantityInput) quantityInput.value = '1';
                if (shelfLifeInput) shelfLifeInput.value = '12';
            }, 500);
        } else {
            console.error('❌ saveProduct() ne postoji!');
        }
        isProcessing = false;
    }, 1000);
}

function processEndCommand() {
    console.log('🏁 End');
    showModernAlert('✅ Završeno', 'Svi unosi su sačuvani!', '📦');
    
    setTimeout(() => {
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        if (typeof loadProductsFromStorage === 'function') loadProductsFromStorage();
        if (typeof renderInventory === 'function') renderInventory();
        setTimeout(() => oznaciNoveUnose(), 300);
    }, 500);
}

function processPlusCommand() {
    console.log('➕ Plus');
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎤 Recite "Start" za novi unos';
        statusEl.style.color = '#4CAF50';
    }
    
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    
    if (productInput) productInput.value = '';
    if (pieceInput) pieceInput.value = '1';
    if (quantityInput) quantityInput.value = '1';
    if (shelfLifeInput) shelfLifeInput.value = '12';
    if (productInput) productInput.focus();
    isProcessing = false;
}

function oznaciNoveUnose() {
    console.log('🔵 Označavam nove unose');
    const rows = document.querySelectorAll('#inventoryTable tbody tr');
    if (!rows.length) return;
    
    const recent = JSON.parse(localStorage.getItem('recentVoiceEntries') || '[]');
    const names = recent.map(p => p.product_name);
    
    rows.forEach((row) => {
        row.classList.remove('new-entry', 'voice-new-entry');
        row.style.backgroundColor = '';
        row.style.borderLeft = '';
        
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
            const name = cells[0]?.textContent?.trim() || '';
            if (names.includes(name)) {
                row.classList.add('new-entry', 'voice-new-entry');
                row.style.backgroundColor = '#e3f2fd';
                row.style.borderLeft = '4px solid #2196F3';
            }
        }
    });
}

function processVoiceCommand(text) {
    if (isProcessing) {
        console.log('⏳ Sačekaj...');
        return;
    }
    
    console.log('🎤 Obrada:', text);
    const lower = text.toLowerCase().trim();
    
    if (lower.includes('unos') || lower.includes('dodaj')) {
        isProcessing = true;
        openDataEntryScreen();
        setTimeout(() => { isProcessing = false; }, 500);
        return;
    }
    
    if (lower.includes('start')) {
        isProcessing = true;
        processStartCommand(text);
        return;
    }
    
    if (lower.includes('plus') || lower.includes('sledeći')) {
        processPlusCommand();
        return;
    }
    
    if (lower.includes('end') || lower.includes('kraj') || lower.includes('završi')) {
        processEndCommand();
        return;
    }
    
    if (lower.includes('pomoć') || lower.includes('help')) {
        showModernAlert('📖 Pomoć', 'Reci "Unos"\n"Start [proizvod]"\n"Plus"\n"End"', '💡');
        return;
    }
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `❌ Nije prepoznato: "${text}"`;
        statusEl.style.color = '#f44336';
        setTimeout(() => {
            statusEl.textContent = '🎤 Recite "Start" ili "End"';
            statusEl.style.color = '#FFD700';
        }, 3000);
    }
}

function processStartCommand(text) {
    console.log('🚀 Start');
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '⏳ Parsiranje...';
        statusEl.style.color = '#FF9800';
    }
    
    let cleanText = text.replace(/^start\s+/i, '').trim();
    const data = parseVoiceDataEntry(cleanText);
    
    if (!data || !data.product_name) {
        if (statusEl) {
            statusEl.textContent = '❌ Nije moguće parsirati. Pokušajte ponovo.';
            statusEl.style.color = '#f44336';
        }
        isProcessing = false;
        return;
    }
    
    popuniStartPodatke(data);
}

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
    recognition.maxAlternatives = 1;

    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎤 Slušam...';
        statusEl.style.color = '#2196F3';
    }

    recognition.onstart = function() {
        console.log('🎤 Mikrofon uključen');
        isListening = true;
        fullSpeechResult = '';
    };

    recognition.onresult = function(event) {
        let fullText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
                fullText += result[0].transcript + ' ';
                console.log(`✅ Reč: "${result[0].transcript}"`);
            }
        }
        
        const speechResult = fullText.trim();
        if (!speechResult) return;
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = `🗣️ "${speechResult}"`;
            statusEl.style.color = '#FFD700';
        }
        
        if (speechResult && speechResult.length > 0 && !isProcessing) {
            processVoiceCommand(speechResult);
        }
    };

    recognition.onerror = function(event) {
        console.error('⚠️ Greška:', event.error);
        isListening = false;
        const statusEl = document.getElementById('voiceStatus');
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
    fullSpeechResult = '';
    
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
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '⏸️ Zaustavljeno';
        statusEl.style.color = '#aaa';
    }
}

function goBackFromVoice() {
    console.log('◀ Povratak');
    stopVoiceRecognition();
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

function addVoiceStyles() {
    if (document.getElementById('voiceStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'voiceStyles';
    style.textContent = `
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-50px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes highlightNew {
            0% { background-color: #e3f2fd; }
            50% { background-color: #bbdefb; }
            100% { background-color: #e3f2fd; }
        }
        .new-entry {
            animation: highlightNew 2s ease 3;
            border-left: 4px solid #2196F3 !important;
        }
        .voice-new-entry td:first-child::before {
            content: "🎤 ";
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);
}

window.processVoiceCommand = processVoiceCommand;
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.processStartCommand = processStartCommand;
window.popuniStartPodatke = popuniStartPodatke;
window.processEndCommand = processEndCommand;
window.openDataEntryScreen = openDataEntryScreen;
window.processPlusCommand = processPlusCommand;

addVoiceStyles();
console.log('✅ Voice Commands učitan!');
console.log('📖 Primer: "Start gril pile 2kg 6 zamrzivač"');
