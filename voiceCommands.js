// ============================================
// VOICE COMMANDS - UNIVERSAL MULTI-LANG v5.1
// Podrška za 10 jezika + automatska detekcija
// ============================================

(function() {
    'use strict';

    let activeBuffer = ''; 
    let recognition = null;
    let isProcessingCommand = false;

    // Mapiranje 10 jezika aplikacije na Speech Recognition kodove
    const LANG_MAP = {
        'sr': 'sr-RS',
        'en': 'en-US',
        'de': 'de-DE',
        'hu': 'hu-HU',
        'fr': 'fr-FR',
        'es': 'es-ES',
        'it': 'it-IT',
        'ru': 'ru-RU',
        'ro': 'ro-RO',
        'sk': 'sk-SK'
    };

    // Višejezični rečnik za okidače komandi
    const COMMAND_KEYWORDS = {
        ENTRY: ['unos', 'unesi', 'dodaj', 'start', 'unus', 'unest', 'novi', 'add', 'entry', 'input', 'neue', 'eingabe', 'data'],
        EXIT: ['izlaz', 'kraj', 'exit', 'end', 'close', 'ende', 'ausgang', 'nazad', 'back'],
        PLUS: ['plus', 'weiter', 'next', 'sledec', 'sledeće']
    };

    function getCurrentLanguageCode() {
        let appLang = 'sr';
        
        // Funkcija `getCurrentLang` iz script1.js ima prioritet ako postoji
        if (typeof window.getCurrentLang === 'function') {
            appLang = window.getCurrentLang() || 'sr';
        } else if (typeof window.currentLang !== 'undefined' && window.currentLang) {
            appLang = window.currentLang;
        } else if (typeof currentLang !== 'undefined' && currentLang) {
            appLang = currentLang;
        }
        
        return LANG_MAP[appLang] || 'sr-RS';
    }

    function hideVoiceMenu() {
        const screens = ['voiceMenuScreen', 'choiceScreen'];
        screens.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'none';
                el.classList.remove('active');
            }
        });
    }

    function showVoiceStatus(text, color) {
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = text;
            if (color) statusEl.style.color = color;
        }
        console.log('[VOICE MULTI-LANG]', text);
    }

    // Povratak / Navigacija
    window.goBack = function() {
        console.log('◀ goBack pozvan');
        if (typeof window.stopVoiceRecognition === 'function') {
            window.stopVoiceRecognition();
        }

        document.querySelectorAll('.screen').forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });

        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }
    };
    window.goBackFromVoice = window.goBack;

    function openDataEntryScreen() {
        console.log('🚀 Otvaram ekran za unos...');
        hideVoiceMenu();

        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }

        const dataEntry = document.getElementById('dataEntryScreen');
        if (dataEntry) {
            dataEntry.style.display = 'block';
            dataEntry.classList.add('active');
        }

        if (typeof window.renderDataEntry === 'function') {
            try { window.renderDataEntry(''); } catch(e) {}
        }
    }

    // EXPLICIT HANDLER KOJI JE NEDOSTAJAO ZA INLINE ONCLICK DOGAĐAJE
    window.voiceCommand = function(cmd) {
        console.log('🖱️ Ručno pozvana voiceCommand sa komandom:', cmd);
        if (!cmd) return;
        
        const commandLower = String(cmd).toLowerCase().trim();

        if (COMMAND_KEYWORDS.ENTRY.some(k => commandLower.includes(k))) {
            openDataEntryScreen();
        } else if (COMMAND_KEYWORDS.EXIT.some(k => commandLower.includes(k))) {
            window.goBack();
        } else {
            console.warn('⚠️ Nepoznata inline glasovna komanda:', cmd);
        }
    };

    // Engine glasovnog prepoznavanja
    function startVoiceRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            showVoiceStatus('❌ Browser ne podržava glasovno prepoznavanje.', '#f44336');
            return;
        }

        if (recognition) {
            try { recognition.stop(); } catch(e) {}
            recognition = null;
        }

        recognition = new SpeechRecognition();
        
        // Dinamički preuzima trenutno izabrani jezik aplikacije
        const targetLang = getCurrentLanguageCode();
        recognition.lang = targetLang;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        console.log(`🎤 Pokrećem glasovno prepoznavanje na jeziku: ${targetLang}`);

        recognition.onstart = function() {
            showVoiceStatus(`🎤 Slušam [${targetLang}]... Recite komandu ili artikal`, '#2196F3');
            activeBuffer = '';
            isProcessingCommand = false;
        };

        recognition.onresult = function(event) {
            let interimText = '';
            let finalChunk = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript.trim();
                if (event.results[i].isFinal) finalChunk += (finalChunk ? ' ' : '') + transcript;
                else interimText += transcript;
            }

            if (finalChunk) activeBuffer += (activeBuffer ? ' ' : '') + finalChunk;
            const currentText = activeBuffer + (interimText ? ' ' + interimText : '');
            showVoiceStatus(`🎤 [${targetLang}]: "${currentText}"`, '#FFD700');

            if (isProcessingCommand) return;
            const lower = currentText.toLowerCase().trim();

            // 1. Provera komande za UNOS / OTVARANJE FORME
            if (COMMAND_KEYWORDS.ENTRY.some(k => lower.includes(k))) {
                console.log('✅ Detektovana komanda UNOS!');
                isProcessingCommand = true;
                openDataEntryScreen();

                activeBuffer = '';
                setTimeout(() => {
                    isProcessingCommand = false;
                    showVoiceStatus('🎤 Ekran otvoren! Diktirajte artikal...', '#4CAF50');
                }, 500);
                return;
            }

            // 2. Provera komande za IZLAZ
            if (COMMAND_KEYWORDS.EXIT.some(k => lower.includes(k))) {
                console.log('🚪 Detektovana komanda IZLAZ!');
                isProcessingCommand = true;
                window.goBack();
                return;
            }
        };

        recognition.onerror = function(event) {
            console.error('⚠️ Greška mikrofona:', event.error);
            isProcessingCommand = false;
        };

        recognition.onend = function() {
            console.log('🎤 Prepoznavanje pauzirano.');
            isProcessingCommand = false;
        };

        try { 
            recognition.start(); 
        } catch(e) { 
            console.error('❌ Greška pri pokretanju:', e); 
        }
    }

    function stopVoiceRecognition() {
        if (recognition) {
            try { recognition.stop(); } catch(e) {}
            recognition = null;
        }
        activeBuffer = '';
        isProcessingCommand = false;
        showVoiceStatus('⏸️ Prepoznavanje zaustavljeno', '#aaa');
    }

    // Export u globalno okruženje
    window.startVoiceRecognition = startVoiceRecognition;
    window.stopVoiceRecognition = stopVoiceRecognition;
    window.restartMicrophone = function() {
        stopVoiceRecognition();
        setTimeout(startVoiceRecognition, 300);
    };

    console.log('✅ voiceCommands.js v5.1 (Multi-Lang Engine) uspešno učitan sa voiceCommand rešenjem!');
})();
