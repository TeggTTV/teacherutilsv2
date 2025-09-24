import { prisma } from '@/lib/prisma';
import { User, Prisma } from '@/generated/prisma/client';
import bcrypt from 'bcryptjs';

// Types for user operations
export type CreateUserData = {
	email: string;
	password?: string; // Optional - will generate random password if not provided
	firstName?: string;
	lastName?: string;
	username?: string;
	profileImage?: string;
	bio?: string;
	school?: string;
	grade?: string;
	subject?: string;
	isTeacher?: boolean; // New field to indicate teacher status
	referralCode?: string;
	subscribeToNewsletter?: boolean;
};

export type UpdateUserData = Partial<Omit<CreateUserData, 'email'>> & {
	email?: string;
};

export type UserWithGames = Prisma.UserGetPayload<{
	include: { games: true };
}>;

// User CRUD operations
export class UserService {
	/**
	 * Create a new user
	 */
	static async createUser(data: CreateUserData): Promise<User> {
		try {
			// Generate a random password if none provided (for OAuth users)
			const password = data.password || Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
			const hashedPassword = await bcrypt.hash(password, 12);

			// Handle referral code if provided
			let referralReward = 0;
			let referralLinkId: string | undefined;
			if (data.referralCode) {
				try {
					const referralLink = await prisma.referralLink.findUnique({
						where: { code: data.referralCode, active: true },
						include: { user: true },
					});

					if (referralLink) {
						// Give referral reward to the referrer
						await prisma.user.update({
							where: { id: referralLink.user.id },
							data: { raffleTickets: { increment: 1 } },
						});
						
						// Give bonus ticket to the new user for using a referral
						referralReward = 1;
						referralLinkId = referralLink.id;
					}
				} catch (error) {
					console.error('Error processing referral code:', error);
					// Don't fail user creation if referral processing fails
				}
			}

			const user = await prisma.user.create({
				data: {
					email: data.email,
					password: hashedPassword,
					firstName: data.firstName,
					lastName: data.lastName,
					username: data.username,
					profileImage: data.profileImage,
					bio: data.bio,
					school: data.school,
					grade: data.grade,
					subject: data.subject,
					role: data.isTeacher ? 'teacher' : 'user',
					raffleTickets: 1 + referralReward, // Start with 1 ticket + referral bonus
				},
			});

			// Handle newsletter subscription separately
			if (data.subscribeToNewsletter) {
				try {
					await prisma.newsletterSubscriber.upsert({
						where: { email: data.email },
						update: { status: 'confirmed' },
						create: {
							email: data.email,
							status: 'confirmed',
						},
					});
				} catch (error) {
					console.error('Error subscribing to newsletter:', error);
					// Don't fail user creation if newsletter subscription fails
				}
			}

			// Create referral record if referral was used
			if (referralLinkId) {
				try {
					const referralLink = await prisma.referralLink.findUnique({
						where: { id: referralLinkId },
					});

					if (referralLink) {
						await prisma.referral.create({
							data: {
								referrerId: referralLink.userId,
								referredId: user.id,
								referralLinkId: referralLinkId,
								status: 'approved',
							},
						});
					}
				} catch (error) {
					console.error('Error creating referral record:', error);
					// Don't fail user creation if referral record creation fails
				}
			}

			return user;
		} catch (error: unknown) {
			if (error && typeof error === 'object' && 'code' in error) {
				if (error.code === 'P2002') {
					// Unique constraint failed
					const meta = error as { meta?: { target?: string[] } };
					const target = meta.meta?.target;
					if (target?.includes('email')) {
						throw new Error(
							'A user with this email already exists'
						);
					}
					if (target?.includes('username')) {
						throw new Error(
							'A user with this username already exists'
						);
					}
				}
			}
			throw new Error('Failed to create user');
		}
	}

	/**
	 * Get user by ID
	 */
	static async getUserById(id: string): Promise<User | null> {
		try {
			const user = await prisma.user.findUnique({
				where: { id },
			});
			return user;
		} catch {
			throw new Error('Failed to fetch user');
		}
	}

	/**
	 * Get user by email
	 */
	static async getUserByEmail(email: string): Promise<User | null> {
		try {
			const user = await prisma.user.findUnique({
				where: { email },
			});
			return user;
		} catch {
			throw new Error('Failed to fetch user');
		}
	}

	/**
	 * Get user by username
	 */
	static async getUserByUsername(username: string): Promise<User | null> {
		try {
			const user = await prisma.user.findUnique({
				where: { username },
			});
			return user;
		} catch {
			throw new Error('Failed to fetch user');
		}
	}

	/**
	 * Get user with their games
	 */
	static async getUserWithGames(id: string): Promise<UserWithGames | null> {
		try {
			const user = await prisma.user.findUnique({
				where: { id },
				include: {
					games: {
						orderBy: { updatedAt: 'desc' },
					},
				},
			});
			return user;
		} catch {
			throw new Error('Failed to fetch user with games');
		}
	}

	/**
	 * Update user by ID
	 */
	static async updateUser(id: string, data: UpdateUserData): Promise<User> {
		try {
			const user = await prisma.user.update({
				where: { id },
				data: {
					...(data.email && { email: data.email }),
					...(data.firstName !== undefined && {
						firstName: data.firstName,
					}),
					...(data.lastName !== undefined && {
						lastName: data.lastName,
					}),
					...(data.username !== undefined && {
						username: data.username,
					}),
					...(data.profileImage !== undefined && {
						profileImage: data.profileImage,
					}),
					...(data.bio !== undefined && { bio: data.bio }),
					...(data.school !== undefined && { school: data.school }),
					...(data.grade !== undefined && { grade: data.grade }),
					...(data.subject !== undefined && {
						subject: data.subject,
					}),
				},
			});
			return user;
		} catch (error: unknown) {
			if (error && typeof error === 'object' && 'code' in error) {
				if (error.code === 'P2002') {
					// Unique constraint failed
					const meta = error as { meta?: { target?: string[] } };
					const target = meta.meta?.target;
					if (target?.includes('email')) {
						throw new Error(
							'A user with this email already exists'
						);
					}
					if (target?.includes('username')) {
						throw new Error(
							'A user with this username already exists'
						);
					}
				}
				if (error.code === 'P2025') {
					// Record not found
					throw new Error('User not found');
				}
			}
			throw new Error('Failed to update user');
		}
	}

	/**
	 * Delete user by ID
	 */
	static async deleteUser(id: string): Promise<User> {
		try {
			const user = await prisma.user.delete({
				where: { id },
			});
			return user;
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				error.code === 'P2025'
			) {
				// Record not found
				throw new Error('User not found');
			}
			throw new Error('Failed to delete user');
		}
	}

	/**
	 * Get all users (admin function)
	 */
	static async getAllUsers(limit = 50, offset = 0): Promise<User[]> {
		try {
			const users = await prisma.user.findMany({
				take: limit,
				skip: offset,
				orderBy: { createdAt: 'desc' },
			});
			return users;
		} catch {
			throw new Error('Failed to fetch users');
		}
	}

	/**
	 * Search users by name or email
	 */
	static async searchUsers(query: string, limit = 20): Promise<User[]> {
		try {
			const users = await prisma.user.findMany({
				where: {
					OR: [
						{ firstName: { contains: query, mode: 'insensitive' } },
						{ lastName: { contains: query, mode: 'insensitive' } },
						{ email: { contains: query, mode: 'insensitive' } },
						{ username: { contains: query, mode: 'insensitive' } },
					],
				},
				take: limit,
				orderBy: { createdAt: 'desc' },
			});
			return users;
		} catch {
			throw new Error('Failed to search users');
		}
	}

	/**
	 * Check if email exists
	 */
	static async emailExists(email: string): Promise<boolean> {
		try {
			const user = await prisma.user.findUnique({
				where: { email },
				select: { id: true },
			});
			return !!user;
		} catch {
			throw new Error('Failed to check email existence');
		}
	}

	/**
	 * Check if username exists
	 */
	static async usernameExists(username: string): Promise<boolean> {
		try {
			const user = await prisma.user.findUnique({
				where: { username },
				select: { id: true },
			});
			return !!user;
		} catch {
			throw new Error('Failed to check username existence');
		}
	}

	/**
	 * Get user statistics
	 */
	static async getUserStats(id: string) {
		try {
			const user = await prisma.user.findUnique({
				where: { id },
				select: {
					_count: {
						select: {
							games: true,
						},
					},
					games: {
						select: {
							type: true,
							isPublic: true,
						},
					},
				},
			});

			if (!user) {
				throw new Error('User not found');
			}

			const gamesByType = user.games.reduce((acc, game) => {
				acc[game.type] = (acc[game.type] || 0) + 1;
				return acc;
			}, {} as Record<string, number>);

			const publicGames = user.games.filter(
				(game) => game.isPublic
			).length;

			return {
				totalGames: user._count.games,
				publicGames,
				privateGames: user._count.games - publicGames,
				gamesByType,
			};
		} catch {
			throw new Error('Failed to fetch user statistics');
		}
	}
}
