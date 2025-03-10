const { db } = require("../db");
const { users } = require("../db/schema/index.ts");
const { eq, sql } = require("drizzle-orm");
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
      // Save OTP to database using Drizzle
      await db
        .insert(users)
        .values({
          email,
          otp,
          otpExpiresAt: expiresAt
        })
        .onConflictDoUpdate({
          target: users.email,
          set: {
            otp,
            otpExpiresAt: expiresAt
          }
        });
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
        await db
          .update(users)
          .set({
            otp: null,
            otpExpiresAt: null
          })
          .where(eq(users.email, email));
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
    // Add debugging
    console.log(`Verifying OTP for email: ${email}, OTP: ${otp}`);
    
    const result = await db
      .select({
        storedOTP: users.otp,
        otpExpiresAt: users.otpExpiresAt
      })
      .from(users)
      .where(eq(users.email, email));

    if (result.length === 0) {
      console.log(`Email not found: ${email}`);
      return res.status(400).json({ error: "Email not found" });
    }

    const { storedOTP, otpExpiresAt } = result[0];
    const currentTime = new Date();
    
    // Debug timestamps
    console.log(`Stored OTP: ${storedOTP}`);
    console.log(`Expiration time: ${otpExpiresAt}`);
    console.log(`Current time: ${currentTime}`);
    console.log(`Is expired: ${otpExpiresAt < currentTime}`);

    if (!storedOTP) {
      console.log('No OTP stored for this email');
      return res.status(400).json({ error: "OTP expired or not sent" });
    }
    
    if (otpExpiresAt < currentTime) {
      console.log('OTP has expired');
      return res.status(400).json({ error: "OTP expired" });
    }

    if (storedOTP !== otp) {
      console.log(`OTP mismatch. Expected: ${storedOTP}, Received: ${otp}`);
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Clear OTP after successful verification
    await db
      .update(users)
      .set({
        otp: null,
        otpExpiresAt: null
      })
      .where(eq(users.email, email));

    req.session.user = { email };
    req.session.save();

    console.log(`Login successful for: ${email}`);
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