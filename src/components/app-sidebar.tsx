import {
	Home,
	Inbox,
	Users,
	Shield,
	Settings,
	Tag,
	Calendar,
	Search,
	Percent,
	Wallet,
	HelpCircle,
	Bell,
	Package,
} from 'lucide-react';

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';

// Menu items.
const items = [
	{
		title: 'Trang chủ',
		url: '/admin',
		icon: Home,
	},
	{
		title: 'Danh mục',
		url: '/admin/categories',
		icon: Inbox,
	},
	{
		title: 'Người dùng',
		url: '/admin/users',
		icon: Users,
	},
	{
		title: 'Quản trị viên',
		url: '/admin/admins',
		icon: Shield,
	},
	{
		title: 'Vai trò & Quyền',
		url: '/admin/roles',
		icon: Settings,
	},
	{
		title: 'Voucher',
		url: '/admin/vouchers',
		icon: Tag,
	},
	{
		title: 'Đơn hàng',
		url: '/admin/orders',
		icon: Calendar,
	},
	{
		title: 'Sản phẩm',
		url: '/admin/products',
		icon: Search,
	},
	{
		title: 'Khuyến mãi',
		url: '/admin/promotions',
		icon: Percent,
	},
	{
		title: 'Ví',
		url: '/admin/wallet',
		icon: Wallet,
	},
	{
		title: 'Quản lý Kho',
		url: '/admin/inventory',
		icon: Package,
	},
	{
		title: 'FAQ',
		url: '/admin/faqs',
		icon: HelpCircle,
	},
	{
		title: 'Thông báo',
		url: '/admin/announcements',
		icon: Bell,
	},
	{
		title: 'Cài đặt',
		url: '/admin/settings',
		icon: Settings,
	},
];

export function AppSidebar() {
	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Application</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
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
