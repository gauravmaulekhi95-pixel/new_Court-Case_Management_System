// Translation Dictionary for Login Page
const i18nLogin = {
    'en': {
        'nav-brand': 'Digital Court System',
        'login-title': 'Admin Portal',
        'login-subtitle': 'Secure access for authorized personnel only',
        'label-username': 'Username or ID',
        'label-password': 'Password',
        'btn-login': 'Secure Login',
        'link-return': 'Return to Homepage',
        'error-text': 'Invalid credentials. Please try again.' 
    },
    'hi': {
        'nav-brand': 'डिजिटल न्याय प्रणाली',
        'login-title': 'एडमिन पोर्टल',
        'login-subtitle': 'केवल अधिकृत कर्मियों के लिए सुरक्षित पहुंच',
        'label-username': 'उपयोगकर्ता नाम या आईडी',
        'label-password': 'पासवर्ड',
        'btn-login': 'सुरक्षित लॉगिन',
        'link-return': 'होमपेज पर वापस जाएं',
        'error-text': 'अमान्य क्रेडेंशियल। कृपया पुनः प्रयास करें।'
    }
};

let currentLang = 'en';

document.addEventListener('DOMContentLoaded', () => {
    // Initial fade in for smooth load
    setTimeout(() => {
        const container = document.querySelector('.login-container');
        if (container) container.classList.add('visible');
    }, 100);

    // Language Toggle Functionality
    const toggleBtn = document.getElementById('lang-toggle');
    const spanEn = document.querySelector('.lang-en');
    const spanHi = document.querySelector('.lang-hi');
    const errorMsg = document.getElementById('error-message');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'hi' : 'en';
            
            if(currentLang === 'en') {
                spanEn.classList.add('active');
                spanHi.classList.remove('active');
            } else {
                spanHi.classList.add('active');
                spanEn.classList.remove('active');
            }

            const card = document.querySelector('.login-card');
            if(card) card.style.opacity = '0.9';
            
            setTimeout(() => {
                for (const [id, text] of Object.entries(i18nLogin[currentLang])) {
                    const el = document.getElementById(id);
                    if(el) el.innerText = text;
                }
                
                // Also update input placeholders
                const userIn = document.getElementById('username');
                const passIn = document.getElementById('password');
                if (userIn) userIn.placeholder = currentLang === 'en' ? 'Enter username' : 'उपयोगकर्ता नाम दर्ज करें';
                if (passIn) passIn.placeholder = currentLang === 'en' ? 'Enter password' : 'पासवर्ड दर्ज करें';
                
                // Update error message explicitly if it's currently showing
                if(currentLang === 'en') {
                    if (errorMsg) errorMsg.innerText = i18nLogin['en']['error-text'];
                } else {
                    if (errorMsg) errorMsg.innerText = i18nLogin['hi']['error-text'];
                }
                
                if (card) card.style.opacity = '1';
            }, 150);
        });
    }

    // Login Validation
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const username = usernameInput ? usernameInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value.trim() : '';
            
            // Validation Logic (admin / admin123)
            if(username === 'admin' && password === 'admin123') {
                // Success
                if (errorMsg) errorMsg.classList.remove('show');
                
                const btnLogin = document.getElementById('btn-login');
                if (btnLogin) btnLogin.innerText = currentLang === 'en' ? 'Authenticating...' : 'प्रमाणीकरण...';
                
                // Set Secure Mock Session
                localStorage.setItem('isAdminLoggedIn', 'true');

                // Redirect to dashboard (mock)
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html';
                }, 800);
            } else {
                // Failed
                if (errorMsg) errorMsg.classList.add('show');
                
                // Shake animation for failure
                const card = document.querySelector('.login-card');
                if (card) {
                    card.style.transform = 'translateY(0) translateX(-5px)';
                    setTimeout(() => card.style.transform = 'translateY(0) translateX(5px)', 100);
                    setTimeout(() => card.style.transform = 'translateY(0) translateX(-5px)', 200);
                    setTimeout(() => card.style.transform = 'translateY(0) translateX(5px)', 300);
                    setTimeout(() => card.style.transform = 'translateY(0) translateX(0)', 400);
                }
            }
        });
    }
});
