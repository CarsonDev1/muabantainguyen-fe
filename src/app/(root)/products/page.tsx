'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProducts, type Product } from '@/services/product-service';
import categoryService, { type Category } from '@/services/category-service';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Banknote, Eye, Loader2, Package, Search, ShoppingCart, Sparkles, Bell, X } from 'lucide-react';
import { formatCurrency } from '@/utils/format-currency';
import cartService from '@/services/cart-service';
import { toast } from 'react-toastify';
import { getPublicAnnouncements } from '@/services/announcement-service';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

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
	const [showAnnouncement, setShowAnnouncement] = useState(false);
	const [currentAnnouncement, setCurrentAnnouncement] = useState<any>(null);

	const debouncedSearch = useDebouncedValue(search);

	const { data: categoryTree, isLoading: isCategoriesLoading } = useQuery({
		queryKey: ['categories', 'tree'],
		queryFn: categoryService.getCategoryTree,
	});

	const { data: announcements = [] } = useQuery<any>({
		queryKey: ['announcements'],
		queryFn: getPublicAnnouncements,
	});

	const activeAnnouncement =
		announcements.announcements
			?.filter((a: any) => new Date(a.created_at) <= new Date())
			.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null;

	// Show announcement on page load
	useEffect(() => {
		if (activeAnnouncement) {
			const dismissedKey = `announcement_dismissed_${activeAnnouncement.id}`;
			const isDismissed = sessionStorage.getItem(dismissedKey);

			if (!isDismissed) {
				setCurrentAnnouncement(activeAnnouncement);
				setShowAnnouncement(true);
			}
		}
	}, [activeAnnouncement]);

	const handleDismissAnnouncement = (dontShowAgain: boolean) => {
		if (dontShowAgain && currentAnnouncement) {
			sessionStorage.setItem(`announcement_dismissed_${currentAnnouncement.id}`, 'true');
		}
		setShowAnnouncement(false);
	};

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
		<div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800'>
			{/* Announcement Dialog */}
			<Dialog open={showAnnouncement} onOpenChange={setShowAnnouncement}>
				<DialogContent className='sm:max-w-2xl border-2 border-blue-200 dark:border-blue-900'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-3 text-xl sm:text-2xl'>
							<div className='bg-blue-600 dark:bg-blue-500 p-2 rounded-xl shadow-lg'>
								<Bell className='w-6 h-6 text-white' />
							</div>
							<span>Thông báo</span>
						</DialogTitle>
					</DialogHeader>

					{currentAnnouncement && (
						<div className='py-4'>
							{/* Title */}
							<h3 className='text-lg font-bold text-gray-900 dark:text-white mb-4'>
								{currentAnnouncement.title}
							</h3>

							{/* Content */}
							<div
								className='prose prose-sm sm:prose max-w-none text-gray-700 dark:text-gray-300 mb-4'
								dangerouslySetInnerHTML={{ __html: currentAnnouncement.content }}
							/>

							{/* Links if any */}
							{currentAnnouncement.links && currentAnnouncement.links.length > 0 && (
								<div className='mt-4 space-y-2'>
									<p className='text-sm font-semibold text-gray-900 dark:text-white'>Liên kết:</p>
									<div className='flex flex-wrap gap-2'>
										{currentAnnouncement.links.map((link: any, idx: number) => (
											<a
												key={idx}
												href={link.url}
												target='_blank'
												rel='noopener noreferrer'
												className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all shadow-md'
											>
												{link.label}
											</a>
										))}
									</div>
								</div>
							)}
						</div>
					)}

					<DialogFooter className='flex-col sm:flex-row gap-2'>
						<Button
							variant='outline'
							onClick={() => handleDismissAnnouncement(true)}
							className='w-full sm:w-auto h-11 border-2 rounded-xl font-semibold'
						>
							Không hiển thị lại
						</Button>
						<Button
							onClick={() => handleDismissAnnouncement(false)}
							className='w-full sm:w-auto h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl font-semibold shadow-lg'
						>
							Đóng
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<div className='mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 w-full max-w-[1600px]'>
				{/* Header with gradient */}
				<div className='mb-6 sm:mb-8 lg:mb-10'>
					<div className='flex items-center gap-3 mb-6'>
						<div className='bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-xl shadow-lg'>
							<Sparkles className='w-6 h-6 text-white' />
						</div>
						<div>
							<h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent'>
								Khám phá sản phẩm
							</h1>
							<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
								Tìm kiếm và mua sắm ngay hôm nay
							</p>
						</div>
					</div>

					{/* Filters with glassmorphism */}
					<div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50'>
						<div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
							<div className='relative flex-1'>
								<Search className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none' />
								<Input
									placeholder='Tìm kiếm sản phẩm...'
									className='pl-11 h-12 bg-white dark:bg-gray-900/50 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all'
									value={search}
									onChange={(e) => {
										setSearch(e.target.value);
										setPage(1);
									}}
								/>
							</div>
							<Select value={categoryId ?? 'all'} onValueChange={handleCategoryChange}>
								<SelectTrigger className='w-full sm:w-[280px] h-12 bg-white dark:bg-gray-900/50 border-gray-300 dark:border-gray-600 rounded-xl'>
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
					<div className='flex items-center justify-center py-20 sm:py-32'>
						<div className='flex flex-col items-center gap-4'>
							<div className='relative'>
								<Loader2 className='w-12 h-12 animate-spin text-blue-500' />
								<div className='absolute inset-0 blur-xl bg-blue-500/20 animate-pulse'></div>
							</div>
							<span className='text-gray-600 dark:text-gray-400 font-medium'>Đang tải sản phẩm...</span>
						</div>
					</div>
				) : isError ? (
					<div className='text-center py-16 sm:py-24'>
						<div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-red-200 dark:border-red-900/50 p-8 sm:p-12 max-w-md mx-auto shadow-xl'>
							<div className='bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4'>
								<Package className='w-8 h-8 text-red-600 dark:text-red-400' />
							</div>
							<h3 className='text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2'>
								Không thể tải sản phẩm
							</h3>
							<p className='text-gray-600 dark:text-gray-400 text-sm'>
								{(error as any)?.message || 'Đã xảy ra lỗi'}
							</p>
						</div>
					</div>
				) : products.length === 0 ? (
					<div className='text-center py-16 sm:py-24'>
						<div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 max-w-md mx-auto shadow-xl'>
							<div className='bg-gray-100 dark:bg-gray-700/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4'>
								<Package className='w-8 h-8 text-gray-400' />
							</div>
							<h3 className='text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2'>
								Không có sản phẩm nào
							</h3>
							<p className='text-gray-600 dark:text-gray-400'>
								Thử thay đổi từ khóa tìm kiếm hoặc danh mục
							</p>
						</div>
					</div>
				) : (
					<>
						{/* Products Grid */}
						<div className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6'>
							{products.map((p) => {
								const priceNumber = typeof p.price === 'number' ? p.price : Number(p.price);
								const isAdding = addingId === p.id;
								return (
									<div
										key={p.id}
										className='group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden h-full flex flex-col hover:-translate-y-1'
									>
										{/* Image Container */}
										<Link href={`/products/${p.slug}`} className='block relative'>
											<div className='aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden'>
												{p.image_url ? (
													<Image
														src={p.image_url}
														alt={p.name}
														width={400}
														height={400}
														className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
													/>
												) : (
													<div className='w-full h-full flex items-center justify-center'>
														<Package className='w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600' />
													</div>
												)}

												{/* Overlay gradient */}
												<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

												{/* Stock badge */}
												<div className='absolute top-2 sm:top-3 right-2 sm:right-3 z-10'>
													<span
														className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold shadow-lg backdrop-blur-sm ${
															p.stock && p.stock > 0
																? 'bg-emerald-500/90 text-white'
																: 'bg-red-500/90 text-white'
														}`}
													>
														{p.stock && p.stock > 0 ? `Còn ${p.stock}` : 'Hết hàng'}
													</span>
												</div>

												{/* View details on hover */}
												<div className='absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3 sm:p-4'>
													<div className='bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium text-gray-900 dark:text-white'>
														<Eye className='w-4 h-4' />
														<span className='hidden sm:inline'>Xem chi tiết</span>
														<span className='sm:hidden'>Chi tiết</span>
													</div>
												</div>
											</div>
										</Link>

										{/* Content Container */}
										<div className='p-3 sm:p-4 flex-1 flex flex-col'>
											{/* Title */}
											<Link href={`/products/${p.slug}`} className='block mb-2'>
												<h3 className='font-semibold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight'>
													{p.name}
												</h3>
											</Link>

											{/* Description */}
											{p.description ? (
												<div
													className='text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 sm:mb-4 leading-relaxed'
													dangerouslySetInnerHTML={{ __html: p.description }}
												/>
											) : (
												<div className='mb-3 sm:mb-4'></div>
											)}

											{/* Price and Actions */}
											<div className='mt-auto space-y-2 sm:space-y-3'>
												{/* Price */}
												<div className='bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl px-3 py-2.5 sm:py-3 border border-emerald-200 dark:border-emerald-800'>
													<div className='flex items-center justify-center gap-1.5 sm:gap-2'>
														<Banknote className='w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400' />
														<span className='text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent'>
															{formatCurrency(priceNumber)}
														</span>
													</div>
												</div>

												{/* Action Buttons */}
												{p.stock && p.stock > 0 ? (
													<div className='flex gap-2'>
														<Button
															className='flex-1 h-9 sm:h-10 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm hover:shadow-md transition-all'
															onClick={() =>
																addToCartMutation.mutate({
																	productId: p.id,
																	quantity: 1,
																})
															}
															disabled={isAdding}
														>
															{isAdding ? (
																<Loader2 className='w-4 h-4 animate-spin' />
															) : (
																<ShoppingCart className='w-4 h-4' />
															)}
														</Button>
														<Link href={`/products/${p.slug}`} className='flex-1'>
															<Button className='w-full h-9 sm:h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-semibold text-xs sm:text-sm'>
																Mua ngay
															</Button>
														</Link>
													</div>
												) : (
													<Button
														disabled
														className='w-full h-9 sm:h-10 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed rounded-xl font-semibold text-xs sm:text-sm'
													>
														Hết hàng
													</Button>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className='mt-8 sm:mt-10 lg:mt-12'>
								<div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-4 sm:p-6'>
									<div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
										<Button
											variant='outline'
											disabled={page <= 1}
											onClick={() => setPage((p) => Math.max(1, p - 1))}
											className='w-full sm:w-auto h-11 rounded-xl border-2 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50'
										>
											← Trang trước
										</Button>

										<div className='flex items-center gap-2'>
											<span className='px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-sm sm:text-base shadow-lg'>
												{page}
											</span>
											<span className='text-gray-500 dark:text-gray-400 font-medium'>của</span>
											<span className='px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-bold text-sm sm:text-base'>
												{totalPages}
											</span>
										</div>

										<Button
											variant='outline'
											disabled={page >= totalPages}
											onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
											className='w-full sm:w-auto h-11 rounded-xl border-2 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50'
										>
											Trang sau →
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
