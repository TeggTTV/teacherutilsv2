'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getApiUrl } from '@/lib/config';

interface Team {
	id: string;
	name: string;
	score: number;
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

export default function PlayGamePage() {
	const { user, loading } = useAuthGuard();
	const params = useParams();
	const gameId = params.id as string;
	
	const [game, setGame] = useState<SavedGame | null>(null);
	const [teams, setTeams] = useState<Team[]>([]);
	const [loadingGame, setLoadingGame] = useState(true);
	const [gameState, setGameState] = useState<'board' | 'question' | 'teamSelect'>('board');
	const [currentQuestion, setCurrentQuestion] = useState<{
		category: Category;
		question: Question;
		categoryIndex: number;
		questionIndex: number;
	} | null>(null);
	const [questionsAnswered, setQuestionsAnswered] = useState<Set<string>>(new Set());

	// Load game data and teams
	useEffect(() => {
		const loadGame = async () => {
			if (!user || !gameId) return;
			
			try {
				const response = await fetch(getApiUrl(`/api/games/${gameId}`), {
					credentials: 'include',
				});
				if (response.ok) {
					const data = await response.json();
					console.log('Loaded game data:', data.game);
					console.log('Categories:', data.game.data.categories);
					setGame(data.game);
				} else {
					console.error('Game not found');
				}
			} catch (error) {
				console.error('Error loading game:', error);
			} finally {
				setLoadingGame(false);
			}
		};

		// Load teams from sessionStorage
		const loadTeams = () => {
			const savedTeams = sessionStorage.getItem('gameTeams');
			if (savedTeams) {
				setTeams(JSON.parse(savedTeams));
			} else {
				// Default to 2 teams if none found
				setTeams([
					{ id: '1', name: 'Team 1', score: 0 },
					{ id: '2', name: 'Team 2', score: 0 }
				]);
			}
		};

		loadGame();
		loadTeams();
	}, [user, gameId]);

	const selectQuestion = (categoryIndex: number, questionIndex: number) => {
		if (!game) return;
		
		const category = game.data.categories[categoryIndex];
		const question = category.questions[questionIndex];
		
		if (questionsAnswered.has(question.id) || !question.question || !question.answer) {
			return;
		}

		setCurrentQuestion({ category, question, categoryIndex, questionIndex });
		setGameState('question');
	};

	const showAnswer = () => {
		setGameState('teamSelect');
	};

	const awardPoints = (teamId: string) => {
		if (!currentQuestion) return;
		
		setTeams(prev => prev.map(team => 
			team.id === teamId 
				? { ...team, score: team.score + currentQuestion.question.value }
				: team
		));
		
		// Mark question as answered
		setQuestionsAnswered(new Set([...questionsAnswered, currentQuestion.question.id]));
		setGameState('board');
		setCurrentQuestion(null);
	};

	const skipQuestion = () => {
		if (!currentQuestion) return;
		
		// Mark question as answered but don't award points
		setQuestionsAnswered(new Set([...questionsAnswered, currentQuestion.question.id]));
		setGameState('board');
		setCurrentQuestion(null);
	};

	const resetGame = () => {
		setTeams(prev => prev.map(team => ({ ...team, score: 0 })));
		setQuestionsAnswered(new Set());
		setGameState('board');
		setCurrentQuestion(null);
	};

	if (loading || loadingGame) {
		return (
			<div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white/50"></div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	if (!game) {
		return (
			<div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
				<div className="text-center text-white">
					<h1 className="text-2xl font-bold mb-4">Game not found</h1>
					<Link href="/dashboard">
						<button className="bg-white text-blue-900 px-6 py-2 rounded-lg hover:bg-gray-100">
							Back to Dashboard
						</button>
					</Link>
				</div>
			</div>
		);
	}

	const totalQuestions = game.data.categories.reduce((total, cat) => 
		total + cat.questions.filter(q => q.question && q.answer).length, 0
	);

	return (
		<div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-purple-900 overflow-auto">
			{/* Return to Dashboard - Faint Text */}
			<div className="absolute top-4 left-4 z-10">
				<Link 
					href="/dashboard"
					className="text-white/30 hover:text-white/60 text-sm transition-colors"
				>
					← Return to Dashboard
				</Link>
			</div>

			{/* Team Scores - Top Right */}
			<div className="absolute top-4 right-4 flex gap-4 z-10">
				{teams.map((team) => (
					<div key={team.id} className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
						<div className="text-sm opacity-75">{team.name}</div>
						<div className="text-xl font-bold">${team.score}</div>
					</div>
				))}
			</div>

			{/* Game Title */}
			<div className="text-center py-6">
				<h1 className="text-4xl font-bold text-white">{game.title}</h1>
			</div>

			{/* Game Content */}
			<div className="px-8 pb-8 min-h-screen">
				{gameState === 'board' && (
					<div className="flex flex-col h-full">
						{/* Game Board */}
						<div className="flex-1 backdrop-blur-sm rounded-lg p-6">
							<div className="grid gap-2 h-full" style={{ gridTemplateColumns: `repeat(${game.data.categories.length}, 1fr)` }}>
								{/* Category Headers */}
								{game.data.categories.map((category) => (
									<div key={category.id} className="bg-blue-600 text-white p-4 text-center font-bold text-lg rounded">
										{category.name || 'Category'}
									</div>
								))}

								{/* Questions */}
								{[0, 1, 2, 3, 4].map((rowIndex) => (
									game.data.categories.map((category, categoryIndex) => {
										const question = category.questions[rowIndex];
										if (!question) return <div key={`${categoryIndex}-${rowIndex}`} className="aspect-square" />;
										
										const isAnswered = questionsAnswered.has(question.id);
										return (
											<button
												key={question.id}
												onClick={() => selectQuestion(categoryIndex, rowIndex)}
												disabled={isAnswered || !question.question || !question.answer}
												className={`aspect-square text-3xl font-bold rounded transition-all ${
													isAnswered 
														? 'bg-gray-800 text-gray-600 cursor-not-allowed'
														: !question.question || !question.answer
														? 'bg-gray-700 text-gray-500 cursor-not-allowed'
														: 'bg-blue-800 hover:bg-blue-600 text-yellow-300 cursor-pointer hover:scale-105'
												}`}
											>
												${question.value}
											</button>
										);
									})
								))}
							</div>
						</div>

						{/* Reset Game Button */}
						<div className="text-center mt-6">
							<button
								onClick={resetGame}
								className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
							>
								Reset Game
							</button>
							{questionsAnswered.size === totalQuestions && (
								<div className="mt-4 text-center">
									<div className="text-3xl font-bold text-yellow-300 mb-2">🎉 Game Complete! 🎉</div>
									<div className="text-white text-lg">All questions have been answered!</div>
								</div>
							)}
						</div>
					</div>
				)}

				{gameState === 'question' && currentQuestion && (
					<div className="h-full flex flex-col items-center justify-center text-center">
						<div className="backdrop-blur-sm rounded-lg p-12 max-w-4xl mx-auto">
							<div className="mb-8">
								<div className="text-2xl font-bold text-blue-300 mb-4">
									{game.data.categories[currentQuestion.categoryIndex]?.name} - ${currentQuestion.question.value}
								</div>
								<div className="text-4xl font-bold text-white mb-8">
									{currentQuestion.question.question}
								</div>
							</div>
							<button
								onClick={showAnswer}
								className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-xl font-semibold transition-colors"
							>
								Show Answer
							</button>
						</div>
					</div>
				)}

				{gameState === 'teamSelect' && currentQuestion && (
					<div className="h-full flex flex-col items-center justify-center text-center">
						<div className="backdrop-blur-sm rounded-lg p-12 max-w-4xl mx-auto">
							<div className="mb-8">
								<div className="text-3xl font-bold text-green-300 mb-4">
									Answer: {currentQuestion.question.answer}
								</div>
								<div className="text-xl text-white mb-8">
									Which team gets the ${currentQuestion.question.value}?
								</div>
							</div>
							
							<div className="flex flex-wrap gap-4 justify-center mb-6">
								{teams.map((team) => (
									<button
										key={team.id}
										onClick={() => awardPoints(team.id)}
										className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors"
									>
										{team.name}
									</button>
								))}
							</div>
							
							<button
								onClick={skipQuestion}
								className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
							>
								No Points (Skip)
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
