import { Router } from 'express';
import { authenticateToken, requireRoles } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { getPresignedUrl } from '../utils/s3.js';

export const router = Router();

// Get secure access to lab report file (accessible by LAB, DOCTOR, ADMIN)
router.get('/lab-reports/:reportId', authenticateToken, requireRoles('LAB', 'DOCTOR', 'ADMIN'), async (req, res) => {
  try {
    const { reportId } = req.params;
    
    // Get the report with patient info
    const report = await prisma.labReport.findUnique({
      where: { id: reportId },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Check if S3 is configured
    const { s3 } = await import('../utils/s3.js');
    if (!s3) {
      // If S3 is not configured, return the original fileUrl (for development)
      return res.json({ 
        success: true, 
        fileUrl: report.fileUrl,
        reportId: report.id,
        patientName: `${report.patient.firstName} ${report.patient.lastName}`,
        reportType: report.type
      });
    }
    
    // Generate presigned URL for secure access (valid for 1 hour)
    const presignedUrl = await getPresignedUrl(report.fileKey, 3600);
    
    // Return the presigned URL as JSON
    res.json({ 
      success: true, 
      fileUrl: presignedUrl,
      reportId: report.id,
      patientName: `${report.patient.firstName} ${report.patient.lastName}`,
      reportType: report.type
    });
  } catch (error) {
    console.error('Error accessing lab report file:', error);
    res.status(500).json({ message: 'Failed to access file' });
  }
});

// Get secure access to any file by key (for future use)
router.get('/:fileKey', authenticateToken, requireRoles('ADMIN'), async (req, res) => {
  try {
    const { fileKey } = req.params;
    
    // Check if S3 is configured
    const { s3 } = await import('../utils/s3.js');
    if (!s3) {
      return res.status(503).json({ message: 'File storage not configured' });
    }
    
    // Generate presigned URL for secure access (valid for 1 hour)
    const presignedUrl = await getPresignedUrl(fileKey, 3600);
    
    // Redirect to the presigned URL
    res.redirect(presignedUrl);
  } catch (error) {
    console.error('Error accessing file:', error);
    res.status(500).json({ message: 'Failed to access file' });
  }
});
