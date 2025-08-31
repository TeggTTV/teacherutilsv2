'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Hero Section */}
			<section className="relative overflow-hidden">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
					<div className="text-center">
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
						>
							Welcome to{' '}
							<span className="text-blue-600">Compyy.</span>
						</motion.h1>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							className="text-xl sm:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed"
						>
							Create engaging educational games in minutes. No
							technical skills required. Join thousands of
							teachers making learning fun and interactive.
						</motion.p>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
						>
							<Link href="/create">
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl min-w-[200px]"
								>
									Start Creating
								</motion.button>
							</Link>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 min-w-[200px]"
							>
								Explore Games
							</motion.button>
						</motion.div>

						{/* Stats Section */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
							className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
						>
							<div className="text-center">
								<div className="text-3xl font-bold text-blue-600 mb-2">
									10K+
								</div>
								<div className="text-gray-600">
									Active Teachers
								</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-green-600 mb-2">
									50K+
								</div>
								<div className="text-gray-600">
									Games Created
								</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-purple-600 mb-2">
									1M+
								</div>
								<div className="text-gray-600">
									Students Engaged
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="py-20 bg-gradient-to-r from-purple-50 to-pink-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
							What Teachers Are Saying
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Real feedback from educators using Compyy in their
							classrooms
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="bg-white p-6 rounded-lg shadow-lg"
						>
							<div className="flex items-center mb-4">
								<div className="flex space-x-1">
									{[...Array(5)].map((_, i) => (
										<svg
											key={i}
											className="w-5 h-5 text-yellow-400"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									))}
								</div>
							</div>
							<p className="text-gray-700 mb-4">
								&ldquo;Compyy has transformed my classroom! My
								students are more engaged than ever, and
								creating games is so intuitive.&rdquo;
							</p>
							<div className="flex items-center">
								<div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
									SM
								</div>
								<div className="ml-3">
									<p className="font-semibold">
										Sarah Martinez
									</p>
									<p className="text-sm text-gray-600">
										5th Grade Teacher
									</p>
								</div>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							className="bg-white p-6 rounded-lg shadow-lg"
						>
							<div className="flex items-center mb-4">
								<div className="flex space-x-1">
									{[...Array(5)].map((_, i) => (
										<svg
											key={i}
											className="w-5 h-5 text-yellow-400"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									))}
								</div>
							</div>
							<p className="text-gray-700 mb-4">
								&ldquo;The variety of game templates saves me
								hours of preparation time. My math lessons have
								never been more fun!&rdquo;
							</p>
							<div className="flex items-center">
								<div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
									DJ
								</div>
								<div className="ml-3">
									<p className="font-semibold">
										David Johnson
									</p>
									<p className="text-sm text-gray-600">
										Math Teacher
									</p>
								</div>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="bg-white p-6 rounded-lg shadow-lg"
						>
							<div className="flex items-center mb-4">
								<div className="flex space-x-1">
									{[...Array(5)].map((_, i) => (
										<svg
											key={i}
											className="w-5 h-5 text-yellow-400"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									))}
								</div>
							</div>
							<p className="text-gray-700 mb-4">
								&ldquo;Perfect for remote learning! Students
								love the interactive games, and I can track
								their progress easily.&rdquo;
							</p>
							<div className="flex items-center">
								<div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
									AC
								</div>
								<div className="ml-3">
									<p className="font-semibold">Ashley Chen</p>
									<p className="text-sm text-gray-600">
										Science Teacher
									</p>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Call to Action Section */}
			<section className="py-20 bg-blue-600">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						<h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
							Ready to Transform Your Classroom?
						</h2>
						<p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
							Join thousands of educators creating memorable
							learning experiences. Start building your first game
							today!
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							<Link href="/create">
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl min-w-[200px]"
								>
									Get Started Free
								</motion.button>
							</Link>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 min-w-[200px]"
							>
								Watch Demo
							</motion.button>
						</div>
					</motion.div>
				</div>
			</section>
		</div>
	);
}
