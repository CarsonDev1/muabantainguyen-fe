'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminFAQs, createFAQ, updateFAQ, deleteFAQ, type FAQ, type CreateFAQData } from '@/services/faq-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
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
import { Plus, HelpCircle, Edit, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function AdminFAQsPage() {
	const queryClient = useQueryClient();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);

	// Form states
	const [createForm, setCreateForm] = useState<CreateFAQData>({
		question: '',
		answer: '',
		is_active: true,
	});

	const [editForm, setEditForm] = useState<CreateFAQData>({
		question: '',
		answer: '',
		is_active: true,
	});

	const { data: faqsData, isLoading: faqsLoading } = useQuery({
		queryKey: ['admin-faqs'],
		queryFn: getAdminFAQs,
	});

	const createFAQMutation = useMutation({
		mutationFn: createFAQ,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
			setIsCreateDialogOpen(false);
			setCreateForm({ question: '', answer: '', is_active: true });
			toast.success('Tạo FAQ thành công!');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
		},
	});

	const updateFAQMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: CreateFAQData }) => updateFAQ(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
			setIsEditDialogOpen(false);
			setSelectedFAQ(null);
			toast.success('Cập nhật FAQ thành công!');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
		},
	});

	const deleteFAQMutation = useMutation({
		mutationFn: deleteFAQ,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
			toast.success('Xóa FAQ thành công!');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
		},
	});

	const handleCreateFAQ = (e: React.FormEvent) => {
		e.preventDefault();
		if (!createForm.question || !createForm.answer) {
			toast.error('Vui lòng điền đầy đủ thông tin!');
			return;
		}
		createFAQMutation.mutate(createForm);
	};

	const handleUpdateFAQ = (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedFAQ || !editForm.question || !editForm.answer) return;
		updateFAQMutation.mutate({ id: selectedFAQ.id, data: editForm });
	};

	const openEditDialog = (faq: FAQ) => {
		setSelectedFAQ(faq);
		setEditForm({
			question: faq.question,
			answer: faq.answer,
			is_active: faq.is_active,
		});
		setIsEditDialogOpen(true);
	};

	const handleDeleteFAQ = (id: number) => {
		deleteFAQMutation.mutate(id);
	};

	if (faqsLoading) {
		return <div className='flex items-center justify-center h-64'>Đang tải...</div>;
	}

	const faqs = faqsData?.faqs || [];

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<h1 className='text-3xl font-bold'>Quản lý FAQ</h1>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className='w-4 h-4 mr-2' />
							Tạo FAQ
						</Button>
					</DialogTrigger>
					<DialogContent className='sm:max-w-[600px]'>
						<DialogHeader>
							<DialogTitle>Tạo FAQ mới</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleCreateFAQ} className='space-y-4'>
							<div>
								<Label htmlFor='question'>Câu hỏi *</Label>
								<Input
									id='question'
									required
									value={createForm.question}
									onChange={(e) => setCreateForm({ ...createForm, question: e.target.value })}
									placeholder='Nhập câu hỏi...'
								/>
							</div>
							<div>
								<Label htmlFor='answer'>Câu trả lời *</Label>
								<Textarea
									id='answer'
									required
									rows={6}
									value={createForm.answer}
									onChange={(e) => setCreateForm({ ...createForm, answer: e.target.value })}
									placeholder='Nhập câu trả lời...'
								/>
							</div>
							<div className='flex items-center space-x-2'>
								<Checkbox
									id='is_active'
									checked={createForm.is_active}
									onCheckedChange={(checked) =>
										setCreateForm({ ...createForm, is_active: !!checked })
									}
								/>
								<Label htmlFor='is_active'>Hiển thị công khai</Label>
							</div>
							<div className='flex justify-end space-x-2'>
								<Button type='button' variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
									Hủy
								</Button>
								<Button type='submit' disabled={createFAQMutation.isPending}>
									{createFAQMutation.isPending ? 'Đang tạo...' : 'Tạo FAQ'}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className='flex items-center'>
						<HelpCircle className='w-5 h-5 mr-2' />
						Danh sách FAQ ({faqs.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='rounded-md border'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>ID</TableHead>
									<TableHead>Câu hỏi</TableHead>
									<TableHead>Câu trả lời</TableHead>
									<TableHead>Hành động</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{faqs.map((faq) => (
									<TableRow key={faq.id}>
										<TableCell className='font-medium'>#{faq.id}</TableCell>
										<TableCell className='max-w-xs'>
											<div className='truncate' title={faq.question}>
												{faq.question}
											</div>
										</TableCell>
										<TableCell className='max-w-xs'>
											<div className='truncate' title={faq.answer}>
												{faq.answer}
											</div>
										</TableCell>
										<TableCell>
											<div className='flex items-center space-x-2'>
												<Button variant='outline' size='sm' onClick={() => openEditDialog(faq)}>
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
															<AlertDialogTitle>Xác nhận xóa FAQ</AlertDialogTitle>
															<AlertDialogDescription>
																Bạn có chắc chắn muốn xóa FAQ này? Hành động này không
																thể hoàn tác.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Hủy</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleDeleteFAQ(faq.id)}
																disabled={deleteFAQMutation.isPending}
															>
																{deleteFAQMutation.isPending ? 'Đang xóa...' : 'Xóa'}
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

			{/* Edit FAQ Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className='sm:max-w-[600px]'>
					<DialogHeader>
						<DialogTitle>Chỉnh sửa FAQ</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleUpdateFAQ} className='space-y-4'>
						<div>
							<Label htmlFor='edit-question'>Câu hỏi *</Label>
							<Input
								id='edit-question'
								required
								value={editForm.question}
								onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
								placeholder='Nhập câu hỏi...'
							/>
						</div>
						<div>
							<Label htmlFor='edit-answer'>Câu trả lời *</Label>
							<Textarea
								id='edit-answer'
								required
								rows={6}
								value={editForm.answer}
								onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
								placeholder='Nhập câu trả lời...'
							/>
						</div>
						<div className='flex items-center space-x-2'>
							<Checkbox
								id='edit-is_active'
								checked={editForm.is_active}
								onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: !!checked })}
							/>
							<Label htmlFor='edit-is_active'>Hiển thị công khai</Label>
						</div>
						<div className='flex justify-end space-x-2'>
							<Button type='button' variant='outline' onClick={() => setIsEditDialogOpen(false)}>
								Hủy
							</Button>
							<Button type='submit' disabled={updateFAQMutation.isPending}>
								{updateFAQMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
