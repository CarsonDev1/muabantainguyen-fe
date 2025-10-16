'use client';
import { ModeToggle } from '@/components/mode-toggle';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth-context';
import { Bell, History, LogOut, User, Wallet } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const Header = () => {
	const { user, logout } = useAuth();
	return (
		<header className='flex items-center justify-between w-full pl-3 px-10 py-3'>
			<span> </span>
			<div className='flex items-center gap-3'>
				<ModeToggle />
				<Button variant='outline' size='icon'>
					<Bell />
				</Button>
				{user ? (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Avatar className='size-9 cursor-pointer bg-white border border-gray-300'>
								<AvatarImage src={user?.avatar_url} />
								<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
							</Avatar>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='space-y-2'>
							<DropdownMenuItem>
								<User />
								<Link href='/admin/profile'>Tài khoản</Link>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<History />
								<Link href='/admin/history'>Lịch sử giao dịch</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => logout()}>
								<LogOut />
								Đăng xuất
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<Link href='/sign-in'>
						<Button variant='outline'>Đăng nhập</Button>
					</Link>
				)}
			</div>
		</header>
	);
};

export default Header;
