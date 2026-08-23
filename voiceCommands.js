// ============================================
// VOICE COMMANDS - PROFESIONALNA VERZIJA
// Arhitektura: Modularna, Testabilna, Održiva
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
    processingDelay: 500,
    silenceTimeout: 3000
  },
  defaults: {
    shelfLife: 6,
    storage: 'Zamrzivač 1',
    unit: 'kom',
    piece: 1,
    quantity: 1
  },
  ui: {
    refreshDelay: 200,
    clearDelay: 300,
    saveDelay: 1200
  },
  languages: ['sr', 'en', 'de', 'hu', 'uk', 'ru', 'zh', 'es', 'pt', 'fr'],
  debug: true
};

// ============================================
// 2. LOGGER SISTEM
// ============================================

class Logger {
  constructor(level = 'info') {
    this.level = level;
    this.levels = { debug: 0, info: 1, warn: 2, error: 3 };
    this.prefix = '[VOICE]';
  }

  debug(msg, data = null) { this.log('debug', msg, data); }
  info(msg, data = null) { this.log('info', msg, data); }
  warn(msg, data = null) { this.log('warn', msg, data); }
  error(msg, data = null) { this.log('error', msg, data); }

  log(level, msg, data) {
    if (!CONFIG.debug && level === 'debug') return;
    if (this.levels[level] < this.levels[this.level]) return;
    
    const timestamp = new Date().toISOString();
    const logMsg = `${timestamp} ${this.prefix} [${level.toUpperCase()}] ${msg}`;
    
    if (data) {
      console[level](logMsg, data);
    } else {
      console[level](logMsg);
    }
  }
}

const logger = new Logger(CONFIG.debug ? 'debug' : 'info');

// ============================================
// 3. JEZIČKI SISTEM
// ============================================

class LanguageManager {
  constructor() {
    this.currentLang = 'sr';
    this.dictionaries = this.loadDictionaries();
  }

  loadDictionaries() {
    return {
      sr: {
        commands: { add: ['dodaj', 'unos', 'unesi'], list: ['spisak', 'lista'], stock: ['zalihe', 'zaliha'], close: ['exit', 'izlaz'] },
        buttons: { add: '📝 DODAJ', list: '📋 SPISAK', stock: '📦 ZALIHE', close: '🚪 EXIT' },
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
        commands: { add: ['add', 'new', 'enter'], list: ['list', 'inventory'], stock: ['stock', 'status'], close: ['exit'] },
        buttons: { add: '📝 ADD', list: '📋 LIST', stock: '📦 STOCK', close: '🚪 EXIT' },
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
      // Dodajte ostale jezike po potrebi...
    };
  }

  getLang() {
    return this.currentLang;
  }

  setLang(lang) {
    if (this.dictionaries[lang]) {
      this.currentLang = lang;
      logger.info(`Jezik promenjen na: ${lang}`);
      return true;
    }
    logger.warn(`Jezik ${lang} nije podržan`);
    return false;
  }

  getMessage(key) {
    const dict = this.dictionaries[this.currentLang] || this.dictionaries.sr;
    return dict.messages[key] || this.dictionaries.sr.messages[key] || key;
  }

  getButtonLabel(action) {
    const dict = this.dictionaries[this.currentLang] || this.dictionaries.sr;
    return dict.buttons[action] || action.toUpperCase();
  }

  getCommands() {
    const dict = this.dictionaries[this.currentLang] || this.dictionaries.sr;
    return dict.commands;
  }

  getSpeechLang() {
    const map = {
      sr: 'sr-RS', en: 'en-US', de: 'de-DE', hu: 'hu-HU',
      uk: 'uk-UA', ru: 'ru-RU', zh: 'zh-CN', es: 'es-ES',
      pt: 'pt-PT', fr: 'fr-FR'
    };
    return map[this.currentLang] || 'sr-RS';
  }
}

const languageManager = new LanguageManager();

// ============================================
// 4. PARSER SISTEM
// ============================================

class VoiceParser {
  constructor() {
    this.numberWords = {
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
    };

    this.unitMap = {
      'kilogram': 'kg', 'kilograma': 'kg', 'kg': 'kg',
      'gram': 'g', 'grama': 'g', 'g': 'g',
      'litar': 'l', 'litara': 'l', 'l': 'l',
      'komad': 'kom', 'komada': 'kom', 'kom': 'kom',
      'paket': 'pak', 'paketa': 'pak', 'pak': 'pak'
    };

    this.storageMap = {
      'zamrzivač': 'Zamrzivač 1', 'zamrzivac': 'Zamrzivač 1',
      'zamrzivač 1': 'Zamrzivač 1', 'zamrzivac 1': 'Zamrzivač 1',
      'zamrzivač 2': 'Zamrzivač 2', 'zamrzivac 2': 'Zamrzivač 2',
      'zamrzivač 3': 'Zamrzivač 3', 'zamrzivac 3': 'Zamrzivač 3',
      'frižider': 'Frižider', 'frizider': 'Frižider',
      'ostava': 'Ostava', 'špajz': 'Ostava'
    };

    this.skipWords = ['u', 'za', 'rok', 'trajanje', 'na', 'mesec', 'meseca', 'meseci', 'mesecima', 'i'];
  }

  parse(text) {
    logger.debug('Parsiranje teksta:', text);
    
    if (!text || text.trim().length < 2) {
      return null;
    }

    // Normalizuj tekst
    let normalized = this.normalizeText(text);
    const words = normalized.split(/\s+/).filter(Boolean);
    
    // Inicijalizuj rezultat
    const result = {
      productName: '',
      piece: CONFIG.defaults.piece,
      quantity: CONFIG.defaults.quantity,
      unit: CONFIG.defaults.unit,
      shelfLife: CONFIG.defaults.shelfLife,
      storage: CONFIG.defaults.storage
    };

    // Ekstraktuj podatke
    const extracted = this.extractData(words);
    
    // Popuni rezultat
    Object.assign(result, extracted);
    
    // Validacija
    if (!this.validateResult(result)) {
      logger.warn('Parsiranje neuspešno:', result);
      return null;
    }

    logger.debug('Parsiranje uspešno:', result);
    return result;
  }

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
  }

  extractData(words) {
    const data = {
      productName: '',
      piece: CONFIG.defaults.piece,
      quantity: CONFIG.defaults.quantity,
      unit: CONFIG.defaults.unit,
      shelfLife: CONFIG.defaults.shelfLife,
      storage: CONFIG.defaults.storage
    };

    let foundStorage = null;
    let foundUnit = null;
    let storageIndex = -1;
    let unitIndex = -1;

    // Prvo pronađi jedinice i skladišta
    words.forEach((word, index) => {
      const storage = this.extractStorage(word);
      if (storage) {
        foundStorage = storage;
        storageIndex = index;
      }
      
      const unit = this.extractUnit(word);
      if (unit) {
        foundUnit = unit;
        unitIndex = index;
      }
    });

    // Postavi skladište
    data.storage = foundStorage || CONFIG.defaults.storage;

    // Ekstraktuj brojeve i naziv
    const nameParts = [];
    const numbers = [];

    words.forEach((word, index) => {
      if (index === storageIndex || index === unitIndex) return;
      if (this.skipWords.includes(word.toLowerCase())) return;

      const number = this.extractNumber(word);
      if (number !== null) {
        numbers.push(number);
      } else {
        nameParts.push(word);
      }
    });

    // Rasporedi brojeve
    this.assignNumbers(numbers, data, words);

    // Postavi jedinicu
    if (foundUnit) {
      data.unit = foundUnit;
    } else {
      data.unit = this.detectUnit(words) || CONFIG.defaults.unit;
    }

    // Postavi naziv proizvoda
    data.productName = nameParts.join(' ').trim() || 'Proizvod';

    return data;
  }

  extractNumber(word) {
    const w = word.toLowerCase().trim();
    if (this.numberWords[w] !== undefined) return this.numberWords[w];
    if (/^\d+(?:[.,]\d+)?$/.test(w)) return w.replace(',', '.');
    return null;
  }

  extractUnit(word) {
    const w = word.toLowerCase();
    for (let [key, value] of Object.entries(this.unitMap)) {
      if (w === key || w.includes(key)) {
        return value;
      }
    }
    return null;
  }

  extractStorage(word) {
    const w = word.toLowerCase();
    for (let [key, value] of Object.entries(this.storageMap)) {
      if (w.includes(key) || key.includes(w)) {
        return value;
      }
    }
    return null;
  }

  detectUnit(words) {
    const text = words.join(' ').toLowerCase();
    if (text.includes('gram') || text.includes('grama') || text.includes('g ')) return 'g';
    if (text.includes('kilogram') || text.includes('kg')) return 'kg';
    if (text.includes('litar') || text.includes('l ')) return 'l';
    if (text.includes('komad') || text.includes('kom')) return 'kom';
    return null;
  }

  assignNumbers(numbers, data, words) {
    const text = words.join(' ').toLowerCase();

    if (numbers.length >= 3) {
      data.piece = numbers[0];
      data.quantity = numbers[1];
      data.shelfLife = numbers[2];
      return;
    }

    if (numbers.length === 2) {
      // Proveri da li je drugi broj rok trajanja
      if (parseFloat(numbers[1]) > 3 && !text.includes('kilogram') && !text.includes('kg')) {
        data.piece = numbers[0];
        data.quantity = numbers[0];
        data.shelfLife = numbers[1];
      } else {
        data.piece = numbers[0];
        data.quantity = numbers[1];
      }
      return;
    }

    if (numbers.length === 1) {
      data.piece = numbers[0];
      data.quantity = numbers[0];
    }

    // Detektuj rok trajanja
    let shelfLifeFound = false;
    
    // Proveri "šest", "6", "6 meseci"
    if (text.includes('šest') || text.includes('sest') || /\b6\b/.test(text)) {
      data.shelfLife = '6';
      shelfLifeFound = true;
    }

    if (!shelfLifeFound) {
      const match = text.match(/(\d+)\s*meseci/);
      if (match) {
        data.shelfLife = match[1];
        shelfLifeFound = true;
      }
    }

    if (!shelfLifeFound && numbers.length >= 3) {
      data.shelfLife = numbers[2];
    }
  }

  validateResult(result) {
    if (!result.productName || result.productName === 'Proizvod' || result.productName.length < 2) {
      return false;
    }
    return true;
  }

  detectCommand(text) {
    const commands = languageManager.getCommands();
    const lower = text.toLowerCase().trim();

    // Prvo proveri EXIT
    if (lower.includes('exit')) {
      return 'close';
    }

    // Proveri ostale komande
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

  isAddCommand(text) {
    const commands = languageManager.getCommands();
    const lower = text.toLowerCase();
    return commands.add.some(cmd => lower.includes(cmd.toLowerCase()));
  }
}

const parser = new VoiceParser();

// ============================================
// 5. INVENTORY MANAGER
// ============================================

class InventoryManager {
  constructor() {
    this.items = [];
    this.listeners = [];
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('inventory');
      if (saved) {
        this.items = JSON.parse(saved);
        logger.info(`Učitano ${this.items.length} stavki iz localStorage`);
      }
    } catch (error) {
      logger.error('Greška pri učitavanju inventara:', error);
      this.items = [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('inventory', JSON.stringify(this.items));
      logger.debug('Inventar sačuvan u localStorage');
    } catch (error) {
      logger.error('Greška pri čuvanju inventara:', error);
    }
  }

  addItem(data) {
    const existing = this.findExisting(data);
    
    if (existing) {
      return this.mergeItem(existing, data);
    } else {
      return this.createItem(data);
    }
  }

  findExisting(data) {
    return this.items.find(item => 
      item.productName &&
      item.productName.toLowerCase() === data.productName.toLowerCase() &&
      item.unit === data.unit &&
      item.storage === data.storage
    );
  }

  mergeItem(existing, data) {
    const newQuantity = parseFloat(existing.quantity) + parseFloat(data.quantity);
    const newPiece = parseFloat(existing.piece) + parseFloat(data.piece);
    
    existing.quantity = newQuantity;
    existing.piece = newPiece;
    existing.shelfLife = parseInt(data.shelfLife) || CONFIG.defaults.shelfLife;
    existing.expiryDate = this.calculateExpiry(existing.shelfLife);
    existing.dateAdded = new Date().toISOString();
    existing.lastUpdated = new Date().toISOString();

    logger.info(`Merged item: ${existing.productName} (${newQuantity} ${existing.unit})`);
    this.saveToStorage();
    this.notifyListeners('merged', existing);
    
    return { item: existing, action: 'merged' };
  }

  createItem(data) {
    const newItem = {
      id: Date.now(),
      productName: data.productName,
      piece: parseFloat(data.piece) || CONFIG.defaults.piece,
      quantity: parseFloat(data.quantity) || CONFIG.defaults.quantity,
      unit: data.unit || CONFIG.defaults.unit,
      shelfLife: parseInt(data.shelfLife) || CONFIG.defaults.shelfLife,
      storage: data.storage || CONFIG.defaults.storage,
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      expiryDate: this.calculateExpiry(parseInt(data.shelfLife) || CONFIG.defaults.shelfLife),
      isNew: true
    };

    this.items.push(newItem);
    logger.info(`Added new item: ${newItem.productName}`);
    this.saveToStorage();
    this.notifyListeners('added', newItem);
    
    return { item: newItem, action: 'added' };
  }

  calculateExpiry(shelfLifeMonths) {
    const date = new Date();
    date.setMonth(date.getMonth() + shelfLifeMonths);
    return date.toISOString();
  }

  getAllItems() {
    return [...this.items];
  }

  getGroupedByProduct() {
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
  }

  clearAll() {
    this.items = [];
    this.saveToStorage();
    this.notifyListeners('cleared', null);
    logger.info('Inventar očišćen');
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        logger.error('Greška u listeneru:', error);
      }
    });
  }
}

const inventoryManager = new InventoryManager();

// ============================================
// 6. UI MANAGER
// ============================================

class UIManager {
  constructor() {
    this.cache = {};
    this.cacheElements();
    this.setupEventListeners();
  }

  cacheElements() {
    const ids = [
      'voiceStatus', 'voiceMenuScreen', 'dataEntryScreen', 
      'mainScreen', 'inventoryScreen', 'choiceScreen',
      'productInput', 'pieceInput', 'quantityInput', 
      'shelfLifeInput', 'unitSelect', 'storageSelect'
    ];
    
    ids.forEach(id => {
      this.cache[id] = document.getElementById(id);
    });

    // Dodatni kontejneri
    this.cache.entriesContainer = document.getElementById('entriesContainer') || 
      document.getElementById('entryList') || 
      document.getElementById('productList') || 
      document.getElementById('inventoryList');
  }

  setupEventListeners() {
    // Slušaj na promene u inventaru
    inventoryManager.addListener((event, data) => {
      if (event === 'added' || event === 'merged' || event === 'cleared') {
        this.refreshAll();
      }
    });
  }

  showVoiceStatus(text, color = '#2196F3') {
    const status = this.cache.voiceStatus;
    if (status) {
      status.textContent = text;
      status.style.color = color;
    }
    logger.debug(`Status: ${text}`);
  }

  hideVoiceMenu() {
    const menu = this.cache.voiceMenuScreen;
    if (menu) {
      menu.style.display = 'none';
      menu.classList.remove('active');
    }
  }

  showScreen(screenId) {
    // Sakrij sve ekrane
    document.querySelectorAll('.screen').forEach(s => {
      s.style.display = 'none';
      s.classList.remove('active');
    });

    // Prikaži traženi ekran
    const screen = this.cache[screenId] || document.getElementById(screenId);
    if (screen) {
      screen.style.display = 'flex';
      screen.classList.add('active');
      logger.debug(`Prikazan ekran: ${screenId}`);
    } else {
      logger.warn(`Ekran ${screenId} nije pronađen`);
    }
  }

  showDataEntry() {
    this.showScreen('dataEntryScreen');
    this.clearForm();
  }

  showInventory() {
    this.showScreen('inventoryScreen');
    this.renderInventory();
  }

  showMain() {
    this.showScreen('mainScreen');
  }

  showChoice() {
    this.showScreen('choiceScreen');
  }

  showVoiceMenu() {
    this.showScreen('voiceMenuScreen');
  }

  clearForm() {
    logger.debug('Čišćenje forme...');
    
    const fields = ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput'];
    fields.forEach(id => {
      const el = this.cache[id];
      if (el) {
        el.value = '';
        this.triggerEvent(el, 'input');
        this.triggerEvent(el, 'change');
      }
    });

    // Resetuj select-ove
    const unitSelect = this.cache.unitSelect;
    if (unitSelect) {
      for (let option of unitSelect.options) {
        if (option.value === CONFIG.defaults.unit) {
          option.selected = true;
          this.triggerEvent(unitSelect, 'change');
          break;
        }
      }
    }

    const storageSelect = this.cache.storageSelect;
    if (storageSelect) {
      for (let option of storageSelect.options) {
        if (option.value === CONFIG.defaults.storage) {
          option.selected = true;
          this.triggerEvent(storageSelect, 'change');
          break;
        }
      }
    }
  }

  populateForm(data) {
    logger.debug('Popunjavanje forme:', data);
    
    const fields = {
      productInput: data.productName,
      pieceInput: data.piece,
      quantityInput: data.quantity,
      shelfLifeInput: data.shelfLife
    };

    Object.entries(fields).forEach(([id, value]) => {
      const el = this.cache[id];
      if (el) {
        el.value = value || '';
        this.triggerEvent(el, 'input');
        this.triggerEvent(el, 'change');
      }
    });

    // Postavi jedinicu
    if (data.unit) {
      const unitSelect = this.cache.unitSelect;
      if (unitSelect) {
        for (let option of unitSelect.options) {
          if (option.value === data.unit || option.text.toLowerCase().includes(data.unit)) {
            option.selected = true;
            this.triggerEvent(unitSelect, 'change');
            break;
          }
        }
      }
    }

    // Postavi skladište
    if (data.storage) {
      const storageSelect = this.cache.storageSelect;
      if (storageSelect) {
        for (let option of storageSelect.options) {
          if (option.value === data.storage || option.text.includes(data.storage)) {
            option.selected = true;
            this.triggerEvent(storageSelect, 'change');
            break;
          }
        }
      }
    }

    // Update expiry date
    if (typeof updateExpiryDate === 'function') {
      try { updateExpiryDate(); } catch(e) {}
    }
  }

  triggerEvent(element, eventType) {
    if (element) {
      const event = new Event(eventType, { bubbles: true });
      element.dispatchEvent(event);
    }
  }

  renderInventory() {
    const container = this.cache.entriesContainer || 
                     document.getElementById('inventoryContainer') ||
                     document.getElementById('inventoryList');

    if (!container) {
      logger.warn('Nema kontejnera za prikaz zaliha');
      return;
    }

    const items = inventoryManager.getGroupedByProduct();
    
    if (items.length === 0) {
      container.innerHTML = `
        <div style="color: #888; text-align: center; padding: 20px;">
          📭 Nema zaliha
        </div>
      `;
      return;
    }

    let html = `
      <div style="font-size: 0.9rem;">
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
  }

  refreshAll() {
    logger.debug('Osvežavanje svih prikaza...');
    
    // Osveži inventory
    this.renderInventory();
    
    // Pozovi i druge funkcije ako postoje
    if (typeof prikaziSveUnose === 'function') {
      try { prikaziSveUnose(); } catch(e) {}
    }
    if (typeof renderInventory === 'function') {
      try { renderInventory(); } catch(e) {}
    }
    if (typeof renderProductList === 'function') {
      try { renderProductList(); } catch(e) {}
    }
  }

  // Pomoćne metode za navigaciju
  goBack() {
    logger.debug('Povratak na prethodni ekran');
    this.showChoice();
    if (typeof updateHeaderLanguage === 'function') {
      updateHeaderLanguage();
    }
    if (typeof updateInterfaceLanguage === 'function') {
      updateInterfaceLanguage();
    }
  }
}

const uiManager = new UIManager();

// ============================================
// 7. VOICE RECOGNITION MANAGER
// ============================================

class VoiceRecognitionManager {
  constructor() {
    this.recognition = null;
    this.activeBuffer = '';
    this.isProcessing = false;
    this.isProcessingPlus = false;
    this.timeoutId = null;
    this.isRunning = false;
    this.setupRecognition();
  }

  setupRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      logger.error('Browser ne podržava Speech Recognition');
      uiManager.showVoiceStatus('❌ Browser ne podržava glasovno prepoznavanje.', '#f44336');
      return null;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = languageManager.getSpeechLang();
    this.recognition.continuous = CONFIG.recognition.continuous;
    this.recognition.interimResults = CONFIG.recognition.interimResults;
    this.recognition.maxAlternatives = CONFIG.recognition.maxAlternatives;

    this.setupEventHandlers();
    return this.recognition;
  }

  setupEventHandlers() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isRunning = true;
      logger.info('🎤 Mikrofon aktiviran');
      uiManager.showVoiceStatus('🎤 ' + languageManager.getMessage('welcome'), '#2196F3');
      this.activeBuffer = '';
      this.isProcessing = false;
    };

    this.recognition.onresult = (event) => {
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
        this.activeBuffer += (this.activeBuffer ? ' ' : '') + finalChunk;
        logger.debug(`Buffer: "${this.activeBuffer}"`);
      }
      
      const displayText = this.activeBuffer + (interimText ? ' ' + interimText : '');
      uiManager.showVoiceStatus('🎤 ' + languageManager.getMessage('listening') + ' "' + displayText + '"', '#FFD700');
      
      if (this.isProcessing || this.isProcessingPlus) return;
      
      // Odloži procesiranje za tišinu
      this.clearTimeout();
      this.timeoutId = setTimeout(() => {
        this.processInput(this.activeBuffer);
      }, CONFIG.recognition.processingDelay);
    };

    this.recognition.onerror = (event) => {
      logger.error('Recognition greška:', event.error);
      
      if (event.error === 'not-allowed') {
        uiManager.showVoiceStatus('❌ Dozvolite pristup mikrofonu.', '#f44336');
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
      this.clearTimeout();
      
      // Automatski restart ako smo na odgovarajućem ekranu
      const dataEntryScreen = document.getElementById('dataEntryScreen');
      const mainScreen = document.getElementById('mainScreen');
      
      if ((dataEntryScreen && dataEntryScreen.style.display === 'flex') ||
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
  }

  start() {
    if (this.isRunning) {
      logger.debug('Recognition već radi');
      return;
    }

    if (!this.recognition) {
      this.setupRecognition();
    }

    try {
      this.recognition.start();
      logger.info('✅ Mikrofon pokrenut');
    } catch (error) {
      logger.error('Greška pri pokretanju mikrofona:', error);
      uiManager.showVoiceStatus('❌ Greška pri pokretanju mikrofona', '#f44336');
      this.recognition = null;
      
      // Pokušaj ponovo
      setTimeout(() => this.start(), 2000);
    }
  }

  stop() {
    this.clearTimeout();
    this.isProcessing = false;
    this.isProcessingPlus = false;
    this.activeBuffer = '';
    
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        logger.warn('Greška pri zaustavljanju:', error);
      }
    }
    this.isRunning = false;
  }

  restart() {
    logger.info('Restartujem mikrofon...');
    this.stop();
    setTimeout(() => this.start(), 500);
  }

  clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  processInput(buffer) {
    if (!buffer || buffer.trim().length === 0) {
      return;
    }

    if (this.isProcessing || this.isProcessingPlus) {
      return;
    }

    const lowerFull = buffer.toLowerCase();
    logger.debug(`Procesiranje: "${lowerFull}"`);

    // 1. DETEKTUJ "PLUS"
    if (/\bplus\b/i.test(lowerFull)) {
      this.handlePlusCommand(buffer);
      return;
    }

    // 2. DETEKTUJ "END"
    if (/\b(end|kraj|gotovo)\b/i.test(lowerFull)) {
      this.handleEndCommand(buffer);
      return;
    }

    // 3. DETEKTUJ KOMANDU
    const command = parser.detectCommand(buffer);
    if (command) {
      this.handleCommand(command, buffer);
      return;
    }

    // 4. POKUŠAJ DA PARSIRAŠ KAO UNOS
    if (buffer.length > 5) {
      this.handleAddCommand(buffer);
    } else {
      uiManager.showVoiceStatus('❌ ' + languageManager.getMessage('not_recognized'), '#f44336');
      this.activeBuffer = '';
    }
  }

  handleCommand(command, buffer) {
    this.isProcessing = true;
    logger.info(`Komanda: ${command}`);

    switch(command) {
      case 'add':
        this.handleAddCommand(buffer);
        break;
      case 'list':
        uiManager.showVoiceStatus('📋 ' + languageManager.getMessage('list_mode'), '#4CAF50');
        this.stop();
        setTimeout(() => uiManager.showInventory(), 300);
        break;
      case 'stock':
        uiManager.showVoiceStatus('📦 ' + languageManager.getMessage('stock_mode'), '#4CAF50');
        this.stop();
        setTimeout(() => uiManager.showInventory(), 300);
        break;
      case 'close':
        uiManager.showVoiceStatus('🔚 ' + languageManager.getMessage('closing'), '#FF9800');
        this.stop();
        setTimeout(() => uiManager.goBack(), 300);
        break;
      default:
        uiManager.showVoiceStatus('❌ ' + languageManager.getMessage('not_recognized'), '#f44336');
    }

    this.activeBuffer = '';
    setTimeout(() => {
      this.isProcessing = false;
    }, 500);
  }

  handleAddCommand(buffer) {
    this.isProcessing = true;
    
    // Izdvoji tekst komande
    let itemText = buffer;
    const commands = languageManager.getCommands();
    
    for (let word of commands.add) {
      if (itemText.toLowerCase().includes(word.toLowerCase())) {
        const parts = itemText.split(new RegExp(word, 'i'));
        itemText = parts.slice(1).join(' ').trim();
        break;
      }
    }

    itemText = itemText.replace(/^start\s*/i, '').trim();
    itemText = itemText.replace(/^šta\s*/i, '').trim();

    if (itemText.length > 2) {
      this.saveItem(itemText);
    } else {
      uiManager.showDataEntry();
      this.isProcessing = false;
    }

    this.activeBuffer = '';
    setTimeout(() => {
      this.isProcessing = false;
    }, 500);
  }

  handlePlusCommand(buffer) {
    if (this.isProcessingPlus) {
      logger.debug('Plus se već obrađuje');
      return;
    }

    this.isProcessingPlus = true;
    this.isProcessing = true;
    logger.info('✅ PLUS detektovan');

    const parts = buffer.split(/\bplus\b/i);
    let itemText = parts[0].trim();
    itemText = itemText.replace(/^start\s*/i, '').trim();

    if (itemText.length > 2) {
      this.saveItem(itemText);
    } else {
      uiManager.showVoiceStatus('⚠️ Nema podataka za čuvanje.', '#FF9800');
    }

    this.activeBuffer = '';
    setTimeout(() => {
      this.isProcessing = false;
      this.isProcessingPlus = false;
    }, 1200);
  }

  handleEndCommand(buffer) {
    this.isProcessing = true;
    logger.info('🏁 END detektovan');

    let itemText = buffer;
    const endWords = ['end', 'kraj', 'gotovo'];
    
    for (let word of endWords) {
      if (itemText.toLowerCase().includes(word)) {
        const parts = itemText.split(new RegExp(word, 'i'));
        itemText = parts[0].trim();
        break;
      }
    }

    itemText = itemText.replace(/^start\s*/i, '').trim();

    if (itemText.length > 2) {
      this.saveItem(itemText);
    }

    this.activeBuffer = '';
    
    setTimeout(() => {
      this.stop();
      uiManager.showInventory();
      this.isProcessing = false;
    }, 400);
  }

  saveItem(text) {
    const data = parser.parse(text);
    
    if (!data) {
      uiManager.showVoiceStatus('❌ Nisam prepoznao proizvod: "' + text + '"', '#f44336');
      return false;
    }

    logger.info('Čuvanje podataka:', data);

    // Sačuvaj u inventory
    const result = inventoryManager.addItem(data);
    
    // Popuni formu
    uiManager.populateForm(data);
    
    // Osveži prikaze
    setTimeout(() => {
      uiManager.refreshAll();
    }, CONFIG.ui.refreshDelay);

    // Prikaži status
    const message = result.action === 'merged' ? 
      `✅ Sabrano: ${data.productName} (ukupno ${result.item.quantity} ${data.unit})` :
      `✅ ${languageManager.getMessage('saving')} ${data.productName}`;
    
    uiManager.showVoiceStatus(message, '#4CAF50');

    // Očisti formu za sledeći unos
    setTimeout(() => {
      uiManager.clearForm();
      uiManager.showVoiceStatus(
        `✅ Sačuvano: ${data.productName}. ${languageManager.getMessage('new_entry')}`,
        '#4CAF50'
      );
      this.activeBuffer = '';
    }, CONFIG.ui.saveDelay);

    return true;
  }
}

const voiceManager = new VoiceRecognitionManager();

// ============================================
// 8. GLAVNA APLIKACIJA
// ============================================

class VoiceApp {
  constructor() {
    this.initialized = false;
    this.setupGlobalHandlers();
  }

  init() {
    if (this.initialized) return;
    
    logger.info('🚀 Pokretanje Voice App...');
    this.initialized = true;
    
    // Postavi jezik
    const savedLang = localStorage.getItem('voiceLang') || 'sr';
    languageManager.setLang(savedLang);
    
    // Pokreni periodicnu proveru
    setInterval(() => {
      this.ensureMicrophoneRunning();
    }, 8000);
    
    logger.info('✅ Voice App pokrenuta');
  }

  setupGlobalHandlers() {
    // Eksponiraj funkcije za HTML
    window.selectVoiceMode = this.selectVoiceMode.bind(this);
    window.goBackFromVoice = () => {
      voiceManager.stop();
      uiManager.goBack();
    };
    window.restartMicrophone = () => voiceManager.restart();
    
    // Eksponiraj za debug
    if (CONFIG.debug) {
      window.__voiceApp = this;
      window.__voiceManager = voiceManager;
      window.__inventoryManager = inventoryManager;
    }
  }

  selectVoiceMode() {
    logger.info('🎤 selectVoiceMode pozvan');
    voiceManager.stop();
    uiManager.showVoiceMenu();
    
    setTimeout(() => {
      voiceManager.start();
    }, 500);
  }

  ensureMicrophoneRunning() {
    if (!voiceManager.isRunning && !voiceManager.isProcessingPlus) {
      const dataEntryScreen = document.getElementById('dataEntryScreen');
      const mainScreen = document.getElementById('mainScreen');
      
      if ((dataEntryScreen && dataEntryScreen.style.display === 'flex') ||
          (mainScreen && mainScreen.style.display === 'flex')) {
        logger.debug('Mikrofon nije aktivan, restartujem...');
        voiceManager.start();
        return true;
      }
    }
    return false;
  }

  // Pomoćne metode za HTML
  startVoiceRecognition() {
    voiceManager.start();
  }

  stopVoiceRecognition() {
    voiceManager.stop();
  }

  showDataEntry() {
    uiManager.showDataEntry();
  }

  showInventory() {
    uiManager.showInventory();
  }
}

// ============================================
// 9. INICIJALIZACIJA
// ============================================

// Sačekaj da se DOM učita
document.addEventListener('DOMContentLoaded', () => {
  const app = new VoiceApp();
  app.init();
  
  // Eksponiraj globalno za pozive iz HTML-a
  window.voiceApp = app;
  window.voiceManager = voiceManager;
  window.uiManager = uiManager;
  window.inventoryManager = inventoryManager;
  
  logger.info('✅ SVE SPREMNO - Voice Commands aktivni!');
  logger.info(`🎤 Jezici: ${CONFIG.languages.join(', ')}`);
  logger.info(`🌍 Trenutni jezik: ${languageManager.getLang()}`);
  logger.info('📝 Komande: DODAJ, SPISAK, ZALIHE, EXIT');
});

// ============================================
// 10. IZVOZ ZA TESTIRANJE (opciono)
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CONFIG,
    Logger,
    LanguageManager,
    VoiceParser,
    InventoryManager,
    UIManager,
    VoiceRecognitionManager,
    VoiceApp
  };
}

// ============================================
// KRAJ - PROFESIONALNA VERZIJA
// ============================================
