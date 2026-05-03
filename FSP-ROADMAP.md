# Finance Suite Pro — Implementation Roadmap

> Estado actual: v1.0.0 — loan calculator con amortización, extra payments, shortcode attributes, URL param pre-fill.

---

## Principios de arquitectura

Estos principios rigen **todas** las decisiones de implementación en este documento. Cualquier decisión que los contradiga es incorrecta.

### JS — Separación de módulos

`loan-calculator.js` actualmente tiene 355 líneas y una sola responsabilidad bien definida (UI controller del loan calculator). Ese límite debe mantenerse. La regla es:

- **Un archivo JS por tool** (UI controller): `loan-calculator.js`, `mortgage-calculator.js`. Cada uno es un IIFE autónomo.
- **Un archivo JS compartido para lógica pura**: `finance-engine.js`. Solo cálculos, sin DOM. Crece con nuevas funciones de cálculo pero no con lógica de UI.
- **Módulos de UI auxiliares como IIFEs separados cuando un controller supera ~400 líneas** o cuando la funcionalidad es claramente separable (ej: comparison tiene su propio ciclo de vida de inputs + tabla → su propio archivo).
- **Sin shared mutable state entre archivos** — cada IIFE gestiona su propio estado interno. La comunicación entre módulos JS, si se necesita, se hace a través de eventos del DOM (`CustomEvent`), no variables globales.

### PHP — Single Responsibility en clases

- `FSP_Shortcodes`: solo registrar shortcodes y pasar datos al template. Sin lógica de negocio.
- `FSP_Enqueue`: solo gestionar qué assets cargar. Sin condicionales de lógica de negocio.
- `FSP_Init`: solo bootstrap (instanciar y conectar clases). Sin lógica.
- Al añadir una nueva tool: añadir un método en `FSP_Shortcodes`, un case en `FSP_Enqueue`, un template nuevo. No mezclar lógicas de tools distintas en el mismo método.

### Template PHP — Sin lógica de presentación compleja

Los templates deben ser HTML con escaping mínimo. Toda decisión de qué mostrar/ocultar que dependa de **interacción del usuario** va en JS. Las decisiones que dependen de **configuración del shortcode** (valores en el servidor) van en PHP dentro del template, pero limitadas a condicionales simples (`if empty`).

### Estado JS — Objeto de estado explícito

Cada controller JS define un objeto `state` explícito al inicio del IIFE. Todo cambio de estado pasa por ese objeto. No se usan variables sueltas para estado a menos que sean constantes de ciclo de vida (ej: referencias cacheadas a elementos DOM, que son inmutables tras `cacheElements()`).

```js
// Correcto
const state = {
  schedule: [],
  view: 'monthly',   // 'monthly' | 'annual'
  mode: 'standard',  // 'standard' | 'reverse'
  lastResult: null,
};

// Incorrecto — variables de estado sueltas
let currentSchedule = [];
let currentView = 'monthly';
let currentMode = 'standard';
```

> **Nota de deuda técnica:** `loan-calculator.js` v1.0 usa variables sueltas (`currentSchedule`, `currentView`). Al implementar Feature 2 o 3, que añaden más estado, se debe refactorizar a objeto `state` primero, como primer paso antes de añadir funcionalidad nueva.

### Seguridad

- PHP: `esc_attr()` para atributos HTML, `esc_url()` para URLs, `sanitize_text_field()` para strings, `is_numeric()` para valores numéricos. Nunca imprimir raw input.
- JS: nunca usar `innerHTML` con datos que vengan directamente del usuario. Los valores de inputs se usan solo como números parseados (`parseFloat`). Las cadenas que se insertan en el DOM se insertan como `textContent`, no `innerHTML`.
- Links con `target="_blank"` **siempre** llevan `rel="noopener noreferrer"` — sin excepción. Es una vulnerabilidad de seguridad conocida (tabnapping).

### Accesibilidad (a11y)

- Todo input de formulario tiene `<label>` asociado con `for` apuntando al `id` del input. **Nunca** solo `placeholder` como label.
- Botones de toggle llevan `aria-pressed`. Secciones expandibles llevan `aria-expanded` + `aria-controls`.
- Mensajes de error en `role="alert"` con `aria-live="polite"`.
- Resultados que aparecen dinámicamente: el foco no se mueve automáticamente salvo en móvil (scroll), para no interrumpir el flujo del teclado en desktop.

### Versionado

Al añadir cualquier feature, incrementar `FSP_VERSION` en `finance-suite-pro.php`:
- Patch (bugfix, CTA): `1.0.0` → `1.0.1`
- Feature menor (Reverse, Comparison): `1.0.x` → `1.1.0`
- Feature mayor (Mortgage — nuevo shortcode): `1.1.x` → `1.2.0`

Esto garantiza cache busting automático en WordPress para todos los assets.

---

## Feature 1 — CTA Configurable

**Esfuerzo:** Bajo (~1h) | **Versión objetivo:** 1.0.1

**Archivos a modificar:**
- `includes/class-shortcodes.php`
- `templates/loan-calculator.php`
- `assets/js/loan-calculator.js` (cambio mínimo)
- `finance-suite-pro.php` (version bump)

**Archivos a NO tocar:** `finance-engine.js`, `assets/css/styles.css` (estilos ya completos)

### Problema
`href="#"` hardcodeado. El botón se muestra siempre aunque no haya URL configurada.

### 1.1 — `class-shortcodes.php`

Añadir a `shortcode_atts()`:
```php
'cta_url'    => '',                 // URL del botón. Vacío = CTA oculto.
'cta_text'   => 'Compare Loan Offers',
'cta_target' => '_blank',           // '_blank' | '_self'
```

`cta_url` **no** va en `$url_keys` (no se permite sobrescribir desde URL pública por riesgo de open redirect — solo el administrador del sitio configura el destino vía shortcode attribute).

`cta_text` sí puede ir en `$url_keys` para casos de personalización editorial vía URL.

Sanitización: `cta_url` → `esc_url_raw( $atts['cta_url'] )`. `cta_text` → `sanitize_text_field()`. `cta_target` → validar que sea `'_blank'` o `'_self'`, cualquier otro valor → `'_self'` como fallback seguro.

```php
$allowed_targets = [ '_blank', '_self' ];
$defaults['cta_target'] = in_array( $atts['cta_target'], $allowed_targets, true )
    ? $atts['cta_target']
    : '_self';
```

### 1.2 — `templates/loan-calculator.php`

El template renderiza el CTA condicionalmente. Si `cta_url` está vacío, el nodo se renderiza con `hidden` para que JS pueda referenciarlo sin `getElementById` que falle. Si tiene valor, se renderiza completamente.

```php
<?php $has_cta = ! empty( $defaults['cta_url'] ); ?>
<div class="fsp-cta-container" id="fsp-cta"<?php echo $has_cta ? '' : ' hidden'; ?>>
    <p class="fsp-cta-text">Ready to take the next step?</p>
    <a
        href="<?php echo esc_url( $defaults['cta_url'] ); ?>"
        class="fsp-btn fsp-btn-cta"
        id="fsp-cta-link"
        target="<?php echo esc_attr( $defaults['cta_target'] ); ?>"
        <?php echo $defaults['cta_target'] === '_blank' ? 'rel="noopener noreferrer"' : ''; ?>
    ><?php echo esc_html( $defaults['cta_text'] ); ?></a>
</div>
```

No se usan `data-*` para pasar la URL al JS porque el `href` ya está en el DOM. El JS no necesita conocer la URL — solo decide si mostrar u ocultar el nodo basándose en si `href` tiene valor real.

### 1.3 — `loan-calculator.js`

Añadir `ctaContainer: document.getElementById('fsp-cta')` al objeto `el` en `cacheElements()`.

En `showResults()`, añadir al final:
```js
if ( el.ctaContainer && el.ctaContainer.querySelector('a').getAttribute('href') ) {
    el.ctaContainer.removeAttribute('hidden');
}
```

En `handleReset()`, añadir:
```js
if ( el.ctaContainer ) {
    el.ctaContainer.setAttribute('hidden', '');
}
```

---

## Feature 2 — Loan Comparison (3 escenarios)

**Esfuerzo:** Medio-alto (~5h) | **Versión objetivo:** 1.1.0

**Archivos a modificar:**
- `templates/loan-calculator.php` — sección de comparación
- `assets/css/styles.css` — estilos de comparación
- `finance-suite-pro.php` — version bump

**Archivos nuevos:**
- `assets/js/loan-comparison.js` — IIFE autónomo para la UI de comparación

**Archivos a NO tocar:** `loan-calculator.js`, `finance-engine.js`

**Decisión de arquitectura:** La comparación es una funcionalidad con su propio ciclo de vida (inputs propios, tabla propia, botón propio, estado propio). Va en un IIFE separado `loan-comparison.js`, no en `loan-calculator.js`. Se comunica con el calculator principal usando un `CustomEvent` que `loan-calculator.js` dispara al terminar un cálculo.

### 2.1 — Comunicación entre módulos

`loan-calculator.js` emite un evento cuando termina de calcular:
```js
// Al final de handleCalculate(), tras renderSummary():
document.dispatchEvent( new CustomEvent( 'fsp:loan:calculated', {
    detail: { result: result, inputs: inputs }
} ) );
```

`loan-comparison.js` escucha ese evento:
```js
document.addEventListener( 'fsp:loan:calculated', function( e ) {
    state.baseResult = e.detail.result;
    state.baseInputs = e.detail.inputs;
    showCompareSection();
    renderComparison();
} );
```

Esto elimina cualquier acoplamiento directo entre los dos archivos JS.

### 2.2 — Estado de `loan-comparison.js`

```js
const state = {
    baseResult: null,   // resultado del calculator principal
    baseInputs: null,   // inputs del calculator principal
};
```

### 2.3 — Template `loan-calculator.php`

Añadir después de `.fsp-results`, antes de `.fsp-amortization`. La sección está `hidden` por defecto; `loan-comparison.js` la revela al recibir el evento.

```html
<section class="fsp-compare" id="fsp-compare" aria-label="Scenario comparison" hidden>

    <h3 class="fsp-compare-title">Compare Scenarios</h3>
    <p class="fsp-compare-subtitle">
        Scenario 1 is your current calculation. Edit Scenarios 2 and 3 to compare alternatives.
    </p>

    <div class="fsp-compare-scenarios">

        <!-- Scenario 2 -->
        <fieldset class="fsp-compare-scenario" id="fsp-scenario-2">
            <legend class="fsp-scenario-label">Scenario 2</legend>
            <div class="fsp-compare-fields">
                <div class="fsp-field">
                    <label for="fsp-c2-amount">Amount ($)</label>
                    <input type="number" id="fsp-c2-amount" class="fsp-input fsp-input-sm"
                           min="1" step="100" placeholder="200,000" autocomplete="off">
                </div>
                <div class="fsp-field">
                    <label for="fsp-c2-rate">Rate (%)</label>
                    <input type="number" id="fsp-c2-rate" class="fsp-input fsp-input-sm"
                           min="0.01" max="100" step="0.01" placeholder="6.5" autocomplete="off">
                </div>
                <div class="fsp-field">
                    <label for="fsp-c2-years">Years</label>
                    <input type="number" id="fsp-c2-years" class="fsp-input fsp-input-sm"
                           min="1" max="50" step="1" placeholder="30" autocomplete="off">
                </div>
                <div class="fsp-field">
                    <label for="fsp-c2-extra">Extra ($/mo) <span class="fsp-optional">(opt.)</span></label>
                    <input type="number" id="fsp-c2-extra" class="fsp-input fsp-input-sm"
                           min="0" step="10" placeholder="0" autocomplete="off">
                </div>
            </div>
        </fieldset>

        <!-- Scenario 3 — estructura idéntica, ids fsp-c3-* -->
        <fieldset class="fsp-compare-scenario" id="fsp-scenario-3">
            <legend class="fsp-scenario-label">Scenario 3</legend>
            <div class="fsp-compare-fields">
                <div class="fsp-field">
                    <label for="fsp-c3-amount">Amount ($)</label>
                    <input type="number" id="fsp-c3-amount" class="fsp-input fsp-input-sm"
                           min="1" step="100" placeholder="200,000" autocomplete="off">
                </div>
                <div class="fsp-field">
                    <label for="fsp-c3-rate">Rate (%)</label>
                    <input type="number" id="fsp-c3-rate" class="fsp-input fsp-input-sm"
                           min="0.01" max="100" step="0.01" placeholder="6.5" autocomplete="off">
                </div>
                <div class="fsp-field">
                    <label for="fsp-c3-years">Years</label>
                    <input type="number" id="fsp-c3-years" class="fsp-input fsp-input-sm"
                           min="1" max="50" step="1" placeholder="30" autocomplete="off">
                </div>
                <div class="fsp-field">
                    <label for="fsp-c3-extra">Extra ($/mo) <span class="fsp-optional">(opt.)</span></label>
                    <input type="number" id="fsp-c3-extra" class="fsp-input fsp-input-sm"
                           min="0" step="10" placeholder="0" autocomplete="off">
                </div>
            </div>
        </fieldset>

    </div><!-- .fsp-compare-scenarios -->

    <button type="button" id="fsp-compare-update" class="fsp-btn fsp-btn-ghost">
        Update Comparison
    </button>

    <div class="fsp-table-scroll">
        <table class="fsp-table fsp-compare-table" id="fsp-compare-table" aria-label="Scenario comparison">
            <thead id="fsp-compare-thead"></thead>
            <tbody id="fsp-compare-tbody"></tbody>
        </table>
    </div>

</section>
```

Notas:
- Se usa `<fieldset>` + `<legend>` en lugar de `<div>` + `<span>` — semánticamente correcto para grupos de inputs relacionados.
- Cada input tiene `<label>` con `for` apuntando al `id`. Sin `placeholder` como sustituto de label.

### 2.4 — `loan-comparison.js` — lógica

Estructura del IIFE:

```
state { baseResult, baseInputs }
cacheElements()       → referencias a los inputs c2/c3, tabla, botón, sección
bindEvents()          → botón Update + listener fsp:loan:calculated + Reset listener
readScenarioInputs(n) → lee los 4 inputs del escenario n, fallback al base si vacío
renderComparison()    → calcula escenarios 2 y 3, construye tabla
buildCompareTable(scenarios[]) → DocumentFragment con filas de comparación
showCompareSection()  → removeAttribute('hidden') en la sección
resetComparison()     → state = null, limpiar tabla, setAttribute('hidden')
```

Filas de la tabla comparativa:
| Fila | Descripción |
|---|---|
| Monthly Payment | Valor de cada escenario |
| Total Interest | Valor + delta vs escenario 1 (verde si menor, rojo si mayor) |
| Total Cost | Valor + delta vs escenario 1 |
| Payoff Time | Valor formateado |
| Interest Saved | Solo escenarios 2 y 3. N/A para escenario 1. |

La columna con menor `totalCost` recibe clase `fsp-col-best` en el `<th>` del header y en todas sus `<td>`. Esto se implementa con `colgroup` o con clases en cada celda de la columna — preferir clases en celda por simplicidad.

Fallback cuando escenario 2 o 3 está vacío: calcular con los mismos valores del escenario 1 y mostrar "—" en la columna (sin resaltar como "mejor").

### 2.5 — Enqueue de `loan-comparison.js`

En `class-enqueue.php`, dentro del case `'loan'`, añadir después del script existente:
```php
wp_enqueue_script(
    'fsp-loan-comparison',
    FSP_PLUGIN_URL . 'assets/js/loan-comparison.js',
    [ 'fsp-finance-engine', 'fsp-loan-calculator' ],  // depende de ambos
    FSP_VERSION,
    true
);
```

### 2.6 — CSS

```css
/* ─── Loan Comparison ───────────────────────────────────────────────── */
.fsp-compare { margin-top: 1.75rem; }

.fsp-compare-title { font-size: 1.125rem; font-weight: 700; margin: 0 0 0.25rem; }
.fsp-compare-subtitle { font-size: 0.875rem; color: var(--fsp-color-text-muted); margin: 0 0 1.25rem; }

.fsp-compare-scenarios {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
}

@media ( max-width: 560px ) {
    .fsp-compare-scenarios { grid-template-columns: 1fr; }
}

.fsp-compare-scenario {
    border: 1px solid var(--fsp-color-border);
    border-radius: var(--fsp-radius);
    padding: 0.875rem 1rem;
    margin: 0;
}

.fsp-scenario-label {  /* <legend> */
    font-size: 0.8125rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fsp-color-text-muted);
    padding: 0 0.25rem;
}

.fsp-compare-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.625rem;
    margin-top: 0.75rem;
}

.fsp-input-sm {
    padding: 0.375rem 0.625rem;
    font-size: 0.875rem;
}

/* Tabla comparativa */
.fsp-compare-table th,
.fsp-compare-table td { text-align: right; }
.fsp-compare-table th:first-child,
.fsp-compare-table td:first-child { text-align: left; font-weight: 600; }

.fsp-col-best { background: var(--fsp-color-row-final); }
.fsp-col-best th { background: var(--fsp-color-accent); color: #fff; }

.fsp-delta-better { color: var(--fsp-color-accent); font-weight: 600; }
.fsp-delta-worse  { color: var(--fsp-color-danger);  font-weight: 600; }

#fsp-compare-update { margin: 0.875rem 0; }
```

---

## Feature 3 — Reverse Loan Calculator

**Esfuerzo:** Medio (~3h) | **Versión objetivo:** 1.1.0 (junto con Feature 2 o en patch separado)

**Archivos a modificar:**
- `finance-engine.js` — nueva función pura `calculateReverseLoan()`
- `loan-calculator.js` — refactor de estado + modo reverse
- `templates/loan-calculator.php` — toggle de modo + inputs de reverse
- `assets/css/styles.css` — toggle de modo
- `finance-suite-pro.php` — version bump

**Archivos a NO tocar:** `loan-comparison.js`, templates de mortgage

### 3.1 — Refactor de estado en `loan-calculator.js` (prerequisito)

Antes de añadir el modo reverse, consolidar las variables de estado sueltas en un objeto explícito. Este refactor no cambia comportamiento — solo organiza el estado existente:

```js
// ANTES (v1.0)
let currentSchedule = [];
let currentView = 'monthly';

// DESPUÉS (v1.1)
const state = {
    schedule:   [],
    view:       'monthly',  // 'monthly' | 'annual'
    mode:       'standard', // 'standard' | 'reverse'
    lastResult: null,
};
```

Actualizar todas las referencias en el código de `currentSchedule` → `state.schedule`, `currentView` → `state.view`.

### 3.2 — Engine: `FSP_Engine.calculateReverseLoan()`

Función pura en `finance-engine.js`. Fórmula inversa de amortización estándar:

```
P = M × [ (1 − (1 + r)^−n) / r ]

donde:
  M = target monthly payment
  r = monthly rate (annual% / 12 / 100)
  n = years × 12
```

Signature:
```js
FSP_Engine.calculateReverseLoan = function( params ) {
    // params: {
    //   targetPayment  {number}  — pago mensual objetivo
    //   rate           {number}  — tasa anual en % (ej: 6.5)
    //   years          {number}  — plazo en años
    // }
    // returns: {
    //   maxLoanAmount  {number}
    //   totalInterest  {number}
    //   totalCost      {number}
    //   payoffMonths   {number}
    // }
    // Nota: no devuelve amortizationSchedule.
    // Para obtenerla, llamar calculateLoan({ principal: maxLoanAmount, rate, years }).
};
```

Guard: si `targetPayment <= 0 || rate <= 0 || years <= 0` → retornar objeto con todos los valores en 0.

### 3.3 — Template: toggle de modo

Añadir dentro de `<section class="fsp-inputs">`, antes de `.fsp-field-group`:

```html
<div class="fsp-mode-toggle" role="group" aria-label="Calculator mode">
    <button type="button" id="fsp-mode-standard"
            class="fsp-btn fsp-btn-ghost is-active"
            aria-pressed="true">
        Standard
    </button>
    <button type="button" id="fsp-mode-reverse"
            class="fsp-btn fsp-btn-ghost"
            aria-pressed="false">
        Reverse — by payment
    </button>
</div>
```

Añadir **debajo** del `.fsp-field-group` existente (no dentro), un campo exclusivo del modo reverse que estará oculto en modo standard:

```html
<div class="fsp-field fsp-field--reverse" id="fsp-field-target-payment" hidden>
    <label for="fsp-target-payment">Target Monthly Payment ($)</label>
    <input
        type="number"
        id="fsp-target-payment"
        class="fsp-input"
        min="1"
        step="10"
        placeholder="1,500"
        autocomplete="off"
        aria-required="true"
    />
</div>
```

**Decisión de arquitectura:** Se añade un input separado `#fsp-target-payment` en lugar de reusar `#fsp-amount` con cambio de label/placeholder. Reusar el mismo input es frágil: si el usuario tiene un valor en Amount y cambia a modo Reverse, ese valor cambia de semántica sin aviso; si luego vuelve a Standard, el valor ya no coincide con lo que el usuario ingresó. Inputs separados con show/hide eliminan este bug de UX.

En modo Reverse, el campo `#fsp-extra` se oculta (no aplica a la fórmula inversa). Los campos `#fsp-rate` y `#fsp-years` se comparten entre ambos modos.

### 3.4 — JS: `switchMode(mode)` en `loan-calculator.js`

```
switchMode('standard'):
  - state.mode = 'standard'
  - mostrar: #fsp-field-amount, #fsp-field-extra
  - ocultar: #fsp-field-target-payment
  - actualizar aria-pressed de los botones de modo
  - llamar handleReset() para limpiar resultados del modo anterior

switchMode('reverse'):
  - state.mode = 'reverse'
  - ocultar: #fsp-field-amount, #fsp-field-extra
  - mostrar: #fsp-field-target-payment
  - actualizar aria-pressed
  - llamar handleReset()
```

`handleCalculate()` ramifica según `state.mode`:
- `'standard'` → flujo actual, sin cambios.
- `'reverse'` → leer `#fsp-target-payment`, `#fsp-rate`, `#fsp-years`. Validar. Llamar `FSP_Engine.calculateReverseLoan()`. Renderizar resultado con "Max Loan Amount" como tarjeta primaria. Opcionalmente llamar `FSP_Engine.calculateLoan()` con `maxLoanAmount` para generar el schedule de amortización.

`handleReset()` en modo reverse: también limpiar `#fsp-target-payment.value`.

### 3.5 — CSS

```css
/* ─── Mode toggle ───────────────────────────────────────────── */
.fsp-mode-toggle {
    display:       flex;
    gap:           0.375rem;
    margin-bottom: 1.25rem;
}
```

Sin estilos adicionales — el toggle reusar `.fsp-btn-ghost.is-active` ya existente.

---

## Feature 4 — Mortgage Calculator (PITI + PMI)

**Esfuerzo:** Alto (~8h) | **Versión objetivo:** 1.2.0

**Archivos a modificar:**
- `finance-engine.js` — implementar `calculateMortgage()` (stub existe)
- `includes/class-shortcodes.php` — shortcode `[mortgage_calculator]`
- `includes/class-enqueue.php` — case `'mortgage'`
- `finance-suite-pro.php` — version bump

**Archivos nuevos:**
- `templates/mortgage-calculator.php`
- `assets/js/mortgage-calculator.js`

**Archivos a NO tocar:** `loan-calculator.js`, `loan-calculator.php`, `loan-comparison.js`

**Decisión de arquitectura:** Shortcode completamente separado `[mortgage_calculator]`. No modificar el loan calculator. Comparten solo el engine (`finance-engine.js`) y el CSS (`styles.css`). El patrón de extensión del plugin (template + JS controller + shortcode method + enqueue case) ya está diseñado para esto.

### 4.1 — Engine: `FSP_Engine.calculateMortgage()`

Implementar el stub existente. Parámetros:

```js
FSP_Engine.calculateMortgage = function( params ) {
    // params: {
    //   homePrice        {number}  — precio de compra
    //   downPayment      {number}  — pago inicial ($, no %)
    //   rate             {number}  — tasa anual %
    //   years            {number}  — plazo
    //   propertyTaxRate  {number}  — % anual del homePrice (ej: 1.2 para 1.2%)
    //   insuranceMonthly {number}  — seguro homeowners, $/mes
    //   pmiRate          {number}  — % anual del loanAmount (ej: 0.5). Solo si LTV > 80%.
    //   hoaMonthly       {number}  — HOA $/mes (opcional, default 0)
    // }
    // returns: {
    //   loanAmount       {number}
    //   monthlyPI        {number}  — principal + interest (amortización clásica)
    //   monthlyTax       {number}
    //   monthlyInsurance {number}
    //   monthlyPMI       {number}  — 0 si LTV inicial <= 80%
    //   monthlyHOA       {number}
    //   totalMonthly     {number}  — suma de todos los componentes (PITI + HOA)
    //   totalInterest    {number}
    //   totalCost        {number}
    //   payoffMonths     {number}
    //   pmiDropMonth     {number}  — mes en que LTV cae a 80% y PMI desaparece. 0 si no aplica.
    //   amortizationSchedule {Array}  — mismo formato que calculateLoan, con campo extra `pmi`
    // }
};
```

Lógica de PMI:
- LTV inicial = `loanAmount / homePrice`
- Si LTV inicial > 0.80 → PMI aplica desde el mes 1
- En el schedule, en cada mes: si `balance / homePrice <= 0.80` → PMI = 0 y registrar `pmiDropMonth` (primera vez)
- PMI mensual = `loanAmount × (pmiRate / 100) / 12`

El schedule incluye un campo `pmi` por fila:
```js
{ month, payment, principal, interest, extra, pmi, balance }
```

### 4.2 — Template `mortgage-calculator.php`

Mismo patrón que `loan-calculator.php`. Inputs:

| Campo | ID | Tipo | Notas |
|---|---|---|---|
| Home Price ($) | `fsp-home-price` | number | Requerido |
| Down Payment ($) | `fsp-down-payment` | number | Requerido. Mostrar LTV% dinámicamente debajo. |
| Annual Interest Rate (%) | `fsp-mort-rate` | number | Requerido |
| Loan Term (Years) | `fsp-mort-years` | number | Requerido |
| Property Tax Rate (%) | `fsp-tax-rate` | number | Opcional, default 0 |
| Homeowners Insurance ($/mo) | `fsp-insurance` | number | Opcional, default 0 |
| PMI Rate (%) | `fsp-pmi-rate` | number | Opcional. Ocultar si LTV ≤ 80%. Mostrar dinámicamente. |
| HOA ($/mo) | `fsp-hoa` | number | Opcional, default 0 |

Result cards (6 cards, 2 filas en móvil / 3 en desktop):
- Total Monthly Payment (primaria)
- Principal + Interest
- Property Tax
- Insurance
- PMI (ocultar si = 0)
- HOA (ocultar si = 0)

Info adicional debajo de las cards:
- PMI Drop Month: "PMI removed after payment #N (Month Year estimated)"
- Total Interest / Total Cost

### 4.3 — `mortgage-calculator.js`

IIFE autónomo. Mismo patrón que `loan-calculator.js`:
- `cacheElements()` para todos los inputs y outputs
- `state` object: `{ schedule, view, lastResult }`
- `bindEvents()`: calcular, reset, toggle amort, Enter key
- `handleCalculate()`: leer inputs → validar → `FSP_Engine.calculateMortgage()` → render
- `renderSummary()`: actualizar todas las cards, ocultar PMI/HOA cards si valor es 0
- `renderAmortizationMonthly()` y `renderAmortizationAnnual()`: igual que loan, con columna extra PMI
- `updateLTV()`: función que se ejecuta en `input` de `#fsp-home-price` y `#fsp-down-payment` para mostrar LTV% en tiempo real y mostrar/ocultar el campo PMI

`updateLTV()` se llama en `input` event (no `change`) para feedback inmediato.

### 4.4 — `class-shortcodes.php`

Descomentar y completar:
```php
add_shortcode( 'mortgage_calculator', [ $this, 'render_mortgage_calculator' ] );
```

Atributos del shortcode:
```php
'home_price'  => '', 'down_payment' => '', 'rate'      => '',
'years'       => '', 'tax_rate'     => '', 'insurance' => '',
'pmi_rate'    => '', 'hoa'          => '',
```

URL params: `?fsp_home_price=`, `?fsp_down_payment=`, `?fsp_rate=`, etc. Todos numéricos, sanitizados con `sanitize_numeric()`.

### 4.5 — `class-enqueue.php`

```php
case 'mortgage':
    wp_enqueue_script(
        'fsp-mortgage-calculator',
        FSP_PLUGIN_URL . 'assets/js/mortgage-calculator.js',
        [ 'fsp-finance-engine' ],
        FSP_VERSION,
        true
    );
    break;
```

No depende de `fsp-loan-calculator` — son tools independientes.

---

## Orden de implementación

| # | Feature | Versión | Prerequisitos |
|---|---|---|---|
| 1 | CTA Configurable | 1.0.1 | Ninguno |
| 2 | Refactor de estado en `loan-calculator.js` | 1.1.0-pre | Ninguno — primer commit de 1.1.0 |
| 3 | Reverse Loan Calculator | 1.1.0 | Refactor de estado |
| 4 | Loan Comparison | 1.1.0 | Refactor de estado (evento `fsp:loan:calculated`) |
| 5 | Mortgage Calculator | 1.2.0 | Ninguno — es independiente |

Features 3 y 4 pueden desarrollarse en paralelo porque no comparten archivos (gracias a la separación en módulos).

---

## Convenciones que aplican a todo el codebase

### JS
- Vanilla JS. Sin jQuery. Sin frameworks. Sin transpiladores.
- Cada tool: un IIFE en su propio archivo. Sin `export`/`import` (WordPress no usa ES modules por defecto).
- Estado: siempre un objeto `state` explícito por IIFE. Sin variables de estado sueltas.
- DOM manipulation: `textContent` para texto. `innerHTML` solo para HTML estructural estático (nunca con datos de usuario).
- Performance: `DocumentFragment` para inserción de múltiples nodos. Cache de referencias DOM en `cacheElements()`.
- Comunicación entre IIFEs: `CustomEvent` en `document`. Sin variables globales compartidas.

### PHP
- Sanitizar en entrada: `sanitize_text_field()`, `is_numeric()`, `esc_url_raw()`.
- Escapar en salida: `esc_attr()`, `esc_url()`, `esc_html()`. Sin excepción.
- Validar valores enum (como `cta_target`): whitelist explícita, no solo sanitize.
- Templates: solo HTML + escaping + condicionales simples. Sin lógica de negocio.

### CSS
- Prefix `fsp-` en todas las clases e IDs.
- Mobile-first. Media queries con `min-width`.
- Variables CSS en `:root` para todos los valores de diseño. Sin valores hardcodeados en reglas individuales.
- Show/hide exclusivamente con el atributo `hidden` (ya cubierto por `[hidden] { display: none !important; }`).

### Seguridad
- Links `target="_blank"` → siempre `rel="noopener noreferrer"`.
- No permitir que URL params del usuario sobrescriban `cta_url` (open redirect).
- JS nunca construye URLs con datos crudos del usuario sin sanitización previa.

### Accesibilidad
- Todo input: `<label for="...">` explícito. `placeholder` es complementario, nunca el único label.
- Grupos de inputs: `<fieldset>` + `<legend>` cuando los inputs están semánticamente agrupados.
- Botones de toggle: `aria-pressed`. Secciones expandibles: `aria-expanded` + `aria-controls`.
- Mensajes de error: `role="alert"` + `aria-live="polite"`.

### Versionado
- Bump `FSP_VERSION` en `finance-suite-pro.php` en cada feature o bugfix.
- Esquema: `MAJOR.MINOR.PATCH` — bugfix/deuda: patch, feature: minor, breaking change: major.
