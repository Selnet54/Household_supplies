// ============================================
// VOICE COMMANDS - KONAČNA VERZIJA ZA TVOJ HTML
// ============================================

// ===== Stanje =====
const VoiceState = {
    activeBuffer: '',
    recognition: null,
    isProcessing: false,
    speechTimeout: null,
    restartTimer: null,
    isVoiceInput: false
};

// ============================================
// 1. JEZICI I KOMANDE (Tvoje mape)
// ============================================

const SUPPORTED_LANGUAGES = ['sr', 'en', 'de', 'hu', 'uk', 'ru', 'zh', 'es', 'pt', 'fr'];

const VOICE_COMMANDS = {
    sr: { add: ['dodaj', 'unos', 'unesi'], list: ['spisak', 'lista'], stock: ['zalihe', 'zaliha'], close: ['exit', 'izlaz'] },
    en: { add: ['add', 'new', 'enter'], list: ['list', 'inventory'], stock: ['stock', 'status'], close: ['exit'] },
    de: { add: ['hinzufügen', 'neu', 'einfügen'], list: ['liste', 'inventar'], stock: ['bestand', 'lager'], close: ['exit'] },
    hu: { add: ['adatbevitel'], list: ['lista', 'leltár'], stock: ['készlet'], close: ['exit'] },
    uk: { add: ['додати', 'новий', 'ввести'], list: ['список', 'інвентар'], stock: ['запаси', 'склад'], close: ['exit'] },
    ru: { add: ['добавить', 'новый', 'ввести'], list: ['список', 'инвентарь'], stock: ['запасы', 'склад'], close: ['exit'] },
    zh: { add: ['添加', '新增', '输入'], list: ['列表', '清单', '库存'], stock: ['库存', '存储'], close: ['exit'] },
    es: { add: ['añadir', 'nuevo', 'ingresar'], list: ['lista', 'inventario'], stock: ['existencias', 'almacén'], close: ['exit'] },
    pt: { add: ['adicionar', 'novo', 'inserir'], list: ['lista', 'inventário'], stock: ['estoque', 'armazenamento'], close: ['exit'] },
    fr: { add: ['ajouter', 'nouveau', 'entrer'], list: ['liste', 'inventaire'], stock: ['stock', 'entrepôt'], close: ['exit'] }
};

const BUTTON_LABELS = {
    sr: { add: '📝 DODAJ', list: '📋 SPISAK', stock: '📦 ZALIHE', close: '🚪 EXIT' },
    en: { add: '📝 ADD', list: '📋 LIST', stock: '📦 STOCK', close: '🚪 EXIT' },
    de: { add: '📝 HINZUFÜGEN', list: '📋 LISTE', stock: '📦 BESTAND', close: '🚪 EXIT' },
    hu: { add: '📝 ADATBEVITEL', list: '📋 LISTA', stock: '📦 KÉSZLET', close: '🚪 EXIT' },
    uk: { add: '📝 ДОДАТИ', list: '📋 СПИСОК', stock: '📦 ЗАПАСИ', close: '🚪 EXIT' },
    ru: { add: '📝 ДОБАВИТЬ', list: '📋 СПИСОК', stock: '📦 ЗАПАСЫ', close: '🚪 EXIT' },
    zh: { add: '📝 添加', list: '📋 列表', stock: '📦 库存', close: '🚪 EXIT' },
    es: { add: '📝 AÑADIR', list: '📋 LISTA', stock: '📦 EXISTENCIAS', close: '🚪 EXIT' },
    pt: { add: '📝 ADICIONAR', list: '📋 LISTA', stock: '📦 ESTOQUE', close: '🚪 EXIT' },
    fr: { add: '📝 AJOUTER', list: '📋 LISTE', stock: '📦 STOCK', close: '🚪 EXIT' }
};

const VOICE_MESSAGES = {
    sr: { welcome: 'Izgovorite: "UNOS", "SPISAK", "ZALIHE" ili "EXIT"', listening: 'Slušam...', add_mode: 'Otvaram unos...', list_mode: 'Otvaram spisak...', stock_mode: 'Otvaram zalihe...', closing: 'Zatvaram glasovni meni...', not_recognized: 'Nisam prepoznao. Reci: UNOS, SPISAK, ZALIHE ili EXIT', saving: 'Sačuvano: ', new_entry: 'Unesite sledeći proizvod...' },
    en: { welcome: 'Say: "ADD", "LIST", "STOCK" or "EXIT"', listening: 'Listening...', add_mode: 'Opening entry...', list_mode: 'Opening list...', stock_mode: 'Opening stock...', closing: 'Closing voice menu...', not_recognized: 'Not recognized. Say: ADD, LIST, STOCK or EXIT', saving: 'Saved: ', new_entry: 'Enter next product...' },
    de: { welcome: 'Sagen Sie: "HINZUFÜGEN", "LISTE", "BESTAND" oder "EXIT"', listening: 'Höre zu...', add_mode: 'Öffne Eingabe...', list_mode: 'Öffne Liste...', stock_mode: 'Öffne Bestand...', closing: 'Sprachmenü schließen...', not_recognized: 'Nicht erkannt.', saving: 'Gespeichert: ', new_entry: 'Nächstes Produkt...' },
    hu: { welcome: 'Mondja: "ADATBEVITEL", "LISTA", "KÉSZLET" vagy "EXIT"', listening: 'Hallgatom...', add_mode: 'Bevitel nyitása...', list_mode: 'Lista megnyitása...', stock_mode: 'Készlet megnyitása...', closing: 'Hangmenü bezárása...', not_recognized: 'Nem ismert.', saving: 'Mentve: ', new_entry: 'Következő termék...' },
    uk: { welcome: 'Скажіть: "ДОДАТИ", "СПИСОК", "ЗАПАСИ" або "EXIT"', listening: 'Слухаю...', add_mode: 'Відкриваю введення...', list_mode: 'Відкриваю список...', stock_mode: 'Відкриваю запаси...', closing: 'Закриваю голосове меню...', not_recognized: 'Не розпізнано.', saving: 'Збережено: ', new_entry: 'Введіть наступний продукт...' },
    ru: { welcome: 'Скажите: "ДОБАВИТЬ", "СПИСОК", "ЗАПАСЫ" или "EXIT"', listening: 'Слушаю...', add_mode: 'Открываю ввод...', list_mode: 'Открываю список...', stock_mode: 'Открываю запасы...', closing: 'Закрываю голосовое меню...', not_recognized: 'Не распознано.', saving: 'Сохранено: ', new_entry: 'Введите следующий продукт...' },
    zh: { welcome: '请说："添加", "列表", "库存" 或 "EXIT"', listening: '正在听...', add_mode: '打开输入...', list_mode: '打开列表...', stock_mode: '打开库存...', closing: '关闭语音菜单...', not_recognized: '无法识别。', saving: '已保存：', new_entry: '输入下一个产品...' },
    es: { welcome: 'Diga: "AÑADIR", "LISTA", "EXISTENCIAS" o "EXIT"', listening: 'Escuchando...', add_mode: 'Abriendo entrada...', list_mode: 'Abriendo lista...', stock_mode: 'Abriendo existencias...', closing: 'Cerrando menú de voz...', not_recognized: 'No reconocido.', saving: 'Guardado: ', new_entry: 'Ingrese el siguiente producto...' },
    pt: { welcome: 'Diga: "ADICIONAR", "LISTA", "ESTOQUE" ou "EXIT"', listening: 'Ouvindo...', add_mode: 'Abrindo entrada...', list_mode: 'Abrindo lista...', stock_mode: 'Abrindo estoque...', closing: 'Fechando menu de voz...', not_recognized: 'Não reconhecido.', saving: 'Salvo: ', new_entry: 'Insira o próximo produto...' },
    fr: { welcome: 'Dites: "AJOUTER", "LISTE", "STOCK" ou "EXIT"', listening: 'Écoute...', add_mode: 'Ouverture de la saisie...', list_mode: 'Ouverture de la liste...', stock_mode: 'Ouverture du stock...', closing: 'Fermeture du menu vocal...', not_recognized: 'Non reconnu.', saving: 'Enregistré: ', new_entry: 'Entrez le prochain produit...' }
};

const NUMBER_WORDS = {
    'nula': '0', 'jedan': '1', 'jedna': '1', 'jedno': '1',
    'dva': '2', 'dve': '2', 'tri': '3', 'četiri': '4', 'cetiri': '4',
    'pet': '5', 'šest': '6', 'sest': '6', 'sedam': '7', 'osam': '8',
    'devet': '9', 'deset': '10', 'sto': '100'
};

const UNIT_MAP = {
    'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg',
    'gram': 'g', 'grama': 'g', 'g': 'g',
    'litar': 'l', 'litara': 'l', 'l': 'l',
    'komad': 'kom', 'komada': 'kom', 'kom': 'kom',
    'paket': 'pak', 'paketa': 'pak', 'pak': 'pak'
};

const STORAGE_MAP = {
    'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
    'zamrzivač 1': 'Zamrzivač 1', 'zamrzivac 1': 'Zamrzivač 1',
    'zamrzivač 2': 'Zamrzivač 2', 'zamrzivac 2': 'Zamrzivač 2',
    'zamrzivač 3': 'Zamrzivač 3', 'zamrzivac 3': 'Zamrzivač 3',
    'frižider': 'Frižider', 'frizider': 'Frižider',
    'ostava': 'Ostava', 'špajz': 'Ostava'
};

const SPEECH_LANG_MAP = {
    sr: 'sr-RS', en: 'en-US', de: 'de-DE', hu: 'hu-HU',
    uk: 'uk-UA', ru: 'ru-RU', zh: 'zh-CN', es: 'es-ES',
    pt: 'pt-PT', fr: 'fr-FR'
};

// ============================================
// 2. POMOĆNE FUNKCIJE
// ============================================

function getCurrentLang() {
    return (typeof currentLang !== 'undefined' && currentLang) ? currentLang : 'sr';
}

function getMessage(key) {
    const lang = getCurrentLang();
    return (VOICE_MESSAGES[lang] && VOICE_MESSAGES[lang][key]) || VOICE_MESSAGES.sr[key] || '';
}

function getButtonLabel(action) {
    const lang = getCurrentLang();
    return (BUTTON_LABELS[lang] && BUTTON_LABELS[lang][action]) || action.toUpperCase();
}

function getVoiceCommands() {
    const lang = getCurrentLang();
    return VOICE_COMMANDS[lang] || VOICE_COMMANDS.sr;
}

function detectVoiceCommand(text) {
    if (!text) return null;
    const commands = getVoiceCommands();
    const lower = text.toLowerCase().trim();
    if (commands.close && commands.close.some(k => lower.includes(k.toLowerCase()))) {
        return 'close';
    }
    for (let [action, keywords] of Object.entries(commands)) {
        if (action === 'close') continue;
        for (let keyword of keywords) {
            if (lower.includes(keyword.toLowerCase())) {
                return action;
            }
        }
    }
    return null;
}

function showVoiceStatus(text, color = '#2196F3') {
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = text;
        statusEl.style.color = color;
    }
    console.log('[VOICE]', text);
}

function getNumber(word) {
    const w = word.toLowerCase().trim();
    if (NUMBER_WORDS[w] !== undefined) return NUMBER_WORDS[w];
    if (/^\d+(?:[.,]\d+)?$/.test(w)) return w.replace(',', '.');
    return null;
}

// ============================================
// 3. PARSIRANJE (TVOJ ORIGINAL)
// ============================================

function parseVoiceDataEntry(command) {
    if (!command) return null;
    console.log('🔍 PARSIRAM:', command);
    let text = command.toLowerCase()
        .replace(/^(šta|start|dodaj|unos|unesi|add|new|enter|adatbevitel|hinzufügen|neu|einfügen|додати|добавить|添加|añadir|adicionar|ajouter)\s*/i, '')
        .replace(/\b(grile|gril|green)\b/gi, 'grill')
        .trim();
    const words = text.split(/\s+/).filter(Boolean);
    let result = { product_name: '', piece: '1', quantity: '1', unit: 'kom', shelf_life: '6', storage: 'Zamrzivač 1' };
    let foundStorage = null, foundUnit = null;
    let unitIndex = -1, storageIndex = -1;
    for (let i = 0; i < words.length; i++) {
        let w = words[i];
        for (let key in STORAGE_MAP) {
            if (w.includes(key)) { foundStorage = STORAGE_MAP[key]; storageIndex = i; break; }
        }
        if (UNIT_MAP[w]) { foundUnit = UNIT_MAP[w]; unitIndex = i; }
    }
    let nameParts = [], numbers = [];
    const skipWords = new Set(['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima', 'i']);
    for (let i = 0; i < words.length; i++) {
        if (i === storageIndex || i === unitIndex || skipWords.has(words[i])) continue;
        let numVal = getNumber(words[i]);
        if (numVal !== null) { numbers.push(numVal); }
        else { nameParts.push(words[i]); }
    }
    if (numbers.length >= 3) {
        [result.piece, result.quantity, result.shelf_life] = numbers;
    } else if (numbers.length === 2) {
        if (parseFloat(numbers[1]) > 3 && !text.includes('kg')) {
            result.piece = result.quantity = numbers[0];
            result.shelf_life = numbers[1];
        } else {
            [result.piece, result.quantity] = numbers;
        }
    } else if (numbers.length === 1) {
        result.piece = result.quantity = numbers[0];
    }
    if (foundUnit) result.unit = foundUnit;
    if (foundStorage) result.storage = foundStorage;
    result.product_name = nameParts.join(' ').trim();
    if (!result.product_name) result.product_name = 'Proizvod';
    else result.product_name = result.product_name.charAt(0).toUpperCase() + result.product_name.slice(1);
    return result;
}

// ============================================
// 4. ČUVANJE PODATAKA (KORISTI TVOJE FUNKCIJE)
// ============================================

function sacuvajPodatke(data) {
    if (!data || !data.product_name || data.product_name === 'Proizvod') return false;
    
    if (!Array.isArray(window.inventory)) window.inventory = [];
    const existingIndex = window.inventory.findIndex(item => 
        item.productName && 
        item.productName.toLowerCase() === data.product_name.toLowerCase() &&
        item.unit === data.unit &&
        item.storage === data.storage
    );
    if (existingIndex > -1) {
        const item = window.inventory[existingIndex];
        item.quantity = parseFloat(item.quantity) + parseFloat(data.quantity);
        item.piece = parseFloat(item.piece) + parseFloat(data.piece);
        item.shelfLife = parseInt(data.shelf_life) || 6;
        item.dateAdded = new Date().toISOString();
        showVoiceStatus(`✅ Sabrano: ${data.product_name} (ukupno ${item.quantity} ${data.unit})`, '#4CAF50');
    } else {
        window.inventory.push({
            id: Date.now(),
            productName: data.product_name,
            piece: parseFloat(data.piece) || 1,
            quantity: parseFloat(data.quantity) || 1,
            unit: data.unit || 'kom',
            shelfLife: parseInt(data.shelf_life) || 6,
            storage: data.storage || 'Zamrzivač 1',
            dateAdded: new Date().toISOString()
        });
        showVoiceStatus(`✅ ${getMessage('saving')} ${data.product_name}`, '#4CAF50');
    }
    refreshDisplay();
    return true;
}

function popuniFormuPodacima(data) {
    if (!data) return;
    const mapping = {
        productInput: data.product_name,
        pieceInput: data.piece,
        quantityInput: data.quantity,
        shelfLifeInput: data.shelf_life
    };
    Object.entries(mapping).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) {
            el.value = val;
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
}

function clearForm() {
    ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

function refreshDisplay() {
    if (typeof prikaziSveUnose === 'function') prikaziSveUnose();
    if (typeof renderInventory === 'function') renderInventory();
}

// ============================================
// 5. EKRANI - KORISTI TVOJE ORIGINALNE FUNKCIJE
// ============================================

function showDataEntry() {
    console.log('📝 showDataEntry POZVANA!');
    // NE gasi mikrofon!
    // Prvo prikaži mainScreen
    if (typeof showScreen === 'function') {
        showScreen('mainScreen');
    } else {
        document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
        const main = document.getElementById('mainScreen');
        if (main) main.style.display = 'flex';
    }
    // Pozovi tvoju renderDataEntry (ako postoji) ili fallback
    if (typeof renderDataEntry === 'function') {
        renderDataEntry('');
    } else {
        // Fallback - ubaci formu u mainContent
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <h1 class="title">📝 ${getMessage('add_mode') || 'Unos proizvoda'}</h1>
                <div id="dataEntryForm">
                    <div class="row"><label for="productInput">Proizvod:</label><input type="text" id="productInput" placeholder="Naziv proizvoda..." autofocus></div>
                    <div class="row"><label for="pieceInput">Komada:</label><input type="number" id="pieceInput" value="1" min="1"></div>
                    <div class="row"><label for="quantityInput">Količina:</label><input type="number" id="quantityInput" value="1" min="0.01" step="0.01"></div>
                    <div class="row"><label for="unitSelect">Jedinica:</label><select id="unitSelect"><option value="kom">kom</option><option value="kg">kg</option><option value="g">g</option><option value="l">l</option><option value="pak">pak</option></select></div>
                    <div class="row"><label for="shelfLifeInput">Rok (meseci):</label><input type="number" id="shelfLifeInput" value="6" min="1" max="60"></div>
                    <div class="row"><label for="storageSelect">Lokacija:</label><select id="storageSelect"><option value="Zamrzivač 1">Zamrzivač 1</option><option value="Zamrzivač 2">Zamrzivač 2</option><option value="Zamrzivač 3">Zamrzivač 3</option><option value="Frižider">Frižider</option><option value="Ostava">Ostava</option></select></div>
                    <div class="btn-group"><button class="btn-save" onclick="saveProduct()">💾 Sačuvaj</button><button class="btn-cancel" onclick="cancelProduct()">✖ Otkaži</button></div>
                    <div id="voiceStatusInline" style="margin-top:20px; padding:15px; background:#f0f0f0; border-radius:12px; font-size:18px; text-align:center; color:#1a237e;">🎤 Mikrofon je i dalje aktivan! Reci naziv proizvoda...</div>
                </div>
            `;
            setTimeout(() => {
                const input = document.getElementById('productInput');
                if (input) input.focus();
            }, 300);
        }
    }
    clearForm();
    showVoiceStatus('📝 Unos otvoren', '#4CAF50');
}

function otvoriSpisakEkran() {
    console.log('📋 otvoriSpisakEkran POZVAN!');
    // Prikaži mainScreen
    if (typeof showScreen === 'function') {
        showScreen('mainScreen');
    } else {
        document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
        const main = document.getElementById('mainScreen');
        if (main) main.style.display = 'flex';
    }
    // Pozovi renderShoppingList
    if (typeof renderShoppingList === 'function') {
        renderShoppingList();
    } else {
        // Fallback
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `<h1 class="title">🛒 Spisak</h1><p style="text-align:center;font-size:20px;color:#999;padding:40px 0;">Spisak je prazan.</p><div style="text-align:center;margin-top:20px;"><button class="btn btn-green" onclick="showDataEntry()" style="padding:15px 40px;font-size:20px;">➕ Dodaj proizvod</button></div>`;
        }
    }
    showVoiceStatus('📋 Spisak otvoren', '#4CAF50');
}

function otvoriZaliheEkran() {
    console.log('📦 otvoriZaliheEkran POZVAN!');
    // Prikaži mainScreen
    if (typeof showScreen === 'function') {
        showScreen('mainScreen');
    } else {
        document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
        const main = document.getElementById('mainScreen');
        if (main) main.style.display = 'flex';
    }
    // Pozovi renderInventory
    if (typeof renderInventory === 'function') {
        renderInventory();
    } else {
        // Fallback
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `<h1 class="title">📦 Zalihe</h1><p style="text-align:center;font-size:20px;color:#999;padding:40px 0;">Zalihe su prazne.</p><div style="text-align:center;margin-top:20px;"><button class="btn btn-green" onclick="showDataEntry()" style="padding:15px 40px;font-size:20px;">➕ Dodaj proizvod</button></div>`;
        }
    }
    showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
}

function goBackFromVoice() {
    stopVoiceRecognition();
    if (typeof showScreen === 'function') {
        showScreen('choiceScreen');
    } else {
        document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
        const choice = document.getElementById('choiceScreen');
        if (choice) choice.style.display = 'flex';
    }
    if (typeof updateHeaderLanguage === 'function') updateHeaderLanguage();
    if (typeof updateInterfaceLanguage === 'function') updateInterfaceLanguage();
    showVoiceStatus('⏹️ Povratak', '#aaa');
}

// ============================================
// 6. MOTOR ZA GLASOVNE KOMANDE
// ============================================

function processVoiceInput(buffer) {
    if (!buffer || VoiceState.isProcessing) return;
    const lower = buffer.toLowerCase().trim();
    VoiceState.isProcessing = true;
    console.log('🎤 Procesiram:', buffer);

    // PLUS
    if (lower.includes('plus')) {
        const parts = buffer.split(/\bplus\b/i);
        const data = parseVoiceDataEntry(parts[0]);
        if (data && sacuvajPodatke(data)) {
            popuniFormuPodacima(data);
            setTimeout(() => {
                clearForm();
                showVoiceStatus(`✅ ${getMessage('saving')} ${data.product_name}. ${getMessage('new_entry')}`, '#4CAF50');
                VoiceState.isProcessing = false;
            }, 800);
        } else {
            VoiceState.isProcessing = false;
        }
        VoiceState.activeBuffer = '';
        return;
    }

    // END / KRAJ / GOTOVO
    if (lower.includes('end') || lower.includes('kraj') || lower.includes('gotovo')) {
        const textToParse = buffer.replace(/\b(end|kraj|gotovo)\b/gi, '');
        const data = parseVoiceDataEntry(textToParse);
        if (data) sacuvajPodatke(data);
        stopVoiceRecognition();
        // OTVORI ZALIHE KORIŠĆENJEM TVOJE FUNKCIJE
        setTimeout(() => {
            otvoriZaliheEkran();
        }, 300);
        VoiceState.isProcessing = false;
        VoiceState.activeBuffer = '';
        return;
    }

    // Ostale komande
    const cmd = detectVoiceCommand(buffer);
    if (cmd) {
        if (cmd === 'add') {
            showDataEntry();
        } else if (cmd === 'list') {
            otvoriSpisakEkran();
        } else if (cmd === 'stock') {
            otvoriZaliheEkran();
        } else if (cmd === 'close') {
            goBackFromVoice();
        }
    } else {
        // Pokušaj sa direktnim rečima (zalihe, spisak, unos)
        if (lower.includes('zalihe') || lower.includes('zaliha') || lower.includes('stock')) {
            otvoriZaliheEkran();
        } else if (lower.includes('spisak') || lower.includes('lista') || lower.includes('list')) {
            otvoriSpisakEkran();
        } else if (lower.includes('unos') || lower.includes('unesi') || lower.includes('dodaj') || lower.includes('add')) {
            showDataEntry();
        } else if (lower.includes('exit') || lower.includes('izlaz') || lower.includes('close')) {
            goBackFromVoice();
        } else {
            showVoiceStatus(`❌ Nisam prepoznao: "${buffer}". Reci: UNOS, SPISAK, ZALIHE ili EXIT`, '#f44336');
        }
    }
    VoiceState.isProcessing = false;
    VoiceState.activeBuffer = '';
}

// ============================================
// 7. START / STOP
// ============================================

function startVoiceRecognition() {
    if (VoiceState.recognition) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showVoiceStatus('❌ Browser ne podržava glasovno prepoznavanje.', '#f44336');
        return;
    }
    const rec = new SpeechRecognition();
    const lang = getCurrentLang();
    rec.lang = SPEECH_LANG_MAP[lang] || 'sr-RS';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onstart = () => {
        showVoiceStatus('🎤 ' + getMessage('welcome'), '#2196F3');
        VoiceState.activeBuffer = '';
    };
    rec.onresult = (e) => {
        let interimText = '', finalChunk = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) finalChunk += e.results[i][0].transcript;
            else interimText += e.results[i][0].transcript;
        }
        if (finalChunk) VoiceState.activeBuffer += (VoiceState.activeBuffer ? ' ' : '') + finalChunk;
        showVoiceStatus('🎤 ' + getMessage('listening') + ' "' + (VoiceState.activeBuffer || interimText) + '"', '#FFD700');
        clearTimeout(VoiceState.speechTimeout);
        VoiceState.speechTimeout = setTimeout(() => {
            processVoiceInput(VoiceState.activeBuffer);
        }, 500);
    };
    rec.onerror = (e) => {
        console.warn('Speech Engine Greška:', e.error);
        if (e.error === 'not-allowed') showVoiceStatus('❌ Dozvolite pristup mikrofonu.', '#f44336');
    };
    rec.onend = () => {
        VoiceState.recognition = null;
        if (VoiceState.isVoiceInput) {
            VoiceState.restartTimer = setTimeout(startVoiceRecognition, 1000);
        }
    };
    VoiceState.recognition = rec;
    VoiceState.isVoiceInput = true;
    rec.start();
}

function stopVoiceRecognition() {
    VoiceState.isVoiceInput = false;
    clearTimeout(VoiceState.restartTimer);
    clearTimeout(VoiceState.speechTimeout);
    if (VoiceState.recognition) {
        try { VoiceState.recognition.stop(); } catch(e) {}
        VoiceState.recognition = null;
    }
    VoiceState.activeBuffer = '';
    VoiceState.isProcessing = false;
}

// ============================================
// 8. VOICE COMMAND ZA DUGMAD NA 4. EKRANU
// ============================================

function voiceCommand(action) {
    console.log('🎤 voiceCommand:', action);
    if (action === 'inventory' || action === 'zalihe') {
        otvoriZaliheEkran();
    } else if (action === 'shopping' || action === 'spisak') {
        otvoriSpisakEkran();
    } else if (action === 'add' || action === 'unos') {
        showDataEntry();
    } else if (action === 'exit') {
        goBackFromVoice();
    }
}

// ============================================
// 9. GLOBALNI IZVOZ
// ============================================

window.startVoiceRecognition = startVoiceRecognition;
window.stopVoiceRecognition = stopVoiceRecognition;
window.goBackFromVoice = goBackFromVoice;
window.showDataEntry = showDataEntry;
window.otvoriZaliheEkran = otvoriZaliheEkran;
window.otvoriSpisakEkran = otvoriSpisakEkran;
window.voiceCommand = voiceCommand;
window.parseVoiceDataEntry = parseVoiceDataEntry;
window.sacuvajPodatke = sacuvajPodatke;
window.getCurrentLang = getCurrentLang;
window.getMessage = getMessage;
window.VOICE_COMMANDS = VOICE_COMMANDS;
window.VOICE_MESSAGES = VOICE_MESSAGES;
window.BUTTON_LABELS = BUTTON_LABELS;

console.log('✅ Voice Commands učitane!');
