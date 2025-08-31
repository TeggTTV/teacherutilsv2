import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const token = request.cookies.get('auth-token')?.value;
		
		if (!token) {
			return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
		}

		const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { userId: string };
		const userId = decoded.userId;

		const game = await prisma.game.findFirst({
			where: {
				id: id,
				userId // Ensure user owns the game
			}
		});

		if (!game) {
			return NextResponse.json({ error: 'Game not found' }, { status: 404 });
		}

		return NextResponse.json({ game });
	} catch (error) {
		console.error('Error fetching game:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch game' },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const token = request.cookies.get('auth-token')?.value;
		
		if (!token) {
			return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
		}

		const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { userId: string };
		const userId = decoded.userId;

		const body = await request.json();
		const { title, description, data, isPublic, tags } = body;

		const game = await prisma.game.updateMany({
			where: { 
				id: id,
				userId // Ensure user owns the game
			},
			data: {
				title,
				description,
				data,
				isPublic,
				tags,
				updatedAt: new Date()
			}
		});

		if (game.count === 0) {
			return NextResponse.json({ error: 'Game not found' }, { status: 404 });
		}

		const updatedGame = await prisma.game.findUnique({
			where: { id: id }
		});

		return NextResponse.json({ 
			success: true, 
			game: updatedGame,
			id: updatedGame?.id,
			message: 'Game updated successfully!' 
		});
	} catch (error) {
		console.error('Error updating game:', error);
		return NextResponse.json(
			{ error: 'Failed to update game' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const token = request.cookies.get('auth-token')?.value;
		
		if (!token) {
			return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
		}

		const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { userId: string };
		const userId = decoded.userId;

		const game = await prisma.game.deleteMany({
			where: { 
				id: id,
				userId // Ensure user owns the game
			}
		});

		if (game.count === 0) {
			return NextResponse.json({ error: 'Game not found' }, { status: 404 });
		}

		return NextResponse.json({ 
			success: true,
			message: 'Game deleted successfully!' 
		});
	} catch (error) {
		console.error('Error deleting game:', error);
		return NextResponse.json(
			{ error: 'Failed to delete game' },
			{ status: 500 }
		);
	}
}
