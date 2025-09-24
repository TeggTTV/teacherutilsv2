'use client';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getApiUrl } from '@/lib/config';
import { SavedGame, Template } from '@/components/dashboard/types';
import DashboardSearch, { SearchFilters } from '@/components/DashboardSearch';
import { trackGamePlay, trackSearch } from '@/lib/analytics';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import sidebarItems, { isGameComplete } from './DashboardUtils';
import MySetsTab from '@/components/dashboard/MySetsTab';
import ShareModal from '@/components/ShareModal';
import TemplateShareModal from '@/components/TemplateShareModal';
import Modal from '@/components/Modal';
import TemplateService from '@/lib/services/templateService';
import Play from './tabs/Play';
import Stats from './tabs/Stats';
import Market from './tabs/Market';
import Discover from './tabs/Discover';
import Saved from './tabs/Saved';
import Referrals from './tabs/Referrals';
import MyTemplates from './tabs/MyTemplates';

// Small reusable card component to allow hooks (dropdown state) inside a proper component

export default function DashboardContent() {
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
			'referrals',
		].includes(urlTab || '')
			? (urlTab as string)
			: 'play';
	});

	const [games, setGames] = useState<SavedGame[]>([]);
	const [loadingGames, setLoadingGames] = useState(true);

	// Advanced search states

	const [gameSearchFilters, setGameSearchFilters] = useState<SearchFilters>({
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

	const [myTemplates, setMyTemplates] = useState<Template[]>([]);

	const [showIncompleteGames, setShowIncompleteGames] = useState(false);
	const [, setOpenTemplateDropdown] = useState<string | null>(null);
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
	const [sidebarOpen, setSidebarOpen] = useState(false);

	// Function to handle tab navigation
	const handleTabChange = (tabId: string) => {
		setActiveTab(tabId);
		// Update URL without page reload
		const newUrl = `${pathname}?tab=${tabId}`;
		window.history.pushState({}, '', newUrl);
	};

	// Search and filtering functions

	// Get filtered data

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
					'referrals',
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

	// Get filtered data
	const filteredGames = filterGames(games, gameSearchFilters);

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

	// Template dropdown management - removed global state, now handled locally in template cards

	// Close dropdown when clicking outside - removed global handler, now handled locally

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

	// NOTE: isLayoutOnlyTemplate is defined at module scope; use that implementation instead.

	const confirmDeleteTemplate = async () => {
		// Set loading state
		setDeleteLoading(true);

		try {
			// Determine whether the template is owned by the user
			const template = myTemplates.find(
				(t) => t.id === deleteConfirmModal.templateId
			);
			if (!template) {
				throw new Error('Template not found in local state');
			}

			if (template.author && template.author.id === user?.id) {
				// User owns the template: delete it from server
				const response = await fetch(
					`/api/templates/${deleteConfirmModal.templateId}`,
					{
						method: 'DELETE',
					}
				);

				if (response.ok) {
					// Remove from local state
					setMyTemplates((prev) =>
						prev.filter(
							(t) => t.id !== deleteConfirmModal.templateId
						)
					);
				}
			} else {
				// Template is owned by someone else, but user may have downloaded it.
				// Call DELETE on /api/templates/download with templateId in body to remove from user's library
				const response = await fetch(`/api/templates/download`, {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						templateId: deleteConfirmModal.templateId,
					}),
				});

				if (response.ok) {
					// Remove from local state (myTemplates list contains downloads for this user)
					setMyTemplates((prev) =>
						prev.filter(
							(t) => t.id !== deleteConfirmModal.templateId
						)
					);
				}
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

	// Populate downloadedTemplateIds from myTemplates data when it loads
	useEffect(() => {
		if (!myTemplates) return;

		const downloadedIds = new Set<string>();
		myTemplates.forEach((template) => {
			if (
				template.templateDownloads &&
				template.templateDownloads.length > 0
			) {
				downloadedIds.add(template.id);
			}
		});
		setDownloadedTemplateIds(downloadedIds);
	}, [myTemplates]);

	// Sidebar configuration

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="min-h-[calc(100vh-64px	)] bg-gradient-to-br from-blue-50 to-indigo-100 flex">
			{/* Sidebar */}
			<DashboardSidebar
				sidebarOpen={sidebarOpen}
				setSidebarOpen={setSidebarOpen}
				sidebarItems={sidebarItems(activeTab)}
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
				<div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50/30 to-indigo-100/30">
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

						{activeTab === 'play' && (
							<Play
								games={filteredGames}
								isGameComplete={isGameComplete}
								showIncompleteGames={showIncompleteGames}
								setShowIncompleteGames={setShowIncompleteGames}
								setActiveTab={setActiveTab}
							/>
						)}

						{activeTab === 'stats' && <Stats />}

						{activeTab === 'market' && (
							<Market
								user={user}
								downloadTemplate={downloadTemplate}
								downloadingTemplateId={downloadingTemplateId}
								handleDeleteTemplate={handleDeleteTemplate}
								handleShareTemplate={handleShareTemplate}
								handleUseTemplate={handleUseTemplate}
								isTemplateDownloaded={isTemplateDownloaded}
								trackSearch={trackSearch}
							/>
						)}

						{activeTab === 'discover' && <Discover user={user} />}

						{activeTab === 'my-templates' && (
							<MyTemplates
							user={user}
								myTemplates={myTemplates}
								setMyTemplates={setMyTemplates}
								downloadTemplate={downloadTemplate}
								downloadingTemplateId={downloadingTemplateId}
								handleDeleteTemplate={handleDeleteTemplate}
								handleShareTemplate={handleShareTemplate}
								handleUseTemplate={handleUseTemplate}
								isTemplateDownloaded={isTemplateDownloaded}
							/>
						)}

						{activeTab === 'saved' && (
							<Saved
								user={user}
								handleUseTemplate={handleUseTemplate}
								handleDeleteGame={handleDeleteGame}
								setActiveTab={setActiveTab}
							/>
						)}

						{activeTab === 'referrals' && <Referrals user={user} />}
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
								onClick={async () => {
									// Store template in session storage and navigate
									if (templateUseModal.template) {
										try {
											// First fetch the full template data including the game data
											const response = await fetch(
												`/api/templates/${templateUseModal.template.id}`,
												{
													method: 'POST', // Use POST to download the template
													credentials: 'include',
												}
											);

											if (!response.ok) {
												throw new Error(
													`Failed to fetch template: ${response.statusText}`
												);
											}

											const fullTemplate =
												await response.json();

											if (!fullTemplate.data) {
												throw new Error(
													'Template data is missing'
												);
											}

											// Transform Template to TemplateData format
											const templateData = {
												id: fullTemplate.id,
												title: fullTemplate.title,
												type: fullTemplate.type,
												data: fullTemplate.data as {
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

											console.log(
												'Storing template with data:',
												templateData
											);
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
								className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
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
