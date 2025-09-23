'use client';
import { motion } from 'framer-motion';
import Faq from '@/components/Faq';

export default function FaqComponent() {
	return (
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
						Everything you need to know about Compyy and how it can
						transform your teaching experience
					</motion.p>
				</div>

				<div className="max-w-4xl mx-auto">
					<Faq />
				</div>
			</div>
		</section>
	);
}
