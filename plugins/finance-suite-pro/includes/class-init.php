<?php
/**
 * FSP_Init
 *
 * Bootstraps the plugin: registers all subsystems via WordPress hooks.
 * Uses a singleton to prevent double-instantiation.
 */

defined( 'ABSPATH' ) || exit;

class FSP_Init {

	/** @var FSP_Init|null Singleton instance */
	private static $instance = null;

	/** Retrieve (or create) the singleton */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/** Private constructor — register hooks */
	private function __construct() {
		$enqueue    = new FSP_Enqueue();
		$enqueue->register();
		$shortcodes = new FSP_Shortcodes( $enqueue );

		// Register shortcodes on init
		add_action( 'init', [ $shortcodes, 'register' ] );
	}
}
