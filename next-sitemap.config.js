/** @type {import('next-sitemap').IConfig} */
module.exports = {
	siteUrl: process.env.SITE_URL || 'https://compyy.org',
	generateRobotsTxt: true,
	robotsTxtOptions: {
		policies: [
			{
				userAgent: '*',
				allow: '/',
				disallow: [
					'/api/*',
					'/dashboard*',
					'/profile*',
					'/saved*',
					'/create*',
					'/reset-password*',
					'/forgot-password*',
					'/newsletter*',
					'/play/*/setup*',
					'/users*',
					'/support*',
				],
			},
		],
	},
	exclude: [
		'/api/*',
		'/dashboard*',
		'/profile*',
		'/saved*',
		'/create*',
		'/reset-password*',
		'/forgot-password*',
		'/newsletter*',
		'/play/*/setup*',
		'/users*',
		'/support*',
		'/auth/confirm',
		'/reset-password'
	],
	changefreq: 'daily',
	priority: 0.7,
};
