'use client';
import { motion } from 'framer-motion';

export default function Testimonials() {
	return (
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
							students are more engaged than ever, and creating
							games is so intuitive.&rdquo;
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
							&ldquo;The variety of game templates saves me hours
							of preparation time. My math lessons have never been
							more fun!&rdquo;
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
							&ldquo;Perfect for remote learning! Students love
							the interactive games, and I can track their
							progress easily.&rdquo;
						</p>
						<div className="flex items-center">
							<div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
								AC
							</div>
							<div className="ml-3">
								<p className="font-semibold text-sm sm:text-base">
									Ashley Chen
								</p>
								<p className="text-xs sm:text-sm text-gray-600">
									Science Teacher
								</p>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
