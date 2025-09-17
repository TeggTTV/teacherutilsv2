import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';
import { authRateLimiter } from '@/middleware/rateLimiter';
import {
	addSecurityHeaders,
	validateJsonPayload,
	validateEmail,
	sanitizeInput,
} from '@/middleware/security';
import { Resend } from 'resend';
import { getApiUrl } from '@/lib/config';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/auth/forgot-password - Request password reset
export async function POST(request: NextRequest) {
	try {
		// Apply rate limiting
		const rateLimitResponse = authRateLimiter(request);
		if (rateLimitResponse) {
			return addSecurityHeaders(rateLimitResponse);
		}

		const body = await request.json();

		// Validate request payload
		const payloadValidation = validateJsonPayload(body, 512, ['email']);
		if (!payloadValidation.isValid) {
			return addSecurityHeaders(
				NextResponse.json(
					{
						success: false,
						error: payloadValidation.error,
					},
					{ status: 400 }
				)
			);
		}

		// Validate required fields
		if (!body.email) {
			return addSecurityHeaders(
				NextResponse.json(
					{
						success: false,
						error: 'Email is required',
					},
					{ status: 400 }
				)
			);
		}

		// Validate field types and lengths
		if (typeof body.email !== 'string') {
			return addSecurityHeaders(
				NextResponse.json(
					{
						success: false,
						error: 'Invalid field types',
					},
					{ status: 400 }
				)
			);
		}

		if (body.email.length > 255) {
			return addSecurityHeaders(
				NextResponse.json(
					{
						success: false,
						error: 'Email length exceeds maximum allowed',
					},
					{ status: 400 }
				)
			);
		}

		// Validate email format
		const sanitizedEmail = sanitizeInput(body.email.toLowerCase().trim());
		if (!validateEmail(sanitizedEmail)) {
			return addSecurityHeaders(
				NextResponse.json(
					{
						success: false,
						error: 'Please enter a valid email address',
					},
					{ status: 400 }
				)
			);
		}

		try {
			// Initiate password reset
			const { token, user } = await AuthService.initiatePasswordReset(
				sanitizedEmail
			);

			// Send password reset email
			const resetUrl = `${getApiUrl('')}/reset-password?token=${token}`;
			const emailHtml = `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<title>Reset Your Password - Compyy</title>
				</head>
				<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="text-align: center; margin-bottom: 30px;">
						<h1 style="color: #2563eb;">Compyy</h1>
					</div>
					
					<h2>Password Reset Request</h2>
					
					<p>Hi ${user.firstName || 'there'},</p>
					
					<p>We received a request to reset your password for your Compyy account. If you didn't make this request, you can safely ignore this email.</p>
					
					<div style="text-align: center; margin: 30px 0;">
						<a href="${resetUrl}" 
							 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
							Reset Your Password
						</a>
					</div>
					
					<p>Or copy and paste this link into your browser:</p>
					<p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
					
					<p><strong>This link will expire in 1 hour.</strong></p>
					
					<div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #666;">
						<p>If you're having trouble clicking the reset button, copy and paste the URL into your web browser.</p>
						<p>This email was sent to ${sanitizedEmail}. If you didn't request a password reset, please ignore this email.</p>
					</div>
				</body>
				</html>
			`;

			await resend.emails.send({
				from: 'Compyy <noreply@compyy.org>',
				to: [sanitizedEmail],
				subject: 'Reset Your Password - Compyy',
				html: emailHtml,
			});

			// Always return success for security (don't reveal if email exists)
			return addSecurityHeaders(
				NextResponse.json(
					{
						success: true,
						message:
							"If an account with that email exists, we've sent a password reset link.",
					},
					{ status: 200 }
				)
			);
		} catch (error) {
			console.error('Password reset error:', error);

			// Always return success for security (don't reveal if email exists)
			return addSecurityHeaders(
				NextResponse.json(
					{
						success: true,
						message:
							"If an account with that email exists, we've sent a password reset link.",
					},
					{ status: 200 }
				)
			);
		}
	} catch (error) {
		console.error('Forgot password error:', error);
		return addSecurityHeaders(
			NextResponse.json(
				{
					success: false,
					error: 'Something went wrong. Please try again.',
				},
				{ status: 500 }
			)
		);
	}
}
