type TabKey =
	| 'overview'
	| 'play'
	| 'discover'
	| 'my-templates'
	| 'my-sets'
	| 'market'
    | 'saved'
	| 'stats'
	| 'referrals';

interface Metadata {
	title: string;
	description: string;
}

const metadata: Record<TabKey, Metadata> = {
	overview: {
		title: 'Overview — Compyy Dashboard',
		description: 'Get a quick summary of your dashboard activities.',
	},
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
    'my-sets': {
        title: 'My Sets — Compyy Dashboard',
        description: 'Manage and edit your created sets in one place.',
    },
    'my-templates': {
        title: 'My Templates — Compyy Dashboard',
        description: 'Manage templates you own or downloaded for reuse.',
    },
    saved: {
        title: 'Saved Games — Compyy Dashboard',
        description: 'Access games you saved for later play or editing.',
    },
	stats: {
		title: 'Stats — Compyy Dashboard',
		description:
			'View platform statistics like active users and games created.',
	},
	referrals: {
		title: 'Referrals — Compyy Dashboard',
		description:
			'Invite colleagues and earn raffle tickets for cool prizes.',
	},
};

export default function Head({ currentTab }: { currentTab: TabKey }) {
	const currentMetadata = metadata[currentTab];

	return (
		<>
			<title>{currentMetadata.title}</title>
			<meta name="description" content={currentMetadata.description} />
		</>
	);
}
