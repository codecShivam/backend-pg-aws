const pool = require("../config/db");

// Get user profile
const getProfile = async (req, res) => {
  try {
    // You could fetch additional user data from the database here
    // const result = await pool.query("SELECT * FROM users WHERE email = $1", [req.session.user.email]);
    
    res.json({
      message: "You are successfully logged in",
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// Check database connection
const checkDbConnection = async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: `PostgreSQL Connected: ${result.rows[0].now}` });
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
};

module.exports = { getProfile, checkDbConnection }; 