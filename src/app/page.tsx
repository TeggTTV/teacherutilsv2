import FaqComponent from './Faq';
import Hero from './Hero';
import ChooseCompyy from './ChooseCompyy';
import Testimonials from './Testimonials';
import Newsletter from './Newsletter';
import CTA from './CTA';

export const metadata = {
	title: 'Compyy - Create Engaging Educational Games',
	description:
		'Create engaging educational games in minutes. Join teachers around the world, making learning fun and interactive with Compyy.',
	alternates: {
		canonical: 'https://compyy.org/',
	},
	openGraph: {
		url: 'https://compyy.org/',
		title: 'Compyy - Create Engaging Educational Games',
		description:
			'Create engaging educational games in minutes. Join teachers around the world, making learning fun and interactive with Compyy.',
		images: [
			{
				url: 'https://compyy.org/Compyy%20Logo%20w%20Text.png',
				width: 512,
				height: 512,
				alt: 'Compyy Logo',
				type: 'image/png',
			},
		],
		siteName: 'Compyy',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Compyy - Create Engaging Educational Games',
		description:
			'Create engaging educational games in minutes. Join teachers around the world, making learning fun and interactive with Compyy.',
		images: ['https://compyy.org/Compyy%20Logo%20Icon.png'],
		site: '@compyy',
		creator: '@compyy',
	},
};

// Helper component for animated stats

export default function Home() {
	// SEO config for Home page

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			<Hero />
			<ChooseCompyy />
			<FaqComponent />	
			<Testimonials />
			<Newsletter />
			<CTA />
		</div>
	);
}
