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
