import api from "@/lib/api";

export interface SettingItem {
  value: string;
  type: 'text' | 'number' | 'boolean' | 'json' | 'image';
  display_name: string;
  description?: string;
  is_public: boolean;
}

export interface SettingsGroup {
  [key: string]: SettingItem;
}

export interface SiteSettings {
  [key: string]: SettingsGroup;
}

export interface PublicSettings {
  [key: string]: any;
}

// Admin Settings Management
export const getAdminSettings = async (): Promise<{ success: boolean; message: string; settings: SiteSettings }> => {
  const response = await api.get('/admin/settings');
  return response.data;
};

export const updateAdminSettings = async (settings: Record<string, string>): Promise<{ success: boolean; message: string }> => {
  const response = await api.put('/admin/settings', settings);
  return response.data;
};

// Public Settings
export const getPublicSettings = async (): Promise<{ success: boolean; message: string; settings: PublicSettings }> => {
  const response = await api.get('/public/settings');
  return response.data;
};

export const getResourceSettings = async (): Promise<{ success: boolean; message: string; settings: PublicSettings }> => {
  const response = await api.get('/resources/settings');
  return response.data;
};
