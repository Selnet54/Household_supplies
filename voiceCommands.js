// ============================================
// POTPUNO AUTOMATSKI NATIVNI MIKROFON (AUTO-RESTART)
// ============================================

let recognition = null;
let isVoiceActive = false;
let userIntentionalStop = false;

function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        updateVoiceUI("❌ Pretraživač ne podržava glasovno upravljanje", "#f44336");
        return null;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'sr-RS'; // Srpski jezik za prepoznavanje

    rec.onstart = () => {
        isVoiceActive = true;
        updateVoiceUI("🎤 Mikrofon aktivan. Pričajte slobodno...", "#4CAF50");
    };

    rec.onresult = (event) => {
        const lastIndex = event.results.length - 1;
        const recognizedText = event.results[lastIndex][0].transcript.trim();
        console.log("👂 Čuo sam:", recognizedText);
        
        updateVoiceUI(`👂 Čuo sam: "${recognizedText}"`, "#FFD700");

        if (typeof evaluateVoicePipeline === 'function') {
            evaluateVoicePipeline(recognizedText);
        }
    };

    rec.onerror = (event) => {
        console.warn("⚠️ Mikrofonska greška:", event.error);
        if (event.error === 'not-allowed') {
            userIntentionalStop = true;
            updateVoiceUI("❌ Pristup mikrofonu je odbijen!", "#f44336");
        }
    };

    rec.onend = () => {
        isVoiceActive = false;
        // AUTOMATSKI RESTART: Ako ga sistem ugasi sam, ponovo ga palimo bez dodira ekrana
        if (!userIntentionalStop) {
            console.log("🔄 Sistem je ugasio mikrofon - automatsko ponovno paljenje...");
            setTimeout(() => {
                try {
                    rec.start();
                } catch (e) {
                    console.log("Mikrofon je već pokrenut.");
                }
            }, 300);
        } else {
            updateVoiceUI("⏹️ Mikrofon isključen", "#aaa");
        }
    };

    return rec;
}

// Pokretanje i zaustavljanje mikrofona
function toggleVoiceRecognition() {
    if (isVoiceActive) {
        stopVoiceRecognition();
    } else {
        startVoiceRecognition();
    }
}

function startVoiceRecognition() {
    userIntentionalStop = false;
    if (!recognition) {
        recognition = initSpeechRecognition();
    }
    if (recognition && !isVoiceActive) {
        try {
            recognition.start();
        } catch (e) {
            console.log("Mikrofon start greška:", e);
        }
    }
}

function stopVoiceRecognition() {
    userIntentionalStop = true;
    if (recognition) {
        try {
            recognition.stop();
        } catch (e) {}
    }
    isVoiceActive = false;
    updateVoiceUI("⏹️ Mikrofon isključen", "#aaa");
}

// -------------------------------------------------------------
// OBRADA KOMANDI I PARSIRANJE ARTIKALA
// -------------------------------------------------------------
function evaluateVoicePipeline(rawText) {
    if (!rawText) return;
    let lower = rawText.toLowerCase().trim();

    // 1. OTVARANJE EKRANA UNOS
    if (lower.includes("unos") || lower.includes("unesi") || lower.includes("dodaj")) {
        if (typeof window.renderDataEntry === 'function') {
            window.renderDataEntry();
        }
        updateVoiceUI("📝 Ekran za unos otvoren!", "#4CAF50");
        return;
    }

    // 2. OTVARANJE ZALIHA / KRAJ
    if (lower.includes("zalihe") || lower.includes("stanje") || lower.includes("kraj") || lower.includes("end")) {
        if (typeof window.renderInventory === 'function') {
            window.renderInventory();
        }
        updateVoiceUI("📦 Prikazane zalihe!", "#4CAF50");
        return;
    }

    // 3. DIKTIRANJE ARTIKALA (Ako tekst sadrži nazive mesta ili količinu)
    if (lower.includes("zamrzivač") || lower.includes("zamrzivac") || lower.includes("frižider") || 
        lower.includes("frizider") || lower.includes("ostava") || lower.includes("kilo") || lower.includes("kg")) {
        
        let parsed = parseSmartVoiceText(rawText);
        saveParsedItemToStorage(parsed, true);
        updateVoiceUI(`➕ Sačuvano: ${parsed.product_name} (${parsed.quantity} ${parsed.unit})`, "#2196F3");
    }
}

function parseSmartVoiceText(text) {
    let clean = text.toLowerCase().trim();
    
    let result = {
        product_name: "",
        quantity: 1,
        unit: "kom",
        storage: "Zamrzivač 1",
        shelf_life: 6
    };

    // Detekcija lokacije
    if (clean.includes("zamrzivač 2") || clean.includes("zamrzivac 2")) result.storage = "Zamrzivač 2";
    else if (clean.includes("zamrzivač 3") || clean.includes("zamrzivac 3")) result.storage = "Zamrzivač 3";
    else if (clean.includes("frižider") || clean.includes("frizider")) result.storage = "Frižider";
    else if (clean.includes("ostava") || clean.includes("špajz")) result.storage = "Ostava";
    else if (clean.includes("zamrzivač") || clean.includes("zamrzivac")) result.storage = "Zamrzivač 1";

    // Jedinica
    if (clean.includes("kilogram") || clean.includes("kilo") || clean.includes("kg")) result.unit = "kg";
    else if (clean.includes("litar") || clean.includes("litra") || clean.includes("l")) result.unit = "l";
    else if (clean.includes("gram") || clean.includes("g")) result.unit = "g";
    else if (clean.includes("paket") || clean.includes("pak")) result.unit = "pak";

    // Brojevi
    let numbers = clean.match(/\d+/g);
    if (numbers && numbers.length > 0) {
        result.quantity = parseInt(numbers[0]);
        if (numbers.length > 1) result.shelf_life = parseInt(numbers[1]);
    }

    // Čišćenje imena artikla
    let nameClean = clean
        .replace(/zamrzivač \d|zamrzivac \d|zamrzivač|zamrzivac|frižider|frizider|ostava|špajz/gi, "")
        .replace(/kilogram|kilograma|kilo|kg|litar|litra|gram|paket|komad|komada|kom/gi, "")
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

function updateVoiceUI(msg, color) {
    const statusDiv = document.getElementById('voiceStatus');
    if (statusDiv) {
        statusDiv.textContent = msg;
        if (color) statusDiv.style.color = color;
    }
}

// Globalni ulazi
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.toggleVoiceRecognition = toggleVoiceRecognition;
window.voiceCommand = evaluateVoicePipeline;
