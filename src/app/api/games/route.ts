import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get('auth-token')?.value;
		
		if (!token) {
			return NextResponse.json({ 
				error: 'Authentication required',
				code: 'AUTH_REQUIRED' 
			}, { status: 401 });
		}

		let decoded;
		try {
			decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { userId: string };
		} catch {
			return NextResponse.json({ 
				error: 'Invalid or expired token',
				code: 'INVALID_TOKEN' 
			}, { status: 401 });
		}

		const userId = decoded.userId;

		const games = await prisma.game.findMany({
			where: { userId },
			orderBy: { updatedAt: 'desc' },
			select: {
				id: true,
				title: true,
				description: true,
				type: true,
				data: true,
				isPublic: true,
				tags: true,
				createdAt: true,
				updatedAt: true,
				// Don't include userId for security
			}
		});

		return NextResponse.json({ 
			success: true,
			games,
			count: games.length 
		});
	} catch (error) {
		console.error('Error fetching games:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json(
			{ 
				error: 'Failed to fetch games',
				code: 'FETCH_ERROR',
				details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
			},
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}

export async function POST(request: NextRequest) {
	try {
		const token = request.cookies.get('auth-token')?.value;
		
		if (!token) {
			return NextResponse.json({ 
				error: 'Authentication required',
				code: 'AUTH_REQUIRED' 
			}, { status: 401 });
		}

		let decoded;
		try {
			decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { userId: string };
		} catch {
			return NextResponse.json({ 
				error: 'Invalid or expired token',
				code: 'INVALID_TOKEN' 
			}, { status: 401 });
		}

		const userId = decoded.userId;

		const body = await request.json();
		const { title, description, type, data, isPublic, tags } = body;

		// Enhanced validation
		if (!title || typeof title !== 'string' || title.trim().length === 0) {
			return NextResponse.json(
				{ 
					error: 'Title is required and must be a non-empty string',
					code: 'INVALID_TITLE' 
				},
				{ status: 400 }
			);
		}

		if (!type || !['JEOPARDY', 'QUIZ', 'WORD_GAME'].includes(type)) {
			return NextResponse.json(
				{ 
					error: 'Type must be one of: JEOPARDY, QUIZ, WORD_GAME',
					code: 'INVALID_TYPE' 
				},
				{ status: 400 }
			);
		}

		if (!data || typeof data !== 'object') {
			return NextResponse.json(
				{ 
					error: 'Data is required and must be an object',
					code: 'INVALID_DATA' 
				},
				{ status: 400 }
			);
		}

		// Validate Jeopardy game data
		if (type === 'JEOPARDY') {
			if (!data.categories || !Array.isArray(data.categories) || data.categories.length === 0) {
				return NextResponse.json(
					{ 
						error: 'Jeopardy games must have at least one category',
						code: 'INVALID_CATEGORIES' 
					},
					{ status: 400 }
				);
			}

			// Check if categories have questions
			const hasValidQuestions = data.categories.some((cat: { questions?: unknown[] }) => 
				cat.questions && Array.isArray(cat.questions) && cat.questions.length > 0
			);

			if (!hasValidQuestions) {
				return NextResponse.json(
					{ 
						error: 'Jeopardy games must have at least one question',
						code: 'NO_QUESTIONS' 
					},
					{ status: 400 }
				);
			}
		}

		const game = await prisma.game.create({
			data: {
				title: title.trim(),
				description: description || '',
				type,
				data,
				isPublic: isPublic || false,
				tags: Array.isArray(tags) ? tags : [],
				userId
			}
		});

		return NextResponse.json({ 
			success: true, 
			game: {
				id: game.id,
				title: game.title,
				description: game.description,
				type: game.type,
				isPublic: game.isPublic,
				tags: game.tags,
				createdAt: game.createdAt,
				updatedAt: game.updatedAt
			},
			message: 'Game saved successfully!' 
		});
	} catch (error) {
		console.error('Error saving game:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json(
			{ 
				error: 'Failed to save game',
				code: 'SAVE_ERROR',
				details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
			},
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
