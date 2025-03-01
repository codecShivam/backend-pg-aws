// fetch all users

const express = require("express");
const router = express.Router();
const { getAllUsers } = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/auth");

// Get all users - protected route
router.get("/users", isAuthenticated, getAllUsers);

module.exports = router;
