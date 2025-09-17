'use client';

import { useState } from 'react';
import { getApiUrl } from '@/lib/config';
import TagSelector from './TagSelector';
import Modal from './Modal';

interface TemplateShareModalProps {
	template: {
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

export default function TemplateShareModal({
	template,
	isOpen,
	onClose,
	onSuccess,
}: TemplateShareModalProps) {
	const [formData, setFormData] = useState({
		isPublic: template.isPublic,
		description: template.description || '',
		tags: template.tags,
		subject: template.subject || '',
		gradeLevel: template.gradeLevel || '',
		difficulty: template.difficulty || '',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const response = await fetch(
				getApiUrl(`/api/templates/${template.id}/share`),
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify(formData),
				}
			);

			if (response.ok) {
				setShowSuccess(true);
			} else {
				const error = await response.json();
				console.error(
					'Error updating template sharing settings:',
					error.error || 'Failed to update sharing settings'
				);
			}
		} catch (error) {
			console.error('Error updating template sharing settings:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen && !showSuccess) return null;

	const handleSuccessClose = () => {
		setShowSuccess(false);
		onSuccess();
		onClose();
	};

	return (
		<>
			{/* Success Modal */}
			{showSuccess && (
				<Modal isOpen={showSuccess} onClose={handleSuccessClose}>
					<div className="text-center space-y-4">
						<div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
							<svg
								className="w-6 h-6 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-medium text-gray-900">
							{formData.isPublic
								? 'Template Published Successfully!'
								: 'Template Made Private Successfully!'}
						</h3>
						<p className="text-sm text-gray-600">
							{formData.isPublic
								? 'Your template is now visible to other teachers in the marketplace.'
								: 'Your template is now private and only visible to you.'}
						</p>
						<button
							onClick={handleSuccessClose}
							className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
						>
							Okay
						</button>
					</div>
				</Modal>
			)}

			{/* Main Template Share Modal */}
			{isOpen && !showSuccess && (
				<Modal
					isOpen={isOpen && !showSuccess}
					onClose={onClose}
					maxWidth="2xl"
				>
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-xl font-bold">
							Share Template: {template.title}
						</h2>
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
								<h3 className="font-semibold text-gray-900">
									Make Public
								</h3>
								<p className="text-sm text-gray-600">
									Allow other teachers to discover and
									download your template
								</p>
							</div>
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									checked={formData.isPublic}
									onChange={(e) =>
										setFormData({
											...formData,
											isPublic: e.target.checked,
										})
									}
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
										onChange={(e) =>
											setFormData({
												...formData,
												description: e.target.value,
											})
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										rows={3}
										placeholder="Describe your template to help other teachers find it..."
									/>
								</div>

								{/* Subject */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Subject
									</label>
									<select
										value={formData.subject}
										onChange={(e) =>
											setFormData({
												...formData,
												subject: e.target.value,
											})
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									>
										<option value="">
											(Subject not provided)
										</option>
										<option value="math">Math</option>
										<option value="science">Science</option>
										<option value="history">History</option>
										<option value="english">English</option>
										<option value="geography">
											Geography
										</option>
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
										onChange={(e) =>
											setFormData({
												...formData,
												gradeLevel: e.target.value,
											})
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									>
										<option value="">
											(Grade level not provided)
										</option>
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
										onChange={(e) =>
											setFormData({
												...formData,
												difficulty: e.target.value,
											})
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									>
										<option value="">
											(Difficulty not provided)
										</option>
										<option value="beginner">
											Beginner
										</option>
										<option value="intermediate">
											Intermediate
										</option>
										<option value="advanced">
											Advanced
										</option>
									</select>
								</div>

								{/* Tags */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Tags
									</label>
									<TagSelector
										selectedTags={formData.tags}
										onTagsChange={(tags) =>
											setFormData({ ...formData, tags })
										}
										placeholder="Select or create tags to help others find your template..."
									/>
									<p className="text-xs text-gray-500 mt-1">
										Tags help other teachers find your
										template
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
								<span>
									{formData.isPublic
										? 'Publish Template'
										: 'Make Private'}
								</span>
							</button>
						</div>
					</form>
				</Modal>
			)}
		</>
	);
}
