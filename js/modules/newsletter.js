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
