import ProfileContent from './ProfileContent';

export const metadata = {
	title: 'Profile | Compyy',
	description: 'Manage your Compyy profile and account settings.',
	type: 'website',
	alternates: {
		canonical: 'https://compyy.org/profile',
	},
	openGraph: {
		url: 'https://compyy.org/profile',
		title: 'Profile | Compyy',
		description: 'Manage your Compyy profile and account settings.',
		images: [
			{
				url: 'https://compyy.org/Compyy%20Logo%20w%20Text.png',
				width: 800,
				height: 600,
				alt: 'Compyy Logo',
				type: 'image/png',
			},
		],
		siteName: 'Compyy',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Profile | Compyy',
		description: 'Manage your Compyy profile and account settings.',
		images: ['https://compyy.org/Compyy%20Logo%20Icon.png'],
		site: '@compyy',
		creator: '@compyy',
	},
};

export default function ProfilePage() {
	return <ProfileContent />;
}
