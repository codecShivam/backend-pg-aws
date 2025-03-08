const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require('path');

// Import configurations
const sessionConfig = require("./config/session");
const pool = require("./config/db");

const errorHandler = require("./middleware/error");

// Import routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const userRoutes = require("./routes/userRoutes");
const app = express();
const port = process.env.PORT || 3000;


if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // trust first proxy
}

// Middleware
// Enhanced CORS configuration specifically for your Cloudflare Pages domain
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://backend-pg.pages.dev'] // Your specific Cloudflare Pages domain
    : process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Set additional headers for cross-domain cookies
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.headers.origin === 'https://backend-pg.pages.dev') {
    res.header('Access-Control-Allow-Origin', 'https://backend-pg.pages.dev');
  }
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  next();
});
app.use(express.json());
app.use(sessionConfig);

// Simple health check endpoint
app.get("/api", (req, res) => {
  res.json({ message: "API is running" });
});

// Routes
app.use("/", authRoutes);
app.use("/", profileRoutes);
app.use("/", userRoutes);

// Add this line to serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Serve static files from the React/Vue app
// app.use(express.static(path.join(__dirname, 'frontend/dist')));

// // The "catchall" handler: for any request that doesn't
// // match one above, send back the index.html file.
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
// });

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
