# 🧮 ToolsHub — WordPress Utility Tools + Calculators Site

A production-ready WordPress setup optimized for **SEO**, **Google AdSense**, and **PageSpeed 90+**.

---

## 📁 Project Structure

```
tools-site/
├── README.md                          ← This file
├── SETUP-INSTRUCTIONS.md              ← Full WordPress setup guide
├── PERFORMANCE-CHECKLIST.md           ← PageSpeed optimization checklist
├── SEO-STRUCTURE.md                   ← SEO architecture documentation
│
├── theme/                             ← Astra Child Theme files
│   ├── style.css
│   ├── functions.php
│   └── assets/
│       ├── css/
│       │   └── tools.css              ← Calculator UI styles
│       └── js/
│           └── calculators.js         ← All 10 calculator logic files
│
├── plugins/
│   ├── rankmath-config.md             ← RankMath SEO configuration guide
│   ├── litespeed-config.md            ← LiteSpeed Cache settings
│   └── wordfence-config.md            ← Wordfence security settings
│
├── pages/                             ← WordPress page content (copy-paste into WP editor)
│   ├── home.html                      ← Home page content
│   ├── about.html                     ← About page content
│   ├── contact.html                   ← Contact page content
│   ├── privacy-policy.html            ← Privacy Policy content
│   └── disclaimer.html               ← Disclaimer content
│
├── tools/                             ← Individual tool pages
│   ├── loan-payment-calculator.html
│   ├── credit-card-interest-calculator.html
│   ├── compound-interest-calculator.html
│   ├── salary-to-hourly-converter.html
│   ├── tip-calculator.html
│   ├── percentage-calculator.html
│   ├── discount-calculator.html
│   ├── fuel-cost-calculator.html
│   ├── date-difference-calculator.html
│   └── unit-converter.html
│
├── schema/                            ← JSON-LD schema templates
│   ├── softwareapplication-schema.json
│   └── faq-schema.json
│
└── ads/
    └── adsense-slots.html             ← AdSense ad slot templates
```

---

## ✅ Herramientas Completadas

Las siguientes herramientas en `tools/` están listas para usar:

- **Loan** — Calculadora de préstamos (loan-payment-calculator.html)
- **Mortgage** — Calculadora de hipotecas (disponible en Finance Suite Pro plugin)
- **Fuel** — Calculadora de costo de combustible (fuel-cost-calculator.html)
- **Compound** — Calculadora de interés compuesto (compound-interest-calculator.html)
- **Salary** — Conversor de salario a hora (salary-to-hourly-converter.html)
- **Credit Card** — Calculadora de interés de tarjeta de crédito (credit-card-interest-calculator.html)
- **Tip** — Calculadora de propinas (tip-calculator.html)
- **Percentage** — Calculadora de porcentajes (percentage-calculator.html)
- **Discount** — Calculadora de descuentos (discount-calculator.html)


### 🚧 Herramientas Pendientes

- **Unit** — Conversor de unidades (unit-converter.html)

---

## 🚀 Quick Start

1. Install WordPress on your host
2. Install **Astra** theme (free version)
3. Follow `SETUP-INSTRUCTIONS.md` step-by-step
4. Copy page content from `pages/` into WordPress editor
5. Copy tool content from `tools/` into WordPress pages
6. Add calculator scripts via `theme/assets/js/calculators.js`
7. Configure plugins per guides in `plugins/`
8. Verify PageSpeed with `PERFORMANCE-CHECKLIST.md`

---

## 🔑 Key Decisions

| Requirement | Solution |
|---|---|
| Theme | Astra (free) — lightest WordPress theme |
| SEO | RankMath Free — best free SEO plugin |
| Cache | LiteSpeed Cache (free) — full-page + object cache |
| Security | Wordfence Free |
| Calculators | Vanilla JS — zero framework overhead |
| Ads | Lazy-loaded AdSense — no render blocking |
| Page Builder | **NONE** — native WordPress block editor only |

---

## 📊 Expected Performance

- **PageSpeed Mobile**: 90–95
- **PageSpeed Desktop**: 95–99
- **TTFB**: < 200ms (with LiteSpeed)
- **LCP**: < 2.5s
- **CLS**: < 0.1
