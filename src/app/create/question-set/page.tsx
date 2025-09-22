'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useState, useEffect, Suspense } from 'react';
import TagSelector from '@/components/TagSelector';
import { useSearchParams, useRouter } from 'next/navigation';
import TemplateService from '@/lib/services/templateService';
import { getApiUrl } from '@/lib/config';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import GameHeader from '@/components/question-set/GameHeader';
import BoardCustomization from '@/components/question-set/BoardCustomization';
import GameBoard from '@/components/question-set/GameBoard';
import QuestionEditorModal from '@/components/question-set/QuestionEditorModal';
import ImageUploadModal from '@/components/question-set/ImageUploadModal';
import TemplateModals from '@/components/question-set/TemplateModals';
import ResetConfirmationModal from '@/components/question-set/ResetConfirmationModal';

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

// export const metadata: Metadata = {
// 	title: 'Create | Compyy.',
// 	description:
// 		'Create your own custom educational games with our easy-to-use game builder. Design engaging quizzes and activities tailored to your classroom needs.',
// };


function QuestionSetContent() {
	const { user, loading } = useAuthGuard();
	const searchParams = useSearchParams();
	const router = useRouter();
	const editGameId = searchParams.get('edit');
	const useTemplate = searchParams.get('useTemplate') === 'true';

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
		const initializeData = async () => {
			if (useTemplate && !editGameId) {
				const templateData = TemplateService.getTemplate();
				
				if (templateData) {
					// Set game title
					if (templateData.title) {
						setGameTitle(templateData.title);
					}
					
					// Load game data
					const gameData = templateData.data;
					if (gameData) {
						// Load categories and questions
						if (gameData.categories && Array.isArray(gameData.categories)) {
							// If categories array is empty, create empty categories but still apply styling
							if (gameData.categories.length === 0) {
								initializeEmptyCategories();
								// Load styling even with empty categories
								if (gameData.displayImage) {
									setDisplayImage(gameData.displayImage);
								}
								
								if (gameData.boardBackground) {
									setBoardBackground(gameData.boardBackground);
								}
								
								if (gameData.boardCustomizations) {
									setBoardCustomizations(gameData.boardCustomizations as BoardCustomizations);
								}
							} else {
								// Process categories with content
								const processedCategories = gameData.categories.map((category, catIndex) => {
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
								
								setCategories(processedCategories);
								
								// Load other game settings for categories with content
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
						} else {
							initializeEmptyCategories();
							
							// Load other game settings when no categories exist
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
					}
					
					// Clear template from session storage after loading
					TemplateService.clearTemplate();
					
				} else {
					initializeEmptyCategories();
				}
			} else if (!editGameId) {
				initializeEmptyCategories();
			}
		};

		const initializeEmptyCategories = () => {
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

		await response.json();

		// Reset form and close modal
		setTemplateForm({ title: '', description: '', type: 'theme' });
		setShowTemplateModal(false);			// Show success modal instead of alert
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
			{/* Header */}
			<GameHeader
				gameTitle={gameTitle}
				setGameTitle={setGameTitle}
				savedGameId={savedGameId}
				autoSaveStatus={autoSaveStatus}
				lastAutoSave={lastAutoSave}
				validationErrors={validationErrors}
				completionStats={completionStats}
				saveError={saveError}
				saveSuccess={saveSuccess}
				onSaveGame={saveGame}
				onResetGame={() => setShowResetModal(true)}
			/>

			{/* Main Content */}
			<motion.div 
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}
				className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
			>
				{/* Board Customization */}
				<BoardCustomization
					sidePreviewMode={sidePreviewMode}
					setSidePreviewMode={setSidePreviewMode}
					activeCustomizationTab={activeCustomizationTab}
					setActiveCustomizationTab={setActiveCustomizationTab}
					displayImage={displayImage}
					setDisplayImage={setDisplayImage}
					boardBackground={boardBackground}
					setBoardBackground={setBoardBackground}
					boardCustomizations={boardCustomizations}
					setBoardCustomizations={setBoardCustomizations}
					imageModal={imageModal}
					setImageModal={setImageModal}
					showTemplateModal={showTemplateModal}
					setShowTemplateModal={setShowTemplateModal}
					userTemplates={userTemplates}
					loadingTemplates={loadingTemplates}
					applyTemplate={applyTemplate}
				/>

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
				{/* <motion.div 
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
				</motion.div> */}

				{/* Game Board */}
				<GameBoard
					categories={categories}
					boardCustomizations={boardCustomizations}
					setCategories={setCategories}
					onQuestionClick={openQuestionEditor}
					onAddQuestion={addQuestion}
					onUpdateCategory={updateCategory}
				/>
			</motion.div>

			{/* Image Upload Modal */}
			<ImageUploadModal
				isOpen={imageModal.isOpen}
				onClose={() => setImageModal({ isOpen: false, type: null, currentValue: '' })}
				imageModal={imageModal}
				setImageModal={setImageModal}
				onSaveImage={(type, value) => {
					if (type === 'display') {
						setDisplayImage(value);
					} else if (type === 'board') {
						setBoardBackground(value);
						// Automatically set tile opacity to 50% when board background is set
						if (value.trim() !== '') {
							setBoardCustomizations(prev => ({
								...prev,
								colors: { ...prev.colors, tileOpacity: 50 }
							}));
						}
					} else if (type === 'defaultTile') {
						setBoardCustomizations(prev => ({
							...prev,
							colors: { ...prev.colors, defaultTileImage: value }
						}));
					} else if (type === 'categoryImage') {
						setBoardCustomizations(prev => ({
							...prev,
							colors: { ...prev.colors, categoryBackgroundImage: value }
						}));
					}
				}}
			/>

		{/* Question Editor Modal */}
		<QuestionEditorModal
			isOpen={!!editingQuestion}
			onClose={() => setEditingQuestion(null)}
			editingQuestion={editingQuestion}
			updateQuestion={updateQuestion}
		/>

			{/* Reset Confirmation Modal */}
			<ResetConfirmationModal
				isOpen={showResetModal}
				onClose={() => setShowResetModal(false)}
				onConfirm={resetGame}
			/>

			{/* Template Modals */}
			<TemplateModals
				showTemplateModal={showTemplateModal}
				setShowTemplateModal={setShowTemplateModal}
				showTemplateSuccessModal={showTemplateSuccessModal}
				setShowTemplateSuccessModal={setShowTemplateSuccessModal}
				templateSaveError={templateSaveError}
				setTemplateSaveError={setTemplateSaveError}
				templateForm={templateForm}
				setTemplateForm={setTemplateForm}
				templateSaving={templateSaving}
				saveAsTemplate={saveAsTemplate}
			/>
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
