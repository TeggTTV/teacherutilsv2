'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/config';

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
	timer?: number; // Custom timer for this question in seconds
	difficulty?: 'easy' | 'medium' | 'hard';
}

function QuestionSetContent() {
	const { user, loading } = useAuthGuard();
	const searchParams = useSearchParams();
	const router = useRouter();
	const editGameId = searchParams.get('edit');

	// Core game state
	const [gameTitle, setGameTitle] = useState('');
	const [categories, setCategories] = useState<Category[]>([]);
	const [customValues] = useState<number[]>([100, 200, 300, 400, 500]);
	const [savedGameId, setSavedGameId] = useState<string | null>(editGameId);
	const [editingQuestion, setEditingQuestion] = useState<{
		categoryIndex: number;
		questionIndex: number;
		question: Question;
	} | null>(null);
	const [loadingGame, setLoadingGame] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saveSuccess, setSaveSuccess] = useState(false);

	// Game validation state
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const [completionStats, setCompletionStats] = useState({
		categories: 0,
		questions: 0,
		totalPossible: 0
	});

	// Auto-save functionality (always enabled)
	const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
	const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

	// Load existing game if editing
	useEffect(() => {
		const loadGame = async () => {
			if (!editGameId || !user) return;
			
			setLoadingGame(true);
			try {
				const response = await fetch(getApiUrl(`/api/games/${editGameId}`), {
					credentials: 'include',
				});
				if (response.ok) {
					const data = await response.json();
					const game = data.game;
					setGameTitle(game.title);
					setCategories(game.data.categories);
					setSavedGameId(game.id);
				}
			} catch (error) {
				console.error('Error loading game:', error);
			} finally {
				setLoadingGame(false);
			}
		};

		loadGame();
	}, [editGameId, user]);

	// Initialize with empty categories if not editing
	useEffect(() => {
		if (categories.length === 0 && !editGameId) {
			const initialCategories: Category[] = Array.from({ length: 6 }, (_, i) => ({
				id: `category-${i}`,
				name: '',
				questions: customValues.map((value, j) => ({
					id: `question-${i}-${j}`,
					value,
					question: '',
					answer: '',
					isAnswered: false
				}))
			}));
			setCategories(initialCategories);
		}
	}, [customValues, editGameId, categories.length]);

	// Remove unused functions and clean up states
	const updateCategory = (categoryIndex: number, name: string) => {
		setCategories(prev => prev.map((cat, i) => 
			i === categoryIndex ? { ...cat, name } : cat
		));
	};

	const updateQuestion = (
		categoryIndex: number, 
		questionIndex: number, 
		field: 'question' | 'answer' | 'media' | 'timer' | 'difficulty', 
		value: string | number | { type: 'image' | 'audio' | 'video'; url: string; alt?: string } | undefined
	) => {
		console.log('Updating question:', { categoryIndex, questionIndex, field, value });
		setCategories(prev => {
			const newCategories = prev.map((cat, catIndex) => 
				catIndex === categoryIndex 
					? {
						...cat,
						questions: cat.questions.map((q, qIndex) => 
							qIndex === questionIndex ? { ...q, [field]: value } : q
						)
					}
					: cat
			);
			console.log('New categories state:', newCategories);
			return newCategories;
		});
		
		// Also update the editing question state to keep the modal in sync
		setEditingQuestion(prev => {
			if (prev && prev.categoryIndex === categoryIndex && prev.questionIndex === questionIndex) {
				return {
					...prev,
					question: { ...prev.question, [field]: value }
				};
			}
			return prev;
		});
	};

	const addCategory = () => {
		if (categories.length >= 6) return;
		
		const newCategory: Category = {
			id: `category-${categories.length}`,
			name: '',
			questions: customValues.map((value, j) => ({
				id: `question-${categories.length}-${j}`,
				value,
				question: '',
				answer: '',
				isAnswered: false
			}))
		};
		setCategories(prev => [...prev, newCategory]);
	};

	const addQuestion = (categoryIndex: number) => {
		const category = categories[categoryIndex];
		if (category.questions.length >= 5) return;

		const newValue = customValues[category.questions.length] || 500;
		const newQuestion: Question = {
			id: `question-${categoryIndex}-${category.questions.length}`,
			value: newValue,
			question: '',
			answer: '',
			isAnswered: false
		};

		setCategories(prev => prev.map((cat, i) => 
			i === categoryIndex 
				? { ...cat, questions: [...cat.questions, newQuestion] }
				: cat
		));
	};

	// Save game
	const validateGame = () => {
		const errors: string[] = [];
		
		// Title validation
		if (!gameTitle.trim()) {
			errors.push('Game title is required');
		} else if (gameTitle.trim().length < 3) {
			errors.push('Game title must be at least 3 characters long');
		}

		// Category validation
		if (categories.length === 0) {
			errors.push('At least one category is required');
		}

		const namedCategories = categories.filter(cat => cat.name.trim());
		if (namedCategories.length === 0) {
			errors.push('At least one category must have a name');
		}

		// Question validation
		const totalQuestions = categories.reduce((total, cat) => 
			total + cat.questions.filter(q => q.question.trim() && q.answer.trim()).length, 0
		);

		if (totalQuestions === 0) {
			errors.push('At least one complete question is required');
		}

		// Category balance validation (warning for uneven categories)
		const questionCounts = categories.map(cat => 
			cat.questions.filter(q => q.question.trim() && q.answer.trim()).length
		);
		const minQuestions = Math.min(...questionCounts.filter(count => count > 0));
		const maxQuestions = Math.max(...questionCounts);
		
		if (maxQuestions - minQuestions > 2) {
			errors.push(`Unbalanced categories: some have ${maxQuestions} questions, others have ${minQuestions}`);
		}

		return errors;
	};

	// Update stats whenever categories change
	useEffect(() => {
		const completedCategories = categories.filter(cat => cat.name.trim()).length;
		const completedQuestions = categories.reduce((total, cat) => 
			total + cat.questions.filter(q => q.question.trim() && q.answer.trim()).length, 0
		);
		const totalPossible = Math.min(categories.length * 5, 30); // Max 6 categories × 5 questions

		setCompletionStats({
			categories: completedCategories,
			questions: completedQuestions,
			totalPossible
		});
	}, [categories]);

	// Auto-save functionality
	useEffect(() => {
		if (!savedGameId || !gameTitle.trim()) return;

		const autoSaveTimer = setTimeout(async () => {
			if (categories.length === 0) return;

			setAutoSaveStatus('saving');
			try {
				const gameData = {
					title: gameTitle.trim(),
					description: '',
					type: 'JEOPARDY' as const,
					data: {
						gameTitle: gameTitle.trim(),
						categories,
						customValues
					},
					isPublic: false,
					tags: []
				};

				const response = await fetch(getApiUrl(`/api/games/${savedGameId}`), {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(gameData)
				});

				if (response.ok) {
					setAutoSaveStatus('saved');
					setLastAutoSave(new Date());
					setTimeout(() => setAutoSaveStatus('idle'), 2000);
				} else {
					setAutoSaveStatus('error');
					setTimeout(() => setAutoSaveStatus('idle'), 3000);
				}
			} catch {
				setAutoSaveStatus('error');
				setTimeout(() => setAutoSaveStatus('idle'), 3000);
			}
		}, 3000); // Auto-save every 3 seconds after changes

		return () => clearTimeout(autoSaveTimer);
	}, [categories, gameTitle, savedGameId, customValues]);

	const saveGame = async () => {
		setSaveError(null);
		setSaveSuccess(false);

		// Validate before saving
		const errors = validateGame();
		setValidationErrors(errors);

		if (errors.length > 0) {
			setSaveError(`Please fix the following issues: ${errors.join(', ')}`);
			return;
		}

		try {
			const gameData = {
				title: gameTitle.trim(),
				description: '',
				type: 'JEOPARDY' as const,
				data: {
					gameTitle: gameTitle.trim(),
					categories,
					customValues
				},
				isPublic: false,
				tags: []
			};

			const url = savedGameId ? `/api/games/${savedGameId}` : '/api/games';
			const method = savedGameId ? 'PUT' : 'POST';

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(gameData),
			});

			const result = await response.json();

			if (response.ok) {
				// Success handling
				const gameId = result.game?.id || result.id;
				setSavedGameId(gameId);
				setSaveSuccess(true);
				
				// Clear success message after 3 seconds
				setTimeout(() => setSaveSuccess(false), 3000);
				
				// Auto-redirect to dashboard after successful save
				setTimeout(() => {
					router.push('/dashboard');
				}, 1500);
			} else {
				// Handle API errors
				const errorMessage = result.error || 'Failed to save game';
				const errorCode = result.code;
				
				switch (errorCode) {
					case 'AUTH_REQUIRED':
					case 'INVALID_TOKEN':
						setSaveError('Please log in again to save your game.');
						break;
					case 'INVALID_TITLE':
						setSaveError('Please enter a valid game title.');
						break;
					case 'INVALID_CATEGORIES':
						setSaveError('Please add at least one category with questions.');
						break;
					case 'NO_QUESTIONS':
						setSaveError('Please add at least one question to your game.');
						break;
					default:
						setSaveError(errorMessage);
				}
			}
		} catch (error) {
			console.error('Error saving game:', error);
			setSaveError('Network error. Please check your connection and try again.');
		}
	};

	// Open question editor
	const openQuestionEditor = (categoryIndex: number, questionIndex: number) => {
		const category = categories[categoryIndex];
		const question = category.questions[questionIndex];
		setEditingQuestion({ categoryIndex, questionIndex, question });
	};

	if (loading || loadingGame) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-lg">Loading...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-4">
							<Link 
								href="/dashboard" 
								className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
								Back to Dashboard
							</Link>
							<div className="border-l pl-4 flex items-center gap-3">
								<input
									type="text"
									value={gameTitle}
									onChange={(e) => setGameTitle(e.target.value)}
									placeholder="Enter game title..."
									className="bg-transparent text-xl font-semibold border-none outline-none focus:ring-0 text-gray-900"
								/>
								{savedGameId && (
									<div className="flex items-center gap-2 px-2 py-1 bg-green-100 border border-green-300 rounded-full">
										<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
										<span className="text-xs font-medium text-green-700">Saved</span>
									</div>
								)}
								
								{/* Auto-save Status */}
								{autoSaveStatus === 'saving' && (
									<div className="flex items-center gap-2 px-2 py-1 bg-blue-100 border border-blue-300 rounded-full">
										<div className="w-2 h-2 bg-blue-500 rounded-full animate-spin"></div>
										<span className="text-xs font-medium text-blue-700">Auto-saving...</span>
									</div>
								)}
								{autoSaveStatus === 'saved' && savedGameId && (
									<div className="flex items-center gap-2 px-2 py-1 bg-green-100 border border-green-300 rounded-full">
										<svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
										<span className="text-xs font-medium text-green-700">
											Auto-saved {lastAutoSave && new Intl.DateTimeFormat('en-US', { 
												hour: '2-digit', 
												minute: '2-digit' 
											}).format(lastAutoSave)}
										</span>
									</div>
								)}
								{autoSaveStatus === 'error' && (
									<div className="flex items-center gap-2 px-2 py-1 bg-red-100 border border-red-300 rounded-full">
										<svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
										<span className="text-xs font-medium text-red-700">Auto-save failed</span>
									</div>
								)}
							</div>
						</div>
						<div className="flex items-center gap-3">
							{/* Enhanced Progress Indicator */}
							<div className="flex items-center gap-3">
								<div className="text-sm text-gray-600">
									Progress: {completionStats.questions} questions in {completionStats.categories} categories
								</div>
								<div className="w-24 bg-gray-200 rounded-full h-2">
									<div 
										className="bg-blue-600 h-2 rounded-full transition-all duration-300"
										style={{
											width: `${Math.min((completionStats.questions / Math.max(completionStats.totalPossible, 1)) * 100, 100)}%`
										}}
									></div>
								</div>
								<span className="text-xs text-gray-500">
									{Math.round((completionStats.questions / Math.max(completionStats.totalPossible, 1)) * 100)}%
								</span>
							</div>
							
							{/* Validation Status */}
							{validationErrors.length > 0 && (
								<div className="flex items-center gap-2 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded-full">
									<svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
									</svg>
									<span className="text-xs font-medium text-yellow-700">{validationErrors.length} issues</span>
								</div>
							)}
							
							{/* Game Ready Indicator */}
							{validationErrors.length === 0 && completionStats.questions >= 5 && (
								<div className="flex items-center gap-2 px-2 py-1 bg-green-100 border border-green-300 rounded-full">
									<svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span className="text-xs font-medium text-green-700">Ready to play!</span>
								</div>
							)}
							
							{/* Error Message */}
							{saveError && (
								<div className="px-3 py-2 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
									{saveError}
								</div>
							)}
							
							{/* Success Message */}
							{saveSuccess && (
								<div className="px-3 py-2 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm">
									✓ Game saved successfully! Redirecting...
								</div>
							)}
							
							<button
								onClick={saveGame}
								disabled={saveSuccess}
								className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{saveSuccess ? 'Saved!' : 'Save Game'}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Quick Actions */}
				<div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
					<div className="flex items-center justify-between mb-3">
						<h3 className="font-semibold text-gray-800">Quick Actions</h3>
						<button
							onClick={() => {
								// Auto-fill with standard Jeopardy categories
								const standardCategories = [
									'History', 'Science', 'Sports', 'Literature', 'Geography', 'Entertainment'
								];
								const newCategories = standardCategories.map((name, index) => ({
									id: `cat-${Date.now()}-${index}`,
									name,
									questions: customValues.map((value, qIndex) => ({
										id: `q-${Date.now()}-${index}-${qIndex}`,
										value,
										question: '',
										answer: '',
										isAnswered: false
									}))
								}));
								setCategories(newCategories);
							}}
							className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
						>
							📝 Standard Categories
						</button>
						
						{/* Template Dropdown */}
						<select
							onChange={(e) => {
								const template = e.target.value;
								if (template) {
									let templateCategories: { name: string; questions: { question: string; answer: string; value: number }[] }[] = [];
									
									switch (template) {
										case 'science':
											templateCategories = [
												{
													name: 'Biology',
													questions: [
														{ question: 'This is the powerhouse of the cell', answer: 'What is the mitochondria?', value: 100 },
														{ question: 'The study of heredity and genes', answer: 'What is genetics?', value: 200 },
														{ question: 'Process by which plants make food using sunlight', answer: 'What is photosynthesis?', value: 300 },
														{ question: 'The basic unit of life', answer: 'What is a cell?', value: 400 },
														{ question: 'The scientist who proposed the theory of evolution', answer: 'Who is Charles Darwin?', value: 500 }
													]
												},
												{
													name: 'Chemistry',
													questions: [
														{ question: 'Symbol for gold on the periodic table', answer: 'What is Au?', value: 100 },
														{ question: 'The number of protons in a hydrogen atom', answer: 'What is one?', value: 200 },
														{ question: 'This gas makes up about 78% of Earth\'s atmosphere', answer: 'What is nitrogen?', value: 300 },
														{ question: 'The pH of pure water', answer: 'What is 7?', value: 400 },
														{ question: 'The scientist who created the periodic table', answer: 'Who is Dmitri Mendeleev?', value: 500 }
													]
												},
												{
													name: 'Physics',
													questions: [
														{ question: 'The speed of light in a vacuum', answer: 'What is 299,792,458 meters per second?', value: 100 },
														{ question: 'Force equals mass times this', answer: 'What is acceleration?', value: 200 },
														{ question: 'The unit of electrical resistance', answer: 'What is an ohm?', value: 300 },
														{ question: 'Einstein\'s famous equation', answer: 'What is E=mc²?', value: 400 },
														{ question: 'The scientist who formulated the laws of motion', answer: 'Who is Isaac Newton?', value: 500 }
													]
												}
											];
											break;
										case 'history':
											templateCategories = [
												{
													name: 'Ancient History',
													questions: [
														{ question: 'This wonder of the ancient world was located in Alexandria', answer: 'What is the Lighthouse of Alexandria?', value: 100 },
														{ question: 'The first emperor of Rome', answer: 'Who is Augustus Caesar?', value: 200 },
														{ question: 'This ancient civilization built Machu Picchu', answer: 'What is the Inca Empire?', value: 300 },
														{ question: 'The Greek god of war', answer: 'Who is Ares?', value: 400 },
														{ question: 'This pharaoh built the Great Pyramid of Giza', answer: 'Who is Khufu?', value: 500 }
													]
												},
												{
													name: 'World Wars',
													questions: [
														{ question: 'The year World War I began', answer: 'What is 1914?', value: 100 },
														{ question: 'The ship whose sinking helped bring the US into WWI', answer: 'What is the Lusitania?', value: 200 },
														{ question: 'The beach code name for the D-Day invasion', answer: 'What is Operation Overlord?', value: 300 },
														{ question: 'The Japanese city where the first atomic bomb was dropped', answer: 'What is Hiroshima?', value: 400 },
														{ question: 'The treaty that ended World War I', answer: 'What is the Treaty of Versailles?', value: 500 }
													]
												},
												{
													name: 'American History',
													questions: [
														{ question: 'The year the Declaration of Independence was signed', answer: 'What is 1776?', value: 100 },
														{ question: 'The first President of the United States', answer: 'Who is George Washington?', value: 200 },
														{ question: 'The purchase that doubled the size of the US in 1803', answer: 'What is the Louisiana Purchase?', value: 300 },
														{ question: 'The President during the Civil War', answer: 'Who is Abraham Lincoln?', value: 400 },
														{ question: 'The amendment that gave women the right to vote', answer: 'What is the 19th Amendment?', value: 500 }
													]
												}
											];
											break;
										case 'literature':
											templateCategories = [
												{
													name: 'Classic Literature',
													questions: [
														{ question: 'Author of "Pride and Prejudice"', answer: 'Who is Jane Austen?', value: 100 },
														{ question: 'The first book in the Harry Potter series', answer: 'What is "The Philosopher\'s Stone" (or "Sorcerer\'s Stone")?', value: 200 },
														{ question: 'Shakespeare\'s longest play', answer: 'What is Hamlet?', value: 300 },
														{ question: 'The author of "1984"', answer: 'Who is George Orwell?', value: 400 },
														{ question: 'The epic poem about the Trojan War', answer: 'What is the Iliad?', value: 500 }
													]
												},
												{
													name: 'Poetry',
													questions: [
														{ question: 'Author of "The Road Not Taken"', answer: 'Who is Robert Frost?', value: 100 },
														{ question: 'The type of poem with 14 lines', answer: 'What is a sonnet?', value: 200 },
														{ question: 'Poet who wrote "The Raven"', answer: 'Who is Edgar Allan Poe?', value: 300 },
														{ question: 'The author of "Paradise Lost"', answer: 'Who is John Milton?', value: 400 },
														{ question: 'This poet wrote "Do not go gentle into that good night"', answer: 'Who is Dylan Thomas?', value: 500 }
													]
												},
												{
													name: 'Modern Literature',
													questions: [
														{ question: 'Author of "To Kill a Mockingbird"', answer: 'Who is Harper Lee?', value: 100 },
														{ question: 'The dystopian novel featuring Big Brother', answer: 'What is "1984"?', value: 200 },
														{ question: 'Author of "The Great Gatsby"', answer: 'Who is F. Scott Fitzgerald?', value: 300 },
														{ question: 'The novel about a man aging backwards', answer: 'What is "The Curious Case of Benjamin Button"?', value: 400 },
														{ question: 'Author of "One Hundred Years of Solitude"', answer: 'Who is Gabriel García Márquez?', value: 500 }
													]
												}
											];
											break;
									}
									
									if (templateCategories.length > 0) {
										const newCategories = templateCategories.map((cat, index) => ({
											id: `cat-${Date.now()}-${index}`,
											name: cat.name,
											questions: cat.questions.map((q, qIndex) => ({
												id: `q-${Date.now()}-${index}-${qIndex}`,
												value: q.value,
												question: q.question,
												answer: q.answer,
												isAnswered: false
											}))
										}));
										setCategories(newCategories);
										setGameTitle(`${template.charAt(0).toUpperCase() + template.slice(1)} Jeopardy`);
									}
								}
							}}
							className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
						>
							<option value="">🎯 Quick Templates</option>
							<option value="science">🔬 Science Pack</option>
							<option value="history">📚 History Pack</option>
							<option value="literature">📖 Literature Pack</option>
						</select>
					</div>
					
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
						<button
							onClick={() => {
								// Auto-add 5 questions to each category
								const updatedCategories = categories.map(cat => ({
									...cat,
									questions: customValues.map((value, index) => ({
										id: `q-${Date.now()}-${cat.id}-${index}`,
										value,
										question: '',
										answer: '',
										isAnswered: false
									}))
								}));
								setCategories(updatedCategories);
							}}
							className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
							disabled={categories.length === 0}
						>
							<span>🔢</span>
							Fill Questions
						</button>
						
						<button
							onClick={() => {
								// Clear all questions but keep structure
								const clearedCategories = categories.map(cat => ({
									...cat,
									questions: cat.questions.map(q => ({
										...q,
										question: '',
										answer: ''
									}))
								}));
								setCategories(clearedCategories);
							}}
							className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
							disabled={categories.length === 0}
						>
							<span>🗑️</span>
							Clear Questions
						</button>
						
						<button
							onClick={() => {
								// Duplicate last category
								if (categories.length > 0 && categories.length < 6) {
									const lastCategory = categories[categories.length - 1];
									const newCategory = {
										...lastCategory,
										id: `cat-${Date.now()}`,
										name: `${lastCategory.name} Copy`,
										questions: lastCategory.questions.map((q, index) => ({
											...q,
											id: `q-${Date.now()}-${index}`,
											question: '',
											answer: ''
										}))
									};
									setCategories([...categories, newCategory]);
								}
							}}
							className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
							disabled={categories.length === 0 || categories.length >= 6}
						>
							<span>📋</span>
							Duplicate Category
						</button>
						
						<button
							onClick={() => {
								// Export as template
								const template = {
									title: gameTitle || 'My Jeopardy Game',
									categories: categories.map(cat => ({
										name: cat.name,
										questions: cat.questions.map(q => ({
											value: q.value,
											question: q.question,
											answer: q.answer
										}))
									}))
								};
								const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
								const url = URL.createObjectURL(blob);
								const a = document.createElement('a');
								a.href = url;
								a.download = `${gameTitle || 'jeopardy-game'}.json`;
								a.click();
								URL.revokeObjectURL(url);
							}}
							className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
							disabled={categories.length === 0}
						>
							<span>💾</span>
							Export Template
						</button>
					</div>
				</div>

				{/* Instructions */}
				<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<h3 className="font-semibold mb-2 text-gray-800">Create Your Jeopardy Game</h3>
					<p className="text-sm text-gray-600">
						Add categories and questions to create your Jeopardy game. Click on any cell to edit questions and answers.
					</p>
				</div>

				{/* Game Board */}
				<div className="bg-white rounded-lg shadow-lg overflow-hidden">
					<div className="grid gap-1 p-4" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
						{/* Category Headers */}
						{categories.map((category, categoryIndex) => (
							<div key={category.id} className="space-y-1">
								<div>
									<input
										type="text"
										value={category.name}
										onChange={(e) => updateCategory(categoryIndex, e.target.value)}
										className="w-full p-4 text-center font-bold text-white bg-blue-600 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder={`Category ${categoryIndex + 1}`}
									/>
								</div>

								{/* Questions */}
								{category.questions.map((question, questionIndex) => (
									<button
										key={question.id}
										onClick={() => openQuestionEditor(categoryIndex, questionIndex)}
										className={`w-full p-6 text-center font-bold text-xl border border-gray-300 rounded transition-colors relative group ${
											question.question && question.answer 
												? 'bg-blue-100 text-blue-800 border-blue-300' 
												: 'bg-gray-50 text-gray-600 hover:bg-gray-100'
										}`}
									>
										<div className="flex flex-col items-center gap-1">
											<span>${question.value}</span>
											
											{/* Feature Indicators */}
											<div className="flex gap-1 text-xs opacity-75">
												{question.media && (
													<span className="bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded text-xs">
														{question.media.type === 'image' && '🖼️'}
														{question.media.type === 'audio' && '🎵'}
														{question.media.type === 'video' && '🎬'}
													</span>
												)}
												{question.timer && (
													<span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-xs">
														⏱️{question.timer}s
													</span>
												)}
												{question.difficulty && (
													<span className={`px-1.5 py-0.5 rounded text-xs ${
														question.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
														question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
														'bg-red-100 text-red-600'
													}`}>
														{question.difficulty === 'easy' && '🟢'}
														{question.difficulty === 'medium' && '🟡'}
														{question.difficulty === 'hard' && '🔴'}
													</span>
												)}
											</div>
										</div>
										
										{/* Hover Preview */}
										{(question.question || question.answer) && (
											<div className="absolute inset-0 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center text-sm">
												{question.question && (
													<div className="mb-1">
														<strong>Q:</strong> {question.question.slice(0, 50)}{question.question.length > 50 ? '...' : ''}
													</div>
												)}
												{question.answer && (
													<div>
														<strong>A:</strong> {question.answer.slice(0, 50)}{question.answer.length > 50 ? '...' : ''}
													</div>
												)}
											</div>
										)}
									</button>
								))}

								{/* Add Question Button */}
								{category.questions.length < 5 && (
									<button
										onClick={() => addQuestion(categoryIndex)}
										className="w-full p-4 border-2 border-dashed rounded text-gray-600 hover:text-blue-600 transition-colors"
										style={{
											borderColor: '#d1d5db'
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.borderColor = '#3b82f6';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.borderColor = '#d1d5db';
										}}
									>
										+ Add Question
									</button>
								)}
							</div>
						))}

						{/* Add Category Button */}
						{categories.length < 6 && (
							<div className="flex items-center justify-center min-h-[200px]">
								<button
									onClick={addCategory}
									className="w-full h-full border-2 border-dashed rounded text-gray-600 hover:text-blue-600 transition-colors flex flex-col items-center justify-center gap-2"
									style={{
										borderColor: '#d1d5db'
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.borderColor = '#3b82f6';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.borderColor = '#d1d5db';
									}}
								>
									<span className="text-2xl">+</span>
									<span>Add Category</span>
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Question Editor Modal */}
			{editingQuestion && (
				<div className="fixed inset-0 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-auto">
						<div className="p-6">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-bold">
									Edit Question: {categories[editingQuestion.categoryIndex]?.name || `Category ${editingQuestion.categoryIndex + 1}`} - ${editingQuestion.question.value}
								</h2>
								<button
									onClick={() => setEditingQuestion(null)}
									className="text-gray-500 hover:text-gray-700 text-2xl"
								>
									×
								</button>
							</div>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Question
									</label>
									<textarea
										value={editingQuestion.question.question}
										onChange={(e) => {
											updateQuestion(editingQuestion.categoryIndex, editingQuestion.questionIndex, 'question', e.target.value);
										}}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										rows={3}
										placeholder="Enter the question..."
									/>
								</div>

								{/* Media Support */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Media (Optional)
									</label>
									<div className="space-y-3">
										<div className="flex gap-2">
											<select
												value={editingQuestion.question.media?.type || ''}
												onChange={(e) => {
													const type = e.target.value as 'image' | 'audio' | 'video' | '';
													if (type) {
														updateQuestion(editingQuestion.categoryIndex, editingQuestion.questionIndex, 'media', {
															type,
															url: editingQuestion.question.media?.url || '',
															alt: editingQuestion.question.media?.alt || ''
														});
													} else {
														updateQuestion(editingQuestion.categoryIndex, editingQuestion.questionIndex, 'media', undefined);
													}
												}}
												className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											>
												<option value="">No Media</option>
												<option value="image">🖼️ Image</option>
												<option value="audio">🎵 Audio</option>
												<option value="video">🎬 Video</option>
											</select>
											
											{editingQuestion.question.media && (
												<input
													type="url"
													value={editingQuestion.question.media.url}
													onChange={(e) => {
														updateQuestion(editingQuestion.categoryIndex, editingQuestion.questionIndex, 'media', {
															...editingQuestion.question.media!,
															url: e.target.value
														});
													}}
													placeholder="Enter media URL..."
													className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												/>
											)}
										</div>
										
										{editingQuestion.question.media?.type === 'image' && editingQuestion.question.media.url && (
											<div className="border rounded-lg p-2">
												<Image 
													src={editingQuestion.question.media.url} 
													alt={editingQuestion.question.media.alt || 'Question media'}
													width={300}
													height={128}
													className="max-w-full h-32 object-cover rounded"
													onError={(e) => {
														e.currentTarget.style.display = 'none';
													}}
												/>
											</div>
										)}
										
										{editingQuestion.question.media?.type === 'audio' && editingQuestion.question.media.url && (
											<div className="border rounded-lg p-2">
												<audio controls className="w-full">
													<source src={editingQuestion.question.media.url} />
													Your browser does not support the audio element.
												</audio>
											</div>
										)}
										
										{editingQuestion.question.media?.type === 'video' && editingQuestion.question.media.url && (
											<div className="border rounded-lg p-2">
												<video controls className="w-full max-h-40">
													<source src={editingQuestion.question.media.url} />
													Your browser does not support the video element.
												</video>
											</div>
										)}
									</div>
								</div>

								{/* Advanced Options */}
								<div className="border-t pt-4">
									<h4 className="text-sm font-medium text-gray-700 mb-3">Advanced Options</h4>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm text-gray-600 mb-1">
												Custom Timer (seconds)
											</label>
											<input
												type="number"
												value={editingQuestion.question.timer || ''}
												onChange={(e) => {
													const timer = e.target.value ? parseInt(e.target.value) : undefined;
													updateQuestion(editingQuestion.categoryIndex, editingQuestion.questionIndex, 'timer', timer);
												}}
												min="5"
												max="120"
												placeholder="30"
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											/>
										</div>
										
										<div>
											<label className="block text-sm text-gray-600 mb-1">
												Difficulty
											</label>
											<select
												value={editingQuestion.question.difficulty || ''}
												onChange={(e) => {
													const difficulty = e.target.value as 'easy' | 'medium' | 'hard' | '';
													updateQuestion(editingQuestion.categoryIndex, editingQuestion.questionIndex, 'difficulty', difficulty || undefined);
												}}
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											>
												<option value="">Auto</option>
												<option value="easy">🟢 Easy</option>
												<option value="medium">🟡 Medium</option>
												<option value="hard">🔴 Hard</option>
											</select>
										</div>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Answer
									</label>
									<textarea
										value={editingQuestion.question.answer}
										onChange={(e) => {
											updateQuestion(editingQuestion.categoryIndex, editingQuestion.questionIndex, 'answer', e.target.value);
										}}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										rows={3}
										placeholder="Enter the answer..."
									/>
								</div>
							</div>

							<div className="flex justify-end gap-3 mt-6">
								<button
									onClick={() => setEditingQuestion(null)}
									className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
								>
									Cancel
								</button>
								<button
									onClick={() => {
										console.log('Save & Close clicked');
										console.log('Current editing question:', editingQuestion);
										console.log('Current categories state:', categories);
										
										// The changes are already saved in real-time via onChange handlers
										// Just close the modal and provide user feedback
										setEditingQuestion(null);
										
										// Optional: Show a brief success message
										if (editingQuestion) {
											const hasContent = editingQuestion.question.question.trim() && editingQuestion.question.answer.trim();
											console.log('Has content:', hasContent);
											if (hasContent) {
												console.log('Question saved successfully');
											}
										}
									}}
									className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
								>
									Save & Close
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default function QuestionSetPage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-lg">Loading...</div>
			</div>
		}>
			<QuestionSetContent />
		</Suspense>
	);
}
