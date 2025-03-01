# Use Node.js as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package.json and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy frontend package.json and install dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

# Copy all code
COPY . .

# Build the frontend
RUN cd frontend && npm run build

# Expose port
EXPOSE 3000

# Command to run the application
CMD ["node", "index.js"]