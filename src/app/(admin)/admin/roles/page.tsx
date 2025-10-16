'use client';

import { useQuery } from '@tanstack/react-query';
import { getRoles, getPermissions } from '@/services/admin-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminRolesPage() {
	const { data: rolesData, isLoading: rolesLoading } = useQuery({
		queryKey: ['admin-roles'],
		queryFn: getRoles,
	});

	const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
		queryKey: ['admin-permissions'],
		queryFn: getPermissions,
	});

	if (rolesLoading || permissionsLoading) {
		return (
			<div className='flex items-center justify-center h-64 text-muted-foreground'>
				<div className='animate-pulse text-lg font-medium'>Đang tải dữ liệu...</div>
			</div>
		);
	}

	const roles = rolesData?.roles || [];
	const permissions = permissionsData?.permissions || {};

	const getModuleIcon = (module: string) => {
		switch (module) {
			case 'products':
				return <Settings className='w-4 h-4' />;
			case 'orders':
				return <Users className='w-4 h-4' />;
			case 'admins':
				return <Shield className='w-4 h-4' />;
			default:
				return <Settings className='w-4 h-4' />;
		}
	};

	const getModuleColor = (module: string) => {
		const base = 'px-2 py-0.5 rounded-full text-xs font-semibold';
		switch (module) {
			case 'products':
				return cn(base, 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200');
			case 'orders':
				return cn(base, 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200');
			case 'admins':
				return cn(base, 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200');
			case 'users':
				return cn(base, 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200');
			case 'categories':
				return cn(base, 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200');
			case 'vouchers':
				return cn(base, 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200');
			case 'settings':
				return cn(base, 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200');
			default:
				return cn(base, 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200');
		}
	};

	return (
		<div className='space-y-8 transition-colors duration-300'>
			{/* Header */}
			<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
				<h1 className='text-3xl font-bold tracking-tight'>Vai trò & Quyền hạn</h1>
				<p className='text-muted-foreground text-sm'>Quản lý vai trò người dùng và quyền truy cập hệ thống.</p>
			</div>

			{/* Roles & Permissions */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Roles */}
				<Card className='shadow-md hover:shadow-lg transition-all duration-300'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Shield className='w-5 h-5 text-primary' />
							Danh sách Vai trò ({roles.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='overflow-x-auto rounded-md border dark:border-gray-800'>
							<Table>
								<TableHeader>
									<TableRow className='bg-gray-50 dark:bg-gray-800/60'>
										<TableHead>Tên vai trò</TableHead>
										<TableHead>Mô tả</TableHead>
										<TableHead>Trạng thái</TableHead>
										<TableHead>Số quyền</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{roles.map((role) => (
										<TableRow
											key={role.id}
											className='hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors'
										>
											<TableCell className='font-medium'>{role.display_name}</TableCell>
											<TableCell className='text-sm text-muted-foreground'>
												{role.description || 'Không có mô tả'}
											</TableCell>
											<TableCell>
												<Badge
													variant={role.is_active ? 'default' : 'secondary'}
													className='capitalize'
												>
													{role.is_active ? 'Hoạt động' : 'Không hoạt động'}
												</Badge>
											</TableCell>
											<TableCell>
												<Badge variant='outline'>{role.permissions.length} quyền</Badge>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>

				{/* Permissions */}
				<Card className='shadow-md hover:shadow-lg transition-all duration-300'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Settings className='w-5 h-5 text-primary' />
							Danh sách Quyền hạn
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Accordion type='single' collapsible className='w-full'>
							{Object.entries(permissions).map(([module, modulePermissions]) => (
								<AccordionItem key={module} value={module}>
									<AccordionTrigger className='hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded-md transition'>
										<div className='flex items-center gap-2'>
											{getModuleIcon(module)}
											<span className={getModuleColor(module)}>{module.toUpperCase()}</span>
											<span className='ml-2 text-muted-foreground text-sm'>
												({modulePermissions.length} quyền)
											</span>
										</div>
									</AccordionTrigger>
									<AccordionContent className='mt-2'>
										<div className='space-y-2'>
											{modulePermissions.map((permission) => (
												<div
													key={permission.id}
													className='flex flex-col p-3 rounded-md bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition'
												>
													<div className='font-medium text-sm'>{permission.display_name}</div>
													<div className='text-xs text-muted-foreground'>
														{permission.name}
													</div>
													{permission.description && (
														<div className='text-xs text-gray-500 dark:text-gray-400 italic'>
															{permission.description}
														</div>
													)}
												</div>
											))}
										</div>
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</CardContent>
				</Card>
			</div>

			{/* Role Details */}
			<Card className='shadow-md hover:shadow-lg transition-all duration-300'>
				<CardHeader>
					<CardTitle>Chi tiết Quyền hạn theo Vai trò</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-6'>
						{roles.map((role) => (
							<div
								key={role.id}
								className='border dark:border-gray-800 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition'
							>
								<div className='flex items-center justify-between mb-3'>
									<h3 className='text-lg font-semibold'>{role.display_name}</h3>
									<Badge variant={role.is_active ? 'default' : 'secondary'}>
										{role.is_active ? 'Hoạt động' : 'Không hoạt động'}
									</Badge>
								</div>
								{role.description && (
									<p className='text-sm text-muted-foreground mb-3'>{role.description}</p>
								)}
								<div className='flex flex-wrap gap-2'>
									{role.permissions.map((permission) => (
										<Badge
											key={permission.name}
											variant='outline'
											className='text-xs hover:bg-gray-200 dark:hover:bg-gray-800'
										>
											{permission.display_name}
										</Badge>
									))}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
