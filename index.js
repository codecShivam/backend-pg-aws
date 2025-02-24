const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON body

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Nodemailer Transporter (for sending emails)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

  try {
    await pool.query(
      `INSERT INTO users (email, otp, otp_expires_at) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (email) 
         DO UPDATE SET otp = $2, otp_expires_at = $3`,
      [email, otp, expiresAt]
    );

    // Send OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// API to verify OTP
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const result = await pool.query(
      `SELECT otp, otp_expires_at FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Email not found" });
    }

    const { otp: storedOTP, otp_expires_at } = result.rows[0];

    if (!storedOTP || otp_expires_at < new Date()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (storedOTP !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
});

app.get("/api", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: `PostgreSQL Connected: ${result.rows[0].now}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
