'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/config';
import UnsubscribeModal from '@/components/UnsubscribeModal';
import ChangePasswordForm from '@/components/ChangePasswordForm';

export default function ProfilePage() {
	const { user, loading } = useAuthGuard();
	const [isEditing, setIsEditing] = useState(false);
	const [subscriptionStatus, setSubscriptionStatus] = useState<{ status: string } | null>(null);
	const [isUnsubscribing, setIsUnsubscribing] = useState(false);
	const [isSubscribing, setIsSubscribing] = useState(false);
	const [isUnsubscribeModalOpen, setIsUnsubscribeModalOpen] = useState(false);
	const [newsletterMessage, setNewsletterMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		username: '',
		school: '',
		grade: '',
		subject: '',
		bio: '',
	});
	const [saving, setSaving] = useState(false);

	// Fetch newsletter subscription status
	useEffect(() => {
		if (user) {

			const fetchSubscriptionStatus = async () => {
				try {
					const response = await fetch(getApiUrl(`/api/newsletter/status?email=${user.email}`));
					if (response.ok) {
						const data = await response.json();
						setSubscriptionStatus(data);
					}
				} catch (error) {
					console.error('Error fetching newsletter status:', error);
				}
			};
			fetchSubscriptionStatus();
		}
	}, [user]);

	// Initialize form data when user loads
	useEffect(() => {
		if (user) {
			setFormData({
				firstName: user.firstName || '',
				lastName: user.lastName || '',
				username: user.username || '',
				school: user.school || '',
				grade: user.grade || '',
				subject: user.subject || '',
				bio: user.bio || '',
			});
		}
	}, [user]);

	const handleSave = async () => {
		// if (!user || !updateUserData) {
		// 	console.error('Cannot save: user data or update function not available');
		// 	return;
		// }
		setSaving(true);
		try {
			const response = await fetch(getApiUrl(`/api/users/${user?.id}`), {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				// Update successful  
				setIsEditing(false);
			} else {
				throw new Error('Failed to update profile');
			}
		} catch (error) {
			console.error('Error updating profile:', error);
			alert('Failed to update profile');
		} finally {
			setSaving(false);
		}
	};

	const handleUnsubscribe = async () => {
		if (!user) return;
		setIsUnsubscribing(true);
		setNewsletterMessage(null);
		try {
			const response = await fetch(getApiUrl('/api/newsletter/unsubscribe'), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email: user.email }),
			});

			if (response.ok) {
				setSubscriptionStatus({ status: 'unsubscribed' });
				setNewsletterMessage({ type: 'success', message: 'Successfully unsubscribed from newsletter!' });
			} else {
				setNewsletterMessage({ type: 'error', message: 'Failed to unsubscribe. Please try again.' });
			}
		} catch (error) {
			console.error('Error unsubscribing:', error);
			setNewsletterMessage({ type: 'error', message: 'Failed to unsubscribe. Please try again.' });
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
				body: JSON.stringify({ email: user.email, firstName: user.firstName, lastName: user.lastName }),
			});

			if (response.ok) {
				setSubscriptionStatus({ status: 'confirmed' });
				setNewsletterMessage({ 
					type: 'success', 
					message: 'Successfully subscribed to newsletter!'
				});
			} else {
				setNewsletterMessage({ type: 'error', message: 'Failed to subscribe. Please try again.' });
			}
		} catch (error) {
			console.error('Error subscribing:', error);
			setNewsletterMessage({ type: 'error', message: 'Failed to subscribe. Please try again.' });
		} finally {
			setIsSubscribing(false);
		}
	};

	// Clear message after 5 seconds
	useEffect(() => {
		if (newsletterMessage) {
			const timer = setTimeout(() => setNewsletterMessage(null), 5000);
			return () => clearTimeout(timer);
		}
	}, [newsletterMessage]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b sticky top-16 z-10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-4">
							<Link 
								href="/dashboard" 
								className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
								Back to Dashboard
							</Link>
							<div className="border-l pl-4">
								<h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
								<p className="text-sm text-gray-600">Manage your account information</p>
							</div>
						</div>
						{!isEditing && (
							<button
								onClick={() => setIsEditing(true)}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							>
								Edit Profile
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="bg-white rounded-lg shadow-lg p-8">
					{/* Profile Picture Section */}
					<div className="text-center mb-8">
						<div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
							{user.firstName ? user.firstName[0] : user.email[0]}
						</div>
						<h2 className="text-2xl font-bold text-gray-900">
							{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
						</h2>
						<p className="text-gray-600">{user.email}</p>
					</div>

					{/* Profile Form */}
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									First Name
								</label>
								{isEditing ? (
									<input
										type="text"
										value={formData.firstName}
										onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								) : (
									<div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
										{user.firstName || 'Not set'}
									</div>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Last Name
								</label>
								{isEditing ? (
									<input
										type="text"
										value={formData.lastName}
										onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								) : (
									<div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
										{user.lastName || 'Not set'}
									</div>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Username
								</label>
								{isEditing ? (
									<input
										type="text"
										value={formData.username}
										onChange={(e) => setFormData({ ...formData, username: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								) : (
									<div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
										{user.username || 'Not set'}
									</div>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									School
								</label>
								{isEditing ? (
									<input
										type="text"
										value={formData.school}
										onChange={(e) => setFormData({ ...formData, school: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								) : (
									<div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
										{user.school || 'Not set'}
									</div>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Grade Level
								</label>
								{isEditing ? (
									<input
										type="text"
										value={formData.grade}
										onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder="e.g. 5th Grade, High School"
									/>
								) : (
									<div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
										{user.grade || 'Not set'}
									</div>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Subject
								</label>
								{isEditing ? (
									<input
										type="text"
										value={formData.subject}
										onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder="e.g. Mathematics, Science, History"
									/>
								) : (
									<div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
										{user.subject || 'Not set'}
									</div>
								)}
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Bio
							</label>
							{isEditing ? (
								<textarea
									value={formData.bio}
									onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
									rows={4}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Tell us about yourself..."
								/>
							) : (
								<div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 min-h-[100px]">
									{user.bio || 'No bio added yet'}
								</div>
							)}
						</div>

						{isEditing && (
							<div className="flex justify-end gap-3 pt-6 border-t">
								<button
									onClick={() => setIsEditing(false)}
									className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
									disabled={saving}
								>
									Cancel
								</button>
								<button
									onClick={handleSave}
									disabled={saving}
									className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
								>
									{saving ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
											Saving...
										</>
									) : (
										'Save Changes'
									)}
								</button>
							</div>
						)}
					</div>

					{/* Change Password Section */}
					<div className="mt-8 pt-8 border-t">
						<ChangePasswordForm />
					</div>

					{/* Newsletter Subscription Section */}
					<div className="mt-8 pt-8 border-t">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Newsletter Subscription</h3>
						
						{/* Success/Error Messages */}
						{newsletterMessage && (
							<div className={`mb-4 p-4 rounded-lg border ${
								newsletterMessage.type === 'success' 
									? 'bg-green-50 border-green-200 text-green-800' 
									: 'bg-red-50 border-red-200 text-red-800'
							}`}>
								<div className="flex items-center">
									{newsletterMessage.type === 'success' ? (
										<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
											<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									) : (
										<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
											<path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									)}
									<span className="font-medium">{newsletterMessage.message}</span>
								</div>
							</div>
						)}

						<div className="bg-gray-50 p-6 rounded-lg">
							{subscriptionStatus ? (
								<div className="space-y-4">
									{/* Status Display */}
									<div className="flex items-center gap-3">
										<div className={`w-4 h-4 rounded-full flex items-center justify-center ${
											subscriptionStatus.status === 'confirmed' ? 'bg-green-500' :
											subscriptionStatus.status === 'pending' ? 'bg-yellow-500' :
											'bg-gray-400'
										}`}>
											{subscriptionStatus.status === 'confirmed' && (
												<svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
													<path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
												</svg>
											)}
										</div>
										<div>
											<p className="font-medium text-gray-900">
												{subscriptionStatus.status === 'confirmed' && 'Newsletter Subscription Active'}
												{subscriptionStatus.status === 'pending' && 'Subscription Pending Confirmation'}
												{subscriptionStatus.status === 'unsubscribed' && 'Not Subscribed'}
											</p>
											<p className="text-sm text-gray-600">
												{subscriptionStatus.status === 'confirmed' && 'You\'ll receive our latest updates and educational content'}
												{subscriptionStatus.status === 'pending' && 'Please check your email to confirm your subscription'}
												{subscriptionStatus.status === 'unsubscribed' && 'You\'re not currently subscribed to our newsletter'}
											</p>
										</div>
									</div>
									
									{/* Action Buttons */}
									<div className="flex gap-3 pt-2">
										{subscriptionStatus.status === 'confirmed' && (
											<button
												onClick={() => setIsUnsubscribeModalOpen(true)}
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
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
														</svg>
														Unsubscribe
													</>
												)}
											</button>
										)}
										
										{(subscriptionStatus.status === 'unsubscribed' || subscriptionStatus.status === 'pending') && (
											<button
												onClick={handleSubscribe}
												disabled={isSubscribing}
												className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
											>
												{isSubscribing ? (
													<>
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
														{subscriptionStatus.status === 'pending' ? 'Resubscribing...' : 'Subscribing...'}
													</>
												) : (
													<>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
														</svg>
														{subscriptionStatus.status === 'pending' ? 'Resend Confirmation' : 'Subscribe'}
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
									<span className="text-gray-600">Loading subscription status...</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
