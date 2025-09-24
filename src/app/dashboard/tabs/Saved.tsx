'use client';

import Link from 'next/link';
import SavedGameCard from '../SavedGameCard';
import { useEffect, useState } from 'react';
import { PublicGame, SavedGame, Template } from '@/components/dashboard/types';
import { User } from '@/types/user';

export default function Saved({
	user,
	handleUseTemplate,
	handleDeleteGame,
	setActiveTab,
}: {
	user: User | null;
	handleUseTemplate: (t: Template) => void;
	handleDeleteGame: (game: SavedGame) => void;
	setActiveTab: (tab: string) => void;
}) {
	const [savedGames, setSavedGames] = useState<PublicGame[]>([]);

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

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold text-gray-900">
					Saved Games
				</h2>
			</div>

			{savedGames && savedGames.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{savedGames.map((game) => (
						<SavedGameCard
							key={game.id}
							game={game}
							handleUseTemplate={handleUseTemplate}
							handleRemoveGame={handleDeleteGame}
						/>
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
							d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
						/>
					</svg>
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						No Saved Games
					</h3>
					<p className="text-gray-600 mb-4">
						You haven&apos;t saved any games yet.
					</p>
					<Link
						href="#"
						onClick={() => setActiveTab('discover')}
						className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
					>
						Discover Games to Save
					</Link>
				</div>
			)}
		</div>
	);
}
