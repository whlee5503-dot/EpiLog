import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapPin } from 'lucide-react';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerIcon2xPng from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';
import type { FieldRecord, GpsCoords } from '../types/index';

// Fix Leaflet default marker icon URLs broken by Vite bundler
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2xPng,
  shadowUrl: markerShadowPng,
});

// Custom MapPin icon using lucide-react rendered to static HTML
const pinHtml = renderToStaticMarkup(
  <MapPin size={28} color="#0d9488" fill="#ccfbf1" strokeWidth={1.5} />
);
const customIcon = L.divIcon({
  html: pinHtml,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

type RecordWithGps = FieldRecord & { gps: GpsCoords };

interface GpsMapProps {
  records: FieldRecord[];
}

export function GpsMap({ records }: GpsMapProps) {
  const gpsRecords = useMemo<RecordWithGps[]>(
    () => records.filter((r): r is RecordWithGps => r.gps != null),
    [records]
  );

  const center = useMemo<[number, number]>(() => {
    if (gpsRecords.length === 0) return [9.0, 20.0];
    const avgLat = gpsRecords.reduce((s, r) => s + r.gps.lat, 0) / gpsRecords.length;
    const avgLng = gpsRecords.reduce((s, r) => s + r.gps.lng, 0) / gpsRecords.length;
    return [avgLat, avgLng];
  }, [gpsRecords]);

  if (gpsRecords.length === 0) {
    return (
      <div className="flex items-center justify-center h-72 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 text-sm">
        지도에 표시할 GPS 데이터가 없습니다
      </div>
    );
  }

  return (
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
      {gpsRecords.map(r => {
        const ar =
          r.totalPopulation > 0
            ? ((r.dailyCases.newCases / r.totalPopulation) * 100).toFixed(1)
            : 'N/A';
        return (
          <Marker
            key={r.id ?? `${r.timestamp}-${r.location}`}
            position={[r.gps.lat, r.gps.lng]}
            icon={customIcon}
          >
            <Popup>
              <div className="text-sm min-w-[140px]">
                <p className="font-semibold text-gray-900 mb-1">{r.location}</p>
                <p className="text-gray-500 text-xs mb-2">{r.timestamp.slice(0, 10)}</p>
                <p className="text-gray-700">
                  신규 환자: <strong>{r.dailyCases.newCases}</strong>명
                </p>
                <p className="text-gray-700">
                  발병률: <strong>{ar === 'N/A' ? ar : `${ar}%`}</strong>
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
