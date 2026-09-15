// ============================================
// POTPUNO STABILAN VOICECOMMANDS.JS (BEZ SAMOINICIJATIVNOG UPISA)
// ============================================

let whisperRecorder = null;
let whisperStream = null;
let isWhisperActive = false;
let voiceAccumulatedText = "";
const GROQ_API_KEY = "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";

async function toggleWhisperRecognition() {
    if (isWhisperActive) {
        stopWhisperRecognition();
    } else {
        startWhisperRecognition();
    }
}

async function startWhisperRecognition() {
    try {
        whisperStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        isWhisperActive = true;
        voiceAccumulatedText = "";
        
        updateVoiceUI("🎤 Mikrofon spreman. Recite 'Unos' ili 'Start'", "#4CAF50");
        runChunkRecordingLoop();
    } catch (err) {
        updateVoiceUI("❌ Greška pri pristupu mikrofonu!", "#f44336");
        console.error(err);
    }
}

function stopWhisperRecognition() {
    isWhisperActive = false;
    if (whisperRecorder && whisperRecorder.state !== "inactive") {
        whisperRecorder.stop();
    }
    if (whisperStream) {
        whisperStream.getTracks().forEach(track => track.stop());
    }
    updateVoiceUI("⏹️ Mikrofon isključen", "#aaa");
}

function runChunkRecordingLoop() {
    if (!isWhisperActive) return;

    let chunks = [];
    let options = {};
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
    }

    try {
        whisperRecorder = new MediaRecorder(whisperStream, options);
    } catch (e) {
        whisperRecorder = new MediaRecorder(whisperStream);
    }

    whisperRecorder.ondataavailable = e => { 
        if (e.data && e.data.size > 0) chunks.push(e.data); 
    };

    whisperRecorder.onstop = async () => {
        if (chunks.length > 0 && isWhisperActive) {
            const actualType = whisperRecorder.mimeType || 'audio/webm';
            const blob = new Blob(chunks, { type: actualType });
            await sendChunkToWhisper(blob);
        }
        if (isWhisperActive) runChunkRecordingLoop();
    };

    whisperRecorder.start();
    setTimeout(() => {
        if (whisperRecorder && whisperRecorder.state === "recording") {
            whisperRecorder.stop();
        }
    }, 3500);
}

async function sendChunkToWhisper(audioBlob) {
    const formData = new FormData();
    const ext = audioBlob.type.includes('mp4') ? 'mp4' : 'webm';
    formData.append("file", audioBlob, `audio.${ext}`);
    formData.append("model", "whisper-large-v3");
    formData.append("language", "sr");

    try {
        const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API_KEY}` },
            body: formData
        });
        const data = await res.json();
        
        if (data.text) {
            // Očišćen tekst bez znakova interpunkcije
            let cleanText = data.text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
            let lower = cleanText.toLowerCase();
            
            // STROGA FILTRACIJA LAŽNIH ŠUMOVA I PORTUGALSKIH/ENGLESKIH LAŽNIH PREVODA
            const isNoise = cleanText.length < 2 || 
                            lower === "hvala" || 
                            lower === "hvala vam" || 
                            lower === "šta" || 
                            lower === "sta" || 
                            lower.includes("subtitles") ||
                            lower.includes("obrada");

            if (!isNoise) {
                voiceAccumulatedText = (voiceAccumulatedText + " " + cleanText).trim();
                updateVoiceUI(`👂 Čuo sam: "${voiceAccumulatedText}"`, "#FFD700");
                evaluateVoicePipeline(voiceAccumulatedText);
            }
        }
    } catch (err) {
        console.warn("Groq Whisper error:", err);
    }
}

// -------------------------------------------------------------
// RUTER KOMANDI (ČEKA SVE DOK NE KAŽETE PLUS ILI END)
// -------------------------------------------------------------
function evaluateVoicePipeline(rawText) {
    let lower = rawText.toLowerCase();

    // 1. UNOS -> Otvara ekran i potpuno čisti bafer
    if (lower.includes("unos")) {
        if (typeof window.renderDataEntry === 'function') {
            window.renderDataEntry();
        }
        voiceAccumulatedText = ""; 
        updateVoiceUI("📝 Ekran otvoren! Recite 'Start' za novo diktiranje.", "#4CAF50");
        return;
    }

    // 2. START -> Resetuje plave boje u bazi i čisti bafer
    if (lower.includes("start")) {
        clearBlueFlagsInStorage();
        voiceAccumulatedText = "";
        updateVoiceUI("🎤 Startovano! Diktirajte artikal pa recite 'Plus'...", "#4CAF50");
        return;
    }

    // 3. PLUS -> Tek OVDE se vrši upisivanje u bazu i na ekran
    if (lower.includes("plus")) {
        let phraseBeforePlus = rawText.split(/plus/i)[0].trim();
        if (phraseBeforePlus.length > 1) {
            let parsed = parseSmartVoiceText(phraseBeforePlus);
            saveParsedItemToStorage(parsed, true);
        }
        voiceAccumulatedText = ""; // Čistimo bafer za sledeći proizvod!
        updateVoiceUI("➕ Sačuvano u plavoj boji! Diktirajte sledeći pa kažite 'Plus'", "#2196F3");
        return;
    }

    // 4. END -> Kraj rada, čuva poslednje i otvara zalihe
    if (lower.includes("end") || lower.includes("kraj")) {
        let phraseBeforeEnd = rawText.split(/(end|kraj)/i)[0].trim();
        if (phraseBeforeEnd.length > 1) {
            let parsed = parseSmartVoiceText(phraseBeforeEnd);
            saveParsedItemToStorage(parsed, true);
        }
        stopWhisperRecognition();
        if (typeof renderInventory === 'function') renderInventory();
        updateVoiceUI("📦 Unos završen! Prikazane zalihe.", "#4CAF50");
        return;
    }
}

// -------------------------------------------------------------
// ANALIZA TEKSTA (ODVAJA IME, KOLIČINU I LOKACIJU)
// -------------------------------------------------------------
function parseSmartVoiceText(text) {
    let clean = text.toLowerCase();
    
    let result = {
        product_name: "",
        quantity: 1,
        unit: "kom",
        storage: "Zamrzivač 1",
        shelf_life: 6
    };

    // Određivanje skladišta
    if (clean.includes("zamrzivač 2") || clean.includes("zamrzivac 2")) result.storage = "Zamrzivač 2";
    else if (clean.includes("zamrzivač 3") || clean.includes("zamrzivac 3")) result.storage = "Zamrzivač 3";
    else if (clean.includes("frižider") || clean.includes("frizider")) result.storage = "Frižider";
    else if (clean.includes("ostava")) result.storage = "Ostava";

    // Određivanje jedinice
    if (clean.includes("kilogram") || clean.includes("kilo") || clean.includes("kg")) result.unit = "kg";
    else if (clean.includes("litar") || clean.includes("litri") || clean.includes("l")) result.unit = "l";
    else if (clean.includes("gram") || clean.includes("g")) result.unit = "g";
    else if (clean.includes("paket") || clean.includes("pakovanja")) result.unit = "pak";

    // Određivanje brojeva
    let numbers = clean.match(/\d+/g);
    if (numbers && numbers.length > 0) {
        result.quantity = parseInt(numbers[0]);
        if (numbers.length > 1) {
            result.shelf_life = parseInt(numbers[1]);
        }
    }

    // Čišćenje imena artikla
    let nameClean = clean
        .replace(/zamrzivač \d|zamrzivac \d|frižider|frizider|ostava/gi, "")
        .replace(/kilogram|kilograma|kilo|kg|litar|litra|gram|paket|komad|komada/gi, "")
        .replace(/\d+/g, "")
        .trim();

    result.product_name = nameClean.length > 0 ? nameClean : text;
    return result;
}

function saveParsedItemToStorage(data, isNewFlag) {
    let zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    let newItem = {
        id: Date.now(),
        product_name: data.product_name,
        piece: 1,
        quantity: data.quantity,
        unit: data.unit,
        storage_location: data.storage,
        shelf_life_months: data.shelf_life,
        entry_date: new Date().toISOString().split('T')[0],
        isNew: isNewFlag
    };

    zalihe.push(newItem);
    localStorage.setItem('zalihe', JSON.stringify(zalihe));
}

function clearBlueFlagsInStorage() {
    let zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    zalihe = zalihe.map(item => { item.isNew = false; return item; });
    localStorage.setItem('zalihe', JSON.stringify(zalihe));
}

function updateVoiceUI(msg, color) {
    const statusDiv = document.getElementById('voiceStatus');
    if (statusDiv) {
        statusDiv.textContent = msg;
        if (color) statusDiv.style.color = color;
    }
}

window.startVoiceRecognition = toggleWhisperRecognition;
// Povezivanje sa script1.js
window.voiceCommand = function(text) {
    evaluateVoicePipeline(text);
};
