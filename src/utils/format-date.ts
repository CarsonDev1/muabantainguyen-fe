// src/utils/format-date.ts
export function formatDate(dateString: string): string {
  // Handle null, undefined, or empty string
  if (!dateString || dateString.trim() === '') {
    return 'Ngày không hợp lệ';
  }

  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Ngày không hợp lệ';
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Intl.DateTimeFormat('vi-VN', options).format(date);
}

export function formatDateShort(dateString: string): string {
  // Handle null, undefined, or empty string
  if (!dateString || dateString.trim() === '') {
    return 'Ngày không hợp lệ';
  }

  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Ngày không hợp lệ';
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  return new Intl.DateTimeFormat('vi-VN', options).format(date);
}

export function formatTime(dateString: string): string {
  // Handle null, undefined, or empty string
  if (!dateString || dateString.trim() === '') {
    return 'Giờ không hợp lệ';
  }

  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Giờ không hợp lệ';
  }

  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Intl.DateTimeFormat('vi-VN', options).format(date);
}
