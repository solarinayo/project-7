const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email templates
const templates = {
  'payment-confirmation': (data) => ({
    subject: 'Payment Confirmation - Jekacode Bootcamp',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #02033e;">Payment Confirmed!</h2>
        <p>Dear ${data.fullName},</p>
        <p>Your payment for <strong>${data.courseName}</strong> has been successfully processed.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Payment Details:</h3>
          <p><strong>Course:</strong> ${data.courseName}</p>
          <p><strong>Format:</strong> ${data.classFormat}</p>
          <p><strong>Cohort:</strong> ${data.cohort}</p>
          <p><strong>Amount Paid:</strong> ₦${data.currentPayment.toLocaleString()}</p>
          <p><strong>Payment Plan:</strong> ${data.paymentPlan}</p>
          ${data.paymentPlan !== 'full' ? `<p><strong>Progress:</strong> ${data.installmentProgress}</p>` : ''}
        </div>
        
        <p>Course materials will be available 1 week before your cohort start date.</p>
        <p>If you have any questions, please contact us at support@jekacode.com</p>
        
        <p>Best regards,<br>The Jekacode Team</p>
      </div>
    `
  }),

  'admin-notification': (data) => ({
    subject: 'New Student Enrollment - Jekacode',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #02033e;">New Student Enrollment</h2>
        <p>A new student has enrolled and completed payment:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Student Information:</h3>
          <p><strong>Name:</strong> ${data.fullName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Course:</strong> ${data.courseName}</p>
          <p><strong>Format:</strong> ${data.classFormat}</p>
          <p><strong>Cohort:</strong> ${data.cohort}</p>
          <p><strong>Payment Plan:</strong> ${data.paymentPlan}</p>
          <p><strong>Amount:</strong> ₦${data.finalAmount.toLocaleString()}</p>
          ${data.voucherCode ? `<p><strong>Voucher Used:</strong> ${data.voucherCode}</p>` : ''}
        </div>
        
        <p>Login to the admin panel to view full details.</p>
      </div>
    `
  }),

  'payment-reminder': (data) => ({
    subject: 'Payment Reminder - Jekacode Bootcamp',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #02033e;">Payment Reminder</h2>
        <p>Dear ${data.fullName},</p>
        <p>This is a friendly reminder about your upcoming payment for <strong>${data.courseName}</strong>.</p>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3>Payment Details:</h3>
          <p><strong>Progress:</strong> ${data.installmentProgress}</p>
          <p><strong>Next Payment Amount:</strong> ₦${data.getNextPaymentAmount().toLocaleString()}</p>
          <p><strong>Due Date:</strong> ${data.nextPaymentDue ? new Date(data.nextPaymentDue).toLocaleDateString() : 'Soon'}</p>
        </div>
        
        <p>Please ensure your payment is completed on time to avoid any disruption to your learning.</p>
        <p>If you have any questions, please contact us at support@jekacode.com</p>
        
        <p>Best regards,<br>The Jekacode Team</p>
      </div>
    `
  }),

  'bulk-message': (data) => ({
    subject: data.subject || 'Message from Jekacode',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #02033e;">Message from Jekacode</h2>
        <p>Dear ${data.fullName},</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${data.customMessage}
        </div>
        
        <p>Best regards,<br>The Jekacode Team</p>
      </div>
    `
  })
};

const sendEmail = async ({ to, subject, template, data }) => {
  try {
    const emailTemplate = templates[template];
    if (!emailTemplate) {
      throw new Error(`Template ${template} not found`);
    }

    const { subject: templateSubject, html } = emailTemplate(data);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: subject || templateSubject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

module.exports = {
  sendEmail
};