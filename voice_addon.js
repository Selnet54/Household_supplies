// ============================================
// VOICE ADDON - DODATAK ZA GLASOVNE KOMANDE
// ============================================
console.log('🎤 Voice Addon učitan!');

// ===== EKRANI ZA GLAS =====
function showChoiceScreen() {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const screen = document.getElementById('choiceScreen');
    if (screen) screen.style.display = 'flex';
}

function showVoiceMenuScreen() {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const screen = document.getElementById('voiceMenuScreen');
    if (screen) screen.style.display = 'flex';
}

// ===== IZBOR NAČINA UNOSA =====
function selectVoiceMode() {
    console.log('🎤 Glasovni unos');
    showVoiceMenuScreen();
    setTimeout(startVoiceRecognition, 500);
}

function selectManualMode() {
    console.log('✍️ Ručni unos');
    // Pozovi ORIGINALNU funkciju
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const main = document.getElementById('mainScreen');
    if (main) main.style.display = 'flex';
    if (typeof renderCategories === 'function') renderCategories();
}

function goBackFromVoice() {
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        recognition = null;
    }
    showChoiceScreen();
}

// ===== PREUSMERI selectLanguage =====
// Sačuvaj original
const originalSelectLanguage = window.selectLanguage;

// Zameni sa novim
window.selectLanguage = function(langCode) {
    currentLang = langCode;
    showChoiceScreen();  // ← IDE NA IZBOR
};

// ===== GLOBALNE FUNKCIJE =====
window.selectVoiceMode = selectVoiceMode;
window.selectManualMode = selectManualMode;
window.goBackFromVoice = goBackFromVoice;
window.showChoiceScreen = showChoiceScreen;

console.log('✅ Voice Addon spreman!');
