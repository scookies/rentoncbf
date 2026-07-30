/**
 * Renton CBF — booth registration receiver.
 * Deploy as a Web App (Execute as: Me, Access: Anyone). It appends one row per
 * POST to the bound spreadsheet's first sheet, writing a header row first if empty.
 */

// Column order for the sheet. Keys match the form field names (except Timestamp).
var FIELDS = [
  'adultFirst', 'adultLast', 'phone', 'email',
  'child1First', 'child1Last', 'child1School', 'child1Age',
  'child2First', 'child2Last', 'child2School', 'child2Age',
  'child3First', 'child3Last', 'child3School', 'child3Age',
  'businessName', 'category', 'description', 'electricity', 'heardAbout',
  'contractAgreed', 'photoPermission'
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // Serialize appends to avoid row races.
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Write header row once.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp'].concat(FIELDS));
    }

    var params = (e && e.parameter) || {};
    var row = [new Date()];
    for (var i = 0; i < FIELDS.length; i++) {
      row.push(params[FIELDS[i]] || '');
    }
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Simple GET so you can confirm the deployment URL is live in a browser.
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'ok', service: 'renton-cbf-registration' }))
    .setMimeType(ContentService.MimeType.JSON);
}
