'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { user, logout } = useAuth();

	const toggleProfileDropdown = () => {
		setIsProfileOpen(!isProfileOpen);
	};

	const handleLogout = () => {
		logout();
		setIsProfileOpen(false);
	};

	const handleSignIn = () => {
		setIsAuthModalOpen(true);
		setIsProfileOpen(false);
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsProfileOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Get user initials
	const getUserInitials = () => {
		if (!user) return 'GT';
		const firstName = user.firstName || user.email.charAt(0);
		const lastName = user.lastName || user.email.charAt(1);
		return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
	};

	return (
		<motion.nav
			initial={{ y: -100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.6, ease: 'easeOut' }}
			className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-[9998]"
		>
			<div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo/Brand */}
					<motion.div
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className="flex-shrink-0"
					>
						<Link href="/" className="flex items-center space-x-2">
							<div className="w-8 h-8 flex items-center justify-center">
								<Image
									src="/Compyy%20Logo%20Icon%20Transparent.png"
									alt="Compyy. Logo"
									width={32}
									height={32}
									className="object-contain"
								/>
							</div>
							<span className="text-xl font-bold text-gray-900">
								Compyy.
							</span>
						</Link>
					</motion.div>

					{/* Right side buttons */}
					<div className="flex items-center space-x-4">
						{/* Register Button - only show if not authenticated */}
						{!user && (
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={() => setIsAuthModalOpen(true)}
								className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
							>
								<span>Join Free</span>
								<motion.div
									initial={{ rotate: 0 }}
									whileHover={{ rotate: 12 }}
									transition={{ duration: 0.2 }}
								>
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
										/>
									</svg>
								</motion.div>
							</motion.button>
						)}

						{/* Dashboard Button - only show if authenticated */}
						{user && (
							<motion.div
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<Link
									href="/dashboard"
									className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
								>
									<span>Dashboard</span>
									<motion.div
										initial={{ x: 0 }}
										whileHover={{ x: 2 }}
										transition={{ duration: 0.2 }}
									>
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
											/>
										</svg>
									</motion.div>
								</Link>
							</motion.div>
						)}

						{/* Create Button - only show if authenticated */}
						{/* {user && (
							<motion.div
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<Link
									href="/create"
									className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
								>
									<span>Create</span>
									<motion.div
										initial={{ x: 0 }}
										whileHover={{ x: 2 }}
										transition={{ duration: 0.2 }}
									>
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 4v16m8-8H4"
											/>
										</svg>
									</motion.div>
								</Link>
							</motion.div>
						)} */}

						{/* Profile Dropdown - Always visible */}
						<div
							className="relative flex-shrink-0 z-[9999]"
							ref={dropdownRef}
						>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={toggleProfileDropdown}
								className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-white overflow-hidden"
								title="Account Settings"
							>
								<motion.div
									initial={{ rotate: 0 }}
									transition={{ duration: 0.2 }}
									className="text-xs sm:text-sm font-semibold"
								>
									{getUserInitials()}
								</motion.div>
							</motion.button>

							{/* Dropdown Menu */}
							<AnimatePresence>
								{isProfileOpen && (
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-1"
										style={{
											zIndex: 999999,
											position: 'absolute',
											isolation: 'isolate',
										}}
									>
										{user ? (
											<>
												{/* Profile Header - Authenticated */}
												<div className="px-3 sm:px-4 py-3 border-b border-gray-100">
													<div className="flex items-center space-x-3">
														<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-base sm:text-lg overflow-hidden flex-shrink-0">
															{getUserInitials()}
														</div>
														<div className="min-w-0 flex-1">
															<p className="font-medium text-gray-900 text-sm sm:text-base truncate">
																{user.firstName &&
																user.lastName
																	? `${user.firstName} ${user.lastName}`
																	: user.username ||
																	  'Teacher'}
															</p>
															<p className="text-xs sm:text-sm text-gray-500 truncate">
																{user.email}
															</p>
														</div>
													</div>
												</div>

												{/* Profile Menu Items - Authenticated */}
												<div className="py-1">
													<Link href="/profile">
														<motion.div
															whileHover={{
																backgroundColor:
																	'#f3f4f6',
															}}
															transition={{
																duration: 0.2,
															}}
															className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 flex items-center space-x-3 cursor-pointer"
														>
															<svg
																className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={
																		2
																	}
																	d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
																/>
															</svg>
															<span className="truncate">
																Profile Settings
															</span>
														</motion.div>
													</Link>

													<motion.button
														whileHover={{
															backgroundColor:
																'#f0f9ff',
														}}
														transition={{
															duration: 0.2,
														}}
														onClick={() => {
															// Refresh games from database
															if (
																typeof window !==
																'undefined'
															) {
																// Trigger refresh event that the question-set page can listen to
																window.dispatchEvent(
																	new CustomEvent(
																		'refreshGames'
																	)
																);
																// Clear localStorage cache
																localStorage.removeItem(
																	'savedGames'
																);
															}
															setIsProfileOpen(
																false
															);
														}}
														className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-blue-600 flex items-center space-x-3"
													>
														<svg
															className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
															/>
														</svg>
														<span className="truncate">
															Refresh Games
														</span>
													</motion.button>

													<div className="border-t border-gray-100 mt-1 pt-1">
														<Link href="/help">
															<motion.div
																whileHover={{
																	backgroundColor:
																		'#f3f4f6',
																}}
																transition={{
																	duration: 0.2,
																}}
																className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 flex items-center space-x-3 cursor-pointer"
															>
																<svg
																	className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={
																			2
																		}
																		d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
																	/>
																</svg>
																<span className="truncate">
																	Help &
																	Support
																</span>
															</motion.div>
														</Link>

														<motion.button
															whileHover={{
																backgroundColor:
																	'#fef2f2',
																color: '#dc2626',
															}}
															transition={{
																duration: 0.2,
															}}
															onClick={
																handleLogout
															}
															className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 flex items-center space-x-3"
														>
															<svg
																className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={
																		2
																	}
																	d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
																/>
															</svg>
															<span className="truncate">
																Sign out
															</span>
														</motion.button>
													</div>
												</div>
											</>
										) : (
											<>
												{/* Profile Header - Skeleton for unauthenticated */}
												<div className="px-3 sm:px-4 py-3 border-b border-gray-100">
													<div className="flex items-center space-x-3">
														<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-semibold text-base sm:text-lg overflow-hidden flex-shrink-0">
															?
														</div>
														<div className="min-w-0 flex-1">
															<p className="font-medium text-gray-400 text-sm sm:text-base truncate">
																Guest User
															</p>
															<p className="text-xs sm:text-sm text-gray-400 truncate">
																Not signed in
															</p>
														</div>
													</div>
												</div>

												{/* Profile Menu Items - Unauthenticated */}
												<div className="py-1">
													<motion.button
														whileHover={{
															backgroundColor:
																'#eff6ff',
														}}
														transition={{
															duration: 0.2,
														}}
														onClick={handleSignIn}
														className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-blue-600 flex items-center space-x-3 font-medium"
													>
														<svg
															className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
															/>
														</svg>
														<span className="truncate">
															Sign In / Register
														</span>
													</motion.button>

													<div className="border-t border-gray-100 mt-1 pt-1">
														<motion.button
															whileHover={{
																backgroundColor:
																	'#f9fafb',
															}}
															transition={{
																duration: 0.2,
															}}
															className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-400 flex items-center space-x-3 cursor-not-allowed"
															disabled
														>
															<svg
																className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={
																		2
																	}
																	d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
																/>
															</svg>
															<span className="truncate">
																Help & Support
															</span>
														</motion.button>
													</div>
												</div>
											</>
										)}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>

			{/* Auth Modal */}
			<AuthModal
				isOpen={isAuthModalOpen}
				onClose={() => setIsAuthModalOpen(false)}
			/>
		</motion.nav>
	);
}
