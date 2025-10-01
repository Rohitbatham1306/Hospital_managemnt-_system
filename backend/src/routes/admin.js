import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { listUsers, getStats, getReport } from '../controllers/adminController.js';

export const router = Router();

router.use(authenticate, requireRoles('ADMIN'));

router.get('/users', listUsers);
router.get('/stats', getStats);
router.get('/reports', getReport);


