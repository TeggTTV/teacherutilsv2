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
		subscribeToNewsletter: true, // Default to true
	});
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
	const [showEmailVerification, setShowEmailVerification] = useState(false);
	const [userEmail, setUserEmail] = useState('');

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
					subscribeToNewsletter: true,
				});
			} else {
				await register(formData);
				// Show email verification message instead of closing immediately
				setUserEmail(formData.email);
				setShowEmailVerification(true);
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
					subscribeToNewsletter: true,
				});
			}
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
		const { name, type, checked, value } = e.target;
		setFormData({
			...formData,
			[name]: type === 'checkbox' ? checked : value,
		});
	};

	// Reset states when modal closes or mode changes
	const handleClose = () => {
		setShowEmailVerification(false);
		setUserEmail('');
		setError('');
		setValidationErrors({});
		onClose();
	};

	const handleModeSwitch = (loginMode: boolean) => {
		setIsLogin(loginMode);
		setShowEmailVerification(false);
		setUserEmail('');
		setError('');
		setValidationErrors({});
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
						{showEmailVerification ? (
							/* Email Verification Screen */
							<div className="text-center">
								{/* Success Icon */}
								<div className="mx-auto flex items-center justify-center w-16 h-16 mb-6 bg-green-100 rounded-full">
									<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
									</svg>
								</div>

								{/* Title and Message */}
								<h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h2>
								<p className="text-gray-600 mb-4">
									We&apos;ve sent a verification link to:
								</p>
								<p className="text-blue-600 font-medium mb-6">{userEmail}</p>
								<p className="text-gray-600 mb-8">
									Click the link in your email to verify your account and complete your registration.
								</p>

								{/* Action Buttons */}
								<div className="space-y-3">
									<button
										onClick={handleClose}
										className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
									>
										Got it, thanks!
									</button>
									<button
										onClick={() => {
											setShowEmailVerification(false);
											handleModeSwitch(true);
										}}
										className="w-full text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
									>
										Back to Sign In
									</button>
								</div>

								{/* Help Text */}
								<div className="mt-8 pt-6 border-t text-sm text-gray-500">
									<p className="mb-2">Didn&apos;t receive the email?</p>
									<ul className="text-left space-y-1">
										<li>• Check your spam/junk folder</li>
										<li>• Make sure you entered the correct email address</li>
										<li>• The email may take a few minutes to arrive</li>
									</ul>
								</div>
							</div>
						) : (
							/* Main Auth Form */
							<div>
								{/* Header */}
								<div className="flex justify-between items-center mb-6">
									<h2 className="text-2xl font-bold text-gray-900">
										{isLogin ? 'Sign In' : 'Create Account'}
									</h2>
									<button
										onClick={handleClose}
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

									{/* Newsletter Subscription */}
									<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
										<div>
											<label htmlFor="subscribeToNewsletter" className="block text-sm font-medium text-gray-700">
												Subscribe to Newsletter
											</label>
											<p className="text-xs text-gray-500">
												Get updates and educational content
											</p>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												id="subscribeToNewsletter"
												name="subscribeToNewsletter"
												checked={formData.subscribeToNewsletter}
												onChange={handleInputChange}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
										</label>
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

							{/* Forgot Password Link - only show on login */}
							{isLogin && (
								<div className="mt-4 text-center">
									<a
										href="/forgot-password"
										className="text-sm text-blue-600 hover:text-blue-700 font-medium"
										onClick={handleClose}
									>
										Forgot your password?
									</a>
								</div>
							)}
						</form>

						{/* Footer */}
						<div className="mt-6 text-center text-sm text-gray-600">
							{isLogin ? (
								<>
									Don&apos;t have an account?{' '}
									<button
										onClick={() => handleModeSwitch(false)}
										className="text-blue-600 hover:text-blue-700 font-medium"
									>
										Sign up
									</button>
								</>
							) : (
								<>
									Already have an account?{' '}
									<button
										onClick={() => handleModeSwitch(true)}
										className="text-blue-600 hover:text-blue-700 font-medium"
									>
										Sign in
									</button>
								</>
							)}
						</div>
						</div>
						)}
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
