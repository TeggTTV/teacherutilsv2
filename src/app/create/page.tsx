'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function CreatePage() {
	const { user, loading } = useAuthGuard();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (!user) {
		return null; // Will redirect in useAuthGuard
	}

	const gameTemplates = [
		{
			id: 'question-set',
			name: 'Jeopardy',
			description:
				'Create a classic Jeopardy-style game with custom categories, questions, and full theme customization',
			icon: '🧩',
			difficulty: 'Easy',
			time: '15-30 min',
			students: '5-30',
			features: [
				'Custom Categories',
				'Point Values',
				'Theme Styling',
				'Interactive Board',
			],
			available: true,
			color: 'blue',
		},
		{
			id: 'quiz',
			name: 'Quiz Game',
			description: 'Multiple choice quiz games with instant feedback',
			icon: '❓',
			difficulty: 'Easy',
			time: '10-20 min',
			students: '1-50',
			features: [
				'Multiple Choice',
				'True/False',
				'Timer Options',
				'Instant Results',
			],
			available: true,
			color: 'green',
		},
		{
			id: 'wordgames',
			name: 'Word Games',
			description: 'Crosswords, word searches, and vocabulary games',
			icon: '📝',
			difficulty: 'Medium',
			time: '20-40 min',
			students: '1-25',
			features: ['Crosswords', 'Word Search', 'Vocabulary', 'Spelling'],
			available: false,
			color: 'purple',
		},
		{
			id: 'memory',
			name: 'Memory Match',
			description: 'Create matching games to test memory and recognition',
			icon: '🧠',
			difficulty: 'Easy',
			time: '10-15 min',
			students: '1-20',
			features: [
				'Card Matching',
				'Image Pairs',
				'Custom Content',
				'Difficulty Levels',
			],
			available: false,
			color: 'pink',
		},
		{
			id: 'trivia',
			name: 'Trivia Night',
			description: 'Multi-round trivia competitions with team support',
			icon: '🎯',
			difficulty: 'Medium',
			time: '30-60 min',
			students: '10-100',
			features: [
				'Team Play',
				'Multiple Rounds',
				'Leaderboards',
				'Categories',
			],
			available: false,
			color: 'orange',
		},
		{
			id: 'escape',
			name: 'Escape Room',
			description: 'Educational puzzle sequences and challenges',
			icon: '🔓',
			difficulty: 'Hard',
			time: '45-90 min',
			students: '3-15',
			features: [
				'Puzzle Chains',
				'Story Mode',
				'Collaboration',
				'Problem Solving',
			],
			available: false,
			color: 'red',
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
			{/* Header Section */}
			<div className="bg-white shadow-sm">
				<div className="container mx-auto px-4 py-8">
					<div className="text-center max-w-4xl mx-auto">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
						>
							<h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
								Create Your Game
							</h1>
							<p className="text-lg sm:text-xl text-gray-600 mb-6">
								Choose from our educational game templates and
								start engaging your students in minutes
							</p>
							<div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
								<span className="flex items-center gap-1">
									<span className="w-2 h-2 bg-green-500 rounded-full"></span>
									Ready to use
								</span>
								<span className="flex items-center gap-1">
									<span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
									Coming soon
								</span>
							</div>
						</motion.div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<main className="container mx-auto px-4 py-12">
				{/* Game Templates Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
					{gameTemplates.map((template, index) => (
						<motion.div
							key={template.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.6,
								delay: 0.2 + index * 0.1,
							}}
							className={`relative bg-white rounded-xl shadow-sm border p-6 transition-all duration-300 ${
								template.available
									? 'hover:shadow-lg cursor-pointer border-gray-200 hover:border-blue-300'
									: 'opacity-75 border-gray-200'
							}`}
						>
							{/* Available/Coming Soon Badge */}
							<div className="absolute top-4 right-4">
								{template.available ? (
									<span className="w-3 h-3 bg-green-500 rounded-full"></span>
								) : (
									<span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
										Coming Soon
									</span>
								)}
							</div>

							{/* Game Icon */}
							<div className="text-4xl mb-4">{template.icon}</div>

							{/* Game Info */}
							<h3
								className={`text-xl font-semibold mb-3 ${
									template.available
										? 'text-gray-900'
										: 'text-gray-400'
								}`}
							>
								{template.name}
							</h3>

							<p
								className={`text-sm mb-6 leading-relaxed ${
									template.available
										? 'text-gray-600'
										: 'text-gray-400'
								}`}
							>
								{template.description}
							</p>

							{/* Essential Info Only */}
							<div className="space-y-3 mb-6">
								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-500">
										Students:
									</span>
									<span className="text-sm font-medium text-gray-700">
										{template.students}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-500">
										Key Features:
									</span>
									<span className="text-sm font-medium text-gray-700">
										{template.features
											.slice(0, 2)
											.join(', ')}
									</span>
								</div>
							</div>

							{/* Action Button */}
							{template.available ? (
								<Link href={`/create/${template.id}`}>
									<button className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium">
										Start Creating
									</button>
								</Link>
							) : (
								<button className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg cursor-not-allowed font-medium">
									Coming Soon
								</button>
							)}
						</motion.div>
					))}
				</div>

				{/* Help Section */}
				{/* <motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.8 }}
					className="mt-16 bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto text-center"
				>
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Need Help Getting Started?
					</h2>
					<p className="text-gray-600 mb-6">
						Check out our tutorials and guides to create amazing
						educational games.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium">
							📖 View Tutorials
						</button>
						<button className="px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium">
							💬 Get Support
						</button>
						<button className="px-6 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium">
							📋 Templates Library
						</button>
					</div>
				</motion.div> */}
			</main>
		</div>
	);
}
