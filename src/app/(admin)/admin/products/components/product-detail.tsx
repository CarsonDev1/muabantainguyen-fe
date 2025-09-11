'use client';

import React from 'react';
import { ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/services/product-service';

interface ProductDetailsDialogProps {
	product: Product | null;
	isOpen: boolean;
	onClose: () => void;
	formatPrice: (price: number) => string;
}

const ProductDetailsDialog: React.FC<ProductDetailsDialogProps> = ({ product, isOpen, onClose, formatPrice }) => {
	const getStockBadge = (stock: number) => {
		if (stock === 0) {
			return <Badge className='bg-red-100 text-red-800'>Hết hàng</Badge>;
		} else if (stock < 10) {
			return <Badge className='bg-orange-100 text-orange-800'>Sắp hết</Badge>;
		} else {
			return <Badge className='bg-green-100 text-green-800'>Còn hàng</Badge>;
		}
	};

	if (!product) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[700px]'>
				<DialogHeader>
					<DialogTitle>Chi tiết sản phẩm</DialogTitle>
					<DialogDescription>Thông tin chi tiết của {product.name}</DialogDescription>
				</DialogHeader>

				<div className='space-y-6'>
					<div className='flex gap-6'>
						<div className='w-48 h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0'>
							{product.image_url ? (
								<img
									src={product.image_url}
									alt={product.name}
									className='w-full h-full object-cover'
								/>
							) : (
								<div className='w-full h-full flex items-center justify-center'>
									<ImageIcon className='h-16 w-16 text-gray-400' />
								</div>
							)}
						</div>
						<div className='flex-1 space-y-4'>
							<div>
								<h3 className='text-2xl font-bold'>{product.name}</h3>
								<p className='text-gray-600 mt-1'>{product.description}</p>
							</div>
							<div className='flex items-center gap-4'>
								<div className='text-3xl font-bold text-blue-600'>{formatPrice(product.price)}</div>
								{getStockBadge(product.stock)}
							</div>
						</div>
					</div>

					<Separator />

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='text-sm font-medium text-gray-600'>Slug</label>
							<p className='mt-1'>{product.slug}</p>
						</div>
						<div>
							<label className='text-sm font-medium text-gray-600'>Số lượng kho</label>
							<p className='mt-1'>{product.stock} sản phẩm</p>
						</div>
						<div>
							<label className='text-sm font-medium text-gray-600'>Danh mục ID</label>
							<p className='mt-1'>{product.categoryId || product.categoryId}</p>
						</div>
						{product.created_at && (
							<div>
								<label className='text-sm font-medium text-gray-600'>Ngày tạo</label>
								<p className='mt-1'>{new Date(product.created_at).toLocaleString('vi-VN')}</p>
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ProductDetailsDialog;
