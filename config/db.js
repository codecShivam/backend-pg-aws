const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // In production, you should use proper SSL certificates
  }
});

// Create tables if they don't exist and add new columns
const initializeDatabase = async () => {
  try {
    // First, ensure the users table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        otp VARCHAR(6),
        otp_expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Now add the new columns if they don't exist
    // We'll use a series of ALTER TABLE commands with column existence checks
    
    // Check and add username column
    const usernameCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='username';
    `);
    
    if (usernameCheck.rows.length === 0) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN username VARCHAR(50) UNIQUE;
      `);
      console.log('Added username column to users table');
    }
    
    // Check and add full_name column
    const fullNameCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='full_name';
    `);
    
    if (fullNameCheck.rows.length === 0) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN full_name VARCHAR(100);
      `);
      console.log('Added full_name column to users table');
    }
    
    // Check and add profile_image_url column
    const profileImageCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='profile_image_url';
    `);
    
    if (profileImageCheck.rows.length === 0) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN profile_image_url VARCHAR(255);
      `);
      console.log('Added profile_image_url column to users table');
    }
    
    // Check and add bio column
    const bioCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='bio';
    `);
    
    if (bioCheck.rows.length === 0) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN bio TEXT;
      `);
      console.log('Added bio column to users table');
    }
    
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
};

// Initialize database tables
initializeDatabase();

module.exports = pool; 