const pool = require("../config/db");
const { getPublicUrl } = require("../config/s3");

// Get user profile
const getProfile = async (req, res) => {
  try {
    // Fetch user profile with a more resilient query that works even if columns are missing
    const result = await pool.query(
      `SELECT id, email, 
        CASE WHEN EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='username'
        ) THEN username ELSE NULL END as username,
        CASE WHEN EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='full_name'
        ) THEN full_name ELSE NULL END as full_name,
        CASE WHEN EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='profile_image_url'
        ) THEN profile_image_url ELSE NULL END as profile_image_url,
        CASE WHEN EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='bio'
        ) THEN bio ELSE NULL END as bio,
        created_at
      FROM users WHERE email = $1`,
      [req.session.user.email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Get the user data
    const userData = result.rows[0];
    
    // If there's a profile image URL, get the signed URL
    if (userData.profile_image_url) {
      // Extract the filename from the stored URL
      const pathParts = userData.profile_image_url.split('/');
      const filename = pathParts[pathParts.length - 1];
      
      // Get the signed URL from S3
      userData.profile_image_url = await getPublicUrl(filename, userData.email);
    }
    
    res.json({
      message: "Profile retrieved successfully",
      user: userData
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    
    // Fallback to basic profile if there's an error
    try {
      const basicResult = await pool.query(
        `SELECT id, email, created_at FROM users WHERE email = $1`,
        [req.session.user.email]
      );
      
      if (basicResult.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({
        message: "Basic profile retrieved successfully",
        user: basicResult.rows[0]
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
      const usernameCheck = await pool.query(
        "SELECT id FROM users WHERE username = $1 AND email != $2",
        [username, email]
      );
      
      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({ error: "Username already taken" });
      }
    }
    
    // Update user profile
    const result = await pool.query(
      `UPDATE users 
       SET username = COALESCE($1, username),
           full_name = COALESCE($2, full_name),
           bio = COALESCE($3, bio),
           updated_at = NOW()
       WHERE email = $4
       RETURNING id, email, username, full_name, profile_image_url, bio, created_at`,
      [username, fullName, bio, email]
    );
    
    // Get the user data
    const userData = result.rows[0];
    
    // If there's a profile image URL, get the signed URL
    if (userData.profile_image_url) {
      // Extract the filename from the stored URL
      const pathParts = userData.profile_image_url.split('/');
      const filename = pathParts[pathParts.length - 1];
      
      // Get the signed URL from S3
      userData.profile_image_url = await getPublicUrl(filename, userData.email);
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
    
    // Update profile image URL in database
    const result = await pool.query(
      `UPDATE users 
       SET profile_image_url = $1,
           updated_at = NOW()
       WHERE email = $2
       RETURNING id, email, username, full_name, profile_image_url, bio, created_at`,
      [imageUrl, email]
    );
    
    // Get the user data
    const userData = result.rows[0];
    
    // Generate a signed URL for the uploaded image
    userData.profile_image_url = await getPublicUrl(filename, email);
    
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
    const result = await pool.query("SELECT NOW()");
    res.json({ message: `PostgreSQL Connected: ${result.rows[0].now}` });
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