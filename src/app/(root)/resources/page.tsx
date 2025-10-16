// src/app/resources/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
	Package,
	Copy,
	Download,
	Eye,
	EyeOff,
	Clock,
	Search,
	AlertCircle,
	CheckCircle,
	ExternalLink,
	Shield,
	Loader2,
	FileText,
	Calendar,
	PackageOpen,
	Database,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/utils/format-date';
import resourceService, { ResourceItem } from '@/services/resource-service';
import { useAuth } from '@/context/auth-context';
import { toast } from 'react-toastify';

// ============ UTILITY FUNCTIONS ============

function getDaysUntilExpiry(expiresAt: string): number {
	const now = new Date();
	const expiry = new Date(expiresAt);
	const diffTime = expiry.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays;
}

function isExpired(expiresAt: string): boolean {
	return new Date(expiresAt) < new Date();
}

function formatExpiryDate(expiresAt: string): string {
	const days = getDaysUntilExpiry(expiresAt);

	if (days < 0) return 'Đã hết hạn';
	if (days === 0) return 'Hết hạn hôm nay';
	if (days === 1) return 'Còn 1 ngày';
	if (days <= 7) return `Còn ${days} ngày`;

	return formatDate(expiresAt);
}

function copyToClipboard(text: string) {
	navigator.clipboard.writeText(text);
	toast.success('Đã sao chép vào clipboard!', {
		position: 'top-right',
		autoClose: 2000,
	});
}

function downloadAsFile(content: string, filename: string) {
	const blob = new Blob([content], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);

	toast.success('Đã tải xuống file!', {
		position: 'top-right',
		autoClose: 2000,
	});
}

// ============ COMPONENTS ============

function ExpiryBadge({ expiresAt }: { expiresAt: string }) {
	const days = getDaysUntilExpiry(expiresAt);
	const expired = isExpired(expiresAt);

	if (expired) {
		return (
			<Badge className='bg-gray-600 text-white dark:bg-gray-700 flex items-center gap-1 shadow-sm font-semibold'>
				<AlertCircle className='w-3 h-3' />
				Đã hết hạn
			</Badge>
		);
	}

	if (days <= 7) {
		return (
			<Badge className='bg-gray-500 text-white dark:bg-gray-600 flex items-center gap-1 shadow-sm font-semibold'>
				<Clock className='w-3 h-3' />
				Còn {days} ngày
			</Badge>
		);
	}

	return (
		<Badge className='bg-blue-600 text-white dark:bg-blue-500 flex items-center gap-1 shadow-sm font-semibold'>
			<CheckCircle className='w-3 h-3' />
			Còn {days} ngày
		</Badge>
	);
}

function ResourceCard({ item }: { item: ResourceItem }) {
	const [showData, setShowData] = useState(false);
	const expired = isExpired(item.expires_at);
	const expiringSoon = !expired && getDaysUntilExpiry(item.expires_at) <= 7;

	return (
		<Card
			className={`hover:shadow-2xl transition-all duration-300 border ${
				expired
					? 'border-gray-300 dark:border-gray-700 opacity-60'
					: expiringSoon
					? 'border-gray-400 dark:border-gray-600'
					: 'border-gray-200 dark:border-gray-700'
			} bg-white dark:bg-gray-800 overflow-hidden group`}
		>
			{/* Top colored bar */}
			<div className={`h-1.5 ${expired ? 'bg-gray-600' : expiringSoon ? 'bg-gray-500' : 'bg-blue-600'}`}></div>

			<CardContent className='pt-5 sm:pt-6'>
				<div className='space-y-4'>
					{/* Header */}
					<div className='flex items-start justify-between gap-3'>
						<div className='flex items-center gap-3'>
							<div
								className={`p-3 rounded-xl shadow-lg ${
									expired ? 'bg-gray-600 dark:bg-gray-700' : 'bg-blue-600 dark:bg-blue-500'
								}`}
							>
								<FileText className='w-5 h-5 text-white' />
							</div>
							<div>
								<p className='font-bold text-gray-900 dark:text-white'>
									#{item.id.slice(0, 8).toUpperCase()}
								</p>
								<div className='flex items-center gap-1 mt-0.5'>
									<Calendar className='w-3 h-3 text-gray-400' />
									<p className='text-xs text-gray-500 dark:text-gray-400'>
										{formatDate(item.created_at)}
									</p>
								</div>
							</div>
						</div>
						<ExpiryBadge expiresAt={item.expires_at} />
					</div>

					{/* Data Display */}
					<div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700'>
						<div className='flex items-center justify-between mb-3'>
							<span className='text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2'>
								<Database className='w-4 h-4 text-blue-600 dark:text-blue-400' />
								Nội dung tài nguyên
							</span>
							<Button
								variant='ghost'
								size='sm'
								onClick={() => setShowData(!showData)}
								className='h-9 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-semibold'
							>
								{showData ? (
									<>
										<EyeOff className='w-4 h-4 mr-2' />
										Ẩn
									</>
								) : (
									<>
										<Eye className='w-4 h-4 mr-2' />
										Hiện
									</>
								)}
							</Button>
						</div>

						{showData ? (
							<div className='relative'>
								<pre className='text-xs sm:text-sm font-mono bg-white dark:bg-gray-950 p-3 sm:p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-pre-wrap break-all max-h-64 overflow-y-auto'>
									{item.data}
								</pre>
							</div>
						) : (
							<div className='flex items-center justify-center h-32 bg-gray-100 dark:bg-gray-950 rounded-lg border-2 border-gray-200 dark:border-gray-700'>
								<div className='text-center'>
									<Shield className='w-12 h-12 text-gray-400 mx-auto mb-2' />
									<p className='text-xs text-gray-500 dark:text-gray-400 font-medium'>
										Nhấn "Hiện" để xem nội dung
									</p>
								</div>
							</div>
						)}
					</div>

					{/* Expiry Warning */}
					{!expired && expiringSoon && (
						<div className='bg-gray-100 dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-4'>
							<div className='flex items-center gap-2 text-gray-900 dark:text-gray-200'>
								<Clock className='w-4 h-4 flex-shrink-0' />
								<p className='text-sm font-semibold'>
									Tài nguyên này sẽ hết hạn vào {formatExpiryDate(item.expires_at)}
								</p>
							</div>
						</div>
					)}

					{expired && (
						<div className='bg-gray-100 dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-4'>
							<div className='flex items-center gap-2 text-gray-900 dark:text-gray-200'>
								<AlertCircle className='w-4 h-4 flex-shrink-0' />
								<p className='text-sm font-semibold'>Tài nguyên này đã hết hạn và sẽ bị xóa tự động</p>
							</div>
						</div>
					)}

					{/* Actions */}
					<div className='flex flex-wrap gap-2 pt-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={() => copyToClipboard(item.data)}
							disabled={expired}
							className='flex-1 h-10 sm:h-11 border-2 rounded-xl font-semibold hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-all'
						>
							<Copy className='w-4 h-4 mr-2' />
							Sao chép
						</Button>

						<Button
							variant='outline'
							size='sm'
							onClick={() => downloadAsFile(item.data, `resource-${item.id.slice(0, 8)}.txt`)}
							disabled={expired}
							className='flex-1 h-10 sm:h-11 border-2 rounded-xl font-semibold hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-all'
						>
							<Download className='w-4 h-4 mr-2' />
							Tải xuống
						</Button>

						<Link href={`/orders/${item.order_id}`} className='flex-1'>
							<Button
								variant='outline'
								size='sm'
								className='w-full h-10 sm:h-11 border-2 rounded-xl font-semibold hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-all'
							>
								<ExternalLink className='w-4 h-4 mr-2' />
								Xem đơn
							</Button>
						</Link>
					</div>

					{/* Expiry Info Footer */}
					<div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700'>
						<Calendar className='w-3.5 h-3.5' />
						<span className='font-medium'>Hết hạn: {formatDate(item.expires_at)}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function EmptyResources() {
	return (
		<div className='text-center py-16 sm:py-24'>
			<div className='bg-gray-100 dark:bg-gray-800 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg'>
				<PackageOpen className='w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500' />
			</div>
			<h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2'>Chưa có tài nguyên nào</h3>
			<p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6'>
				Tài nguyên đã mua sẽ hiển thị tại đây và tự động xóa sau 30 ngày
			</p>
			<Link href='/'>
				<Button className='h-11 sm:h-12 px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-lg font-semibold'>
					<Package className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
					Khám phá sản phẩm
				</Button>
			</Link>
		</div>
	);
}

function ResourcesStats({ items }: { items: ResourceItem[] }) {
	const total = items.length;
	const active = items.filter((item) => !isExpired(item.expires_at)).length;
	const expiringSoon = items.filter(
		(item) => !isExpired(item.expires_at) && getDaysUntilExpiry(item.expires_at) <= 7
	).length;
	const expired = items.filter((item) => isExpired(item.expires_at)).length;

	const stats = [
		{ label: 'Tổng số', value: total, color: 'bg-gray-600 dark:bg-gray-700' },
		{ label: 'Khả dụng', value: active, color: 'bg-blue-600 dark:bg-blue-500' },
		{ label: 'Sắp hết hạn', value: expiringSoon, color: 'bg-gray-500 dark:bg-gray-600' },
		{ label: 'Đã hết hạn', value: expired, color: 'bg-gray-600 dark:bg-gray-700' },
	];

	return (
		<div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8'>
			{stats.map((stat, idx) => (
				<Card key={idx} className='border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all'>
					<CardContent className='pt-5 sm:pt-6'>
						<div className='text-center'>
							<div
								className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg`}
							>
								<span className='text-2xl font-black text-white'>{stat.value}</span>
							</div>
							<p className='text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400'>
								{stat.label}
							</p>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

// ============ MAIN COMPONENT ============

export default function ResourcesPage() {
	const { user } = useAuth();
	const [searchQuery, setSearchQuery] = useState('');
	const [showExpired, setShowExpired] = useState(false);

	const { data, isLoading, isError } = useQuery({
		queryKey: ['resources'],
		queryFn: () => resourceService.getResources(),
		enabled: !!user,
	});

	if (!user) {
		return (
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4'>
				<div className='text-center'>
					<div className='bg-blue-600 dark:bg-blue-500 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl'>
						<Package className='w-10 h-10 sm:w-12 sm:h-12 text-white' />
					</div>
					<h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3'>
						Vui lòng đăng nhập
					</h2>
					<p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6'>
						Bạn cần đăng nhập để xem tài nguyên
					</p>
					<Link href='/sign-in'>
						<Button
							size='lg'
							className='h-12 sm:h-14 px-8 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-lg font-bold'
						>
							Đăng nhập ngay
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
				<div className='text-center'>
					<div className='relative'>
						<Loader2 className='w-12 h-12 animate-spin text-blue-600 dark:text-blue-500 mx-auto mb-4' />
						<div className='absolute inset-0 blur-xl bg-blue-500/20 animate-pulse'></div>
					</div>
					<p className='text-gray-600 dark:text-gray-400 font-medium'>Đang tải tài nguyên...</p>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4'>
				<div className='text-center'>
					<div className='bg-gray-600 dark:bg-gray-700 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl'>
						<AlertCircle className='w-10 h-10 sm:w-12 sm:h-12 text-white' />
					</div>
					<h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3'>
						Lỗi tải dữ liệu
					</h2>
					<p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6'>
						Không thể tải danh sách tài nguyên
					</p>
					<Button
						onClick={() => window.location.reload()}
						className='bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-lg font-semibold'
					>
						Thử lại
					</Button>
				</div>
			</div>
		);
	}

	const items = data?.items || [];

	// Filter items
	const filteredItems = items.filter((item) => {
		const matchesSearch =
			searchQuery === '' ||
			item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.data.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesExpired = showExpired || !isExpired(item.expires_at);

		return matchesSearch && matchesExpired;
	});

	// Sort by created_at desc
	const sortedItems = [...filteredItems].sort(
		(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	);

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
			<div className='mx-auto'>
				{/* Header */}
				<div className='mb-6 sm:mb-8'>
					<div className='flex items-center gap-3 sm:gap-4 mb-3'>
						<div className='bg-blue-600 dark:bg-blue-500 p-2.5 sm:p-3 rounded-2xl shadow-lg'>
							<Database className='w-6 h-6 sm:w-7 sm:h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white'>
								Tài nguyên đã mua
							</h1>
							<p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1'>
								Quản lý và truy cập tài nguyên của bạn (tự động xóa sau 30 ngày)
							</p>
						</div>
					</div>
				</div>

				{/* Stats */}
				{items.length > 0 && <ResourcesStats items={items} />}

				{/* Warning */}
				<Card className='mb-6 sm:mb-8 border-2 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20'>
					<CardContent className='pt-5 sm:pt-6'>
						<div className='flex items-start gap-3'>
							<AlertCircle className='w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5' />
							<div className='flex-1'>
								<h3 className='font-bold text-blue-900 dark:text-blue-200 mb-2 text-base sm:text-lg'>
									Lưu ý quan trọng
								</h3>
								<ul className='text-sm text-blue-800 dark:text-blue-300 space-y-2'>
									<li className='flex items-start gap-2'>
										<span className='font-bold'>•</span>
										<span>
											Tất cả tài nguyên sẽ <strong>tự động xóa sau 30 ngày</strong> kể từ ngày mua
										</span>
									</li>
									<li className='flex items-start gap-2'>
										<span className='font-bold'>•</span>
										<span>
											Vui lòng <strong>sao chép hoặc tải xuống</strong> thông tin quan trọng ngay
										</span>
									</li>
									<li className='flex items-start gap-2'>
										<span className='font-bold'>•</span>
										<span>Không thể khôi phục sau khi đã xóa</span>
									</li>
									<li className='flex items-start gap-2'>
										<span className='font-bold'>•</span>
										<span>Liên hệ hỗ trợ nếu cần gia hạn thời gian</span>
									</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Filters */}
				<Card className='mb-6 sm:mb-8 border border-gray-200 dark:border-gray-700 shadow-xl'>
					<CardContent className='pt-5 sm:pt-6'>
						<div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
							<div className='flex-1 relative'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400' />
								<Input
									placeholder='Tìm kiếm theo ID, mã đơn hàng, hoặc nội dung...'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className='pl-10 sm:pl-12 h-12 border-2 rounded-xl text-base'
								/>
							</div>
							<Button
								variant={showExpired ? 'default' : 'outline'}
								onClick={() => setShowExpired(!showExpired)}
								className={`sm:w-auto h-12 rounded-xl border-2 font-semibold shadow-md ${
									showExpired
										? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
										: ''
								}`}
							>
								{showExpired ? (
									<>
										<Eye className='w-4 h-4 mr-2' />
										Hiện tất cả
									</>
								) : (
									<>
										<EyeOff className='w-4 h-4 mr-2' />
										Ẩn đã hết hạn
									</>
								)}
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Resources List */}
				{sortedItems.length === 0 ? (
					items.length === 0 ? (
						<EmptyResources />
					) : (
						<div className='text-center py-16 sm:py-24'>
							<div className='bg-gray-100 dark:bg-gray-800 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg'>
								<Search className='w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500' />
							</div>
							<h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2'>
								Không tìm thấy kết quả
							</h3>
							<p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6'>
								Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
							</p>
							<Button
								variant='outline'
								onClick={() => setSearchQuery('')}
								className='h-11 rounded-xl border-2 font-semibold'
							>
								Xóa bộ lọc
							</Button>
						</div>
					)
				) : (
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6'>
						{sortedItems.map((item) => (
							<ResourceCard key={item.id} item={item} />
						))}
					</div>
				)}

				{/* Help Section */}
				{items.length > 0 && (
					<Card className='mt-8 border border-gray-200 dark:border-gray-700 shadow-xl'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
								<AlertCircle className='w-5 h-5 text-blue-600 dark:text-blue-400' />
								Cần hỗ trợ?
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4'>
								Nếu bạn gặp vấn đề với tài nguyên đã mua hoặc cần gia hạn thời gian, vui lòng liên hệ:
							</p>
							<div className='flex flex-wrap gap-2'>
								<Button variant='outline' size='sm' className='h-10 rounded-xl border-2 font-semibold'>
									<ExternalLink className='w-4 h-4 mr-2' />
									Chat hỗ trợ
								</Button>
								<Button variant='outline' size='sm' className='h-10 rounded-xl border-2 font-semibold'>
									<ExternalLink className='w-4 h-4 mr-2' />
									Email: support@shop.com
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
