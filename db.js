const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");
require("dotenv").config();

// Create PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // In production, use proper SSL certificates
  }
});

// Import schema
const schema = require("./db/schema/index.ts");

// Create Drizzle instance
const db = drizzle(pool, { schema });

// Export both pool and db
module.exports = { pool, db };
