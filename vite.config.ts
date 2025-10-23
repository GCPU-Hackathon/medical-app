import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
            detectTls: false,
            buildDirectory: 'build',
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        cors: {
            origin: [
                'http://localhost:8085',
                'http://localhost:5173',
                'http://127.0.0.1:8085',
                'http://127.0.0.1:5173',
            ],
            credentials: true,
        },
        hmr: {
            host: 'localhost',
            port: 5173,
        },
        watch: {
            usePolling: true,
            interval: 1000,
        },
    },
});
