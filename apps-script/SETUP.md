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
