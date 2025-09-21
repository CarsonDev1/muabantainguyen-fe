'use client';

import { useQuery } from '@tanstack/react-query';
import { getRoles, getPermissions } from '@/services/admin-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, Users, Settings } from 'lucide-react';

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
		return <div className='flex items-center justify-center h-64'>Đang tải...</div>;
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
		switch (module) {
			case 'products':
				return 'bg-blue-100 text-blue-800';
			case 'orders':
				return 'bg-green-100 text-green-800';
			case 'admins':
				return 'bg-red-100 text-red-800';
			case 'users':
				return 'bg-purple-100 text-purple-800';
			case 'categories':
				return 'bg-yellow-100 text-yellow-800';
			case 'vouchers':
				return 'bg-pink-100 text-pink-800';
			case 'settings':
				return 'bg-gray-100 text-gray-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<h1 className='text-3xl font-bold'>Vai trò & Quyền hạn</h1>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Roles */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center'>
							<Shield className='w-5 h-5 mr-2' />
							Danh sách Vai trò ({roles.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='rounded-md border'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Tên vai trò</TableHead>
										<TableHead>Mô tả</TableHead>
										<TableHead>Trạng thái</TableHead>
										<TableHead>Số quyền</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{roles.map((role) => (
										<TableRow key={role.id}>
											<TableCell className='font-medium'>{role.display_name}</TableCell>
											<TableCell>{role.description || 'Không có mô tả'}</TableCell>
											<TableCell>
												<Badge variant={role.is_active ? 'default' : 'secondary'}>
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
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center'>
							<Settings className='w-5 h-5 mr-2' />
							Danh sách Quyền hạn
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Accordion type='single' collapsible className='w-full'>
							{Object.entries(permissions).map(([module, modulePermissions]) => (
								<AccordionItem key={module} value={module}>
									<AccordionTrigger className='flex items-center'>
										<div className='flex items-center gap-2'>
											{getModuleIcon(module)}
											<Badge className={getModuleColor(module)}>{module.toUpperCase()}</Badge>
											<span className='ml-2'>({modulePermissions.length} quyền)</span>
										</div>
									</AccordionTrigger>
									<AccordionContent>
										<div className='space-y-2'>
											{modulePermissions.map((permission) => (
												<div
													key={permission.id}
													className='flex items-center justify-between p-2 bg-gray-50 rounded'
												>
													<div>
														<div className='font-medium'>{permission.display_name}</div>
														<div className='text-sm text-gray-600'>{permission.name}</div>
														{permission.description && (
															<div className='text-xs text-gray-500'>
																{permission.description}
															</div>
														)}
													</div>
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
			<Card>
				<CardHeader>
					<CardTitle>Chi tiết Quyền hạn theo Vai trò</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{roles.map((role) => (
							<div key={role.id} className='border rounded-lg p-4'>
								<div className='flex items-center justify-between mb-3'>
									<h3 className='text-lg font-semibold'>{role.display_name}</h3>
									<Badge variant={role.is_active ? 'default' : 'secondary'}>
										{role.is_active ? 'Hoạt động' : 'Không hoạt động'}
									</Badge>
								</div>
								{role.description && <p className='text-gray-600 mb-3'>{role.description}</p>}
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
									{role.permissions.map((permission) => (
										<Badge key={permission.name} variant='outline' className='text-xs'>
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
