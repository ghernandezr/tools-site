# Wordfence Security — Configuration Guide

## Installation
1. Plugins → Add New → Search "Wordfence Security" → Install → Activate
2. Follow the activation wizard — get a free license (email required)
3. Free license provides: Firewall, Scanner, Login Security, Blocking

---

## Firewall Settings

```
Wordfence → Firewall → Manage WAF:
  ✅ Web Application Firewall: Enabled
  → Mode: Learning Mode for first 7 days → then switch to Protection Mode
  
  After 7 days:
  → Change to: Enabled and Protecting
  → Firewall Optimization: Extended Protection (requires .htaccess modification — Wordfence guides you)

Wordfence → Firewall → Brute Force Protection:
  ✅ Enable brute force protection: ON
  → Lock out after: 5 failed login attempts
  → Lock out after: 3 forgotten password attempts
  → Count failures over: 4 hours
  → Lock out for: 4 hours

Wordfence → Firewall → Rate Limiting:
  ✅ Enable rate limiting: ON
  → If anyone's requests exceed: 240 per minute → Throttle
  → If a crawler's page views exceed: 120 per minute → Throttle
  → If Google crawls faster than: 120 pages per minute → Throttle (low limit — bots waste server resources)
  ✅ Block fake Googlebots: ON
```

---

## Scan Settings

```
Wordfence → Scan → Scan Options:
  ✅ Enable scheduled scans: ON
  → Scan frequency: Weekly (monthly is fine for a static tools site)
  → Scan Type: Standard (free tier — covers all critical checks)

What the scan checks:
  - Core WordPress file integrity
  - Plugin/theme file integrity  
  - Known malware signatures
  - Publicly accessible configuration files
  - Weak passwords
  - Out-of-date plugins/themes
```

---

## Login Security

```
Wordfence → Login Security:
  ✅ Enable Two-Factor Authentication: ON for administrator accounts
  → Set up via authenticator app (Google Authenticator, Authy)
  
  ✅ Enable reCAPTCHA on login: ON (prevents bot login attempts)
  → reCAPTCHA v3 requires Google API keys (free at: google.com/recaptcha/admin)
  → Enter Site Key and Secret Key in Wordfence → Login Security → Settings

  ✅ Allow remembering device: ON (30 days) — reduces 2FA friction for you
```

---

## Blocking Settings

```
Wordfence → Blocking:
  → IP Blocklist: Automatically managed based on attack data
  ✅ Block IPs from: Wordfence Central threat network (free tier shares data)

  Country Blocking (free tier has limited capability):
  → Only use if you're seeing significant traffic from countries you don't target
  → Caution: can accidentally block legitimate users via VPN
```

---

## Tools & Diagnostics

```
Wordfence → Tools → Diagnostics:
  → Run diagnostics to verify: PHP version, WP version, memory limits, disk space
  → Review any warnings and resolve them

Wordfence → Tools → Import/Export:
  → Export config after setup — save as backup
```

---

## Performance Impact Notes

Wordfence uses ~2–10MB of memory per request for firewall checks. This is acceptable but monitor with:
- Query Monitor plugin (free) — temporarily activate to check memory/query counts
- Target: page memory use under 64MB

If Wordfence causes performance issues on a shared host:
1. Disable real-time IP reputation checks (Wordfence → All Options → General Wordfence Options)
2. Use Wordfence in "basic" mode (not Extended Protection)

---

## Security Hardening (Beyond Wordfence)

Add to `wp-config.php`:
```php
// Disable file editing via dashboard
define('DISALLOW_FILE_EDIT', true);

// Force SSL for admin
define('FORCE_SSL_ADMIN', true);

// Limit post revisions (reduces DB bloat)
define('WP_POST_REVISIONS', 3);

// Disable auto-updates for major versions (control updates manually)
define('WP_AUTO_UPDATE_CORE', 'minor');
```

Add to `.htaccess` (above WordPress rules):
```apache
# Block XML-RPC (if not needed)
<Files xmlrpc.php>
  Order Deny,Allow
  Deny from all
</Files>

# Protect wp-config.php
<Files wp-config.php>
  Order Allow,Deny
  Deny from all
</Files>

# Block directory browsing
Options -Indexes
```

---

## Monthly Security Maintenance

- [ ] Review Wordfence scan results
- [ ] Update WordPress core, plugins, and theme
- [ ] Review any new blocked IPs (Wordfence → Blocking → IP Addresses)
- [ ] Check 404 Monitor in RankMath for suspicious URL probing patterns
- [ ] Verify SSL certificate is valid (auto-renewed via Let's Encrypt on most hosts)
