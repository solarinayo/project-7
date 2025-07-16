const express = require("express");
const { body, validationResult } = require("express-validator");
const Student = require("../models/Student");
const { sendEmail } = require("../utils/email");
const { addToGoogleSheets } = require("../utils/googleSheets");
const router = express.Router();

const COURSE_PREFIXES = {
  frontend: "FRONT",
  backend: "BACK",
  cybersecurity: "CYBER",
  web3: "WEB3",
  data_analysis: "DATA",
  ui_ux: "UIUX",
};

router.post(
  "/enroll",
  [
    body("email").isEmail().withMessage("A valid email is required."),
    body("fullName").notEmpty().withMessage("Full name is required."),
    body("paystackReference")
      .notEmpty()
      .withMessage("Paystack reference is missing."),
  ],
  async (req, res) => {
    console.log("✅ Received enrollment request on backend:", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("❌ Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const studentData = req.body;
      const existingStudent = await Student.findOne({
        email: studentData.email,
      });
      if (existingStudent) {
        console.warn(
          `⚠️ Attempt to enroll with existing email: ${studentData.email}`
        );
        return res.status(409).json({
          message:
            "This email address has already been used for an enrollment.",
        });
      }

      const prefix = COURSE_PREFIXES[studentData.courseId] || "GEN";
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

      const savedStudent = await student.save();
      console.log(`✅ Student ${applicantId} saved to MongoDB.`);

      // --- Trigger background tasks without waiting ---
      sendEmail({
        to: savedStudent.email,
        template: "payment-confirmation",
        data: savedStudent.toObject(),
      });
      sendEmail({
        to: process.env.ADMIN_EMAIL,
        template: "admin-notification",
        data: savedStudent.toObject(),
      });
      addToGoogleSheets(savedStudent.toObject());

      res.status(201).json({
        success: true,
        message: "Enrollment successful!",
        student: savedStudent.toObject(),
      });
    } catch (error) {
      console.error("❌ Enrollment Error on Server:", error);
      res.status(500).json({
        message: "An internal server error occurred during enrollment.",
      });
    }
  }
);

module.exports = router;
