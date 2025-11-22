import { Router } from 'express';
import { getDashboardStats } from '../controllers/analytics';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.get('/dashboard', getDashboardStats);

export default router;