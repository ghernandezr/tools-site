<?php
/**
 * WEUP_Enqueue
 *
 * Manages conditional asset enqueuing for the WealthEngine Ultra Pro plugin.
 * Scripts and styles are ONLY loaded on pages/posts that contain
 * the [wealthengine_calculator] shortcode.
 */

defined( 'ABSPATH' ) || exit;

class WEUP_Enqueue {

	/** Bootstraps enqueue hooks */
	public function register() {
		add_action( 'wp_enqueue_scripts', [ $this, 'register_assets' ], 5 );
		add_action( 'wp_enqueue_scripts', [ $this, 'maybe_enqueue_from_content' ], 20 );
	}

	/** Register shared asset handles */
	public function register_assets() {
		// Register Chart.js — self-hosted to avoid GDPR/CDN external requests
		wp_register_script(
			'weup-chartjs',
			WEUP_PLUGIN_URL . 'assets/js/vendor/chart.umd.min.js',
			[],
			'4.4.0',
			true
		);

		// Register local CSS (replaces Tailwind CDN)
		wp_register_style(
			'weup-styles',
			WEUP_PLUGIN_URL . 'assets/css/styles.css',
			[],
			WEUP_VERSION
		);

		// Register Inter font — self-hosted to avoid Google Fonts GDPR/external requests
		wp_register_style(
			'weup-fonts',
			WEUP_PLUGIN_URL . 'assets/css/fonts/inter.css',
			[],
			WEUP_VERSION
		);

		// Register main calculator script
		wp_register_script(
			'weup-calculator',
			WEUP_PLUGIN_URL . 'assets/js/calculator.js',
			[ 'weup-chartjs' ],
			WEUP_VERSION,
			true
		);
	}

	/** Conditionally enqueue assets based on post content */
	public function maybe_enqueue_from_content() {
		if ( is_admin() ) {
			return;
		}

		$post = get_post();
		if ( ! $post instanceof WP_Post ) {
			return;
		}

		if ( has_shortcode( $post->post_content, 'wealthengine_calculator' ) ) {
			$this->enqueue_for( 'calculator' );
			return;
		}

		// Fallback for page builders (Elementor, Divi, etc.) that store content outside post_content:
		// if any weup_* query param is present, the shortcode is likely rendering on this page.
		if ( ! empty( $_GET ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			foreach ( array_keys( $_GET ) as $k ) { // phpcs:ignore WordPress.Security.NonceVerification
				if ( strpos( $k, 'weup_' ) === 0 ) {
					$this->enqueue_for( 'calculator' );
					break;
				}
			}
		}
	}

	/**
	 * Tracks which shortcodes are active on the current request
	 * so we know which asset bundles to load.
	 *
	 * @var array<string, bool>
	 */
	private $active_tools = [];

	/**
	 * Called by WEUP_Shortcodes when a shortcode is rendered.
	 * Triggers wp_enqueue_scripts for the requested tool.
	 *
	 * @param string $tool  Tool identifier, e.g. 'calculator'.
	 */
	public function enqueue_for( $tool ) {
		if ( isset( $this->active_tools[ $tool ] ) ) {
			return; // already enqueued this request
		}
		$this->active_tools[ $tool ] = true;

		wp_enqueue_style( 'weup-styles' );
		wp_enqueue_style( 'weup-fonts' );
		wp_enqueue_script( 'weup-chartjs' );
		wp_enqueue_script( 'weup-calculator' );
	}
}
