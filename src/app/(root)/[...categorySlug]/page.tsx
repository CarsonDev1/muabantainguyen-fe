import { notFound } from 'next/navigation';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
	Package,
	ShoppingCart,
	Star,
	Clock,
	Eye,
	Check,
	ChevronRight,
	Sparkles,
	ShieldCheck,
	Zap,
	Heart,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/utils/format-currency';

interface CategorySlugPageProps {
	params: {
		categorySlug: string[];
	};
	searchParams?: {
		page?: string;
		limit?: string;
	};
}

// Get category by slug
async function getCategoryBySlug(slug: string) {
	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/categories/slug/${slug}`, {
			next: { revalidate: 60 },
		});

		if (!res.ok) {
			return null;
		}

		return res.json();
	} catch (error) {
		console.error('Error fetching category:', error);
		return null;
	}
}

// Get product by slug
async function getProductBySlug(slug: string) {
	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${slug}`, {
			next: { revalidate: 60 },
		});

		if (!res.ok) {
			return null;
		}

		return res.json();
	} catch (error) {
		console.error('Error fetching product:', error);
		return null;
	}
}

// Get products by category
async function getProductsByCategory(categorySlug: string, page: number = 1, limit: number = 12) {
	try {
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/api/public/categories/slug/${categorySlug}/products?page=${page}&limit=${limit}`,
			{
				next: { revalidate: 30 },
			}
		);

		if (!res.ok) {
			return { products: [], pagination: { total: 0, pages: 0, page: 1, limit } };
		}

		return res.json();
	} catch (error) {
		console.error('Error fetching category products:', error);
		return { products: [], pagination: { total: 0, pages: 0, page: 1, limit } };
	}
}

// Get all categories for navigation
async function getAllCategories() {
	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/categories/tree`, {
			next: { revalidate: 60 },
		});

		if (!res.ok) {
			return [];
		}

		const data = await res.json();
		return data.tree || [];
	} catch (error) {
		console.error('Error fetching categories:', error);
		return [];
	}
}

// Get category hierarchy
async function getCategoryHierarchy(categorySlugArray: string[]) {
	const hierarchy = [];

	for (const slug of categorySlugArray) {
		const category = await getCategoryBySlug(slug);
		if (category) {
			hierarchy.push(category);
		}
	}

	return hierarchy;
}

function CategoryNavigation({ categories, currentSlug }: { categories: any[]; currentSlug: string }) {
	const flattenCategories = (cats: any[], level = 0): any[] => {
		let result: any[] = [];
		cats.forEach((cat) => {
			result.push({ ...cat, level });
			if (cat.children && cat.children.length > 0) {
				result = result.concat(flattenCategories(cat.children, level + 1));
			}
		});
		return result;
	};

	const flatCategories = flattenCategories(categories);

	return (
		<div className='bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 border-b border-gray-700/50 shadow-xl'>
			<div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex flex-wrap gap-2 sm:gap-3 py-4 sm:py-5'>
					{flatCategories.map((category) => (
						<Link
							key={category.id}
							href={`/${category.slug}`}
							className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
								category.slug === currentSlug
									? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105'
									: 'bg-white/10 backdrop-blur-sm text-gray-200 hover:bg-white/20 hover:text-white hover:shadow-lg'
							}`}
							style={{ marginLeft: category.level > 0 ? `${category.level * 12}px` : '0' }}
						>
							{category.name}
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}

function ProductDetailContent({ product, productCategory }: { product: any; productCategory: any }) {
	return (
		<div className='max-w-[1400px] mx-auto'>
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-12'>
				{/* Product Images */}
				<div className='space-y-4'>
					<div className='aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700'>
						{product.image_url ? (
							<Image
								src={product.image_url}
								alt={product.name}
								width={700}
								height={700}
								className='w-full h-full object-cover hover:scale-105 transition-transform duration-500'
							/>
						) : (
							<div className='w-full h-full flex items-center justify-center'>
								<Package className='w-24 h-24 text-gray-300 dark:text-gray-600' />
							</div>
						)}
					</div>
				</div>

				{/* Product Info */}
				<div className='space-y-6 sm:space-y-8'>
					{/* Title */}
					<div>
						<div className='inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 px-4 py-2 rounded-full mb-4'>
							<Sparkles className='w-4 h-4 text-blue-600 dark:text-blue-400' />
							<span className='text-sm font-semibold text-blue-700 dark:text-blue-300'>
								{productCategory?.name || 'Sản phẩm'}
							</span>
						</div>
						<h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight'>
							{product.name}
						</h1>
					</div>

					{/* Price */}
					<div className='bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/30 dark:via-green-900/30 dark:to-teal-900/30 rounded-2xl p-6 sm:p-8 border-2 border-emerald-200 dark:border-emerald-800 shadow-xl'>
						<div className='flex items-center justify-between mb-2'>
							<span className='text-sm text-gray-600 dark:text-gray-400 font-medium'>Giá bán</span>
							<div className='flex items-center gap-2'>
								<Zap className='w-5 h-5 text-yellow-500' />
								<span className='text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full'>
									Giá tốt
								</span>
							</div>
						</div>
						<div className='flex items-baseline gap-2'>
							<span className='text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-400 dark:via-green-400 dark:to-teal-400 bg-clip-text text-transparent'>
								{formatCurrency(product.price)}
							</span>
						</div>
					</div>

					{/* Description */}
					<div className='bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700'>
						<h3 className='text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
							<Package className='w-5 h-5 text-blue-500' />
							Mô tả sản phẩm
						</h3>
						<div
							className='text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm max-w-none'
							dangerouslySetInnerHTML={{ __html: product.description }}
						/>
					</div>

					{/* Action Buttons */}
					<div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
						<Button
							size='lg'
							className='flex-1 h-14 sm:h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all text-base sm:text-lg font-bold'
						>
							<ShoppingCart className='w-5 h-5 sm:w-6 sm:h-6 mr-2' />
							Thêm vào giỏ
						</Button>
						<Button
							size='lg'
							className='flex-1 h-14 sm:h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all text-base sm:text-lg font-bold'
						>
							<Zap className='w-5 h-5 sm:w-6 sm:h-6 mr-2' />
							Mua ngay
						</Button>
					</div>

					{/* Features */}
					<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
						<div className='bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800'>
							<Package className='w-6 h-6 text-blue-600 dark:text-blue-400 mb-2' />
							<span className='text-sm font-semibold text-gray-900 dark:text-white block'>
								Sản phẩm số
							</span>
							<span className='text-xs text-gray-600 dark:text-gray-400'>Giao hàng tức thì</span>
						</div>
						<div className='bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800'>
							<Clock className='w-6 h-6 text-green-600 dark:text-green-400 mb-2' />
							<span className='text-sm font-semibold text-gray-900 dark:text-white block'>Tải ngay</span>
							<span className='text-xs text-gray-600 dark:text-gray-400'>Sau khi thanh toán</span>
						</div>
						<div className='bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800'>
							<ShieldCheck className='w-6 h-6 text-purple-600 dark:text-purple-400 mb-2' />
							<span className='text-sm font-semibold text-gray-900 dark:text-white block'>Bảo hành</span>
							<span className='text-xs text-gray-600 dark:text-gray-400'>Hỗ trợ trọn đời</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function CategoryProductsContent({
	products,
	pagination,
	categorySlugArray,
	currentCategory,
}: {
	products: any[];
	pagination: any;
	categorySlugArray: string[];
	currentCategory: any;
}) {
	const safeProducts = products || [];
	const safePagination = pagination || { pages: 0, page: 1 };

	return (
		<div className='w-full'>
			{/* Category Header */}
			<div className='mb-6 sm:mb-8'>
				<div className='flex items-center gap-4 mb-4'>
					{currentCategory?.image ? (
						<div className='w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shadow-lg ring-2 ring-blue-500/20'>
							<Image
								src={currentCategory.image}
								alt={currentCategory.name}
								width={64}
								height={64}
								className='w-full h-full object-cover'
							/>
						</div>
					) : (
						<div className='w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg'>
							<Package className='w-6 h-6 sm:w-8 sm:h-8 text-white' />
						</div>
					)}
					<div>
						<h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent'>
							{currentCategory?.category?.name || currentCategory?.name || 'Danh mục sản phẩm'}
						</h1>
						<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
							{safeProducts.length} sản phẩm có sẵn
						</p>
					</div>
				</div>
			</div>

			{safeProducts.length === 0 ? (
				<div className='text-center py-16 sm:py-24'>
					<div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-12 max-w-md mx-auto shadow-xl'>
						<div className='bg-gray-100 dark:bg-gray-700/50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6'>
							<Package className='w-10 h-10 text-gray-400' />
						</div>
						<h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>Không có sản phẩm</h3>
						<p className='text-gray-600 dark:text-gray-400'>Danh mục này chưa có sản phẩm nào</p>
					</div>
				</div>
			) : (
				<>
					{/* Products - Responsive Design */}
					<div className='space-y-4'>
						{safeProducts.map((product, index) => (
							<div
								key={product.id}
								className='bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden group'
								style={{ animationDelay: `${index * 50}ms` }}
							>
								<div className='grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 p-4 sm:p-6'>
									{/* Product Info - Takes more space on desktop */}
									<div className='md:col-span-6 lg:col-span-7 space-y-3 sm:space-y-4'>
										<div>
											<Link href={`/products/${product.slug}`} className='block group/link'>
												<h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors mb-2 line-clamp-2'>
													{product.name}
												</h3>
											</Link>

											<div className='space-y-2'>
												<div className='flex items-start text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
													<Check className='w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0' />
													<span>Đăng nhập bằng tài khoản</span>
												</div>
												<div className='flex items-start text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
													<Check className='w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0' />
													<span className='break-all'>
														Format: user|pass|sdt|hotmail|pass|cookie.shopee.vn=SPC_F=
													</span>
												</div>
												<div className='flex items-start text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
													<Check className='w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0' />
													<span>Không đổi pass bằng Email</span>
												</div>
											</div>
										</div>
									</div>

									{/* Stock */}
									<div className='md:col-span-2 flex md:flex-col items-center md:justify-center gap-2'>
										<span className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 md:mb-2'>
											Còn lại
										</span>
										<div className='flex items-center gap-2'>
											<div
												className={`w-2 h-2 rounded-full ${
													product.stock > 10
														? 'bg-emerald-500'
														: product.stock > 0
														? 'bg-yellow-500'
														: 'bg-red-500'
												} animate-pulse`}
											></div>
											<span className='text-lg sm:text-xl font-bold text-red-600 dark:text-red-400'>
												{product.stock || 0}
											</span>
										</div>
									</div>

									{/* Price */}
									<div className='md:col-span-2 flex md:flex-col items-center md:justify-center gap-2'>
										<span className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 md:mb-2'>
											Giá bán
										</span>
										<div className='flex items-center gap-2'>
											<span className='px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-base sm:text-lg font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 shadow-lg'>
												{formatCurrency(product.price)}
											</span>
										</div>
									</div>

									{/* Action */}
									<div className='md:col-span-2 flex items-center justify-center'>
										{product.stock > 0 ? (
											<Link href={`/products/${product.slug}`} className='w-full'>
												<Button className='w-full h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-semibold text-sm sm:text-base'>
													<ShoppingCart className='w-4 h-4 mr-2' />
													Mua ngay
												</Button>
											</Link>
										) : (
											<Button
												disabled
												className='w-full h-11 sm:h-12 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed rounded-xl font-semibold text-sm sm:text-base'
											>
												<ShoppingCart className='w-4 h-4 mr-2' />
												Hết hàng
											</Button>
										)}
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Pagination */}
					{safePagination.pages > 1 && (
						<div className='mt-8 sm:mt-12'>
							<div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-4 sm:p-6'>
								<div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
									{safePagination.page > 1 ? (
										<Link
											href={`/${categorySlugArray.join('/')}?page=${safePagination.page - 1}`}
											className='w-full sm:w-auto'
										>
											<Button
												variant='outline'
												className='w-full sm:w-auto h-11 px-6 rounded-xl border-2 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all'
											>
												← Trang trước
											</Button>
										</Link>
									) : (
										<div className='w-full sm:w-auto'></div>
									)}

									<div className='flex items-center gap-2 flex-wrap justify-center'>
										{Array.from({ length: Math.min(safePagination.pages, 5) }, (_, i) => {
											const page = i + 1;
											return (
												<Link key={page} href={`/${categorySlugArray.join('/')}?page=${page}`}>
													<Button
														variant={page === safePagination.page ? 'default' : 'outline'}
														className={`h-11 w-11 rounded-xl font-bold transition-all ${
															page === safePagination.page
																? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
																: 'border-2 hover:bg-gray-50 dark:hover:bg-gray-700'
														}`}
													>
														{page}
													</Button>
												</Link>
											);
										})}
									</div>

									{safePagination.page < safePagination.pages ? (
										<Link
											href={`/${categorySlugArray.join('/')}?page=${safePagination.page + 1}`}
											className='w-full sm:w-auto'
										>
											<Button
												variant='outline'
												className='w-full sm:w-auto h-11 px-6 rounded-xl border-2 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all'
											>
												Trang sau →
											</Button>
										</Link>
									) : (
										<div className='w-full sm:w-auto'></div>
									)}
								</div>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}

export default async function CategorySlugPage({ params, searchParams }: CategorySlugPageProps) {
	const categorySlugArray = params.categorySlug || [];
	const currentSlug = categorySlugArray[categorySlugArray.length - 1];
	const page = parseInt(searchParams?.page || '1');
	const limit = parseInt(searchParams?.limit || '12');

	const categories = await getAllCategories();
	const product = await getProductBySlug(currentSlug);

	if (product && product.is_active) {
		const productCategory = product.category_id ? await getCategoryBySlug(product.category_id) : null;

		return (
			<div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800'>
				<CategoryNavigation categories={categories} currentSlug={currentSlug} />
				<div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12'>
					<ProductDetailContent product={product} productCategory={productCategory} />
				</div>
			</div>
		);
	}

	const [currentCategory, productsData] = await Promise.all([
		getCategoryBySlug(currentSlug),
		getProductsByCategory(currentSlug, page, limit),
	]);

	if (!currentCategory) {
		notFound();
	}

	const categoryHierarchy = await getCategoryHierarchy(categorySlugArray);
	const { products, pagination } = productsData;

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800'>
			<CategoryNavigation categories={categories} currentSlug={currentSlug} />
			<div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12'>
				<CategoryProductsContent
					products={products}
					pagination={pagination}
					categorySlugArray={categorySlugArray}
					currentCategory={currentCategory}
				/>
			</div>
		</div>
	);
}
