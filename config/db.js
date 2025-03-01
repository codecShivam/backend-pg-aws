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

// Create tables if they don't exist
const initializeDatabase = async () => {
  try {
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
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
};

// Initialize database tables
initializeDatabase();

module.exports = pool; 