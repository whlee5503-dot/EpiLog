import type { TransmissionRoute } from '../types/index';

/**
 * Color used to represent each transmission route wherever it's shown
 * visually — the GPS outbreak map (markers + legend) and the record list
 * (a small dot on each card). Kept in one place so the two stay in sync.
 */
export const TRANSMISSION_COLORS: Record<TransmissionRoute, string> = {
    airborne: '#e74c3c',
    droplet: '#f39c12',
    contact: '#3498db',
    foodborne: '#9b59b6',
    waterborne: '#16a085',
    vector: '#8b5a2b',
    unknown: '#7f8c8d',
};

export const TRANSMISSION_ORDER: TransmissionRoute[] = [
    'airborne', 'droplet', 'contact', 'foodborne', 'waterborne', 'vector', 'unknown',
];

export const TRANSMISSION_LABELS: Record<'ko' | 'en', Record<TransmissionRoute, string>> = {
    ko: {
        airborne: '공기 전파',
        droplet: '비말 전파',
        contact: '접촉 전파',
        foodborne: '식품 매개',
        waterborne: '수인성',
        vector: '매개체',
        unknown: '미상',
    },
    en: {
        airborne: 'Airborne',
        droplet: 'Droplet',
        contact: 'Contact',
        foodborne: 'Foodborne',
        waterborne: 'Waterborne',
        vector: 'Vector-borne',
        unknown: 'Unknown',
    },
};