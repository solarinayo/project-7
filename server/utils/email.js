const nodemailer = require("nodemailer");

// ✅ FIX: The transporter is now created correctly.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "jekacode.africa",
  port: parseInt(process.env.SMTP_PORT || "465", 10),
  secure: true, // Port 465 requires a secure connection
  auth: {
    user: process.env.SMTP_USER, // Your cohort email
    pass: process.env.SMTP_PASS, // Your email password
  },
  // Add this to prevent errors with self-signed certificates if needed
  tls: {
    rejectUnauthorized: false,
  },
});

// Email templates with applicant details
const templates = {
  "payment-confirmation": (data) => ({
    subject: `[${data.applicantId}] Your Jekacode Enrollment is Confirmed!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
        <h2 style="color: #02033e;">Welcome to the Bootcamp, ${
          data.fullName
        }!</h2>
        <p>Your enrollment for <strong>${
          data.courseName
        }</strong> is confirmed. We're excited to have you.</p>
        <p>Your unique Applicant ID is: <strong>${
          data.applicantId
        }</strong>. Please keep this for your records.</p>
        
        <div style="background: #f4f4f7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Enrollment Summary:</h3>
          <p><strong>Applicant ID:</strong> ${data.applicantId}</p>
          <p><strong>Course:</strong> ${data.courseName}</p>
          <p><strong>Amount Paid:</strong> ₦${(
            data.currentPayment || 0
          ).toLocaleString()}</p>
          <p><strong>Paystack Ref:</strong> ${data.paystackReference}</p>
        </div>
        <p>We'll be in touch with next steps. If you have questions, contact us at support@jekacode.com.</p>
        <p>Best regards,<br>The Jekacode Team</p>
      </div>
    `,
  }),

  "admin-notification": (data) => ({
    subject: `New Enrollment: ${data.fullName} (${data.applicantId})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
        <h2 style="color: #02033e;">New Student Enrollment</h2>
        <p>A new student has enrolled and completed payment:</p>
        <div style="background: #f4f4f7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Applicant ID:</strong> ${data.applicantId}</p>
          <p><strong>Name:</strong> ${data.fullName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <hr style="margin: 10px 0;">
          <p><strong>Course:</strong> ${data.courseName}</p>
          <p><strong>Amount Paid:</strong> ₦${(
            data.currentPayment || 0
          ).toLocaleString()}</p>
          <p><strong>Paystack Ref:</strong> ${data.paystackReference}</p>
        </div>
        <p>Login to the admin panel to view full details.</p>
      </div>
    `,
  }),
};

const sendEmail = async ({ to, subject, template, data }) => {
  try {
    const emailTemplate = templates[template];
    if (!emailTemplate) {
      throw new Error(`Email template "${template}" not found.`);
    }

    const { subject: templateSubject, html } = emailTemplate(data);

    const mailOptions = {
      from: `"Jekacode Cohorts" <${process.env.SMTP_USER}>`,
      to,
      subject: subject || templateSubject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    // Don't re-throw to avoid crashing the main process
  }
};

module.exports = { sendEmail };
