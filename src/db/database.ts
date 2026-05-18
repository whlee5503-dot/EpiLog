import Dexie, { type Table } from 'dexie';
import type { FieldRecord } from '../types/index';

class EpiLogDB extends Dexie {
  fieldRecords!: Table<FieldRecord, number>;

  constructor() {
    super('EpiLogDB');
    this.version(1).stores({
      fieldRecords: '++id, timestamp, location, facilityType',
    });
  }

  async addRecord(record: Omit<FieldRecord, 'id'>): Promise<number> {
    return this.fieldRecords.add(record as FieldRecord);
  }

  async getRecords(): Promise<FieldRecord[]> {
    return this.fieldRecords.orderBy('timestamp').reverse().toArray();
  }

  async getRecordById(id: number): Promise<FieldRecord | undefined> {
    return this.fieldRecords.get(id);
  }

  async updateRecord(id: number, changes: Partial<Omit<FieldRecord, 'id'>>): Promise<void> {
    await this.fieldRecords.update(id, changes);
  }

  async deleteRecord(id: number): Promise<void> {
    await this.fieldRecords.delete(id);
  }
}

export const db = new EpiLogDB();
