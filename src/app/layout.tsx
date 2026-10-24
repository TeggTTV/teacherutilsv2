import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata = {
	title: 'The AI Game Show',
	description: 'An interactive AI Jeopardy game show for clubs and events.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100 overflow-x-hidden select-none`}
			>
				{children}
			</body>
		</html>
	);
}
