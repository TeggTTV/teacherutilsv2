'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function Banner({
	setIsAuthModalOpen,
}: {
	setIsAuthModalOpen?: (open: boolean) => void;
}) {
	const [showBanner, setShowBanner] = useState(true);
	const { user } = useAuth();

	console.log(user);

	if (!showBanner) return null;

	return (
		<div className="z-10 fixed bottom-0 left-0 w-full flex flex-col sm:flex-row items-center justify-center bg-blue-100 border-t border-blue-300 py-2 sm:py-4 px-2 sm:px-4 shadow-lg">
			<span className="text-base sm:text-lg font-semibold text-blue-900 mb-2 sm:mb-0 sm:mr-4 text-center sm:text-left">
				Refer a teacher for a chance to win $100!
			</span>
			<div className="flex flex-row items-center justify-center w-full sm:w-auto gap-2 sm:gap-0">
				{!user ? (
					<button
						onClick={() =>
							setIsAuthModalOpen && setIsAuthModalOpen(true)
						}
						className="flex-1 sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold px-3 py-2 sm:px-6 sm:py-2 rounded-lg shadow transition-colors text-center whitespace-nowrap"
						style={{ minWidth: 0 }}
					>
						Sign Up to Refer
					</button>
				) : (
					<a
						href="/profile"
						className="flex-1 sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold px-3 py-2 sm:px-6 sm:py-2 rounded-lg shadow transition-colors text-center whitespace-nowrap"
						style={{ minWidth: 0 }}
					>
						My Referrals
					</a>
				)}
				<button
					onClick={() => setShowBanner(false)}
					className="rounded-md ml-2 sm:ml-4 p-2 hover:bg-blue-200 focus:outline-none flex justify-center items-center"
					aria-label="Close referral banner"
					style={{ minWidth: 0 }}
				>
					<svg
						className="w-5 h-5 text-blue-700"
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
				</button>
				{/* <button
						onClick={() => setShowBanner(false)}
						className="bg-rose-500 sm:bg-transparent rounded-md ml-2 sm:ml-4 p-2 hover:bg-blue-200 focus:outline-none flex justify-center items-center"
						aria-label="Close referral banner"
						style={{ minWidth: 0 }}
					>
						<svg
							className="w-6 h-6 text-white sm:text-blue-700"
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
					</button> */}
			</div>
		</div>
	);
}
