// ============================================
// VOICE COMMANDS - FINAL BRIDGE (v3.0)
// ============================================

(function() {
    'use strict';

    // 1. Zaseban opseg (Sprečava pucanje zbog 'recognition' promenljive)
    let localRecognition = null;
    let activeBuffer = '';
    let isProcessingCommand = false;

    // 2. Otvaranje forme i polja za unos
    function ensureFormVisible() {
        const screensToHide = ['voiceMenuScreen', 'choiceScreen', 'languageScreen', 'loginScreen'];
        screensToHide.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'none';
                el.classList.remove('active');
            }
        });

        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }

        const dataEntry = document.getElementById('dataEntryScreen');
        if (dataEntry) {
            dataEntry.style.display = 'block';
            dataEntry.style.visibility = 'visible';
            dataEntry.style.opacity = '1';
            dataEntry.classList.add('active');
        }
    }

    // 3. Glavni most za script1.js komande
    function handleVoiceCommand(command) {
        if (!command) return true;
        
        const lowerCmd = command.toLowerCase().trim();
        console.log('🎤 Obrada glasovne komande:', lowerCmd);

        // Komanda UNOS / UNESI / DODAJ
        if (lowerCmd.includes('unos') || lowerCmd.includes('unesi') || lowerCmd.includes('dodaj')) {
            console.log('✅ Komanda UNOS prepoznata - otvaram formu');
            ensureFormVisible();
            return true; // Sprečava lažni pop-up alert iz script1.js
        }

        // Komanda ZALIHE
        if (lowerCmd.includes('zalihe')) {
            if (typeof window.renderInventory === 'function') {
                window.renderInventory();
            }
            return true;
        }

        // Komanda SPISAK
        if (lowerCmd.includes('spisak')) {
            if (typeof window.renderShoppingList === 'function') {
                window.renderShoppingList();
            }
            return true;
        }

        return false;
    }

    // 4. Definisanje globalnih funkcija koje script1.js i HTML traže
    window.voiceCommand = handleVoiceCommand;
    
    window.processVoiceCommand = function(cmd) {
        return handleVoiceCommand(cmd);
    };

    // Popravka za dugme Nazad u HTML-u (goBack is not defined)
    window.goBack = function() {
        console.log('⬅ Kliknuto goBack()');
        if (typeof window.goBackFromVoice === 'function') {
            window.goBackFromVoice();
        } else {
            const main = document.getElementById('mainScreen');
            if (main) main.style.display = 'none';
            const choice = document.getElementById('choiceScreen');
            if (choice) choice.style.display = 'flex';
        }
    };

    console.log('✅ voiceCommands.js uspešno učitan i povezan sa script1.js!');
})();
