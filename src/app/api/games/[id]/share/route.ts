import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { verifyAuth } from '@/lib/auth';
import { updateTagUsage, decrementTagUsage, updateTagUsageFromChanges } from '@/lib/tagUsage';

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

		// Handle tag usage tracking based on visibility change
		const updatedTags = tags || [];
		const previousTags = existingGame.tags || [];
		
		if (isPublic && !existingGame.isPublic) {
			// Game is being made public - increment tag usage
			if (updatedTags.length > 0) {
				try {
					await updateTagUsage(updatedTags);
					console.log('[Game Share] Updated tag usage for tags:', updatedTags);
				} catch (error) {
					console.error('[Game Share] Error updating tag usage:', error);
				}
			}
		} else if (!isPublic && existingGame.isPublic) {
			// Game is being made private - decrement tag usage for previous tags
			if (previousTags.length > 0) {
				try {
					await decrementTagUsage(previousTags);
					console.log('[Game Share] Decremented tag usage for tags:', previousTags);
				} catch (error) {
					console.error('[Game Share] Error decrementing tag usage:', error);
				}
			}
		} else if (isPublic && existingGame.isPublic) {
			// Game is staying public but tags might have changed
			// Only update tags that actually changed
			try {
				await updateTagUsageFromChanges(previousTags, updatedTags);
				console.log('[Game Share] Efficiently updated tag changes');
			} catch (error) {
				console.error('[Game Share] Error updating tag changes:', error);
			}
		}

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
