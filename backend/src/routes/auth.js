import { Router } from 'express';
import { register, login, me, verifyOTP, resendOTP } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { testEmailConnection, sendOTPEmail } from '../utils/email.js';

export const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Test email configuration (for development only)
router.get('/test-email', async (req, res) => {
  try {
    const result = await testEmailConnection();
    if (result.success) {
      res.json({ 
        message: 'Email configuration is working!',
        status: 'success'
      });
    } else {
      res.status(500).json({ 
        message: 'Email configuration failed',
        error: result.error,
        status: 'error'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Email test failed',
      error: error.message,
      status: 'error'
    });
  }
});

// Test OTP email sending (for development only)
router.post('/test-otp-email', async (req, res) => {
  try {
    const { email, fullName } = req.body;
    if (!email || !fullName) {
      return res.status(400).json({ 
        message: 'Email and fullName are required',
        status: 'error'
      });
    }

    const result = await sendOTPEmail(email, '123456', fullName);
    if (result.success) {
      res.json({ 
        message: 'Test OTP email sent successfully!',
        status: 'success'
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to send test OTP email',
        error: result.error,
        status: 'error'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Test OTP email failed',
      error: error.message,
      status: 'error'
    });
  }
});

// Protected routes
router.get('/me', authenticateToken, me);


