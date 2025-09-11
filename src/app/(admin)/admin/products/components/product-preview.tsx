'use client';

import React from 'react';
import { Save, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UploadedImage } from '@/services/upload-service';

interface ProductFormSidebarProps {
	isCreating: boolean;
	isLoadingCategories: boolean;
	categoriesError: any;
	onCancel: () => void;
	watchedName: string;
	watchedPrice: number;
	watchedStock: number;
	watchedImageUrl: string;
	uploadedImages: UploadedImage[];
	formatPrice: (price: number) => string;
}

const ProductFormSidebar: React.FC<ProductFormSidebarProps> = ({
	isCreating,
	isLoadingCategories,
	categoriesError,
	onCancel,
	watchedName,
	watchedPrice,
	watchedStock,
	watchedImageUrl,
	uploadedImages,
	formatPrice,
}) => {
	const getStockBadge = (stock: number) => {
		if (stock === 0) {
			return <Badge className='bg-red-100 text-red-800'>Hết hàng</Badge>;
		} else if (stock < 10) {
			return <Badge className='bg-orange-100 text-orange-800'>Sắp hết ({stock} sản phẩm)</Badge>;
		} else {
			return <Badge className='bg-green-100 text-green-800'>Còn hàng ({stock} sản phẩm)</Badge>;
		}
	};

	return (
		<div className='space-y-6'>
			{/* Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Thao tác</CardTitle>
				</CardHeader>
				<CardContent className='space-y-3'>
					<Button type='submit' className='w-full' disabled={isCreating || isLoadingCategories}>
						{isCreating ? (
							<>
								<Loader2 className='h-4 w-4 mr-2 animate-spin' />
								Đang tạo...
							</>
						) : (
							<>
								<Save className='h-4 w-4 mr-2' />
								Tạo sản phẩm
							</>
						)}
					</Button>
					<Button type='button' variant='outline' className='w-full' onClick={onCancel}>
						Hủy bỏ
					</Button>
				</CardContent>
			</Card>

			{/* Preview */}
			<Card>
				<CardHeader>
					<CardTitle>Xem trước</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					{/* Main Image Preview */}
					{watchedImageUrl && (
						<div className='w-full h-40 bg-gray-100 rounded-lg overflow-hidden'>
							<img src={watchedImageUrl} alt='Preview' className='w-full h-full object-cover' />
						</div>
					)}

					<div className='space-y-3'>
						<div>
							<Label className='text-sm text-gray-600'>Tên sản phẩm</Label>
							<p className='font-medium mt-1'>{watchedName || 'Chưa nhập tên'}</p>
						</div>

						<Separator />

						<div>
							<Label className='text-sm text-gray-600'>Giá bán</Label>
							<p className='font-bold text-blue-600 text-lg mt-1'>
								{watchedPrice > 0 ? formatPrice(watchedPrice) : 'Chưa nhập giá'}
							</p>
						</div>

						<div>
							<Label className='text-sm text-gray-600'>Trạng thái kho</Label>
							<div className='mt-1'>{getStockBadge(watchedStock)}</div>
						</div>

						{uploadedImages.length > 0 && (
							<div>
								<Label className='text-sm text-gray-600'>Số ảnh đã upload</Label>
								<p className='mt-1'>
									<Badge className='bg-blue-100 text-blue-800'>{uploadedImages.length} ảnh</Badge>
								</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Tips */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<FileText className='h-5 w-5' />
						Gợi ý
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-3 text-sm text-gray-600'>
					<div className='space-y-2'>
						<p>• Upload nhiều ảnh để khách hàng có cái nhìn toàn diện</p>
						<p>• Ảnh chất lượng cao sẽ tăng tỷ lệ chuyển đổi</p>
						<p>• Sử dụng ảnh thật của sản phẩm, tránh ảnh stock</p>
						<p>• Đảm bảo ảnh có ánh sáng tốt và background sạch</p>
						<p>• Chọn ảnh đẹp nhất làm ảnh chính</p>
						{isLoadingCategories && <p className='text-blue-600'>• Đang tải danh mục sản phẩm...</p>}
						{categoriesError && <p className='text-red-600'>• Kiểm tra kết nối mạng để tải danh mục</p>}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default ProductFormSidebar;
