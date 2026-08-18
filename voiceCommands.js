// ============================================
// VOICE COMMANDS - GLASOVNE KOMANDE - KOMPLETAN KOD
// ============================================

let activeBuffer = ''; 
let isFirstEntry = true;
let recognition = null;
let fullSpeechResult = '';

// ===== POMOĆNA FUNKCIJA ZA SAKRIVANJE VOICE MENIJA =====
function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
        console.log('🔇 Voice menu sakriven');
    }
}

// ===== FUNKCIJA ZA OBRADU GLASOVNIH KOMANDI =====
function processVoiceCommand(command) {
    console.log('🎤 processVoiceCommand prima:', command);
    
    if (!command || command.trim() === '') {
        console.log('❌ Prazna komanda');
        return false;
    }
    
    const cmd = command.toLowerCase().trim();
    console.log('📝 Normalizovana komanda:', cmd);
    
    // Sakrivamo voice meni
    hideVoiceMenu();
    
    // ===== PROVERA "START" KOMANDE =====
    if (cmd.includes('start') || cmd.includes('stat') || cmd.includes('stard')) {
        console.log('🚀 Prepoznat START!');
        processStartCommand(command);
        return true;
    }
    
    // ===== UNOS PODATAKA - SVI JEZICI =====
    const dataEntryKeywords = [
        'unos', 'unesi', 'dodaj', 'novi', 'podatak', 'unos podataka',
        'add', 'product', 'entry', 'data', 'new', 'insert', 'create',
        'eintrag', 'produkt', 'hinzufügen', 'neu', 'daten', 'eingabe',
        'bevitel', 'új', 'termék', 'hozzáad', 'rögzít', 'adat', 'beír',
        'введення', 'дані', 'продукт', 'новий', 'додати', 'внести',
        'ввод', 'данные', 'продукт', 'новый', 'добавить',
        '录入', '输入', '数据', '产品', '新增', '添加',
        'entrada', 'datos', 'producto', 'nuevo', 'agregar', 'añadir',
        'entrada', 'dados', 'produto', 'novo', 'adicionar', 'inserir',
        'saisie', 'données', 'produit', 'nouveau', 'ajouter', 'entrer'
    ];
    if (dataEntryKeywords.some(k => cmd.includes(k))) {
        console.log('✅ Prepoznat UNOS PODATAKA!');
        
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderDataEntry === 'function') {
                renderDataEntry('');
            } else if (typeof window.renderDataEntry === 'function') {
                window.renderDataEntry('');
            }
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = '🎤 Sada recite "Start" pa diktirajte podatke (naziv, komad, količina, rok, skladište)';
                statusEl.style.color = '#4CAF50';
            }
            setTimeout(function() {
                const productInput = document.getElementById('productInput');
                if (productInput) productInput.focus();
            }, 300);
        }, 300);
        return true;
    }
    
    // ===== ZALIHE - SVI JEZICI =====
    const inventoryKeywords = [
        'stanje', 'zalihe', 'inventar',
        'inventory', 'stock', 'supplies',
        'bestand', 'lager', 'inventar',
        'készlet', 'raktár', 'állapot', 'leltár',
        'запаси', 'склад', 'інвентар',
        'запасы', 'склад', 'инвентарь',
        '库存', '存货', '供应',
        'inventario', 'existencia', 'stock',
        'estoque', 'inventário',
        'stock', 'inventaire', 'approvisionnement'
    ];
    if (inventoryKeywords.some(k => cmd.includes(k))) {
        console.log('✅ Prepoznate ZALIHE');
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderInventory === 'function') {
                renderInventory();
            }
        }, 300);
        return true;
    }

    // ===== SPISAK - SVI JEZICI =====
    const shoppingKeywords = [
        'spisak', 'kupovina', 'potrebe', 'lista',
        'shopping', 'list', 'shopping list',
        'einkaufsliste', 'einkauf', 'liste',
        'bevásárlólista', 'lista', 'vásárlás', 'bevásárlás',
        'список', 'покупки', 'список покупок',
        '购物清单', '购物列表', '清单',
        'lista de compras', 'compras', 'lista',
        'liste de courses', 'courses', 'liste'
    ];
    if (shoppingKeywords.some(k => cmd.includes(k))) {
        console.log('✅ Prepoznat SPISAK');
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderShoppingList === 'function') {
                renderShoppingList();
            }
        }, 300);
        return true;
    }

    // ===== NAZAD - SVI JEZICI =====
    const backKeywords = [
        'nazad', 'vrati', 'odustani', 'otkaži', 'vrati se',
        'back', 'cancel', 'go back', 'return', 'exit',
        'zurück', 'abbrechen', 'beenden',
        'vissza', 'mégsem', 'visszatér', 'kilép',
        'назад', 'скасувати', 'повернутися', 'отмена', 'вернуться',
        '返回', '取消', '回去',
        'atrás', 'cancelar', 'volver', 'regresar', 'voltar', 'retour', 'annuler'
    ];
    if (backKeywords.some(k => cmd.includes(k))) {
        console.log('✅ Prepoznat NAZAD');
        setTimeout(function() {
            if (typeof handleBackAction === 'function') {
                handleBackAction();
            } else if (typeof goBackFromVoice === 'function') {
                goBackFromVoice();
            } else {
                const choiceScreen = document.getElementById('choiceScreen');
                if (choiceScreen) {
                    document.querySelectorAll('.screen').forEach(s => {
                        s.style.display = 'none';
                        s.classList.remove('active');
                    });
                    choiceScreen.style.display = 'flex';
                    choiceScreen.classList.add('active');
                }
            }
        }, 300);
        return true;
    }

    // ===== MENI / POČETNA =====
    const menuKeywords = [
        'meni', 'početna', 'glavni', 'početak', 'home',
        'menu', 'main', 'start', 'hauptmenü', 'főoldal',
        'меню', 'головна', 'главная', '菜单', '主页', 'inicio'
    ];
    if (menuKeywords.some(k => cmd.includes(k))) {
        console.log('✅ Prepoznat MENI');
        setTimeout(function() {
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderCategories === 'function') {
                renderCategories();
            }
        }, 300);
        return true;
    }

    console.log('❌ Komanda nije prepoznata:', cmd);
    if (typeof showModernAlert === 'function') {
        showModernAlert('Nepoznata komanda', `"${command}" nije prepoznato.`, '❓');
    }
    return false;
}

// ===== POKRETAČ ZA GLASOVNI UNOS =====
function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        if (typeof showModernAlert === 'function') {
            showModernAlert('Greška', 'Vaš pretraživač ne podržava glasovne komande.', '❌');
        }
        return;
    }

    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
        fullSpeechResult = '';
    }

    recognition = new SpeechRecognition();
    const langCode = typeof currentLang !== 'undefined' ? currentLang : 'sr';
    const speechLangMap = {
        sr: 'sr-RS', en: 'en-US', de: 'de-DE', hu: 'hu-HU',
        uk: 'uk-UA', ru: 'ru-RU', zh: 'zh-CN', es: 'es-ES',
        pt: 'pt-PT', fr: 'fr-FR'
    };
    recognition.lang = speechLangMap[langCode] || 'sr-RS';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎤 Slušam... Govorite komandu';
        statusEl.style.color = '#2196F3';
    }

    recognition.onstart = function() {
        console.log('🎤 Glasovno prepoznavanje pokrenuto na jeziku:', recognition.lang);
        if (statusEl) {
            statusEl.textContent = '🎤 Slušam...';
            statusEl.style.color = '#2196F3';
        }
        fullSpeechResult = '';
    };

    recognition.onresult = function(event) {
        let newFinalText = '';
        let interimText = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript.trim();
            
            if (result.isFinal) {
                newFinalText += (newFinalText ? ' ' : '') + transcript;
                console.log(`✅ Finalni deo:`, transcript);
            } else {
                interimText += transcript;
            }
        }
        
        if (newFinalText) {
            activeBuffer += (activeBuffer ? ' ' : '') + newFinalText;
            console.log('🗣️ TRENUTNI BAFER UNOSA:', activeBuffer);
        }
        
        const currentDisplay = activeBuffer + (interimText ? ' ' + interimText : '');
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = `🎤 Slušam: "${currentDisplay}"`;
            statusEl.style.color = '#FFD700';
        }
        
        const lowerBuffer = activeBuffer.toLowerCase();
        
        // ===== 1. KORAK: Ako je rečeno "unos" (i još nije započet unos artikla) =====
        const dataEntryKeywords = ['unos', 'unesi', 'dodaj', 'novi', 'add', 'product', 'entry'];
        if (dataEntryKeywords.some(keyword => lowerBuffer.includes(keyword)) && !lowerBuffer.includes('start')) {
            console.log('✅ Detektovan zahtev za UNOS! Otvaram ekran za unose...');
            
            // Otvaramo ekran unosa
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
            }
            if (typeof renderDataEntry === 'function') {
                renderDataEntry('');
            } else if (typeof window.renderDataEntry === 'function') {
                window.renderDataEntry('');
            }
            
            if (statusEl) {
                statusEl.textContent = '🎤 Ekran za unos otvoren. Sada recite "Start" pa diktirajte artikle...';
                statusEl.style.color = '#4CAF50';
            }
            
            // Čistimo bafer da sada čeka "Start" i podatke
            activeBuffer = '';
            isFirstEntry = true;
            return;
        }
        
        // ===== 2. KORAK: Nakon otvorenog ekrana, čekamo "START" pa podatke =====
        if (lowerBuffer.includes('start') || lowerBuffer.includes('stat') || lowerBuffer.includes('stard')) {
            console.log('🚀 Detektovan START i podaci:', activeBuffer);
            
            // Obrađujemo i popunjavamo formu
            processStartCommand(activeBuffer);
            
            // Resetujemo bafer za sledeće artikle uz plus/end
            activeBuffer = '';
            isFirstEntry = false;
            return;
        }
        
        // ===== 3. KORAK: Provera za PLUS ili END (sledeći artikli ili kraj) =====
        if (lowerBuffer.includes('plus') || lowerBuffer.includes('end')) {
            console.log('✅ Detektovan PLUS/END! Obrađujem unete podatke...');
            
            if (typeof processAndSaveEntry === 'function') {
                processAndSaveEntry(activeBuffer);
            } else if (typeof window.processAndSaveEntry === 'function') {
                window.processAndSaveEntry(activeBuffer);
            }
            
            if (lowerBuffer.includes('end')) {
                console.log('🚀 Kraj unosa (END). Otvaram zalihe...');
                if (typeof openInventoryAndShowHighlight === 'function') {
                    openInventoryAndShowHighlight();
                }
            }
            
            activeBuffer = '';
        }
    };

// ===== ZAUSTAVI GLASOVNO PREPOZNAVANJE =====
function stopVoiceRecognition() {
    if (recognition) {
        try {
            recognition.stop();
            recognition = null;
            console.log('🛑 Recognition zaustavljen');
        } catch(e) {}
    }
    fullSpeechResult = '';
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '⏸️ Prepoznavanje zaustavljeno';
        statusEl.style.color = '#aaa';
    }
}

// ===== POVRATAK SA VOICE MENIJA =====
function goBackFromVoice() {
    console.log('◀ Povratak sa glasovnog menija');
    stopVoiceRecognition();
    if (typeof showScreen === 'function') {
        showScreen('choiceScreen');
    }
}

// ===== PARSIRANJE GLASOVNOG UNOSA =====
function parseVoiceDataEntry(command) {
    console.log('🔍 Parsiranje glasovnog unosa:', command);
    
    let text = command.replace(/^start\s*/i, '').trim();
    let parts = text.split(',').map(s => s.trim());
    
    let result = {
        product_name: '',
        piece: '',
        quantity: '',
        unit: 'kom',
        shelf_life: '',
        storage: 'Zamrzivač 1'
    };
    
    const unitMap = {
        'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg',
        'gram': 'g', 'grama': 'g', 'g': 'g',
        'litar': 'l', 'litara': 'l', 'l': 'l',
        'mililitar': 'ml', 'mililitara': 'ml', 'ml': 'ml',
        'komad': 'kom', 'komada': 'kom', 'kom': 'kom',
        'paket': 'pak', 'paketa': 'pak', 'pak': 'pak',
        'kutija': 'kutija', 'kutije': 'kutija'
    };
    
    const storageMap = {
        'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
        'zamrzivač 1': 'Zamrzivač 1', 'zamrzivac 1': 'Zamrzivač 1',
        'zamrzivač 2': 'Zamrzivač 2', 'zamrzivac 2': 'Zamrzivač 2',
        'zamrzivač 3': 'Zamrzivač 3', 'zamrzivac 3': 'Zamrzivač 3',
        'frižider': 'Frižider', 'frizider': 'Frižider', 'hladnjak': 'Frižider',
        'ostava': 'Ostava', 'špajz': 'Ostava', 'pantry': 'Ostava',
        'ostalo': 'Ostalo', 'drugo': 'Ostalo', 'other': 'Ostalo'
    };
    
    parts.forEach((part, index) => {
        part = part.toLowerCase().trim();
        
        if (index === 0) {
            if (!/\d/.test(part)) {
                result.product_name = parts[0].trim();
                return;
            }
        }
        
        for (let [key, value] of Object.entries(storageMap)) {
            if (part.includes(key)) {
                result.storage = value;
                return;
            }
        }
        
        for (let [key, value] of Object.entries(unitMap)) {
            if (part.includes(key)) {
                let numMatch = part.match(/([\d.]+)/);
                if (numMatch) {
                    result.quantity = numMatch[1];
                    result.unit = value;
                }
                return;
            }
        }
        
        let numMatch = part.match(/(\d+)/);
        if (numMatch) {
            let num = numMatch[1];
            if (parts.length > index + 1) {
                let nextPart = parts[index + 1]?.toLowerCase().trim() || '';
                let isStorage = false;
                for (let key of Object.keys(storageMap)) {
                    if (nextPart.includes(key)) {
                        isStorage = true;
                        break;
                    }
                }
                if (!isStorage && !result.shelf_life) {
                    result.shelf_life = num;
                    return;
                }
            }
            if (!result.piece) {
                result.piece = num;
            }
        }
    });
    
    if (!result.product_name && parts.length > 0) {
        result.product_name = parts[0].trim();
    }
    
    if (!result.quantity && result.piece) {
        result.quantity = result.piece;
        result.unit = 'kom';
    }
    
    console.log('✅ Parsirani rezultat:', result);
    return result;
}

// ===== OBRADA "START" KOMANDE ZA UNOS =====
function processStartCommand(command) {
    console.log('🚀 Procesiram Start komandu:', command);
    
    let data = parseVoiceDataEntry(command);
    
    if (!data.product_name) {
        if (typeof showModernAlert === 'function') {
            showModernAlert('Greška', 'Nije prepoznat naziv proizvoda!', '❌');
        }
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Nije prepoznat naziv. Pokušajte ponovo.';
            statusEl.style.color = '#f44336';
        }
        return false;
    }
    
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    
    if (typeof renderDataEntry === 'function') {
        renderDataEntry(data);
    } else if (typeof window.renderDataEntry === 'function') {
        window.renderDataEntry(data);
    }
    
    const observer = new MutationObserver((mutations, obs) => {
        const productInput = document.getElementById('productInput');
        if (productInput) {
            obs.disconnect();
            popuniStartPodatke(data);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    setTimeout(() => {
        popuniStartPodatke(data);
    }, 100);

    return true;
}

// ===== POMOĆNA FUNKCIJA ZA POPUNJAVANJE PODATAKA =====
function popuniStartPodatke(data) {
    const productInput = document.getElementById('productInput');
    if (!productInput) return;

    console.log('📝 Popunjavam polja sa:', data);
    
    const pieceInput = document.getElementById('pieceInput');
    const quantityInput = document.getElementById('quantityInput');
    const shelfLifeInput = document.getElementById('shelfLifeInput');
    const unitSelect = document.getElementById('unitSelect');
    const storageSelect = document.getElementById('storageSelect');
    
    productInput.value = data.product_name || '';
    productInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    if (pieceInput) {
        pieceInput.value = data.piece || '1';
        pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (quantityInput) {
        quantityInput.value = data.quantity || data.piece || '1';
        quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (shelfLifeInput) {
        shelfLifeInput.value = data.shelf_life || '12';
        shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    if (unitSelect && data.unit) {
        for (let option of unitSelect.options) {
            if (option.value === data.unit) {
                option.selected = true;
                unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }
    
    if (storageSelect && data.storage) {
        for (let option of storageSelect.options) {
            if (option.value === data.storage || option.text.includes(data.storage)) {
                option.selected = true;
                storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }
    
    if (typeof updateExpiryDate === 'function') {
        updateExpiryDate();
    }
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `✅ Popunjeno: ${data.product_name}, ${data.quantity || 1} ${data.unit || 'kom'}`;
        statusEl.style.color = '#4CAF50';
    }
}

// ===== IZVEZI FUNKCIJE GLOBALNO =====
window.processVoiceCommand = processVoiceCommand;
window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.processStartCommand = processStartCommand;
window.popuniStartPodatke = popuniStartPodatke;

console.log('✅ Voice Commands učitan u celosti!');
