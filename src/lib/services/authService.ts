import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// Types
export interface RegisterData {
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
	username?: string;
	school?: string;
	grade?: string;
	subject?: string;
}

export interface LoginData {
	email: string;
	password: string;
}

export interface JWTPayload {
	userId: string;
	email: string;
	iat?: number;
	exp?: number;
}

export interface AuthUser {
	id: string;
	email: string;
	firstName?: string | null;
	lastName?: string | null;
	username?: string | null;
	profileImage?: string | null;
	bio?: string | null;
	school?: string | null;
	grade?: string | null;
	subject?: string | null;
	isVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Constants
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key';
const JWT_EXPIRE = '7d'; // Token expires in 7 days
const SALT_ROUNDS = 12;

export class AuthService {
	/**
	 * Hash a password
	 */
	static async hashPassword(password: string): Promise<string> {
		return bcrypt.hash(password, SALT_ROUNDS);
	}

	/**
	 * Compare password with hash
	 */
	static async comparePassword(
		password: string,
		hash: string
	): Promise<boolean> {
		return bcrypt.compare(password, hash);
	}

	/**
	 * Generate JWT token
	 */
	static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
		return jwt.sign(payload, JWT_SECRET, {
			expiresIn: JWT_EXPIRE,
		});
	}

	/**
	 * Verify JWT token
	 */
	static verifyToken(token: string): JWTPayload {
		try {
			return jwt.verify(token, JWT_SECRET) as JWTPayload;
		} catch (error) {
			throw new Error('Invalid or expired token');
		}
	}

	/**
	 * Register a new user
	 */
	static async register(
		data: RegisterData
	): Promise<{ user: AuthUser; token: string }> {
		try {
			// Check if user already exists
			const existingUser = await prisma.user.findUnique({
				where: { email: data.email },
			});

			if (existingUser) {
				throw new Error('User with this email already exists');
			}

			// Check if username already exists (if provided)
			if (data.username) {
				const existingUsername = await prisma.user.findUnique({
					where: { username: data.username },
				});

				if (existingUsername) {
					throw new Error('Username already taken');
				}
			}

			// Validate password strength
			if (data.password.length < 6) {
				throw new Error('Password must be at least 6 characters long');
			}

			// Hash password
			const hashedPassword = await this.hashPassword(data.password);

			// Create user
			const user = await prisma.user.create({
				data: {
					email: data.email,
					password: hashedPassword,
					firstName: data.firstName,
					lastName: data.lastName,
					username: data.username,
					school: data.school,
					grade: data.grade,
					subject: data.subject,
				},
			});

			// Generate token
			const token = this.generateToken({
				userId: user.id,
				email: user.email,
			});

			// Remove password from response
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password: _, ...userWithoutPassword } = user;

			return {
				user: userWithoutPassword,
				token,
			};
		} catch (error) {
			console.error('Registration error details:', error);
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Registration failed');
		}
	}

	/**
	 * Login user
	 */
	static async login(
		data: LoginData
	): Promise<{ user: AuthUser; token: string }> {
		try {
			// Find user by email
			const user = await prisma.user.findUnique({
				where: { email: data.email },
			});

			if (!user) {
				throw new Error('Invalid email or password');
			}

			// Check password
			const isPasswordValid = await this.comparePassword(
				data.password,
				user.password
			);

			if (!isPasswordValid) {
				throw new Error('Invalid email or password');
			}

			// Generate token
			const token = this.generateToken({
				userId: user.id,
				email: user.email,
			});

			// Remove password from response
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password: _, ...userWithoutPassword } = user;

			return {
				user: userWithoutPassword,
				token,
			};
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Login failed');
		}
	}

	/**
	 * Get user by token
	 */
	static async getUserByToken(token: string): Promise<AuthUser | null> {
		try {
			const payload = this.verifyToken(token);

			const user = await prisma.user.findUnique({
				where: { id: payload.userId },
			});

			if (!user) {
				return null;
			}

			// Remove password from response
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password: _, ...userWithoutPassword } = user;
			return userWithoutPassword;
		} catch {
			return null;
		}
	}

	/**
	 * Change password
	 */
	static async changePassword(
		userId: string,
		currentPassword: string,
		newPassword: string
	): Promise<void> {
		try {
			// Get user
			const user = await prisma.user.findUnique({
				where: { id: userId },
			});

			if (!user) {
				throw new Error('User not found');
			}

			// Verify current password
			const isCurrentPasswordValid = await this.comparePassword(
				currentPassword,
				user.password
			);

			if (!isCurrentPasswordValid) {
				throw new Error('Current password is incorrect');
			}

			// Validate new password
			if (newPassword.length < 6) {
				throw new Error(
					'New password must be at least 6 characters long'
				);
			}

			// Hash new password
			const hashedNewPassword = await this.hashPassword(newPassword);

			// Update password
			await prisma.user.update({
				where: { id: userId },
				data: { password: hashedNewPassword },
			});
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Failed to change password');
		}
	}

	/**
	 * Reset password (for future implementation with email verification)
	 */
	static async initiatePasswordReset(email: string): Promise<void> {
		try {
			const user = await prisma.user.findUnique({
				where: { email },
			});

			if (!user) {
				// Don't reveal if email exists for security
				return;
			}

			// TODO: Implement email sending logic
			// For now, just log to console
			console.log(`Password reset initiated for ${email}`);
		} catch (error) {
			// Silently handle errors for security
			console.error('Password reset error:', error);
		}
	}

	/**
	 * Refresh token
	 */
	static async refreshToken(
		token: string
	): Promise<{ user: AuthUser; token: string }> {
		try {
			const payload = this.verifyToken(token);

			const user = await prisma.user.findUnique({
				where: { id: payload.userId },
			});

			if (!user) {
				throw new Error('User not found');
			}

			// Generate new token
			const newToken = this.generateToken({
				userId: user.id,
				email: user.email,
			});

			// Remove password from response
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password: _, ...userWithoutPassword } = user;

			return {
				user: userWithoutPassword,
				token: newToken,
			};
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Token refresh failed');
		}
	}
}
