/**
 * CryptoContext — app-wide encryption state manager.
 *
 * What lives in localStorage:
 *   epilog-crypto-enabled      : 'true'
 *   epilog-crypto-salt         : base64  — PBKDF2 salt for password → main key
 *   epilog-crypto-recovery-hash: hex     — SHA-256 of the recovery code (verification only)
 *   epilog-crypto-recovery-salt: base64  — PBKDF2 salt for recovery code → recovery key
 *   epilog-crypto-recovery-blob: base64  — main key raw bytes encrypted with recovery key
 *   epilog-crypto-verifier     : base64  — known plaintext encrypted with main key (unlock check)
 *
 * What NEVER leaves memory:
 *   CryptoKey — held only in React state, never serialised or persisted.
 */

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import {
  decryptData,
  encryptData,
  generateRecoveryCode,
  generateSalt,
  hashRecoveryCode,
} from '../utils/crypto';

// ─── localStorage keys ──────────────────────────────────────────────────────

const LS_ENABLED = 'epilog-crypto-enabled';
const LS_SALT = 'epilog-crypto-salt';
const LS_RECOVERY_HASH = 'epilog-crypto-recovery-hash';
const LS_RECOVERY_SALT = 'epilog-crypto-recovery-salt';
const LS_RECOVERY_BLOB = 'epilog-crypto-recovery-blob';
const LS_VERIFIER = 'epilog-crypto-verifier';

const VERIFIER_PLAINTEXT = 'epilog-verified';
const PBKDF2_ITERATIONS = 310_000;

// ─── Internal crypto helpers ─────────────────────────────────────────────────

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

/**
 * Derives a PBKDF2-based AES-GCM 256-bit key.
 * @param password - Raw password string or recovery code.
 * @param salt - 16-byte random salt.
 * @param extractable - Set true only when the raw key bytes must be exported
 *   (i.e., during enableEncryption to wrap the key for the recovery blob).
 */
async function pbkdf2DeriveKey(
  password: string,
  salt: Uint8Array,
  extractable: boolean,
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as unknown as Uint8Array<ArrayBuffer>, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    extractable,
    ['encrypt', 'decrypt'],
  );
}

/** Encrypts raw key bytes with a recovery key; returns base64 (IV + ciphertext). */
async function wrapRawKey(rawKey: ArrayBuffer, wrapKey: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrapped = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, wrapKey, rawKey);
  const combined = new Uint8Array(iv.byteLength + wrapped.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(wrapped), iv.byteLength);
  return toBase64(combined);
}

/** Decrypts a wrapped key blob; returns the raw key ArrayBuffer. */
async function unwrapRawKey(blob: string, wrapKey: CryptoKey): Promise<ArrayBuffer> {
  const combined = fromBase64(blob);
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, wrapKey, ciphertext);
}

/** Imports raw AES-GCM key bytes as a non-extractable CryptoKey. */
async function importRawKey(rawKey: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ]);
}

// ─── Context types ────────────────────────────────────────────────────────────

interface CryptoContextValue {
  /** Whether the user has enabled encryption. */
  isEncryptionEnabled: boolean;
  /** Whether the CryptoKey is currently held in memory (app is unlocked). */
  isUnlocked: boolean;
  /**
   * The in-memory AES-GCM key. null when locked or encryption is disabled.
   * Never persisted — lives only in React state.
   */
  cryptoKey: CryptoKey | null;
  /**
   * Enables encryption for the first time (or after a reset).
   * Derives a key from `password`, generates a recovery code, and stores all
   * necessary metadata to localStorage.
   * @returns The one-time recovery code the user must save.
   */
  enableEncryption(password: string): Promise<string>;
  /**
   * Disables encryption after verifying `password`.
   * Clears all crypto state from localStorage and memory.
   * **Caller is responsible for decrypting any persisted data before calling
   * this** — use the current `cryptoKey` to do so while it is still available.
   * @throws If the password is incorrect.
   */
  disableEncryption(password: string): Promise<void>;
  /**
   * Derives the CryptoKey from `password` and unlocks the app.
   * @returns true if the password is correct, false otherwise.
   */
  unlock(password: string): Promise<boolean>;
  /**
   * Unlocks the app using the 16-character recovery code.
   * @returns true if the code is valid, false otherwise.
   */
  unlockWithRecoveryCode(code: string): Promise<boolean>;
  /** Removes the CryptoKey from memory, locking the app. */
  lock(): void;
  /**
   * Changes the encryption password and generates a new recovery code.
   *
   * `onBeforeCommit` fires after the new key is derived but before localStorage
   * is updated. Use it to re-encrypt existing data — if it throws, the metadata
   * rollback is automatic (localStorage stays unchanged).
   *
   * @returns The newly generated 16-character recovery code.
   * @throws If the current password is wrong or `onBeforeCommit` throws.
   */
  changePassword(
    oldPassword: string,
    newPassword: string,
    onBeforeCommit?: (oldKey: CryptoKey, newKey: CryptoKey) => Promise<void>,
  ): Promise<string>;
}

// ─── Context + default ───────────────────────────────────────────────────────

const CryptoContext = createContext<CryptoContextValue>({
  isEncryptionEnabled: false,
  isUnlocked: false,
  cryptoKey: null,
  enableEncryption: async () => '',
  disableEncryption: async () => {},
  unlock: async () => false,
  unlockWithRecoveryCode: async () => false,
  lock: () => {},
  changePassword: async () => '',
});

// ─── Provider ────────────────────────────────────────────────────────────────

/** Wraps the app to provide encryption state and operations. */
export function CryptoProvider({ children }: { children: ReactNode }) {
  const [isEncryptionEnabled, setIsEncryptionEnabled] = useState<boolean>(
    () => localStorage.getItem(LS_ENABLED) === 'true',
  );
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);

  // ── enableEncryption ──────────────────────────────────────────────────────

  const enableEncryption = useCallback(async (password: string): Promise<string> => {
    // 1. Derive main key (extractable so we can export raw bytes for the recovery blob)
    const salt = generateSalt();
    const mainKey = await pbkdf2DeriveKey(password, salt, true);

    // 2. Build verifier — lets unlock() confirm password without re-hashing everything
    const verifier = await encryptData(VERIFIER_PLAINTEXT, mainKey);

    // 3. Recovery flow: wrap the raw main key bytes with a key derived from the recovery code
    const recoveryCode = generateRecoveryCode();
    const recoveryCodeHash = await hashRecoveryCode(recoveryCode);
    const recoverySalt = generateSalt();
    const recoveryKey = await pbkdf2DeriveKey(recoveryCode, recoverySalt, false);
    const rawMainKey = await crypto.subtle.exportKey('raw', mainKey);
    const recoveryBlob = await wrapRawKey(rawMainKey, recoveryKey);

    // 4. Persist metadata (never the key itself)
    localStorage.setItem(LS_ENABLED, 'true');
    localStorage.setItem(LS_SALT, toBase64(salt));
    localStorage.setItem(LS_RECOVERY_HASH, recoveryCodeHash);
    localStorage.setItem(LS_RECOVERY_SALT, toBase64(recoverySalt));
    localStorage.setItem(LS_RECOVERY_BLOB, recoveryBlob);
    localStorage.setItem(LS_VERIFIER, verifier);

    // 5. Activate — import a non-extractable copy for runtime use
    const runtimeKey = await importRawKey(rawMainKey);
    setIsEncryptionEnabled(true);
    setCryptoKey(runtimeKey);

    return recoveryCode;
  }, []);

  // ── disableEncryption ─────────────────────────────────────────────────────

  const disableEncryption = useCallback(async (password: string): Promise<void> => {
    const saltB64 = localStorage.getItem(LS_SALT);
    const verifier = localStorage.getItem(LS_VERIFIER);
    if (!saltB64 || !verifier) throw new Error('Encryption metadata missing.');

    const salt = fromBase64(saltB64);
    const key = await pbkdf2DeriveKey(password, salt, false);

    // Verify password before clearing anything
    try {
      const result = await decryptData(verifier, key);
      if (result !== VERIFIER_PLAINTEXT) throw new Error();
    } catch {
      throw new Error('Incorrect password.');
    }

    // Clear localStorage crypto entries
    for (const k of [LS_ENABLED, LS_SALT, LS_RECOVERY_HASH, LS_RECOVERY_SALT, LS_RECOVERY_BLOB, LS_VERIFIER]) {
      localStorage.removeItem(k);
    }

    setIsEncryptionEnabled(false);
    setCryptoKey(null);
  }, []);

  // ── unlock ────────────────────────────────────────────────────────────────

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    const saltB64 = localStorage.getItem(LS_SALT);
    const verifier = localStorage.getItem(LS_VERIFIER);
    if (!saltB64 || !verifier) return false;

    try {
      const salt = fromBase64(saltB64);
      const key = await pbkdf2DeriveKey(password, salt, false);
      const result = await decryptData(verifier, key);
      if (result !== VERIFIER_PLAINTEXT) return false;
      setCryptoKey(key);
      return true;
    } catch {
      return false;
    }
  }, []);

  // ── unlockWithRecoveryCode ────────────────────────────────────────────────

  const unlockWithRecoveryCode = useCallback(async (code: string): Promise<boolean> => {
    const storedHash = localStorage.getItem(LS_RECOVERY_HASH);
    const recoverySaltB64 = localStorage.getItem(LS_RECOVERY_SALT);
    const recoveryBlob = localStorage.getItem(LS_RECOVERY_BLOB);
    if (!storedHash || !recoverySaltB64 || !recoveryBlob) return false;

    try {
      // Verify recovery code matches stored hash before doing expensive PBKDF2
      const codeHash = await hashRecoveryCode(code);
      if (codeHash !== storedHash) return false;

      const recoverySalt = fromBase64(recoverySaltB64);
      const recoveryKey = await pbkdf2DeriveKey(code, recoverySalt, false);
      const rawMainKey = await unwrapRawKey(recoveryBlob, recoveryKey);
      const runtimeKey = await importRawKey(rawMainKey);
      setCryptoKey(runtimeKey);
      return true;
    } catch {
      return false;
    }
  }, []);

  // ── lock ──────────────────────────────────────────────────────────────────

  const lock = useCallback((): void => {
    setCryptoKey(null);
  }, []);

  // ── changePassword ────────────────────────────────────────────────────────

  const changePassword = useCallback(async (
    oldPassword: string,
    newPassword: string,
    onBeforeCommit?: (oldKey: CryptoKey, newKey: CryptoKey) => Promise<void>,
  ): Promise<string> => {
    const saltB64 = localStorage.getItem(LS_SALT);
    const verifier = localStorage.getItem(LS_VERIFIER);
    if (!saltB64 || !verifier) throw new Error('Encryption metadata missing.');

    // Verify old password
    const oldSalt = fromBase64(saltB64);
    const oldKey = await pbkdf2DeriveKey(oldPassword, oldSalt, false);
    try {
      const result = await decryptData(verifier, oldKey);
      if (result !== VERIFIER_PLAINTEXT) throw new Error();
    } catch {
      throw new Error('Incorrect current password.');
    }

    // Derive new key (extractable once for export)
    const newSalt = generateSalt();
    const newMainKey = await pbkdf2DeriveKey(newPassword, newSalt, true);
    const newVerifier = await encryptData(VERIFIER_PLAINTEXT, newMainKey);

    // New recovery code
    const recoveryCode = generateRecoveryCode();
    const recoveryCodeHash = await hashRecoveryCode(recoveryCode);
    const newRecoverySalt = generateSalt();
    const newRecoveryKey = await pbkdf2DeriveKey(recoveryCode, newRecoverySalt, false);
    const rawNewKey = await crypto.subtle.exportKey('raw', newMainKey);
    const recoveryBlob = await wrapRawKey(rawNewKey, newRecoveryKey);

    // Give caller a chance to re-encrypt data BEFORE we commit new metadata
    const runtimeKey = await importRawKey(rawNewKey);
    if (onBeforeCommit) await onBeforeCommit(oldKey, runtimeKey);

    // Commit new metadata
    localStorage.setItem(LS_SALT, toBase64(newSalt));
    localStorage.setItem(LS_VERIFIER, newVerifier);
    localStorage.setItem(LS_RECOVERY_HASH, recoveryCodeHash);
    localStorage.setItem(LS_RECOVERY_SALT, toBase64(newRecoverySalt));
    localStorage.setItem(LS_RECOVERY_BLOB, recoveryBlob);

    setCryptoKey(runtimeKey);
    return recoveryCode;
  }, []);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <CryptoContext.Provider
      value={{
        isEncryptionEnabled,
        isUnlocked: cryptoKey !== null,
        cryptoKey,
        enableEncryption,
        disableEncryption,
        unlock,
        unlockWithRecoveryCode,
        lock,
        changePassword,
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/** Returns the current encryption context. Must be used inside CryptoProvider. */
export function useCrypto(): CryptoContextValue {
  return useContext(CryptoContext);
}
