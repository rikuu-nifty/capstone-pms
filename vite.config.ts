import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
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
    server: {
        host: '0.0.0.0',     // listen on all interfaces
        port: 5173,          // default Vite port
        hmr: {
            host: '192.168.1.3', // 👈 your PC’s LAN IP
        },
    },
});
