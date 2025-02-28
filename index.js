const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import configurations
const sessionConfig = require("./config/session");
const pool = require("./config/db");

const errorHandler = require("./middleware/error");

// Import routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json());
app.use(sessionConfig);

// Simple health check endpoint
app.get("/api", (req, res) => {
  res.json({ message: "API is running" });
});

// Routes
app.use("/", authRoutes);
app.use("/", profileRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
pool.query('SELECT NOW()')
  .then(() => {
    console.log('Database connection successful');
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});
