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
     Formula: Hourly = Annual Salary / 2080
  ============================================================ */
  function initSalaryConverter() {
    var form = el('salary-form');
    if (!form) return;

    var resultEl = el('salary-result');
    var errorEl = el('salary-error');
    var resetBtn = el('salary-reset');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var annual = parseFloat(el('salary-annual').value);
      var hoursWk = parseFloat(el('salary-hours').value) || 40;
      var weeksYr = parseFloat(el('salary-weeks').value) || 52;

      if (isNaN(annual) || annual <= 0) return showError(resultEl, errorEl, 'Please enter a valid annual salary.');

      var totalHours = hoursWk * weeksYr;
      var hourly = annual / totalHours;
      var monthly = annual / 12;
      var weekly = annual / weeksYr;
      var daily = annual / (weeksYr * 5);

      el('salary-hourly').textContent = fmtCurrency(hourly);
      el('salary-daily').textContent = fmtCurrency(daily);
      el('salary-weekly').textContent = fmtCurrency(weekly);
      el('salary-monthly').textContent = fmtCurrency(monthly);

      showResult(resultEl, errorEl);
      resetBtn && resetBtn.classList.add('is-visible');
    });

    bindReset(resetBtn, form, resultEl, errorEl);
  }

  /* ============================================================
     TOOL 5 — Tip Calculator
     Formula: Tip = Bill × (Tip% / 100); Total = Bill + Tip
  ============================================================ */
  function initTipCalculator() {
    var form = el('tip-form');
    if (!form) return;

    var resultEl = el('tip-result');
    var errorEl = el('tip-error');
    var resetBtn = el('tip-reset');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var bill = parseFloat(el('tip-bill').value);
      var tipPct = parseFloat(el('tip-percent').value);
      var people = parseFloat(el('tip-people').value) || 1;

      if (isNaN(bill) || bill <= 0) return showError(resultEl, errorEl, 'Please enter a valid bill amount.');
      if (isNaN(tipPct) || tipPct < 0) return showError(resultEl, errorEl, 'Please enter a valid tip percentage.');
      if (people < 1) return showError(resultEl, errorEl, 'Number of people must be at least 1.');

      var tip = bill * (tipPct / 100);
      var total = bill + tip;
      var perPerson = total / people;
      var tipPer = tip / people;

      el('tip-amount').textContent = fmtCurrency(tip);
      el('tip-total').textContent = fmtCurrency(total);
      el('tip-per-person').textContent = fmtCurrency(perPerson);
      el('tip-per-tip').textContent = fmtCurrency(tipPer);

      showResult(resultEl, errorEl);
      resetBtn && resetBtn.classList.add('is-visible');
    });

    bindReset(resetBtn, form, resultEl, errorEl);
  }

  /* ============================================================
     TOOL 6 — Percentage Calculator
     Three modes:
       A) What is X% of Y?      → Result = (X/100) * Y
       B) X is what % of Y?     → Result = (X/Y) * 100
       C) % change from X to Y  → Result = ((Y-X)/X) * 100
  ============================================================ */
  function initPercentageCalculator() {
    var form = el('pct-form');
    if (!form) return;

    var resultEl = el('pct-result');
    var errorEl = el('pct-error');
    var resetBtn = el('pct-reset');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var mode = el('pct-mode').value;
      var a = parseFloat(el('pct-a').value);
      var b = parseFloat(el('pct-b').value);
      var result;
      var label;

      if (isNaN(a) || isNaN(b)) return showError(resultEl, errorEl, 'Please fill in both fields.');

      if (mode === 'of') {
        result = (a / 100) * b;
        label = a + '% of ' + fmt(b, 2) + ' =';
      } else if (mode === 'what') {
        if (b === 0) return showError(resultEl, errorEl, 'Whole value cannot be zero.');
        result = (a / b) * 100;
        label = fmt(a, 2) + ' is what % of ' + fmt(b, 2) + '?';
      } else if (mode === 'change') {
        if (a === 0) return showError(resultEl, errorEl, 'Starting value cannot be zero.');
        result = ((b - a) / a) * 100;
        label = 'Change from ' + fmt(a, 2) + ' to ' + fmt(b, 2);
      }

      el('pct-label').textContent = label;
      el('pct-answer').textContent = fmt(result, 4) + (mode === 'of' ? '' : '%');

      showResult(resultEl, errorEl);
      resetBtn && resetBtn.classList.add('is-visible');
    });

    bindReset(resetBtn, form, resultEl, errorEl);
  }

  /* ============================================================
     TOOL 7 — Discount Calculator
     Formula: Final = Original - (Original × Discount%)
  ============================================================ */
  function initDiscountCalculator() {
    var form = el('discount-form');
    if (!form) return;

    var resultEl = el('discount-result');
    var errorEl = el('discount-error');
    var resetBtn = el('discount-reset');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var original = parseFloat(el('discount-original').value);
      var pct = parseFloat(el('discount-percent').value);

      if (isNaN(original) || original <= 0) return showError(resultEl, errorEl, 'Please enter a valid original price.');
      if (isNaN(pct) || pct < 0 || pct > 100) return showError(resultEl, errorEl, 'Discount must be between 0 and 100.');

      var savings = original * (pct / 100);
      var finalPrice = original - savings;

      el('discount-savings').textContent = fmtCurrency(savings);
      el('discount-final').textContent = fmtCurrency(finalPrice);
      el('discount-original-out').textContent = fmtCurrency(original);

      showResult(resultEl, errorEl);
      resetBtn && resetBtn.classList.add('is-visible');
    });

    bindReset(resetBtn, form, resultEl, errorEl);
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
     TOOL 9 — Unit Converter
     Length: km ↔ miles | Weight: kg ↔ lbs | Temp: C ↔ F
  ============================================================ */
  function initUnitConverter() {
    var form = el('unit-form');
    if (!form) return;

    var resultEl = el('unit-result');
    var errorEl = el('unit-error');
    var resetBtn = el('unit-reset');
    var tabBtns = document.querySelectorAll('.unit-tab-btn');
    var panels = document.querySelectorAll('.unit-panel');

    // Tab switching
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabBtns.forEach(function (b) { b.classList.remove('is-active'); });
        panels.forEach(function (p) { p.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var target = btn.getAttribute('data-tab');
        var targetPanel = document.getElementById(target);
        if (targetPanel) targetPanel.classList.add('is-active');
        resultEl && resultEl.classList.remove('is-visible');
        errorEl && errorEl.classList.remove('is-visible');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var activeTab = document.querySelector('.unit-tab-btn.is-active');
      if (!activeTab) return;
      var type = activeTab.getAttribute('data-tab');

      if (type === 'unit-length') {
        var lVal = parseFloat(el('length-value').value);
        var lMode = el('length-mode').value;
        if (isNaN(lVal)) return showError(resultEl, errorEl, 'Please enter a valid number.');
        var lResult, lLabel;
        if (lMode === 'km-to-mi') {
          lResult = lVal * 0.621371;
          lLabel = fmt(lVal, 4) + ' km = ' + fmt(lResult, 4) + ' miles';
        } else {
          lResult = lVal * 1.60934;
          lLabel = fmt(lVal, 4) + ' miles = ' + fmt(lResult, 4) + ' km';
        }
        el('unit-answer').textContent = lLabel;

      } else if (type === 'unit-weight') {
        var wVal = parseFloat(el('weight-value').value);
        var wMode = el('weight-mode').value;
        if (isNaN(wVal)) return showError(resultEl, errorEl, 'Please enter a valid number.');
        var wResult, wLabel;
        if (wMode === 'kg-to-lbs') {
          wResult = wVal * 2.20462;
          wLabel = fmt(wVal, 4) + ' kg = ' + fmt(wResult, 4) + ' lbs';
        } else {
          wResult = wVal * 0.453592;
          wLabel = fmt(wVal, 4) + ' lbs = ' + fmt(wResult, 4) + ' kg';
        }
        el('unit-answer').textContent = wLabel;

      } else if (type === 'unit-temp') {
        var tVal = parseFloat(el('temp-value').value);
        var tMode = el('temp-mode').value;
        if (isNaN(tVal)) return showError(resultEl, errorEl, 'Please enter a valid temperature.');
        var tResult, tLabel;
        if (tMode === 'c-to-f') {
          tResult = (tVal * 9 / 5) + 32;
          tLabel = fmt(tVal, 2) + '°C = ' + fmt(tResult, 2) + '°F';
        } else {
          tResult = (tVal - 32) * 5 / 9;
          tLabel = fmt(tVal, 2) + '°F = ' + fmt(tResult, 2) + '°C';
        }
        el('unit-answer').textContent = tLabel;
      }

      showResult(resultEl, errorEl);
      resetBtn && resetBtn.classList.add('is-visible');
    });

    bindReset(resetBtn, form, resultEl, errorEl);
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
