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
	Sparkles,
	Calendar,
	DollarSign,
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
	isPrimary,
}: {
	icon: any;
	label: string;
	value: string | number;
	subValue?: string;
	trend?: string;
	isPrimary?: boolean;
}) {
	return (
		<Card className='overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 group'>
			<CardContent className='pt-6 relative'>
				<div className='relative flex items-center justify-between'>
					<div className='flex items-center gap-3 sm:gap-4'>
						<div
							className={`p-3 sm:p-4 rounded-2xl shadow-lg ${
								isPrimary ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-600 dark:bg-gray-700'
							}`}
						>
							<Icon className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
						</div>
						<div>
							<p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mb-1'>
								{label}
							</p>
							<p className='text-2xl sm:text-3xl font-black text-gray-900 dark:text-white'>{value}</p>
							{subValue && <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>{subValue}</p>}
						</div>
					</div>
					{trend && (
						<div className='flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg'>
							<TrendingUp className='w-3.5 h-3.5 text-blue-600 dark:text-blue-400' />
							<span className='text-xs font-bold text-blue-600 dark:text-blue-400'>{trend}</span>
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
			color: 'bg-gray-600 dark:bg-gray-700',
			icon: Clock,
		},
		paid: {
			label: 'Đã thanh toán',
			color: 'bg-blue-600 dark:bg-blue-500',
			icon: CheckCircle,
		},
		refunded: {
			label: 'Đã hoàn tiền',
			color: 'bg-gray-500 dark:bg-gray-600',
			icon: XCircle,
		},
	};

	const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
	const Icon = config.icon;

	return (
		<div
			className={`${config.color} text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md font-semibold text-xs sm:text-sm`}
		>
			<Icon className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
			<span>{config.label}</span>
		</div>
	);
}

function PaymentMethodBadge({ method }: { method: string }) {
	const methodConfig = {
		wallet: {
			label: 'Ví điện tử',
			icon: Wallet,
		},
		sepay: {
			label: 'SePay',
			icon: CreditCard,
		},
		momo: {
			label: 'MoMo',
			icon: CreditCard,
		},
	};

	const config = methodConfig[method as keyof typeof methodConfig] || methodConfig.sepay;
	const Icon = config.icon;

	return (
		<div className='flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg'>
			<Icon className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
			<span className='text-xs sm:text-sm font-semibold'>{config.label}</span>
		</div>
	);
}

function OrderCard({ order }: { order: Order }) {
	return (
		<Card className='hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden group'>
			{/* Top colored bar */}
			<div className={`h-1.5 ${order.status === 'paid' ? 'bg-blue-600' : 'bg-gray-600'}`}></div>

			<CardContent className='pt-5 sm:pt-6'>
				<div className='space-y-4'>
					{/* Header */}
					<div className='flex items-start justify-between gap-3'>
						<div className='flex-1'>
							<div className='flex items-center gap-2 mb-2'>
								<div className='bg-gray-100 dark:bg-gray-700 p-2 rounded-lg'>
									<Receipt className='w-4 h-4 text-gray-600 dark:text-gray-400' />
								</div>
								<div>
									<span className='text-xs sm:text-sm font-bold text-gray-900 dark:text-white block'>
										#{order.id.slice(0, 8).toUpperCase()}
									</span>
									<div className='flex items-center gap-1 mt-0.5'>
										<Calendar className='w-3 h-3 text-gray-400' />
										<span className='text-xs text-gray-500 dark:text-gray-400'>
											{formatDate(order.created_at)}
										</span>
									</div>
								</div>
							</div>
						</div>
						<OrderStatusBadge status={order.status} />
					</div>

					{/* Content */}
					<div className='bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-xs text-gray-600 dark:text-gray-400 font-medium mb-1'>
									Tổng thanh toán
								</p>
								<div className='flex items-baseline gap-1'>
									<DollarSign className='w-4 h-4 text-gray-400' />
									<p className='text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400'>
										{formatCurrency(parseFloat(order.total_amount.toString()))}
									</p>
								</div>
							</div>
							<PaymentMethodBadge method={order.payment_method} />
						</div>
					</div>

					{/* Actions */}
					<div className='flex gap-2 pt-2'>
						<Link href={`/orders/${order.id}`} className='flex-1'>
							<Button
								variant='outline'
								className='w-full h-10 sm:h-11 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all group/btn'
								size='sm'
							>
								<span>Chi tiết</span>
								<ArrowRight className='w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform' />
							</Button>
						</Link>

						{order.status === 'pending' && (
							<Link href={`/orders/${order.id}`} className='flex-1'>
								<Button
									className='w-full h-10 sm:h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl font-semibold shadow-lg transition-all'
									size='sm'
								>
									Thanh toán
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
		<div className='text-center py-12 sm:py-20'>
			<div className='bg-gray-100 dark:bg-gray-800 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg'>
				<Package className='w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500' />
			</div>
			<h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2'>
				{messages[status as keyof typeof messages] || messages.all}
			</h3>
			<p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6'>Hãy bắt đầu mua sắm ngay!</p>
			<Link href='/'>
				<Button className='h-11 sm:h-12 px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-lg font-semibold'>
					<ShoppingBag className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
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
					<div className='bg-blue-600 dark:bg-blue-500 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl'>
						<Package className='w-10 h-10 sm:w-12 sm:h-12 text-white' />
					</div>
					<h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3'>
						Vui lòng đăng nhập
					</h2>
					<p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6'>
						Bạn cần đăng nhập để xem đơn hàng
					</p>
					<Link href='/sign-in'>
						<Button
							size='lg'
							className='h-12 sm:h-14 px-8 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-lg font-bold text-base'
						>
							Đăng nhập ngay
						</Button>
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
			<div className='mx-auto'>
				{/* Header */}
				<div className='mb-6 sm:mb-8 lg:mb-10'>
					<div className='flex items-center gap-3 sm:gap-4 mb-3'>
						<div className='bg-blue-600 dark:bg-blue-500 p-2.5 sm:p-3 rounded-2xl shadow-lg'>
							<ShoppingBag className='w-6 h-6 sm:w-7 sm:h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white'>
								Đơn hàng của tôi
							</h1>
							<p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1'>
								Quản lý và theo dõi đơn hàng của bạn
							</p>
						</div>
					</div>
				</div>

				{/* Stats */}
				{statsLoading ? (
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8'>
						{[1, 2, 3, 4].map((i) => (
							<Card key={i} className='border-0'>
								<CardContent className='pt-6'>
									<div className='animate-pulse space-y-3'>
										<div className='h-12 sm:h-14 bg-gray-200 dark:bg-gray-700 rounded-xl' />
										<div className='h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3' />
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : stats ? (
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8'>
						<StatsCard icon={ShoppingBag} label='Tổng đơn hàng' value={stats.total_orders} isPrimary />
						<StatsCard icon={Clock} label='Chờ thanh toán' value={stats.pending_orders} />
						<StatsCard icon={CheckCircle} label='Đã thanh toán' value={stats.paid_orders} isPrimary />
						<StatsCard
							icon={Wallet}
							label='Tổng chi tiêu'
							value={formatCurrency(stats.total_spent)}
							subValue={`${stats.wallet_payments} đơn qua ví`}
						/>
					</div>
				) : null}

				{/* Orders List */}
				<Card className='border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800'>
					<CardHeader className='pb-4 sm:pb-6'>
						<div className='flex items-center gap-2'>
							<Receipt className='w-5 h-5 text-blue-600 dark:text-blue-400' />
							<CardTitle className='text-xl sm:text-2xl font-bold'>Danh sách đơn hàng</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<TabsList className='grid w-full grid-cols-2 sm:grid-cols-4 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl h-auto gap-1'>
								<TabsTrigger
									value='all'
									className='rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold text-xs sm:text-sm py-2.5'
								>
									<span className='hidden sm:inline'>Tất cả</span>
									<span className='sm:hidden'>Tất cả</span>
									<span className='ml-1'>({orders.length})</span>
								</TabsTrigger>
								<TabsTrigger
									value='pending'
									className='rounded-lg data-[state=active]:bg-gray-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold text-xs sm:text-sm py-2.5'
								>
									<span className='hidden sm:inline'>Chờ</span>
									<span className='sm:hidden'>Chờ</span>
									<span className='ml-1'>
										({orders.filter((o) => o.status === 'pending').length})
									</span>
								</TabsTrigger>
								<TabsTrigger
									value='paid'
									className='rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold text-xs sm:text-sm py-2.5'
								>
									<span className='hidden sm:inline'>Đã TT</span>
									<span className='sm:hidden'>TT</span>
									<span className='ml-1'>({orders.filter((o) => o.status === 'paid').length})</span>
								</TabsTrigger>
								<TabsTrigger
									value='refunded'
									className='rounded-lg data-[state=active]:bg-gray-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold text-xs sm:text-sm py-2.5'
								>
									<span className='hidden sm:inline'>Hoàn</span>
									<span className='sm:hidden'>Hoàn</span>
									<span className='ml-1'>
										({orders.filter((o) => o.status === 'refunded').length})
									</span>
								</TabsTrigger>
							</TabsList>

							{ordersLoading ? (
								<div className='space-y-4'>
									{[1, 2, 3].map((i) => (
										<Card key={i} className='border-0'>
											<CardContent className='pt-6'>
												<div className='animate-pulse space-y-3'>
													<div className='h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4' />
													<div className='h-8 bg-gray-200 dark:bg-gray-700 rounded-lg' />
													<div className='h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2' />
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : filteredOrders.length === 0 ? (
								<EmptyOrders status={activeTab} />
							) : (
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
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
