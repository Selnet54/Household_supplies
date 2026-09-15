// ============================================
// WHISPER HANDS-FREE LOGIKA ZA VOICECOMMANDS.JS
// ============================================

let whisperRecorder = null;
let whisperStream = null;
let isWhisperActive = false;
let voiceAccumulatedText = "";
const GROQ_API_KEY = "TVOJ_GROQ_API_KEY"; // Ovde stavite besplatni Groq API ključ

// 1. Pokretanje / Zaustavljanje mikrofona
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
        
        updateVoiceUI("🎤 Slušam... Recite 'Unos', 'Start', 'Plus' ili 'End'", "#4CAF50");
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

// 2. Seckanje audio zapisa na svake 3.5 sekunde
function runChunkRecordingLoop() {
    if (!isWhisperActive) return;

    let chunks = [];
    whisperRecorder = new MediaRecorder(whisperStream, { mimeType: 'audio/webm' });

    whisperRecorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

    whisperRecorder.onstop = async () => {
        if (chunks.length > 0 && isWhisperActive) {
            const blob = new Blob(chunks, { type: 'audio/webm' });
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

// 3. Slanje na Whisper API i akumulacija govora
async function sendChunkToWhisper(audioBlob) {
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    formData.append("model", "whisper-large-v3");
    formData.append("language", "sr");

    try {
        const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API_KEY}` },
            body: formData
        });
        const data = await res.json();
        
        if (data.text && data.text.trim().length > 0) {
            voiceAccumulatedText = (voiceAccumulatedText + " " + data.text.trim()).trim();
            updateVoiceUI(`👂 Bafer: "${voiceAccumulatedText}"`, "#FFD700");
            evaluateVoicePipeline(voiceAccumulatedText);
        }
    } catch (err) {
        console.warn("Groq Whisper error:", err);
    }
}

// 4. Glavni Ruter za Komande (Unos, Start, Plus, End)
function evaluateVoicePipeline(rawText) {
    let lower = rawText.toLowerCase();

    // KOMANDA: "UNOS" -> Otvara ekran za unos
    if (lower.includes("unos")) {
        window.renderDataEntry();
        voiceAccumulatedText = lower.replace(/.*unos/i, "").trim();
        return;
    }

    // KOMANDA: "START" -> Resetuje stare plave proizvode u bele i započinje diktiranje
    if (lower.includes("start")) {
        clearBlueFlagsInStorage();
        voiceAccumulatedText = lower.replace(/.*start/i, "").trim();
        updateVoiceUI("🎤 Startovano! Diktirajte proizvod pa recite 'Plus'", "#4CAF50");
        return;
    }

    // KOMANDA: "PLUS" -> Čuva trenutni proizvod, osvežava prikaz sa PLAVOM podlogom
    if (lower.includes("plus")) {
        let textBeforePlus = rawText.split(/plus/i)[0].trim();
        if (textBeforePlus.length > 2) {
            saveParsedItemToStorage(textBeforePlus, true);
        }
        voiceAccumulatedText = ""; // Čisti bafer za sledeći proizvod
        updateVoiceUI("➕ Sačuvano (Plava podloga)! Diktirajte sledeći...", "#2196F3");
        return;
    }

    // KOMANDA: "END" ili "KRAJ" -> Sprema poslednji proizvod, gasi mikrofon i otvara Zalihe
    if (lower.includes("end") || lower.includes("kraj")) {
        let textBeforeEnd = rawText.split(/(end|kraj)/i)[0].trim();
        if (textBeforeEnd.length > 2) {
            saveParsedItemToStorage(textBeforeEnd, true);
        }
        stopWhisperRecognition();
        if (typeof renderInventory === 'function') renderInventory();
        updateVoiceUI("📦 Unos završen. Otvorene zalihe.", "#4CAF50");
        return;
    }
}

// 5. Pomocne funkcije za upravljanje podacima
function clearBlueFlagsInStorage() {
    let zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    zalihe = zalihe.map(item => { item.isNew = false; return item; });
    localStorage.setItem('zalihe', JSON.stringify(zalihe));
}

function saveParsedItemToStorage(phraseText, isNewFlag) {
    // Pretpostavljena logika parsiranja iz vaseg productParts.js ili script1.js
    let parsedData = (typeof parseVoiceDataEntry === 'function') 
        ? parseVoiceDataEntry(phraseText) 
        : { product_name: phraseText, piece: 1, quantity: 1, unit: 'kom', storage: 'Zamrzivač 1', shelf_life: 6 };

    let zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
    let newItem = {
        id: Date.now(),
        product_name: parsedData.product_name || phraseText,
        piece: parsedData.piece || 1,
        quantity: parsedData.quantity || 1,
        unit: parsedData.unit || 'kom',
        storage_location: parsedData.storage || 'Zamrzivač 1',
        shelf_life_months: parsedData.shelf_life || 6,
        entry_date: new Date().toISOString().split('T')[0],
        isNew: isNewFlag // Postavlja plavu oznaku!
    };

    zalihe.push(newItem);
    localStorage.setItem('zalihe', JSON.stringify(zalihe));
}

function updateVoiceUI(msg, color) {
    const statusDiv = document.getElementById('voiceStatus');
    if (statusDiv) {
        statusDiv.textContent = msg;
        if (color) statusDiv.style.color = color;
    }
}

// Globalni export za dugme u HTML-u
window.startVoiceRecognition = toggleWhisperRecognition;
