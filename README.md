# Hospital Management System

A comprehensive hospital management system built with modern web technologies, featuring role-based access control, OTP email verification, and secure file handling.

## Features

- **OTP Email Verification**: Secure registration with email verification
- **JWT Authentication**: Token-based authentication with role-based access
- **Role-Based Access Control**: Admin, Doctor, Receptionist, and Lab Technician roles
- **Patient Management**: Complete patient records and history
- **Lab Reports**: Secure file upload and access
- **Prescriptions**: Digital prescription management
- **Billing System**: Invoice generation and payment tracking

## Tech Stack

- **Backend**: Node.js, Express.js, Prisma ORM, MySQL
- **Frontend**: React 18, Vite, Tailwind CSS
- **Authentication**: JWT, Bcrypt
- **Email**: Nodemailer
- **File Storage**: AWS S3

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL database
- SMTP email service (Gmail recommended)

### Setup

1. **Clone and install dependencies:**
```bash
git clone <your-repo-url>
cd hospital-management

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Configure environment variables:**
Create `backend/.env`:
```env
DATABASE_URL="mysql://username:password@localhost:3306/hospital_management"
JWT_SECRET="your-secret-key"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FRONTEND_URL="http://localhost:3000"
```

3. **Setup database:**
```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

4. **Start development servers:**
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

Visit: http://localhost:3000

## User Roles

- **Admin**: Full system access
- **Doctor**: Patient management, prescriptions
- **Receptionist**: Patient registration, billing
- **Lab Technician**: Lab report uploads

## API Endpoints

- `POST /api/auth/register` - User registration with OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Email verification
- `GET /api/lab/patients` - Get patient list for lab
- `POST /api/lab/reports/upload` - Upload lab report
- `GET /api/files/lab-reports/:id` - Access lab report file

## Email Configuration

### Gmail Setup
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use app password in SMTP_PASS

### Mailtrap (Testing)
```env
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="your-mailtrap-username"
SMTP_PASS="your-mailtrap-password"
```

## Troubleshooting

- **Database issues**: Check DATABASE_URL format
- **Email issues**: Verify SMTP credentials
- **File access**: Check S3 configuration
- **Authentication**: Verify JWT_SECRET is set

## License

MIT License