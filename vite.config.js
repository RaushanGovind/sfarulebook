import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: './',
    server: {
        port: 5176,
        strictPort: true, // Force this port
        host: true, // Expose to network
        open: true, // Auto-open browser
    }
})
