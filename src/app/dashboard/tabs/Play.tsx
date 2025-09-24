'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SavedGame } from '@/components/dashboard/types';

export default function Play({
	games,
	isGameComplete,
	showIncompleteGames,
	setShowIncompleteGames,
	setActiveTab,
}: {
	games: SavedGame[];
	isGameComplete: (data: Record<string, unknown>) => boolean;
	showIncompleteGames: boolean;
	setShowIncompleteGames: (value: boolean) => void;
	setActiveTab: (tab: string) => void;
}) {
	return (
		<div className="space-y-6">
			{/* Play Tab Header with Toggle */}
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold text-gray-900">
					Play Your Games
				</h2>
				<div className="flex items-center space-x-2">
					<label
						htmlFor="show-incomplete"
						className="text-sm font-medium text-gray-700"
					>
						Show incomplete games
					</label>
					<button
						id="show-incomplete"
						className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
							showIncompleteGames ? 'bg-blue-600' : 'bg-gray-200'
						}`}
						onClick={() =>
							setShowIncompleteGames(!showIncompleteGames)
						}
					>
						<span
							className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
								showIncompleteGames
									? 'translate-x-6'
									: 'translate-x-1'
							}`}
						/>
					</button>
				</div>
			</div>

			{games && games.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{games
						.filter((game) => {
							const isComplete = isGameComplete(game.data);
							return showIncompleteGames
								? !isComplete
								: isComplete;
						})
						.map((game) => (
							<motion.div
								key={game.id}
								className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
								initial={{
									opacity: 0,
									y: 20,
								}}
								animate={{
									opacity: 1,
									y: 0,
								}}
							>
								{/* Display Image */}
								<div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg overflow-hidden">
									{game.data.displayImage ? (
										<Image
											width={400}
											height={200}
											src={game.data.displayImage}
											alt={game.data.gameTitle}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center">
											<div className="text-6xl opacity-50">
												🎮
											</div>
										</div>
									)}
								</div>
								<div className="p-4">
									<h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
										{game.data.gameTitle}
									</h3>
									<p className="text-sm text-gray-600 mb-4 line-clamp-2">
										{game.description ||
											'No description available'}
									</p>

									{/* <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
															<span className="flex items-center">
																<svg
																	className="w-4 h-4 mr-1"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={
																			2
																		}
																		d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
																	/>
																</svg>
																Published
															</span>
															<span className="text-green-600 font-medium">
																Ready to Play
															</span>
														</div> */}

									<Link
										href={`/play/${game.id}/setup`}
										className="block w-full bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors duration-200 text-center"
									>
										Start Game
									</Link>
								</div>
							</motion.div>
						))}
				</div>
			) : (
				<div className="text-center py-16">
					<svg
						className="w-16 h-16 text-gray-300 mx-auto mb-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						{showIncompleteGames
							? 'No Incomplete Games'
							: 'No Complete Games to Play'}
					</h3>
					<p className="text-gray-600 mb-4">
						{showIncompleteGames
							? 'All your games are complete and ready to play!'
							: 'Complete your games by filling out all categories and questions to make them playable.'}
					</p>
					<Link
						href="#"
						onClick={() => setActiveTab('my-sets')}
						className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
					>
						Go to My Sets
					</Link>
				</div>
			)}
		</div>
	);
}
