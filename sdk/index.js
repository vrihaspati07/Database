/**
 * Hind DB - Official JavaScript / TypeScript SDK
 * Product: Hind DB (hinddb.com)
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 *
 * Ultra-fast, sovereign developer SDK for databases, authentication,
 * serverless edge functions, and object storage.
 */

export class StorageBucketClient {
  constructor(baseUrl, apiKey, bucketName) {
    this.baseUrl = (baseUrl || 'http://localhost:4000').replace(/\/$/, '');
    this.apiKey = apiKey || '';
    this.bucket = bucketName || 'assets';
  }

  _getHeaders(extra = {}) {
    const headers = { ...extra };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
      headers['x-api-key'] = this.apiKey;
    }
    return headers;
  }

  /**
   * Upload a file to this bucket
   * @param {string} fileName - Destination filename
   * @param {Buffer|string|Object} fileData - Binary buffer, base64 data URL, or text
   * @param {Object} [options] - Optional contentType, etc.
   * @returns {Promise<Object>} Uploaded file metadata
   */
  async upload(fileName, fileData, options = {}) {
    let body;
    let headers = this._getHeaders();

    if (Buffer.isBuffer(fileData)) {
      headers['Content-Type'] = options.contentType || 'application/octet-stream';
      headers['x-file-name'] = fileName;
      body = fileData;
    } else if (typeof fileData === 'string') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({
        name: fileName,
        content: fileData,
        mime_type: options.contentType || 'text/plain',
      });
    } else if (fileData && typeof fileData === 'object') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({
        name: fileName,
        content: fileData.content || fileData.data,
        mime_type: options.contentType || fileData.mime_type || 'application/octet-stream',
      });
    }

    const res = await fetch(`${this.baseUrl}/storage/v1/${encodeURIComponent(this.bucket)}`, {
      method: 'POST',
      headers,
      body,
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      const err = new Error(json.error || json.message || 'Failed to upload file to Hind DB Storage');
      err.status = res.status;
      err.response = json;
      throw err;
    }
    return json.data;
  }

  /**
   * List all files in this bucket
   * @returns {Promise<Array>} List of file metadata records
   */
  async list() {
    const res = await fetch(`${this.baseUrl}/storage/v1/${encodeURIComponent(this.bucket)}`, {
      method: 'GET',
      headers: this._getHeaders(),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      const err = new Error(json.error || json.message || 'Failed to list files');
      err.status = res.status;
      throw err;
    }
    return json.data || [];
  }

  /**
   * Get public URL for a file in a public bucket
   * @param {string} fileName - File name
   * @returns {{ publicUrl: string, proxyUrl: string }}
   */
  getPublicUrl(fileName) {
    const cleanFile = encodeURIComponent(fileName);
    const cleanBucket = encodeURIComponent(this.bucket);
    return {
      publicUrl: `https://storage.hinddb.com/${cleanBucket}/${cleanFile}`,
      proxyUrl: `${this.baseUrl}/storage/v1/${cleanBucket}/${cleanFile}`,
    };
  }

  /**
   * Create a signed URL for a private file (valid for temporary access)
   * @param {string} fileName - File name
   * @param {number} [expiresInSeconds=3600] - Expiry in seconds (default 1 hour)
   * @returns {Promise<{ signedUrl: string, proxyUrl: string, token: string, expires: number }>}
   */
  async createSignedUrl(fileName, expiresInSeconds = 3600) {
    const res = await fetch(`${this.baseUrl}/storage/v1/${encodeURIComponent(this.bucket)}/signed-url`, {
      method: 'POST',
      headers: this._getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ filename: fileName, expiresIn: expiresInSeconds }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      const err = new Error(json.error || json.message || 'Failed to create signed URL');
      err.status = res.status;
      throw err;
    }
    return json.data;
  }

  /**
   * Delete a file from the bucket
   * @param {string} fileNameOrId - File name or ID
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async remove(fileNameOrId) {
    const res = await fetch(`${this.baseUrl}/storage/v1/${encodeURIComponent(this.bucket)}/${encodeURIComponent(fileNameOrId)}`, {
      method: 'DELETE',
      headers: this._getHeaders(),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      const err = new Error(json.error || json.message || 'Failed to delete file');
      err.status = res.status;
      throw err;
    }
    return json;
  }

  /**
   * Download a file's binary content
   * @param {string} fileName - File name
   * @param {Object} [options] - Options like range headers
   * @returns {Promise<Buffer>}
   */
  async download(fileName, options = {}) {
    const headers = this._getHeaders(options.headers || {});
    const res = await fetch(`${this.baseUrl}/storage/v1/${encodeURIComponent(this.bucket)}/${encodeURIComponent(fileName)}`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      const errText = await res.text();
      const err = new Error(`Download failed with status ${res.status}: ${errText}`);
      err.status = res.status;
      throw err;
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

export class HindDBStorageClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = (baseUrl || 'http://localhost:4000').replace(/\/$/, '');
    this.apiKey = apiKey || '';
  }

  _getHeaders() {
    const headers = {};
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
      headers['x-api-key'] = this.apiKey;
    }
    return headers;
  }

  /**
   * Target a storage bucket
   * @param {string} bucketName - Name of the bucket
   * @returns {StorageBucketClient}
   */
  from(bucketName) {
    return new StorageBucketClient(this.baseUrl, this.apiKey, bucketName);
  }

  /**
   * List all buckets in the project
   * @returns {Promise<Array>} List of buckets
   */
  async listBuckets() {
    const res = await fetch(`${this.baseUrl}/storage/v1/buckets`, {
      method: 'GET',
      headers: this._getHeaders(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || json.message || 'Failed to list buckets');
    }
    return json.data || [];
  }

  /**
   * Create a new bucket
   * @param {string} name - Bucket name
   * @param {boolean} [isPublic=true] - Whether files are publicly accessible
   * @returns {Promise<Object>}
   */
  async createBucket(name, isPublic = true) {
    const res = await fetch(`${this.baseUrl}/storage/v1/buckets`, {
      method: 'POST',
      headers: this._getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name, is_public: isPublic }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || json.message || 'Failed to create bucket');
    }
    return json.data;
  }

  /**
   * Delete a bucket
   * @param {string} name - Bucket name
   * @returns {Promise<Object>}
   */
  async deleteBucket(name) {
    const res = await fetch(`${this.baseUrl}/storage/v1/buckets/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: this._getHeaders(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || json.message || 'Failed to delete bucket');
    }
    return json;
  }

  /**
   * Get project storage quota and usage
   * @returns {Promise<Object>}
   */
  async getQuota() {
    const res = await fetch(`${this.baseUrl}/storage/v1/quota`, {
      method: 'GET',
      headers: this._getHeaders(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || json.message || 'Failed to fetch storage quota');
    }
    return json.data;
  }
}

export class HindDBClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = (baseUrl || 'http://localhost:4000').replace(/\/$/, '');
    this.apiKey = apiKey || '';
    this.storage = new HindDBStorageClient(this.baseUrl, this.apiKey);
  }
}

/**
 * Initialize a new Hind DB Client instance
 * @param {string} baseUrl - Hind DB instance URL (e.g. 'https://api.hinddb.com')
 * @param {string} apiKey - Project API Key ('hk_live_...')
 * @returns {HindDBClient}
 */
export function createClient(baseUrl, apiKey) {
  return new HindDBClient(baseUrl, apiKey);
}

export default {
  createClient,
  HindDBClient,
  HindDBStorageClient,
  StorageBucketClient,
};

