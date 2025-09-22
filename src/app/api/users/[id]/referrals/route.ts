import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/[id]/referrals - Get referral link, tickets, and referrals for a user
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		// Get referral link (active)
		const referralLink = await prisma.referralLink.findFirst({
			where: { userId: id, active: true },
		});
		// Get raffle tickets
		const user = await prisma.user.findUnique({
			where: { id },
			select: { raffleTickets: true },
		});
		// Get referrals (approved)
		const referrals = await prisma.referral.findMany({
			where: { referrerId: id },
			include: { referred: true },
			orderBy: { createdAt: 'desc' },
		});
		return NextResponse.json({
			success: true,
			data: {
				referralLink: referralLink ? referralLink.code : null,
				raffleTickets: user?.raffleTickets ?? 0,
				referrals: referrals.map((r) => ({
					name:
						r.referred.firstName && r.referred.lastName
							? `${r.referred.firstName} ${r.referred.lastName}`
							: r.referred.email,
					email: r.referred.email,
					status: r.status,
				})),
			},
		});
	} catch (error) {
		console.error('Error fetching referral data:', error);
		return NextResponse.json(
			{ success: false, error: 'Failed to fetch referral data' },
			{ status: 500 }
		);
	}
}
