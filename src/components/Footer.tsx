'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
	return (
		<footer className="bg-gray-900 text-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Brand Section */}
					<div className="col-span-1 md:col-span-2">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
						>
							<div className="flex items-center space-x-2 mb-4">
								<div className="w-8 h-8 flex items-center justify-center">
									<Image
										src="/Compyy%20Logo%20Icon%20Transparent.png"
										alt="Compyy. Logo"
										width={32}
										height={32}
										className="object-contain"
									/>
								</div>
								<span className="text-xl font-bold">
									Compyy.
								</span>
							</div>
							<p className="text-gray-300 mb-6 max-w-md">
								Empowering educators worldwide to create engaging, 
								interactive learning experiences that make education 
								fun and memorable for every student.
							</p>
							<div className="flex space-x-4">
								<motion.a
									href="#"
									whileHover={{ scale: 1.1, y: -2 }}
									whileTap={{ scale: 0.9 }}
									className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
								>
									<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
										<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
									</svg>
								</motion.a>
								<motion.a
									href="#"
									whileHover={{ scale: 1.1, y: -2 }}
									whileTap={{ scale: 0.9 }}
									className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors"
								>
									<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
										<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
									</svg>
								</motion.a>
								<motion.a
									href="#"
									whileHover={{ scale: 1.1, y: -2 }}
									whileTap={{ scale: 0.9 }}
									className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
								>
									<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
										<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
									</svg>
								</motion.a>
							</div>
						</motion.div>
					</div>

					{/* Links - Mobile Two Column Layout, Desktop Single Columns */}
					<div className="grid grid-cols-2 md:grid-cols-2 gap-8 md:contents">
						{/* Quick Links */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							className="md:col-auto"
						>
							<h3 className="text-lg font-semibold mb-4">Quick Links</h3>
							<ul className="space-y-2">
								<li>
									<Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
										Home
									</Link>
								</li>
								<li>
									<Link href="/create" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
										Create Games
									</Link>
								</li>
								<li>
									<Link href="/explore" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
										Explore
									</Link>
								</li>
								<li>
									<Link href="/templates" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
										Templates
									</Link>
								</li>
							</ul>
						</motion.div>

						{/* Support */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="md:col-auto"
						>
							<h3 className="text-lg font-semibold mb-4">Support</h3>
							<ul className="space-y-2">
								<li>
									<Link href="/help" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
										Help Center
									</Link>
								</li>
								<li>
									<Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
										Contact Us
									</Link>
								</li>
								<li>
									<Link href="/tutorials" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
										Tutorials
									</Link>
								</li>
								<li>
									<Link href="/community" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
										Community
									</Link>
								</li>
							</ul>
						</motion.div>
					</div>
				</div>

				{/* Bottom Section */}
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center"
				>
					<p className="text-gray-400 text-sm">
						© 2025 Compyy. All rights reserved.
					</p>
					<div className="flex space-x-6 mt-4 md:mt-0">
						<Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
							Privacy Policy
						</Link>
						<Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
							Terms of Service
						</Link>
						<Link href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
							Cookie Policy
						</Link>
					</div>
				</motion.div>
			</div>
		</footer>
	);
}
