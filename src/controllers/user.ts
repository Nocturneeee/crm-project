import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middlewares/auth';

// Get all users (Admin only)
export const getUsers = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden - Admin only' });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        return res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Create new user (Admin only)
export const createUser = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden - Admin only' });
        }

        const { name, email, password, roleId } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                roleId: parseInt(roleId)
            },
            include: { role: true }
        });

        return res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.name
        });
    } catch (error) {
        console.error('Create user error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Update user
export const updateUser = async (req: AuthRequest, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const { name, email, roleId } = req.body;

        // Only admin can change roles or other users
        if (req.user?.role !== 'ADMIN' && req.user?.userId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                ...(req.user?.role === 'ADMIN' ? { roleId: parseInt(roleId) } : {})
            },
            include: { role: true }
        });

        return res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.name
        });
    } catch (error) {
        console.error('Update user error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};