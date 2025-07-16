const express = require("express");
const { body, validationResult } = require("express-validator");
const Student = require("../models/Student");
const { sendEmail } = require("../utils/email");
const router = express.Router();

const COURSE_PREFIXES = {
  frontend: "FRONT",
  backend: "BACK",
  cybersecurity: "CYBER",
  web3: "WEB3",
  data_analysis: "DATA",
  ui_ux: "UIUX",
};

// ✅ UPDATED: The main endpoint for creating a new student enrollment
router.post(
  "/enroll",
  [
    body("email").isEmail().normalizeEmail(),
    body("fullName").notEmpty().trim(),
    body("courseId").notEmpty(),
    body("paystackReference").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const studentData = req.body;

      const existingStudent = await Student.findOne({
        email: studentData.email,
      });
      if (existingStudent) {
        return res
          .status(400)
          .json({ message: "A student with this email has already enrolled." });
      }

      // --- Generate Unique Applicant ID ---
      const prefix = COURSE_PREFIXES[studentData.courseId] || "GEN";
      // Atomically find and update a counter document, or create if it doesn't exist
      const count = await Student.countDocuments({
        courseId: studentData.courseId,
      });
      const applicantId = `${prefix}${(count + 1).toString().padStart(3, "0")}`;

      const student = new Student({
        ...studentData,
        applicantId: applicantId,
        enrollmentDate: new Date(),
        paymentStatus:
          studentData.paymentPlan === "full" ? "completed" : "partial",
      });

      await student.save();

      // --- Send Emails Asynchronously ---
      sendEmail({
        to: student.email,
        template: "payment-confirmation",
        data: student.toObject(),
      });
      sendEmail({
        to: process.env.ADMIN_EMAIL,
        template: "admin-notification",
        data: student.toObject(),
      });

      res.status(201).json({
        success: true,
        message: "Enrollment successful!",
        student: student.toObject(),
      });
    } catch (error) {
      console.error("Enrollment Error:", error);
      res.status(500).json({ message: "An error occurred during enrollment." });
    }
  }
);

// ... your other routes (GET, PATCH, etc.) remain here ...

module.exports = router;
