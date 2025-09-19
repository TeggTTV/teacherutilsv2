/** @type {import('next-sitemap').IConfig} */
module.exports = {
	siteUrl: process.env.SITE_URL || 'https://compyy.org',
	generateRobotsTxt: true,
	robotsTxtOptions: {
		policies: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/api/*', '/dashboard/*'],
			},
		],
	},
	exclude: ['/api/*', '/dashboard/*'],
	changefreq: 'daily',
	priority: 0.7,
};
