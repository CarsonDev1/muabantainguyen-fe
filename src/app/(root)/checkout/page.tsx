'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
	Package,
	ShoppingCart,
	Wallet,
	ArrowLeft,
	Loader2,
	CheckCircle,
	AlertCircle,
	Sparkles,
	TrendingUp,
	Shield,
	Tag,
	X,
	Percent,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/utils/format-currency';
import cartService, { CartItem } from '@/services/cart-service';
import orderService from '@/services/order-service';
import walletService from '@/services/wallet-service';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { voucherService } from '@/services/voucher-service';

// ============ COMPONENTS ============

function CartItemCard({ item }: { item: CartItem }) {
	return (
		<div className='group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 transition-all hover:shadow-lg hover:scale-[1.02]'>
			<div className='flex items-center gap-4'>
				{/* Product Image */}
				<div className='relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex-shrink-0'>
					{item.image_url ? (
						<Image src={item.image_url} alt={item.name} fill className='object-cover' />
					) : (
						<div className='w-full h-full flex items-center justify-center'>
							<Package className='w-8 h-8 text-gray-400' />
						</div>
					)}
					{/* Quantity Badge */}
					<div className='absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg'>
						{item.quantity}
					</div>
				</div>

				{/* Product Info */}
				<div className='flex-1 min-w-0'>
					<h3 className='font-semibold text-gray-900 dark:text-white truncate'>{item.name}</h3>
					<p className='text-sm text-gray-500 dark:text-gray-400'>
						{formatCurrency(parseFloat(item.price))} × {item.quantity}
					</p>
				</div>

				{/* Price */}
				<div className='text-right'>
					<p className='text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
						{formatCurrency(parseFloat(item.price) * item.quantity)}
					</p>
				</div>
			</div>
		</div>
	);
}

function VoucherCard({
	totalAmount,
	onVoucherApplied,
}: {
	totalAmount: number;
	onVoucherApplied: (discount: number, code: string) => void;
}) {
	const [voucherCode, setVoucherCode] = useState('');
	const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);

	const applyVoucherMutation = useMutation({
		mutationFn: (code: string) => voucherService.applyVoucher({ code, amount: totalAmount }),
		onSuccess: (data) => {
			const discount = totalAmount - data.discountedAmount;
			setAppliedVoucher({ code: voucherCode, discount });
			onVoucherApplied(discount, voucherCode);
			toast.success(`✨ Áp dụng voucher thành công! Giảm ${formatCurrency(discount)}`, {
				position: 'top-right',
				autoClose: 3000,
			});
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || 'Mã voucher không hợp lệ', {
				position: 'top-right',
				autoClose: 3000,
			});
		},
	});

	const handleApplyVoucher = () => {
		if (!voucherCode.trim()) {
			toast.error('Vui lòng nhập mã voucher', {
				position: 'top-right',
				autoClose: 2000,
			});
			return;
		}
		applyVoucherMutation.mutate(voucherCode);
	};

	const handleRemoveVoucher = () => {
		setAppliedVoucher(null);
		setVoucherCode('');
		onVoucherApplied(0, '');
		toast.info('Đã xóa voucher', {
			position: 'top-right',
			autoClose: 2000,
		});
	};

	return (
		<Card className='overflow-hidden border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'>
			<CardHeader className='pb-4'>
				<CardTitle className='flex items-center gap-2'>
					<div className='p-2 rounded-lg bg-orange-600'>
						<Tag className='w-5 h-5 text-white' />
					</div>
					<span className='text-gray-900 dark:text-white'>Mã giảm giá</span>
					{appliedVoucher && (
						<Badge className='ml-auto bg-green-600'>
							<CheckCircle className='w-3 h-3 mr-1' />
							Đã áp dụng
						</Badge>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				{!appliedVoucher ? (
					<>
						<div className='flex gap-2'>
							<Input
								placeholder='Nhập mã voucher'
								value={voucherCode}
								onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
								className='flex-1 bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-800 focus:border-orange-600'
								disabled={applyVoucherMutation.isPending}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										handleApplyVoucher();
									}
								}}
							/>
							<Button
								onClick={handleApplyVoucher}
								disabled={applyVoucherMutation.isPending || !voucherCode.trim()}
								className='bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
							>
								{applyVoucherMutation.isPending ? (
									<Loader2 className='w-4 h-4 animate-spin' />
								) : (
									'Áp dụng'
								)}
							</Button>
						</div>

						<div className='bg-white dark:bg-gray-800 rounded-lg p-3 border border-orange-200 dark:border-orange-800'>
							<p className='text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2'>
								<Sparkles className='w-4 h-4 text-orange-600' />
								Nhập mã để nhận ưu đãi đặc biệt
							</p>
						</div>
					</>
				) : (
					<div className='bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-green-200 dark:border-green-800'>
						<div className='flex items-start justify-between'>
							<div className='flex-1'>
								<div className='flex items-center gap-2 mb-2'>
									<Badge
										variant='outline'
										className='font-mono text-sm border-green-600 text-green-600'
									>
										{appliedVoucher.code}
									</Badge>
									<Badge className='bg-green-600'>
										<Percent className='w-3 h-3 mr-1' />
										Giảm giá
									</Badge>
								</div>
								<p className='text-2xl font-bold text-green-600'>
									-{formatCurrency(appliedVoucher.discount)}
								</p>
								<p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
									Bạn đã tiết kiệm được {formatCurrency(appliedVoucher.discount)}
								</p>
							</div>
							<Button
								size='sm'
								variant='ghost'
								onClick={handleRemoveVoucher}
								className='text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
							>
								<X className='w-4 h-4' />
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function WalletInfoCard({
	balance,
	isLoading,
	totalAmount,
}: {
	balance?: number;
	isLoading: boolean;
	totalAmount: number;
}) {
	const canPay = balance !== undefined && balance >= totalAmount;
	const shortage = balance !== undefined ? totalAmount - balance : 0;

	return (
		<Card className='overflow-hidden border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20'>
			<CardHeader className='pb-4'>
				<CardTitle className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<div className='p-2 rounded-lg bg-blue-600'>
							<Wallet className='w-5 h-5 text-white' />
						</div>
						<span className='text-gray-900 dark:text-white'>Ví của bạn</span>
					</div>
					<Badge variant={canPay ? 'default' : 'destructive'} className='px-3 py-1'>
						{canPay ? '✓ Đủ số dư' : '✗ Không đủ'}
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				{/* Balance Display */}
				<div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm'>
					<p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Số dư hiện tại</p>
					{isLoading ? (
						<div className='flex items-center gap-2'>
							<Loader2 className='w-5 h-5 animate-spin text-blue-600' />
							<span className='text-gray-500'>Đang tải...</span>
						</div>
					) : (
						<p className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
							{formatCurrency(balance || 0)}
						</p>
					)}
				</div>

				{/* Insufficient Balance Warning */}
				{!canPay && balance !== undefined && (
					<div className='bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4'>
						<div className='flex items-start gap-3'>
							<AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
							<div className='flex-1'>
								<p className='font-semibold text-red-900 dark:text-red-100 mb-1'>Số dư không đủ</p>
								<p className='text-sm text-red-700 dark:text-red-300 mb-3'>
									Bạn cần thêm <strong>{formatCurrency(shortage)}</strong> để hoàn tất thanh toán
								</p>
								<Link href='/wallet'>
									<Button
										size='sm'
										className='w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
									>
										<Wallet className='w-4 h-4 mr-2' />
										Nạp tiền ngay
									</Button>
								</Link>
							</div>
						</div>
					</div>
				)}

				{/* Features */}
				<div className='space-y-2 pt-2'>
					<div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
						<Shield className='w-4 h-4 text-green-600' />
						<span>Bảo mật cao</span>
					</div>
					<div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
						<TrendingUp className='w-4 h-4 text-blue-600' />
						<span>Xử lý tức thì</span>
					</div>
					<div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
						<Sparkles className='w-4 h-4 text-purple-600' />
						<span>Không phí giao dịch</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function OrderSummaryCard({
	items,
	subtotal,
	discount,
	totalAmount,
	voucherCode,
	onCheckout,
	isProcessing,
	canPay,
}: {
	items: CartItem[];
	subtotal: number;
	discount: number;
	totalAmount: number;
	voucherCode?: string;
	onCheckout: () => void;
	isProcessing: boolean;
	canPay: boolean;
}) {
	const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
	const hasDiscount = discount > 0;

	return (
		<Card className='sticky top-20 overflow-hidden border-2 border-gray-200 dark:border-gray-700'>
			<CardHeader className='bg-gradient-to-r from-blue-600 to-purple-600 text-white'>
				<CardTitle className='flex items-center gap-2'>
					<ShoppingCart className='w-5 h-5' />
					Tổng kết đơn hàng
				</CardTitle>
			</CardHeader>
			<CardContent className='p-6 space-y-6'>
				{/* Summary Details */}
				<div className='space-y-4'>
					<div className='flex justify-between items-center'>
						<span className='text-gray-600 dark:text-gray-400'>Số lượng sản phẩm</span>
						<span className='font-semibold text-gray-900 dark:text-white'>{items.length}</span>
					</div>

					<div className='flex justify-between items-center'>
						<span className='text-gray-600 dark:text-gray-400'>Tổng số lượng</span>
						<span className='font-semibold text-gray-900 dark:text-white'>{totalQuantity}</span>
					</div>

					<Separator />

					<div className='flex justify-between items-center'>
						<span className='text-gray-600 dark:text-gray-400'>Tạm tính</span>
						<span className='font-semibold text-gray-900 dark:text-white'>{formatCurrency(subtotal)}</span>
					</div>

					{/* Discount */}
					{hasDiscount && (
						<div className='bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800'>
							<div className='flex justify-between items-center'>
								<div className='flex items-center gap-2'>
									<Tag className='w-4 h-4 text-green-600' />
									<span className='text-sm font-medium text-green-800 dark:text-green-200'>
										Giảm giá
									</span>
									{voucherCode && (
										<Badge variant='outline' className='text-xs border-green-600 text-green-600'>
											{voucherCode}
										</Badge>
									)}
								</div>
								<span className='font-bold text-green-600'>-{formatCurrency(discount)}</span>
							</div>
						</div>
					)}

					{/* Free Fee */}
					<div className='bg-green-50 dark:bg-green-900/20 rounded-lg p-3'>
						<div className='flex justify-between items-center'>
							<span className='text-sm text-green-800 dark:text-green-200'>Phí giao dịch</span>
							<span className='font-semibold text-green-600'>Miễn phí</span>
						</div>
					</div>

					<Separator className='my-4' />

					{/* Total */}
					<div className='bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4'>
						<div className='flex justify-between items-center'>
							<span className='text-lg font-semibold text-gray-900 dark:text-white'>Tổng thanh toán</span>
							<div className='text-right'>
								{hasDiscount && (
									<p className='text-sm text-gray-500 dark:text-gray-400 line-through mb-1'>
										{formatCurrency(subtotal)}
									</p>
								)}
								<p className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
									{formatCurrency(totalAmount)}
								</p>
								<p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>Từ ví điện tử</p>
							</div>
						</div>
					</div>

					{/* Savings Badge */}
					{hasDiscount && (
						<div className='text-center bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-3 animate-pulse'>
							<p className='text-sm font-semibold'>🎉 Bạn tiết kiệm được {formatCurrency(discount)}!</p>
						</div>
					)}
				</div>

				{/* Checkout Button */}
				<Button
					size='lg'
					className='w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all'
					onClick={onCheckout}
					disabled={isProcessing || items.length === 0 || !canPay}
				>
					{isProcessing ? (
						<>
							<Loader2 className='w-5 h-5 mr-2 animate-spin' />
							Đang xử lý...
						</>
					) : (
						<>
							<Wallet className='w-5 h-5 mr-2' />
							Thanh toán ngay
						</>
					)}
				</Button>

				<p className='text-xs text-center text-gray-500 dark:text-gray-400'>
					🔒 Giao dịch được mã hóa và bảo mật
				</p>
			</CardContent>
		</Card>
	);
}

// ============ MAIN COMPONENT ============

function CheckoutPage() {
	const { user } = useAuth();
	const router = useRouter();
	const queryClient = useQueryClient();

	// Voucher state
	const [voucherDiscount, setVoucherDiscount] = useState(0);
	const [appliedVoucherCode, setAppliedVoucherCode] = useState('');

	// Fetch cart data
	const {
		data: cartData,
		isLoading: isCartLoading,
		isError: isCartError,
	} = useQuery({
		queryKey: ['cart'],
		queryFn: cartService.getCart,
	});

	// Fetch wallet data
	const { data: walletData, isLoading: walletLoading } = useQuery({
		queryKey: ['wallet'],
		queryFn: walletService.getWallet,
	});

	// Calculate amounts
	const subtotal = cartData?.total || 0;
	const finalTotal = subtotal - voucherDiscount;

	// Checkout mutation
	const checkoutMutation = useMutation({
		mutationFn: async () => {
			if (!cartData?.items.length) {
				throw new Error('Giỏ hàng trống');
			}

			return orderService.enhancedCheckout({
				paymentMethod: 'wallet',
				useWallet: true,
				voucherCode: appliedVoucherCode || undefined,
			});
		},
		onSuccess: async (data) => {
			toast.success('🎉 Thanh toán thành công!', {
				position: 'top-right',
				autoClose: 3000,
			});

			// Invalidate queries
			queryClient.invalidateQueries({ queryKey: ['cart'] });
			queryClient.invalidateQueries({ queryKey: ['wallet'] });
			queryClient.invalidateQueries({ queryKey: ['orders'] });

			// Redirect to order detail
			setTimeout(() => {
				router.push(`/orders/${data.orderId}`);
			}, 1500);
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.error || error.message || 'Có lỗi xảy ra!', {
				position: 'top-right',
				autoClose: 5000,
			});
		},
	});

	const handleVoucherApplied = (discount: number, code: string) => {
		setVoucherDiscount(discount);
		setAppliedVoucherCode(code);
	};

	const handleCheckout = () => {
		if (!cartData?.items.length) {
			toast.error('Giỏ hàng trống!', {
				position: 'top-right',
				autoClose: 3000,
			});
			return;
		}

		const balance = walletData?.wallet?.balance || 0;
		if (balance < finalTotal) {
			toast.error('Số dư ví không đủ!', {
				position: 'top-right',
				autoClose: 3000,
			});
			return;
		}

		checkoutMutation.mutate();
	};

	// ============ RENDER STATES ============

	if (!user) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4'>
				<Card className='max-w-md w-full text-center p-8'>
					<div className='w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6'>
						<Package className='w-10 h-10 text-white' />
					</div>
					<h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>Vui lòng đăng nhập</h2>
					<p className='text-gray-600 dark:text-gray-400 mb-6'>Bạn cần đăng nhập để thanh toán</p>
					<Link href='/sign-in'>
						<Button
							size='lg'
							className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
						>
							Đăng nhập ngay
						</Button>
					</Link>
				</Card>
			</div>
		);
	}

	if (isCartLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center'>
				<div className='text-center'>
					<Loader2 className='w-12 h-12 animate-spin mx-auto mb-4 text-blue-600' />
					<p className='text-gray-600 dark:text-gray-400 text-lg'>Đang tải thông tin thanh toán...</p>
				</div>
			</div>
		);
	}

	if (isCartError || !cartData) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4'>
				<Card className='max-w-md w-full text-center p-8'>
					<AlertCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
					<h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>Lỗi tải thông tin</h2>
					<p className='text-gray-600 dark:text-gray-400 mb-6'>Không thể tải thông tin thanh toán</p>
					<Button onClick={() => window.location.reload()} className='w-full'>
						Thử lại
					</Button>
				</Card>
			</div>
		);
	}

	// Show success state
	if (checkoutMutation.isSuccess) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4'>
				<Card className='max-w-md w-full text-center p-8'>
					<div className='w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse'>
						<CheckCircle className='w-10 h-10 text-white' />
					</div>
					<h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>Thanh toán thành công!</h1>
					<p className='text-gray-600 dark:text-gray-400 mb-6'>
						Đơn hàng của bạn đã được xử lý. Đang chuyển hướng...
					</p>
					<Loader2 className='w-6 h-6 animate-spin mx-auto text-blue-600' />
				</Card>
			</div>
		);
	}

	// Main checkout form
	const items = cartData.items;
	const walletBalance = walletData?.wallet?.balance || 0;
	const canPay = walletBalance >= finalTotal;

	if (items.length === 0) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4'>
				<Card className='max-w-md w-full text-center p-8'>
					<div className='w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6'>
						<ShoppingCart className='w-10 h-10 text-gray-500' />
					</div>
					<h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>Giỏ hàng trống</h2>
					<p className='text-gray-600 dark:text-gray-400 mb-6'>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục</p>
					<Link href='/'>
						<Button
							size='lg'
							className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
						>
							Khám phá sản phẩm
						</Button>
					</Link>
				</Card>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900'>
			<div className='w-full mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				{/* Header */}
				<div className='mb-8'>
					<Link
						href='/cart'
						className='inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors'
					>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Quay lại giỏ hàng
					</Link>
					<h1 className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
						Thanh toán đơn hàng
					</h1>
					<p className='text-gray-600 dark:text-gray-400 mt-2'>Hoàn tất thanh toán bằng ví điện tử của bạn</p>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* Left Column - Cart Items & Wallet */}
					<div className='lg:col-span-2 space-y-6'>
						{/* Cart Items */}
						<Card className='overflow-hidden'>
							<CardHeader className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b'>
								<CardTitle className='flex items-center gap-2'>
									<ShoppingCart className='w-5 h-5 text-blue-600' />
									Sản phẩm trong giỏ ({items.length})
								</CardTitle>
							</CardHeader>
							<CardContent className='p-6'>
								<div className='space-y-3'>
									{items.map((item) => (
										<CartItemCard key={item.id} item={item} />
									))}
								</div>
							</CardContent>
						</Card>

						{/* Voucher Card */}
						<VoucherCard totalAmount={subtotal} onVoucherApplied={handleVoucherApplied} />

						{/* Wallet Info */}
						<WalletInfoCard balance={walletBalance} isLoading={walletLoading} totalAmount={finalTotal} />
					</div>

					{/* Right Column - Order Summary */}
					<div className='lg:col-span-1'>
						<OrderSummaryCard
							items={items}
							subtotal={subtotal}
							discount={voucherDiscount}
							totalAmount={finalTotal}
							voucherCode={appliedVoucherCode}
							onCheckout={handleCheckout}
							isProcessing={checkoutMutation.isPending}
							canPay={canPay}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export default CheckoutPage;
