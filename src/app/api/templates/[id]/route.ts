import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { decrementTagUsage } from '@/lib/tagUsage';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await verifyAuth(request);

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const templateId = (await params).id;

        // Check if template exists and is public
        const template = await prisma.template.findUnique({
            where: { id: templateId },
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

        if (!template) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        if (!template.isPublic && template.userId !== userId) {
            return NextResponse.json(
                { error: 'Template is not available for download' },
                { status: 403 }
            );
        }

        // Check if already downloaded
        const existingDownload = await prisma.templateDownload.findUnique({
            where: {
                templateId_userId: {
                    templateId,
                    userId,
                }
            }
        });

        // If not already downloaded, create download record and increment counter
        if (!existingDownload) {
            await prisma.$transaction([
                prisma.templateDownload.create({
                    data: {
                        templateId,
                        userId,
                    }
                }),
                prisma.template.update({
                    where: { id: templateId },
                    data: {
                        downloads: {
                            increment: 1
                        }
                    }
                })
            ]);
        }

        return NextResponse.json({
            id: template.id,
            title: template.title,
            description: template.description,
            type: template.type,
            data: template.data,
            previewImage: template.previewImage,
            tags: template.tags,
            difficulty: template.difficulty,
            gradeLevel: template.gradeLevel,
            subject: template.subject,
            downloads: template.downloads + (existingDownload ? 0 : 1),
            rating: template.rating,
            ratingCount: template.ratingCount,
            createdAt: template.createdAt,
            author: {
                id: template.user.id,
                name: `${template.user.firstName || ''} ${template.user.lastName || ''}`.trim() || template.user.username || 'Anonymous',
                username: template.user.username,
            },
            alreadyDownloaded: !!existingDownload
        });

    } catch (error) {
        console.error('Error downloading template:', error);
        return NextResponse.json(
            { error: 'Failed to download template' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const templateId = (await params).id;

        // Get template details
        const template = await prisma.template.findUnique({
            where: { id: templateId },
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
            }
        });

        if (!template) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        if (!template.isPublic) {
            return NextResponse.json(
                { error: 'Template is not publicly available' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            id: template.id,
            title: template.title,
            description: template.description,
            type: template.type,
            data: template.data,
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
        });

    } catch (error) {
        console.error('Error fetching template:', error);
        return NextResponse.json(
            { error: 'Failed to fetch template' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await verifyAuth(request);
        
        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const templateId = (await params).id;

        // Find the template and verify ownership
        const template = await prisma.template.findUnique({
            where: { id: templateId },
        });

        if (!template) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        if (template.userId !== userId) {
            return NextResponse.json(
                { error: 'You can only delete your own templates' },
                { status: 403 }
            );
        }

        // Decrement tag usage if template is public
        if (template.isPublic && template.tags && template.tags.length > 0) {
            try {
                await decrementTagUsage(template.tags);
                console.log('[Template Delete] Decremented tag usage for tags:', template.tags);
            } catch (error) {
                console.error('[Template Delete] Error decrementing tag usage:', error);
            }
        }

        // Delete the template (this will cascade delete related records)
        await prisma.template.delete({
            where: { id: templateId },
        });

        return NextResponse.json({
            message: 'Template deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting template:', error);
        return NextResponse.json(
            { error: 'Failed to delete template' },
            { status: 500 }
        );
    }
}