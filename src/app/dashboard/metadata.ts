export const dashboardTabMetadata: Record<
	string,
	{ title: string; description: string; image?: string }
> = {
	play: {
		title: 'Play Games — Compyy Dashboard',
		description:
			'Jump into interactive educational games shared by the community.',
	},
	discover: {
		title: 'Discover — Compyy Dashboard',
		description:
			'Find new games and templates created by teachers and creators.',
	},
	market: {
		title: 'Market — Compyy Dashboard',
		description:
			'Browse and download community templates and premium content.',
	},
	stats: {
		title: 'Stats — Compyy Dashboard',
		description:
			'View platform statistics like active users and games created.',
	},
	'my-sets': {
		title: 'My Games — Compyy Dashboard',
		description: 'Manage and edit your created games in one place.',
	},
	'my-templates': {
		title: 'My Templates — Compyy Dashboard',
		description: 'Manage templates you own or downloaded for reuse.',
	},
	saved: {
		title: 'Saved Games — Compyy Dashboard',
		description: 'Access games you saved for later play or editing.',
	},
	referrals: {
		title: 'Referrals — Compyy Dashboard',
		description:
			'Invite colleagues and earn raffle tickets for cool prizes.',
	},
};

export const defaultDashboardMetadata = {
	title: 'Compyy Dashboard',
	description: 'Create, play, and discover educational games.',
};
