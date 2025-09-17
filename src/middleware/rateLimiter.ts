import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (in production, use Redis)
interface RateLimitStore {
	[key: string]: {
		count: number;
		resetTime: number;
	};
}

const rateLimitStore: RateLimitStore = {};

// Clean up expired entries every 5 minutes
setInterval(() => {
	const now = Date.now();
	Object.keys(rateLimitStore).forEach(key => {
		if (rateLimitStore[key].resetTime < now) {
			delete rateLimitStore[key];
		}
	});
}, 5 * 60 * 1000);

export interface RateLimitConfig {
	maxAttempts: number;
	windowMs: number;
	keyGenerator?: (request: NextRequest) => string;
}

/**
 * Rate limiting middleware for API routes
 */
export function createRateLimiter(config: RateLimitConfig) {
	const { maxAttempts, windowMs, keyGenerator } = config;

	return function rateLimiter(request: NextRequest): NextResponse | null {
		// Generate unique key for this client
		const ip = request.headers.get('x-forwarded-for') || 
				  request.headers.get('x-real-ip') || 
				  'unknown';
		const key = keyGenerator 
			? keyGenerator(request)
			: `${ip}-${request.url}`;

		const now = Date.now();
		const windowStart = now - windowMs;

		// Get or create rate limit entry
		let entry = rateLimitStore[key];
		
		if (!entry || entry.resetTime < now) {
			// Create new entry or reset expired entry
			entry = {
				count: 1,
				resetTime: now + windowMs,
			};
			rateLimitStore[key] = entry;
		} else if (entry.resetTime > windowStart) {
			// Increment count if within window
			entry.count++;
		} else {
			// Reset if window has passed
			entry.count = 1;
			entry.resetTime = now + windowMs;
		}

		// Check if limit exceeded
		if (entry.count > maxAttempts) {
			const remainingTime = Math.ceil((entry.resetTime - now) / 1000);
			const remaining = Math.max(0, maxAttempts - entry.count);
			
			return NextResponse.json(
				{
					success: false,
					error: 'Too many attempts. Please try again later.',
					retryAfter: remainingTime,
				},
				{ 
					status: 429,
					headers: {
						'Retry-After': remainingTime.toString(),
						'X-RateLimit-Limit': maxAttempts.toString(),
						'X-RateLimit-Remaining': remaining.toString(),
						'X-RateLimit-Reset': entry.resetTime.toString(),
					}
				}
			);
		}

		// Return null to continue processing
		return null;
	};
}

/**
 * Rate limiter specifically for authentication endpoints
 */
export const authRateLimiter = createRateLimiter({
	maxAttempts: 5, // 5 attempts per window
	windowMs: 15 * 60 * 1000, // 15 minutes
	keyGenerator: (request) => {
		// Use IP address for rate limiting
		const ip = request.headers.get('x-forwarded-for') || 
				  request.headers.get('x-real-ip') || 
				  'unknown';
		return `auth-${ip}`;
	},
});

/**
 * Stricter rate limiter for password change operations
 */
export const passwordChangeRateLimiter = createRateLimiter({
	maxAttempts: 3, // 3 attempts per window
	windowMs: 60 * 60 * 1000, // 1 hour
	keyGenerator: (request) => {
		const ip = request.headers.get('x-forwarded-for') || 
				  request.headers.get('x-real-ip') || 
				  'unknown';
		return `password-change-${ip}`;
	},
});

/**
 * Apply rate limiting headers to response
 */
export function applyRateLimitHeaders(
	response: NextResponse, 
	maxAttempts: number, 
	remaining: number, 
	resetTime: number
): NextResponse {
	response.headers.set('X-RateLimit-Limit', maxAttempts.toString());
	response.headers.set('X-RateLimit-Remaining', remaining.toString());
	response.headers.set('X-RateLimit-Reset', resetTime.toString());
	return response;
}