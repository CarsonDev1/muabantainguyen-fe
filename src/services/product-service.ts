import api from '@/lib/api';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  images: string[];
  image_url?: string;
  category_id: string;
  category_name: string;
  category_slug?: string;
  is_active: boolean;
  stock_quantity: number;
  stock: number;
  sold_count: number;
  rating?: number;
  review_count?: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductFilter {
  search?: string;
  category?: string; // categoryId
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'created_at' | 'sold_count' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SingleProductResponse {
  product: Product;
}

export const getProducts = async (filters?: ProductFilter): Promise<ProductResponse> => {
  const params = new URLSearchParams();

  if (filters?.search) params.append('q', filters.search);
  if (filters?.category) params.append('categoryId', filters.category);
  if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
  if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

  const response = await api.get(`/products?${params.toString()}`);
  const data = response.data as any;

  // Backend returns { items: [...], total, page, pageSize, totalPages }
  const items = Array.isArray(data?.items) ? data.items : Array.isArray(data?.products) ? data.products : [];

  const products: Product[] = items.map((it: any) => ({
    id: it.id,
    name: it.name,
    slug: it.slug,
    description: it.description ?? '',
    price: typeof it.price === 'number' ? it.price : Number(it.price ?? 0),
    original_price: typeof it.original_price === 'number' ? it.original_price : (it.original_price ? Number(it.original_price) : undefined),
    images: it.images ?? [],
    image_url: it.image_url,
    category_id: it.category_id,
    category_name: it.category_name ?? '',
    category_slug: it.category_slug,
    is_active: it.is_active ?? true,
    stock_quantity: it.stock_quantity ?? it.stock ?? 0,
    stock: it.stock ?? it.stock_quantity ?? 0,
    sold_count: it.sold_count ?? 0,
    rating: it.rating,
    review_count: it.review_count,
    tags: it.tags ?? [],
    created_at: it.created_at ?? '',
    updated_at: it.updated_at ?? '',
  }));

  return {
    products,
    total: data?.total ?? products.length,
    page: data?.page ?? filters?.page ?? 1,
    pageSize: data?.pageSize ?? filters?.pageSize ?? products.length,
    totalPages: data?.totalPages ?? 1,
  };
};

export const getProductById = async (id: string): Promise<SingleProductResponse> => {
  const response = await api.get(`/admin/products/${id}`);
  return response.data;
};

export const getProductBySlug = async (slug: string): Promise<SingleProductResponse> => {
  const response = await api.get(`/products/${slug}`);
  return response.data;
};

export const getFeaturedProducts = async (limit: number = 8): Promise<Product[]> => {
  const response = await api.get(`/products/featured?limit=${limit}`);
  return response.data.products;
};

export const getRelatedProducts = async (productId: string, limit: number = 4): Promise<Product[]> => {
  const response = await api.get(`/products/${productId}/related?limit=${limit}`);
  return response.data.products;
};

// Admin functions
export interface AdminProductFilter {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminProductResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const getAllProducts = async (filters?: AdminProductFilter): Promise<AdminProductResponse> => {
  const params = new URLSearchParams();

  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('pageSize', filters.limit.toString());
  if (filters?.search) params.append('q', filters.search);
  if (filters?.category_id) params.append('categoryId', filters.category_id);
  if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
  if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

  const response = await api.get(`/admin/products?${params.toString()}`);
  return response.data;
};

export const createProduct = async (productData: Partial<Product>): Promise<SingleProductResponse> => {
  const response = await api.post('/admin/products', productData);
  return response.data;
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<SingleProductResponse> => {
  const response = await api.put(`/admin/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/admin/products/${id}`);
};

// Default export for backward compatibility
const productsService = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
  getProductBySlug,
  getFeaturedProducts,
  getRelatedProducts,
};

export default productsService;