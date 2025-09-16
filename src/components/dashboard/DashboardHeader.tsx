'use client';

import { motion } from 'framer-motion';

interface DashboardHeaderProps {
	activeTab: string;
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
}

export default function DashboardHeader({
	activeTab,
	sidebarOpen,
	setSidebarOpen
}: DashboardHeaderProps) {
	const getTabDetails = (tab: string) => {
		const details = {
			'my-sets': { title: 'My Sets', description: 'Manage your question sets and games' },
			'play': { title: 'Play Games', description: 'Start playing educational games' },
			'stats': { title: 'Statistics', description: 'View your performance analytics' },
			'market': { title: 'Market', description: 'Browse and install game templates' },
			'discover': { title: 'Discover Games', description: 'Browse and discover educational games' },
			'saved': { title: 'Saved Games', description: 'Games you\'ve saved from the marketplace' }
		};
		return details[tab as keyof typeof details] || { title: 'Dashboard', description: 'Manage your educational games' };
	};

	const tabDetails = getTabDetails(activeTab);

	return (
		<motion.div 
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
			className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 shadow-sm"
		>
			<div className="flex items-center justify-between max-w-7xl mx-auto">
				<div className="flex items-center space-x-4">
					{/* Mobile Menu Button */}
					<button
						onClick={() => setSidebarOpen(true)}
						className="lg:hidden p-3 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
					>
						<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>
					
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
					>
						<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
							{tabDetails.title}
						</h1>
						<p className="text-gray-600 text-lg mt-2 hidden sm:block leading-relaxed">
							{tabDetails.description}
						</p>
					</motion.div>
				</div>
			</div>
		</motion.div>
	);
}