import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

const isConfigured = Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION && process.env.AWS_S3_BUCKET);

export const s3 = isConfigured
  ? new S3Client({ region: process.env.AWS_REGION })
  : null;

export async function uploadBufferToS3(buffer, { contentType = 'application/octet-stream', prefix = 'uploads' } = {}) {
  if (!s3) throw new Error('S3 not configured');
  const key = `${prefix}/${crypto.randomUUID()}`;
  const bucket = process.env.AWS_S3_BUCKET;
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType }));
  const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return { key, fileUrl };
}

export async function getPresignedUrl(key, expiresIn = 900) {
  if (!s3) throw new Error('S3 not configured');
  const bucket = process.env.AWS_S3_BUCKET;
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const url = await getSignedUrl(s3, command, { expiresIn });
  return url;
}


