import * as sodiumModule from 'libsodium-wrappers-sumo';
import { storePrivateKey, loadPrivateKey, clearDeviceVault } from './deviceKey';

const sodium = (sodiumModule as any).default || sodiumModule;
let sodiumReady: Promise<any> | null = null;

async function getSodium() {
  if (!sodiumReady) {
    sodiumReady = sodium.ready.then(() => sodium);
  }
  return sodiumReady;
}

const AUTH_CONTEXT = 'NZauth01';
const ENCRYPTION_CONTEXT = 'NZencr01';

export type KdfPreset = 'interactive' | 'moderate';

export interface DerivedKeys {
  authKey: Uint8Array;
  encryptionKey: Uint8Array;
}

export interface HybridCiphertext {
  ciphertext: string;
  nonce: string;
  wrappedKey: string;
  keyVersion: number;
}

export interface Vault {
  publicKey: string;
  privateKey: string;
  salt: string;
  encryptedPrivateKey: string;
  encryptionNonce: string;
  keyVersion: number;
  authKeyB64: string;
}

let vaultKeys: { publicKey: string; privateKey: string } | null = null;

export function setVaultKeys(publicKey: string, privateKey: string) {
  vaultKeys = { publicKey, privateKey };
}

export function getVaultKeys() {
  return vaultKeys ? { ...vaultKeys } : null;
}

export function clearVaultKeys() {
  vaultKeys = null;
}

export function hasVaultKeys(): boolean {
  return vaultKeys !== null;
}

export async function toBase64(bytes: Uint8Array): Promise<string> {
  const sodium = await getSodium();
  return sodium.to_base64(bytes, sodium.base64_variants.ORIGINAL);
}

export async function fromBase64(b64: string): Promise<Uint8Array> {
  const sodium = await getSodium();
  return sodium.from_base64(b64, sodium.base64_variants.ORIGINAL);
}

export async function generateSalt(): Promise<string> {
  const sodium = await getSodium();
  const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
  return toBase64(salt);
}

export async function deriveKeys(
  password: string,
  saltB64: string,
  preset: KdfPreset = 'moderate'
): Promise<DerivedKeys> {
  const sodium = await getSodium();
  const salt = await fromBase64(saltB64);
  const opslimit =
    preset === 'interactive'
      ? sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE
      : sodium.crypto_pwhash_OPSLIMIT_MODERATE;
  const memlimit =
    preset === 'interactive'
      ? sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE
      : sodium.crypto_pwhash_MEMLIMIT_MODERATE;

  const masterKey = sodium.crypto_pwhash(
    sodium.crypto_kdf_KEYBYTES,
    password,
    salt,
    opslimit,
    memlimit,
    sodium.crypto_pwhash_ALG_ARGON2ID13
  );

  const authKey = sodium.crypto_kdf_derive_from_key(32, 1, AUTH_CONTEXT, masterKey);
  const encryptionKey = sodium.crypto_kdf_derive_from_key(32, 2, ENCRYPTION_CONTEXT, masterKey);

  sodium.memzero(masterKey);
  return { authKey, encryptionKey };
}

export async function authKeyToString(authKey: Uint8Array): Promise<string> {
  return toBase64(authKey);
}

export async function createVault(password: string): Promise<Vault> {
  const sodium = await getSodium();
  const salt = await generateSalt();
  return createVaultWithSalt(password, salt);
}

export async function createVaultWithSalt(password: string, salt: string): Promise<Vault> {
  const sodium = await getSodium();
  const { authKey, encryptionKey } = await deriveKeys(password, salt, 'moderate');
  const keypair = sodium.crypto_box_keypair();
  const publicKey = await toBase64(keypair.publicKey);
  const privateKey = await toBase64(keypair.privateKey);
  const authKeyB64 = await authKeyToString(authKey);

  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const encrypted = sodium.crypto_secretbox_easy(
    sodium.from_string(privateKey),
    nonce,
    encryptionKey
  );

  return {
    publicKey,
    privateKey,
    salt,
    encryptedPrivateKey: await toBase64(encrypted),
    encryptionNonce: await toBase64(nonce),
    keyVersion: 1,
    authKeyB64,
  };
}

export async function unlockVault(
  password: string,
  saltB64: string,
  encryptedPrivateKeyB64: string,
  encryptionNonceB64: string
): Promise<string> {
  const sodium = await getSodium();
  const { encryptionKey } = await deriveKeys(password, saltB64, 'moderate');
  const key = encryptionKey;
  const nonce = await fromBase64(encryptionNonceB64);
  const ciphertext = await fromBase64(encryptedPrivateKeyB64);
  const privateKeyBytes = sodium.crypto_secretbox_open_easy(ciphertext, nonce, key);
  if (!privateKeyBytes) {
    throw new Error('crypto: failed to decrypt private key (wrong password or corrupted vault)');
  }
  return sodium.to_string(privateKeyBytes);
}

export async function reEncryptVault(
  privateKeyB64: string,
  newPassword: string,
  oldSaltB64: string
): Promise<Pick<Vault, 'encryptedPrivateKey' | 'encryptionNonce' | 'salt' | 'keyVersion'>> {
  const sodium = await getSodium();
  const newSalt = await generateSalt();
  const { encryptionKey } = await deriveKeys(newPassword, newSalt, 'moderate');
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const encrypted = sodium.crypto_secretbox_easy(sodium.from_string(privateKeyB64), nonce, encryptionKey);
  return {
    salt: newSalt,
    encryptedPrivateKey: await toBase64(encrypted),
    encryptionNonce: await toBase64(nonce),
    keyVersion: 1,
  };
}

export async function encryptAsymmetric(plaintext: string, publicKeyB64: string): Promise<HybridCiphertext> {
  const sodium = await getSodium();
  const singleUseKey = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const ciphertext = sodium.crypto_secretbox_easy(sodium.from_string(plaintext), nonce, singleUseKey);
  const publicKey = await fromBase64(publicKeyB64);
  const wrappedKey = sodium.crypto_box_seal(singleUseKey, publicKey);
  return {
    ciphertext: await toBase64(ciphertext),
    nonce: await toBase64(nonce),
    wrappedKey: await toBase64(wrappedKey),
    keyVersion: 1,
  };
}

export async function decryptAsymmetric(
  payload: HybridCiphertext,
  publicKeyB64: string,
  privateKeyB64: string
): Promise<string> {
  const sodium = await getSodium();
  const publicKey = await fromBase64(publicKeyB64);
  const privateKey = await fromBase64(privateKeyB64);
  const wrappedKey = await fromBase64(payload.wrappedKey);
  const singleUseKey = sodium.crypto_box_seal_open(wrappedKey, publicKey, privateKey);
  if (!singleUseKey) {
    throw new Error('crypto: failed to unwrap symmetric key');
  }
  const nonce = await fromBase64(payload.nonce);
  const ciphertext = await fromBase64(payload.ciphertext);
  const plaintext = sodium.crypto_secretbox_open_easy(ciphertext, nonce, singleUseKey);
  if (!plaintext) {
    throw new Error('crypto: failed to decrypt asymmetric payload');
  }
  return sodium.to_string(plaintext);
}

export async function encryptField(plaintext: string): Promise<string> {
  const keys = getVaultKeys();
  if (!keys) throw new Error('crypto: no vault keys available');
  const cipher = await encryptAsymmetric(plaintext, keys.publicKey);
  return JSON.stringify(cipher);
}

export async function decryptField(ciphertext: string): Promise<string> {
  const keys = getVaultKeys();
  if (!keys) throw new Error('crypto: no vault keys available');
  const cipher: HybridCiphertext = JSON.parse(ciphertext);
  return decryptAsymmetric(cipher, keys.publicKey, keys.privateKey);
}

export async function maybeDecryptField(value: string | null | undefined): Promise<string | undefined> {
  if (!value) return value ?? undefined;
  try {
    return await decryptField(value);
  } catch {
    return value;
  }
}

export async function persistPrivateKey(privateKeyB64: string): Promise<void> {
  await storePrivateKey(privateKeyB64);
}

export async function loadPersistedPrivateKey(): Promise<string | undefined> {
  return loadPrivateKey();
}

export async function clearCryptoState(): Promise<void> {
  clearVaultKeys();
  await clearDeviceVault();
}
