import { NextRequest, NextResponse } from 'next/server';
import { AuthService, RegisterData } from '@/lib/services/authService';

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate required fields
		if (!body.email) {
			return NextResponse.json(
				{
					success: false,
					error: 'Email is required',
				},
				{ status: 400 }
			);
		}

		if (!body.password) {
			return NextResponse.json(
				{
					success: false,
					error: 'Password is required',
				},
				{ status: 400 }
			);
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(body.email)) {
			return NextResponse.json(
				{
					success: false,
					error: 'Please enter a valid email address',
				},
				{ status: 400 }
			);
		}

		const registerData: RegisterData = {
			email: body.email.toLowerCase().trim(),
			password: body.password,
			firstName: body.firstName?.trim(),
			lastName: body.lastName?.trim(),
			username: body.username?.trim(),
			school: body.school?.trim(),
			grade: body.grade?.trim(),
			subject: body.subject?.trim(),
		};

		const result = await AuthService.register(registerData);

		// Set HTTP-only cookie with the JWT token
		const response = NextResponse.json(
			{
				success: true,
				data: {
					user: result.user,
				},
				message: 'Registration successful',
			},
			{ status: 201 }
		);

		response.cookies.set('auth-token', result.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7, // 7 days
			path: '/',
		});

		return response;
	} catch (error) {
		console.error('Registration error:', error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Registration failed',
			},
			{ status: 400 }
		);
	}
}
