'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getAdmins,
	createAdmin,
	updateAdminRole,
	getRoles,
	type Admin,
	type CreateAdminData,
} from '@/services/admin-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import { Plus, Shield, Edit } from 'lucide-react';
import { formatCurrency } from '@/utils/format-currency';

export default function AdminAdminsPage() {
	const queryClient = useQueryClient();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

	// Form states
	const [createForm, setCreateForm] = useState<CreateAdminData>({
		name: '',
		email: '',
		phone: '',
		password: '',
		adminRoleId: '',
	});

	const [editRoleId, setEditRoleId] = useState('');

	const { data: adminsData, isLoading: adminsLoading } = useQuery({
		queryKey: ['admin-admins'],
		queryFn: getAdmins,
	});

	const { data: rolesData, isLoading: rolesLoading } = useQuery({
		queryKey: ['admin-roles'],
		queryFn: getRoles,
	});

	const createAdminMutation = useMutation({
		mutationFn: createAdmin,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-admins'] });
			setIsCreateDialogOpen(false);
			setCreateForm({ name: '', email: '', phone: '', password: '', adminRoleId: '' });
			toast.success('Tạo admin thành công!');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
		},
	});

	const updateRoleMutation = useMutation({
		mutationFn: ({ adminId, roleId }: { adminId: string; roleId: string }) =>
			updateAdminRole(adminId, { adminRoleId: roleId }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-admins'] });
			setIsEditDialogOpen(false);
			setSelectedAdmin(null);
			toast.success('Cập nhật vai trò thành công!');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
		},
	});

	const handleCreateAdmin = (e: React.FormEvent) => {
		e.preventDefault();
		if (!createForm.email || !createForm.password || !createForm.adminRoleId) {
			toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
			return;
		}
		createAdminMutation.mutate(createForm);
	};

	const handleUpdateRole = (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedAdmin || !editRoleId) return;
		updateRoleMutation.mutate({ adminId: selectedAdmin.id, roleId: editRoleId });
	};

	const openEditDialog = (admin: Admin) => {
		setSelectedAdmin(admin);
		setEditRoleId(admin.admin_role_name);
		setIsEditDialogOpen(true);
	};

	const getRoleBadgeColor = (role: string) => {
		switch (role) {
			case 'super':
				return 'bg-red-100 text-red-800';
			case 'admin':
				return 'bg-blue-100 text-blue-800';
			case 'staff':
				return 'bg-green-100 text-green-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	if (adminsLoading || rolesLoading) {
		return <div className='flex items-center justify-center h-64'>Đang tải...</div>;
	}

	const admins = adminsData?.admins || [];
	const roles = rolesData?.roles || [];

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<h1 className='text-3xl font-bold'>Quản lý Admin</h1>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className='w-4 h-4 mr-2' />
							Tạo Admin
						</Button>
					</DialogTrigger>
					<DialogContent className='sm:max-w-[425px]'>
						<DialogHeader>
							<DialogTitle>Tạo Admin mới</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleCreateAdmin} className='space-y-4'>
							<div>
								<Label htmlFor='name'>Tên (tùy chọn)</Label>
								<Input
									id='name'
									value={createForm.name}
									onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
								/>
							</div>
							<div>
								<Label htmlFor='email'>Email *</Label>
								<Input
									id='email'
									type='email'
									required
									value={createForm.email}
									onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
								/>
							</div>
							<div>
								<Label htmlFor='phone'>Số điện thoại (tùy chọn)</Label>
								<Input
									id='phone'
									value={createForm.phone}
									onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
								/>
							</div>
							<div>
								<Label htmlFor='password'>Mật khẩu *</Label>
								<Input
									id='password'
									type='password'
									required
									value={createForm.password}
									onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
								/>
							</div>
							<div>
								<Label htmlFor='role'>Vai trò *</Label>
								<Select
									value={createForm.adminRoleId}
									onValueChange={(value) => setCreateForm({ ...createForm, adminRoleId: value })}
								>
									<SelectTrigger>
										<SelectValue placeholder='Chọn vai trò' />
									</SelectTrigger>
									<SelectContent>
										{roles.map((role) => (
											<SelectItem key={role.id} value={role.id}>
												{role.display_name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className='flex justify-end space-x-2'>
								<Button type='button' variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
									Hủy
								</Button>
								<Button type='submit' disabled={createAdminMutation.isPending}>
									{createAdminMutation.isPending ? 'Đang tạo...' : 'Tạo Admin'}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className='flex items-center'>
						<Shield className='w-5 h-5 mr-2' />
						Danh sách Admin ({admins.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='rounded-md border'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Tên</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Số điện thoại</TableHead>
									<TableHead>Vai trò</TableHead>
									<TableHead>Quyền</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead>Ngày tạo</TableHead>
									<TableHead>Hành động</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{admins.map((admin) => (
									<TableRow key={admin.id}>
										<TableCell className='font-medium'>{admin.name || 'Chưa cập nhật'}</TableCell>
										<TableCell>{admin.email}</TableCell>
										<TableCell>{admin.phone || 'Chưa cập nhật'}</TableCell>
										<TableCell>
											<Badge className={getRoleBadgeColor(admin.role)}>
												{admin.admin_role_display}
											</Badge>
										</TableCell>
										<TableCell>
											<div className='flex flex-wrap gap-1'>
												{admin.permissions.slice(0, 3).map((permission) => (
													<Badge key={permission} variant='outline' className='text-xs'>
														{permission}
													</Badge>
												))}
												{admin.permissions.length > 3 && (
													<Badge variant='outline' className='text-xs'>
														+{admin.permissions.length - 3}
													</Badge>
												)}
											</div>
										</TableCell>
										<TableCell>
											<Badge variant={admin.is_blocked ? 'destructive' : 'default'}>
												{admin.is_blocked ? 'Bị khóa' : 'Hoạt động'}
											</Badge>
										</TableCell>
										<TableCell>{new Date(admin.created_at).toLocaleDateString('vi-VN')}</TableCell>
										<TableCell>
											<Button variant='outline' size='sm' onClick={() => openEditDialog(admin)}>
												<Edit className='w-4 h-4' />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{/* Edit Role Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Cập nhật vai trò cho {selectedAdmin?.name || selectedAdmin?.email}</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleUpdateRole} className='space-y-4'>
						<div>
							<Label htmlFor='edit-role'>Vai trò</Label>
							<Select value={editRoleId} onValueChange={setEditRoleId}>
								<SelectTrigger>
									<SelectValue placeholder='Chọn vai trò' />
								</SelectTrigger>
								<SelectContent>
									{roles.map((role) => (
										<SelectItem key={role.id} value={role.id}>
											{role.display_name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className='flex justify-end space-x-2'>
							<Button type='button' variant='outline' onClick={() => setIsEditDialogOpen(false)}>
								Hủy
							</Button>
							<Button type='submit' disabled={updateRoleMutation.isPending}>
								{updateRoleMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
