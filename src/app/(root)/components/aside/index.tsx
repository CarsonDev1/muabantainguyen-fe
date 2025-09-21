import React from 'react';
import {
	Home,
	Newspaper,
	Gamepad2,
	MessageSquare,
	Clock,
	Star,
	HelpCircle,
	Users,
	ChevronDown,
	ChevronRight,
	Smartphone,
	Computer,
	Headphones,
	Joystick,
	Settings,
	Monitor,
	Tablet,
	Cpu,
	Tv,
	Package,
} from 'lucide-react';
import { getCategoryTree } from '@/services/category-service';
import ClientSidebarWrapper from './ClientSidebarWrapper';

interface MenuItem {
	id: string;
	title: string;
	icon: React.ReactNode;
	href: string;
	isActive?: boolean;
	isExternal?: boolean;
	children?: {
		title: string;
		href: string;
		isExternal?: boolean;
	}[];
}

// Static menu items that don't come from API
const staticMenuItems: MenuItem[] = [
	{
		id: 'home',
		title: 'Trang chủ',
		icon: <Home className='size-9' />,
		href: '/',
	},
];

const getIconByName = (iconName: string = '') => {
	switch (iconName.toLowerCase()) {
		case 'game':
		case 'games':
			return <Gamepad2 className='size-9' />;
		case 'tin công nghệ':
		case 'tech':
			return <Newspaper className='size-9' />;
		case 'tư vấn':
			return <MessageSquare className='size-9' />;
		case 'trên tay':
			return <Clock className='size-9' />;
		case 'đánh giá':
			return <Star className='size-9' />;
		case 'thủ thuật':
			return <HelpCircle className='size-9' />;
		case 'khuyến mãi':
			return <Package className='size-9' />;
		case 'tuyển dụng':
			return <Users className='size-9' />;
		default:
			return <Package className='size-9' />;
	}
};

// Function to determine if an item should be external
const isExternalItem = (categoryName: string, categorySlug: string): boolean => {
	return categoryName.toLowerCase() === 'tuyển dụng' || categorySlug === 'tuyen-dung';
};

// Function to get external URL for specific categories
const getExternalUrl = (categoryName: string, categorySlug: string, defaultHref: string): string => {
	if (isExternalItem(categoryName, categorySlug)) {
		return 'https://vieclam.bachlongmobile.com/';
	}
	return defaultHref;
};

// Server-side function to get menu items
async function getMenuItems(): Promise<MenuItem[]> {
	try {
		const categoriesData = await getCategoryTree();

		if (!categoriesData?.tree) return staticMenuItems;

		// Get only parent categories (those with parent_id === null)
		const parentCategories = categoriesData.tree.filter((cat) => cat.parent_id === null);

		const dynamicMenuItems = parentCategories.map((category) => {
			const isExternal = isExternalItem(category.name, category.slug);
			const href = isExternal
				? getExternalUrl(category.name, category.slug, `/${category.slug}`)
				: `/${category.slug}`;

			return {
				id: category.id,
				title: category.name,
				icon: getIconByName(category.name),
				href,
				isActive: true,
				isExternal,
				children:
					category.children && category.children.length > 0
						? category.children.map((child) => {
								const childIsExternal = isExternalItem(child.name, child.slug);
								const childHref = childIsExternal
									? getExternalUrl(child.name, child.slug, `/${category.slug}/${child.slug}`)
									: `/${category.slug}/${child.slug}`;

								return {
									title: child.name,
									href: childHref,
									isActive: true,
									isExternal: childIsExternal,
								};
						  })
						: undefined,
			};
		});

		return [...staticMenuItems, ...dynamicMenuItems];
	} catch (error) {
		console.error('Error loading categories:', error);
		return staticMenuItems;
	}
}

// Server Component
export default async function Aside() {
	const menuItems = await getMenuItems();

	return <ClientSidebarWrapper menuItems={menuItems} />;
}
