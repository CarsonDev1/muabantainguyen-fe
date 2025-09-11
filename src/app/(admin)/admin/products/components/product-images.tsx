'use client';

import React, { useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Upload, Loader2, Plus, Trash2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { uploadService, type UploadedImage } from '@/services/upload-service';
import { toast } from 'react-toastify';

interface ProductFormData {
	name: string;
	slug: string;
	description: string;
	price: number;
	stock: number;
	imageUrl: string;
	categoryId: string;
}

interface ProductFormImagesProps {
	form: UseFormReturn<ProductFormData>;
	uploadedImages: UploadedImage[];
	setUploadedImages: (images: UploadedImage[]) => void;
	isUploading: boolean;
	setIsUploading: (uploading: boolean) => void;
	uploadProgress: number;
	setUploadProgress: (progress: number) => void;
	manualImageUrl: string;
	setManualImageUrl: (url: string) => void;
	watchedImageUrl: string;
}

const ProductFormImages: React.FC<ProductFormImagesProps> = ({
	form,
	uploadedImages,
	setUploadedImages,
	isUploading,
	setIsUploading,
	uploadProgress,
	setUploadProgress,
	manualImageUrl,
	setManualImageUrl,
	watchedImageUrl,
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Handle file selection
	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files && files.length > 0) {
			handleImageUpload(Array.from(files));
		}
	};

	// Handle drag and drop
	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		const files = event.dataTransfer.files;
		if (files && files.length > 0) {
			handleImageUpload(Array.from(files));
		}
	};

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
	};

	// Upload images
	const handleImageUpload = async (files: File[]) => {
		try {
			setIsUploading(true);
			setUploadProgress(0);

			const result = await uploadService.uploadProductImages(files, {
				onProgress: (progress) => {
					setUploadProgress(progress);
				},
				onSuccess: (result) => {
					const newImages = result.data.images;
					setUploadedImages([...uploadedImages, ...newImages]);

					// Set first image as main image if no image is selected
					if (newImages.length > 0 && !form.getValues('imageUrl')) {
						form.setValue('imageUrl', newImages[0].url);
					}

					toast.success(`Upload thành công ${newImages.length} ảnh!`);
				},
				onError: (error) => {
					toast.error(error);
				},
			});
		} catch (error: any) {
			toast.error(error.message || 'Upload thất bại');
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	// Remove uploaded image
	const removeUploadedImage = (index: number) => {
		const removedImage = uploadedImages[index];
		const newImages = uploadedImages.filter((_, i) => i !== index);
		setUploadedImages(newImages);

		// If removed image was the main image, set new main image
		if (form.getValues('imageUrl') === removedImage.url) {
			if (newImages.length > 0) {
				form.setValue('imageUrl', newImages[0].url);
			} else {
				form.setValue('imageUrl', '');
			}
		}
	};

	// Set main image
	const setAsMainImage = (imageUrl: string) => {
		form.setValue('imageUrl', imageUrl);
		toast.success('Đã đặt làm ảnh chính');
	};

	// Handle manual image URL
	const handleManualImageUrl = () => {
		if (manualImageUrl.trim()) {
			form.setValue('imageUrl', manualImageUrl.trim());
			setManualImageUrl('');
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<ImageIcon className='h-5 w-5' />
					Hình ảnh sản phẩm
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				{/* Upload Area */}
				<div
					className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
						isUploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
					}`}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
				>
					{isUploading ? (
						<div className='space-y-3'>
							<Loader2 className='h-8 w-8 mx-auto animate-spin text-blue-500' />
							<p className='text-blue-600 font-medium'>Đang upload...</p>
							<Progress value={uploadProgress} className='w-full max-w-xs mx-auto' />
							<p className='text-sm text-blue-500'>{uploadProgress}%</p>
						</div>
					) : (
						<div className='space-y-3'>
							<Upload className='h-8 w-8 mx-auto text-gray-400' />
							<div>
								<p className='text-gray-600 font-medium'>
									Kéo thả ảnh vào đây hoặc{' '}
									<button
										type='button'
										className='text-blue-500 hover:text-blue-600 underline'
										onClick={() => fileInputRef.current?.click()}
									>
										chọn file
									</button>
								</p>
								<p className='text-sm text-gray-400 mt-1'>
									Hỗ trợ: JPG, PNG, GIF (Tối đa 5 ảnh, mỗi ảnh 10MB)
								</p>
							</div>
						</div>
					)}
				</div>

				{/* Hidden File Input */}
				<input
					ref={fileInputRef}
					type='file'
					multiple
					accept='image/*'
					onChange={handleFileSelect}
					className='hidden'
				/>

				{/* Uploaded Images */}
				{uploadedImages.length > 0 && (
					<div className='space-y-3'>
						<Label className='text-sm font-medium'>Ảnh đã upload ({uploadedImages.length})</Label>
						<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
							{uploadedImages.map((image, index) => (
								<div key={index} className='relative group'>
									<div
										className={`border-2 rounded-lg overflow-hidden ${
											watchedImageUrl === image.url
												? 'border-blue-500 ring-2 ring-blue-200'
												: 'border-gray-200'
										}`}
									>
										<img
											src={image.url}
											alt={image.originalName}
											className='w-full h-24 object-cover'
										/>
									</div>

									{/* Image Actions */}
									<div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1'>
										{watchedImageUrl !== image.url && (
											<Button
												type='button'
												size='sm'
												variant='secondary'
												className='h-7 px-2 text-xs'
												onClick={() => setAsMainImage(image.url)}
											>
												Chọn chính
											</Button>
										)}
										<Button
											type='button'
											size='sm'
											variant='destructive'
											className='h-7 w-7 p-0'
											onClick={() => removeUploadedImage(index)}
										>
											<Trash2 className='h-3 w-3' />
										</Button>
									</div>

									{/* Main Image Badge */}
									{watchedImageUrl === image.url && (
										<Badge className='absolute top-1 left-1 text-xs bg-blue-500'>Chính</Badge>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Manual URL Input */}
				<div className='space-y-2'>
					<Label className='text-sm font-medium'>Hoặc nhập URL ảnh</Label>
					<div className='flex gap-2'>
						<Input
							placeholder='https://example.com/image.jpg'
							value={manualImageUrl}
							onChange={(e) => setManualImageUrl(e.target.value)}
						/>
						<Button
							type='button'
							variant='outline'
							onClick={handleManualImageUrl}
							disabled={!manualImageUrl.trim()}
						>
							<Plus className='h-4 w-4 mr-1' />
							Thêm
						</Button>
					</div>
				</div>

				{/* Current Main Image */}
				{watchedImageUrl && (
					<FormField
						control={form.control}
						name='imageUrl'
						render={({ field }) => (
							<FormItem>
								<FormLabel>URL ảnh chính</FormLabel>
								<FormControl>
									<Input {...field} readOnly className='bg-gray-50' />
								</FormControl>
								<FormDescription>Ảnh này sẽ được hiển thị làm ảnh chính của sản phẩm</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}
			</CardContent>
		</Card>
	);
};

export default ProductFormImages;
