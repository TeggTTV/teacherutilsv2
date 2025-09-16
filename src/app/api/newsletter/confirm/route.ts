import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const token = url.searchParams.get('token');

        if (!token) {
            return new NextResponse('Invalid confirmation link', {
                status: 400,
                headers: { 'Content-Type': 'text/html' },
            });
        }

        // Find and update the subscriber
        const subscriber = await prisma.newsletterSubscriber.findFirst({
            where: {
                id: token,
                status: 'pending'
            }
        });

        // Check if the link has expired (24 hours)
        if (subscriber && subscriber.createdAt) {
            const linkAge = Date.now() - subscriber.createdAt.getTime();
            const isExpired = linkAge > 24 * 60 * 60 * 1000; // 24 hours in milliseconds

            if (isExpired) {
                // Generate new confirmation URL
                const newConfirmationUrl = `${process.env.NEXTAUTH_URL}/api/newsletter/confirm?token=${subscriber.id}`;
                
                // Send new confirmation email
                await resend.emails.send({
                    from: 'noreply@compyy.org',
                    to: subscriber.email,
                    subject: '🎮 New Confirmation Link - Compyy',
                    html: `
                        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h1 style="color: #2563eb;">New Confirmation Link</h1>
                            <p>Your previous link expired. Here's a new link to confirm your email:</p>
                            <a href="${newConfirmationUrl}" 
                               style="display: inline-block; padding: 15px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                               Confirm Email
                            </a>
                        </div>
                    `
                });

                return new NextResponse(`
                    <html>
                        <head>
                            <title>Link Expired</title>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 40px auto; padding: 20px; text-align: center; }
                                .warning { color: #d97706; }
                                .container { background-color: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1 class="warning">Link Expired</h1>
                                <p>This confirmation link has expired. We've sent you a new confirmation email.</p>
                                <p>Please check your inbox and click the new link.</p>
                            </div>
                        </body>
                    </html>
                `, {
                    status: 400,
                    headers: { 'Content-Type': 'text/html' },
                });
            }
        }

        if (!subscriber) {
            return new NextResponse(`
                <html>
                    <head>
                        <title>Invalid Link</title>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 40px auto; padding: 20px; text-align: center; }
                            .error { color: #dc2626; }
                            .container { background-color: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1 class="error">Invalid or Expired Link</h1>
                            <p>This confirmation link is invalid or has already been used.</p>
                        </div>
                    </body>
                </html>
            `, {
                status: 400,
                headers: { 'Content-Type': 'text/html' },
            });
        }

        // Update subscriber status to confirmed
        await prisma.newsletterSubscriber.update({
            where: { id: token },
            data: { status: 'confirmed' }
        });

        // Return success page
        return new NextResponse(`
            <html>
                <head>
                    <title>Email Confirmed!</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 40px auto; padding: 20px; text-align: center; }
                        .success { color: #059669; }
                        .container { background-color: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1 class="success">Email Confirmed!</h1>
                        <p>Thank you for confirming your email address. You're now subscribed to Compyy updates!</p>
                    </div>
                </body>
            </html>
        `, {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
        });

    } catch (error) {
        console.error('Email confirmation error:', error);
        return new NextResponse('Error confirming email', { status: 500 });
    }
}
