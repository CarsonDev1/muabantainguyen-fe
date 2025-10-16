'use client';

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarHeader,
} from '@/components/ui/sidebar';
import {
	Home,
	Inbox,
	Calendar,
	Search,
	Settings,
	Users,
	Percent,
	Tag,
	Wallet,
	Shield,
	MessageSquare,
	Bell,
	HelpCircle,
	Package,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getWallet } from '@/services/wallet-service';
import { formatCurrency } from '@/utils/format-currency';

const items = [
	{ title: 'Trang chủ', url: '/admin', icon: Home },
	{ title: 'Danh mục', url: '/admin/categories', icon: Inbox },
	{ title: 'Người dùng', url: '/admin/users', icon: Users },
	{ title: 'Quản trị viên', url: '/admin/admins', icon: Shield },
	{ title: 'Vai trò & Quyền', url: '/admin/roles', icon: Settings },
	{ title: 'Voucher', url: '/admin/vouchers', icon: Tag },
	{ title: 'Đơn hàng', url: '/admin/orders', icon: Calendar },
	{ title: 'Sản phẩm', url: '/admin/products', icon: Search },
	{ title: 'Ví', url: '/admin/wallet', icon: Wallet },
	{ title: 'Quản lý Kho', url: '/admin/inventory', icon: Package },
	{ title: 'FAQ', url: '/admin/faqs', icon: HelpCircle },
	{ title: 'Thông báo', url: '/admin/announcements', icon: Bell },
];

export function AppSidebar() {
	const pathname = usePathname();

	const { data: walletData } = useQuery({
		queryKey: ['wallet'],
		queryFn: getWallet,
	});

	const isActive = (url: string) => {
		if (url === '/admin') {
			return pathname === '/admin';
		}
		return pathname.startsWith(url);
	};

	const balance = walletData?.wallet?.balance ?? 0;

	return (
		<Sidebar collapsible='icon' variant='inset' className='border-b border'>
			<SidebarHeader className='mb-4'>
				<div className='flex items-center gap-2'>
					<div className='h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center'>
						<span className='text-white font-bold text-sm'>L</span>
					</div>
					<span className='font-semibold text-lg group-data-[collapsible=icon]:hidden'>Logo</span>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarGroupLabel className='flex items-center gap-2 justify-center text-black text-sm font-semibold mb-4 bg-yellow-300 rounded-md p-2'>
							<span>Số dư: {formatCurrency(balance)}</span>
						</SidebarGroupLabel>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										tooltip={item.title}
										isActive={isActive(item.url)}
										style={
											isActive(item.url)
												? {
														backgroundColor: '#e3e2fe',
														color: '#264edc',
														fontWeight: 'bold',
												  }
												: {}
										}
										className='text-base'
									>
										<Link href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
