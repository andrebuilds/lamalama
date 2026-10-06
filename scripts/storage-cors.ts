/**
 * Lets browsers on the app's origin upload straight to the media bucket
 * (signed POST) and read files. Idempotent; run once per Neon branch (and
 * again when the app's URL changes):
 *
 *   npm run storage:cors                      # NEXT_PUBLIC_APP_URL + e2e server
 *   npm run storage:cors -- https://app.example.com
 *   npm run storage:cors -- --create-bucket   # local S3 servers (CI)
 *
 * Neon creates the bucket from neon.ts; `--create-bucket` is for S3
 * emulators, which start empty.
 *
 * Neon manages bucket CORS itself (open to every origin) and rejects
 * PutBucketCors. When a store refuses the write, the script checks that the
 * existing rules already let the app through instead of failing.
 */
import {
  CreateBucketCommand,
  GetBucketCorsCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
  S3Client,
  type CORSRule,
} from "@aws-sdk/client-s3"

const bucket = "media" // src/shared/storage/keys.ts MEDIA_BUCKET

const args = process.argv.slice(2)
const createBucket = args.includes("--create-bucket")

const origins = [
  ...new Set(
    [
      ...args.filter((arg) => !arg.startsWith("--")),
      process.env.NEXT_PUBLIC_APP_URL,
      "http://localhost:3100", // Playwright's test server
    ]
      .filter((origin): origin is string => Boolean(origin))
      .map((origin) => new URL(origin).origin)
  ),
]

const s3 = new S3Client({
  forcePathStyle: true, // required by Neon (and MinIO)
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  region: process.env.AWS_REGION,
})

if (createBucket) {
  const exists = await s3
    .send(new HeadBucketCommand({ Bucket: bucket }))
    .then(() => true)
    .catch(() => false)
  if (!exists) await s3.send(new CreateBucketCommand({ Bucket: bucket }))
}

const methods = ["POST", "GET", "HEAD"]

const rejected = await s3
  .send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: origins,
            AllowedMethods: methods,
            AllowedHeaders: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    })
  )
  .then(() => undefined)
  .catch((error: unknown) => error)

// Throws the write's error if the bucket can't be read either.
const { CORSRules = [] } = await s3
  .send(new GetBucketCorsCommand({ Bucket: bucket }))
  .catch(() => {
    throw rejected ?? new Error(`Can't read the CORS rules of "${bucket}"`)
  })

const allows = (rule: CORSRule, origin: string, method: string) =>
  (rule.AllowedOrigins?.includes("*") ||
    rule.AllowedOrigins?.includes(origin)) &&
  rule.AllowedMethods?.includes(method)

const blocked = origins.flatMap((origin) =>
  methods
    .filter((method) => !CORSRules.some((rule) => allows(rule, origin, method)))
    .map((method) => `${method} from ${origin}`)
)

if (blocked.length > 0) {
  console.error(`CORS on "${bucket}" doesn't allow: ${blocked.join(", ")}`)
  if (rejected)
    console.error("The storage also refused to update it:", rejected)
  process.exit(1)
}

if (rejected) {
  console.info(
    `The storage manages CORS on "${bucket}" itself; its rules already allow ${origins.join(", ")}.`
  )
}
console.info(
  `CORS on "${bucket}":`,
  JSON.stringify(CORSRules.flatMap((rule) => rule.AllowedOrigins ?? []))
)
