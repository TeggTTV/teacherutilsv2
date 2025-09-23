// next-seo.config.js
const SEO = {
	title: 'Compyy. - Create Engaging Educational Games',
	description:
		'Create engaging educational games in minutes. Join teachers around the world, making learning fun and interactive with Compyy.',
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://compyy.org/',
		site_name: 'Compyy',
		images: [
			{
				url: 'https://compyy.org/Compyy%20Logo%20Icon.png',
				width: 800,
				height: 600,
				alt: 'Compyy Logo',
				type: 'image/png',
			},
		],
	},
	twitter: {
		handle: '@compyy',
		site: '@compyy',
		cardType: 'summary_large_image',
	},
};
module.exports = SEO;
