// ============================================
// VOICE COMMANDS - SVI JEZICI I VARIJANTE
// ============================================
console.log('🎤 voiceCommands.js je učitan!');

// ============================================
// INVENTORY / ZALIHE - SVE VARIJANTE
// ============================================
function checkInventoryCommand(cmd) {
    const keywords = [
        // Engleski
        'inventory', 'inv', 'stock',
        // Srpski
        'zalihe', 'zaliha', 'zalih', 'zalehe', 'zali', 'zale', 'zal', 'stanje', 'stanja',
        // Mađarski
        'keslet', 'keszlet', 'készlet', 'kezlet', 'kesl', 'keszl', 'kezl',
        'kész', 'kesz', 'kes', 'kez', 'raktár', 'raktar', 'rakt',
        'leltár', 'leltar', 'lelt', 'áru', 'aru', 'ar',
        // Nemački
        'bestand', 'vorrat', 'lager', 'inventar', 'bestände', 'vorräte',
        // Ruski
        'запаси', 'запасы', 'запас', 'склад', 'инвентарь', 'остатки',
        // Ukrajinski
        'запаси', 'склад', 'інвентар',
        // Kineski
        '库存', 'kucun', 'cangku', '储藏', '存货',
        // Španski
        'inventario', 'almacén', 'existencia',
        // Portugalski
        'estoque', 'inventário', 'almoxarifado',
        // Francuski
        'inventaire', 'réserve', 'stocks'
    ];
    
    for (let keyword of keywords) {
        if (cmd.includes(keyword)) {
            return true;
        }
    }
    return false;
}

// ============================================
// SHOPPING / SPISAK - SVE VARIJANTE
// ============================================
function checkShoppingCommand(cmd) {
    const keywords = [
        // Engleski
        'shopping', 'shop', 'list',
        // Srpski
        'spisak', 'spiska', 'spis', 'potreba', 'potreb', 'potrebe', 'lista',
        // Mađarski
        'bevasarlas', 'vasarlas', 'bevásárlás', 'vásárlás',
        'bevasarlolista', 'bevásárlólista', 'bolti', 'bolt', 'bevasarl', 'vasarl',
        'bevásárl', 'lista',
        // Nemački
        'einkaufsliste', 'einkaufen', 'shoppingliste', 'einkauf', 'kaufen',
        // Ruski
        'список', 'спи', 'покупки', 'список покупок', 'шопинг',
        // Ukrajinski
        'список', 'покупки', 'шопінг',
        // Kineski
        '购物清单', 'gouwu', 'gouwudan', '购物列表', '清单',
        // Španski
        'lista de compras', 'lista', 'compra', 'listado',
        // Portugalski
        'lista de compras', 'compras', 'listagem',
        // Francuski
        'liste', 'liste de courses', 'course', 'courses'
    ];
    
    for (let keyword of keywords) {
        if (cmd.includes(keyword)) {
            return true;
        }
    }
    return false;
}

// ============================================
// ADD / DODAJ - SVE VARIJANTE
// ============================================
function checkAddCommand(cmd) {
    const keywords = [
        // Engleski
        'add', 'new', 'create',
        // Srpski
        'dodaj', 'dodavanje', 'dodat', 'doda', 'dodati', 'dod',
        'unos', 'novi', 'novo', 'product', 'proizvod', 'dodajte',
        // Mađarski
        'hozza', 'hozzá', 'hozzaad', 'hozzáad', 'hozzaadas', 'hozzáadás',
        'uj', 'új', 'termek', 'termék', 'hozzad', 'hozza', 'hozzáadni', 'beszúr',
        // Nemački
        'produkt', 'hinzufügen', 'neu', 'einfügen', 'addieren',
        // Ruski
        'додати', 'добавить', 'новый', 'добавление', 'продукт',
        // Ukrajinski
        'додати', 'новий', 'продукт',
        // Kineski
        '添加', 'tianjia', '新增', '新产品', '加入',
        // Španski
        'agregar', 'añadir', 'nuevo', 'producto', 'insertar',
        // Portugalski
        'adicionar', 'novo', 'produto', 'inserir',
        // Francuski
        'ajouter', 'nouveau', 'produit', 'insérer', 'produits'
    ];
    
    for (let keyword of keywords) {
        if (cmd.includes(keyword)) {
            return true;
        }
    }
    return false;
}

// ============================================
// EXIT / IZLAZ - SVE VARIJANTE
// ============================================
function checkExitCommand(cmd) {
    const keywords = [
        // Engleski
        'exit', 'quit', 'close', 'stop', 'end', 'bye',
        // Srpski
        'izlaz', 'izadji', 'izadi', 'izlazi', 'izlazak',
        'zatvori', 'zatvoriti', 'ugasiti', 'zavrsi', 'završiti', 'kraj', 'prekini',
        // Mađarski
        'kilep', 'kilép', 'kilepes', 'kilépés', 'kilepés', 'kilepni',
        'kis', 'bezár', 'beza', 'bezá', 'bezar', 'bezárt', 'vege', 'vége',
        // Nemački
        'beenden', 'schließen', 'ausgang', 'ende',
        // Ruski
        'вихід', 'выход', 'закрыть', 'выходить', 'конец', 'выйти',
        // Ukrajinski
        'вихід', 'закрити', 'вийти',
        // Kineski
        '退出', 'tuichu', '关闭', '结束', '离开',
        // Španski
        'salir', 'cerrar', 'finalizar', 'terminar', 'salida',
        // Portugalski
        'sair', 'fechar', 'finalizar', 'terminar', 'encerrar',
        // Francuski
        'quitter', 'fermer', 'sortir', 'terminer', 'quitt', 'arrêter'
    ];
    
    for (let keyword of keywords) {
        if (cmd.includes(keyword)) {
            return true;
        }
    }
    return false;
}

// ============================================
// VOICE COMMAND - GLAVNA FUNKCIJA
// ============================================
function voiceCommand(command) {
    console.log('🎤 Komanda:', command);
    
    const cmd = command.toLowerCase().trim();
    console.log('🔍 Procesiram:', cmd);
    
    // ============================================
// ZALIHE / INVENTORY
// ============================================
if (cmd.includes('zalihe') || cmd.includes('zaliha') || cmd.includes('zalih') || 
    cmd.includes('zalehe') || cmd.includes('zali') || cmd.includes('zale') ||
    cmd.includes('zal') || cmd.includes('stanje') || cmd.includes('stanja') ||
    cmd.includes('inventory') || cmd.includes('inv') || cmd.includes('stock') ||
    cmd.includes('keslet') || cmd.includes('keszlet') || cmd.includes('készlet') || 
    cmd.includes('kezlet') || cmd.includes('bestand') || cmd.includes('запаси') || 
    cmd.includes('запасы') || cmd.includes('库存') || cmd.includes('inventario') || 
    cmd.includes('estoque') || cmd.includes('raktár') || cmd.includes('raktar')) {
    console.log('📦 Otvaram originalne zalihe');
    currentScreenState = 'inventory';
    showScreen('mainScreen');
    renderInventory();  // ORIGINALNI renderInventory
    return true;
}
    
    // ============================================
// SPISAK / SHOPPING
// ============================================
if (cmd.includes('spisak') || cmd.includes('spiska') || cmd.includes('spis') || 
    cmd.includes('potreba') || cmd.includes('potreb') || cmd.includes('potrebe') ||
    cmd.includes('lista') || cmd.includes('shopping') || cmd.includes('shop') || 
    cmd.includes('list') || cmd.includes('bevásárlólista') || cmd.includes('bevasarlolista') ||
    cmd.includes('bevasarlas') || cmd.includes('vasarlas') || cmd.includes('bolti') ||
    cmd.includes('einkaufsliste') || cmd.includes('список') || cmd.includes('购物清单') ||
    cmd.includes('lista de compras') || cmd.includes('liste')) {
    console.log('🛒 Otvaram originalni spisak');
    currentScreenState = 'shopping';
    showScreen('mainScreen');
    renderShoppingList();  // ORIGINALNI renderShoppingList
    return true;
}
    
 // ============================================
// DODAJ / ADD - IDE NA KATEGORIJE (originalni tok)
// ============================================
if (cmd.includes('dodaj') || cmd.includes('dodavanje') || cmd.includes('dodat') || 
    cmd.includes('doda') || cmd.includes('unos') || cmd.includes('novi') || 
    cmd.includes('novo') || cmd.includes('add') || cmd.includes('product') ||
    cmd.includes('hozzáadás') || cmd.includes('hozzaadas') || cmd.includes('hozza') ||
    cmd.includes('termék') || cmd.includes('termek') || cmd.includes('produkt') || 
    cmd.includes('додати') || cmd.includes('добавить') || cmd.includes('添加') || 
    cmd.includes('agregar') || cmd.includes('adicionar') || cmd.includes('ajouter') || 
    cmd.includes('nouveau')) {
    console.log('➕ Otvaram originalni program - kategorije');
    // Resetuj stanje za novi unos
    currentScreenState = 'categories';
    currentCategory = '';
    currentSubcategory = '';
    currentProductPart = '';
    showScreen('mainScreen');
    renderCategories();  // ⭐ DIREKTNO, BEZ setTimeout
    return true;
}
    // ============================================
    // IZLAZ / EXIT
    // ============================================
    if (cmd.includes('izlaz') || cmd.includes('izadji') || cmd.includes('izadi') || 
        cmd.includes('izlazi') || cmd.includes('exit') || cmd.includes('quit') || 
        cmd.includes('close') || cmd.includes('kilépés') || cmd.includes('kilepes') || 
        cmd.includes('kilep') || cmd.includes('beenden') || cmd.includes('вихід') || 
        cmd.includes('выход') || cmd.includes('退出') || cmd.includes('salir') || 
        cmd.includes('sair') || cmd.includes('quitter') || cmd.includes('zatvori') || 
        cmd.includes('kis')) {
        console.log('🚪 Izlaz');
        exitApp();
        return true;
    }
    
    // ============================================
    // NEPOZNATA KOMANDA
    // ============================================
    console.log('❌ Nepoznata komanda:', cmd);
    
    const unknownTitle = t('unknown_command_title') || 'Nepoznata komanda';
    const notRecognized = t('not_recognized') || 'nije prepoznata';
    const tryCommands = t('try_commands') || 'Pokušajte: Zalihe, Spisak, Dodaj proizvod ili Izlaz';
    
    showModernAlert(
        unknownTitle,
        `"${command}" ${notRecognized}. ${tryCommands}`,
        '🎤'
    );
    return false;
}

console.log('✅ voiceCommands.js je spreman!');
