'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ChangePasswordForm() {
	const [formData, setFormData] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

	const { changePassword } = useAuth();

	const validateForm = () => {
		const errors: {[key: string]: string} = {};
		
		// Current password validation
		if (!formData.currentPassword) {
			errors.currentPassword = 'Current password is required';
		}
		
		// New password validation
		if (!formData.newPassword) {
			errors.newPassword = 'New password is required';
		} else if (formData.newPassword.length < 6) {
			errors.newPassword = 'New password must be at least 6 characters';
		}
		
		// Confirm password validation
		if (!formData.confirmPassword) {
			errors.confirmPassword = 'Please confirm your new password';
		} else if (formData.newPassword !== formData.confirmPassword) {
			errors.confirmPassword = 'Passwords do not match';
		}
		
		// Check that new password is different from current
		if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
			errors.newPassword = 'New password must be different from current password';
		}
		
		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setMessage('');
		setValidationErrors({});

		if (!validateForm()) {
			return;
		}

		setLoading(true);
		try {
			await changePassword(formData.currentPassword, formData.newPassword);
			setMessage('Password changed successfully');
			setFormData({
				currentPassword: '',
				newPassword: '',
				confirmPassword: '',
			});
		} catch (error) {
			console.error('Password change error:', error);
			
			if (error instanceof Error) {
				const message = error.message.toLowerCase();
				if (message.includes('current password')) {
					setValidationErrors({ currentPassword: error.message });
				} else if (message.includes('new password')) {
					setValidationErrors({ newPassword: error.message });
				} else {
					setError(error.message);
				}
			} else {
				setError('Failed to change password. Please try again.');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
		
		// Clear validation error for this field
		if (validationErrors[e.target.name]) {
			setValidationErrors({
				...validationErrors,
				[e.target.name]: '',
			});
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-lg p-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>
			
			{/* Success Message */}
			{message && (
				<div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
					<div className="flex">
						<div className="flex-shrink-0">
							<svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
							</svg>
						</div>
						<div className="ml-3">
							<p className="text-sm text-green-800">{message}</p>
						</div>
					</div>
				</div>
			)}

			{/* Error Message */}
			{error && (
				<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
					<div className="flex">
						<div className="flex-shrink-0">
							<svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
							</svg>
						</div>
						<div className="ml-3">
							<p className="text-sm text-red-800">{error}</p>
						</div>
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Current Password */}
				<div>
					<label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
						Current Password *
					</label>
					<input
						type="password"
						id="currentPassword"
						name="currentPassword"
						required
						value={formData.currentPassword}
						onChange={handleInputChange}
						className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
							validationErrors.currentPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
						}`}
						placeholder="Enter your current password"
						disabled={loading}
					/>
					{validationErrors.currentPassword && (
						<p className="mt-1 text-sm text-red-600">{validationErrors.currentPassword}</p>
					)}
				</div>

				{/* New Password */}
				<div>
					<label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
						New Password *
					</label>
					<input
						type="password"
						id="newPassword"
						name="newPassword"
						required
						value={formData.newPassword}
						onChange={handleInputChange}
						className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
							validationErrors.newPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
						}`}
						placeholder="Enter your new password"
						minLength={6}
						disabled={loading}
					/>
					{validationErrors.newPassword && (
						<p className="mt-1 text-sm text-red-600">{validationErrors.newPassword}</p>
					)}
					<p className="mt-1 text-sm text-gray-500">
						Password must be at least 6 characters long
					</p>
				</div>

				{/* Confirm New Password */}
				<div>
					<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
						Confirm New Password *
					</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						required
						value={formData.confirmPassword}
						onChange={handleInputChange}
						className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
							validationErrors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
						}`}
						placeholder="Confirm your new password"
						disabled={loading}
					/>
					{validationErrors.confirmPassword && (
						<p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
					)}
				</div>

				{/* Submit Button */}
				<div className="pt-4">
					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
								Changing Password...
							</>
						) : (
							'Change Password'
						)}
					</button>
				</div>
			</form>
		</div>
	);
}