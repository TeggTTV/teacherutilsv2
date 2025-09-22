import { NextRequest, NextResponse } from 'next/server';
import { AuthService, RegisterData } from '@/lib/services/authService';
import { authRateLimiter } from '@/middleware/rateLimiter';
import { ServerPasswordEncryption } from '@/lib/serverEncryption';
import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
	try {
		// Apply rate limiting
		const rateLimitResponse = authRateLimiter(request);
		if (rateLimitResponse) {
			return rateLimitResponse;
		}

		const body = await request.json();

		// Validate request body size (prevent large payload attacks)
		const bodyString = JSON.stringify(body);
		if (bodyString.length > 2048) { // 2KB limit for registration (more fields)
			return NextResponse.json(
				{
					success: false,
					error: 'Request payload too large',
				},
				{ status: 413 }
			);
		}

		// Validate required fields
		if (!body.email) {
			return NextResponse.json(
				{
					success: false,
					error: 'Email is required',
				},
				{ status: 400 }
			);
		}

		if (!body.password) {
			return NextResponse.json(
				{
					success: false,
					error: 'Password is required',
				},
				{ status: 400 }
			);
		}

		// Validate field types
		if (typeof body.email !== 'string' || typeof body.password !== 'string') {
			return NextResponse.json(
				{
					success: false,
					error: 'Invalid field types',
				},
				{ status: 400 }
			);
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(body.email)) {
			return NextResponse.json(
				{
					success: false,
					error: 'Please enter a valid email address',
				},
				{ status: 400 }
			);
		}

		// Validate field lengths
		if (body.email.length > 255 || body.password.length > 255) {
			return NextResponse.json(
				{
					success: false,
					error: 'Field length exceeds maximum allowed',
				},
				{ status: 400 }
			);
		}

		// Decrypt password if encrypted
		let decryptedPassword: string;
		try {
			decryptedPassword = ServerPasswordEncryption.safeDecryptPassword(body.password);
		} catch {
			return NextResponse.json(
				{
					success: false,
					error: 'Invalid password format',
				},
				{ status: 400 }
			);
		}

		const registerData: RegisterData = {
			email: body.email.toLowerCase().trim(),
			password: decryptedPassword,
			firstName: body.firstName?.trim(),
			lastName: body.lastName?.trim(),
			username: body.username?.trim(),
			school: body.school?.trim(),
			grade: body.grade?.trim(),
			subject: body.subject?.trim(),
			referralCode: body.referralCode?.trim(),
		};

		const result = await AuthService.register(registerData);

		// Send email verification after successful registration
		try {
			const confirmationUrl = `${process.env.NEXTAUTH_URL}/api/auth/confirm?token=${result.user.id}`;
			
			await resend.emails.send({
				from: 'noreply@compyy.org',
				to: registerData.email,
				subject: 'Welcome to Compyy - Please verify your email',
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
							<h1 style="color: #1e40af; margin-bottom: 10px; font-size: 32px;">Welcome to Compyy!</h1>
							<p style="color: #4b5563; font-size: 18px; margin: 0;">Please verify your email to complete your registration</p>
						</div>
						
						<!-- Greeting Section -->
						<div style="background-color: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
							<h2 style="color: #2563eb; margin-top: 0; font-size: 24px;">Hi${result.user.firstName ? ` ${result.user.firstName}` : ''}!</h2>
							<p style="color: #4b5563; margin-bottom: 20px;">
								Thank you for joining Compyy! You're now part of our community of educators creating amazing learning experiences.
							</p>
							<p style="color: #4b5563; margin-bottom: 30px;">
								To complete your registration and start using all of Compyy's features, please click the button below to verify your email address:
							</p>
							
							<div style="text-align: center;">
								<a href="${confirmationUrl}" 
								   style="display: inline-block; padding: 15px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
								   Verify Email Address
								</a>
							</div>
							
							<p style="color: #6b7280; margin-top: 20px; font-size: 14px; text-align: center;">
								Or copy and paste this URL into your browser:<br>
								<span style="color: #2563eb; word-break: break-all;">${confirmationUrl}</span>
							</p>
						</div>

						<!-- What's Next Section -->
						<div style="background-color: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
							<h3 style="color: #2563eb; margin-top: 0; font-size: 20px;">What you can do with Compyy:</h3>
							<ul style="color: #4b5563; padding-left: 20px;">
								<li style="margin-bottom: 10px;">🎮 Create interactive Jeopardy games for your classroom</li>
								<li style="margin-bottom: 10px;">📚 Access free templates to get started quickly</li>
								<li style="margin-bottom: 10px;">🚀 Share your games with other educators</li>
								<li style="margin-bottom: 10px;">⭐ Save and organize your favorite games</li>
							</ul>
						</div>

						<!-- Footer -->
						<div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
							<p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
								You're receiving this email because you created an account at Compyy.
							</p>
							<p style="color: #6b7280; font-size: 14px; margin: 0;">
								© 2025 Compyy. All rights reserved.
							</p>
						</div>
					</body>
					</html>
				`
			});
		} catch (emailError) {
			console.error('Failed to send verification email:', emailError);
			// Don't fail the registration if email sending fails
		}

		// Set HTTP-only cookie with the JWT token
		const response = NextResponse.json(
			{
				success: true,
				data: {
					user: result.user,
				},
				message: 'Registration successful! Please check your email to verify your account.',
				emailSent: true, // Indicate that verification email was attempted
				trackEvent: 'signup', // Signal client to track signup
			},
			{ status: 201 }
		);

		response.cookies.set('auth-token', result.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7, // 7 days
			path: '/',
		});

		return response;
	} catch (error) {
		console.error('Registration error:', error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Registration failed',
			},
			{ status: 400 }
		);
	}
}
