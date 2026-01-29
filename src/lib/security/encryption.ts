import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Encrypts plaintext using AES-256-GCM
 */
export async function encrypt(
  plaintext: string,
  keyId: string
): Promise<{ encrypted: string; iv: string; authTag: string }> {
  const key = await deriveEncryptionKey(keyId);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

/**
 * Decrypts ciphertext using AES-256-GCM
 */
export async function decrypt(
  encrypted: string,
  iv: string,
  authTag: string,
  keyId: string
): Promise<string> {
  const key = await deriveEncryptionKey(keyId);
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(authTag, "base64"));

  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Creates a searchable hash of a value using HMAC-SHA256
 * This allows lookups without decryption
 */
export function createSearchableHash(value: string): string {
  const secret = process.env.HASH_SECRET;
  if (!secret) {
    throw new Error("HASH_SECRET environment variable is not set");
  }
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

/**
 * Derives an encryption key from the master key and key ID
 * Uses PBKDF2 for key derivation
 */
async function deriveEncryptionKey(keyId: string): Promise<Buffer> {
  const masterKey = process.env.ENCRYPTION_MASTER_KEY;
  if (!masterKey) {
    throw new Error("ENCRYPTION_MASTER_KEY environment variable is not set");
  }

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(masterKey, keyId, 100000, KEY_LENGTH, "sha256", (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

/**
 * Generates a new encryption key ID
 */
export function generateKeyId(): string {
  return crypto.randomUUID();
}

/**
 * Encrypts sensitive driver data and returns the encrypted package
 */
export async function encryptSensitiveData(data: {
  nationalId?: string;
  phone: string;
  permit?: string;
}): Promise<{
  nationalIdHash: string | null;
  nationalIdEnc: string | null;
  phoneHash: string;
  phoneEnc: string;
  permitHash: string | null;
  permitEnc: string | null;
  encryptionKeyId: string;
  iv: string;
  authTag: string;
}> {
  const keyId = generateKeyId();

  // Encrypt phone (required)
  const phoneResult = await encrypt(data.phone, keyId);
  const phoneHash = createSearchableHash(data.phone);

  // Encrypt national ID (optional)
  let nationalIdHash: string | null = null;
  let nationalIdEnc: string | null = null;
  if (data.nationalId) {
    const nationalIdResult = await encrypt(data.nationalId, keyId);
    nationalIdHash = createSearchableHash(data.nationalId);
    nationalIdEnc = nationalIdResult.encrypted;
  }

  // Encrypt permit (optional)
  let permitHash: string | null = null;
  let permitEnc: string | null = null;
  if (data.permit) {
    const permitResult = await encrypt(data.permit, keyId);
    permitHash = createSearchableHash(data.permit);
    permitEnc = permitResult.encrypted;
  }

  return {
    nationalIdHash,
    nationalIdEnc,
    phoneHash,
    phoneEnc: phoneResult.encrypted,
    permitHash,
    permitEnc,
    encryptionKeyId: keyId,
    iv: phoneResult.iv,
    authTag: phoneResult.authTag,
  };
}

/**
 * Decrypts all sensitive data fields
 */
export async function decryptSensitiveData(data: {
  nationalIdEnc: string | null;
  phoneEnc: string;
  permitEnc: string | null;
  encryptionKeyId: string;
  iv: string;
  authTag: string;
}): Promise<{
  nationalId: string | null;
  phone: string;
  permit: string | null;
}> {
  const phone = await decrypt(
    data.phoneEnc,
    data.iv,
    data.authTag,
    data.encryptionKeyId
  );

  let nationalId: string | null = null;
  if (data.nationalIdEnc) {
    nationalId = await decrypt(
      data.nationalIdEnc,
      data.iv,
      data.authTag,
      data.encryptionKeyId
    );
  }

  let permit: string | null = null;
  if (data.permitEnc) {
    permit = await decrypt(
      data.permitEnc,
      data.iv,
      data.authTag,
      data.encryptionKeyId
    );
  }

  return {
    nationalId,
    phone,
    permit,
  };
}

/**
 * Verifies that encryption is properly configured
 */
export function verifyEncryptionConfig(): { valid: boolean; error?: string } {
  if (!process.env.ENCRYPTION_MASTER_KEY) {
    return { valid: false, error: "ENCRYPTION_MASTER_KEY is not set" };
  }
  if (!process.env.HASH_SECRET) {
    return { valid: false, error: "HASH_SECRET is not set" };
  }
  if (process.env.ENCRYPTION_MASTER_KEY.length < 32) {
    return { valid: false, error: "ENCRYPTION_MASTER_KEY must be at least 32 characters" };
  }
  return { valid: true };
}
