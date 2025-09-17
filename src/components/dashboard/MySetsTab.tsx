'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { SavedGame } from './types';
import GameCard from './GameCard';

interface MySetsTabProps {
	games: SavedGame[];
	loadingGames: boolean;
	onEditGame: (game: SavedGame) => void;
	onShareGame: (game: SavedGame) => void;
	onGameInfo: (game: SavedGame) => void;
	onPlayGame: (game: SavedGame) => void;
}

export default function MySetsTab({
	games,
	loadingGames,
	onEditGame,
	onShareGame,
	onGameInfo,
	onPlayGame
}: MySetsTabProps) {
	if (loadingGames) {
		return (
			<div className="flex items-center justify-center py-16">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (games.length === 0) {
		return (
			<motion.div 
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.3 }}
				className="text-center py-16 sm:py-24"
			>
				<div className="max-w-md mx-auto px-4">
					<div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
						<svg className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					</div>
					<h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">No games yet</h3>
					<p className="text-gray-600 mb-8 sm:mb-10 text-lg leading-relaxed">Create your first educational game to get started on your teaching journey.</p>
					<Link href="/create/question-set">
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center space-x-3"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
							<span>Create Game</span>
						</motion.button>
					</Link>
				</div>
			</motion.div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header with Create Set button */}
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold text-gray-900">My Sets</h2>
				<Link href="/create/question-set">
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md inline-flex items-center space-x-2"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						<span>Create Set</span>
					</motion.button>
				</Link>
			</div>

			{/* Games grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
				{games.map((game) => (
					<GameCard
						key={game.id}
						game={game}
						onEdit={onEditGame}
						onShare={onShareGame}
						onInfo={onGameInfo}
						onPlay={onPlayGame}
					/>
				))}
			</div>
		</div>
	);
}