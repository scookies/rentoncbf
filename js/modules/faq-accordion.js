/**
 * FAQ accordion
 * Toggles each accordion item open/closed independently and keeps the
 * button's aria-expanded state in sync for accessibility.
 */
(function () {
  'use strict';

  function init() {
    const triggers = document.querySelectorAll('.accordion-trigger');
    if (!triggers.length) return; // Not on a page with an accordion.

    triggers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const item = btn.closest('.accordion-item');
        if (!item) return;
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!isOpen));
        item.classList.toggle('is-open', !isOpen);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
