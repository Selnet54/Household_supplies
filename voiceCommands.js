// ============================================================
// GLASOVNI MODUL - JEDINSTVENI SINKRONIZOVANI SISTEM
// Integrisan sa localStorage['zalihe']
// ============================================================

(() => {
    'use strict';

    // --------------------------------------------------------
    // STATE & CONFIGURATION
    // --------------------------------------------------------
    let recognition = null;
    let activeBuffer = '';
    let restartTimer = null;
    let isUserStopped = false;
    let isProcessing = false;
    let isRecognitionStarting = false;

    const SPEECH_LANGUAGES = {
        sr: 'sr-RS',
        en: 'en-US',
        de: 'de-DE',
        hu: 'hu-HU',
        uk: 'uk-UA',
        ru: 'ru-RU',
        zh: 'zh-CN',
        es: 'es-ES',
        pt: 'pt-PT',
        fr: 'fr-FR'
    };

    const DATA_ENTRY_KEYWORDS = ['unos', 'unesi', 'dodaj', 'novi', 'add', 'start'];
    const END_WORDS = ['end', 'enter', 'kraj', 'završi', 'zavrsi'];

    const UNIT_MAP = {
        kilogram: 'kg', kilograma: 'kg', kilograme: 'kg', kg: 'kg',
        gram: 'g', grama: 'g', grame: 'g', g: 'g',
        litar: 'l', litara: 'l', litre: 'l', l: 'l',
        mililitar: 'ml', mililitara: 'ml', ml: 'ml',
        komad: 'kom', komada: 'kom', kom: 'kom',
        paket: 'pak', paketa: 'pak', pak: 'pak'
    };

    const STORAGE_MAP = {
        'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
        'frižider': 'Frižider', 'frizider': 'Frižider',
        'ostava': 'Ostava', 'špajz': 'Ostava', 'spajz': 'Ostava',
        'soba': 'Soba', 'podrum': 'Podrum'
    };

    const NUMBER_WORDS = {
        jedan: 1, jedna: 1, jedno: 1,
        dva: 2, dve: 2,
        tri: 3, četiri: 4, cetiri: 4,
        pet: 5, šest: 6, sest: 6,
        sedam: 7, osam: 8, devet: 9, deset: 10,
        jedanaest: 11, dvanaest: 12, trinaest: 13, četrnaest: 14, cetrnaest: 14,
        petnaest: 15, šesnaest: 16, sesnaest: 16, sedamnaest: 17, osamnaest: 18,
        devetnaest: 19, dvadeset: 20
    };

    // --------------------------------------------------------
    // UTILITIES & SINGLE SOURCE OF TRUTH FOR LANG
    // --------------------------------------------------------
    function normalizeText(text) {
        return String(text || '')
            .toLowerCase()
            .replace(/[.,!?;:]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function getSpeechLanguage() {
        const lang = localStorage.getItem('appLanguage') || window.currentLang || 'sr';
        return SPEECH_LANGUAGES[lang] || 'sr-RS';
    }

    function getNumber(word) {
        const normalized = normalizeText(word);
        if (/^\d+(?:[.,]\d+)?$/.test(normalized)) {
            return parseFloat(normalized.replace(',', '.'));
        }
        if (Object.prototype.hasOwnProperty.call(NUMBER_WORDS, normalized)) {
            return NUMBER_WORDS[normalized];
        }
        return null;
    }

    function isNumber(word) {
        return getNumber(word) !== null;
    }

    function updateVoiceStatus(text, color) {
        const el = document.getElementById('voiceStatus');
        if (!el) return;
        el.textContent = text;
        if (color) el.style.color = color;
    }

    // --------------------------------------------------------
    // STRICT PARSER (Dodeljuje: 1 -> piece, 2 -> quantity, 6 -> shelf_life)
    // --------------------------------------------------------
    function parseVoiceDataEntry(command) {
        let text = normalizeText(command);
        
        // Očisti uvodne reči
        text = text.replace(/^(start|unos|dodaj|unesi)\s+/i, '').trim();

        const words = text.split(/\s+/).filter(Boolean);
        const result = {
            product_name: '',
            piece: '1',
            quantity: '1',
            unit: 'kom',
            shelf_life_months: '12',
            storage_location: 'Zamrzivač 1'
        };

        if (!words.length) return result;

        const nameWords = [];
        const foundNumbers = [];
        let unitFound = null;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];

            // 1. Storage check
            if (STORAGE_MAP[word]) {
                result.storage_location = STORAGE_MAP[word];
                continue;
            }

            // 2. Unit check
            if (UNIT_MAP[word]) {
                unitFound = UNIT_MAP[word];
                continue;
            }

            // 3. Number check
            if (isNumber(word)) {
                foundNumbers.push(getNumber(word));
                continue;
            }

            // Ignorišemo pomoćne reči pri slaganju naziva
            if (['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci'].includes(word)) {
                continue;
            }

            nameWords.push(word);
        }

        // Dodeljivanje tačnih vrednosti na osnovu sekvence brojeva
        if (foundNumbers.length > 0) {
            result.piece = String(foundNumbers[0]); // Prvi broj -> piece
        }
        if (foundNumbers.length > 1) {
            result.quantity = String(foundNumbers[1]); // Drugi broj -> quantity
        }
        if (foundNumbers.length > 2) {
            result.shelf_life_months = String(foundNumbers[2]); // Treći broj -> shelf_life
        }

        if (unitFound) {
            result.unit = unitFound;
        }

        result.product_name = nameWords.join(' ').trim();
        return result;
    }

    // --------------------------------------------------------
    // STORAGE & FORM DIRECT INTERACTION
    // --------------------------------------------------------
    function saveProductDirectlyToStorage(data) {
        try {
            const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
            
            const newEntry = {
                id: Date.now() + Math.random().toString(36).slice(2, 7),
                product_name: data.product_name,
                description: '',
                piece: parseInt(data.piece, 10) || 1,
                quantity: parseFloat(String(data.quantity).replace(',', '.')) || 1,
                unit: data.unit || 'kom',
                entry_date: new Date().toISOString().split('T')[0],
                shelf_life_months: parseInt(data.shelf_life_months, 10) || 12,
                storage_location: data.storage_location || 'Zamrzivač 1'
            };

            zalihe.push(newEntry);
            localStorage.setItem('zalihe', JSON.stringify(zalihe));

            if (typeof renderInventory === 'function') {
                renderInventory();
            }
            return true;
        } catch (e) {
            console.error('Greška pri čuvanju u zalihe:', e);
            return false;
        }
    }

    function saveVoiceItem(command) {
        return new Promise(resolve => {
            const data = parseVoiceDataEntry(command);

            if (!data.product_name || data.product_name.length < 2) {
                updateVoiceStatus('❌ Nije prepoznat naziv proizvoda.', '#F44336');
                resolve(false);
                return;
            }

            // Sinhrono otvaranje forme
            openDataEntryScreen();

            // Korišćenje requestAnimationFrame umesto setTimeout(100/150)
            requestAnimationFrame(() => {
                popuniFormuPodacima(data);
                const saved = saveProductDirectlyToStorage(data);

                updateVoiceStatus(
                    saved ? `✅ Upisano: ${data.product_name}` : `❌ Greška pri upisu: ${data.product_name}`,
                    saved ? '#4CAF50' : '#F44336'
                );

                resolve(saved);
            });
        });
    }

    // --------------------------------------------------------
    // UI CONTROL
    // --------------------------------------------------------
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

    function openDataEntryScreen() {
        hideVoiceMenu();
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
        }

        if (typeof renderDataEntry === 'function') {
            try {
                renderDataEntry(''); // Sinhrono popunjava DOM izbegavajući potebu za timere-ima
            } catch (error) {
                console.error('Greška u renderDataEntry:', error);
            }
        }
    }

    function popuniFormuPodacima(data) {
        const setValue = (id, value) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        };

        setValue('productInput', data.product_name);
        setValue('pieceInput', data.piece);
        setValue('quantityInput', data.quantity);
        setValue('shelfLifeInput', data.shelf_life_months);
        setValue('unitSelect', data.unit);
        setValue('storageSelect', data.storage_location);

        if (typeof updateExpiryDate === 'function') {
            try { updateExpiryDate(); } catch (e) {}
        }
    }

    function otvoriZaliheEkran() {
        if (typeof showScreen === 'function') {
            showScreen('inventoryScreen');
            return;
        }
        const inventoryScreen = document.getElementById('inventoryScreen');
        const mainScreen = document.getElementById('mainScreen');
        if (inventoryScreen) {
            if (mainScreen) mainScreen.style.display = 'none';
            inventoryScreen.style.display = 'flex';
            inventoryScreen.classList.add('active');
        }
    }

    // --------------------------------------------------------
    // SPEECH RECOGNITION ENGINE
    // --------------------------------------------------------
    function startVoiceRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            updateVoiceStatus('❌ Glasovni unos nije podržan u ovom pregledaču.', '#F44336');
            return;
        }

        clearTimeout(restartTimer);
        isUserStopped = false;

        if (recognition) {
            try { recognition.abort(); } catch (e) {}
            recognition = null;
        }

        recognition = new SpeechRecognition();
        recognition.lang = getSpeechLanguage();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            isRecognitionStarting = false;
            updateVoiceStatus('🎤 Slušam... Recite unos ili komandu.', '#2196F3');
        };

        recognition.onresult = (event) => {
            if (isProcessing) return;

            let finalText = '';
            let interimText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (!result || !result[0]) continue;

                const transcript = result[0].transcript.trim();
                if (result.isFinal) {
                    finalText += (finalText ? ' ' : '') + transcript;
                } else {
                    interimText += (interimText ? ' ' : '') + transcript;
                }
            }

            if (finalText) {
                activeBuffer = activeBuffer ? `${activeBuffer} ${finalText}` : finalText;
                processVoiceBuffer();
            }

            const displayText = `${activeBuffer}${interimText ? ' ' + interimText : ''}`.trim();
            if (displayText) {
                updateVoiceStatus(`🎤 Slušam: "${displayText}"`, '#FFD700');
            }
        };

        recognition.onerror = (event) => {
            if (['no-speech', 'aborted'].includes(event.error)) return;
            if (event.error === 'not-allowed') {
                isUserStopped = true;
                updateVoiceStatus('❌ Mikrofon nije dozvoljen.', '#F44336');
            }
        };

        recognition.onend = () => {
            isRecognitionStarting = false;
            if (isUserStopped) return;

            clearTimeout(restartTimer);
            restartTimer = setTimeout(() => {
                if (isUserStopped || !recognition || isRecognitionStarting) return;
                try {
                    isRecognitionStarting = true;
                    recognition.start();
                } catch (e) {
                    isRecognitionStarting = false;
                }
            }, 700);
        };

        try {
            isRecognitionStarting = true;
            recognition.start();
        } catch (e) {
            isRecognitionStarting = false;
        }
    }

    function stopVoiceRecognition() {
        isUserStopped = true;
        isProcessing = false;
        clearTimeout(restartTimer);

        if (recognition) {
            try { recognition.stop(); } catch (e) {}
            try { recognition.abort(); } catch (e) {}
            recognition = null;
        }
        activeBuffer = '';
    }

    function processVoiceBuffer() {
        if (!activeBuffer || isProcessing) return;

        const normalized = normalizeText(activeBuffer);

        if (DATA_ENTRY_KEYWORDS.some(k => normalized.includes(k))) {
            openDataEntryScreen();
        }

        const separatorRegex = /\b(plus|end|enter|kraj|završi|zavrsi)\b/i;
        const match = activeBuffer.match(separatorRegex);

        if (!match) return;

        const separatorIndex = match.index;
        const itemText = activeBuffer.substring(0, separatorIndex).trim();
        const command = match[0].toLowerCase();
        const remainingText = activeBuffer.substring(separatorIndex + match[0].length).trim();
        const isEnd = END_WORDS.includes(command);

        if (itemText.length > 2) {
            isProcessing = true;

            saveVoiceItem(itemText).finally(() => {
                isProcessing = false;

                if (isEnd) {
                    activeBuffer = '';
                    stopVoiceRecognition();
                    otvoriZaliheEkran();
                    return;
                }

                activeBuffer = remainingText;
                if (activeBuffer) processVoiceBuffer();
            });
            return;
        }

        activeBuffer = remainingText;
        if (isEnd) {
            activeBuffer = '';
            stopVoiceRecognition();
            otvoriZaliheEkran();
        }
    }

    // --------------------------------------------------------
    // PUBLIC API (Single Entry Point)
    // --------------------------------------------------------
    window.startVoiceRecognition = startVoiceRecognition;
    window.stopVoiceRecognition = stopVoiceRecognition;
    window.parseVoiceDataEntry = parseVoiceDataEntry;
    
    // Objedinjena funkcija umesto dve konfliktne:
    window.processVoiceCommand = function(command) {
        if (!command) return;
        const text = normalizeText(command);
        if (!text) return;

        if (DATA_ENTRY_KEYWORDS.some(k => text.startsWith(k))) {
            openDataEntryScreen();
            const data = parseVoiceDataEntry(text);
            if (data.product_name) {
                popuniFormuPodacima(data);
            }
            return;
        }
        return saveVoiceItem(command);
    };

    window.processAndSaveItem = saveVoiceItem;
})();
