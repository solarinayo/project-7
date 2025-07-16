const express = require('express');
const { body, validationResult } = require('express-validator');
const Voucher = require('../models/Voucher');
const { authenticateAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all vouchers (Admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const vouchers = await Voucher.find()
      .sort({ createdAt: -1 })
      .populate('usedBy.studentId', 'fullName email');

    res.json(vouchers);
  } catch (error) {
    console.error('Get vouchers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new voucher (Admin only)
router.post('/', authenticateAdmin, [
  body('code').notEmpty().trim().toUpperCase(),
  body('discount').isNumeric().isFloat({ min: 1, max: 100 }),
  body('maxUsage').optional().isNumeric().isInt({ min: 1 }),
  body('validUntil').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, discount, maxUsage = 1, validUntil } = req.body;

    // Check if voucher code already exists
    const existingVoucher = await Voucher.findOne({ code });
    if (existingVoucher) {
      return res.status(400).json({ message: 'Voucher code already exists' });
    }

    const voucher = new Voucher({
      code,
      discount,
      maxUsage,
      validUntil: validUntil ? new Date(validUntil) : undefined
    });

    await voucher.save();

    res.status(201).json({
      message: 'Voucher created successfully',
      voucher
    });
  } catch (error) {
    console.error('Create voucher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update voucher (Admin only)
router.patch('/:id', authenticateAdmin, [
  body('discount').optional().isNumeric().isFloat({ min: 1, max: 100 }),
  body('isActive').optional().isBoolean(),
  body('maxUsage').optional().isNumeric().isInt({ min: 1 }),
  body('validUntil').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const voucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found' });
    }

    res.json({
      message: 'Voucher updated successfully',
      voucher
    });
  } catch (error) {
    console.error('Update voucher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete voucher (Admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);

    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found' });
    }

    res.json({ message: 'Voucher deleted successfully' });
  } catch (error) {
    console.error('Delete voucher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get voucher statistics (Admin only)
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalVouchers = await Voucher.countDocuments();
    const activeVouchers = await Voucher.countDocuments({ isActive: true });
    const usedVouchers = await Voucher.countDocuments({ usageCount: { $gt: 0 } });
    const expiredVouchers = await Voucher.countDocuments({ 
      validUntil: { $lt: new Date() } 
    });

    const topVouchers = await Voucher.find()
      .sort({ usageCount: -1 })
      .limit(5)
      .select('code discount usageCount');

    res.json({
      totalVouchers,
      activeVouchers,
      usedVouchers,
      expiredVouchers,
      topVouchers
    });
  } catch (error) {
    console.error('Voucher stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;