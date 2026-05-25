import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      // 사전 캐시에 포함할 파일 패턴
      includeAssets: ['favicon.svg', 'icons/**'],

      // 인라인 manifest 설정
      manifest: {
        name: 'EpiLog',
        short_name: 'EpiLog',
        description: '오프라인 현장 역학조사 디지털 기록장',
        theme_color: '#0F6E56',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        // 핵심 파일만 precache — JS 청크(특히 Dashboard 740KB)는 제외하고
        // lazy chunk들은 runtimeCaching으로 처리
        globPatterns: [
          'index.html',
          'assets/*.css',
        ],

        runtimeCaching: [
          // ── CacheFirst: JS 청크 — lazy load 시 캐시 ──────────────────────
          {
            urlPattern: /\/assets\/.*\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'js-chunks',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30일
              },
            },
          },

          // ── CacheFirst: CSS ───────────────────────────────────────────────
          {
            urlPattern: /\/assets\/.*\.css$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'css-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },

          // ── CacheFirst: OpenStreetMap 타일 — 지도용 ──────────────────────
          {
            urlPattern: /https:\/\/.*\.tile\.openstreetmap\.org\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7일
              },
            },
          },

          // ── CacheFirst: 폰트 ─────────────────────────────────────────────
          {
            urlPattern: /\/assets\/.*\.(woff|woff2)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1년
              },
            },
          },

          // ── NetworkFirst: 외부 API 호출 ──────────────────────────────────
          // 앱이 외부 REST API를 사용하는 경우를 대비한 캐시 전략.
          // (현재는 IndexedDB/Dexie 사용이나 향후 확장 대비)
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
            },
          },
        ],
      },
    }),
  ],
});
