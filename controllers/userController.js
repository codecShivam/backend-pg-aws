const { db } = require("../db");
const { users } = require("../db/schema/index.ts");
const { desc } = require("drizzle-orm");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    // Only return email and created_at, not sensitive data like OTP
    const result = await db
      .select({
        email: users.email,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(desc(users.createdAt));
    
    res.json(result);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

module.exports = { getAllUsers };