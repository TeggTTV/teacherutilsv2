"use client";
import { motion } from 'framer-motion';
import NewsletterForm from '@/components/NewsletterForm';

export default function Newsletter() {
	return <section className="py-12 sm:py-20 bg-white">
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
						Subscribe to our newsletter and receive a pack
						of premium educational game templates worth $50
						- absolutely free!
					</p>
					<div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg">
						<h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
							What You&apos;ll Get:
						</h3>
						<ul className="text-left text-gray-600 mb-4 sm:mb-6 space-y-2 sm:space-y-3 text-sm sm:text-base">
							<li className="flex items-center">
								<svg
									className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 13l4 4L19 7"
									></path>
								</svg>
								5 Ready-to-Use Game Templates
							</li>
							<li className="flex items-center">
								<svg
									className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 13l4 4L19 7"
									></path>
								</svg>
								Weekly Teaching Tips & Strategies
							</li>
							<li className="flex items-center">
								<svg
									className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 13l4 4L19 7"
									></path>
								</svg>
								Early Access to New Features
							</li>
						</ul>
						<NewsletterForm />
						<p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
							Join a growing community of teachers who
							already trust Compyy. Unsubscribe anytime.
						</p>
					</div>
				</motion.div>
			</div>
		</div>
	</section>;
}
