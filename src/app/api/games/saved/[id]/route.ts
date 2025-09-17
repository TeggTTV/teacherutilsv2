import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const userId = await verifyAuth(request);
		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const gameId = params.id;

		// Check if game exists and is public
		const game = await prisma.game.findUnique({
			where: {
				id: gameId,
				isPublic: true,
			},
		});

		if (!game) {
			return NextResponse.json(
				{ error: 'Game not found or not public' },
				{ status: 404 }
			);
		}

		// Check if already favorited
		const existingFavorite = await prisma.gameFavorite.findUnique({
			where: {
				gameId_userId: {
					gameId: gameId,
					userId: userId,
				},
			},
		});

		if (existingFavorite) {
			return NextResponse.json(
				{ error: 'Game already saved' },
				{ status: 409 }
			);
		}

		// Create favorite
		await prisma.gameFavorite.create({
			data: {
				userId: userId,
				gameId: gameId,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('[SAVE_GAME_POST]', error);
		return new NextResponse('Internal Error', { status: 500 });
	}
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const userId = await verifyAuth(request);
		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const gameId = params.id;

		// Delete favorite if it exists
		await prisma.gameFavorite.deleteMany({
			where: {
				userId: userId,
				gameId: gameId,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('[SAVE_GAME_DELETE]', error);
		return new NextResponse('Internal Error', { status: 500 });
	}
}