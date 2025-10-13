'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Package, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { inventoryService } from '@/services/inventory-service';
import productService from '@/services/product-service';
import { toast } from 'react-toastify';

const bulkInventorySchema = z.object({
	productId: z.string().min(1, 'Vui lòng chọn sản phẩm'),
	itemsText: z.string().min(1, 'Vui lòng nhập danh sách sản phẩm'),
	defaultCostPrice: z.number().min(0, 'Giá phải lớn hơn 0').optional(),
	defaultSource: z.string().optional(),
});

type BulkInventoryForm = z.infer<typeof bulkInventorySchema>;

export default function BulkAddInventoryPage() {
	const router = useRouter();
	const [previewItems, setPreviewItems] = useState<string[]>([]);

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
	} = useForm<BulkInventoryForm>({
		resolver: zodResolver(bulkInventorySchema),
	});

	const { data: products } = useQuery({
		queryKey: ['admin-products'],
		queryFn: () => productService.getAllProducts({ limit: 100 }),
	});

	const bulkMutation = useMutation({
		mutationFn: async (data: BulkInventoryForm) => {
			const items = parseBulkText(data.itemsText);
			return inventoryService.bulkAddInventoryItems({
				productId: data.productId,
				items: items.map((item) => ({
					secretData: item,
					costPrice: data.defaultCostPrice || 0,
				})),
				itemsText: data.itemsText,
			});
		},
		onSuccess: (response) => {
			toast.success(`Đã thêm ${response.count} sản phẩm vào kho thành công`);
			router.push('/admin/inventory');
		},
		onError: (error: any) => {
			toast.error('Lỗi khi thêm sản phẩm: ' + error.message);
		},
	});

	const watchedText = watch('itemsText');

	// Parse bulk text for preview
	const parseBulkText = (text: string): string[] => {
		return text
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line.length > 0)
			.slice(0, 50); // Limit to 50 items for preview
	};

	// Update preview when text changes
	React.useEffect(() => {
		if (watchedText) {
			const items = parseBulkText(watchedText);
			setPreviewItems(items);
		} else {
			setPreviewItems([]);
		}
	}, [watchedText]);

	const onSubmit = (data: BulkInventoryForm) => {
		bulkMutation.mutate(data);
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
					<h1 className='text-3xl font-bold'>Thêm sản phẩm hàng loạt</h1>
					<p className='text-muted-foreground'>Thêm nhiều sản phẩm cùng lúc vào kho</p>
				</div>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
					{/* Form */}
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
								<select
									id='productId'
									className='w-full p-2 border rounded-md'
									{...register('productId')}
								>
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

							{/* Default Cost Price */}
							<div className='space-y-2'>
								<Label htmlFor='defaultCostPrice'>Giá gốc mặc định (VND)</Label>
								<input
									id='defaultCostPrice'
									type='number'
									placeholder='0'
									className='w-full p-2 border rounded-md'
									{...register('defaultCostPrice', { valueAsNumber: true })}
								/>
								{errors.defaultCostPrice && (
									<p className='text-sm text-red-600'>{errors.defaultCostPrice.message}</p>
								)}
							</div>

							{/* Default Source */}
							<div className='space-y-2'>
								<Label htmlFor='defaultSource'>Nguồn gốc mặc định</Label>
								<input
									id='defaultSource'
									placeholder='admin_manual'
									className='w-full p-2 border rounded-md'
									{...register('defaultSource')}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Bulk Input */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Upload className='w-5 h-5' />
								Danh sách sản phẩm
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='itemsText'>Dữ liệu sản phẩm *</Label>
								<Textarea
									id='itemsText'
									placeholder='Nhập danh sách sản phẩm, mỗi sản phẩm một dòng&#10;Ví dụ:&#10;user1:pass1&#10;user2:pass2&#10;user3:pass3'
									className='min-h-[200px] font-mono'
									{...register('itemsText')}
								/>
								{errors.itemsText && <p className='text-sm text-red-600'>{errors.itemsText.message}</p>}
							</div>

							{/* Preview */}
							{previewItems.length > 0 && (
								<div className='space-y-2'>
									<Label>Xem trước ({previewItems.length} sản phẩm)</Label>
									<div className='max-h-[150px] overflow-y-auto border rounded-md p-2 bg-gray-50'>
										{previewItems.map((item, index) => (
											<div key={index} className='text-sm font-mono text-gray-700'>
												{item}
											</div>
										))}
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Submit Button */}
				<div className='flex justify-end gap-4'>
					<Link href='/admin/inventory'>
						<Button type='button' variant='outline'>
							Hủy
						</Button>
					</Link>
					<Button type='submit' disabled={bulkMutation.isPending}>
						<Save className='w-4 h-4 mr-2' />
						{bulkMutation.isPending ? 'Đang thêm...' : `Thêm ${previewItems.length} sản phẩm`}
					</Button>
				</div>
			</form>
		</div>
	);
}
