import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';
import { passwordChangeRateLimiter } from '@/middleware/rateLimiter';
import { ServerPasswordEncryption } from '@/lib/serverEncryption';

// POST /api/auth/change-password - Change user password
export async function POST(request: NextRequest) {
	try {
		// Apply stricter rate limiting for password changes
		const rateLimitResponse = passwordChangeRateLimiter(request);
		if (rateLimitResponse) {
			return rateLimitResponse;
		}

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

		// Validate request body size
		const bodyString = JSON.stringify(body);
		if (bodyString.length > 1024) { // 1KB limit
			return NextResponse.json(
				{
					success: false,
					error: 'Request payload too large',
				},
				{ status: 413 }
			);
		}

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

		// Validate field types and lengths
		if (typeof body.currentPassword !== 'string' || typeof body.newPassword !== 'string') {
			return NextResponse.json(
				{
					success: false,
					error: 'Invalid field types',
				},
				{ status: 400 }
			);
		}

		if (body.currentPassword.length > 255 || body.newPassword.length > 255) {
			return NextResponse.json(
				{
					success: false,
					error: 'Password length exceeds maximum allowed',
				},
				{ status: 400 }
			);
		}

		// Decrypt passwords if encrypted
		let decryptedCurrentPassword: string;
		let decryptedNewPassword: string;
		
		try {
			decryptedCurrentPassword = ServerPasswordEncryption.safeDecryptPassword(body.currentPassword);
			decryptedNewPassword = ServerPasswordEncryption.safeDecryptPassword(body.newPassword);
		} catch {
			return NextResponse.json(
				{
					success: false,
					error: 'Invalid password format',
				},
				{ status: 400 }
			);
		}

		// Check that new password is different from current
		if (decryptedCurrentPassword === decryptedNewPassword) {
			return NextResponse.json(
				{
					success: false,
					error: 'New password must be different from current password',
				},
				{ status: 400 }
			);
		}

		await AuthService.changePassword(
			user.id,
			decryptedCurrentPassword,
			decryptedNewPassword
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
