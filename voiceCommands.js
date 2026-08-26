// ============================================
// VOICE COMMANDS - KOMPLETAN SVIH KOMANDI I DIKTATA
// ============================================

(function() {
    'use strict';

    let activeBuffer = '';

    function restartMicrophone() {
        setTimeout(() => {
            if (typeof window.startVoiceRecognition === 'function') {
                try {
                    window.startVoiceRecognition();
                    console.log('🎤 Mikrofon reaktiviran i spreman za diktat');
                } catch (e) {
                    console.warn('Greška pri reaktivaciji mikrofona:', e);
                }
            }
        }, 300);
    }

    // Parsiranje teksta u polja na ekranu
    function fillFormFields(text) {
        let cleanText = text.replace(/\b(start|unos|unesi|dodaj)\b/gi, '').trim();
        if (!cleanText) return;

        console.log('📝 Popunjavam polja sa diktatom:', cleanText);

        const prodInput = document.getElementById('productInput');
        if (prodInput) {
            prodInput.value = cleanText;
            prodInput.dispatchEvent(new Event('input', { bubbles: true }));
            prodInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (typeof window.updateExpiryDate === 'function') {
            try { window.updateExpiryDate(); } catch(e) {}
        }
    }

    // Izvršavanje izlaza
    window.exitVoiceApp = function() {
        console.log('🚪 Izlazak iz aplikacije...');
        if (typeof window.stopVoiceRecognition === 'function') {
            window.stopVoiceRecognition();
        }

        const screensToHide = ['voiceMenuScreen', 'choiceScreen'];
        screensToHide.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) mainScreen.style.display = 'flex';

        if (typeof window.renderCategories === 'function') {
            window.renderCategories();
        }
    };

    // Glavna obrada svih komandi
    function handleVoiceCommand(command) {
        if (!command) return true;
        
        const lowerCmd = command.toLowerCase().trim();
        console.log('🎤 Primljena komanda:', lowerCmd);

        // 1. IZLAZ / EXIT
        if (lowerCmd.includes('exit') || lowerCmd.includes('izlaz') || lowerCmd.includes('kraj')) {
            window.exitVoiceApp();
            return true;
        }

        // 2. UNOS / UNESI / DODAJ / START
        if (lowerCmd.includes('unos') || lowerCmd.includes('unesi') || lowerCmd.includes('start')) {
            console.log('✅ Otvaram unos i spremam polja...');
            
            const voiceMenu = document.getElementById('voiceMenuScreen');
            if (voiceMenu) voiceMenu.style.display = 'none';

            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }

            if (typeof window.renderDataEntry === 'function') {
                window.renderDataEntry('');
            }

            // Ako uz "start" ili "unos" ima još teksta, popuni polja
            fillFormFields(lowerCmd);

            restartMicrophone();
            return true;
        }

        // 3. PLUS (Čuvanje i novi diktat)
        if (lowerCmd.includes('plus')) {
            console.log('➕ Komanda PLUS: Čuvam i nastavljam');
            if (typeof window.saveProduct === 'function') {
                try { window.saveProduct(); } catch(e) {}
            }
            restartMicrophone();
            return true;
        }

        // 4. ZALIHE
        if (lowerCmd.includes('zalihe')) {
            if (typeof window.renderInventory === 'function') {
                window.renderInventory();
            }
            restartMicrophone();
            return true;
        }

        // 5. SPISAK
        if (lowerCmd.includes('spisak')) {
            if (typeof window.renderShoppingList === 'function') {
                window.renderShoppingList();
            }
            restartMicrophone();
            return true;
        }

        // 6. OBIČAN DIKTAT (Ako je ekran za unos otvoren, popuni teksta u polja)
        const dataEntry = document.getElementById('dataEntryScreen');
        if (dataEntry && (dataEntry.style.display !== 'none' || dataEntry.classList.contains('active'))) {
            fillFormFields(lowerCmd);
            restartMicrophone();
            return true;
        }

        return false;
    }

    // Registracija u globalnom okruženju
    window.voiceCommand = handleVoiceCommand;
    window.processVoiceCommand = handleVoiceCommand;
    window.goBack = window.exitVoiceApp;

    console.log('✅ voiceCommands.js spreman za UNOS, START, PLUS, DIKTAT i EXIT!');
})();
