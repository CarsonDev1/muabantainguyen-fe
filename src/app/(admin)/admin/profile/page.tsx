'use client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { Loader2, Mail, Phone, ShieldCheck, Upload, Save, Wallet, CreditCard, PiggyBank } from 'lucide-react';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { uploadService } from '@/services/upload-service';
import { userService } from '@/services/user-service';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormControl, FormLabel, FormItem, FormMessage, FormField, Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getWallet } from '@/services/wallet-service';
import { formatCurrency } from '@/utils/format-currency';

const profileSchema = z.object({
	name: z.string().min(1, 'Tên người dùng là bắt buộc').min(3, 'Tên phải có ít nhất 3 ký tự'),
	email: z.string().email('Email không hợp lệ'),
	phone: z.string().min(10, 'SĐT phải có ít nhất 10 số').max(11, 'SĐT tối đa 11 số'),
	avatarUrl: z.string().url('URL hình ảnh không hợp lệ').optional().or(z.literal('')),
});

type UserFormData = z.infer<typeof profileSchema>;

const ProfileAdmin = () => {
	const { user, updateUserData } = useAuth();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [lastSubmitTime, setLastSubmitTime] = useState(0);
	const [originalFormData, setOriginalFormData] = useState<UserFormData | null>(null);

	const { data: walletData } = useQuery({
		queryKey: ['wallet'],
		queryFn: getWallet,
		refetchInterval: 30000,
	});

	const SUBMIT_COOLDOWN = 2000;
	const form = useForm<UserFormData>({
		resolver: zodResolver(profileSchema),
		defaultValues: { name: '', email: '', phone: '', avatarUrl: '' },
	});
	const currentFormData = form.watch();

	const hasFormChanged = useMemo(() => {
		if (!originalFormData) return false;
		return (
			originalFormData.name !== currentFormData.name ||
			originalFormData.email !== currentFormData.email ||
			originalFormData.phone !== currentFormData.phone ||
			originalFormData.avatarUrl !== currentFormData.avatarUrl
		);
	}, [originalFormData, currentFormData]);

	const canSubmit = useMemo(() => Date.now() - lastSubmitTime >= SUBMIT_COOLDOWN, [lastSubmitTime]);

	useEffect(() => {
		if (user) {
			const formData = {
				name: user.name || '',
				email: user.email || '',
				phone: user.phone || '',
				avatarUrl: user.avatar_url || '',
			};
			form.reset(formData);
			setOriginalFormData(formData);
		}
	}, [user, form]);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) handleImageUpload(files[0]);
	};

	const handleImageUpload = async (file: File) => {
		try {
			setIsUploading(true);
			const validationError = uploadService.validateImageFile(file, 5);
			if (validationError) {
				toast.error(validationError);
				return;
			}
			const result = await uploadService.uploadAvatar(file, {});
			if (result.success && result.data?.url) {
				form.setValue('avatarUrl', result.data.url);
				toast.success('Tải lên ảnh thành công');
			}
		} catch (err: any) {
			toast.error(err.message || 'Lỗi upload ảnh');
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = '';
		}
	};

	const handleSubmit = async (data: UserFormData) => {
		if (!canSubmit) {
			toast.warning('Vui lòng chờ một chút trước khi cập nhật lại');
			return;
		}
		if (!hasFormChanged) {
			toast.info('Không có thay đổi nào để cập nhật');
			return;
		}
		try {
			setIsSubmitting(true);
			setLastSubmitTime(Date.now());
			const result = await userService.updateProfile(data);
			if (result.success && result.user) {
				updateUserData?.(result.user);
				setOriginalFormData(data);
				toast.success('Cập nhật thành công');
			} else {
				toast.error(result.message || 'Lỗi cập nhật');
			}
		} catch (err: any) {
			toast.error(err.message || 'Lỗi cập nhật');
		} finally {
			setIsSubmitting(false);
		}
	};

	const currentAvatarUrl = form.watch('avatarUrl') || user?.avatar_url || '';
	const isButtonDisabled = isSubmitting || isUploading || !hasFormChanged || !canSubmit;
	const getButtonText = () =>
		isSubmitting ? 'Đang cập nhật...' : !hasFormChanged ? 'Không có thay đổi' : 'Cập nhật thông tin';

	const wallet = walletData?.wallet;
	const stats = walletData?.stats;

	return (
		<div className='flex flex-col gap-8 w-full'>
			{/* Header với avatar + info */}
			<div className='relative bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white flex flex-col items-center'>
				<Avatar
					className='size-28 border-4 border-white shadow-md cursor-pointer group relative'
					onClick={() => !isUploading && fileInputRef.current?.click()}
				>
					<Input
						type='file'
						ref={fileInputRef}
						onChange={handleFileSelect}
						accept='image/*'
						className='hidden'
					/>
					<div className='absolute flex justify-center items-center inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg'>
						{isUploading ? (
							<Loader2 className='size-6 text-white animate-spin' />
						) : (
							<Upload className='size-6 text-white' />
						)}
					</div>
					<AvatarImage src={currentAvatarUrl} className='rounded-full object-cover' />
					<AvatarFallback className='rounded-full text-2xl'>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
				</Avatar>
				<div className='flex items-center gap-2 mt-4'>
					<h2 className='text-2xl font-bold'>{user?.name}</h2>
					<Badge className='uppercase w-16'>{user?.role}</Badge>
				</div>
				<div className='flex flex-col sm:flex-row gap-3 mt-2 text-sm sm:text-base'>
					<div className='flex items-center gap-2'>
						<Mail size={18} /> {user?.email}
					</div>
					<div className='flex items-center gap-2'>
						<Phone size={18} /> {user?.phone || 'Chưa có SĐT'}
					</div>
					<div className='flex items-center gap-2'>
						<ShieldCheck size={18} /> <span>Bảo mật: Tắt</span>
					</div>
				</div>
			</div>

			{/* Stats */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				<Card className='p-5 text-center shadow-md rounded-xl'>
					<Wallet className='mx-auto text-indigo-600 mb-3' size={32} />
					<p className='text-sm text-gray-500 mt-2'>Tổng tiền nạp</p>
					<p className='text-lg font-bold text-indigo-700'>{formatCurrency(wallet?.total_deposited ?? 0)}</p>
				</Card>
				<Card className='p-5 text-center shadow-md rounded-xl'>
					<CreditCard className='mx-auto text-red-500 mb-3' size={32} />
					<p className='text-sm text-gray-500 mt-2'>Tổng tiền sử dụng</p>
					<p className='text-lg font-bold text-red-600'>{formatCurrency(wallet?.total_spent ?? 0)}</p>
				</Card>
				<Card className='p-5 text-center shadow-md rounded-xl'>
					<PiggyBank className='mx-auto text-green-500 mb-3' size={32} />
					<p className='text-sm text-gray-500 mt-2'>Số dư hiện tại</p>
					<p className='text-xl font-bold text-green-600'>{formatCurrency(wallet?.balance ?? 0)}</p>
				</Card>
			</div>

			{/* Form */}
			<Card className='shadow-lg rounded-2xl'>
				<CardHeader>
					<CardTitle>Chỉnh sửa thông tin</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className='grid grid-cols-1 md:grid-cols-2 gap-6'
						>
							<FormField
								control={form.control}
								name='name'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tên</FormLabel>
										<FormControl>
											<Input {...field} placeholder='Nhập tên của bạn' />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='email'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input {...field} type='email' placeholder='Nhập email' />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='phone'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Số điện thoại</FormLabel>
										<FormControl>
											<Input {...field} placeholder='Nhập SĐT' />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* Hidden avatar */}
							<FormField
								control={form.control}
								name='avatarUrl'
								render={({ field }) => (
									<FormItem className='hidden'>
										<FormControl>
											<Input {...field} type='hidden' />
										</FormControl>
									</FormItem>
								)}
							/>

							<div className='col-span-1 md:col-span-2 flex justify-end gap-3'>
								{hasFormChanged && (
									<Button
										type='button'
										variant='outline'
										onClick={() => form.reset(originalFormData!)}
										disabled={isSubmitting || isUploading}
									>
										Khôi phục
									</Button>
								)}
								<Button type='submit' disabled={isButtonDisabled} className='flex items-center gap-2'>
									{isSubmitting ? (
										<>
											<Loader2 className='size-4 animate-spin' />
											{getButtonText()}
										</>
									) : (
										<>
											<Save className='size-4' />
											{getButtonText()}
										</>
									)}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};

export default ProfileAdmin;
