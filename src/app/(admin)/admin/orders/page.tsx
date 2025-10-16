'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Search, Filter, Loader2, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/format-currency';
import orderService from '@/services/order-service';
import { formatDate } from '@/utils/format-date';
import { toast } from 'sonner';
import Link from 'next/link';

// ========================================

export default function AdminOrdersPage() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const queryClient = useQueryClient();

	// Fetch orders
	const {
		data: ordersData,
		isLoading,
		isFetching,
	} = useQuery({
		queryKey: ['admin-orders', { page, pageSize, search, status: statusFilter }],
		queryFn: () =>
			orderService.getOrders({
				page,
				pageSize,
			}),
	});

	const orders = ordersData?.items || [];
	const total = ordersData?.total || 0;

	// Helpers
	const getStatusBadge = (status: string) => {
		const config: Record<string, any> = {
			pending: { label: 'Chờ thanh toán', variant: 'secondary' },
			paid: { label: 'Đã thanh toán', variant: 'default' },
			completed: { label: 'Hoàn thành', variant: 'default' },
			refunded: { label: 'Đã hoàn tiền', variant: 'outline' },
			cancelled: { label: 'Đã hủy', variant: 'destructive' },
		};
		const st = config[status] || { label: status, variant: 'secondary' };
		return <Badge variant={st.variant}>{st.label}</Badge>;
	};

	const getPaymentMethodBadge = (method: string) => {
		const config: Record<string, string> = {
			wallet: 'Ví',
			sepay: 'SePay',
			momo: 'MoMo',
		};
		return <Badge variant='outline'>{config[method] || method}</Badge>;
	};

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
						{/* Search */}
						<div>
							<label className='text-sm font-medium'>Tìm kiếm</label>
							<div className='relative'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
								<Input
									placeholder='Mã đơn, tên khách hàng...'
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className='pl-10'
								/>
							</div>
						</div>

						{/* Status */}
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
									<SelectItem value='refunded'>Đã hoàn tiền</SelectItem>
									<SelectItem value='cancelled'>Đã hủy</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Page size */}
						<div>
							<label className='text-sm font-medium'>Hiển thị</label>
							<Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='10'>10</SelectItem>
									<SelectItem value='20'>20</SelectItem>
									<SelectItem value='50'>50</SelectItem>
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
					{isLoading || isFetching ? (
						<div className='flex items-center justify-center h-64'>
							<Loader2 className='w-6 h-6 animate-spin text-gray-400' />
						</div>
					) : orders.length === 0 ? (
						<div className='text-center py-10 text-gray-500'>Không có đơn hàng nào</div>
					) : (
						<div className='rounded-md border overflow-x-auto'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Mã đơn</TableHead>
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
											<TableCell className='font-medium'>#{order.id.slice(0, 8)}</TableCell>
											<TableCell className='font-medium'>
												{formatCurrency(order.total_amount)}
											</TableCell>
											<TableCell>{getPaymentMethodBadge(order.payment_method)}</TableCell>
											<TableCell>{getStatusBadge(order.status)}</TableCell>
											<TableCell>{formatDate(order.created_at)}</TableCell>
											<TableCell>
												<div className='flex gap-2'>
													<Link href={`/admin/orders/${order.id}`}>
														<Button variant='outline' size='sm'>
															Xem
															<ArrowRight className='w-4 h-4 ml-1' />
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

			{/* Pagination */}
			{total > pageSize && (
				<div className='flex items-center justify-between'>
					<div className='text-sm text-gray-500'>
						Hiển thị {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} /{total}
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
