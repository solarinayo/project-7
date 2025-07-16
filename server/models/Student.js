const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    // ✅ ADDED: A unique, required ID for each applicant
    applicantId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    highestAchievement: { type: String },
    ageRange: { type: String },
    country: { type: String },
    state: { type: String },
    courseId: { type: String, required: true },
    courseName: { type: String, required: true },
    classFormat: { type: String, required: true },
    cohort: { type: String, required: true },
    paymentPlan: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    currentPayment: { type: Number, required: true },
    voucherCode: { type: String },
    paystackReference: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "completed", "failed"],
      default: "pending",
    },
    enrollmentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Add indexes for faster queries
studentSchema.index({ email: 1 });
studentSchema.index({ applicantId: 1 });

module.exports = mongoose.model("Student", studentSchema);
