# Registration Page — Design Spec

**Date:** 2026-07-29
**Status:** Approved (design), pending implementation plan

## Goal

Add a self-hosted booth registration page to the Renton Children's Business Fair
static site. Submissions must be captured **without a backend**, landing as rows
in a Google Sheet in the site owner's Google Drive for later processing (export
to CSV/JSON). The page must reuse the existing site look and feel.

Reference form (fields modeled after it):
`https://www.childrensbusinessfair.org/59833/booth_applications/new`

## Constraints

- Static site hosted on GitHub Pages (custom domain via `CNAME`). No server.
- Must reuse existing design system: `styles/variables.css`, `styles/main.css`,
  `Inter` font, Font Awesome, and JS-injected header/footer components.
- Script load order in existing pages must be preserved (see `CLAUDE.md`).
- Owner runs a small one-time Google setup; no ongoing server maintenance.

## Architecture

```
register.html (form)
     │  fetch POST (CORS-safe: URLSearchParams / FormData body)
     ▼
Google Apps Script Web App   (free, Google-hosted; deployed once by owner)
     │  sheet.appendRow([...])
     ▼
Google Sheet in owner's Drive
     → File ▸ Download ▸ CSV, or export JSON, share with team
```

The Apps Script is effectively a Google-hosted micro-endpoint — it satisfies the
"no backend I have to run" requirement. The endpoint URL is stored in
`js/config.js` so it can be swapped without touching page markup.

### CORS handling

Google Apps Script web apps do not support CORS preflight (OPTIONS). To avoid a
preflight the client sends a **simple request**: `fetch(url, { method: 'POST',
body: new URLSearchParams(data) })` (Content-Type `application/x-www-form-
urlencoded`). If reading the response is blocked, treat a resolved fetch with no
network error as success. `mode: 'no-cors'` is the fallback. The script reads
fields from `e.parameter`.

## Components / Files

| File | Purpose |
|------|---------|
| `register.html` | New page. Same `<head>`/header/footer scaffold as other pages. Contains the form markup and a success/error panel. |
| `styles/register.css` | Form-specific styles built on existing CSS custom properties (colors, spacing, radius, shadows from `variables.css`). |
| `js/modules/registration.js` | Form logic: validation, add/remove child rows, honeypot check, submit via fetch, success/error UI. |
| `js/config.js` | Add `registration.endpoint` (Apps Script URL) and `registration.maxChildren = 3`. |
| `apps-script/Code.gs` (repo doc/reference) | The Google Apps Script `doPost` source plus a `SETUP.md` with click-by-click deploy steps for the owner. |
| `upcoming-fair.html` (+ any other pages) | Repoint "Register Now" buttons from `childrensbusinessfair.org` to `register.html`. |

Header/footer inject via existing `js/components/header.js` and `footer.js`.
Navigation in `config.js` may optionally gain a link to the page (decide during
planning; not required for the page to work).

## Fields

### Adult Contact (all required)
- First name (text)
- Last name (text)
- Phone (tel)
- Email (email)

### Children — 1 to 3 (child 1 required; 2 and 3 optional, added via button)
Per child:
- First name (text)
- Last name (text)
- School name (text)
- Age on day of the fair (number)

"➕ Add another child" button reveals child 2, then child 3, up to
`maxChildren`. A remove control clears/hides an added child row.

### Business (trimmed to essentials)
- Business name (text, required)
- Business category (select, required): Arts and Crafts, Food, Toys, Clothing,
  Home, Books, Technology, Services, Entertainment, Other
- Product/service description (textarea, required)
- Electricity needed (radio Yes/No, required)
- How did you hear about us (select, required): Social media, Internet search,
  Friends and family, Blog, Podcast, Acton Academy, Other

**Dropped from reference:** photo/logo upload; and the 8 business-plan essays
(item pricing & production cost, inventory list, advertising strategy, startup
funding source, loan repayment plan, success measurement criteria).

### Agreement (both required)
- Child agrees to the business contract (checkbox)
- Photo/video permission (checkbox)

### Hidden
- Honeypot field (e.g. `company_website`) — if filled, silently drop as spam.

## Data flow into the sheet

One row per submission. Children flatten into columns so the sheet stays a flat
table:

```
Timestamp | AdultFirst | AdultLast | Phone | Email |
Child1First | Child1Last | Child1School | Child1Age |
Child2First | Child2Last | Child2School | Child2Age |
Child3First | Child3Last | Child3School | Child3Age |
BusinessName | Category | Description | Electricity | HeardAbout |
ContractAgreed | PhotoPermission
```

Empty child columns stay blank. The Apps Script writes the header row once if the
sheet is empty, then appends. Timestamp is generated server-side in the script.

## UX / behavior

- Client-side validation before send: HTML5 `required`, `type="email"`,
  `type="tel"` pattern, age numeric range (7–17). Inline error messaging.
- Submit button enters a loading state (spinner, disabled) during the request.
- Success: hide the form, show an inline confirmation panel with a friendly
  message and a link back to the fair page.
- Error (network failure): show a retry message; keep entered values.
- Honeypot filled → show the same success panel but do not send (silent drop).
- Accessible: labels tied to inputs, `aria-required`, focus moves to the
  success/error panel on completion, adequate color contrast.

## Owner one-time setup (documented in `apps-script/SETUP.md`)

1. Create a new Google Sheet in Drive.
2. Extensions ▸ Apps Script; paste `Code.gs`.
3. Deploy ▸ New deployment ▸ Web app; Execute as *me*, Access *Anyone*.
4. Authorize, copy the Web app URL.
5. Paste the URL into `js/config.js` → `registration.endpoint`.

## Out of scope

- Payment/fees (fair is free).
- File/photo uploads.
- CAPTCHA (honeypot only).
- Editing or viewing submissions from the site (owner works in the Sheet).

## Testing

- Manual: fill and submit with a valid deployment; confirm a new row appears in
  the sheet with correct column mapping for 1, 2, and 3 children.
- Validation: submit with missing required fields, bad email, age outside 7–17;
  confirm inline errors and no send.
- Honeypot: script-fill the hidden field; confirm silent drop.
- Responsive/visual check against existing pages on mobile and desktop.
- Verify "Register Now" buttons across the site point to `register.html`.
