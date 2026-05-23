// Translation Dictionary Mapping UI Elements to EN/HI
const i18n = {
    'en': {
        'nav-brand': 'Digital Court System',
        'nav-home': 'Home',
        'nav-status': 'Check Case Status',
        'nav-about': 'About',
        'nav-login': 'Admin Login',
        'hero-title': 'Justice Facilitated: Transparent, Fast, & Digital',
        'hero-subtitle': 'Welcome to the Official Digital Court Management System. Streamlined record-keeping and case tracking at your fingertips.',
        'btn-register': 'Register Case',
        'btn-check': 'Check Status',
        'modal-add-title': 'Register New Case',
        'lbl-petitioner': 'Petitioner vs Respondent',
        'lbl-type': 'Case Type',
        'opt-civil': 'Civil',
        'opt-criminal': 'Criminal',
        'opt-tax': 'Tax',
        'btn-submit-case': 'Submit Case',
        'features-title': 'Core Pillars of Our System',
        'card-1-title': 'Transparency',
        'card-1-desc': 'Ensure complete visibility of your case status and judicial proceedings anytime with an easy ₹10 document fee access.',
        'card-2-title': 'Fast Tracking',
        'card-2-desc': 'Expedited hearings and optimized schedules to reduce pendency and prioritize justice delivery.',
        'card-3-title': 'Digital Records',
        'card-3-desc': 'End-to-end encryption for e-filing, document storage, and seamless accessibility for legal entities.',
        'footer-title': 'Digital Court System',
        'footer-desc': 'Empowering Justice through Technology.',
        'footer-contact-title': 'Contact Us',
        'footer-copy': '© 2026 Digital Court Case Management System. All Rights Reserved.'
    },
    'hi': {
        'nav-brand': 'डिजिटल न्याय प्रणाली',
        'nav-home': 'होम',
        'nav-status': 'केस की स्थिति जांचें',
        'nav-about': 'हमारे बारे में',
        'nav-login': 'एडमिन लॉगिन',
        'hero-title': 'न्याय सुगम: पारदर्शी, तीव्र और डिजिटल',
        'hero-subtitle': 'आधिकारिक डिजिटल न्यायालय प्रबंधन प्रणाली में आपका स्वागत है। सुव्यवस्थित रिकॉर्ड रखने और केस ट्रैकिंग आपकी उंगलियों पर।',
        'btn-register': 'रजिस्टर करें',
        'btn-check': 'स्थिति जांचें',
        'modal-add-title': 'नया केस पंजीकृत करें',
        'lbl-petitioner': 'याचिकाकर्ता बनाम प्रतिवादी',
        'lbl-type': 'केस प्रकार',
        'opt-civil': 'दीवानी',
        'opt-criminal': 'फ़ौजदारी',
        'opt-tax': 'कर',
        'btn-submit-case': 'केस सबमिट करें',
        'features-title': 'हमारी प्रणाली के मुख्य स्तंभ',
        'card-1-title': 'पारदर्शिता',
        'card-1-desc': '₹10 के आसान दस्तावेज़ शुल्क के साथ कभी भी अपने मामले की स्थिति और न्यायिक कार्यवाही की पूर्ण दृश्यता सुनिश्चित करें।',
        'card-2-title': 'फास्ट ट्रैकिंग',
        'card-2-desc': 'लंबित मामलों को कम करने और न्याय वितरण को प्राथमिकता देने के लिए त्वरित सुनवाई और अनुकूलित कार्यक्रम।',
        'card-3-title': 'डिजिटल रिकॉर्ड',
        'card-3-desc': 'ई-फाइलिंग, दस्तावेज़ भंडारण और कानूनी संस्थाओं के लिए निर्बाध पहुंच के लिए एंड-टू-एंड एन्क्रिप्शन।',
        'footer-title': 'डिजिटल न्याय प्रणाली',
        'footer-desc': 'तकनीक के माध्यम से न्याय का सशक्तिकरण।',
        'footer-contact-title': 'संपर्क करें',
        'footer-copy': '© 2026 डिजिटल न्यायालय प्रबंधन प्रणाली। सर्वाधिकार सुरक्षित।'
    }
};

let currentLang = 'en';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Animation Observer (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

    // 2. Language Toggle Functionality
    const toggleBtn = document.getElementById('lang-toggle');
    const spanEn = document.querySelector('.lang-en');
    const spanHi = document.querySelector('.lang-hi');

    toggleBtn.addEventListener('click', () => {
        // Toggle language state
        currentLang = currentLang === 'en' ? 'hi' : 'en';
        
        // Update toggle button visuals
        if(currentLang === 'en') {
            spanEn.classList.add('active');
            spanHi.classList.remove('active');
        } else {
            spanHi.classList.add('active');
            spanEn.classList.remove('active');
        }

        // Apply translations with a smooth fade effect
        const bodyContent = document.querySelector('body');
        bodyContent.style.opacity = '0.9';
        
        setTimeout(() => {
            for (const [id, text] of Object.entries(i18n[currentLang])) {
                const el = document.getElementById(id);
                if(el) el.innerText = text;
            }
            bodyContent.style.opacity = '1';
        }, 150);
    });

    // 3. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if(window.scrollY > 20) {
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            navbar.style.padding = '4px 0';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.padding = '0';
        }
    });
});
