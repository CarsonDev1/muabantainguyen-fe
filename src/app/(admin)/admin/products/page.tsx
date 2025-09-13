'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import productsService, { Product } from '@/services/product-service';
import Link from 'next/link';
import ProductStats from '@/app/(admin)/admin/products/components/product-stats';
import ProductFilters from '@/app/(admin)/admin/products/components/product-filter';
import ProductGrid from '@/app/(admin)/admin/products/components/product-grid';
import ProductDetailsDialog from '@/app/(admin)/admin/products/components/product-detail';
import DeleteProductDialog from '@/app/(admin)/admin/products/components/product-delete';

interface GetProductsParams {
	page?: number;
	limit?: number;
	search?: string;
	category_id?: string;
	minPrice?: number;
	maxPrice?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

interface FilterForm {
	category_id: string;
	stockStatus: string;
	minPrice: string;
	maxPrice: string;
	sortBy: string;
	sortOrder: string;
}

const DEFAULT_FILTERS: FilterForm = {
	category_id: 'all',
	stockStatus: 'all',
	minPrice: '',
	maxPrice: '',
	sortBy: 'created_at',
	sortOrder: 'desc',
};

const ProductPage = () => {
	const queryClient = useQueryClient();

	// State management
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(12);
	const [searchTerm, setSearchTerm] = useState('');
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [productToDelete, setProductToDelete] = useState<Product | null>(null);
	const [showProductDetails, setShowProductDetails] = useState(false);
	const [showFilterPopover, setShowFilterPopover] = useState(false);

	// Filter states
	const [filterForm, setFilterForm] = useState<FilterForm>(DEFAULT_FILTERS);
	const [appliedFilters, setAppliedFilters] = useState<FilterForm>(DEFAULT_FILTERS);

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
			setCurrentPage(1);
		}, 500);
		return () => clearTimeout(timer);
	}, [searchTerm]);

	// Build query parameters (remove stock filtering from API call since we'll filter on frontend)
	const queryParams: GetProductsParams = {
		page: currentPage,
		limit: pageSize,
		...(debouncedSearchTerm && { search: debouncedSearchTerm }),
		...(appliedFilters.category_id !== 'all' && { category_id: appliedFilters.category_id }),
		...(appliedFilters.minPrice && { minPrice: parseInt(appliedFilters.minPrice) }),
		...(appliedFilters.maxPrice && { maxPrice: parseInt(appliedFilters.maxPrice) }),
		sortBy: appliedFilters.sortBy,
		sortOrder: appliedFilters.sortOrder as 'asc' | 'desc',
	};

	// API queries
	const {
		data: productsData,
		isLoading: isLoadingProducts,
		isError: isProductsError,
		error: productsError,
	} = useQuery({
		queryKey: ['products', queryParams],
		queryFn: () => productsService.getAllProducts(queryParams),
		staleTime: 2 * 60 * 1000,
	});

	const deleteProductMutation = useMutation({
		mutationFn: (id: string) => productsService.deleteProduct(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['products'] });
			toast.success('Đã xóa sản phẩm thành công');
			setProductToDelete(null);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Có lỗi xảy ra khi xóa sản phẩm');
		},
	});

	// Event handlers
	const handleSearchChange = (value: string) => setSearchTerm(value);

	const handleFilterFormChange = (key: string, value: string) => {
		setFilterForm((prev) => ({ ...prev, [key]: value }));
	};

	const handleApplyFilters = () => {
		setAppliedFilters(filterForm);
		setCurrentPage(1);
		setShowFilterPopover(false);
	};

	const handleSortChange = (key: string, value: string) => {
		const newFilters = { ...filterForm, [key]: value };
		setFilterForm(newFilters);
		setAppliedFilters(newFilters);
		setCurrentPage(1);
	};

	const handleClearFilters = () => {
		setFilterForm(DEFAULT_FILTERS);
		setAppliedFilters(DEFAULT_FILTERS);
		setSearchTerm('');
		setCurrentPage(1);
	};

	const handleViewDetails = (product: Product) => {
		setSelectedProduct(product);
		setShowProductDetails(true);
	};

	const handleDeleteProduct = (product: Product) => setProductToDelete(product);

	const confirmDeleteProduct = () => {
		if (productToDelete) {
			deleteProductMutation.mutate(productToDelete.id);
		}
	};

	// Utility functions
	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(price);
	};

	const hasActiveFilters =
		appliedFilters.category_id !== 'all' ||
		appliedFilters.stockStatus !== 'all' ||
		!!appliedFilters.minPrice ||
		!!appliedFilters.maxPrice ||
		!!debouncedSearchTerm;

	// Filter products based on stock status
	const filterProductsByStock = (products: Product[], stockStatus: string): Product[] => {
		switch (stockStatus) {
			case 'in_stock':
				return products.filter((product) => product.stock > 0);
			case 'out_of_stock':
				return products.filter((product) => product.stock === 0);
			case 'low_stock':
				// Define low stock as stock > 0 but <= 10
				return products.filter((product) => product.stock > 0 && product.stock <= 10);
			default:
				return products;
		}
	};

	// Apply stock filtering to products
	let products = productsData?.items || [];
	if (appliedFilters.stockStatus !== 'all') {
		products = filterProductsByStock(products, appliedFilters.stockStatus);
	}

	// Calculate pagination based on filtered results
	const filteredTotal = products.length;
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const paginatedProducts = products.slice(startIndex, endIndex);
	const totalPages = Math.ceil(filteredTotal / pageSize);

	const pagination = {
		total: filteredTotal,
		totalPages: totalPages,
		page: currentPage,
	};

	// Loading state
	if (isLoadingProducts) {
		return (
			<div className='space-y-6'>
				<div className='flex items-center justify-between'>
					<h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
						Quản lý sản phẩm
					</h1>
				</div>
				<div className='flex items-center justify-center p-8'>
					<Loader2 className='h-8 w-8 animate-spin' />
					<span className='ml-2'>Đang tải danh sách sản phẩm...</span>
				</div>
			</div>
		);
	}

	// Error state
	if (isProductsError) {
		return (
			<div className='space-y-6'>
				<div className='flex items-center justify-between'>
					<h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
						Quản lý sản phẩm
					</h1>
				</div>
				<Card>
					<CardContent className='p-6 text-center'>
						<p className='text-destructive'>
							Có lỗi xảy ra: {productsError?.message || 'Không thể tải danh sách sản phẩm'}
						</p>
						<Button
							variant='outline'
							className='mt-4'
							onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
						>
							Thử lại
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
				<div>
					<h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
						Quản lý sản phẩm
					</h1>
					<p className='text-gray-600 mt-2'>Quản lý kho hàng và thông tin sản phẩm</p>
				</div>
				<Link href='/admin/products/create'>
					<Button className='bg-blue-600 hover:bg-blue-700'>
						<Plus className='h-4 w-4 mr-2' />
						Thêm sản phẩm
					</Button>
				</Link>
			</div>

			{/* Stats Cards */}
			<ProductStats
				products={productsData?.items || []}
				totalProducts={productsData?.total || 0}
				formatPrice={formatPrice}
			/>

			{/* Search and Filters */}
			<ProductFilters
				searchTerm={searchTerm}
				onSearchChange={handleSearchChange}
				filterForm={filterForm}
				onFilterFormChange={handleFilterFormChange}
				onApplyFilters={handleApplyFilters}
				onSortChange={handleSortChange}
				onClearFilters={handleClearFilters}
				appliedFilters={appliedFilters}
				setAppliedFilters={setAppliedFilters}
				setFilterForm={setFilterForm}
				hasActiveFilters={hasActiveFilters}
				showFilterPopover={showFilterPopover}
				setShowFilterPopover={setShowFilterPopover}
				debouncedSearchTerm={debouncedSearchTerm}
				formatPrice={formatPrice}
			/>

			{/* Products Grid */}
			<ProductGrid
				products={paginatedProducts}
				hasActiveFilters={hasActiveFilters}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
				pageSize={pageSize}
				pagination={pagination}
				onViewDetails={handleViewDetails}
				onDelete={handleDeleteProduct}
				formatPrice={formatPrice}
			/>

			{/* Product Details Dialog */}
			<ProductDetailsDialog
				product={selectedProduct}
				isOpen={showProductDetails}
				onClose={() => setShowProductDetails(false)}
				formatPrice={formatPrice}
			/>

			{/* Delete Product Dialog */}
			<DeleteProductDialog
				product={productToDelete}
				isOpen={!!productToDelete}
				onClose={() => setProductToDelete(null)}
				onConfirm={confirmDeleteProduct}
				isDeleting={deleteProductMutation.isPending}
			/>
		</div>
	);
};

export default ProductPage;
