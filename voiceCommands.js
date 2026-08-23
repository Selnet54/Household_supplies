// ============================================
// VOICE COMMANDS - KONAČNA VERZIJA v3.0
// SA PODRŠKOM ZA SVE JEZIKE
// ============================================

// ⭐ SPREČI DUPLO UČITAVANJE
if (window._voiceCommandsLoaded) {
    console.log('⚠️ Voice commands već učitani, preskačem...');
} else {
    window._voiceCommandsLoaded = true;
}

let activeBuffer = ''; 
let recognition = null;
let lastSavedData = null;
let isProcessingCommand = false;
let END_AKTIVAN = false;
let isVoiceInput = false;
let ALLOW_INVENTORY_OPEN = false;
let micRestartTimer = null;

// ============================================
// 1. POMOĆNE FUNKCIJE
// ============================================

function hideVoiceMenu() {
    const voiceMenu = document.getElementById('voiceMenuScreen');
    if (voiceMenu) {
        voiceMenu.style.display = 'none';
        voiceMenu.classList.remove('active');
    }
    const choiceScreen = document.getElementById('choiceScreen');
    if (choiceScreen) {
        choiceScreen.style.display = 'none';
        choiceScreen.classList.remove('active');
    }
}

function showVoiceStatus(text, color) {
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = text;
        if (color) statusEl.style.color = color;
    }
    console.log('[VOICE]', text);
}

// ============================================
// 2. BROJEVI NA RAZLIČITIM JEZICIMA
// ============================================

const NUMBER_WORDS = {
    // Srpski
    'nula': '0', 'jedan': '1', 'jedna': '1', 'jedno': '1',
    'dva': '2', 'dve': '2', 'tri': '3', 'četiri': '4',
    'cetiri': '4', 'pet': '5', 'šest': '6', 'sest': '6',
    'sedam': '7', 'osam': '8', 'devet': '9', 'deset': '10',
    'jedanaest': '11', 'dvanaest': '12', 'trinaest': '13',
    'četrnaest': '14', 'cetrnaest': '14', 'petnaest': '15',
    'šesnaest': '16', 'sesnaest': '16', 'sedamnaest': '17',
    'osamnaest': '18', 'devetnaest': '19', 'dvadeset': '20',
    'trideset': '30', 'četrdeset': '40', 'cetrdeset': '40',
    'pedeset': '50', 'šezdeset': '60', 'sezdeset': '60',
    'sedamdeset': '70', 'osamdeset': '80', 'devedeset': '90',
    'sto': '100',
    
    // Engleski
    'zero': '0', 'one': '1', 'two': '2', 'three': '3',
    'four': '4', 'five': '5', 'six': '6', 'seven': '7',
    'eight': '8', 'nine': '9', 'ten': '10',
    'eleven': '11', 'twelve': '12', 'thirteen': '13',
    'fourteen': '14', 'fifteen': '15', 'sixteen': '16',
    'seventeen': '17', 'eighteen': '18', 'nineteen': '19',
    'twenty': '20', 'thirty': '30', 'forty': '40',
    'fifty': '50', 'sixty': '60', 'seventy': '70',
    'eighty': '80', 'ninety': '90', 'hundred': '100',
    
    // Nemački
    'null': '0', 'eins': '1', 'zwei': '2', 'drei': '3',
    'vier': '4', 'fünf': '5', 'funf': '5', 'sechs': '6',
    'sieben': '7', 'acht': '8', 'neun': '9', 'zehn': '10',
    'elf': '11', 'zwölf': '12', 'z wolf': '12',
    'dreizehn': '13', 'vierzehn': '14', 'fünfzehn': '15',
    'funfzehn': '15', 'sechzehn': '16', 'siebzehn': '17',
    'achtzehn': '18', 'neunzehn': '19', 'zwanzig': '20',
    'dreißig': '30', 'dreissig': '30', 'vierzig': '40',
    'fünfzig': '50', 'funfzig': '50', 'sechzig': '60',
    'siebzig': '70', 'achtzig': '80', 'neunzig': '90',
    'hundert': '100',
    
    // Mađarski
    'nulla': '0', 'egy': '1', 'kettő': '2', 'ketto': '2',
    'három': '3', 'harom': '3', 'négy': '4', 'negy': '4',
    'öt': '5', 'ot': '5', 'hat': '6', 'hét': '7', 'het': '7',
    'nyolc': '8', 'kilenc': '9', 'tíz': '10', 'tiz': '10',
    'tizenegy': '11', 'tizenkettő': '12', 'tizenketto': '12',
    'tizenhárom': '13', 'tizenharom': '13', 'tizennégy': '14',
    'tizenegy': '14', 'tizenöt': '15', 'tizenot': '15',
    'tizenhat': '16', 'tizenhét': '17', 'tizenhet': '17',
    'tizennyolc': '18', 'tizenkilenc': '19', 'húsz': '20',
    'husz': '20', 'harminc': '30', 'negyven': '40',
    'ötven': '50', 'otven': '50', 'hatvan': '60',
    'hetven': '70', 'nyolcvan': '80', 'kilencven': '90',
    'száz': '100', 'szaz': '100',
    
    // Ukrajinski
    'нуль': '0', 'один': '1', 'два': '2', 'три': '3',
    'чотири': '4', 'chotiri': '4', 'п\'ять': '5', 'pyat': '5',
    'шість': '6', 'shist': '6', 'сім': '7', 'sim': '7',
    'вісім': '8', 'visim': '8', 'дев\'ять': '9', 'devyat': '9',
    'десять': '10', 'desyat': '10',
    
    // Ruski
    'ноль': '0', 'один': '1', 'два': '2', 'три': '3',
    'четыре': '4', 'chetyre': '4', 'пять': '5', 'pyat': '5',
    'шесть': '6', 'shest': '6', 'семь': '7', 'sem': '7',
    'восемь': '8', 'vosem': '8', 'девять': '9', 'devyat': '9',
    'десять': '10', 'desyat': '10',
    
    // Kineski
    '零': '0', '一': '1', '二': '2', '三': '3',
    '四': '4', '五': '5', '六': '6', '七': '7',
    '八': '8', '九': '9', '十': '10',
    '十一': '11', '十二': '12', '十三': '13',
    '十四': '14', '十五': '15', '十六': '16',
    '十七': '17', '十八': '18', '十九': '19',
    '二十': '20', '三十': '30', '四十': '40',
    '五十': '50', '六十': '60', '七十': '70',
    '八十': '80', '九十': '90', '一百': '100',
    '百': '100',
    
    // Španski
    'cero': '0', 'uno': '1', 'dos': '2', 'tres': '3',
    'cuatro': '4', 'cinco': '5', 'seis': '6', 'siete': '7',
    'ocho': '8', 'nueve': '9', 'diez': '10',
    'once': '11', 'doce': '12', 'trece': '13',
    'catorce': '14', 'quince': '15', 'dieciséis': '16',
    'dieciseis': '16', 'diecisiete': '17', 'dieciocho': '18',
    'diecinueve': '19', 'veinte': '20', 'treinta': '30',
    'cuarenta': '40', 'cincuenta': '50', 'sesenta': '60',
    'setenta': '70', 'ochenta': '80', 'noventa': '90',
    'cien': '100', 'ciento': '100',
    
    // Portugalski
    'zero': '0', 'um': '1', 'dois': '2', 'três': '3',
    'tres': '3', 'quatro': '4', 'cinco': '5', 'seis': '6',
    'sete': '7', 'oito': '8', 'nove': '9', 'dez': '10',
    'onze': '11', 'doze': '12', 'treze': '13',
    'catorze': '14', 'quinze': '15', 'dezesseis': '16',
    'dezessete': '17', 'dezoito': '18', 'dezenove': '19',
    'vinte': '20', 'trinta': '30', 'quarenta': '40',
    'cinquenta': '50', 'sessenta': '60', 'setenta': '70',
    'oitenta': '80', 'noventa': '90', 'cem': '100',
    'cento': '100',
    
    // Francuski
    'zéro': '0', 'zero': '0', 'un': '1', 'deux': '2',
    'trois': '3', 'quatre': '4', 'cinq': '5', 'six': '6',
    'sept': '7', 'huit': '8', 'neuf': '9', 'dix': '10',
    'onze': '11', 'douze': '12', 'treize': '13',
    'quatorze': '14', 'quinze': '15', 'seize': '16',
    'dix-sept': '17', 'dix-huit': '18', 'dix-neuf': '19',
    'vingt': '20', 'trente': '30', 'quarante': '40',
    'cinquante': '50', 'soixante': '60', 'soixante-dix': '70',
    'quatre-vingts': '80', 'quatre-vingt-dix': '90',
    'cent': '100'
};

function getNumber(word) {
    const w = word.toLowerCase().trim();
    if (NUMBER_WORDS[w] !== undefined) return NUMBER_WORDS[w];
    if (/^\d+(?:[.,]\d+)?$/.test(w)) return w.replace(',', '.');
    return null;
}

// ============================================
// 3. JEDINICE NA RAZLIČITIM JEZICIMA
// ============================================

const UNIT_MAP = {
    // Srpski
    'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg',
    'gram': 'g', 'grama': 'g', 'g': 'g',
    'litar': 'l', 'litara': 'l', 'l': 'l',
    'komad': 'kom', 'komada': 'kom', 'kom': 'kom',
    'paket': 'pak', 'paketa': 'pak', 'pak': 'pak',
    
    // Engleski
    'kilogram': 'kg', 'kilograms': 'kg', 'kilo': 'kg',
    'gram': 'g', 'grams': 'g',
    'liter': 'l', 'liters': 'l', 'litre': 'l', 'litres': 'l',
    'piece': 'kom', 'pieces': 'kom',
    'pack': 'pak', 'packs': 'pak', 'package': 'pak',
    
    // Nemački
    'kilogramm': 'kg', 'kilo': 'kg',
    'gramm': 'g',
    'liter': 'l',
    'stück': 'kom', 'stuck': 'kom',
    'paket': 'pak', 'packung': 'pak',
    
    // Mađarski
    'kilogramm': 'kg',
    'gramm': 'g',
    'liter': 'l',
    'darab': 'kom', 'db': 'kom',
    'csomag': 'pak',
    
    // Ukrajinski
    'кілограм': 'kg', 'kilogram': 'kg', 'кг': 'kg',
    'грам': 'g', 'gram': 'g', 'г': 'g',
    'літр': 'l', 'litr': 'l', 'л': 'l',
    'штука': 'kom', 'shtuka': 'kom', 'шт': 'kom',
    'пакет': 'pak', 'paket': 'pak',
    
    // Ruski
    'килограмм': 'kg', 'kilogramm': 'kg', 'кг': 'kg',
    'грамм': 'g', 'gramm': 'g', 'г': 'g',
    'литр': 'l', 'litr': 'l', 'л': 'l',
    'штука': 'kom', 'shtuka': 'kom', 'шт': 'kom',
    'пакет': 'pak', 'paket': 'pak',
    
    // Kineski
    '公斤': 'kg', '千克': 'kg', 'kg': 'kg',
    '克': 'g', 'g': 'g',
    '升': 'l', 'l': 'l',
    '件': 'kom', '个': 'kom',
    '包': 'pak', '袋': 'pak',
    
    // Španski
    'kilogramo': 'kg', 'kilo': 'kg',
    'gramo': 'g',
    'litro': 'l',
    'pieza': 'kom', 'unidad': 'kom',
    'paquete': 'pak',
    
    // Portugalski
    'quilograma': 'kg', 'quilo': 'kg',
    'grama': 'g',
    'litro': 'l',
    'peça': 'kom', 'peca': 'kom', 'unidade': 'kom',
    'pacote': 'pak',
    
    // Francuski
    'kilogramme': 'kg', 'kilo': 'kg',
    'gramme': 'g',
    'litre': 'l',
    'pièce': 'kom', 'piece': 'kom', 'unité': 'kom',
    'paquet': 'pak'
};

const STORAGE_MAP = {
    'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
    'zamrzivač 1': 'Zamrzivač 1', 'zamrzivac 1': 'Zamrzivač 1',
    'zamrzivač 2': 'Zamrzivač 2', 'zamrzivac 2': 'Zamrzivač 2',
    'zamrzivač 3': 'Zamrzivač 3', 'zamrzivac 3': 'Zamrzivač 3',
    'frižider': 'Frižider', 'frizider': 'Frižider',
    'ostava': 'Ostava', 'špajz': 'Ostava',
    // Engleski
    'freezer': 'Zamrzivač 1', 'freezer 1': 'Zamrzivač 1',
    'freezer 2': 'Zamrzivač 2', 'freezer 3': 'Zamrzivač 3',
    'refrigerator': 'Frižider', 'fridge': 'Frižider',
    'pantry': 'Ostava',
    // Nemački
    'gefrierschrank': 'Zamrzivač 1',
    'kühlschrank': 'Frižider',
    'vorratskammer': 'Ostava',
    // Mađarski
    'mélyhűtő': 'Zamrzivač 1', 'fagyasztó': 'Zamrzivač 1',
    'hűtőszekrény': 'Frižider', 'hűtő': 'Frižider',
    'spájz': 'Ostava',
    // Ukrajinski
    'морозилка': 'Zamrzivač 1',
    'холодильник': 'Frižider',
    'комора': 'Ostava',
    // Ruski
    'морозилка': 'Zamrzivač 1',
    'холодильник': 'Frižider',
    'кладовая': 'Ostava',
    // Kineski
    '冷冻柜': 'Zamrzivač 1', '冰箱': 'Frižider', '储藏室': 'Ostava',
    // Španski
    'congelador': 'Zamrzivač 1',
    'refrigerador': 'Frižider',
    'despensa': 'Ostava',
    // Portugalski
    'congelador': 'Zamrzivač 1',
    'geladeira': 'Frižider',
    'despensa': 'Ostava',
    // Francuski
    'congélateur': 'Zamrzivač 1',
    'réfrigérateur': 'Frižider',
    'garde-manger': 'Ostava'
};

function getUnit(word) {
    return UNIT_MAP[word.toLowerCase()] || null;
}

function getStorage(word) {
    const w = word.toLowerCase();
    for (let key in STORAGE_MAP) {
        if (w.includes(key) || key.includes(w)) {
            return STORAGE_MAP[key];
        }
    }
    return null;
}

// ============================================
// 4. PARSIRANJE SA VIŠEJEZIČNOM PODRŠKOM
// ============================================

function parseVoiceDataEntry(command) {
    console.log('🔍 PARSIRAM:', command);
    
    let text = command
        .replace(/^unos\s*/i, '')
        .replace(/^start\s*/i, '')
        .replace(/^grile\s*/i, 'grill ')
        .replace(/^gril\s*/i, 'grill ')
        .replace(/\bGreen\b/gi, 'grill')
        .replace(/\bgreen\b/gi, 'grill')
        .trim();
    
    let words = text.split(/\s+/).map(s => s.trim()).filter(Boolean);
    console.log('📝 REČI:', words);
    
    let result = {
        product_name: '',
        piece: '1',
        quantity: '1',
        unit: 'kom',
        shelf_life: '12',
        storage: 'Zamrzivač 1'
    };
    
    let foundStorage = null;
    let foundUnit = null;
    let unitIndex = -1;
    let storageIndex = -1;
    let numbers = [];
    let nameParts = [];
    let skipWords = ['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima', 'i', 'and', 'und', 'és', 'та', 'и', '和', 'y', 'e', 'et'];
    
    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        
        let storageMatch = getStorage(w);
        if (storageMatch) {
            foundStorage = storageMatch;
            storageIndex = i;
            console.log('🏠 Pronađeno skladište:', foundStorage);
        }
        
        let unitMatch = getUnit(w);
        if (unitMatch) {
            foundUnit = unitMatch;
            unitIndex = i;
            console.log('📏 Pronađena jedinica:', foundUnit);
        }
    }
    
    if (text.includes('gram') || text.includes('grama') || text.includes('gramm') || text.includes('грам') || text.includes('克')) {
        foundUnit = 'g';
        console.log('🔍 Spec. slučaj: gram -> jedinica = g');
    } else if (text.includes('kilogram') || text.includes('kg') || text.includes('kilo') || text.includes('公斤') || text.includes('килограм')) {
        foundUnit = 'kg';
        console.log('🔍 Spec. slučaj: kilogram -> jedinica = kg');
    } else if (text.includes('litar') || text.includes('liter') || text.includes('litre') || text.includes('升') || text.includes('літр') || text.includes('литр')) {
        foundUnit = 'l';
        console.log('🔍 Spec. slučaj: litar -> jedinica = l');
    }
    
    for (let i = 0; i < words.length; i++) {
        let w = words[i].toLowerCase();
        let originalW = words[i];
        
        if (i === storageIndex || i === unitIndex) {
            continue;
        }
        
        if (skipWords.includes(w)) {
            continue;
        }
        
        let numVal = getNumber(w);
        if (numVal !== null) {
            numbers.push(numVal);
            console.log('🔢 Broj pronađen:', numVal);
            continue;
        }
        
        nameParts.push(originalW);
    }
    
    console.log('📊 Brojevi:', numbers);
    console.log('📊 Naziv delovi:', nameParts);
    
    if (foundUnit === 'kg' || foundUnit === 'g') {
        if (numbers.length >= 2) {
            result.piece = numbers[0];
            result.quantity = numbers[1];
            console.log('📦 kg/g: komad=' + numbers[0] + ', količina=' + numbers[1] + foundUnit);
        } else if (numbers.length === 1) {
            result.piece = '0';
            result.quantity = numbers[0];
            console.log('📦 kg/g: komad=0, količina=' + numbers[0] + foundUnit);
        }
    } else if (foundUnit === 'l') {
        if (numbers.length >= 2) {
            result.piece = numbers[0];
            result.quantity = numbers[1];
            console.log('📦 l: komad=' + numbers[0] + ', količina=' + numbers[1] + 'l');
        } else if (numbers.length === 1) {
            result.piece = '0';
            result.quantity = numbers[0];
            console.log('📦 l: komad=0, količina=' + numbers[0] + 'l');
        }
    } else {
        if (numbers.length >= 2) {
            result.piece = numbers[0];
            result.quantity = numbers[1];
            console.log('📦 kom: komad=' + numbers[0] + ', količina=' + numbers[1]);
        } else if (numbers.length === 1) {
            result.piece = numbers[0];
            result.quantity = numbers[0];
            console.log('📦 kom: komad=' + numbers[0] + ', količina=' + numbers[0]);
        }
    }
    
    let rokPronadjen = false;
    
    let meseciMatch = text.match(/(\d+)\s*(meseci|months|monate|hónap|місяців|месяцев|个月|meses|meses|mois)/i);
    if (meseciMatch) {
        result.shelf_life = meseciMatch[1];
        rokPronadjen = true;
        console.log('🔍 Pronađeno "' + meseciMatch[1] + ' meseci" -> rok = ' + meseciMatch[1]);
    }
    
    if (!rokPronadjen && numbers.length >= 3) {
        result.shelf_life = numbers[2];
        rokPronadjen = true;
        console.log('🔍 Treći broj -> rok =', numbers[2]);
    }
    
    let cleanNameParts = nameParts.filter(part => {
        return !/^\d+$/.test(part);
    });
    result.product_name = cleanNameParts.join(' ').trim() || 'Proizvod';
    
    if (foundUnit) {
        result.unit = foundUnit;
        console.log('✅ Jedinica postavljena na:', foundUnit);
    } else {
        result.unit = 'kom';
        console.log('⚠️ Nema jedinice, ostavljam: kom');
    }
    
    if (foundStorage) {
        result.storage = foundStorage;
        console.log('✅ Skladište postavljeno na:', foundStorage);
    } else {
        result.storage = 'Zamrzivač 1';
        console.log('⚠️ Nema skladišta, ostavljam: Zamrzivač 1');
    }
    
    let gramMatches = text.match(/\b(500|700|800|900|1000)\b/);
    if (gramMatches && (text.includes('gram') || text.includes('grama') || text.includes('грам') || text.includes('克'))) {
        result.unit = 'g';
        result.quantity = gramMatches[1];
        if (result.piece === '1' || result.piece === '0') {
            result.piece = '0';
        }
        console.log('🔍 Grami detektovani -> jedinica = g, količina = ' + gramMatches[1]);
    }
    
    console.log('✅ PARSIRANO:', result);
    return result;
}

// ============================================
// 5. POPUNJAVANJE FORME
// ============================================

function popuniFormuPodacima(data) {
    console.log('📝 Popunjavam formu:', data);
    
    // Osiguraj da je forma vidljiva
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        mainScreen.classList.add('active');
    }
    
    setTimeout(() => {
        const productInput = document.getElementById('productInput');
        if (productInput) {
            productInput.value = data.product_name || '';
            productInput.dispatchEvent(new Event('input', { bubbles: true }));
            productInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ Naziv postavljen:', productInput.value);
        }
        
        const pieceInput = document.getElementById('pieceInput');
        if (pieceInput) {
            pieceInput.value = data.piece || '1';
            pieceInput.dispatchEvent(new Event('input', { bubbles: true }));
            pieceInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ Komad postavljen:', pieceInput.value);
        }
        
        const quantityInput = document.getElementById('quantityInput');
        if (quantityInput) {
            quantityInput.value = data.quantity || '1';
            quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
            quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ Količina postavljena:', quantityInput.value);
        }
        
        const shelfLifeInput = document.getElementById('shelfLifeInput');
        if (shelfLifeInput) {
            shelfLifeInput.value = data.shelf_life || '12';
            shelfLifeInput.dispatchEvent(new Event('input', { bubbles: true }));
            shelfLifeInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ Rok postavljen:', shelfLifeInput.value);
        }
        
        const unitSelect = document.getElementById('unitSelect');
        if (unitSelect && data.unit) {
            for (let option of unitSelect.options) {
                if (option.value === data.unit || option.text.toLowerCase().includes(data.unit)) {
                    option.selected = true;
                    unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log('✅ Jedinica postavljena:', unitSelect.value);
                    break;
                }
            }
        }
        
        const storageSelect = document.getElementById('storageSelect');
        if (storageSelect && data.storage) {
            for (let option of storageSelect.options) {
                if (option.value === data.storage || option.text.includes(data.storage)) {
                    option.selected = true;
                    storageSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log('✅ Skladište postavljeno:', storageSelect.value);
                    break;
                }
            }
        }
        
        if (typeof updateExpiryDate === 'function') {
            try { updateExpiryDate(); } catch(e) {}
        }
        
        showVoiceStatus(`✅ Uneto: ${data.product_name} (${data.quantity} ${data.unit})`, '#4CAF50');
    }, 200);
}

// ============================================
// 6. ČUVANJE PODATAKA
// ============================================

function sacuvajPodatke(data) {
    console.log('💾 Čuvam podatke:', data);
    
    ALLOW_INVENTORY_OPEN = false;
    END_AKTIVAN = false;
    
    isVoiceInput = true;
    window._isVoiceInput = true;
    
    const originalShowModernAlert = window.showModernAlert;
    window.showModernAlert = function() {
        console.log('⛔ POP-UP ZABRANJEN (voice input)');
        return;
    };
    
    const originalAlert = window.alert;
    window.alert = function() {
        console.log('⛔ ALERT ZABRANJEN (voice input)');
        return;
    };
    
    let saved = false;
    
    popuniFormuPodacima(data);
    
    setTimeout(() => {
        if (typeof saveProduct === 'function') {
            try { 
                saveProduct(); 
                saved = true; 
                console.log('✅ saveProduct uspešan!'); 
            } catch(e) {
                console.warn('saveProduct greška:', e);
            }
        }
        
        if (!saved) {
            try {
                const zalihe = JSON.parse(localStorage.getItem('zalihe') || '[]');
                const newItem = {
                    id: Date.now(),
                    product_name: data.product_name,
                    piece: parseInt(data.piece) || 1,
                    quantity: parseFloat(data.quantity) || 1,
                    unit: data.unit || 'kom',
                    shelf_life_months: parseInt(data.shelf_life) || 12,
                    storage_location: data.storage || 'Zamrzivač 1',
                    entry_date: new Date().toISOString().split('T')[0],
                    isNew: true
                };
                zalihe.push(newItem);
                localStorage.setItem('zalihe', JSON.stringify(zalihe));
                saved = true;
                console.log('✅ Direktan upis u localStorage uspešan!');
            } catch(e) {
                console.warn('localStorage greška:', e);
            }
        }
        
        setTimeout(() => {
            window.showModernAlert = originalShowModernAlert;
            window.alert = originalAlert;
        }, 1000);
        
        if (saved) {
            showVoiceStatus(`✅ Sačuvano: ${data.product_name}`, '#4CAF50');
            console.log('✅ Podaci sačuvani!');
            
            setTimeout(() => {
                if (typeof prikaziSveUnose === 'function') {
                    try { 
                        prikaziSveUnose(); 
                        console.log('✅ Pregled unosa osvežen');
                    } catch(e) {
                        console.warn('prikaziSveUnose greška:', e);
                    }
                }
                console.log('✅ Podaci osveženi');
            }, 200);
            
        } else {
            console.error('❌ Greška pri čuvanju!');
            showVoiceStatus('❌ Greška pri čuvanju!', '#f44336');
        }
        
        setTimeout(() => {
            isVoiceInput = false;
            window._isVoiceInput = false;
        }, 1000);
        
    }, 500);
    
    return saved;
}

// ============================================
// 7. OBRADA I ČUVANJE
// ============================================

function processAndSaveItem(command) {
    ALLOW_INVENTORY_OPEN = false;
    END_AKTIVAN = false;
    
    let data = parseVoiceDataEntry(command);
    if (!data.product_name || data.product_name === 'Proizvod' || data.product_name.length < 2) {
        console.warn('⚠️ Nije prepoznat naziv proizvoda:', command);
        showVoiceStatus('❌ Nisam prepoznao proizvod', '#f44336');
        return false;
    }
    
    console.log('📦 OBRADA:', data);
    lastSavedData = data;
    
    sacuvajPodatke(data);
    return true;
}

// ============================================
// 8. OTVARANJE ZALIHA
// ============================================

function otvoriZaliheEkran() {
    console.log('📦 Otvaram ekran zaliha... (ALLOW_INVENTORY_OPEN=' + ALLOW_INVENTORY_OPEN + ')');
    
    if (!ALLOW_INVENTORY_OPEN) {
        console.log('⛔ ZABRANJENO: samo "end" može otvoriti zalihe');
        showVoiceStatus('⛔ Samo "end" otvara zalihe', '#FF9800');
        return;
    }
    
    if (typeof refreshInventoryData === 'function') {
        try { refreshInventoryData(); } catch(e) {}
    }
    
    setTimeout(() => {
        if (typeof renderInventory === 'function') {
            try { renderInventory(); } catch(e) {}
        }
        if (typeof renderProductList === 'function') {
            try { renderProductList(); } catch(e) {}
        }
        if (typeof renderEntries === 'function') {
            try { renderEntries(); } catch(e) {}
        }
        if (typeof loadInventory === 'function') {
            try { loadInventory(); } catch(e) {}
        }
        if (typeof updateInventory === 'function') {
            try { updateInventory(); } catch(e) {}
        }
    }, 100);
    
    setTimeout(() => {
        if (typeof openInventoryAndShowHighlight === 'function') {
            try { openInventoryAndShowHighlight(); } catch(e) {}
        } else if (typeof showScreen === 'function') {
            try { showScreen('inventoryScreen'); } catch(e) {}
        } else {
            const inv = document.getElementById('inventoryScreen');
            const main = document.getElementById('mainScreen');
            if (inv) {
                if (main) main.style.display = 'none';
                inv.style.display = 'flex';
                inv.classList.add('active');
            }
        }
        console.log('✅ Ekran zaliha otvoren');
        showVoiceStatus('📦 Zalihe otvorene', '#4CAF50');
        
        ALLOW_INVENTORY_OPEN = false;
    }, 300);
}

// ============================================
// 9. START VOICE RECOGNITION - SA VIŠEJEZIČNOM PODRŠKOM
// ============================================

function startVoiceRecognition() {
    console.log('🎤 startVoiceRecognition POZVAN!');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showVoiceStatus('❌ Browser ne podržava glasovno prepoznavanje.', '#f44336');
        alert('Vaš pretraživač ne podržava glasovne komande. Koristite Chrome, Edge ili Safari.');
        return;
    }

    if (recognition) {
        try { 
            recognition.stop(); 
            recognition = null;
        } catch(e) {}
    }

    try {
        recognition = new SpeechRecognition();
    } catch(e) {
        console.error('❌ Greška pri kreiranju recognition:', e);
        showVoiceStatus('❌ Greška pri pokretanju mikrofona', '#f44336');
        return;
    }
    
    const langCode = typeof currentLang !== 'undefined' ? currentLang : 'sr';
    const speechLangMap = {
        sr: 'sr-RS', en: 'en-US', de: 'de-DE', hu: 'hu-HU',
        uk: 'uk-UA', ru: 'ru-RU', zh: 'zh-CN', es: 'es-ES',
        pt: 'pt-PT', fr: 'fr-FR'
    };
    recognition.lang = speechLangMap[langCode] || 'en-US';
    
    console.log('🌐 Jezik za prepoznavanje:', recognition.lang);
    showVoiceStatus(`🌐 Jezik: ${recognition.lang}`, '#2196F3');
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    END_AKTIVAN = false;
    isProcessingCommand = false;
    ALLOW_INVENTORY_OPEN = false;

    recognition.onstart = function() {
        console.log('🎤 MIKROFON AKTIVAN!');
        showVoiceStatus('🎤 Slušam... Recite "start" pa podatke', '#2196F3');
        activeBuffer = '';
        isProcessingCommand = false;
        END_AKTIVAN = false;
        ALLOW_INVENTORY_OPEN = false;
    };

    recognition.onresult = function(event) {
        let interimText = '';
        let finalChunk = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript.trim();
            if (result.isFinal) {
                finalChunk += (finalChunk ? ' ' : '') + transcript;
            } else {
                interimText += transcript;
            }
        }
        
        if (finalChunk) {
            activeBuffer += (activeBuffer ? ' ' : '') + finalChunk;
            console.log('🗣️ TRENUTNI BAFER:', activeBuffer);
        }
        
        const currentDisplay = activeBuffer + (interimText ? ' ' + interimText : '');
        showVoiceStatus(`🎤 Slušam: "${currentDisplay}"`, '#FFD700');
        
        if (isProcessingCommand) return;
        
        const lowerFull = activeBuffer.toLowerCase();
        console.log('🔍 PROVERAVAM CELI BAFER:', lowerFull);
        
        // ============================================
        // 1. "END" - OTVARA ZALIHE
        // ============================================
        if (lowerFull.includes('end') || lowerFull.includes('kraj') || lowerFull.includes('gotovo') ||
            lowerFull.includes('done') || lowerFull.includes('fertig') || lowerFull.includes('kész') ||
            lowerFull.includes('готово') || lowerFull.includes('完成') || lowerFull.includes('hecho')) {
            console.log('🏁 END DETEKTOVAN - otvaram zalihe!');
            isProcessingCommand = true;
            END_AKTIVAN = true;
            ALLOW_INVENTORY_OPEN = true;
            
            let itemText = activeBuffer;
            const endWords = ['end', 'kraj', 'gotovo', 'done', 'fertig', 'kész', 'готово', '完成', 'hecho'];
            for (let word of endWords) {
                if (itemText.toLowerCase().includes(word)) {
                    const parts = itemText.split(new RegExp(word, 'i'));
                    itemText = parts[0].trim();
                    break;
                }
            }
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }
            
            activeBuffer = '';
            
            setTimeout(() => {
                stopVoiceRecognition();
                setTimeout(() => {
                    if (typeof prikaziSveUnose === 'function') {
                        try { prikaziSveUnose(); } catch(e) {}
                    }
                    otvoriZaliheEkran();
                    END_AKTIVAN = false;
                }, 500);
            }, 300);
            
            return;
        }
        
        // ============================================
        // 2. "PLUS" - ZAVRŠAVA UNOS (NE OTVARA ZALIHE!)
        // ============================================
        if (lowerFull.includes('plus') || lowerFull.includes('add') || lowerFull.includes('hozzáad') ||
            lowerFull.includes('додати') || lowerFull.includes('添加') || lowerFull.includes('hinzufügen')) {
            console.log('✅ PLUS DETEKTOVAN - završavam unos (NE otvaram zalihe)');
            isProcessingCommand = true;
            
            ALLOW_INVENTORY_OPEN = false;
            END_AKTIVAN = false;
            
            let parts = activeBuffer.split(/\bplus\b/i);
            if (parts.length === 1) {
                parts = activeBuffer.split(/\badd\b/i);
            }
            let itemText = parts[0].trim();
            
            if (itemText.length > 2) {
                processAndSaveItem(itemText);
            }
            
            activeBuffer = parts.slice(1).join('').trim();
            
            showVoiceStatus('✅ Unos sačuvan. Recite sledeći ili "end" za kraj.', '#4CAF50');
            
            setTimeout(() => {
                if (typeof prikaziSveUnose === 'function') {
                    try { prikaziSveUnose(); } catch(e) {}
                }
                console.log('✅ Pregled osvežen nakon plus');
            }, 200);
            
            setTimeout(() => {
                isProcessingCommand = false;
            }, 500);
            
            return;
        }
        
        // ============================================
        // 3. "UNOS" - OTVARA DATA ENTRY
        // ============================================
        const dataEntryKeywords = ['unos', 'unesi', 'dodaj', 'add', 'hinzufügen', 'hozzáad', 'додати', '添加'];
        if (dataEntryKeywords.some(k => lowerFull.includes(k))) {
            console.log('📝 UNOS DETEKTOVAN - otvaram data entry');
            hideVoiceMenu();
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen && mainScreen.style.display !== 'flex') {
                mainScreen.style.display = 'flex';
                mainScreen.classList.add('active');
                if (typeof renderDataEntry === 'function') renderDataEntry('');
            }
            const words = activeBuffer.split(/\s+/);
            const filtered = words.filter(w => {
                const lower = w.toLowerCase();
                return !dataEntryKeywords.some(k => lower === k);
            });
            activeBuffer = filtered.join(' ');
        }
    };

    recognition.onerror = function(event) {
        console.error('⚠️ Speech Recognition greška:', event.error);
        if (event.error === 'not-allowed') {
            showVoiceStatus('❌ Dozvolite pristup mikrofonu.', '#f44336');
        } else if (event.error === 'no-speech') {
            showVoiceStatus('⚠️ Nisam čuo govor. Pokušajte ponovo.', '#FF9800');
        }
        isProcessingCommand = false;
    };

    recognition.onend = function() {
        console.log('🎤 Glasovno prepoznavanje završeno.');
        isProcessingCommand = false;
    };

    try {
        recognition.start();
        console.log('✅ Mikrofon pokrenut!');
        showVoiceStatus('🎤 Slušam...', '#2196F3');
    } catch(e) {
        console.error('❌ Greška pri pokretanju:', e);
        showVoiceStatus('❌ Greška pri pokretanju mikrofona', '#f44336');
    }
}

// ============================================
// 10. ZAUSTAVI PREPOZNAVANJE
// ============================================

function stopVoiceRecognition() {
    if (recognition) {
        try {
            recognition.stop();
            recognition = null;
        } catch(e) {}
    }
    activeBuffer = '';
    isProcessingCommand = false;
    showVoiceStatus('⏸️ Prepoznavanje zaustavljeno', '#aaa');
}

// ============================================
// 11. RESTART MIKROFONA
// ============================================

function restartMicrophone() {
    console.log('🔄 Restartujem mikrofon...');
    stopVoiceRecognition();
    setTimeout(() => {
        startVoiceRecognition();
    }, 500);
}

// ============================================
// 12. POVRATAK NA PREĐAŠNJI EKRAN
// ============================================

function goBackFromVoice() {
    console.log('◀ goBackFromVoice POZVAN!');
    stopVoiceRecognition();
    
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    const choiceScreen = document.getElementById('choiceScreen');
    if (choiceScreen) {
        choiceScreen.style.display = 'flex';
        choiceScreen.classList.add('active');
    }
    
    if (typeof updateHeaderLanguage === 'function') {
        updateHeaderLanguage();
    }
    if (typeof updateInterfaceLanguage === 'function') {
        updateInterfaceLanguage();
    }
}

// ============================================
// 13. SELEKTOVANJE VOICE MODE - PREGAŽENO
// ============================================

window.selectVoiceMode = function() {
    console.log('🎤 selectVoiceMode (PREGAŽEN) - otvaram voice menu');
    
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    const voiceMenuScreen = document.getElementById('voiceMenuScreen');
    if (voiceMenuScreen) {
        voiceMenuScreen.style.display = 'flex';
        voiceMenuScreen.classList.add('active');
        console.log('✅ Voice menu prikazan');
    }
    
    setTimeout(function() {
        console.log('🎤 Pokrećem VOICE COMMANDS startVoiceRecognition...');
        if (typeof startVoiceRecognition === 'function') {
            startVoiceRecognition();
        } else {
            console.error('❌ startVoiceRecognition nije dostupan!');
        }
    }, 500);
};

// ============================================
// 14. PREUZIMANJE KONTROLE
// ============================================

window._voiceCommandsStart = startVoiceRecognition;
window._voiceCommandsStop = stopVoiceRecognition;
window._voiceCommandsProcess = processAndSaveItem;
window._voiceCommandsParse = parseVoiceDataEntry;
window._voiceCommandsOpenZalihe = otvoriZaliheEkran;

window.startVoiceRecognition = function() {
    console.log('🎤 startVoiceRecognition -> VOICE COMMANDS');
    return window._voiceCommandsStart();
};

window.stopVoiceRecognition = function() {
    console.log('🛑 stopVoiceRecognition -> VOICE COMMANDS');
    return window._voiceCommandsStop();
};

window.processVoiceCommand = function(command) {
    console.log('🎤 processVoiceCommand (pregažen):', command);
    
    if (!command) return false;
    const lower = command.toLowerCase();
    
    if (lower.includes('plus') || lower.includes('add') || lower.includes('hozzáad') || 
        lower.includes('додати') || lower.includes('添加') || lower.includes('hinzufügen')) {
        console.log('✅ PLUS - završavam unos (NE otvaram zalihe)');
        const itemText = command.replace(/plus|add|hozzáad|додати|添加|hinzufügen/i, '').trim();
        if (itemText && typeof window._voiceCommandsProcess === 'function') {
            window._voiceCommandsProcess(itemText);
        }
        return true;
    }
    
    if (lower.includes('end') || lower.includes('kraj') || lower.includes('gotovo') || 
        lower.includes('done') || lower.includes('fertig') || lower.includes('kész') || 
        lower.includes('готово') || lower.includes('完成') || lower.includes('hecho')) {
        console.log('🏁 END - otvaram zalihe');
        const itemText = command.replace(/end|kraj|gotovo|done|fertig|kész|готово|完成|hecho/i, '').trim();
        if (itemText && typeof window._voiceCommandsProcess === 'function') {
            window._voiceCommandsProcess(itemText);
        }
        setTimeout(() => {
            if (typeof window._voiceCommandsOpenZalihe === 'function') {
                ALLOW_INVENTORY_OPEN = true;
                window._voiceCommandsOpenZalihe();
                setTimeout(() => {
                    ALLOW_INVENTORY_OPEN = false;
                }, 1000);
            }
        }, 500);
        return true;
    }
    
    if (lower.includes('unos') || lower.includes('unesi') || lower.includes('dodaj') || 
        lower.includes('add') || lower.includes('hinzufügen') || lower.includes('hozzáad') || 
        lower.includes('додати') || lower.includes('添加')) {
        console.log('📝 UNOS - otvaram data entry');
        const itemText = command.replace(/unos|unesi|dodaj|add|hinzufügen|hozzáad|додати|添加|novi|new|neu|új|новий|новый|新/i, '').trim();
        hideVoiceMenu();
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
            if (typeof renderDataEntry === 'function') renderDataEntry('');
        }
        if (itemText && typeof window._voiceCommandsProcess === 'function') {
            setTimeout(() => {
                window._voiceCommandsProcess(itemText);
            }, 500);
        }
        return true;
    }
    
    return false;
};

window.voiceCommand = function(command) {
    console.log('🎤 voiceCommand -> processVoiceCommand');
    return window.processVoiceCommand(command);
};

window.goBackFromVoice = goBackFromVoice;
window.hideVoiceMenu = hideVoiceMenu;
window.restartMicrophone = restartMicrophone;

// ============================================
// 15. ZABRANA OTVARANJA ZALIHA IZ VOICE KOMANDI
// ============================================

(function() {
    console.log('🔥 BLOKIRAM OTVARANJE ZALIHA IZ VOICE KOMANDI!');
    
    const originalRenderInventory = window.renderInventory;
    const originalShowScreen = window.showScreen;
    const originalOpenInventory = window.openInventoryAndShowHighlight;
    
    window.renderInventory = function() {
        const stack = new Error().stack || '';
        const blocked = ['sacuvajPodatke', 'processAndSaveItem', 'processVoiceCommand', 'saveProduct', 'handleFormSubmit', 'addProduct'];
        const isBlocked = blocked.some(fn => stack.includes(fn));
        
        if (isBlocked) {
            console.log('⛔ BLOKIRANO: renderInventory iz voice komande');
            return;
        }
        
        if (typeof originalRenderInventory === 'function') {
            return originalRenderInventory.apply(this, arguments);
        }
    };
    
    window.showScreen = function(screenId) {
        const stack = new Error().stack || '';
        const blocked = ['sacuvajPodatke', 'processAndSaveItem', 'processVoiceCommand'];
        
        if (blocked.some(fn => stack.includes(fn)) && 
            (screenId === 'inventoryScreen' || screenId === 'mainScreen')) {
            console.log('⛔ BLOKIRANO: showScreen(' + screenId + ') iz voice komande');
            return;
        }
        
        if (typeof originalShowScreen === 'function') {
            return originalShowScreen.apply(this, arguments);
        }
    };
    
    window.openInventoryAndShowHighlight = function() {
        const stack = new Error().stack || '';
        if (stack.includes('sacuvajPodatke')) {
            console.log('⛔ BLOKIRANO: openInventoryAndShowHighlight iz voice komande');
            return;
        }
        
        if (typeof originalOpenInventory === 'function') {
            return originalOpenInventory.apply(this, arguments);
        }
    };
    
    console.log('✅ Otvaranje zaliha BLOKIRANO za voice komande!');
    console.log('⛔ Plus NE otvara zalihe!');
    console.log('✅ End otvara zalihe!');
})();

console.log('🌐 VOICE COMMANDS - KONAČNA VERZIJA UČITANA!');
console.log('🎤 Podržani jezici: sr, en, de, hu, uk, ru, zh, es, pt, fr');
console.log('🎤 Klik na "Voice Input" će pokrenuti PRAVI mikrofon!');
console.log('📝 Komande rade na svim jezicima!');
