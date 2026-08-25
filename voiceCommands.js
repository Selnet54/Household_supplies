// ============================================
// VOICE COMMANDS - PRILAGOĐEN ZA VAŠU APLIKACIJU
// ============================================

// Singleton stanje
const VoiceState = {
    activeBuffer: '',
    recognition: null,
    isProcessing: false,
    speechTimeout: null,
    restartTimer: null,
    isVoiceInput: false,
    pendingEntries: []        // privremene stavke
};

// ============================================
// 1. JEZIČKE MAPE (ostaju iste – samo skraćeno)
// ============================================

const SUPPORTED_LANGUAGES = ['sr', 'en', 'de', 'hu', 'uk', 'ru', 'zh', 'es', 'pt', 'fr'];

const VOICE_COMMANDS = { /* ... isto kao u originalu ... */ };
const BUTTON_LABELS = { /* ... */ };
const VOICE_MESSAGES = { /* ... */ };
const NUMBER_WORDS = { /* ... */ };
const UNIT_MAP = { /* ... */ };
const STORAGE_MAP = { /* ... */ };
const SPEECH_LANG_MAP = { /* ... */ };

// ============================================
// 2. POMOĆNE FUNKCIJE (zadržavamo)
// ============================================

function getCurrentLang() { return (typeof currentLang !== 'undefined' && currentLang) ? currentLang : 'sr'; }
function getMessage(key) { /* ... */ }
function getButtonLabel(action) { /* ... */ }
function getVoiceCommands() { /* ... */ }
function detectVoiceCommand(text) { /* ... */ }
function showVoiceStatus(text, color) { /* ... */ }
function getNumber(word) { /* ... */ }

// ============================================
// 3. PARSIRANJE (popravljeno – podrazumevana jedinica = 'kom')
// ============================================

function parseVoiceDataEntry(command) {
    if (!command) return null;
    let text = command.toLowerCase()
        .replace(/^(šta|start|dodaj|unos|unesi|add|new|enter|...)\s*/i, '')
        .replace(/\b(grile|gril|green)\b/gi, 'grill')
        .trim();

    const words = text.split(/\s+/).filter(Boolean);
    let result = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',           // ⬅️ podrazumevana jedinica
        shelf_life: '6',
        storage: 'Zamrzivač 1'
    };

    let foundStorage = null, foundUnit = null;
    let unitIndex = -1, storageIndex = -1;

    for (let i = 0; i < words.length; i++) {
        let w = words[i];
        // skladište
        for (let key in STORAGE_MAP) {
            if (w.includes(key)) {
                foundStorage = STORAGE_MAP[key];
                storageIndex = i;
                break;
            }
        }
        // jedinica – samo ako je eksplicitno navedena
        if (UNIT_MAP[w]) {
            foundUnit = UNIT_MAP[w];
            unitIndex = i;
        }
    }

    let nameParts = [], numbers = [];
    const skipWords = new Set(['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima', 'i']);

    for (let i = 0; i < words.length; i++) {
        if (i === storageIndex || i === unitIndex || skipWords.has(words[i])) continue;
        let numVal = getNumber(words[i]);
        if (numVal !== null) {
            numbers.push(numVal);
        } else {
            nameParts.push(words[i]);
        }
    }

    if (numbers.length >= 3) {
        [result.piece, result.quantity, result.shelf_life] = numbers;
    } else if (numbers.length === 2) {
        if (parseFloat(numbers[1]) > 3 && !text.includes('kg')) {
            result.piece = result.quantity = numbers[0];
            result.shelf_life = numbers[1];
        } else {
            [result.piece, result.quantity] = numbers;
        }
    } else if (numbers.length === 1) {
        result.piece = result.quantity = numbers[0];
    }

    if (foundUnit) result.unit = foundUnit;
    if (foundStorage) result.storage = foundStorage;

    result.product_name = nameParts.join(' ').trim() || 'Proizvod';
    result.product_name = result.product_name.charAt(0).toUpperCase() + result.product_name.slice(1);

    return result;
}

// ============================================
// 4. RAD SA PRIVREMENIM STAVKAMA
// ============================================

function addPendingEntry(data) {
    if (!data || !data.product_name) return false;
    VoiceState.pendingEntries.push(data);
    // Osveži prikaz na ekranu unosa (ako vaša aplikacija ima funkciju za to)
    if (typeof window.renderPendingEntries === 'function') {
        window.renderPendingEntries(VoiceState.pendingEntries);
    } else {
        // Fallback – možete sami ažurirati DOM ako znate ID elementa
        const listEl = document.getElementById('pendingEntryList');
        if (listEl) {
            const item = document.createElement('div');
            item.textContent = `${data.product_name} (${data.quantity} ${data.unit})`;
            listEl.appendChild(item);
        }
    }
    showVoiceStatus(`➕ Dodato: ${data.product_name}`, '#4CAF50');
    return true;
}

function saveAllPendingEntries() {
    if (VoiceState.pendingEntries.length === 0) {
        showVoiceStatus('ℹ️ Nema stavki za snimanje.', '#FF9800');
        return;
    }
    // Pozivamo vašu globalnu funkciju za čuvanje više stavki (ako postoji)
    if (typeof window.saveInventoryEntries === 'function') {
        window.saveInventoryEntries(VoiceState.pendingEntries);
    } else {
        // Fallback – čuvamo jednu po jednu (koristimo postojeću sacuvajPodatke)
        VoiceState.pendingEntries.forEach(entry => {
            if (typeof window.sacuvajPodatke === 'function') {
                window.sacuvajPodatke(entry);
            } else {
                console.warn('Nema funkcije za čuvanje podataka.');
            }
        });
    }
    VoiceState.pendingEntries = [];
    if (typeof window.renderPendingEntries === 'function') {
        window.renderPendingEntries([]);
    }
    showVoiceStatus(`✅ Snimljeno ${VoiceState.pendingEntries.length} stavki.`, '#4CAF50');
}

// ============================================
// 5. EKRANSKE FUNKCIJE – POZIVAJU VAŠE FUNKCIJE
// ============================================

function showDataEntry() {
    // Otvorite vaš ekran za unos
    if (typeof window.showAddScreen === 'function') {
        window.showAddScreen();
    } else {
        // Ako nemate, pokušajte sa showScreen('mainScreen') i renderujte
        if (typeof showScreen === 'function') showScreen('mainScreen');
        // Takođe pozovite vaš render za unos (ako postoji)
        if (typeof renderDataEntry === 'function') renderDataEntry('');
    }
    // Prikažite pending stavke ako imate element
    if (typeof window.renderPendingEntries === 'function') {
        window.renderPendingEntries(VoiceState.pendingEntries);
    }
    showVoiceStatus('📝 Unos otvoren – govorite nazive proizvoda', '#4CAF50');
}

function otvoriSpisakEkran() {
    stopVoiceRecognition();
    if (typeof window.showListScreen === 'function') {
        window.showListScreen();
    } else {
        if (typeof showScreen === 'function') showScreen('mainScreen');
        if (typeof renderShoppingList === 'function') renderShoppingList();
    }
    showVoiceStatus('📋 Spisak otvoren', '#4CAF50');
}

function otvoriZaliheEkran() {
    stopVoiceRecognition();
    if (typeof window.showStockScreen === 'function') {
        window.showStockScreen();
    } else {
        if (typeof showScreen === 'function') showScreen('mainScreen');
        if (typeof renderInventory === 'function') renderInventory();
    }
    showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
}

function goBackFromVoice() {
    stopVoiceRecognition();
    if (typeof window.showMainMenu === 'function') {
        window.showMainMenu();
    } else {
        if (typeof showScreen === 'function') showScreen('choiceScreen');
        if (typeof updateHeaderLanguage === 'function') updateHeaderLanguage();
        if (typeof updateInterfaceLanguage === 'function') updateInterfaceLanguage();
    }
    showVoiceStatus('⏹️ Povratak', '#aaa');
}

// ============================================
// 6. MOTOR ZA GLASOVNE KOMANDE (IZMENJEN)
// ============================================

function processVoiceInput(buffer) {
    if (!buffer || VoiceState.isProcessing) return;
    const lower = buffer.toLowerCase().trim();
    VoiceState.isProcessing = true;

    // 1. Komanda PLUS → dodaj u pending listu
    if (lower.includes('plus')) {
        const parts = buffer.split(/\bplus\b/i);
        const data = parseVoiceDataEntry(parts[0]);
        if (data) {
            addPendingEntry(data);
            // Opciono: popunite formu sa trenutnim podacima (ako je potrebno)
            if (typeof window.popuniFormuPodacima === 'function') {
                window.popuniFormuPodacima(data);
            }
        } else {
            showVoiceStatus('❌ Nisam razumeo unos.', '#f44336');
        }
        VoiceState.activeBuffer = '';
        VoiceState.isProcessing = false;
        return;
    }

    // 2. Komanda END / KRAJ / GOTOVO → snimi sve pending i zatvori
    if (lower.includes('end') || lower.includes('kraj') || lower.includes('gotovo')) {
        // Ako ima teksta pre 'end', možemo ga dodati kao poslednju stavku
        const textBeforeEnd = buffer.replace(/\b(end|kraj|gotovo)\b/gi, '').trim();
        if (textBeforeEnd) {
            const data = parseVoiceDataEntry(textBeforeEnd);
            if (data) addPendingEntry(data);
        }
        saveAllPendingEntries();
        stopVoiceRecognition();
        otvoriZaliheEkran(); // ili glavni meni
        VoiceState.isProcessing = false;
        VoiceState.activeBuffer = '';
        return;
    }

    // 3. Navigacione komande
    const cmd = detectVoiceCommand(buffer);
    if (cmd) {
        switch(cmd) {
            case 'add': showDataEntry(); break;
            case 'list': otvoriSpisakEkran(); break;
            case 'stock': otvoriZaliheEkran(); break;
            case 'close': goBackFromVoice(); break;
        }
        VoiceState.isProcessing = false;
        VoiceState.activeBuffer = '';
        return;
    }

    // 4. Ako nije ništa prepoznato – prikaži poruku
    showVoiceStatus(getMessage('not_recognized'), '#f44336');
    VoiceState.isProcessing = false;
    VoiceState.activeBuffer = '';
}

// ============================================
// 7. START / STOP PREPOZNAVANJA (isti kao pre)
// ============================================

function startVoiceRecognition() {
    if (VoiceState.recognition) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showVoiceStatus('❌ Browser ne podržava glasovno prepoznavanje.', '#f44336');
        return;
    }
    const rec = new SpeechRecognition();
    const lang = getCurrentLang();
    rec.lang = SPEECH_LANG_MAP[lang] || 'sr-RS';
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = () => {
        showVoiceStatus('🎤 ' + getMessage('welcome'), '#2196F3');
        VoiceState.activeBuffer = '';
    };

    rec.onresult = (e) => {
        let interimText = '', finalChunk = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) finalChunk += e.results[i][0].transcript;
            else interimText += e.results[i][0].transcript;
        }
        if (finalChunk) VoiceState.activeBuffer += (VoiceState.activeBuffer ? ' ' : '') + finalChunk;
        showVoiceStatus('🎤 ' + getMessage('listening') + ' "' + (VoiceState.activeBuffer || interimText) + '"', '#FFD700');

        clearTimeout(VoiceState.speechTimeout);
        VoiceState.speechTimeout = setTimeout(() => {
            processVoiceInput(VoiceState.activeBuffer);
        }, 500);
    };

    rec.onerror = (e) => {
        console.warn('Speech greška:', e.error);
        if (e.error === 'not-allowed') showVoiceStatus('❌ Dozvolite pristup mikrofonu.', '#f44336');
    };

    rec.onend = () => {
        VoiceState.recognition = null;
        if (VoiceState.isVoiceInput) {
            VoiceState.restartTimer = setTimeout(startVoiceRecognition, 1000);
        }
    };

    VoiceState.recognition = rec;
    VoiceState.isVoiceInput = true;
    rec.start();
}

function stopVoiceRecognition() {
    VoiceState.isVoiceInput = false;
    clearTimeout(VoiceState.restartTimer);
    clearTimeout(VoiceState.speechTimeout);
    if (VoiceState.recognition) {
        try { VoiceState.recognition.stop(); } catch(e) {}
        VoiceState.recognition = null;
    }
    VoiceState.activeBuffer = '';
    VoiceState.isProcessing = false;
}

// ============================================
// 8. EKSPORT (globalno)
// ============================================

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.sacuvajPodatke = sacuvajPodatke; // ostavljamo za fallback
window.showDataEntry = showDataEntry;
window.otvoriZaliheEkran = otvoriZaliheEkran;
window.otvoriSpisakEkran = otvoriSpisakEkran;
window.getCurrentLang = getCurrentLang;
window.getMessage = getMessage;
window.voiceCommand = function(action) { /* ... */ };
window.VOICE_COMMANDS = VOICE_COMMANDS;
window.VOICE_MESSAGES = VOICE_MESSAGES;
window.BUTTON_LABELS = BUTTON_LABELS;
// Dodajemo i pending listu za eksterni pristup
window.getPendingEntries = () => VoiceState.pendingEntries;
window.clearPendingEntries = () => { VoiceState.pendingEntries = []; };

console.log('✅ Voice Commands prilagođene za vašu aplikaciju!');
