const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 100 // Percentage
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  maxUsage: {
    type: Number,
    default: 1 // One-time use by default
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from creation
  },
  createdBy: {
    type: String,
    default: 'admin'
  },
  usedBy: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster lookups
voucherSchema.index({ code: 1 });
voucherSchema.index({ isActive: 1 });
voucherSchema.index({ validUntil: 1 });

// Method to check if voucher is valid
voucherSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive && 
         this.usageCount < this.maxUsage && 
         now >= this.validFrom && 
         now <= this.validUntil;
};

// Method to use voucher
voucherSchema.methods.use = function(studentId) {
  if (!this.isValid()) {
    throw new Error('Voucher is not valid');
  }
  
  this.usageCount += 1;
  this.usedBy.push({ studentId });
  
  if (this.usageCount >= this.maxUsage) {
    this.isActive = false;
  }
  
  return this.save();
};

module.exports = mongoose.model('Voucher', voucherSchema);