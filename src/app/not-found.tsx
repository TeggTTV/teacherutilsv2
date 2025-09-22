import Link from 'next/link';
import { Suspense } from 'react';

export default function NotFound() {
	return (
		<Suspense>
			<main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
				<h1 className="text-4xl font-bold text-gray-900 mb-4">
					404 - Page Not Found
				</h1>
				<p className="text-lg text-gray-600 mb-8">
					Sorry, the page you are looking for does not exist.
				</p>
				<Link href="/" className="text-blue-600 hover:underline">
					Go back home
				</Link>
			</main>
		</Suspense>
	);
}
