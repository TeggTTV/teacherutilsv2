import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import ConditionalLayout from '../components/ConditionalLayout';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import CookieConsent from '@/components/CookieConsent';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Compyy. - Interactive Educational Games Platform',
	description: 'Create and play educational games, starting with Jeopardy-style quizzes. Perfect for teachers and students.',
	metadataBase: new URL(process.env.SITE_URL || 'https://compyy.vercel.app'),
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: process.env.SITE_URL || 'https://compyy.vercel.app',
		siteName: 'Compyy.',
		title: 'Compyy. - Interactive Educational Games Platform',
		description: 'Create and play educational games, starting with Jeopardy-style quizzes. Perfect for teachers and students.',
		images: [
			{
				url: '/og-image.png',
				width: 1200,
				height: 630,
				alt: 'Compyy. - Interactive Educational Games Platform',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Compyy. - Interactive Educational Games Platform',
		description: 'Create and play educational games, starting with Jeopardy-style quizzes. Perfect for teachers and students.',
		images: ['/og-image.png'],
	},
	viewport: {
		width: 'device-width',
		initialScale: 1,
	},
	themeColor: '#3B82F6',
	icons: {
		icon: '/favicon.ico',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				suppressHydrationWarning
				className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
			>
				<GoogleAnalytics />
				<AuthProvider>
					<ConditionalLayout>
						{children}
					</ConditionalLayout>
				</AuthProvider>
				<CookieConsent />
			</body>
		</html>
	);
}
