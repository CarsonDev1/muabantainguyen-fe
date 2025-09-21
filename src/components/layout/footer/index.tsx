import Link from 'next/link';
import { Package, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
	return (
		<footer className='bg-gray-900 text-white'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				<div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
					{/* Company Info */}
					<div className='space-y-4'>
						<div className='flex items-center space-x-2'>
							<Package className='w-8 h-8 text-blue-400' />
							<span className='text-xl font-bold'>Muabantainguyen</span>
						</div>
						<p className='text-gray-400 text-sm'>
							Website bán sản phẩm digital chất lượng cao với giá cả hợp lý và dịch vụ tốt nhất.
						</p>
						<div className='flex space-x-4'>
							<Link href='#' className='text-gray-400 hover:text-white transition-colors'>
								<Facebook className='w-5 h-5' />
							</Link>
							<Link href='#' className='text-gray-400 hover:text-white transition-colors'>
								<Twitter className='w-5 h-5' />
							</Link>
							<Link href='#' className='text-gray-400 hover:text-white transition-colors'>
								<Instagram className='w-5 h-5' />
							</Link>
						</div>
					</div>

					{/* Quick Links */}
					<div className='space-y-4'>
						<h3 className='text-lg font-semibold'>Liên kết nhanh</h3>
						<ul className='space-y-2 text-sm'>
							<li>
								<Link href='/products' className='text-gray-400 hover:text-white transition-colors'>
									Tất cả sản phẩm
								</Link>
							</li>
							<li>
								<Link href='/categories' className='text-gray-400 hover:text-white transition-colors'>
									Danh mục
								</Link>
							</li>
							<li>
								<Link href='/faq' className='text-gray-400 hover:text-white transition-colors'>
									Câu hỏi thường gặp
								</Link>
							</li>
							<li>
								<Link href='/about' className='text-gray-400 hover:text-white transition-colors'>
									Về chúng tôi
								</Link>
							</li>
						</ul>
					</div>

					{/* Customer Service */}
					<div className='space-y-4'>
						<h3 className='text-lg font-semibold'>Hỗ trợ khách hàng</h3>
						<ul className='space-y-2 text-sm'>
							<li>
								<Link href='/contact' className='text-gray-400 hover:text-white transition-colors'>
									Liên hệ
								</Link>
							</li>
							<li>
								<Link href='/support' className='text-gray-400 hover:text-white transition-colors'>
									Hỗ trợ kỹ thuật
								</Link>
							</li>
							<li>
								<Link href='/refund' className='text-gray-400 hover:text-white transition-colors'>
									Chính sách hoàn tiền
								</Link>
							</li>
							<li>
								<Link href='/privacy' className='text-gray-400 hover:text-white transition-colors'>
									Chính sách bảo mật
								</Link>
							</li>
						</ul>
					</div>

					{/* Contact Info */}
					<div className='space-y-4'>
						<h3 className='text-lg font-semibold'>Thông tin liên hệ</h3>
						<div className='space-y-3 text-sm'>
							<div className='flex items-center space-x-2'>
								<Mail className='w-4 h-4 text-blue-400' />
								<span className='text-gray-400'>contact@muabantainguyen.com</span>
							</div>
							<div className='flex items-center space-x-2'>
								<Phone className='w-4 h-4 text-blue-400' />
								<span className='text-gray-400'>+84 123 456 789</span>
							</div>
							<div className='flex items-center space-x-2'>
								<MapPin className='w-4 h-4 text-blue-400' />
								<span className='text-gray-400'>Việt Nam</span>
							</div>
						</div>
					</div>
				</div>

				<div className='border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400'>
					<p>&copy; 2024 Muabantainguyen. Tất cả quyền được bảo lưu.</p>
				</div>
			</div>
		</footer>
	);
}
