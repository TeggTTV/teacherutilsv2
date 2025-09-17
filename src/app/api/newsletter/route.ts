import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { success: false, error: 'Invalid email address' },
                { status: 400 }
            );
        }

        // Check for existing subscriber
        const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email }
        });

        if (existingSubscriber) {
            if (existingSubscriber.status === 'unsubscribed') {
                // Resubscribe user if they were unsubscribed
                await prisma.newsletterSubscriber.update({
                    where: { email },
                    data: {
                        status: 'confirmed',
                        updatedAt: new Date()
                    }
                });
                return NextResponse.json({
                    success: true,
                    message: 'Successfully resubscribed to the newsletter!'
                });
            } else {
                return NextResponse.json(
                    { success: false, error: 'This email is already subscribed.' },
                    { status: 400 }
                );
            }
        }

        // Create new subscriber directly as confirmed (no email verification needed)
        await prisma.newsletterSubscriber.create({
            data: {
                email,
                status: 'confirmed', // Direct confirmation, no email verification
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed to the newsletter!'
        });

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
