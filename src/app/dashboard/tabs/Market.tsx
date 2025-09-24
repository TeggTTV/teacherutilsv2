'use client';

import AdvancedSearch from '@/components/AdvancedSearch';
import { Template } from '@/components/dashboard/types';
import { User } from '@/types/user';
import { useEffect, useState } from 'react';
import { TemplateCard } from '../DashboardUtils';

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
								templateTag.toLowerCase() === tag.toLowerCase()
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

export default function Market({
	user,
	downloadTemplate,
	isTemplateDownloaded,
	downloadingTemplateId,
	handleShareTemplate,
	handleDeleteTemplate,
	handleUseTemplate,
	trackSearch,
}: {
	user: User | null;
	downloadTemplate: (id: string) => void;
	isTemplateDownloaded: (templateId: string) => boolean;
	downloadingTemplateId: string | null;
	handleShareTemplate: (id: string) => void;
	handleDeleteTemplate: (id: string) => void;
	handleUseTemplate: (template: Template) => void;
	trackSearch: (searchTerm: string) => void;
}) {
	// Load templates for market tab
	const [templates, setTemplates] = useState<Template[]>([]);
	const [loadingTemplates, setLoadingTemplates] = useState(false);
	const [marketSelectedTags, setMarketSelectedTags] = useState<string[]>([]);
	const [marketSearchTerm, setMarketSearchTerm] = useState('');

	useEffect(() => {
		const loadTemplates = async () => {
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
		};

		loadTemplates();
	}, [user]);

	const filteredMarketTemplates = filterTemplatesBySearch(
		templates,
		marketSearchTerm,
		marketSelectedTags
	);

	return (
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
							setTimeout(() => trackSearch(searchTerm), 1000);
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
					{filteredMarketTemplates.map((template) => (
						<TemplateCard
							key={template.id}
							template={template}
							isTemplateDownloaded={isTemplateDownloaded}
							downloadTemplate={downloadTemplate}
							downloadingTemplateId={downloadingTemplateId}
							handleShareTemplate={handleShareTemplate}
							handleDeleteTemplate={handleDeleteTemplate}
							handleUseTemplate={handleUseTemplate}
							currentUserId={user?.id}
						/>
					))}
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
	);
}
