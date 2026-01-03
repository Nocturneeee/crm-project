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

        // Tambah: Leads by month (untuk grafik Total Leads by Months)
        const leadsByMonth = await prisma.lead.groupBy({
            by: ['createdAt'],
            where: whereCondition,
            _count: true,
            orderBy: { createdAt: 'asc' }
        });
        // Hitung per bulan (gunakan JavaScript untuk agregat bulan)
        const monthlyData = leadsByMonth.reduce((acc, lead) => {
            const month = new Date(lead.createdAt).toISOString().slice(0, 7); // YYYY-MM
            acc[month] = (acc[month] || 0) + lead._count;
            return acc;
        }, {} as Record<string, number>);

        // Tambah: Lead source breakdown (untuk grafik donat)
        const leadSourceBreakdown = await prisma.lead.groupBy({
            by: ['source'],
            where: whereCondition,
            _count: true
        });

        // Tambah: Value change (indikator naik/turun, bandingkan bulan ini vs sebelumnya)
        const currentMonth = new Date();
        const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        const currentValue = await prisma.lead.aggregate({
            where: { ...whereCondition, createdAt: { gte: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1) } },
            _sum: { value: true }
        });
        const lastValue = await prisma.lead.aggregate({
            where: { ...whereCondition, createdAt: { gte: lastMonth, lt: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1) } },
            _sum: { value: true }
        });
        const currentVal = currentValue._sum.value || 0;
        const lastVal = lastValue._sum.value || 0;
        const valueChange = lastVal ? ((currentVal - lastVal) / lastVal) * 100 : 0;

        // Tambah: Quarter summary (Total Deal, Average Size, Revenue)
        const quarterStart = new Date(currentMonth.getFullYear(), Math.floor(currentMonth.getMonth() / 3) * 3, 1);
        const quarterStats = await prisma.lead.aggregate({
            where: { ...whereCondition, createdAt: { gte: quarterStart }, status: { in: ['WON'] } }, // Asumsi "deals" adalah WON
            _count: true,
            _sum: { value: true },
            _avg: { value: true }
        });

        return res.json({
            summary: {
                totalLeads,
                totalValue: valueStats._sum.value || 0,
                averageValue: valueStats._avg.value || 0,
                valueChange: `${valueChange.toFixed(1)}%` // Indikator naik/turun
            },
            leadsByStatus,
            leadsByMonth: monthlyData, // Data bulanan
            leadSourceBreakdown, // Breakdown sumber
            recentLeads,
            quarterSummary: {
                totalDeals: quarterStats._count,
                averageSize: quarterStats._avg.value || 0,
                revenue: quarterStats._sum.value || 0
            },
            ...(isAdmin && { userPerformance })
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};