import React from 'react';

const AdminPage = () => {
	return (
		<div>
			<h1 className='text-2xl font-bold mb-4'>Admin Dashboard</h1>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<a href='/admin/wallet' className='block p-4 border rounded-md hover:bg-accent'>
					Wallet Management
				</a>
			</div>
		</div>
	);
};

export default AdminPage;
