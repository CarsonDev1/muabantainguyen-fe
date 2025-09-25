'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProducts, type Product } from '@/services/product-service';
import categoryService, { type Category } from '@/services/category-service';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Banknote, Eye, Loader2, Package, Search, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/utils/format-currency';
import cartService from '@/services/cart-service';
import { toast } from 'react-toastify';

function useDebouncedValue<T>(value: T, delay = 400): T {
	const [debounced, setDebounced] = React.useState(value);
	React.useEffect(() => {
		const id = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(id);
	}, [value, delay]);
	return debounced;
}

export default function ProductsPage() {
	const queryClient = useQueryClient();
	const [search, setSearch] = useState('');
	const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
	const [page, setPage] = useState(1);
	const pageSize = 12;
	const [addingId, setAddingId] = useState<string | null>(null);

	const debouncedSearch = useDebouncedValue(search);

	const { data: categoryTree, isLoading: isCategoriesLoading } = useQuery({
		queryKey: ['categories', 'tree'],
		queryFn: categoryService.getCategoryTree,
	});

	const flatCategories: { id: string; slug: string; name: string }[] = useMemo(() => {
		const out: { id: string; slug: string; name: string }[] = [];
		const tree = categoryTree?.tree || [];
		const walk = (nodes: Category[], prefix = '') => {
			nodes.forEach((node) => {
				out.push({ id: node.id, slug: node.slug, name: prefix ? `${prefix} / ${node.name}` : node.name });
				if (node.children && node.children.length)
					walk(node.children, prefix ? `${prefix} / ${node.name}` : node.name);
			});
		};
		walk(tree);
		return out;
	}, [categoryTree]);

	const {
		data: productsResp,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ['products', { search: debouncedSearch, category: categoryId, page, pageSize }],
		queryFn: () =>
			getProducts({
				search: debouncedSearch || undefined,
				category: categoryId || undefined,
				page,
				pageSize,
			}),
	});

	const products: Product[] = productsResp?.products || [];
	const totalPages = productsResp?.totalPages || 1;

	const addToCartMutation = useMutation({
		mutationFn: (vars: { productId: string; quantity: number }) =>
			cartService.addToCart({ productId: vars.productId, quantity: vars.quantity }),
		onMutate: (vars) => {
			setAddingId(vars.productId);
		},
		onSuccess: () => {
			toast.success('Đã thêm vào giỏ hàng');
			queryClient.invalidateQueries({ queryKey: ['cart'] });
			setTimeout(() => setAddingId(null), 600);
		},
		onError: (err: any) => {
			toast.error(err?.message || 'Thêm vào giỏ hàng thất bại');
			setTimeout(() => setAddingId(null), 600);
		},
	});

	const handleCategoryChange = (value: string) => {
		setCategoryId(value === 'all' ? undefined : value);
		setPage(1);
	};

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
			<div className='mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full'>
				{/* Header */}
				<div className='mb-8'>
					<h1 className='text-2xl font-semibold text-gray-900 dark:text-white mb-6'>Tất cả sản phẩm</h1>

					{/* Filters */}
					<div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm'>
						<div className='flex flex-col sm:flex-row gap-4'>
							<div className='relative flex-1'>
								<Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
								<Input
									placeholder='Tìm kiếm sản phẩm...'
									className='pl-10 h-11'
									value={search}
									onChange={(e) => {
										setSearch(e.target.value);
										setPage(1);
									}}
								/>
							</div>
							<Select value={categoryId ?? 'all'} onValueChange={handleCategoryChange}>
								<SelectTrigger className='w-full sm:w-[250px] h-11'>
									<SelectValue placeholder='Chọn danh mục' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>Tất cả danh mục</SelectItem>
									{isCategoriesLoading ? (
										<SelectItem value='loading' disabled>
											Đang tải danh mục...
										</SelectItem>
									) : (
										flatCategories.map((c) => (
											<SelectItem key={c.id} value={c.id}>
												{c.name}
											</SelectItem>
										))
									)}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				{/* Content */}
				{isLoading ? (
					<div className='flex items-center justify-center py-16'>
						<div className='flex items-center gap-3'>
							<Loader2 className='w-6 h-6 animate-spin text-gray-500' />
							<span className='text-gray-600 dark:text-gray-400'>Đang tải sản phẩm...</span>
						</div>
					</div>
				) : isError ? (
					<div className='text-center py-16'>
						<div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 max-w-md mx-auto'>
							<Package className='w-12 h-12 text-red-400 mx-auto mb-4' />
							<h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
								Không thể tải sản phẩm
							</h3>
							<p className='text-gray-500 text-sm'>{(error as any)?.message || 'Đã xảy ra lỗi'}</p>
						</div>
					</div>
				) : products.length === 0 ? (
					<div className='text-center py-16'>
						<div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 max-w-md mx-auto'>
							<Package className='w-12 h-12 text-gray-400 mx-auto mb-4' />
							<h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
								Không có sản phẩm nào
							</h3>
							<p className='text-gray-500'>Thử thay đổi từ khóa tìm kiếm</p>
						</div>
					</div>
				) : (
					<>
						{/* Products Grid */}
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6'>
							{products.map((p) => {
								const priceNumber = typeof p.price === 'number' ? p.price : Number(p.price);
								return (
									<div
										key={p.id}
										className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden h-full flex flex-col'
									>
										{/* Image Container - Fixed height */}
										<Link href={`/products/${p.slug}`} className='block'>
											<div className='aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden'>
												{p.image_url ? (
													<Image
														src={p.image_url}
														alt={p.name}
														width={300}
														height={300}
														className='w-full h-full object-cover'
													/>
												) : (
													<div className='w-full h-full flex items-center justify-center'>
														<Package className='w-12 h-12 text-gray-400' />
													</div>
												)}
												{/* Stock badge */}
												<div className='absolute top-3 right-3'>
													<span
														className={`px-2 py-1 rounded text-xs font-medium ${
															p.stock && p.stock > 0
																? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
																: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
														}`}
													>
														{p.stock && p.stock > 0 ? `Còn ${p.stock}` : 'Hết hàng'}
													</span>
												</div>
											</div>
										</Link>

										{/* Content Container - Flex grow */}
										<div className='p-4 flex-1 flex flex-col'>
											{/* Title - Fixed height với line-clamp */}
											<Link href={`/products/${p.slug}`} className='block mb-2'>
												<h3 className='font-medium text-gray-900 dark:text-white hover:text-blue-600 transition-colors line-clamp-3 flex items-center'>
													{p.name}
												</h3>
											</Link>

											{/* Description - Fixed height */}
											{p.description ? (
												<div
													className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2 h-10 mb-4'
													dangerouslySetInnerHTML={{ __html: p.description }}
												/>
											) : (
												<div className='h-10 mb-4'></div>
											)}

											{/* Price and Actions - Pushed to bottom */}
											<div className='mt-auto'>
												<div className='mb-3 flex items-center justify-center gap-2 border border-primary-500 rounded-md w-full px-2 py-1 border-green-300'>
													<Banknote className='text-green-500' />
													<span className='text-xl font-semibold text-primary-500'>
														{formatCurrency(priceNumber)}
													</span>
												</div>

												{p.stock && p.stock > 0 ? (
													<>
														<div className='flex gap-2'>
															<Button
																className='w-1/2'
																variant='outline'
																onClick={() =>
																	addToCartMutation.mutate({
																		productId: p.id,
																		quantity: 1,
																	})
																}
																disabled={addingId === p.id}
															>
																{addingId === p.id ? (
																	<Loader2 className='w-4 h-4 animate-spin' />
																) : (
																	<ShoppingCart className='w-4 h-4' />
																)}
															</Button>
															<Link href={`/products/${p.slug}`} className='w-1/2'>
																<Button className='w-full bg-blue-600 hover:bg-blue-700 text-white'>
																	Mua ngay
																</Button>
															</Link>
														</div>
													</>
												) : (
													<>
														<Button
															disabled
															className='w-full bg-gray-400 cursor-not-allowed'
														>
															Hết hàng
														</Button>
													</>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className='mt-8'>
								<div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6'>
									<div className='flex items-center justify-between'>
										<Button
											variant='outline'
											disabled={page <= 1}
											onClick={() => setPage((p) => Math.max(1, p - 1))}
										>
											Trang trước
										</Button>

										<span className='text-gray-600 dark:text-gray-400'>
											Trang {page} / {totalPages}
										</span>

										<Button
											variant='outline'
											disabled={page >= totalPages}
											onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
										>
											Trang sau
										</Button>
									</div>
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
