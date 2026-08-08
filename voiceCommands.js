// ============================================
// VOICE COMMANDS - SVI JEZICI I VARIJANTE
// ============================================

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
// GLAVNA FUNKCIJA ZA OBRADU KOMANDI
// ============================================
function processVoiceCommand(command) {
    console.log('🎤 Komanda:', command);
    
    const cmd = command.toLowerCase().trim();
    console.log('🔍 Procesiram:', cmd);
    
    // Proveri sve komande
    if (checkInventoryCommand(cmd)) {
        console.log('📦 Otvaram zalihe');
        showScreen('mainScreen');
        setTimeout(function() {
            renderInventory();
        }, 100);
        return true;
    }
    
    if (checkShoppingCommand(cmd)) {
        console.log('🛒 Otvaram spisak');
        showScreen('mainScreen');
        setTimeout(function() {
            renderShoppingList();
        }, 100);
        return true;
    }
    
    if (checkAddCommand(cmd)) {
        console.log('➕ Otvaram unos');
        showScreen('mainScreen');
        setTimeout(function() {
            renderDataEntry('');
        }, 100);
        return true;
    }
    
    if (checkExitCommand(cmd)) {
        console.log('🚪 Izlaz');
        exitApp();
        return true;
    }
    
    // Nije pronađena komanda
    console.log('❌ Nepoznata komanda:', cmd);
    return false;
}

// ============================================
// NOVA VOICE COMMAND FUNKCIJA
// ============================================
function voiceCommand(command) {
    const found = processVoiceCommand(command);
    
    if (!found) {
        // Prikaži alert na pravom jeziku
        const unknownTitle = t('unknown_command_title') || 'Nepoznata komanda';
        const notRecognized = t('not_recognized') || 'nije prepoznata';
        const tryCommands = t('try_commands') || 'Pokušajte: Zalihe, Spisak, Dodaj proizvod ili Izlaz';
        
        showModernAlert(
            unknownTitle,
            `"${command}" ${notRecognized}. ${tryCommands}`,
            '🎤'
        );
    }
}
