import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: [
                'favicon2.ico',
                'robots.txt',
                'apple-touch-icon2.png',
                'pwa-192x192.png',
                'pwa-512x512.png',
            ],
            manifest: {
                name: 'Tap & Track',
                short_name: 'Tap & Track',
                description: 'Offline NFC Property Management System',
                theme_color: '#3b56fc',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: 'standalone',
                icons: [
                    {
                        src: '/pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: '/apple-touch-icon2.png',
                        sizes: '180x180',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ],
            },
            workbox: {
                runtimeCaching: [
                    {
                        // Cache app pages
                        urlPattern: /^https:\/\/tapandtrack\.online\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'tapandtrack-pages',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 7,
                            },
                        },
                    },
                    {
                        // Cache static JS/CSS/images
                        urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|gif|woff2?)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'tapandtrack-static',
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 60 * 60 * 24 * 30,
                            },
                        },
                    },
                    {
                        // Cache asset details pages for NFC
                        urlPattern: /\/inventory-list\/\d+\/view-asset-details/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'asset-details-cache',
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 60 * 60 * 24 * 30,
                            },
                        },
                    },
                ],
            },
        }),
    ],
    
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },

    // REMOVE THIS FOR DEFAULT
    // ✅ add this so your phone can load assets
    // server: {
    //     host: '0.0.0.0',     // listen on all interfaces
    //     port: 5173,          // default Vite port
    //     hmr: {
    //         host: '192.168.100.60', // 👈 your PC’s LAN IP
    //     },
    // },
});
