import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: './',
    server: {
        port: 5173,
        strictPort: true, // Fail if 5173 is busy, don't switch to 5174
    }
})
