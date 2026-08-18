// ============================================================
// VOICE DATA ENTRY - PRAVI TOK
// "unos" -> otvara Data Entry
// "start" -> počinje novi unos na Data Entry ekranu
// "plus" -> završava unos i počinje novi
// "end" -> otvara zalihe
// ============================================================

(function () {
    'use strict';

    let recognition = null;
    let voiceBuffer = '';
    let isProcessingVoiceItem = false;
    let isDataEntryOpen = false; // Da li je Data Entry ekran otvoren
    let currentEntryData = null; // Trenutni podaci za unos

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
        const status = el('voiceStatus');

        if (status) {
            status.textContent = text;
            if (color) status.style.color = color;
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

        if (
            current === 'zamrzivac' ||
            current === 'zamrzivač'
        ) {
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

        if (
            current === 'frizider' ||
            current === 'frižider'
        ) {
            return {
                storage: 'Frižider',
                consumed: 1
            };
        }

        if (
            current === 'ostava' ||
            current === 'spajz' ||
            current === 'špajz'
        ) {
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

        // Ukloni "start" ako je na početku
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
        let unitFound = false;
        let shelfLifeFound = false;
        let storageFound = false;

        let i = 0;

        while (i < words.length) {

            const word = normalizeText(words[i]);

            // ---------------------------------------------
            // SKLADIŠTE
            // ---------------------------------------------

            const storageResult = getStorage(text, i);

            if (storageResult) {

                result.storage = storageResult.storage;
                storageFound = true;

                i += storageResult.consumed;
                continue;
            }

            // ---------------------------------------------
            // JEDINICA
            // ---------------------------------------------

            const unit = getUnit(word);

            if (unit) {

                result.unit = unit;
                unitFound = true;

                i++;
                continue;
            }

            // ---------------------------------------------
            // BROJ
            // ---------------------------------------------

            const number = getNumber(word);

            if (number !== null) {

                // Prvi broj = količina
                if (!quantityFound) {

                    result.quantity = number;
                    result.piece = number;

                    quantityFound = true;

                    i++;
                    continue;
                }

                // Drugi broj = rok trajanja
                if (!shelfLifeFound) {

                    result.shelf_life = number;
                    shelfLifeFound = true;

                    i++;
                    continue;
                }

                i++;
                continue;
            }

            // ---------------------------------------------
            // REČ "MESEC", "MESECI", "MESECA"
            // ---------------------------------------------

            if (
                word === 'mesec' ||
                word === 'meseca' ||
                word === 'meseci' ||
                word === 'mesecima'
            ) {
                i++;
                continue;
            }

            // ---------------------------------------------
            // REČI KOJE OPISUJU SKLADIŠTE
            // ---------------------------------------------

            if (
                word === 'u' ||
                word === 'za' ||
                word === 'rok' ||
                word === 'trajanje' ||
                word === 'na'
            ) {
                i++;
                continue;
            }

            // ---------------------------------------------
            // NAZIV PROIZVODA
            // ---------------------------------------------

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

        // Naziv
        setValue(
            'productInput',
            data.product_name
        );

        // Komadi
        setValue(
            'pieceInput',
            data.piece
        );

        // Količina
        setValue(
            'quantityInput',
            data.quantity
        );

        // Rok
        setValue(
            'shelfLifeInput',
            data.shelf_life
        );

        // Jedinica
        const unitSelect = el('unitSelect');

        if (unitSelect) {

            let found = false;

            for (const option of unitSelect.options) {

                const optionValue =
                    normalizeText(option.value);

                const optionText =
                    normalizeText(option.textContent);

                if (
                    optionValue === normalizeText(data.unit) ||
                    optionText === normalizeText(data.unit)
                ) {

                    unitSelect.value = option.value;

                    unitSelect.dispatchEvent(
                        new Event('change', {
                            bubbles: true
                        })
                    );

                    found = true;
                    break;
                }
            }

            if (!found) {
                console.warn(
                    'Jedinica nije pronađena:',
                    data.unit
                );
            }
        }

        // Skladište
        const storageSelect = el('storageSelect');

        if (storageSelect) {

            let found = false;

            for (const option of storageSelect.options) {

                const optionValue =
                    normalizeText(option.value);

                const optionText =
                    normalizeText(option.textContent);

                const wanted =
                    normalizeText(data.storage);

                if (
                    optionValue === wanted ||
                    optionText === wanted ||
                    optionText.includes(wanted) ||
                    wanted.includes(optionText)
                ) {

                    storageSelect.value = option.value;

                    storageSelect.dispatchEvent(
                        new Event('change', {
                            bubbles: true
                        })
                    );

                    found = true;
                    break;
                }
            }

            if (!found) {
                console.warn(
                    'Skladište nije pronađeno:',
                    data.storage
                );
            }
        }

        // Ako aplikacija ima funkciju za datum isteka
        if (typeof window.updateExpiryDate === 'function') {
            try {
                window.updateExpiryDate();
            } catch (error) {
                console.warn(
                    'updateExpiryDate greška:',
                    error
                );
            }
        }

        return true;
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

        // 4. Pokušaj da nađeš dugme za unos i klikneš
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

        showVoiceStatus(
            '📝 Ekran za unos otvoren. Recite "start" za novi unos.',
            '#4CAF50'
        );
    }

    // ---------------------------------------------------------
    // ČUVANJE PODATAKA
    // ---------------------------------------------------------

    async function saveVoiceData(data) {

        if (!data) return false;

        console.log('ČUVAM GLASOVNI UNOS:', data);

        // -----------------------------------------------------
        // 1. saveProduct()
        // -----------------------------------------------------

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

        // -----------------------------------------------------
        // 2. handleFormSubmit()
        // -----------------------------------------------------

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

        // -----------------------------------------------------
        // 3. addProduct()
        // -----------------------------------------------------

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

        // -----------------------------------------------------
        // 4. Submit forme
        // -----------------------------------------------------

        const form = document.querySelector(
            '#mainScreen form, #dataEntryForm, form'
        );

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

            // 1. Parsiranje
            const data = parseVoiceDataEntry(command);

            if (!data) {
                showVoiceStatus(
                    '❌ Nisam prepoznao podatke. Probajte: "start pileći batak 1 kg zamrzivač 1"',
                    '#f44336'
                );
                return false;
            }

            console.log('📦 Parsirani podaci:', data);

            // 2. Popuni formu
            fillDataEntryForm(data);

            // 3. Sačekaj da se podaci upišu
            await new Promise(function (resolve) {
                setTimeout(resolve, 150);
            });

            // 4. Proveri da li je naziv upisan
            const productInput = el('productInput');
            if (productInput && productInput.value.trim() !== data.product_name.trim()) {
                console.warn('Naziv nije pravilno upisan, ponavljam...');
                fillDataEntryForm(data);
                await new Promise(function (resolve) {
                    setTimeout(resolve, 100);
                });
            }

            // 5. Sačuvaj podatke
            const saved = await saveVoiceData(data);

            if (saved) {
                showVoiceStatus(
                    '✅ Sačuvano: ' + data.product_name + ' (' + data.quantity + ' ' + data.unit + ')',
                    '#4CAF50'
                );
                console.log('✅ Podaci uspešno sačuvani');
                return true;
            } else {
                showVoiceStatus(
                    '❌ Greška pri čuvanju podataka',
                    '#f44336'
                );
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
    // PREPOZNAVANJE GLASA
    // ---------------------------------------------------------

    function startVoiceRecognition() {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            showVoiceStatus(
                '❌ Browser ne podržava glasovno prepoznavanje.',
                '#f44336'
            );
            return;
        }

        if (recognition) {
            try {
                recognition.stop();
            } catch (e) {}
            recognition = null;
        }

        recognition = new SpeechRecognition();

        const langCode = typeof window.currentLang !== 'undefined'
            ? window.currentLang
            : 'sr';

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
        isDataEntryOpen = false;

        // -----------------------------------------------------
        // START
        // -----------------------------------------------------

        recognition.onstart = function () {
            showVoiceStatus(
                '🎤 Slušam... Recite "unos" za otvaranje ekrana, zatim "start" za novi unos.',
                '#2196F3'
            );
            voiceBuffer = '';
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

            // -------------------------------------------------
            // PROVERA KOMANDI
            // -------------------------------------------------

            const lower = normalizeText(voiceBuffer);

            // ⭐ 1. "UNOS" - otvara Data Entry ekran
            if (/\b(unos|unesi|dodaj|novi|open)\b/.test(lower)) {
                console.log('🔥 UNOS komanda prepoznata! Otvaram Data Entry...');
                
                // Očisti buffer od "unos" komande
                const cleaned = voiceBuffer.replace(
                    /\b(unos|unesi|dodaj|novi|open)\b/gi,
                    ''
                ).trim();

                // Otvori Data Entry
                openDataEntry();
                
                // Ako ima podataka nakon "unos", procesiraj ih
                if (cleaned) {
                    // Ovo je za slučaj "unos mleko 1 litar" - direktno popuni
                    setTimeout(() => {
                        processVoiceDataOnDataEntry('start ' + cleaned);
                    }, 500);
                } else {
                    showVoiceStatus(
                        '📝 Ekran otvoren. Recite "start" za novi unos.',
                        '#4CAF50'
                    );
                }
                
                voiceBuffer = '';
                return;
            }

            // ⭐ 2. "START" - novi unos na Data Entry ekranu
            if (/\bstart\b/.test(lower) && isDataEntryOpen) {
                console.log('🔥 START komanda prepoznata na Data Entry ekranu!');
                
                // Izvuci podatke nakon "start"
                const match = voiceBuffer.match(/start\s+(.+)/i);
                const dataText = match ? match[1].trim() : '';

                if (dataText) {
                    // Procesiraj unos
                    processVoiceDataOnDataEntry(voiceBuffer);
                } else {
                    showVoiceStatus(
                        '⚠️ Recite podatke nakon "start", npr. "start pileći batak 1 kg"',
                        '#FF9800'
                    );
                }
                
                voiceBuffer = '';
                return;
            }

            // ⭐ 3. "PLUS" - završava trenutni unos i započinje novi
            if (/\bplus\b/.test(lower) && isDataEntryOpen) {
                console.log('🔥 PLUS komanda prepoznata! Završavam unos...');
                
                const parts = voiceBuffer.split(/\bplus\b/i);
                const itemText = parts[0].trim();
                
                // Sačuvaj trenutni unos
                if (itemText) {
                    processVoiceDataOnDataEntry('start ' + itemText);
                }
                
                // Očisti buffer i spremi se za sledeći unos
                voiceBuffer = parts.slice(1).join(' ').trim();
                
                showVoiceStatus(
                    '➕ Unos sačuvan. Spremni za sledeći. Recite "start" ili diktirajte podatke.',
                    '#4CAF50'
                );
                
                return;
            }

            // ⭐ 4. "KRAJ" ili "GOTOVO" ili "END" - završava sve i otvara zalihe
            if (/\b(kraj|gotovo|end|gotov|završi|zavrsi)\b/i.test(lower)) {
                console.log('🔥 KRAJ komanda prepoznata! Otvaram zalihe...');
                
                // Ako ima podataka u bufferu, sačuvaj ih prvo
                const parts = voiceBuffer.split(/\b(kraj|gotovo|end|gotov|završi|zavrsi)\b/i);
                const itemText = parts[0].trim();
                
                if (itemText) {
                    await processVoiceDataOnDataEntry('start ' + itemText);
                }
                
                // Zaustavi prepoznavanje i otvori zalihe
                stopVoiceRecognition();
                setTimeout(openInventory, 500);
                voiceBuffer = '';
                isDataEntryOpen = false;
                
                return;
            }

            // Ako je Data Entry otvoren i nema specijalne komande,
            // ali ima finalText, automatski procesiraj kao podatke
            if (isDataEntryOpen && finalText && !/\b(start|plus|kraj|gotovo|end)\b/.test(lower)) {
                // Ako nema "start" na početku, dodaj ga automatski
                if (!/^start\b/.test(normalizeText(voiceBuffer))) {
                    // Sačekaj malo da vidiš da li će korisnik reći još nešto
                    setTimeout(() => {
                        if (voiceBuffer.trim() && !/\b(start|plus|kraj|gotovo|end)\b/.test(normalizeText(voiceBuffer))) {
                            console.log('🔄 Automatska obrada podataka:', voiceBuffer);
                            processVoiceDataOnDataEntry('start ' + voiceBuffer);
                            voiceBuffer = '';
                        }
                    }, 1500);
                }
            }
        };

        // -----------------------------------------------------
        // ERROR
        // -----------------------------------------------------

        recognition.onerror = function (event) {
            console.error('Speech Recognition error:', event.error);
            if (event.error === 'not-allowed') {
                showVoiceStatus('❌ Dozvolite pristup mikrofonu.', '#f44336');
            }
        };

        // -----------------------------------------------------
        // END
        // -----------------------------------------------------

        recognition.onend = function () {
            console.log('🎤 Glasovno prepoznavanje završeno.');
            recognition = null;
        };

        try {
            recognition.start();
        } catch (error) {
            console.error('Greška pri startovanju:', error);
            recognition = null;
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
        voiceBuffer = '';
        isDataEntryOpen = false;
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
        isDataEntryOpen = true;
    };

    console.log('✅ VOICE DATA ENTRY MODUL JE UČITAN');
    console.log('🎤 Tok: "unos" → otvara Data Entry');
    console.log('📝 Zatim: "start gril pile 1 kg zamrzivač 1"');
    console.log('➕ "plus" → završava unos i počinje novi');
    console.log('🏁 "end" → otvara zalihe');

})();
