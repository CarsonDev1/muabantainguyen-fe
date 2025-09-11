'use client';

import React from 'react';
import { MoreVertical, Edit, Trash2, Eye, ImageIcon, Tag, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Product } from '@/services/product-service';

interface ProductCardProps {
	product: Product;
	onViewDetails: (product: Product) => void;
	onEdit?: (product: Product) => void;
	onDelete: (product: Product) => void;
	formatPrice: (price: number) => string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails, onEdit, onDelete, formatPrice }) => {
	const getStockBadge = (stock: number) => {
		if (stock === 0) {
			return <Badge className='bg-red-100 text-red-800'>Hết hàng</Badge>;
		} else if (stock < 10) {
			return <Badge className='bg-orange-100 text-orange-800'>Sắp hết</Badge>;
		} else {
			return <Badge className='bg-green-100 text-green-800'>Còn hàng</Badge>;
		}
	};

	return (
		<Card className='group hover:shadow-lg transition-shadow duration-200'>
			<CardContent className='p-0'>
				{/* Product Image */}
				<div className='relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden'>
					{product.image_url ? (
						<img
							src={product.image_url}
							alt={product.name}
							className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-200'
						/>
					) : (
						<div className='w-full h-full flex items-center justify-center'>
							<ImageIcon className='h-12 w-12 text-gray-400' />
						</div>
					)}

					{/* Stock Badge */}
					<div className='absolute top-2 left-2'>{getStockBadge(product.stock)}</div>

					{/* Actions Menu */}
					<div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant='secondary' size='sm' className='h-8 w-8 p-0'>
									<MoreVertical className='h-4 w-4' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuItem onClick={() => onViewDetails(product)}>
									<Eye className='h-4 w-4 mr-2' />
									Xem chi tiết
								</DropdownMenuItem>
								{onEdit && (
									<DropdownMenuItem onClick={() => onEdit(product)}>
										<Edit className='h-4 w-4 mr-2' />
										Chỉnh sửa
									</DropdownMenuItem>
								)}
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={() => onDelete(product)} className='text-red-600'>
									<Trash2 className='h-4 w-4 mr-2' />
									Xóa sản phẩm
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* Product Info */}
				<div className='p-4'>
					<h3 className='font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]'>{product.name}</h3>
					<p className='text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]'>{product.description}</p>
					<div className='space-y-2'>
						<div className='flex items-center justify-between'>
							<span className='text-2xl font-bold text-blue-600'>{formatPrice(product.price)}</span>
							<Badge variant='outline' className='text-xs'>
								<Tag className='h-3 w-3 mr-1' />
								{product.slug}
							</Badge>
						</div>
						<div className='flex items-center justify-between text-sm text-gray-500'>
							<span>Kho: {product.stock} sản phẩm</span>
							{product.created_at && (
								<div className='flex items-center gap-1'>
									<Calendar className='h-3 w-3' />
									{new Date(product.created_at).toLocaleDateString('vi-VN')}
								</div>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default ProductCard;
