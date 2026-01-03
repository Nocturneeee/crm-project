// File: src/middlewares/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { userId: number; role: string; [key: string]: any };
}

// Middleware untuk memverifikasi token JWT 
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Ambil dari header Authoriz
    const authHeader = String(req.headers.authorization || '');
    if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'JWT secret not set' });

    try {
        // Verif token
        const payload = jwt.verify(token, process.env.JWT_SECRET) as any;
        req.user = { userId: payload.userId, role: payload.role };
        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Middleware opsional untuk Otorisasi 
export const authorizeRole = (requiredRole: 'ADMIN' | 'SALES' | 'LEAD') => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || req.user.role !== requiredRole) {
            return res.status(403).json({ 
                error: `Akses ditolak. Diperlukan peran ${requiredRole}.` 
            });
        }
        next();
    };
};
