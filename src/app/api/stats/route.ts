import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Get user count
        const userCount = await prisma.user.count();
        
        // Get games created count
        const gamesCount = await prisma.game.count();
        
        // Get total play sessions (assuming this represents student engagement)
        const studentsEngaged = await prisma.game.aggregate({
            _sum: {
                plays: true
            }
        });

        // Format the statistics
        const formatStat = (num: number) => {
            if (num >= 1000000) {
                return `${(num / 1000000).toFixed(1)}M+`;
            } else if (num >= 1000) {
                return `${(num / 1000).toFixed(1)}K+`;
            } else {
                return `${num}+`;
            }
        };

        const stats = {
            activeTeachers: formatStat(userCount),
            gamesCreated: formatStat(gamesCount),
            studentsEngaged: formatStat(studentsEngaged._sum?.plays || 0)
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error('Error fetching statistics:', error);
        
        // Return fallback statistics if database query fails
        return NextResponse.json({
            activeTeachers: '0',
            gamesCreated: '0',
            studentsEngaged: '0'
        });
    }
}