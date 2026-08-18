// ============================================================
// VOICE DATA ENTRY - SA MIKROFONOM NA SVIH EKRANIMA
// ============================================================

(function () {
    'use strict';

    let recognition = null;
    let voiceBuffer = '';
    let isProcessingVoiceItem = false;
    let isDataEntryOpen = false;
    let isVoiceActive = false;

    // ---------------------------------------------------------
    // POMOĆNE FUNKCIJE
    // ---------------------------------------------------------

    function el(id) {
        return document.getElementById(id);
    }

    function setValue(id, value) {
        const element = el(id);
        if (!element) return false;

        element.value = value == null ? '' : String(value);

        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));

        return true;
    }

    function normalizeText(text) {
        return String(text || '')
            .toLowerCase()
            .replace(/[.,!?;:]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function showVoiceStatus(text, color) {
        // Pokušaj na svim mogućim mestima
        const statuses = [
            el('voiceStatus'),
            el('voiceStatusDataEntry'),
            document.querySelector('.voice-status'),
            document.querySelector('#voiceStatus')
        ];

        for (const status of statuses) {
            if (status) {
                status.textContent = text;
                if (color) status.style.color = color;
            }
        }

        console.log('[VOICE]', text);
    }

    // ---------------------------------------------------------
    // SAKRIVANJE VOICE MENIJA
    // ---------------------------------------------------------

    function hideVoiceMenu() {
        const voiceMenu = el('voiceMenuScreen');

        if (voiceMenu) {
            voiceMenu.style.display = 'none';
            voiceMenu.classList.remove('active');
        }

        const choiceScreen = el('choiceScreen');

        if (choiceScreen) {
            choiceScreen.style.display = 'none';
            choiceScreen.classList.remove('active');
        }
    }

    // ---------------------------------------------------------
    // BROJEVI NA SRPSKOM
    // ---------------------------------------------------------

    const NUMBER_WORDS = {
        'nula': '0',
        'jedan': '1',
        'jedna': '1',
        'jedno': '1',
        'dva': '2',
        'dve': '2',
        'tri': '3',
        'četiri': '4',
        'cetiri': '4',
        'pet': '5',
        'šest': '6',
        'sest': '6',
        'sedam': '7',
        'osam': '8',
        'devet': '9',
        'deset': '10',
        'jedanaest': '11',
        'dvanaest': '12',
        'trinaest': '13',
        'četrnaest': '14',
        'cetrnaest': '14',
        'petnaest': '15',
        'šesnaest': '16',
        'sesnaest': '16',
        'sedamnaest': '17',
        'osamnaest': '18',
        'devetnaest': '19',
        'dvadeset': '20',
        'trideset': '30',
        'četrdeset': '40',
        'cetrdeset': '40',
        'pedeset': '50',
        'šezdeset': '60',
        'sezdeset': '60',
        'sedamdeset': '70',
        'osamdeset': '80',
        'devedeset': '90',
        'sto': '100'
    };

    function getNumber(word) {
        const w = normalizeText(word);

        if (NUMBER_WORDS[w] !== undefined) {
            return NUMBER_WORDS[w];
        }

        if (/^\d+(?:[.,]\d+)?$/.test(w)) {
            return w.replace(',', '.');
        }

        return null;
    }

    // ---------------------------------------------------------
    // JEDINICE
    // ---------------------------------------------------------

    const UNITS = {
        'kilogram': 'kg',
        'kilograma': 'kg',
        'kilograme': 'kg',
        'kila': 'kg',
        'kilo': 'kg',
        'kg': 'kg',
        'gram': 'g',
        'grama': 'g',
        'grame': 'g',
        'g': 'g',
        'litar': 'l',
        'litra': 'l',
        'litara': 'l',
        'l': 'l',
        'mililitar': 'ml',
        'mililitara': 'ml',
        'ml': 'ml',
        'komad': 'kom',
        'komada': 'kom',
        'kom': 'kom',
        'paket': 'pak',
        'paketa': 'pak',
        'pak': 'pak'
    };

    function getUnit(word) {
        return UNITS[normalizeText(word)] || null;
    }

    // ---------------------------------------------------------
    // SKLADIŠTE / ZAMRZIVAČ
    // ---------------------------------------------------------

    function getStorage(text, index) {

        const words = text.split(/\s+/);

        const current = normalizeText(words[index] || '');
        const next = normalizeText(words[index + 1] || '');

        if (current === 'zamrzivac' || current === 'zamrzivač') {
            if (next) {
                const n = getNumber(next);
                if (n) {
                    return {
                        storage: 'Zamrzivač ' + n,
                        consumed: 2
                    };
                }
            }
            return {
                storage: 'Zamrzivač 1',
                consumed: 1
            };
        }

        if (current === 'frizider' || current === 'frižider') {
            return {
                storage: 'Frižider',
                consumed: 1
            };
        }

        if (current === 'ostava' || current === 'spajz' || current === 'špajz') {
            return {
                storage: 'Ostava',
                consumed: 1
            };
        }

        return null;
    }

    // ---------------------------------------------------------
    // PARSIRANJE GLASOVNOG UNOSA
    // ---------------------------------------------------------

    function parseVoiceDataEntry(command) {

        let text = String(command || '')
            .replace(/^start\s+/i, '')
            .replace(/^start$/i, '')
            .trim();

        if (!text) {
            return null;
        }

        const words = text.split(/\s+/).filter(Boolean);

        const result = {
            product_name: '',
            piece: '1',
            quantity: '1',
            unit: 'kom',
            shelf_life: '12',
            storage: 'Zamrzivač 1'
        };

        const nameWords = [];
        let quantityFound = false;
        let i = 0;

        while (i < words.length) {

            const word = normalizeText(words[i]);

            const storageResult = getStorage(text, i);
            if (storageResult) {
                result.storage = storageResult.storage;
                i += storageResult.consumed;
                continue;
            }

            const unit = getUnit(word);
            if (unit) {
                result.unit = unit;
                i++;
                continue;
            }

            const number = getNumber(word);
            if (number !== null) {
                if (!quantityFound) {
                    result.quantity = number;
                    result.piece = number;
                    quantityFound = true;
                    i++;
                    continue;
                }
                if (!result.shelf_life || result.shelf_life === '12') {
                    result.shelf_life = number;
                    i++;
                    continue;
                }
                i++;
                continue;
            }

            if (word === 'mesec' || word === 'meseca' || word === 'meseci' || word === 'mesecima') {
                i++;
                continue;
            }

            if (word === 'u' || word === 'za' || word === 'rok' || word === 'trajanje' || word === 'na') {
                i++;
                continue;
            }

            if (!quantityFound) {
                nameWords.push(words[i]);
            }

            i++;
        }

        result.product_name = nameWords.join(' ').trim();

        if (!result.product_name) {
            result.product_name = 'Proizvod';
        }

        console.log('VOICE PARSED DATA:', result);

        return result;
    }

    // ---------------------------------------------------------
    // POPUNJAVANJE DATA ENTRY FORME
    // ---------------------------------------------------------

    function fillDataEntryForm(data) {

        if (!data) return false;

        console.log('Popunjavam Data Entry:', data);

        setValue('productInput', data.product_name);
        setValue('pieceInput', data.piece);
        setValue('quantityInput', data.quantity);
        setValue('shelfLifeInput', data.shelf_life);

        const unitSelect = el('unitSelect');
        if (unitSelect) {
            for (const option of unitSelect.options) {
                if (normalizeText(option.value) === normalizeText(data.unit) ||
                    normalizeText(option.textContent) === normalizeText(data.unit)) {
                    unitSelect.value = option.value;
                    unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }

        const storageSelect = el('storageSelect');
        if (storageSelect) {
            const wanted = normalizeText(data.storage);
            for (const option of storageSelect.options) {
                const optionValue = normalizeText(option.value);
                const optionText = normalizeText(option.textContent);
                if (optionValue === wanted || optionText === wanted ||
                    optionText.includes(wanted) || wanted.includes(optionText)) {
                    storageSelect.value = option.value;
                    storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }

        if (typeof window.updateExpiryDate === 'function') {
            try {
                window.updateExpiryDate();
            } catch (error) {
                console.warn('updateExpiryDate greška:', error);
            }
        }

        return true;
    }

    // ---------------------------------------------------------
    // DODAJ DUGME ZA MIKROFON NA DATA ENTRY
    // ---------------------------------------------------------

    function addMicrophoneButtonToDataEntry() {
        // Proveri da li već postoji
        if (document.querySelector('#voiceMicButton')) {
            return;
        }

        // Nađi gde da ubacimo dugme
        const targetContainer = document.querySelector(
            '#mainScreen .form-actions, ' +
            '#mainScreen .button-group, ' +
            '#mainScreen form > div:last-child, ' +
            '.data-entry-actions'
        );

        if (!targetContainer) {
            console.warn('Nije pronađen kontejner za dugme mikrofona');
            return;
        }

        // Kreiraj dugme
        const micButton = document.createElement('button');
        micButton.id = 'voiceMicButton';
        micButton.type = 'button';
        micButton.className = 'voice-mic-button';
        micButton.style.cssText = `
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 24px;
            cursor: pointer;
            margin: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: all 0.3s;
        `;
        micButton.textContent = '🎤';
        micButton.title = 'Pokreni glasovni unos';

        // Dodaj status pored dugmeta
        const statusDiv = document.createElement('div');
        statusDiv.id = 'voiceStatusDataEntry';
        statusDiv.style.cssText = `
            margin: 5px;
            padding: 5px;
            font-size: 14px;
            color: #666;
            display: inline-block;
        `;
        statusDiv.textContent = '🎤 Klikni za glasovni unos';

        // Ubaci dugme i status
        targetContainer.appendChild(micButton);
        targetContainer.appendChild(statusDiv);

        // Event za klik
        micButton.addEventListener('click', function() {
            if (isVoiceActive) {
                stopVoiceRecognition();
                micButton.textContent = '🎤';
                micButton.style.background = '#4CAF50';
                statusDiv.textContent = '⏸️ Zaustavljeno';
                statusDiv.style.color = '#f44336';
            } else {
                startVoiceRecognition();
                micButton.textContent = '🔴';
                micButton.style.background = '#f44336';
                statusDiv.textContent = '🎤 Slušam...';
                statusDiv.style.color = '#4CAF50';
            }
        });

        console.log('✅ Dugme za mikrofon dodato na Data Entry');
    }

    // ---------------------------------------------------------
    // OTVARANJE DATA ENTRY EKRANA
    // ---------------------------------------------------------

    function openDataEntry() {

        console.log('🔥 Otvaram Data Entry ekran...');

        hideVoiceMenu();

        // 1. Pokušaj preko mainScreen
        const mainScreen = el('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
            console.log('✅ mainScreen otvoren');
        }

        // 2. Pokušaj preko showScreen
        if (typeof window.showScreen === 'function') {
            try {
                window.showScreen('mainScreen');
                console.log('✅ showScreen pozvan');
            } catch (error) {
                console.warn('showScreen greška:', error);
            }
        }

        // 3. Pokušaj preko openDataEntry
        if (typeof window.openDataEntry === 'function') {
            try {
                window.openDataEntry();
                console.log('✅ openDataEntry pozvan');
            } catch (error) {
                console.warn('openDataEntry greška:', error);
            }
        }

        // 4. Klik na dugme
        const dataEntryBtn = document.querySelector(
            '[data-screen="mainScreen"], ' +
            '.open-data-entry, ' +
            '#openDataEntryBtn, ' +
            'button[onclick*="dataEntry"], ' +
            'button[onclick*="mainScreen"]'
        );

        if (dataEntryBtn) {
            try {
                dataEntryBtn.click();
                console.log('✅ Kliknuo na dugme za unos');
            } catch (error) {
                console.warn('Klik greška:', error);
            }
        }

        isDataEntryOpen = true;

        // Dodaj dugme za mikrofon
        setTimeout(addMicrophoneButtonToDataEntry, 300);

        // Automatski pokreni mikrofon
        setTimeout(function() {
            if (!isVoiceActive) {
                startVoiceRecognition();
                // Ažuriraj dugme ako postoji
                const micButton = document.querySelector('#voiceMicButton');
                if (micButton) {
                    micButton.textContent = '🔴';
                    micButton.style.background = '#f44336';
                }
                const statusDiv = document.querySelector('#voiceStatusDataEntry');
                if (statusDiv) {
                    statusDiv.textContent = '🎤 Slušam...';
                    statusDiv.style.color = '#4CAF50';
                }
            }
        }, 500);

        showVoiceStatus(
            '📝 Ekran za unos otvoren. Mikrofon aktivan. Recite "start" za novi unos.',
            '#4CAF50'
        );
    }

    // ---------------------------------------------------------
    // ČUVANJE PODATAKA
    // ---------------------------------------------------------

    async function saveVoiceData(data) {

        if (!data) return false;

        console.log('ČUVAM GLASOVNI UNOS:', data);

        if (typeof window.saveProduct === 'function') {
            try {
                const result = await window.saveProduct();
                console.log('saveProduct rezultat:', result);
                return true;
            } catch (error) {
                console.error('saveProduct greška:', error);
                return false;
            }
        }

        if (typeof window.handleFormSubmit === 'function') {
            try {
                const result = await window.handleFormSubmit();
                console.log('handleFormSubmit rezultat:', result);
                return true;
            } catch (error) {
                console.error('handleFormSubmit greška:', error);
                return false;
            }
        }

        if (typeof window.addProduct === 'function') {
            try {
                const result = await window.addProduct();
                console.log('addProduct rezultat:', result);
                return true;
            } catch (error) {
                console.error('addProduct greška:', error);
                return false;
            }
        }

        const form = document.querySelector('#mainScreen form, #dataEntryForm, form');
        if (form) {
            try {
                if (typeof form.requestSubmit === 'function') {
                    form.requestSubmit();
                } else {
                    form.submit();
                }
                return true;
            } catch (error) {
                console.error('Submit forme greška:', error);
            }
        }

        console.error('Nije pronađena funkcija za čuvanje podataka.');
        return false;
    }

    // ---------------------------------------------------------
    // OSVEŽAVANJE PREGLEDA I ZALIHA
    // ---------------------------------------------------------

    function refreshApplicationScreens() {

        console.log('Osvežavam Pregled unosa i Zalihe...');

        const refreshFunctions = [
            'renderEntries',
            'renderProducts',
            'renderProductList',
            'renderInventory',
            'loadInventory',
            'refreshInventory',
            'refreshProducts',
            'updateInventory',
            'loadProducts'
        ];

        refreshFunctions.forEach(function (functionName) {
            if (typeof window[functionName] === 'function') {
                try {
                    window[functionName]();
                    console.log('Pozvana:', functionName);
                } catch (error) {
                    console.warn(functionName + ' greška:', error);
                }
            }
        });
    }

    // ---------------------------------------------------------
    // OTVARANJE ZALIHA
    // ---------------------------------------------------------

    function openInventory() {

        refreshApplicationScreens();

        setTimeout(function () {
            if (typeof window.openInventoryAndShowHighlight === 'function') {
                window.openInventoryAndShowHighlight();
                return;
            }

            if (typeof window.showScreen === 'function') {
                window.showScreen('inventoryScreen');
                return;
            }

            const inventory = el('inventoryScreen');
            const main = el('mainScreen');

            if (inventory) {
                if (main) {
                    main.style.display = 'none';
                }
                inventory.style.display = 'flex';
                inventory.classList.add('active');
            }
        }, 300);
    }

    // ---------------------------------------------------------
    // OBRADA GLASOVNOG UNOSA NA DATA ENTRY EKRANU
    // ---------------------------------------------------------

    async function processVoiceDataOnDataEntry(command) {

        if (isProcessingVoiceItem) {
            console.warn('Već obrađujem jedan glasovni unos.');
            return false;
        }

        isProcessingVoiceItem = true;

        try {
            const data = parseVoiceDataEntry(command);

            if (!data) {
                showVoiceStatus(
                    '❌ Nisam prepoznao podatke. Probajte: "start pileći batak 1 kg zamrzivač 1"',
                    '#f44336'
                );
                return false;
            }

            console.log('📦 Parsirani podaci:', data);

            fillDataEntryForm(data);

            await new Promise(function (resolve) {
                setTimeout(resolve, 150);
            });

            const productInput = el('productInput');
            if (productInput && productInput.value.trim() !== data.product_name.trim()) {
                console.warn('Naziv nije pravilno upisan, ponavljam...');
                fillDataEntryForm(data);
                await new Promise(function (resolve) {
                    setTimeout(resolve, 100);
                });
            }

            const saved = await saveVoiceData(data);

            if (saved) {
                showVoiceStatus(
                    '✅ Sačuvano: ' + data.product_name + ' (' + data.quantity + ' ' + data.unit + ')',
                    '#4CAF50'
                );
                console.log('✅ Podaci uspešno sačuvani');
                return true;
            } else {
                showVoiceStatus('❌ Greška pri čuvanju podataka', '#f44336');
                return false;
            }

        } catch (error) {
            console.error('Greška pri obradi:', error);
            showVoiceStatus('❌ Greška: ' + error.message, '#f44336');
            return false;
        } finally {
            isProcessingVoiceItem = false;
        }
    }

    // ---------------------------------------------------------
    // PREPOZNAVANJE GLASA - GLAVNA FUNKCIJA
    // ---------------------------------------------------------

    function startVoiceRecognition() {

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            showVoiceStatus('❌ Browser ne podržava glasovno prepoznavanje.', '#f44336');
            return;
        }

        // Ako već radi, nemoj ponovo startovati
        if (isVoiceActive && recognition) {
            console.log('Mikrofon već radi');
            return;
        }

        // Zaustavi postojeći ako postoji
        if (recognition) {
            try {
                recognition.stop();
            } catch (e) {}
            recognition = null;
        }

        recognition = new SpeechRecognition();

        const langCode = typeof window.currentLang !== 'undefined' ? window.currentLang : 'sr';
        const languages = {
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

        recognition.lang = languages[langCode] || 'sr-RS';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        voiceBuffer = '';
        isVoiceActive = true;

        // -----------------------------------------------------
        // START
        // -----------------------------------------------------

        recognition.onstart = function () {
            console.log('🎤 Mikrofon aktivan');
            isVoiceActive = true;
            showVoiceStatus(
                '🎤 Slušam... Recite "start" za novi unos.',
                '#4CAF50'
            );
            
            // Ažuriraj dugme ako postoji
            const micButton = document.querySelector('#voiceMicButton');
            if (micButton) {
                micButton.textContent = '🔴';
                micButton.style.background = '#f44336';
            }
        };

        // -----------------------------------------------------
        // RESULT
        // -----------------------------------------------------

        recognition.onresult = function (event) {

            let finalText = '';
            let interimText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result[0].transcript.trim();

                if (result.isFinal) {
                    finalText += (finalText ? ' ' : '') + transcript;
                } else {
                    interimText += transcript;
                }
            }

            if (finalText) {
                voiceBuffer += (voiceBuffer ? ' ' : '') + finalText;
                console.log('VOICE BUFFER:', voiceBuffer);
            }

            const display = voiceBuffer + (interimText ? ' ' + interimText : '');
            showVoiceStatus('🎤 ' + display, '#FFD700');

            const lower = normalizeText(voiceBuffer);

            // ⭐ 1. "UNOS" - otvara Data Entry
            if (/\b(unos|unesi|dodaj|novi|open)\b/.test(lower)) {
                console.log('🔥 UNOS komanda prepoznata!');
                const cleaned = voiceBuffer.replace(/\b(unos|unesi|dodaj|novi|open)\b/gi, '').trim();
                openDataEntry();
                if (cleaned) {
                    setTimeout(() => {
                        processVoiceDataOnDataEntry('start ' + cleaned);
                    }, 500);
                }
                voiceBuffer = '';
                return;
            }

            // ⭐ 2. "START" - novi unos
            if (/\bstart\b/.test(lower)) {
                console.log('🔥 START komanda prepoznata!');
                const match = voiceBuffer.match(/start\s+(.+)/i);
                const dataText = match ? match[1].trim() : '';
                if (dataText) {
                    processVoiceDataOnDataEntry(voiceBuffer);
                } else {
                    showVoiceStatus('⚠️ Recite podatke nakon "start"', '#FF9800');
                }
                voiceBuffer = '';
                return;
            }

            // ⭐ 3. "PLUS" - završava unos
            if (/\bplus\b/.test(lower)) {
                console.log('🔥 PLUS komanda prepoznata!');
                const parts = voiceBuffer.split(/\bplus\b/i);
                const itemText = parts[0].trim();
                if (itemText) {
                    processVoiceDataOnDataEntry('start ' + itemText);
                }
                voiceBuffer = parts.slice(1).join(' ').trim();
                showVoiceStatus('➕ Unos sačuvan. Spremni za sledeći.', '#4CAF50');
                return;
            }

            // ⭐ 4. "KRAJ" / "END" - otvara zalihe
            if (/\b(kraj|gotovo|end|gotov|završi|zavrsi)\b/i.test(lower)) {
                console.log('🔥 KRAJ komanda prepoznata!');
                const parts = voiceBuffer.split(/\b(kraj|gotovo|end|gotov|završi|zavrsi)\b/i);
                const itemText = parts[0].trim();
                if (itemText) {
                    processVoiceDataOnDataEntry('start ' + itemText);
                }
                stopVoiceRecognition();
                setTimeout(openInventory, 500);
                voiceBuffer = '';
                return;
            }

            // Ako je Data Entry otvoren i ima teksta, automatski procesiraj
            if (isDataEntryOpen && finalText && !/\b(start|plus|kraj|gotovo|end)\b/.test(lower)) {
                // Sačekaj pauzu u govoru
                clearTimeout(window.voiceTimeout);
                window.voiceTimeout = setTimeout(() => {
                    if (voiceBuffer.trim() && !/\b(start|plus|kraj|gotovo|end)\b/.test(normalizeText(voiceBuffer))) {
                        console.log('🔄 Automatska obrada:', voiceBuffer);
                        processVoiceDataOnDataEntry('start ' + voiceBuffer);
                        voiceBuffer = '';
                    }
                }, 1500);
            }
        };

        // -----------------------------------------------------
        // ERROR
        // -----------------------------------------------------

        recognition.onerror = function (event) {
            console.error('Speech Recognition error:', event.error);
            isVoiceActive = false;
            
            if (event.error === 'not-allowed') {
                showVoiceStatus('❌ Dozvolite pristup mikrofonu.', '#f44336');
            } else if (event.error === 'no-speech') {
                showVoiceStatus('⚠️ Nisam čuo govor. Pokušajte ponovo.', '#FF9800');
            } else {
                showVoiceStatus('⚠️ Greška: ' + event.error, '#FF9800');
            }
            
            // Ažuriraj dugme
            const micButton = document.querySelector('#voiceMicButton');
            if (micButton) {
                micButton.textContent = '🎤';
                micButton.style.background = '#4CAF50';
            }
        };

        // -----------------------------------------------------
        // END
        // -----------------------------------------------------

        recognition.onend = function () {
            console.log('🎤 Glasovno prepoznavanje završeno.');
            isVoiceActive = false;
            recognition = null;
            
            // Ažuriraj dugme
            const micButton = document.querySelector('#voiceMicButton');
            if (micButton) {
                micButton.textContent = '🎤';
                micButton.style.background = '#4CAF50';
            }
        };

        try {
            recognition.start();
            console.log('✅ Mikrofon pokrenut');
        } catch (error) {
            console.error('Greška pri startovanju:', error);
            recognition = null;
            isVoiceActive = false;
        }
    }

    // ---------------------------------------------------------
    // STOP
    // ---------------------------------------------------------

    function stopVoiceRecognition() {
        if (recognition) {
            try {
                recognition.stop();
            } catch (e) {}
            recognition = null;
        }
        isVoiceActive = false;
        voiceBuffer = '';
        
        // Ažuriraj dugme
        const micButton = document.querySelector('#voiceMicButton');
        if (micButton) {
            micButton.textContent = '🎤';
            micButton.style.background = '#4CAF50';
        }
        
        showVoiceStatus('⏸️ Glasovni unos zaustavljen', '#aaa');
    }

    // ---------------------------------------------------------
    // POVRATAK
    // ---------------------------------------------------------

    function goBackFromVoice() {
        stopVoiceRecognition();
        if (typeof window.showScreen === 'function') {
            window.showScreen('choiceScreen');
        }
    }

    // ---------------------------------------------------------
    // JAVNE FUNKCIJE
    // ---------------------------------------------------------

    window.startVoiceRecognition = startVoiceRecognition;
    window.stopVoiceRecognition = stopVoiceRecognition;
    window.goBackFromVoice = goBackFromVoice;
    window.hideVoiceMenu = hideVoiceMenu;
    window.parseVoiceDataEntry = parseVoiceDataEntry;
    window.processVoiceCommand = processVoiceDataOnDataEntry;
    window.popuniStartPodatke = fillDataEntryForm;
    window.otvoriZaliheEkran = openInventory;
    window.openDataEntryVoice = openDataEntry;
    window.addMicrophoneButtonToDataEntry = addMicrophoneButtonToDataEntry;

    // ---------------------------------------------------------
    // TEST FUNKCIJE
    // ---------------------------------------------------------

    window.testVoiceEntry = async function () {
        const testData = 'start Pileći batak 1 kilogram 6 meseci zamrzivač 1';
        console.log('TEST GLASOVNOG UNOSA:', testData);
        return await processVoiceDataOnDataEntry(testData);
    };

    window.testOpenDataEntry = function () {
        console.log('Test otvaranja Data Entry...');
        openDataEntry();
    };

    // ---------------------------------------------------------
    // INICIJALIZACIJA
    // ---------------------------------------------------------

    console.log('✅ VOICE DATA ENTRY MODUL JE UČITAN');
    console.log('🎤 Komande:');
    console.log('  "unos" → otvara Data Entry');
    console.log('  "start ..." → novi unos');
    console.log('  "plus" → završava unos');
    console.log('  "end" → otvara zalihe');

    // Dodaj dugme za mikrofon na Data Entry čim se pojavi
    const observer = new MutationObserver(function(mutations) {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                const mainScreen = document.getElementById('mainScreen');
                if (mainScreen && mainScreen.style.display !== 'none') {
                    setTimeout(addMicrophoneButtonToDataEntry, 500);
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
