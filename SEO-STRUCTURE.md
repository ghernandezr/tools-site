# 🧠 SEO Architecture — QuickCalc Lab

## Site-Wide SEO Strategy

**Site type**: YMYL-adjacent (finance tools) — requires high E-E-A-T signals
**Primary approach**: Keyword-per-page, long-tail FAQ targeting, schema markup
**Content model**: Tool page = calculator + formula explainer + FAQ (all on one page)

---

## Page-Level SEO Map

| Page | Primary Keyword | Title Tag | Meta Description |
|------|----------------|-----------|-----------------|
| Home | free online calculators | Free Online Calculators & Utility Tools \| QuickCalc Lab | Free online calculators for loans, interest, salary, tips & more. Instant results, no sign-up. |
| About | about quickcalc lab calculators | About QuickCalc Lab — Free Online Calculators & Tools | Learn about QuickCalc Lab: our purpose, methodology, and commitment to accuracy for free online calculator tools. |
| Contact | contact quickcalc lab | Contact QuickCalc Lab — Get in Touch | Questions, bug reports, or tool suggestions? Contact the QuickCalc Lab team. We respond within 48 hours. |
| Privacy Policy | privacy policy quickcalc lab | Privacy Policy \| QuickCalc Lab | Read QuickCalc Lab's privacy policy covering data collection, Google AdSense, Analytics, and your rights. |
| Disclaimer | disclaimer quickcalc lab | Disclaimer — Financial & Tools Disclaimer \| QuickCalc Lab | Important disclaimer for QuickCalc Lab calculator tools. Results are educational estimates, not financial advice. |

---

## Tool Page SEO Map

| Tool Page | Primary Keyword | Search Volume Est. | Difficulty |
|-----------|----------------|-------------------|------------|
| /loan-payment-calculator/ | loan payment calculator | 40,000+/mo | Medium |
| /credit-card-interest-calculator/ | credit card interest calculator | 10,000+/mo | Medium |
| /compound-interest-calculator/ | compound interest calculator | 30,000+/mo | Medium-High |
| /salary-to-hourly-converter/ | salary to hourly converter | 25,000+/mo | Medium |
| /tip-calculator/ | tip calculator | 50,000+/mo | High |
| /percentage-calculator/ | percentage calculator | 60,000+/mo | High |
| /discount-calculator/ | discount calculator | 20,000+/mo | Medium |
| /fuel-cost-calculator/ | fuel cost calculator | 8,000+/mo | Low-Medium |
| /date-difference-calculator/ | date difference calculator | 15,000+/mo | Low |
| /unit-converter/ | unit converter | 80,000+/mo | High |

---

## On-Page SEO Rules (Apply to Every Page)

### Title Tag Format:
```
[Primary Keyword] — [Benefit/Use Case] | QuickCalc Lab
```

### Meta Description Format (150–160 chars):
```
[Action verb] + [primary keyword] + [key benefit] + [CTA/differentiator].
Example: "Calculate your monthly loan payment instantly. Enter amount, rate & term — free loan payment calculator, no sign-up required."
```

### H1 Rules:
- Must contain primary keyword
- One H1 per page only
- Written naturally (not keyword-stuffed)
- Format: `[Keyword] — [Clarifying Subtitle]`

### H2/H3 Structure per Tool Page:
```
H1: [Tool Name] — [Subtitle with keyword]
H2: [Tool Name] (calculator widget heading)
H2: How [Tool] Works / How [Keyword] Is Calculated
H2: [Input/Formula] Explained
H2: Related Tools
H2: Frequently Asked Questions
```

### Keyword Placement Checklist:
- [ ] Primary keyword in H1
- [ ] Primary keyword in first 100 words of body text
- [ ] Primary keyword in meta description
- [ ] Primary keyword in URL slug
- [ ] LSI / related keywords naturally in body (not forced)
- [ ] Primary keyword in at least one H2

---

## Internal Linking Architecture

### Hub-and-Spoke Model:
- **Home** links to all 10 tools (hub)
- Each tool links to 3 related tools (spokes)
- No orphan pages

### Recommended Internal Link Clusters:

**Finance Cluster:**
```
Loan Payment Calculator
  → Compound Interest Calculator
  → Credit Card Interest Calculator
  → Percentage Calculator

Credit Card Interest Calculator
  → Loan Payment Calculator
  → Compound Interest Calculator
```

**Income/Salary Cluster:**
```
Salary to Hourly Converter
  → Loan Payment Calculator (what can you afford?)
  → Percentage Calculator (calculate raise %)
  → Discount Calculator
```

**Everyday Math Cluster:**
```
Percentage Calculator
  → Discount Calculator
  → Tip Calculator
  → Salary to Hourly Converter

Tip Calculator
  → Percentage Calculator
  → Discount Calculator
  → Unit Converter

Discount Calculator
  → Percentage Calculator
  → Tip Calculator
```

**Travel/Practical Cluster:**
```
Fuel Cost Calculator
  → Unit Converter (km ↔ miles)
  → Date Difference Calculator
  → Percentage Calculator

Unit Converter
  → Fuel Cost Calculator
  → Tip Calculator (international travel)
  → Date Difference Calculator
```

---

## Schema Markup Strategy

### SoftwareApplication Schema (all 10 tool pages):
- Applied automatically via `quickcalclab_tool_schema()` in functions.php
- Key fields: name, url, applicationCategory, operatingSystem, offers (price: 0)

### FAQPage Schema (all tool pages):
- Add via **RankMath → Schema → Add Schema → FAQ** (easiest method)
- Or add JSON-LD blocks from `schema/faq-schema.json` via Custom HTML block
- Targets featured snippets and "People Also Ask" boxes in Google

### WebSite Schema (homepage):
- RankMath automatically generates this — verify in RankMath → Titles & Meta → Home

### BreadcrumbList Schema:
- RankMath generates automatically when breadcrumbs are enabled
- Enable: RankMath → General Settings → Breadcrumbs → Enable: YES

---

## Content Freshness Strategy

Google favors updated content for YMYL topics:

1. **Update interest rate examples** quarterly (loan, credit card pages)
2. **Update average MPG data** annually (fuel calculator page)
3. **Update gas price examples** monthly or as prices change significantly
4. **Add new FAQs** based on Google Search Console query reports
5. **Add new tools** based on search demand (GSC shows queries that bring traffic)

---

## E-E-A-T (Experience, Expertise, Authority, Trust) Signals

Critical for YMYL-adjacent content:

### Trust Signals to Implement:
- [ ] **About page** — transparent, explains methodology + AI disclosure ✅ (written)
- [ ] **Disclaimer page** — clear financial/tool limitations ✅ (written)
- [ ] **Privacy Policy** — GDPR/CCPA compliant ✅ (written)
- [ ] **Contact page** — real contact method available ✅ (written)
- [ ] **Visible formula** — show exact formula on every calculator page ✅ (implemented)
- [ ] **No misleading results** — calculators warn on invalid inputs ✅ (JS error handling)
- [ ] **SSL certificate** — https:// required
- [ ] **Author attribution** — add "Reviewed by [Name]" credit if possible
- [ ] **Date stamps** — show "Last updated" on tool pages (helps freshness signals)

### Authority Building (Post-Launch):
- Submit to free directory listings: Google Business Profile (if applicable), Bing Places
- Target editorial links from personal finance blogs (guest posts, tool citations)
- Build topical authority by adding 5–10 SEO articles to the Blog section over 3–6 months

---

## Keyword Expansion (Future Blog Posts)

Target long-tail keywords with informational intent to build topical authority:

| Article Title | Target Keyword | Links to Tool |
|--------------|---------------|---------------|
| "How to Pay Off a $10,000 Loan in 2 Years" | pay off loan early | Loan Calculator |
| "What Is a Good Credit Card APR in 2025?" | good credit card APR | CC Interest Calculator |
| "How Compound Interest Works (With Examples)" | how compound interest works | Compound Interest |
| "Is $20/Hour a Good Salary? Full Breakdown" | is 20 an hour good salary | Salary Converter |
| "20% Tip on Any Bill: Quick Reference Chart" | 20 percent tip | Tip Calculator |
| "How to Calculate Percentage Discount" | how to calculate discount percentage | Discount + Percentage |
| "Average MPG by Car in 2025" | average mpg by car | Fuel Cost Calculator |
| "How Many Days Until [Event]?" | days until calculator | Date Difference |
| "Kilometers to Miles Conversion Chart" | km to miles conversion | Unit Converter |

---

## XML Sitemap Priority Settings (RankMath)

```
Homepage: 1.0 / daily
Tool pages: 0.9 / weekly
Core pages (About, Contact, etc.): 0.7 / monthly
Blog posts: 0.8 / weekly
Privacy/Disclaimer: 0.3 / monthly (low priority — still include for crawlability)
```

---

## robots.txt Recommended Content

```
User-agent: *
Allow: /

Disallow: /wp-admin/
Disallow: /wp-includes/
Disallow: /?s=
Disallow: /search/
Disallow: /tag/
Disallow: /author/
Disallow: /page/

Sitemap: https://yoursite.com/sitemap_index.xml
```

Set this via: **RankMath → General Settings → Edit robots.txt**
