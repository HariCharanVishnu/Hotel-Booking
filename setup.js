#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🏨 Hotel Booking System Setup');
console.log('=============================\n');

// Check if .env file exists in server directory
const serverEnvPath = path.join(__dirname, 'server', '.env');
const serverEnvExamplePath = path.join(__dirname, 'server', 'env.example');

if (!fs.existsSync(serverEnvPath)) {
  console.log('📝 Creating server .env file...');
  
  if (fs.existsSync(serverEnvExamplePath)) {
    const envContent = fs.readFileSync(serverEnvExamplePath, 'utf8');
    fs.writeFileSync(serverEnvPath, envContent);
    console.log('✅ Server .env file created from template');
  } else {
    const defaultEnvContent = `NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hotel-booking
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=your_stripe_secret_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here`;
    
    fs.writeFileSync(serverEnvPath, defaultEnvContent);
    console.log('✅ Server .env file created with default values');
  }
  
  console.log('⚠️  Please update the server .env file with your actual API keys and secrets\n');
} else {
  console.log('✅ Server .env file already exists');
}

// Check if .env file exists in client directory
const clientEnvPath = path.join(__dirname, 'client', '.env');

if (!fs.existsSync(clientEnvPath)) {
  console.log('📝 Creating client .env file...');
  
  const clientEnvContent = `VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here`;
  
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  console.log('✅ Client .env file created');
  console.log('⚠️  Please update the client .env file with your Clerk publishable key\n');
} else {
  console.log('✅ Client .env file already exists');
}

// Check if node_modules exist
const serverNodeModules = path.join(__dirname, 'server', 'node_modules');
const clientNodeModules = path.join(__dirname, 'client', 'node_modules');

if (!fs.existsSync(serverNodeModules)) {
  console.log('📦 Server dependencies not installed. Run: cd server && npm install');
}

if (!fs.existsSync(clientNodeModules)) {
  console.log('📦 Client dependencies not installed. Run: cd client && npm install');
}

console.log('\n🚀 Setup complete!');
console.log('\nNext steps:');
console.log('1. Update server/.env with your actual API keys:');
console.log('   - JWT_SECRET (generate a secure random string)');
console.log('   - STRIPE_SECRET_KEY (from your Stripe dashboard)');
console.log('   - CLERK_SECRET_KEY (from your Clerk dashboard)');
console.log('2. Update client/.env with your Clerk publishable key');
console.log('3. Make sure MongoDB is running locally or update MONGODB_URI');
console.log('4. Install dependencies: npm run install-all');
console.log('5. Run "npm run dev" to start the development servers');
console.log('6. Visit http://localhost:5173 to view the application');
console.log('\nHappy coding! 🎉'); 