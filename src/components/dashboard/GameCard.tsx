'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { SavedGame } from './types';

interface GameCardProps {
	game: SavedGame;
	onEdit: (game: SavedGame) => void;
	onShare: (game: SavedGame) => void;
	onInfo: (game: SavedGame) => void;
	onPlay: (game: SavedGame) => void;
}

export default function GameCard({ game, onEdit, onShare, onInfo, onPlay }: GameCardProps) {
	const handleDropdownClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const dropdownId = `dropdown-top-${game.id}`;
		const dropdown = document.getElementById(dropdownId);
		if (dropdown) {
			dropdown.classList.toggle('hidden');
		}
	};

	return (
		<motion.div
			key={game.id}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
			className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 relative group"
		>
			{/* Mobile-friendly three dots menu - Top Right */}
			<div className="absolute top-3 right-3 z-10">
				<button
					onClick={handleDropdownClick}
					className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
				>
					<svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
					</svg>
				</button>
				
				{/* Dropdown Menu */}
				<div
					id={`dropdown-top-${game.id}`}
					className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20"
				>
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onEdit(game);
							const dropdown = document.getElementById(`dropdown-top-${game.id}`);
							if (dropdown) dropdown.classList.add('hidden');
						}}
						className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors rounded-t-lg flex items-center space-x-2"
					>
						<svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
						<span>Edit Game</span>
					</button>
					
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onShare(game);
							const dropdown = document.getElementById(`dropdown-top-${game.id}`);
							if (dropdown) dropdown.classList.add('hidden');
						}}
						className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-2"
					>
						<svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
						</svg>
						<span>Share</span>
					</button>
					
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onInfo(game);
							const dropdown = document.getElementById(`dropdown-top-${game.id}`);
							if (dropdown) dropdown.classList.add('hidden');
						}}
						className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors rounded-b-lg flex items-center space-x-2"
					>
						<svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>Info</span>
					</button>
				</div>
			</div>

			{/* Game Image */}
			<div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
				{game.data.displayImage ? (
					<img
						src={game.data.displayImage}
						alt={game.data.gameTitle || 'Game'}
						className="w-full h-full object-cover"
						onError={(e) => {
							const target = e.target as HTMLImageElement;
							target.style.display = 'none';
						}}
					/>
				) : (
					<div className="flex items-center justify-center h-full">
						<div className="text-white text-center">
							<div className="text-3xl mb-2">🎮</div>
							<div className="text-sm font-medium">Jeopardy Game</div>
						</div>
					</div>
				)}
			</div>

			{/* Game Content */}
			<div className="p-4">
				<h3 className="font-semibold text-gray-900 mb-2 text-lg leading-tight line-clamp-2">
					{game.data.gameTitle || 'Untitled Game'}
				</h3>
				
				{game.data.categories && game.data.categories.length > 0 && (
					<div className="mb-3">
						<p className="text-xs text-gray-500 mb-1">Categories:</p>
						<div className="flex flex-wrap gap-1">
							{game.data.categories.slice(0, 3).map((category, index) => (
								<span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
									{category.name || `Category ${index + 1}`}
								</span>
							))}
							{game.data.categories.length > 3 && (
								<span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
									+{game.data.categories.length - 3} more
								</span>
							)}
						</div>
					</div>
				)}

				<div className="flex items-center justify-between mt-4">
					<div className="text-xs text-gray-500">
						{new Date(game.createdAt).toLocaleDateString()}
					</div>
					
					<Link href={`/play/${game.id}/setup`}>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={(e) => {
								e.stopPropagation();
								onPlay(game);
							}}
							className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors inline-flex items-center space-x-1"
						>
							<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
								<path d="M8 5v14l11-7z" />
							</svg>
							<span>Play</span>
						</motion.button>
					</Link>
				</div>
			</div>
		</motion.div>
	);
}