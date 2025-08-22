# Environment Setup Guide

## Overview
This project requires proper environment configuration for both the client and server to function correctly.

## Client Environment Variables

### Required Variables
Create a `.env` file in the `client/` directory with the following:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
```

### How to Get Clerk Key
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application or select existing one
3. Go to API Keys section
4. Copy the Publishable Key (starts with `pk_test_` or `pk_live_`)
5. Replace the placeholder in your `.env` file

### File Location
- **Client**: `client/.env` (for React frontend)
- **Server**: `server/.env` (for Node.js backend)

## Server Environment Variables

### Required Variables
Create a `.env` file in the `server/` directory with the following:

```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hotel-booking
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=your_stripe_secret_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
```

### How to Get Server Keys

#### MongoDB URI
- Local: `mongodb://localhost:27017/hotel-booking`
- Atlas: `mongodb+srv://username:password@cluster.mongodb.net/hotel-booking`

#### JWT Secret
- Generate a random string: `openssl rand -base64 32`
- Or use any secure random string

#### Clerk Secret Key
- Go to Clerk Dashboard > API Keys
- Copy the Secret Key (starts with `sk_test_` or `sk_live_`)

#### Stripe Secret Key
- Go to [Stripe Dashboard](https://dashboard.stripe.com/)
- Navigate to Developers > API Keys
- Copy the Secret Key (starts with `sk_test_` or `sk_live_`)

## Environment File Structure

```
Hotel-Booking/
├── client/
│   ├── .env                    # Client environment variables
│   └── env.example            # Client environment template
├── server/
│   ├── .env                   # Server environment variables
│   └── env.example            # Server environment template
└── .env                       # Root environment (legacy - can be removed)
```

## Setup Instructions

### 1. Client Setup
```bash
cd client
cp env.example .env
# Edit .env with your actual Clerk publishable key
```

### 2. Server Setup
```bash
cd server
cp env.example .env
# Edit .env with your actual keys and database URI
```

### 3. Database Setup
```bash
# Start MongoDB locally
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in server/.env
```

### 4. Start the Application
```bash
# Install dependencies
npm run install-all

# Start both client and server
npm run dev
```

## Troubleshooting

### Common Issues

1. **"Clerk Publishable Key not found"**
   - Ensure `.env` file exists in `client/` directory
   - Check that the key starts with `pk_test_` or `pk_live_`
   - Restart the development server after adding the key

2. **"MongoDB connection failed"**
   - Verify MongoDB is running
   - Check MONGODB_URI in `server/.env`
   - Ensure network access if using Atlas

3. **"JWT_SECRET not configured"**
   - Add JWT_SECRET to `server/.env`
   - Generate a new secret if compromised

### Security Notes

- **Never commit `.env` files to version control**
- **Use different keys for development and production**
- **Rotate secrets regularly**
- **Keep Clerk and Stripe keys secure**

## Production Deployment

### Environment Variables
- Set environment variables in your hosting platform
- Use production keys (live keys, not test keys)
- Ensure proper CORS configuration

### Build Process
```bash
# Build client
cd client && npm run build

# Start server
cd server && npm start
```

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure services (MongoDB, Clerk) are accessible
4. Check the PROJECT_STATUS.md for known issues
