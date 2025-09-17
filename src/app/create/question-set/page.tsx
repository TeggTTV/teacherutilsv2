'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Modal from '@/components/Modal';
import TagSelector from '@/components/TagSelector';
import { useSearchParams, useRouter } from 'next/navigation';
import TemplateService from '@/lib/services/templateService';
import { getApiUrl } from '@/lib/config';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';

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
	defaultTileImage: string;
	categoryBackgroundImage: string;
	tileOpacity: number;
}

interface BoardTypography {
	fontFamily: string;
	categoryFontSize: string;
	questionFontSize: string;
	fontWeight: string;
	categoryFontWeight: string;
}

interface GameTemplate {
	id: string;
	title: string;
	description?: string;
	isPublic?: boolean;
	createdAt?: string;
	data: {
		title: string;
		displayImage?: string;
		boardBackground?: string;
		boardCustomizations?: BoardCustomizations;
		categories: Category[];
		colors: BoardColors;
		typography: BoardTypography;
		gameSettings: {
			timer: number;
			allowSkip: boolean;
			showAnswerAfterReveal: boolean;
			backgroundImage?: string;
			backgroundOpacity: number;
		};
	};
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
	const useTemplate = searchParams.get('useTemplate') === 'true';

	// Core game state
	const [gameTitle, setGameTitle] = useState('');
	const [categories, setCategories] = useState<Category[]>([]);
	
	// Debug log for categories state changes
	useEffect(() => {
		console.log('Categories state updated:', categories.length, categories);
	}, [categories]);
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
			tileBackground: '#e5e7eb',
			tileBorder: '#3b82f6',
			tileHover: '#d1d5db',
			defaultTileBackground: '#e5e7eb',
			categoryBackground: '#3b82f6',
			defaultTileImage: '',
			categoryBackgroundImage: '',
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

	// Template saving state
	const [showTemplateModal, setShowTemplateModal] = useState(false);
	const [templateSaving, setTemplateSaving] = useState(false);
	const [templateForm, setTemplateForm] = useState({
		title: '',
		description: '',
		type: 'theme' as 'theme' | 'layout' | 'complete'
	});
	const [showTemplateSuccessModal, setShowTemplateSuccessModal] = useState(false);
	const [templateSaveError, setTemplateSaveError] = useState<string | null>(null);

	// Tags state
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

	// Template loading state
	const [userTemplates, setUserTemplates] = useState<GameTemplate[]>([]);
	const [loadingTemplates, setLoadingTemplates] = useState(false);

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
				
				// Load tags
				if (game.tags && Array.isArray(game.tags)) {
					setSelectedTags(game.tags);
				}
				
				// Load image settings
				setDisplayImage(game.data.displayImage || '');
				setBoardBackground(game.data.boardBackground || '');					// Load board customizations
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

	// Load template from session storage or initialize empty categories
	useEffect(() => {
		console.log('Template loading effect triggered:', { useTemplate, editGameId });
		
		const initializeData = async () => {
			if (useTemplate && !editGameId) {
				console.log('Attempting to load template from session storage...');
				
				const templateData = TemplateService.getTemplate();
				
				if (templateData) {
					console.log('Template loaded successfully:', templateData);
					
					// Set game title
					if (templateData.title) {
						console.log('Setting game title:', templateData.title);
						setGameTitle(templateData.title);
					}
					
					// Load game data
					const gameData = templateData.data;
					if (gameData) {
						console.log('Processing game data:', gameData);
						
						// Load categories and questions
						if (gameData.categories && Array.isArray(gameData.categories)) {
							console.log('Processing categories:', gameData.categories.length);
							
							// If categories array is empty, create empty categories but still apply styling
							if (gameData.categories.length === 0) {
								console.log('Categories array is empty, creating default empty categories with styling applied');
								initializeEmptyCategories();
							} else {
								// Process categories with content
								const processedCategories = gameData.categories.map((category, catIndex) => {
									console.log(`Processing category ${catIndex}:`, category.name, 'questions:', category.questions?.length);
									
									return {
										id: category.id || `category-${catIndex}`,
										name: category.name || '',
										questions: customValues.map((value, qIndex) => {
											const templateQuestion = category.questions?.[qIndex];
											return {
												id: `question-${catIndex}-${qIndex}`,
												value: value,
												question: templateQuestion?.question || '',
												answer: templateQuestion?.answer || '',
												isAnswered: false,
												media: templateQuestion?.media as { type: 'image' | 'audio' | 'video'; url: string; alt?: string } | undefined,
												timer: templateQuestion?.timer,
												difficulty: templateQuestion?.difficulty as 'easy' | 'medium' | 'hard' | undefined
											};
										})
									};
								});
								
								console.log('Setting processed categories:', processedCategories.length);
								setCategories(processedCategories);
							}
						} else {
							console.log('No categories found in game data, creating empty categories');
							initializeEmptyCategories();
						}
						
						// Load other game settings
						if (gameData.displayImage) {
							setDisplayImage(gameData.displayImage);
						}
						
						if (gameData.boardBackground) {
							setBoardBackground(gameData.boardBackground);
						}
						
						if (gameData.boardCustomizations) {
							setBoardCustomizations(gameData.boardCustomizations as BoardCustomizations);
						}
					}
					
					// Clear template from session storage after loading
					TemplateService.clearTemplate();
					
				} else {
					console.log('No template found in session storage, initializing empty categories');
					initializeEmptyCategories();
				}
			} else if (!editGameId) {
				console.log('No template requested, initializing empty categories');
				initializeEmptyCategories();
			} else {
				console.log('Editing existing game, skipping template logic');
			}
		};

		const initializeEmptyCategories = () => {
			console.log('Creating empty categories...');
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
			console.log('Setting empty categories:', initialCategories.length);
			setCategories(initialCategories);
		};

		initializeData();
	}, [useTemplate, editGameId, customValues]);

	// Load user templates
	useEffect(() => {
		const loadUserTemplates = async () => {
			if (!user) return;

			setLoadingTemplates(true);
			try {
				const response = await fetch(`/api/templates/my`, {
					credentials: 'include',
				});
				if (response.ok) {
					const data = await response.json();
					setUserTemplates(data.templates || []);
				}
			} catch (error) {
				console.error('Error loading user templates:', error);
			} finally {
				setLoadingTemplates(false);
			}
		};

		loadUserTemplates();
	}, [user]);

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
				tags: selectedTags
			};				const response = await fetch(getApiUrl(`/api/games/${savedGameId}`), {
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
	}, [categories, gameTitle, savedGameId, customValues, displayImage, boardBackground, boardCustomizations, selectedTags]);

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
					tags: selectedTags
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

	// Save current game as template
	const saveAsTemplate = async () => {
		if (!templateForm.title.trim() || !templateForm.description.trim()) return;

		setTemplateSaving(true);
		try {
			// Capture board preview if side preview is visible
			let previewImage = null;
			if (sidePreviewMode) {
				previewImage = await captureBoardPreview();
			}

			// Determine what to include based on template type
			const includeContent = templateForm.type === 'complete' || templateForm.type === 'layout';
			
			const templateData = {
				gameTitle: gameTitle.trim(),
				categories: includeContent ? categories : [],
				customValues,
				displayImage: displayImage || undefined,
				boardBackground: boardBackground || undefined,
				boardCustomizations
			};

			const response = await fetch('/api/templates', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					title: templateForm.title.trim(),
					description: templateForm.description.trim(),
					type: 'JEOPARDY',
					data: templateData,
					subject: 'general',
					difficulty: 'intermediate',
					gradeLevel: 'all',
					tags: ['custom', 'user-created', `template-type-${templateForm.type}`],
					previewImage: previewImage // Add the captured preview image
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			console.log('Template saved successfully:', result);

			// Reset form and close modal
			setTemplateForm({ title: '', description: '', type: 'theme' });
			setShowTemplateModal(false);
			
			// Show success modal instead of alert
			setShowTemplateSuccessModal(true);
			
			// Reload user templates to include the new one
			if (user) {
				try {
					const templatesResponse = await fetch(`/api/templates/my`, {
						credentials: 'include',
					});
					if (templatesResponse.ok) {
						const templatesData = await templatesResponse.json();
						setUserTemplates(templatesData.templates || []);
					}
				} catch (error) {
					console.error('Error reloading templates:', error);
				}
			}
		} catch (error) {
			console.error('Error saving template:', error);
			setTemplateSaveError('Failed to save template. Please try again.');
		} finally {
			setTemplateSaving(false);
		}
	};

	// Apply template to current game
	const applyTemplate = (template: GameTemplate) => {
		try {
			const templateData = template.data;
			
			// Apply game title if available
			if (template.title && template.title !== gameTitle) {
				setGameTitle(template.title);
			}
			
			// Apply categories if available (for complete/layout templates)
			if (templateData.categories && Array.isArray(templateData.categories)) {
				console.log('Applying template categories:', templateData.categories.length);
				
				if (templateData.categories.length > 0) {
					// Process categories with content
					const processedCategories = templateData.categories.map((category: { id?: string; name?: string; questions?: { question?: string; answer?: string; media?: unknown; timer?: number; difficulty?: string }[] }, catIndex: number) => ({
						id: category.id || `category-${catIndex}`,
						name: category.name || '',
						questions: customValues.map((value, qIndex) => {
							const templateQuestion = category.questions?.[qIndex];
							return {
								id: `question-${catIndex}-${qIndex}`,
								value: value,
								question: templateQuestion?.question || '',
								answer: templateQuestion?.answer || '',
								isAnswered: false,
								media: templateQuestion?.media as { type: 'image' | 'audio' | 'video'; url: string; alt?: string } | undefined,
								timer: templateQuestion?.timer,
								difficulty: templateQuestion?.difficulty as 'easy' | 'medium' | 'hard' | undefined
							};
						})
					}));
					
					setCategories(processedCategories);
				}
				// If categories array is empty, keep existing categories but apply styling
			}
			
			// Apply display image if available
			if (templateData.displayImage) {
				setDisplayImage(templateData.displayImage);
			}
			
			// Apply board background if available
			if (templateData.boardBackground) {
				setBoardBackground(templateData.boardBackground);
			}
			
			// Apply board customizations if available
			if (templateData.boardCustomizations) {
				setBoardCustomizations(templateData.boardCustomizations as BoardCustomizations);
			}
			
			console.log('Template applied successfully:', template.title);
			
		} catch (error) {
			console.error('Error applying template:', error);
		}
	};

	// Capture board preview as base64 image
	const captureBoardPreview = async (): Promise<string | null> => {
		try {
			const element = document.getElementById('board-preview-capture');
			if (!element) {
				console.warn('Board preview element not found');
				return null;
			}

			const canvas = await html2canvas(element, {
				useCORS: true,
				allowTaint: true,
				background: '#ffffff'
			});

			return canvas.toDataURL('image/png');
		} catch (error) {
			console.error('Error capturing board preview:', error);
			return null;
		}
	};

	// Reset game to initial state
	const resetGame = () => {
		// Reset all state to initial values
		setGameTitle('');
		setSavedGameId(null);
		setSelectedTags([]);
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
				tileBackground: '#e5e7eb',
				tileBorder: '#3b82f6',
				tileHover: '#d1d5db',
				defaultTileBackground: '#e5e7eb',
				categoryBackground: '#3b82f6',
				defaultTileImage: '',
				categoryBackgroundImage: '',
				tileOpacity: 100
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
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Debug Panel */}
			<div className="bg-yellow-50 border-b border-yellow-200 p-2">
				<div className="max-w-7xl mx-auto px-4 text-sm text-yellow-800 font-mono">
					<strong>🐛 Debug:</strong> Categories: {categories.length} | 
					Template Mode: {useTemplate ? 'YES' : 'NO'} | 
					Edit Mode: {editGameId ? 'YES' : 'NO'} | 
					Session Storage: {typeof window !== 'undefined' && TemplateService.hasTemplate() ? 'YES' : 'NO'}
				</div>
			</div>
			
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
									
									{/* Background Colors */}
									<div className="space-y-3">
										<h4 className="font-medium text-gray-700">Background Colors</h4>
										
										<div className="space-y-2">
											<label className="block text-sm text-gray-600">Category Background</label>
											<div className="flex items-center gap-2">
												<input
													type="color"
													value={boardCustomizations.colors.categoryBackground}
													onChange={(e) => setBoardCustomizations(prev => ({
														...prev,
														colors: { ...prev.colors, categoryBackground: e.target.value }
													}))}
													className="w-12 h-8 rounded border border-gray-300"
												/>
												<span className="text-sm text-gray-600">{boardCustomizations.colors.categoryBackground}</span>
											</div>
										</div>
										
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
									</div>
									
									{/* Border & Effects */}
									<div className="space-y-3">
										<h4 className="font-medium text-gray-700">Border & Effects</h4>
										
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
								{/* Save as Template Button */}
								<div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
									<div>
										<h3 className="text-lg font-semibold text-gray-900 mb-1">Save Current Design as Template</h3>
										<p className="text-sm text-gray-600">Share your customizations with the community</p>
									</div>
									<motion.button
										onClick={() => setShowTemplateModal(true)}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
										</svg>
										<span>Save as Template</span>
									</motion.button>
								</div>

								{/* User Templates Section */}
								<div>
									<h4 className="text-lg font-semibold text-gray-900 mb-4">Your Templates</h4>
									
									{loadingTemplates ? (
										<div className="flex items-center justify-center py-8">
											<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
										</div>
									) : userTemplates && userTemplates.length > 0 ? (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{userTemplates.map((template) => (
												<motion.div
													key={template.id}
													className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
													whileHover={{ scale: 1.02 }}
													onClick={() => applyTemplate(template)}
												>
													<div className="flex items-start justify-between mb-2">
														<h5 className="font-semibold text-gray-900 line-clamp-1">{template.title}</h5>
														<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
															{template.isPublic ? 'Public' : 'Private'}
														</span>
													</div>
													<p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
													<div className="flex items-center justify-between text-xs text-gray-500">
														<span>Created {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'Unknown'}</span>
														<motion.button
															whileHover={{ scale: 1.1 }}
															whileTap={{ scale: 0.9 }}
															className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
															onClick={(e) => {
																e.stopPropagation();
																applyTemplate(template);
															}}
														>
															Apply
														</motion.button>
													</div>
												</motion.div>
											))}
										</div>
									) : (
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
												<h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">No Templates Yet</h3>
												<p className="text-gray-600 mb-6 text-lg leading-relaxed">
													You haven&apos;t saved any templates yet. Create your first template by customizing your game and clicking &quot;Save as Template&quot; above.
												</p>
												<div className="space-y-4 text-left bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
													<p className="text-base font-semibold text-gray-900">Templates will include:</p>
													<ul className="text-gray-700 space-y-3 text-base leading-relaxed">
														<li className="flex items-center gap-2">
															<div className="w-2 h-2 bg-green-400 rounded-full"></div>
															Your custom color schemes
														</li>
														<li className="flex items-center gap-2">
															<div className="w-2 h-2 bg-green-400 rounded-full"></div>
															Background images
														</li>
														<li className="flex items-center gap-2">
															<div className="w-2 h-2 bg-green-400 rounded-full"></div>
															Typography settings
														</li>
														<li className="flex items-center gap-2">
															<div className="w-2 h-2 bg-green-400 rounded-full"></div>
															Board customizations
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
									)}
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
										id="board-preview-capture"
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
													const tileColor = boardCustomizations.colors.tileBackground;
													const tileImage = boardCustomizations.colors.defaultTileImage;
													
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

				{/* Tags Section */}
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.6 }}
					className="mb-6"
				>
					<TagSelector 
						selectedTags={selectedTags}
						onTagsChange={setSelectedTags}
						placeholder="Add tags to help others discover your game..."
					/>
				</motion.div>

				{/* Game Board */}
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.7 }}
					className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100"
				>
					<div className="grid gap-1 p-4" style={{ gridTemplateColumns: `repeat(${Math.max(categories.length, 1)}, 1fr)` }}>
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
									const tileColor = boardCustomizations.colors.tileBackground;
									const tileImage = boardCustomizations.colors.defaultTileImage;
									
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
			<Modal 
				isOpen={!!editingQuestion}
				onClose={() => setEditingQuestion(null)}
				maxWidth="2xl"
			>
				<div className="p-6">
					<div className="flex justify-between items-center mb-6">
						<h3 className="text-xl font-bold text-gray-900">
							Edit Question: {categories[editingQuestion.categoryIndex]?.name || `Category ${editingQuestion.categoryIndex + 1}`} - {editingQuestion.question.value}
						</h3>
					</div>

					<div className="space-y-6">
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
								placeholder="Enter your question..."
							/>
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

								{editingQuestion.question.media?.type === 'image' && (
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Alt Text (Optional)
										</label>
										<input
											type="text"
											value={editingQuestion.question.media.alt || ''}
											onChange={(e) => {
												const currentMedia = editingQuestion.question.media;
												if (currentMedia) {
													updateQuestion(editingQuestion.categoryIndex, editingQuestion.questionIndex, 'media', {
														...currentMedia,
														alt: e.target.value
													});
												}
											}}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder="Describe the image..."
										/>
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
										max="300"
										placeholder="30"
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
									<p className="mt-1 text-xs text-gray-500">
										How long players have to answer this question
									</p>
								</div>
								
								<div>
									<label className="block text-sm text-gray-600 mb-1">
										Difficulty Level
									</label>
									<select
										value={editingQuestion.question.difficulty || 'medium'}
										onChange={(e) => {
											const difficulty = e.target.value as 'easy' | 'medium' | 'hard';
											updateQuestion(editingQuestion.categoryIndex, editingQuestion.questionIndex, 'difficulty', difficulty);
										}}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									>
										<option value="easy">🟢 Easy</option>
										<option value="medium">🟡 Medium</option>
										<option value="hard">🔴 Hard</option>
									</select>
								</div>
							</div>
						</div>
					</div>

					<div className="flex justify-end gap-3 mt-6">
						<button
							onClick={() => setEditingQuestion(null)}
							className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={() => setEditingQuestion(null)}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							Save & Close
						</button>
					</div>
				</div>
			</Modal>
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

			{/* Template Save Modal */}
			{showTemplateModal && (
				<Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)}>
					<div className="max-w-md mx-auto">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h2 className="text-xl font-bold text-gray-900">Save as Template</h2>
								<p className="text-sm text-gray-600">Share your design with the community</p>
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<label htmlFor="template-title" className="block text-sm font-medium text-gray-700 mb-2">
									Template Title *
								</label>
								<input
									id="template-title"
									type="text"
									value={templateForm.title}
									onChange={(e) => setTemplateForm(prev => ({ ...prev, title: e.target.value }))}
									placeholder="e.g., Math Quiz Blue Theme"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>

							<div>
								<label htmlFor="template-description" className="block text-sm font-medium text-gray-700 mb-2">
									Description *
								</label>
								<textarea
									id="template-description"
									value={templateForm.description}
									onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
									placeholder="Describe your template design and what makes it special..."
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
								/>
							</div>

							<div>
								<label htmlFor="template-type" className="block text-sm font-medium text-gray-700 mb-2">
									Template Type
								</label>
								<select
									id="template-type"
									value={templateForm.type}
									onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value as 'theme' | 'layout' | 'complete' }))}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option value="theme">Theme (Colors & Styling Only)</option>
									<option value="layout">Layout (Structure + Categories/Questions)</option>
									<option value="complete">Complete (Everything + Categories/Questions)</option>
								</select>
								<div className="mt-2 text-xs text-gray-600">
									{templateForm.type === 'theme' && (
										<p>• Saves: Colors, fonts, backgrounds, styling<br/>• Does NOT save: Categories, questions, answers</p>
									)}
									{templateForm.type === 'layout' && (
										<p>• Saves: All styling + categories, questions, and answers<br/>• Perfect for reusing game content</p>
									)}
									{templateForm.type === 'complete' && (
										<p>• Saves: Everything including all styling, categories, questions, and answers<br/>• Complete template for full reuse</p>
									)}
								</div>
							</div>
						</div>

						<div className="flex justify-end gap-3 mt-6">
							<button
								onClick={() => setShowTemplateModal(false)}
								className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={saveAsTemplate}
								disabled={!templateForm.title.trim() || !templateForm.description.trim() || templateSaving}
								className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
							>
								{templateSaving && (
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								)}
								<span>{templateSaving ? 'Saving...' : 'Save Template'}</span>
							</button>
						</div>
					</div>
				</Modal>
			)}

			{/* Template Success Modal */}
			{showTemplateSuccessModal && (
				<Modal isOpen={showTemplateSuccessModal} onClose={() => setShowTemplateSuccessModal(false)} maxWidth="md">
					<div className="text-center">
						<div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
							>
								<svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
							</motion.div>
						</div>
						<motion.h3 
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="text-xl font-semibold text-gray-900 mb-2"
						>
							Awesome! Template Saved! 🎉
						</motion.h3>
						<motion.p 
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="text-gray-600 mb-6"
						>
							Your template has been saved to your private library. You can share it to the market from your dashboard whenever you&apos;re ready!
						</motion.p>
						<div className="flex justify-center gap-3">
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => setShowTemplateSuccessModal(false)}
								className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
							>
								Continue Creating
							</motion.button>
							<Link href="/dashboard?tab=my-templates">
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
								>
									<span>View My Templates</span>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
									</svg>
								</motion.button>
							</Link>
						</div>
					</div>
				</Modal>
			)}

			{/* Template Error Modal */}
			{templateSaveError && (
				<Modal isOpen={!!templateSaveError} onClose={() => setTemplateSaveError(null)} maxWidth="md">
					<div className="text-center">
						<div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
							<svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
							</svg>
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
						<p className="text-gray-600 mb-6">{templateSaveError}</p>
						<button
							onClick={() => setTemplateSaveError(null)}
							className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
						>
							Try Again
						</button>
					</div>
				</Modal>
			)}
		</div>
	);
}

export default function QuestionSetPage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		}>
			<QuestionSetContent />
		</Suspense>
	);
}
