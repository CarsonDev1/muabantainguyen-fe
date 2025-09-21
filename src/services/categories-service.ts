import api from '@/lib/api';

// Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  parent_id?: string | null; // Thêm để match với API response
  image?: string; // Thêm field image
  children?: Category[];
  createdAt?: string;
  created_at?: string; // Thêm để match với API response
  updatedAt?: string;
  tree?: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  parentId?: string;
  image?: string; // Thêm field image
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  parentId?: string;
  image?: string; // Thêm field image
}

// API functions
export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/public/categories');
  return response.data.categories;
};

export const getCategoryTree = async (): Promise<Category[]> => {
  const response = await api.get('/public/categories/tree');
  return response.data.tree;
};

export const getCategoryBySlug = async (slug: string): Promise<Category> => {
  const response = await api.get(`/public/categories/slug/${slug}`);
  return response.data.category;
};

export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await api.get(`/admin/categories/${id}`);
  return response.data.category;
};

export const createCategory = async (data: CreateCategoryRequest): Promise<Category> => {
  const response = await api.post('/admin/categories', data);
  return response.data.category;
};

export const updateCategory = async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
  const response = await api.put(`/admin/categories/${id}`, data);
  return response.data.category;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/admin/categories/${id}`);
};

// Default export for backward compatibility
const categoriesService = {
  getCategories,
  getCategoryTree,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoriesService; 