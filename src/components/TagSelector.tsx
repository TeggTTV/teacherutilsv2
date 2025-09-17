'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TagSelectorProps {
	selectedTags: string[];
	onTagsChange: (tags: string[]) => void;
	placeholder?: string;
	maxTags?: number;
	predefinedTags?: string[];
	className?: string;
}

const COMMON_TAGS = [
	'math', 'science', 'history', 'english', 'geography', 'art', 'music',
	'biology', 'chemistry', 'physics', 'algebra', 'geometry', 'literature',
	'reading', 'writing', 'vocabulary', 'grammar', 'spelling', 'pronunciation',
	'addition', 'subtraction', 'multiplication', 'division', 'fractions',
	'world-war', 'civil-war', 'ancient-history', 'modern-history',
	'countries', 'capitals', 'maps', 'continents', 'oceans',
	'elementary', 'middle-school', 'high-school', 'college',
	'beginner', 'intermediate', 'advanced',
	'fun', 'educational', 'challenging', 'review', 'test-prep',
	'interactive', 'team-building', 'classroom', 'homework'
];

export default function TagSelector({ 
	selectedTags, 
	onTagsChange, 
	placeholder = "Add tags...",
	maxTags = 10,
	predefinedTags = COMMON_TAGS,
	className = ""
}: TagSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [filteredTags, setFilteredTags] = useState(predefinedTags);
	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Filter tags based on input and exclude already selected ones
	useEffect(() => {
		const filtered = predefinedTags.filter(tag => 
			tag.toLowerCase().includes(inputValue.toLowerCase()) &&
			!selectedTags.includes(tag)
		);
		setFilteredTags(filtered);
	}, [inputValue, selectedTags, predefinedTags]);

	// Handle click outside to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				setInputValue('');
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const addTag = (tag: string) => {
		if (selectedTags.length >= maxTags) return;
		if (!selectedTags.includes(tag)) {
			onTagsChange([...selectedTags, tag]);
		}
		setInputValue('');
	};

	const removeTag = (tagToRemove: string) => {
		onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
	};

	const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && inputValue.trim()) {
			e.preventDefault();
			const newTag = inputValue.trim().toLowerCase();
			if (newTag && !selectedTags.includes(newTag) && selectedTags.length < maxTags) {
				addTag(newTag);
			}
		} else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
			removeTag(selectedTags[selectedTags.length - 1]);
		} else if (e.key === 'Escape') {
			setIsOpen(false);
		}
	};

	return (
		<div className={`relative ${className}`} ref={dropdownRef}>
			{/* Main Input Area */}
			<div 
				className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent cursor-text bg-white"
				onClick={() => {
					setIsOpen(true);
					inputRef.current?.focus();
				}}
			>
				<div className="flex flex-wrap gap-1.5">
					{/* Selected Tags */}
					{selectedTags.map((tag) => (
						<motion.span
							key={tag}
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.8, opacity: 0 }}
							className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
						>
							{tag}
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									removeTag(tag);
								}}
								className="ml-1.5 text-blue-600 hover:text-blue-800 focus:outline-none"
							>
								<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
								</svg>
							</button>
						</motion.span>
					))}
					
					{/* Input */}
					{selectedTags.length < maxTags && (
						<input
							ref={inputRef}
							type="text"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={handleInputKeyDown}
							onFocus={() => setIsOpen(true)}
							placeholder={selectedTags.length === 0 ? placeholder : ""}
							className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
						/>
					)}
				</div>
			</div>

			{/* Dropdown */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						transition={{ duration: 0.15 }}
						className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto"
					>
						{filteredTags.length > 0 ? (
							<div className="p-2">
								{filteredTags.slice(0, 20).map((tag) => (
									<button
										key={tag}
										type="button"
										onClick={() => addTag(tag)}
										className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
									>
										{tag}
									</button>
								))}
							</div>
						) : inputValue.trim() ? (
							<div className="p-3 text-sm text-gray-500 text-center">
								<div>No matching tags found</div>
								<button
									type="button"
									onClick={() => addTag(inputValue.trim())}
									className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200 transition-colors"
								>
									Create &ldquo;{inputValue.trim()}&rdquo;
								</button>
							</div>
						) : (
							<div className="p-3 text-sm text-gray-500 text-center">
								Start typing to search tags
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Helper Text */}
			<div className="mt-1 text-xs text-gray-500">
				{selectedTags.length}/{maxTags} tags selected
				{selectedTags.length > 0 && " • Press backspace to remove last tag"}
			</div>
		</div>
	);
}