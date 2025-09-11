import api from '@/lib/api';

// Upload interfaces
export interface UploadedImage {
  success: boolean;
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  originalName: string;
}

export interface FailedUpload {
  success: boolean;
  error: string;
  originalName: string;
}

export interface MultipleUploadResponse {
  success: boolean;
  message: string;
  data: {
    successful: UploadedImage[];
    failed: FailedUpload[];
    total: number;
    successCount: number;
    failCount: number;
  };
}

export interface SingleUploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
  };
}

export interface ProductImagesUploadResponse {
  success: boolean;
  message: string;
  data: {
    images: UploadedImage[];
    count: number;
  };
}

export interface ProductImageWithSizes {
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  originalName: string;
  urls?: {
    original: string;
    thumbnail: string;
    medium: string;
    large: string;
  };
}

// Upload options
export interface UploadOptions {
  folder?: string;
  onProgress?: (progress: number) => void;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

export interface AvatarUploadOptions {
  onProgress?: (progress: number) => void;
  onSuccess?: (result: SingleUploadResponse) => void;
  onError?: (error: string) => void;
}

export interface ProductUploadOptions {
  onProgress?: (progress: number) => void;
  onSuccess?: (result: ProductImagesUploadResponse) => void;
  onError?: (error: string) => void;
}

// Main upload functions
export const uploadImages = async (
  files: File | File[],
  options?: UploadOptions
): Promise<MultipleUploadResponse> => {
  try {
    const formData = new FormData();
    const fileArray = Array.isArray(files) ? files : [files];

    // Validate files
    if (fileArray.length === 0) {
      throw new Error('No files provided');
    }

    if (fileArray.length > 10) {
      throw new Error('Maximum 10 files allowed');
    }

    // Validate file types and sizes
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        throw new Error(`File ${file.name} is not an image`);
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error(`File ${file.name} exceeds 10MB limit`);
      }
    }

    // Append files
    fileArray.forEach(file => {
      formData.append('files', file);
    });

    // Add folder if specified
    if (options?.folder) {
      formData.append('folder', options.folder);
    }

    const response = await api.post('/uploads/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (options?.onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onProgress(progress);
        }
      },
    });

    const result = response.data as MultipleUploadResponse;

    if (options?.onSuccess) {
      options.onSuccess(result);
    }

    return result;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Upload failed';

    if (options?.onError) {
      options.onError(errorMessage);
    }

    throw new Error(errorMessage);
  }
};

export const uploadAvatar = async (
  file: File,
  options?: AvatarUploadOptions
): Promise<SingleUploadResponse> => {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      throw new Error('File exceeds 10MB limit');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/uploads/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (options?.onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onProgress(progress);
        }
      },
    });

    const result = response.data as SingleUploadResponse;

    if (options?.onSuccess) {
      options.onSuccess(result);
    }

    return result;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Avatar upload failed';

    if (options?.onError) {
      options.onError(errorMessage);
    }

    throw new Error(errorMessage);
  }
};

export const uploadProductImages = async (
  files: File | File[],
  options?: ProductUploadOptions
): Promise<ProductImagesUploadResponse> => {
  try {
    const formData = new FormData();
    const fileArray = Array.isArray(files) ? files : [files];

    // Validate files
    if (fileArray.length === 0) {
      throw new Error('No files provided');
    }

    if (fileArray.length > 5) {
      throw new Error('Maximum 5 product images allowed');
    }

    // Validate file types and sizes
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        throw new Error(`File ${file.name} is not an image`);
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error(`File ${file.name} exceeds 10MB limit`);
      }
    }

    // Append files
    fileArray.forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post('/uploads/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (options?.onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onProgress(progress);
        }
      },
    });

    const result = response.data as ProductImagesUploadResponse;

    if (options?.onSuccess) {
      options.onSuccess(result);
    }

    return result;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Product images upload failed';

    if (options?.onError) {
      options.onError(errorMessage);
    }

    throw new Error(errorMessage);
  }
};

// Utility functions
export const validateImageFile = (file: File, maxSizeMB: number = 10): string | null => {
  if (!file.type.startsWith('image/')) {
    return 'File must be an image';
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File exceeds ${maxSizeMB}MB limit`;
  }

  return null;
};

export const validateImageFiles = (files: File[], maxFiles: number = 10, maxSizeMB: number = 10): string | null => {
  if (files.length === 0) {
    return 'No files provided';
  }

  if (files.length > maxFiles) {
    return `Maximum ${maxFiles} files allowed`;
  }

  for (const file of files) {
    const error = validateImageFile(file, maxSizeMB);
    if (error) {
      return `${file.name}: ${error}`;
    }
  }

  return null;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

// Advanced upload with progress tracking
export const uploadWithProgress = async (
  files: File | File[],
  type: 'general' | 'avatar' | 'product' = 'general',
  options?: {
    folder?: string;
    onProgress?: (progress: number) => void;
    onFileProgress?: (fileName: string, progress: number) => void;
    onComplete?: (results: any) => void;
    onError?: (error: string) => void;
  }
): Promise<any> => {
  try {
    const fileArray = Array.isArray(files) ? files : [files];
    let uploadedCount = 0;
    const totalFiles = fileArray.length;

    const updateProgress = () => {
      const overallProgress = Math.round((uploadedCount / totalFiles) * 100);
      if (options?.onProgress) {
        options.onProgress(overallProgress);
      }
    };

    switch (type) {
      case 'avatar':
        if (fileArray.length > 1) {
          throw new Error('Avatar upload accepts only one file');
        }
        return await uploadAvatar(fileArray[0], {
          onProgress: options?.onProgress,
          onSuccess: options?.onComplete,
          onError: options?.onError,
        });

      case 'product':
        return await uploadProductImages(fileArray, {
          onProgress: options?.onProgress,
          onSuccess: options?.onComplete,
          onError: options?.onError,
        });

      case 'general':
      default:
        return await uploadImages(fileArray, {
          folder: options?.folder,
          onProgress: options?.onProgress,
          onSuccess: options?.onComplete,
          onError: options?.onError,
        });
    }
  } catch (error: any) {
    if (options?.onError) {
      options.onError(error.message);
    }
    throw error;
  }
};

// Upload service object for easier imports
export const uploadService = {
  uploadImages,
  uploadAvatar,
  uploadProductImages,
  uploadWithProgress,
  validateImageFile,
  validateImageFiles,
  formatFileSize,
  getImageDimensions,
};

// Export individual functions for convenience
export {
  uploadImages as uploadMultipleImages,
  uploadAvatar as uploadUserAvatar,
  uploadProductImages as uploadProductPhotos,
  uploadWithProgress as uploadFilesWithProgress,
};

export default uploadService;