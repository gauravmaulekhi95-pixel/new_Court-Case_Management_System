// Translation Dictionary for Register Page
const i18nReg = {
    'en': {
        'nav-brand': 'Digital Court System',
        'page-title': 'Case Registration Form',
        'page-subtitle': 'File a new case securely into the digital system.',
        'lbl-type': 'Case Type',
        'opt-select': '-- Select Type --',
        'opt-civil': 'Civil',
        'opt-criminal': 'Criminal',
        'opt-tax': 'Tax',
        'opt-family': 'Family',
        'opt-corp': 'Corporate',
        'lbl-petitioner': 'Petitioner Name',
        'lbl-respondent': 'Respondent Name',
        'lbl-advocate': 'Advocate Name',
        'lbl-date': 'Filing Date',
        'lbl-desc': 'Case Description',
        'btn-submit': 'Submit Registration',
        'btn-cancel': 'Cancel'
    },
    'hi': {
        'nav-brand': 'डिजिटल न्याय प्रणाली',
        'page-title': 'केस पंजीकरण फॉर्म',
        'page-subtitle': 'डिजिटल प्रणाली में एक नया केस सुरक्षित रूप से दर्ज करें।',
        'lbl-type': 'केस प्रकार',
        'opt-select': '-- प्रकार चुनें --',
        'opt-civil': 'दीवानी',
        'opt-criminal': 'फ़ौजदारी',
        'opt-tax': 'कर',
        'opt-family': 'पारिवारिक',
        'opt-corp': 'कॉर्पोरेट',
        'lbl-petitioner': 'याचिकाकर्ता का नाम',
        'lbl-respondent': 'प्रतिवादी का नाम',
        'lbl-advocate': 'अधिवक्ता का नाम',
        'lbl-date': 'फाइलिंग की तारीख',
        'lbl-desc': 'केस विवरण',
        'btn-submit': 'पंजीकरण सबमिट करें',
        'btn-cancel': 'रद्द करें'
    }
};

let currentLang = 'en';

document.addEventListener('DOMContentLoaded', () => {

    // Auth Check
    if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }

    const form = document.getElementById('reg-form');
    const successBox = document.getElementById('success-message');

    // Language Toggle logic
    const toggleBtn = document.getElementById('lang-toggle');
    const spanEn = document.querySelector('.lang-en');
    const spanHi = document.querySelector('.lang-hi');

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

            // Update text elements
            for (const [id, text] of Object.entries(i18nReg[currentLang])) {
                const el = document.getElementById(id);
                if(el) el.innerText = text;
            }

            // Update placeholders
            if (currentLang === 'hi') {
                document.getElementById('petitioner-name').placeholder = 'याचिकाकर्ता का पूरा नाम';
                document.getElementById('respondent-name').placeholder = 'प्रतिवादी का पूरा नाम';
                document.getElementById('advocate-name').placeholder = 'प्रस्तुत करने वाले अधिवक्ता';
                document.getElementById('case-desc').placeholder = 'केस की प्रकृति का संक्षेप में वर्णन करें...';
            } else {
                document.getElementById('petitioner-name').placeholder = 'Full Name of Petitioner';
                document.getElementById('respondent-name').placeholder = 'Full Name of Respondent';
                document.getElementById('advocate-name').placeholder = 'Presenting Advocate';
                document.getElementById('case-desc').placeholder = 'Briefly describe the nature of the case...';
            }
        });
    }

    // Set today as default date
    const dateInput = document.getElementById('filing-date');
    if(dateInput) {
        dateInput.valueAsDate = new Date();
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const cType = document.getElementById('case-type').value;
            const petName = document.getElementById('petitioner-name').value.trim();
            const resName = document.getElementById('respondent-name').value.trim();
            const advName = document.getElementById('advocate-name').value.trim();
            const dateVal = document.getElementById('filing-date').value;
            const desc = document.getElementById('case-desc').value.trim();

            if (!cType || !petName || !resName || !advName || !dateVal || !desc) {
                alert(currentLang === 'en' ? 'Please fill all required fields.' : 'कृपया सभी अनिवार्य फ़ील्ड भरें।');
                return;
            }

            // Generate an explicit ID
            const caseId = '#CAS-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
            
            // Format Date for Dashboard (e.g. 05 Apr 2026)
            const dObj = new Date(dateVal);
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const formattedDateStr = `${String(dObj.getDate()).padStart(2, '0')} ${months[dObj.getMonth()]} ${dObj.getFullYear()}`;

            // We concatenate Petitioner and Respondent so it displays cleanly on the admin dashboard tabular format
            const caseRecord = {
                id: caseId,
                type: cType,
                petitioner: `${petName} vs ${resName}`,
                advocate: advName,
                description: desc,
                status: 'Pending',
                date: formattedDateStr
            };

            // Save to localStorage array
            const saved = localStorage.getItem('courtCases');
            let tempCases = saved ? JSON.parse(saved) : [];
            tempCases.push(caseRecord);
            localStorage.setItem('courtCases', JSON.stringify(tempCases));

            // Redirect to dashboard with success query param
            window.location.href = `admin-dashboard.html?success=true&id=${encodeURIComponent(caseId)}`;
        });
    }
});
