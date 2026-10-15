import {
  randomBytes,
  scrypt as nodeScrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(nodeScrypt);
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const HASH_VERSION = "scrypt-v1";

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 12) {
    throw new Error("Password must contain at least 12 characters.");
  }

  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return [
    HASH_VERSION,
    salt.toString("base64url"),
    derivedKey.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  encodedHash: string,
): Promise<boolean> {
  const [version, encodedSalt, encodedKey] = encodedHash.split("$");

  if (version !== HASH_VERSION || !encodedSalt || !encodedKey) {
    return false;
  }

  try {
    const salt = Buffer.from(encodedSalt, "base64url");
    const expectedKey = Buffer.from(encodedKey, "base64url");
    const actualKey = (await scrypt(password, salt, expectedKey.length)) as Buffer;

    return (
      actualKey.length === expectedKey.length &&
      timingSafeEqual(actualKey, expectedKey)
    );
  } catch {
    return false;
  }
}
