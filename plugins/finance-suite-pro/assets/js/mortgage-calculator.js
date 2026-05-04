/**
 * Finance Suite Pro — Mortgage Calculator UI Controller
 *
 * Responsibilities:
 *   • Reactive calculation on every input event (no Calculate button).
 *   • Sync Home Price + Down $ + Down % inputs bidirectionally.
 *   • Show/hide PMI alert when down payment < 20%.
 *   • Call FSP_Engine.calculateMortgage() with full PITI + PMI + HOA + refi.
 *   • Render KPIs, impact panel, 4-segment donut chart, 4 analysis tabs.
 *   • Handle tab switching and amortization view toggle (annual/monthly).
 *   • Parse URL parameters (?fsp_home_price=...) for pre-calculation on load.
 *   • Expose FSP_MC namespace for onclick handlers in the template.
 *
 * Depends on: finance-engine.js (loaded first via wp_enqueue_script dependency).
 * No jQuery. No global pollution beyond FSP_MC.
 */

(function (global) {

	'use strict';

	// ─── State ────────────────────────────────────────────────────────────────────
	let el = {};
	let lastResult = null;
	let currentTab = 'breakdown';
	let currentAmortView = 'annual';

	// ─── Bootstrap ───────────────────────────────────────────────────────────────

	document.addEventListener('DOMContentLoaded', function () {
		if (!document.getElementById('fsp-mortgage-calculator')) return;
		cacheElements();
		bindEvents();
		syncDownPct();   // initial sync in case PHP pre-filled values
		calculate();
	});

	// ─── Cache DOM elements ───────────────────────────────────────────────────────

	function cacheElements() {
		el = {
			// Inputs
			homePrice:  document.getElementById('fspm-home-price'),
			down:       document.getElementById('fspm-down'),
			downPct:    document.getElementById('fspm-down-pct'),
			rate:       document.getElementById('fspm-rate'),
			years:      document.getElementById('fspm-years'),
			extra:      document.getElementById('fspm-extra'),
			tax:        document.getElementById('fspm-tax'),
			insurance:  document.getElementById('fspm-insurance'),
			pmi:        document.getElementById('fspm-pmi'),
			hoa:        document.getElementById('fspm-hoa'),
			// PMI alert
			pmiAlert:   document.getElementById('fspm-pmi-alert'),
			// KPIs
			monthly:    document.getElementById('fspm-monthly-payment'),
			saved:      document.getElementById('fspm-interest-saved'),
			payoff:     document.getElementById('fspm-payoff-time'),
			timeSaved:  document.getElementById('fspm-time-saved'),
			// Impact panel
			totalInt:   document.getElementById('fspm-total-interest'),
			totalSav:   document.getElementById('fspm-total-savings'),
			// Breakdown donut
			circlePi:     document.getElementById('fspm-circle-pi'),
			circleEsc:    document.getElementById('fspm-circle-escrow'),
			circlePmi:    document.getElementById('fspm-circle-pmi'),
			circleHoa:    document.getElementById('fspm-circle-hoa'),
			pctPi:        document.getElementById('fspm-pct-pi'),
			// Breakdown details
			detPi:        document.getElementById('fspm-det-pi'),
			detEscrow:    document.getElementById('fspm-det-escrow'),
			detPmi:       document.getElementById('fspm-det-pmi'),
			detHoa:       document.getElementById('fspm-det-hoa'),
			detExtra:     document.getElementById('fspm-det-extra'),
			detTotal:     document.getElementById('fspm-det-total'),
			rowPmi:       document.getElementById('fspm-row-pmi'),
			rowHoa:       document.getElementById('fspm-row-hoa'),
			pmiDropNote:  document.getElementById('fspm-pmi-drop-note'),
			// Equity tab
			eqLabel:      document.getElementById('fspm-eq-label'),
			eqValue:      document.getElementById('fspm-eq-value'),
			eqPct:        document.getElementById('fspm-eq-pct'),
			eqTime:       document.getElementById('fspm-eq-time'),
			pmiCard:      document.getElementById('fspm-pmi-card'),
			pmiDrop:      document.getElementById('fspm-pmi-drop'),
			// Refi tab
			refiRate:     document.getElementById('fspm-refi-current-rate'),
			refiTarget:   document.getElementById('fspm-refi-target-rate'),
			refiSavings:  document.getElementById('fspm-refi-savings'),
			// Amortization table
			amortBody:    document.getElementById('fspm-amort-tbody'),
		};
		resetUI();
	}

	// ─── Event binding ────────────────────────────────────────────────────────────

	function bindEvents() {
		// All calc inputs trigger recalculation
		[el.homePrice, el.rate, el.years, el.extra, el.tax, el.insurance, el.pmi, el.hoa]
			.forEach(function (inp) {
				if (inp) inp.addEventListener('input', calculate);
			});

		// Down $ → sync Down %
		if (el.down) {
			el.down.addEventListener('input', function () {
				syncDownPct();
				calculate();
			});
		}

		// Down % → sync Down $
		if (el.downPct) {
			el.downPct.addEventListener('input', function () {
				syncDownFromPct();
				calculate();
			});
		}
	}

	// ─── Down payment sync ────────────────────────────────────────────────────────

	function syncDownPct() {
		const price = parseFloat(el.homePrice.value) || 0;
		const down = parseFloat(el.down.value) || 0;
		if (price > 0 && el.downPct) {
			el.downPct.value = parseFloat(((down / price) * 100).toFixed(2));
		}
		updatePmiAlert(price, down);
	}

	function syncDownFromPct() {
		const price = parseFloat(el.homePrice.value) || 0;
		const pct = parseFloat(el.downPct.value) || 0;
		if (price > 0 && el.down) {
			el.down.value = Math.round(price * pct / 100);
		}
		updatePmiAlert(price, parseFloat(el.down.value) || 0);
	}

	function updatePmiAlert(price, down) {
		if (!el.pmiAlert) return;
		const pct = price > 0 ? (down / price) * 100 : 0;
		el.pmiAlert.hidden = pct >= 20 || price <= 0;
	}

	// ─── Core calculate ───────────────────────────────────────────────────────────

	function calculate() {
		const homePrice = parseFloat(el.homePrice.value) || 0;
		const down      = parseFloat(el.down.value) || 0;
		const principal = Math.max(0, homePrice - down);
		const rate      = parseFloat(el.rate.value) || 0;
		const years     = parseFloat(el.years.value) || 0;
		const extra     = parseFloat(el.extra.value) || 0;
		const tax       = parseFloat(el.tax.value) || 0;
		const ins       = parseFloat(el.insurance.value) || 0;
		const pmiRate   = parseFloat(el.pmi.value) || 0;
		const hoa       = parseFloat(el.hoa.value) || 0;

		// Sync % whenever home price changes
		syncDownPct();

		if (principal <= 0 || rate <= 0 || years <= 0) {
			lastResult = null;
			resetUI();
			return;
		}

		lastResult = FSP_Engine.calculateMortgage({
			principal,
			homePrice,
			rate,
			years,
			extraMonthly:  extra,
			annualTax:     tax,
			annualIns:     ins,
			annualPmiRate: pmiRate,
			hoaMonthly:    hoa,
		});

		renderAll(lastResult, principal, homePrice, rate, extra);
	}

	// ─── Render all sections ──────────────────────────────────────────────────────

	function renderAll(res, principal, homePrice, rate, extra) {
		renderKPIs(res);
		renderImpact(res);
		renderBreakdown(res, extra);
		renderEquity(res, principal);
		renderRefi(res, rate);
		renderAmortTable(res);
	}

	// ─── KPI Cards ────────────────────────────────────────────────────────────────

	function renderKPIs(res) {
		el.monthly.textContent = fmt(res.totalMonthly);
		el.saved.textContent   = fmt(res.interestSaved);

		const yrs = Math.floor(res.payoffMonthsWith / 12);
		const mo  = res.payoffMonthsWith % 12;
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

	// ─── Breakdown Tab (4-segment donut) ─────────────────────────────────────────

	function renderBreakdown(res, extra) {
		const CIRC = 251.2;

		// Cumulative offsets for stacked donut segments
		const piOffset     = CIRC * (1 - res.piRatio);
		const escrowOffset = CIRC * (1 - (res.piRatio + res.escrowRatio));
		const pmiOffset    = CIRC * (1 - (res.piRatio + res.escrowRatio + res.pmiRatio));
		const hoaOffset    = CIRC * (1 - (res.piRatio + res.escrowRatio + res.pmiRatio + res.hoaRatio));

		el.circlePi.style.strokeDashoffset     = piOffset;
		el.circleEsc.style.strokeDashoffset    = escrowOffset;
		el.circlePmi.style.strokeDashoffset    = pmiOffset;
		el.circleHoa.style.strokeDashoffset    = hoaOffset;
		el.pctPi.textContent = Math.round(res.piRatio * 100) + '%';

		el.detPi.textContent     = fmt(res.basePI);
		el.detEscrow.textContent = fmt(res.escrowMonthly);
		el.detExtra.textContent  = fmt(extra);
		el.detTotal.textContent  = fmt(res.totalMonthly);

		// PMI row
		if (res.pmiMonthly > 0) {
			el.detPmi.textContent = fmt(res.pmiMonthly);
			if (el.rowPmi) el.rowPmi.style.display = '';
			if (el.pmiDropNote && res.pmiDropMonth > 0) {
				const dropYr = Math.ceil(res.pmiDropMonth / 12);
				el.pmiDropNote.textContent = '— drops yr ' + dropYr;
			}
		} else {
			if (el.rowPmi) el.rowPmi.style.display = 'none';
			if (el.pmiDropNote) el.pmiDropNote.textContent = '';
		}

		// HOA row
		if (res.hoaMonthly > 0) {
			el.detHoa.textContent = fmt(res.hoaMonthly);
			if (el.rowHoa) el.rowHoa.style.display = '';
		} else {
			if (el.rowHoa) el.rowHoa.style.display = 'none';
		}
	}

	// ─── Equity Tab ──────────────────────────────────────────────────────────────

	function renderEquity(res, principal) {
		const cpYr = Math.ceil(res.checkpointMonth / 12);
		el.eqLabel.textContent = 'Equity at Year ' + cpYr;
		el.eqValue.textContent = fmt(res.equityAtCheckpoint);
		el.eqPct.textContent   = ((res.equityAtCheckpoint / principal) * 100).toFixed(1) + '% of total loan paid';
		el.eqTime.textContent  = res.monthsSaved + ' months saved';

		// PMI drop card
		if (el.pmiCard && el.pmiDrop) {
			if (res.pmiDropMonth > 0) {
				el.pmiCard.style.display = '';
				const dropYr = Math.floor(res.pmiDropMonth / 12);
				const dropMo = res.pmiDropMonth % 12;
				el.pmiDrop.textContent = 'Yr ' + dropYr + (dropMo > 0 ? ', Mo ' + dropMo : '');
			} else {
				el.pmiCard.style.display = 'none';
			}
		}
	}

	// ─── Refi Tab ────────────────────────────────────────────────────────────────

	function renderRefi(res, rate) {
		el.refiRate.textContent    = rate.toFixed(2) + '%';
		el.refiTarget.textContent  = res.refiTargetRate.toFixed(2) + '%';
		el.refiSavings.textContent = fmt(res.refiMonthlySavings) + '/mo';
	}

	// ─── Amortization Table ───────────────────────────────────────────────────────

	function renderAmortTable(res) {
		const data  = currentAmortView === 'annual' ? res.scheduleAnnual : res.schedule;
		const label = currentAmortView === 'annual' ? 'Year' : 'Month';
		const frag  = document.createDocumentFragment();

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

	// ─── Tab switcher (exposed on FSP_MC) ────────────────────────────────────────

	function switchTab(tab) {
		const tabs = ['breakdown', 'equity', 'amort', 'refi'];
		tabs.forEach(function (t) {
			const panel = document.getElementById('fspm-tab-' + t);
			const btn   = document.getElementById('fspm-btn-' + t);
			if (panel) panel.classList.toggle('fsp-tab-panel--hidden', t !== tab);
			if (btn) {
				btn.classList.toggle('fsp-tab-btn--active', t === tab);
				btn.setAttribute('aria-selected', String(t === tab));
			}
		});
		currentTab = tab;
	}

	// ─── Amort view toggle (exposed on FSP_MC) ───────────────────────────────────

	function setScheduleView(view) {
		currentAmortView = view;
		const btnA = document.getElementById('fspm-view-annual');
		const btnM = document.getElementById('fspm-view-monthly');
		if (btnA) btnA.classList.toggle('fsp-view-btn--active', view === 'annual');
		if (btnM) btnM.classList.toggle('fsp-view-btn--active', view === 'monthly');
		if (lastResult) renderAmortTable(lastResult);
	}

	// ─── Reset UI ────────────────────────────────────────────────────────────────

	function resetUI() {
		const zero = fmt(0);
		if (el.monthly)   el.monthly.textContent   = zero;
		if (el.saved)     el.saved.textContent      = zero;
		if (el.payoff)    el.payoff.innerHTML       = '0Y <span style="color:#94a3b8;font-size:1.1rem">0M</span>';
		if (el.timeSaved) el.timeSaved.textContent  = 'Awaiting valid inputs';
		if (el.totalInt)  el.totalInt.textContent   = zero;
		if (el.totalSav)  el.totalSav.textContent   = zero;
		if (el.pctPi)     el.pctPi.textContent      = '0%';
		if (el.detPi)     el.detPi.textContent      = zero;
		if (el.detEscrow) el.detEscrow.textContent  = zero;
		if (el.detPmi)    el.detPmi.textContent     = zero;
		if (el.detHoa)    el.detHoa.textContent     = zero;
		if (el.detExtra)  el.detExtra.textContent   = zero;
		if (el.detTotal)  el.detTotal.textContent   = zero;
		if (el.eqLabel)   el.eqLabel.textContent    = 'Equity at Year 0';
		if (el.eqValue)   el.eqValue.textContent    = zero;
		if (el.eqPct)     el.eqPct.textContent      = '0% of total loan paid';
		if (el.eqTime)    el.eqTime.textContent     = '0 months saved';
		if (el.pmiDrop)   el.pmiDrop.textContent    = '—';
		if (el.refiRate)    el.refiRate.textContent    = '0.00%';
		if (el.refiTarget)  el.refiTarget.textContent  = '0.00%';
		if (el.refiSavings) el.refiSavings.textContent = zero + '/mo';
		if (el.amortBody)   el.amortBody.innerHTML     = '';
		const CIRC = 251.2;
		if (el.circlePi)  el.circlePi.style.strokeDashoffset  = CIRC;
		if (el.circleEsc) el.circleEsc.style.strokeDashoffset = CIRC;
		if (el.circlePmi) el.circlePmi.style.strokeDashoffset = CIRC;
		if (el.circleHoa) el.circleHoa.style.strokeDashoffset = CIRC;
	}

	// ─── Formatter ───────────────────────────────────────────────────────────────

	function fmt(v) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(v);
	}

	// ─── Public API ──────────────────────────────────────────────────────────────

	global.FSP_MC = {
		switchTab:       switchTab,
		setScheduleView: setScheduleView,
	};

})(window);
