const { db } = require("../db");
const { users } = require("../db/schema/index.ts");
const { eq, sql } = require("drizzle-orm");
const { getPublicUrl } = require("../config/s3");

// Get user profile
const getProfile = async (req, res) => {
  try {
    // Fetch user profile using Drizzle
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        profileImageUrl: users.profileImageUrl,
        bio: users.bio,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.email, req.session.user.email))
      .limit(1);
    
    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Get the user data
    const userData = result[0];
    
    // If there's a profile image URL, get the signed URL
    if (userData.profileImageUrl) {
      // Extract the filename from the stored URL
      const pathParts = userData.profileImageUrl.split('/');
      const filename = pathParts[pathParts.length - 1];
      
      // Get the signed URL from S3
      userData.profileImageUrl = await getPublicUrl(filename, userData.email);
    }
    
    res.json({
      message: "Profile retrieved successfully",
      user: userData
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    
    // Fallback to basic profile if there's an error
    try {
      const basicResult = await db
        .select({
          id: users.id,
          email: users.email,
          createdAt: users.createdAt
        })
        .from(users)
        .where(eq(users.email, req.session.user.email))
        .limit(1);
      
      if (basicResult.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({
        message: "Basic profile retrieved successfully",
        user: basicResult[0]
      });
    } catch (fallbackErr) {
      console.error("Error fetching basic profile:", fallbackErr);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  const { username, fullName, bio } = req.body;
  const email = req.session.user.email;
  
  try {
    // Check if username is already taken (if provided)
    if (username) {
      const usernameCheck = await db
        .select({ id: users.id })
        .from(users)
        .where(sql`${users.username} = ${username} AND ${users.email} != ${email}`);
      
      if (usernameCheck.length > 0) {
        return res.status(400).json({ error: "Username already taken" });
      }
    }
    
    // Update user profile with Drizzle
    const updateValues = {};
    if (username) updateValues.username = username;
    if (fullName) updateValues.fullName = fullName;
    if (bio !== undefined) updateValues.bio = bio;
    updateValues.updatedAt = new Date();
    
    await db
      .update(users)
      .set(updateValues)
      .where(eq(users.email, email));
    
    // Fetch updated user data
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        profileImageUrl: users.profileImageUrl,
        bio: users.bio,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    // Get the user data
    const userData = result[0];
    
    // If there's a profile image URL, get the signed URL
    if (userData.profileImageUrl) {
      // Extract the filename from the stored URL
      const pathParts = userData.profileImageUrl.split('/');
      const filename = pathParts[pathParts.length - 1];
      
      // Get the signed URL from S3
      userData.profileImageUrl = await getPublicUrl(filename, userData.email);
    }
    
    res.json({
      message: "Profile updated successfully",
      user: userData
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Upload profile image
const uploadProfileImage = async (req, res) => {
  try {
    // req.file is available because of multer middleware
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    const email = req.session.user.email;
    
    // For S3 storage, the key is stored in req.file.key
    const s3Key = req.file.key;
    // Extract just the filename from the key
    const filename = s3Key.split('/').pop();
    
    // Store just the filename in the database
    // This makes it easier to generate signed URLs later
    const imageUrl = filename;
    
    // Update profile image URL in database using Drizzle
    await db
      .update(users)
      .set({
        profileImageUrl: imageUrl,
        updatedAt: new Date()
      })
      .where(eq(users.email, email));
    
    // Fetch updated user data
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        profileImageUrl: users.profileImageUrl,
        bio: users.bio,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    // Get the user data
    const userData = result[0];
    
    // Generate a signed URL for the uploaded image
    userData.profileImageUrl = await getPublicUrl(filename, email);
    
    res.json({
      message: "Profile image updated successfully",
      user: userData
    });
  } catch (err) {
    console.error("Error updating profile image:", err);
    res.status(500).json({ error: err.message || "Failed to update profile image" });
  }
};

// Check database connection
const checkDbConnection = async (req, res) => {
  try {
    const result = await db.execute(sql`SELECT NOW()`);
    res.json({ message: `PostgreSQL Connected: ${result[0].now}` });
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
};

module.exports = { 
  getProfile, 
  updateProfile, 
  uploadProfileImage, 
  checkDbConnection 
}; 