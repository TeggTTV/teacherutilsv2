import { NextResponse } from 'next/server';

// POST /api/auth/logout - Logout user
export async function POST() {
	try {
		// Clear the auth token cookie
		const response = NextResponse.json(
			{
				success: true,
				message: 'Logout successful',
			},
			{ status: 200 }
		);

		response.cookies.set('auth-token', '', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 0, // Expire immediately
			path: '/',
		});

		return response;
	} catch (error) {
		console.error('Logout error:', error);
		return NextResponse.json(
			{
				success: false,
				error: 'Logout failed',
			},
			{ status: 500 }
		);
	}
}
