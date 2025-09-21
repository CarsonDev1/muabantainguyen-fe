import { notFound } from 'next/navigation';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Package, ShoppingCart, Star, Clock, Eye, Check, ChevronDown, ChevronRight } from 'lucide-react';
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
		<div className='bg-gray-800 border-b border-gray-700'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex flex-wrap gap-2 py-4'>
					{flatCategories.map((category) => (
						<Link
							key={category.id}
							href={`/${category.slug}`}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
								category.slug === currentSlug
									? 'bg-gray-600 text-white'
									: 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
							}`}
							style={{ marginLeft: `${category.level * 16}px` }}
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
		<div className='max-w-7xl mx-auto'>
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
				{/* Product Images */}
				<div className='space-y-4'>
					<div className='aspect-square rounded-lg overflow-hidden bg-white dark:bg-gray-800'>
						{product.image_url ? (
							<Image
								src={product.image_url}
								alt={product.name}
								width={600}
								height={600}
								className='w-full h-full object-cover'
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
					</div>

					<div className='space-y-2'>
						<div className='flex items-center space-x-2'>
							<span className='text-3xl font-bold text-blue-600'>{formatCurrency(product.price)}</span>
						</div>
						<p className='text-sm text-gray-600 dark:text-gray-400'>
							Thuộc danh mục: <span className='font-medium'>{productCategory?.name}</span>
						</p>
					</div>

					<div className='space-y-4'>
						<div
							className='text-gray-700 dark:text-gray-300 leading-relaxed'
							dangerouslySetInnerHTML={{ __html: product.description }}
						/>
					</div>

					<div className='flex flex-col sm:flex-row gap-4'>
						<Button size='lg' className='flex-1'>
							<ShoppingCart className='w-5 h-5 mr-2' />
							Thêm vào giỏ hàng
						</Button>
						<Button size='lg' variant='outline' className='flex-1'>
							Mua ngay
						</Button>
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
	// Add safety check for products
	const safeProducts = products || [];
	const safePagination = pagination || { pages: 0, page: 1 };

	return (
		<div className='w-full'>
			{/* Category Header */}
			<div className='mb-6'>
				<h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
					{currentCategory?.category?.name || 'Danh mục sản phẩm'}
				</h1>
			</div>

			{safeProducts.length === 0 ? (
				<div className='text-center py-12'>
					<Package className='w-16 h-16 text-gray-400 mx-auto mb-4' />
					<h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>Không có sản phẩm</h3>
					<p className='text-gray-600 dark:text-gray-400'>Danh mục này chưa có sản phẩm nào</p>
				</div>
			) : (
				<>
					{/* Products Table */}
					<div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
						{/* Category Header with Icon */}
						<div className='bg-blue-600 px-6 py-4 flex items-center gap-3'>
							{currentCategory?.image ? (
								<div className='w-6 h-6 rounded overflow-hidden'>
									<Image
										src={currentCategory.image}
										alt={currentCategory.name}
										width={24}
										height={24}
										className='w-full h-full object-cover'
									/>
								</div>
							) : (
								<Package className='w-6 h-6 text-white' />
							)}
							<h2 className='text-lg font-bold text-white uppercase'>
								{currentCategory?.name || 'DANH MỤC SẢN PHẨM'}
							</h2>
						</div>

						<div className='overflow-x-auto'>
							<table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
								<thead className='bg-gray-50 dark:bg-gray-700'>
									<tr>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
											{currentCategory?.category?.name || 'DANH MỤC SẢN PHẨM'}
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
											Hiện có
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
											Giá
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
											Thao tác
										</th>
									</tr>
								</thead>
								<tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
									{safeProducts.map((product) => (
										<tr key={product.id} className='hover:bg-gray-50 dark:hover:bg-gray-700'>
											<td className='px-6 py-4'>
												<div className='space-y-2'>
													<Link
														href={`/products/${product.slug}`}
														className='text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600'
													>
														{product.name}
													</Link>
													<div className='space-y-1'>
														<div className='flex items-center text-sm text-gray-600 dark:text-gray-400'>
															<Check className='w-4 h-4 text-green-500 mr-2' />
															<span>Đăng nhập bằng tài khoản</span>
														</div>
														<div className='flex items-center text-sm text-gray-600 dark:text-gray-400'>
															<Check className='w-4 h-4 text-green-500 mr-2' />
															<span>
																Format:
																user|pass|sdt|hotmail|pass|cookie.shopee.vn=SPC_F=
															</span>
														</div>
														<div className='flex items-center text-sm text-gray-600 dark:text-gray-400'>
															<Check className='w-4 h-4 text-green-500 mr-2' />
															<span>Không đổi pass bằng Email</span>
														</div>
													</div>
												</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='text-sm text-gray-900 dark:text-white'>
													<span className='text-red-500 font-medium'>
														Còn lại: {product.stock || 0}
													</span>
												</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='flex items-center space-x-2'>
													<span className='inline-flex items-center px-3 py-1 rounded-md text-lg font-bold text-white bg-red-500'>
														{formatCurrency(product.price)}
													</span>
													<Eye className='w-5 h-5 text-gray-400' />
												</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												{product.stock > 0 ? (
													<Button className='bg-blue-600 hover:bg-blue-700'>
														<ShoppingCart className='w-4 h-4 mr-2' />
														Mua ngay
													</Button>
												) : (
													<Button disabled className='bg-gray-400 cursor-not-allowed'>
														<ShoppingCart className='w-4 h-4 mr-2' />
														Hết hàng
													</Button>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Pagination */}
					{safePagination.pages > 1 && (
						<div className='flex justify-center items-center space-x-2 mt-8'>
							{safePagination.page > 1 && (
								<Link
									href={`/${categorySlugArray.join('/')}?page=${safePagination.page - 1}`}
									className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
								>
									Trước
								</Link>
							)}

							{Array.from({ length: Math.min(safePagination.pages, 5) }, (_, i) => {
								const page = i + 1;
								return (
									<Link
										key={page}
										href={`/${categorySlugArray.join('/')}?page=${page}`}
										className={`px-4 py-2 border rounded-lg ${
											page === safePagination.page
												? 'bg-blue-600 text-white border-blue-600'
												: 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
										}`}
									>
										{page}
									</Link>
								);
							})}

							{safePagination.page < safePagination.pages && (
								<Link
									href={`/${categorySlugArray.join('/')}?page=${safePagination.page + 1}`}
									className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
								>
									Tiếp
								</Link>
							)}
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

	// Get all categories for navigation
	const categories = await getAllCategories();

	// First try to get as product
	const product = await getProductBySlug(currentSlug);

	if (product && product.is_active) {
		// This is a product detail page
		const productCategory = product.category_id ? await getCategoryBySlug(product.category_id) : null;

		return (
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
				<CategoryNavigation categories={categories} currentSlug={currentSlug} />
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
					<ProductDetailContent product={product} productCategory={productCategory} />
				</div>
			</div>
		);
	}

	// Try to get as category
	const [currentCategory, productsData] = await Promise.all([
		getCategoryBySlug(currentSlug),
		getProductsByCategory(currentSlug, page, limit),
	]);

	if (!currentCategory) {
		notFound();
	}

	// This is a category page
	const categoryHierarchy = await getCategoryHierarchy(categorySlugArray);
	const { products, pagination } = productsData;

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
			<CategoryNavigation categories={categories} currentSlug={currentSlug} />
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
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
