// Translation Dictionary
const i18nUpdate = {
    'en': {
        'nav-brand': 'Update Case',
        'btn-back': '← Back',
        'page-title': 'Update Case Status',
        'page-subtitle': 'Change case status and issue final judgments.',
        'lbl-case-id': 'Target Case ID',
        'btn-fetch': 'Fetch',
        'lbl-status': 'New Status',
        'opt-pending': 'Pending',
        'opt-in-review': 'In Review',
        'opt-closed': 'Closed (Issue Judgment)',
        'lbl-judgment': 'Judgment / Final Remarks',
        'btn-submit': 'Update Case',
        'msg-not-found': 'Case ID not found in the system.',
        'msg-success': 'Case successfully updated!'
    },
    'hi': {
        'nav-brand': 'केस अपडेट करें',
        'btn-back': '← वापस',
        'page-title': 'केस स्थिति अपडेट करें',
        'page-subtitle': 'केस की स्थिति बदलें और अंतिम निर्णय जारी करें।',
        'lbl-case-id': 'लक्ष्य केस आईडी',
        'btn-fetch': 'प्राप्त करें',
        'lbl-status': 'नई स्थिति',
        'opt-pending': 'लंबित',
        'opt-in-review': 'समीक्षा में',
        'opt-closed': 'बंद (निर्णय जारी करें)',
        'lbl-judgment': 'निर्णय / अंतिम टिप्पणी',
        'btn-submit': 'केस अपडेट करें',
        'msg-not-found': 'सिस्टम में केस आईडी नहीं मिली।',
        'msg-success': 'केस सफलतापूर्वक अपडेट किया गया!'
    }
};

let currentLang = 'en';
let loadedCase = null;

document.addEventListener('DOMContentLoaded', () => {

    // Auth Check
    if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }

    const inputId = document.getElementById('up-case-id');
    const btnFetch = document.getElementById('btn-fetch');
    const previewBox = document.getElementById('case-preview');
    const previewText = document.getElementById('preview-text');
    const selectStatus = document.getElementById('up-status');
    const inputJudgment = document.getElementById('up-judgment');
    const btnSubmit = document.getElementById('btn-submit');
    const successMsg = document.getElementById('success-message');

    // Auto-fill Case ID from URL param if present
    const urlParams = new URLSearchParams(window.location.search);
    const preloadId = urlParams.get('caseId');
    if (preloadId) {
        inputId.value = preloadId;
        fetchCase();
    }

    function fetchCase() {
        const targetId = inputId.value.trim().toUpperCase();
        previewBox.classList.remove('visible', 'error');
        loadedCase = null;

        selectStatus.disabled = true;
        inputJudgment.disabled = true;
        btnSubmit.disabled = true;

        if (!targetId) return;

        const cases = JSON.parse(localStorage.getItem('courtCases') || '[]');
        // Normalize IDs
        const normId = targetId.replace(/^#+/, '').trim();
        const found = cases.find(c => c.id.replace(/^#+/, '').toUpperCase() === normId);

        if (found) {
            loadedCase = found;
            previewText.innerText = `${found.petitioner} · Current Status: ${found.status}`;
            previewBox.classList.add('visible');
            previewBox.classList.remove('error');

            selectStatus.disabled = false;
            selectStatus.value = found.status;
            
            inputJudgment.disabled = false;
            inputJudgment.value = found.judgmentText || '';

            btnSubmit.disabled = false;
        } else {
            previewText.innerText = i18nUpdate[currentLang]['msg-not-found'];
            previewBox.classList.add('visible', 'error');
        }
    }

    btnFetch.addEventListener('click', fetchCase);
    inputId.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); fetchCase(); }
    });

    document.getElementById('update-form').addEventListener('submit', e => {
        e.preventDefault();
        if (!loadedCase) return;

        const cases = JSON.parse(localStorage.getItem('courtCases') || '[]');
        const idx = cases.findIndex(c => c.id === loadedCase.id);

        if (idx !== -1) {
            cases[idx].status = selectStatus.value;
            cases[idx].judgmentText = inputJudgment.value.trim();
            localStorage.setItem('courtCases', JSON.stringify(cases));

            // Show success
            successMsg.innerText = i18nUpdate[currentLang]['msg-success'];
            successMsg.style.display = 'block';

            // Re-fetch to update preview text
            fetchCase();

            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 3000);
        }
    });

    // Language Toggle
    const toggleBtn = document.getElementById('lang-toggle');
    const spanEn = document.querySelector('.lang-en');
    const spanHi = document.querySelector('.lang-hi');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'hi' : 'en';
            spanEn.classList.toggle('active', currentLang === 'en');
            spanHi.classList.toggle('active', currentLang === 'hi');

            for (const [id, text] of Object.entries(i18nUpdate[currentLang])) {
                const el = document.getElementById(id);
                if (el && !id.startsWith('msg-')) {
                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                        el.placeholder = text;
                    } else {
                        el.innerText = text;
                    }
                }
            }

            inputId.placeholder = currentLang === 'en' ? 'e.g. #CAS-2026-1234' : 'उदा. #CAS-2026-1234';
            inputJudgment.placeholder = currentLang === 'en' 
                ? 'Enter final judgment text or latest progress updates here...'
                : 'अंतिम निर्णय का पाठ या नवीनतम प्रगति अपडेट यहां दर्ज करें...';
                
            if (loadedCase && previewBox.classList.contains('error')) {
                previewText.innerText = i18nUpdate[currentLang]['msg-not-found'];
            }
        });
    }
});
