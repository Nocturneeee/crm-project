// File: src/controllers/auth.ts

import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// --- Fungsi Login (Sign In) ---
export const login = async (req: Request, res: Response) => {
    console.time('login-process');

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Request body is missing' });
    }

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables.");
        return res.status(500).json({ error: 'Kesalahan konfigurasi server (JWT Secret missing).' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email dan password harus diisi.' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true }
        });

        if (!user || !user.password) {
            return res.status(401).json({ error: 'Kredensial tidak valid (User tidak ditemukan).' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Kredensial tidak valid (Password salah).' });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                userEmail: user.email,
                role: user.role.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.timeEnd('login-process');
        return res.json({
            message: 'Login berhasil!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.name
            }
        });
    } catch (error) {
        console.timeEnd('login-process');
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
