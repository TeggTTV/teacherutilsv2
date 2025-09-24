'use client';
import { motion } from 'framer-motion';

export default function AdditionalFields({
	formData,
	handleInputChange,
	isTeacher,
	referralValidation,
}: {
	formData: {
		firstName: string;
		lastName: string;
		username: string;
		school: string;
		grade: string;
		subject: string;
		referralCode: string;
		subscribeToNewsletter: boolean;
	};
	handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	isTeacher: boolean;
	referralValidation: {
		status: 'idle' | 'checking' | 'valid' | 'invalid';
		message?: string | undefined;
	};
}) {
	return (
		<>
			{/* Referral Code (hidden if auto-populated, visible if user wants to enter manually) */}
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

			{/* Student-specific fields */}
			{!isTeacher && (
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
			)}
			<div>
				<label
					htmlFor="referralCode"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Referral Code (optional)
				</label>
				<div className="relative">
					<input
						type="text"
						id="referralCode"
						name="referralCode"
						value={formData.referralCode}
						onChange={handleInputChange}
						className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						placeholder="Enter referral code if you have one"
					/>
					{/* Validation indicator */}
					<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
						{referralValidation.status === 'checking' && (
							<div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
						)}
						{referralValidation.status === 'valid' && (
							<motion.div
								initial={{
									scale: 0,
								}}
								animate={{
									scale: 1,
								}}
								className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
							>
								<svg
									className="w-3 h-3 text-white"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clipRule="evenodd"
									/>
								</svg>
							</motion.div>
						)}
						{referralValidation.status === 'invalid' && (
							<motion.div
								initial={{
									scale: 0,
								}}
								animate={{
									scale: 1,
								}}
								className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
							>
								<svg
									className="w-3 h-3 text-white"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
										clipRule="evenodd"
									/>
								</svg>
							</motion.div>
						)}
					</div>
				</div>
				{referralValidation.message && (
					<p
						className={`mt-1 text-sm ${
							referralValidation.status === 'valid'
								? 'text-green-600'
								: 'text-red-600'
						}`}
					>
						{referralValidation.message}
					</p>
				)}
			</div>

			{/* Newsletter Subscription */}
			<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
				<div>
					<label
						htmlFor="subscribeToNewsletter"
						className="block text-sm font-medium text-gray-700"
					>
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
	);
}
