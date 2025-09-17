'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PasswordEncryption } from '@/lib/encryption';

function ResetPasswordForm() {
	const [token, setToken] = useState<string | null>(null);
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [validatingToken, setValidatingToken] = useState(true);
	const [userEmail, setUserEmail] = useState('');
	
	const searchParams = useSearchParams();
	const router = useRouter();

	useEffect(() => {
		const tokenFromUrl = searchParams.get('token');
		if (tokenFromUrl) {
			setToken(tokenFromUrl);
			validateToken(tokenFromUrl);
		} else {
			setError('No reset token provided');
			setValidatingToken(false);
		}
	}, [searchParams]);

	const validateToken = async (token: string) => {
		try {
			const response = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
			const data = await response.json();

			if (data.success) {
				setUserEmail(data.data.email);
			} else {
				setError(data.error || 'Invalid or expired reset token');
			}
		} catch {
			setError('Failed to validate reset token');
		} finally {
			setValidatingToken(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setMessage('');
		setLoading(true);

		// Password validation
		if (!password) {
			setError('Password is required');
			setLoading(false);
			return;
		}

		if (password.length < 8) {
			setError('Password must be at least 8 characters long');
			setLoading(false);
			return;
		}

		if (password !== confirmPassword) {
			setError('Passwords do not match');
			setLoading(false);
			return;
		}

		// Password strength validation
		if (!/[A-Z]/.test(password)) {
			setError('Password must contain at least one uppercase letter');
			setLoading(false);
			return;
		}

		if (!/[a-z]/.test(password)) {
			setError('Password must contain at least one lowercase letter');
			setLoading(false);
			return;
		}

		if (!/\d/.test(password)) {
			setError('Password must contain at least one number');
			setLoading(false);
			return;
		}

		if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
			setError('Password must contain at least one special character');
			setLoading(false);
			return;
		}

		try {
			// Encrypt password before sending
			const encryptedPassword = PasswordEncryption.encryptPassword(password);

			const response = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ 
					token,
					password: encryptedPassword 
				}),
			});

			const data = await response.json();

			if (data.success) {
				setMessage(data.message);
				// Redirect to login after 3 seconds
				setTimeout(() => {
					router.push('/');
				}, 3000);
			} else {
				setError(data.error || 'Failed to reset password');
			}
		} catch {
			setError('An error occurred. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	if (validatingToken) {
		return (
			<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
				<div className="sm:mx-auto sm:w-full sm:max-w-md">
					<div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
							<p className="mt-2 text-sm text-gray-600">Validating reset token...</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error && !token) {
		return (
			<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
				<div className="sm:mx-auto sm:w-full sm:max-w-md">
					<div className="text-center">
						<h2 className="mt-6 text-3xl font-bold text-gray-900">
							Invalid Reset Link
						</h2>
					</div>
				</div>
				<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
					<div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
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
						<div className="text-center">
							<Link
								href="/forgot-password"
								className="font-medium text-blue-600 hover:text-blue-500"
							>
								Request a new reset link
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-bold text-gray-900">
						Reset your password
					</h2>
					{userEmail && (
						<p className="mt-2 text-sm text-gray-600">
							Reset password for {userEmail}
						</p>
					)}
				</div>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
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
									<p className="text-xs text-green-600 mt-1">Redirecting to login...</p>
								</div>
							</div>
						</div>
					)}

					{/* Error Message */}
					{error && token && (
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

					{!message && (
						<form className="space-y-6" onSubmit={handleSubmit}>
							<div>
								<label htmlFor="password" className="block text-sm font-medium text-gray-700">
									New Password
								</label>
								<div className="mt-1">
									<input
										id="password"
										name="password"
										type="password"
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
										placeholder="Enter your new password"
									/>
								</div>
								<div className="mt-1 text-xs text-gray-500">
									Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
								</div>
							</div>

							<div>
								<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
									Confirm New Password
								</label>
								<div className="mt-1">
									<input
										id="confirmPassword"
										name="confirmPassword"
										type="password"
										required
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
										placeholder="Confirm your new password"
									/>
								</div>
							</div>

							<div>
								<button
									type="submit"
									disabled={loading}
									className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{loading ? 'Resetting...' : 'Reset Password'}
								</button>
							</div>
						</form>
					)}

					<div className="mt-6 text-center">
						<Link
							href="/"
							className="font-medium text-blue-600 hover:text-blue-500"
						>
							Back to sign in
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
				<div className="sm:mx-auto sm:w-full sm:max-w-md">
					<div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
							<p className="mt-2 text-sm text-gray-600">Loading...</p>
						</div>
					</div>
				</div>
			</div>
		}>
			<ResetPasswordForm />
		</Suspense>
	);
}