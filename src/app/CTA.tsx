'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CTA() {
	return (
		<section className="py-12 sm:py-20 bg-blue-500">
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
						Join thousands of educators creating memorable learning
						experiences. Start building your first game today!
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
	);
}
