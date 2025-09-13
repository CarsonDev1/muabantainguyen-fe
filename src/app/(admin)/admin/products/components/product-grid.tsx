'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/services/product-service';

interface ProductGridProps {
	products: Product[];
	hasActiveFilters: boolean;
	currentPage: number;
	setCurrentPage: (page: number) => void;
	pageSize: number;
	pagination: {
		total: number;
		totalPages: number;
		page: number;
	};
	onViewDetails: (product: Product) => void;
	onDelete: (product: Product) => void;
	formatPrice: (price: number) => string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
	products,
	hasActiveFilters,
	currentPage,
	setCurrentPage,
	pageSize,
	pagination,
	onViewDetails,
	onDelete,
	formatPrice,
}) => {
	// Stock status badge component
	const getStockBadge = (stock: number) => {
		if (stock === 0) {
			return <Badge className='bg-red-100 text-red-800 hover:bg-red-100'>Hết hàng</Badge>;
		} else if (stock < 10) {
			return <Badge className='bg-orange-100 text-orange-800 hover:bg-orange-100'>Sắp hết</Badge>;
		} else {
			return <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>Còn hàng</Badge>;
		}
	};

	// Empty state
	if (products.length === 0) {
		return (
			<Card>
				<CardContent className='p-12 text-center'>
					<Package className='h-16 w-16 mx-auto text-gray-300 mb-4' />
					<h3 className='text-xl font-semibold text-gray-900 mb-2'>
						{hasActiveFilters ? 'Không tìm thấy sản phẩm nào' : 'Chưa có sản phẩm nào'}
					</h3>
					<p className='text-gray-500 mb-6'>
						{hasActiveFilters
							? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
							: 'Bắt đầu bằng cách thêm sản phẩm đầu tiên'}
					</p>
					{!hasActiveFilters && (
						<Link href='/admin/products/create'>
							<Button>Thêm sản phẩm đầu tiên</Button>
						</Link>
					)}
				</CardContent>
			</Card>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Products Grid */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6'>
				{products.map((product) => (
					<Card key={product.id} className='group hover:shadow-lg transition-all duration-200'>
						<CardContent className='p-0'>
							{/* Product Image */}
							<div className='relative w-full h-48 bg-gray-100 rounded-t-lg overflow-hidden'>
								{product.image_url ? (
									<img
										src={product.image_url}
										alt={product.name}
										className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-200'
									/>
								) : (
									<div className='flex items-center justify-center h-full'>
										<Package className='h-12 w-12 text-gray-300' />
									</div>
								)}
								{/* Stock warning overlay */}
								{product.stock === 0 && (
									<div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
										<Badge className='bg-red-600 text-white'>
											<AlertTriangle className='h-3 w-3 mr-1' />
											Hết hàng
										</Badge>
									</div>
								)}
								{/* Quick actions overlay */}
								<div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
									<div className='flex gap-1'>
										<Button
											size='sm'
											variant='secondary'
											className='h-8 w-8 p-0 bg-white/90 hover:bg-white'
											onClick={() => onViewDetails(product)}
										>
											<Eye className='h-4 w-4' />
										</Button>
										<Link href={`/admin/products/${product.id}/edit`}>
											<Button
												size='sm'
												variant='secondary'
												className='h-8 w-8 p-0 bg-white/90 hover:bg-white'
											>
												<Edit className='h-4 w-4' />
											</Button>
										</Link>
										<Button
											size='sm'
											variant='destructive'
											className='h-8 w-8 p-0'
											onClick={() => onDelete(product)}
										>
											<Trash2 className='h-4 w-4' />
										</Button>
									</div>
								</div>
							</div>

							{/* Product Info */}
							<div className='p-4 space-y-3'>
								<h3 className='font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors'>
									{product.name}
								</h3>
								<p
									className='text-gray-600 text-sm mb-3 line-clamp-3 min-h-[3rem]'
									dangerouslySetInnerHTML={{ __html: product.description }}
								></p>

								<div className='flex items-center justify-between'>
									<div className='space-y-1'>
										<p className='text-lg font-bold text-blue-600'>{formatPrice(product.price)}</p>
										<p className='text-sm text-gray-500'>
											Kho: {product.stock.toLocaleString('vi-VN')}
										</p>
									</div>
									{getStockBadge(product.stock)}
								</div>

								{/* Action buttons */}
								<div className='flex gap-2 pt-2 border-t'>
									<Button
										size='sm'
										variant='outline'
										className='flex-1'
										onClick={() => onViewDetails(product)}
									>
										<Eye className='h-4 w-4 mr-1' />
										Xem
									</Button>
									<Link href={`/admin/products/${product.id}/edit`} className='flex-1'>
										<Button size='sm' variant='outline' className='w-full'>
											<Edit className='h-4 w-4 mr-1' />
											Sửa
										</Button>
									</Link>
									<Button
										size='sm'
										variant='destructive'
										className='px-3'
										onClick={() => onDelete(product)}
									>
										<Trash2 className='h-4 w-4' />
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Pagination */}
			{pagination.totalPages > 1 && (
				<div className='flex items-center justify-between border-t pt-6'>
					<div className='text-sm text-gray-700'>
						Hiển thị {(currentPage - 1) * pageSize + 1} đến{' '}
						{Math.min(currentPage * pageSize, pagination.total)} của {pagination.total} sản phẩm
					</div>

					<div className='flex items-center space-x-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={() => setCurrentPage(currentPage - 1)}
							disabled={currentPage === 1}
						>
							Trước
						</Button>

						<div className='flex items-center space-x-1'>
							{/* Show page numbers */}
							{Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
								let pageNumber;
								if (pagination.totalPages <= 5) {
									pageNumber = i + 1;
								} else if (currentPage <= 3) {
									pageNumber = i + 1;
								} else if (currentPage >= pagination.totalPages - 2) {
									pageNumber = pagination.totalPages - 4 + i;
								} else {
									pageNumber = currentPage - 2 + i;
								}

								return (
									<Button
										key={pageNumber}
										variant={currentPage === pageNumber ? 'default' : 'outline'}
										size='sm'
										onClick={() => setCurrentPage(pageNumber)}
									>
										{pageNumber}
									</Button>
								);
							})}
						</div>

						<Button
							variant='outline'
							size='sm'
							onClick={() => setCurrentPage(currentPage + 1)}
							disabled={currentPage === pagination.totalPages}
						>
							Tiếp
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProductGrid;
