const express = require('express');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const Voucher = require('../models/Voucher');
const { sendEmail } = require('../utils/email');
const { addToGoogleSheets } = require('../utils/googleSheets');
const { verifyPaystackPayment } = require('../utils/paystack');
const router = express.Router();

// Course pricing configuration
const COURSES = {
  frontend: { name: 'Web Dev (Frontend)', virtualPrice: 100000, physicalPrice: 150000 },
  backend: { name: 'Web Dev (Backend)', virtualPrice: 150000, physicalPrice: 200000 },
  cybersecurity: { name: 'Cybersecurity', virtualPrice: 200000, physicalPrice: 250000 },
  web3: { name: 'Web3', virtualPrice: 100000, physicalPrice: 150000 },
  data_analysis: { name: 'Data Analysis', virtualPrice: 200000, physicalPrice: 250000 },
  ui_ux: { name: 'Product Design (UI/UX)', virtualPrice: 150000, physicalPrice: 180000 }
};

// Validate voucher code
router.post('/validate-voucher', [
  body('code').notEmpty().trim().toUpperCase()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code } = req.body;
    const voucher = await Voucher.findOne({ code });

    if (!voucher || !voucher.isValid()) {
      return res.status(404).json({ valid: false, message: 'Invalid or expired voucher' });
    }

    res.json({
      valid: true,
      discount: voucher.discount,
      code: voucher.code
    });
  } catch (error) {
    console.error('Voucher validation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Calculate payment amount
router.post('/calculate', [
  body('courseId').isIn(Object.keys(COURSES)),
  body('classFormat').isIn(['virtual', 'physical']),
  body('paymentPlan').isIn(['full', 'installment_2', 'installment_3']),
  body('voucherCode').optional().trim().toUpperCase()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId, classFormat, paymentPlan, voucherCode } = req.body;
    const course = COURSES[courseId];
    const basePrice = classFormat === 'virtual' ? course.virtualPrice : course.physicalPrice;

    let discountAmount = 0;
    if (voucherCode) {
      const voucher = await Voucher.findOne({ code: voucherCode });
      if (voucher && voucher.isValid()) {
        discountAmount = Math.round(basePrice * (voucher.discount / 100));
      }
    }

    const finalAmount = basePrice - discountAmount;
    let currentPayment = finalAmount;
    let totalInstallments = 1;

    if (paymentPlan === 'installment_2') {
      currentPayment = Math.round(finalAmount * 0.5);
      totalInstallments = 2;
    } else if (paymentPlan === 'installment_3') {
      currentPayment = Math.round(finalAmount * 0.34);
      totalInstallments = 3;
    }

    res.json({
      totalAmount: basePrice,
      discountAmount,
      finalAmount,
      currentPayment,
      totalInstallments,
      courseName: course.name
    });
  } catch (error) {
    console.error('Payment calculation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize payment
router.post('/initialize', [
  body('fullName').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').notEmpty().trim(),
  body('courseId').isIn(Object.keys(COURSES)),
  body('classFormat').isIn(['virtual', 'physical']),
  body('paymentPlan').isIn(['full', 'installment_2', 'installment_3']),
  body('cohort').notEmpty().trim(),
  body('amount').isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const studentData = req.body;
    const course = COURSES[studentData.courseId];

    // Check if student already exists
    const existingStudent = await Student.findOne({ email: studentData.email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }

    // Calculate payment details
    const calculation = await calculatePayment(studentData);
    
    // Create student record
    const student = new Student({
      ...studentData,
      courseName: course.name,
      ...calculation,
      transactionId: `JKC${Date.now()}`,
      totalInstallments: calculation.totalInstallments,
      installmentProgress: `0 of ${calculation.totalInstallments}`
    });

    await student.save();

    // In a real implementation, you would integrate with Paystack here
    // For now, we'll simulate a successful payment
    const paystackResponse = {
      status: true,
      data: {
        authorization_url: `https://checkout.paystack.com/simulate-${student._id}`,
        access_code: `access_code_${student._id}`,
        reference: `ref_${Date.now()}`
      }
    };

    res.json({
      success: true,
      studentId: student._id,
      paymentUrl: paystackResponse.data.authorization_url,
      reference: paystackResponse.data.reference
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify payment (Paystack webhook)
router.post('/verify', async (req, res) => {
  try {
    const { reference, studentId } = req.body;

    // In production, verify the payment with Paystack
    // const verification = await verifyPaystackPayment(reference);

    // For demo purposes, we'll simulate successful verification
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update payment status
    student.updatePaymentProgress();
    student.paystackReference = reference;
    await student.save();

    // Use voucher if provided
    if (student.voucherCode) {
      const voucher = await Voucher.findOne({ code: student.voucherCode });
      if (voucher) {
        await voucher.use(student._id);
      }
    }

    // Send confirmation emails
    await sendConfirmationEmails(student);

    // Add to Google Sheets
    await addToGoogleSheets(student);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      student: {
        id: student._id,
        name: student.fullName,
        course: student.courseName,
        paymentStatus: student.paymentStatus
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate payment
async function calculatePayment(data) {
  const course = COURSES[data.courseId];
  const basePrice = data.classFormat === 'virtual' ? course.virtualPrice : course.physicalPrice;

  let discountAmount = 0;
  if (data.voucherCode) {
    const voucher = await Voucher.findOne({ code: data.voucherCode });
    if (voucher && voucher.isValid()) {
      discountAmount = Math.round(basePrice * (voucher.discount / 100));
    }
  }

  const finalAmount = basePrice - discountAmount;
  let currentPayment = finalAmount;
  let totalInstallments = 1;

  if (data.paymentPlan === 'installment_2') {
    currentPayment = Math.round(finalAmount * 0.5);
    totalInstallments = 2;
  } else if (data.paymentPlan === 'installment_3') {
    currentPayment = Math.round(finalAmount * 0.34);
    totalInstallments = 3;
  }

  return {
    totalAmount: basePrice,
    discountAmount,
    finalAmount,
    currentPayment,
    totalInstallments
  };
}

// Helper function to send confirmation emails
async function sendConfirmationEmails(student) {
  try {
    // Email to student
    await sendEmail({
      to: student.email,
      subject: 'Payment Confirmation - Jekacode Bootcamp',
      template: 'payment-confirmation',
      data: student
    });

    // Email to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: 'New Student Enrollment - Jekacode',
      template: 'admin-notification',
      data: student
    });
  } catch (error) {
    console.error('Email sending error:', error);
  }
}

module.exports = router;