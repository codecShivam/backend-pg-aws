const express = require("express");
const router = express.Router();
const { getProfile, checkDbConnection } = require("../controllers/profileController");
const { requireAuth } = require("../middleware/auth");

router.get("/profile", requireAuth, getProfile);
router.get("/api", checkDbConnection);

module.exports = router; 