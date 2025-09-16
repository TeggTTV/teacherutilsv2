'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import ShareModal from '@/components/ShareModal';
import { getApiUrl } from '@/lib/config';
import { trackGamePlay, trackSearch } from '@/lib/analytics';

// Import our new modular components
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MySetsTab from '@/components/dashboard/MySetsTab';
import { SavedGame, SidebarItem, PublicGame, MarketFilters } from '@/components/dashboard/types';

export default function Dashboard() {
	const { user, loading } = useAuthGuard();
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	
	// Get tab from URL parameters, default to 'play'
	const [activeTab, setActiveTab] = useState(() => {
		const urlTab = searchParams.get('tab');
		return ['play', 'discover', 'market', 'stats', 'my-sets', 'saved'].includes(urlTab || '') 
			? (urlTab as string) 
			: 'play';
	});
	
	const [games, setGames] = useState<SavedGame[]>([]);
	const [publicGames, setPublicGames] = useState<PublicGame[]>([]);
	const [loadingGames, setLoadingGames] = useState(true);
	const [loadingPublicGames, setLoadingPublicGames] = useState(false);
	const [marketSearch, setMarketSearch] = useState('');
	const [marketFilters, setMarketFilters] = useState<MarketFilters>({
		subject: '',
		gradeLevel: '',
		difficulty: '',
		sortBy: 'newest'
	});
	const [shareModalGame, setShareModalGame] = useState<SavedGame | null>(null);
	const [selectedGameInfo, setSelectedGameInfo] = useState<SavedGame | null>(null);

	const [savedGames, setSavedGames] = useState<PublicGame[]>([]);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	// Function to handle tab navigation
	const handleTabChange = (tabId: string) => {
		setActiveTab(tabId);
		// Update URL without page reload
		const newUrl = `${pathname}?tab=${tabId}`;
		window.history.pushState({}, '', newUrl);
	};

	// Listen for URL changes (browser back/forward)
	useEffect(() => {
		const handlePopState = () => {
			const urlParams = new URLSearchParams(window.location.search);
			const urlTab = urlParams.get('tab');
			if (urlTab && ['play', 'stats', 'market', 'discover', 'my-sets', 'saved'].includes(urlTab)) {
				setActiveTab(urlTab);
			}
		};

		window.addEventListener('popstate', handlePopState);
		return () => window.removeEventListener('popstate', handlePopState);
	}, []);

	// Load user's games
	const loadGames = useCallback(async () => {
		if (!user) return;
		
		try {
			const response = await fetch(getApiUrl('/api/games'));
			if (response.ok) {
				const data = await response.json();
				setGames(data.games || []);
			}
		} catch (error) {
			console.error('Error loading games:', error);
		} finally {
			setLoadingGames(false);
		}
	}, [user]);

	useEffect(() => {
		if (user && !loading) {
			loadGames();
		}
	}, [user, loading, loadGames]);

	// Load public games for discover tab
	useEffect(() => {
		const loadPublicGames = async () => {
			if (activeTab === 'discover') {
				setLoadingPublicGames(true);
				try {
					const response = await fetch('/api/games/public');
					if (response.ok) {
						const data = await response.json();
						setPublicGames(data.games || []); // Extract games from response
					}
				} catch (error) {
					console.error('Error loading public games:', error);
				} finally {
					setLoadingPublicGames(false);
				}
			}
		};

		loadPublicGames();
	}, [activeTab, user]);

	// Load saved games for saved tab
	useEffect(() => {
		const loadSavedGames = async () => {
			if (activeTab === 'saved' && user) {
				try {
					const response = await fetch('/api/games/saved');
					if (response.ok) {
						const data = await response.json();
						setSavedGames(data.games || []); // Extract games from response
					}
				} catch (error) {
					console.error('Error loading saved games:', error);
				}
			}
		};

		loadSavedGames();
	}, [activeTab, user]);

	// Handle game actions
	const handleEditGame = (game: SavedGame) => {
		router.push(`/create/question-set?edit=${game.id}`);
	};

	const handleShareGame = (game: SavedGame) => {
		setShareModalGame(game);
	};

	const handleGameInfo = (game: SavedGame) => {
		setSelectedGameInfo(game);
	};

	const handlePlayGame = (game: SavedGame) => {
		trackGamePlay(game.id, game.data.gameTitle);
	};

	const handleFavoriteGame = async (gameId: string) => {
		try {
			const savedGame = savedGames?.find(g => g.id === gameId);
			if (savedGame) {
				// Unsave game
				const response = await fetch(`/api/games/saved/${gameId}`, {
					method: 'DELETE',
				});
				if (response.ok) {
					setSavedGames(prev => prev?.filter(g => g.id !== gameId) || []);
				}
			} else {
				// Save game
				const response = await fetch(`/api/games/saved/${gameId}`, {
					method: 'POST',
				});
				if (response.ok) {
					// Add to saved games
					const gameToSave = publicGames?.find(g => g.id === gameId);
					if (gameToSave) {
						setSavedGames(prev => [...(prev || []), gameToSave]);
					}
				}
			}
		} catch (error) {
			console.error('Error toggling saved game:', error);
		}
	};

	const handleSearch = (searchTerm: string) => {
		setMarketSearch(searchTerm);
		if (searchTerm) {
			trackSearch(searchTerm);
		}
	};

	const handleFilterChange = (filterType: keyof MarketFilters, value: string) => {
		setMarketFilters(prev => ({
			...prev,
			[filterType]: value
		}));
	};

	// Sidebar configuration
	const sidebarItems: SidebarItem[] = [
		{
			id: 'play',
			label: 'Play Games',
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M8 5v14l11-7z" />
				</svg>
			),
			bgColor: activeTab === 'play' ? 'bg-blue-500' : 'bg-gray-100',
			textColor: activeTab === 'play' ? 'text-white' : 'text-gray-700',
		},
		{
			id: 'discover',
			label: 'Discover',
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
				</svg>
			),
			bgColor: activeTab === 'discover' ? 'bg-blue-500' : 'bg-gray-100',
			textColor: activeTab === 'discover' ? 'text-white' : 'text-gray-700',
		},
		{
			id: 'market',
			label: 'Market',
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
				</svg>
			),
			bgColor: activeTab === 'market' ? 'bg-blue-500' : 'bg-gray-100',
			textColor: activeTab === 'market' ? 'text-white' : 'text-gray-700',
		},
		{
			id: 'stats',
			label: 'Statistics',
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
				</svg>
			),
			bgColor: activeTab === 'stats' ? 'bg-blue-500' : 'bg-gray-100',
			textColor: activeTab === 'stats' ? 'text-white' : 'text-gray-700',
		},
		{
			id: 'my-sets',
			label: 'My Sets',
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0H8v0z" />
				</svg>
			),
			bgColor: activeTab === 'my-sets' ? 'bg-blue-500' : 'bg-gray-100',
			textColor: activeTab === 'my-sets' ? 'text-white' : 'text-gray-700',
		},
		{
			id: 'saved',
			label: 'Saved Games',
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
				</svg>
			),
			bgColor: activeTab === 'saved' ? 'bg-blue-500' : 'bg-gray-100',
			textColor: activeTab === 'saved' ? 'text-white' : 'text-gray-700',
		},
	];

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
			{/* Sidebar */}
			<DashboardSidebar
				sidebarOpen={sidebarOpen}
				setSidebarOpen={setSidebarOpen}
				sidebarItems={sidebarItems}
				activeTab={activeTab}
				onTabChange={handleTabChange}
			/>

			{/* Main Content */}
			<div className="flex-1 min-w-0">
				{/* Header */}
				<DashboardHeader
					activeTab={activeTab}
					sidebarOpen={sidebarOpen}
					setSidebarOpen={setSidebarOpen}
				/>

				{/* Content Area */}
				<div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50/30 to-indigo-100/30 min-h-screen">
					<div className="max-w-7xl mx-auto">
						{/* My Sets Tab */}
						{activeTab === 'my-sets' && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.2 }}
							>
								<MySetsTab
									games={games}
									loadingGames={loadingGames}
									onEditGame={handleEditGame}
									onShareGame={handleShareGame}
									onGameInfo={handleGameInfo}
									onPlayGame={handlePlayGame}
								/>
							</motion.div>
						)}

						{/* Other tabs - Placeholder content for now */}
						{activeTab === 'play' && (
							<div className="space-y-6">
								<div className="flex justify-between items-center">
									<h2 className="text-2xl font-bold text-gray-900">Play Your Games</h2>
								</div>

								{games && games.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{games.filter(game => game.isPublic).map((game) => (
											<motion.div
												key={game.id}
												className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												whileHover={{ y: -5 }}
											>
												{/* Display Image */}
												<div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg overflow-hidden">
													{game.data.displayImage ? (
														<img 
															src={game.data.displayImage} 
															alt={game.data.gameTitle}
															className="w-full h-full object-cover"
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center">
															<div className="text-6xl opacity-50">🎮</div>
														</div>
													)}
												</div>
												<div className="p-4">
													<h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
														{game.data.gameTitle}
													</h3>
													<p className="text-sm text-gray-600 mb-4 line-clamp-2">
														{game.description || 'No description available'}
													</p>

													<div className="flex items-center justify-between text-sm text-gray-500 mb-4">
														<span className="flex items-center">
															<svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
															</svg>
															Published
														</span>
														<span className="text-green-600 font-medium">Ready to Play</span>
													</div>

													<Link
														href={`/play/${game.id}/setup`}
														className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 text-center"
													>
														Start Game
													</Link>
												</div>
											</motion.div>
										))}
									</div>
								) : (
									<div className="text-center py-16">
										<svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										<h3 className="text-lg font-medium text-gray-900 mb-2">No Games to Play</h3>
										<p className="text-gray-600 mb-4">You need to publish some games first to make them playable.</p>
										<Link
											href="#"
											onClick={() => setActiveTab('my-sets')}
											className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
										>
											Go to My Sets
										</Link>
									</div>
								)}
							</div>
						)}

						{activeTab === 'stats' && (
							<div className="text-center py-16">
								<h2 className="text-2xl font-bold text-gray-900 mb-4">Statistics</h2>
								<p className="text-gray-600">Statistics feature coming soon!</p>
							</div>
						)}

						{activeTab === 'market' && (
							<div className="space-y-6">
								<div className="flex justify-between items-center">
									<h2 className="text-2xl font-bold text-gray-900">Game Templates Market</h2>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{/* Sample template cards */}
									<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
										<div className="p-4">
											<h3 className="font-semibold text-gray-900 mb-2">Science Quiz Template</h3>
											<p className="text-sm text-gray-600 mb-4">
												Ready-to-use science questions for middle school students
											</p>
											<div className="flex items-center justify-between text-sm text-gray-500 mb-4">
												<span>25 questions</span>
												<span className="text-green-600 font-medium">Free</span>
											</div>
											<button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
												Use Template
											</button>
										</div>
									</div>

									<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
										<div className="p-4">
											<h3 className="font-semibold text-gray-900 mb-2">History Jeopardy</h3>
											<p className="text-sm text-gray-600 mb-4">
												Complete history game with categories and questions
											</p>
											<div className="flex items-center justify-between text-sm text-gray-500 mb-4">
												<span>30 questions</span>
												<span className="text-green-600 font-medium">Free</span>
											</div>
											<button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
												Use Template
											</button>
										</div>
									</div>

									<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
										<div className="p-4">
											<h3 className="font-semibold text-gray-900 mb-2">Math Practice Set</h3>
											<p className="text-sm text-gray-600 mb-4">
												Mathematical concepts for elementary grades
											</p>
											<div className="flex items-center justify-between text-sm text-gray-500 mb-4">
												<span>20 questions</span>
												<span className="text-green-600 font-medium">Free</span>
											</div>
											<button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
												Use Template
											</button>
										</div>
									</div>
								</div>

								<div className="text-center py-8">
									<p className="text-gray-600">More templates coming soon! Create your own to share with the community.</p>
								</div>
							</div>
						)}

						{activeTab === 'discover' && (
							<div>
								{/* Search and Filters */}
								<div className="mb-6 space-y-4">
									{/* Search Bar */}
									<div className="relative">
										<input
											type="text"
											placeholder="Search games to discover..."
											value={marketSearch}
											onChange={(e) => {
												const value = e.target.value;
												setMarketSearch(value);
												// Track search after user stops typing for 1 second
												if (value.length > 2) {
													setTimeout(() => trackSearch(value), 1000);
												}
											}}
											className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
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
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
										<select
											value={marketFilters.subject}
											onChange={(e) => setMarketFilters({...marketFilters, subject: e.target.value})}
											className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
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
											className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
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
											className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
										>
											<option value="">All Difficulties</option>
											<option value="beginner">Beginner</option>
											<option value="intermediate">Intermediate</option>
											<option value="advanced">Advanced</option>
										</select>

										<select
											value={marketFilters.sortBy}
											onChange={(e) => setMarketFilters({...marketFilters, sortBy: e.target.value})}
											className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
										>
											<option value="newest">Newest</option>
											<option value="popular">Most Popular</option>
											<option value="downloads">Most Downloaded</option>
											<option value="rating">Highest Rated</option>
										</select>
									</div>
								</div>

								{/* Games Grid */}
								{loadingPublicGames ? (
									<div className="flex items-center justify-center py-16">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
									</div>
								) : publicGames.length > 0 ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
										{publicGames.map((game) => (
											<motion.div
												key={game.id}
												whileHover={{ scale: 1.02 }}
												className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
											>
												<div className="p-4 sm:p-6">
													{/* Display Image */}
													<div className="w-full h-24 sm:h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg mb-3 sm:mb-4 overflow-hidden">
														{game.data?.displayImage ? (
															<img 
																src={game.data.displayImage} 
																alt={game.title}
																className="w-full h-full object-cover"
															/>
														) : (
															<div className="w-full h-full flex items-center justify-center">
																<div className="text-2xl sm:text-4xl opacity-50">🌟</div>
															</div>
														)}
													</div>
													
													<h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base">
														{game.title}
													</h3>
													
													{game.description && (
														<p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
															{game.description}
														</p>
													)}

													<div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
														{game.subject && (
															<span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
																{game.subject}
															</span>
														)}
														{game.gradeLevel && (
															<span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
																{game.gradeLevel}
															</span>
														)}
														{game.difficulty && (
															<span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
																{game.difficulty}
															</span>
														)}
													</div>

													<div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
														<span className="truncate">By {game.author.name}</span>
														<div className="flex items-center space-x-2">
															{game.avgRating > 0 && (
																<div className="flex items-center">
																	<span>⭐</span>
																	<span className="ml-1">{game.avgRating}</span>
																	<span className="text-gray-400 hidden sm:inline">({game.ratingsCount})</span>
																</div>
															)}
														</div>
													</div>

													<div className="flex items-center justify-between text-xs text-gray-500 mb-3 sm:mb-4">
														<span>🎮 {game.plays}</span>
														<span>📥 {game.downloads}</span>
														<span>❤️ {game.favoritesCount}</span>
													</div>

													<div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-2">
														<motion.button
															onClick={() => handleFavoriteGame(game.id)}
															whileHover={{ scale: 1.05 }}
															whileTap={{ scale: 0.95 }}
															animate={{ 
																backgroundColor: savedGames.some(g => g.id === game.id) ? '#fef2f2' : '#f3f4f6',
																color: savedGames.some(g => g.id === game.id) ? '#b91c1c' : '#374151'
															}}
															transition={{ duration: 0.2 }}
															className={`flex-1 py-3 sm:py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 border-2 min-h-[44px] sm:min-h-[40px] hover:shadow-sm ${
																savedGames.some(g => g.id === game.id)
																	? 'border-red-200 shadow-md'
																	: 'border-gray-200 hover:border-gray-300'
															}`}
														>
															{(
																<>
																	<motion.span
																		animate={{ 
																			scale: savedGames.some(g => g.id === game.id) ? [1, 1.2, 1] : 1,
																			rotate: savedGames.some(g => g.id === game.id) ? [0, 10, -10, 0] : 0
																		}}
																		transition={{ duration: 0.3 }}
																	>
																		{savedGames.some(g => g.id === game.id) ? '❤️' : '🤍'}
																	</motion.span>
																	<span className="font-semibold">
																		{savedGames.some(g => g.id === game.id) ? 'Saved!' : 'Save'}
																	</span>
																</>
															)}
														</motion.button>
														<Link href={`/play/${game.id}/setup`} className="flex-1">
															<button 
																onClick={() => trackGamePlay(game.id, game.title)}
																className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 sm:py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 min-h-[44px] sm:min-h-[40px]"
															>
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
													<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
												</svg>
											</div>
											<h3 className="text-xl font-semibold text-gray-900 mb-4">No games found</h3>
											<p className="text-gray-600">Try adjusting your search or filters to discover games.</p>
										</div>
									</div>
								)}
							</div>
						)}

						{activeTab === 'saved' && (
							<div className="space-y-6">
								<div className="flex justify-between items-center">
									<h2 className="text-2xl font-bold text-gray-900">Saved Games</h2>
								</div>

								{savedGames && savedGames.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{savedGames.map((game) => (
											<motion.div
												key={game.id}
												className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												whileHover={{ y: -5 }}
											>
												{/* Display Image */}
												<div className="w-full h-48 bg-gradient-to-br from-green-100 to-blue-100 rounded-t-lg overflow-hidden">
													{game.data?.displayImage ? (
														<img 
															src={game.data.displayImage} 
															alt={game.title}
															className="w-full h-full object-cover"
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center">
															<div className="text-6xl opacity-50">⭐</div>
														</div>
													)}
												</div>
												<div className="p-4">
													<div className="flex items-start justify-between mb-3">
														<div className="flex-1">
															<h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
																{game.title}
															</h3>
															<p className="text-sm text-gray-600 mb-2">
																by {game.author.name}
															</p>
														</div>
													</div>

													<div className="flex items-center justify-between text-sm text-gray-500 mb-4">
														<div className="flex items-center space-x-4">
															<span className="flex items-center">
																<svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
																	<path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
																	<path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
																</svg>
																{game.plays || 0}
															</span>
															<span className="flex items-center">
																<svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
																	<path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
																</svg>
																{game.saves || 0}
															</span>
														</div>
													</div>

													<div className="flex space-x-2">
														<Link
															href={`/play/${game.id}/setup`}
															className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 text-center"
														>
															Play Game
														</Link>
														<button
															onClick={() => handleFavoriteGame(game.id)}
															className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors duration-200"
														>
															Remove
														</button>
													</div>
												</div>
											</motion.div>
										))}
									</div>
								) : (
									<div className="text-center py-16">
										<svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
										</svg>
										<h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Games</h3>
										<p className="text-gray-600 mb-4">You haven&apos;t saved any games yet.</p>
										<Link
											href="#"
											onClick={() => setActiveTab('discover')}
											className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
										>
											Discover Games to Save
										</Link>
									</div>
								)}
							</div>
						)}
					</div>
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
						loadGames();
					}}
				/>
			)}

			{/* Game Info Modal */}
			{selectedGameInfo && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold text-gray-900">Game Information</h3>
							<button
								onClick={() => setSelectedGameInfo(null)}
								className="text-gray-400 hover:text-gray-600 transition-colors"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						
						<div className="space-y-4">
							<div>
								<span className="font-medium text-gray-700">Title:</span>
								<p className="text-gray-900">{selectedGameInfo.data.gameTitle}</p>
							</div>
							
							{selectedGameInfo.data.categories && selectedGameInfo.data.categories.length > 0 && (
								<div>
									<span className="font-medium text-gray-700">Categories:</span>
									<ul className="text-gray-900 ml-4 list-disc">
										{selectedGameInfo.data.categories.map((cat, index) => (
											<li key={index}>{cat.name || `Category ${index + 1}`}</li>
										))}
									</ul>
								</div>
							)}
							
							<div>
								<span className="font-medium text-gray-700">Created:</span>
								<p className="text-gray-900">{new Date(selectedGameInfo.createdAt).toLocaleDateString()}</p>
							</div>
							
							<div>
								<span className="font-medium text-gray-700">Last Updated:</span>
								<p className="text-gray-900">{new Date(selectedGameInfo.updatedAt).toLocaleDateString()}</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
