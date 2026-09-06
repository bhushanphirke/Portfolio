require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const rateLimit = require('express-rate-limit');
const resend = new Resend(process.env.RESEND_API_KEY);
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

   const { data, error } = await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'bhushanphirke314@gmail.com',
  replyTo: email,
  subject: `New portfolio message from ${name}`,
  html: `
    <h2>New message from your portfolio</h2>
    <p><strong>Name:</strong> ${safeName}</p>
    <p><strong>Email:</strong> ${safeEmail}</p>
    <p><strong>Message:</strong></p>
    <p>${safeMessage}</p>
  `
});

if (error) {
  console.error('Resend error:', error);
  return res.status(500).json({
    success: false,
    message: 'Email could not be sent.'
  });
}

    return res.json({ success: true, message: 'Message sent successfully.' });
  } catch (err) {
    console.error('Error sending contact email:', err.message);
    return res.status(500).json({ success: false, message: 'Something went wrong while sending your message.' });
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio backend running on http://localhost:${PORT}`);
});
