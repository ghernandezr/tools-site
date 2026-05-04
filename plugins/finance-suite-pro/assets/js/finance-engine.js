/**
 * Finance Suite Pro — Finance Engine
 *
 * Pure calculation functions. No DOM access. No side effects.
 * Exposed via the global FSP_Engine namespace to avoid polluting window.
 *
 * Each function accepts a plain object and returns a plain object,
 * making them trivially unit-testable and reusable across tools.
 */

(function (global) {

	'use strict';

	// ─── Namespace ────────────────────────────────────────────────────────────────
	const FSP_Engine = {};

	// ─── Helpers ─────────────────────────────────────────────────────────────────

	/**
	 * Round a number to 2 decimal places (banker-safe for currency).
	 * @param {number} n
	 * @returns {number}
	 */
	function round2(n) {
		return Math.round((n + Number.EPSILON) * 100) / 100;
	}

	/**
	 * Format a number as USD currency string.
	 * @param {number} n
	 * @returns {string}
	 */
	FSP_Engine.formatCurrency = function (n) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(n);
	};

	/**
	 * Format a month count as a human-readable string.
	 * e.g. 371 → "30 yrs 11 mo"
	 * @param {number} months  Integer number of months.
	 * @returns {string}
	 */
	FSP_Engine.formatMonths = function (months) {
		const yrs = Math.floor(months / 12);
		const mo = months % 12;
		const parts = [];
		if (yrs > 0) parts.push(yrs + (yrs === 1 ? ' yr' : ' yrs'));
		if (mo > 0) parts.push(mo + (mo === 1 ? ' mo' : ' mo'));
		return parts.length ? parts.join(' ') : '0 mo';
	};

	// ─── Loan Calculator ─────────────────────────────────────────────────────────

	/**
	 * Calculate loan payment details including full amortization schedule.
	 *
	 * Formula used (standard amortization):
	 *   M = P × [r(1+r)^n] / [(1+r)^n − 1]
	 *   where:
	 *     P = principal
	 *     r = monthly interest rate (annual / 12 / 100)
	 *     n = total number of monthly payments
	 *
	 * @param {object} params
	 * @param {number} params.principal     Loan amount in dollars.
	 * @param {number} params.rate          Annual interest rate as a percentage (e.g. 6.5 for 6.5%).
	 * @param {number} params.years         Loan term in years.
	 * @param {number} [params.extraMonthly=0]  Additional principal paid each month.
	 *
	 * @returns {{
	 *   monthlyPayment:       number,
	 *   totalInterest:        number,
	 *   totalCost:            number,
	 *   payoffMonths:         number,
	 *   amortizationSchedule: Array<{
	 *     month:     number,
	 *     payment:   number,
	 *     principal: number,
	 *     interest:  number,
	 *     extra:     number,
	 *     balance:   number,
	 *   }>
	 * }}
	 */
	FSP_Engine.calculateLoan = function (params) {
		const principal = Math.max(0, Number(params.principal) || 0);
		const rate = Math.max(0, Number(params.rate) || 0);
		const years = Math.max(0, Number(params.years) || 0);
		const extraMonthly = Math.max(0, Number(params.extraMonthly) || 0);

		// Guard: return zeroed result for invalid inputs
		if (principal <= 0 || rate <= 0 || years <= 0) {
			return {
				monthlyPayment: 0,
				totalInterest: 0,
				totalCost: 0,
				payoffMonths: 0,
				amortizationSchedule: [],
			};
		}

		const r = rate / 100 / 12;       // monthly rate — float is unavoidable here
		const n = years * 12;            // total periods

		// PMT formula — full float precision, only used to seed the cent ledger
		const factor = Math.pow(1 + r, n);
		const pmtExact = principal * (r * factor) / (factor - 1);
		const monthlyPayment = round2(pmtExact); // display value

		// ── Integer-cent ledger (eliminates IEEE-754 drift in the hot loop) ────────
		let balCents = Math.round(principal * 100);     // exact integer cents
		const extraCents = Math.round(extraMonthly * 100);
		const pmtCents = Math.round(pmtExact * 100);      // base payment in cents

		const schedule = [];
		let totalPaidCents = 0;
		let totalInterestCents = 0;
		let month = 1;
		const maxMonths = n;

		while (balCents > 0 && month <= maxMonths) {
			// Interest in cents — one float multiply + integer round (no accumulation error)
			const intCents = Math.round(balCents * r);
			const normalPrinCents = pmtCents - intCents;

			let prinCents, extraAppliedCents, paymentCents;

			if (balCents <= normalPrinCents + extraCents) {
				// Last payment: exact ledger balance + its interest — guaranteed zero residual
				prinCents = balCents;
				extraAppliedCents = 0;
				paymentCents = balCents + intCents;
			} else {
				prinCents = normalPrinCents;
				// Clamp extra so we never overpay
				extraAppliedCents = Math.min(extraCents, balCents - prinCents);
				paymentCents = intCents + prinCents + extraAppliedCents;
			}

			balCents -= (prinCents + extraAppliedCents);

			totalPaidCents += paymentCents;
			totalInterestCents += intCents;

			schedule.push({
				month,
				payment: paymentCents / 100,
				principal: prinCents / 100,
				interest: intCents / 100,
				extra: extraAppliedCents / 100,
				balance: balCents / 100,
			});

			month++;
		}

		return {
			monthlyPayment,
			totalInterest: totalInterestCents / 100,
			totalCost: totalPaidCents / 100,
			payoffMonths: schedule.length,
			amortizationSchedule: schedule,
		};
	};

	// ─── Mortgage / Advanced Loan Calculator ─────────────────────────────────────

	/**
	 * Advanced mortgage calculator with escrow, PMI, HOA, extra payments, refi analysis.
	 *
	 * @param {object} params
	 * @param {number} params.principal          Loan amount in dollars (homePrice - downPayment).
	 * @param {number} params.rate               Annual interest rate as % (e.g. 4.96).
	 * @param {number} params.years              Loan term in years.
	 * @param {number} [params.homePrice=0]      Full home purchase price (for PMI 20% threshold).
	 * @param {number} [params.extraMonthly=0]   Extra principal paid each month.
	 * @param {number} [params.annualTax=0]      Annual property tax in dollars.
	 * @param {number} [params.annualIns=0]      Annual insurance in dollars.
	 * @param {number} [params.annualPmiRate=0]  PMI annual rate as % of original loan (e.g. 0.5).
	 *                                           Applied monthly until equity >= 20% of homePrice.
	 * @param {number} [params.hoaMonthly=0]     Monthly HOA fee in dollars.
	 *
	 * @returns {{
	 *   basePI:            number,   Monthly principal + interest payment
	 *   escrowMonthly:     number,   Monthly escrow (tax + ins)
	 *   pmiMonthly:        number,   Initial PMI monthly amount (0 if not applicable)
	 *   hoaMonthly:        number,   Monthly HOA fee
	 *   totalMonthly:      number,   PITI + PMI + HOA + extra (first-month total)
	 *   totalInterestWith: number,   Total interest paid WITH extra payments
	 *   totalInterestBase: number,   Total interest paid WITHOUT extra payments
	 *   interestSaved:     number,   Difference (savings)
	 *   payoffMonthsWith:  number,   Payoff months WITH extra
	 *   payoffMonthsBase:  number,   Payoff months WITHOUT extra
	 *   monthsSaved:       number,
	 *   equityAtCheckpoint:number,   Equity at 10-year mark (or midpoint)
	 *   checkpointMonth:   number,
	 *   pmiDropMonth:      number,   Month when PMI is removed (0 = never applied)
	 *   refiTargetRate:    number,   rate - 1%
	 *   refiMonthlySavings:number,   PI savings at target rate
	 *   schedule:          Array<{ period, interest, principal, balance, pmi }>  (monthly)
	 *   scheduleAnnual:    Array<{ period, interest, principal, balance }>  (annual)
	 *   piRatio:           number,   PI share of totalMonthly (0–1)
	 *   escrowRatio:       number,   Escrow share of totalMonthly (0–1)
	 *   pmiRatio:          number,   PMI share of totalMonthly (0–1)
	 *   hoaRatio:          number,   HOA share of totalMonthly (0–1)
	 * }}
	 */
	FSP_Engine.calculateMortgage = function (params) {
		const principal = Math.max(0, Number(params.principal) || 0);
		const rate = Math.max(0, Number(params.rate) || 0);
		const years = Math.max(0, Number(params.years) || 0);
		const homePrice = Math.max(0, Number(params.homePrice) || 0);
		const extraMonthly = Math.max(0, Number(params.extraMonthly) || 0);
		const annualTax = Math.max(0, Number(params.annualTax) || 0);
		const annualIns = Math.max(0, Number(params.annualIns) || 0);
		const annualPmiRate = Math.max(0, Number(params.annualPmiRate) || 0);
		const hoaMonthly = Math.max(0, Number(params.hoaMonthly) || 0);

		if (principal <= 0 || rate <= 0 || years <= 0) {
			return {
				basePI: 0, escrowMonthly: 0, pmiMonthly: 0, hoaMonthly: 0,
				totalMonthly: 0,
				totalInterestWith: 0, totalInterestBase: 0, interestSaved: 0,
				payoffMonthsWith: 0, payoffMonthsBase: 0, monthsSaved: 0,
				equityAtCheckpoint: 0, checkpointMonth: 0,
				pmiDropMonth: 0,
				refiTargetRate: 0, refiMonthlySavings: 0,
				schedule: [], scheduleAnnual: [],
				piRatio: 0, escrowRatio: 0, pmiRatio: 0, hoaRatio: 0,
			};
		}

		const r = rate / 100 / 12;
		const n = years * 12;
		const escrowMonthly = round2((annualTax + annualIns) / 12);

		// PMT formula — full float precision
		const factor = Math.pow(1 + r, n);
		const basePIExact = principal * (r * factor) / (factor - 1);
		const basePI = round2(basePIExact);

		// ── PMI setup ─────────────────────────────────────────────────────────────
		// PMI threshold: 80% of homePrice (or principal if homePrice not provided)
		const pmiThresholdPrice = homePrice > 0 ? homePrice : principal / 0.8;
		const pmiThresholdCents = Math.round(pmiThresholdPrice * 0.8 * 100);
		const pmiMonthlyCents = annualPmiRate > 0
			? Math.round((principal * annualPmiRate / 100) / 12 * 100)
			: 0;
		const pmiMonthly = pmiMonthlyCents / 100;

		const totalMonthly = round2(basePI + extraMonthly + escrowMonthly + pmiMonthly + hoaMonthly);

		// ── Integer-cent seeds ────────────────────────────────────────────────────
		const principalCents = Math.round(principal * 100);
		const pmtCents = Math.round(basePIExact * 100);
		const extraCents = Math.round(extraMonthly * 100);

		// ── Simulate WITHOUT extra ────────────────────────────────────────────────
		let balBaseCents = principalCents, intBaseCents = 0, mBase = 0;
		while (balBaseCents > 0 && mBase < 720) {
			const iCents = Math.round(balBaseCents * r);
			const pCents = Math.min(pmtCents - iCents, balBaseCents);
			balBaseCents -= pCents;
			intBaseCents += iCents;
			mBase++;
		}
		const payoffMonthsBase = mBase;
		const totalInterestBase = intBaseCents / 100;

		// ── Simulate WITH extra payments ──────────────────────────────────────────
		let balCents = principalCents;
		let intTotalCents = 0;
		let mActual = 0;
		let equityAtCheckpoint = 0;
		let pmiDropMonth = 0;
		const checkpointMonth = n < 120 ? Math.floor(n / 2) : 120;

		const schedule = [];
		const scheduleAnnual = [];
		let yearlyIntCents = 0, yearlyPrinCents = 0;

		while (balCents > 0 && mActual < 720) {
			const iCents = Math.round(balCents * r);
			const normalPrin = pmtCents - iCents;
			let pPaidCents, extraAppliedCents;

			if (balCents <= normalPrin + extraCents) {
				pPaidCents = balCents;
				extraAppliedCents = 0;
			} else {
				pPaidCents = normalPrin;
				extraAppliedCents = Math.min(extraCents, balCents - normalPrin);
			}

			balCents -= (pPaidCents + extraAppliedCents);
			intTotalCents += iCents;
			mActual++;

			// PMI drops when remaining balance <= 80% of home price
			const pmiThisMonth = (pmiMonthlyCents > 0 && balCents > pmiThresholdCents) ? pmiMonthlyCents : 0;
			if (pmiMonthlyCents > 0 && pmiDropMonth === 0 && balCents <= pmiThresholdCents) {
				pmiDropMonth = mActual;
			}

			yearlyIntCents += iCents;
			yearlyPrinCents += pPaidCents;

			schedule.push({
				period: mActual,
				interest: iCents / 100,
				principal: pPaidCents / 100,
				balance: balCents / 100,
				pmi: pmiThisMonth / 100,
			});

			if (mActual % 12 === 0 || balCents <= 0) {
				scheduleAnnual.push({
					period: Math.ceil(mActual / 12),
					interest: yearlyIntCents / 100,
					principal: yearlyPrinCents / 100,
					balance: balCents / 100,
				});
				yearlyIntCents = 0;
				yearlyPrinCents = 0;
			}

			if (mActual === checkpointMonth) {
				equityAtCheckpoint = (principalCents - balCents) / 100;
			}
		}

		const payoffMonthsWith = mActual;
		const totalInterestWith = intTotalCents / 100;
		const interestSaved = round2(totalInterestBase - totalInterestWith);
		const monthsSaved = payoffMonthsBase - payoffMonthsWith;

		// ── Refi analysis: simulate PI at (rate - 1%) ────────────────────────────
		const refiTargetRate = Math.max(0.1, rate - 1.0);
		const rRefi = refiTargetRate / 100 / 12;
		const factorRefi = Math.pow(1 + rRefi, n);
		const refiPI = round2(principal * (rRefi * factorRefi) / (factorRefi - 1));
		const refiMonthlySavings = round2(basePI - refiPI);

		// ── Ratios for donut chart ────────────────────────────────────────────────
		const piRatio = totalMonthly > 0 ? basePI / totalMonthly : 0;
		const escrowRatio = totalMonthly > 0 ? escrowMonthly / totalMonthly : 0;
		const pmiRatio = totalMonthly > 0 ? pmiMonthly / totalMonthly : 0;
		const hoaRatio = totalMonthly > 0 ? hoaMonthly / totalMonthly : 0;

		return {
			basePI,
			escrowMonthly,
			pmiMonthly,
			hoaMonthly,
			totalMonthly,
			totalInterestWith,
			totalInterestBase,
			interestSaved,
			payoffMonthsWith,
			payoffMonthsBase,
			monthsSaved,
			equityAtCheckpoint,
			checkpointMonth,
			pmiDropMonth,
			refiTargetRate,
			refiMonthlySavings,
			schedule,
			scheduleAnnual,
			piRatio,
			escrowRatio,
			pmiRatio,
			hoaRatio,
		};
	};

	/**
	 * Credit card payoff calculator (Phase 2).
	 * @param {object} params
	 * @returns {object}
	 */
	FSP_Engine.calculateCreditCard = function (params) {
		// TODO: implement Phase 2
		throw new Error('FSP_Engine.calculateCreditCard not yet implemented.');
	};

	// ─── Export ───────────────────────────────────────────────────────────────────
	global.FSP_Engine = FSP_Engine;

})(window);
