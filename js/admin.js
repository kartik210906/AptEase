// AptEase - Society Admin Panel (Priya Menon · Greenview Residency)
// Operational Management & Subscription Plan Upgrade Center

const STATUSES = ['Pending', 'In Progress', 'Resolved'];

boot({
  role: 'admin',
  user: { name: 'Priya Menon', sub: 'Society Administrator' },
  nav: [
    ['dashboard', 'Dashboard', 'layout-dashboard'],
    ['complaints', 'Complaints Hub', 'wrench'],
    ['residents', 'Resident Directory', 'users'],
    ['visitors', 'Visitor Gate Log', 'user-check'],
    ['notices', 'Notices & Circulars', 'megaphone'],
    ['community', 'Community Board', 'messages-square'],
    ['subscription', 'My Subscription', 'credit-card'],
    ['settings', 'Society Settings', 'settings']
  ],
  views: {
    // 1. DASHBOARD
    dashboard: {
      render() {
        const c = DB.get('complaints') || [];
        const n = s => c.filter(x => x.status === s).length;
        const residents = DB.get('residents') || [];
        const settings = DB.get('settings') || {};
        const visitors = DB.get('visitors') || [];
        const currentPlan = settings.currentPlan || 'Basic';

        return `
          <!-- Society Header Overview -->
          <div class="row between" style="margin-bottom:20px;">
            <div>
              <h2 style="font-size:22px; margin-bottom:4px;">${esc(settings.society)}</h2>
              <p class="muted">${esc(settings.address)} · <strong>${esc(settings.units)}</strong></p>
            </div>
            <div>
              <a href="#subscription" class="btn ${currentPlan === 'Premium' ? 'ghost' : ''}">
                <i data-lucide="zap"></i> Plan: <strong>${esc(currentPlan)}</strong> (${currentPlan === 'Premium' ? 'Active' : 'Upgrade Available'})
              </a>
            </div>
          </div>

          <!-- Subscription Status Alert Banner -->
          <div style="background:linear-gradient(135deg, #FAF8FF, #EFEAFF); border:1px solid #D8CEF8; border-radius:12px; padding:16px 20px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; align-items:center; gap:14px;">
              <div style="width:42px; height:42px; border-radius:10px; background:var(--p); color:#fff; display:grid; place-items:center;">
                <i data-lucide="shield-check"></i>
              </div>
              <div>
                <strong>AptEase Society Subscription: ${esc(currentPlan)} Tier</strong>
                <div class="mu" style="font-size:12px;">
                  Status: <span class="badge active" style="font-size:11px;">Active</span> · Renews on <strong>${settings.renewalDate || '2026-12-15'}</strong> (Auto-Debit)
                </div>
              </div>
            </div>
            ${currentPlan !== 'Premium' ? `
              <a href="#subscription" class="btn sm">
                <i data-lucide="sparkles"></i> Upgrade to Premium (₹2,499/mo)
              </a>
            ` : `
              <span class="badge premium"><i data-lucide="check"></i> All Premium Features Unlocked</span>
            `}
          </div>

          <!-- Quick Stats Grid -->
          <div class="grid g4">
            <div class="card stat hl">
              <div class="stat-header">
                <span class="stat-title">Total Residents</span>
                <div class="stat-icon"><i data-lucide="users"></i></div>
              </div>
              <b>${residents.length}</b>
              <div class="stat-sub">Across 120 Flats</div>
            </div>

            <div class="card stat">
              <div class="stat-header">
                <span class="stat-title">Pending Complaints</span>
                <div class="stat-icon" style="background:#FEF3C7; color:#B45309;"><i data-lucide="clock"></i></div>
              </div>
              <b>${n('Pending')}</b>
              <div class="stat-sub">Requires triage</div>
            </div>

            <div class="card stat">
              <div class="stat-header">
                <span class="stat-title">In Progress</span>
                <div class="stat-icon" style="background:#EFF6FF; color:#1D4ED8;"><i data-lucide="wrench"></i></div>
              </div>
              <b>${n('In Progress')}</b>
              <div class="stat-sub">Assigned to staff</div>
            </div>

            <div class="card stat">
              <div class="stat-header">
                <span class="stat-title">Resolved</span>
                <div class="stat-icon" style="background:#ECFDF5; color:#047857;"><i data-lucide="check-circle-2"></i></div>
              </div>
              <b>${n('Resolved')}</b>
              <div class="stat-sub">Successfully closed</div>
            </div>
          </div>

          <!-- Recent Complaints & Visitors -->
          <div class="grid g2" style="margin-top:24px;">
            <div class="card">
              <h3>
                <span>Recent Resident Complaints</span>
                <a href="#complaints" class="btn ghost sm">View All</a>
              </h3>
              <div class="wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Resident</th>
                      <th>Issue</th>
                      <th>Status</th>
                      <th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${c.slice(0, 4).map(item => `
                      <tr>
                        <td>
                          <strong>${esc(item.name)}</strong>
                          <div class="mu" style="font-size:12px;">Flat ${esc(item.flat)}</div>
                        </td>
                        <td>
                          <strong>${esc(item.title)}</strong>
                          <div class="mu" style="font-size:12px;">${item.category}</div>
                        </td>
                        <td>${badge(item.status)}</td>
                        <td>
                          <button class="btn ghost sm" onclick="adminActions.quickStatusChange(${item.id})">Change</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="card">
              <h3>
                <span>Today's Expected Visitors</span>
                <a href="#visitors" class="btn ghost sm">Gate Log</a>
              </h3>
              ${visitors.length ? `
                <div class="wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Visitor</th>
                        <th>Host</th>
                        <th>Pass Code</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${visitors.slice(0, 4).map(v => `
                        <tr>
                          <td>
                            <strong>${esc(v.name)}</strong>
                            <div class="mu" style="font-size:12px;">${esc(v.purpose)}</div>
                          </td>
                          <td>Flat ${esc(v.flat)}</td>
                          <td><code>${esc(v.passCode || 'GATE-PASS')}</code></td>
                          <td>${badge(v.status || 'Expected', (v.status || '').toLowerCase())}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              ` : empty('No visitor entries recorded today.')}
            </div>
          </div>
        `;
      }
    },

    // 2. COMPLAINT MANAGEMENT (Core Workflow Step 4 & 5)
    complaints: {
      render() {
        return `
          <div class="row between" style="margin-bottom:16px;">
            <div>
              <h3 style="margin-bottom:4px;">Society Complaints & Maintenance Hub</h3>
              <p class="muted">Review, assign staff, and update resolution statuses in real time.</p>
            </div>
            <div class="tour-hint" style="max-width:340px;">
              <i data-lucide="zap"></i>
              <span><strong>Workflow Step 5:</strong> Update the Water Leakage complaint to "In Progress".</span>
            </div>
          </div>

          <div class="bar">
            <input id="q" placeholder="Search by resident, flat, title or category...">
            <select id="f">
              <option value="">All Statuses</option>
              ${STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
          </div>

          <div class="card wrap">
            <table>
              <thead>
                <tr>
                  <th>Resident & Flat</th>
                  <th>Complaint Description</th>
                  <th>Submitted Date</th>
                  <th>Status (Click to Change)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="tb-complaints"></tbody>
            </table>
          </div>
        `;
      },
      bind() {
        searchable('tb-complaints', (q, f) => {
          const list = DB.get('complaints') || [];
          const filtered = list.filter(c => {
            const matchStatus = !f || c.status === f;
            const matchQuery = (c.title + c.name + c.flat + c.category + c.description).toLowerCase().includes(q);
            return matchStatus && matchQuery;
          });

          if (!filtered.length) {
            return `<tr><td colspan="5">${empty('No complaints found matching criteria.')}</td></tr>`;
          }

          return filtered.map(c => `
            <tr id="complaint-row-${c.id}">
              <td>
                <strong>${esc(c.name)}</strong>
                <div class="mu" style="font-size:12px;">Flat ${esc(c.flat)}</div>
              </td>
              <td>
                <strong>${esc(c.title)}</strong>
                <div class="mu" style="font-size:12px;">${esc(c.description)}</div>
                <div style="font-size:11px; color:var(--p); margin-top:4px;">Category: ${esc(c.category)} · Priority: ${esc(c.priority || 'Medium')}</div>
              </td>
              <td>${c.date}</td>
              <td>
                <select class="complaint-status-select" data-id="${c.id}" style="width:130px; padding:6px 10px; font-weight:600;">
                  ${STATUSES.map(s => `<option value="${s}" ${s === c.status ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </td>
              <td>
                <button class="btn ghost sm" data-view="${c.id}">Details</button>
              </td>
            </tr>
          `).join('');
        });

        // Status Changer Listener
        $('#tb-complaints').onchange = e => {
          if (e.target.classList.contains('complaint-status-select')) {
            const complaintId = e.target.dataset.id;
            const newStatus = e.target.value;
            DB.update('complaints', complaintId, {
              status: newStatus,
              adminNotes: `Status changed to ${newStatus} by Priya Menon (Admin)`
            });
            toast(`Complaint #${complaintId} status updated to "${newStatus}"!`);

            // Check if this corresponds to workflow tour step 5
            if (window.Tour && Tour.getState().step === 5) {
              Tour.next();
            }
          }
        };

        // Details Modal
        $('#tb-complaints').onclick = e => {
          const btn = e.target.closest('[data-view]');
          if (!btn) return;
          const complaintId = btn.dataset.view;
          const c = (DB.get('complaints') || []).find(x => String(x.id) === String(complaintId));
          if (c) {
            modal(`
              <h3>Complaint Details #${c.id}</h3>
              <dl style="margin-top:16px;">
                <dt>Resident</dt><dd><strong>${esc(c.name)}</strong> (Flat ${esc(c.flat)})</dd>
                <dt>Category</dt><dd>${esc(c.category)}</dd>
                <dt>Title</dt><dd><strong>${esc(c.title)}</strong></dd>
                <dt>Description</dt><dd>${esc(c.description)}</dd>
                <dt>Submitted Date</dt><dd>${c.date}</dd>
                <dt>Current Status</dt><dd>${badge(c.status)}</dd>
                <dt>Assigned Staff</dt><dd>${esc(c.assignedTo || 'Unassigned / Society Office')}</dd>
                <dt>Admin Remarks</dt><dd>${esc(c.adminNotes || 'None logged.')}</dd>
              </dl>
              <div style="margin-top:20px; display:flex; gap:10px; justify-content:flex-end;">
                <button class="btn sm" onclick="adminActions.quickAssign(${c.id})">Assign Staff</button>
              </div>
            `);
          }
        };
      }
    },

    // 3. RESIDENT DIRECTORY
    residents: {
      render() {
        return `
          <div class="row between" style="margin-bottom:16px;">
            <div>
              <h3 style="margin-bottom:4px;">Resident Directory (120 Units)</h3>
              <p class="muted">Contact details, occupancy type, and maintenance records.</p>
            </div>
            <button class="btn" id="btn-add-resident"><i data-lucide="user-plus"></i> Add Resident</button>
          </div>

          <div class="bar">
            <input id="q" placeholder="Search by resident name, flat number or phone...">
          </div>

          <div class="card wrap">
            <table>
              <thead>
                <tr>
                  <th>Resident Name</th>
                  <th>Flat No.</th>
                  <th>Contact Details</th>
                  <th>Occupancy</th>
                  <th>Maintenance Dues</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="tb-residents"></tbody>
            </table>
          </div>
        `;
      },
      bind() {
        $('#btn-add-resident').onclick = () => {
          modal(`
            <h3>Register New Resident</h3>
            <form id="form-new-resident">
              <label>Full Name</label>
              <input id="res-name" required placeholder="e.g. Ramesh Kulkarni">
              <div class="row">
                <div style="flex:1;">
                  <label>Flat Number</label>
                  <input id="res-flat" required placeholder="e.g. B-102">
                </div>
                <div style="flex:1;">
                  <label>Occupancy Type</label>
                  <select id="res-type">
                    <option value="Owner">Owner</option>
                    <option value="Tenant">Tenant</option>
                  </select>
                </div>
              </div>
              <label>Mobile Number</label>
              <input id="res-phone" required placeholder="+91 98XXX XXXXX">
              <label>Email Address</label>
              <input id="res-email" type="email" required placeholder="resident@email.com">
              <div style="margin-top:20px; text-align:right;">
                <button type="submit" class="btn"><i data-lucide="check"></i> Save Resident</button>
              </div>
            </form>
          `);

          const form = document.getElementById('form-new-resident');
          if (form) {
            form.onsubmit = e => {
              e.preventDefault();
              DB.add('residents', {
                name: $('#res-name').value.trim(),
                flat: $('#res-flat').value.trim(),
                type: $('#res-type').value,
                phone: $('#res-phone').value.trim(),
                email: $('#res-email').value.trim(),
                dues: 'Paid'
              });
              document.getElementById('modal-close-btn').click();
              toast('Resident added to directory');
              rerender();
            };
          }
        };

        searchable('tb-residents', q => {
          const list = DB.get('residents') || [];
          const filtered = list.filter(r => (r.name + r.flat + r.phone + r.email).toLowerCase().includes(q));

          if (!filtered.length) {
            return `<tr><td colspan="6">${empty('No residents found.')}</td></tr>`;
          }

          return filtered.map(r => `
            <tr>
              <td><strong>${esc(r.name)}</strong></td>
              <td><span style="font-weight:700; color:var(--p);">Flat ${esc(r.flat)}</span></td>
              <td>
                <div>${esc(r.phone)}</div>
                <div class="mu" style="font-size:12px;">${esc(r.email)}</div>
              </td>
              <td><span class="badge ${r.type === 'Owner' ? 'premium' : 'basic'}">${esc(r.type || 'Owner')}</span></td>
              <td><span class="badge resolved">${esc(r.dues || 'Paid')}</span></td>
              <td>
                <button class="btn ghost sm" onclick="toast('Direct SMS broadcast simulated')"><i data-lucide="mail"></i> Message</button>
              </td>
            </tr>
          `).join('');
        });
      }
    },

    // 4. VISITOR GATE LOG
    visitors: {
      render() {
        return `
          <div class="row between" style="margin-bottom:16px;">
            <div>
              <h3 style="margin-bottom:4px;">Security Gate & Visitor Log</h3>
              <p class="muted">Real-time gate passes and entry logs authorized by residents.</p>
            </div>
            <button class="btn ghost sm" onclick="toast('Gate security pass verification active')"><i data-lucide="shield"></i> Guard Desk Sync</button>
          </div>

          <div class="bar">
            <input id="q" placeholder="Search visitor name, host flat or pass code...">
          </div>

          <div class="card wrap">
            <table>
              <thead>
                <tr>
                  <th>Visitor Name</th>
                  <th>Purpose</th>
                  <th>Visiting Resident</th>
                  <th>Pass Code</th>
                  <th>Expected Date</th>
                  <th>Gate Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="tb-visitors"></tbody>
            </table>
          </div>
        `;
      },
      bind() {
        searchable('tb-visitors', q => {
          const list = DB.get('visitors') || [];
          const filtered = list.filter(v => (v.name + v.resident + v.flat + v.purpose + (v.passCode || '')).toLowerCase().includes(q));

          if (!filtered.length) {
            return `<tr><td colspan="7">${empty('No visitor entries recorded.')}</td></tr>`;
          }

          return filtered.map(v => `
            <tr>
              <td>
                <strong>${esc(v.name)}</strong>
                <div class="mu" style="font-size:12px;">${esc(v.phone || '+91 98XXX XXXXX')}</div>
              </td>
              <td>${esc(v.purpose)}</td>
              <td>
                <strong>Flat ${esc(v.flat)}</strong>
                <div class="mu" style="font-size:12px;">${esc(v.resident)}</div>
              </td>
              <td><code>${esc(v.passCode || 'PASS-9900')}</code></td>
              <td>${v.date}</td>
              <td>${badge(v.status || 'Expected', (v.status || '').toLowerCase())}</td>
              <td>
                <button class="btn ghost sm" onclick="adminActions.checkInVisitor(${v.id})">Check In</button>
              </td>
            </tr>
          `).join('');
        });
      }
    },

    // 5. SOCIETY NOTICES
    notices: {
      render() {
        return `
          <div class="grid g2">
            <!-- Publish Form -->
            <div class="card">
              <h3>Publish Official Circular</h3>
              <form id="form-notice">
                <label>Notice Headline</label>
                <input id="not-title" required placeholder="e.g. Generator Maintenance & Power Outage">

                <div class="row">
                  <div style="flex:1;">
                    <label>Category</label>
                    <select id="not-cat">
                      <option value="Maintenance">Maintenance</option>
                      <option value="General">General Circular</option>
                      <option value="Event">Community Event</option>
                      <option value="Urgent">Emergency Alert</option>
                    </select>
                  </div>
                  <div style="flex:1;">
                    <label>Urgency Level</label>
                    <select id="not-urgency">
                      <option value="Important">Important</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Normal">Normal</option>
                    </select>
                  </div>
                </div>

                <label>Notice Content</label>
                <textarea id="not-desc" rows="5" required placeholder="Detail the full announcement for society residents..."></textarea>

                <button type="submit" class="btn"><i data-lucide="megaphone"></i> Broadcast Notice</button>
              </form>
            </div>

            <!-- Published List -->
            <div class="card">
              <h3>Active Circulars & Broadcasts</h3>
              <div id="notice-list"></div>
            </div>
          </div>
        `;
      },
      bind() {
        const drawNotices = () => {
          const list = DB.get('notices') || [];
          const container = $('#notice-list');
          if (!container) return;

          container.innerHTML = list.length ? list.map(n => `
            <div class="item row between">
              <div style="max-width:85%;">
                <div class="row" style="gap:8px; margin-bottom:4px;">
                  <span class="badge ${n.urgency === 'Urgent' ? 'expired' : 'basic'}">${esc(n.urgency || 'General')}</span>
                  <span class="mu" style="font-size:12px;">${n.date}</span>
                </div>
                <strong>${esc(n.title)}</strong>
                <p style="color:var(--mu); font-size:13px; margin-top:4px;">${esc(n.description)}</p>
              </div>
              <button class="btn danger sm" data-del-notice="${n.id}"><i data-lucide="trash-2"></i></button>
            </div>
          `).join('') : empty('No notices published.');
          if (window.lucide) lucide.createIcons();
        };

        drawNotices();

        $('#form-notice').onsubmit = e => {
          e.preventDefault();
          DB.add('notices', {
            title: $('#not-title').value.trim(),
            category: $('#not-cat').value,
            urgency: $('#not-urgency').value,
            description: $('#not-desc').value.trim(),
            date: DB.day(0)
          });
          e.target.reset();
          toast('Official circular broadcast to all residents');
          drawNotices();
        };

        $('#notice-list').onclick = e => {
          const btn = e.target.closest('[data-del-notice]');
          if (btn) {
            DB.remove('notices', btn.dataset.delNotice);
            toast('Notice deleted');
            drawNotices();
          }
        };
      }
    },

    // 6. COMMUNITY MANAGEMENT
    community: {
      render() {
        const posts = DB.get('posts') || [];
        return `
          <div class="row between" style="margin-bottom:16px;">
            <div>
              <h3 style="margin-bottom:4px;">Resident Community Moderation</h3>
              <p class="muted">Monitor neighborhood discussions, buy/sell posts, and club initiatives.</p>
            </div>
          </div>

          <div class="card">
            ${posts.length ? posts.map(p => `
              <div class="item row between">
                <div style="max-width:80%;">
                  <strong>${esc(p.author)}</strong> <span class="mu">· Flat ${esc(p.flat)} · ${p.date}</span>
                  <p style="color:var(--tx); margin-top:6px; font-size:14px;">${esc(p.text)}</p>
                  <div class="mu" style="font-size:12px; margin-top:6px;">
                    <i data-lucide="thumbs-up" style="width:14px;"></i> ${p.likes || 0} likes · <i data-lucide="message-circle" style="width:14px;"></i> ${p.comments || 0} comments
                  </div>
                </div>
                <div class="row">
                  <button class="btn ghost sm" onclick="toast('Post pinned to top')">Pin</button>
                  <button class="btn danger sm" onclick="DB.remove('posts', ${p.id}); toast('Post removed'); rerender();">Remove</button>
                </div>
              </div>
            `).join('') : empty('No community posts.')}
          </div>
        `;
      }
    },

    // 7. SUBSCRIPTION MANAGEMENT & PLAN UPGRADE INTERFACE (Key Business Layer)
    subscription: {
      render() {
        const s = DB.get('settings') || {};
        const currentPlan = s.currentPlan || 'Basic';
        const { basic, premium, enterprise } = DB.PLANS;

        return `
          <!-- Subscription Overview Banner -->
          <div class="card" style="margin-bottom:24px; background:linear-gradient(135deg, #FAF8FF, #F3EFFF); border:1px solid #D8CEF8;">
            <div class="row between">
              <div>
                <span class="badge ${currentPlan.toLowerCase()}" style="font-size:13px; padding:6px 14px; margin-bottom:8px;">
                  Current Plan: ${esc(currentPlan)}
                </span>
                <h2 style="font-size:24px; margin:6px 0;">Greenview Residency AptEase Subscription</h2>
                <p class="muted">
                  Billed to Society Managing Committee · Renews automatically on <strong>${s.renewalDate || '2026-12-15'}</strong>
                </p>
              </div>
              <div style="text-align:right;">
                <div style="font-size:32px; font-weight:800; color:var(--p);">
                  ${currentPlan === 'Premium' ? '₹2,499' : '₹999'} <span style="font-size:14px; font-weight:500; color:var(--mu);">/ month</span>
                </div>
                <span class="badge active">Auto-Pay Active</span>
              </div>
            </div>
          </div>

          <div style="text-align:center; max-width:680px; margin:0 auto 24px;">
            <h3>Compare & Upgrade Your Society Plan</h3>
            <p class="muted">Unlock advanced gate security, community forums, and prioritized resolution SLAs for all 120 flats.</p>
          </div>

          <!-- Plan Comparison Cards Grid -->
          <div class="plan-grid">
            <!-- Basic Plan Card -->
            <div class="plan-card ${currentPlan === 'Basic' ? 'featured' : ''}">
              ${currentPlan === 'Basic' ? '<div class="plan-ribbon">Current Plan</div>' : ''}
              <div class="plan-header">
                <h4>${basic.name}</h4>
                <div class="plan-price">${formatINR(basic.price)} <span>/ month</span></div>
                <p class="muted" style="font-size:13px;">${basic.tagline}</p>
              </div>
              <ul class="plan-features">
                ${basic.features.map(f => `<li><i data-lucide="check"></i> <span>${f}</span></li>`).join('')}
                ${basic.lockedFeatures.map(f => `<li class="locked"><i data-lucide="x"></i> <span>${f}</span></li>`).join('')}
              </ul>
              <button class="btn ghost" disabled style="margin-top:auto;">
                ${currentPlan === 'Basic' ? 'Currently Subscribed' : 'Downgrade to Basic'}
              </button>
            </div>

            <!-- Premium Plan Card -->
            <div class="plan-card ${currentPlan === 'Premium' ? 'featured' : ''}">
              ${currentPlan === 'Premium' ? '<div class="plan-ribbon">Current Plan</div>' : '<div class="plan-ribbon" style="background:#10B981;">Recommended Upgrade</div>'}
              <div class="plan-header">
                <h4>${premium.name}</h4>
                <div class="plan-price" style="color:var(--p);">${formatINR(premium.price)} <span>/ month</span></div>
                <p class="muted" style="font-size:13px;">${premium.tagline}</p>
              </div>
              <ul class="plan-features">
                ${premium.features.map(f => `<li><i data-lucide="check"></i> <strong>${f}</strong></li>`).join('')}
              </ul>
              ${currentPlan === 'Premium' ? `
                <button class="btn success" disabled style="margin-top:auto;"><i data-lucide="check"></i> Subscribed to Premium</button>
              ` : `
                <button class="btn" id="btn-upgrade-premium" style="margin-top:auto;">
                  <i data-lucide="sparkles"></i> Upgrade to Premium Now
                </button>
              `}
            </div>

            <!-- Enterprise Plan Card -->
            <div class="plan-card">
              <div class="plan-header">
                <h4>${enterprise.name}</h4>
                <div class="plan-price">${formatINR(enterprise.price)} <span>/ month</span></div>
                <p class="muted" style="font-size:13px;">${enterprise.tagline}</p>
              </div>
              <ul class="plan-features">
                ${enterprise.features.map(f => `<li><i data-lucide="check"></i> <span>${f}</span></li>`).join('')}
              </ul>
              <button class="btn ghost" onclick="alert('Enterprise tier consultation requested. An AptEase account manager will call you within 2 business hours.');" style="margin-top:auto;">
                Contact Enterprise Sales
              </button>
            </div>
          </div>

          <!-- Society Billing History Table -->
          <div class="card wrap" style="margin-top:32px;">
            <h3>Society Billing & Invoicing History</h3>
            <table>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Plan Tier</th>
                  <th>Amount</th>
                  <th>Billing Date</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>INV-2026-9041</code></td>
                  <td>${badge(currentPlan, currentPlan.toLowerCase())}</td>
                  <td><strong>${currentPlan === 'Premium' ? '₹2,499' : '₹999'}</strong></td>
                  <td>${DB.day(12)}</td>
                  <td>UPI Auto-Debit</td>
                  <td><span class="badge resolved">Paid</span></td>
                </tr>
                <tr>
                  <td><code>INV-2026-8812</code></td>
                  <td><span class="badge basic">Basic</span></td>
                  <td><strong>₹999</strong></td>
                  <td>${DB.day(42)}</td>
                  <td>UPI Auto-Debit</td>
                  <td><span class="badge resolved">Paid</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      },
      bind() {
        const upgradeBtn = $('#btn-upgrade-premium');
        if (upgradeBtn) {
          upgradeBtn.onclick = () => {
            if (confirm('Upgrade Greenview Residency to Premium Plan (₹2,499/month)? This will instantly unlock all advanced features and reflect in AptEase SaaS recurring revenue.')) {
              DB.changeSocietyPlan(1, 'Premium');
              toast('🎉 Upgraded to Premium Plan! AptEase platform MRR has been updated dynamically.');
              rerender();
            }
          };
        }
      }
    },

    // 8. SETTINGS
    settings: {
      render() {
        const s = DB.get('settings') || {};
        return `
          <form id="form-settings" class="grid g2">
            <div class="card">
              <h3>Society Information</h3>
              <label>Society Name</label>
              <input id="set-soc" value="${esc(s.society)}" required>
              <label>Society Address</label>
              <input id="set-addr" value="${esc(s.address)}" required>
              <label>Total Units / Flats</label>
              <input id="set-units" value="${esc(s.units)}" required>
            </div>

            <div class="card">
              <h3>Society Administrator Details</h3>
              <label>Administrator Name</label>
              <input id="set-admin" value="${esc(s.adminName)}" required>
              <label>Office Email</label>
              <input id="set-email" value="${esc(s.adminEmail)}" required>
              <label>Contact Phone</label>
              <input id="set-phone" value="${esc(s.adminPhone)}" required>
            </div>

            <div class="row" style="grid-column: 1 / -1; margin-top:10px;">
              <button type="submit" class="btn"><i data-lucide="save"></i> Save Society Settings</button>
              <button type="button" class="btn danger" onclick="Tour.resetWorkflow()">Reset All Demo Data</button>
            </div>
          </form>
        `;
      },
      bind() {
        $('#form-settings').onsubmit = e => {
          e.preventDefault();
          const curSettings = DB.get('settings') || {};
          const updated = {
            ...curSettings,
            society: $('#set-soc').value,
            address: $('#set-addr').value,
            units: $('#set-units').value,
            adminName: $('#set-admin').value,
            adminEmail: $('#set-email').value,
            adminPhone: $('#set-phone').value
          };
          DB.syncSocietySettings(updated);
          toast('Society settings updated and synced with AptEase platform.');
        };
      }
    }
  }
});

// Admin Global Actions Helper
window.adminActions = {
  quickStatusChange(complaintId) {
    const c = (DB.get('complaints') || []).find(x => String(x.id) === String(complaintId));
    if (!c) return;

    modal(`
      <h3>Update Complaint Status #${c.id}</h3>
      <p class="muted">${esc(c.title)} (Flat ${esc(c.flat)})</p>
      <form id="form-quick-status">
        <label>Select Status</label>
        <select id="quick-status-val">
          ${STATUSES.map(s => `<option value="${s}" ${s === c.status ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
        <label>Admin Remarks / Staff Assignment</label>
        <input id="quick-status-notes" value="${esc(c.adminNotes || '')}" placeholder="e.g. Ramesh the plumber dispatched">
        <div style="margin-top:20px; text-align:right;">
          <button type="submit" class="btn">Update Status</button>
        </div>
      </form>
    `);

    const form = document.getElementById('form-quick-status');
    if (form) {
      form.onsubmit = e => {
        e.preventDefault();
        const newStatus = $('#quick-status-val').value;
        const notes = $('#quick-status-notes').value;
        DB.update('complaints', c.id, {
          status: newStatus,
          adminNotes: notes
        });
        document.getElementById('modal-close-btn').click();
        toast(`Status changed to "${newStatus}"`);
        if (window.rerender) window.rerender();

        if (window.Tour && Tour.getState().step === 5) {
          Tour.next();
        }
      };
    }
  },

  quickAssign(complaintId) {
    const staff = prompt('Assign maintenance staff member (e.g. Ramesh Electrician / Suresh Plumber):', 'Ramesh Plumber');
    if (staff) {
      DB.update('complaints', complaintId, { assignedTo: staff, status: 'In Progress' });
      document.getElementById('modal-close-btn').click();
      toast(`Assigned to ${staff} and marked In Progress.`);
      if (window.rerender) window.rerender();
    }
  },

  checkInVisitor(visitorId) {
    DB.update('visitors', visitorId, { status: 'Checked In' });
    toast('Visitor marked Checked In at Main Security Gate');
    if (window.rerender) window.rerender();
  }
};
