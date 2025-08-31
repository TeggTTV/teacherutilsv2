'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
	const [isLogin, setIsLogin] = useState(true);
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		firstName: '',
		lastName: '',
		username: '',
		school: '',
		grade: '',
		subject: '',
	});
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

	const { login, register } = useAuth();

	// Form validation
	const validateForm = () => {
		const errors: {[key: string]: string} = {};
		
		// Email validation
		if (!formData.email) {
			errors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			errors.email = 'Please enter a valid email address';
		}
		
		// Password validation
		if (!formData.password) {
			errors.password = 'Password is required';
		} else if (formData.password.length < 6) {
			errors.password = 'Password must be at least 6 characters';
		}
		
		// Registration-specific validation
		if (!isLogin) {
			if (!formData.firstName) {
				errors.firstName = 'First name is required';
			}
			if (!formData.lastName) {
				errors.lastName = 'Last name is required';
			}
		}
		
		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		// Clear previous errors
		setError('');
		setValidationErrors({});
		
		// Validate form
		if (!validateForm()) {
			return;
		}
		
		setLoading(true);

		try {
			if (isLogin) {
				await login(formData.email, formData.password);
			} else {
				await register(formData);
			}
			onClose();
			// Reset form
			setFormData({
				email: '',
				password: '',
				firstName: '',
				lastName: '',
				username: '',
				school: '',
				grade: '',
				subject: '',
			});
		} catch (error) {
			console.error(`${isLogin ? 'Login' : 'Registration'} error:`, error);
			
			// Handle specific error types
			if (error instanceof Error) {
				const message = error.message.toLowerCase();
				if (message.includes('email')) {
					setValidationErrors({ email: error.message });
				} else if (message.includes('password')) {
					setValidationErrors({ password: error.message });
				} else {
					setError(error.message);
				}
			} else {
				setError(`${isLogin ? 'Login' : 'Registration'} failed. Please try again.`);
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
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
				<motion.div
					initial={{ opacity: 0, scale: 0.98 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.98 }}
					className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200 shadow-lg"
				>
					<div className="p-6">
						{/* Header */}
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-2xl font-bold text-gray-900">
								{isLogin ? 'Sign In' : 'Create Account'}
							</h2>
							<button
								onClick={onClose}
								className="text-gray-400 hover:text-gray-600 text-2xl"
							>
								×
							</button>
						</div>

						{/* Toggle Login/Register */}
						<div className="flex bg-gray-100 rounded-lg p-1 mb-6">
							<button
								onClick={() => setIsLogin(true)}
								className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
									isLogin
										? 'bg-white text-blue-600 shadow-sm'
										: 'text-gray-600 hover:text-gray-900'
								}`}
							>
								Sign In
							</button>
							<button
								onClick={() => setIsLogin(false)}
								className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
									!isLogin
										? 'bg-white text-blue-600 shadow-sm'
										: 'text-gray-600 hover:text-gray-900'
								}`}
							>
								Register
							</button>
						</div>

						{/* Error Message */}
						{error && (
							<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
								{error}
							</div>
						)}

						{/* Form */}
						<form onSubmit={handleSubmit} className="space-y-4">
							{/* Email */}
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Email *
								</label>
								<input
									type="email"
									id="email"
									name="email"
									required
									value={formData.email}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 ${
										validationErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
									}`}
									placeholder="Enter your email"
								/>
								{validationErrors.email && (
									<p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
								)}
							</div>

							{/* Password */}
							<div>
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Password *
								</label>
								<input
									type="password"
									id="password"
									name="password"
									required
									value={formData.password}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 ${
										validationErrors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
									}`}
									placeholder="Enter your password"
									minLength={6}
								/>
								{validationErrors.password && (
									<p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
								)}
							</div>

							{/* Additional fields for registration */}
							{!isLogin && (
								<>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label
												htmlFor="firstName"
												className="block text-sm font-medium text-gray-700 mb-1"
											>
												First Name
											</label>
											<input
												type="text"
												id="firstName"
												name="firstName"
												value={formData.firstName}
												onChange={handleInputChange}
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="John"
											/>
										</div>
										<div>
											<label
												htmlFor="lastName"
												className="block text-sm font-medium text-gray-700 mb-1"
											>
												Last Name
											</label>
											<input
												type="text"
												id="lastName"
												name="lastName"
												value={formData.lastName}
												onChange={handleInputChange}
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="Doe"
											/>
										</div>
									</div>

									<div>
										<label
											htmlFor="username"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Username
										</label>
										<input
											type="text"
											id="username"
											name="username"
											value={formData.username}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder="johndoe"
										/>
									</div>

									<div>
										<label
											htmlFor="school"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											School
										</label>
										<input
											type="text"
											id="school"
											name="school"
											value={formData.school}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder="Lincoln Elementary"
										/>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div>
											<label
												htmlFor="grade"
												className="block text-sm font-medium text-gray-700 mb-1"
											>
												Grade
											</label>
											<input
												type="text"
												id="grade"
												name="grade"
												value={formData.grade}
												onChange={handleInputChange}
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="5th Grade"
											/>
										</div>
										<div>
											<label
												htmlFor="subject"
												className="block text-sm font-medium text-gray-700 mb-1"
											>
												Subject
											</label>
											<input
												type="text"
												id="subject"
												name="subject"
												value={formData.subject}
												onChange={handleInputChange}
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="Mathematics"
											/>
										</div>
									</div>
								</>
							)}

							{/* Submit Button */}
							<button
								type="submit"
								disabled={loading}
								className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
							>
								{loading ? (
									<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
								) : isLogin ? (
									'Sign In'
								) : (
									'Create Account'
								)}
							</button>
						</form>

						{/* Footer */}
						<div className="mt-6 text-center text-sm text-gray-600">
							{isLogin ? (
								<>
									Don&apos;t have an account?{' '}
									<button
										onClick={() => setIsLogin(false)}
										className="text-blue-600 hover:text-blue-700 font-medium"
									>
										Sign up
									</button>
								</>
							) : (
								<>
									Already have an account?{' '}
									<button
										onClick={() => setIsLogin(true)}
										className="text-blue-600 hover:text-blue-700 font-medium"
									>
										Sign in
									</button>
								</>
							)}
						</div>
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
