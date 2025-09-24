'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
	const [showBanner, setShowBanner] = useState(false);

	useEffect(() => {
		const consent = localStorage.getItem('cookie-consent');
		if (!consent) {
			setShowBanner(true);
		}
	}, []);

	const acceptCookies = () => {
		localStorage.setItem('cookie-consent', 'accepted');
		setShowBanner(false);
	};

	const declineCookies = () => {
		localStorage.setItem('cookie-consent', 'declined');
		setShowBanner(false);
	};

	return (
		<AnimatePresence>
			{showBanner && (
				<motion.div
					initial={{ y: 100, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: 100, opacity: 0 }}
					className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20 p-4"
				>
					<div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
						<div className="flex-1">
							<p className="text-sm text-gray-600">
								We use cookies to enhance your experience and
								analyze site usage. By continuing to use this
								site, you agree to our{' '}
								<a
									href="/privacy"
									className="text-blue-600 hover:underline"
								>
									Privacy Policy
								</a>
								.
							</p>
						</div>
						<div className="flex gap-2">
							<button
								onClick={declineCookies}
								className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
							>
								Decline
							</button>
							<button
								onClick={acceptCookies}
								className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
							>
								Accept
							</button>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
