import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

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
            if (existingSubscriber.status === 'pending') {
                // Resend confirmation email to pending subscribers
                const confirmationUrl = `${process.env.NEXTAUTH_URL}/api/newsletter/confirm?token=${existingSubscriber.id}`;
                await resend.emails.send({
                    from: 'noreply@compyy.org',
                    to: email,
                    subject: '🎮 Confirm Your Email - Compyy',
                    html: `
                        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h1 style="color: #2563eb;">Confirm Your Email</h1>
                            <p>We noticed you haven't confirmed your email yet. Click the button below to complete your subscription:</p>
                            <a href="${confirmationUrl}" 
                               style="display: inline-block; padding: 15px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                               Confirm Email
                            </a>
                        </div>
                    `
                });
                return NextResponse.json({
                    success: true,
                    message: 'Confirmation email resent. Please check your inbox.'
                });
            } else {
                return NextResponse.json(
                    { success: false, error: 'This email is already subscribed.' },
                    { status: 400 }
                );
            }
        }

        // Create new subscriber in database with pending status
        const subscriber = await prisma.newsletterSubscriber.create({
            data: {
                email,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        // Generate confirmation URL with subscriber ID as token
        const confirmationUrl = `${process.env.NEXTAUTH_URL}/api/newsletter/confirm?token=${subscriber.id}`;

        // Send confirmation email using Resend
        await resend.emails.send({
            from: 'noreply@compyy.org',
            to: email,
            subject: 'Confirm Your Email - Compyy',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>Welcome to Compyy</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
                    <!-- Hero Section -->
                    <div style="text-align: center; margin-bottom: 30px; padding: 40px 20px; background: linear-gradient(to bottom right, #dbeafe, #e0e7ff); border-radius: 16px;">
                        <h1 style="color: #1e40af; margin-bottom: 10px; font-size: 32px;">One More Step!</h1>
                        <p style="color: #4b5563; font-size: 18px; margin: 0;">Please confirm your email to join Compyy</p>
                    </div>
                    
                    <!-- Confirmation Section -->
                    <div style="background-color: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                        <h2 style="color: #2563eb; margin-top: 0; font-size: 24px; text-align: center;">Confirm Your Email</h2>
                        <p style="color: #4b5563; margin-bottom: 20px; text-align: center;">Click the button below to confirm your email address and join our community of educators.</p>
                        
                        <div style="text-align: center;">
                            <a href="${confirmationUrl}" 
                               style="display: inline-block; padding: 15px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                               Confirm Email Address
                            </a>
                        </div>
                        
                        <p style="color: #6b7280; margin-top: 20px; font-size: 14px; text-align: center;">
                            Or copy and paste this URL into your browser:<br>
                            <span style="color: #2563eb;">${confirmationUrl}</span>
                        </p>
                    </div>

                    <!-- Footer -->
                    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
                            You're receiving this email because you signed up for Compyy's free templates.
                        </p>
                        <p style="color: #6b7280; font-size: 14px; margin: 0;">
                            © 2025 Compyy. All rights reserved.
                        </p>
                    </div>
                </body>
                </html>
            `
        });

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed! Check your email for the templates.'
        });

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
