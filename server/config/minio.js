/**
 * Hind DB - MinIO & S3 Compatible Object Storage Engine
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { Client } from 'minio';
import { config } from './index.js';

let minioClient = null;
let isMinioAvailable = false;

try {
  minioClient = new Client({
    endPoint: config.minio.endPoint,
    port: config.minio.port,
    useSSL: config.minio.useSSL,
    accessKey: config.minio.accessKey,
    secretKey: config.minio.secretKey,
    region: config.minio.region,
  });

  // Ensure default bucket exists
  minioClient.bucketExists(config.minio.bucketName, (err, exists) => {
    if (err) {
      isMinioAvailable = false;
      return;
    }
    if (!exists) {
      minioClient.makeBucket(config.minio.bucketName, config.minio.region, (makeErr) => {
        if (!makeErr) {
          isMinioAvailable = true;
          console.log(`[Hind DB Storage]: Created S3 bucket '${config.minio.bucketName}'`);
        }
      });
    } else {
      isMinioAvailable = true;
      console.log(`[Hind DB Storage]: S3 bucket '${config.minio.bucketName}' ready.`);
    }
  });
} catch (err) {
  isMinioAvailable = false;
}

export const storage = {
  /**
   * Generate Presigned Upload URL for direct browser uploads
   */
  async getPresignedUploadUrl(objectName, expirySeconds = 900) {
    if (minioClient && isMinioAvailable) {
      try {
        const url = await minioClient.presignedPutObject(
          config.minio.bucketName,
          objectName,
          expirySeconds
        );
        return { uploadUrl: url, key: objectName };
      } catch (err) {
        console.error('[MinIO Presigned Put Error]:', err.message);
      }
    }

    // Fallback URL
    return {
      uploadUrl: `http://localhost:${config.app.port}/api/v1/storage/upload-direct?file=${encodeURIComponent(objectName)}`,
      key: objectName,
      fallback: true,
    };
  },

  /**
   * Generate Presigned Download URL
   */
  async getPresignedDownloadUrl(objectName, expirySeconds = 3600) {
    if (minioClient && isMinioAvailable) {
      try {
        return await minioClient.presignedGetObject(
          config.minio.bucketName,
          objectName,
          expirySeconds
        );
      } catch (err) {
        console.error('[MinIO Presigned Get Error]:', err.message);
      }
    }

    return `https://storage-mumbai.hind.io/${config.minio.bucketName}/${objectName}`;
  },

  /**
   * Direct Buffer Upload
   */
  async uploadBuffer(objectName, buffer, meta = {}) {
    if (minioClient && isMinioAvailable) {
      await minioClient.putObject(
        config.minio.bucketName,
        objectName,
        buffer,
        buffer.length,
        meta
      );
      return {
        key: objectName,
        url: `https://storage-mumbai.hind.io/${config.minio.bucketName}/${objectName}`,
      };
    }

    return {
      key: objectName,
      url: `https://storage-mumbai.hind.io/${config.minio.bucketName}/${objectName}`,
      mock: true,
    };
  },

  /**
   * Remove Object
   */
  async deleteObject(objectName) {
    if (minioClient && isMinioAvailable) {
      await minioClient.removeObject(config.minio.bucketName, objectName);
    }
    return true;
  },

  async getHealth() {
    return {
      available: isMinioAvailable,
      bucket: config.minio.bucketName,
      endpoint: `${config.minio.endPoint}:${config.minio.port}`,
    };
  },
};
