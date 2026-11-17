// AptEase - Shared Data Storage Engine & SaaS Dynamic Revenue Calculator
// Pure Vanilla JavaScript + localStorage

const DB = {
  PREFIX: 'ae_',

  // Pricing Model Assumptions (Prototype Defaults)
  PLANS: {
    basic: {
      id: 'basic',
      name: 'Basic Plan',
      price: 999,
      billingCycle: 'month',
      color: '#6366F1',
      tagline: 'Essential apartment operations for small to mid-sized societies',
      features: [
        'Resident Directory (up to 150 units)',
        'Digital Complaint Submission & Tracking',
        'Official Society Notices & Circulars',
        'Basic Email Notifications',
        'Standard 48-Hour Admin Support'
      ],
      lockedFeatures: [
        'Advanced Visitor Pre-approval & Gate Logs',
        'Community Discussion Forum & Events',
        'Amenity & Clubhouse Reservation',
        'Multi-Admin Role-Based Access Control'
      ]
    },
    premium: {
      id: 'premium',
      name: 'Premium Plan',
      price: 2499,
      billingCycle: 'month',
      color: '#7654D6',
      badge: 'Most Popular',
      popular: true,
      tagline: 'Complete automation, security & community management for modern societies',
      features: [
        'Everything included in Basic Plan',
        'Advanced Visitor Registration & Digital Passes',
        'Interactive Resident Community Hub',
        'Society Maintenance & Billing Tracking',
        'Priority 12-Hour Support SLA',
        'Push Notifications & Instant SMS Alerts'
      ],
      lockedFeatures: [
        'Multi-Society Centralized Portfolio Console',
        'Custom IoT Gate Hardware Integration API'
      ]
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 5999,
      billingCycle: 'month',
      color: '#0EA5E9',
      tagline: 'Designed for large townships, high-rises & multi-property developers',
      features: [
        'Everything included in Premium Plan',
        'Unlimited Units & Multi-Tower Architecture',
        'Multi-Society Management Console',
        'Dedicated Customer Success Manager',
        'Custom ERP & Payment Gateway Integrations',
        '24/7 Priority Emergency Support & 99.9% Uptime SLA'
      ],
      lockedFeatures: []
    }
  },

  get(k) {
    try {
      const val = localStorage.getItem(this.PREFIX + k);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      console.error('DB.get error', k, e);
      return null;
    }
  },

  set(k, v) {
    try {
      localStorage.setItem(this.PREFIX + k, JSON.stringify(v));
      this.dispatchChange(k, v);
    } catch (e) {
      console.error('DB.set error', k, e);
    }
  },

  add(k, item) {
    const list = this.get(k) || [];
    if (!item.id) item.id = Date.now();
    list.unshift(item);
    this.set(k, list);
    return item;
  },

  update(k, id, patch) {
    const list = this.get(k) || [];
    const updated = list.map(x => (String(x.id) === String(id) ? { ...x, ...patch } : x));
    this.set(k, updated);
  },

  remove(k, id) {
    const list = this.get(k) || [];
    this.set(k, list.filter(x => String(x.id) !== String(id)));
  },

  day(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().slice(0, 10);
  },

  futureDay(offsetDays = 30) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  },

  // Dynamic Revenue Engine
  // MRR = Sum of monthly recurring subscription values for ACTIVE paying societies
  // ARR = MRR * 12
  calcRevenue() {
    const societies = this.get('societies') || [];
    const active = societies.filter(s => s.status === 'Active');
    
    let mrr = 0;
    const planBreakdown = {
      basic: { count: 0, revenue: 0 },
      premium: { count: 0, revenue: 0 },
      enterprise: { count: 0, revenue: 0 }
    };

    active.forEach(s => {
      const planKey = (s.plan || 'basic').toLowerCase();
      const price = Number(s.monthlyPrice) || (this.PLANS[planKey] ? this.PLANS[planKey].price : 0);
      mrr += price;
      if (planBreakdown[planKey]) {
        planBreakdown[planKey].count += 1;
        planBreakdown[planKey].revenue += price;
      }
    });

    const arr = mrr * 12;
    const totalSocieties = societies.length;
    const activeCount = active.length;
    const expiredCount = societies.filter(s => s.status === 'Expired').length;
    const suspendedCount = societies.filter(s => s.status === 'Suspended').length;
    const demoCount = societies.filter(s => s.status === 'Demo').length;

    return {
      mrr,
      arr,
      totalSocieties,
      activeCount,
      expiredCount,
      suspendedCount,
      demoCount,
      planBreakdown
    };
  },

  // Event dispatcher for reactive UI updates across components
  dispatchChange(key, value) {
    try {
      window.dispatchEvent(new CustomEvent('aeevent', { detail: { key, value } }));
    } catch (_) {}
  },

  // Synchronize Society Admin's active society with the societies list in superadmin
  syncSocietySettings(updatedSettings) {
    this.set('settings', updatedSettings);
    const societies = this.get('societies') || [];
    const idx = societies.findIndex(s => s.id === 1 || s.name === updatedSettings.society);
    if (idx !== -1) {
      societies[idx].name = updatedSettings.society;
      societies[idx].units = parseInt(updatedSettings.units) || societies[idx].units;
      societies[idx].adminName = updatedSettings.adminName;
      societies[idx].adminEmail = updatedSettings.adminEmail;
      societies[idx].plan = updatedSettings.currentPlan || societies[idx].plan;
      societies[idx].status = updatedSettings.subscriptionStatus || societies[idx].status;
      const planKey = (societies[idx].plan || 'basic').toLowerCase();
      societies[idx].monthlyPrice = this.PLANS[planKey] ? this.PLANS[planKey].price : 999;
      this.set('societies', societies);
    }
  },

  // Upgrade or change subscription plan for a society
  changeSocietyPlan(societyId, newPlanId) {
    const planKey = newPlanId.toLowerCase();
    const planInfo = this.PLANS[planKey] || this.PLANS.basic;
    const societies = this.get('societies') || [];
    const s = societies.find(x => String(x.id) === String(societyId));
    
    if (s) {
      s.plan = planInfo.name.replace(' Plan', '');
      s.monthlyPrice = planInfo.price;
      s.status = 'Active';
      s.renewalDate = this.futureDay(30);
      this.set('societies', societies);

      // If updating society 1 (Greenview Residency), sync with settings
      if (String(societyId) === '1') {
        const settings = this.get('settings') || {};
        settings.currentPlan = s.plan;
        settings.subscriptionStatus = 'Active';
        settings.monthlyPrice = s.monthlyPrice;
        settings.renewalDate = s.renewalDate;
        this.set('settings', settings);
      }

      // Add a simulated payment record for plan upgrade
      this.add('payments', {
        id: 'INV-' + (202600 + Math.floor(Math.random() * 9000)),
        societyId: s.id,
        societyName: s.name,
        plan: s.plan,
        amount: planInfo.price,
        date: this.day(0),
        method: 'Auto-Debit (UPI/Card)',
        status: 'Paid',
        notes: `Subscription upgraded to ${s.plan}`
      });

      return s;
    }
    return null;
  },

  // Register a new society from Super Admin
  registerSociety(formData) {
    const planKey = (formData.plan || 'premium').toLowerCase();
    const planInfo = this.PLANS[planKey] || this.PLANS.premium;
    const price = formData.customPrice ? Number(formData.customPrice) : planInfo.price;

    const newSociety = {
      id: Date.now(),
      name: formData.name,
      city: formData.city || 'Mumbai',
      address: formData.address || `${formData.city || 'Metro Area'}, India`,
      units: Number(formData.units) || 150,
      adminName: formData.adminName,
      adminEmail: formData.adminEmail,
      adminPhone: formData.adminPhone || '+91 98765 43210',
      plan: planInfo.name.replace(' Plan', ''),
      monthlyPrice: price,
      billingCycle: formData.billingCycle || 'Monthly',
      status: 'Active',
      startDate: this.day(0),
      renewalDate: this.futureDay(30)
    };

    const list = this.get('societies') || [];
    list.unshift(newSociety);
    this.set('societies', list);

    // Record initial subscription activation payment
    this.add('payments', {
      id: 'INV-' + (202600 + Math.floor(Math.random() * 9000)),
      societyId: newSociety.id,
      societyName: newSociety.name,
      plan: newSociety.plan,
      amount: newSociety.monthlyPrice,
      date: this.day(0),
      method: 'Razorpay Simulation',
      status: 'Paid',
      notes: 'Initial Onboarding Activation'
    });

    return newSociety;
  },

  // Seed default demo state
  seed(force = false) {
    if (!force && this.get('seeded')) return;

    const d = n => this.day(n);
    const fd = n => this.futureDay(n);

    // 1. Initial Residents (Greenview Residency)
    this.set('residents', [
      { id: 1, name: 'Rahul Sharma', flat: 'A-302', phone: '+91 98220 11001', email: 'rahul.sharma@mail.com', type: 'Owner', dues: 'Paid' },
      { id: 2, name: 'Anita Deshmukh', flat: 'A-101', phone: '+91 98220 11002', email: 'anita.d@mail.com', type: 'Owner', dues: 'Paid' },
      { id: 3, name: 'Vikram Joshi', flat: 'B-204', phone: '+91 98220 11003', email: 'vikram.j@mail.com', type: 'Tenant', dues: 'Paid' },
      { id: 4, name: 'Sneha Kulkarni', flat: 'B-402', phone: '+91 98220 11004', email: 'sneha.k@mail.com', type: 'Owner', dues: 'Pending' },
      { id: 5, name: 'Imran Sheikh', flat: 'C-105', phone: '+91 98220 11005', email: 'imran.s@mail.com', type: 'Tenant', dues: 'Paid' },
      { id: 6, name: 'Neha Patil', flat: 'C-307', phone: '+91 98220 11006', email: 'neha.p@mail.com', type: 'Owner', dues: 'Paid' }
    ]);

    // 2. Initial Complaints
    this.set('complaints', [
      {
        id: 101,
        residentId: 3,
        name: 'Vikram Joshi',
        flat: 'B-204',
        category: 'Electrical',
        priority: 'High',
        title: 'Corridor light not working',
        description: 'The light on the 2nd floor corridor has been out for three days. It gets pitch dark at night.',
        status: 'In Progress',
        date: d(4),
        assignedTo: 'Ramesh (Electrician)',
        adminNotes: 'Inspection scheduled for today 4 PM.'
      },
      {
        id: 102,
        residentId: 2,
        name: 'Anita Deshmukh',
        flat: 'A-101',
        category: 'Security',
        priority: 'Medium',
        title: 'Main gate camera offline',
        description: 'CCTV feed at the main entrance gate has been disconnected.',
        status: 'Resolved',
        date: d(9),
        assignedTo: 'SecureVision Tech',
        adminNotes: 'Camera adapter replaced and feed restored.'
      },
      {
        id: 103,
        residentId: 5,
        name: 'Imran Sheikh',
        flat: 'C-105',
        category: 'Parking',
        priority: 'Low',
        title: 'Unknown car in my slot',
        description: 'A silver sedan (MH 31 AB 4455) has been parked in slot C-105 since yesterday evening.',
        status: 'Pending',
        date: d(1),
        assignedTo: 'Security Guard',
        adminNotes: 'Notice placed on windshield.'
      }
    ]);

    // 3. Visitors
    this.set('visitors', [
      { id: 201, residentId: 2, resident: 'Anita Deshmukh', flat: 'A-101', name: 'Meera Deshmukh', purpose: 'Family Visit', date: d(0), passCode: 'PASS-8912', status: 'Checked In', phone: '+91 98220 44551' },
      { id: 202, residentId: 3, resident: 'Vikram Joshi', flat: 'B-204', name: 'Urban Company Tech', purpose: 'AC Servicing', date: d(0), passCode: 'PASS-4419', status: 'Expected', phone: '+91 98220 77112' },
      { id: 203, residentId: 1, resident: 'Rahul Sharma', flat: 'A-302', name: 'Amazon Delivery Agent', purpose: 'Package Delivery', date: d(1), passCode: 'PASS-1024', status: 'Completed', phone: '+91 98220 99331' }
    ]);

    // 4. Notices
    this.set('notices', [
      { id: 301, title: 'Borewell & Water Tank Cleaning', category: 'Maintenance', urgency: 'Urgent', date: d(1), description: 'Water supply will remain suspended on Saturday between 10:00 AM and 1:30 PM for semi-annual overhead tank cleaning and chlorination.' },
      { id: 302, title: 'Annual General Body Meeting (AGM)', category: 'General', urgency: 'Important', date: d(5), description: 'The 12th AGM is scheduled for the upcoming Sunday at 6:00 PM in the Society Clubhouse. Financial audit reports will be presented.' },
      { id: 303, title: 'Diwali Lighting & Cultural Celebration', category: 'Event', urgency: 'Normal', date: d(12), description: 'Join us for society rangoli competition, lantern decorations, and sweet distribution at the central garden.' }
    ]);

    // 5. Community Posts
    this.set('posts', [
      { id: 401, author: 'Neha Patil', flat: 'C-307', date: d(2), text: 'Starting a morning weekend badminton club at the clubhouse courts (7:00 AM). Beginners and pros welcome! Drop a comment if interested.', likes: 8, comments: 4 },
      { id: 402, author: 'Anita Deshmukh', flat: 'A-101', date: d(4), text: 'Found a set of Honda bike keys near the basement lift lobby on Tuesday. Deposited with security desk guard.', likes: 5, comments: 2 },
      { id: 403, author: 'Vikram Joshi', flat: 'B-204', date: d(6), text: 'Looking for recommendations for a reliable interior carpenter for modular kitchen work. Any contacts?', likes: 3, comments: 6 }
    ]);

    // 6. Current Society Settings (Greenview Residency - Society Admin context)
    this.set('settings', {
      society: 'Greenview Residency',
      address: 'Wardha Road, Nagpur, Maharashtra',
      units: '120 flats',
      adminName: 'Priya Menon',
      adminEmail: 'admin@greenview.in',
      adminPhone: '+91 98220 99000',
      currentPlan: 'Basic', // Starts on Basic as per prompt scenario
      subscriptionStatus: 'Active',
      monthlyPrice: 999,
      startDate: d(180),
      renewalDate: fd(18)
    });

    // 7. SaaS Master Societies Registry (Super Admin B2B context)
    // 6 Active, 1 Expired, 1 Suspended -> Initial MRR = ₹15,494/mo
    this.set('societies', [
      {
        id: 1,
        name: 'Greenview Residency',
        city: 'Nagpur',
        address: 'Wardha Road, Nagpur',
        units: 120,
        adminName: 'Priya Menon',
        adminEmail: 'admin@greenview.in',
        adminPhone: '+91 98220 99000',
        plan: 'Basic',
        monthlyPrice: 999,
        billingCycle: 'Monthly',
        status: 'Active',
        startDate: d(180),
        renewalDate: fd(18)
      },
      {
        id: 2,
        name: 'Skyline Pinnacle Towers',
        city: 'Bengaluru',
        address: 'Outer Ring Road, Bellandur, Bengaluru',
        units: 350,
        adminName: 'Karthik Rao',
        adminEmail: 'admin@skylinetowers.com',
        adminPhone: '+91 98450 12345',
        plan: 'Premium',
        monthlyPrice: 2499,
        billingCycle: 'Monthly',
        status: 'Active',
        startDate: d(120),
        renewalDate: fd(12)
      },
      {
        id: 3,
        name: 'Palm Meadows Enclave',
        city: 'Pune',
        address: 'Kalyani Nagar, Pune',
        units: 240,
        adminName: 'Ananya Roy',
        adminEmail: 'society@palmmeadows.org',
        adminPhone: '+91 97654 32109',
        plan: 'Premium',
        monthlyPrice: 2499,
        billingCycle: 'Monthly',
        status: 'Active',
        startDate: d(90),
        renewalDate: fd(25)
      },
      {
        id: 4,
        name: 'Silver Oak Heights',
        city: 'Mumbai',
        address: 'Andheri West, Mumbai',
        units: 180,
        adminName: 'Rohan Verma',
        adminEmail: 'care@silveroakmumbai.in',
        adminPhone: '+91 98200 45678',
        plan: 'Basic',
        monthlyPrice: 999,
        billingCycle: 'Monthly',
        status: 'Active',
        startDate: d(150),
        renewalDate: fd(5)
      },
      {
        id: 5,
        name: 'Grand Orchids Condominium',
        city: 'Hyderabad',
        address: 'Gachibowli Financial District, Hyderabad',
        units: 520,
        adminName: 'Suresh Naidu',
        adminEmail: 'manager@grandorchids.co',
        adminPhone: '+91 99880 77665',
        plan: 'Enterprise',
        monthlyPrice: 5999,
        billingCycle: 'Monthly',
        status: 'Active',
        startDate: d(60),
        renewalDate: fd(40)
      },
      {
        id: 6,
        name: 'Harmony Meadows',
        city: 'Gurugram',
        address: 'Golf Course Extension, Gurugram',
        units: 210,
        adminName: 'Deepak Gupta',
        adminEmail: 'rwa@harmonymeadows.in',
        adminPhone: '+91 98110 55443',
        plan: 'Premium',
        monthlyPrice: 2499,
        billingCycle: 'Monthly',
        status: 'Active',
        startDate: d(30),
        renewalDate: fd(20)
      },
      {
        id: 7,
        name: 'Riverside Apartments',
        city: 'Chennai',
        address: 'Kotturpuram, Chennai',
        units: 90,
        adminName: 'Venkatesh S.',
        adminEmail: 'admin@riversidechennai.in',
        adminPhone: '+91 94440 22334',
        plan: 'Basic',
        monthlyPrice: 999,
        billingCycle: 'Monthly',
        status: 'Expired',
        startDate: d(240),
        renewalDate: d(10)
      },
      {
        id: 8,
        name: 'Lakeview Enclave',
        city: 'Ahmedabad',
        address: 'SG Highway, Ahmedabad',
        units: 110,
        adminName: 'Mehul Shah',
        adminEmail: 'shah.m@lakeviewahmedabad.com',
        adminPhone: '+91 98250 88990',
        plan: 'Basic',
        monthlyPrice: 999,
        billingCycle: 'Monthly',
        status: 'Suspended',
        startDate: d(210),
        renewalDate: d(15)
      }
    ]);

    // 8. Simulated Billing & Payment Records
    this.set('payments', [
      { id: 'INV-2026-9041', societyId: 1, societyName: 'Greenview Residency', plan: 'Basic', amount: 999, date: d(12), method: 'UPI Auto-Pay', status: 'Paid', notes: 'Monthly recurring subscription' },
      { id: 'INV-2026-9039', societyId: 2, societyName: 'Skyline Pinnacle Towers', plan: 'Premium', amount: 2499, date: d(18), method: 'Corporate NetBanking', status: 'Paid', notes: 'Monthly recurring subscription' },
      { id: 'INV-2026-9035', societyId: 3, societyName: 'Palm Meadows Enclave', plan: 'Premium', amount: 2499, date: d(5), method: 'Credit Card Auto-Debit', status: 'Paid', notes: 'Monthly recurring subscription' },
      { id: 'INV-2026-9028', societyId: 4, societyName: 'Silver Oak Heights', plan: 'Basic', amount: 999, date: d(25), method: 'UPI Auto-Pay', status: 'Paid', notes: 'Monthly recurring subscription' },
      { id: 'INV-2026-9022', societyId: 5, societyName: 'Grand Orchids Condominium', plan: 'Enterprise', amount: 5999, date: d(20), method: 'NEFT / RTGS Transfer', status: 'Paid', notes: 'Quarterly custom recurring enterprise tranche' },
      { id: 'INV-2026-9018', societyId: 6, societyName: 'Harmony Meadows', plan: 'Premium', amount: 2499, date: d(10), method: 'Corporate Card', status: 'Paid', notes: 'Monthly recurring subscription' },
      { id: 'INV-2026-8991', societyId: 7, societyName: 'Riverside Apartments', plan: 'Basic', amount: 999, date: d(40), method: 'UPI Auto-Pay', status: 'Paid', notes: 'Previous period billing' }
    ]);

    // 9. Guided Workflow Tour State (1 to 10)
    this.set('tour', {
      step: 1,
      completed: false,
      active: true
    });

    this.set('seeded', true);
  },

  reset() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this.PREFIX) && k !== this.PREFIX + 'session')
      .forEach(k => localStorage.removeItem(k));
    this.seed(true);
  }
};

// Auto seed on initial load
if (typeof window !== 'undefined') {
  DB.seed();
}
