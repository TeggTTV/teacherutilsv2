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

		const { rating, review } = await request.json();

		if (!rating || rating < 1 || rating > 5) {
			return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
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

		// Upsert rating (update if exists, create if not)
		const gameRating = await prisma.gameRating.upsert({
			where: {
				gameId_userId: {
					gameId: params.id,
					userId
				}
			},
			update: {
				rating,
				review: review || null
			},
			create: {
				gameId: params.id,
				userId,
				rating,
				review: review || null
			}
		});

		return NextResponse.json({ 
			success: true, 
			rating: gameRating,
			message: 'Rating submitted successfully!'
		});

	} catch (error) {
		console.error('Error submitting rating:', error);
		return NextResponse.json(
			{ error: 'Failed to submit rating' },
			{ status: 500 }
		);
	}
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const userId = await verifyAuth(request);

		const ratings = await prisma.gameRating.findMany({
			where: {
				gameId: id
			},
			include: {
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						username: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		});

		// Get user's rating if logged in
		let userRating = null;
		if (userId) {
			userRating = await prisma.gameRating.findUnique({
				where: {
					gameId_userId: {
						gameId: params.id,
						userId
					}
				}
			});
		}

		const formattedRatings = ratings.map(rating => ({
			id: rating.id,
			rating: rating.rating,
			review: rating.review,
			createdAt: rating.createdAt,
			author: {
				name: rating.user.firstName && rating.user.lastName 
					? `${rating.user.firstName} ${rating.user.lastName}`
					: rating.user.username || 'Anonymous'
			}
		}));

		const avgRating = ratings.length > 0 
			? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
			: 0;

		return NextResponse.json({
			ratings: formattedRatings,
			userRating,
			avgRating: Math.round(avgRating * 10) / 10,
			totalRatings: ratings.length
		});

	} catch (error) {
		console.error('Error fetching ratings:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch ratings' },
			{ status: 500 }
		);
	}
}
