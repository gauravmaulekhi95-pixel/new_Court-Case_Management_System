// ============================================================
// Evidence Management – Full Logic (manage-evidence.html)
// ============================================================

// --- i18n Translations ---
const i18nEv = {
    'en': {
        'nav-brand': 'Evidence Management',
        'btn-back': '← Back to Dashboard',
        'page-title': 'Evidence Register',
        'page-subtitle': 'Log, track, and manage all case evidence records with full date traceability.',
        'form-heading': 'Add New Evidence',
        'lbl-case-id': 'Target Case ID',
        'lbl-title': 'Evidence Title',
        'lbl-submitted-by': 'Submitted By',
        'lbl-ev-type': 'Evidence Type',
        'opt-select': '-- Select Type --',
        'opt-doc': 'Document',
        'opt-aff': 'Affidavit',
        'opt-photo': 'Photograph',
        'opt-video': 'Video',
        'opt-forensic': 'Forensic Report',
        'opt-witness': 'Witness Statement',
        'lbl-date': 'Log Date',
        'lbl-desc': 'Description / Notes',
        'lbl-status': 'Initial Status',
        'btn-fetch': 'Fetch',
        'btn-submit': 'Log Evidence',
        'stat-total-lbl': 'Total Evidence',
        'stat-verified-lbl': 'Verified',
        'stat-pending-lbl': 'Pending Review',
        'ev-error-text': 'Please fill all required fields.',
        'ev-success-text': 'Evidence logged successfully!',
        'empty-title': 'No Evidence Records Found',
        'empty-desc': 'Start by fetching a case and logging your first evidence entry using the form on the left.'
    },
    'hi': {
        'nav-brand': 'साक्ष्य प्रबंधन',
        'btn-back': '← डैशबोर्ड पर वापस',
        'page-title': 'साक्ष्य रजिस्टर',
        'page-subtitle': 'पूर्ण तिथि ट्रेसेबिलिटी के साथ सभी केस साक्ष्य रिकॉर्ड लॉग, ट्रैक और प्रबंधित करें।',
        'form-heading': 'नया साक्ष्य जोड़ें',
        'lbl-case-id': 'लक्षित केस आईडी',
        'lbl-title': 'साक्ष्य शीर्षक',
        'lbl-submitted-by': 'द्वारा प्रस्तुत',
        'lbl-ev-type': 'साक्ष्य प्रकार',
        'opt-select': '-- प्रकार चुनें --',
        'opt-doc': 'दस्तावेज़',
        'opt-aff': 'हलफनामा',
        'opt-photo': 'फोटोग्राफ',
        'opt-video': 'वीडियो',
        'opt-forensic': 'फोरेंसिक रिपोर्ट',
        'opt-witness': 'गवाह बयान',
        'lbl-date': 'लॉग तिथि',
        'lbl-desc': 'विवरण / नोट्स',
        'lbl-status': 'प्रारंभिक स्थिति',
        'btn-fetch': 'लाएं',
        'btn-submit': 'साक्ष्य लॉग करें',
        'stat-total-lbl': 'कुल साक्ष्य',
        'stat-verified-lbl': 'सत्यापित',
        'stat-pending-lbl': 'समीक्षा लंबित',
        'ev-error-text': 'कृपया सभी अनिवार्य फ़ील्ड भरें।',
        'ev-success-text': 'साक्ष्य सफलतापूर्वक लॉग किया गया!',
        'empty-title': 'कोई साक्ष्य रिकॉर्ड नहीं मिला',
        'empty-desc': 'बाईं ओर के फॉर्म का उपयोग करके एक केस लाएं और अपना पहला साक्ष्य दर्ज करें।'
    }
};

// --- Evidence Type Icons ---
const TYPE_ICONS = {
    'Document':          '📄',
    'Affidavit':         '📝',
    'Photograph':        '🖼️',
    'Video':             '🎬',
    'Forensic Report':   '🔬',
    'Witness Statement': '🗣️'
};

let currentLang = 'en';
let allEvidence = [];
let loadedCaseForForm = null;
let courtCasesRef = [];
let attachedFile = null; // { name, size, type, dataUrl (for images) }

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

// ---- Helpers ----
function getEvidence() {
    return JSON.parse(localStorage.getItem('courtEvidence') || '[]');
}
function saveEvidence(data) {
    try {
        localStorage.setItem('courtEvidence', JSON.stringify(data));
        return true;
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.message.includes('Quota')) {
            alert('Storage Quota Exceeded! You have stored too many large files. Please delete some old evidence or use smaller files (under 1MB).');
        } else {
            alert('Failed to save evidence: ' + e.message);
        }
        return false;
    }
}

function formatDisplayDate(isoDate) {
    // "2026-05-07" → "07 May 2026"
    const d = new Date(isoDate + 'T00:00:00');
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatGroupHeader(isoDate) {
    const d = new Date(isoDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0,0,0,0);
    const diff = (today - d) / 86400000;

    const months = ["January","February","March","April","May","June",
                    "July","August","September","October","November","December"];
    const base = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;

    if (diff === 0) return currentLang === 'en' ? `Today — ${base}` : `आज — ${base}`;
    if (diff === 1) return currentLang === 'en' ? `Yesterday — ${base}` : `कल — ${base}`;
    return base;
}

function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ---- Update Stats Pills ----
function updateStats() {
    const total    = allEvidence.length;
    const verified = allEvidence.filter(e => e.status === 'Verified').length;
    const pending  = allEvidence.filter(e => e.status === 'Pending Review').length;
    document.getElementById('stat-ev-total').innerText    = total;
    document.getElementById('stat-ev-verified').innerText = verified;
    document.getElementById('stat-ev-pending').innerText  = pending;
}

// ---- Main Render (date-wise groups) ----
function renderEvidenceList() {
    allEvidence = getEvidence();
    updateStats();

    const container   = document.getElementById('ev-list-container');
    const emptyState  = document.getElementById('ev-empty-state');
    const searchQ     = document.getElementById('ev-search').value.trim().toLowerCase();
    const filterStat  = document.getElementById('filter-ev-status').value;
    const filterType  = document.getElementById('filter-ev-type').value;

    // Apply filters
    let items = allEvidence.filter(e => {
        const matchSearch = !searchQ ||
            e.title.toLowerCase().includes(searchQ) ||
            e.caseId.toLowerCase().includes(searchQ) ||
            e.submittedBy.toLowerCase().includes(searchQ);
        const matchStat = filterStat === 'all' || e.status === filterStat;
        const matchType = filterType === 'all' || e.type === filterType;
        return matchSearch && matchStat && matchType;
    });

    // Sort newest → oldest
    items = items.slice().sort((a, b) => b.date.localeCompare(a.date));

    container.innerHTML = '';

    if (items.length === 0) {
        emptyState.style.display = 'flex';
        return;
    }
    emptyState.style.display = 'none';

    // Group by date
    const groups = {};
    items.forEach(ev => {
        const key = ev.date; // "YYYY-MM-DD"
        if (!groups[key]) groups[key] = [];
        groups[key].push(ev);
    });

    Object.keys(groups)
        .sort((a, b) => b.localeCompare(a))
        .forEach((dateKey, gIdx) => {
            const groupItems = groups[dateKey];
            const groupEl = document.createElement('div');
            groupEl.className = 'ev-date-group';

            // Date label header
            const labelHTML = `
                <div class="ev-date-label">
                    <span class="ev-date-label-text">${formatGroupHeader(dateKey)}</span>
                    <div class="ev-date-label-line"></div>
                    <span class="ev-date-count">${groupItems.length}</span>
                </div>
            `;

            // Cards grid
            const grid = document.createElement('div');
            grid.className = 'ev-cards-grid';

            groupItems.forEach((ev, idx) => {
                grid.appendChild(buildCard(ev, gIdx * 10 + idx));
            });

            groupEl.innerHTML = labelHTML;
            groupEl.appendChild(grid);
            container.appendChild(groupEl);
        });
}

// ---- Build a single File Card ----
function buildCard(ev, animIdx) {
    const card = document.createElement('div');
    card.className = 'ev-card';
    card.dataset.type = ev.type;
    card.style.animationDelay = `${animIdx * 40}ms`;

    const icon     = TYPE_ICONS[ev.type] || '📎';
    const initials = getInitials(ev.submittedBy || '?');

    let statusClass = 'ev-badge--pending';
    if (ev.status === 'Verified') statusClass = 'ev-badge--verified';
    if (ev.status === 'Rejected') statusClass = 'ev-badge--rejected';

    const statusLabel = currentLang === 'hi'
        ? (ev.status === 'Verified' ? 'सत्यापित' : ev.status === 'Rejected' ? 'अस्वीकृत' : 'समीक्षा लंबित')
        : ev.status;

    const typeLabel = currentLang === 'hi' ? (i18nEv['hi']['opt-' + evTypeKey(ev.type)] || ev.type) : ev.type;

    // --- Build attachment section ---
    let attachmentHTML = '';
    if (ev.attachment) {
        const att = ev.attachment;
        const isImage = att.type && att.type.startsWith('image/');
        const safeName = escapeHtml(att.name || '');
        const sizeStr  = att.size ? ` (${att.size < 1048576 ? (att.size/1024).toFixed(1)+' KB' : (att.size/1048576).toFixed(1)+' MB'})` : '';

        if (isImage && att.dataUrl) {
            const blobUrl = createBlobUrl(att.dataUrl, att.type);
            // Image — show thumbnail + filename chip
            attachmentHTML = `
                <img class="ev-card-img-thumb" src="${att.dataUrl}" alt="${safeName}" loading="lazy">
                <a href="${blobUrl}" target="_blank" rel="noopener" class="ev-card-attachment" style="cursor:pointer; text-decoration:none;" title="Open ${safeName}">
                    📎 ${safeName}
                </a>
            `;
        } else if (att.dataUrl) {
            const blobUrl = createBlobUrl(att.dataUrl, att.type);
            // PDF / doc / video — clickable link to open in new tab
            const fileEmoji = getFileEmoji(att.type, att.name);
            attachmentHTML = `
                <a href="${blobUrl}" target="_blank" rel="noopener" class="ev-card-attachment" style="cursor:pointer; text-decoration:none; color: var(--clr-primary-600);" title="Open ${safeName}">
                    ${fileEmoji} ${safeName}<span style="color:#94a3b8;font-weight:400;">${sizeStr}</span>
                    <span style="font-size:0.7rem; opacity:0.7;">↗</span>
                </a>
            `;
        } else {
            // Legacy (no dataUrl stored)
            const fileEmoji = getFileEmoji(att.type, att.name);
            attachmentHTML = `<div class="ev-card-attachment">${fileEmoji} ${safeName}${sizeStr}</div>`;
        }
    }

    card.innerHTML = `
        <div class="ev-card-top">
            <div class="ev-card-file-icon" title="${ev.type}">${icon}</div>
            <div class="ev-card-meta">
                <div class="ev-card-title">${escapeHtml(ev.title)}</div>
                <span class="ev-card-caseid">${escapeHtml(ev.caseId)}</span>
            </div>
        </div>
        <div class="ev-card-body">
            <p class="ev-card-desc">${escapeHtml(ev.description)}</p>
            ${attachmentHTML}
        </div>
        <div class="ev-card-footer">
            <span class="ev-type-chip">${icon} ${typeLabel}</span>
            <span class="ev-status-badge ${statusClass}">${statusLabel}</span>
            <div class="ev-card-submitter">
                <div class="ev-submitter-avatar">${initials}</div>
                <span>${escapeHtml(ev.submittedBy)}</span>
            </div>
            <button class="ev-card-delete" title="Delete Evidence" data-ev-id="${ev.id}" aria-label="Delete Evidence">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6l-1 14H6L5 6"></path>
                    <path d="M10 11v6"></path><path d="M14 11v6"></path>
                    <path d="M9 6V4h6v2"></path>
                </svg>
            </button>
        </div>
    `;

    card.querySelector('.ev-card-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteEvidence(ev.id);
    });

    return card;
}

// ---- File helpers ----
function getFileEmoji(mimeType, filename) {
    if (!mimeType && !filename) return '📎';
    const ext = (filename || '').split('.').pop().toLowerCase();
    if (mimeType && mimeType.startsWith('image/')) return '🖼️';
    if (mimeType && mimeType.startsWith('video/')) return '🎬';
    if (ext === 'pdf') return '📕';
    if (['doc','docx'].includes(ext)) return '📝';
    if (['xls','xlsx'].includes(ext)) return '📊';
    if (['ppt','pptx'].includes(ext)) return '📊';
    return '📎';
}

function formatBytes(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`;
    return `${(bytes/1048576).toFixed(1)} MB`;
}

// ---- Map type to i18n key ----
function evTypeKey(type) {
    const map = {
        'Document': 'doc', 'Affidavit': 'aff', 'Photograph': 'photo',
        'Video': 'video', 'Forensic Report': 'forensic', 'Witness Statement': 'witness'
    };
    return map[type] || '';
}

// ---- Delete Evidence ----
function deleteEvidence(evId) {
    const confirmed = confirm(currentLang === 'en'
        ? 'Are you sure you want to delete this evidence record?'
        : 'क्या आप वाकई इस साक्ष्य रिकॉर्ड को हटाना चाहते हैं?');
    if (!confirmed) return;

    let data = getEvidence();
    data = data.filter(e => e.id !== evId);
    saveEvidence(data);
    renderEvidenceList();
}

// ---- Safe HTML Escape ----
function escapeHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str || ''));
    return d.innerHTML;
}

// ---- Fetch Case Preview ----
function fetchCase() {
    const inputEl = document.getElementById('ev-case-id');
    const preview = document.getElementById('ev-case-preview');
    const textEl  = document.getElementById('ev-preview-text');
    const targetId = inputEl.value.trim().toUpperCase();

    preview.classList.remove('visible', 'error');

    if (!targetId) return;

    courtCasesRef = JSON.parse(localStorage.getItem('courtCases') || '[]');
    const found = courtCasesRef.find(c => c.id.toUpperCase() === targetId);

    if (found) {
        loadedCaseForForm = found;
        textEl.innerText = `${found.petitioner} · ${found.status}`;
        preview.classList.add('visible');
        preview.classList.remove('error');
    } else {
        loadedCaseForForm = null;
        textEl.innerText = currentLang === 'en'
            ? 'Case ID not found in the system.'
            : 'केस आईडी सिस्टम में नहीं मिला।';
        preview.classList.add('visible', 'error');
    }
}

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

    // Auth Check
    if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }

    // Auto-fill Case ID from URL param (e.g. arriving from case-details.html)
    const urlParams = new URLSearchParams(window.location.search);
    const preloadId = urlParams.get('caseId');
    if (preloadId) {
        const caseIdInput = document.getElementById('ev-case-id');
        if (caseIdInput) {
            caseIdInput.value = preloadId;
            fetchCase();
        }
    }


    // Set default today's date
    const dateInput = document.getElementById('ev-date');
    if (dateInput) dateInput.valueAsDate = new Date();

    // ---- File Upload Zone ----
    const uploadZone  = document.getElementById('ev-upload-zone');
    const fileInput   = document.getElementById('ev-file-input');
    const uploadInner = document.getElementById('ev-upload-inner');
    const uploadPrev  = document.getElementById('ev-upload-preview');
    const imgPreview  = document.getElementById('ev-img-preview');
    const fileChip    = document.getElementById('ev-file-chip');
    const fileIcon    = document.getElementById('ev-file-icon');
    const fileName    = document.getElementById('ev-file-name');
    const fileSize    = document.getElementById('ev-file-size');
    const fileRemove  = document.getElementById('ev-file-remove');

    function resetFileUpload() {
        attachedFile = null;
        if (fileInput)   fileInput.value = '';
        if (uploadInner) uploadInner.style.display = 'flex';
        if (uploadPrev)  uploadPrev.style.display  = 'none';
        if (imgPreview)  { imgPreview.src = ''; imgPreview.style.display = 'none'; }
    }

    function handleFile(file) {
        if (!file) return;

        const MAX = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX) {
            alert('File is too large. Please select a file under 5MB.');
            return;
        }

        // Read ALL file types as base64 — needed to open PDFs/docs in a new tab
        const reader = new FileReader();
        reader.onload = (e) => {
            const isImage = file.type.startsWith('image/');
            attachedFile = { name: file.name, size: file.size, type: file.type, dataUrl: e.target.result };

            if (isImage) {
                imgPreview.src = e.target.result;
                imgPreview.style.display = 'block';
            } else {
                if (imgPreview) imgPreview.style.display = 'none';
            }
            showFileChip(file);
        };
        reader.onerror = () => alert('Failed to read file. Please try again.');
        reader.readAsDataURL(file);
    }

    function showFileChip(file) {
        if (uploadInner) uploadInner.style.display = 'none';
        if (uploadPrev)  uploadPrev.style.display  = 'flex';
        const emoji = getFileEmoji(file.type, file.name);
        if (fileIcon) fileIcon.textContent = emoji;
        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = formatBytes(file.size);
    }

    if (fileInput) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files[0]) handleFile(fileInput.files[0]);
        });
    }

    if (fileRemove) {
        fileRemove.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            resetFileUpload();
        });
    }

    // Drag and drop
    if (uploadZone) {
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('drag-over');
        });
        uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('drag-over');
            const dropped = e.dataTransfer.files[0];
            if (dropped) handleFile(dropped);
        });
    }

    // Initial render
    renderEvidenceList();

    // ---- Fetch Button ----
    document.getElementById('btn-fetch-case').addEventListener('click', fetchCase);
    document.getElementById('ev-case-id').addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); fetchCase(); }
    });

    // ---- Form Submission ----
    document.getElementById('ev-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const errorBox   = document.getElementById('ev-error');
        const successBox = document.getElementById('ev-success');
        errorBox.style.display   = 'none';
        successBox.style.display = 'none';

        const caseId      = document.getElementById('ev-case-id').value.trim().toUpperCase();
        const title       = document.getElementById('ev-title').value.trim();
        const submittedBy = document.getElementById('ev-submitted-by').value.trim();
        const type        = document.getElementById('ev-type').value;
        const dateVal     = document.getElementById('ev-date').value;
        const desc        = document.getElementById('ev-description').value.trim();
        const status      = document.querySelector('input[name="ev-status"]:checked')?.value || 'Pending Review';

        if (!caseId || !title || !submittedBy || !type || !dateVal || !desc) {
            errorBox.style.display = 'flex';
            document.getElementById('ev-error-text').innerText = i18nEv[currentLang]['ev-error-text'];
            return;
        }

        const newEvidence = {
            id:          'EV-' + Date.now(),
            caseId:      caseId,
            title:       title,
            submittedBy: submittedBy,
            type:        type,
            date:        dateVal,
            description: desc,
            status:      status,
            attachment:  attachedFile || null
        };

        const data = getEvidence();
        data.push(newEvidence);
        const success = saveEvidence(data);
        if (!success) return; // Stop if storage limit reached

        // Success feedback
        successBox.style.display = 'flex';
        document.getElementById('ev-success-text').innerText = i18nEv[currentLang]['ev-success-text'];
        setTimeout(() => successBox.style.display = 'none', 3500);

        // Reset form (keep case id + date)
        document.getElementById('ev-title').value        = '';
        document.getElementById('ev-submitted-by').value = '';
        document.getElementById('ev-type').value         = '';
        document.getElementById('ev-description').value  = '';
        document.querySelector('input[name="ev-status"][value="Pending Review"]').checked = true;
        resetFileUpload(); // clear attachment

        renderEvidenceList();
    });

    // ---- Live Search & Filters ----
    ['ev-search', 'filter-ev-status', 'filter-ev-type'].forEach(id => {
        document.getElementById(id).addEventListener('input', renderEvidenceList);
        document.getElementById(id).addEventListener('change', renderEvidenceList);
    });

    // ---- Language Toggle ----
    const toggleBtn = document.getElementById('lang-toggle');
    const spanEn    = document.querySelector('.lang-en');
    const spanHi    = document.querySelector('.lang-hi');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'hi' : 'en';
            spanEn.classList.toggle('active', currentLang === 'en');
            spanHi.classList.toggle('active', currentLang === 'hi');

            for (const [id, text] of Object.entries(i18nEv[currentLang])) {
                const el = document.getElementById(id);
                if (el) {
                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                        // skip value, only update placeholder if needed
                    } else {
                        el.innerText = text;
                    }
                }
            }

            // Update placeholders
            document.getElementById('ev-case-id').placeholder       = currentLang === 'en' ? 'e.g. #CAS-2026-1234' : 'उदा. #CAS-2026-1234';
            document.getElementById('ev-title').placeholder         = currentLang === 'en' ? 'e.g. Witness Affidavit.pdf' : 'उदा. गवाह हलफनामा.pdf';
            document.getElementById('ev-submitted-by').placeholder  = currentLang === 'en' ? 'Advocate / Party Name' : 'अधिवक्ता / पार्टी का नाम';
            document.getElementById('ev-description').placeholder   = currentLang === 'en' ? 'Brief description of this evidence item...' : 'इस साक्ष्य का संक्षिप्त विवरण...';
            document.getElementById('ev-search').placeholder        = currentLang === 'en' ? 'Search by title, case or party...' : 'शीर्षक, केस या पार्टी से खोजें...';
            document.getElementById('btn-fetch-case').innerText     = i18nEv[currentLang]['btn-fetch'];

            // Re-render cards with new lang labels
            renderEvidenceList();
        });
    }
});
