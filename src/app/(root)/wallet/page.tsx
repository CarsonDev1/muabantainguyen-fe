'use client';

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import walletService, { type CreateDepositResponse, type DepositStatus } from '@/services/wallet-service';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, CheckCircle2, Clock, Banknote, AlertTriangle, Wallet, CreditCard, History } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/utils/format-currency';

type PaymentMethod = 'sepay' | 'momo' | 'bank_transfer';

export default function WalletTopUpPage() {
	const queryClient = useQueryClient();
	const [amount, setAmount] = React.useState<number>(100000);
	const [method, setMethod] = React.useState<PaymentMethod>('sepay');
	const [currentDeposit, setCurrentDeposit] = React.useState<CreateDepositResponse | null>(null);
	const [status, setStatus] = React.useState<DepositStatus | null>(null);
	const [depPage, setDepPage] = React.useState(1);

	const { data: walletInfo, isLoading: walletLoading } = useQuery({
		queryKey: ['wallet'],
		queryFn: walletService.getWallet,
	});

	const { data: depositHistory } = useQuery({
		queryKey: ['wallet', 'deposits', depPage],
		queryFn: () => walletService.getDeposits({ page: depPage, pageSize: 10 }),
	});

	const createDepositMutation = useMutation({
		mutationFn: () => walletService.createDeposit({ amount, paymentMethod: method }),
		onMutate: () => {
			setStatus('pending');
		},
		onSuccess: (data) => {
			setCurrentDeposit(data);
			setStatus('pending');
			toast.success('Tạo yêu cầu nạp tiền thành công');
		},
		onError: (err: any) => {
			toast.error(err?.message || 'Không thể tạo yêu cầu nạp tiền');
			setStatus(null);
		},
	});

	// Poll deposit status when we have a currentDeposit
	React.useEffect(() => {
		if (!currentDeposit?.requestId) return;
		let timer: any;
		const tick = async () => {
			try {
				const res = await walletService.checkDeposit(currentDeposit.requestId);
				setStatus(res.deposit.status);
				if (res.deposit.status === 'completed') {
					toast.success('Nạp tiền thành công');
					queryClient.invalidateQueries({ queryKey: ['wallet'] });
					clearInterval(timer);
				}
				if (res.deposit.isExpired || res.deposit.status === 'expired' || res.deposit.status === 'cancelled') {
					toast.warn('Yêu cầu nạp đã hết hạn hoặc bị hủy');
					clearInterval(timer);
				}
			} catch (e) {
				// silent
			}
		};
		tick();
		timer = setInterval(tick, 4000);
		return () => clearInterval(timer);
	}, [currentDeposit?.requestId, queryClient]);

	const handleCopy = async (text: string, label: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast.success(`Đã sao chép ${label}`);
		} catch (e) {
			toast.error('Không thể sao chép');
		}
	};

	const disabled = createDepositMutation.isPending;

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
			<div className='mx-auto'>
				{/* Header */}
				<div className='mb-6 sm:mb-8'>
					<div className='flex items-center gap-3 sm:gap-4 mb-3'>
						<div className='bg-blue-600 dark:bg-blue-500 p-2.5 sm:p-3 rounded-2xl shadow-lg'>
							<Wallet className='w-6 h-6 sm:w-7 sm:h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white'>
								Nạp tiền vào ví
							</h1>
							<p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1'>
								Nạp tiền nhanh qua chuyển khoản tự động, cập nhật số dư tức thời
							</p>
						</div>
					</div>
				</div>

				{/* Current Balance Card */}
				<div className='bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-6 sm:p-8 mb-6 sm:mb-8 overflow-hidden relative'>
					<div className='absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10'></div>
					<div className='relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
						<div>
							<p className='text-sm text-gray-600 dark:text-gray-400 font-medium mb-2'>Số dư hiện tại</p>
							<p className='text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white'>
								{walletLoading ? (
									<span className='inline-flex items-center gap-2'>
										<Loader2 className='w-8 h-8 animate-spin text-blue-600' />
									</span>
								) : (
									formatCurrency(walletInfo?.wallet?.balance || 0)
								)}
							</p>
						</div>
						<div className='bg-blue-600 dark:bg-blue-500 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-lg flex items-center gap-2 font-semibold text-sm sm:text-base'>
							<Banknote className='w-5 h-5' />
							<span>Nạp nhanh 24/7</span>
						</div>
					</div>
				</div>

				{/* Create Deposit Form */}
				<div className='bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-6 sm:p-8 mb-6 sm:mb-8'>
					<div className='flex items-center gap-2 mb-6'>
						<CreditCard className='w-5 h-5 text-blue-600 dark:text-blue-400' />
						<h2 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white'>Tạo yêu cầu nạp</h2>
					</div>

					<div className='grid sm:grid-cols-2 gap-4 sm:gap-6'>
						<div>
							<label className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block'>
								Số tiền nạp
							</label>
							<Input
								type='number'
								min={10000}
								step={10000}
								value={amount}
								onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
								className='h-12 text-base font-semibold border-2 rounded-xl'
							/>
							<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>Tối thiểu 10.000đ</p>
							<div className='mt-3 flex flex-wrap gap-2'>
								{[10000, 50000, 100000, 200000, 500000].map((v) => (
									<Button
										key={v}
										type='button'
										variant='outline'
										size='sm'
										onClick={() => setAmount(v)}
										className='h-9 px-3 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm border-2 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-all'
									>
										{formatCurrency(v)}
									</Button>
								))}
							</div>
						</div>
						<div>
							<label className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block'>
								Phương thức thanh toán
							</label>
							<Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
								<SelectTrigger className='h-12 border-2 rounded-xl text-base font-semibold'>
									<SelectValue placeholder='Chọn phương thức' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='sepay'>Chuyển khoản tự động (Sepay)</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className='mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4'>
						<Button
							onClick={() => createDepositMutation.mutate()}
							disabled={disabled || amount < 10000}
							className='h-12 sm:h-14 px-6 sm:px-8 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl font-bold text-base shadow-lg transition-all'
						>
							{disabled ? (
								<>
									<Loader2 className='w-5 h-5 animate-spin mr-2' />
									Đang xử lý...
								</>
							) : (
								'Tạo yêu cầu nạp tiền'
							)}
						</Button>
						<p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400 sm:self-center'>
							Sau khi tạo, bạn sẽ nhận nội dung chuyển khoản và mã QR
						</p>
					</div>
				</div>

				{/* Payment Instructions */}
				{currentDeposit && (
					<div className='bg-white dark:bg-gray-800 rounded-2xl border-2 border-blue-200 dark:border-blue-900 shadow-xl p-6 sm:p-8 mb-6 sm:mb-8'>
						<div className='flex items-center gap-2 mb-6'>
							<div className='bg-blue-600 dark:bg-blue-500 p-2 rounded-lg'>
								<Banknote className='w-5 h-5 text-white' />
							</div>
							<h2 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white'>
								Hướng dẫn thanh toán
							</h2>
						</div>

						<div className='grid sm:grid-cols-2 gap-4 sm:gap-5'>
							<div>
								<p className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>Số tiền</p>
								<div className='flex items-center justify-between rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-4 py-3'>
									<span className='font-bold text-lg text-blue-600 dark:text-blue-400'>
										{formatCurrency(currentDeposit.amount)}
									</span>
									<Button
										variant='outline'
										size='sm'
										onClick={() => handleCopy(String(currentDeposit.amount), 'số tiền')}
										className='h-9 rounded-lg'
									>
										<Copy className='w-4 h-4' />
									</Button>
								</div>
							</div>
							<div>
								<p className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
									Nội dung chuyển khoản
								</p>
								<div className='flex items-center justify-between rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-4 py-3'>
									<span className='font-mono text-sm font-bold text-gray-900 dark:text-white'>
										{currentDeposit.paymentCode}
									</span>
									<Button
										variant='outline'
										size='sm'
										onClick={() => handleCopy(currentDeposit.paymentCode, 'nội dung chuyển khoản')}
										className='h-9 rounded-lg'
									>
										<Copy className='w-4 h-4' />
									</Button>
								</div>
							</div>
						</div>

						<div className='grid sm:grid-cols-2 gap-4 sm:gap-5 mt-4 sm:mt-5'>
							<div>
								<p className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
									Phương thức
								</p>
								<div className='rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-4 py-3'>
									<span className='uppercase text-sm font-bold text-gray-900 dark:text-white'>
										{currentDeposit.paymentMethod}
									</span>
								</div>
							</div>
							<div>
								<p className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>Hết hạn</p>
								<div className='flex items-center gap-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-4 py-3'>
									<Clock className='w-4 h-4 text-gray-500' />
									<span className='text-sm font-medium text-gray-900 dark:text-white'>
										{new Date(currentDeposit.expiresAt).toLocaleString()}
									</span>
								</div>
							</div>
						</div>

						{/* Bank details & VietQR */}
						{currentDeposit.paymentMethod === 'sepay' && (
							<div className='grid sm:grid-cols-2 gap-6 sm:gap-8 mt-6'>
								<div className='space-y-4'>
									<div>
										<p className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
											Ngân hàng
										</p>
										<div className='rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-4 py-3'>
											<span className='text-sm font-medium text-gray-900 dark:text-white'>
												{(currentDeposit as any).instructions?.bankName || '—'}
											</span>
										</div>
									</div>
									<div>
										<p className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
											Số tài khoản
										</p>
										<div className='flex items-center justify-between rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-4 py-3'>
											<span className='font-mono text-sm font-bold text-gray-900 dark:text-white'>
												{(currentDeposit as any).instructions?.accountNumber || '—'}
											</span>
											<Button
												variant='outline'
												size='sm'
												onClick={() =>
													handleCopy(
														String(
															(currentDeposit as any).instructions?.accountNumber || ''
														),
														'số tài khoản'
													)
												}
												className='h-9 rounded-lg'
											>
												<Copy className='w-4 h-4' />
											</Button>
										</div>
									</div>
									<div>
										<p className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
											Chủ tài khoản
										</p>
										<div className='rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-4 py-3'>
											<span className='text-sm font-medium text-gray-900 dark:text-white'>
												{(currentDeposit as any).instructions?.accountName || '—'}
											</span>
										</div>
									</div>
								</div>
								<div className='flex items-center justify-center'>
									{(currentDeposit as any).instructions?.qrUrl ? (
										<img
											src={(currentDeposit as any).instructions.qrUrl}
											alt='VietQR'
											className='w-64 h-64 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white shadow-xl'
										/>
									) : (
										<Image
											src='/images/QR_Code.png'
											alt='QR Code'
											width={256}
											height={256}
											className='rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white shadow-xl'
										/>
									)}
								</div>
							</div>
						)}

						{currentDeposit.instructions?.bankName && (
							<div className='mt-6 rounded-xl border-2 border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 p-4 sm:p-5 flex items-start gap-3'>
								<AlertTriangle className='w-5 h-5 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0' />
								<div className='text-blue-900 dark:text-blue-200'>
									<p className='text-sm font-semibold mb-2'>Lưu ý quan trọng:</p>
									<ul className='text-sm space-y-1 list-disc pl-5'>
										<li>
											Chuyển khoản chính xác nội dung:{' '}
											<strong>{currentDeposit.paymentCode}</strong>
										</li>
										<li>
											Số tiền: <strong>{formatCurrency(currentDeposit.amount)}</strong>
										</li>
										<li>
											Ngân hàng: <strong>{currentDeposit.instructions.bankName}</strong>
										</li>
										<li>
											Số TK: <strong>{currentDeposit.instructions.accountNumber}</strong>
										</li>
									</ul>
								</div>
							</div>
						)}

						<div className='mt-6 flex items-center justify-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40'>
							{status === 'completed' ? (
								<div className='flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold'>
									<CheckCircle2 className='w-6 h-6' />
									<span>Đã nhận tiền vào ví thành công</span>
								</div>
							) : (
								<div className='flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium'>
									<div className='relative'>
										<Clock className='w-6 h-6 animate-pulse' />
										<div className='absolute inset-0 blur-sm bg-gray-400 animate-pulse opacity-50'></div>
									</div>
									<span>Đang chờ thanh toán...</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Deposit history */}
				<div className='bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-6 sm:p-8'>
					<div className='flex items-center justify-between mb-6'>
						<div className='flex items-center gap-2'>
							<History className='w-5 h-5 text-blue-600 dark:text-blue-400' />
							<h2 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white'>
								Lịch sử nạp tiền
							</h2>
						</div>
						<span className='text-xs text-gray-500 dark:text-gray-400'>Tối đa 10 mục/trang</span>
					</div>

					<div className='hidden sm:grid grid-cols-12 gap-3 px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-700'>
						<div className='col-span-3'>Thời gian</div>
						<div className='col-span-3'>Mã nội dung</div>
						<div className='col-span-2 text-right'>Số tiền</div>
						<div className='col-span-2'>Phương thức</div>
						<div className='col-span-2 text-center'>Trạng thái</div>
					</div>

					<div className='divide-y divide-gray-200 dark:divide-gray-700 mt-3'>
						{depositHistory?.items?.length ? (
							depositHistory.items.map((d: any) => (
								<div
									key={d.id}
									className='grid grid-cols-12 gap-3 px-4 py-4 items-center text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors'
								>
									<div className='col-span-12 sm:col-span-3 text-gray-900 dark:text-white font-medium'>
										{(() => {
											const ts =
												d.createdAt || d.created_at || d.createdAtUtc || d.created_at_utc;
											const dt = ts ? new Date(ts) : null;
											return dt && !isNaN(dt.getTime())
												? dt.toLocaleString('vi-VN', { hour12: false })
												: '-';
										})()}
									</div>
									<div className='col-span-12 sm:col-span-3 font-mono text-gray-600 dark:text-gray-400 break-all flex items-center gap-2'>
										{d.paymentCode || d.payment_code}
										<Button
											variant='ghost'
											size='sm'
											onClick={() => handleCopy(d.paymentCode || d.payment_code, 'nội dung')}
											className='h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20'
										>
											<Copy className='w-3.5 h-3.5' />
										</Button>
									</div>
									<div className='col-span-6 sm:col-span-2 text-right font-bold text-gray-900 dark:text-white'>
										{formatCurrency(Number(d.amount))}
									</div>
									<div className='col-span-6 sm:col-span-2 uppercase text-[11px] font-bold tracking-wide text-gray-500 dark:text-gray-400'>
										{(d.paymentMethod || d.payment_method) ?? ''}
									</div>
									<div className='col-span-12 sm:col-span-2 flex sm:justify-center'>
										<span
											className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
												d.status === 'completed'
													? 'bg-blue-600 text-white dark:bg-blue-500'
													: d.status === 'pending'
													? 'bg-gray-600 text-white dark:bg-gray-700'
													: 'bg-gray-400 text-white dark:bg-gray-600'
											}`}
										>
											{d.status}
										</span>
									</div>
								</div>
							))
						) : (
							<div className='px-4 py-12 text-center'>
								<div className='bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4'>
									<History className='w-8 h-8 text-gray-400' />
								</div>
								<p className='text-gray-600 dark:text-gray-400 font-medium'>Chưa có lịch sử nạp tiền</p>
							</div>
						)}
					</div>

					{(depositHistory?.totalPages || 1) > 1 && (
						<div className='mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl'>
							<Button
								variant='outline'
								disabled={depPage <= 1}
								onClick={() => setDepPage((p) => Math.max(1, p - 1))}
								className='w-full sm:w-auto h-11 rounded-xl border-2 font-semibold'
							>
								← Trang trước
							</Button>
							<span className='text-sm font-semibold text-gray-900 dark:text-white'>
								Trang {depPage} / {depositHistory?.totalPages || 1}
							</span>
							<Button
								variant='outline'
								disabled={depPage >= (depositHistory?.totalPages || 1)}
								onClick={() => setDepPage((p) => Math.min(depositHistory?.totalPages || 1, p + 1))}
								className='w-full sm:w-auto h-11 rounded-xl border-2 font-semibold'
							>
								Trang sau →
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
