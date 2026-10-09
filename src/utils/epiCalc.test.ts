import { describe, it, expect } from 'vitest';
import type { FieldRecord } from '../types/index';
import {
    attackRate,
    caseFatalityRate,
    secondaryAttackRate,
    summarizeRecords,
    aggregateSecondaryAttackRate,
} from './epiCalc';

function makeRecord(
    newCases: number,
    deaths: number,
    contacts: [number, number, number],
    population: number,
): FieldRecord {
    return {
        dailyCases: { newCases, deaths },
        contacts: {
            household: contacts[0],
            colleague: contacts[1],
            community: contacts[2],
        },
        totalPopulation: population,
    } as unknown as FieldRecord;
}

describe('attackRate', () => {
    it('computes cases / population x 100', () => {
        expect(attackRate(7, 400)).toBeCloseTo(1.75, 5);
    });
    it('returns null when population is 0', () => {
        expect(attackRate(5, 0)).toBeNull();
    });
    it('clamps negative cases to 0', () => {
        expect(attackRate(-3, 100)).toBe(0);
    });
});

describe('caseFatalityRate', () => {
    it('computes deaths / cases x 100', () => {
        expect(caseFatalityRate(1, 21)).toBeCloseTo(4.7619, 3);
    });
    it('returns 0 when there are no deaths', () => {
        expect(caseFatalityRate(0, 7)).toBe(0);
    });
    it('returns null when cases is 0', () => {
        expect(caseFatalityRate(0, 0)).toBeNull();
    });
});

describe('secondaryAttackRate', () => {
    it('computes secondary cases / contacts x 100', () => {
        // Example data: (5 + 8 + 4) secondary cases over 68 contacts
        expect(secondaryAttackRate(17, 68)).toBe(25);
    });
    it('returns null when contacts is 0', () => {
        expect(secondaryAttackRate(3, 0)).toBeNull();
    });
    it('clamps negative secondary cases to 0', () => {
        expect(secondaryAttackRate(-2, 10)).toBe(0);
    });
});

describe('summarizeRecords', () => {
    const records = [
        makeRecord(7, 0, [4, 20, 0], 400),
        makeRecord(9, 1, [8, 6, 10], 60),
        makeRecord(5, 0, [5, 12, 3], 120),
    ];
    const s = summarizeRecords(records);

    it('sums cases, deaths and contacts', () => {
        expect(s.recordCount).toBe(3);
        expect(s.totalCases).toBe(21);
        expect(s.totalDeaths).toBe(1);
        expect(s.totalContacts).toBe(68);
    });
    it('computes overall AR and CFR', () => {
        expect(s.overallAR).toBeCloseTo((21 / 580) * 100, 5);
        expect(s.overallCFR).toBeCloseTo((1 / 21) * 100, 5);
    });
    it('handles an empty list', () => {
        const e = summarizeRecords([]);
        expect(e.overallAR).toBeNull();
        expect(e.overallCFR).toBeNull();
    });
});

describe('aggregateSecondaryAttackRate', () => {
    const records = [
        makeRecord(7, 0, [4, 20, 0], 400), // 2 index patients
        makeRecord(9, 1, [8, 6, 10], 60), // 1 index patient
        makeRecord(5, 0, [5, 12, 3], 120), // 1 index patient
    ];
    const indexCounts = [2, 1, 1];
    const byPosition = (r: FieldRecord) => indexCounts[records.indexOf(r)];

    it('subtracts index patients per record: (5+8+4)/68 = 25%', () => {
        expect(aggregateSecondaryAttackRate(records, byPosition)).toBe(25);
    });

    it('floors secondary cases at 0 per record (no cancelling across records)', () => {
        const rs = [
            makeRecord(1, 0, [5, 0, 0], 50), // 1 new, 3 index -> 0, not -2
            makeRecord(10, 0, [10, 0, 0], 50), // 10 new, 0 index -> 10
        ];
        const counts = [3, 0];
        // secondary = 0 + 10 = 10, contacts = 15 -> 66.67%
        expect(
            aggregateSecondaryAttackRate(rs, (r) => counts[rs.indexOf(r)]),
        ).toBeCloseTo(66.6667, 3);
    });

    it('returns null when there are no contacts', () => {
        const rs = [makeRecord(5, 0, [0, 0, 0], 100)];
        expect(aggregateSecondaryAttackRate(rs, () => 1)).toBeNull();
    });

    it('returns null when the rate would exceed 100%', () => {
        // 20 new, 1 index -> 19 secondary over 10 contacts = 190%
        const rs = [makeRecord(20, 0, [10, 0, 0], 100)];
        expect(aggregateSecondaryAttackRate(rs, () => 1)).toBeNull();
    });

    it('returns null for an empty list', () => {
        expect(aggregateSecondaryAttackRate([], () => 1)).toBeNull();
    });
});