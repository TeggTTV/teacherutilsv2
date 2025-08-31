import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthenticatedRequest extends NextRequest {
	user?: {
		userId: string;
		email: string;
	};
}

export function verifyToken(token: string) {
	try {
		return jwt.verify(token, JWT_SECRET) as {
			userId: string;
			email: string;
			iat: number;
			exp: number;
		};
	} catch {
		return null;
	}
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
	return async (req: AuthenticatedRequest) => {
		try {
			const authHeader = req.headers.get('authorization');
			const token = authHeader?.replace('Bearer ', '');

			if (!token) {
				return NextResponse.json(
					{ error: 'Authentication required' },
					{ status: 401 }
				);
			}

			const decoded = verifyToken(token);
			if (!decoded) {
				return NextResponse.json(
					{ error: 'Invalid token' },
					{ status: 401 }
				);
			}

			req.user = {
				userId: decoded.userId,
				email: decoded.email,
			};

			return handler(req);
		} catch (error) {
			console.error('Auth middleware error:', error);
			return NextResponse.json(
				{ error: 'Authentication failed' },
				{ status: 500 }
			);
		}
	};
}
