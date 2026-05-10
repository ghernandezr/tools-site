<?php
/**
 * WEUP_Init
 *
 * Plugin initialization class using singleton pattern.
 * Registers hooks and initializes other plugin classes.
 */

defined( 'ABSPATH' ) || exit;

class WEUP_Init {

	/** @var WEUP_Init Singleton instance */
	private static $instance = null;

	/** @var WEUP_Enqueue Asset enqueue class */
	private $enqueue;

	/** @var WEUP_Shortcodes Shortcode class */
	private $shortcodes;

	/**
	 * Get singleton instance.
	 *
	 * @return WEUP_Init
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Prevent cloning of the singleton instance.
	 */
	private function __clone() {}

	/**
	 * Prevent unserializing of the singleton instance.
	 *
	 * @throws \Exception
	 */
	public function __wakeup() {
		throw new \Exception( 'Cannot unserialize a singleton.' );
	}

	/**
	 * Constructor - private for singleton.
	 */
	private function __construct() {
		$this->load_dependencies();
		$this->init_hooks();
	}

	/**
	 * Load required dependencies.
	 */
	private function load_dependencies() {
		$this->enqueue    = new WEUP_Enqueue();
		$this->shortcodes = new WEUP_Shortcodes( $this->enqueue );
	}

	/**
	 * Register WordPress hooks.
	 */
	private function init_hooks() {
		add_action( 'plugins_loaded', [ $this, 'init_classes' ], 10 );
	}

	/**
	 * Initialize plugin classes after plugins are loaded.
	 */
	public function init_classes() {
		$this->enqueue->register();
		$this->shortcodes->register();
	}
}
