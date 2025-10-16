'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
	Users,
	Search,
	Filter,
	MoreVertical,
	Shield,
	ShieldOff,
	Eye,
	Mail,
	Phone,
	Calendar,
	Package,
	Loader2,
	ChevronLeft,
	ChevronRight,
	AlertTriangle,
	X,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userService, type User, type GetUsersParams } from '@/services/user-service';

const ROLE_OPTIONS = [
	{ value: 'all', label: 'Tất cả vai trò' },
	{ value: 'admin', label: 'Admin' },
	{ value: 'user', label: 'User' },
];
const STATUS_OPTIONS = [
	{ value: 'all', label: 'Tất cả trạng thái' },
	{ value: 'false', label: 'Đang hoạt động' },
	{ value: 'true', label: 'Bị chặn' },
];
const SORT_BY_OPTIONS = [
	{ value: 'created_at', label: 'Ngày tạo' },
	{ value: 'name', label: 'Tên' },
	{ value: 'email', label: 'Email' },
];
const SORT_ORDER_OPTIONS = [
	{ value: 'desc', label: 'Giảm dần' },
	{ value: 'asc', label: 'Tăng dần' },
];

const UsersPage = () => {
	const queryClient = useQueryClient();
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(10);
	const [searchTerm, setSearchTerm] = useState('');
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [userToBlock, setUserToBlock] = useState<User | null>(null);
	const [showUserDetails, setShowUserDetails] = useState(false);
	const [showUserOrders, setShowUserOrders] = useState(false);
	const [showFilterPopover, setShowFilterPopover] = useState(false);

	const [filters, setFilters] = useState<{
		role: string;
		isBlocked: string;
		sortBy: string;
		sortOrder: string;
	}>({
		role: 'all',
		isBlocked: 'all',
		sortBy: 'created_at',
		sortOrder: 'desc',
	});

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
			setCurrentPage(1);
		}, 500);
		return () => clearTimeout(timer);
	}, [searchTerm]);

	const queryParams: GetUsersParams = {
		page: currentPage,
		pageSize,
		...(debouncedSearchTerm && { search: debouncedSearchTerm }),
		...(filters.role && filters.role !== 'all' && { role: filters.role }),
		...(filters.isBlocked &&
			filters.isBlocked !== 'all' &&
			(filters.isBlocked === 'true' || filters.isBlocked === 'false') && { isBlocked: filters.isBlocked }),
		sortBy: filters.sortBy,
		sortOrder: filters.sortOrder,
	};

	const {
		data: usersData,
		isLoading: isLoadingUsers,
		isError: isUsersError,
		error: usersError,
	} = useQuery({
		queryKey: ['users', queryParams],
		queryFn: () => userService.getUsers(queryParams),
		staleTime: 2 * 60 * 1000,
	});

	const { data: userOrdersData, isLoading: isLoadingOrders } = useQuery({
		queryKey: ['user-orders', selectedUser?.id],
		queryFn: () => userService.getUserOrders(selectedUser!.id),
		enabled: !!selectedUser && showUserOrders,
		staleTime: 1 * 60 * 1000,
	});

	const blockUserMutation = useMutation({
		mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) => userService.blockUser(id, { blocked }),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			toast.success(variables.blocked ? 'Đã chặn người dùng thành công' : 'Đã bỏ chặn người dùng thành công');
			setUserToBlock(null);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái người dùng');
		},
	});

	const handleBlockUser = (user: User) => setUserToBlock(user);

	const confirmBlockUser = () => {
		if (userToBlock) {
			blockUserMutation.mutate({
				id: userToBlock.id,
				blocked: !userToBlock.is_blocked,
			});
		}
	};

	const handleViewDetails = (user: User) => {
		setSelectedUser(user);
		setShowUserDetails(true);
	};

	const handleViewOrders = (user: User) => {
		setSelectedUser(user);
		setShowUserOrders(true);
	};

	const handleFilterChange = (key: string, value: string) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}));
		setCurrentPage(1);
	};

	const clearFilters = () => {
		setFilters({
			role: 'all',
			isBlocked: 'all',
			sortBy: 'created_at',
			sortOrder: 'desc',
		});
		setSearchTerm('');
		setCurrentPage(1);
	};

	const hasActiveFilters =
		(!!filters.role && filters.role !== 'all') ||
		(!!filters.isBlocked && filters.isBlocked !== 'all') ||
		!!debouncedSearchTerm;

	const getRoleColor = (role: string) => {
		switch (role.toLowerCase()) {
			case 'admin':
				return 'bg-red-100 text-red-800';
			case 'user':
				return 'bg-blue-100 text-blue-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getStatusColor = (blocked?: boolean) => {
		return blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
	};

	const users = usersData?.users || [];
	const pagination = usersData?.pagination;

	if (isLoadingUsers) {
		return (
			<div className='space-y-6'>
				<div className='flex items-center justify-between'>
					<h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
						Quản lý người dùng
					</h1>
				</div>
				<div className='flex items-center justify-center p-8'>
					<Loader2 className='h-8 w-8 animate-spin' />
					<span className='ml-2'>Đang tải danh sách người dùng...</span>
				</div>
			</div>
		);
	}

	if (isUsersError) {
		return (
			<div className='space-y-6'>
				<div className='flex items-center justify-between'>
					<h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
						Quản lý người dùng
					</h1>
				</div>
				<Card>
					<CardContent className='p-6 text-center'>
						<p className='text-destructive'>
							Có lỗi xảy ra: {usersError?.message || 'Không thể tải danh sách người dùng'}
						</p>
						<Button
							variant='outline'
							className='mt-4'
							onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
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
						Quản lý người dùng
					</h1>
					<p className='text-gray-600 mt-2'>Quản lý thông tin và trạng thái người dùng</p>
				</div>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium flex items-center gap-2'>
							<Users className='h-4 w-4' />
							Tổng người dùng
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{pagination?.total || users.length}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium flex items-center gap-2'>
							<Shield className='h-4 w-4' />
							Đang hoạt động
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-green-600'>
							{users.filter((user) => !user.is_blocked).length}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium flex items-center gap-2'>
							<ShieldOff className='h-4 w-4' />
							Bị chặn
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-red-600'>
							{users.filter((user) => user.is_blocked).length}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium flex items-center gap-2'>
							<Users className='h-4 w-4' />
							Admin
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-blue-600'>
							{users.filter((user) => user.role === 'admin').length}
						</div>
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
								placeholder='Tìm kiếm theo tên, email hoặc số điện thoại...'
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
												<Label htmlFor='role-filter' className='text-sm font-medium'>
													Vai trò
												</Label>
												<Select
													value={filters.role}
													onValueChange={(value) => handleFilterChange('role', value)}
												>
													<SelectTrigger className='mt-1'>
														<SelectValue placeholder='Tất cả vai trò' />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='all'>Tất cả vai trò</SelectItem>
														<SelectItem value='admin'>Admin</SelectItem>
														<SelectItem value='user'>User</SelectItem>
													</SelectContent>
												</Select>
											</div>

											<div>
												<Label htmlFor='status-filter' className='text-sm font-medium'>
													Trạng thái
												</Label>
												<Select
													value={filters.isBlocked}
													onValueChange={(value) => handleFilterChange('isBlocked', value)}
												>
													<SelectTrigger className='mt-1'>
														<SelectValue placeholder='Tất cả trạng thái' />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='all'>Tất cả trạng thái</SelectItem>
														<SelectItem value='false'>Đang hoạt động</SelectItem>
														<SelectItem value='true'>Bị chặn</SelectItem>
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
														<SelectItem value='name'>Tên</SelectItem>
														<SelectItem value='email'>Email</SelectItem>
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
							{filters.role && filters.role !== 'all' && (
								<Badge variant='secondary' className='gap-1'>
									Vai trò: {filters.role === 'admin' ? 'Admin' : 'User'}
									<X
										className='h-3 w-3 cursor-pointer'
										onClick={() => handleFilterChange('role', 'all')}
									/>
								</Badge>
							)}
							{filters.isBlocked && filters.isBlocked !== 'all' && (
								<Badge variant='secondary' className='gap-1'>
									Trạng thái: {filters.isBlocked === 'true' ? 'Bị chặn' : 'Đang hoạt động'}
									<X
										className='h-3 w-3 cursor-pointer'
										onClick={() => handleFilterChange('isBlocked', 'all')}
									/>
								</Badge>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Users Table */}
			<Card>
				<CardHeader>
					<CardTitle>Danh sách người dùng</CardTitle>
				</CardHeader>
				<CardContent className='p-0'>
					{users.length === 0 ? (
						<div className='text-center py-8'>
							<Users className='h-12 w-12 mx-auto mb-4 text-gray-300' />
							<p className='text-gray-500'>
								{hasActiveFilters
									? 'Không tìm thấy người dùng phù hợp với bộ lọc'
									: 'Chưa có người dùng nào'}
							</p>
						</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Người dùng</TableHead>
										<TableHead>Liên hệ</TableHead>
										<TableHead>Vai trò</TableHead>
										<TableHead>Trạng thái</TableHead>
										<TableHead>Ngày tạo</TableHead>
										<TableHead className='text-right'>Thao tác</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{users.map((user) => (
										<TableRow key={user.id}>
											<TableCell>
												<div className='flex items-center gap-3'>
													<Avatar className='h-10 w-10'>
														<AvatarImage src={user.avatar_url} alt={user.name} />
														<AvatarFallback>
															{user.name
																.split(' ')
																.map((n) => n[0])
																.join('')
																.toUpperCase()}
														</AvatarFallback>
													</Avatar>
													<div>
														<div className='font-medium'>{user.name}</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className='space-y-1'>
													<div className='flex items-center gap-2 text-sm'>
														<Mail className='h-3 w-3' />
														{user.email}
													</div>
													{user.phone && (
														<div className='flex items-center gap-2 text-sm text-gray-500'>
															<Phone className='h-3 w-3' />
															{user.phone}
														</div>
													)}
												</div>
											</TableCell>
											<TableCell>
												<Badge className={getRoleColor(user.role)}>{user.role}</Badge>
											</TableCell>
											<TableCell>
												<Badge className={getStatusColor(user.is_blocked)}>
													{user.is_blocked ? 'Bị chặn' : 'Hoạt động'}
												</Badge>
											</TableCell>
											<TableCell>
												<div className='flex items-center gap-2 text-sm'>
													<Calendar className='h-3 w-3' />
													{user.created_at
														? new Date(user.created_at).toLocaleDateString('vi-VN')
														: 'N/A'}
												</div>
											</TableCell>
											<TableCell className='text-right'>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant='ghost' size='sm'>
															<MoreVertical className='h-4 w-4' />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align='end'>
														<DropdownMenuItem onClick={() => handleViewDetails(user)}>
															<Eye className='h-4 w-4 mr-2' />
															Xem chi tiết
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleViewOrders(user)}>
															<Package className='h-4 w-4 mr-2' />
															Xem đơn hàng
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() => handleBlockUser(user)}
															className={
																user.is_blocked ? 'text-green-600' : 'text-red-600'
															}
														>
															{user.is_blocked ? (
																<>
																	<Shield className='h-4 w-4 mr-2' />
																	Bỏ chặn
																</>
															) : (
																<>
																	<ShieldOff className='h-4 w-4 mr-2' />
																	Chặn người dùng
																</>
															)}
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>

							{/* Pagination */}
							{pagination && pagination.totalPages > 1 && (
								<div className='flex items-center justify-between p-4 border-t'>
									<div className='text-sm text-gray-500'>
										Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
										{Math.min(currentPage * pageSize, pagination.total)}
										trong tổng số {pagination.total} người dùng
									</div>
									<div className='flex items-center gap-2'>
										<Button
											variant='outline'
											size='sm'
											onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
											disabled={currentPage === 1}
										>
											<ChevronLeft className='h-4 w-4' />
											Trước
										</Button>
										<span className='text-sm'>
											Trang {currentPage} / {pagination.totalPages}
										</span>
										<Button
											variant='outline'
											size='sm'
											onClick={() =>
												setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))
											}
											disabled={currentPage === pagination.totalPages}
										>
											Sau
											<ChevronRight className='h-4 w-4' />
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			{/* User Details Dialog */}
			<Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
				<DialogContent className='sm:max-w-[600px]'>
					<DialogHeader>
						<DialogTitle>Chi tiết người dùng</DialogTitle>
						<DialogDescription>Thông tin chi tiết của {selectedUser?.name}</DialogDescription>
					</DialogHeader>
					{selectedUser && (
						<div className='space-y-6'>
							<div className='flex items-center gap-4'>
								<Avatar className='h-16 w-16'>
									<AvatarImage src={selectedUser.avatar_url} alt={selectedUser.name} />
									<AvatarFallback className='text-lg'>
										{selectedUser.name
											.split(' ')
											.map((n) => n[0])
											.join('')
											.toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div>
									<h3 className='text-xl font-semibold'>{selectedUser.name}</h3>
									<div className='flex items-center gap-2 mt-1'>
										<Badge className={getRoleColor(selectedUser.role)}>{selectedUser.role}</Badge>
										<Badge className={getStatusColor(selectedUser.is_blocked)}>
											{selectedUser.is_blocked ? 'Bị chặn' : 'Hoạt động'}
										</Badge>
									</div>
								</div>
							</div>

							<Separator />

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label className='text-sm font-medium text-gray-600'>Email</label>
									<p className='mt-1'>{selectedUser.email}</p>
								</div>
								{selectedUser.phone && (
									<div>
										<label className='text-sm font-medium text-gray-600'>Số điện thoại</label>
										<p className='mt-1'>{selectedUser.phone}</p>
									</div>
								)}
								{selectedUser.created_at && (
									<div>
										<label className='text-sm font-medium text-gray-600'>Ngày tạo</label>
										<p className='mt-1'>
											{new Date(selectedUser.created_at).toLocaleString('vi-VN')}
										</p>
									</div>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* User Orders Dialog */}
			<Dialog open={showUserOrders} onOpenChange={setShowUserOrders}>
				<DialogContent className='sm:max-w-[800px] max-h-[600px]'>
					<DialogHeader>
						<DialogTitle>Đơn hàng của {selectedUser?.name}</DialogTitle>
						<DialogDescription>Danh sách tất cả đơn hàng của người dùng này</DialogDescription>
					</DialogHeader>
					<div className='space-y-4'>
						{isLoadingOrders ? (
							<div className='flex items-center justify-center p-8'>
								<Loader2 className='h-6 w-6 animate-spin' />
								<span className='ml-2'>Đang tải đơn hàng...</span>
							</div>
						) : userOrdersData?.orders && userOrdersData.orders.length > 0 ? (
							<div className='space-y-3 max-h-[400px] overflow-y-auto'>
								{userOrdersData.orders.map((order) => (
									<Card key={order.id} className='p-4'>
										<div className='flex items-center justify-between'>
											<div>
												<p className='font-medium'>Đơn hàng #{order.id.slice(0, 8)}</p>
												<p className='text-sm text-gray-500'>
													{new Date(order.created_at).toLocaleString('vi-VN')}
												</p>
											</div>
											<div className='text-right'>
												<p className='font-semibold'>
													{order.total_amount.toLocaleString('vi-VN')}đ
												</p>
												<Badge variant='outline'>{order.status}</Badge>
											</div>
										</div>
									</Card>
								))}
							</div>
						) : (
							<div className='text-center p-8'>
								<Package className='h-12 w-12 mx-auto mb-4 text-gray-300' />
								<p className='text-gray-500'>Người dùng này chưa có đơn hàng nào</p>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>

			{/* Block User Confirmation Dialog */}
			<AlertDialog open={!!userToBlock} onOpenChange={() => setUserToBlock(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className='flex items-center gap-3'>
							<div className='w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center'>
								<AlertTriangle className='w-6 h-6 text-amber-600' />
							</div>
							{userToBlock?.is_blocked ? 'Bỏ chặn người dùng' : 'Chặn người dùng'}
						</AlertDialogTitle>
						<AlertDialogDescription className='space-y-3 pt-4'>
							<p className='text-base'>
								Bạn có chắc chắn muốn {userToBlock?.is_blocked ? 'bỏ chặn' : 'chặn'} người dùng{' '}
								<span className='font-semibold text-gray-900'>"{userToBlock?.name}"</span>?
							</p>
							{!userToBlock?.is_blocked && (
								<div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
									<p className='text-sm text-amber-700'>
										Người dùng bị chặn sẽ không thể đăng nhập và sử dụng hệ thống.
									</p>
								</div>
							)}
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
								onClick={confirmBlockUser}
								disabled={blockUserMutation.isPending}
								size='lg'
								className={
									userToBlock?.is_blocked
										? 'bg-green-600 hover:bg-green-700'
										: 'bg-red-600 hover:bg-red-700'
								}
							>
								{blockUserMutation.isPending ? (
									<>
										<Loader2 className='w-5 h-5 mr-2 animate-spin' />
										Đang xử lý...
									</>
								) : (
									<>
										{userToBlock?.is_blocked ? (
											<>
												<Shield className='w-5 h-5 mr-2' />
												Bỏ chặn
											</>
										) : (
											<>
												<ShieldOff className='w-5 h-5 mr-2' />
												Chặn người dùng
											</>
										)}
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

export default UsersPage;
