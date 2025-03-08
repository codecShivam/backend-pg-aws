# Authentication System

A secure authentication system using email-based One-Time Passwords (OTP) with a React frontend and Express.js backend, leveraging AWS services for production-grade infrastructure.



https://github.com/user-attachments/assets/25719894-25ed-4d77-a061-c36de9a94f44



## Features

- Email-based OTP authentication
- Session management with HTTP-only cookies
- PostgreSQL database for user storage
- Profile image upload and management with AWS S3
- Modular backend architecture
- React frontend with authentication state management
- Docker support for easy deployment

## AWS Services Used

### AWS Simple Email Service (SES)
- Used for sending secure, reliable OTP emails to users
- Provides delivery tracking and high deliverability rates
- Ensures emails don't get marked as spam

### AWS Relational Database Service (RDS)
- Hosts the PostgreSQL database for user data storage
- Provides automated backups and high availability
- Scales easily as user base grows

### AWS Simple Storage Service (S3)
- Stores user profile images with secure access control
- Generates signed URLs for secure, time-limited access to images
- Provides reliable and scalable object storage

### AWS Identity and Access Management (IAM)
- Manages secure access to AWS services and resources
- Provides fine-grained permissions for S3, SES, and RDS
- Ensures principle of least privilege for security

### AWS Elastic Compute Cloud (EC2)
- Hosts the containerized application
- Provides scalable compute capacity
- Enables deployment in multiple regions for lower latency

### Docker
- Containerizes the application for consistent deployment
- Simplifies environment setup and dependency management
- Enables easy scaling and deployment to various environments

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

### Option 1: Using Docker (Recommended)

The easiest way to run this application is using Docker. Both the frontend and backend are served from the same container on port 3000.

#### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop)

#### Running with Docker Compose

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/email-otp-auth.git
cd email-otp-auth
```

2. **Create a .env file**

Create a `.env` file in the root directory with the following variables:

```
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_HOST=your_db_host
DB_PORT=5432
PORT=3000
SESSION_SECRET=your_session_secret
CLIENT_URL=http://localhost:3000
NODE_ENV=production
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_aws_region
SENDER_EMAIL=your_verified_email
```

3. **Run with Docker Compose**

```bash
docker compose up -d
```

4. **Access the application**

Open your browser and navigate to:
```
http://localhost:3000
```

This will serve both the frontend and backend from the same port.

### Option 2: Manual Setup

#### Prerequisites

- Node.js and npm
- PostgreSQL database
- Gmail account (for sending OTPs)

#### Installation

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

## Docker Details

### How It Works

The Docker setup serves both the frontend and backend from the same container:

1. The frontend is built during the Docker image creation
2. The backend serves the static frontend files from the `frontend/dist` directory
3. API requests are handled by the Express backend
4. Everything is accessible from port 3000

### Building the Docker Image

If you want to build the Docker image yourself:

```bash
docker build -t yourusername/email-otp-auth:latest .
```

### Running the Docker Container

```bash
docker run -p 3000:3000 --env-file .env yourusername/email-otp-auth:latest
```

## Troubleshooting Docker Setup

### Common Issues

- **Database Connection**: Ensure your PostgreSQL database is accessible from the container
- **Port Conflicts**: Make sure port 3000 is not in use by another application
- **Environment Variables**: Verify all required environment variables are set correctly

### Viewing Logs

```bash
# View container logs
docker logs email-otp-app

# Follow logs in real-time
docker logs -f email-otp-app
```

## Security Features

- HTTP-Only cookies for session management
- OTP expiration (5 minutes)
- Secure session configuration
- Input validation
- Error handling

## License

MIT 
