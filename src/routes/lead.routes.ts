// File: src/routes/lead.routes.ts

import { Router } from 'express';
import { getLeads, createLead, updateLead } from '../controllers/lead';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Protect all lead routes
router.use(authenticate);

router.get('/', getLeads);
router.post('/', createLead);
router.put('/:id', updateLead);

export default router;
