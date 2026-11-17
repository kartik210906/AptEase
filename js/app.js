// AptEase - Shared Application Shell, Router & Core Helpers
const $ = (s, e = document) => e.querySelector(s);
const $$ = (s, e = document) => [...e.querySelectorAll(s)];

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
}[c]));

const formatINR = n => '₹' + Number(n || 0).toLocaleString('en-IN');

const badge = (status, type = '') => {
  const norm = String(status || '').toLowerCase().replace(/\s+/g, '');
  return `<span class="badge ${type || norm}">${esc(status)}</span>`;
};

const empty = (msg = 'No data available.') => `<div class="empty"><i data-lucide="inbox" style="margin-bottom:8px; display:inline-block; opacity:0.6;"></i><br>${msg}</div>`;

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<i data-lucide="check-circle" style="color:#10B981;"></i><span>${esc(msg)}</span>`;
  document.body.appendChild(t);
  if (window.lucide) lucide.createIcons();
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(10px)';
    t.style.transition = 'all 0.2s ease';
    setTimeout(() => t.remove(), 250);
  }, 2600);
}

function modal(htmlContent) {
  const m = document.createElement('div');
  m.className = 'modal';
  m.innerHTML = `
    <div class="card">
      ${htmlContent}
      <div style="margin-top:20px; text-align:right;">
        <button class="btn ghost sm" id="modal-close-btn">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(m);
  if (window.lucide) lucide.createIcons();
  m.onclick = e => {
    if (e.target === m || e.target.id === 'modal-close-btn') m.remove();
  };
  return m;
}

function boot({ role, user, nav, views }) {
  DB.seed();

  // Validate or set session
  localStorage.setItem('ae_session', role);

  const getSubBadge = () => {
    if (role === 'resident') {
      return `<div class="sidebar-plan-card"><div class="plan-name">Flat ${esc(user.flat || 'A-302')}</div><div class="plan-status">Resident Member</div></div>`;
    }
    if (role === 'admin') {
      const s = DB.get('settings') || {};
      const plan = s.currentPlan || 'Basic';
      return `
        <div class="sidebar-plan-card">
          <div class="plan-name">
            <span>${esc(plan)} Plan</span>
            <a href="#subscription" style="padding:2px 6px; font-size:11px; background:var(--p); color:#fff; border-radius:4px;">Upgrade</a>
          </div>
          <div class="plan-status">Status: <strong>${esc(s.subscriptionStatus || 'Active')}</strong></div>
        </div>
      `;
    }
    if (role === 'superadmin') {
      const rev = DB.calcRevenue();
      return `
        <div class="sidebar-plan-card" style="background:linear-gradient(135deg, #252238, #373352); color:#fff;">
          <div class="plan-name" style="color:#A78BFA;">SaaS Operations</div>
          <div class="plan-status" style="color:#D3CEE8;">MRR: <strong>${formatINR(rev.mrr)}</strong></div>
        </div>
      `;
    }
    return '';
  };

  const roleNameMap = {
    resident: 'Resident',
    admin: 'Society Admin',
    superadmin: 'Super Admin (AptEase Corp)'
  };

  const appEl = document.getElementById('app');
  if (!appEl) return;

  appEl.innerHTML = `
    <div class="layout">
      <!-- Sidebar Navigation -->
      <aside class="side" id="side">
        <div class="brand">
          <span class="logo">A</span>
          <span>AptEase</span>
        </div>

        <div class="nav-section-title">Navigation</div>
        ${nav.map(([id, label, icon]) => `
          <a href="#${id}" data-id="${id}">
            <i data-lucide="${icon}"></i>
            <span>${label}</span>
          </a>
        `).join('')}

        <div class="sp"></div>

        <div class="side-footer">
          ${getSubBadge()}
          <div class="nav-section-title" style="padding:4px 0 2px;">Switch Portal</div>
          <div class="row" style="gap:4px;">
            <a href="resident.html" class="btn ghost sm ${role === 'resident' ? 'on' : ''}" style="flex:1; justify-content:center; padding:6px 4px; font-size:11px;">Resident</a>
            <a href="admin.html" class="btn ghost sm ${role === 'admin' ? 'on' : ''}" style="flex:1; justify-content:center; padding:6px 4px; font-size:11px;">Society</a>
            <a href="superadmin.html" class="btn ghost sm ${role === 'superadmin' ? 'on' : ''}" style="flex:1; justify-content:center; padding:6px 4px; font-size:11px;">SaaS HQ</a>
          </div>
          <a href="index.html" style="margin-top:4px;"><i data-lucide="log-out"></i>Sign Out</a>
        </div>
      </aside>

      <!-- Main Content Container -->
      <div>
        <header class="top">
          <div class="row">
            <button class="btn ghost menu" id="menu-btn" aria-label="Toggle Navigation"><i data-lucide="menu"></i></button>
            <h2 id="page-title">Dashboard</h2>
          </div>

          <div class="top-actions">
            <!-- Quick Role Switcher Pill -->
            <div class="role-switcher-select">
              <i data-lucide="shield-check" style="color:var(--p);"></i>
              <span class="mu" style="font-size:12px;">Portal:</span>
              <select id="quick-role-select">
                <option value="resident" ${role === 'resident' ? 'selected' : ''}>Resident (Rahul)</option>
                <option value="admin" ${role === 'admin' ? 'selected' : ''}>Society Admin (Priya)</option>
                <option value="superadmin" ${role === 'superadmin' ? 'selected' : ''}>Super Admin (AptEase SaaS)</option>
              </select>
            </div>

            <!-- User Info -->
            <div class="who">
              <div style="text-align:right;">
                <strong>${esc(user.name)}</strong>
                <div class="mu" style="font-size:12px;">${esc(user.sub || roleNameMap[role])}</div>
              </div>
              <div class="av">${esc(user.name.charAt(0))}</div>
            </div>
          </div>
        </header>

        <main id="main"></main>
      </div>
    </div>
  `;

  // Menu button for mobile
  const menuBtn = $('#menu-btn');
  if (menuBtn) menuBtn.onclick = () => $('#side').classList.toggle('open');

  // Role Switcher Listener
  const quickSelect = $('#quick-role-select');
  if (quickSelect) {
    quickSelect.onchange = (e) => {
      const selectedRole = e.target.value;
      localStorage.setItem('ae_session', selectedRole);
      if (selectedRole === 'resident') window.location.href = 'resident.html';
      else if (selectedRole === 'admin') window.location.href = 'admin.html';
      else if (selectedRole === 'superadmin') window.location.href = 'superadmin.html';
    };
  }

  // Hash Router
  const navigate = () => {
    const rawHash = location.hash || '#' + nav[0][0];
    const viewId = rawHash.replace('#', '');
    const currentView = views[viewId] || views[nav[0][0]];
    const navItem = nav.find(n => n[0] === viewId) || nav[0];

    // Highlight active nav item
    $$('.side a[data-id]').forEach(a => {
      a.classList.toggle('on', a.dataset.id === navItem[0]);
    });

    const pageTitle = $('#page-title');
    if (pageTitle) pageTitle.textContent = navItem[1];

    const sideEl = $('#side');
    if (sideEl) sideEl.classList.remove('open');

    const mainEl = $('#main');
    if (mainEl && currentView) {
      mainEl.innerHTML = currentView.render();
      if (currentView.bind) currentView.bind();
      if (window.lucide) lucide.createIcons();
    }
  };

  window.rerender = navigate;
  window.addEventListener('hashchange', navigate);
  navigate();

  // Render Guided Workflow Tour Widget
  if (window.Tour) {
    Tour.render();
  }

  // Listen to cross-component database changes
  window.addEventListener('aeevent', (e) => {
    if (['societies', 'complaints', 'settings', 'tour'].includes(e.detail.key)) {
      if (window.rerender) window.rerender();
      if (window.Tour) Tour.render();
    }
  });
}

// Live Search & Filter Helper
function searchable(tableBodyId, rowsRenderFn) {
  const q = $('#q');
  const f = $('#f');
  const draw = () => {
    const tbody = $('#' + tableBodyId);
    if (!tbody) return;
    const searchVal = q ? q.value.toLowerCase().trim() : '';
    const filterVal = f ? f.value : '';
    tbody.innerHTML = rowsRenderFn(searchVal, filterVal);
    if (window.lucide) lucide.createIcons();
  };
  if (q) q.oninput = draw;
  if (f) f.onchange = draw;
  draw();
}
