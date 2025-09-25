'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { Package, ShoppingCart, Plus, Minus, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/utils/format-currency';
import cartService, { CartItem } from '@/services/cart-service';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

function CartItemCard({ item }: { item: CartItem }) {
	const queryClient = useQueryClient();

	const updateQuantityMutation = useMutation({
		mutationFn: (quantity: number) =>
			cartService.updateCartItem({
				productId: item.product_id,
				quantity,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['cart'] });
			toast.success('Đã cập nhật số lượng sản phẩm!', {
				position: 'top-right',
				autoClose: 2000,
			});
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật số lượng!', {
				position: 'top-right',
				autoClose: 3000,
			});
		},
	});

	const removeItemMutation = useMutation({
		mutationFn: () =>
			cartService.removeFromCart({
				productId: item.product_id,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['cart'] });
			toast.success('Đã xóa sản phẩm khỏi giỏ hàng!', {
				position: 'top-right',
				autoClose: 2000,
			});
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa sản phẩm!', {
				position: 'top-right',
				autoClose: 3000,
			});
		},
	});

	const handleQuantityChange = (newQuantity: number) => {
		if (newQuantity < 1) return;
		updateQuantityMutation.mutate(newQuantity);
	};

	const subtotal = parseFloat(item.price) * item.quantity;

	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
			<div className='flex items-center gap-4'>
				{/* Product Image */}
				<div className='w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0'>
					{item.image_url ? (
						<Image
							src={item.image_url}
							alt={item.name}
							width={500}
							height={500}
							className='w-full h-full object-cover'
						/>
					) : (
						<div className='w-full h-full flex items-center justify-center'>
							<Package className='w-8 h-8 text-gray-400' />
						</div>
					)}
				</div>

				{/* Product Info */}
				<div className='flex-1 min-w-0'>
					<Link href={`/products/${item.slug}`} className='hover:text-blue-600'>
						<h3 className='font-medium text-gray-900 dark:text-white'>{item.name}</h3>
					</Link>
					<p className='text-sm text-gray-600 dark:text-gray-400'>{formatCurrency(parseFloat(item.price))}</p>
				</div>

				{/* Quantity Controls */}
				<div className='flex items-center gap-2'>
					<Button
						size='sm'
						variant='outline'
						onClick={() => handleQuantityChange(item.quantity - 1)}
						disabled={updateQuantityMutation.isPending || item.quantity <= 1}
						className='w-8 h-8 p-0'
					>
						<Minus className='w-4 h-4' />
					</Button>
					<span className='w-8 text-center font-medium'>{item.quantity}</span>
					<Button
						size='sm'
						variant='outline'
						onClick={() => handleQuantityChange(item.quantity + 1)}
						disabled={updateQuantityMutation.isPending}
						className='w-8 h-8 p-0'
					>
						<Plus className='w-4 h-4' />
					</Button>
				</div>

				{/* Subtotal */}
				<div className='text-right min-w-0'>
					<p className='font-medium text-gray-900 dark:text-white'>{formatCurrency(subtotal)}</p>
				</div>

				{/* Remove Button with AlertDialog */}
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							size='sm'
							variant='ghost'
							disabled={removeItemMutation.isPending}
							className='text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20'
						>
							{removeItemMutation.isPending ? (
								<Loader2 className='w-4 h-4 animate-spin' />
							) : (
								<Trash2 className='w-4 h-4' />
							)}
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Xóa sản phẩm khỏi giỏ hàng</AlertDialogTitle>
							<AlertDialogDescription>
								Bạn có chắc chắn muốn xóa sản phẩm <strong>"{item.name}"</strong> khỏi giỏ hàng không?
								Hành động này không thể hoàn tác.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Hủy</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => removeItemMutation.mutate()}
								className='bg-red-600 hover:bg-red-700'
							>
								Xóa sản phẩm
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}

function CartSummary({ totalItems, totalAmount }: { totalItems: number; totalAmount: number }) {
	const queryClient = useQueryClient();
	const router = useRouter();

	const clearCartMutation = useMutation({
		mutationFn: cartService.clearCart,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['cart'] });
			toast.success('Đã xóa toàn bộ giỏ hàng!', {
				position: 'top-right',
				autoClose: 2000,
			});
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa giỏ hàng!', {
				position: 'top-right',
				autoClose: 3000,
			});
		},
	});

	const handleCheckout = () => {
		router.push('/checkout');
	};

	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
			<h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Tổng kết đơn hàng</h2>

			<div className='space-y-3 mb-6'>
				<div className='flex justify-between'>
					<span className='text-gray-600 dark:text-gray-400'>Số lượng sản phẩm:</span>
					<span className='font-medium'>{totalItems}</span>
				</div>
				<div className='flex justify-between'>
					<span className='text-gray-600 dark:text-gray-400'>Tổng tiền:</span>
					<span className='text-lg font-bold text-blue-600'>{formatCurrency(totalAmount)}</span>
				</div>
			</div>

			<div className='space-y-3'>
				<Button size='lg' className='w-full' onClick={handleCheckout} disabled={totalItems === 0}>
					<ShoppingCart className='w-5 h-5 mr-2' />
					Thanh toán
				</Button>

				{totalItems > 0 && (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								size='lg'
								variant='outline'
								className='w-full'
								disabled={clearCartMutation.isPending}
							>
								{clearCartMutation.isPending ? (
									<Loader2 className='w-5 h-5 mr-2 animate-spin' />
								) : (
									<Trash2 className='w-5 h-5 mr-2' />
								)}
								Xóa giỏ hàng
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Xóa toàn bộ giỏ hàng</AlertDialogTitle>
								<AlertDialogDescription>
									Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không? Tất cả sản phẩm trong giỏ hàng sẽ
									bị xóa và hành động này không thể hoàn tác.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Hủy</AlertDialogCancel>
								<AlertDialogAction
									onClick={() => clearCartMutation.mutate()}
									className='bg-red-600 hover:bg-red-700'
								>
									Xóa toàn bộ
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)}
			</div>
		</div>
	);
}

function EmptyCart() {
	return (
		<div className='text-center py-12'>
			<ShoppingCart className='w-16 h-16 text-gray-400 mx-auto mb-4' />
			<h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>Giỏ hàng trống</h2>
			<p className='text-gray-600 dark:text-gray-400 mb-6'>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
			<Link href='/'>
				<Button size='lg'>
					<Package className='w-5 h-5 mr-2' />
					Tiếp tục mua sắm
				</Button>
			</Link>
		</div>
	);
}

function LoadingState() {
	return (
		<div className='flex items-center justify-center py-12'>
			<Loader2 className='w-8 h-8 animate-spin text-blue-600' />
		</div>
	);
}

export default function CartPage() {
	const { user } = useAuth();

	const {
		data: cartData,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ['cart'],
		queryFn: cartService.getCart,
	});

	if (!user) {
		return (
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
				<div className='text-center'>
					<Package className='w-16 h-16 text-gray-400 mx-auto mb-4' />
					<h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>Vui lòng đăng nhập</h2>
					<p className='text-gray-600 dark:text-gray-400 mb-6'>Bạn cần đăng nhập để xem giỏ hàng</p>
					<Link href='/sign-in'>
						<Button size='lg'>Đăng nhập</Button>
					</Link>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
					<LoadingState />
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
				<div className='text-center'>
					<Package className='w-16 h-16 text-gray-400 mx-auto mb-4' />
					<h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>Lỗi tải giỏ hàng</h2>
					<p className='text-gray-600 dark:text-gray-400 mb-6'>
						{error?.message || 'Không thể tải giỏ hàng'}
					</p>
					<Button onClick={() => window.location.reload()}>Thử lại</Button>
				</div>
			</div>
		);
	}

	const items = cartData?.items || [];
	const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
	const totalAmount = cartData?.total || 0;

	console.log('Items:', items);
	console.log('Total items:', totalItems);
	console.log('Total amount:', totalAmount);

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
			<div className='w-full mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				{/* Header */}
				<div className='mb-6'>
					<Link
						href='/'
						className='inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4'
					>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Quay lại trang chủ
					</Link>
					<h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Giỏ hàng của bạn</h1>
				</div>

				{items.length === 0 ? (
					<EmptyCart />
				) : (
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
						{/* Cart Items */}
						<div className='lg:col-span-2 space-y-4'>
							{items.map((item) => (
								<CartItemCard key={item.id} item={item} />
							))}
						</div>

						{/* Cart Summary */}
						<div className='lg:col-span-1'>
							<CartSummary totalItems={totalItems} totalAmount={totalAmount} />
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
