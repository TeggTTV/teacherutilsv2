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
        const search = searchParams.get('search') || '';
        const tags = searchParams.get('tags') || '';
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

        // Enhanced search functionality
        if (search || tags) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const searchConditions: any[] = [];

            // Text search across title, description, and tags
            if (search) {
                searchConditions.push(
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { tags: { has: search } } // Search for exact tag match
                );
            }

            // Tag-specific search (multiple tags)
            if (tags) {
                const tagList = tags.split(',').map(tag => tag.trim()).filter(Boolean);
                if (tagList.length > 0) {
                    // Create OR conditions for each tag (any tag match)
                    const tagConditions = tagList.map(tag => ({
                        tags: { has: tag }
                    }));
                    searchConditions.push(...tagConditions);
                }
            }

            if (searchConditions.length > 0) {
                // Combine user filter with search conditions
                where.AND = [
                    {
                        OR: [
                            { userId: userId },
                            { 
                                templateDownloads: {
                                    some: { userId: userId }
                                }
                            }
                        ]
                    },
                    {
                        OR: searchConditions
                    }
                ];
                // Remove the original OR since we're now using AND
                delete where.OR;
            }
        }

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