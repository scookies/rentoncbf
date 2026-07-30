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
          mode: 'no-cors',
          // URLSearchParams => application/x-www-form-urlencoded => no CORS preflight.
          body: new URLSearchParams(data)
        });
        // no-cors makes the response opaque (we can't read status/body), but the
        // request is still sent; a resolved fetch with no network error is
        // treated as success.
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
