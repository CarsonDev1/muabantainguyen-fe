'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminFAQs } from '@/services/faq-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { HelpCircle, Search, Loader2, MessageCircle, ChevronDown } from 'lucide-react';

export default function FAQsPage() {
	const [searchQuery, setSearchQuery] = useState('');

	const { data: faqsData, isLoading: faqsLoading } = useQuery({
		queryKey: ['user-faqs'],
		queryFn: getAdminFAQs,
	});

	if (faqsLoading) {
		return (
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
				<div className='text-center'>
					<div className='relative'>
						<Loader2 className='w-12 h-12 animate-spin text-blue-600 dark:text-blue-500 mx-auto mb-4' />
						<div className='absolute inset-0 blur-xl bg-blue-500/20 animate-pulse'></div>
					</div>
					<p className='text-gray-600 dark:text-gray-400 font-medium'>Đang tải câu hỏi thường gặp...</p>
				</div>
			</div>
		);
	}

	const faqs = faqsData?.faqs || [];

	// Filter FAQs based on search query
	const filteredFaqs = faqs.filter(
		(faq) =>
			faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
			faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
			<div className='mx-auto'>
				{/* Header */}
				<div className='mb-6 sm:mb-8'>
					<div className='flex items-center gap-3 sm:gap-4 mb-3'>
						<div className='bg-blue-600 dark:bg-blue-500 p-2.5 sm:p-3 rounded-2xl shadow-lg'>
							<HelpCircle className='w-6 h-6 sm:w-7 sm:h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white'>
								Câu hỏi thường gặp
							</h1>
							<p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1'>
								Tìm câu trả lời nhanh chóng cho các thắc mắc của bạn
							</p>
						</div>
					</div>
				</div>

				{/* Stats Card */}
				<div className='grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8'>
					<Card className='border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all'>
						<CardContent className='pt-5 sm:pt-6'>
							<div className='text-center'>
								<div className='bg-blue-600 dark:bg-blue-500 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg'>
									<span className='text-2xl font-black text-white'>{faqs.length}</span>
								</div>
								<p className='text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400'>
									Tổng số câu hỏi
								</p>
							</div>
						</CardContent>
					</Card>
					<Card className='border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all'>
						<CardContent className='pt-5 sm:pt-6'>
							<div className='text-center'>
								<div className='bg-gray-600 dark:bg-gray-700 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg'>
									<span className='text-2xl font-black text-white'>{filteredFaqs.length}</span>
								</div>
								<p className='text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400'>
									Kết quả tìm kiếm
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Search Bar */}
				<Card className='mb-6 sm:mb-8 border border-gray-200 dark:border-gray-700 shadow-xl'>
					<CardContent className='pt-5 sm:pt-6'>
						<div className='relative'>
							<Search className='absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400' />
							<Input
								placeholder='Tìm kiếm câu hỏi hoặc câu trả lời...'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='pl-10 sm:pl-12 h-12 sm:h-14 border-2 rounded-xl text-base font-medium'
							/>
						</div>
					</CardContent>
				</Card>

				{/* FAQ Accordion */}
				<Card className='border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden'>
					<CardHeader className='bg-gradient-to-r from-blue-50 to-gray-50 dark:from-blue-900/20 dark:to-gray-900/20 border-b border-gray-200 dark:border-gray-700'>
						<CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
							<MessageCircle className='w-5 h-5 text-blue-600 dark:text-blue-400' />
							<span>Danh sách câu hỏi ({filteredFaqs.length})</span>
						</CardTitle>
					</CardHeader>
					<CardContent className='p-0'>
						{filteredFaqs.length === 0 ? (
							<div className='text-center py-12 sm:py-16'>
								<div className='bg-gray-100 dark:bg-gray-800 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg'>
									<Search className='w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500' />
								</div>
								<h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2'>
									Không tìm thấy kết quả
								</h3>
								<p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6'>
									Thử tìm kiếm với từ khóa khác
								</p>
								<button
									onClick={() => setSearchQuery('')}
									className='px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl font-semibold transition-all shadow-lg'
								>
									Xóa tìm kiếm
								</button>
							</div>
						) : (
							<Accordion type='single' collapsible className='w-full'>
								{filteredFaqs.map((faq, index) => (
									<AccordionItem
										key={faq.id}
										value={`item-${faq.id}`}
										className='border-b border-gray-200 dark:border-gray-700 last:border-0'
									>
										<AccordionTrigger className='px-4 sm:px-6 py-4 sm:py-5 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors [&[data-state=open]]:bg-blue-50 dark:[&[data-state=open]]:bg-blue-900/10'>
											<div className='flex items-start gap-3 sm:gap-4 text-left w-full pr-4'>
												{/* Number Badge */}
												<div className='bg-blue-600 dark:bg-blue-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shadow-md flex-shrink-0'>
													{index + 1}
												</div>
												{/* Question */}
												<div className='flex-1'>
													<h3 className='text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-relaxed'>
														{faq.question}
													</h3>
												</div>
											</div>
										</AccordionTrigger>
										<AccordionContent className='px-4 sm:px-6 py-4 sm:py-5 bg-gray-50 dark:bg-gray-900/50'>
											<div className='flex gap-3 sm:gap-4'>
												{/* Answer indicator */}
												<div className='flex-shrink-0'>
													<div className='bg-gray-600 dark:bg-gray-700 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-md'>
														<MessageCircle className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
													</div>
												</div>
												{/* Answer content */}
												<div className='flex-1 pt-1'>
													<div className='text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm sm:prose max-w-none'>
														<div dangerouslySetInnerHTML={{ __html: faq.answer }} />
													</div>
												</div>
											</div>
										</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						)}
					</CardContent>
				</Card>

				{/* Help Section */}
				{faqs.length > 0 && (
					<Card className='mt-6 sm:mt-8 border-2 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20'>
						<CardContent className='pt-5 sm:pt-6'>
							<div className='flex items-start gap-3'>
								<div className='bg-blue-600 dark:bg-blue-500 p-2 rounded-xl shadow-lg flex-shrink-0'>
									<HelpCircle className='w-5 h-5 text-white' />
								</div>
								<div className='flex-1'>
									<h3 className='font-bold text-blue-900 dark:text-blue-200 mb-2 text-base sm:text-lg'>
										Vẫn cần hỗ trợ?
									</h3>
									<p className='text-sm sm:text-base text-blue-800 dark:text-blue-300 mb-4'>
										Nếu bạn không tìm thấy câu trả lời mình cần, đừng ngại liên hệ với đội ngũ hỗ
										trợ của chúng tôi.
									</p>
									<div className='flex flex-wrap gap-2'>
										<button className='px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl font-semibold transition-all shadow-lg text-sm sm:text-base'>
											Liên hệ hỗ trợ
										</button>
										<button className='px-4 sm:px-5 py-2 sm:py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-500 rounded-xl font-semibold transition-all text-sm sm:text-base'>
											Gửi câu hỏi mới
										</button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
