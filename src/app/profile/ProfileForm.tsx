import { User } from "@/types/user";

export type FormData = {
	firstName: string;
	lastName: string;
	username: string;
	school: string;
	grade: string;
	subject: string;
	bio: string;
};

export default function ProfileForm({user, isEditing, setIsEditing, formData, setFormData, saving, handleSave} : {
    user: User,
    isEditing: boolean,
    setIsEditing: (editing: boolean) => void,
    formData: FormData,
    setFormData: (data: FormData) => void,
    saving: boolean,
    handleSave: () => void
}) {
	return (
		<div className="space-y-6">
			{/* Change Password Section */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						First Name
					</label>
					{isEditing ? (
						<input
							type="text"
							value={formData.firstName}
							onChange={(e) =>
								setFormData({
									...formData,
									firstName: e.target.value,
								})
							}
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
							onChange={(e) =>
								setFormData({
									...formData,
									lastName: e.target.value,
								})
							}
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
							onChange={(e) =>
								setFormData({
									...formData,
									username: e.target.value,
								})
							}
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
							onChange={(e) =>
								setFormData({
									...formData,
									school: e.target.value,
								})
							}
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
							onChange={(e) =>
								setFormData({
									...formData,
									grade: e.target.value,
								})
							}
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
							onChange={(e) =>
								setFormData({
									...formData,
									subject: e.target.value,
								})
							}
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
						onChange={(e) =>
							setFormData({
								...formData,
								bio: e.target.value,
							})
						}
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
	);
}
