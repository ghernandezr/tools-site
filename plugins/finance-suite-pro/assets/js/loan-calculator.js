/**
 * Finance Suite Pro — Loan Calculator UI Controller (LoanMaster Pro design)
 *
 * Responsibilities:
 *   • Reactive calculation on every input event (no Calculate button).
 *   • Call FSP_Engine.calculateMortgage() for full PITI + escrow + refi logic.
 *   • Render KPIs, impact panel, donut chart, 4 analysis tabs.
 *   • Handle tab switching and amortization view toggle (annual/monthly).
 *   • Parse URL parameters (?fsp_amount=...) for pre-calculation on load.
 *   • Expose FSP_LC namespace for onclick handlers in the template.
 *
 * Depends on: finance-engine.js (loaded first via wp_enqueue_script dependency).
 * No jQuery. No global pollution beyond FSP_LC.
 */

(function (global) {

	'use strict';

	// ─── State ────────────────────────────────────────────────────────────────────
	let el = {};
	let lastResult = null;
	let currentTab = 'breakdown';
	let currentAmortView = 'annual'; // 'annual' | 'monthly'

	// ─── Bootstrap ───────────────────────────────────────────────────────────────

	document.addEventListener('DOMContentLoaded', function () {
		if (!document.getElementById('fsp-loan-calculator')) return;
		cacheElements();
		bindEvents();
		calculate();
	});

	// ─── Cache DOM elements ───────────────────────────────────────────────────────

	function cacheElements() {
		el = {
			// Inputs
			amount: document.getElementById('fsp-amount'),
			rate: document.getElementById('fsp-rate'),
			years: document.getElementById('fsp-years'),
			extra: document.getElementById('fsp-extra'),
			tax: document.getElementById('fsp-tax'),
			insurance: document.getElementById('fsp-insurance'),
			// KPIs
			monthly: document.getElementById('fsp-monthly-payment'),
			saved: document.getElementById('fsp-interest-saved'),
			payoff: document.getElementById('fsp-payoff-time'),
			timeSaved: document.getElementById('fsp-time-saved'),
			// Impact panel
			totalInt: document.getElementById('fsp-total-interest'),
			totalSav: document.getElementById('fsp-total-savings'),
			// Breakdown tab
			circlePi: document.getElementById('fsp-circle-pi'),
			circleEsc: document.getElementById('fsp-circle-escrow'),
			pctPi: document.getElementById('fsp-pct-pi'),
			detPi: document.getElementById('fsp-det-pi'),
			detEscrow: document.getElementById('fsp-det-escrow'),
			detExtra: document.getElementById('fsp-det-extra'),
			detTotal: document.getElementById('fsp-det-total'),
			// Equity tab
			eqLabel: document.getElementById('fsp-eq-label'),
			eqValue: document.getElementById('fsp-eq-value'),
			eqPct: document.getElementById('fsp-eq-pct'),
			eqTime: document.getElementById('fsp-eq-time'),
			// Refi tab
			refiRate: document.getElementById('fsp-refi-current-rate'),
			refiTarget: document.getElementById('fsp-refi-target-rate'),
			refiSavings: document.getElementById('fsp-refi-savings'),
			// Amortization table
			amortBody: document.getElementById('fsp-amort-tbody'),
		};
		resetUI();
	}

	// ─── Event binding ────────────────────────────────────────────────────────────

	function bindEvents() {
		[el.amount, el.rate, el.years, el.extra, el.tax, el.insurance]
			.forEach(function (inp) {
				if (inp) inp.addEventListener('input', calculate);
			});
	}

	// ─── Core calculate ───────────────────────────────────────────────────────────

	function calculate() {
		const P = parseFloat(el.amount.value) || 0;
		const r = parseFloat(el.rate.value) || 0;
		const yr = parseFloat(el.years.value) || 0;
		const ext = parseFloat(el.extra.value) || 0;
		const tax = parseFloat(el.tax.value) || 0;
		const ins = parseFloat(el.insurance.value) || 0;

		if (P <= 0 || r <= 0 || yr <= 0) {
			lastResult = null;
			resetUI();
			return;
		}

		lastResult = FSP_Engine.calculateMortgage({
			principal: P,
			rate: r,
			years: yr,
			extraMonthly: ext,
			annualTax: tax,
			annualIns: ins,
		});

		renderAll(lastResult, P, r, ext);
	}

	// ─── Render all sections ──────────────────────────────────────────────────────

	function renderAll(res, P, rate, extra) {
		renderKPIs(res);
		renderImpact(res);
		renderBreakdown(res, extra);
		renderEquity(res, P);
		renderRefi(res, rate);
		renderAmortTable(res);
	}

	// ─── KPI Cards ────────────────────────────────────────────────────────────────

	function renderKPIs(res) {
		el.monthly.textContent = fmt(res.totalMonthly);
		el.saved.textContent = fmt(res.interestSaved);

		const yrs = Math.floor(res.payoffMonthsWith / 12);
		const mo = res.payoffMonthsWith % 12;
		el.payoff.innerHTML = yrs + 'Y <span style="color:#94a3b8;font-size:1.1rem">' + mo + 'M</span>';

		const yrSav = Math.floor(res.monthsSaved / 12);
		const moSav = res.monthsSaved % 12;
		if (res.monthsSaved > 0) {
			el.timeSaved.textContent = 'SAVES ' + yrSav + ' YRS AND ' + moSav + ' MO';
		} else {
			el.timeSaved.textContent = 'No extra payment applied';
		}
	}

	// ─── Impact Panel ────────────────────────────────────────────────────────────

	function renderImpact(res) {
		el.totalInt.textContent = fmt(res.totalInterestWith);
		el.totalSav.textContent = fmt(res.interestSaved);
	}

	// ─── Breakdown Tab ───────────────────────────────────────────────────────────

	function renderBreakdown(res, extra) {
		const CIRC = 251.2;

		el.circlePi.style.strokeDashoffset = CIRC * (1 - res.piRatio);
		el.circleEsc.style.strokeDashoffset = CIRC * (1 - (res.piRatio + res.escrowRatio));
		el.pctPi.textContent = Math.round(res.piRatio * 100) + '%';

		el.detPi.textContent = fmt(res.basePI);
		el.detEscrow.textContent = fmt(res.escrowMonthly);
		el.detExtra.textContent = fmt(extra);
		el.detTotal.textContent = fmt(res.totalMonthly);
	}

	// ─── Equity Tab ──────────────────────────────────────────────────────────────

	function renderEquity(res, P) {
		const cpYr = Math.ceil(res.checkpointMonth / 12);
		el.eqLabel.textContent = 'Equity at Year ' + cpYr;
		el.eqValue.textContent = fmt(res.equityAtCheckpoint);
		el.eqPct.textContent = ((res.equityAtCheckpoint / P) * 100).toFixed(1) + '% of total loan paid';
		el.eqTime.textContent = res.monthsSaved + ' months saved';
	}

	// ─── Refi Tab ────────────────────────────────────────────────────────────────

	function renderRefi(res, rate) {
		el.refiRate.textContent = rate.toFixed(2) + '%';
		el.refiTarget.textContent = res.refiTargetRate.toFixed(2) + '%';
		el.refiSavings.textContent = fmt(res.refiMonthlySavings) + '/mo';
	}

	// ─── Amortization Table ───────────────────────────────────────────────────────

	function renderAmortTable(res) {
		const data = currentAmortView === 'annual' ? res.scheduleAnnual : res.schedule;
		const label = currentAmortView === 'annual' ? 'Year' : 'Month';
		const frag = document.createDocumentFragment();

		data.forEach(function (row, idx) {
			const tr = document.createElement('tr');
			if (idx % 2 === 0) tr.classList.add('fsp-row-even');
			if (row.balance === 0) tr.classList.add('fsp-row-final');
			tr.innerHTML =
				'<td class="fsp-td-period">' + label + ' ' + row.period + '</td>' +
				'<td class="fsp-td-right">' + fmt(row.interest) + '</td>' +
				'<td class="fsp-td-right fsp-td-principal">' + fmt(row.principal) + '</td>' +
				'<td class="fsp-td-right fsp-td-bold">' + fmt(row.balance) + '</td>';
			frag.appendChild(tr);
		});

		el.amortBody.innerHTML = '';
		el.amortBody.appendChild(frag);
	}

	// ─── Tab switcher (exposed on FSP_LC) ────────────────────────────────────────

	function switchTab(tab) {
		const tabs = ['breakdown', 'equity', 'amort', 'refi'];
		tabs.forEach(function (t) {
			const panel = document.getElementById('fsp-tab-' + t);
			const btn = document.getElementById('fsp-btn-' + t);
			if (panel) panel.classList.toggle('fsp-tab-panel--hidden', t !== tab);
			if (btn) {
				btn.classList.toggle('fsp-tab-btn--active', t === tab);
				btn.setAttribute('aria-selected', String(t === tab));
			}
		});
		currentTab = tab;
	}

	// ─── Amort view toggle (exposed on FSP_LC) ───────────────────────────────────

	function setScheduleView(view) {
		currentAmortView = view;
		const btnA = document.getElementById('fsp-view-annual');
		const btnM = document.getElementById('fsp-view-monthly');
		if (btnA) btnA.classList.toggle('fsp-view-btn--active', view === 'annual');
		if (btnM) btnM.classList.toggle('fsp-view-btn--active', view === 'monthly');
		if (lastResult) renderAmortTable(lastResult);
	}

	// ─── Formatter ───────────────────────────────────────────────────────────────

	function resetUI() {
		const zero = fmt(0);
		el.monthly.textContent = zero;
		el.saved.textContent = zero;
		el.payoff.innerHTML = '0Y <span style="color:#94a3b8;font-size:1.1rem">0M</span>';
		el.timeSaved.textContent = 'Awaiting valid inputs';
		el.totalInt.textContent = zero;
		el.totalSav.textContent = zero;
		el.pctPi.textContent = '0%';
		el.detPi.textContent = zero;
		el.detEscrow.textContent = zero;
		el.detExtra.textContent = zero;
		el.detTotal.textContent = zero;
		el.eqLabel.textContent = 'Equity at Year 0';
		el.eqValue.textContent = zero;
		el.eqPct.textContent = '0% of total loan paid';
		el.eqTime.textContent = '0 months saved';
		el.refiRate.textContent = '0.00%';
		el.refiTarget.textContent = '0.00%';
		el.refiSavings.textContent = zero + '/mo';
		el.amortBody.innerHTML = '';
		if (el.circlePi) {
			el.circlePi.style.strokeDashoffset = 251.2;
		}
		if (el.circleEsc) {
			el.circleEsc.style.strokeDashoffset = 251.2;
		}
	}

	function fmt(v) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(v);
	}

	// ─── Public API ──────────────────────────────────────────────────────────────

	global.FSP_LC = {
		switchTab: switchTab,
		setScheduleView: setScheduleView,
	};

})(window);
