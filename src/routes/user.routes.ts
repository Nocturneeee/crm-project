import { Router } from 'express';
import { getUsers, createUser, updateUser } from '../controllers/user';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Protect all routes with authentication
router.use(authenticate);

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);

export default router;