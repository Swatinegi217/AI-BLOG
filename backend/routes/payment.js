const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();
const authMiddleware = require('../utils/authMiddleware');
// const User = require('../models/User'); // Uncomment if using

require('dotenv').config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Razorpay Order — ₹699
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const options = {
      amount: 69900, // ₹699 in paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
    
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

// ✅ Verify Razorpay Payment
router.post('/verify', authMiddleware, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    // ✅ Optional: Mark user as subscribed in DB
    // await User.findByIdAndUpdate(req.user.id, { isSubscribed: true });

    return res.json({ success: true });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }
});

module.exports = router;
