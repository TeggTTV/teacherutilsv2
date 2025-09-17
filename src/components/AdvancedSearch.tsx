'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdvancedSearchProps {
	onSearchChange: (searchTerm: string) => void;
	onTagsChange: (tags: string[]) => void;
	selectedTags: string[];
	placeholder?: string;
	onSearch?: (searchTerm: string) => void; // Called when Enter is pressed
}

interface PopularTag {
	name: string;
	count: number;
}

export default function AdvancedSearch({ 
	onSearchChange, 
	onTagsChange, 
	selectedTags,
	placeholder = "Search...",
	onSearch
}: AdvancedSearchProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [showTagDropdown, setShowTagDropdown] = useState(false);
	const [tagSearchTerm, setTagSearchTerm] = useState('');
	const [popularTags, setPopularTags] = useState<PopularTag[]>([]);
	const [tagsLoading, setTagsLoading] = useState(false);
	
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Fetch tags with usage counts from API
	const fetchTags = async () => {
		setTagsLoading(true);
		try {
			const response = await fetch('/api/tags?limit=50');
			if (response.ok) {
				const data = await response.json();
				if (data.success && data.tags) {
					setPopularTags(data.tags.map((tag: { name: string; usageCount: number }) => ({
						name: tag.name,
						count: tag.usageCount
					})));
				}
			}
		} catch (error) {
			console.error('Failed to fetch tags:', error);
		} finally {
			setTagsLoading(false);
		}
	};

	// Fetch tags on component mount
	useEffect(() => {
		fetchTags();
	}, []);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowTagDropdown(false);
				setTagSearchTerm('');
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Handle search term change
	const handleSearchChange = (value: string) => {
		setSearchTerm(value);
		onSearchChange(value);
	};

	// Handle Enter key press for search
	const handleSearchKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			if (onSearch) {
				onSearch(searchTerm);
			}
		}
	};

	// Handle tag selection
	const handleTagSelect = (tagName: string) => {
		const tagExists = selectedTags.some(tag => tag.toLowerCase() === tagName.toLowerCase());
		if (tagExists) {
			// Remove tag if already selected (case-insensitive)
			onTagsChange(selectedTags.filter(tag => tag.toLowerCase() !== tagName.toLowerCase()));
		} else {
			// Add tag if not selected
			onTagsChange([...selectedTags, tagName]);
		}
	};

	// Remove tag
	const removeTag = (tagName: string) => {
		onTagsChange(selectedTags.filter(tag => tag.toLowerCase() !== tagName.toLowerCase()));
	};

	// Handle tag search key press (Enter to add custom tag)
	const handleTagSearchKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter' && tagSearchTerm.trim()) {
			event.preventDefault();
			const trimmedTag = tagSearchTerm.trim();
			
			// Check if tag is already selected
			const tagExists = selectedTags.some(tag => tag.toLowerCase() === trimmedTag.toLowerCase());
			if (!tagExists) {
				// Add the custom tag to selected tags
				onTagsChange([...selectedTags, trimmedTag]);
			}
			
			// Clear the search term
			setTagSearchTerm('');
		}
	};

	// Filter tags based on search term
	const filteredTags = popularTags.filter(tag => 
		tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase())
	);

	return (
		<div className="space-y-4">
			{/* Main Search Bar */}
			<div className="relative">
				<input
					type="text"
					placeholder={placeholder}
					value={searchTerm}
					onChange={(e) => handleSearchChange(e.target.value)}
					onKeyDown={handleSearchKeyDown}
					className="w-full bg-white pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
				/>
				<svg
					className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={() => onSearch && onSearch(searchTerm)}
					className="absolute right-2 top-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
				>
					Search
				</motion.button>
			</div>

			{/* Tag Search Dropdown */}
			<div className="relative" ref={dropdownRef}>
				<button
					onClick={() => setShowTagDropdown(!showTagDropdown)}
					className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
				>
					<div className="flex items-center space-x-2">
						<svg
							className="h-5 w-5 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
							/>
						</svg>
						<span className="text-gray-600">
							{selectedTags.length === 0 ? 'Select tags...' : `${selectedTags.length} tag${selectedTags.length !== 1 ? 's' : ''} selected`}
						</span>
					</div>
					<motion.svg
						className="h-5 w-5 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						animate={{ rotate: showTagDropdown ? 180 : 0 }}
						transition={{ duration: 0.2 }}
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</motion.svg>
				</button>

				{/* Selected Tags Display */}
				{selectedTags.length > 0 && (
					<div className="flex flex-wrap gap-2 mt-2">
						{selectedTags.map((tag) => (
							<motion.span
								key={tag}
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
							>
								{tag}
								<button
									onClick={() => removeTag(tag)}
									className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
								>
									×
								</button>
							</motion.span>
						))}
					</div>
				)}

				{/* Dropdown */}
				<AnimatePresence>
					{showTagDropdown && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="absolute top-full mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50"
						>
							<div className="p-4 border-b border-gray-200">
								<div className="flex items-center space-x-2">
									<input
										type="text"
										placeholder="Search tags..."
										value={tagSearchTerm}
										onChange={(e) => setTagSearchTerm(e.target.value)}
										onKeyDown={handleTagSearchKeyDown}
										className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										onClick={() => {
											setShowTagDropdown(false);
											setTagSearchTerm('');
										}}
										className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
									>
										Done
									</motion.button>
								</div>
							</div>
							<div className="max-h-60 overflow-y-auto">
								<div className="p-4">
									<h4 className="text-sm font-medium text-gray-900 mb-3">Popular Tags</h4>
									{tagsLoading ? (
										<div className="flex items-center justify-center py-8">
											<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
											<span className="ml-2 text-sm text-gray-500">Loading tags...</span>
										</div>
									) : (
										<div className="space-y-2">
											{filteredTags.map((tag) => {
												const isSelected = selectedTags.some(selectedTag => selectedTag.toLowerCase() === tag.name.toLowerCase());
												return (
													<button
														key={tag.name}
														onClick={() => handleTagSelect(tag.name)}
														className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
															isSelected
																? 'bg-blue-50 text-blue-700 border border-blue-200'
																: 'hover:bg-gray-50 text-gray-700'
														}`}
													>
														<span className="flex items-center space-x-2">
															<span>{tag.name}</span>
															{isSelected && (
																<svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
																	<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
																</svg>
															)}
														</span>
														<span className="text-sm text-gray-500">{tag.count.toLocaleString()}</span>
													</button>
												);
											})}
										</div>
									)}
									{!tagsLoading && filteredTags.length === 0 && tagSearchTerm && (
										<div className="text-center py-4">
											<p className="text-sm text-gray-500 mb-2">
												No tags found matching &quot;{tagSearchTerm}&quot;
											</p>
											<p className="text-xs text-blue-600">
												Press Enter to add &quot;{tagSearchTerm}&quot; as a search tag
											</p>
										</div>
									)}
									{!tagsLoading && filteredTags.length === 0 && !tagSearchTerm && (
										<p className="text-sm text-gray-500 text-center py-4">
											No tags available yet
										</p>
									)}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}