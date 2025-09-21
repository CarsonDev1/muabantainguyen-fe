'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Search, Filter } from 'lucide-react';
import { formatCurrency } from '@/utils/format-currency';

export default function AdminOrdersPage() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');

	// Mock data - replace with actual API call
	const { data: ordersData, isLoading } = useQuery({
		queryKey: ['admin-orders', { page, pageSize, search, status: statusFilter === 'all' ? '' : statusFilter }],
		queryFn: async () => {
			// Mock data for now
			return {
				success: true,
				message: 'Orders retrieved successfully',
				orders: [
					{
						id: '1',
						orderNumber: 'ORD-001',
						user: { name: 'Nguyễn Văn A', email: 'user@example.com' },
						total: 250000,
						status: 'pending',
						paymentMethod: 'wallet',
						createdAt: new Date().toISOString(),
						items: [{ productName: 'Sản phẩm A', quantity: 2, price: 125000 }],
					},
					{
						id: '2',
						orderNumber: 'ORD-002',
						user: { name: 'Trần Thị B', email: 'user2@example.com' },
						total: 500000,
						status: 'paid',
						paymentMethod: 'sepay',
						createdAt: new Date().toISOString(),
						items: [{ productName: 'Sản phẩm B', quantity: 1, price: 500000 }],
					},
				],
				total: 2,
				page: 1,
				pageSize: 20,
			};
		},
	});

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'pending':
				return <Badge variant='secondary'>Chờ thanh toán</Badge>;
			case 'paid':
				return <Badge variant='default'>Đã thanh toán</Badge>;
			case 'completed':
				return <Badge variant='default'>Hoàn thành</Badge>;
			case 'cancelled':
				return <Badge variant='destructive'>Đã hủy</Badge>;
			case 'refunded':
				return <Badge variant='outline'>Đã hoàn tiền</Badge>;
			default:
				return <Badge variant='secondary'>{status}</Badge>;
		}
	};

	const getPaymentMethodBadge = (method: string) => {
		switch (method) {
			case 'wallet':
				return <Badge variant='outline'>Ví</Badge>;
			case 'sepay':
				return <Badge variant='outline'>SePay</Badge>;
			case 'momo':
				return <Badge variant='outline'>MoMo</Badge>;
			default:
				return <Badge variant='outline'>{method}</Badge>;
		}
	};

	if (isLoading) {
		return <div className='flex items-center justify-center h-64'>Đang tải...</div>;
	}

	const orders = ordersData?.orders || [];
	const total = ordersData?.total || 0;

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<h1 className='text-3xl font-bold'>Quản lý Đơn hàng</h1>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center'>
						<Filter className='w-5 h-5 mr-2' />
						Bộ lọc
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						<div>
							<label className='text-sm font-medium'>Tìm kiếm</label>
							<div className='relative'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
								<Input
									placeholder='Tìm theo mã đơn hàng, tên khách hàng...'
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className='pl-10'
								/>
							</div>
						</div>
						<div>
							<label className='text-sm font-medium'>Trạng thái</label>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger>
									<SelectValue placeholder='Tất cả trạng thái' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>Tất cả</SelectItem>
									<SelectItem value='pending'>Chờ thanh toán</SelectItem>
									<SelectItem value='paid'>Đã thanh toán</SelectItem>
									<SelectItem value='completed'>Hoàn thành</SelectItem>
									<SelectItem value='cancelled'>Đã hủy</SelectItem>
									<SelectItem value='refunded'>Đã hoàn tiền</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<label className='text-sm font-medium'>Số lượng hiển thị</label>
							<Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='10'>10</SelectItem>
									<SelectItem value='20'>20</SelectItem>
									<SelectItem value='50'>50</SelectItem>
									<SelectItem value='100'>100</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Orders Table */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center'>
						<Calendar className='w-5 h-5 mr-2' />
						Danh sách Đơn hàng ({total})
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='rounded-md border'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Mã đơn hàng</TableHead>
									<TableHead>Khách hàng</TableHead>
									<TableHead>Sản phẩm</TableHead>
									<TableHead>Tổng tiền</TableHead>
									<TableHead>Phương thức</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead>Ngày tạo</TableHead>
									<TableHead>Hành động</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{orders.map((order: any) => (
									<TableRow key={order.id}>
										<TableCell className='font-medium'>{order.orderNumber}</TableCell>
										<TableCell>
											<div>
												<div className='font-medium'>{order.user.name}</div>
												<div className='text-sm text-gray-500'>{order.user.email}</div>
											</div>
										</TableCell>
										<TableCell>
											<div className='space-y-1'>
												{order.items.map((item: any, index: number) => (
													<div key={index} className='text-sm'>
														{item.productName} x{item.quantity}
													</div>
												))}
											</div>
										</TableCell>
										<TableCell className='font-medium'>{formatCurrency(order.total)}</TableCell>
										<TableCell>{getPaymentMethodBadge(order.paymentMethod)}</TableCell>
										<TableCell>{getStatusBadge(order.status)}</TableCell>
										<TableCell>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</TableCell>
										<TableCell>
											<div className='flex space-x-2'>
												<Button variant='outline' size='sm'>
													Xem
												</Button>
												{order.status === 'paid' && (
													<Button variant='outline' size='sm'>
														Hoàn tiền
													</Button>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{orders.length === 0 && <div className='text-center py-8 text-gray-500'>Không có đơn hàng nào</div>}
				</CardContent>
			</Card>

			{/* Pagination */}
			{total > pageSize && (
				<div className='flex items-center justify-between'>
					<div className='text-sm text-gray-500'>
						Hiển thị {(page - 1) * pageSize + 1} đến {Math.min(page * pageSize, total)} của {total} đơn hàng
					</div>
					<div className='flex space-x-2'>
						<Button variant='outline' size='sm' disabled={page === 1} onClick={() => setPage(page - 1)}>
							Trước
						</Button>
						<Button
							variant='outline'
							size='sm'
							disabled={page * pageSize >= total}
							onClick={() => setPage(page + 1)}
						>
							Sau
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
