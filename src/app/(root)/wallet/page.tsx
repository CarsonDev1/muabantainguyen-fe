'use client';

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import walletService, { type CreateDepositResponse, type DepositStatus } from '@/services/wallet-service';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, CheckCircle2, Clock, Banknote, AlertTriangle } from 'lucide-react';
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
			<div className='mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full max-w-5xl'>
				<h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2'>
					Nạp tiền vào ví
				</h1>
				<p className='text-sm text-gray-600 dark:text-gray-400 mb-6'>
					Nạp tiền nhanh qua chuyển khoản tự động, cập nhật số dư tức thời.
				</p>

				<div className='bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 sm:p-8 mb-8'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-gray-500 dark:text-gray-400'>Số dư hiện tại</p>
							<p className='text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-1'>
								{walletLoading ? '...' : formatCurrency(walletInfo?.wallet?.balance || 0)}
							</p>
						</div>
						<div className='p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-2'>
							<Banknote className='w-5 h-5' />
							<span>Nạp nhanh 24/7</span>
						</div>
					</div>
				</div>

				<div className='bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 sm:p-8'>
					<h2 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>Tạo yêu cầu nạp</h2>
					<div className='grid sm:grid-cols-2 gap-4'>
						<div>
							<label className='text-sm text-gray-600 dark:text-gray-300 mb-1 block'>Số tiền</label>
							<Input
								type='number'
								min={10000}
								step={10000}
								value={amount}
								onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
								className='h-11'
							/>
							<p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>Tối thiểu 10.000đ</p>
							<div className='mt-3 flex flex-wrap gap-2'>
								{[10000, 50000, 100000, 200000, 500000].map((v) => (
									<Button
										key={v}
										type='button'
										variant='outline'
										size='sm'
										onClick={() => setAmount(v)}
									>
										{formatCurrency(v)}
									</Button>
								))}
							</div>
						</div>
						<div>
							<label className='text-sm text-gray-600 dark:text-gray-300 mb-1 block'>Phương thức</label>
							<Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
								<SelectTrigger className='h-11'>
									<SelectValue placeholder='Chọn phương thức' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='sepay'>Chuyển khoản tự động (Sepay)</SelectItem>
									<SelectItem value='bank_transfer'>Chuyển khoản ngân hàng</SelectItem>
									<SelectItem value='momo'>Momo</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className='mt-6 flex flex-col sm:flex-row gap-3'>
						<Button
							onClick={() => createDepositMutation.mutate()}
							disabled={disabled || amount < 10000}
							className='h-11 px-6'
						>
							{disabled ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Tạo yêu cầu'}
						</Button>
						<p className='text-xs text-gray-500 dark:text-gray-400 sm:self-center'>
							Sau khi tạo, bạn sẽ nhận nội dung chuyển khoản và QR.
						</p>
					</div>
				</div>

				{currentDeposit && (
					<div className='mt-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 sm:p-8'>
						<h2 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>Hướng dẫn thanh toán</h2>
						<div className='grid sm:grid-cols-2 gap-4'>
							<div>
								<p className='text-sm text-gray-500 dark:text-gray-400'>Số tiền</p>
								<div className='mt-1 flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-3 py-2'>
									<span className='font-semibold'>{formatCurrency(currentDeposit.amount)}</span>
									<Button
										variant='outline'
										size='sm'
										onClick={() => handleCopy(String(currentDeposit.amount), 'số tiền')}
									>
										<Copy className='w-4 h-4' />
									</Button>
								</div>
							</div>
							<div>
								<p className='text-sm text-gray-500 dark:text-gray-400'>Nội dung chuyển khoản</p>
								<div className='mt-1 flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-3 py-2'>
									<span className='font-mono text-sm'>{currentDeposit.paymentCode}</span>
									<Button
										variant='outline'
										size='sm'
										onClick={() => handleCopy(currentDeposit.paymentCode, 'nội dung chuyển khoản')}
									>
										<Copy className='w-4 h-4' />
									</Button>
								</div>
							</div>
						</div>

						<div className='grid sm:grid-cols-2 gap-4 mt-4'>
							<div>
								<p className='text-sm text-gray-500 dark:text-gray-400'>Phương thức</p>
								<div className='mt-1 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2'>
									<span className='uppercase text-xs'>{currentDeposit.paymentMethod}</span>
								</div>
							</div>
							<div>
								<p className='text-sm text-gray-500 dark:text-gray-400'>Hết hạn</p>
								<div className='mt-1 flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2'>
									<Clock className='w-4 h-4 text-gray-500' />
									<span className='text-sm'>
										{new Date(currentDeposit.expiresAt).toLocaleString()}
									</span>
								</div>
							</div>
						</div>

						{/* Bank details & VietQR */}
						{currentDeposit.paymentMethod === 'sepay' && (
							<div className='grid sm:grid-cols-2 gap-4 mt-4'>
								<div className='space-y-3'>
									<div>
										<p className='text-sm text-gray-500 dark:text-gray-400'>Ngân hàng</p>
										<div className='mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-3 py-2'>
											<span className='text-sm'>
												{(currentDeposit as any).instructions?.bankName || '—'}
											</span>
										</div>
									</div>
									<div>
										<p className='text-sm text-gray-500 dark:text-gray-400'>Số tài khoản</p>
										<div className='mt-1 flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-3 py-2'>
											<span className='font-mono text-sm'>
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
											>
												<Copy className='w-4 h-4' />
											</Button>
										</div>
									</div>
									<div>
										<p className='text-sm text-gray-500 dark:text-gray-400'>Chủ tài khoản</p>
										<div className='mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-3 py-2'>
											<span className='text-sm'>
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
											className='w-64 h-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white shadow-sm'
										/>
									) : (
										<Image
											src='/images/QR_Code.png'
											alt='QR Code'
											width={256}
											height={256}
											className='rounded-xl border border-gray-200 dark:border-gray-700 bg-white shadow-sm'
										/>
									)}
								</div>
							</div>
						)}

						{currentDeposit.instructions?.bankName && (
							<div className='mt-6 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 p-4 sm:p-5 text-amber-800 dark:text-amber-200 flex items-start gap-3'>
								<AlertTriangle className='w-5 h-5 mt-0.5' />
								<div>
									<p className='text-sm'>Vui lòng chuyển khoản chính xác nội dung và số tiền.</p>
									<ul className='text-sm mt-2 list-disc pl-5 space-y-1'>
										<li>Ngân hàng: {currentDeposit.instructions.bankName}</li>
										<li>Chủ tài khoản: {currentDeposit.instructions.accountName}</li>
										<li>Số tài khoản: {currentDeposit.instructions.accountNumber}</li>
									</ul>
								</div>
							</div>
						)}

						<div className='mt-6 flex items-center gap-3'>
							{status === 'completed' ? (
								<span className='inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400'>
									<CheckCircle2 className='w-5 h-5' />
									Đã nhận tiền vào ví
								</span>
							) : (
								<span className='inline-flex items-center gap-2 text-gray-600 dark:text-gray-400'>
									<Clock className='w-5 h-5' />
									Đang chờ thanh toán...
								</span>
							)}
						</div>
					</div>
				)}
				{/* Deposit history */}
				<div className='mt-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 sm:p-8'>
					<div className='flex items-center justify-between mb-4'>
						<h2 className='text-lg font-semibold text-gray-900 dark:text-white'>Lịch sử nạp tiền</h2>
						<span className='text-xs text-gray-500 dark:text-gray-400'>Tối đa 10 mục mỗi trang</span>
					</div>
					<div className='hidden sm:grid grid-cols-12 gap-3 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700'>
						<div className='col-span-3'>Thời gian</div>
						<div className='col-span-3'>Mã nội dung</div>
						<div className='col-span-2 text-right'>Số tiền</div>
						<div className='col-span-2'>Phương thức</div>
						<div className='col-span-2 text-center'>Trạng thái</div>
					</div>
					<div className='divide-y divide-gray-200 dark:divide-gray-700'>
						{depositHistory?.items?.length ? (
							depositHistory.items.map((d: any) => (
								<div
									key={d.id}
									className='grid grid-cols-12 gap-3 px-3 py-3 items-center text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors'
								>
									<div className='col-span-12 sm:col-span-3 text-gray-800 dark:text-gray-200'>
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
											className='h-7 px-2'
										>
											<Copy className='w-4 h-4' />
										</Button>
									</div>
									<div className='col-span-6 sm:col-span-2 text-right font-semibold text-gray-900 dark:text-white'>
										{formatCurrency(Number(d.amount))}
									</div>
									<div className='col-span-6 sm:col-span-2 uppercase text-[11px] tracking-wide text-gray-500 dark:text-gray-400'>
										{(d.paymentMethod || d.payment_method) ?? ''}
									</div>
									<div className='col-span-12 sm:col-span-2 flex sm:justify-center'>
										<span
											className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
												d.status === 'completed'
													? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
													: d.status === 'pending'
													? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
													: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
											}`}
										>
											{d.status}
										</span>
									</div>
								</div>
							))
						) : (
							<div className='px-3 py-6 text-center text-gray-500 dark:text-gray-400'>
								Chưa có lịch sử nạp
							</div>
						)}
					</div>

					{(depositHistory?.totalPages || 1) > 1 && (
						<div className='mt-4 flex items-center justify-center gap-2'>
							<Button
								variant='outline'
								disabled={depPage <= 1}
								onClick={() => setDepPage((p) => Math.max(1, p - 1))}
							>
								Trang trước
							</Button>
							<span className='text-sm text-gray-600 dark:text-gray-400'>
								Trang {depPage} / {depositHistory?.totalPages || 1}
							</span>
							<Button
								variant='outline'
								disabled={depPage >= (depositHistory?.totalPages || 1)}
								onClick={() => setDepPage((p) => Math.min(depositHistory?.totalPages || 1, p + 1))}
							>
								Trang sau
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
