"use client";
import { useState } from "react";

export default function Banner() {
    const [showBanner, setShowBanner] = useState(true);
    if (!showBanner) return null;

    return (
		<div
			style={{ zIndex: 9999 }}
			className="fixed bottom-0 left-0 w-full flex items-center justify-center bg-blue-100 border-t border-blue-300 py-4 px-2 shadow-lg"
		>
			<span className="text-lg font-semibold text-blue-900 mr-4">
				Refer a teacher for a chance to win $100!
			</span>
			<a
				href="/profile"
				className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-lg shadow transition-colors"
			>
				My Referrals
			</a>
			<button
				onClick={() => setShowBanner(false)}
				className="ml-4 p-1 rounded hover:bg-blue-200 focus:outline-none"
				aria-label="Close referral banner"
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
		</div>
	);
}
