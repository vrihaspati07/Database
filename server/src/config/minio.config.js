/**
 * Hind DB - MinIO S3 Object Storage Client Configuration
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { Client } from 'minio';
import { envConfig } from './env.config.js';

let clientInstance = null;

try {
  clientInstance = new Client({
    endPoint: envConfig.minio.endPoint,
    port: envConfig.minio.port,
    useSSL: envConfig.minio.useSSL,
    accessKey: envConfig.minio.accessKey,
    secretKey: envConfig.minio.secretKey,
    region: envConfig.minio.region,
  });
} catch (e) {
  clientInstance = null;
}

export const minioClient = clientInstance;
export const defaultBucket = envConfig.minio.bucketName;
