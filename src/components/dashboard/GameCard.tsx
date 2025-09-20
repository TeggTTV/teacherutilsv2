'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { SavedGame } from './types';
import DropdownMenu, { DropdownMenuItem } from '@/components/DropdownMenu';

interface GameCardProps {
	game: SavedGame;
	onEdit: (game: SavedGame) => void;
	onShare: (game: SavedGame) => void;
	onInfo: (game: SavedGame) => void;
	onPlay: (game: SavedGame) => void;
	onDelete: (game: SavedGame) => void;
}

export default function GameCard({ game, onEdit, onShare, onInfo, onPlay, onDelete }: GameCardProps) {
	// Create dropdown menu items
	const dropdownItems: DropdownMenuItem[] = [
		{
			id: 'edit',
			label: 'Edit Game',
			icon: (
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
						d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
					/>
				</svg>
			),
			action: () => onEdit(game),
		},
		{
			id: 'share',
			label: 'Share',
			icon: (
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
						d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
					/>
				</svg>
			),
			action: () => onShare(game),
		},
		{
			id: 'info',
			label: 'Info',
			icon: (
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
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			),
			action: () => onInfo(game),
		},
		{
			id: 'delete',
			label: 'Delete',
			variant: 'danger' as const,
			icon: (
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
						d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
					/>
				</svg>
			),
			action: () => onDelete(game),
		},
	];

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
			{/* Reusable dropdown menu - Top Right */}
			<DropdownMenu 
				items={dropdownItems}
				className="absolute top-3 right-3 z-10"
			/>

			{/* Game Image */}
			<div className="h-40 bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
				{/* Public status indicator */}
				{game.isPublic && (
					<div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 shadow-lg">
						<svg
							className="w-3 h-3"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
						</svg>
						<span>Public</span>
					</div>
				)}

				{/* Game Image */}
				{game.data.displayImage ? (
					<Image
						src={game.data.displayImage}
						alt={game.data.gameTitle || 'Game'}
						width={400}
						height={160}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center text-6xl opacity-50">
						🎮
					</div>
				)}
			</div>

			{/* Game Content */}
			<div className="p-6">
				<div className="flex flex-col h-full">
					{/* Title and Description */}
					<div className="flex-grow">
						<h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
							{game.data.gameTitle || 'Untitled Game'}
						</h3>
						<p className="text-gray-600 text-sm mb-4 line-clamp-2">
							{game.description || 'No description available'}
						</p>
					</div>

					{/* Game Stats */}
					<div className="flex items-center justify-between text-xs text-gray-500 mb-4">
						<span>
							{game.data.categories?.reduce((total, category) => total + (category.questions?.length || 0), 0) || 0} questions
						</span>
						<span>
							Created {new Date(game.createdAt).toLocaleDateString()}
						</span>
					</div>

					{/* Action Button */}
					<Link 
						href={`/play/${game.id}`}
						onClick={() => onPlay(game)}
					>
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 010 5H9m4.5-5a2.5 2.5 0 010 5M12 12l3-3-3-3"
								/>
							</svg>
							<span>Play Game</span>
						</motion.button>
					</Link>
				</div>
			</div>
		</motion.div>
	);
}