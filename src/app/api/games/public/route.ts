import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '12');
		const search = searchParams.get('search') || '';
		const tags = searchParams.get('tags') || ''; // New: comma-separated tags
		const subject = searchParams.get('subject') || '';
		const gradeLevel = searchParams.get('gradeLevel') || '';
		const difficulty = searchParams.get('difficulty') || '';
		const sortBy = searchParams.get('sortBy') || 'newest'; // newest, popular, rating
		
		const skip = (page - 1) * limit;

		// Build where clause for filtering
		const where: Prisma.GameWhereInput = {
			isPublic: true,
			publishedAt: { not: null }
		};

		// Enhanced search functionality
		if (search || tags) {
			const searchConditions: Prisma.GameWhereInput[] = [];

			// Text search across title, description, and tags
			if (search) {
				searchConditions.push(
					{ title: { contains: search, mode: 'insensitive' } },
					{ description: { contains: search, mode: 'insensitive' } },
					{ tags: { has: search } } // Search for exact tag match
				);
			}

			// Tag-specific search (multiple tags)
			if (tags) {
				const tagList = tags.split(',').map(tag => tag.trim()).filter(Boolean);
				if (tagList.length > 0) {
					// Create OR conditions for each tag (any tag match)
					const tagConditions = tagList.map(tag => ({
						tags: { has: tag }
					}));
					searchConditions.push(...tagConditions);
				}
			}

			if (searchConditions.length > 0) {
				where.OR = searchConditions;
			}
		}

		if (subject) {
			where.subject = subject;
		}

		if (gradeLevel) {
			where.gradeLevel = gradeLevel;
		}

		if (difficulty) {
			where.difficulty = difficulty;
		}

		// Build orderBy clause
		let orderBy: Prisma.GameOrderByWithRelationInput = {};
		switch (sortBy) {
			case 'popular':
				orderBy = { plays: 'desc' };
				break;
			case 'downloads':
				orderBy = { downloads: 'desc' };
				break;
			case 'rating':
				// We'll handle this differently since it requires aggregation
				orderBy = { publishedAt: 'desc' };
				break;
			default:
				orderBy = { publishedAt: 'desc' };
		}

		const [games, total] = await Promise.all([
			prisma.game.findMany({
				where,
				include: {
					user: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							username: true,
							school: true
						}
					},
					ratings: {
						select: {
							rating: true
						}
					},
					_count: {
						select: {
							ratings: true,
							favorites: true
						}
					}
				},
				orderBy,
				skip,
				take: limit
			}),
			prisma.game.count({ where })
		]);

		// Calculate average ratings and format response
		const formattedGames = games.map(game => {
			const avgRating = game.ratings.length > 0 
				? game.ratings.reduce((sum, r) => sum + r.rating, 0) / game.ratings.length 
				: 0;

			return {
				id: game.id,
				title: game.title,
				description: game.description,
				type: game.type,
				data: game.data as Record<string, unknown>, // Include the game data with displayImage
				tags: game.tags,
				subject: game.subject,
				gradeLevel: game.gradeLevel,
				difficulty: game.difficulty,
				language: game.language,
				publishedAt: game.publishedAt,
				downloads: game.downloads,
				plays: game.plays,
				saves: game._count.favorites, // Use favorites count as saves
				avgRating: Math.round(avgRating * 10) / 10,
				ratingsCount: game._count.ratings,
				favoritesCount: game._count.favorites,
				author: {
					id: game.user.id,
					name: game.user.firstName && game.user.lastName 
						? `${game.user.firstName} ${game.user.lastName}`
						: game.user.username || 'Anonymous',
					school: game.user.school
				}
			};
		});

		return NextResponse.json({
			games: formattedGames,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit)
			}
		});

	} catch (error) {
		console.error('Error fetching public games:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch public games' },
			{ status: 500 }
		);
	}
}
