import { Metadata } from 'next';

export const baseMetadata: Metadata = {
	title: {
		default: 'Compyy. - Interactive Educational Games Platform',
		template: '%s | Compyy.'
	},
	description: 'Create and play educational games, starting with Jeopardy-style quizzes. Perfect for teachers and students.',
	metadataBase: new URL(process.env.SITE_URL || 'https://compyy.vercel.app'),
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: process.env.SITE_URL || 'https://compyy.vercel.app',
		siteName: 'Compyy.',
		title: 'Compyy. - Interactive Educational Games Platform',
		description: 'Create and play educational games, starting with Jeopardy-style quizzes. Perfect for teachers and students.',
		images: [
			{
				url: '/og-image.png',
				width: 1200,
				height: 630,
				alt: 'Compyy. - Interactive Educational Games Platform',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Compyy. - Interactive Educational Games Platform',
		description: 'Create and play educational games, starting with Jeopardy-style quizzes. Perfect for teachers and students.',
		images: ['/og-image.png'],
	},
	// viewport handled in layout head
	// themeColor handled in layout <head> to avoid Next.js unsupported-metadata warnings
	icons: {
		icon: '/favicon.ico',
	},
};

export function generateGameMetadata(game: {
	id: string;
	title: string;
	description?: string;
}): Metadata {
	return {
		title: game.title,
		description: game.description || 'Play this educational game on Compyy.',
		openGraph: {
			title: game.title,
			description: game.description || 'Play this educational game on Compyy.',
			images: [
				{
					url: `/api/og/game/${game.id}`,
					width: 1200,
					height: 630,
					alt: game.title,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: game.title,
			description: game.description || 'Play this educational game on Compyy.',
			images: [`/api/og/game/${game.id}`],
		},
	};
}

// Legacy export for backward compatibility (though we won't use it in App Router)
export const defaultSEO = {
	title: 'Compyy. - Interactive Educational Games Platform',
	description: 'Create and play educational games, starting with Jeopardy-style quizzes. Perfect for teachers and students.',
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: process.env.SITE_URL || 'https://compyy.vercel.app',
		siteName: 'Compyy.',
		images: [
			{
				url: `${process.env.SITE_URL || 'https://compyy.vercel.app'}/og-image.png`,
				width: 1200,
				height: 630,
				alt: 'Compyy. - Interactive Educational Games Platform',
			},
		],
	},
	twitter: {
		handle: '@compyy',
		site: '@compyy',
		cardType: 'summary_large_image',
	},
	additionalMetaTags: [
		{
			name: 'viewport',
			content: 'width=device-width, initial-scale=1',
		},
	],
	additionalLinkTags: [
		{
			rel: 'icon',
			href: '/favicon.ico',
		},
	],
};
