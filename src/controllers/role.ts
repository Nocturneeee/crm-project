import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

export const getRoles = async (req: AuthRequest, res: Response) => {
    try {
        const roles = await prisma.role.findMany();
        return res.json(roles);
    } catch (error) {
        console.error('Get roles error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const createRole = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden - Admin only' });
        }

        const { name, description } = req.body;
        const role = await prisma.role.create({
            data: { name, description }
        });

        return res.status(201).json(role);
    } catch (error) {
        console.error('Create role error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateRole = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden - Admin only' });
        }

        const id = Number(req.params.id);
        const { name, description } = req.body;
        const role = await prisma.role.update({
            where: { id },
            data: { name, description }
        });

        return res.json(role);
    } catch (error) {
        console.error('Update role error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteRole = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden - Admin only' });
        }

        const id = Number(req.params.id);
        await prisma.role.delete({ where: { id } });
        return res.json({ message: 'Deleted' });
    } catch (error) {
        console.error('Delete role error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};