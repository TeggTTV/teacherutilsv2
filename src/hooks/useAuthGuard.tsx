'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useAuthGuard() {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && !user) {
			router.push('/');
		}
	}, [user, loading, router]);

	return { user, loading };
}

export function withAuthGuard<T extends object>(
	WrappedComponent: React.ComponentType<T>
) {
	return function AuthGuardedComponent(props: T) {
		const { user, loading } = useAuthGuard();

		if (loading) {
			return (
				<div className="min-h-screen flex items-center justify-center">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
				</div>
			);
		}

		if (!user) {
			return null; // Will redirect in useAuthGuard
		}

		return <WrappedComponent {...props} />;
	};
}
