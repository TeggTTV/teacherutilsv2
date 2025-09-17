import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';
import { authRateLimiter } from '@/middleware/rateLimiter';
import { addSecurityHeaders, validateJsonPayload, sanitizeInput } from '@/middleware/security';
import { ServerPasswordEncryption } from '@/lib/serverEncryption';

// POST /api/auth/reset-password - Reset password using token
export async function POST(request: NextRequest) {
	try {
		// Apply rate limiting
		const rateLimitResponse = authRateLimiter(request);
		if (rateLimitResponse) {
			return addSecurityHeaders(rateLimitResponse);
		}

		const body = await request.json();

		// Validate request payload
		const payloadValidation = validateJsonPayload(body, 1024, ['token', 'password']);
		if (!payloadValidation.isValid) {
			return addSecurityHeaders(NextResponse.json(
				{
					success: false,
					error: payloadValidation.error,
				},
				{ status: 400 }
			));
		}

		// Validate required fields
		if (!body.token) {
			return addSecurityHeaders(NextResponse.json(
				{
					success: false,
					error: 'Reset token is required',
				},
				{ status: 400 }
			));
		}

		if (!body.password) {
			return addSecurityHeaders(NextResponse.json(
				{
					success: false,
					error: 'Password is required',
				},
				{ status: 400 }
			));
		}

		// Validate field types and lengths
		if (typeof body.token !== 'string' || typeof body.password !== 'string') {
			return addSecurityHeaders(NextResponse.json(
				{
					success: false,
					error: 'Invalid field types',
				},
				{ status: 400 }
			));
		}

		if (body.token.length > 128 || body.password.length > 255) {
			return addSecurityHeaders(NextResponse.json(
				{
					success: false,
					error: 'Field length exceeds maximum allowed',
				},
				{ status: 400 }
			));
		}

		// Sanitize token
		const sanitizedToken = sanitizeInput(body.token.trim());

		// Decrypt password if encrypted
		let decryptedPassword: string;
		try {
			decryptedPassword = ServerPasswordEncryption.safeDecryptPassword(body.password);
		} catch {
			return addSecurityHeaders(NextResponse.json(
				{
					success: false,
					error: 'Invalid password format',
				},
				{ status: 400 }
			));
		}

		// Reset password
		await AuthService.resetPassword(sanitizedToken, decryptedPassword);

		return addSecurityHeaders(NextResponse.json(
			{
				success: true,
				message: 'Password has been reset successfully. You can now log in with your new password.',
			},
			{ status: 200 }
		));

	} catch (error) {
		console.error('Reset password error:', error);
		return addSecurityHeaders(NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to reset password',
			},
			{ status: 400 }
		));
	}
}

// GET /api/auth/reset-password - Validate reset token
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const token = searchParams.get('token');

		if (!token) {
			return addSecurityHeaders(NextResponse.json(
				{
					success: false,
					error: 'Reset token is required',
				},
				{ status: 400 }
			));
		}

		// Validate token
		const user = await AuthService.validatePasswordResetToken(sanitizeInput(token.trim()));

		return addSecurityHeaders(NextResponse.json(
			{
				success: true,
				data: {
					email: user.email,
					firstName: user.firstName,
				},
			},
			{ status: 200 }
		));

	} catch (error) {
		console.error('Token validation error:', error);
		return addSecurityHeaders(NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Invalid or expired reset token',
			},
			{ status: 400 }
		));
	}
}