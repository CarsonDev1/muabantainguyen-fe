// src/app/orders/[id]/page.tsx
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
	Package,
	ArrowLeft,
	Clock,
	CheckCircle,
	XCircle,
	Wallet,
	CreditCard,
	Calendar,
	Receipt,
	ShoppingBag,
	Loader2,
	AlertCircle,
	Download,
	Share2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/utils/format-currency';
import orderService, { OrderDetail } from '@/services/order-service';
import { useAuth } from '@/context/auth-context';
import { useParams } from 'next/navigation';
import { formatDate } from '@/utils/format-date';

// ============ COMPONENTS ============

function StatusTimeline({ order }: { order: OrderDetail }) {
	const steps = [
		{
			status: 'pending',
			label: 'Đơn hàng đã tạo',
			icon: Receipt,
			date: order.created_at,
			active: true,
		},
		{
			status: 'paid',
			label: 'Đã thanh toán',
			icon: CheckCircle,
			date: order.status === 'paid' || order.status === 'refunded' ? order.updated_at : null,
			active: order.status === 'paid' || order.status === 'refunded',
		},
		{
			status: 'refunded',
			label: 'Đã hoàn tiền',
			icon: XCircle,
			date: order.status === 'refunded' ? order.updated_at : null,
			active: order.status === 'refunded',
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Clock className='w-5 h-5' />
					Trạng thái đơn hàng
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					{steps.map((step, index) => {
						const Icon = step.icon;
						const isLast = index === steps.length - 1;

						return (
							<div key={step.status} className='flex gap-4'>
								<div className='flex flex-col items-center'>
									<div
										className={`w-10 h-10 rounded-full flex items-center justify-center ${
											step.active
												? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
												: 'bg-gray-100 dark:bg-gray-800 text-gray-400'
										}`}
									>
										<Icon className='w-5 h-5' />
									</div>
									{!isLast && (
										<div
											className={`w-0.5 h-12 ${
												step.active
													? 'bg-green-300 dark:bg-green-700'
													: 'bg-gray-200 dark:bg-gray-700'
											}`}
										/>
									)}
								</div>
								<div className='flex-1 pb-4'>
									<p
										className={`font-medium ${
											step.active ? 'text-gray-900 dark:text-white' : 'text-gray-400'
										}`}
									>
										{step.label}
									</p>
									{step.date && (
										<p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
											{formatDate(step.date)}
										</p>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

function OrderItems({ items }: { items: OrderDetail['items'] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<ShoppingBag className='w-5 h-5' />
					Sản phẩm ({items.length})
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					{items.map((item) => (
						<div
							key={item.id}
							className='flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'
						>
							<div className='w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0'>
								<div className='w-full h-full flex items-center justify-center'>
									<Package className='w-8 h-8 text-gray-400' />
								</div>
							</div>
							<div className='flex-1 min-w-0'>
								<h3 className='font-medium text-gray-900 dark:text-white truncate'>{item.name}</h3>
								<p className='text-sm text-gray-600 dark:text-gray-400'>
									{formatCurrency(parseFloat(item.price.toString()))} × {item.quantity}
								</p>
							</div>
							<div className='text-right'>
								<p className='font-bold text-gray-900 dark:text-white'>
									{formatCurrency(parseFloat(item.price.toString()) * item.quantity)}
								</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function PaymentInfo({ order }: { order: OrderDetail }) {
	const paymentMethodLabels = {
		wallet: 'Ví điện tử',
		sepay: 'Chuyển khoản ngân hàng (SePay)',
		momo: 'MoMo',
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<CreditCard className='w-5 h-5' />
					Thông tin thanh toán
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='flex justify-between'>
					<span className='text-gray-600 dark:text-gray-400'>Phương thức:</span>
					<span className='font-medium'>
						{paymentMethodLabels[order.payment_method as keyof typeof paymentMethodLabels] ||
							order.payment_method}
					</span>
				</div>

				<div className='flex justify-between'>
					<span className='text-gray-600 dark:text-gray-400'>Trạng thái:</span>
					<div>
						{order.status === 'pending' && (
							<Badge className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'>
								Chờ thanh toán
							</Badge>
						)}
						{order.status === 'paid' && (
							<Badge className='bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'>
								Đã thanh toán
							</Badge>
						)}
						{order.status === 'refunded' && (
							<Badge className='bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'>
								Đã hoàn tiền
							</Badge>
						)}
					</div>
				</div>

				<Separator />

				<div className='flex justify-between items-center'>
					<span className='text-lg font-semibold'>Tổng cộng:</span>
					<span className='text-2xl font-bold text-blue-600'>
						{formatCurrency(parseFloat(order.total_amount.toString()))}
					</span>
				</div>

				{/* Wallet Transaction Info */}
				{order.wallet_transaction && (
					<>
						<Separator />
						<div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2'>
							<div className='flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2'>
								<Wallet className='w-4 h-4' />
								<span className='font-medium'>Giao dịch ví</span>
							</div>
							<div className='text-sm space-y-1'>
								<div className='flex justify-between'>
									<span className='text-gray-600 dark:text-gray-400'>Mã GD:</span>
									<span className='font-mono'>{order.wallet_transaction.id.slice(0, 8)}</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-gray-600 dark:text-gray-400'>Thời gian:</span>
									<span>{formatDate(order.wallet_transaction.created_at)}</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-gray-600 dark:text-gray-400'>Trạng thái:</span>
									<Badge variant='outline' className='bg-green-50 dark:bg-green-900/20'>
										{order.wallet_transaction.status}
									</Badge>
								</div>
							</div>
						</div>
					</>
				)}

				{/* Pending payment CTA */}
				{order.status === 'pending' && (
					<div className='pt-4'>
						<Button className='w-full' size='lg'>
							<CreditCard className='w-5 h-5 mr-2' />
							Thanh toán ngay
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function OrderSummary({ order }: { order: OrderDetail }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Receipt className='w-5 h-5' />
					Thông tin đơn hàng
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='space-y-3'>
					<div className='flex justify-between text-sm'>
						<span className='text-gray-600 dark:text-gray-400'>Mã đơn hàng:</span>
						<span className='font-mono font-medium'>#{order.id.slice(0, 8).toUpperCase()}</span>
					</div>

					<div className='flex justify-between text-sm'>
						<span className='text-gray-600 dark:text-gray-400'>Ngày tạo:</span>
						<span className='font-medium'>{formatDate(order.created_at)}</span>
					</div>

					<div className='flex justify-between text-sm'>
						<span className='text-gray-600 dark:text-gray-400'>Số lượng sản phẩm:</span>
						<span className='font-medium'>{order.items.length}</span>
					</div>
				</div>

				<Separator />

				<div className='flex gap-2'>
					<Button variant='outline' className='flex-1' size='sm'>
						<Download className='w-4 h-4 mr-2' />
						Tải hóa đơn
					</Button>
					<Button variant='outline' className='flex-1' size='sm'>
						<Share2 className='w-4 h-4 mr-2' />
						Chia sẻ
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

// ============ MAIN COMPONENT ============

export default function OrderDetailPage() {
	const { user } = useAuth();
	const params = useParams();
	const orderId = params.id as string;

	const { data, isLoading, isError } = useQuery({
		queryKey: ['order', orderId],
		queryFn: () => orderService.getOrderById(orderId),
		enabled: !!user && !!orderId,
	});

	if (!user) {
		return (
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
				<div className='text-center'>
					<Package className='w-16 h-16 text-gray-400 mx-auto mb-4' />
					<h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>Vui lòng đăng nhập</h2>
					<Link href='/sign-in'>
						<Button size='lg'>Đăng nhập</Button>
					</Link>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
				<div className='text-center'>
					<Loader2 className='w-8 h-8 animate-spin mx-auto mb-4 text-blue-600' />
					<p className='text-gray-600 dark:text-gray-400'>Đang tải thông tin đơn hàng...</p>
				</div>
			</div>
		);
	}

	if (isError || !data?.order) {
		return (
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
				<div className='text-center'>
					<AlertCircle className='w-16 h-16 text-red-400 mx-auto mb-4' />
					<h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
						Không tìm thấy đơn hàng
					</h2>
					<p className='text-gray-600 dark:text-gray-400 mb-6'>
						Đơn hàng không tồn tại hoặc bạn không có quyền truy cập
					</p>
					<Link href='/admin/orders'>
						<Button>
							<ArrowLeft className='w-4 h-4 mr-2' />
							Quay lại danh sách
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	const order = data.order;

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				{/* Header */}
				<div className='mb-6'>
					<Link
						href='/admin/orders'
						className='inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4'
					>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Quay lại danh sách đơn hàng
					</Link>
					<div className='flex items-center justify-between'>
						<div>
							<h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>Chi tiết đơn hàng</h1>
							<p className='text-gray-600 dark:text-gray-400'>
								Mã đơn hàng: #{order.id.slice(0, 8).toUpperCase()}
							</p>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
					{/* Left Column - Timeline + Items */}
					<div className='lg:col-span-2 space-y-6'>
						<StatusTimeline order={order} />
						<OrderItems items={order.items} />
					</div>

					{/* Right Column - Payment + Summary */}
					<div className='space-y-6'>
						<PaymentInfo order={order} />
						<OrderSummary order={order} />
					</div>
				</div>
			</div>
		</div>
	);
}
