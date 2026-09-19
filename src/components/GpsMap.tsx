import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapPin } from 'lucide-react';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerIcon2xPng from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';
import type { FieldRecord, GpsCoords } from '../types/index';
import { useLanguage } from '../contexts/LanguageContext';
import { TRANSMISSION_COLORS, TRANSMISSION_ORDER, TRANSMISSION_LABELS } from '../utils/transmission';

// Fix Leaflet default marker icon URLs broken by Vite bundler
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2xPng,
  shadowUrl: markerShadowPng,
});

type RecordWithGps = FieldRecord & { gps: GpsCoords };

// ── Marker size scaled by new-case count (sqrt scale, capped) ──────
const MIN_MARKER_SIZE = 22;
const MAX_MARKER_SIZE = 46;

function getMarkerSize(newCases: number, maxNewCases: number): number {
  if (maxNewCases <= 0) return MIN_MARKER_SIZE;
  const ratio = Math.sqrt(Math.max(0, newCases) / maxNewCases);
  return Math.round(MIN_MARKER_SIZE + ratio * (MAX_MARKER_SIZE - MIN_MARKER_SIZE));
}

function buildPopupHtml(r: RecordWithGps, lang: 'ko' | 'en'): string {
  const ar =
    r.totalPopulation > 0
      ? ((r.dailyCases.newCases / r.totalPopulation) * 100).toFixed(1)
      : 'N/A';
  return renderToStaticMarkup(
    <div className="text-sm min-w-[140px]">
      <p className="font-semibold text-gray-900 mb-1">{r.location}</p>
      <p className="text-gray-500 text-xs mb-2">{r.timestamp.slice(0, 10)}</p>
      <p className="text-gray-700">
        {lang === 'ko' ? '신규 환자' : 'New cases'}:{' '}
        <strong>{r.dailyCases.newCases}</strong>
        {lang === 'ko' ? '명' : ''}
      </p>
      <p className="text-gray-700">
        {lang === 'ko' ? '발병률' : 'Attack rate'}:{' '}
        <strong>{ar === 'N/A' ? ar : `${ar}%`}</strong>
      </p>
      <p className="text-gray-700">
        {lang === 'ko' ? '전파경로' : 'Transmission'}:{' '}
        <strong>{TRANSMISSION_LABELS[lang][r.transmission]}</strong>
      </p>
    </div>,
  );
}

/**
 * Imperatively manages a Leaflet.markercluster group on the parent map.
 * Kept as a non-rendering child so it can use react-leaflet's useMap()
 * while still driving plain Leaflet (clustering needs direct Leaflet
 * markers, not react-leaflet's declarative <Marker> children).
 */
function ClusteredMarkers({ records, lang }: { records: RecordWithGps[]; lang: 'ko' | 'en' }) {
  const map = useMap();

  useEffect(() => {
    const maxNewCases = records.reduce((m, r) => Math.max(m, r.dailyCases.newCases), 0);

    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      chunkedLoading: true,
    });

    for (const r of records) {
      const color = TRANSMISSION_COLORS[r.transmission];
      const size = getMarkerSize(r.dailyCases.newCases, maxNewCases);
      const pinHtml = renderToStaticMarkup(
        <MapPin size={size} color={color} fill={`${color}33`} strokeWidth={1.5} />,
      );
      const icon = L.divIcon({
        html: pinHtml,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size + 2],
      });

      const marker = L.marker([r.gps.lat, r.gps.lng], { icon });
      marker.bindPopup(buildPopupHtml(r, lang));
      clusterGroup.addLayer(marker);
    }

    map.addLayer(clusterGroup);
    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [records, map, lang]);

  return null;
}

interface GpsMapProps {
  records: FieldRecord[];
}

export function GpsMap({ records }: GpsMapProps) {
  const { lang } = useLanguage();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const gpsRecords = useMemo<RecordWithGps[]>(() => {
    return records.filter((r): r is RecordWithGps => {
      if (r.gps == null) return false;
      const day = r.timestamp.slice(0, 10);
      if (dateFrom && day < dateFrom) return false;
      if (dateTo && day > dateTo) return false;
      return true;
    });
  }, [records, dateFrom, dateTo]);

  const center = useMemo<[number, number]>(() => {
    if (gpsRecords.length === 0) return [9.0, 20.0];
    const avgLat = gpsRecords.reduce((s, r) => s + r.gps.lat, 0) / gpsRecords.length;
    const avgLng = gpsRecords.reduce((s, r) => s + r.gps.lng, 0) / gpsRecords.length;
    return [avgLat, avgLng];
  }, [gpsRecords]);

  const hasDateFilter = dateFrom !== '' || dateTo !== '';

  return (
    <div>
      {/* Date range filter */}
      <div className="flex flex-wrap items-end gap-2 mb-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            {lang === 'ko' ? '시작일' : 'From'}
          </span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1f2937] text-gray-900 dark:text-white px-2 py-1 text-xs"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            {lang === 'ko' ? '종료일' : 'To'}
          </span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1f2937] text-gray-900 dark:text-white px-2 py-1 text-xs"
          />
        </label>
        {hasDateFilter && (
          <button
            type="button"
            onClick={() => {
              setDateFrom('');
              setDateTo('');
            }}
            className="text-xs text-teal-600 dark:text-teal-400 underline underline-offset-2 pb-1.5"
          >
            {lang === 'ko' ? '필터 초기화' : 'Clear filter'}
          </button>
        )}
      </div>

      {/* Transmission-route color legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3 text-[11px] text-gray-500 dark:text-gray-400">
        {TRANSMISSION_ORDER.map((route) => (
          <span key={route} className="flex items-center gap-1">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: TRANSMISSION_COLORS[route] }}
            />
            {TRANSMISSION_LABELS[lang][route]}
          </span>
        ))}
      </div>

      {gpsRecords.length === 0 ? (
        <div className="flex items-center justify-center h-72 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 text-sm">
          {lang === 'ko' ? '지도에 표시할 GPS 데이터가 없습니다' : 'No GPS data to display on the map'}
        </div>
      ) : (
        <MapContainer
          center={center}
          zoom={gpsRecords.length === 1 ? 13 : 5}
          className="h-72 w-full rounded-xl border border-gray-200 dark:border-gray-600"
          scrollWheelZoom={false}
          style={{ zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClusteredMarkers records={gpsRecords} lang={lang} />
        </MapContainer>
      )}
    </div>
  );
}