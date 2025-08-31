'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useState } from 'react';

type ValuePreset = {
	name: string;
	values: number[];
};

type BoardTheme = {
	id: string;
	name: string;
	backgroundColor: string;
	boardBackground: string;
	categoryBackground: string;
	categoryTextColor: string;
	questionCellBackground: string;
	questionCellHoverBackground: string;
	questionTextColor: string;
	completedCellBackground: string;
	completedCellTextColor: string;
	borderColor: string;
	shadowStyle: string;
};

type FontStyle = {
	id: string;
	name: string;
	fontFamily: string;
	fontWeight: string;
	fontSize: string;
};

type AnimationStyle = {
	id: string;
	name: string;
	hoverScale: number;
	tapScale: number;
	transition: string;
};

const VALUE_PRESETS: ValuePreset[] = [
	{ name: '100s (Classic)', values: [100, 200, 300, 400, 500] },
	{ name: '1000s', values: [1000, 2000, 3000, 4000, 5000] },
	{ name: '10s', values: [10, 20, 30, 40, 50] },
	{ name: '50s', values: [50, 100, 150, 200, 250] },
	{ name: 'Custom', values: [100, 200, 300, 400, 500] }
];

const BOARD_THEMES: BoardTheme[] = [
	{
		id: 'clean-white',
		name: 'Clean White',
		backgroundColor: '#f9fafb',
		boardBackground: '#ffffff',
		categoryBackground: '#f9fafb',
		categoryTextColor: '#111827',
		questionCellBackground: '#ffffff',
		questionCellHoverBackground: '#f9fafb',
		questionTextColor: '#6b7280',
		completedCellBackground: '#ecfdf5',
		completedCellTextColor: '#065f46',
		borderColor: '#e5e7eb',
		shadowStyle: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
	},
	{
		id: 'professional-blue',
		name: 'Professional Blue',
		backgroundColor: '#eff6ff',
		boardBackground: '#ffffff',
		categoryBackground: '#dbeafe',
		categoryTextColor: '#1e40af',
		questionCellBackground: '#f8fafc',
		questionCellHoverBackground: '#f1f5f9',
		questionTextColor: '#475569',
		completedCellBackground: '#dbeafe',
		completedCellTextColor: '#1e40af',
		borderColor: '#cbd5e1',
		shadowStyle: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
	},
	{
		id: 'modern-dark',
		name: 'Modern Dark',
		backgroundColor: '#111827',
		boardBackground: '#1f2937',
		categoryBackground: '#374151',
		categoryTextColor: '#f9fafb',
		questionCellBackground: '#1f2937',
		questionCellHoverBackground: '#374151',
		questionTextColor: '#d1d5db',
		completedCellBackground: '#065f46',
		completedCellTextColor: '#ecfdf5',
		borderColor: '#4b5563',
		shadowStyle: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)'
	},
	{
		id: 'colorful-gradient',
		name: 'Colorful Gradient',
		backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		boardBackground: 'rgba(255, 255, 255, 0.95)',
		categoryBackground: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
		categoryTextColor: '#ffffff',
		questionCellBackground: 'rgba(255, 255, 255, 0.9)',
		questionCellHoverBackground: 'rgba(255, 255, 255, 1)',
		questionTextColor: '#374151',
		completedCellBackground: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
		completedCellTextColor: '#ffffff',
		borderColor: 'rgba(255, 255, 255, 0.3)',
		shadowStyle: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
	}
];

const FONT_STYLES: FontStyle[] = [
	{ id: 'default', name: 'Default', fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '400', fontSize: '1rem' },
	{ id: 'bold', name: 'Bold', fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '700', fontSize: '1rem' },
	{ id: 'serif', name: 'Serif', fontFamily: 'Georgia, serif', fontWeight: '400', fontSize: '1rem' },
	{ id: 'monospace', name: 'Monospace', fontFamily: 'Menlo, Monaco, monospace', fontWeight: '400', fontSize: '0.9rem' }
];

const ANIMATION_STYLES: AnimationStyle[] = [
	{ id: 'subtle', name: 'Subtle', hoverScale: 1.02, tapScale: 0.98, transition: 'all 0.2s ease' },
	{ id: 'bouncy', name: 'Bouncy', hoverScale: 1.1, tapScale: 0.9, transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
	{ id: 'slide', name: 'Slide', hoverScale: 1.0, tapScale: 1.0, transition: 'transform 0.3s ease, box-shadow 0.3s ease' },
	{ id: 'none', name: 'None', hoverScale: 1.0, tapScale: 1.0, transition: 'none' }
];

export default function JeopardyCreatePage() {
	const { user, loading } = useAuthGuard();
	const [gameTitle, setGameTitle] = useState('My Jeopardy Game');
	const [selectedPreset, setSelectedPreset] = useState<ValuePreset>(VALUE_PRESETS[0]);
	const [customValues, setCustomValues] = useState<number[]>([100, 200, 300, 400, 500]);
	const [currentMode, setCurrentMode] = useState<'content' | 'styling'>('content');
	const [selectedTheme, setSelectedTheme] = useState<BoardTheme>(BOARD_THEMES[0]);
	const [selectedFont, setSelectedFont] = useState<FontStyle>(FONT_STYLES[0]);
	const [selectedAnimation, setSelectedAnimation] = useState<AnimationStyle>(ANIMATION_STYLES[0]);

	const [categories, setCategories] = useState<string[]>(['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5', 'Category 6']);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	const addCategory = () => {
		setCategories(prev => [...prev, `Category ${prev.length + 1}`]);
	};

	const removeCategory = (index: number) => {
		if (categories.length > 1) {
			setCategories(prev => prev.filter((_, i) => i !== index));
		}
	};

	const updateValuePreset = (preset: ValuePreset) => {
		setSelectedPreset(preset);
		if (preset.name !== 'Custom') {
			setCustomValues(preset.values);
		}
	};

	const updateCustomValues = (newValues: number[]) => {
		setCustomValues(newValues);
	};

	return (
		<div 
			className="min-h-screen"
			style={{ 
				background: selectedTheme.backgroundColor,
				fontFamily: selectedFont.fontFamily,
				fontSize: selectedFont.fontSize,
				fontWeight: selectedFont.fontWeight,
				transition: selectedAnimation.transition
			}}
		>
			<AnimatePresence mode="wait">
				{currentMode === 'content' ? (
					<motion.div
						key="content"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.3 }}
					>
						{/* Header */}
						<div className="text-center mb-8 pt-8">
							<h1 className="text-4xl font-bold mb-2" style={{ color: selectedTheme.categoryTextColor }}>
								Jeopardy Creator
							</h1>
							<p className="text-lg" style={{ color: selectedTheme.questionTextColor }}>
								Build your own custom Jeopardy game
							</p>
						</div>

						{/* Game Title */}
						<div className="max-w-2xl mx-auto mb-8 px-6">
							<label className="block text-sm font-medium mb-2" style={{ color: selectedTheme.categoryTextColor }}>
								Game Title
							</label>
							<input
								type="text"
								value={gameTitle}
								onChange={(e) => setGameTitle(e.target.value)}
								className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								style={{
									backgroundColor: selectedTheme.questionCellBackground,
									borderColor: selectedTheme.borderColor,
									color: selectedTheme.questionTextColor
								}}
								placeholder="Enter your game title"
							/>
						</div>

						{/* Game Board */}
						<div className="max-w-6xl mx-auto mb-8 px-6">
							<div 
								className="rounded-xl p-6"
								style={{
									backgroundColor: selectedTheme.boardBackground,
									borderColor: selectedTheme.borderColor,
									border: `1px solid ${selectedTheme.borderColor}`,
									boxShadow: selectedTheme.shadowStyle
								}}
							>
								<div 
									className="grid gap-2"
									style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}
								>
									{/* Category Headers */}
									{categories.map((category, index) => (
										<div
											key={`category-${index}`}
											className="p-4 text-center rounded-lg font-semibold"
											style={{
												backgroundColor: selectedTheme.categoryBackground,
												color: selectedTheme.categoryTextColor
											}}
										>
											{category}
										</div>
									))}

									{/* Question Cells */}
									{Array.from({ length: 5 }).map((_, rowIndex) => (
										categories.map((_, colIndex) => {
											const isCompleted = Math.random() > 0.7;
											const values = selectedPreset.name === 'Custom' ? customValues : selectedPreset.values;
											
											return (
												<motion.div
													key={`cell-${rowIndex}-${colIndex}`}
													className="aspect-square flex items-center justify-center text-2xl font-bold rounded-lg cursor-pointer"
													style={{
														backgroundColor: isCompleted ? selectedTheme.completedCellBackground : selectedTheme.questionCellBackground,
														color: isCompleted ? selectedTheme.completedCellTextColor : selectedTheme.questionTextColor,
														borderColor: selectedTheme.borderColor,
														border: `1px solid ${selectedTheme.borderColor}`,
														transition: selectedAnimation.transition
													}}
													whileHover={{ 
														scale: selectedAnimation.hoverScale,
														backgroundColor: selectedTheme.questionCellHoverBackground
													}}
													whileTap={{ 
														scale: selectedAnimation.tapScale 
													}}
												>
													{isCompleted ? '✓' : `$${values[rowIndex]}`}
												</motion.div>
											);
										})
									))}
								</div>
							</div>
						</div>

						{/* Board Controls */}
						<div 
							className="max-w-4xl mx-auto mb-8 flex items-center justify-center gap-6 p-4 rounded-lg"
							style={{
								backgroundColor: selectedTheme.boardBackground,
								border: `1px solid ${selectedTheme.borderColor}`
							}}
						>
							<div className="flex items-center gap-2">
								<label 
									className="text-sm"
									style={{ color: selectedTheme.questionTextColor }}
								>
									Categories:
								</label>
								<button
									onClick={addCategory}
									className="px-2 py-1 rounded transition-colors"
									style={{
										backgroundColor: selectedTheme.categoryBackground,
										color: selectedTheme.categoryTextColor
									}}
								>
									+
								</button>
								<span 
									className="text-sm"
									style={{ color: selectedTheme.questionTextColor }}
								>
									{categories.length}
								</span>
								<button
									onClick={() => removeCategory(categories.length - 1)}
									disabled={categories.length <= 1}
									className="px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									style={{
										backgroundColor: '#ef4444',
										color: '#ffffff'
									}}
								>
									-
								</button>
							</div>
							<div className="flex items-center gap-2">
								<label 
									className="text-sm"
									style={{ color: selectedTheme.questionTextColor }}
								>
									Point Values:
								</label>
								<select
									value={selectedPreset.name}
									onChange={(e) => {
										const preset = VALUE_PRESETS.find(p => p.name === e.target.value) || VALUE_PRESETS[0];
										updateValuePreset(preset);
									}}
									className="px-3 py-1 rounded text-sm"
									style={{
										backgroundColor: selectedTheme.questionCellBackground,
										color: selectedTheme.questionTextColor,
										border: `1px solid ${selectedTheme.borderColor}`
									}}
								>
									{VALUE_PRESETS.map(preset => (
										<option key={preset.name} value={preset.name}>
											{preset.name}
										</option>
									))}
								</select>
							</div>
						</div>

						{/* Custom Values Editor */}
						{selectedPreset.name === 'Custom' && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								exit={{ opacity: 0, height: 0 }}
								className="max-w-4xl mx-auto mb-8 p-4 rounded-lg"
								style={{
									backgroundColor: selectedTheme.boardBackground,
									border: `1px solid ${selectedTheme.borderColor}`
								}}
							>
								<h3 
									className="font-semibold mb-3"
									style={{ color: selectedTheme.categoryTextColor }}
								>
									Custom Point Values
								</h3>
								<div className="flex items-center gap-2">
									{customValues.map((value, index) => (
										<div key={index} className="flex flex-col items-center">
											<label 
												className="text-xs mb-1"
												style={{ color: selectedTheme.questionTextColor }}
											>
												Row {index + 1}
											</label>
											<input
												type="number"
												value={value}
												onChange={(e) => {
													const newValues = [...customValues];
													newValues[index] = parseInt(e.target.value) || 0;
													updateCustomValues(newValues);
												}}
												className="w-20 p-2 rounded text-center"
												style={{
													backgroundColor: selectedTheme.questionCellBackground,
													color: selectedTheme.questionTextColor,
													border: `1px solid ${selectedTheme.borderColor}`
												}}
											/>
										</div>
									))}
								</div>
							</motion.div>
						)}
					</motion.div>
				) : (
					<motion.div
						key="styling"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.3 }}
						className="p-6"
					>
						{/* Styling Header */}
						<div className="text-center mb-8">
							<h1 
								className="text-4xl font-bold mb-2"
								style={{ color: selectedTheme.categoryTextColor }}
							>
								Style Your Jeopardy Board
							</h1>
							<p 
								className="text-lg"
								style={{ color: selectedTheme.questionTextColor }}
							>
								Customize the appearance of your Jeopardy game
							</p>
						</div>

						{/* Preview Board */}
						<div className="max-w-4xl mx-auto mb-8">
							<div 
								className="rounded-xl p-6"
								style={{
									backgroundColor: selectedTheme.boardBackground,
									borderColor: selectedTheme.borderColor,
									border: `1px solid ${selectedTheme.borderColor}`,
									boxShadow: selectedTheme.shadowStyle
								}}
							>
								<div 
									className="grid gap-2"
									style={{ gridTemplateColumns: `repeat(3, 1fr)` }}
								>
									{/* Sample Category Headers */}
									{['History', 'Science', 'Sports'].map((category, index) => (
										<div
											key={`sample-category-${index}`}
											className="p-4 text-center rounded-lg font-semibold"
											style={{
												backgroundColor: selectedTheme.categoryBackground,
												color: selectedTheme.categoryTextColor,
												fontFamily: selectedFont.fontFamily
											}}
										>
											{category}
										</div>
									))}

									{/* Sample Question Cells */}
									{Array.from({ length: 6 }).map((_, index) => {
										const isCompleted = index === 2 || index === 4;
										const values = selectedPreset.name === 'Custom' ? customValues : selectedPreset.values;
										const rowIndex = Math.floor(index / 3);
										
										return (
											<motion.div
												key={`sample-cell-${index}`}
												className="aspect-square flex items-center justify-center text-2xl font-bold rounded-lg cursor-pointer"
												style={{
													backgroundColor: isCompleted ? selectedTheme.completedCellBackground : selectedTheme.questionCellBackground,
													color: isCompleted ? selectedTheme.completedCellTextColor : selectedTheme.questionTextColor,
													borderColor: selectedTheme.borderColor,
													border: `1px solid ${selectedTheme.borderColor}`,
													fontFamily: selectedFont.fontFamily,
													transition: selectedAnimation.transition
												}}
												whileHover={{ 
													scale: selectedAnimation.hoverScale,
													backgroundColor: selectedTheme.questionCellHoverBackground
												}}
												whileTap={{ 
													scale: selectedAnimation.tapScale 
												}}
											>
												{isCompleted ? '✓' : `$${values[rowIndex] || 100}`}
											</motion.div>
										);
									})}
								</div>
							</div>
						</div>

						{/* Styling Controls */}
						<div className="max-w-6xl mx-auto space-y-8">
							{/* Theme Selection */}
							<div 
								className="p-6 rounded-lg"
								style={{
									backgroundColor: selectedTheme.boardBackground,
									border: `1px solid ${selectedTheme.borderColor}`
								}}
							>
								<h3 
									className="font-semibold mb-4"
									style={{ color: selectedTheme.categoryTextColor }}
								>
									Board Themes
								</h3>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									{BOARD_THEMES.map(theme => (
										<motion.button
											key={theme.id}
											onClick={() => setSelectedTheme(theme)}
											className="p-4 rounded-lg border-2 transition-all"
											style={{
												backgroundColor: theme.boardBackground,
												borderColor: selectedTheme.id === theme.id ? '#8b5cf6' : theme.borderColor,
												background: theme.backgroundColor.includes('gradient') ? theme.backgroundColor : theme.boardBackground
											}}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											<div className="mb-2">
												<div 
													className="w-full h-8 rounded mb-2"
													style={{ backgroundColor: theme.categoryBackground }}
												></div>
												<div className="grid grid-cols-2 gap-1">
													<div 
														className="h-4 rounded"
														style={{ backgroundColor: theme.questionCellBackground }}
													></div>
													<div 
														className="h-4 rounded"
														style={{ backgroundColor: theme.completedCellBackground }}
													></div>
												</div>
											</div>
											<p 
												className="text-sm font-medium"
												style={{ color: theme.categoryTextColor }}
											>
												{theme.name}
											</p>
										</motion.button>
									))}
								</div>
							</div>

							{/* Font & Animation Settings */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div 
									className="p-6 rounded-lg"
									style={{
										backgroundColor: selectedTheme.boardBackground,
										border: `1px solid ${selectedTheme.borderColor}`
									}}
								>
									<h3 
										className="font-semibold mb-4"
										style={{ color: selectedTheme.categoryTextColor }}
									>
										Typography
									</h3>
									<div className="space-y-3">
										{FONT_STYLES.map(font => (
											<button
												key={font.id}
												onClick={() => setSelectedFont(font)}
												className="w-full p-3 rounded border text-left transition-all"
												style={{
													backgroundColor: selectedFont.id === font.id ? selectedTheme.categoryBackground : selectedTheme.questionCellBackground,
													borderColor: selectedFont.id === font.id ? '#8b5cf6' : selectedTheme.borderColor,
													color: selectedTheme.categoryTextColor,
													fontFamily: font.fontFamily,
													fontWeight: font.fontWeight
												}}
											>
												{font.name} - Sample Text
											</button>
										))}
									</div>
								</div>

								<div 
									className="p-6 rounded-lg"
									style={{
										backgroundColor: selectedTheme.boardBackground,
										border: `1px solid ${selectedTheme.borderColor}`
									}}
								>
									<h3 
										className="font-semibold mb-4"
										style={{ color: selectedTheme.categoryTextColor }}
									>
										Animations
									</h3>
									<div className="space-y-3">
										{ANIMATION_STYLES.map(animation => (
											<button
												key={animation.id}
												onClick={() => setSelectedAnimation(animation)}
												className="w-full p-3 rounded border text-left transition-all"
												style={{
													backgroundColor: selectedAnimation.id === animation.id ? selectedTheme.categoryBackground : selectedTheme.questionCellBackground,
													borderColor: selectedAnimation.id === animation.id ? '#8b5cf6' : selectedTheme.borderColor,
													color: selectedTheme.categoryTextColor,
													transition: animation.transition
												}}
											>
												{animation.name}
											</button>
										))}
									</div>
								</div>
							</div>

							{/* Advanced Color Customization */}
							<div 
								className="p-6 rounded-lg"
								style={{
									backgroundColor: selectedTheme.boardBackground,
									border: `1px solid ${selectedTheme.borderColor}`
								}}
							>
								<h3 
									className="font-semibold mb-4"
									style={{ color: selectedTheme.categoryTextColor }}
								>
									Advanced Customization
								</h3>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<div>
										<label 
											className="block text-sm font-medium mb-2"
											style={{ color: selectedTheme.questionTextColor }}
										>
											Category Background
										</label>
										<input 
											type="color" 
											value={selectedTheme.categoryBackground} 
											onChange={(e) => setSelectedTheme({...selectedTheme, categoryBackground: e.target.value})}
											className="w-full h-10 rounded border"
											style={{ borderColor: selectedTheme.borderColor }}
										/>
									</div>
									<div>
										<label 
											className="block text-sm font-medium mb-2"
											style={{ color: selectedTheme.questionTextColor }}
										>
											Question Cell Background
										</label>
										<input 
											type="color" 
											value={selectedTheme.questionCellBackground} 
											onChange={(e) => setSelectedTheme({...selectedTheme, questionCellBackground: e.target.value})}
											className="w-full h-10 rounded border"
											style={{ borderColor: selectedTheme.borderColor }}
										/>
									</div>
									<div>
										<label 
											className="block text-sm font-medium mb-2"
											style={{ color: selectedTheme.questionTextColor }}
										>
											Text Color
										</label>
										<input 
											type="color" 
											value={selectedTheme.questionTextColor} 
											onChange={(e) => setSelectedTheme({...selectedTheme, questionTextColor: e.target.value})}
											className="w-full h-10 rounded border"
											style={{ borderColor: selectedTheme.borderColor }}
										/>
									</div>
									<div>
										<label 
											className="block text-sm font-medium mb-2"
											style={{ color: selectedTheme.questionTextColor }}
										>
											Border Color
										</label>
										<input 
											type="color" 
											value={selectedTheme.borderColor} 
											onChange={(e) => setSelectedTheme({...selectedTheme, borderColor: e.target.value})}
											className="w-full h-10 rounded border"
											style={{ borderColor: selectedTheme.borderColor }}
										/>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Floating Buttons */}
			{currentMode === 'content' && (
				<motion.button
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={() => setCurrentMode('styling')}
					className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-colors z-40"
				>
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
					</svg>
				</motion.button>
			)}

			{currentMode === 'styling' && (
				<motion.button
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={() => setCurrentMode('content')}
					className="fixed bottom-6 left-6 bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-full shadow-lg transition-colors z-40"
				>
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
				</motion.button>
			)}
		</div>
	);
}
