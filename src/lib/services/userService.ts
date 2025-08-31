import { prisma } from '@/lib/prisma';
import { User, Prisma } from '@/generated/prisma/client';

// Types for user operations
export type CreateUserData = {
	email: string;
	firstName?: string;
	lastName?: string;
	username?: string;
	profileImage?: string;
	bio?: string;
	school?: string;
	grade?: string;
	subject?: string;
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
			const user = await prisma.user.create({
				data: {
					email: data.email,
					firstName: data.firstName,
					lastName: data.lastName,
					username: data.username,
					profileImage: data.profileImage,
					bio: data.bio,
					school: data.school,
					grade: data.grade,
					subject: data.subject,
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
