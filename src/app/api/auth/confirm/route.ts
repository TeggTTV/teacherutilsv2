import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const token = searchParams.get('token');

		if (!token) {
			return NextResponse.redirect(
				new URL('/auth/confirm?error=missing-token', request.url)
			);
		}

		// Find user by ID (token is the user ID)
		const user = await prisma.user.findUnique({
			where: { id: token },
		});

		if (!user) {
			return NextResponse.redirect(
				new URL('/auth/confirm?error=invalid-token', request.url)
			);
		}

		if (user.isVerified) {
			return NextResponse.redirect(
				new URL('/auth/confirm?message=already-verified', request.url)
			);
		}

		// Update user verification status
		await prisma.user.update({
			where: { id: token },
			data: {
				isVerified: true,
				updatedAt: new Date(),
			},
		});

		// Approve any pending referrals for this user and increment raffleTickets for all upstream referrers
		const pendingReferrals = await prisma.referral.findMany({
			where: { referredId: token, status: 'pending' },
		});
		for (const referral of pendingReferrals) {
			await prisma.referral.update({
				where: { id: referral.id },
				data: { status: 'approved' },
			});

			// Multi-level ticket awarding
			let currentReferrerId = referral.referrerId;
			const visited = new Set();
			while (currentReferrerId && !visited.has(currentReferrerId)) {
				visited.add(currentReferrerId);
				await prisma.user.update({
					where: { id: currentReferrerId },
					data: { raffleTickets: { increment: 1 } },
				});
				// Find the next referrer up the chain
				const parentReferral = await prisma.referral.findFirst({
					where: {
						referredId: currentReferrerId,
						status: 'approved',
					},
				});
				if (parentReferral) {
					currentReferrerId = parentReferral.referrerId;
				} else {
					break;
				}
			}
		}

		// Optionally, update the user object in the response so the frontend sees the new ticket count immediately
		// (If you want to return JSON instead of redirect, you could do so here)

		// Redirect to confirmation page with success message
		return NextResponse.redirect(
			new URL('/auth/confirm?message=email-verified', request.url)
		);
	} catch (error) {
		console.error('Email confirmation error:', error);
		return NextResponse.redirect(
			new URL('/auth/confirm?error=verification-failed', request.url)
		);
	}
}
