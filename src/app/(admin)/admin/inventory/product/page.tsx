'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
	Package,
	ArrowLeft,
	Search,
	Eye,
	AlertTriangle,
	CheckCircle,
	XCircle,
	Loader2,
	Plus,
	Upload,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import productService from '@/services/product-service';
import { formatCurrency } from '@/utils/format-currency';

export default function InventoryProductsPage() {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState('');

	const { data: productsData, isLoading } = useQuery({
		queryKey: ['admin-products'],
		queryFn: () => productService.getAllProducts({ limit: 100 }),
	});

	const products = productsData?.items || [];

	// Filter products based on search
	const filteredProducts = products.filter((product) =>
		product.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const getStockBadge = (stock: number) => {
		if (stock === 0) {
			return (
				<Badge className='bg-red-100 text-red-800'>
					<XCircle className='h-3 w-3 mr-1' />
					Hết hàng
				</Badge>
			);
		} else if (stock < 10) {
			return (
				<Badge className='bg-yellow-100 text-yellow-800'>
					<AlertTriangle className='h-3 w-3 mr-1' />
					Sắp hết ({stock})
				</Badge>
			);
		} else {
			return (
				<Badge className='bg-green-100 text-green-800'>
					<CheckCircle className='h-3 w-3 mr-1' />
					Còn hàng ({stock})
				</Badge>
			);
		}
	};

	if (isLoading) {
		return (
			<div className='space-y-6'>
				<div className='flex items-center gap-4'>
					<Button variant='outline' size='sm' onClick={() => router.back()} className='h-9 w-9 p-0'>
						<ArrowLeft className='h-4 w-4' />
					</Button>
					<div>
						<h1 className='text-3xl font-bold'>Quản lý Inventory theo Sản phẩm</h1>
					</div>
				</div>
				<div className='flex items-center justify-center p-8'>
					<Loader2 className='h-8 w-8 animate-spin' />
					<span className='ml-2'>Đang tải...</span>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<Button variant='outline' size='sm' onClick={() => router.back()} className='h-9 w-9 p-0'>
						<ArrowLeft className='h-4 w-4' />
					</Button>
					<div>
						<h1 className='text-3xl font-bold'>Quản lý Inventory theo Sản phẩm</h1>
						<p className='text-gray-600 mt-2'>Xem và quản lý inventory cho từng sản phẩm</p>
					</div>
				</div>

				<div className='flex gap-2'>
					<Link href='/admin/inventory/add'>
						<Button>
							<Plus className='w-4 h-4 mr-2' />
							Thêm đơn lẻ
						</Button>
					</Link>
					<Link href='/admin/inventory/bulk'>
						<Button variant='outline'>
							<Upload className='w-4 h-4 mr-2' />
							Thêm hàng loạt
						</Button>
					</Link>
				</div>
			</div>

			{/* Stats */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium flex items-center gap-2'>
							<Package className='h-4 w-4' />
							Tổng sản phẩm
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{products.length}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium flex items-center gap-2'>
							<CheckCircle className='h-4 w-4 text-green-600' />
							Còn hàng
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-green-600'>
							{products.filter((p) => p.stock > 0).length}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium flex items-center gap-2'>
							<AlertTriangle className='h-4 w-4 text-yellow-600' />
							Sắp hết
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-yellow-600'>
							{products.filter((p) => p.stock > 0 && p.stock < 10).length}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium flex items-center gap-2'>
							<XCircle className='h-4 w-4 text-red-600' />
							Hết hàng
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-red-600'>
							{products.filter((p) => p.stock === 0).length}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Search */}
			<Card>
				<CardContent className='p-4'>
					<div className='relative'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
						<Input
							placeholder='Tìm kiếm sản phẩm...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='pl-10'
						/>
					</div>
				</CardContent>
			</Card>

			{/* Products Table */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Package className='w-5 h-5' />
						Danh sách Sản phẩm ({filteredProducts.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{filteredProducts.length === 0 ? (
						<div className='text-center py-8 text-gray-500'>
							{searchTerm ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào'}
						</div>
					) : (
						<div className='rounded-md border'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Sản phẩm</TableHead>
										<TableHead>Giá bán</TableHead>
										<TableHead>Tồn kho</TableHead>
										<TableHead>Trạng thái</TableHead>
										<TableHead>Đã bán</TableHead>
										<TableHead>Hành động</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredProducts.map((product) => (
										<TableRow key={product.id}>
											<TableCell>
												<div className='flex items-center gap-3'>
													<div className='w-12 h-12 rounded-lg overflow-hidden bg-gray-100'>
														{product.image_url ? (
															<img
																src={product.image_url}
																alt={product.name}
																className='w-full h-full object-cover'
															/>
														) : (
															<div className='w-full h-full flex items-center justify-center'>
																<Package className='h-6 w-6 text-gray-400' />
															</div>
														)}
													</div>
													<div>
														<div className='font-medium'>{product.name}</div>
														<div className='text-sm text-gray-500'>
															{product.category_name}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell className='font-medium'>
												{formatCurrency(product.price)}
											</TableCell>
											<TableCell>
												<span className='font-mono text-sm'>{product.stock}</span>
											</TableCell>
											<TableCell>{getStockBadge(product.stock)}</TableCell>
											<TableCell>
												<span className='text-sm text-gray-600'>{product.sold_count || 0}</span>
											</TableCell>
											<TableCell>
												<div className='flex gap-2'>
													<Link href={`/admin/inventory/product/${product.id}`}>
														<Button variant='outline' size='sm'>
															<Eye className='w-4 h-4 mr-1' />
															Chi tiết
														</Button>
													</Link>
													<Link href={`/admin/inventory/add?productId=${product.id}`}>
														<Button size='sm'>
															<Plus className='w-4 h-4 mr-1' />
															Thêm
														</Button>
													</Link>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
