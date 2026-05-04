<?php
/**
 * ToolsHub Child Theme Functions
 * Performance-first: minimal enqueues, no bloat
 */

/**
 * AdSense Publisher ID — set this after AdSense approval.
 * Leave empty ('') to hide all ad slots (safe during application review).
 */
define( 'TOOLSHUB_ADSENSE_PUB_ID', '' );

/**
 * Register custom logo support
 */
function toolshub_custom_logo_setup() {
    add_theme_support( 'custom-logo', array(
        'height'      => 80,
        'flex-height' => true,
        'flex-width'  => true,
        'header-text' => array( 'site-title', 'site-description' ),
    ) );

    register_nav_menus( array(
        'footer-legal' => __( 'Footer Legal Menu', 'astra-child' ),
    ) );
}
add_action( 'after_setup_theme', 'toolshub_custom_logo_setup' );


/**
 * Output full footer block (logo + nav links + copyright + legal menu)
 */
function toolshub_footer_block() {
    $year      = date( 'Y' );
    $site_name = get_bloginfo( 'name' );
    $site_url  = home_url( '/' );
    ?>
    <footer class="th-footer">
        <div class="th-container">
            <div class="th-footer__inner">
                <a href="<?php echo esc_url( $site_url ); ?>" class="th-footer__logo">
                    <?php echo esc_html( $site_name ); ?>
                </a>
                <ul class="th-footer__links">
                    <li><a href="<?php echo esc_url( home_url( '/privacy-policy/' ) ); ?>">Privacy Policy</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/cookie-policy/' ) ); ?>">Cookie Policy</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/disclaimer/' ) ); ?>">Disclaimer</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>">Contact</a></li>
                </ul>
            </div>
        </div>
    </footer>
    <?php
}
add_action( 'astra_footer', 'toolshub_footer_block' );


/**
 * Remove Astra's native footer bar — works on free version too.
 * CSS fallback is in tools.css (.site-footer { display:none })
 */
add_action( 'init', function() {
    remove_action( 'astra_footer', 'astra_footer_markup',     10 );
    remove_action( 'astra_footer', 'astra_footer_bar_markup', 10 );
} );


/**
 * Enqueue parent theme stylesheet + child theme assets
 */
function toolshub_child_enqueue_styles() {
    wp_enqueue_style(
        'astra-parent-style',
        get_template_directory_uri() . '/style.css',
        array(),
        wp_get_theme( 'astra' )->get( 'Version' )
    );

    wp_enqueue_style(
        'toolshub-tools-css',
        get_stylesheet_directory_uri() . '/assets/css/tools.css',
        array( 'astra-parent-style' ),
        '1.0.0'
    );

    // Only load calculator JS on tool pages
    if ( is_page() ) {
        wp_enqueue_script(
            'toolshub-calculators',
            get_stylesheet_directory_uri() . '/assets/js/calculators.js',
            array(),
            '1.0.0',
            true // Load in footer — CRITICAL for performance
        );
    }
}
add_action( 'wp_enqueue_scripts', 'toolshub_child_enqueue_styles' );


/**
 * Remove unnecessary WordPress default scripts/styles for performance
 */
function toolshub_remove_bloat() {
    // Remove emoji scripts (save ~14kb)
    remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
    remove_action( 'wp_print_styles', 'print_emoji_styles' );
    remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
    remove_action( 'admin_print_styles', 'print_emoji_styles' );

    // Remove WordPress generator meta tag (minor security improvement)
    remove_action( 'wp_head', 'wp_generator' );

    // Remove wlwmanifest link
    remove_action( 'wp_head', 'wlwmanifest_link' );

    // Remove RSD link
    remove_action( 'wp_head', 'rsd_link' );

    // Remove shortlink
    remove_action( 'wp_head', 'wp_shortlink_wp_head' );
}
add_action( 'init', 'toolshub_remove_bloat' );


/**
 * Disable XML-RPC (security + performance)
 */
add_filter( 'xmlrpc_enabled', '__return_false' );


/**
 * Remove jQuery Migrate (reduces JS parse time)
 */
function toolshub_remove_jquery_migrate( $scripts ) {
    if ( ! is_admin() && isset( $scripts->registered['jquery'] ) ) {
        $script = $scripts->registered['jquery'];
        if ( $script->deps ) {
            $script->deps = array_diff( $script->deps, array( 'jquery-migrate' ) );
        }
    }
}
add_action( 'wp_default_scripts', 'toolshub_remove_jquery_migrate' );


/**
 * Add preconnect hints for Google AdSense (performance)
 */
function toolshub_resource_hints( $urls, $relation_type ) {
    if ( 'preconnect' === $relation_type ) {
        $urls[] = array(
            'href' => 'https://pagead2.googlesyndication.com',
            'crossorigin',
        );
        $urls[] = array(
            'href' => 'https://fonts.googleapis.com',
        );
    }
    return $urls;
}
add_filter( 'wp_resource_hints', 'toolshub_resource_hints', 10, 2 );


/**
 * Add SoftwareApplication schema for tool pages
 * Inject via wp_head on tool pages
 */
function toolshub_tool_schema() {
    if ( ! is_page() ) return;

    $page_slug = get_post_field( 'post_name', get_the_ID() );

    $tool_slugs = array(
        'loan-payment-calculator',
        'credit-card-interest-calculator',
        'compound-interest-calculator',
        'salary-to-hourly-converter',
        'tip-calculator',
        'percentage-calculator',
        'discount-calculator',
        'fuel-cost-calculator',
        'date-difference-calculator',
        'unit-converter',
    );

    if ( ! in_array( $page_slug, $tool_slugs, true ) ) return;

    $schema = array(
        '@context'            => 'https://schema.org',
        '@type'               => 'SoftwareApplication',
        'name'                => get_the_title(),
        'url'                 => get_permalink(),
        'applicationCategory' => 'UtilitiesApplication',
        'operatingSystem'     => 'Web Browser',
        'offers'              => array(
            '@type'    => 'Offer',
            'price'    => '0',
            'priceCurrency' => 'USD',
        ),
        'description'         => get_the_excerpt(),
    );

    echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES ) . '</script>' . "\n";
}
add_action( 'wp_head', 'toolshub_tool_schema' );


/**
 * Add FAQ schema — reads from page content shortcode [faq] blocks
 * Usage: add FAQ schema via RankMath Schema Builder (recommended)
 * This is a fallback for pages without RankMath FAQ schema
 */


/**
 * Breadcrumb function (uses RankMath breadcrumbs if active)
 */
function toolshub_breadcrumb() {
    if ( function_exists( 'rank_math_the_breadcrumbs' ) ) {
        rank_math_the_breadcrumbs();
    }
}


/**
 * Custom excerpt length for tool pages
 */
function toolshub_excerpt_length( $length ) {
    return 30;
}
add_filter( 'excerpt_length', 'toolshub_excerpt_length' );


/**
 * Disable Gutenberg for pages if using classic editor fallback
 * (Comment out if you want block editor)
 */
// add_filter( 'use_block_editor_for_post_type', '__return_false' );


/**
 * Disable wpautop on pages to prevent WordPress from injecting
 * unwanted <p> tags around custom HTML blocks
 */
function toolshub_disable_wpautop_on_pages() {
    if ( is_page() ) {
        remove_filter( 'the_content', 'wpautop' );
        remove_filter( 'the_content', 'wptexturize' );
    }
}
add_action( 'template_redirect', 'toolshub_disable_wpautop_on_pages' );


/**
 * Add custom body class for tool pages (for targeted CSS)
 */
function toolshub_body_classes( $classes ) {
    if ( is_page() ) {
        $slug = get_post_field( 'post_name', get_the_ID() );
        if ( strpos( $slug, 'calculator' ) !== false || strpos( $slug, 'converter' ) !== false ) {
            $classes[] = 'is-tool-page';
        }
    }
    return $classes;
}
add_filter( 'body_class', 'toolshub_body_classes' );


/**
 * Lazy load AdSense ads — output ad slot wrapper
 * Use shortcode: [ad_slot position="header|mid|footer"]
 */
function toolshub_ad_slot_shortcode( $atts ) {
    if ( empty( TOOLSHUB_ADSENSE_PUB_ID ) ) {
        return '';
    }

    $atts = shortcode_atts( array( 'position' => 'mid' ), $atts );
    $position = esc_attr( $atts['position'] );

    return '<div class="ad-slot ad-slot--' . $position . '" data-ad-position="' . $position . '" aria-label="Advertisement">
    <!-- AdSense unit injected here by adsense-loader.js -->
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="' . esc_attr( TOOLSHUB_ADSENSE_PUB_ID ) . '"
         data-ad-slot="XXXXXXXXXX"
         data-ad-format="auto"
         data-full-width-responsive="true"
         data-ad-lazy="true"></ins>
</div>';
}
add_shortcode( 'ad_slot', 'toolshub_ad_slot_shortcode' );
