'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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
		setSaving(true);
		try {
			const response = await fetch(`/api/users/${user?.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				setIsEditing(false);
				// Refresh user data
				window.location.reload();
			} else {
				alert('Failed to update profile');
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
				<div className="text-lg">Loading...</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
									{saving ? 'Saving...' : 'Save Changes'}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
