import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const userId = await verifyAuth(request);
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check if game exists and is public
		const game = await prisma.game.findFirst({
			where: {
				id: params.id,
				isPublic: true
			}
		});

		if (!game) {
			return NextResponse.json({ error: 'Game not found' }, { status: 404 });
		}

		// Check if already favorited
		const existingFavorite = await prisma.gameFavorite.findUnique({
			where: {
				gameId_userId: {
					gameId: params.id,
					userId
				}
			}
		});

		if (existingFavorite) {
			// Remove from favorites
			await prisma.gameFavorite.delete({
				where: {
					gameId_userId: {
						gameId: params.id,
						userId
					}
				}
			});

			return NextResponse.json({ 
				success: true, 
				isFavorited: false,
				message: 'Removed from favorites'
			});
		} else {
			// Add to favorites
			await prisma.gameFavorite.create({
				data: {
					gameId: params.id,
					userId
				}
			});

			return NextResponse.json({ 
				success: true, 
				isFavorited: true,
				message: 'Added to favorites'
			});
		}

	} catch (error) {
		console.error('Error toggling favorite:', error);
		return NextResponse.json(
			{ error: 'Failed to toggle favorite' },
			{ status: 500 }
		);
	}
}

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const userId = await verifyAuth(request);

		let isFavorited = false;
		if (userId) {
			const favorite = await prisma.gameFavorite.findUnique({
				where: {
					gameId_userId: {
						gameId: params.id,
						userId
					}
				}
			});
			isFavorited = !!favorite;
		}

		const favoritesCount = await prisma.gameFavorite.count({
			where: {
				gameId: params.id
			}
		});

		return NextResponse.json({
			isFavorited,
			favoritesCount
		});

	} catch (error) {
		console.error('Error getting favorite status:', error);
		return NextResponse.json(
			{ error: 'Failed to get favorite status' },
			{ status: 500 }
		);
	}
}
