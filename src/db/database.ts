import Dexie, { type Table } from 'dexie';
import type { FieldRecord } from '../types/index';
import { decryptData, encryptData } from '../utils/crypto';

// ─── Stored row types ─────────────────────────────────────────────────────────

/**
 * An encrypted row stored in IndexedDB.
 * The full FieldRecord payload is AES-GCM encrypted and stored as a single
 * base64 string. Only `id` (the auto-increment PK) is kept in plaintext.
 */
interface EncryptedRow {
  id?: number;
  encrypted: string;
}

/** Union of what may actually live in the IndexedDB table. */
type StoredRecord = FieldRecord | EncryptedRow;

function isEncryptedRow(row: StoredRecord): row is EncryptedRow {
  return 'encrypted' in row && typeof (row as EncryptedRow).encrypted === 'string';
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Serialises a FieldRecord (without id) to an EncryptedRow.
 * The id is intentionally excluded from the ciphertext — it is tracked by
 * IndexedDB and re-attached during decryption via the row's own `.id`.
 */
async function encodeRecord(
  record: Omit<FieldRecord, 'id'>,
  cryptoKey: CryptoKey,
): Promise<EncryptedRow> {
  const encrypted = await encryptData(JSON.stringify(record), cryptoKey);
  return { encrypted };
}

/**
 * Converts a StoredRecord back to a FieldRecord.
 *
 * - Plain row → returned as-is.
 * - Encrypted row + key → decrypted and parsed.
 * - Encrypted row without key → returns null (caller decides how to handle).
 *
 * @throws If decryption fails (wrong key or corrupt data).
 */
async function decodeRow(row: StoredRecord, cryptoKey?: CryptoKey): Promise<FieldRecord | null> {
  if (!isEncryptedRow(row)) return row;
  if (!cryptoKey) return null;
  try {
    const json = await decryptData(row.encrypted, cryptoKey);
    const record = JSON.parse(json) as FieldRecord;
    // Attach the DB-managed primary key (not stored in ciphertext)
    if (row.id !== undefined) record.id = row.id;
    return record;
  } catch {
    throw new Error(`Failed to decrypt record${row.id !== undefined ? ` ${row.id}` : ''}.`);
  }
}

// ─── Database class ───────────────────────────────────────────────────────────

class EpiLogDB extends Dexie {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fieldRecords!: Table<any, number>;

  constructor() {
    super('EpiLogDB');
    this.version(1).stores({
      fieldRecords: '++id, timestamp, location, facilityType',
    });
  }

  /**
   * Adds a new field record.
   * When `cryptoKey` is provided the full payload is AES-GCM encrypted before
   * storage; otherwise it is stored as a plain object (original behaviour).
   */
  async addRecord(record: Omit<FieldRecord, 'id'>, cryptoKey?: CryptoKey): Promise<number> {
    const row: StoredRecord = cryptoKey
      ? await encodeRecord(record, cryptoKey)
      : (record as FieldRecord);
    return this.fieldRecords.add(row);
  }

  /**
   * Returns all records sorted by timestamp descending.
   *
   * Mixed plaintext / encrypted rows are handled automatically:
   * - Plain rows are returned as-is.
   * - Encrypted rows are decrypted when `cryptoKey` is present; silently
   *   excluded when no key is provided (app is locked).
   *
   * Sorting is performed in memory because encrypted rows lack an indexed
   * `timestamp` field.
   */
  async getRecords(cryptoKey?: CryptoKey): Promise<FieldRecord[]> {
    const rows: StoredRecord[] = await this.fieldRecords.toArray();
    const settled = await Promise.all(rows.map((row) => decodeRow(row, cryptoKey)));
    return settled
      .filter((r): r is FieldRecord => r !== null)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  /**
   * Returns a single record by id.
   * Returns `undefined` if the record does not exist or if it is encrypted
   * and no `cryptoKey` was provided.
   * @throws If decryption fails.
   */
  async getRecordById(id: number, cryptoKey?: CryptoKey): Promise<FieldRecord | undefined> {
    const row: StoredRecord | undefined = await this.fieldRecords.get(id);
    if (!row) return undefined;
    const result = await decodeRow(row, cryptoKey);
    return result ?? undefined;
  }

  /**
   * Applies partial changes to an existing record.
   *
   * - **Encrypted record**: fetches the row, decrypts it, merges changes,
   *   re-encrypts, and replaces the full row. Requires `cryptoKey`.
   * - **Plain record**: delegates to Dexie's field-level `update()`.
   *
   * @throws If the target row is encrypted and no `cryptoKey` is provided,
   *   or if decryption fails.
   */
  async updateRecord(
    id: number,
    changes: Partial<Omit<FieldRecord, 'id'>>,
    cryptoKey?: CryptoKey,
  ): Promise<void> {
    const row: StoredRecord | undefined = await this.fieldRecords.get(id);
    if (!row) return;

    if (isEncryptedRow(row)) {
      if (!cryptoKey) throw new Error('CryptoKey required to update an encrypted record.');
      const existing = await decodeRow(row, cryptoKey);
      if (!existing) throw new Error(`Failed to decrypt record ${id}.`);
      const merged: Omit<FieldRecord, 'id'> = { ...existing, ...changes };
      const newRow: EncryptedRow = { ...(await encodeRecord(merged, cryptoKey)), id };
      await this.fieldRecords.put(newRow);
    } else {
      await this.fieldRecords.update(id, changes);
    }
  }

  /** Deletes a record by id (works for both plain and encrypted rows). */
  async deleteRecord(id: number): Promise<void> {
    await this.fieldRecords.delete(id);
  }

  /**
   * Re-encrypts every row from `oldKey` to `newKey` in a single Dexie transaction.
   * Plain rows are encrypted with `newKey`. Call this after a password change to
   * keep all existing data accessible with the new key.
   * @throws If decryption of any row fails (wrong oldKey or corrupt data).
   */
  async reEncryptAll(oldKey: CryptoKey, newKey: CryptoKey): Promise<void> {
    const rows: StoredRecord[] = await this.fieldRecords.toArray();
    await this.transaction('rw', this.fieldRecords, async () => {
      for (const row of rows) {
        const record = await decodeRow(row, oldKey);
        if (!record) continue;
        const { id, ...rest } = record;
        const newRow: EncryptedRow = { ...(await encodeRecord(rest, newKey)), id };
        await this.fieldRecords.put(newRow);
      }
    });
  }
}

export const db = new EpiLogDB();
