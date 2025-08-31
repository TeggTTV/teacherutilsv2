import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/userService';

// GET /api/users/[id]/stats - Get user statistics
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		const stats = await UserService.getUserStats(id);

		return NextResponse.json({
			success: true,
			data: stats,
		});
	} catch (error) {
		console.error('Error fetching user stats:', error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to fetch user statistics',
			},
			{ status: 500 }
		);
	}
}
