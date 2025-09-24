'use client';

import { motion } from 'framer-motion';
import { SidebarItem } from './types';

interface DashboardSidebarProps {
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
	sidebarItems: SidebarItem[];
	activeTab: string;
	onTabChange: (tabId: string) => void;
}

export default function DashboardSidebar({
	sidebarOpen,
	setSidebarOpen,
	sidebarItems,
	// activeTab, // Currently unused but kept for future active state highlighting
	onTabChange,
}: DashboardSidebarProps) {
	// Split sidebarItems into main and last
	const mainItems = sidebarItems.slice(0, -1);
	const lastItem = sidebarItems[sidebarItems.length - 1];

	return (
		<motion.div
			initial={{ x: -256 }}
			animate={{ x: sidebarOpen ? 0 : -256 }}
			transition={{
				type: 'spring',
				stiffness: 400,
				damping: 40,
				mass: 1,
			}}
			className={`
					lg:translate-x-0 lg:!transform-none
					fixed lg:static 
					inset-y-0 left-0 
					z-50 lg:z-auto
					w-64 
					bg-white shadow-xl lg:shadow-lg border-r border-gray-100
					flex flex-col
				`}
		>
			{/* Close button for mobile */}
			<div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-200">
				<span className="text-lg font-bold text-gray-900">
					Navigation
				</span>
				<button
					onClick={() => setSidebarOpen(false)}
					className="p-3 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
				>
					<svg
						className="w-6 h-6"
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

			{/* Navigation */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.6, delay: 0.1 }}
				className="max-h-[calc(100vh-64px)] flex-1 py-8 flex flex-col"
			>
				<nav className="space-y-3 px-6">
					{mainItems.map((item, index) => (
						<motion.button
							key={item.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{
								duration: 0.6,
								delay: 0.1 + index * 0.1,
							}}
							whileHover={{ scale: 1.02, x: 4 }}
							whileTap={{ scale: 0.98 }}
							onClick={() => {
								onTabChange(item.id);
								setSidebarOpen(false);
							}}
							className={`w-full flex items-center space-x-4 px-6 py-4 lg:py-3 rounded-xl transition-all duration-200 group ${item.bgColor} ${item.textColor} min-h-[48px] lg:min-h-[44px] shadow-sm hover:shadow-md relative`}
						>
							{item.icon}
							<span className="font-medium">{item.label}</span>
							{item.badge && (
								<span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
									{item.badge}
								</span>
							)}
						</motion.button>
					))}
				</nav>

				{/* Last item at the bottom */}
				<div className="mt-auto px-6 pb-6">
					<motion.button
						key={lastItem.id}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{
							duration: 0.6,
							delay: 0.1 + mainItems.length * 0.1,
						}}
						whileHover={{ scale: 1.02, x: 4 }}
						whileTap={{ scale: 0.98 }}
						onClick={() => {
							onTabChange(lastItem.id);
							setSidebarOpen(false);
						}}
						className={`w-full flex items-center space-x-4 px-6 py-4 lg:py-3 rounded-xl transition-all duration-200 group ${lastItem.bgColor} ${lastItem.textColor} min-h-[48px] lg:min-h-[44px] shadow-sm hover:shadow-md relative`}
					>
						{lastItem.icon}
						<span className="font-medium">{lastItem.label}</span>
						{lastItem.badge && (
							<span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
								{lastItem.badge}
							</span>
						)}
					</motion.button>
				</div>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="p-6 border-t border-gray-100"
				>
					<div className="text-center">
						<p className="text-sm font-semibold text-gray-900 mb-2">
							Compyy Dashboard
						</p>
						<p className="text-xs text-gray-600 leading-relaxed">
							Create, play, and discover educational games
						</p>
					</div>
				</motion.div>
			</motion.div>

			{/* Bottom Information */}
		</motion.div>
	);
}
