import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../utils/prisma';

// Define interface for user performance data
interface UserPerformance {
    id: number;
    name: string;
    _count: {
        leads: number;
    };
    leads: {
        value: number | null;
        status: string;
    }[];
}

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const isAdmin = req.user?.role === 'ADMIN';
        const userId = req.user?.userId;

        // Base query conditions
        const whereCondition = isAdmin ? {} : { ownerId: userId };

        // Get total leads count
        const totalLeads = await prisma.lead.count({
            where: whereCondition
        });

        // Get leads by status
        const leadsByStatus = await prisma.lead.groupBy({
            by: ['status'],
            where: whereCondition,
            _count: true
        });

        // Calculate total value of leads
        const valueStats = await prisma.lead.aggregate({
            where: whereCondition,
            _sum: { value: true },
            _avg: { value: true }
        });

        // Get recent leads
        const recentLeads = await prisma.lead.findMany({
            where: whereCondition,
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Performance metrics by user (Admin only)
        let userPerformance: UserPerformance[] = [];
        if (isAdmin) {
            userPerformance = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    _count: {
                        select: { leads: true }
                    },
                    leads: {
                        select: {
                            value: true,
                            status: true
                        }
                    }
                }
            });
        }

        return res.json({
            summary: {
                totalLeads,
                totalValue: valueStats._sum.value || 0,
                averageValue: valueStats._avg.value || 0
            },
            leadsByStatus,
            recentLeads,
            ...(isAdmin && { userPerformance })
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};