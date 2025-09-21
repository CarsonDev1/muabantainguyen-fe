'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
	id: string;
	title: string;
	icon: React.ReactNode;
	href: string;
	isActive?: boolean;
	isExternal?: boolean;
	children?: {
		title: string;
		href: string;
		isExternal?: boolean;
	}[];
}

interface ClientSidebarWrapperProps {
	menuItems: MenuItem[];
}

export default function ClientSidebarWrapper({ menuItems }: ClientSidebarWrapperProps) {
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
	const [isManualToggle, setIsManualToggle] = useState(false);
	const pathname = usePathname();

	const visibleMenuItems = menuItems.filter((item) => {
		if (item.id === 'home') return true;
		return item.isActive !== false;
	});

	const hasActiveChild = (item: MenuItem) => {
		if (!item.children) return false;

		const normalizedPathname = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
		return item.children.some((child) => {
			const normalizedChildHref =
				child.href.endsWith('/') && child.href !== '/' ? child.href.slice(0, -1) : child.href;
			return normalizedChildHref === normalizedPathname;
		});
	};

	const isMenuItemActive = (item: MenuItem) => {
		const normalizedPathname = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
		const normalizedItemHref = item.href.endsWith('/') && item.href !== '/' ? item.href.slice(0, -1) : item.href;
		return normalizedItemHref === normalizedPathname;
	};

	const isSubMenuItemActive = (href: string) => {
		const normalizedPathname = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
		const normalizedHref = href.endsWith('/') && href !== '/' ? href.slice(0, -1) : href;
		return normalizedHref === normalizedPathname;
	};

	const getActiveState = (item: MenuItem) => {
		if (item.id === 'home') {
			const normalizedPathname = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
			return normalizedPathname === '/';
		}
		return isMenuItemActive(item);
	};

	useEffect(() => {
		let shouldOpenDropdown: string | null = null;

		for (const item of visibleMenuItems) {
			if (hasActiveChild(item)) {
				shouldOpenDropdown = item.id;
				break;
			}
		}

		setIsManualToggle(false);
		setActiveDropdown(shouldOpenDropdown);
	}, [pathname]);

	const toggleDropdown = (itemId: string) => {
		setIsManualToggle(true);
		setActiveDropdown(activeDropdown === itemId ? null : itemId);
	};

	const handleMenuItemClick = () => {
		setIsManualToggle(true);
	};

	const handleDropdownToggle = (e: React.MouseEvent, itemId: string) => {
		e.preventDefault();
		e.stopPropagation();
		toggleDropdown(itemId);
	};

	// Component to render menu item link
	const MenuItemLink = ({
		item,
		className,
		children,
	}: {
		item: MenuItem;
		className: string;
		children: React.ReactNode;
	}) => {
		if (item.isExternal) {
			return (
				<a
					href={item.href}
					target='_blank'
					rel='noopener noreferrer'
					onClick={handleMenuItemClick}
					className={className}
				>
					{children}
				</a>
			);
		}

		return (
			<Link href={item.href} onClick={handleMenuItemClick} className={className}>
				{children}
			</Link>
		);
	};

	// Component to render submenu item link
	const SubMenuItemLink = ({
		child,
		className,
		children,
	}: {
		child: { title: string; href: string; isExternal?: boolean };
		className: string;
		children: React.ReactNode;
	}) => {
		if (child.isExternal) {
			return (
				<a
					href={child.href}
					target='_blank'
					rel='noopener noreferrer'
					onClick={handleMenuItemClick}
					className={className}
				>
					{children}
				</a>
			);
		}

		return (
			<Link href={child.href} onClick={handleMenuItemClick} className={className}>
				{children}
			</Link>
		);
	};

	return (
		<>
			{/* Desktop Sidebar */}
			<aside className='hidden sticky top-28 left-0 h-fit min-h-[calc(100vh-80px)] w-full flex-col justify-between overflow-y-auto border-r border-gray-200 bg-white lg:flex'>
				<nav className='py-3'>
					<ul className='space-y-3'>
						{visibleMenuItems.map((item) => (
							<li key={item.id}>
								{item.children && item.children.length > 0 ? (
									<div>
										<div className='relative'>
											<MenuItemLink
												item={item}
												className={cn(
													'flex w-full items-center justify-between rounded-xl px-4 py-3 text-2xl font-medium transition-colors duration-200',
													getActiveState(item)
														? 'border-l-2 border-blue-500 bg-blue-50 text-blue-600'
														: 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
												)}
											>
												<div className='flex items-center gap-4'>
													{item.icon}
													<span>{item.title}</span>
													{item.isExternal && <ExternalLink className='size-4 ml-1' />}
												</div>
												<div className='h-10 w-10' />
											</MenuItemLink>

											<button
												onClick={(e) => handleDropdownToggle(e, item.id)}
												className='absolute right-0 top-0 flex h-full w-8 items-center justify-center rounded-r-md transition-all duration-300 hover:text-blue-600'
											>
												{activeDropdown === item.id ? (
													<ChevronDown className='size-7 transition-transform duration-300' />
												) : (
													<ChevronRight className='size-7 transition-transform duration-300' />
												)}
											</button>
										</div>

										<div
											className={cn(
												'overflow-hidden ease-in-out',
												activeDropdown === item.id
													? 'mt-1 max-h-screen opacity-100'
													: 'mt-0 max-h-0 opacity-0',
												isManualToggle
													? activeDropdown === item.id
														? 'transition-all duration-300'
														: 'transition-all duration-200'
													: ''
											)}
										>
											<div className='rounded-xl border border-gray-100 bg-gray-50'>
												<ul className='space-y-1 py-2'>
													{item.children.map((child) => (
														<li key={child.href}>
															<SubMenuItemLink
																child={child}
																className={cn(
																	'flex items-center gap-4 rounded-xl px-4 py-3 text-xl transition-colors duration-200',
																	isSubMenuItemActive(child.href)
																		? 'rounded-r-md border-l-2 border-blue-500 bg-blue-50 font-medium text-blue-600'
																		: 'rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600'
																)}
															>
																<span>{child.title}</span>
																{child.isExternal && (
																	<ExternalLink className='size-4 ml-1' />
																)}
															</SubMenuItemLink>
														</li>
													))}
												</ul>
											</div>
										</div>
									</div>
								) : (
									<MenuItemLink
										item={item}
										className={cn(
											'flex items-center gap-4 rounded-xl px-4 py-3 text-2xl font-medium transition-colors duration-200',
											getActiveState(item)
												? 'border-l-2 border-blue-500 bg-blue-50 font-semibold text-blue-600'
												: 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
										)}
									>
										{item.icon}
										<span>{item.title}</span>
										{item.isExternal && <ExternalLink className='size-4 ml-1' />}
									</MenuItemLink>
								)}
							</li>
						))}
					</ul>
				</nav>
				<div
					style={{ borderStyle: 'solid' }}
					className='group py-3 text-center border-t cursor-pointer border-gray-200 flex items-end justify-center gap-2 hover:text-blue-500'
				>
					<Link
						href='https://muabantainguyen.com/'
						className='text-xl text-gray-500 group-hover:text-blue-500 transition-colors duration-200'
					>
						Truy cập Muabantainguyen
					</Link>
					<ExternalLink className='size-9 text-slate-500 group-hover:text-blue-500 transition-colors duration-200' />
				</div>
			</aside>

			{/* Mobile Navigation */}
			<div className='w-full lg:hidden'>
				<div className='py-2'>
					<div className='overflow-x-auto overflow-y-hidden scroll-container'>
						<div className='flex gap-6 w-max'>
							{visibleMenuItems.map((item) => (
								<MenuItemLink
									key={item.id}
									item={item}
									className={cn(
										'flex flex-col gap-3 items-center justify-center space-y-1 rounded-lg px-2 py-2 lg:px-3 lg:py-2.5 transition-all duration-200',
										getActiveState(item)
											? 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-md scale-105'
											: 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600'
									)}
								>
									<div className='flex items-center justify-center relative'>
										{React.cloneElement(item.icon as React.ReactElement, {
											className: cn('transition-all duration-200 size-8'),
										})}
										{item.isExternal && (
											<ExternalLink className='size-3 absolute -top-1 -right-1' />
										)}
									</div>
									<span
										className={cn(
											'whitespace-nowrap text-2xl font-medium transition-all duration-200'
										)}
									>
										{item.title}
									</span>
								</MenuItemLink>
							))}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
