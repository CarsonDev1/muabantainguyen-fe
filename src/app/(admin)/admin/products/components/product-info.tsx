'use client';

import React, { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Package, Hash, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { categoriesService } from '@/services/categories-service';
import ReactQuill from 'react-quill';

interface ProductFormData {
	name: string;
	slug: string;
	description: string;
	price: number;
	stock: number;
	imageUrl: string;
	categoryId: string;
}

interface ProductFormBasicInfoProps {
	form: UseFormReturn<ProductFormData>;
	isGeneratingSlug: boolean;
	onGenerateSlug: (name: string) => void;
	watchedName: string;
}

const ProductFormBasicInfo: React.FC<ProductFormBasicInfoProps> = ({
	form,
	isGeneratingSlug,
	onGenerateSlug,
	watchedName,
}) => {
	// Fetch categories from API
	const {
		data: categoriesData,
		isLoading: isLoadingCategories,
		error: categoriesError,
	} = useQuery({
		queryKey: ['product-categories'],
		queryFn: categoriesService.getProductCategories,
		staleTime: 5 * 60 * 1000,
		retry: 2,
	});

	const categories = categoriesData?.categories || [];

	// React Quill configuration with full options
	const quillModules = useMemo(
		() => ({
			toolbar: {
				container: [
					[{ header: [1, 2, 3, 4, 5, 6, false] }],
					[{ font: [] }],
					[{ size: ['small', false, 'large', 'huge'] }],
					['bold', 'italic', 'underline', 'strike'],
					[{ color: [] }, { background: [] }],
					[{ script: 'sub' }, { script: 'super' }],
					['blockquote', 'code-block'],
					[{ list: 'ordered' }, { list: 'bullet' }],
					[{ indent: '-1' }, { indent: '+1' }],
					[{ direction: 'rtl' }],
					[{ align: [] }],
					['link', 'image', 'video'],
					['clean'],
				],
			},
			clipboard: {
				matchVisual: false,
			},
			history: {
				delay: 2000,
				maxStack: 500,
				userOnly: true,
			},
		}),
		[]
	);

	const quillFormats = [
		'header',
		'font',
		'size',
		'bold',
		'italic',
		'underline',
		'strike',
		'color',
		'background',
		'script',
		'blockquote',
		'code-block',
		'list',
		'bullet',
		'indent',
		'direction',
		'align',
		'link',
		'image',
		'video',
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Package className='h-5 w-5' />
					Thông tin cơ bản
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				<FormField
					control={form.control}
					name='name'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tên sản phẩm *</FormLabel>
							<FormControl>
								<Input placeholder='Nhập tên sản phẩm...' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='slug'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Slug *</FormLabel>
							<div className='flex gap-2'>
								<FormControl>
									<Input placeholder='ten-san-pham' {...field} />
								</FormControl>
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={() => onGenerateSlug(watchedName)}
									disabled={!watchedName || isGeneratingSlug}
									className='whitespace-nowrap'
								>
									{isGeneratingSlug ? (
										<Loader2 className='h-4 w-4 animate-spin' />
									) : (
										<>
											<Hash className='h-4 w-4 mr-1' />
											Tạo slug
										</>
									)}
								</Button>
							</div>
							<FormDescription>
								URL thân thiện cho sản phẩm (chỉ chữ thường, số và dấu gạch ngang)
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='description'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Mô tả *</FormLabel>
							<FormControl>
								<div className='min-h-[200px]'>
									<ReactQuill
										theme='snow'
										value={field.value || ''}
										onChange={field.onChange}
										modules={quillModules}
										formats={quillFormats}
										placeholder='Nhập mô tả chi tiết về sản phẩm...'
										style={{ height: '140px', marginBottom: '42px' }}
									/>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='categoryId'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Danh mục *</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue
											placeholder={
												isLoadingCategories
													? 'Đang tải danh mục...'
													: categoriesError
													? 'Lỗi tải danh mục'
													: 'Chọn danh mục sản phẩm'
											}
										/>
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{isLoadingCategories ? (
										<SelectItem value='loading' disabled>
											<div className='flex items-center gap-2'>
												<Loader2 className='h-4 w-4 animate-spin' />
												Đang tải...
											</div>
										</SelectItem>
									) : categoriesError ? (
										<SelectItem value='error' disabled>
											<div className='flex items-center gap-2 text-red-500'>
												<X className='h-4 w-4' />
												Lỗi tải danh mục
											</div>
										</SelectItem>
									) : categories.length === 0 ? (
										<SelectItem value='empty' disabled>
											Không có danh mục nào
										</SelectItem>
									) : (
										categories.map((category) => (
											<SelectItem key={category.id} value={category.id}>
												{category.name}
											</SelectItem>
										))
									)}
								</SelectContent>
							</Select>
							{categoriesError && (
								<FormDescription className='text-red-500'>
									Không thể tải danh mục. Vui lòng thử lại sau.
								</FormDescription>
							)}
							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	);
};

export default ProductFormBasicInfo;
