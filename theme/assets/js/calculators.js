/**
 * ToolsHub — Calculators (Vanilla JS, no frameworks)
 * All 10 tools. Runs in footer, deferred by LiteSpeed.
 * Performance: No dependencies, < 6kb minified.
 */

(function () {
  'use strict';

  /* ============================================================
     Utility helpers
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
     TOOL 2 — Credit Card Interest Calculator
     Formula: Monthly Interest = Balance × (APR / 100 / 12)
  ============================================================ */
  function initCreditCardCalculator() {
    var form = el('cc-form');
    if (!form) return;

    var resultEl = el('cc-result');
    var errorEl = el('cc-error');
    var resetBtn = el('cc-reset');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var balance = parseFloat(el('cc-balance').value);
      var apr = parseFloat(el('cc-apr').value);
      var payment = parseFloat(el('cc-payment').value);

      if (isNaN(balance) || balance <= 0) return showError(resultEl, errorEl, 'Please enter a valid balance.');
      if (isNaN(apr) || apr < 0) return showError(resultEl, errorEl, 'Please enter a valid APR.');
      if (isNaN(payment) || payment <= 0) return showError(resultEl, errorEl, 'Please enter a valid monthly payment.');

      var monthlyRate = apr / 100 / 12;
      var monthlyInterest = balance * monthlyRate;
      var principal = payment - monthlyInterest;

      if (payment <= monthlyInterest) {
        return showError(resultEl, errorEl, 'Your payment is too low to cover the interest. The balance will never be paid off. Increase your monthly payment above ' + fmtCurrency(monthlyInterest) + '.');
      }

      // Months to pay off
      var months = Math.log(payment / (payment - balance * monthlyRate)) / Math.log(1 + monthlyRate);
      var totalPaid = payment * Math.ceil(months);
      var totalInterest = totalPaid - balance;

      el('cc-monthly-interest').textContent = fmtCurrency(monthlyInterest);
      el('cc-principal-paid').textContent = fmtCurrency(principal);
      el('cc-months').textContent = Math.ceil(months) + ' months';
      el('cc-total-interest').textContent = fmtCurrency(totalInterest);

      showResult(resultEl, errorEl);
      resetBtn && resetBtn.classList.add('is-visible');
    });

    bindReset(resetBtn, form, resultEl, errorEl);
  }

  /* ============================================================
     TOOL 3 — Compound Interest Calculator
     Formula: A = P(1 + r/n)^(nt)
  ============================================================ */
  function initCompoundInterestCalculator() {
    var form = el('ci-form');
    if (!form) return;

    var resultEl = el('ci-result');
    var errorEl = el('ci-error');
    var resetBtn = el('ci-reset');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var P = parseFloat(el('ci-principal').value);
      var r = parseFloat(el('ci-rate').value) / 100;
      var n = parseFloat(el('ci-frequency').value);
      var t = parseFloat(el('ci-years').value);

      if (isNaN(P) || P <= 0) return showError(resultEl, errorEl, 'Please enter a valid principal amount.');
      if (isNaN(r) || r < 0) return showError(resultEl, errorEl, 'Please enter a valid interest rate.');
      if (isNaN(n) || n <= 0) return showError(resultEl, errorEl, 'Invalid compounding frequency.');
      if (isNaN(t) || t <= 0) return showError(resultEl, errorEl, 'Please enter a valid time period.');

      var A = P * Math.pow(1 + r / n, n * t);
      var interest = A - P;

      el('ci-final').textContent = fmtCurrency(A);
      el('ci-principal-out').textContent = fmtCurrency(P);
      el('ci-earned').textContent = fmtCurrency(interest);

      showResult(resultEl, errorEl);
      resetBtn && resetBtn.classList.add('is-visible');
    });

    bindReset(resetBtn, form, resultEl, errorEl);
  }

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
     TOOL 8 — Fuel Cost Calculator
     Formula: Cost = (Distance / MPG) × Gas Price
  ============================================================ */
  function initFuelCalculator() {
    var form = el('fuel-form');
    if (!form) return;

    var resultEl = el('fuel-result');
    var errorEl = el('fuel-error');
    var resetBtn = el('fuel-reset');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var distance = parseFloat(el('fuel-distance').value);
      var mpg = parseFloat(el('fuel-mpg').value);
      var price = parseFloat(el('fuel-price').value);

      if (isNaN(distance) || distance <= 0) return showError(resultEl, errorEl, 'Please enter a valid distance.');
      if (isNaN(mpg) || mpg <= 0) return showError(resultEl, errorEl, 'Please enter a valid fuel efficiency (MPG).');
      if (isNaN(price) || price <= 0) return showError(resultEl, errorEl, 'Please enter a valid gas price.');

      var gallonsUsed = distance / mpg;
      var totalCost = gallonsUsed * price;
      var costPerMile = totalCost / distance;

      el('fuel-gallons').textContent = fmt(gallonsUsed, 2) + ' gallons';
      el('fuel-cost').textContent = fmtCurrency(totalCost);
      el('fuel-per-mile').textContent = fmtCurrency(costPerMile) + ' / mile';

      showResult(resultEl, errorEl);
      resetBtn && resetBtn.classList.add('is-visible');
    });

    bindReset(resetBtn, form, resultEl, errorEl);
  }

  /* ============================================================
     TOOL 9 — Date Difference Calculator
     Formula: Days = End Date − Start Date
  ============================================================ */
  function initDateDiffCalculator() {
    var form = el('date-form');
    if (!form) return;

    var resultEl = el('date-result');
    var errorEl = el('date-error');
    var resetBtn = el('date-reset');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var startVal = el('date-start').value;
      var endVal = el('date-end').value;

      if (!startVal) return showError(resultEl, errorEl, 'Please select a start date.');
      if (!endVal) return showError(resultEl, errorEl, 'Please select an end date.');

      var start = new Date(startVal);
      var end = new Date(endVal);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return showError(resultEl, errorEl, 'Invalid date(s) entered.');
      }

      var diffMs = end - start;
      var diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      var absDays = Math.abs(diffDays);
      var weeks = Math.floor(absDays / 7);
      var days = absDays % 7;
      var months = Math.floor(absDays / 30.4375);
      var years = Math.floor(absDays / 365.25);

      var direction = diffDays >= 0 ? 'from start to end' : 'end is before start';

      el('date-days').textContent = absDays + ' days (' + direction + ')';
      el('date-weeks').textContent = weeks + ' weeks, ' + days + ' day(s)';
      el('date-months').textContent = months + ' months (approx.)';
      el('date-years').textContent = years + ' year(s) (approx.)';

      showResult(resultEl, errorEl);
      resetBtn && resetBtn.classList.add('is-visible');
    });

    bindReset(resetBtn, form, resultEl, errorEl);
  }

  /* ============================================================
     TOOL 10 — Unit Converter
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
    initDateDiffCalculator();
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
