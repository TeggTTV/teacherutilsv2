import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/referrals/validate?code=XXXXX - Validate referral code
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const code = searchParams.get('code');

		if (!code) {
			return NextResponse.json({
				valid: false,
				message: 'Referral code is required',
			});
		}

		// Check if referral code exists and is active
		const referralLink = await prisma.referralLink.findUnique({
			where: { code },
			include: {
				user: {
					select: {
						firstName: true,
						lastName: true,
						username: true,
					},
				},
			},
		});

		if (!referralLink || !referralLink.active) {
			return NextResponse.json({
				valid: false,
				message: 'Invalid or expired referral code',
			});
		}

		return NextResponse.json({
			valid: true,
			message: `Valid referral code from ${referralLink.user.firstName || referralLink.user.username || 'a user'}`,
			referrer: {
				name: referralLink.user.firstName && referralLink.user.lastName 
					? `${referralLink.user.firstName} ${referralLink.user.lastName}`
					: referralLink.user.username,
			},
		});
	} catch (error) {
		console.error('Error validating referral code:', error);
		return NextResponse.json(
			{
				valid: false,
				message: 'Error validating referral code',
			},
			{ status: 500 }
		);
	}
}