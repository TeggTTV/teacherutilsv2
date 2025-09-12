import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const userId = await verifyAuth(request);
        
        if (!userId) {
            return new NextResponse(
                JSON.stringify({ error: 'Not authenticated' }),
                { status: 401 }
            );
        }

        // Get user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                username: true,
                school: true,
                grade: true,
                subject: true,
                bio: true,
                profileImage: true,
                role: true,
            }
        });

        if (!user) {
            return new NextResponse(
                JSON.stringify({ error: 'User not found' }),
                { status: 404 }
            );
        }

        return new NextResponse(
            JSON.stringify(user),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching user:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500 }
        );
    }
}
