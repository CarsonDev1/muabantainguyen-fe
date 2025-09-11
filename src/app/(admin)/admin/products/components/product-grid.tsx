'use client';

import React from 'react';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/services/product-service';
import ProductCard from './product-card';

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
	onEdit?: (product: Product) => void;
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
	onEdit,
	onDelete,
	formatPrice,
}) => {
	if (products.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Danh sách sản phẩm</CardTitle>
				</CardHeader>
				<CardContent className='p-6'>
					<div className='text-center py-12'>
						<Package className='h-16 w-16 mx-auto mb-4 text-gray-300' />
						<p className='text-gray-500 text-lg'>
							{hasActiveFilters ? 'Không tìm thấy sản phẩm phù hợp với bộ lọc' : 'Chưa có sản phẩm nào'}
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Danh sách sản phẩm</CardTitle>
			</CardHeader>
			<CardContent className='p-6'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
					{products.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							onViewDetails={onViewDetails}
							onEdit={onEdit}
							onDelete={onDelete}
							formatPrice={formatPrice}
						/>
					))}
				</div>

				{/* Pagination */}
				{pagination.totalPages > 1 && (
					<div className='flex items-center justify-between mt-8 pt-6 border-t'>
						<div className='text-sm text-gray-500'>
							Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
							{Math.min(currentPage * pageSize, pagination.total)}
							trong tổng số {pagination.total} sản phẩm
						</div>
						<div className='flex items-center gap-2'>
							<Button
								variant='outline'
								size='sm'
								onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
								disabled={currentPage === 1}
							>
								<ChevronLeft className='h-4 w-4' />
								Trước
							</Button>
							<span className='text-sm'>
								Trang {currentPage} / {pagination.totalPages}
							</span>
							<Button
								variant='outline'
								size='sm'
								onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
								disabled={currentPage === pagination.totalPages}
							>
								Sau
								<ChevronRight className='h-4 w-4' />
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default ProductGrid;
