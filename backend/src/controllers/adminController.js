import { prisma } from '../lib/prisma.js';

export async function listUsers(req, res) {
  const { q, page = 1, pageSize = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);
  const where = q
    ? { OR: [{ email: { contains: q } }, { fullName: { contains: q } }] }
    : {};
  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where })
  ]);
  res.json({ items, total, page: Number(page), pageSize: Number(pageSize) });
}

export async function getStats(req, res) {
  const [patients, doctors, visitsOpen, visitsTotal, billsDue, billsTotal] = await Promise.all([
    prisma.patient.count(),
    prisma.user.count({ where: { role: 'DOCTOR', isActive: true } }),
    prisma.visit.count({ where: { status: 'OPEN' } }),
    prisma.visit.count(),
    prisma.bill.count({ where: { status: { in: ['DUE', 'PARTIAL'] } } }),
    prisma.bill.count()
  ]);
  res.json({ patients, doctors, visitsOpen, visitsTotal, billsDue, billsTotal });
}

export async function getReport(req, res) {
  const { from, to } = req.query;
  const whereDate = (from || to) ? {
    createdAt: {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    }
  } : {};

  const [newPatients, visits, bills, payments] = await Promise.all([
    prisma.patient.count({ where: whereDate }),
    prisma.visit.findMany({ where: whereDate, include: { patient: true, doctor: true } }),
    prisma.bill.findMany({ where: whereDate, include: { patient: true, items: true } }),
    prisma.payment.findMany({ where: whereDate })
  ]);

  const revenue = payments.reduce((s, p) => s + Number(p.amount), 0);
  res.json({ newPatients, visits, bills, payments, revenue });
}


