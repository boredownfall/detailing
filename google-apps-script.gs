/**
 * Optional Google Sheets receiver for BRONYA AUTO.
 * 1) Create a Google Sheet.
 * 2) Extensions -> Apps Script.
 * 3) Paste this code and set SHEET_NAME if needed.
 * 4) Deploy -> New deployment -> Web app.
 * 5) Execute as: Me. Access: Anyone.
 * 6) Put the deployment URL into Vercel env GOOGLE_SHEETS_WEBHOOK.
 * 7) (Recommended) Set SECRET below and the same value in Vercel env GOOGLE_SHEETS_SECRET,
 *    otherwise anyone who knows the URL can write rows into your sheet.
 */
const SHEET_NAME = 'Leads';
const SECRET = ''; // например: длинная случайная строка

// Защита от формульной инъекции: значения, начинающиеся с = + - @, превращаем в текст.
function safe(v) {
  const s = Array.isArray(v) ? v.join(', ') : String(v ?? '');
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || '{}');
  if (SECRET && payload.secret !== SECRET) {
    return ContentService.createTextOutput(JSON.stringify({ok:false})).setMimeType(ContentService.MimeType.JSON);
  }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  const headers = [
    'timestamp','brand','model','year','package','zones','timeline','name','phone','telegram',
    'utm_source','utm_medium','utm_campaign','utm_content','utm_term','referrer','landing_page'
  ];

  if (sheet.getLastRow() === 0) sheet.appendRow(headers);

  sheet.appendRow(headers.map(key => safe(payload[key])));

  return ContentService.createTextOutput(JSON.stringify({ok:true}))
    .setMimeType(ContentService.MimeType.JSON);
}
