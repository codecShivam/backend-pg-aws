const crypto = require("crypto");

// Generate 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Calculate OTP expiration time (15 minutes)
function getOtpExpiration() {
  return new Date(Date.now() + 15 * 60 * 1000);
}

module.exports = { generateOTP, getOtpExpiration }; 