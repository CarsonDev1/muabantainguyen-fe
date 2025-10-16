import api from "@/lib/api";

export interface Announcement {
  id: number;
  title: string;
  content: string;
  image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  announcements?: any[];
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  image?: string;
  is_active?: boolean;
}

export interface UpdateAnnouncementData {
  title?: string;
  content?: string;
  image?: string;
  is_active?: boolean;
}

export const getAdminAnnouncements = async (): Promise<Announcement[]> => {
  const response = await api.get('/admin/announcements');
  return response.data.announcements;
};

export const createAnnouncement = async (data: CreateAnnouncementData): Promise<Announcement> => {
  const response = await api.post('/admin/announcements', data);
  return response.data;
};

export const updateAnnouncement = async (id: number, data: UpdateAnnouncementData): Promise<Announcement> => {
  const response = await api.put(`/admin/announcements/${id}`, data);
  return response.data;
};

export const deleteAnnouncement = async (id: number): Promise<void> => {
  await api.delete(`/admin/announcements/${id}`);
};

export const uploadAnnouncementImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/uploads/announcement', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.url;
};

// Public Announcements
export const getPublicAnnouncements = async (): Promise<{ success: boolean; message: string; announcements: Announcement[] }> => {
  const response = await api.get('/public/announcements');
  return response.data;
};
