'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import ShareModal from '@/components/ShareModal';

interface SavedGame {
	id: string;
	title: string;
	description?: string;
	type: 'JEOPARDY';
	data: {
		gameTitle: string;
		categories: Category[];
		customValues: number[];
	};
	isPublic: boolean;
	tags: string[];
	createdAt: string;
	updatedAt: string;
}

interface PublicGame {
	id: string;
	title: string;
	description?: string;
	type: 'JEOPARDY';
	tags: string[];
	subject?: string;
	gradeLevel?: string;
	difficulty?: string;
	language: string;
	publishedAt: string;
	downloads: number;
	plays: number;
	avgRating: number;
	ratingsCount: number;
	favoritesCount: number;
	author: {
		id: string;
		name: string;
		school?: string;
	};
}

interface SavedGame {
	id: string;
	title: string;
	description?: string;
	type: 'JEOPARDY';
	data: {
		gameTitle: string;
		categories: Category[];
		customValues: number[];
	};
	isPublic: boolean;
	tags: string[];
	createdAt: string;
	updatedAt: string;
}

interface Category {
	id: string;
	name: string;
	questions: Question[];
}

interface Question {
	id: string;
	value: number;
	question: string;
	answer: string;
	isAnswered: boolean;
}

export default function Dashboard() {
	const { user, loading } = useAuthGuard();
	const [activeTab, setActiveTab] = useState('my-sets');
	const [games, setGames] = useState<SavedGame[]>([]);
	const [publicGames, setPublicGames] = useState<PublicGame[]>([]);
	const [loadingGames, setLoadingGames] = useState(true);
	const [loadingPublicGames, setLoadingPublicGames] = useState(false);
	const [marketSearch, setMarketSearch] = useState('');
	const [marketFilters, setMarketFilters] = useState({
		subject: '',
		gradeLevel: '',
		difficulty: '',
		sortBy: 'newest'
	});
	const [shareModalGame, setShareModalGame] = useState<SavedGame | null>(null);
	const [savingGames, setSavingGames] = useState<Set<string>>(new Set());
	const [savedGames, setSavedGames] = useState<Set<string>>(new Set());

	// Load user's saved games
	useEffect(() => {
		const loadGames = async () => {
			if (!user) return;
			
			try {
				const response = await fetch('/api/games');
				if (response.ok) {
					const data = await response.json();
					setGames(data.games || []);
				}
			} catch (error) {
				console.error('Error loading games:', error);
			} finally {
				setLoadingGames(false);
			}
		};

		loadGames();
	}, [user]);

	// Load public games when market tab is active
	useEffect(() => {
		const loadPublicGames = async () => {
			if (activeTab !== 'market' && activeTab !== 'discover') return;
			
			setLoadingPublicGames(true);
			try {
				const params = new URLSearchParams({
					search: marketSearch,
					subject: marketFilters.subject,
					gradeLevel: marketFilters.gradeLevel,
					difficulty: marketFilters.difficulty,
					sortBy: marketFilters.sortBy,
					limit: '12'
				});

				const response = await fetch(`/api/games/public?${params}`);
				if (response.ok) {
					const data = await response.json();
					setPublicGames(data.games || []);
					
					// Check favorite status for each game
					if (user && data.games) {
						const favoriteChecks = data.games.map(async (game: PublicGame) => {
							try {
								const favResponse = await fetch(`/api/games/${game.id}/favorite`, {
									credentials: 'include'
								});
								if (favResponse.ok) {
									const favData = await favResponse.json();
									return { gameId: game.id, isFavorited: favData.isFavorited };
								}
							} catch (error) {
								console.error('Error checking favorite status:', error);
							}
							return { gameId: game.id, isFavorited: false };
						});
						
						const favoriteResults = await Promise.all(favoriteChecks);
						const newSavedGames = new Set<string>();
						favoriteResults.forEach(result => {
							if (result.isFavorited) {
								newSavedGames.add(result.gameId);
							}
						});
						setSavedGames(newSavedGames);
					}
				}
			} catch (error) {
				console.error('Error loading public games:', error);
			} finally {
				setLoadingPublicGames(false);
			}
		};

		loadPublicGames();
	}, [activeTab, marketSearch, marketFilters, user]);

	const handleFavoriteGame = async (gameId: string) => {
		// Add to saving state
		setSavingGames(prev => new Set(prev).add(gameId));
		
		try {
			const response = await fetch(`/api/games/${gameId}/favorite`, {
				method: 'POST',
				credentials: 'include',
			});
			
			if (response.ok) {
				const data = await response.json();
				
				// Update saved games state based on response
				if (data.isFavorited) {
					setSavedGames(prev => new Set(prev).add(gameId));
				} else {
					setSavedGames(prev => {
						const newSet = new Set(prev);
						newSet.delete(gameId);
						return newSet;
					});
				}
				
				// Refresh public games to update favorite status
				const params = new URLSearchParams({
					search: marketSearch,
					subject: marketFilters.subject,
					gradeLevel: marketFilters.gradeLevel,
					difficulty: marketFilters.difficulty,
					sortBy: marketFilters.sortBy,
					limit: '12'
				});

				const refreshResponse = await fetch(`/api/games/public?${params}`);
				if (refreshResponse.ok) {
					const refreshData = await refreshResponse.json();
					setPublicGames(refreshData.games || []);
				}
			}
		} catch (error) {
			console.error('Error toggling favorite:', error);
		} finally {
			// Remove from saving state
			setSavingGames(prev => {
				const newSet = new Set(prev);
				newSet.delete(gameId);
				return newSet;
			});
		}
	};

	if (loading || loadingGames) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (!user) {
		return null; // Will redirect in useAuthGuard
	}

	const sidebarItems = [
		{
			id: 'play',
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M8 5v14l11-7z" />
				</svg>
			),
			label: 'Play',
			bgColor: 'bg-gradient-to-r from-blue-400 to-blue-500',
			textColor: 'text-white',
		},
		{
			id: 'stats',
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
				</svg>
			),
			label: 'Stats',
			bgColor: 'bg-gray-100',
			textColor: 'text-gray-700',
		},
		{
			id: 'market',
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z" />
				</svg>
			),
			label: 'Market',
			bgColor: 'bg-gray-100',
			textColor: 'text-gray-700',
		},
		{
			id: 'discover',
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
				</svg>
			),
			label: 'Discover',
			bgColor: 'bg-gray-100',
			textColor: 'text-gray-700',
		},
		{
			id: 'my-sets',
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
				</svg>
			),
			label: 'My Sets',
			bgColor: 'bg-blue-500',
			textColor: 'text-white',
		},
		{
			id: 'favorites',
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
				</svg>
			),
			label: 'Favorites',
			bgColor: 'bg-gray-100',
			textColor: 'text-gray-700',
		},
	];

	return (
		<div className="min-h-screen bg-gray-50 flex">
			{/* Sidebar */}
			<div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
				{/* Logo */}
				{/* <div className="p-6 border-b border-gray-200">
					<div className="flex items-center space-x-2">
						<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-sm">TU</span>
						</div>
						<span className="text-xl font-bold text-gray-900">Dashboard</span>
					</div>
				</div> */}

				{/* Navigation */}
				<div className="flex-1 py-6">
					<nav className="space-y-2 px-4">
						{sidebarItems.map((item) => (
							<motion.button
								key={item.id}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={() => setActiveTab(item.id)}
								className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${item.bgColor} ${item.textColor}`}
							>
								{item.icon}
								<span className="font-medium">{item.label}</span>
							</motion.button>
						))}
					</nav>
				</div>

				{/* Bottom Navigation */}
				<div className="p-4 border-t border-gray-200">
					<div className="flex items-center justify-center space-x-4">
						<button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
							</svg>
						</button>
						<button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
							</svg>
						</button>
						<button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
							</svg>
						</button>
						<button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
							</svg>
						</button>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1">
				{/* Header */}
				<div className="bg-white border-b border-gray-200 px-8 py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								{activeTab === 'my-sets' && 'My Sets'}
								{activeTab === 'play' && 'Play Games'}
								{activeTab === 'stats' && 'Statistics'}
								{activeTab === 'market' && 'Game Market'}
								{activeTab === 'discover' && 'Discover'}
								{activeTab === 'favorites' && 'Favorites'}
							</h1>
							<p className="text-gray-600 mt-1">
								{activeTab === 'my-sets' && 'Manage your question sets and games'}
								{activeTab === 'play' && 'Start playing educational games'}
								{activeTab === 'stats' && 'View your performance analytics'}
								{activeTab === 'market' && 'Discover new educational content'}
								{activeTab === 'discover' && 'Find trending games and activities'}
								{activeTab === 'favorites' && 'Your saved games and sets'}
							</p>
						</div>
						{activeTab === 'my-sets' && (
							<div className="flex items-center space-x-4">
								<div className="relative">
									<input
										type="text"
										placeholder="Search your sets..."
										className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
									<svg
										className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										/>
									</svg>
								</div>
								<Link href="/create">
									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
									>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
										</svg>
										<span>Create Set</span>
									</motion.button>
								</Link>
							</div>
						)}
					</div>
				</div>

				{/* Content Area */}
				<div className="p-8">
					{activeTab === 'my-sets' && (
						<div>
							{loadingGames ? (
								<div className="flex items-center justify-center py-16">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
								</div>
							) : games.length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
									{games.map((game) => {
										return (
											<motion.div
												key={game.id}
												whileHover={{ scale: 1.02 }}
												className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
											>
												<div className="p-4">
													<div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
														<div className="text-4xl">🎯</div>
													</div>
													<h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
														{game.title}
													</h3>
													<div className="flex items-center justify-between text-sm text-gray-600 mb-4">
														<span>{game.data.categories.length} Categories</span>
														<span>{new Date(game.updatedAt).toLocaleDateString()}</span>
														{game.isPublic && (
															<span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
																<svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
																	<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
																</svg>
																Public
															</span>
														)}
													</div>
													<div className="flex items-center space-x-2">
														<Link href={`/play/${game.id}/setup`} className="flex-1">
															<button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1">
																<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
																	<path d="M8 5v14l11-7z" />
																</svg>
																<span>Play</span>
															</button>
														</Link>
														<button
															onClick={() => setShareModalGame(game)}
															className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
														>
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
															</svg>
															<span>Share</span>
														</button>
														<Link href={`/create/question-set?edit=${game.id}`} className="flex-1">
															<button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1">
																<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
																</svg>
																<span>Edit</span>
															</button>
														</Link>
													</div>
												</div>
											</motion.div>
										);
									})}
								</div>
							) : (
								<div className="text-center py-16">
									<div className="max-w-md mx-auto">
										<div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
											<svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
											</svg>
										</div>
										<h3 className="text-xl font-semibold text-gray-900 mb-4">No games yet</h3>
										<p className="text-gray-600 mb-8">Create your first Jeopardy game to get started.</p>
										<Link href="/create/question-set">
											<motion.button
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
												className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 mx-auto"
											>
												<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
												</svg>
												<span>Create Game</span>
											</motion.button>
										</Link>
									</div>
								</div>
							)}
						</div>
					)}

					{activeTab === 'create' && (
						<div className="text-center py-16">
							<div className="max-w-md mx-auto">
								<div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
									<svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
									</svg>
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-4">Ready to Create Educational Games?</h3>
								<p className="text-gray-600 mb-8">Choose from our game templates and start engaging your students.</p>
								<Link href="/create">
									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 mx-auto"
									>
										<span className="text-2xl">�</span>
										<span>Go to Creator</span>
									</motion.button>
								</Link>
							</div>
						</div>
					)}

					{activeTab === 'play' && (
						<div>
							{loadingGames ? (
								<div className="flex items-center justify-center py-16">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
								</div>
							) : games.length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{games.map((game) => {
										const completedQuestions = game.data.categories.reduce((total, cat) => 
											total + cat.questions.filter(q => q.question && q.answer).length, 0
										);
										const isPlayable = completedQuestions > 0;
										
										return (
											<motion.div
												key={game.id}
												whileHover={{ scale: 1.02 }}
												className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
											>
												<div className="p-6">
													<div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center">
														<div className="text-5xl">🎯</div>
													</div>
													<h3 className="font-semibold text-gray-900 mb-2 text-lg">
														{game.title}
													</h3>
													<div className="text-sm text-gray-600 mb-4">
														<div>Categories: {game.data.categories.length}</div>
														<div>Point Values: {game.data.customValues.join(', ')}</div>
													</div>
													{isPlayable ? (
														<Link href={`/play/${game.id}/setup`} className="w-full">
															<button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
																<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
																	<path d="M8 5v14l11-7z" />
																</svg>
																<span>Play Game</span>
															</button>
														</Link>
													) : (
														<div className="text-center">
															<p className="text-gray-500 text-sm mb-3">This game needs questions to be playable</p>
															<Link href={`/create/question-set?edit=${game.id}`}>
																<button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
																	Add Questions
																</button>
															</Link>
														</div>
													)}
												</div>
											</motion.div>
										);
									})}
								</div>
							) : (
								<div className="text-center py-16">
									<div className="max-w-md mx-auto">
										<div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
											<svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
												<path d="M8 5v14l11-7z" />
											</svg>
										</div>
										<h3 className="text-xl font-semibold text-gray-900 mb-4">No games to play yet</h3>
										<p className="text-gray-600 mb-8">Create your first game to start playing!</p>
										<Link href="/create/question-set">
											<motion.button
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
												className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 mx-auto"
											>
												<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
												</svg>
												<span>Create Game</span>
											</motion.button>
										</Link>
									</div>
								</div>
							)}
						</div>
					)}

					{activeTab === 'market' && (
						<div>
							{/* Market Search and Filters */}
							<div className="mb-6 space-y-4">
								{/* Search Bar */}
								<div className="relative">
									<input
										type="text"
										placeholder="Search public games..."
										value={marketSearch}
										onChange={(e) => setMarketSearch(e.target.value)}
										className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
									<svg
										className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										/>
									</svg>
								</div>

								{/* Filters */}
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<select
										value={marketFilters.subject}
										onChange={(e) => setMarketFilters({...marketFilters, subject: e.target.value})}
										className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									>
										<option value="">All Subjects</option>
										<option value="math">Math</option>
										<option value="science">Science</option>
										<option value="history">History</option>
										<option value="english">English</option>
										<option value="geography">Geography</option>
										<option value="art">Art</option>
									</select>

									<select
										value={marketFilters.gradeLevel}
										onChange={(e) => setMarketFilters({...marketFilters, gradeLevel: e.target.value})}
										className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									>
										<option value="">All Grades</option>
										<option value="K-2">K-2</option>
										<option value="3-5">3-5</option>
										<option value="6-8">6-8</option>
										<option value="9-12">9-12</option>
										<option value="college">College</option>
									</select>

									<select
										value={marketFilters.difficulty}
										onChange={(e) => setMarketFilters({...marketFilters, difficulty: e.target.value})}
										className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									>
										<option value="">All Difficulties</option>
										<option value="beginner">Beginner</option>
										<option value="intermediate">Intermediate</option>
										<option value="advanced">Advanced</option>
									</select>

									<select
										value={marketFilters.sortBy}
										onChange={(e) => setMarketFilters({...marketFilters, sortBy: e.target.value})}
										className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									>
										<option value="newest">Newest</option>
										<option value="popular">Most Popular</option>
										<option value="downloads">Most Downloaded</option>
										<option value="rating">Highest Rated</option>
									</select>
								</div>
							</div>

							{/* Public Games Grid */}
							{loadingPublicGames ? (
								<div className="flex items-center justify-center py-16">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
								</div>
							) : publicGames.length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
									{publicGames.map((game) => (
										<motion.div
											key={game.id}
											whileHover={{ scale: 1.02 }}
											className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
										>
											<div className="p-4">
												<div className="w-full h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg mb-4 flex items-center justify-center">
													<div className="text-4xl">🌟</div>
												</div>
												
												<h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
													{game.title}
												</h3>
												
												{game.description && (
													<p className="text-sm text-gray-600 mb-3 line-clamp-2">
														{game.description}
													</p>
												)}

												<div className="space-y-2 mb-4">
													{game.subject && (
														<span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
															{game.subject}
														</span>
													)}
													{game.gradeLevel && (
														<span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full ml-1">
															{game.gradeLevel}
														</span>
													)}
													{game.difficulty && (
														<span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full ml-1">
															{game.difficulty}
														</span>
													)}
												</div>

												<div className="flex items-center justify-between text-sm text-gray-600 mb-4">
													<span>By {game.author.name}</span>
													<div className="flex items-center space-x-2">
														{game.avgRating > 0 && (
															<div className="flex items-center">
																<span>⭐</span>
																<span className="ml-1">{game.avgRating}</span>
																<span className="text-gray-400">({game.ratingsCount})</span>
															</div>
														)}
													</div>
												</div>

												<div className="flex items-center justify-between text-xs text-gray-500 mb-4">
													<span>🎮 {game.plays} plays</span>
													<span>📥 {game.downloads} downloads</span>
													<span>❤️ {game.favoritesCount}</span>
												</div>

												<div className="flex items-center space-x-2">
													<motion.button
														onClick={() => handleFavoriteGame(game.id)}
														disabled={savingGames.has(game.id)}
														whileHover={{ scale: savingGames.has(game.id) ? 1 : 1.05 }}
														whileTap={{ scale: savingGames.has(game.id) ? 1 : 0.95 }}
														animate={{ 
															backgroundColor: savedGames.has(game.id) ? '#fef2f2' : '#f3f4f6',
															color: savedGames.has(game.id) ? '#b91c1c' : '#374151'
														}}
														transition={{ duration: 0.2 }}
														className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 border-2 ${
															savedGames.has(game.id)
																? 'border-red-200 shadow-md'
																: 'border-gray-200 hover:border-gray-300'
														} ${savingGames.has(game.id) ? 'cursor-not-allowed opacity-75' : 'hover:shadow-sm'}`}
													>
														{savingGames.has(game.id) ? (
															<>
																<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
																<span>Saving...</span>
															</>
														) : (
															<>
																<motion.span
																	animate={{ 
																		scale: savedGames.has(game.id) ? [1, 1.2, 1] : 1,
																		rotate: savedGames.has(game.id) ? [0, 10, -10, 0] : 0
																	}}
																	transition={{ duration: 0.3 }}
																>
																	{savedGames.has(game.id) ? '❤️' : '🤍'}
																</motion.span>
																<span className="font-semibold">
																	{savedGames.has(game.id) ? 'Saved!' : 'Save'}
																</span>
															</>
														)}
													</motion.button>
													<Link href={`/play/${game.id}/setup`} className="flex-1">
														<button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1">
															<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
																<path d="M8 5v14l11-7z" />
															</svg>
															<span>Play</span>
														</button>
													</Link>
												</div>
											</div>
										</motion.div>
									))}
								</div>
							) : (
								<div className="text-center py-16">
									<div className="max-w-md mx-auto">
										<div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
											<svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
												<path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z" />
											</svg>
										</div>
										<h3 className="text-xl font-semibold text-gray-900 mb-4">No public games found</h3>
										<p className="text-gray-600">Try adjusting your search or filters to find games.</p>
									</div>
								</div>
							)}
						</div>
					)}

					{activeTab !== 'my-sets' && activeTab !== 'play' && activeTab !== 'market' && (
						<div className="text-center py-16">
							<div className="max-w-md mx-auto">
								<div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
									<svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
									</svg>
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-4">Coming Soon</h3>
								<p className="text-gray-600">This feature is currently under development.</p>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Share Modal */}
			{shareModalGame && (
				<ShareModal
					game={shareModalGame}
					isOpen={!!shareModalGame}
					onClose={() => setShareModalGame(null)}
					onSuccess={() => {
						// Refresh games list to show updated sharing status
						const loadGames = async () => {
							try {
								const response = await fetch('/api/games');
								if (response.ok) {
									const data = await response.json();
									setGames(data.games || []);
								}
							} catch (error) {
								console.error('Error reloading games:', error);
							}
						};
						loadGames();
					}}
				/>
			)}
		</div>
	);
}
