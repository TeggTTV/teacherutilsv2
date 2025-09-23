'use client';

import { useCountAnimation } from '@/hooks/useCountAnimation';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Stats {
	activeTeachers: string;
	gamesCreated: string;
	studentsEngaged: string;
}
function AnimatedStat({
	value,
	label,
	color,
}: {
	value: string;
	label: string;
	color: string;
}) {
	// Extract numeric value from string (e.g., "1000+" -> 1000)
	const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
	const suffix = value.replace(/[0-9]/g, '');

	const { count, elementRef } = useCountAnimation({
		end: numericValue,
		duration: 2500,
		startOnInView: true,
	});

	return (
		<div className="text-center">
			<div
				ref={elementRef}
				className={`text-xl sm:text-2xl md:text-3xl font-bold ${color} mb-1 sm:mb-2`}
			>
				{count.toLocaleString()}
				{suffix}
			</div>
			<div className="text-xs sm:text-sm md:text-base text-gray-600">
				{label}
			</div>
		</div>
	);
}

export default function Stats() {
	const [stats, setStats] = useState<Stats>({
		activeTeachers: '0',
		gamesCreated: '0',
		studentsEngaged: '0',
	});

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await fetch('/api/stats');
				if (response.ok) {
					const data = await response.json();
					setStats(data);
				}
			} catch (error) {
				console.error('Failed to fetch statistics:', error);
				// Keep default stats if fetch fails
			}
		};
		fetchStats();
	}, []);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, delay: 0.3 }}
			className="grid grid-cols-3 sm:grid-cols-3 gap-4 sm:gap-8 max-w-md sm:max-w-2xl mx-auto px-4"
		>
			<AnimatedStat
				value={stats.activeTeachers}
				label="Active Users"
				color="text-blue-600"
			/>
			<AnimatedStat
				value={stats.gamesCreated}
				label="Games Created"
				color="text-green-600"
			/>
			<AnimatedStat
				value={stats.studentsEngaged}
				label="Students Engaged"
				color="text-purple-600"
			/>
		</motion.div>
	);
}
