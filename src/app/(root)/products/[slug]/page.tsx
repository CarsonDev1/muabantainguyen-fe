'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Package, ShoppingCart, Star, Clock, Eye, Check, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/utils/format-currency';
import { getProductBySlug } from '@/services/product-service';
import cartService from '@/services/cart-service';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

function ProductDetailContent({ product, productCategory }: { product: any; productCategory: any }) {
	const { user } = useAuth();
	const router = useRouter();
	const queryClient = useQueryClient();

	const addToCartMutation = useMutation({
		mutationFn: () =>
			cartService.addToCart({
				productId: product.id,
				quantity: 1,
			}),
		onSuccess: () => {
			// Invalidate cart query to update sidebar
			queryClient.invalidateQueries({ queryKey: ['cart'] });
			// Show success toast
			toast.success('Đã thêm sản phẩm vào giỏ hàng!', {
				position: 'top-right',
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			});
		},
		onError: (error: any) => {
			// Show error toast
			toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng!', {
				position: 'top-right',
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			});
		},
	});

	const handleAddToCart = () => {
		if (!user) {
			toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', {
				position: 'top-right',
				autoClose: 3000,
			});
			router.push('/sign-in');
			return;
		}
		addToCartMutation.mutate();
	};

	const handleBuyNow = () => {
		if (!user) {
			toast.info('Vui lòng đăng nhập để mua sản phẩm!', {
				position: 'top-right',
				autoClose: 3000,
			});
			router.push('/sign-in');
			return;
		}

		// Add to cart first, then redirect to checkout
		addToCartMutation.mutate(undefined, {
			onSuccess: () => {
				// Redirect to checkout page after successful add to cart
				router.push('/checkout');
			},
		});
	};

	return (
		<div className='w-full'>
			{/* Breadcrumb */}
			<div className='mb-6'>
				<Link
					href={`/${productCategory?.slug || 'products'}`}
					className='inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
				>
					<ArrowLeft className='w-4 h-4 mr-2' />
					Quay lại danh mục
				</Link>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
				{/* Product Images */}
				<div className='space-y-4'>
					<div className='flex justify-center items-center rounded-lg overflow-hidden'>
						{product.image_url ? (
							<Image
								src={product.image_url}
								alt={product.name}
								width={1200}
								height={1200}
								quality={100}
								className='w-80 object-cover'
							/>
						) : (
							<div className='w-full h-full flex items-center justify-center'>
								<Package className='w-24 h-24 text-gray-400' />
							</div>
						)}
					</div>
				</div>

				{/* Product Info */}
				<div className='space-y-6'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>{product.name}</h1>
						<p className='text-sm text-gray-600 dark:text-gray-400'>
							Thuộc danh mục: <span className='font-medium'>{productCategory?.name}</span>
						</p>
					</div>

					<div className='space-y-2'>
						<div className='flex items-center space-x-2'>
							<span className='text-3xl font-bold text-blue-600'>
								{formatCurrency(parseFloat(product.price))}
							</span>
							{product.original_price &&
								parseFloat(product.original_price) > parseFloat(product.price) && (
									<span className='text-lg text-gray-500 line-through'>
										{formatCurrency(parseFloat(product.original_price))}
									</span>
								)}
						</div>
						{product.stock > 0 ? (
							<p className='text-sm text-green-600 dark:text-green-400'>
								Còn lại: {product.stock} sản phẩm
							</p>
						) : (
							<p className='text-sm text-red-600 dark:text-red-400'>Hết hàng</p>
						)}
					</div>

					<div className='space-y-4'>
						<div
							className='text-gray-700 dark:text-gray-300 leading-relaxed'
							dangerouslySetInnerHTML={{ __html: product.description }}
						/>
					</div>

					<div className='flex flex-col sm:flex-row gap-4'>
						{product.stock > 0 ? (
							<>
								<Button
									size='lg'
									className='flex-1'
									onClick={handleAddToCart}
									disabled={addToCartMutation.isPending}
								>
									{addToCartMutation.isPending ? (
										<Loader2 className='w-5 h-5 mr-2 animate-spin' />
									) : (
										<ShoppingCart className='w-5 h-5 mr-2' />
									)}
									Thêm vào giỏ hàng
								</Button>
								<Button
									size='lg'
									variant='outline'
									className='flex-1'
									onClick={handleBuyNow}
									disabled={addToCartMutation.isPending}
								>
									Mua ngay
								</Button>
							</>
						) : (
							<Button disabled size='lg' className='flex-1 bg-gray-400 cursor-not-allowed'>
								<ShoppingCart className='w-5 h-5 mr-2' />
								Hết hàng
							</Button>
						)}
					</div>

					<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
						<div className='flex items-center space-x-2'>
							<Package className='w-5 h-5 text-blue-600' />
							<span className='text-sm'>Sản phẩm số</span>
						</div>
						<div className='flex items-center space-x-2'>
							<Clock className='w-5 h-5 text-green-600' />
							<span className='text-sm'>Tải ngay</span>
						</div>
						<div className='flex items-center space-x-2'>
							<Star className='w-5 h-5 text-purple-600' />
							<span className='text-sm'>Bảo hành trọn đời</span>
						</div>
					</div>

					{/* Product Details */}
					<div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
						<h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-3'>Thông tin sản phẩm</h3>
						<div className='space-y-2'>
							<div className='flex justify-between'>
								<span className='text-gray-600 dark:text-gray-400'>Mã sản phẩm:</span>
								<span className='font-medium'>{product.id}</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-600 dark:text-gray-400'>Danh mục:</span>
								<span className='font-medium'>{productCategory?.name}</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-600 dark:text-gray-400'>Số lượng còn lại:</span>
								<span className='font-medium'>{product.stock}</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-600 dark:text-gray-400'>Đã bán:</span>
								<span className='font-medium'>{product.sold_count || 0}</span>
							</div>
							{product.rating && (
								<div className='flex justify-between'>
									<span className='text-gray-600 dark:text-gray-400'>Đánh giá:</span>
									<div className='flex items-center space-x-1'>
										<Star className='w-4 h-4 text-yellow-500 fill-current' />
										<span className='font-medium'>{product.rating}</span>
										<span className='text-gray-500'>({product.review_count || 0})</span>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function LoadingState() {
	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
			<div className='text-center'>
				<Loader2 className='w-8 h-8 animate-spin mx-auto mb-4 text-blue-600' />
				<p className='text-gray-600 dark:text-gray-400'>Đang tải thông tin sản phẩm...</p>
			</div>
		</div>
	);
}

function ErrorState({ error }: { error: any }) {
	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
			<div className='text-center'>
				<Package className='w-16 h-16 text-gray-400 mx-auto mb-4' />
				<h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>Không tìm thấy sản phẩm</h2>
				<p className='text-gray-600 dark:text-gray-400 mb-4'>
					{error?.message || 'Sản phẩm không tồn tại hoặc đã bị xóa'}
				</p>
				<Link href='/'>
					<Button>Quay về trang chủ</Button>
				</Link>
			</div>
		</div>
	);
}

export default function ProductDetailPage() {
	const params = useParams();
	const slug = params.slug as string;

	// Fetch product data using React Query
	const {
		data: productData,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ['product', slug],
		queryFn: () => getProductBySlug(slug),
		enabled: !!slug,
		retry: 1,
	});

	// Show loading state
	if (isLoading) {
		return <LoadingState />;
	}

	// Show error state
	if (isError || !productData?.product) {
		return <ErrorState error={error} />;
	}

	const product = productData.product;

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
			<div className='w-full px-4 sm:px-6 lg:px-8 py-8'>
				<ProductDetailContent product={product} productCategory={null} />
			</div>
		</div>
	);
}
