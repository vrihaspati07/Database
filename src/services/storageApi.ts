/**
 * Hind DB - Sovereign Storage Frontend API Client
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

export interface StorageBucket {
  id: string;
  projectId: string;
  name: string;
  is_public: boolean;
  file_count: number;
  size_bytes: number;
  created_at: string;
}

export interface StorageFileItem {
  id: string;
  projectId: string;
  bucket_name: string;
  name: string;
  path: string;
  size_bytes: number;
  mime_type: string;
  public_url: string;
  proxy_url: string;
  is_public: boolean;
  created_at: string;
}

export interface StorageQuotaInfo {
  projectId: string;
  usedBytes: number;
  quotaBytes: number;
  fileCount: number;
  plan: 'Free' | 'Pro' | 'Business';
  usedPercentage: string;
}

const STORAGE_API_BASE = '/storage/v1';

export const storageApi = {
  /**
   * Fetch current storage quota and capacity
   */
  async getQuota(projectId = 'default_project'): Promise<StorageQuotaInfo> {
    try {
      const res = await fetch(`${STORAGE_API_BASE}/quota?projectId=${encodeURIComponent(projectId)}`);
      if (!res.ok) throw new Error('Failed to fetch storage quota');
      const json = await res.json();
      return json.data;
    } catch (e) {
      // Offline fallback
      return {
        projectId,
        usedBytes: 49283072, // ~47MB
        quotaBytes: 1073741824, // 1GB
        fileCount: 4,
        plan: 'Free',
        usedPercentage: '4.6',
      };
    }
  },

  /**
   * List all storage buckets
   */
  async listBuckets(projectId = 'default_project'): Promise<StorageBucket[]> {
    try {
      const res = await fetch(`${STORAGE_API_BASE}/buckets?projectId=${encodeURIComponent(projectId)}`);
      if (!res.ok) throw new Error('Failed to fetch storage buckets');
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      return [
        {
          id: 'bkt_public_01',
          projectId,
          name: 'assets',
          is_public: true,
          file_count: 3,
          size_bytes: 47185920,
          created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          id: 'bkt_docs_02',
          projectId,
          name: 'documents',
          is_public: true,
          file_count: 1,
          size_bytes: 2097152,
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
      ];
    }
  },

  /**
   * Create a new storage bucket
   */
  async createBucket(name: string, isPublic = true, projectId = 'default_project'): Promise<StorageBucket> {
    const res = await fetch(`${STORAGE_API_BASE}/buckets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, name, is_public: isPublic }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to create bucket');
    }
    return json.data;
  },

  /**
   * Delete an existing bucket
   */
  async deleteBucket(bucketName: string, projectId = 'default_project'): Promise<boolean> {
    const res = await fetch(`${STORAGE_API_BASE}/buckets/${encodeURIComponent(bucketName)}?projectId=${encodeURIComponent(projectId)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to delete bucket');
    }
    return true;
  },

  /**
   * List all files in a specific bucket
   */
  async listFiles(bucketName: string, projectId = 'default_project'): Promise<StorageFileItem[]> {
    try {
      const res = await fetch(`${STORAGE_API_BASE}/${encodeURIComponent(bucketName)}?projectId=${encodeURIComponent(projectId)}`);
      if (!res.ok) throw new Error('Failed to fetch bucket files');
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      return [];
    }
  },

  /**
   * Upload file to a bucket (handles Base64 or FormData)
   */
  async uploadFile(bucketName: string, file: File, projectId = 'default_project'): Promise<StorageFileItem> {
    // Read file as base64 data URL
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const payload = {
      projectId,
      name: file.name,
      content: base64Data,
      mime_type: file.type || 'application/octet-stream',
    };

    const res = await fetch(`${STORAGE_API_BASE}/${encodeURIComponent(bucketName)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to upload file');
    }

    return json.data;
  },

  /**
   * Delete a file
   */
  async deleteFile(bucketName: string, fileId: string, projectId = 'default_project'): Promise<boolean> {
    const res = await fetch(`${STORAGE_API_BASE}/${encodeURIComponent(bucketName)}/${encodeURIComponent(fileId)}?projectId=${encodeURIComponent(projectId)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to delete file');
    }
    return true;
  },

  /**
   * Create signed URL for private bucket file
   */
  async createSignedUrl(
    bucketName: string,
    filename: string,
    expiresIn = 3600,
    projectId = 'default_project'
  ): Promise<{ signedUrl: string; proxyUrl: string; token: string; expires: number }> {
    const res = await fetch(`${STORAGE_API_BASE}/${encodeURIComponent(bucketName)}/signed-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, filename, expiresIn }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || json.message || 'Failed to create signed URL');
    }
    return json.data;
  },

  /**
   * Format human readable file size
   */
  formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return bytes + ' B';
  },
};

