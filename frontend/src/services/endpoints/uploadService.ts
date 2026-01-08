/**
 * Upload Service
 *
 * Service functions for file uploads to Cloudinary via backend API.
 */

import { apiClient } from '../api/apiClient';

/**
 * Upload response from backend
 */
export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    format?: string;
    size?: number;
    thumbnailUrl?: string;
  };
}

/**
 * Upload usage statistics
 */
export interface UsageResponse {
  success: boolean;
  data: {
    storage: {
      used: string;
      usedBytes: number;
    };
    bandwidth: {
      used: string;
      usedBytes: number;
    };
    transformations: {
      used: number;
    };
  };
}

/**
 * Upload a general image
 */
export async function uploadImage(file: File, folder?: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('image', file);
  if (folder) {
    formData.append('folder', folder);
  }

  return apiClient.postFormData<UploadResponse>('/upload/image', formData);
}

/**
 * Upload an event image
 */
export async function uploadEventImage(file: File, eventId?: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('image', file);
  if (eventId) {
    formData.append('eventId', eventId);
  }

  return apiClient.postFormData<UploadResponse>('/upload/event-image', formData);
}

/**
 * Upload a profile picture
 */
export async function uploadProfilePicture(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('image', file);

  return apiClient.postFormData<UploadResponse>('/upload/profile-picture', formData);
}

/**
 * Upload an announcement image
 */
export async function uploadAnnouncementImage(
  file: File,
  announcementId?: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('image', file);
  if (announcementId) {
    formData.append('announcementId', announcementId);
  }

  return apiClient.postFormData<UploadResponse>('/upload/announcement-image', formData);
}

/**
 * Delete an image
 */
export async function deleteImage(publicId: string): Promise<{ success: boolean }> {
  // Encode publicId (replace / with ~)
  const encodedId = publicId.replace(/\//g, '~');
  return apiClient.delete<{ success: boolean }>(`/upload/image/${encodedId}`);
}

/**
 * Get upload usage statistics (Admin only)
 */
export async function getUploadUsage(): Promise<UsageResponse> {
  return apiClient.get<UsageResponse>('/upload/usage');
}

/**
 * Default export with all upload functions
 */
const uploadService = {
  uploadImage,
  uploadEventImage,
  uploadProfilePicture,
  uploadAnnouncementImage,
  deleteImage,
  getUploadUsage,
};

export default uploadService;
