// ============================================
// POTPUNO POPRAVLJEN VOICECOMMANDS.JS
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
        
        updateVoiceUI("🎤 Mikrofon aktivan. Recite 'Unos', pa 'Start'...", "#4CAF50");
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
            // Čišćenje znakova interpunkcije koje Whisper sam dodaje (npr. "Unos." prebacuje u "unos")
            let cleanText = data.text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim().toLowerCase();
            
            // Ignorišemo tišinu i halucinacije
            if (cleanText.length > 1 && !cleanText.includes("subtitles") && cleanText !== "hvala") {
                voiceAccumulatedText = (voiceAccumulatedText + " " + cleanText).trim();
                updateVoiceUI(`👂 Čujem: "${voiceAccumulatedText}"`, "#FFD700");
                
                evaluateVoicePipeline(voiceAccumulatedText);
            }
        }
    } catch (err) {
        console.warn("Groq Whisper error:", err);
    }
}

// -------------------------------------------------------------
// RUTER KOMANDI (Rešava ignorisanje reči i pogrešno upisivanje)
// -------------------------------------------------------------
function evaluateVoicePipeline(rawText) {
    let lower = rawText.toLowerCase();

    // 1. UNOS -> Pametno hvata "unos" čak i ako ima reči oko nje
    if (lower.includes("unos")) {
        if (typeof window.renderDataEntry === 'function') {
            window.renderDataEntry();
        }
        voiceAccumulatedText = ""; // Čistimo bafer nakon otvaranja
        updateVoiceUI("📝 Ekran otvoren! Izgovorite 'Start' za diktiranje.", "#4CAF50");
        return;
    }

    // 2. START -> Resetuje plave oznake
    if (lower.includes("start")) {
        clearBlueFlagsInStorage();
        voiceAccumulatedText = "";
        updateVoiceUI("🎤 Diktirajte proizvod, pa recite 'Plus'...", "#4CAF50");
        return;
    }

    // 3. PLUS -> Raščlanjuje diktirani tekst i čuva ga
    if (lower.includes("plus")) {
        let phraseBeforePlus = rawText.split(/plus/i)[0].trim();
        if (phraseBeforePlus.length > 1) {
            let parsed = parseSmartVoiceText(phraseBeforePlus);
            fillFormAndSave(parsed, true);
        }
        voiceAccumulatedText = "";
        updateVoiceUI("➕ Sačuvano u plavoj boji! Diktirajte dalje...", "#2196F3");
        return;
    }

    // 4. END -> Kraj unosa i prikaz zaliha
    if (lower.includes("end") || lower.includes("kraj")) {
        let phraseBeforeEnd = rawText.split(/(end|kraj)/i)[0].trim();
        if (phraseBeforeEnd.length > 1) {
            let parsed = parseSmartVoiceText(phraseBeforeEnd);
            fillFormAndSave(parsed, true);
        }
        stopWhisperRecognition();
        if (typeof renderInventory === 'function') renderInventory();
        updateVoiceUI("📦 Unos završen! Otvorene zalihe.", "#4CAF50");
        return;
    }

    // Ako je ekran za unos otvoren, u realnom vremenu popunjavamo polja na ekranu!
    if (document.getElementById('productInput') && rawText.length > 1) {
        let liveParsed = parseSmartVoiceText(rawText);
        updateInputFields(liveParsed);
    }
}

// -------------------------------------------------------------
// PAMETNI PARSER (Odvaja ime, brojeve, jedinicu i zamrzivač)
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

    // Prepoznaj skladište
    if (clean.includes("zamrzivač 2") || clean.includes("zamrzivac 2")) result.storage = "Zamrzivač 2";
    else if (clean.includes("zamrzivač 3") || clean.includes("zamrzivac 3")) result.storage = "Zamrzivač 3";
    else if (clean.includes("frižider") || clean.includes("frizider")) result.storage = "Frižider";
    else if (clean.includes("ostava")) result.storage = "Ostava";

    // Prepoznaj jedinicu
    if (clean.includes("kilogram") || clean.includes("kilo") || clean.includes("kg")) result.unit = "kg";
    else if (clean.includes("litar") || clean.includes("litri") || clean.includes("l")) result.unit = "l";
    else if (clean.includes("gram") || clean.includes("g")) result.unit = "g";
    else if (clean.includes("paket") || clean.includes("pakovanja")) result.unit = "pak";

    // Izvlačenje brojeva za količinu
    let numbers = clean.match(/\d+/g);
    if (numbers && numbers.length > 0) {
        result.quantity = parseInt(numbers[0]);
        if (numbers.length > 1) {
            result.shelf_life = parseInt(numbers[1]); // Drugi broj je rok u mesecima
        }
    }

    // Ime proizvoda je sve što preostane kad izbacimo reči za jedinice i skladište
    let nameClean = clean
        .replace(/zamrzivač \d|zamrzivac \d|frižider|frizider|ostava/gi, "")
        .replace(/kilogram|kilograma|kilo|kg|litar|litra|gram|paket|komad|komada/gi, "")
        .replace(/\d+/g, "")
        .trim();

    result.product_name = nameClean.length > 0 ? nameClean : text;
    return result;
}

function updateInputFields(data) {
    if (document.getElementById('productInput')) document.getElementById('productInput').value = data.product_name;
    if (document.getElementById('quantityInput')) document.getElementById('quantityInput').value = data.quantity;
    if (document.getElementById('unitSelect')) document.getElementById('unitSelect').value = data.unit;
    if (document.getElementById('storageSelect')) document.getElementById('storageSelect').value = data.storage;
    if (document.getElementById('shelfLifeInput')) document.getElementById('shelfLifeInput').value = data.shelf_life;
}

function fillFormAndSave(data, isNewFlag) {
    updateInputFields(data);

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
