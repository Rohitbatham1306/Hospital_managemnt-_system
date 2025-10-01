import { prisma } from '../lib/prisma.js';
import { getPresignedUrl } from '../utils/s3.js';

export async function uploadReport(req, res) {
  const { patientId, type, fileUrl, fileKey, notes } = req.body;
  try {
    const report = await prisma.labReport.create({
      data: { patientId, type, fileUrl, fileKey, notes, uploadedById: req.user.id }
    });
    res.status(201).json(report);
  } catch (e) {
    res.status(400).json({ message: 'Failed to upload report' });
  }
}

export async function listReportsByPatient(req, res) {
  const { patientId } = req.params;
  const items = await prisma.labReport.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } });
  // If S3 configured, return presigned URLs instead of raw fileUrl
  const mapped = await Promise.all(items.map(async (r) => {
    try {
      const url = await getPresignedUrl(r.fileKey);
      return { ...r, fileUrl: url };
    } catch (_) {
      return r;
    }
  }));
  res.json({ items: mapped });
}


