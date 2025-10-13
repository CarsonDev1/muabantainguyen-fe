// src/app/orders/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Package,
	ShoppingBag,
	Clock,
	CheckCircle,
	XCircle,
	Wallet,
	CreditCard,
	TrendingUp,
	ArrowRight,
	Loader2,
	AlertCircle,
	Receipt,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/utils/format-currency';
import orderService, { Order } from '@/services/order-service';
import { useAuth } from '@/context/auth-context';
import { formatDate } from '@/utils/format-date';

// ============ COMPONENTS ============

function StatsCard({
	icon: Icon,
	label,
	value,
	subValue,
	trend,
	colorClass,
}: {
	icon: any;
	label: string;
	value: string | number;
	subValue?: string;
	trend?: string;
	colorClass?: string;
}) {
	return (
		<Card>
			<CardContent className='pt-6'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className={`p-3 rounded-lg ${colorClass || 'bg-blue-100 dark:bg-blue-900/30'}`}>
							<Icon className={`w-5 h-5 ${colorClass ? '' : 'text-blue-600 dark:text-blue-400'}`} />
						</div>
						<div>
							<p className='text-sm text-gray-600 dark:text-gray-400'>{label}</p>
							<p className='text-2xl font-bold text-gray-900 dark:text-white'>{value}</p>
							{subValue && <p className='text-xs text-gray-500 mt-1'>{subValue}</p>}
						</div>
					</div>
					{trend && (
						<div className='flex items-center gap-1 text-green-600'>
							<TrendingUp className='w-4 h-4' />
							<span className='text-sm font-medium'>{trend}</span>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function OrderStatusBadge({ status }: { status: string }) {
	const statusConfig = {
		pending: {
			label: 'Chờ thanh toán',
			color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
			icon: Clock,
		},
		paid: {
			label: 'Đã thanh toán',
			color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
			icon: CheckCircle,
		},
		refunded: {
			label: 'Đã hoàn tiền',
			color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
			icon: XCircle,
		},
	};

	const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
	const Icon = config.icon;

	return (
		<Badge className={`${config.color} flex items-center gap-1`} variant='outline'>
			<Icon className='w-3 h-3' />
			{config.label}
		</Badge>
	);
}

function PaymentMethodBadge({ method }: { method: string }) {
	const methodConfig = {
		wallet: {
			label: 'Ví điện tử',
			icon: Wallet,
			color: 'text-blue-600 dark:text-blue-400',
		},
		sepay: {
			label: 'SePay',
			icon: CreditCard,
			color: 'text-purple-600 dark:text-purple-400',
		},
		momo: {
			label: 'MoMo',
			icon: CreditCard,
			color: 'text-pink-600 dark:text-pink-400',
		},
	};

	const config = methodConfig[method as keyof typeof methodConfig] || methodConfig.sepay;
	const Icon = config.icon;

	return (
		<div className={`flex items-center gap-1 ${config.color}`}>
			<Icon className='w-4 h-4' />
			<span className='text-sm font-medium'>{config.label}</span>
		</div>
	);
}

function OrderCard({ order }: { order: Order }) {
	return (
		<Card className='hover:shadow-md transition-shadow'>
			<CardContent className='pt-6'>
				<div className='space-y-4'>
					{/* Header */}
					<div className='flex items-start justify-between'>
						<div>
							<div className='flex items-center gap-2 mb-1'>
								<Receipt className='w-4 h-4 text-gray-400' />
								<span className='text-sm text-gray-500'>#{order.id.slice(0, 8).toUpperCase()}</span>
							</div>
							<p className='text-xs text-gray-400'>{formatDate(order.created_at)}</p>
						</div>
						<OrderStatusBadge status={order.status} />
					</div>

					{/* Content */}
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>Tổng tiền</p>
							<p className='text-xl font-bold text-gray-900 dark:text-white'>
								{formatCurrency(parseFloat(order.total_amount.toString()))}
							</p>
						</div>
						<PaymentMethodBadge method={order.payment_method} />
					</div>

					{/* Actions */}
					<div className='flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800'>
						<Link href={`/orders/${order.id}`} className='flex-1'>
							<Button variant='outline' className='w-full' size='sm'>
								Chi tiết
								<ArrowRight className='w-4 h-4 ml-2' />
							</Button>
						</Link>

						{order.status === 'pending' && (
							<Link href={`/orders/${order.id}`} className='flex-1'>
								<Button className='w-full' size='sm'>
									Thanh toán ngay
								</Button>
							</Link>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function EmptyOrders({ status }: { status?: string }) {
	const messages = {
		all: 'Bạn chưa có đơn hàng nào',
		pending: 'Không có đơn hàng chờ thanh toán',
		paid: 'Không có đơn hàng đã thanh toán',
		refunded: 'Không có đơn hàng đã hoàn tiền',
	};

	return (
		<div className='text-center py-16'>
			<Package className='w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
			<h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
				{messages[status as keyof typeof messages] || messages.all}
			</h3>
			<p className='text-gray-500 dark:text-gray-400 mb-6'>Hãy bắt đầu mua sắm ngay!</p>
			<Link href='/'>
				<Button>
					<ShoppingBag className='w-4 h-4 mr-2' />
					Khám phá sản phẩm
				</Button>
			</Link>
		</div>
	);
}

// ============ MAIN COMPONENT ============

export default function OrdersPage() {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState('all');

	// Fetch orders
	const { data: ordersData, isLoading: ordersLoading } = useQuery({
		queryKey: ['orders'],
		queryFn: () => orderService.getOrders(),
		enabled: !!user,
	});

	// Fetch stats
	const { data: statsData, isLoading: statsLoading } = useQuery({
		queryKey: ['order-stats'],
		queryFn: () => orderService.getOrderStats(),
		enabled: !!user,
	});

	if (!user) {
		return (
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
				<div className='text-center'>
					<Package className='w-16 h-16 text-gray-400 mx-auto mb-4' />
					<h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>Vui lòng đăng nhập</h2>
					<p className='text-gray-600 dark:text-gray-400 mb-6'>Bạn cần đăng nhập để xem đơn hàng</p>
					<Link href='/sign-in'>
						<Button size='lg'>Đăng nhập</Button>
					</Link>
				</div>
			</div>
		);
	}

	const orders = ordersData?.items || [];
	const stats = statsData?.stats;

	// Filter orders by status
	const filteredOrders = orders.filter((order) => {
		if (activeTab === 'all') return true;
		return order.status === activeTab;
	});

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				{/* Header */}
				<div className='mb-8'>
					<h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>Đơn hàng của tôi</h1>
					<p className='text-gray-600 dark:text-gray-400'>Quản lý và theo dõi đơn hàng của bạn</p>
				</div>

				{/* Stats */}
				{statsLoading ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
						{[1, 2, 3, 4].map((i) => (
							<Card key={i}>
								<CardContent className='pt-6'>
									<div className='animate-pulse space-y-3'>
										<div className='h-12 bg-gray-200 dark:bg-gray-700 rounded' />
										<div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3' />
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : stats ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
						<StatsCard
							icon={ShoppingBag}
							label='Tổng đơn hàng'
							value={stats.total_orders}
							colorClass='bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
						/>
						<StatsCard
							icon={Clock}
							label='Chờ thanh toán'
							value={stats.pending_orders}
							colorClass='bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
						/>
						<StatsCard
							icon={CheckCircle}
							label='Đã thanh toán'
							value={stats.paid_orders}
							colorClass='bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
						/>
						<StatsCard
							icon={Wallet}
							label='Tổng chi tiêu'
							value={formatCurrency(stats.total_spent)}
							subValue={`${stats.wallet_payments} đơn qua ví`}
							colorClass='bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
						/>
					</div>
				) : null}

				{/* Orders List */}
				<Card>
					<CardHeader>
						<CardTitle>Danh sách đơn hàng</CardTitle>
					</CardHeader>
					<CardContent>
						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<TabsList className='grid w-full grid-cols-4 mb-6'>
								<TabsTrigger value='all'>Tất cả ({orders.length})</TabsTrigger>
								<TabsTrigger value='pending'>
									Chờ thanh toán ({orders.filter((o) => o.status === 'pending').length})
								</TabsTrigger>
								<TabsTrigger value='paid'>
									Đã thanh toán ({orders.filter((o) => o.status === 'paid').length})
								</TabsTrigger>
								<TabsTrigger value='refunded'>
									Đã hoàn ({orders.filter((o) => o.status === 'refunded').length})
								</TabsTrigger>
							</TabsList>

							{ordersLoading ? (
								<div className='space-y-4'>
									{[1, 2, 3].map((i) => (
										<Card key={i}>
											<CardContent className='pt-6'>
												<div className='animate-pulse space-y-3'>
													<div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4' />
													<div className='h-8 bg-gray-200 dark:bg-gray-700 rounded' />
													<div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2' />
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : filteredOrders.length === 0 ? (
								<EmptyOrders status={activeTab} />
							) : (
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
									{filteredOrders.map((order) => (
										<OrderCard key={order.id} order={order} />
									))}
								</div>
							)}
						</Tabs>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
