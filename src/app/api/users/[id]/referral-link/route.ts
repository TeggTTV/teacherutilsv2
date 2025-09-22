import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

// POST /api/users/[id]/referral-link - Create a referral link for a user if not exists
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		// Check if user already has an active referral link
		let referralLink = await prisma.referralLink.findFirst({
			where: { userId: id, active: true },
		});
		if (!referralLink) {
			// Generate a unique code
			const code = nanoid(8);
			referralLink = await prisma.referralLink.create({
				data: {
					userId: id,
					code,
					active: true,
				},
			});
		}
		return NextResponse.json({ success: true, code: referralLink.code });
	} catch (error) {
		console.error('Error creating referral link:', error);
		return NextResponse.json(
			{ success: false, error: 'Failed to create referral link' },
			{ status: 500 }
		);
	}
}
