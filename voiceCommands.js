// ============================================
// VOICE COMMANDS - POTPUNI RADNI KOD
// Radi sa vašim postojećim HTML-om
// ============================================

// ============================================
// 1. KONFIGURACIJA
// ============================================

const CONFIG = {
  recognition: {
    continuous: true,
    interimResults: true,
    maxAlternatives: 1,
    restartDelay: 2000,
    processingDelay: 500
  },
  defaults: {
    shelfLife: 6,
    storage: 'Zamrzivač 1',
    unit: 'kom',
    piece: 1,
    quantity: 1
  },
  debug: true
};

// ============================================
// 2. LOGGER
// ============================================

const logger = {
  debug: (msg, data) => { if (CONFIG.debug) console.log('[DEBUG]', msg, data || ''); },
  info: (msg, data) => console.log('[INFO]', msg, data || ''),
  warn: (msg, data) => console.warn('[WARN]', msg, data || ''),
  error: (msg, data) => console.error('[ERROR]', msg, data || '')
};

// ============================================
// 3. JEZIČKI SISTEM
// ============================================

const LANGUAGE = {
  current: 'sr',
  
  dictionaries: {
    sr: {
      commands: { 
        add: ['dodaj', 'unos', 'unesi'], 
        list: ['spisak', 'lista'], 
        stock: ['zalihe', 'zaliha'], 
        close: ['exit', 'izlaz'] 
      },
      messages: {
        welcome: 'Izgovorite: "DODAJ", "SPISAK", "ZALIHE" ili "EXIT"',
        listening: 'Slušam...',
        add_mode: 'Otvaram unos... Izgovorite naziv proizvoda',
        list_mode: 'Otvaram spisak...',
        stock_mode: 'Otvaram zalihe...',
        closing: 'Zatvaram glasovni meni...',
        not_recognized: 'Nisam prepoznao. Izgovorite: DODAJ, SPISAK, ZALIHE ili EXIT',
        saving: 'Sačuvano: ',
        new_entry: 'Unesite sledeći proizvod...',
        error: 'Došlo je do greške. Pokušajte ponovo.'
      }
    },
    en: {
      commands: { 
        add: ['add', 'new', 'enter'], 
        list: ['list', 'inventory'], 
        stock: ['stock', 'status'], 
        close: ['exit'] 
      },
      messages: {
        welcome: 'Say: "ADD", "LIST", "STOCK" or "EXIT"',
        listening: 'Listening...',
        add_mode: 'Opening entry... Say product name',
        list_mode: 'Opening list...',
        stock_mode: 'Opening stock...',
        closing: 'Closing voice menu...',
        not_recognized: 'Not recognized. Say: ADD, LIST, STOCK or EXIT',
        saving: 'Saved: ',
        new_entry: 'Enter next product...',
        error: 'An error occurred. Please try again.'
      }
    },
    de: {
      commands: { 
        add: ['hinzufügen', 'neu', 'einfügen'], 
        list: ['liste', 'inventar'], 
        stock: ['bestand', 'lager'], 
        close: ['exit'] 
      },
      messages: {
        welcome: 'Sagen Sie: "HINZUFÜGEN", "LISTE", "BESTAND" oder "EXIT"',
        listening: 'Höre zu...',
        add_mode: 'Öffne Eingabe... Sagen Sie Produktname',
        list_mode: 'Öffne Liste...',
        stock_mode: 'Öffne Bestand...',
        closing: 'Sprachmenü schließen...',
        not_recognized: 'Nicht erkannt. Sagen Sie: HINZUFÜGEN, LISTE, BESTAND oder EXIT',
        saving: 'Gespeichert: ',
        new_entry: 'Nächstes Produkt eingeben...',
        error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
      }
    },
    hu: {
      commands: { 
        add: ['adatbevitel', 'új', 'beír'], 
        list: ['lista', 'leltár'], 
        stock: ['készlet', 'raktár'], 
        close: ['exit'] 
      },
      messages: {
        welcome: 'Mondja: "ADATBEVITEL", "LISTA", "KÉSZLET" vagy "EXIT"',
        listening: 'Hallgatom...',
        add_mode: 'Bevitel nyitása... Mondja a termék nevét',
        list_mode: 'Lista megnyitása...',
        stock_mode: 'Készlet megnyitása...',
        closing: 'Hangmenü bezárása...',
        not_recognized: 'Nem ismert. Mondja: ADATBEVITEL, LISTA, KÉSZLET vagy EXIT',
        saving: 'Mentve: ',
        new_entry: 'Következő termék megadása...',
        error: 'Hiba történt. Kérjük, próbálja újra.'
      }
    },
    uk: {
      commands: { 
        add: ['додати', 'новий', 'ввести'], 
        list: ['список', 'інвентар'], 
        stock: ['запаси', 'склад'], 
        close: ['exit'] 
      },
      messages: {
        welcome: 'Скажіть: "ДОДАТИ", "СПИСОК", "ЗАПАСИ" або "EXIT"',
        listening: 'Слухаю...',
        add_mode: 'Відкриваю введення... Скажіть назву продукту',
        list_mode: 'Відкриваю список...',
        stock_mode: 'Відкриваю запаси...',
        closing: 'Закриваю голосове меню...',
        not_recognized: 'Не розпізнано. Скажіть: ДОДАТИ, СПИСОК, ЗАПАСИ або EXIT',
        saving: 'Збережено: ',
        new_entry: 'Введіть наступний продукт...',
        error: 'Сталася помилка. Будь ласка, спробуйте ще раз.'
      }
    },
    ru: {
      commands: { 
        add: ['добавить', 'новый', 'ввести'], 
        list: ['список', 'инвентарь'], 
        stock: ['запасы', 'склад'], 
        close: ['exit'] 
      },
      messages: {
        welcome: 'Скажите: "ДОБАВИТЬ", "СПИСОК", "ЗАПАСЫ" или "EXIT"',
        listening: 'Слушаю...',
        add_mode: 'Открываю ввод... Скажите название продукта',
        list_mode: 'Открываю список...',
        stock_mode: 'Открываю запасы...',
        closing: 'Закрываю голосовое меню...',
        not_recognized: 'Не распознано. Скажите: ДОБАВИТЬ, СПИСОК, ЗАПАСЫ или EXIT',
        saving: 'Сохранено: ',
        new_entry: 'Введите следующий продукт...',
        error: 'Произошла ошибка. Пожалуйста, попробуйте снова.'
      }
    },
    zh: {
      commands: { 
        add: ['添加', '新增', '输入'], 
        list: ['列表', '清单', '库存'], 
        stock: ['库存', '存储'], 
        close: ['exit'] 
      },
      messages: {
        welcome: '请说："添加", "列表", "库存" 或 "EXIT"',
        listening: '正在听...',
        add_mode: '打开输入... 请说产品名称',
        list_mode: '打开列表...',
        stock_mode: '打开库存...',
        closing: '关闭语音菜单...',
        not_recognized: '无法识别。请说：添加, 列表, 库存 或 EXIT',
        saving: '已保存：',
        new_entry: '输入下一个产品...',
        error: '发生错误。请再试一次。'
      }
    },
    es: {
      commands: { 
        add: ['añadir', 'nuevo', 'ingresar'], 
        list: ['lista', 'inventario'], 
        stock: ['existencias', 'almacén'], 
        close: ['exit'] 
      },
      messages: {
        welcome: 'Diga: "AÑADIR", "LISTA", "EXISTENCIAS" o "EXIT"',
        listening: 'Escuchando...',
        add_mode: 'Abriendo entrada... Diga el nombre del producto',
        list_mode: 'Abriendo lista...',
        stock_mode: 'Abriendo existencias...',
        closing: 'Cerrando menú de voz...',
        not_recognized: 'No reconocido. Diga: AÑADIR, LISTA, EXISTENCIAS o EXIT',
        saving: 'Guardado: ',
        new_entry: 'Ingrese el siguiente producto...',
        error: 'Se produjo un error. Por favor, inténtelo de nuevo.'
      }
    },
    pt: {
      commands: { 
        add: ['adicionar', 'novo', 'inserir'], 
        list: ['lista', 'inventário'], 
        stock: ['estoque', 'armazenamento'], 
        close: ['exit'] 
      },
      messages: {
        welcome: 'Diga: "ADICIONAR", "LISTA", "ESTOQUE" ou "EXIT"',
        listening: 'Ouvindo...',
        add_mode: 'Abrindo entrada... Diga o nome do produto',
        list_mode: 'Abrindo lista...',
        stock_mode: 'Abrindo estoque...',
        closing: 'Fechando menu de voz...',
        not_recognized: 'Não reconhecido. Diga: ADICIONAR, LISTA, ESTOQUE ou EXIT',
        saving: 'Salvo: ',
        new_entry: 'Insira o próximo produto...',
        error: 'Ocorreu um erro. Por favor, tente novamente.'
      }
    },
    fr: {
      commands: { 
        add: ['ajouter', 'nouveau', 'entrer'], 
        list: ['liste', 'inventaire'], 
        stock: ['stock', 'entrepôt'], 
        close: ['exit'] 
      },
      messages: {
        welcome: 'Dites: "AJOUTER", "LISTE", "STOCK" ou "EXIT"',
        listening: 'Écoute...',
        add_mode: 'Ouverture de la saisie... Dites le nom du produit',
        list_mode: 'Ouverture de la liste...',
        stock_mode: 'Ouverture du stock...',
        closing: 'Fermeture du menu vocal...',
        not_recognized: 'Non reconnu. Dites: AJOUTER, LISTE, STOCK ou EXIT',
        saving: 'Enregistré: ',
        new_entry: 'Entrez le prochain produit...',
        error: 'Une erreur est survenue. Veuillez réessayer.'
      }
    }
  },
  
  getMessage(key) {
    const dict = this.dictionaries[this.current] || this.dictionaries.sr;
    return dict.messages[key] || this.dictionaries.sr.messages[key] || key;
  },
  
  getCommands() {
    const dict = this.dictionaries[this.current] || this.dictionaries.sr;
    return dict.commands;
  },
  
  getSpeechLang() {
    const map = { 
      sr: 'sr-RS', en: 'en-US', de: 'de-DE', hu: 'hu-HU',
      uk: 'uk-UA', ru: 'ru-RU', zh: 'zh-CN', es: 'es-ES',
      pt: 'pt-PT', fr: 'fr-FR'
    };
    return map[this.current] || 'sr-RS';
  },
  
  setLang(lang) {
    if (this.dictionaries[lang]) {
      this.current = lang;
      localStorage.setItem('voiceLang', lang);
      logger.info(`Jezik promenjen na: ${lang}`);
      return true;
    }
    return false;
  }
};

// ============================================
// 4. PARSER
// ============================================

const Parser = {
  numberWords: {
    'nula': '0', 'jedan': '1', 'jedna': '1', 'jedno': '1',
    'dva': '2', 'dve': '2', 'tri': '3', 'četiri': '4', 'cetiri': '4',
    'pet': '5', 'šest': '6', 'sest': '6', 'sedam': '7', 'osam': '8',
    'devet': '9', 'deset': '10',
    'jedanaest': '11', 'dvanaest': '12', 'trinaest': '13',
    'četrnaest': '14', 'cetrnaest': '14', 'petnaest': '15',
    'šesnaest': '16', 'sesnaest': '16', 'sedamnaest': '17',
    'osamnaest': '18', 'devetnaest': '19',
    'dvadeset': '20', 'trideset': '30', 'četrdeset': '40',
    'cetrdeset': '40', 'pedeset': '50', 'šezdeset': '60',
    'sezdeset': '60', 'sedamdeset': '70', 'osamdeset': '80',
    'devedeset': '90', 'sto': '100'
  },

  unitMap: {
    'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg',
    'gram': 'g', 'grama': 'g', 'g': 'g',
    'litar': 'l', 'litara': 'l', 'l': 'l',
    'komad': 'kom', 'komada': 'kom', 'kom': 'kom',
    'paket': 'pak', 'paketa': 'pak', 'pak': 'pak'
  },

  storageMap: {
    'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
    'zamrzivač 1': 'Zamrzivač 1', 'zamrzivac 1': 'Zamrzivač 1',
    'zamrzivač 2': 'Zamrzivač 2', 'zamrzivac 2': 'Zamrzivač 2',
    'zamrzivač 3': 'Zamrzivač 3', 'zamrzivac 3': 'Zamrzivač 3',
    'frižider': 'Frižider', 'frizider': 'Frižider',
    'ostava': 'Ostava', 'špajz': 'Ostava'
  },

  skipWords: ['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima', 'i'],

  parse(text) {
    logger.debug('Parsiranje teksta:', text);
    
    if (!text || text.trim().length < 2) {
      return null;
    }
    
    let normalized = this.normalizeText(text);
    const words = normalized.split(/\s+/).filter(Boolean);
    
    const result = {
      productName: '',
      piece: CONFIG.defaults.piece,
      quantity: CONFIG.defaults.quantity,
      unit: CONFIG.defaults.unit,
      shelfLife: CONFIG.defaults.shelfLife,
      storage: CONFIG.defaults.storage
    };
    
    // Pronađi skladište i jedinicu
    let foundStorage = null;
    let foundUnit = null;
    let storageIndex = -1;
    let unitIndex = -1;
    
    words.forEach((word, i) => {
      const w = word.toLowerCase();
      
      // Skladište
      for (let key in this.storageMap) {
        if (w.includes(key) || key.includes(w)) {
          foundStorage = this.storageMap[key];
          storageIndex = i;
          break;
        }
      }
      
      // Jedinica
      for (let key in this.unitMap) {
        if (w === key || w.includes(key)) {
          foundUnit = this.unitMap[key];
          unitIndex = i;
          break;
        }
      }
    });
    
    if (foundStorage) result.storage = foundStorage;
    if (foundUnit) result.unit = foundUnit;
    
    // Ekstraktuj brojeve i naziv
    const nameParts = [];
    const numbers = [];
    
    words.forEach((word, i) => {
      if (i === storageIndex || i === unitIndex) return;
      if (this.skipWords.includes(word.toLowerCase())) return;
      
      const num = this.getNumber(word);
      if (num !== null) {
        numbers.push(num);
      } else {
        nameParts.push(word);
      }
    });
    
    logger.debug('Brojevi:', numbers);
    logger.debug('Naziv delovi:', nameParts);
    
    // Rasporedi brojeve
    const textJoined = words.join(' ').toLowerCase();
    
    if (numbers.length >= 3) {
      result.piece = numbers[0];
      result.quantity = numbers[1];
      result.shelfLife = numbers[2];
    } else if (numbers.length === 2) {
      if (parseFloat(numbers[1]) > 3 && !textJoined.includes('kilogram') && !textJoined.includes('kg')) {
        result.piece = numbers[0];
        result.quantity = numbers[0];
        result.shelfLife = numbers[1];
      } else {
        result.piece = numbers[0];
        result.quantity = numbers[1];
      }
    } else if (numbers.length === 1) {
      result.piece = numbers[0];
      result.quantity = numbers[0];
    }
    
    // Detektuj jedinicu iz teksta
    if (!foundUnit) {
      if (textJoined.includes('gram') || textJoined.includes('grama') || textJoined.includes('g ')) {
        result.unit = 'g';
      } else if (textJoined.includes('kilogram') || textJoined.includes('kg')) {
        result.unit = 'kg';
      } else if (textJoined.includes('litar') || textJoined.includes('l ')) {
        result.unit = 'l';
      } else if (textJoined.includes('komad') || textJoined.includes('kom')) {
        result.unit = 'kom';
      }
    }
    
    // Detektuj rok trajanja
    let shelfLifeFound = false;
    
    if (textJoined.includes('šest') || textJoined.includes('sest') || /\b6\b/.test(textJoined)) {
      result.shelfLife = '6';
      shelfLifeFound = true;
    }
    
    if (!shelfLifeFound) {
      const match = textJoined.match(/(\d+)\s*meseci/);
      if (match) {
        result.shelfLife = match[1];
        shelfLifeFound = true;
      }
    }
    
    if (!shelfLifeFound && numbers.length >= 3) {
      result.shelfLife = numbers[2];
    }
    
    result.productName = nameParts.join(' ').trim() || 'Proizvod';
    
    logger.debug('Parsiranje uspešno:', result);
    return result;
  },
  
  normalizeText(text) {
    return text
      .replace(/^šta\s*/i, '')
      .replace(/^start\s*/i, '')
      .replace(/^dodaj\s*/i, '')
      .replace(/^unos\s*/i, '')
      .replace(/^unesi\s*/i, '')
      .replace(/^add\s*/i, '')
      .replace(/^new\s*/i, '')
      .replace(/^enter\s*/i, '')
      .replace(/^adatbevitel\s*/i, '')
      .replace(/^hinzufügen\s*/i, '')
      .replace(/^neu\s*/i, '')
      .replace(/^einfügen\s*/i, '')
      .replace(/^додати\s*/i, '')
      .replace(/^добавить\s*/i, '')
      .replace(/^添加\s*/i, '')
      .replace(/^añadir\s*/i, '')
      .replace(/^adicionar\s*/i, '')
      .replace(/^ajouter\s*/i, '')
      .replace(/^grile\s*/i, 'grill ')
      .replace(/^gril\s*/i, 'grill ')
      .replace(/\bGreen\b/gi, 'grill ')
      .replace(/\bgreen\b/gi, 'grill ')
      .trim();
  },
  
  getNumber(word) {
    const w = word.toLowerCase().trim();
    if (this.numberWords[w] !== undefined) return this.numberWords[w];
    if (/^\d+(?:[.,]\d+)?$/.test(w)) return w.replace(',', '.');
    return null;
  },
  
  detectCommand(text) {
    const commands = LANGUAGE.getCommands();
    const lower = text.toLowerCase().trim();
    
    if (lower.includes('exit')) return 'close';
    
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
};

// ============================================
// 5. INVENTORY MANAGER
// ============================================

const Inventory = {
  items: [],
  listeners: [],
  
  load() {
    try {
      const saved = localStorage.getItem('inventory');
      if (saved) {
        this.items = JSON.parse(saved);
        logger.info(`Učitano ${this.items.length} stavki iz localStorage`);
      }
    } catch (e) {
      logger.error('Greška pri učitavanju:', e);
      this.items = [];
    }
    return this.items;
  },
  
  save() {
    try {
      localStorage.setItem('inventory', JSON.stringify(this.items));
      logger.debug('Inventar sačuvan');
    } catch (e) {
      logger.error('Greška pri čuvanju:', e);
    }
  },
  
  add(data) {
    logger.debug('Dodavanje:', data);
    
    // Pronađi postojeći
    const existing = this.items.find(item => 
      item.productName && 
      item.productName.toLowerCase() === data.productName.toLowerCase() &&
      item.unit === data.unit &&
      item.storage === data.storage
    );
    
    let result;
    
    if (existing) {
      // Saberi sa postojećim
      existing.quantity = parseFloat(existing.quantity) + parseFloat(data.quantity);
      existing.piece = parseFloat(existing.piece) + parseFloat(data.piece);
      existing.shelfLife = parseInt(data.shelfLife) || CONFIG.defaults.shelfLife;
      existing.lastUpdated = new Date().toISOString();
      result = { item: existing, action: 'merged' };
      logger.info(`Sabrano: ${existing.productName} (${existing.quantity} ${existing.unit})`);
    } else {
      // Kreiraj novi
      const newItem = {
        id: Date.now(),
        productName: data.productName,
        piece: parseFloat(data.piece) || CONFIG.defaults.piece,
        quantity: parseFloat(data.quantity) || CONFIG.defaults.quantity,
        unit: data.unit || CONFIG.defaults.unit,
        shelfLife: parseInt(data.shelfLife) || CONFIG.defaults.shelfLife,
        storage: data.storage || CONFIG.defaults.storage,
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      this.items.push(newItem);
      result = { item: newItem, action: 'added' };
      logger.info(`Dodato: ${newItem.productName}`);
    }
    
    this.save();
    this.notifyListeners(result);
    return result;
  },
  
  getAll() {
    return [...this.items];
  },
  
  getGrouped() {
    const grouped = {};
    this.items.forEach(item => {
      const key = `${item.productName}|${item.storage}`;
      if (!grouped[key]) {
        grouped[key] = {
          productName: item.productName,
          storage: item.storage,
          unit: item.unit || CONFIG.defaults.unit,
          quantity: 0,
          piece: 0,
          shelfLife: item.shelfLife || CONFIG.defaults.shelfLife,
          items: []
        };
      }
      grouped[key].quantity += parseFloat(item.quantity) || 0;
      grouped[key].piece += parseFloat(item.piece) || 0;
      grouped[key].items.push(item);
    });
    return Object.values(grouped);
  },
  
  clear() {
    this.items = [];
    this.save();
    this.notifyListeners({ action: 'cleared' });
    logger.info('Inventar očišćen');
  },
  
  addListener(callback) {
    this.listeners.push(callback);
  },
  
  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (e) {
        logger.error('Greška u listeneru:', e);
      }
    });
  }
};

// Učitaj inventar
Inventory.load();

// ============================================
// 6. UI MANAGER - POTPUNO PRILAGOĐEN
// ============================================

const UI = {
  elements: {},
  containerCreated: false,
  
  init() {
    // Keširaj elemente
    const ids = [
      'voiceStatus', 'voiceMenuScreen', 'dataEntryScreen', 
      'mainScreen', 'choiceScreen',
      'productInput', 'pieceInput', 'quantityInput', 
      'shelfLifeInput', 'unitSelect', 'storageSelect'
    ];
    
    ids.forEach(id => {
      this.elements[id] = document.getElementById(id);
    });
    
    // Slušaj promene u inventaru
    Inventory.addListener(() => {
      this.renderInventory();
    });
    
    logger.info('UI inicijalizovan');
  },
  
  ensureInventoryContainer() {
    if (this.containerCreated) return this.elements.inventoryContainer;
    
    // Pokušaj da pronađeš postojeći kontejner
    let container = document.getElementById('inventoryList') ||
                    document.getElementById('entriesContainer') ||
                    document.getElementById('entryList') ||
                    document.getElementById('productList');
    
    if (!container) {
      // Kreiraj kontejner u dataEntryScreen
      const dataEntry = this.elements.dataEntryScreen;
      if (dataEntry) {
        container = document.createElement('div');
        container.id = 'inventoryContainer';
        container.style.cssText = `
          padding: 10px;
          max-height: 300px;
          overflow-y: auto;
          background: #1a1a2e;
          border-radius: 8px;
          margin: 10px 0;
          border: 1px solid #333;
        `;
        // Dodaj na kraj dataEntryScreen
        dataEntry.appendChild(container);
        this.containerCreated = true;
        logger.debug('Kreiran inventory kontejner');
      }
    }
    
    this.elements.inventoryContainer = container;
    return container;
  },
  
  showStatus(text, color = '#2196F3') {
    const el = this.elements.voiceStatus;
    if (el) {
      el.textContent = text;
      el.style.color = color;
    }
    logger.debug(`Status: ${text}`);
  },
  
  showScreen(screenId) {
    // Sakrij sve ekrane
    document.querySelectorAll('.screen').forEach(s => {
      if (s) {
        s.style.display = 'none';
        s.classList.remove('active');
      }
    });
    
    // Prikaži traženi
    const screen = this.elements[screenId] || document.getElementById(screenId);
    if (screen) {
      screen.style.display = 'flex';
      screen.classList.add('active');
      logger.debug(`Prikazan ekran: ${screenId}`);
      
      // Ako je dataEntryScreen, prikaži inventar
      if (screenId === 'dataEntryScreen') {
        setTimeout(() => {
          this.renderInventory();
        }, 100);
      }
    } else {
      logger.warn(`Ekran ${screenId} nije pronađen`);
    }
  },
  
  showVoiceMenu() {
    this.showScreen('voiceMenuScreen');
  },
  
  showDataEntry() {
    this.showScreen('dataEntryScreen');
    this.clearForm();
    this.ensureInventoryContainer();
    setTimeout(() => {
      this.renderInventory();
    }, 200);
  },
  
  showMain() {
    this.showScreen('mainScreen');
  },
  
  showChoice() {
    this.showScreen('choiceScreen');
  },
  
  clearForm() {
    logger.debug('Čišćenje forme...');
    
    const fields = ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput'];
    fields.forEach(id => {
      const el = this.elements[id];
      if (el) {
        el.value = '';
        this.triggerEvent(el, 'input');
        this.triggerEvent(el, 'change');
      }
    });
    
    // Resetuj select-ove
    const unitSelect = this.elements.unitSelect;
    if (unitSelect) {
      for (let opt of unitSelect.options) {
        if (opt.value === CONFIG.defaults.unit) {
          opt.selected = true;
          this.triggerEvent(unitSelect, 'change');
          break;
        }
      }
    }
    
    const storageSelect = this.elements.storageSelect;
    if (storageSelect) {
      for (let opt of storageSelect.options) {
        if (opt.value === CONFIG.defaults.storage) {
          opt.selected = true;
          this.triggerEvent(storageSelect, 'change');
          break;
        }
      }
    }
  },
  
  populateForm(data) {
    logger.debug('Popunjavanje forme:', data);
    
    const fields = {
      productInput: data.productName,
      pieceInput: data.piece,
      quantityInput: data.quantity,
      shelfLifeInput: data.shelfLife
    };
    
    Object.entries(fields).forEach(([id, value]) => {
      const el = this.elements[id];
      if (el) {
        el.value = value || '';
        this.triggerEvent(el, 'input');
        this.triggerEvent(el, 'change');
      }
    });
    
    // Postavi jedinicu
    if (data.unit) {
      const unitSelect = this.elements.unitSelect;
      if (unitSelect) {
        for (let opt of unitSelect.options) {
          if (opt.value === data.unit || opt.text.toLowerCase().includes(data.unit)) {
            opt.selected = true;
            this.triggerEvent(unitSelect, 'change');
            break;
          }
        }
      }
    }
    
    // Postavi skladište
    if (data.storage) {
      const storageSelect = this.elements.storageSelect;
      if (storageSelect) {
        for (let opt of storageSelect.options) {
          if (opt.value === data.storage || opt.text.includes(data.storage)) {
            opt.selected = true;
            this.triggerEvent(storageSelect, 'change');
            break;
          }
        }
      }
    }
    
    // Ažuriraj datum isteka
    if (typeof updateExpiryDate === 'function') {
      try { updateExpiryDate(); } catch(e) {}
    }
  },
  
  triggerEvent(el, type) {
    if (el) {
      const event = new Event(type, { bubbles: true });
      el.dispatchEvent(event);
    }
  },
  
  renderInventory() {
    const container = this.elements.inventoryContainer || this.ensureInventoryContainer();
    
    if (!container) {
      logger.warn('Nema kontejnera za inventory');
      return;
    }
    
    const items = Inventory.getGrouped();
    
    if (items.length === 0) {
      container.innerHTML = `
        <div style="color: #888; text-align: center; padding: 20px; background: #1a1a2e; border-radius: 8px;">
          📭 Nema zaliha
        </div>
      `;
      return;
    }
    
    let html = `
      <div style="background: #1a1a2e; padding: 10px; border-radius: 8px; font-size: 0.9rem;">
        <div style="color: #FF9800; font-weight: bold; padding: 8px; border-bottom: 2px solid #FF9800; margin-bottom: 8px;">
          📦 Zalihe (${items.length} proizvoda)
        </div>
    `;
    
    items.forEach(item => {
      html += `
        <div style="border-bottom: 1px solid #333; padding: 8px 0; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #fff;">${item.productName}</strong>
            <span style="color: #aaa; font-size: 0.85rem; margin-left: 8px;">
              ${item.quantity} ${item.unit}
            </span>
            <span style="color: #666; font-size: 0.75rem; margin-left: 8px;">
              (${item.piece} kom)
            </span>
          </div>
          <div style="color: #888; font-size: 0.75rem; text-align: right;">
            📦 ${item.storage}<br>
            📅 ${item.shelfLife}m
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    logger.debug('Inventory prikazan');
  },
  
  refresh() {
    this.renderInventory();
    
    // Pozovi originalne funkcije ako postoje
    if (typeof prikaziSveUnose === 'function') {
      try { prikaziSveUnose(); } catch(e) {}
    }
    if (typeof renderInventory === 'function') {
      try { renderInventory(); } catch(e) {}
    }
    if (typeof renderProductList === 'function') {
      try { renderProductList(); } catch(e) {}
    }
  },
  
  goBack() {
    this.showChoice();
    if (typeof updateHeaderLanguage === 'function') {
      updateHeaderLanguage();
    }
    if (typeof updateInterfaceLanguage === 'function') {
      updateInterfaceLanguage();
    }
  }
};

// ============================================
// 7. VOICE RECOGNITION - POTPUNO ISPRAVLJEN
// ============================================

const Voice = {
  recognition: null,
  buffer: '',
  isProcessing: false,
  isProcessingPlus: false,
  timeoutId: null,
  isRunning: false,
  
  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      UI.showStatus('❌ Browser ne podržava glasovno prepoznavanje.', '#f44336');
      logger.error('Speech Recognition nije podržan');
      return;
    }
    
    this.recognition = new SpeechRecognition();
    this.recognition.lang = LANGUAGE.getSpeechLang();
    this.recognition.continuous = CONFIG.recognition.continuous;
    this.recognition.interimResults = CONFIG.recognition.interimResults;
    this.recognition.maxAlternatives = CONFIG.recognition.maxAlternatives;
    
    this.setupHandlers();
    logger.info('Voice recognition inicijalizovan');
  },
  
  setupHandlers() {
    if (!this.recognition) return;
    
    this.recognition.onstart = () => {
      this.isRunning = true;
      UI.showStatus('🎤 ' + LANGUAGE.getMessage('welcome'), '#2196F3');
      this.buffer = '';
      this.isProcessing = false;
      logger.info('🎤 Mikrofon aktiviran');
    };
    
    this.recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();
        if (result.isFinal) {
          final += (final ? ' ' : '') + transcript;
        } else {
          interim += transcript;
        }
      }
      
      if (final) {
        this.buffer += (this.buffer ? ' ' : '') + final;
        logger.debug(`Buffer: "${this.buffer}"`);
      }
      
      const display = this.buffer + (interim ? ' ' + interim : '');
      UI.showStatus('🎤 ' + LANGUAGE.getMessage('listening') + ' "' + display + '"', '#FFD700');
      
      if (this.isProcessing || this.isProcessingPlus) return;
      
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        this.processInput(this.buffer);
      }, CONFIG.recognition.processingDelay);
    };
    
    this.recognition.onerror = (event) => {
      logger.error('Recognition greška:', event.error);
      
      if (event.error === 'not-allowed') {
        UI.showStatus('❌ Dozvolite pristup mikrofonu.', '#f44336');
      } else if (event.error === 'no-speech') {
        logger.debug('Nema govora, čekam...');
      } else if (event.error === 'audio-capture') {
        logger.warn('Problem sa mikrofonom, restartujem...');
        this.restart();
      }
      
      this.isProcessing = false;
    };
    
    this.recognition.onend = () => {
      this.isRunning = false;
      logger.info('🎤 Prepoznavanje završeno');
      clearTimeout(this.timeoutId);
      
      // Restart ako smo na odgovarajućem ekranu
      const dataEntry = document.getElementById('dataEntryScreen');
      const mainScreen = document.getElementById('mainScreen');
      
      if ((dataEntry && dataEntry.style.display === 'flex') ||
          (mainScreen && mainScreen.style.display === 'flex')) {
        if (!this.isProcessing && !this.isProcessingPlus && !this.isRunning) {
          logger.debug('Restartujem recognition za 2 sekunde...');
          setTimeout(() => {
            if (!this.isRunning && !this.isProcessingPlus) {
              this.start();
            }
          }, CONFIG.recognition.restartDelay);
        }
      }
    };
  },
  
  start() {
    if (this.isRunning) {
      logger.debug('Recognition već radi');
      return;
    }
    
    if (!this.recognition) {
      this.init();
    }
    
    try {
      this.recognition.start();
      logger.info('✅ Mikrofon pokrenut');
    } catch (e) {
      logger.error('Greška pri pokretanju:', e);
      UI.showStatus('❌ Greška pri pokretanju mikrofona', '#f44336');
      this.recognition = null;
      setTimeout(() => this.start(), 2000);
    }
  },
  
  stop() {
    clearTimeout(this.timeoutId);
    this.isProcessing = false;
    this.isProcessingPlus = false;
    this.buffer = '';
    
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        logger.warn('Greška pri zaustavljanju:', e);
      }
    }
    this.isRunning = false;
    logger.debug('Voice recognition zaustavljen');
  },
  
  restart() {
    logger.info('Restartujem mikrofon...');
    this.stop();
    setTimeout(() => this.start(), 500);
  },
  
  processInput(buffer) {
    if (!buffer || buffer.trim().length === 0) return;
    if (this.isProcessing || this.isProcessingPlus) return;
    
    const lower = buffer.toLowerCase();
    logger.debug(`Procesiranje: "${lower}"`);
    
    // 1. DETEKTUJ PLUS
    if (/\bplus\b/i.test(lower)) {
      this.handlePlus(buffer);
      return;
    }
    
    // 2. DETEKTUJ END
    if (/\b(end|kraj|gotovo)\b/i.test(lower)) {
      this.handleEnd(buffer);
      return;
    }
    
    // 3. DETEKTUJ KOMANDU
    const command = Parser.detectCommand(buffer);
    if (command) {
      this.handleCommand(command, buffer);
      return;
    }
    
    // 4. POKUŠAJ DA PARSIRAŠ KAO UNOS
    if (buffer.length > 5) {
      this.handleAdd(buffer);
    } else {
      UI.showStatus('❌ ' + LANGUAGE.getMessage('not_recognized'), '#f44336');
      this.buffer = '';
    }
  },
  
  handleCommand(command, buffer) {
    this.isProcessing = true;
    logger.info(`Komanda: ${command}`);
    
    switch(command) {
      case 'add':
        this.handleAdd(buffer);
        break;
      case 'list':
        UI.showStatus('📋 ' + LANGUAGE.getMessage('list_mode'), '#4CAF50');
        this.stop();
        setTimeout(() => {
          UI.showDataEntry();
        }, 300);
        break;
      case 'stock':
        UI.showStatus('📦 ' + LANGUAGE.getMessage('stock_mode'), '#4CAF50');
        this.stop();
        setTimeout(() => {
          UI.showDataEntry();
        }, 300);
        break;
      case 'close':
        UI.showStatus('🔚 ' + LANGUAGE.getMessage('closing'), '#FF9800');
        this.stop();
        setTimeout(() => UI.goBack(), 300);
        break;
      default:
        UI.showStatus('❌ ' + LANGUAGE.getMessage('not_recognized'), '#f44336');
    }
    
    this.buffer = '';
    setTimeout(() => {
      this.isProcessing = false;
    }, 500);
  },
  
  handleAdd(buffer) {
    this.isProcessing = true;
    
    let text = buffer;
    const commands = LANGUAGE.getCommands();
    
    // Ukloni komandu za dodavanje
    for (let word of commands.add) {
      if (text.toLowerCase().includes(word.toLowerCase())) {
        const parts = text.split(new RegExp(word, 'i'));
        text = parts.slice(1).join(' ').trim();
        break;
      }
    }
    
    text = text.replace(/^start\s*/i, '').replace(/^šta\s*/i, '').trim();
    
    if (text.length > 2) {
      this.saveItem(text);
    } else {
      UI.showDataEntry();
      this.isProcessing = false;
    }
    
    this.buffer = '';
    setTimeout(() => {
      this.isProcessing = false;
    }, 500);
  },
  
  handlePlus(buffer) {
    if (this.isProcessingPlus) {
      logger.debug('Plus se već obrađuje');
      return;
    }
    
    this.isProcessingPlus = true;
    this.isProcessing = true;
    logger.info('✅ PLUS detektovan');
    
    const parts = buffer.split(/\bplus\b/i);
    let text = parts[0].trim().replace(/^start\s*/i, '').trim();
    
    if (text.length > 2) {
      this.saveItem(text);
    } else {
      UI.showStatus('⚠️ Nema podataka za čuvanje.', '#FF9800');
    }
    
    this.buffer = '';
    setTimeout(() => {
      this.isProcessing = false;
      this.isProcessingPlus = false;
    }, 1200);
  },
  
  handleEnd(buffer) {
    this.isProcessing = true;
    logger.info('🏁 END detektovan');
    
    let text = buffer;
    const endWords = ['end', 'kraj', 'gotovo'];
    
    for (let word of endWords) {
      if (text.toLowerCase().includes(word)) {
        const parts = text.split(new RegExp(word, 'i'));
        text = parts[0].trim();
        break;
      }
    }
    
    text = text.replace(/^start\s*/i, '').trim();
    
    if (text.length > 2) {
      this.saveItem(text);
    }
    
    this.buffer = '';
    setTimeout(() => {
      this.stop();
      UI.showDataEntry();
      this.isProcessing = false;
    }, 400);
  },
  
  saveItem(text) {
    const data = Parser.parse(text);
    
    if (!data) {
      UI.showStatus('❌ Nisam prepoznao: "' + text + '"', '#f44336');
      return false;
    }
    
    logger.info('Čuvanje podataka:', data);
    
    // Sačuvaj u inventar
    const result = Inventory.add(data);
    
    // Popuni formu
    UI.populateForm(data);
    
    // Osveži prikaze
    setTimeout(() => {
      UI.refresh();
    }, 200);
    
    // Prikaži status
    const message = result.action === 'merged' ? 
      `✅ Sabrano: ${data.productName} (ukupno ${result.item.quantity} ${data.unit})` :
      `✅ ${LANGUAGE.getMessage('saving')} ${data.productName}`;
    
    UI.showStatus(message, '#4CAF50');
    
    // Očisti formu za sledeći unos
    setTimeout(() => {
      UI.clearForm();
      UI.showStatus(
        `✅ Sačuvano: ${data.productName}. ${LANGUAGE.getMessage('new_entry')}`,
        '#4CAF50'
      );
      this.buffer = '';
    }, 1200);
    
    return true;
  }
};

// ============================================
// 8. GLAVNA APLIKACIJA
// ============================================

const App = {
  initialized: false,
  
  init() {
    if (this.initialized) return;
    
    logger.info('🚀 Pokretanje Voice App...');
    
    // Inicijalizuj UI
    UI.init();
    
    // Postavi jezik
    const savedLang = localStorage.getItem('voiceLang') || 'sr';
    LANGUAGE.setLang(savedLang);
    
    // Inicijalizuj Voice
    Voice.init();
    
    // Eksponiraj funkcije za HTML
    this.setupGlobalHandlers();
    
    // Periodična provera mikrofona
    setInterval(() => {
      this.ensureMicrophoneRunning();
    }, 8000);
    
    this.initialized = true;
    logger.info('✅ Voice App pokrenuta!');
    logger.info(`🎤 Jezici: sr, en, de, hu, uk, ru, zh, es, pt, fr`);
    logger.info(`🌍 Trenutni jezik: ${LANGUAGE.current}`);
    logger.info('📝 Komande: DODAJ, SPISAK, ZALIHE, EXIT');
  },
  
  setupGlobalHandlers() {
    window.selectVoiceMode = () => {
      logger.info('🎤 selectVoiceMode pozvan');
      Voice.stop();
      UI.showVoiceMenu();
      setTimeout(() => Voice.start(), 500);
    };
    
    window.goBackFromVoice = () => {
      Voice.stop();
      UI.goBack();
    };
    
    window.restartMicrophone = () => Voice.restart();
    window.startVoiceRecognition = () => Voice.start();
    window.stopVoiceRecognition = () => Voice.stop();
    window.showDataEntry = () => UI.showDataEntry();
    window.showInventory = () => UI.showDataEntry();
    
    // Debug
    if (CONFIG.debug) {
      window.__voice = Voice;
      window.__inventory = Inventory;
      window.__ui = UI;
    }
  },
  
  ensureMicrophoneRunning() {
    if (!Voice.isRunning && !Voice.isProcessingPlus) {
      const dataEntry = document.getElementById('dataEntryScreen');
      const mainScreen = document.getElementById('mainScreen');
      
      if ((dataEntry && dataEntry.style.display === 'flex') ||
          (mainScreen && mainScreen.style.display === 'flex')) {
        logger.debug('Mikrofon nije aktivan, restartujem...');
        Voice.start();
        return true;
      }
    }
    return false;
  }
};

// ============================================
// 9. START
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// ============================================
// KRAJ - POTPUNI RADNI KOD
// ============================================
