const pool = require("../config/db");
const { generateOTP, getOtpExpiration } = require("../utils/otpUtils");
const ses = require("../config/aws");

// Send OTP to email
const sendOTP = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Generate OTP first
    const otp = generateOTP();
    const expiresAt = getOtpExpiration();

    // Then create email params with the generated OTP
    const params = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Text: {
            Data: `Your OTP is ${otp}. It will expire in 5 minutes.`,
          },
        },
        Subject: {
          Data: "Your OTP Code",
        },
      },
      Source: process.env.SENDER_EMAIL,
    };

    // First try to connect to database
    try {
      // Save OTP to database
      await pool.query(
        `INSERT INTO users (email, otp, otp_expires_at) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (email) 
         DO UPDATE SET otp = $2, otp_expires_at = $3`,
        [email, otp, expiresAt]
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      return res.status(500).json({ error: "Database connection failed" });
    }

    // Then try to send email
    try {
      // Send OTP via email
      await ses.sendEmail(params).promise();
      res.status(200).json({ message: "Email sent successfully!" });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      
      // If email fails, clean up the database entry
      try {
        await pool.query(
          `UPDATE users SET otp = NULL, otp_expires_at = NULL WHERE email = $1`,
          [email]
        );
      } catch (cleanupError) {
        console.error("Failed to clean up after email error:", cleanupError);
      }
      
      return res.status(500).json({ error: "Failed to send email" });
    }
  } catch (err) {
    console.error("Error in OTP process:", err);
    res.status(500).json({ error: "Failed to process OTP request" });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

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

    // Clear OTP after successful verification
    await pool.query(
      `UPDATE users SET otp = NULL, otp_expires_at = NULL WHERE email = $1`,
      [email]
    );

    req.session.user = { email };
    req.session.save();

    res.json({ message: "Login successful", email });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ error: "Verification failed" });
  }
};

// Logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.json({ message: "Logout successful" });
  });
};

module.exports = { sendOTP, verifyOTP, logout }; 