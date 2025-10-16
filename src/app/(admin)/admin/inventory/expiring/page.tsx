'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, ArrowLeft, Calendar, Eye, Package, Loader2, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { inventoryService } from '@/services/inventory-service';
import { formatCurrency } from '@/utils/format-currency';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function InventoryExpiringPage() {
	const router = useRouter();
	const [days, setDays] = useState(7);
	const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
	const [copiedId, setCopiedId] = useState<string | null>(null);

	const { data, isLoading, refetch } = useQuery({
		queryKey: ['expiring-inventory', days],
		queryFn: () => inventoryService.getExpiringInventory(days),
		refetchInterval: 60000, // Refresh every minute
	});

	const toggleSecretVisibility = (itemId: string) => {
		setVisibleSecrets((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(itemId)) {
				newSet.delete(itemId);
			} else {
				newSet.add(itemId);
			}
			return newSet;
		});
	};

	const copySecret = async (secret: string, itemId: string) => {
		try {
			await navigator.clipboard.writeText(secret);
			setCopiedId(itemId);
			toast.success('Đã copy!');
			setTimeout(() => setCopiedId(null), 2000);
		} catch (err) {
			toast.error('Không thể copy');
		}
	};

	const getDaysUntilExpiry = (expiryDate: string) => {
		const now = new Date();
		const expiry = new Date(expiryDate);
		const diffTime = expiry.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	const getExpiryBadge = (expiryDate: string) => {
		const daysLeft = getDaysUntilExpiry(expiryDate);

		if (daysLeft < 0) {
			return <Badge className='bg-red-600 text-white'>Đã hết hạn</Badge>;
		} else if (daysLeft === 0) {
			return <Badge className='bg-red-500 text-white'>Hết hạn hôm nay</Badge>;
		} else if (daysLeft <= 3) {
			return <Badge className='bg-orange-500 text-white'>{daysLeft} ngày</Badge>;
		} else {
			return <Badge className='bg-yellow-500 text-white'>{daysLeft} ngày</Badge>;
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
						<h1 className='text-3xl font-bold'>Sản phẩm sắp hết hạn</h1>
					</div>
				</div>
				<div className='flex items-center justify-center p-8'>
					<Loader2 className='h-8 w-8 animate-spin' />
					<span className='ml-2'>Đang tải...</span>
				</div>
			</div>
		);
	}

	const items = data?.items || [];

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<Button variant='outline' size='sm' onClick={() => router.back()} className='h-9 w-9 p-0'>
						<ArrowLeft className='h-4 w-4' />
					</Button>
					<div>
						<h1 className='text-3xl font-bold'>Sản phẩm sắp hết hạn</h1>
						<p className='text-gray-600 mt-2'>Danh sách các sản phẩm inventory sắp hết hạn</p>
					</div>
				</div>

				<div className='flex items-center gap-2'>
					<span className='text-sm text-gray-600'>Hiển thị items trong vòng:</span>
					<Select value={days.toString()} onValueChange={(v) => setDays(Number(v))}>
						<SelectTrigger className='w-32'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='3'>3 ngày</SelectItem>
							<SelectItem value='7'>7 ngày</SelectItem>
							<SelectItem value='14'>14 ngày</SelectItem>
							<SelectItem value='30'>30 ngày</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Alert Card */}
			<Card className='border-orange-200 bg-orange-50'>
				<CardContent className='p-4'>
					<div className='flex items-center gap-3'>
						<AlertTriangle className='h-6 w-6 text-orange-600' />
						<div>
							<h3 className='font-semibold text-orange-900'>Cảnh báo</h3>
							<p className='text-sm text-orange-800'>
								Có <strong>{items.length}</strong> sản phẩm sắp hết hạn trong vòng {days} ngày tới. Vui
								lòng xem xét xử lý.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Stats */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium text-orange-600'>Hết hạn hôm nay</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-orange-600'>
							{items.filter((i) => getDaysUntilExpiry(i.account_expires_at!) === 0).length}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium text-red-600'>Trong 3 ngày</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-red-600'>
							{
								items.filter((i) => {
									const days = getDaysUntilExpiry(i.account_expires_at!);
									return days > 0 && days <= 3;
								}).length
							}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium text-yellow-600'>Trong 7 ngày</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-yellow-600'>
							{
								items.filter((i) => {
									const days = getDaysUntilExpiry(i.account_expires_at!);
									return days > 3 && days <= 7;
								}).length
							}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Items Table */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Package className='w-5 h-5' />
						Danh sách Items ({items.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{items.length === 0 ? (
						<div className='text-center py-8'>
							<CheckCircle className='h-12 w-12 mx-auto mb-4 text-green-500' />
							<p className='text-gray-600 text-lg font-medium'>Tuyệt vời!</p>
							<p className='text-gray-500'>Không có sản phẩm nào sắp hết hạn trong {days} ngày tới</p>
						</div>
					) : (
						<div className='rounded-md border'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Sản phẩm</TableHead>
										<TableHead>Dữ liệu</TableHead>
										<TableHead>Ngày hết hạn</TableHead>
										<TableHead>Còn lại</TableHead>
										<TableHead>Trạng thái</TableHead>
										<TableHead>Giá gốc</TableHead>
										<TableHead>Hành động</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{items.map((item) => {
										const isVisible = visibleSecrets.has(item.id);
										const isCopied = copiedId === item.id;

										return (
											<TableRow key={item.id}>
												<TableCell className='font-medium'>{item.product_name}</TableCell>
												<TableCell>
													<div className='flex items-center gap-2'>
														<code
															className='px-2 py-1 bg-gray-100 rounded text-sm'
															style={{
																maxWidth: '150px',
																overflow: 'hidden',
																textOverflow: 'ellipsis',
																whiteSpace: 'nowrap',
															}}
														>
															{isVisible ? item.secret_data : '••••••••••'}
														</code>
														<Button
															variant='ghost'
															size='sm'
															onClick={() => toggleSecretVisibility(item.id)}
														>
															<Eye className='h-4 w-4' />
														</Button>
														{isVisible && (
															<Button
																variant='ghost'
																size='sm'
																onClick={() => copySecret(item.secret_data, item.id)}
															>
																{isCopied ? (
																	<CheckCircle className='h-4 w-4 text-green-600' />
																) : (
																	<Copy className='h-4 w-4' />
																)}
															</Button>
														)}
													</div>
												</TableCell>
												<TableCell>
													<div className='flex items-center gap-1 text-sm'>
														<Calendar className='h-3 w-3' />
														{new Date(item.account_expires_at!).toLocaleDateString('vi-VN')}
													</div>
												</TableCell>
												<TableCell>{getExpiryBadge(item.account_expires_at!)}</TableCell>
												<TableCell>
													<Badge
														className={
															item.status === 'available'
																? 'bg-green-100 text-green-800'
																: 'bg-gray-100 text-gray-800'
														}
													>
														{item.status === 'available' ? 'Còn hàng' : item.status}
													</Badge>
												</TableCell>
												<TableCell>
													{item.cost_price ? formatCurrency(item.cost_price) : '-'}
												</TableCell>
												<TableCell>
													<Link href={`/admin/inventory/product/${item.product_id}`}>
														<Button variant='outline' size='sm'>
															<Package className='w-4 h-4 mr-1' />
															Xem
														</Button>
													</Link>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
