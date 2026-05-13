import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // Base para que los assets usen la subruta correcta en producción
  base: '/concurso_cbn/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
