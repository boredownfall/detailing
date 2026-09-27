/**
 * Optional Google Sheets receiver for PPF Select.
 * 1) Create a Google Sheet.
 * 2) Extensions -> Apps Script.
 * 3) Paste this code and set SHEET_NAME if needed.
 * 4) Deploy -> New deployment -> Web app.
 * 5) Execute as: Me. Access: Anyone.
 * 6) Put the deployment URL into Vercel env GOOGLE_SHEETS_WEBHOOK.
 */
const SHEET_NAME = 'Leads';

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || '{}');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  const headers = [
    'timestamp','brand','model','year','package','zones','timeline','name','phone','telegram',
    'utm_source','utm_medium','utm_campaign','utm_content','utm_term','referrer','landing_page'
  ];

  if (sheet.getLastRow() === 0) sheet.appendRow(headers);

  sheet.appendRow(headers.map(key => {
    const value = payload[key];
    return Array.isArray(value) ? value.join(', ') : (value ?? '');
  }));

  return ContentService.createTextOutput(JSON.stringify({ok:true}))
    .setMimeType(ContentService.MimeType.JSON);
}
