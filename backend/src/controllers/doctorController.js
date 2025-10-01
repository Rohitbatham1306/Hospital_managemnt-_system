import { prisma } from '../lib/prisma.js';

export async function getDashboard(req, res) {
  let doctor;
  if (req.user.role === 'ADMIN' && req.query.doctorId) {
    doctor = await prisma.doctor.findUnique({ where: { id: req.query.doctorId } });
  } else {
    const doctorUserId = req.user.id;
    doctor = await prisma.doctor.findUnique({ where: { userId: doctorUserId } });
  }
  if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
  const visits = await prisma.visit.findMany({
    where: { doctorId: doctor.id, status: 'OPEN' },
    include: { patient: true },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  res.json({ visits });
}

export async function addTreatmentNote(req, res) {
  const { visitId } = req.params;
  const { content } = req.body;
  try {
    const note = await prisma.treatmentNote.create({ data: { visitId, content, authorId: req.user.id } });
    res.status(201).json(note);
  } catch (e) {
    res.status(400).json({ message: 'Failed to add note' });
  }
}

export async function listPatientHistory(req, res) {
  const { patientId } = req.params;
  const { page = 1, pageSize = 20, q, doctorId } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);
  const where = {
    patientId,
    ...(q ? { OR: [
      { reason: { contains: q } },
      { diagnosis: { contains: q } }
    ] } : {}),
    ...(req.user.role === 'ADMIN' && doctorId ? { doctorId } : {})
  };
  const [visits, total] = await Promise.all([
    prisma.visit.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.visit.count({ where })
  ]);
  res.json({ items: visits, total, page: Number(page), pageSize: Number(pageSize) });
}

export async function listPatientLabReports(req, res) {
  const { patientId } = req.params;
  const items = await prisma.labReport.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } });
  res.json({ items });
}

export async function updateDoctorProfile(req, res) {
  const { specialty, notes } = req.body;
  const doctorUserId = req.user.id;
  let doctor = await prisma.doctor.findUnique({ where: { userId: doctorUserId } });
  if (!doctor) doctor = await prisma.doctor.create({ data: { userId: doctorUserId } });
  const updated = await prisma.doctor.update({ where: { id: doctor.id }, data: { specialty, notes } });
  res.json(updated);
}

export async function createPrescription(req, res) {
  const doctorUserId = req.user.id;
  const doctor = await prisma.doctor.findUnique({ where: { userId: doctorUserId } });
  if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
  const { patientId, visitId, medicines, diagnosis, suggestion } = req.body;
  const rx = await prisma.prescription.create({ data: { patientId, doctorId: doctor.id, visitId, medicines, diagnosis, suggestion } });
  res.status(201).json(rx);
}

export async function listPrescriptions(req, res) {
  const { patientId } = req.params;
  const items = await prisma.prescription.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } });
  res.json({ items });
}


