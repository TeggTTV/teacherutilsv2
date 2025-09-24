import { PublicGame, Template } from "@/components/dashboard/types";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function SavedGameCard({
	game,
	handleUseTemplate,
	handleRemoveGame,
}: {
	game: PublicGame;
	handleUseTemplate: (t: Template) => void;
	handleRemoveGame: (game: PublicGame) => void;
}) {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		};
		if (isDropdownOpen)
			document.addEventListener('mousedown', handleClickOutside);
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, [isDropdownOpen]);

	const toggle = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDropdownOpen(!isDropdownOpen);
	};

	const onUseTemplate = () => {
		// Build a minimal Template from the saved game and open the template use modal
		const template: Template = {
			id: game.id,
			title: `Template: ${game.title}`,
			description: game.description || '',
			type: 'JEOPARDY',
			data: game.data as unknown as Record<string, unknown>,
			previewImage: undefined,
			tags: [],
			downloads: 0,
			rating: 0,
			ratingCount: 0,
			isFeatured: false,
			isPublic: false,
			createdAt: new Date().toISOString(),
			author: {
				id: game.author?.id || '',
				name: game.author?.name || 'Unknown',
			},
		};

		handleUseTemplate(template);
		setIsDropdownOpen(false);
	};

	return (
		<motion.div
			key={game.id}
			className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
		>
			<div className="w-full p-4 sm:p-6 h-full flex flex-col justify-between relative">
				<div className="absolute top-3 right-3" ref={dropdownRef}>
					<motion.button
						onClick={toggle}
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
						className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 shadow-sm"
					>
						<svg
							className="w-4 h-4 text-gray-600"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
						</svg>
					</motion.button>
					<AnimatePresence>
						{isDropdownOpen && (
							<motion.div
								initial={{ opacity: 0, scale: 0.95, y: -10 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: -10 }}
								transition={{ duration: 0.15, ease: 'easeOut' }}
								className="absolute right-0 top-full mt-2 w-44 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden z-50"
								style={{
									boxShadow:
										'0 25px 50px -12px rgba(0, 0, 0, 0.25)',
								}}
							>
								<motion.button
									whileHover={{
										backgroundColor:
											'rgba(59, 130, 246, 0.05)',
									}}
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										onUseTemplate();
									}}
									className="w-full text-left px-4 py-3 transition-colors flex items-center space-x-3 text-gray-700 hover:text-blue-600"
								>
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 4v16m8-8H4"
										/>
									</svg>
									<span className="font-medium">
										Use Template
									</span>
								</motion.button>

								<motion.button
									whileHover={{
										backgroundColor:
											'rgba(239, 68, 68, 0.05)',
									}}
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										handleRemoveGame(game);
									}}
									className="w-full text-left px-4 py-3 transition-colors flex items-center space-x-3 text-red-600 hover:text-red-700"
								>
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
										/>
									</svg>
									<span className="font-medium">Remove</span>
								</motion.button>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* ...existing saved game content ... */}
				<div className="w-full h-24 sm:h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg overflow-hidden">
					{game.data?.displayImage ? (
						<Image
							src={game.data.displayImage as string}
							alt={game.title}
							className="w-full h-full object-cover"
							width={400}
							height={200}
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<div className="text-6xl opacity-50">⭐</div>
						</div>
					)}
				</div>
				<div className="p-4">
					<div className="flex items-start justify-between mb-3">
						<div className="flex-1">
							<h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
								{game.title}
							</h3>
							<p className="text-sm text-gray-600 mb-2">
								by {game.author?.name}
							</p>
						</div>
					</div>

					{/* <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                                <svg
                                    className="w-4 h-4 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                </svg>
                                {game.plays || 0}
                            </span>
                            <span className="flex items-center">
                                <svg
                                    className="w-4 h-4 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {game.favoritesCount || 0}
                            </span>
                        </div>
                    </div> */}

					<div className="flex space-x-2">
						<Link
							href={`/play/${game.id}/setup`}
							className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors duration-200 text-center"
						>
							Play Game
						</Link>
						{/* Removed inline Remove button; use the 3-dot menu Remove action instead */}
					</div>
				</div>
			</div>
		</motion.div>
	);
}
