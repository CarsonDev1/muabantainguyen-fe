'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { uploadSingleImage } from '@/services/upload-service';
import { toast } from 'react-toastify';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface CategoryImageUploadProps {
	value?: string;
	onChange: (imageUrl: string) => void;
	disabled?: boolean;
}

export function CategoryImageUpload({ value, onChange, disabled = false }: CategoryImageUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [dragActive, setDragActive] = useState(false);

	const handleFileUpload = async (file: File) => {
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			toast.error('Vui lòng chọn file hình ảnh');
			return;
		}

		// Validate file size (5MB max)
		if (file.size > 5 * 1024 * 1024) {
			toast.error('Kích thước file không được vượt quá 5MB');
			return;
		}

		setIsUploading(true);

		try {
			const result = await uploadSingleImage(file, { folder: 'categories' });
			onChange(result.data.url);
			toast.success('Upload hình ảnh thành công');
		} catch (error: any) {
			toast.error(error.message || 'Upload hình ảnh thất bại');
		} finally {
			setIsUploading(false);
		}
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFileUpload(file);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragActive(false);

		const file = e.dataTransfer.files[0];
		if (file) {
			handleFileUpload(file);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setDragActive(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setDragActive(false);
	};

	const removeImage = () => {
		onChange('');
	};

	return (
		<div className='space-y-4'>
			<Label>Hình ảnh danh mục</Label>

			{value ? (
				<Card className='relative'>
					<CardContent className='p-4'>
						<div className='relative group'>
							<div className='aspect-video w-full max-w-xs mx-auto rounded-lg overflow-hidden bg-gray-100'>
								<Image
									src={value}
									alt='Category image'
									width={300}
									height={200}
									className='w-full h-full object-cover'
								/>
							</div>
							{!disabled && (
								<Button
									type='button'
									variant='destructive'
									size='sm'
									className='absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity'
									onClick={removeImage}
								>
									<X className='w-4 h-4' />
								</Button>
							)}
						</div>
						<div className='mt-4 text-center'>
							<p className='text-sm text-gray-600 mb-2'>Hình ảnh hiện tại</p>
							{!disabled && (
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={() => document.getElementById('image-upload')?.click()}
									disabled={isUploading}
								>
									{isUploading ? (
										<>
											<Loader2 className='w-4 h-4 mr-2 animate-spin' />
											Đang upload...
										</>
									) : (
										<>
											<Upload className='w-4 h-4 mr-2' />
											Thay đổi hình ảnh
										</>
									)}
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			) : (
				<Card
					className={`border-2 border-dashed transition-colors ${
						dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
					}`}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
				>
					<CardContent className='p-8'>
						<div className='text-center'>
							<div className='mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4'>
								<ImageIcon className='w-6 h-6 text-gray-400' />
							</div>
							<h3 className='text-lg font-medium text-gray-900 mb-2'>Upload hình ảnh danh mục</h3>
							<p className='text-sm text-gray-500 mb-4'>Kéo thả file vào đây hoặc click để chọn file</p>
							<Button
								type='button'
								variant='outline'
								onClick={() => document.getElementById('image-upload')?.click()}
								disabled={isUploading || disabled}
							>
								{isUploading ? (
									<>
										<Loader2 className='w-4 h-4 mr-2 animate-spin' />
										Đang upload...
									</>
								) : (
									<>
										<Upload className='w-4 h-4 mr-2' />
										Chọn hình ảnh
									</>
								)}
							</Button>
							<p className='text-xs text-gray-400 mt-2'>PNG, JPG, GIF tối đa 5MB</p>
						</div>
					</CardContent>
				</Card>
			)}

			<Input
				id='image-upload'
				type='file'
				accept='image/*'
				onChange={handleFileInputChange}
				className='hidden'
				disabled={disabled}
			/>
		</div>
	);
}
