// ============================================
// VOICE COMMANDS - MOBILNA OPTIMIZOVANA VERZIJA
// ============================================

// ===== MOBILNA DETEKCIJA =====
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

let activeBuffer = '';
let recognition = null;
let isRecognitionActive = false;
let silenceTimer = null;
let sessionStartTime = null;

// ===== MOBILNI KONFIGURACIONI PARAMETRI =====
const MOBILE_CONFIG = {
    silenceTimeout: isMobile ? 3000 : 5000,
    maxSessionDuration: isMobile ? 45000 : 120000,
    vibrateOnStart: isMobile,
    vibrateOnEnd: isMobile,
    useContinuous: !isMobile, // Na mobilnim uređajima ne koristi continuous
    audioConstraints: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
    }
};

// ===== POBOLJŠANI POKRETAČ ZA MOBILNE UREĐAJE =====
function startVoiceRecognition() {
    // Provera podrške
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showMobileFallback();
        return;
    }

    // Zaustavi prethodnu sesiju
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }

    // Zahtev za permisiju na mobilnim uređajima
    if (isMobile) {
        requestMicrophonePermission().then(granted => {
            if (granted) {
                initializeRecognition();
            } else {
                showMicrophonePermissionError();
            }
        });
    } else {
        initializeRecognition();
    }
}

// ===== ZAHTEV ZA PERMISIJU =====
async function requestMicrophonePermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: MOBILE_CONFIG.audioConstraints 
        });
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch(e) {
        console.error('❌ Mikrofon nije dozvoljen:', e);
        return false;
    }
}

// ===== INICIJALIZACIJA RECOGNITION =====
function initializeRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    const langCode = typeof currentLang !== 'undefined' ? currentLang : 'sr';
    const speechLangMap = {
        sr: 'sr-RS', en: 'en-US', de: 'de-DE', hu: 'hu-HU',
        uk: 'uk-UA', ru: 'ru-RU', zh: 'zh-CN', es: 'es-ES',
        pt: 'pt-PT', fr: 'fr-FR'
    };
    
    recognition.lang = speechLangMap[langCode] || 'sr-RS';
    
    // MOBILNA OPTIMIZACIJA - ne koristi continuous na mobilnim
    recognition.continuous = MOBILE_CONFIG.useContinuous;
    recognition.interimResults = true;
    recognition.maxAlternatives = isMobile ? 3 : 1;
    
    // Povećaj timeout za mobilne
    if (isMobile) {
        recognition.timeout = 30000;
    }

    setupRecognitionEvents();
    
    try {
        recognition.start();
        isRecognitionActive = true;
        sessionStartTime = Date.now();
        
        // Vibracija za mobilne
        if (MOBILE_CONFIG.vibrateOnStart) {
            navigator.vibrate && navigator.vibrate(50);
        }
        
        updateVoiceStatus('🎤 Slušam... (mobilni režim)', '#2196F3');
        console.log('🎤 Mobile voice recognition started');
    } catch(e) {
        console.log('❌ Greška pri pokretanju:', e);
        showMobileFallback();
    }
}

// ===== POSTAVLJANJE EVENTOVA =====
function setupRecognitionEvents() {
    let interimTimeout = null;
    
    recognition.onstart = function() {
        console.log('🎤 Prepoznavanje pokrenuto');
        isRecognitionActive = true;
        activeBuffer = '';
        lastSpeechTime = Date.now();
        
        // Resetuj timer za tišinu
        resetSilenceTimer();
    };

    recognition.onresult = function(event) {
        let interimText = '';
        let finalChunk = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript.trim();
            if (result.isFinal) {
                finalChunk += (finalChunk ? ' ' : '') + transcript;
            } else {
                interimText += transcript;
            }
        }
        
        if (finalChunk) {
            activeBuffer += (activeBuffer ? ' ' : '') + finalChunk;
            lastSpeechTime = Date.now();
            resetSilenceTimer();
        }
        
        const currentDisplay = activeBuffer + (interimText ? ' ' + interimText : '');
        updateVoiceStatus(`🎤 Slušam: "${currentDisplay}"`, '#FFD700');
        
        // Proveri komande
        checkVoiceCommands(activeBuffer);
        
        // MOBILNA OPTIMIZACIJA - ograniči trajanje sesije
        if (isMobile && sessionStartTime && (Date.now() - sessionStartTime > MOBILE_CONFIG.maxSessionDuration)) {
            stopVoiceRecognition();
            showMobileTimeoutMessage();
        }
    };

    recognition.onerror = function(event) {
        console.log('⚠️ Speech greška:', event.error);
        
        if (event.error === 'not-allowed') {
            showMicrophonePermissionError();
        } else if (event.error === 'no-speech') {
            // Na mobilnim - pokušaj ponovo
            if (isMobile && isRecognitionActive) {
                setTimeout(() => {
                    if (isRecognitionActive) {
                        try { recognition.start(); } catch(e) {}
                    }
                }, 1000);
            }
        } else if (event.error === 'audio-capture') {
            showMobileFallback();
        }
    };

    recognition.onend = function() {
        console.log('🎤 Prepoznavanje završeno');
        isRecognitionActive = false;
        
        // Vibracija za mobilne
        if (MOBILE_CONFIG.vibrateOnEnd) {
            navigator.vibrate && navigator.vibrate(30);
        }
        
        // Automatski restart na mobilnim ako je aktivno
        if (isMobile && !document.hidden) {
            setTimeout(() => {
                if (!isRecognitionActive && !recognition) {
                    startVoiceRecognition();
                }
            }, 2000);
        }
    };
}

// ===== TIMER ZA TIŠINU =====
function resetSilenceTimer() {
    if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
    }
    
    silenceTimer = setTimeout(() => {
        if (isRecognitionActive && activeBuffer.length > 0) {
            // Ako ima teksta u baferu, procesuiraj ga
            console.log('⏰ Tišina detektovana, procesuiram...');
            processBufferAndStop();
        } else if (isMobile && isRecognitionActive) {
            // Na mobilnim restartuj ako nema aktivnosti
            stopVoiceRecognition();
            setTimeout(() => startVoiceRecognition(), 1000);
        }
    }, MOBILE_CONFIG.silenceTimeout);
}

// ===== MOBILNI FALLBACK - TEKSTUALNI UNOS =====
function showMobileFallback() {
    hideVoiceMenu();
    
    // Prikaži modal sa opcijama
    const fallbackHTML = `
        <div id="mobileFallbackModal" class="mobile-modal active" style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 9999; padding: 20px;
        ">
            <div style="
                background: #1e1e1e; border-radius: 20px; padding: 30px;
                max-width: 400px; width: 100%; text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            ">
                <div style="font-size: 48px; margin-bottom: 15px;">🎙️</div>
                <h2 style="color: #fff; margin-bottom: 10px;">Glasovni unos nije podržan</h2>
                <p style="color: #aaa; margin-bottom: 20px; font-size: 14px;">
                    Vaš pretraživač ne podržava glasovne komande. 
                    Unesite proizvod ručno:
                </p>
                
                <input type="text" id="fallbackInput" placeholder="Npr. Pileći batak 1 kg 6 meseci" style="
                    width: 100%; padding: 15px; border-radius: 12px;
                    border: 2px solid #333; background: #2a2a2a;
                    color: #fff; font-size: 16px; margin-bottom: 15px;
                    box-sizing: border-box;
                ">
                
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button onclick="processFallbackInput()" style="
                        flex: 1; padding: 14px; border-radius: 12px;
                        background: #4CAF50; border: none; color: #fff;
                        font-size: 16px; font-weight: bold; cursor: pointer;
                        min-width: 100px;
                    ">
                        ✅ Unesi
                    </button>
                    <button onclick="closeFallbackModal()" style="
                        flex: 1; padding: 14px; border-radius: 12px;
                        background: #333; border: none; color: #fff;
                        font-size: 16px; cursor: pointer; min-width: 100px;
                    ">
                        ✖️ Otkaži
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Dodaj modal
    const existingModal = document.getElementById('mobileFallbackModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', fallbackHTML);
    
    // Fokusiraj input
    setTimeout(() => {
        const input = document.getElementById('fallbackInput');
        if (input) {
            input.focus();
            if (isTouchDevice) {
                input.click();
            }
        }
    }, 500);
}

// ===== OBRADA FALLBACK UNOSA =====
function processFallbackInput() {
    const input = document.getElementById('fallbackInput');
    if (input && input.value.trim().length > 2) {
        closeFallbackModal();
        processAndSaveItem(input.value.trim());
    } else {
        showModernAlert('Greška', 'Unesite validan naziv proizvoda.', '⚠️');
    }
}

function closeFallbackModal() {
    const modal = document.getElementById('mobileFallbackModal');
    if (modal) modal.remove();
}

// ===== GREŠKA ZA PERMISIJU MIKROFONA =====
function showMicrophonePermissionError() {
    if (typeof showModernAlert === 'function') {
        showModernAlert(
            'Dozvolite mikrofon', 
            'Da biste koristili glasovne komande, dozvolite pristup mikrofonu u podešavanjima vašeg pretraživača.',
            '🎤'
        );
    } else {
        alert('🎤 Dozvolite pristup mikrofonu da biste koristili glasovne komande.');
    }
}

// ===== PORUKA ZA TIMEOUT =====
function showMobileTimeoutMessage() {
    if (typeof showModernAlert === 'function') {
        showModernAlert(
            '⏰ Pauza', 
            'Sesija je automatski zaustavljena da bi se sačuvala baterija. Pritisnite ponovo za glasovni unos.',
            '🔋'
        );
    }
}

// ===== PROCESS BUFFER =====
function processBufferAndStop() {
    if (activeBuffer && activeBuffer.length > 2) {
        processAndSaveItem(activeBuffer);
        activeBuffer = '';
    }
    stopVoiceRecognition();
}

// ===== MOBILNI STATUS UPDATE =====
function updateVoiceStatus(text, color = '#fff') {
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = text;
        statusEl.style.color = color;
    }
}

// ===== POBOLJŠANO ZAUSTAVLJANJE =====
function stopVoiceRecognition() {
    isRecognitionActive = false;
    
    if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
    }
    
    if (recognition) {
        try {
            recognition.stop();
            recognition = null;
        } catch(e) {}
    }
    
    activeBuffer = '';
    updateVoiceStatus('⏸️ Prepoznavanje zaustavljeno', '#aaa');
}

// ===== MOBILNI DUGMIĆ ZA GLASOVNI UNOS =====
function createMobileVoiceButton() {
    const buttonHTML = `
        <button id="mobileVoiceButton" style="
            position: fixed; bottom: 30px; right: 30px;
            width: 70px; height: 70px; border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none; color: #fff; font-size: 32px;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            cursor: pointer; z-index: 9998;
            display: ${isMobile ? 'flex' : 'none'};
            align-items: center; justify-content: center;
            transition: transform 0.3s, box-shadow 0.3s;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        " 
        onclick="handleMobileVoiceButton()"
        onmousedown="this.style.transform='scale(0.9)'"
        onmouseup="this.style.transform='scale(1)'"
        ontouchstart="this.style.transform='scale(0.9)'"
        ontouchend="this.style.transform='scale(1)'"
        >
            🎤
        </button>
    `;
    
    document.body.insertAdjacentHTML('beforeend', buttonHTML);
}

// ===== HANDLER ZA MOBILNI DUGMIĆ =====
function handleMobileVoiceButton() {
    const button = document.getElementById('mobileVoiceButton');
    
    if (isRecognitionActive) {
        // Ako je aktivno, zaustavi
        stopVoiceRecognition();
        if (button) {
            button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            button.textContent = '🎤';
        }
    } else {
        // Pokreni prepoznavanje
        startVoiceRecognition();
        if (button) {
            button.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
            button.textContent = '⏹️';
            
            // Animacija pulsiranja
            button.style.animation = 'pulse 1.5s ease-in-out infinite';
        }
    }
}

// ===== CSS ANIMACIJE =====
function addMobileStyles() {
    const styles = `
        @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4); }
            50% { transform: scale(1.1); box-shadow: 0 8px 40px rgba(245, 87, 108, 0.6); }
            100% { transform: scale(1); box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4); }
        }
        
        @media (max-width: 768px) {
            .voice-status-container {
                position: fixed;
                bottom: 120px;
                left: 50%;
                transform: translateX(-50%);
                width: 90%;
                background: rgba(0,0,0,0.85);
                border-radius: 16px;
                padding: 15px;
                z-index: 9999;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            .voice-status-text {
                color: #fff;
                text-align: center;
                font-size: 14px;
                margin: 0;
                word-wrap: break-word;
                max-height: 80px;
                overflow-y: auto;
            }
        }
        
        /* Touch optimizacija */
        .touch-optimized {
            cursor: pointer;
            min-height: 44px;
            min-width: 44px;
        }
        
        @media (hover: none) {
            .touch-optimized:hover {
                transform: none !important;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// ===== INICIJALIZACIJA =====
function initMobileVoice() {
    if (isMobile) {
        createMobileVoiceButton();
        addMobileStyles();
        console.log('📱 Mobile voice commands initialized');
        
        // Dodaj touch event listener za celu stranicu
        document.addEventListener('touchstart', function() {
            // Resetuj idle timer ako je potrebno
        }, { passive: true });
        
        // Handle visibility change (app background)
        document.addEventListener('visibilitychange', function() {
            if (document.hidden && isRecognitionActive) {
                stopVoiceRecognition();
                const button = document.getElementById('mobileVoiceButton');
                if (button) {
                    button.textContent = '🎤';
                    button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    button.style.animation = 'none';
                }
            }
        });
    }
}

// ===== EKSPORT =====
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.processAndSaveItem = processAndSaveItem;
window.initMobileVoice = initMobileVoice;
window.showMobileFallback = showMobileFallback;
window.processFallbackInput = processFallbackInput;
window.closeFallbackModal = closeFallbackModal;
window.handleMobileVoiceButton = handleMobileVoiceButton;

// ===== AUTO-INICIJALIZACIJA =====
document.addEventListener('DOMContentLoaded', function() {
    initMobileVoice();
    console.log('✅ Mobile Voice Commands loaded!');
});
