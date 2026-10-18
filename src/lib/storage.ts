import "server-only";

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

const storageEnvSchema = z.object({
  AWS_ACCESS_KEY_ID: z.string().min(1, "AWS_ACCESS_KEY_ID is missing"),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, "AWS_SECRET_ACCESS_KEY is missing"),
  AWS_ENDPOINT_URL_S3: z
    .url("AWS_ENDPOINT_URL_S3 must be a URL")
    .refine((value) => value.startsWith("https://"), {
      message: "AWS_ENDPOINT_URL_S3 must use HTTPS",
    }),
  AWS_REGION: z.string().min(1, "AWS_REGION is missing"),
  OBJECT_STORAGE_BUCKET: z
    .string()
    .min(3, "OBJECT_STORAGE_BUCKET is missing")
    .max(63, "OBJECT_STORAGE_BUCKET is too long")
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "OBJECT_STORAGE_BUCKET is not a valid bucket name",
    ),
});

export type StorageConfig = z.infer<typeof storageEnvSchema> & {
  bucket: string;
};

let clientPromise: Promise<{ client: S3Client; config: StorageConfig }> | null =
  null;

function readStorageConfig(): StorageConfig {
  const parsed = storageEnvSchema.safeParse({
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_ENDPOINT_URL_S3: process.env.AWS_ENDPOINT_URL_S3,
    AWS_REGION: process.env.AWS_REGION,
    OBJECT_STORAGE_BUCKET: process.env.OBJECT_STORAGE_BUCKET ?? "assets",
  });

  if (!parsed.success) {
    throw new Error(
      `Neon Object Storage is not configured: ${parsed.error.issues
        .map((issue) => issue.message)
        .join(", ")}`,
    );
  }

  return { ...parsed.data, bucket: parsed.data.OBJECT_STORAGE_BUCKET };
}

async function createStorageClient(config: StorageConfig) {
  const clientOptions = {
    region: config.AWS_REGION,
    endpoint: config.AWS_ENDPOINT_URL_S3,
    credentials: {
      accessKeyId: config.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
    // Neon is S3-compatible; newer SDK versions otherwise add checksum headers
    // that some compatible endpoints reject.
    requestChecksumCalculation: "WHEN_REQUIRED" as const,
    responseChecksumValidation: "WHEN_REQUIRED" as const,
  };

  // Local development may egress through a corporate proxy. Node's AWS SDK
  // does not read HTTPS_PROXY by itself, so opt in only when it is present.
  // Vercel production normally has no proxy variable and connects directly.
  const proxyUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy;
  if (!proxyUrl) {
    return { client: new S3Client(clientOptions), config };
  }

  const [{ NodeHttpHandler }, { HttpsProxyAgent }] = await Promise.all([
    import("@smithy/node-http-handler"),
    import("https-proxy-agent"),
  ]);

  return {
    client: new S3Client({
      ...clientOptions,
      requestHandler: new NodeHttpHandler({
        httpsAgent: new HttpsProxyAgent(proxyUrl),
      }),
    }),
    config,
  };
}

export function getStorageClient() {
  if (!clientPromise) {
    const config = readStorageConfig();
    clientPromise = createStorageClient(config);
  }
  return clientPromise;
}

export async function uploadJsonObject(key: string, body: string) {
  const { client, config } = await getStorageClient();
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: "application/json; charset=utf-8",
      CacheControl: "no-store",
    }),
  );
}

export async function getDownloadUrl(key: string, fileName: string) {
  const { client, config } = await getStorageClient();
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
    }),
    { expiresIn: 300 },
  );
}
