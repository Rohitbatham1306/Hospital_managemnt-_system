import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { getDashboard, addTreatmentNote, listPatientHistory, listPatientLabReports, updateDoctorProfile, createPrescription, listPrescriptions } from '../controllers/doctorController.js';

export const router = Router();

router.use(authenticate, requireRoles('DOCTOR', 'ADMIN'));

// Dashboard: recent assigned visits
router.get('/dashboard', getDashboard);

// Add treatment note
router.post('/visits/:visitId/notes', addTreatmentNote);

// Patient history with pagination
router.get('/patients/:patientId/history', listPatientHistory);

// View lab results for patient
router.get('/patients/:patientId/labs', listPatientLabReports);
router.post('/profile', updateDoctorProfile);
router.post('/prescriptions', createPrescription);
router.get('/patients/:patientId/prescriptions', listPrescriptions);


