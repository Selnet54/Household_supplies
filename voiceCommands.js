// ============================================
// VOICE COMMANDS - REŠENJE ZA MIKROFON I EXIT
// ============================================

(function() {
    'use strict';

    // 1. Pomoćna funkcija koja drži mikrofon aktivnim
    function restartMicrophone() {
        setTimeout(() => {
            if (typeof window.startVoiceRecognition === 'function') {
                try {
                    window.startVoiceRecognition();
                    console.log('🎤 Mikrofon ponovo aktiviran za diktat!');
                } catch (e) {
                    console.warn('Greška pri pokretanju mikrofona:', e);
                }
            }
        }, 300);
    }

    // 2. Obrada glasovnih komandi
    function handleVoiceCommand(command) {
        if (!command) return true;
        
        const lowerCmd = command.toLowerCase().trim();
        console.log('🎤 Primljena komanda:', lowerCmd);

        // A) KOMANDA: UNOS / UNESI / DODAJ
        if (lowerCmd.includes('unos') || lowerCmd.includes('unesi') || lowerCmd.includes('dodaj')) {
            console.log('✅ Otvaram unos i aktiviram zvučnik...');
            
            // Sakrij meni
            const voiceMenu = document.getElementById('voiceMenuScreen');
            if (voiceMenu) voiceMenu.style.display = 'none';

            // Prikaz glavnog ekrana
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }

            // Renderuj unos podataka
            if (typeof window.renderDataEntry === 'function') {
                window.renderDataEntry('');
            }

            // REŠENJE: Ponovo pali mikrofon da zvučnik radi!
            restartMicrophone();
            return true;
        }

        // B) KOMANDA: ZALIHE
        if (lowerCmd.includes('zalihe')) {
            if (typeof window.renderInventory === 'function') {
                window.renderInventory();
            }
            restartMicrophone();
            return true;
        }

        // C) KOMANDA: SPISAK
        if (lowerCmd.includes('spisak')) {
            if (typeof window.renderShoppingList === 'function') {
                window.renderShoppingList();
            }
            restartMicrophone();
            return true;
        }

        // D) KOMANDA: EXIT / IZLAZ
        if (lowerCmd.includes('exit') || lowerCmd.includes('izlaz') || lowerCmd.includes('kraj')) {
            window.exitVoiceApp();
            return true;
        }

        return false;
    }

    // 3. FUNKCIJA ZA 4. DUGME (EXIT / IZLAZ IZ APLIKACIJE)
    window.exitVoiceApp = function() {
        console.log('🚪 Izlazak iz aplikacije...');
        
        // Zaustavi mikrofon
        if (typeof window.stopVoiceRecognition === 'function') {
            window.stopVoiceRecognition();
        }

        // Sakrij glasovne menije
        const screensToHide = ['voiceMenuScreen', 'choiceScreen', 'dataEntryScreen'];
        screensToHide.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        // Vrati na početni/glavni ekran
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
        }

        if (typeof window.renderCategories === 'function') {
            window.renderCategories();
        }
    };

    // 4. Povezivanje sa globalnim okruženjem
    window.voiceCommand = handleVoiceCommand;
    window.processVoiceCommand = handleVoiceCommand;

    // Povezivanje dugmeta Nazad i Exit
    window.goBack = window.exitVoiceApp;

    console.log('✅ voiceCommands.js spremno: Mikrofon se automatski reaktivira, EXIT dugme omogućeno!');
})();
