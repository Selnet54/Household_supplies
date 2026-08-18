// ============================================
// VOICE COMMANDS - JEDNOSTAVNA VERZIJA
// SAMO POPUNJAVA POLJA I ČUVA
// ============================================

let recognition = null;
let isListening = false;
let speechTimeout = null;

// ===== OTVORI DATA ENTRY =====
function openVoiceDataEntry() {
    console.log('📂 Otvaram Data Entry');
    
    // Samo prikaži data entry ekran
    const dataEntry = document.getElementById('dataEntryScreen');
    if (dataEntry) {
        dataEntry.style.display = 'flex';
        dataEntry.classList.add('active');
    }
    
    // Sakrij voice menu
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
    }
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎤 Recite "Start" pa podatke';
        statusEl.style.color = '#4CAF50';
    }
    
    if (!isListening) {
        startVoiceRecognition();
    }
}

// ===== POPUNI POLJA =====
function popuniPolja(proizvod, kolicina, jedinica, skladiste, rok) {
    console.log('📝 Popunjavam:', {proizvod, kolicina, jedinica, skladiste, rok});
    
    const productInput = document.getElementById('productInput');
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const unitSelect = document.getElementById('unitSelect');
    const storageSelect = document.getElementById('storageSelect');
    
    if (!productInput) {
        alert('❌ Greška: Polja ne postoje!');
        return;
    }
    
    // Popuni
    productInput.value = proizvod;
    if (quantityInput) quantityInput.value = kolicina;
    if (pieceInput) pieceInput.value = '1';
    if (shelfLifeInput) shelfLifeInput.value = rok || '12';
    
    if (unitSelect) {
        for (let opt of unitSelect.options) {
            if (opt.value === jedinica || opt.text.toLowerCase().includes(jedinica)) {
                opt.selected = true;
                break;
            }
        }
    }
    
    if (storageSelect) {
        for (let opt of storageSelect.options) {
            if (opt.text.toLowerCase().includes(skladiste.toLowerCase())) {
                opt.selected = true;
                break;
            }
        }
    }
    
    if (typeof updateExpiryDate === 'function') updateExpiryDate();
    if (typeof prikaziSveUnose === 'function') prikaziSveUnose();
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `✅ ${proizvod} - ${kolicina} ${jedinica}`;
        statusEl.style.color = '#4CAF50';
    }
    
    // Sačuvaj za PLUS
    window.trenutniProizvod = {proizvod, kolicina, jedinica, skladiste, rok};
}

// ===== SAČUVAJ =====
function sacuvajProizvod() {
    if (!window.trenutniProizvod) {
        alert('⚠️ Nema proizvoda za čuvanje!');
        return;
    }
    
    console.log('💾 Čuvam:', window.trenutniProizvod);
    
    // Probaj saveProduct
    if (typeof saveProduct === 'function') {
        saveProduct();
    } else if (typeof window.saveProduct === 'function') {
        window.saveProduct();
    } else {
        // Klikni na dugme
        const btn = document.querySelector('.btn-save');
        if (btn) btn.click();
    }
    
    alert('✅ Sačuvano: ' + window.trenutniProizvod.proizvod);
    
    // Očisti
    window.trenutniProizvod = null;
    const productInput = document.getElementById('productInput');
    const quantityInput = document.getElementById('quantityInput');
    if (productInput) productInput.value = '';
    if (quantityInput) quantityInput.value = '1';
    if (productInput) productInput.focus();
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎤 Recite "Start" za novi unos';
        statusEl.style.color = '#4CAF50';
    }
}

// ===== OTVORI ZALIHE =====
function otvoriZalihe() {
    if (window.trenutniProizvod) {
        if (typeof saveProduct === 'function') saveProduct();
        window.trenutniProizvod = null;
    }
    
    alert('✅ Završeno! Otvaram zalihe.');
    
    setTimeout(() => {
        if (typeof loadProductsFromStorage === 'function') loadProductsFromStorage();
        if (typeof renderInventory === 'function') renderInventory();
        if (typeof prikaziSveUnose === 'function') prikaziSveUnose();
        
        // Zatvori data entry
        const dataEntry = document.getElementById('dataEntryScreen');
        if (dataEntry) {
            dataEntry.style.display = 'none';
            dataEntry.classList.remove('active');
        }
        
        // Prikaži main screen
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
        
        stopVoiceRecognition();
    }, 300);
}

// ===== PARSIRANJE =====
function parsiraj(text) {
    console.log('🔍 Parsiram:', text);
    
    let clean = text.replace(/^start\s+/i, '').trim();
    if (!clean || clean === 'start') return null;
    
    let words = clean.split(/\s+/);
    let result = {
        proizvod: '',
        kolicina: '1',
        jedinica: 'komad',
        skladiste: 'Ostava',
        rok: '12'
    };
    
    // Pronađi skladište
    const skladista = ['zamrzivač', 'frižider', 'ostava', 'podrum', 'soba'];
    for (let i = 0; i < words.length; i++) {
        for (let s of skladista) {
            if (words[i].toLowerCase().includes(s)) {
                result.skladiste = s.charAt(0).toUpperCase() + s.slice(1);
                words.splice(i, 1);
                i--;
                break;
            }
        }
    }
    
    // Pronađi broj
    for (let i = 0; i < words.length; i++) {
        let num = parseFloat(words[i].replace(',', '.'));
        if (!isNaN(num) && num > 0) {
            result.kolicina = num.toString();
            if (i + 1 < words.length) {
                const next = words[i + 1].toLowerCase();
                if (next.includes('kg')) { result.jedinica = 'kg'; words.splice(i, 2); break; }
                if (next.includes('g')) { result.jedinica = 'g'; words.splice(i, 2); break; }
                if (next.includes('l')) { result.jedinica = 'l'; words.splice(i, 2); break; }
                if (next.includes('kom')) { result.jedinica = 'komad'; words.splice(i, 2); break; }
            }
            words.splice(i, 1);
            break;
        }
    }
    
    result.proizvod = words.join(' ').trim();
    if (!result.proizvod) return null;
    
    console.log('✅ Parsirano:', result);
    return result;
}

// ===== OBRADA KOMANDE =====
function processVoiceCommand(text) {
    console.log('🎤:', text);
    const lower = text.toLowerCase().trim();
    
    // Komande
    if (lower === 'unos' || lower === 'otvori') {
        openVoiceDataEntry();
        return;
    }
    if (lower === 'plus' || lower === 'sledeći') {
        sacuvajProizvod();
        return;
    }
    if (lower === 'end' || lower === 'kraj') {
        otvoriZalihe();
        return;
    }
    
    // Start - sačekaj
    if (lower.includes('start')) {
        if (speechTimeout) clearTimeout(speechTimeout);
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '⏳ Obrada...';
            statusEl.style.color = '#FF9800';
        }
        
        speechTimeout = setTimeout(() => {
            const data = parsiraj(text);
            if (data && data.proizvod) {
                popuniPolja(data.proizvod, data.kolicina, data.jedinica, data.skladiste, data.rok);
            } else {
                const statusEl = document.getElementById('voiceStatus');
                if (statusEl) {
                    statusEl.textContent = '❌ Nije prepoznato';
                    statusEl.style.color = '#f44336';
                }
            }
            speechTimeout = null;
        }, 1500);
        return;
    }
    
    // Nije prepoznato
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '❌ Nije prepoznato: ' + text;
        statusEl.style.color = '#f44336';
    }
}

// ===== MIKROFON =====
function startVoiceRecognition() {
    if (isListening) return;
    
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
    };

    recognition.onresult = function(event) {
        let fullText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                fullText += event.results[i][0].transcript + ' ';
            }
        }
        const text = fullText.trim();
        if (text) {
            console.log('🗣️:', text);
            if (statusEl) {
                statusEl.textContent = '🗣️ "' + text + '"';
                statusEl.style.color = '#FFD700';
            }
            processVoiceCommand(text);
        }
    };

    recognition.onerror = function(event) {
        console.error('⚠️ Greška:', event.error);
        isListening = false;
        if (statusEl) {
            statusEl.textContent = '❌ Greška';
            statusEl.style.color = '#f44336';
        }
    };

    recognition.onend = function() {
        console.log('🎤 Mikrofon isključen');
        isListening = false;
    };

    try {
        recognition.start();
        isListening = true;
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
        } catch(e) {}
    }
}

function goBackFromVoice() {
    stopVoiceRecognition();
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
    }
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
window.openVoiceDataEntry = openVoiceDataEntry;
window.popuniPolja = popuniPolja;
window.sacuvajProizvod = sacuvajProizvod;
window.otvoriZalihe = otvoriZalihe;

console.log('✅ JEDNOSTAVNA VOICE VERZIJA UČITANA!');
console.log('📖 Komande:');
console.log('   "UNOS" - otvori');
console.log('   "START gril pile 2 kg" - popuni polja');
console.log('   "PLUS" - sačuvaj');
console.log('   "END" - zalihe');
