const { GoogleSpreadsheet } = require('google-spreadsheet');

let doc;

const initializeGoogleSheets = async () => {
  try {
    if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
      console.warn('Google Sheets not configured');
      return null;
    }

    doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_SPREADSHEET_ID);

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });

    await doc.loadInfo();
    console.log('✅ Google Sheets initialized');
    return doc;
  } catch (error) {
    console.error('❌ Google Sheets initialization error:', error);
    return null;
  }
};

const addToGoogleSheets = async (studentData) => {
  try {
    if (!doc) {
      await initializeGoogleSheets();
    }

    if (!doc) {
      console.warn('Google Sheets not available, skipping...');
      return;
    }

    // Get or create the sheet
    let sheet = doc.sheetsByIndex[0];
    if (!sheet) {
      sheet = await doc.addSheet({ 
        title: 'Students',
        headerValues: [
          'Timestamp', 'Full Name', 'Email', 'Phone', 'Course', 'Format', 
          'Cohort', 'Payment Plan', 'Total Amount', 'Final Amount', 
          'Current Payment', 'Voucher Code', 'Payment Status', 'Transaction ID'
        ]
      });
    }

    // Add the student data
    await sheet.addRow({
      'Timestamp': new Date().toISOString(),
      'Full Name': studentData.fullName,
      'Email': studentData.email,
      'Phone': studentData.phone,
      'Course': studentData.courseName,
      'Format': studentData.classFormat,
      'Cohort': studentData.cohort,
      'Payment Plan': studentData.paymentPlan,
      'Total Amount': studentData.totalAmount,
      'Final Amount': studentData.finalAmount,
      'Current Payment': studentData.currentPayment,
      'Voucher Code': studentData.voucherCode || '',
      'Payment Status': studentData.paymentStatus,
      'Transaction ID': studentData.transactionId
    });

    console.log('✅ Student data added to Google Sheets');
  } catch (error) {
    console.error('❌ Google Sheets error:', error);
  }
};

module.exports = {
  initializeGoogleSheets,
  addToGoogleSheets
};