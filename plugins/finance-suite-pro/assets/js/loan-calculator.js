/**
 * Finance Suite Pro — Loan Calculator UI Controller
 *
 * Responsibilities:
 *   • Read inputs from the DOM.
 *   • Validate inputs before calling the engine.
 *   • Call FSP_Engine.calculateLoan().
 *   • Render results and amortization table into the DOM.
 *   • Handle reset and amortization toggle.
 *   • Parse URL parameters (?fsp_amount=...) for pre-calculation.
 *
 * Depends on: finance-engine.js (loaded first via wp_enqueue_script dependency).
 * No jQuery. No global pollution — all logic is inside an IIFE.
 */

(function () {

	'use strict';

	// ─── Element references ───────────────────────────────────────────────────────
	// Grabbed once on DOMContentLoaded to avoid repeated querySelector calls.
	let el = {};

	// ─── State ────────────────────────────────────────────────────────────────────
	let currentSchedule = [];
	let currentView = 'monthly'; // 'monthly' | 'annual'

	// ─── Bootstrap ───────────────────────────────────────────────────────────────

	document.addEventListener('DOMContentLoaded', function () {
		// Bail if the calculator is not on this page
		if (!document.getElementById('fsp-loan-calculator')) {
			return;
		}

		cacheElements();
		bindEvents();
		maybeAutoCalculate();
	});

	// ─── Cache DOM elements ───────────────────────────────────────────────────────

	function cacheElements() {
		el = {
			// Inputs
			amount: document.getElementById('fsp-amount'),
			rate: document.getElementById('fsp-rate'),
			years: document.getElementById('fsp-years'),
			extra: document.getElementById('fsp-extra'),
			// Buttons
			calcBtn: document.getElementById('fsp-calculate'),
			resetBtn: document.getElementById('fsp-reset'),
			toggleBtn: document.getElementById('fsp-toggle-amort'),
			viewMonthly: document.getElementById('fsp-view-monthly'),
			viewAnnual: document.getElementById('fsp-view-annual'),
			// Result summary
			resultsWrap: document.getElementById('fsp-results'),
			monthly: document.getElementById('fsp-monthly-payment'),
			interest: document.getElementById('fsp-total-interest'),
			totalCost: document.getElementById('fsp-total-cost'),
			payoff: document.getElementById('fsp-payoff-time'),
			// Amortization
			amortSection: document.getElementById('fsp-amortization'),
			amortWrap: document.getElementById('fsp-amort-table-wrap'),
			amortBody: document.getElementById('fsp-amort-tbody'),
			amortThead: document.getElementById('fsp-amort-thead'),
			// Error
			errorBox: document.getElementById('fsp-error'),
		};
	}

	// ─── Event binding ────────────────────────────────────────────────────────────

	function bindEvents() {
		el.calcBtn.addEventListener('click', handleCalculate);
		el.resetBtn.addEventListener('click', handleReset);
		el.toggleBtn.addEventListener('click', handleToggleAmort);
		el.viewMonthly.addEventListener('click', function () { switchView('monthly'); });
		el.viewAnnual.addEventListener('click', function () { switchView('annual'); });

		// Allow Enter key on any input to trigger calculation
		[el.amount, el.rate, el.years, el.extra].forEach(function (input) {
			input.addEventListener('keydown', function (e) {
				if (e.key === 'Enter') handleCalculate();
			});
		});
	}

	// ─── URL parameter pre-fill ───────────────────────────────────────────────────

	/**
	 * If all required fields are already filled (e.g. via PHP pre-fill from URL
	 * params or shortcode attributes), auto-trigger a calculation on load.
	 */
	function maybeAutoCalculate() {
		if (el.amount.value && el.rate.value && el.years.value) {
			handleCalculate();
		}
	}

	// ─── Calculate ────────────────────────────────────────────────────────────────

	function handleCalculate() {
		clearError();

		const inputs = readInputs();
		const validationError = validateInputs(inputs);

		if (validationError) {
			showError(validationError);
			return;
		}

		const result = FSP_Engine.calculateLoan(inputs);

		currentSchedule = result.amortizationSchedule;
		renderSummary(result);
		renderSchedule();
		showResults();
	}

	// ─── Input helpers ────────────────────────────────────────────────────────────

	function readInputs() {
		return {
			principal: parseFloat(el.amount.value) || 0,
			rate: parseFloat(el.rate.value) || 0,
			years: parseFloat(el.years.value) || 0,
			extraMonthly: parseFloat(el.extra.value) || 0,
		};
	}

	function validateInputs(inputs) {
		if (!inputs.principal || inputs.principal <= 0) {
			return 'Please enter a valid loan amount greater than $0.';
		}
		if (!inputs.rate || inputs.rate <= 0 || inputs.rate > 100) {
			return 'Please enter a valid annual interest rate between 0.01% and 100%.';
		}
		if (!inputs.years || inputs.years <= 0 || inputs.years > 50) {
			return 'Please enter a valid loan term between 1 and 50 years.';
		}
		if (inputs.extraMonthly < 0) {
			return 'Extra monthly payment cannot be negative.';
		}
		return null; // no error
	}

	// ─── Render summary ───────────────────────────────────────────────────────────

	function renderSummary(result) {
		el.monthly.textContent = FSP_Engine.formatCurrency(result.monthlyPayment);
		el.interest.textContent = FSP_Engine.formatCurrency(result.totalInterest);
		el.totalCost.textContent = FSP_Engine.formatCurrency(result.totalCost);
		el.payoff.textContent = FSP_Engine.formatMonths(result.payoffMonths);
	}

	// ─── View switcher ────────────────────────────────────────────────────────────

	function switchView(view) {
		currentView = view;
		el.viewMonthly.classList.toggle('is-active', view === 'monthly');
		el.viewMonthly.setAttribute('aria-pressed', String(view === 'monthly'));
		el.viewAnnual.classList.toggle('is-active', view === 'annual');
		el.viewAnnual.setAttribute('aria-pressed', String(view === 'annual'));
		if (currentSchedule.length) {
			renderSchedule();
		}
	}

	function renderSchedule() {
		if (currentView === 'annual') {
			renderAmortizationAnnual(currentSchedule);
		} else {
			renderAmortizationMonthly(currentSchedule);
		}
	}

	// ─── Render amortization table — monthly view ────────────────────────────────

	/**
	 * Build the amortization table using a DocumentFragment for a single
	 * DOM insertion — avoids one reflow per row for tables with 360+ rows.
	 *
	 * @param {Array} schedule  Array of row objects from FSP_Engine.calculateLoan.
	 */
	function renderAmortizationMonthly(schedule) {
		el.amortThead.innerHTML =
			'<tr>' +
			'<th scope="col">#</th>' +
			'<th scope="col">Payment</th>' +
			'<th scope="col">Principal</th>' +
			'<th scope="col">Interest</th>' +
			'<th scope="col">Extra</th>' +
			'<th scope="col">Balance</th>' +
			'</tr>';

		const fragment = document.createDocumentFragment();

		schedule.forEach(function (row) {
			const tr = document.createElement('tr');

			if (row.month % 2 === 0) {
				tr.classList.add('fsp-row-even');
			}
			if (row.balance === 0) {
				tr.classList.add('fsp-row-final');
			}

			tr.innerHTML = [
				'<td>' + row.month + '</td>',
				'<td>' + FSP_Engine.formatCurrency(row.payment) + '</td>',
				'<td>' + FSP_Engine.formatCurrency(row.principal) + '</td>',
				'<td>' + FSP_Engine.formatCurrency(row.interest) + '</td>',
				'<td>' + FSP_Engine.formatCurrency(row.extra) + '</td>',
				'<td>' + FSP_Engine.formatCurrency(row.balance) + '</td>',
			].join('');

			fragment.appendChild(tr);
		});

		el.amortBody.innerHTML = '';
		el.amortBody.appendChild(fragment);
	}

	// ─── Render amortization table — annual view ─────────────────────────────────

	/**
	 * Groups the monthly schedule by year and renders one summary row per year.
	 * Columns: Year | Total Payments | Total Principal | Total Interest | Total Extra | End Balance
	 *
	 * @param {Array} schedule  Array of row objects from FSP_Engine.calculateLoan.
	 */
	function renderAmortizationAnnual(schedule) {
		el.amortThead.innerHTML =
			'<tr>' +
			'<th scope="col">Year</th>' +
			'<th scope="col">Total Paid</th>' +
			'<th scope="col">Principal</th>' +
			'<th scope="col">Interest</th>' +
			'<th scope="col">Extra</th>' +
			'<th scope="col">End Balance</th>' +
			'</tr>';

		// Aggregate rows into yearly buckets
		const years = [];
		schedule.forEach(function (row) {
			const yearIdx = Math.ceil(row.month / 12);
			if (!years[yearIdx]) {
				years[yearIdx] = { year: yearIdx, payment: 0, principal: 0, interest: 0, extra: 0, balance: 0 };
			}
			years[yearIdx].payment += row.payment;
			years[yearIdx].principal += row.principal;
			years[yearIdx].interest += row.interest;
			years[yearIdx].extra += row.extra;
			years[yearIdx].balance = row.balance; // last month of the year wins
		});

		const fragment = document.createDocumentFragment();
		const totalYears = years.length;

		years.forEach(function (yr) {
			if (!yr) return;
			const tr = document.createElement('tr');
			if (yr.year % 2 === 0) {
				tr.classList.add('fsp-row-even');
			}
			if (yr.balance === 0 || yr.year === totalYears - 1) {
				tr.classList.add('fsp-row-final');
			}
			tr.innerHTML = [
				'<td>' + yr.year + '</td>',
				'<td>' + FSP_Engine.formatCurrency(yr.payment) + '</td>',
				'<td>' + FSP_Engine.formatCurrency(yr.principal) + '</td>',
				'<td>' + FSP_Engine.formatCurrency(yr.interest) + '</td>',
				'<td>' + FSP_Engine.formatCurrency(yr.extra) + '</td>',
				'<td>' + FSP_Engine.formatCurrency(yr.balance) + '</td>',
			].join('');
			fragment.appendChild(tr);
		});

		el.amortBody.innerHTML = '';
		el.amortBody.appendChild(fragment);
	}

	// ─── Show / hide sections ─────────────────────────────────────────────────────

	function showResults() {
		el.resultsWrap.removeAttribute('hidden');
		el.amortSection.removeAttribute('hidden');

		// Collapse the table on new calculations so user sees summary first
		el.amortWrap.setAttribute('hidden', '');
		el.toggleBtn.setAttribute('aria-expanded', 'false');
		el.toggleBtn.textContent = 'Show Schedule';

		// Smooth scroll to results on mobile
		if (window.innerWidth < 768) {
			el.resultsWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	// ─── Amortization toggle ──────────────────────────────────────────────────────

	function handleToggleAmort() {
		const isHidden = el.amortWrap.hasAttribute('hidden');

		if (isHidden) {
			el.amortWrap.removeAttribute('hidden');
			el.toggleBtn.setAttribute('aria-expanded', 'true');
			el.toggleBtn.textContent = 'Hide Schedule';
		} else {
			el.amortWrap.setAttribute('hidden', '');
			el.toggleBtn.setAttribute('aria-expanded', 'false');
			el.toggleBtn.textContent = 'Show Schedule';
		}
	}

	// ─── Reset ────────────────────────────────────────────────────────────────────

	function handleReset() {
		// Clear inputs
		[el.amount, el.rate, el.years, el.extra].forEach(function (input) {
			input.value = '';
		});

		// Hide results
		el.resultsWrap.setAttribute('hidden', '');
		el.amortSection.setAttribute('hidden', '');
		el.amortWrap.setAttribute('hidden', '');

		// Clear table
		el.amortBody.innerHTML = '';

		// Clear error
		clearError();

		// Focus first input for a11y
		el.amount.focus();
	}

	// ─── Error handling ───────────────────────────────────────────────────────────

	function showError(message) {
		el.errorBox.textContent = message;
		el.errorBox.removeAttribute('hidden');
	}

	function clearError() {
		el.errorBox.textContent = '';
		el.errorBox.setAttribute('hidden', '');
	}

})();
