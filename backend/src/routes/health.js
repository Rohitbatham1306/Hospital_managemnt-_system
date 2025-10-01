import { Router } from 'express';

export const router = Router();

router.get('/', async (req, res) => {
  res.json({ status: 'ok' });
});


