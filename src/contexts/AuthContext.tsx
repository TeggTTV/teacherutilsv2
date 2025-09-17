'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '@/lib/services/authService';
import { getApiUrl } from '@/lib/config';
import { PasswordEncryption } from '@/lib/encryption';

interface AuthContextType {
	user: AuthUser | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (data: RegisterFormData) => Promise<void>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
	changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
	forgotPassword: (email: string) => Promise<void>;
}

interface RegisterFormData {
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
	username?: string;
	school?: string;
	grade?: string;
	subject?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [loading, setLoading] = useState(true);

	// Check if user is authenticated on mount
	useEffect(() => {
		checkAuth();
	}, []);

	const checkAuth = async () => {
		try {
			const response = await fetch(getApiUrl('/api/auth/me'), {
				credentials: 'include',
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					setUser(data.data.user);
				}
			}
		} catch (error) {
			console.error('Auth check error:', error);
		} finally {
			setLoading(false);
		}
	};

	const login = async (email: string, password: string) => {
		setLoading(true);
		try {
			// Encrypt password before sending
			const encryptedPassword = PasswordEncryption.encryptPassword(password);
			
			const response = await fetch(getApiUrl('/api/auth/login'), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({ email, password: encryptedPassword }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Login failed');
			}

			if (data.success) {
				setUser(data.data.user);
			}
		} catch (error) {
			console.error('Login error:', error);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const register = async (formData: RegisterFormData) => {
		setLoading(true);
		try {
			// Encrypt password before sending
			const encryptedFormData = {
				...formData,
				password: PasswordEncryption.encryptPassword(formData.password)
			};
			
			const response = await fetch(getApiUrl('/api/auth/register'), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(encryptedFormData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Registration failed');
			}

			if (data.success) {
				setUser(data.data.user);
			}
		} catch (error) {
			console.error('Registration error:', error);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const logout = async () => {
		try {
			await fetch(getApiUrl('/api/auth/logout'), {
				method: 'POST',
				credentials: 'include',
			});
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			setUser(null);
		}
	};

	const refreshUser = async () => {
		await checkAuth();
	};

	const changePassword = async (currentPassword: string, newPassword: string) => {
		try {
			// Encrypt both passwords before sending
			const encryptedCurrentPassword = PasswordEncryption.encryptPassword(currentPassword);
			const encryptedNewPassword = PasswordEncryption.encryptPassword(newPassword);
			
			const response = await fetch(getApiUrl('/api/auth/change-password'), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({ 
					currentPassword: encryptedCurrentPassword, 
					newPassword: encryptedNewPassword 
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Password change failed');
			}

			if (!data.success) {
				throw new Error(data.error || 'Password change failed');
			}
		} catch (error) {
			console.error('Change password error:', error);
			throw error;
		}
	};

	const forgotPassword = async (email: string) => {
		try {
			const response = await fetch(getApiUrl('/api/auth/forgot-password'), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to send password reset email');
			}

			if (!data.success) {
				throw new Error(data.error || 'Failed to send password reset email');
			}
		} catch (error) {
			console.error('Forgot password error:', error);
			throw error;
		}
	};

	const value = {
		user,
		loading,
		login,
		register,
		logout,
		refreshUser,
		changePassword,
		forgotPassword,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
