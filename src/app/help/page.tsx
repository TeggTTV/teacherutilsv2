'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HelpPage() {
	const [activeTab, setActiveTab] = useState('getting-started');

	const faqData = {
		'getting-started': [
			{
				question: 'How do I create my first Jeopardy game?',
				answer: 'Go to your dashboard and click "Create New Game", then select "Jeopardy". Follow the guided setup to add categories and questions.',
			},
			{
				question: 'Can I use this on a smart board?',
				answer: 'Yes! Our platform is optimized for smart boards with touch-friendly controls and fullscreen gameplay.',
			},
			{
				question: 'How many teams can play at once?',
				answer: 'You can have 1-6 teams playing simultaneously, with customizable team names and automatic scoring.',
			},
		],
		'game-creation': [
			{
				question: 'How many categories can I add to a game?',
				answer: 'You can add 1-6 categories per Jeopardy game. Each category can have up to 5 questions.',
			},
			{
				question: 'Can I customize the point values?',
				answer: 'Yes! You can use preset values (100s, 1000s, etc.) or create custom point values for each row.',
			},
			{
				question: 'How do I save my games?',
				answer: 'Click the "Save Game" button while editing. Your games are automatically saved to your personal library.',
			},
		],
		troubleshooting: [
			{
				question: "The game won't load. What should I do?",
				answer: "Try refreshing the page first. If that doesn't work, check your internet connection and try again.",
			},
			{
				question: "I can't edit my game. Why?",
				answer: "Make sure you're logged in and that you're the creator of the game. Only game creators can edit their games.",
			},
			{
				question: "The smart board isn't responding to touch.",
				answer: 'Try refreshing the page and ensure your smart board drivers are up to date. Our touch controls work with most modern smart boards.',
			},
		],
	};

	const features = [
		{
			title: 'Game Creation',
			description:
				'Create custom Jeopardy games with multiple categories and questions',
			icon: '🎮',
		},
		{
			title: 'Smart Board Ready',
			description:
				'Optimized for classroom smart boards and touch displays',
			icon: '📱',
		},
		{
			title: 'Team Management',
			description: 'Support for multiple teams with automatic scoring',
			icon: '👥',
		},
		{
			title: 'Custom Styling',
			description: 'Beautiful themes and customization options',
			icon: '🎨',
		},
	];

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-4">
							<Link
								href="/dashboard"
								className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 19l-7-7 7-7"
									/>
								</svg>
								Back to Dashboard
							</Link>
							<div className="border-l pl-4">
								<h1 className="text-xl font-semibold text-gray-900">
									Help & Support
								</h1>
								<p className="text-sm text-gray-600">
									Get help with using Compyy.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

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
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Features Overview */}
				<div className="mb-12">
					<h3 className="text-2xl font-bold text-gray-900 mb-6">
						Features Overview
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{features.map((feature, index) => (
							<div
								key={index}
								className="bg-white p-6 rounded-lg shadow-md"
							>
								<div className="text-3xl mb-3">
									{feature.icon}
								</div>
								<h4 className="font-semibold text-gray-900 mb-2">
									{feature.title}
								</h4>
								<p className="text-gray-600 text-sm">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* Quick Start Guide */}
				<div className="mb-12 bg-white rounded-lg shadow-md p-8">
					<h3 className="text-2xl font-bold text-gray-900 mb-6">
						Quick Start Guide
					</h3>
					<div className="space-y-6">
						<div className="flex items-start gap-4">
							<div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
								1
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 mb-1">
									Create Your Account
								</h4>
								<p className="text-gray-600">
									Sign up with your email and complete your
									teacher profile.
								</p>
							</div>
						</div>
						<div className="flex items-start gap-4">
							<div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
								2
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 mb-1">
									Create Your First Game
								</h4>
								<p className="text-gray-600">
									Use the Jeopardy creator to build your
									custom game with categories and questions.
								</p>
							</div>
						</div>
						<div className="flex items-start gap-4">
							<div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
								3
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 mb-1">
									Play with Your Class
								</h4>
								<p className="text-gray-600">
									Set up teams and start playing on any device
									or smart board.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* FAQ Section */}
				<div className="bg-white rounded-lg shadow-md">
					<div className="border-b border-gray-200">
						<div className="p-6">
							<h3 className="text-2xl font-bold text-gray-900">
								Frequently Asked Questions
							</h3>
						</div>
						<div className="flex">
							{Object.keys(faqData).map((tab) => (
								<button
									key={tab}
									onClick={() => setActiveTab(tab)}
									className={`px-6 py-3 text-sm font-medium border-b-2 ${
										activeTab === tab
											? 'border-blue-600 text-blue-600'
											: 'border-transparent text-gray-600 hover:text-gray-800'
									}`}
								>
									{tab
										.replace('-', ' ')
										.replace(/\b\w/g, (l) =>
											l.toUpperCase()
										)}
								</button>
							))}
						</div>
					</div>
					<div className="p-6">
						<div className="space-y-6">
							{faqData[activeTab as keyof typeof faqData].map(
								(faq, index) => (
									<div
										key={index}
										className="border-b border-gray-100 pb-4 last:border-b-0"
									>
										<h4 className="font-semibold text-gray-900 mb-2">
											{faq.question}
										</h4>
										<p className="text-gray-600">
											{faq.answer}
										</p>
									</div>
								)
							)}
						</div>
					</div>
				</div>

				{/* Contact Support */}
				<div className="mt-12 bg-gray-100 rounded-lg p-8 text-center">
					<h3 className="text-2xl font-bold text-gray-900 mb-4">
						Still Need Help?
					</h3>
					<p className="text-gray-600 mb-6">
						Can&apos;t find what you&apos;re looking for? Our
						support team is here to help!
					</p>
					<div className="flex justify-center gap-4">
						<a
							href="mailto:support@compyy.com"
							className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							Email Support
						</a>
						<Link
							href="/dashboard"
							className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
						>
							Back to Dashboard
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
