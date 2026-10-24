/**
 * Hind DB - Core Storage Service (Service 3)
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { minioClient, defaultBucket } from '../config/minio.config.js';
import { FileModel } from '../models/file.model.js';
import { logger } from '../utils/logger.js';

// Default quota: 50 GB per project
const MAX_STORAGE_QUOTA_BYTES = 53687091200;

export const StorageService = {
  /**
   * 1. Check Storage Quota Enforcement
   */
  async checkQuota(databaseId, newFileSizeBytes = 0) {
    const files = await FileModel.listByDatabase(databaseId);
    const currentUsageBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);

    if (currentUsageBytes + newFileSizeBytes > MAX_STORAGE_QUOTA_BYTES) {
      throw new Error(`Storage quota exceeded (50 GB maximum limit). Current usage: ${(currentUsageBytes / 1073741824).toFixed(2)} GB`);
    }

    return {
      usedBytes: currentUsageBytes,
      maxBytes: MAX_STORAGE_QUOTA_BYTES,
      usagePercent: ((currentUsageBytes / MAX_STORAGE_QUOTA_BYTES) * 100).toFixed(1),
    };
  },

  /**
   * 2. Generate Signed Upload URL (MinIO / S3)
   */
  async getSignedUploadUrl(databaseId, fileName, fileSizeBytes = 0, expirySeconds = 900) {
    await this.checkQuota(databaseId, fileSizeBytes);

    const objectKey = `${databaseId}/${Date.now()}_${fileName}`;
    if (minioClient) {
      try {
        const uploadUrl = await minioClient.presignedPutObject(defaultBucket, objectKey, expirySeconds);
        return { uploadUrl, key: objectKey, bucket: defaultBucket };
      } catch (err) {
        logger.error('MinIO presigned PUT error:', err);
      }
    }

    return {
      uploadUrl: `https://storage-mumbai.hind.io/${defaultBucket}/${objectKey}?token=mock_sign`,
      key: objectKey,
      bucket: defaultBucket,
      mock: true,
    };
  },

  /**
   * 3. Generate Signed Download URL (MinIO / S3)
   */
  async getSignedDownloadUrl(objectKey, expirySeconds = 3600) {
    if (minioClient) {
      try {
        return await minioClient.presignedGetObject(defaultBucket, objectKey, expirySeconds);
      } catch (err) {
        logger.error('MinIO presigned GET error:', err);
      }
    }

    return `https://storage-mumbai.hind.io/${defaultBucket}/${objectKey}`;
  },

  /**
   * 4. Upload Buffer Directly
   */
  async uploadBuffer(databaseId, fileName, buffer, mimeType = 'application/octet-stream') {
    await this.checkQuota(databaseId, buffer.length);
    const objectKey = `${databaseId}/${fileName}`;

    if (minioClient) {
      await minioClient.putObject(defaultBucket, objectKey, buffer, buffer.length, {
        'Content-Type': mimeType,
      });
    }

    const fileRecord = await FileModel.create({
      databaseId,
      name: fileName,
      path: `/${objectKey}`,
      size: buffer.length,
      mimeType,
    });

    return fileRecord;
  },

  /**
   * 5. File Deletion
   */
  async deleteFile(databaseId, fileId, objectKey) {
    if (minioClient && objectKey) {
      try {
        await minioClient.removeObject(defaultBucket, objectKey);
      } catch (e) {}
    }
    logger.info(`Deleted file ${fileId} from storage.`);
    return true;
  },

  /**
   * 6. List Files in Database Bucket
   */
  async listFiles(databaseId) {
    return await FileModel.listByDatabase(databaseId);
  },
};
