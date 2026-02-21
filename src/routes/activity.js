import { Router } from 'express';
import ActivityLog from '../models/ActivityLog.js';

const router = Router();

router.get('/', async (req, res) => {
  const items = await ActivityLog.find().sort({ createdAt: -1 }).limit(200);
  res.json(items);
});

export default router;


