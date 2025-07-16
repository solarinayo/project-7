// ✅ FIX: Load environment variables at the absolute start of the application
require("./config");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// --- Import your routes ---
const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payments");
const studentRoutes = require("./routes/students");
const voucherRoutes = require("./routes/vouchers");
const adminRoutes = require("./routes/admin");
const { initializeGoogleSheets } = require("./utils/googleSheets");

const app = express();

// --- Middleware Setup ---
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-production-domain.com"]
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use(limiter);

// --- MongoDB Connection ---
// The MONGODB_URI will now be correctly loaded
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    // Initialize Google Sheets after a successful DB connection
    initializeGoogleSheets();
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// --- Start Server ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
});
