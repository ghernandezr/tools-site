# ⚡ Performance Optimization Checklist
## Target: Google PageSpeed 90+ Mobile | 95+ Desktop

---

## 🔴 Critical (Do Before Launch)

- [ ] **Use LiteSpeed web server** — biggest single performance gain; switch hosts if necessary
- [ ] **Enable LiteSpeed Cache plugin** — full-page caching immediately cuts TTFB
- [ ] **Enable JS Defer** — LiteSpeed Cache → Optimize → JS Defer: ON
  - ⚠️ Test each calculator still works after enabling JS combine/defer
- [ ] **Enable CSS Minify + Combine** — LiteSpeed Cache → Optimize → CSS settings
- [ ] **Enable Lazy Load Images** — LiteSpeed Cache → Media → Lazy Load Images: ON
- [ ] **Reserve ad slot space** — tools.css has `min-height` on all `.ad-slot` classes → prevents CLS
- [ ] **SSL active** — Google PageSpeed penalizes non-HTTPS sites
- [ ] **No render-blocking scripts** — calculators.js loads in footer (set in functions.php)
- [ ] **Remove emoji script** — done via `toolshub_remove_bloat()` in functions.php
- [ ] **Remove jQuery Migrate** — done via `toolshub_remove_jquery_migrate()` in functions.php

---

## 🟡 Important (Do Within First Week)

- [ ] **Cloudflare free plan** — adds CDN, browser caching, and edge SSL
  ```
  Cloudflare settings:
  → Rocket Loader: OFF (breaks vanilla JS calculators)
  → Auto Minify: JS + CSS (only if NOT done by LiteSpeed)
  → Browser Cache TTL: 4 hours
  → HTTP/3 (QUIC): ON
  → Brotli: ON
  ```
- [ ] **WebP images** — convert any images to WebP before uploading
  - Use: squoosh.app (free, in-browser) or ShortPixel free tier
  - Astra theme + LiteSpeed can auto-serve WebP if server supports it
- [ ] **Google Fonts** — if using custom fonts:
  - Host locally using: fontsource.org or `@font-face` self-hosted
  - OR use system font stack in Astra (fastest option):
    `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;`
- [ ] **Limit plugins to 8 or fewer active** — each plugin = potential JS/CSS overhead
  - Active: Astra child theme + RankMath + LiteSpeed Cache + Wordfence = 3 plugins
  - Optional: WPForms Lite (for contact form) = 4 total ✅
- [ ] **Disable WordPress comments** — Settings → Discussion → uncheck all
  - Removes comment scripts from all pages
- [ ] **Set WordPress memory limit** — add to wp-config.php:
  ```php
  define('WP_MEMORY_LIMIT', '256M');
  ```
- [ ] **Disable WordPress heartbeat on frontend** — add to functions.php:
  ```php
  add_action('init', function() {
    if (!is_admin()) wp_deregister_script('heartbeat');
  });
  ```

---

## 🟢 PageSpeed Metrics Targets

| Metric | Target | How to Achieve |
|--------|--------|----------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | LiteSpeed Cache + no hero images above fold |
| **FID / INP** (Interaction to Next Paint) | < 200ms | Vanilla JS, no framework overhead |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Reserve ad slot min-heights in CSS |
| **TTFB** (Time to First Byte) | < 200ms | LiteSpeed Cache full-page cache |
| **TBT** (Total Blocking Time) | < 200ms | Defer all JS, no render-blocking scripts |
| **Speed Index** | < 3.4s | Minimize above-fold CSS size |

---

## 🔵 Astra Theme Performance Settings

```
Appearance → Customize → Global:
  → Container Width: 1200px (don't go wider — larger = more reflow)
  → Content Width: 70% (sidebar: 30% or no sidebar for tools)

Appearance → Customize → Typography:
  → Base Font Size: 16px (Google recommends 16px minimum)
  → Use system font stack OR host Google Fonts locally

Astra → Dashboard → Performance:
  → Disable: Schema Markup (RankMath handles it)
  → Disable: Comments styling
  → Disable: Old Classic Icons
  → Enable: Astra Minified CSS (outputs only used CSS)

Appearance → Customize → Layout → Blog/Archive:
  → Disable: Featured Images on archive pages if not used
```

---

## 🔵 RankMath Performance Settings

```
RankMath → General Settings → Analytics:
  → Analytics: OFF (unless you need RankMath analytics)
  → Use Google Analytics via gtag.js instead — add async to wp_head

RankMath → General Settings → Breadcrumbs:
  → Enable: YES (adds structured data, minimal performance cost)

RankMath → Sitemap:
  → Enable XML Sitemap: YES
  → Pages per Sitemap: 200
  → Include Images: NO (reduces sitemap size for a tools site)
```

---

## 🔵 Image Optimization Rules

- **Never upload images wider than 1200px** — Astra container max is 1200px
- **Compress before uploading**: use squoosh.app → WebP, quality 80
- **Use descriptive alt text** on all images (SEO + accessibility)
- **Avoid images in tool cards** — use emoji icons instead (zero HTTP requests)
- **Hero section**: avoid background images; use CSS gradient instead (see tools.css `.th-hero`)
- **If you must use images**: add `loading="lazy"` attribute to all `<img>` tags below the fold

---

## 🔵 Database Optimization (Monthly)

Run via **WP-CLI** or a plugin like **WP-Optimize** (free):

```bash
# Via WP-CLI (if available on your host):
wp transient delete --expired
wp db optimize
wp cron event run --due-now
```

Or: Install **WP-Optimize** plugin → run cleanup → then deactivate until next month.

---

## 🔵 Security Performance Balance

Wordfence has a performance option:
```
Wordfence → All Options → Performance:
  → Enable "Caching" mode: Falcon Engine — OFF (conflicts with LiteSpeed)
  → Rate Limiting: ON (prevents bot scraping that wastes server resources)
  → Block fake Googlebots: ON
```

---

## 📊 Testing Tools

1. **Google PageSpeed Insights**: pagespeed.web.dev
2. **GTmetrix** (free): gtmetrix.com — waterfall view to spot blocking resources
3. **WebPageTest**: webpagetest.org — real browser testing from multiple locations
4. **Chrome DevTools**: F12 → Lighthouse tab → run audit locally
5. **Core Web Vitals report**: Google Search Console → Experience → Core Web Vitals

---

## ✅ Pre-Launch Verification

Run through these before going live:

- [ ] PageSpeed Mobile score ≥ 90 (test at pagespeed.web.dev)
- [ ] All 10 calculators return correct results (test with known inputs)
- [ ] All internal links work (no 404s)
- [ ] Mobile menu works on iPhone and Android
- [ ] All ad slots render without blocking tool inputs
- [ ] SSL padlock visible in browser
- [ ] XML sitemap accessible at yoursite.com/sitemap_index.xml
- [ ] robots.txt accessible at yoursite.com/robots.txt
- [ ] Privacy Policy and Disclaimer pages published
- [ ] Contact form sends email (test it)
- [ ] Wordfence scan: 0 critical issues
- [ ] Google Search Console: property verified, sitemap submitted
