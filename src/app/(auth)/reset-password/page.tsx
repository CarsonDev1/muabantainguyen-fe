'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { resetPassword, ResetPasswordData } from '@/services/auth-service';
import { toast } from 'react-toastify';

const resetPasswordSchema = z
	.object({
		newPassword: z.string().min(6, {
			message: 'Mật khẩu phải có ít nhất 6 ký tự.',
		}),
		confirmPassword: z.string().min(6, {
			message: 'Vui lòng xác nhận mật khẩu.',
		}),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Mật khẩu xác nhận không khớp.',
		path: ['confirmPassword'],
	});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [token, setToken] = useState<string | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();

	const form = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			newPassword: '',
			confirmPassword: '',
		},
	});

	useEffect(() => {
		const tokenParam = searchParams.get('token');
		if (tokenParam) {
			setToken(tokenParam);
		} else {
			toast.error('Token không hợp lệ');
			router.push('/forgot-password');
		}
	}, [searchParams, router]);

	const onSubmit = async (values: ResetPasswordFormValues) => {
		if (!token) {
			toast.error('Token không hợp lệ');
			return;
		}

		setIsLoading(true);

		try {
			const resetPasswordData: ResetPasswordData = {
				token: token,
				newPassword: values.newPassword,
			};

			const response = await resetPassword(resetPasswordData);

			toast.success(response.message || 'Đặt lại mật khẩu thành công!');
			setIsSuccess(true);
		} catch (error: any) {
			console.error('Reset password error:', error);
			toast.error(error.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
		} finally {
			setIsLoading(false);
		}
	};

	// Loading state while getting token
	if (!token && !isSuccess) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-4'>
				<Card className='w-full max-w-md shadow-2xl border-0'>
					<CardContent className='flex items-center justify-center py-8'>
						<div className='text-center'>
							<svg
								className='animate-spin mx-auto h-8 w-8 text-blue-600 mb-4'
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
							>
								<circle
									className='opacity-25'
									cx='12'
									cy='12'
									r='10'
									stroke='currentColor'
									strokeWidth='4'
								></circle>
								<path
									className='opacity-75'
									fill='currentColor'
									d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
								></path>
							</svg>
							<p className='text-gray-600'>Đang xử lý...</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Success state
	if (isSuccess) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-4'>
				<Card className='w-full max-w-md shadow-2xl border-0'>
					<CardHeader className='text-center pb-2'>
						<div className='flex justify-center'>
							<div className='w-12 h-12 bg-green-600 rounded-full flex items-center justify-center'>
								<svg
									width='24'
									height='24'
									viewBox='0 0 24 24'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
									className='text-white'
								>
									<path
										d='M20 6L9 17L4 12'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
								</svg>
							</div>
						</div>
						<h1 className='text-2xl font-bold text-gray-800'>Đặt Lại Mật Khẩu Thành Công</h1>
					</CardHeader>

					<CardContent className='text-center space-y-4'>
						<p className='text-gray-600'>Mật khẩu của bạn đã được đặt lại thành công.</p>
						<p className='text-sm text-gray-500'>Bây giờ bạn có thể đăng nhập với mật khẩu mới.</p>

						<Button
							onClick={() => router.push('/sign-in')}
							className='w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium mt-6'
						>
							Đăng Nhập Ngay
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-4'>
			<Card className='w-full max-w-md shadow-2xl border-0'>
				<CardHeader className='text-center pb-2'>
					<div className='flex justify-center'>
						<div className='w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center'>
							<svg
								width='24'
								height='24'
								viewBox='0 0 24 24'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
								className='text-white'
							>
								<path
									d='M9 12L11 14L15 10'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
								<path
									d='M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</div>
					</div>
					<h1 className='text-2xl font-bold text-gray-800'>Đặt Lại Mật Khẩu</h1>
					<p className='text-sm text-gray-600 mt-2'>Nhập mật khẩu mới cho tài khoản của bạn</p>
				</CardHeader>

				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
							<FormField
								control={form.control}
								name='newPassword'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-gray-600'>Mật khẩu mới</FormLabel>
										<FormControl>
											<div className='relative'>
												<Input
													type={showPassword ? 'text' : 'password'}
													placeholder='Vui lòng nhập mật khẩu mới'
													{...field}
													className='h-12 border-gray-200 focus:border-blue-500 pr-10'
													disabled={isLoading}
												/>
												<button
													type='button'
													onClick={() => setShowPassword(!showPassword)}
													className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
													disabled={isLoading}
												>
													{showPassword ? (
														<svg
															width='20'
															height='20'
															viewBox='0 0 24 24'
															fill='none'
															xmlns='http://www.w3.org/2000/svg'
														>
															<path
																d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'
																stroke='currentColor'
																strokeWidth='2'
																strokeLinecap='round'
																strokeLinejoin='round'
															/>
															<circle
																cx='12'
																cy='12'
																r='3'
																stroke='currentColor'
																strokeWidth='2'
															/>
														</svg>
													) : (
														<svg
															width='20'
															height='20'
															viewBox='0 0 24 24'
															fill='none'
															xmlns='http://www.w3.org/2000/svg'
														>
															<path
																d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24'
																stroke='currentColor'
																strokeWidth='2'
																strokeLinecap='round'
																strokeLinejoin='round'
															/>
															<line
																x1='1'
																y1='1'
																x2='23'
																y2='23'
																stroke='currentColor'
																strokeWidth='2'
																strokeLinecap='round'
																strokeLinejoin='round'
															/>
														</svg>
													)}
												</button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='confirmPassword'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-gray-600'>Xác nhận mật khẩu</FormLabel>
										<FormControl>
											<div className='relative'>
												<Input
													type={showConfirmPassword ? 'text' : 'password'}
													placeholder='Vui lòng nhập lại mật khẩu'
													{...field}
													className='h-12 border-gray-200 focus:border-blue-500 pr-10'
													disabled={isLoading}
												/>
												<button
													type='button'
													onClick={() => setShowConfirmPassword(!showConfirmPassword)}
													className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
													disabled={isLoading}
												>
													{showConfirmPassword ? (
														<svg
															width='20'
															height='20'
															viewBox='0 0 24 24'
															fill='none'
															xmlns='http://www.w3.org/2000/svg'
														>
															<path
																d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'
																stroke='currentColor'
																strokeWidth='2'
																strokeLinecap='round'
																strokeLinejoin='round'
															/>
															<circle
																cx='12'
																cy='12'
																r='3'
																stroke='currentColor'
																strokeWidth='2'
															/>
														</svg>
													) : (
														<svg
															width='20'
															height='20'
															viewBox='0 0 24 24'
															fill='none'
															xmlns='http://www.w3.org/2000/svg'
														>
															<path
																d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24'
																stroke='currentColor'
																strokeWidth='2'
																strokeLinecap='round'
																strokeLinejoin='round'
															/>
															<line
																x1='1'
																y1='1'
																x2='23'
																y2='23'
																stroke='currentColor'
																strokeWidth='2'
																strokeLinecap='round'
																strokeLinejoin='round'
															/>
														</svg>
													)}
												</button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type='submit'
								className='w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed'
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<svg
											className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 24 24'
										>
											<circle
												className='opacity-25'
												cx='12'
												cy='12'
												r='10'
												stroke='currentColor'
												strokeWidth='4'
											></circle>
											<path
												className='opacity-75'
												fill='currentColor'
												d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
											></path>
										</svg>
										Đang xử lý...
									</>
								) : (
									'Đặt Lại Mật Khẩu'
								)}
							</Button>
						</form>
					</Form>

					<div className='text-center mt-6'>
						<Link href='/sign-in' className='text-blue-600 hover:underline font-medium'>
							← Quay lại đăng nhập
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default ResetPassword;
