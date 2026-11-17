// AptEase - Resident Panel (Rahul Sharma · Flat A-302)
// Resident Dashboard, Complaint Submission & Live Tracking, Visitor Pass, Community Hub

const ME = () => DB.get('residents').find(r => r.id === 1) || {
  id: 1, name: 'Rahul Sharma', flat: 'A-302', phone: '+91 98220 11001', email: 'rahul.sharma@mail.com', type: 'Owner'
};
const myComplaints = () => (DB.get('complaints') || []).filter(c => c.residentId === 1 || c.flat === 'A-302');
const myVisitors = () => (DB.get('visitors') || []).filter(v => v.residentId === 1 || v.flat === 'A-302');

boot({
  role: 'resident',
  user: { name: 'Rahul Sharma', sub: 'Flat A-302 · Owner', flat: 'A-302' },
  nav: [
    ['dashboard', 'Dashboard', 'layout-dashboard'],
    ['complaints', 'My Complaints', 'wrench'],
    ['visitors', 'Visitor Passes', 'user-check'],
    ['notices', 'Notice Board', 'megaphone'],
    ['community', 'Community Feed', 'messages-square'],
    ['flatinfo', 'My Apartment Info', 'home'],
    ['profile', 'Resident Profile', 'user']
  ],
  views: {
    // 1. RESIDENT DASHBOARD
    dashboard: {
      render() {
        const c = myComplaints();
        const pending = c.filter(x => x.status === 'Pending').length;
        const inProgress = c.filter(x => x.status === 'In Progress').length;
        const resolved = c.filter(x => x.status === 'Resolved').length;
        const visitors = myVisitors();
        const settings = DB.get('settings') || {};
        const notices = DB.get('notices') || [];

        return `
          <!-- Welcome Greeting Banner -->
          <div class="row between" style="margin-bottom:20px;">
            <div>
              <h2 style="font-size:24px; margin-bottom:4px;">Welcome back, Rahul 👋</h2>
              <p class="muted">Flat A-302 · ${esc(settings.society)} · Maintenance Status: <span class="badge resolved">Paid</span></p>
            </div>
            <div>
              <a href="#complaints" class="btn"><i data-lucide="plus-circle"></i> Submit Complaint</a>
            </div>
          </div>

          <!-- Quick Stat Cards -->
          <div class="grid g4">
            <div class="card stat hl">
              <div class="stat-header">
                <span class="stat-title">My Complaints</span>
                <div class="stat-icon"><i data-lucide="wrench"></i></div>
              </div>
              <b>${c.length}</b>
              <div class="stat-sub">Submitted issues</div>
            </div>

            <div class="card stat">
              <div class="stat-header">
                <span class="stat-title">Pending Action</span>
                <div class="stat-icon" style="background:#FEF3C7; color:#B45309;"><i data-lucide="clock"></i></div>
              </div>
              <b>${pending}</b>
              <div class="stat-sub">Awaiting admin review</div>
            </div>

            <div class="card stat">
              <div class="stat-header">
                <span class="stat-title">In Progress</span>
                <div class="stat-icon" style="background:#EFF6FF; color:#1D4ED8;"><i data-lucide="activity"></i></div>
              </div>
              <b>${inProgress}</b>
              <div class="stat-sub">Staff assigned</div>
            </div>

            <div class="card stat">
              <div class="stat-header">
                <span class="stat-title">Resolved</span>
                <div class="stat-icon" style="background:#ECFDF5; color:#047857;"><i data-lucide="check-circle-2"></i></div>
              </div>
              <b>${resolved}</b>
              <div class="stat-sub">Successfully closed</div>
            </div>
          </div>

          <!-- Quick Action Buttons Bar -->
          <div class="row" style="margin:24px 0 20px;">
            <a class="btn ghost" href="#complaints"><i data-lucide="wrench"></i> View My Complaints</a>
            <a class="btn ghost" href="#visitors"><i data-lucide="user-plus"></i> Pre-Approve Visitor</a>
            <a class="btn ghost" href="#community"><i data-lucide="message-square"></i> Post on Community Feed</a>
            <a class="btn ghost" href="#notices"><i data-lucide="megaphone"></i> View Notices (${notices.length})</a>
          </div>

          <!-- Recent Complaints & Notice Board -->
          <div class="grid g2">
            <div class="card">
              <h3>
                <span>My Active Complaints</span>
                <a href="#complaints" class="btn ghost sm">Submit New</a>
              </h3>
              ${c.length ? `
                <div class="wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Complaint</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Live Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${c.slice(0, 4).map(item => `
                        <tr>
                          <td>
                            <strong>${esc(item.title)}</strong>
                            <div class="mu" style="font-size:12px;">${esc(item.description.slice(0, 50))}...</div>
                          </td>
                          <td>${esc(item.category)}</td>
                          <td>${item.date}</td>
                          <td>${badge(item.status)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              ` : empty('You have not submitted any complaints.')}
            </div>

            <div class="card">
              <h3>
                <span>Society Circulars & Alerts</span>
                <a href="#notices" class="btn ghost sm">View All</a>
              </h3>
              ${notices.slice(0, 3).map(n => `
                <div class="item">
                  <div class="row" style="gap:8px; margin-bottom:4px;">
                    <span class="badge ${n.urgency === 'Urgent' ? 'expired' : 'basic'}" style="font-size:11px;">${esc(n.urgency || 'General')}</span>
                    <span class="mu" style="font-size:12px;">${n.date}</span>
                  </div>
                  <strong>${esc(n.title)}</strong>
                  <p style="color:var(--mu); font-size:13px; margin-top:2px;">${esc(n.description)}</p>
                </div>
              `).join('') || empty('No notices published.')}
            </div>
          </div>
        `;
      }
    },

    // 2. COMPLAINT SUBMISSION & TRACKING (Core Workflow Step 2 & 6)
    complaints: {
      render() {
        return `
          <!-- Step 2 / 6 Workflow Banner -->
          <div class="demo-disclaimer-banner" style="background:#EFF6FF; border-color:#BFDBFE; color:#1E40AF;">
            <i data-lucide="zap"></i>
            <div>
              <strong>Core Workflow Demo:</strong> Click the "Auto-Fill Water Leakage Demo" button below to populate the sample maintenance complaint, then submit it to test the live lifecycle.
            </div>
          </div>

          <div class="grid g2">
            <!-- Complaint Submission Form -->
            <div class="card">
              <div class="row between" style="margin-bottom:12px;">
                <h3>Submit Maintenance Complaint</h3>
                <button type="button" class="btn ghost sm" id="btn-autofill-leakage" style="color:var(--p); border-color:var(--p);">
                  <i data-lucide="sparkles"></i> Auto-Fill Water Leakage Demo
                </button>
              </div>

              <form id="cf">
                <div class="row">
                  <div style="flex:1;">
                    <label>Category</label>
                    <select id="cat">
                      <option value="Plumbing" selected>Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Security">Security & Access</option>
                      <option value="Parking">Parking & Vehicles</option>
                      <option value="Cleaning">Housekeeping & Cleaning</option>
                      <option value="Elevator">Elevator / Lift</option>
                      <option value="Other">Other Issues</option>
                    </select>
                  </div>
                  <div style="flex:1;">
                    <label>Priority</label>
                    <select id="pri">
                      <option value="High" selected>High (Urgent)</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <label>Complaint Title</label>
                <input id="ti" required value="Water leakage in bathroom" placeholder="e.g. Water leakage from ceiling pipe">

                <label>Detailed Description</label>
                <textarea id="de" rows="4" required placeholder="Describe the problem, exact location inside the flat, and urgency...">Water is leaking from the bathroom ceiling pipe and dripping onto the floor. Needs urgent plumbing inspection.</textarea>

                <div class="row between" style="margin-top:18px;">
                  <span class="mu" style="font-size:12px;">Logged under: <strong>Flat A-302 (Rahul Sharma)</strong></span>
                  <button type="submit" class="btn"><i data-lucide="send"></i> Submit Complaint</button>
                </div>
              </form>
            </div>

            <!-- Complaint History & Live Tracking -->
            <div class="card">
              <h3>
                <span>My Complaint History</span>
                <span class="mu" style="font-size:12px; font-weight:normal;">Real-time sync</span>
              </h3>
              <div id="hist"></div>
            </div>
          </div>
        `;
      },
      bind() {
        const drawHistory = () => {
          const c = myComplaints();
          const container = $('#hist');
          if (!container) return;

          container.innerHTML = c.length ? `
            <div class="wrap">
              <table>
                <thead>
                  <tr>
                    <th>Issue</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  ${c.map(item => `
                    <tr>
                      <td>
                        <strong>${esc(item.title)}</strong>
                        <div class="mu" style="font-size:12px;">${esc(item.description.slice(0, 40))}...</div>
                      </td>
                      <td>${esc(item.category)}</td>
                      <td>${item.date}</td>
                      <td>${badge(item.status)}</td>
                      <td>
                        <button class="btn ghost sm" data-cview="${item.id}">View</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : empty('No complaints submitted yet.');

          if (window.lucide) lucide.createIcons();
        };

        drawHistory();

        // Auto-Fill Button
        const autofillBtn = $('#btn-autofill-leakage');
        if (autofillBtn) {
          autofillBtn.onclick = () => {
            $('#cat').value = 'Plumbing';
            $('#pri').value = 'High';
            $('#ti').value = 'Water leakage in bathroom pipe';
            $('#de').value = 'Severe water is leaking from the bathroom ceiling pipe and dripping onto the floor. Needs urgent repair.';
            toast('Auto-filled with water leakage complaint details');
          };
        }

        // Form Submit
        $('#cf').onsubmit = e => {
          e.preventDefault();
          const r = ME();
          const newComplaint = DB.add('complaints', {
            residentId: r.id,
            name: r.name,
            flat: r.flat,
            category: $('#cat').value,
            priority: $('#pri').value,
            title: $('#ti').value.trim(),
            description: $('#de').value.trim(),
            status: 'Pending',
            date: DB.day(0),
            assignedTo: 'Unassigned',
            adminNotes: 'Submitted by resident. Pending society administrator assignment.'
          });

          toast(`Complaint #${newComplaint.id} submitted successfully!`);
          drawHistory();

          // Advance workflow tour from Step 2 to Step 3/4
          if (window.Tour && Tour.getState().step === 2) {
            Tour.next();
          }
        };

        // View Modal
        $('#hist').onclick = e => {
          const btn = e.target.closest('[data-cview]');
          if (!btn) return;
          const cId = btn.dataset.cview;
          const c = (DB.get('complaints') || []).find(x => String(x.id) === String(cId));
          if (c) {
            modal(`
              <h3>Complaint Tracking #${c.id}</h3>
              <p class="muted" style="margin-bottom:16px;">${esc(c.title)}</p>
              <dl>
                <dt>Current Status</dt><dd>${badge(c.status)}</dd>
                <dt>Category</dt><dd>${esc(c.category)}</dd>
                <dt>Priority</dt><dd><strong>${esc(c.priority || 'Medium')}</strong></dd>
                <dt>Submitted On</dt><dd>${c.date}</dd>
                <dt>Flat Location</dt><dd>Flat ${esc(c.flat)}</dd>
                <dt>Full Description</dt><dd>${esc(c.description)}</dd>
                <dt>Assigned Technician</dt><dd>${esc(c.assignedTo || 'Pending assignment by society admin')}</dd>
                <dt>Admin Remarks</dt><dd>${esc(c.adminNotes || 'Under initial review')}</dd>
              </dl>
              <div style="margin-top:20px; background:#F8F7FC; border:1px solid #EBE8F5; border-radius:8px; padding:12px; font-size:12px;">
                <strong>Resolution SLA:</strong> As Greenview Residency is on AptEase, complaints are monitored digitally with real-time status updates.
              </div>
            `);
          }
        };
      }
    },

    // 3. VISITOR PASS REGISTRATION
    visitors: {
      render() {
        return `
          <div class="grid g2">
            <!-- Register Visitor Form -->
            <div class="card">
              <h3>Generate Expected Visitor Gate Pass</h3>
              <form id="form-resident-visitor">
                <label>Visitor Full Name</label>
                <input id="vis-name" required placeholder="e.g. Meera Sharma">

                <div class="row">
                  <div style="flex:1;">
                    <label>Purpose of Visit</label>
                    <input id="vis-purpose" required placeholder="e.g. Family Visit / Delivery">
                  </div>
                  <div style="flex:1;">
                    <label>Expected Date</label>
                    <input id="vis-date" type="date" required value="${DB.day(0)}">
                  </div>
                </div>

                <label>Visitor Phone Number</label>
                <input id="vis-phone" required placeholder="+91 98XXX XXXXX">

                <button type="submit" class="btn"><i data-lucide="shield-check"></i> Generate Digital Gate Pass</button>
              </form>
            </div>

            <!-- My Registered Visitors -->
            <div class="card">
              <h3>My Pre-Approved Visitors</h3>
              <div id="vis-list"></div>
            </div>
          </div>
        `;
      },
      bind() {
        const drawVisitors = () => {
          const list = myVisitors();
          const container = $('#vis-list');
          if (!container) return;

          container.innerHTML = list.length ? list.map(v => `
            <div class="item row between">
              <div>
                <strong>${esc(v.name)}</strong> <span class="mu">· ${v.date}</span>
                <p style="font-size:13px; color:var(--mu);">${esc(v.purpose)}</p>
                <div style="font-size:12px; margin-top:4px;">
                  Pass Code: <code style="font-weight:700; color:var(--p);">${esc(v.passCode || 'PASS-' + Math.floor(1000 + Math.random()*9000))}</code>
                </div>
              </div>
              <div>${badge(v.status || 'Expected', (v.status || '').toLowerCase())}</div>
            </div>
          `).join('') : empty('No visitors registered.');
          if (window.lucide) lucide.createIcons();
        };

        drawVisitors();

        $('#form-resident-visitor').onsubmit = e => {
          e.preventDefault();
          const r = ME();
          const randomPass = 'PASS-' + Math.floor(1000 + Math.random() * 9000);
          DB.add('visitors', {
            residentId: r.id,
            resident: r.name,
            flat: r.flat,
            name: $('#vis-name').value.trim(),
            purpose: $('#vis-purpose').value.trim(),
            date: $('#vis-date').value,
            phone: $('#vis-phone').value.trim(),
            passCode: randomPass,
            status: 'Expected'
          });

          e.target.reset();
          $('#vis-date').value = DB.day(0);
          toast(`Gate pass ${randomPass} created!`);
          drawVisitors();
        };
      }
    },

    // 4. SOCIETY NOTICES
    notices: {
      render() {
        const list = DB.get('notices') || [];
        return `
          <div class="card">
            <h3>Official Society Circulars & Announcements</h3>
            ${list.length ? list.map(n => `
              <div class="item">
                <div class="row" style="gap:8px; margin-bottom:4px;">
                  <span class="badge ${n.urgency === 'Urgent' ? 'expired' : 'basic'}">${esc(n.urgency || 'General')}</span>
                  <span class="mu" style="font-size:12px;">${n.date}</span>
                </div>
                <strong>${esc(n.title)}</strong>
                <p style="color:var(--mu); font-size:13px; margin-top:4px;">${esc(n.description)}</p>
              </div>
            `).join('') : empty('No notices published yet.')}
          </div>
        `;
      }
    },

    // 5. COMMUNITY FORUM
    community: {
      render() {
        const posts = DB.get('posts') || [];
        return `
          <div class="card" style="margin-bottom:20px;">
            <h3>Post to Greenview Residency Community Hub</h3>
            <form id="form-resident-post">
              <textarea id="res-post-text" rows="3" required placeholder="Share recommendations, lost & found, sports clubs, or announcements with your neighbors..."></textarea>
              <div style="text-align:right; margin-top:10px;">
                <button type="submit" class="btn"><i data-lucide="send"></i> Post to Neighbors</button>
              </div>
            </form>
          </div>

          <div class="card" id="post-feed">
            ${posts.map(p => `
              <div class="item">
                <div class="row between">
                  <strong>${esc(p.author)}</strong>
                  <span class="mu" style="font-size:12px;">Flat ${esc(p.flat)} · ${p.date}</span>
                </div>
                <p style="color:var(--tx); margin-top:6px; font-size:14px;">${esc(p.text)}</p>
                <div class="row" style="margin-top:10px; gap:16px;">
                  <button class="btn ghost sm" onclick="residentActions.likePost(${p.id})">
                    <i data-lucide="thumbs-up"></i> <span>${p.likes || 0} Likes</span>
                  </button>
                  <button class="btn ghost sm" onclick="toast('Comments drawer open')">
                    <i data-lucide="message-circle"></i> <span>${p.comments || 0} Comments</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      },
      bind() {
        $('#form-resident-post').onsubmit = e => {
          e.preventDefault();
          const r = ME();
          DB.add('posts', {
            author: r.name,
            flat: r.flat,
            date: DB.day(0),
            text: $('#res-post-text').value.trim(),
            likes: 0,
            comments: 0
          });
          e.target.reset();
          toast('Shared with Greenview Residency neighbors');
          rerender();
        };
      }
    },

    // 6. APARTMENT & FLAT INFORMATION
    flatinfo: {
      render() {
        const r = ME();
        const s = DB.get('settings') || {};
        return `
          <div class="grid g2">
            <div class="card">
              <h3>Apartment & Occupancy Details</h3>
              <dl>
                <dt>Flat Number</dt><dd><strong style="font-size:18px; color:var(--p);">Flat ${esc(r.flat)}</strong></dd>
                <dt>Wing / Block</dt><dd>Block A, 3rd Floor</dd>
                <dt>Carpet Area</dt><dd>1,250 sq.ft (3 BHK)</dd>
                <dt>Occupancy</dt><dd><span class="badge premium">${esc(r.type || 'Owner')}</span></dd>
                <dt>Parking Slot</dt><dd>Slot P-A302 (Covered Basement)</dd>
                <dt>Maintenance Dues</dt><dd><span class="badge resolved">Paid for Q4 2026</span></dd>
              </dl>
            </div>

            <div class="card">
              <h3>Society & Office Information</h3>
              <dl>
                <dt>Society Name</dt><dd><strong>${esc(s.society)}</strong></dd>
                <dt>Address</dt><dd>${esc(s.address)}</dd>
                <dt>Total Units</dt><dd>${esc(s.units)}</dd>
                <dt>Managing Office</dt><dd>Ground Floor Clubhouse Admin Office</dd>
                <dt>Office Administrator</dt><dd>${esc(s.adminName)} (${esc(s.adminPhone)})</dd>
                <dt>Society Email</dt><dd>${esc(s.adminEmail)}</dd>
              </dl>
            </div>
          </div>
        `;
      }
    },

    // 7. PROFILE
    profile: {
      render() {
        const r = ME();
        return `
          <div class="card" style="max-width:600px;">
            <h3>Resident Profile</h3>
            <dl>
              <dt>Full Name</dt><dd><strong>${esc(r.name)}</strong></dd>
              <dt>Flat</dt><dd>Flat ${esc(r.flat)}</dd>
              <dt>Mobile Number</dt><dd>${esc(r.phone)}</dd>
              <dt>Email Address</dt><dd>${esc(r.email)}</dd>
              <dt>Emergency Contact</dt><dd>+91 98220 99111 (Kavita Sharma - Spouse)</dd>
              <dt>Portal Role</dt><dd><span class="badge basic">Resident Member</span></dd>
            </dl>
          </div>
        `;
      }
    }
  }
});

// Resident Global Actions
window.residentActions = {
  likePost(postId) {
    const posts = DB.get('posts') || [];
    const p = posts.find(x => x.id === postId);
    if (p) {
      p.likes = (p.likes || 0) + 1;
      DB.set('posts', posts);
      toast('Liked post');
      if (window.rerender) window.rerender();
    }
  }
};
