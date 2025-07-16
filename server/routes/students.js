const express = require('express');
const Student = require('../models/Student');
const { authenticateAdmin } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');
const router = express.Router();

// Get all students (Admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      course,
      cohort,
      format,
      paymentPlan,
      paymentStatus,
      search
    } = req.query;

    const query = {};

    // Apply filters
    if (course) query.courseId = course;
    if (cohort) query.cohort = cohort;
    if (format) query.classFormat = format;
    if (paymentPlan) query.paymentPlan = paymentPlan;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query)
      .sort({ enrollmentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(query);

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student by ID
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student status
router.patch('/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'partial', 'completed', 'failed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: status },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Status updated successfully', student });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send email to student
router.post('/:id/send-email', authenticateAdmin, async (req, res) => {
  try {
    const { type, message } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let subject, template;
    switch (type) {
      case 'reminder':
        subject = 'Payment Reminder - Jekacode Bootcamp';
        template = 'payment-reminder';
        break;
      case 'welcome':
        subject = 'Welcome to Jekacode Bootcamp';
        template = 'welcome';
        break;
      case 'custom':
        subject = 'Message from Jekacode';
        template = 'custom';
        break;
      default:
        return res.status(400).json({ message: 'Invalid email type' });
    }

    await sendEmail({
      to: student.email,
      subject,
      template,
      data: { ...student.toObject(), customMessage: message }
    });

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send bulk email to cohort
router.post('/bulk-email', authenticateAdmin, async (req, res) => {
  try {
    const { cohort, subject, message } = req.body;

    const students = await Student.find({ cohort });
    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found in this cohort' });
    }

    const emailPromises = students.map(student =>
      sendEmail({
        to: student.email,
        subject,
        template: 'bulk-message',
        data: { ...student.toObject(), customMessage: message }
      })
    );

    await Promise.all(emailPromises);

    res.json({ 
      message: `Bulk email sent to ${students.length} students`,
      count: students.length 
    });
  } catch (error) {
    console.error('Bulk email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get analytics data
router.get('/analytics/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalRevenue = await Student.aggregate([
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);

    const courseBreakdown = await Student.aggregate([
      { $group: { _id: '$courseName', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const paymentStatusBreakdown = await Student.aggregate([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
    ]);

    const recentEnrollments = await Student.find()
      .sort({ enrollmentDate: -1 })
      .limit(10)
      .select('fullName courseName enrollmentDate paymentStatus');

    res.json({
      totalStudents,
      totalRevenue: totalRevenue[0]?.total || 0,
      courseBreakdown,
      paymentStatusBreakdown,
      recentEnrollments
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export students data
router.get('/export/csv', authenticateAdmin, async (req, res) => {
  try {
    const students = await Student.find().sort({ enrollmentDate: -1 });
    
    const csvHeader = [
      'Name', 'Email', 'Phone', 'Course', 'Format', 'Cohort', 
      'Payment Plan', 'Total Amount', 'Final Amount', 'Payment Status', 
      'Enrollment Date'
    ].join(',');

    const csvData = students.map(student => [
      student.fullName,
      student.email,
      student.phone,
      student.courseName,
      student.classFormat,
      student.cohort,
      student.paymentPlan,
      student.totalAmount,
      student.finalAmount,
      student.paymentStatus,
      student.enrollmentDate.toISOString().split('T')[0]
    ].join(',')).join('\n');

    const csv = csvHeader + '\n' + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;