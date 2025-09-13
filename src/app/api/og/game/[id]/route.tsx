import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

export const runtime = 'edge';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	const prisma = new PrismaClient();

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

		if (!game) {
			return new Response('Game not found', { status: 404 });
		}

		await prisma.$disconnect();

		return new ImageResponse(
			(
				<div
					style={{
						height: '100%',
						width: '100%',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: '#fff',
						padding: '40px',
					}}
				>
					<h1
						style={{
							fontSize: '60px',
							fontWeight: 'bold',
							color: '#1a202c',
							marginBottom: '20px',
							textAlign: 'center',
						}}
					>
						{game.title}
					</h1>
					{game.description && (
						<p
							style={{
								fontSize: '30px',
								color: '#4a5568',
								marginBottom: '40px',
								textAlign: 'center',
								maxWidth: '800px',
							}}
						>
							{game.description}
						</p>
					)}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '10px',
							fontSize: '24px',
							color: '#718096',
						}}
					>
						<span>
							Created by {game.user.firstName}{' '}
							{game.user.lastName}
						</span>
						<span>•</span>
						<span>Compyy.</span>
					</div>
				</div>
			),
			{
				width: 1200,
				height: 630,
			}
		);
	} catch (error) {
		console.error('Error generating OG image:', error);
		return new Response('Error generating image', { status: 500 });
	}
}
