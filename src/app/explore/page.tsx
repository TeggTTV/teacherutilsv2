import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Explore Games | Compyy.',
	description: 'Discover amazing educational games created by teachers around the world. Find inspiration and ready-to-use content for your classroom.',
};

export default function ExplorePage() {
	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
					<div className="text-center">
						<h1 className="text-4xl md:text-6xl font-bold mb-6">
							Explore Educational Games
						</h1>
						<p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
							Discover thousands of engaging educational games created by teachers worldwide. 
							Find the perfect content for your classroom or get inspired to create your own.
						</p>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				{/* Coming Soon Section */}
				<div className="text-center mb-16">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
						<svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						Explore Feature Coming Soon
					</h2>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
						We&apos;re building an amazing exploration experience where you&apos;ll be able to 
						browse and discover educational games by subject, grade level, and popularity. 
						Stay tuned for this exciting feature!
					</p>
				</div>

				{/* Features Preview */}
				<div className="grid md:grid-cols-3 gap-8 mb-16">
					<div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
						<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
							<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Browse by Subject</h3>
						<p className="text-gray-600">Find games organized by subject areas like Math, Science, History, and Language Arts.</p>
					</div>

					<div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
						<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
							<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Popular Games</h3>
						<p className="text-gray-600">Discover the most popular and highly-rated educational games from the community.</p>
					</div>

					<div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
						<div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
							<svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Save Favorites</h3>
						<p className="text-gray-600">Save games you love and access them quickly from your personal collection.</p>
					</div>
				</div>

				{/* Call to Action */}
				<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
					<h3 className="text-2xl font-bold text-gray-900 mb-4">
						Ready to Create Your Own Games?
					</h3>
					<p className="text-gray-600 mb-6 max-w-2xl mx-auto">
						While you wait for the explore feature, why not start creating your own educational games? 
						Our easy-to-use tools make it simple to build engaging content for your students.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<a
							href="/dashboard"
							className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
						>
							Go to Dashboard
						</a>
						<a
							href="/create"
							className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors"
						>
							Start Creating
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}