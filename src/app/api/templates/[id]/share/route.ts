import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { updateTagUsage, decrementTagUsage, updateTagUsageFromChanges } from '@/lib/tagUsage';

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

        const { id: templateId } = await params;
        const body = await request.json();
        
        const {
            isPublic,
            description,
            tags,
            subject,
            gradeLevel,
            difficulty
        } = body;

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
                { error: 'You can only update your own templates' },
                { status: 403 }
            );
        }

        // Update template with all metadata
        const updatedTemplate = await prisma.template.update({
            where: { id: templateId },
            data: { 
                isPublic,
                description: description || template.description,
                tags: tags || [],
                subject,
                gradeLevel,
                difficulty
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

        // Handle tag usage tracking based on visibility change
        const updatedTags = tags || [];
        const previousTags = template.tags || [];
        
        if (isPublic && !template.isPublic) {
            // Template is being made public - increment tag usage
            if (updatedTags.length > 0) {
                try {
                    await updateTagUsage(updatedTags);
                    console.log('[Template Share] Updated tag usage for tags:', updatedTags);
                } catch (error) {
                    console.error('[Template Share] Error updating tag usage:', error);
                }
            }
        } else if (!isPublic && template.isPublic) {
            // Template is being made private - decrement tag usage for previous tags
            if (previousTags.length > 0) {
                try {
                    await decrementTagUsage(previousTags);
                    console.log('[Template Share] Decremented tag usage for tags:', previousTags);
                } catch (error) {
                    console.error('[Template Share] Error decrementing tag usage:', error);
                }
            }
        } else if (isPublic && template.isPublic) {
            // Template is staying public but tags might have changed
            // Only update tags that actually changed
            try {
                await updateTagUsageFromChanges(previousTags, updatedTags);
                console.log('[Template Share] Efficiently updated tag changes');
            } catch (error) {
                console.error('[Template Share] Error updating tag changes:', error);
            }
        }

        return NextResponse.json({
            message: isPublic ? 'Template shared successfully' : 'Template made private successfully',
            template: updatedTemplate
        });

    } catch (error) {
        console.error('Error updating template sharing settings:', error);
        return NextResponse.json(
            { error: 'Failed to update template sharing settings' },
            { status: 500 }
        );
    }
}

// Unshare template (make it private again)
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

        const { id: templateId } = await params;

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

        // Decrement tag usage when template is made private
        if (template.isPublic && template.tags && template.tags.length > 0) {
            try {
                await decrementTagUsage(template.tags);
                console.log('[Template Unshare] Decremented tag usage for tags:', template.tags);
            } catch (error) {
                console.error('[Template Unshare] Error decrementing tag usage:', error);
            }
        }

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