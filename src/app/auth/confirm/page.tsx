'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ConfirmEmailPage() {
	const [status, setStatus] = useState<'success' | 'error' | 'already-verified'>('error');
	const [message, setMessage] = useState('Processing your email confirmation...');
	const searchParams = useSearchParams();

	useEffect(() => {
		const errorParam = searchParams.get('error');
		const messageParam = searchParams.get('message');

		if (errorParam) {
			setStatus('error');
			switch (errorParam) {
				case 'missing-token':
					setMessage('Invalid confirmation link. Please check your email for the correct link.');
					break;
				case 'invalid-token':
					setMessage('This confirmation link is invalid or has expired. Please request a new confirmation email.');
					break;
				case 'verification-failed':
					setMessage('Email verification failed. Please try again or contact support.');
					break;
				default:
					setMessage('An error occurred during email verification. Please try again.');
			}
		} else if (messageParam === 'email-verified') {
			setStatus('success');
			setMessage('Your email has been successfully verified!');
		} else if (messageParam === 'already-verified') {
			setStatus('already-verified');
			setMessage('Your email is already verified.');
		} else {
			// If no parameters, show loading (though this shouldn't happen)
			setStatus('error');
			setMessage('Invalid confirmation link. Please check your email for the correct link.');
		}
	}, [searchParams]);

	const getIcon = () => {
		switch (status) {
			case 'success':
			case 'already-verified':
				return (
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ duration: 0.5, type: "spring" }}
						className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6"
					>
						<svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					</motion.div>
				);
			case 'error':
				return (
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ duration: 0.5, type: "spring" }}
						className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6"
					>
						<svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</motion.div>
				);
		}
	};

	const getTitle = () => {
		switch (status) {
			case 'success':
				return 'Email Verified Successfully!';
			case 'already-verified':
				return 'Email Already Verified';
			case 'error':
				return 'Verification Failed';
		}
	};

	const getButtonText = () => {
		switch (status) {
			case 'success':
			case 'already-verified':
				return 'Go to Dashboard';
			case 'error':
				return 'Back to Home';
		}
	};

	const getButtonLink = () => {
		switch (status) {
			case 'success':
			case 'already-verified':
				return '/dashboard';
			case 'error':
				return '/';
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
			<motion.div 
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="max-w-md w-full space-y-8"
			>
				<div className="bg-white rounded-2xl shadow-xl p-8 text-center">
					{getIcon()}
					
					<motion.h1 
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2, duration: 0.6 }}
						className="text-2xl font-bold text-gray-900 mb-4"
					>
						{getTitle()}
					</motion.h1>
					
					<motion.p 
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4, duration: 0.6 }}
						className="text-gray-600 mb-8"
					>
						{message}
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6, duration: 0.4 }}
					>
						<Link href={getButtonLink()}>
							<button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
								{getButtonText()}
							</button>
						</Link>
					</motion.div>
				</div>
				
				{status === 'error' && (
					<motion.div 
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.8, duration: 0.4 }}
						className="text-center"
					>
						<p className="text-sm text-gray-500 mb-2">Need help?</p>
						<Link href="/help" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
							Contact Support
						</Link>
					</motion.div>
				)}
			</motion.div>
		</div>
	);
}