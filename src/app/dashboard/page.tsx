'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import ShareModal from '@/components/ShareModal';
import TemplateShareModal from '@/components/TemplateShareModal';
import DashboardSearch, { SearchFilters } from '@/components/DashboardSearch';
import AdvancedSearch from '@/components/AdvancedSearch';
import Modal from '@/components/Modal';
import { getApiUrl } from '@/lib/config';
import { trackGamePlay, trackSearch } from '@/lib/analytics';

// Import our new modular components
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MySetsTab from '@/components/dashboard/MySetsTab';
import {
	SavedGame,
	SidebarItem,
	PublicGame,
	MarketFilters,
} from '@/components/dashboard/types';

// Template types
interface Template {
	id: string;
	title: string;
	description: string;
	type: 'JEOPARDY' | 'QUIZ' | 'WORD_GAME';
	data: Record<string, unknown>;
	previewImage?: string;
	tags: string[];
	difficulty?: string;
	gradeLevel?: string;
	subject?: string;
	templateDownloads?: Array<unknown>;
	downloads: number;
	rating: number;
	ratingCount: number;
	isFeatured: boolean;
	isPublic: boolean;
	createdAt: string;
	author: {
		id: string;
		name: string;
		username?: string;
	};
}

// Game completion validation
const isGameComplete = (gameData: Record<string, unknown>): boolean => {
	if (!gameData || !gameData.categories) return false;

	const categories = gameData.categories as Array<{
		name?: string;
		questions?: Array<{ question?: string; answer?: string }>;
	}>;

	// Check if all categories are named and have questions
	for (const category of categories) {
		if (!category.name || category.name.trim() === '') return false;

		if (!category.questions || category.questions.length === 0)
			return false;

		// Check if all questions have both question and answer
		for (const question of category.questions) {
			if (
				!question.question ||
				question.question.trim() === '' ||
				!question.answer ||
				question.answer.trim() === ''
			) {
				return false;
			}
		}
	}

	return true;
};

import TemplateService from '@/lib/services/templateService';

export default function Dashboard() {
	return (
		<Suspense
			fallback={
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				</div>
			}
		>
			<DashboardContent />
		</Suspense>
	);
}

function DashboardContent() {
	const { user, loading } = useAuthGuard();
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	// Get tab from URL parameters, default to 'play'
	const [activeTab, setActiveTab] = useState(() => {
		const urlTab = searchParams.get('tab');
		return [
			'play',
			'discover',
			'market',
			'stats',
			'my-sets',
			'my-templates',
			'saved',
		].includes(urlTab || '')
			? (urlTab as string)
			: 'play';
	});

	const [games, setGames] = useState<SavedGame[]>([]);
	const [publicGames, setPublicGames] = useState<PublicGame[]>([]);
	const [loadingGames, setLoadingGames] = useState(true);
	const [loadingPublicGames, setLoadingPublicGames] = useState(false);
	const [marketFilters, setMarketFilters] = useState<MarketFilters>({
		subject: '',
		gradeLevel: '',
		difficulty: '',
		sortBy: 'newest',
	});

	// Advanced search states
	const [discoverSelectedTags, setDiscoverSelectedTags] = useState<string[]>(
		[]
	);
	const [discoverSearchTerm, setDiscoverSearchTerm] = useState('');
	const [marketSelectedTags, setMarketSelectedTags] = useState<string[]>([]);
	const [marketSearchTerm, setMarketSearchTerm] = useState('');
	const [gameSearchFilters, setGameSearchFilters] = useState<SearchFilters>({
		searchTerm: '',
		tags: [],
		subject: '',
		gradeLevel: '',
		difficulty: '',
	});
	const [templateSearchFilters, setTemplateSearchFilters] =
		useState<SearchFilters>({
			searchTerm: '',
			tags: [],
			subject: '',
			gradeLevel: '',
			difficulty: '',
		});
	const [shareModalGame, setShareModalGame] = useState<SavedGame | null>(
		null
	);
	const [templateShareModal, setTemplateShareModal] =
		useState<Template | null>(null);
	const [selectedGameInfo, setSelectedGameInfo] = useState<SavedGame | null>(
		null
	);

	const [savedGames, setSavedGames] = useState<PublicGame[]>([]);
	const [templates, setTemplates] = useState<Template[]>([]);
	const [loadingTemplates, setLoadingTemplates] = useState(false);
	const [myTemplates, setMyTemplates] = useState<Template[]>([]);
	const [loadingMyTemplates, setLoadingMyTemplates] = useState(false);
	const [showIncompleteGames, setShowIncompleteGames] = useState(false);
	const [openTemplateDropdown, setOpenTemplateDropdown] = useState<
		string | null
	>(null);
	const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
		isOpen: boolean;
		templateId: string;
		templateTitle: string;
	}>({
		isOpen: false,
		templateId: '',
		templateTitle: '',
	});
	const [gameDeleteConfirmModal, setGameDeleteConfirmModal] = useState<{
		isOpen: boolean;
		gameId: string;
		gameTitle: string;
	}>({
		isOpen: false,
		gameId: '',
		gameTitle: '',
	});
	const [downloadedTemplateIds, setDownloadedTemplateIds] = useState<
		Set<string>
	>(new Set());
	const [downloadingTemplateId, setDownloadingTemplateId] = useState<
		string | null
	>(null);
	const [templateUseModal, setTemplateUseModal] = useState<{
		isOpen: boolean;
		template: Template | null;
	}>({
		isOpen: false,
		template: null,
	});
	// Loading states
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [saveLoadingId, setSaveLoadingId] = useState<string | null>(null);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	// Function to handle tab navigation
	const handleTabChange = (tabId: string) => {
		setActiveTab(tabId);
		// Update URL without page reload
		const newUrl = `${pathname}?tab=${tabId}`;
		window.history.pushState({}, '', newUrl);
	};

	// Search and filtering functions
	const filterGamesBySearch = (
		games: PublicGame[],
		searchTerm: string,
		selectedTags: string[]
	) => {
		if (!searchTerm && selectedTags.length === 0) return games;

		return games
			.filter((game) => {
				// Search term filtering (check title, description, and tags)
				const matchesSearch =
					!searchTerm ||
					game.title
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					(game.description &&
						game.description
							.toLowerCase()
							.includes(searchTerm.toLowerCase())) ||
					(game.tags &&
						game.tags.some((gameTag: string) =>
							gameTag
								.toLowerCase()
								.includes(searchTerm.toLowerCase())
						));

				// Tag filtering (AND logic - must have ALL selected tags)
				const matchesTags =
					selectedTags.length === 0 ||
					(game.tags &&
						selectedTags.every((tag) =>
							game.tags.some(
								(gameTag: string) =>
									gameTag.toLowerCase() === tag.toLowerCase()
							)
						));

				return matchesSearch && matchesTags;
			})
			.sort((a, b) => {
				// Prioritize exact matches in title
				if (searchTerm) {
					const aExactMatch = a.title
						.toLowerCase()
						.includes(searchTerm.toLowerCase());
					const bExactMatch = b.title
						.toLowerCase()
						.includes(searchTerm.toLowerCase());

					if (aExactMatch && !bExactMatch) return -1;
					if (!aExactMatch && bExactMatch) return 1;

					// If both have exact matches, check if one starts with the search term
					const aStartsWithSearch = a.title
						.toLowerCase()
						.startsWith(searchTerm.toLowerCase());
					const bStartsWithSearch = b.title
						.toLowerCase()
						.startsWith(searchTerm.toLowerCase());

					if (aStartsWithSearch && !bStartsWithSearch) return -1;
					if (!aStartsWithSearch && bStartsWithSearch) return 1;
				}

				return 0; // Keep original order for equal matches
			});
	};

	const filterTemplatesBySearch = (
		templates: Template[],
		searchTerm: string,
		selectedTags: string[]
	) => {
		if (!searchTerm && selectedTags.length === 0) return templates;

		return templates
			.filter((template) => {
				// Search term filtering (check title, description, and tags)
				const matchesSearch =
					!searchTerm ||
					template.title
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					(template.description &&
						template.description
							.toLowerCase()
							.includes(searchTerm.toLowerCase())) ||
					(template.tags &&
						template.tags.some((templateTag: string) =>
							templateTag
								.toLowerCase()
								.includes(searchTerm.toLowerCase())
						));

				// Tag filtering (AND logic - must have ALL selected tags)
				const matchesTags =
					selectedTags.length === 0 ||
					(template.tags &&
						selectedTags.every((tag) =>
							template.tags.some(
								(templateTag: string) =>
									templateTag.toLowerCase() ===
									tag.toLowerCase()
							)
						));

				return matchesSearch && matchesTags;
			})
			.sort((a, b) => {
				// Prioritize exact matches in title
				if (searchTerm) {
					const aExactMatch = a.title
						.toLowerCase()
						.includes(searchTerm.toLowerCase());
					const bExactMatch = b.title
						.toLowerCase()
						.includes(searchTerm.toLowerCase());

					if (aExactMatch && !bExactMatch) return -1;
					if (!aExactMatch && bExactMatch) return 1;

					// If both have exact matches, check if one starts with the search term
					const aStartsWithSearch = a.title
						.toLowerCase()
						.startsWith(searchTerm.toLowerCase());
					const bStartsWithSearch = b.title
						.toLowerCase()
						.startsWith(searchTerm.toLowerCase());

					if (aStartsWithSearch && !bStartsWithSearch) return -1;
					if (!aStartsWithSearch && bStartsWithSearch) return 1;
				}

				return 0; // Keep original order for equal matches
			});
	};

	// Get filtered data
	const filteredPublicGames = filterGamesBySearch(
		publicGames,
		discoverSearchTerm,
		discoverSelectedTags
	);
	const filteredMarketTemplates = filterTemplatesBySearch(
		templates,
		marketSearchTerm,
		marketSelectedTags
	);

	// Listen for URL changes (browser back/forward)
	useEffect(() => {
		const handlePopState = () => {
			const urlParams = new URLSearchParams(window.location.search);
			const urlTab = urlParams.get('tab');
			if (
				urlTab &&
				[
					'play',
					'stats',
					'market',
					'discover',
					'my-sets',
					'my-templates',
					'saved',
				].includes(urlTab)
			) {
				setActiveTab(urlTab);
			}
		};

		window.addEventListener('popstate', handlePopState);
		return () => window.removeEventListener('popstate', handlePopState);
	}, []);

	// Load user's games
	const loadGames = useCallback(async () => {
		if (!user) return;

		try {
			const response = await fetch(getApiUrl('/api/games'));
			if (response.ok) {
				const data = await response.json();
				setGames(data.games || []);
			}
		} catch (error) {
			console.error('Error loading games:', error);
		} finally {
			setLoadingGames(false);
		}
	}, [user]);

	useEffect(() => {
		if (user && !loading) {
			loadGames();
		}
	}, [user, loading, loadGames]);

	// Load public games for discover tab
	useEffect(() => {
		const loadPublicGames = async () => {
			if (activeTab === 'discover') {
				setLoadingPublicGames(true);
				try {
					const response = await fetch('/api/games/public');
					if (response.ok) {
						const data = await response.json();
						setPublicGames(data.games || []); // Extract games from response
					}
				} catch (error) {
					console.error('Error loading public games:', error);
				} finally {
					setLoadingPublicGames(false);
				}
			}
		};

		loadPublicGames();
	}, [activeTab, user]);

	// Load saved games for saved tab and to check saved status in discover tab
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

	// Load templates for market tab
	useEffect(() => {
		const loadTemplates = async () => {
			if (activeTab === 'market') {
				setLoadingTemplates(true);
				try {
					const response = await fetch('/api/templates');
					if (response.ok) {
						const data = await response.json();
						setTemplates(data.templates || []);
					}
				} catch (error) {
					console.error('Error loading templates:', error);
				} finally {
					setLoadingTemplates(false);
				}
			}
		};

		loadTemplates();
	}, [activeTab, user]);

	// Load user's templates for my-templates tab
	useEffect(() => {
		const loadMyTemplates = async () => {
			if (activeTab === 'my-templates') {
				setLoadingMyTemplates(true);
				try {
					const response = await fetch('/api/templates/my');
					if (response.ok) {
						const data = await response.json();
						setMyTemplates(data.templates || []);
					}
				} catch (error) {
					console.error('Error loading my templates:', error);
				} finally {
					setLoadingMyTemplates(false);
				}
			}
		};

		loadMyTemplates();
	}, [activeTab, user]);

	// Handle game actions
	const handleEditGame = (game: SavedGame) => {
		router.push(`/create/question-set?edit=${game.id}`);
	};

	const handleShareGame = (game: SavedGame) => {
		setShareModalGame(game);
	};

	const handleGameInfo = (game: SavedGame) => {
		setSelectedGameInfo(game);
	};

	const handlePlayGame = (game: SavedGame) => {
		trackGamePlay(game.id, game.data.gameTitle);
	};

	const handleFavoriteGame = async (gameId: string) => {
		// Set loading state
		setSaveLoadingId(gameId);

		try {
			const savedGame = savedGames?.find((g) => g.id === gameId);
			if (savedGame) {
				// Unsave game
				const response = await fetch(`/api/games/saved/${gameId}`, {
					method: 'DELETE',
				});
				if (response.ok) {
					setSavedGames(
						(prev) => prev?.filter((g) => g.id !== gameId) || []
					);
				}
			} else {
				// Save game
				const response = await fetch(`/api/games/saved/${gameId}`, {
					method: 'POST',
				});
				if (response.ok) {
					// Add to saved games
					const gameToSave = publicGames?.find(
						(g) => g.id === gameId
					);
					if (gameToSave) {
						setSavedGames((prev) => [...(prev || []), gameToSave]);
					}
				}
			}
		} catch (error) {
			console.error('Error toggling saved game:', error);
		} finally {
			setSaveLoadingId(null);
		}
	};

	// Filter functions for games and templates
	const filterGames = (
		games: SavedGame[],
		filters: SearchFilters
	): SavedGame[] => {
		return games.filter((game) => {
			// Search term filter
			if (filters.searchTerm) {
				const searchLower = filters.searchTerm.toLowerCase();
				const matchesTitle = game.title
					.toLowerCase()
					.includes(searchLower);
				const matchesDescription = game.description
					?.toLowerCase()
					.includes(searchLower);
				const matchesTags = game.tags?.some((tag) =>
					tag.toLowerCase().includes(searchLower)
				);

				if (!matchesTitle && !matchesDescription && !matchesTags) {
					return false;
				}
			}

			// Tags filter (all selected tags must be present)
			if (filters.tags.length > 0) {
				const gameTags = game.tags || [];
				const hasAllTags = filters.tags.every((filterTag) =>
					gameTags.some((gameTag) =>
						gameTag.toLowerCase().includes(filterTag.toLowerCase())
					)
				);
				if (!hasAllTags) return false;
			}

			// Note: SavedGame doesn't have subject, gradeLevel, difficulty properties
			// These filters are only available for PublicGame in the market

			return true;
		});
	};

	const filterTemplates = (
		templates: Template[],
		filters: SearchFilters
	): Template[] => {
		return templates.filter((template) => {
			// Search term filter
			if (filters.searchTerm) {
				const searchLower = filters.searchTerm.toLowerCase();
				const matchesTitle = template.title
					.toLowerCase()
					.includes(searchLower);
				const matchesDescription = template.description
					?.toLowerCase()
					.includes(searchLower);
				const matchesTags = template.tags?.some((tag) =>
					tag.toLowerCase().includes(searchLower)
				);

				if (!matchesTitle && !matchesDescription && !matchesTags) {
					return false;
				}
			}

			// Tags filter (all selected tags must be present)
			if (filters.tags.length > 0) {
				const templateTags = template.tags || [];
				const hasAllTags = filters.tags.every((filterTag) =>
					templateTags.some((templateTag) =>
						templateTag
							.toLowerCase()
							.includes(filterTag.toLowerCase())
					)
				);
				if (!hasAllTags) return false;
			}

			// Subject filter
			if (filters.subject && template.subject !== filters.subject) {
				return false;
			}

			// Grade level filter
			if (
				filters.gradeLevel &&
				template.gradeLevel !== filters.gradeLevel
			) {
				return false;
			}

			// Difficulty filter
			if (
				filters.difficulty &&
				template.difficulty !== filters.difficulty
			) {
				return false;
			}

			return true;
		});
	};

	// Get filtered data
	const filteredGames = filterGames(games, gameSearchFilters);
	const filteredTemplates = filterTemplates(
		myTemplates,
		templateSearchFilters
	);

	// Search functionality (currently unused but kept for future implementation)
	// const handleSearch = (searchTerm: string) => {
	// 	setMarketSearch(searchTerm);
	// 	if (searchTerm) {
	// 		trackSearch(searchTerm);
	// 	}
	// };

	// Filter functionality (currently unused but kept for future implementation)
	// const handleFilterChange = (filterType: keyof MarketFilters, value: string) => {
	// 	setMarketFilters(prev => ({
	// 		...prev,
	// 		[filterType]: value
	// 	}));
	// };

	// Template dropdown management
	const toggleTemplateDropdown = (templateId: string) => {
		setOpenTemplateDropdown(
			openTemplateDropdown === templateId ? null : templateId
		);
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				openTemplateDropdown &&
				!(event.target as Element)?.closest('.template-dropdown')
			) {
				setOpenTemplateDropdown(null);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, [openTemplateDropdown]);

	// Template actions
	const handleShareTemplate = (templateId: string) => {
		const template = myTemplates.find((t) => t.id === templateId);
		if (template) {
			setTemplateShareModal(template);
			setOpenTemplateDropdown(null);
		}
	};

	const handleTemplateShareSuccess = async () => {
		// Refresh the templates list after sharing
		try {
			const refreshResponse = await fetch('/api/templates/my');
			if (refreshResponse.ok) {
				const data = await refreshResponse.json();
				setMyTemplates(data.templates || []);
			}
		} catch (error) {
			console.error('Error refreshing templates:', error);
		}
	};

	const handleDeleteTemplate = async (templateId: string) => {
		const template = myTemplates.find((t) => t.id === templateId);
		if (!template) return;

		setDeleteConfirmModal({
			isOpen: true,
			templateId: templateId,
			templateTitle: template.title,
		});
		setOpenTemplateDropdown(null);
	};

	// Check if template is layout-only (no visual customizations)
	const isLayoutOnlyTemplate = (template: Template) => {
		// Check if template has tags indicating layout type
		if (
			template.tags &&
			(template.tags.includes('layout-only') ||
				template.tags.includes('template-type-layout'))
		) {
			return true;
		}

		// Check template data for visual customizations
		if (template.data) {
			const templateData = template.data as {
				displayImage?: string;
				boardBackground?: string;
				boardCustomizations?: {
					colors: {
						categoryBackground: string;
						categoryTextColor: string;
						tileBackground: string;
					};
				};
			};

			const hasDisplayImage = templateData.displayImage;
			const hasBoardBackground = templateData.boardBackground;
			const hasCustomColors =
				templateData.boardCustomizations &&
				(templateData.boardCustomizations.colors.categoryBackground !==
					'#3B82F6' ||
					templateData.boardCustomizations.colors
						.categoryTextColor !== '#FFFFFF' ||
					templateData.boardCustomizations.colors.tileBackground !==
						'#1E40AF');

			// If no visual customizations, consider it layout-only
			return !hasDisplayImage && !hasBoardBackground && !hasCustomColors;
		}

		return false;
	};

	const confirmDeleteTemplate = async () => {
		// Set loading state
		setDeleteLoading(true);

		try {
			const response = await fetch(
				`/api/templates/${deleteConfirmModal.templateId}`,
				{
					method: 'DELETE',
				}
			);

			if (response.ok) {
				// Remove from local state
				setMyTemplates((prev) =>
					prev.filter((t) => t.id !== deleteConfirmModal.templateId)
				);
			}
		} catch (error) {
			console.error('Error deleting template:', error);
		} finally {
			setDeleteLoading(false);
			setDeleteConfirmModal({
				isOpen: false,
				templateId: '',
				templateTitle: '',
			});
		}
	};

	const handleDeleteGame = async (game: SavedGame) => {
		setGameDeleteConfirmModal({
			isOpen: true,
			gameId: game.id,
			gameTitle: game.data.gameTitle || game.title || 'Untitled Game',
		});
	};

	const confirmDeleteGame = async () => {
		// Set loading state
		setDeleteLoading(true);

		try {
			const response = await fetch(
				`/api/games/${gameDeleteConfirmModal.gameId}`,
				{
					method: 'DELETE',
				}
			);

			if (response.ok) {
				// Remove from local state
				setGames((prev) =>
					prev.filter((g) => g.id !== gameDeleteConfirmModal.gameId)
				);
			}
		} catch (error) {
			console.error('Error deleting game:', error);
		} finally {
			setDeleteLoading(false);
			setGameDeleteConfirmModal({
				isOpen: false,
				gameId: '',
				gameTitle: '',
			});
		}
	};

	// Template download functionality
	const downloadTemplate = async (templateId: string) => {
		setDownloadingTemplateId(templateId);
		try {
			const response = await fetch(`/api/templates/download`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ templateId }),
			});

			if (response.ok) {
				setDownloadedTemplateIds(
					(prev) => new Set([...prev, templateId])
				);
				// Refresh my templates to show the newly downloaded template
				if (activeTab === 'my-templates' || myTemplates) {
					const myTemplatesResponse = await fetch(
						'/api/templates/my'
					);
					if (myTemplatesResponse.ok) {
						const data = await myTemplatesResponse.json();
						setMyTemplates(data.templates || []);
					}
				}
			}
		} catch (error) {
			console.error('Error downloading template:', error);
		} finally {
			setDownloadingTemplateId(null);
		}
	};

	// Check if template is downloaded (check if it exists in myTemplates with templateDownloads)
	const isTemplateDownloaded = (templateId: string) => {
		// First check our local downloaded set for immediate feedback
		if (downloadedTemplateIds.has(templateId)) {
			return true;
		}
		// Then check if it exists in myTemplates with download data
		return (
			myTemplates?.some(
				(template) =>
					template.id === templateId &&
					template.templateDownloads &&
					template.templateDownloads.length > 0
			) || false
		);
	};

	// Handle template use (opens confirmation modal)
	const handleUseTemplate = (template: Template) => {
		setTemplateUseModal({ isOpen: true, template });
	};

	// Load downloaded templates on mount
	useEffect(() => {
		if (!user) return;

		// We'll get downloaded templates from the my-templates endpoint now
		// So we can remove this separate call and rely on myTemplates data
		// The isTemplateDownloaded function will check myTemplates instead
	}, [user]);

	// Sidebar configuration
	const sidebarItems: SidebarItem[] = [
		{
			id: 'play',
			label: 'Play Games',
			icon: (
				<svg
					className="w-5 h-5"
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path d="M8 5v14l11-7z" />
				</svg>
			),
			bgColor: activeTab === 'play' ? 'bg-blue-500' : 'bg-gray-100',
			textColor: activeTab === 'play' ? 'text-white' : 'text-gray-700',
		},
		{
			id: 'discover',
			label: 'Discover',
			icon: (
				<svg
					className="w-5 h-5"
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
				</svg>
			),
			bgColor: activeTab === 'discover' ? 'bg-blue-500' : 'bg-gray-100',
			textColor:
				activeTab === 'discover' ? 'text-white' : 'text-gray-700',
		},
		{
			id: 'market',
			label: 'Market',
			icon: (
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
						d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"
					/>
				</svg>
			),
			bgColor: activeTab === 'market' ? 'bg-blue-500' : 'bg-gray-100',
			textColor: activeTab === 'market' ? 'text-white' : 'text-gray-700',
		},
		{
			id: 'stats',
			label: 'Statistics',
			icon: (
				<svg
					className="w-5 h-5"
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
				</svg>
			),
			bgColor: activeTab === 'stats' ? 'bg-blue-500' : 'bg-gray-100',
			textColor: activeTab === 'stats' ? 'text-white' : 'text-gray-700',
		},
		{
			id: 'my-sets',
			label: 'My Sets',
			icon: (
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
						d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0H8v0z"
					/>
				</svg>
			),
			bgColor: activeTab === 'my-sets' ? 'bg-blue-500' : 'bg-gray-100',
			textColor: activeTab === 'my-sets' ? 'text-white' : 'text-gray-700',
		},
		{
			id: 'my-templates',
			label: 'My Templates',
			icon: (
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
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
			),
			bgColor:
				activeTab === 'my-templates' ? 'bg-blue-500' : 'bg-gray-100',
			textColor:
				activeTab === 'my-templates' ? 'text-white' : 'text-gray-700',
		},
		{
			id: 'saved',
			label: 'Saved Games',
			icon: (
				<svg
					className="w-5 h-5"
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
				</svg>
			),
			bgColor: activeTab === 'saved' ? 'bg-blue-500' : 'bg-gray-100',
			textColor: activeTab === 'saved' ? 'text-white' : 'text-gray-700',
		},
	];

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
			{/* Sidebar */}
			<DashboardSidebar
				sidebarOpen={sidebarOpen}
				setSidebarOpen={setSidebarOpen}
				sidebarItems={sidebarItems}
				activeTab={activeTab}
				onTabChange={handleTabChange}
			/>

			{/* Main Content */}
			<div className="flex-1 min-w-0">
				{/* Header */}
				<DashboardHeader
					activeTab={activeTab}
					sidebarOpen={sidebarOpen}
					setSidebarOpen={setSidebarOpen}
				/>

				{/* Content Area */}
				<div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50/30 to-indigo-100/30 min-h-screen">
					<div className="max-w-7xl mx-auto">
						{/* My Sets Tab */}
						{activeTab === 'my-sets' && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.2 }}
								className="space-y-6"
							>
								<div className="flex justify-between items-center">
									<h2 className="text-2xl font-bold text-gray-900">
										My Games
									</h2>
								</div>

								{/* Search Component */}
								<DashboardSearch
									onFiltersChange={setGameSearchFilters}
									placeholder="Search your games..."
									showTagFilter={true}
									initialFilters={gameSearchFilters}
								/>

								<MySetsTab
									games={filteredGames}
									loadingGames={loadingGames}
									onEditGame={handleEditGame}
									onShareGame={handleShareGame}
									onGameInfo={handleGameInfo}
									onPlayGame={handlePlayGame}
									onDeleteGame={handleDeleteGame}
								/>
							</motion.div>
						)}

						{/* Other tabs - Placeholder content for now */}
						{/* Play Tab */}
						{activeTab === 'play' && (
							<div className="space-y-6">
								{/* Play Tab Header with Toggle */}
								<div className="flex justify-between items-center">
									<h2 className="text-2xl font-bold text-gray-900">
										Play Your Games
									</h2>
									<div className="flex items-center space-x-2">
										<label
											htmlFor="show-incomplete"
											className="text-sm font-medium text-gray-700"
										>
											Show incomplete games
										</label>
										<button
											id="show-incomplete"
											className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
												showIncompleteGames
													? 'bg-blue-600'
													: 'bg-gray-200'
											}`}
											onClick={() =>
												setShowIncompleteGames(
													!showIncompleteGames
												)
											}
										>
											<span
												className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
													showIncompleteGames
														? 'translate-x-6'
														: 'translate-x-1'
												}`}
											/>
										</button>
									</div>
								</div>

								{games && games.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{games
											.filter((game) => {
												const isComplete =
													isGameComplete(game.data);
												return showIncompleteGames
													? !isComplete
													: isComplete;
											})
											.map((game) => (
												<motion.div
													key={game.id}
													className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
													initial={{
														opacity: 0,
														y: 20,
													}}
													animate={{
														opacity: 1,
														y: 0,
													}}
												>
													{/* Display Image */}
													<div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg overflow-hidden">
														{game.data
															.displayImage ? (
															<img
																src={
																	game.data
																		.displayImage
																}
																alt={
																	game.data
																		.gameTitle
																}
																className="w-full h-full object-cover"
															/>
														) : (
															<div className="w-full h-full flex items-center justify-center">
																<div className="text-6xl opacity-50">
																	🎮
																</div>
															</div>
														)}
													</div>
													<div className="p-4">
														<h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
															{
																game.data
																	.gameTitle
															}
														</h3>
														<p className="text-sm text-gray-600 mb-4 line-clamp-2">
															{game.description ||
																'No description available'}
														</p>

														<div className="flex items-center justify-between text-sm text-gray-500 mb-4">
															<span className="flex items-center">
																<svg
																	className="w-4 h-4 mr-1"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={
																			2
																		}
																		d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
																	/>
																</svg>
																Published
															</span>
															<span className="text-green-600 font-medium">
																Ready to Play
															</span>
														</div>

														<Link
															href={`/play/${game.id}/setup`}
															className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 text-center"
														>
															Start Game
														</Link>
													</div>
												</motion.div>
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
												d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<h3 className="text-lg font-medium text-gray-900 mb-2">
											{showIncompleteGames
												? 'No Incomplete Games'
												: 'No Complete Games to Play'}
										</h3>
										<p className="text-gray-600 mb-4">
											{showIncompleteGames
												? 'All your games are complete and ready to play!'
												: 'Complete your games by filling out all categories and questions to make them playable.'}
										</p>
										<Link
											href="#"
											onClick={() =>
												setActiveTab('my-sets')
											}
											className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
										>
											Go to My Sets
										</Link>
									</div>
								)}
							</div>
						)}

						{activeTab === 'stats' && (
							<div className="text-center py-16">
								<h2 className="text-2xl font-bold text-gray-900 mb-4">
									Statistics
								</h2>
								<p className="text-gray-600">
									Statistics feature coming soon!
								</p>
							</div>
						)}

						{activeTab === 'market' && (
							<div className="space-y-6">
								<div className="flex justify-between items-center">
									<h2 className="text-2xl font-bold text-gray-900">
										Game Templates Market
									</h2>
								</div>

								{/* Advanced Search */}
								<div className="mb-6">
									<AdvancedSearch
										onSearchChange={setMarketSearchTerm}
										onSearch={(searchTerm) => {
											setMarketSearchTerm(searchTerm);
											if (searchTerm.length > 2) {
												setTimeout(
													() =>
														trackSearch(searchTerm),
													1000
												);
											}
										}}
										onTagsChange={setMarketSelectedTags}
										selectedTags={marketSelectedTags}
										placeholder="Search templates in marketplace..."
									/>
								</div>

								{loadingTemplates ? (
									<div className="flex items-center justify-center py-16">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
									</div>
								) : filteredMarketTemplates.length > 0 ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
										{filteredMarketTemplates.map(
											(template) => (
												<motion.div
													key={template.id}
													className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
												>
													<div className="p-4 sm:p-6 h-full flex flex-col justify-between relative">
														{/* Preview Image */}
														<div className="w-full h-24 sm:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-3 sm:mb-4 overflow-hidden">
															{template.previewImage ? (
																<img
																	src={
																		template.previewImage
																	}
																	alt={
																		template.title
																	}
																	className="w-full h-full object-cover"
																/>
															) : (
																<div className="w-full h-full flex items-center justify-center">
																	<div className="text-2xl sm:text-4xl opacity-50">
																		📄
																	</div>
																</div>
															)}
														</div>

														<div className="flex items-start justify-between mb-2">
															<h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base flex-1">
																{template.title}
															</h3>
															{template.isFeatured && (
																<div className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0">
																	⭐ Featured
																</div>
															)}
														</div>

														{template.description ? (
															<p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
																{
																	template.description
																}
															</p>
														) : (
															<p className="text-xs sm:text-sm text-gray-500 mb-3 line-clamp-2 italic">
																(Description not
																provided)
															</p>
														)}

														{/* <span>⭐ {template.rating.toFixed(1)} ({template.ratingCount})</span> */}
														<div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
															<span className="truncate">
																By{' '}
																{
																	template
																		.author
																		.name
																}
															</span>
															<div className="flex items-center space-x-2">
																<span className="text-green-600 font-medium">
																	Free
																</span>
															</div>
														</div>

														<div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-2">
															<div className="relative flex-1">
																<motion.button
																	whileHover={{
																		scale: 1.05,
																	}}
																	whileTap={{
																		scale: 0.95,
																	}}
																	onClick={() => {
																		if (
																			isTemplateDownloaded(
																				template.id
																			)
																		) {
																			handleUseTemplate(
																				template
																			);
																		} else {
																			downloadTemplate(
																				template.id
																			);
																		}
																	}}
																	disabled={
																		downloadingTemplateId ===
																		template.id
																	}
																	className={`w-full py-3 sm:py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 min-h-[44px] sm:min-h-[40px] ${
																		downloadingTemplateId ===
																		template.id
																			? 'bg-blue-500 text-white opacity-50 cursor-not-allowed'
																			: isTemplateDownloaded(
																					template.id
																			  )
																			? 'bg-green-500 hover:bg-green-600 text-white'
																			: 'bg-blue-500 hover:bg-blue-600 text-white'
																	}`}
																>
																	{downloadingTemplateId ===
																	template.id ? (
																		<>
																			<motion.div
																				animate={{
																					rotate: 360,
																				}}
																				transition={{
																					duration: 1,
																					repeat: Infinity,
																					ease: 'linear',
																				}}
																				className="w-4 h-4"
																			>
																				<svg
																					className="w-4 h-4"
																					fill="currentColor"
																					viewBox="0 0 24 24"
																				>
																					<path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
																				</svg>
																			</motion.div>
																			<span>
																				Downloading...
																			</span>
																		</>
																	) : isTemplateDownloaded(
																			template.id
																	  ) ? (
																		<>
																			<svg
																				className="w-4 h-4"
																				fill="none"
																				stroke="currentColor"
																				viewBox="0 0 24 24"
																				strokeWidth={
																					2
																				}
																			>
																				<path
																					strokeLinecap="round"
																					strokeLinejoin="round"
																					d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
																				/>
																			</svg>
																			<span>
																				Use
																				Template
																			</span>
																		</>
																	) : (
																		<>
																			<svg
																				className="w-4 h-4"
																				fill="none"
																				stroke="currentColor"
																				viewBox="0 0 24 24"
																				strokeWidth={
																					2
																				}
																			>
																				<path
																					strokeLinecap="round"
																					strokeLinejoin="round"
																					d="M12 3v13m0 0l-4-4m4 4l4-4M5 21h14"
																				/>
																			</svg>
																			<span>
																				Download
																			</span>
																		</>
																	)}
																</motion.button>

																{/* Downloads Badge - Positioned on top right of button */}
																<div className="absolute -top-3 -right-2 z-10">
																	<motion.div
																		className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs flex items-center shadow-lg transform rotate-[15deg]"
																		whileHover={{
																			scale: 1.1,
																			rotate: 30,
																		}}
																		transition={{
																			duration: 0.2,
																		}}
																	>
																		{/* <span className="mr-1">📥</span> */}
																		<span className="font-semibold">
																			{
																				template.downloads
																			}
																		</span>
																	</motion.div>
																</div>
															</div>
														</div>
													</div>
												</motion.div>
											)
										)}
									</div>
								) : (
									<div className="text-center py-16">
										<div className="max-w-md mx-auto">
											<div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
												<svg
													className="w-10 h-10 text-gray-400"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
													/>
												</svg>
											</div>
											<h3 className="text-xl font-semibold text-gray-900 mb-3">
												{templates.length === 0
													? 'No templates yet'
													: 'No templates found'}
											</h3>
											<p className="text-gray-600">
												{templates.length === 0
													? 'Templates will appear here when they become available. Create your own to share with the community!'
													: 'Try adjusting your search or filters to find templates.'}
											</p>
										</div>
									</div>
								)}
							</div>
						)}

						{activeTab === 'discover' && (
							<div>
								{/* Advanced Search */}
								<div className="mb-6">
									<AdvancedSearch
										onSearchChange={setDiscoverSearchTerm}
										onSearch={(searchTerm) => {
											setDiscoverSearchTerm(searchTerm);
											if (searchTerm.length > 2) {
												setTimeout(
													() =>
														trackSearch(searchTerm),
													1000
												);
											}
										}}
										onTagsChange={setDiscoverSelectedTags}
										selectedTags={discoverSelectedTags}
										placeholder="Search games to discover..."
									/>
								</div>

								{/* Games Grid */}
								{loadingPublicGames ? (
									<div className="flex items-center justify-center py-16">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
									</div>
								) : filteredPublicGames.length > 0 ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
										{filteredPublicGames.map((game) => (
											<motion.div
												key={game.id}
												className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
											>
												<div className="p-4 sm:p-6 h-full flex flex-col justify-between relative">
													{/* Display Image */}
													<div className="w-full h-24 sm:h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg mb-3 sm:mb-4 overflow-hidden">
														{game.data
															?.displayImage ? (
															<img
																src={
																	game.data
																		.displayImage
																}
																alt={game.title}
																className="w-full h-full object-cover"
															/>
														) : (
															<div className="w-full h-full flex items-center justify-center">
																<div className="text-2xl sm:text-4xl opacity-50">
																	🌟
																</div>
															</div>
														)}
													</div>{' '}
													<h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base">
														{game.title}
													</h3>
													{game.description ? (
														<p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
															{game.description}
														</p>
													) : (
														<p className="text-xs sm:text-sm text-gray-500 mb-3 line-clamp-2 italic">
															(Description not
															provided)
														</p>
													)}
													{/* <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
														{game.subject && (
															<span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
																{game.subject}
															</span>
														)}
														{game.gradeLevel && (
															<span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
																{game.gradeLevel}
															</span>
														)}
														{game.difficulty && (
															<span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
																{game.difficulty}
															</span>
														)}
													</div> */}
													<div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
														<span className="truncate">
															By{' '}
															{game.author.name}
														</span>
														{game.avgRating > 0 && (
															<div className="flex items-center">
																<span className="text-gray-400 text-xs">
																	(
																	{
																		game.ratingsCount
																	}{' '}
																	reviews)
																</span>
															</div>
														)}
													</div>
													<div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-2">
														<div className="relative flex-1">
															<motion.button
																onClick={() =>
																	handleFavoriteGame(
																		game.id
																	)
																}
																whileHover={{
																	scale: 1.05,
																}}
																whileTap={{
																	scale: 0.95,
																}}
																animate={{
																	backgroundColor:
																		savedGames.some(
																			(
																				g
																			) =>
																				g.id ===
																				game.id
																		)
																			? '#fef2f2'
																			: '#f3f4f6',
																	color: savedGames.some(
																		(g) =>
																			g.id ===
																			game.id
																	)
																		? '#b91c1c'
																		: '#374151',
																}}
																transition={{
																	duration: 0.2,
																}}
																disabled={
																	saveLoadingId ===
																	game.id
																}
																className={`w-full py-3 sm:py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 border-2 min-h-[44px] sm:min-h-[40px] hover:shadow-sm ${
																	savedGames.some(
																		(g) =>
																			g.id ===
																			game.id
																	)
																		? 'border-red-200 shadow-md'
																		: 'border-gray-200 hover:border-gray-300'
																} ${
																	saveLoadingId ===
																	game.id
																		? 'opacity-75 cursor-not-allowed'
																		: ''
																}`}
															>
																{saveLoadingId ===
																game.id ? (
																	<>
																		<motion.div
																			animate={{
																				rotate: 360,
																			}}
																			transition={{
																				duration: 1,
																				repeat: Infinity,
																				ease: 'linear',
																			}}
																			className="w-4 h-4"
																		>
																			<svg
																				className="w-4 h-4"
																				fill="currentColor"
																				viewBox="0 0 24 24"
																			>
																				<path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
																			</svg>
																		</motion.div>
																		<span className="font-semibold">
																			Saving...
																		</span>
																	</>
																) : (
																	<>
																		<motion.span
																			animate={{
																				scale: savedGames.some(
																					(
																						g
																					) =>
																						g.id ===
																						game.id
																				)
																					? [
																							1,
																							1.2,
																							1,
																					  ]
																					: 1,
																				rotate: savedGames.some(
																					(
																						g
																					) =>
																						g.id ===
																						game.id
																				)
																					? [
																							0,
																							10,
																							-10,
																							0,
																					  ]
																					: 0,
																			}}
																			transition={{
																				duration: 0.3,
																			}}
																		>
																			{savedGames.some(
																				(
																					g
																				) =>
																					g.id ===
																					game.id
																			)
																				? '❤️'
																				: '🤍'}
																		</motion.span>
																		<span className="font-semibold">
																			{savedGames.some(
																				(
																					g
																				) =>
																					g.id ===
																					game.id
																			)
																				? 'Saved!'
																				: 'Save'}
																		</span>
																	</>
																)}
															</motion.button>

															{/* Stats Badges - Positioned on top right of save button */}
															<div className="absolute -top-3 -right-2 flex flex-col space-y-1 z-10">
																<motion.div
																	className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs flex items-center shadow-lg transform rotate-[15deg]"
																	whileHover={{
																		scale: 1.1,
																		rotate: 30,
																	}}
																	transition={{
																		duration: 0.2,
																	}}
																>
																	{/* <span className="mr-1">❤️</span> */}
																	<span className="font-semibold">
																		{
																			game.favoritesCount
																		}
																	</span>
																</motion.div>
																{game.avgRating >
																	0 && (
																	<motion.div
																		className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs flex items-center shadow-lg transform rotate-[15deg] mt-1"
																		whileHover={{
																			scale: 1.1,
																			rotate: 30,
																		}}
																		transition={{
																			duration: 0.2,
																		}}
																	>
																		<span className="mr-1">
																			⭐
																		</span>
																		<span className="font-semibold">
																			{game.avgRating.toFixed(
																				1
																			)}
																		</span>
																	</motion.div>
																)}
															</div>
														</div>
														<Link
															href={`/play/${game.id}/setup`}
															className="flex-1"
														>
															<button
																onClick={() =>
																	trackGamePlay(
																		game.id,
																		game.title
																	)
																}
																className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 sm:py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 min-h-[44px] sm:min-h-[40px]"
															>
																<svg
																	className="w-4 h-4"
																	fill="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path d="M8 5v14l11-7z" />
																</svg>
																<span>
																	Play
																</span>
															</button>
														</Link>
													</div>
												</div>
											</motion.div>
										))}
									</div>
								) : (
									<div className="text-center py-16">
										<div className="max-w-md mx-auto">
											<div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
												<svg
													className="w-12 h-12 text-blue-600"
													fill="currentColor"
													viewBox="0 0 24 24"
												>
													<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
												</svg>
											</div>
											<h3 className="text-xl font-semibold text-gray-900 mb-4">
												No games found
											</h3>
											<p className="text-gray-600">
												Try adjusting your search or
												filters to discover games.
											</p>
										</div>
									</div>
								)}
							</div>
						)}

						{activeTab === 'my-templates' && (
							<div className="space-y-6">
								<div className="flex justify-between items-center">
									<h2 className="text-2xl font-bold text-gray-900">
										My Templates
									</h2>
								</div>

								{/* Search Component */}
								<DashboardSearch
									onFiltersChange={setTemplateSearchFilters}
									placeholder="Search your templates..."
									showTagFilter={true}
									initialFilters={templateSearchFilters}
								/>

								{loadingMyTemplates ? (
									<div className="flex items-center justify-center py-16">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
									</div>
								) : filteredTemplates &&
								  filteredTemplates.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-visible">
										{filteredTemplates.map((template) => (
											<motion.div
												key={template.id}
												className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-visible hover:shadow-lg transition-shadow duration-200 relative"
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
											>
												{/* Preview Image */}
												{!isLayoutOnlyTemplate(
													template
												) && (
													<div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-t-lg overflow-hidden">
														{template.previewImage ? (
															<img
																src={
																	template.previewImage
																}
																alt={
																	template.title
																}
																className="w-full h-full object-cover"
															/>
														) : (
															<div className="w-full h-full flex items-center justify-center">
																<div className="text-6xl opacity-50">
																	📄
																</div>
															</div>
														)}
													</div>
												)}

												<div className="p-6">
													<div className="flex justify-between items-start mb-3 relative overflow-visible">
														<h3 className="font-bold text-lg text-gray-900 line-clamp-1">
															{template.title}
														</h3>
														<div className="relative template-dropdown overflow-visible">
															<motion.button
																className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 shadow-sm"
																whileHover={{
																	scale: 1.1,
																}}
																whileTap={{
																	scale: 0.9,
																}}
																onClick={(
																	e
																) => {
																	e.stopPropagation();
																	toggleTemplateDropdown(
																		template.id
																	);
																}}
															>
																<motion.svg
																	className="w-4 h-4 text-gray-600"
																	fill="currentColor"
																	viewBox="0 0 24 24"
																	animate={{
																		rotate:
																			openTemplateDropdown ===
																			template.id
																				? 90
																				: 0,
																	}}
																	transition={{
																		duration: 0.2,
																	}}
																>
																	<path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
																</motion.svg>
															</motion.button>

															{/* Animated Dropdown Menu */}
															<AnimatePresence>
																{openTemplateDropdown ===
																	template.id && (
																	<motion.div
																		initial={{
																			opacity: 0,
																			scale: 0.95,
																			y: -10,
																		}}
																		animate={{
																			opacity: 1,
																			scale: 1,
																			y: 0,
																		}}
																		exit={{
																			opacity: 0,
																			scale: 0.95,
																			y: -10,
																		}}
																		transition={{
																			duration: 0.15,
																			ease: 'easeOut',
																		}}
																		className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden z-[60]"
																		style={{
																			boxShadow:
																				'0 25px 50px -12px rgba(0, 0, 0, 0.25)',
																		}}
																	>
																		<motion.button
																			whileHover={{
																				backgroundColor:
																					'rgba(59, 130, 246, 0.05)',
																			}}
																			onClick={(
																				e
																			) => {
																				e.preventDefault();
																				e.stopPropagation();
																				handleShareTemplate(
																					template.id
																				);
																			}}
																			className="w-full text-left px-4 py-3 transition-colors flex items-center space-x-3 text-gray-700 hover:text-blue-600"
																		>
																			<svg
																				className="w-4 h-4"
																				fill="none"
																				stroke="currentColor"
																				viewBox="0 0 24 24"
																			>
																				<path
																					strokeLinecap="round"
																					strokeLinejoin="round"
																					strokeWidth={
																						2
																					}
																					d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
																				/>
																			</svg>
																			<span className="font-medium">
																				Manage
																				Sharing
																			</span>
																		</motion.button>

																		<motion.button
																			whileHover={{
																				backgroundColor:
																					'rgba(239, 68, 68, 0.05)',
																			}}
																			onClick={(
																				e
																			) => {
																				e.preventDefault();
																				e.stopPropagation();
																				handleDeleteTemplate(
																					template.id
																				);
																			}}
																			className="w-full text-left px-4 py-3 transition-colors flex items-center space-x-3 text-red-600 hover:text-red-700"
																		>
																			<svg
																				className="w-4 h-4"
																				fill="none"
																				stroke="currentColor"
																				viewBox="0 0 24 24"
																			>
																				<path
																					strokeLinecap="round"
																					strokeLinejoin="round"
																					strokeWidth={
																						2
																					}
																					d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
																				/>
																			</svg>
																			<span className="font-medium">
																				Delete
																			</span>
																		</motion.button>
																	</motion.div>
																)}
															</AnimatePresence>
														</div>
													</div>

													<p className="text-gray-600 text-sm mb-4 line-clamp-2">
														{template.description ||
															'(Description not provided)'}
													</p>

													<div className="flex flex-col space-y-3">
														<div className="flex items-center justify-between">
															<div className="flex items-center space-x-4">
																<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
																	{
																		template.type
																	}
																</span>
																{template.isPublic && (
																	<span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
																		Public
																	</span>
																)}
																{!template.isPublic && (
																	<span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
																		Private
																	</span>
																)}
															</div>
															<div className="flex items-center text-gray-500 text-xs">
																<svg
																	className="w-4 h-4 mr-1"
																	fill="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
																</svg>
																{
																	template.downloads
																}{' '}
																downloads
															</div>
														</div>
														<motion.button
															whileHover={{
																scale: 1.02,
															}}
															whileTap={{
																scale: 0.98,
															}}
															onClick={(e) => {
																e.stopPropagation();
																handleUseTemplate(
																	template
																);
															}}
															className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
														>
															Use Template
														</motion.button>
													</div>
												</div>
											</motion.div>
										))}
									</div>
								) : (
									<div className="text-center py-12">
										<div className="text-6xl mb-4 opacity-50">
											📄
										</div>
										{myTemplates.length === 0 ? (
											<>
												<h3 className="text-xl font-semibold text-gray-900 mb-2">
													No templates yet
												</h3>
												<p className="text-gray-600 mb-6">
													Create question sets and
													save them as templates to
													share with others.
												</p>
												<Link
													href="/create"
													className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
												>
													<svg
														className="w-5 h-5 mr-2"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M12 6v6m0 0v6m0-6h6m-6 0H6"
														/>
													</svg>
													Create Your First Template
												</Link>
											</>
										) : (
											<>
												<h3 className="text-xl font-semibold text-gray-900 mb-2">
													No templates found
												</h3>
												<p className="text-gray-600">
													Try adjusting your search or
													filters to find templates.
												</p>
											</>
										)}
									</div>
								)}
							</div>
						)}

						{activeTab === 'saved' && (
							<div className="space-y-6">
								<div className="flex justify-between items-center">
									<h2 className="text-2xl font-bold text-gray-900">
										Saved Games
									</h2>
								</div>

								{savedGames && savedGames.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{savedGames.map((game) => (
											<motion.div
												key={game.id}
												className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
											>
												{/* Display Image */}
												<div className="w-full h-48 bg-gradient-to-br from-green-100 to-blue-100 rounded-t-lg overflow-hidden">
													{game.data?.displayImage ? (
														<img
															src={
																game.data
																	.displayImage
															}
															alt={game.title}
															className="w-full h-full object-cover"
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center">
															<div className="text-6xl opacity-50">
																⭐
															</div>
														</div>
													)}
												</div>
												<div className="p-4">
													<div className="flex items-start justify-between mb-3">
														<div className="flex-1">
															<h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
																{game.title}
															</h3>
															<p className="text-sm text-gray-600 mb-2">
																by{' '}
																{
																	game.author
																		.name
																}
															</p>
														</div>
													</div>

													<div className="flex items-center justify-between text-sm text-gray-500 mb-4">
														<div className="flex items-center space-x-4">
															<span className="flex items-center">
																<svg
																	className="w-4 h-4 mr-1"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																>
																	<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
																	<path
																		fillRule="evenodd"
																		d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
																		clipRule="evenodd"
																	/>
																</svg>
																{game.plays ||
																	0}
															</span>
															<span className="flex items-center">
																<svg
																	className="w-4 h-4 mr-1"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																>
																	<path
																		fillRule="evenodd"
																		d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
																		clipRule="evenodd"
																	/>
																</svg>
																{game.saves ||
																	0}
															</span>
														</div>
													</div>

													<div className="flex space-x-2">
														<Link
															href={`/play/${game.id}/setup`}
															className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 text-center"
														>
															Play Game
														</Link>
														<button
															onClick={() => {
																// Store game as template in session storage
																try {
																	const templateData =
																		{
																			title: `Template: ${game.title}`,
																			type: 'JEOPARDY',
																			data: game.data,
																		};
																	TemplateService.storeTemplate(
																		templateData
																	);
																	window.open(
																		'/create/question-set?useTemplate=true',
																		'_blank'
																	);
																} catch (error) {
																	console.error(
																		'Failed to store template:',
																		error
																	);
																	alert(
																		'Failed to load template. Please try again.'
																	);
																}
															}}
															className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200"
															title="Use as Template"
														>
															Template
														</button>
														<button
															onClick={() =>
																handleFavoriteGame(
																	game.id
																)
															}
															className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors duration-200"
														>
															Remove
														</button>
													</div>
												</div>
											</motion.div>
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
											You haven&apos;t saved any games
											yet.
										</p>
										<Link
											href="#"
											onClick={() =>
												setActiveTab('discover')
											}
											className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
										>
											Discover Games to Save
										</Link>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Share Modal */}
			{shareModalGame && (
				<ShareModal
					game={shareModalGame}
					isOpen={!!shareModalGame}
					onClose={() => setShareModalGame(null)}
					onSuccess={() => {
						// Refresh games list to show updated sharing status
						loadGames();
					}}
				/>
			)}

			{/* Template Share Modal */}
			{templateShareModal && (
				<TemplateShareModal
					template={templateShareModal}
					isOpen={!!templateShareModal}
					onClose={() => setTemplateShareModal(null)}
					onSuccess={handleTemplateShareSuccess}
				/>
			)}

			{/* Game Info Modal */}
			{selectedGameInfo && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold text-gray-900">
								Game Information
							</h3>
							<button
								onClick={() => setSelectedGameInfo(null)}
								className="text-gray-400 hover:text-gray-600 transition-colors"
							>
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						<div className="space-y-4">
							<div>
								<span className="font-medium text-gray-700">
									Title:
								</span>
								<p className="text-gray-900">
									{selectedGameInfo.data.gameTitle}
								</p>
							</div>

							{selectedGameInfo.data.categories &&
								selectedGameInfo.data.categories.length > 0 && (
									<div>
										<span className="font-medium text-gray-700">
											Categories:
										</span>
										<ul className="text-gray-900 ml-4 list-disc">
											{selectedGameInfo.data.categories.map(
												(cat, index) => (
													<li key={index}>
														{cat.name ||
															`Category ${
																index + 1
															}`}
													</li>
												)
											)}
										</ul>
									</div>
								)}

							<div>
								<span className="font-medium text-gray-700">
									Created:
								</span>
								<p className="text-gray-900">
									{new Date(
										selectedGameInfo.createdAt
									).toLocaleDateString()}
								</p>
							</div>

							<div>
								<span className="font-medium text-gray-700">
									Last Updated:
								</span>
								<p className="text-gray-900">
									{new Date(
										selectedGameInfo.updatedAt
									).toLocaleDateString()}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			<Modal
				isOpen={deleteConfirmModal.isOpen}
				onClose={() =>
					setDeleteConfirmModal({
						isOpen: false,
						templateId: '',
						templateTitle: '',
					})
				}
				maxWidth="sm"
			>
				<div className="text-center">
					<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
						<svg
							className="h-6 w-6 text-red-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
							/>
						</svg>
					</div>
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						Delete Template
					</h3>
					<p className="text-sm text-gray-500 mb-6">
						Are you sure you want to delete &ldquo;
						<strong>{deleteConfirmModal.templateTitle}</strong>
						&rdquo;? This action cannot be undone.
					</p>
					<div className="flex space-x-3 justify-center">
						<motion.button
							whileHover={{ scale: deleteLoading ? 1 : 1.05 }}
							whileTap={{ scale: deleteLoading ? 1 : 0.95 }}
							onClick={() =>
								setDeleteConfirmModal({
									isOpen: false,
									templateId: '',
									templateTitle: '',
								})
							}
							disabled={deleteLoading}
							className={`px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium ${
								deleteLoading
									? 'opacity-75 cursor-not-allowed'
									: ''
							}`}
						>
							Cancel
						</motion.button>
						<motion.button
							whileHover={{ scale: deleteLoading ? 1 : 1.05 }}
							whileTap={{ scale: deleteLoading ? 1 : 0.95 }}
							onClick={confirmDeleteTemplate}
							disabled={deleteLoading}
							className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2 ${
								deleteLoading
									? 'opacity-75 cursor-not-allowed'
									: ''
							}`}
						>
							{deleteLoading ? (
								<>
									<motion.div
										animate={{ rotate: 360 }}
										transition={{
											duration: 1,
											repeat: Infinity,
											ease: 'linear',
										}}
										className="w-4 h-4"
									>
										<svg
											className="w-4 h-4"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
										</svg>
									</motion.div>
									<span>Deleting...</span>
								</>
							) : (
								<span>Delete</span>
							)}
						</motion.button>
					</div>
				</div>
			</Modal>

			{/* Game Delete Confirmation Modal */}
			<Modal
				isOpen={gameDeleteConfirmModal.isOpen}
				onClose={() =>
					setGameDeleteConfirmModal({
						isOpen: false,
						gameId: '',
						gameTitle: '',
					})
				}
				maxWidth="sm"
			>
				<div className="text-center">
					<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
						<svg
							className="h-6 w-6 text-red-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
							/>
						</svg>
					</div>
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						Delete Game
					</h3>
					<p className="text-sm text-gray-500 mb-6">
						Are you sure you want to delete &ldquo;
						<strong>{gameDeleteConfirmModal.gameTitle}</strong>
						&rdquo;? This action cannot be undone.
					</p>
					<div className="flex space-x-3 justify-center">
						<motion.button
							whileHover={{ scale: deleteLoading ? 1 : 1.05 }}
							whileTap={{ scale: deleteLoading ? 1 : 0.95 }}
							onClick={() =>
								setGameDeleteConfirmModal({
									isOpen: false,
									gameId: '',
									gameTitle: '',
								})
							}
							disabled={deleteLoading}
							className={`px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium ${
								deleteLoading
									? 'opacity-75 cursor-not-allowed'
									: ''
							}`}
						>
							Cancel
						</motion.button>
						<motion.button
							whileHover={{ scale: deleteLoading ? 1 : 1.05 }}
							whileTap={{ scale: deleteLoading ? 1 : 0.95 }}
							onClick={confirmDeleteGame}
							disabled={deleteLoading}
							className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2 ${
								deleteLoading
									? 'opacity-75 cursor-not-allowed'
									: ''
							}`}
						>
							{deleteLoading ? (
								<>
									<motion.div
										animate={{ rotate: 360 }}
										transition={{
											duration: 1,
											repeat: Infinity,
											ease: 'linear',
										}}
										className="w-4 h-4"
									>
										<svg
											className="w-4 h-4"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
										</svg>
									</motion.div>
									<span>Deleting...</span>
								</>
							) : (
								<span>Delete</span>
							)}
						</motion.button>
					</div>
				</div>
			</Modal>

			{/* Template Use Confirmation Modal */}
			{templateUseModal.isOpen && templateUseModal.template && (
				<Modal
					isOpen={templateUseModal.isOpen}
					onClose={() =>
						setTemplateUseModal({ isOpen: false, template: null })
					}
					maxWidth="lg"
				>
					<div className="space-y-6">
						<div>
							<h2 className="text-2xl font-bold text-gray-900 mb-2">
								Apply Template
							</h2>
							<p className="text-gray-600">
								You&apos;re about to create a new{' '}
								{templateUseModal.template.type.toLowerCase()}{' '}
								game using the template &quot;
								{templateUseModal.template.title}&quot;
							</p>
						</div>

						{/* Template Preview */}
						<div className="bg-gray-50 rounded-lg p-4">
							<h3 className="font-semibold text-gray-900 mb-3">
								This template will apply:
							</h3>
							<div className="space-y-2 text-sm text-gray-700">
								{!!(
									templateUseModal.template.data as Record<
										string,
										unknown
									>
								)?.boardCustomizations && (
									<div className="flex items-center space-x-2">
										<svg
											className="w-4 h-4 text-green-500"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
										<span>
											Custom color scheme and styling
										</span>
									</div>
								)}
								{!!(
									templateUseModal.template.data as Record<
										string,
										unknown
									>
								)?.boardBackground && (
									<div className="flex items-center space-x-2">
										<svg
											className="w-4 h-4 text-green-500"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
										<span>Custom board background</span>
									</div>
								)}
								{!!(
									templateUseModal.template.data as Record<
										string,
										unknown
									>
								)?.displayImage && (
									<div className="flex items-center space-x-2">
										<svg
											className="w-4 h-4 text-green-500"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
										<span>Custom game display image</span>
									</div>
								)}
								<div className="flex items-center space-x-2">
									<svg
										className="w-4 h-4 text-blue-500"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
											clipRule="evenodd"
										/>
									</svg>
									<span>
										You can customize everything after
										creation
									</span>
								</div>
							</div>
						</div>

						<div className="flex justify-end space-x-3">
							<button
								onClick={() =>
									setTemplateUseModal({
										isOpen: false,
										template: null,
									})
								}
								className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={() => {
									// Store template in session storage and navigate
									if (templateUseModal.template) {
										try {
											// Transform Template to TemplateData format
											const templateData = {
												id: templateUseModal.template
													.id,
												title: templateUseModal.template
													.title,
												type: templateUseModal.template
													.type,
												data: templateUseModal.template
													.data as {
													categories: Array<{
														id: string;
														name: string;
														questions: Array<{
															id: string;
															value: number;
															question: string;
															answer: string;
															isAnswered: boolean;
															media?: unknown;
															timer?: number;
															difficulty?: string;
														}>;
													}>;
													displayImage?: string;
													boardBackground?: string;
													boardCustomizations?: unknown;
												},
											};
											TemplateService.storeTemplate(
												templateData
											);
											window.open(
												'/create/question-set?useTemplate=true',
												'_blank'
											);
										} catch (error) {
											console.error(
												'Failed to store template:',
												error
											);
											alert(
												'Failed to load template. Please try again.'
											);
										}
									}
									setTemplateUseModal({
										isOpen: false,
										template: null,
									});
								}}
								className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
							>
								Create Game
							</button>
						</div>
					</div>
				</Modal>
			)}
		</div>
	);
}
