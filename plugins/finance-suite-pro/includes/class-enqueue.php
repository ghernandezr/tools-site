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

		// Shared stylesheet (loaded once regardless of tool count)
		if ( ! wp_style_is( 'fsp-styles', 'enqueued' ) ) {
			wp_enqueue_style(
				'fsp-styles',
				FSP_PLUGIN_URL . 'assets/css/styles.css',
				[],
				FSP_VERSION
			);
		}

		// Shared finance engine (no dependencies, pure logic)
		if ( ! wp_script_is( 'fsp-finance-engine', 'enqueued' ) ) {
			wp_enqueue_script(
				'fsp-finance-engine',
				FSP_PLUGIN_URL . 'assets/js/finance-engine.js',
				[],           // no jQuery dependency
				FSP_VERSION,
				true          // load in footer
			);
		}

		// Tool-specific controller
		switch ( $tool ) {
			case 'loan':
				wp_enqueue_script(
					'fsp-loan-calculator',
					FSP_PLUGIN_URL . 'assets/js/loan-calculator.js',
					[ 'fsp-finance-engine' ], // depends on engine
					FSP_VERSION,
					true
				);
				break;

			// Future tools: add cases here
			// case 'mortgage': ...
			// case 'credit-card': ...
		}
	}
}
