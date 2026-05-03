# Finance Suite Pro — Installation & Usage Guide

---

## 1. Zip the Plugin

### Windows (PowerShell)
```powershell
# Run from the parent folder that CONTAINS finance-suite-pro/
Compress-Archive -Path ".\finance-suite-pro" -DestinationPath ".\finance-suite-pro.zip"
```

### Mac / Linux
```bash
# Run from the parent folder that CONTAINS finance-suite-pro/
zip -r finance-suite-pro.zip finance-suite-pro/
```

> **Result:** `finance-suite-pro.zip` — ready to upload to WordPress.

---

## 2. Install in WordPress

1. Log in to **WordPress Admin → Plugins → Add New**.
2. Click **Upload Plugin**.
3. Choose `finance-suite-pro.zip` and click **Install Now**.
4. Click **Activate Plugin**.

---

## 3. Use the Shortcode

Add the shortcode to any page or post:

```
[loan_calculator]
```

### Pre-fill inputs via shortcode attributes:
```
[loan_calculator amount="250000" rate="6.5" years="30" extra="200"]
```

### Pre-fill inputs via URL parameters (great for SEO / affiliate links):
```
https://yoursite.com/loan-calculator/?fsp_amount=250000&fsp_rate=6.5&fsp_years=30
```
> URL parameters take priority over shortcode attributes.
> When all three required fields (amount, rate, years) are pre-filled,
> the calculator auto-runs on page load.

---

## 4. Adding Future Tools

Each new tool follows the same three-step pattern:

1. **JS file** → `assets/js/<tool>-calculator.js`
2. **Template** → `templates/<tool>-calculator.php`
3. **Shortcode** → register in `includes/class-shortcodes.php`
4. **Enqueue** → add a new `case` in `includes/class-enqueue.php`

The shared `finance-engine.js` is already loaded as a dependency —
just call `FSP_Engine.calculateMortgage(...)` etc. once implemented.

---

## 5. Monetization Hooks

The template includes two ad slot `<div>` containers:

| Class                    | Location                         |
|--------------------------|----------------------------------|
| `.fsp-ad-between-results`| Between results cards and CTA    |
| `.fsp-ad-bottom`         | Below the amortization section   |

Insert AdSense, Media.net, or affiliate banner HTML directly inside those divs,
or use a WordPress action hook in your theme if you prefer PHP-side injection.

---

## 6. Overriding Colours (CSS Custom Properties)

Add to your theme's `style.css` or Customizer CSS:

```css
:root {
    --fsp-color-primary:      #7c3aed; /* purple brand */
    --fsp-color-accent:       #d97706; /* amber CTA    */
}
```

No plugin file edits needed.
