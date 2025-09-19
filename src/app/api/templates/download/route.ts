import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

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
        const { templateId } = body;

        if (!templateId) {
            return NextResponse.json(
                { error: 'Template ID is required' },
                { status: 400 }
            );
        }

        // Check if template exists and is public
        const template = await prisma.template.findUnique({
            where: { id: templateId }
        });

        if (!template) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        if (!template.isPublic) {
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
                    userId
                }
            }
        });

        if (existingDownload) {
            return NextResponse.json(
                { message: 'Template already downloaded' },
                { status: 200 }
            );
        }

        // Create download record and increment download count
        await Promise.all([
            prisma.templateDownload.create({
                data: {
                    templateId,
                    userId
                }
            }),
            prisma.template.update({
                where: { id: templateId },
                data: { downloads: { increment: 1 } }
            })
        ]);

        return NextResponse.json(
            { message: 'Template downloaded successfully' },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error downloading template:', error);
        return NextResponse.json(
            { error: 'Failed to download template' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const userId = await verifyAuth(request);

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { templateId } = body;

        if (!templateId) {
            return NextResponse.json(
                { error: 'Template ID is required' },
                { status: 400 }
            );
        }

        // Ensure a download record exists
        const existingDownload = await prisma.templateDownload.findUnique({
            where: {
                templateId_userId: {
                    templateId,
                    userId
                }
            }
        });

        if (!existingDownload) {
            return NextResponse.json(
                { error: 'Download record not found' },
                { status: 404 }
            );
        }

        // Delete download record and decrement download count
        await Promise.all([
            prisma.templateDownload.delete({
                where: {
                    templateId_userId: {
                        templateId,
                        userId
                    }
                }
            }),
            prisma.template.update({
                where: { id: templateId },
                data: { downloads: { decrement: 1 } }
            })
        ]);

        return NextResponse.json({ message: 'Download removed' }, { status: 200 });

    } catch (error) {
        console.error('Error removing download:', error);
        return NextResponse.json(
            { error: 'Failed to remove download' },
            { status: 500 }
        );
    }
}