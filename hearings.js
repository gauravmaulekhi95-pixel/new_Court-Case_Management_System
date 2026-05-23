// Translation Dictionary for Hearing Management
const i18nHearings = {
    'en': {
        'nav-brand': 'Hearing Administration',
        'btn-back': 'Back to Dashboard',
        'page-title': 'Hearing Schedule Manager',
        'page-subtitle': 'Log upcoming hearings to official case records natively.',
        'form-heading': 'Add New Hearing',
        'lbl-case-id': 'Target Case ID',
        'btn-load-case': 'Fetch',
        'lbl-preview': 'Selected Case',
        'lbl-hearing-date': 'Next Hearing Date',
        'lbl-hearing-agenda': 'Hearing Agenda / Notes',
        'btn-submit': 'Schedule Hearing',
        'hist-heading': 'Case Hearing History',
        'hist-case-id': 'No Case Selected',
        'empty-msg': 'Enter a Case ID & click "Fetch" to view past timelines.',
        'err-not-found': 'Case ID not found in the database.',
        'msg-success': 'Hearing successfully scheduled!',
        'lbl-past': 'Past',
        'lbl-upcoming': 'Upcoming'
    },
    'hi': {
        'nav-brand': 'सुनवाई प्रशासन',
        'btn-back': 'डैशबोर्ड पर वापस जाएं',
        'page-title': 'सुनवाई अनुसूची प्रबंधक',
        'page-subtitle': 'आधिकारिक केस रिकॉर्ड में आगामी सुनवाई दर्ज करें।',
        'form-heading': 'नई सुनवाई जोड़ें',
        'lbl-case-id': 'लक्षित केस आईडी',
        'btn-load-case': 'लाएं (Fetch)',
        'lbl-preview': 'चयनित केस',
        'lbl-hearing-date': 'अगली सुनवाई की तिथि',
        'lbl-hearing-agenda': 'सुनवाई का एजेंडा / नोट्स',
        'btn-submit': 'सुनवाई अनुसूची करें',
        'hist-heading': 'केस सुनवाई का इतिहास',
        'hist-case-id': 'कोई केस नहीं चुना गया',
        'empty-msg': 'पिछली समयसीमा देखने के लिए एक केस आईडी दर्ज करें और "Fetch" पर क्लिक करें।',
        'err-not-found': 'डेटाबेस में केस आईडी नहीं मिला।',
        'msg-success': 'सुनवाई सफलतापूर्वक निर्धारित की गई!',
        'lbl-past': 'बीता हुआ',
        'lbl-upcoming': 'आगामी'
    }
};

let currentLang = 'en';
let loadedCase = null;
let courtCases = [];

document.addEventListener('DOMContentLoaded', () => {

    // Auth Ensure
    if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }

    courtCases = JSON.parse(localStorage.getItem('courtCases') || '[]');

    const inputCaseId = document.getElementById('input-case-id');
    const inputDate = document.getElementById('input-h-date');
    const inputAgenda = document.getElementById('input-agenda');
    const btnLoad = document.getElementById('btn-load-case');
    const btnSubmit = document.getElementById('btn-submit');

    const previewBox = document.getElementById('case-preview-box');
    const prevParties = document.getElementById('preview-parties');
    const prevStatus = document.getElementById('preview-status');
    const errBox = document.getElementById('error-msg');
    const sucBox = document.getElementById('success-msg');

    const histWrapper = document.getElementById('timeline-wrapper');
    const histEmpty = document.getElementById('empty-state');
    const histList = document.getElementById('hist-timeline-list');
    const histTargetId = document.getElementById('hist-case-id');

    // Load URL param if arriving from a specific "Add Hearing" nested route somewhere else later
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.get('id')) {
        inputCaseId.value = urlParams.get('id');
        fetchCaseData();
    }

    // Language Toggle
    const toggleBtn = document.getElementById('lang-toggle');
    const spanEn = document.querySelector('.lang-en');
    const spanHi = document.querySelector('.lang-hi');

    function applyLanguage() {
        for (const [id, text] of Object.entries(i18nHearings[currentLang])) {
            const el = document.getElementById(id);
            if(el) {
                if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') continue; // dont wipe
                el.innerText = text;
            }
        }

        inputCaseId.placeholder = currentLang === 'en' ? 'e.g. #CAS-2026-6412' : 'उदा. #CAS-2026-6412';
        inputAgenda.placeholder = currentLang === 'en' ? 'Describe the purpose of this hearing schedule...' : 'इस सुनवाई कार्यक्रम के उद्देश्य का वर्णन करें...';

        if(!loadedCase) {
            histTargetId.innerText = i18nHearings[currentLang]['hist-case-id'];
        } else {
            histTargetId.innerText = loadedCase.id;
        }

        renderTimeline(); // re-render localized tags
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'hi' : 'en';
            if(currentLang === 'en') {
                spanEn.classList.add('active'); spanHi.classList.remove('active');
            } else {
                spanHi.classList.add('active'); spanEn.classList.remove('active');
            }
            applyLanguage();
        });
    }

    function fetchCaseData() {
        errBox.style.display = 'none'; sucBox.style.display = 'none';
        
        const targetId = inputCaseId.value.trim().toUpperCase();
        loadedCase = courtCases.find(c => c.id.toUpperCase() === targetId);

        if(!loadedCase) {
            errBox.innerText = i18nHearings[currentLang]['err-not-found'];
            errBox.style.display = 'block';
            resetForm();
            return;
        }

        // Show Preview
        prevParties.innerText = loadedCase.petitioner || 'Unknown Parties';
        prevStatus.innerText = loadedCase.status;
        if(loadedCase.status === 'Closed') {
            prevStatus.className = 'status-badge status-closed';
        } else {
            prevStatus.className = 'status-badge status-pending';
        }
        
        previewBox.style.display = 'block';
        histTargetId.innerText = loadedCase.id;

        // Unlock Form
        inputDate.disabled = false;
        inputAgenda.disabled = false;
        btnSubmit.disabled = false;

        renderTimeline();
    }

    btnLoad.addEventListener('click', fetchCaseData);

    function resetForm() {
        previewBox.style.display = 'none';
        inputDate.disabled = true;
        inputAgenda.disabled = true;
        btnSubmit.disabled = true;
        inputDate.value = '';
        inputAgenda.value = '';

        histWrapper.style.display = 'none';
        histEmpty.style.display = 'block';
        histTargetId.innerText = i18nHearings[currentLang]['hist-case-id'];
    }

    function renderTimeline() {
        if(!loadedCase) return;
        
        histEmpty.style.display = 'none';
        histWrapper.style.display = 'block';
        histList.innerHTML = '';

        let hearings = loadedCase.hearings || [];

        if(hearings.length === 0) {
            histList.innerHTML = `<li class="past"><span class="hist-date">${loadedCase.date}</span><div class="hist-content"><p>${currentLang === 'en' ? 'Case Filed' : 'केस दर्ज'}</p></div></li>`;
            return;
        }

        // Render chronologically (newest at bottom, but often UI prefers newest at top. Let's do newest at bottom to match "next" at the end of timeline)
        hearings.forEach(h => {
            const li = document.createElement('li');
            li.className = h.type === 'upcoming' ? 'upcoming' : 'past';
            
            const badgeText = h.type === 'upcoming' 
                ? i18nHearings[currentLang]['lbl-upcoming'] 
                : i18nHearings[currentLang]['lbl-past'];

            li.innerHTML = `
                <span class="hist-date">${h.date}</span>
                <div class="hist-content">
                    <p>${h.agenda}</p>
                    <span class="hist-status-text">${badgeText}</span>
                </div>
            `;
            histList.appendChild(li);
        });
    }

    // Submit Handling
    const form = document.getElementById('add-hearing-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if(!loadedCase) return;

        if(!loadedCase.hearings) {
            loadedCase.hearings = [];
            // seed the initial finding
            loadedCase.hearings.push({
                date: loadedCase.date,
                agenda: 'Initial Case Filing & Assessment.',
                type: 'past'
            });
        }

        // Mark previously 'upcoming' as 'past'
        loadedCase.hearings.forEach(h => h.type = 'past');

        // Push new Upcoming
        loadedCase.hearings.push({
            date: inputDate.value,
            agenda: inputAgenda.value,
            type: 'upcoming'
        });

        // Save
        localStorage.setItem('courtCases', JSON.stringify(courtCases));

        // Show Success
        sucBox.innerText = i18nHearings[currentLang]['msg-success'];
        sucBox.style.display = 'block';
        
        inputDate.value = '';
        inputAgenda.value = '';

        renderTimeline();
    });

});
