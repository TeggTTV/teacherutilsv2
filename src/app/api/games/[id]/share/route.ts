import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const userId = await verifyAuth(request);
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { 
			isPublic, 
			description, 
			tags, 
			subject, 
			gradeLevel, 
			difficulty 
		} = await request.json();

		// Verify the user owns this game
		const existingGame = await prisma.game.findFirst({
			where: {
				id: id,
				userId
			}
		});

		if (!existingGame) {
			return NextResponse.json({ error: 'Game not found' }, { status: 404 });
		}

		// Update the game with sharing settings
		const updatedGame = await prisma.game.update({
			where: { id: id },
			data: {
				isPublic,
				description,
				tags: tags || [],
				subject,
				gradeLevel,
				difficulty,
				publishedAt: isPublic ? new Date() : null
			},
			include: {
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						username: true,
						school: true
					}
				}
			}
		});

		return NextResponse.json({ 
			success: true, 
			game: updatedGame,
			message: isPublic ? 'Game published successfully!' : 'Game made private successfully!'
		});

	} catch (error) {
		console.error('Error updating game sharing settings:', error);
		return NextResponse.json(
			{ error: 'Failed to update sharing settings' },
			{ status: 500 }
		);
	}
}
