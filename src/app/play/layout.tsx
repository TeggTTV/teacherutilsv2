import { AuthProvider } from '@/contexts/AuthContext';

export default function PlayLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AuthProvider>
			{children}
		</AuthProvider>
	);
}
