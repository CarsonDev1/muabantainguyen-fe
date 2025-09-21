import api from "@/lib/api";

export interface Admin {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'super' | 'staff';
  admin_role_name: string;
  admin_role_display: string;
  permissions: string[];
  is_blocked: boolean;
  created_at: string;
}

export interface CreateAdminData {
  name?: string;
  email: string;
  phone?: string;
  password: string;
  adminRoleId: string;
}

export interface UpdateAdminRoleData {
  adminRoleId: string;
}

export interface AdminRole {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  module: string;
}

export interface PermissionsGrouped {
  [module: string]: Permission[];
}

// Admin Management
export const getAdmins = async (): Promise<{ success: boolean; message: string; admins: Admin[] }> => {
  const response = await api.get('/admin/admins');
  return response.data;
};

export const createAdmin = async (data: CreateAdminData): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/admin/admins', data);
  return response.data;
};

export const updateAdminRole = async (adminId: string, data: UpdateAdminRoleData): Promise<{ success: boolean; message: string }> => {
  const response = await api.put(`/admin/admins/${adminId}/role`, data);
  return response.data;
};

// Roles & Permissions
export const getRoles = async (): Promise<{ success: boolean; message: string; roles: AdminRole[] }> => {
  const response = await api.get('/admin/roles');
  return response.data;
};

export const getPermissions = async (): Promise<{ success: boolean; message: string; permissions: PermissionsGrouped }> => {
  const response = await api.get('/admin/permissions');
  return response.data;
};
