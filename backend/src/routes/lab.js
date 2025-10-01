import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { uploadReport, listReportsByPatient } from '../controllers/labController.js';
import multer from 'multer';
import { uploadBufferToS3 } from '../utils/s3.js';
import { prisma } from '../lib/prisma.js';

export const router = Router();

router.use(authenticate, requireRoles('LAB', 'ADMIN'));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Get patient list for lab technicians (only names and IDs)
router.get('/patients', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        // Only include basic info needed for lab work
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    });
    
    res.json({ 
      items: patients,
      total: patients.length 
    });
  } catch (error) {
    console.error('Error fetching patients for lab:', error);
    res.status(500).json({ message: 'Failed to fetch patients' });
  }
});

// Get all lab reports (for lab dashboard)
router.get('/reports', async (req, res) => {
  try {
    const { page = 1, pageSize = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    
    const [reports, total] = await Promise.all([
      prisma.labReport.findMany({
        skip,
        take: parseInt(pageSize),
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          uploadedBy: {
            select: {
              id: true,
              fullName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.labReport.count()
    ]);
    
    res.json({ 
      items: reports,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('Error fetching lab reports:', error);
    res.status(500).json({ message: 'Failed to fetch lab reports' });
  }
});

// Upload lab report (assumes file already uploaded and we store URL+key)
router.post('/reports', uploadReport);

// List lab reports by patient
router.get('/patients/:patientId/reports', listReportsByPatient);

// Direct file upload: accepts multipart/form-data with field "file"
router.post('/reports/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { patientId, type, notes } = req.body;
    if (!patientId || !type) return res.status(400).json({ message: 'Missing patientId or type' });
    const { key, fileUrl } = await uploadBufferToS3(req.file.buffer, { contentType: req.file.mimetype, prefix: 'lab-reports' });
    const report = await prisma.labReport.create({ data: { patientId, type, notes, fileKey: key, fileUrl, uploadedById: req.user.id } });
    res.status(201).json(report);
  } catch (e) {
    res.status(400).json({ message: 'Failed to upload to S3' });
  }
});



