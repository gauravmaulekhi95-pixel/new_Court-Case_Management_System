// Translation Dictionary for Case Status Page
const i18nStatus = {
    'en': {
        'nav-brand': 'Digital Court System',
        'btn-login-nav': 'Admin Login',
        'page-title': 'Check Case Status',
        'page-subtitle': 'Enter your official Case ID to track current standing and hearings.',
        'btn-search': 'Search Case',
        'error-msg-txt': 'Case not found. Please verify your ID.',
        'res-header-title': 'Case Overview',
        'lbl-parties': 'Parties',
        'lbl-type': 'Case Type & Date',
        'lbl-hearings': 'Hearing Timeline',
        'lbl-upcoming': 'Next Hearing:',
        'lbl-evidence': 'Submitted Evidence',
        'lbl-result': 'Final Result',
        'val-result-active': 'Proceedings active. Awaiting bench orders.',
        'val-result-closed': 'Judgment passed. Case officially closed.',
        'val-hearing-pending': 'Pending Scheduling',
        'lbl-print': 'Print'
    },
    'hi': {
        'nav-brand': 'डिजिटल न्याय प्रणाली',
        'btn-login-nav': 'एडमिन लॉगिन',
        'page-title': 'केस की स्थिति जांचें',
        'page-subtitle': 'वर्तमान स्थिति और सुनवाई को ट्रैक करने के लिए अपना आधिकारिक केस आईडी दर्ज करें।',
        'btn-search': 'केस खोजें',
        'error-msg-txt': 'केस नहीं मिला। कृपया अपनी आईडी सत्यापित करें।',
        'res-header-title': 'केस अवलोकन',
        'lbl-parties': 'पार्टियां',
        'lbl-type': 'केस प्रकार और तिथि',
        'lbl-hearings': 'सुनवाई की समयरेखा',
        'lbl-upcoming': 'अगली सुनवाई:',
        'lbl-evidence': 'प्रस्तुत साक्ष्य',
        'lbl-result': 'अंतिम परिणाम',
        'val-result-active': 'कार्यवाही सक्रिय है। पीठ के आदेश की प्रतीक्षा है।',
        'val-result-closed': 'निर्णय पारित। केस आधिकारिक रूप से बंद कर दिया गया है।',
        'val-hearing-pending': 'शेड्यूलिंग लंबित है',
        'lbl-print': 'प्रिंट करें'
    }
};

let currentLang = 'en';

// ---- Create Blob URL for file opening (works in file:// mode without popup blockers) ----
function createBlobUrl(dataUrl, mimeType) {
    try {
        if (!dataUrl) return '#';
        const byteString = atob(dataUrl.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ab], { type: mimeType || 'application/octet-stream' });
        return URL.createObjectURL(blob);
    } catch (err) {
        return '#';
    }
}

// ---- Render live evidence from localStorage ----
function renderEvidence(caseId) {
    const list      = document.getElementById('evidence-list');
    const emptyMsg  = document.getElementById('ev-empty-msg');
    if (!list) return;

    // Normalise ID (strip #, trim, uppercase) for reliable matching
    const normalise = s => (s || '').replace(/^#+/, '').trim().toUpperCase();
    const normId    = normalise(caseId);

    const allEv = JSON.parse(localStorage.getItem('courtEvidence') || '[]');
    const caseEv = allEv
        .filter(e => normalise(e.caseId) === normId)
        .sort((a, b) => b.date.localeCompare(a.date));

    list.innerHTML = '';

    if (caseEv.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';

    const TYPE_EMOJI = {
        'Document': '📄', 'Affidavit': '📝', 'Photograph': '🖼️',
        'Video': '🎬', 'Forensic Report': '🔬', 'Witness Statement': '🗣️'
    };

    caseEv.forEach(ev => {
        const li = document.createElement('li');
        const emoji    = TYPE_EMOJI[ev.type] || '📎';
        const safeName = (ev.title || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        const statusLower = (ev.status || '').toLowerCase().replace(' ', '');

        // Build the file/title chip
        let fileChip = '';
        if (ev.attachment && ev.attachment.dataUrl) {
            const blobUrl = createBlobUrl(ev.attachment.dataUrl, ev.attachment.type);
            // Clickable — will open via Blob URL
            fileChip = `<a href="${blobUrl}" target="_blank" rel="noopener" class="ev-file-link" style="text-decoration:none;">
                ${emoji} ${safeName} ↗
            </a>`;
        } else {
            fileChip = `<span class="ev-file-nolink">${emoji} ${safeName}</span>`;
        }

        // Status chip
        const statusLabel = currentLang === 'hi'
            ? (ev.status === 'Verified' ? 'सत्यापित' : ev.status === 'Rejected' ? 'अस्वीकृत' : 'समीक्षा लंबित')
            : ev.status;
        const chipClass = ev.status === 'Verified' ? 'verified' : ev.status === 'Rejected' ? 'rejected' : 'pending';

        li.innerHTML = `
            ${fileChip}
            <span class="ev-status-chip ${chipClass}">${statusLabel}</span>
        `;

        list.appendChild(li);
    });

    // Store for re-render on lang toggle
    list.dataset.caseId = caseId;
}

document.addEventListener('DOMContentLoaded', () => {

    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const resultCard = document.getElementById('result-card');
    const errorMsg = document.getElementById('error-msg');
    
    // Status UI Elements
    const badge = document.getElementById('res-status-badge');
    const valParties = document.getElementById('val-parties');
    const valTypeDate = document.getElementById('val-type-date');
    const finalResultBox = document.getElementById('final-result-box');
    const valResult = document.getElementById('val-result');
    const valHearingDate = document.getElementById('val-hearing-date');

    // Language Toggle logic
    const toggleBtn = document.getElementById('lang-toggle');
    const spanEn = document.querySelector('.lang-en');
    const spanHi = document.querySelector('.lang-hi');

    let cachedDynamicDate = '';

    function updateLanguageVals(foundCase) {
        const targetCaseStatus = foundCase.status || 'Pending';
        if (currentLang === 'hi') {
            searchInput.placeholder = 'उदा. #CAS-2026-1234';
            errorMsg.innerText = i18nStatus['hi']['error-msg-txt'];
            if(targetCaseStatus === 'Pending') {
                badge.innerText = 'लंबित';
                valResult.innerText = i18nStatus['hi']['val-result-active'];
                valHearingDate.innerText = cachedDynamicDate ? cachedDynamicDate : i18nStatus['hi']['val-hearing-pending'];
            } else if(targetCaseStatus === 'In Review') {
                badge.innerText = 'समीक्षा में';
                valResult.innerText = foundCase.judgmentText || 'अंतिम आदेश के लिए समीक्षा के अधीन।';
                valHearingDate.innerText = cachedDynamicDate ? cachedDynamicDate : '--';
            } else {
                badge.innerText = 'बंद';
                valResult.innerText = foundCase.judgmentText || i18nStatus['hi']['val-result-closed'];
                valHearingDate.innerText = '--';
            }
        } else {
            searchInput.placeholder = 'e.g. #CAS-2026-1234';
            errorMsg.innerText = i18nStatus['en']['error-msg-txt'];
            if(targetCaseStatus === 'Pending') {
                badge.innerText = 'Pending';
                valResult.innerText = i18nStatus['en']['val-result-active'];
                valHearingDate.innerText = cachedDynamicDate ? cachedDynamicDate : i18nStatus['en']['val-hearing-pending'];
            } else if(targetCaseStatus === 'In Review') {
                badge.innerText = 'In Review';
                valResult.innerText = foundCase.judgmentText || 'Under review for final orders.';
                valHearingDate.innerText = cachedDynamicDate ? cachedDynamicDate : '--';
            } else {
                badge.innerText = 'Closed';
                valResult.innerText = foundCase.judgmentText || i18nStatus['en']['val-result-closed'];
                valHearingDate.innerText = '--';
            }
        }

        // Re-render evidence in correct language
        const list = document.getElementById('evidence-list');
        if (list && list.dataset.caseId) renderEvidence(list.dataset.caseId);
    }

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

            for (const [id, text] of Object.entries(i18nStatus[currentLang])) {
                const el = document.getElementById(id);
                if(el && !['val-result-active', 'val-result-closed', 'val-hearing-pending', 'error-msg-txt'].includes(id)) {
                    el.innerText = text;
                }
            }
            
            // Re-run language update for the currently displayed case
            const cases = JSON.parse(localStorage.getItem('courtCases') || '[]');
            const normalise = s => (s || '').replace(/^#+/, '').trim().toUpperCase();
            const curSearch = searchInput.value.trim();
            const foundCase = cases.find(c => normalise(c.id) === normalise(curSearch));
            
            if (foundCase) {
                updateLanguageVals(foundCase);
            } else {
                // Default fallback if no case is currently found
                updateLanguageVals({});
            }
        });
    }

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const q = searchInput.value.trim().toUpperCase();
            if (!q) return;

            const cases = JSON.parse(localStorage.getItem('courtCases') || '[]');
            // Normalise both sides so #CAS-... matches CAS-...
            const normalise = s => (s || '').replace(/^#+/, '').trim().toUpperCase();
            const foundCase = cases.find(c => normalise(c.id) === normalise(q));

            if (foundCase) {
                errorMsg.style.display = 'none';

                valParties.innerText  = foundCase.petitioner;
                valTypeDate.innerText = `${foundCase.type} | Filed: ${foundCase.date}`;
                badge.dataset.internalstatus = foundCase.status;

                if(foundCase.hearings) {
                    const upcoming = foundCase.hearings.find(h => h.type === 'upcoming');
                    cachedDynamicDate = upcoming ? upcoming.date : '';
                } else {
                    cachedDynamicDate = '';
                }

                if (foundCase.status === 'Closed') {
                    finalResultBox.classList.add('closed');
                    badge.className = 'status-badge status-closed';
                    badge.style.background = '#fef2f2'; badge.style.color = '#b91c1c';
                    valResult.style.color = '#15803d';
                } else if (foundCase.status === 'In Review') {
                    finalResultBox.classList.remove('closed');
                    badge.className = 'status-badge status-in-review';
                    badge.style.background = '#eff6ff'; badge.style.color = '#2563eb';
                    valResult.style.color = '#2563eb';
                } else {
                    finalResultBox.classList.remove('closed');
                    badge.className = 'status-badge status-pending';
                    badge.style.background = '#fef3c7'; badge.style.color = '#b45309';
                    valResult.style.color = '#b45309';
                }

                updateLanguageVals(foundCase);

                // ── Render live evidence from localStorage ──
                renderEvidence(foundCase.id);

                resultCard.style.display = 'block';
                resultCard.style.animation = 'none';
                resultCard.offsetHeight;
                resultCard.style.animation = null;

            } else {
                resultCard.style.display = 'none';
                errorMsg.style.display = 'block';
                // Clear evidence list on failed search
                const list = document.getElementById('evidence-list');
                if (list) { list.innerHTML = ''; delete list.dataset.caseId; }
                const em = document.getElementById('ev-empty-msg');
                if (em) em.style.display = 'none';
            }
        });
    }
});

