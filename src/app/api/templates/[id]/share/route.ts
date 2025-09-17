import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await verifyAuth(request);
        
        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const templateId = params.id;

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
                { error: 'You can only share your own templates' },
                { status: 403 }
            );
        }

        // Update template to be public
        const updatedTemplate = await prisma.template.update({
            where: { id: templateId },
            data: { isPublic: true },
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
            message: 'Template shared successfully',
            template: updatedTemplate
        });

    } catch (error) {
        console.error('Error sharing template:', error);
        return NextResponse.json(
            { error: 'Failed to share template' },
            { status: 500 }
        );
    }
}

// Unshare template (make it private again)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await verifyAuth(request);
        
        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const templateId = params.id;

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
                { error: 'You can only unshare your own templates' },
                { status: 403 }
            );
        }

        // Update template to be private
        const updatedTemplate = await prisma.template.update({
            where: { id: templateId },
            data: { isPublic: false },
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
            message: 'Template unshared successfully',
            template: updatedTemplate
        });

    } catch (error) {
        console.error('Error unsharing template:', error);
        return NextResponse.json(
            { error: 'Failed to unshare template' },
            { status: 500 }
        );
    }
}