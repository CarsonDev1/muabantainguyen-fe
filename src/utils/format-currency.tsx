export const formatCurrency = (amount: number): string => {
	if (isNaN(amount) || amount === null || amount === undefined) {
		return '0đ';
	}
	return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};
