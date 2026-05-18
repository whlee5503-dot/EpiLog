import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
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
        // 빌드 산출물 전체 사전 캐시
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],

        runtimeCaching: [
          // ── NetworkFirst: 페이지 네비게이션 ──────────────────────────────
          // 온라인 시 항상 최신 HTML을 가져오고,
          // 오프라인이거나 타임아웃(3 s) 초과 시 캐시로 폴백.
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 3,
              cacheableResponse: { statuses: [0, 200] },
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

          // ── CacheFirst: 정적 에셋 ────────────────────────────────────────
          // JS, CSS, 이미지, 폰트는 빌드 해시로 버전 관리되므로
          // 캐시를 우선 제공해 로딩 속도를 극대화.
          {
            urlPattern: ({ request }) =>
              ['style', 'script', 'image', 'font'].includes(request.destination),
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
