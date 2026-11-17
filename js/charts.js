// AptEase - Lightweight Vanilla SVG Chart Engine
// Fully responsive, zero external dependencies, crisp vector graphics

const Charts = {
  // Format currency in Indian numbering format (₹)
  formatCurrency(val) {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  },

  // 1. Render Monthly Revenue Trend (Area + Line SVG)
  renderRevenueTrend(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const rev = DB.calcRevenue();
    const currentMRR = rev.mrr;

    // Historical model simulated leading up to current dynamic MRR
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    // Scale history proportionally to current MRR
    const data = [
      Math.round(currentMRR * 0.62),
      Math.round(currentMRR * 0.74),
      Math.round(currentMRR * 0.82),
      Math.round(currentMRR * 0.88),
      Math.round(currentMRR * 0.94),
      currentMRR
    ];

    const width = 640;
    const height = 220;
    const padX = 50;
    const padY = 28;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    const maxVal = Math.max(...data, currentMRR * 1.15) || 20000;
    const minVal = 0;

    const points = data.map((v, i) => {
      const x = padX + (i / (data.length - 1)) * chartW;
      const y = padY + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;
      return { x, y, val: v, label: months[i] };
    });

    // Create SVG path
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(padY + chartH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padY + chartH).toFixed(1)} Z`;

    // Horizontal grid lines
    const gridLines = [0, 0.33, 0.66, 1].map(ratio => {
      const y = padY + chartH * (1 - ratio);
      const val = Math.round(minVal + ratio * (maxVal - minVal));
      return `
        <line x1="${padX}" y1="${y}" x2="${width - padX}" y2="${y}" stroke="#EBE8F5" stroke-dasharray="3,3" stroke-width="1" />
        <text x="${padX - 8}" y="${y + 4}" fill="#8C88A8" font-size="10" font-family="Inter, sans-serif" text-anchor="end">${this.formatCurrency(val)}</text>
      `;
    }).join('');

    // X-axis labels and points
    const pointElements = points.map((p, i) => {
      const isCurrent = i === points.length - 1;
      return `
        <g class="chart-point" data-val="${this.formatCurrency(p.val)}" data-month="${p.label}">
          <line x1="${p.x}" y1="${padY}" x2="${p.x}" y2="${padY + chartH}" stroke="#F4F2FA" stroke-width="1" />
          <circle cx="${p.x}" cy="${p.y}" r="${isCurrent ? 6 : 4.5}" fill="${isCurrent ? '#7654D6' : '#FFFFFF'}" stroke="#7654D6" stroke-width="2.5" />
          <text x="${p.x}" y="${height - 6}" fill="${isCurrent ? '#7654D6' : '#6B6882'}" font-weight="${isCurrent ? '700' : '500'}" font-size="11" font-family="Inter, sans-serif" text-anchor="middle">${p.label}</text>
        </g>
      `;
    }).join('');

    el.innerHTML = `
      <div style="position:relative; width:100%;">
        <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:auto; overflow:visible; display:block;">
          <defs>
            <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#7654D6" stop-opacity="0.32" />
              <stop offset="100%" stop-color="#7654D6" stop-opacity="0.01" />
            </linearGradient>
          </defs>
          ${gridLines}
          <path d="${areaD}" fill="url(#mrrGrad)" />
          <path d="${pathD}" fill="none" stroke="#7654D6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          ${pointElements}
        </svg>
        <div id="chart-tooltip" style="position:absolute; display:none; background:#252238; color:#fff; padding:6px 10px; border-radius:6px; font-size:11px; font-weight:600; pointer-events:none; z-index:10; box-shadow:0 4px 12px rgba(0,0,0,0.15); transform:translate(-50%, -120%); white-space:nowrap;"></div>
      </div>
    `;

    // Tooltip interactivity
    const tooltip = el.querySelector('#chart-tooltip');
    const svgPoints = el.querySelectorAll('.chart-point');
    svgPoints.forEach(pt => {
      pt.onmouseenter = (e) => {
        const val = pt.dataset.val;
        const month = pt.dataset.month;
        tooltip.innerHTML = `<span style="color:#A78BFA">${month}:</span> ${val} MRR`;
        tooltip.style.display = 'block';
        const rect = pt.getBoundingClientRect();
        const parentRect = el.getBoundingClientRect();
        tooltip.style.left = (rect.left - parentRect.left + rect.width / 2) + 'px';
        tooltip.style.top = (rect.top - parentRect.top) + 'px';
      };
      pt.onmouseleave = () => {
        tooltip.style.display = 'none';
      };
    });
  },

  // 2. Render Subscription Plan Distribution (Donut SVG)
  renderPlanDistribution(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const rev = DB.calcRevenue();
    const { planBreakdown, activeCount } = rev;

    const plans = [
      { key: 'basic', label: 'Basic (₹999)', count: planBreakdown.basic.count, revenue: planBreakdown.basic.revenue, color: '#6366F1' },
      { key: 'premium', label: 'Premium (₹2,499)', count: planBreakdown.premium.count, revenue: planBreakdown.premium.revenue, color: '#7654D6' },
      { key: 'enterprise', label: 'Enterprise (Custom)', count: planBreakdown.enterprise.count, revenue: planBreakdown.enterprise.revenue, color: '#0EA5E9' }
    ];

    const total = activeCount || 1;
    let accumulatedAngle = 0;
    const size = 180;
    const r = 68;
    const cx = size / 2;
    const cy = size / 2;
    const strokeWidth = 26;
    const circumference = 2 * Math.PI * r;

    const segments = plans.map(p => {
      const pct = p.count / total;
      const strokeLength = pct * circumference;
      const strokeDashoffset = -accumulatedAngle * circumference;
      accumulatedAngle += pct;
      return `
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${p.color}" stroke-width="${strokeWidth}"
          stroke-dasharray="${strokeLength} ${circumference - strokeLength}"
          stroke-dashoffset="${strokeDashoffset}"
          transform="rotate(-90 ${cx} ${cy})"
          style="transition: stroke-dasharray 0.5s ease;" />
      `;
    }).join('');

    const legendHtml = plans.map(p => {
      const share = Math.round((p.count / total) * 100) || 0;
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:7px 0; border-bottom:1px solid #F1EEF8;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="width:10px; height:10px; border-radius:50%; background:${p.color}; display:inline-block;"></span>
            <span style="font-weight:600; font-size:13px; color:#252238;">${p.label}</span>
          </div>
          <div style="text-align:right;">
            <span style="font-weight:700; font-size:13px; color:#252238;">${p.count} soc.</span>
            <span style="color:#6B6882; font-size:11px; margin-left:6px;">(${share}%)</span>
            <div style="font-size:11px; color:#7654D6; font-weight:600;">${this.formatCurrency(p.revenue)}/mo</div>
          </div>
        </div>
      `;
    }).join('');

    el.innerHTML = `
      <div style="display:grid; grid-template-columns: 180px 1fr; gap:20px; align-items:center;">
        <div style="position:relative; width:180px; height:180px; margin:auto;">
          <svg viewBox="0 0 ${size} ${size}" style="width:100%; height:100%; overflow:visible;">
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#F1EEF8" stroke-width="${strokeWidth}" />
            ${segments}
          </svg>
          <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none;">
            <span style="font-size:22px; font-weight:700; color:#252238;">${activeCount}</span>
            <span style="font-size:11px; font-weight:600; color:#6B6882; text-transform:uppercase; letter-spacing:0.5px;">Active Subs</span>
          </div>
        </div>
        <div style="padding-right:8px;">
          ${legendHtml}
        </div>
      </div>
    `;
  },

  // 3. Render Revenue Mix Progress Bar
  renderRevenueMix(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const rev = DB.calcRevenue();
    const totalRev = rev.mrr || 1;
    const { planBreakdown } = rev;

    const basicPct = Math.round((planBreakdown.basic.revenue / totalRev) * 100);
    const premPct = Math.round((planBreakdown.premium.revenue / totalRev) * 100);
    const entPct = 100 - basicPct - premPct;

    el.innerHTML = `
      <div style="margin-top:14px;">
        <div style="display:flex; height:10px; border-radius:5px; overflow:hidden; background:#EBE8F5;">
          <div style="width:${basicPct}%; background:#6366F1;" title="Basic: ${basicPct}%"></div>
          <div style="width:${premPct}%; background:#7654D6;" title="Premium: ${premPct}%"></div>
          <div style="width:${entPct}%; background:#0EA5E9;" title="Enterprise: ${entPct}%"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:11px; color:#6B6882; margin-top:8px;">
          <span>Basic: <strong style="color:#6366F1;">${basicPct}%</strong> (${this.formatCurrency(planBreakdown.basic.revenue)})</span>
          <span>Premium: <strong style="color:#7654D6;">${premPct}%</strong> (${this.formatCurrency(planBreakdown.premium.revenue)})</span>
          <span>Enterprise: <strong style="color:#0EA5E9;">${entPct}%</strong> (${this.formatCurrency(planBreakdown.enterprise.revenue)})</span>
        </div>
      </div>
    `;
  }
};
