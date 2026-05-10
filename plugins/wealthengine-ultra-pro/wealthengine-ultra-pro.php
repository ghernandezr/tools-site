<?php
/**
 * Plugin Name:       WealthEngine Ultra Pro
 * Plugin URI:        https://quickcalclab.com/wealthengine-ultra-pro
 * Description:       Advanced compound interest calculator with FIRE analytics, inflation adjustment, tax calculations, and market volatility projections.
 * Version:           1.1.0
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Author:            QuickCalc Lab
 * Author URI:        https://quickcalclab.com
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       wealthengine-ultra-pro
 */

defined( 'ABSPATH' ) || exit;

// Plugin constants
define( 'WEUP_VERSION',     '1.1.0' );
define( 'WEUP_PLUGIN_DIR',  plugin_dir_path( __FILE__ ) );
define( 'WEUP_PLUGIN_URL',  plugin_dir_url( __FILE__ ) );
define( 'WEUP_PLUGIN_FILE', __FILE__ );

// Load core classes
require_once WEUP_PLUGIN_DIR . 'includes/class-init.php';
require_once WEUP_PLUGIN_DIR . 'includes/class-enqueue.php';
require_once WEUP_PLUGIN_DIR . 'includes/class-shortcodes.php';

// Boot the plugin
WEUP_Init::instance();
