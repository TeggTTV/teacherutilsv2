import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { action } = await request.json();

		if (!action || !['play', 'download'].includes(action)) {
			return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
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

		// Increment the appropriate counter
		const updateField = action === 'play' ? { plays: { increment: 1 } } : { downloads: { increment: 1 } };

		await prisma.game.update({
			where: { id: params.id },
			data: updateField
		});

		return NextResponse.json({ 
			success: true,
			message: `${action} recorded successfully`
		});

	} catch (error) {
		console.error('Error recording action:', error);
		return NextResponse.json(
			{ error: 'Failed to record action' },
			{ status: 500 }
		);
	}
}
