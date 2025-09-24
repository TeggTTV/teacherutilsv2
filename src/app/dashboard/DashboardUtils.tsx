'use client';
import { motion } from 'framer-motion';
import { SidebarItem, Template } from '@/components/dashboard/types';
import DropdownMenu, { DropdownMenuItem } from '@/components/DropdownMenu';
import Image from 'next/image';

export const isLayoutOnlyTemplate = (template: Template) => {
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
				templateData.boardCustomizations.colors.categoryTextColor !==
					'#FFFFFF' ||
				templateData.boardCustomizations.colors.tileBackground !==
					'#1E40AF');

		// If no visual customizations, consider it layout-only
		return !hasDisplayImage && !hasBoardBackground && !hasCustomColors;
	}

	return false;
};

export const isGameComplete = (gameData: Record<string, unknown>): boolean => {
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

export default function sidebarItems(activeTab: string): SidebarItem[] {
	return [
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
		{
			id: 'referrals',
			label: 'Referrals',
			badge: 'New!',
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
						d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
					/>
				</svg>
			),
			bgColor: activeTab === 'referrals' ? 'bg-blue-500' : 'bg-gradient-to-r from-purple-100 to-pink-100',
			textColor:
				activeTab === 'referrals' ? 'text-white' : 'text-purple-700',
		},
	];
}

export function TemplateCard({
	template,
	isTemplateDownloaded,
	downloadTemplate,
	downloadingTemplateId,
	handleShareTemplate,
	handleDeleteTemplate,
	handleUseTemplate,
	showDownload = true,
	currentUserId,
}: {
	template: Template;
	isTemplateDownloaded: (id: string) => boolean;
	downloadTemplate: (id: string) => void;
	downloadingTemplateId: string | null;
	handleShareTemplate: (id: string) => void;
	handleDeleteTemplate: (id: string) => void;
	handleUseTemplate: (t: Template) => void;
	showDownload?: boolean;
	currentUserId?: string | null;
}) {
	const menuItems: DropdownMenuItem[] = [
		{
			id: 'share',
			label: 'Manage Sharing',
			icon: (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
					/>
				</svg>
			),
			action: () => handleShareTemplate(template.id),
		},
		{
			id: 'delete',
			label: 'Delete',
			icon: (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
					/>
				</svg>
			),
			action: () => handleDeleteTemplate(template.id),
			variant: 'danger' as const,
		},
	];

	return (
		<motion.div
			className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 relative"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
		>
			{/* Only show dropdown menu for templates owned by the current user */}
			{template.author && template.author.id === currentUserId && (
				<div className="absolute top-3 right-3 z-10">
					<DropdownMenu
						items={menuItems}
						position="right"
						trigger={
							<svg
								className="w-4 h-4 text-gray-600"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
							</svg>
						}
						triggerClassName="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 shadow-sm"
					/>
				</div>
			)}{' '}
			{!isLayoutOnlyTemplate(template) && (
				<div className="w-full h-24 sm:h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-3 sm:mb-4 overflow-hidden">
					{template.previewImage ? (
						<Image
							width={400}
							height={200}
							src={template.previewImage}
							alt={template.title}
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
			)}
			<div className="p-6">
				<h3 className="font-bold text-lg text-gray-900 line-clamp-1">
					{template.title}
				</h3>

				<p className="text-gray-600 text-sm mb-4 line-clamp-2">
					{template.description || '(Description not provided)'}
				</p>

				<div className="flex flex-col space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
								{template.type}
							</span>
							{template.isPublic ? (
								<span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
									Public
								</span>
							) : (
								<span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
									Private
								</span>
							)}
						</div>
						<div className="flex items-center text-gray-500 text-xs">
							{template.downloads} downloads
						</div>
					</div>

					<div className="flex flex-col space-y-2">
						{showDownload ? (
							// Marketplace single-button: Download -> Use
							isTemplateDownloaded(template.id) ? (
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={(e) => {
										e.stopPropagation();
										handleUseTemplate(template);
									}}
									className="w-full px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200"
								>
									Use Template
								</motion.button>
							) : (
								<button
									onClick={(e) => {
										e.stopPropagation();
										downloadTemplate(template.id);
									}}
									disabled={
										downloadingTemplateId === template.id
									}
									className="w-full px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
								>
									{downloadingTemplateId === template.id
										? 'Downloading...'
										: 'Download'}
								</button>
							)
						) : (
							// For my-templates (showDownload=false) keep Use Template button
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={(e) => {
									e.stopPropagation();
									handleUseTemplate(template);
								}}
								className="w-full px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200"
							>
								Use Template
							</motion.button>
						)}
					</div>
				</div>
			</div>
		</motion.div>
	);
}
