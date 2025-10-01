#!/usr/bin/env node

/**
 * Mailtrap Setup Script
 * This script helps you set up Mailtrap for testing email functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Mailtrap Setup for Hospital Management System\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file already exists');
  console.log('📝 Please update your .env file with Mailtrap credentials:\n');
} else {
  console.log('📝 Creating .env file with Mailtrap configuration...\n');
  
  const envContent = `# Database
DATABASE_URL="mysql://root:password@localhost:3306/hospital_management"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# SMTP Configuration for Email (Mailtrap for Testing)
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="your-mailtrap-username"
SMTP_PASS="your-mailtrap-password"

# Frontend URL (for email links)
FRONTEND_URL="http://localhost:3000"

# Server Configuration
PORT="4000"
NODE_ENV="development"
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!\n');
}

console.log('📋 Next Steps:');
console.log('1. Go to https://mailtrap.io and create a free account');
console.log('2. Create a new inbox for your project');
console.log('3. Go to "SMTP Settings" and copy your credentials');
console.log('4. Update the following in your .env file:');
console.log('   - SMTP_USER: Your Mailtrap username');
console.log('   - SMTP_PASS: Your Mailtrap password');
console.log('   - DATABASE_URL: Your actual database connection string');
console.log('   - JWT_SECRET: A secure random string\n');

console.log('🧪 Testing Commands:');
console.log('1. Test email configuration:');
console.log('   curl http://localhost:4000/api/auth/test-email\n');
console.log('2. Test OTP email sending:');
console.log('   curl -X POST http://localhost:4000/api/auth/test-otp-email \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"email":"test@example.com","fullName":"Test User"}\'\n');

console.log('🎯 Full Authentication Flow Test:');
console.log('1. Start the backend: npm run dev');
console.log('2. Start the frontend: cd ../frontend && npm run dev');
console.log('3. Go to http://localhost:3000/register');
console.log('4. Register a new user');
console.log('5. Check your Mailtrap inbox for the OTP email');
console.log('6. Enter the OTP to verify your email');
console.log('7. Login with your verified account\n');

console.log('📚 For more details, see: MAILTRAP_SETUP_GUIDE.md');
console.log('🎉 Happy testing!');

