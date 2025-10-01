import { prisma } from '../lib/prisma.js';

export async function createPatient(req, res) {
  const data = req.body;
  try {
    const patient = await prisma.patient.create({ data });
    res.status(201).json(patient);
  } catch (e) {
    res.status(400).json({ message: 'Failed to create patient' });
  }
}

export async function listPatients(req, res) {
  const { q, page = 1, pageSize = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);
  const where = q
    ? { OR: [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { phone: { contains: q } },
      ] }
    : {};
  const [items, total] = await Promise.all([
    prisma.patient.findMany({ where, skip, take, orderBy: { updatedAt: 'desc' } }),
    prisma.patient.count({ where })
  ]);
  res.json({ items, total, page: Number(page), pageSize: Number(pageSize) });
}

export async function getPatientOverview(req, res) {
  const { patientId } = req.params;
  const [patient, visits, prescriptions, bills] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId } }),
    prisma.visit.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } }),
    prisma.prescription.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } }),
    prisma.bill.findMany({ where: { patientId }, include: { items: true }, orderBy: { createdAt: 'desc' } })
  ]);
  res.json({ patient, visits, prescriptions, bills });
}

export async function assignToDoctor(req, res) {
  const { patientId, doctorId, reason } = req.body;
  try {
    const visit = await prisma.visit.create({ data: { patientId, doctorId, reason } });
    res.status(201).json(visit);
  } catch (e) {
    res.status(400).json({ message: 'Failed to assign patient' });
  }
}

export async function createBill(req, res) {
  const { patientId, items = [] } = req.body;
  try {
    const total = items.reduce((sum, it) => sum + (Number(it.quantity || 1) * Number(it.unitPrice || 0)), 0);
    const bill = await prisma.bill.create({
      data: {
        patientId,
        issuedById: req.user.id,
        total,
        items: {
          create: items.map(it => ({
            label: it.label,
            quantity: it.quantity || 1,
            unitPrice: it.unitPrice || 0,
            lineTotal: (it.quantity || 1) * (it.unitPrice || 0)
          }))
        }
      },
      include: { items: true }
    });
    res.status(201).json(bill);
  } catch (e) {
    res.status(400).json({ message: 'Failed to create bill' });
  }
}

export async function listDoctors(req, res) {
  const { q, page = 1, pageSize = 50 } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);
  const where = q ? { user: { fullName: { contains: q } } } : {};

  // Ensure each DOCTOR user has a Doctor profile
  const doctorUsers = await prisma.user.findMany({ where: { role: 'DOCTOR', isActive: true }, select: { id: true } });
  const doctorUserIds = doctorUsers.map(u => u.id);
  if (doctorUserIds.length > 0) {
    const existing = await prisma.doctor.findMany({ where: { userId: { in: doctorUserIds } }, select: { userId: true } });
    const existingIds = new Set(existing.map(d => d.userId));
    const missing = doctorUserIds.filter(id => !existingIds.has(id));
    for (const userId of missing) {
      try { await prisma.doctor.create({ data: { userId } }); } catch (_) {}
    }
  }
  const [items, total] = await Promise.all([
    prisma.doctor.findMany({
      where,
      include: { user: true },
      skip,
      take,
      orderBy: { user: { fullName: 'asc' } }
    }),
    prisma.doctor.count({ where })
  ]);
  res.json({ items, total, page: Number(page), pageSize: Number(pageSize) });
}

export async function listBills(req, res) {
  const { q, page = 1, pageSize = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);
  const where = q
    ? { OR: [
      { patient: { firstName: { contains: q } } },
      { patient: { lastName: { contains: q } } },
    ] }
    : {};
  const [items, total] = await Promise.all([
    prisma.bill.findMany({ where, include: { patient: true, items: true }, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.bill.count({ where })
  ]);
  res.json({ items, total, page: Number(page), pageSize: Number(pageSize) });
}


