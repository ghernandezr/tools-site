/**
 * Finance Suite Pro — Finance Engine
 *
 * Pure calculation functions. No DOM access. No side effects.
 * Exposed via the global FSP_Engine namespace to avoid polluting window.
 *
 * Each function accepts a plain object and returns a plain object,
 * making them trivially unit-testable and reusable across tools.
 */

( function ( global ) {

	'use strict';

	// ─── Namespace ────────────────────────────────────────────────────────────────
	const FSP_Engine = {};

	// ─── Helpers ─────────────────────────────────────────────────────────────────

	/**
	 * Round a number to 2 decimal places (banker-safe for currency).
	 * @param {number} n
	 * @returns {number}
	 */
	function round2( n ) {
		return Math.round( ( n + Number.EPSILON ) * 100 ) / 100;
	}

	/**
	 * Format a number as USD currency string.
	 * @param {number} n
	 * @returns {string}
	 */
	FSP_Engine.formatCurrency = function ( n ) {
		return new Intl.NumberFormat( 'en-US', {
			style:                 'currency',
			currency:              'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		} ).format( n );
	};

	/**
	 * Format a month count as a human-readable string.
	 * e.g. 371 → "30 yrs 11 mo"
	 * @param {number} months  Integer number of months.
	 * @returns {string}
	 */
	FSP_Engine.formatMonths = function ( months ) {
		const yrs = Math.floor( months / 12 );
		const mo  = months % 12;
		const parts = [];
		if ( yrs > 0 ) parts.push( yrs + ( yrs === 1 ? ' yr'  : ' yrs' ) );
		if ( mo  > 0 ) parts.push( mo  + ( mo  === 1 ? ' mo'  : ' mo'  ) );
		return parts.length ? parts.join( ' ' ) : '0 mo';
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
	FSP_Engine.calculateLoan = function ( params ) {
		const principal    = Number( params.principal    ) || 0;
		const rate         = Number( params.rate         ) || 0;
		const years        = Number( params.years        ) || 0;
		const extraMonthly = Number( params.extraMonthly ) || 0;

		// Guard: return zeroed result for invalid inputs
		if ( principal <= 0 || rate <= 0 || years <= 0 ) {
			return {
				monthlyPayment:       0,
				totalInterest:        0,
				totalCost:            0,
				payoffMonths:         0,
				amortizationSchedule: [],
			};
		}

		const monthlyRate = rate / 100 / 12;         // r
		const numPayments = years * 12;              // n

		// Standard amortization payment formula
		const factor         = Math.pow( 1 + monthlyRate, numPayments );
		const monthlyPayment = round2( principal * ( monthlyRate * factor ) / ( factor - 1 ) );

		// Build amortization schedule, accounting for extra payments
		const schedule   = [];
		let   balance    = principal;
		let   totalPaid  = 0;
		let   totalInterest = 0;
		let   month      = 1;
		const maxMonths  = numPayments + 1; // safety cap (handles large extra payments)

		while ( balance > 0.005 && month <= maxMonths ) {
			const interestPortion  = round2( balance * monthlyRate );
			let   principalPortion = round2( monthlyPayment - interestPortion );

			// Clamp principal portion so it never exceeds remaining balance
			principalPortion = Math.min( principalPortion, balance );

			// Extra payment: also clamp so we never overpay
			const extraApplied = Math.min( extraMonthly, round2( balance - principalPortion ) );

			const totalMonthlyPaid = round2( principalPortion + interestPortion + extraApplied );
			balance                = round2( balance - principalPortion - extraApplied );

			totalPaid    += totalMonthlyPaid;
			totalInterest = round2( totalInterest + interestPortion );

			schedule.push( {
				month,
				payment:   totalMonthlyPaid,
				principal: principalPortion,
				interest:  interestPortion,
				extra:     extraApplied,
				balance:   Math.max( balance, 0 ),
			} );

			month++;
		}

		const payoffMonths = schedule.length;
		const totalCost    = round2( totalPaid );

		return {
			monthlyPayment,
			totalInterest,
			totalCost,
			payoffMonths,
			amortizationSchedule: schedule,
		};
	};

	// ─── Future Engines (stubs — fill in as tools are added) ─────────────────────

	/**
	 * Mortgage calculator (Phase 2 — includes tax, insurance, PMI).
	 * @param {object} params
	 * @returns {object}
	 */
	FSP_Engine.calculateMortgage = function ( params ) {
		// TODO: implement Phase 2
		throw new Error( 'FSP_Engine.calculateMortgage not yet implemented.' );
	};

	/**
	 * Credit card payoff calculator (Phase 2).
	 * @param {object} params
	 * @returns {object}
	 */
	FSP_Engine.calculateCreditCard = function ( params ) {
		// TODO: implement Phase 2
		throw new Error( 'FSP_Engine.calculateCreditCard not yet implemented.' );
	};

	// ─── Export ───────────────────────────────────────────────────────────────────
	global.FSP_Engine = FSP_Engine;

} )( window );
