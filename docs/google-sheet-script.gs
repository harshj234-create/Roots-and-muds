// Roots and Muds: adds each new order as a row in this Google Sheet.
// Setup: in your sheet choose Extensions → Apps Script, paste this file, set SECRET below to the
// same value as GOOGLE_SHEET_SECRET in Vercel, then Deploy → New deployment → Web app,
// "Execute as: Me", "Who has access: Anyone". Copy the web app URL into GOOGLE_SHEET_WEBHOOK_URL.

const SECRET = "change-me";
const COLUMNS = ["order", "date", "status", "name", "phone", "email", "emirate", "area", "address",
  "deliveryTime", "notes", "items", "savings", "delivery", "total"];

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  if (data.secret !== SECRET) return ContentService.createTextOutput("forbidden");
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(COLUMNS.map((c) => c.charAt(0).toUpperCase() + c.slice(1)));
  sheet.appendRow(COLUMNS.map((c) => {
    const v = data.row[c] ?? "";
    return typeof v === "string" && /^[=+\-@]/.test(v) ? "'" + v : v; // stop formula injection
  }));
  return ContentService.createTextOutput("ok");
}
