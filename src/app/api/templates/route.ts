import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type');
        const featured = searchParams.get('featured');
        const subject = searchParams.get('subject');
        const difficulty = searchParams.get('difficulty');
        const gradeLevel = searchParams.get('gradeLevel');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build filter conditions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {
            isPublic: true,
        };

        if (type) {
            where.type = type;
        }

        if (featured === 'true') {
            where.isFeatured = true;
        }

        if (subject) {
            where.subject = subject;
        }

        if (difficulty) {
            where.difficulty = difficulty;
        }

        if (gradeLevel) {
            where.gradeLevel = gradeLevel;
        }

        // Fetch templates with pagination
        const templates = await prisma.template.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                    }
                },
                _count: {
                    select: {
                        templateDownloads: true,
                        templateRatings: true,
                    }
                }
            },
            orderBy: [
                { isFeatured: 'desc' },
                { downloads: 'desc' },
                { createdAt: 'desc' }
            ],
            take: limit,
            skip: offset,
        });

        // Transform data for response
        const templatesWithStats = templates.map(template => ({
            id: template.id,
            title: template.title,
            description: template.description,
            type: template.type,
            previewImage: template.previewImage,
            tags: template.tags,
            difficulty: template.difficulty,
            gradeLevel: template.gradeLevel,
            subject: template.subject,
            downloads: template.downloads,
            rating: template.rating,
            ratingCount: template.ratingCount,
            isFeatured: template.isFeatured,
            createdAt: template.createdAt,
            author: {
                id: template.user.id,
                name: `${template.user.firstName || ''} ${template.user.lastName || ''}`.trim() || template.user.username || 'Anonymous',
                username: template.user.username,
            }
        }));

        return NextResponse.json({
            templates: templatesWithStats,
            pagination: {
                limit,
                offset,
                total: await prisma.template.count({ where })
            }
        });

    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch templates' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = await verifyAuth(request);
        
        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            title,
            description,
            type,
            data,
            previewImage,
            tags = [],
            difficulty,
            gradeLevel,
            subject,
        } = body;

        // Validate required fields
        if (!title || !description || !type || !data) {
            return NextResponse.json(
                { error: 'Missing required fields: title, description, type, data' },
                { status: 400 }
            );
        }

        // Create template (default to private)
        const template = await prisma.template.create({
            data: {
                title,
                description,
                type,
                data,
                previewImage,
                tags,
                difficulty,
                gradeLevel,
                subject,
                isPublic: false, // Always save as private initially
                userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                    }
                }
            }
        });

        return NextResponse.json({
            id: template.id,
            title: template.title,
            description: template.description,
            type: template.type,
            previewImage: template.previewImage,
            tags: template.tags,
            difficulty: template.difficulty,
            gradeLevel: template.gradeLevel,
            subject: template.subject,
            downloads: template.downloads,
            rating: template.rating,
            ratingCount: template.ratingCount,
            isFeatured: template.isFeatured,
            isPublic: template.isPublic,
            createdAt: template.createdAt,
            author: {
                id: template.user.id,
                name: `${template.user.firstName || ''} ${template.user.lastName || ''}`.trim() || template.user.username || 'Anonymous',
                username: template.user.username,
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating template:', error);
        return NextResponse.json(
            { error: 'Failed to create template' },
            { status: 500 }
        );
    }
}