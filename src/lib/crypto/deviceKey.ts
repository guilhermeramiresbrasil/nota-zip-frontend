/**
 * Browser-only helpers for protecting the decrypted private key at rest in
 * IndexedDB using a non-extractable AES-GCM key generated via the Web
 * Crypto API.
 */

const DB_NAME = 'notazip-vault';
const DB_VERSION = 1;
const KEY_STORE = 'device-keys';
const BLOB_STORE = 'encrypted-blobs';
const DEVICE_KEY_ID = 'primary';
const PRIVATE_KEY_ID = 'privateKey';

function assertBrowser(): void {
  if (
    typeof indexedDB === 'undefined' ||
    typeof crypto === 'undefined' ||
    !crypto.subtle
  ) {
    throw new Error('deviceKey: only available in browser environments');
  }
}

function openDb(): Promise<IDBDatabase> {
  assertBrowser();
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(KEY_STORE)) {
        db.createObjectStore(KEY_STORE);
      }
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(store: string, key: string): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(store: string, key: string, value: unknown): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDelete(store: string, key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getOrCreateDeviceKey(): Promise<CryptoKey> {
  const existing = await idbGet<CryptoKey>(KEY_STORE, DEVICE_KEY_ID);
  if (existing) return existing;

  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  await idbSet(KEY_STORE, DEVICE_KEY_ID, key);
  return key;
}

export interface DeviceEncryptedBlob {
  ciphertext: ArrayBuffer;
  iv: ArrayBuffer;
}

async function encryptWithDeviceKey(plaintext: string): Promise<DeviceEncryptedBlob> {
  const key = await getOrCreateDeviceKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  return { ciphertext, iv: iv.buffer };
}

async function decryptWithDeviceKey(blob: DeviceEncryptedBlob): Promise<string> {
  const key = await getOrCreateDeviceKey();
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(blob.iv) },
    key,
    blob.ciphertext
  );
  return new TextDecoder().decode(plaintext);
}

export async function storePrivateKey(privateKeyB64: string): Promise<void> {
  const blob = await encryptWithDeviceKey(privateKeyB64);
  await idbSet(BLOB_STORE, PRIVATE_KEY_ID, blob);
}

export async function loadPrivateKey(): Promise<string | undefined> {
  const blob = await idbGet<DeviceEncryptedBlob>(BLOB_STORE, PRIVATE_KEY_ID);
  if (!blob) return undefined;
  return decryptWithDeviceKey(blob);
}

export async function clearDeviceVault(): Promise<void> {
  await idbDelete(BLOB_STORE, PRIVATE_KEY_ID);
  await idbDelete(KEY_STORE, DEVICE_KEY_ID);
}
