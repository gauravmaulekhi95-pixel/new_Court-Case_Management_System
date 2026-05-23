// Base Translations for Details Page
const i18nDetails = {
    'en': {
        'nav-brand': 'Case Dossier',
        'btn-back': 'Back to Dashboard',
        'details-view-title': 'Case View',
        'lbl-progress': 'Case Maturity Progress',
        'prog-1': 'Filed',
        'prog-2': 'Hearings',
        'prog-3': 'Evidence',
        'prog-4': 'Judgment',
        'sec-info': 'Case Information',
        'lbl-case-id': 'Case ID',
        'lbl-case-type': 'Case Type',
        'lbl-filing-date': 'Filing Date',
        'lbl-parties': 'Petitioner vs Respondent',
        'lbl-advocate': 'Presenting Advocate',
        'lbl-desc': 'Case Description',
        'sec-timeline': 'Hearing Timeline',
        'sec-evidence': 'Evidence Register',
        'sec-judgment': 'Judgment & Final Orders',
        'judg-text': 'This case is currently active. Proceedings are underway, and no final judgment has been issued by the bench.'
    },
    'hi': {
        'nav-brand': 'केस डॉसियर',
        'btn-back': 'डैशबोर्ड पर वापस जाएं',
        'details-view-title': 'केस दृश्य',
        'lbl-progress': 'केस परिपक्वता प्रगति',
        'prog-1': 'दर्ज हुआ',
        'prog-2': 'सुनवाई',
        'prog-3': 'सबूत',
        'prog-4': 'निर्णय',
        'sec-info': 'केस की जानकारी',
        'lbl-case-id': 'केस आईडी',
        'lbl-case-type': 'केस का प्रकार',
        'lbl-filing-date': 'फाइलिंग की तारीख',
        'lbl-parties': 'याचिकाकर्ता बनाम प्रतिवादी',
        'lbl-advocate': 'प्रस्तुत करने वाले अधिवक्ता',
        'lbl-desc': 'केस विवरण',
        'sec-timeline': 'सुनवाई की समयरेखा',
        'sec-evidence': 'साक्ष्य रजिस्टर',
        'sec-judgment': 'निर्णय और अंतिम आदेश',
        'judg-text': 'यह मामला वर्तमान में सक्रिय है। कार्यवाही चल रही है, और पीठ द्वारा कोई अंतिम निर्णय जारी नहीं किया गया है।'
    }
};

const EV_TYPE_ICONS = {
    'Document': '📄', 'Affidavit': '📝', 'Photograph': '🖼️',
    'Video': '🎬', 'Forensic Report': '🔬', 'Witness Statement': '🗣️'
};

let currentLang = 'en';

document.addEventListener('DOMContentLoaded', () => {

    // Auth Check
    if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }

    // Retrieve Case ID
    const urlParams = new URLSearchParams(window.location.search);
    const targetId = urlParams.get('id');

    const cases = JSON.parse(localStorage.getItem('courtCases') || '[]');
    const targetCase = cases.find(c => c.id === targetId);

    if (!targetCase) {
        document.querySelector('.legal-document-card').innerHTML = '<p style="text-align:center; padding: 2rem; color: #ef4444;">Error: Case record not found.</p>';
        return;
    }

    // Populate Data
    const b = document.getElementById('case-status-badge');
    b.innerText = targetCase.status;
    document.getElementById('val-id').innerText        = targetCase.id;
    document.getElementById('val-type').innerText      = targetCase.type;
    document.getElementById('val-date').innerText      = targetCase.date;
    document.getElementById('val-parties').innerText   = targetCase.petitioner;
    document.getElementById('val-advocate').innerText  = targetCase.advocate || 'N/A';
    document.getElementById('val-desc').innerText      = targetCase.description || 'No description provided at filing.';

    // Pre-fill caseId on "Add Evidence" and "Update Status" links
    const evLink = document.getElementById('btn-add-evidence-link');
    if (evLink) evLink.href = `manage-evidence.html?caseId=${encodeURIComponent(targetCase.id)}`;
    
    const upLink = document.getElementById('btn-update-case-link');
    if (upLink) upLink.href = `update-case.html?caseId=${encodeURIComponent(targetCase.id)}`;

    // Progress Bar Logic
    const hasHearings = targetCase.hearings && targetCase.hearings.length > 0;
    
    const allEvForProgress = JSON.parse(localStorage.getItem('courtEvidence') || '[]');
    const normIdProg = (s) => (s || '').replace(/^#+/, '').trim().toUpperCase();
    const hasEvidence = allEvForProgress.some(e => normIdProg(e.caseId) === normIdProg(targetCase.id));
    const isClosed = targetCase.status === 'Closed';

    // Reset
    ['prog-1','prog-2','prog-3','prog-4'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.className = '';
    });

    const p1 = document.getElementById('prog-1');
    const p2 = document.getElementById('prog-2');
    const p3 = document.getElementById('prog-3');
    const p4 = document.getElementById('prog-4');

    if (p1) p1.className = 'completed';

    if (isClosed) {
        b.dataset.state = 'completed';
        if (p2) p2.className = 'completed';
        if (p3) p3.className = 'completed';
        if (p4) p4.className = 'completed';
    } else {
        b.dataset.state = 'pending';
        
        if (hasHearings) {
            if (p2) p2.className = 'completed';
        } else {
            if (p2) p2.className = 'active';
        }

        if (hasEvidence) {
            if (p3) p3.className = 'completed';
            if (p4) p4.className = 'active';
        } else if (hasHearings) {
            if (p3) p3.className = 'active';
        }
    }

    const judgTextEl = document.getElementById('judg-text');
    if (judgTextEl) {
        if (targetCase.judgmentText) {
            judgTextEl.innerText = targetCase.judgmentText;
        } else if (isClosed) {
            judgTextEl.innerText = "The Hon'ble Court has pronounced its final judgment. The case is now closed.";
        }
    }

    // Status badge colour
    if (targetCase.status === 'Closed') {
        b.style.background = '#dcfce3'; b.style.color = '#15803d';
    } else if (targetCase.status === 'In Review') {
        b.style.background = '#dbeafe'; b.style.color = '#2563eb';
    } else {
        b.style.background = '#fef3c7'; b.style.color = '#b45309';
    }

    // ---- Hearing Timeline ----
    function renderDetailsTimeline() {
        const tList = document.querySelector('.timeline-list');
        if (!tList) return;
        let hearings = targetCase.hearings || [];
        if (hearings.length === 0) {
            hearings = [{
                date: targetCase.date,
                agenda: currentLang === 'en' ? 'Initial Case Filing & Assessment.' : 'प्रारंभिक केस फाइलिंग और मूल्यांकन।',
                type: 'past'
            }];
        }
        tList.innerHTML = '';
        hearings.forEach(h => {
            const hTitle = h.type === 'upcoming'
                ? (currentLang === 'en' ? 'Upcoming Hearing' : 'आगामी सुनवाई')
                : (currentLang === 'en' ? 'Concluded Hearing' : 'संपन्न सुनवाई');
            const div = document.createElement('div');
            div.className = 'timeline-item';
            div.innerHTML = `
                <span class="tl-date">${h.date}</span>
                <div class="tl-content">
                    <strong style="color: var(--clr-primary-900); display: block; margin-bottom: 0.25rem;">${hTitle}</strong>
                    <p style="margin: 0;">${h.agenda}</p>
                </div>
            `;
            tList.appendChild(div);
        });
    }

    renderDetailsTimeline();

    // ---- Open file using Blob URL (works in file:// mode) ----
    function openFileFromDataUrl(dataUrl, mimeType, filename) {
        try {
            const byteString = atob(dataUrl.split(',')[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
            const blob = new Blob([ab], { type: mimeType || 'application/octet-stream' });
            const blobUrl = URL.createObjectURL(blob);
            const win = window.open(blobUrl, '_blank');
            setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
            if (!win) alert('Popup blocked. Please allow popups for this site to view the file.');
        } catch (err) {
            alert('Unable to open this file. It may have been stored without content.');
        }
    }

    // ---- Evidence Cards ----
    function renderDetailsEvidence() {
        const grid    = document.getElementById('ev-cards-grid');
        const emptyEl = document.getElementById('ev-empty-details');
        if (!grid) return;

        const allEv = JSON.parse(localStorage.getItem('courtEvidence') || '[]');

        // Normalise helper: strip leading # and spaces, uppercase
        const normalise = str => (str || '').replace(/^#+/, '').trim().toUpperCase();
        const normCaseId = normalise(targetCase.id);

        const caseEvidence = allEv
            .filter(e => normalise(e.caseId) === normCaseId)
            .sort((a, b) => b.date.localeCompare(a.date));

        grid.innerHTML = '';

        if (caseEvidence.length === 0) {
            if (emptyEl) emptyEl.style.display = 'block';
            return;
        }
        if (emptyEl) emptyEl.style.display = 'none';

        const accentMap = {
            'Document': '#3b82f6', 'Affidavit': '#8b5cf6', 'Photograph': '#ec4899',
            'Video': '#f97316', 'Forensic Report': '#ef4444', 'Witness Statement': '#14b8a6'
        };

        caseEvidence.forEach((ev, idx) => {
            const icon   = EV_TYPE_ICONS[ev.type] || '📎';
            const accent = accentMap[ev.type] || '#3b82f6';

            let statusBg = '#fef3c7'; let statusClr = '#92400e';
            if (ev.status === 'Verified') { statusBg = '#dcfce7'; statusClr = '#15803d'; }
            if (ev.status === 'Rejected') { statusBg = '#fee2e2'; statusClr = '#b91c1c'; }

            const statusLabel = currentLang === 'hi'
                ? (ev.status === 'Verified' ? 'सत्यापित' : ev.status === 'Rejected' ? 'अस्वीकृत' : 'समीक्षा लंबित')
                : ev.status;

            const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            const dParts = ev.date.split('-');
            const displayDate = `${dParts[2]} ${months[parseInt(dParts[1])-1]} ${dParts[0]}`;

            const safeTitle = (ev.title || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            const safeDesc  = (ev.description || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            const safeSub   = (ev.submittedBy || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');

            // --- Build attachment HTML ---
            let attachHTML = '';
            if (ev.attachment) {
                const att = ev.attachment;
                const isImg = att.type && att.type.startsWith('image/');
                const safeName = (att.name || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                const sizeStr  = att.size ? ` (${att.size < 1048576 ? (att.size/1024).toFixed(1)+' KB' : (att.size/1048576).toFixed(1)+' MB'})` : '';

                if (isImg && att.dataUrl) {
                    attachHTML = `
                        <img src="${att.dataUrl}" alt="${safeName}" style="width:100%;max-height:160px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0;display:block;margin-bottom:4px;" loading="lazy">
                        <div class="ev-card-attachment-btn" data-ev-id="${ev.id}" style="display:flex;align-items:center;gap:6px;font-size:0.77rem;font-weight:600;color:#3b82f6;background:#eff6ff;border:1px solid rgba(59,130,246,0.2);border-radius:6px;padding:4px 10px;width:fit-content;cursor:pointer;">
                            📎 ${safeName}
                        </div>`;
                } else if (att.dataUrl) {
                    // PDF or other file with stored data — make it openable via JS
                    const fileEmoji = att.name && att.name.endsWith('.pdf') ? '📕'
                        : att.type && att.type.startsWith('video/') ? '🎬' : '📎';
                    attachHTML = `
                        <div class="ev-card-attachment-btn" data-ev-id="${ev.id}" style="display:inline-flex;align-items:center;gap:6px;font-size:0.77rem;font-weight:600;color:#3b82f6;background:#eff6ff;border:1px solid rgba(59,130,246,0.2);border-radius:6px;padding:4px 10px;cursor:pointer;width:fit-content;">
                            ${fileEmoji} ${safeName}<span style="color:#94a3b8;font-weight:400;">${sizeStr}</span> ↗
                        </div>`;
                } else {
                    // File stored without data (legacy) — show chip only
                    attachHTML = `
                        <div style="display:inline-flex;align-items:center;gap:6px;font-size:0.77rem;font-weight:600;color:#64748b;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:4px 10px;">
                            📎 ${safeName}${sizeStr}
                        </div>`;
                }
            }

            const card = document.createElement('div');
            card.style.cssText = `
                background: white;
                border: 1.5px solid #e2e8f0;
                border-left: 4px solid ${accent};
                border-radius: 12px;
                padding: 1rem 1.1rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                transition: transform 0.22s, box-shadow 0.22s;
                animation: evCardIn 0.35s ease ${idx * 60}ms both;
                display: flex;
                flex-direction: column;
                gap: 0.6rem;
            `;
            card.innerHTML = `
                <div style="display:flex;align-items:flex-start;gap:0.75rem;">
                    <span style="font-size:1.6rem;flex-shrink:0;">${icon}</span>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:0.9rem;font-weight:700;color:#0f172a;line-height:1.3;word-break:break-word;">${safeTitle}</div>
                        <div style="font-size:0.75rem;color:#64748b;margin-top:2px;">${ev.type} · ${displayDate}</div>
                    </div>
                </div>
                <p style="font-size:0.83rem;color:#64748b;line-height:1.55;margin:0;">${safeDesc}</p>
                ${attachHTML}
                <div style="display:flex;align-items:center;justify-content:space-between;padding-top:0.5rem;border-top:1px solid #e2e8f0;">
                    <span style="font-size:0.75rem;color:#64748b;font-weight:500;">By: ${safeSub}</span>
                    <span style="font-size:0.72rem;font-weight:700;padding:0.18rem 0.65rem;border-radius:20px;background:${statusBg};color:${statusClr};">${statusLabel}</span>
                </div>
            `;
            
            // Add click listener to attachment button if present
            if (ev.attachment && ev.attachment.dataUrl) {
                const attachBtn = card.querySelector('.ev-card-attachment-btn');
                if (attachBtn) {
                    attachBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openFileFromDataUrl(ev.attachment.dataUrl, ev.attachment.type, ev.attachment.name);
                    });
                }
            }

            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-3px)';
                card.style.boxShadow = '0 8px 20px rgba(37,99,235,0.10)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            });
            grid.appendChild(card);
        });
    }

    // Inject keyframe animation style once
    if (!document.getElementById('ev-detail-anim')) {
        const s = document.createElement('style');
        s.id = 'ev-detail-anim';
        s.textContent = `@keyframes evCardIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`;
        document.head.appendChild(s);
    }

    renderDetailsEvidence();

    // ---- Language Toggle ----
    const toggleBtn = document.getElementById('lang-toggle');
    const spanEn    = document.querySelector('.lang-en');
    const spanHi    = document.querySelector('.lang-hi');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'hi' : 'en';
            spanEn.classList.toggle('active', currentLang === 'en');
            spanHi.classList.toggle('active', currentLang === 'hi');

            for (const [id, text] of Object.entries(i18nDetails[currentLang])) {
                const el = document.getElementById(id);
                if (el) el.innerText = text;
            }

            b.innerText = currentLang === 'hi'
                ? (targetCase.status === 'Pending' ? 'लंबित' : 'बंद')
                : targetCase.status;

            if (targetCase.status === 'Closed') {
                document.getElementById('judg-text').innerText = currentLang === 'hi'
                    ? 'माननीय न्यायालय ने अपना अंतिम निर्णय सुना दिया है। यह मामला अब बंद हो गया है।'
                    : "The Hon'ble Court has pronounced its final judgment. The case is now closed.";
            }

            renderDetailsTimeline();
            renderDetailsEvidence();
        });
    }

});
