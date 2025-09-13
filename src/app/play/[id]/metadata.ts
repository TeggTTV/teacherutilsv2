import { Metadata } from 'next';
import { getGameById } from '@/lib/api/games';

type Props = {
	params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const game = await getGameById(params.id);

	if (!game) {
		return {
			title: 'Game Not Found - Compyy.',
			description: 'The requested game could not be found.',
		};
	}

	return {
		title: `${game.title} - Compyy.`,
		description:
			game.description || 'Play this educational game on Compyy.',
		openGraph: {
			title: game.title,
			description:
				game.description ||
				'Play this educational game on Compyy.',
			images: [
				{
					url: `${
						process.env.SITE_URL || 'https://compyy.vercel.app'
					}/api/og/game/${game.id}`,
					width: 1200,
					height: 630,
					alt: game.title,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: game.title,
			description:
				game.description ||
				'Play this educational game on Compyy.',
			images: [
				`${
					process.env.SITE_URL || 'https://compyy.vercel.app'
				}/api/og/game/${game.id}`,
			],
		},
	};
}
