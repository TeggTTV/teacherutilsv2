import { useState } from 'react';
import Link from 'next/link';

export const metadata = {
	title: 'Forgot Password | Compyy',
	description:
		'Reset your password on Compyy. Enter your email to receive a password reset link and regain access to your account.',
	alternates: {
		canonical: 'https://compyy.org/forgot-password',
	},
	openGraph: {
		url: 'https://compyy.org/forgot-password',
		title: 'Forgot Password | Compyy',
		description:
			'Reset your password on Compyy. Enter your email to receive a password reset link and regain access to your account.',
		images: [
			{
				url: 'https://compyy.org/Compyy%20Logo%20Icon.png',
				width: 800,
				height: 600,
				alt: 'Compyy Logo',
				type: 'image/png',
			},
		],
		siteName: 'Compyy',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Forgot Password | Compyy',
		description:
			'Reset your password on Compyy. Enter your email to receive a password reset link and regain access to your account.',
		images: ['https://compyy.org/Compyy%20Logo%20Icon.png'],
		site: '@compyy',
		creator: '@compyy',
	},
};

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setMessage('');
		setLoading(true);

		// Email validation
		if (!email || !/\S+@\S+\.\S+/.test(email)) {
			setError('Please enter a valid email address');
			setLoading(false);
			return;
		}

		try {
			const response = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (data.success) {
				setMessage(data.message);
				setEmail('');
			} else {
				setError(data.error || 'An error occurred. Please try again.');
			}
		} catch {
			setError('An error occurred. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-bold text-gray-900">
						Reset your password
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						Enter your email address and we&apos;ll send you a link
						to reset your password.
					</p>
				</div>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
					{/* Success Message */}
					{message && (
						<div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
							<div className="flex">
								<div className="flex-shrink-0">
									<svg
										className="h-5 w-5 text-green-400"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<p className="text-sm text-green-800">
										{message}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Error Message */}
					{error && (
						<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
							<div className="flex">
								<div className="flex-shrink-0">
									<svg
										className="h-5 w-5 text-red-400"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<p className="text-sm text-red-800">
										{error}
									</p>
								</div>
							</div>
						</div>
					)}

					<form className="space-y-6" onSubmit={handleSubmit}>
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700"
							>
								Email address
							</label>
							<div className="mt-1">
								<input
									id="email"
									name="email"
									type="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
									placeholder="Enter your email address"
								/>
							</div>
						</div>

						<div>
							<button
								type="submit"
								disabled={loading}
								className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? 'Sending...' : 'Send reset link'}
							</button>
						</div>
					</form>

					<div className="mt-6">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-300" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-white text-gray-500">
									Or
								</span>
							</div>
						</div>

						<div className="mt-6 text-center">
							<Link
								href="/"
								className="font-medium text-blue-600 hover:text-blue-500"
							>
								Back to sign in
							</Link>
						</div>
					</div>

					{/* Development Notice */}
					{process.env.NODE_ENV === 'development' && !message && (
						<div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
							<p className="text-xs text-blue-800">
								<strong>Development Mode:</strong> Password
								reset emails will be sent using Resend API. Make
								sure RESEND_API_KEY is set in your environment
								variables.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
