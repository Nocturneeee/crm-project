import { Router } from 'express';
import { getRoles, createRole, updateRole, deleteRole } from '../controllers/role';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Protect all role routes
router.use(authenticate);

router.get('/', getRoles);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

export default router;