import Link from 'next/link';

export default function Header({ children }: { children?: React.ReactNode }) {
	return (
		<div className="bg-white shadow-sm border-b">
			<div className="flex max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
				<div className="flex flex-row justify-between items-center">
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
						{children}
					</div>
				</div>
			</div>
		</div>
	);
}
