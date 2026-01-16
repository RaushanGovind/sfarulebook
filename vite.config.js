import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: './',
    server: {
        port: 5173,
        strictPort: false, // Allow fallback to next available port (e.g., 5174)
        host: true, // Expose to network
        open: true, // Auto-open browser
    }
})
