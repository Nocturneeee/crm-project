// File: src/controllers/lead.ts

import { Response } from 'express';
import prisma from '../utils/prisma'; // Pastikan path ke prisma utility benar
import { AuthRequest } from '../middlewares/auth'; // Menggunakan AuthRequest interface

// --- Mendapatkan Semua Leads (Hanya untuk ADMIN atau Leads yang dimiliki) ---
export const getLeads = async (req: AuthRequest, res: Response) => {
    try {
        const userRole = req.user?.role;
        const userId = req.user?.userId;

        let leads;
        
        if (userRole === 'ADMIN') {
            // ADMIN dapat melihat semua leads di sistem
            leads = await prisma.lead.findMany({
                include: { owner: { select: { id: true, name: true, email: true } } },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            // Pengguna lain (misalnya SALES) hanya melihat leads yang menjadi ownerId-nya
            leads = await prisma.lead.findMany({
                where: { ownerId: userId },
                include: { owner: { select: { id: true, name: true, email: true } } },
                orderBy: { createdAt: 'desc' }
            });
        }

        return res.json(leads);

    } catch (error) {
        console.error('Error fetching leads:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan internal server saat mengambil leads.' });
    }
};

// --- Membuat Lead Baru ---
export const createLead = async (req: AuthRequest, res: Response) => {
    const { name, company, email, phone, status, value } = req.body;
    const ownerId = req.user?.userId; // ID pengguna yang sedang login akan menjadi owner

    if (!name || !ownerId) {
        return res.status(400).json({ error: 'Nama Lead dan Owner wajib diisi.' });
    }

    try {
        const newLead = await prisma.lead.create({
            data: {
                name,
                company,
                email,
                phone,
                status: status || 'New',
                value: value ? parseFloat(value) : 0,
                ownerId,
            },
        });
        return res.status(201).json({ 
            message: 'Lead berhasil dibuat.', 
            lead: newLead 
        });
    } catch (error) {
        console.error('Error creating lead:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan internal server saat membuat lead.' });
    }
};

// --- Mengupdate Lead ---
export const updateLead = async (req: AuthRequest, res: Response) => {
    const leadId = parseInt(req.params.id);
    const updates = req.body;
    const userId = req.user?.userId;

    if (isNaN(leadId)) {
        return res.status(400).json({ error: 'ID Lead tidak valid.' });
    }

    try {
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });

        if (!lead) {
            return res.status(404).json({ error: 'Lead tidak ditemukan.' });
        }

        // Otorisasi: Hanya ADMIN atau pemilik lead yang boleh mengupdate
        if (req.user?.role !== 'ADMIN' && lead.ownerId !== userId) {
            return res.status(403).json({ error: 'Anda tidak memiliki izin untuk mengupdate lead ini.' });
        }

        const updatedLead = await prisma.lead.update({
            where: { id: leadId },
            data: {
                ...updates,
                // Pastikan value diubah ke float jika ada
                value: updates.value !== undefined ? parseFloat(updates.value) : updates.value, 
            },
        });

        return res.json({ message: 'Lead berhasil diperbarui.', lead: updatedLead });

    } catch (error) {
        console.error('Error updating lead:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan internal server saat mengupdate lead.' });
    }
};

// --- Menghapus Lead ---
export const deleteLead = async (req: AuthRequest, res: Response) => {
    const leadId = parseInt(req.params.id);
    const userId = req.user?.userId;

    if (isNaN(leadId)) {
        return res.status(400).json({ error: 'ID Lead tidak valid.' });
    }

    try {
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });

        if (!lead) {
            return res.status(404).json({ error: 'Lead tidak ditemukan.' });
        }

        // Otorisasi: Hanya ADMIN atau pemilik lead yang boleh menghapus
        if (req.user?.role !== 'ADMIN' && lead.ownerId !== userId) {
            return res.status(403).json({ error: 'Anda tidak memiliki izin untuk menghapus lead ini.' });
        }

        await prisma.lead.delete({ where: { id: leadId } });

        return res.json({ message: 'Lead berhasil dihapus.' });

    } catch (error) {
        console.error('Error deleting lead:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan internal server saat menghapus lead.' });
    }
};

// Tambahkan ekspor default agar modul jelas tersedia untuk import default/named
export default { getLeads, createLead, updateLead, deleteLead };
