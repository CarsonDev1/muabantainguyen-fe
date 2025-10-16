'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getWallet,
	adminGetWallet,
	getDeposits,
	getTransactions,
	adminAdjust,
	adminRefund,
	type DepositStatus,
	type TransactionType,
} from '@/services/wallet-service';
import { getUsers, type User } from '@/services/user-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/utils/format-currency';

export default function AdminWalletPage() {
	const queryClient = useQueryClient();

	const [depStatus, setDepStatus] = useState<DepositStatus | undefined>(undefined);
	const [depPage, setDepPage] = useState(1);
	const [depPageSize, setDepPageSize] = useState(10);

	const [txType, setTxType] = useState<TransactionType | undefined>(undefined);
	const [startDate, setStartDate] = useState<string>('');
	const [endDate, setEndDate] = useState<string>('');
	const [txPage, setTxPage] = useState(1);
	const [txPageSize, setTxPageSize] = useState(10);

	const [selectedUserId, setSelectedUserId] = useState('');
	const [adjustUserId, setAdjustUserId] = useState('');
	const [adjustAmount, setAdjustAmount] = useState<number>(0);
	const [adjustDesc, setAdjustDesc] = useState('');

	const [refundUserId, setRefundUserId] = useState('');
	const [refundAmount, setRefundAmount] = useState<number>(0);
	const [refundDesc, setRefundDesc] = useState('');
	const [refundRefType, setRefundRefType] = useState('order');
	const [refundRefId, setRefundRefId] = useState('');

	const { data: users = [] } = useQuery({
		queryKey: ['users', { page: 1, pageSize: 100 }],
		queryFn: () => getUsers({ page: 1, pageSize: 100 }).then((res) => res.users || []),
	});

	const { data: walletData, isLoading: walletLoading } = useQuery({
		queryKey: ['wallet', selectedUserId],
		queryFn: () => (selectedUserId ? adminGetWallet(selectedUserId) : getWallet()),
		select: (data) => ({
			wallet: data.wallet,
			stats: data.stats,
		}),
	});

	const { data: deposits } = useQuery({
		queryKey: ['deposits', { page: depPage, pageSize: depPageSize, status: depStatus }],
		queryFn: () => getDeposits({ page: depPage, pageSize: depPageSize, status: depStatus }),
		initialData: { success: true, items: [], total: 0, page: 1, pageSize: 10 },
	});

	const { data: transactions } = useQuery({
		queryKey: ['transactions', { page: txPage, pageSize: txPageSize, type: txType, startDate, endDate }],
		queryFn: () =>
			getTransactions({
				page: txPage,
				pageSize: txPageSize,
				type: txType,
				startDate: startDate || undefined,
				endDate: endDate || undefined,
			}),
		initialData: { success: true, items: [], total: 0, page: 1, pageSize: 10 },
	});

	const adjustMutation = useMutation({
		mutationFn: adminAdjust,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['wallet'] });
			queryClient.invalidateQueries({ queryKey: ['transactions'] });
			setAdjustAmount(0);
			setAdjustDesc('');
			toast.success('Điều chỉnh số dư thành công');
		},
		onError: (error: any) => {
			toast.error(error.message || 'Có lỗi xảy ra khi điều chỉnh số dư');
		},
	});

	const refundMutation = useMutation({
		mutationFn: adminRefund,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['wallet'] });
			queryClient.invalidateQueries({ queryKey: ['transactions'] });
			setRefundAmount(0);
			setRefundDesc('');
			setRefundRefId('');
			toast.success('Hoàn tiền thành công');
		},
		onError: (error: any) => {
			toast.error(error.message || 'Có lỗi xảy ra khi hoàn tiền');
		},
	});

	const handleUserSelection = (userId: string) => {
		const newUserId = userId === 'none' ? '' : userId;
		setSelectedUserId(newUserId);
		setAdjustUserId(newUserId);
		setRefundUserId(newUserId);
	};

	const handleAdjust = () => {
		if (!adjustUserId || !adjustAmount) return;
		adjustMutation.mutate({
			userId: adjustUserId,
			amount: adjustAmount,
			description: adjustDesc || undefined,
		});
	};

	const handleRefund = () => {
		if (!refundUserId || !refundAmount) return;
		refundMutation.mutate({
			userId: refundUserId,
			amount: refundAmount,
			description: refundDesc || undefined,
			referenceType: refundRefType || undefined,
			referenceId: refundRefId || undefined,
		});
	};

	const { wallet, stats } = walletData || {};

	return (
		<div className='space-y-4 p-4 sm:p-6'>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
				<Card>
					<CardHeader className='pb-3'>
						<CardTitle className='text-sm font-medium text-muted-foreground'>Số dư ví</CardTitle>
					</CardHeader>
					<CardContent className='pt-0'>
						<div className='text-xl sm:text-2xl font-bold'>{formatCurrency(wallet?.balance ?? 0)}</div>
						<div className='text-xs sm:text-sm text-muted-foreground mt-1'>
							Cập nhật: {wallet?.updated_at ? new Date(wallet.updated_at).toLocaleString() : '-'}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='pb-3'>
						<CardTitle className='text-sm font-medium text-muted-foreground'>Đã nạp</CardTitle>
					</CardHeader>
					<CardContent className='pt-0'>
						<div className='text-xl sm:text-2xl font-bold'>
							{formatCurrency(stats?.total_deposits ?? 0)}
						</div>
					</CardContent>
				</Card>
				<Card className='sm:col-span-2 lg:col-span-1'>
					<CardHeader className='pb-3'>
						<CardTitle className='text-sm font-medium text-muted-foreground'>Đã chi</CardTitle>
					</CardHeader>
					<CardContent className='pt-0'>
						<div className='text-xl sm:text-2xl font-bold'>
							{formatCurrency(stats?.total_purchases ?? 0)}
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className='text-lg'>Điều chỉnh số dư (Admin)</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 lg:grid-cols-5 gap-4 items-end'>
						<div className='lg:col-span-1'>
							<Label className='text-sm font-medium'>User</Label>
							<Select value={selectedUserId || 'none'} onValueChange={handleUserSelection}>
								<SelectTrigger className='w-full'>
									<SelectValue placeholder='Chọn user' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='none'>Chọn user</SelectItem>
									{users.map((u) => (
										<SelectItem key={u.id} value={u.id}>
											<span className='truncate'>
												{u.name || u.email} ({u.email})
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className='lg:col-span-1'>
							<Label className='text-sm font-medium'>Số tiền (+ nạp / - rút)</Label>
							<Input
								type='number'
								value={adjustAmount}
								onChange={(e) => setAdjustAmount(Number(e.target.value))}
								placeholder='0'
							/>
						</div>
						<div className='lg:col-span-2'>
							<Label className='text-sm font-medium'>Mô tả</Label>
							<Input
								value={adjustDesc}
								onChange={(e) => setAdjustDesc(e.target.value)}
								placeholder='Ghi chú'
							/>
						</div>
						<div className='lg:col-span-1'>
							<Button
								onClick={handleAdjust}
								disabled={adjustMutation.isPending || !adjustUserId || !adjustAmount}
								className='w-full'
							>
								{adjustMutation.isPending ? 'Đang xử lý...' : 'Thực hiện'}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className='text-lg'>Hoàn tiền (Admin)</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end'>
						<div className='sm:col-span-2 lg:col-span-1'>
							<Label className='text-sm font-medium'>User</Label>
							<Select value={selectedUserId || 'none'} onValueChange={handleUserSelection}>
								<SelectTrigger className='w-full'>
									<SelectValue placeholder='Chọn user' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='none'>Chọn user</SelectItem>
									{users.map((u) => (
										<SelectItem key={u.id} value={u.id}>
											<span className='truncate'>
												{u.name || u.email} ({u.email})
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label className='text-sm font-medium'>Số tiền</Label>
							<Input
								type='number'
								value={refundAmount}
								onChange={(e) => setRefundAmount(Number(e.target.value))}
								placeholder='0'
							/>
						</div>
						<div>
							<Label className='text-sm font-medium'>Loại tham chiếu</Label>
							<Input value={refundRefType} onChange={(e) => setRefundRefType(e.target.value)} />
						</div>
						<div>
							<Label className='text-sm font-medium'>Tham chiếu ID</Label>
							<Input value={refundRefId} onChange={(e) => setRefundRefId(e.target.value)} />
						</div>
						<div className='sm:col-span-2 lg:col-span-1'>
							<Label className='text-sm font-medium'>Mô tả</Label>
							<Input value={refundDesc} onChange={(e) => setRefundDesc(e.target.value)} />
						</div>
						<div className='sm:col-span-2 lg:col-span-1'>
							<Button
								onClick={handleRefund}
								disabled={refundMutation.isPending || !refundUserId || !refundAmount}
								className='w-full'
							>
								{refundMutation.isPending ? 'Đang xử lý...' : 'Hoàn tiền'}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className='text-lg'>Lịch sử yêu cầu nạp</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='flex flex-col sm:flex-row gap-3 mb-4'>
						<Select
							value={depStatus || 'all'}
							onValueChange={(v) => setDepStatus(v === 'all' ? undefined : (v as any))}
						>
							<SelectTrigger className='w-full sm:w-40'>
								<SelectValue placeholder='Trạng thái' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>Tất cả</SelectItem>
								<SelectItem value='pending'>pending</SelectItem>
								<SelectItem value='completed'>completed</SelectItem>
								<SelectItem value='expired'>expired</SelectItem>
								<SelectItem value='cancelled'>cancelled</SelectItem>
							</SelectContent>
						</Select>
						<div className='flex gap-2'>
							<Input
								className='w-20'
								type='number'
								value={depPage}
								onChange={(e) => setDepPage(Number(e.target.value) || 1)}
								placeholder='Page'
							/>
							<Input
								className='w-20'
								type='number'
								value={depPageSize}
								onChange={(e) => setDepPageSize(Number(e.target.value) || 10)}
								placeholder='Size'
							/>
						</div>
					</div>
					<div className='overflow-x-auto'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className='min-w-[120px]'>Mã</TableHead>
									<TableHead className='min-w-[100px]'>Số tiền</TableHead>
									<TableHead className='min-w-[100px]'>Trạng thái</TableHead>
									<TableHead className='min-w-[120px]'>Phương thức</TableHead>
									<TableHead className='min-w-[150px]'>Hết hạn</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{deposits.items.map((d: any) => (
									<TableRow key={d.id}>
										<TableCell className='font-mono text-xs'>{d.payment_code}</TableCell>
										<TableCell className='font-semibold'>{formatCurrency(d.amount)}</TableCell>
										<TableCell>
											<span
												className={`px-2 py-1 rounded-full text-xs ${
													d.status === 'completed'
														? 'bg-green-100 text-green-800'
														: d.status === 'pending'
														? 'bg-yellow-100 text-yellow-800'
														: d.status === 'expired'
														? 'bg-red-100 text-red-800'
														: 'bg-gray-100 text-gray-800'
												}`}
											>
												{d.status}
											</span>
										</TableCell>
										<TableCell>{d.payment_method}</TableCell>
										<TableCell className='text-xs'>
											{d.expires_at ? new Date(d.expires_at).toLocaleString() : '-'}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className='text-lg'>Lịch sử giao dịch ví</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='flex flex-col lg:flex-row gap-3 mb-4 flex-wrap'>
						<Select
							value={txType || 'all'}
							onValueChange={(v) => setTxType(v === 'all' ? undefined : (v as any))}
						>
							<SelectTrigger className='w-full lg:w-40'>
								<SelectValue placeholder='Loại giao dịch' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>Tất cả</SelectItem>
								<SelectItem value='deposit'>deposit</SelectItem>
								<SelectItem value='withdraw'>withdraw</SelectItem>
								<SelectItem value='purchase'>purchase</SelectItem>
								<SelectItem value='refund'>refund</SelectItem>
							</SelectContent>
						</Select>
						<div className='flex flex-col sm:flex-row gap-2 flex-1'>
							<Input
								className='flex-1'
								placeholder='YYYY-MM-DD'
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
							/>
							<Input
								className='flex-1'
								placeholder='YYYY-MM-DD'
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
							/>
							<div className='flex gap-2'>
								<Input
									className='w-20'
									type='number'
									value={txPage}
									onChange={(e) => setTxPage(Number(e.target.value) || 1)}
									placeholder='Page'
								/>
								<Input
									className='w-20'
									type='number'
									value={txPageSize}
									onChange={(e) => setTxPageSize(Number(e.target.value) || 10)}
									placeholder='Size'
								/>
							</div>
						</div>
					</div>
					<div className='overflow-x-auto'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className='min-w-[150px]'>Thời gian</TableHead>
									<TableHead className='min-w-[100px]'>Loại</TableHead>
									<TableHead className='min-w-[120px]'>Số tiền</TableHead>
									<TableHead className='min-w-[120px]'>Số dư trước</TableHead>
									<TableHead className='min-w-[120px]'>Số dư sau</TableHead>
									<TableHead className='min-w-[200px]'>Mô tả</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{transactions.items.map((t: any) => (
									<TableRow key={t.id}>
										<TableCell className='text-xs'>
											{t.created_at ? new Date(t.created_at).toLocaleString() : '-'}
										</TableCell>
										<TableCell>
											<span
												className={`px-2 py-1 rounded-full text-xs ${
													t.type === 'deposit'
														? 'bg-green-100 text-green-800'
														: t.type === 'purchase'
														? 'bg-red-100 text-red-800'
														: t.type === 'refund'
														? 'bg-blue-100 text-blue-800'
														: 'bg-gray-100 text-gray-800'
												}`}
											>
												{t.type}
											</span>
										</TableCell>
										<TableCell
											className={`font-semibold ${
												t.type === 'deposit' || t.type === 'refund'
													? 'text-green-600'
													: 'text-red-600'
											}`}
										>
											{t.type === 'deposit' || t.type === 'refund' ? '+' : '-'}
											{formatCurrency(Math.abs(t.amount))}
										</TableCell>
										<TableCell className='font-mono text-sm'>
											{t.balance_before ? formatCurrency(t.balance_before) : '-'}
										</TableCell>
										<TableCell className='font-mono text-sm'>
											{t.balance_after ? formatCurrency(t.balance_after) : '-'}
										</TableCell>
										<TableCell className='text-sm max-w-[200px] truncate' title={t.description}>
											{t.description || '-'}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
