// ============================================
// VOICE COMMANDS - INTEGRACIJA SA SCRIPT1.JS
// ============================================

(function() {
    'use strict';

    function handleVoiceCommand(command) {
        if (!command) return true;
        
        const lowerCmd = command.toLowerCase().trim();
        console.log('🎤 Glasovna komanda primljena:', lowerCmd);

        // 1. KOMANDA: UNOS / UNESI / DODAJ
        if (lowerCmd.includes('unos') || lowerCmd.includes('unesi') || lowerCmd.includes('dodaj')) {
            console.log('✅ Otvaram ekran za unos preko sistemske funkcije');
            
            // Sakrivanje menija glasovnih komandi
            if (typeof window.hideVoiceMenu === 'function') {
                window.hideVoiceMenu();
            } else {
                const voiceMenu = document.getElementById('voiceMenuScreen');
                if (voiceMenu) voiceMenu.style.display = 'none';
            }

            // Prikaz glavnog ekrana
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }

            // Pozivanje sistemskog renderovanja unosa iz script1.js
            if (typeof window.renderDataEntry === 'function') {
                window.renderDataEntry('');
            } else {
                const dataEntry = document.getElementById('dataEntryScreen');
                if (dataEntry) dataEntry.style.display = 'block';
            }

            return true; // Blokira lažni alert
        }

        // 2. KOMANDA: ZALIHE
        if (lowerCmd.includes('zalihe')) {
            if (typeof window.renderInventory === 'function') {
                window.renderInventory();
            }
            return true;
        }

        // 3. KOMANDA: SPISAK
        if (lowerCmd.includes('spisak')) {
            if (typeof window.renderShoppingList === 'function') {
                window.renderShoppingList();
            }
            return true;
        }

        return false;
    }

    // Povezivanje sa script1.js okruženjem
    window.voiceCommand = handleVoiceCommand;
    window.processVoiceCommand = handleVoiceCommand;

    // Popravka za dugme Nazad u HTML-u
    window.goBack = function() {
        if (typeof window.goBackFromVoice === 'function') {
            window.goBackFromVoice();
        } else if (typeof window.renderCategories === 'function') {
            window.renderCategories();
        }
    };

    console.log('✅ voiceCommands.js uspešno povezan sa renderDataEntry!');
})();
