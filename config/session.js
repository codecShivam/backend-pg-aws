const session = require("express-session");
require("dotenv").config();

const sessionConfig = session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Only use secure in production
    httpOnly: true,
    sameSite: 'lax' // Helps prevent CSRF attacks
  },
});

module.exports = sessionConfig; 