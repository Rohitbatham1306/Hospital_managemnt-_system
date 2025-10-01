import { Router } from 'express';
import { 
  authenticateToken, 
  requireAdmin, 
  requireDoctor, 
  requireReceptionist, 
  requireLab,
  requireDoctorOrAdmin,
  requireReceptionistOrAdmin,
  requireLabOrAdmin,
  verifyUserStatus
} from '../middleware/auth.js';

export const router = Router();

// Example protected routes demonstrating role-based access

// Public route - anyone can access (no auth required)
router.get('/public', (req, res) => {
  res.json({ 
    message: 'This is a public route - no authentication required',
    timestamp: new Date().toISOString()
  });
});

// Protected route - requires authentication only
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'This is a protected route - authentication required',
    user: {
      id: req.user.id,
      email: req.user.email,
      fullName: req.user.fullName,
      role: req.user.role
    },
    timestamp: new Date().toISOString()
  });
});

// Admin only route
router.get('/admin-only', authenticateToken, requireAdmin, (req, res) => {
  res.json({ 
    message: 'This is an admin-only route',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Doctor only route
router.get('/doctor-only', authenticateToken, requireDoctor, (req, res) => {
  res.json({ 
    message: 'This is a doctor-only route',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Receptionist only route
router.get('/receptionist-only', authenticateToken, requireReceptionist, (req, res) => {
  res.json({ 
    message: 'This is a receptionist-only route',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Lab staff only route
router.get('/lab-only', authenticateToken, requireLab, (req, res) => {
  res.json({ 
    message: 'This is a lab staff-only route',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Doctor or Admin route
router.get('/doctor-or-admin', authenticateToken, requireDoctorOrAdmin, (req, res) => {
  res.json({ 
    message: 'This route is accessible by doctors and admins',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Receptionist or Admin route
router.get('/receptionist-or-admin', authenticateToken, requireReceptionistOrAdmin, (req, res) => {
  res.json({ 
    message: 'This route is accessible by receptionists and admins',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Lab or Admin route
router.get('/lab-or-admin', authenticateToken, requireLabOrAdmin, (req, res) => {
  res.json({ 
    message: 'This route is accessible by lab staff and admins',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Route with user status verification (active and verified)
router.get('/verified-user', authenticateToken, verifyUserStatus, (req, res) => {
  res.json({ 
    message: 'This route requires an active and verified user',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Example of multiple middleware chaining
router.get('/admin-verified', authenticateToken, requireAdmin, verifyUserStatus, (req, res) => {
  res.json({ 
    message: 'This route requires admin role and verified status',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Example POST route with role-based access
router.post('/admin-action', authenticateToken, requireAdmin, (req, res) => {
  res.json({ 
    message: 'Admin action performed successfully',
    data: req.body,
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Example PUT route with doctor access
router.put('/doctor-action', authenticateToken, requireDoctor, (req, res) => {
  res.json({ 
    message: 'Doctor action performed successfully',
    data: req.body,
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Example DELETE route with admin access
router.delete('/admin-delete/:id', authenticateToken, requireAdmin, (req, res) => {
  res.json({ 
    message: `Admin deleted resource with ID: ${req.params.id}`,
    user: req.user,
    timestamp: new Date().toISOString()
  });
});
