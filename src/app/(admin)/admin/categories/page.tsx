'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
	Plus,
	Loader2,
	ChevronRight,
	ChevronDown,
	Folder,
	FolderOpen,
	Edit,
	Trash2,
	AlertTriangle,
} from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import categoryService, {
	type Category,
	type CreateCategoryRequest,
	type UpdateCategoryRequest,
} from '@/services/category-service';
import { CategoryImageUpload } from './components/category-image-upload';

const CategoriesPage = () => {
	const queryClient = useQueryClient();
	const [createOpen, setCreateOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

	const [formData, setFormData] = useState<CreateCategoryRequest>({
		name: '',
		slug: '',
		parentId: undefined,
		image: undefined,
	});

	const [editFormData, setEditFormData] = useState<UpdateCategoryRequest>({
		name: '',
		slug: '',
		parentId: undefined,
		image: undefined,
	});

	// Get categories query
	const {
		data: categoriesData,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ['categories', 'tree'],
		queryFn: categoryService.getCategoryTree,
		staleTime: 5 * 60 * 1000,
	});

	// Create category mutation
	const createMutation = useMutation({
		mutationFn: categoryService.createCategory,
		onSuccess: () => {
			toast.success('Tạo danh mục thành công');
			setCreateOpen(false);
			resetForm();
			queryClient.invalidateQueries({ queryKey: ['categories'] });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Tạo danh mục thất bại');
		},
	});

	// Update category mutation
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
			categoryService.updateCategory(id, data),
		onSuccess: () => {
			toast.success('Cập nhật danh mục thành công');
			setEditOpen(false);
			queryClient.invalidateQueries({ queryKey: ['categories'] });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Cập nhật danh mục thất bại');
		},
	});

	// Delete category mutation
	const deleteMutation = useMutation({
		mutationFn: categoryService.deleteCategory,
		onSuccess: () => {
			toast.success('Xóa danh mục thành công');
			setDeleteOpen(false);
			setSelectedCategory(null);
			queryClient.invalidateQueries({ queryKey: ['categories'] });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Xóa danh mục thất bại');
		},
	});

	const resetForm = () => {
		setFormData({
			name: '',
			slug: '',
			parentId: undefined,
			image: undefined,
		});
	};

	// Auto-generate slug from name
	const generateSlug = (name: string) => {
		return name
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '') // Remove diacritics
			.replace(/[đ]/g, 'd')
			.replace(/[^a-z0-9 ]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim();
	};

	// Populate edit form when opening edit dialog
	useEffect(() => {
		if (editOpen && selectedCategory) {
			setEditFormData({
				name: selectedCategory.name,
				slug: selectedCategory.slug || '',
				parentId: selectedCategory.parentId || undefined,
				image: selectedCategory.image || undefined,
			});
		}
	}, [editOpen, selectedCategory]);

	const handleNameChange = (name: string, isEdit = false) => {
		const slug = generateSlug(name);
		if (isEdit) {
			setEditFormData((prev) => ({ ...prev, name, slug }));
		} else {
			setFormData((prev) => ({ ...prev, name, slug }));
		}
	};

	const toggleExpand = (category_id: string) => {
		const newExpanded = new Set(expandedCategories);
		if (newExpanded.has(category_id)) {
			newExpanded.delete(category_id);
		} else {
			newExpanded.add(category_id);
		}
		setExpandedCategories(newExpanded);
	};

	const handleCreateSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name.trim() || !formData.slug.trim()) {
			toast.error('Tên và slug không được để trống');
			return;
		}

		const payload = {
			...formData,
			parentId: formData.parentId === 'root' ? undefined : formData.parentId,
		};

		createMutation.mutate(payload);
	};

	const handleEditSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!editFormData.name?.trim() || !selectedCategory) {
			toast.error('Tên không được để trống');
			return;
		}

		const payload = {
			...editFormData,
			parentId: editFormData.parentId === 'root' ? undefined : editFormData.parentId,
		};

		updateMutation.mutate({
			id: selectedCategory.id,
			data: payload,
		});
	};

	const handleEditCategory = () => {
		if (selectedCategory) {
			setEditOpen(true);
		}
	};

	const handleDeleteCategory = () => {
		if (selectedCategory) {
			setDeleteOpen(true);
		}
	};

	const confirmDelete = () => {
		if (selectedCategory) {
			deleteMutation.mutate(selectedCategory.id);
		}
	};

	// Get flat list of categories for parent selection
	const flatCategories = React.useMemo(() => {
		const flatten = (cats: Category[]): Array<Category> => {
			return cats.reduce((acc, cat) => {
				acc.push(cat);
				if (cat.children?.length) {
					acc.push(...flatten(cat.children));
				}
				return acc;
			}, [] as Array<Category>);
		};
		return flatten(categoriesData?.tree || []);
	}, [categoriesData]);

	// Helper function to get parent ID (handles both parentId and parent_id)
	const getParentId = (category: Category): string | null => {
		return category.parentId || category.parent_id || null;
	};

	// Helper function to check if category is root
	const isRootCategory = (category: Category): boolean => {
		const parentId = getParentId(category);
		return !parentId;
	};

	// Get available parent categories for editing (excluding current category and its children)
	const getAvailableParentCategories = (): Array<Category> => {
		if (!selectedCategory) return flatCategories;

		return flatCategories.filter((cat) => cat.id !== selectedCategory.id);
	};

	const renderCategoryTree = (categories: Category[], level = 0) => {
		return categories.map((category) => (
			<div key={category.id} className={`ml-${level * 3}`}>
				<div
					className={`group flex items-center gap-3 p-2 rounded-xl transition-all duration-200 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-sm ${
						selectedCategory?.id === category.id
							? 'bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md border-l-4 border-blue-500'
							: 'hover:shadow-sm'
					}`}
					onClick={() => setSelectedCategory(category)}
				>
					{category.children && category.children.length > 0 ? (
						<button
							onClick={(e) => {
								e.stopPropagation();
								toggleExpand(category.id);
							}}
							className='p-1.5 hover:bg-white/70 rounded-lg transition-colors'
						>
							{expandedCategories.has(category.id) ? (
								<ChevronDown className='w-4 h-4 text-gray-600' />
							) : (
								<ChevronRight className='w-4 h-4 text-gray-600' />
							)}
						</button>
					) : (
						<div className='w-7' />
					)}

					<div className='flex items-center gap-2 flex-1 min-w-0'>
						{expandedCategories.has(category.id) && category.children?.length ? (
							<FolderOpen className='w-5 h-5 text-blue-500 flex-shrink-0' />
						) : (
							<Folder className='w-5 h-5 text-gray-500 flex-shrink-0' />
						)}

						<div className='flex-1 min-w-0'>
							<div className='flex items-center justify-between'>
								<span className='font-medium text-gray-900 truncate'>{category.name}</span>
							</div>
							<p className='text-xs text-gray-500 truncate'>/{category.slug}</p>
						</div>
					</div>
				</div>

				{category.children && category.children.length > 0 && expandedCategories.has(category.id) && (
					<div className='ml-4 mt-1 border-l-2 border-gray-100'>
						{renderCategoryTree(category.children, level + 1)}
					</div>
				)}
			</div>
		));
	};

	if (isLoading) {
		return (
			<div className='space-y-4'>
				<div className='flex items-center justify-between'>
					<h1 className='text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
						Danh mục
					</h1>
					<Button disabled>
						<Loader2 className='h-4 w-4 animate-spin mr-2' />
						Thêm danh mục
					</Button>
				</div>
				<div className='flex items-center justify-center p-8'>
					<Loader2 className='h-8 w-8 animate-spin' />
					<span className='ml-2'>Đang tải danh mục...</span>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className='space-y-4'>
				<div className='flex items-center justify-between'>
					<h1 className='text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
						Danh mục
					</h1>
					<Button onClick={() => setCreateOpen(true)}>Thêm danh mục</Button>
				</div>
				<Card>
					<CardContent className='p-6 text-center'>
						<p className='text-destructive'>Có lỗi xảy ra: {error?.message || 'Không thể tải danh mục'}</p>
						<Button
							variant='outline'
							className='mt-4'
							onClick={() => queryClient.invalidateQueries({ queryKey: ['categories'] })}
						>
							Thử lại
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const categories = categoriesData?.tree || [];

	return (
		<div className='mx-auto'>
			{/* Header */}
			<div className='mb-8'>
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
					<div>
						<h1 className='text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
							Danh mục
						</h1>
						<p className='text-gray-600 mt-2'>Quản lý danh mục và phân loại nội dung</p>
					</div>

					<Button
						size='lg'
						onClick={() => setCreateOpen(true)}
						className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200'
					>
						<Plus className='w-5 h-5 mr-2' />
						<span className='hidden sm:inline'>Tạo Category</span>
						<span className='sm:hidden'>Tạo</span>
					</Button>
				</div>
			</div>

			{/* Content */}
			<div className='grid grid-cols-1 xl:grid-cols-7 gap-6'>
				{/* Left Panel - Category Tree */}
				<div className='xl:col-span-2'>
					<Card className='h-fit sticky top-6 border-slate-200'>
						<CardHeader className='p-4'>
							<div className='flex items-center justify-between'>
								<CardTitle className='flex items-center gap-2'>
									<Folder className='w-5 h-5' />
									Danh mục
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className='p-2'>
							<div className='max-h-[600px] overflow-y-auto space-y-1'>
								{categories.length > 0 ? (
									renderCategoryTree(categories.filter((cat) => isRootCategory(cat)))
								) : (
									<div className='text-center py-4'>
										<div className='bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-dashed border-gray-200 rounded-xl p-8'>
											<Folder className='w-12 h-12 mx-auto mb-4 text-gray-300' />
											<p className='font-medium text-gray-700 mb-2'>Chưa có danh mục nào</p>
											<p className='text-sm text-gray-500 mb-4'>
												Tạo category đầu tiên để bắt đầu
											</p>
											<Button
												variant='outline'
												onClick={() => setCreateOpen(true)}
												className='bg-white hover:bg-blue-50'
											>
												<Plus className='w-4 h-4 mr-2' />
												Tạo category đầu tiên
											</Button>
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right Panel - Category Details */}
				<div className='xl:col-span-5'>
					<Card className='min-h-[600px] border-slate-200'>
						<CardContent className='p-8'>
							{selectedCategory ? (
								<div className='space-y-8'>
									{/* Header */}
									<div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
										<div className='flex-1 min-w-0'>
											<h2 className='text-xl sm:text-3xl font-bold text-gray-900 mb-2 break-words'>
												{selectedCategory.name}
											</h2>
											<div className='flex flex-wrap items-center gap-3'>
												{selectedCategory.slug && (
													<Badge variant='secondary'>/{selectedCategory.slug}</Badge>
												)}
											</div>
										</div>
										<div className='flex items-center gap-3'>
											<Button
												onClick={handleEditCategory}
												size='sm'
												className='bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
											>
												<Edit className='w-4 h-4 mr-2' />
												Chỉnh sửa
											</Button>
											<Button
												onClick={handleDeleteCategory}
												size='sm'
												variant='destructive'
												className='bg-red-500 hover:bg-red-600'
											>
												<Trash2 className='w-4 h-4 mr-2' />
												Xóa
											</Button>
										</div>
									</div>

									<Separator />

									{/* Basic Info */}
									<div className='space-y-4'>
										<div>
											<Label className='text-sm font-medium text-gray-600'>Tên danh mục</Label>
											<p className='font-semibold text-gray-900 mt-1'>{selectedCategory.name}</p>
										</div>
										{selectedCategory.slug && (
											<div>
												<Label className='text-sm font-medium text-gray-600'>URL Slug</Label>
												<code className='block mt-1 px-3 py-2 bg-gray-50 border rounded-lg font-mono text-sm text-gray-800'>
													/{selectedCategory.slug}
												</code>
											</div>
										)}
										{getParentId(selectedCategory) && (
											<div>
												<Label className='text-sm font-medium text-gray-600'>
													Danh mục cha
												</Label>
												<p className='text-gray-800 mt-1'>
													{flatCategories.find(
														(cat) => cat.id === getParentId(selectedCategory)
													)?.name || 'Không xác định'}
												</p>
											</div>
										)}
										{selectedCategory.image && (
											<div>
												<Label className='text-sm font-medium text-gray-600'>Hình ảnh</Label>
												<div className='mt-2'>
													<img
														src={selectedCategory.image}
														alt={selectedCategory.name}
														className='w-24 h-24 object-cover rounded-lg border'
													/>
												</div>
											</div>
										)}
									</div>

									{/* Timestamps */}
									<Separator />
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500'>
										{selectedCategory.createdAt && (
											<div className='flex items-center gap-2'>
												<span className='font-medium'>Ngày tạo:</span>
												<span>
													{new Date(selectedCategory.createdAt).toLocaleDateString('vi-VN', {
														year: 'numeric',
														month: 'long',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit',
													})}
												</span>
											</div>
										)}
										{selectedCategory.updatedAt && (
											<div className='flex items-center gap-2'>
												<span className='font-medium'>Cập nhật:</span>
												<span>
													{new Date(selectedCategory.updatedAt).toLocaleDateString('vi-VN', {
														year: 'numeric',
														month: 'long',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit',
													})}
												</span>
											</div>
										)}
									</div>
								</div>
							) : (
								<div className='flex flex-col items-center justify-center py-20 text-center'>
									<div className='bg-gradient-to-br from-gray-100 to-blue-100 rounded-full p-8 mb-6'>
										<Folder className='w-16 h-16 text-gray-400' />
									</div>
									<h3 className='text-xl font-semibold text-gray-900 mb-2'>Chi tiết danh mục</h3>
									<p className='text-gray-500 max-w-sm'>
										Chọn một danh mục từ danh sách bên trái để xem thông tin chi tiết
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Create Category Dialog */}
			<Dialog open={createOpen} onOpenChange={setCreateOpen}>
				<DialogContent className='sm:max-w-[600px]'>
					<DialogHeader>
						<DialogTitle>Tạo danh mục mới</DialogTitle>
						<DialogDescription>
							Nhập thông tin để tạo danh mục mới. Slug sẽ được tự động tạo từ tên.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleCreateSubmit} className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='name'>Tên danh mục *</Label>
							<Input
								id='name'
								value={formData.name}
								onChange={(e) => handleNameChange(e.target.value)}
								placeholder='Nhập tên danh mục'
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='slug'>Slug *</Label>
							<Input
								id='slug'
								value={formData.slug}
								onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
								placeholder='ten-danh-muc'
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='parent'>Danh mục cha</Label>
							<Select
								value={formData.parentId || 'root'}
								onValueChange={(value) =>
									setFormData((prev) => ({
										...prev,
										parentId: value === 'root' ? undefined : value,
									}))
								}
							>
								<SelectTrigger>
									<SelectValue placeholder='Chọn danh mục cha' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='root'>Danh mục gốc</SelectItem>
									{flatCategories.map((category) => (
										<SelectItem key={category.id} value={category.id}>
											{category.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className='space-y-2'>
							<CategoryImageUpload
								value={formData.image}
								onChange={(imageUrl) => setFormData((prev) => ({ ...prev, image: imageUrl }))}
								disabled={createMutation.isPending}
							/>
						</div>
						<DialogFooter className='gap-3'>
							<Button
								type='button'
								variant='outline'
								onClick={() => setCreateOpen(false)}
								disabled={createMutation.isPending}
							>
								Hủy
							</Button>
							<Button
								type='submit'
								disabled={createMutation.isPending}
								className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
							>
								{createMutation.isPending ? (
									<>
										<Loader2 className='w-4 h-4 animate-spin mr-2' />
										Đang tạo...
									</>
								) : (
									<>
										<Plus className='w-4 mr-2' />
										Tạo danh mục
									</>
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Edit Category Dialog */}
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent className='sm:max-w-[600px]'>
					<DialogHeader>
						<DialogTitle>Chỉnh sửa danh mục</DialogTitle>
						<DialogDescription>Cập nhật thông tin danh mục "{selectedCategory?.name}"</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleEditSubmit} className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='editName'>Tên danh mục *</Label>
							<Input
								id='editName'
								value={editFormData.name}
								onChange={(e) => handleNameChange(e.target.value, true)}
								placeholder='Nhập tên danh mục'
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='editSlug'>Slug *</Label>
							<Input
								id='editSlug'
								value={editFormData.slug}
								onChange={(e) => setEditFormData((prev) => ({ ...prev, slug: e.target.value }))}
								placeholder='ten-danh-muc'
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='editParent'>Danh mục cha</Label>
							<Select
								value={editFormData.parentId || 'root'}
								onValueChange={(value) =>
									setEditFormData((prev) => ({
										...prev,
										parentId: value === 'root' ? undefined : value,
									}))
								}
							>
								<SelectTrigger>
									<SelectValue placeholder='Chọn danh mục cha' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='root'>Danh mục gốc</SelectItem>
									{getAvailableParentCategories().map((category) => (
										<SelectItem key={category.id} value={category.id}>
											{category.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className='space-y-2'>
							<CategoryImageUpload
								value={editFormData.image}
								onChange={(imageUrl) => setEditFormData((prev) => ({ ...prev, image: imageUrl }))}
								disabled={updateMutation.isPending}
							/>
						</div>
						<DialogFooter className='gap-3'>
							<Button
								type='button'
								variant='outline'
								onClick={() => setEditOpen(false)}
								disabled={updateMutation.isPending}
							>
								Hủy
							</Button>
							<Button
								type='submit'
								disabled={updateMutation.isPending}
								className='bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
							>
								{updateMutation.isPending ? (
									<>
										<Loader2 className='w-4 h-4 animate-spin mr-2' />
										Đang cập nhật...
									</>
								) : (
									<>
										<Edit className='w-4 mr-2' />
										Cập nhật
									</>
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className='flex items-center gap-3'>
							<div className='w-12 h-12 rounded-full bg-red-100 flex items-center justify-center'>
								<Trash2 className='w-6 h-6 text-red-600' />
							</div>
							Xác nhận xóa Category
						</AlertDialogTitle>
						<AlertDialogDescription className='space-y-3 pt-4'>
							<p className='text-base'>
								Bạn có chắc chắn muốn xóa category{' '}
								<span className='font-semibold text-gray-900'>"{selectedCategory?.name}"</span>?
							</p>

							<div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
								<div className='flex items-start gap-3'>
									<AlertTriangle className='w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0' />
									<div className='space-y-2'>
										<p className='font-medium text-amber-800'>Lưu ý quan trọng:</p>
										<ul className='text-sm text-amber-700 space-y-1'>
											<li>• Hành động này không thể hoàn tác</li>
											<li>• Tất cả dữ liệu liên quan sẽ bị mất vĩnh viễn</li>
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
								disabled={deleteMutation.isPending}
								size='lg'
								className='bg-red-600 hover:bg-red-700 text-white'
							>
								{deleteMutation.isPending ? (
									<>
										<Loader2 className='w-5 h-5 mr-2 animate-spin' />
										Đang xóa...
									</>
								) : (
									<>
										<Trash2 className='w-5 h-5 mr-2' />
										Xóa Category
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

export default CategoriesPage;
