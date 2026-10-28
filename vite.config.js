import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Permite importar con "@/components/..." en lugar de rutas relativas largas.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
