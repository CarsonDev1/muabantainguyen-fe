'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import * as z from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { productsService, type CreateProductRequest } from '@/services/product-service';
import { type UploadedImage } from '@/services/upload-service';
import ProductFormBasicInfo from '@/app/(admin)/admin/products/components/product-info';
import ProductFormPricing from '@/app/(admin)/admin/products/components/product-pricing';
import ProductFormImages from '@/app/(admin)/admin/products/components/product-images';
import ProductFormSidebar from '@/app/(admin)/admin/products/components/product-preview';

// Validation schema
const productSchema: any = z.object({
	name: z.string().min(1, 'Tên sản phẩm là bắt buộc').min(3, 'Tên sản phẩm phải có ít nhất 3 ký tự'),
	slug: z
		.string()
		.min(1, 'Slug là bắt buộc')
		.regex(/^[a-z0-9-]+$/, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang')
		.min(3, 'Slug phải có ít nhất 3 ký tự'),
	description: z.string().min(1, 'Mô tả là bắt buộc').min(10, 'Mô tả phải có ít nhất 10 ký tự'),
	price: z.coerce
		.number()
		.min(0, 'Giá phải lớn hơn hoặc bằng 0')
		.max(999999999, 'Giá không được vượt quá 999,999,999'),
	stock: z.coerce
		.number()
		.int('Số lượng kho phải là số nguyên')
		.min(0, 'Số lượng kho phải lớn hơn hoặc bằng 0')
		.max(999999, 'Số lượng kho không được vượt quá 999,999'),
	imageUrl: z.string().url('URL hình ảnh không hợp lệ').optional().or(z.literal('')),
	categoryId: z.string().min(1, 'Danh mục là bắt buộc'),
});

type ProductFormData = z.infer<typeof productSchema>;

const CreateProductPage = () => {
	const router = useRouter();
	const queryClient = useQueryClient();

	// Form states
	const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [manualImageUrl, setManualImageUrl] = useState('');
	const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

	const form: any = useForm<ProductFormData>({
		resolver: zodResolver(productSchema),
		defaultValues: {
			name: '',
			slug: '',
			description: '',
			price: 0,
			stock: 0,
			imageUrl: '',
			categoryId: '',
		},
	});

	// Mutations
	const createProductMutation = useMutation({
		mutationFn: (data: CreateProductRequest) => productsService.createProduct(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['products'] });
			toast.success('Tạo sản phẩm thành công!');
			router.push('/admin/products');
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Có lỗi xảy ra khi tạo sản phẩm');
		},
	});

	// Event handlers
	const generateSlug = (name: string) => {
		setIsGeneratingSlug(true);
		const slug = name
			.toLowerCase()
			.trim()
			.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
			.replace(/[èéẹẻẽêềếệểễ]/g, 'e')
			.replace(/[ìíịỉĩ]/g, 'i')
			.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
			.replace(/[ùúụủũưừứựửữ]/g, 'u')
			.replace(/[ỳýỵỷỹ]/g, 'y')
			.replace(/đ/g, 'd')
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '');

		form.setValue('slug', slug);
		setIsGeneratingSlug(false);
	};

	const handleCancel = () => {
		router.back();
	};

	const onSubmit = (data: ProductFormData) => {
		createProductMutation.mutate(data);
	};

	// Utility functions
	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(price);
	};

	// Watch form values
	const watchedPrice = form.watch('price');
	const watchedStock = form.watch('stock');
	const watchedName = form.watch('name');
	const watchedImageUrl = form.watch('imageUrl');

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center gap-4'>
				<Button variant='outline' size='sm' onClick={() => router.back()} className='h-9 w-9 p-0'>
					<ArrowLeft className='h-4 w-4' />
				</Button>
				<div>
					<h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
						Thêm sản phẩm mới
					</h1>
					<p className='text-gray-600 mt-2'>Tạo sản phẩm mới cho cửa hàng của bạn</p>
				</div>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
						{/* Main Content */}
						<div className='lg:col-span-2 space-y-6'>
							{/* Basic Information */}
							<ProductFormBasicInfo
								form={form}
								isGeneratingSlug={isGeneratingSlug}
								onGenerateSlug={generateSlug}
								watchedName={watchedName}
							/>

							{/* Pricing & Inventory */}
							<ProductFormPricing form={form} />

							{/* Product Images */}
							<ProductFormImages
								form={form}
								uploadedImages={uploadedImages}
								setUploadedImages={setUploadedImages}
								isUploading={isUploading}
								setIsUploading={setIsUploading}
								uploadProgress={uploadProgress}
								setUploadProgress={setUploadProgress}
								manualImageUrl={manualImageUrl}
								setManualImageUrl={setManualImageUrl}
								watchedImageUrl={watchedImageUrl}
							/>
						</div>

						{/* Sidebar */}
						<ProductFormSidebar
							isCreating={createProductMutation.isPending}
							isLoadingCategories={false} // This will be handled in BasicInfo component
							categoriesError={null} // This will be handled in BasicInfo component
							onCancel={handleCancel}
							watchedName={watchedName}
							watchedPrice={watchedPrice}
							watchedStock={watchedStock}
							watchedImageUrl={watchedImageUrl}
							uploadedImages={uploadedImages}
							formatPrice={formatPrice}
						/>
					</div>
				</form>
			</Form>
		</div>
	);
};

export default CreateProductPage;
