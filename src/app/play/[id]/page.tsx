'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
	media?: {
		type: 'image' | 'audio' | 'video';
		url: string;
		alt?: string;
	};
	timer?: number;
	difficulty?: 'easy' | 'medium' | 'hard';
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
	
	// Timer state
	const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
	const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

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
					
					// Track play if it's a public game
					if (data.game.isPublic) {
						try {
							await fetch(getApiUrl(`/api/games/${gameId}/track`), {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify({ action: 'play' }),
							});
						} catch (error) {
							console.error('Error tracking play:', error);
						}
					}
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

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (timerInterval) {
				clearInterval(timerInterval);
			}
		};
	}, [timerInterval]);

	const selectQuestion = (categoryIndex: number, questionIndex: number) => {
		if (!game) return;
		
		const category = game.data.categories[categoryIndex];
		const question = category.questions[questionIndex];
		
		if (questionsAnswered.has(question.id) || !question.question || !question.answer) {
			return;
		}

		setCurrentQuestion({ category, question, categoryIndex, questionIndex });
		setGameState('question');
		
		// Start timer if question has custom timer
		if (question.timer) {
			setTimeRemaining(question.timer);
			const interval = setInterval(() => {
				setTimeRemaining(prev => {
					if (prev === null || prev <= 1) {
						clearInterval(interval);
						setTimerInterval(null);
						// Auto-skip when timer runs out
						setGameState('teamSelect');
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
			setTimerInterval(interval);
		} else {
			setTimeRemaining(null);
		}
	};

	const showAnswer = () => {
		// Clear timer when showing answer
		if (timerInterval) {
			clearInterval(timerInterval);
			setTimerInterval(null);
		}
		setTimeRemaining(null);
		setGameState('teamSelect');
	};

	const awardPoints = (teamId: string) => {
		if (!currentQuestion) return;
		
		// Clear timer
		if (timerInterval) {
			clearInterval(timerInterval);
			setTimerInterval(null);
		}
		setTimeRemaining(null);
		
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
		
		// Clear timer
		if (timerInterval) {
			clearInterval(timerInterval);
			setTimerInterval(null);
		}
		setTimeRemaining(null);
		
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
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	if (!game) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4 text-gray-900">Game not found</h1>
					<Link href="/dashboard">
						<button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
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
		<div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
			{/* Header with Game Title and Team Scores - Hidden for now */}
			<div className="bg-white shadow-sm border-b flex-shrink-0 hidden">
				<div className="px-6 py-3">
					<div className="flex justify-between items-center">
						<h1 className="text-xl font-bold text-gray-900">{game.title}</h1>
						<div className="flex gap-3">
							{teams.map((team) => (
								<div key={team.id} className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1">
									<div className="text-xs text-blue-600 font-medium">{team.name}</div>
									<div className="text-lg font-bold text-blue-800">${team.score}</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Game Content - Takes full screen space */}
			<div className="flex-1 flex flex-col">
				{gameState === 'board' && (
					<div className="flex-1 flex flex-col">
						{/* Game Board - Full height grid with no padding */}
						<div className="flex-1">
							<div className="h-full grid" style={{ 
								gridTemplateColumns: `repeat(${game.data.categories.length}, 1fr)`,
								gridTemplateRows: 'auto 1fr 1fr 1fr 1fr 1fr',
								gap: '0px'
							}}>
								{/* Category Headers */}
								{game.data.categories.map((category) => (
									<div key={category.id} className="bg-blue-600 text-white flex items-center justify-center font-bold text-lg md:text-xl lg:text-2xl border-r border-white last:border-r-0">
										{category.name || 'Category'}
									</div>
								))}

								{/* Questions - No gaps, flush buttons */}
								{[0, 1, 2, 3, 4].map((rowIndex) => (
									game.data.categories.map((category, categoryIndex) => {
										const question = category.questions[rowIndex];
										if (!question) return <div key={`${categoryIndex}-${rowIndex}`} className="border-r border-b border-white bg-gray-200 last:border-r-0" />;
										
										const isAnswered = questionsAnswered.has(question.id);
										return (
											<button
												key={question.id}
												onClick={() => selectQuestion(categoryIndex, rowIndex)}
												disabled={isAnswered || !question.question || !question.answer}
												className={`relative flex flex-col items-center justify-center text-2xl md:text-3xl lg:text-4xl font-bold border-r border-b border-white last:border-r-0 transition-all touch-manipulation ${
													isAnswered 
														? 'bg-gray-300 text-gray-500 cursor-not-allowed'
														: !question.question || !question.answer
														? 'bg-gray-200 text-gray-400 cursor-not-allowed'
														: 'bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer active:bg-blue-200'
												}`}
											>
												<span>${question.value}</span>
												
												{/* Media Indicators */}
												{question.media && (
													<div className="absolute top-2 right-2 flex gap-1">
														{question.media.type === 'image' && (
															<span className="text-xs bg-purple-500 text-white px-1 py-0.5 rounded">🖼️</span>
														)}
														{question.media.type === 'audio' && (
															<span className="text-xs bg-green-500 text-white px-1 py-0.5 rounded">🎵</span>
														)}
														{question.media.type === 'video' && (
															<span className="text-xs bg-red-500 text-white px-1 py-0.5 rounded">🎬</span>
														)}
													</div>
												)}
												
												{/* Difficulty & Timer Indicators */}
												{(question.difficulty || question.timer) && (
													<div className="absolute bottom-1 left-1 flex gap-1">
														{question.difficulty && (
															<span className={`text-xs px-1 py-0.5 rounded ${
																question.difficulty === 'easy' ? 'bg-green-500 text-white' :
																question.difficulty === 'medium' ? 'bg-yellow-500 text-white' :
																'bg-red-500 text-white'
															}`}>
																{question.difficulty === 'easy' && '🟢'}
																{question.difficulty === 'medium' && '🟡'}
																{question.difficulty === 'hard' && '🔴'}
															</span>
														)}
														{question.timer && (
															<span className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded">
																⏱️{question.timer}s
															</span>
														)}
													</div>
												)}
											</button>
										);
									})
								))}
							</div>
						</div>

						{/* Bottom Controls - Only show when game is complete */}
						{questionsAnswered.size === totalQuestions && (
							<div className="bg-white border-t px-6 py-4 text-center flex-shrink-0">
								<div className="text-xl font-bold text-green-600 mb-3">🎉 Game Complete! 🎉</div>
								<div className="space-x-4">
									<button
										onClick={resetGame}
										className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-lg"
									>
										Play Again
									</button>
									<Link href="/dashboard">
										<button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors text-lg">
											Exit to Dashboard
										</button>
									</Link>
								</div>
							</div>
						)}
					</div>
				)}

				{gameState === 'question' && currentQuestion && (
					<div className="flex-1 flex items-center justify-center p-4">
						<div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full">
							{/* Question Header */}
							<div className="bg-blue-600 text-white p-8 text-center">
								<div className="text-lg opacity-90 mb-3">
									{game.data.categories[currentQuestion.categoryIndex]?.name} - ${currentQuestion.question.value}
									{currentQuestion.question.difficulty && (
										<span className={`ml-2 px-2 py-1 rounded text-sm ${
											currentQuestion.question.difficulty === 'easy' ? 'bg-green-500' :
											currentQuestion.question.difficulty === 'medium' ? 'bg-yellow-500' :
											'bg-red-500'
										}`}>
											{currentQuestion.question.difficulty === 'easy' && '🟢 Easy'}
											{currentQuestion.question.difficulty === 'medium' && '🟡 Medium'}
											{currentQuestion.question.difficulty === 'hard' && '🔴 Hard'}
										</span>
									)}
								</div>
								<div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
									{currentQuestion.question.question}
								</div>
								
								{/* Media Display */}
								{currentQuestion.question.media && (
									<div className="mt-6 flex justify-center">
										{currentQuestion.question.media.type === 'image' && (
											<div className="max-w-md">
												<Image
													src={currentQuestion.question.media.url}
													alt={currentQuestion.question.media.alt || 'Question image'}
													width={400}
													height={300}
													className="rounded-lg shadow-lg max-h-64 object-cover"
													onError={(e) => {
														e.currentTarget.style.display = 'none';
													}}
												/>
											</div>
										)}
										
										{currentQuestion.question.media.type === 'audio' && (
											<div className="bg-white bg-opacity-20 rounded-lg p-4">
												<audio controls className="w-full">
													<source src={currentQuestion.question.media.url} />
													Your browser does not support the audio element.
												</audio>
											</div>
										)}
										
										{currentQuestion.question.media.type === 'video' && (
											<div className="max-w-lg">
												<video controls className="w-full rounded-lg shadow-lg max-h-64">
													<source src={currentQuestion.question.media.url} />
													Your browser does not support the video element.
												</video>
											</div>
										)}
									</div>
								)}
							</div>

							{/* Show Answer Button */}
							<div className="p-12 text-center">
								{/* Timer Display */}
								{timeRemaining !== null && (
									<div className="mb-6">
										<div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-lg font-bold ${
											timeRemaining <= 10 
												? 'bg-red-100 text-red-700 animate-pulse' 
												: timeRemaining <= 30 
												? 'bg-yellow-100 text-yellow-700' 
												: 'bg-blue-100 text-blue-700'
										}`}>
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											<span>Time Remaining: {timeRemaining}s</span>
										</div>
									</div>
								)}
								
								<button
									onClick={showAnswer}
									className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-lg text-2xl font-medium transition-colors touch-manipulation"
								>
									Show Answer
								</button>
							</div>
						</div>
					</div>
				)}

				{gameState === 'teamSelect' && currentQuestion && (
					<div className="flex-1 flex items-center justify-center p-4">
						<div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full">
							{/* Answer Display */}
							<div className="bg-green-50 border-b border-green-200 p-8 text-center">
								<div className="text-lg text-green-600 font-medium mb-3">Answer:</div>
								<div className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-800 mb-4">
									{currentQuestion.question.answer}
								</div>
								<div className="text-xl text-gray-700">
									Which team gets the ${currentQuestion.question.value}?
								</div>
							</div>

							{/* Team Selection */}
							<div className="p-8">
								<div className="flex flex-wrap gap-4 justify-center mb-8">
									{teams.map((team) => (
										<button
											key={team.id}
											onClick={() => awardPoints(team.id)}
											className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-colors text-lg touch-manipulation"
										>
											{team.name} (+${currentQuestion.question.value})
										</button>
									))}
								</div>
								
								<div className="text-center">
									<button
										onClick={skipQuestion}
										className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-medium transition-colors text-lg touch-manipulation"
									>
										No one got it correct
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
