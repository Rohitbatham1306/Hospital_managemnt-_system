import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { router as healthRouter } from './routes/health.js';
import { router as authRouter } from './routes/auth.js';
import { router as adminRouter } from './routes/admin.js';
import { router as receptionRouter } from './routes/reception.js';
import { router as doctorRouter } from './routes/doctor.js';
import { router as labRouter } from './routes/lab.js';
import { router as protectedRouter } from './routes/protected.js';
import { router as filesRouter } from './routes/files.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reception', receptionRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/lab', labRouter);
app.use('/api/files', filesRouter);
app.use('/api/protected', protectedRouter);

app.get('/', (req, res) => {
  res.json({ ok: true, service: 'hospital-management-backend' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${PORT}`);
});