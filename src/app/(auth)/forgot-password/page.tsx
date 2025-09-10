'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { forgotPassword, ForgotPasswordData } from '@/services/auth-service';
import { toast } from 'react-toastify';

const forgotPasswordSchema = z.object({
	email: z.string().email({
		message: 'Vui lòng nhập email hợp lệ.',
	}),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);
	const router = useRouter();

	const form = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: '',
		},
	});

	const onSubmit = async (values: ForgotPasswordFormValues) => {
		setIsLoading(true);

		try {
			const forgotPasswordData: ForgotPasswordData = {
				email: values.email,
			};

			const response = await forgotPassword(forgotPasswordData);

			toast.success(response.message || 'Email khôi phục mật khẩu đã được gửi!');
			setEmailSent(true);
		} catch (error: any) {
			console.error('Forgot password error:', error);
			toast.error(error.message || 'Có lỗi xảy ra khi gửi email khôi phục');
		} finally {
			setIsLoading(false);
		}
	};

	if (emailSent) {
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
						<h1 className='text-2xl font-bold text-gray-800'>Email Đã Được Gửi</h1>
					</CardHeader>

					<CardContent className='text-center space-y-4'>
						<p className='text-gray-600'>
							Chúng tôi đã gửi email khôi phục mật khẩu đến{' '}
							<span className='font-medium text-gray-800'>{form.getValues('email')}</span>
						</p>
						<p className='text-sm text-gray-500'>
							Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
						</p>
						<p className='text-sm text-gray-500'>Không thấy email? Hãy kiểm tra thư mục spam hoặc rác.</p>

						<div className='space-y-3 pt-4'>
							<Button
								onClick={() => setEmailSent(false)}
								variant='outline'
								className='w-full h-12 border-gray-200 hover:bg-gray-50'
							>
								Gửi lại email
							</Button>

							<Button
								onClick={() => router.push('/sign-in')}
								className='w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium'
							>
								Quay lại đăng nhập
							</Button>
						</div>
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
									d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
								<polyline
									points='22,6 12,13 2,6'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</div>
					</div>
					<h1 className='text-2xl font-bold text-gray-800'>Quên Mật Khẩu</h1>
				</CardHeader>

				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
							<FormField
								control={form.control}
								name='email'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-gray-600'>Địa chỉ Email</FormLabel>
										<FormControl>
											<Input
												type='email'
												placeholder='Vui lòng nhập địa chỉ Email'
												{...field}
												className='h-12 border-gray-200 focus:border-blue-500'
												disabled={isLoading}
											/>
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
										Đang gửi...
									</>
								) : (
									'Gửi Email Khôi Phục'
								)}
							</Button>
						</form>
					</Form>

					<div className='text-center mt-6 space-y-2'>
						<Link href='/sign-in' className='block text-blue-600 hover:underline font-medium'>
							← Quay lại đăng nhập
						</Link>
						<div>
							<span className='text-gray-600'>Chưa có tài khoản? </span>
							<Link href='/sign-up' className='text-blue-600 hover:underline font-medium'>
								Đăng Ký
							</Link>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default ForgotPassword;
