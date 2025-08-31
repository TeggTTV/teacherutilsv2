import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

export async function verifyAuth(request: NextRequest): Promise<string | null> {
	try {
		// Check for token in cookies (used by the app)
		const token = request.cookies.get('auth-token')?.value;
		
		if (!token) {
			return null;
		}

		const decoded = jwt.verify(token, JWT_SECRET) as {
			userId: string;
			email: string;
		};

		return decoded.userId;
	} catch (error) {
		console.error('Auth verification failed:', error);
		return null;
	}
}
