'use client';

import React from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
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
import { Product } from '@/services/product-service';

interface DeleteProductDialogProps {
	product: Product | null;
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	isDeleting: boolean;
}

const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({
	product,
	isOpen,
	onClose,
	onConfirm,
	isDeleting,
}) => {
	if (!product) return null;

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className='flex items-center gap-3'>
						<div className='w-12 h-12 rounded-full bg-red-100 flex items-center justify-center'>
							<AlertTriangle className='w-6 h-6 text-red-600' />
						</div>
						Xóa sản phẩm
					</AlertDialogTitle>
					<AlertDialogDescription className='space-y-3 pt-4'>
						<p className='text-base'>
							Bạn có chắc chắn muốn xóa sản phẩm{' '}
							<span className='font-semibold text-gray-900'>"{product.name}"</span>?
						</p>
						<div className='bg-red-50 border border-red-200 rounded-lg p-4'>
							<p className='text-sm text-red-700'>
								Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh viễn khỏi hệ thống.
							</p>
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className='gap-3'>
					<AlertDialogCancel asChild>
						<Button variant='outline' size='lg' disabled={isDeleting}>
							Hủy bỏ
						</Button>
					</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button
							onClick={onConfirm}
							disabled={isDeleting}
							size='lg'
							className='bg-red-600 hover:bg-red-700'
						>
							{isDeleting ? (
								<>
									<Loader2 className='w-5 h-5 mr-2 animate-spin' />
									Đang xóa...
								</>
							) : (
								<>
									<Trash2 className='w-5 h-5 mr-2' />
									Xóa sản phẩm
								</>
							)}
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default DeleteProductDialog;
