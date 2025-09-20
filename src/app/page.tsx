'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Faq from '@/components/Faq';
import NewsletterForm from '@/components/NewsletterForm';
import { useCountAnimation } from '@/hooks/useCountAnimation';

interface Stats {
	activeTeachers: string;
	gamesCreated: string;
	studentsEngaged: string;
}

// Helper component for animated stats
function AnimatedStat({ value, label, color }: { value: string; label: string; color: string }) {
	// Extract numeric value from string (e.g., "1000+" -> 1000)
	const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
	const suffix = value.replace(/[0-9]/g, '');
	
	const { count, elementRef } = useCountAnimation({
		end: numericValue,
		duration: 2500,
		startOnInView: true
	});

	return (
		<div className="text-center">
			<div 
				ref={elementRef}
				className={`text-xl sm:text-2xl md:text-3xl font-bold ${color} mb-1 sm:mb-2`}
			>
				{count.toLocaleString()}{suffix}
			</div>
			<div className="text-xs sm:text-sm md:text-base text-gray-600">
				{label}
			</div>
		</div>
	);
}

export default function Home() {
	const [stats, setStats] = useState<Stats>({
		activeTeachers: '0',
		gamesCreated: '0', 
		studentsEngaged: '0'
	});

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await fetch('/api/stats');
				if (response.ok) {
					const data = await response.json();
					setStats(data);
				}
			} catch (error) {
				console.error('Failed to fetch statistics:', error);
				// Keep default stats if fetch fails
			}
		};

		fetchStats();
	}, []);
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Hero Section */}
			<section className="relative overflow-hidden">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-12 sm:pb-20">
					<div className="text-center">
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight"
						>
							Welcome to{' '}
							<span className="text-blue-600">Compyy.</span>
						</motion.h1>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2"
						>
							Create engaging educational games in minutes. Join teachers around the world, making learning fun and interactive.
						</motion.p>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4"
						>
							<Link href="/create" className="w-full sm:w-auto">
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl min-w-[200px]"
								>
									Start Creating
								</motion.button>
							</Link>
							{/* <motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 min-w-[200px]"
							>
								Explore Games
							</motion.button> */}
						</motion.div>

						{/* Stats Section */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
							className="grid grid-cols-3 sm:grid-cols-3 gap-4 sm:gap-8 max-w-md sm:max-w-2xl mx-auto px-4"
						>
							<AnimatedStat 
								value={stats.activeTeachers} 
								label="Active Teachers" 
								color="text-blue-600" 
							/>
							<AnimatedStat 
								value={stats.gamesCreated} 
								label="Games Created" 
								color="text-green-600" 
							/>
							<AnimatedStat 
								value={stats.studentsEngaged} 
								label="Students Engaged" 
								color="text-purple-600" 
							/>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Why Use Compyy Section */}
			<section className="py-12 sm:py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12 sm:mb-16">
						<motion.h2
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4"
						>
							Why Choose Compyy?
						</motion.h2>
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4"
						>
							Transform your teaching experience with our powerful platform
						</motion.p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="text-center p-4 sm:p-6"
						>
							<div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
								<svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Save Time</h3>
							<p className="text-sm sm:text-base text-gray-600 leading-relaxed">Create engaging games in minutes, not hours. Our templates and easy-to-use interface streamline your lesson prep.</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							className="text-center p-4 sm:p-6"
						>
							<div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
								<svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Boost Engagement</h3>
							<p className="text-sm sm:text-base text-gray-600 leading-relaxed">Keep students motivated with interactive games that make learning fun and memorable.</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="text-center p-4 sm:p-6"
						>
							<div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
								<svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
							</div>
							<h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Track Progress</h3>
							<p className="text-sm sm:text-base text-gray-600 leading-relaxed">Get instant insights into student performance with detailed analytics and progress tracking.</p>
						</motion.div>
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="py-12 sm:py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12 sm:mb-16">
						<motion.h2
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4"
						>
							Frequently Asked Questions
						</motion.h2>
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4"
						>
							Everything you need to know about Compyy and how it can transform your teaching experience
						</motion.p>
					</div>

					<div className="max-w-4xl mx-auto">
						<Faq />
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="py-12 sm:py-20 bg-gradient-to-r from-blue-50 to-indigo-100">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12 sm:mb-16">
						<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
							What Teachers Are Saying
						</h2>
						<p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
							Real feedback from educators using Compyy in their
							classrooms
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="bg-white p-4 sm:p-6 rounded-lg shadow-lg"
						>
							<div className="flex items-center mb-3 sm:mb-4">
								<div className="flex space-x-1">
									{[...Array(5)].map((_, i) => (
										<svg
											key={i}
											className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									))}
								</div>
							</div>
							<p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">
								&ldquo;Compyy has transformed my classroom! My
								students are more engaged than ever, and
								creating games is so intuitive.&rdquo;
							</p>
							<div className="flex items-center">
								<div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
									SM
								</div>
								<div className="ml-3">
									<p className="font-semibold text-sm sm:text-base">
										Sarah Martinez
									</p>
									<p className="text-xs sm:text-sm text-gray-600">
										5th Grade Teacher
									</p>
								</div>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							className="bg-white p-4 sm:p-6 rounded-lg shadow-lg"
						>
							<div className="flex items-center mb-3 sm:mb-4">
								<div className="flex space-x-1">
									{[...Array(5)].map((_, i) => (
										<svg
											key={i}
											className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									))}
								</div>
							</div>
							<p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">
								&ldquo;The variety of game templates saves me
								hours of preparation time. My math lessons have
								never been more fun!&rdquo;
							</p>
							<div className="flex items-center">
								<div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
									DJ
								</div>
								<div className="ml-3">
									<p className="font-semibold text-sm sm:text-base">
										David Johnson
									</p>
									<p className="text-xs sm:text-sm text-gray-600">
										Math Teacher
									</p>
								</div>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="bg-white p-4 sm:p-6 rounded-lg shadow-lg"
						>
							<div className="flex items-center mb-3 sm:mb-4">
								<div className="flex space-x-1">
									{[...Array(5)].map((_, i) => (
										<svg
											key={i}
											className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									))}
								</div>
							</div>
							<p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">
								&ldquo;Perfect for remote learning! Students
								love the interactive games, and I can track
								their progress easily.&rdquo;
							</p>
							<div className="flex items-center">
								<div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
									AC
								</div>
								<div className="ml-3">
									<p className="font-semibold text-sm sm:text-base">Ashley Chen</p>
									<p className="text-xs sm:text-sm text-gray-600">
										Science Teacher
									</p>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Newsletter Section */}
			<section className="py-12 sm:py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="max-w-3xl mx-auto text-center">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
						>
							<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
								Get Your Free Game Templates
							</h2>
							<p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 px-2">
								Subscribe to our newsletter and receive a pack of premium educational game templates worth $50 - absolutely free!
							</p>
							<div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg">
								<h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
									What You&apos;ll Get:
								</h3>
								<ul className="text-left text-gray-600 mb-4 sm:mb-6 space-y-2 sm:space-y-3 text-sm sm:text-base">
									<li className="flex items-center">
										<svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
										</svg>
										5 Ready-to-Use Game Templates
									</li>
									<li className="flex items-center">
										<svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
										</svg>
										Weekly Teaching Tips & Strategies
									</li>
									<li className="flex items-center">
										<svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
										</svg>
										Early Access to New Features
									</li>
								</ul>
								<NewsletterForm />
								<p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
									Join a growing community of teachers who already trust Compyy. Unsubscribe anytime.
								</p>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Call to Action Section */}
			<section className="py-12 sm:py-20 bg-blue-600">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
							Ready to Transform Your Classroom?
						</h2>
						<p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
							Join thousands of educators creating memorable
							learning experiences. Start building your first game
							today!
						</p>
						<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
							<Link href="/create">
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									className="bg-white text-blue-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto sm:min-w-[200px]"
								>
									Get Started Free
								</motion.button>
							</Link>
						</div>
					</motion.div>
				</div>
			</section>
		</div>
	);
}
