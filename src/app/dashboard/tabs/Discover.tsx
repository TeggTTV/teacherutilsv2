'use client';
import AdvancedSearch from '@/components/AdvancedSearch';
import { motion } from 'framer-motion';
import { trackGamePlay, trackSearch } from '@/lib/analytics';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { PublicGame } from '@/components/dashboard/types';
import { User } from '@/types/user';
import Link from 'next/link';

export default function Discover({ user }: { user: User | null }) {
	const [discoverSearchTerm, setDiscoverSearchTerm] = useState('');
	const [discoverSelectedTags, setDiscoverSelectedTags] = useState<string[]>(
		[]
	);
	const [loadingPublicGames, setLoadingPublicGames] = useState(false);
	const [publicGames, setPublicGames] = useState<PublicGame[]>([]);
	const [savedGames, setSavedGames] = useState<PublicGame[]>([]);
	const [saveLoadingId, setSaveLoadingId] = useState<string | null>(null);

	const handleFavoriteGame = async (gameId: string) => {
		// Set loading state
		setSaveLoadingId(gameId);

		try {
			const savedGame = savedGames?.find((g) => g.id === gameId);

			if (savedGame) {
				// Unsave game
				const response = await fetch(`/api/games/saved/${gameId}`, {
					method: 'DELETE',
				});
				if (response.ok) {
					// Remove from savedGames
					setSavedGames(
						(prev) => prev?.filter((g) => g.id !== gameId) || []
					);
					// Decrement favoritesCount for the public game
					setPublicGames((prev) =>
						prev.map((g) =>
							g.id === gameId
								? {
										...g,
										favoritesCount: Math.max(
											0,
											(g.favoritesCount || 0) - 1
										),
								  }
								: g
						)
					);
				} else {
					console.error('Failed to unsave game', response.statusText);
				}
			} else {
				// Save game
				const response = await fetch(`/api/games/saved/${gameId}`, {
					method: 'POST',
				});
				if (response.ok) {
					// Add to saved games
					const gameToSave = publicGames?.find(
						(g) => g.id === gameId
					);
					if (gameToSave) {
						setSavedGames((prev) => [...(prev || []), gameToSave]);
					}
					// Increment favoritesCount for the public game
					setPublicGames((prev) =>
						prev.map((g) =>
							g.id === gameId
								? {
										...g,
										favoritesCount:
											(g.favoritesCount || 0) + 1,
								  }
								: g
						)
					);
				} else {
					console.error('Failed to save game', response.statusText);
				}
			}
		} catch (error) {
			console.error('Error toggling saved game:', error);
		} finally {
			setSaveLoadingId(null);
		}
	};

	// Load public games for discover tab
	useEffect(() => {
		const loadPublicGames = async () => {
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
		};

		loadPublicGames();
	}, [user]);

	// Load saved games for saved tab and to check saved status in discover tab
	useEffect(() => {
		const loadSavedGames = async () => {
			if (user) {
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
	}, [user]); // Load whenever user changes, not just when on saved tab

	const filterGamesBySearch = (
		games: PublicGame[],
		searchTerm: string,
		selectedTags: string[]
	) => {
		if (!searchTerm && selectedTags.length === 0) return games;

		return games
			.filter((game) => {
				// Search term filtering (check title, description, and tags)
				const matchesSearch =
					!searchTerm ||
					game.title
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					(game.description &&
						game.description
							.toLowerCase()
							.includes(searchTerm.toLowerCase())) ||
					(game.tags &&
						game.tags.some((gameTag: string) =>
							gameTag
								.toLowerCase()
								.includes(searchTerm.toLowerCase())
						));

				// Tag filtering (AND logic - must have ALL selected tags)
				const matchesTags =
					selectedTags.length === 0 ||
					(game.tags &&
						selectedTags.every((tag) =>
							game.tags.some(
								(gameTag: string) =>
									gameTag.toLowerCase() === tag.toLowerCase()
							)
						));

				return matchesSearch && matchesTags;
			})
			.sort((a, b) => {
				// Prioritize exact matches in title
				if (searchTerm) {
					const aExactMatch = a.title
						.toLowerCase()
						.includes(searchTerm.toLowerCase());
					const bExactMatch = b.title
						.toLowerCase()
						.includes(searchTerm.toLowerCase());

					if (aExactMatch && !bExactMatch) return -1;
					if (!aExactMatch && bExactMatch) return 1;

					// If both have exact matches, check if one starts with the search term
					const aStartsWithSearch = a.title
						.toLowerCase()
						.startsWith(searchTerm.toLowerCase());
					const bStartsWithSearch = b.title
						.toLowerCase()
						.startsWith(searchTerm.toLowerCase());

					if (aStartsWithSearch && !bStartsWithSearch) return -1;
					if (!aStartsWithSearch && bStartsWithSearch) return 1;
				}

				return 0; // Keep original order for equal matches
			});
	};

	const filteredPublicGames = filterGamesBySearch(
		publicGames,
		discoverSearchTerm,
		discoverSelectedTags
	);

	return (
		<>
			{/* Advanced Search */}
			<div className="mb-6">
				<AdvancedSearch
					onSearchChange={setDiscoverSearchTerm}
					onSearch={(searchTerm) => {
						setDiscoverSearchTerm(searchTerm);
						if (searchTerm.length > 2) {
							setTimeout(() => trackSearch(searchTerm), 1000);
						}
					}}
					onTagsChange={setDiscoverSelectedTags}
					selectedTags={discoverSelectedTags}
					placeholder="Search games to discover..."
				/>
			</div>

			{/* Games Grid */}
			{loadingPublicGames ? (
				<div className="flex items-center justify-center py-16">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
				</div>
			) : filteredPublicGames.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
					{filteredPublicGames.map((game) => (
						<motion.div
							key={game.id}
							className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
						>
							<div className="p-4 sm:p-6 h-full flex flex-col justify-between relative">
								{/* Display Image */}
								<div className="w-full h-24 sm:h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-3 sm:mb-4 overflow-hidden">
									{game.data?.displayImage ? (
										<Image
											width={400}
											height={200}
											src={game.data.displayImage}
											alt={game.title}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center">
											<div className="text-2xl sm:text-4xl opacity-50">
												🌟
											</div>
										</div>
									)}
								</div>{' '}
								<h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base">
									{game.title}
								</h3>
								{game.description ? (
									<p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
										{game.description}
									</p>
								) : (
									<p className="text-xs sm:text-sm text-gray-500 mb-3 line-clamp-2 italic">
										(Description not provided)
									</p>
								)}
								{/* <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
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
													</div> */}
								<div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
									<span className="truncate">
										By {game.author.name}
									</span>
									{game.avgRating > 0 && (
										<div className="flex items-center">
											<span className="text-gray-400 text-xs">
												({game.ratingsCount} reviews)
											</span>
										</div>
									)}
								</div>
								<div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-2">
									<div className="relative flex-1">
										<motion.button
											onClick={() =>
												handleFavoriteGame(game.id)
											}
											whileHover={{
												scale: 1.05,
											}}
											whileTap={{
												scale: 0.95,
											}}
											animate={{
												backgroundColor:
													savedGames.some(
														(g) => g.id === game.id
													)
														? '#fef2f2'
														: '#f3f4f6',
												color: savedGames.some(
													(g) => g.id === game.id
												)
													? '#b91c1c'
													: '#374151',
											}}
											transition={{
												duration: 0.2,
											}}
											disabled={saveLoadingId === game.id}
											className={`w-full py-3 sm:py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 border-2 min-h-[44px] sm:min-h-[40px] hover:shadow-sm ${
												savedGames.some(
													(g) => g.id === game.id
												)
													? 'border-red-200 shadow-md'
													: 'border-gray-200 hover:border-gray-300'
											} ${
												saveLoadingId === game.id
													? 'opacity-75 cursor-not-allowed'
													: ''
											}`}
										>
											{saveLoadingId === game.id ? (
												<>
													<motion.div
														animate={{
															rotate: 360,
														}}
														transition={{
															duration: 1,
															repeat: Infinity,
															ease: 'linear',
														}}
														className="w-4 h-4"
													>
														<svg
															className="w-4 h-4"
															fill="currentColor"
															viewBox="0 0 24 24"
														>
															<path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
														</svg>
													</motion.div>
													<span className="font-semibold">
														Saving...
													</span>
												</>
											) : (
												<>
													<motion.span
														animate={{
															scale: savedGames.some(
																(g) =>
																	g.id ===
																	game.id
															)
																? [1, 1.2, 1]
																: 1,
															rotate: savedGames.some(
																(g) =>
																	g.id ===
																	game.id
															)
																? [
																		0, 10,
																		-10, 0,
																  ]
																: 0,
														}}
														transition={{
															duration: 0.3,
														}}
													>
														{savedGames.some(
															(g) =>
																g.id === game.id
														)
															? '❤️'
															: '🤍'}
													</motion.span>
													<span className="font-semibold">
														{savedGames.some(
															(g) =>
																g.id === game.id
														)
															? 'Saved!'
															: 'Save'}
													</span>
												</>
											)}
										</motion.button>

										{/* Stats Badges - Positioned on top right of save button */}
										{game.favoritesCount > 0 && (
											<div className="absolute -top-3 -right-2 flex flex-col space-y-1 z-10">
												<motion.div
													className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs flex items-center shadow-lg transform rotate-[15deg]"
													whileHover={{
														scale: 1.06,
														rotate: 22,
													}}
													transition={{
														duration: 0.18,
													}}
												>
													{/* Animated number */}
													<motion.span
														key={
															game.favoritesCount
														}
														initial={{
															scale: 0.6,
															opacity: 0,
														}}
														animate={{
															scale: 1,
															opacity: 1,
														}}
														transition={{
															type: 'spring',
															stiffness: 600,
															damping: 20,
														}}
														className="font-semibold"
													>
														{game.favoritesCount}
													</motion.span>
												</motion.div>
												{game.avgRating > 0 && (
													<motion.div
														className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs flex items-center shadow-lg transform rotate-[15deg] mt-1"
														whileHover={{
															scale: 1.1,
															rotate: 30,
														}}
														transition={{
															duration: 0.2,
														}}
													>
														<span className="mr-1">
															⭐
														</span>
														<span className="font-semibold">
															{game.avgRating.toFixed(
																1
															)}
														</span>
													</motion.div>
												)}
											</div>
										)}
									</div>
									<Link
										href={`/play/${game.id}/setup`}
										className="flex-1"
									>
										<button
											onClick={() =>
												trackGamePlay(
													game.id,
													game.title
												)
											}
											className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 sm:py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 min-h-[44px] sm:min-h-[40px]"
										>
											<svg
												className="w-4 h-4"
												fill="currentColor"
												viewBox="0 0 24 24"
											>
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
							<svg
								className="w-12 h-12 text-blue-600"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
							</svg>
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">
							No games found
						</h3>
						<p className="text-gray-600">
							Try adjusting your search or filters to discover
							games.
						</p>
					</div>
				</div>
			)}
		</>
	);
}
