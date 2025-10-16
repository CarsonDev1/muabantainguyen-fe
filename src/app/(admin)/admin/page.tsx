'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getUsers } from '@/services/user-service';
import { getAdminSettings } from '@/services/settings-service';
import {
	Users,
	ShoppingCart,
	DollarSign,
	Package,
	Tag,
	Wallet,
	Settings,
	Shield,
	HelpCircle,
	Bell,
	Inbox,
	Calendar,
	Percent,
} from 'lucide-react';
import Link from 'next/link';
import orderService from '@/services/order-service';
import productsService from '@/services/product-service';
import { voucherService } from '@/services/voucher-service';

const AdminPage = () => {
	const { data: usersData } = useQuery({
		queryKey: ['users', { page: 1, pageSize: 10 }],
		queryFn: () => getUsers({ page: 1, pageSize: 10 }),
	});

	const { data: ordersData } = useQuery({
		queryKey: ['admin-orders'],
		queryFn: () => orderService.getOrders(),
	});

	const { data: productsData } = useQuery({
		queryKey: ['products'],
		queryFn: () => productsService.getAllProducts(),
		staleTime: 2 * 60 * 1000,
	});

	const { data: vouchersData } = useQuery({
		queryKey: ['vouchers'],
		queryFn: () => voucherService.getVouchers(),
		staleTime: 2 * 60 * 1000,
	});

	const stats = [
		{
			title: 'Người dùng',
			value: usersData?.users.length || 0,
			icon: Users,
			href: '/admin/users',
			color: 'bg-blue-500',
		},
		{
			title: 'Đơn hàng',
			value: ordersData?.items.length || 0,
			icon: ShoppingCart,
			href: '/admin/orders',
			color: 'bg-green-500',
		},
		{
			title: 'Sản phẩm',
			value: productsData?.total || 0,
			icon: Package,
			href: '/admin/products',
			color: 'bg-purple-500',
		},
		{
			title: 'Voucher',
			value: vouchersData?.vouchers.length || 0,
			icon: Tag,
			href: '/admin/vouchers',
			color: 'bg-orange-500',
		},
	];

	const quickActions = [
		{
			title: 'Quản lý Admin',
			description: 'Thêm, sửa, xóa tài khoản admin',
			icon: Shield,
			href: '/admin/admins',
			color: 'bg-red-500',
		},
		{
			title: 'Vai trò & Quyền',
			description: 'Quản lý vai trò và quyền hạn',
			icon: Settings,
			href: '/admin/roles',
			color: 'bg-indigo-500',
		},
		{
			title: 'FAQ',
			description: 'Quản lý câu hỏi thường gặp',
			icon: HelpCircle,
			href: '/admin/faqs',
			color: 'bg-teal-500',
		},
		{
			title: 'Thông báo',
			description: 'Quản lý thông báo hệ thống',
			icon: Bell,
			href: '/admin/announcements',
			color: 'bg-pink-500',
		},
		{
			title: 'Quản lý Ví',
			description: 'Theo dõi và quản lý ví người dùng',
			icon: Wallet,
			href: '/admin/wallet',
			color: 'bg-yellow-500',
		},
	];

	const menuItems = [
		{ title: 'Danh mục', href: '/admin/categories', icon: Inbox },
		{ title: 'Đơn hàng', href: '/admin/orders', icon: Calendar },
		{ title: 'Khuyến mãi', href: '/admin/promotions', icon: Percent },
	];

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-3xl font-bold'>Admin Dashboard</h1>
				<p className='text-gray-600'>Chào mừng đến với trang quản trị hệ thống</p>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
				{stats.map((stat) => (
					<Card key={stat.title} className='hover:shadow-md transition-shadow'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-sm font-medium text-gray-600'>{stat.title}</p>
									<p className='text-2xl font-bold'>{stat.value}</p>
								</div>
								<div className={`p-3 rounded-full ${stat.color}`}>
									<stat.icon className='w-6 h-6 text-white' />
								</div>
							</div>
							<Button asChild variant='outline' size='sm' className='w-full mt-4'>
								<Link href={stat.href}>Xem chi tiết</Link>
							</Button>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Thao tác nhanh</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
						{quickActions.map((action) => (
							<Card key={action.title} className='hover:shadow-md transition-shadow'>
								<CardContent className='p-4'>
									<div className='flex items-start space-x-3'>
										<div className={`p-2 rounded-lg ${action.color}`}>
											<action.icon className='w-5 h-5 text-white' />
										</div>
										<div className='flex-1'>
											<h3 className='font-semibold'>{action.title}</h3>
											<p className='text-sm text-gray-600'>{action.description}</p>
											<Button asChild variant='outline' size='sm' className='mt-2'>
												<Link href={action.href}>Truy cập</Link>
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>

			{/* System Status */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				<Card>
					<CardHeader>
						<CardTitle>Trạng thái hệ thống</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-3'>
							<div className='flex items-center justify-between'>
								<span>Website</span>
								<Badge variant='default'>Hoạt động</Badge>
							</div>
							<div className='flex items-center justify-between'>
								<span>Database</span>
								<Badge variant='default'>Kết nối</Badge>
							</div>
							<div className='flex items-center justify-between'>
								<span>API</span>
								<Badge variant='default'>Sẵn sàng</Badge>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Menu chính</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-1 gap-2'>
							{menuItems.map((item) => (
								<Button key={item.title} asChild variant='outline' className='justify-start'>
									<Link href={item.href} className='flex items-center'>
										<item.icon className='w-4 h-4 mr-2' />
										{item.title}
									</Link>
								</Button>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default AdminPage;
