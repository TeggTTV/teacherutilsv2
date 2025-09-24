'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HelpContent() {
	const [showSupportForm, setShowSupportForm] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		subject: '',
		message: '',
	});
	const [activeTab, setActiveTab] = useState('getting-started');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitStatus, setSubmitStatus] = useState<
		'idle' | 'success' | 'error'
	>('idle');

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmitStatus('idle');

		try {
			const response = await fetch('/api/support', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				setSubmitStatus('success');
				setFormData({ name: '', email: '', subject: '', message: '' });
				setTimeout(() => {
					setShowSupportForm(false);
					setSubmitStatus('idle');
				}, 2000);
			} else {
				setSubmitStatus('error');
			}
		} catch (error) {
			console.error('Error submitting support ticket:', error);
			setSubmitStatus('error');
		} finally {
			setIsSubmitting(false);
		}
	};

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

	return (
		<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			{/* Quick Start Guide */}
			<div className="mb-12 bg-white rounded-lg shadow-md p-8">
				<h3 className="text-2xl font-bold text-gray-900 mb-6">
					Quick Start Guide
				</h3>
				<div className="space-y-6">
					<div className="flex items-start gap-4">
						<div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
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
						<div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
							2
						</div>
						<div>
							<h4 className="font-semibold text-gray-900 mb-1">
								Create Your First Game
							</h4>
							<p className="text-gray-600">
								Use the Jeopardy creator to build your custom
								game with categories and questions.
							</p>
						</div>
					</div>
					<div className="flex items-start gap-4">
						<div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
							3
						</div>
						<div>
							<h4 className="font-semibold text-gray-900 mb-1">
								Play with Your Class
							</h4>
							<p className="text-gray-600">
								Set up teams and start playing on any device or
								smart board.
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
									.replace(/\b\w/g, (l) => l.toUpperCase())}
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
			<div className="mt-12">
				{!showSupportForm ? (
					<div className="bg-gray-100 rounded-lg p-8 text-center">
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Still Need Help?
						</h3>
						<p className="text-gray-600 mb-6">
							Can&apos;t find what you&apos;re looking for? Our
							support team is here to help!
						</p>
						<div className="flex justify-center gap-4">
							<button
								onClick={() => setShowSupportForm(true)}
								className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
							>
								Contact Support
							</button>
							<Link
								href="/dashboard"
								className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
							>
								Back to Dashboard
							</Link>
						</div>
					</div>
				) : (
					<div className="bg-white rounded-lg shadow-md p-8">
						<div className="flex justify-between items-center mb-6">
							<h3 className="text-2xl font-bold text-gray-900">
								Contact Support
							</h3>
							<button
								onClick={() => setShowSupportForm(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						{submitStatus === 'success' && (
							<div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
								Thank you! Your support ticket has been
								submitted successfully. We&apos;ll get back to
								you soon.
							</div>
						)}

						{submitStatus === 'error' && (
							<div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
								Sorry, there was an error submitting your
								support ticket. Please try again.
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label
										htmlFor="name"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Name *
									</label>
									<input
										type="text"
										id="name"
										name="name"
										value={formData.name}
										onChange={handleInputChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
								<div>
									<label
										htmlFor="email"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Email *
									</label>
									<input
										type="email"
										id="email"
										name="email"
										value={formData.email}
										onChange={handleInputChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor="subject"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Subject *
								</label>
								<input
									type="text"
									id="subject"
									name="subject"
									value={formData.subject}
									onChange={handleInputChange}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>

							<div>
								<label
									htmlFor="message"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Message *
								</label>
								<textarea
									id="message"
									name="message"
									value={formData.message}
									onChange={handleInputChange}
									required
									rows={6}
									placeholder="Please describe your issue or question in detail..."
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
								/>
							</div>

							<div className="flex justify-end gap-4">
								<button
									type="button"
									onClick={() => setShowSupportForm(false)}
									className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isSubmitting}
									className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-400"
								>
									{isSubmitting
										? 'Submitting...'
										: 'Submit Ticket'}
								</button>
							</div>
						</form>
					</div>
				)}
			</div>
		</div>
	);
}
