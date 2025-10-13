'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Package,
	Plus,
	TrendingUp,
	AlertTriangle,
	Clock,
	DollarSign,
	RefreshCw,
	Eye,
	Edit,
	Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { inventoryService, InventoryStats } from '@/services/inventory-service';
import { toast } from 'react-toastify';

export default function AdminInventoryPage() {
	const {
		data: statsData,
		isLoading: statsLoading,
		refetch: refetchStats,
	} = useQuery({
		queryKey: ['inventory-stats'],
		queryFn: () => inventoryService.getInventoryStats(),
	});

	const { data: expiringData, isLoading: expiringLoading } = useQuery({
		queryKey: ['expiring-inventory'],
		queryFn: () => inventoryService.getExpiringInventory(7),
	});

	const handleSyncStocks = async () => {
		try {
			await inventoryService.syncAllStocks();
			toast.success('Đã đồng bộ tồn kho thành công');
			refetchStats();
		} catch (error: any) {
			toast.error('Lỗi khi đồng bộ tồn kho: ' + error.message);
		}
	};

	const stats = statsData?.stats;
	const expiringItems = expiringData?.items || [];

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold'>Quản lý Kho</h1>
					<p className='text-muted-foreground'>Quản lý tồn kho và sản phẩm</p>
				</div>
				<div className='flex gap-2'>
					<Button onClick={handleSyncStocks} variant='outline'>
						<RefreshCw className='w-4 h-4 mr-2' />
						Đồng bộ tồn kho
					</Button>
					<Link href='/admin/inventory/add'>
						<Button>
							<Plus className='w-4 h-4 mr-2' />
							Thêm sản phẩm
						</Button>
					</Link>
				</div>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Tổng sản phẩm</CardTitle>
						<Package className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stats?.total_items || 0}</div>
						<p className='text-xs text-muted-foreground'>{stats?.available_items || 0} còn hàng</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Sắp hết hạn</CardTitle>
						<AlertTriangle className='h-4 w-4 text-orange-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-orange-600'>{stats?.expiring_soon || 0}</div>
						<p className='text-xs text-muted-foreground'>7 ngày tới</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Đã bán</CardTitle>
						<TrendingUp className='h-4 w-4 text-green-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-green-600'>{stats?.sold_items || 0}</div>
						<p className='text-xs text-muted-foreground'>Tổng đã bán</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Giá trị tồn kho</CardTitle>
						<DollarSign className='h-4 w-4 text-blue-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-blue-600'>
							{new Intl.NumberFormat('vi-VN', {
								style: 'currency',
								currency: 'VND',
							}).format(stats?.total_value || 0)}
						</div>
						<p className='text-xs text-muted-foreground'>Tổng giá trị</p>
					</CardContent>
				</Card>
			</div>

			{/* Expiring Items */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Clock className='w-5 h-5' />
						Sản phẩm sắp hết hạn (7 ngày tới)
					</CardTitle>
				</CardHeader>
				<CardContent>
					{expiringLoading ? (
						<div className='text-center py-4'>Đang tải...</div>
					) : expiringItems.length === 0 ? (
						<div className='text-center py-4 text-muted-foreground'>Không có sản phẩm nào sắp hết hạn</div>
					) : (
						<div className='space-y-4'>
							{expiringItems.slice(0, 5).map((item) => (
								<div key={item.id} className='flex items-center justify-between p-4 border rounded-lg'>
									<div className='flex-1'>
										<div className='font-medium'>{item.product_name}</div>
										<div className='text-sm text-muted-foreground'>
											Hết hạn: {new Date(item.account_expires_at!).toLocaleDateString('vi-VN')}
										</div>
									</div>
									<div className='flex items-center gap-2'>
										<Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
											{item.status === 'available' ? 'Còn hàng' : item.status}
										</Badge>
										<Link href={`/admin/inventory/product/${item.product_id}`}>
											<Button variant='outline' size='sm'>
												<Eye className='w-4 h-4 mr-1' />
												Xem
											</Button>
										</Link>
									</div>
								</div>
							))}
							{expiringItems.length > 5 && (
								<div className='text-center pt-4'>
									<Link href='/admin/inventory/expiring'>
										<Button variant='outline'>Xem tất cả ({expiringItems.length})</Button>
									</Link>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Thao tác nhanh</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						<Link href='/admin/inventory/add'>
							<Button className='w-full' variant='outline'>
								<Plus className='w-4 h-4 mr-2' />
								Thêm sản phẩm mới
							</Button>
						</Link>
						<Link href='/admin/inventory/bulk'>
							<Button className='w-full' variant='outline'>
								<Package className='w-4 h-4 mr-2' />
								Thêm hàng loạt
							</Button>
						</Link>
						<Link href='/admin/inventory/products'>
							<Button className='w-full' variant='outline'>
								<Eye className='w-4 h-4 mr-2' />
								Quản lý sản phẩm
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
