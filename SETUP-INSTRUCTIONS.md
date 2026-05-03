# 🛠️ Complete WordPress Setup Instructions

## Step 1: Hosting Requirements

Choose a host with **LiteSpeed web server** for best cache performance:
- **Recommended**: Hostinger, A2 Hosting, WPX (all have LiteSpeed)
- **Minimum PHP**: 8.1+
- **MySQL**: 5.7+ or MariaDB 10.3+
- **Memory limit**: 256MB+

---

## Step 2: WordPress Installation

1. Install WordPress via your host's control panel (1-click install)
2. Set permalink structure: **Settings → Permalinks → Post name** (`/%postname%/`)
3. Set timezone: **Settings → General → Timezone**
4. Disable comments globally: **Settings → Discussion → uncheck all comment settings**

---

## Step 3: Install Astra Theme

1. **Appearance → Themes → Add New → Search "Astra"**
2. Install and Activate
3. Go to **Appearance → Customize → Astra Options**

### Astra Performance Settings:
```
Appearance → Customize → Global → Colors
  → Set primary color to your brand color (#1a73e8 recommended)

Appearance → Customize → Header Builder
  → Use: Logo + Primary Menu only
  → Remove: account icon, search icon (reduces JS)

Appearance → Customize → Footer Builder
  → Simple: Copyright text only (1 column)

Astra Settings (dashboard widget):
  → Disable: Schema Markup (RankMath handles this)
  → Disable: Comments styling (no comments = less CSS)
  → Disable: Old Classic Icons (lighter)
```

---

## Step 4: Install Required Plugins

Install all via **Plugins → Add New → Search**:

### 4.1 RankMath SEO (Free)
- Search: "Rank Math SEO"
- Install → Activate
- Run setup wizard:
  - **Site Type**: Blog/Website
  - **SEO Mode**: Advanced
  - **Enable**: Schema, Sitemap, Breadcrumbs, 404 Monitor
  - **Disable**: Redirect Manager (use only if needed)

**RankMath Key Settings:**
```
RankMath → Titles & Meta → Home Page
  → Title: Free Online Calculators & Utility Tools | ToolsHub
  → Description: Free online calculators for loans, interest, salary, tips & more. Fast, accurate, no signup required.

RankMath → Sitemap → Enable XML Sitemap
  → Submit sitemap to Google Search Console: yoursite.com/sitemap_index.xml

RankMath → Schema → Default Schema Type: Article (for tools pages)
```

### 4.2 LiteSpeed Cache (Free)
- Search: "LiteSpeed Cache"
- Install → Activate

**LiteSpeed Cache Key Settings:**
```
LiteSpeed Cache → Cache:
  ✅ Enable Cache
  ✅ Cache Logged-in Users: OFF
  ✅ Cache Commenters: OFF
  ✅ Cache REST API: ON
  ✅ Browser Cache: ON

LiteSpeed Cache → Optimize:
  ✅ CSS Minify: ON
  ✅ CSS Combine: ON
  ✅ JS Minify: ON
  ✅ JS Combine: OFF (can break calculators — test first)
  ✅ JS Defer: ON (CRITICAL for performance)
  ✅ Image Lazy Load: ON
  ✅ Responsive Placeholder: ON

LiteSpeed Cache → Page Optimization → Media:
  ✅ Lazy Load Images: ON
  ✅ Add Missing Sizes: ON
  ✅ Generate WebP: ON (if LiteSpeed server)

LiteSpeed Cache → CDN:
  → Use Cloudflare free plan (recommended)
  → Or use LiteSpeed QUIC.cloud (free tier)
```

> ⚠️ **If not using LiteSpeed server**: Install **WP Super Cache** instead.
> WP Super Cache settings: Enable caching, Mod_Rewrite caching mode.

### 4.3 Wordfence Security (Free)
- Search: "Wordfence Security"
- Install → Activate → Get free license

**Wordfence Key Settings:**
```
Wordfence → Firewall:
  ✅ Web Application Firewall: Enabled + Learning Mode (7 days) → then Protection Mode
  ✅ Brute Force Protection: ON
  ✅ Block IPs that exceed login attempts

Wordfence → Scan:
  → Run initial scan
  → Schedule: Weekly

Wordfence → Login Security:
  ✅ Two-Factor Authentication: Enable for admin accounts
```

---

## Step 5: Create WordPress Pages

Create each page via **Pages → Add New**:

| Page | Slug | Template |
|---|---|---|
| Home | `/` (set as homepage) | Default |
| About | `/about/` | Default |
| Contact | `/contact/` | Default |
| Privacy Policy | `/privacy-policy/` | Default |
| Disclaimer | `/disclaimer/` | Default |
| Blog | `/blog/` | Default |

### Tool Pages (create under a "Tools" parent or standalone):

| Tool | Slug |
|---|---|
| Loan Payment Calculator | `/loan-payment-calculator/` |
| Credit Card Interest Calculator | `/credit-card-interest-calculator/` |
| Compound Interest Calculator | `/compound-interest-calculator/` |
| Salary to Hourly Converter | `/salary-to-hourly-converter/` |
| Tip Calculator | `/tip-calculator/` |
| Percentage Calculator | `/percentage-calculator/` |
| Discount Calculator | `/discount-calculator/` |
| Fuel Cost Calculator | `/fuel-cost-calculator/` |
| Date Difference Calculator | `/date-difference-calculator/` |
| Unit Converter | `/unit-converter/` |

---

## Step 6: Set Homepage

1. Create a page titled "Home" with your home page content
2. **Settings → Reading → A static page → Homepage: Home**
3. Create a page titled "Blog" → set as Posts page

---

## Step 7: Navigation Menu

**Appearance → Menus → Create Menu "Primary"**

```
Primary Menu:
├── Home (/)
├── Tools (# — custom link as dropdown parent)
│   ├── Loan Payment Calculator
│   ├── Credit Card Interest Calculator
│   ├── Compound Interest Calculator
│   ├── Salary to Hourly Converter
│   ├── Tip Calculator
│   ├── Percentage Calculator
│   ├── Discount Calculator
│   ├── Fuel Cost Calculator
│   ├── Date Difference Calculator
│   └── Unit Converter
├── Blog (/blog/)
└── About (/about/)

Footer Menu:
├── Privacy Policy
├── Disclaimer
└── Contact
```

---

## Step 8: Add Calculator Scripts to Theme

1. Copy `theme/style.css` content to your Astra child theme's `style.css`
2. Copy `theme/functions.php` content to your child theme's `functions.php`
3. Upload `theme/assets/css/tools.css` and `theme/assets/js/calculators.js` to child theme

OR use **Appearance → Theme File Editor** (not recommended for production).

**Recommended**: Use child theme. See `theme/` folder files.

---

## Step 9: Google AdSense Setup

1. Apply at **ads.google.com** with your site URL
2. Add site verification code to WordPress:
   - **RankMath → General Settings → Webmaster Tools → Google Search Console** (paste verification tag)
   - OR add AdSense script via **Appearance → Customize → Additional CSS / Header Scripts**
3. Once approved, create ad units and paste into `ads/adsense-slots.html` positions

---

## Step 10: Google Search Console

1. Go to **search.google.com/search-console**
2. Add property → URL prefix → your domain
3. Verify via HTML tag (add to RankMath → Webmaster Tools)
4. Submit sitemap: `yoursite.com/sitemap_index.xml`

---

## Step 11: Cloudflare (Recommended)

1. Sign up free at **cloudflare.com**
2. Add your domain → update nameservers at registrar
3. Settings:
   ```
   SSL/TLS: Full (strict)
   Speed → Optimization:
     ✅ Auto Minify: CSS, JS (if not done by LiteSpeed)
     ✅ Rocket Loader: OFF (breaks calculators)
     ✅ Mirage: ON (lazy loading images)
   Caching:
     → Browser Cache TTL: 4 hours
     → Cache Level: Standard
   ```

---

## ✅ Final Verification

- [ ] All 10 tool pages created with content
- [ ] All calculators working (test each one)
- [ ] PageSpeed Insights score 90+ mobile
- [ ] XML Sitemap submitted to GSC
- [ ] Wordfence scan clean
- [ ] SSL certificate active (https://)
- [ ] No broken links (use Broken Link Checker plugin temporarily)
- [ ] Mobile menu working
- [ ] AdSense code in place (after approval)
