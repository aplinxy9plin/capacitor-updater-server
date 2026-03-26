import { S3Client, CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3"

const BUCKET = "bundles"
const s3 = new S3Client({
  endpoint: `http://${process.env.MINIO_ENDPOINT || "localhost"}:${process.env.MINIO_PORT || "9000"}`,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  },
  forcePathStyle: true,
})

try {
  await s3.send(new HeadBucketCommand({ Bucket: BUCKET }))
  console.log(`[bucket] Bucket '${BUCKET}' already exists.`)
} catch {
  await s3.send(new CreateBucketCommand({ Bucket: BUCKET }))
  console.log(`[bucket] Created bucket '${BUCKET}'.`)
}
