'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { SavedGame } from './types';
import { useState, useEffect, useRef } from 'react';

interface GameCardProps {
	game: SavedGame;
	onEdit: (game: SavedGame) => void;
	onShare: (game: SavedGame) => void;
	onInfo: (game: SavedGame) => void;
	onPlay: (game: SavedGame) => void;
}

export default function GameCard({ game, onEdit, onShare, onInfo, onPlay }: GameCardProps) {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};

		if (isDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isDropdownOpen]);

	const handleDropdownToggle = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDropdownOpen(!isDropdownOpen);
	};

	const handleMenuAction = (action: () => void) => {
		action();
		setIsDropdownOpen(false);
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
			<div className="absolute top-3 right-3 z-10" ref={dropdownRef}>
				<motion.button
					onClick={handleDropdownToggle}
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 shadow-sm"
				>
					<motion.svg 
						className="w-4 h-4 text-gray-600" 
						fill="currentColor" 
						viewBox="0 0 24 24"
						animate={{ rotate: isDropdownOpen ? 90 : 0 }}
						transition={{ duration: 0.2 }}
					>
						<path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
					</motion.svg>
				</motion.button>
				
				{/* Animated Dropdown Menu */}
				<AnimatePresence>
					{isDropdownOpen && (
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: -10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: -10 }}
							transition={{ duration: 0.15, ease: "easeOut" }}
							className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden"
							style={{ 
								boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
							}}
						>
							<motion.button
								whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									handleMenuAction(() => onEdit(game));
								}}
								className="w-full text-left px-4 py-3 transition-colors flex items-center space-x-3 text-gray-700 hover:text-blue-600"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
								</svg>
								<span className="font-medium">Edit Game</span>
							</motion.button>
							
							<motion.button
								whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									handleMenuAction(() => onShare(game));
								}}
								className="w-full text-left px-4 py-3 transition-colors flex items-center space-x-3 text-gray-700 hover:text-blue-600"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
								</svg>
								<span className="font-medium">Share</span>
							</motion.button>
							
							<motion.button
								whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									handleMenuAction(() => onInfo(game));
								}}
								className="w-full text-left px-4 py-3 transition-colors flex items-center space-x-3 text-gray-700 hover:text-blue-600"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<span className="font-medium">Info</span>
							</motion.button>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Game Image */}
			<div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
				{/* Public status indicator */}
				{game.isPublic && (
					<div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 shadow-lg">
						<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
						</svg>
						<span>Public</span>
					</div>
				)}

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