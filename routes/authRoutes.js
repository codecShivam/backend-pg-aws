const express = require("express");
const router = express.Router();
const { sendOTP, verifyOTP, logout } = require("../controllers/authController");

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/logout", logout);

module.exports = router; 