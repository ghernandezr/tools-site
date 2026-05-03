<?php
/**
 * FSP_Shortcodes
 *
 * Registers all plugin shortcodes with WordPress.
 * Each shortcode:
 *   1. Triggers asset enqueuing for that tool only.
 *   2. Loads the corresponding PHP template.
 *   3. Returns buffered HTML (safe for use inside content areas).
 */

defined( 'ABSPATH' ) || exit;

class FSP_Shortcodes {

	/** @var FSP_Enqueue */
	private $enqueue;

	public function __construct( FSP_Enqueue $enqueue ) {
		$this->enqueue = $enqueue;
	}

	/** Register all shortcodes with WordPress */
	public function register() {
		add_shortcode( 'loan_calculator', [ $this, 'render_loan_calculator' ] );
		// Future: add_shortcode( 'mortgage_calculator', [ $this, 'render_mortgage_calculator' ] );
	}

	/**
	 * [loan_calculator] shortcode handler.
	 *
	 * Supports URL parameter pre-fill via attributes or ?fsp_* query vars.
	 *
	 * Accepted shortcode attributes:
	 *   amount   – default loan amount
	 *   rate     – default interest rate (%)
	 *   years    – default loan term in years
	 *   extra    – default extra monthly payment
	 *
	 * @param array|string $atts  Shortcode attributes.
	 * @return string             Rendered HTML.
	 */
	public function render_loan_calculator( $atts ) {
		// Merge shortcode attributes with defaults
		$atts = shortcode_atts(
			[
				'amount' => '',
				'rate'   => '',
				'years'  => '',
				'extra'  => '',
			],
			$atts,
			'loan_calculator'
		);

		// Allow URL parameters to override shortcode attributes (SEO / pre-fill)
		// e.g. ?fsp_amount=200000&fsp_rate=6.5&fsp_years=30
		$url_keys = [ 'amount', 'rate', 'years', 'extra' ];
		foreach ( $url_keys as $key ) {
			$url_val = isset( $_GET[ 'fsp_' . $key ] ) // phpcs:ignore WordPress.Security.NonceVerification
				? sanitize_text_field( wp_unslash( $_GET[ 'fsp_' . $key ] ) ) // phpcs:ignore WordPress.Security.NonceVerification
				: '';
			if ( '' !== $url_val ) {
				$atts[ $key ] = $url_val;
			}
		}

		// Sanitize to numeric only (empty string → keep blank for placeholder)
		$defaults = [
			'amount' => $this->sanitize_numeric( $atts['amount'] ),
			'rate'   => $this->sanitize_numeric( $atts['rate'] ),
			'years'  => $this->sanitize_numeric( $atts['years'] ),
			'extra'  => $this->sanitize_numeric( $atts['extra'] ),
		];

		// Enqueue tool assets (conditional – only runs once per request)
		$this->enqueue->enqueue_for( 'loan' );

		// Buffer template output
		ob_start();
		include FSP_PLUGIN_DIR . 'templates/loan-calculator.php';
		return ob_get_clean();
	}

	/**
	 * Sanitize a value to a safe numeric string.
	 * Returns empty string if input is not numeric.
	 *
	 * @param mixed $val
	 * @return string
	 */
	private function sanitize_numeric( $val ) {
		$val = sanitize_text_field( (string) $val );
		return is_numeric( $val ) ? $val : '';
	}
}
