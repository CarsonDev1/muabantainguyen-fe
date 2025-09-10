import api from '@/lib/api';

// Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
  tree?: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  parentId?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  parentId?: string;
}

export interface CategoryResponse {
  success: boolean;
  message?: string;
  tree?: Category;
}

export interface CategoriesResponse {
  success: boolean;
  message?: string;
  tree?: Category[];
}

// API Functions
export const categoriesService = {
  // GET /api/admin/categories/tree - Get category tree
  getCategoryTree: async (): Promise<CategoriesResponse> => {
    try {
      const response = await api.get('/admin/categories/tree');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch category tree');
    }
  },

  // POST /api/admin/categories - Create category
  createCategory: async (data: CreateCategoryRequest): Promise<CategoryResponse> => {
    try {
      const response = await api.post('/admin/categories', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create category');
    }
  },

  // PUT /api/admin/categories/{id} - Update category
  updateCategory: async (id: string, data: UpdateCategoryRequest): Promise<CategoryResponse> => {
    try {
      const response = await api.put(`/admin/categories/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update category');
    }
  },

  // DELETE /api/admin/categories/{id} - Delete category
  deleteCategory: async (id: string): Promise<CategoryResponse> => {
    try {
      const response = await api.delete(`/admin/categories/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete category');
    }
  },

  // Helper function - Get category by ID (if needed)
  getCategoryById: async (id: string): Promise<CategoryResponse> => {
    try {
      const response = await api.get(`/admin/categories/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch category');
    }
  },

  // Helper function - Get all categories (flat list)
  getAllCategories: async (): Promise<CategoriesResponse> => {
    try {
      const response = await api.get('/admin/categories');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  },
};

// Export individual functions for convenience
export const {
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getAllCategories,
} = categoriesService;

// Export default
export default categoriesService;