import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    server: {
        host: true,
        port: 8080,
        open: true,
    },
});
