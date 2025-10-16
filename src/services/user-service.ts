import api from "@/lib/api";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar_url: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar_url?: string;
  is_blocked?: boolean;
  created_at?: any;
  updated_at?: string;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  total_amount: number;
  created_at?: any;
  updated_at?: any;
}

export interface GetMeResponse {
  success: boolean;
  message?: string;
  user: CurrentUser;
}

export interface GetUsersResponse {
  success: boolean;
  message?: string;
  users: User[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface BlockUserRequest {
  blocked: boolean;
}

export interface BlockUserResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export interface GetUserOrdersResponse {
  success: boolean;
  message?: string;
  orders: Order[];
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  email?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message?: string;
  user?: CurrentUser;
}

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  isBlocked?: string;
  sortBy?: string;
  sortOrder?: string;
}

// Current user APIs
export const getCurrentUser = async (): Promise<GetMeResponse> => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch current user');
  }
};

export const updateProfile = async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
  try {
    const response = await api.put('/auth/me', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

// Admin APIs
export const getUsers = async (params?: GetUsersParams): Promise<GetUsersResponse> => {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.search?.trim()) queryParams.append('search', params.search.trim());
    if (params?.role?.trim()) queryParams.append('role', params.role.trim());
    if (params?.isBlocked?.trim()) queryParams.append('isBlocked', params.isBlocked.trim());
    if (params?.sortBy?.trim()) queryParams.append('sortBy', params.sortBy.trim());
    if (params?.sortOrder?.trim()) queryParams.append('sortOrder', params.sortOrder.trim());

    const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('API Call URL:', url); // Debug log

    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

export const blockUser = async (id: string, data: BlockUserRequest): Promise<BlockUserResponse> => {
  try {
    const response = await api.put(`/admin/users/${id}/block`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to block/unblock user');
  }
};

export const getUserOrders = async (id: string): Promise<GetUserOrdersResponse> => {
  try {
    const response = await api.get(`/admin/users/${id}/orders`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user orders');
  }
};

// Helper functions
export const toggleUserBlock = async (id: string, currentBlockStatus: boolean): Promise<BlockUserResponse> => {
  return blockUser(id, { blocked: !currentBlockStatus });
};

// Utility function to build search params safely
export const buildSearchParams = (params: GetUsersParams): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'string' && value.trim()) {
        searchParams.append(key, value.trim());
      } else if (typeof value === 'number') {
        searchParams.append(key, value.toString());
      }
    }
  });

  return searchParams.toString();
};

// Advanced search function with better error handling
export const searchUsers = async (params: GetUsersParams): Promise<GetUsersResponse> => {
  try {
    // Validate params
    const validatedParams: GetUsersParams = {
      page: Math.max(1, params.page || 1),
      pageSize: Math.min(100, Math.max(1, params.pageSize || 10)),
      search: params.search?.trim() || '',
      role: params.role?.trim() || '',
      isBlocked: params.isBlocked?.trim() || '',
      sortBy: params.sortBy?.trim() || 'created_at',
      sortOrder: ['asc', 'desc'].includes(params.sortOrder?.toLowerCase() || '')
        ? params.sortOrder?.toLowerCase()
        : 'desc',
    };

    return await getUsers(validatedParams);
  } catch (error: any) {
    console.error('Search Users Error:', error);
    throw new Error(error.message || 'Failed to search users');
  }
};

// User service object for easier imports
export const userService = {
  getCurrentUser,
  updateProfile,
  getUsers,
  blockUser,
  getUserOrders,
  toggleUserBlock,
  searchUsers,
  buildSearchParams,
};

// Export individual functions for convenience
export {
  getCurrentUser as getMe,
  updateProfile as updateMyProfile,
  getUsers as listUsers,
  blockUser as updateUserBlockStatus,
  getUserOrders as fetchUserOrders,
  searchUsers as findUsers,
};

export default userService;