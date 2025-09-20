'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, ReactNode } from 'react';

export interface DropdownMenuItem {
	id: string;
	label: string;
	icon?: ReactNode;
	action: () => void;
	variant?: 'default' | 'danger' | 'success';
	disabled?: boolean;
}

interface DropdownMenuProps {
	items: DropdownMenuItem[];
	trigger?: ReactNode;
	position?: 'left' | 'right';
	className?: string;
	menuClassName?: string;
	triggerClassName?: string;
}

export default function DropdownMenu({ 
	items, 
	trigger, 
	position = 'right',
	className = '',
	menuClassName = '',
	triggerClassName = ''
}: DropdownMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	const handleToggle = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsOpen(!isOpen);
	};

	const handleItemAction = (action: () => void) => {
		action();
		setIsOpen(false);
	};

	const getVariantStyles = (variant: DropdownMenuItem['variant']) => {
		switch (variant) {
			case 'danger':
				return 'text-red-600 hover:text-red-700 hover:bg-red-50';
			case 'success':
				return 'text-green-600 hover:text-green-700 hover:bg-green-50';
			default:
				return 'text-gray-700 hover:text-blue-600 hover:bg-blue-50';
		}
	};

	const defaultTrigger = (
		<motion.button
			onClick={handleToggle}
			whileHover={{ scale: 1.1 }}
			whileTap={{ scale: 0.9 }}
			className={`p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 shadow-sm ${triggerClassName}`}
		>
			<motion.svg
				className="w-4 h-4 text-gray-600"
				fill="currentColor"
				viewBox="0 0 24 24"
				animate={{ rotate: isOpen ? 90 : 0 }}
				transition={{ duration: 0.2 }}
			>
				<path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
			</motion.svg>
		</motion.button>
	);

	return (
		<div className={`relative ${className}`} ref={dropdownRef}>
			<div onClick={handleToggle}>
				{trigger || defaultTrigger}
			</div>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: -10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: -10 }}
						transition={{ duration: 0.15, ease: 'easeOut' }}
						className={`absolute ${position === 'left' ? 'left-0' : 'right-0'} top-full mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden z-50 ${menuClassName}`}
						style={{
							boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
						}}
					>
						{items.map((item) => (
							<motion.button
								key={item.id}
								whileHover={!item.disabled ? { backgroundColor: 'rgba(0, 0, 0, 0.02)' } : {}}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									if (!item.disabled) {
										handleItemAction(item.action);
									}
								}}
								disabled={item.disabled}
								className={`w-full text-left px-4 py-3 transition-colors flex items-center space-x-3 ${
									item.disabled 
										? 'text-gray-400 cursor-not-allowed' 
										: getVariantStyles(item.variant)
								}`}
							>
								{item.icon && (
									<span className="flex-shrink-0 w-4 h-4">
										{item.icon}
									</span>
								)}
								<span className="font-medium truncate">{item.label}</span>
							</motion.button>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}