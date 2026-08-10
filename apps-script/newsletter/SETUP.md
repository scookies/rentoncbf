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
