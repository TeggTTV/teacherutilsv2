import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return new NextResponse(
                JSON.stringify({ error: 'Email is required' }),
                { status: 400 }
            );
        }

        // Find and delete the subscriber
        const subscriber = await prisma.newsletterSubscriber.delete({
            where: { email }
        }).catch(() => null); // If subscriber doesn't exist, catch the error

        if (!subscriber) {
            return new NextResponse(
                JSON.stringify({ error: 'Subscriber not found' }),
                { status: 404 }
            );
        }

        return new NextResponse(
            JSON.stringify({ message: 'Successfully unsubscribed' }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error unsubscribing from newsletter:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500 }
        );
    }
}
