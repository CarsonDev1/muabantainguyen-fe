'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Package,
	ArrowLeft,
	Eye,
	EyeOff,
	Trash2,
	AlertTriangle,
	Calendar,
	DollarSign,
	Loader2,
	Copy,
	CheckCircle,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'react-toastify';
import { inventoryService, type InventoryItem } from '@/services/inventory-service';
import { formatCurrency } from '@/utils/format-currency';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function InventoryProductDetailPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const productId = params.id as string;

	const [showSold, setShowSold] = useState(false);
	const [showExpired, setShowExpired] = useState(false);
	const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
	const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
	const [copiedId, setCopiedId] = useState<string | null>(null);

	const { data, isLoading, refetch } = useQuery({
		queryKey: ['product-inventory', productId, showSold, showExpired],
		queryFn: () =>
			inventoryService.getProductInventory(productId, {
				showSold,
				showExpired,
			}),
	});

	const deleteItemMutation = useMutation({
		mutationFn: inventoryService.deleteInventoryItem,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['product-inventory'] });
			queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
			toast.success('Xóa inventory item thành công!');
			setItemToDelete(null);
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
		},
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

	const handleDeleteItem = (item: InventoryItem) => {
		setItemToDelete(item);
	};

	const confirmDelete = () => {
		if (itemToDelete) {
			deleteItemMutation.mutate(itemToDelete.id);
		}
	};

	const getStatusBadge = (status: string) => {
		const statusConfig: Record<string, { label: string; className: string }> = {
			available: { label: 'Còn hàng', className: 'bg-green-100 text-green-800' },
			sold: { label: 'Đã bán', className: 'bg-blue-100 text-blue-800' },
			expired: { label: 'Hết hạn', className: 'bg-red-100 text-red-800' },
		};

		const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
		return <Badge className={config.className}>{config.label}</Badge>;
	};

	if (isLoading) {
		return (
			<div className='space-y-6'>
				<div className='flex items-center gap-4'>
					<Button variant='outline' size='sm' onClick={() => router.back()} className='h-9 w-9 p-0'>
						<ArrowLeft className='h-4 w-4' />
					</Button>
					<div>
						<h1 className='text-3xl font-bold'>Chi tiết Inventory</h1>
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
	const productName = items[0]?.product_name || 'Sản phẩm';

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center gap-4'>
				<Button variant='outline' size='sm' onClick={() => router.back()} className='h-9 w-9 p-0'>
					<ArrowLeft className='h-4 w-4' />
				</Button>
				<div>
					<h1 className='text-3xl font-bold'>Inventory - {productName}</h1>
					<p className='text-gray-600 mt-2'>Quản lý inventory cho sản phẩm này</p>
				</div>
			</div>

			{/* Stats */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium flex items-center gap-2'>
							<Package className='h-4 w-4' />
							Tổng số
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{items.length}</div>
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
							{items.filter((i) => i.status === 'available').length}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium flex items-center gap-2'>
							<Package className='h-4 w-4 text-blue-600' />
							Đã bán
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-blue-600'>
							{items.filter((i) => i.status === 'sold').length}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium flex items-center gap-2'>
							<AlertTriangle className='h-4 w-4 text-red-600' />
							Hết hạn
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-red-600'>
							{items.filter((i) => i.status === 'expired').length}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className='p-4'>
					<div className='flex items-center gap-6'>
						<div className='flex items-center gap-2'>
							<Checkbox
								id='showSold'
								checked={showSold}
								onCheckedChange={(checked) => setShowSold(!!checked)}
							/>
							<Label htmlFor='showSold' className='cursor-pointer'>
								Hiện đã bán
							</Label>
						</div>
						<div className='flex items-center gap-2'>
							<Checkbox
								id='showExpired'
								checked={showExpired}
								onCheckedChange={(checked) => setShowExpired(!!checked)}
							/>
							<Label htmlFor='showExpired' className='cursor-pointer'>
								Hiện hết hạn
							</Label>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Items Table */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Package className='w-5 h-5' />
						Danh sách Inventory ({items.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{items.length === 0 ? (
						<div className='text-center py-8 text-gray-500'>Không có inventory item nào</div>
					) : (
						<div className='rounded-md border'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Dữ liệu</TableHead>
										<TableHead>Giá gốc</TableHead>
										<TableHead>Nguồn</TableHead>
										<TableHead>Hết hạn</TableHead>
										<TableHead>Ghi chú</TableHead>
										<TableHead>Ngày tạo</TableHead>
										<TableHead>Hành động</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{items.map((item) => {
										const isVisible = visibleSecrets.has(item.id);
										const isCopied = copiedId === item.id;

										return (
											<TableRow key={item.id}>
												<TableCell>
													<div className='flex items-center gap-2'>
														<code
															className='px-2 py-1 bg-gray-100 rounded text-sm'
															style={{
																maxWidth: '200px',
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
															{isVisible ? (
																<EyeOff className='h-4 w-4' />
															) : (
																<Eye className='h-4 w-4' />
															)}
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
													{item.cost_price ? formatCurrency(item.cost_price) : '-'}
												</TableCell>
												<TableCell>{item.source || '-'}</TableCell>
												<TableCell>
													{item.account_expires_at ? (
														<div className='flex items-center gap-1 text-sm'>
															<Calendar className='h-3 w-3' />
															{new Date(item.account_expires_at).toLocaleDateString(
																'vi-VN'
															)}
														</div>
													) : (
														'-'
													)}
												</TableCell>
												<TableCell>
													<div className='max-w-[150px] truncate text-sm' title={item.notes}>
														{item.notes || '-'}
													</div>
												</TableCell>
												<TableCell>
													{new Date(item.created_at).toLocaleDateString('vi-VN')}
												</TableCell>
												<TableCell>
													<Button
														variant='ghost'
														size='sm'
														onClick={() => handleDeleteItem(item)}
														className='text-red-600'
													>
														<Trash2 className='h-4 w-4' />
													</Button>
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

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className='flex items-center gap-3'>
							<div className='w-12 h-12 rounded-full bg-red-100 flex items-center justify-center'>
								<Trash2 className='w-6 h-6 text-red-600' />
							</div>
							Xóa Inventory Item
						</AlertDialogTitle>
						<AlertDialogDescription className='space-y-3 pt-4'>
							<p className='text-base'>Bạn có chắc chắn muốn xóa item này?</p>
							<div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
								<div className='flex items-start gap-3'>
									<AlertTriangle className='w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0' />
									<div className='space-y-2'>
										<p className='font-medium text-amber-800'>Lưu ý:</p>
										<ul className='text-sm text-amber-700 space-y-1'>
											<li>• Hành động này không thể hoàn tác</li>
											<li>• Dữ liệu sẽ bị xóa vĩnh viễn</li>
										</ul>
									</div>
								</div>
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className='gap-3'>
						<AlertDialogCancel asChild>
							<Button variant='outline' size='lg'>
								Hủy bỏ
							</Button>
						</AlertDialogCancel>
						<AlertDialogAction asChild>
							<Button
								onClick={confirmDelete}
								disabled={deleteItemMutation.isPending}
								size='lg'
								className='bg-red-600 hover:bg-red-700'
							>
								{deleteItemMutation.isPending ? (
									<>
										<Loader2 className='w-5 h-5 mr-2 animate-spin' />
										Đang xóa...
									</>
								) : (
									<>
										<Trash2 className='w-5 h-5 mr-2' />
										Xóa Item
									</>
								)}
							</Button>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
