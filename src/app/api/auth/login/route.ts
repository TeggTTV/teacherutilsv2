import { NextRequest, NextResponse } from 'next/server';
import { AuthService, LoginData } from '@/lib/services/authService';

// POST /api/auth/login - Login user
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

		const loginData: LoginData = {
			email: body.email.toLowerCase().trim(),
			password: body.password,
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

		return response;
	} catch (error) {
		console.error('Login error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Login failed',
			},
			{ status: 401 }
		);
	}
}
