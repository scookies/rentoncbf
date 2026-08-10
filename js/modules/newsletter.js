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

    async init() {
        this.injectModal();
        this.setupEvents();

        // Opened directly via the shared link.
        if (window.location.hash === '#notify') this.openModal(null);

        console.log('✅ Newsletter module initialized');
    }
}

// Export for use in other modules
window.NewsletterModule = NewsletterModule;
