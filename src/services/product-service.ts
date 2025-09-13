import api from '@/lib/api';

// Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category_id: string;
  created_at?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category_id: string;
}

export interface UpdateProductRequest {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  stock?: number;
  image_url?: string;
  category_id?: string;
}

export interface ProductResponse {
  success: boolean;
  message?: string;
  product?: Product;
}

export interface ProductsResponse {
  success: boolean;
  message?: string;
  items?: Product[];
  total?: number;
  page?: number;
  limit?: number;
  pageSize?: number;
  totalPages?: number;
}

// API Functions
export const productsService = {
  // POST /api/admin/products - Create product
  createProduct: async (data: CreateProductRequest): Promise<ProductResponse> => {
    try {
      const response = await api.post('/admin/products', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create product');
    }
  },

  // PUT /api/admin/products/{id} - Update product
  updateProduct: async (id: string, data: UpdateProductRequest): Promise<ProductResponse> => {
    try {
      const response = await api.put(`/admin/products/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update product');
    }
  },

  // DELETE /api/admin/products/{id} - Delete product
  deleteProduct: async (id: string): Promise<ProductResponse> => {
    try {
      const response = await api.delete(`/admin/products/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete product');
    }
  },

  // GET /api/admin/products/{id} - Get product by ID (helper function)
  getProductById: async (id: string): Promise<ProductResponse> => {
    try {
      const response = await api.get(`/admin/products/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product');
    }
  },

  // GET /api/products - Get all products with pagination
  getAllProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    image_url?: string;
  }): Promise<ProductsResponse> => {
    try {
      // Use the public products API endpoint with mapping
      const apiParams = {
        ...(params?.page && { page: params.page }),
        ...(params?.limit && { pageSize: params.limit }),
        ...(params?.search && { q: params.search }),
        ...(params?.category_id && { category_id: params.category_id }),
        ...(params?.minPrice && { minPrice: params.minPrice }),
        ...(params?.maxPrice && { maxPrice: params.maxPrice }),
        ...(params?.inStock !== undefined && { inStock: params.inStock }),
        ...(params?.image_url && { image_url: params.image_url }),
      };

      const response = await api.get('/products', { params: apiParams });
      const data: ProductsResponse = response.data;

      // Map the response to match ProductsResponse interface
      return {
        success: true,
        message: data.message,
        items: data.items,
        total: data.total,
        page: data.page,
        pageSize: data.pageSize || 12,
        totalPages: data.totalPages || 1,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  },

  // GET /api/products - Get public products (for frontend)
  getPublicProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ProductsResponse> => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  },

  // GET /api/products/{id} - Get public product by ID
  getPublicProductById: async (id: string): Promise<ProductResponse> => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product');
    }
  },

  // GET /api/products/slug/{slug} - Get product by slug
  getProductBySlug: async (slug: string): Promise<ProductResponse> => {
    try {
      const response = await api.get(`/products/slug/${slug}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product');
    }
  },

  // GET /api/products/category/{category_id} - Get products by category
  getProductsByCategory: async (
    category_id: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<ProductsResponse> => {
    try {
      const response = await api.get(`/products/category/${category_id}`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch products by category');
    }
  },
};

// Export individual functions for convenience
export const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getAllProducts,
  getPublicProducts,
  getPublicProductById,
  getProductBySlug,
  getProductsByCategory,
} = productsService;

// Export default
export default productsService;