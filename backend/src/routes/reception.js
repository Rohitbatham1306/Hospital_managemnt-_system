import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { createPatient, listPatients, assignToDoctor, createBill, listDoctors, listBills, getPatientOverview } from '../controllers/receptionController.js';

export const router = Router();

router.use(authenticate, requireRoles('RECEPTIONIST', 'ADMIN'));

// Patient registration
router.post('/patients', createPatient);

// List/search patients with pagination
router.get('/patients', listPatients);

// Assign patient to doctor: creates a visit
router.post('/assign', assignToDoctor);

// Create a bill (with simple items array)
router.post('/bills', createBill);
router.get('/bills', listBills);
router.get('/patients/:patientId/overview', getPatientOverview);

// Doctors list for assignment
router.get('/doctors', listDoctors);


