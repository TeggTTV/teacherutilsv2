import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const token = searchParams.get('token');

		if (!token) {
			return NextResponse.redirect(new URL('/dashboard?error=missing-token', request.url));
		}

		// Find user by ID (token is the user ID)
		const user = await prisma.user.findUnique({
			where: { id: token }
		});

		if (!user) {
			return NextResponse.redirect(new URL('/dashboard?error=invalid-token', request.url));
		}

		if (user.isVerified) {
			return NextResponse.redirect(new URL('/dashboard?message=already-verified', request.url));
		}

		// Update user verification status
		await prisma.user.update({
			where: { id: token },
			data: { 
				isVerified: true,
				updatedAt: new Date()
			}
		});

		// Redirect to dashboard with success message
		return NextResponse.redirect(new URL('/dashboard?message=email-verified', request.url));

	} catch (error) {
		console.error('Email confirmation error:', error);
		return NextResponse.redirect(new URL('/dashboard?error=verification-failed', request.url));
	}
}