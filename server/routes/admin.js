const express = require('express');
const Student = require('../models/Student');
const Voucher = require('../models/Voucher');
const { authenticateAdmin } = require('../middleware/auth');
const router = express.Router();

// Dashboard analytics
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    // Basic stats
    const totalStudents = await Student.countDocuments();
    const totalRevenue = await Student.aggregate([
      { $match: { paymentStatus: { $in: ['completed', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);

    // Course breakdown
    const courseStats = await Student.aggregate([
      { $group: { _id: '$courseName', count: { $sum: 1 }, revenue: { $sum: '$finalAmount' } } },
      { $sort: { count: -1 } }
    ]);

    // Payment plan breakdown
    const paymentPlanStats = await Student.aggregate([
      { $group: { _id: '$paymentPlan', count: { $sum: 1 } } }
    ]);

    // Monthly enrollment trend
    const monthlyEnrollments = await Student.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$enrollmentDate' },
            month: { $month: '$enrollmentDate' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$finalAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Voucher usage stats
    const voucherStats = await Voucher.aggregate([
      {
        $group: {
          _id: null,
          totalVouchers: { $sum: 1 },
          activeVouchers: { $sum: { $cond: ['$isActive', 1, 0] } },
          usedVouchers: { $sum: { $cond: [{ $gt: ['$usageCount', 0] }, 1, 0] } }
        }
      }
    ]);

    // Recent activities
    const recentEnrollments = await Student.find()
      .sort({ enrollmentDate: -1 })
      .limit(10)
      .select('fullName courseName enrollmentDate paymentStatus finalAmount');

    res.json({
      overview: {
        totalStudents,
        totalRevenue: totalRevenue[0]?.total || 0,
        averageRevenue: totalStudents > 0 ? Math.round((totalRevenue[0]?.total || 0) / totalStudents) : 0,
        completionRate: totalStudents > 0 ? Math.round((await Student.countDocuments({ paymentStatus: 'completed' }) / totalStudents) * 100) : 0
      },
      courseStats,
      paymentPlanStats,
      monthlyEnrollments,
      voucherStats: voucherStats[0] || { totalVouchers: 0, activeVouchers: 0, usedVouchers: 0 },
      recentEnrollments
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system health
router.get('/health', authenticateAdmin, async (req, res) => {
  try {
    const dbStatus = await Student.countDocuments() >= 0 ? 'connected' : 'disconnected';
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;