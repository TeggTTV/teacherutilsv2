import { NextRequest, NextResponse } from 'next/server';
import { AuthService, LoginData } from '@/lib/services/authService';
import { authRateLimiter } from '@/middleware/rateLimiter';
import { addSecurityHeaders, validateJsonPayload, validateEmail, sanitizeInput } from '@/middleware/security';
import { ServerPasswordEncryption } from '@/lib/serverEncryption';

// POST /api/auth/login - Login user
export async function POST(request: NextRequest) {
	try {
		// Apply rate limiting
		const rateLimitResponse = authRateLimiter(request);
		if (rateLimitResponse) {
			return addSecurityHeaders(rateLimitResponse);
		}

		const body = await request.json();

		// Validate request payload
		const payloadValidation = validateJsonPayload(body, 1024, ['email', 'password']);
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
		if (!body.email) {
			return addSecurityHeaders(NextResponse.json(
				{
					success: false,
					error: 'Email is required',
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
		if (typeof body.email !== 'string' || typeof body.password !== 'string') {
			return addSecurityHeaders(NextResponse.json(
				{
					success: false,
					error: 'Invalid field types',
				},
				{ status: 400 }
			));
		}

		if (body.email.length > 255 || body.password.length > 255) {
			return addSecurityHeaders(NextResponse.json(
				{
					success: false,
					error: 'Field length exceeds maximum allowed',
				},
				{ status: 400 }
			));
		}

		// Validate email format
		const sanitizedEmail = sanitizeInput(body.email.toLowerCase().trim());
		if (!validateEmail(sanitizedEmail)) {
			return addSecurityHeaders(NextResponse.json(
				{
					success: false,
					error: 'Please enter a valid email address',
				},
				{ status: 400 }
			));
		}

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

		const loginData: LoginData = {
			email: sanitizedEmail,
			password: decryptedPassword,
		};

		const result = await AuthService.login(loginData);

		// Set HTTP-only cookie with the JWT token
		const response = NextResponse.json(
			{
				success: true,
				data: {
					user: result.user,
				},
				message: 'Login successful',
				trackEvent: 'login', // Signal client to track login
			},
			{ status: 200 }
		);

		response.cookies.set('auth-token', result.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7, // 7 days
			path: '/',
		});

		return addSecurityHeaders(response);
	} catch (error) {
		console.error('Login error:', error);
		return addSecurityHeaders(NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Login failed',
			},
			{ status: 401 }
		));
	}
}
