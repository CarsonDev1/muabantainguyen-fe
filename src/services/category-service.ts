import api from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  parent_id?: string | null;
  image?: string; // Thêm field image
  children?: Category[];
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  tree?: Category[];
  description?: string;
  seo_title?: string;
  seo_description?: string;
}

export interface CategoryResponse {
  category: Category;
}

export interface CategoryTreeResponse {
  message: string;
  tree: Category[];
}

export interface ProductsByCategoryResponse {
  products: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Admin interfaces
export interface CreateCategoryRequest {
  name: string;
  slug: string;
  parentId?: string;
  image?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  parentId?: string;
  image?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
}

// Public functions
export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/categories');
  return response.data.categories;
};

export const getCategoryTree = async (): Promise<CategoryTreeResponse> => {
  const response = await api.get('/public/categories/tree');
  return response.data;
};

export const getCategoryById = async (id: string): Promise<CategoryResponse> => {
  const response = await api.get(`/public/categories/${id}`);
  return response.data;
};

export const getCategoryBySlug = async (slug: string): Promise<CategoryResponse> => {
  const response = await api.get(`/public/categories/slug/${slug}`);
  return response.data;
};

export const getProductsByCategoryId = async (
  categoryId: string,
  page: number = 1,
  limit: number = 12
): Promise<ProductsByCategoryResponse> => {
  const response = await api.get(`/public/categories/${categoryId}/products?page=${page}&limit=${limit}`);
  return response.data;
};

export const getProductsByCategorySlug = async (
  categorySlug: string,
  page: number = 1,
  limit: number = 12
): Promise<ProductsByCategoryResponse> => {
  const response = await api.get(`/public/categories/slug/${categorySlug}/products?page=${page}&limit=${limit}`);
  return response.data;
};

// Admin functions
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
const categoryService = {
  getCategories,
  getCategoryTree,
  getCategoryById,
  getCategoryBySlug,
  getProductsByCategoryId,
  getProductsByCategorySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;
