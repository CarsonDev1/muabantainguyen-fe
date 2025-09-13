'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductFormData {
	name: string;
	slug: string;
	description: string;
	price: number;
	stock: number;
	imageUrl: string;
	category_id: string;
}

interface ProductFormPricingProps {
	form: UseFormReturn<ProductFormData>;
}

const ProductFormPricing: React.FC<ProductFormPricingProps> = ({ form }) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<DollarSign className='h-5 w-5' />
					Giá & Kho hàng
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<FormField
						control={form.control}
						name='price'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Giá bán *</FormLabel>
								<FormControl>
									<Input
										type='number'
										placeholder='0'
										min='0'
										{...field}
										onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
									/>
								</FormControl>
								<FormDescription>Giá bán tính bằng VND</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='stock'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Số lượng kho *</FormLabel>
								<FormControl>
									<Input
										type='number'
										placeholder='0'
										min='0'
										{...field}
										onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
									/>
								</FormControl>
								<FormDescription>Số lượng sản phẩm trong kho</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</CardContent>
		</Card>
	);
};

export default ProductFormPricing;
