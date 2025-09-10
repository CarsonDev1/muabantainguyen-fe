'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
	Tag,
	Search,
	Filter,
	MoreVertical,
	Plus,
	Edit,
	Trash2,
	Eye,
	Calendar,
	Percent,
	DollarSign,
	Users,
	Loader2,
	ChevronLeft,
	ChevronRight,
	AlertTriangle,
	X,
	CheckCircle,
	XCircle,
	Clock,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
	voucherService,
	type Voucher,
	type CreateVoucherRequest,
	type UpdateVoucherRequest,
} from '@/services/voucher-service';

const STATUS_OPTIONS = [
	{ value: 'all', label: 'Tất cả trạng thái' },
	{ value: 'true', label: 'Đang hoạt động' },
	{ value: 'false', label: 'Không hoạt động' },
];

const SORT_BY_OPTIONS = [
	{ value: 'created_at', label: 'Ngày tạo' },
	{ value: 'code', label: 'Mã voucher' },
	{ value: 'discount_percent', label: 'Phần trăm giảm' },
	{ value: 'discount_amount', label: 'Số tiền giảm' },
];

const SORT_ORDER_OPTIONS = [
	{ value: 'desc', label: 'Giảm dần' },
	{ value: 'asc', label: 'Tăng dần' },
];

const VouchersPage = () => {
	const queryClient = useQueryClient();
	const [searchTerm, setSearchTerm] = useState('');
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
	const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
	const [voucherToDelete, setVoucherToDelete] = useState<Voucher | null>(null);
	const [showVoucherDetails, setShowVoucherDetails] = useState(false);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showFilterPopover, setShowFilterPopover] = useState(false);

	const [filters, setFilters] = useState<{
		isActive: string;
		sortBy: string;
		sortOrder: string;
	}>({
		isActive: 'all',
		sortBy: 'created_at',
		sortOrder: 'desc',
	});

	const [formData, setFormData] = useState<CreateVoucherRequest>({
		code: '',
		description: '',
		discount_percent: 0,
		discount_amount: 0,
		max_uses: 0,
		valid_from: '',
		valid_to: '',
		is_active: true,
	});

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 500);
		return () => clearTimeout(timer);
	}, [searchTerm]);

	const {
		data: vouchersData,
		isLoading: isLoadingVouchers,
		isError: isVouchersError,
		error: vouchersError,
	} = useQuery({
		queryKey: ['vouchers'],
		queryFn: () => voucherService.getVouchers(),
		staleTime: 2 * 60 * 1000,
	});

	const createVoucherMutation = useMutation({
		mutationFn: (data: CreateVoucherRequest) => voucherService.createVoucher(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['vouchers'] });
			toast.success('Tạo voucher thành công');
			setShowCreateDialog(false);
			resetForm();
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Có lỗi xảy ra khi tạo voucher');
		},
	});

	const updateVoucherMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateVoucherRequest }) =>
			voucherService.updateVoucher(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['vouchers'] });
			toast.success('Cập nhật voucher thành công');
			setShowEditDialog(false);
			resetForm();
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Có lỗi xảy ra khi cập nhật voucher');
		},
	});

	const deleteVoucherMutation = useMutation({
		mutationFn: (id: string) => voucherService.deleteVoucher(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['vouchers'] });
			toast.success('Xóa voucher thành công');
			setVoucherToDelete(null);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Có lỗi xảy ra khi xóa voucher');
		},
	});

	const resetForm = () => {
		setFormData({
			code: '',
			description: '',
			discount_percent: 0,
			discount_amount: 0,
			max_uses: 0,
			valid_from: '',
			valid_to: '',
			is_active: true,
		});
	};

	const handleCreateVoucher = () => {
		setShowCreateDialog(true);
		resetForm();
	};

	const handleEditVoucher = (voucher: Voucher) => {
		setSelectedVoucher(voucher);
		setFormData({
			code: voucher.code,
			description: voucher.description,
			discount_percent: voucher.discount_percent,
			discount_amount: voucher.discount_amount,
			max_uses: voucher.max_uses,
			valid_from: voucher.valid_from.split('T')[0],
			valid_to: voucher.valid_to.split('T')[0],
			is_active: voucher.is_active,
		});
		setShowEditDialog(true);
	};

	const handleDeleteVoucher = (voucher: Voucher) => {
		setVoucherToDelete(voucher);
	};

	const confirmDeleteVoucher = () => {
		if (voucherToDelete) {
			deleteVoucherMutation.mutate(voucherToDelete.id);
		}
	};

	const handleViewDetails = (voucher: Voucher) => {
		setSelectedVoucher(voucher);
		setShowVoucherDetails(true);
	};

	const handleFilterChange = (key: string, value: string) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const clearFilters = () => {
		setFilters({
			isActive: 'all',
			sortBy: 'created_at',
			sortOrder: 'desc',
		});
		setSearchTerm('');
	};

	const hasActiveFilters = (!!filters.isActive && filters.isActive !== 'all') || !!debouncedSearchTerm;

	const getStatusColor = (isActive: boolean) => {
		return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
	};

	const getStatusIcon = (isActive: boolean) => {
		return isActive ? <CheckCircle className='h-4 w-4' /> : <XCircle className='h-4 w-4' />;
	};

	const isVoucherExpired = (validTo: string) => {
		return new Date(validTo) < new Date();
	};

	const isVoucherActive = (voucher: Voucher) => {
		const now = new Date();
		const validFrom = new Date(voucher.valid_from);
		const validTo = new Date(voucher.valid_to);
		return voucher.is_active && now >= validFrom && now <= validTo && voucher.used_count < voucher.max_uses;
	};

	const filteredVouchers =
		vouchersData?.vouchers?.filter((voucher) => {
			const matchesSearch =
				!debouncedSearchTerm ||
				voucher.code.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
				voucher.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

			const matchesStatus =
				filters.isActive === 'all' ||
				(filters.isActive === 'true' && voucher.is_active) ||
				(filters.isActive === 'false' && !voucher.is_active);

			return matchesSearch && matchesStatus;
		}) || [];

	const sortedVouchers = [...filteredVouchers].sort((a, b) => {
		const { sortBy, sortOrder } = filters;
		let aValue: any = a[sortBy as keyof Voucher];
		let bValue: any = b[sortBy as keyof Voucher];

		if (sortBy === 'created_at') {
			aValue = new Date(aValue);
			bValue = new Date(bValue);
		}

		if (sortOrder === 'asc') {
			return aValue > bValue ? 1 : -1;
		} else {
			return aValue < bValue ? 1 : -1;
		}
	});

	const activeVouchers = vouchersData?.vouchers?.filter((voucher) => isVoucherActive(voucher)).length || 0;
	const expiredVouchers = vouchersData?.vouchers?.filter((voucher) => isVoucherExpired(voucher.valid_to)).length || 0;
	const totalDiscount = vouchersData?.vouchers?.reduce((sum, voucher) => sum + voucher.discount_amount, 0) || 0;

	if (isLoadingVouchers) {
		return (
			<div className='space-y-6'>
				<div className='flex items-center justify-between'>
					<h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
						Quản lý voucher
					</h1>
				</div>
				<div className='flex items-center justify-center p-8'>
					<Loader2 className='h-8 w-8 animate-spin' />
					<span className='ml-2'>Đang tải danh sách voucher...</span>
				</div>
			</div>
		);
	}

	if (isVouchersError) {
		return (
			<div className='space-y-6'>
				<div className='flex items-center justify-between'>
					<h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
						Quản lý voucher
					</h1>
				</div>
				<Card>
					<CardContent className='p-6 text-center'>
						<p className='text-destructive'>
							Có lỗi xảy ra: {vouchersError?.message || 'Không thể tải danh sách voucher'}
						</p>
						<Button
							variant='outline'
							className='mt-4'
							onClick={() => queryClient.invalidateQueries({ queryKey: ['vouchers'] })}
						>
							Thử lại
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
				<div>
					<h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
						Quản lý voucher
					</h1>
					<p className='text-gray-600 mt-2'>Quản lý mã giảm giá và khuyến mãi</p>
				</div>
				<Button onClick={handleCreateVoucher} className='bg-blue-600 hover:bg-blue-700'>
					<Plus className='h-4 w-4 mr-2' />
					Tạo voucher mới
				</Button>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium flex items-center gap-2'>
							<Tag className='h-4 w-4' />
							Tổng voucher
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{vouchersData?.vouchers?.length || 0}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium flex items-center gap-2'>
							<CheckCircle className='h-4 w-4' />
							Đang hoạt động
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-green-600'>{activeVouchers}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium flex items-center gap-2'>
							<Clock className='h-4 w-4' />
							Hết hạn
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-red-600'>{expiredVouchers}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium flex items-center gap-2'>
							<DollarSign className='h-4 w-4' />
							Tổng giảm giá
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-blue-600'>{totalDiscount.toLocaleString()}đ</div>
					</CardContent>
				</Card>
			</div>

			{/* Search and Filter */}
			<Card>
				<CardContent className='p-4'>
					<div className='flex flex-col sm:flex-row gap-4'>
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
							<Input
								placeholder='Tìm kiếm theo mã voucher hoặc mô tả...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='pl-10'
							/>
						</div>
						<div className='flex gap-2'>
							<Popover open={showFilterPopover} onOpenChange={setShowFilterPopover}>
								<PopoverTrigger asChild>
									<Button
										variant='outline'
										className={hasActiveFilters ? 'border-blue-500 bg-blue-50' : ''}
									>
										<Filter className='h-4 w-4 mr-2' />
										Bộ lọc
										{hasActiveFilters && (
											<Badge
												variant='secondary'
												className='ml-2 h-5 w-5 p-0 flex items-center justify-center'
											>
												!
											</Badge>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className='w-80' align='end'>
									<div className='space-y-4'>
										<div className='flex items-center justify-between'>
											<h4 className='font-medium'>Bộ lọc tìm kiếm</h4>
											{hasActiveFilters && (
												<Button
													variant='ghost'
													size='sm'
													onClick={clearFilters}
													className='h-8 px-2 text-xs'
												>
													<X className='h-3 w-3 mr-1' />
													Xóa bộ lọc
												</Button>
											)}
										</div>

										<div className='space-y-3'>
											<div>
												<Label htmlFor='status-filter' className='text-sm font-medium'>
													Trạng thái
												</Label>
												<Select
													value={filters.isActive}
													onValueChange={(value) => handleFilterChange('isActive', value)}
												>
													<SelectTrigger className='mt-1'>
														<SelectValue placeholder='Tất cả trạng thái' />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='all'>Tất cả trạng thái</SelectItem>
														<SelectItem value='true'>Đang hoạt động</SelectItem>
														<SelectItem value='false'>Không hoạt động</SelectItem>
													</SelectContent>
												</Select>
											</div>

											<div>
												<Label htmlFor='sort-filter' className='text-sm font-medium'>
													Sắp xếp theo
												</Label>
												<Select
													value={filters.sortBy}
													onValueChange={(value) => handleFilterChange('sortBy', value)}
												>
													<SelectTrigger className='mt-1'>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='created_at'>Ngày tạo</SelectItem>
														<SelectItem value='code'>Mã voucher</SelectItem>
														<SelectItem value='discount_percent'>Phần trăm giảm</SelectItem>
														<SelectItem value='discount_amount'>Số tiền giảm</SelectItem>
													</SelectContent>
												</Select>
											</div>

											<div>
												<Label htmlFor='order-filter' className='text-sm font-medium'>
													Thứ tự
												</Label>
												<Select
													value={filters.sortOrder}
													onValueChange={(value) => handleFilterChange('sortOrder', value)}
												>
													<SelectTrigger className='mt-1'>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='desc'>Giảm dần</SelectItem>
														<SelectItem value='asc'>Tăng dần</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
									</div>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					{/* Active filters display */}
					{hasActiveFilters && (
						<div className='flex flex-wrap gap-2 mt-3 pt-3 border-t'>
							<span className='text-sm text-gray-600'>Bộ lọc đang áp dụng:</span>
							{debouncedSearchTerm && (
								<Badge variant='secondary' className='gap-1'>
									Tìm kiếm: "{debouncedSearchTerm}"
									<X className='h-3 w-3 cursor-pointer' onClick={() => setSearchTerm('')} />
								</Badge>
							)}
							{filters.isActive && filters.isActive !== 'all' && (
								<Badge variant='secondary' className='gap-1'>
									Trạng thái: {filters.isActive === 'true' ? 'Đang hoạt động' : 'Không hoạt động'}
									<X
										className='h-3 w-3 cursor-pointer'
										onClick={() => handleFilterChange('isActive', 'all')}
									/>
								</Badge>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Vouchers Table */}
			<Card>
				<CardHeader>
					<CardTitle>Danh sách voucher</CardTitle>
				</CardHeader>
				<CardContent className='p-0'>
					{sortedVouchers.length === 0 ? (
						<div className='text-center py-8'>
							<Tag className='h-12 w-12 mx-auto mb-4 text-gray-300' />
							<p className='text-gray-500'>
								{hasActiveFilters ? 'Không tìm thấy voucher phù hợp với bộ lọc' : 'Chưa có voucher nào'}
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Mã voucher</TableHead>
									<TableHead>Mô tả</TableHead>
									<TableHead>Giảm giá</TableHead>
									<TableHead>Sử dụng</TableHead>
									<TableHead>Thời hạn</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead className='text-right'>Thao tác</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sortedVouchers.map((voucher) => (
									<TableRow key={voucher.id}>
										<TableCell>
											<div className='font-medium'>{voucher.code}</div>
										</TableCell>
										<TableCell>
											<div className='max-w-[200px] truncate'>{voucher.description}</div>
										</TableCell>
										<TableCell>
											<div className='space-y-1'>
												{voucher.discount_percent > 0 && (
													<div className='flex items-center gap-1 text-sm'>
														<Percent className='h-3 w-3' />
														{voucher.discount_percent}%
													</div>
												)}
												{voucher.discount_amount > 0 && (
													<div className='flex items-center gap-1 text-sm'>
														<DollarSign className='h-3 w-3' />
														{voucher.discount_amount.toLocaleString('vi-VN')}đ
													</div>
												)}
											</div>
										</TableCell>
										<TableCell>
											<div className='text-sm'>
												{voucher.used_count} / {voucher.max_uses}
											</div>
										</TableCell>
										<TableCell>
											<div className='space-y-1'>
												<div className='flex items-center gap-1 text-sm'>
													<Calendar className='h-3 w-3' />
													Từ: {new Date(voucher.valid_from).toLocaleDateString('vi-VN')}
												</div>
												<div className='flex items-center gap-1 text-sm'>
													<Calendar className='h-3 w-3' />
													Đến: {new Date(voucher.valid_to).toLocaleDateString('vi-VN')}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge className={getStatusColor(isVoucherActive(voucher))}>
												{isVoucherActive(voucher) ? 'Hoạt động' : 'Không hoạt động'}
											</Badge>
										</TableCell>
										<TableCell className='text-right'>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant='ghost' size='sm'>
														<MoreVertical className='h-4 w-4' />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align='end'>
													<DropdownMenuItem onClick={() => handleViewDetails(voucher)}>
														<Eye className='h-4 w-4 mr-2' />
														Xem chi tiết
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleEditVoucher(voucher)}>
														<Edit className='h-4 w-4 mr-2' />
														Chỉnh sửa
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														onClick={() => handleDeleteVoucher(voucher)}
														className='text-red-600'
													>
														<Trash2 className='h-4 w-4 mr-2' />
														Xóa
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Voucher Details Dialog */}
			<Dialog open={showVoucherDetails} onOpenChange={setShowVoucherDetails}>
				<DialogContent className='sm:max-w-[600px]'>
					<DialogHeader>
						<DialogTitle>Chi tiết voucher</DialogTitle>
						<DialogDescription>Thông tin chi tiết của voucher {selectedVoucher?.code}</DialogDescription>
					</DialogHeader>
					{selectedVoucher && (
						<div className='space-y-6'>
							<div className='flex items-center gap-4'>
								<div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center'>
									<Tag className='h-6 w-6 text-blue-600' />
								</div>
								<div>
									<h3 className='text-xl font-semibold'>{selectedVoucher.code}</h3>
									<div className='flex items-center gap-2 mt-1'>
										<Badge className={getStatusColor(isVoucherActive(selectedVoucher))}>
											{isVoucherActive(selectedVoucher) ? 'Hoạt động' : 'Không hoạt động'}
										</Badge>
									</div>
								</div>
							</div>

							<Separator />

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label className='text-sm font-medium text-gray-600'>Mô tả</label>
									<p className='mt-1'>{selectedVoucher.description}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-600'>Số lần sử dụng</label>
									<p className='mt-1'>
										{selectedVoucher.used_count} / {selectedVoucher.max_uses}
									</p>
								</div>
								{selectedVoucher.discount_percent > 0 && (
									<div>
										<label className='text-sm font-medium text-gray-600'>Giảm giá (%)</label>
										<p className='mt-1'>{selectedVoucher.discount_percent}%</p>
									</div>
								)}
								{selectedVoucher.discount_amount > 0 && (
									<div>
										<label className='text-sm font-medium text-gray-600'>Giảm giá (VNĐ)</label>
										<p className='mt-1'>
											{selectedVoucher.discount_amount.toLocaleString('vi-VN')}đ
										</p>
									</div>
								)}
								<div>
									<label className='text-sm font-medium text-gray-600'>Có hiệu lực từ</label>
									<p className='mt-1'>
										{new Date(selectedVoucher.valid_from).toLocaleString('vi-VN')}
									</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-600'>Có hiệu lực đến</label>
									<p className='mt-1'>{new Date(selectedVoucher.valid_to).toLocaleString('vi-VN')}</p>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Create Voucher Dialog */}
			<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
				<DialogContent className='sm:max-w-[600px]'>
					<DialogHeader>
						<DialogTitle>Tạo voucher mới</DialogTitle>
						<DialogDescription>Tạo mã giảm giá mới cho khách hàng</DialogDescription>
					</DialogHeader>
					<div className='space-y-4'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<Label htmlFor='code'>Mã voucher *</Label>
								<Input
									id='code'
									value={formData.code}
									onChange={(e) => setFormData({ ...formData, code: e.target.value })}
									placeholder='Nhập mã voucher'
								/>
							</div>
							<div>
								<Label htmlFor='max_uses'>Số lần sử dụng tối đa *</Label>
								<Input
									id='max_uses'
									type='number'
									value={formData.max_uses}
									onChange={(e) =>
										setFormData({ ...formData, max_uses: parseInt(e.target.value) || 0 })
									}
									placeholder='Nhập số lần sử dụng'
								/>
							</div>
						</div>

						<div>
							<Label htmlFor='description'>Mô tả *</Label>
							<Input
								id='description'
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								placeholder='Nhập mô tả voucher'
							/>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<Label htmlFor='discount_percent'>Giảm giá (%)</Label>
								<Input
									id='discount_percent'
									type='number'
									value={formData.discount_percent}
									onChange={(e) =>
										setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 0 })
									}
									placeholder='Nhập phần trăm giảm giá'
								/>
							</div>
							<div>
								<Label htmlFor='discount_amount'>Giảm giá (VNĐ)</Label>
								<Input
									id='discount_amount'
									type='number'
									value={formData.discount_amount}
									onChange={(e) =>
										setFormData({ ...formData, discount_amount: parseInt(e.target.value) || 0 })
									}
									placeholder='Nhập số tiền giảm giá'
								/>
							</div>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<Label htmlFor='valid_from'>Có hiệu lực từ *</Label>
								<Input
									id='valid_from'
									type='date'
									value={formData.valid_from}
									onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
								/>
							</div>
							<div>
								<Label htmlFor='valid_to'>Có hiệu lực đến *</Label>
								<Input
									id='valid_to'
									type='date'
									value={formData.valid_to}
									onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
								/>
							</div>
						</div>

						<div className='flex items-center space-x-2'>
							<Checkbox
								id='is_active'
								checked={formData.is_active}
								onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
							/>
							<Label htmlFor='is_active'>Kích hoạt voucher</Label>
						</div>

						<div className='flex justify-end gap-3 pt-4'>
							<Button variant='outline' onClick={() => setShowCreateDialog(false)}>
								Hủy
							</Button>
							<Button
								onClick={() => createVoucherMutation.mutate(formData)}
								disabled={
									createVoucherMutation.isPending ||
									!formData.code ||
									!formData.description ||
									!formData.valid_from ||
									!formData.valid_to
								}
								className='bg-blue-600 hover:bg-blue-700'
							>
								{createVoucherMutation.isPending ? (
									<>
										<Loader2 className='w-4 h-4 mr-2 animate-spin' />
										Đang tạo...
									</>
								) : (
									'Tạo voucher'
								)}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Edit Voucher Dialog */}
			<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
				<DialogContent className='sm:max-w-[600px]'>
					<DialogHeader>
						<DialogTitle>Chỉnh sửa voucher</DialogTitle>
						<DialogDescription>Cập nhật thông tin voucher {selectedVoucher?.code}</DialogDescription>
					</DialogHeader>
					<div className='space-y-4'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<Label htmlFor='edit-code'>Mã voucher *</Label>
								<Input
									id='edit-code'
									value={formData.code}
									onChange={(e) => setFormData({ ...formData, code: e.target.value })}
									placeholder='Nhập mã voucher'
								/>
							</div>
							<div>
								<Label htmlFor='edit-max_uses'>Số lần sử dụng tối đa *</Label>
								<Input
									id='edit-max_uses'
									type='number'
									value={formData.max_uses}
									onChange={(e) =>
										setFormData({ ...formData, max_uses: parseInt(e.target.value) || 0 })
									}
									placeholder='Nhập số lần sử dụng'
								/>
							</div>
						</div>

						<div>
							<Label htmlFor='edit-description'>Mô tả *</Label>
							<Input
								id='edit-description'
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								placeholder='Nhập mô tả voucher'
							/>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<Label htmlFor='edit-discount_percent'>Giảm giá (%)</Label>
								<Input
									id='edit-discount_percent'
									type='number'
									value={formData.discount_percent}
									onChange={(e) =>
										setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 0 })
									}
									placeholder='Nhập phần trăm giảm giá'
								/>
							</div>
							<div>
								<Label htmlFor='edit-discount_amount'>Giảm giá (VNĐ)</Label>
								<Input
									id='edit-discount_amount'
									type='number'
									value={formData.discount_amount}
									onChange={(e) =>
										setFormData({ ...formData, discount_amount: parseInt(e.target.value) || 0 })
									}
									placeholder='Nhập số tiền giảm giá'
								/>
							</div>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<Label htmlFor='edit-valid_from'>Có hiệu lực từ *</Label>
								<Input
									id='edit-valid_from'
									type='date'
									value={formData.valid_from}
									onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
								/>
							</div>
							<div>
								<Label htmlFor='edit-valid_to'>Có hiệu lực đến *</Label>
								<Input
									id='edit-valid_to'
									type='date'
									value={formData.valid_to}
									onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
								/>
							</div>
						</div>

						<div className='flex items-center space-x-2'>
							<Checkbox
								id='edit-is_active'
								checked={formData.is_active}
								onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
							/>
							<Label htmlFor='edit-is_active'>Kích hoạt voucher</Label>
						</div>

						<div className='flex justify-end gap-3 pt-4'>
							<Button variant='outline' onClick={() => setShowEditDialog(false)}>
								Hủy
							</Button>
							<Button
								onClick={() =>
									selectedVoucher &&
									updateVoucherMutation.mutate({ id: selectedVoucher.id, data: formData })
								}
								disabled={
									updateVoucherMutation.isPending ||
									!formData.code ||
									!formData.description ||
									!formData.valid_from ||
									!formData.valid_to
								}
								className='bg-blue-600 hover:bg-blue-700'
							>
								{updateVoucherMutation.isPending ? (
									<>
										<Loader2 className='w-4 h-4 mr-2 animate-spin' />
										Đang cập nhật...
									</>
								) : (
									'Cập nhật voucher'
								)}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={!!voucherToDelete} onOpenChange={() => setVoucherToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className='flex items-center gap-3'>
							<div className='w-12 h-12 rounded-full bg-red-100 flex items-center justify-center'>
								<AlertTriangle className='w-6 h-6 text-red-600' />
							</div>
							Xóa voucher
						</AlertDialogTitle>
						<AlertDialogDescription className='space-y-3 pt-4'>
							<p className='text-base'>
								Bạn có chắc chắn muốn xóa voucher{' '}
								<span className='font-semibold text-gray-900'>"{voucherToDelete?.code}"</span>?
							</p>
							<div className='bg-red-50 border border-red-200 rounded-lg p-4'>
								<p className='text-sm text-red-700'>
									Hành động này không thể hoàn tác. Voucher sẽ bị xóa vĩnh viễn.
								</p>
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
								onClick={confirmDeleteVoucher}
								disabled={deleteVoucherMutation.isPending}
								size='lg'
								className='bg-red-600 hover:bg-red-700'
							>
								{deleteVoucherMutation.isPending ? (
									<>
										<Loader2 className='w-5 h-5 mr-2 animate-spin' />
										Đang xóa...
									</>
								) : (
									<>
										<Trash2 className='w-5 h-5 mr-2' />
										Xóa voucher
									</>
								)}
							</Button>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default VouchersPage;
