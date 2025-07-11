const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");



const router = express.Router();

require('dotenv').config();


// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10); // ✅ hash password
    const newUser = new User({ name, email, password: passwordHash }); // ✅ use `password`

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Send email verification code
router.post('/send-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Blog AI" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      html: `<h2>🔐 Your Verification Code</h2><p>Use this code to complete signup:</p><h3>${code}</h3>`,
    });

    res.json({ message: "Code sent", code }); // Don't send code in production!
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    res.status(500).json({ message: "Email failed to send" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("👉 Login req.body:", req.body);

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    return res.status(400).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, existingUser.password); // ✅ fix here

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token });
});

module.exports = router;