/**
 * Rubber Manager - Pure Vanilla JavaScript Application Logic
 * Offline First, LocalStorage persistence, zero external dependencies.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'rubber_manager_app_data_v1';

  // Realistic Initial Sample Dataset for Rubber Business
  const DEFAULT_DATA = {
    user: {
      name: 'Hanan',
      initials: 'HA',
      businessName: 'Rubber Manager',
      currency: '₹'
    },
    employees: [
      { id: 'emp_1', name: 'Rahman', phone: '+91 98471 23456', role: 'Tapping Worker' },
      { id: 'emp_2', name: 'Basheer', phone: '+91 98472 34567', role: 'Latex Collection & Processing' },
      { id: 'emp_3', name: 'Shameer', phone: '+91 98473 45678', role: 'Sheet Pressing & Smoking' }
    ],
    income: [
      { id: 'inc_1', date: '2026-10-05', amount: 34500, source: 'AP Rubber Traders', note: 'Grade 1 RSS sheet lot sale (85 kg)' },
      { id: 'inc_2', date: '2026-10-04', amount: 15500, source: 'Kerala Latex Dealers', note: 'Centrifuged latex lot 80L' },
      { id: 'inc_3', date: '2026-10-01', amount: 28000, source: 'Malabar Rubber Depot', note: 'Scrap rubber & dry cup lumps' }
    ],
    expenses: [
      { id: 'exp_1', type: 'employee', employeeId: 'emp_1', date: '2026-10-05', amount: 2500, reason: 'Morning tapping 500 trees', note: 'Paid in cash' },
      { id: 'exp_2', type: 'employee', employeeId: 'emp_1', date: '2026-10-03', amount: 3000, reason: 'Tapping & cup cleaning', note: 'Full settlement' },
      { id: 'exp_3', type: 'employee', employeeId: 'emp_1', date: '2026-10-01', amount: 3000, reason: 'Block 2 tree tapping', note: '' },
      { id: 'exp_4', type: 'employee', employeeId: 'emp_2', date: '2026-10-04', amount: 3200, reason: 'Latex barrel collection & weigh-in', note: 'Direct payment' },
      { id: 'exp_5', type: 'employee', employeeId: 'emp_2', date: '2026-10-02', amount: 3000, reason: 'Estate collection work', note: '' },
      { id: 'exp_6', type: 'employee', employeeId: 'emp_3', date: '2026-10-04', amount: 2100, reason: 'Roller machine sheet pressing', note: 'Evening pay' },
      { id: 'exp_7', type: 'employee', employeeId: 'emp_3', date: '2026-10-02', amount: 2000, reason: 'Smoke house firewood stacking', note: '' },
      
      { id: 'exp_8', type: 'travel', person: 'Basheer', date: '2026-10-05', amount: 450, route: 'Alanallur → Mannarkkad', purpose: 'Business work', note: 'Latex sample delivery to factory' },
      { id: 'exp_9', type: 'travel', person: 'Rahman', date: '2026-10-03', amount: 300, route: 'Estate → Town Market', purpose: 'Tapping knife sharpening', note: 'Auto rickshaw return fare' },
      
      { id: 'exp_10', type: 'goods', item: 'Formic Acid (Coagulant)', date: '2026-10-04', amount: 3200, supplier: 'Kisan Agri Agro Supplies', note: '2 large cans for latex coagulation' },
      { id: 'exp_11', type: 'goods', item: 'Rubber Tapping Knives', date: '2026-10-02', amount: 1800, supplier: 'National Hardware & Tools', note: 'Set of 3 precision curved blades' },
      { id: 'exp_12', type: 'goods', item: 'Collection Cups & Wires', date: '2026-10-01', amount: 3000, supplier: 'Malabar Plastics', note: '500 plastic cups & steel rings' },
      
      { id: 'exp_13', type: 'other', item: 'Sugar & Tea Powder for Workers', date: '2026-10-05', amount: 350, category: 'Refreshments', note: 'Morning tapping refreshment' },
      { id: 'exp_14', type: 'other', item: 'LED Bulbs for Smoke House', date: '2026-10-03', amount: 450, category: 'Utilities', note: '2 x 15W high heat resistant bulbs' },
      { id: 'exp_15', type: 'other', item: 'Cleaning Floor Bleach & Detergent', date: '2026-10-02', amount: 300, category: 'Cleaning', note: 'Processing shed hygiene wash' },
      { id: 'exp_16', type: 'other', item: 'Estate SIM Recharge', date: '2026-10-01', amount: 400, category: 'Phone & Comm', note: 'Monthly data & calls' }
    ]
  };

  // State
  let appState = loadState();
  let currentActiveTab = 'home';
  let activeEmployeeDetailId = null;
  let currentReportsPeriod = 'all'; // 'today', 'this_month', 'all'
  let currentDashboardPeriod = 'today'; // 'today', 'this_month', 'all'

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.employees && parsed.expenses && parsed.income) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    }
    saveStateToStorage(DEFAULT_DATA);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  function saveStateToStorage(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
      showToast('Storage quota exceeded or unavailable', 'error');
    }
  }

  function saveState() {
    saveStateToStorage(appState);
  }

  // Helpers
  function generateId(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
  }

  function getTodayDateString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatCurrency(amount) {
    const num = Number(amount) || 0;
    const curr = (appState.user && appState.user.currency) || '₹';
    return curr + num.toLocaleString('en-IN');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    } catch (e) {}
    return dateStr;
  }

  function getInitials(name) {
    if (!name) return 'RM';
    const clean = name.trim().split(' ');
    if (clean.length === 1) {
      return clean[0].substring(0, 2).toUpperCase();
    }
    return (clean[0][0] + clean[clean.length - 1][0]).toUpperCase();
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  function isSameDay(dateStr1, dateStr2) {
    return dateStr1 === dateStr2;
  }

  function isThisMonth(dateStr) {
    if (!dateStr) return false;
    const today = new Date();
    const curYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    return dateStr.startsWith(curYearMonth);
  }

  // Calculations
  function calculateMetrics(period = 'today') {
    const todayStr = getTodayDateString();

    const filteredIncome = appState.income.filter(item => {
      if (period === 'today') return isSameDay(item.date, todayStr);
      if (period === 'this_month') return isThisMonth(item.date);
      return true;
    });

    const filteredExpenses = appState.expenses.filter(item => {
      if (period === 'today') return isSameDay(item.date, todayStr);
      if (period === 'this_month') return isThisMonth(item.date);
      return true;
    });

    const totalIncome = filteredIncome.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const netBalance = totalIncome - totalExpenses;

    // Breakdown
    const empExpenses = filteredExpenses
      .filter(item => item.type === 'employee')
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const travelExpenses = filteredExpenses
      .filter(item => item.type === 'travel')
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const goodsExpenses = filteredExpenses
      .filter(item => item.type === 'goods')
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const otherExpenses = filteredExpenses
      .filter(item => item.type === 'other')
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      empExpenses,
      travelExpenses,
      goodsExpenses,
      otherExpenses,
      employeeCount: appState.employees.length
    };
  }

  function getEmployeeStats(empId) {
    const payments = appState.expenses.filter(e => e.type === 'employee' && e.employeeId === empId);
    const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    return {
      paymentCount: payments.length,
      totalPaid: totalPaid,
      payments: payments.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    };
  }

  // Toast System
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    
    // Inline check or info SVG
    const iconSvg = `<svg class="svg-icon toast-icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    
    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 2800);
  }

  // Modal / Bottom Sheet Controller
  function openModal(modalId) {
    closeAllModals();
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
  }

  // Confirm Dialog Controller
  let pendingConfirmAction = null;
  function showConfirmDialog(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmTitle');
    const descEl = document.getElementById('confirmDesc');
    const btnConfirm = document.getElementById('confirmActionBtn');

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = message;

    pendingConfirmAction = onConfirm;
    openModal('confirmModal');
  }

  // Navigation & View Routing
  function switchTab(tabName) {
    currentActiveTab = tabName;

    // Update Bottom Nav Items
    document.querySelectorAll('.nav-item').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(section => {
      section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(`view-${tabName}`);
    if (targetSection) {
      targetSection.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Render current view content
    renderCurrentView();
  }

  function openEmployeeDetails(empId) {
    activeEmployeeDetailId = empId;
    switchTab('employee-details');
  }

  // Renderers
  function renderCurrentView() {
    renderGreeting();
    switch (currentActiveTab) {
      case 'home':
        renderDashboard();
        break;
      case 'employees':
        renderEmployeesList();
        break;
      case 'employee-details':
        renderEmployeeDetailsPage();
        break;
      case 'travel':
        renderTravelExpenses();
        break;
      case 'goods':
        renderGoodsExpenses();
        break;
      case 'other':
        renderOtherExpenses();
        break;
      case 'income':
        renderIncomeView();
        break;
      case 'money':
        renderMoneyHub();
        break;
      case 'reports':
        renderReports();
        break;
    }
  }

  function renderGreeting() {
    const greetingEl = document.getElementById('dashGreeting');
    const nameEl = document.getElementById('dashUserName');
    const userInitialsEl = document.getElementById('headerUserInitials');

    if (greetingEl) greetingEl.textContent = getGreeting();
    if (nameEl) nameEl.textContent = (appState.user && appState.user.name) || 'Hanan';
    if (userInitialsEl) userInitialsEl.textContent = (appState.user && appState.user.initials) || 'HA';
  }

  function renderDashboard() {
    const metrics = calculateMetrics(currentDashboardPeriod);

    // Hero Net Balance Card
    const periodLabelEl = document.getElementById('dashNetPeriodLabel');
    if (periodLabelEl) {
      const pText = currentDashboardPeriod === 'today' ? 'TODAY' : (currentDashboardPeriod === 'this_month' ? 'THIS MONTH' : 'ALL TIME');
      periodLabelEl.textContent = `NET BALANCE · ${pText}`;
    }

    const netAmountEl = document.getElementById('dashNetAmount');
    if (netAmountEl) {
      const curr = (appState.user && appState.user.currency) || '₹';
      const formattedNum = Math.abs(metrics.netBalance).toLocaleString('en-IN');
      const prefix = metrics.netBalance < 0 ? '-' : '';
      netAmountEl.innerHTML = `<span class="currency">${prefix}${curr}</span>${formattedNum}`;
    }

    const heroIncEl = document.getElementById('dashHeroIncome');
    if (heroIncEl) heroIncEl.textContent = formatCurrency(metrics.totalIncome);

    const heroExpEl = document.getElementById('dashHeroExpenses');
    if (heroExpEl) heroExpEl.textContent = formatCurrency(metrics.totalExpenses);

    const heroEmpEl = document.getElementById('dashHeroEmployee');
    if (heroEmpEl) heroEmpEl.textContent = formatCurrency(metrics.empExpenses);

    // Overview 4 Cards
    const overInc = document.getElementById('dashOverviewIncome');
    if (overInc) overInc.textContent = formatCurrency(metrics.totalIncome);

    const overExp = document.getElementById('dashOverviewExpenses');
    if (overExp) overExp.textContent = formatCurrency(metrics.totalExpenses);

    const overEmp = document.getElementById('dashOverviewEmpExp');
    if (overEmp) overEmp.textContent = formatCurrency(metrics.empExpenses);

    const overCount = document.getElementById('dashOverviewEmpCount');
    if (overCount) overCount.textContent = metrics.employeeCount;

    // Manage Expenses Category Summary Totals (All time or Period)
    const allMetrics = calculateMetrics('all');
    const navEmpTotal = document.getElementById('navCardEmpTotal');
    if (navEmpTotal) navEmpTotal.textContent = formatCurrency(allMetrics.empExpenses);

    const navTravelTotal = document.getElementById('navCardTravelTotal');
    if (navTravelTotal) navTravelTotal.textContent = formatCurrency(allMetrics.travelExpenses);

    const navGoodsTotal = document.getElementById('navCardGoodsTotal');
    if (navGoodsTotal) navGoodsTotal.textContent = formatCurrency(allMetrics.goodsExpenses);

    const navOtherTotal = document.getElementById('navCardOtherTotal');
    if (navOtherTotal) navOtherTotal.textContent = formatCurrency(allMetrics.otherExpenses);

    // Recent Activities list on Dashboard
    renderDashboardRecentList();
  }

  function renderDashboardRecentList() {
    const listEl = document.getElementById('dashRecentList');
    if (!listEl) return;

    // Merge recent expenses and income
    const allItems = [];

    appState.income.forEach(inc => {
      allItems.push({
        id: inc.id,
        isIncome: true,
        type: 'income',
        title: inc.source || 'Rubber Income',
        sub: inc.note || 'Business Income',
        amount: inc.amount,
        date: inc.date
      });
    });

    appState.expenses.forEach(exp => {
      let title = '';
      let sub = '';
      if (exp.type === 'employee') {
        const emp = appState.employees.find(e => e.id === exp.employeeId);
        title = emp ? emp.name : 'Employee Payment';
        sub = exp.reason || (emp ? emp.role : 'Work payment');
      } else if (exp.type === 'travel') {
        title = `${exp.person} · ${exp.route || 'Trip'}`;
        sub = exp.purpose || 'Travel Expense';
      } else if (exp.type === 'goods') {
        title = exp.item || 'Goods Purchase';
        sub = exp.supplier ? `Supplier: ${exp.supplier}` : 'Purchase';
      } else if (exp.type === 'other') {
        title = exp.item || 'General Expense';
        sub = exp.category || 'Other Expense';
      }

      allItems.push({
        id: exp.id,
        isIncome: false,
        type: exp.type,
        title: title,
        sub: sub,
        amount: exp.amount,
        date: exp.date
      });
    });

    allItems.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const topRecent = allItems.slice(0, 5);

    if (topRecent.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state" style="padding: 24px 16px;">
          <div class="empty-icon-wrap">
            <svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
          </div>
          <div class="empty-title">No transactions recorded yet</div>
          <div class="empty-desc">Tap the center + button to record your first income or expense.</div>
        </div>
      `;
      return;
    }

    let html = '';
    topRecent.forEach(item => {
      let badgeClass = item.type;
      let badgeContent = '';

      if (item.isIncome) {
        badgeContent = `<svg class="svg-icon" viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;
      } else if (item.type === 'employee') {
        badgeContent = getInitials(item.title);
      } else if (item.type === 'travel') {
        badgeContent = `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1L2 12v4a2 2 0 0 0 2 2h1"></path><circle cx="6.5" cy="16.5" r="2.5"></circle><circle cx="16.5" cy="16.5" r="2.5"></circle></svg>`;
      } else if (item.type === 'goods') {
        badgeContent = `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`;
      } else {
        badgeContent = `<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
      }

      const amtSign = item.isIncome ? '+' : '-';
      const amtClass = item.isIncome ? 'inc' : 'exp';

      html += `
        <div class="item-card">
          <div class="item-card-left">
            <div class="avatar-badge ${badgeClass}">${badgeContent}</div>
            <div class="item-main-info">
              <span class="item-title">${escapeHtml(item.title)}</span>
              <span class="item-subtitle">${escapeHtml(item.sub)}</span>
            </div>
          </div>
          <div class="item-card-right">
            <span class="item-amount ${amtClass}">${amtSign}${formatCurrency(item.amount)}</span>
            <span class="item-date">${formatDate(item.date)}</span>
          </div>
        </div>
      `;
    });

    listEl.innerHTML = html;
  }

  // Employees Page Renderer
  function renderEmployeesList() {
    const listEl = document.getElementById('employeesListContainer');
    const searchVal = (document.getElementById('employeeSearchInput')?.value || '').toLowerCase();
    if (!listEl) return;

    let emps = appState.employees.filter(e => {
      if (!searchVal) return true;
      return e.name.toLowerCase().includes(searchVal) || (e.role && e.role.toLowerCase().includes(searchVal));
    });

    if (emps.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon-wrap">
            <svg class="svg-icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="empty-title">No employees found</div>
          <div class="empty-desc">Add your rubber tappers, collectors, and smoke house workers to track payments.</div>
          <button class="primary-btn" onclick="RubberApp.openAddEmployeeModal()">+ Add Employee</button>
        </div>
      `;
      return;
    }

    let html = '';
    emps.forEach(emp => {
      const stats = getEmployeeStats(emp.id);
      const initials = getInitials(emp.name);

      html += `
        <div class="item-card" onclick="RubberApp.openEmployeeDetails('${emp.id}')">
          <div class="item-card-left">
            <div class="avatar-badge emp">${initials}</div>
            <div class="item-main-info">
              <span class="item-title">${escapeHtml(emp.name)}</span>
              <span class="item-subtitle">
                <span>${escapeHtml(emp.role || 'Worker')}</span>
                <span>·</span>
                <span>${stats.paymentCount} ${stats.paymentCount === 1 ? 'payment' : 'payments'}</span>
              </span>
            </div>
          </div>
          <div class="item-card-right">
            <span class="item-amount exp">${formatCurrency(stats.totalPaid)}</span>
            <span class="item-date" style="color: var(--primary-700); font-weight:600;">View History →</span>
          </div>
        </div>
      `;
    });

    listEl.innerHTML = html;
  }

  // Employee Detail Page Renderer
  function renderEmployeeDetailsPage() {
    const emp = appState.employees.find(e => e.id === activeEmployeeDetailId);
    if (!emp) {
      switchTab('employees');
      return;
    }

    const stats = getEmployeeStats(emp.id);

    // Profile Card
    const avatarEl = document.getElementById('empDetailAvatar');
    const nameEl = document.getElementById('empDetailName');
    const roleEl = document.getElementById('empDetailRole');
    const phoneEl = document.getElementById('empDetailPhone');
    const totalPaidEl = document.getElementById('empDetailTotalPaid');
    const paymentCountEl = document.getElementById('empDetailCount');

    if (avatarEl) avatarEl.textContent = getInitials(emp.name);
    if (nameEl) nameEl.textContent = emp.name;
    if (roleEl) roleEl.textContent = emp.role || 'Rubber Worker';
    if (phoneEl) {
      if (emp.phone) {
        phoneEl.innerHTML = `<svg class="svg-icon" style="width:14px;height:14px;" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> ${escapeHtml(emp.phone)}`;
      } else {
        phoneEl.innerHTML = `<span style="color:var(--text-subtle)">No phone number recorded</span>`;
      }
    }
    if (totalPaidEl) totalPaidEl.textContent = formatCurrency(stats.totalPaid);
    if (paymentCountEl) paymentCountEl.textContent = `${stats.paymentCount} payments`;

    // Payment History List
    const historyListEl = document.getElementById('empPaymentHistoryList');
    if (!historyListEl) return;

    if (stats.payments.length === 0) {
      historyListEl.innerHTML = `
        <div class="empty-state" style="padding: 24px 16px;">
          <div class="empty-icon-wrap">
            <svg class="svg-icon" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="empty-title">No payments recorded yet</div>
          <div class="empty-desc">Record actual work payment made to ${escapeHtml(emp.name)}.</div>
          <button class="primary-btn" onclick="RubberApp.openAddEmpPaymentModal('${emp.id}')">+ Add Payment</button>
        </div>
      `;
      return;
    }

    let html = '';
    stats.payments.forEach(p => {
      html += `
        <div class="history-item">
          <div class="history-info">
            <span class="history-reason">${escapeHtml(p.reason || 'Payment')}</span>
            <span class="history-date">${formatDate(p.date)}</span>
            ${p.note ? `<span class="history-note">“${escapeHtml(p.note)}”</span>` : ''}
          </div>
          <div class="history-actions">
            <span class="history-amount">${formatCurrency(p.amount)}</span>
            <button class="del-small-btn" title="Delete Payment" onclick="RubberApp.confirmDeleteExpense('${p.id}', 'payment of ${formatCurrency(p.amount)}')">
              <svg class="svg-icon" style="width:16px;height:16px;" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    });

    historyListEl.innerHTML = html;
  }

  // Travel Expenses View
  function renderTravelExpenses() {
    const listEl = document.getElementById('travelListContainer');
    const searchVal = (document.getElementById('travelSearchInput')?.value || '').toLowerCase();
    if (!listEl) return;

    let items = appState.expenses.filter(e => e.type === 'travel');

    if (searchVal) {
      items = items.filter(e => 
        (e.person && e.person.toLowerCase().includes(searchVal)) ||
        (e.route && e.route.toLowerCase().includes(searchVal)) ||
        (e.purpose && e.purpose.toLowerCase().includes(searchVal))
      );
    }

    items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const totalTravel = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalEl = document.getElementById('travelTotalHeader');
    if (totalEl) totalEl.textContent = formatCurrency(totalTravel);

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon-wrap" style="background:var(--travel-bg); color:var(--travel-color);">
            <svg class="svg-icon" viewBox="0 0 24 24"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1L2 12v4a2 2 0 0 0 2 2h1"></path><circle cx="6.5" cy="16.5" r="2.5"></circle><circle cx="16.5" cy="16.5" r="2.5"></circle></svg>
          </div>
          <div class="empty-title">No travel expenses</div>
          <div class="empty-desc">Record trips, road routes, transport fares, and fuel for rubber estate work.</div>
          <button class="primary-btn" onclick="RubberApp.openAddTravelModal()">+ Add Travel</button>
        </div>
      `;
      return;
    }

    let html = '';
    items.forEach(t => {
      html += `
        <div class="item-card">
          <div class="item-card-left">
            <div class="avatar-badge travel">
              <svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
            </div>
            <div class="item-main-info">
              <span class="item-title">${escapeHtml(t.person)}</span>
              <span class="item-subtitle">
                <span style="font-weight:600; color:var(--text-main);">${escapeHtml(t.route || 'Route')}</span>
                ${t.purpose ? `<span>· ${escapeHtml(t.purpose)}</span>` : ''}
              </span>
              ${t.note ? `<span class="item-subtitle" style="font-style:italic; font-size:11px;">“${escapeHtml(t.note)}”</span>` : ''}
            </div>
          </div>
          <div class="item-card-right">
            <span class="item-amount exp">${formatCurrency(t.amount)}</span>
            <span class="item-date">${formatDate(t.date)}</span>
            <button class="del-small-btn" style="margin-top:4px;" title="Delete" onclick="RubberApp.confirmDeleteExpense('${t.id}', 'travel expense of ${formatCurrency(t.amount)}')">
              <svg class="svg-icon" style="width:14px;height:14px;" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    });

    listEl.innerHTML = html;
  }

  // Goods / Purchases View
  function renderGoodsExpenses() {
    const listEl = document.getElementById('goodsListContainer');
    const searchVal = (document.getElementById('goodsSearchInput')?.value || '').toLowerCase();
    if (!listEl) return;

    let items = appState.expenses.filter(e => e.type === 'goods');

    if (searchVal) {
      items = items.filter(e => 
        (e.item && e.item.toLowerCase().includes(searchVal)) ||
        (e.supplier && e.supplier.toLowerCase().includes(searchVal))
      );
    }

    items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const totalGoods = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalEl = document.getElementById('goodsTotalHeader');
    if (totalEl) totalEl.textContent = formatCurrency(totalGoods);

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon-wrap" style="background:var(--goods-bg); color:var(--goods-color);">
            <svg class="svg-icon" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          </div>
          <div class="empty-title">No goods or purchases</div>
          <div class="empty-desc">Record purchases of rubber acid, knives, collection cups, packing materials, etc.</div>
          <button class="primary-btn" onclick="RubberApp.openAddGoodsModal()">+ Add Purchase</button>
        </div>
      `;
      return;
    }

    let html = '';
    items.forEach(g => {
      html += `
        <div class="item-card">
          <div class="item-card-left">
            <div class="avatar-badge goods">
              <svg class="svg-icon" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <div class="item-main-info">
              <span class="item-title">${escapeHtml(g.item)}</span>
              <span class="item-subtitle">
                <span>Supplier: ${escapeHtml(g.supplier || 'Direct')}</span>
              </span>
              ${g.note ? `<span class="item-subtitle" style="font-style:italic; font-size:11px;">“${escapeHtml(g.note)}”</span>` : ''}
            </div>
          </div>
          <div class="item-card-right">
            <span class="item-amount exp">${formatCurrency(g.amount)}</span>
            <span class="item-date">${formatDate(g.date)}</span>
            <button class="del-small-btn" style="margin-top:4px;" title="Delete" onclick="RubberApp.confirmDeleteExpense('${g.id}', '${escapeHtml(g.item)}')">
              <svg class="svg-icon" style="width:14px;height:14px;" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    });

    listEl.innerHTML = html;
  }

  // Other Expenses View
  function renderOtherExpenses() {
    const listEl = document.getElementById('otherListContainer');
    const searchVal = (document.getElementById('otherSearchInput')?.value || '').toLowerCase();
    const catVal = document.getElementById('otherCategoryFilter')?.value || '';
    if (!listEl) return;

    let items = appState.expenses.filter(e => e.type === 'other');

    if (searchVal) {
      items = items.filter(e => 
        (e.item && e.item.toLowerCase().includes(searchVal)) ||
        (e.category && e.category.toLowerCase().includes(searchVal)) ||
        (e.note && e.note.toLowerCase().includes(searchVal))
      );
    }

    if (catVal) {
      items = items.filter(e => e.category === catVal);
    }

    items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const totalOther = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalEl = document.getElementById('otherTotalHeader');
    if (totalEl) totalEl.textContent = formatCurrency(totalOther);

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon-wrap" style="background:var(--other-bg); color:var(--other-color);">
            <svg class="svg-icon" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
          </div>
          <div class="empty-title">No general expenses</div>
          <div class="empty-desc">Record tea/sugar for workers, LED bulbs, repairs, cleaning, utilities, etc.</div>
          <button class="primary-btn" onclick="RubberApp.openAddOtherModal()">+ Add Expense</button>
        </div>
      `;
      return;
    }

    let html = '';
    items.forEach(o => {
      html += `
        <div class="item-card">
          <div class="item-card-left">
            <div class="avatar-badge other">
              <svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            </div>
            <div class="item-main-info">
              <span class="item-title">${escapeHtml(o.item)}</span>
              <span class="item-subtitle">
                <span class="item-meta-tag">${escapeHtml(o.category || 'General')}</span>
                ${o.note ? `<span>${escapeHtml(o.note)}</span>` : ''}
              </span>
            </div>
          </div>
          <div class="item-card-right">
            <span class="item-amount exp">${formatCurrency(o.amount)}</span>
            <span class="item-date">${formatDate(o.date)}</span>
            <button class="del-small-btn" style="margin-top:4px;" title="Delete" onclick="RubberApp.confirmDeleteExpense('${o.id}', '${escapeHtml(o.item)}')">
              <svg class="svg-icon" style="width:14px;height:14px;" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    });

    listEl.innerHTML = html;
  }

  // Money Hub (Unified Cash Flow Tab)
  function renderMoneyHub() {
    renderIncomeView();
  }

  // Income View Renderer
  function renderIncomeView() {
    const listEl = document.getElementById('incomeListContainer');
    const searchVal = (document.getElementById('incomeSearchInput')?.value || '').toLowerCase();
    if (!listEl) return;

    let items = appState.income;

    if (searchVal) {
      items = items.filter(e => 
        (e.source && e.source.toLowerCase().includes(searchVal)) ||
        (e.note && e.note.toLowerCase().includes(searchVal))
      );
    }

    items = [...items].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const totalInc = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalEl = document.getElementById('incomeTotalHeader');
    if (totalEl) totalEl.textContent = formatCurrency(totalInc);

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon-wrap" style="background:var(--income-bg); color:var(--income-color);">
            <svg class="svg-icon" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="empty-title">No income records</div>
          <div class="empty-desc">Record sales of rubber sheets, field latex, cup lump, scrap rubber, etc.</div>
          <button class="primary-btn" onclick="RubberApp.openAddIncomeModal()">+ Add Income</button>
        </div>
      `;
      return;
    }

    let html = '';
    items.forEach(inc => {
      html += `
        <div class="item-card">
          <div class="item-card-left">
            <div class="avatar-badge income">
              <svg class="svg-icon" viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
            </div>
            <div class="item-main-info">
              <span class="item-title">${escapeHtml(inc.source || 'Rubber Sale')}</span>
              <span class="item-subtitle">${escapeHtml(inc.note || 'Business Income')}</span>
            </div>
          </div>
          <div class="item-card-right">
            <span class="item-amount inc">+${formatCurrency(inc.amount)}</span>
            <span class="item-date">${formatDate(inc.date)}</span>
            <button class="del-small-btn" style="margin-top:4px;" title="Delete" onclick="RubberApp.confirmDeleteIncome('${inc.id}', '${escapeHtml(inc.source)}')">
              <svg class="svg-icon" style="width:14px;height:14px;" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    });

    listEl.innerHTML = html;
  }

  // Reports Page Renderer
  function renderReports() {
    const metrics = calculateMetrics(currentReportsPeriod);

    // Net Summary Hero
    const netEl = document.getElementById('reportNetVal');
    if (netEl) {
      const isPositive = metrics.netBalance >= 0;
      netEl.className = `report-net-val ${isPositive ? 'profit' : 'loss'}`;
      netEl.textContent = formatCurrency(metrics.netBalance);
    }

    const incEl = document.getElementById('reportTotalIncome');
    if (incEl) incEl.textContent = formatCurrency(metrics.totalIncome);

    const expEl = document.getElementById('reportTotalExpenses');
    if (expEl) expEl.textContent = formatCurrency(metrics.totalExpenses);

    // Breakdown Numbers
    const empValEl = document.getElementById('reportEmpVal');
    if (empValEl) empValEl.textContent = formatCurrency(metrics.empExpenses);

    const travelValEl = document.getElementById('reportTravelVal');
    if (travelValEl) travelValEl.textContent = formatCurrency(metrics.travelExpenses);

    const goodsValEl = document.getElementById('reportGoodsVal');
    if (goodsValEl) goodsValEl.textContent = formatCurrency(metrics.goodsExpenses);

    const otherValEl = document.getElementById('reportOtherVal');
    if (otherValEl) otherValEl.textContent = formatCurrency(metrics.otherExpenses);

    // Percentages & Progress Bar
    const totalExp = metrics.totalExpenses || 1;
    const empPct = Math.round((metrics.empExpenses / totalExp) * 100);
    const travelPct = Math.round((metrics.travelExpenses / totalExp) * 100);
    const goodsPct = Math.round((metrics.goodsExpenses / totalExp) * 100);
    const otherPct = Math.round((metrics.otherExpenses / totalExp) * 100);

    const barEmp = document.getElementById('barEmp');
    if (barEmp) barEmp.style.width = `${empPct}%`;

    const barTravel = document.getElementById('barTravel');
    if (barTravel) barTravel.style.width = `${travelPct}%`;

    const barGoods = document.getElementById('barGoods');
    if (barGoods) barGoods.style.width = `${goodsPct}%`;

    const barOther = document.getElementById('barOther');
    if (barOther) barOther.style.width = `${otherPct}%`;

    const pctEmpEl = document.getElementById('reportEmpPct');
    if (pctEmpEl) pctEmpEl.textContent = `${empPct}%`;

    const pctTravelEl = document.getElementById('reportTravelPct');
    if (pctTravelEl) pctTravelEl.textContent = `${travelPct}%`;

    const pctGoodsEl = document.getElementById('reportGoodsPct');
    if (pctGoodsEl) pctGoodsEl.textContent = `${goodsPct}%`;

    const pctOtherEl = document.getElementById('reportOtherPct');
    if (pctOtherEl) pctOtherEl.textContent = `${otherPct}%`;

    // Employee Wise Expense Summary List
    const empSummaryContainer = document.getElementById('reportEmployeeSummaryList');
    if (empSummaryContainer) {
      if (appState.employees.length === 0) {
        empSummaryContainer.innerHTML = `<div style="font-size:13px; color:var(--text-muted); text-align:center; padding:12px;">No employee records</div>`;
      } else {
        // Calculate filtered employee expenses
        const empMap = appState.employees.map(emp => {
          const empPayments = appState.expenses.filter(e => {
            if (e.type !== 'employee' || e.employeeId !== emp.id) return false;
            const todayStr = getTodayDateString();
            if (currentReportsPeriod === 'today') return isSameDay(e.date, todayStr);
            if (currentReportsPeriod === 'this_month') return isThisMonth(e.date);
            return true;
          });
          const total = empPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
          return {
            id: emp.id,
            name: emp.name,
            role: emp.role || 'Worker',
            totalPaid: total,
            count: empPayments.length
          };
        });

        empMap.sort((a, b) => b.totalPaid - a.totalPaid);

        let html = '';
        empMap.forEach(item => {
          html += `
            <div class="emp-leader-item" onclick="RubberApp.openEmployeeDetails('${item.id}')">
              <div class="emp-leader-left">
                <div class="avatar-badge emp" style="width:34px;height:34px;font-size:12px;">${getInitials(item.name)}</div>
                <div>
                  <div class="emp-leader-name">${escapeHtml(item.name)}</div>
                  <div class="emp-leader-role">${escapeHtml(item.role)} · ${item.count} payments</div>
                </div>
              </div>
              <div class="emp-leader-amount">${formatCurrency(item.totalPaid)}</div>
            </div>
          `;
        });
        empSummaryContainer.innerHTML = html;
      }
    }
  }

  // Form Handlers
  function handleAddEmployee(e) {
    e.preventDefault();
    const name = document.getElementById('empFormName').value.trim();
    const role = document.getElementById('empFormRole').value.trim();
    const phone = document.getElementById('empFormPhone').value.trim();

    if (!name) {
      showToast('Please enter employee name', 'error');
      return;
    }

    const newEmp = {
      id: generateId('emp'),
      name: name,
      role: role || 'Rubber Worker',
      phone: phone || ''
    };

    appState.employees.push(newEmp);
    saveState();
    closeModal('addEmployeeModal');
    document.getElementById('addEmployeeForm').reset();
    showToast(`Employee “${name}” added successfully`);
    renderCurrentView();
  }

  function handleAddEmpPayment(e) {
    e.preventDefault();
    const empId = document.getElementById('payFormEmpSelect').value;
    const amount = parseFloat(document.getElementById('payFormAmount').value);
    const date = document.getElementById('payFormDate').value || getTodayDateString();
    const reason = document.getElementById('payFormReason').value.trim();
    const note = document.getElementById('payFormNote').value.trim();

    if (!empId) {
      showToast('Please select an employee', 'error');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    const emp = appState.employees.find(e => e.id === empId);
    const empName = emp ? emp.name : 'Employee';

    const newExp = {
      id: generateId('exp_emp'),
      type: 'employee',
      employeeId: empId,
      date: date,
      amount: amount,
      reason: reason || 'Tapping / Field work payment',
      note: note || ''
    };

    appState.expenses.push(newExp);
    saveState();
    closeModal('addPaymentModal');
    document.getElementById('addPaymentForm').reset();
    showToast(`Recorded ${formatCurrency(amount)} payment for ${empName}`);
    renderCurrentView();
  }

  function handleAddTravel(e) {
    e.preventDefault();
    const person = document.getElementById('travelFormPerson').value.trim();
    const route = document.getElementById('travelFormRoute').value.trim();
    const amount = parseFloat(document.getElementById('travelFormAmount').value);
    const date = document.getElementById('travelFormDate').value || getTodayDateString();
    const purpose = document.getElementById('travelFormPurpose').value.trim();
    const note = document.getElementById('travelFormNote').value.trim();

    if (!person) {
      showToast('Please enter traveler/person name', 'error');
      return;
    }
    if (!route) {
      showToast('Please enter travel route or road', 'error');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    const newTravel = {
      id: generateId('exp_trv'),
      type: 'travel',
      person: person,
      date: date,
      amount: amount,
      route: route,
      purpose: purpose || 'Business work',
      note: note || ''
    };

    appState.expenses.push(newTravel);
    saveState();
    closeModal('addTravelModal');
    document.getElementById('addTravelForm').reset();
    showToast(`Recorded travel expense of ${formatCurrency(amount)}`);
    renderCurrentView();
  }

  function handleAddGoods(e) {
    e.preventDefault();
    const item = document.getElementById('goodsFormItem').value.trim();
    const supplier = document.getElementById('goodsFormSupplier').value.trim();
    const amount = parseFloat(document.getElementById('goodsFormAmount').value);
    const date = document.getElementById('goodsFormDate').value || getTodayDateString();
    const note = document.getElementById('goodsFormNote').value.trim();

    if (!item) {
      showToast('Please enter goods/item name', 'error');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid purchase amount', 'error');
      return;
    }

    const newGoods = {
      id: generateId('exp_gds'),
      type: 'goods',
      item: item,
      date: date,
      amount: amount,
      supplier: supplier || 'Local Supplier',
      note: note || ''
    };

    appState.expenses.push(newGoods);
    saveState();
    closeModal('addGoodsModal');
    document.getElementById('addGoodsForm').reset();
    showToast(`Recorded purchase of ${item}`);
    renderCurrentView();
  }

  function handleAddOther(e) {
    e.preventDefault();
    const item = document.getElementById('otherFormItem').value.trim();
    const category = document.getElementById('otherFormCategory').value;
    const amount = parseFloat(document.getElementById('otherFormAmount').value);
    const date = document.getElementById('otherFormDate').value || getTodayDateString();
    const note = document.getElementById('otherFormNote').value.trim();

    if (!item) {
      showToast('Please enter expense item name', 'error');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    const newOther = {
      id: generateId('exp_oth'),
      type: 'other',
      item: item,
      date: date,
      amount: amount,
      category: category || 'General',
      note: note || ''
    };

    appState.expenses.push(newOther);
    saveState();
    closeModal('addOtherModal');
    document.getElementById('addOtherForm').reset();
    showToast(`Recorded expense for ${item}`);
    renderCurrentView();
  }

  function handleAddIncome(e) {
    e.preventDefault();
    const source = document.getElementById('incomeFormSource').value.trim();
    const amount = parseFloat(document.getElementById('incomeFormAmount').value);
    const date = document.getElementById('incomeFormDate').value || getTodayDateString();
    const note = document.getElementById('incomeFormNote').value.trim();

    if (!source) {
      showToast('Please enter income source or buyer', 'error');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid income amount', 'error');
      return;
    }

    const newIncome = {
      id: generateId('inc'),
      date: date,
      amount: amount,
      source: source,
      note: note || ''
    };

    appState.income.push(newIncome);
    saveState();
    closeModal('addIncomeModal');
    document.getElementById('addIncomeForm').reset();
    showToast(`Recorded income of ${formatCurrency(amount)}`);
    renderCurrentView();
  }

  function handleSaveSettings(e) {
    e.preventDefault();
    const name = document.getElementById('settingsUserName').value.trim();
    const curr = document.getElementById('settingsCurrency').value.trim();

    if (!appState.user) appState.user = {};
    if (name) {
      appState.user.name = name;
      appState.user.initials = getInitials(name);
    }
    if (curr) {
      appState.user.currency = curr;
    }

    saveState();
    closeModal('settingsModal');
    showToast('Settings saved successfully');
    renderCurrentView();
  }

  // Deletions
  function deleteExpense(expenseId) {
    appState.expenses = appState.expenses.filter(e => e.id !== expenseId);
    saveState();
    showToast('Record deleted');
    renderCurrentView();
  }

  function deleteIncome(incomeId) {
    appState.income = appState.income.filter(i => i.id !== incomeId);
    saveState();
    showToast('Income record deleted');
    renderCurrentView();
  }

  function deleteEmployee(empId) {
    const emp = appState.employees.find(e => e.id === empId);
    const name = emp ? emp.name : 'Employee';
    // remove employee
    appState.employees = appState.employees.filter(e => e.id !== empId);
    // remove corresponding employee payments
    appState.expenses = appState.expenses.filter(e => !(e.type === 'employee' && e.employeeId === empId));
    saveState();
    showToast(`Deleted employee ${name} and related payments`);
    switchTab('employees');
  }

  // Populate Dropdown for Employee Select in Payment Modal
  function populateEmployeeDropdown(selectedEmpId = null) {
    const select = document.getElementById('payFormEmpSelect');
    if (!select) return;

    if (appState.employees.length === 0) {
      select.innerHTML = '<option value="">No employees available (Add one first)</option>';
      return;
    }

    let html = '<option value="">Select Employee...</option>';
    appState.employees.forEach(emp => {
      const isSel = selectedEmpId === emp.id ? 'selected' : '';
      html += `<option value="${emp.id}" ${isSel}>${escapeHtml(emp.name)} (${escapeHtml(emp.role || 'Worker')})</option>`;
    });

    select.innerHTML = html;
  }

  // Security Helper for HTML String Injection
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Backup & Restore
  function exportDataJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `rubber_manager_backup_${getTodayDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup JSON exported successfully');
  }

  function importDataJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported && imported.employees && imported.expenses && imported.income) {
          appState = imported;
          saveState();
          showToast('Data imported successfully');
          renderCurrentView();
          closeModal('settingsModal');
        } else {
          showToast('Invalid backup file format', 'error');
        }
      } catch (err) {
        showToast('Failed to parse backup file', 'error');
      }
    };
    reader.readAsText(file);
  }

  function resetToSampleData() {
    showConfirmDialog(
      'Reset to Sample Data',
      'This will replace your current data with the sample rubber estate dataset. Continue?',
      () => {
        appState = JSON.parse(JSON.stringify(DEFAULT_DATA));
        saveState();
        showToast('Sample dataset restored');
        renderCurrentView();
        closeModal('settingsModal');
      }
    );
  }

  function clearAllData() {
    showConfirmDialog(
      'Clear All Data',
      'Are you sure you want to erase all records and start fresh? This cannot be undone.',
      () => {
        appState = {
          user: { name: 'Hanan', initials: 'HA', currency: '₹' },
          employees: [],
          income: [],
          expenses: []
        };
        saveState();
        showToast('All data cleared');
        renderCurrentView();
        closeModal('settingsModal');
      }
    );
  }

  // Public Interface for Inline Event Handlers
  window.RubberApp = {
    init: function () {
      // Set today's date in form defaults
      const today = getTodayDateString();
      ['payFormDate', 'travelFormDate', 'goodsFormDate', 'otherFormDate', 'incomeFormDate'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = today;
      });

      // Bind Forms
      document.getElementById('addEmployeeForm')?.addEventListener('submit', handleAddEmployee);
      document.getElementById('addPaymentForm')?.addEventListener('submit', handleAddEmpPayment);
      document.getElementById('addTravelForm')?.addEventListener('submit', handleAddTravel);
      document.getElementById('addGoodsForm')?.addEventListener('submit', handleAddGoods);
      document.getElementById('addOtherForm')?.addEventListener('submit', handleAddOther);
      document.getElementById('addIncomeForm')?.addEventListener('submit', handleAddIncome);
      document.getElementById('settingsForm')?.addEventListener('submit', handleSaveSettings);

      // Confirm Dialog Event
      document.getElementById('confirmActionBtn')?.addEventListener('click', function () {
        if (typeof pendingConfirmAction === 'function') {
          pendingConfirmAction();
          pendingConfirmAction = null;
        }
        closeModal('confirmModal');
      });

      document.getElementById('confirmCancelBtn')?.addEventListener('click', function () {
        pendingConfirmAction = null;
        closeModal('confirmModal');
      });

      // Close modal on background click
      document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', function (e) {
          if (e.target === backdrop) {
            closeAllModals();
          }
        });
      });

      // Search Inputs Listeners
      document.getElementById('employeeSearchInput')?.addEventListener('input', renderEmployeesList);
      document.getElementById('travelSearchInput')?.addEventListener('input', renderTravelExpenses);
      document.getElementById('goodsSearchInput')?.addEventListener('input', renderGoodsExpenses);
      document.getElementById('otherSearchInput')?.addEventListener('input', renderOtherExpenses);
      document.getElementById('otherCategoryFilter')?.addEventListener('change', renderOtherExpenses);
      document.getElementById('incomeSearchInput')?.addEventListener('input', renderIncomeView);

      // Dashboard & Reports Filters
      document.getElementById('dashPeriodSelect')?.addEventListener('change', function (e) {
        currentDashboardPeriod = e.target.value;
        renderDashboard();
      });

      document.querySelectorAll('.report-tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
          document.querySelectorAll('.report-tab-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          currentReportsPeriod = this.getAttribute('data-period');
          renderReports();
        });
      });

      // Initial Render
      switchTab('home');

      // Initialize PWA Lifecycle
      initPWA();
    },

    switchTab: switchTab,
    openEmployeeDetails: openEmployeeDetails,

    // Modal Openers
    openQuickAdd: function () {
      openModal('quickAddModal');
    },
    openAddEmployeeModal: function () {
      openModal('addEmployeeModal');
    },
    openAddEmpPaymentModal: function (empId = null) {
      populateEmployeeDropdown(empId);
      const today = getTodayDateString();
      const dateInput = document.getElementById('payFormDate');
      if (dateInput) dateInput.value = today;
      openModal('addPaymentModal');
    },
    openAddTravelModal: function () {
      const today = getTodayDateString();
      const dateInput = document.getElementById('travelFormDate');
      if (dateInput) dateInput.value = today;
      openModal('addTravelModal');
    },
    openAddGoodsModal: function () {
      const today = getTodayDateString();
      const dateInput = document.getElementById('goodsFormDate');
      if (dateInput) dateInput.value = today;
      openModal('addGoodsModal');
    },
    openAddOtherModal: function () {
      const today = getTodayDateString();
      const dateInput = document.getElementById('otherFormDate');
      if (dateInput) dateInput.value = today;
      openModal('addOtherModal');
    },
    openAddIncomeModal: function () {
      const today = getTodayDateString();
      const dateInput = document.getElementById('incomeFormDate');
      if (dateInput) dateInput.value = today;
      openModal('addIncomeModal');
    },
    openSettingsModal: function () {
      const nameInput = document.getElementById('settingsUserName');
      const currInput = document.getElementById('settingsCurrency');
      if (nameInput) nameInput.value = (appState.user && appState.user.name) || 'Hanan';
      if (currInput) currInput.value = (appState.user && appState.user.currency) || '₹';
      openModal('settingsModal');
    },
    openInstallModal: function () {
      updateInstallUI();
      openModal('installAppModal');
    },

    // PWA Install Triggers
    installAppPrompt: installAppPrompt,
    dismissInstallBanner: dismissInstallBanner,

    closeModal: closeModal,
    closeAllModals: closeAllModals,

    // Deletion Prompts
    confirmDeleteExpense: function (id, label) {
      showConfirmDialog(
        'Delete Record',
        `Are you sure you want to delete ${label}?`,
        () => deleteExpense(id)
      );
    },
    confirmDeleteIncome: function (id, label) {
      showConfirmDialog(
        'Delete Income',
        `Are you sure you want to delete income from ${label}?`,
        () => deleteIncome(id)
      );
    },
    confirmDeleteCurrentEmployee: function () {
      if (!activeEmployeeDetailId) return;
      const emp = appState.employees.find(e => e.id === activeEmployeeDetailId);
      const name = emp ? emp.name : 'this employee';
      showConfirmDialog(
        'Delete Employee',
        `Are you sure you want to delete ${name}? All associated payment records will also be deleted.`,
        () => deleteEmployee(activeEmployeeDetailId)
      );
    },

    // Utilities
    exportBackup: exportDataJSON,
    importBackup: importDataJSON,
    resetData: resetToSampleData,
    clearData: clearAllData
  };

  // ==========================================================================
  // PWA (Progressive Web App) Install Management
  // ==========================================================================
  let deferredInstallPrompt = null;
  const PWA_DISMISSED_KEY = 'rubber_manager_pwa_dismissed';
  const PWA_INSTALLED_KEY = 'rubber_manager_installed_flag';

  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  function isStandalone() {
    return (window.navigator.standalone === true) || 
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) ||
      (window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches) ||
      (document.referrer && document.referrer.startsWith('android-app://')) ||
      (localStorage.getItem(PWA_INSTALLED_KEY) === 'true');
  }

  function initPWA() {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => console.log('ServiceWorker registered:', reg.scope))
          .catch((err) => console.log('ServiceWorker error:', err));
      });
    }

    // Capture Native Install Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      if (isStandalone()) return;
      e.preventDefault();
      deferredInstallPrompt = e;
      updateInstallUI();
    });

    // App installed event
    window.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      localStorage.setItem(PWA_INSTALLED_KEY, 'true');
      hideInstallBanner();
      updateInstallUI();
      showToast('Rubber Manager installed successfully!', 'success');
    });

    // Handle initial UI state
    if (!isStandalone()) {
      updateInstallUI();
      // Smooth auto-display floating banner for fast installation
      setTimeout(() => {
        if (!isStandalone()) {
          showInstallBanner();
        }
      }, 1200);
    } else {
      updateInstallUI();
    }
  }

  function updateInstallUI() {
    const isInstalled = isStandalone();
    const headerBtn = document.getElementById('headerInstallBtn');
    const settingsBtn = document.getElementById('settingsInstallRow');
    const iosGuide = document.getElementById('iosInstallGuide');
    const androidGuide = document.getElementById('androidInstallGuide');
    const btnText = document.getElementById('installBtnText');
    const nativeBtn = document.getElementById('nativeInstallActionBtn');

    if (isInstalled) {
      if (headerBtn) headerBtn.style.display = 'none';
      if (settingsBtn) settingsBtn.style.display = 'none';
      hideInstallBanner();
      return;
    }

    if (headerBtn) headerBtn.style.display = 'inline-flex';
    if (settingsBtn) settingsBtn.style.display = 'flex';

    if (deferredInstallPrompt) {
      if (btnText) btnText.textContent = 'Install App on Home Screen';
      if (iosGuide) iosGuide.style.display = 'none';
      if (androidGuide) androidGuide.style.display = 'none';
    } else if (isIOS()) {
      if (iosGuide) iosGuide.style.display = 'flex';
      if (androidGuide) androidGuide.style.display = 'none';
      if (nativeBtn) nativeBtn.style.display = 'none';
    } else {
      // Browser without native prompt (e.g. LAN IP / HTTP)
      if (iosGuide) iosGuide.style.display = 'none';
      if (androidGuide) androidGuide.style.display = 'flex';
      if (btnText) btnText.textContent = 'Tap ⋮ (Menu) → “Install app”';
    }
  }

  function showInstallBanner() {
    if (isStandalone()) return;
    const banner = document.getElementById('floatingInstallBanner');
    if (banner) {
      banner.classList.add('show');
    }
  }

  function hideInstallBanner() {
    const banner = document.getElementById('floatingInstallBanner');
    if (banner) {
      banner.classList.remove('show');
    }
  }

  function dismissInstallBanner() {
    hideInstallBanner();
    localStorage.setItem(PWA_DISMISSED_KEY, 'true');
  }

  function installAppPrompt() {
    if (deferredInstallPrompt) {
      hideInstallBanner();
      closeModal('installAppModal');
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          showToast('Installing Rubber Manager...');
        }
        deferredInstallPrompt = null;
        updateInstallUI();
      });
    } else if (isIOS()) {
      hideInstallBanner();
      openModal('installAppModal');
      const iosGuide = document.getElementById('iosInstallGuide');
      if (iosGuide) iosGuide.style.display = 'flex';
    } else {
      // Show Android / Chrome guidance
      hideInstallBanner();
      openModal('installAppModal');
      const androidGuide = document.getElementById('androidInstallGuide');
      if (androidGuide) {
        androidGuide.style.display = 'flex';
        androidGuide.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      showToast('Tap the 3 dots (⋮) menu in Chrome → "Install app"', 'success');
    }
  }

  // Run on DOM Ready
  document.addEventListener('DOMContentLoaded', function () {
    window.RubberApp.init();
  });
})();
