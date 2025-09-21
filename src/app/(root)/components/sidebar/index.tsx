'use client';

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarHeader,
} from '@/components/ui/sidebar';
import {
	Home,
	ShoppingCart,
	Package,
	CreditCard,
	User,
	Wallet,
	Download,
	Heart,
	Settings,
	HelpCircle,
	LogOut,
	ChevronRight,
	ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getWallet } from '@/services/wallet-service';
import { getCategoryTree } from '@/services/category-service';
import cartService, { CartItem } from '@/services/cart-service';
import { formatCurrency } from '@/utils/format-currency';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const items = [
	{ title: 'Trang chủ', url: '/', icon: Home },
	{ title: 'Sản phẩm', url: '/products', icon: Package, hasDropdown: true },
	{ title: 'Giỏ hàng', url: '/cart', icon: ShoppingCart },
	{ title: 'Đơn hàng', url: '/orders', icon: CreditCard },
	{ title: 'Ví của tôi', url: '/wallet', icon: Wallet },
	{ title: 'Tài nguyên đã mua', url: '/resources', icon: Download },
	{ title: 'FAQ', url: '/faq', icon: HelpCircle },
	{ title: 'Cài đặt', url: '/settings', icon: Settings },
];

export function UserSidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const { user, logout } = useAuth();
	const [expandedItems, setExpandedItems] = useState<string[]>([]);
	const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

	const { data: walletData } = useQuery({
		queryKey: ['wallet'],
		queryFn: getWallet,
	});

	const { data: categoryData } = useQuery({
		queryKey: ['category-tree'],
		queryFn: getCategoryTree,
	});

	// Fetch cart data to show item count
	const { data: cartData } = useQuery({
		queryKey: ['cart'],
		queryFn: cartService.getCart,
	});

	// Auto-expand products dropdown và categories khi ở trang products
	useEffect(() => {
		if (pathname.startsWith('/products') || pathname.match(/^\/[a-z0-9-]+$/)) {
			setExpandedItems(['Sản phẩm']);

			// Auto-expand categories dựa trên current path
			if (categoryData?.tree) {
				const findAndExpandParents = (
					categories: any[],
					currentPath: string,
					parents: string[] = []
				): string[] => {
					for (const category of categories) {
						if (`/${category.slug}` === currentPath) {
							return [...parents];
						}
						if (category.children && category.children.length > 0) {
							const found = findAndExpandParents(category.children, currentPath, [
								...parents,
								category.id,
							]);
							if (found.length > 0) {
								return found;
							}
						}
					}
					return [];
				};

				const parentsToExpand = findAndExpandParents(categoryData.tree, pathname);
				setExpandedCategories(parentsToExpand);
			}
		} else {
			setExpandedItems([]);
		}
	}, [pathname, categoryData]);

	const isActive = (url: string) => {
		if (url === '/') {
			return pathname === '/';
		}
		return pathname.startsWith(url);
	};

	const balance = walletData?.wallet?.balance ?? 0;
	const cartItemCount = cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

	const handleLogout = () => {
		logout();
	};

	const handleProductsClick = () => {
		router.push('/products');
	};

	const toggleDropdown = (itemTitle: string) => {
		if (itemTitle === 'Sản phẩm') {
			if (pathname.startsWith('/products')) {
				// Nếu đang ở trang products, chỉ toggle dropdown
				setExpandedItems((prev) =>
					prev.includes(itemTitle) ? prev.filter((id) => id !== itemTitle) : [...prev, itemTitle]
				);
			} else {
				// Nếu không ở trang products, navigate đến products
				handleProductsClick();
			}
		} else {
			setExpandedItems((prev) =>
				prev.includes(itemTitle) ? prev.filter((id) => id !== itemTitle) : [...prev, itemTitle]
			);
		}
	};

	const toggleCategory = (categoryId: string) => {
		setExpandedCategories((prev) =>
			prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
		);
	};

	const renderCategoryTree = (categories: any[], level = 0) => {
		return categories.map((category) => {
			const hasChildren = category.children && category.children.length > 0;
			const isExpanded = expandedCategories.includes(category.id);
			const isActiveCategory = pathname === `/${category.slug}`;

			return (
				<div key={category.id} className={`ml-${level * 4}`}>
					<SidebarMenuItem>
						<div
							className={`group flex items-center gap-3 p-2 rounded-xl transition-all duration-200 cursor-pointer hover:bg-slate-800 dark:hover:bg-gray-800 ${
								isActiveCategory
									? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-600/30 dark:shadow-blue-500/20'
									: 'text-slate-300 dark:text-gray-300 hover:text-white'
							}`}
						>
							{hasChildren ? (
								<button
									onClick={(e) => {
										e.stopPropagation();
										toggleCategory(category.id);
									}}
									className='p-1 hover:bg-slate-700 dark:hover:bg-gray-700 rounded transition-colors'
								>
									{isExpanded ? (
										<ChevronDown className='w-4 h-4 text-slate-400 dark:text-gray-500' />
									) : (
										<ChevronRight className='w-4 h-4 text-slate-400 dark:text-gray-500' />
									)}
								</button>
							) : (
								<div className='w-7' />
							)}

							<div className='flex items-center gap-2 flex-1 min-w-0'>
								{/* Category Image or Icon */}
								{category.image ? (
									<div className='w-4 h-4 flex-shrink-0 rounded overflow-hidden'>
										<Image
											src={category.image}
											alt={category.name}
											width={16}
											height={16}
											className='w-full h-full object-cover'
										/>
									</div>
								) : (
									<Package
										className={`w-4 h-4 flex-shrink-0 ${
											isActiveCategory
												? 'text-black dark:text-white'
												: 'text-slate-400 dark:text-gray-500'
										}`}
									/>
								)}

								<div className='flex-1 min-w-0'>
									<Link href={`/${category.slug}`} className='block'>
										<div className='flex items-center justify-between'>
											<span className='font-medium truncate'>{category.name}</span>
										</div>
										<p className='text-xs text-slate-400 dark:text-gray-500 truncate'>
											/{category.slug}
										</p>
									</Link>
								</div>
							</div>
						</div>
					</SidebarMenuItem>

					{/* Render children if expanded */}
					{hasChildren && isExpanded && (
						<div className='ml-4 mt-1 border-l-2 border-slate-700 dark:border-gray-700'>
							{renderCategoryTree(category.children, level + 1)}
						</div>
					)}
				</div>
			);
		});
	};

	return (
		<>
			{/* Thêm styles cho hover scrollbar */}
			<style jsx global>{`
				.sidebar-hover-scrollbar {
					/* Ẩn scrollbar mặc định */
					scrollbar-width: none; /* Firefox */
					-ms-overflow-style: none; /* IE và Edge */
				}

				.sidebar-hover-scrollbar::-webkit-scrollbar {
					width: 0px;
					background: transparent;
				}

				/* Hiện scrollbar khi hover */
				.sidebar-hover-scrollbar:hover {
					scrollbar-width: thin;
					scrollbar-color: rgba(71, 85, 105, 0.7) transparent;
				}

				.sidebar-hover-scrollbar:hover::-webkit-scrollbar {
					width: 6px;
					transition: width 0.3s ease;
				}

				.sidebar-hover-scrollbar:hover::-webkit-scrollbar-track {
					background: transparent;
					border-radius: 3px;
				}

				.sidebar-hover-scrollbar:hover::-webkit-scrollbar-thumb {
					background: rgba(71, 85, 105, 0.7);
					border-radius: 3px;
					transition: background 0.2s ease;
				}

				.sidebar-hover-scrollbar:hover::-webkit-scrollbar-thumb:hover {
					background: rgba(100, 116, 139, 0.9);
				}

				/* Smooth scroll */
				.sidebar-hover-scrollbar {
					scroll-behavior: smooth;
				}

				/* Animation cho việc xuất hiện scrollbar */
				@keyframes scrollbarFadeIn {
					from {
						opacity: 0;
						transform: scaleX(0);
					}
					to {
						opacity: 1;
						transform: scaleX(1);
					}
				}

				.sidebar-hover-scrollbar:hover::-webkit-scrollbar-thumb {
					animation: scrollbarFadeIn 0.2s ease-out;
				}

				/* Dark mode specific styles */
				.dark .sidebar-hover-scrollbar:hover {
					scrollbar-color: rgba(55, 65, 81, 0.8) transparent;
				}

				.dark .sidebar-hover-scrollbar:hover::-webkit-scrollbar-thumb {
					background: rgba(55, 65, 81, 0.8);
				}

				.dark .sidebar-hover-scrollbar:hover::-webkit-scrollbar-thumb:hover {
					background: rgba(75, 85, 99, 0.9);
				}
			`}</style>

			<Sidebar
				collapsible='icon'
				variant='inset'
				className='border-r border-slate-700 dark:border-gray-800 bg-slate-900 dark:bg-black'
			>
				<SidebarHeader className='p-4 bg-slate-900 dark:bg-black border-b border-slate-700 dark:border-gray-800'>
					<div className='flex items-center gap-3'>
						<div className='h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center shadow-lg'>
							<span className='text-white font-bold text-lg'>M</span>
						</div>
						<div className='group-data-[collapsible=icon]:hidden'>
							<h2 className='font-bold text-lg text-white'>Muabantainguyen</h2>
							<p className='text-sm text-slate-300 dark:text-gray-400'>{user?.name || 'Khách hàng'}</p>
						</div>
					</div>
				</SidebarHeader>

				<SidebarContent className='px-3 bg-slate-900 dark:bg-black overflow-y-auto sidebar-hover-scrollbar'>
					{/* Wallet Balance */}
					{user && (
						<SidebarGroup>
							<SidebarGroupContent>
								<div className='bg-gradient-to-br from-slate-800 to-slate-900 dark:from-gray-900 dark:to-black rounded-xl p-4 border border-slate-700 dark:border-gray-800 shadow-lg'>
									<div className='flex items-center justify-between mb-3'>
										<div>
											<p className='text-xs font-medium text-slate-400 dark:text-gray-500 uppercase tracking-wide'>
												Số dư ví
											</p>
											<p className='text-2xl font-bold text-white mt-1'>
												{formatCurrency(balance)}
											</p>
										</div>
										<div className='p-2 bg-blue-500/20 dark:bg-blue-400/10 rounded-lg'>
											<Wallet className='w-6 h-6 text-blue-400 dark:text-blue-300' />
										</div>
									</div>
									<Link href='/wallet' className='block'>
										<Button
											size='sm'
											className='w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white border-0 shadow-sm'
										>
											Nạp tiền
										</Button>
									</Link>
								</div>
							</SidebarGroupContent>
						</SidebarGroup>
					)}

					{/* Navigation Menu */}
					<SidebarGroup>
						<SidebarGroupLabel className='text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2'>
							Menu chính
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu className='space-y-1'>
								{items.map((item) => {
									const isItemActive = isActive(item.url);
									const isExpanded = expandedItems.includes(item.title);
									const isProductsActive = item.title === 'Sản phẩm' && isItemActive;

									return (
										<div key={item.title}>
											<SidebarMenuItem>
												{item.hasDropdown ? (
													<SidebarMenuButton
														onClick={() => toggleDropdown(item.title)}
														isActive={isProductsActive}
														className={`h-11 px-3 text-sm font-medium transition-all duration-200 rounded-lg ${
															isProductsActive
																? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-600/30 dark:shadow-blue-500/20'
																: 'text-slate-300 dark:text-gray-300 hover:bg-slate-800 dark:hover:bg-gray-800 hover:text-white'
														}`}
													>
														<item.icon
															className={`w-5 h-5 ${
																isProductsActive
																	? 'text-black dark:text-white'
																	: 'text-slate-400 dark:text-gray-500'
															}`}
														/>
														<span className='group-data-[collapsible=icon]:hidden flex-1 text-left'>
															{item.title}
														</span>
														{isExpanded ? (
															<ChevronDown className='w-4 h-4 text-slate-400 dark:text-gray-500 group-data-[collapsible=icon]:hidden' />
														) : (
															<ChevronRight className='w-4 h-4 text-slate-400 dark:text-gray-500 group-data-[collapsible=icon]:hidden' />
														)}
													</SidebarMenuButton>
												) : (
													<SidebarMenuButton
														asChild
														tooltip={item.title}
														isActive={isItemActive}
														className={`h-11 px-3 text-sm font-medium transition-all duration-200 rounded-lg ${
															isItemActive
																? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-600/30 dark:shadow-blue-500/20'
																: 'text-slate-300 dark:text-gray-300 hover:bg-slate-800 dark:hover:bg-gray-800 hover:text-white'
														}`}
													>
														<Link href={item.url} className='flex items-center gap-3'>
															<item.icon
																className={`w-5 h-5 ${
																	isItemActive
																		? 'text-black dark:text-white'
																		: 'text-slate-400 dark:text-gray-500'
																}`}
															/>
															<span className='group-data-[collapsible=icon]:hidden'>
																{item.title}
															</span>
														</Link>
													</SidebarMenuButton>
												)}
											</SidebarMenuItem>

											{/* Dropdown Content for Products */}
											{item.hasDropdown && isExpanded && (
												<div className='group-data-[collapsible=icon]:hidden space-y-1'>
													{/* Categories Tree */}
													{categoryData?.tree?.map((category) =>
														renderCategoryTree([category])
													)}
												</div>
											)}
										</div>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				{/* Footer with Logout */}
				{user && (
					<div className='p-4 border-t border-slate-700 dark:border-gray-800 bg-slate-900 dark:bg-black'>
						<Button
							variant='ghost'
							size='sm'
							onClick={handleLogout}
							className='w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 h-10'
						>
							<LogOut className='w-4 h-4' />
							<span className='group-data-[collapsible=icon]:hidden'>Đăng xuất</span>
						</Button>
					</div>
				)}
			</Sidebar>
		</>
	);
}
