import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl, s3Client } from './client';
import { keys } from './keys';

/**
 * Uploads a file to S3 and returns the URL
 */
export async function put(
  filename: string,
  file: Blob | ReadableStream<unknown> | Buffer | string,
  options?: {
    access?: 'public' | 'private';
    contentType?: string;
    cacheControl?: string;
  }
) {
  const { access = 'private', contentType, cacheControl } = options || {};

  // Convert file to buffer if needed
  let buffer: Buffer;
  if (file instanceof Blob) {
    buffer = Buffer.from(await file.arrayBuffer());
  } else if (typeof file === 'string') {
    buffer = Buffer.from(file);
  } else if (Buffer.isBuffer(file)) {
    buffer = file;
  } else {
    // Handle ReadableStream - this is a simplified approach
    const chunks: Buffer[] = [];
    const reader = file.getReader();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        // Convert Uint8Array to Buffer
        chunks.push(Buffer.from(value as Uint8Array));
      }
    }

    buffer = Buffer.concat(chunks);
  }

  const key = `${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: keys().B2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: cacheControl,
    ACL: access === 'public' ? 'public-read' : undefined,
  });

  await s3Client.send(command);

  const url =
    access === 'public'
      ? `https://${keys().B2_BUCKET_NAME}.s3.${keys().B2_REGION}.backblazeb2.com/${key}`
      : await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: keys().B2_BUCKET_NAME,
            Key: key,
          }),
          { expiresIn: 3600 }
        ); // 1 hour expiration

  return {
    url,
    pathname: key,
  };
}

/**
 * Generates a URL to access a file in S3
 */
export function list() {
  throw new Error('list operation not implemented for S3');
}

/**
 * Deletes a file from S3
 */
export async function del(url: string) {
  // Extract the key from the URL
  const urlObj = new URL(url);
  const key = urlObj.pathname.startsWith('/')
    ? urlObj.pathname.substring(1)
    : urlObj.pathname;

  const command = new DeleteObjectCommand({
    Bucket: keys().B2_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
  return true;
}

/**
 * Generates a URL to access a file in S3
 */
export async function head(url: string) {
  // Extract the key from the URL
  const urlObj = new URL(url);
  const key = urlObj.pathname.startsWith('/')
    ? urlObj.pathname.substring(1)
    : urlObj.pathname;

  try {
    const command = new GetObjectCommand({
      Bucket: keys().B2_BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    return {
      url,
      pathname: key,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      uploadedAt: response.LastModified,
    };
  } catch (_error) {
    return null;
  }
}
