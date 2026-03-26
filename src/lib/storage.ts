import { S3Client, CreateBucketCommand, HeadBucketCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import type { Readable } from "stream"
import { appConfig } from "@/app.config"

const BUCKET = "bundles"

const s3 = new S3Client({
  endpoint: `http://${appConfig.MINIO_ENDPOINT}:${appConfig.MINIO_PORT}`,
  region: "us-east-1",
  credentials: {
    accessKeyId: appConfig.MINIO_ACCESS_KEY,
    secretAccessKey: appConfig.MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
})

export async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }))
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: BUCKET }))
    console.log(`[storage] Created bucket: ${BUCKET}`)
  }
}

export async function uploadBundle(key: string, body: Buffer | Readable | ReadableStream, contentLength?: number) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body as any,
    ContentLength: contentLength,
  }))
}

export async function downloadBundle(key: string): Promise<ReadableStream | null> {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
    return res.Body?.transformToWebStream() ?? null
  } catch {
    return null
  }
}

export async function deleteBundle(key: string) {
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
  } catch {
    // Ignore delete failures — file may already be gone
  }
}

export async function checkMinioHealth(): Promise<boolean> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }))
    return true
  } catch {
    return false
  }
}
