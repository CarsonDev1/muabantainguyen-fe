'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Bell, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
	getAdminAnnouncements,
	createAnnouncement,
	updateAnnouncement,
	deleteAnnouncement,
	Announcement,
	CreateAnnouncementData,
	UpdateAnnouncementData,
	uploadAnnouncementImage,
} from '@/services/announcement-service';

export default function AdminAnnouncementsPage() {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
	const [createForm, setCreateForm] = useState<CreateAnnouncementData>({
		title: '',
		content: '',
		image: '',
		is_active: true,
	});
	const [editForm, setEditForm] = useState<UpdateAnnouncementData>({});
	const [isUploading, setIsUploading] = useState(false);

	const queryClient = useQueryClient();

	const { data: announcements = [], isLoading } = useQuery({
		queryKey: ['admin-announcements'],
		queryFn: getAdminAnnouncements,
	});

	const createMutation = useMutation({
		mutationFn: createAnnouncement,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
			setIsCreateDialogOpen(false);
			setCreateForm({ title: '', content: '', image: '', is_active: true });
			toast.success('Tạo thông báo thành công');
		},
		onError: () => {
			toast.error('Tạo thông báo thất bại');
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateAnnouncementData }) => updateAnnouncement(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
			setIsEditDialogOpen(false);
			setEditingAnnouncement(null);
			setEditForm({});
			toast.success('Cập nhật thông báo thành công');
		},
		onError: () => {
			toast.error('Cập nhật thông báo thất bại');
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteAnnouncement,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
			toast.success('Xóa thông báo thành công');
		},
		onError: () => {
			toast.error('Xóa thông báo thất bại');
		},
	});

	const handleImageUpload = async (file: File, formType: 'create' | 'edit') => {
		if (!file) return;

		setIsUploading(true);
		try {
			const imageUrl = await uploadAnnouncementImage(file);

			if (formType === 'create') {
				setCreateForm((prev) => ({ ...prev, image: imageUrl }));
			} else {
				setEditForm((prev) => ({ ...prev, image: imageUrl }));
			}

			toast.success('Upload ảnh thành công');
		} catch (error) {
			toast.error('Upload ảnh thất bại');
		} finally {
			setIsUploading(false);
		}
	};

	const handleCreate = () => {
		if (!createForm.title || !createForm.content) {
			toast.error('Vui lòng điền đầy đủ thông tin');
			return;
		}
		createMutation.mutate(createForm);
	};

	const handleEdit = (announcement: Announcement) => {
		setEditingAnnouncement(announcement);
		setEditForm({
			title: announcement.title,
			content: announcement.content,
			image: announcement.image || '',
			is_active: announcement.is_active,
		});
		setIsEditDialogOpen(true);
	};

	const handleUpdate = () => {
		if (!editingAnnouncement) return;
		if (!editForm.title || !editForm.content) {
			toast.error('Vui lòng điền đầy đủ thông tin');
			return;
		}
		updateMutation.mutate({ id: editingAnnouncement.id, data: editForm });
	};

	const handleDelete = (id: number) => {
		deleteMutation.mutate(id);
	};

	if (isLoading) {
		return <div className='flex items-center justify-center h-64'>Đang tải...</div>;
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<h1 className='text-3xl font-bold'>Quản lý Thông báo</h1>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className='w-4 h-4 mr-2' />
							Tạo thông báo
						</Button>
					</DialogTrigger>
					<DialogContent className='max-w-2xl'>
						<DialogHeader>
							<DialogTitle>Tạo thông báo mới</DialogTitle>
						</DialogHeader>
						<div className='space-y-4'>
							<div>
								<Label htmlFor='title'>Tiêu đề</Label>
								<Input
									id='title'
									value={createForm.title}
									onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
									placeholder='Nhập tiêu đề thông báo'
								/>
							</div>
							<div>
								<Label htmlFor='content'>Nội dung</Label>
								<Textarea
									id='content'
									value={createForm.content}
									onChange={(e) => setCreateForm((prev) => ({ ...prev, content: e.target.value }))}
									placeholder='Nhập nội dung thông báo'
									rows={4}
								/>
							</div>
							<div>
								<Label htmlFor='image'>Hình ảnh</Label>
								<div className='flex items-center space-x-2'>
									<Input
										id='image'
										type='file'
										accept='image/*'
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) handleImageUpload(file, 'create');
										}}
										disabled={isUploading}
									/>
									{createForm.image && (
										<div className='flex items-center space-x-2'>
											<ImageIcon className='w-4 h-4 text-green-500' />
											<span className='text-sm text-green-600'>Đã upload</span>
										</div>
									)}
								</div>
								{createForm.image && (
									<div className='mt-2'>
										<img
											src={createForm.image}
											alt='Preview'
											className='w-32 h-20 object-cover rounded'
										/>
									</div>
								)}
							</div>
							<div className='flex items-center space-x-2'>
								<Switch
									id='is_active'
									checked={createForm.is_active}
									onCheckedChange={(checked) =>
										setCreateForm((prev) => ({ ...prev, is_active: checked }))
									}
								/>
								<Label htmlFor='is_active'>Kích hoạt</Label>
							</div>
							<div className='flex justify-end space-x-2'>
								<Button variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
									Hủy
								</Button>
								<Button onClick={handleCreate} disabled={createMutation.isPending}>
									Tạo
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className='flex items-center'>
						<Bell className='w-5 h-5 mr-2' />
						Danh sách Thông báo ({announcements.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='rounded-md border'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Tiêu đề</TableHead>
									<TableHead>Hình ảnh</TableHead>
									<TableHead>Nội dung</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead>Ngày tạo</TableHead>
									<TableHead>Hành động</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{announcements.map((announcement) => (
									<TableRow key={announcement.id}>
										<TableCell className='font-medium'>{announcement.title}</TableCell>
										<TableCell>
											{announcement.image ? (
												<img
													src={announcement.image}
													alt={announcement.title}
													className='w-16 h-12 object-cover rounded'
												/>
											) : (
												<span className='text-gray-400'>Không có ảnh</span>
											)}
										</TableCell>
										<TableCell className='max-w-xs truncate'>{announcement.content}</TableCell>
										<TableCell>
											{announcement.is_active ? (
												<Badge variant='default'>Kích hoạt</Badge>
											) : (
												<Badge variant='secondary'>Tắt</Badge>
											)}
										</TableCell>
										<TableCell>
											{new Date(announcement.created_at).toLocaleDateString('vi-VN')}
										</TableCell>
										<TableCell>
											<div className='flex space-x-2'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleEdit(announcement)}
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
															<AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
															<AlertDialogDescription>
																Bạn có chắc chắn muốn xóa thông báo này? Hành động này
																không thể hoàn tác.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Hủy</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleDelete(announcement.id)}
															>
																Xóa
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

					{announcements.length === 0 && (
						<div className='text-center py-8 text-gray-500'>Không có thông báo nào</div>
					)}
				</CardContent>
			</Card>

			{/* Edit Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className='max-w-2xl'>
					<DialogHeader>
						<DialogTitle>Chỉnh sửa thông báo</DialogTitle>
					</DialogHeader>
					<div className='space-y-4'>
						<div>
							<Label htmlFor='edit-title'>Tiêu đề</Label>
							<Input
								id='edit-title'
								value={editForm.title || ''}
								onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
								placeholder='Nhập tiêu đề thông báo'
							/>
						</div>
						<div>
							<Label htmlFor='edit-content'>Nội dung</Label>
							<Textarea
								id='edit-content'
								value={editForm.content || ''}
								onChange={(e) => setEditForm((prev) => ({ ...prev, content: e.target.value }))}
								placeholder='Nhập nội dung thông báo'
								rows={4}
							/>
						</div>
						<div>
							<Label htmlFor='edit-image'>Hình ảnh</Label>
							<div className='flex items-center space-x-2'>
								<Input
									id='edit-image'
									type='file'
									accept='image/*'
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) handleImageUpload(file, 'edit');
									}}
									disabled={isUploading}
								/>
								{editForm.image && (
									<div className='flex items-center space-x-2'>
										<ImageIcon className='w-4 h-4 text-green-500' />
										<span className='text-sm text-green-600'>Đã upload</span>
									</div>
								)}
							</div>
							{editForm.image && (
								<div className='mt-2'>
									<img
										src={editForm.image}
										alt='Preview'
										className='w-32 h-20 object-cover rounded'
									/>
								</div>
							)}
						</div>
						<div className='flex items-center space-x-2'>
							<Switch
								id='edit-is_active'
								checked={editForm.is_active || false}
								onCheckedChange={(checked) => setEditForm((prev) => ({ ...prev, is_active: checked }))}
							/>
							<Label htmlFor='edit-is_active'>Kích hoạt</Label>
						</div>
						<div className='flex justify-end space-x-2'>
							<Button variant='outline' onClick={() => setIsEditDialogOpen(false)}>
								Hủy
							</Button>
							<Button onClick={handleUpdate} disabled={updateMutation.isPending}>
								Cập nhật
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
