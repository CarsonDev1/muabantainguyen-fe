'use client';

import React from 'react';
import { Package, Archive, AlertTriangle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/services/product-service';

interface ProductStatsProps {
	products: Product[];
	totalProducts: number;
	formatPrice: (price: number) => string;
}

const ProductStats: React.FC<ProductStatsProps> = ({ products, totalProducts, formatPrice }) => {
	const inStockCount = products.filter((product) => product.stock > 0).length;
	const outOfStockCount = products.filter((product) => product.stock === 0).length;
	const totalValue = products.reduce((total, product) => total + product.price * product.stock, 0);

	return (
		<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
			<Card>
				<CardHeader className='pb-2'>
					<CardTitle className='text-sm font-medium flex items-center gap-2'>
						<Package className='h-4 w-4' />
						Tổng sản phẩm
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>{totalProducts}</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className='pb-2'>
					<CardTitle className='text-sm font-medium flex items-center gap-2'>
						<Archive className='h-4 w-4' />
						Còn hàng
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold text-green-600'>{inStockCount}</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className='pb-2'>
					<CardTitle className='text-sm font-medium flex items-center gap-2'>
						<AlertTriangle className='h-4 w-4' />
						Hết hàng
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold text-red-600'>{outOfStockCount}</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className='pb-2'>
					<CardTitle className='text-sm font-medium flex items-center gap-2'>
						<DollarSign className='h-4 w-4' />
						Giá trị kho
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold text-blue-600'>{formatPrice(totalValue)}</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default ProductStats;
