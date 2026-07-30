# Registration Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a self-hosted booth registration page whose submissions land as rows in a Google Sheet in the owner's Drive, with no backend to run.

**Architecture:** A new static page (`register.html`) reuses the site's existing design system and JS-injected header/footer. A vanilla-JS module handles validation, up-to-3-children add/remove, and a CORS-safe `fetch` POST to a Google Apps Script Web App. The Apps Script (deployed once on the owner's Google account) appends each submission to a Google Sheet.

**Tech Stack:** Static HTML/CSS/JS (no build), Font Awesome, Inter font, Google Apps Script (server-side JS on Google infrastructure).

## Global Constraints

- No build process; assets via CDN; open `.html` directly or via `python -m http.server`.
- Preserve the site script load order: `config.js` → `utils/helpers.js` → `modules/navigation.js` → (carousel if present) → `components/header.js` → `components/footer.js` → page modules → `main.js`.
- Reuse existing design system: `styles/variables.css` + `styles/main.css`, Inter font, Font Awesome. Form-specific CSS goes in `styles/register.css`.
- Header/footer are injected by `js/components/header.js` / `footer.js`; page must have `<header class="header" id="header">` and `<footer class="footer" id="footer">`.
- Age validation range: **7–17** inclusive.
- Maximum **3** children per submission; child 1 required, children 2–3 optional.
- Apps Script endpoint URL lives in `js/config.js` under `registration.endpoint` — never hard-coded in markup.
- Business fields trimmed to essentials (name, category, description, electricity, how-heard). No file upload. No CAPTCHA (honeypot only).

---

### Task 1: Registration config in `config.js`

**Files:**
- Modify: `js/config.js` (add a `registration` block to `window.SiteConfig`)

**Interfaces:**
- Produces: `window.SiteConfig.registration = { endpoint: string, maxChildren: number, ageMin: number, ageMax: number }`. `endpoint` starts empty (`''`) and is filled in Task 5's live test.

- [ ] **Step 1: Add the registration config block**

In `js/config.js`, add a new property to the `window.SiteConfig` object, immediately after the `ui: { ... }` block (before `contact`):

```javascript
    // Registration Form
    registration: {
        // Paste your deployed Google Apps Script Web App URL here (see apps-script/SETUP.md).
        // While empty, the form runs in simulation mode (logs data, shows success, does not send).
        endpoint: '',
        maxChildren: 3,
        ageMin: 7,
        ageMax: 17
    },
```

- [ ] **Step 2: Verify config parses**

Run: `node -e "global.window={}; require('./js/config.js'); const r=window.SiteConfig.registration; if(r.maxChildren!==3||r.ageMin!==7||r.ageMax!==17||r.endpoint!=='') throw new Error('bad config'); console.log('OK', JSON.stringify(r));"`
Expected: `OK {"endpoint":"","maxChildren":3,"ageMin":7,"ageMax":17}`

- [ ] **Step 3: Commit**

```bash
git add js/config.js
git commit -m "feat: add registration config block"
```

---

### Task 2: Registration page markup (`register.html`)

**Files:**
- Create: `register.html`
- Test: manual browser load

**Interfaces:**
- Produces: a `<form id="registration-form" data-custom-submit>` containing named inputs (exact `name` attributes below), three child field groups (`.child-group` with `data-child="1|2|3"`, groups 2 and 3 having class `is-hidden`), an "Add another child" button `#add-child-btn`, a hidden honeypot input `name="company_website"`, a submit button `#submit-btn`, and two result panels `#success-panel` / `#error-panel` (both `hidden`).
- The `data-custom-submit` attribute is the flag Task 4 uses so `main.js` skips this form.

- [ ] **Step 1: Create `register.html` with the standard scaffold and form**

Create `register.html` with this exact content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - Renton Children's Business Fair</title>
    <meta name="description" content="Register your young entrepreneur for the Renton Children's Business Fair. Complete the booth application to reserve a spot at the upcoming fair.">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://rentonchildrensbusinessfair.org/register.html">

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="images/RentonCBFLogo.png">
    <link rel="apple-touch-icon" href="images/RentonCBFLogo.png">

    <!-- Stylesheets -->
    <link rel="stylesheet" href="styles/variables.css">
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/register.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <header class="header" id="header">
        <!-- Header will be rendered by HeaderComponent -->
    </header>

    <main>
        <section class="register-section section-card">
            <div class="container register-container">
                <div class="register-intro">
                    <h1>Booth Application</h1>
                    <p>Register your young entrepreneur for the Renton Children's Business Fair. Fields marked <span class="req-mark">*</span> are required.</p>
                </div>

                <!-- Success / error panels -->
                <div class="form-panel form-panel-success" id="success-panel" hidden tabindex="-1">
                    <i class="fas fa-circle-check"></i>
                    <h2>Registration received!</h2>
                    <p>Thank you for registering. We'll be in touch with details about the fair.</p>
                    <a href="upcoming-fair.html" class="button-primary">Back to the Fair</a>
                </div>
                <div class="form-panel form-panel-error" id="error-panel" hidden tabindex="-1">
                    <i class="fas fa-triangle-exclamation"></i>
                    <h2>Something went wrong</h2>
                    <p>We couldn't submit your registration. Please check your connection and try again.</p>
                    <button type="button" class="button-primary" id="error-retry-btn">Try Again</button>
                </div>

                <form id="registration-form" data-custom-submit novalidate>
                    <!-- Adult contact -->
                    <fieldset class="form-section">
                        <legend>Parent / Guardian Contact</legend>
                        <div class="form-row">
                            <div class="form-field">
                                <label for="adultFirst">First name <span class="req-mark">*</span></label>
                                <input type="text" id="adultFirst" name="adultFirst" required autocomplete="given-name">
                            </div>
                            <div class="form-field">
                                <label for="adultLast">Last name <span class="req-mark">*</span></label>
                                <input type="text" id="adultLast" name="adultLast" required autocomplete="family-name">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-field">
                                <label for="phone">Phone <span class="req-mark">*</span></label>
                                <input type="tel" id="phone" name="phone" required autocomplete="tel" placeholder="(425) 555-0100">
                            </div>
                            <div class="form-field">
                                <label for="email">Email <span class="req-mark">*</span></label>
                                <input type="email" id="email" name="email" required autocomplete="email">
                            </div>
                        </div>
                    </fieldset>

                    <!-- Children -->
                    <fieldset class="form-section" id="children-section">
                        <legend>Young Entrepreneur(s)</legend>

                        <div class="child-group" data-child="1">
                            <h3 class="child-title">Child 1 <span class="req-mark">*</span></h3>
                            <div class="form-row">
                                <div class="form-field">
                                    <label for="child1First">First name <span class="req-mark">*</span></label>
                                    <input type="text" id="child1First" name="child1First" required>
                                </div>
                                <div class="form-field">
                                    <label for="child1Last">Last name <span class="req-mark">*</span></label>
                                    <input type="text" id="child1Last" name="child1Last" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-field">
                                    <label for="child1School">School <span class="req-mark">*</span></label>
                                    <input type="text" id="child1School" name="child1School" required>
                                </div>
                                <div class="form-field">
                                    <label for="child1Age">Age at fair <span class="req-mark">*</span></label>
                                    <input type="number" id="child1Age" name="child1Age" required min="7" max="17">
                                </div>
                            </div>
                        </div>

                        <div class="child-group is-hidden" data-child="2">
                            <h3 class="child-title">Child 2
                                <button type="button" class="child-remove" data-remove-child="2" aria-label="Remove child 2"><i class="fas fa-xmark"></i> Remove</button>
                            </h3>
                            <div class="form-row">
                                <div class="form-field">
                                    <label for="child2First">First name</label>
                                    <input type="text" id="child2First" name="child2First">
                                </div>
                                <div class="form-field">
                                    <label for="child2Last">Last name</label>
                                    <input type="text" id="child2Last" name="child2Last">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-field">
                                    <label for="child2School">School</label>
                                    <input type="text" id="child2School" name="child2School">
                                </div>
                                <div class="form-field">
                                    <label for="child2Age">Age at fair</label>
                                    <input type="number" id="child2Age" name="child2Age" min="7" max="17">
                                </div>
                            </div>
                        </div>

                        <div class="child-group is-hidden" data-child="3">
                            <h3 class="child-title">Child 3
                                <button type="button" class="child-remove" data-remove-child="3" aria-label="Remove child 3"><i class="fas fa-xmark"></i> Remove</button>
                            </h3>
                            <div class="form-row">
                                <div class="form-field">
                                    <label for="child3First">First name</label>
                                    <input type="text" id="child3First" name="child3First">
                                </div>
                                <div class="form-field">
                                    <label for="child3Last">Last name</label>
                                    <input type="text" id="child3Last" name="child3Last">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-field">
                                    <label for="child3School">School</label>
                                    <input type="text" id="child3School" name="child3School">
                                </div>
                                <div class="form-field">
                                    <label for="child3Age">Age at fair</label>
                                    <input type="number" id="child3Age" name="child3Age" min="7" max="17">
                                </div>
                            </div>
                        </div>

                        <button type="button" class="button-secondary" id="add-child-btn"><i class="fas fa-plus"></i> Add another child</button>
                    </fieldset>

                    <!-- Business -->
                    <fieldset class="form-section">
                        <legend>Business Info</legend>
                        <div class="form-field">
                            <label for="businessName">Business name <span class="req-mark">*</span></label>
                            <input type="text" id="businessName" name="businessName" required>
                        </div>
                        <div class="form-field">
                            <label for="category">Business category <span class="req-mark">*</span></label>
                            <select id="category" name="category" required>
                                <option value="" disabled selected>Choose one…</option>
                                <option>Arts and Crafts</option>
                                <option>Food</option>
                                <option>Toys</option>
                                <option>Clothing</option>
                                <option>Home</option>
                                <option>Books</option>
                                <option>Technology</option>
                                <option>Services</option>
                                <option>Entertainment</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div class="form-field">
                            <label for="description">Product / service description <span class="req-mark">*</span></label>
                            <textarea id="description" name="description" rows="4" required></textarea>
                        </div>
                        <div class="form-field">
                            <span class="field-label">Will you need electricity? <span class="req-mark">*</span></span>
                            <div class="radio-row">
                                <label class="radio-option"><input type="radio" name="electricity" value="Yes" required> Yes</label>
                                <label class="radio-option"><input type="radio" name="electricity" value="No"> No</label>
                            </div>
                        </div>
                        <div class="form-field">
                            <label for="heardAbout">How did you hear about us? <span class="req-mark">*</span></label>
                            <select id="heardAbout" name="heardAbout" required>
                                <option value="" disabled selected>Choose one…</option>
                                <option>Social media</option>
                                <option>Internet search</option>
                                <option>Friends and family</option>
                                <option>Blog</option>
                                <option>Podcast</option>
                                <option>Acton Academy</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </fieldset>

                    <!-- Agreement -->
                    <fieldset class="form-section">
                        <legend>Agreement</legend>
                        <label class="checkbox-option">
                            <input type="checkbox" name="contractAgreed" value="Yes" required>
                            <span>My child agrees to run their business at the fair and follow the fair guidelines. <span class="req-mark">*</span></span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" name="photoPermission" value="Yes" required>
                            <span>I give permission for photos/video taken at the fair to be used to promote the event. <span class="req-mark">*</span></span>
                        </label>
                    </fieldset>

                    <!-- Honeypot: hidden from users, bots fill it -->
                    <div class="hp-field" aria-hidden="true">
                        <label for="company_website">Company website</label>
                        <input type="text" id="company_website" name="company_website" tabindex="-1" autocomplete="off">
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="button-primary" id="submit-btn">Submit Registration</button>
                    </div>
                </form>
            </div>
        </section>
    </main>

    <footer class="footer" id="footer">
        <!-- Footer will be rendered by FooterComponent -->
    </footer>

    <script src="js/config.js"></script>
    <script src="js/utils/helpers.js"></script>
    <script src="js/modules/navigation.js"></script>
    <script src="js/components/header.js"></script>
    <script src="js/components/footer.js"></script>
    <script src="js/modules/registration.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Serve the site and load the page**

Run: `python3 -m http.server 8000` (leave running), then open `http://localhost:8000/register.html` in a browser.
Expected: page loads with header and footer rendered by the components; the form shows Contact, Children (only Child 1 visible), Business, and Agreement sections; success/error panels are not visible; the honeypot "Company website" field is present in DOM but will be hidden after Task 3's CSS. No console errors related to missing files.

- [ ] **Step 3: Commit**

```bash
git add register.html
git commit -m "feat: add registration page markup"
```

---

### Task 3: Form styles (`styles/register.css`)

**Files:**
- Create: `styles/register.css`
- Test: manual browser check

**Interfaces:**
- Consumes: CSS custom properties from `styles/variables.css` (colors, spacing, radius, shadows) and the `.button-primary` / `.button-secondary` / `.container` / `.section-card` classes from `styles/main.css`.
- Produces: styles for `.register-container`, `.form-section`, `.form-row`, `.form-field`, `.child-group.is-hidden`, `.radio-row`, `.checkbox-option`, `.hp-field`, `.form-panel`, and error state `.form-field.error`.

- [ ] **Step 1: Create `styles/register.css`**

Create `styles/register.css` with this exact content:

```css
/* Registration page styles — built on variables.css tokens */

.register-section {
  padding: var(--space-3xl) 0;
  background: var(--color-cool-gray);
}

.register-container {
  max-width: var(--container-md);
}

.register-intro {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.register-intro h1 {
  color: var(--color-deep-navy);
  font-weight: var(--font-weight-extrabold);
}

.register-intro p {
  color: var(--color-deep-navy);
  max-width: 46ch;
  margin: var(--space-md) auto 0;
}

.req-mark {
  color: var(--color-energy-orange);
  font-weight: var(--font-weight-bold);
}

#registration-form {
  background: var(--color-white);
  border: 1px solid var(--color-light-gray);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--space-xl);
}

.form-section {
  border: none;
  border-top: 1px solid var(--color-light-gray);
  padding: var(--space-lg) 0;
  margin: 0;
}

.form-section:first-of-type {
  border-top: none;
  padding-top: 0;
}

.form-section legend {
  font-weight: var(--font-weight-bold);
  color: var(--color-trust-blue);
  font-size: 1.15rem;
  padding: 0;
  margin-bottom: var(--space-md);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.form-field {
  margin-bottom: var(--space-md);
  display: flex;
  flex-direction: column;
}

.form-field label,
.form-field .field-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-deep-navy);
  margin-bottom: var(--space-xs);
  font-size: 0.95rem;
}

.form-field input,
.form-field select,
.form-field textarea {
  font-family: var(--font-primary);
  font-size: 1rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--color-light-gray);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--color-deep-navy);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: var(--color-trust-blue);
  box-shadow: 0 0 0 3px var(--color-soft-blue);
}

.form-field.error input,
.form-field.error select,
.form-field.error textarea {
  border-color: var(--color-energy-orange);
  box-shadow: 0 0 0 3px rgb(214 126 55 / 0.15);
}

.field-error-msg {
  color: var(--color-energy-orange);
  font-size: 0.82rem;
  margin-top: var(--space-xs);
}

.child-group {
  background: var(--color-warm-gray);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  margin-bottom: var(--space-md);
}

.child-group.is-hidden {
  display: none;
}

.child-title {
  color: var(--color-growth-green);
  font-size: 1rem;
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--space-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.child-remove {
  background: none;
  border: none;
  color: var(--color-energy-orange);
  font-size: 0.85rem;
  cursor: pointer;
  font-family: var(--font-primary);
}

.radio-row {
  display: flex;
  gap: var(--space-lg);
}

.radio-option,
.checkbox-option {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  color: var(--color-deep-navy);
  font-size: 0.95rem;
  cursor: pointer;
}

.checkbox-option {
  margin-bottom: var(--space-md);
}

.checkbox-option input,
.radio-option input {
  margin-top: 0.2rem;
  flex-shrink: 0;
}

#add-child-btn {
  margin-top: var(--space-xs);
}

.form-actions {
  margin-top: var(--space-lg);
  text-align: center;
}

#submit-btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Honeypot — visually and programmatically removed from normal flow */
.hp-field {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* Result panels */
.form-panel {
  text-align: center;
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--space-2xl) var(--space-xl);
  margin-bottom: var(--space-lg);
}

.form-panel i {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.form-panel-success i {
  color: var(--color-growth-green);
}

.form-panel-error i {
  color: var(--color-energy-orange);
}

.form-panel h2 {
  color: var(--color-deep-navy);
  margin-bottom: var(--space-sm);
}

.form-panel p {
  color: var(--color-deep-navy);
  margin-bottom: var(--space-lg);
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  #registration-form {
    padding: var(--space-md);
  }
}
```

- [ ] **Step 2: Reload the page and verify styling**

Reload `http://localhost:8000/register.html`.
Expected: form is a centered white card with sectioned fieldsets, two-column rows on desktop collapsing to one column below 640px, styled inputs with a blue focus ring, and the "Company website" honeypot field is no longer visible on screen. Success/error panels still hidden.

- [ ] **Step 3: Commit**

```bash
git add styles/register.css
git commit -m "feat: add registration page styles"
```

---

### Task 4: Form logic module (`js/modules/registration.js`) + `main.js` guard

**Files:**
- Create: `js/modules/registration.js`
- Modify: `js/main.js:362` (the `initializeForms()` selector)
- Test: manual browser check (simulation mode — endpoint still empty)

**Interfaces:**
- Consumes: `window.SiteConfig.registration` (`endpoint`, `maxChildren`, `ageMin`, `ageMax`) from Task 1; the DOM IDs/attributes produced in Task 2.
- Produces: a self-initializing IIFE that binds to `#registration-form`. No global export needed. Sends form data as `application/x-www-form-urlencoded` via `fetch`. Field `name` attributes are sent verbatim as POST params (these are the exact keys Task 5's Apps Script reads).

- [ ] **Step 1: Stop `main.js` from hijacking the registration form's submit**

In `js/main.js`, change the selector in `initializeForms()` (around line 362) from:

```javascript
        const forms = document.querySelectorAll('form');
```

to:

```javascript
        const forms = document.querySelectorAll('form:not([data-custom-submit])');
```

- [ ] **Step 2: Create `js/modules/registration.js`**

Create `js/modules/registration.js` with this exact content:

```javascript
/**
 * Registration form module
 * Handles add/remove child rows, validation, and a CORS-safe POST to the
 * Google Apps Script endpoint configured in js/config.js.
 */
(function () {
  'use strict';

  function init() {
    const form = document.getElementById('registration-form');
    if (!form) return; // Not on the registration page.

    const cfg = (window.SiteConfig && window.SiteConfig.registration) || {};
    const maxChildren = cfg.maxChildren || 3;
    const ageMin = cfg.ageMin || 7;
    const ageMax = cfg.ageMax || 17;

    const addBtn = document.getElementById('add-child-btn');
    const submitBtn = document.getElementById('submit-btn');
    const successPanel = document.getElementById('success-panel');
    const errorPanel = document.getElementById('error-panel');
    const retryBtn = document.getElementById('error-retry-btn');

    // --- Add / remove children ---
    function visibleCount() {
      return form.querySelectorAll('.child-group:not(.is-hidden)').length;
    }
    function updateAddBtn() {
      addBtn.style.display = visibleCount() >= maxChildren ? 'none' : '';
    }
    addBtn.addEventListener('click', function () {
      const next = form.querySelector('.child-group.is-hidden');
      if (next) next.classList.remove('is-hidden');
      updateAddBtn();
    });
    form.querySelectorAll('[data-remove-child]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const group = btn.closest('.child-group');
        group.classList.add('is-hidden');
        // Clear its inputs so hidden data isn't submitted.
        group.querySelectorAll('input').forEach(function (i) { i.value = ''; });
        updateAddBtn();
      });
    });
    updateAddBtn();

    // --- Validation ---
    function clearErrors() {
      form.querySelectorAll('.form-field.error').forEach(function (f) {
        f.classList.remove('error');
        const msg = f.querySelector('.field-error-msg');
        if (msg) msg.remove();
      });
    }
    function markError(input, message) {
      const field = input.closest('.form-field') || input.parentElement;
      field.classList.add('error');
      if (message && !field.querySelector('.field-error-msg')) {
        const span = document.createElement('span');
        span.className = 'field-error-msg';
        span.textContent = message;
        field.appendChild(span);
      }
    }

    function validate() {
      clearErrors();
      let firstInvalid = null;

      // Only validate inputs inside visible child groups + non-child fields.
      const controls = form.querySelectorAll('input, select, textarea');
      controls.forEach(function (el) {
        if (el.name === 'company_website') return; // honeypot, skip
        const hiddenGroup = el.closest('.child-group.is-hidden');
        if (hiddenGroup) return; // ignore hidden child fields

        // Native constraint check (required, type=email, min/max).
        if (!el.checkValidity()) {
          markError(el, el.validationMessage);
          if (!firstInvalid) firstInvalid = el;
          return;
        }
        // Extra age range guard (covers filled optional children too).
        if (el.type === 'number' && el.value !== '') {
          const n = Number(el.value);
          if (n < ageMin || n > ageMax) {
            markError(el, 'Age must be between ' + ageMin + ' and ' + ageMax + '.');
            if (!firstInvalid) firstInvalid = el;
          }
        }
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return false;
      }
      return true;
    }

    // --- Submit ---
    function setLoading(on) {
      submitBtn.disabled = on;
      submitBtn.textContent = on ? 'Submitting…' : 'Submit Registration';
    }
    function showPanel(panel) {
      form.hidden = true;
      panel.hidden = false;
      panel.focus();
      window.scrollTo({ top: panel.getBoundingClientRect().top + window.pageYOffset - 100, behavior: 'smooth' });
    }

    async function send(data) {
      const endpoint = cfg.endpoint;
      if (!endpoint) {
        // Simulation mode: no endpoint configured yet.
        console.log('[registration] simulation mode — data:', Object.fromEntries(data));
        return true;
      }
      try {
        await fetch(endpoint, {
          method: 'POST',
          // URLSearchParams => application/x-www-form-urlencoded => no CORS preflight.
          body: new URLSearchParams(data)
        });
        // Apps Script often blocks reading the response body cross-origin; a
        // resolved fetch with no network error is treated as success.
        return true;
      } catch (err) {
        console.error('[registration] submit failed:', err);
        return false;
      }
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Honeypot: if filled, silently pretend success (drop spam).
      const hp = form.querySelector('[name="company_website"]');
      if (hp && hp.value.trim() !== '') {
        showPanel(successPanel);
        return;
      }

      if (!validate()) return;

      setLoading(true);
      const data = new FormData(form);
      data.delete('company_website');
      const ok = await send(data);
      setLoading(false);
      showPanel(ok ? successPanel : errorPanel);
    });

    if (retryBtn) {
      retryBtn.addEventListener('click', function () {
        errorPanel.hidden = true;
        form.hidden = false;
        form.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

- [ ] **Step 3: Verify add/remove children in the browser**

Reload `http://localhost:8000/register.html`.
- Click "Add another child" → Child 2 appears. Click again → Child 3 appears; the button disappears (max 3).
- Click "Remove" on Child 3 → it hides, its fields clear, button reappears.
Expected: behavior matches; no console errors.

- [ ] **Step 4: Verify validation and simulation submit**

- Click "Submit Registration" with empty fields → the first invalid field gets a red border + inline message and receives focus; no navigation.
- Fill all required fields (set Child 1 age to `3`) → submit shows an age error "Age must be between 7 and 17."
- Fix age to `10`, complete all fields and both checkboxes, submit.
Expected: DevTools console logs `[registration] simulation mode — data: {…}` with all expected keys (`adultFirst`, `adultLast`, `phone`, `email`, `child1First`, …, `businessName`, `category`, `description`, `electricity`, `heardAbout`, `contractAgreed`, `photoPermission`), and the green success panel appears. Honeypot key is absent.

- [ ] **Step 5: Commit**

```bash
git add js/modules/registration.js js/main.js
git commit -m "feat: add registration form logic and exclude it from generic form handler"
```

---

### Task 5: Google Apps Script endpoint + owner setup docs

**Files:**
- Create: `apps-script/Code.gs`
- Create: `apps-script/SETUP.md`
- Modify: `js/config.js` (fill `registration.endpoint` with the deployed URL — done by the owner during the live test)
- Test: `curl` POST to the deployed web app, then confirm a row in the Sheet

**Interfaces:**
- Consumes: the POST parameter names produced by Task 4 (`adultFirst`, `adultLast`, `phone`, `email`, `child1First`/`Last`/`School`/`Age`, `child2*`, `child3*`, `businessName`, `category`, `description`, `electricity`, `heardAbout`, `contractAgreed`, `photoPermission`).
- Produces: a Google Sheet row per submission with a leading server-side `Timestamp` column, in the exact column order below.

- [ ] **Step 1: Create `apps-script/Code.gs`**

Create `apps-script/Code.gs` with this exact content:

```javascript
/**
 * Renton CBF — booth registration receiver.
 * Deploy as a Web App (Execute as: Me, Access: Anyone). It appends one row per
 * POST to the bound spreadsheet's first sheet, writing a header row first if empty.
 */

// Column order for the sheet. Keys match the form field names (except Timestamp).
var FIELDS = [
  'adultFirst', 'adultLast', 'phone', 'email',
  'child1First', 'child1Last', 'child1School', 'child1Age',
  'child2First', 'child2Last', 'child2School', 'child2Age',
  'child3First', 'child3Last', 'child3School', 'child3Age',
  'businessName', 'category', 'description', 'electricity', 'heardAbout',
  'contractAgreed', 'photoPermission'
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // Serialize appends to avoid row races.
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Write header row once.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp'].concat(FIELDS));
    }

    var params = (e && e.parameter) || {};
    var row = [new Date()];
    for (var i = 0; i < FIELDS.length; i++) {
      row.push(params[FIELDS[i]] || '');
    }
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Simple GET so you can confirm the deployment URL is live in a browser.
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'ok', service: 'renton-cbf-registration' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

- [ ] **Step 2: Create `apps-script/SETUP.md`**

Create `apps-script/SETUP.md` with this exact content:

````markdown
# Registration → Google Sheet setup (one-time)

This connects the site's registration form to a Google Sheet in your Drive.
No server required — Google hosts the script for free.

## 1. Create the Sheet
1. Go to https://sheets.google.com and create a **blank** spreadsheet.
2. Name it e.g. "Renton CBF Registrations". Leave it empty (the script writes
   the header row automatically on the first submission).

## 2. Add the script
1. In the sheet: **Extensions ▸ Apps Script**.
2. Delete any starter code in `Code.gs`.
3. Paste the entire contents of `apps-script/Code.gs` from this repo.
4. Click **Save** (disk icon).

## 3. Deploy as a Web App
1. Click **Deploy ▸ New deployment**.
2. Click the gear ▸ select **Web app**.
3. Set **Execute as:** `Me`, **Who has access:** `Anyone`.
4. Click **Deploy**. Approve the permission prompts
   (choose your account ▸ Advanced ▸ Go to project ▸ Allow).
5. Copy the **Web app URL** (ends in `/exec`).

## 4. Connect the site
1. Open `js/config.js` in this repo.
2. Set `registration.endpoint` to the copied URL:
   ```javascript
   registration: {
       endpoint: 'https://script.google.com/macros/s/AKfyc.../exec',
       ...
   }
   ```
3. Commit and deploy the site.

## 5. Test
- Visit the site's `register.html`, submit a test entry, and confirm a new row
  appears in the Sheet.
- To hand data to the team: **File ▸ Download ▸ CSV** (or `.xlsx`).

## Updating the script later
If you edit `Code.gs`, redeploy: **Deploy ▸ Manage deployments ▸ (edit) ▸
Version: New version ▸ Deploy**. The URL stays the same.
````

- [ ] **Step 3: Deploy and live-test (owner action)**

Follow `apps-script/SETUP.md` steps 1–3 to deploy. Then verify the endpoint with a POST:

Run (substitute your `/exec` URL):
```bash
curl -L -s -d "adultFirst=Test&adultLast=Parent&phone=4255550100&email=test@example.com&child1First=Kid&child1Last=Parent&child1School=Renton Elementary&child1Age=10&businessName=Test Lemonade&category=Food&description=Lemonade stand&electricity=No&heardAbout=Social media&contractAgreed=Yes&photoPermission=Yes" "https://script.google.com/macros/s/XXXX/exec"
```
Expected: JSON `{"result":"success"}` and a new row in the Sheet with a Timestamp plus the values above, blank child2/child3 columns.

- [ ] **Step 4: Fill the endpoint in config and commit**

Edit `js/config.js` → set `registration.endpoint` to the deployed `/exec` URL. Then:

```bash
git add apps-script/Code.gs apps-script/SETUP.md js/config.js
git commit -m "feat: add Google Apps Script receiver, setup docs, and live endpoint"
```

- [ ] **Step 5: End-to-end browser test**

Reload `register.html` (served or on the live domain), submit a complete real-looking entry.
Expected: green success panel appears, and a new row lands in the Sheet with correct column mapping.

---

### Task 6: Wire "Register Now" into the site

**Files:**
- Modify: `upcoming-fair.html:135` (the "Register Now" anchor)
- Modify: `js/config.js` (add a nav entry under the "Fairs" dropdown)
- Search & modify: any other page linking to the external registration URL
- Test: manual click-through

**Interfaces:**
- Consumes: `register.html` from Task 2.
- Produces: internal links to `register.html` replacing external `childrensbusinessfair.org/wa-renton` registration CTAs, plus a "Register" nav item.

- [ ] **Step 1: Find all external registration CTAs**

Run: `grep -rn "childrensbusinessfair.org/wa-renton" --include=*.html .`
Expected: a list of matches. The "Register Now" button in `upcoming-fair.html` (line ~135) is the primary CTA. Note: the footer globe icon and the upcoming-fair page's structured-data `offers.url` also reference `wa-renton` — leave the footer social icon and JSON-LD alone; only change human-facing "Register" CTA buttons/links.

- [ ] **Step 2: Repoint the Register Now button**

In `upcoming-fair.html`, change:

```html
<a href="https://www.childrensbusinessfair.org/wa-renton" class="button-primary" target="_blank" rel="noopener">Register Now</a>
```

to:

```html
<a href="register.html" class="button-primary">Register Now</a>
```

Apply the same change to any other human-facing "Register"/"Register Now" CTA found in Step 1 (do NOT touch the footer globe social link or the JSON-LD `offers.url`).

- [ ] **Step 3: Add a nav entry under "Fairs"**

In `js/config.js`, update the `Fairs` dropdown to include a Register link:

```javascript
            {
                text: 'Fairs',
                dropdown: [
                    { text: 'Upcoming Fair', href: '#', external: false, modal: 'upcoming-fair-modal' },
                    { text: 'Register', href: 'register.html', external: false },
                    { text: 'Past Fairs', href: 'fairs.html', external: false }
                ]
            },
```

- [ ] **Step 4: Verify links**

Reload the site home/upcoming-fair page.
Expected: the "Register Now" button navigates to `register.html` in the same tab; the "Fairs" dropdown shows a "Register" item that also opens `register.html`. The footer globe icon still points to the external `wa-renton` page.

- [ ] **Step 5: Commit**

```bash
git add upcoming-fair.html js/config.js
git commit -m "feat: point Register CTAs and nav to the new registration page"
```

---

## Self-Review

**Spec coverage:**
- No-backend Google Sheet capture → Tasks 5 (script) + 1/4 (config + fetch). ✔
- Reuse look and feel → Tasks 2 (scaffold, shared CSS) + 3 (tokens-based styles). ✔
- Fields (adult, up-to-3 children, trimmed business, agreement) → Task 2 markup + Task 4 validation. ✔
- Age 7–17 → Task 1 config, Task 2 `min/max`, Task 4 range guard. ✔
- Honeypot spam protection → Task 2 field + Task 3 hide + Task 4 drop logic. ✔
- CORS-safe submit → Task 4 `URLSearchParams` body. ✔
- Sheet column mapping incl. flattened children + timestamp → Task 5 `FIELDS` order matches spec. ✔
- Repoint Register CTAs + optional nav entry → Task 6. ✔
- Owner one-time setup docs → Task 5 `SETUP.md`. ✔

**Placeholder scan:** No TBD/TODO; all code blocks are complete. `endpoint: ''` is an intentional runtime default (simulation mode), documented, not a plan placeholder.

**Type/name consistency:** Form field `name` attributes in Task 2 exactly match the params read in Task 4's honeypot/FormData handling and Task 5's `FIELDS` array (`adultFirst`, `adultLast`, `phone`, `email`, `child{1,2,3}{First,Last,School,Age}`, `businessName`, `category`, `description`, `electricity`, `heardAbout`, `contractAgreed`, `photoPermission`, honeypot `company_website`). IDs referenced in Task 4 (`registration-form`, `add-child-btn`, `submit-btn`, `success-panel`, `error-panel`, `error-retry-btn`, `[data-remove-child]`, `.child-group.is-hidden`) all exist in Task 2 markup. `data-custom-submit` set in Task 2 matches the `:not([data-custom-submit])` selector in Task 4.
