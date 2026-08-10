# Newsletter Signup — Design Spec

**Date:** 2026-08-09
**Status:** Approved (design), pending implementation plan

## Goal

Collect a name and email from visitors who want to be notified when the next
fair is announced. Entries land as rows in a **separate** Google Sheet from
booth registrations. The form appears in the site footer on every page, and a
shareable link (`/#notify`) opens the same form as a modal.

This stores the list; it does not send email. Notifying people means exporting
the sheet to CSV and using Gmail, Mailchimp, or similar.

## Constraints

- Static site on GitHub Pages (custom domain via `CNAME`). No server.
- `.htaccess` in the repo root is **inert** — the live site returns
  `server: GitHub.com`, which ignores it. No server-side redirects are
  available. (Clean URLs like `/register` come from GitHub Pages' own
  extensionless resolution, not from those rewrite rules.)
- Must reuse the existing design system: `styles/variables.css`,
  `styles/main.css`, and the JS-injected header/footer components.
- The existing booth-registration flow must not be modified. Its Apps Script
  deployment stays untouched.
- Owner runs a small one-time Google setup; no ongoing server maintenance.

## Architecture

```
Footer form (all pages)  ─┐
Modal form (#notify)     ─┴─► POST urlencoded, mode:'no-cors'
                                        │
                                        ▼
                      Google Apps Script Web App  (second, separate deployment)
                                        │  sheet.appendRow([...])
                                        ▼
                      "Renton CBF Newsletter" spreadsheet
                      Timestamp | Name | Email | Source
```

A **separate** spreadsheet and a **separate** Apps Script deployment, with its
own `/exec` URL stored as `newsletter.endpoint` in `js/config.js`. The existing
registration script is not edited or redeployed, so there is no path by which
this work can break booth signups.

### CORS handling

Same approach as `js/modules/registration.js`: `fetch` with a `URLSearchParams`
body, which the browser sends as `application/x-www-form-urlencoded` — a simple
request, so no CORS preflight. `mode: 'no-cors'` makes the response opaque, so
a resolved `fetch` with no network error is treated as success. The script reads
fields from `e.parameter`.

Consequence: **the client can never read the script's reply.** Any logic that
depends on knowing what the sheet did (e.g. duplicate detection) must live
server-side and be invisible to the visitor.

## Components / Files

| File | Change |
|------|--------|
| `js/modules/newsletter.js` | **New.** `NewsletterModule` class: shared form renderer, footer binding, modal injection, hash routing, validation, submit. ~140 lines. |
| `js/components/footer.js` | Add `renderNewsletterSection()`, called from `render()`. |
| `js/main.js` | Register `NewsletterModule` in the module init sequence, after the footer renders. |
| `js/config.js` | Add `newsletter: { endpoint: '' }`. |
| `styles/main.css` | Footer form styles + minor modal form styles. Reuses existing `.modal` rules at `main.css:1822–1925`. |
| `apps-script/newsletter/Code.gs` | **New.** Standalone `doPost`/`doGet` for the newsletter sheet. |
| `apps-script/newsletter/SETUP.md` | **New.** One-time setup walkthrough, mirroring `apps-script/SETUP.md`. |
| 6 × `*.html` | One `<script src="js/modules/newsletter.js">` tag, placed after `js/components/footer.js`. |

Pages needing the script tag (all pages that load `footer.js`):
`index.html`, `register.html`, `fairs.html`, `learn.html`, `sponsors.html`,
`upcoming-fair.html`.

**No new HTML files. No new page.**

## Form

Fields: `name` (text, required), `email` (email, required). Plus two hidden
fields:

- `company_website` — honeypot. Same field name the registration form uses.
- `source` — the current page filename, so signups can be attributed to the
  page that earned them.

Microcopy under the button: *"We'll only email about upcoming fairs.
Unsubscribe anytime."*

### One form, two mount points

`renderForm(variant)` produces the markup for both the footer instance and the
modal instance. The two differ only in wrapper class and a few layout rules.

Both stack vertically. `.footer-content` is
`grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))`
(`styles/main.css:589-594`), so the footer form lives inside a ~250px column —
too narrow to lay name, email, and button out in a row. The footer variant gets
a left-aligned button; the modal variant gets a full-width one.

Because the same form exists twice in one document, input `id`s are suffixed per
variant — `newsletter-name--footer`, `newsletter-name--modal`, and likewise for
email — so each `<label for>` resolves to its own input. Duplicate `id`s would
break label association and screen-reader announcement.

All DOM queries during validation and submit are **scoped to the enclosing
form element**, never `document`-wide, so the two instances cannot interfere.

## Initialization and timing

`main.js:64` awaits `DOMContentLoaded` and renders the footer several awaits
later at `main.js:112`. A plain `DOMContentLoaded` listener therefore runs
**before the footer exists** — the pattern `registration.js` uses would find no
form and silently bind nothing. (It works in `registration.js` only because
`register.html`'s form is static markup.)

Two mitigations, both applied:

1. `NewsletterModule` is registered in `main.js`'s module sequence, so `init()`
   runs after the footer is in the DOM — matching how `upcoming-fair` and
   `hero-stats` already work.
2. `submit` and `click` handlers are **delegated on `document`**, so binding
   does not depend on when either form instance appears.

## Modal

`id="newsletter-modal"`, injected into `<body>` by the module. Reuses the
existing `.modal`, `.modal-content`, and `.modal-close` styles and the
established conventions from `js/modules/upcoming-fair.js`: `data-modal-close`
buttons, backdrop-click to dismiss, Escape to dismiss, and
`document.body.style.overflow = 'hidden'` while open.

### Triggers

All three route to the same `openModal()`:

1. `location.hash === '#notify'` at init.
2. `hashchange` — so the link works when already on the page.
3. Clicks on `a[href="#notify"]` or `a[data-modal="newsletter-modal"]`, reusing
   the `data-modal` convention from `upcoming-fair.js:133`.

Shareable links: `rentonchildrensbusinessfair.org/#notify`, and the same
fragment on any page (`/register#notify`, `/fairs#notify`).

### Hash cleanup on close

On close, the fragment is removed via
`history.replaceState(null, '', location.pathname + location.search)`.
Without this, `#notify` persists and every refresh reopens the modal.
`replaceState` adds no history entry, so the back button is unaffected.

### Accessibility

The modal gets `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`
pointing at its heading. On open, focus moves to the Name input; on close,
focus returns to the element that triggered it (or `<body>` if it was opened by
hash, where there is no trigger element).

This goes beyond what `upcoming-fair.js` currently does. It is warranted here
because the modal contains a form — without it, a keyboard user gets no signal
that focus moved.

**Not included:** a full focus trap. Escape-to-close plus focus-on-open covers
the realistic cases; a trap is meaningful complexity for marginal benefit.

## Apps Script

Columns: `Timestamp | Name | Email | Source`. Header row written on first
submit. The append is wrapped in `LockService` to serialize concurrent writes.

Two behaviors beyond the registration script:

- **Dedupe.** Before appending, scan the Email column case-insensitively. If
  the address is already present, append nothing and return success. This must
  be server-side: `no-cors` means the browser cannot read the response, so the
  sheet is the only place that can know about duplicates.
- **Email sanity check.** A regex reject on malformed addresses. With
  `no-cors`, client-side validation is the only other gate, and it is trivially
  bypassed.

## Error handling

| Case | Behavior |
|------|----------|
| `newsletter.endpoint` empty | Simulation mode — log payload to console, show success, send nothing. Matches registration. |
| Network failure | Inline error: "Couldn't sign you up — please try again." Entered values are preserved. |
| Duplicate email | Silent success. No second row. Visitor sees the normal confirmation. |
| Honeypot filled | Show success, send nothing. |
| Invalid email / empty name | Native validation blocks submit; field outlined with a message beneath it, matching `registration.js`. |
| Double-click submit | Button disabled for the duration of the request. |

### Success state

- **Footer:** the form is replaced in place by "✓ You're on the list." Replacing
  in place keeps the footer's height stable so the page does not jump.
- **Modal:** the body is replaced by the confirmation plus a Close button. No
  auto-dismiss — the visitor should have time to read it.

## Testing

No test framework exists in this repo, so verification is a manual checklist:

1. Submit from the footer on two different pages → two rows in the sheet with
   correct, differing `Source` values.
2. Resubmit an address already in the sheet → no new row; visitor still sees
   the success confirmation.
3. Malformed email → inline error, no network request issued.
4. Empty name → submit blocked.
5. Visit `/#notify` → modal opens, focus lands on the Name input.
6. Visit `/register#notify` → modal opens on that page too.
7. Close the modal → `#notify` is gone from the URL; refresh does not reopen it.
8. Escape key and backdrop click both close the modal.
9. Submit from the modal → row appears with the correct `Source`.
10. Both form instances present on one page: submitting one does not alter or
    clear the other.
11. 375px viewport → footer fields stack; nothing overflows horizontally.
12. Blank `newsletter.endpoint` → console log only, no request, success shown.

## Out of scope

- **Sending email.** The sheet is a list store. Export to CSV and use an
  external mail tool.
- **The inert `.htaccess`.** Its security headers and rewrites do nothing on
  GitHub Pages, and no edit to that file can change it — response headers are
  not configurable on that host. A separate concern, deliberately excluded
  rather than folded into this work.
- **Unsubscribe handling.** The microcopy promises it; for now it is handled
  manually by deleting the row on request. Revisit if the list grows.
- **A nav entry for the signup.** `config.js` already supports a `modal:` key
  on nav items, so adding `{ text: 'Get Notified', href: '#', modal:
  'newsletter-modal' }` would work as a one-line follow-up. Not included by
  default.
