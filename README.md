# Email OTP Authentication System

A secure authentication system using email-based One-Time Passwords (OTP) with a React frontend and Express.js backend.

## Features

- Email-based OTP authentication
- Session management with HTTP-only cookies
- PostgreSQL database for user storage
- Modular backend architecture
- React frontend with authentication state management

## Project Structure

```
backend/
├── config/           # Configuration files
│   ├── db.js         # Database connection
│   ├── email.js      # Email service setup
│   └── session.js    # Session configuration
├── controllers/      # Business logic
│   ├── authController.js
│   └── profileController.js
├── middleware/       # Custom middleware
│   └── auth.js       # Authentication middleware
├── routes/           # API routes
│   ├── authRoutes.js
│   └── profileRoutes.js
├── utils/            # Helper functions
│   └── otpUtils.js   # OTP generation utilities
├── .env              # Environment variables (not in repo)
├── .env.example      # Example environment variables
├── index.js          # Main application entry
└── package.json      # Dependencies
```

## Setup Instructions

### Prerequisites

- Node.js and npm
- PostgreSQL database
- Gmail account (for sending OTPs)

### Database Setup

Create a PostgreSQL database and run the following SQL:

```sql
CREATE TABLE users (
  email VARCHAR(255) PRIMARY KEY,
  otp VARCHAR(6),
  otp_expires_at TIMESTAMP
);
```

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and update with your configuration
4. Start the backend server:
   ```
   npm start
   ```
5. Navigate to the frontend directory and install dependencies:
   ```
   cd frontend
   npm install
   ```
6. Start the frontend development server:
   ```
   npm run dev
   ```

## API Endpoints

- `POST /send-otp` - Send OTP to email
- `POST /verify-otp` - Verify OTP and create session
- `GET /profile` - Get user profile (protected)
- `POST /logout` - End user session
- `GET /api` - Check database connection

## Security Features

- HTTP-Only cookies for session management
- OTP expiration (5 minutes)
- Secure session configuration
- Input validation
- Error handling

## License

MIT 