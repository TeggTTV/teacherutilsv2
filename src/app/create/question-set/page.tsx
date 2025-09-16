'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Modal from '@/components/Modal';
import { useSearchParams, useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/config';
import { motion } from 'framer-motion';

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

interface BoardColors {
	textColor: string;
	categoryTextColor: string;
	questionTextColor: string;
	tileBackground: string;
	tileBorder: string;
	tileHover: string;
	defaultTileBackground: string;
	categoryBackground: string;
	individualTileColors: { [key: string]: string };
	defaultTileImage: string;
	categoryBackgroundImage: string;
	individualTileImages: { [key: string]: string };
	tileOpacity: number;
}

interface BoardTypography {
	fontFamily: string;
	categoryFontSize: string;
	questionFontSize: string;
	fontWeight: string;
	categoryFontWeight: string;
}

interface BoardCustomizations {
	colors: BoardColors;
	typography: BoardTypography;
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

	// Board customization state
	const [displayImage, setDisplayImage] = useState<string>('');
	const [boardBackground, setBoardBackground] = useState<string>('');
	const [activeCustomizationTab, setActiveCustomizationTab] = useState<string>('images');
	const [sidePreviewMode, setSidePreviewMode] = useState<boolean>(false);
	const [showResetModal, setShowResetModal] = useState<boolean>(false);
	const [boardCustomizations, setBoardCustomizations] = useState<BoardCustomizations>({
		colors: {
			textColor: '#ffffff',
			categoryTextColor: '#ffffff', 
			questionTextColor: '#000000',
			tileBackground: '#1e40af',
			tileBorder: '#3b82f6',
			tileHover: '#1d4ed8',
			defaultTileBackground: '#e5e7eb',
			categoryBackground: '#3b82f6',
			individualTileColors: {},
			defaultTileImage: '',
			categoryBackgroundImage: '',
			individualTileImages: {},
			tileOpacity: 100
		},
		typography: {
			fontFamily: 'Inter, sans-serif',
			categoryFontSize: '16',
			questionFontSize: '14',
			fontWeight: '600',
			categoryFontWeight: '700'
		}
	});
	const [imageModal, setImageModal] = useState<{
		isOpen: boolean;
		type: 'display' | 'board' | 'defaultTile' | 'categoryImage' | null;
		currentValue: string;
	}>({
		isOpen: false,
		type: null,
		currentValue: ''
	});

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
					
					// Load image settings
					setDisplayImage(game.data.displayImage || '');
					setBoardBackground(game.data.boardBackground || '');
					
					// Load board customizations
					if (game.data.boardCustomizations) {
						setBoardCustomizations(game.data.boardCustomizations);
					}
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
						customValues,
						displayImage: displayImage || undefined,
						boardBackground: boardBackground || undefined,
						boardCustomizations
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
	}, [categories, gameTitle, savedGameId, customValues, displayImage, boardBackground, boardCustomizations]);

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
						customValues,
						displayImage: displayImage || undefined,
						boardBackground: boardBackground || undefined,
						boardCustomizations
					},
					isPublic: false,
					tags: []
				};			const url = savedGameId ? `/api/games/${savedGameId}` : '/api/games';
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

	// Reset game to initial state
	const resetGame = () => {
		// Reset all state to initial values
		setGameTitle('');
		setSavedGameId(null);
		setDisplayImage('');
		setBoardBackground('');
		setSaveError(null);
		setSaveSuccess(false);
		setShowResetModal(false);
		
		// Reset categories to empty initial state
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
		
		// Reset board customizations to defaults
		setBoardCustomizations({
			colors: {
				textColor: '#ffffff',
				categoryTextColor: '#ffffff', 
				questionTextColor: '#000000',
				tileBackground: '#1e40af',
				tileBorder: '#3b82f6',
				tileHover: '#1d4ed8',
				defaultTileBackground: '#1e40af',
				categoryBackground: '#1e40af',
				individualTileColors: {},
				defaultTileImage: '',
				categoryBackgroundImage: '',
				individualTileImages: {},
				tileOpacity: 1
			},
			typography: {
				fontFamily: 'Arial, sans-serif',
				categoryFontSize: '20px',
				questionFontSize: '16px',
				fontWeight: 'normal',
				categoryFontWeight: 'bold'
			}
		});
		
		// Clear editing state
		setEditingQuestion(null);
		
		// Reset validation
		setValidationErrors([]);
		setCompletionStats({
			categories: 0,
			questions: 0,
			totalPossible: 0
		});
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
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Header */}
			<motion.div 
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="bg-white shadow-lg border-b border-gray-100"
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="space-y-6">
						{/* Top row - Title and navigation */}
						<div className="flex items-center gap-4 min-w-0">
							<Link 
								href="/dashboard" 
								className="flex items-center gap-2 text-gray-600 hover:text-gray-800 flex-shrink-0"
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
								<span className="hidden sm:inline">Back to Dashboard</span>
							</Link>
							<div className="border-l pl-4 flex items-center gap-3 min-w-0 flex-1">
								<input
									type="text"
									value={gameTitle}
									onChange={(e) => setGameTitle(e.target.value)}
									placeholder="Enter game title..."
									className="bg-transparent text-lg sm:text-xl font-semibold border-none outline-none focus:ring-0 text-gray-900 min-w-0 flex-1"
								/>
								{savedGameId && (
									<div className="flex items-center gap-2 px-2 py-1 bg-green-100 border border-green-300 rounded-full flex-shrink-0">
										<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
										<span className="text-xs font-medium text-green-700 hidden sm:inline">Saved</span>
									</div>
								)}
							</div>
						</div>
						
						{/* Status and actions row */}
						<div className="flex items-center justify-between gap-3 flex-wrap">
							{/* Status indicators */}
							<div className="flex items-center gap-2 flex-wrap">
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
										<span className="text-xs font-medium text-green-700 hidden sm:inline">
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
										<span className="text-xs font-medium text-red-700 hidden sm:inline">Auto-save failed</span>
									</div>
								)}
								
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
										<span className="text-xs font-medium text-green-700 hidden sm:inline">Ready to play!</span>
									</div>
								)}
							</div>
							
							{/* Action buttons */}
							<div className="flex items-center gap-3">
								{/* Reset button */}
								<button
									onClick={() => setShowResetModal(true)}
									className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex-shrink-0"
								>
									Reset Game
								</button>
								
								{/* Save button */}
								<button
									onClick={saveGame}
									disabled={saveSuccess}
									className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
								>
									{saveSuccess ? 'Saved!' : 'Save Game'}
								</button>
							</div>
						</div>
						
						{/* Error and Success Messages - Full width on their own row */}
						{(saveError || saveSuccess) && (
							<div className="w-full">
								{saveError && (
									<div className="px-3 py-2 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
										{saveError}
									</div>
								)}
								{saveSuccess && (
									<div className="px-3 py-2 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm">
										✓ Game saved successfully! Redirecting...
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</motion.div>

			{/* Main Content */}
			<motion.div 
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}
				className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
			>
				{/* Board Customization */}
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="mb-8 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
				>
					<div className="p-8 pb-0">
						<div className="flex justify-between items-center mb-6">
							<motion.h3 
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.6, delay: 0.4 }}
								className="text-2xl font-bold text-gray-900 flex items-center gap-3"
							>
								<span>🎨</span>
								Board Customization
							</motion.h3>
							
							{/* Side Preview Toggle */}
							<button
								onClick={() => setSidePreviewMode(!sidePreviewMode)}
								className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
									sidePreviewMode 
										? 'bg-blue-600 text-white' 
										: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
								}`}
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-8 0V7m8 0V7" />
								</svg>
								{sidePreviewMode ? 'Hide Preview' : 'Side Preview'}
							</button>
						</div>
						
						{/* Category Tabs */}
						<div className="flex gap-1 mb-6 border-b">
							{[
								{ id: 'images', label: '🖼️ Images', icon: '🖼️' },
								{ id: 'colors', label: '🎨 Colors', icon: '🎨' },
								{ id: 'typography', label: '📝 Typography', icon: '📝' },
								{ id: 'templates', label: '📄 Templates', icon: '📄' }
							].map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveCustomizationTab(tab.id)}
									className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors border-b-2 ${
										activeCustomizationTab === tab.id
											? 'bg-blue-100 text-blue-700 border-blue-500'
											: 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-transparent'
									}`}
								>
									<span className="mr-2">{tab.icon}</span>
									{tab.label.split(' ')[1]}
								</button>
							))}
						</div>
					</div>
					
					{/* Tab Content - Split Layout Support */}
					<div className={`${sidePreviewMode ? 'flex gap-6' : ''}`}>
						{/* Left Panel - Tab Content */}
						<div className={`px-6 pb-6 ${sidePreviewMode ? 'w-1/2' : 'w-full'}`}>
						{/* Images Tab - existing content will be wrapped here */}
						{activeCustomizationTab === 'images' && (
					<div className={`grid grid-cols-1 ${sidePreviewMode ? '' : 'md:grid-cols-2'} gap-6`}>
						{/* Display Image Section */}
						<div className="space-y-3">
							<h4 className="font-medium text-gray-700 flex items-center gap-2">
								<span>🖼️</span>
								Set Display Image
							</h4>
							<p className="text-sm text-gray-600">
								Customize the background image shown on your game card
							</p>
							
							<div className="relative">
								{/* Preview */}
								<div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center mb-3 overflow-hidden">
									{displayImage ? (
										<Image 
											src={displayImage} 
											alt="Display image preview"
											width={200}
											height={128}
											className="w-full h-full object-cover"
											onError={(e) => {
												e.currentTarget.style.display = 'none';
												e.currentTarget.nextElementSibling?.classList.remove('hidden');
											}}
										/>
									) : (
										<div className="text-center">
											<div className="text-3xl mb-2">🎯</div>
											<span className="text-gray-500 text-sm">Default Image</span>
										</div>
									)}
									{displayImage && (
										<div className="hidden text-center">
											<div className="text-3xl mb-2">❌</div>
											<span className="text-gray-500 text-sm">Invalid Image</span>
										</div>
									)}
								</div>
								
								<button
									onClick={() => setImageModal({
										isOpen: true,
										type: 'display',
										currentValue: displayImage
									})}
									className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
								>
									<span>📷</span>
									{displayImage ? 'Change Display Image' : 'Add Display Image'}
								</button>
								
								{displayImage && (
									<button
										onClick={() => setDisplayImage('')}
										className="w-full mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
									>
										Remove Image
									</button>
								)}
							</div>
						</div>
						
						{/* Board Background Section */}
						<div className="space-y-3">
							<h4 className="font-medium text-gray-700 flex items-center gap-2">
								<span>🌄</span>
								Game Board Background
							</h4>
							<p className="text-sm text-gray-600">
								Set a background image for the game board during gameplay
							</p>
							
							<div className="relative">
								{/* Preview */}
								<div className="w-full h-32 bg-gray-900 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center mb-3 overflow-hidden relative">
									{boardBackground ? (
										<>
											<Image 
												src={boardBackground} 
												alt="Board background preview"
												width={200}
												height={128}
												className="w-full h-full object-cover opacity-30"
												onError={(e) => {
													e.currentTarget.style.display = 'none';
													e.currentTarget.parentElement?.querySelector('.error-fallback')?.classList.remove('hidden');
												}}
											/>
											<div className="absolute inset-0 flex items-center justify-center">
												<div className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Jeopardy Board</div>
											</div>
										</>
									) : (
										<div className="text-center">
											<div className="bg-blue-600 text-white px-3 py-1 rounded text-sm mb-2">Jeopardy Board</div>
											<span className="text-gray-400 text-xs">Default Background</span>
										</div>
									)}
									{boardBackground && (
										<div className="error-fallback absolute inset-0 hidden items-center justify-center">
											<div className="text-center">
												<div className="text-2xl mb-1">❌</div>
												<span className="text-gray-400 text-xs">Invalid Image</span>
											</div>
										</div>
									)}
								</div>
								
								<button
									onClick={() => setImageModal({
										isOpen: true,
										type: 'board',
										currentValue: boardBackground
									})}
									className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
								>
									<span>🎮</span>
									{boardBackground ? 'Change Board Background' : 'Add Board Background'}
								</button>
								
								{boardBackground && (
									<button
										onClick={() => setBoardBackground('')}
										className="w-full mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
									>
										Remove Background
									</button>
								)}
							</div>
						</div>
					</div>
						)}
						
						{/* Colors Tab */}
						{activeCustomizationTab === 'colors' && (
							<div className="space-y-6">
								<div className={`grid grid-cols-1 ${sidePreviewMode ? '' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
									{/* Text Colors */}
									<div className="space-y-3">
										<h4 className="font-medium text-gray-700">Text Colors</h4>
										
										<div className="space-y-2">
											<label className="block text-sm text-gray-600">Category Text Color</label>
											<div className="flex items-center gap-2">
												<input
													type="color"
													value={boardCustomizations.colors.categoryTextColor}
													onChange={(e) => setBoardCustomizations(prev => ({
														...prev,
														colors: { ...prev.colors, categoryTextColor: e.target.value }
													}))}
													className="w-12 h-8 rounded border border-gray-300"
												/>
												<span className="text-sm text-gray-600">{boardCustomizations.colors.categoryTextColor}</span>
											</div>
										</div>
										
										<div className="space-y-2">
											<label className="block text-sm text-gray-600">Question Text Color</label>
											<div className="flex items-center gap-2">
												<input
													type="color"
													value={boardCustomizations.colors.questionTextColor}
													onChange={(e) => setBoardCustomizations(prev => ({
														...prev,
														colors: { ...prev.colors, questionTextColor: e.target.value }
													}))}
													className="w-12 h-8 rounded border border-gray-300"
												/>
												<span className="text-sm text-gray-600">{boardCustomizations.colors.questionTextColor}</span>
											</div>
										</div>
									</div>
									
									{/* Tile Colors */}
									<div className="space-y-3">
										<h4 className="font-medium text-gray-700">Tile Colors</h4>
										
										<div className="space-y-2">
											<label className="block text-sm text-gray-600">Tile Background</label>
											<div className="flex items-center gap-2">
												<input
													type="color"
													value={boardCustomizations.colors.tileBackground}
													onChange={(e) => setBoardCustomizations(prev => ({
														...prev,
														colors: { ...prev.colors, tileBackground: e.target.value }
													}))}
													className="w-12 h-8 rounded border border-gray-300"
												/>
												<span className="text-sm text-gray-600">{boardCustomizations.colors.tileBackground}</span>
											</div>
										</div>
										
										<div className="space-y-2">
											<label className="block text-sm text-gray-600">Tile Border</label>
											<div className="flex items-center gap-2">
												<input
													type="color"
													value={boardCustomizations.colors.tileBorder}
													onChange={(e) => setBoardCustomizations(prev => ({
														...prev,
														colors: { ...prev.colors, tileBorder: e.target.value }
													}))}
													className="w-12 h-8 rounded border border-gray-300"
												/>
												<span className="text-sm text-gray-600">{boardCustomizations.colors.tileBorder}</span>
											</div>
										</div>
									</div>
									
									{/* Hover Effects */}
									<div className="space-y-3">
										<h4 className="font-medium text-gray-700">Hover Effects</h4>
										
										<div className="space-y-2">
											<label className="block text-sm text-gray-600">Tile Hover Color</label>
											<div className="flex items-center gap-2">
												<input
													type="color"
													value={boardCustomizations.colors.tileHover}
													onChange={(e) => setBoardCustomizations(prev => ({
														...prev,
														colors: { ...prev.colors, tileHover: e.target.value }
													}))}
													className="w-12 h-8 rounded border border-gray-300"
												/>
												<span className="text-sm text-gray-600">{boardCustomizations.colors.tileHover}</span>
											</div>
										</div>
										
										<div className="space-y-2">
											<label className="block text-sm text-gray-600">Tile Opacity</label>
											<div className="flex items-center gap-3">
												<input
													type="range"
													min="10"
													max="100"
													step="5"
													value={boardCustomizations.colors.tileOpacity}
													onChange={(e) => setBoardCustomizations(prev => ({
														...prev,
														colors: { ...prev.colors, tileOpacity: parseInt(e.target.value) }
													}))}
													className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
												/>
												<span className="text-sm text-gray-600 font-medium min-w-[3rem]">{boardCustomizations.colors.tileOpacity}%</span>
											</div>
											<p className="text-xs text-gray-500">Controls the transparency of all tiles (affects readability)</p>
										</div>
									</div>
								</div>
								
								{/* Color Preview */}
								<div className="mt-6 p-4 border rounded-lg bg-gray-50">
									<h5 className="font-medium text-gray-700 mb-3">Preview</h5>
									<div className="space-y-2">
										<div 
											className="p-3 rounded border-2 text-center font-bold"
											style={{
												backgroundColor: boardCustomizations.colors.tileBackground,
												borderColor: boardCustomizations.colors.tileBorder,
												color: boardCustomizations.colors.categoryTextColor
											}}
										>
											Category Name
										</div>
										<div 
											className="p-2 rounded border text-center text-sm"
											style={{
												backgroundColor: boardCustomizations.colors.tileBackground,
												borderColor: boardCustomizations.colors.tileBorder,
												color: boardCustomizations.colors.questionTextColor
											}}
										>
											$200
										</div>
									</div>
								</div>
							</div>
						)}
						
						{/* Tile Backgrounds Section - Added to Colors Tab */}
						{activeCustomizationTab === 'colors' && (
							<div className="mt-8 space-y-6">
								<div className="border-t pt-6">
									<h3 className="text-lg font-medium text-gray-800 mb-4">Individual Tile Backgrounds</h3>
									<div className={`grid grid-cols-1 ${sidePreviewMode ? '' : 'md:grid-cols-2'} gap-6`}>
										{/* Default Backgrounds */}
										<div className="space-y-4">
											<h4 className="font-medium text-gray-700">Default Backgrounds</h4>
											
											<div className="space-y-2">
												<label className="block text-sm text-gray-600">Default Tile Background</label>
												<div className="flex items-center gap-2">
													<input
														type="color"
														value={boardCustomizations.colors.defaultTileBackground}
														onChange={(e) => setBoardCustomizations(prev => ({
															...prev,
															colors: { ...prev.colors, defaultTileBackground: e.target.value }
														}))}
														className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
													/>
													<span className="text-sm text-gray-600">{boardCustomizations.colors.defaultTileBackground}</span>
												</div>
											</div>
											
											<div className="space-y-2">
												<label className="block text-sm text-gray-600">Category Header Background</label>
												<div className="flex items-center gap-2">
													<input
														type="color"
														value={boardCustomizations.colors.categoryBackground}
														onChange={(e) => setBoardCustomizations(prev => ({
															...prev,
															colors: { ...prev.colors, categoryBackground: e.target.value }
														}))}
														className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
													/>
													<span className="text-sm text-gray-600">{boardCustomizations.colors.categoryBackground}</span>
												</div>
											</div>
										</div>
										
										{/* Individual Tile Instructions */}
										<div className="space-y-4">
											<h4 className="font-medium text-gray-700">Individual Tile Colors</h4>
											<div className="text-sm text-gray-600 space-y-2">
												<p>Enable side preview to see your individual tile color customizations in real-time.</p>
												<div className="p-3 bg-blue-50 rounded-md border border-blue-200">
													<p className="text-xs text-blue-700">
														💡 <strong>Tip:</strong> Use the &quot;Side Preview&quot; button to open a live preview panel where you can see all your customizations applied in real-time.
													</p>
												</div>
											</div>
										</div>
									</div>
									
									{/* Tile Background Images Section */}
									<div className="mt-8 space-y-6 border-t pt-6">
										<h3 className="text-lg font-medium text-gray-800 mb-4">Tile Background Images</h3>
										<div className={`grid grid-cols-1 ${sidePreviewMode ? '' : 'md:grid-cols-2'} gap-6`}>
											{/* Default Images */}
											<div className="space-y-4">
												<h4 className="font-medium text-gray-700">Default Images</h4>
												
												<div className="space-y-2">
													<label className="block text-sm text-gray-600">Default Tile Background Image</label>
													<div className="flex items-center gap-2">
														<input
															type="url"
															value={boardCustomizations.colors.defaultTileImage}
															onChange={(e) => setBoardCustomizations(prev => ({
																...prev,
																colors: { ...prev.colors, defaultTileImage: e.target.value }
															}))}
															placeholder="Enter image URL or leave blank for color only"
															className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
														/>
														<button
															onClick={() => setImageModal({
																isOpen: true,
																type: 'defaultTile',
																currentValue: boardCustomizations.colors.defaultTileImage
															})}
															className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
														>
															Browse
														</button>
													</div>
													{boardCustomizations.colors.defaultTileImage && (
														<div className="mt-2">
															<img 
																src={boardCustomizations.colors.defaultTileImage} 
																alt="Default tile background preview"
																className="w-16 h-10 object-cover rounded border"
																onError={(e) => {
																	e.currentTarget.style.display = 'none';
																}}
															/>
														</div>
													)}
												</div>
												
												<div className="space-y-2">
													<label className="block text-sm text-gray-600">Category Header Background Image</label>
													<div className="flex items-center gap-2">
														<input
															type="url"
															value={boardCustomizations.colors.categoryBackgroundImage}
															onChange={(e) => setBoardCustomizations(prev => ({
																...prev,
																colors: { ...prev.colors, categoryBackgroundImage: e.target.value }
															}))}
															placeholder="Enter image URL or leave blank for color only"
															className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
														/>
														<button
															onClick={() => setImageModal({
																isOpen: true,
																type: 'categoryImage',
																currentValue: boardCustomizations.colors.categoryBackgroundImage
															})}
															className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
														>
															Browse
														</button>
													</div>
													{boardCustomizations.colors.categoryBackgroundImage && (
														<div className="mt-2">
															<img 
																src={boardCustomizations.colors.categoryBackgroundImage} 
																alt="Category background preview"
																className="w-16 h-10 object-cover rounded border"
																onError={(e) => {
																	e.currentTarget.style.display = 'none';
																}}
															/>
														</div>
													)}
												</div>
											</div>
											
											{/* Bulk Actions */}
											<div className="space-y-4">
												<h4 className="font-medium text-gray-700">Bulk Actions</h4>
												
												<div className="space-y-2">
													<label className="block text-sm text-gray-600">Apply Image to All Question Tiles</label>
													<div className="flex items-center gap-2">
														<input
															type="url"
															placeholder="Enter image URL to apply to all question tiles"
															className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
															id="bulkTileImage"
														/>
														<button
															onClick={() => {
																const input = document.getElementById('bulkTileImage') as HTMLInputElement;
																const imageUrl = input.value.trim();
																if (imageUrl) {
																	setBoardCustomizations(prev => {
																		const newIndividualImages: { [key: string]: string } = {};
																		// Apply to all tiles (4 rows x 4 cols)
																		for (let row = 1; row <= 4; row++) {
																			for (let col = 1; col <= 4; col++) {
																				newIndividualImages[`tile-${row}-${col}`] = imageUrl;
																			}
																		}
																		return {
																			...prev,
																			colors: { 
																				...prev.colors, 
																				individualTileImages: {
																					...prev.colors.individualTileImages,
																					...newIndividualImages
																				}
																			}
																		};
																	});
																	input.value = '';
																}
															}}
															className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
														>
															Apply All
														</button>
													</div>
												</div>
												
												<div className="space-y-2">
													<button
														onClick={() => {
															setBoardCustomizations(prev => ({
																...prev,
																colors: { 
																	...prev.colors, 
																	individualTileImages: {},
																	defaultTileImage: '',
																	categoryBackgroundImage: ''
																}
															}));
														}}
														className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
													>
														Clear All Tile Images
													</button>
												</div>
												
												<div className="p-3 bg-amber-50 rounded-md border border-amber-200">
													<p className="text-xs text-amber-700">
														🖼️ <strong>Image Tips:</strong> Right-click tiles in the preview below to add individual images. Images will overlay colors, so you can combine both for best results.
													</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}
						
						{/* Typography Tab */}
						{activeCustomizationTab === 'typography' && (
							<div className="space-y-6">
								<div className={`grid grid-cols-1 ${sidePreviewMode ? '' : 'md:grid-cols-2'} gap-6`}>
									{/* Font Settings */}
									<div className="space-y-4">
										<h4 className="font-medium text-gray-700">Font Settings</h4>
										
										<div className="space-y-2">
											<label className="block text-sm text-gray-600">Font Family</label>
											<select
												value={boardCustomizations.typography.fontFamily}
												onChange={(e) => setBoardCustomizations(prev => ({
													...prev,
													typography: { ...prev.typography, fontFamily: e.target.value }
												}))}
												className="w-full p-2 border border-gray-300 rounded-md"
											>
												<option value="Inter, sans-serif">Inter</option>
												<option value="Arial, sans-serif">Arial</option>
												<option value="Georgia, serif">Georgia</option>
												<option value="Times New Roman, serif">Times New Roman</option>
												<option value="Helvetica, sans-serif">Helvetica</option>
												<option value="Verdana, sans-serif">Verdana</option>
												<option value="Courier New, monospace">Courier New</option>
											</select>
										</div>
										
										<div className="space-y-2">
											<label className="block text-sm text-gray-600">Font Weight</label>
											<select
												value={boardCustomizations.typography.fontWeight}
												onChange={(e) => setBoardCustomizations(prev => ({
													...prev,
													typography: { ...prev.typography, fontWeight: e.target.value }
												}))}
												className="w-full p-2 border border-gray-300 rounded-md"
											>
												<option value="300">Light</option>
												<option value="400">Normal</option>
												<option value="500">Medium</option>
												<option value="600">Semi-bold</option>
												<option value="700">Bold</option>
												<option value="800">Extra-bold</option>
											</select>
										</div>
									</div>
									
									{/* Font Sizes */}
									<div className="space-y-4">
										<h4 className="font-medium text-gray-700">Font Sizes</h4>
										
										<div className="space-y-2">
											<label className="block text-sm text-gray-600">Category Font Size</label>
											<div className="flex items-center gap-2">
												<input
													type="range"
													min="12"
													max="24"
													value={boardCustomizations.typography.categoryFontSize}
													onChange={(e) => setBoardCustomizations(prev => ({
														...prev,
														typography: { ...prev.typography, categoryFontSize: e.target.value }
													}))}
													className="flex-1"
												/>
												<span className="text-sm text-gray-600 w-12">{boardCustomizations.typography.categoryFontSize}px</span>
											</div>
										</div>
										
										<div className="space-y-2">
											<label className="block text-sm text-gray-600">Question Font Size</label>
											<div className="flex items-center gap-2">
												<input
													type="range"
													min="10"
													max="20"
													value={boardCustomizations.typography.questionFontSize}
													onChange={(e) => setBoardCustomizations(prev => ({
														...prev,
														typography: { ...prev.typography, questionFontSize: e.target.value }
													}))}
													className="flex-1"
												/>
												<span className="text-sm text-gray-600 w-12">{boardCustomizations.typography.questionFontSize}px</span>
											</div>
										</div>
										
										<div className="space-y-2">
											<label className="block text-sm text-gray-600">Category Font Weight</label>
											<select
												value={boardCustomizations.typography.categoryFontWeight}
												onChange={(e) => setBoardCustomizations(prev => ({
													...prev,
													typography: { ...prev.typography, categoryFontWeight: e.target.value }
												}))}
												className="w-full p-2 border border-gray-300 rounded-md"
											>
												<option value="400">Normal</option>
												<option value="500">Medium</option>
												<option value="600">Semi-bold</option>
												<option value="700">Bold</option>
												<option value="800">Extra-bold</option>
											</select>
										</div>
									</div>
								</div>
								
								{/* Typography Preview */}
								<div className="mt-6 p-4 border rounded-lg bg-gray-50">
									<h5 className="font-medium text-gray-700 mb-3">Typography Preview</h5>
									<div className="space-y-2">
										<div 
											className="p-3 bg-blue-600 text-white rounded text-center"
											style={{
												fontFamily: boardCustomizations.typography.fontFamily,
												fontSize: `${boardCustomizations.typography.categoryFontSize}px`,
												fontWeight: boardCustomizations.typography.categoryFontWeight
											}}
										>
											Sample Category
										</div>
										<div 
											className="p-2 bg-gray-200 rounded text-center"
											style={{
												fontFamily: boardCustomizations.typography.fontFamily,
												fontSize: `${boardCustomizations.typography.questionFontSize}px`,
												fontWeight: boardCustomizations.typography.fontWeight
											}}
										>
											$400
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Templates Tab */}
						{activeCustomizationTab === 'templates' && (
							<motion.div 
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6 }}
								className="space-y-8"
							>
								<div className="text-center py-12">
									<motion.div 
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.6, delay: 0.1 }}
										className="max-w-md mx-auto px-4"
									>
										<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
											<svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
												<path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
											</svg>
										</div>
										<h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">No Templates Downloaded</h3>
										<p className="text-gray-600 mb-6 text-lg leading-relaxed">
											Browse the Market to download templates that you can apply to your games.
										</p>
										<div className="space-y-4 text-left bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
											<p className="text-base font-semibold text-gray-900">Templates will include:</p>
											<ul className="text-gray-700 space-y-3 text-base leading-relaxed">
												<li className="flex items-center gap-2">
													<div className="w-2 h-2 bg-green-400 rounded-full"></div>
													Pre-designed board layouts
												</li>
												<li className="flex items-center gap-2">
													<div className="w-2 h-2 bg-green-400 rounded-full"></div>
													Color scheme packages
												</li>
												<li className="flex items-center gap-2">
													<div className="w-2 h-2 bg-green-400 rounded-full"></div>
													Typography combinations
												</li>
												<li className="flex items-center gap-2">
													<div className="w-2 h-2 bg-green-400 rounded-full"></div>
													Background image sets
												</li>
											</ul>
										</div>
										<div className="flex flex-col sm:flex-row gap-2 mt-6">
											<button
												onClick={() => window.open('/dashboard?tab=market', '_blank')}
												className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center space-x-2 text-sm"
											>
												<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
													<path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
												</svg>
												<span>Browse Market</span>
											</button>
											<button
												onClick={() => setActiveCustomizationTab('images')}
												className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center space-x-2 text-sm"
											>
												<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
													<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
												</svg>
												<span>Customize Manually</span>
											</button>
										</div>
									</motion.div>
								</div>
							</motion.div>
						)}
						</div>
						
						{/* Right Panel - Side Preview (only shown when sidePreviewMode is true) */}
						{sidePreviewMode && (
							<div className="w-1/2 px-6 pb-6 border-l">
								<div className="sticky top-6">
									<h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
										<span>👁️</span>
										Live Preview
									</h4>
									
									{/* Live Board Preview */}
									<div 
										className="rounded-lg border-2 border-gray-200 p-3"
										style={{
											backgroundImage: boardBackground ? `url(${boardBackground})` : 'none',
											backgroundSize: 'cover',
											backgroundPosition: 'center',
											backgroundRepeat: 'no-repeat'
										}}
									>
										<div className="grid gap-1" style={{ 
											gridTemplateColumns: 'repeat(4, 1fr)',
											gridTemplateRows: 'auto repeat(5, 1fr)'
										}}>
											{/* Category Headers */}
											{[1, 2, 3, 4].map((catIndex) => (
												<div 
													key={`side-cat-${catIndex}`}
													className="text-center font-bold p-2 rounded relative overflow-hidden text-xs"
													style={{
														backgroundColor: boardCustomizations.colors.categoryBackground,
														color: boardCustomizations.colors.categoryTextColor,
														backgroundImage: boardCustomizations.colors.categoryBackgroundImage ? `url("${boardCustomizations.colors.categoryBackgroundImage}")` : 'none',
														backgroundSize: 'cover',
														backgroundPosition: 'center',
														opacity: boardCustomizations.colors.tileOpacity / 100,
														fontFamily: boardCustomizations.typography.fontFamily,
														fontSize: `${Math.max(10, parseInt(boardCustomizations.typography.categoryFontSize) - 2)}px`,
														fontWeight: boardCustomizations.typography.categoryFontWeight
													}}
												>
													<span style={{
														textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
														position: 'relative',
														zIndex: 1
													}}>
														Category {catIndex}
													</span>
												</div>
											))}
											
											{/* Question Tiles */}
											{[100, 200, 300, 400, 500].map((value, rowIndex) => (
												[1, 2, 3, 4].map((colIndex) => {
													const tileKey = `tile-${colIndex - 1}-${rowIndex}`;
													const tileColor = boardCustomizations.colors.individualTileColors?.[tileKey] || boardCustomizations.colors.defaultTileBackground;
													const tileImage = boardCustomizations.colors.individualTileImages?.[tileKey] || boardCustomizations.colors.defaultTileImage;
													
													return (
														<div 
															key={`side-preview-${rowIndex}-${colIndex}`}
															className="text-center font-bold p-2 rounded flex items-center justify-center relative overflow-hidden text-xs"
															style={{
																backgroundColor: tileColor,
																color: boardCustomizations.colors.questionTextColor,
																borderColor: boardCustomizations.colors.tileBorder,
																backgroundImage: tileImage ? `url("${tileImage}")` : 'none',
																backgroundSize: 'cover',
																backgroundPosition: 'center',
																opacity: boardCustomizations.colors.tileOpacity / 100,
																fontFamily: boardCustomizations.typography.fontFamily,
																fontSize: `${Math.max(8, parseInt(boardCustomizations.typography.questionFontSize) - 2)}px`,
																fontWeight: boardCustomizations.typography.fontWeight,
																minHeight: '32px'
															}}
														>
															<span style={{
																textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
																position: 'relative',
																zIndex: 1
															}}>
																${value}
															</span>
														</div>
													);
												})
											)).flat()}
										</div>
									</div>
									
									{/* Preview Info */}
									<div className="mt-3 p-3 bg-gray-50 rounded-lg border text-xs">
										<div className="grid grid-cols-2 gap-2">
											<div>
												<span className="font-medium text-gray-600">Opacity:</span>
												<p className="text-gray-800">{boardCustomizations.colors.tileOpacity}%</p>
											</div>
											<div>
												<span className="font-medium text-gray-600">Font:</span>
												<p className="text-gray-800">{boardCustomizations.typography.fontFamily.split(',')[0]}</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</motion.div>

				{/* Instructions */}
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.5 }}
					className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl shadow-sm"
				>
					<motion.h3 
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.6 }}
						className="text-xl font-bold mb-3 text-gray-900"
					>
						Create Your Jeopardy Game
					</motion.h3>
					<p className="text-base text-gray-700 leading-relaxed">
						Add categories and questions to create your educational game. Click on any cell to edit questions and answers.
					</p>
				</motion.div>

				{/* Game Board */}
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.7 }}
					className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100"
				>
					<div className="grid gap-1 p-4" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
						{/* Category Headers */}
						{categories.map((category, categoryIndex) => (
							<div key={category.id} className="space-y-1">
								<div>
									<div className="relative group">
									<input
										type="text"
										value={category.name}
										onChange={(e) => updateCategory(categoryIndex, e.target.value)}
										className="w-full p-4 text-center font-bold text-white border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										style={{
											backgroundColor: boardCustomizations.colors.categoryBackground,
											color: boardCustomizations.colors.categoryTextColor,
											opacity: boardCustomizations.colors.tileOpacity / 100
										}}
										placeholder={`Category ${categoryIndex + 1}`}
									/>
									<div className="absolute -top-3 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
										{categories.length < 6 && (
											<button
												onClick={(e) => {
													e.stopPropagation();
													const newCategory = {
														id: `cat-${Date.now()}`,
														name: '',
														questions: customValues.map((value, j) => ({
															id: `q-${Date.now()}-${j}`,
															value,
															question: '',
															answer: '',
															isAnswered: false
														}))
													};
													const newCategories = [...categories];
													newCategories.splice(categoryIndex + 1, 0, newCategory);
													setCategories(newCategories);
												}}
												className="p-1 rounded bg-green-500 text-white hover:bg-green-600"
												title="Add category"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
												</svg>
											</button>
										)}
										<button
											onClick={(e) => {
												e.stopPropagation();
												if (categories.length < 6) {
													const newCategory = {
														...category,
														id: `cat-${Date.now()}`,
														name: `${category.name} Copy`,
														questions: category.questions.map(q => ({
															...q,
															id: `q-${Date.now()}-${Math.random()}`,
															question: '',
															answer: ''
														}))
													};
													const newCategories = [...categories];
													newCategories.splice(categoryIndex + 1, 0, newCategory);
													setCategories(newCategories);
												}
											}}
											className="p-1 rounded bg-purple-500 text-white hover:bg-purple-600"
											title="Duplicate category"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
											</svg>
										</button>
										{categories.length > 1 && (
											<button
												onClick={(e) => {
													e.stopPropagation();
													const newCategories = categories.filter((_, i) => i !== categoryIndex);
													setCategories(newCategories);
												}}
												className="p-1 rounded bg-red-500 text-white hover:bg-red-600"
												title="Remove category"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										)}
									</div>
								</div>
								</div>

								{/* Questions */}
								{category.questions.map((question, questionIndex) => {
									const tileKey = `tile-${categoryIndex}-${questionIndex}`;
									const tileColor = boardCustomizations.colors.individualTileColors?.[tileKey] || boardCustomizations.colors.defaultTileBackground;
									const tileImage = boardCustomizations.colors.individualTileImages?.[tileKey] || boardCustomizations.colors.defaultTileImage;
									
									return (
									<button
										key={question.id}
										onClick={() => openQuestionEditor(categoryIndex, questionIndex)}
										className="w-full p-6 text-center font-bold text-xl border border-gray-300 rounded transition-colors relative group overflow-hidden"
										style={{
											backgroundColor: question.question && question.answer ? boardCustomizations.colors.tileBackground : tileColor,
											color: boardCustomizations.colors.questionTextColor,
											borderColor: boardCustomizations.colors.tileBorder,
											backgroundImage: tileImage ? `url(${tileImage})` : 'none',
											backgroundSize: 'cover',
											backgroundPosition: 'center',
											opacity: boardCustomizations.colors.tileOpacity / 100
										}}
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
											<>
												<div className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-80 transition-opacity duration-200 rounded"></div>
												<div className="absolute inset-0 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center text-sm z-10">
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
											</>
										)}
									</button>
									);
								})}

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
					</div>
				</motion.div>
			</motion.div>

			{/* Image Upload Modal */}
			<Modal 
				isOpen={imageModal.isOpen} 
				onClose={() => setImageModal({ isOpen: false, type: null, currentValue: '' })}
				maxWidth="md"
			>
				<div className="space-y-4">
					<div className="flex items-center gap-3 mb-4">
						<span className="text-2xl">
							{imageModal.type === 'display' ? '🖼️' : 
							 imageModal.type === 'defaultTile' ? '🔲' :
							 imageModal.type === 'categoryImage' ? '📋' : '🌄'}
						</span>
						<h2 className="text-xl font-semibold">
							{imageModal.type === 'display' ? 'Set Display Image' : 
							 imageModal.type === 'defaultTile' ? 'Set Default Tile Background Image' :
							 imageModal.type === 'categoryImage' ? 'Set Category Background Image' : 'Set Board Background'}
						</h2>
					</div>
					
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Image URL
							</label>
							<input
								type="url"
								value={imageModal.currentValue}
								onChange={(e) => setImageModal(prev => ({ ...prev, currentValue: e.target.value }))}
								placeholder="https://example.com/image.jpg"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
							<p className="text-xs text-gray-500 mt-1">
								Enter a direct link to an image (JPG, PNG, GIF, WebP)
							</p>
						</div>
						
						{/* Image Preview */}
						{imageModal.currentValue && (
							<div className="border rounded-lg p-3">
								<p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
								<div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
									<Image 
										src={imageModal.currentValue} 
										alt="Image preview"
										width={300}
										height={160}
										className="max-w-full max-h-full object-contain"
										onError={(e) => {
											e.currentTarget.style.display = 'none';
											e.currentTarget.nextElementSibling?.classList.remove('hidden');
										}}
									/>
									<div className="hidden text-center text-gray-500">
										<div className="text-2xl mb-2">❌</div>
										<span className="text-sm">Unable to load image</span>
									</div>
								</div>
							</div>
						)}
						
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
							<h4 className="font-medium text-blue-800 mb-2">💡 Tips:</h4>
							<ul className="text-sm text-blue-700 space-y-1">
								<li>• Use high-quality images for best results</li>
								<li>• Recommended size: 400x300 pixels or larger</li>
								<li>• Make sure the image URL is publicly accessible</li>
								<li>• {imageModal.type === 'display' ? 'This image appears on your game card' : 
								     imageModal.type === 'defaultTile' ? 'This image will be the default background for all question tiles' :
								     imageModal.type === 'categoryImage' ? 'This image will be the background for category headers' : 
								     'This background shows behind the game board during play'}</li>
							</ul>
						</div>
					</div>
					
					<div className="flex justify-end gap-3 pt-4 border-t">
						<button
							onClick={() => setImageModal({ isOpen: false, type: null, currentValue: '' })}
							className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={() => {
								if (imageModal.type === 'display') {
									setDisplayImage(imageModal.currentValue);
								} else if (imageModal.type === 'board') {
									setBoardBackground(imageModal.currentValue);
									// Automatically set tile opacity to 50% when board background is set
									if (imageModal.currentValue.trim() !== '') {
										setBoardCustomizations(prev => ({
											...prev,
											colors: { ...prev.colors, tileOpacity: 50 }
										}));
									}
								} else if (imageModal.type === 'defaultTile') {
									setBoardCustomizations(prev => ({
										...prev,
										colors: { ...prev.colors, defaultTileImage: imageModal.currentValue }
									}));
								} else if (imageModal.type === 'categoryImage') {
									setBoardCustomizations(prev => ({
										...prev,
										colors: { ...prev.colors, categoryBackgroundImage: imageModal.currentValue }
									}));
								}
								setImageModal({ isOpen: false, type: null, currentValue: '' });
							}}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							Save Image
						</button>
					</div>
				</div>
			</Modal>

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

			{/* Reset Confirmation Modal */}
			{showResetModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
					>
						<div className="flex items-center gap-3 mb-4">
							<div className="flex-shrink-0">
								<svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
								</svg>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">Reset Game</h3>
								<p className="text-sm text-gray-600">This action cannot be undone</p>
							</div>
						</div>

						<div className="mb-6">
							<p className="text-gray-700">
								Are you sure you want to reset this game? This will permanently delete:
							</p>
							<ul className="mt-2 ml-4 list-disc text-sm text-gray-600 space-y-1">
								<li>All questions and answers</li>
								<li>All categories</li>
								<li>Game title and description</li>
								<li>All customizations and styling</li>
								<li>Display images and backgrounds</li>
							</ul>
							<p className="mt-3 text-sm font-medium text-red-600">
								You will start with a completely blank game.
							</p>
						</div>

						<div className="flex justify-end gap-3">
							<button
								onClick={() => setShowResetModal(false)}
								className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={resetGame}
								className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
							>
								Reset Game
							</button>
						</div>
					</motion.div>
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
