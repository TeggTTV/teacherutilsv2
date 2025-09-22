'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Suspense } from 'react';

export default function ConditionalLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	// Hide navbar and footer on actual game play routes (not setup)
	const isPlayRoute =
		pathname?.match(/^\/play\/[^\/]+\/?$/) && !pathname?.includes('/setup');

	if (isPlayRoute) {
		// Fullscreen game layout - no navbar or footer
		return <>{children}</>;
	}

	// Normal layout with navbar and footer
	return (
		<Suspense>
			<div className="min-h-screen flex flex-col">
				<Navbar />
				<main className="flex-grow">{children}</main>
				<Footer />
			</div>
		</Suspense>
	);
}
