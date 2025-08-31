'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { getApiUrl } from '@/lib/config';

interface Team {
	id: string;
	name: string;
	score: number;
}

export default function GameSetupPage({ params }: { params: { id: string } }) {
	const { user, loading } = useAuthGuard();
	const router = useRouter();
	const [gameTitle, setGameTitle] = useState('');
	const [teamCount, setTeamCount] = useState(2);
	const [teams, setTeams] = useState<Team[]>([
		{ id: '1', name: 'Team 1', score: 0 },
		{ id: '2', name: 'Team 2', score: 0 }
	]);
	const [loadingGame, setLoadingGame] = useState(true);

	// Load game data
	useEffect(() => {
		const loadGame = async () => {
			try {
				const response = await fetch(getApiUrl(`/api/games/${params.id}`), {
					credentials: 'include',
				});
				if (response.ok) {
					const data = await response.json();
					setGameTitle(data.game.title);
				} else {
					router.push('/dashboard');
				}
			} catch (error) {
				console.error('Error loading game:', error);
				router.push('/dashboard');
			} finally {
				setLoadingGame(false);
			}
		};

		if (user) {
			loadGame();
		}
	}, [params.id, user, router]);

	// Update teams when team count changes
	useEffect(() => {
		const newTeams: Team[] = [];
		for (let i = 1; i <= teamCount; i++) {
			const existingTeam = teams.find(t => t.id === i.toString());
			newTeams.push({
				id: i.toString(),
				name: existingTeam?.name || `Team ${i}`,
				score: 0
			});
		}
		setTeams(newTeams);
	}, [teamCount]); // teams is intentionally excluded to prevent infinite loop

	const updateTeamName = (teamId: string, name: string) => {
		setTeams(prev => prev.map(team => 
			team.id === teamId ? { ...team, name } : team
		));
	};

	const startGame = () => {
		// Store team data in sessionStorage to pass to the game
		sessionStorage.setItem('gameTeams', JSON.stringify(teams));
		router.push(`/play/${params.id}`);
	};

	if (loading || loadingGame) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-4">
							<button 
								onClick={() => router.push('/dashboard')}
								className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
								Back to Dashboard
							</button>
							<div className="border-l pl-4">
								<h1 className="text-xl font-semibold text-gray-900">{gameTitle}</h1>
								<p className="text-sm text-gray-600">Game Setup</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="bg-white rounded-lg shadow-lg p-8">
					<h2 className="text-2xl font-bold mb-6 text-center">Setup Your Game</h2>
					
					{/* Team Count Selection */}
					<div className="mb-8">
						<label className="block text-lg font-medium text-gray-700 mb-4">
							Number of Teams
						</label>
						<div className="flex gap-4">
							{[1, 2, 3, 4, 5, 6].map(count => (
								<button
									key={count}
									onClick={() => setTeamCount(count)}
									className={`px-6 py-3 rounded-lg font-medium transition-colors ${
										teamCount === count
											? 'bg-blue-600 text-white'
											: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
									}`}
								>
									{count}
								</button>
							))}
						</div>
					</div>

					{/* Team Names */}
					<div className="mb-8">
						<label className="block text-lg font-medium text-gray-700 mb-4">
							Team Names
						</label>
						<div className="grid gap-4 md:grid-cols-2">
							{teams.map((team, index) => (
								<div key={team.id}>
									<label className="block text-sm font-medium text-gray-600 mb-2">
										Team {index + 1}
									</label>
									<input
										type="text"
										value={team.name}
										onChange={(e) => updateTeamName(team.id, e.target.value)}
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder={`Enter team ${index + 1} name`}
									/>
								</div>
							))}
						</div>
					</div>

					{/* Start Game Button */}
					<div className="text-center">
						<button
							onClick={startGame}
							className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
						>
							Start Game
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
