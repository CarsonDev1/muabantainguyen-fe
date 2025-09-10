'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { register, RegisterData } from '@/services/auth-service';
import { toast } from 'react-toastify';

const signUpSchema = z
	.object({
		name: z.string().min(3, {
			message: 'Tên đăng nhập phải có ít nhất 3 ký tự.',
		}),
		email: z.string().email({
			message: 'Vui lòng nhập email hợp lệ.',
		}),
		phone: z
			.string()
			.min(10, {
				message: 'Số điện thoại phải có ít nhất 10 số.',
			})
			.max(11, {
				message: 'Số điện thoại phải có tối đa 11 số.',
			}),
		password: z.string().min(6, {
			message: 'Mật khẩu phải có ít nhất 6 ký tự.',
		}),
		confirmPassword: z.string().min(6, {
			message: 'Vui lòng xác nhận mật khẩu.',
		}),
		agreeToTerms: z.boolean().refine((val) => val === true, {
			message: 'Bạn phải đồng ý với điều khoản dịch vụ.',
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Mật khẩu xác nhận không khớp.',
		path: ['confirmPassword'],
	});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUp = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const form = useForm<SignUpFormValues>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			name: '',
			email: '',
			phone: '',
			password: '',
			confirmPassword: '',
			agreeToTerms: false,
		},
	});

	const onSubmit = async (values: SignUpFormValues) => {
		setIsLoading(true);

		try {
			const registerData: RegisterData = {
				name: values.name,
				email: values.email,
				phone: values.phone,
				password: values.password,
			};

			const response = await register(registerData);

			toast.success(response.message || 'Đăng ký thành công!');
			router.push('/sign-in');
		} catch (error: any) {
			console.error('Registration error:', error);
			toast.error(error.message || 'Có lỗi xảy ra khi đăng ký');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-4'>
			<Card className='w-full max-w-xl shadow-2xl border-0'>
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
									d='M12 2L2 7L12 12L22 7L12 2Z'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
								<path
									d='M2 17L12 22L22 17'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
								<path
									d='M2 12L12 17L22 12'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</div>
					</div>
					<h1 className='text-2xl font-bold text-gray-800'>Đăng Ký</h1>
				</CardHeader>

				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
							<FormField
								control={form.control}
								name='name'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-gray-600'>Tên</FormLabel>
										<FormControl>
											<Input
												placeholder='Vui lòng nhập Tên'
												{...field}
												className='h-12 border-gray-200 focus:border-blue-500'
												disabled={isLoading}
											/>
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

							<FormField
								control={form.control}
								name='phone'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-gray-600'>Số điện thoại</FormLabel>
										<FormControl>
											<Input
												type='phone'
												placeholder='Vui lòng nhập số điện thoại'
												{...field}
												className='h-12 border-gray-200 focus:border-blue-500'
												disabled={isLoading}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='password'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-gray-600'>Mật khẩu</FormLabel>
										<FormControl>
											<div className='relative'>
												<Input
													type={showPassword ? 'text' : 'password'}
													placeholder='Vui lòng nhập mật khẩu'
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
										<FormLabel className='text-gray-600'>Nhập lại mật khẩu</FormLabel>
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

							<FormField
								control={form.control}
								name='agreeToTerms'
								render={({ field }) => (
									<FormItem className='flex flex-row items-start space-x-3 space-y-0 !my-5'>
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												disabled={isLoading}
											/>
										</FormControl>
										<div className='space-y-1 leading-none'>
											<FormLabel className='text-sm text-gray-600'>
												Đồng ý với{' '}
												<Link href='/privacy-policy' className='text-blue-600 hover:underline'>
													Chính sách
												</Link>{' '}
												và{' '}
												<Link
													href='/terms-of-service'
													className='text-blue-600 hover:underline'
												>
													Điều khoản dịch vụ
												</Link>
											</FormLabel>
											<FormMessage />
										</div>
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
									'Đăng Ký'
								)}
							</Button>
						</form>
					</Form>

					<div className='text-center mt-6'>
						<span className='text-gray-600'>Bạn đã có tài khoản? </span>
						<Link href='/sign-in' className='text-blue-600 hover:underline font-medium'>
							Đăng Nhập
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default SignUp;
