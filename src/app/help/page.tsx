import Header from '@/components/Header';
import HelpContent from './HelpContent';

export const metadata = {
	title: 'Help | Compyy',
	description: 'Useful guides and FAQs to help you get the most out of Compyy. Find answers to common questions and learn how to create engaging educational games for your classroom.',
	alternates: {
		canonical: 'https://compyy.org/help',
	},
	openGraph: {
		url: 'https://compyy.org/help',
		title: 'Help | Compyy',
		description: 'Useful guides and FAQs to help you get the most out of Compyy. Find answers to common questions and learn how to create engaging educational games for your classroom.',
		images: [
			{
				url: 'https://compyy.org/Compyy%20Logo%20Icon.png',
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
		title: 'Help | Compyy',
		description: 'Useful guides and FAQs to help you get the most out of Compyy. Find answers to common questions and learn how to create engaging educational games for your classroom.',
		images: ['https://compyy.org/Compyy%20Logo%20Icon.png'],
		site: '@compyy',
		creator: '@compyy',
	},
};

export default function HelpPage() {
	

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<Header>
				<div className="border-l pl-4">
					<h1 className="text-xl font-semibold text-gray-900">
						Help & Support
					</h1>
					<p className="text-sm text-gray-600">
						Get help with using Compyy.
					</p>
				</div>
			</Header>

			{/* Hero Section */}
			<div className="bg-blue-600 text-white py-12">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl font-bold mb-4">
						Welcome to Compyy Help Center
					</h2>
					<p className="text-xl opacity-90">
						Everything you need to create amazing educational games
					</p>
				</div>
			</div>

			{/* Main Content */}
			<HelpContent />
		</div>
	);
}
