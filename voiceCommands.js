// ============================================
// VOICE COMMANDS - GLASOVNE KOMANDE - FIX
// ============================================

let recognition = null;

// ===== FUNKCIJA ZA OBRADU GLASOVNIH KOMANDI =====
function processVoiceCommand(command) {
    console.log('🎤 processVoiceCommand prima:', command);
    
    if (!command || command.trim() === '') {
        console.log('❌ Prazna komanda');
        return false;
    }
    
    const cmd = command.toLowerCase().trim();
    console.log('📝 Normalizovana komanda:', cmd);
    
    // ===== PRVO SAKRIVANJE VOICE MENIJA =====
    hideVoiceMenu();
    
    // ===== UNOS PODATAKA - SVI JEZICI =====
    const dataEntryKeywords = [
        // SRPSKI
        'unos', 'unesi', 'dodaj', 'novi', 'podatak', 'unos podataka',
        // ENGLISH
        'add', 'product', 'entry', 'data', 'new', 'insert', 'create',
        // DEUTSCH
        'eintrag', 'produkt', 'hinzufügen', 'neu', 'daten', 'eingabe',
        // MAGYAR
        'bevitel', 'új', 'termék', 'hozzáad', 'rögzít', 'adat', 'beír',
        // УКРАЇНСЬКА
        'введення', 'дані', 'продукт', 'новий', 'додати', 'внести',
        // РУССКИЙ
        'ввод', 'данные', 'продукт', 'новый', 'добавить',
        // 中文
        '录入', '输入', '数据', '产品', '新增', '添加',
        // ESPAÑOL
        'entrada', 'datos', 'producto', 'nuevo', 'agregar', 'añadir',
        // PORTUGUÊS
        'entrada', 'dados', 'produto', 'novo', 'adicionar', 'inserir',
        // FRANÇAIS
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
            } else {
                setTimeout(function() {
                    if (typeof renderDataEntry === 'function') {
                        renderDataEntry('');
                    } else if (typeof window.renderDataEntry === 'function') {
                        window.renderDataEntry('');
                    } else {
                        showModernAlert('Greška', 'Funkcija za unos nije dostupna!', '❌');
                    }
                }, 500);
            }
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
        'список', 'покупки', 'список покупок',
        '购物清单', '购物列表', '清单',
        'lista de compras', 'compras', 'lista',
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
        'назад', 'скасувати', 'повернутися',
        'назад', 'отмена', 'вернуться',
        '返回', '取消', '回去',
        'atrás', 'cancelar', 'volver', 'regresar',
        'voltar', 'cancelar', 'regressar',
        'retour', 'annuler', 'revenir'
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

    // ===== MENI / POČETNA - SVI JEZICI =====
    const menuKeywords = [
        'meni', 'početna', 'glavni', 'početak', 'home',
        'menu', 'home', 'main', 'start',
        'hauptmenü', 'start', 'menü',
        'menü', 'főoldal', 'kezdőlap', 'kezdés',
        'меню', 'головна', 'старт',
        'меню', 'главная', 'старт',
        '菜单', '主页', '开始',
        'menú', 'inicio', 'principal', 'comenzar',
        'menu', 'início', 'principal', 'começar',
        'menu', 'accueil', 'principal', 'démarrer'
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

    // ===== KATEGORIJE - SVI JEZICI =====
    const categoryKeywords = [
        'kategorije', 'kategorija',
        'categories', 'category',
        'kategorien', 'kategorie',
        'kategóriák', 'kategória',
        'категорії', 'категорія',
        'категории', 'категория',
        '类别', '分类',
        'categorías', 'categoría',
        'categorias', 'categoria',
        'catégories', 'catégorie'
    ];
    if (categoryKeywords.some(k => cmd.includes(k))) {
        console.log('✅ Prepoznate KATEGORIJE');
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

    // ===== PROVERI DA LI JE KATEGORIJA =====
    if (typeof getMainCategories === 'function') {
        const catList = getMainCategories();
        let matchedCategory = null;
        catList.forEach(cat => {
            if (cmd.includes(cat.toLowerCase())) {
                matchedCategory = cat;
            }
        });

        if (matchedCategory) {
            console.log('✅ Prepoznata kategorija:', matchedCategory);
            setTimeout(function() {
                const mainScreen = document.getElementById('mainScreen');
                if (mainScreen) {
                    mainScreen.style.display = 'flex';
                    mainScreen.classList.add('active');
                }
                if (typeof renderSubcategories === 'function') {
                    renderSubcategories(matchedCategory);
                }
            }, 300);
            return true;
        }
    }

    // ===== AKO NIJE PREPOZNATA =====
    console.log('❌ Komanda nije prepoznata:', cmd);
    showModernAlert('Nepoznata komanda', `"${command}" nije prepoznato.`, '❓');
    return false;
}
