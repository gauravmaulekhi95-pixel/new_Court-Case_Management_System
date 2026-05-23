// Translation Dictionary for Dashboard
const i18nDb = {
    'en': {
        'nav-brand': 'Admin Dashboard',
        'db-search-input': 'Search Case ID or Petitioner...',
        'db-title': 'Case Overview',
        'btn-add-case': '+ Add Case',
        'btn-update-case': 'Update Case',
        'btn-add-hearing': 'Add Hearing',
        'stat-total-label': 'Total Cases',
        'stat-pending-label': 'Pending Cases',
        'stat-closed-label': 'Closed Cases',
        'table-title': 'Recent Case Filings',
        'th-case': 'Case ID',
        'th-petitioner': 'Petitioner vs Respondent',
        'th-status': 'Status',
        'th-date': 'Filing Date',
        'chart-title': 'Status Distribution',
        'modal-add-title': 'Register New Case',
        'lbl-petitioner': 'Petitioner vs Respondent',
        'input-petitioner': 'e.g. Rahul Sharma vs Union',
        'lbl-type': 'Case Type',
        'opt-civil': 'Civil',
        'opt-criminal': 'Criminal',
        'opt-tax': 'Tax',
        'btn-submit-case': 'Submit Case',
        'th-action': 'Action'
    },
    'hi': {
        'nav-brand': 'एडमिन डैशबोर्ड',
        'db-search-input': 'केस आईडी या याचिकाकर्ता खोजें...',
        'db-title': 'केस अवलोकन',
        'btn-add-case': '+ केस जोड़ें',
        'btn-update-case': 'केस अपडेट करें',
        'btn-add-hearing': 'सुनवाई जोड़ें',
        'stat-total-label': 'कुल केस',
        'stat-pending-label': 'लंबित केस',
        'stat-closed-label': 'बंद केस',
        'table-title': 'हालिया केस फाइलिंग',
        'th-case': 'केस आईडी',
        'th-petitioner': 'याचिकाकर्ता बनाम प्रतिवादी',
        'th-status': 'स्थिति',
        'th-date': 'फाइलिंग की तारीख',
        'chart-title': 'स्थिति वितरण',
        'modal-add-title': 'नया केस पंजीकृत करें',
        'lbl-petitioner': 'याचिकाकर्ता बनाम प्रतिवादी',
        'input-petitioner': 'उदा. राहुल शर्मा बनाम यूनियन',
        'lbl-type': 'केस प्रकार',
        'opt-civil': 'दीवानी',
        'opt-criminal': 'फ़ौजदारी',
        'opt-tax': 'कर',
        'btn-submit-case': 'केस सबमिट करें',
        'th-action': 'कार्रवाई'
    }
};

let currentLang = 'en';
let courtCases = [];
let statusChart;

function generateCaseID() {
    return '#CAS-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
}

function loadCases() {
    const saved = localStorage.getItem('courtCases');
    if (saved) {
        courtCases = JSON.parse(saved);
        // Sort cases by latest first based loosely on index if dates are strings
        courtCases.reverse();
    } else {
        courtCases = []; // Realtime empty state
    }
}

function saveCases() {
    localStorage.setItem('courtCases', JSON.stringify(courtCases));
}

function renderDashboard() {
    const tableBody = document.getElementById('case-table-body');
    const totalCount = document.querySelector('.stat-card:nth-child(1) h3');
    const pendingCount = document.querySelector('.stat-card:nth-child(2) h3');
    const closedCount = document.querySelector('.stat-card:nth-child(3) h3');

    // Get filter values
    const searchInput = document.getElementById('db-search-input');
    const statusSelect = document.getElementById('filter-status');
    const typeSelect = document.getElementById('filter-type');

    const searchStr = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const statusStr = (statusSelect ? statusSelect.value : 'all').toLowerCase();
    const typeStr = (typeSelect ? typeSelect.value : 'all').toLowerCase();

    if(!tableBody) return;

    let pending = 0;
    let closed = 0;
    let inReview = 0;

    tableBody.innerHTML = ''; // clear

    // Count over all cases
    courtCases.forEach(c => {
        if(c.status === 'Pending') pending++;
        else if(c.status === 'Closed') closed++;
        else if(c.status === 'In Review') inReview++;
    });

    let filteredCases = courtCases;

    if (searchStr || statusStr !== 'all' || typeStr !== 'all') {
        filteredCases = courtCases.filter(c => {
            let matchSearch = true;
            let matchStatus = true;
            let matchType = true;

            if (searchStr) {
                const combined = `${c.id} ${c.petitioner}`.toLowerCase();
                matchSearch = combined.includes(searchStr);
            }
            if (statusStr !== 'all') {
                matchStatus = c.status.toLowerCase() === statusStr;
            }
            if (typeStr !== 'all') {
                matchType = c.type.toLowerCase() === typeStr;
            }
            return matchSearch && matchStatus && matchType;
        });
    }

    if(filteredCases.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="empty-table" style="text-align:center; padding:2rem;">${currentLang === 'en' ? 'No cases found.' : 'कोई केस नहीं मिला।'}</td></tr>`;
    } else {
        filteredCases.forEach(c => {
            // localization for badges
            let statusText = c.status;
            let statusClass = 'status-pending';
            
            if(c.status === 'Closed') statusClass = 'status-closed';
            if(c.status === 'In Review') { statusClass = 'status-in-review'; statusText = 'In Review'; }

            if(currentLang === 'hi') {
                if(c.status === 'Pending') statusText = 'लंबित';
                if(c.status === 'Closed') statusText = 'बंद';
                if(c.status === 'In Review') statusText = 'समीक्षा में';
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${c.id}</strong></td>
                <td>${c.petitioner}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${c.date}</td>
                <td style="display: flex; gap: 0.5rem; align-items: center;">
                    <a href="case-details.html?id=${encodeURIComponent(c.id)}" style="color: var(--clr-primary-600); font-weight: 600; text-decoration: none; padding: 4px 8px; border: 1px solid var(--clr-primary-600); border-radius: 4px;">View</a>
                    <button onclick="deleteCase('${c.id}')" style="background: transparent; color: #ef4444; border: 1px solid #fecaca; border-radius: 4px; padding: 4px 8px; font-weight: 600; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='transparent'" title="Delete Case">
                        Del
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    if(totalCount) totalCount.innerText = courtCases.length;
    if(pendingCount) pendingCount.innerText = pending;
    if(closedCount) closedCount.innerText = closed;

    // Update Chart
    if (statusChart) {
        statusChart.data.datasets[0].data = [pending, closed, inReview];
        statusChart.update();
    }
}

window.deleteCase = function(id) {
    if (!confirm(currentLang === 'en' ? `Are you sure you want to completely delete case ${id}? This will also delete all associated evidence files.` : `क्या आप निश्चित रूप से केस ${id} को पूरी तरह से हटाना चाहते हैं?`)) {
        return;
    }

    // 1. Delete case
    let cases = JSON.parse(localStorage.getItem('courtCases') || '[]');
    cases = cases.filter(c => c.id !== id);
    localStorage.setItem('courtCases', JSON.stringify(cases));

    // 2. Delete associated evidence to clear heavy blobs
    let evidence = JSON.parse(localStorage.getItem('courtEvidence') || '[]');
    const normalise = s => (s || '').replace(/^#+/, '').trim().toUpperCase();
    const targetId = normalise(id);
    evidence = evidence.filter(e => normalise(e.caseId) !== targetId);
    localStorage.setItem('courtEvidence', JSON.stringify(evidence));

    // 3. Reload
    loadCases();
    renderDashboard();
};

document.addEventListener('DOMContentLoaded', () => {

    // Auth Check
    if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }

    // Success Notification Check
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        const caseId = urlParams.get('id') || '';
        setTimeout(() => {
            alert(currentLang === 'en' ? `Case successfully registered! ID: ${caseId}` : `केस सफलतापूर्वक पंजीकृत! आईडी: ${caseId}`);
            window.history.replaceState({}, document.title, "admin-dashboard.html");
        }, 500);
    }

    // Logout Logic
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isAdminLoggedIn');
            window.location.href = 'index.html';
        });
    }

    // Initial load animation
    setTimeout(() => {
        const container = document.querySelector('.dashboard-container');
        if(container) container.classList.add('visible');
    }, 100);

    // Initializing Chart.js container
    const ctx = document.getElementById('statusChart');
    if (ctx) {
        statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Pending', 'Closed', 'In Review'],
                datasets: [{
                    data: [0, 0, 0], // init to 0
                    backgroundColor: ['#f59e0b', '#10b981', '#3b82f6'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { family: "'Inter', sans-serif" },
                            padding: 20
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }

    loadCases();
    renderDashboard();

    // Attach listeners for live filtering
    const dbSearch = document.getElementById('db-search-input');
    const filterStatus = document.getElementById('filter-status');
    const filterType = document.getElementById('filter-type');
    
    if (dbSearch) dbSearch.addEventListener('input', renderDashboard);
    if (filterStatus) filterStatus.addEventListener('change', renderDashboard);
    if (filterType) filterType.addEventListener('change', renderDashboard);

    // Update Case button routing
    const updateCaseBtn = document.getElementById('btn-update-case');
    if (updateCaseBtn) {
        updateCaseBtn.addEventListener('click', () => {
            window.location.href = 'update-case.html';
        });
    }

    // Modal logic removed since it moved to a dedicated page

    // Language Toggle
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

            const pageBody = document.querySelector('.dashboard-container');
            if(pageBody) pageBody.style.opacity = '0.9';
            
            setTimeout(() => {
                for (const [id, text] of Object.entries(i18nDb[currentLang])) {
                    const el = document.getElementById(id);
                    if(el) {
                        if (el.tagName === 'INPUT') {
                            el.placeholder = text;
                        } else {
                            el.innerText = text;
                        }
                    }
                }
                
                // Keep chart labels translated
                if(statusChart) {
                    statusChart.data.labels = currentLang === 'en' 
                        ? ['Pending', 'Closed', 'In Review'] 
                        : ['लंबित', 'बंद', 'समीक्षा में'];
                    statusChart.update();
                }

                // Update select filters manually
                const filterStatus = document.querySelector('#filter-status');
                const filterType = document.querySelector('#filter-type');
                if(filterStatus && filterType) {
                    if (currentLang === 'hi') {
                        filterStatus.options[0].text = 'सभी स्थिति';
                        filterStatus.options[1].text = 'लंबित';
                        filterStatus.options[2].text = 'बंद';
                        
                        filterType.options[0].text = 'सभी प्रकार';
                        filterType.options[1].text = 'दीवानी';
                        filterType.options[2].text = 'फ़ौजदारी';
                    } else {
                        filterStatus.options[0].text = 'All Status';
                        filterStatus.options[1].text = 'Pending';
                        filterStatus.options[2].text = 'Closed';
                        
                        filterType.options[0].text = 'All Types';
                        filterType.options[1].text = 'Civil';
                        filterType.options[2].text = 'Criminal';
                    }
                }
                
                renderDashboard(); // Re-render table completely to apply Hindi text to badges / empty table msg
                
                if (pageBody) pageBody.style.opacity = '1';
            }, 150);
        });
    }

    // ============================================================
    //  NOTIFICATION PANEL LOGIC
    // ============================================================

    // --- Config ---
    const NOTIF_STORAGE_KEY = 'courtNotifications';
    const NOTIF_READ_KEY    = 'courtNotifReadIds';

    // --- Time formatting ---
    function timeAgo(isoTimestamp) {
        const diff = Date.now() - new Date(isoTimestamp).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1)   return 'Just now';
        if (mins < 60)  return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24)   return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        if (days < 7)   return `${days}d ago`;
        return new Date(isoTimestamp).toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
    }

    // --- Generate notifications from existing localStorage data ---
    function generateNotificationsFromData() {
        const existing = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || '[]');
        const existingIds = new Set(existing.map(n => n.id));
        const newNotifs = [];

        // Cases → "Case Registered"
        const cases = JSON.parse(localStorage.getItem('courtCases') || '[]');
        cases.forEach(c => {
            const nid = `case-reg-${c.id}`;
            if (!existingIds.has(nid)) {
                newNotifs.push({
                    id:        nid,
                    type:      'case',
                    icon:      '📋',
                    title:     'Case Registered',
                    sub:       `${c.id} — ${c.petitioner}`,
                    timestamp: new Date().toISOString(),
                    link:      `case-details.html?id=${encodeURIComponent(c.id)}`
                });
            }
            // Hearings within this case
            (c.hearings || []).forEach((h, idx) => {
                const hid = `hearing-${c.id}-${idx}`;
                if (!existingIds.has(hid)) {
                    newNotifs.push({
                        id:        hid,
                        type:      'hearing',
                        icon:      '🗓️',
                        title:     'Hearing Scheduled',
                        sub:       `${c.id} — ${h.date}`,
                        timestamp: new Date().toISOString(),
                        link:      `manage-hearings.html?id=${encodeURIComponent(c.id)}`
                    });
                }
            });
        });

        // Evidence
        const evidence = JSON.parse(localStorage.getItem('courtEvidence') || '[]');
        evidence.forEach(e => {
            const eid = `ev-add-${e.id}`;
            if (!existingIds.has(eid)) {
                newNotifs.push({
                    id:        eid,
                    type:      'evidence',
                    icon:      '📂',
                    title:     'Evidence Logged',
                    sub:       `${e.caseId} — ${e.title}`,
                    timestamp: new Date().toISOString(),
                    link:      `manage-evidence.html?caseId=${encodeURIComponent(e.caseId)}`
                });
            }
        });

        if (newNotifs.length > 0) {
            // Merge — new ones at the front
            const merged = [...newNotifs, ...existing];
            // Cap at 30 total
            localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(merged.slice(0, 30)));
        }
    }

    // --- Seed demo notifications if the store is empty ---
    function seedDemoNotifications() {
        const existing = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || '[]');
        if (existing.length > 0) return; // already has data

        const demos = [
            {
                id: 'demo-1',
                type: 'case',
                icon: '📋',
                title: 'Case Registered',
                sub: '#CAS-2026-Demo — Sharma vs Union of India',
                timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
                link: 'register-case.html'
            },
            {
                id: 'demo-2',
                type: 'hearing',
                icon: '🗓️',
                title: 'Hearing Scheduled',
                sub: '#CAS-2026-Demo — 15 May 2026 · Merit Hearing',
                timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
                link: 'manage-hearings.html'
            },
            {
                id: 'demo-3',
                type: 'evidence',
                icon: '📂',
                title: 'Evidence Logged',
                sub: '#CAS-2026-Demo — Witness Affidavit.pdf',
                timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
                link: 'manage-evidence.html'
            },
            {
                id: 'demo-4',
                type: 'status',
                icon: '✅',
                title: 'Case Status Updated',
                sub: '#CAS-2026-Demo — Status changed to Closed',
                timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
                link: 'admin-dashboard.html'
            },
            {
                id: 'demo-5',
                type: 'alert',
                icon: '⚠️',
                title: 'Hearing Due Tomorrow',
                sub: '#CAS-2026-Demo — Remind advocate to submit docs',
                timestamp: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
                link: 'manage-hearings.html'
            }
        ];
        localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(demos));
    }

    // --- Render notification items ---
    let activeTab = 'all';

    function renderNotifications() {
        const list      = document.getElementById('notif-list');
        const emptyEl   = document.getElementById('notif-empty');
        const badge     = document.getElementById('notif-badge');
        const bellBtn   = document.getElementById('notif-bell');
        const countChip = document.getElementById('notif-count-chip');
        if (!list) return;

        const all     = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || '[]');
        const readIds = new Set(JSON.parse(localStorage.getItem(NOTIF_READ_KEY) || '[]'));
        const items   = activeTab === 'unread' ? all.filter(n => !readIds.has(n.id)) : all;
        const unreadCount = all.filter(n => !readIds.has(n.id)).length;

        // Update badge
        if (unreadCount > 0) {
            badge.style.display = 'flex';
            badge.textContent   = unreadCount > 9 ? '9+' : unreadCount;
            bellBtn.classList.add('has-unread');
        } else {
            badge.style.display = 'none';
            bellBtn.classList.remove('has-unread');
        }

        if (countChip) {
            countChip.textContent = unreadCount > 0 ? `${unreadCount} new` : 'All read';
        }

        list.innerHTML = '';

        if (items.length === 0) {
            if (emptyEl) emptyEl.style.display = 'flex';
            return;
        }
        if (emptyEl) emptyEl.style.display = 'none';

        items.forEach(n => {
            const isUnread = !readIds.has(n.id);
            const item = document.createElement('div');
            item.className = `notif-item${isUnread ? ' unread' : ''}`;
            item.dataset.id = n.id;

            item.innerHTML = `
                <div class="notif-icon-wrap type-${n.type || 'case'}">${n.icon || '📋'}</div>
                <div class="notif-text">
                    <div class="notif-title">${n.title}</div>
                    <div class="notif-sub" title="${n.sub}">${n.sub}</div>
                    <span class="notif-time">${timeAgo(n.timestamp)}</span>
                </div>
            `;

            item.addEventListener('click', () => {
                // Mark as read
                readIds.add(n.id);
                localStorage.setItem(NOTIF_READ_KEY, JSON.stringify([...readIds]));
                // Navigate
                if (n.link) window.location.href = n.link;
                renderNotifications();
            });

            list.appendChild(item);
        });
    }

    // --- Wire up bell button & close-on-outside ---
    function initNotificationPanel() {
        seedDemoNotifications();
        generateNotificationsFromData();
        renderNotifications();

        const bell     = document.getElementById('notif-bell');
        const dropdown = document.getElementById('notif-dropdown');
        const wrapper  = document.getElementById('notif-wrapper');
        const markAll  = document.getElementById('notif-mark-all');

        if (!bell || !dropdown) return;

        // Toggle open/close
        bell.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('open');
            dropdown.classList.toggle('open', !isOpen);
            bell.setAttribute('aria-expanded', String(!isOpen));
            if (!isOpen) renderNotifications(); // refresh timestamps when opening
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (wrapper && !wrapper.contains(e.target)) {
                dropdown.classList.remove('open');
                bell.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                dropdown.classList.remove('open');
                bell.setAttribute('aria-expanded', 'false');
            }
        });

        // Mark all as read
        if (markAll) {
            markAll.addEventListener('click', () => {
                const all     = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || '[]');
                const allIds  = all.map(n => n.id);
                localStorage.setItem(NOTIF_READ_KEY, JSON.stringify(allIds));
                renderNotifications();
            });
        }

        // Tabs — All / Unread
        document.querySelectorAll('.notif-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                activeTab = tab.dataset.tab;
                renderNotifications();
            });
        });
    }

    initNotificationPanel();
});

