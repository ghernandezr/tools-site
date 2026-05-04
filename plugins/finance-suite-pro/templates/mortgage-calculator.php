<?php
/**
 * Template: Mortgage Calculator
 *
 * Rendered by [mortgage_calculator] shortcode.
 * Available variables (set by FSP_Shortcodes::render_mortgage_calculator):
 *   $defaults['home_price']   – pre-filled home price
 *   $defaults['down']         – pre-filled down payment (dollars)
 *   $defaults['rate']         – pre-filled interest rate
 *   $defaults['years']        – pre-filled loan term years
 *   $defaults['extra']        – pre-filled extra monthly payment
 *   $defaults['tax']          – pre-filled annual property tax
 *   $defaults['insurance']    – pre-filled annual insurance
 *   $defaults['pmi']          – pre-filled PMI annual rate (%)
 *   $defaults['hoa']          – pre-filled monthly HOA fee
 *
 * All output is escaped. No raw user data is ever printed without esc_attr().
 */

defined( 'ABSPATH' ) || exit;
?>

<div class="fsp-calculator fsp-mortgage-calculator" id="fsp-mortgage-calculator" role="main">

	<!-- ======================================================
	     HEADER
	====================================================== -->
	<header class="fsp-calc-header">
		<div class="fsp-header-brand">
			<div class="fsp-header-icon" aria-hidden="true">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
			</div>
			<div>
				<h2 class="fsp-calc-title">Mortgage <span class="fsp-title-accent">Calculator</span></h2>
				<p class="fsp-calc-subtitle">Full PITI · PMI · HOA · Refi Analysis</p>
			</div>
		</div>
	</header>

	<!-- ======================================================
	     MAIN LAYOUT: SIDEBAR + PANEL
	====================================================== -->
	<div class="fsp-layout">

		<!-- ── LEFT: Parameters ─────────────────────────── -->
		<aside class="fsp-sidebar" aria-label="Mortgage parameters">

			<div class="fsp-glass-card">
				<h3 class="fsp-section-label">Home &amp; Loan</h3>
				<div class="fsp-field-stack">

					<div class="fsp-input-group">
						<label class="fsp-label-tech" for="fspm-home-price">Home Price ($)</label>
						<input
							type="number"
							id="fspm-home-price"
							class="fsp-input-field"
							name="fspm_home_price"
							min="1" max="99999999" step="1000"
							placeholder="450000"
							value="<?php echo esc_attr( $defaults['home_price'] ); ?>"
							autocomplete="off"
							aria-required="true"
						/>
					</div>

					<div class="fsp-field-row">
						<div class="fsp-input-group">
							<label class="fsp-label-tech" for="fspm-down">Down Payment ($)</label>
							<input
								type="number"
								id="fspm-down"
								class="fsp-input-field"
								name="fspm_down"
								min="0" max="99999999" step="1000"
								placeholder="90000"
								value="<?php echo esc_attr( $defaults['down'] ); ?>"
								autocomplete="off"
							/>
						</div>
						<div class="fsp-input-group">
							<label class="fsp-label-tech" for="fspm-down-pct">Down (%)</label>
							<div class="fsp-input-prefix-wrap">
								<input
									type="number"
									id="fspm-down-pct"
									class="fsp-input-field"
									min="0" max="100" step="0.1"
									placeholder="20"
									autocomplete="off"
								/>
								<span class="fsp-input-suffix" aria-hidden="true">%</span>
							</div>
						</div>
					</div>

					<!-- PMI alert — shown/hidden by JS based on down < 20% -->
					<div class="fsp-pmi-alert" id="fspm-pmi-alert" hidden>
						<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
						<span>Down &lt; 20% — PMI applies</span>
					</div>

					<div class="fsp-field-row">
						<div class="fsp-input-group">
							<label class="fsp-label-tech" for="fspm-rate">Rate (%)</label>
							<input
								type="number"
								id="fspm-rate"
								class="fsp-input-field"
								name="fspm_rate"
								min="0.01" max="100" step="0.01"
								placeholder="6.75"
								value="<?php echo esc_attr( $defaults['rate'] ); ?>"
								autocomplete="off"
								aria-required="true"
							/>
						</div>
						<div class="fsp-input-group">
							<label class="fsp-label-tech" for="fspm-years">Term (Years)</label>
							<input
								type="number"
								id="fspm-years"
								class="fsp-input-field"
								name="fspm_years"
								min="1" max="50" step="1"
								placeholder="30"
								value="<?php echo esc_attr( $defaults['years'] ); ?>"
								autocomplete="off"
								aria-required="true"
							/>
						</div>
					</div>

					<div class="fsp-input-group fsp-input-group--accent">
						<label class="fsp-label-tech fsp-label-tech--accent" for="fspm-extra">Monthly Extra Payment</label>
						<div class="fsp-input-prefix-wrap">
							<span class="fsp-input-prefix" aria-hidden="true">$</span>
							<input
								type="number"
								id="fspm-extra"
								class="fsp-input-field fsp-input-field--accent"
								name="fspm_extra"
								min="0" max="99999" step="10"
								placeholder="0"
								value="<?php echo esc_attr( $defaults['extra'] ); ?>"
								autocomplete="off"
							/>
						</div>
					</div>

				</div>
			</div>

			<div class="fsp-glass-card">
				<h3 class="fsp-section-label fsp-section-label--muted">Escrow &amp; Fees</h3>
				<div class="fsp-field-stack">

					<div class="fsp-field-row">
						<div class="fsp-input-group">
							<label class="fsp-label-tech" for="fspm-tax">Property Tax/Yr</label>
							<input
								type="number"
								id="fspm-tax"
								class="fsp-input-field"
								name="fspm_tax"
								min="0" max="999999" step="100"
								placeholder="4800"
								value="<?php echo esc_attr( $defaults['tax'] ); ?>"
								autocomplete="off"
							/>
						</div>
						<div class="fsp-input-group">
							<label class="fsp-label-tech" for="fspm-insurance">Insurance/Yr</label>
							<input
								type="number"
								id="fspm-insurance"
								class="fsp-input-field"
								name="fspm_insurance"
								min="0" max="999999" step="100"
								placeholder="1200"
								value="<?php echo esc_attr( $defaults['insurance'] ); ?>"
								autocomplete="off"
							/>
						</div>
					</div>

					<div class="fsp-field-row">
						<div class="fsp-input-group">
							<label class="fsp-label-tech" for="fspm-pmi">PMI Rate (%/yr)</label>
							<input
								type="number"
								id="fspm-pmi"
								class="fsp-input-field"
								name="fspm_pmi"
								min="0" max="5" step="0.01"
								placeholder="0.5"
								value="<?php echo esc_attr( $defaults['pmi'] ); ?>"
								autocomplete="off"
							/>
						</div>
						<div class="fsp-input-group">
							<label class="fsp-label-tech" for="fspm-hoa">HOA/month</label>
							<input
								type="number"
								id="fspm-hoa"
								class="fsp-input-field"
								name="fspm_hoa"
								min="0" max="99999" step="10"
								placeholder="0"
								value="<?php echo esc_attr( $defaults['hoa'] ); ?>"
								autocomplete="off"
							/>
						</div>
					</div>

				</div>
			</div>

			<!-- Cross-tool link -->
			<div class="fsp-cross-tool">
				<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
				<?php if ( ! empty( $defaults['loan_url'] ) ) : ?>
					<a href="<?php echo esc_url( $defaults['loan_url'] ); ?>">Use the Loan Payment Calculator instead &rarr;</a>
				<?php else : ?>
					<span>Looking for a general loan? Use the <strong>Loan Payment Calculator</strong>.</span>
				<?php endif; ?>
			</div>

		</aside><!-- .fsp-sidebar -->

		<!-- ── RIGHT: Results Panel ──────────────────────── -->
		<main class="fsp-panel" id="fspm-results" aria-label="Calculation results">

			<!-- KPI Cards -->
			<div class="fsp-kpi-row">
				<div class="fsp-kpi-card fsp-kpi-card--primary">
					<span class="fsp-kpi-label">Total Monthly (PITI+)</span>
					<strong class="fsp-kpi-value" id="fspm-monthly-payment">$0</strong>
					<span class="fsp-kpi-note">P&amp;I + Escrow + PMI + HOA</span>
				</div>
				<div class="fsp-kpi-card fsp-kpi-card--green">
					<span class="fsp-kpi-label">Interest Avoided</span>
					<strong class="fsp-kpi-value fsp-kpi-value--green" id="fspm-interest-saved">$0</strong>
					<span class="fsp-kpi-note fsp-kpi-note--green">Guaranteed Savings</span>
				</div>
				<div class="fsp-kpi-card fsp-kpi-card--blue">
					<span class="fsp-kpi-label">New Payoff Date</span>
					<strong class="fsp-kpi-value" id="fspm-payoff-time">0Y 0M</strong>
					<span class="fsp-kpi-note fsp-kpi-note--blue" id="fspm-time-saved">Time reduction</span>
				</div>
			</div>

			<!-- Impact Panel -->
			<div class="fsp-impact-panel" aria-label="Financial impact summary">
				<div class="fsp-impact-bg-icon" aria-hidden="true">
					<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
				</div>
				<div class="fsp-impact-content">
					<div class="fsp-impact-left">
						<div class="fsp-impact-badge" aria-hidden="true">
							<span class="fsp-impact-badge-dot"></span>
							<span>Active Strategy</span>
						</div>
						<h3 class="fsp-impact-title">Financial Freedom Speedup</h3>
						<p class="fsp-impact-desc">Every extra dollar reduces your principal directly, causing a massive interest snowball effect.</p>
					</div>
					<div class="fsp-impact-stats">
						<div class="fsp-impact-stat">
							<p class="fsp-impact-stat-label">Total Interest</p>
							<p class="fsp-impact-stat-value" id="fspm-total-interest">$0</p>
							<p class="fsp-impact-stat-note">Scenario with extras</p>
						</div>
						<div class="fsp-impact-stat fsp-impact-stat--green">
							<p class="fsp-impact-stat-label">Savings</p>
							<p class="fsp-impact-stat-value fsp-impact-stat-value--green" id="fspm-total-savings">$0</p>
							<p class="fsp-impact-stat-note">Pure interest kept</p>
						</div>
					</div>
				</div>
			</div>

			<!-- ================================================
			     AD / MONETIZATION PLACEHOLDER
			================================================ -->
			<div class="fsp-ad-slot fsp-ad-between-results" aria-hidden="true">
				<!-- Ad unit: insert AdSense or affiliate banner here -->
			</div>

			<!-- Analysis Tabs -->
			<div class="fsp-tabs-card">
				<div class="fsp-tabs-nav" role="tablist" aria-label="Analysis tabs">
					<button type="button" class="fsp-tab-btn fsp-tab-btn--active" id="fspm-btn-breakdown" role="tab" aria-selected="true"  aria-controls="fspm-tab-breakdown" onclick="FSP_MC.switchTab('breakdown')">Payment Breakdown</button>
					<button type="button" class="fsp-tab-btn"                     id="fspm-btn-equity"    role="tab" aria-selected="false" aria-controls="fspm-tab-equity"    onclick="FSP_MC.switchTab('equity')">Equity Growth</button>
					<button type="button" class="fsp-tab-btn"                     id="fspm-btn-amort"     role="tab" aria-selected="false" aria-controls="fspm-tab-amort"     onclick="FSP_MC.switchTab('amort')">Amortization Table</button>
					<button type="button" class="fsp-tab-btn"                     id="fspm-btn-refi"      role="tab" aria-selected="false" aria-controls="fspm-tab-refi"      onclick="FSP_MC.switchTab('refi')">Refi Alerts</button>
				</div>

				<div class="fsp-tabs-body">

					<!-- Tab 1: Payment Breakdown -->
					<div id="fspm-tab-breakdown" class="fsp-tab-panel" role="tabpanel" aria-labelledby="fspm-btn-breakdown">
						<div class="fsp-breakdown-wrap">
							<div class="fsp-donut-wrap" aria-hidden="true">
								<svg viewBox="0 0 100 100" class="fsp-donut-svg">
									<circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" stroke-width="12"/>
									<circle id="fspm-circle-pi"     cx="50" cy="50" r="40" fill="none" stroke="#6366f1" stroke-width="12" stroke-dasharray="251.2" stroke-dashoffset="100"/>
									<circle id="fspm-circle-escrow" cx="50" cy="50" r="40" fill="none" stroke="#94a3b8" stroke-width="12" stroke-dasharray="251.2" stroke-dashoffset="200"/>
									<circle id="fspm-circle-pmi"    cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" stroke-width="12" stroke-dasharray="251.2" stroke-dashoffset="251.2"/>
									<circle id="fspm-circle-hoa"    cx="50" cy="50" r="40" fill="none" stroke="#10b981" stroke-width="12" stroke-dasharray="251.2" stroke-dashoffset="251.2"/>
								</svg>
								<div class="fsp-donut-center">
									<span id="fspm-pct-pi" class="fsp-donut-pct">0%</span>
									<span class="fsp-donut-label">Mortgage Share</span>
								</div>
							</div>
							<div class="fsp-breakdown-details">
								<div class="fsp-breakdown-row">
									<span>Principal &amp; Interest</span>
									<strong id="fspm-det-pi">$0</strong>
								</div>
								<div class="fsp-breakdown-row">
									<span>Escrow (Tax/Ins)</span>
									<strong id="fspm-det-escrow">$0</strong>
								</div>
								<div class="fsp-breakdown-row fsp-breakdown-row--pmi" id="fspm-row-pmi">
									<span>PMI <span id="fspm-pmi-drop-note" class="fsp-pmi-drop-note"></span></span>
									<strong id="fspm-det-pmi">$0</strong>
								</div>
								<div class="fsp-breakdown-row fsp-breakdown-row--hoa" id="fspm-row-hoa">
									<span>HOA</span>
									<strong id="fspm-det-hoa">$0</strong>
								</div>
								<div class="fsp-breakdown-row fsp-breakdown-row--accent">
									<span>Extra Payment</span>
									<strong id="fspm-det-extra">$0</strong>
								</div>
								<div class="fsp-breakdown-row fsp-breakdown-row--total">
									<span>Total Cash Outflow</span>
									<strong id="fspm-det-total">$0</strong>
								</div>
							</div>
						</div>
					</div>

					<!-- Tab 2: Equity Growth -->
					<div id="fspm-tab-equity" class="fsp-tab-panel fsp-tab-panel--hidden" role="tabpanel" aria-labelledby="fspm-btn-equity">
						<div class="fsp-equity-grid">
							<div class="fsp-equity-card">
								<span class="fsp-equity-label" id="fspm-eq-label">Equity at 10 Years</span>
								<strong class="fsp-equity-value" id="fspm-eq-value">$0</strong>
								<p class="fsp-equity-note" id="fspm-eq-pct">0% of total loan paid</p>
							</div>
							<div class="fsp-equity-card">
								<span class="fsp-equity-label">Total Time Saved</span>
								<strong class="fsp-equity-value" id="fspm-eq-time">0 months</strong>
								<p class="fsp-equity-note fsp-equity-note--blue">Accelerated freedom</p>
							</div>
							<div class="fsp-equity-card" id="fspm-pmi-card">
								<span class="fsp-equity-label">PMI Drops Off</span>
								<strong class="fsp-equity-value fsp-equity-value--amber" id="fspm-pmi-drop">—</strong>
								<p class="fsp-equity-note">When equity reaches 20%</p>
							</div>
						</div>
					</div>

					<!-- Tab 3: Amortization Table -->
					<div id="fspm-tab-amort" class="fsp-tab-panel fsp-tab-panel--hidden" role="tabpanel" aria-labelledby="fspm-btn-amort">
						<div class="fsp-amort-controls">
							<div class="fsp-view-toggle" role="group" aria-label="Schedule view">
								<button type="button" id="fspm-view-annual"  class="fsp-view-btn fsp-view-btn--active" onclick="FSP_MC.setScheduleView('annual')">Annual</button>
								<button type="button" id="fspm-view-monthly" class="fsp-view-btn"                     onclick="FSP_MC.setScheduleView('monthly')">Monthly</button>
							</div>
						</div>
						<div class="fsp-table-scroll fsp-table-scroll--limited">
							<table class="fsp-table" id="fspm-amort-table" aria-label="Amortization schedule">
								<thead>
									<tr>
										<th scope="col">Period</th>
										<th scope="col" class="fsp-th-right">Interest</th>
										<th scope="col" class="fsp-th-right">Principal</th>
										<th scope="col" class="fsp-th-right">Balance</th>
									</tr>
								</thead>
								<tbody id="fspm-amort-tbody">
									<!-- Rows injected by mortgage-calculator.js -->
								</tbody>
							</table>
						</div>
					</div>

					<!-- Tab 4: Refi Alerts -->
					<div id="fspm-tab-refi" class="fsp-tab-panel fsp-tab-panel--hidden" role="tabpanel" aria-labelledby="fspm-btn-refi">
						<div class="fsp-refi-wrap">
							<div class="fsp-refi-header">
								<div class="fsp-refi-icon" aria-hidden="true">
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
								</div>
								<h4 class="fsp-refi-title">Dynamic Refinancing Engine</h4>
							</div>
							<p class="fsp-refi-intro">
								Analyzing current mortgage at <strong id="fspm-refi-current-rate">0%</strong>.
								Based on market trends, here is your optimization strategy:
							</p>
							<div class="fsp-refi-card">
								<div class="fsp-refi-card-row">
									<span class="fsp-refi-card-meta">Target Rate (1% Drop)</span>
									<span class="fsp-refi-card-rate" id="fspm-refi-target-rate">0%</span>
								</div>
								<div class="fsp-refi-card-row fsp-refi-card-row--bottom">
									<div>
										<p class="fsp-refi-savings-label">Estimated Monthly Savings</p>
										<p class="fsp-refi-savings-value" id="fspm-refi-savings">$0</p>
									</div>
								</div>
							</div>
							<div class="fsp-refi-insight">
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
								<p><strong>Insight:</strong> A 1% rate reduction typically justifies refinancing if you plan to stay in the home for more than 24 months.</p>
							</div>
						</div>
					</div>

				</div><!-- .fsp-tabs-body -->
			</div><!-- .fsp-tabs-card -->

		</main><!-- .fsp-panel -->

	</div><!-- .fsp-layout -->

	<!-- ======================================================
	     BOTTOM AD PLACEHOLDER
	====================================================== -->
	<div class="fsp-ad-slot fsp-ad-bottom" aria-hidden="true">
		<!-- Ad unit: insert AdSense or affiliate banner here -->
	</div>

</div><!-- .fsp-mortgage-calculator -->
