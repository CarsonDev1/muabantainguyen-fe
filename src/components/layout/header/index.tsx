'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, User, Wallet, LogOut, Menu, X, Bell, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPublicAnnouncements } from '@/services/announcement-service';
import { useAuth } from '@/context/auth-context';
import cartService from '@/services/cart-service';

export function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const router = useRouter();
	const { user, logout } = useAuth();

	const { data: cartData } = useQuery({
		queryKey: ['cart'],
		queryFn: cartService.getCart,
		enabled: !!user,
	});

	const { data: announcementsData } = useQuery({
		queryKey: ['public-announcements'],
		queryFn: getPublicAnnouncements,
	});

	// Fix: Use correct data structure from API response
	const cartItemsCount = cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
	const announcements = announcementsData?.announcements || [];

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
		}
	};

	const handleLogout = () => {
		logout();
		router.push('/sign-in');
	};

	return (
		<>
			{/* Announcements Banner */}
			{announcements.length > 0 && (
				<div className='bg-blue-600 text-white text-center py-2 text-sm'>
					<div className='flex items-center justify-center gap-2'>
						<Bell className='w-4 h-4' />
						<span>{announcements[0].title}</span>
					</div>
				</div>
			)}

			<header className='bg-white w-full dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 left-0'>
				<div className='w-full mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex items-center justify-between h-16'>
						{/* Logo */}
						<Link href='/' className='flex items-center space-x-2'>
							<Package className='w-8 h-8 text-blue-600' />
							<span className='text-xl font-bold text-gray-900 dark:text-white'>Muabantainguyen</span>
						</Link>

						{/* Search Bar - Desktop */}
						<form onSubmit={handleSearch} className='hidden md:flex flex-1 max-w-md mx-8'>
							<div className='relative w-full'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
								<Input
									type='text'
									placeholder='Tìm kiếm sản phẩm...'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className='pl-10'
								/>
							</div>
						</form>

						{/* Navigation - Desktop */}
						<nav className='hidden md:flex items-center space-x-6'>
							<Link
								href='/products'
								className='text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
							>
								Sản phẩm
							</Link>
							<Link
								href='/categories'
								className='text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
							>
								Danh mục
							</Link>
							<Link
								href='/faq'
								className='text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
							>
								FAQ
							</Link>
						</nav>

						{/* Actions */}
						<div className='flex items-center space-x-4'>
							{/* Cart */}
							<Link href='/cart' className='relative'>
								<ShoppingCart className='w-6 h-6 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors' />
								{cartItemsCount > 0 && (
									<Badge
										variant='destructive'
										className='absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs'
									>
										{cartItemsCount}
									</Badge>
								)}
							</Link>

							{/* User Menu */}
							{user ? (
								<div className='flex items-center space-x-2'>
									<Link
										href='/wallet'
										className='hidden sm:flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
									>
										<Wallet className='w-5 h-5' />
										<span className='text-sm'>Ví</span>
									</Link>
									<Link
										href='/profile'
										className='flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
									>
										<User className='w-5 h-5' />
										<span className='hidden sm:inline text-sm'>{user.name}</span>
									</Link>
									<Button
										variant='ghost'
										size='sm'
										onClick={handleLogout}
										className='text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
									>
										<LogOut className='w-4 h-4' />
									</Button>
								</div>
							) : (
								<div className='flex items-center space-x-2'>
									<Link href='/sign-in'>
										<Button variant='ghost' size='sm'>
											Đăng nhập
										</Button>
									</Link>
									<Link href='/sign-up'>
										<Button size='sm'>Đăng ký</Button>
									</Link>
								</div>
							)}

							{/* Mobile Menu Button */}
							<Button
								variant='ghost'
								size='sm'
								className='md:hidden'
								onClick={() => setIsMenuOpen(!isMenuOpen)}
							>
								{isMenuOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
							</Button>
						</div>
					</div>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className='md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'>
						<div className='px-4 py-4 space-y-4'>
							{/* Mobile Search */}
							<form onSubmit={handleSearch}>
								<div className='relative'>
									<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
									<Input
										type='text'
										placeholder='Tìm kiếm sản phẩm...'
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className='pl-10'
									/>
								</div>
							</form>

							{/* Mobile Navigation */}
							<nav className='space-y-2'>
								<Link
									href='/products'
									className='block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
									onClick={() => setIsMenuOpen(false)}
								>
									Sản phẩm
								</Link>
								<Link
									href='/categories'
									className='block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
									onClick={() => setIsMenuOpen(false)}
								>
									Danh mục
								</Link>
								<Link
									href='/faq'
									className='block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
									onClick={() => setIsMenuOpen(false)}
								>
									FAQ
								</Link>
								{user && (
									<Link
										href='/wallet'
										className='block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
										onClick={() => setIsMenuOpen(false)}
									>
										Ví của tôi
									</Link>
								)}
							</nav>
						</div>
					</div>
				)}
			</header>
		</>
	);
}
