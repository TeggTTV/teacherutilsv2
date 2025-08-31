import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';

// POST /api/auth/change-password - Change user password
export async function POST(request: NextRequest) {
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

		const body = await request.json();

		// Validate required fields
		if (!body.currentPassword) {
			return NextResponse.json(
				{
					success: false,
					error: 'Current password is required',
				},
				{ status: 400 }
			);
		}

		if (!body.newPassword) {
			return NextResponse.json(
				{
					success: false,
					error: 'New password is required',
				},
				{ status: 400 }
			);
		}

		await AuthService.changePassword(
			user.id,
			body.currentPassword,
			body.newPassword
		);

		return NextResponse.json({
			success: true,
			message: 'Password changed successfully',
		});
	} catch (error) {
		console.error('Change password error:', error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to change password',
			},
			{ status: 400 }
		);
	}
}
