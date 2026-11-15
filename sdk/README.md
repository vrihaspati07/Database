# Hind DB JavaScript SDK (`@hinddb/sdk`)

Official client SDK for **Hind DB** — Sovereign Backend-as-a-Service (BaaS) for Indian developers, engineered by **Hind India Private Limited**.

---

## 🚀 Quickstart

### Installation

```bash
npm install @hinddb/sdk
# or
yarn add @hinddb/sdk
# or
pnpm add @hinddb/sdk
```

### Initializing the Client

```javascript
import { createClient } from '@hinddb/sdk';

const db = createClient('https://api.hinddb.com', 'hk_live_your_32_character_api_key');
```

---

## 🗄️ Storage Engine (`db.storage`)

Hind DB Storage provides ultra-fast, S3-compatible, sovereign object storage for photos, PDFs, media, and enterprise assets.

### 1. Upload a File

Upload a binary buffer, base64 data URL, or text string directly into a bucket:

```javascript
import fs from 'fs';

// Binary Buffer upload (e.g. avatar image)
const avatarBuffer = fs.readFileSync('./profile.png');
const file = await db.storage
  .from('avatars')
  .upload('user-101.png', avatarBuffer, { contentType: 'image/png' });

console.log('Uploaded asset public URL:', file.publicUrl);
// Output: https://storage.hinddb.com/avatars/user-101.png
```

### 2. List Files in Bucket

```javascript
const files = await db.storage.from('avatars').list();
console.log(`Found ${files.length} files:`, files);
```

### 3. Public File URL

For public buckets, generate direct public URLs synchronously:

```javascript
const { publicUrl, proxyUrl } = db.storage.from('avatars').getPublicUrl('user-101.png');
console.log('Public URL:', publicUrl);
```

### 4. Signed URLs for Private Buckets

For private buckets, generate secure HMAC-SHA256 temporary access URLs (default 1 hour expiry):

```javascript
// Valid for 3600 seconds (1 hour)
const { signedUrl, expires } = await db.storage
  .from('confidential-docs')
  .createSignedUrl('tax-statement-2026.pdf', 3600);

console.log('Secure Signed URL:', signedUrl);
// Format: https://storage.hinddb.com/confidential-docs/tax-statement-2026.pdf?token=...&expires=1793836800
```

### 5. Download a File

```javascript
const buffer = await db.storage.from('avatars').download('user-101.png');
fs.writeFileSync('./downloaded-user-101.png', buffer);
```

### 6. Delete a File

```javascript
await db.storage.from('avatars').remove('user-101.png');
console.log('File deleted from Hind DB Storage.');
```

### 7. Manage Buckets & Quotas

```javascript
// Create a new bucket (public or private)
await db.storage.createBucket('user-reports', false); // private bucket

// List all project buckets
const buckets = await db.storage.listBuckets();

// Check storage quota and usage
const quota = await db.storage.getQuota();
console.log(`Used ${quota.usedBytes} bytes of ${quota.quotaBytes} bytes (${quota.usedPercentage}%)`);
```

---

## 🛡️ Security & Sovereign Architecture

- **Zero Vendor Leakage:** All public URLs and headers use strictly `storage.hinddb.com`. Internal cloud infrastructure keys and endpoints are never exposed.
- **HMAC-SHA256 Token Verification:** Expired or tampered signed URL tokens are immediately rejected with `401` / `403`.
- **Project Isolation:** API keys are bound to individual projects; cross-project resource access strictly yields `404 Not Found` cloaking.
- **Rate Limiting:** Built-in 100 uploads/hour per project protection.
- **Audio & Video Streaming:** First-class HTTP `Range: bytes=start-end` support for fast seeking in HTML5 players.

---

## 📜 License

Copyright © 2026 Hind. A Hind India Private Limited Company. All rights reserved.
Licensed under the Apache-2.0 License.

