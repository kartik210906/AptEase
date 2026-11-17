// AptEase - Super Admin SaaS Executive & Revenue Console
// Pure Vanilla JavaScript, Dynamic MRR/ARR Engine & Subscription Operations

boot({
  role: 'superadmin',
  user: { name: 'AptEase HQ', sub: 'SaaS Platform Executive' },
  nav: [
    ['dashboard', 'Revenue Analytics', 'bar-chart-3'],
    ['societies', 'Society Directory', 'building-2'],
    ['subscriptions', 'Subscription Management', 'credit-card'],
    ['payments', 'Payment Records', 'receipt'],
    ['pricing', 'SaaS Pricing Tiers', 'layers']
  ],
  views: {
    // 1. REVENUE ANALYTICS & EXECUTIVE DASHBOARD
    dashboard: {
      render() {
        const rev = DB.calcRevenue();
        const societies = DB.get('societies') || [];
        const upcomingRenewals = societies.filter(s => s.status === 'Active').slice(0, 4);

        return `
          <!-- Prototype Disclaimer Banner -->
          <div class="demo-disclaimer-banner">
            <i data-lucide="info"></i>
            <div>
              <strong>Commercial SaaS Prototype Demonstration:</strong> All MRR, ARR, and society metrics are calculated dynamically from localStorage subscription state.
            </div>
          </div>

          <!-- Top Executive KPI Grid -->
          <div class="grid g4">
            <!-- MRR KPI -->
            <div class="card stat hl">
              <div class="stat-header">
                <span class="stat-title">Monthly Recurring Revenue</span>
                <div class="stat-icon"><i data-lucide="trending-up"></i></div>
              </div>
              <b id="kpi-mrr">${formatINR(rev.mrr)}</b>
              <div class="stat-sub">
                <span class="trend-up">+14.2%</span> from last month (Dynamic)
              </div>
            </div>

            <!-- ARR KPI -->
            <div class="card stat">
              <div class="stat-header">
                <span class="stat-title">Annual Recurring Revenue</span>
                <div class="stat-icon"><i data-lucide="calendar"></i></div>
              </div>
              <b id="kpi-arr">${formatINR(rev.arr)}</b>
              <div class="stat-sub">
                Formula: <span style="font-weight:600; color:var(--p);">MRR × 12</span>
              </div>
            </div>

            <!-- Active Subscriptions -->
            <div class="card stat">
              <div class="stat-header">
                <span class="stat-title">Active Subscriptions</span>
                <div class="stat-icon"><i data-lucide="check-circle-2"></i></div>
              </div>
              <b id="kpi-active">${rev.activeCount}</b>
              <div class="stat-sub">
                Across <span style="font-weight:600;">${rev.totalSocieties}</span> registered societies
              </div>
            </div>

            <!-- Expired / Suspended -->
            <div class="card stat">
              <div class="stat-header">
                <span class="stat-title">Inactive / Expired</span>
                <div class="stat-icon" style="background:#FEE2E2; color:#DC2626;"><i data-lucide="alert-triangle"></i></div>
              </div>
              <b id="kpi-expired">${rev.expiredCount + rev.suspendedCount}</b>
              <div class="stat-sub">
                <span>${rev.expiredCount} Expired</span> · <span>${rev.suspendedCount} Suspended</span>
              </div>
            </div>
          </div>

          <!-- Secondary Analytics Row: Charts -->
          <div class="grid g2" style="margin-top:24px;">
            <!-- MRR Growth Trend Chart -->
            <div class="card">
              <h3>
                <span>Monthly Recurring Revenue Trend</span>
                <span class="badge active" style="font-size:11px;">Calculated Live</span>
              </h3>
              <p class="muted" style="margin-bottom:16px; font-size:13px;">Historical subscription trajectory leading up to current dynamic MRR.</p>
              <div id="chart-revenue-trend" style="min-height:220px;"></div>
            </div>

            <!-- Plan Distribution Donut Chart -->
            <div class="card">
              <h3>
                <span>Subscription Plan Distribution</span>
                <span class="badge premium" style="font-size:11px;">Active Tiers</span>
              </h3>
              <p class="muted" style="margin-bottom:16px; font-size:13px;">Active societies grouped by Basic (₹999), Premium (₹2,499), & Enterprise.</p>
              <div id="chart-plan-distribution"></div>
              <div id="chart-revenue-mix"></div>
            </div>
          </div>

          <!-- Upcoming Renewals & Recent Registrations Table -->
          <div class="grid g2" style="margin-top:24px;">
            <div class="card">
              <h3>
                <span>Upcoming Subscription Renewals</span>
                <i data-lucide="bell" style="color:var(--p); width:16px;"></i>
              </h3>
              <div class="wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Society</th>
                      <th>Plan</th>
                      <th>Amount</th>
                      <th>Renewal Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${upcomingRenewals.map(s => `
                      <tr>
                        <td>
                          <strong>${esc(s.name)}</strong>
                          <div class="mu" style="font-size:12px;">${esc(s.city)} · ${s.units} flats</div>
                        </td>
                        <td>${badge(s.plan, s.plan.toLowerCase())}</td>
                        <td><strong>${formatINR(s.monthlyPrice)}</strong>/mo</td>
                        <td><span style="color:#2563EB; font-weight:600;">${s.renewalDate}</span></td>
                        <td>
                          <button class="btn ghost sm" onclick="superadminActions.openSocietyModal('${s.id}')">Manage</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="card">
              <h3>
                <span>Quick Actions & SaaS Controls</span>
                <i data-lucide="command" style="color:var(--p); width:16px;"></i>
              </h3>
              <p class="muted" style="margin-bottom:18px;">Demonstrate SaaS business management workflows with one click.</p>
              <div style="display:flex; flex-direction:column; gap:12px;">
                <button class="btn" onclick="superadminActions.openNewSocietyModal()">
                  <i data-lucide="plus-circle"></i> Register New Apartment Society (Add MRR)
                </button>
                <button class="btn ghost" onclick="location.hash='#subscriptions'">
                  <i data-lucide="sliders"></i> Adjust Subscription Tiers & Pricing
                </button>
                <button class="btn ghost" onclick="location.hash='#payments'">
                  <i data-lucide="receipt"></i> View Simulated Invoices & Billing Log
                </button>
                <button class="btn danger" onclick="Tour.resetWorkflow()">
                  <i data-lucide="rotate-ccw"></i> Reset All Demo Data to Seed State
                </button>
              </div>
            </div>
          </div>
        `;
      },
      bind() {
        Charts.renderRevenueTrend('chart-revenue-trend');
        Charts.renderPlanDistribution('chart-plan-distribution');
        Charts.renderRevenueMix('chart-revenue-mix');
      }
    },

    // 2. SOCIETY DIRECTORY & REGISTRATION
    societies: {
      render() {
        return `
          <div class="row between" style="margin-bottom:20px;">
            <div>
              <h3 style="margin-bottom:4px;">Apartment Societies Directory</h3>
              <p class="muted">Manage all client societies subscribing to AptEase.</p>
            </div>
            <button class="btn" id="btn-add-society">
              <i data-lucide="plus-circle"></i> Register New Society
            </button>
          </div>

          <div class="bar">
            <input id="q" placeholder="Search by society name, city or admin...">
            <select id="f">
              <option value="">All Subscription Statuses</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div class="card wrap">
            <table>
              <thead>
                <tr>
                  <th>Society & Location</th>
                  <th>Units</th>
                  <th>Administrator</th>
                  <th>Plan Tier</th>
                  <th>Monthly Fee</th>
                  <th>Status</th>
                  <th>Renewal</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="tb-societies"></tbody>
            </table>
          </div>
        `;
      },
      bind() {
        $('#btn-add-society').onclick = () => superadminActions.openNewSocietyModal();

        searchable('tb-societies', (q, f) => {
          const list = DB.get('societies') || [];
          const filtered = list.filter(s => {
            const matchStatus = !f || s.status === f;
            const matchQuery = (s.name + s.city + s.adminName + s.plan).toLowerCase().includes(q);
            return matchStatus && matchQuery;
          });

          if (!filtered.length) {
            return `<tr><td colspan="8">${empty('No societies found matching criteria.')}</td></tr>`;
          }

          return filtered.map(s => `
            <tr>
              <td>
                <strong>${esc(s.name)}</strong>
                <div class="mu" style="font-size:12px;">${esc(s.address || s.city)}</div>
              </td>
              <td>${s.units} units</td>
              <td>
                <div>${esc(s.adminName)}</div>
                <div class="mu" style="font-size:12px;">${esc(s.adminEmail)}</div>
              </td>
              <td>${badge(s.plan, s.plan.toLowerCase())}</td>
              <td><strong>${formatINR(s.monthlyPrice)}</strong>/mo</td>
              <td>${badge(s.status, s.status.toLowerCase())}</td>
              <td>${s.renewalDate || '—'}</td>
              <td>
                <div class="row" style="gap:6px;">
                  <button class="btn ghost sm" data-edit="${s.id}">Manage</button>
                </div>
              </td>
            </tr>
          `).join('');
        });

        $('#tb-societies').onclick = e => {
          const btn = e.target.closest('[data-edit]');
          if (btn) superadminActions.openSocietyModal(btn.dataset.edit);
        };
      }
    },

    // 3. SUBSCRIPTION MANAGEMENT & PLAN SWITCHING
    subscriptions: {
      render() {
        const rev = DB.calcRevenue();
        return `
          <div class="demo-disclaimer-banner">
            <i data-lucide="sliders"></i>
            <div>
              <strong>Real-Time Dynamic MRR Impact:</strong> Upgrading, downgrading, activating, or suspending any society directly recalculates AptEase's recurring revenue.
            </div>
          </div>

          <div class="grid g3" style="margin-bottom:24px;">
            <div class="card stat">
              <span class="stat-title">Current Platform MRR</span>
              <b>${formatINR(rev.mrr)}</b>
              <div class="stat-sub">From ${rev.activeCount} active paying subscriptions</div>
            </div>
            <div class="card stat">
              <span class="stat-title">Current Platform ARR</span>
              <b>${formatINR(rev.arr)}</b>
              <div class="stat-sub">Annualized run rate</div>
            </div>
            <div class="card stat">
              <span class="stat-title">Basic vs Premium Revenue</span>
              <b>${formatINR(rev.planBreakdown.premium.revenue)} <span style="font-size:16px; font-weight:500; color:var(--mu);">vs ${formatINR(rev.planBreakdown.basic.revenue)}</span></b>
              <div class="stat-sub">Premium generates ${(rev.planBreakdown.premium.revenue / (rev.mrr || 1) * 100).toFixed(0)}% of MRR</div>
            </div>
          </div>

          <div class="card wrap">
            <div class="row between" style="margin-bottom:16px;">
              <h3>Live Subscriptions & Tier Controls</h3>
              <span class="mu" style="font-size:13px;">Changes save instantly to localStorage</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Society Name</th>
                  <th>Current Plan</th>
                  <th>Monthly Price</th>
                  <th>Status Control</th>
                  <th>Quick Tier Switch</th>
                  <th>Renewal Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="tb-subscriptions"></tbody>
            </table>
          </div>
        `;
      },
      bind() {
        const drawSubs = () => {
          const list = DB.get('societies') || [];
          const tbody = $('#tb-subscriptions');
          if (!tbody) return;

          tbody.innerHTML = list.map(s => `
            <tr>
              <td>
                <strong>${esc(s.name)}</strong>
                <div class="mu" style="font-size:12px;">${esc(s.city)} · ${s.units} units</div>
              </td>
              <td>${badge(s.plan, s.plan.toLowerCase())}</td>
              <td><strong>${formatINR(s.monthlyPrice)}</strong>/mo</td>
              <td>
                <select class="status-select" data-id="${s.id}" style="width:130px; padding:6px 10px; font-size:12px;">
                  <option value="Active" ${s.status === 'Active' ? 'selected' : ''}>Active</option>
                  <option value="Suspended" ${s.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
                  <option value="Expired" ${s.status === 'Expired' ? 'selected' : ''}>Expired</option>
                  <option value="Demo" ${s.status === 'Demo' ? 'selected' : ''}>Demo Mode</option>
                </select>
              </td>
              <td>
                <select class="plan-select" data-id="${s.id}" style="width:140px; padding:6px 10px; font-size:12px;">
                  <option value="Basic" ${s.plan === 'Basic' ? 'selected' : ''}>Basic (₹999)</option>
                  <option value="Premium" ${s.plan === 'Premium' ? 'selected' : ''}>Premium (₹2,499)</option>
                  <option value="Enterprise" ${s.plan === 'Enterprise' ? 'selected' : ''}>Enterprise (₹5,999)</option>
                </select>
              </td>
              <td>${s.renewalDate || '—'}</td>
              <td>
                <button class="btn ghost sm" data-view="${s.id}">Details</button>
              </td>
            </tr>
          `).join('');
          if (window.lucide) lucide.createIcons();
        };

        drawSubs();

        // Handle Status Change
        $('#tb-subscriptions').onchange = e => {
          if (e.target.classList.contains('status-select')) {
            const id = e.target.dataset.id;
            const newStatus = e.target.value;
            DB.update('societies', id, { status: newStatus });
            if (id === '1') {
              const settings = DB.get('settings') || {};
              settings.subscriptionStatus = newStatus;
              DB.set('settings', settings);
            }
            toast(`Subscription for society updated to "${newStatus}". MRR recalculated!`);
            rerender();
          }

          if (e.target.classList.contains('plan-select')) {
            const id = e.target.dataset.id;
            const newPlan = e.target.value;
            DB.changeSocietyPlan(id, newPlan);
            toast(`Society upgraded/switched to "${newPlan}". MRR updated!`);
            rerender();
          }
        };

        $('#tb-subscriptions').onclick = e => {
          const btn = e.target.closest('[data-view]');
          if (btn) superadminActions.openSocietyModal(btn.dataset.view);
        };
      }
    },

    // 4. SIMULATED PAYMENT RECORDS & BILLING HISTORY
    payments: {
      render() {
        const payments = DB.get('payments') || [];
        const totalCollected = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        return `
          <div class="demo-disclaimer-banner">
            <i data-lucide="receipt"></i>
            <div>
              <strong>Prototype Simulation:</strong> Payment records reflect simulated monthly recurring billing cycles and subscription activation receipts.
            </div>
          </div>

          <div class="grid g3" style="margin-bottom:20px;">
            <div class="card stat">
              <span class="stat-title">Total Billings Simulated</span>
              <b>${formatINR(totalCollected)}</b>
              <div class="stat-sub">Across ${payments.length} transactions</div>
            </div>
            <div class="card stat">
              <span class="stat-title">Collection Success Rate</span>
              <b>99.2%</b>
              <div class="stat-sub">Auto-debit recurring success</div>
            </div>
            <div class="card stat">
              <span class="stat-title">Next Scheduled Billing Tranche</span>
              <b>1st of Next Month</b>
              <div class="stat-sub">Auto-invoicing cycle</div>
            </div>
          </div>

          <div class="card wrap">
            <div class="row between" style="margin-bottom:16px;">
              <h3>Simulated Subscription Invoices & Receipts</h3>
              <button class="btn ghost sm" id="btn-manual-invoice">
                <i data-lucide="plus"></i> Record Simulated Invoice
              </button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Society Name</th>
                  <th>Subscription Plan</th>
                  <th>Amount</th>
                  <th>Billing Date</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody id="tb-payments"></tbody>
            </table>
          </div>
        `;
      },
      bind() {
        const drawPayments = () => {
          const payments = DB.get('payments') || [];
          const tbody = $('#tb-payments');
          if (!tbody) return;

          tbody.innerHTML = payments.map(p => `
            <tr>
              <td><code>${esc(p.id)}</code></td>
              <td><strong>${esc(p.societyName)}</strong></td>
              <td>${badge(p.plan, (p.plan || '').toLowerCase())}</td>
              <td><strong>${formatINR(p.amount)}</strong></td>
              <td>${p.date}</td>
              <td>${esc(p.method || 'Auto-Debit')}</td>
              <td>${badge(p.status, p.status === 'Paid' ? 'resolved' : 'pending')}</td>
              <td>
                <button class="btn ghost sm" data-inv="${p.id}">View Receipt</button>
              </td>
            </tr>
          `).join('');
          if (window.lucide) lucide.createIcons();
        };

        drawPayments();

        $('#btn-manual-invoice').onclick = () => {
          const newInv = DB.add('payments', {
            id: 'INV-' + (202600 + Math.floor(Math.random() * 9000)),
            societyId: 1,
            societyName: 'Greenview Residency',
            plan: 'Basic',
            amount: 999,
            date: DB.day(0),
            method: 'Simulated Auto-Pay',
            status: 'Paid',
            notes: 'Manual renewal record simulated'
          });
          toast(`Invoice ${newInv.id} created successfully.`);
          drawPayments();
        };

        $('#tb-payments').onclick = e => {
          const btn = e.target.closest('[data-inv]');
          if (!btn) return;
          const invId = btn.dataset.inv;
          const inv = (DB.get('payments') || []).find(p => p.id === invId);
          if (inv) {
            modal(`
              <div style="text-align:center; padding-bottom:14px; border-bottom:1px solid var(--ln);">
                <div class="logo" style="margin:0 auto 10px;">A</div>
                <h3>AptEase SaaS Invoice Receipt</h3>
                <p class="muted">B2B Apartment Management Platform Subscription</p>
              </div>
              <dl style="margin-top:16px;">
                <dt>Invoice Number</dt><dd><code>${esc(inv.id)}</code></dd>
                <dt>Billed Society</dt><dd><strong>${esc(inv.societyName)}</strong></dd>
                <dt>Subscription Plan</dt><dd>${badge(inv.plan, (inv.plan||'').toLowerCase())}</dd>
                <dt>Billed Amount</dt><dd><strong style="font-size:18px; color:var(--p);">${formatINR(inv.amount)}</strong></dd>
                <dt>Date of Payment</dt><dd>${inv.date}</dd>
                <dt>Payment Method</dt><dd>${esc(inv.method)}</dd>
                <dt>Payment Status</dt><dd>${badge(inv.status, 'resolved')}</dd>
                <dt>Notes</dt><dd>${esc(inv.notes || 'Monthly recurring subscription fee')}</dd>
              </dl>
              <div style="background:#FAF8FF; border:1px solid #E4DBFF; border-radius:8px; padding:10px; margin-top:16px; font-size:12px; color:var(--mu);">
                <strong>Prototype Notice:</strong> This invoice is generated locally for demonstration of AptEase's recurring subscription monetization.
              </div>
            `);
          }
        };
      }
    },

    // 5. SAAS PRICING TIERS OVERVIEW
    pricing: {
      render() {
        const { basic, premium, enterprise } = DB.PLANS;
        return `
          <div style="text-align:center; max-width:680px; margin:0 auto 28px;">
            <h2 style="font-size:24px; margin-bottom:8px;">AptEase SaaS Subscription Packaging</h2>
            <p class="muted">Transparent, unit-tiered recurring subscription packages designed for modern housing societies and communities.</p>
          </div>

          <div class="plan-grid">
            <!-- Basic Plan Card -->
            <div class="plan-card">
              <div class="plan-header">
                <h4>${basic.name}</h4>
                <div class="plan-price">${formatINR(basic.price)} <span>/ month</span></div>
                <p class="muted" style="font-size:13px;">${basic.tagline}</p>
              </div>
              <ul class="plan-features">
                ${basic.features.map(f => `<li><i data-lucide="check"></i> <span>${f}</span></li>`).join('')}
                ${basic.lockedFeatures.map(f => `<li class="locked"><i data-lucide="x"></i> <span>${f}</span></li>`).join('')}
              </ul>
              <div class="sidebar-plan-card" style="margin-top:auto; font-size:12px;">
                <strong>Target:</strong> Societies up to 150 flats. Essential digital records.
              </div>
            </div>

            <!-- Premium Plan Card (Featured) -->
            <div class="plan-card featured">
              <div class="plan-ribbon">Most Popular</div>
              <div class="plan-header">
                <h4>${premium.name}</h4>
                <div class="plan-price" style="color:var(--p);">${formatINR(premium.price)} <span>/ month</span></div>
                <p class="muted" style="font-size:13px;">${premium.tagline}</p>
              </div>
              <ul class="plan-features">
                ${premium.features.map(f => `<li><i data-lucide="check"></i> <span><strong>${f}</strong></span></li>`).join('')}
                ${premium.lockedFeatures.map(f => `<li class="locked"><i data-lucide="x"></i> <span>${f}</span></li>`).join('')}
              </ul>
              <div class="sidebar-plan-card" style="margin-top:auto; font-size:12px; border-color:var(--s);">
                <strong>Target:</strong> Societies 150-400 flats. Full gate security & community.
              </div>
            </div>

            <!-- Enterprise Plan Card -->
            <div class="plan-card">
              <div class="plan-header">
                <h4>${enterprise.name}</h4>
                <div class="plan-price">${formatINR(enterprise.price)} <span>/ month (custom)</span></div>
                <p class="muted" style="font-size:13px;">${enterprise.tagline}</p>
              </div>
              <ul class="plan-features">
                ${enterprise.features.map(f => `<li><i data-lucide="check"></i> <span>${f}</span></li>`).join('')}
              </ul>
              <div class="sidebar-plan-card" style="margin-top:auto; font-size:12px;">
                <strong>Target:</strong> Large townships, 400+ flats, multi-society builders.
              </div>
            </div>
          </div>
        `;
      }
    }
  }
});

// Super Admin Global Actions Modal Handlers
window.superadminActions = {
  // Modal to register a brand new apartment society
  openNewSocietyModal() {
    modal(`
      <h3>Register New Apartment Society</h3>
      <p class="muted" style="font-size:13px; margin-bottom:16px;">
        Onboard a client society to the AptEase platform and assign an active subscription plan.
      </p>
      <form id="form-register-society">
        <label>Society Name</label>
        <input id="soc-name" required value="Royal Palms Gateway" placeholder="e.g. Royal Palms Gateway">

        <div class="row" style="gap:12px;">
          <div style="flex:1;">
            <label>City</label>
            <input id="soc-city" required value="Pune" placeholder="City">
          </div>
          <div style="flex:1;">
            <label>Total Units / Flats</label>
            <input id="soc-units" type="number" required value="220" placeholder="e.g. 220">
          </div>
        </div>

        <label>Society Address / Location</label>
        <input id="soc-address" required value="Baner Hills, Pune, Maharashtra" placeholder="Full Address">

        <div class="row" style="gap:12px;">
          <div style="flex:1;">
            <label>Admin Name</label>
            <input id="soc-admin-name" required value="Sunil Deshmukh" placeholder="Society President / Admin">
          </div>
          <div style="flex:1;">
            <label>Admin Email</label>
            <input id="soc-admin-email" type="email" required value="admin@royalpalms.in" placeholder="admin@society.in">
          </div>
        </div>

        <label>Assign Subscription Tier</label>
        <select id="soc-plan">
          <option value="premium" selected>Premium Plan — ₹2,499/month (Recommended)</option>
          <option value="basic">Basic Plan — ₹999/month</option>
          <option value="enterprise">Enterprise Plan — ₹5,999/month</option>
        </select>

        <div style="margin-top:20px; display:flex; gap:10px; justify-content:flex-end;">
          <button type="submit" class="btn"><i data-lucide="check"></i> Register & Activate Subscription</button>
        </div>
      </form>
    `);

    const form = document.getElementById('form-register-society');
    if (form) {
      form.onsubmit = e => {
        e.preventDefault();
        const newSociety = DB.registerSociety({
          name: $('#soc-name').value.trim(),
          city: $('#soc-city').value.trim(),
          address: $('#soc-address').value.trim(),
          units: $('#soc-units').value,
          adminName: $('#soc-admin-name').value.trim(),
          adminEmail: $('#soc-admin-email').value.trim(),
          plan: $('#soc-plan').value
        });

        const closeBtn = document.getElementById('modal-close-btn');
        if (closeBtn) closeBtn.click();

        toast(`🎉 Society "${newSociety.name}" successfully registered on ${newSociety.plan} Plan (+${formatINR(newSociety.monthlyPrice)} MRR)!`);
        if (window.rerender) window.rerender();

        // If tour is at step 8 or 9, advance
        if (window.Tour && [8, 9].includes(Tour.getState().step)) {
          Tour.next();
        }
      };
    }
  },

  // Modal to manage an existing society's subscription and status
  openSocietyModal(societyId) {
    const list = DB.get('societies') || [];
    const s = list.find(x => String(x.id) === String(societyId));
    if (!s) return;

    modal(`
      <h3>Manage Society: ${esc(s.name)}</h3>
      <p class="muted" style="font-size:13px; margin-bottom:16px;">
        ${esc(s.address || s.city)} · ${s.units} units
      </p>

      <form id="form-manage-society">
        <label>Subscription Plan Tier</label>
        <select id="edit-soc-plan">
          <option value="Basic" ${s.plan === 'Basic' ? 'selected' : ''}>Basic Plan — ₹999/month</option>
          <option value="Premium" ${s.plan === 'Premium' ? 'selected' : ''}>Premium Plan — ₹2,499/month</option>
          <option value="Enterprise" ${s.plan === 'Enterprise' ? 'selected' : ''}>Enterprise Plan — ₹5,999/month</option>
        </select>

        <label>Subscription Status</label>
        <select id="edit-soc-status">
          <option value="Active" ${s.status === 'Active' ? 'selected' : ''}>Active (Paying)</option>
          <option value="Suspended" ${s.status === 'Suspended' ? 'selected' : ''}>Suspended (Payment Failed)</option>
          <option value="Expired" ${s.status === 'Expired' ? 'selected' : ''}>Expired (Terminated)</option>
          <option value="Demo" ${s.status === 'Demo' ? 'selected' : ''}>Demo Mode (Non-paying)</option>
        </select>

        <div class="row" style="gap:12px;">
          <div style="flex:1;">
            <label>Admin Contact</label>
            <input id="edit-soc-admin" value="${esc(s.adminName)}">
          </div>
          <div style="flex:1;">
            <label>Admin Email</label>
            <input id="edit-soc-email" value="${esc(s.adminEmail)}">
          </div>
        </div>

        <div style="margin-top:20px; display:flex; gap:10px; justify-content:space-between; align-items:center;">
          <button type="button" class="btn danger sm" id="btn-delete-soc">Delete Society</button>
          <button type="submit" class="btn sm">Save Subscription Changes</button>
        </div>
      </form>
    `);

    const form = document.getElementById('form-manage-society');
    if (form) {
      form.onsubmit = e => {
        e.preventDefault();
        const updatedPlan = $('#edit-soc-plan').value;
        const updatedStatus = $('#edit-soc-status').value;
        const updatedAdmin = $('#edit-soc-admin').value;
        const updatedEmail = $('#edit-soc-email').value;

        DB.changeSocietyPlan(s.id, updatedPlan);
        DB.update('societies', s.id, {
          status: updatedStatus,
          adminName: updatedAdmin,
          adminEmail: updatedEmail
        });

        const closeBtn = document.getElementById('modal-close-btn');
        if (closeBtn) closeBtn.click();

        toast(`Updated subscription for "${s.name}". MRR recalculated!`);
        if (window.rerender) window.rerender();
      };
    }

    const delBtn = document.getElementById('btn-delete-soc');
    if (delBtn) {
      delBtn.onclick = () => {
        if (confirm(`Remove "${s.name}" from AptEase registry?`)) {
          DB.remove('societies', s.id);
          const closeBtn = document.getElementById('modal-close-btn');
          if (closeBtn) closeBtn.click();
          toast(`Society removed. MRR updated.`);
          if (window.rerender) window.rerender();
        }
      };
    }
  }
};
