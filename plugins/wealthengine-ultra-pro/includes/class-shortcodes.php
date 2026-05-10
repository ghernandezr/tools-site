<?php
/**
 * WEUP_Shortcodes
 *
 * Registers all plugin shortcodes with WordPress.
 * Each shortcode:
 *   1. Triggers asset enqueuing for that tool only.
 *   2. Loads the corresponding PHP template.
 *   3. Returns buffered HTML (safe for use inside content areas).
 */

defined( 'ABSPATH' ) || exit;

class WEUP_Shortcodes {

	/** @var WEUP_Enqueue */
	private $enqueue;

	public function __construct( WEUP_Enqueue $enqueue ) {
		$this->enqueue = $enqueue;
	}

	/** Register all shortcodes with WordPress */
	public function register() {
		add_shortcode( 'wealthengine_calculator', [ $this, 'render_calculator' ] );
	}

	/**
	 * [wealthengine_calculator] shortcode handler.
	 *
	 * Supports URL parameter pre-fill via attributes or ?weup_* query vars.
	 *
	 * Accepted shortcode attributes:
	 *   principal  – default initial capital
	 *   monthly    – default monthly savings
	 *   rate       – default expected ROI %
	 *   years      – default years horizon
	 *   inflation  – default annual inflation %
	 *   tax        – default capital gains tax %
	 *   stepup     – default yearly savings increase %
	 *
	 * @param array|string $atts  Shortcode attributes.
	 * @return string             Rendered HTML.
	 */
	public function render_calculator( $atts ) {
		// Merge shortcode attributes with defaults
		$atts = shortcode_atts(
			[
				'principal' => '',
				'monthly'   => '',
				'rate'      => '',
				'years'     => '',
				'inflation' => '',
				'tax'       => '',
				'stepup'    => '',
			],
			$atts,
			'wealthengine_calculator'
		);

		// Allow URL parameters to override shortcode attributes (SEO / pre-fill)
		// e.g. ?weup_principal=50000&weup_monthly=1000&weup_rate=8
		$url_keys = [ 'principal', 'monthly', 'rate', 'years', 'inflation', 'tax', 'stepup' ];
		foreach ( $url_keys as $key ) {
			$url_val = isset( $_GET[ 'weup_' . $key ] ) // phpcs:ignore WordPress.Security.NonceVerification
				? sanitize_text_field( wp_unslash( $_GET[ 'weup_' . $key ] ) ) // phpcs:ignore WordPress.Security.NonceVerification
				: '';
			if ( '' !== $url_val ) {
				$atts[ $key ] = $url_val;
			}
		}

		// Sanitize to numeric only (empty string → keep blank for placeholder)
		$defaults = [
			'principal' => $this->sanitize_numeric( $atts['principal'], 0 ),
			'monthly'   => $this->sanitize_numeric( $atts['monthly'], 0 ),
			'rate'      => $this->sanitize_numeric( $atts['rate'], 0 ),
			'years'     => $this->sanitize_numeric( $atts['years'], 0 ),
			'inflation' => $this->sanitize_numeric( $atts['inflation'], 0 ),
			'tax'       => $this->sanitize_numeric( $atts['tax'], 0 ),
			'stepup'    => $this->sanitize_numeric( $atts['stepup'], 0 ),
		];

		// Enqueue tool assets (conditional – only runs once per request)
		$this->enqueue->enqueue_for( 'calculator' );

		// Buffer template output
		$template = WEUP_PLUGIN_DIR . 'templates/calculator.php';
		if ( ! file_exists( $template ) ) {
			return '';
		}
		ob_start();
		require $template;
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
