# EpiLog — Third-Party Licenses

EpiLog is released under the MIT License. The following third-party libraries are used:

## Core Dependencies

| Package | License | Notes |
|---|---|---|
| react | MIT | UI framework |
| react-dom | MIT | |
| react-router-dom | MIT | SPA routing |
| vite | MIT | Build tool |
| typescript | Apache-2.0 | |
| tailwindcss | MIT | Styling |
| dexie | Apache-2.0 | IndexedDB wrapper |
| recharts | MIT | Charts |
| lucide-react | ISC | Icons (SVG) |
| date-fns | MIT | Date handling |
| papaparse | MIT | Installed but not used by the current CSV export code (CSV is generated in src/utils/exportData.ts) |
| leaflet | BSD-2-Clause | Map rendering |
| leaflet.markercluster | MIT | Marker clustering on the map |
| react-leaflet | Hippocratic-2.1 | React wrapper for Leaflet; its dependency @react-leaflet/core is also Hippocratic-2.1 (see Notes) |
| @types/leaflet | MIT | TypeScript types |
| vite-plugin-pwa | MIT | PWA support |
| workbox-precaching | MIT | Service Worker |
| workbox-routing | MIT | Service Worker |

## License Summary

| License | Count | DPGA Compatible |
|---|---|---|
| MIT | 420 | ✅ |
| ISC | 29 | ✅ |
| Apache-2.0 | 21 | ✅ |
| BSD-2-Clause | 11 | ✅ (includes Leaflet) |
| BlueOak-1.0.0 | 8 | ✅ |
| BSD-3-Clause | 7 | ✅ |
| MPL-2.0 | 4 | ✅ (lightningcss — not modified) |
| Hippocratic-2.1 | 2 | See Notes (react-leaflet, @react-leaflet/core) |
| CC-BY-4.0 | 1 | ✅ (caniuse-lite — data only) |
| UNLICENSED | 1 | ✅ (@isaacs/cliui — actual license: ISC) |
| (MIT OR CC0-1.0) | 1 | ✅ |
| MIT AND ISC | 1 | ✅ |

## Map Data Attribution

- **OpenStreetMap** — Map tiles © OpenStreetMap contributors (ODbL License)
  https://www.openstreetmap.org/copyright

## Notes

- No GPL or AGPL dependencies
- All dependencies except react-leaflet and @react-leaflet/core (see below) permit free use, modification, and redistribution
- MPL-2.0 packages (lightningcss) are used as-is without modification
- CC-BY-4.0 applies to caniuse-lite browser compatibility data only
- react-leaflet 5.0.0 and its dependency @react-leaflet/core 3.0.0 are licensed under the Hippocratic License 2.1, an ethical-source license with use restrictions that is not OSI-approved. They are thin React bindings for Leaflet (BSD-2-Clause) and can be replaced by calling Leaflet directly. See the DPGA application, item 4.

*Generated and maintained for DPGA compliance.*
