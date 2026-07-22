// ===== NAJSIMPLIJI MOGUĆI SCRIPT =====
console.log('✅ Script.js je učitan!');

// Samo jedna probna funkcija
function test() {
    alert('Script radi!');
}

// Događaj kada se stranica učita
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM je spreman!');
    
    // Povezujemo login dugme
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            alert('Dugme radi!');
            const phone = document.getElementById('phoneInput').value.trim();
            if (phone.length >= 9) {
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('languageScreen').style.display = 'flex';
            } else {
                alert('Unesite bar 9 cifara!');
            }
        });
    }
    
    // Exit dugmad
    document.getElementById('exitLoginBtn')?.addEventListener('click', function() {
        if (confirm('Zatvori?')) window.close();
    });
});
