const express = require("express");
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  uploadProfileImage,
  checkDbConnection 
} = require("../controllers/profileController");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../config/s3");

// Profile routes
router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);

// File upload route - using multer middleware
router.post("/profile/image", requireAuth, upload.single('profileImage'), uploadProfileImage);

// API health check
router.get("/api", checkDbConnection);

module.exports = router; 