'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getAdminPromotions,
	createPromotion,
	updatePromotion,
	deletePromotion,
	type Promotion,
	type CreatePromotionData,
	type UpdatePromotionData,
} from '@/services/promotion-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'react-toastify';
import { Plus, Percent, Edit, Trash2, Calendar } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function AdminPromotionsPage() {
	const queryClient = useQueryClient();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

	// Form states
	const [createForm, setCreateForm] = useState({
		name: '',
		description: '',
		type: 'percentage' as 'percentage' | 'fixed',
		value: 0,
		minOrderAmount: 0,
		maxDiscountAmount: 0,
		startDate: '',
		endDate: '',
		isActive: true,
		usageLimit: 0,
	});

	const [editForm, setEditForm] = useState({
		name: '',
		description: '',
		type: 'percentage' as 'percentage' | 'fixed',
		value: 0,
		minOrderAmount: 0,
		maxDiscountAmount: 0,
		startDate: '',
		endDate: '',
		isActive: true,
		usageLimit: 0,
	});

	const { data: promotionsData, isLoading } = useQuery({
		queryKey: ['admin-promotions'],
		queryFn: getAdminPromotions,
	});

	const createPromotionMutation = useMutation({
		mutationFn: createPromotion,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
			setIsCreateDialogOpen(false);
			setCreateForm({
				name: '',
				description: '',
				type: 'percentage',
				value: 0,
				minOrderAmount: 0,
				maxDiscountAmount: 0,
				startDate: '',
				endDate: '',
				isActive: true,
				usageLimit: 0,
			});
			toast.success('Tạo khuyến mãi thành công!');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
		},
	});

	const updatePromotionMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdatePromotionData }) => updatePromotion(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
			setIsEditDialogOpen(false);
			setSelectedPromotion(null);
			toast.success('Cập nhật khuyến mãi thành công!');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
		},
	});

	const deletePromotionMutation = useMutation({
		mutationFn: deletePromotion,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
			toast.success('Xóa khuyến mãi thành công!');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
		},
	});

	const handleCreatePromotion = (e: React.FormEvent) => {
		e.preventDefault();
		if (!createForm.name || !createForm.startDate || !createForm.endDate) {
			toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
			return;
		}
		createPromotionMutation.mutate(createForm);
	};

	const handleUpdatePromotion = (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedPromotion) return;
		updatePromotionMutation.mutate({ id: selectedPromotion.id, data: editForm });
	};

	const openEditDialog = (promotion: Promotion) => {
		setSelectedPromotion(promotion);
		setEditForm({
			name: promotion.name,
			description: promotion.description,
			type: promotion.type,
			value: promotion.value,
			minOrderAmount: promotion.minOrderAmount || 0,
			maxDiscountAmount: promotion.maxDiscountAmount || 0,
			startDate: promotion.startDate,
			endDate: promotion.endDate,
			isActive: promotion.isActive,
			usageLimit: promotion.usageLimit || 0,
		});
		setIsEditDialogOpen(true);
	};

	const handleDeletePromotion = (id: string) => {
		deletePromotionMutation.mutate(id);
	};

	const getTypeBadge = (type: string) => {
		switch (type) {
			case 'percentage':
				return <Badge variant='outline'>Phần trăm</Badge>;
			case 'fixed':
				return <Badge variant='outline'>Số tiền cố định</Badge>;
			default:
				return <Badge variant='outline'>{type}</Badge>;
		}
	};

	if (isLoading) {
		return <div className='flex items-center justify-center h-64'>Đang tải...</div>;
	}

	const promotions = promotionsData?.promotions || [];

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<h1 className='text-3xl font-bold'>Quản lý Khuyến mãi</h1>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className='w-4 h-4 mr-2' />
							Tạo Khuyến mãi
						</Button>
					</DialogTrigger>
					<DialogContent className='sm:max-w-[600px]'>
						<DialogHeader>
							<DialogTitle>Tạo khuyến mãi mới</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleCreatePromotion} className='space-y-4'>
							<div>
								<Label htmlFor='name'>Tên khuyến mãi *</Label>
								<Input
									id='name'
									required
									value={createForm.name}
									onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
									placeholder='Nhập tên khuyến mãi...'
								/>
							</div>
							<div>
								<Label htmlFor='description'>Mô tả</Label>
								<Textarea
									id='description'
									rows={3}
									value={createForm.description}
									onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
									placeholder='Nhập mô tả khuyến mãi...'
								/>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Label htmlFor='type'>Loại khuyến mãi</Label>
									<select
										id='type'
										className='w-full p-2 border rounded-md'
										value={createForm.type}
										onChange={(e) =>
											setCreateForm({
												...createForm,
												type: e.target.value as 'percentage' | 'fixed',
											})
										}
									>
										<option value='percentage'>Phần trăm</option>
										<option value='fixed'>Số tiền cố định</option>
									</select>
								</div>
								<div>
									<Label htmlFor='value'>Giá trị *</Label>
									<Input
										id='value'
										type='number'
										required
										value={createForm.value}
										onChange={(e) =>
											setCreateForm({ ...createForm, value: Number(e.target.value) })
										}
										placeholder={createForm.type === 'percentage' ? '20' : '50000'}
									/>
								</div>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Label htmlFor='minOrderAmount'>Đơn hàng tối thiểu (VND)</Label>
									<Input
										id='minOrderAmount'
										type='number'
										value={createForm.minOrderAmount}
										onChange={(e) =>
											setCreateForm({ ...createForm, minOrderAmount: Number(e.target.value) })
										}
										placeholder='0'
									/>
								</div>
								<div>
									<Label htmlFor='maxDiscountAmount'>Giảm tối đa (VND)</Label>
									<Input
										id='maxDiscountAmount'
										type='number'
										value={createForm.maxDiscountAmount}
										onChange={(e) =>
											setCreateForm({ ...createForm, maxDiscountAmount: Number(e.target.value) })
										}
										placeholder='0'
									/>
								</div>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Label htmlFor='startDate'>Ngày bắt đầu *</Label>
									<Input
										id='startDate'
										type='date'
										required
										value={createForm.startDate}
										onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
									/>
								</div>
								<div>
									<Label htmlFor='endDate'>Ngày kết thúc *</Label>
									<Input
										id='endDate'
										type='date'
										required
										value={createForm.endDate}
										onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
									/>
								</div>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Label htmlFor='usageLimit'>Giới hạn sử dụng</Label>
									<Input
										id='usageLimit'
										type='number'
										value={createForm.usageLimit}
										onChange={(e) =>
											setCreateForm({ ...createForm, usageLimit: Number(e.target.value) })
										}
										placeholder='0 = không giới hạn'
									/>
								</div>
								<div className='flex items-center space-x-2 pt-6'>
									<Checkbox
										id='isActive'
										checked={createForm.isActive}
										onCheckedChange={(checked) =>
											setCreateForm({ ...createForm, isActive: !!checked })
										}
									/>
									<Label htmlFor='isActive'>Kích hoạt</Label>
								</div>
							</div>
							<div className='flex justify-end space-x-2'>
								<Button type='button' variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
									Hủy
								</Button>
								<Button type='submit' disabled={createPromotionMutation.isPending}>
									{createPromotionMutation.isPending ? 'Đang tạo...' : 'Tạo Khuyến mãi'}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className='flex items-center'>
						<Percent className='w-5 h-5 mr-2' />
						Danh sách Khuyến mãi ({promotions.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='rounded-md border'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Tên khuyến mãi</TableHead>
									<TableHead>Loại</TableHead>
									<TableHead>Giá trị</TableHead>
									<TableHead>Thời gian</TableHead>
									<TableHead>Sử dụng</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead>Hành động</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{promotions.map((promotion) => (
									<TableRow key={promotion.id}>
										<TableCell>
											<div>
												<div className='font-medium'>{promotion.name}</div>
												<div className='text-sm text-gray-500'>{promotion.description}</div>
											</div>
										</TableCell>
										<TableCell>{getTypeBadge(promotion.type)}</TableCell>
										<TableCell>
											{promotion.type === 'percentage'
												? `${promotion.value}%`
												: `${promotion.value.toLocaleString()} VND`}
										</TableCell>
										<TableCell>
											<div className='text-sm'>
												<div>{new Date(promotion.startDate).toLocaleDateString('vi-VN')}</div>
												<div>đến {new Date(promotion.endDate).toLocaleDateString('vi-VN')}</div>
											</div>
										</TableCell>
										<TableCell>
											<div className='text-sm'>
												<div>
													{promotion.usageCount}/{promotion.usageLimit || '∞'}
												</div>
												<div className='text-gray-500'>
													{promotion.minOrderAmount > 0 &&
														`Đơn tối thiểu: ${promotion.minOrderAmount.toLocaleString()} VND`}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant={promotion.isActive ? 'default' : 'secondary'}>
												{promotion.isActive ? 'Hoạt động' : 'Tạm dừng'}
											</Badge>
										</TableCell>
										<TableCell>
											<div className='flex items-center space-x-2'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => openEditDialog(promotion)}
												>
													<Edit className='w-4 h-4' />
												</Button>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button variant='outline' size='sm'>
															<Trash2 className='w-4 h-4' />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>Xác nhận xóa Khuyến mãi</AlertDialogTitle>
															<AlertDialogDescription>
																Bạn có chắc chắn muốn xóa khuyến mãi này? Hành động này
																không thể hoàn tác.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Hủy</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleDeletePromotion(promotion.id)}
																disabled={deletePromotionMutation.isPending}
															>
																{deletePromotionMutation.isPending
																	? 'Đang xóa...'
																	: 'Xóa'}
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{/* Edit Promotion Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className='sm:max-w-[600px]'>
					<DialogHeader>
						<DialogTitle>Chỉnh sửa Khuyến mãi</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleUpdatePromotion} className='space-y-4'>
						<div>
							<Label htmlFor='edit-name'>Tên khuyến mãi *</Label>
							<Input
								id='edit-name'
								required
								value={editForm.name}
								onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
								placeholder='Nhập tên khuyến mãi...'
							/>
						</div>
						<div>
							<Label htmlFor='edit-description'>Mô tả</Label>
							<Textarea
								id='edit-description'
								rows={3}
								value={editForm.description}
								onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
								placeholder='Nhập mô tả khuyến mãi...'
							/>
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<Label htmlFor='edit-type'>Loại khuyến mãi</Label>
								<select
									id='edit-type'
									className='w-full p-2 border rounded-md'
									value={editForm.type}
									onChange={(e) =>
										setEditForm({ ...editForm, type: e.target.value as 'percentage' | 'fixed' })
									}
								>
									<option value='percentage'>Phần trăm</option>
									<option value='fixed'>Số tiền cố định</option>
								</select>
							</div>
							<div>
								<Label htmlFor='edit-value'>Giá trị *</Label>
								<Input
									id='edit-value'
									type='number'
									required
									value={editForm.value}
									onChange={(e) => setEditForm({ ...editForm, value: Number(e.target.value) })}
									placeholder={editForm.type === 'percentage' ? '20' : '50000'}
								/>
							</div>
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<Label htmlFor='edit-minOrderAmount'>Đơn hàng tối thiểu (VND)</Label>
								<Input
									id='edit-minOrderAmount'
									type='number'
									value={editForm.minOrderAmount}
									onChange={(e) =>
										setEditForm({ ...editForm, minOrderAmount: Number(e.target.value) })
									}
									placeholder='0'
								/>
							</div>
							<div>
								<Label htmlFor='edit-maxDiscountAmount'>Giảm tối đa (VND)</Label>
								<Input
									id='edit-maxDiscountAmount'
									type='number'
									value={editForm.maxDiscountAmount}
									onChange={(e) =>
										setEditForm({ ...editForm, maxDiscountAmount: Number(e.target.value) })
									}
									placeholder='0'
								/>
							</div>
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<Label htmlFor='edit-startDate'>Ngày bắt đầu *</Label>
								<Input
									id='edit-startDate'
									type='date'
									required
									value={editForm.startDate}
									onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
								/>
							</div>
							<div>
								<Label htmlFor='edit-endDate'>Ngày kết thúc *</Label>
								<Input
									id='edit-endDate'
									type='date'
									required
									value={editForm.endDate}
									onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
								/>
							</div>
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<Label htmlFor='edit-usageLimit'>Giới hạn sử dụng</Label>
								<Input
									id='edit-usageLimit'
									type='number'
									value={editForm.usageLimit}
									onChange={(e) => setEditForm({ ...editForm, usageLimit: Number(e.target.value) })}
									placeholder='0 = không giới hạn'
								/>
							</div>
							<div className='flex items-center space-x-2 pt-6'>
								<Checkbox
									id='edit-isActive'
									checked={editForm.isActive}
									onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: !!checked })}
								/>
								<Label htmlFor='edit-isActive'>Kích hoạt</Label>
							</div>
						</div>
						<div className='flex justify-end space-x-2'>
							<Button type='button' variant='outline' onClick={() => setIsEditDialogOpen(false)}>
								Hủy
							</Button>
							<Button type='submit' disabled={updatePromotionMutation.isPending}>
								{updatePromotionMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
