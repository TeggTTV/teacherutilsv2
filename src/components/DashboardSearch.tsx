'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TagSelector from './TagSelector';

interface SearchFilters {
	searchTerm: string;
	tags: string[];
	subject: string;
	gradeLevel: string;
	difficulty: string;
}

interface DashboardSearchProps {
	onFiltersChange: (filters: SearchFilters) => void;
	placeholder?: string;
	showTagFilter?: boolean;
	initialFilters?: Partial<SearchFilters>;
}

const defaultFilters: SearchFilters = {
	searchTerm: '',
	tags: [],
	subject: '',
	gradeLevel: '',
	difficulty: ''
};

export default function DashboardSearch({ 
	onFiltersChange, 
	placeholder = "Search...",
	showTagFilter = true,
	initialFilters = {}
}: DashboardSearchProps) {
	const [filters, setFilters] = useState<SearchFilters>({
		...defaultFilters,
		...initialFilters
	});
	const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

	// Notify parent when filters change
	useEffect(() => {
		onFiltersChange(filters);
	}, [filters, onFiltersChange]);

	const handleFilterChange = (key: keyof SearchFilters, value: string | string[]) => {
		setFilters(prev => ({
			...prev,
			[key]: value
		}));
	};

	const clearFilters = () => {
		setFilters(defaultFilters);
	};

	const hasActiveFilters = filters.searchTerm || filters.tags.length > 0 || 
		filters.subject || filters.gradeLevel || filters.difficulty;

	return (
		<div className="space-y-4">
			{/* Main Search Bar */}
			<div className="relative">
				<div className="relative">
					<input
						type="text"
						value={filters.searchTerm}
						onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
						placeholder={placeholder}
						className="w-full bg-white pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
					<div className="absolute left-3 top-1/2 transform -translate-y-1/2">
						<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
					<div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
						{hasActiveFilters && (
							<button
								onClick={clearFilters}
								className="text-gray-400 hover:text-gray-600 transition-colors"
								title="Clear all filters"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						)}
						<button
							onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
							className={`transition-colors ${showAdvancedFilters ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}
							title="Advanced filters"
						>
							<motion.svg 
								className="w-5 h-5" 
								fill="none" 
								stroke="currentColor" 
								viewBox="0 0 24 24"
								animate={{ rotate: showAdvancedFilters ? 180 : 0 }}
								transition={{ duration: 0.2 }}
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
							</motion.svg>
						</button>
					</div>
				</div>
			</div>

			{/* Advanced Filters */}
			<AnimatePresence>
				{showAdvancedFilters && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50"
					>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{/* Subject Filter */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Subject
								</label>
								<select
									value={filters.subject}
									onChange={(e) => handleFilterChange('subject', e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								>
									<option value="">All Subjects</option>
									<option value="math">Math</option>
									<option value="science">Science</option>
									<option value="history">History</option>
									<option value="english">English</option>
									<option value="geography">Geography</option>
									<option value="art">Art</option>
									<option value="music">Music</option>
									<option value="physical-education">Physical Education</option>
									<option value="foreign-language">Foreign Language</option>
									<option value="computer-science">Computer Science</option>
									<option value="social-studies">Social Studies</option>
									<option value="other">Other</option>
								</select>
							</div>

							{/* Grade Level Filter */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Grade Level
								</label>
								<select
									value={filters.gradeLevel}
									onChange={(e) => handleFilterChange('gradeLevel', e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								>
									<option value="">All Grades</option>
									<option value="K-2">K-2</option>
									<option value="3-5">3-5</option>
									<option value="6-8">6-8</option>
									<option value="9-12">9-12</option>
									<option value="college">College</option>
								</select>
							</div>

							{/* Difficulty Filter */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Difficulty
								</label>
								<select
									value={filters.difficulty}
									onChange={(e) => handleFilterChange('difficulty', e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								>
									<option value="">All Difficulties</option>
									<option value="beginner">Beginner</option>
									<option value="intermediate">Intermediate</option>
									<option value="advanced">Advanced</option>
								</select>
							</div>
						</div>

						{/* Tags Filter */}
						{showTagFilter && (
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Filter by Tags
								</label>
								<TagSelector
									selectedTags={filters.tags}
									onTagsChange={(tags) => handleFilterChange('tags', tags)}
									placeholder="Select tags to filter results..."
									maxTags={10}
								/>
							</div>
						)}

						{/* Active Filters Summary */}
						{hasActiveFilters && (
							<div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
								<span className="text-sm text-gray-600">Active filters:</span>
								{filters.searchTerm && (
									<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
										Search: &ldquo;{filters.searchTerm}&rdquo;
									</span>
								)}
								{filters.subject && (
									<span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs capitalize">
										{filters.subject.replace('-', ' ')}
									</span>
								)}
								{filters.gradeLevel && (
									<span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
										{filters.gradeLevel}
									</span>
								)}
								{filters.difficulty && (
									<span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs capitalize">
										{filters.difficulty}
									</span>
								)}
								{filters.tags.map(tag => (
									<span key={tag} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
										{tag}
									</span>
								))}
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export type { SearchFilters };