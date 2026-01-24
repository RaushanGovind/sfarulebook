import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: './',
    server: {
        port: 5176,
        strictPort: false, // Allow fallback to next port if busy
        host: true, // Expose to network
        open: true, // Auto-open browser
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:5001',
                changeOrigin: true,
                secure: false
            }
        }
    }
})
