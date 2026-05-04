<?php
/**
 * FSP_Enqueue
 *
 * Manages conditional asset enqueuing.
 * Scripts and styles are ONLY loaded on pages/posts that contain
 * a Finance Suite Pro shortcode, keeping every other page clean.
 */

defined( 'ABSPATH' ) || exit;

class FSP_Enqueue {

	/** Bootstraps enqueue hooks */
	public function register() {
		add_action( 'wp_enqueue_scripts', [ $this, 'register_assets' ], 5 );
		add_action( 'wp_enqueue_scripts', [ $this, 'maybe_enqueue_from_content' ], 20 );
	}

	/** Register shared asset handles */
	public function register_assets() {
		wp_register_style(
			'fsp-styles',
			FSP_PLUGIN_URL . 'assets/css/styles.css',
			[],
			FSP_VERSION
		);

		wp_register_script(
			'fsp-finance-engine',
			FSP_PLUGIN_URL . 'assets/js/finance-engine.js',
			[],
			FSP_VERSION,
			true
		);

		wp_register_script(
			'fsp-loan-calculator',
			FSP_PLUGIN_URL . 'assets/js/loan-calculator.js',
			[ 'fsp-finance-engine' ],
			FSP_VERSION,
			true
		);

		wp_register_script(
			'fsp-mortgage-calculator',
			FSP_PLUGIN_URL . 'assets/js/mortgage-calculator.js',
			[ 'fsp-finance-engine' ],
			FSP_VERSION,
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

		if ( has_shortcode( $post->post_content, 'loan_calculator' ) ) {
			$this->enqueue_for( 'loan' );
		}

		if ( has_shortcode( $post->post_content, 'mortgage_calculator' ) ) {
			$this->enqueue_for( 'mortgage' );
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
	 * Called by FSP_Shortcodes when a shortcode is rendered.
	 * Triggers wp_enqueue_scripts for the requested tool.
	 *
	 * @param string $tool  Tool identifier, e.g. 'loan'.
	 */
	public function enqueue_for( $tool ) {
		if ( isset( $this->active_tools[ $tool ] ) ) {
			return; // already enqueued this request
		}
		$this->active_tools[ $tool ] = true;

		wp_enqueue_style( 'fsp-styles' );
		wp_enqueue_script( 'fsp-finance-engine' );

		switch ( $tool ) {
			case 'loan':
				wp_enqueue_script( 'fsp-loan-calculator' );
				break;

			case 'mortgage':
				wp_enqueue_script( 'fsp-mortgage-calculator' );
				break;

			// Future tools: add cases here
			// case 'credit-card': ...
		}
	}
}
