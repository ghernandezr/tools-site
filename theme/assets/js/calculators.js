/**
 * ToolsHub — Calculators (Vanilla JS, no frameworks)
 * All 10 tools. Runs in footer, deferred by LiteSpeed.
 * Performance: No dependencies, < 6kb minified.
 */

(function () {
  'use strict';

  /* ============================================================
     Utility helpers (exported for testing)
  ============================================================ */
  function fmt(n, decimals) {
    if (isNaN(n) || !isFinite(n)) return 'N/A';
    return Number(n).toLocaleString('en-US', {
      minimumFractionDigits: decimals !== undefined ? decimals : 2,
      maximumFractionDigits: decimals !== undefined ? decimals : 2,
    });
  }

  function fmtCurrency(n) {
    if (isNaN(n) || !isFinite(n)) return 'N/A';
    return '$' + fmt(n, 2);
  }

  // Export utilities for testing
  window.ToolsHubUtils = {
    fmt: fmt,
    fmtCurrency: fmtCurrency
  };

  /* ============================================================
     Pure calculation functions (exported for testing)
  ============================================================ */

  // Loan Calculator calculations
  window.calculateLoan = function (principal, annualRate, years) {
    if (!principal || !annualRate || !years || principal <= 0 || annualRate <= 0 || years <= 0) {
      return null;
    }
    var i = annualRate / 100 / 12;
    var n = years * 12;
    var x = Math.pow(1 + i, n);
    var monthly = (principal * x * i) / (x - 1);
    if (!isFinite(monthly)) return null;
    var totalPayment = monthly * n;
    var totalInterest = totalPayment - principal;
    var principalPct = (principal / totalPayment) * 100;
    return {
      monthly: monthly,
      totalPayment: totalPayment,
      totalInterest: totalInterest,
      principalPct: principalPct,
      interestPct: 100 - principalPct,
      months: n
    };
  };

  // Credit Card Calculator calculations
  window.calculateCreditCard = function (balance, apr, payment) {
    if (balance <= 0 || apr < 0 || payment <= 0) {
      return { monthlyInterest: 0, months: 0, totalInterest: 0, payoffDate: null };
    }
    var monthlyRate = apr / 100 / 12;
    var monthlyInterest = balance * monthlyRate;

    if (payment <= monthlyInterest) {
      return { monthlyInterest: monthlyInterest, months: Infinity, totalInterest: Infinity, payoffDate: null, error: 'insufficient_payment' };
    }

    var months, totalInterest;
    if (payment >= balance + monthlyInterest) {
      months = 1;
      totalInterest = monthlyInterest;
    } else {
      months = Math.log(payment / (payment - balance * monthlyRate)) / Math.log(1 + monthlyRate);
      // Calculate actual total interest using amortization formula:
      // Total Interest = (payment * n) - principal, where n is exact months (not rounded)
      // But for the final partial month, the payment is exactly the remaining balance + interest
      var exactMonths = months;
      var fullMonths = Math.floor(exactMonths);
      var remainingBalance = balance * Math.pow(1 + monthlyRate, fullMonths) - payment * ((Math.pow(1 + monthlyRate, fullMonths) - 1) / monthlyRate);
      var finalPayment = remainingBalance > 0 ? remainingBalance * (1 + monthlyRate) : 0;
      var totalPaid = payment * fullMonths + finalPayment;
      totalInterest = totalPaid - balance;
    }

    var payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + Math.ceil(months));

    return {
      monthlyInterest: monthlyInterest,
      months: Math.ceil(months),
      totalInterest: totalInterest,
      payoffDate: payoffDate,
      principalPaid: payment >= balance + monthlyInterest ? balance : payment - monthlyInterest
    };
  };

  // Compound Interest Calculator calculations
  window.calculateCompoundInterest = function (principal, rate, frequency, years) {
    if (isNaN(principal) || principal <= 0 || isNaN(rate) || rate < 0 || isNaN(frequency) || frequency <= 0 || isNaN(years) || years <= 0) {
      return null;
    }
    var r = rate / 100;
    var n = frequency;
    var t = years;
    var A = principal * Math.pow(1 + r / n, n * t);
    var interest = A - principal;
    var growthPct = ((A - principal) / principal) * 100;
    var principalPct = Math.round((principal / A) * 100);
    var rule72 = r > 0 ? (72 / (r * 100)).toFixed(1) : null;
    return {
      finalAmount: A,
      interestEarned: interest,
      growthPct: growthPct,
      principalPct: principalPct,
      interestPct: 100 - principalPct,
      rule72: rule72
    };
  };

  // Salary Converter calculations
  window.calculateSalary = function (annual, hoursWk, weeksYr) {
    hoursWk = hoursWk || 40;
    weeksYr = weeksYr || 52;
    if (isNaN(annual) || annual <= 0) return null;
    var totalHours = hoursWk * weeksYr;
    return {
      hourly: annual / totalHours,
      monthly: annual / 12,
      weekly: annual / weeksYr,
      daily: annual / (weeksYr * 5),
      totalHours: totalHours
    };
  };

  // Tip Calculator calculations
  window.calculateTip = function (bill, tipPct, people) {
    if (isNaN(bill) || bill <= 0) return { error: 'invalid_bill' };
    if (isNaN(tipPct) || tipPct < 0) return { error: 'invalid_tip' };
    if (people === 0 || people < 1) return { error: 'invalid_people' };
    people = people || 1;
    var tip = bill * (tipPct / 100);
    var total = bill + tip;
    return {
      tip: tip,
      total: total,
      perPerson: total / people,
      tipPerPerson: tip / people
    };
  };

  // Percentage Calculator calculations
  window.calculatePercentage = function (mode, a, b) {
    if (isNaN(a) || isNaN(b)) return { error: 'invalid_input' };
    var result, label;
    if (mode === 'of') {
      result = (a / 100) * b;
      label = a + '% of ' + b;
    } else if (mode === 'what') {
      if (b === 0) return { error: 'division_by_zero' };
      result = (a / b) * 100;
      label = a + ' is what % of ' + b;
    } else if (mode === 'change') {
      if (a === 0) return { error: 'division_by_zero' };
      result = ((b - a) / a) * 100;
      label = 'Change from ' + a + ' to ' + b;
    } else {
      return { error: 'invalid_mode' };
    }
    return { result: result, label: label };
  };

  // Discount Calculator calculations
  window.calculateDiscount = function (original, pct) {
    if (isNaN(original) || original <= 0) return { error: 'invalid_price' };
    if (isNaN(pct) || pct < 0 || pct > 100) return { error: 'invalid_discount' };
    var savings = original * (pct / 100);
    return {
      savings: savings,
      finalPrice: original - savings,
      original: original
    };
  };

  // Fuel Cost Calculator calculations
  window.calculateFuelCost = function (distance, mpg, price) {
    if (distance <= 0 || mpg <= 0 || price <= 0) return null;
    var gallons = distance / mpg;
    var totalCost = gallons * price;
    return {
      gallons: gallons,
      totalCost: totalCost,
      costPerMile: totalCost / distance,
      roundTrip: totalCost * 2
    };
  };

  // Unit Converter calculations
  window.convertUnit = function (type, value, mode) {
    if (isNaN(value)) return { error: 'invalid_value' };
    var result, label;
    if (type === 'length') {
      if (mode === 'km-to-mi') {
        result = value * 0.621371;
        label = value + ' km = ' + result + ' miles';
      } else {
        result = value * 1.60934;
        label = value + ' miles = ' + result + ' km';
      }
    } else if (type === 'weight') {
      if (mode === 'kg-to-lbs') {
        result = value * 2.20462;
        label = value + ' kg = ' + result + ' lbs';
      } else {
        result = value * 0.453592;
        label = value + ' lbs = ' + result + ' kg';
      }
    } else if (type === 'temp') {
      if (mode === 'c-to-f') {
        result = (value * 9 / 5) + 32;
        label = value + '°C = ' + result + '°F';
      } else {
        result = (value - 32) * 5 / 9;
        label = value + '°F = ' + result + '°C';
      }
    } else {
      return { error: 'invalid_type' };
    }
    return { result: result, label: label };
  };

  function el(id) {
    return document.getElementById(id);
  }

  function showResult(resultEl, errorEl) {
    if (resultEl) {
      resultEl.classList.add('is-visible');
    }
    if (errorEl) {
      errorEl.classList.remove('is-visible');
    }
  }

  function showError(resultEl, errorEl, msg) {
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.add('is-visible');
    }
    if (resultEl) {
      resultEl.classList.remove('is-visible');
    }
  }

  function bindReset(resetBtn, form, resultEl, errorEl) {
    if (!resetBtn || !form) return;
    resultEl && resultEl.classList.remove('is-visible');
    resetBtn.addEventListener('click', function () {
      form.reset();
      resultEl && resultEl.classList.remove('is-visible');
      errorEl && errorEl.classList.remove('is-visible');
      resetBtn.classList.remove('is-visible');
    });
  }

  document.addEventListener('wheel', function (e) {
    if (document.activeElement && document.activeElement.type === 'number') {
      document.activeElement.blur();
    }
  }, { passive: true });

  function bindFAQ() {
    document.querySelectorAll('.tool-faq__item').forEach(function (item) {
      var q = item.querySelector('.tool-faq__question');
      if (q) {
        q.addEventListener('click', function () {
          item.classList.toggle('is-open');
        });
      }
    });
  }

  /* ============================================================
     TOOL 1 — Loan Payment Calculator V2
     Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
     Features: live input, donut chart, amortization schedule, tabs
  ============================================================ */
  function initLoanCalculator() {
    var inputPrincipal = el('loan-principal');
    var inputRate = el('loan-rate');
    var inputYears = el('loan-years');
    var form = el('loan-form');
    var resetBtn = el('loan-reset');

    if (!form) return;

    var elMonthly = el('loan-monthly');
    var elInterest = el('loan-interest');
    var elTotal = el('loan-total');
    var elDonut = el('lc-donut-path');
    var elCapPct = el('lc-cap-percent');
    var elCapChart = el('lc-cap-percent-chart');
    var elSchedule = el('lpc-schedule-body');
    var calcBtn = el('lpc-calc-btn');
    var resultsCard = document.querySelector('.lpc-results-card');
    var isDirty = false;
    var btnOriginalHTML = calcBtn ? calcBtn.innerHTML : '';

    function lpcSetDirty() {
      if (isDirty) return;
      isDirty = true;
      if (calcBtn) calcBtn.classList.add('lpc-calc-btn--dirty');
      if (resultsCard) {
        resultsCard.classList.add('lpc-results-card--dirty');
        resultsCard.classList.remove('lpc-results-card--fresh');
      }
    }

    function lpcSetFresh() {
      isDirty = false;
      if (calcBtn) {
        calcBtn.classList.remove('lpc-calc-btn--dirty');
        calcBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Updated!';
        setTimeout(function () { if (calcBtn) calcBtn.innerHTML = btnOriginalHTML; }, 1200);
      }
      if (resultsCard) {
        resultsCard.classList.remove('lpc-results-card--dirty');
        resultsCard.classList.remove('lpc-results-card--fresh');
        void resultsCard.offsetWidth;
        resultsCard.classList.add('lpc-results-card--fresh');
      }
    }

    function lpcFmt(n) {
      return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function lpcCalculate() {
      var P = parseFloat(inputPrincipal.value);
      var annualRate = parseFloat(inputRate.value);
      var years = parseFloat(inputYears.value);

      if (!P || !annualRate || !years || P <= 0 || annualRate <= 0 || years <= 0) return;

      var i = annualRate / 100 / 12;
      var n = years * 12;
      var x = Math.pow(1 + i, n);
      var monthly = (P * x * i) / (x - 1);

      if (!isFinite(monthly)) return;

      var totalPayment = monthly * n;
      var totalInterest = totalPayment - P;
      var principalPct = (P / totalPayment) * 100;

      if (elMonthly) elMonthly.textContent = lpcFmt(monthly);
      if (elInterest) elInterest.textContent = lpcFmt(totalInterest);
      if (elTotal) elTotal.textContent = lpcFmt(totalPayment);

      if (elDonut) elDonut.setAttribute('stroke-dasharray', principalPct.toFixed(1) + ',' + (100 - principalPct).toFixed(1));
      var pctRound = Math.round(principalPct) + '%';
      if (elCapPct) elCapPct.textContent = pctRound;
      if (elCapChart) elCapChart.textContent = pctRound;

      if (elSchedule) {
        var html = '';
        var remaining = P;
        for (var m = 1; m <= n; m++) {
          var interestM = remaining * i;
          var principalM = monthly - interestM;
          remaining -= principalM;
          if (m <= 12 || m % 12 === 0 || m === n) {
            var label = m === 1 ? 'Month 1' : m % 12 === 0 ? 'Year ' + (m / 12) : 'Month ' + m;
            html += '<tr>'
              + '<td class="td-month">' + label + '</td>'
              + '<td class="td-payment">' + lpcFmt(monthly) + '</td>'
              + '<td class="td-interest">-' + lpcFmt(interestM) + '</td>'
              + '<td class="td-balance">' + lpcFmt(Math.max(0, remaining)) + '</td>'
              + '</tr>';
          }
        }
        elSchedule.innerHTML = html;
      }
    }

    function lpcReset() {
      inputPrincipal.value = '';
      inputRate.value = '';
      inputYears.value = '';
      if (elMonthly) elMonthly.textContent = '$0.00';
      if (elInterest) elInterest.textContent = '$0.00';
      if (elTotal) elTotal.textContent = '$0.00';
      if (elDonut) elDonut.setAttribute('stroke-dasharray', '0,100');
      if (elCapPct) elCapPct.textContent = '—';
      if (elCapChart) elCapChart.textContent = '0%';
      if (elSchedule) elSchedule.innerHTML = '';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      lpcCalculate();
    });
    if (resetBtn) resetBtn.addEventListener('click', lpcReset);
    [inputPrincipal, inputRate, inputYears].forEach(function (input) {
      if (input) input.addEventListener('input', function () {
        lpcCalculate();
      });
    });

    lpcCalculate();
  }

  /* ============================================================
     TOOL 2 — Credit Card Interest Calculator (Pro Style)
     Formula: Monthly Interest = Balance × (APR / 100 / 12)
  ============================================================ */
  function initCreditCardCalculator() {
    var container = document.getElementById('ccc-credit-calculator');
    if (!container) return;

    // Elements
    var els = {
      balance: el('cc-balance'),
      apr: el('cc-apr'),
      payment: el('cc-payment'),
      kpiInterest: el('cc-kpi-interest'),
      kpiMonths: el('cc-kpi-months'),
      kpiTotalInterest: el('cc-kpi-total-interest'),
      statPrincipal: el('cc-stat-principal'),
      statPayoffDate: el('cc-stat-payoff-date'),
      barPrincipal: el('cc-bar-principal'),
      barInterest: el('cc-bar-interest'),
      legendPrincipalPct: el('cc-legend-principal-pct'),
      legendInterestPct: el('cc-legend-interest-pct'),
      alert: el('cc-alert'),
      alertText: el('cc-alert-text'),
      resetBtn: el('cc-reset')
    };

    // Check if all required elements exist
    if (!els.balance || !els.apr || !els.payment) return;

    function calculate() {
      var balance = parseFloat(els.balance.value) || 0;
      var apr = parseFloat(els.apr.value) || 0;
      var payment = parseFloat(els.payment.value) || 0;

      if (balance <= 0 || apr < 0 || payment <= 0) {
        // Reset to defaults
        els.kpiInterest.textContent = '$0.00';
        els.kpiMonths.textContent = '0';
        els.kpiTotalInterest.textContent = '$0.00';
        els.statPrincipal.textContent = '$0.00';
        els.statPayoffDate.textContent = '—';
        els.barPrincipal.style.width = '50%';
        els.barInterest.style.width = '50%';
        els.legendPrincipalPct.textContent = '50%';
        els.legendInterestPct.textContent = '50%';
        if (els.alert) els.alert.classList.add('ccc-alert--hidden');
        return;
      }

      var monthlyRate = apr / 100 / 12;
      var monthlyInterest = balance * monthlyRate;
      var principal = payment - monthlyInterest;

      // Show/hide alert for insufficient payment or excessive payment
      if (els.alert && els.alertText) {
        if (payment <= monthlyInterest) {
          els.alert.classList.remove('ccc-alert--hidden');
          els.alertText.textContent = 'Your payment of ' + fmtCurrency(payment) + ' does not cover the monthly interest of ' + fmtCurrency(monthlyInterest) + '. Increase your payment to at least ' + fmtCurrency(monthlyInterest + 1) + ' to make progress.';
          els.kpiMonths.textContent = '∞';
          els.statPayoffDate.textContent = 'Never';
        } else if (payment > balance) {
          els.alert.classList.remove('ccc-alert--hidden');
          els.alertText.textContent = 'Your payment of ' + fmtCurrency(payment) + ' exceeds your balance of ' + fmtCurrency(balance) + '. You only need ' + fmtCurrency(balance + monthlyInterest) + ' to pay off this card in full. The excess amount will not reduce your debt further.';
        } else {
          els.alert.classList.add('ccc-alert--hidden');
        }
      }

      // Months to pay off (only if payment covers interest)
      var months = 0;
      var totalInterest = 0;
      if (payment > monthlyInterest) {
        // If payment is enough to pay off balance + interest in one month
        if (payment >= balance + monthlyInterest) {
          months = 1;
          totalInterest = monthlyInterest;
        } else {
          // Normal amortization calculation
          months = Math.log(payment / (payment - balance * monthlyRate)) / Math.log(1 + monthlyRate);
          // Calculate actual total paid considering final partial month
          var fullMonths = Math.floor(months);
          var remainingBalance = balance * Math.pow(1 + monthlyRate, fullMonths) - payment * ((Math.pow(1 + monthlyRate, fullMonths) - 1) / monthlyRate);
          var finalPayment = remainingBalance > 0 ? remainingBalance * (1 + monthlyRate) : 0;
          var totalPaid = payment * fullMonths + finalPayment;
          totalInterest = totalPaid - balance;
        }
      }

      // Calculate payoff date
      var payoffDate = new Date();
      payoffDate.setMonth(payoffDate.getMonth() + Math.ceil(months));
      var payoffDateStr = months > 0 ? payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—';

      // Calculate breakdown percentages
      // Cap effective payment at balance + interest for correct percentage display
      var effectivePayment = payment >= balance + monthlyInterest ? balance + monthlyInterest : payment;
      var principalPct = effectivePayment > 0 ? ((effectivePayment - monthlyInterest) / effectivePayment) * 100 : 50;
      var interestPct = effectivePayment > 0 ? (monthlyInterest / effectivePayment) * 100 : 50;

      // Update KPI cards
      els.kpiInterest.textContent = fmtCurrency(monthlyInterest);
      els.kpiMonths.textContent = payment > monthlyInterest ? Math.ceil(months) : '∞';
      els.kpiTotalInterest.textContent = payment > monthlyInterest ? fmtCurrency(totalInterest) : '∞';

      // Update impact stats
      // When payment exceeds balance + interest, principal is the full balance
      var principalPaid = payment >= balance + monthlyInterest ? balance : (principal > 0 ? principal : 0);
      els.statPrincipal.textContent = fmtCurrency(principalPaid);
      els.statPayoffDate.textContent = payoffDateStr;

      // Update breakdown bar
      els.barPrincipal.style.width = principalPct + '%';
      els.barInterest.style.width = interestPct + '%';
      els.legendPrincipalPct.textContent = Math.round(principalPct) + '%';
      els.legendInterestPct.textContent = Math.round(interestPct) + '%';
    }

    // Event listeners
    [els.balance, els.apr, els.payment].forEach(function (input) {
      if (input) {
        input.addEventListener('input', calculate);
        input.addEventListener('change', calculate);
      }
    });

    // Form submit (prevent default, calculate)
    var form = el('cc-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        calculate();
      });
    }

    // Reset button
    if (els.resetBtn) {
      els.resetBtn.addEventListener('click', function () {
        if (form) form.reset();
        calculate();
      });
    }

    // Preset helpers (exposed globally)
    window.CCC = {
      setAPR: function (val) {
        els.apr.value = val;
        calculate();
      },
      setPayment: function (val) {
        els.payment.value = val;
        calculate();
      }
    };

    // Initial calc
    calculate();
  }

  /* ============================================================
     TOOL 3 — Compound Interest Calculator
     Formula: A = P(1 + r/n)^(nt)
  ============================================================ */
  function initCompoundInterestCalculator() {
    var principalEl = el('ci-principal');
    var rateEl = el('ci-rate');
    var frequencyEl = el('ci-frequency');
    var yearsEl = el('ci-years');

    if (!principalEl) return;

    function calcCIC() {
      var P = parseFloat(principalEl.value);
      var r = parseFloat(rateEl.value) / 100;
      var n = parseFloat(frequencyEl.value);
      var t = parseFloat(yearsEl.value);

      if (isNaN(P) || P <= 0 || isNaN(r) || r < 0 || isNaN(n) || n <= 0 || isNaN(t) || t <= 0) {
        el('ci-final').textContent = '$0.00';
        el('ci-earned').textContent = '$0.00';
        el('ci-growth-pct').textContent = '0.0%';
        el('ci-principal-out').textContent = '$0.00';
        el('ci-rule72').textContent = '— yrs';
        el('cic-bar-principal').style.width = '100%';
        el('cic-bar-interest').style.width = '0%';
        el('cic-legend-principal-pct').textContent = 'Principal (100%)';
        el('cic-legend-interest-pct').textContent = 'Interest Earned (0%)';
        return;
      }

      var A = P * Math.pow(1 + r / n, n * t);
      var interest = A - P;
      var growthPct = ((A - P) / P) * 100;
      var principalPct = Math.round((P / A) * 100);
      var interestPct = 100 - principalPct;
      var rule72 = r > 0 ? (72 / (r * 100)).toFixed(1) : '—';

      el('ci-final').textContent = fmtCurrency(A);
      el('ci-earned').textContent = fmtCurrency(interest);
      el('ci-growth-pct').textContent = growthPct.toFixed(1) + '%';
      el('ci-principal-out').textContent = fmtCurrency(P);
      el('ci-rule72').textContent = rule72 + ' yrs';
      el('cic-bar-principal').style.width = principalPct + '%';
      el('cic-bar-interest').style.width = interestPct + '%';
      el('cic-legend-principal-pct').textContent = 'Principal (' + principalPct + '%)';
      el('cic-legend-interest-pct').textContent = 'Interest Earned (' + interestPct + '%)';
    }

    principalEl.addEventListener('input', calcCIC);
    rateEl.addEventListener('input', calcCIC);
    frequencyEl.addEventListener('change', calcCIC);
    yearsEl.addEventListener('input', calcCIC);
  }

  window.CIC = {
    setPrincipal: function (v) { var f = el('ci-principal'); if (f) { f.value = v; f.dispatchEvent(new Event('input')); } },
    setRate: function (v) { var f = el('ci-rate'); if (f) { f.value = v; f.dispatchEvent(new Event('input')); } },
    setYears: function (v) { var f = el('ci-years'); if (f) { f.value = v; f.dispatchEvent(new Event('input')); } }
  };

  /* ============================================================
     TOOL 4 — Salary to Hourly Converter
     Formula: Hourly = Annual / (Hours/wk × Weeks/yr)
     Features: Real-time calculation, KPI cards, shc-* UI
  ============================================================ */
  function initSalaryConverter() {
    var container = document.getElementById('shc-salary-calculator');
    if (!container) return;

    var els = {
      annual: el('shc-annual'),
      hours: el('shc-hours'),
      weeks: el('shc-weeks'),
      kpiHourly: el('shc-kpi-hourly'),
      kpiDaily: el('shc-kpi-daily'),
      kpiWeekly: el('shc-kpi-weekly'),
      statMonthly: el('shc-stat-monthly'),
      statBiweekly: el('shc-stat-biweekly'),
      barSalary: el('shc-bar-salary'),
      barTax: el('shc-bar-tax'),
      legendLabel: el('shc-legend-salary-label'),
    };

    if (!els.annual || !els.hours || !els.weeks) return;

    var fmtCur = new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    });

    function calculate() {
      var annual = parseFloat(els.annual.value) || 0;
      var hoursWk = parseFloat(els.hours.value) || 40;
      var weeksYr = parseFloat(els.weeks.value) || 52;

      if (annual <= 0 || hoursWk <= 0 || weeksYr <= 0) {
        resetUI();
        return;
      }

      var totalHours = hoursWk * weeksYr;
      var hourly = annual / totalHours;
      var daily = annual / (weeksYr * 5);
      var weekly = annual / weeksYr;
      var monthly = annual / 12;
      var biweekly = annual / 26;

      if (els.kpiHourly) els.kpiHourly.textContent = fmtCur.format(hourly);
      if (els.kpiDaily) els.kpiDaily.textContent = fmtCur.format(daily);
      if (els.kpiWeekly) els.kpiWeekly.textContent = fmtCur.format(weekly);
      if (els.statMonthly) els.statMonthly.textContent = fmtCur.format(monthly);
      if (els.statBiweekly) els.statBiweekly.textContent = fmtCur.format(biweekly);

      var hrsPct = Math.min(Math.round((hoursWk / 168) * 100), 95);
      if (els.barSalary) els.barSalary.style.width = (100 - hrsPct) + '%';
      if (els.barTax) els.barTax.style.width = hrsPct + '%';
      if (els.legendLabel) els.legendLabel.textContent =
        'Annual ' + fmtCur.format(annual) + ' (' + Math.round(totalHours).toLocaleString() + ' hrs/yr)';
    }

    function resetUI() {
      if (els.kpiHourly) els.kpiHourly.textContent = '$0.00';
      if (els.kpiDaily) els.kpiDaily.textContent = '$0.00';
      if (els.kpiWeekly) els.kpiWeekly.textContent = '$0.00';
      if (els.statMonthly) els.statMonthly.textContent = '$0.00';
      if (els.statBiweekly) els.statBiweekly.textContent = '$0.00';
      if (els.barSalary) els.barSalary.style.width = '80%';
      if (els.barTax) els.barTax.style.width = '20%';
      if (els.legendLabel) els.legendLabel.textContent = 'Annual Salary';
    }

    [els.annual, els.hours, els.weeks].forEach(function (input) {
      if (input) input.addEventListener('input', calculate);
    });

    window.SHC = {
      setSalary: function (val) { els.annual.value = val; calculate(); },
      setHours: function (val) { els.hours.value = val; calculate(); },
      setWeeks: function (val) { els.weeks.value = val; calculate(); },
    };

    calculate();
  }

  /* ============================================================
     TOOL 5 — Tip Calculator (Plugin Style Edition)
     Formula: Tip = Bill × (Tip% / 100); Total = Bill + Tip
     Features: Real-time calculation, KPI cards, preset buttons, bar viz
  ============================================================ */
  function initTipCalculator() {
    var container = document.getElementById('tc-tip-calculator');
    if (!container) return;

    var els = {
      bill: el('tc-bill'),
      percent: el('tc-percent'),
      customGroup: el('tc-custom-group'),
      custom: el('tc-custom'),
      people: el('tc-people'),
      kpiTip: el('tc-kpi-tip'),
      kpiTotal: el('tc-kpi-total'),
      kpiPerPerson: el('tc-kpi-per-person'),
      statTipPer: el('tc-stat-tip-per'),
      statBillPer: el('tc-stat-bill-per'),
      barBill: el('tc-bar-bill'),
      barTip: el('tc-bar-tip'),
      legendBill: el('tc-legend-bill'),
      legendTip: el('tc-legend-tip'),
    };

    if (!els.bill || !els.percent || !els.people) return;

    var fmtCur = new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    });

    function getEffectivePct() {
      if (els.percent.value === 'custom') {
        return parseFloat(els.custom.value) || 0;
      }
      return parseFloat(els.percent.value) || 0;
    }

    function calculate() {
      var bill = parseFloat(els.bill.value) || 0;
      var tipPct = getEffectivePct();
      var people = parseFloat(els.people.value) || 1;

      if (bill <= 0 || tipPct < 0 || people < 1) {
        resetUI();
        return;
      }

      var tip = bill * (tipPct / 100);
      var total = bill + tip;
      var perPerson = total / people;
      var tipPer = tip / people;
      var billPer = bill / people;

      if (els.kpiTip) els.kpiTip.textContent = fmtCur.format(tip);
      if (els.kpiTotal) els.kpiTotal.textContent = fmtCur.format(total);
      if (els.kpiPerPerson) els.kpiPerPerson.textContent = fmtCur.format(perPerson);
      if (els.statTipPer) els.statTipPer.textContent = fmtCur.format(tipPer);
      if (els.statBillPer) els.statBillPer.textContent = fmtCur.format(billPer);

      var billPct = Math.round((bill / total) * 100);
      var tipPctBar = 100 - billPct;
      if (els.barBill) els.barBill.style.width = billPct + '%';
      if (els.barTip) els.barTip.style.width = tipPctBar + '%';
      if (els.legendBill) els.legendBill.textContent = 'Bill (' + billPct + '%)';
      if (els.legendTip) els.legendTip.textContent = 'Tip (' + tipPctBar + '%)';
    }

    function resetUI() {
      var zero = '$0.00';
      if (els.kpiTip) els.kpiTip.textContent = zero;
      if (els.kpiTotal) els.kpiTotal.textContent = zero;
      if (els.kpiPerPerson) els.kpiPerPerson.textContent = zero;
      if (els.statTipPer) els.statTipPer.textContent = zero;
      if (els.statBillPer) els.statBillPer.textContent = zero;
      if (els.barBill) els.barBill.style.width = '83%';
      if (els.barTip) els.barTip.style.width = '17%';
      if (els.legendBill) els.legendBill.textContent = 'Bill (83%)';
      if (els.legendTip) els.legendTip.textContent = 'Tip (17%)';
    }

    els.percent.addEventListener('change', function () {
      if (els.percent.value === 'custom') {
        els.customGroup.style.display = 'block';
        els.custom.focus();
      } else {
        els.customGroup.style.display = 'none';
      }
      calculate();
    });

    [els.bill, els.custom, els.people].forEach(function (input) {
      if (input) input.addEventListener('input', calculate);
    });

    window.TC = {
      setTip: function (val) {
        els.percent.value = val;
        els.customGroup.style.display = 'none';
        calculate();
      },
      setPeople: function (val) {
        els.people.value = val;
        calculate();
      }
    };

    calculate();
  }

  /* ============================================================
     TOOL 6 — Percentage Calculator (Plugin Style Edition)
     Three modes:
       A) What is X% of Y?      → Result = (X/100) * Y
       B) X is what % of Y?     → Result = (X/Y) * 100
       C) % change from X to Y  → Result = ((Y-X)/X) * 100
     Features: Real-time calculation, KPI cards, formula display
  ============================================================ */
  function initPercentageCalculator() {
    var container = document.getElementById('pct-calculator');
    if (!container) return;

    var els = {
      mode: el('pct-mode'),
      labelA: el('pct-a-label'),
      labelB: el('pct-b-label'),
      inputA: el('pct-a'),
      inputB: el('pct-b'),
      modeDesc: el('pct-mode-desc'),
      kpiResult: el('pct-kpi-result'),
      kpiSecondary: el('pct-kpi-secondary'),
      kpiSecondaryCard: el('pct-kpi-secondary-card'),
      resultLabel: el('pct-result-label'),
      secondaryLabel: el('pct-secondary-label'),
      impactDesc: el('pct-impact-desc'),
      impactStats: el('pct-impact-stats'),
      stat1: el('pct-stat-1'),
      formulaDisplay: el('pct-formula-display'),
    };

    if (!els.mode || !els.inputA || !els.inputB) return;

    var modes = {
      'of': {
        a: 'Percentage (X%)', b: 'Whole number (Y)',
        ph_a: 'e.g. 20', ph_b: 'e.g. 500',
        desc: 'Example: 20% of 500 = 100',
        resultLabel: 'Result',
        secondaryLabel: 'Of which is',
        formula: '(X ÷ 100) × Y',
        calc: function (a, b) {
          var result = (a / 100) * b;
          return { primary: fmt(result, 2), secondary: null, desc: a + '% of ' + b + ' = ' + fmt(result, 2) };
        }
      },
      'what': {
        a: 'Part (X)', b: 'Whole (Y)',
        ph_a: 'e.g. 75', ph_b: 'e.g. 300',
        desc: 'Example: 75 is what % of 300? = 25%',
        resultLabel: 'Percentage',
        secondaryLabel: 'Decimal',
        formula: '(X ÷ Y) × 100',
        calc: function (a, b) {
          var result = (a / b) * 100;
          return { primary: fmt(result, 2) + '%', secondary: fmt(a / b, 4), desc: a + ' is ' + fmt(result, 2) + '% of ' + b };
        }
      },
      'change': {
        a: 'Original value (X)', b: 'New value (Y)',
        ph_a: 'e.g. 80', ph_b: 'e.g. 100',
        desc: 'Example: From 80 to 100 = 25% increase',
        resultLabel: '% Change',
        secondaryLabel: 'Difference',
        formula: '((Y − X) ÷ X) × 100',
        calc: function (a, b) {
          var diff = b - a;
          var result = (diff / a) * 100;
          var sign = result > 0 ? 'increase' : 'decrease';
          return { primary: fmt(result, 2) + '% ' + sign, secondary: (diff > 0 ? '+' : '') + fmt(diff, 2), desc: 'From ' + a + ' to ' + b + ' = ' + fmt(result, 2) + '% ' + sign };
        }
      }
    };

    function updateMode() {
      var m = modes[els.mode.value];
      if (m) {
        els.labelA.textContent = m.a;
        els.labelB.textContent = m.b;
        els.inputA.placeholder = m.ph_a;
        els.inputB.placeholder = m.ph_b;
        els.modeDesc.textContent = m.desc;
        els.resultLabel.textContent = m.resultLabel;
        els.secondaryLabel.textContent = m.secondaryLabel;
        calculate();
      }
    }

    function resetUI() {
      els.kpiResult.textContent = '—';
      els.kpiSecondaryCard.style.display = 'none';
      els.impactStats.style.display = 'none';
      els.impactDesc.textContent = 'Enter values to see your percentage calculation update instantly.';
      els.formulaDisplay.innerHTML = '<span class="tfp-var">Result</span><span class="tfp-equals">=</span><span class="tfp-var">Enter values</span>';
    }

    function calculate() {
      var a = parseFloat(els.inputA.value);
      var b = parseFloat(els.inputB.value);
      var m = modes[els.mode.value];

      if (isNaN(a) || isNaN(b)) {
        resetUI();
        return;
      }

      var result = m.calc(a, b);
      els.kpiResult.textContent = result.primary;
      els.impactDesc.textContent = result.desc;
      els.impactStats.style.display = 'flex';
      els.stat1.textContent = m.formula;

      els.formulaDisplay.innerHTML = '<span class="tfp-var tfp-result">' + m.resultLabel + '</span><span class="tfp-equals">=</span><span class="tfp-var">' + m.formula + '</span><span class="tfp-equals">→</span><span class="tfp-var tfp-result">' + result.primary + '</span>';

      if (result.secondary) {
        els.kpiSecondary.textContent = result.secondary;
        els.kpiSecondaryCard.style.display = 'block';
      } else {
        els.kpiSecondaryCard.style.display = 'none';
      }
    }

    els.mode.addEventListener('change', updateMode);
    els.inputA.addEventListener('input', calculate);
    els.inputB.addEventListener('input', calculate);

    updateMode();
  }

  /* ============================================================
     TOOL 7 — Discount Calculator (Plugin Style Edition)
     Formula: Savings = Original × (Discount% / 100)
              Final   = Original − Savings
     Features: Real-time calculation, KPI cards, breakdown bar
  ============================================================ */
  function initDiscountCalculator() {
    var container = document.getElementById('dsc-calculator');
    if (!container) return;

    var els = {
      original: el('dsc-original'),
      percent: el('dsc-percent'),
      kpiFinal: el('dsc-kpi-final'),
      kpiSavings: el('dsc-kpi-savings'),
      kpiPayPct: el('dsc-kpi-pay-pct'),
      impactDesc: el('dsc-impact-desc'),
      impactStats: el('dsc-impact-stats'),
      statOriginal: el('dsc-stat-original'),
      statSaved: el('dsc-stat-saved'),
      barFinal: el('dsc-bar-final'),
      barSaving: el('dsc-bar-saving'),
      legendFinal: el('dsc-legend-final'),
      legendSaving: el('dsc-legend-saving'),
    };

    if (!els.original || !els.percent) return;

    var fmtCur = new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    });

    function calculate() {
      var original = parseFloat(els.original.value) || 0;
      var pct = parseFloat(els.percent.value) || 0;

      if (original <= 0 || pct < 0 || pct > 100) {
        resetUI();
        return;
      }

      var savings = original * (pct / 100);
      var finalPrice = original - savings;
      var finalPct = 100 - pct;
      var barFinalW = Math.max(0, Math.min(100, finalPct));
      var barSavingW = Math.max(0, Math.min(100, pct));

      if (els.kpiFinal) els.kpiFinal.textContent = fmtCur.format(finalPrice);
      if (els.kpiSavings) els.kpiSavings.textContent = fmtCur.format(savings);
      if (els.kpiPayPct) els.kpiPayPct.textContent = finalPct.toFixed(1) + '% of original';

      if (els.impactDesc) els.impactDesc.textContent =
        fmtCur.format(original) + ' at ' + pct + '% off → pay ' + fmtCur.format(finalPrice) + ', save ' + fmtCur.format(savings) + '.';

      if (els.impactStats) els.impactStats.style.display = 'grid';
      if (els.statOriginal) els.statOriginal.textContent = fmtCur.format(original);
      if (els.statSaved) els.statSaved.textContent = fmtCur.format(savings);

      if (els.barFinal) els.barFinal.style.width = barFinalW + '%';
      if (els.barSaving) els.barSaving.style.width = barSavingW + '%';
      if (els.legendFinal) els.legendFinal.textContent = 'Final Price (' + finalPct.toFixed(0) + '%)';
      if (els.legendSaving) els.legendSaving.textContent = 'You Save (' + pct.toFixed(0) + '%)';
    }

    function resetUI() {
      if (els.kpiFinal) els.kpiFinal.textContent = '—';
      if (els.kpiSavings) els.kpiSavings.textContent = '—';
      if (els.kpiPayPct) els.kpiPayPct.textContent = '—';
      if (els.impactDesc) els.impactDesc.textContent = 'Enter a price and discount to see your savings instantly.';
      if (els.impactStats) els.impactStats.style.display = 'none';
      if (els.barFinal) els.barFinal.style.width = '70%';
      if (els.barSaving) els.barSaving.style.width = '30%';
      if (els.legendFinal) els.legendFinal.textContent = 'Final Price (—)';
      if (els.legendSaving) els.legendSaving.textContent = 'You Save (—)';
    }

    [els.original, els.percent].forEach(function (input) {
      if (input) input.addEventListener('input', calculate);
    });

    window.DSC = {
      setPrice: function (val) { els.original.value = val; calculate(); },
      setPercent: function (val) { els.percent.value = val; calculate(); },
    };

    calculate();
  }

  /* ============================================================
     TOOL 8 — Fuel Cost Calculator (Plugin Style Edition)
     Formula: Cost = (Distance / MPG) × Gas Price
     Features: Real-time calculation, KPI cards, glass-morphism UI
  ============================================================ */
  function initFuelCalculator() {
    // Check if new plugin-style UI exists
    var container = document.getElementById('fcc-fuel-calculator');
    if (!container) return;

    // Elements
    var els = {
      distance: el('fcc-distance'),
      mpg: el('fcc-mpg'),
      price: el('fcc-price'),
      kpiTotal: el('fcc-kpi-total'),
      kpiGallons: el('fcc-kpi-gallons'),
      kpiMile: el('fcc-kpi-mile'),
      statOneway: el('fcc-stat-oneway'),
      statRound: el('fcc-stat-round'),
      barFuel: el('fcc-bar-fuel'),
      barReserve: el('fcc-bar-reserve'),
    };

    // Check if all required elements exist
    if (!els.distance || !els.mpg || !els.price) return;

    // Formatters
    var fmtCurrency = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    var fmtNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

    // Calculate and render
    function calculate() {
      var distance = parseFloat(els.distance.value) || 0;
      var mpg = parseFloat(els.mpg.value) || 0;
      var price = parseFloat(els.price.value) || 0;

      if (distance <= 0 || mpg <= 0 || price <= 0) {
        resetUI();
        return;
      }

      var gallons = distance / mpg;
      var totalCost = gallons * price;
      var costPerMile = totalCost / distance;

      // Update KPIs
      if (els.kpiTotal) els.kpiTotal.textContent = fmtCurrency.format(totalCost);
      if (els.kpiGallons) els.kpiGallons.textContent = fmtNumber.format(gallons);
      if (els.kpiMile) els.kpiMile.textContent = fmtCurrency.format(costPerMile);

      // Update impact stats
      if (els.statOneway) els.statOneway.textContent = fmtCurrency.format(totalCost);
      if (els.statRound) els.statRound.textContent = fmtCurrency.format(totalCost * 2);

      // Update visual bar
      if (els.barFuel) els.barFuel.style.width = '75%';
      if (els.barReserve) els.barReserve.style.width = '25%';
    }

    function resetUI() {
      if (els.kpiTotal) els.kpiTotal.textContent = '$0.00';
      if (els.kpiGallons) els.kpiGallons.textContent = '0.0';
      if (els.kpiMile) els.kpiMile.textContent = '$0.00';
      if (els.statOneway) els.statOneway.textContent = '$0.00';
      if (els.statRound) els.statRound.textContent = '$0.00';
      if (els.barFuel) els.barFuel.style.width = '75%';
      if (els.barReserve) els.barReserve.style.width = '25%';
    }

    // Event binding - real-time calculation
    [els.distance, els.mpg, els.price].forEach(function (input) {
      if (input) input.addEventListener('input', calculate);
    });

    // Preset helpers (exposed globally)
    window.FCC = {
      setMPG: function (val) {
        els.mpg.value = val;
        calculate();
      },
      setPrice: function (val) {
        els.price.value = val;
        calculate();
      }
    };

    // Initial calc if prefilled
    calculate();
  }

  /* ============================================================
     TOOL 9 — Unit Converter (Plugin Style Edition)
     Length: km ↔ miles | Weight: kg ↔ lbs | Temp: C ↔ F
     Features: Real-time calculation, KPI cards, reference table, presets
  ============================================================ */
  function initUnitConverter() {
    var container = document.getElementById('unc-calculator');
    if (!container) return;

    var els = {
      tabBtns: document.querySelectorAll('.unc-tab-btn'),
      panels: document.querySelectorAll('.unc-panel'),
      lengthMode: el('unc-length-mode'),
      lengthValue: el('unc-length-value'),
      weightMode: el('unc-weight-mode'),
      weightValue: el('unc-weight-value'),
      tempMode: el('unc-temp-mode'),
      tempValue: el('unc-temp-value'),
      kpiResult: el('unc-kpi-result'),
      kpiInput: el('unc-kpi-input'),
      kpiFormula: el('unc-kpi-formula'),
      impactDesc: el('unc-impact-desc'),
      impactStats: el('unc-impact-stats'),
      statFrom: el('unc-stat-from'),
      statTo: el('unc-stat-to'),
      refList: el('unc-ref-list'),
    };

    var refData = {
      'unc-length': {
        'km-to-mi': [
          ['1 km', '0.6214 mi'], ['5 km', '3.107 mi'],
          ['10 km', '6.214 mi'], ['42.195 km', '26.219 mi']
        ],
        'mi-to-km': [
          ['1 mi', '1.6093 km'], ['5 mi', '8.047 km'],
          ['10 mi', '16.093 km'], ['26.219 mi', '42.195 km']
        ]
      },
      'unc-weight': {
        'kg-to-lbs': [
          ['50 kg', '110.23 lbs'], ['70 kg', '154.32 lbs'],
          ['80 kg', '176.37 lbs'], ['100 kg', '220.46 lbs']
        ],
        'lbs-to-kg': [
          ['100 lbs', '45.36 kg'], ['150 lbs', '68.04 kg'],
          ['175 lbs', '79.38 kg'], ['200 lbs', '90.72 kg']
        ]
      },
      'unc-temp': {
        'c-to-f': [
          ['0°C', '32°F'], ['20°C', '68°F'],
          ['37°C', '98.6°F'], ['100°C', '212°F']
        ],
        'f-to-c': [
          ['32°F', '0°C'], ['68°F', '20°C'],
          ['98.6°F', '37°C'], ['212°F', '100°C']
        ]
      }
    };

    var activeTab = 'unc-length';

    function getActiveMode() {
      if (activeTab === 'unc-length') return els.lengthMode ? els.lengthMode.value : 'km-to-mi';
      if (activeTab === 'unc-weight') return els.weightMode ? els.weightMode.value : 'kg-to-lbs';
      if (activeTab === 'unc-temp') return els.tempMode ? els.tempMode.value : 'c-to-f';
      return '';
    }

    function updateRefTable() {
      if (!els.refList) return;
      var mode = getActiveMode();
      var rows = (refData[activeTab] && refData[activeTab][mode]) || [];
      els.refList.innerHTML = rows.map(function (r) {
        return '<div class="unc-ref-row"><span>' + r[0] + '</span><span>=</span><span>' + r[1] + '</span></div>';
      }).join('');
    }

    function resetUI() {
      if (els.kpiResult) els.kpiResult.textContent = '—';
      if (els.kpiInput) els.kpiInput.textContent = '—';
      if (els.kpiFormula) els.kpiFormula.textContent = '—';
      if (els.impactDesc) els.impactDesc.textContent = 'Select a category and enter a value to convert instantly.';
      if (els.impactStats) els.impactStats.style.display = 'none';
    }

    function calculate() {
      var value, mode, result, fromLabel, toLabel, formulaLabel;

      if (activeTab === 'unc-length') {
        value = parseFloat(els.lengthValue ? els.lengthValue.value : '');
        mode = els.lengthMode ? els.lengthMode.value : 'km-to-mi';
        if (isNaN(value)) { resetUI(); return; }
        if (mode === 'km-to-mi') {
          result = value * 0.621371;
          fromLabel = fmt(value, 4) + ' km';
          toLabel = fmt(result, 4) + ' mi';
          formulaLabel = '× 0.621371';
        } else {
          result = value * 1.60934;
          fromLabel = fmt(value, 4) + ' mi';
          toLabel = fmt(result, 4) + ' km';
          formulaLabel = '× 1.60934';
        }

      } else if (activeTab === 'unc-weight') {
        value = parseFloat(els.weightValue ? els.weightValue.value : '');
        mode = els.weightMode ? els.weightMode.value : 'kg-to-lbs';
        if (isNaN(value)) { resetUI(); return; }
        if (mode === 'kg-to-lbs') {
          result = value * 2.20462;
          fromLabel = fmt(value, 4) + ' kg';
          toLabel = fmt(result, 4) + ' lbs';
          formulaLabel = '× 2.20462';
        } else {
          result = value * 0.453592;
          fromLabel = fmt(value, 4) + ' lbs';
          toLabel = fmt(result, 4) + ' kg';
          formulaLabel = '× 0.453592';
        }

      } else if (activeTab === 'unc-temp') {
        value = parseFloat(els.tempValue ? els.tempValue.value : '');
        mode = els.tempMode ? els.tempMode.value : 'c-to-f';
        if (isNaN(value)) { resetUI(); return; }
        if (mode === 'c-to-f') {
          result = (value * 9 / 5) + 32;
          fromLabel = fmt(value, 2) + '°C';
          toLabel = fmt(result, 2) + '°F';
          formulaLabel = '(× 9/5) + 32';
        } else {
          result = (value - 32) * 5 / 9;
          fromLabel = fmt(value, 2) + '°F';
          toLabel = fmt(result, 2) + '°C';
          formulaLabel = '(− 32) × 5/9';
        }
      } else {
        return;
      }

      if (els.kpiResult) els.kpiResult.textContent = toLabel;
      if (els.kpiInput) els.kpiInput.textContent = fromLabel;
      if (els.kpiFormula) els.kpiFormula.textContent = formulaLabel;
      if (els.impactDesc) els.impactDesc.textContent = fromLabel + ' = ' + toLabel;
      if (els.impactStats) els.impactStats.style.display = 'grid';
      if (els.statFrom) els.statFrom.textContent = fromLabel;
      if (els.statTo) els.statTo.textContent = toLabel;
    }

    // Tab switching
    els.tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        els.tabBtns.forEach(function (b) {
          b.classList.remove('unc-tab-btn--active');
          b.setAttribute('aria-selected', 'false');
        });
        els.panels.forEach(function (p) { p.classList.remove('unc-panel--active'); });
        btn.classList.add('unc-tab-btn--active');
        btn.setAttribute('aria-selected', 'true');
        activeTab = btn.getAttribute('data-tab');
        var targetPanel = document.getElementById(activeTab);
        if (targetPanel) targetPanel.classList.add('unc-panel--active');
        resetUI();
        updateRefTable();
      });
    });

    // Mode selects update reference table and recalculate
    [els.lengthMode, els.weightMode, els.tempMode].forEach(function (sel) {
      if (sel) {
        sel.addEventListener('change', function () {
          updateRefTable();
          calculate();
        });
      }
    });

    // Value inputs trigger real-time calculation
    [els.lengthValue, els.weightValue, els.tempValue].forEach(function (inp) {
      if (inp) inp.addEventListener('input', calculate);
    });

    // Preset helpers (exposed globally for onclick attributes)
    window.UNC = {
      setLength: function (val) {
        if (els.lengthValue) { els.lengthValue.value = val; calculate(); }
      },
      setWeight: function (val) {
        if (els.weightValue) { els.weightValue.value = val; calculate(); }
      },
      setTemp: function (val) {
        if (els.tempValue) { els.tempValue.value = val; calculate(); }
      }
    };

    updateRefTable();
    calculate();
  }

  /* ============================================================
     AdSense lazy loader — only loads ads after page is interactive
  ============================================================ */
  function initAdSenseLazy() {
    var adSlots = document.querySelectorAll('.ad-slot');
    if (!adSlots.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var slot = entry.target;
            var ins = slot.querySelector('.adsbygoogle');
            if (ins && !ins.getAttribute('data-adsbygoogle-status')) {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
            observer.unobserve(slot);
          }
        });
      }, { rootMargin: '200px 0px' });

      adSlots.forEach(function (slot) {
        observer.observe(slot);
      });
    } else {
      // Fallback: load all ads immediately
      adSlots.forEach(function () {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      });
    }
  }

  /* ============================================================
     Boot — initialize whichever tool is on the current page
  ============================================================ */
  function init() {
    initLoanCalculator();
    initCreditCardCalculator();
    initCompoundInterestCalculator();
    initSalaryConverter();
    initTipCalculator();
    initPercentageCalculator();
    initDiscountCalculator();
    initFuelCalculator();
    initUnitConverter();
    bindFAQ();
    initAdSenseLazy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/* ============================================================
   Loan Payment Calculator V2 — Tab switcher (global, used by onclick)
============================================================ */
function lpcSwitchTab(tab) {
  var summary = document.getElementById('lpc-view-summary');
  var schedule = document.getElementById('lpc-view-schedule');
  var tSum = document.getElementById('lpc-tab-summary');
  var tSch = document.getElementById('lpc-tab-schedule');
  if (tab === 'summary') {
    if (summary) summary.classList.remove('lpc-hidden');
    if (schedule) schedule.classList.add('lpc-hidden');
    if (tSum) tSum.classList.add('lpc-tab--active');
    if (tSch) tSch.classList.remove('lpc-tab--active');
  } else {
    if (summary) summary.classList.add('lpc-hidden');
    if (schedule) schedule.classList.remove('lpc-hidden');
    if (tSch) tSch.classList.add('lpc-tab--active');
    if (tSum) tSum.classList.remove('lpc-tab--active');
  }
}
