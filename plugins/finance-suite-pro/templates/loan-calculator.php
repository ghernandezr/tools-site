<?php
/**
 * Template: Loan Payment Calculator
 *
 * Rendered by [loan_calculator] shortcode.
 * Available variables (set by FSP_Shortcodes::render_loan_calculator):
 *   $defaults['amount'] – pre-filled loan amount (string, numeric or '')
 *   $defaults['rate']   – pre-filled interest rate (string, numeric or '')
 *   $defaults['years']  – pre-filled loan term years (string, numeric or '')
 *   $defaults['extra']  – pre-filled extra monthly payment (string, numeric or '')
 *
 * All output is escaped. No raw user data is ever printed without esc_attr().
 */

defined( 'ABSPATH' ) || exit;
?>

<div class="fsp-calculator fsp-loan-calculator" id="fsp-loan-calculator" role="main">

	<!-- ======================================================
	     HEADER
	====================================================== -->
	<header class="fsp-calc-header">
		<h2 class="fsp-calc-title">Loan Payment Calculator</h2>
		<p class="fsp-calc-subtitle">Calculate your monthly payment, total interest, and full amortization schedule.</p>
	</header>

	<!-- ======================================================
	     INPUTS
	====================================================== -->
	<section class="fsp-inputs" aria-label="Loan parameters">
		<div class="fsp-field-group">

			<div class="fsp-field">
				<label for="fsp-amount">Loan Amount ($)</label>
				<input
					type="number"
					id="fsp-amount"
					class="fsp-input"
					name="fsp_amount"
					min="1"
					max="99999999"
					step="100"
					placeholder="200,000"
					value="<?php echo esc_attr( $defaults['amount'] ); ?>"
					autocomplete="off"
					aria-required="true"
				/>
			</div>

			<div class="fsp-field">
				<label for="fsp-rate">Annual Interest Rate (%)</label>
				<input
					type="number"
					id="fsp-rate"
					class="fsp-input"
					name="fsp_rate"
					min="0.01"
					max="100"
					step="0.01"
					placeholder="6.5"
					value="<?php echo esc_attr( $defaults['rate'] ); ?>"
					autocomplete="off"
					aria-required="true"
				/>
			</div>

			<div class="fsp-field">
				<label for="fsp-years">Loan Term (Years)</label>
				<input
					type="number"
					id="fsp-years"
					class="fsp-input"
					name="fsp_years"
					min="1"
					max="50"
					step="1"
					placeholder="30"
					value="<?php echo esc_attr( $defaults['years'] ); ?>"
					autocomplete="off"
					aria-required="true"
				/>
			</div>

			<div class="fsp-field">
				<label for="fsp-extra">Extra Monthly Payment ($) <span class="fsp-optional">(optional)</span></label>
				<input
					type="number"
					id="fsp-extra"
					class="fsp-input"
					name="fsp_extra"
					min="0"
					max="99999"
					step="10"
					placeholder="0"
					value="<?php echo esc_attr( $defaults['extra'] ); ?>"
					autocomplete="off"
				/>
			</div>

		</div><!-- .fsp-field-group -->

		<div class="fsp-actions">
			<button type="button" id="fsp-calculate" class="fsp-btn fsp-btn-primary">Calculate</button>
			<button type="button" id="fsp-reset"     class="fsp-btn fsp-btn-secondary">Reset</button>
		</div>

		<!-- Inline validation message area -->
		<div id="fsp-error" class="fsp-error" role="alert" aria-live="polite" hidden></div>

	</section><!-- .fsp-inputs -->

	<!-- ======================================================
	     RESULTS SUMMARY
	====================================================== -->
	<section class="fsp-results" id="fsp-results" aria-label="Calculation results" hidden>

		<div class="fsp-result-cards">

			<div class="fsp-card fsp-card--primary">
				<span class="fsp-card-label">Monthly Payment</span>
				<span class="fsp-card-value" id="fsp-monthly-payment">—</span>
			</div>

			<div class="fsp-card">
				<span class="fsp-card-label">Total Interest</span>
				<span class="fsp-card-value" id="fsp-total-interest">—</span>
			</div>

			<div class="fsp-card">
				<span class="fsp-card-label">Total Cost</span>
				<span class="fsp-card-value" id="fsp-total-cost">—</span>
			</div>

			<div class="fsp-card">
				<span class="fsp-card-label">Payoff Time</span>
				<span class="fsp-card-value" id="fsp-payoff-time">—</span>
			</div>

		</div><!-- .fsp-result-cards -->

		<!-- ================================================
		     AD / MONETIZATION PLACEHOLDER
		================================================ -->
		<div class="fsp-ad-slot fsp-ad-between-results" aria-hidden="true">
			<!-- Ad unit: insert AdSense or affiliate banner here -->
		</div>

		<!-- ================================================
		     CTA
		================================================ -->
		<div class="fsp-cta-container" id="fsp-cta">
			<p class="fsp-cta-text">Ready to take the next step?</p>
			<a href="#" class="fsp-btn fsp-btn-cta" id="fsp-cta-link">Compare Loan Offers</a>
		</div>

	</section><!-- .fsp-results -->

	<!-- ======================================================
	     AMORTIZATION TABLE
	====================================================== -->
	<section class="fsp-amortization" id="fsp-amortization" aria-label="Amortization schedule" hidden>

		<div class="fsp-amort-header">
			<h3 class="fsp-amort-title">Amortization Schedule</h3>
			<div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;">
				<div class="fsp-amort-view-btns" role="group" aria-label="Schedule view">
					<button type="button" id="fsp-view-monthly" class="fsp-btn fsp-btn-ghost is-active" aria-pressed="true">Monthly</button>
					<button type="button" id="fsp-view-annual"  class="fsp-btn fsp-btn-ghost" aria-pressed="false">Annual</button>
				</div>
				<button type="button" id="fsp-toggle-amort" class="fsp-btn fsp-btn-ghost" aria-expanded="false" aria-controls="fsp-amort-table-wrap">
					Show Schedule
				</button>
			</div>
		</div>

		<div id="fsp-amort-table-wrap" class="fsp-amort-table-wrap" hidden>
			<div class="fsp-table-scroll">
				<table class="fsp-table" id="fsp-amort-table" aria-label="Monthly amortization breakdown">
					<thead id="fsp-amort-thead">
						<tr>
							<th scope="col">#</th>
							<th scope="col">Payment</th>
							<th scope="col">Principal</th>
							<th scope="col">Interest</th>
							<th scope="col">Extra</th>
							<th scope="col">Balance</th>
						</tr>
					</thead>
					<tbody id="fsp-amort-tbody">
						<!-- Rows injected by loan-calculator.js -->
					</tbody>
				</table>
			</div><!-- .fsp-table-scroll -->
		</div><!-- #fsp-amort-table-wrap -->

	</section><!-- .fsp-amortization -->

	<!-- ======================================================
	     BOTTOM AD PLACEHOLDER
	====================================================== -->
	<div class="fsp-ad-slot fsp-ad-bottom" aria-hidden="true">
		<!-- Ad unit: insert AdSense or affiliate banner here -->
	</div>

</div><!-- .fsp-loan-calculator -->
