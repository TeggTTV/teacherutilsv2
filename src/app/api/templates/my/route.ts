import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const userId = await verifyAuth(request);
        
        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const subject = searchParams.get('subject');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const skip = (page - 1) * limit;

        // Build filter conditions for user's templates AND downloaded templates
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {
            OR: [
                { userId: userId }, // Templates created by user
                { 
                    templateDownloads: {
                        some: { userId: userId }
                    }
                } // Templates downloaded by user
            ]
        };

        if (type) {
            where.type = type;
        }

        if (subject) {
            where.subject = subject;
        }

        // Get templates with pagination
        const [templates, totalCount] = await Promise.all([
            prisma.template.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            username: true,
                        }
                    },
                    templateDownloads: {
                        where: { userId: userId },
                        select: { id: true }
                    },
                    _count: {
                        select: {
                            templateDownloads: true,
                            templateRatings: true,
                        }
                    }
                }
            }),
            prisma.template.count({ where })
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            templates,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            }
        });

    } catch (error) {
        console.error('Error fetching user templates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch templates' },
            { status: 500 }
        );
    }
}