'use client';

import { CurrentUser, getCurrentUser } from '@/services/user-service';
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import Cookies from 'js-cookie';

interface AuthContextType {
	user: CurrentUser | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (user: CurrentUser) => void;
	logout: () => void;
	refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<CurrentUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const fetchingRef = useRef<boolean>(false);
	const initializedRef = useRef<boolean>(false);

	const fetchCurrentUser = useCallback(async () => {
		// Prevent duplicate calls
		if (fetchingRef.current) {
			return;
		}

		const accessToken = Cookies.get('accessToken');
		if (!accessToken) {
			setIsLoading(false);
			return;
		}

		try {
			fetchingRef.current = true;
			setIsLoading(true);

			const response = await getCurrentUser();
			if (response.user) {
				setUser(response.user);
			} else {
				setUser(null);
			}
		} catch (error) {
			console.error('Failed to fetch current user:', error);
			setUser(null);
			// Clear cookies on error
			Cookies.remove('accessToken');
			Cookies.remove('refreshToken');
		} finally {
			setIsLoading(false);
			fetchingRef.current = false;
		}
	}, []);

	const login = useCallback((userData: CurrentUser) => {
		setUser(userData);
	}, []);

	const logout = useCallback(() => {
		setUser(null);
		// Clear cookies
		Cookies.remove('accessToken');
		Cookies.remove('refreshToken');
		// Reset refs
		fetchingRef.current = false;
		initializedRef.current = false;
		// Optionally redirect to login page
		// window.location.href = '/login';
	}, []);

	const refreshUser = useCallback(async () => {
		// Only refresh if we have a token and not already fetching
		const accessToken = Cookies.get('accessToken');
		if (accessToken && !fetchingRef.current) {
			await fetchCurrentUser();
		}
	}, [fetchCurrentUser]);

	// Listen for auth:logout event from API interceptor
	useEffect(() => {
		const handleAutoLogout = () => {
			console.log('Auto logout triggered by token refresh failure');
			logout();
		};

		window.addEventListener('auth:logout', handleAutoLogout);

		return () => {
			window.removeEventListener('auth:logout', handleAutoLogout);
		};
	}, [logout]);

	// Check token expiration periodically
	useEffect(() => {
		const checkTokenExpiration = () => {
			const accessToken = Cookies.get('accessToken');
			const refreshToken = Cookies.get('refreshToken');

			// If no tokens, logout
			if (!accessToken && !refreshToken && user) {
				console.log('No tokens found, logging out');
				logout();
			}
		};

		// Check immediately
		checkTokenExpiration();

		// Check every 5 minutes
		const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

		return () => clearInterval(interval);
	}, [user, logout]);

	useEffect(() => {
		// Only run once on mount
		if (!initializedRef.current) {
			initializedRef.current = true;
			fetchCurrentUser();
		}
	}, [fetchCurrentUser]);

	const value: AuthContextType = {
		user,
		isLoading,
		isAuthenticated: !!user,
		login,
		logout,
		refreshUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook để sử dụng AuthContext
export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

// Higher-order component để protect routes
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
	return function AuthenticatedComponent(props: P) {
		const { isAuthenticated, isLoading } = useAuth();

		if (isLoading) {
			return (
				<div className='flex items-center justify-center min-h-screen'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
				</div>
			);
		}

		if (!isAuthenticated) {
			// Redirect to login or show login form
			return (
				<div className='flex items-center justify-center min-h-screen'>
					<div className='text-center'>
						<h2 className='text-xl font-semibold mb-2'>Authentication Required</h2>
						<p className='text-muted-foreground'>Please log in to access this page.</p>
					</div>
				</div>
			);
		}

		return <Component {...props} />;
	};
};
