'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getAdminSettings,
	updateAdminSettings,
	type SiteSettings,
	type SettingItem,
} from '@/services/settings-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Settings, Save, Globe, Mail, Bell, Shield } from 'lucide-react';

export default function AdminSettingsPage() {
	const queryClient = useQueryClient();
	const [formData, setFormData] = useState<Record<string, string>>({});

	const { data: settingsData, isLoading: settingsLoading } = useQuery({
		queryKey: ['admin-settings'],
		queryFn: getAdminSettings,
	});

	// Initialize form data when settings data is loaded
	useEffect(() => {
		if (settingsData?.settings) {
			const initialData: Record<string, string> = {};
			Object.entries(settingsData.settings).forEach(([groupKey, group]) => {
				Object.entries(group).forEach(([settingKey, setting]) => {
					initialData[settingKey] = setting.value || '';
				});
			});
			setFormData(initialData);
		}
	}, [settingsData]);

	const updateSettingsMutation = useMutation({
		mutationFn: updateAdminSettings,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
			toast.success('Cập nhật cài đặt thành công!');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
		},
	});

	const handleInputChange = (key: string, value: string) => {
		setFormData((prev) => ({ ...prev, [key]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateSettingsMutation.mutate(formData);
	};

	const handleReset = () => {
		if (settingsData?.settings) {
			const resetData: Record<string, string> = {};
			Object.entries(settingsData.settings).forEach(([groupKey, group]) => {
				Object.entries(group).forEach(([settingKey, setting]) => {
					resetData[settingKey] = setting.value || '';
				});
			});
			setFormData(resetData);
		}
	};

	if (settingsLoading) {
		return <div className='flex items-center justify-center h-64'>Đang tải...</div>;
	}

	const settings = settingsData?.settings || {};

	const renderSettingField = (key: string, setting: SettingItem) => {
		const value = formData[key] || setting.value || '';

		switch (setting.type) {
			case 'boolean':
				return (
					<div className='flex items-center space-x-2'>
						<Switch
							checked={value === 'true'}
							onCheckedChange={(checked) => handleInputChange(key, checked.toString())}
						/>
						<Label>{setting.display_name}</Label>
					</div>
				);
			case 'number':
				return (
					<div>
						<Label htmlFor={key}>{setting.display_name}</Label>
						<Input
							id={key}
							type='number'
							value={value}
							onChange={(e) => handleInputChange(key, e.target.value)}
							placeholder={setting.description}
						/>
					</div>
				);
			case 'json':
				return (
					<div>
						<Label htmlFor={key}>{setting.display_name}</Label>
						<Textarea
							id={key}
							rows={4}
							value={value}
							onChange={(e) => handleInputChange(key, e.target.value)}
							placeholder={setting.description}
						/>
					</div>
				);
			default:
				return (
					<div>
						<Label htmlFor={key}>{setting.display_name}</Label>
						<Input
							id={key}
							type='text'
							value={value}
							onChange={(e) => handleInputChange(key, e.target.value)}
							placeholder={setting.description}
						/>
					</div>
				);
		}
	};

	const groupedSettings = Object.entries(settings).reduce((acc, [groupKey, group]) => {
		const publicSettings: Record<string, SettingItem> = {};
		const privateSettings: Record<string, SettingItem> = {};

		Object.entries(group).forEach(([settingKey, setting]) => {
			if (setting.is_public) {
				publicSettings[settingKey] = setting;
			} else {
				privateSettings[settingKey] = setting;
			}
		});

		acc[groupKey] = {
			public: publicSettings,
			private: privateSettings,
		};
		return acc;
	}, {} as Record<string, { public: Record<string, SettingItem>; private: Record<string, SettingItem> }>);

	const getGroupIcon = (groupKey: string) => {
		switch (groupKey) {
			case 'branding':
				return <Globe className='w-4 h-4' />;
			case 'contact':
				return <Mail className='w-4 h-4' />;
			case 'notifications':
				return <Bell className='w-4 h-4' />;
			case 'security':
				return <Shield className='w-4 h-4' />;
			default:
				return <Settings className='w-4 h-4' />;
		}
	};

	const getGroupTitle = (groupKey: string) => {
		switch (groupKey) {
			case 'branding':
				return 'Thương hiệu';
			case 'contact':
				return 'Liên hệ';
			case 'notifications':
				return 'Thông báo';
			case 'security':
				return 'Bảo mật';
			case 'seo':
				return 'SEO';
			case 'payment':
				return 'Thanh toán';
			default:
				return groupKey;
		}
	};

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<h1 className='text-3xl font-bold'>Cài đặt Website</h1>
				<div className='flex space-x-2'>
					<Button variant='outline' onClick={handleReset}>
						Đặt lại
					</Button>
					<Button onClick={handleSubmit} disabled={updateSettingsMutation.isPending}>
						<Save className='w-4 h-4 mr-2' />
						{updateSettingsMutation.isPending ? 'Đang lưu...' : 'Lưu cài đặt'}
					</Button>
				</div>
			</div>

			<form onSubmit={handleSubmit}>
				<Tabs defaultValue='public' className='space-y-4'>
					<TabsList>
						<TabsTrigger value='public'>Cài đặt Công khai</TabsTrigger>
						<TabsTrigger value='private'>Cài đặt Riêng tư</TabsTrigger>
					</TabsList>

					<TabsContent value='public' className='space-y-4'>
						{Object.entries(groupedSettings).map(([groupKey, { public: publicSettings }]) => {
							if (Object.keys(publicSettings).length === 0) return null;

							return (
								<Card key={groupKey}>
									<CardHeader>
										<CardTitle className='flex items-center'>
											{getGroupIcon(groupKey)}
											<span className='ml-2'>{getGroupTitle(groupKey)}</span>
										</CardTitle>
									</CardHeader>
									<CardContent className='space-y-4'>
										{Object.entries(publicSettings).map(([settingKey, setting]) => (
											<div key={settingKey}>
												{renderSettingField(settingKey, setting)}
												{setting.description && (
													<p className='text-sm text-gray-500 mt-1'>{setting.description}</p>
												)}
											</div>
										))}
									</CardContent>
								</Card>
							);
						})}
					</TabsContent>

					<TabsContent value='private' className='space-y-4'>
						{Object.entries(groupedSettings).map(([groupKey, { private: privateSettings }]) => {
							if (Object.keys(privateSettings).length === 0) return null;

							return (
								<Card key={groupKey}>
									<CardHeader>
										<CardTitle className='flex items-center'>
											{getGroupIcon(groupKey)}
											<span className='ml-2'>{getGroupTitle(groupKey)}</span>
										</CardTitle>
									</CardHeader>
									<CardContent className='space-y-4'>
										{Object.entries(privateSettings).map(([settingKey, setting]) => (
											<div key={settingKey}>
												{renderSettingField(settingKey, setting)}
												{setting.description && (
													<p className='text-sm text-gray-500 mt-1'>{setting.description}</p>
												)}
											</div>
										))}
									</CardContent>
								</Card>
							);
						})}
					</TabsContent>
				</Tabs>
			</form>
		</div>
	);
}
