# Guia Completa: Publicar el Sitio en Hostinger

## PASO 1 — Comprar Plan en Hostinger

1. Ve a **hostinger.com** → elige plan **Business Web Hosting** (tiene LiteSpeed + suficiente para AdSense)
2. Registra un dominio o conecta uno que ya tengas
3. Completa el pago → accede al **hPanel** (panel de Hostinger)

---

## PASO 2 — Instalar WordPress

1. En hPanel → **Websites → Add Website**
2. Selecciona **WordPress** → clic en "Select"
3. Llena:
   - **Language**: English (o Español)
   - **Admin email**: tu email
   - **Admin username**: algo distinto a "admin" (seguridad)
   - **Admin password**: contraseña fuerte
   - **Website title**: `Free Online Calculators & Utility Tools | ToolsHub`
4. Clic **Install** → espera 1-2 minutos
5. Anota la URL de tu admin: `https://tudominio.com/wp-admin`

---

## PASO 3 — Configuracion Inicial de WordPress

Entra a `https://tudominio.com/wp-admin` con tu usuario y contrasena.

### Permalinks
**Settings → Permalinks → Post name** → Save Changes

### Zona horaria
**Settings → General → Timezone** → selecciona tu zona

### Deshabilitar comentarios
**Settings → Discussion** → desmarca TODAS las opciones → Save Changes

### PHP 8.1+
En hPanel → **Hosting → Manage → PHP Configuration** → selecciona **PHP 8.1** o superior

---

## PASO 4 — Instalar Tema Astra

1. **Appearance → Themes → Add New** → busca **"Astra"**
2. Install → Activate

### Configurar Astra:
```
Appearance → Customize → Global → Colors
  → Primary color: #1a73e8

Appearance → Customize → Header Builder
  → Deja solo: Logo + Primary Menu
  → Elimina: icono cuenta, icono busqueda

Appearance → Customize → Footer Builder
  → Solo texto copyright (1 columna)
```

### En el dashboard de Astra (widget "Astra"):
- Disable: Schema Markup
- Disable: Comments Styling
- Disable: Old Classic Icons

---

## PASO 5 — Subir el Child Theme

### Opcion A: Via FTP/File Manager (recomendado)

1. En hPanel → **Files → File Manager**
2. Navega a: `public_html/wp-content/themes/`
3. Crea carpeta: `astra-child`
4. Sube los archivos desde tu carpeta `theme/` local:
   - `style.css` → a `themes/astra-child/style.css`
   - `functions.php` → a `themes/astra-child/functions.php`
5. Crea carpeta `themes/astra-child/assets/css/` → sube `theme/assets/css/tools.css`
6. Crea carpeta `themes/astra-child/assets/js/` → sube `theme/assets/js/calculators.js`
7. En WordPress → **Appearance → Themes** → activa **Astra Child**

### Opcion B: Via ZIP

1. Comprime la carpeta `theme/` en un archivo `astra-child.zip`
   - Asegurate que dentro del zip la estructura sea: `astra-child/style.css`, `astra-child/functions.php`, etc.
2. **Appearance → Themes → Add New → Upload Theme** → sube el zip → Activate

---

## PASO 6 — Instalar Plugins

Ve a **Plugins → Add New** e instala estos 3 en orden:

### 6.1 RankMath SEO
- Busca: **"Rank Math SEO"** → Install → Activate
- Corre el setup wizard:
  - Site Type: **Blog/Website**
  - SEO Mode: **Advanced**
  - Activa: Schema, Sitemap, Breadcrumbs, 404 Monitor
- Configuracion clave:
  ```
  RankMath → Titles & Meta → Home Page
    Title: Free Online Calculators & Utility Tools | ToolsHub
    Description: Free online calculators for loans, interest, salary, tips & more. Fast, accurate, no signup required.

  RankMath → Sitemap → Enable XML Sitemap: ON
  ```

### 6.2 LiteSpeed Cache
- Busca: **"LiteSpeed Cache"** → Install → Activate
- Configuracion clave:
  ```
  LiteSpeed Cache → Cache:
    Cache: ON
    Cache Logged-in Users: OFF
    Browser Cache: ON

  LiteSpeed Cache → Optimize:
    CSS Minify: ON
    CSS Combine: ON
    JS Minify: ON
    JS Combine: OFF  (puede romper calculadoras)
    JS Defer: ON
    Image Lazy Load: ON

  LiteSpeed Cache → Page Optimization → Media:
    Lazy Load Images: ON
    Generate WebP: ON
  ```

### 6.3 Wordfence Security
- Busca: **"Wordfence Security"** → Install → Activate → Get free license
- Configuracion clave:
  ```
  Wordfence → Firewall:
    Web Application Firewall: Enabled
    Modo: Learning Mode (7 dias) → luego Protection Mode
    Brute Force Protection: ON

  Wordfence → Login Security:
    Two-Factor Authentication: ON para el admin
  ```

---

## PASO 7 — Crear las Paginas

Ve a **Pages → Add New** y crea cada pagina. Para el contenido, copia el HTML de la carpeta `pages/` usando el editor en modo **HTML/Code Editor**.

| Pagina | Slug | Archivo fuente |
|---|---|---|
| Home | `/` | `pages/home.html` |
| About | `/about/` | `pages/about.html` |
| Contact | `/contact/` | `pages/contact.html` |
| Privacy Policy | `/privacy-policy/` | `pages/privacy-policy.html` |
| Disclaimer | `/disclaimer/` | `pages/disclaimer.html` |

> En el editor de WordPress, cambia a modo **"Code editor"** (esquina superior derecha → kebab menu → Code editor) y pega el HTML directamente.

---

## PASO 8 — Crear las Paginas de Herramientas (Tools)

Igual que el Paso 7 pero con los archivos de `tools/`:

| Herramienta | Slug | Archivo fuente |
|---|---|---|
| Loan Payment Calculator | `/loan-payment-calculator/` | `tools/loan-payment-calculator.html` |
| Credit Card Interest Calculator | `/credit-card-interest-calculator/` | `tools/credit-card-interest-calculator.html` |
| Compound Interest Calculator | `/compound-interest-calculator/` | `tools/compound-interest-calculator.html` |
| Salary to Hourly Converter | `/salary-to-hourly-converter/` | `tools/salary-converter.html` |
| Tip Calculator | `/tip-calculator/` | `tools/tip-calculator.html` |
| Percentage Calculator | `/percentage-calculator/` | `tools/percentage-calculator.html` |
| Discount Calculator | `/discount-calculator/` | `tools/discount-calculator.html` |
| Fuel Cost Calculator | `/fuel-cost-calculator/` | `tools/fuel-cost-calculator.html` |
| Date Difference Calculator | `/date-difference-calculator/` | `tools/date-difference-calculator.html` |
| Unit Converter | `/unit-converter/` | `tools/unit-converter.html` |

---

## PASO 9 — Configurar Homepage

1. **Settings → Reading**
2. Selecciona: **A static page**
3. Homepage: **Home**
4. Posts page: **Blog** (crea esta pagina vacia primero si no existe)
5. Save Changes

---

## PASO 10 — Menu de Navegacion

1. **Appearance → Menus → Create a new menu** → nombre: `Primary`
2. Agrega las paginas en este orden:
   ```
   Home
   Tools (link personalizado: # ) ← dropdown padre
     ├── Loan Payment Calculator
     ├── Credit Card Interest Calculator
     ├── Compound Interest Calculator
     ├── Salary to Hourly Converter
     ├── Tip Calculator
     ├── Percentage Calculator
     ├── Discount Calculator
     ├── Fuel Cost Calculator
     ├── Date Difference Calculator
     └── Unit Converter
   Blog
   About
   ```
3. Menu Location: **Primary Menu** → Save Menu

4. Crea otro menu `Footer`:
   - Privacy Policy, Disclaimer, Contact
   - Location: **Footer Menu**

---

## PASO 11 — SSL (HTTPS)

En Hostinger esto es automatico. Verifica:

1. hPanel → **SSL → Manage**
2. Debe decir **Active** con icono verde
3. En WordPress → **Settings → General**:
   - WordPress Address: `https://tudominio.com`
   - Site Address: `https://tudominio.com`
4. Instala plugin **"Really Simple SSL"** si hay problemas de redireccion

---

## PASO 12 — Google Search Console

1. Ve a **search.google.com/search-console**
2. Add property → URL prefix → `https://tudominio.com`
3. Copia el meta tag de verificacion HTML
4. En WordPress → **RankMath → General Settings → Webmaster Tools → Google Search Console** → pega el tag
5. Vuelve a GSC → Verify
6. Submit sitemap: `https://tudominio.com/sitemap_index.xml`

---

## PASO 13 — Google AdSense

1. Ve a **ads.google.com** → Sign up
2. Agrega tu sitio URL
3. Copia el codigo de verificacion (script `<head>`)
4. En WordPress → **RankMath → General Settings → Header/Footer Scripts → Header** → pega el script
5. Espera aprobacion (1-14 dias)
6. Una vez aprobado: crea ad units → copia los codigos → pegalos en las posiciones de `ads/adsense-slots.html`

---

## PASO 14 — Cloudflare (Opcional pero recomendado)

1. Ve a **cloudflare.com** → crea cuenta gratis
2. Add site → ingresa tu dominio
3. Copia los nameservers de Cloudflare
4. En Hostinger → **Domains → DNS/Nameservers** → reemplaza con los de Cloudflare
5. En Cloudflare:
   ```
   SSL/TLS: Full (strict)
   Speed → Rocket Loader: OFF  (rompe las calculadoras)
   Speed → Auto Minify: CSS, JS (si LiteSpeed no lo hace)
   Caching → Browser Cache TTL: 4 hours
   ```

---

## CHECKLIST FINAL

- [ ] WordPress instalado y accesible en `https://tudominio.com/wp-admin`
- [ ] PHP 8.1+ configurado en hPanel
- [ ] Astra theme activo
- [ ] Child theme activo con `tools.css` y `calculators.js`
- [ ] RankMath instalado y configurado
- [ ] LiteSpeed Cache instalado y configurado
- [ ] Wordfence instalado y configurado
- [ ] Todas las paginas creadas (5 paginas + 10 herramientas)
- [ ] Homepage configurada como estatica
- [ ] Menu primario y footer configurados
- [ ] SSL activo (HTTPS)
- [ ] Sitemap enviado a Google Search Console
- [ ] Cada calculadora probada y funcionando
- [ ] PageSpeed Insights: 90+ en mobile
- [ ] AdSense solicitado
