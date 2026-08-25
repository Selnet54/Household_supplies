// ============================================
// VOICE COMMANDS - DODATAK ZA script1.js
// SAMO DODATAK - NE MENJA POSTOJEĆI KOD!
// ============================================

// OVO JE DODATAK NA KRAJ POSTOJEĆEG FAJLA
// (DODAJTE OVO NA KRAJ VAŠEG voiceCommands.js)

// ============================================
// DODATAK: OSIGURAJ DA processVoiceCommand RADI
// ============================================

// Proveri da li postoji processVoiceCommand
if (typeof window.processVoiceCommand !== 'function') {
    console.log('🔧 Dodajem processVoiceCommand...');
    
    window.processVoiceCommand = function(command) {
        console.log('🎤 processVoiceCommand prima:', command);
        
        if (!command) return false;
        const lower = command.toLowerCase().trim();
        
        // END - otvara zalihe
        if (lower.includes('end') || lower.includes('and') || lower.includes('kraj') || lower.includes('gotovo')) {
            console.log('🏁 END - otvaram zalihe');
            window.ALLOW_INVENTORY_OPEN = true;
            
            let itemText = command
                .replace(/end/gi, '')
                .replace(/and/gi, '')
                .replace(/kraj/gi, '')
                .replace(/gotovo/gi, '')
                .trim();
            
            if (itemText.length > 2 && typeof window._voiceCommandsProcess === 'function') {
                window._voiceCommandsProcess(itemText);
            }
            
            setTimeout(() => {
                if (typeof window._voiceCommandsOpenZalihe === 'function') {
                    window._voiceCommandsOpenZalihe();
                }
            }, 500);
            return true;
        }
        
        // PLUS - čuva unos
        if (lower.includes('plus')) {
            console.log('✅ PLUS - čuvam unos');
            let itemText = command.replace(/plus/gi, '').trim();
            
            if (itemText.length > 2 && typeof window._voiceCommandsProcess === 'function') {
                window._voiceCommandsProcess(itemText);
                showVoiceStatus('✅ Sačuvano. Recite sledeći ili "end" za kraj.', '#4CAF50');
            }
            return true;
        }
        
        // UNOS - otvara ekran za unos
        const dataEntryKeywords = ['unos', 'unesi', 'dodaj', 'novi', 'snimi'];
        for (let keyword of dataEntryKeywords) {
            if (lower.includes(keyword)) {
                console.log(`📝 "${keyword}" - otvaram ekran za unos`);
                
                let itemText = command;
                dataEntryKeywords.forEach(k => {
                    itemText = itemText.replace(new RegExp(k, 'gi'), '');
                });
                itemText = itemText.trim();
                
                // OVO JE KLJUČNI DEO - poziva postojeću funkciju koja već radi!
                if (itemText.length > 2 && typeof window._voiceCommandsProcess === 'function') {
                    window._voiceCommandsProcess(itemText);
                } else {
                    // Samo otvori ekran za unos
                    ensureFormVisible();
                    showVoiceStatus('📝 Recite šta da unesete', '#2196F3');
                }
                return true;
            }
        }
        
        // Ako ima broj i ime proizvoda
        if (/\d/.test(lower) && lower.length > 3) {
            console.log('📝 Pokušavam da parsiraM:', command);
            if (typeof window._voiceCommandsProcess === 'function') {
                window._voiceCommandsProcess(command);
            }
            return true;
        }
        
        showVoiceStatus('❌ Nepoznata komanda: ' + command, '#f44336');
        return false;
    };
    
    console.log('✅ processVoiceCommand dodat!');
}

// ============================================
// DODATAK: window.voiceCommand ALIAS
// ============================================

if (typeof window.voiceCommand !== 'function') {
    window.voiceCommand = function(command) {
        console.log('🎤 voiceCommand -> processVoiceCommand');
        return window.processVoiceCommand(command);
    };
    console.log('✅ voiceCommand alias dodat!');
}

// ============================================
// DODATAK: ensureFormVisible (ako ne postoji)
// ============================================

if (typeof window.ensureFormVisible !== 'function' && typeof ensureFormVisible !== 'function') {
    console.log('🔧 Dodajem ensureFormVisible...');
    
    window.ensureFormVisible = function() {
        console.log('🔍 ensureFormVisible POZVAN!');
        
        document.querySelectorAll('.screen').forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });
        
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
            mainScreen.classList.add('active');
            console.log('✅ mainScreen prikazan');
        }
        
        const dataEntry = document.getElementById('dataEntryScreen');
        if (dataEntry) {
            dataEntry.style.display = 'block';
            dataEntry.classList.add('active');
            console.log('✅ dataEntryScreen prikazan');
        }
        
        // Prikaži polja
        const polja = ['productInput', 'pieceInput', 'quantityInput', 'shelfLifeInput'];
        polja.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'block';
                el.style.visibility = 'visible';
                el.style.opacity = '1';
            }
        });
        
        const selects = ['unitSelect', 'storageSelect'];
        selects.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'block';
                el.style.visibility = 'visible';
                el.style.opacity = '1';
            }
        });
        
        console.log('✅ Forma prikazana');
    };
    
    console.log('✅ ensureFormVisible dodat!');
}

console.log('✅ VoiceCommands DODATAK uspešno učitan!');
console.log('📌 Originalni kod i dalje radi!');
console.log('📝 Samo dodate funkcije za script1.js kompatibilnost.');
