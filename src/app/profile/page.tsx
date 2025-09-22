'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/config';
import ChangePasswordForm from '@/components/ChangePasswordForm';
import ProfilePicture from './ProfilePicture';
import ProfileForm from './ProfileForm';
import Refferal from './Referral';
import Newsletter from './Newsletter';

export default function ProfilePage() {
	const { user, loading } = useAuthGuard();
	const [isEditing, setIsEditing] = useState(false);

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
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 19l-7-7 7-7"
									/>
								</svg>
								Back to Dashboard
							</Link>
							<div className="border-l pl-4">
								<h1 className="text-xl font-semibold text-gray-900">
									Profile Settings
								</h1>
								<p className="text-sm text-gray-600">
									Manage your account information
								</p>
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
					<ProfilePicture user={user} />
					{/* Profile Form */}
					<ProfileForm
						user={user}
						isEditing={isEditing}
						formData={formData}
						setFormData={setFormData}
						saving={saving}
						setIsEditing={setIsEditing}
						handleSave={handleSave}
					/>

					{/* Change Password Section */}
					<div className="mt-8 pt-8 border-t">
						<ChangePasswordForm />
					</div>

					<Refferal
						
					/>

					{/* Newsletter Subscription Section */}
					<Newsletter user={user} />
				</div>
			</div>
		</div>
	);
}
