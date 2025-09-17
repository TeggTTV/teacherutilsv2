import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        const userId = decoded.userId;

        // Get user's downloaded templates
        const downloads = await prisma.templateDownload.findMany({
            where: {
                userId: userId,
            },
            include: {
                template: {
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
                }
            },
            orderBy: {
                downloadedAt: 'desc'
            }
        });

        const templates = downloads.map(download => ({
            id: download.template.id,
            title: download.template.title,
            description: download.template.description,
            type: download.template.type,
            data: download.template.data,
            previewImage: download.template.previewImage,
            tags: download.template.tags,
            difficulty: download.template.difficulty,
            gradeLevel: download.template.gradeLevel,
            subject: download.template.subject,
            downloads: download.template.downloads,
            rating: download.template.rating,
            ratingCount: download.template.ratingCount,
            downloadedAt: download.downloadedAt,
            createdAt: download.template.createdAt,
            author: {
                id: download.template.user.id,
                name: `${download.template.user.firstName || ''} ${download.template.user.lastName || ''}`.trim() || download.template.user.username || 'Anonymous',
                username: download.template.user.username,
            }
        }));

        return NextResponse.json({ templates });

    } catch (error) {
        console.error('Error fetching downloaded templates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch downloaded templates' },
            { status: 500 }
        );
    }
}