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
		add_shortcode( 'loan_calculator',     [ $this, 'render_loan_calculator' ] );
		add_shortcode( 'mortgage_calculator', [ $this, 'render_mortgage_calculator' ] );
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
				'amount'       => '',
				'rate'         => '',
				'years'        => '',
				'extra'        => '',
				'tax'          => '',
				'insurance'    => '',
				'mortgage_url' => '',
			],
			$atts,
			'loan_calculator'
		);

		// Allow URL parameters to override shortcode attributes (SEO / pre-fill)
		// e.g. ?fsp_amount=200000&fsp_rate=6.5&fsp_years=30
		$url_keys = [ 'amount', 'rate', 'years', 'extra', 'tax', 'insurance', 'mortgage_url' ];
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
			'amount'       => $this->sanitize_numeric( $atts['amount'], 0 ),
			'rate'         => $this->sanitize_numeric( $atts['rate'], 0 ),
			'years'        => $this->sanitize_numeric( $atts['years'], 0 ),
			'extra'        => $this->sanitize_numeric( $atts['extra'], 0 ),
			'tax'          => $this->sanitize_numeric( $atts['tax'], 0 ),
			'insurance'    => $this->sanitize_numeric( $atts['insurance'], 0 ),
			'mortgage_url' => esc_url_raw( $atts['mortgage_url'] ),
		];

		// Enqueue tool assets (conditional – only runs once per request)
		$this->enqueue->enqueue_for( 'loan' );

		// Buffer template output
		ob_start();
		include FSP_PLUGIN_DIR . 'templates/loan-calculator.php';
		return ob_get_clean();
	}

	/**
	 * [mortgage_calculator] shortcode handler.
	 *
	 * Supports URL parameter pre-fill via attributes or ?fsp_* query vars.
	 *
	 * Accepted shortcode attributes:
	 *   home_price – default home purchase price
	 *   down       – default down payment in dollars
	 *   rate       – default interest rate (%)
	 *   years      – default loan term in years
	 *   extra      – default extra monthly payment
	 *   tax        – default annual property tax
	 *   insurance  – default annual insurance
	 *   pmi        – default PMI annual rate (%)
	 *   hoa        – default monthly HOA fee
	 *   loan_url   – URL of the loan calculator page (for cross-link)
	 *
	 * @param array|string $atts  Shortcode attributes.
	 * @return string             Rendered HTML.
	 */
	public function render_mortgage_calculator( $atts ) {
		$atts = shortcode_atts(
			[
				'home_price' => '',
				'down'       => '',
				'rate'       => '',
				'years'      => '',
				'extra'      => '',
				'tax'        => '',
				'insurance'  => '',
				'pmi'        => '',
				'hoa'        => '',
				'loan_url'   => '',
			],
			$atts,
			'mortgage_calculator'
		);

		$url_keys = [ 'home_price', 'down', 'rate', 'years', 'extra', 'tax', 'insurance', 'pmi', 'hoa' ];
		foreach ( $url_keys as $key ) {
			$url_val = isset( $_GET[ 'fsp_' . $key ] ) // phpcs:ignore WordPress.Security.NonceVerification
				? sanitize_text_field( wp_unslash( $_GET[ 'fsp_' . $key ] ) ) // phpcs:ignore WordPress.Security.NonceVerification
				: '';
			if ( '' !== $url_val ) {
				$atts[ $key ] = $url_val;
			}
		}

		$defaults = [
			'home_price' => $this->sanitize_numeric( $atts['home_price'], 0 ),
			'down'       => $this->sanitize_numeric( $atts['down'], 0 ),
			'rate'       => $this->sanitize_numeric( $atts['rate'], 0 ),
			'years'      => $this->sanitize_numeric( $atts['years'], 0 ),
			'extra'      => $this->sanitize_numeric( $atts['extra'], 0 ),
			'tax'        => $this->sanitize_numeric( $atts['tax'], 0 ),
			'insurance'  => $this->sanitize_numeric( $atts['insurance'], 0 ),
			'pmi'        => $this->sanitize_numeric( $atts['pmi'], 0 ),
			'hoa'        => $this->sanitize_numeric( $atts['hoa'], 0 ),
			'loan_url'   => esc_url_raw( $atts['loan_url'] ),
		];

		$this->enqueue->enqueue_for( 'mortgage' );

		ob_start();
		include FSP_PLUGIN_DIR . 'templates/mortgage-calculator.php';
		return ob_get_clean();
	}

	/**
	 * Sanitize a value to a safe numeric string.
	 * Returns empty string if input is not numeric or below the minimum.
	 *
	 * @param mixed $val Raw value.
	 * @param float $min Minimum allowed value (inclusive).
	 * @return string
	 */
	private function sanitize_numeric( $val, $min = 0 ) {
		$val = sanitize_text_field( (string) $val );
		if ( '' === $val ) {
			return '';
		}
		if ( ! is_numeric( $val ) ) {
			return '';
		}
		$number = (float) $val;
		if ( $number < $min ) {
			return '';
		}
		return (string) $number;
	}
}
