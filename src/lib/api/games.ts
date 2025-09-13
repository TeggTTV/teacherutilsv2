import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function getGameById(id: string) {
	try {
		const game = await prisma.game.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						firstName: true,
						lastName: true,
					},
				},
			},
		});

		await prisma.$disconnect();
		return game;
	} catch (error) {
		console.error('Error fetching game:', error);
		await prisma.$disconnect();
		return null;
	}
}
