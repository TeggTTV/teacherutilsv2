import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const {
            gameId,
            title,
            description,
            tags = [],
            difficulty,
            gradeLevel,
            subject,
            isPublic = true,
        } = body;

        // Validate required fields
        if (!gameId || !title || !description) {
            return NextResponse.json(
                { error: 'Missing required fields: gameId, title, description' },
                { status: 400 }
            );
        }

        // Get the game to use as template source
        const game = await prisma.game.findUnique({
            where: { id: gameId },
        });

        if (!game) {
            return NextResponse.json(
                { error: 'Game not found' },
                { status: 404 }
            );
        }

        // Check if user owns the game
        if (game.userId !== userId) {
            return NextResponse.json(
                { error: 'You can only create templates from your own games' },
                { status: 403 }
            );
        }

        // Create template from game data
        const template = await prisma.template.create({
            data: {
                title,
                description,
                type: game.type,
                data: game.data || {}, // Copy the game structure, fallback to empty object
                tags,
                difficulty: difficulty || game.difficulty,
                gradeLevel: gradeLevel || game.gradeLevel,
                subject: subject || game.subject,
                isPublic,
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
        console.error('Error creating template from game:', error);
        return NextResponse.json(
            { error: 'Failed to create template from game' },
            { status: 500 }
        );
    }
}