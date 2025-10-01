import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

// JWT Authentication Middleware
export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ 
      message: 'Access denied. No token provided.',
      code: 'NO_TOKEN'
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token.',
        code: 'INVALID_TOKEN'
      });
    } else {
      return res.status(401).json({ 
        message: 'Token verification failed.',
        code: 'TOKEN_VERIFICATION_FAILED'
      });
    }
  }
}

// Legacy function for backward compatibility
export function authenticate(req, res, next) {
  return authenticateToken(req, res, next);
}

// Role-based Authorization Middleware
export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Unauthorized. User not authenticated.',
        code: 'NOT_AUTHENTICATED'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }
    
    next();
  };
}

// Admin only middleware
export function requireAdmin(req, res, next) {
  return requireRoles('ADMIN')(req, res, next);
}

// Doctor only middleware
export function requireDoctor(req, res, next) {
  return requireRoles('DOCTOR')(req, res, next);
}

// Receptionist only middleware
export function requireReceptionist(req, res, next) {
  return requireRoles('RECEPTIONIST')(req, res, next);
}

// Lab staff only middleware
export function requireLab(req, res, next) {
  return requireRoles('LAB')(req, res, next);
}

// Doctor or Admin middleware
export function requireDoctorOrAdmin(req, res, next) {
  return requireRoles('DOCTOR', 'ADMIN')(req, res, next);
}

// Receptionist or Admin middleware
export function requireReceptionistOrAdmin(req, res, next) {
  return requireRoles('RECEPTIONIST', 'ADMIN')(req, res, next);
}

// Lab or Admin middleware
export function requireLabOrAdmin(req, res, next) {
  return requireRoles('LAB', 'ADMIN')(req, res, next);
}

// Verify user is active and verified middleware
export async function verifyUserStatus(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Unauthorized. User not authenticated.',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isActive: true, isVerified: true }
    });

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found.',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        message: 'Account is deactivated. Please contact administrator.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Email not verified. Please verify your email.',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    next();
  } catch (error) {
    console.error('Error verifying user status:', error);
    return res.status(500).json({ 
      message: 'Internal server error.',
      code: 'INTERNAL_ERROR'
    });
  }
}


