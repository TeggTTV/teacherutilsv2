import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const email = url.searchParams.get('email');

        if (!email) {
            return new NextResponse(
                JSON.stringify({ error: 'Email is required' }),
                { status: 400 }
            );
        }

        // Find the subscriber
        const subscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email }
        });

        if (!subscriber) {
            return new NextResponse(
                JSON.stringify({ status: 'unsubscribed' }),
                { status: 200 }
            );
        }

        return new NextResponse(
            JSON.stringify({ status: subscriber.status }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error checking newsletter status:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500 }
        );
    }
}
