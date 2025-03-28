import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    server: { https: true, host: true, port: 3003 },
    plugins: [
        tsconfigPaths(),
    ],
});
