const pool = require("../config/db");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    // Only return email and created_at, not sensitive data like OTP
    const result = await pool.query(
      `SELECT email, created_at FROM users ORDER BY created_at DESC`
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

module.exports = { getAllUsers };