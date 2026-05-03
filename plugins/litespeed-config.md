# LiteSpeed Cache — Complete Configuration Guide

## Requirement
LiteSpeed Cache works best on **LiteSpeed web servers**. Most features still work on Apache/Nginx hosts (minification, lazy load, browser cache), but full-page cache requires LiteSpeed server. Confirm with your host.

**Hosts with LiteSpeed**: Hostinger, A2 Hosting, Namecheap (some plans), WPX, ChemiCloud

---

## Installation
1. Plugins → Add New → Search "LiteSpeed Cache" → Install → Activate
2. LiteSpeed Cache appears in left admin menu

---

## Cache Settings

```
LiteSpeed Cache → Cache → Cache Control Settings:
  ✅ Enable Cache: ON
  ✅ Cache Logged-in Users: OFF
  ✅ Cache Commenters: OFF
  ✅ Cache REST API: ON
  ✅ Cache Login Page: OFF
  ✅ Cache favicon.ico: ON
  ✅ Cache PHP Resources: ON

LiteSpeed Cache → Cache → TTL:
  → Default Public Cache TTL: 604800 (7 days — good for static tool pages)
  → Default Private Cache TTL: 1800
  → Default Front Page TTL: 86400 (1 day)

LiteSpeed Cache → Cache → Browser:
  ✅ Browser Cache: ON
  → Browser Cache TTL: 31557600 (1 year for static assets)

LiteSpeed Cache → Cache → Advanced:
  ✅ Instant Click: OFF (can conflict with calculator JS)
  → Login Cookie: (leave default)
```

---

## Optimize Settings (CRITICAL for PageSpeed)

```
LiteSpeed Cache → Optimize → CSS Settings:
  ✅ CSS Minify: ON
  ✅ CSS Combine: ON
  ✅ CSS Combine External and Inline: OFF (test first — may break Astra)
  → CSS Excludes: (leave empty initially; add problematic files if things break)

LiteSpeed Cache → Optimize → JS Settings:
  ✅ JS Minify: ON
  ✅ JS Combine: OFF (⚠️ may break vanilla JS calculators — test before enabling)
  ✅ JS Deferred Loading: ON — THIS IS CRITICAL
  → Deferred JS Excludes: (add any scripts that must load synchronously — usually none)
  ✅ Load jQuery Asynchronously: OFF (safer for compatibility)

LiteSpeed Cache → Optimize → HTML Settings:
  ✅ HTML Minify: ON
  ✅ Remove Query Strings: ON
  ✅ Remove WordPress Emoji: ON (also done in functions.php — redundant is fine)
  ✅ Remove Google Fonts: OFF (unless you've already removed all Google Fonts)

LiteSpeed Cache → Optimize → Media:
  ✅ Lazy Load Images: ON
  ✅ Lazy Load Iframes: ON
  ✅ Add Missing Sizes: ON
  ✅ Responsive Placeholder: ON
  ✅ Generate WebP: ON (requires LiteSpeed server + ImageMagick)
  ✅ WebP Replacement: ON
  → Lazy Load Exclusions: .adsbygoogle (exclude AdSense from lazy load — Google handles it)
```

---

## Page Optimization Settings

```
LiteSpeed Cache → Page Optimization → Tuning:
  → CSS Excludes from Combine: (add if Astra styles break)
  → JS Excludes from Combine: calculators.js (if JS Combine is enabled)
  → JS Excludes from Defer: (add scripts that must run synchronously)

LiteSpeed Cache → Page Optimization → Critical CSS:
  ✅ Generate Critical CSS: ON (reduces render-blocking CSS significantly)
  → Asynchronous CSS: ON
  → Note: This may take a few minutes to generate on first load per page
```

---

## CDN Settings

```
LiteSpeed Cache → CDN:
  Option A — Use Cloudflare (recommended):
    ✅ Use CDN: OFF in LiteSpeed (let Cloudflare handle CDN)
    → Set up Cloudflare separately (free plan)

  Option B — Use QUIC.cloud (LiteSpeed's free CDN):
    ✅ Use CDN: ON
    → CDN URL: (auto-filled when linked to QUIC.cloud account)
    → QUIC.cloud free tier: 5GB/month CDN traffic
    → Link at: quic.cloud (free account)
```

---

## Advanced Settings

```
LiteSpeed Cache → Advanced:
  ✅ Improve HTTP/HTTPS Compatibility: ON
  ✅ Instant Click: OFF (conflicts with calculator event listeners)

LiteSpeed Cache → Advanced → Heartbeat:
  → Control Heartbeat: Restrict
  → Front-end Interval: OFF (disables WordPress heartbeat on frontend — improves performance)
  → Back-end Interval: 60 seconds
```

---

## What to DO After Enabling

1. **Purge all caches**: LiteSpeed Cache → Toolbox → Purge All
2. **Test calculators**: Open each tool, verify inputs work and calculations run
3. **Test on mobile**: Use Chrome DevTools device emulation
4. **Run PageSpeed**: pagespeed.web.dev — aim for 90+ mobile
5. **Check GTmetrix**: Look for any remaining render-blocking resources

---

## Troubleshooting: Calculators Not Working After Cache Enable

If JS defer breaks a calculator:

1. Go to LiteSpeed Cache → Optimize → JS Settings
2. Add `calculators.js` to **Deferred JS Excludes** or **JS Combine Excludes**
3. Purge cache and retest

If CSS Combine breaks layout:

1. Go to LiteSpeed Cache → Optimize → CSS Settings
2. Add the problematic stylesheet filename to **CSS Excludes**
3. Purge cache and retest

---

## Alternative: WP Super Cache (if not on LiteSpeed server)

```
Settings → WP Super Cache:
  → Caching: ON
  → Cache Delivery Method: mod_rewrite (fastest)
  → Cache Restrictions: Disable caching for known users: ON
  → Compress pages: ON
  → Cache Rebuilding: ON
  → CDN: Use Cloudflare plugin separately
```

Note: WP Super Cache does NOT do JS/CSS optimization. 
Use **Autoptimize** (free) alongside it for minification/deferring.
