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
			<Badge className='bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1'>
				<AlertCircle className='w-3 h-3' />
				Đã hết hạn
			</Badge>
		);
	}

	if (days <= 3) {
		return (
			<Badge className='bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 flex items-center gap-1'>
				<Clock className='w-3 h-3' />
				Còn {days} ngày
			</Badge>
		);
	}

	if (days <= 7) {
		return (
			<Badge className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center gap-1'>
				<Clock className='w-3 h-3' />
				Còn {days} ngày
			</Badge>
		);
	}

	return (
		<Badge className='bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1'>
			<CheckCircle className='w-3 h-3' />
			Còn {days} ngày
		</Badge>
	);
}

function ResourceCard({ item }: { item: ResourceItem }) {
	const [showData, setShowData] = useState(false);
	const expired = isExpired(item.expires_at);

	return (
		<Card className={`hover:shadow-md transition-shadow ${expired ? 'opacity-60' : ''}`}>
			<CardContent className='pt-6'>
				<div className='space-y-4'>
					{/* Header */}
					<div className='flex items-start justify-between'>
						<div className='flex items-center gap-3'>
							<div className='p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
								<FileText className='w-5 h-5 text-blue-600 dark:text-blue-400' />
							</div>
							<div>
								<p className='font-medium text-gray-900 dark:text-white'>
									Tài nguyên #{item.id.slice(0, 8).toUpperCase()}
								</p>
								<p className='text-xs text-gray-500 dark:text-gray-400'>
									{formatDate(item.created_at)}
								</p>
							</div>
						</div>
						<ExpiryBadge expiresAt={item.expires_at} />
					</div>

					{/* Data Display */}
					<div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700'>
						<div className='flex items-center justify-between mb-2'>
							<span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Nội dung:</span>
							<Button variant='ghost' size='sm' onClick={() => setShowData(!showData)} className='h-8'>
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
								<pre className='text-sm font-mono bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-pre-wrap break-all'>
									{item.data}
								</pre>
							</div>
						) : (
							<div className='flex items-center justify-center h-20 bg-gray-100 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700'>
								<Shield className='w-8 h-8 text-gray-400' />
							</div>
						)}
					</div>

					{/* Expiry Warning */}
					{!expired && getDaysUntilExpiry(item.expires_at) <= 7 && (
						<div className='bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3'>
							<div className='flex items-center gap-2 text-orange-800 dark:text-orange-200'>
								<Clock className='w-4 h-4' />
								<p className='text-sm font-medium'>
									Tài nguyên này sẽ hết hạn vào {formatExpiryDate(item.expires_at)}
								</p>
							</div>
						</div>
					)}

					{expired && (
						<div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3'>
							<div className='flex items-center gap-2 text-red-800 dark:text-red-200'>
								<AlertCircle className='w-4 h-4' />
								<p className='text-sm font-medium'>Tài nguyên này đã hết hạn và sẽ bị xóa tự động</p>
							</div>
						</div>
					)}

					{/* Actions */}
					<div className='flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-800'>
						<Button
							variant='outline'
							size='sm'
							onClick={() => copyToClipboard(item.data)}
							disabled={expired}
							className='flex-1'
						>
							<Copy className='w-4 h-4 mr-2' />
							Sao chép
						</Button>

						<Button
							variant='outline'
							size='sm'
							onClick={() => downloadAsFile(item.data, `resource-${item.id.slice(0, 8)}.txt`)}
							disabled={expired}
							className='flex-1'
						>
							<Download className='w-4 h-4 mr-2' />
							Tải xuống
						</Button>

						<Link href={`/orders/${item.order_id}`} className='flex-1'>
							<Button variant='outline' size='sm' className='w-full'>
								<ExternalLink className='w-4 h-4 mr-2' />
								Xem đơn hàng
							</Button>
						</Link>
					</div>

					{/* Expiry Info */}
					<div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2'>
						<Calendar className='w-3 h-3' />
						<span>Hết hạn: {formatDate(item.expires_at)}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function EmptyResources() {
	return (
		<div className='text-center py-16'>
			<PackageOpen className='w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
			<h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>Chưa có tài nguyên nào</h3>
			<p className='text-gray-500 dark:text-gray-400 mb-6'>
				Tài nguyên đã mua sẽ hiển thị tại đây và tự động xóa sau 30 ngày
			</p>
			<Link href='/'>
				<Button>
					<Package className='w-4 h-4 mr-2' />
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

	return (
		<div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
			<Card>
				<CardContent className='pt-6'>
					<div className='text-center'>
						<p className='text-3xl font-bold text-gray-900 dark:text-white'>{total}</p>
						<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Tổng số</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className='pt-6'>
					<div className='text-center'>
						<p className='text-3xl font-bold text-green-600'>{active}</p>
						<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Khả dụng</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className='pt-6'>
					<div className='text-center'>
						<p className='text-3xl font-bold text-orange-600'>{expiringSoon}</p>
						<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Sắp hết hạn</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className='pt-6'>
					<div className='text-center'>
						<p className='text-3xl font-bold text-red-600'>{expired}</p>
						<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Đã hết hạn</p>
					</div>
				</CardContent>
			</Card>
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
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
				<div className='text-center'>
					<Package className='w-16 h-16 text-gray-400 mx-auto mb-4' />
					<h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>Vui lòng đăng nhập</h2>
					<p className='text-gray-600 dark:text-gray-400 mb-6'>Bạn cần đăng nhập để xem tài nguyên</p>
					<Link href='/sign-in'>
						<Button size='lg'>Đăng nhập</Button>
					</Link>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
				<div className='text-center'>
					<Loader2 className='w-8 h-8 animate-spin mx-auto mb-4 text-blue-600' />
					<p className='text-gray-600 dark:text-gray-400'>Đang tải tài nguyên...</p>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
				<div className='text-center'>
					<AlertCircle className='w-16 h-16 text-red-400 mx-auto mb-4' />
					<h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>Lỗi tải dữ liệu</h2>
					<p className='text-gray-600 dark:text-gray-400 mb-6'>Không thể tải danh sách tài nguyên</p>
					<Button onClick={() => window.location.reload()}>Thử lại</Button>
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
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				{/* Header */}
				<div className='mb-8'>
					<h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>Tài nguyên đã mua</h1>
					<p className='text-gray-600 dark:text-gray-400'>
						Quản lý và truy cập tài nguyên của bạn (tự động xóa sau 30 ngày)
					</p>
				</div>

				{/* Stats */}
				{items.length > 0 && <ResourcesStats items={items} />}

				{/* Warning */}
				<Card className='mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800'>
					<CardContent className='pt-6'>
						<div className='flex items-start gap-3'>
							<AlertCircle className='w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5' />
							<div className='flex-1'>
								<h3 className='font-semibold text-yellow-900 dark:text-yellow-200 mb-1'>
									Lưu ý quan trọng
								</h3>
								<ul className='text-sm text-yellow-800 dark:text-yellow-300 space-y-1'>
									<li>
										• Tất cả tài nguyên sẽ <strong>tự động xóa sau 30 ngày</strong> kể từ ngày mua
									</li>
									<li>
										• Vui lòng <strong>sao chép hoặc tải xuống</strong> thông tin quan trọng ngay
									</li>
									<li>• Không thể khôi phục sau khi đã xóa</li>
									<li>• Liên hệ hỗ trợ nếu cần gia hạn thời gian</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Filters */}
				<Card className='mb-6'>
					<CardContent className='pt-6'>
						<div className='flex flex-col sm:flex-row gap-4'>
							<div className='flex-1 relative'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
								<Input
									placeholder='Tìm kiếm theo ID, mã đơn hàng, hoặc nội dung...'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className='pl-10'
								/>
							</div>
							<Button
								variant={showExpired ? 'default' : 'outline'}
								onClick={() => setShowExpired(!showExpired)}
								className='sm:w-auto'
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
						<div className='text-center py-16'>
							<Search className='w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
							<h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
								Không tìm thấy kết quả
							</h3>
							<p className='text-gray-500 dark:text-gray-400 mb-6'>
								Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
							</p>
							<Button variant='outline' onClick={() => setSearchQuery('')}>
								Xóa bộ lọc
							</Button>
						</div>
					)
				) : (
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
						{sortedItems.map((item) => (
							<ResourceCard key={item.id} item={item} />
						))}
					</div>
				)}

				{/* Help Section */}
				{items.length > 0 && (
					<Card className='mt-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<AlertCircle className='w-5 h-5' />
								Cần hỗ trợ?
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
								Nếu bạn gặp vấn đề với tài nguyên đã mua hoặc cần gia hạn thời gian, vui lòng liên hệ:
							</p>
							<div className='flex flex-wrap gap-2'>
								<Button variant='outline' size='sm'>
									<ExternalLink className='w-4 h-4 mr-2' />
									Chat hỗ trợ
								</Button>
								<Button variant='outline' size='sm'>
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
