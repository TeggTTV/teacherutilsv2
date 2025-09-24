'use client';

export default function EmailVerification({
	userEmail,
	handleClose,
	setShowEmailVerification,
	handleModeSwitch,
}: {
	userEmail: string;
	handleClose: () => void;
	setShowEmailVerification: (show: boolean) => void;
	handleModeSwitch: (toSignIn: boolean) => void;
}) {
	return (
		<div className="text-center">
			{/* Success Icon */}
			<div className="mx-auto flex items-center justify-center w-16 h-16 mb-6 bg-green-100 rounded-full">
				<svg
					className="w-8 h-8 text-green-600"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
					/>
				</svg>
			</div>

			{/* Title and Message */}
			<h2 className="text-2xl font-bold text-gray-900 mb-4">
				Check Your Email
			</h2>
			<p className="text-gray-600 mb-4">
				We&apos;ve sent a verification link to:
			</p>
			<p className="text-blue-600 font-medium mb-6">{userEmail}</p>
			<p className="text-gray-600 mb-8">
				Click the link in your email to verify your account and complete
				your registration.
			</p>

			{/* Action Buttons */}
			<div className="space-y-3">
				<button
					onClick={handleClose}
					className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
				>
					Got it, thanks!
				</button>
				<button
					onClick={() => {
						setShowEmailVerification(false);
						handleModeSwitch(true);
					}}
					className="w-full text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
				>
					Back to Sign In
				</button>
			</div>

			{/* Help Text */}
			<div className="mt-8 pt-6 border-t text-sm text-gray-500">
				<p className="mb-2">Didn&apos;t receive the email?</p>
				<ul className="text-left space-y-1">
					<li>• Check your spam/junk folder</li>
					<li>• Make sure you entered the correct email address</li>
					<li>• The email may take a few minutes to arrive</li>
				</ul>
			</div>
		</div>
	);
}
