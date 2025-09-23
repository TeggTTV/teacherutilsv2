'use client';

import UnsubscribeModal from '@/components/UnsubscribeModal';
import { getApiUrl } from '@/lib/config';
import { User } from '@/types/user';
import React, { useEffect, useState } from 'react';

export default function Newsletter({ user }: { user: User }) {
	const [isUnsubscribeModalOpen, setIsUnsubscribeModalOpen] = useState(false);
	const [isUnsubscribing, setIsUnsubscribing] = useState(false);
	const [isSubscribing, setIsSubscribing] = useState(false);
	const [subscriptionStatus, setSubscriptionStatus] = useState<{
		status: string;
	} | null>(null);

	const [newsletterMessage, setNewsletterMessage] = useState<{
		type: 'success' | 'error';
		message: string;
	} | null>(null);

	const handleUnsubscribe = async () => {
		if (!user) return;
		setIsUnsubscribing(true);
		setNewsletterMessage(null);
		try {
			const response = await fetch(
				getApiUrl('/api/newsletter/unsubscribe'),
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ email: user.email }),
				}
			);

			if (response.ok) {
				setSubscriptionStatus({ status: 'unsubscribed' });
				setNewsletterMessage({
					type: 'success',
					message: 'Successfully unsubscribed from newsletter!',
				});
			} else {
				setNewsletterMessage({
					type: 'error',
					message: 'Failed to unsubscribe. Please try again.',
				});
			}
		} catch (error) {
			console.error('Error unsubscribing:', error);
			setNewsletterMessage({
				type: 'error',
				message: 'Failed to unsubscribe. Please try again.',
			});
		} finally {
			setIsUnsubscribing(false);
		}
	};

	const handleSubscribe = async () => {
		if (!user) return;
		setIsSubscribing(true);
		setNewsletterMessage(null);
		try {
			const response = await fetch(getApiUrl('/api/newsletter'), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
				}),
			});

			if (response.ok) {
				setSubscriptionStatus({ status: 'confirmed' });
				setNewsletterMessage({
					type: 'success',
					message: 'Successfully subscribed to newsletter!',
				});
			} else {
				setNewsletterMessage({
					type: 'error',
					message: 'Failed to subscribe. Please try again.',
				});
			}
		} catch (error) {
			console.error('Error subscribing:', error);
			setNewsletterMessage({
				type: 'error',
				message: 'Failed to subscribe. Please try again.',
			});
		} finally {
			setIsSubscribing(false);
		}
	};

	useEffect(() => {
		if (newsletterMessage) {
			const timer = setTimeout(() => setNewsletterMessage(null), 5000);
			return () => clearTimeout(timer);
		}
	}, [newsletterMessage]);

	useEffect(() => {
		let didCall = false;
		if (!user || didCall) return;
		didCall = true;
		const fetchSubscriptionStatus = async () => {
			try {
				const res = await fetch(
					getApiUrl(
						`/api/newsletter/status?email=${encodeURIComponent(
							user.email
						)}`
					)
				);
				if (res.ok) {
					const data = await res.json();
					setSubscriptionStatus({ status: data.status });
				} else {
					setSubscriptionStatus(null);
				}
			} catch (error) {
				setSubscriptionStatus(null);
                console.error('Error fetching subscription status:', error);
			}
		};
		fetchSubscriptionStatus();
		// Only run when user changes
	}, [user]);

	return (
		<div className="mt-8 pt-8 border-t">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				Newsletter Subscription
			</h3>

			{/* Success/Error Messages */}
			{newsletterMessage && (
				<div
					className={`mb-4 p-4 rounded-lg border ${
						newsletterMessage.type === 'success'
							? 'bg-green-50 border-green-200 text-green-800'
							: 'bg-red-50 border-red-200 text-red-800'
					}`}
				>
					<div className="flex items-center">
						{newsletterMessage.type === 'success' ? (
							<svg
								className="w-5 h-5 mr-2"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						) : (
							<svg
								className="w-5 h-5 mr-2"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						)}
						<span className="font-medium">
							{newsletterMessage.message}
						</span>
					</div>
				</div>
			)}

			<div className="bg-gray-50 p-6 rounded-lg">
				{subscriptionStatus ? (
					<div className="space-y-4">
						{/* Status Display */}
						<div className="flex items-center gap-3">
							<div
								className={`w-4 h-4 rounded-full flex items-center justify-center ${
									subscriptionStatus.status === 'confirmed'
										? 'bg-green-500'
										: subscriptionStatus.status ===
										  'pending'
										? 'bg-yellow-500'
										: 'bg-gray-400'
								}`}
							>
								{subscriptionStatus.status === 'confirmed' && (
									<svg
										className="w-2.5 h-2.5 text-white"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											d="M9 12l2 2 4-4"
											stroke="currentColor"
											strokeWidth="2"
											fill="none"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								)}
							</div>
							<div>
								<p className="font-medium text-gray-900">
									{subscriptionStatus.status ===
										'confirmed' &&
										'Newsletter Subscription Active'}
									{subscriptionStatus.status === 'pending' &&
										'Subscription Pending Confirmation'}
									{subscriptionStatus.status ===
										'unsubscribed' && 'Not Subscribed'}
								</p>
								<p className="text-sm text-gray-600">
									{subscriptionStatus.status ===
										'confirmed' &&
										"You'll receive our latest updates and educational content"}
									{subscriptionStatus.status === 'pending' &&
										'Please check your email to confirm your subscription'}
									{subscriptionStatus.status ===
										'unsubscribed' &&
										"You're not currently subscribed to our newsletter"}
								</p>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3 pt-2">
							{subscriptionStatus.status === 'confirmed' && (
								<button
									onClick={() =>
										setIsUnsubscribeModalOpen(true)
									}
									disabled={isUnsubscribing}
									className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
								>
									{isUnsubscribing ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
											Unsubscribing...
										</>
									) : (
										<>
											<svg
												className="w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
											Unsubscribe
										</>
									)}
								</button>
							)}

							{(subscriptionStatus.status === 'unsubscribed' ||
								subscriptionStatus.status === 'pending') && (
								<button
									onClick={handleSubscribe}
									disabled={isSubscribing}
									className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white border border-blue-600 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
								>
									{isSubscribing ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											{subscriptionStatus.status ===
											'pending'
												? 'Resubscribing...'
												: 'Subscribing...'}
										</>
									) : (
										<>
											<svg
												className="w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M12 4v16m8-8H4"
												/>
											</svg>
											{subscriptionStatus.status ===
											'pending'
												? 'Resend Confirmation'
												: 'Subscribe'}
										</>
									)}
								</button>
							)}
						</div>

						<UnsubscribeModal
							isOpen={isUnsubscribeModalOpen}
							onClose={() => setIsUnsubscribeModalOpen(false)}
							onConfirm={() => {
								handleUnsubscribe();
								setIsUnsubscribeModalOpen(false);
							}}
							isLoading={isUnsubscribing}
						/>
					</div>
				) : (
					<div className="flex items-center gap-3">
						<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
						<span className="text-gray-600">
							Loading subscription status...
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
