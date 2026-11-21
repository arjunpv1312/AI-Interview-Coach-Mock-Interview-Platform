import { User } from '../types';

export interface VaultEnvelope {
  v: 1;
  alg: 'AES-256-GCM';
  iv: string;
  ct: string;
  updatedAt: string;
}

export interface PasswordHashRecord {
  alg: 'PBKDF2-SHA-256';
  iterations: number;
  salt: string;
  hash: string;
}

export interface VaultUserRecord {
  passwordHash?: PasswordHashRecord;
  password?: string; // Legacy migration support only; stripped immediately on upgrade
  user: User;
}

export type VaultUsersMap = Record<string, VaultUserRecord>;

export interface VaultSession {
  email: string;
  timestamp: number;
  lastActivityAt?: number;
}

export interface SecurityAuditSnapshot {
  webCryptoAvailable: boolean;
  cipherAlgorithm: string;
  keyIsolatedInIndexedDB: boolean;
  isSecureContext: boolean;
  protocol: string;
  plaintextLeaksDetected: number;
  encryptedRecordsCount: number;
  passwordKdf: string;
  inactivityTimeoutMinutes: number;
  ciphertextPreview: string;
  lastCheckedAt: string;
}

export const INACTIVITY_LOCK_TIMEOUT_MS = 15 * 60 * 1000;

const VAULT_USERS_KEY = 'ic_vault_users';
const VAULT_SESSION_KEY = 'ic_vault_session';
const LEGACY_USERS_KEY = 'usersDB';
const LEGACY_AUTH_KEY = 'authData';

const IDB_NAME = 'InterviewCopilotVaultDB';
const IDB_STORE = 'crypto_keys';
const IDB_KEY_ID = 'master_aes_gcm_key';
const PBKDF2_ITERATIONS = 120000;

let inMemoryFallbackKey: CryptoKey | null = null;
let keyStoredInIdb = false;
let lastSessionExpiredByInactivity = false;

export function generateSecureId(prefix = ''): string {
  let core: string;
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    core = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  } else if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const arr = new Uint8Array(6);
    crypto.getRandomValues(arr);
    core = Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
  } else {
    core = Date.now().toString(36);
  }
  return prefix ? `${prefix}-${core}` : core;
}

function bytesToBase64(bytes: Uint8Array): string {
  const CHUNK_SIZE = 8192;
  const parts: string[] = [];
  for (let i = 0; i < bytes.byteLength; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, bytes.byteLength));
    parts.push(String.fromCharCode(...chunk));
  }
  return btoa(parts.join(''));
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function openKeyDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('IndexedDB open failed'));
  });
}

async function readKeyFromIDB(): Promise<CryptoKey | null> {
  try {
    const db = await openKeyDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const getReq = store.get(IDB_KEY_ID);
      getReq.onsuccess = () => {
        db.close();
        resolve((getReq.result as CryptoKey) || null);
      };
      getReq.onerror = () => {
        db.close();
        reject(getReq.error);
      };
    });
  } catch {
    return null;
  }
}

async function writeKeyToIDB(key: CryptoKey): Promise<boolean> {
  try {
    const db = await openKeyDB();
    return await new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const putReq = store.put(key, IDB_KEY_ID);
      putReq.onsuccess = () => {
        db.close();
        resolve(true);
      };
      putReq.onerror = () => {
        db.close();
        resolve(false);
      };
    });
  } catch {
    return false;
  }
}

async function generateMasterKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false, // Non-extractable: JavaScript cannot export raw key bytes
    ['encrypt', 'decrypt']
  );
}

async function getOrCreateMasterKey(): Promise<CryptoKey> {
  const existing = await readKeyFromIDB();
  if (existing) {
    keyStoredInIdb = true;
    return existing;
  }
  if (inMemoryFallbackKey) {
    return inMemoryFallbackKey;
  }
  const fresh = await generateMasterKey();
  const saved = await writeKeyToIDB(fresh);
  if (saved) {
    keyStoredInIdb = true;
  } else {
    inMemoryFallbackKey = fresh;
  }
  return fresh;
}

export async function encryptPayload<T>(data: T): Promise<string> {
  const key = await getOrCreateMasterKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  const envelope: VaultEnvelope = {
    v: 1,
    alg: 'AES-256-GCM',
    iv: bytesToBase64(iv),
    ct: bytesToBase64(new Uint8Array(cipherBuffer)),
    updatedAt: new Date().toISOString(),
  };
  return JSON.stringify(envelope);
}

export async function decryptPayload<T>(
  rawEnvelope: string | null,
  fallback: T
): Promise<T> {
  if (!rawEnvelope) return fallback;
  try {
    const envelope = JSON.parse(rawEnvelope) as VaultEnvelope;
    if (!envelope || envelope.alg !== 'AES-256-GCM' || !envelope.iv || !envelope.ct) {
      return fallback;
    }
    const key = await getOrCreateMasterKey();
    const iv = base64ToBytes(envelope.iv);
    const ct = base64ToBytes(envelope.ct);
    const plainBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ct
    );
    const jsonStr = new TextDecoder().decode(plainBuffer);
    return JSON.parse(jsonStr) as T;
  } catch {
    return fallback;
  }
}

export async function hashPassword(
  password: string
): Promise<PasswordHashRecord> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return {
    alg: 'PBKDF2-SHA-256',
    iterations: PBKDF2_ITERATIONS,
    salt: bytesToBase64(salt),
    hash: bytesToBase64(new Uint8Array(derivedBits)),
  };
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function verifyPassword(
  password: string,
  record: VaultUserRecord
): Promise<boolean> {
  if (record.passwordHash && record.passwordHash.alg === 'PBKDF2-SHA-256') {
    const salt = base64ToBytes(record.passwordHash.salt);
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: record.passwordHash.iterations || PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );
    const candidateHash = bytesToBase64(new Uint8Array(derivedBits));
    return constantTimeEqual(candidateHash, record.passwordHash.hash);
  }
  if (typeof record.password === 'string') {
    return constantTimeEqual(password, record.password);
  }
  return false;
}

async function migrateLegacyStorageIfPresent(): Promise<void> {
  try {
    const legacyUsersRaw = localStorage.getItem(LEGACY_USERS_KEY);
    if (legacyUsersRaw) {
      const legacyUsers = JSON.parse(legacyUsersRaw) as VaultUsersMap;
      const migrated: VaultUsersMap = {};
      for (const [email, rec] of Object.entries(legacyUsers)) {
        const cleanRec: VaultUserRecord = { user: rec.user };
        if (rec.passwordHash) {
          cleanRec.passwordHash = rec.passwordHash;
        } else if (typeof rec.password === 'string') {
          cleanRec.passwordHash = await hashPassword(rec.password);
        }
        migrated[email] = cleanRec;
      }
      const existingRaw = localStorage.getItem(VAULT_USERS_KEY);
      const existing = await decryptPayload<VaultUsersMap>(existingRaw, {});
      const merged = { ...migrated, ...existing };
      localStorage.setItem(VAULT_USERS_KEY, await encryptPayload(merged));
      localStorage.removeItem(LEGACY_USERS_KEY);
    }

    const legacyAuthRaw = localStorage.getItem(LEGACY_AUTH_KEY);
    if (legacyAuthRaw) {
      const legacyAuth = JSON.parse(legacyAuthRaw) as VaultSession;
      if (legacyAuth?.email) {
        localStorage.setItem(
          VAULT_SESSION_KEY,
          await encryptPayload(legacyAuth)
        );
      }
      localStorage.removeItem(LEGACY_AUTH_KEY);
    }
  } catch {
    // Ensure legacy plaintext keys are still removed if corrupted
    localStorage.removeItem(LEGACY_USERS_KEY);
    localStorage.removeItem(LEGACY_AUTH_KEY);
  }
}

export async function initializeVault(): Promise<void> {
  await getOrCreateMasterKey();
  await migrateLegacyStorageIfPresent();
}

export async function getVaultUsers(): Promise<VaultUsersMap> {
  await initializeVault();
  const raw = localStorage.getItem(VAULT_USERS_KEY);
  return decryptPayload<VaultUsersMap>(raw, {});
}

export async function saveVaultUsers(users: VaultUsersMap): Promise<void> {
  const encrypted = await encryptPayload(users);
  localStorage.setItem(VAULT_USERS_KEY, encrypted);
}

export async function getVaultUser(email: string): Promise<User | null> {
  const users = await getVaultUsers();
  return users[email]?.user || null;
}

export async function updateVaultUser(user: User): Promise<void> {
  const users = await getVaultUsers();
  const existing = users[user.email];
  users[user.email] = {
    passwordHash: existing?.passwordHash,
    user,
  };
  await saveVaultUsers(users);
}

export async function registerVaultUser(
  user: User,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const normalizedEmail = user.email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { ok: false, error: 'Please provide a valid email address.' };
  }
  if (!password || password.length < 6) {
    return {
      ok: false,
      error: 'Password must be at least 6 characters long.',
    };
  }
  const users = await getVaultUsers();
  if (users[normalizedEmail]) {
    return { ok: false, error: 'Account already exists. Sign in instead.' };
  }
  const cleanUser: User = {
    ...user,
    email: normalizedEmail,
    authProvider: 'email',
  };
  const passwordHash = await hashPassword(password);
  users[normalizedEmail] = { passwordHash, user: cleanUser };
  await saveVaultUsers(users);
  return { ok: true };
}

export async function authenticateVaultUser(
  email: string,
  password: string
): Promise<{ ok: boolean; user?: User; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await getVaultUsers();
  const record = users[normalizedEmail];
  if (!record) {
    return {
      ok: false,
      error: 'Account not found. Switch to Create Account or use Instant Demo.',
    };
  }
  if (record.user.authProvider && record.user.authProvider !== 'email') {
    return {
      ok: false,
      error: `This profile uses ${record.user.authProvider} quick-connect. Use that sign-in option instead.`,
    };
  }
  const valid = await verifyPassword(password, record);
  if (!valid) {
    return {
      ok: false,
      error: 'Incorrect password. Try again or create a separate demo profile.',
    };
  }
  // Automatically upgrade any legacy record to PBKDF2
  if (record.password && !record.passwordHash) {
    record.passwordHash = await hashPassword(password);
    delete record.password;
    users[normalizedEmail] = record;
    await saveVaultUsers(users);
  }
  return { ok: true, user: record.user };
}

export async function ensureFederatedOrDemoUser(
  user: User,
  secretToken = 'federated-vault-access'
): Promise<{ ok: boolean; user?: User; error?: string }> {
  const normalizedEmail = user.email.trim().toLowerCase();
  const users = await getVaultUsers();
  const existing = users[normalizedEmail];
  if (existing?.user) {
    // Prevent passwordless or federated sign-in from bypassing password-protected accounts
    if (
      existing.user.authProvider === 'email' ||
      existing.user.authProvider !== user.authProvider
    ) {
      return {
        ok: false,
        error:
          'This email belongs to a password-protected account. Please sign in with your password.',
      };
    }
    return { ok: true, user: existing.user };
  }
  const cleanUser: User = { ...user, email: normalizedEmail };
  const passwordHash = await hashPassword(secretToken);
  users[normalizedEmail] = { passwordHash, user: cleanUser };
  await saveVaultUsers(users);
  return { ok: true, user: cleanUser };
}

export function isVaultSessionInactive(
  session: VaultSession,
  now = Date.now()
): boolean {
  const lastActive = session.lastActivityAt ?? session.timestamp;
  return now - lastActive >= INACTIVITY_LOCK_TIMEOUT_MS;
}

export function consumeInactivityLockFlag(): boolean {
  const flag = lastSessionExpiredByInactivity;
  lastSessionExpiredByInactivity = false;
  return flag;
}

export async function saveVaultSession(email: string): Promise<void> {
  const now = Date.now();
  lastSessionExpiredByInactivity = false;
  const session: VaultSession = {
    email,
    timestamp: now,
    lastActivityAt: now,
  };
  localStorage.setItem(VAULT_SESSION_KEY, await encryptPayload(session));
}

export async function touchVaultSessionActivity(): Promise<void> {
  const raw = localStorage.getItem(VAULT_SESSION_KEY);
  if (!raw) return;
  const session = await decryptPayload<VaultSession | null>(raw, null);
  if (!session) return;
  if (isVaultSessionInactive(session)) {
    clearVaultSession();
    lastSessionExpiredByInactivity = true;
    return;
  }
  const updated: VaultSession = {
    ...session,
    lastActivityAt: Date.now(),
  };
  localStorage.setItem(VAULT_SESSION_KEY, await encryptPayload(updated));
}

export async function getVaultSession(): Promise<VaultSession | null> {
  await initializeVault();
  const raw = localStorage.getItem(VAULT_SESSION_KEY);
  const session = await decryptPayload<VaultSession | null>(raw, null);
  if (!session) return null;
  if (isVaultSessionInactive(session)) {
    clearVaultSession();
    lastSessionExpiredByInactivity = true;
    return null;
  }
  return session;
}

export function clearVaultSession(): void {
  localStorage.removeItem(VAULT_SESSION_KEY);
  localStorage.removeItem(LEGACY_AUTH_KEY);
}

export async function rotateVaultKey(): Promise<void> {
  const users = await getVaultUsers();
  const session = await getVaultSession();

  const freshKey = await generateMasterKey();
  const saved = await writeKeyToIDB(freshKey);
  if (saved) {
    keyStoredInIdb = true;
    inMemoryFallbackKey = null;
  } else {
    inMemoryFallbackKey = freshKey;
  }

  // Re-encrypt all data under the new master key with fresh random IVs
  const encryptedUsers = await encryptPayload(users);
  localStorage.setItem(VAULT_USERS_KEY, encryptedUsers);
  if (session) {
    const encryptedSession = await encryptPayload(session);
    localStorage.setItem(VAULT_SESSION_KEY, encryptedSession);
  }
}

export async function wipeAllVaultData(): Promise<void> {
  localStorage.removeItem(VAULT_USERS_KEY);
  localStorage.removeItem(VAULT_SESSION_KEY);
  localStorage.removeItem(LEGACY_USERS_KEY);
  localStorage.removeItem(LEGACY_AUTH_KEY);
  inMemoryFallbackKey = null;
  keyStoredInIdb = false;

  try {
    if (typeof indexedDB !== 'undefined') {
      await new Promise<void>((resolve) => {
        const req = indexedDB.deleteDatabase(IDB_NAME);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      });
    }
  } catch {
    // ignore cleanup error
  }
}

export async function getSecurityAuditSnapshot(): Promise<SecurityAuditSnapshot> {
  await initializeVault();

  let plaintextLeaks = 0;
  if (localStorage.getItem(LEGACY_USERS_KEY)) plaintextLeaks++;
  if (localStorage.getItem(LEGACY_AUTH_KEY)) plaintextLeaks++;

  const rawUsers = localStorage.getItem(VAULT_USERS_KEY);
  let ciphertextPreview = 'No encrypted records stored yet (vault ready)';
  let encryptedCount = 0;

  if (rawUsers) {
    try {
      const parsed = JSON.parse(rawUsers) as VaultEnvelope;
      if (parsed.alg === 'AES-256-GCM' && parsed.ct) {
        ciphertextPreview = `alg=${parsed.alg} iv=${parsed.iv} ct=${parsed.ct.slice(0, 64)}...`;
      } else {
        plaintextLeaks++;
      }
    } catch {
      plaintextLeaks++;
    }
    const decrypted = await decryptPayload<VaultUsersMap>(rawUsers, {});
    encryptedCount = Object.keys(decrypted).length;
  }

  return {
    webCryptoAvailable:
      typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined',
    cipherAlgorithm: 'AES-256-GCM (96-bit random IV)',
    keyIsolatedInIndexedDB: keyStoredInIdb,
    isSecureContext: Boolean(window.isSecureContext),
    protocol: window.location.protocol.replace(':', '').toUpperCase(),
    plaintextLeaksDetected: plaintextLeaks,
    encryptedRecordsCount: encryptedCount,
    passwordKdf: `PBKDF2-HMAC-SHA-256 (${PBKDF2_ITERATIONS.toLocaleString()} iterations)`,
    inactivityTimeoutMinutes: INACTIVITY_LOCK_TIMEOUT_MS / 60000,
    ciphertextPreview,
    lastCheckedAt: new Date().toISOString(),
  };
}
