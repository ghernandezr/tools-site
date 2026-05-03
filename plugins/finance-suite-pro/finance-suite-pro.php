<?php
/**
 * Plugin Name:       Finance Suite Pro
 * Plugin URI:        https://example.com/finance-suite-pro
 * Description:       A modular suite of financial calculators. Start with a Loan Payment Calculator and expand to mortgage, credit card, and investment tools.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Author:            Your Name
 * Author URI:        https://example.com
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       finance-suite-pro
 */

defined( 'ABSPATH' ) || exit;

// Plugin constants
define( 'FSP_VERSION',     '1.0.0' );
define( 'FSP_PLUGIN_DIR',  plugin_dir_path( __FILE__ ) );
define( 'FSP_PLUGIN_URL',  plugin_dir_url( __FILE__ ) );
define( 'FSP_PLUGIN_FILE', __FILE__ );

// Load core classes
require_once FSP_PLUGIN_DIR . 'includes/class-init.php';
require_once FSP_PLUGIN_DIR . 'includes/class-enqueue.php';
require_once FSP_PLUGIN_DIR . 'includes/class-shortcodes.php';

// Boot the plugin
FSP_Init::instance();
