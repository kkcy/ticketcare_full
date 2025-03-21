import { S3Client } from '@aws-sdk/client-s3';
import { keys } from './keys';

// Initialize the S3 client
export const s3Client = new S3Client({
  endpoint: `https://s3.${keys().B2_REGION}.backblazeb2.com`,
  region: keys().B2_REGION,
  credentials: {
    accessKeyId: keys().B2_ACCESS_KEY_ID,
    secretAccessKey: keys().B2_SECRET_ACCESS_KEY,
  },
});

// Re-export getSignedUrl from the AWS SDK
export { getSignedUrl } from '@aws-sdk/s3-request-presigner';
