'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import EmailVerification from './EmailVerification';
import AdditionalFields from './AdditionalFields';
import Footer from './Footer';

interface AuthModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
	const [isLogin, setIsLogin] = useState(true);
	const [isTeacher, setIsTeacher] = useState(false); // New state for teacher/student toggle
	const [referralValidation, setReferralValidation] = useState<{
		status: 'idle' | 'checking' | 'valid' | 'invalid';
		message?: string;
	}>({ status: 'idle' });
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
		referralCode: '',
	});

	// Auto-populate referralCode from URL if present
	const searchParams = useSearchParams();
	useEffect(() => {
		const ref = searchParams?.get('ref');
		if (ref && !formData.referralCode) {
			setFormData((prev) => ({ ...prev, referralCode: ref }));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [validationErrors, setValidationErrors] = useState<{
		[key: string]: string;
	}>({});

	const [showEmailVerification, setShowEmailVerification] = useState(false);
	const [userEmail, setUserEmail] = useState('');

	const { login, register } = useAuth();

	// Referral code validation function
	const validateReferralCode = async (code: string) => {
		if (!code.trim()) {
			setReferralValidation({ status: 'idle' });
			return;
		}

		setReferralValidation({ status: 'checking' });

		try {
			const response = await fetch(
				`/api/referrals/validate?code=${encodeURIComponent(code)}`
			);
			const result = await response.json();

			if (result.valid) {
				setReferralValidation({
					status: 'valid',
					message: 'Valid referral code!',
				});
			} else {
				setReferralValidation({
					status: 'invalid',
					message: 'Invalid referral code',
				});
			}
		} catch (error) {
			console.error('Error validating referral code:', error);
			setReferralValidation({
				status: 'invalid',
				message: 'Error validating code',
			});
		}
	};

	// Debounced referral validation
	useEffect(() => {
		const timer = setTimeout(() => {
			validateReferralCode(formData.referralCode);
		}, 500);

		return () => clearTimeout(timer);
	}, [formData.referralCode]);

	// Form validation
	const validateForm = () => {
		const errors: { [key: string]: string } = {};

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
					referralCode: '',
				});
			} else {
				const registrationData = {
					...formData,
					isTeacher, // Pass the teacher flag
				};
				await register(registrationData);
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
					referralCode: '',
				});
				setIsTeacher(false);
				setReferralValidation({ status: 'idle' });
			}
		} catch (error) {
			console.error(
				`${isLogin ? 'Login' : 'Registration'} error:`,
				error
			);

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
				setError(
					`${
						isLogin ? 'Login' : 'Registration'
					} failed. Please try again.`
				);
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
		setIsTeacher(false);
		setReferralValidation({ status: 'idle' });
		onClose();
	};

	const handleModeSwitch = (loginMode: boolean) => {
		setIsLogin(loginMode);
		setShowEmailVerification(false);
		setUserEmail('');
		setError('');
		setValidationErrors({});
		setIsTeacher(false);
		setReferralValidation({ status: 'idle' });
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
							<EmailVerification
								handleClose={handleClose}
								handleModeSwitch={handleModeSwitch}
								setShowEmailVerification={
									setShowEmailVerification
								}
								userEmail={userEmail}
							/>
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

								{/* Teacher/Student Toggle - only show during registration */}
								{!isLogin && (
									<div className="mb-6">
										<label className="block text-sm font-medium text-gray-700 mb-3">
											Account Type
										</label>
										<div className="flex bg-gray-100 rounded-lg p-1">
											<button
												type="button"
												onClick={() =>
													setIsTeacher(false)
												}
												className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
													!isTeacher
														? 'bg-white text-blue-600 shadow-sm'
														: 'text-gray-600 hover:text-gray-900'
												}`}
											>
												Student
											</button>
											<button
												type="button"
												onClick={() =>
													setIsTeacher(true)
												}
												className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
													isTeacher
														? 'bg-white text-blue-600 shadow-sm'
														: 'text-gray-600 hover:text-gray-900'
												}`}
											>
												Teacher
											</button>
										</div>
									</div>
								)}

								{/* Error Message */}
								{error && (
									<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
										{error}
									</div>
								)}

								{/* Form */}
								<form
									onSubmit={handleSubmit}
									className="space-y-4"
								>
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
												validationErrors.email
													? 'border-red-300 focus:ring-red-500'
													: 'border-gray-300'
											}`}
											placeholder="Enter your email"
										/>
										{validationErrors.email && (
											<p className="mt-1 text-sm text-red-600">
												{validationErrors.email}
											</p>
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
												validationErrors.password
													? 'border-red-300 focus:ring-red-500'
													: 'border-gray-300'
											}`}
											placeholder="Enter your password"
											minLength={6}
										/>
										{validationErrors.password && (
											<p className="mt-1 text-sm text-red-600">
												{validationErrors.password}
											</p>
										)}
									</div>

									{/* Additional fields for registration */}
									{!isLogin && (
										<AdditionalFields
											formData={formData}
											handleInputChange={
												handleInputChange
											}
											isTeacher={isTeacher}
											referralValidation={
												referralValidation
											}
										/>
									)}

									{/* Submit Button */}
									<button
										type="submit"
										disabled={loading}
										className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
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
								<Footer
									handleModeSwitch={handleModeSwitch}
									isLogin={isLogin}
								/>
							</div>
						)}
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
