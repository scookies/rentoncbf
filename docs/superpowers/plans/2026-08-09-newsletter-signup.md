# Newsletter Signup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collect name + email into a dedicated Google Sheet, via a footer form on every page and a `#notify` modal reachable from one shareable link.

**Architecture:** A single `NewsletterModule` class renders one form in two mount points (footer section + injected modal) and POSTs urlencoded data to a **second, separate** Google Apps Script web app. The existing booth-registration script is never touched. The `#notify` URL fragment opens the modal client-side, so no new HTML file and no server redirect are needed.

**Tech Stack:** Vanilla ES6 classes, no build step, no dependencies. Google Apps Script (`.gs`, ES5-flavored JS) for the backend. CSS custom properties from `styles/variables.css`. Font Awesome for icons (already loaded on every page).

**Spec:** `docs/superpowers/specs/2026-08-09-newsletter-signup-design.md`

## Global Constraints

- **No test framework exists in this repo.** Every task's verification cycle is: state the expected observation, confirm it currently fails, implement, confirm it passes. Verify in a browser via `python3 -m http.server 8000` from the repo root.
- **No build step.** Do not add bundlers, package managers, or dependencies.
- **Static host.** The live site is GitHub Pages (`server: GitHub.com`). `.htaccess` in the repo root is inert — do not add rules to it and do not rely on server-side redirects.
- **Do not modify** `apps-script/Code.gs`, `js/modules/registration.js`, or `register.html`'s form. The registration flow must keep working untouched.
- **Copy is exact.** Consent line: `We'll only email about upcoming fairs. Unsubscribe anytime.` Button: `Notify Me`. Success: `You're on the list.` Error: `Couldn't sign you up — please try again.` Footer heading: `Stay in the Loop`. Modal heading: `Stay in the loop`.
- **Sheet columns, in order:** `Timestamp | Name | Email | Source`.
- **URL fragment is exactly** `#notify`.
- **Use existing CSS tokens only** — no new custom properties. Errors use `--color-energy-orange` on light backgrounds and `--color-sunshine-yellow` on the dark footer, matching `styles/register.css:110`.
- **Every form must carry `data-custom-submit`.** `js/main.js:361-371` attaches a generic submit handler with a fake "Thank you!" toast to every `form:not([data-custom-submit])`. Omitting this attribute produces a duplicate handler and a bogus notification.
- **Commit after every task.** Conventional-commit prefixes (`feat:`, `style:`, `docs:`).

---

### Task 1: Backend — Apps Script, setup doc, config slot

Establishes the receiving end and the config key. Nothing user-visible yet; the site stays in simulation mode because `endpoint` is left empty.

**Files:**
- Create: `apps-script/newsletter/Code.gs`
- Create: `apps-script/newsletter/SETUP.md`
- Modify: `js/config.js` — insert a `newsletter` block after the `registration` block (currently ends line 71)

**Interfaces:**
- Consumes: nothing.
- Produces: `window.SiteConfig.newsletter.endpoint` (string, empty until the owner deploys). Read by `NewsletterModule` in Task 2. Apps Script accepts POST params `name`, `email`, `source` and returns JSON `{result: 'success'|'error', duplicate?: boolean, message?: string}` — note this response is **unreadable by the browser** under `mode: 'no-cors'`.

- [ ] **Step 1: Verify the directory does not already exist**

Run: `ls apps-script/`
Expected: only `Code.gs` and `SETUP.md` — no `newsletter/` subdirectory. This confirms you are creating, not overwriting, the existing registration backend.

- [ ] **Step 2: Create the Apps Script**

Create `apps-script/newsletter/Code.gs`:

```javascript
/**
 * Renton CBF — newsletter signup receiver.
 * Deploy as a Web App (Execute as: Me, Access: Anyone). Appends one row per POST
 * to the bound spreadsheet's first sheet, writing a header row first if empty.
 *
 * Separate deployment from apps-script/Code.gs (booth registration) on purpose:
 * the registration script is never redeployed by this feature.
 */

var HEADERS = ['Timestamp', 'Name', 'Email', 'Source'];
var EMAIL_COL = 3; // 1-indexed position of Email within HEADERS.
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // Serialize appends to avoid row races.
  try {
    var params = (e && e.parameter) || {};
    var name = String(params.name || '').trim();
    var email = String(params.email || '').trim();
    var source = String(params.source || '').trim();

    // The client sends with mode:'no-cors' and cannot read this response, so
    // this check exists to protect the sheet, not to inform the visitor.
    if (!EMAIL_RE.test(email)) {
      return json({ result: 'error', message: 'invalid email' });
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Write header row once.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    // Dedupe must live here: the browser can't read our reply, so the sheet is
    // the only place that can know an address is already subscribed.
    if (emailExists(sheet, email)) {
      return json({ result: 'success', duplicate: true });
    }

    sheet.appendRow([new Date(), name, email, source]);
    return json({ result: 'success', duplicate: false });
  } catch (err) {
    return json({ result: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Case-insensitive scan of the Email column, skipping the header row.
function emailExists(sheet, email) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  var values = sheet.getRange(2, EMAIL_COL, lastRow - 1, 1).getValues();
  var needle = email.toLowerCase();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim().toLowerCase() === needle) return true;
  }
  return false;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Simple GET so the owner can confirm the deployment URL is live in a browser.
function doGet() {
  return json({ result: 'ok', service: 'renton-cbf-newsletter' });
}
```

- [ ] **Step 3: Verify the script parses**

Run: `node --check apps-script/newsletter/Code.gs`
Expected: no output (exit 0). `.gs` is plain JavaScript, so Node's parser catches syntax errors. It cannot resolve `SpreadsheetApp`/`LockService`/`ContentService` — that is fine, `--check` only parses.

- [ ] **Step 4: Create the setup doc**

Create `apps-script/newsletter/SETUP.md`:

```markdown
# Newsletter → Google Sheet setup (one-time)

This connects the site's newsletter signup to a **separate** Google Sheet from
the booth registrations. No server required.

This is a second, independent deployment. Do not reuse or redeploy the
registration script in `apps-script/Code.gs` — that one stays untouched.

## 1. Create the Sheet
1. Go to https://sheets.google.com and create a **blank** spreadsheet.
2. Name it "Renton CBF Newsletter". Leave it empty — the script writes the
   header row (`Timestamp | Name | Email | Source`) on the first signup.

## 2. Add the script
1. In the sheet: **Extensions ▸ Apps Script**.
2. Delete any starter code in `Code.gs`.
3. Paste the entire contents of `apps-script/newsletter/Code.gs` from this repo.
4. Click **Save** (disk icon).

## 3. Deploy as a Web App
1. Click **Deploy ▸ New deployment**.
2. Click the gear ▸ select **Web app**.
3. Set **Execute as:** `Me`, **Who has access:** `Anyone`.
4. Click **Deploy**. Approve the permission prompts
   (choose your account ▸ Advanced ▸ Go to project ▸ Allow).
5. Copy the **Web app URL** (ends in `/exec`).
6. Paste that URL into a browser. You should see
   `{"result":"ok","service":"renton-cbf-newsletter"}`. If you see the
   registration service name instead, you deployed the wrong script.

## 4. Connect the site
1. Open `js/config.js` in this repo.
2. Set `newsletter.endpoint` to the copied URL:
   ```javascript
   newsletter: {
       endpoint: 'https://script.google.com/macros/s/AKfyc.../exec'
   }
   ```
3. Commit and deploy the site.

**Warning:** Until `newsletter.endpoint` is set, signups are NOT saved anywhere —
the site runs in simulation mode and only logs to the browser console.

## 5. Test
- Visit the site, enter a name and email in the footer form, and confirm a new
  row appears in the Sheet.
- Submit the **same email again** — no second row should appear, and the visitor
  still sees the normal confirmation. This is intentional.
- To email the list: **File ▸ Download ▸ CSV**, then import into Gmail or
  Mailchimp. The Sheet stores the list; it cannot send mail.

## Updating the script later
If you edit `Code.gs`, redeploy: **Deploy ▸ Manage deployments ▸ (edit) ▸
Version: New version ▸ Deploy**. The URL stays the same.
```

- [ ] **Step 5: Add the config block**

In `js/config.js`, immediately after the closing `},` of the `registration` block and before the `// Contact Information` comment, insert:

```javascript
    // Newsletter Signup
    newsletter: {
        // Paste your deployed Google Apps Script Web App URL here
        // (see apps-script/newsletter/SETUP.md). While empty, the form runs in
        // simulation mode (logs data, shows success, does not send).
        endpoint: ''
    },
```

- [ ] **Step 6: Verify config parses and the key is reachable**

Run: `node --check js/config.js`
Expected: no output (exit 0).

Run: `node -e "global.window={}; require('./js/config.js'); const c=window.SiteConfig; console.log('newsletter:', JSON.stringify(c.newsletter)); console.log('registration endpoint intact:', c.registration.endpoint.length > 0);"`
Expected:
```
newsletter: {"endpoint":""}
registration endpoint intact: true
```
The second line guards against accidentally clobbering the registration block.

- [ ] **Step 7: Commit**

```bash
git add apps-script/newsletter/Code.gs apps-script/newsletter/SETUP.md js/config.js
git commit -m "feat: add newsletter Apps Script backend and config slot"
```

---

### Task 2: Module + footer form

Renders the form in the footer and makes it submit in simulation mode. This is the first user-visible deliverable.

**Files:**
- Create: `js/modules/newsletter.js`
- Modify: `js/components/footer.js` — add `renderNewsletterSection()`, call it from `render()` (lines 16-25)
- Modify: `js/main.js:135-143` — append a `newsletter` entry to `moduleInitializers`
- Modify: `index.html:279` — add one `<script>` tag

**Interfaces:**
- Consumes: `window.SiteConfig.newsletter.endpoint` from Task 1.
- Produces:
  - `window.NewsletterModule` — class.
  - `NewsletterModule.renderForm(variant)` — **static**, `variant` is `'footer'` or `'modal'`, returns an HTML string. Called by `footer.js` and (in Task 4) by `renderModal()`.
  - `NewsletterModule.prototype.init()` — async, called by `main.js`.
  - Instance methods used in Task 4: `injectModal()`, `openModal(trigger)`, `closeModal()`, `setupEvents()`.
  - DOM contract relied on by Task 3's CSS: form `.newsletter-form.newsletter-form--{variant}[data-newsletter-form]`, wrapper `.newsletter-fields`, per-input `.newsletter-field` (gets `.error`), `.field-error-msg`, `button.newsletter-submit`, `input.newsletter-hp`, `.newsletter-consent`, `.newsletter-done`, `.newsletter-error`, and footer wrapper `.footer-section.footer-newsletter`.

**Why a static `renderForm` plus delegated events:** `js/main.js:64` awaits `DOMContentLoaded`, then renders the footer several awaits later at `js/main.js:112`. A plain `DOMContentLoaded` listener therefore runs *before the footer exists* — the pattern `js/modules/registration.js:165-169` uses would silently bind nothing. `registration.js` gets away with it only because `register.html`'s form is static markup. So: `footer.js` calls the static method during its own render, and all instance event handlers are delegated on `document`.

**Why the `newsletter` entry goes LAST in `moduleInitializers`:** `initializeForms()` (index 5) and `initializeModals()` (index 6) both scan the DOM at their turn. Running after them means (a) the footer form already carries `data-custom-submit` so `initializeForms` skips it, and (b) the Task 4 modal is injected *after* `initializeModals` has finished scanning, so it never gets double-wired with main.js's own close handlers.

- [ ] **Step 1: Confirm the footer has no newsletter form today**

Run: `python3 -m http.server 8000` (leave running), open `http://localhost:8000/index.html`, scroll to the footer.
Expected: three footer columns — "Renton Children's Business Fair", "Discover", "Connect With Us". No signup form. This is the state Step 5 changes.

- [ ] **Step 2: Create the module**

Create `js/modules/newsletter.js`:

```javascript
/**
 * Newsletter Signup Module
 * Renders one name+email form in two mount points — the site footer and a modal
 * opened by the "#notify" fragment — and POSTs to the Google Apps Script
 * endpoint configured in js/config.js.
 *
 * Event handlers are delegated on `document` because the footer form is
 * injected by FooterComponent after DOMContentLoaded (see js/main.js:112),
 * so neither form is guaranteed to exist when this module initializes.
 */

class NewsletterModule {
    constructor() {
        this.config = (window.SiteConfig && window.SiteConfig.newsletter) || {};
        this.modalElement = null;
        this.lastTrigger = null;
    }

    /**
     * Build the signup form for a given mount point.
     * IDs are suffixed per variant because both forms can coexist in one
     * document — duplicate ids would break every <label for>.
     * @param {'footer'|'modal'} variant
     * @returns {string} Form HTML
     */
    static renderForm(variant) {
        const nameId = `newsletter-name--${variant}`;
        const emailId = `newsletter-email--${variant}`;
        return `
            <form class="newsletter-form newsletter-form--${variant}"
                  data-newsletter-form
                  data-newsletter-variant="${variant}"
                  data-custom-submit
                  novalidate>
                <div class="newsletter-fields">
                    <div class="newsletter-field">
                        <label for="${nameId}">Name</label>
                        <input type="text" id="${nameId}" name="name"
                               autocomplete="name" required>
                    </div>
                    <div class="newsletter-field">
                        <label for="${emailId}">Email</label>
                        <input type="email" id="${emailId}" name="email"
                               autocomplete="email" required>
                    </div>
                    <button type="submit" class="newsletter-submit">Notify Me</button>
                </div>
                <input type="text" name="company_website" class="newsletter-hp"
                       tabindex="-1" autocomplete="off" aria-hidden="true">
                <p class="newsletter-consent">We'll only email about upcoming fairs. Unsubscribe anytime.</p>
            </form>
        `;
    }

    // --- Validation -------------------------------------------------------
    // Scoped to the passed form so the two instances never touch each other.

    clearErrors(form) {
        form.querySelectorAll('.newsletter-field.error').forEach((field) => {
            field.classList.remove('error');
            const msg = field.querySelector('.field-error-msg');
            if (msg) msg.remove();
        });
        const box = form.querySelector('.newsletter-error');
        if (box) box.remove();
    }

    markError(input, message) {
        const field = input.closest('.newsletter-field') || input.parentElement;
        field.classList.add('error');
        if (message && !field.querySelector('.field-error-msg')) {
            const span = document.createElement('span');
            span.className = 'field-error-msg';
            span.textContent = message;
            field.appendChild(span);
        }
    }

    /**
     * @param {HTMLFormElement} form
     * @returns {boolean} true when every field is valid
     */
    validate(form) {
        this.clearErrors(form);
        let firstInvalid = null;

        // The form carries `novalidate`, which suppresses the browser's own
        // popup UI but leaves checkValidity() fully functional.
        form.querySelectorAll('input[name="name"], input[name="email"]').forEach((el) => {
            if (!el.checkValidity()) {
                this.markError(el, el.validationMessage);
                if (!firstInvalid) firstInvalid = el;
            }
        });

        if (firstInvalid) {
            firstInvalid.focus();
            return false;
        }
        return true;
    }

    // --- Submit -----------------------------------------------------------

    /**
     * Page name plus mount point, e.g. "index (footer)" or "register (modal)".
     * @param {HTMLFormElement} form
     * @returns {string}
     */
    currentSource(form) {
        const file = window.location.pathname.split('/').pop() || 'index.html';
        const page = file.replace(/\.html$/, '') || 'index';
        const variant = form.dataset.newsletterVariant || 'unknown';
        return `${page} (${variant})`;
    }

    async send(data) {
        const endpoint = this.config.endpoint;
        if (!endpoint) {
            // Simulation mode: no endpoint configured yet.
            console.log('[newsletter] simulation mode — data:', Object.fromEntries(data));
            return true;
        }
        try {
            await fetch(endpoint, {
                method: 'POST',
                mode: 'no-cors',
                // URLSearchParams => application/x-www-form-urlencoded => no
                // CORS preflight, which Apps Script cannot answer.
                body: new URLSearchParams(data)
            });
            // no-cors makes the response opaque (we can't read status or body),
            // but the request is still sent; a resolved fetch with no network
            // error is treated as success.
            return true;
        } catch (err) {
            console.error('[newsletter] signup failed:', err);
            return false;
        }
    }

    async handleSubmit(form) {
        // Honeypot: if filled, silently pretend success (drop the bot).
        const hp = form.querySelector('[name="company_website"]');
        if (hp && hp.value.trim() !== '') {
            this.showSuccess(form);
            return;
        }

        if (!this.validate(form)) return;

        const button = form.querySelector('.newsletter-submit');
        const originalLabel = button.textContent;
        button.disabled = true;
        button.textContent = 'Signing up…';

        const data = new FormData(form);
        data.delete('company_website');
        data.set('source', this.currentSource(form));

        const ok = await this.send(data);

        button.disabled = false;
        button.textContent = originalLabel;

        if (ok) {
            this.showSuccess(form);
        } else {
            this.showError(form);
        }
    }

    /**
     * Replace the form in place so the footer's height stays stable and the
     * page doesn't jump.
     */
    showSuccess(form) {
        const isModal = form.dataset.newsletterVariant === 'modal';
        const done = document.createElement('div');
        done.className = 'newsletter-done';
        done.setAttribute('role', 'status');
        done.innerHTML = `<p><i class="fas fa-check"></i> You're on the list.</p>` +
            (isModal
                ? `<button type="button" class="button-secondary" data-modal-close>Close</button>`
                : '');
        form.replaceWith(done);
        // The Close button needs no wiring: modal close clicks are delegated in
        // setupEvents(), so replaced markup keeps working.
    }

    showError(form) {
        let box = form.querySelector('.newsletter-error');
        if (!box) {
            box = document.createElement('p');
            box.className = 'newsletter-error';
            box.setAttribute('role', 'alert');
            form.appendChild(box);
        }
        box.textContent = "Couldn't sign you up — please try again.";
    }

    // --- Events -----------------------------------------------------------

    setupEvents() {
        // `submit` bubbles, so one delegated listener covers both mount points
        // no matter when they enter the DOM.
        document.addEventListener('submit', (e) => {
            const form = e.target.closest('[data-newsletter-form]');
            if (!form) return;
            e.preventDefault();
            this.handleSubmit(form);
        });
    }

    async init() {
        this.setupEvents();
        console.log('✅ Newsletter module initialized');
    }
}

// Export for use in other modules
window.NewsletterModule = NewsletterModule;
```

- [ ] **Step 3: Verify the module parses**

Run: `node --check js/modules/newsletter.js`
Expected: no output (exit 0).

- [ ] **Step 4: Add the footer section**

In `js/components/footer.js`, add this method after `renderConnectSection()` (which ends at line 79):

```javascript
    /**
     * Render newsletter signup section
     * Markup comes from NewsletterModule so the footer and modal share one
     * form definition. Guarded because footer.js must not hard-depend on it.
     * @returns {string} - Newsletter section HTML
     */
    renderNewsletterSection() {
        const form = window.NewsletterModule
            ? window.NewsletterModule.renderForm('footer')
            : '';
        return `
            <div class="footer-section footer-newsletter">
                <h4>Stay in the Loop</h4>
                <p>Get notified when the next fair opens.</p>
                ${form}
            </div>
        `;
    }
```

Then in `render()`, add the call after `${this.renderConnectSection()}` (line 21) so the block reads:

```javascript
                <div class="footer-content">
                    ${this.renderCompanySection()}
                    ${this.renderDiscoverSection()}
                    ${this.renderConnectSection()}
                    ${this.renderNewsletterSection()}
                </div>
```

`.footer-content` is `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))` (`styles/main.css:589-594`), so a fourth column reflows automatically with no CSS change needed.

- [ ] **Step 5: Register the module in main.js**

In `js/main.js`, append one entry to the `moduleInitializers` array (lines 135-143). It must be **last** — see the reasoning in this task's Interfaces block.

```javascript
            { name: 'modal', initializer: () => this.initializeModals(), required: false },
            // Last on purpose: initializeForms() and initializeModals() both
            // scan the DOM at their turn, and the newsletter modal must be
            // injected after initializeModals() has finished.
            { name: 'newsletter', class: NewsletterModule, required: false }
```

- [ ] **Step 6: Add the script tag to index.html**

In `index.html`, insert between line 279 (`footer.js`) and line 280 (`main.js`):

```html
    <script src="js/modules/newsletter.js"></script>
```

Order matters: after `footer.js` (which references `window.NewsletterModule`) and before `main.js` (which renders the footer and instantiates the module).

- [ ] **Step 7: Verify the footer form works in simulation mode**

Reload `http://localhost:8000/index.html` and scroll to the footer. With DevTools console open:

1. A fourth footer column "Stay in the Loop" with Name, Email, and a "Notify Me" button. Console shows `✅ newsletter module initialized`.
2. Click "Notify Me" with both fields empty → the Name field is outlined, an inline message appears beneath it, focus lands on Name. **No** "Thank you! Your form has been submitted." toast (that toast means `data-custom-submit` is missing).
3. Enter `not-an-email` in Email with a name filled → Email is flagged, no console log.
4. Enter `Test Person` / `test@example.com` → console logs `[newsletter] simulation mode — data: {name: 'Test Person', email: 'test@example.com', source: 'index (footer)'}`, and the form is replaced by "✓ You're on the list."
5. Confirm `company_website` is **absent** from the logged object.

Unstyled/awkward layout is expected here — Task 3 handles it.

- [ ] **Step 8: Verify registration still works**

Open `http://localhost:8000/register.html`, fill the required fields, submit.
Expected: unchanged behavior — the existing success panel appears, and no newsletter code runs. Confirms Task 2 didn't disturb the registration path.

- [ ] **Step 9: Commit**

```bash
git add js/modules/newsletter.js js/components/footer.js js/main.js index.html
git commit -m "feat: add newsletter module and footer signup form"
```

---

### Task 3: Styles

Makes the footer form presentable on the dark navy footer and responsive at mobile widths.

**Files:**
- Modify: `styles/main.css` — append a new section at end of file

**Interfaces:**
- Consumes: the class names produced in Task 2 (see that task's DOM contract).
- Produces: `.newsletter-*` rules. Task 4 adds only `.newsletter-modal-content` / `.newsletter-modal-body` on top of these; the shared form rules are final after this task.

The footer background is `--color-deep-navy` with white text, so inputs need explicit light backgrounds and dark text — inherited colors would render invisible.

- [ ] **Step 1: Confirm the form is currently unstyled**

Reload `http://localhost:8000/index.html`, inspect the footer form.
Expected: default browser input styling, labels and inputs stacked awkwardly, honeypot input **visible**. The visible honeypot is the most important thing this task fixes — a visible honeypot gets filled by real people and silently discards their signup.

- [ ] **Step 2: Append the styles**

Add to the end of `styles/main.css`:

```css
/* ===== Newsletter Signup ===== */

.footer-newsletter p {
  margin-bottom: var(--space-md);
}

.newsletter-form {
  margin: 0;
}

/* Honeypot: must be unreachable for humans but not display:none, which some
   bots detect. Kept out of the tab order via tabindex="-1" in the markup. */
.newsletter-hp {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.newsletter-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.newsletter-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.newsletter-field label {
  font-size: 0.82rem;
  font-weight: var(--font-weight-medium);
}

.newsletter-field input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-primary);
  font-size: 0.95rem;
  color: var(--color-deep-navy);
  background: var(--color-white);
  border: 1px solid var(--color-light-gray);
  border-radius: var(--radius-md);
  transition: box-shadow var(--transition-fast), border-color var(--transition-fast);
}

.newsletter-field input:focus {
  outline: none;
  border-color: var(--color-trust-blue);
  box-shadow: 0 0 0 3px var(--color-soft-blue);
}

.newsletter-field.error input {
  border-color: var(--color-energy-orange);
  box-shadow: 0 0 0 3px rgb(214 126 55 / 0.15);
}

.newsletter-submit {
  padding: var(--space-sm) var(--space-lg);
  font-family: var(--font-primary);
  font-size: 0.95rem;
  font-weight: var(--font-weight-semibold);
  color: var(--color-white);
  background: var(--color-energy-orange);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.newsletter-submit:hover:not(:disabled) {
  background: var(--color-sunshine-yellow);
  color: var(--color-deep-navy);
}

.newsletter-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.newsletter-consent {
  margin-top: var(--space-sm);
  font-size: 0.75rem;
  opacity: 0.75;
  line-height: 1.5;
}

.newsletter-done p {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin: 0;
  font-weight: var(--font-weight-medium);
}

.newsletter-done i {
  color: var(--color-sunshine-yellow);
}

.newsletter-error {
  margin-top: var(--space-sm);
  font-size: 0.82rem;
}

/* Footer variant sits on --color-deep-navy, so error text uses the yellow
   token for contrast rather than the orange used on light backgrounds. */
.newsletter-form--footer .field-error-msg,
.newsletter-form--footer .newsletter-error {
  color: var(--color-sunshine-yellow);
  font-size: 0.78rem;
}

.newsletter-form--footer .newsletter-submit {
  align-self: flex-start;
  margin-top: var(--space-xs);
}
```

Note `.field-error-msg` is defined only in `styles/register.css:110`, which is **not** loaded on `index.html` — hence the explicit rules above. Do not rely on the register stylesheet.

- [ ] **Step 3: Verify desktop appearance**

Reload `http://localhost:8000/index.html`, scroll to the footer.
Expected: four aligned columns; white rounded inputs with visible labels; an orange "Notify Me" button that turns yellow on hover; small dimmed consent line; **honeypot invisible**.

- [ ] **Step 4: Verify error and success styling**

1. Submit empty → the Name input gets an orange border and a **yellow** message beneath it, legible against the navy footer.
2. Submit valid data → "✓ You're on the list." with a yellow check, and the footer column does not visibly change height.

- [ ] **Step 5: Verify mobile at 375px**

In DevTools, set the viewport to 375×667 (iPhone SE).
Expected: footer columns stack to one; inputs span the column width; no horizontal scrollbar anywhere on the page; the button is fully visible and at least ~44px tall for touch.

Run: in the console, `document.documentElement.scrollWidth <= window.innerWidth`
Expected: `true` (no horizontal overflow).

- [ ] **Step 6: Commit**

```bash
git add styles/main.css
git commit -m "style: add newsletter signup form styles"
```

---

### Task 4: Modal and `#notify` routing

Delivers the shareable link. Adds the modal mount point, the three open triggers, hash cleanup, and focus management.

**Files:**
- Modify: `js/modules/newsletter.js` — add `renderModal()`, `injectModal()`, `openModal()`, `closeModal()`; extend `setupEvents()` and `init()`
- Modify: `styles/main.css` — append modal-specific rules

**Interfaces:**
- Consumes: `NewsletterModule.renderForm('modal')` and all validation/submit machinery from Task 2; `.newsletter-*` styles from Task 3.
- Produces: `#newsletter-modal` in the DOM on every page carrying the module. `openModal(trigger)` where `trigger` is the `Element` that opened it or `null` when opened by fragment. `closeModal()` takes no arguments.

Reuses `.modal` (`styles/main.css:1894`) and `.modal-content` (`styles/main.css:1822`). The scale-in animation comes free from `.modal.active .modal-content` (`styles/main.css:1915`), which is why the modal box must carry `.modal-content` **in addition to** the narrower `.newsletter-modal-content` — `.modal-content` alone is `max-width: 800px` with no padding, far too wide for two fields.

- [ ] **Step 1: Confirm `#notify` does nothing today**

Open `http://localhost:8000/index.html#notify`.
Expected: the homepage loads normally, no modal. Run `document.getElementById('newsletter-modal')` in the console → `null`.

- [ ] **Step 2: Add modal markup and open/close methods**

In `js/modules/newsletter.js`, add this static method immediately after `renderForm()`:

```javascript
    /**
     * The modal shell. Reuses the site's existing .modal / .modal-content /
     * .modal-close styles and the data-modal-close convention established by
     * js/modules/upcoming-fair.js.
     * @returns {string} Modal HTML
     */
    static renderModal() {
        return `
            <div id="newsletter-modal" class="modal" role="dialog" aria-modal="true"
                 aria-labelledby="newsletter-modal-title">
                <div class="modal-content newsletter-modal-content">
                    <button class="modal-close" data-modal-close aria-label="Close signup">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="newsletter-modal-body">
                        <h2 id="newsletter-modal-title">Stay in the loop</h2>
                        <p>Be first to know when the next fair opens.</p>
                        ${NewsletterModule.renderForm('modal')}
                    </div>
                </div>
            </div>
        `;
    }
```

Then add these instance methods immediately before `setupEvents()`:

```javascript
    // --- Modal ------------------------------------------------------------

    injectModal() {
        if (document.getElementById('newsletter-modal')) return;
        document.body.insertAdjacentHTML('beforeend', NewsletterModule.renderModal());
        this.modalElement = document.getElementById('newsletter-modal');
    }

    /**
     * @param {Element|null} trigger Element that opened the modal, so focus can
     *   be restored on close. null when opened by the URL fragment.
     */
    openModal(trigger) {
        if (!this.modalElement) return;
        this.lastTrigger = trigger || null;
        this.modalElement.classList.add('active');
        document.body.style.overflow = 'hidden';
        const firstInput = this.modalElement.querySelector('input[name="name"]');
        if (firstInput) firstInput.focus();
    }

    closeModal() {
        if (!this.modalElement) return;
        this.modalElement.classList.remove('active');
        document.body.style.overflow = '';

        // Drop the fragment, or a refresh reopens the modal forever.
        // replaceState adds no history entry, so Back is unaffected.
        if (window.location.hash === '#notify') {
            window.history.replaceState(
                null, '', window.location.pathname + window.location.search
            );
        }

        if (this.lastTrigger && typeof this.lastTrigger.focus === 'function') {
            this.lastTrigger.focus();
        }
        this.lastTrigger = null;
    }
```

- [ ] **Step 3: Extend `setupEvents()` and `init()`**

Replace the whole `setupEvents()` method body from Task 2 with:

```javascript
    setupEvents() {
        // `submit` bubbles, so one delegated listener covers both mount points
        // no matter when they enter the DOM.
        document.addEventListener('submit', (e) => {
            const form = e.target.closest('[data-newsletter-form]');
            if (!form) return;
            e.preventDefault();
            this.handleSubmit(form);
        });

        document.addEventListener('click', (e) => {
            // Open triggers. data-modal reuses the convention from
            // js/modules/upcoming-fair.js:133.
            const opener = e.target.closest('a[href="#notify"], [data-modal="newsletter-modal"]');
            if (opener) {
                e.preventDefault();
                this.openModal(opener);
                return;
            }

            if (!this.modalElement) return;

            // Close button — delegated so the success state's Close button,
            // which replaces the form, needs no rewiring.
            if (e.target.closest('#newsletter-modal [data-modal-close]')) {
                this.closeModal();
                return;
            }

            // Backdrop click.
            if (e.target === this.modalElement) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' &&
                this.modalElement &&
                this.modalElement.classList.contains('active')) {
                this.closeModal();
            }
        });

        // Fires when the link is followed while already on the page.
        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#notify') this.openModal(null);
        });
    }
```

And replace `init()` with:

```javascript
    async init() {
        this.injectModal();
        this.setupEvents();

        // Opened directly via the shared link.
        if (window.location.hash === '#notify') this.openModal(null);

        console.log('✅ Newsletter module initialized');
    }
```

- [ ] **Step 4: Verify the module still parses**

Run: `node --check js/modules/newsletter.js`
Expected: no output (exit 0).

- [ ] **Step 5: Append modal styles**

Add to the end of `styles/main.css`:

```css
/* Newsletter modal — .modal-content supplies the scale-in transition
   (main.css:1915); these rules narrow and pad it for a two-field form. */
.newsletter-modal-content {
  max-width: 460px;
  overflow: visible;
}

.newsletter-modal-body {
  padding: var(--space-2xl);
}

.newsletter-modal-body h2 {
  margin-bottom: var(--space-sm);
  color: var(--color-deep-navy);
}

.newsletter-modal-body > p {
  margin-bottom: var(--space-lg);
  color: var(--color-deep-navy);
  opacity: 0.8;
}

/* Modal sits on white, so error text uses the standard orange token,
   matching styles/register.css:110. */
.newsletter-form--modal .field-error-msg,
.newsletter-form--modal .newsletter-error {
  color: var(--color-energy-orange);
}

.newsletter-form--modal .newsletter-field label {
  color: var(--color-deep-navy);
}

.newsletter-form--modal .newsletter-submit {
  width: 100%;
  margin-top: var(--space-md);
  padding: var(--space-md) var(--space-lg);
}

.newsletter-form--modal .newsletter-consent {
  color: var(--color-deep-navy);
  text-align: center;
}

.newsletter-form--modal .newsletter-field input {
  border-color: var(--color-light-gray);
}

.newsletter-modal-content .newsletter-done {
  padding: var(--space-2xl);
  text-align: center;
  color: var(--color-deep-navy);
}

.newsletter-modal-content .newsletter-done p {
  justify-content: center;
  margin-bottom: var(--space-lg);
}

.newsletter-modal-content .newsletter-done i {
  color: var(--color-growth-green);
}

@media (max-width: 480px) {
  .newsletter-modal-body {
    padding: var(--space-xl);
  }
}
```

- [ ] **Step 6: Verify the modal opens from the fragment**

Open `http://localhost:8000/index.html#notify`.
Expected: a centered white modal, ~460px wide, scaling in over a dark backdrop. Heading "Stay in the loop", Name and Email stacked, a full-width "Notify Me", centered consent line, and a round close button top-right. The page behind does not scroll.

Run: `document.activeElement.id`
Expected: `newsletter-name--modal` — focus moved into the form.

- [ ] **Step 7: Verify all close paths and hash cleanup**

From `index.html#notify` each time:

1. Click the ✕ → modal closes; URL becomes `http://localhost:8000/index.html` with no `#notify`.
2. Reload → modal does **not** reappear. (Regression guard: without `replaceState` it would.)
3. Reopen, press Escape → closes.
4. Reopen, click the dark backdrop → closes. Clicking **inside** the white box does **not** close it.
5. Press Back after closing → returns to the previous page, not to the open modal.

- [ ] **Step 8: Verify `hashchange` and the two-instance guarantee**

On plain `http://localhost:8000/index.html`, run in the console:

```javascript
window.location.hash = '#notify';
```
Expected: modal opens without a page reload.

Close it, then verify the two forms are independent:

```javascript
document.querySelectorAll('[data-newsletter-form]').length
```
Expected: `2`.

Now type a name into the footer form, open the modal, and submit the **modal** form with valid data.
Expected: console logs `source: 'index (modal)'`; the modal shows "✓ You're on the list." with a Close button that works; the footer form still holds the text you typed and is still submittable.

- [ ] **Step 9: Verify the existing modal still works**

On `index.html`, open the nav "Fairs ▸ Upcoming Fair" item.
Expected: the upcoming-fair modal opens and closes normally. Confirms the new document-level handlers don't interfere, and that `initializeModals()` didn't double-wire anything.

- [ ] **Step 10: Commit**

```bash
git add js/modules/newsletter.js styles/main.css
git commit -m "feat: add newsletter modal opened by #notify fragment"
```

---

### Task 5: Roll out to remaining pages

The footer renders sitewide from one component, but each page lists its scripts explicitly, so the module tag is per-page.

**Files:**
- Modify: `fairs.html`, `learn.html`, `register.html`, `sponsors.html`, `upcoming-fair.html` — one `<script>` tag each

(`index.html` was done in Task 2.)

**Interfaces:**
- Consumes: everything from Tasks 2-4.
- Produces: nothing new — this task is pure rollout.

- [ ] **Step 1: Confirm which pages are missing the tag**

Run:
```bash
for f in index.html fairs.html learn.html register.html sponsors.html upcoming-fair.html; do
  grep -q "modules/newsletter.js" "$f" && echo "HAS: $f" || echo "MISSING: $f"
done
```
Expected: `HAS: index.html`, and `MISSING:` for the other five.

- [ ] **Step 2: Add the tag to each remaining page**

In each of `fairs.html`, `learn.html`, `register.html`, `sponsors.html`, `upcoming-fair.html`, insert this line **after** the `js/components/footer.js` tag and **before** the `js/main.js` tag:

```html
    <script src="js/modules/newsletter.js"></script>
```

The order is not cosmetic: `footer.js` calls `window.NewsletterModule.renderForm()`, and `main.js` triggers that render. Loading after `main.js` yields a footer with no form.

- [ ] **Step 3: Verify all six pages carry the tag in the right position**

Run:
```bash
for f in index.html fairs.html learn.html register.html sponsors.html upcoming-fair.html; do
  echo "--- $f"
  grep -n "components/footer.js\|modules/newsletter.js\|js/main.js" "$f"
done
```
Expected: for every file, three lines in ascending order — `footer.js`, then `newsletter.js`, then `main.js`.

- [ ] **Step 4: Verify each page in the browser**

Visit each of the six pages and confirm the footer signup renders and the console shows `✅ newsletter module initialized` with no errors:

- `http://localhost:8000/index.html`
- `http://localhost:8000/fairs.html`
- `http://localhost:8000/learn.html`
- `http://localhost:8000/register.html`
- `http://localhost:8000/sponsors.html`
- `http://localhost:8000/upcoming-fair.html`

Then confirm the fragment works off the homepage: open `http://localhost:8000/register.html#notify` → modal opens. Submit valid data → console logs `source: 'register (modal)'`.

- [ ] **Step 5: Verify register.html has no double-submit interference**

On `register.html`, submit the **booth registration** form with valid data.
Expected: the normal registration success panel. The newsletter module must not intercept it — its delegated listener filters on `[data-newsletter-form]`, which the registration form does not have.

- [ ] **Step 6: Commit**

```bash
git add fairs.html learn.html register.html sponsors.html upcoming-fair.html
git commit -m "feat: load newsletter module on all pages"
```

---

### Task 6: Live wiring (owner-run) and end-to-end verification

Requires Google account access, so the repo owner performs Steps 1-3. Everything before this task is verifiable without them.

**Files:**
- Modify: `js/config.js` — set `newsletter.endpoint`

**Interfaces:**
- Consumes: `apps-script/newsletter/Code.gs` and `SETUP.md` from Task 1.
- Produces: a populated `newsletter.endpoint`, which switches the module out of simulation mode.

- [ ] **Step 1: Owner creates the sheet and deploys the script**

Follow `apps-script/newsletter/SETUP.md` steps 1-3. Stop after copying the `/exec` URL.

- [ ] **Step 2: Verify the deployment is the newsletter script, not the registration one**

Paste the `/exec` URL into a browser.
Expected: `{"result":"ok","service":"renton-cbf-newsletter"}`

If it returns `"service":"renton-cbf-registration"`, the wrong script was pasted into Apps Script — go back and redo step 2 of `SETUP.md`. Do not proceed; continuing would write newsletter signups into the registration sheet.

- [ ] **Step 3: Set the endpoint**

In `js/config.js`, set `newsletter.endpoint` to the copied URL.

Run: `node -e "global.window={}; require('./js/config.js'); const n=window.SiteConfig.newsletter.endpoint; console.log(/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(n) ? 'endpoint OK' : 'endpoint MALFORMED: ' + n);"`
Expected: `endpoint OK`

- [ ] **Step 4: Verify a real signup lands in the sheet**

Serve locally, submit the footer form on `index.html` with `E2E Test` / `e2e-test@example.com`.
Expected: within a few seconds, the sheet shows a header row `Timestamp | Name | Email | Source` and one data row with a timestamp, `E2E Test`, `e2e-test@example.com`, `index (footer)`.

Note the console will show no `[newsletter] simulation mode` line now — that line appearing means the endpoint is still empty.

- [ ] **Step 5: Verify dedupe**

Submit `Different Name` / `E2E-TEST@example.com` (same address, different case and name).
Expected: **no** new row in the sheet, and the visitor still sees "✓ You're on the list." The silent success is intentional — `no-cors` makes any other outcome impossible to report.

- [ ] **Step 6: Verify source attribution differs by mount point**

Submit from `register.html#notify` (modal) with a fresh address.
Expected: a new row with Source `register (modal)`.

- [ ] **Step 7: Clean up test rows**

Delete the `e2e-test@example.com` and other test rows from the sheet so the list starts clean.

- [ ] **Step 8: Commit and deploy**

```bash
git add js/config.js
git commit -m "feat: set newsletter endpoint to deployed Apps Script web app"
```

Then push and confirm on the live site: `https://rentonchildrensbusinessfair.org/#notify` opens the modal, and a signup reaches the sheet.

---

## Deferred

Out of scope per the spec, recorded so it isn't rediscovered as a bug:

- **Sending email.** The sheet stores the list only. Export via File ▸ Download ▸ CSV.
- **Unsubscribe.** The consent copy promises it; handled manually by deleting a row on request.
- **The inert `.htaccess`.** Its headers and rewrites do nothing on GitHub Pages and no edit to that file can change that. Separate conversation.
- **A nav entry.** `js/config.js` already supports a `modal:` key on nav items, so `{ text: 'Get Notified', href: '#', external: false, modal: 'newsletter-modal' }` would work as a one-line follow-up.
- **A focus trap in the modal.** Escape-to-close plus focus-on-open covers the realistic cases.
- **`/notify` as a clean URL.** Would need a meta-refresh stub file; `#notify` was chosen to avoid adding files.
