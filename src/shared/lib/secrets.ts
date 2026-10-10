import "server-only"

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
} from "node:crypto"

import { env } from "@/shared/config/env"

/**
 * Encrypts/decrypts small secrets (workspace API keys) with AES-256-GCM
 * under APP_ENCRYPTION_KEY. Stored shape: base64(iv | auth tag | ciphertext).
 * Never log inputs or outputs of these functions.
 */

const IV_LENGTH = 12 // GCM standard nonce size
const TAG_LENGTH = 16

function masterKey(): Buffer {
  return Buffer.from(env.APP_ENCRYPTION_KEY, "hex")
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv("aes-256-gcm", masterKey(), iv)
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ])
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64")
}

export function decryptSecret(stored: string): string {
  const raw = Buffer.from(stored, "base64")
  const iv = raw.subarray(0, IV_LENGTH)
  const tag = raw.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const ciphertext = raw.subarray(IV_LENGTH + TAG_LENGTH)
  // A pinned tag length rejects truncated tags instead of checking fewer bytes.
  const decipher = createDecipheriv("aes-256-gcm", masterKey(), iv, {
    authTagLength: TAG_LENGTH,
  })
  decipher.setAuthTag(tag)
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8")
}

/** Constant-time comparison, for the rare place a secret must be checked. */
export function secretsEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB)
}
