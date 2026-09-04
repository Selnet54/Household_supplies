// ============================================
// VOICE COMMANDS - INSTANT LOAD VERZIJA v3.1
// ============================================

// 1. ODMAH DEFINIŠEMO GLOBALNE FUNKCIJE DOK SE OSTATAK KODA INICIJALIZUJE
window.startVoiceRecognition = function() {
    if (typeof mainStartVoice === 'function') {
        mainStartVoice();
    } else {
        console.warn('Sistem se još inicijalizuje, sačekajte sekund...');
    }
};

window.forceStartVoice = function(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    window.startVoiceRecognition();
};

let micPermissionGranted = false;
let recognition = null;

function showVoiceStatus(text, color) {
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = text;
        if (color) statusEl.style.color = color;
    }
    console.log('[VOICE]', text);
}

function requestMicrophonePermission() {
    if (micPermissionGranted) return Promise.resolve(true);

    return new Promise((resolve, reject) => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            reject('Pristup mikrofonu nije podržan');
            return;
        }
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                stream.getTracks().forEach(track => track.stop());
                micPermissionGranted = true;
                resolve(true);
            })
            .catch(function(err) {
                micPermissionGranted = false;
                reject(err);
            });
    });
}

// ============================================
// PARSIRANJE I POPUNJAVANJE
// ============================================

const NUMBER_WORDS = {
    'nula': '0', 'jedan': '1', 'jedna': '1', 'jedno': '1',
    'dva': '2', 'dve': '2', 'tri': '3', 'četiri': '4', 'cetiri': '4',
    'pet': '5', 'šest': '6', 'sest': '6', 'sedam': '7', 'osam': '8',
    'devet': '9', 'deset': '10'
};

const UNIT_MAP = {
    'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg',
    'gram': 'g', 'grama': 'g', 'g': 'g',
    'litar': 'l', 'litara': 'l', 'l': 'l',
    'komad': 'kom', 'komada': 'kom', 'kom': 'kom'
};

const STORAGE_MAP = {
    'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
    'frižider': 'Frižider', 'frizider': 'Frižider',
    'ostava': 'Ostava', 'špajz': 'Ostava'
};

function parseVoiceDataEntry(command) {
    let text = command.replace(/^unos\s*/i, '').replace(/^dodaj\s*/i, '').trim();
    let words = text.split(/\s+/).filter(Boolean);
    
    let result = {
        product_name: '', piece: '1', quantity: '1',
        unit: 'kom', shelf_life: '12', storage: 'Zamrzivač 1'
    };
    
    let numbers = [], nameParts = [];
    
    words.forEach(w => {
        let low = w.toLowerCase();
        if (STORAGE_MAP[low]) {
            result.storage = STORAGE_MAP[low];
        } else if (UNIT_MAP[low]) {
            result.unit = UNIT_MAP[low];
        } else if (NUMBER_WORDS[low] || /^\d+(?:[.,]\d+)?$/.test(low)) {
            numbers.push(NUMBER_WORDS[low] || low.replace(',', '.'));
        } else if (!['u', 'za', 'na', 'sa'].includes(low)) {
            nameParts.push(w);
        }
    });

    if (numbers.length >= 1) result.quantity = numbers[0];
    if (numbers.length >= 2) result.piece = numbers[1];
    
    result.product_name = nameParts.join(' ').trim();
    return result;
}

function popuniIUpisi(data) {
    if (!data.product_name) return;

    const inputs = {
        'productInput': data.product_name,
        'pieceInput': data.piece || '1',
        'quantityInput': data.quantity || '1',
        'shelfLifeInput': data.shelf_life || '12',
        'unitSelect': data.unit || 'kom',
        'storageSelect': data.storage || 'Zamrzivač 1'
    };

    for (let id in inputs) {
        const el = document.getElementById(id);
        if (el) {
            el.value = inputs[id];
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    showVoiceStatus(`✅ Uhvaćeno: ${data.product_name} (${data.quantity} ${data.unit})`, '#4CAF50');

    if (typeof saveProduct === 'function') {
        try { saveProduct(); } catch (e) { console.error(e); }
    }
}

// ============================================
// GLAVNA LOGIKA SAKRIVENA IZA mainStartVoice
// ============================================

function mainStartVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showVoiceStatus('❌ Pregledač ne podržava glasovni unos', '#f44336');
        return;
    }

    requestMicrophonePermission().then(() => {
        if (recognition) {
            try { recognition.abort(); } catch(e) {}
        }

        recognition = new SpeechRecognition();
        recognition.lang = 'sr-RS';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = function() {
            showVoiceStatus('🎤 Slušam... Govorite sada', '#4CAF50');
        };

        recognition.onresult = function(event) {
            if (event.results.length > 0) {
                const transcript = event.results[0][0].transcript;
                let parsedData = parseVoiceDataEntry(transcript);
                if (parsedData.product_name) {
                    popuniIUpisi(parsedData);
                } else {
                    showVoiceStatus(`❓ Nije jasno: "${transcript}"`, '#FF9800');
                }
            }
        };

        recognition.onerror = function(event) {
            if (event.error !== 'no-speech') {
                showVoiceStatus(`❌ Greška: ${event.error}`, '#f44336');
            }
        };

        recognition.start();
    }).catch(err => {
        showVoiceStatus('❌ Mikrofon je blokiran!', '#f44336');
    });
}

// Prevezi poziv na pravu funkciju
window.startVoiceRecognition = mainStartVoice;
console.log('✅ VoiceCommands.js uspesno spojen na window!');
