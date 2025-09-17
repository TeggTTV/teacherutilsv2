import { NextRequest, NextResponse } from 'next/server';

/**
 * Security headers middleware to add common security headers
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
	// Prevent MIME type sniffing
	response.headers.set('X-Content-Type-Options', 'nosniff');
	
	// Prevent clickjacking attacks
	response.headers.set('X-Frame-Options', 'DENY');
	
	// XSS Protection
	response.headers.set('X-XSS-Protection', '1; mode=block');
	
	// Referrer Policy
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	
	// Content Security Policy (basic)
	response.headers.set(
		'Content-Security-Policy',
		"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
	);
	
	// Remove server information
	response.headers.delete('Server');
	response.headers.delete('X-Powered-By');
	
	return response;
}

/**
 * Input sanitization helper
 */
export function sanitizeInput(input: string): string {
	// Remove null bytes, control characters, and trim whitespace
	return input
		.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
		.trim()
		.substring(0, 1000); // Limit length
}

/**
 * Email validation helper
 */
export function validateEmail(email: string): boolean {
	const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
	return email.length <= 320 && emailRegex.test(email);
}

/**
 * Check for common SQL injection patterns (additional layer of protection)
 */
export function containsSQLInjection(input: string): boolean {
	const sqlPatterns = [
		/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
		/(--|#|\/\*|\*\/)/,
		/(\b(OR|AND)\s+\w+\s*=\s*\w+)/i,
		/('|(\\x27)|(\\x2D\\x2D))/i,
	];
	
	return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate JSON payload structure and size
 */
export function validateJsonPayload(
	body: unknown,
	maxSize: number = 1024,
	allowedFields: string[] = []
): { isValid: boolean; error?: string } {
	try {
		const bodyString = JSON.stringify(body);
		
		// Check size
		if (bodyString.length > maxSize) {
			return { isValid: false, error: 'Request payload too large' };
		}
		
		// Check for suspicious content
		if (containsSQLInjection(bodyString)) {
			return { isValid: false, error: 'Invalid request content' };
		}
		
		// If allowedFields is provided, check for unexpected fields
		if (allowedFields.length > 0 && typeof body === 'object' && body !== null) {
			const providedFields = Object.keys(body);
			const unexpectedFields = providedFields.filter(field => !allowedFields.includes(field));
			
			if (unexpectedFields.length > 0) {
				return { isValid: false, error: 'Unexpected fields in request' };
			}
		}
		
		return { isValid: true };
	} catch {
		return { isValid: false, error: 'Invalid JSON format' };
	}
}

/**
 * Generate a simple CSRF token
 */
export function generateCSRFToken(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < 32; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

/**
 * Validate CSRF token (basic implementation)
 */
export function validateCSRFToken(request: NextRequest, expectedToken?: string): boolean {
	if (!expectedToken) return true; // Skip validation if no token expected
	
	const tokenFromHeader = request.headers.get('X-CSRF-Token');
	const tokenFromCookie = request.cookies.get('csrf-token')?.value;
	
	return tokenFromHeader === expectedToken && tokenFromCookie === expectedToken;
}

/**
 * Add CSRF token to response
 */
export function addCSRFToken(response: NextResponse): NextResponse {
	const token = generateCSRFToken();
	
	// Set CSRF token in cookie and header
	response.cookies.set('csrf-token', token, {
		httpOnly: false, // Need to be accessible to frontend
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 60 * 60 * 24, // 24 hours
		path: '/',
	});
	
	response.headers.set('X-CSRF-Token', token);
	
	return response;
}