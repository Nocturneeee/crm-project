// File: src/routes/auth.routes.ts

import { Router } from 'express';
import { login } from '../controllers/auth'; // Hapus register dari import


const router = Router();

router.post('/login', login);


export default router;
