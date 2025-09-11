'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

interface FilterForm {
	categoryId: string;
	stockStatus: string;
	minPrice: string;
	maxPrice: string;
	sortBy: string;
	sortOrder: string;
}

interface ProductFiltersProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	filterForm: FilterForm;
	onFilterFormChange: (key: string, value: string) => void;
	onApplyFilters: () => void;
	onSortChange: (key: string, value: string) => void;
	onClearFilters: () => void;
	appliedFilters: FilterForm;
	setAppliedFilters: (filters: FilterForm) => void;
	setFilterForm: (filters: FilterForm) => void;
	hasActiveFilters: boolean;
	showFilterPopover: boolean;
	setShowFilterPopover: (show: boolean) => void;
	debouncedSearchTerm: string;
	formatPrice: (price: number) => string;
}

const STOCK_OPTIONS = [
	{ value: 'all', label: 'Tất cả trạng thái kho' },
	{ value: 'in_stock', label: 'Còn hàng' },
	{ value: 'out_of_stock', label: 'Hết hàng' },
	{ value: 'low_stock', label: 'Sắp hết' },
];

const ProductFilters: React.FC<ProductFiltersProps> = ({
	searchTerm,
	onSearchChange,
	filterForm,
	onFilterFormChange,
	onApplyFilters,
	onSortChange,
	onClearFilters,
	appliedFilters,
	setAppliedFilters,
	setFilterForm,
	hasActiveFilters,
	showFilterPopover,
	setShowFilterPopover,
	debouncedSearchTerm,
	formatPrice,
}) => {
	const removeFilter = (key: string, defaultValue: string = 'all') => {
		const newFilters = { ...appliedFilters, [key]: defaultValue };
		setAppliedFilters(newFilters);
		setFilterForm(newFilters);
	};

	return (
		<Card>
			<CardContent className='p-4'>
				<div className='flex flex-col sm:flex-row gap-4'>
					<div className='relative flex-1'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
						<Input
							placeholder='Tìm kiếm theo tên sản phẩm hoặc mô tả...'
							value={searchTerm}
							onChange={(e) => onSearchChange(e.target.value)}
							className='pl-10'
						/>
					</div>
					<div className='flex gap-2'>
						<Popover open={showFilterPopover} onOpenChange={setShowFilterPopover}>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									className={hasActiveFilters ? 'border-blue-500 bg-blue-50' : ''}
								>
									<Filter className='h-4 w-4 mr-2' />
									Bộ lọc
									{hasActiveFilters && (
										<Badge
											variant='secondary'
											className='ml-2 h-5 w-5 p-0 flex items-center justify-center'
										>
											!
										</Badge>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-80' align='end'>
								<div className='space-y-4'>
									<div className='flex items-center justify-between'>
										<h4 className='font-medium'>Bộ lọc tìm kiếm</h4>
										{hasActiveFilters && (
											<Button
												variant='ghost'
												size='sm'
												onClick={onClearFilters}
												className='h-8 px-2 text-xs'
											>
												<X className='h-3 w-3 mr-1' />
												Xóa bộ lọc
											</Button>
										)}
									</div>

									<div className='space-y-3'>
										<div>
											<Label htmlFor='stock-filter' className='text-sm font-medium'>
												Trạng thái kho
											</Label>
											<Select
												value={filterForm.stockStatus}
												onValueChange={(value) => onFilterFormChange('stockStatus', value)}
											>
												<SelectTrigger className='mt-1'>
													<SelectValue placeholder='Tất cả trạng thái kho' />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='all'>Tất cả trạng thái kho</SelectItem>
													<SelectItem value='in_stock'>Còn hàng</SelectItem>
													<SelectItem value='out_of_stock'>Hết hàng</SelectItem>
													<SelectItem value='low_stock'>Sắp hết</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className='space-y-2'>
											<Label className='text-sm font-medium'>Khoảng giá</Label>
											<div className='grid grid-cols-2 gap-2'>
												<div>
													<Input
														type='number'
														placeholder='Giá tối thiểu'
														value={filterForm.minPrice}
														onChange={(e) => onFilterFormChange('minPrice', e.target.value)}
													/>
												</div>
												<div>
													<Input
														type='number'
														placeholder='Giá tối đa'
														value={filterForm.maxPrice}
														onChange={(e) => onFilterFormChange('maxPrice', e.target.value)}
													/>
												</div>
											</div>
										</div>

										<Separator />

										<div>
											<Label htmlFor='sort-filter' className='text-sm font-medium'>
												Sắp xếp theo
											</Label>
											<Select
												value={filterForm.sortBy}
												onValueChange={(value) => onSortChange('sortBy', value)}
											>
												<SelectTrigger className='mt-1'>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='created_at'>Ngày tạo</SelectItem>
													<SelectItem value='name'>Tên sản phẩm</SelectItem>
													<SelectItem value='price'>Giá</SelectItem>
													<SelectItem value='stock'>Số lượng kho</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div>
											<Label htmlFor='order-filter' className='text-sm font-medium'>
												Thứ tự
											</Label>
											<Select
												value={filterForm.sortOrder}
												onValueChange={(value) => onSortChange('sortOrder', value)}
											>
												<SelectTrigger className='mt-1'>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='desc'>Giảm dần</SelectItem>
													<SelectItem value='asc'>Tăng dần</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<Separator />

										<Button onClick={onApplyFilters} className='w-full' size='sm'>
											<Search className='h-4 w-4 mr-2' />
											Áp dụng bộ lọc
										</Button>
									</div>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</div>

				{/* Active filters display */}
				{hasActiveFilters && (
					<div className='flex flex-wrap gap-2 mt-3 pt-3 border-t'>
						<span className='text-sm text-gray-600'>Bộ lọc đang áp dụng:</span>
						{debouncedSearchTerm && (
							<Badge variant='secondary' className='gap-1'>
								Tìm kiếm: "{debouncedSearchTerm}"
								<X className='h-3 w-3 cursor-pointer' onClick={() => onSearchChange('')} />
							</Badge>
						)}
						{appliedFilters.stockStatus && appliedFilters.stockStatus !== 'all' && (
							<Badge variant='secondary' className='gap-1'>
								Kho: {STOCK_OPTIONS.find((opt) => opt.value === appliedFilters.stockStatus)?.label}
								<X className='h-3 w-3 cursor-pointer' onClick={() => removeFilter('stockStatus')} />
							</Badge>
						)}
						{appliedFilters.minPrice && (
							<Badge variant='secondary' className='gap-1'>
								Giá tối thiểu: {formatPrice(parseInt(appliedFilters.minPrice))}
								<X className='h-3 w-3 cursor-pointer' onClick={() => removeFilter('minPrice', '')} />
							</Badge>
						)}
						{appliedFilters.maxPrice && (
							<Badge variant='secondary' className='gap-1'>
								Giá tối đa: {formatPrice(parseInt(appliedFilters.maxPrice))}
								<X className='h-3 w-3 cursor-pointer' onClick={() => removeFilter('maxPrice', '')} />
							</Badge>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default ProductFilters;
