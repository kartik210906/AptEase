// AptEase - Guided Core Workflow Interactive Tour (10 Steps)
// Bridges Resident, Society Admin, and AptEase Super Admin seamlessly

const Tour = {
  STEPS: [
    {
      num: 1,
      title: 'Resident Signs In',
      role: 'resident',
      targetPage: 'resident.html',
      description: 'Rahul Sharma logs into the resident portal for Flat A-302 at Greenview Residency.',
      actionHint: 'View your dashboard and prepare to submit a maintenance complaint.'
    },
    {
      num: 2,
      title: 'Submit Water Leakage Complaint',
      role: 'resident',
      targetPage: 'resident.html#complaints',
      description: 'Submit an urgent complaint regarding "Water leakage in bathroom ceiling pipe".',
      actionHint: 'Click "Auto-Fill Water Leakage Demo" and hit Submit Complaint.'
    },
    {
      num: 3,
      title: 'Complaint Saved to LocalStorage',
      role: 'resident',
      targetPage: 'resident.html#complaints',
      description: 'The complaint is verified and persistently stored in ae_complaints with status "Pending".',
      actionHint: 'Observe the new complaint appearing in your resident history table.'
    },
    {
      num: 4,
      title: 'Society Admin Views Complaint',
      role: 'admin',
      targetPage: 'admin.html#complaints',
      description: 'Switch to Administrator Priya Menon. Society Admin inspects pending issues across all flats.',
      actionHint: 'Locate Rahul Sharma’s water leakage complaint at the top of the complaints table.'
    },
    {
      num: 5,
      title: 'Update Status to "In Progress"',
      role: 'admin',
      targetPage: 'admin.html#complaints',
      description: 'Society Admin assigns maintenance staff and updates status dropdown to "In Progress".',
      actionHint: 'Change the status select box from "Pending" to "In Progress".'
    },
    {
      num: 6,
      title: 'Resident Sees Updated Status',
      role: 'resident',
      targetPage: 'resident.html#complaints',
      description: 'Switch back to Resident Rahul Sharma. He sees real-time status updated to "In Progress".',
      actionHint: 'Check the live status badge on the complaint record.'
    },
    {
      num: 7,
      title: 'Super Admin Accesses SaaS Console',
      role: 'superadmin',
      targetPage: 'superadmin.html',
      description: 'Access AptEase SaaS Executive Dashboard. View current MRR, ARR, and active client societies.',
      actionHint: 'Inspect the 6 Active societies and initial MRR calculated dynamically.'
    },
    {
      num: 8,
      title: 'Register New Apartment Society',
      role: 'superadmin',
      targetPage: 'superadmin.html#societies',
      description: 'Onboard a new residential client: "Royal Palms Gateway", 220 units with Premium Plan.',
      actionHint: 'Click "Register Society" and assign the Premium tier (₹2,499/mo).'
    },
    {
      num: 9,
      title: 'Active Subscriptions Increase',
      role: 'superadmin',
      targetPage: 'superadmin.html#dashboard',
      description: 'The new society is registered and active subscription count increments immediately.',
      actionHint: 'Notice Active Subscriptions count moves from 6 to 7.'
    },
    {
      num: 10,
      title: 'Dynamic MRR & ARR Recalculation',
      role: 'superadmin',
      targetPage: 'superadmin.html#dashboard',
      description: 'MRR jumps by +₹2,499 and ARR jumps by +₹29,988 on the live dashboard and charts!',
      actionHint: 'Verification complete! Complete end-to-end B2B SaaS workflow proven.'
    }
  ],

  getState() {
    return DB.get('tour') || { step: 1, completed: false, active: true };
  },

  setState(patch) {
    const s = { ...this.getState(), ...patch };
    DB.set('tour', s);
    this.render();
  },

  setStep(stepNum) {
    const valid = Math.max(1, Math.min(10, stepNum));
    this.setState({ step: valid });
  },

  next() {
    const cur = this.getState().step;
    if (cur < 10) {
      this.setStep(cur + 1);
      this.executeStepNavigation(cur + 1);
    } else {
      this.setState({ completed: true });
      if (typeof toast === 'function') toast('🎉 10-Step Core Workflow Tour Completed!');
    }
  },

  prev() {
    const cur = this.getState().step;
    if (cur > 1) {
      this.setStep(cur - 1);
      this.executeStepNavigation(cur - 1);
    }
  },

  executeStepNavigation(stepNum) {
    const step = this.STEPS[stepNum - 1];
    if (!step) return;

    // Set active session role
    localStorage.setItem('ae_session', step.role);

    // Resolve relative path based on whether we are in root or /pages
    const inPages = window.location.pathname.includes('/pages/');
    let target = step.targetPage;
    if (inPages) {
      // If we are inside /pages/, convert to pages relative or parent relative
      if (target === 'resident.html') target = 'resident-dashboard.html';
      else if (target === 'resident.html#complaints') target = 'resident-dashboard.html#complaints';
      else if (target === 'admin.html') target = 'admin-dashboard.html';
      else if (target === 'admin.html#complaints') target = 'admin-dashboard.html#complaints';
      else if (target === 'superadmin.html') target = 'superadmin-dashboard.html';
      else if (target === 'superadmin.html#societies') target = 'superadmin-dashboard.html#societies';
      else if (target === 'superadmin.html#dashboard') target = 'superadmin-dashboard.html#dashboard';
    }

    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const targetFile = target.split('#')[0];
    const targetHash = target.includes('#') ? '#' + target.split('#')[1] : '';

    if (currentFile !== targetFile && targetFile) {
      window.location.href = target;
    } else if (targetHash && window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  },

  autoPerformCurrentStep() {
    const state = this.getState();
    const cur = state.step;

    if (cur === 2) {
      // Auto-fill and submit water leakage complaint
      const cat = document.getElementById('cat');
      const ti = document.getElementById('ti');
      const de = document.getElementById('de');
      const cf = document.getElementById('cf');
      if (cat && ti && de && cf) {
        cat.value = 'Plumbing';
        ti.value = 'Water leakage in bathroom pipe';
        de.value = 'Severe water leakage from bathroom ceiling pipe dripping onto floor. Needs urgent repair.';
        cf.dispatchEvent(new Event('submit', { cancelable: true }));
        this.next();
        return;
      }
    } else if (cur === 5) {
      // Change status to In Progress
      const complaints = DB.get('complaints') || [];
      const leakage = complaints.find(c => c.title.toLowerCase().includes('leakage') || c.category === 'Plumbing');
      if (leakage) {
        DB.update('complaints', leakage.id, { status: 'In Progress', adminNotes: 'Plumber Ramesh assigned. Inspection in progress.' });
        if (typeof toast === 'function') toast('Complaint status updated to "In Progress"');
        if (window.rerender) window.rerender();
        this.next();
        return;
      }
    } else if (cur === 8) {
      // Register new society with Premium plan
      const newSoc = DB.registerSociety({
        name: 'Royal Palms Gateway',
        city: 'Pune',
        address: 'Baner Hills, Pune',
        units: 220,
        adminName: 'Sunil Deshmukh',
        adminEmail: 'admin@royalpalms.in',
        adminPhone: '+91 98990 11223',
        plan: 'premium',
        billingCycle: 'Monthly'
      });
      if (typeof toast === 'function') toast(`Registered "${newSoc.name}" on Premium Plan (+₹2,499 MRR)`);
      if (window.rerender) window.rerender();
      this.next();
      return;
    }

    // Default: navigate to target
    this.executeStepNavigation(cur);
  },

  render() {
    let bar = document.getElementById('ae-tour-widget');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'ae-tour-widget';
      document.body.appendChild(bar);
    }

    const state = this.getState();
    const step = this.STEPS[state.step - 1] || this.STEPS[0];
    const isMinimized = state.minimized;

    if (isMinimized) {
      bar.innerHTML = `
        <div class="tour-minimized-pill" onclick="Tour.toggleMinimize()">
          <span class="tour-pulse"></span>
          <span><strong>Workflow Tour:</strong> Step ${state.step}/10</span>
          <i data-lucide="chevron-up"></i>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    bar.innerHTML = `
      <div class="tour-dock-container">
        <div class="tour-header">
          <div class="tour-title-wrap">
            <span class="tour-badge">CORE WORKFLOW DEMO</span>
            <strong>Step ${step.num} of 10: ${step.title}</strong>
          </div>
          <div class="tour-controls">
            <button class="tour-icon-btn" title="Minimize" onclick="Tour.toggleMinimize()"><i data-lucide="minus"></i></button>
            <button class="tour-icon-btn" title="Reset Demo Data & Tour" onclick="Tour.resetWorkflow()"><i data-lucide="rotate-ccw"></i></button>
          </div>
        </div>

        <div class="tour-body">
          <p class="tour-desc">${step.description}</p>
          <div class="tour-hint">
            <i data-lucide="zap"></i>
            <span>${step.actionHint}</span>
          </div>
        </div>

        <div class="tour-footer">
          <div class="tour-progress-bar">
            <div class="tour-progress-fill" style="width: ${(step.num / 10) * 100}%;"></div>
          </div>
          <div class="tour-actions">
            <button class="tour-btn ghost" onclick="Tour.prev()" ${step.num === 1 ? 'disabled' : ''}>Back</button>
            <button class="tour-btn auto-action" onclick="Tour.autoPerformCurrentStep()">
              <i data-lucide="play"></i> Guide / Run Step ${step.num}
            </button>
            <button class="tour-btn primary" onclick="Tour.next()">${step.num === 10 ? 'Finish Tour' : 'Next Step'}</button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  toggleMinimize() {
    const s = this.getState();
    this.setState({ minimized: !s.minimized });
  },

  resetWorkflow() {
    if (confirm('Reset entire demo data, complaints, and SaaS revenue back to initial state?')) {
      DB.reset();
      this.setState({ step: 1, completed: false, minimized: false });
      localStorage.setItem('ae_session', 'resident');
      window.location.href = window.location.pathname.includes('/pages/') ? 'resident-dashboard.html' : 'resident.html';
    }
  }
};
