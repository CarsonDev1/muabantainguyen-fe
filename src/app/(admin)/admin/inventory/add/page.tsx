'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { inventoryService } from '@/services/inventory-service';
import productService from '@/services/product-service';
import { toast } from 'react-toastify';

const addInventorySchema = z.object({
	productId: z.string().min(1, 'Vui lòng chọn sản phẩm'),
	secretData: z.string().min(1, 'Vui lòng nhập dữ liệu'),
	notes: z.string().optional(),
	accountExpiresAt: z.string().optional(),
	costPrice: z.number().min(0, 'Giá phải lớn hơn 0').optional(),
	source: z.string().optional(),
});

type AddInventoryForm = z.infer<typeof addInventorySchema>;

export default function AddInventoryPage() {
	const router = useRouter();
	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<AddInventoryForm>({
		resolver: zodResolver(addInventorySchema),
	});

	const { data: products } = useQuery({
		queryKey: ['admin-products'],
		queryFn: () => productService.getAllProducts({ limit: 100 }),
	});

	const addMutation = useMutation({
		mutationFn: inventoryService.addInventoryItem,
		onSuccess: () => {
			toast.success('Đã thêm sản phẩm vào kho thành công');
			router.push('/admin/inventory');
		},
		onError: (error: any) => {
			toast.error('Lỗi khi thêm sản phẩm: ' + error.message);
		},
	});

	const onSubmit = (data: AddInventoryForm) => {
		const payload = {
			...data,
			costPrice: data.costPrice || 0,
			source: data.source || 'admin_manual',
		};
		addMutation.mutate(payload);
	};

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center gap-4'>
				<Link href='/admin/inventory'>
					<Button variant='outline' size='sm'>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Quay lại
					</Button>
				</Link>
				<div>
					<h1 className='text-3xl font-bold'>Thêm sản phẩm vào kho</h1>
					<p className='text-muted-foreground'>Thêm một sản phẩm mới vào kho</p>
				</div>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Package className='w-5 h-5' />
							Thông tin sản phẩm
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						{/* Product Selection */}
						<div className='space-y-2'>
							<Label htmlFor='productId'>Sản phẩm *</Label>
							<select id='productId' className='w-full p-2 border rounded-md' {...register('productId')}>
								<option value=''>Chọn sản phẩm</option>
								{products?.items?.map((product) => (
									<option key={product.id} value={product.id}>
										{product.name} -{' '}
										{new Intl.NumberFormat('vi-VN', {
											style: 'currency',
											currency: 'VND',
										}).format(product.price)}
									</option>
								))}
							</select>
							{errors.productId && <p className='text-sm text-red-600'>{errors.productId.message}</p>}
						</div>

						{/* Secret Data */}
						<div className='space-y-2'>
							<Label htmlFor='secretData'>Dữ liệu sản phẩm *</Label>
							<Textarea
								id='secretData'
								placeholder='Nhập thông tin chi tiết của sản phẩm (tài khoản, mật khẩu, v.v.)'
								className='min-h-[100px]'
								{...register('secretData')}
							/>
							{errors.secretData && <p className='text-sm text-red-600'>{errors.secretData.message}</p>}
						</div>

						{/* Notes */}
						<div className='space-y-2'>
							<Label htmlFor='notes'>Ghi chú</Label>
							<Textarea id='notes' placeholder='Ghi chú thêm về sản phẩm' {...register('notes')} />
						</div>

						{/* Account Expires At */}
						<div className='space-y-2'>
							<Label htmlFor='accountExpiresAt'>Ngày hết hạn</Label>
							<Input id='accountExpiresAt' type='datetime-local' {...register('accountExpiresAt')} />
						</div>

						{/* Cost Price */}
						<div className='space-y-2'>
							<Label htmlFor='costPrice'>Giá gốc (VND)</Label>
							<Input
								id='costPrice'
								type='number'
								placeholder='0'
								{...register('costPrice', { valueAsNumber: true })}
							/>
							{errors.costPrice && <p className='text-sm text-red-600'>{errors.costPrice.message}</p>}
						</div>

						{/* Source */}
						<div className='space-y-2'>
							<Label htmlFor='source'>Nguồn gốc</Label>
							<Input id='source' placeholder='admin_manual' {...register('source')} />
						</div>
					</CardContent>
				</Card>

				{/* Submit Button */}
				<div className='flex justify-end gap-4'>
					<Link href='/admin/inventory'>
						<Button type='button' variant='outline'>
							Hủy
						</Button>
					</Link>
					<Button type='submit' disabled={addMutation.isPending}>
						<Save className='w-4 h-4 mr-2' />
						{addMutation.isPending ? 'Đang thêm...' : 'Thêm vào kho'}
					</Button>
				</div>
			</form>
		</div>
	);
}
