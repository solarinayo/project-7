const { GoogleSpreadsheet } = require("google-spreadsheet");
// ✅ FIX: Import the JWT auth helper from google-auth-library
const { JWT } = require("google-auth-library");

// This will hold the authenticated doc object
let doc;

const initializeGoogleSheets = async () => {
  try {
    if (
      !process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
      !process.env.GOOGLE_SHEETS_CLIENT_EMAIL ||
      !process.env.GOOGLE_SHEETS_PRIVATE_KEY
    ) {
      console.warn(
        "⚠️ Google Sheets environment variables are not fully configured. Skipping initialization."
      );
      return null;
    }

    // ✅ FIX: Authenticate using the JWT helper
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n"), // Ensure newlines are correctly formatted
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // ✅ FIX: Pass the spreadsheet ID and the auth client to the constructor
    doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      serviceAccountAuth
    );

    await doc.loadInfo(); // Loads document properties and worksheets
    console.log(`✅ Google Sheets initialized: "${doc.title}"`);
    return doc;
  } catch (error) {
    console.error("❌ Google Sheets initialization error:", error.message);
    return null;
  }
};

const addToGoogleSheets = async (studentData) => {
  try {
    if (!doc) {
      // If initialization failed or was skipped, don't proceed
      console.warn(
        'Google Sheets is not available. Skipping "addToGoogleSheets".'
      );
      return;
    }

    const sheet = doc.sheetsByIndex[0]; // Or use doc.sheetsByTitle['YourSheetTitle']
    if (!sheet) {
      console.error("No sheet found in the document.");
      return;
    }

    // Add the student data as a new row
    await sheet.addRow({
      Timestamp: new Date().toISOString(),
      "Applicant ID": studentData.applicantId,
      "Full Name": studentData.fullName,
      Email: studentData.email,
      Phone: studentData.phone,
      Course: studentData.courseName,
      Format: studentData.classFormat,
      Cohort: studentData.cohort,
      "Payment Plan": studentData.paymentPlan,
      "Amount Paid": studentData.currentPayment,
      "Final Amount": studentData.finalAmount,
      "Voucher Code": studentData.voucherCode || "N/A",
      "Paystack Ref": studentData.paystackReference,
    });

    console.log(
      `✅ Student data for "${studentData.fullName}" added to Google Sheets.`
    );
  } catch (error) {
    console.error("❌ Failed to add row to Google Sheets:", error.message);
  }
};

module.exports = {
  initializeGoogleSheets,
  addToGoogleSheets,
};
