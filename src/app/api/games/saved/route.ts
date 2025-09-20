import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GameType } from '@/generated/prisma/client';
import { verifyAuth } from '@/lib/auth';

interface SavedGame {
	id: string;
	title: string;
	description: string | null;
	type: GameType;
	tags: string[];
	subject: string | undefined;
	gradeLevel: string | undefined;
	difficulty: string | undefined;
	language: string;
	publishedAt: string;
	downloads: number;
	plays: number;
	avgRating: number;
	ratingsCount: number;
	favoritesCount: number;
	author: {
		id: string;
		name: string;
		school: string | undefined;
	};
}

export async function GET(request: NextRequest) {
	try {
		const userId = await verifyAuth(request);
		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		// Get all games that the user has favorited
		const savedGames = await prisma.game.findMany({
			where: {
				favorites: {
					some: {
						userId: userId,
					},
				},
				isPublic: true,
			},
			include: {
				user: {
					select: {
						id: true,
						username: true,
						school: true,
					},
				},
				ratings: {
					select: {
						rating: true,
					},
				},
				_count: {
					select: {
						ratings: true,
						favorites: true,
					},
				},
			},
		});

		const games: SavedGame[] = savedGames.map((game) => {
			const avgRating =
				game.ratings.length > 0
					? game.ratings.reduce(
							(sum: number, r: { rating: number }) =>
								sum + r.rating,
							0
					  ) / game.ratings.length
					: 0;

			return {
				id: game.id,
				title: game.title,
				description: game.description,
				type: game.type,
				data: game.data as Record<string, unknown>, // Include the game data with displayImage
				tags: game.tags,
				subject: game.subject || undefined,
				gradeLevel: game.gradeLevel || undefined,
				difficulty: game.difficulty || undefined,
				language: game.language,
				publishedAt:
					game.publishedAt?.toISOString() ||
					game.createdAt.toISOString(),
				downloads: game.downloads || 0,
				plays: game.plays || 0,
				avgRating,
				ratingsCount: game._count.ratings,
				favoritesCount: game._count.favorites,
				author: {
					id: game.user.id,
					name: game.user.username || 'Anonymous',
					school: game.user.school || undefined,
				},
			};
		});

		return NextResponse.json({ games });
	} catch (error) {
		console.error('[SAVED_GAMES_GET]', error);
		return new NextResponse('Internal Error', { status: 500 });
	}
}
