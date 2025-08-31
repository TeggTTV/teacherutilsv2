import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';

// GET /api/auth/me - Get current user info
export async function GET(request: NextRequest) {
	try {
		// Get token from cookie
		const token = request.cookies.get('auth-token')?.value;

		if (!token) {
			return NextResponse.json(
				{
					success: false,
					error: 'No authentication token found',
				},
				{ status: 401 }
			);
		}

		const user = await AuthService.getUserByToken(token);

		if (!user) {
			return NextResponse.json(
				{
					success: false,
					error: 'Invalid or expired token',
				},
				{ status: 401 }
			);
		}

		return NextResponse.json({
			success: true,
			data: {
				user,
			},
		});
	} catch (error) {
		console.error('Get user error:', error);
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to get user information',
			},
			{ status: 500 }
		);
	}
}
