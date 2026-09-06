require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*'
}));
app.use(express.json({ limit: '10kb' }));

// Basic rate limiting so the form can't be spammed / abused
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

// ---------- Mail transporter ----------
// Uses Gmail + an App Password by default. See README.md for setup.
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ---------- Helpers ----------
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ---------- Routes ----------
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are all required.' });
    }
    if (name.length > 80 || message.length > 2000) {
      return res.status(400).json({ success: false, message: 'Input too long.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      replyTo: email,
      subject: `New portfolio message from ${name}`,
      html: `
        <div style="font-family: sans-serif; font-size: 15px; color: #222;">
          <h2>New message from your portfolio</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space:pre-wrap;">${safeMessage}</p>
        </div>
      `
    });

    return res.json({ success: true, message: 'Message sent successfully.' });
  } catch (err) {
    console.error('Error sending contact email:', err.message);
    return res.status(500).json({ success: false, message: 'Something went wrong while sending your message.' });
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio backend running on http://localhost:${PORT}`);
});
