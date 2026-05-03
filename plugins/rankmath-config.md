# RankMath SEO — Complete Configuration Guide

## Installation
1. Plugins → Add New → Search "Rank Math SEO" → Install → Activate
2. Go through Setup Wizard: Advanced mode, select "Blog/Website" type
3. Connect Google Search Console when prompted (optional but recommended)

---

## General Settings

```
RankMath → General Settings → Links:
  ✅ Nofollow external links: OFF (don't nofollow by default — use judgment)
  ✅ Open external links in new tab: ON
  ✅ Add sponsored/ugc attributes: OFF (not needed for a tools site)

RankMath → General Settings → Breadcrumbs:
  ✅ Enable Breadcrumbs: ON
  → Separator: › (default)
  → Home label: Home
  → Add breadcrumb shortcode to Astra's header if desired:
    [rank_math_breadcrumb]

RankMath → General Settings → 404 Monitor:
  ✅ Enable 404 Monitor: ON
  → Check monthly, fix any broken internal links

RankMath → General Settings → Redirections:
  ✅ Enable: ON (useful for managing slug changes)

RankMath → General Settings → Schema:
  ✅ Default Schema Type: Article
  (Tools pages will be overridden by functions.php SoftwareApplication schema)
```

---

## Titles & Meta Settings

```
RankMath → Titles & Meta → Global Meta:
  → Separator: |
  → Website Name: ToolsHub

RankMath → Titles & Meta → Home Page:
  Title: Free Online Calculators & Utility Tools | ToolsHub
  Description: Free online calculators for loans, interest, salary, tips, discounts & more. Instant results, no sign-up required. Fast and accurate tools for everyday decisions.

RankMath → Titles & Meta → Pages:
  Title: %title% | ToolsHub
  Description: (leave blank — set per page via RankMath sidebar in editor)
  ✅ Noindex: OFF (show all pages in search)

RankMath → Titles & Meta → Posts:
  Title: %title% | ToolsHub Blog
  ✅ Show Thumbnail in Search Results: ON

RankMath → Titles & Meta → Authors:
  ✅ Noindex Author Archives: ON (single-author site — avoid duplicate content)

RankMath → Titles & Meta → Tags:
  ✅ Noindex Tag Archives: ON

RankMath → Titles & Meta → Date Archives:
  ✅ Noindex Date Archives: ON
```

---

## Sitemap Settings

```
RankMath → Sitemap → General:
  ✅ Links Per Sitemap: 200
  ✅ Include Images: OFF (tools site — no significant image content)
  ✅ Ping Search Engines: ON

RankMath → Sitemap → Pages:
  ✅ Include Pages: ON
  ✅ Exclude: Privacy Policy, Disclaimer (optional — or set low priority)

RankMath → Sitemap → Posts:
  ✅ Include Posts: ON (when blog is active)
```

Submit sitemap to Google: 
- Google Search Console → Sitemaps → Enter: sitemap_index.xml → Submit

---

## Per-Page RankMath Settings (for each tool page)

In the WordPress page editor, find the **RankMath sidebar panel** and set:

### Example — Loan Payment Calculator page:
```
Focus Keyword: loan payment calculator
Title: Loan Payment Calculator — Free Monthly Payment Tool | ToolsHub
Meta Description: Use our free loan payment calculator to find your exact monthly payment. Enter loan amount, interest rate, and term for instant results.

Advanced tab:
  → Canonical URL: (leave blank = auto)
  → Robots: Index, Follow (default)
  → Schema: SoftwareApplication (or leave as default — functions.php handles it)
```

Apply the same pattern to all 10 tool pages with their respective keywords.

---

## Schema Builder (Free Tier)

RankMath Free includes these schema types:
- Article ✅
- FAQ Page ✅ (use this for FAQ sections on each tool)
- HowTo ✅
- Local Business ✅

To add FAQ schema to a tool page:
1. Edit the page in WordPress
2. RankMath sidebar → Schema tab → Add Schema → FAQPage
3. Add each Q&A pair manually

**Recommended**: Add 3–5 FAQ schema items per tool page to target "People Also Ask" results.

---

## Google Search Console Integration

```
RankMath → General Settings → Webmaster Tools:
  → Google Search Console: Paste verification HTML tag
  
After verification:
  → Submit sitemap: yoursite.com/sitemap_index.xml
  → Enable Index Status report
  → Monitor Core Web Vitals report weekly for first month
```
