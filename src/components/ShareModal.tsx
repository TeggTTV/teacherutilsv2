'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getApiUrl } from '@/lib/config';

interface ShareModalProps {
	game: {
		id: string;
		title: string;
		description?: string;
		isPublic: boolean;
		tags: string[];
		subject?: string;
		gradeLevel?: string;
		difficulty?: string;
	};
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

export default function ShareModal({ game, isOpen, onClose, onSuccess }: ShareModalProps) {
	const [formData, setFormData] = useState({
		isPublic: game.isPublic,
		description: game.description || '',
		tags: game.tags.join(', '),
		subject: game.subject || '',
		gradeLevel: game.gradeLevel || '',
		difficulty: game.difficulty || ''
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const response = await fetch(getApiUrl(`/api/games/${game.id}/share`), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					...formData,
					tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
				}),
			});

			if (response.ok) {
				onSuccess();
				onClose();
			} else {
				const error = await response.json();
				console.error('Error updating sharing settings:', error.error || 'Failed to update sharing settings');
			}
		} catch (error) {
			console.error('Error updating sharing settings:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center z-50">
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-auto"
			>
				<div className="p-6">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-xl font-bold">Share Game: {game.title}</h2>
						<button
							onClick={onClose}
							className="text-gray-500 hover:text-gray-700 text-2xl"
						>
							×
						</button>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Public Toggle */}
						<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
							<div>
								<h3 className="font-semibold text-gray-900">Make Public</h3>
								<p className="text-sm text-gray-600">Allow other teachers to discover and play your game</p>
							</div>
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									checked={formData.isPublic}
									onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
									className="sr-only peer"
								/>
								<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
							</label>
						</div>

						{formData.isPublic && (
							<>
								{/* Description */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Description
									</label>
									<textarea
										value={formData.description}
										onChange={(e) => setFormData({...formData, description: e.target.value})}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										rows={3}
										placeholder="Describe your game to help other teachers find it..."
									/>
								</div>

								{/* Subject */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Subject
									</label>
									<select
										value={formData.subject}
										onChange={(e) => setFormData({...formData, subject: e.target.value})}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									>
										<option value="">Select subject</option>
										<option value="math">Math</option>
										<option value="science">Science</option>
										<option value="history">History</option>
										<option value="english">English</option>
										<option value="geography">Geography</option>
										<option value="art">Art</option>
									</select>
								</div>

								{/* Grade Level */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Grade Level
									</label>
									<select
										value={formData.gradeLevel}
										onChange={(e) => setFormData({...formData, gradeLevel: e.target.value})}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									>
										<option value="">Select grade level</option>
										<option value="K-2">K-2</option>
										<option value="3-5">3-5</option>
										<option value="6-8">6-8</option>
										<option value="9-12">9-12</option>
										<option value="college">College</option>
									</select>
								</div>

								{/* Difficulty */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Difficulty
									</label>
									<select
										value={formData.difficulty}
										onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									>
										<option value="">Select difficulty</option>
										<option value="beginner">Beginner</option>
										<option value="intermediate">Intermediate</option>
										<option value="advanced">Advanced</option>
									</select>
								</div>

								{/* Tags */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Tags
									</label>
									<input
										type="text"
										value={formData.tags}
										onChange={(e) => setFormData({...formData, tags: e.target.value})}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder="Enter tags separated by commas (e.g., science, chemistry, periodic table)"
									/>
									<p className="text-xs text-gray-500 mt-1">
										Tags help other teachers find your game
									</p>
								</div>
							</>
						)}

						{/* Action Buttons */}
						<div className="flex items-center justify-end space-x-4 pt-4 border-t">
							<button
								type="button"
								onClick={onClose}
								className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={isSubmitting}
								className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
							>
								{isSubmitting ? (
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
								) : null}
								<span>{formData.isPublic ? 'Publish Game' : 'Make Private'}</span>
							</button>
						</div>
					</form>
				</div>
			</motion.div>
		</div>
	);
}
