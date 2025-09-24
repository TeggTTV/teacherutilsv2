// import type { Metadata } from 'next';
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

// export const metadata: Metadata = {
// 	title: {
// 		default: 'Compyy. - Interactive Educational Games Platform',
// 		template: '%s | Compyy.',
// 	},
// 	description:
// 		'Create and play educational games, starting with Jeopardy-style quizzes. Perfect for teachers and students.',
// 	openGraph: {
// 		type: 'website',
// 		locale: 'en_US',
// 		url: process.env.SITE_URL || 'https://compyy.org',
// 		siteName: 'Compyy.',
// 		title: 'Compyy. - Interactive Educational Games Platform',
// 		description:
// 			'Create and play educational games, starting with Jeopardy-style quizzes. Perfect for teachers and students.',
// 		images: [
// 			{
// 				url: '/Compyy%20Logo%20w%20Text.png',
// 				width: 1200,
// 				height: 630,
// 				alt: 'Compyy. - Interactive Educational Games Platform',
// 			},
// 		],
// 	},
// 	twitter: {
// 		card: 'summary_large_image',
// 		title: 'Compyy. - Interactive Educational Games Platform',
// 		description:
// 			'Create and play educational games, starting with Jeopardy-style quizzes. Perfect for teachers and students.',
// 		images: ['/Compyy%20Logo%20w%20Text.png'],
// 	},
// 	icons: {
// 		icon: '/favicon.ico',
// 	},
// };

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon.ico" sizes="32x32" />
				<link
					rel="icon"
					href="/Compyy%20Logo%20Icon.png"
					sizes="192x192"
					type="image/png"
				/>
				<link rel="apple-touch-icon" href="/Compyy%20Logo%20Icon.png" />
				<link rel="manifest" href="/manifest.json" />
				{/* Theme color meta tags for light and dark modes */}
				<meta
					name="theme-color"
					content="#3B82F6"
					media="(prefers-color-scheme: light)"
				/>
				<meta
					name="theme-color"
					content="#0a0a0a"
					media="(prefers-color-scheme: dark)"
				/>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="application-name" content="Compyy." />
				<meta name="apple-mobile-web-app-title" content="Compyy." />
				<meta name="msapplication-TileColor" content="#3B82F6" />
				<meta
					name="msapplication-TileImage"
					content="/Compyy%20Logo%20Icon.png"
				/>
			</head>
			<body
				suppressHydrationWarning
				className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
			>
				<GoogleAnalytics />
				<AuthProvider>
					{/* <TutorialManager> */}
					<ConditionalLayout>{children}</ConditionalLayout>
					{/* </TutorialManager> */}
				</AuthProvider>
				<CookieConsent />
			</body>
		</html>
	);
}
