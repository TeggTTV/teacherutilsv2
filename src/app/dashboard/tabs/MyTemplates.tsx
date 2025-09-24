'use client';

import { Template } from '@/components/dashboard/types';
import DashboardSearch, { SearchFilters } from '@/components/DashboardSearch';
import { User } from '@/types/user';
import { useEffect, useState } from 'react';
import { TemplateCard } from '../DashboardUtils';
import Link from 'next/link';

export default function MyTemplates({
	user,
	myTemplates,
	setMyTemplates,
	downloadTemplate,
	downloadingTemplateId,
	handleShareTemplate,
	handleDeleteTemplate,
	handleUseTemplate,
	isTemplateDownloaded,
}: {
	user: User | null;
	myTemplates: Template[];
	setMyTemplates: (templates: Template[]) => void;
	downloadTemplate: (id: string) => void;
	downloadingTemplateId: string | null;
	handleShareTemplate: (id: string) => void;
	handleDeleteTemplate: (id: string) => void;
	handleUseTemplate: (t: Template) => void;
	isTemplateDownloaded: (id: string) => boolean;
}) {
	const [templateSearchFilters, setTemplateSearchFilters] =
		useState<SearchFilters>({
			searchTerm: '',
			tags: [],
			subject: '',
			gradeLevel: '',
			difficulty: '',
		});
	const [loadingMyTemplates, setLoadingMyTemplates] = useState(false);

	useEffect(() => {
		const loadMyTemplates = async () => {
			if (!user) return;

			try {
				const response = await fetch('/api/templates/my');
				if (response.ok) {
					const data = await response.json();
					setMyTemplates(data.templates || []);
				}
			} catch (error) {
				console.error('Error loading my templates:', error);
			}
		};

		loadMyTemplates();
	}, [setMyTemplates, user]);

	// Handle loading state for my-templates tab
	useEffect(() => {
		setLoadingMyTemplates(true);
		// If templates are already loaded, stop loading immediately
		if (myTemplates.length > 0) {
			setLoadingMyTemplates(false);
		}
	}, [user, myTemplates.length]);

	// Stop loading when templates finish loading
	useEffect(() => {
		setLoadingMyTemplates(false);
	}, [myTemplates.length]);

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

	const filteredTemplates = filterTemplates(
		myTemplates,
		templateSearchFilters
	);

	return (
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
			) : filteredTemplates && filteredTemplates.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-visible">
					{filteredTemplates.map((template) => (
						<TemplateCard
							key={template.id}
							template={template}
							isTemplateDownloaded={isTemplateDownloaded}
							downloadTemplate={downloadTemplate}
							downloadingTemplateId={downloadingTemplateId}
							handleShareTemplate={handleShareTemplate}
							handleDeleteTemplate={handleDeleteTemplate}
							showDownload={false}
							handleUseTemplate={handleUseTemplate}
							currentUserId={user?.id}
						/>
					))}
				</div>
			) : (
				<div className="text-center py-12">
					<div className="text-6xl mb-4 opacity-50">📄</div>
					{myTemplates.length === 0 ? (
						<>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">
								No templates yet
							</h3>
							<p className="text-gray-600 mb-6">
								Create question sets and save them as templates
								to share with others.
							</p>
							<Link
								href="/create"
								className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
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
								Try adjusting your search or filters to find
								templates.
							</p>
						</>
					)}
				</div>
			)}
		</div>
	);
}
