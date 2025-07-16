const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  highestAchievement: {
    type: String,
    enum: ['High School', 'Diploma', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Professional Certificate'],
    default: 'High School'
  },
  ageRange: {
    type: String,
    enum: ['16-20', '21-25', '26-30', '31-35', '36-40', '41+'],
    default: '21-25'
  },
  country: {
    type: String,
    default: 'Nigeria'
  },
  state: {
    type: String,
    default: 'Lagos'
  },

  // Course Information
  courseId: {
    type: String,
    required: true,
    enum: ['frontend', 'backend', 'cybersecurity', 'web3', 'data_analysis', 'ui_ux']
  },
  courseName: {
    type: String,
    required: true
  },
  classFormat: {
    type: String,
    required: true,
    enum: ['virtual', 'physical']
  },
  cohort: {
    type: String,
    required: true
  },

  // Payment Information
  paymentPlan: {
    type: String,
    required: true,
    enum: ['full', 'installment_2', 'installment_3']
  },
  totalAmount: {
    type: Number,
    required: true
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  currentPayment: {
    type: Number,
    required: true
  },
  voucherCode: {
    type: String,
    default: ''
  },

  // Payment Status
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed', 'failed'],
    default: 'pending'
  },
  installmentProgress: {
    type: String,
    default: '0 of 1'
  },
  paymentsCompleted: {
    type: Number,
    default: 0
  },
  totalInstallments: {
    type: Number,
    default: 1
  },

  // Transaction Information
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paystackReference: {
    type: String,
    unique: true,
    sparse: true
  },

  // Timestamps
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  lastPaymentDate: {
    type: Date
  },
  nextPaymentDue: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
studentSchema.index({ email: 1 });
studentSchema.index({ courseId: 1 });
studentSchema.index({ cohort: 1 });
studentSchema.index({ paymentStatus: 1 });
studentSchema.index({ enrollmentDate: -1 });

// Virtual for full name search
studentSchema.virtual('searchName').get(function() {
  return this.fullName.toLowerCase();
});

// Method to calculate next payment amount
studentSchema.methods.getNextPaymentAmount = function() {
  if (this.paymentPlan === 'full') return 0;
  
  const remaining = this.finalAmount - (this.currentPayment * this.paymentsCompleted);
  const installmentsLeft = this.totalInstallments - this.paymentsCompleted;
  
  return Math.round(remaining / installmentsLeft);
};

// Method to update payment progress
studentSchema.methods.updatePaymentProgress = function() {
  this.paymentsCompleted += 1;
  this.installmentProgress = `${this.paymentsCompleted} of ${this.totalInstallments}`;
  
  if (this.paymentsCompleted >= this.totalInstallments) {
    this.paymentStatus = 'completed';
  } else {
    this.paymentStatus = 'partial';
    // Set next payment due date (30 days from now)
    this.nextPaymentDue = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  this.lastPaymentDate = new Date();
};

module.exports = mongoose.model('Student', studentSchema);